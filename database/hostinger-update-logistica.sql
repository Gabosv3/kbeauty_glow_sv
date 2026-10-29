-- ============================================================================
-- Actualización para Hostinger (plan Single, sin SSH): logística de salida
-- (paqueteras y despachos). Equivale a las migraciones:
--   2026_10_30_000001_create_carriers_table
--   2026_10_30_000002_create_shipments_table
--
-- Cómo usarlo:
--   1. hPanel > Bases de datos > phpMyAdmin > selecciona la base de la tienda.
--   2. HAZ UN RESPALDO antes (pestaña "Exportar").
--   3. Pestaña "SQL": pega TODO este archivo y pulsa "Continuar".
--   Solo se ejecuta UNA vez. Si falla a la mitad, restaura el respaldo.
-- ============================================================================

START TRANSACTION;

-- 1) Paqueteras -------------------------------------------------------------
CREATE TABLE `carriers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `tracking_url` varchar(255) DEFAULT NULL,
  `shipping_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `notes` text,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `carriers_team_id_foreign` (`team_id`),
  CONSTRAINT `carriers_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Despachos --------------------------------------------------------------
CREATE TABLE `shipments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_id` bigint unsigned NOT NULL,
  `sale_id` bigint unsigned NOT NULL,
  `carrier_id` bigint unsigned DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'preparing',
  `cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ship_date` date DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shipments_team_id_foreign` (`team_id`),
  KEY `shipments_sale_id_foreign` (`sale_id`),
  KEY `shipments_carrier_id_foreign` (`carrier_id`),
  CONSTRAINT `shipments_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shipments_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shipments_carrier_id_foreign` FOREIGN KEY (`carrier_id`) REFERENCES `carriers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Registrar las migraciones, para que Laravel no intente repetirlas ------
INSERT INTO `migrations` (`migration`, `batch`)
SELECT m.`migration`, b.`next_batch`
FROM (
  SELECT '2026_10_30_000001_create_carriers_table' AS `migration`
  UNION ALL SELECT '2026_10_30_000002_create_shipments_table'
) AS m
CROSS JOIN (SELECT COALESCE(MAX(`batch`), 0) + 1 AS `next_batch` FROM `migrations`) AS b;

COMMIT;
