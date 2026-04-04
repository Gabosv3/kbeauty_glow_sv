<?php

namespace Database\Seeders;

use App\Models\PurchaseItem;
use Illuminate\Database\Seeder;

class PurchaseItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $purchaseItems = [
            [
                'purchase_id' => 1,
                'product_id' => 13,
                'quantity' => 2,
                'unit_cost' => 15.67,
                'subtotal' => 31.34,
                'shipment_id' => 3,
            ],
            [
                'purchase_id' => 1,
                'product_id' => 12,
                'quantity' => 4,
                'unit_cost' => 14.78,
                'subtotal' => 59.12,
                'shipment_id' => 3,
            ],
            [
                'purchase_id' => 1,
                'product_id' => 14,
                'quantity' => 2,
                'unit_cost' => 12.10,
                'subtotal' => 24.20,
                'shipment_id' => 3,
            ],
            [
                'purchase_id' => 1,
                'product_id' => 15,
                'quantity' => 2,
                'unit_cost' => 9.95,
                'subtotal' => 19.90,
                'shipment_id' => 4,
            ],
            [
                'purchase_id' => 1,
                'product_id' => 16,
                'quantity' => 2,
                'unit_cost' => 11.00,
                'subtotal' => 22.00,
                'shipment_id' => 3,
            ],
            [
                'purchase_id' => 1,
                'product_id' => 16,
                'quantity' => 2,
                'unit_cost' => 11.00,
                'subtotal' => 22.00,
                'shipment_id' => 4,
            ],
            [
                'purchase_id' => 1,
                'product_id' => 14,
                'quantity' => 2,
                'unit_cost' => 12.10,
                'subtotal' => 24.20,
                'shipment_id' => 4,
            ],
            [
                'purchase_id' => 1,
                'product_id' => 13,
                'quantity' => 2,
                'unit_cost' => 15.67,
                'subtotal' => 31.34,
                'shipment_id' => 4,
            ],
        ];

        foreach ($purchaseItems as $item) {
            PurchaseItem::create($item);
        }
    }
}
