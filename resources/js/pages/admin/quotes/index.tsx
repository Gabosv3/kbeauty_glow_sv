import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { STATUS_LABEL, money } from '@/components/admin/quote-document';
import type { Quote } from '@/components/admin/quote-document';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOpenOnNew } from '@/hooks/use-open-on-new';
import { admin } from '@/lib/admin-routes';

type Row = Quote & { items_count: number };
type Product = { id: number; name: string; sale_price: string; stock: number };
type Line = { product_id: string; quantity: string; unit_price: string };

const selectClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';
const emptyLine: Line = { product_id: '', quantity: '1', unit_price: '' };

export default function QuotesIndex({ quotes, products }: Readonly<{ quotes: Row[]; products: Product[] }>) {
    const [open, setOpen] = useState(false);
    useOpenOnNew(() => setOpen(true));
    const form = useForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        valid_until: '',
        discount: '',
        notes: '',
        items: [{ ...emptyLine }] as Line[],
    });

    const subtotal = form.data.items.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0);
    const total = Math.max(0, subtotal - (Number(form.data.discount) || 0));

    function setLine(index: number, patch: Partial<Line>) {
        form.setData('items', form.data.items.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    }

    function pickProduct(index: number, id: string) {
        const product = products.find((p) => String(p.id) === id);

        setLine(index, { product_id: id, unit_price: product ? Number(product.sale_price).toFixed(2) : '' });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(admin.quotes.store, { onSuccess: () => {
 setOpen(false); form.reset(); 
} });
    }

    const error = (key: string) => (form.errors as Record<string, string>)[key] && <p className="text-sm text-destructive">{(form.errors as Record<string, string>)[key]}</p>;

    return (
        <>
            <Head title="Cotizaciones" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Cotizaciones" description="Arma una cotización, descárgala en PDF o envíala por WhatsApp." variant="small" />
                    <Button size="sm" onClick={() => setOpen(true)}>
                        <Plus className="mr-2 size-4" /> Nueva cotización
                    </Button>
                </div>

                <DataTable
                    data={quotes}
                    rowKey={(q) => q.id}
                    searchPlaceholder="Buscar cotización..."
                    emptyMessage="Aún no hay cotizaciones."
                    columns={[
                        {
                            key: 'reference',
                            header: 'Referencia',
                            value: (q) => q.reference,
                            searchable: true,
                            className: 'font-mono font-semibold',
                            cell: (q) => (
                                <Link href={admin.quotes.show(q.id)} className="hover:underline">{q.reference}</Link>
                            ),
                        },
                        { key: 'customer', header: 'Cliente', value: (q) => q.customer_name, searchable: true },
                        {
                            key: 'date',
                            header: 'Fecha',
                            value: (q) => new Date(q.created_at).getTime(),
                            className: 'text-muted-foreground',
                            cell: (q) => new Date(q.created_at).toLocaleDateString('es-SV', { dateStyle: 'medium' }),
                        },
                        { key: 'items', header: 'Productos', align: 'center', value: (q) => q.items_count },
                        { key: 'total', header: 'Total', align: 'right', value: (q) => Number(q.total), className: 'font-mono', cell: (q) => money(q.total) },
                        {
                            key: 'status',
                            header: 'Estado',
                            align: 'center',
                            value: (q) => STATUS_LABEL[q.status],
                            searchable: true,
                            cell: (q) => <Badge variant={q.status === 'accepted' ? 'default' : 'secondary'}>{STATUS_LABEL[q.status]}</Badge>,
                        },
                    ]}
                />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Nueva cotización</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="customer_name">Cliente *</Label>
                                <Input id="customer_name" required value={form.data.customer_name} onChange={(e) => form.setData('customer_name', e.target.value)} />
                                {error('customer_name')}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customer_phone">Teléfono / WhatsApp</Label>
                                <Input id="customer_phone" type="tel" value={form.data.customer_phone} onChange={(e) => form.setData('customer_phone', e.target.value)} />
                                {error('customer_phone')}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customer_email">Correo</Label>
                                <Input id="customer_email" type="email" value={form.data.customer_email} onChange={(e) => form.setData('customer_email', e.target.value)} />
                                {error('customer_email')}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="valid_until">Válida hasta</Label>
                                <Input id="valid_until" type="date" value={form.data.valid_until} onChange={(e) => form.setData('valid_until', e.target.value)} />
                                {error('valid_until')}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Productos *</Label>
                            {form.data.items.map((line, i) => (
                                <div key={i} className="grid grid-cols-[1fr_4.5rem_6rem_2rem] items-center gap-2">
                                    <select aria-label="Producto" required value={line.product_id} onChange={(e) => pickProduct(i, e.target.value)} className={selectClass}>
                                        <option value="">Selecciona…</option>
                                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <Input aria-label="Cantidad" type="number" min={1} required value={line.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} />
                                    <Input aria-label="Precio" type="number" min={0} step="0.01" required value={line.unit_price} onChange={(e) => setLine(i, { unit_price: e.target.value })} />
                                    <Button type="button" variant="ghost" size="icon" disabled={form.data.items.length === 1} onClick={() => form.setData('items', form.data.items.filter((_, n) => n !== i))} aria-label="Quitar">
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                            {error('items')}
                            <Button type="button" variant="outline" size="sm" onClick={() => form.setData('items', [...form.data.items, { ...emptyLine }])}>
                                <Plus className="mr-2 size-4" /> Agregar producto
                            </Button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="discount">Descuento ($)</Label>
                                <Input id="discount" type="number" min={0} step="0.01" value={form.data.discount} onChange={(e) => form.setData('discount', e.target.value)} />
                            </div>
                            <div className="flex items-end justify-end text-right">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="font-mono text-2xl font-bold">{money(total)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas</Label>
                            <textarea id="notes" rows={2} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} className={`${selectClass} h-auto py-2`} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={form.processing}>{form.processing ? 'Creando…' : 'Crear cotización'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
