<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Sale;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(private readonly PricingService $pricing) {}

    /** Recalcula el carrito con precios reales, descuentos, cupón y envío (lo usa el carrito y el checkout). */
    public function quote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'coupon' => ['nullable', 'string', 'max:50'],
        ]);

        return response()->json($this->pricing->quote($data['items'], $data['coupon'] ?? null));
    }

    public function show(): Response
    {
        return Inertia::render('store/checkout', [
            'departments' => config('store.departments'),
            'freeShippingFrom' => (float) config('store.free_shipping_from'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'min:8', 'max:20'],
            'email' => ['nullable', 'email', 'max:160'],
            'department' => ['required', 'string', 'in:'.implode(',', config('store.departments'))],
            'municipality' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:400'],
            'notes' => ['nullable', 'string', 'max:500'],
            'coupon' => ['nullable', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $sale = DB::transaction(function () use ($data) {
            // Se bloquean los productos para que dos pedidos simultáneos no vendan la misma unidad.
            $quote = $this->pricing->quote($data['items'], $data['coupon'] ?? null, lockProducts: true);

            if (! $quote['valid']) {
                $problems = collect($quote['lines'])->filter(fn ($l) => $l['issue'])
                    ->map(fn ($l) => "{$l['name']}: {$l['issue']}")->implode(' ');

                throw ValidationException::withMessages(['items' => $problems ?: 'Tu carrito no es válido.']);
            }

            if ($quote['coupon_error']) {
                throw ValidationException::withMessages(['coupon' => $quote['coupon_error']]);
            }

            if ($quote['coupon']) {
                $coupon = Coupon::lockForUpdate()->find($quote['coupon']['id']);

                if ($coupon->problemFor($quote['subtotal'])) {
                    throw ValidationException::withMessages(['coupon' => $coupon->problemFor($quote['subtotal'])]);
                }

                $coupon->increment('used_count');
            }

            $sale = Sale::create([
                'team_id' => $quote['lines'][0]['team_id'],
                'user_id' => null,
                'reference' => 'WEB-'.strtoupper(Str::random(8)),
                'status' => 'pending',
                'channel' => 'web',
                'customer_name' => $data['name'],
                'customer_email' => $data['email'] ?? null,
                'customer_phone' => $data['phone'],
                'delivery_department' => $data['department'],
                'delivery_municipality' => $data['municipality'],
                'delivery_address' => $data['address'],
                'subtotal' => $quote['subtotal'],
                'discount' => $quote['discount'],
                'tax' => 0,
                'shipping_cost' => $quote['shipping'],
                'coupon_code' => $quote['coupon']['code'] ?? null,
                'total' => $quote['total'],
                'payment_method' => 'transfer',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($quote['lines'] as $line) {
                $sale->items()->create([
                    'product_id' => $line['id'],
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                    'discount' => 0,
                    'subtotal' => $line['line_total'],
                ]);

                Product::where('id', $line['id'])->decrement('stock', $line['quantity']);
            }

            return $sale;
        });

        return redirect()->route('store.order', $sale->reference);
    }

    public function order(string $reference): Response
    {
        $sale = Sale::where('reference', $reference)->where('channel', 'web')->with('items.product:id,name')->firstOrFail();

        return Inertia::render('store/order', [
            'order' => [
                'reference' => $sale->reference,
                'status' => $sale->status,
                'customer_name' => $sale->customer_name,
                'department' => $sale->delivery_department,
                'municipality' => $sale->delivery_municipality,
                'address' => $sale->delivery_address,
                'subtotal' => (float) $sale->subtotal,
                'discount' => (float) $sale->discount,
                'shipping' => (float) $sale->shipping_cost,
                'total' => (float) $sale->total,
                'coupon' => $sale->coupon_code,
                'items' => $sale->items->map(fn ($i) => [
                    'name' => $i->product?->name ?? 'Producto',
                    'quantity' => $i->quantity,
                    'unit_price' => (float) $i->unit_price,
                    'subtotal' => (float) $i->subtotal,
                ])->all(),
            ],
            'whatsapp' => config('store.whatsapp'),
        ]);
    }
}
