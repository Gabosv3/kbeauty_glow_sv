<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Los pedidos de la tienda pública no tienen un usuario administrador asociado.
            $table->foreignId('user_id')->nullable()->change();
            $table->string('channel')->default('admin')->after('status'); // admin, web
            $table->string('customer_phone')->nullable()->after('customer_email');
            $table->string('delivery_department')->nullable()->after('customer_phone');
            $table->string('delivery_municipality')->nullable()->after('delivery_department');
            $table->text('delivery_address')->nullable()->after('delivery_municipality');
            $table->decimal('shipping_cost', 10, 2)->default(0)->after('tax');
            $table->string('coupon_code')->nullable()->after('shipping_cost');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn([
                'channel', 'customer_phone', 'delivery_department', 'delivery_municipality',
                'delivery_address', 'shipping_cost', 'coupon_code',
            ]);
        });
    }
};
