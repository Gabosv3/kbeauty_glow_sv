import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Heart, Leaf, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/store/reveal';
import { useStore } from '@/lib/store-config';

const values = [
    { icon: Sparkles, title: 'Solo lo que funciona', desc: 'Probamos y seleccionamos cada producto antes de ofrecértelo. Nada de relleno.' },
    { icon: Leaf, title: 'Ingredientes honestos', desc: 'Fórmulas suaves, con activos reales y pensadas para tu piel y tu clima.' },
    { icon: Heart, title: 'Trato cercano', desc: 'Te acompañamos por WhatsApp antes y después de tu compra, sin prisa.' },
];

export default function About() {
    const STORE = useStore();

    return (
        <>
            <Head title={`Nosotros — ${STORE.name}`} />

            <section className="relative overflow-hidden bg-gradient-to-br from-brand-cream via-brand-cream-alt to-brand-rose/60 py-20 sm:py-28">
                <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-rose/70 blur-3xl" />
                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
                    <p className="text-xs font-semibold tracking-[0.2em] text-brand-gold uppercase">Nuestra historia</p>
                    <h1 className="font-display mt-4 text-5xl font-semibold tracking-tight text-brand-text sm:text-6xl">
                        La rutina coreana, <span className="text-brand-gold-dark italic">más cerca de ti</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-text/70">
                        {STORE.name} nació para que cuidar tu piel con productos K-Beauty originales sea simple, accesible y sin intermediarios dudosos en {STORE.city}.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
                    {values.map(({ icon: Icon, title, desc }, i) => (
                        <Reveal key={title} delay={i * 80}>
                            <div className="h-full rounded-3xl border border-brand-rose/60 bg-white p-8">
                                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-cream-alt text-brand-gold-dark">
                                    <Icon className="h-6 w-6" />
                                </span>
                                <h2 className="font-display mt-5 text-2xl font-semibold text-brand-text">{title}</h2>
                                <p className="mt-2 text-brand-text/70">{desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            <section className="px-4 pb-20 sm:px-6">
                <Reveal>
                    <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-brand-text px-6 py-14 text-center text-white sm:px-12">
                        <h2 className="font-display text-3xl font-semibold sm:text-4xl">¿Lista para empezar tu rutina?</h2>
                        <Link href="/store/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-text transition-transform hover:scale-105">
                            Ver el catálogo <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </Reveal>
            </section>
        </>
    );
}
