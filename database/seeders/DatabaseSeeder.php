<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear usuario primero (sin current_team_id aún)
        $admin = User::firstOrCreate(
            ['email' => 'admin@kbeauty.com'],
            [
                'name'      => 'Administrador',
                'password'  => Hash::make('admin123'),
                'workos_id' => 'local_admin_001',
                'avatar'    => '',
            ]
        );

        // 2. Crear equipo (sin user_id — no existe en la tabla)
        $team = Team::firstOrCreate(
            ['slug' => 'kbeauty-glow'],
            [
                'name'        => 'KBeauty Glow',
                'is_personal' => false,
            ]
        );

        // 3. Asignar equipo actual al usuario
        $admin->update(['current_team_id' => $team->id]);

        // 4. Vincular admin al equipo como propietario
        if (! $team->members()->where('user_id', $admin->id)->exists()) {
            $team->members()->attach($admin->id, ['role' => 'owner']);
        }

        // 5. Ejecutar seeders de datos
        $this->call([
            BrandSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            ProductImageSeeder::class,
            SupplierSeeder::class,
            PurchaseSeeder::class,
            PurchaseShipmentSeeder::class,
            PurchaseItemSeeder::class,
            SaleSeeder::class,
            SaleItemSeeder::class,
        ]);
    }
}
