<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['purchase_id', 'package_number', 'tracking_number', 'tax', 'status', 'received_at'])]
class PurchaseShipment extends Model
{
    protected function casts(): array
    {
        return [
            'tax' => 'decimal:2',
            'received_at' => 'datetime',
        ];
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class, 'shipment_id');
    }

    public function receive(): void
    {
        $this->update(['status' => 'received', 'received_at' => now()]);

        $this->load('items.product');
        foreach ($this->items as $item) {
            $item->product->increment('stock', $item->quantity);
        }

        $this->recalculatePurchase();
    }

    public function markNotReceived(): void
    {
        $this->update(['status' => 'not_received']);
        $this->recalculatePurchase();
    }

    public function recalculatePurchase(): void
    {
        $purchase = $this->purchase()->with('shipments')->first();

        $totalTax = $purchase->shipments->sum(fn ($s) => (float) $s->tax);
        $purchase->update([
            'tax' => $totalTax,
            'total' => (float) $purchase->subtotal - (float) $purchase->discount + $totalTax,
        ]);

        $allAssigned = $purchase->items()->whereNull('shipment_id')->doesntExist();
        $allDone = $purchase->shipments->every(
            fn ($s) => in_array($s->status, ['received', 'not_received'])
        );

        if ($allAssigned && $allDone) {
            $purchase->update(['status' => 'received', 'received_at' => now()]);
        }
    }
}
