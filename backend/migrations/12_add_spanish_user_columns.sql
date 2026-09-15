-- Migration: 12_add_spanish_user_columns.sql
-- Purpose: Añadir columnas en español compatibles con el seed `usuarios_import.sql`
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS correo VARCHAR(320) NULL AFTER empresa_id,
  ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(255) NULL AFTER correo,
  ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(255) NULL AFTER primer_nombre,
  ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(255) NULL AFTER segundo_nombre,
  ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(255) NULL AFTER primer_apellido,
  ADD COLUMN IF NOT EXISTS contrasena CHAR(128) NULL AFTER segundo_apellido,
  ADD COLUMN IF NOT EXISTS telefono VARCHAR(30) NULL AFTER contrasena,
  ADD COLUMN IF NOT EXISTS activo TINYINT(1) NOT NULL DEFAULT 1 AFTER telefono,
  ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER activo,
  ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP AFTER creado_en;

-- Añadir índice/constraint para correo por empresa (evita duplicados al insertar seed)
ALTER TABLE usuarios
  ADD UNIQUE KEY IF NOT EXISTS uq_usuarios_empresa_correo (empresa_id, correo),
  ADD INDEX IF NOT EXISTS idx_usuarios_correo (correo);

SET FOREIGN_KEY_CHECKS = 1;

-- Notes:
-- - Esta migración expande la tabla `usuarios` para aceptar columnas usadas por `usuarios_import.sql`.
-- - No borra ni modifica las columnas existentes (`email`, `password_hash`, etc.), evitando reprocesos.
-- - Ejecutar primero en una copia de desarrollo y revisar índices duplicados.
