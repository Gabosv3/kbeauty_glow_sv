import { Head } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import Heading from '@/components/heading';

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

                <DataTable
                    data={customers}
                    rowKey={(c) => c.id}
                    searchPlaceholder="Buscar por nombre, correo o teléfono…"
                    emptyMessage="Aún no hay clientes registrados."
                    extraSearch={(c) => [c.phone]}
                    columns={[
                        {
                            key: 'name',
                            header: 'Cliente',
                            value: (c) => c.name,
                            searchable: true,
                            cell: (c) => (
                                <>
                                    <p className="font-medium">{c.name}</p>
                                    <p className="text-xs text-muted-foreground">Desde {day(c.created_at)}</p>
                                </>
                            ),
                        },
                        {
                            key: 'email',
                            header: 'Contacto',
                            value: (c) => c.email,
                            searchable: true,
                            cell: (c) => (
                                <>
                                    <p>{c.email}</p>
                                    <p className="text-xs text-muted-foreground">{c.phone ?? '—'}</p>
                                </>
                            ),
                        },
                        { key: 'location', header: 'Ubicación', value: (c) => c.location, className: 'text-muted-foreground', cell: (c) => c.location || '—' },
                        { key: 'orders', header: 'Pedidos', align: 'center', value: (c) => c.orders_count },
                        { key: 'spent', header: 'Total gastado', align: 'right', value: (c) => c.total_spent, className: 'font-mono', cell: (c) => money(c.total_spent) },
                        {
                            key: 'last',
                            header: 'Último pedido',
                            value: (c) => (c.last_order_at ? new Date(c.last_order_at).getTime() : null),
                            className: 'text-muted-foreground',
                            cell: (c) => day(c.last_order_at),
                        },
                    ]}
                />
            </div>
        </>
    );
}
