import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, ImagePlus, Images, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { admin } from '@/lib/admin-routes';
import type { Brand, Category, Product, ProductImage } from '@/types';

type Props = {
    products: Product[];
    categories: Pick<Category, 'id' | 'name'>[];
    brands: Pick<Brand, 'id' | 'name'>[];
};

type ProductForm = {
    name: string;
    category_id: string;
    brand_id: string;
    sku: string;
    description: string;
    cost_price: string;
    sale_price: string;
    stock: string;
    min_stock: string;
    active: boolean;
};

const emptyForm: ProductForm = {
    name: '', category_id: '', brand_id: '', sku: '', description: '',
    cost_price: '', sale_price: '', stock: '0', min_stock: '0', active: true,
};

export default function ProductsIndex({ products, categories, brands }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Product | null>(null);
    const [imageProductId, setImageProductId] = useState<number | null>(null);

    // Filtros
    const [filterCategory, setFilterCategory] = useState('');
    const [filterBrand, setFilterBrand] = useState('');
    const [search, setSearch] = useState('');

    // Paginación
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);

    // Imágenes pendientes para cuando se cree el producto
    const [pendingImages, setPendingImages] = useState<File[]>([]);
    const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

    const createForm = useForm<ProductForm>(emptyForm);
    const editForm = useForm<ProductForm>(emptyForm);

    const currentImageProduct = imageProductId != null
        ? (products.find(p => p.id === imageProductId) ?? null)
        : null;

    // Producto fresco para el edit dialog (para tener imágenes actualizadas)
    const editProductFresh = editTarget ? (products.find(p => p.id === editTarget.id) ?? editTarget) : null;

    function addPendingImages(files: FileList) {
        const arr = Array.from(files);
        setPendingImages(prev => [...prev, ...arr]);
        const previews = arr.map(f => URL.createObjectURL(f));
        setPendingPreviews(prev => [...prev, ...previews]);
    }

    function removePending(index: number) {
        URL.revokeObjectURL(pendingPreviews[index]);
        setPendingImages(prev => prev.filter((_, i) => i !== index));
        setPendingPreviews(prev => prev.filter((_, i) => i !== index));
    }

    function closeCreate() {
        pendingPreviews.forEach(url => URL.revokeObjectURL(url));
        setPendingImages([]);
        setPendingPreviews([]);
        createForm.reset();
        setOpenCreate(false);
    }

    function openEdit(p: Product) {
        editForm.setData({
            name: p.name, category_id: p.category_id?.toString() ?? '',
            brand_id: p.brand_id?.toString() ?? '', sku: p.sku ?? '',
            description: p.description ?? '',
            cost_price: p.cost_price, sale_price: p.sale_price,
            stock: p.stock.toString(), min_stock: p.min_stock.toString(), active: p.active,
        });
        setEditTarget(p);
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(admin.products.store, {
            preserveScroll: true,
            onSuccess: (page) => {
                // Subir imágenes si hay pendientes — buscar el producto recién creado
                if (pendingImages.length > 0) {
                    // El producto recién creado es el último en la lista actualizada
                    const updatedProducts = (page.props as { products: Product[] }).products;
                    const newProduct = updatedProducts[updatedProducts.length - 1];
                    if (newProduct) {
                        const fd = new FormData();
                        pendingImages.forEach(f => fd.append('images[]', f));
                        router.post(admin.products.imagesStore(newProduct.id), fd, {
                            preserveScroll: true,
                            preserveState: true,
                        });
                    }
                }
                closeCreate();
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(admin.products.update(editTarget.id), {
            preserveScroll: true,
            onSuccess: () => setEditTarget(null),
        });
    }

    function deleteProduct(p: Product) {
        if (!confirm(`¿Eliminar "${p.name}"?`)) return;
        router.delete(admin.products.destroy(p.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="Productos" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Productos" description="Inventario de productos." variant="small" />
                    <Button onClick={() => setOpenCreate(true)} size="sm">
                        <Plus className="mr-2 size-4" /> Nuevo producto
                    </Button>
                </div>

                {/* Filtros y buscador */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o SKU..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="h-9 rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-[480px]"
                        />
                    </div>
                    <Select value={filterCategory} onValueChange={v => { setFilterCategory(v); setPage(1); }}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterBrand} onValueChange={v => { setFilterBrand(v); setPage(1); }}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Todas las marcas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las marcas</SelectItem>
                            {brands.map(b => (
                                <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(filterCategory || filterBrand || search) && (
                        <Button variant="ghost" size="sm" onClick={() => { setFilterCategory(''); setFilterBrand(''); setSearch(''); setPage(1); }}>
                            Limpiar filtros
                        </Button>
                    )}
                </div>

                {(() => {
                    const filtered = products.filter(p => {
                        if (filterCategory && filterCategory !== 'all' && p.category_id?.toString() !== filterCategory) return false;
                        if (filterBrand && filterBrand !== 'all' && p.brand_id?.toString() !== filterBrand) return false;
                        if (search) {
                            const q = search.toLowerCase();
                            const matchName = p.name.toLowerCase().includes(q);
                            const matchSku = p.sku?.toLowerCase().includes(q) ?? false;
                            if (!matchName && !matchSku) return false;
                        }
                        return true;
                    });

                    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
                    const safePage = Math.min(page, totalPages);
                    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

                    return (
                <>
                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="w-10 px-3 py-3 text-center font-medium text-muted-foreground">#</th>
                                <th className="w-36 px-3 py-3"></th>
                                <th className="px-4 py-3 text-left font-medium">Producto</th>
                                <th className="px-4 py-3 text-left font-medium">Categoría</th>
                                <th className="px-4 py-3 text-right font-medium">Costo</th>
                                <th className="px-4 py-3 text-right font-medium">Precio</th>
                                <th className="px-4 py-3 text-center font-medium">Stock</th>
                                <th className="px-4 py-3 text-center font-medium">Estado</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {paginated.map((p, index) => (
                                <tr key={p.id} className="hover:bg-muted/30">
                                    <td className="px-3 py-2 text-center text-xs text-muted-foreground">{(safePage - 1) * PAGE_SIZE + index + 1}</td>
                                    <td className="px-3 py-2 w-36">
                                        {p.images && p.images.length > 0 ? (
                                            <img
                                                src={p.images[0].url}
                                                alt={p.name}
                                                className="h-28 w-28 rounded-xl object-cover ring-1 ring-border"
                                            />
                                        ) : (
                                            <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
                                                <Images className="h-10 w-10 text-muted-foreground" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{p.name}</div>
                                        {p.sku && <div className="text-xs text-muted-foreground">SKU: {p.sku}</div>}
                                        {p.brand && <div className="text-xs text-muted-foreground">{p.brand.name}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{p.category?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">${p.cost_price}</td>
                                    <td className="px-4 py-3 text-right font-medium">${p.sale_price}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1 ${p.stock <= p.min_stock ? 'text-destructive' : ''}`}>
                                            {p.stock <= p.min_stock && <AlertTriangle className="size-3" />}
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant={p.active ? 'default' : 'secondary'}>
                                            {p.active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" title="Gestionar imágenes" onClick={() => setImageProductId(p.id)}>
                                                <ImagePlus className="size-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteProduct(p)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                                        No hay productos que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Mostrando {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length} productos
                        </span>
                        <div className="flex gap-1">
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                            >
                                Anterior
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <Button
                                    key={n}
                                    variant={n === safePage ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </Button>
                            ))}
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}
                </>
                    );
                })()}
            </div>

            {/* Modal crear */}
            <Dialog open={openCreate} onOpenChange={(v) => !v && closeCreate()}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Nuevo Producto</DialogTitle></DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <ProductFields form={createForm} categories={categories} brands={brands} />

                        {/* Imágenes: selección previa */}
                        <div className="space-y-2">
                            <Label>Imágenes</Label>
                            <ImageDropZone onFiles={addPendingImages} />
                            {pendingPreviews.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 pt-1">
                                    {pendingPreviews.map((src, i) => (
                                        <div key={i} className="group relative aspect-square">
                                            <img src={src} alt="" className="h-full w-full rounded-lg object-cover ring-1 ring-border" />
                                            {i === 0 && (
                                                <span className="absolute top-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                                    Principal
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removePending(i)}
                                                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeCreate}>Cancelar</Button>
                            <Button type="submit" disabled={createForm.processing}>Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal editar */}
            <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Editar Producto</DialogTitle></DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <ProductFields form={editForm} categories={categories} brands={brands} />

                        {/* Imágenes inline del producto */}
                        {editProductFresh && (
                            <div className="space-y-2">
                                <Label>Imágenes</Label>
                                <ImageManager product={editProductFresh} />
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
                            <Button type="submit" disabled={editForm.processing}>Actualizar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal imágenes */}
            <Dialog open={!!currentImageProduct} onOpenChange={(v) => !v && setImageProductId(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Images className="size-5" />
                            Imágenes — {currentImageProduct?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {currentImageProduct && (
                        <ImageManager product={currentImageProduct} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function ImageDropZone({ onFiles, disabled }: { onFiles: (f: FileList) => void; disabled?: boolean }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    return (
        <div
            onClick={() => !disabled && fileRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); setDragging(false); if (!disabled) onFiles(e.dataTransfer.files); }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all ${
                dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary hover:bg-muted/40'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <ImagePlus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium">Arrastra o haz clic para agregar imágenes</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WebP · máx. 2 MB por imagen</p>
            </div>
            <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && onFiles(e.target.files)}
            />
        </div>
    );
}

function ImageManager({ product }: { product: Product }) {
    const [uploading, setUploading] = useState(false);

    function upload(files: FileList) {
        if (files.length === 0) return;
        setUploading(true);
        const formData = new FormData();
        Array.from(files).forEach(f => formData.append('images[]', f));
        router.post(admin.products.imagesStore(product.id), formData, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setUploading(false),
        });
    }

    function deleteImage(img: ProductImage) {
        if (!confirm('¿Eliminar esta imagen?')) return;
        router.delete(admin.products.imagesDestroy(product.id, img.id), {
            preserveScroll: true,
            preserveState: true,
        });
    }

    const images = product.images ?? [];

    return (
        <div className="space-y-3">
            {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((img, i) => (
                        <div key={img.id} className="group relative aspect-square">
                            <img
                                src={img.url}
                                alt=""
                                className="h-full w-full rounded-lg object-cover ring-1 ring-border"
                            />
                            {i === 0 && (
                                <span className="absolute top-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                    Principal
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => deleteImage(img)}
                                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <ImageDropZone onFiles={upload} disabled={uploading} />
            {uploading && <p className="text-center text-xs text-muted-foreground">Subiendo imágenes...</p>}
        </div>
    );
}

function ProductFields({
    form,
    categories,
    brands,
}: {
    form: ReturnType<typeof useForm<ProductForm>>;
    categories: Pick<Category, 'id' | 'name'>[];
    brands: Pick<Brand, 'id' | 'name'>[];
}) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 grid gap-2">
                    <Label>Nombre *</Label>
                    <Input value={form.data.name} onChange={e => form.setData('name', e.target.value)} required />
                    {form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}
                </div>
                <div className="grid gap-2">
                    <Label>Categoría</Label>
                    <Select value={form.data.category_id} onValueChange={v => form.setData('category_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Sin categoría" /></SelectTrigger>
                        <SelectContent>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Marca</Label>
                    <Select value={form.data.brand_id} onValueChange={v => form.setData('brand_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Sin marca" /></SelectTrigger>
                        <SelectContent>
                            {brands.map(b => (
                                <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>SKU</Label>
                    <Input value={form.data.sku} onChange={e => form.setData('sku', e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label>Precio de costo *</Label>
                    <Input type="number" min="0" step="0.01" value={form.data.cost_price} onChange={e => form.setData('cost_price', e.target.value)} required />
                    {form.errors.cost_price && <p className="text-sm text-destructive">{form.errors.cost_price}</p>}
                </div>
                <div className="grid gap-2">
                    <Label>Precio de venta *</Label>
                    <Input type="number" min="0" step="0.01" value={form.data.sale_price} onChange={e => form.setData('sale_price', e.target.value)} required />
                    {form.errors.sale_price && <p className="text-sm text-destructive">{form.errors.sale_price}</p>}
                </div>
                <div className="grid gap-2">
                    <Label>Stock inicial</Label>
                    <Input type="number" min="0" value={form.data.stock} onChange={e => form.setData('stock', e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label>Stock mínimo</Label>
                    <Input type="number" min="0" value={form.data.min_stock} onChange={e => form.setData('min_stock', e.target.value)} />
                </div>
            </div>
        </>
    );
}

ProductsIndex.layout = () => ({
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Productos', href: admin.products.index },
    ],
});
