<?php

namespace App\Http\Controllers\Admin;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends AdminController
{
    public function index(): Response
    {
        $currentTeam = $this->currentTeam();

        $sales = Sale::where('team_id', $currentTeam->id)
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->get();

        $products = Product::where('team_id', $currentTeam->id)
            ->where('active', true)
            ->where('stock', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'sale_price', 'stock']);

        return Inertia::render('admin/sales/index', [
            'sales' => $sales,
            'products' => $products,
        ]);
    }

    public function show(Sale $sale): Response
    {
        abort_unless($sale->team_id === $this->currentTeam()->id, 403);

        $sale->load(['user', 'items.product']);

        return Inertia::render('admin/sales/show', [
            'sale' => $sale,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $currentTeam = $this->currentTeam();

        $validated = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:200'],
            'customer_email' => ['nullable', 'email', 'max:200'],
            'payment_method' => ['required', 'in:cash,card,transfer'],
            'discount' => ['numeric', 'min:0'],
            'tax' => ['numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated, $currentTeam, $request) {
            // Verify stock availability
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                abort_unless(
                    $product->team_id === $currentTeam->id,
                    403
                );
                abort_if(
                    $product->stock < $item['quantity'],
                    422,
                    "Stock insuficiente para el producto: {$product->name}"
                );
            }

            $subtotal = collect($validated['items'])->sum(
                fn ($item) => ($item['quantity'] * $item['unit_price']) - ($item['discount'] ?? 0)
            );
            $discount = $validated['discount'] ?? 0;
            $tax = $validated['tax'] ?? 0;
            $total = $subtotal - $discount + $tax;

            $sale = Sale::create([
                'team_id' => $currentTeam->id,
                'user_id' => $request->user()->id,
                'reference' => 'SL-' . strtoupper(Str::random(8)),
                'status' => 'completed',
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_email' => $validated['customer_email'] ?? null,
                'payment_method' => $validated['payment_method'],
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $itemSubtotal = ($item['quantity'] * $item['unit_price']) - ($item['discount'] ?? 0);
                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $itemSubtotal,
                ]);

                // Decrement stock
                Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
            }
        });

        return back()->with('success', 'Venta registrada correctamente.');
    }

    public function cancel(Sale $sale): RedirectResponse
    {
        abort_unless($sale->team_id === $this->currentTeam()->id, 403);
        abort_if($sale->status !== 'completed', 422, 'Solo se pueden cancelar ventas completadas.');

        DB::transaction(function () use ($sale) {
            $sale->load('items');
            foreach ($sale->items as $item) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }
            $sale->update(['status' => 'cancelled']);
        });

        return back()->with('success', 'Venta cancelada. Stock restaurado.');
    }
}
