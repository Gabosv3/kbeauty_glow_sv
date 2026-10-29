<?php

namespace App\Http\Controllers\Admin;

use App\Models\Product;
use App\Models\Quote;
use App\Services\StoreSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends AdminController
{
    public function index(): Response
    {
        $teamId = $this->currentTeam()->id;

        return Inertia::render('admin/quotes/index', [
            'quotes' => Quote::where('team_id', $teamId)
                ->withCount('items')
                ->latest()
                ->get(),
            'products' => Product::where('team_id', $teamId)
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'sale_price', 'stock']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $team = $this->currentTeam();

        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
            'customer_email' => ['nullable', 'email', 'max:160'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:today'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1', 'max:60'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        $ids = collect($data['items'])->pluck('product_id')->unique();

        $products = Product::where('team_id', $team->id)->whereIn('id', $ids)->get()->keyBy('id');

        abort_if($products->count() !== $ids->count(), 422, 'Producto inválido.');

        $quote = DB::transaction(function () use ($data, $team, $products, $request) {
            $lines = collect($data['items'])->map(fn ($i) => [
                'product_id' => $i['product_id'],
                'name' => $products[$i['product_id']]->name,
                'quantity' => $i['quantity'],
                'unit_price' => $i['unit_price'],
                'subtotal' => round($i['quantity'] * $i['unit_price'], 2),
            ]);

            $subtotal = round($lines->sum('subtotal'), 2);
            $discount = min((float) ($data['discount'] ?? 0), $subtotal);

            $quote = Quote::create([
                'team_id' => $team->id,
                'user_id' => $request->user()->id,
                'reference' => 'COT-'.strtoupper(Str::random(6)),
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'customer_email' => $data['customer_email'] ?? null,
                'valid_until' => $data['valid_until'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount,
                'notes' => $data['notes'] ?? null,
            ]);

            $quote->items()->createMany($lines->all());

            return $quote;
        });

        return redirect()->route('admin.quotes.show', $quote)->with('success', 'Cotización creada.');
    }

    public function show(Quote $quote): Response
    {
        return Inertia::render('admin/quotes/show', $this->payload($quote));
    }

    /** Vista imprimible (sin menú) para "Guardar como PDF". */
    public function print(Quote $quote): Response
    {
        return Inertia::render('admin/quotes/print', $this->payload($quote));
    }

    public function status(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorizeQuote($quote);

        $quote->update($request->validate(['status' => ['required', 'in:pending,accepted,rejected']]));

        return back();
    }

    public function destroy(Quote $quote): RedirectResponse
    {
        $this->authorizeQuote($quote);

        $quote->delete();

        return redirect()->route('admin.quotes.index')->with('success', 'Cotización eliminada.');
    }

    private function authorizeQuote(Quote $quote): void
    {
        abort_unless($quote->team_id === $this->currentTeam()->id, 403);
    }

    /** @return array<string, mixed> */
    private function payload(Quote $quote): array
    {
        $this->authorizeQuote($quote);

        $settings = app(StoreSettings::class)->all();

        return [
            'quote' => $quote->load('items'),
            'store' => [
                'name' => config('store.name'),
                'whatsapp' => $settings['whatsapp'],
                'email' => $settings['email'],
                'city' => $settings['city'],
            ],
        ];
    }
}
