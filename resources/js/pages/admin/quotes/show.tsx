import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, FileDown, MessageCircle, Trash2 } from 'lucide-react';
import { QuoteDocument, STATUS_LABEL, money } from '@/components/admin/quote-document';
import type { Quote, QuoteStore } from '@/components/admin/quote-document';
import { Button } from '@/components/ui/button';
import { admin } from '@/lib/admin-routes';

/** Número de El Salvador de 8 dígitos -> con código de país. */
function waNumber(phone: string | null): string | null {
    const digits = (phone ?? '').replace(/\D/g, '');

    if (digits.length === 8) {
        return `503${digits}`;
    }

    return digits.length >= 11 ? digits : null;
}

function whatsappText(q: Quote, store: QuoteStore): string {
    const lines = q.items.map((i, n) => `${n + 1}. ${i.name} x${i.quantity} — ${money(i.subtotal)}`).join('\n');
    const until = q.valid_until ? `\nVálida hasta: ${q.valid_until}` : '';

    return `¡Hola ${q.customer_name}! Te comparto tu cotización ${q.reference} de ${store.name}:\n\n${lines}\n\n*Total: ${money(q.total)}*${until}\n\n¿Te gustaría confirmar tu pedido?`;
}

export default function QuoteShow({ quote, store }: Readonly<{ quote: Quote; store: QuoteStore }>) {
    const number = waNumber(quote.customer_phone);
    const wa = `https://wa.me/${number ?? ''}?text=${encodeURIComponent(whatsappText(quote, store))}`;

    function remove() {
        if (confirm(`¿Eliminar la cotización ${quote.reference}?`)) {
            router.delete(admin.quotes.destroy(quote.id));
        }
    }

    return (
        <>
            <Head title={`Cotización ${quote.reference}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={admin.quotes.index} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-4" /> Cotizaciones
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            aria-label="Estado"
                            value={quote.status}
                            onChange={(e) => router.post(admin.quotes.status(quote.id), { status: e.target.value }, { preserveScroll: true })}
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        >
                            {Object.entries(STATUS_LABEL).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <Button variant="outline" size="sm" asChild>
                            <a href={admin.quotes.print(quote.id)} target="_blank" rel="noopener noreferrer">
                                <FileDown className="mr-2 size-4" /> PDF / Imprimir
                            </a>
                        </Button>
                        <Button size="sm" className="bg-[#25D366] text-white hover:bg-[#1ebe5d]" asChild>
                            <a href={wa} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 size-4" /> {number ? 'Enviar por WhatsApp' : 'Compartir por WhatsApp'}
                            </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={remove} aria-label="Eliminar">
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <QuoteDocument quote={quote} store={store} />
                </div>
            </div>
        </>
    );
}
