import { Head, Link, router } from '@inertiajs/react';
import { SlidersHorizontal, ChevronRight, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';

interface Product {
    id: number;
    name: string;
    slug: string;
    brand: string;
    category: string;
    price: number;
    original_price: number | null;
    image: string | null;
    in_stock: boolean;
}

interface Props {
    products: Product[];
    categories: string[];
    currentCategory: string;
}

function ProductCard({ product }: Readonly<{ product: Product }>) {
    const { addItem, setCartOpen } = useCart();
    const discount =
        product.original_price === null
            ? null
            : Math.round(((product.original_price - product.price) / product.original_price) * 100);

    return (
        <Link href={`/store/products/${product.slug}`} className="group block">
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-200">
                            <Package className="h-16 w-16" />
                        </div>
                    )}
                    {!product.in_stock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">
                                Agotado
                            </span>
                        </div>
                    )}
                    {discount !== null && (
                        <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                            -{discount}%
                        </span>
                    )}
                </div>
                <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold">{product.brand}</p>
                    <p className="text-xs text-gray-400">{product.category}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</h3>
                    <div className="mt-3 flex items-center justify-between">
                        <div>
                            <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
                            {product.original_price !== null && (
                                <span className="ml-2 text-xs text-gray-400 line-through">
                                    ${product.original_price.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <Button
                            size="sm"
                            className="h-8 gap-1.5 bg-brand-gold text-xs text-white hover:bg-brand-gold-dark"
                            disabled={!product.in_stock}
                            onClick={(e) => {
                                e.preventDefault();
                                addItem({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.image });
                                setCartOpen(true);
                            }}
                        >
                            <ShoppingCart className="h-3 w-3" />
                            {product.in_stock ? 'Agregar' : 'Agotado'}
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function StoreProducts({ products, categories, currentCategory }: Readonly<Props>) {
    const allCategories = ['all', ...categories];

    const handleCategory = (cat: string) => {
        router.get(
            '/store/products',
            cat === 'all' ? {} : { category: cat },
            { preserveState: true },
        );
    };

    const isActive = (cat: string) =>
        cat === 'all'
            ? !currentCategory || currentCategory === 'all'
            : currentCategory === cat;

    return (
        <>
            <Head title="Productos — KBeauty Glow SV" />

            {/* Page header */}
            <div className="py-10" style={{ background: 'linear-gradient(to right, #F8F6FF, #EDE9FB)' }}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <nav className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                        <Link href="/store" className="hover:text-brand-gold">
                            Inicio
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-gray-700">Productos</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {currentCategory && currentCategory !== 'all' ? currentCategory : 'Todos los Productos'}
                    </h1>
                    <p className="mt-1 text-gray-500">{products.length} productos disponibles</p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Category filters */}
                <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
                    <SlidersHorizontal className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="shrink-0 text-sm font-medium text-gray-600">Categorías:</span>
                    {allCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategory(cat)}
                            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                isActive(cat)
                                    ? 'bg-brand-gold text-white'
                                    : 'border bg-white text-brand-text hover:border-brand-rose hover:text-brand-gold'
                            }`}
                        >
                            {cat === 'all' ? 'Todos' : cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {products.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-gray-400">No hay productos en esta categoría.</p>
                        <Button variant="outline" className="mt-4" onClick={() => handleCategory('all')}>
                            Ver todos los productos
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
