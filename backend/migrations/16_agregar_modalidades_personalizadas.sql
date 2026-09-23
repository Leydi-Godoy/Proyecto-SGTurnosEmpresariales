-- Migración 16: Agregar soporte para modalidades personalizadas en plantillas_turno
-- ================================================================================
-- Extiende la tabla plantillas_turno para soportar patrones rotativos complejos
-- Sin crear tablas adicionales

-- Agregar columnas a plantillas_turno
ALTER TABLE plantillas_turno 
ADD COLUMN es_personalizada TINYINT(1) DEFAULT 0 COMMENT 'Si es 1, es una modalidad personalizada con patrón rotativo',
ADD COLUMN patron_rotativo JSON DEFAULT NULL COMMENT 'Patrón de rotación en formato JSON para modalidades personalizadas';

-- Índice para búsquedas por personalización
ALTER TABLE plantillas_turno 
ADD INDEX idx_personalizada (es_personalizada);

-- Actualizar modalidades existentes como no personalizadas
UPDATE plantillas_turno SET es_personalizada = 0 WHERE es_personalizada IS NULL;

-- Ejemplo de patrón rotativo en JSON (para referencia):
-- [
--   { "dia": 1, "tipo": "12D", "horas": 12, "descripcion": "12 horas día" },
--   { "dia": 2, "tipo": "12D", "horas": 12, "descripcion": "12 horas día" },
--   { "dia": 3, "tipo": "DESC", "horas": 0, "descripcion": "Descanso" },
--   { "dia": 4, "tipo": "12N", "horas": 12, "descripcion": "12 horas noche" },
--   { "dia": 5, "tipo": "DESC", "horas": 0, "descripcion": "Descanso" },
--   { "dia": 6, "tipo": "DESC", "horas": 0, "descripcion": "Descanso" },
--   { "dia": 7, "tipo": "12N", "horas": 12, "descripcion": "12 horas noche" }
-- ]
