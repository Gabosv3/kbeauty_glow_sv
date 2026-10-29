<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\TwoFactor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    public function __construct(private TwoFactor $twoFactor) {}

    public function edit(Request $request): Response
    {
        $user = $request->user();
        $pending = $user->two_factor_secret !== null && ! $user->hasTwoFactorEnabled();

        return Inertia::render('settings/security', [
            'enabled' => $user->hasTwoFactorEnabled(),
            'setup' => $pending ? [
                'secret' => $user->two_factor_secret,
                'url' => $this->twoFactor->otpAuthUrl($user->two_factor_secret, $user->email),
            ] : null,
            'recoveryCodes' => $request->session()->get('recoveryCodes'),
            'remainingCodes' => count($user->two_factor_recovery_codes ?? []),
        ]);
    }

    public function enable(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasTwoFactorEnabled()) {
            $user->forceFill([
                'two_factor_secret' => $this->twoFactor->generateSecret(),
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ])->save();
        }

        return back();
    }

    public function confirm(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string']]);
        $user = $request->user();

        if ($user->two_factor_secret === null || $user->hasTwoFactorEnabled()) {
            return back();
        }

        if (! $this->twoFactor->verify($user->two_factor_secret, $request->string('code')->toString())) {
            return back()->withErrors(['code' => 'El código no es válido. Revisa tu aplicación e inténtalo de nuevo.']);
        }

        $codes = $this->twoFactor->generateRecoveryCodes();
        $user->forceFill([
            'two_factor_recovery_codes' => $codes,
            'two_factor_confirmed_at' => now(),
        ])->save();

        return back()->with('recoveryCodes', $codes);
    }

    public function regenerate(Request $request): RedirectResponse
    {
        $this->validatePassword($request);
        $user = $request->user();

        if (! $user->hasTwoFactorEnabled()) {
            return back();
        }

        $codes = $this->twoFactor->generateRecoveryCodes();
        $user->forceFill(['two_factor_recovery_codes' => $codes])->save();

        return back()->with('recoveryCodes', $codes);
    }

    public function disable(Request $request): RedirectResponse
    {
        $this->validatePassword($request);

        $request->user()->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return back();
    }

    private function validatePassword(Request $request): void
    {
        $request->validate(['password' => ['required', 'current_password']], [
            'password.current_password' => 'La contraseña no es correcta.',
        ]);
    }
}
