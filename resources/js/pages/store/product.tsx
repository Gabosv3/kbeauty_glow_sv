import { Head, Link } from '@inertiajs/react';
import { MessageCircle, Heart, ChevronRight, Package, Truck, Shield, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/cart-context';

const WA_NUMBER = '50360330849';

interface Product {
    id: number;
    name: string;
    slug: string;
    brand: string;
    category: string;
    price: number;
    original_price: number | null;
    image: string | null;
    description: string;
    in_stock: boolean;
}

interface Props {
    product: Product;
    relatedProducts: Product[];
}

function buildWhatsAppUrl(productName: string, price: number, qty: number): string {
    const total = (price * qty).toFixed(2);
    const msg =
        `¡Hola! Me interesa pedir lo siguiente:\n\n*${productName}*\nPrecio unitario: $${price.toFixed(2)}\nCantidad: ${qty}\nTotal: $${total}\n\n¿Está disponible? 😊`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function StoreProduct({ product, relatedProducts }: Readonly<Props>) {
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const { addItem, setCartOpen } = useCart();

    const discount =
        product.original_price === null
            ? null
            : Math.round(((product.original_price - product.price) / product.original_price) * 100);

    function handleAddToCart() {
        addItem(
            {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.image,
            },
            quantity,
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    }

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
                    {/* Imagen */}
                    <div>
                        <div className="relative overflow-hidden rounded-2xl border bg-gray-50">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="aspect-square h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex aspect-square items-center justify-center text-gray-300">
                                    <Package className="h-24 w-24" />
                                </div>
                            )}
                            {discount !== null && (
                                <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                                    -{discount}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold uppercase tracking-wide text-brand-gold">
                                {product.brand}
                            </span>
                            {product.category && (
                                <>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-sm text-gray-400">{product.category}</span>
                                </>
                            )}
                        </div>

                        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>

                        {/* Precio */}
                        <div className="mt-4 flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                            {product.original_price !== null && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">
                                        ${product.original_price.toFixed(2)}
                                    </span>
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-600">
                                        -{discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Stock */}
                        <div className="mt-3">
                            {product.in_stock ? (
                                <span className="flex items-center gap-1.5 text-sm text-green-600">
                                    <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-green-500" />
                                    {' '}En stock — listo para enviar
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-sm text-red-500">
                                    <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-red-500" />
                                    {' '}Agotado temporalmente
                                </span>
                            )}
                        </div>

                        <Separator className="my-5" />

                        {product.description && (
                            <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
                        )}

                        {/* Cantidad + Botones */}
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
                                {/* Agregar al carrito */}
                                <Button
                                    size="lg"
                                    className="flex-1 bg-brand-gold text-white hover:bg-brand-gold-dark"
                                    disabled={!product.in_stock}
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    {(() => {
                                        if (added) return '¡Agregado! ✓';
                                        return product.in_stock ? 'Agregar al carrito' : 'Agotado';
                                    })()}
                                </Button>
                                {/* Wish list */}
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-brand-rose text-brand-gold hover:bg-[#EEE9FB]"
                                    aria-label="Agregar a lista de deseos"
                                >
                                    <Heart className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Ver carrito / Pedir directo */}
                            {product.in_stock && (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCartOpen(true)}
                                        className="flex-1 rounded-lg border border-brand-rose py-2.5 text-sm font-medium text-brand-gold transition-colors hover:bg-[#EEE9FB]"
                                    >
                                        Ver carrito
                                    </button>
                                    <a
                                        href={buildWhatsAppUrl(product.name, product.price, quantity)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2.5 text-sm font-medium text-white hover:bg-[#1ebe5d]"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        Pedir solo este
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Información de envío */}
                        <div className="mt-6 space-y-2 rounded-xl bg-brand-cream-alt p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck className="h-4 w-4 text-brand-gold" />
                                <span>Envío gratis en pedidos mayores a $50</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Package className="h-4 w-4 text-brand-gold" />
                                <span>Entrega estimada: 3 a 5 días hábiles</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Shield className="h-4 w-4 text-brand-gold" />
                                <span>Producto 100% auténtico garantizado</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Productos Relacionados */}
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
                                            {related.image ? (
                                                <img
                                                    src={related.image}
                                                    alt={related.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-gray-200">
                                                    <Package className="h-10 w-10" />
                                                </div>
                                            )}
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