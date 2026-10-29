<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;
use RuntimeException;
use Throwable;
use ZipArchive;

/**
 * Llena la plantilla oficial de importación de Urbby (resources/templates) con los
 * productos de la tienda. Se conservan las hojas «Instrucciones» y «Categorías».
 */
class UrbbyExport
{
    private const TEMPLATE = 'resources/templates/urbby-plantilla-productos.xlsx';

    private const HEADERS = ['Título', 'Descripción', 'Categoría', 'Marca', 'Precio', 'Precio antes de oferta', 'Stock', 'SKU', 'Tipo de opción', 'Opción'];

    public function __construct(private readonly PricingService $pricing) {}

    /** @param  Collection<int, Product>  $products */
    public function build(Collection $products): string
    {
        $rows = $products->map(fn (Product $p) => $this->row($p))->all();

        $path = tempnam(sys_get_temp_dir(), 'urbby');
        copy(base_path(self::TEMPLATE), $path);

        $zip = new ZipArchive;

        if ($zip->open($path) !== true) {
            throw new RuntimeException('No se pudo abrir la plantilla de Urbby.');
        }

        $sheet = $zip->getFromName('xl/worksheets/sheet1.xml');
        $count = count($rows) + 1;

        $sheet = preg_replace('/<dimension ref="[^"]*"\/>/', '<dimension ref="A1:J'.$count.'"/>', $sheet);
        $sheet = preg_replace('/<sheetData>.*<\/sheetData>/s', '<sheetData>'.$this->sheetData($rows).'</sheetData>', $sheet);
        $sheet = preg_replace('/<ignoredErrors>.*<\/ignoredErrors>/s', '', $sheet);

        $zip->addFromString('xl/worksheets/sheet1.xml', $sheet);
        $zip->close();

        $content = file_get_contents($path);
        unlink($path);

        return $content;
    }

    /** @return array<int, string|int|float|null> */
    private function row(Product $p): array
    {
        try {
            $price = $this->pricing->priceFor($p);
        } catch (Throwable) {
            // Sin tabla de descuentos (base sin migrar): se usa el precio de lista.
            $price = ['price' => (float) $p->sale_price, 'original_price' => null];
        }

        return [
            $this->title($p),
            $this->description($p),
            $this->category($p),
            $p->brand?->name,
            round($price['price'], 2),
            $price['original_price'] !== null ? round($price['original_price'], 2) : null,
            (int) $p->stock,
            $p->sku,
            null,
            null,
        ];
    }

    private function title(Product $p): string
    {
        $title = trim($p->name);

        if (mb_strlen($title) < 8 && $p->brand) {
            $title = "{$title} {$p->brand->name}";
        }

        return mb_substr($title, 0, 120);
    }

    /** Urbby pide al menos 20 caracteres: si el producto no tiene descripción se arma una básica. */
    private function description(Product $p): string
    {
        $text = trim((string) $p->description);

        if (mb_strlen($text) >= 20) {
            return $text;
        }

        $brand = $p->brand ? " de {$p->brand->name}" : '';
        $kind = $p->category ? mb_strtolower($p->category->name) : 'cuidado de la piel';

        return "{$p->name}{$brand}. Producto K-Beauty original importado de Corea, categoría {$kind}.";
    }

    /** Mapea las categorías de la tienda a las que acepta Urbby (hoja «Categorías»). */
    private function category(Product $p): string
    {
        $name = mb_strtolower($p->category?->name ?? '');

        return str_contains($name, 'vitamina') ? 'Salud y Bienestar' : 'Belleza y Cuidado Personal';
    }

    /** @param  array<int, array<int, string|int|float|null>>  $rows */
    private function sheetData(array $rows): string
    {
        $xml = $this->xmlRow(1, self::HEADERS);

        foreach ($rows as $i => $row) {
            $xml .= $this->xmlRow($i + 2, $row);
        }

        return $xml;
    }

    /** @param  array<int, string|int|float|null>  $cells */
    private function xmlRow(int $number, array $cells): string
    {
        $xml = "<row r=\"{$number}\">";

        foreach (array_values($cells) as $i => $value) {
            $ref = chr(65 + $i).$number;

            if ($value === null || $value === '') {
                continue;
            }

            $xml .= is_int($value) || is_float($value)
                ? "<c r=\"{$ref}\"><v>{$value}</v></c>"
                : "<c r=\"{$ref}\" t=\"str\"><v>".htmlspecialchars((string) $value, ENT_XML1 | ENT_QUOTES, 'UTF-8').'</v></c>';
        }

        return $xml.'</row>';
    }
}
