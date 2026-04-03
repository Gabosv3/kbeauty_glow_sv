<?php

namespace App\Http\Controllers\Admin;

use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends AdminController
{
    public function index(): Response
    {
        $currentTeam = $this->currentTeam();
        $suppliers = Supplier::where('team_id', $currentTeam->id)
            ->withCount('purchases')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/suppliers/index', [
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $currentTeam = $this->currentTeam();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'email' => ['nullable', 'email', 'max:200'],
            'phone' => ['nullable', 'string', 'max:30'],
            'contact_name' => ['nullable', 'string', 'max:200'],
            'address' => ['nullable', 'string', 'max:500'],
            'active' => ['boolean'],
        ]);

        Supplier::create([...$validated, 'team_id' => $currentTeam->id]);

        return back()->with('success', 'Proveedor creado correctamente.');
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        abort_unless($supplier->team_id === $this->currentTeam()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'email' => ['nullable', 'email', 'max:200'],
            'phone' => ['nullable', 'string', 'max:30'],
            'contact_name' => ['nullable', 'string', 'max:200'],
            'address' => ['nullable', 'string', 'max:500'],
            'active' => ['boolean'],
        ]);

        $supplier->update($validated);

        return back()->with('success', 'Proveedor actualizado correctamente.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        abort_unless($supplier->team_id === $this->currentTeam()->id, 403);

        $supplier->delete();

        return back()->with('success', 'Proveedor eliminado correctamente.');
    }
}
