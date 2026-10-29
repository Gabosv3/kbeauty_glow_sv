import { router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { adminCreateActions, adminNavGroups } from '@/lib/admin-nav';
import { toUrl } from '@/lib/utils';

type Entry = { title: string; group: string; href: string };

const entries: Entry[] = adminNavGroups.flatMap((g) => g.items.map((i) => ({ title: i.title, group: g.label, href: toUrl(i.href) })));

/** Buscador de secciones del panel (Ctrl+K) y menú "Crear" para altas rápidas. */
export function AdminQuickBar() {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const results = useMemo(() => {
        const needle = query.trim().toLowerCase();

        if (!needle) {
            return [];
        }

        const creates = adminCreateActions.map((a) => ({ title: a.title, group: 'Crear', href: toUrl(a.href) }));

        return [...entries, ...creates].filter((e) => `${e.title} ${e.group}`.toLowerCase().includes(needle)).slice(0, 7);
    }, [query]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        }

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, []);

    function go(href: string) {
        setQuery('');
        setOpen(false);
        inputRef.current?.blur();
        router.visit(href);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
        } else if (e.key === 'Enter' && results[active]) {
            e.preventDefault();
            go(results[active].href);
        } else if (e.key === 'Escape') {
            setOpen(false);
            inputRef.current?.blur();
        }
    }

    return (
        <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setActive(0);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 120)}
                    onKeyDown={onKeyDown}
                    placeholder="Buscar sección…"
                    aria-label="Buscar sección del panel"
                    className="h-9 w-56 rounded-full border border-input bg-background pr-12 pl-9 text-sm shadow-xs focus:ring-2 focus:ring-ring/40 focus:outline-none lg:w-72"
                />
                <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">Ctrl K</kbd>

                {open && results.length > 0 && (
                    <ul className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border bg-popover p-1 shadow-xl">
                        {results.map((r, i) => (
                            <li key={`${r.group}-${r.title}`}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => go(r.href)}
                                    onMouseEnter={() => setActive(i)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${i === active ? 'bg-accent' : ''}`}
                                >
                                    <span>{r.title}</span>
                                    <span className="text-[10px] tracking-wider text-muted-foreground uppercase">{r.group}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" className="rounded-full">
                        <Plus className="mr-1.5 size-4" /> Crear
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-[10px] tracking-widest text-muted-foreground uppercase">Crear nuevo</DropdownMenuLabel>
                    {adminCreateActions.map((a) => (
                        <DropdownMenuItem key={a.title} onSelect={() => router.visit(toUrl(a.href))} className="cursor-pointer gap-2">
                            {a.icon && <a.icon className="size-4 text-muted-foreground" />}
                            {a.title}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
