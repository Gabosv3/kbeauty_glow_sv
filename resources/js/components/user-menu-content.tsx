import { Link, router } from '@inertiajs/react';
import { LayoutGrid, LogOut, Palette, Settings, Store, UserRound, Users } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { admin } from '@/lib/admin-routes';
import { logout } from '@/routes/admin';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {[
                    { href: '/settings/profile', label: 'Mi perfil', icon: UserRound },
                    { href: '/settings/teams', label: 'Equipo', icon: Users },
                    { href: '/settings/appearance', label: 'Apariencia', icon: Palette },
                    { href: admin.settings.edit, label: 'Ajustes de la tienda', icon: Settings },
                    { href: admin.dashboard, label: 'Dashboard', icon: LayoutGrid },
                    { href: '/store', label: 'Ver tienda', icon: Store },
                ].map(({ href, label, icon: Icon }) => (
                    <DropdownMenuItem key={label} asChild>
                        <Link className="flex w-full cursor-pointer items-center" href={href} prefetch onClick={cleanup}>
                            <Icon className="mr-2 size-4" />
                            {label}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout.url()}
                    method="post"
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Cerrar sesión
                </Link>
            </DropdownMenuItem>
        </>
    );
}
