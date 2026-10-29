import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOpenOnNew } from '@/hooks/use-open-on-new';
import { admin } from '@/lib/admin-routes';

type Member = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
    deleted_at: string | null;
    created_at: string | null;
};

type Props = { members: Member[]; currentUserId: number };

type UserForm = { name: string; email: string; password: string; role: string };

const roleLabels: Record<string, string> = { owner: 'Propietario', admin: 'Administrador', member: 'Miembro' };
const selectClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';
const empty: UserForm = { name: '', email: '', password: '', role: 'member' };

export default function UsersIndex({ members, currentUserId }: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Member | null>(null);
    const [search, setSearch] = useState('');
    const [showDeleted, setShowDeleted] = useState(false);
    const form = useForm<UserForm>(empty);

    function openCreate() {
        form.reset();
        form.clearErrors();
        setEditing(null);
        setOpen(true);
    }

    useOpenOnNew(openCreate);

    function openEdit(m: Member) {
        form.clearErrors();
        form.setData({ name: m.name, email: m.email, password: '', role: m.role });
        setEditing(m);
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };

        if (editing) {
            form.put(admin.users.update(editing.id), options);
        } else {
            form.post(admin.users.store, options);
        }
    }

    function remove(m: Member) {
        if (confirm(`¿Eliminar a ${m.name}? Podrás restaurarlo después.`)) {
            router.delete(admin.users.destroy(m.id), { preserveScroll: true });
        }
    }

    const visible = useMemo(() => {
        const needle = search.trim().toLowerCase();

        return members.filter((m) => (showDeleted ? m.deleted_at !== null : m.deleted_at === null) && (!needle || `${m.name} ${m.email}`.toLowerCase().includes(needle)));
    }, [members, search, showDeleted]);

    const deletedCount = members.filter((m) => m.deleted_at).length;
    const error = (key: keyof UserForm) => form.errors[key] && <p className="text-sm text-destructive">{form.errors[key]}</p>;
    const isOwnerRow = editing?.role === 'owner' || editing?.id === currentUserId;

    return (
        <>
            <Head title="Usuarios" />
            <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading title="Usuarios" description="Personas con acceso al panel. Al eliminar un usuario no se pierde: puedes restaurarlo." variant="small" />
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="mr-2 size-4" /> Nuevo usuario
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o correo…" className="w-72 pl-9" />
                    </div>
                    <div className="inline-flex rounded-lg border p-0.5 text-sm">
                        <button type="button" onClick={() => setShowDeleted(false)} className={`rounded-md px-3 py-1.5 ${!showDeleted ? 'bg-accent font-medium' : 'text-muted-foreground'}`}>
                            Activos
                        </button>
                        <button type="button" onClick={() => setShowDeleted(true)} className={`rounded-md px-3 py-1.5 ${showDeleted ? 'bg-accent font-medium' : 'text-muted-foreground'}`}>
                            Eliminados{deletedCount > 0 && ` (${deletedCount})`}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Usuario</th>
                                <th className="px-4 py-3 text-left font-medium">Rol</th>
                                <th className="px-4 py-3 text-left font-medium">Creado</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {visible.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                        {showDeleted ? 'No hay usuarios eliminados.' : 'No se encontraron usuarios.'}
                                    </td>
                                </tr>
                            )}
                            {visible.map((m) => (
                                <tr key={m.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-9">
                                                <AvatarImage src={m.avatar ?? undefined} alt={m.name} />
                                                <AvatarFallback>{m.name.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {m.name} {m.id === currentUserId && <span className="text-xs text-muted-foreground">(tú)</span>}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={m.role === 'member' ? 'secondary' : 'default'}>{roleLabels[m.role] ?? m.role}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {m.created_at ? new Date(m.created_at).toLocaleDateString('es-SV', { dateStyle: 'medium' }) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            {m.deleted_at ? (
                                                <Button size="sm" variant="outline" onClick={() => router.post(admin.users.restore(m.id), {}, { preserveScroll: true })}>
                                                    <RotateCcw className="mr-2 size-4" /> Restaurar
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button size="icon" variant="ghost" onClick={() => openEdit(m)} aria-label={`Editar ${m.name}`}>
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    {m.role !== 'owner' && m.id !== currentUserId && (
                                                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(m)} aria-label={`Eliminar ${m.name}`}>
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input id="name" required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                            {error('name')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo *</Label>
                            <Input id="email" type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                            {error('email')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{editing ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</Label>
                            <Input id="password" type="password" required={!editing} minLength={8} autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                            {error('password')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Rol</Label>
                            <select id="role" value={form.data.role} disabled={isOwnerRow} onChange={(e) => form.setData('role', e.target.value)} className={selectClass}>
                                {isOwnerRow && editing?.role === 'owner' && <option value="owner">Propietario</option>}
                                <option value="admin">Administrador</option>
                                <option value="member">Miembro</option>
                            </select>
                            {error('role')}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={form.processing}>{form.processing ? 'Guardando…' : 'Guardar'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = () => ({
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Usuarios', href: admin.users.index },
    ],
});
