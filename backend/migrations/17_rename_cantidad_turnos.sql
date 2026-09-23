-- ============================================
-- MIGRACIÓN 17: Renombrar cantidad_turnos
-- ============================================
-- 
-- Cambio: Renombrar 'cantidad_turnos' a 'turnos_mensuales_empleado'
-- Razón: Mayor claridad en la semantica del parámetro
--        Admin define cuantos turnos hace cada empleado al mes
--
-- Fecha: 2026-09-22

-- 1️⃣ Renombrar columna
ALTER TABLE configuraciones_malla 
CHANGE COLUMN cantidad_turnos turnos_mensuales_empleado INT NOT NULL DEFAULT 20 
COMMENT 'Cantidad de turnos que hace cada empleado al mes (parámetro base)';

-- 2️⃣ Verificar que la columna existe
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'configuraciones_malla' AND COLUMN_NAME = 'turnos_mensuales_empleado';
