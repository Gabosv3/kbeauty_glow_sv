import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes/admin';
import { ShoppingCart, TrendingUp, Scale, Package } from 'lucide-react';

interface Stats {
    readonly totalPurchases: number;
    readonly totalSales: number;
    readonly balance: number;
    readonly purchasesCount: number;
    readonly salesCount: number;
    readonly totalStock: number;
    readonly productsCount: number;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-SV', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value);
}

export default function Dashboard({ stats }: { readonly stats: Stats }) {
    const balancePositive = stats.balance >= 0;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Compras */}
                    <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-sidebar">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Compras</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.totalPurchases)}</p>
                            <p className="text-xs text-muted-foreground">{stats.purchasesCount} compras registradas</p>
                        </div>
                    </div>

                    {/* Total Ventas */}
                    <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-sidebar">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Ventas</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</p>
                            <p className="text-xs text-muted-foreground">{stats.salesCount} ventas completadas</p>
                        </div>
                    </div>

                    {/* Balance */}
                    <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-sidebar">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${balancePositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            <Scale className={`h-6 w-6 ${balancePositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Balance</p>
                            <p className={`text-2xl font-bold ${balancePositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(stats.balance)}
                            </p>
                            <p className="text-xs text-muted-foreground">Ventas − Compras</p>
                        </div>
                    </div>

                    {/* Productos en stock */}
                    <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-sidebar">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Unidades en Stock</p>
                            <p className="text-2xl font-bold">{stats.totalStock.toLocaleString('es-SV')}</p>
                            <p className="text-xs text-muted-foreground">{stats.productsCount} productos activos</p>
                        </div>
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard.url(),
        },
    ],
});
