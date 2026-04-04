<?php

namespace Database\Seeders;

use App\Models\Purchase;
use Illuminate\Database\Seeder;

class PurchaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $purchases = [
            [
                'team_id' => 1,
                'supplier_id' => 1,
                'user_id' => 1,
                'reference' => 'PO-ZDFAV38Y',
                'status' => 'ordered',
                'subtotal' => 234.10,
                'tax' => 9.22,
                'discount' => 41.57,
                'total' => 201.75,
                'notes' => null,
                'received_at' => null,
            ],
        ];

        foreach ($purchases as $purchase) {
            Purchase::create($purchase);
        }
    }
}
