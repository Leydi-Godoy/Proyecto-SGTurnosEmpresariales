-- Post-procesamiento idempotente para distribuir usuarios entre 8 empresas
-- Uso: ejecutar después de importar `backend/seeds/usuarios_import.sql` original
-- 1) Crea `Id_rol` si no existe, 2) redistribuye `empresa_id` en round-robin
-- 3) asigna roles por empresa: 1->administrador(ademp2), 2->supervisor(supvi4), 3->planificador(plani3), resto->empleados(emple5)
-- 4) fija superadministradores por correo

START TRANSACTION;

-- Asegura la columna de rol (si no existe, la añade). Si tu MySQL no soporta IF NOT EXISTS para ADD COLUMN, puede fallar; ejecutar solo si estás en MySQL 8.0.16+.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS Id_rol VARCHAR(32) DEFAULT 'emple5';

-- Redistribuye empresa_id en round-robin para los usuarios del seed (filtramos por dominio @sgturnos.com)
SET @rn := 0;

UPDATE usuarios u
JOIN (
  SELECT id, (@rn := @rn + 1) AS rn
  FROM usuarios
  WHERE correo LIKE '%@sgturnos.com'
  ORDER BY id
) t ON u.id = t.id
SET u.empresa_id = ((t.rn - 1) % 8) + 1
WHERE u.correo LIKE '%@sgturnos.com';

-- Asegura dos super-administradores globales (no por empresa)
UPDATE usuarios SET Id_rol = 'supad1' WHERE correo IN ('leydigodoy@sgturnos.com','edissontaborda@sgturnos.com');

-- Asigna roles por empresa usando ROW_NUMBER() partition por empresa
-- Requiere MySQL 8+ (soporta ROW_NUMBER()).
UPDATE usuarios u
JOIN (
  SELECT id, empresa_id, ROW_NUMBER() OVER (PARTITION BY empresa_id ORDER BY id) AS rn
  FROM usuarios
  WHERE empresa_id BETWEEN 1 AND 8 AND correo LIKE '%@sgturnos.com'
) t ON u.id = t.id
SET u.Id_rol = CASE
  WHEN t.rn = 1 THEN 'ademp2'  -- administrador de la empresa
  WHEN t.rn = 2 THEN 'supvi4'  -- supervisor
  WHEN t.rn = 3 THEN 'plani3'  -- planificador
  ELSE 'emple5'               -- empleado
END
WHERE u.correo LIKE '%@sgturnos.com';

COMMIT;

-- Validaciones sugeridas (ejecutar manualmente después):
-- SELECT empresa_id, Id_rol, COUNT(*) FROM usuarios WHERE correo LIKE '%@sgturnos.com' GROUP BY empresa_id, Id_rol ORDER BY empresa_id, Id_rol;
-- SELECT correo, empresa_id, Id_rol FROM usuarios WHERE correo IN ('leydigodoy@sgturnos.com','edissontaborda@sgturnos.com');
-- SELECT empresa_id, COUNT(*) FROM usuarios WHERE correo LIKE '%@sgturnos.com' GROUP BY empresa_id ORDER BY empresa_id;
