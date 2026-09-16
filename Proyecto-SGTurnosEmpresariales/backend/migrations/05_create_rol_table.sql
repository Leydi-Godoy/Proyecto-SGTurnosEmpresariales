-- Migration: 05_create_rol_table.sql
-- Crea la tabla `departamento` y la tabla `rol` con la estructura solicitada:
-- Id_rol (PK), rol, Id_departamento (FK)
-- También inserta departamentos iniciales y los roles: subad1, ademp2, plani3, supvi4, emple5

SET FOREIGN_KEY_CHECKS = 0;

-- Tabla departamentos
CREATE TABLE IF NOT EXISTS departamento (
  Id_departamento VARCHAR(50) NOT NULL,
  nombre_departamento VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id_departamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla rol (simple, con FK a departamento)
CREATE TABLE IF NOT EXISTS rol (
  Id_rol VARCHAR(50) NOT NULL,
  rol VARCHAR(255) NOT NULL,
  Id_departamento VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id_rol),
  INDEX idx_rol_departamento (Id_departamento),
  CONSTRAINT fk_rol_departamento FOREIGN KEY (Id_departamento) REFERENCES departamento(Id_departamento) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed departamentos (genéricos para empresas)
INSERT INTO departamento (Id_departamento, nombre_departamento)
VALUES
  ('D003', 'Administración'),
  ('HR01', 'Recursos Humanos'),
  ('OPS01', 'Operaciones'),
  ('IT01', 'Tecnologías de la Información'),
  ('LOG01', 'Logística'),
  ('GENERAL', 'General')
ON DUPLICATE KEY UPDATE nombre_departamento = VALUES(nombre_departamento), updated_at = CURRENT_TIMESTAMP;

-- Seed roles solicitados (asignados a departamentos genéricos)
INSERT INTO rol (Id_rol, rol, Id_departamento)
VALUES
  ('subad1', 'Super Administrador', 'D003'),
  ('ademp2', 'Administrador Empresa', 'D003'),
  ('plani3', 'Planificador', 'HR01'),
  ('supvi4', 'Supervisor', 'OPS01'),
  ('emple5', 'Empleado', 'GENERAL')
ON DUPLICATE KEY UPDATE rol = VALUES(rol), Id_departamento = VALUES(Id_departamento), updated_at = CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS = 1;

-- Consulta rápida para revisar la siembra
SELECT * FROM departamento ORDER BY Id_departamento;
SELECT * FROM rol ORDER BY Id_rol;
