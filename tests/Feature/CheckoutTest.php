<?php

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Discount;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Team;
use App\Services\PricingService;

function makeProduct(Team $team, array $overrides = []): Product
{
    static $n = 0;
    $n++;

    return Product::create([
        'team_id' => $team->id,
        'category_id' => $overrides['category_id'] ?? null,
        'name' => "Producto {$n}",
        'slug' => "producto-{$n}",
        'sku' => sprintf('SKU%06d', $n),
        'cost_price' => 5,
        'sale_price' => 20,
        'stock' => 10,
        'min_stock' => 1,
        'active' => true,
        ...$overrides,
    ]);
}

function makeCoupon(Team $team, array $overrides = []): Coupon
{
    return Coupon::create([
        'team_id' => $team->id,
        'code' => 'GLOW10',
        'type' => 'percent',
        'value' => 10,
        ...$overrides,
    ]);
}

function checkoutPayload(Product $product, int $qty = 1, array $overrides = []): array
{
    return [
        'name' => 'María López',
        'phone' => '70001234',
        'department' => 'San Salvador',
        'municipality' => 'Soyapango',
        'address' => 'Colonia Escalón, casa 4',
        'items' => [['id' => $product->id, 'quantity' => $qty]],
        ...$overrides,
    ];
}

beforeEach(function () {
    $this->team = Team::factory()->create();
});

it('applies the best matching rule discount and keeps the original price', function () {
    $category = Category::create(['team_id' => $this->team->id, 'name' => 'Serums', 'slug' => 'serums']);
    $product = makeProduct($this->team, ['category_id' => $category->id]);

    Discount::create(['team_id' => $this->team->id, 'name' => 'Tienda', 'scope' => 'store', 'type' => 'percent', 'value' => 10]);
    Discount::create(['team_id' => $this->team->id, 'name' => 'Serums', 'scope' => 'category', 'category_id' => $category->id, 'type' => 'percent', 'value' => 25]);

    expect(app(PricingService::class)->priceFor($product))->toBe(['price' => 15.0, 'original_price' => 20.0]);
});

it('ignores expired and inactive discounts', function () {
    $product = makeProduct($this->team);

    Discount::create(['team_id' => $this->team->id, 'name' => 'Vencido', 'scope' => 'store', 'type' => 'percent', 'value' => 50, 'ends_at' => now()->subDay()]);
    Discount::create(['team_id' => $this->team->id, 'name' => 'Apagado', 'scope' => 'store', 'type' => 'percent', 'value' => 50, 'active' => false]);

    expect(app(PricingService::class)->priceFor($product))->toBe(['price' => 20.0, 'original_price' => null]);
});

it('quotes totals with coupon and shipping, ignoring any client price', function () {
    $product = makeProduct($this->team);
    makeCoupon($this->team);

    $quote = $this->postJson('/store/cart/quote', [
        'items' => [['id' => $product->id, 'quantity' => 2, 'price' => 0.01]],
        'coupon' => 'glow10',
    ])->assertOk()->json();

    expect($quote['subtotal'])->toBe(40)
        ->and($quote['discount'])->toBe(4)
        ->and($quote['shipping'])->toBe(3.5)
        ->and($quote['total'])->toBe(39.5)
        ->and($quote['valid'])->toBeTrue();
});

it('gives free shipping from the configured amount', function () {
    $product = makeProduct($this->team, ['sale_price' => 30]);

    $quote = $this->postJson('/store/cart/quote', ['items' => [['id' => $product->id, 'quantity' => 2]]])->json();

    expect($quote['shipping'])->toBe(0)->and($quote['total'])->toBe(60);
});

it('rejects invalid coupons with a reason', function (array $state, string $message) {
    $product = makeProduct($this->team);
    makeCoupon($this->team, $state);

    $quote = $this->postJson('/store/cart/quote', ['items' => [['id' => $product->id, 'quantity' => 1]], 'coupon' => 'GLOW10'])->json();

    expect($quote['coupon'])->toBeNull()->and($quote['coupon_error'])->toContain($message);
})->with([
    'expired' => [['ends_at' => now()->subDay()], 'venció'],
    'inactive' => [['active' => false], 'no está activo'],
    'used up' => [['max_uses' => 1, 'used_count' => 1], 'límite'],
    'minimum' => [['min_order' => 100], 'desde $100.00'],
]);

it('places a web order, decrements stock and consumes the coupon', function () {
    $product = makeProduct($this->team);
    makeCoupon($this->team, ['max_uses' => 5]);

    $response = $this->post('/store/checkout', checkoutPayload($product, 2, ['coupon' => 'GLOW10']));

    $sale = Sale::firstOrFail();
    $response->assertRedirect(route('store.order', $sale->reference));

    expect($sale->channel)->toBe('web')
        ->and($sale->status)->toBe('pending')
        ->and($sale->user_id)->toBeNull()
        ->and((float) $sale->subtotal)->toBe(40.0)
        ->and((float) $sale->discount)->toBe(4.0)
        ->and((float) $sale->shipping_cost)->toBe(3.5)
        ->and((float) $sale->total)->toBe(39.5)
        ->and($sale->items()->count())->toBe(1)
        ->and($product->fresh()->stock)->toBe(8)
        ->and(Coupon::first()->used_count)->toBe(1);

    $this->get(route('store.order', $sale->reference))->assertOk();
});

it('refuses an order that exceeds the available stock', function () {
    $product = makeProduct($this->team, ['stock' => 1]);

    $this->post('/store/checkout', checkoutPayload($product, 3))->assertSessionHasErrors('items');

    expect(Sale::count())->toBe(0)->and($product->fresh()->stock)->toBe(1);
});

it('validates the delivery data', function () {
    $product = makeProduct($this->team);

    $this->post('/store/checkout', checkoutPayload($product, 1, ['department' => 'Narnia', 'phone' => '']))
        ->assertSessionHasErrors(['department', 'phone']);
});
