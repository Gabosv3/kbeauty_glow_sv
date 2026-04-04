<?php

namespace Database\Seeders;

use App\Models\SaleItem;
use Illuminate\Database\Seeder;

class SaleItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $saleItems = [
            [
                'sale_id' => 1,
                'product_id' => 12,
                'quantity' => 1,
                'unit_price' => 25.00,
                'discount' => 5.00,
                'subtotal' => 20.00,
            ],
            [
                'sale_id' => 2,
                'product_id' => 12,
                'quantity' => 1,
                'unit_price' => 25.00,
                'discount' => 5.00,
                'subtotal' => 20.00,
            ],
            [
                'sale_id' => 3,
                'product_id' => 16,
                'quantity' => 1,
                'unit_price' => 20.00,
                'discount' => 5.00,
                'subtotal' => 15.00,
            ],
            [
                'sale_id' => 4,
                'product_id' => 14,
                'quantity' => 1,
                'unit_price' => 20.00,
                'discount' => 0.00,
                'subtotal' => 20.00,
            ],
        ];

        foreach ($saleItems as $item) {
            SaleItem::create($item);
        }
    }
}
