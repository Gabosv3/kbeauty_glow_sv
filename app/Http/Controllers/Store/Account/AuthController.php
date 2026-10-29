<?php

namespace App\Http\Controllers\Store\Account;

use App\Http\Controllers\Controller;
use App\Http\Controllers\TwoFactorChallengeController;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function login(): Response
    {
        return Inertia::render('store/account/login');
    }

    public function authenticate(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        if (! Auth::guard('customer')->attempt($credentials, $remember)) {
            // Los usuarios del panel entran a la tienda con las mismas credenciales.
            $web = Auth::guard('web');
            $user = $web->getProvider()->retrieveByCredentials($credentials);

            if (! $user || ! $web->getProvider()->validateCredentials($user, $credentials)) {
                return back()->withErrors([
                    'email' => 'El correo o la contraseña no coinciden.',
                ])->onlyInput('email');
            }

            if ($user->hasTwoFactorEnabled()) {
                return TwoFactorChallengeController::begin($request, $user, $remember, 'store');
            }

            $web->login($user, $remember);
            Auth::guard('customer')->login(Customer::forPanelUser($user), $remember);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('store.account'));
    }

    public function register(): Response
    {
        return Inertia::render('store/account/register');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', 'unique:customers,email'],
            'phone' => ['required', 'string', 'min:8', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $customer = Customer::create($data);

        Auth::guard('customer')->login($customer);
        $request->session()->regenerate();

        return redirect()->intended(route('store.account'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('customer')->logout();
        Auth::guard('web')->logout(); // si venía del panel, la sesión se cierra en ambos lados

        $request->session()->regenerateToken();

        return redirect()->route('store.index');
    }
}
