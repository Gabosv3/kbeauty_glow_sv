<?php

namespace App\Http\Controllers\Admin;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends AdminController
{
    public function index(): Response
    {
        $currentTeam = $this->currentTeam();

        $purchases = Purchase::where('team_id', $currentTeam->id)
            ->with(['supplier:id,name', 'user:id,name'])
            ->orderByDesc('created_at')
            ->get();

        $suppliers = Supplier::where('team_id', $currentTeam->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::where('team_id', $currentTeam->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'cost_price', 'stock']);

        return Inertia::render('admin/purchases/index', [
            'purchases' => $purchases,
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function show(Purchase $purchase): Response
    {
        abort_unless($purchase->team_id === $this->currentTeam()->id, 403);

        $purchase->load(['supplier', 'user', 'items.product']);

        return Inertia::render('admin/purchases/show', [
            'purchase' => $purchase,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $currentTeam = $this->currentTeam();
        $validated = $request->validate([
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'notes' => ['nullable', 'string'],
            'discount' => ['numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
            'items.*.shipping_code' => ['nullable', 'string', 'max:100'],
            'items.*.item_tax' => ['numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated, $currentTeam, $request) {
            $subtotal = collect($validated['items'])->sum(
                fn ($item) => $item['quantity'] * $item['unit_cost']
            );
            $tax = collect($validated['items'])->sum(
                fn ($item) => $item['item_tax'] ?? 0
            );
            $discount = $validated['discount'] ?? 0;
            $total = $subtotal + $tax - $discount;

            $purchase = Purchase::create([
                'team_id' => $currentTeam->id,
                'user_id' => $request->user()->id,
                'supplier_id' => $validated['supplier_id'] ?? null,
                'reference' => 'PO-' . strtoupper(Str::random(8)),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $purchase->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'subtotal' => $item['quantity'] * $item['unit_cost'],
                    'shipping_code' => $item['shipping_code'] ?? null,
                    'tax' => $item['item_tax'] ?? 0,
                ]);
            }
        });

        return back()->with('success', 'Compra registrada correctamente.');
    }

    public function receive(Purchase $purchase): RedirectResponse
    {
        abort_unless($purchase->team_id === $this->currentTeam()->id, 403);
        abort_if($purchase->status !== 'pending', 422, 'Esta compra ya fue procesada.');

        $purchase->load('items');
        $purchase->receive();

        return back()->with('success', 'Compra recibida. Stock actualizado.');
    }

    public function cancel(Purchase $purchase): RedirectResponse
    {
        abort_unless($purchase->team_id === $this->currentTeam()->id, 403);
        abort_if($purchase->status !== 'pending', 422, 'Solo se pueden cancelar compras pendientes.');

        $purchase->update(['status' => 'cancelled']);

        return back()->with('success', 'Compra cancelada.');
    }
}
