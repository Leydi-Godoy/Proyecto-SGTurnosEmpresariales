-- Añade columna de código de rol y crea roles estándar
-- Ejecutar con cuidado; si tu MySQL no soporta IF NOT EXISTS, adapta las líneas.

START TRANSACTION;

-- Añade columna 'codigo' para almacenar los identificadores como 'supad1','ademp2', etc.
ALTER TABLE rol ADD COLUMN IF NOT EXISTS codigo VARCHAR(32) AFTER creado_en;

-- Crea índice único sobre 'codigo' (si no existe)
CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_codigo ON rol (codigo);

-- Inserta roles estándar (no duplican si ya existen códigos iguales)
INSERT INTO rol (nombre, descripcion, codigo, creado_en)
VALUES
  ('Super Administrador','Acceso total','supad1', CURRENT_TIMESTAMP()),
  ('Administrador de empresa','Administrador de la empresa','ademp2', CURRENT_TIMESTAMP()),
  ('Planificador','Planificador de turnos','plani3', CURRENT_TIMESTAMP()),
  ('Supervisor','Supervisor de la empresa','supvi4', CURRENT_TIMESTAMP()),
  ('Empleado','Empleado estándar','emple5', CURRENT_TIMESTAMP())
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

COMMIT;

-- Verificaciones sugeridas:
-- SELECT * FROM rol;
-- SELECT COUNT(*) FROM rol WHERE codigo IN ('supad1','ademp2','plani3','supvi4','emple5');
