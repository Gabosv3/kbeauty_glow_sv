import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Check, Loader2, MessageCircle, Package, Tag, Truck } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { useStore } from '@/lib/store-config';
import { useCartQuote } from '@/lib/use-cart-quote';

interface Props {
    departments: string[];
    freeShippingFrom: number;
    prefill: { name: string; phone: string; email: string; department: string; municipality: string; address: string } | null;
}

const field =
    'w-full rounded-2xl border border-brand-rose bg-white px-4 py-3 text-sm text-brand-text placeholder:text-brand-text/40 focus:border-brand-gold focus:outline-2 focus:outline-brand-gold/30';

const money = (n: number) => `$${n.toFixed(2)}`;

export default function Checkout({ departments, freeShippingFrom, prefill }: Readonly<Props>) {
    const STORE = useStore();
    const { whatsappUrl } = STORE;
    const { items } = useCart();
    const [couponInput, setCouponInput] = useState('');
    const [coupon, setCoupon] = useState<string | null>(null);
    const [data, setData] = useState({
        name: prefill?.name ?? '',
        phone: prefill?.phone ?? '',
        email: prefill?.email ?? '',
        department: prefill?.department ?? '',
        municipality: prefill?.municipality ?? '',
        address: prefill?.address ?? '',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sending, setSending] = useState(false);

    const { quote, loading, failed } = useCartQuote(items, coupon);

    const set = (key: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setData((d) => ({ ...d, [key]: e.target.value }));

    const hasIssues = quote?.lines.some((l) => l.issue) ?? false;
    const canSubmit = !!quote && quote.valid && !sending && !loading;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        setErrors({});

        router.post(
            '/store/checkout',
            { ...data, coupon: quote?.coupon?.code ?? null, items: items.map((i) => ({ id: i.id, quantity: i.quantity })) },
            {
                onError: (errs) => setErrors(errs as Record<string, string>),
                onFinish: () => setSending(false),
            },
        );
    }

    // Respaldo: si el pedido no se pudo registrar, el cliente igual puede escribirnos con su carrito.
    function fallbackUrl(): string {
        const lines = items.map((i, n) => `${n + 1}. ${i.name} x${i.quantity}`).join('\n');
        const total = quote ? `\n\nTotal estimado: ${money(quote.total)}` : '';

        return whatsappUrl(`¡Hola! Quise hacer un pedido en la tienda pero no se registró. Mi carrito:\n\n${lines}${total}\n\nNombre: ${data.name}\nTeléfono: ${data.phone}`);
    }

    if (items.length === 0) {
        return (
            <>
                <Head title="Finalizar compra — KBeauty Glow SV" />
                <div className="mx-auto max-w-lg px-4 py-24 text-center">
                    <p className="text-6xl">🛍️</p>
                    <h1 className="font-display mt-4 text-3xl font-semibold text-brand-text">Tu carrito está vacío</h1>
                    <p className="mt-2 text-brand-text/60">Agrega algunos productos para continuar con tu compra.</p>
                    <Link href="/store/products" className="mt-6 inline-flex rounded-full bg-brand-text px-7 py-3 text-sm font-semibold text-white hover:bg-brand-gold-dark">
                        Ver catálogo
                    </Link>
                </div>
            </>
        );
    }

    const generalError = errors.items ?? errors.message;
    const progress = quote ? Math.min(100, (quote.subtotal - quote.discount) / freeShippingFrom * 100) : 0;

    return (
        <>
            <Head title="Finalizar compra — KBeauty Glow SV" />

            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <Link href="/store/products" className="inline-flex items-center gap-1.5 text-sm text-brand-text/60 hover:text-brand-gold-dark">
                    <ArrowLeft className="h-4 w-4" /> Seguir comprando
                </Link>
                <h1 className="font-display mt-3 text-4xl font-semibold text-brand-text sm:text-5xl">Finalizar compra</h1>

                <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
                    <form onSubmit={submit} className="space-y-8">
                        <section className="rounded-3xl border border-brand-rose/60 bg-white p-6 sm:p-8">
                            <h2 className="font-display text-xl font-semibold text-brand-text">1. Tus datos</h2>
                            {prefill ? (
                                <p className="mt-1 text-xs text-brand-text/60">Usamos los datos guardados en tu cuenta. Puedes editarlos para este pedido.</p>
                            ) : (
                                <p className="mt-1 text-xs text-brand-text/60">
                                    ¿Ya tienes cuenta?{' '}
                                    <Link href="/store/cuenta/login" className="font-semibold text-brand-gold-dark hover:underline">Inicia sesión</Link>
                                    {' '}para autocompletar y ver tus pedidos.
                                </p>
                            )}
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Nombre completo *</label>
                                    <input id="name" required value={data.name} onChange={set('name')} autoComplete="name" className={field} />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Teléfono / WhatsApp *</label>
                                    <input id="phone" required type="tel" value={data.phone} onChange={set('phone')} autoComplete="tel" placeholder="7000 0000" className={field} />
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Correo (opcional)</label>
                                    <input id="email" type="email" value={data.email} onChange={set('email')} autoComplete="email" className={field} />
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-brand-rose/60 bg-white p-6 sm:p-8">
                            <h2 className="font-display text-xl font-semibold text-brand-text">2. Entrega</h2>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="department" className="mb-1.5 block text-sm font-medium">Departamento *</label>
                                    <select id="department" required value={data.department} onChange={set('department')} className={field}>
                                        <option value="">Selecciona…</option>
                                        {departments.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department}</p>}
                                </div>
                                <div>
                                    <label htmlFor="municipality" className="mb-1.5 block text-sm font-medium">Municipio *</label>
                                    <input id="municipality" required value={data.municipality} onChange={set('municipality')} className={field} />
                                    {errors.municipality && <p className="mt-1 text-xs text-red-500">{errors.municipality}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="address" className="mb-1.5 block text-sm font-medium">Dirección y referencia *</label>
                                    <textarea id="address" required rows={2} value={data.address} onChange={set('address')} placeholder="Colonia, calle, casa, punto de referencia…" className={field} />
                                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">Notas (opcional)</label>
                                    <textarea id="notes" rows={2} value={data.notes} onChange={set('notes')} className={field} />
                                </div>
                            </div>
                        </section>

                        {generalError && (
                            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {generalError}
                            </div>
                        )}

                        {(Object.keys(errors).length > 0 || failed) && (
                            <div className="rounded-2xl border border-brand-rose bg-brand-cream-alt p-4 text-sm text-brand-text">
                                <p className="font-medium">¿Algo no funciona?</p>
                                <p className="mt-1 text-brand-text/70">Puedes enviarnos tu carrito por WhatsApp y te atendemos directamente.</p>
                                <a href={fallbackUrl()} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white">
                                    <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
                                </a>
                            </div>
                        )}

                        <button
                            disabled={!canSubmit}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-text py-4 text-base font-semibold text-white shadow-xl transition-colors hover:bg-brand-gold-dark disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
                        >
                            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                            Confirmar pedido {quote && `· ${money(quote.total)}`}
                        </button>
                    </form>

                    <aside className="rounded-3xl border border-brand-rose/60 bg-white p-6 lg:sticky lg:top-24">
                        <h2 className="font-display text-xl font-semibold text-brand-text">Tu pedido</h2>

                        <ul className="mt-4 divide-y divide-brand-rose/50">
                            {items.map((item) => {
                                const line = quote?.lines.find((l) => l.id === item.id);

                                return (
                                    <li key={item.id} className="flex gap-3 py-3">
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-brand-rose/60 bg-brand-cream">
                                            {item.image ? (
                                                <img src={item.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="grid h-full place-items-center text-brand-wood"><Package className="h-5 w-5" /></div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-2 text-sm font-medium leading-tight text-brand-text">{item.name}</p>
                                            <p className="mt-0.5 text-xs text-brand-text/60">
                                                x{item.quantity}
                                                {line?.original_price && <span className="ml-2 line-through">{money(line.original_price)}</span>}
                                            </p>
                                            {line?.issue && <p className="text-xs font-medium text-red-500">{line.issue}</p>}
                                        </div>
                                        <span className="text-sm font-semibold text-brand-text">{money(line?.line_total ?? item.price * item.quantity)}</span>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="mt-4">
                            <label htmlFor="coupon" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-brand-text">
                                <Tag className="h-3.5 w-3.5" /> Cupón de descuento
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="coupon"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                    placeholder="GLOW10"
                                    className={`${field} py-2.5 font-mono`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setCoupon(couponInput.trim() || null)}
                                    className="shrink-0 rounded-2xl bg-brand-cream-alt px-4 text-sm font-semibold text-brand-gold-dark hover:bg-brand-rose/60"
                                >
                                    Aplicar
                                </button>
                            </div>
                            {quote?.coupon_error && <p className="mt-1.5 text-xs text-red-500">{quote.coupon_error}</p>}
                            {quote?.coupon && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                                    <Check className="h-3.5 w-3.5" /> Cupón {quote.coupon.code} aplicado
                                </p>
                            )}
                            {errors.coupon && <p className="mt-1.5 text-xs text-red-500">{errors.coupon}</p>}
                        </div>

                        <dl className="mt-5 space-y-2 border-t border-brand-rose/50 pt-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-brand-text/60">Subtotal</dt>
                                <dd>{quote ? money(quote.subtotal) : '…'}</dd>
                            </div>
                            {quote && quote.discount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <dt>Cupón</dt>
                                    <dd>-{money(quote.discount)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt className="flex items-center gap-1.5 text-brand-text/60"><Truck className="h-3.5 w-3.5" /> Envío</dt>
                                <dd>{quote ? (quote.shipping === 0 ? 'Gratis' : money(quote.shipping)) : '…'}</dd>
                            </div>
                            {quote && quote.shipping > 0 && (
                                <div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-brand-rose/60">
                                        <div className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-dark" style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="mt-1 text-xs text-brand-text/60">
                                        Agrega {money(freeShippingFrom - (quote.subtotal - quote.discount))} más para envío gratis
                                    </p>
                                </div>
                            )}
                            <div className="flex items-baseline justify-between border-t border-brand-rose/50 pt-3">
                                <dt className="font-display text-lg font-semibold">Total</dt>
                                <dd className="font-display text-2xl font-semibold text-brand-text">{quote ? money(quote.total) : '…'}</dd>
                            </div>
                        </dl>

                        {hasIssues && (
                            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                                Algunos productos ya no tienen suficiente stock. Ajusta tu carrito para continuar.
                            </p>
                        )}

                        <button
                            type="button"
                            disabled={!canSubmit}
                            onClick={(e) => (e.currentTarget.closest('aside')?.parentElement?.querySelector('form') as HTMLFormElement | null)?.requestSubmit()}
                            className="mt-5 hidden w-full items-center justify-center gap-2 rounded-full bg-brand-text py-4 text-base font-semibold text-white shadow-xl transition-colors hover:bg-brand-gold-dark disabled:cursor-not-allowed disabled:opacity-50 lg:flex"
                        >
                            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                            Confirmar pedido
                        </button>
                        <p className="mt-3 text-center text-xs text-brand-text/50">
                            Al confirmar, registramos tu pedido y te lo enviamos por WhatsApp a {STORE.handle}. El pago se coordina por ahí.
                        </p>
                    </aside>
                </div>
            </div>
        </>
    );
}
