export type QuoteItem = { id: number; name: string; quantity: number; unit_price: string; subtotal: string };

export type Quote = {
    id: number;
    reference: string;
    status: 'pending' | 'accepted' | 'rejected';
    customer_name: string;
    customer_phone: string | null;
    customer_email: string | null;
    valid_until: string | null;
    subtotal: string;
    discount: string;
    total: string;
    notes: string | null;
    created_at: string;
    items: QuoteItem[];
};

export type QuoteStore = { name: string; whatsapp: string; email: string; city: string };

export const money = (n: number | string) => `$${Number(n).toFixed(2)}`;
export const longDate = (iso: string) => new Date(iso).toLocaleDateString('es-SV', { dateStyle: 'long' });

export const STATUS_LABEL: Record<Quote['status'], string> = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
};

/** Documento de la cotización: se ve igual en pantalla y al imprimir / guardar como PDF. */
export function QuoteDocument({ quote, store }: Readonly<{ quote: Quote; store: QuoteStore }>) {
    return (
        <article className="mx-auto w-full max-w-3xl bg-white p-8 text-neutral-900 sm:p-12">
            <header className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-6">
                <div className="flex items-center gap-3">
                    <img src="/img/logo.png" alt="" className="h-14 w-14 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold">{store.name}</h1>
                        <p className="text-xs text-neutral-500">{store.city}</p>
                        <p className="text-xs text-neutral-500">WhatsApp +{store.whatsapp} · {store.email}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Cotización</p>
                    <p className="font-mono text-lg font-bold">{quote.reference}</p>
                    <p className="text-xs text-neutral-500">{longDate(quote.created_at)}</p>
                </div>
            </header>

            <section className="grid gap-4 border-b border-neutral-200 py-6 text-sm sm:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Para</p>
                    <p className="mt-1 font-semibold">{quote.customer_name}</p>
                    {quote.customer_phone && <p className="text-neutral-600">{quote.customer_phone}</p>}
                    {quote.customer_email && <p className="text-neutral-600">{quote.customer_email}</p>}
                </div>
                <div className="sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Válida hasta</p>
                    <p className="mt-1 font-semibold">{quote.valid_until ? longDate(`${quote.valid_until}T12:00:00`) : 'Sin fecha límite'}</p>
                </div>
            </section>

            <table className="mt-6 w-full text-sm">
                <thead>
                    <tr className="border-b border-neutral-300 text-left text-xs uppercase tracking-wide text-neutral-500">
                        <th className="py-2 font-semibold">Producto</th>
                        <th className="py-2 text-center font-semibold">Cant.</th>
                        <th className="py-2 text-right font-semibold">Precio</th>
                        <th className="py-2 text-right font-semibold">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {quote.items.map((i) => (
                        <tr key={i.id} className="border-b border-neutral-100">
                            <td className="py-2.5 pr-3">{i.name}</td>
                            <td className="py-2.5 text-center">{i.quantity}</td>
                            <td className="py-2.5 text-right font-mono">{money(i.unit_price)}</td>
                            <td className="py-2.5 text-right font-mono">{money(i.subtotal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <dl className="mt-6 ml-auto w-full max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-600">
                    <dt>Subtotal</dt>
                    <dd className="font-mono">{money(quote.subtotal)}</dd>
                </div>
                {Number(quote.discount) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                        <dt>Descuento</dt>
                        <dd className="font-mono">-{money(quote.discount)}</dd>
                    </div>
                )}
                <div className="flex justify-between border-t border-neutral-300 pt-2 text-base font-bold">
                    <dt>Total</dt>
                    <dd className="font-mono">{money(quote.total)}</dd>
                </div>
            </dl>

            {quote.notes && (
                <section className="mt-8 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-700">
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Notas</p>
                    <p className="mt-1 whitespace-pre-line">{quote.notes}</p>
                </section>
            )}

            <footer className="mt-10 text-center text-xs text-neutral-400">
                Precios sujetos a disponibilidad. Gracias por tu preferencia.
            </footer>
        </article>
    );
}
