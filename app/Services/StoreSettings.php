<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * Ajustes de la tienda editables desde el admin. Lo que no se ha guardado
 * toma el valor por defecto de config/store.php.
 */
class StoreSettings
{
    private const CACHE_KEY = 'store.settings';

    /** Claves editables y su tipo. */
    public const FIELDS = [
        'whatsapp' => 'string',
        'email' => 'string',
        'city' => 'string',
        'free_shipping_from' => 'float',
        'shipping_cost' => 'float',
        'instagram' => 'string',
        'tiktok' => 'string',
        'facebook' => 'string',
    ];

    /** @return array<string, string|float> */
    public function all(): array
    {
        $stored = $this->stored();
        $values = [];

        foreach (self::FIELDS as $key => $type) {
            $raw = $stored[$key] ?? config("store.{$key}");
            $values[$key] = $type === 'float' ? (float) $raw : (string) ($raw ?? '');
        }

        return $values;
    }

    public function get(string $key): string|float
    {
        return $this->all()[$key];
    }

    /** @param  array<string, mixed>  $values */
    public function save(array $values): void
    {
        foreach (array_intersect_key($values, self::FIELDS) as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value === null ? null : (string) $value]);
        }

        Cache::forget(self::CACHE_KEY);
    }

    /** @return array<string, string|null> */
    private function stored(): array
    {
        try {
            return Cache::rememberForever(self::CACHE_KEY, fn () => Schema::hasTable('settings')
                ? Setting::pluck('value', 'key')->all()
                : []);
        } catch (Throwable) {
            return [];
        }
    }
}
