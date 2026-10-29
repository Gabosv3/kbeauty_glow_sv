<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['quote_id', 'product_id', 'name', 'quantity', 'unit_price', 'subtotal'])]
class QuoteItem extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return ['unit_price' => 'decimal:2', 'subtotal' => 'decimal:2'];
    }
}
