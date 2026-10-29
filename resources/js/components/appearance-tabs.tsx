import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    iconOnly = false,
    ...props
}: HTMLAttributes<HTMLDivElement> & { iconOnly?: boolean }) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Claro' },
        { value: 'dark', icon: Moon, label: 'Oscuro' },
        { value: 'system', icon: Monitor, label: 'Sistema' },
    ];

    return (
        <div
            className={cn(
                'inline-flex rounded-xl border border-neutral-200 bg-neutral-50 p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-900',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    aria-label={label}
                    aria-pressed={appearance === value}
                    onClick={() => updateAppearance(value)}
                    title={label}
                    className={cn(
                        'relative flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        iconOnly && 'flex-1 px-0',
                        appearance === value
                            ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-700 dark:text-white dark:ring-neutral-600'
                            : 'text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300',
                    )}
                >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {!iconOnly && <span>{label}</span>}
                </button>
            ))}
        </div>
    );
}
