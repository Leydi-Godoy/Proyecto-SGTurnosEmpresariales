-- Migration 15: Crear tabla configuraciones_malla
-- Propósito: Almacenar configuraciones de generación de mallas por empresa

CREATE TABLE IF NOT EXISTS configuraciones_malla (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  cantidad_empleados INT NOT NULL,
  horas_por_semana DECIMAL(5, 2) NOT NULL DEFAULT 42,
  horas_por_mes DECIMAL(7, 2) NOT NULL DEFAULT 182,
  dias_laborales_por_semana INT NOT NULL DEFAULT 5,
  cantidad_turnos INT NOT NULL,
  tipo_distribucion ENUM('equilibrada', 'personalizada') NOT NULL DEFAULT 'equilibrada',
  descripcion TEXT,
  activo TINYINT DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key
  CONSTRAINT fk_configuraciones_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_configuraciones_empresa (empresa_id),
  INDEX idx_configuraciones_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de relación: configuracion_malla ↔ plantillas_turno
CREATE TABLE IF NOT EXISTS configuraciones_malla_turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  configuracion_id INT NOT NULL,
  plantilla_id INT NOT NULL,
  orden INT NOT NULL,
  duracion_horas DECIMAL(4, 2) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT fk_conf_malla_turnos_config FOREIGN KEY (configuracion_id) REFERENCES configuraciones_malla(id) ON DELETE CASCADE,
  CONSTRAINT fk_conf_malla_turnos_plantilla FOREIGN KEY (plantilla_id) REFERENCES plantillas_turno(id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_conf_malla_turnos_config (configuracion_id),
  INDEX idx_conf_malla_turnos_plantilla (plantilla_id),
  UNIQUE KEY uq_conf_malla_turnos (configuracion_id, plantilla_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
