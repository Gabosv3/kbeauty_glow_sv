import { Link, usePage } from '@inertiajs/react';
import { Award, LayoutGrid, Package, ShoppingBag, ShoppingCart, Tag, Truck, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { NavAdmin } from '@/components/nav-admin';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { admin } from '@/lib/admin-routes';
import { dashboard } from '@/routes/admin';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const dashboardUrl = dashboard.url();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
    ];

    const adminNavItems: NavItem[] = [
        {
            title: 'Usuarios',
            href: admin.users.index,
            icon: Users,
        },
        {
            title: 'Categorías',
            href: admin.categories.index,
            icon: Tag,
        },
        {
            title: 'Marcas',
            href: admin.brands.index,
            icon: Award,
        },
        {
            title: 'Productos',
            href: admin.products.index,
            icon: Package,
        },
        {
            title: 'Proveedores',
            href: admin.suppliers.index,
            icon: Truck,
        },
        {
            title: 'Compras',
            href: admin.purchases.index,
            icon: ShoppingCart,
        },
        {
            title: 'Ventas',
            href: admin.sales.index,
            icon: ShoppingBag,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {<NavAdmin items={adminNavItems} />}
            </SidebarContent>

            <SidebarFooter>
                <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
                    <AppearanceToggleTab className="w-full justify-center" />
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
