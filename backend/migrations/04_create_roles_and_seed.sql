-- Migration: 04_create_roles_and_seed.sql
-- Create `roles` table with scope and permissions (JSON) and seed initial roles.
-- Usage: adjust @company_id and run against your SGTurnos database.

SET @company_id = 1; -- change to your company id; keep for seeds below

-- Create roles table (if not exists)
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  company_id BIGINT UNSIGNED NULL,
  `key` VARCHAR(100) NOT NULL,
  name VARCHAR(150) NOT NULL,
  scope ENUM('global','company','site','area') NOT NULL DEFAULT 'company',
  permissions JSON NULL,
  is_builtin TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_key (company_id, `key`),
  INDEX idx_roles_company (company_id),
  CONSTRAINT fk_roles_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Note: company_id NULL denotes a global role. Ensure you don't insert duplicate global `key` values.

-- Seed global roles (super admin, migration admin)
INSERT INTO roles (company_id, `key`, name, scope, permissions, is_builtin, created_at, updated_at)
VALUES
  (NULL, 'super_admin', 'Administrador (Superadmin)', 'global',
    JSON_ARRAY('manage_companies','manage_users','manage_roles','manage_billing','view_audit_logs','manage_system_settings','manage_integrations'),
    1, NOW(), NOW()),
  (NULL, 'migration_admin', 'Migration Admin (temporal)', 'global',
    JSON_ARRAY('manage_users','migrate_passwords','manage_roles','view_audit_logs'),
    1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  permissions = VALUES(permissions),
  updated_at = NOW();

-- Seed company-scoped roles (minimal flow + fine-grained permissions)
-- Prioridad inicial: Empleado, Planificador, Supervisor, Administrador de Empresa
INSERT INTO roles (company_id, `key`, name, scope, permissions, is_builtin, created_at, updated_at)
VALUES
  (@company_id, 'employee', 'Empleado', 'company',
    JSON_ARRAY('view_own_schedule','request_swap','request_leave','self_manage_availability'),
    1, NOW(), NOW()),
  (@company_id, 'planner', 'Planificador / Scheduler', 'company',
    JSON_ARRAY('create_schedule','edit_schedule','publish_schedule','assign_shifts','view_coverage','export_schedule'),
    1, NOW(), NOW()),
  (@company_id, 'supervisor', 'Supervisor / Aprobador', 'company',
    JSON_ARRAY('approve_requests','request_coverage','view_team_schedule','approve_shift_changes'),
    1, NOW(), NOW()),
  (@company_id, 'company_admin', 'Administrador de Empresa', 'company',
    JSON_ARRAY('manage_users','manage_company_settings','view_reports','manage_roles','manage_billing'),
    1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  permissions = VALUES(permissions),
  updated_at = NOW();

-- Quick check: list roles for the company and global ones
SELECT id, company_id, `key`, name, scope, is_builtin, permissions FROM roles
WHERE company_id = @company_id OR company_id IS NULL
ORDER BY company_id IS NULL, name;

-- End of migration
