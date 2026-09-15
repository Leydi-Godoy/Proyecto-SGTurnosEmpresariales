-- Migration: 13_normalize_existing_schema.sql
-- Purpose: Normalizar nombres de tablas y columnas legacy (seguro, condicional)
SET FOREIGN_KEY_CHECKS = 0;

-- Rename legacy singular tables to plural if they exist
SELECT COUNT(*) INTO @cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'departamento';
SET @sql = IF(@cnt>0, 'RENAME TABLE departamento TO departamentos;', 'SELECT "no_departamento";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'rol';
SET @sql = IF(@cnt>0, 'RENAME TABLE rol TO roles;', 'SELECT "no_rol";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'usuario';
SET @sql = IF(@cnt>0, 'RENAME TABLE usuario TO usuarios;', 'SELECT "no_usuario";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure `usuarios` has both email and correo-compatible columns
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'email';
SELECT COUNT(*) INTO @col_correo FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'correo';
IF @col_exists = 0 AND @col_correo > 0 THEN
  SET @sql = 'ALTER TABLE usuarios ADD COLUMN email VARCHAR(320) NULL;';
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  SET @sql = 'UPDATE usuarios SET email = correo WHERE correo IS NOT NULL;';
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END IF;

-- Ensure `usuarios` has `password_hash` and populate from `contrasena` if needed
SELECT COUNT(*) INTO @col_ph FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'password_hash';
SELECT COUNT(*) INTO @col_con FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'contrasena';
IF @col_ph = 0 AND @col_con > 0 THEN
  SET @sql = 'ALTER TABLE usuarios ADD COLUMN password_hash CHAR(128) NULL;';
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  SET @sql = 'UPDATE usuarios SET password_hash = contrasena WHERE contrasena IS NOT NULL;';
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END IF;

-- Ensure active flag naming: `esta_activo` or `activo` coexistence
SELECT COUNT(*) INTO @col_esta FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'esta_activo';
SELECT COUNT(*) INTO @col_act FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'activo';
IF @col_esta = 0 AND @col_act > 0 THEN
  SET @sql = 'ALTER TABLE usuarios ADD COLUMN esta_activo TINYINT(1) NOT NULL DEFAULT 1;';
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  SET @sql = 'UPDATE usuarios SET esta_activo = activo;';
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END IF;

-- Add missing timestamps if not present
SELECT COUNT(*) INTO @col_created FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'creado_en';
IF @col_created = 0 THEN
  SET @sql = 'ALTER TABLE usuarios ADD COLUMN creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;';
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END IF;
SELECT COUNT(*) INTO @col_updated FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'actualizado_en';
IF @col_updated = 0 THEN
  SET @sql = 'ALTER TABLE usuarios ADD COLUMN actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;';
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END IF;

-- Ensure unique constraint on (empresa_id, email)
SELECT COUNT(*) INTO @idx_cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND index_name = 'uq_usuarios_empresa_email';
IF @idx_cnt = 0 THEN
  SET @sql = 'ALTER TABLE usuarios ADD UNIQUE KEY uq_usuarios_empresa_email (empresa_id, email);';
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END IF;

-- Ensure foreign key fk_usuarios_empresa exists
SELECT COUNT(*) INTO @fk_cnt FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'fk_usuarios_empresa';
IF @fk_cnt = 0 THEN
  SET @sql = 'ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE ON UPDATE CASCADE;';
  PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
END IF;

SET FOREIGN_KEY_CHECKS = 1;

-- End of normalization migration
