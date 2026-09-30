-- Add company-site coverage templates and per-specialty staffing requirements.
ALTER TABLE plantillas_turno
  ADD COLUMN sede_id BIGINT UNSIGNED NULL AFTER empresa_id,
  ADD INDEX idx_plantillas_turno_sede (sede_id),
  ADD CONSTRAINT fk_plantillas_turno_sede
    FOREIGN KEY (sede_id) REFERENCES sedes(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE plantilla_turno_requerimientos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  plantilla_id BIGINT UNSIGNED NOT NULL,
  especialidad_id BIGINT UNSIGNED NOT NULL,
  cantidad_usuarios INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_plantilla_requerimiento_especialidad (plantilla_id, especialidad_id),
  INDEX idx_plantilla_requerimientos_especialidad (especialidad_id),
  CONSTRAINT fk_plantilla_requerimientos_plantilla
    FOREIGN KEY (plantilla_id) REFERENCES plantillas_turno(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_plantilla_requerimientos_especialidad
    FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;