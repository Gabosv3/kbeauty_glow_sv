-- Hostinger (phpMyAdmin): usuarios con soft delete.
-- Equivale a la migración 2026_10_29_000004_add_soft_deletes_to_users_table.
-- Haz un respaldo antes y ejecútalo UNA sola vez, después del script hostinger-update-2026-10-29.sql.

START TRANSACTION;

ALTER TABLE `users` ADD COLUMN `deleted_at` timestamp NULL DEFAULT NULL;

INSERT INTO `migrations` (`migration`, `batch`)
SELECT '2026_10_29_000004_add_soft_deletes_to_users_table', COALESCE(MAX(`batch`), 0) + 1 FROM `migrations`;

COMMIT;
