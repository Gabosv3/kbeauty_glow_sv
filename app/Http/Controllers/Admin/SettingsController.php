<?php

namespace App\Http\Controllers\Admin;

use App\Services\StoreSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends AdminController
{
    public function edit(StoreSettings $settings): Response
    {
        return Inertia::render('admin/settings/index', ['settings' => $settings->all()]);
    }

    public function update(Request $request, StoreSettings $settings): RedirectResponse
    {
        $data = $request->validate([
            'whatsapp' => ['required', 'string', 'regex:/^\d{8,15}$/'],
            'email' => ['required', 'email', 'max:160'],
            'city' => ['required', 'string', 'max:120'],
            'free_shipping_from' => ['required', 'numeric', 'min:0', 'max:100000'],
            'shipping_cost' => ['required', 'numeric', 'min:0', 'max:1000'],
            'instagram' => ['nullable', 'url', 'max:200'],
            'tiktok' => ['nullable', 'url', 'max:200'],
            'facebook' => ['nullable', 'url', 'max:200'],
        ], [
            'whatsapp.regex' => 'Escribe solo dígitos con código de país, por ejemplo 50360330849.',
        ]);

        $settings->save($data);

        return back()->with('success', 'Ajustes guardados.');
    }
}
