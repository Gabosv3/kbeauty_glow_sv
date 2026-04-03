import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { admin } from '@/lib/admin-routes';
import type { Purchase } from '@/types';

type Props = {
    purchase: Purchase;
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
const statusLabels: Record<string, string> = { pending: 'Pendiente', received: 'Recibida', cancelled: 'Cancelada' };

export default function PurchaseShow({ purchase }: Props) {

    return (
        <>
            <Head title={`Compra ${purchase.reference}`} />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={admin.purchases.index}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold">Compra {purchase.reference}</h1>
                        <p className="text-sm text-muted-foreground">{new Date(purchase.created_at).toLocaleDateString('es')}</p>
                    </div>
                    <span className={`ml-auto rounded-full px-3 py-1 text-sm font-medium ${statusColors[purchase.status]}`}>
                        {statusLabels[purchase.status]}
                    </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Información</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Proveedor</span>
                                <span>{purchase.supplier?.name ?? '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Registrada por</span>
                                <span>{purchase.user?.name ?? '—'}</span>
                            </div>
                            {purchase.received_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Recibida el</span>
                                    <span>{new Date(purchase.received_at).toLocaleDateString('es')}</span>
                                </div>
                            )}
                            {purchase.notes && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Notas</span>
                                    <span>{purchase.notes}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Totales</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${purchase.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Descuento</span>
                                <span className="text-destructive">-${purchase.discount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Impuesto</span>
                                <span>${purchase.tax}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>${purchase.total}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle className="text-sm">Productos</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Producto</th>
                                    <th className="px-4 py-3 text-center font-medium">Cantidad</th>
                                    <th className="px-4 py-3 text-right font-medium">Costo unit.</th>
                                    <th className="px-4 py-3 text-left font-medium">Cód. Envío</th>
                                    <th className="px-4 py-3 text-right font-medium">Impuesto</th>
                                    <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {purchase.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">{item.product?.name ?? `#${item.product_id}`}</td>
                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right">${item.unit_cost}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.shipping_code ?? '—'}</td>
                                        <td className="px-4 py-3 text-right">${item.tax ?? '0.00'}</td>
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

PurchaseShow.layout = (props: { purchase?: { reference: string } }) => ({
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Compras', href: admin.purchases.index },
        { title: props.purchase?.reference ?? 'Detalle', href: '#' },
    ],
});
