import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { LogOut, PackageSearch } from 'lucide-react';
import { authField, FieldError } from '@/components/store/auth-card';

interface Order {
    reference: string;
    status: string;
    total: number;
    items_count: number;
    created_at: string;
}

interface Profile {
    name: string;
    email: string;
    phone: string;
    department: string;
    municipality: string;
    address: string;
}

interface Props {
    orders: Order[];
    profile: Profile;
    departments: string[];
}

const STATUS: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700' },
    completed: { label: 'Completado', className: 'bg-emerald-50 text-emerald-700' },
    cancelled: { label: 'Cancelado', className: 'bg-red-50 text-red-600' },
};

export default function Account({ orders, profile, departments }: Readonly<Props>) {
    const { flash } = usePage<{ flash?: { success?: string | null } }>().props;
    const form = useForm({
        name: profile.name,
        phone: profile.phone,
        department: profile.department,
        municipality: profile.municipality,
        address: profile.address,
    });

    function save(e: React.FormEvent) {
        e.preventDefault();
        form.patch('/store/cuenta', { preserveScroll: true });
    }

    const set = (key: keyof typeof form.data) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        form.setData(key, e.target.value);

    return (
        <>
            <Head title="Mi cuenta — KBeauty Glow SV" />
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm text-brand-text/60">{profile.email}</p>
                        <h1 className="font-display text-4xl font-semibold text-brand-text">Hola, {profile.name.split(' ')[0]}</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post('/store/cuenta/logout')}
                        className="inline-flex items-center gap-2 rounded-full border border-brand-rose px-4 py-2 text-sm font-medium text-brand-text hover:bg-brand-cream-alt"
                    >
                        <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
                    <section className="rounded-3xl border border-brand-rose/60 bg-white p-6 sm:p-8">
                        <h2 className="font-display text-xl font-semibold text-brand-text">Mis pedidos</h2>
                        {orders.length === 0 ? (
                            <div className="py-12 text-center">
                                <PackageSearch className="mx-auto h-10 w-10 text-brand-gold" />
                                <p className="mt-3 text-sm text-brand-text/60">Aún no tienes pedidos.</p>
                                <Link href="/store/products" className="mt-4 inline-flex rounded-full bg-brand-text px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-dark">
                                    Ver catálogo
                                </Link>
                            </div>
                        ) : (
                            <ul className="mt-4 divide-y divide-brand-rose/50">
                                {orders.map((o) => {
                                    const status = STATUS[o.status] ?? { label: o.status, className: 'bg-gray-100 text-gray-600' };

                                    return (
                                        <li key={o.reference}>
                                            <Link href={`/store/pedido/${o.reference}`} className="flex items-center justify-between gap-4 py-4 hover:opacity-80">
                                                <div>
                                                    <p className="font-mono text-sm font-bold text-brand-text">{o.reference}</p>
                                                    <p className="text-xs text-brand-text/60">
                                                        {new Date(o.created_at).toLocaleDateString('es-SV', { dateStyle: 'medium' })} · {o.items_count} {o.items_count === 1 ? 'producto' : 'productos'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono text-sm font-bold">${o.total.toFixed(2)}</p>
                                                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    <form onSubmit={save} className="space-y-4 rounded-3xl border border-brand-rose/60 bg-white p-6">
                        <h2 className="font-display text-xl font-semibold text-brand-text">Mis datos de entrega</h2>
                        <div>
                            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Nombre</label>
                            <input id="name" required value={form.data.name} onChange={set('name')} className={authField} />
                            <FieldError message={form.errors.name} />
                        </div>
                        <div>
                            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Teléfono</label>
                            <input id="phone" required type="tel" value={form.data.phone} onChange={set('phone')} className={authField} />
                            <FieldError message={form.errors.phone} />
                        </div>
                        <div>
                            <label htmlFor="department" className="mb-1.5 block text-sm font-medium">Departamento</label>
                            <select id="department" value={form.data.department} onChange={set('department')} className={authField}>
                                <option value="">Selecciona…</option>
                                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <FieldError message={form.errors.department} />
                        </div>
                        <div>
                            <label htmlFor="municipality" className="mb-1.5 block text-sm font-medium">Municipio</label>
                            <input id="municipality" value={form.data.municipality} onChange={set('municipality')} className={authField} />
                        </div>
                        <div>
                            <label htmlFor="address" className="mb-1.5 block text-sm font-medium">Dirección</label>
                            <textarea id="address" rows={2} value={form.data.address} onChange={set('address')} className={authField} />
                        </div>
                        <button disabled={form.processing} className="w-full rounded-full bg-brand-text py-3 text-sm font-semibold text-white hover:bg-brand-gold-dark disabled:opacity-60">
                            Guardar datos
                        </button>
                        {flash?.success && <p className="text-center text-xs text-emerald-600">{flash.success}</p>}
                    </form>
                </div>
            </div>
        </>
    );
}
