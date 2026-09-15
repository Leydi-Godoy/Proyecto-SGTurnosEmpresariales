# SGTurnos Empresariales - Backend API Plan

## Database Schema Summary

### Core Tables

**1. `roles` (5 fixed roles)**
- id, nombre, descripcion, codigo, creado_en
- Values: Super Admin (1), Admin Empresa (2), Planificador (3), Supervisor (4), Empleado (5)

**2. `empresas` (8 companies)**
- id, nombre, zona_horaria, plan_id, creado_en, actualizado_en

**3. `usuarios` (65 users)**
- id, correo, contrasena, primer_nombre, primer_apellido, usuario_roles
- Junction: usuario_roles (usuario_id, rol_id, empresa_id)

**4. `empleados` (41 employees)**
- id, usuario_id, empresa_id, codigo_empleado, especialidad_id, equipo_id, fecha_ingreso, estado, creado_en

**5. `especialidades` (8 job specialties)**
- id, empresa_id, codigo, nombre, descripcion, creado_en
- Examples: Medicina General, Vigilancia, Call Center, Recepción, Limpieza, Mantenimiento, etc.

**6. `sedes` (8+ office locations)**
- id, empresa_id, nombre, direccion, zona_horaria, creado_en

### Turnos/Mallas System

**7. `plantillas_turno` (Shift Templates)**
- id, empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, es_nocturno, patron_recurrencia, creado_en
- Purpose: Define reusable shift templates (e.g., "Vigilancia Diurna: 8:00-16:00")

**8. `instancias_turno` (Actual Shift Instances)**
- id, plantilla_id, fecha, inicio_fecha_hora, fin_fecha_hora, sede_id, creado_por, creado_en
- Purpose: Specific shift occurrence created from template (e.g., "Vigilancia on 2026-09-20")
- Created by: Planificador (role 3)

**9. `asignaciones_turno` (Employee-to-Shift Assignments)**
- id, instancia_turno_id, empleado_id, asignado_en, asignado_por, estado, creado_en
- Purpose: Assigns specific employees to specific shift instances
- Status values: 'pendiente', 'asignado', 'confirmado', 'rechazado', 'cambio_solicitado'
- Assigned by: Planificador or Supervisor

### Supporting Tables

**10. `disponibilidad` (Employee Availability)**
- id, empleado_id, dia_semana, desde_hora, hasta_hora, nota, creado_en

**11. `notificaciones` (System Notifications)**
- id, empresa_id, usuario_id, canal, carga, enviado_en, estado_envio, creado_en

**12. `registros_auditoria` (Audit Logs)**
- id, empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles, creado_en

**13. `aprobaciones` (Request Approvals)**
- id, solicitud_id, aprobador_id, decision, comentario, decidido_en

**14. `documentos_solicitud` (Request Documents)**
- id, solicitud_id, empresa_id, nombre_archivo, url_almacenamiento, creado_en

---

## API Endpoints - Priority Order

### PHASE 1: Turnos Core System (CRITICAL PATH)

#### 1.1 Create Shift Instance
```
POST /api/turnos
Authentication: JWT (Planificador role)
Body:
{
  "plantilla_id": 1,
  "fecha": "2026-09-20",
  "inicio_fecha_hora": "2026-09-20T08:00:00",
  "fin_fecha_hora": "2026-09-20T16:00:00",
  "sede_id": 1
}
Response:
{
  "id": 123,
  "plantilla_id": 1,
  "fecha": "2026-09-20",
  "inicio_fecha_hora": "2026-09-20T08:00:00",
  "fin_fecha_hora": "2026-09-20T16:00:00",
  "sede_id": 1,
  "creado_por": [user_id],
  "creado_en": "2026-09-15T14:30:00Z",
  "disponibilidad": 5  // num of available employees
}
```

#### 1.2 List Shift Instances
```
GET /api/turnos?empresa_id=1&fecha_desde=2026-09-20&fecha_hasta=2026-09-30&estado=activo
Authentication: JWT
Response:
[
  {
    "id": 123,
    "plantilla_id": 1,
    "plantilla_nombre": "Vigilancia Diurna",
    "fecha": "2026-09-20",
    "inicio_fecha_hora": "2026-09-20T08:00:00",
    "fin_fecha_hora": "2026-09-20T16:00:00",
    "sede_id": 1,
    "sede_nombre": "Sede Central",
    "creado_por": 12345,
    "creado_en": "2026-09-15T14:30:00Z",
    "asignaciones_confirmadas": 3,
    "asignaciones_totales": 5,
    "estado": "activo"
  },
  ...
]
```

#### 1.3 Get Shift Instance Details
```
GET /api/turnos/:id
Authentication: JWT
Response:
{
  "id": 123,
  "plantilla_id": 1,
  "plantilla": {
    "id": 1,
    "nombre": "Vigilancia Diurna",
    "hora_inicio": "08:00:00",
    "hora_fin": "16:00:00",
    "duracion_minutos": 480,
    "es_nocturno": false,
    "empresa_id": 1
  },
  "fecha": "2026-09-20",
  "inicio_fecha_hora": "2026-09-20T08:00:00",
  "fin_fecha_hora": "2026-09-20T16:00:00",
  "sede_id": 1,
  "sede": {
    "id": 1,
    "nombre": "Sede Central",
    "direccion": "Calle Principal 100"
  },
  "creado_por": 12345,
  "creador": {
    "id": 12345,
    "nombre": "Juan Perez",
    "rol": "Planificador"
  },
  "creado_en": "2026-09-15T14:30:00Z",
  "asignaciones": [
    {
      "id": 456,
      "empleado_id": 1,
      "empleado": {
        "id": 1,
        "nombre": "María García",
        "especialidad_id": 2,
        "especialidad": "Medicina General"
      },
      "estado": "confirmado",
      "asignado_en": "2026-09-15T14:35:00Z",
      "asignado_por": 12345
    },
    ...
  ]
}
```

#### 1.4 Update Shift Instance
```
PUT /api/turnos/:id
Authentication: JWT (Planificador)
Body:
{
  "inicio_fecha_hora": "2026-09-20T09:00:00",
  "fin_fecha_hora": "2026-09-20T17:00:00",
  "sede_id": 2
}
Response: Updated shift object
```

#### 1.5 Delete Shift Instance
```
DELETE /api/turnos/:id
Authentication: JWT (Planificador)
Response: { success: true, message: "Turno eliminado" }
```

---

#### 1.6 Assign Employee to Shift
```
POST /api/turnos/:instancia_id/asignaciones
Authentication: JWT (Planificador/Supervisor)
Body:
{
  "empleado_id": 1,
  "estado": "pendiente"  // or "asignado"
}
Response:
{
  "id": 456,
  "instancia_turno_id": 123,
  "empleado_id": 1,
  "empleado": {
    "id": 1,
    "nombre": "María García",
    "especialidad": "Medicina General"
  },
  "estado": "pendiente",
  "asignado_en": "2026-09-15T14:40:00Z",
  "asignado_por": 12345
}
```

#### 1.7 Get Shift Assignments
```
GET /api/turnos/:instancia_id/asignaciones
Authentication: JWT
Response:
[
  {
    "id": 456,
    "empleado_id": 1,
    "empleado": {
      "id": 1,
      "nombre": "María García",
      "especialidad": "Medicina General",
      "estado": "activo"
    },
    "estado": "confirmado",
    "asignado_en": "2026-09-15T14:40:00Z",
    "asignado_por": 12345
  },
  ...
]
```

#### 1.8 Update Assignment Status
```
PUT /api/turnos/:instancia_id/asignaciones/:asignacion_id
Authentication: JWT
Body:
{
  "estado": "confirmado"  // pendiente, asignado, confirmado, rechazado, cambio_solicitado
}
Response: Updated assignment object
```

#### 1.9 Remove Assignment
```
DELETE /api/turnos/:instancia_id/asignaciones/:asignacion_id
Authentication: JWT (Planificador)
Response: { success: true }
```

---

#### 1.10 Employee: List My Assigned Shifts
```
GET /api/turnos/empleado/mis-turnos?estado=confirmado
Authentication: JWT (Empleado role, uses user_id to find empleado_id)
Response:
[
  {
    "id": 123,
    "plantilla_nombre": "Vigilancia Diurna",
    "fecha": "2026-09-20",
    "inicio_fecha_hora": "2026-09-20T08:00:00",
    "fin_fecha_hora": "2026-09-20T16:00:00",
    "sede_nombre": "Sede Central",
    "estado": "confirmado",
    "creador": "Juan Perez",
    "asignacion_id": 456  // needed for confirmations
  },
  ...
]
```

#### 1.11 Employee: Confirm/Reject Assignment
```
PUT /api/turnos/empleado/:asignacion_id/confirmar
Authentication: JWT (Empleado)
Body:
{
  "estado": "confirmado"  // or "rechazado"
}
Response:
{
  "id": 456,
  "estado": "confirmado",
  "confirmado_en": "2026-09-15T15:00:00Z"
}
```

---

### PHASE 2: Shift Templates Management

#### 2.1 Create Shift Template
```
POST /api/plantillas-turno
Authentication: JWT (AdminEmpresa)
Body:
{
  "empresa_id": 1,
  "nombre": "Vigilancia Diurna",
  "hora_inicio": "08:00:00",
  "hora_fin": "16:00:00",
  "duracion_minutos": 480,
  "es_nocturno": false,
  "patron_recurrencia": "L-V"  // Lunes-Viernes
}
Response: Created template object
```

#### 2.2 List Shift Templates
```
GET /api/plantillas-turno?empresa_id=1
Authentication: JWT
Response: Array of template objects
```

#### 2.3 Update Shift Template
```
PUT /api/plantillas-turno/:id
Authentication: JWT (AdminEmpresa)
```

#### 2.4 Delete Shift Template
```
DELETE /api/plantillas-turno/:id
Authentication: JWT (AdminEmpresa)
```

---

### PHASE 3: Employee Management

#### 3.1 Get Employees by Company
```
GET /api/empleados?empresa_id=1&estado=activo
Authentication: JWT
Response:
[
  {
    "id": 1,
    "usuario_id": 69314718,
    "nombre": "Juan Perez",
    "especialidad_id": 2,
    "especialidad": "Medicina General",
    "codigo_empleado": "EMP1_69314718",
    "fecha_ingreso": "2026-09-14",
    "estado": "activo"
  },
  ...
]
```

#### 3.2 Get Employee Availability
```
GET /api/empleados/:id/disponibilidad
Authentication: JWT
Response:
[
  {
    "id": 1,
    "dia_semana": 1,  // 0=domingo, 1=lunes, ...
    "desde_hora": "08:00:00",
    "hasta_hora": "17:00:00",
    "nota": "Disponible mañanas"
  },
  ...
]
```

#### 3.3 Update Employee Availability
```
PUT /api/empleados/:id/disponibilidad
Authentication: JWT (Empleado or AdminEmpresa)
Body:
[
  {
    "dia_semana": 1,
    "desde_hora": "08:00:00",
    "hasta_hora": "17:00:00",
    "nota": ""
  },
  ...
]
Response: Array of updated availability records
```

---

### PHASE 4: Especialidades/Roles Management

#### 4.1 Get Specialties by Company
```
GET /api/especialidades?empresa_id=1
Authentication: JWT
Response:
[
  {
    "id": 2,
    "codigo": "medicina_general",
    "nombre": "Medicina General",
    "descripcion": "Atención primaria y consulta general",
    "creado_en": "2026-09-14T23:35:10Z"
  },
  ...
]
```

#### 4.2 Create Specialty
```
POST /api/especialidades
Authentication: JWT (AdminEmpresa)
Body:
{
  "empresa_id": 1,
  "codigo": "seguridad_it",
  "nombre": "Seguridad IT",
  "descripcion": "Personal de seguridad informática"
}
Response: Created specialty object
```

#### 4.3 Update/Delete Specialties
```
PUT /api/especialidades/:id
DELETE /api/especialidades/:id
Authentication: JWT (AdminEmpresa)
```

---

### PHASE 5: Usuarios/Empresas Management

#### 5.1 Get Users by Company
```
GET /api/usuarios?empresa_id=1
Authentication: JWT (AdminEmpresa or Super Admin)
Response:
[
  {
    "id": 12345,
    "correo": "juan@example.com",
    "primer_nombre": "Juan",
    "primer_apellido": "Perez",
    "roles": ["Planificador"]
  },
  ...
]
```

#### 5.2 Create User
```
POST /api/usuarios
Authentication: JWT (AdminEmpresa or Super Admin)
Body:
{
  "correo": "nuevo@example.com",
  "primer_nombre": "Nuevo",
  "primer_apellido": "Usuario",
  "contrasena": "TempPassword123!",
  "empresa_id": 1,
  "rol_id": 5  // Empleado
}
Response: Created user object (no password returned)
```

#### 5.3 Update User Roles
```
PUT /api/usuarios/:id/roles
Authentication: JWT (AdminEmpresa or Super Admin)
Body:
{
  "empresa_id": 1,
  "rol_id": 3  // Change to Planificador
}
Response: Updated user object with new roles
```

#### 5.4 Get Companies
```
GET /api/empresas?offset=0&limit=20
Authentication: JWT (Super Admin)
Response:
[
  {
    "id": 1,
    "nombre": "Empresa Demo 1",
    "zona_horaria": "America/Bogota",
    "plan_id": 1,
    "creado_en": "2026-09-14T21:20:32Z"
  },
  ...
]
```

#### 5.5 Create Company
```
POST /api/empresas
Authentication: JWT (Super Admin)
Body:
{
  "nombre": "Nueva Empresa",
  "zona_horaria": "America/Bogota",
  "plan_id": 1
}
Response: Created company object
```

---

### PHASE 6: Audit & Notifications

#### 6.1 Log Action
```
POST /api/auditoria/registrar
Authentication: JWT (Internal - called by other endpoints)
Body:
{
  "empresa_id": 1,
  "usuario_id": 12345,
  "accion": "crear_turno",
  "tabla_objetivo": "instancias_turno",
  "id_objetivo": 123,
  "detalles": { "plantilla_id": 1, "fecha": "2026-09-20" }
}
Response: { success: true }
```

#### 6.2 Get Audit Logs
```
GET /api/auditoria?empresa_id=1&limit=100&offset=0
Authentication: JWT (AdminEmpresa or Super Admin)
Response:
[
  {
    "id": 1,
    "usuario_id": 12345,
    "usuario": "Juan Perez",
    "accion": "crear_turno",
    "tabla_objetivo": "instancias_turno",
    "id_objetivo": 123,
    "creado_en": "2026-09-15T14:30:00Z"
  },
  ...
]
```

---

### PHASE 7: Sedes Management

#### 7.1 Get Offices by Company
```
GET /api/sedes?empresa_id=1
Authentication: JWT
Response:
[
  {
    "id": 1,
    "nombre": "Sede Central",
    "direccion": "Calle Principal 100",
    "zona_horaria": "America/Bogota",
    "creado_en": "2026-09-14T23:29:16Z"
  },
  ...
]
```

#### 7.2 Create Office
```
POST /api/sedes
Authentication: JWT (AdminEmpresa)
Body:
{
  "empresa_id": 1,
  "nombre": "Sede Norte",
  "direccion": "Av. Principal 500",
  "zona_horaria": "America/Bogota"
}
Response: Created office object
```

---

## Implementation Architecture

### File Structure (Recommended)
```
backend/
├── routes/
│   ├── turnos.js          (1.1-1.11)
│   ├── plantillas.js      (2.1-2.4)
│   ├── empleados.js       (3.1-3.3) [extend existing]
│   ├── especialidades.js  (4.1-4.3)
│   ├── usuarios.js        (5.1-5.3) [extend existing]
│   ├── empresas.js        (5.4-5.5)
│   ├── auditoria.js       (6.1-6.2)
│   └── sedes.js           (7.1-7.2)
├── middleware/
│   ├── auth.js            [already exists]
│   └── rolecheck.js       [new: checks rol requirements]
├── controllers/
│   ├── turnosController.js
│   ├── empleadosController.js
│   └── ...
├── db.js                  [already exists]
├── auth.js                [already exists]
└── index.js               [extend with new routes]
```

### Authentication Pattern (Already in Place)
- JWT token stored in localStorage (frontend)
- Token contains: `Id_usuario`, `nombre`, `correo`, `Id_rol`, `empresa_id`
- Validation: `authenticateToken` middleware checks JWT

### Role-Based Access Control
```javascript
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.Id_rol;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
  };
};

// Usage:
router.post('/turnos', authenticateToken, requireRole([3]), createTurno);
// Only Planificador (role 3) can create turnos
```

### Company Isolation
All endpoints must validate that the empresa_id in the request matches the user's empresa_id from the JWT token (unless Super Admin):
```javascript
const userEmpresa = req.user.empresa_id || 1;
const requestEmpresa = req.body.empresa_id || req.query.empresa_id;

if (req.user.Id_rol !== 1 && userEmpresa !== requestEmpresa) {
  return res.status(403).json({ error: 'Cannot access other companies' });
}
```

### Data Validation
- Dates: ISO 8601 format (YYYY-MM-DD, YYYY-MM-DDTHH:MM:SS)
- Times: HH:MM:SS 24-hour format
- IDs: Positive integers
- Emails: Valid email format
- Enums: Validate against allowed values

### Error Handling
```javascript
// Standardized error responses:
{
  "error": "Validation failed",
  "details": {
    "fecha": "Invalid date format",
    "empleado_id": "Employee not found"
  }
}
```

### Audit Logging
Every create/update/delete operation must call audit logging:
```javascript
// After successful operation:
await logAction(pool, {
  empresa_id: req.user.empresa_id,
  usuario_id: req.user.Id_usuario,
  accion: 'crear_turno',
  tabla_objetivo: 'instancias_turno',
  id_objetivo: newTurno.id,
  detalles: { plantilla_id, fecha }
});
```

---

## Key Business Rules

### Turno Creation (Planificador only)
1. Must select an existing plantilla_turno
2. Must specify date, start time, end time
3. Must select a sede
4. Cannot create turno in the past
5. Cannot create overlapping turnos for same sede

### Assignment Creation
1. Empleado must be "activo"
2. Empleado especialidad must match plantilla requirements (if enforced)
3. Can assign same empleado multiple times to different turnos
4. Estado flows: pendiente → asignado → confirmado (by empleado)

### Employee Confirmation
1. Empleado can only confirm/reject their own assignments
2. Can only change state if currently pending/asignado
3. Once confirmed, cannot be changed without supervisor approval

### Availability Check
1. Before suggesting assignments, check empleado availability
2. Availability is by day-of-week, not specific dates
3. Used for planning but not enforced for assignment

---

## Integration Notes

### Frontend Integration Points
1. PlanificadorDashboard: Fetch from POST /api/turnos, GET /api/turnos
2. EmpleadoDashboard: Fetch from GET /api/turnos/empleado/mis-turnos
3. AdminEmpresaDashboard modules will fetch their respective endpoints
4. All module data will transition from mock → real API responses

### Current Backend Status
- ✅ Auth.js: Login, JWT generation (working)
- ✅ Users.js: Basic user queries (existing)
- ✅ Empleado.js: Basic employee queries (existing)
- ❌ Turnos: Need to create completely
- ❌ Plantillas: Need to create completely
- ❌ Especialidades: Need to create completely
- ❌ Auditoria: Need to create completely

### Database Connection
- Already configured in db.js with mysql2/promise
- Connection pool ready to use
- Use: `const { pool } = require('../db')`

---

## Next Steps

1. ✅ **Database Structure Documented** (This file)
2. ⏳ **Create /routes/turnos.js** - Core turno endpoints (1.1-1.11)
3. ⏳ **Create Role Check Middleware** - Verify user permissions
4. ⏳ **Create Audit Logging Function** - Log all operations
5. ⏳ **Update index.js** - Register new routes
6. ⏳ **Test with Postman** - Verify all endpoints
7. ⏳ **Update Frontend** - Connect components to real API
8. ⏳ **Create remaining routes** - Plantillas, Empleados, etc.

---

## Testing Checklist

### Test User Accounts (from database)
- **Super Admin**: ID 1, Rol 1 (can test 6.x endpoints)
- **Planificador**: ID 3, Rol 3 (can test 1.1-1.5, 1.6)
- **Empleado**: ID 5, Rol 5 (can test 1.10-1.11, 3.2-3.3)
- **Admin Empresa**: ID 2, Rol 2 (can test 2.x, 5.1, 5.2)

### Test Scenarios
1. Planificador creates turno → Empleado sees it
2. Planificador assigns Empleado → Empleado can confirm
3. Empleado rejects assignment → Planificador reassigns
4. Audit log captures all actions
5. Cross-company isolation works

