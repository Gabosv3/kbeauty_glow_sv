import { Link, router, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Eye, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
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
    products: Pick<Product, 'id' | 'name' | 'cost_price' | 'stock' | 'brand'>[];
};

type PurchaseItemForm = { product_id: string; quantity: string; unit_cost: string };
type PurchaseForm = {
    supplier_id: string;
    discount: string;
    notes: string;
    items: PurchaseItemForm[];
};

const statusColors: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    ordered:   'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    received:  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
const statusLabels: Record<string, string> = {
    pending:   'Pendiente',
    ordered:   'Ordenada',
    received:  'Recibida',
    cancelled: 'Cancelada',
};

export default function PurchasesIndex({ purchases, suppliers, products }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [productSearch, setProductSearch] = useState<string[]>([]);

    const form = useForm<PurchaseForm>({
        supplier_id: '',
        discount: '0',
        notes: '',
        items: [{ product_id: '', quantity: '1', unit_cost: '' }],
    });

    function addItem() {
        form.setData('items', [...form.data.items, { product_id: '', quantity: '1', unit_cost: '' }]);
        setProductSearch(s => [...s, '']);
    }

    function removeItem(i: number) {
        form.setData('items', form.data.items.filter((_, idx) => idx !== i));
        setProductSearch(s => s.filter((_, idx) => idx !== i));
    }

    function updateItem(i: number, field: keyof PurchaseItemForm, value: string) {
        const items = [...form.data.items];
        items[i] = { ...items[i], [field]: value };
        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value);
            if (product) items[i].unit_cost = product.cost_price;
        }
        form.setData('items', items);
    }

    const subtotal = form.data.items.reduce(
        (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0),
        0,
    );
    const discount = parseFloat(form.data.discount || '0');
    const total = subtotal - discount;

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        form.post(admin.purchases.store, {
            preserveScroll: true,
            onSuccess: () => { form.reset(); setOpenCreate(false); },
        });
    }

    function orderPurchase(purchase: Purchase) {
        if (!confirm('Marcar esta compra como enviada al proveedor?')) return;
        router.post(admin.purchases.order(purchase.id), {}, { preserveScroll: true });
    }

    function cancelOrder(purchase: Purchase) {
        if (!confirm('Cancelar esta compra?')) return;
        router.post(admin.purchases.cancel(purchase.id), {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Compras" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Compras" description="Ordenes de compra a proveedores." variant="small" />
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
                                    <td className="px-4 py-3">{p.supplier?.name ?? 'sin proveedor'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{p.user?.name ?? 'desconocido'}</td>
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
                                                    <Button size="sm" variant="outline" onClick={() => orderPurchase(p)}>
                                                        Ordenar
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancelOrder(p)}>
                                                        Cancelar
                                                    </Button>
                                                </>
                                            )}
                                            {p.status === 'ordered' && (
                                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancelOrder(p)}>
                                                    Cancelar
                                                </Button>
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

            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="text-lg">Nueva Orden de Compra</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-5">
                        {/* Proveedor + Descuento */}
                        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4">
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proveedor</Label>
                                <Select value={form.data.supplier_id} onValueChange={v => form.setData('supplier_id', v)}>
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Sin proveedor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descuento ($)</Label>
                                <Input
                                    type="number" min="0" step="0.01"
                                    className="bg-background"
                                    value={form.data.discount}
                                    onChange={e => form.setData('discount', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tabla de productos */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Productos *</Label>
                                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                                    <Plus className="mr-1 size-3" /> Agregar línea
                                </Button>
                            </div>
                            <div className="overflow-hidden rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/60">
                                        <tr>
                                            <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Producto</th>
                                            <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">Cant.</th>
                                            <th className="w-28 px-3 py-2.5 text-right font-medium text-muted-foreground">Costo unit.</th>
                                            <th className="w-24 px-3 py-2.5 text-right font-medium text-muted-foreground">Subtotal</th>
                                            <th className="w-8 px-3 py-2.5" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y bg-background">
                                        {form.data.items.map((item, i) => {
                                            const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);
                                            return (
                                                <tr key={i} className="group">
                                                    <td className="px-3 py-2">
                                                        <Select value={item.product_id} onValueChange={v => updateItem(i, 'product_id', v)}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Seleccionar producto..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <div className="relative px-2 pb-2 pt-1">
                                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Buscar producto..."
                                                                        className="w-full rounded-md border border-input bg-background py-1.5 pl-7 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                                        value={productSearch[i] ?? ''}
                                                                        onChange={e => setProductSearch(s => { const n = [...s]; n[i] = e.target.value; return n; })}
                                                                        onKeyDown={e => e.stopPropagation()}
                                                                        onClick={e => e.stopPropagation()}
                                                                    />
                                                                </div>
                                                                {products
                                                                    .filter(p => p.name.toLowerCase().includes((productSearch[i] ?? '').toLowerCase()))
                                                                    .map(p => (
                                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                                            <span>{p.name}</span>
                                                                            {p.brand && <span className="ml-1.5 text-xs text-muted-foreground">{p.brand.name}</span>}
                                                                        </SelectItem>
                                                                    ))
                                                                }
                                                                {products.filter(p => p.name.toLowerCase().includes((productSearch[i] ?? '').toLowerCase())).length === 0 && (
                                                                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">Sin resultados</div>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number" min="1"
                                                            className="w-20 text-center"
                                                            value={item.quantity}
                                                            onChange={e => updateItem(i, 'quantity', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number" min="0" step="0.01"
                                                            className="w-28 text-right"
                                                            value={item.unit_cost}
                                                            onChange={e => updateItem(i, 'unit_cost', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-semibold tabular-nums">
                                                        ${lineTotal.toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <Button
                                                            type="button" size="icon" variant="ghost"
                                                            className="size-7 text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeItem(i)}
                                                        >×</Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totales */}
                        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3 text-sm">
                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notas</Label>
                                <Input
                                    className="w-64 bg-background"
                                    placeholder="Opcional..."
                                    value={form.data.notes}
                                    onChange={e => form.setData('notes', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col items-end gap-1 tabular-nums">
                                <div className="flex gap-6 text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span className="min-w-[80px] text-right font-medium text-foreground">${subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex gap-6 text-muted-foreground">
                                        <span>Descuento</span>
                                        <span className="min-w-[80px] text-right font-medium text-destructive">-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex gap-6 border-t pt-1 mt-1 font-semibold">
                                    <span>Total</span>
                                    <span className="min-w-[80px] text-right">${total.toFixed(2)}</span>
                                </div>
                            </div>
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
