-- Inserta un mix de especialidades (salud + operativas) por empresa (idempotente)
-- Ejecutar en la base `sgturnos_empresas` desde phpMyAdmin

-- Lista mixta: algunas de salud y algunas operativas
SET @specialties = NULL;

-- Para cada especialidad, insertarla en todas las empresas si no existe
INSERT INTO especialidades (empresa_id, nombre, descripcion, creado_en)
SELECT e.id, 'Medicina General', 'Atención primaria y consulta general', NOW()
FROM empresas e
WHERE NOT EXISTS (
  SELECT 1 FROM especialidades es WHERE es.empresa_id = e.id AND es.nombre = 'Medicina General'
);

INSERT INTO especialidades (empresa_id, nombre, descripcion, creado_en)
SELECT e.id, 'Enfermería', 'Cuidados y seguimiento de pacientes', NOW()
FROM empresas e
WHERE NOT EXISTS (
  SELECT 1 FROM especialidades es WHERE es.empresa_id = e.id AND es.nombre = 'Enfermería'
);

INSERT INTO especialidades (empresa_id, nombre, descripcion, creado_en)
SELECT e.id, 'Psicología', 'Atención psicológica y terapias', NOW()
FROM empresas e
WHERE NOT EXISTS (
  SELECT 1 FROM especialidades es WHERE es.empresa_id = e.id AND es.nombre = 'Psicología'
);

-- Operativas / por turnos
INSERT INTO especialidades (empresa_id, nombre, descripcion, creado_en)
SELECT e.id, 'Vigilancia', 'Personal de vigilancia y seguridad por turnos', NOW()
FROM empresas e
WHERE NOT EXISTS (
  SELECT 1 FROM especialidades es WHERE es.empresa_id = e.id AND es.nombre = 'Vigilancia'
);

INSERT INTO especialidades (empresa_id, nombre, descripcion, creado_en)
SELECT e.id, 'Call Center', 'Atención telefónica 24/7, turnos rotativos', NOW()
FROM empresas e
WHERE NOT EXISTS (
  SELECT 1 FROM especialidades es WHERE es.empresa_id = e.id AND es.nombre = 'Call Center'
);

INSERT INTO especialidades (empresa_id, nombre, descripcion, creado_en)
SELECT e.id, 'Recepción', 'Atención en recepción y control de visitas (turnos)', NOW()
FROM empresas e
WHERE NOT EXISTS (
  SELECT 1 FROM especialidades es WHERE es.empresa_id = e.id AND es.nombre = 'Recepción'
);

INSERT INTO especialidades (empresa_id, nombre, descripcion, creado_en)
SELECT e.id, 'Limpieza', 'Servicios de limpieza por turnos', NOW()
FROM empresas e
WHERE NOT EXISTS (
  SELECT 1 FROM especialidades es WHERE es.empresa_id = e.id AND es.nombre = 'Limpieza'
);

INSERT INTO especialidades (empresa_id, nombre, descripcion, creado_en)
SELECT e.id, 'Mantenimiento', 'Tareas de mantenimiento preventivo y correctivo', NOW()
FROM empresas e
WHERE NOT EXISTS (
  SELECT 1 FROM especialidades es WHERE es.empresa_id = e.id AND es.nombre = 'Mantenimiento'
);

INSERT INTO especialidades (empresa_id, nombre, descripcion, creado_en)
SELECT e.id, 'Monitoreo CCTV', 'Vigilancia por cámaras y monitoreo remoto', NOW()
FROM empresas e
WHERE NOT EXISTS (
  SELECT 1 FROM especialidades es WHERE es.empresa_id = e.id AND es.nombre = 'Monitoreo CCTV'
);

-- Opcional: revisar qué se insertó
-- SELECT empresa_id, nombre FROM especialidades WHERE nombre IN ('Medicina General','Enfermería','Psicología','Vigilancia','Call Center','Recepción','Limpieza','Mantenimiento','Monitoreo CCTV') ORDER BY empresa_id, nombre;
