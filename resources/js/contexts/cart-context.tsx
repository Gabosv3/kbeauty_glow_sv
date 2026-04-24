import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartItem {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    quantity: number;
}

interface CartCtx {
    items: CartItem[];
    addItem: (product: Omit<CartItem, 'quantity'>, qty?: number) => void;
    removeItem: (id: number) => void;
    updateQty: (id: number, qty: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    cartOpen: boolean;
    setCartOpen: (v: boolean) => void;
}

const CartContext = createContext<CartCtx | null>(null);

const CART_KEY = 'kbeauty_cart';

function readCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        setItems(readCart());
    }, []);

    const persist = (next: CartItem[]) => {
        localStorage.setItem(CART_KEY, JSON.stringify(next));
        return next;
    };

    const addItem = useCallback((product: Omit<CartItem, 'quantity'>, qty = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            const next = existing
                ? prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + qty } : i))
                : [...prev, { ...product, quantity: qty }];
            return persist(next);
        });
    }, []);

    const removeItem = useCallback((id: number) => {
        setItems((prev) => persist(prev.filter((i) => i.id !== id)));
    }, []);

    const updateQty = useCallback((id: number, qty: number) => {
        if (qty < 1) return;
        setItems((prev) => persist(prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        localStorage.removeItem(CART_KEY);
    }, []);

    const totalItems = items.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const value = useMemo(
        () => ({ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice, cartOpen, setCartOpen }),
        [items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice, cartOpen],
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
    return ctx;
}
