<?php

namespace App\Http\Controllers\Admin;

use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends AdminController
{
    public function index(): Response
    {
        $coupons = Coupon::where('team_id', $this->currentTeam()->id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('admin/coupons/index', ['coupons' => $coupons]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        Coupon::create([...$data, 'team_id' => $this->currentTeam()->id]);

        return back()->with('success', 'Cupón creado correctamente.');
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        abort_unless($coupon->team_id === $this->currentTeam()->id, 403);

        $coupon->update($this->validated($request, $coupon));

        return back()->with('success', 'Cupón actualizado correctamente.');
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        abort_unless($coupon->team_id === $this->currentTeam()->id, 403);

        $coupon->delete();

        return back()->with('success', 'Cupón eliminado correctamente.');
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Coupon $coupon = null): array
    {
        $request->merge(['code' => strtoupper(trim((string) $request->input('code')))]);

        $data = $request->validate([
            'code' => ['required', 'string', 'max:40', 'regex:/^[A-Z0-9_-]+$/', Rule::unique('coupons', 'code')->ignore($coupon?->id)],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'gt:0', $request->input('type') === 'percent' ? 'max:100' : 'max:100000'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'active' => ['boolean'],
        ], [
            'code.regex' => 'El código solo puede tener letras, números, guiones y guion bajo.',
            'code.unique' => 'Ya existe un cupón con ese código.',
        ]);

        // La fecha final incluye todo ese día.
        if (! empty($data['ends_at'])) {
            $data['ends_at'] = \Illuminate\Support\Carbon::parse($data['ends_at'])->endOfDay();
        }

        $data['min_order'] = $data['min_order'] ?? 0;

        return $data;
    }
}
