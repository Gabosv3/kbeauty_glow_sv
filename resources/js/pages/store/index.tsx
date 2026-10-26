import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Search, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useState } from 'react';
import { ProductCard } from '@/components/store/product-card';
import type { StoreProduct } from '@/components/store/product-card';
import { Reveal } from '@/components/store/reveal';
import { categoryEmoji, STORE } from '@/lib/store-config';

interface Props {
    featuredProducts: StoreProduct[];
    categories: { name: string; count: number }[];
    brands: string[];
}

const perks = [
    { icon: Truck, title: 'Envío gratis', desc: `En compras desde $${STORE.freeShippingFrom}` },
    { icon: BadgeCheck, title: '100% auténtico', desc: 'Directo de Corea, sin imitaciones' },
    { icon: ShieldCheck, title: 'Compra segura', desc: 'Confirmas tu pedido por WhatsApp' },
    { icon: Sparkles, title: 'Asesoría real', desc: 'Te ayudamos a armar tu rutina' },
];

function Hero({ products }: Readonly<{ products: StoreProduct[] }>) {
    const [query, setQuery] = useState('');
    const shots = products.filter((p) => p.image).slice(0, 3);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.get('/store/products', query.trim() ? { q: query.trim() } : {});
    }

    return (
        <section className="relative isolate overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_80%_10%,#D5CEFB_0%,transparent_70%),radial-gradient(50%_40%_at_5%_90%,#E8E4F9_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent_70%,var(--color-brand-cream))]" />

            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-24">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-rose bg-white/70 px-3.5 py-1.5 text-xs font-medium text-brand-gold-dark backdrop-blur">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-gold" />
                        K-Beauty original · El Salvador
                    </span>
                    <h1 className="font-display mt-6 text-5xl leading-[1.02] font-semibold tracking-tight text-brand-text sm:text-6xl lg:text-7xl">
                        Tu piel,
                        <br />
                        <span className="bg-gradient-to-r from-brand-gold to-brand-gold-dark bg-clip-text text-transparent italic">
                            en modo glow.
                        </span>
                    </h1>
                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-brand-text/70">
                        Skincare coreano seleccionado a mano. Serums, protectores y parches que sí funcionan, listos para tu rutina.
                    </p>

                    <form onSubmit={submit} role="search" className="mt-8 flex max-w-lg items-center gap-2 rounded-full border border-brand-rose bg-white p-1.5 shadow-lg shadow-brand-gold/10">
                        <Search className="ml-3 h-4 w-4 shrink-0 text-brand-gold" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Buscar productos"
                            placeholder="Busca un serum, marca o categoría…"
                            className="min-w-0 flex-1 bg-transparent px-1 text-sm text-brand-text placeholder:text-brand-text/40 focus:outline-none"
                        />
                        <button className="rounded-full bg-brand-text px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-gold-dark">
                            Buscar
                        </button>
                    </form>

                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-brand-text/70">
                        <Link href="/store/products" className="group inline-flex items-center gap-2 font-semibold text-brand-gold-dark">
                            Ver catálogo completo
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <span className="hidden h-4 w-px bg-brand-rose sm:block" />
                        <span>🚚 Envío gratis +${STORE.freeShippingFrom}</span>
                    </div>
                </div>

                <div className="relative mx-auto grid w-full max-w-md grid-cols-6 grid-rows-6 gap-3 sm:max-w-lg" style={{ aspectRatio: '1 / 1.05' }}>
                    {shots[0] && (
                        <div className="col-span-4 row-span-4 overflow-hidden rounded-[2rem] border-4 border-white bg-brand-cream shadow-2xl shadow-brand-gold/25">
                            <img src={shots[0].image ?? undefined} alt={shots[0].name} className="h-full w-full object-cover" />
                        </div>
                    )}
                    {shots[1] && (
                        <div className="col-span-2 col-start-5 row-span-3 overflow-hidden rounded-[1.5rem] border-4 border-white bg-brand-cream shadow-xl shadow-brand-gold/20">
                            <img src={shots[1].image ?? undefined} alt={shots[1].name} className="h-full w-full object-cover" />
                        </div>
                    )}
                    {shots[2] && (
                        <div className="col-span-3 col-start-3 row-span-2 row-start-5 overflow-hidden rounded-[1.5rem] border-4 border-white bg-brand-cream shadow-xl shadow-brand-gold/20">
                            <img src={shots[2].image ?? undefined} alt={shots[2].name} className="h-full w-full object-cover" />
                        </div>
                    )}
                    <div className="absolute -left-2 bottom-8 flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-xl backdrop-blur sm:-left-6">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-cream-alt text-lg">✨</span>
                        <div className="leading-tight">
                            <p className="text-sm font-semibold text-brand-text">100% original</p>
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
        <div className="overflow-hidden border-y border-brand-rose/60 bg-white py-5 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" aria-label="Marcas disponibles">
            <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-12 whitespace-nowrap motion-reduce:animate-none">
                {row.map((b, i) => (
                    <Link
                        key={`${b}-${i}`}
                        href={`/store/products?brand[]=${encodeURIComponent(b)}`}
                        className="font-display text-xl font-medium text-brand-text/40 transition-colors hover:text-brand-gold"
                    >
                        {b}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function StoreIndex({ featuredProducts, categories, brands }: Readonly<Props>) {
    const tiles = categories.slice(0, 6);

    return (
        <>
            <Head title="KBeauty Glow SV — Tu tienda de K-Beauty en El Salvador" />

            <Hero products={featuredProducts} />
            <BrandMarquee brands={brands} />

            {tiles.length > 0 && (
                <section className="py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Reveal>
                            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.2em] text-brand-gold uppercase">Explora</p>
                                    <h2 className="font-display mt-2 text-4xl font-semibold text-brand-text sm:text-5xl">Compra por categoría</h2>
                                </div>
                                <Link href="/store/products" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-gold-dark">
                                    Ver todo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </Reveal>

                        <div className="grid auto-rows-[10rem] grid-cols-2 gap-4 md:grid-cols-4">
                            {tiles.map((cat, i) => (
                                <Reveal key={cat.name} delay={i * 60} className={i === 0 ? 'col-span-2 row-span-2' : i === 3 ? 'md:col-span-2' : ''}>
                                    <Link
                                        href={`/store/products?category=${encodeURIComponent(cat.name)}`}
                                        className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-brand-rose/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-gold/20 ${
                                            i === 0
                                                ? 'bg-gradient-to-br from-brand-gold to-brand-gold-dark text-white'
                                                : 'bg-white text-brand-text hover:border-brand-gold/50'
                                        }`}
                                    >
                                        <span className={`text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 ${i === 0 ? 'text-6xl' : ''}`}>
                                            {categoryEmoji(cat.name)}
                                        </span>
                                        <div>
                                            <h3 className={`font-display font-semibold ${i === 0 ? 'text-3xl' : 'text-lg'}`}>{cat.name}</h3>
                                            <p className={`mt-0.5 text-sm ${i === 0 ? 'text-white/80' : 'text-brand-text/60'}`}>
                                                {cat.count} {cat.count === 1 ? 'producto' : 'productos'}
                                            </p>
                                        </div>
                                        <ArrowRight className={`absolute top-6 right-6 h-5 w-5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 ${i === 0 ? 'text-white' : 'text-brand-gold'}`} />
                                    </Link>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-brand-cream-alt/70 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Reveal>
                        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.2em] text-brand-gold uppercase">Selección</p>
                                <h2 className="font-display mt-2 text-4xl font-semibold text-brand-text sm:text-5xl">Favoritos del momento</h2>
                            </div>
                            <Link href="/store/products" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-gold-dark">
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

            <section className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {perks.map(({ icon: Icon, title, desc }, i) => (
                            <Reveal key={title} delay={i * 70}>
                                <div className="h-full rounded-3xl border border-brand-rose/60 bg-white p-6">
                                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-cream-alt text-brand-gold-dark">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <h3 className="font-display mt-4 text-lg font-semibold text-brand-text">{title}</h3>
                                    <p className="mt-1 text-sm text-brand-text/60">{desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 pb-20 sm:px-6 lg:px-8">
                <Reveal>
                    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-gold-dark via-brand-gold to-brand-wood px-6 py-16 text-center sm:px-12">
                        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-text/20 blur-3xl" />
                        <h2 className="font-display relative text-4xl font-semibold text-white sm:text-5xl">¿No sabes por dónde empezar?</h2>
                        <p className="relative mx-auto mt-4 max-w-xl text-white/85">
                            Cuéntanos tu tipo de piel y te armamos una rutina a tu medida. Sin costo, por WhatsApp.
                        </p>
                        <a
                            href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent('¡Hola! Me gustaría que me ayuden a armar mi rutina de skincare 🌸')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-gold-dark shadow-xl transition-transform hover:scale-105"
                        >
                            Hablar con una asesora <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </Reveal>
            </section>
        </>
    );
}
