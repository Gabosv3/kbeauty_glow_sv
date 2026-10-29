<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

#[Fillable(['name', 'email', 'phone', 'password', 'department', 'municipality', 'address'])]
#[Hidden(['password', 'remember_token'])]
class Customer extends Authenticatable
{
    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}
