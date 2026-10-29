<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['team_id', 'sale_id', 'carrier_id', 'tracking_number', 'status', 'cost', 'ship_date', 'notes'])]
class Shipment extends Model
{
    use SoftDeletes;

    public const STATUSES = ['preparing', 'shipped', 'delivered', 'returned'];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'ship_date' => 'date:Y-m-d',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function carrier(): BelongsTo
    {
        return $this->belongsTo(Carrier::class);
    }
}
