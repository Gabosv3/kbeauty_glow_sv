<?php

namespace App\Http\Controllers\Admin;

use App\Models\Customer;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends AdminController
{
    public function index(): Response
    {
        $teamId = $this->currentTeam()->id;

        $customers = Customer::query()
            ->withCount(['sales as orders_count' => fn ($q) => $q->where('team_id', $teamId)->where('status', '!=', 'cancelled')])
            ->withSum(['sales as total_spent' => fn ($q) => $q->where('team_id', $teamId)->where('status', '!=', 'cancelled')], 'total')
            ->withMax(['sales as last_order_at' => fn ($q) => $q->where('team_id', $teamId)], 'created_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'phone' => $c->phone,
                'location' => collect([$c->municipality, $c->department])->filter()->implode(', '),
                'orders_count' => $c->orders_count,
                'total_spent' => (float) $c->total_spent,
                'last_order_at' => $c->last_order_at,
                'created_at' => $c->created_at->toIso8601String(),
            ]);

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'stats' => [
                'total' => $customers->count(),
                'buyers' => $customers->where('orders_count', '>', 0)->count(),
                'revenue' => $customers->sum('total_spent'),
            ],
        ]);
    }
}
