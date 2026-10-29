<?php

namespace App\Services;

use RuntimeException;
use ZipArchive;

/**
 * Escritor mínimo de .xlsx (una hoja, texto y números, cabecera en negrita).
 * Evita depender de una librería externa para una exportación sencilla.
 */
class XlsxWriter
{
    /**
     * @param  array<int, string>  $headers
     * @param  array<int, array<int, string|int|float|null>>  $rows
     * @param  array<int, float>  $widths  Ancho de cada columna.
     */
    public function build(string $sheetName, array $headers, array $rows, array $widths = []): string
    {
        $path = tempnam(sys_get_temp_dir(), 'xlsx');
        $zip = new ZipArchive;

        if ($zip->open($path, ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('No se pudo crear el archivo Excel.');
        }

        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            .'</Types>');

        $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'</Relationships>');

        $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheets><sheet name="'.$this->escape(mb_substr($sheetName, 0, 31)).'" sheetId="1" r:id="rId1"/></sheets></workbook>');

        $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            .'</Relationships>');

        // Estilos: 0 normal, 1 cabecera en negrita, 2 dinero ($0.00), 3 dinero en negrita.
        $zip->addFromString('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/></numFmts>'
            .'<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
            .'<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'
            .'<fill><patternFill patternType="solid"><fgColor rgb="FFE8E4F9"/></patternFill></fill></fills>'
            .'<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            .'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            .'<cellXfs count="4">'
            .'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            .'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'
            .'<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
            .'<xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>'
            .'</cellXfs></styleSheet>');

        $zip->addFromString('xl/worksheets/sheet1.xml', $this->sheet($headers, $rows, $widths));
        $zip->close();

        $content = file_get_contents($path);
        unlink($path);

        return $content;
    }

    /**
     * Una celda de dinero. Se envuelve para distinguirla de un número cualquiera.
     */
    public static function money(float $value, bool $bold = false): array
    {
        return ['money' => $value, 'bold' => $bold];
    }

    /** @param  array<int, array<int, mixed>>  $rows */
    private function sheet(array $headers, array $rows, array $widths): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>';

        if ($widths !== []) {
            $xml .= '<cols>';
            foreach ($widths as $i => $w) {
                $n = $i + 1;
                $xml .= "<col min=\"{$n}\" max=\"{$n}\" width=\"{$w}\" customWidth=\"1\"/>";
            }
            $xml .= '</cols>';
        }

        $xml .= '<sheetData>'.$this->row(1, $headers, true);

        foreach ($rows as $i => $row) {
            $xml .= $this->row($i + 2, $row, false);
        }

        return $xml.'</sheetData></worksheet>';
    }

    /** @param  array<int, mixed>  $cells */
    private function row(int $number, array $cells, bool $header): string
    {
        $xml = "<row r=\"{$number}\">";

        foreach (array_values($cells) as $i => $value) {
            $ref = $this->column($i).$number;

            if ($header) {
                $xml .= "<c r=\"{$ref}\" t=\"inlineStr\" s=\"1\"><is><t>".$this->escape((string) $value).'</t></is></c>';
            } elseif (is_array($value) && isset($value['money'])) {
                $style = $value['bold'] ? 3 : 2;
                $xml .= "<c r=\"{$ref}\" s=\"{$style}\"><v>".round($value['money'], 2).'</v></c>';
            } elseif (is_int($value) || is_float($value)) {
                $xml .= "<c r=\"{$ref}\"><v>{$value}</v></c>";
            } elseif ($value !== null && $value !== '') {
                $xml .= "<c r=\"{$ref}\" t=\"inlineStr\"><is><t xml:space=\"preserve\">".$this->escape((string) $value).'</t></is></c>';
            }
        }

        return $xml.'</row>';
    }

    private function column(int $index): string
    {
        $name = '';

        for ($n = $index + 1; $n > 0; $n = intdiv($n - 1, 26)) {
            $name = chr(65 + (($n - 1) % 26)).$name;
        }

        return $name;
    }

    private function escape(string $text): string
    {
        // Quita caracteres de control que vuelven inválido el XML.
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $text) ?? '';

        return htmlspecialchars($text, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
