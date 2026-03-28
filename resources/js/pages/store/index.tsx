import { Head, Link } from '@inertiajs/react';
import { ShoppingBag, ChevronRight, Truck, Shield, RefreshCcw, Headphones, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Product {
    id: number;
    name: string;
    slug: string;
    brand: string;
    category: string;
    price: number;
    original_price: number | null;
    image: string;
    rating: number;
    reviews: number;
    badge: string | null;
    in_stock: boolean;
}

interface Props {
    featuredProducts: Product[];
}

const categories = [
    { name: 'Serums', emoji: '💧', description: 'Activos concentrados', href: '/store/products?category=Serums', bg: 'bg-purple-50 hover:bg-purple-100' },
    { name: 'Toners', emoji: '🌿', description: 'Balance e hidratación', href: '/store/products?category=Toners', bg: 'bg-green-50 hover:bg-green-100' },
    { name: 'Cleansers', emoji: '✨', description: 'Limpieza profunda', href: '/store/products?category=Cleansers', bg: 'bg-pink-50 hover:bg-pink-100' },
    { name: 'Masks', emoji: '🎭', description: 'Tratamientos intensivos', href: '/store/products?category=Masks', bg: 'bg-blue-50 hover:bg-blue-100' },
    { name: 'Sunscreen', emoji: '☀️', description: 'Protección solar', href: '/store/products?category=Sunscreen', bg: 'bg-amber-50 hover:bg-amber-100' },
    { name: 'Makeup', emoji: '💄', description: 'K-Beauty makeup', href: '/store/products?category=Makeup', bg: 'bg-rose-50 hover:bg-rose-100' },
];

const features = [
    { icon: Truck, title: 'Envío Gratis', desc: 'En pedidos mayores a $50', color: 'text-pink-500' },
    { icon: Shield, title: 'Productos Auténticos', desc: '100% K-Beauty originales', color: 'text-purple-500' },
    { icon: RefreshCcw, title: 'Devoluciones Fáciles', desc: '30 días para devolver', color: 'text-green-500' },
    { icon: Headphones, title: 'Soporte 24/7', desc: 'Siempre disponibles', color: 'text-blue-500' },
];

function ProductCard({ product }: Readonly<{ product: Product }>) {
    const discount =
        product.original_price === null
            ? null
            : Math.round(((product.original_price - product.price) / product.original_price) * 100);

    return (
        <Link href={`/store/products/${product.slug}`} className="group block">
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.badge && (
                        <span className="absolute left-2 top-2 rounded-full bg-pink-500 px-2 py-0.5 text-xs font-semibold text-white">
                            {product.badge}
                        </span>
                    )}
                    {discount !== null && (
                        <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                            -{discount}%
                        </span>
                    )}
                </div>
                <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">{product.brand}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</h3>
                    <div className="mt-1.5 flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                            <Star
                                key={`star-${i}`}
                                className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                            />
                        ))}
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
                            {product.original_price !== null && (
                                <span className="text-xs text-gray-400 line-through">
                                    ${product.original_price.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <Button size="sm" className="h-8 bg-pink-500 text-xs text-white hover:bg-pink-600">
                            Agregar
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function StoreIndex({ featuredProducts }: Readonly<Props>) {
    return (
        <>
            <Head title="KBeauty Glow SV — Tu tienda de K-Beauty en El Salvador" />

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 py-16 lg:py-24">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-pink-200 opacity-40 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-purple-200 opacity-40 blur-3xl" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:text-left lg:gap-12">
                        <div className="max-w-xl lg:flex-1">
                            <Badge className="mb-4 border-pink-200 bg-pink-100 text-pink-700 hover:bg-pink-100">
                                ✨ Nuevos productos disponibles
                            </Badge>
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                                Descubre el secreto de la{' '}
                                <span className="text-pink-500">belleza coreana</span>
                            </h1>
                            <p className="mt-6 text-lg text-gray-600">
                                Los mejores productos K-Beauty, 100% auténticos. Desde Seúl hasta El Salvador, traemos la revolución del skincare directamente a ti.
                            </p>
                            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                                <Button size="lg" className="bg-pink-500 px-8 text-white hover:bg-pink-600" asChild>
                                    <Link href="/store/products">
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        Ver Catálogo
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/store/products?category=Serums">
                                        Explorar Serums
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                            <p className="mt-4 text-sm text-gray-400">
                                🚚 Envío gratis +$50 &nbsp;·&nbsp; 🔒 Pago seguro &nbsp;·&nbsp; ✅ Productos originales
                            </p>
                        </div>

                        <div className="mt-12 lg:mt-0 lg:flex-1 lg:flex lg:justify-end">
                            <div className="grid max-w-xs grid-cols-2 gap-3">
                                {featuredProducts.slice(0, 4).map((p) => (
                                    <div key={p.id} className="overflow-hidden rounded-2xl shadow-md">
                                        <img src={p.image} alt={p.name} className="h-32 w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Compra por Categoría</h2>
                        <p className="mt-2 text-gray-500">Encuentra exactamente lo que tu piel necesita</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {categories.map((cat) => (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                className={`flex flex-col items-center rounded-xl p-4 text-center transition-colors ${cat.bg}`}
                            >
                                <span className="text-3xl">{cat.emoji}</span>
                                <span className="mt-2 text-sm font-semibold text-gray-800">{cat.name}</span>
                                <span className="mt-1 text-xs text-gray-500">{cat.description}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Productos Destacados</h2>
                            <p className="mt-2 text-gray-500">Los favoritos de nuestra comunidad</p>
                        </div>
                        <Link
                            href="/store/products"
                            className="flex items-center text-sm font-medium text-pink-500 hover:text-pink-600"
                        >
                            Ver todos <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                        {features.map(({ icon: Icon, title, desc, color }) => (
                            <div
                                key={title}
                                className="flex flex-col items-center rounded-xl border bg-white p-6 text-center shadow-sm"
                            >
                                <div className="mb-3 rounded-full bg-gray-50 p-3">
                                    <Icon className={`h-6 w-6 ${color}`} />
                                </div>
                                <h3 className="font-semibold text-gray-900">{title}</h3>
                                <p className="mt-1 text-xs text-gray-500">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="bg-gradient-to-r from-pink-500 to-purple-600 py-16">
                <div className="mx-auto max-w-xl px-4 text-center">
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">¡Únete a la comunidad Glow!</h2>
                    <p className="mt-2 text-pink-100">
                        Recibe tips de K-Beauty, novedades y ofertas exclusivas.
                    </p>
                    <div className="mt-6 flex gap-2">
                        <input
                            type="email"
                            placeholder="tu@correo.com"
                            className="flex-1 rounded-lg border-0 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <Button className="bg-white px-6 font-semibold text-pink-600 hover:bg-pink-50">
                            Suscribir
                        </Button>
                    </div>
                    <p className="mt-3 text-xs text-pink-200">✅ Sin spam. Puedes cancelar cuando quieras.</p>
                </div>
            </section>
        </>
    );
}
