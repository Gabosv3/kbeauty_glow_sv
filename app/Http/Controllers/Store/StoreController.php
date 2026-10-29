<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\PricingService;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    private const SORTS = ['featured', 'price_asc', 'price_desc', 'name'];

    public function __construct(private readonly PricingService $pricing) {}

    private function formatProduct(Product $product): array
    {
        $price = $this->pricing->priceFor($product);

        return [
            'id'             => $product->id,
            'name'           => $product->name,
            'slug'           => $product->slug,
            'brand'          => $product->brand?->name ?? '',
            'category'       => $product->category?->name ?? '',
            'price'          => $price['price'],
            'original_price' => $price['original_price'],
            'image'          => $this->pricing->imageFor($product),
            'description'    => $product->description ?? '',
            'in_stock'       => $product->stock > 0,
        ];
    }

    private function activeProducts(): Builder
    {
        return Product::query()
            ->where('active', true)
            ->with(['brand:id,name', 'category:id,name', 'images']);
    }

    public function index(): Response
    {
        // Disponibles primero, luego por nombre: la portada nunca abre con agotados.
        $featured = $this->activeProducts()
            ->orderByDesc('featured')
            ->orderByRaw('stock > 0 desc')
            ->orderByDesc('stock')
            ->orderBy('name')
            ->take(8)
            ->get()
            ->map(fn ($p) => $this->formatProduct($p))
            ->values()
            ->all();

        $categories = Category::withCount(['products' => fn ($q) => $q->where('active', true)])
            ->having('products_count', '>', 0)
            ->orderByDesc('products_count')
            ->get(['id', 'name'])
            ->map(fn ($c) => ['name' => $c->name, 'count' => $c->products_count])
            ->all();

        $brands = Brand::whereHas('products', fn ($q) => $q->where('active', true))
            ->orderBy('name')
            ->pluck('name')
            ->all();

        return Inertia::render('store/index', [
            'featuredProducts' => $featured,
            'categories'       => $categories,
            'brands'           => $brands,
        ]);
    }

    public function products(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));
        $category = (string) $request->query('category', 'all');
        $brands = array_values(array_filter((array) $request->query('brand', [])));
        $onlyAvailable = $request->boolean('available');
        $maxPrice = $request->filled('max') ? (float) $request->query('max') : null;
        $sort = in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : 'featured';

        $query = $this->activeProducts();

        if ($category !== '' && $category !== 'all') {
            $query->whereHas('category', fn ($q) => $q->where('name', $category));
        }

        if ($brands !== []) {
            $query->whereHas('brand', fn ($q) => $q->whereIn('name', $brands));
        }

        if ($search !== '') {
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhereHas('brand', fn ($b) => $b->where('name', 'like', "%{$search}%"))
                ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$search}%")));
        }

        if ($onlyAvailable) {
            $query->where('stock', '>', 0);
        }

        if ($maxPrice !== null) {
            $query->where('sale_price', '<=', $maxPrice);
        }

        match ($sort) {
            'price_asc'  => $query->orderBy('sale_price')->orderBy('name'),
            'price_desc' => $query->orderByDesc('sale_price')->orderBy('name'),
            'name'       => $query->orderBy('name'),
            default      => $query->orderByRaw('stock > 0 desc')->orderBy('name'),
        };

        $products = $query->get()
            ->map(fn ($p) => $this->formatProduct($p))
            ->values()
            ->all();

        $facetBase = Product::where('active', true);

        return Inertia::render('store/products', [
            'products'   => $products,
            'categories' => Category::whereHas('products', fn ($q) => $q->where('active', true))
                ->orderBy('name')
                ->pluck('name')
                ->all(),
            'brands'     => Brand::whereHas('products', fn ($q) => $q->where('active', true))
                ->orderBy('name')
                ->pluck('name')
                ->all(),
            'priceCeiling' => (int) ceil((float) (clone $facetBase)->max('sale_price')),
            'filters'    => [
                'q'         => $search,
                'category'  => $category === '' ? 'all' : $category,
                'brand'     => $brands,
                'available' => $onlyAvailable,
                'max'       => $maxPrice,
                'sort'      => $sort,
            ],
        ]);
    }

    public function product(string $slug): Response
    {
        $product = $this->activeProducts()
            ->where('slug', $slug)
            ->firstOrFail();

        $related = $this->activeProducts()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get()
            ->map(fn ($p) => $this->formatProduct($p))
            ->values()
            ->all();

        return Inertia::render('store/product', [
            'product'         => $this->formatProduct($product),
            'relatedProducts' => $related,
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('store/about');
    }

    public function contact(): Response
    {
        return Inertia::render('store/contact');
    }
}
