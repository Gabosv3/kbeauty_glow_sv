import { Head } from '@inertiajs/react';
import { Clock, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/lib/store-config';

const inputClass =
    'w-full rounded-2xl border border-brand-rose bg-white px-4 py-3 text-sm text-brand-text placeholder:text-brand-text/40 focus:border-brand-gold focus:outline-2 focus:outline-brand-gold/30';

export default function Contact() {
    const STORE = useStore();
    const { whatsappUrl } = STORE;
    const [form, setForm] = useState({ name: '', message: '' });

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    function send(e: React.FormEvent) {
        e.preventDefault();
        const text = `¡Hola! Soy ${form.name.trim() || 'un cliente'}.\n\n${form.message.trim()}`;

        window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer');
    }

    const info = [
        { icon: MessageCircle, label: 'WhatsApp', value: `+${STORE.whatsapp}`, href: whatsappUrl('¡Hola! 🌸') },
        { icon: Mail, label: 'Correo', value: STORE.email, href: `mailto:${STORE.email}` },
        { icon: MapPin, label: 'Ubicación', value: STORE.city },
        { icon: Clock, label: 'Horario', value: 'Lun a Sáb · 9:00 a 18:00' },
    ];

    return (
        <>
            <Head title={`Contacto — ${STORE.name}`} />

            <section className="bg-gradient-to-br from-brand-cream via-brand-cream-alt to-brand-rose/60 py-16 sm:py-24">
                <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.2em] text-brand-gold uppercase">Contacto</p>
                        <h1 className="font-display mt-4 text-5xl font-semibold tracking-tight text-brand-text">Hablemos de tu piel</h1>
                        <p className="mt-4 max-w-md text-lg text-brand-text/70">
                            Escríbenos y te respondemos por WhatsApp lo antes posible.
                        </p>

                        <ul className="mt-10 space-y-4">
                            {info.map(({ icon: Icon, label, value, href }) => (
                                <li key={label} className="flex items-center gap-4">
                                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-brand-gold-dark shadow-sm">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold tracking-wider text-brand-text/50 uppercase">{label}</p>
                                        {href ? (
                                            <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-text hover:text-brand-gold-dark">
                                                {value}
                                            </a>
                                        ) : (
                                            <p className="font-medium text-brand-text">{value}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <form onSubmit={send} className="space-y-4 rounded-[2rem] border border-brand-rose/60 bg-white p-6 shadow-xl shadow-brand-gold/10 sm:p-8">
                        <h2 className="font-display text-2xl font-semibold text-brand-text">Envíanos un mensaje</h2>
                        <div>
                            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-brand-text">Tu nombre</label>
                            <input id="name" value={form.name} onChange={set('name')} className={inputClass} placeholder="María" autoComplete="name" />
                        </div>
                        <div>
                            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-brand-text">Mensaje</label>
                            <textarea id="message" value={form.message} onChange={set('message')} required rows={5} className={inputClass} placeholder="Cuéntanos qué buscas…" />
                        </div>
                        <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]">
                            <MessageCircle className="h-4 w-4" />
                            Enviar por WhatsApp
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
}
