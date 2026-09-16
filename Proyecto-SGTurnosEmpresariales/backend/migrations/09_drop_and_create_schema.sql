-- Migration: 09_drop_and_create_schema.sql
-- Description: Script para entornos de desarrollo que borra tablas existentes y crea el esquema desde cero.

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables (orden: dependencias primero)
DROP TABLE IF EXISTS documentos_solicitud;
DROP TABLE IF EXISTS aprobaciones;
DROP TABLE IF EXISTS asignaciones_turno;
DROP TABLE IF EXISTS disponibilidad;
DROP TABLE IF EXISTS instancias_turno;
DROP TABLE IF EXISTS plantillas_turno;
DROP TABLE IF EXISTS solicitudes_novedad;
DROP TABLE IF EXISTS empleados;
DROP TABLE IF EXISTS especialidades;
DROP TABLE IF EXISTS usuario_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS registros_auditoria;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS sedes;
DROP TABLE IF EXISTS empresas;
DROP TABLE IF EXISTS planes;

-- Recreate schema (copiado del esquema inicial)

-- 1. empresas
CREATE TABLE IF NOT EXISTS empresas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  zona_horaria VARCHAR(64) DEFAULT 'UTC',
  plan_id BIGINT UNSIGNED DEFAULT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_empresas_plan (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. planes
CREATE TABLE IF NOT EXISTS planes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(128) NOT NULL,
  caracteristicas JSON NULL,
  precio DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_planes_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(320) NOT NULL,
  password_hash CHAR(128) NOT NULL,
  nombre_completo VARCHAR(255) NULL,
  telefono VARCHAR(30) NULL,
  esta_activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_empresa_email (empresa_id, email),
  INDEX idx_usuarios_empresa (empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. roles
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(64) NOT NULL,
  descripcion TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. usuario_roles
CREATE TABLE IF NOT EXISTS usuario_roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  rol_id BIGINT UNSIGNED NOT NULL,
  alcance VARCHAR(32) NOT NULL DEFAULT 'empresa', -- valores: global, empresa, equipo
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_rol_alcance (usuario_id, rol_id, alcance),
  INDEX idx_usuario_roles_usuario (usuario_id),
  INDEX idx_usuario_roles_rol (rol_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. especialidades
CREATE TABLE IF NOT EXISTS especialidades (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(128) NOT NULL,
  descripcion TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_especialidades_empresa_codigo (empresa_id, codigo),
  INDEX idx_especialidades_empresa (empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. empleados
CREATE TABLE IF NOT EXISTS empleados (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NULL,
  empresa_id BIGINT UNSIGNED NOT NULL,
  codigo_empleado VARCHAR(64) NULL,
  especialidad_id BIGINT UNSIGNED NULL,
  equipo_id BIGINT UNSIGNED NULL,
  fecha_ingreso DATE NULL,
  estado VARCHAR(32) NOT NULL DEFAULT 'activo',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_empleados_empresa_codigo (empresa_id, codigo_empleado),
  INDEX idx_empleados_usuario (usuario_id),
  INDEX idx_empleados_empresa (empresa_id),
  INDEX idx_empleados_especialidad (especialidad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. sedes
CREATE TABLE IF NOT EXISTS sedes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  direccion VARCHAR(512) NULL,
  zona_horaria VARCHAR(64) DEFAULT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_sedes_empresa (empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. plantillas_turno
CREATE TABLE IF NOT EXISTS plantillas_turno (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  duracion_minutos INT UNSIGNED NOT NULL,
  es_nocturno TINYINT(1) NOT NULL DEFAULT 0,
  patron_recurrencia VARCHAR(128) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_plantillas_empresa (empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. instancias_turno
CREATE TABLE IF NOT EXISTS instancias_turno (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  plantilla_id BIGINT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  inicio_timestamp DATETIME NOT NULL,
  fin_timestamp DATETIME NOT NULL,
  sede_id BIGINT UNSIGNED NULL,
  creado_por BIGINT UNSIGNED NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_instancias_plantilla (plantilla_id),
  INDEX idx_instancias_fecha (fecha),
  INDEX idx_instancias_sede (sede_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. asignaciones_turno
CREATE TABLE IF NOT EXISTS asignaciones_turno (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  instancia_turno_id BIGINT UNSIGNED NOT NULL,
  empleado_id BIGINT UNSIGNED NOT NULL,
  asignado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  asignado_por BIGINT UNSIGNED NULL,
  estado VARCHAR(32) NOT NULL DEFAULT 'pendiente', -- confirmado/pendiente/rechazado
  PRIMARY KEY (id),
  UNIQUE KEY uq_asignacion_instancia_empleado (instancia_turno_id, empleado_id),
  INDEX idx_asignaciones_instancia (instancia_turno_id),
  INDEX idx_asignaciones_empleado (empleado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. disponibilidad
CREATE TABLE IF NOT EXISTS disponibilidad (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empleado_id BIGINT UNSIGNED NOT NULL,
  dia_semana TINYINT UNSIGNED NOT NULL, -- 0=domingo..6=sabado
  desde_hora TIME NOT NULL,
  hasta_hora TIME NOT NULL,
  nota TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_disponibilidad_empleado (empleado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. solicitudes_novedad
CREATE TABLE IF NOT EXISTS solicitudes_novedad (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empleado_id BIGINT UNSIGNED NOT NULL,
  empresa_id BIGINT UNSIGNED NOT NULL,
  tipo VARCHAR(64) NOT NULL, -- vacaciones, permiso, incapacidad, cambio_turno
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  motivo TEXT NULL,
  estado VARCHAR(32) NOT NULL DEFAULT 'pendiente',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_solicitudes_empleado (empleado_id),
  INDEX idx_solicitudes_empresa (empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. aprobaciones
CREATE TABLE IF NOT EXISTS aprobaciones (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  solicitud_id BIGINT UNSIGNED NOT NULL,
  aprobador_id BIGINT UNSIGNED NULL,
  decision VARCHAR(16) NOT NULL, -- aprobado/rechazado
  comentario TEXT NULL,
  decidido_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_aprobaciones_solicitud (solicitud_id),
  INDEX idx_aprobaciones_aprobador (aprobador_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NULL,
  usuario_id BIGINT UNSIGNED NULL,
  canal VARCHAR(16) NOT NULL, -- email/sms/push
  carga JSON NULL,
  enviado_en TIMESTAMP NULL DEFAULT NULL,
  estado_envio VARCHAR(32) NOT NULL DEFAULT 'pendiente',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_notif_empresa (empresa_id),
  INDEX idx_notif_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. registros_auditoria
CREATE TABLE IF NOT EXISTS registros_auditoria (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NULL,
  usuario_id BIGINT UNSIGNED NULL,
  accion VARCHAR(128) NOT NULL,
  tabla_objetivo VARCHAR(128) NULL,
  id_objetivo BIGINT UNSIGNED NULL,
  detalles JSON NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_auditoria_empresa (empresa_id),
  INDEX idx_auditoria_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. documentos_solicitud
CREATE TABLE IF NOT EXISTS documentos_solicitud (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  solicitud_id BIGINT UNSIGNED NOT NULL,
  empresa_id BIGINT UNSIGNED NOT NULL,
  nombre_archivo VARCHAR(512) NOT NULL,
  url_storage VARCHAR(2048) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_documentos_solicitud (solicitud_id),
  INDEX idx_documentos_empresa (empresa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --- Foreign keys (added after all tables created) ---
ALTER TABLE empresas
  ADD CONSTRAINT fk_empresas_plan FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE usuarios
  ADD CONSTRAINT fk_usuarios_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE usuario_roles
  ADD CONSTRAINT fk_usuario_roles_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_usuario_roles_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE especialidades
  ADD CONSTRAINT fk_especialidades_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE empleados
  ADD CONSTRAINT fk_empleados_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_empleados_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_empleados_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE sedes
  ADD CONSTRAINT fk_sedes_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE plantillas_turno
  ADD CONSTRAINT fk_plantillas_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE instancias_turno
  ADD CONSTRAINT fk_instancias_plantilla FOREIGN KEY (plantilla_id) REFERENCES plantillas_turno(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_instancias_sede FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_instancias_creado_por FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE asignaciones_turno
  ADD CONSTRAINT fk_asignaciones_instancia FOREIGN KEY (instancia_turno_id) REFERENCES instancias_turno(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_asignaciones_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_asignaciones_asignado_por FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE disponibilidad
  ADD CONSTRAINT fk_disponibilidad_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE solicitudes_novedad
  ADD CONSTRAINT fk_solicitudes_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_solicitudes_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE aprobaciones
  ADD CONSTRAINT fk_aprobaciones_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes_novedad(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_aprobaciones_aprobador FOREIGN KEY (aprobador_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE documentos_solicitud
  ADD CONSTRAINT fk_documentos_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes_novedad(id) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_documentos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE notificaciones
  ADD CONSTRAINT fk_notificaciones_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE registros_auditoria
  ADD CONSTRAINT fk_auditoria_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

-- End of drop-and-create script
