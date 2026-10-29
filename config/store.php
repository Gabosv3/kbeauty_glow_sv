<?php

return [
    'name' => 'KBeauty Glow SV',
    'handle' => 'kbeauty_glow',

    // Valores por defecto: se pueden cambiar desde Admin > Ajustes.
    'whatsapp' => env('STORE_WHATSAPP', '50360330849'),
    'email' => env('STORE_EMAIL', 'hola@kbeauty.com'),
    'city' => env('STORE_CITY', 'San Salvador, El Salvador'),
    'free_shipping_from' => (float) env('STORE_FREE_SHIPPING_FROM', 50),
    'shipping_cost' => (float) env('STORE_SHIPPING_COST', 3.5),
    'instagram' => 'https://instagram.com/kbeauty_glow_sv',
    'tiktok' => 'https://tiktok.com/@kbeauty_glow_sv',
    'facebook' => 'https://facebook.com/kbeauty.glow.sv',

    'departments' => [
        'Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán', 'La Libertad', 'La Paz', 'La Unión',
        'Morazán', 'San Miguel', 'San Salvador', 'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulután',
    ],
];
