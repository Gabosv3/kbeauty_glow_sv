<?php

namespace App\Http\Controllers\Admin;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
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

        return Inertia::render('dashboard', [
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
