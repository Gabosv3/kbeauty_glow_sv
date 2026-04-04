import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
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
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="mr-2 size-4" /> Imprimir factura
                    </Button>
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

            {/* Factura imprimible (oculta en pantalla, visible al imprimir) */}
            <div id="invoice-print" style={{ display: 'none' }}>
                <div style={{ maxWidth: 680, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>FACTURA</h1>
                            <p style={{ margin: '4px 0 0', color: '#555', fontSize: 13 }}>{sale.reference}</p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 13 }}>
                            <p style={{ margin: 0 }}><strong>Fecha:</strong> {new Date(sale.created_at).toLocaleDateString('es')}</p>
                            <p style={{ margin: '2px 0 0' }}><strong>Hora:</strong> {new Date(sale.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p style={{ margin: '2px 0 0' }}><strong>Pago:</strong> {paymentLabels[sale.payment_method] ?? sale.payment_method}</p>
                        </div>
                    </div>

                    <hr style={{ borderColor: '#000', marginBottom: 16 }} />

                    <div style={{ marginBottom: 20, fontSize: 13 }}>
                        <p style={{ margin: 0 }}><strong>Cliente:</strong> {sale.customer_name ?? 'Clientes Varios'}</p>
                        {sale.customer_email && <p style={{ margin: '2px 0 0' }}><strong>Email:</strong> {sale.customer_email}</p>}
                        <p style={{ margin: '2px 0 0' }}><strong>Atendido por:</strong> {sale.user?.name ?? '—'}</p>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 20 }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #000' }}>
                                <th style={{ textAlign: 'left', padding: '6px 8px' }}>Producto</th>
                                <th style={{ textAlign: 'center', padding: '6px 8px' }}>Cant.</th>
                                <th style={{ textAlign: 'right', padding: '6px 8px' }}>P. Unit.</th>
                                <th style={{ textAlign: 'right', padding: '6px 8px' }}>Desc.</th>
                                <th style={{ textAlign: 'right', padding: '6px 8px' }}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items?.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '6px 8px' }}>{item.product?.name ?? `#${item.product_id}`}</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>${item.unit_price}</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>-${item.discount}</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>${item.subtotal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <table style={{ fontSize: 13, minWidth: 220 }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 8px', color: '#555' }}>Subtotal</td>
                                    <td style={{ padding: '3px 8px', textAlign: 'right' }}>${sale.subtotal}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 8px', color: '#555' }}>Descuento</td>
                                    <td style={{ padding: '3px 8px', textAlign: 'right' }}>-${sale.discount}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 8px', color: '#555' }}>Impuesto</td>
                                    <td style={{ padding: '3px 8px', textAlign: 'right' }}>${sale.tax}</td>
                                </tr>
                                <tr style={{ borderTop: '2px solid #000' }}>
                                    <td style={{ padding: '6px 8px', fontWeight: 700 }}>TOTAL</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, fontSize: 15 }}>${sale.total}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {sale.notes && (
                        <p style={{ marginTop: 20, fontSize: 12, color: '#555' }}><strong>Notas:</strong> {sale.notes}</p>
                    )}

                    <hr style={{ marginTop: 32, borderColor: '#ccc' }} />
                    <p style={{ textAlign: 'center', fontSize: 11, color: '#888', marginTop: 8 }}>Gracias por su compra</p>
                </div>
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
