<?php

namespace App\Http\Controllers\Admin;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends AdminController
{
    public function store(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->team_id === $this->currentTeam()->id, 403);

        $request->validate([
            'images'   => ['required', 'array', 'max:10'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
        ]);

        $nextOrder = $product->images()->max('sort_order') ?? -1;

        foreach ($request->file('images') as $file) {
            $path = $file->store('products', 'public');
            $product->images()->create([
                'path'       => $path,
                'sort_order' => ++$nextOrder,
            ]);
        }

        return back()->with('success', 'Imágenes subidas correctamente.');
    }

    public function destroy(Product $product, ProductImage $image): RedirectResponse
    {
        abort_unless($product->team_id === $this->currentTeam()->id, 403);
        abort_unless($image->product_id === $product->id, 403);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return back()->with('success', 'Imagen eliminada.');
    }
}
