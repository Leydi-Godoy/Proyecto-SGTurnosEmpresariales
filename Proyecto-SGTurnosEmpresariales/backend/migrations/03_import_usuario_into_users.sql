-- Migration: 03_import_usuario_into_users.sql
-- Description: Import data from legacy `usuario` table into new `users` table
-- Usage: run this AFTER you have imported the legacy dump (which creates `usuario`) into
-- the same database (SGTurnos_empresariales). It will copy rows into `users` and
-- normalize email domains to @sgturnos.com.

-- IMPORTANT: backup your database before running!

SET FOREIGN_KEY_CHECKS = 0;

-- Insert into new users table mapping fields from legacy usuario table.
-- Adjust column names if your `users` schema differs.
INSERT IGNORE INTO users (id, company_id, email, password_hash, full_name, is_active, created_at, updated_at)
SELECT
  Id_usuario AS id,
  NULL AS company_id,
  -- normalize and replace legacy domains to @sgturnos.com
  REPLACE(REPLACE(LOWER(correo),'@paliacare.com','@sgturnos.com'),'@palicare.com','@sgturnos.com') AS email,
  contrasena AS password_hash,
  CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido) AS full_name,
  CASE WHEN activo = b'1' THEN 1 ELSE 0 END AS is_active,
  NOW() AS created_at,
  NOW() AS updated_at
FROM usuario
WHERE correo IS NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- Verify duplicates (run manually):
-- SELECT email, COUNT(*) c FROM users GROUP BY email HAVING c>1;
