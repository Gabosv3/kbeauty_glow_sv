<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            [
                'team_id' => 1,
                'name' => 'yesstyle',
                'email' => null,
                'phone' => null,
                'contact_name' => 'https://www.yesstyle.com/',
                'address' => null,
                'active' => true,
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}
