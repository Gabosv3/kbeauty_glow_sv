<?php

namespace App\Http\Middleware;

use App\Models\Customer;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Quien ya inició sesión en el panel también compra en la tienda con ese mismo
 * usuario: se le abre sesión de cliente (creándola la primera vez).
 */
class LinkPanelUserToCustomer
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user();

        if ($user && ! Auth::guard('customer')->check()) {
            Auth::guard('customer')->login(Customer::forPanelUser($user));
        }

        return $next($request);
    }
}
