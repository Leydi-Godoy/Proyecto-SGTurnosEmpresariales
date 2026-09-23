-- ================================================================================
-- MIGRACIÓN 15: Crear tablas para Configuración de Malla de Turnos
-- ================================================================================
-- Propósito: Crear la estructura para gestionar configuraciones de mallas de turnos
-- Fecha: 2026-09-22
-- 
-- Descripción:
-- Una "malla de turnos" es la configuración que define cómo se distribuyen los 
-- turnos en una empresa:
-- - Cantidad de empleados cubiertos
-- - Horas legales por semana (típicamente 42 en Colombia)
-- - Horas legales por mes (típicamente 182 en Colombia)
-- - Tipo de distribución: 2x12h (día/noche), 3x8h (mañana/tarde/noche), etc.
-- 
-- Las mallas pueden ser:
-- - "equilibrada": El generador automático distribuye los turnos equitativamente
-- - "personalizada": Configuración manual, puede usarse como plantilla
-- ================================================================================

-- ================================================================================
-- TABLA 1: configuraciones_malla
-- ================================================================================
-- Almacena la configuración principal de cada malla de turnos por empresa
-- ================================================================================
DROP TABLE IF EXISTS configuraciones_malla_turnos;
DROP TABLE IF EXISTS configuraciones_malla;

CREATE TABLE configuraciones_malla (
  -- Identificadores
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  
  -- Información básica
  nombre VARCHAR(255) NOT NULL COMMENT 'Nombre descriptivo de la malla (ej: "Malla 2x12h Turno Día/Noche")',
  descripcion TEXT COMMENT 'Descripción detallada de la configuración',
  
  -- Parámetros de la malla
  cantidad_empleados INT NOT NULL COMMENT 'Cantidad de empleados a cubrir en esta malla',
  horas_por_semana INT DEFAULT 42 COMMENT 'Horas legales por semana (Colombia: 42)',
  horas_por_mes INT DEFAULT 182 COMMENT 'Horas legales por mes (Colombia: 182)',
  dias_laborales_por_semana INT DEFAULT 5 COMMENT 'Días de trabajo por semana',
  cantidad_turnos INT NOT NULL COMMENT 'Cantidad total de turnos diferentes (ej: 2 para 2x12h, 3 para 3x8h)',
  
  -- Tipo de distribución
  tipo_distribucion ENUM('equilibrada', 'personalizada') DEFAULT 'equilibrada' 
    COMMENT 'equilibrada: generador automático | personalizada: configuración manual',
  
  -- Estados
  activo BOOLEAN DEFAULT TRUE COMMENT 'Indica si la configuración está activa',
  
  -- Auditoría
  creado_por INT COMMENT 'ID del usuario que creó la configuración',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha/hora de creación',
  actualizado_por INT COMMENT 'ID del usuario que hizo la última modificación',
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha/hora de la última modificación',
  
  -- Restricciones
  CONSTRAINT fk_config_malla_empresa FOREIGN KEY (empresa_id) 
    REFERENCES empresas(id) ON DELETE CASCADE,
  CONSTRAINT fk_config_malla_creado_por FOREIGN KEY (creado_por) 
    REFERENCES usuarios(Id_usuario) ON DELETE SET NULL,
  CONSTRAINT fk_config_malla_actualizado_por FOREIGN KEY (actualizado_por) 
    REFERENCES usuarios(Id_usuario) ON DELETE SET NULL,
  
  -- Índices
  UNIQUE KEY uk_config_nombre_empresa (empresa_id, nombre),
  INDEX idx_configuraciones_empresa (empresa_id),
  INDEX idx_configuraciones_activo (activo),
  INDEX idx_configuraciones_tipo (tipo_distribucion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Almacena las configuraciones de malla de turnos por empresa';

-- ================================================================================
-- TABLA 2: configuraciones_malla_turnos
-- ================================================================================
-- Relación muchos-a-muchos entre configuraciones y plantillas de turno
-- Define qué turnos (plantillas) forman parte de cada malla y su orden
-- ================================================================================
CREATE TABLE configuraciones_malla_turnos (
  -- Identificadores
  id INT AUTO_INCREMENT PRIMARY KEY,
  configuracion_id INT NOT NULL,
  plantilla_id INT NOT NULL,
  
  -- Información del turno en la malla
  orden INT NOT NULL COMMENT 'Orden de rotación del turno (1, 2, 3...)',
  duracion_horas INT NOT NULL COMMENT 'Duración en horas de este turno (típicamente 8 o 12)',
  
  -- Auditoría
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Restricciones
  CONSTRAINT fk_config_turno_configuracion FOREIGN KEY (configuracion_id) 
    REFERENCES configuraciones_malla(id) ON DELETE CASCADE,
  CONSTRAINT fk_config_turno_plantilla FOREIGN KEY (plantilla_id) 
    REFERENCES plantillas_turno(id) ON DELETE CASCADE,
  CONSTRAINT uk_config_turno_unique UNIQUE KEY (configuracion_id, plantilla_id),
  
  -- Índices
  INDEX idx_config_turno_configuracion (configuracion_id),
  INDEX idx_config_turno_plantilla (plantilla_id),
  INDEX idx_config_turno_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación M2M: Define qué plantillas de turno componen cada configuración de malla';

-- ================================================================================
-- COMENTARIOS EXPLICATIVOS
-- ================================================================================
/*
EJEMPLO DE USO:
===============

1. Una empresa tiene 60 empleados y necesita malla 2x12h (día/noche):
   
   INSERT INTO configuraciones_malla (
     empresa_id, nombre, cantidad_empleados, cantidad_turnos,
     tipo_distribucion, descripcion, creado_por
   ) VALUES (
     1, 'Malla 2x12h Rotatoria', 60, 2, 'equilibrada',
     'Rotación Turno Día (09:00-21:00) y Turno Noche (21:00-09:00)',
     5
   );
   -- Resultado: id = 1

2. Asignar los dos turnos a esta malla:
   
   INSERT INTO configuraciones_malla_turnos (
     configuracion_id, plantilla_id, orden, duracion_horas
   ) VALUES
   (1, 1, 1, 12),  -- Turno Día en orden 1, 12 horas
   (1, 2, 2, 12);  -- Turno Noche en orden 2, 12 horas

3. En Phase 2 (Generador Automático):
   - El generador leerá esta configuración
   - Creará instancias_turno para cada día del mes
   - Distribuirá empleados equitativamente entre los turnos
   - Respetará restricciones legales (42h/semana, 182h/mes)
   - Validará rotaciones balanceadas

VALIDACIONES EN BACKEND:
========================

cantidad_empleados:
  - Mínimo 2 (al menos dos turnos deben poder rotar)
  - Múltiplo de cantidad_turnos idealmente para distribución equilibrada

horas_por_semana:
  - Colombia: 42 horas máximo
  - Se valida en POST del generador

dias_laborales_por_semana:
  - Rango 4-6 (empleado legal)

cantidad_turnos:
  - 2 para sistemas 2x12h
  - 3 para sistemas 3x8h
  - 4+ para esquemas más complejos

tipo_distribucion:
  - equilibrada: Se puede usar generador automático
  - personalizada: No dispara generador, permite edición manual

RESTRICCIONES DE BASE DE DATOS:
================================
- Cada configuración tiene nombre único por empresa
- Cada turno solo puede aparecer una vez por malla (UNIQUE)
- Las plantillas deben existir previamente
- Cascada: Borrar empresa → Borra sus configuraciones
- Cascada: Borrar plantilla → Borra referencias en mallas
*/

-- ================================================================================
-- Índices adicionales para optimizar queries comunes
-- ================================================================================
ALTER TABLE configuraciones_malla ADD INDEX idx_config_empresa_activa (empresa_id, activo);
ALTER TABLE configuraciones_malla_turnos ADD INDEX idx_config_turno_config_orden (configuracion_id, orden);
