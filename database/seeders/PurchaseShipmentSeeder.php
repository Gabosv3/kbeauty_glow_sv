<?php

namespace Database\Seeders;

use App\Models\PurchaseShipment;
use Illuminate\Database\Seeder;

class PurchaseShipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shipments = [
            [
                'id' => 3,
                'purchase_id' => 1,
                'package_number' => 'PKG-001',
                'tracking_number' => 'TRACK-001',
                'tax' => 0.00,
                'status' => 'received',
                'received_at' => '2026-04-04 06:12:58',
            ],
            [
                'id' => 4,
                'purchase_id' => 1,
                'package_number' => 'PKG-002',
                'tracking_number' => 'TRACK-002',
                'tax' => 0.00,
                'status' => 'received',
                'received_at' => '2026-04-04 06:13:37',
            ],
        ];

        foreach ($shipments as $shipment) {
            PurchaseShipment::create($shipment);
        }
    }
}
