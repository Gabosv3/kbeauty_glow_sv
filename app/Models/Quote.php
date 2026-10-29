<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'team_id', 'user_id', 'reference', 'status', 'customer_name', 'customer_phone',
    'customer_email', 'valid_until', 'subtotal', 'discount', 'total', 'notes',
])]
class Quote extends Model
{
    protected function casts(): array
    {
        return [
            'valid_until' => 'date:Y-m-d',
            'subtotal' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }
}
