import { Link } from '@inertiajs/react';
import { Package, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';

export interface StoreProduct {
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

export function ProductCard({ product }: Readonly<{ product: StoreProduct }>) {
    const { addItem, setCartOpen } = useCart();
    const discount =
        product.original_price === null
            ? null
            : Math.round(((product.original_price - product.price) / product.original_price) * 100);

    function handleAdd(e: React.MouseEvent) {
        e.preventDefault();
        addItem({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.image });
        setCartOpen(true);
    }

    return (
        <Link href={`/store/products/${product.slug}`} className="group flex h-full">
            <article className="flex w-full flex-col overflow-hidden rounded-2xl border border-brand-rose/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-xl hover:shadow-brand-gold/15">
                <div className="relative aspect-square overflow-hidden bg-brand-cream">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-brand-wood">
                            <Package className="h-16 w-16" />
                        </div>
                    )}
                    {!product.in_stock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                            <span className="rounded-full bg-brand-text px-3 py-1 text-xs font-semibold text-white">Agotado</span>
                        </div>
                    )}
                    {discount !== null && (
                        <span className="absolute left-3 top-3 rounded-full bg-brand-mauve px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-sm">
                            -{discount}%
                        </span>
                    )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-gold">{product.brand}</p>
                    <h3 className="mt-1 line-clamp-2 flex-1 text-sm font-medium leading-snug text-brand-text">{product.name}</h3>
                    {product.category && <p className="mt-1 text-xs text-brand-text/50">{product.category}</p>}
                    <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-bold text-brand-text">${product.price.toFixed(2)}</span>
                            {product.original_price !== null && (
                                <span className="text-xs text-brand-text/40 line-through">${product.original_price.toFixed(2)}</span>
                            )}
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={!product.in_stock}
                            aria-label={`Agregar ${product.name} al carrito`}
                            className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand-gold px-0 w-9 sm:w-auto sm:px-3.5 text-xs font-medium text-white transition-colors hover:bg-brand-gold-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Agregar</span>
                        </button>
                    </div>
                </div>
            </article>
        </Link>
    );
}
