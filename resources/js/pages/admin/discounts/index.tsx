import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOpenOnNew } from '@/hooks/use-open-on-new';
import { admin } from '@/lib/admin-routes';

type Option = { id: number; name: string };

type Discount = {
    id: number;
    name: string;
    scope: 'store' | 'category' | 'product';
    category_id: number | null;
    product_id: number | null;
    category?: Option | null;
    product?: Option | null;
    type: 'percent' | 'fixed';
    value: string;
    starts_at: string | null;
    ends_at: string | null;
    active: boolean;
};

type DiscountForm = {
    name: string;
    scope: Discount['scope'];
    category_id: string;
    product_id: string;
    type: Discount['type'];
    value: string;
    starts_at: string;
    ends_at: string;
    active: boolean;
};

const empty: DiscountForm = { name: '', scope: 'store', category_id: '', product_id: '', type: 'percent', value: '', starts_at: '', ends_at: '', active: true };
const day = (iso: string | null) => (iso ? iso.slice(0, 10) : '');
const selectClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

function target(d: Discount): string {
    if (d.scope === 'store') {
        return 'Toda la tienda';
    }

    return d.scope === 'category' ? `Categoría: ${d.category?.name ?? '—'}` : `Producto: ${d.product?.name ?? '—'}`;
}

function statusOf(d: Discount): { label: string; active: boolean } {
    const now = Date.now();

    if (!d.active) {
        return { label: 'Inactivo', active: false };
    }

    if (d.ends_at && new Date(d.ends_at).getTime() < now) {
        return { label: 'Vencido', active: false };
    }

    if (d.starts_at && new Date(d.starts_at).getTime() > now) {
        return { label: 'Programado', active: false };
    }

    return { label: 'Vigente', active: true };
}

type Props = { discounts: Discount[]; categories: Option[]; products: Option[] };

export default function DiscountsIndex({ discounts, categories, products }: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    useOpenOnNew(() => setOpen(true));
    const [editing, setEditing] = useState<Discount | null>(null);
    const form = useForm<DiscountForm>(empty);

    function openCreate() {
        form.reset();
        form.clearErrors();
        setEditing(null);
        setOpen(true);
    }

    function openEdit(d: Discount) {
        form.clearErrors();
        form.setData({
            name: d.name,
            scope: d.scope,
            category_id: d.category_id ? String(d.category_id) : '',
            product_id: d.product_id ? String(d.product_id) : '',
            type: d.type,
            value: String(Number(d.value)),
            starts_at: day(d.starts_at),
            ends_at: day(d.ends_at),
            active: d.active,
        });
        setEditing(d);
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };

        if (editing) {
            form.put(admin.discounts.update(editing.id), options);
        } else {
            form.post(admin.discounts.store, options);
        }
    }

    function remove(d: Discount) {
        if (confirm(`¿Eliminar el descuento "${d.name}"?`)) {
            router.delete(admin.discounts.destroy(d.id), { preserveScroll: true });
        }
    }

    const error = (key: keyof DiscountForm) => form.errors[key] && <p className="text-sm text-destructive">{form.errors[key]}</p>;

    return (
        <>
            <Head title="Descuentos" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Descuentos"
                        description="Rebajas automáticas por producto, categoría o toda la tienda. Si un producto tiene varias, se aplica la mayor."
                        variant="small"
                    />
                    <Button onClick={openCreate} size="sm">
                        <Plus className="mr-2 size-4" /> Nuevo descuento
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                                <th className="px-4 py-3 text-left font-medium">Aplica a</th>
                                <th className="px-4 py-3 text-left font-medium">Descuento</th>
                                <th className="px-4 py-3 text-left font-medium">Vigencia</th>
                                <th className="px-4 py-3 text-center font-medium">Estado</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {discounts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Aún no hay descuentos.
                                    </td>
                                </tr>
                            )}
                            {discounts.map((d) => {
                                const status = statusOf(d);

                                return (
                                    <tr key={d.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{d.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{target(d)}</td>
                                        <td className="px-4 py-3">{d.type === 'percent' ? `${Number(d.value)}%` : `$${Number(d.value).toFixed(2)}`}</td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {d.starts_at || d.ends_at ? `${day(d.starts_at) || '—'} → ${day(d.ends_at) || '—'}` : 'Sin límite'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={status.active ? 'default' : 'secondary'}>{status.label}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => openEdit(d)} aria-label={`Editar ${d.name}`}>
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(d)} aria-label={`Eliminar ${d.name}`}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Editar descuento' : 'Nuevo descuento'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Black Friday" required autoFocus />
                            {error('name')}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="scope">Aplica a *</Label>
                            <select id="scope" value={form.data.scope} onChange={(e) => form.setData('scope', e.target.value as Discount['scope'])} className={selectClass}>
                                <option value="store">Toda la tienda</option>
                                <option value="category">Una categoría</option>
                                <option value="product">Un producto</option>
                            </select>
                        </div>
                        {form.data.scope === 'category' && (
                            <div className="grid gap-2">
                                <Label htmlFor="category_id">Categoría *</Label>
                                <select id="category_id" value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value)} className={selectClass} required>
                                    <option value="">Selecciona…</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {error('category_id')}
                            </div>
                        )}
                        {form.data.scope === 'product' && (
                            <div className="grid gap-2">
                                <Label htmlFor="product_id">Producto *</Label>
                                <select id="product_id" value={form.data.product_id} onChange={(e) => form.setData('product_id', e.target.value)} className={selectClass} required>
                                    <option value="">Selecciona…</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {error('product_id')}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo *</Label>
                                <select id="type" value={form.data.type} onChange={(e) => form.setData('type', e.target.value as Discount['type'])} className={selectClass}>
                                    <option value="percent">Porcentaje (%)</option>
                                    <option value="fixed">Monto fijo ($)</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="value">Valor *</Label>
                                <Input id="value" type="number" step="0.01" min="0.01" value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} required />
                                {error('value')}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="starts_at">Desde</Label>
                                <Input id="starts_at" type="date" value={form.data.starts_at} onChange={(e) => form.setData('starts_at', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ends_at">Hasta</Label>
                                <Input id="ends_at" type="date" value={form.data.ends_at} onChange={(e) => form.setData('ends_at', e.target.value)} />
                                {error('ends_at')}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="active" checked={form.data.active} onCheckedChange={(v) => form.setData('active', !!v)} />
                            <Label htmlFor="active">Activo</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
