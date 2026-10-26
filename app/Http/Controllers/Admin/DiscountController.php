<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use App\Models\Discount;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiscountController extends AdminController
{
    public function index(): Response
    {
        $teamId = $this->currentTeam()->id;

        return Inertia::render('admin/discounts/index', [
            'discounts' => Discount::where('team_id', $teamId)
                ->with(['category:id,name', 'product:id,name'])
                ->orderByDesc('created_at')
                ->get(),
            'categories' => Category::where('team_id', $teamId)->orderBy('name')->get(['id', 'name']),
            'products' => Product::where('team_id', $teamId)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Discount::create([...$this->validated($request), 'team_id' => $this->currentTeam()->id]);

        return back()->with('success', 'Descuento creado correctamente.');
    }

    public function update(Request $request, Discount $discount): RedirectResponse
    {
        abort_unless($discount->team_id === $this->currentTeam()->id, 403);

        $discount->update($this->validated($request));

        return back()->with('success', 'Descuento actualizado correctamente.');
    }

    public function destroy(Discount $discount): RedirectResponse
    {
        abort_unless($discount->team_id === $this->currentTeam()->id, 403);

        $discount->delete();

        return back()->with('success', 'Descuento eliminado correctamente.');
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $teamId = $this->currentTeam()->id;

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'scope' => ['required', 'in:store,category,product'],
            'category_id' => ['nullable', 'required_if:scope,category', 'integer'],
            'product_id' => ['nullable', 'required_if:scope,product', 'integer'],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'gt:0', $request->input('type') === 'percent' ? 'max:100' : 'max:100000'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'active' => ['boolean'],
        ]);

        // La fecha final incluye todo ese día.
        if (! empty($data['ends_at'])) {
            $data['ends_at'] = \Illuminate\Support\Carbon::parse($data['ends_at'])->endOfDay();
        }

        // El alcance manda: se limpia el destino que no corresponde y se valida que sea del mismo equipo.
        if ($data['scope'] !== 'category') {
            $data['category_id'] = null;
        } else {
            abort_unless(Category::where('team_id', $teamId)->whereKey($data['category_id'])->exists(), 422);
        }

        if ($data['scope'] !== 'product') {
            $data['product_id'] = null;
        } else {
            abort_unless(Product::where('team_id', $teamId)->whereKey($data['product_id'])->exists(), 422);
        }

        return $data;
    }
}
