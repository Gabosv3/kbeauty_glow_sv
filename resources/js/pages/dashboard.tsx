import { Head, Link } from '@inertiajs/react';
import { ShoppingCart, TrendingUp, Scale, Package } from 'lucide-react';
import { admin } from '@/lib/admin-routes';
import { dashboard } from '@/routes/admin';

interface Stats {
    readonly totalPurchases: number;
    readonly totalSales: number;
    readonly balance: number;
    readonly purchasesCount: number;
    readonly salesCount: number;
    readonly totalStock: number;
    readonly productsCount: number;
}

interface RecentSale {
    readonly id: number;
    readonly reference: string | null;
    readonly customer_name: string | null;
    readonly total: number;
    readonly status: string;
    readonly created_at: string | null;
}

interface LowStockProduct {
    readonly id: number;
    readonly name: string;
    readonly stock: number;
}

interface Props {
    readonly stats: Stats;
    readonly salesToday: number;
    readonly salesMonth: number;
    readonly salesSeries: { date: string; total: number }[];
    readonly recentSales: RecentSale[];
    readonly lowStock: LowStockProduct[];
}

const statusLabels: Record<string, string> = { completed: 'Completada', cancelled: 'Cancelada', pending: 'Pendiente' };

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-SV', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value);
}

export default function Dashboard({ stats, salesToday, salesMonth, salesSeries, recentSales, lowStock }: Props) {
    const peak = Math.max(...salesSeries.map((d) => d.total), 1);
    const periodTotal = salesSeries.reduce((sum, d) => sum + d.total, 0);
    const balancePositive = stats.balance >= 0;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Compras */}
                    <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Compras</p>
                            <p className="font-display text-2xl font-semibold">{formatCurrency(stats.totalPurchases)}</p>
                            <p className="text-xs text-muted-foreground">{stats.purchasesCount} compras registradas</p>
                        </div>
                    </div>

                    {/* Total Ventas */}
                    <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Ventas</p>
                            <p className="font-display text-2xl font-semibold">{formatCurrency(stats.totalSales)}</p>
                            <p className="text-xs text-muted-foreground">{stats.salesCount} ventas completadas</p>
                        </div>
                    </div>

                    {/* Balance */}
                    <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${balancePositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            <Scale className={`h-6 w-6 ${balancePositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Balance</p>
                            <p className={`font-display text-2xl font-semibold ${balancePositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(stats.balance)}
                            </p>
                            <p className="text-xs text-muted-foreground">Ventas − Compras</p>
                        </div>
                    </div>

                    {/* Productos en stock */}
                    <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Unidades en Stock</p>
                            <p className="font-display text-2xl font-semibold">{stats.totalStock.toLocaleString('es-SV')}</p>
                            <p className="text-xs text-muted-foreground">{stats.productsCount} productos activos</p>
                        </div>
                    </div>
                </div>
                <section className="rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 className="font-display text-lg font-semibold">Ventas de los últimos 30 días</h2>
                            <p className="text-sm text-muted-foreground">{formatCurrency(periodTotal)} en el período</p>
                        </div>
                        <div className="flex gap-6 text-right">
                            <div>
                                <p className="text-xs text-muted-foreground">Hoy</p>
                                <p className="font-display text-xl font-semibold">{formatCurrency(salesToday)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Este mes</p>
                                <p className="font-display text-xl font-semibold">{formatCurrency(salesMonth)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex h-40 items-end gap-1" role="img" aria-label="Gráfica de ventas diarias de los últimos 30 días">
                        {salesSeries.map((d) => (
                            <div key={d.date} className="group relative flex h-full flex-1 items-end">
                                <div
                                    className={`w-full rounded-t-md transition-colors ${d.total > 0 ? 'bg-primary/70 group-hover:bg-primary' : 'bg-muted'}`}
                                    style={{ height: `${d.total > 0 ? Math.max(6, (d.total / peak) * 100) : 3}%` }}
                                />
                                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background group-hover:block">
                                    {d.date} · {formatCurrency(d.total)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>{salesSeries[0]?.date}</span>
                        <span>{salesSeries[salesSeries.length - 1]?.date}</span>
                    </div>
                </section>

                <div className="grid flex-1 gap-4 lg:grid-cols-3">
                    <section className="rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm lg:col-span-2 dark:border-sidebar-border">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-lg font-semibold">Ventas recientes</h2>
                            <Link href={admin.sales.index} className="text-sm font-medium text-primary hover:underline">
                                Ver todas
                            </Link>
                        </div>
                        {recentSales.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Aún no hay ventas registradas.</p>
                        ) : (
                            <ul className="divide-y">
                                {recentSales.map((sale) => (
                                    <li key={sale.id}>
                                        <Link
                                            href={admin.sales.show(sale.id)}
                                            className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-accent"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{sale.customer_name || sale.reference || `Venta #${sale.id}`}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {sale.reference ? `${sale.reference} · ` : ''}
                                                    {sale.created_at}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-sm font-semibold">{formatCurrency(sale.total)}</p>
                                                <p className={`text-xs ${sale.status === 'cancelled' ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                    {statusLabels[sale.status] ?? sale.status}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="rounded-xl border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-lg font-semibold">Stock bajo</h2>
                            <Link href={admin.products.index} className="text-sm font-medium text-primary hover:underline">
                                Productos
                            </Link>
                        </div>
                        {lowStock.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Todo el inventario está en buen nivel.</p>
                        ) : (
                            <ul className="space-y-3">
                                {lowStock.map((product) => (
                                    <li key={product.id} className="flex items-center justify-between gap-3">
                                        <span className="truncate text-sm">{product.name}</span>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                product.stock === 0 ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                            }`}
                                        >
                                            {product.stock === 0 ? 'Agotado' : `${product.stock} uds.`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
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
