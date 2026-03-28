import { Link } from '@inertiajs/react';
import { ShoppingCart, Search, Heart, Menu, X, Globe, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/store/products' },
    { label: 'Skincare', href: '/store/products?category=Serums' },
    { label: 'Ofertas', href: '/store/products' },
];

function KGLogo({ size = 38 }: Readonly<{ size?: number }>) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="KBeauty Glow SV"
        >
            <defs>
                <radialGradient id="kgBg" cx="38%" cy="32%" r="68%">
                    <stop offset="0%" stopColor="#E6B8B1" />
                    <stop offset="100%" stopColor="#B8756A" />
                </radialGradient>
            </defs>
            {/* Círculo principal */}
            <circle cx="20" cy="20" r="19.5" fill="url(#kgBg)" />
            <circle cx="20" cy="20" r="17" fill="none" stroke="#FFFDF8" strokeWidth="0.6" opacity="0.35" />
            {/* Flor de Izote — 6 pétalos rotados alrededor de (20, 14) */}
            <g transform="rotate(0 20 14)"><ellipse cx="20" cy="9.8" rx="1.4" ry="3.2" fill="#FFFDF8" opacity="0.92" /></g>
            <g transform="rotate(60 20 14)"><ellipse cx="20" cy="9.8" rx="1.4" ry="3.2" fill="#FFFDF8" opacity="0.82" /></g>
            <g transform="rotate(120 20 14)"><ellipse cx="20" cy="9.8" rx="1.4" ry="3.2" fill="#FFFDF8" opacity="0.82" /></g>
            <g transform="rotate(180 20 14)"><ellipse cx="20" cy="9.8" rx="1.4" ry="3.2" fill="#FFFDF8" opacity="0.92" /></g>
            <g transform="rotate(240 20 14)"><ellipse cx="20" cy="9.8" rx="1.4" ry="3.2" fill="#FFFDF8" opacity="0.82" /></g>
            <g transform="rotate(300 20 14)"><ellipse cx="20" cy="9.8" rx="1.4" ry="3.2" fill="#FFFDF8" opacity="0.82" /></g>
            {/* Centro de la flor */}
            <circle cx="20" cy="14" r="2" fill="#DCC6A9" />
            <circle cx="20" cy="14" r="1" fill="#D19A8A" />
            {/* Monograma KG */}
            <text
                x="7.5"
                y="31.5"
                fontFamily="Georgia,'Times New Roman',serif"
                fontSize="13"
                fontWeight="bold"
                fill="#FFFDF8"
                letterSpacing="1.5"
            >
                KG
            </text>
        </svg>
    );
}
export default function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-brand-cream" style={{ color: '#4D4D4D' }}>
            {/* Promo banner */}
            <div className="bg-brand-gold py-2 text-center text-xs font-medium text-white">
                🌸 Envío gratis en compras mayores a $50 &mdash; Usa el código{' '}
                <strong>KGLOW10</strong> para 10% de descuento en tu primera compra
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-brand-rose bg-brand-cream/95 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex shrink-0 items-center gap-2.5">
                            <KGLogo size={38} />
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

                        {/* Desktop Nav */}
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

                        {/* Actions */}
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
                                className="hidden sm:flex"
                                aria-label="Lista de deseos"
                            >
                                <Heart className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="relative" aria-label="Carrito">
                                <ShoppingCart className="h-4 w-4" />
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white">
                                    0
                                </span>
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

                    {/* Search bar */}
                    {searchOpen && (
                        <div className="border-t border-brand-rose py-3">
                            <Input
                                placeholder="Buscar productos K-Beauty..."
                                className="mx-auto max-w-lg"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Mobile menu */}
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

            {/* Main */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-brand-rose bg-brand-cream-alt">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Brand */}
                        <div>
                            <div className="mb-4 flex items-center gap-2.5">
                                <KGLogo size={32} />
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

                        {/* Tienda */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold text-brand-text">Tienda</h3>
                            <ul className="space-y-2 text-sm text-[#777]">
                                <li>
                                    <Link href="/store/products" className="transition-colors hover:text-brand-gold">
                                        Todos los productos
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/store/products?category=Serums" className="transition-colors hover:text-brand-gold">
                                        Serums
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/store/products?category=Toners" className="transition-colors hover:text-brand-gold">
                                        Toners
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/store/products?category=Sunscreen" className="transition-colors hover:text-brand-gold">
                                        Protectores Solares
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/store/products?category=Makeup" className="transition-colors hover:text-brand-gold">
                                        Makeup
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Ayuda */}
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

                        {/* Newsletter */}
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

                    <Separator className="my-8 opacity-30" style={{ backgroundColor: '#E6B8B1' }} />

                    <div className="flex flex-col items-center justify-between gap-2 text-xs text-[#999] sm:flex-row">
                        <p>© 2026 kbeauty_glow_sv. Todos los derechos reservados.</p>
                        <div className="flex gap-4">
                            <span className="cursor-pointer hover:text-brand-text">Privacidad</span>
                            <span className="cursor-pointer hover:text-brand-text">Términos y Condiciones</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
