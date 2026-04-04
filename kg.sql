-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.0.30 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;



CREATE TABLE IF NOT EXISTS `brands` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `brands_team_id_slug_unique` (`team_id`,`slug`),
  CONSTRAINT `brands_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `brands` (`id`, `team_id`, `name`, `slug`, `description`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 1, 'MIXSOON', 'mixsoon', 'Es una de las marcas más virales del momento en el mundo del K-Beauty debido a su filosofía de minimalismo extremo', 1, '2026-04-04 01:49:07', '2026-04-04 01:55:46', NULL),
	(2, 1, 'COSRX', 'cosrx', 'es la favorita por su enfoque "clínico" pero amable con la piel. Se especializa en resolver problemas específicos como acné, poros dilatados y deshidratación con ingredientes de alta eficacia.', 1, '2026-04-04 01:55:28', '2026-04-04 01:55:28', NULL),
	(3, 1, 'MEDICUBE', 'medicube', 'es la marca de "derma-cosmética" coreana que está revolucionando el mercado en 2024-2026. A diferencia de otras marcas más naturales, Medicube se enfoca en resultados rápidos mediante tecnología avanzada y dispositivos de belleza para usar en casa.', 1, '2026-04-04 01:56:23', '2026-04-04 01:56:23', NULL),
	(4, 1, 'SKIN1004', 'skin1004', 'es la marca "reina" de la calma y la pureza en el K-Beauty. Su ingrediente estrella es la Centella Asiática de Madagascar, recolectada de forma ética para garantizar la mayor concentración de activos reparadores.', 1, '2026-04-04 01:57:27', '2026-04-04 01:57:27', NULL),
	(5, 1, 'DR. ALTHEA', 'dr-althea', 'es una marca de "luxury aesthetic" que se ha vuelto masiva en El Salvador gracias a TikTok. Se enfoca en fórmulas de alta gama que combinan ingredientes naturales con tecnología dermatológica para pieles sensibles.', 1, '2026-04-04 02:04:13', '2026-04-04 02:04:13', NULL),
	(6, 1, 'ANUA', 'anua', 'se ha convertido en la marca número 1 en ventas en Corea y la más viral en El Salvador durante 2024 y 2025. Su filosofía se basa en el "minimalismo activo", utilizando ingredientes naturales en altas concentraciones para calmar la piel estresada.', 1, '2026-04-04 02:05:20', '2026-04-04 02:05:20', NULL);


CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_team_id_slug_unique` (`team_id`,`slug`),
  CONSTRAINT `categories_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `categories` (`id`, `team_id`, `name`, `slug`, `description`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 1, 'serums', 'serums', 'son el corazón de la rutina coreana porque contienen la mayor concentración de ingredientes activos para tratar problemas específicos', 1, '2026-04-04 01:22:42', '2026-04-04 01:47:32', NULL),
	(2, 1, 'Protector solar', 'protector-solar', NULL, 1, '2026-04-04 02:11:40', '2026-04-04 02:14:47', NULL),
	(3, 1, 'Parches', 'parches', NULL, 1, '2026-04-04 02:21:19', '2026-04-04 02:21:19', NULL),
	(4, 1, 'mascarillas nocturnas', 'mascarillas-nocturnas', NULL, 1, '2026-04-04 02:36:34', '2026-04-04 02:36:34', NULL),
	(5, 1, 'Tónico Exfoliante', 'tonico-exfoliante', NULL, 1, '2026-04-04 02:43:07', '2026-04-04 02:43:07', NULL),
	(6, 1, 'Limpiador en aceite', 'limpiador-en-aceite', NULL, 1, '2026-04-04 02:52:01', '2026-04-04 02:52:01', NULL),
	(7, 1, 'Limpiador en espuma', 'limpiador-en-espuma', NULL, 1, '2026-04-04 02:52:09', '2026-04-04 02:52:09', NULL),
	(8, 1, 'Vitaminas', 'vitaminas', NULL, 1, '2026-04-04 02:56:01', '2026-04-04 02:56:01', NULL);


CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000000_create_users_table', 1),
	(2, '0001_01_01_000001_create_cache_table', 1),
	(3, '0001_01_01_000002_create_jobs_table', 1),
	(4, '2026_01_27_000001_create_teams_table', 1),
	(5, '2026_01_27_000002_add_current_team_id_to_users_table', 1),
	(6, '2026_04_03_000001_create_categories_table', 1),
	(7, '2026_04_03_000002_create_suppliers_table', 1),
	(8, '2026_04_03_000003_create_products_table', 1),
	(9, '2026_04_03_000004_create_purchases_table', 1),
	(10, '2026_04_03_000005_create_sales_table', 1),
	(11, '2026_04_03_100000_add_password_to_users_table', 1),
	(12, '2026_04_03_000006_create_product_images_table', 2),
	(13, '2026_04_03_194416_create_brands_table', 3),
	(14, '2026_04_03_195408_add_discount_to_purchases_table', 4),
	(15, '2026_04_03_200732_replace_brand_with_brand_id_in_products_table', 5),
	(16, '2026_04_03_210043_add_shipping_fields_to_purchase_items_table', 6),
	(17, '2026_04_03_231734_setup_purchase_shipments', 7);

CREATE TABLE IF NOT EXISTS `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `brand_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock` int NOT NULL DEFAULT '0',
  `min_stock` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_team_id_slug_unique` (`team_id`,`slug`),
  KEY `products_category_id_foreign` (`category_id`),
  KEY `products_brand_id_foreign` (`brand_id`),
  CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `products` (`id`, `team_id`, `category_id`, `brand_id`, `name`, `slug`, `sku`, `description`, `image`, `cost_price`, `sale_price`, `stock`, `min_stock`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 1, 2, 2, 'Aloe Soothing Sun Cream', 'aloe-soothing-sun-cream', '000001', NULL, NULL, 9.58, 20.00, 0, 5, 1, '2026-04-04 02:14:09', '2026-04-04 02:18:06', NULL),
	(2, 1, 3, 2, 'Acne Pimple Master Patch', 'acne-pimple-master-patch', '000002', NULL, NULL, 3.21, 5.00, 0, 0, 1, '2026-04-04 02:22:35', '2026-04-04 02:22:35', NULL),
	(3, 1, 3, 2, 'Clear Fit Master Patch', 'clear-fit-master-patch', '000003', NULL, NULL, 3.21, 5.00, 0, 0, 1, '2026-04-04 02:24:13', '2026-04-04 02:24:28', NULL),
	(4, 1, 1, 3, 'PDRN Pink Peptide Serum Bundle', 'pdrn-pink-peptide-serum-bundle', '000004', NULL, NULL, 14.35, 25.00, 0, 0, 1, '2026-04-04 02:29:20', '2026-04-04 02:29:20', NULL),
	(5, 1, 4, 3, 'Collagen Night Wrapping Mask Bundle', 'collagen-night-wrapping-mask-bundle', '000005', NULL, NULL, 14.89, 25.00, 0, 0, 1, '2026-04-04 02:37:03', '2026-04-04 02:37:03', NULL),
	(6, 1, 1, 3, 'PDRN Pink Collagen Exosome Shot 7500', 'pdrn-pink-collagen-exosome-shot-7500', '000006', NULL, NULL, 12.10, 25.00, 0, 0, 1, '2026-04-04 02:41:10', '2026-04-04 02:41:10', NULL),
	(7, 1, 5, 3, 'Tónico Exfoliante', 'tonico-exfoliante', '000007', NULL, NULL, 18.75, 25.00, 0, 0, 1, '2026-04-04 02:43:48', '2026-04-04 02:43:48', NULL),
	(8, 1, 1, 4, 'Madagascar Centella Ampoule Kit Bundle', 'madagascar-centella-ampoule-kit-bundle', '000008', NULL, NULL, 22.52, 40.00, 0, 0, 1, '2026-04-04 02:45:24', '2026-04-04 02:45:24', NULL),
	(9, 1, 1, 4, 'Tone Brightening Ampoule Jumbo Bundle', 'tone-brightening-ampoule-jumbo-bundle', NULL, NULL, NULL, 14.85, 25.00, 0, 0, 1, '2026-04-04 02:47:10', '2026-04-04 02:47:10', NULL),
	(10, 1, 1, 4, 'Poremizing Fresh Ampoule Jumbo Bundle', 'poremizing-fresh-ampoule-jumbo-bundle', NULL, NULL, NULL, 13.75, 25.00, 0, 0, 1, '2026-04-04 02:48:51', '2026-04-04 02:48:51', NULL),
	(11, 1, 2, 4, 'Hyalu-Cica Water-Fit Sun Serum', 'hyalu-cica-water-fit-sun-serum', NULL, NULL, NULL, 10.45, 20.00, 0, 0, 1, '2026-04-04 02:49:51', '2026-04-04 02:49:51', NULL),
	(12, 1, 1, 1, 'Bean Essence Jumbo Bundle', 'bean-essence-jumbo-bundle', NULL, NULL, NULL, 14.78, 25.00, 2, 0, 1, '2026-04-04 02:51:14', '2026-04-04 06:18:43', NULL),
	(13, 1, 6, 1, 'Bean Cleansing Oil Jumbo Bundle', 'bean-cleansing-oil-jumbo-bundle', NULL, NULL, NULL, 15.67, 25.00, 2, 0, 1, '2026-04-04 02:53:04', '2026-04-04 06:14:01', NULL),
	(14, 1, 7, 1, 'Centella Cleansing Foam Bundle', 'centella-cleansing-foam-bundle', NULL, NULL, NULL, 12.10, 20.00, 1, 0, 1, '2026-04-04 02:54:31', '2026-04-04 06:20:28', NULL),
	(15, 1, 2, 1, 'Centella Sun Cream Bundle', 'centella-sun-cream-bundle', NULL, NULL, NULL, 9.95, 20.00, 0, 0, 1, '2026-04-04 02:55:14', '2026-04-04 06:11:35', NULL),
	(16, 1, 8, 1, 'Vitamin C 20 Serum', 'vitamin-c-20-serum', NULL, NULL, NULL, 11.00, 20.00, 1, 0, 1, '2026-04-04 02:56:24', '2026-04-04 06:19:38', NULL);


CREATE TABLE IF NOT EXISTS `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` smallint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_foreign` (`product_id`),
  CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `product_images` (`id`, `product_id`, `path`, `sort_order`, `created_at`, `updated_at`) VALUES
	(1, 1, 'products/nNjtWP7iaYxYKsWSo4AjAwoAk4TwfxHsPip9Daks.jpg', 0, '2026-04-04 02:16:43', '2026-04-04 02:16:43'),
	(2, 1, 'products/FCNZSVedFuw4bTGpIQ3ECVUofTZgB1KLZBED9syM.jpg', 1, '2026-04-04 02:22:35', '2026-04-04 02:22:35'),
	(4, 2, 'products/C9pAXb3gFPuW1ZxEjPMeDxhZXFtSkWVI3wLcsDtM.jpg', 0, '2026-04-04 02:22:55', '2026-04-04 02:22:55'),
	(5, 3, 'products/Bylh6oVjg5hknAdJRijKaqF1B51ljW60dAa6qVYH.webp', 0, '2026-04-04 02:24:48', '2026-04-04 02:24:48'),
	(6, 4, 'products/JBlLn282j20DOfohcqBjW4GjTbxiYTZ3eDGJlgVj.webp', 0, '2026-04-04 02:29:20', '2026-04-04 02:29:20'),
	(7, 4, 'products/nr5tt8AwLop1EBsT6BGuMAPZBi7nvdQAbwx5fWLG.webp', 1, '2026-04-04 02:37:04', '2026-04-04 02:37:04'),
	(8, 5, 'products/iezGyYdFKc51jKut3tc6CQ0aWrnjiCKxYx4ZfjJE.webp', 0, '2026-04-04 02:37:21', '2026-04-04 02:37:21'),
	(9, 6, 'products/h4YBbFS1RIspdqcjS5e19UVhMYdPXGaJxh8efkNM.webp', 0, '2026-04-04 02:41:10', '2026-04-04 02:41:10'),
	(10, 7, 'products/V6eomXtUSeOEq1GON5LpWihN8N77gLmGShFPFSH9.webp', 0, '2026-04-04 02:43:49', '2026-04-04 02:43:49'),
	(11, 8, 'products/9TedwDw2CuVS9syfPoBKvcm8NLFEHBCHTiw3EEON.webp', 0, '2026-04-04 02:45:24', '2026-04-04 02:45:24'),
	(12, 9, 'products/r26oYAeCwoEiY3FhVvfPANfpxC5CW0MfcOQkw8Aj.webp', 0, '2026-04-04 02:47:11', '2026-04-04 02:47:11'),
	(13, 10, 'products/dcRnhCkmVNjezCzEUG2tS0l1nm7KUGtfeYSAi3Dl.webp', 0, '2026-04-04 02:48:52', '2026-04-04 02:48:52'),
	(14, 11, 'products/qUCH8qLKhzJpnjXMZITCvwGJWoY57gexCTfsxYXG.png', 0, '2026-04-04 02:49:52', '2026-04-04 02:49:52'),
	(15, 12, 'products/qcnraXIzxcnZklpbqNH4tiyI2CaHiXxvCLAISYHJ.webp', 0, '2026-04-04 02:51:15', '2026-04-04 02:51:15'),
	(16, 13, 'products/BLXWiAl2yABe4v8fVw7i79y5uULfLQnJtl9a7zYe.webp', 0, '2026-04-04 02:53:05', '2026-04-04 02:53:05'),
	(17, 14, 'products/p1o2ADLNYzQivlffZd9iu8rp5To64FiRs51BS4JP.webp', 0, '2026-04-04 02:54:32', '2026-04-04 02:54:32'),
	(18, 15, 'products/DO7rshZEtgdAgBiWf1euu66RI7jAgehBJj9ju7vE.webp', 0, '2026-04-04 02:55:15', '2026-04-04 02:55:15'),
	(19, 16, 'products/iUVG1nXRKwGoiBrUS7WSHYIVAtW8OcwRh1gW1S74.webp', 0, '2026-04-04 02:56:25', '2026-04-04 02:56:25');


CREATE TABLE IF NOT EXISTS `purchases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `supplier_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `received_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchases_reference_unique` (`reference`),
  KEY `purchases_team_id_foreign` (`team_id`),
  KEY `purchases_supplier_id_foreign` (`supplier_id`),
  KEY `purchases_user_id_foreign` (`user_id`),
  CONSTRAINT `purchases_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `purchases_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchases_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `purchases` (`id`, `team_id`, `supplier_id`, `user_id`, `reference`, `status`, `subtotal`, `tax`, `discount`, `total`, `notes`, `received_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 1, 1, 1, 'PO-ZDFAV38Y', 'ordered', 234.10, 9.22, 41.57, 201.75, NULL, NULL, '2026-04-04 05:50:25', '2026-04-04 06:13:55', NULL);


CREATE TABLE IF NOT EXISTS `purchase_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchase_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `shipment_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_items_purchase_id_foreign` (`purchase_id`),
  KEY `purchase_items_product_id_foreign` (`product_id`),
  KEY `purchase_items_shipment_id_foreign` (`shipment_id`),
  CONSTRAINT `purchase_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_items_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_items_shipment_id_foreign` FOREIGN KEY (`shipment_id`) REFERENCES `purchase_shipments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `purchase_items` (`id`, `purchase_id`, `product_id`, `quantity`, `unit_cost`, `subtotal`, `shipment_id`, `created_at`, `updated_at`) VALUES
	(1, 1, 13, 2, 15.67, 31.34, 3, '2026-04-04 05:50:25', '2026-04-04 06:12:58'),
	(2, 1, 12, 4, 14.78, 59.12, 3, '2026-04-04 05:50:25', '2026-04-04 06:12:58'),
	(3, 1, 14, 2, 12.10, 24.20, 3, '2026-04-04 05:50:25', '2026-04-04 06:12:58'),
	(4, 1, 15, 2, 9.95, 19.90, 4, '2026-04-04 05:50:25', '2026-04-04 06:13:37'),
	(5, 1, 16, 2, 11.00, 22.00, 3, '2026-04-04 05:50:25', '2026-04-04 06:12:58'),
	(8, 1, 16, 2, 11.00, 22.00, 4, '2026-04-04 06:12:58', '2026-04-04 06:13:37'),
	(9, 1, 14, 2, 12.10, 24.20, 4, '2026-04-04 06:12:58', '2026-04-04 06:13:37'),
	(10, 1, 13, 2, 15.67, 31.34, 4, '2026-04-04 06:12:58', '2026-04-04 06:13:37');


CREATE TABLE IF NOT EXISTS `sales` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sales_reference_unique` (`reference`),
  KEY `sales_team_id_foreign` (`team_id`),
  KEY `sales_user_id_foreign` (`user_id`),
  CONSTRAINT `sales_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sales_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `sales` (`id`, `team_id`, `user_id`, `reference`, `status`, `customer_name`, `customer_email`, `subtotal`, `discount`, `tax`, `total`, `payment_method`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 1, 1, 'SL-QDWORK4Q', 'completed', 'Clientes Varios', NULL, 20.00, 0.00, 0.00, 20.00, 'cash', NULL, '2026-04-04 06:18:08', '2026-04-04 06:18:08', NULL),
	(2, 1, 1, 'SL-CRZE2R8K', 'completed', 'Clientes Varios', NULL, 20.00, 0.00, 0.00, 20.00, 'cash', NULL, '2026-04-04 06:18:43', '2026-04-04 06:18:43', NULL),
	(3, 1, 1, 'SL-SWFJAZHU', 'completed', 'Clientes Varios', NULL, 15.00, 0.00, 0.00, 15.00, 'cash', NULL, '2026-04-04 06:19:38', '2026-04-04 06:19:38', NULL),
	(4, 1, 1, 'SL-2LPWFI0P', 'completed', 'Clientes Varios', NULL, 20.00, 0.00, 0.00, 20.00, 'transfer', NULL, '2026-04-04 06:20:28', '2026-04-04 06:20:28', NULL);


CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sale_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_items_sale_id_foreign` (`sale_id`),
  KEY `sale_items_product_id_foreign` (`product_id`),
  CONSTRAINT `sale_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sale_items_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `quantity`, `unit_price`, `discount`, `subtotal`, `created_at`, `updated_at`) VALUES
	(1, 1, 12, 1, 25.00, 5.00, 20.00, '2026-04-04 06:18:08', '2026-04-04 06:18:08'),
	(2, 2, 12, 1, 25.00, 5.00, 20.00, '2026-04-04 06:18:43', '2026-04-04 06:18:43'),
	(3, 3, 16, 1, 20.00, 5.00, 15.00, '2026-04-04 06:19:38', '2026-04-04 06:19:38'),
	(4, 4, 14, 1, 20.00, 0.00, 20.00, '2026-04-04 06:20:28', '2026-04-04 06:20:28');


CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
	('50PeEd8tQkkOoN8cPYM386LAWzehP0y4QQ7cmHOa', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJaRXJBZXpNek5hdmM1b3BsdUlDbE1JMmdjd2lXMFNBVkFBWnhVU0x0IiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1775257938),
	('Cu6v0h0VBADkoXCw39snlVHgOgz7PrORGDWLp14b', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJUOEJ3UmV0dmNkSThiNXplT3ppcFNPZXYyak42VXZZenFidE02MW5jIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6MSwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAxXC9hZG1pbmlzdHJhdGl2b1wvc2FsZXMiLCJyb3V0ZSI6ImFkbWluLnNhbGVzLmluZGV4In19', 1775262299);


CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `suppliers_team_id_foreign` (`team_id`),
  CONSTRAINT `suppliers_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `suppliers` (`id`, `team_id`, `name`, `email`, `phone`, `contact_name`, `address`, `active`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 1, 'yesstyle', NULL, NULL, 'https://www.yesstyle.com/', NULL, 1, '2026-04-04 01:52:36', '2026-04-04 01:52:36', NULL);


CREATE TABLE IF NOT EXISTS `teams` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_personal` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teams_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `teams` (`id`, `name`, `slug`, `is_personal`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 'KBeauty Glow', 'kbeauty-glow', 0, '2026-04-04 00:27:04', '2026-04-04 00:27:04', NULL);


CREATE TABLE IF NOT EXISTS `team_invitations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_id` bigint unsigned NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invited_by` bigint unsigned NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `team_invitations_code_unique` (`code`),
  KEY `team_invitations_team_id_foreign` (`team_id`),
  KEY `team_invitations_invited_by_foreign` (`invited_by`),
  CONSTRAINT `team_invitations_invited_by_foreign` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_invitations_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `team_members` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `team_members_team_id_user_id_unique` (`team_id`,`user_id`),
  KEY `team_members_user_id_foreign` (`user_id`),
  CONSTRAINT `team_members_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `team_members` (`id`, `team_id`, `user_id`, `role`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'owner', '2026-04-04 00:27:04', '2026-04-04 00:27:04');


CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `workos_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_team_id` bigint unsigned DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_workos_id_unique` (`workos_id`),
  KEY `users_current_team_id_foreign` (`current_team_id`),
  CONSTRAINT `users_current_team_id_foreign` FOREIGN KEY (`current_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `users` (`id`, `name`, `email`, `password`, `email_verified_at`, `workos_id`, `current_team_id`, `remember_token`, `avatar`, `created_at`, `updated_at`) VALUES
	(1, 'Administrador', 'admin@kbeauty.com', '$2y$12$BLzlXee6DdV4YCpsLoc4ceOyMSEon1p4n6Qlxb9hceI0zckeQfPbq', NULL, 'local_admin_001', 1, NULL, '', '2026-04-04 00:27:04', '2026-04-04 00:27:04');

