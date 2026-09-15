-- Seed: usuarios
-- Crea un plan y una empresa demo (si no existen) y añade usuarios de ejemplo.

START TRANSACTION;

-- 1) Crear plan 'Free' si no existe
INSERT INTO planes (nombre, caracteristicas, precio)
SELECT 'Free', JSON_OBJECT('max_empleados', 10), 0.00
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM planes WHERE nombre = 'Free');

-- 2) Crear empresa demo si no existe (asigna el plan 'Free')
INSERT INTO empresas (nombre, zona_horaria, plan_id)
SELECT 'Demo Corp', 'America/Argentina/Buenos_Aires', p.id
FROM planes p
WHERE p.nombre = 'Free' AND NOT EXISTS (SELECT 1 FROM empresas WHERE nombre = 'Demo Corp');

-- 3) Insertar usuario administrador si no existe
INSERT INTO usuarios (empresa_id, correo, contrasena, nombre_completo, telefono, esta_activo)
SELECT e.id, 'admin@democorp.test', SHA2('admin123',512), 'Administrador Demo', '+5491112345678', 1
FROM empresas e
WHERE e.nombre = 'Demo Corp' AND NOT EXISTS (
  SELECT 1 FROM usuarios u WHERE u.email = 'admin@democorp.test' AND u.empresa_id = e.id
);

-- 4) Insertar usuario regular si no existe
INSERT INTO usuarios (empresa_id, correo, contrasena, nombre_completo, telefono, esta_activo)
SELECT e.id, 'usuario@democorp.test', SHA2('usuario123',512), 'Usuario Demo', '+5491198765432', 1
FROM empresas e
WHERE e.nombre = 'Demo Corp' AND NOT EXISTS (
  SELECT 1 FROM usuarios u WHERE u.correo = 'usuario@democorp.test' AND u.empresa_id = e.id
);

COMMIT;

-- Verificación rápida (ejecutar por separado para revisar resultados):
-- SELECT id, empresa_id, email, nombre_completo, esta_activo FROM usuarios WHERE empresa_id = (SELECT id FROM empresas WHERE nombre = 'Demo Corp');
