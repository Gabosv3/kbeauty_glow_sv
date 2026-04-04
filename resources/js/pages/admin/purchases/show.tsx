import { Head, router, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Package, Pencil, Plus, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { admin } from '@/lib/admin-routes';
import type { Purchase, PurchaseShipment } from '@/types';

type Props = { purchase: Purchase };

const statusColors: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    ordered:   'bg-blue-100 text-blue-800',
    received:  'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};
const statusLabels: Record<string, string> = {
    pending:   'Pendiente',
    ordered:   'Ordenada',
    received:  'Recibida',
    cancelled: 'Cancelada',
};
const shipmentStatusColors: Record<string, string> = {
    in_transit:   'bg-blue-100 text-blue-800',
    received:     'bg-green-100 text-green-800',
    not_received: 'bg-red-100 text-red-800',
};
const shipmentStatusLabels: Record<string, string> = {
    in_transit:   'En transito',
    received:     'Recibido',
    not_received: 'No recibido',
};

type ShipmentFormItem = { id: number; quantity: number };
type ShipmentForm = {
    package_number: string;
    tracking_number: string;
    tax: string;
    items: ShipmentFormItem[];
};

type EditShipmentForm = {
    package_number: string;
    tracking_number: string;
    tax: string;
};

export default function PurchaseShow({ purchase }: Props) {
    const [openShipment, setOpenShipment] = useState(false);
    const [editingShipment, setEditingShipment] = useState<PurchaseShipment | null>(null);

    const editForm = useForm<EditShipmentForm>({
        package_number: '',
        tracking_number: '',
        tax: '0',
    });

    function openEdit(shipment: PurchaseShipment) {
        setEditingShipment(shipment);
        editForm.setData({
            package_number: shipment.package_number,
            tracking_number: shipment.tracking_number ?? '',
            tax: shipment.tax,
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingShipment) return;
        editForm.put(admin.shipments.update(editingShipment.id), {
            preserveScroll: true,
            onSuccess: () => setEditingShipment(null),
        });
    }

    const shipmentForm = useForm<ShipmentForm>({
        package_number: 'Paquete ' + ((purchase.shipments?.length ?? 0) + 1),
        tracking_number: '',
        tax: '0',
        items: [],
    });

    const unassignedItems = purchase.items?.filter(i => i.shipment_id === null) ?? [];

    function setItemQuantity(id: number, quantity: number, max: number) {
        const qty = Math.min(Math.max(0, quantity), max);
        const current = shipmentForm.data.items;
        if (qty === 0) {
            shipmentForm.setData('items', current.filter(i => i.id !== id));
        } else {
            const exists = current.find(i => i.id === id);
            if (exists) {
                shipmentForm.setData('items', current.map(i => i.id === id ? { id, quantity: qty } : i));
            } else {
                shipmentForm.setData('items', [...current, { id, quantity: qty }]);
            }
        }
    }

    function submitShipment(e: React.FormEvent) {
        e.preventDefault();
        shipmentForm.post(admin.purchases.shipmentsStore(purchase.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenShipment(false);
                shipmentForm.reset();
                shipmentForm.setData('items', []);
                shipmentForm.setData('package_number', 'Paquete ' + ((purchase.shipments?.length ?? 0) + 2));
            },
        });
    }

    async function receiveShipment(shipment: PurchaseShipment) {
        const result = await Swal.fire({
            title: '¿Confirmar recepción?',
            text: 'Se actualizará el stock de los productos incluidos en este paquete.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, recibido',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
        });
        if (!result.isConfirmed) return;
        router.post(admin.shipments.receive(shipment.id), {}, { preserveScroll: true });
    }

    async function notReceivedShipment(shipment: PurchaseShipment) {
        const result = await Swal.fire({
            title: '¿Marcar como no recibido?',
            text: 'El paquete quedará marcado como no recibido y no afectará el inventario.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, no recibido',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
        });
        if (!result.isConfirmed) return;
        router.post(admin.shipments.notReceived(shipment.id), {}, { preserveScroll: true });
    }

    async function deleteShipment(shipment: PurchaseShipment) {
        const wasReceived = shipment.status === 'received';
        const result = await Swal.fire({
            title: '\u00bfEliminar paquete?',
            text: wasReceived
                ? 'Este paquete fue recibido. Se revertir\u00e1 el stock del inventario y los productos quedar\u00e1n sin asignar.'
                : 'Los productos del paquete quedar\u00e1n sin asignar.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'S\u00ed, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
        });
        if (!result.isConfirmed) return;
        router.delete(admin.shipments.destroy(shipment.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title={`Compra ${purchase.reference}`} />
            <div className="space-y-6 p-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={admin.purchases.index}><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold">Compra {purchase.reference}</h1>
                        <p className="text-sm text-muted-foreground">{new Date(purchase.created_at).toLocaleDateString('es')}</p>
                    </div>
                    <span className={`ml-auto rounded-full px-3 py-1 text-sm font-medium ${statusColors[purchase.status]}`}>
                        {statusLabels[purchase.status]}
                    </span>
                </div>

                {/* Info + Totales */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Informacion</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Proveedor</span>
                                <span>{purchase.supplier?.name ?? 'sin proveedor'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Registrada por</span>
                                <span>{purchase.user?.name ?? 'desconocido'}</span>
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
                                <span className="text-muted-foreground">Impuesto (paquetes)</span>
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

                {/* Tabla de productos de la orden */}
                <Card>
                    <CardHeader><CardTitle className="text-sm">Productos de la orden</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Producto</th>
                                    <th className="px-4 py-3 text-center font-medium">Cantidad</th>
                                    <th className="px-4 py-3 text-right font-medium">Costo unit.</th>
                                    <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                                    <th className="px-4 py-3 text-center font-medium">Paquete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {purchase.items?.map((item) => {
                                    const shipment = purchase.shipments?.find(s => s.id === item.shipment_id);
                                    return (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.product?.name ?? `#${item.product_id}`}</td>
                                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right">${item.unit_cost}</td>
                                            <td className="px-4 py-3 text-right">${item.subtotal}</td>
                                            <td className="px-4 py-3 text-center">
                                                {shipment ? (
                                                    <span className="text-xs font-medium text-blue-700">{shipment.package_number}</span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Sin asignar</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Seccion de paquetes - solo cuando esta ordenada */}
                {purchase.status === 'ordered' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Truck className="size-5 text-muted-foreground" />
                                <h2 className="text-base font-semibold">Paquetes de envio</h2>
                                {unassignedItems.length > 0 && (
                                    <Badge variant="secondary">{unassignedItems.length} sin asignar</Badge>
                                )}
                            </div>
                            {unassignedItems.length > 0 && (
                                <Button size="sm" onClick={() => setOpenShipment(true)}>
                                    <Plus className="mr-1 size-3" /> Nuevo paquete
                                </Button>
                            )}
                        </div>

                        {/* Lista de paquetes existentes */}
                        {(purchase.shipments ?? []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay paquetes registrados aun.</p>
                        ) : (
                            <div className="space-y-3">
                                {purchase.shipments?.map(shipment => (
                                    <Card key={shipment.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Package className="size-4 text-muted-foreground" />
                                                    <div>
                                                        <span className="font-medium">{shipment.package_number}</span>
                                                        {shipment.tracking_number && (
                                                            <span className="ml-2 font-mono text-xs text-muted-foreground">
                                                                #{shipment.tracking_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${shipmentStatusColors[shipment.status]}`}>
                                                        {shipmentStatusLabels[shipment.status]}
                                                    </span>
                                                </div>
                                                {shipment.status === 'in_transit' && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => openEdit(shipment)}>
                                                            <Pencil className="size-3" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => receiveShipment(shipment)}>
                                                            Recibido
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => notReceivedShipment(shipment)}>
                                                            No recibido
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteShipment(shipment)}>
                                                            <Trash2 className="size-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {shipment.status !== 'in_transit' && (
                                                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteShipment(shipment)}>
                                                        <Trash2 className="size-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <table className="w-full text-sm">
                                                <tbody className="divide-y">
                                                    {shipment.items?.map(item => (
                                                        <tr key={item.id}>
                                                            <td className="py-1.5">{item.product?.name ?? `#${item.product_id}`}</td>
                                                            <td className="py-1.5 text-center text-muted-foreground">x{item.quantity}</td>
                                                            <td className="py-1.5 text-right text-muted-foreground">${item.subtotal}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="mt-2 flex justify-end text-sm">
                                                <span className="text-muted-foreground">Impuesto del paquete:&nbsp;</span>
                                                <span className="font-medium">${shipment.tax}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {unassignedItems.length === 0 && (purchase.shipments?.length ?? 0) > 0 && (
                            <p className="text-sm text-muted-foreground">Todos los productos estan asignados a un paquete.</p>
                        )}
                    </div>
                )}

                {/* Paquetes de solo lectura cuando ya esta recibida */}
                {purchase.status === 'received' && (purchase.shipments?.length ?? 0) > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Truck className="size-5 text-muted-foreground" />
                            <h2 className="text-base font-semibold">Paquetes recibidos</h2>
                        </div>
                        {purchase.shipments?.map(shipment => (
                            <Card key={shipment.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{shipment.package_number}</span>
                                        {shipment.tracking_number && (
                                            <span className="font-mono text-xs text-muted-foreground">#{shipment.tracking_number}</span>
                                        )}
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${shipmentStatusColors[shipment.status]}`}>
                                            {shipmentStatusLabels[shipment.status]}
                                        </span>
                                        <span className="ml-auto text-sm">Impuesto: <strong>${shipment.tax}</strong></span>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Nuevo paquete */}
            <Dialog open={openShipment} onOpenChange={setOpenShipment}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Nuevo Paquete de Envio</DialogTitle></DialogHeader>
                    <form onSubmit={submitShipment} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label>Numero de paquete</Label>
                                <Input
                                    value={shipmentForm.data.package_number}
                                    onChange={e => shipmentForm.setData('package_number', e.target.value)}
                                    placeholder="ej. Paquete 1"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Numero de seguimiento</Label>
                                <Input
                                    value={shipmentForm.data.tracking_number}
                                    onChange={e => shipmentForm.setData('tracking_number', e.target.value)}
                                    placeholder="ej. KR1234567890"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Impuesto del paquete ($)</Label>
                            <Input
                                type="number" min="0" step="0.01"
                                value={shipmentForm.data.tax}
                                onChange={e => shipmentForm.setData('tax', e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Productos en este paquete</Label>
                            <div className="rounded-lg border divide-y">
                                {unassignedItems.map(item => {
                                    const assigned = shipmentForm.data.items.find(i => i.id === item.id)?.quantity ?? 0;
                                    const subtotal = ((parseFloat(item.unit_cost) || 0) * assigned).toFixed(2);
                                    return (
                                        <div key={item.id} className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${assigned > 0 ? 'bg-muted/30' : ''}`}>
                                            <span className="flex-1 text-sm">{item.product?.name ?? `#${item.product_id}`}</span>
                                            <span className="text-xs text-muted-foreground">/ {item.quantity}</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={item.quantity}
                                                className="h-8 w-20 text-center"
                                                value={assigned}
                                                onChange={e => setItemQuantity(item.id, parseInt(e.target.value) || 0, item.quantity)}
                                            />
                                            <span className="w-16 text-right text-sm font-medium">${subtotal}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenShipment(false)}>Cancelar</Button>
                            <Button type="submit" disabled={shipmentForm.processing || shipmentForm.data.items.filter(i => i.quantity > 0).length === 0}>
                                Crear paquete
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Editar paquete */}
            <Dialog open={!!editingShipment} onOpenChange={open => { if (!open) setEditingShipment(null); }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Editar Paquete</DialogTitle></DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Numero de paquete</Label>
                            <Input
                                value={editForm.data.package_number}
                                onChange={e => editForm.setData('package_number', e.target.value)}
                                placeholder="ej. Paquete 1"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Numero de seguimiento</Label>
                            <Input
                                value={editForm.data.tracking_number}
                                onChange={e => editForm.setData('tracking_number', e.target.value)}
                                placeholder="ej. KR1234567890"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Impuesto del paquete ($)</Label>
                            <Input
                                type="number" min="0" step="0.01"
                                value={editForm.data.tax}
                                onChange={e => editForm.setData('tax', e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingShipment(null)}>Cancelar</Button>
                            <Button type="submit" disabled={editForm.processing}>Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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
