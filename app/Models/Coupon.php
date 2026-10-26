<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'team_id', 'code', 'type', 'value', 'min_order', 'max_uses',
    'used_count', 'starts_at', 'ends_at', 'active',
])]
class Coupon extends Model
{
    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_order' => 'decimal:2',
            'max_uses' => 'integer',
            'used_count' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'active' => 'boolean',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /** Motivo por el que el cupón no puede usarse con este subtotal, o null si es válido. */
    public function problemFor(float $subtotal): ?string
    {
        if (! $this->active) {
            return 'Este cupón no está activo.';
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return 'Este cupón todavía no está disponible.';
        }

        if ($this->ends_at && $this->ends_at->isPast()) {
            return 'Este cupón ya venció.';
        }

        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return 'Este cupón ya alcanzó su límite de usos.';
        }

        if ($subtotal < (float) $this->min_order) {
            return sprintf('Este cupón aplica en compras desde $%s.', number_format((float) $this->min_order, 2));
        }

        return null;
    }

    public function discountFor(float $subtotal): float
    {
        $amount = $this->type === 'percent'
            ? $subtotal * (float) $this->value / 100
            : (float) $this->value;

        return round(min($amount, $subtotal), 2);
    }
}
