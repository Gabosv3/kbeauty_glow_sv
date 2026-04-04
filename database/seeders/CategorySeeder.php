<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'team_id' => 1,
                'name' => 'serums',
                'slug' => 'serums',
                'description' => 'son el corazón de la rutina coreana porque contienen la mayor concentración de ingredientes activos para tratar problemas específicos',
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'Protector solar',
                'slug' => 'protector-solar',
                'description' => null,
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'Parches',
                'slug' => 'parches',
                'description' => null,
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'mascarillas nocturnas',
                'slug' => 'mascarillas-nocturnas',
                'description' => null,
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'Tónico Exfoliante',
                'slug' => 'tonico-exfoliante',
                'description' => null,
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'Limpiador en aceite',
                'slug' => 'limpiador-en-aceite',
                'description' => null,
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'Limpiador en espuma',
                'slug' => 'limpiador-en-espuma',
                'description' => null,
                'active' => true,
            ],
            [
                'team_id' => 1,
                'name' => 'Vitaminas',
                'slug' => 'vitaminas',
                'description' => null,
                'active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
