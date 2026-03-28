import { Head, Link } from '@inertiajs/react';
import { Star, ShoppingCart, Heart, ChevronRight, Package, Truck, Shield } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
    description: string;
    ingredients?: string;
    in_stock: boolean;
}

interface Props {
    product: Product;
    relatedProducts: Product[];
}

function StarRating({ rating, size = 'sm' }: Readonly<{ rating: number; size?: 'sm' | 'lg' }>) {
    const cls = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';

    return (
        <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={`star-${i}`}
                    className={`${cls} ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                />
            ))}
        </div>
    );
}

type Tab = 'description' | 'ingredients' | 'reviews';

export default function StoreProduct({ product, relatedProducts }: Readonly<Props>) {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<Tab>('description');

    const discount =
        product.original_price === null
            ? null
            : Math.round(((product.original_price - product.price) / product.original_price) * 100);

    const tabs: { id: Tab; label: string }[] = [
        { id: 'description', label: 'Descripción' },
        { id: 'ingredients', label: 'Ingredientes' },
        { id: 'reviews', label: `Reseñas (${product.reviews})` },
    ];

    return (
        <>
            <Head title={`${product.name} — KBeauty Glow SV`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    <Link href="/store" className="hover:text-brand-gold">
                        Inicio
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                        <Link href="/store/products" className="hover:text-brand-gold">
                        Productos
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link
                        href={`/store/products?category=${product.category}`}
                        className="hover:text-brand-gold"
                    >
                        {product.category}
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="line-clamp-1 max-w-xs text-gray-700">{product.name}</span>
                </nav>

                {/* Product layout */}
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* Images */}
                    <div className="space-y-3">
                        <div className="relative overflow-hidden rounded-2xl border bg-gray-50">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="aspect-square h-full w-full object-cover"
                            />
                            {product.badge && (
                                <span className="absolute left-4 top-4 rounded-full bg-pink-500 px-3 py-1 text-sm font-semibold text-white">
                                    {product.badge}
                                </span>
                            )}
                            {Boolean(discount) && (
                                <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                                    -{discount}%
                                </span>
                            )}
                        </div>
                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 4 }, (_, i) => (
                                <div
                                    key={`thumb-${i}`}
                                    className={`aspect-square cursor-pointer overflow-hidden rounded-lg border-2 bg-gray-50 ${
                                        i === 0 ? 'border-pink-500' : 'border-transparent'
                                    }`}
                                >
                                    <img
                                        src={product.image}
                                        alt=""
                                        className="h-full w-full object-cover opacity-70 hover:opacity-100"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold uppercase tracking-wide text-brand-gold">
                                {product.brand}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-sm text-gray-400">{product.category}</span>
                        </div>

                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>

                        {/* Rating */}
                        <div className="mt-3 flex items-center gap-3">
                            <StarRating rating={product.rating} size="lg" />
                            <span className="text-lg font-semibold text-gray-800">{product.rating}</span>
                            <span className="text-sm text-gray-400">({product.reviews} reseñas)</span>
                        </div>

                        {/* Price */}
                        <div className="mt-4 flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                            {product.original_price !== null && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">
                                        ${product.original_price.toFixed(2)}
                                    </span>
                                    <Badge className="border-red-200 bg-red-100 text-red-600 hover:bg-red-100">
                                        -{discount}% OFF
                                    </Badge>
                                </>
                            )}
                        </div>

                        {/* Stock */}
                        <div className="mt-3">
                            {product.in_stock ? (
                                <span className="flex items-center gap-1.5 text-sm text-green-600">
                                    <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-green-500" />{' '}
                                    En stock — listo para enviar
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-sm text-red-500">
                                    <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-red-500" />{' '}
                                    Agotado temporalmente
                                </span>
                            )}
                        </div>

                        <Separator className="my-5" />

                        <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>

                        {/* Quantity + Cart */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                                <div className="flex items-center rounded-lg border">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-50"
                                        aria-label="Reducir cantidad"
                                    >
                                        −
                                    </button>
                                    <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-50"
                                        aria-label="Aumentar cantidad"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    size="lg"
                                    className="flex-1 bg-brand-gold text-white hover:bg-brand-gold-dark"
                                    disabled={!product.in_stock}
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    {product.in_stock ? 'Agregar al Carrito' : 'Agotado'}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-brand-rose text-brand-gold hover:bg-[#F5E8E5]"
                                    aria-label="Agregar a lista de deseos"
                                >
                                    <Heart className="h-4 w-4" />
                                </Button>
                            </div>

                            {product.in_stock && (
                                <Button size="lg" variant="outline" className="w-full">
                                    Comprar Ahora
                                </Button>
                            )}
                        </div>

                        {/* Shipping info */}
                        <div className="mt-6 space-y-2 rounded-xl p-4" style={{ backgroundColor: '#FFF5F0' }}>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck className="h-4 w-4 text-brand-gold" />
                                <span>Envío gratis en pedidos mayores a $50</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Package className="h-4 w-4 text-brand-gold" />
                                <span>Entrega estimada: 3-5 días hábiles</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Shield className="h-4 w-4 text-brand-gold" />
                                <span>Producto 100% auténtico garantizado</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-14">
                    <div className="flex border-b">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-brand-gold text-brand-gold'
                                        : 'text-gray-500 hover:text-brand-text'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="py-6">
                        {activeTab === 'description' && (
                            <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
                        )}
                        {activeTab === 'ingredients' && (
                            <p className="text-sm leading-relaxed text-gray-600">
                                {product.ingredients ?? 'Información de ingredientes próximamente.'}
                            </p>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="flex flex-col items-center py-8 text-center">
                                <StarRating rating={product.rating} size="lg" />
                                <p className="mt-2 text-2xl font-bold text-gray-800">{product.rating} / 5</p>
                                <p className="text-sm text-gray-400">Basado en {product.reviews} reseñas</p>
                                <p className="mt-4 text-sm text-gray-400">
                                    Las reseñas detalladas estarán disponibles pronto.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="mb-6 text-xl font-bold text-gray-900">Productos Relacionados</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {relatedProducts.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/store/products/${related.slug}`}
                                    className="group block"
                                >
                                    <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md">
                                        <div className="aspect-square overflow-hidden bg-gray-50">
                                            <img
                                                src={related.image}
                                                alt={related.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-xs font-semibold text-brand-gold">{related.brand}</p>
                                            <h3 className="mt-0.5 line-clamp-2 text-xs font-semibold text-gray-900">
                                                {related.name}
                                            </h3>
                                            <p className="mt-1.5 text-sm font-bold text-gray-900">
                                                ${related.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
