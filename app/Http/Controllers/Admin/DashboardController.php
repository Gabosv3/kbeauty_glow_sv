<?php

namespace App\Http\Controllers\Admin;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends AdminController
{
    public function index(): Response
    {
        $currentTeam = $this->currentTeam();

        $totalPurchases = Purchase::where('team_id', $currentTeam->id)
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');

        $totalSales = Sale::where('team_id', $currentTeam->id)
            ->where('status', 'completed')
            ->sum('total');

        $purchasesCount = Purchase::where('team_id', $currentTeam->id)
            ->whereNotIn('status', ['cancelled'])
            ->count();

        $salesCount = Sale::where('team_id', $currentTeam->id)
            ->where('status', 'completed')
            ->count();

        $totalStock = Product::where('team_id', $currentTeam->id)
            ->where('active', true)
            ->sum('stock');

        $productsCount = Product::where('team_id', $currentTeam->id)
            ->where('active', true)
            ->count();

        $recentSales = Sale::where('team_id', $currentTeam->id)
            ->latest()
            ->take(6)
            ->get(['id', 'reference', 'customer_name', 'total', 'status', 'created_at'])
            ->map(fn ($sale) => [
                'id'            => $sale->id,
                'reference'     => $sale->reference,
                'customer_name' => $sale->customer_name,
                'total'         => (float) $sale->total,
                'status'        => $sale->status,
                'created_at'    => $sale->created_at?->toDateString(),
            ])
            ->all();

        $lowStock = Product::where('team_id', $currentTeam->id)
            ->where('active', true)
            ->where('stock', '<=', 5)
            ->orderBy('stock')
            ->take(6)
            ->get(['id', 'name', 'stock'])
            ->map(fn ($product) => [
                'id'    => $product->id,
                'name'  => $product->name,
                'stock' => (int) $product->stock,
            ])
            ->all();

        $completedSales = fn () => Sale::where('team_id', $currentTeam->id)->where('status', 'completed');

        $salesToday = (float) $completedSales()->whereDate('created_at', today())->sum('total');
        $salesMonth = (float) $completedSales()->where('created_at', '>=', now()->startOfMonth())->sum('total');

        $byDay = $completedSales()
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->get(['total', 'created_at'])
            ->groupBy(fn ($sale) => $sale->created_at->toDateString())
            ->map(fn ($group) => (float) $group->sum('total'));

        $salesSeries = collect(range(29, 0))
            ->map(function (int $daysAgo) use ($byDay) {
                $date = Carbon::today()->subDays($daysAgo)->toDateString();

                return ['date' => $date, 'total' => $byDay->get($date, 0.0)];
            })
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'salesToday'  => $salesToday,
            'salesMonth'  => $salesMonth,
            'salesSeries' => $salesSeries,
            'recentSales' => $recentSales,
            'lowStock'    => $lowStock,
            'stats' => [
                'totalPurchases' => (float) $totalPurchases,
                'totalSales'     => (float) $totalSales,
                'balance'        => (float) $totalSales - (float) $totalPurchases,
                'purchasesCount' => $purchasesCount,
                'salesCount'     => $salesCount,
                'totalStock'     => (int) $totalStock,
                'productsCount'  => $productsCount,
            ],
        ]);
    }
}
