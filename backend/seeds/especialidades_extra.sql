-- Especialidades ampliadas (idempotente)
-- Incluye áreas tipo vigilancia/call center que requieren asignación por horarios

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Medicina General', 'Atención primaria y consulta general', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Medicina General');

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Enfermería', 'Cuidados y seguimiento de pacientes', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Enfermería');

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Odontología', 'Atención dental y procedimientos odontológicos', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Odontología');

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Psicología', 'Atención psicológica y terapias', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Psicología');

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Nutrición', 'Asesoría nutricional y planes alimentarios', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Nutrición');

-- Áreas operativas que requieren asignación por turnos
INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Vigilancia', 'Personal de vigilancia y seguridad por turnos', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Vigilancia');

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Seguridad Privada', 'Servicios de seguridad privada y control de accesos', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Seguridad Privada');

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Call Center', 'Atención telefónica 24/7, turnos rotativos', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Call Center');

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Recepción', 'Atención en recepción y control de visitas (turnos)', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Recepción');

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Limpieza', 'Servicios de limpieza por turnos', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Limpieza');

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Mantenimiento', 'Tareas de mantenimiento preventivo y correctivo', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Mantenimiento');

INSERT INTO especialidades (nombre, descripcion, creado_en)
SELECT 'Monitoreo CCTV', 'Vigilancia por cámaras y monitoreo remoto', NOW()
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Monitoreo CCTV');

-- Verificación sugerida:
-- SELECT id, nombre FROM especialidades WHERE nombre IN ('Vigilancia','Call Center','Seguridad Privada','Recepción','Limpieza');
