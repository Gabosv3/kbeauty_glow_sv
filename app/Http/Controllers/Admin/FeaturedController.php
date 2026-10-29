<?php

namespace App\Http\Controllers\Admin;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FeaturedController extends AdminController
{
    public function index(): Response
    {
        $products = Product::where('team_id', $this->currentTeam()->id)
            ->where('active', true)
            ->with(['brand:id,name', 'category:id,name', 'images'])
            ->orderByDesc('featured')
            ->orderBy('name')
            ->get()
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'brand' => $p->brand?->name,
                'category' => $p->category?->name,
                'stock' => $p->stock,
                'image' => $p->image ?: $p->images->first()?->url,
                'featured' => $p->featured,
            ]);

        return Inertia::render('admin/featured/index', ['products' => $products]);
    }

    public function toggle(Product $product): RedirectResponse
    {
        abort_unless($product->team_id === $this->currentTeam()->id, 403);

        $product->update(['featured' => ! $product->featured]);

        return back();
    }
}
