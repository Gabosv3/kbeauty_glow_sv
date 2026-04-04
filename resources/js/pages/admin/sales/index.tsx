import { Link, router, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { admin } from '@/lib/admin-routes';
import type { Product, Sale } from '@/types';

type Props = {
    sales: Sale[];
    products: Pick<Product, 'id' | 'name' | 'sale_price' | 'stock'>[];
};

type SaleItemForm = { product_id: string; quantity: string; unit_price: string; discount: string };
type SaleForm = {
    customer_name: string;
    customer_email: string;
    payment_method: string;
    discount: string;
    tax: string;
    notes: string;
    items: SaleItemForm[];
};

const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};
const statusLabels: Record<string, string> = { completed: 'Completada', cancelled: 'Cancelada', refunded: 'Reembolsada' };
const paymentLabels: Record<string, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };

export default function SalesIndex({ sales, products }: Props) {
    const [openCreate, setOpenCreate] = useState(false);

    const form = useForm<SaleForm>({
        customer_name: '', customer_email: '', payment_method: 'cash',
        discount: '0', tax: '0', notes: '',
        items: [{ product_id: '', quantity: '1', unit_price: '', discount: '0' }],
    });

    function addItem() {
        form.setData('items', [...form.data.items, { product_id: '', quantity: '1', unit_price: '', discount: '0' }]);
    }

    function removeItem(i: number) {
        form.setData('items', form.data.items.filter((_, idx) => idx !== i));
    }

    function updateItem(i: number, field: keyof SaleItemForm, value: string) {
        const items = [...form.data.items];
        items[i] = { ...items[i], [field]: value };
        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value);
            if (product) items[i].unit_price = product.sale_price;
        }
        form.setData('items', items);
    }

    const subtotal = form.data.items.reduce((sum, item) => {
        const line = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0) - (parseFloat(item.discount) || 0);
        return sum + line;
    }, 0);
    const globalDiscount = parseFloat(form.data.discount) || 0;
    const tax = parseFloat(form.data.tax) || 0;
    const total = subtotal - globalDiscount + tax;

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        form.post(admin.sales.store, {
            preserveScroll: true,
            onSuccess: () => { form.reset(); setOpenCreate(false); },
        });
    }

    function cancelSale(sale: Sale) {
        if (!confirm('¿Cancelar esta venta? Se restaurará el stock.')) return;
        router.post(admin.sales.cancel(sale.id), {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Ventas" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Ventas" description="Registro de ventas realizadas." variant="small" />
                    <Button onClick={() => setOpenCreate(true)} size="sm">
                        <Plus className="mr-2 size-4" /> Nueva venta
                    </Button>
                </div>

                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Referencia</th>
                                <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                <th className="px-4 py-3 text-left font-medium">Pago</th>
                                <th className="px-4 py-3 text-left font-medium">Vendedor</th>
                                <th className="px-4 py-3 text-right font-medium">Total</th>
                                <th className="px-4 py-3 text-center font-medium">Estado</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sales.map((s) => (
                                <tr key={s.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-mono text-xs">{s.reference}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        <div>{new Date(s.created_at).toLocaleDateString('es')}</div>
                                        <div className="text-xs">{new Date(s.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="px-4 py-3">{s.customer_name ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{paymentLabels[s.payment_method] ?? s.payment_method}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{s.user?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-medium">${s.total}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s.status]}`}>
                                            {statusLabels[s.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" asChild>
                                                <Link href={admin.sales.show(s.id)}>
                                                    <Eye className="size-4" />
                                                </Link>
                                            </Button>
                                            {s.status === 'completed' && (
                                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancelSale(s)}>
                                                    Cancelar
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sales.length === 0 && (
                                <tr>
                                        <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay ventas registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal nueva venta */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Nueva Venta</DialogTitle></DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Nombre del cliente</Label>
                                <div className="flex gap-2">
                                    <Input value={form.data.customer_name} onChange={e => form.setData('customer_name', e.target.value)} />
                                    <button
                                        type="button"
                                        onClick={() => form.setData('customer_name', 'Clientes Varios')}
                                        className="shrink-0 rounded-md border px-3 text-xs text-muted-foreground hover:bg-muted transition-colors"
                                    >
                                        Varios
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Email del cliente</Label>
                                <Input type="email" value={form.data.customer_email} onChange={e => form.setData('customer_email', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Método de pago *</Label>
                                <Select value={form.data.payment_method} onValueChange={v => form.setData('payment_method', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Efectivo</SelectItem>
                                        <SelectItem value="card">Tarjeta</SelectItem>
                                        <SelectItem value="transfer">Transferencia</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                            <th className="px-3 py-2 text-center">Cant.</th>
                                            <th className="px-3 py-2 text-right">Precio unit.</th>
                                            <th className="px-3 py-2 text-right">Desc. línea</th>
                                            <th className="px-3 py-2 text-right">Subtotal</th>
                                            <th className="px-3 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {form.data.items.map((item, i) => {
                                            const line = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0) - (parseFloat(item.discount) || 0);
                                            const selectedProduct = products.find(p => p.id.toString() === item.product_id);
                                            return (
                                                <tr key={i}>
                                                    <td className="px-3 py-2">
                                                        <Select value={item.product_id} onValueChange={v => updateItem(i, 'product_id', v)}>
                                                            <SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                            <SelectContent>
                                                                {products.map(p => (
                                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                                        {p.name} (stock: {p.stock})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="1" max={selectedProduct?.stock} className="text-center" value={item.quantity}
                                                            onChange={e => updateItem(i, 'quantity', e.target.value)} />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0" step="0.01" className="text-right" value={item.unit_price}
                                                            onChange={e => updateItem(i, 'unit_price', e.target.value)} />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input type="number" min="0" step="0.01" className="text-right" value={item.discount}
                                                            onChange={e => updateItem(i, 'discount', e.target.value)} />
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">${line.toFixed(2)}</td>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Notas</Label>
                                <Input value={form.data.notes} onChange={e => form.setData('notes', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex justify-between text-sm">
                                    <span>Descuento global ($)</span>
                                    <Input type="number" min="0" step="0.01" className="w-28 text-right" value={form.data.discount} onChange={e => form.setData('discount', e.target.value)} />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Impuesto ($)</span>
                                    <Input type="number" min="0" step="0.01" className="w-28 text-right" value={form.data.tax} onChange={e => form.setData('tax', e.target.value)} />
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
                            <Button type="submit" disabled={form.processing}>Registrar venta</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

SalesIndex.layout = () => ({
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Ventas', href: admin.sales.index },
    ],
});
