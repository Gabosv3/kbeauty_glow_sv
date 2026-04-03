import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { admin } from '@/lib/admin-routes';
import type { Sale } from '@/types';

type Props = {
    sale: Sale;
};

const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};
const statusLabels: Record<string, string> = { completed: 'Completada', cancelled: 'Cancelada', refunded: 'Reembolsada' };
const paymentLabels: Record<string, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };

export default function SaleShow({ sale }: Props) {

    return (
        <>
            <Head title={`Venta ${sale.reference}`} />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={admin.sales.index}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold">Venta {sale.reference}</h1>
                        <p className="text-sm text-muted-foreground">{new Date(sale.created_at).toLocaleDateString('es')}</p>
                    </div>
                    <span className={`ml-auto rounded-full px-3 py-1 text-sm font-medium ${statusColors[sale.status]}`}>
                        {statusLabels[sale.status]}
                    </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Información</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cliente</span>
                                <span>{sale.customer_name ?? '—'}</span>
                            </div>
                            {sale.customer_email && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email</span>
                                    <span>{sale.customer_email}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Método de pago</span>
                                <span>{paymentLabels[sale.payment_method] ?? sale.payment_method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Vendedor</span>
                                <span>{sale.user?.name ?? '—'}</span>
                            </div>
                            {sale.notes && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Notas</span>
                                    <span>{sale.notes}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Totales</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${sale.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Descuento</span>
                                <span>-${sale.discount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Impuesto</span>
                                <span>${sale.tax}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>${sale.total}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle className="text-sm">Productos vendidos</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Producto</th>
                                    <th className="px-4 py-3 text-center font-medium">Cantidad</th>
                                    <th className="px-4 py-3 text-right font-medium">Precio unit.</th>
                                    <th className="px-4 py-3 text-right font-medium">Descuento</th>
                                    <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {sale.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">{item.product?.name ?? `#${item.product_id}`}</td>
                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right">${item.unit_price}</td>
                                        <td className="px-4 py-3 text-right">-${item.discount}</td>
                                        <td className="px-4 py-3 text-right">${item.subtotal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SaleShow.layout = (props: { sale?: { reference: string } }) => ({
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Ventas', href: admin.sales.index },
        { title: props.sale?.reference ?? 'Detalle', href: '#' },
    ],
});
