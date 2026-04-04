<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            [
                'team_id' => 1,
                'name' => 'MIXSOON',
                'slug' => 'mixsoon',
                'description' => 'Es una de las marcas más virales del momento en el mundo del K-Beauty debido a su filosofía de minimalismo extremo',
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'COSRX',
                'slug' => 'cosrx',
                'description' => 'es la favorita por su enfoque "clínico" pero amable con la piel. Se especializa en resolver problemas específicos como acné, poros dilatados y deshidratación con ingredientes de alta eficacia.',
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'MEDICUBE',
                'slug' => 'medicube',
                'description' => 'es la marca de "derma-cosmética" coreana que está revolucionando el mercado en 2024-2026. A diferencia de otras marcas más naturales, Medicube se enfoca en resultados rápidos mediante tecnología avanzada y dispositivos de belleza para usar en casa.',
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'SKIN1004',
                'slug' => 'skin1004',
                'description' => 'es la marca "reina" de la calma y la pureza en el K-Beauty. Su ingrediente estrella es la Centella Asiática de Madagascar, recolectada de forma ética para garantizar la mayor concentración de activos reparadores.',
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'DR. ALTHEA',
                'slug' => 'dr-althea',
                'description' => 'es una marca de "luxury aesthetic" que se ha vuelto masiva en El Salvador gracias a TikTok. Se enfoca en fórmulas de alta gama que combinan ingredientes naturales con tecnología dermatológica para pieles sensibles.',
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'ANUA',
                'slug' => 'anua',
                'description' => 'se ha convertido en la marca número 1 en ventas en Corea y la más viral en El Salvador durante 2024 y 2025. Su filosofía se basa en el "minimalismo activo", utilizando ingredientes naturales en altas concentraciones para calmar la piel estresada.',
                'active' => true,
            ],
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
}
