<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends AdminController
{
    public function index(): Response
    {
        $currentTeam = $this->currentTeam();
        $categories = Category::where('team_id', $currentTeam->id)
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $currentTeam = $this->currentTeam();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'active' => ['boolean'],
        ]);

        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $i = 1;
        while (Category::where('team_id', $currentTeam->id)->where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $i++;
        }

        Category::create([
            ...$validated,
            'team_id' => $currentTeam->id,
            'slug' => $slug,
        ]);

        return back()->with('success', 'Categoría creada correctamente.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        abort_unless($category->team_id === $this->currentTeam()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'active' => ['boolean'],
        ]);

        $slug = Str::slug($validated['name']);
        if ($slug !== $category->slug) {
            $originalSlug = $slug;
            $i = 1;
            while (Category::where('team_id', $category->team_id)->where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                $slug = $originalSlug . '-' . $i++;
            }
        }

        $category->update([...$validated, 'slug' => $slug]);

        return back()->with('success', 'Categoría actualizada correctamente.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        abort_unless($category->team_id === $this->currentTeam()->id, 403);

        $category->delete();

        return back()->with('success', 'Categoría eliminada correctamente.');
    }
}
