<?php

namespace Database\Seeders;

use App\Models\Sale;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sales = [
            [
                'team_id' => 1,
                'user_id' => 1,
                'reference' => 'SL-QDWORK4Q',
                'status' => 'completed',
                'customer_name' => 'Clientes Varios',
                'customer_email' => null,
                'subtotal' => 20.00,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => 20.00,
                'payment_method' => 'cash',
                'notes' => null,
            ],
            [
                'team_id' => 1,
                'user_id' => 1,
                'reference' => 'SL-CRZE2R8K',
                'status' => 'completed',
                'customer_name' => 'Clientes Varios',
                'customer_email' => null,
                'subtotal' => 20.00,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => 20.00,
                'payment_method' => 'cash',
                'notes' => null,
            ],
            [
                'team_id' => 1,
                'user_id' => 1,
                'reference' => 'SL-SWFJAZHU',
                'status' => 'completed',
                'customer_name' => 'Clientes Varios',
                'customer_email' => null,
                'subtotal' => 15.00,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => 15.00,
                'payment_method' => 'cash',
                'notes' => null,
            ],
            [
                'team_id' => 1,
                'user_id' => 1,
                'reference' => 'SL-2LPWFI0P',
                'status' => 'completed',
                'customer_name' => 'Clientes Varios',
                'customer_email' => null,
                'subtotal' => 20.00,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => 20.00,
                'payment_method' => 'transfer',
                'notes' => null,
            ],
        ];

        foreach ($sales as $sale) {
            Sale::create($sale);
        }
    }
}
