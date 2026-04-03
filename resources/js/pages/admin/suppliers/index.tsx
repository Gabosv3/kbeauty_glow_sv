import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { admin } from '@/lib/admin-routes';
import type { Supplier } from '@/types';

type Props = {
    suppliers: Supplier[];
};

type SupplierForm = {
    name: string;
    email: string;
    phone: string;
    contact_name: string;
    address: string;
    active: boolean;
};

const emptyForm: SupplierForm = { name: '', email: '', phone: '', contact_name: '', address: '', active: true };

export default function SuppliersIndex({ suppliers }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Supplier | null>(null);

    const createForm = useForm<SupplierForm>(emptyForm);
    const editForm = useForm<SupplierForm>(emptyForm);

    function openEdit(s: Supplier) {
        editForm.setData({
            name: s.name, email: s.email ?? '', phone: s.phone ?? '',
            contact_name: s.contact_name ?? '', address: s.address ?? '', active: s.active,
        });
        setEditTarget(s);
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(admin.suppliers.store, {
            preserveScroll: true,
            onSuccess: () => { createForm.reset(); setOpenCreate(false); },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(admin.suppliers.update(editTarget.id), {
            preserveScroll: true,
            onSuccess: () => setEditTarget(null),
        });
    }

    function deleteSupplier(s: Supplier) {
        if (!confirm(`¿Eliminar el proveedor "${s.name}"?`)) return;
        router.delete(admin.suppliers.destroy(s.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="Proveedores" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Proveedores" description="Empresas o personas de quienes compras productos." variant="small" />
                    <Button onClick={() => setOpenCreate(true)} size="sm">
                        <Plus className="mr-2 size-4" /> Nuevo proveedor
                    </Button>
                </div>

                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                                <th className="px-4 py-3 text-left font-medium">Contacto</th>
                                <th className="px-4 py-3 text-left font-medium">Email / Tel</th>
                                <th className="px-4 py-3 text-center font-medium">Compras</th>
                                <th className="px-4 py-3 text-center font-medium">Estado</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {suppliers.map((s) => (
                                <tr key={s.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{s.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{s.contact_name ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        <div>{s.email ?? '—'}</div>
                                        <div>{s.phone ?? '—'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">{s.purchases_count ?? 0}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant={s.active ? 'default' : 'secondary'}>
                                            {s.active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteSupplier(s)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay proveedores registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal crear */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Nuevo Proveedor</DialogTitle></DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <SupplierFields form={createForm} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
                            <Button type="submit" disabled={createForm.processing}>Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal editar */}
            <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Editar Proveedor</DialogTitle></DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <SupplierFields form={editForm} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
                            <Button type="submit" disabled={editForm.processing}>Actualizar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

function SupplierFields({ form }: { form: ReturnType<typeof useForm<SupplierForm>> }) {
    return (
        <>
            <div className="grid gap-2">
                <Label>Nombre *</Label>
                <Input value={form.data.name} onChange={e => form.setData('name', e.target.value)} required />
                {form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label>Teléfono</Label>
                    <Input value={form.data.phone} onChange={e => form.setData('phone', e.target.value)} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label>Nombre de contacto</Label>
                <Input value={form.data.contact_name} onChange={e => form.setData('contact_name', e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label>Dirección</Label>
                <Input value={form.data.address} onChange={e => form.setData('address', e.target.value)} />
            </div>
        </>
    );
}

SuppliersIndex.layout = () => ({
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Proveedores', href: admin.suppliers.index },
    ],
});
