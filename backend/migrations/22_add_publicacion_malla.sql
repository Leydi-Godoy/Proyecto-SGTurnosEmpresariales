-- Migración 22: Agregar control de publicación a configuraciones_malla
-- Permite al Planificador publicar una malla para que los empleados puedan verla y descargarla.

ALTER TABLE `configuraciones_malla`
  ADD COLUMN `publicada` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si la malla es visible para los empleados' AFTER `activo`,
  ADD COLUMN `publicada_en` TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha/hora en que se publicó la malla' AFTER `publicada`,
  ADD COLUMN `publicada_por` BIGINT(20) UNSIGNED NULL DEFAULT NULL COMMENT 'Usuario que publicó la malla' AFTER `publicada_en`;
