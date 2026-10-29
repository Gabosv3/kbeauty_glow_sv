import { usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Bandage, Droplet, Droplets, FlaskConical, Flower2, Heart, Leaf, Moon, Pill, Sparkles, Sun } from 'lucide-react';

export interface StoreInfo {
    name: string;
    handle: string;
    whatsapp: string;
    email: string;
    city: string;
    free_shipping_from: number;
    shipping_cost: number;
    instagram: string;
    tiktok: string;
    facebook: string;
}

/** Datos de la tienda: vienen del servidor (Admin > Ajustes), no están fijos en el código. */
export function useStore() {
    const store = usePage<{ store: StoreInfo }>().props.store;

    return {
        ...store,
        freeShippingFrom: store.free_shipping_from,
        socials: { instagram: store.instagram, tiktok: store.tiktok, facebook: store.facebook },
        whatsappUrl: (message: string) => `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`,
    };
}

/** Ícono de línea según el nombre de la categoría (las categorías vienen de la base de datos). */
export function categoryIcon(name: string): LucideIcon {
    const n = name.toLowerCase();
    const map: [string, LucideIcon][] = [
        ['serum', Droplets],
        ['solar', Sun],
        ['parche', Bandage],
        ['mascarilla', Moon],
        ['tónico', Sparkles],
        ['tonico', Sparkles],
        ['aceite', Droplet],
        ['espuma', Leaf],
        ['vitamina', Pill],
        ['crema', FlaskConical],
        ['labial', Heart],
    ];

    return map.find(([key]) => n.includes(key))?.[1] ?? Flower2;
}
