# 🔒 Matriz de Acceso Multi-Tenant (Resumen Visual)

## Roles y Permiso de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MATRIZ DE CONTROL DE ACCESO                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ SUPER ADMIN (super_admin) ─────────────────────────────────────────────────┐
│                                                                              │
│  ✅ TODAS las empresas                                                      │
│  ✅ TODOS los usuarios                                                      │
│  ✅ TODAS las mallas, turnos, novedades                                     │
│  ✅ Logs y auditoría completo                                               │
│  ✅ Gestión de facturación                                                  │
│                                                                              │
│  Alcance: GLOBAL (sin restricción de empresa_id)                            │
│  Usado por: Super Administrador técnico                                      │
└────────────────────────────────────────────────────────────────────────────┘

┌─ ADMIN EMPRESA (ademp2, ID=2) ──────────────────────────────────────────────┐
│                                                                              │
│  ✅ Solo su empresa                                                         │
│  ✅ Usuarios de su empresa                                                  │
│  ✅ Mallas y turnos de su empresa                                           │
│  ✅ Novedades de su empresa                                                 │
│  ✅ Reportes de su empresa                                                  │
│  ✅ Facturación de su empresa                                               │
│  ❌ Datos de OTRAS empresas                                                 │
│  ❌ Super admin features                                                    │
│                                                                              │
│  WHERE empresa_id = user.empresa_id (SIEMPRE)                               │
│  Usado por: Administrador de cada empresa                                    │
└────────────────────────────────────────────────────────────────────────────┘

┌─ PLANIFICADOR (plani3, ID=3) ───────────────────────────────────────────────┐
│                                                                              │
│  ✅ Empleados de su empresa                                                 │
│  ✅ Crear/editar mallas de su empresa                                       │
│  ✅ Asignar turnos en su empresa                                            │
│  ✅ Ver cobertura de su empresa                                             │
│  ✅ Generar reportes de su empresa                                          │
│  ❌ Datos de OTRAS empresas                                                 │
│  ❌ Ver usuarios de otra empresa                                            │
│  ❌ Editar configuración empresa                                            │
│                                                                              │
│  WHERE empresa_id = user.empresa_id (SIEMPRE)                               │
│  Usado por: Persona que arma horarios                                        │
└────────────────────────────────────────────────────────────────────────────┘

┌─ SUPERVISOR (supvi4, ID=4) ─────────────────────────────────────────────────┐
│                                                                              │
│  ✅ Empleados de su área/departamento                                       │
│  ✅ Novedades de su empresa                                                 │
│  ✅ Aprobar/rechazar solicitudes                                            │
│  ✅ Ver cobertura de su equipo                                              │
│  ✅ Reportes de su equipo                                                   │
│  ❌ Datos de OTRAS empresas                                                 │
│  ❌ Ver empleados de otra empresa                                           │
│  ❌ Crear mallas                                                            │
│  ❌ Editar config empresa                                                   │
│                                                                              │
│  WHERE empresa_id = user.empresa_id AND area_id = user.area_id              │
│  Usado por: Supervisor de área/turno                                        │
└────────────────────────────────────────────────────────────────────────────┘

┌─ EMPLEADO (emple5, ID=5) ───────────────────────────────────────────────────┐
│                                                                              │
│  ✅ Su propio perfil                                                        │
│  ✅ Sus propios turnos                                                      │
│  ✅ Sus propias novedades (solicitudes)                                     │
│  ✅ Cambiar su contraseña                                                   │
│  ❌ Datos de OTROS empleados                                                │
│  ❌ Datos de OTRA empresa                                                   │
│  ❌ Ver novedades de otros                                                  │
│  ❌ Crear mallas o turnos                                                   │
│                                                                              │
│  WHERE empleado_id = user.id (SIEMPRE)                                      │
│  Usado por: Empleado regular                                                 │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Tabla Rápida de Referencias

```
RECURSO              | Super Admin | Admin Emp | Planificador | Supervisor | Empleado
─────────────────────┼─────────────┼──────────┼──────────────┼────────────┼──────────
Ver empresas         | ✅ Todas    | ✅ Propia | ❌           | ❌         | ❌
Ver usuarios         | ✅ Todos    | ✅ Propia | ❌           | ✅ Su área | ✅ Solo sí
Ver mallas           | ✅ Todas    | ✅ Propia | ✅ Propia    | ❌         | ❌
Ver turnos           | ✅ Todos    | ✅ Propia | ✅ Propia    | ✅ Su área | ✅ Sus turnos
Ver novedades        | ✅ Todas    | ✅ Propia | ❌           | ✅ Propia  | ✅ Sus solics
Crear malla          | ❌          | ✅       | ✅           | ❌         | ❌
Asignar turno        | ❌          | ✅       | ✅           | ❌         | ❌
Aprobar novedad      | ❌          | ✅       | ❌           | ✅         | ❌
Editar config emp    | ✅          | ✅       | ❌           | ❌         | ❌
Ver logs/auditoría   | ✅ Todo     | ✅ Propia| ❌           | ❌         | ❌
```

---

## 🚨 Regla de ORO

**NUNCA hacer una query sin filtro `empresa_id` (EXCEPTO para super_admin).**

```javascript
// ❌ NUNCA - Rompe seguridad multi-tenant
SELECT * FROM turnos WHERE estado = 'activo';

// ✅ SIEMPRE - Filtra por empresa
SELECT * FROM turnos 
WHERE empresa_id = ? AND estado = 'activo';

// ✅ OK PARA SUPER ADMIN - Confía que es super_admin
SELECT * FROM turnos; // Solo si req.user.Id_rol === 'super_admin'
```

---

## 📋 Código de Ejemplo: Verificación en Middleware

```javascript
// middleware/security.js

function validateTenantAccess(req, res, next) {
  const user = req.user;
  const requestedTenant = req.query.empresa_id || req.body.empresa_id;

  // Super admin: sin restricción
  if (user.Id_rol === 'super_admin') {
    return next();
  }

  // Otros roles: deben pertenecer a esa empresa
  if (Number(requestedTenant) !== Number(user.empresa_id)) {
    return res.status(403).json({ 
      error: 'No tienes permiso para acceder a esta empresa',
      codigo: 'TENANT_VIOLATION'
    });
  }

  next();
}

// Usar en rutas:
app.get('/api/empresa/usuarios', authenticateToken, validateTenantAccess, handler);
```

---

## 🧪 Test de Seguridad: Caso Crítico

```javascript
// Scenario: Planificador de Empresa 1 intenta ver empleados de Empresa 2

const token = generateToken({
  id: 10,
  email: 'plani@empresa1.com',
  Id_rol: 'plani3',
  empresa_id: 1  // ⭐ Solo puede ver empresa 1
});

fetch('/api/planificador/empleados?empresa_id=2', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// ESPERADO: 403 Acceso denegado
// ✅ CORRECTO si recibe: { error: 'No tienes permiso para acceder a esta empresa' }
// ❌ CRÍTICO si recibe: empleados de empresa 2 (FALLA DE SEGURIDAD)
```

---

## 📝 Checklist de Deployment

Antes de cualquier deploy en producción:

- [ ] TODOS los endpoints filtran por `empresa_id` (excepto super_admin)
- [ ] Middleware `authenticateToken` añade `empresa_id` al req.user
- [ ] Tests de seguridad PASAN (no poder ver datos de otra empresa)
- [ ] Logs de auditoría registran accesos
- [ ] Base de datos tiene índices en `empresa_id`
- [ ] Super admin es el ÚNICO que puede ver `empresa_id = NULL` o todos
- [ ] Supervisor solo ve empleados de su `area_id`
- [ ] Empleado solo ve sus propios datos (`empleado_id = user.id`)

---

## ⚠️ Errores Comunes a Evitar

```javascript
// ❌ ERROR: Sin filtro empresa_id
const usuarios = await db.query('SELECT * FROM users WHERE activo = 1');

// ✅ CORRECTO: Con filtro
const usuarios = await db.query(
  'SELECT * FROM users WHERE activo = 1 AND empresa_id = ?',
  [req.user.empresa_id]
);

// ❌ ERROR: Confiar en filtro del frontend
// (El frontend puede ser burlado, el backend no)

// ✅ CORRECTO: Validar en backend SIEMPRE
if (req.user.empresa_id !== req.body.empresa_id) {
  return res.status(403).json({ error: 'Acceso denegado' });
}

// ❌ ERROR: Mostrar empresa_id en respuesta si no es super_admin
// (Expone información innecesaria)

// ✅ CORRECTO: Minimizar exposición de datos sensibles
const response = {
  id: user.id,
  nombre: user.primer_nombre,
  email: user.email,
  // NO incluir empresa_id innecesariamente
};
```

---

## 📞 Resumen para Backend Team

**PRIORIDAD:** 🔴 CRÍTICA

**Responsable:** Backend/DevOps

**Timeline:** Antes de cualquier integración con frontend

**Criterio de Aceptación:**
1. ✅ Todas las tablas tienen `empresa_id`
2. ✅ Middleware de validación implementado
3. ✅ TODOS los endpoints filtran por `empresa_id`
4. ✅ Tests de seguridad PASAN
5. ✅ Super admin accede a TODO
6. ✅ Otros roles solo ven su empresa

**Si esto NO está implementado correctamente:**
- 🔴 Los datos de Empresa A pueden filtrarse a Empresa B
- 🔴 Un Empleado puede ver datos de toda la empresa
- 🔴 Un Planificador puede sabotear mallas de otra empresa
- 🔴 Sistema NO está listo para producción

---

*Documento creado: 2026-09-15*
*Versión: 1.0*
*Estado: REQUERIDO para deploy*
