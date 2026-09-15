# 🔒 Especificación de Seguridad Multi-Tenant

**Documento para Backend Team**

Fecha: 2026-09-15
Criticidad: 🔴 ALTA - Implementar antes de cualquier integración

---

## 📋 Tabla de Acceso por Rol

| Rol | Código | ID | Alcance | Datos Visibles |
|-----|--------|-------|---------|-----------------|
| **Super Admin** | `super_admin` | - | Global | ✅ TODAS las empresas, usuarios, mallas, turnos, novedades, configuración |
| **Admin Empresa** | `ademp2` | 2 | Empresa | ✅ Solo su empresa: usuarios, mallas, turnos, novedades, reportes, facturación |
| **Planificador** | `plani3` | 3 | Empresa | ✅ Solo su empresa: empleados, mallas, turnos, asignaciones, reportes |
| **Supervisor** | `supvi4` | 4 | Empresa | ✅ Solo su empresa: empleados de su área, novedades, aprobaciones |
| **Empleado** | `emple5` | 5 | Empresa | ✅ Solo su empresa: sus turnos, sus novedades, su perfil |

---

## 🚨 Regla Principal de Seguridad

**TODA query debe incluir filtro por `empresa_id` del usuario logueado, EXCEPTO para Super Admin.**

### Pseudocódigo de Validación:

```javascript
// En CADA endpoint protegido (después de autenticar)
async function validateTenantAccess(req, res, next) {
  const user = req.user; // Del JWT token
  const empresa_id = req.query.empresa_id || req.body.empresa_id;
  
  // Super Admin: acceso total
  if (user.Id_rol === 'super_admin') {
    return next(); // Permite acceso sin filtro
  }
  
  // Otros roles: valida que pertenezcan a esa empresa
  if (user.empresa_id !== empresa_id) {
    return res.status(403).json({ 
      error: 'Acceso denegado. No tienes permiso en esta empresa.' 
    });
  }
  
  next();
}
```

---

## 📌 Endpoints por Rol

### 🔵 SUPER ADMIN (super_admin)

**Acceso sin restricción de empresa:**

```
GET    /api/admin/empresas - Listar todas las empresas
POST   /api/admin/empresas - Crear empresa
PUT    /api/admin/empresas/:id - Editar empresa
DELETE /api/admin/empresas/:id - Eliminar empresa

GET    /api/admin/usuarios - Listar TODOS los usuarios de TODAS las empresas
POST   /api/admin/usuarios - Crear usuario en cualquier empresa
PUT    /api/admin/usuarios/:id - Editar cualquier usuario
DELETE /api/admin/usuarios/:id - Eliminar usuario

GET    /api/admin/roles - Listar todos los roles
POST   /api/admin/roles - Crear roles
PUT    /api/admin/roles/:id - Editar roles

GET    /api/admin/logs - Ver logs de auditoría de TODO el sistema
POST   /api/admin/backups - Crear backups
```

**Validación en BD:**
```sql
SELECT * FROM users; -- Sin WHERE empresa_id
SELECT * FROM empresas; -- Todo
SELECT * FROM usuarios_logs; -- Todo
```

---

### 🟢 ADMIN EMPRESA (ademp2)

**Acceso SOLO a su empresa:**

```
GET    /api/empresa/configuracion - Solo su empresa
PUT    /api/empresa/configuracion - Editar config de su empresa

GET    /api/empresa/usuarios - Usuarios de su empresa
POST   /api/empresa/usuarios - Crear usuario en su empresa
PUT    /api/empresa/usuarios/:id - Editar usuario de su empresa
DELETE /api/empresa/usuarios/:id - Eliminar usuario de su empresa

GET    /api/empresa/mallas - Mallas de su empresa
GET    /api/empresa/turnos - Turnos de su empresa
GET    /api/empresa/novedades - Novedades de su empresa

GET    /api/empresa/reportes - Reportes de su empresa
GET    /api/empresa/facturacion - Facturación de su empresa
```

**Validación en BD:**
```sql
SELECT * FROM users 
WHERE empresa_id = :user_empresa_id;

SELECT * FROM mallas 
WHERE empresa_id = :user_empresa_id;
```

**Validación en código:**
```javascript
// En CADA endpoint de admin empresa
const { empresa_id } = req.query;
if (req.user.empresa_id !== empresa_id) {
  return res.status(403).json({ error: 'Acceso denegado' });
}
```

---

### 🟠 PLANIFICADOR (plani3)

**Acceso SOLO a empleados y mallas de su empresa:**

```
GET    /api/planificador/empleados - Empleados de su empresa SOLO
GET    /api/planificador/areas - Áreas de su empresa SOLO
GET    /api/planificador/especialidades - Especialidades de su empresa SOLO

GET    /api/planificador/mallas - Mallas de su empresa SOLO
POST   /api/planificador/mallas - Crear malla en su empresa
PUT    /api/planificador/mallas/:id - Editar malla de su empresa
DELETE /api/planificador/mallas/:id - Eliminar malla de su empresa
POST   /api/planificador/mallas/:id/publish - Publicar malla de su empresa

GET    /api/planificador/turnos - Turnos de su empresa SOLO
POST   /api/planificador/turnos/asignar - Asignar en su empresa
DELETE /api/planificador/turnos/:id - Desasignar en su empresa

GET    /api/planificador/cobertura - Cobertura de su empresa
GET    /api/planificador/reportes - Reportes de su empresa
```

**Validación en BD:**
```sql
-- Empleados de su empresa
SELECT * FROM users 
WHERE empresa_id = :user_empresa_id 
AND activo = 1;

-- Mallas de su empresa
SELECT * FROM mallas 
WHERE empresa_id = :user_empresa_id;

-- Turnos de su empresa
SELECT * FROM turnos 
WHERE empresa_id = :user_empresa_id;
```

**Validación en código:**
```javascript
app.get('/api/planificador/empleados', authenticateToken, async (req, res) => {
  // 1. Verificar que es planificador
  if (req.user.Id_rol !== 'plani3') {
    return res.status(403).json({ error: 'Solo planificadores' });
  }
  
  // 2. Filtrar por empresa del usuario
  const empleados = await db.query(
    `SELECT * FROM users 
     WHERE empresa_id = ? AND activo = 1 AND Id_rol IN ('emple5', 'supvi4')
     ORDER BY primer_apellido ASC`,
    [req.user.empresa_id]
  );
  
  res.json(empleados);
});
```

---

### 🟡 SUPERVISOR (supvi4)

**Acceso SOLO a empleados de su área y novedades de su empresa:**

```
GET    /api/supervisor/empleados - Empleados de su área/departamento
GET    /api/supervisor/novedades - Novedades de su empresa
POST   /api/supervisor/novedades/:id/aprobar - Aprobar novedades
POST   /api/supervisor/novedades/:id/rechazar - Rechazar novedades
GET    /api/supervisor/reportes - Reportes de su equipo
GET    /api/supervisor/cobertura - Cobertura de su equipo
```

**Validación en BD:**
```sql
-- Novedades de su empresa
SELECT * FROM novedades 
WHERE empresa_id = :user_empresa_id
ORDER BY created_at DESC;

-- Empleados de su área
SELECT * FROM users 
WHERE empresa_id = :user_empresa_id 
AND area_id = :user_area_id;
```

**Validación en código:**
```javascript
app.get('/api/supervisor/novedades', authenticateToken, async (req, res) => {
  // Verificar rol
  if (req.user.Id_rol !== 'supvi4') {
    return res.status(403).json({ error: 'Solo supervisores' });
  }
  
  // Filtrar por empresa
  const novedades = await db.query(
    `SELECT * FROM novedades 
     WHERE empresa_id = ? 
     ORDER BY created_at DESC`,
    [req.user.empresa_id]
  );
  
  res.json(novedades);
});
```

---

### 🔵 EMPLEADO (emple5)

**Acceso SOLO a sus propios datos:**

```
GET    /api/empleado/perfil - Solo su perfil
PUT    /api/empleado/perfil - Editar solo su perfil
POST   /api/empleado/cambiar-password - Cambiar su contraseña

GET    /api/empleado/turnos - Solo sus turnos
GET    /api/empleado/novedades - Solo sus novedades
POST   /api/empleado/novedades - Crear novedades propias
```

**Validación en BD:**
```sql
-- Solo sus turnos
SELECT * FROM turnos 
WHERE empleado_id = :user_id 
AND empresa_id = :user_empresa_id;

-- Solo sus novedades
SELECT * FROM novedades 
WHERE empleado_id = :user_id;
```

**Validación en código:**
```javascript
app.get('/api/empleado/turnos', authenticateToken, async (req, res) => {
  // Solo ve sus turnos
  const turnos = await db.query(
    `SELECT * FROM turnos 
     WHERE empleado_id = ? AND empresa_id = ?
     ORDER BY fecha DESC`,
    [req.user.id, req.user.empresa_id]
  );
  
  res.json(turnos);
});
```

---

## 🗄️ Cambios Requeridos en BD

### 1. Verificar que todas las tablas tengan `empresa_id`:

```sql
-- Usuarios
ALTER TABLE users ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE users ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id);

-- Mallas
ALTER TABLE mallas ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE mallas ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id);

-- Turnos
ALTER TABLE turnos ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE turnos ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id);

-- Novedades
ALTER TABLE novedades ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE novedades ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id);
```

### 2. Crear índices para performance:

```sql
CREATE INDEX idx_users_empresa ON users(empresa_id);
CREATE INDEX idx_mallas_empresa ON mallas(empresa_id);
CREATE INDEX idx_turnos_empresa ON turnos(empresa_id);
CREATE INDEX idx_novedades_empresa ON novedades(empresa_id);
```

### 3. Agregar índices compuestos:

```sql
CREATE INDEX idx_turnos_empresa_empleado ON turnos(empresa_id, empleado_id);
CREATE INDEX idx_novedades_empresa_empleado ON novedades(empresa_id, empleado_id);
CREATE INDEX idx_users_empresa_activo ON users(empresa_id, activo);
```

---

## 🔐 Middleware de Autenticación

**Crear en `backend/middleware/auth.js`:**

```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    // Adjuntar usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      Id_rol: user.Id_rol,
      empresa_id: user.empresa_id, // ⭐ CRÍTICO para multi-tenant
      primer_nombre: user.primer_nombre,
    };

    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.Id_rol)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Requerido: ${roles.join(', ')}` 
      });
    }
    next();
  };
}

function requireTenant(req, res, next) {
  const empresa_id = req.query.empresa_id || req.body.empresa_id;

  // Super admin no necesita validar
  if (req.user.Id_rol === 'super_admin') {
    return next();
  }

  // Otros roles: validar que pertenecen a esa empresa
  if (req.user.empresa_id !== Number(empresa_id)) {
    return res.status(403).json({ 
      error: 'Acceso denegado a esta empresa' 
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireRole,
  requireTenant,
};
```

---

## 💻 Ejemplo de Uso en Rutas

```javascript
const { authenticateToken, requireRole, requireTenant } = require('./middleware/auth');

// Ruta para Admin Empresa
app.get('/api/empresa/usuarios', authenticateToken, requireRole('ademp2'), async (req, res) => {
  const empresa_id = req.user.empresa_id;

  const usuarios = await db.query(
    'SELECT * FROM users WHERE empresa_id = ?',
    [empresa_id]
  );

  res.json(usuarios);
});

// Ruta para Planificador
app.get('/api/planificador/empleados', authenticateToken, requireRole('plani3'), async (req, res) => {
  const empleados = await db.query(
    'SELECT * FROM users WHERE empresa_id = ? AND activo = 1',
    [req.user.empresa_id]
  );

  res.json(empleados);
});

// Ruta para Super Admin (sin filtro)
app.get('/api/admin/usuarios', authenticateToken, requireRole('super_admin'), async (req, res) => {
  const usuarios = await db.query(
    'SELECT * FROM users ORDER BY id'
    // ⚠️ NO hay filtro empresa_id
  );

  res.json(usuarios);
});
```

---

## ✅ Checklist de Implementación

- [ ] Agregar `empresa_id` a todas las tablas
- [ ] Crear índices por `empresa_id`
- [ ] Implementar middleware `authenticateToken`
- [ ] Implementar middleware `requireRole`
- [ ] Implementar middleware `requireTenant`
- [ ] Filtrar TODOS los endpoints por `empresa_id` (excepto super_admin)
- [ ] Tests de seguridad:
  - [ ] Usuario A NO puede ver datos de Empresa B
  - [ ] Planificador NO puede ver empleados de otra empresa
  - [ ] Supervisor NO puede aprobar novedades de otra empresa
  - [ ] Super Admin PUEDE ver todo
- [ ] Logs de auditoría: qué usuario accedió a qué

---

## 🧪 Tests de Seguridad Obligatorios

```javascript
// Test 1: Planificador A intenta ver empleados de Empresa B
fetch('/api/planificador/empleados?empresa_id=2', {
  headers: { 'Authorization': 'Bearer token_planificador_empresa_1' }
})
// Resultado esperado: 403 Acceso denegado ❌

// Test 2: Super Admin ve todas las empresas
fetch('/api/admin/usuarios', {
  headers: { 'Authorization': 'Bearer token_super_admin' }
})
// Resultado esperado: 200 + todos los usuarios ✅

// Test 3: Empleado intenta acceder a /api/admin/usuarios
fetch('/api/admin/usuarios', {
  headers: { 'Authorization': 'Bearer token_empleado' }
})
// Resultado esperado: 403 Solo super_admin ❌
```

---

## 📞 Contacto / Dudas

Para el backend team: Si tienen dudas sobre la implementación, preguntar por:
- Validación de `empresa_id` en middleware
- Filtrado correcto en queries
- Tests de seguridad multi-tenant

**Este documento es CRÍTICO para la seguridad del sistema. Revisar antes de cualquier deploy.**
