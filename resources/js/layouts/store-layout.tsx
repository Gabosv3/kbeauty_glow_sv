import { Link, router, usePage } from '@inertiajs/react';
import { ShoppingCart, Search, Menu, X, Mail, MessageCircle, Trash2, Plus, Minus, Package, Instagram, Facebook, Music2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CartProvider, useCart } from '@/contexts/cart-context';
import { STORE, whatsappUrl } from '@/lib/store-config';
import { useCartQuote } from '@/lib/use-cart-quote';

const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/store/products' },
    { label: 'Nosotros', href: '/store/nosotros' },
    { label: 'Contacto', href: '/store/contacto' },
];

function buildCartWhatsAppUrl(items: { name: string; price: number; quantity: number }[]): string {
    const lines = items
        .map((it, i) => `${i + 1}. *${it.name}* — Cant: ${it.quantity} — $${it.price.toFixed(2)} c/u — Subtotal: $${(it.price * it.quantity).toFixed(2)}`)
        .join('\n');
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);
    const msg = `¡Hola! Me gustaría cotizar los siguientes productos:\n\n${lines}\n\n*Total: $${total}*\n\n¿Están disponibles? 😊`;

    return whatsappUrl(msg);
}

function CartDrawer() {
    const { items, removeItem, updateQty, clearCart, totalItems, totalPrice: localTotal, cartOpen, setCartOpen } = useCart();
    const { quote } = useCartQuote(items, null, cartOpen);
    // Precios reales del servidor (con descuentos); mientras llegan, se muestra lo guardado.
    const totalPrice = quote?.subtotal ?? localTotal;
    const lineTotal = (id: number, fallback: number) => quote?.lines.find((l) => l.id === id)?.line_total ?? fallback;
    const lineIssue = (id: number) => quote?.lines.find((l) => l.id === id)?.issue ?? null;

    useEffect(() => {
        if (!cartOpen) {
            return;
        }

        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCartOpen(false);
        const previous = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener('keydown', onKey);
        };
    }, [cartOpen, setCartOpen]);

    return (
        <>
            {cartOpen && (
                <button
                    type="button"
                    aria-label="Cerrar carrito"
                    className="fixed inset-0 z-40 w-full bg-black/40 backdrop-blur-sm"
                    onClick={() => setCartOpen(false)}
                />
            )}
            <div
                role="dialog"
                aria-label="Carrito de compras"
                aria-hidden={!cartOpen}
                inert={!cartOpen}
                className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col bg-white transition-transform duration-300 ${
                    cartOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between border-b border-brand-rose px-5 py-4">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-brand-gold" />
                        <span className="font-display text-lg font-semibold text-brand-text">
                            Mi carrito
                            {totalItems > 0 && (
                                <span className="ml-2 rounded-full bg-brand-gold px-2 py-0.5 text-xs text-white">
                                    {totalItems}
                                </span>
                            )}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setCartOpen(false)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Cerrar carrito"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <ShoppingCart className="h-14 w-14 text-brand-wood" />
                            <p className="mt-4 font-medium text-gray-500">Tu carrito está vacío</p>
                            <p className="mt-1 text-sm text-gray-400">Agrega productos para cotizar por WhatsApp</p>
                            <Button
                                size="sm"
                                className="mt-6 bg-brand-gold text-white hover:bg-brand-gold-dark"
                                onClick={() => setCartOpen(false)}
                                asChild
                            >
                                <Link href="/store/products">Ver productos</Link>
                            </Button>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {items.map((item) => (
                                <li key={item.id} className="flex gap-3">
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-brand-rose/60 bg-brand-cream">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-200">
                                                <Package className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="line-clamp-2 text-sm font-medium leading-tight text-gray-900">
                                                {item.name}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="shrink-0 text-gray-300 hover:text-red-400"
                                                aria-label="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-900">
                                                ${lineTotal(item.id, item.price * item.quantity).toFixed(2)}
                                                {lineIssue(item.id) && <span className="ml-2 text-xs font-medium text-red-500">{lineIssue(item.id)}</span>}
                                            </span>
                                            <div className="flex items-center rounded-full border border-brand-rose">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQty(item.id, item.quantity - 1)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-l-full text-brand-text/70 hover:bg-brand-cream-alt"
                                                    aria-label="Reducir"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-xs font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQty(item.id, item.quantity + 1)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-r-full text-brand-text/70 hover:bg-brand-cream-alt"
                                                    aria-label="Aumentar"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="space-y-3 border-t border-brand-rose bg-brand-cream px-5 py-4">
                        <div>
                            <p className="text-xs font-medium text-brand-text">
                                {totalPrice >= STORE.freeShippingFrom
                                    ? '🎉 ¡Tienes envío gratis!'
                                    : `Te faltan $${(STORE.freeShippingFrom - totalPrice).toFixed(2)} para envío gratis`}
                            </p>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-rose/60">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-dark transition-all duration-500"
                                    style={{ width: `${Math.min(100, (totalPrice / STORE.freeShippingFrom) * 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</span>
                            <span className="text-base font-bold text-gray-900">
                                Subtotal: ${totalPrice.toFixed(2)}
                            </span>
                        </div>
                        <Link
                            href="/store/checkout"
                            onClick={() => setCartOpen(false)}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-text py-3.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-gold-dark"
                        >
                            Finalizar compra
                        </Link>
                        <a
                            href={buildCartWhatsAppUrl(items)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366] py-2.5 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/10"
                            onClick={() => setCartOpen(false)}
                        >
                            <MessageCircle className="h-5 w-5" />
                            Solo cotizar por WhatsApp
                        </a>
                        <button
                            type="button"
                            onClick={clearCart}
                            className="w-full text-center text-xs text-gray-400 hover:text-red-400"
                        >
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

function StoreLayoutInner({ children }: Readonly<{ children: React.ReactNode }>) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const { totalItems, setCartOpen } = useCart();
    const { url } = usePage();
    const [query, setQuery] = useState('');

    const isActive = (href: string) => (href === '/' ? url === '/' : !href.includes('?') && url.split('?')[0] === href);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setSearchOpen(false);
        setMobileOpen(false);
        router.get('/store/products', query.trim() ? { q: query.trim() } : {});
    }

    return (
        <div className="flex min-h-screen flex-col bg-brand-cream" style={{ color: '#3D3656' }}>
            <CartDrawer />

            <div className="bg-brand-text py-2 text-center text-xs font-medium tracking-wide text-white">
                🌸 Envío gratis en compras desde ${STORE.freeShippingFrom} &nbsp;·&nbsp; K-Beauty 100% auténtico
            </div>

            <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <Link href="/" className="flex shrink-0 items-center gap-2">
                            <img src="/img/logo.png" alt="KBeauty Glow SV" className="h-11 w-11 object-contain" />
                            <div className="flex flex-col leading-none">
                                <span className="font-display text-base font-semibold tracking-tight text-brand-text">
                                    kbeauty_glow
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-gold">
                                    sv
                                </span>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-1 lg:flex">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href + link.label}
                                    href={link.href}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                        isActive(link.href)
                                            ? 'bg-brand-text text-white'
                                            : 'text-brand-text hover:bg-brand-cream-alt'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSearchOpen(!searchOpen)}
                                aria-label="Buscar"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative"
                                aria-label="Carrito"
                                onClick={() => setCartOpen(true)}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                {totalItems > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white">
                                        {totalItems > 9 ? '9+' : totalItems}
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setMobileOpen(!mobileOpen)}
                                aria-label="Menú"
                            >
                                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {searchOpen && (
                        <form onSubmit={handleSearch} className="border-t border-brand-rose py-3" role="search">
                            <Input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar productos K-Beauty..."
                                aria-label="Buscar productos"
                                className="mx-auto max-w-lg rounded-full"
                                autoFocus
                            />
                        </form>
                    )}

                    {mobileOpen && (
                        <div className="border-t border-brand-rose py-4 lg:hidden">
                            <nav className="flex flex-col gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href + link.label}
                                        href={link.href}
                                        className={`rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-brand-cream-alt ${
                                            isActive(link.href) ? 'bg-brand-cream-alt text-brand-gold' : 'text-brand-text'
                                        }`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-brand-rose bg-brand-cream-alt">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <img src="/img/logo.png" alt="KBeauty Glow SV" className="h-8 w-8 object-contain" />
                                <div className="flex flex-col leading-none">
                                    <span className="font-display text-base font-semibold text-brand-text">
                                        kbeauty_glow
                                    </span>
                                    <span className="text-[9px] font-semibold uppercase tracking-widest text-brand-gold">
                                        sv
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-[#777]">
                                Tu destino de belleza coreana en El Salvador. Productos auténticos, directamente para tu rutina de cuidado personal.
                            </p>
                            <div className="mt-4 flex gap-2">
                                {[
                                    { label: 'Instagram', href: STORE.socials.instagram, Icon: Instagram },
                                    { label: 'TikTok', href: STORE.socials.tiktok, Icon: Music2 },
                                    { label: 'Facebook', href: STORE.socials.facebook, Icon: Facebook },
                                    { label: 'WhatsApp', href: whatsappUrl('¡Hola! Quisiera más información 🌸'), Icon: MessageCircle },
                                ].map(({ label, href, Icon }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand-gold-dark transition-colors hover:bg-brand-gold-dark hover:text-white"
                                    >
                                        <Icon className="h-4 w-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-display mb-4 text-base font-semibold text-brand-text">Tienda</h3>
                            <ul className="space-y-2 text-sm text-[#777]">
                                <li><Link href="/store/products" className="transition-colors hover:text-brand-gold">Todos los productos</Link></li>
                                <li><Link href="/store/products?category=Serums" className="transition-colors hover:text-brand-gold">Serums</Link></li>
                                <li><Link href="/store/products?category=T%C3%B3nico+Exfoliante" className="transition-colors hover:text-brand-gold">Tónicos</Link></li>
                                <li><Link href="/store/products?category=Protector+solar" className="transition-colors hover:text-brand-gold">Protectores Solares</Link></li>
                                <li><Link href="/store/products?category=Parches" className="transition-colors hover:text-brand-gold">Parches</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-display mb-4 text-base font-semibold text-brand-text">Servicio al Cliente</h3>
                            <ul className="space-y-2 text-sm text-[#777]">
                                <li><span className="cursor-pointer transition-colors hover:text-brand-gold">Centro de Ayuda</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-brand-gold">Envíos y Entregas</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-brand-gold">Devoluciones</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-brand-gold">Seguimiento de Pedido</span></li>
                                <li><Link href="/store/contacto" className="transition-colors hover:text-brand-gold">Contáctanos</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-display mb-4 text-base font-semibold text-brand-text">Newsletter</h3>
                            <p className="mb-3 text-sm text-[#777]">Recibe novedades y descuentos exclusivos directamente en tu correo.</p>
                            <div className="flex gap-2">
                                <Input placeholder="tu@email.com" className="border-brand-rose text-sm" />
                                <Button size="sm" className="shrink-0 bg-brand-gold text-white hover:bg-brand-gold-dark">
                                    <Mail className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8 opacity-30" style={{ backgroundColor: '#D5CEFB' }} />

                    <div className="flex flex-col items-center justify-between gap-2 text-xs text-[#999] sm:flex-row">
                        <p>© 2026 kbeauty_glow_sv. Todos los derechos reservados.</p>
                        <div className="flex gap-4">
                            <span className="cursor-pointer hover:text-brand-text">Privacidad</span>
                            <span className="cursor-pointer hover:text-brand-text">Términos y Condiciones</span>
                        </div>
                    </div>
                </div>
            </footer>

            <a
                href={whatsappUrl('¡Hola! Estoy en su tienda y me gustaría obtener más información. 😊')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                className="fixed bottom-4 right-4 z-40 flex h-12 w-12 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
            >
                <MessageCircle className="h-6 w-6 text-white sm:h-7 sm:w-7" />
            </a>
        </div>
    );
}

export default function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <CartProvider>
            <StoreLayoutInner>{children}</StoreLayoutInner>
        </CartProvider>
    );
}