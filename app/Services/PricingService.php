<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Discount;
use App\Models\Product;
use Illuminate\Support\Collection;

/**
 * Fuente única de precios de la tienda: aplica descuentos por regla, cupón y envío.
 * El navegador nunca decide un precio; siempre se recalcula aquí.
 */
class PricingService
{
    public function __construct(private readonly StoreSettings $settings) {}

    /** @var Collection<int, Discount>|null */
    private ?Collection $discounts = null;

    /** @return Collection<int, Discount> */
    private function discounts(): Collection
    {
        return $this->discounts ??= Discount::query()->get()->filter(fn (Discount $d) => $d->isCurrent())->values();
    }

    /** @return array{price: float, original_price: float|null} */
    public function priceFor(Product $product): array
    {
        $base = (float) $product->sale_price;

        $saving = $this->discounts()
            ->filter(fn (Discount $d) => $d->appliesTo($product))
            ->map(fn (Discount $d) => $d->savingOn($base))
            ->max() ?? 0.0;

        if ($saving <= 0) {
            return ['price' => $base, 'original_price' => null];
        }

        return ['price' => round($base - $saving, 2), 'original_price' => $base];
    }

    public function imageFor(Product $product): ?string
    {
        return $product->image ?: $product->images->first()?->url;
    }

    public function shippingFor(float $subtotal): float
    {
        if ($subtotal <= 0 || $subtotal >= (float) $this->settings->get('free_shipping_from')) {
            return 0.0;
        }

        return (float) $this->settings->get('shipping_cost');
    }

    /**
     * @param  array<int, array{id: int, quantity: int}>  $items
     * @return array<string, mixed>
     */
    public function quote(array $items, ?string $couponCode = null, bool $lockProducts = false): array
    {
        $quantities = [];

        foreach ($items as $item) {
            $id = (int) $item['id'];
            $quantities[$id] = ($quantities[$id] ?? 0) + max(1, (int) $item['quantity']);
        }

        $query = Product::query()
            ->where('active', true)
            ->whereIn('id', array_keys($quantities))
            ->with('images');

        if ($lockProducts) {
            $query->lockForUpdate();
        }

        $products = $query->get()->keyBy('id');
        $lines = [];
        $subtotal = 0.0;
        $valid = $quantities !== [];

        foreach ($quantities as $id => $quantity) {
            $product = $products->get($id);

            if (! $product) {
                $valid = false;
                $lines[] = [
                    'id' => $id, 'name' => 'Producto no disponible', 'slug' => null, 'image' => null,
                    'unit_price' => 0.0, 'original_price' => null, 'quantity' => 0, 'requested' => $quantity,
                    'line_total' => 0.0, 'issue' => 'Ya no está disponible.', 'team_id' => null,
                ];

                continue;
            }

            $issue = null;
            $effectiveQty = $quantity;

            if ($product->stock < 1) {
                $issue = 'Agotado.';
                $effectiveQty = 0;
            } elseif ($product->stock < $quantity) {
                $issue = "Solo quedan {$product->stock}.";
                $effectiveQty = $product->stock;
            }

            if ($issue) {
                $valid = false;
            }

            $price = $this->priceFor($product);
            $lineTotal = round($price['price'] * $effectiveQty, 2);
            $subtotal += $lineTotal;

            $lines[] = [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'image' => $this->imageFor($product),
                'unit_price' => $price['price'],
                'original_price' => $price['original_price'],
                'quantity' => $effectiveQty,
                'requested' => $quantity,
                'line_total' => $lineTotal,
                'issue' => $issue,
                'team_id' => $product->team_id,
            ];
        }

        $subtotal = round($subtotal, 2);
        $coupon = null;
        $couponError = null;
        $discount = 0.0;

        if ($couponCode !== null && trim($couponCode) !== '') {
            $model = Coupon::query()->where('code', strtoupper(trim($couponCode)))->first();
            $problem = $model ? $model->problemFor($subtotal) : 'Ese cupón no existe.';

            if ($problem) {
                $couponError = $problem;
            } else {
                $discount = $model->discountFor($subtotal);
                $coupon = ['id' => $model->id, 'code' => $model->code, 'discount' => $discount];
            }
        }

        $afterCoupon = round($subtotal - $discount, 2);
        $shipping = $this->shippingFor($afterCoupon);

        return [
            'lines' => $lines,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'total' => round($afterCoupon + $shipping, 2),
            'coupon' => $coupon,
            'coupon_error' => $couponError,
            'valid' => $valid && $subtotal > 0,
        ];
    }
}
