import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import { Input } from '@/components/ui/input';

type Customer = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    location: string;
    orders_count: number;
    total_spent: number;
    last_order_at: string | null;
    created_at: string;
};

type Props = {
    customers: Customer[];
    stats: { total: number; buyers: number; revenue: number };
};

const money = (n: number) => `$${n.toFixed(2)}`;
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-SV', { dateStyle: 'medium' }) : '—');

export default function CustomersIndex({ customers, stats }: Readonly<Props>) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();

        return needle
            ? customers.filter((c) => `${c.name} ${c.email} ${c.phone ?? ''}`.toLowerCase().includes(needle))
            : customers;
    }, [customers, search]);

    const cards = [
        { label: 'Clientes registrados', value: String(stats.total) },
        { label: 'Con al menos un pedido', value: String(stats.buyers) },
        { label: 'Ventas de clientes', value: money(stats.revenue) },
    ];

    return (
        <>
            <Head title="Clientes" />
            <div className="space-y-6 p-6">
                <Heading title="Clientes" description="Personas que crearon una cuenta en la tienda y lo que han comprado." variant="small" />

                <div className="grid gap-4 sm:grid-cols-3">
                    {cards.map((c) => (
                        <div key={c.label} className="rounded-lg border p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                            <p className="mt-1 font-mono text-2xl font-bold">{c.value}</p>
                        </div>
                    ))}
                </div>

                <Input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, correo o teléfono…"
                    className="max-w-sm"
                />

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                <th className="px-4 py-3 text-left font-medium">Contacto</th>
                                <th className="px-4 py-3 text-left font-medium">Ubicación</th>
                                <th className="px-4 py-3 text-center font-medium">Pedidos</th>
                                <th className="px-4 py-3 text-right font-medium">Total gastado</th>
                                <th className="px-4 py-3 text-left font-medium">Último pedido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        {customers.length === 0 ? 'Aún no hay clientes registrados.' : 'Sin resultados.'}
                                    </td>
                                </tr>
                            )}
                            {filtered.map((c) => (
                                <tr key={c.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{c.name}</p>
                                        <p className="text-xs text-muted-foreground">Desde {day(c.created_at)}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p>{c.email}</p>
                                        <p className="text-xs text-muted-foreground">{c.phone ?? '—'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.location || '—'}</td>
                                    <td className="px-4 py-3 text-center">{c.orders_count}</td>
                                    <td className="px-4 py-3 text-right font-mono">{money(c.total_spent)}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{day(c.last_order_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
