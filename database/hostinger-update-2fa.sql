-- Hostinger (phpMyAdmin): autenticación en dos pasos (TOTP) para usuarios del panel.
-- Equivale a la migración 2026_10_30_000003_add_two_factor_to_users_table.
-- Haz un respaldo antes y ejecútalo UNA sola vez.

START TRANSACTION;

ALTER TABLE `users`
  ADD COLUMN `two_factor_secret` text NULL DEFAULT NULL,
  ADD COLUMN `two_factor_recovery_codes` text NULL DEFAULT NULL,
  ADD COLUMN `two_factor_confirmed_at` timestamp NULL DEFAULT NULL;

INSERT INTO `migrations` (`migration`, `batch`)
SELECT '2026_10_30_000003_add_two_factor_to_users_table', COALESCE(MAX(`batch`), 0) + 1 FROM `migrations`;

COMMIT;
