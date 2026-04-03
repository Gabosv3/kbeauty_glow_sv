import { Link, router, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { admin } from '@/lib/admin-routes';
import type { Product, Purchase, Supplier } from '@/types';

type Props = {
    purchases: Purchase[];
    suppliers: Pick<Supplier, 'id' | 'name'>[];
    products: Pick<Product, 'id' | 'name' | 'cost_price' | 'stock'>[];
};

type PurchaseItemForm = { product_id: string; quantity: string; unit_cost: string; shipping_code: string; item_tax: string };
type PurchaseForm = {
    supplier_id: string;
    discount: string;
    notes: string;
    items: PurchaseItemForm[];
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
const statusLabels: Record<string, string> = { pending: 'Pendiente', received: 'Recibida', cancelled: 'Cancelada' };

export default function PurchasesIndex({ purchases, suppliers, products }: Props) {
    const [openCreate, setOpenCreate] = useState(false);

    const form = useForm<PurchaseForm>({
        supplier_id: '', discount: '0', notes: '',
        items: [{ product_id: '', quantity: '1', unit_cost: '', shipping_code: '', item_tax: '0' }],
    });

    function addItem() {
        form.setData('items', [...form.data.items, { product_id: '', quantity: '1', unit_cost: '', shipping_code: '', item_tax: '0' }]);
    }

    function removeItem(i: number) {
        form.setData('items', form.data.items.filter((_, idx) => idx !== i));
    }

    function updateItem(i: number, field: keyof PurchaseItemForm, value: string) {
        const items = [...form.data.items];
        items[i] = { ...items[i], [field]: value };
        // Auto-fill unit_cost when product changes
        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value);
            if (product) items[i].unit_cost = product.cost_price;
        }
        form.setData('items', items);
    }

    const subtotal = form.data.items.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);
    }, 0);
    const tax = form.data.items.reduce((sum, item) => sum + (parseFloat(item.item_tax) || 0), 0);
    const discount = parseFloat(form.data.discount || '0');
    const total = subtotal + tax - discount;

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        form.post(admin.purchases.store, {
            preserveScroll: true,
            onSuccess: () => { form.reset(); setOpenCreate(false); },
        });
    }

    function receiveOrder(purchase: Purchase) {
        if (!confirm('¿Confirmar recepción? Se actualizará el stock.')) return;
        router.post(admin.purchases.receive(purchase.id), {}, { preserveScroll: true });
    }

    function cancelOrder(purchase: Purchase) {
        if (!confirm('¿Cancelar esta compra?')) return;
        router.post(admin.purchases.cancel(purchase.id), {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Compras" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Compras" description="Órdenes de compra a proveedores." variant="small" />
                    <Button onClick={() => setOpenCreate(true)} size="sm">
                        <Plus className="mr-2 size-4" /> Nueva compra
                    </Button>
                </div>

                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Referencia</th>
                                <th className="px-4 py-3 text-left font-medium">Proveedor</th>
                                <th className="px-4 py-3 text-left font-medium">Registrada por</th>
                                <th className="px-4 py-3 text-right font-medium">Total</th>
                                <th className="px-4 py-3 text-center font-medium">Estado</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {purchases.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                                    <td className="px-4 py-3">{p.supplier?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{p.user?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-medium">${p.total}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status]}`}>
                                            {statusLabels[p.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" asChild>
                                                <Link href={admin.purchases.show(p.id)}>
                                                    <Eye className="size-4" />
                                                </Link>
                                            </Button>
                                            {p.status === 'pending' && (
                                                <>
                                                    <Button size="sm" variant="outline" onClick={() => receiveOrder(p)}>
                                                        Recibir
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancelOrder(p)}>
                                                        Cancelar
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {purchases.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay compras registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal nueva compra */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader><DialogTitle>Nueva Orden de Compra</DialogTitle></DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Proveedor</Label>
                                <Select value={form.data.supplier_id} onValueChange={v => form.setData('supplier_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sin proveedor" /></SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Descuento ($)</Label>
                                <Input type="number" min="0" step="0.01" value={form.data.discount} onChange={e => form.setData('discount', e.target.value)} />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                            <Label>Productos *</Label>
                            <div className="rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Producto</th>
                                            <th className="px-3 py-2 text-center">Cantidad</th>
                                            <th className="px-3 py-2 text-right">Costo unit.</th>
                                            <th className="px-3 py-2 text-left">Cód. Envío</th>
                                            <th className="px-3 py-2 text-right">Impuesto</th>
                                            <th className="px-3 py-2 text-right">Subtotal</th>
                                            <th className="px-3 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {form.data.items.map((item, i) => {
                                            const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);
                                            return (
                                                <tr key={i}>
                                                    <td className="px-3 py-2">
                                                        <Select value={item.product_id} onValueChange={v => updateItem(i, 'product_id', v)}>
                                                            <SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                            <SelectContent>
                                                                {products.map(p => (
                                                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="1" className="w-20 text-center" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0" step="0.01" className="w-24 text-right" value={item.unit_cost} onChange={e => updateItem(i, 'unit_cost', e.target.value)} />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input placeholder="ej. KR-12345" className="w-32" value={item.shipping_code} onChange={e => updateItem(i, 'shipping_code', e.target.value)} />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0" step="0.01" className="w-20 text-right" value={item.item_tax} onChange={e => updateItem(i, 'item_tax', e.target.value)} />
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">${lineTotal.toFixed(2)}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <Button type="button" size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => removeItem(i)}>×</Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={addItem}>
                                <Plus className="mr-1 size-3" /> Agregar línea
                            </Button>
                        </div>

                        {/* Totales */}
                        <div className="flex justify-end gap-6 text-sm">
                            <span>Subtotal: <strong>${subtotal.toFixed(2)}</strong></span>
                            <span>Descuento: <strong className="text-destructive">-${discount.toFixed(2)}</strong></span>
                            <span>Impuesto: <strong>${tax.toFixed(2)}</strong></span>
                            <span>Total: <strong>${total.toFixed(2)}</strong></span>
                        </div>

                        <div className="grid gap-2">
                            <Label>Notas</Label>
                            <Input value={form.data.notes} onChange={e => form.setData('notes', e.target.value)} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
                            <Button type="submit" disabled={form.processing}>Registrar compra</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

PurchasesIndex.layout = () => ({
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Compras', href: admin.purchases.index },
    ],
});
