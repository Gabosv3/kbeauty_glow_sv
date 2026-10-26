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
import { admin } from '@/lib/admin-routes';

type Coupon = {
    id: number;
    code: string;
    type: 'percent' | 'fixed';
    value: string;
    min_order: string;
    max_uses: number | null;
    used_count: number;
    starts_at: string | null;
    ends_at: string | null;
    active: boolean;
};

type CouponForm = {
    code: string;
    type: 'percent' | 'fixed';
    value: string;
    min_order: string;
    max_uses: string;
    starts_at: string;
    ends_at: string;
    active: boolean;
};

const empty: CouponForm = { code: '', type: 'percent', value: '', min_order: '', max_uses: '', starts_at: '', ends_at: '', active: true };
const day = (iso: string | null) => (iso ? iso.slice(0, 10) : '');
const selectClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

function describe(c: Coupon): string {
    return c.type === 'percent' ? `${Number(c.value)}% de descuento` : `$${Number(c.value).toFixed(2)} de descuento`;
}

function statusOf(c: Coupon): { label: string; active: boolean } {
    const now = Date.now();

    if (!c.active) {
        return { label: 'Inactivo', active: false };
    }

    if (c.ends_at && new Date(c.ends_at).getTime() < now) {
        return { label: 'Vencido', active: false };
    }

    if (c.max_uses !== null && c.used_count >= c.max_uses) {
        return { label: 'Agotado', active: false };
    }

    if (c.starts_at && new Date(c.starts_at).getTime() > now) {
        return { label: 'Programado', active: false };
    }

    return { label: 'Activo', active: true };
}

export default function CouponsIndex({ coupons }: Readonly<{ coupons: Coupon[] }>) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const form = useForm<CouponForm>(empty);

    function openCreate() {
        form.reset();
        form.clearErrors();
        setEditing(null);
        setOpen(true);
    }

    function openEdit(c: Coupon) {
        form.clearErrors();
        form.setData({
            code: c.code,
            type: c.type,
            value: String(Number(c.value)),
            min_order: Number(c.min_order) > 0 ? String(Number(c.min_order)) : '',
            max_uses: c.max_uses === null ? '' : String(c.max_uses),
            starts_at: day(c.starts_at),
            ends_at: day(c.ends_at),
            active: c.active,
        });
        setEditing(c);
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };

        if (editing) {
            form.put(admin.coupons.update(editing.id), options);
        } else {
            form.post(admin.coupons.store, options);
        }
    }

    function remove(c: Coupon) {
        if (confirm(`¿Eliminar el cupón "${c.code}"?`)) {
            router.delete(admin.coupons.destroy(c.id), { preserveScroll: true });
        }
    }

    const error = (key: keyof CouponForm) => form.errors[key] && <p className="text-sm text-destructive">{form.errors[key]}</p>;

    return (
        <>
            <Head title="Cupones" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Cupones" description="Códigos de descuento que tus clientes aplican en el checkout." variant="small" />
                    <Button onClick={openCreate} size="sm">
                        <Plus className="mr-2 size-4" /> Nuevo cupón
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Código</th>
                                <th className="px-4 py-3 text-left font-medium">Beneficio</th>
                                <th className="px-4 py-3 text-left font-medium">Vigencia</th>
                                <th className="px-4 py-3 text-center font-medium">Usos</th>
                                <th className="px-4 py-3 text-center font-medium">Estado</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Aún no hay cupones. Crea el primero.
                                    </td>
                                </tr>
                            )}
                            {coupons.map((c) => {
                                const status = statusOf(c);

                                return (
                                    <tr key={c.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                                        <td className="px-4 py-3">
                                            {describe(c)}
                                            {Number(c.min_order) > 0 && (
                                                <span className="block text-xs text-muted-foreground">Compra mínima ${Number(c.min_order).toFixed(2)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {c.starts_at || c.ends_at ? `${day(c.starts_at) || '—'} → ${day(c.ends_at) || '—'}` : 'Sin límite'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {c.used_count}
                                            {c.max_uses !== null && <span className="text-muted-foreground"> / {c.max_uses}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={status.active ? 'default' : 'secondary'}>{status.label}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => openEdit(c)} aria-label={`Editar ${c.code}`}>
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(c)} aria-label={`Eliminar ${c.code}`}>
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
                        <DialogTitle>{editing ? 'Editar cupón' : 'Nuevo cupón'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Código *</Label>
                            <Input
                                id="code"
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                placeholder="GLOW10"
                                className="font-mono"
                                required
                                autoFocus
                            />
                            {error('code')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo *</Label>
                                <select id="type" value={form.data.type} onChange={(e) => form.setData('type', e.target.value as CouponForm['type'])} className={selectClass}>
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
                                <Label htmlFor="min_order">Compra mínima ($)</Label>
                                <Input id="min_order" type="number" step="0.01" min="0" value={form.data.min_order} onChange={(e) => form.setData('min_order', e.target.value)} />
                                {error('min_order')}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="max_uses">Usos máximos</Label>
                                <Input id="max_uses" type="number" min="1" value={form.data.max_uses} onChange={(e) => form.setData('max_uses', e.target.value)} placeholder="Sin límite" />
                                {error('max_uses')}
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
