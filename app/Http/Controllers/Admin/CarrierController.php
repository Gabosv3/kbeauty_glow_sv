<?php

namespace App\Http\Controllers\Admin;

use App\Models\Carrier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CarrierController extends AdminController
{
    public function store(Request $request): RedirectResponse
    {
        Carrier::create([...$this->validated($request), 'team_id' => $this->currentTeam()->id]);

        return back()->with('success', 'Paquetera creada correctamente.');
    }

    public function update(Request $request, Carrier $carrier): RedirectResponse
    {
        $this->authorizeCarrier($carrier);

        $carrier->update($this->validated($request, $carrier));

        return back()->with('success', 'Paquetera actualizada correctamente.');
    }

    public function destroy(Carrier $carrier): RedirectResponse
    {
        $this->authorizeCarrier($carrier);

        $carrier->delete();

        return back()->with('success', 'Paquetera eliminada correctamente.');
    }

    private function authorizeCarrier(Carrier $carrier): void
    {
        abort_unless($carrier->team_id === $this->currentTeam()->id, 403);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Carrier $carrier = null): array
    {
        $data = $request->validate([
            'name' => [
                'required', 'string', 'max:120',
                Rule::unique('carriers', 'name')
                    ->where('team_id', $this->currentTeam()->id)
                    ->whereNull('deleted_at')
                    ->ignore($carrier?->id),
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'tracking_url' => ['nullable', 'string', 'max:255'],
            'shipping_price' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'active' => ['boolean'],
        ], [
            'name.unique' => 'Ya existe una paquetera con ese nombre.',
        ]);

        $data['shipping_price'] = $data['shipping_price'] ?? 0;

        return $data;
    }
}
