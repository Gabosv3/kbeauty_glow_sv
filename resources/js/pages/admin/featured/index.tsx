import { Head, router } from '@inertiajs/react';
import { Package, Star } from 'lucide-react';
import Heading from '@/components/heading';
import { admin } from '@/lib/admin-routes';

type Product = {
    id: number;
    name: string;
    brand: string | null;
    category: string | null;
    stock: number;
    image: string | null;
    featured: boolean;
};

export default function FeaturedIndex({ products }: Readonly<{ products: Product[] }>) {
    const count = products.filter((p) => p.featured).length;

    function toggle(p: Product) {
        router.post(admin.featured.toggle(p.id), {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Destacados" />
            <div className="space-y-6 p-6">
                <Heading
                    title="Productos destacados"
                    description={`Los destacados aparecen primero en la portada de la tienda. Ahora: ${count}. Si no marcas ninguno, se muestran los que tienen más stock.`}
                    variant="small"
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => toggle(p)}
                            aria-pressed={p.featured}
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40 ${
                                p.featured ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/20' : ''
                            }`}
                        >
                            <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md bg-muted">
                                {p.image ? (
                                    <img src={p.image} alt="" className="size-full object-cover" />
                                ) : (
                                    <Package className="size-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{p.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {[p.brand, p.category].filter(Boolean).join(' · ') || 'Sin marca'}
                                </p>
                                <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
                            </div>
                            <Star className={`size-5 shrink-0 ${p.featured ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`} />
                        </button>
                    ))}
                    {products.length === 0 && <p className="text-sm text-muted-foreground">No hay productos activos.</p>}
                </div>
            </div>
        </>
    );
}
