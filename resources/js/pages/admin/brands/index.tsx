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
import type { Brand } from '@/types';

type Props = {
    brands: Brand[];
};

type BrandForm = {
    name: string;
    description: string;
    active: boolean;
};

const emptyForm: BrandForm = { name: '', description: '', active: true };

export default function BrandsIndex({ brands }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Brand | null>(null);

    const createForm = useForm<BrandForm>(emptyForm);
    const editForm = useForm<BrandForm>(emptyForm);

    function openEdit(brand: Brand) {
        editForm.setData({
            name: brand.name,
            description: brand.description ?? '',
            active: brand.active,
        });
        setEditTarget(brand);
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(admin.brands.store, {
            preserveScroll: true,
            onSuccess: () => { createForm.reset(); setOpenCreate(false); },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(admin.brands.update(editTarget.id), {
            preserveScroll: true,
            onSuccess: () => setEditTarget(null),
        });
    }

    function deleteBrand(brand: Brand) {
        if (!confirm(`¿Eliminar la marca "${brand.name}"?`)) return;
        router.delete(admin.brands.destroy(brand.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="Marcas" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Marcas" description="Gestiona las marcas de tus productos." variant="small" />
                    <Button onClick={() => setOpenCreate(true)} size="sm">
                        <Plus className="mr-2 size-4" /> Nueva marca
                    </Button>
                </div>

                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                                <th className="px-4 py-3 text-left font-medium">Descripción</th>
                                <th className="px-4 py-3 text-center font-medium">Estado</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {brands.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No hay marcas registradas.
                                    </td>
                                </tr>
                            )}
                            {brands.map((brand) => (
                                <tr key={brand.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{brand.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{brand.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant={brand.active ? 'default' : 'secondary'}>
                                            {brand.active ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => openEdit(brand)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive"
                                                onClick={() => deleteBrand(brand)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dialog: Nueva marca */}
            <Dialog open={openCreate} onOpenChange={(v) => { if (!v) { createForm.reset(); } setOpenCreate(v); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nueva marca</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Nombre *</Label>
                            <Input
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required
                                autoFocus
                            />
                            {createForm.errors.name && (
                                <p className="text-sm text-destructive">{createForm.errors.name}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label>Descripción</Label>
                            <Input
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                            />
                            {createForm.errors.description && (
                                <p className="text-sm text-destructive">{createForm.errors.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="create-active"
                                checked={createForm.data.active}
                                onCheckedChange={(v) => createForm.setData('active', !!v)}
                            />
                            <Label htmlFor="create-active">Activa</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { createForm.reset(); setOpenCreate(false); }}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog: Editar marca */}
            <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar marca</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Nombre *</Label>
                            <Input
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                                autoFocus
                            />
                            {editForm.errors.name && (
                                <p className="text-sm text-destructive">{editForm.errors.name}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label>Descripción</Label>
                            <Input
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                            />
                            {editForm.errors.description && (
                                <p className="text-sm text-destructive">{editForm.errors.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="edit-active"
                                checked={editForm.data.active}
                                onCheckedChange={(v) => editForm.setData('active', !!v)}
                            />
                            <Label htmlFor="edit-active">Activa</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
