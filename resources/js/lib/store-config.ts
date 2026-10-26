export const STORE = {
    name: 'KBeauty Glow SV',
    handle: 'kbeauty_glow',
    whatsapp: '50360330849',
    city: 'San Salvador, El Salvador',
    email: 'hola@kbeauty.com',
    freeShippingFrom: 50,
    socials: {
        instagram: 'https://instagram.com/kbeauty_glow_sv',
        tiktok: 'https://tiktok.com/@kbeauty_glow_sv',
        facebook: 'https://facebook.com/kbeauty.glow.sv',
    },
} as const;

export function whatsappUrl(message: string): string {
    return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
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
