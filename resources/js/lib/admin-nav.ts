import {
    Award,
    FileText,
    LayoutGrid,
    Package,
    Percent,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Star,
    Store,
    Tag,
    Ticket,
    Truck,
    UserRound,
    Users,
} from 'lucide-react';
import { admin } from '@/lib/admin-routes';
import type { NavItem } from '@/types';

export type NavGroup = { label: string; items: NavItem[] };

/** Menú del panel agrupado por tarea. */
export const adminNavGroups: NavGroup[] = [
    {
        label: 'Principal',
        items: [
            { title: 'Dashboard', href: admin.dashboard, icon: LayoutGrid },
            { title: 'Ver tienda', href: '/store', icon: Store },
        ],
    },
    {
        label: 'Ventas',
        items: [
            { title: 'Ventas', href: admin.sales.index, icon: ShoppingBag },
            { title: 'Cotizaciones', href: admin.quotes.index, icon: FileText },
            { title: 'Clientes', href: admin.customers.index, icon: UserRound },
        ],
    },
    {
        label: 'Catálogo',
        items: [
            { title: 'Productos', href: admin.products.index, icon: Package },
            { title: 'Categorías', href: admin.categories.index, icon: Tag },
            { title: 'Marcas', href: admin.brands.index, icon: Award },
            { title: 'Destacados', href: admin.featured.index, icon: Star },
        ],
    },
    {
        label: 'Promociones',
        items: [
            { title: 'Cupones', href: admin.coupons.index, icon: Ticket },
            { title: 'Descuentos', href: admin.discounts.index, icon: Percent },
        ],
    },
    {
        label: 'Abastecimiento',
        items: [
            { title: 'Compras', href: admin.purchases.index, icon: ShoppingCart },
            { title: 'Proveedores', href: admin.suppliers.index, icon: Truck },
        ],
    },
    {
        label: 'Sistema',
        items: [
            { title: 'Usuarios', href: admin.users.index, icon: Users },
            { title: 'Ajustes', href: admin.settings.edit, icon: Settings },
        ],
    },
];

/** Acciones de "Crear": llevan a la lista y abren el formulario de alta (?new=1). */
export const adminCreateActions: NavItem[] = [
    { title: 'Nueva venta', href: `${admin.sales.index}?new=1`, icon: ShoppingBag },
    { title: 'Nueva cotización', href: `${admin.quotes.index}?new=1`, icon: FileText },
    { title: 'Nuevo producto', href: `${admin.products.index}?new=1`, icon: Package },
    { title: 'Nueva compra', href: `${admin.purchases.index}?new=1`, icon: ShoppingCart },
    { title: 'Nuevo cupón', href: `${admin.coupons.index}?new=1`, icon: Ticket },
    { title: 'Nuevo descuento', href: `${admin.discounts.index}?new=1`, icon: Percent },
    { title: "Nuevo usuario", href: `${admin.users.index}?new=1`, icon: Users },
];
