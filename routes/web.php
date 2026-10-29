<?php

use App\Http\Controllers\Admin\Auth\LoginController as AdminLoginController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductImageController;
use App\Http\Controllers\Admin\PurchaseShipmentController;
use App\Http\Controllers\Admin\PurchaseController;
use App\Http\Controllers\Admin\SaleController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\DiscountController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\FeaturedController;
use App\Http\Controllers\Admin\QuoteController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Store\Account\AccountController;
use App\Http\Controllers\Store\Account\AuthController as CustomerAuthController;
use App\Http\Controllers\Store\StoreController;
use App\Http\Middleware\EnsureAdminAuth;
use App\Http\Middleware\LinkPanelUserToCustomer;
use Illuminate\Support\Facades\Route;

Route::get('/', [StoreController::class, 'index'])->name('home');

// Store (public)
Route::prefix('store')->name('store.')->middleware(LinkPanelUserToCustomer::class)->group(function () {
    Route::get('/', [StoreController::class, 'index'])->name('index');
    Route::get('/products', [StoreController::class, 'products'])->name('products');
    Route::get('/products/{slug}', [StoreController::class, 'product'])->name('product');
    Route::post('/cart/quote', [CheckoutController::class, 'quote'])->middleware('throttle:60,1')->name('cart.quote');
    Route::get('/checkout', [CheckoutController::class, 'show'])->name('checkout');
    Route::post('/checkout', [CheckoutController::class, 'store'])->middleware('throttle:10,1')->name('checkout.store');
    Route::get('/pedido/{reference}', [CheckoutController::class, 'order'])->name('order');
    Route::get('/nosotros', [StoreController::class, 'about'])->name('about');
    Route::get('/contacto', [StoreController::class, 'contact'])->name('contact');

    // Cuentas de clientes (guard "customer", separado del admin)
    Route::prefix('cuenta')->group(function () {
        Route::middleware('guest:customer')->group(function () {
            Route::get('/login', [CustomerAuthController::class, 'login'])->name('account.login');
            Route::post('/login', [CustomerAuthController::class, 'authenticate'])->middleware('throttle:10,1');
            Route::get('/registro', [CustomerAuthController::class, 'register'])->name('account.register');
            Route::post('/registro', [CustomerAuthController::class, 'store'])->middleware('throttle:10,1');
        });

        Route::middleware('auth:customer')->group(function () {
            Route::get('/', [AccountController::class, 'show'])->name('account');
            Route::patch('/', [AccountController::class, 'update'])->name('account.update');
            Route::post('/logout', [CustomerAuthController::class, 'logout'])->name('account.logout');
        });
    });
});

// Admin: Login
Route::prefix('administrativo')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [AdminLoginController::class, 'create'])->name('login');
        Route::post('login', [AdminLoginController::class, 'store']);
    });

    Route::middleware(EnsureAdminAuth::class)->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Usuarios
        Route::get('users', [UserController::class, 'index'])->name('users.index');

        // Clientes
        Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');

        // Cotizaciones
        Route::get('quotes', [QuoteController::class, 'index'])->name('quotes.index');
        Route::post('quotes', [QuoteController::class, 'store'])->name('quotes.store');
        Route::get('quotes/{quote}', [QuoteController::class, 'show'])->name('quotes.show');
        Route::get('quotes/{quote}/print', [QuoteController::class, 'print'])->name('quotes.print');
        Route::post('quotes/{quote}/status', [QuoteController::class, 'status'])->name('quotes.status');
        Route::delete('quotes/{quote}', [QuoteController::class, 'destroy'])->name('quotes.destroy');

        // Destacados y ajustes de la tienda
        Route::get('featured', [FeaturedController::class, 'index'])->name('featured.index');
        Route::post('featured/{product}/toggle', [FeaturedController::class, 'toggle'])->name('featured.toggle');
        Route::get('settings', [SettingsController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [SettingsController::class, 'update'])->name('settings.update');

        // Marcas
        Route::get('brands', [BrandController::class, 'index'])->name('brands.index');
        Route::post('brands', [BrandController::class, 'store'])->name('brands.store');
        Route::put('brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
        Route::delete('brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

        // Categorías
        Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        // Proveedores
        Route::get('suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
        Route::post('suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
        Route::put('suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
        Route::delete('suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

        // Productos
        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/export', [ProductController::class, 'export'])->name('products.export');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        // Imágenes de productos
        Route::post('products/{product}/images', [ProductImageController::class, 'store'])->name('products.images.store');
        Route::delete('products/{product}/images/{image}', [ProductImageController::class, 'destroy'])->name('products.images.destroy');

        // Marketing
        Route::get('coupons', [CouponController::class, 'index'])->name('coupons.index');
        Route::post('coupons', [CouponController::class, 'store'])->name('coupons.store');
        Route::put('coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
        Route::delete('coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');
        Route::get('discounts', [DiscountController::class, 'index'])->name('discounts.index');
        Route::post('discounts', [DiscountController::class, 'store'])->name('discounts.store');
        Route::put('discounts/{discount}', [DiscountController::class, 'update'])->name('discounts.update');
        Route::delete('discounts/{discount}', [DiscountController::class, 'destroy'])->name('discounts.destroy');

        // Compras
        Route::get('purchases', [PurchaseController::class, 'index'])->name('purchases.index');
        Route::post('purchases', [PurchaseController::class, 'store'])->name('purchases.store');
        Route::get('purchases/{purchase}', [PurchaseController::class, 'show'])->name('purchases.show');
        Route::post('purchases/{purchase}/order', [PurchaseController::class, 'order'])->name('purchases.order');
        Route::post('purchases/{purchase}/cancel', [PurchaseController::class, 'cancel'])->name('purchases.cancel');
        // Paquetes de envío
        Route::post('purchases/{purchase}/shipments', [PurchaseShipmentController::class, 'store'])->name('purchases.shipments.store');
        Route::put('shipments/{shipment}', [PurchaseShipmentController::class, 'update'])->name('shipments.update');
        Route::delete('shipments/{shipment}', [PurchaseShipmentController::class, 'destroy'])->name('shipments.destroy');
        Route::post('shipments/{shipment}/receive', [PurchaseShipmentController::class, 'receive'])->name('shipments.receive');
        Route::post('shipments/{shipment}/not-received', [PurchaseShipmentController::class, 'notReceived'])->name('shipments.not-received');

        // Ventas
        Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
        Route::post('sales', [SaleController::class, 'store'])->name('sales.store');
        Route::get('sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
        Route::post('sales/{sale}/complete', [SaleController::class, 'complete'])->name('sales.complete');
        Route::post('sales/{sale}/cancel', [SaleController::class, 'cancel'])->name('sales.cancel');

        // Logout
        Route::post('logout', [AdminLoginController::class, 'destroy'])->name('logout');
    });
});

require __DIR__.'/settings.php';
