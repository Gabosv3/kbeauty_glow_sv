<?php

namespace Database\Seeders;

use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $productImages = [
            [
                'product_id' => 1,
                'path' => 'products/nNjtWP7iaYxYKsWSo4AjAwoAk4TwfxHsPip9Daks.jpg',
                'sort_order' => 0,
            ],
            [
                'product_id' => 1,
                'path' => 'products/FCNZSVedFuw4bTGpIQ3ECVUofTZgB1KLZBED9syM.jpg',
                'sort_order' => 1,
            ],
            [
                'product_id' => 2,
                'path' => 'products/C9pAXb3gFPuW1ZxEjPMeDxhZXFtSkWVI3wLcsDtM.jpg',
                'sort_order' => 0,
            ],
            [
                'product_id' => 3,
                'path' => 'products/Bylh6oVjg5hknAdJRijKaqF1B51ljW60dAa6qVYH.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 4,
                'path' => 'products/JBlLn282j20DOfohcqBjW4GjTbxiYTZ3eDGJlgVj.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 4,
                'path' => 'products/nr5tt8AwLop1EBsT6BGuMAPZBi7nvdQAbwx5fWLG.webp',
                'sort_order' => 1,
            ],
            [
                'product_id' => 5,
                'path' => 'products/iezGyYdFKc51jKut3tc6CQ0aWrnjiCKxYx4ZfjJE.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 6,
                'path' => 'products/h4YBbFS1RIspdqcjS5e19UVhMYdPXGaJxh8efkNM.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 7,
                'path' => 'products/V6eomXtUSeOEq1GON5LpWihN8N77gLmGShFPFSH9.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 8,
                'path' => 'products/9TedwDw2CuVS9syfPoBKvcm8NLFEHBCHTiw3EEON.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 9,
                'path' => 'products/r26oYAeCwoEiY3FhVvfPANfpxC5CW0MfcOQkw8Aj.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 10,
                'path' => 'products/dcRnhCkmVNjezCzEUG2tS0l1nm7KUGtfeYSAi3Dl.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 11,
                'path' => 'products/qUCH8qLKhzJpnjXMZITCvwGJWoY57gexCTfsxYXG.png',
                'sort_order' => 0,
            ],
            [
                'product_id' => 12,
                'path' => 'products/qcnraXIzxcnZklpbqNH4tiyI2CaHiXxvCLAISYHJ.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 13,
                'path' => 'products/BLXWiAl2yABe4v8fVw7i79y5uULfLQnJtl9a7zYe.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 14,
                'path' => 'products/p1o2ADLNYzQivlffZd9iu8rp5To64FiRs51BS4JP.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 15,
                'path' => 'products/DO7rshZEtgdAgBiWf1euu66RI7jAgehBJj9ju7vE.webp',
                'sort_order' => 0,
            ],
            [
                'product_id' => 16,
                'path' => 'products/iUVG1nXRKwGoiBrUS7WSHYIVAtW8OcwRh1gW1S74.webp',
                'sort_order' => 0,
            ],
        ];

        foreach ($productImages as $image) {
            ProductImage::create($image);
        }
    }
}
