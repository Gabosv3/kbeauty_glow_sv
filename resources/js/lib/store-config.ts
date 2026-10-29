import { usePage } from '@inertiajs/react';

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

/** Emoji decorativo según el nombre de la categoría (las categorías vienen de la base de datos). */
export function categoryEmoji(name: string): string {
    const n = name.toLowerCase();
    const map: [string, string][] = [
        ['serum', '💧'],
        ['solar', '☀️'],
        ['parche', '🩹'],
        ['mascarilla', '🌙'],
        ['tónico', '✨'],
        ['tonico', '✨'],
        ['aceite', '🫧'],
        ['espuma', '🌿'],
        ['vitamina', '💊'],
        ['crema', '🧴'],
        ['labial', '💄'],
    ];

    return map.find(([key]) => n.includes(key))?.[1] ?? '🌸';
}
