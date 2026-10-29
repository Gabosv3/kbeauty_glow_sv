<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\User;
use App\Services\TwoFactor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Segundo paso del login cuando el usuario del panel tiene 2FA activo.
 * Sirve tanto al login del panel (scope "admin") como al de la tienda ("store").
 */
class TwoFactorChallengeController extends Controller
{
    public const SESSION_KEY = 'two_factor.pending';

    public function __construct(private TwoFactor $twoFactor) {}

    /** Guarda el usuario ya validado por contraseña y redirige al desafío. */
    public static function begin(Request $request, User $user, bool $remember, string $scope): RedirectResponse
    {
        $request->session()->put(self::SESSION_KEY, [
            'id' => $user->getKey(),
            'remember' => $remember,
            'scope' => $scope,
            'expires' => now()->addMinutes(10)->timestamp,
        ]);

        return redirect()->route($scope === 'store' ? 'store.account.two-factor' : 'admin.two-factor');
    }

    public function adminCreate(Request $request): Response|RedirectResponse
    {
        return $this->create($request, 'admin', 'admin/auth/two-factor');
    }

    public function storeCreate(Request $request): Response|RedirectResponse
    {
        return $this->create($request, 'store', 'store/account/two-factor');
    }

    public function adminStore(Request $request): RedirectResponse
    {
        return $this->verify($request, 'admin');
    }

    public function storeStore(Request $request): RedirectResponse
    {
        return $this->verify($request, 'store');
    }

    private function create(Request $request, string $scope, string $page): Response|RedirectResponse
    {
        if ($this->pendingUser($request, $scope) === null) {
            return redirect()->route($scope === 'store' ? 'store.account.login' : 'admin.login');
        }

        return Inertia::render($page);
    }

    private function verify(Request $request, string $scope): RedirectResponse
    {
        $loginRoute = $scope === 'store' ? 'store.account.login' : 'admin.login';
        $user = $this->pendingUser($request, $scope);

        if ($user === null) {
            return redirect()->route($loginRoute)->withErrors(['email' => 'Tu sesión de verificación expiró. Inicia sesión de nuevo.']);
        }

        $request->validate(['code' => ['required', 'string', 'max:32']]);

        $key = 'two-factor:'.$user->getKey().'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $request->session()->forget(self::SESSION_KEY);
            $seconds = RateLimiter::availableIn($key);

            return redirect()->route($loginRoute)->withErrors(['email' => "Demasiados intentos. Inténtalo de nuevo en {$seconds} segundos."]);
        }

        if (! $this->twoFactor->verifyForUser($user, $request->string('code')->toString())) {
            RateLimiter::hit($key, 300);

            return back()->withErrors(['code' => 'El código no es válido.']);
        }

        RateLimiter::clear($key);

        $pending = $request->session()->pull(self::SESSION_KEY);
        $remember = (bool) $pending['remember'];

        Auth::guard('web')->login($user, $remember);

        if ($scope === 'store') {
            Auth::guard('customer')->login(Customer::forPanelUser($user), $remember);
        }

        $request->session()->regenerate();

        return redirect()->intended($scope === 'store' ? route('store.account') : route('admin.dashboard'));
    }

    private function pendingUser(Request $request, string $scope): ?User
    {
        $pending = $request->session()->get(self::SESSION_KEY);

        if (! is_array($pending) || $pending['scope'] !== $scope || $pending['expires'] < now()->timestamp) {
            $request->session()->forget(self::SESSION_KEY);

            return null;
        }

        return User::find($pending['id']);
    }
}
