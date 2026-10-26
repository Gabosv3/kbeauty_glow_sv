<?php

return [
    'name' => 'KBeauty Glow SV',
    'whatsapp' => env('STORE_WHATSAPP', '50360330849'),
    'free_shipping_from' => (float) env('STORE_FREE_SHIPPING_FROM', 50),
    'shipping_cost' => (float) env('STORE_SHIPPING_COST', 3.5),

    'departments' => [
        'Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán', 'La Libertad', 'La Paz', 'La Unión',
        'Morazán', 'San Miguel', 'San Salvador', 'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulután',
    ],
];
