-- Migration: 11_rename_columns.sql
-- Normaliza nombres de columnas a español y actualiza índices asociados.

SET FOREIGN_KEY_CHECKS=0;

-- 1) usuarios: email -> correo, password_hash -> contrasena
ALTER TABLE usuarios
  CHANGE COLUMN email correo VARCHAR(320) NOT NULL,
  CHANGE COLUMN password_hash contrasena CHAR(128) NOT NULL;

-- Recrear índice único por (empresa_id, correo)
DROP INDEX IF EXISTS uq_usuarios_empresa_email ON usuarios;
ALTER TABLE usuarios ADD UNIQUE KEY uq_usuarios_empresa_correo (empresa_id, correo);

-- 2) instancias_turno: inicio_timestamp/fin_timestamp -> inicio_fecha_hora/fin_fecha_hora
ALTER TABLE instancias_turno
  CHANGE COLUMN inicio_timestamp inicio_fecha_hora DATETIME NOT NULL,
  CHANGE COLUMN fin_timestamp fin_fecha_hora DATETIME NOT NULL;

-- 3) documentos_solicitud: url_storage -> url_almacenamiento
ALTER TABLE documentos_solicitud
  CHANGE COLUMN url_storage url_almacenamiento VARCHAR(2048) NOT NULL;

SET FOREIGN_KEY_CHECKS=1;

-- Nota: en caso de otras referencias al nombre antiguo en código, actualizar endpoints y consultas.
