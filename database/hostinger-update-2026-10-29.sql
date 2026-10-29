-- ============================================================================
-- Actualización para Hostinger (plan Single, sin SSH): clientes, ajustes,
-- destacados y cotizaciones. Equivale a las migraciones:
--   2026_10_29_000001_create_customers_table
--   2026_10_29_000002_create_settings_and_featured
--   2026_10_29_000003_create_quotes_tables
--
-- Cómo usarlo:
--   1. hPanel > Bases de datos > phpMyAdmin > selecciona la base de la tienda.
--   2. HAZ UN RESPALDO antes (pestaña "Exportar").
--   3. Pestaña "SQL": pega TODO este archivo y pulsa "Continuar".
--   Solo se ejecuta UNA vez. Si falla a la mitad, restaura el respaldo.
-- ============================================================================

START TRANSACTION;

-- 1) Clientes ---------------------------------------------------------------
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `municipality` varchar(255) DEFAULT NULL,
  `address` text,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `sales`
  ADD COLUMN `customer_id` bigint unsigned DEFAULT NULL AFTER `user_id`,
  ADD CONSTRAINT `sales_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL;

-- 2) Ajustes de la tienda y productos destacados ----------------------------
CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `products`
  ADD COLUMN `featured` tinyint(1) NOT NULL DEFAULT '0' AFTER `active`;

-- 3) Cotizaciones -----------------------------------------------------------
CREATE TABLE `quotes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `reference` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `notes` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quotes_reference_unique` (`reference`),
  KEY `quotes_team_id_foreign` (`team_id`),
  KEY `quotes_user_id_foreign` (`user_id`),
  CONSTRAINT `quotes_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quotes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quote_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `quote_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `quote_items_quote_id_foreign` (`quote_id`),
  KEY `quote_items_product_id_foreign` (`product_id`),
  CONSTRAINT `quote_items_quote_id_foreign` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quote_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) Registrar las migraciones, para que Laravel no intente repetirlas ------
INSERT INTO `migrations` (`migration`, `batch`)
SELECT m.`migration`, b.`next_batch`
FROM (
  SELECT '2026_10_29_000001_create_customers_table' AS `migration`
  UNION ALL SELECT '2026_10_29_000002_create_settings_and_featured'
  UNION ALL SELECT '2026_10_29_000003_create_quotes_tables'
) AS m
CROSS JOIN (SELECT COALESCE(MAX(`batch`), 0) + 1 AS `next_batch` FROM `migrations`) AS b;

COMMIT;
