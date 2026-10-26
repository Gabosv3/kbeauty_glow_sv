import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';

interface Order {
    reference: string;
    status: string;
    customer_name: string | null;
    department: string | null;
    municipality: string | null;
    address: string | null;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    coupon: string | null;
    items: { name: string; quantity: number; unit_price: number; subtotal: number }[];
}

const money = (n: number) => `$${n.toFixed(2)}`;

function buildMessage(o: Order): string {
    const lines = o.items.map((i, n) => `${n + 1}. *${i.name}* x${i.quantity} — ${money(i.subtotal)}`).join('\n');
    const extras = [
        o.discount > 0 ? `Cupón${o.coupon ? ` ${o.coupon}` : ''}: -${money(o.discount)}` : null,
        `Envío: ${o.shipping === 0 ? 'Gratis' : money(o.shipping)}`,
    ]
        .filter(Boolean)
        .join('\n');

    return `¡Hola! Acabo de hacer el pedido *${o.reference}* en la tienda 🌸\n\n${lines}\n\n${extras}\n*Total: ${money(o.total)}*\n\n📍 ${o.address}, ${o.municipality}, ${o.department}\n👤 ${o.customer_name}\n\n¿Cómo coordinamos el pago?`;
}

export default function OrderConfirmation({ order, whatsapp }: Readonly<{ order: Order; whatsapp: string }>) {
    const { clearCart } = useCart();

    // El pedido ya quedó registrado: el carrito del navegador ya no hace falta.
    useEffect(() => {
        clearCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(buildMessage(order))}`;

    return (
        <>
            <Head title={`Pedido ${order.reference} — KBeauty Glow SV`} />

            <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
                <div className="text-center">
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-9 w-9" />
                    </span>
                    <h1 className="font-display mt-5 text-4xl font-semibold text-brand-text">¡Pedido recibido!</h1>
                    <p className="mt-2 text-brand-text/70">
                        Gracias{order.customer_name ? `, ${order.customer_name.split(' ')[0]}` : ''}. Tu referencia es{' '}
                        <span className="font-mono font-semibold text-brand-text">{order.reference}</span>.
                    </p>
                </div>

                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 text-base font-semibold text-white shadow-xl transition-transform hover:scale-[1.02]"
                >
                    <MessageCircle className="h-5 w-5" />
                    Enviar mi pedido por WhatsApp
                </a>
                <p className="mt-2 text-center text-xs text-brand-text/60">
                    Un último paso: envíanos el mensaje para confirmar tu pedido y coordinar el pago.
                </p>

                <div className="mt-10 rounded-3xl border border-brand-rose/60 bg-white p-6">
                    <h2 className="font-display text-xl font-semibold text-brand-text">Resumen</h2>
                    <ul className="mt-3 divide-y divide-brand-rose/50 text-sm">
                        {order.items.map((i) => (
                            <li key={i.name} className="flex justify-between gap-4 py-2.5">
                                <span>{i.name} <span className="text-brand-text/50">x{i.quantity}</span></span>
                                <span className="font-medium">{money(i.subtotal)}</span>
                            </li>
                        ))}
                    </ul>
                    <dl className="mt-3 space-y-1.5 border-t border-brand-rose/50 pt-3 text-sm">
                        <div className="flex justify-between"><dt className="text-brand-text/60">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-emerald-600"><dt>Cupón {order.coupon}</dt><dd>-{money(order.discount)}</dd></div>
                        )}
                        <div className="flex justify-between"><dt className="text-brand-text/60">Envío</dt><dd>{order.shipping === 0 ? 'Gratis' : money(order.shipping)}</dd></div>
                        <div className="flex justify-between pt-1 text-base font-semibold"><dt>Total</dt><dd>{money(order.total)}</dd></div>
                    </dl>
                    <p className="mt-4 rounded-2xl bg-brand-cream-alt p-3 text-xs text-brand-text/70">
                        📍 {order.address}, {order.municipality}, {order.department}
                    </p>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/store/products" className="text-sm font-semibold text-brand-gold-dark hover:underline">
                        Seguir comprando
                    </Link>
                </div>
            </div>
        </>
    );
}
