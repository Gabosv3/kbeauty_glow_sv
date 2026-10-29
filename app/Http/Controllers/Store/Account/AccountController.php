<?php

namespace App\Http\Controllers\Store\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function show(): Response
    {
        $customer = Auth::guard('customer')->user();

        $orders = $customer->sales()
            ->withCount('items')
            ->latest()
            ->get()
            ->map(fn ($s) => [
                'reference' => $s->reference,
                'status' => $s->status,
                'total' => (float) $s->total,
                'items_count' => $s->items_count,
                'created_at' => $s->created_at->toIso8601String(),
            ]);

        return Inertia::render('store/account/index', [
            'orders' => $orders,
            'profile' => [
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone ?? '',
                'department' => $customer->department ?? '',
                'municipality' => $customer->municipality ?? '',
                'address' => $customer->address ?? '',
            ],
            'departments' => config('store.departments'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'min:8', 'max:20'],
            'department' => ['nullable', 'string', 'in:'.implode(',', config('store.departments'))],
            'municipality' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:400'],
        ]);

        Auth::guard('customer')->user()->update($data);

        return back()->with('success', 'Datos actualizados.');
    }
}
