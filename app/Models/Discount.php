<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'team_id', 'name', 'scope', 'category_id', 'product_id',
    'type', 'value', 'starts_at', 'ends_at', 'active',
])]
class Discount extends Model
{
    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'active' => 'boolean',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function isCurrent(): bool
    {
        return $this->active
            && (! $this->starts_at || $this->starts_at->isPast())
            && (! $this->ends_at || $this->ends_at->isFuture());
    }

    public function appliesTo(Product $product): bool
    {
        return match ($this->scope) {
            'store' => true,
            'category' => $this->category_id === $product->category_id,
            'product' => $this->product_id === $product->id,
            default => false,
        };
    }

    public function savingOn(float $price): float
    {
        $saving = $this->type === 'percent' ? $price * (float) $this->value / 100 : (float) $this->value;

        return round(min($saving, $price), 2);
    }
}
