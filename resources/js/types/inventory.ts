export type ProductImage = {
    id: number;
    path: string;
    url: string;
    sort_order: number;
};

export type Brand = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    created_at: string;
};

export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    products_count?: number;
    created_at: string;
};

export type Supplier = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    contact_name: string | null;
    address: string | null;
    active: boolean;
    purchases_count?: number;
    created_at: string;
};

export type Product = {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    brand_id: number | null;
    brand?: Pick<Brand, 'id' | 'name'> | null;
    description: string | null;
    image: string | null;
    images?: ProductImage[];
    cost_price: string;
    sale_price: string;
    stock: number;
    min_stock: number;
    active: boolean;
    category_id: number | null;
    category?: Pick<Category, 'id' | 'name'> | null;
    created_at: string;
};

export type PurchaseItem = {
    id: number;
    product_id: number;
    quantity: number;
    unit_cost: string;
    subtotal: string;
    shipment_id: number | null;
    product?: Pick<Product, 'id' | 'name'>;
};

export type PurchaseShipment = {
    id: number;
    purchase_id: number;
    package_number: string;
    tracking_number: string | null;
    tax: string;
    status: 'in_transit' | 'received' | 'not_received';
    received_at: string | null;
    items?: PurchaseItem[];
};

export type Purchase = {
    id: number;
    reference: string;
    status: 'pending' | 'ordered' | 'received' | 'cancelled';
    subtotal: string;
    tax: string;
    discount: string;
    total: string;
    notes: string | null;
    received_at: string | null;
    supplier?: Pick<Supplier, 'id' | 'name'> | null;
    user?: { id: number; name: string } | null;
    items?: PurchaseItem[];
    shipments?: PurchaseShipment[];
    created_at: string;
};

export type SaleItem = {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: string;
    discount: string;
    subtotal: string;
    product?: Pick<Product, 'id' | 'name'>;
};

export type Sale = {
    id: number;
    reference: string;
    status: 'completed' | 'cancelled' | 'refunded';
    customer_name: string | null;
    customer_email: string | null;
    payment_method: 'cash' | 'card' | 'transfer';
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
    notes: string | null;
    user?: { id: number; name: string } | null;
    items?: SaleItem[];
    created_at: string;
};
