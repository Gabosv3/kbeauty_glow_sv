import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type LabelItem = { qty: number; name: string; unit: number; subtotal: number };

type Label = {
    folio: string;
    date: string | null;
    customer: string | null;
    phone: string | null;
    point: string;
    ship_date: string | null;
    carrier: string | null;
    tracking: string | null;
    items: LabelItem[];
    shipping: number;
    total: number;
};

type LabelStore = { name: string; whatsapp: string };

// Tamaños de etiqueta térmica (ancho × alto en mm). El primero es el más usado en paquetería.
const SIZES = {
    '100x150': { label: '10 × 15 cm', hint: 'La más usada en paquetería', w: 100, h: 150 },
    '100x100': { label: '10 × 10 cm', hint: 'Más compacta', w: 100, h: 100 },
    '100x50': { label: '10 × 5 cm', hint: 'Pequeña, solo lo esencial', w: 100, h: 50 },
} as const;

type SizeKey = keyof typeof SIZES;

const STORAGE_KEY = 'kbeauty_label_size';

const money = (n: number) => `$${n.toFixed(2)}`;

function longDay(iso: string | null): string {
    if (!iso) {
        return 'Por coordinar';
    }

    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    const text = new Date(y, m - 1, d).toLocaleDateString('es', { weekday: 'long' });

    return `${text.charAt(0).toUpperCase()}${text.slice(1)} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

function initialSize(): SizeKey {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        return saved && saved in SIZES ? (saved as SizeKey) : '100x150';
    } catch {
        return '100x150';
    }
}

function Field({ label, value, className = '', big = false }: Readonly<{ label: string; value: string; className?: string; big?: boolean }>) {
    return (
        <div className={className}>
            <p className="text-[6pt] font-bold tracking-wide text-slate-600 uppercase">{label}</p>
            <p className={`font-bold break-words ${big ? 'text-[13pt] leading-tight' : 'text-[9pt] leading-snug'}`}>{value || '—'}</p>
        </div>
    );
}

function LabelSheet({ label, store, size }: Readonly<{ label: Label; store: LabelStore; size: SizeKey }>) {
    const { w, h } = SIZES[size];
    const compact = h <= 60;
    const tall = h >= 140;
    const carrier = label.carrier || 'Sin asignar';
    const day = longDay(label.ship_date);

    return (
        <div
            className="flex flex-col overflow-hidden border border-slate-300 bg-white text-slate-900 print:border-0"
            style={{ width: `${w}mm`, height: `${h}mm`, padding: compact ? '3mm' : '5mm' }}
        >
            <header className="flex items-end justify-between border-b-2 border-slate-900 pb-1">
                <p className={`font-black uppercase ${compact ? 'text-[9pt]' : tall ? 'text-[16pt]' : 'text-[13pt]'}`}>{store.name}</p>
                <div className="text-right">
                    <p className={`font-bold ${compact ? 'text-[8pt]' : 'text-[11pt]'}`}>{label.folio}</p>
                    {!compact && label.date && <p className="text-[7pt] text-slate-600">{label.date}</p>}
                </div>
            </header>

            {compact ? (
                <div className="mt-1 flex min-h-0 flex-1 gap-2">
                    <div className="w-[58%] space-y-0.5">
                        <Field label="Cliente" value={label.customer ?? ''} />
                        <Field label="Teléfono" value={label.phone ?? ''} />
                        <Field label="Punto" value={label.point} />
                        <Field label="Envío" value={day} />
                    </div>
                    <div className="flex flex-1 flex-col border-l border-slate-400 pl-2">
                        <Field label="Paquetera" value={carrier} />
                        <ul className="mt-1 text-[6pt] leading-tight">
                            {label.items.slice(0, 2).map((i) => (
                                <li key={i.name} className="truncate">
                                    {i.qty}x {i.name}
                                </li>
                            ))}
                            {label.items.length > 2 && <li className="text-slate-600">+{label.items.length - 2} más</li>}
                        </ul>
                        <div className="mt-auto rounded border-2 border-slate-900 px-1.5 py-1">
                            <p className="text-[5.5pt] font-bold text-slate-600">A COBRAR</p>
                            <p className="text-right text-[14pt] leading-none font-black">{money(label.total)}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mt-2 space-y-1.5">
                        <Field label="Cliente" value={label.customer ?? ''} big={tall} />
                        <div className="grid grid-cols-2 gap-2">
                            <Field label="Teléfono" value={label.phone ?? ''} />
                            <Field label="Paquetera" value={carrier} />
                        </div>
                        <Field label="Punto de entrega" value={label.point} />
                        <Field label="Día de envío" value={day} />
                        {label.tracking && <Field label="Guía" value={label.tracking} />}
                    </div>

                    <table className="mt-2 w-full border-t border-slate-900 text-[8pt]">
                        <thead>
                            <tr className="border-b border-slate-900 text-[5.8pt] text-slate-600 uppercase">
                                <th className="py-1 text-left">Cant.</th>
                                <th className="py-1 text-left">Producto</th>
                                <th className="py-1 text-right">V. unit.</th>
                                <th className="py-1 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {label.items.slice(0, tall ? 8 : 4).map((i) => (
                                <tr key={i.name} className="border-b border-slate-300 align-top">
                                    <td className="py-0.5 font-bold">{i.qty}</td>
                                    <td className="py-0.5 pr-1">{i.name}</td>
                                    <td className="py-0.5 text-right">{money(i.unit)}</td>
                                    <td className="py-0.5 text-right font-bold">{money(i.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {label.items.length > (tall ? 8 : 4) && (
                        <p className="mt-0.5 text-[6.5pt] text-slate-600">+ {label.items.length - (tall ? 8 : 4)} productos más</p>
                    )}

                    <div className="mt-auto">
                        <div className="flex justify-end gap-3 pb-1 text-[8.5pt]">
                            <span className="text-slate-600">Envío</span>
                            <span className="font-bold">{label.shipping ? money(label.shipping) : 'Gratis'}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md border-2 border-slate-900 px-3 py-1.5">
                            <span className={`font-black ${tall ? 'text-[11pt]' : 'text-[9.5pt]'}`}>A COBRAR</span>
                            <span className={`font-black ${tall ? 'text-[20pt]' : 'text-[16pt]'}`}>{money(label.total)}</span>
                        </div>
                        {store.whatsapp && <p className="mt-1 text-center text-[6.5pt] text-slate-600">¡Gracias por preferirnos! · Contáctenos: +{store.whatsapp}</p>}
                    </div>
                </>
            )}
        </div>
    );
}

export default function LogisticsLabel({ label, store }: Readonly<{ label: Label; store: LabelStore }>) {
    const [size, setSize] = useState<SizeKey>(initialSize);

    function pick(next: SizeKey) {
        setSize(next);

        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // sin almacenamiento
        }
    }

    return (
        <>
            <Head title={`Etiqueta ${label.folio}`} />
            {/* El tamaño exacto de la hoja evita que la impresora de etiquetas recorte o escale. */}
            <style>{`@media print { @page { size: ${SIZES[size].w}mm ${SIZES[size].h}mm; margin: 0 } body { margin: 0 } }`}</style>

            <div className="min-h-screen bg-neutral-100 p-6 print:bg-white print:p-0">
                <div className="mx-auto mb-6 flex max-w-2xl flex-wrap items-center gap-3 rounded-xl border bg-white p-4 print:hidden">
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tamaño de la etiqueta">
                        {(Object.entries(SIZES) as [SizeKey, (typeof SIZES)[SizeKey]][]).map(([key, s]) => (
                            <button
                                key={key}
                                type="button"
                                role="radio"
                                aria-checked={size === key}
                                onClick={() => pick(key)}
                                className={`rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors ${size === key ? 'border-slate-900 bg-slate-50' : 'border-neutral-200 hover:border-neutral-300'}`}
                            >
                                <span className="block font-semibold">{s.label}</span>
                                <span className="block text-xs text-muted-foreground">{s.hint}</span>
                            </button>
                        ))}
                    </div>
                    <Button className="ml-auto" onClick={() => window.print()}>
                        <Printer className="mr-2 size-4" /> Imprimir
                    </Button>
                    <p className="w-full text-xs text-muted-foreground">
                        En el diálogo de impresión elige tu impresora de etiquetas, quita los márgenes y deja la escala en 100 %.
                    </p>
                </div>

                <div className="flex justify-center print:block">
                    <LabelSheet label={label} store={store} size={size} />
                </div>
            </div>
        </>
    );
}
