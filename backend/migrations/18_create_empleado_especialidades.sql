-- Permite vincular varias especialidades a un mismo empleado.
CREATE TABLE IF NOT EXISTS empleado_especialidades (
  empleado_id BIGINT UNSIGNED NOT NULL,
  especialidad_id BIGINT UNSIGNED NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (empleado_id, especialidad_id),
  INDEX idx_empleado_especialidades_especialidad (especialidad_id),
  CONSTRAINT fk_empleado_especialidades_empleado
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_empleado_especialidades_especialidad
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conserva la especialidad anterior como primera vinculación cuando exista.
INSERT IGNORE INTO empleado_especialidades (empleado_id, especialidad_id)
SELECT id, especialidad_id
FROM empleados
WHERE especialidad_id IS NOT NULL;