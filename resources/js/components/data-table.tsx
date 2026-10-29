import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type CellValue = string | number | boolean | null | undefined;

export type DataTableColumn<T> = {
    key: string;
    header: string;
    /** Valor usado para ordenar y (si searchable) para buscar. Sin valor la columna no es ordenable. */
    value?: (row: T) => CellValue;
    /** Incluye esta columna en el buscador de texto. */
    searchable?: boolean;
    /** Contenido de la celda; por defecto se muestra `value`. */
    cell?: (row: T) => ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
};

type Props<T> = {
    data: T[];
    columns: DataTableColumn<T>[];
    rowKey: (row: T) => string | number;
    searchPlaceholder?: string;
    emptyMessage?: string;
    /** Slot de acciones por fila (se agrega una columna "Acciones"). */
    actions?: (row: T) => ReactNode;
    /** Contenido extra a la derecha del buscador (filtros, botones). */
    toolbar?: ReactNode;
    rowClassName?: (row: T) => string | undefined;
    /** Textos adicionales por fila sobre los que también busca el buscador. */
    extraSearch?: (row: T) => CellValue[];
    pageSizes?: number[];
};

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

function compare(a: CellValue, b: CellValue): number {
    const aEmpty = a === null || a === undefined || a === '';
    const bEmpty = b === null || b === undefined || b === '';

    if (aEmpty || bEmpty) {
        return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
    }

    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }

    return String(a).localeCompare(String(b), 'es', { numeric: true, sensitivity: 'base' });
}

function normalize(text: string): string {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function DataTable<T>({
    data,
    columns,
    rowKey,
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'No hay registros.',
    actions,
    toolbar,
    rowClassName,
    extraSearch,
    pageSizes = [10, 25, 50],
}: Props<T>) {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
    const [pageSize, setPageSize] = useState(pageSizes[0]);
    const [page, setPage] = useState(1);

    const searchable = columns.filter((c) => c.searchable && c.value);

    const rows = useMemo(() => {
        const term = normalize(search.trim());
        let result = data;

        if (term) {
            result = result.filter((row) => {
                const texts = [...searchable.map((c) => c.value!(row)), ...(extraSearch?.(row) ?? [])];

                return texts.some((t) => normalize(String(t ?? '')).includes(term));
            });
        }

        const col = sort ? columns.find((c) => c.key === sort.key) : undefined;

        if (sort && col?.value) {
            const getValue = col.value;
            const factor = sort.dir === 'asc' ? 1 : -1;
            result = [...result].sort((a, b) => factor * compare(getValue(a), getValue(b)));
        }

        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, search, sort, columns, extraSearch]);

    const total = rows.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(page, pageCount);
    const start = (current - 1) * pageSize;
    const visible = rows.slice(start, start + pageSize);
    const colSpan = columns.length + (actions ? 1 : 0);

    function toggleSort(key: string) {
        setPage(1);
        setSort((prev) => {
            if (prev?.key !== key) {
                return { key, dir: 'asc' };
            }

            return prev.dir === 'asc' ? { key, dir: 'desc' } : null;
        });
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                {(searchable.length > 0 || extraSearch) && (
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder={searchPlaceholder}
                            className="pl-9"
                        />
                    </div>
                )}
                {toolbar}
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            {columns.map((col) => {
                                const sortable = !!col.value;
                                const active = sort?.key === col.key ? sort.dir : null;
                                const Icon = active === 'asc' ? ArrowUp : active === 'desc' ? ArrowDown : ArrowUpDown;

                                return (
                                    <th
                                        key={col.key}
                                        className={cn('px-4 py-3 font-medium whitespace-nowrap', alignClass[col.align ?? 'left'])}
                                        aria-sort={active ? (active === 'asc' ? 'ascending' : 'descending') : undefined}
                                    >
                                        {sortable ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleSort(col.key)}
                                                className={cn(
                                                    'inline-flex items-center gap-1 font-medium hover:text-foreground',
                                                    !active && 'text-foreground/90',
                                                )}
                                            >
                                                {col.header}
                                                <Icon className={cn('size-3.5', active ? 'opacity-100' : 'opacity-40')} />
                                            </button>
                                        ) : (
                                            col.header
                                        )}
                                    </th>
                                );
                            })}
                            {actions && <th className="px-4 py-3 text-right font-medium">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-8 text-center text-muted-foreground">
                                    {data.length > 0 ? 'Sin resultados para la búsqueda.' : emptyMessage}
                                </td>
                            </tr>
                        )}
                        {visible.map((row) => (
                            <tr key={rowKey(row)} className={cn('hover:bg-muted/30', rowClassName?.(row))}>
                                {columns.map((col) => (
                                    <td key={col.key} className={cn('px-4 py-3', alignClass[col.align ?? 'left'], col.className)}>
                                        {col.cell ? col.cell(row) : (String(col.value?.(row) ?? '') || '—')}
                                    </td>
                                ))}
                                {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span>Filas por página</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                        }}
                        className="h-8 rounded-md border border-input bg-background px-2 text-foreground"
                    >
                        {pageSizes.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
                <span>{total === 0 ? 'Mostrando 0 de 0' : `Mostrando ${start + 1}-${Math.min(start + pageSize, total)} de ${total}`}</span>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={current <= 1}
                        onClick={() => setPage(current - 1)}
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <span className="px-2">
                        {current} / {pageCount}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={current >= pageCount}
                        onClick={() => setPage(current + 1)}
                        aria-label="Página siguiente"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
