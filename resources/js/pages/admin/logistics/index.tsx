import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Printer, Trash2, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOpenOnNew } from '@/hooks/use-open-on-new';
import { admin } from '@/lib/admin-routes';

type Status = 'preparing' | 'shipped' | 'delivered' | 'returned';

type Shipment = {
    id: number;
    sale_id: number;
    carrier_id: number | null;
    tracking_number: string | null;
    status: Status;
    cost: string;
    ship_date: string | null;
    notes: string | null;
    created_at: string;
    carrier: { id: number; name: string; tracking_url: string | null } | null;
    sale: {
        id: number;
        reference: string;
        customer_name: string | null;
        customer_phone: string | null;
        delivery_department: string | null;
        delivery_municipality: string | null;
    };
};

type Carrier = {
    id: number;
    name: string;
    phone: string | null;
    tracking_url: string | null;
    shipping_price: string;
    notes: string | null;
    active: boolean;
    shipments_count: number;
};

type SaleOption = { id: number; reference: string; customer_name: string | null; delivery_department: string | null; total: string };

type Props = { shipments: Shipment[]; carriers: Carrier[]; sales: SaleOption[]; free_shipping_from: number };

type ShipmentForm = { sale_id: string; carrier_id: string; tracking_number: string; status: Status; ship_date: string; notes: string };
type CarrierForm = { name: string; phone: string; tracking_url: string; shipping_price: string; notes: string; active: boolean };

const STATUS: Record<Status, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    preparing: { label: 'Preparando', variant: 'secondary' },
    shipped: { label: 'Enviado', variant: 'default' },
    delivered: { label: 'Entregado', variant: 'outline' },
    returned: { label: 'Devuelto', variant: 'destructive' },
};

const emptyShipment: ShipmentForm = { sale_id: '', carrier_id: '', tracking_number: '', status: 'preparing', ship_date: '', notes: '' };
const emptyCarrier: CarrierForm = { name: '', phone: '', tracking_url: '', shipping_price: '', notes: '', active: true };

const selectClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';
const miniSelectClass = 'h-8 rounded-md border border-input bg-transparent px-1.5 text-xs font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';
const money = (n: number | string) => `$${Number(n).toFixed(2)}`;

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function mondayOf(d: Date): Date {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));

    return x;
}

function fmtDay(iso: string | null): string {
    if (!iso) {
        return '—';
    }

    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);

    return new Date(y, m - 1, d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function trackingLink(carrier: Shipment['carrier'], number: string | null): string | null {
    if (!carrier?.tracking_url || !number) {
        return null;
    }

    return carrier.tracking_url.includes('{guia}') ? carrier.tracking_url.replace('{guia}', encodeURIComponent(number)) : carrier.tracking_url;
}

const destination = (s: Shipment) => [s.sale.delivery_department, s.sale.delivery_municipality].filter(Boolean).join(' / ') || '—';

type Actions = {
    onStatus: (s: Shipment, status: Status) => void;
    onDate: (s: Shipment, date: string) => void;
    onEdit: (s: Shipment) => void;
};

function StatusSelect({ s, onStatus, className }: Readonly<{ s: Shipment; onStatus: Actions['onStatus']; className: string }>) {
    return (
        <select value={s.status} onChange={(e) => onStatus(s, e.target.value as Status)} aria-label="Estado del despacho" className={className}>
            {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                    {v.label}
                </option>
            ))}
        </select>
    );
}

function ShipCard({ s, onStatus, onDate, onEdit }: Readonly<{ s: Shipment } & Actions>) {
    return (
        <li className="rounded-xl border bg-background p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate font-semibold">{s.sale.customer_name || 'Sin nombre'}</p>
                    <p className="font-mono text-xs text-muted-foreground">{s.sale.reference}</p>
                </div>
                <StatusSelect s={s} onStatus={onStatus} className={`${miniSelectClass} shrink-0`} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{destination(s)}</p>
            {s.tracking_number && <p className="mt-0.5 font-mono text-xs text-muted-foreground">Guía {s.tracking_number}</p>}
            <div className="mt-2 flex items-center gap-1">
                <input
                    type="date"
                    value={s.ship_date ?? ''}
                    onChange={(e) => onDate(s, e.target.value)}
                    aria-label="Día de envío"
                    className="h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-xs"
                />
                <Button asChild size="icon" variant="ghost" className="size-8">
                    <a href={admin.logistics.label(s.id)} target="_blank" rel="noreferrer" aria-label="Imprimir etiqueta">
                        <Printer className="size-4" />
                    </a>
                </Button>
                <Button size="icon" variant="ghost" className="size-8" onClick={() => onEdit(s)} aria-label="Editar despacho">
                    <Pencil className="size-4" />
                </Button>
            </div>
        </li>
    );
}

/** Calendario semanal: lunes a domingo, y en cada día los paquetes agrupados por paquetera. */
function WeekPlanner({ shipments, ...actions }: Readonly<{ shipments: Shipment[] } & Actions>) {
    const [monday, setMonday] = useState(() => mondayOf(new Date()));
    const days = useMemo(
        () =>
            Array.from({ length: 7 }, (_, i) => {
                const d = new Date(monday);
                d.setDate(d.getDate() + i);

                return d;
            }),
        [monday],
    );
    const today = ymd(new Date());

    function shift(weeks: number) {
        setMonday((m) => {
            const d = new Date(m);
            d.setDate(d.getDate() + weeks * 7);

            return d;
        });
    }

    const rangeLabel = `${days[0].toLocaleDateString('es', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    const byDay = useMemo(() => {
        const map: Record<string, Shipment[]> = {};

        shipments.forEach((s) => {
            (map[s.ship_date ?? ''] ??= []).push(s);
        });

        return map;
    }, [shipments]);

    const pending = (byDay[''] ?? []).filter((s) => s.status !== 'delivered');

    function groupByCarrier(list: Shipment[]): [string, Shipment[]][] {
        const groups: Record<string, Shipment[]> = {};

        list.forEach((s) => {
            (groups[s.carrier?.name ?? 'Sin paquetera'] ??= []).push(s);
        });

        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="Semana anterior">
                    <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" onClick={() => setMonday(mondayOf(new Date()))}>
                    Esta semana
                </Button>
                <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="Semana siguiente">
                    <ChevronRight className="size-4" />
                </Button>
                <p className="ml-1 text-sm font-semibold">{rangeLabel}</p>
            </div>

            {pending.length > 0 && (
                <section className="mb-5 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                    <h3 className="mb-3 text-xs font-bold tracking-widest text-amber-800 uppercase dark:text-amber-300">Sin día de envío ({pending.length})</h3>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {pending.map((s) => (
                            <ShipCard key={s.id} s={s} {...actions} />
                        ))}
                    </ul>
                </section>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {days.map((d, i) => {
                    const key = ymd(d);
                    const list = byDay[key] ?? [];

                    return (
                        <section key={key} className={`min-w-0 rounded-xl border p-4 ${key === today ? 'border-foreground' : ''}`}>
                            <h3 className="mb-3 flex items-baseline justify-between gap-2">
                                <span className="font-black uppercase">{DAY_NAMES[i]}</span>
                                <span className="text-xs text-muted-foreground">
                                    {d.getDate()}/{d.getMonth() + 1}
                                    {list.length ? ` · ${list.length}` : ''}
                                </span>
                            </h3>
                            {list.length === 0 ? (
                                <p className="py-4 text-center text-xs text-muted-foreground">Sin envíos</p>
                            ) : (
                                <div className="space-y-3">
                                    {groupByCarrier(list).map(([carrier, items]) => (
                                        <div key={carrier}>
                                            <p className="mb-1.5 text-[11px] font-bold tracking-wider text-primary uppercase">
                                                {carrier} · {items.length}
                                            </p>
                                            <ul className="space-y-2">
                                                {items.map((s) => (
                                                    <ShipCard key={s.id} s={s} {...actions} />
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}

const TABS = [
    ['planner', 'Planificador semanal'],
    ['despachos', 'Despachos'],
    ['paqueteras', 'Paqueteras'],
] as const;

type Tab = (typeof TABS)[number][0];

export default function LogisticsIndex({ shipments, carriers, sales, free_shipping_from }: Readonly<Props>) {
    const [tab, setTab] = useState<Tab>('planner');
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    const [shipmentOpen, setShipmentOpen] = useState(false);
    const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
    const shipmentForm = useForm<ShipmentForm>(emptyShipment);

    const [carrierOpen, setCarrierOpen] = useState(false);
    const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
    const carrierForm = useForm<CarrierForm>(emptyCarrier);

    useOpenOnNew(() => {
        setTab('despachos');
        setShipmentOpen(true);
    });

    // Costo del envío: gratis desde el mínimo de Ajustes; si no, el precio de la paquetera.
    const shippingCost = useMemo(() => {
        const sale = sales.find((o) => String(o.id) === shipmentForm.data.sale_id);
        const carrier = carriers.find((c) => String(c.id) === shipmentForm.data.carrier_id);

        if (!sale && !editingShipment) {
            return 'Elige la venta y la paquetera para calcularlo.';
        }

        const total = sale ? Number(sale.total) : null;

        if (total !== null && free_shipping_from > 0 && total >= free_shipping_from) {
            return `Gratis: la venta llega a ${money(free_shipping_from)}.`;
        }

        if (!carrier) {
            return 'Elige la paquetera para calcularlo.';
        }

        return Number(carrier.shipping_price) ? `${money(carrier.shipping_price)} (precio de ${carrier.name}).` : `${carrier.name} no tiene precio: ponlo en Paqueteras.`;
    }, [sales, carriers, shipmentForm.data.sale_id, shipmentForm.data.carrier_id, free_shipping_from, editingShipment]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        return shipments.filter((s) => {
            if (statusFilter && s.status !== statusFilter) {
                return false;
            }

            if (!q) {
                return true;
            }

            return [s.sale.customer_name, s.sale.customer_phone, s.sale.reference, s.tracking_number, s.carrier?.name].some((v) => v?.toLowerCase().includes(q));
        });
    }, [shipments, statusFilter, search]);

    // ---------- despachos ----------
    function openNewShipment() {
        shipmentForm.reset();
        shipmentForm.clearErrors();
        setEditingShipment(null);
        setShipmentOpen(true);
    }

    function openEditShipment(s: Shipment) {
        shipmentForm.clearErrors();
        shipmentForm.setData({
            sale_id: String(s.sale_id),
            carrier_id: s.carrier_id ? String(s.carrier_id) : '',
            tracking_number: s.tracking_number ?? '',
            status: s.status,
            ship_date: s.ship_date ?? '',
            notes: s.notes ?? '',
        });
        setEditingShipment(s);
        setShipmentOpen(true);
    }

    function submitShipment(e: React.FormEvent) {
        e.preventDefault();

        const options = { preserveScroll: true, onSuccess: () => setShipmentOpen(false) };

        if (editingShipment) {
            shipmentForm.put(admin.logistics.shipmentUpdate(editingShipment.id), options);
        } else {
            shipmentForm.post(admin.logistics.shipmentsStore, options);
        }
    }

    function changeStatus(s: Shipment, status: Status) {
        router.post(admin.logistics.shipmentStatus(s.id), { status }, { preserveScroll: true });
    }

    function changeDate(s: Shipment, ship_date: string) {
        router.post(admin.logistics.shipmentDate(s.id), { ship_date: ship_date || null }, { preserveScroll: true });
    }

    function removeShipment(s: Shipment) {
        if (confirm(`¿Eliminar el despacho de ${s.sale.customer_name || s.sale.reference}? La venta no se borra.`)) {
            router.delete(admin.logistics.shipmentDestroy(s.id), { preserveScroll: true });
        }
    }

    // ---------- paqueteras ----------
    function openNewCarrier() {
        carrierForm.reset();
        carrierForm.clearErrors();
        setEditingCarrier(null);
        setCarrierOpen(true);
    }

    function openEditCarrier(c: Carrier) {
        carrierForm.clearErrors();
        carrierForm.setData({
            name: c.name,
            phone: c.phone ?? '',
            tracking_url: c.tracking_url ?? '',
            shipping_price: Number(c.shipping_price) > 0 ? String(Number(c.shipping_price)) : '',
            notes: c.notes ?? '',
            active: c.active,
        });
        setEditingCarrier(c);
        setCarrierOpen(true);
    }

    function submitCarrier(e: React.FormEvent) {
        e.preventDefault();

        const options = { preserveScroll: true, onSuccess: () => setCarrierOpen(false) };

        if (editingCarrier) {
            carrierForm.put(admin.logistics.carrierUpdate(editingCarrier.id), options);
        } else {
            carrierForm.post(admin.logistics.carriersStore, options);
        }
    }

    function removeCarrier(c: Carrier) {
        if (confirm(`¿Eliminar la paquetera "${c.name}"? Sus despachos quedarán sin paquetera.`)) {
            router.delete(admin.logistics.carrierDestroy(c.id), { preserveScroll: true });
        }
    }

    const shipmentError = (key: keyof ShipmentForm) => shipmentForm.errors[key] && <p className="text-sm text-destructive">{shipmentForm.errors[key]}</p>;
    const carrierError = (key: keyof CarrierForm) => carrierForm.errors[key] && <p className="text-sm text-destructive">{carrierForm.errors[key]}</p>;

    const actions: Actions = { onStatus: changeStatus, onDate: changeDate, onEdit: openEditShipment };

    // Al editar, la venta ya no está en la lista de pendientes: se muestra la del despacho.
    const saleOptions: SaleOption[] = editingShipment
        ? [{ id: editingShipment.sale_id, reference: editingShipment.sale.reference, customer_name: editingShipment.sale.customer_name, delivery_department: editingShipment.sale.delivery_department, total: '0' }]
        : sales;

    return (
        <>
            <Head title="Logística" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Logística" description="Despachos de tus ventas a los clientes, por paquetera y por día." variant="small" />
                    {tab === 'paqueteras' ? (
                        <Button onClick={openNewCarrier} size="sm">
                            <Plus className="mr-2 size-4" /> Nueva paquetera
                        </Button>
                    ) : (
                        <Button onClick={openNewShipment} size="sm">
                            <Truck className="mr-2 size-4" /> Nuevo despacho
                        </Button>
                    )}
                </div>

                <div className="inline-flex flex-wrap rounded-xl border p-1" role="tablist">
                    {TABS.map(([key, label]) => (
                        <button
                            key={key}
                            role="tab"
                            aria-selected={tab === key}
                            onClick={() => setTab(key)}
                            className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${tab === key ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {key === 'despachos' ? `${label} (${shipments.length})` : key === 'paqueteras' ? `${label} (${carriers.length})` : label}
                        </button>
                    ))}
                </div>

                {tab === 'planner' && <WeekPlanner shipments={shipments} {...actions} />}

                {tab === 'despachos' && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por cliente, teléfono o guía…" className="max-w-xs" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrar por estado" className={`${selectClass} w-auto`}>
                                <option value="">Todos los estados</option>
                                {Object.entries(STATUS).map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {v.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Venta</th>
                                        <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                        <th className="px-4 py-3 text-left font-medium">Destino</th>
                                        <th className="px-4 py-3 text-left font-medium">Paquetera</th>
                                        <th className="px-4 py-3 text-left font-medium">Guía</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-right font-medium">Costo</th>
                                        <th className="px-4 py-3 text-left font-medium">Envío</th>
                                        <th className="px-4 py-3 text-right font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                                {shipments.length === 0 ? 'Todavía no hay despachos. Crea el primero.' : 'Ningún despacho coincide con la búsqueda.'}
                                            </td>
                                        </tr>
                                    )}
                                    {filtered.map((s) => {
                                        const link = trackingLink(s.carrier, s.tracking_number);

                                        return (
                                            <tr key={s.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3 font-mono text-xs">{s.sale.reference}</td>
                                                <td className="px-4 py-3">
                                                    <span className="block font-semibold">{s.sale.customer_name || 'Sin nombre'}</span>
                                                    {s.sale.customer_phone && <span className="block text-xs text-muted-foreground">{s.sale.customer_phone}</span>}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{destination(s)}</td>
                                                <td className="px-4 py-3">{s.carrier?.name ?? <span className="text-muted-foreground">Sin asignar</span>}</td>
                                                <td className="px-4 py-3 font-mono text-xs">
                                                    {s.tracking_number ? (
                                                        link ? (
                                                            <a href={link} target="_blank" rel="noopener noreferrer" className="underline">
                                                                {s.tracking_number}
                                                            </a>
                                                        ) : (
                                                            s.tracking_number
                                                        )
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusSelect s={s} onStatus={changeStatus} className={miniSelectClass} />
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono">{Number(s.cost) ? money(s.cost) : 'Gratis'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{fmtDay(s.ship_date)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button asChild size="icon" variant="ghost">
                                                            <a href={admin.logistics.label(s.id)} target="_blank" rel="noreferrer" aria-label="Imprimir etiqueta">
                                                                <Printer className="size-4" />
                                                            </a>
                                                        </Button>
                                                        <Button size="icon" variant="ghost" onClick={() => openEditShipment(s)} aria-label="Editar despacho">
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeShipment(s)} aria-label="Eliminar despacho">
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
                )}

                {tab === 'paqueteras' && (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Paquetera</th>
                                    <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                                    <th className="px-4 py-3 text-center font-medium">Despachos</th>
                                    <th className="px-4 py-3 text-right font-medium">Precio envío</th>
                                    <th className="px-4 py-3 text-left font-medium">Seguimiento</th>
                                    <th className="px-4 py-3 text-center font-medium">Estado</th>
                                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {carriers.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                            Todavía no hay paqueteras. Agrega la primera.
                                        </td>
                                    </tr>
                                )}
                                {carriers.map((c) => (
                                    <tr key={c.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-semibold">{c.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{c.phone || '—'}</td>
                                        <td className="px-4 py-3 text-center">{c.shipments_count}</td>
                                        <td className="px-4 py-3 text-right font-mono">{money(c.shipping_price)}</td>
                                        <td className="max-w-xs px-4 py-3 text-xs break-all text-muted-foreground">{c.tracking_url || '—'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'Activa' : 'Inactiva'}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" onClick={() => openEditCarrier(c)} aria-label={`Editar ${c.name}`}>
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeCarrier(c)} aria-label={`Eliminar ${c.name}`}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog open={shipmentOpen} onOpenChange={setShipmentOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingShipment ? 'Editar despacho' : 'Nuevo despacho'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitShipment} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sale_id">Venta a despachar *</Label>
                            <select
                                id="sale_id"
                                required
                                disabled={!!editingShipment}
                                value={shipmentForm.data.sale_id}
                                onChange={(e) => shipmentForm.setData('sale_id', e.target.value)}
                                className={selectClass}
                            >
                                <option value="">Elige una venta…</option>
                                {saleOptions.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.reference} · {o.customer_name || 'Sin nombre'}
                                        {o.delivery_department ? ` · ${o.delivery_department}` : ''}
                                        {editingShipment ? '' : ` · ${money(o.total)}`}
                                    </option>
                                ))}
                            </select>
                            {shipmentError('sale_id')}
                            {!editingShipment && sales.length === 0 && <p className="text-xs text-muted-foreground">No hay ventas pendientes de despacho.</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="carrier_id">Paquetera</Label>
                            <select id="carrier_id" value={shipmentForm.data.carrier_id} onChange={(e) => shipmentForm.setData('carrier_id', e.target.value)} className={selectClass}>
                                <option value="">Sin asignar</option>
                                {carriers
                                    .filter((c) => c.active || String(c.id) === shipmentForm.data.carrier_id)
                                    .map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                            </select>
                            {shipmentError('carrier_id')}
                            <p className="text-xs text-muted-foreground">Costo del envío: {shippingCost}</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tracking_number">Número de guía</Label>
                            <Input id="tracking_number" value={shipmentForm.data.tracking_number} onChange={(e) => shipmentForm.setData('tracking_number', e.target.value)} placeholder="Opcional" />
                            {shipmentError('tracking_number')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Estado</Label>
                                <select id="status" value={shipmentForm.data.status} onChange={(e) => shipmentForm.setData('status', e.target.value as Status)} className={selectClass}>
                                    {Object.entries(STATUS).map(([k, v]) => (
                                        <option key={k} value={k}>
                                            {v.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ship_date">Día de envío</Label>
                                <Input id="ship_date" type="date" value={shipmentForm.data.ship_date} onChange={(e) => shipmentForm.setData('ship_date', e.target.value)} />
                                {shipmentError('ship_date')}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="shipment_notes">Notas</Label>
                            <Input id="shipment_notes" value={shipmentForm.data.notes} onChange={(e) => shipmentForm.setData('notes', e.target.value)} />
                            {shipmentError('notes')}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShipmentOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={shipmentForm.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={carrierOpen} onOpenChange={setCarrierOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCarrier ? 'Editar paquetera' : 'Nueva paquetera'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCarrier} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="carrier_name">Nombre *</Label>
                            <Input id="carrier_name" value={carrierForm.data.name} onChange={(e) => carrierForm.setData('name', e.target.value)} placeholder="Ej. Cargo Express" required autoFocus />
                            {carrierError('name')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="carrier_phone">Teléfono</Label>
                                <Input id="carrier_phone" value={carrierForm.data.phone} onChange={(e) => carrierForm.setData('phone', e.target.value)} />
                                {carrierError('phone')}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="shipping_price">Precio del envío ($)</Label>
                                <Input id="shipping_price" type="number" step="0.01" min="0" value={carrierForm.data.shipping_price} onChange={(e) => carrierForm.setData('shipping_price', e.target.value)} placeholder="0.00" />
                                {carrierError('shipping_price')}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tracking_url">Enlace de seguimiento</Label>
                            <Input id="tracking_url" value={carrierForm.data.tracking_url} onChange={(e) => carrierForm.setData('tracking_url', e.target.value)} placeholder="https://sitio.com/rastreo?guia={guia}" />
                            <p className="text-xs text-muted-foreground">Usa {'{guia}'} donde va el número de guía.</p>
                            {carrierError('tracking_url')}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="carrier_notes">Notas</Label>
                            <Input id="carrier_notes" value={carrierForm.data.notes} onChange={(e) => carrierForm.setData('notes', e.target.value)} />
                            {carrierError('notes')}
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="carrier_active" checked={carrierForm.data.active} onCheckedChange={(v) => carrierForm.setData('active', !!v)} />
                            <Label htmlFor="carrier_active">Activa</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCarrierOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={carrierForm.processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
