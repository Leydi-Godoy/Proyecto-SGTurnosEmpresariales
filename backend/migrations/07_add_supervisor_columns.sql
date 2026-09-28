-- Migration: 07_add_supervisor_columns.sql
-- Description: Add columns for supervisor approval tracking

ALTER TABLE solicitudes_novedad
ADD COLUMN motivo_rechazo TEXT NULL AFTER estado,
ADD COLUMN revisado_en TIMESTAMP NULL AFTER motivo_rechazo,
ADD COLUMN revisado_por BIGINT(20) UNSIGNED NULL AFTER revisado_en;

-- Opcional: Add foreign key constraint
ALTER TABLE solicitudes_novedad
ADD CONSTRAINT fk_solicitudes_revisado_por 
FOREIGN KEY (revisado_por) REFERENCES usuarios(id) ON DELETE SET NULL;
