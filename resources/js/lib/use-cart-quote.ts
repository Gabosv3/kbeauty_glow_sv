import { useEffect, useMemo, useState } from 'react';
import type { CartItem } from '@/contexts/cart-context';

export interface QuoteLine {
    id: number;
    name: string;
    slug: string | null;
    image: string | null;
    unit_price: number;
    original_price: number | null;
    quantity: number;
    requested?: number;
    line_total: number;
    issue: string | null;
}

export interface Quote {
    lines: QuoteLine[];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    coupon: { code: string; discount: number } | null;
    coupon_error: string | null;
    valid: boolean;
}

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Pide al servidor los precios reales del carrito (descuentos, cupón y envío).
 * El carrito guardado en el navegador solo recuerda qué productos y cuántos; nunca decide precios.
 */
export function useCartQuote(items: CartItem[], coupon: string | null = null, enabled = true) {
    const [state, setState] = useState<{ key: string; quote: Quote | null; failed: boolean }>({ key: '', quote: null, failed: false });

    const key = useMemo(() => JSON.stringify({ items: items.map((i) => [i.id, i.quantity]), coupon }), [items, coupon]);
    const active = enabled && items.length > 0;

    useEffect(() => {
        if (!active) {
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => {
            fetch('/store/cart/quote', {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                body: JSON.stringify({ items: items.map((i) => ({ id: i.id, quantity: i.quantity })), coupon }),
            })
                .then((r) => (r.ok ? (r.json() as Promise<Quote>) : Promise.reject(new Error(String(r.status)))))
                .then((quote) => setState({ key, quote, failed: false }))
                .catch((e: Error) => {
                    if (e.name !== 'AbortError') {
                        setState({ key, quote: null, failed: true });
                    }
                });
        }, 250);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
        // `key` resume items y cupón; no hace falta depender de los objetos.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, active]);

    return {
        quote: active && state.key === key ? state.quote : null,
        loading: active && state.key !== key,
        failed: active && state.key === key && state.failed,
    };
}
