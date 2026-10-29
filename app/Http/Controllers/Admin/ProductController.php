<?php

namespace App\Http\Controllers\Admin;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\UrbbyExport;
use App\Services\XlsxWriter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends AdminController
{
    public function index(): Response
    {
        $currentTeam = $this->currentTeam();
        $products = Product::where('team_id', $currentTeam->id)
            ->with(['category:id,name', 'brand:id,name', 'images'])
            ->orderBy('id')
            ->get();

        $categories = Category::where('team_id', $currentTeam->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $brands = Brand::where('team_id', $currentTeam->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    /** Inventario valorizado: lo invertido es costo x stock actual. */
    public function export(XlsxWriter $xlsx): HttpResponse
    {
        $products = Product::where('team_id', $this->currentTeam()->id)
            ->with(['category:id,name', 'brand:id,name'])
            ->orderBy('name')
            ->get();

        $rows = $products->map(fn (Product $p) => [
            $p->sku,
            $p->name,
            $p->category?->name,
            $p->brand?->name,
            $p->active ? 'Activo' : 'Inactivo',
            (int) $p->stock,
            XlsxWriter::money((float) $p->cost_price),
            XlsxWriter::money((float) $p->sale_price),
            XlsxWriter::money((float) $p->cost_price * $p->stock),
            XlsxWriter::money((float) $p->sale_price * $p->stock),
            XlsxWriter::money(((float) $p->sale_price - (float) $p->cost_price) * $p->stock),
        ])->all();

        $invested = $products->sum(fn (Product $p) => (float) $p->cost_price * $p->stock);
        $retail = $products->sum(fn (Product $p) => (float) $p->sale_price * $p->stock);

        $rows[] = [];
        $rows[] = ['', 'TOTAL', '', '', '', (int) $products->sum('stock'), '', '',
            XlsxWriter::money($invested, true), XlsxWriter::money($retail, true), XlsxWriter::money($retail - $invested, true)];

        $content = $xlsx->build(
            'Inventario',
            ['SKU', 'Producto', 'Categoría', 'Marca', 'Estado', 'Stock', 'Costo unitario', 'Precio de venta', 'Invertido (costo x stock)', 'Valor a precio de venta', 'Ganancia potencial'],
            $rows,
            [12, 44, 22, 16, 10, 8, 14, 15, 24, 22, 18],
        );

        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="inventario-'.now()->format('Y-m-d').'.xlsx"',
        ]);
    }

    /** Productos activos en el formato de la plantilla de importación de Urbby. */
    public function exportUrbby(UrbbyExport $urbby): HttpResponse
    {
        $products = Product::where('team_id', $this->currentTeam()->id)
            ->where('active', true)
            ->with(['category:id,name', 'brand:id,name'])
            ->orderBy('name')
            ->get();

        return response($urbby->build($products), 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="productos-urbby-'.now()->format('Y-m-d').'.xlsx"',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $currentTeam = $this->currentTeam();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'sku' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'active' => ['boolean'],
        ]);

        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $i = 1;
        while (Product::where('team_id', $currentTeam->id)->where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $i++;
        }

        Product::create([...$validated, 'team_id' => $currentTeam->id, 'slug' => $slug]);

        return back()->with('success', 'Producto creado correctamente.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $currentTeam = $this->currentTeam();
        abort_unless($product->team_id === $currentTeam->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'sku' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'active' => ['boolean'],
        ]);

        if (Str::slug($validated['name']) !== $product->slug) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $i = 1;
            while (Product::where('team_id', $currentTeam->id)->where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $originalSlug . '-' . $i++;
            }
            $validated['slug'] = $slug;
        }

        $product->update($validated);

        return back()->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        abort_unless($product->team_id === $this->currentTeam()->id, 403);

        $product->delete();

        return back()->with('success', 'Producto eliminado correctamente.');
    }
}
