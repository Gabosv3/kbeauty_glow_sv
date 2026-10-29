import { Head, Link, router } from '@inertiajs/react';
import { ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { ProductCard } from '@/components/store/product-card';
import type { StoreProduct } from '@/components/store/product-card';
import { Reveal } from '@/components/store/reveal';

interface Filters {
    q: string;
    category: string;
    brand: string[];
    available: boolean;
    max: number | null;
    sort: string;
}

interface Props {
    products: StoreProduct[];
    categories: string[];
    brands: string[];
    priceCeiling: number;
    filters: Filters;
}

const sorts = [
    { value: 'featured', label: 'Destacados' },
    { value: 'price_asc', label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' },
    { value: 'name', label: 'Nombre (A–Z)' },
];

/** Los filtros viven en la URL: se pueden compartir y el botón "atrás" funciona. */
function navigate(next: Filters) {
    const params: Record<string, string | string[]> = {};

    if (next.q) {
        params.q = next.q;
    }

    if (next.category !== 'all') {
        params.category = next.category;
    }

    if (next.brand.length > 0) {
        params.brand = next.brand;
    }

    if (next.available) {
        params.available = '1';
    }

    if (next.max !== null) {
        params.max = String(next.max);
    }

    if (next.sort !== 'featured') {
        params.sort = next.sort;
    }

    router.get('/store/products', params, { preserveState: true, preserveScroll: true, replace: true });
}

function Chip({ active, onClick, children }: Readonly<{ active: boolean; onClick: () => void; children: React.ReactNode }>) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                    ? 'border-brand-gold-dark bg-brand-gold-dark text-white'
                    : 'border-brand-rose bg-white text-brand-text hover:border-brand-gold hover:text-brand-gold-dark'
            }`}
        >
            {children}
        </button>
    );
}

function FilterPanel({ categories, brands, priceCeiling, filters }: Readonly<Omit<Props, 'products'>>) {
    const [price, setPrice] = useState<number>(filters.max ?? priceCeiling);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const set = (patch: Partial<Filters>) => navigate({ ...filters, ...patch });

    function onPrice(value: number) {
        setPrice(value);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => set({ max: value >= priceCeiling ? null : value }), 350);
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-display mb-3 text-lg font-semibold text-brand-text">Categoría</h3>
                <div className="flex flex-wrap gap-2">
                    <Chip active={filters.category === 'all'} onClick={() => set({ category: 'all' })}>
                        Todas
                    </Chip>
                    {categories.map((c) => (
                        <Chip key={c} active={filters.category === c} onClick={() => set({ category: c })}>
                            {c}
                        </Chip>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-display mb-3 text-lg font-semibold text-brand-text">Marca</h3>
                <div className="space-y-1">
                    {brands.map((b) => {
                        const checked = filters.brand.includes(b);

                        return (
                            <label key={b} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-brand-text hover:bg-brand-cream-alt">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => set({ brand: checked ? filters.brand.filter((x) => x !== b) : [...filters.brand, b] })}
                                    className="h-4 w-4 rounded border-brand-wood accent-brand-gold-dark"
                                />
                                {b}
                            </label>
                        );
                    })}
                </div>
            </div>

            {priceCeiling > 0 && (
                <div>
                    <div className="mb-3 flex items-baseline justify-between">
                        <h3 className="font-display text-lg font-semibold text-brand-text">Precio máximo</h3>
                        <span className="text-sm font-semibold text-brand-gold-dark">${price}</span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={priceCeiling}
                        value={price}
                        onChange={(e) => onPrice(Number(e.target.value))}
                        aria-label="Precio máximo"
                        className="w-full accent-brand-gold-dark"
                    />
                    <div className="flex justify-between text-xs text-brand-text/50">
                        <span>$1</span>
                        <span>${priceCeiling}</span>
                    </div>
                </div>
            )}

            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-brand-rose bg-white px-4 py-3 text-sm font-medium text-brand-text">
                Solo disponibles
                <input
                    type="checkbox"
                    checked={filters.available}
                    onChange={(e) => set({ available: e.target.checked })}
                    className="h-4 w-4 accent-brand-gold-dark"
                />
            </label>
        </div>
    );
}

export default function StoreProducts({ products, categories, brands, priceCeiling, filters }: Readonly<Props>) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [search, setSearch] = useState(filters.q);

    const activeCount =
        (filters.category !== 'all' ? 1 : 0) + filters.brand.length + (filters.available ? 1 : 0) + (filters.max !== null ? 1 : 0);

    const clearAll = () => navigate({ q: '', category: 'all', brand: [], available: false, max: null, sort: filters.sort });

    const panelKey = `${filters.max}-${priceCeiling}`;
    const panel = <FilterPanel key={panelKey} categories={categories} brands={brands} priceCeiling={priceCeiling} filters={filters} />;

    return (
        <>
            <Head title="Productos — KBeauty Glow SV" />

            <div className="relative overflow-hidden bg-gradient-to-br from-brand-cream via-brand-cream-alt to-brand-rose/50 py-12 sm:py-16">
                <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-brand-rose/60 blur-3xl" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <nav aria-label="Ruta" className="mb-3 flex items-center gap-2 text-xs text-brand-text/50">
                        <Link href="/store" className="hover:text-brand-gold-dark">Inicio</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-brand-text">Productos</span>
                    </nav>
                    <h1 className="font-display text-4xl font-semibold text-brand-text sm:text-5xl">
                        {filters.category !== 'all' ? filters.category : 'Todo el catálogo'}
                    </h1>

                    <form
                        role="search"
                        onSubmit={(e) => {
                            e.preventDefault();
                            navigate({ ...filters, q: search.trim() });
                        }}
                        className="mt-6 flex max-w-xl items-center gap-2 rounded-full border border-brand-rose bg-white p-1.5 shadow-lg shadow-brand-gold/10"
                    >
                        <Search className="ml-3 h-4 w-4 shrink-0 text-brand-gold" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Buscar en el catálogo"
                            placeholder="Buscar por nombre, marca o categoría…"
                            className="min-w-0 flex-1 bg-transparent px-1 text-sm text-brand-text placeholder:text-brand-text/40 focus:outline-none"
                        />
                        <button className="rounded-full bg-brand-text px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-gold-dark">Buscar</button>
                    </form>
                </div>
            </div>

            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[17rem_1fr] lg:px-8">
                <aside className="hidden lg:block">
                    <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">{panel}</div>
                </aside>

                <section>
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-brand-text/60">
                            <span className="font-semibold text-brand-text">{products.length}</span>{' '}
                            {products.length === 1 ? 'producto' : 'productos'}
                            {filters.q && (
                                <>
                                    {' '}para “<span className="text-brand-text">{filters.q}</span>”
                                </>
                            )}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                className="inline-flex items-center gap-2 rounded-full border border-brand-rose bg-white px-4 py-2 text-sm font-medium text-brand-text lg:hidden"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filtros{activeCount > 0 && <span className="rounded-full bg-brand-gold-dark px-1.5 text-xs text-white">{activeCount}</span>}
                            </button>
                            <select
                                value={filters.sort}
                                onChange={(e) => navigate({ ...filters, sort: e.target.value })}
                                aria-label="Ordenar por"
                                className="rounded-full border border-brand-rose bg-white px-4 py-2 text-sm font-medium text-brand-text focus:outline-2 focus:outline-brand-gold"
                            >
                                {sorts.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(activeCount > 0 || filters.q) && (
                        <div className="mb-6 flex flex-wrap items-center gap-2">
                            {filters.q && (
                                <button type="button" onClick={() => {
 setSearch(''); navigate({ ...filters, q: '' }); 
}} className="inline-flex items-center gap-1.5 rounded-full bg-brand-cream-alt px-3 py-1 text-xs font-medium text-brand-gold-dark">
                                    “{filters.q}” <X className="h-3 w-3" />
                                </button>
                            )}
                            {filters.category !== 'all' && (
                                <button type="button" onClick={() => navigate({ ...filters, category: 'all' })} className="inline-flex items-center gap-1.5 rounded-full bg-brand-cream-alt px-3 py-1 text-xs font-medium text-brand-gold-dark">
                                    {filters.category} <X className="h-3 w-3" />
                                </button>
                            )}
                            {filters.brand.map((b) => (
                                <button key={b} type="button" onClick={() => navigate({ ...filters, brand: filters.brand.filter((x) => x !== b) })} className="inline-flex items-center gap-1.5 rounded-full bg-brand-cream-alt px-3 py-1 text-xs font-medium text-brand-gold-dark">
                                    {b} <X className="h-3 w-3" />
                                </button>
                            ))}
                            {filters.max !== null && (
                                <button type="button" onClick={() => navigate({ ...filters, max: null })} className="inline-flex items-center gap-1.5 rounded-full bg-brand-cream-alt px-3 py-1 text-xs font-medium text-brand-gold-dark">
                                    Hasta ${filters.max} <X className="h-3 w-3" />
                                </button>
                            )}
                            {filters.available && (
                                <button type="button" onClick={() => navigate({ ...filters, available: false })} className="inline-flex items-center gap-1.5 rounded-full bg-brand-cream-alt px-3 py-1 text-xs font-medium text-brand-gold-dark">
                                    Solo disponibles <X className="h-3 w-3" />
                                </button>
                            )}
                            <button type="button" onClick={() => {
 setSearch(''); clearAll(); 
}} className="text-xs font-medium text-brand-text/60 underline underline-offset-2 hover:text-brand-text">
                                Limpiar todo
                            </button>
                        </div>
                    )}

                    {products.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-brand-wood bg-white px-6 py-20 text-center">
                            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-blush text-brand-mauve">
                                <Search className="h-7 w-7" strokeWidth={1.25} />
                            </span>
                            <h2 className="font-display mt-4 text-2xl font-semibold text-brand-text">Nada por aquí… todavía</h2>
                            <p className="mt-1 text-sm text-brand-text/60">Prueba con otros filtros o escríbenos y lo conseguimos para ti.</p>
                            <button type="button" onClick={() => {
 setSearch(''); navigate({ q: '', category: 'all', brand: [], available: false, max: null, sort: 'featured' }); 
}} className="mt-6 rounded-full bg-brand-gold-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-text">
                                Ver todo el catálogo
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                            {products.map((product, i) => (
                                <Reveal key={product.id} delay={(i % 3) * 60} className="h-full">
                                    <ProductCard product={product} />
                                </Reveal>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
                    <button type="button" aria-label="Cerrar filtros" className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[2rem] bg-brand-cream p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="font-display text-2xl font-semibold text-brand-text">Filtros</h2>
                            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Cerrar" className="rounded-full p-2 hover:bg-brand-cream-alt">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {panel}
                        <button type="button" onClick={() => setMobileOpen(false)} className="mt-8 w-full rounded-full bg-brand-gold-dark py-3.5 text-sm font-semibold text-white">
                            Ver {products.length} {products.length === 1 ? 'producto' : 'productos'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
