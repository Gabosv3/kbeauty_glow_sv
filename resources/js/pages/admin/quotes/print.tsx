import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { QuoteDocument } from '@/components/admin/quote-document';
import type { Quote, QuoteStore } from '@/components/admin/quote-document';

export default function QuotePrint({ quote, store }: Readonly<{ quote: Quote; store: QuoteStore }>) {
    useEffect(() => {
        const t = setTimeout(() => window.print(), 400);

        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <Head title={`Cotización ${quote.reference}`} />
            <div className="min-h-screen bg-white">
                <QuoteDocument quote={quote} store={store} />
            </div>
        </>
    );
}
