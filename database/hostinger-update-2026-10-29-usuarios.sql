-- Hostinger (phpMyAdmin): usuarios con soft delete.
-- Equivale a la migración 2026_10_29_000004_add_soft_deletes_to_users_table.
-- Se puede ejecutar más de una vez: si la columna ya existe, no hace nada.

SET @existe := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'deleted_at'
);

SET @sql := IF(@existe = 0,
  'ALTER TABLE `users` ADD COLUMN `deleted_at` timestamp NULL DEFAULT NULL',
  'SELECT ''La columna deleted_at ya existe'' AS aviso');

PREPARE paso FROM @sql;
EXECUTE paso;
DEALLOCATE PREPARE paso;

INSERT INTO `migrations` (`migration`, `batch`)
SELECT t.`migration`, t.`batch`
FROM (
  SELECT '2026_10_29_000004_add_soft_deletes_to_users_table' AS `migration`,
         (SELECT COALESCE(MAX(`batch`), 0) + 1 FROM `migrations`) AS `batch`
) AS t
WHERE NOT EXISTS (
  SELECT 1 FROM `migrations` WHERE `migration` = t.`migration`
);
