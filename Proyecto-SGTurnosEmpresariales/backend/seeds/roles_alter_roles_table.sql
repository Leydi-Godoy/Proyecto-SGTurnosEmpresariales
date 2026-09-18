-- Adaptado para la tabla `roles` (plural)
-- Ejecutar en phpMyAdmin sobre la base `sgturnos_empresas`.
-- El script es idempotente: añade la columna `codigo` si falta, crea un índice (intenta, ignorar error si ya existe),
-- y asegura los roles estándar sin duplicar.

-- 1) Verifica que la tabla `roles` existe (puedes ejecutar solo esta consulta primero):
SELECT COUNT(*) AS roles_table_exists
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'roles';

-- 2) Añadir columna `codigo` si no existe:
SELECT COUNT(*) AS codigo_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'roles' AND COLUMN_NAME = 'codigo';

-- Si el resultado anterior es 0, ejecutar la siguiente línea (phpMyAdmin mostrará error si ya existe):
ALTER TABLE roles ADD COLUMN codigo VARCHAR(32) AFTER creado_en;

-- 3) Intentar crear índice único sobre `codigo` (si falla por ya existir, puedes ignorar el error):
CREATE UNIQUE INDEX uq_roles_codigo ON roles (codigo);

-- 4) Insertar roles estándar de forma idempotente (INSERT solo si no existe), y luego actualizar nombre/descr si cambian.

-- Super Administrador
INSERT INTO roles (nombre, descripcion, codigo, creado_en)
SELECT 'Super Administrador','Acceso total','supad1', CURRENT_TIMESTAMP()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE codigo = 'supad1');
UPDATE roles SET nombre = 'Super Administrador', descripcion = 'Acceso total' WHERE codigo = 'supad1';

-- Administrador de empresa
INSERT INTO roles (nombre, descripcion, codigo, creado_en)
SELECT 'Administrador de empresa','Administrador de la empresa','ademp2', CURRENT_TIMESTAMP()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE codigo = 'ademp2');
UPDATE roles SET nombre = 'Administrador de empresa', descripcion = 'Administrador de la empresa' WHERE codigo = 'ademp2';

-- Planificador
INSERT INTO roles (nombre, descripcion, codigo, creado_en)
SELECT 'Planificador','Planificador de turnos','plani3', CURRENT_TIMESTAMP()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE codigo = 'plani3');
UPDATE roles SET nombre = 'Planificador', descripcion = 'Planificador de turnos' WHERE codigo = 'plani3';

-- Supervisor
INSERT INTO roles (nombre, descripcion, codigo, creado_en)
SELECT 'Supervisor','Supervisor de la empresa','supvi4', CURRENT_TIMESTAMP()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE codigo = 'supvi4');
UPDATE roles SET nombre = 'Supervisor', descripcion = 'Supervisor de la empresa' WHERE codigo = 'supvi4';

-- Empleado
INSERT INTO roles (nombre, descripcion, codigo, creado_en)
SELECT 'Empleado','Empleado estándar','emple5', CURRENT_TIMESTAMP()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE codigo = 'emple5');
UPDATE roles SET nombre = 'Empleado', descripcion = 'Empleado estándar' WHERE codigo = 'emple5';

-- 5) Verificación rápida
SELECT id, nombre, codigo FROM roles WHERE codigo IN ('supad1','ademp2','plani3','supvi4','emple5');

-- Nota: Si phpMyAdmin rechaza el CREATE UNIQUE INDEX por sintaxis o permisos, crea manualmente el índice desde la pestaña Structure -> Indexes.
