<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    private function getProducts(): array
    {
        return [
            [
                'id' => 1,
                'name' => 'COSRX Advanced Snail 96 Mucin Power Essence',
                'slug' => 'cosrx-snail-96-mucin-essence',
                'brand' => 'COSRX',
                'category' => 'Serums',
                'price' => 21.99,
                'original_price' => 25.00,
                'image' => 'https://placehold.co/400x400/fce7f3/be185d?text=COSRX',
                'rating' => 4.8,
                'reviews' => 1240,
                'badge' => 'Best Seller',
                'description' => 'Fórmula con 96% de filtrado de secreción de caracol que hidrata, repara y restaura la barrera natural de la piel.',
                'ingredients' => 'Snail Secretion Filtrate 96%, Sodium Hyaluronate, Arginine, Allantoin, Glycerin.',
                'in_stock' => true,
            ],
            [
                'id' => 2,
                'name' => 'Anua Heartleaf 77% Soothing Toner',
                'slug' => 'anua-heartleaf-77-toner',
                'brand' => 'Anua',
                'category' => 'Toners',
                'price' => 18.00,
                'original_price' => null,
                'image' => 'https://placehold.co/400x400/ede9fe/7c3aed?text=Anua',
                'rating' => 4.7,
                'reviews' => 856,
                'badge' => 'Nuevo',
                'description' => 'Tónico suave con 77% de extracto de heartleaf que calma, hidrata y cuida pieles sensibles y propensas al acné.',
                'ingredients' => 'Houttuynia Cordata Extract 77%, Butylene Glycol, Glycerin, Niacinamide, Panthenol.',
                'in_stock' => true,
            ],
            [
                'id' => 3,
                'name' => 'COSRX Low pH Good Morning Gel Cleanser',
                'slug' => 'cosrx-low-ph-cleanser',
                'brand' => 'COSRX',
                'category' => 'Cleansers',
                'price' => 14.50,
                'original_price' => 18.00,
                'image' => 'https://placehold.co/400x400/d1fae5/065f46?text=COSRX',
                'rating' => 4.9,
                'reviews' => 2100,
                'badge' => 'Top Rated',
                'description' => 'Limpiador matutino de bajo pH que mantiene la barrera natural de la piel mientras limpia suavemente sin resecar.',
                'ingredients' => 'Cocamidopropyl Betaine, Niacinamide, Tea-tree leaf oil, BHA 0.5%.',
                'in_stock' => true,
            ],
            [
                'id' => 4,
                'name' => 'Laneige Water Sleeping Mask',
                'slug' => 'laneige-water-sleeping-mask',
                'brand' => 'Laneige',
                'category' => 'Masks',
                'price' => 25.00,
                'original_price' => null,
                'image' => 'https://placehold.co/400x400/dbeafe/1d4ed8?text=Laneige',
                'rating' => 4.6,
                'reviews' => 950,
                'badge' => null,
                'description' => 'Mascarilla nocturna que hidrata intensivamente y restaura la vitalidad de la piel mientras duermes.',
                'ingredients' => 'Mineral Water, Glycerin, Beta-Glucan, SLEEPTOX Complex, Apricot Extract.',
                'in_stock' => true,
            ],
            [
                'id' => 5,
                'name' => 'Some By Mi AHA BHA PHA 30 Days Miracle Toner',
                'slug' => 'some-by-mi-aha-bha-pha-toner',
                'brand' => 'Some By Mi',
                'category' => 'Toners',
                'price' => 16.00,
                'original_price' => 20.00,
                'image' => 'https://placehold.co/400x400/fef3c7/92400e?text=SomByMi',
                'rating' => 4.5,
                'reviews' => 730,
                'badge' => '20% Off',
                'description' => 'Tónico triple ácido que exfolia, reduce imperfecciones y unifica el tono de la piel en 30 días de uso.',
                'ingredients' => 'AHA 0.1%, BHA 0.1%, PHA 0.1%, Tea Tree Extract, Centella Asiatica.',
                'in_stock' => true,
            ],
            [
                'id' => 6,
                'name' => 'Innisfree Green Tea Seed Serum',
                'slug' => 'innisfree-green-tea-seed-serum',
                'brand' => 'Innisfree',
                'category' => 'Serums',
                'price' => 22.00,
                'original_price' => null,
                'image' => 'https://placehold.co/400x400/dcfce7/15803d?text=Innisfree',
                'rating' => 4.7,
                'reviews' => 620,
                'badge' => null,
                'description' => 'Sérum rico en antioxidantes elaborado con hojas de té verde de la isla Jeju, que proporciona hidratación profunda y luminosidad.',
                'ingredients' => 'Camellia Sinensis Leaf Water, Camellia Sinensis Seed Oil, Glycerin, Centella Asiatica.',
                'in_stock' => true,
            ],
            [
                'id' => 7,
                'name' => 'Beauty of Joseon Relief Sun SPF 50+',
                'slug' => 'beauty-of-joseon-relief-sun',
                'brand' => 'Beauty of Joseon',
                'category' => 'Sunscreen',
                'price' => 19.50,
                'original_price' => null,
                'image' => 'https://placehold.co/400x400/fff7ed/c2410c?text=BoJoseon',
                'rating' => 4.9,
                'reviews' => 1890,
                'badge' => 'Best Seller',
                'description' => 'Protector solar ligero y no grasoso con arroz y probióticos que ofrece protección SPF 50+ PA++++.',
                'ingredients' => 'Zinc Oxide, Titanium Dioxide, Rice Extract, Probiotics, Niacinamide.',
                'in_stock' => true,
            ],
            [
                'id' => 8,
                'name' => 'TIRTIR Mask Fit Red Cushion',
                'slug' => 'tirtir-mask-fit-red-cushion',
                'brand' => 'TIRTIR',
                'category' => 'Makeup',
                'price' => 32.00,
                'original_price' => null,
                'image' => 'https://placehold.co/400x400/ffe4e6/be123c?text=TIRTIR',
                'rating' => 4.8,
                'reviews' => 445,
                'badge' => 'Trending',
                'description' => 'Cushion foundation viral que proporciona cobertura modulable con acabado natural y luminoso similar a la piel.',
                'ingredients' => 'Water, Niacinamide, Hyaluronic Acid, Glycerin, Titanium Dioxide.',
                'in_stock' => false,
            ],
        ];
    }

    public function index(): Response
    {
        $products = $this->getProducts();

        return Inertia::render('store/index', [
            'featuredProducts' => array_slice($products, 0, 6),
        ]);
    }

    public function products(Request $request): Response
    {
        $products = $this->getProducts();
        $category = $request->query('category');

        if ($category && $category !== 'all') {
            $products = array_values(array_filter(
                $products,
                fn ($p) => strtolower($p['category']) === strtolower($category)
            ));
        }

        $categories = array_values(array_unique(array_column($this->getProducts(), 'category')));

        return Inertia::render('store/products', [
            'products' => $products,
            'categories' => $categories,
            'currentCategory' => $category ?? 'all',
        ]);
    }

    public function product(string $slug): Response
    {
        $products = $this->getProducts();
        $product = collect($products)->firstWhere('slug', $slug);

        abort_if($product === null, 404);

        $related = collect($products)
            ->where('category', $product['category'])
            ->where('id', '!=', $product['id'])
            ->take(4)
            ->values()
            ->all();

        if (count($related) < 2) {
            $related = array_slice($products, 0, 4);
        }

        return Inertia::render('store/product', [
            'product' => $product,
            'relatedProducts' => $related,
        ]);
    }
}
