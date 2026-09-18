-- Migration: 07_password_reset_tokens.sql
-- Description: One-time, hashed tokens for password recovery links.

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  legacy_user_id BIGINT UNSIGNED NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_password_reset_token_hash (token_hash),
  INDEX idx_password_reset_user (user_id),
  INDEX idx_password_reset_legacy_user (legacy_user_id),
  INDEX idx_password_reset_expiration (expires_at)
);
