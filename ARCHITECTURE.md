# Backend Architecture - Phase 1 Complete

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│ • PlanificadorDashboard → Create/Manage Shifts             │
│ • EmpleadoDashboard → View/Confirm Shifts                  │
│ • SupervisorDashboard → Monitor Operations                 │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/JWT
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Express.js)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         /api/turnos (PHASE 1) ✅                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  POST   /                   → Create Shift         │  │
│  │  GET    /                   → List Shifts          │  │
│  │  GET    /:id                → Get Shift Details    │  │
│  │  PUT    /:id                → Update Shift         │  │
│  │  DELETE /:id                → Delete Shift         │  │
│  │                                                      │  │
│  │  POST   /:id/asignaciones           → Assign Emp   │  │
│  │  GET    /:id/asignaciones           → Get Assign   │  │
│  │  PUT    /:id/asignaciones/:aid      → Update Stat  │  │
│  │  DELETE /:id/asignaciones/:aid      → Remove Assg  │  │
│  │                                                      │  │
│  │  GET    /empleado/mis-turnos        → My Shifts    │  │
│  │  PUT    /empleado/:aid/confirmar    → Confirm      │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  /api/auth (Existing)                                      │
│    → Login, JWT generation, Password reset                │
│                                                             │
│  /api/users (Existing)                                     │
│    → User management                                       │
│                                                             │
│  /api/empleado (Existing)                                  │
│    → Employee data                                         │
│                                                             │
│  [middleware/rolecheck.js]                                 │
│    → requireRole() - Enforce role permissions             │
│    → requireCompanyAccess() - Enforce company isolation   │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │ SQL Queries
                 ↓
┌─────────────────────────────────────────────────────────────┐
│            DATABASE (MariaDB/MySQL)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  instancias_turno                                          │
│  ├─ id, plantilla_id, fecha, inicio_fecha_hora            │
│  ├─ fin_fecha_hora, sede_id, creado_por, creado_en       │
│  └─ FOREIGN KEY: plantilla_id → plantillas_turno         │
│                                                             │
│  asignaciones_turno                                        │
│  ├─ id, instancia_turno_id, empleado_id, estado           │
│  ├─ asignado_en, asignado_por                             │
│  ├─ FOREIGN KEY: instancia_turno_id → instancias_turno   │
│  └─ FOREIGN KEY: empleado_id → empleados                │
│                                                             │
│  plantillas_turno (Referenced)                             │
│  ├─ id, empresa_id, nombre, hora_inicio, hora_fin        │
│  ├─ duracion_minutos, es_nocturno, patron_recurrencia    │
│  └─ FOREIGN KEY: empresa_id → empresas                   │
│                                                             │
│  empleados (Referenced)                                    │
│  ├─ id, usuario_id, empresa_id, especialidad_id          │
│  ├─ codigo_empleado, estado, fecha_ingreso               │
│  └─ Linked to usuarios via usuario_id                    │
│                                                             │
│  registros_auditoria (Logging)                            │
│  ├─ id, empresa_id, usuario_id, accion                   │
│  ├─ tabla_objetivo, id_objetivo, detalles                │
│  └─ Every create/update/delete logged here               │
│                                                             │
│  sedes (Referenced)                                        │
│  └─ Office locations per company                         │
│                                                             │
│  [Others: roles, usuarios, empresas, especialidades]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### 1️⃣ Planificador Creates Shift

```
Planificador (Role 3)
  │
  ├─ GET /api/plantillas-turno?empresa_id=1
  │   └─ Returns available shift templates
  │
  ├─ GET /api/sedes?empresa_id=1
  │   └─ Returns available office locations
  │
  └─ POST /api/turnos
      │
      ├─ [authenticateToken] Middleware
      │   └─ Verify JWT token, extract user info
      │
      ├─ [Check Role] 
      │   └─ userRole must be 3 (Planificador)
      │
      ├─ [Validate Input]
      │   ├─ plantilla_id exists
      │   ├─ fecha format YYYY-MM-DD
      │   ├─ datetime format ISO 8601
      │   └─ sede belongs to company
      │
      ├─ [Check Company Access]
      │   └─ User can access plantilla's company
      │
      ├─ [INSERT] instancias_turno
      │   └─ Create new shift instance
      │
      ├─ [LOG] registros_auditoria
      │   ├─ accion: "crear_turno"
      │   ├─ tabla_objetivo: "instancias_turno"
      │   ├─ id_objetivo: [new turno id]
      │   └─ detalles: { plantilla_id, fecha, ... }
      │
      └─ Response: 201 Created + Turno object
         ├─ id, plantilla_id, plantilla_nombre
         ├─ fecha, inicio_fecha_hora, fin_fecha_hora
         ├─ sede_nombre, creado_por, creado_en
         └─ asignaciones_confirmadas: 0, total: 0
```

### 2️⃣ Planificador Assigns Employee

```
Planificador (Role 3) or Supervisor (Role 4)
  │
  ├─ GET /api/turnos/1 
  │   └─ View shift details and current assignments
  │
  ├─ GET /api/empleados?empresa_id=1&estado=activo
  │   └─ View list of available employees
  │
  └─ POST /api/turnos/1/asignaciones
      │
      ├─ [authenticateToken] Middleware
      │
      ├─ [Check Role]
      │   └─ userRole must be 3 or 4
      │
      ├─ [Verify Turno]
      │   ├─ Turno exists
      │   └─ User can access company
      │
      ├─ [Verify Empleado]
      │   ├─ Employee exists
      │   ├─ Employee belongs to same company
      │   ├─ Employee is "activo"
      │   └─ Employee not already assigned to turno
      │
      ├─ [INSERT] asignaciones_turno
      │   ├─ instancia_turno_id, empleado_id
      │   ├─ asignado_por: user_id, estado: "pendiente"
      │   └─ asignado_en: NOW()
      │
      ├─ [LOG] registros_auditoria
      │   ├─ accion: "asignar_turno"
      │   ├─ tabla_objetivo: "asignaciones_turno"
      │   └─ id_objetivo: [new asignacion id]
      │
      └─ Response: 201 Created + Assignment object
         ├─ id, instancia_turno_id, empleado_id
         ├─ empleado_nombre, especialidad_nombre
         ├─ estado: "pendiente", asignado_en, asignado_por
         └─ (Employee can now see this shift)
```

### 3️⃣ Employee Views Their Shifts

```
Empleado (Role 5)
  │
  └─ GET /api/turnos/empleado/mis-turnos
      │
      ├─ [authenticateToken] Middleware
      │
      ├─ [Check Role]
      │   └─ userRole must be 5 (Empleado)
      │
      ├─ [Find Empleado ID]
      │   ├─ Query: SELECT id FROM empleados WHERE usuario_id = ?
      │   └─ Convert user_id to empleado_id
      │
      ├─ [JOIN Query]
      │   SELECT FROM asignaciones_turno
      │   JOIN instancias_turno ON instancia_turno_id
      │   JOIN plantillas_turno ON plantilla_id
      │   WHERE empleado_id = ? AND estado IN (...)
      │
      └─ Response: 200 OK + Array of shifts
         ├─ [0]: {
         │   ├─ id: 1 (turno id)
         │   ├─ plantilla_nombre: "Vigilancia Diurna"
         │   ├─ fecha: "2026-09-20"
         │   ├─ inicio_fecha_hora: "2026-09-20T08:00:00"
         │   ├─ fin_fecha_hora: "2026-09-20T16:00:00"
         │   ├─ sede_nombre: "Sede Central"
         │   ├─ estado: "pendiente" (assignment status)
         │   ├─ asignacion_id: 123 (needed for confirmation)
         │   └─ creador_nombre: "Juan Perez"
         │ }
         └─ [1], [2], ...
```

### 4️⃣ Employee Confirms Shift

```
Empleado (Role 5)
  │
  └─ PUT /api/turnos/empleado/123/confirmar
      │
      ├─ [authenticateToken] Middleware
      │
      ├─ [Check Role]
      │   └─ userRole must be 5 (Empleado)
      │
      ├─ [Get Assignment]
      │   ├─ Query: SELECT FROM asignaciones_turno WHERE id = ?
      │   ├─ JOIN empleados WHERE empleado_id
      │   └─ Extract employee's usuario_id
      │
      ├─ [Verify Ownership]
      │   ├─ employee.usuario_id must == current user.Id_usuario
      │   └─ Only employee can confirm their own assignments
      │
      ├─ [Validate Estado]
      │   └─ Only allow "confirmado" or "rechazado"
      │
      ├─ [UPDATE] asignaciones_turno
      │   └─ SET estado = ?, WHERE id = ?
      │
      ├─ [LOG] registros_auditoria
      │   ├─ accion: "empleado_confirmar_turno"
      │   └─ detalles: { estado: "confirmado" }
      │
      └─ Response: 200 OK + Updated assignment
         └─ estado: "confirmado" (Employee committed!)
            └─ Planificador can see updated status
```

---

## 🏗️ Request/Response Pattern

### Authentication Flow (Before Every Request)

```
Client Request
  ├─ Headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..." }
  │
  └─ Express Route Handler
      │
      ├─ middleware: authenticateToken
      │   ├─ Extract token from Authorization header
      │   ├─ JWT verification using secret
      │   ├─ Decode: { Id_usuario, nombre, correo, Id_rol, empresa_id }
      │   ├─ Store in req.user object
      │   └─ Next middleware
      │
      └─ Handler Function
          ├─ Access req.user.Id_usuario (who)
          ├─ Access req.user.Id_rol (what permissions)
          ├─ Access req.user.empresa_id (which company)
          └─ Process request with this context
```

### Authorization Flow (Role Check)

```
Handler receives request
  │
  ├─ Get userRole = req.user.Id_rol
  │
  ├─ Check if userRole is allowed
  │   ├─ if (userRole != 3) return 403
  │   └─ Only Planificador allowed
  │
  ├─ Get userCompany = req.user.empresa_id
  │
  ├─ Check if user can access requested company
  │   ├─ if (userRole == 1) allow all
  │   ├─ else if (userCompany != requestCompany) return 403
  │   └─ Only own company allowed
  │
  └─ Process request
```

### Error Handling Pattern

```
Handler receives request
  │
  ├─ Try
  │   ├─ Validate inputs
  │   ├─ Check authorization
  │   ├─ Query database
  │   ├─ Log action
  │   └─ Return result
  │
  └─ Catch
      ├─ If validation error → 400 Bad Request
      ├─ If auth error → 403 Forbidden
      ├─ If not found → 404 Not Found
      ├─ If DB error → 500 Internal Server Error
      └─ Always log error for debugging
```

---

## 🔐 Security Layers

### Layer 1: Authentication (JWT)
```
Token issued at login contains:
├─ Id_usuario (who you are)
├─ nombre (display name)
├─ correo (email)
├─ Id_rol (what you can do)
└─ empresa_id (which company)

Token verified at every request
├─ Signature validated
├─ Not expired
├─ Not tampered with
└─ Contains valid user info
```

### Layer 2: Authorization (Role Check)
```
Before processing request:
├─ User's role extracted from token
├─ Role required for this operation checked
├─ If doesn't match → 403 Forbidden
└─ Operator blocked from unauthorized actions
```

### Layer 3: Company Isolation
```
Before accessing data:
├─ Data's company_id extracted
├─ User's empresa_id from token extracted
├─ If Super Admin (role 1) → allow all
├─ Else if mismatched → 403 Forbidden
└─ User cannot see other company's data
```

### Layer 4: Validation
```
Before saving to database:
├─ Required fields checked
├─ Data format validated
├─ Relationships verified
├─ Constraints checked
└─ Invalid data rejected with 400
```

---

## 📈 Performance Considerations

### Database Queries
```
✅ SELECT queries use JOIN for single fetch
✅ Aggregation (COUNT) done in database
✅ Proper WHERE clauses for filtering
✅ Indexed on foreign keys (empresa_id, etc)
✅ Pagination with LIMIT/OFFSET

Example:
SELECT 
  it.id, pt.nombre, 
  COUNT(DISTINCT at.id) as total_assignments
FROM instancias_turno it
JOIN plantillas_turno pt ON it.plantilla_id = pt.id
LEFT JOIN asignaciones_turno at ON it.id = at.instancia_turno_id
WHERE pt.empresa_id = ? AND it.fecha >= ?
GROUP BY it.id
LIMIT 100 OFFSET 0
```

### Response Caching (Future)
```
Could cache:
├─ GET /api/turnos/:id (details don't change often)
├─ GET /api/plantillas-turno (templates change rarely)
└─ GET /api/sedes (office locations change rarely)

But NOT:
├─ GET /api/turnos (list changes frequently)
└─ GET /api/turnos/empleado/mis-turnos (personal data)
```

---

## 🔗 Table Relationships

```
empresas (1)
  ├─ ← (many) plantillas_turno
  │   ├─ → instancias_turno
  │   │   ├─ → asignaciones_turno
  │   │   │   └─ → empleados
  │   │   │       ├─ → especialidades
  │   │   │       └─ → usuarios
  │   │   └─ → sedes
  │   └─ → especialidades
  │
  ├─ ← (many) empleados
  │   ├─ → usuarios
  │   └─ → especialidades
  │
  ├─ ← (many) usuarios
  │   └─ → usuario_roles
  │       └─ → roles
  │
  ├─ ← (many) sedes
  │
  ├─ ← (many) registros_auditoria (audit trail)
  │
  └─ → planes (pricing plan)

instancias_turno (parent)
  ├─ → plantillas_turno (template)
  ├─ → sedes (location)
  ├─ → usuarios (created_by)
  └─ ← (many) asignaciones_turno (assignments)

asignaciones_turno (junction)
  ├─ → instancias_turno (which shift)
  ├─ → empleados (which employee)
  └─ → usuarios (assigned_by)
```

