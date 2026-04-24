<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    private function formatProduct(Product $product): array
    {
        $imageUrl = $product->image;

        if (! $imageUrl) {
            $firstImage = $product->images->first();
            $imageUrl = $firstImage ? $firstImage->url : null;
        }

        return [
            'id'             => $product->id,
            'name'           => $product->name,
            'slug'           => $product->slug,
            'brand'          => $product->brand?->name ?? '',
            'category'       => $product->category?->name ?? '',
            'price'          => (float) $product->sale_price,
            'original_price' => null,
            'image'          => $imageUrl,
            'description'    => $product->description ?? '',
            'in_stock'       => $product->stock > 0,
        ];
    }

    private function getActiveProducts()
    {
        return Product::where('active', true)
            ->with(['brand:id,name', 'category:id,name', 'images'])
            ->orderBy('name')
            ->get();
    }

    public function index(): Response
    {
        $products = $this->getActiveProducts()
            ->take(6)
            ->map(fn ($p) => $this->formatProduct($p))
            ->values()
            ->all();

        return Inertia::render('store/index', [
            'featuredProducts' => $products,
        ]);
    }

    public function products(Request $request): Response
    {
        $query = Product::where('active', true)
            ->with(['brand:id,name', 'category:id,name', 'images'])
            ->orderBy('name');

        $category = $request->query('category');

        if ($category && $category !== 'all') {
            $query->whereHas('category', fn ($q) => $q->where('name', $category));
        }

        $products = $query->get()
            ->map(fn ($p) => $this->formatProduct($p))
            ->values()
            ->all();

        $categories = Category::whereHas('products', fn ($q) => $q->where('active', true))
            ->orderBy('name')
            ->pluck('name')
            ->all();

        return Inertia::render('store/products', [
            'products'        => $products,
            'categories'      => $categories,
            'currentCategory' => $category ?? 'all',
        ]);
    }

    public function product(string $slug): Response
    {
        $product = Product::where('slug', $slug)
            ->where('active', true)
            ->with(['brand:id,name', 'category:id,name', 'images'])
            ->firstOrFail();

        $related = Product::where('active', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['brand:id,name', 'category:id,name', 'images'])
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
}

