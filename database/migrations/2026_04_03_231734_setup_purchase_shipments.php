<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase_shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained()->cascadeOnDelete();
            $table->string('package_number');
            $table->string('tracking_number')->nullable();
            $table->decimal('tax', 10, 2)->default(0);
            $table->string('status')->default('in_transit'); // in_transit, received, not_received
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
        });

        Schema::table('purchase_items', function (Blueprint $table) {
            $table->dropColumn(['shipping_code', 'tax']);
        });

        Schema::table('purchase_items', function (Blueprint $table) {
            $table->foreignId('shipment_id')
                ->nullable()
                ->after('subtotal')
                ->constrained('purchase_shipments')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->dropForeign(['shipment_id']);
            $table->dropColumn('shipment_id');
            $table->string('shipping_code')->nullable();
            $table->decimal('tax', 10, 2)->default(0);
        });

        Schema::dropIfExists('purchase_shipments');
    }
};
