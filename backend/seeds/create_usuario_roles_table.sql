-- Crea la tabla usuario_roles si no existe
-- Ejecutar en phpMyAdmin sobre la base `sgturnos_empresas` antes de sincronizar roles.

CREATE TABLE IF NOT EXISTS usuario_roles (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT(20) UNSIGNED NOT NULL,
  rol_id BIGINT(20) UNSIGNED NOT NULL,
  alcance VARCHAR(32) NOT NULL DEFAULT 'empresa',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_rol_alcance (usuario_id, rol_id, alcance),
  KEY idx_usuario_roles_usuario (usuario_id),
  KEY idx_usuario_roles_rol (rol_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Después de crear la tabla, ejecutar:
-- 1) backend/seeds/usuario_roles_sync.sql
-- 2) verificaciones sugeridas al final del archivo sync
