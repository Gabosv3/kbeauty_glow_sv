import { Link } from '@inertiajs/react';
import { ShoppingCart, Search, Heart, Menu, X, Globe, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const navLinks = [
    { label: 'Inicio', href: '/store' },
    { label: 'Productos', href: '/store/products' },
    { label: 'Skincare', href: '/store/products?category=Serums' },
    { label: 'Ofertas', href: '/store/products' },
];

export default function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* Promo banner */}
            <div className="bg-pink-600 py-2 text-center text-xs font-medium text-white">
                🌸 Envío gratis en compras mayores a $50 &mdash; Usa el código{' '}
                <strong>KGLOW10</strong> para 10% de descuento en tu primera compra
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href="/store" className="flex shrink-0 items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500">
                                <span className="text-sm font-bold text-white">K</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight text-gray-900">
                                KBeauty <span className="text-pink-500">Glow</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden items-center gap-6 lg:flex">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href + link.label}
                                    href={link.href}
                                    className="text-sm font-medium text-gray-700 transition-colors hover:text-pink-500"
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
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
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
                        <div className="border-t py-3">
                            <Input
                                placeholder="Buscar productos K-Beauty..."
                                className="mx-auto max-w-lg"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Mobile menu */}
                    {mobileOpen && (
                        <div className="border-t py-4 lg:hidden">
                            <nav className="flex flex-col gap-3">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href + link.label}
                                        href={link.href}
                                        className="text-sm font-medium text-gray-700 hover:text-pink-500"
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
            <footer className="border-t bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Brand */}
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500">
                                    <span className="text-xs font-bold text-white">K</span>
                                </div>
                                <span className="font-bold text-gray-900">
                                    KBeauty <span className="text-pink-500">Glow SV</span>
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed text-gray-500">
                                Tu destino de belleza coreana en El Salvador. Productos auténticos, directamente para tu rutina de cuidado personal.
                            </p>
                            <div className="mt-4 flex gap-3">
                                <button type="button" aria-label="WhatsApp" className="text-gray-400 transition-colors hover:text-pink-500">
                                    <MessageCircle className="h-4 w-4" />
                                </button>
                                <button type="button" aria-label="Web" className="text-gray-400 transition-colors hover:text-pink-500">
                                    <Globe className="h-4 w-4" />
                                </button>
                                <button type="button" aria-label="Email" className="text-gray-400 transition-colors hover:text-pink-500">
                                    <Mail className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Tienda */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold text-gray-900">Tienda</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li>
                                    <Link href="/store/products" className="transition-colors hover:text-pink-500">
                                        Todos los productos
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/store/products?category=Serums" className="transition-colors hover:text-pink-500">
                                        Serums
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/store/products?category=Toners" className="transition-colors hover:text-pink-500">
                                        Toners
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/store/products?category=Sunscreen" className="transition-colors hover:text-pink-500">
                                        Protectores Solares
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/store/products?category=Makeup" className="transition-colors hover:text-pink-500">
                                        Makeup
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Ayuda */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold text-gray-900">Servicio al Cliente</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><span className="cursor-pointer transition-colors hover:text-pink-500">Centro de Ayuda</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-pink-500">Envíos y Entregas</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-pink-500">Devoluciones</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-pink-500">Seguimiento de Pedido</span></li>
                                <li><span className="cursor-pointer transition-colors hover:text-pink-500">Contáctanos</span></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold text-gray-900">Newsletter</h3>
                            <p className="mb-3 text-sm text-gray-500">Recibe novedades y descuentos exclusivos directamente en tu correo.</p>
                            <div className="flex gap-2">
                                <Input placeholder="tu@email.com" className="text-sm" />
                                <Button size="sm" className="shrink-0 bg-pink-500 text-white hover:bg-pink-600">
                                    <Mail className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    <div className="flex flex-col items-center justify-between gap-2 text-xs text-gray-400 sm:flex-row">
                        <p>© 2026 KBeauty Glow SV. Todos los derechos reservados.</p>
                        <div className="flex gap-4">
                            <span className="cursor-pointer hover:text-gray-600">Privacidad</span>
                            <span className="cursor-pointer hover:text-gray-600">Términos y Condiciones</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
