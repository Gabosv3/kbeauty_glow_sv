import { Link } from '@inertiajs/react';
import { ShoppingCart, Search, Heart, Menu, X, Globe, Mail, MessageCircle, Trash2, Plus, Minus, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CartProvider, useCart } from '@/contexts/cart-context';

const WA_NUMBER = '50360330849';

const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/store/products' },
    { label: 'Skincare', href: '/store/products?category=Serums' },
    { label: 'Ofertas', href: '/store/products' },
];

function buildCartWhatsAppUrl(items: { name: string; price: number; quantity: number }[]): string {
    const lines = items
        .map((it, i) => `${i + 1}. *${it.name}* — Cant: ${it.quantity} — $${it.price.toFixed(2)} c/u — Subtotal: $${(it.price * it.quantity).toFixed(2)}`)
        .join('\n');
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);
    const msg = `¡Hola! Me gustaría cotizar los siguientes productos:\n\n${lines}\n\n*Total: $${total}*\n\n¿Están disponibles? 😊`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function CartDrawer() {
    const { items, removeItem, updateQty, clearCart, totalItems, totalPrice, cartOpen, setCartOpen } = useCart();

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
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
                    cartOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between border-b border-brand-rose px-5 py-4">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-brand-gold" />
                        <span className="font-semibold text-brand-text">
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
                            <ShoppingCart className="h-14 w-14 text-gray-200" />
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
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
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
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                            <div className="flex items-center rounded-lg border">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQty(item.id, item.quantity - 1)}
                                                    className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-gray-50"
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
                                                    className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-gray-50"
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
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</span>
                            <span className="text-base font-bold text-gray-900">
                                Total: ${totalPrice.toFixed(2)}
                            </span>
                        </div>
                        <a
                            href={buildCartWhatsAppUrl(items)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white shadow hover:bg-[#1ebe5d]"
                            onClick={() => setCartOpen(false)}
                        >
                            <MessageCircle className="h-5 w-5" />
                            Cotizar por WhatsApp
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

    return (
        <div className="flex min-h-screen flex-col bg-brand-cream" style={{ color: '#3D3656' }}>
            <CartDrawer />

            <div className="bg-brand-gold py-2 text-center text-xs font-medium text-white">
                🌸 Envío gratis en compras mayores a $50 &nbsp;&mdash;&nbsp; ¡Productos K-Beauty 100% auténticos!
            </div>

            <header className="sticky top-0 z-30 border-b border-brand-rose bg-brand-cream/95 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <Link href="/" className="flex shrink-0 items-center gap-2">
                            <img src="/img/logo.png" alt="KBeauty Glow SV" className="h-25 w-25 object-contain" />
                            <div className="flex flex-col leading-none">
                                <span
                                    className="text-sm font-bold tracking-tight text-brand-text"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                >
                                    kbeauty_glow
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-gold">
                                    sv
                                </span>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-6 lg:flex">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href + link.label}
                                    href={link.href}
                                    className="text-sm font-medium text-brand-text transition-colors hover:text-brand-gold"
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
                            <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Lista de deseos">
                                <Heart className="h-4 w-4" />
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
                        <div className="border-t border-brand-rose py-3">
                            <Input
                                placeholder="Buscar productos K-Beauty..."
                                className="mx-auto max-w-lg"
                                autoFocus
                            />
                        </div>
                    )}

                    {mobileOpen && (
                        <div className="border-t border-brand-rose py-4 lg:hidden">
                            <nav className="flex flex-col gap-3">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href + link.label}
                                        href={link.href}
                                        className="text-sm font-medium text-brand-text hover:text-brand-gold"
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
                                    <span
                                        className="text-sm font-bold text-brand-text"
                                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                    >
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
                            <div className="mt-4 flex gap-3">
                                <button type="button" aria-label="WhatsApp" className="text-brand-wood transition-colors hover:text-brand-gold">
                                    <MessageCircle className="h-4 w-4" />
                                </button>
                                <button type="button" aria-label="Web" className="text-brand-wood transition-colors hover:text-brand-gold">
                                    <Globe className="h-4 w-4" />
                                </button>
                                <button type="button" aria-label="Email" className="text-brand-wood transition-colors hover:text-brand-gold">
                                    <Mail className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-sm font-semibold text-brand-text">Tienda</h3>
                            <ul className="space-y-2 text-sm text-[#777]">
                                <li><Link href="/store/products" className="transition-colors hover:text-brand-gold">Todos los productos</Link></li>
                                <li><Link href="/store/products?category=Serums" className="transition-colors hover:text-brand-gold">Serums</Link></li>
                                <li><Link href="/store/products?category=Toners" className="transition-colors hover:text-brand-gold">Toners</Link></li>
                                <li><Link href="/store/products?category=Sunscreen" className="transition-colors hover:text-brand-gold">Protectores Solares</Link></li>
                                <li><Link href="/store/products?category=Makeup" className="transition-colors hover:text-brand-gold">Makeup</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-sm font-semibold text-brand-text">Servicio al Cliente</h3>
                            <ul className="space-y-2 text-sm text-[#777]">
                                <li><span className="cursor-pointer transition-colors hover:text-brand-gold">Centro de Ayuda</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-brand-gold">Envíos y Entregas</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-brand-gold">Devoluciones</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-brand-gold">Seguimiento de Pedido</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-brand-gold">Contáctanos</span></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-sm font-semibold text-brand-text">Newsletter</h3>
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
                href="https://wa.me/50360330849?text=%C2%A1Hola!%20Estoy%20en%20su%20tienda%20y%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n.%20%F0%9F%98%8A"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
            >
                <MessageCircle className="h-7 w-7 text-white" />
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