-- Migration: 10_add_user_name_components.sql
-- Añade columnas para nombre separado en la tabla `usuarios`.

ALTER TABLE usuarios
  ADD COLUMN primer_nombre VARCHAR(128) NULL AFTER email,
  ADD COLUMN segundo_nombre VARCHAR(128) NULL AFTER primer_nombre,
  ADD COLUMN primer_apellido VARCHAR(128) NULL AFTER segundo_nombre,
  ADD COLUMN segundo_apellido VARCHAR(128) NULL AFTER primer_apellido;

-- Copiar datos desde `nombre_completo` a las columnas nuevas cuando sea posible
UPDATE usuarios
SET
  primer_nombre = TRIM(SUBSTRING_INDEX(nombre_completo, ' ', 1)),
  primer_apellido = TRIM(SUBSTRING_INDEX(nombre_completo, ' ', -1))
WHERE nombre_completo IS NOT NULL AND (primer_nombre IS NULL OR primer_apellido IS NULL);

-- Eliminar columna `nombre_completo` ahora que los componentes existen
ALTER TABLE usuarios DROP COLUMN IF EXISTS nombre_completo;
