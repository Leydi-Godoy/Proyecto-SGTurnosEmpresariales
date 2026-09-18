-- Superusuario local de pruebas. Password: admin123
-- Ejecutar despues de 00_create_schema.sql.
INSERT INTO users (email, password_hash, full_name, is_active)
VALUES (
  'superadmin@sgturnos.com',
  '$2a$10$4ly.w6O7rSV/PKbuW48ZvOgbebAsWpLiVTSGxIwBfBQ019zR39ARO',
  'Super Administrador',
  1
)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), is_active = 1;