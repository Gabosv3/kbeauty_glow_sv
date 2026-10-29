import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

export const authField =
    'w-full rounded-2xl border border-brand-rose bg-white px-4 py-3 text-sm text-brand-text placeholder:text-brand-text/40 focus:border-brand-gold focus:outline-2 focus:outline-brand-gold/30';

interface Props {
    title: string;
    subtitle: string;
    children: ReactNode;
    footer: { text: string; label: string; href: string };
}

export function AuthCard({ title, subtitle, children, footer }: Readonly<Props>) {
    return (
        <>
            <Head title={`${title} — KBeauty Glow SV`} />
            <div className="mx-auto flex max-w-md flex-col px-4 py-14 sm:py-20">
                <div className="rounded-3xl border border-brand-rose/60 bg-white p-8 shadow-xl shadow-brand-gold/10">
                    <h1 className="font-display text-3xl font-semibold text-brand-text">{title}</h1>
                    <p className="mt-1.5 text-sm text-brand-text/60">{subtitle}</p>
                    <div className="mt-6">{children}</div>
                </div>
                <p className="mt-5 text-center text-sm text-brand-text/60">
                    {footer.text}{' '}
                    <Link href={footer.href} className="font-semibold text-brand-gold-dark hover:underline">
                        {footer.label}
                    </Link>
                </p>
            </div>
        </>
    );
}

export function FieldError({ message }: Readonly<{ message?: string }>) {
    return message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;
}
