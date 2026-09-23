-- Migration 14: Crear tabla tokens_restablecimiento_contraseña
-- Propósito: Guardar tokens para restablecimiento de contraseñas

CREATE TABLE IF NOT EXISTS tokens_restablecimiento_contraseña (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT DEFAULT NULL,
  usuario_id_legado INT DEFAULT NULL,
  hash_token VARCHAR(64) NOT NULL UNIQUE,
  expira_en TIMESTAMP NOT NULL,
  utilizado_en TIMESTAMP NULL DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices para búsqueda rápida
  INDEX idx_hash_token (hash_token),
  INDEX idx_expira_en (expira_en),
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_usuario_id_legado (usuario_id_legado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
