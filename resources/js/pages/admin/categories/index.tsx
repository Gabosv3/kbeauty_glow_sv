import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { admin } from '@/lib/admin-routes';
import type { Category } from '@/types';

type Props = {
    categories: Category[];
};

type CategoryForm = {
    name: string;
    description: string;
    active: boolean;
};

export default function CategoriesIndex({ categories }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);

    const createForm = useForm<CategoryForm>({ name: '', description: '', active: true });
    const editForm = useForm<CategoryForm>({ name: '', description: '', active: true });

    function openEdit(cat: Category) {
        editForm.setData({ name: cat.name, description: cat.description ?? '', active: cat.active });
        setEditTarget(cat);
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(admin.categories.store, {
            preserveScroll: true,
            onSuccess: () => { createForm.reset(); setOpenCreate(false); },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(admin.categories.update(editTarget.id), {
            preserveScroll: true,
            onSuccess: () => setEditTarget(null),
        });
    }

    function deleteCategory(cat: Category) {
        if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
        router.delete(admin.categories.destroy(cat.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="Categorías" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Categorías" description="Organiza tus productos por categorías." variant="small" />
                    <Button onClick={() => setOpenCreate(true)} size="sm">
                        <Plus className="mr-2 size-4" /> Nueva categoría
                    </Button>
                </div>

                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                                <th className="px-4 py-3 text-left font-medium">Descripción</th>
                                <th className="px-4 py-3 text-center font-medium">Productos</th>
                                <th className="px-4 py-3 text-center font-medium">Estado</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{cat.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-center">{cat.products_count ?? 0}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant={cat.active ? 'default' : 'secondary'}>
                                            {cat.active ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => openEdit(cat)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteCategory(cat)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay categorías registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal crear */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Categoría</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="c-name">Nombre *</Label>
                            <Input id="c-name" value={createForm.data.name} onChange={e => createForm.setData('name', e.target.value)} required />
                            {createForm.errors.name && <p className="text-sm text-destructive">{createForm.errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="c-desc">Descripción</Label>
                            <Input id="c-desc" value={createForm.data.description} onChange={e => createForm.setData('description', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
                            <Button type="submit" disabled={createForm.processing}>Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal editar */}
            <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Categoría</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="e-name">Nombre *</Label>
                            <Input id="e-name" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                            {editForm.errors.name && <p className="text-sm text-destructive">{editForm.errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="e-desc">Descripción</Label>
                            <Input id="e-desc" value={editForm.data.description} onChange={e => editForm.setData('description', e.target.value)} />
                        </div>
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

CategoriesIndex.layout = () => ({
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Categorías', href: admin.categories.index },
    ],
});
