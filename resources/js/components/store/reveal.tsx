import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/** Aparece con un fundido suave al entrar en pantalla; respeta prefers-reduced-motion. */
export function Reveal({ children, delay = 0, className = '' }: Readonly<{ children: ReactNode; delay?: number; className?: string }>) {
    const ref = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;

        if (!el || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShown(true);

            return;
        }

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold: 0.12 },
        );

        io.observe(el);

        return () => io.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out ${shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
        >
            {children}
        </div>
    );
}
