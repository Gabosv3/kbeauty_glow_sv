<?php

namespace App\Http\Controllers\Admin;

use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends AdminController
{
    public function index(): Response
    {
        $currentTeam = $this->currentTeam();
        $brands = Brand::where('team_id', $currentTeam->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/brands/index', [
            'brands' => $brands,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $currentTeam = $this->currentTeam();
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'active'      => ['boolean'],
        ]);

        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $i = 1;
        while (Brand::where('team_id', $currentTeam->id)->where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $i++;
        }

        Brand::create([...$validated, 'team_id' => $currentTeam->id, 'slug' => $slug]);

        return back()->with('success', 'Marca creada correctamente.');
    }

    public function update(Request $request, Brand $brand): RedirectResponse
    {
        abort_unless($brand->team_id === $this->currentTeam()->id, 403);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'active'      => ['boolean'],
        ]);

        $slug = Str::slug($validated['name']);
        if ($slug !== $brand->slug) {
            $originalSlug = $slug;
            $i = 1;
            while (Brand::where('team_id', $brand->team_id)->where('slug', $slug)->where('id', '!=', $brand->id)->exists()) {
                $slug = $originalSlug . '-' . $i++;
            }
        }

        $brand->update([...$validated, 'slug' => $slug]);

        return back()->with('success', 'Marca actualizada correctamente.');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        abort_unless($brand->team_id === $this->currentTeam()->id, 403);

        $brand->delete();

        return back()->with('success', 'Marca eliminada correctamente.');
    }
}
