import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, BadgeCheck, MessageCircle, Search, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { createElement, useEffect, useState } from 'react';
import { ProductCard } from '@/components/store/product-card';
import type { StoreProduct } from '@/components/store/product-card';
import { Reveal } from '@/components/store/reveal';
import { categoryIcon, useStore } from '@/lib/store-config';

interface Category {
    name: string;
    count: number;
    image: string | null;
}

interface Props {
    featuredProducts: StoreProduct[];
    categories: Category[];
    brands: string[];
}

const perks = (freeShippingFrom: number) => [
    { icon: Truck, title: 'Envío gratis', desc: `En compras desde $${freeShippingFrom}` },
    { icon: BadgeCheck, title: '100% auténtico', desc: 'Directo de Corea, sin imitaciones' },
    { icon: ShieldCheck, title: 'Compra segura', desc: 'Confirmas tu pedido por WhatsApp' },
    { icon: Sparkles, title: 'Asesoría real', desc: 'Te ayudamos a armar tu rutina' },
];

const routine = [
    { step: '01', title: 'Limpia', desc: 'Doble limpieza para retirar maquillaje, protector e impurezas sin resecar tu piel.' },
    { step: '02', title: 'Trata', desc: 'Tónicos, serums y mascarillas con activos pensados para lo que tu piel necesita hoy.' },
    { step: '03', title: 'Protege', desc: 'Protector solar y humectación para mantener el glow durante todo el día.' },
];

function Eyebrow({ children, light = false }: Readonly<{ children: React.ReactNode; light?: boolean }>) {
    return (
        <p className={`flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] uppercase ${light ? 'text-white/70' : 'text-brand-mauve'}`}>
            <span className={`h-px w-8 ${light ? 'bg-white/40' : 'bg-brand-mauve/50'}`} />
            {children}
        </p>
    );
}

/** Foto del hero: al cambiar de producto entra con un fundido suave sobre la anterior. */
function RotatingShot({ shot, delay }: Readonly<{ shot: StoreProduct; delay: number }>) {
    const [current, setCurrent] = useState(shot);
    const [previous, setPrevious] = useState<StoreProduct | null>(null);

    if (shot.id !== current.id) {
        setPrevious(current);
        setCurrent(shot);
    }

    return (
        <div className="relative h-full w-full overflow-hidden rounded-t-full">
            {previous && <img src={previous.image ?? undefined} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <img
                key={current.id}
                src={current.image ?? undefined}
                alt={current.name}
                className="absolute inset-0 h-full w-full animate-[hero-fade_1000ms_ease-out_both] object-cover motion-reduce:animate-none"
                style={{ animationDelay: `${delay}ms` }}
            />
        </div>
    );
}

function Hero({ products }: Readonly<{ products: StoreProduct[] }>) {
    const STORE = useStore();
    const [query, setQuery] = useState('');
    const pool = products.filter((p) => p.image);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (pool.length <= 3 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const id = setInterval(() => setTick((t) => t + 1), 4500);

        return () => clearInterval(id);
    }, [pool.length]);

    // Las tres fotos avanzan juntas por el grupo, sin repetir producto en pantalla.
    const shots = [0, 1, 2].map((i) => pool[(tick * 3 + i) % Math.max(pool.length, 1)]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.get('/store/products', query.trim() ? { q: query.trim() } : {});
    }

    return (
        <section className="relative isolate overflow-hidden bg-brand-text text-white">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_85%_15%,rgba(168,82,122,0.55)_0%,transparent_65%),radial-gradient(55%_55%_at_5%_95%,rgba(155,142,196,0.45)_0%,transparent_65%),linear-gradient(135deg,#2E2748_0%,#3D3656_55%,#4A3A6B_100%)]" />
            <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full border border-white/5" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full border border-white/5" />

            <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
                <div>
                    <Eyebrow light>K-Beauty original · El Salvador</Eyebrow>
                    <h1 className="font-display mt-7 text-5xl leading-[1.02] font-medium tracking-tight sm:text-6xl lg:text-[5.25rem]">
                        Tu piel,
                        <br />
                        <span className="bg-gradient-to-r from-[#F6D9E6] via-[#E9C9F0] to-[#CFC5F5] bg-clip-text text-transparent italic">
                            en modo glow.
                        </span>
                    </h1>
                    <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/70">
                        Skincare coreano seleccionado a mano. Serums, protectores y parches que sí funcionan, listos para tu rutina.
                    </p>

                    <form onSubmit={submit} role="search" className="mt-9 flex max-w-lg items-center gap-2 rounded-full bg-white p-1.5 shadow-2xl shadow-black/30">
                        <Search className="ml-3 h-4 w-4 shrink-0 text-brand-mauve" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Buscar productos"
                            placeholder="Busca un serum, marca o categoría…"
                            className="min-w-0 flex-1 bg-transparent px-1 text-sm text-brand-text placeholder:text-brand-text/40 focus:outline-none"
                        />
                        <button className="rounded-full bg-brand-text px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-mauve">
                            Buscar
                        </button>
                    </form>

                    <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <Link href="/store/products" className="group inline-flex items-center gap-2 border-b border-white/40 pb-1 text-sm font-semibold tracking-wide transition-colors hover:border-white">
                            Ver catálogo completo
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <span className="inline-flex items-center gap-2 text-sm text-white/70">
                            <Truck className="h-4 w-4 text-[#F6D9E6]" /> Envío gratis desde ${STORE.freeShippingFrom}
                        </span>
                    </div>
                </div>

                <div className="relative mx-auto grid w-full max-w-md grid-cols-[1fr_1fr_0.85fr] items-end gap-3 sm:max-w-lg sm:gap-4">
                    {[
                        { shot: shots[0], className: 'h-80 sm:h-[26rem]' },
                        { shot: shots[1], className: 'h-64 sm:h-80 translate-y-6' },
                        { shot: shots[2], className: 'h-52 sm:h-64' },
                    ].map(({ shot, className }, i) =>
                        shot ? (
                            <div key={i} className={`overflow-hidden rounded-t-full border border-white/20 bg-white/5 p-1.5 shadow-2xl shadow-black/30 ${className}`}>
                                <RotatingShot shot={shot} delay={i * 150} />
                            </div>
                        ) : (
                            <div key={i} className={`rounded-t-full border border-white/15 bg-white/5 ${className}`} />
                        ),
                    )}
                    <div className="absolute -left-3 bottom-10 flex items-center gap-3 rounded-2xl border border-white/30 bg-white/90 px-4 py-3 text-brand-text shadow-2xl backdrop-blur sm:-left-8">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-blush text-brand-mauve">
                            <BadgeCheck className="h-5 w-5" strokeWidth={1.5} />
                        </span>
                        <div className="leading-tight">
                            <p className="text-sm font-semibold">100% original</p>
                            <p className="text-xs text-brand-text/60">Importado de Corea</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function BrandMarquee({ brands }: Readonly<{ brands: string[] }>) {
    if (brands.length === 0) {
        return null;
    }

    const row = [...brands, ...brands, ...brands, ...brands];

    return (
        <div className="overflow-hidden border-b border-brand-rose/60 bg-white py-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" aria-label="Marcas disponibles">
            <div className="flex w-max animate-[marquee_40s_linear_infinite] items-center gap-12 whitespace-nowrap motion-reduce:animate-none">
                {row.map((b, i) => (
                    <span key={`${b}-${i}`} className="flex items-center gap-12">
                        <Link
                            href={`/store/products?brand[]=${encodeURIComponent(b)}`}
                            className="font-display text-xl font-medium text-brand-text/40 italic transition-colors hover:text-brand-mauve"
                        >
                            {b}
                        </Link>
                        <span className="h-1 w-1 rounded-full bg-brand-mauve/40" />
                    </span>
                ))}
            </div>
        </div>
    );
}

function CategoryCard({ category, index }: Readonly<{ category: Category; index: number }>) {

    return (
        <Link
            href={`/store/products?category=${encodeURIComponent(category.name)}`}
            className={`group relative block aspect-[3/4] overflow-hidden rounded-[2rem] bg-brand-text ${index % 2 === 1 ? 'lg:translate-y-10' : ''}`}
        >
            {category.image ? (
                <img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-text via-[#5B4B86] to-brand-mauve" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2E2748] via-[#2E2748]/35 to-transparent" />

            <span className="absolute top-5 left-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
                {createElement(categoryIcon(category.name), { className: "h-5 w-5", strokeWidth: 1.5 })}
            </span>
            <span className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-white text-brand-text opacity-0 transition-all duration-300 group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" />
            </span>

            <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-white/70 uppercase">
                    {category.count} {category.count === 1 ? 'producto' : 'productos'}
                </p>
                <h3 className="font-display mt-1.5 text-2xl leading-tight font-medium text-white sm:text-[1.7rem]">{category.name}</h3>
                <span className="mt-3 block h-px w-10 bg-white/50 transition-all duration-500 group-hover:w-20" />
            </div>
        </Link>
    );
}

export default function StoreIndex({ featuredProducts, categories, brands }: Readonly<Props>) {
    const STORE = useStore();
    const tiles = categories.slice(0, 8);

    return (
        <>
            <Head title="KBeauty Glow SV — Tu tienda de K-Beauty en El Salvador" />

            <Hero products={featuredProducts} />
            <BrandMarquee brands={brands} />

            {tiles.length > 0 && (
                <section className="py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Reveal>
                            <div className="mb-14 flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <Eyebrow>Explora</Eyebrow>
                                    <h2 className="font-display mt-4 text-4xl font-medium text-brand-text sm:text-5xl">
                                        Compra por <span className="text-brand-mauve italic">categoría</span>
                                    </h2>
                                </div>
                                <Link href="/store/products" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-text">
                                    Ver todo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </Reveal>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:pb-10">
                            {tiles.map((cat, i) => (
                                <Reveal key={cat.name} delay={(i % 4) * 80}>
                                    <CategoryCard category={cat} index={i % 4} />
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-brand-blush/50 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <Eyebrow>Selección</Eyebrow>
                                <h2 className="font-display mt-4 text-4xl font-medium text-brand-text sm:text-5xl">
                                    Favoritos del <span className="text-brand-mauve italic">momento</span>
                                </h2>
                            </div>
                            <Link href="/store/products" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-text">
                                Ver catálogo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                        {featuredProducts.map((product, i) => (
                            <Reveal key={product.id} delay={(i % 4) * 70} className="h-full">
                                <ProductCard product={product} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="mx-auto max-w-2xl text-center">
                            <div className="flex justify-center"><Eyebrow>Tu ritual</Eyebrow></div>
                            <h2 className="font-display mt-4 text-4xl font-medium text-brand-text sm:text-5xl">
                                Una rutina en <span className="text-brand-mauve italic">tres pasos</span>
                            </h2>
                        </div>
                    </Reveal>
                    <div className="mt-14 grid gap-6 md:grid-cols-3">
                        {routine.map((r, i) => (
                            <Reveal key={r.step} delay={i * 90}>
                                <div className="relative h-full overflow-hidden rounded-[2rem] border border-brand-rose/70 bg-white p-8">
                                    <span className="font-display text-7xl leading-none font-medium text-brand-blush">{r.step}</span>
                                    <h3 className="font-display mt-4 text-2xl font-medium text-brand-text">{r.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-brand-text/65">{r.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="pb-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-px overflow-hidden rounded-[2rem] border border-brand-rose/70 bg-brand-rose/70 sm:grid-cols-2 lg:grid-cols-4">
                        {perks(STORE.freeShippingFrom).map(({ icon: Icon, title, desc }, i) => (
                            <Reveal key={title} delay={i * 70}>
                                <div className="flex h-full items-start gap-4 bg-white p-6">
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-blush text-brand-mauve">
                                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                                    </span>
                                    <div>
                                        <h3 className="font-display text-lg font-medium text-brand-text">{title}</h3>
                                        <p className="mt-0.5 text-sm text-brand-text/60">{desc}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 pb-24 sm:px-6 lg:px-8">
                <Reveal>
                    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-brand-rose/60 bg-gradient-to-br from-[#EFE6F8] via-[#F8EAF0] to-[#F3EFFC] px-6 py-20 text-center sm:px-12">
                        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-blush blur-3xl" />
                        <div className="relative flex justify-center"><Eyebrow>Asesoría gratuita</Eyebrow></div>
                        <h2 className="font-display relative mt-5 text-4xl font-medium text-brand-text sm:text-5xl">¿No sabes por dónde empezar?</h2>
                        <p className="relative mx-auto mt-4 max-w-xl text-brand-text/70">
                            Cuéntanos tu tipo de piel y te armamos una rutina a tu medida. Sin costo, por WhatsApp.
                        </p>
                        <a
                            href={STORE.whatsappUrl('¡Hola! Me gustaría que me ayuden a armar mi rutina de skincare.')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative mt-9 inline-flex items-center gap-2 rounded-full bg-brand-text px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-brand-text/20 transition-transform hover:scale-105"
                        >
                            <MessageCircle className="h-4 w-4 text-white" /> Hablar con una asesora
                        </a>
                    </div>
                </Reveal>
            </section>
        </>
    );
}
