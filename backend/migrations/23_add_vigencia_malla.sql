-- Migración 23: Vigencia (periodo) de la malla generada
-- Permite que cada configuración de malla guarde el período exacto (fecha_inicio / fecha_fin)
-- de su última generación, para que el detalle y las vistas de empleado no mezclen
-- instancias de generaciones anteriores o de otro mes.

ALTER TABLE `configuraciones_malla`
  ADD COLUMN `fecha_inicio_vigencia` DATE NULL DEFAULT NULL COMMENT 'Fecha de inicio del período generado actualmente' AFTER `publicada_por`,
  ADD COLUMN `fecha_fin_vigencia` DATE NULL DEFAULT NULL COMMENT 'Fecha de fin del período generado actualmente' AFTER `fecha_inicio_vigencia`;
