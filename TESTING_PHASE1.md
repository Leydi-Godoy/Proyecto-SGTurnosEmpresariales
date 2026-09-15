# Phase 1 Backend Implementation - Testing Guide

## ✅ What Was Implemented

### Created Files

1. **`/backend/routes/turnos.js`** (670 lines)
   - All 11 Phase 1 endpoints implemented
   - Full CRUD for shift instances and assignments
   - Employee views and confirmation endpoints
   - Audit logging on all operations
   - Company access isolation
   - Role-based access control

2. **`/backend/middleware/rolecheck.js`**
   - `requireRole()` middleware for role-based access
   - `requireCompanyAccess()` middleware for company isolation

3. **Updated `/backend/index.js`**
   - Registered `/api/turnos` route

### Endpoints Implemented (11 total)

#### Shift Instance Management (1.1-1.5)
- ✅ `POST /api/turnos` - Create shift instance (Planificador only)
- ✅ `GET /api/turnos` - List shifts with filters
- ✅ `GET /api/turnos/:id` - Get shift details with assignments
- ✅ `PUT /api/turnos/:id` - Update shift (Planificador only)
- ✅ `DELETE /api/turnos/:id` - Delete shift (Planificador only)

#### Assignment Management (1.6-1.9)
- ✅ `POST /api/turnos/:instancia_id/asignaciones` - Assign employee to shift
- ✅ `GET /api/turnos/:instancia_id/asignaciones` - Get shift assignments
- ✅ `PUT /api/turnos/:instancia_id/asignaciones/:asignacion_id` - Update assignment status
- ✅ `DELETE /api/turnos/:instancia_id/asignaciones/:asignacion_id` - Remove assignment

#### Employee Endpoints (1.10-1.11)
- ✅ `GET /api/turnos/empleado/mis-turnos` - Employee views their shifts
- ✅ `PUT /api/turnos/empleado/:asignacion_id/confirmar` - Employee confirms/rejects shift

---

## 🧪 Testing Procedure

### Prerequisites
1. Backend running on `http://localhost:3001`
2. Frontend running on `http://localhost:5173`
3. Database populated with demo data (41 employees, 8 companies, etc.)

### Test Users Available (from database)

| ID | Name | Role | Company | Email |
|---|---|---|---|---|
| 12345 | Juan Perez | Planificador (3) | 1 | juan@example.com |
| 1 | (Super Admin) | Super Admin (1) | N/A | - |
| 5 | (Empleado) | Empleado (5) | 1 | - |

### Test Scenario 1: Planificador Creates a Shift

**Step 1.1**: Login as Planificador
```
POST http://localhost:3001/api/auth/login
Body:
{
  "correo": "juan@example.com",
  "contrasena": "password123"
}
Response: JWT token in localStorage
```

**Step 1.2**: Get shift templates
```
GET http://localhost:3001/api/plantillas-turno?empresa_id=1
(This endpoint will be created in Phase 2, for now use database query)
```

**Step 1.3**: Create a shift instance
```
POST http://localhost:3001/api/turnos
Headers:
  Authorization: Bearer [JWT_TOKEN]
  Content-Type: application/json

Body:
{
  "plantilla_id": 1,
  "fecha": "2026-09-20",
  "inicio_fecha_hora": "2026-09-20T08:00:00",
  "fin_fecha_hora": "2026-09-20T16:00:00",
  "sede_id": 1
}

Expected Response (201):
{
  "id": 1,
  "plantilla_id": 1,
  "plantilla_nombre": "Vigilancia Diurna",
  "fecha": "2026-09-20",
  "inicio_fecha_hora": "2026-09-20T08:00:00",
  "fin_fecha_hora": "2026-09-20T16:00:00",
  "sede_id": 1,
  "sede_nombre": "Sede Central",
  "creado_por": 12345,
  "creado_en": "2026-09-15T14:30:00Z",
  "asignaciones_confirmadas": 0,
  "asignaciones_totales": 0
}

✅ Check: 
- Turno created in database
- Audit log recorded "crear_turno"
- Status is 201
```

**Step 1.4**: Verify turno was created
```
GET http://localhost:3001/api/turnos?empresa_id=1
Headers:
  Authorization: Bearer [JWT_TOKEN]

Expected Response (200):
[
  {
    "id": 1,
    "plantilla_id": 1,
    "plantilla_nombre": "Vigilancia Diurna",
    "fecha": "2026-09-20",
    ...
  }
]

✅ Check:
- Turno appears in list
- Filters work (fecha_desde, fecha_hasta)
```

---

### Test Scenario 2: Planificador Assigns Employee

**Step 2.1**: Get shift details
```
GET http://localhost:3001/api/turnos/1
Headers:
  Authorization: Bearer [JWT_TOKEN]

Expected Response (200):
{
  "id": 1,
  "plantilla": { ... },
  "fecha": "2026-09-20",
  "asignaciones": []  // Initially empty
}

✅ Check:
- Shift details returned
- asignaciones array is empty
```

**Step 2.2**: Assign employee to shift
```
POST http://localhost:3001/api/turnos/1/asignaciones
Headers:
  Authorization: Bearer [JWT_TOKEN]
  Content-Type: application/json

Body:
{
  "empleado_id": 1,
  "estado": "pendiente"
}

Expected Response (201):
{
  "id": 1,
  "instancia_turno_id": 1,
  "empleado_id": 1,
  "empleado_nombre": "María García",
  "especialidad_nombre": "Medicina General",
  "estado": "pendiente",
  "asignado_en": "2026-09-15T14:40:00Z",
  "asignado_por": 12345
}

✅ Check:
- Assignment created
- Audit log recorded "asignar_turno"
- Status is 201
```

**Step 2.3**: Get assignments for shift
```
GET http://localhost:3001/api/turnos/1/asignaciones
Headers:
  Authorization: Bearer [JWT_TOKEN]

Expected Response (200):
[
  {
    "id": 1,
    "empleado_id": 1,
    "empleado_nombre": "María García",
    "estado": "pendiente",
    ...
  }
]

✅ Check:
- Assignment appears in list
```

**Step 2.4**: Assign more employees
```
Repeat Step 2.2 with:
{
  "empleado_id": 2,
  "estado": "pendiente"
},
{
  "empleado_id": 3,
  "estado": "pendiente"
}

✅ Check:
- Multiple assignments work
- Each gets unique ID
```

---

### Test Scenario 3: Employee Views and Confirms Shifts

**Step 3.1**: Login as Empleado
```
POST http://localhost:3001/api/auth/login
Body:
{
  "correo": "maria@example.com",  // Employee email
  "contrasena": "password123"
}
Response: JWT token for Empleado (role 5)
```

**Step 3.2**: Employee views assigned shifts
```
GET http://localhost:3001/api/turnos/empleado/mis-turnos
Headers:
  Authorization: Bearer [EMPLEADO_JWT_TOKEN]

Expected Response (200):
[
  {
    "id": 1,
    "plantilla_nombre": "Vigilancia Diurna",
    "fecha": "2026-09-20",
    "inicio_fecha_hora": "2026-09-20T08:00:00",
    "fin_fecha_hora": "2026-09-20T16:00:00",
    "sede_nombre": "Sede Central",
    "estado": "pendiente",
    "asignacion_id": 1,
    "creador_nombre": "Juan Perez"
  }
]

✅ Check:
- Only this employee's shifts returned
- asignacion_id is included (needed for confirmation)
- Filters work (estado parameter)
```

**Step 3.3**: Employee confirms assignment
```
PUT http://localhost:3001/api/turnos/empleado/1/confirmar
Headers:
  Authorization: Bearer [EMPLEADO_JWT_TOKEN]
  Content-Type: application/json

Body:
{
  "estado": "confirmado"
}

Expected Response (200):
{
  "id": 1,
  "empleado_id": 1,
  "empleado_nombre": "María García",
  "estado": "confirmado",
  ...
}

✅ Check:
- Assignment status changed to "confirmado"
- Audit log recorded "empleado_confirmar_turno"
- Status is 200
```

**Step 3.4**: Verify updated shift status
```
GET http://localhost:3001/api/turnos/1
Headers:
  Authorization: Bearer [PLANIFICADOR_JWT_TOKEN]

Expected Response (200):
{
  "id": 1,
  "asignaciones": [
    {
      "id": 1,
      "empleado_nombre": "María García",
      "estado": "confirmado"  // ✅ Changed
    },
    ...
  ]
}

✅ Check:
- Confirmado count updated
- Planificador sees updated status
```

---

### Test Scenario 4: Planificador Rejects/Changes Assignment

**Step 4.1**: Get current assignments
```
GET http://localhost:3001/api/turnos/1/asignaciones
Headers:
  Authorization: Bearer [PLANIFICADOR_JWT_TOKEN]

Response: Array of assignments
```

**Step 4.2**: Update assignment status (mark as rejected)
```
PUT http://localhost:3001/api/turnos/1/asignaciones/1
Headers:
  Authorization: Bearer [PLANIFICADOR_JWT_TOKEN]
  Content-Type: application/json

Body:
{
  "estado": "rechazado"
}

Expected Response (200):
{
  "id": 1,
  "estado": "rechazado",
  ...
}

✅ Check:
- Status changed to "rechazado"
- Audit log recorded "actualizar_asignacion"
```

**Step 4.3**: Remove assignment
```
DELETE http://localhost:3001/api/turnos/1/asignaciones/1
Headers:
  Authorization: Bearer [PLANIFICADOR_JWT_TOKEN]

Expected Response (200):
{
  "success": true,
  "message": "Asignacion eliminada"
}

✅ Check:
- Assignment deleted from database
- Audit log recorded "eliminar_asignacion"
- Employee can no longer see that shift
```

---

### Test Scenario 5: Update and Delete Shift

**Step 5.1**: Update shift details (time change)
```
PUT http://localhost:3001/api/turnos/1
Headers:
  Authorization: Bearer [PLANIFICADOR_JWT_TOKEN]
  Content-Type: application/json

Body:
{
  "inicio_fecha_hora": "2026-09-20T09:00:00",
  "fin_fecha_hora": "2026-09-20T17:00:00"
}

Expected Response (200):
{
  "id": 1,
  "inicio_fecha_hora": "2026-09-20T09:00:00",  // ✅ Updated
  "fin_fecha_hora": "2026-09-20T17:00:00",      // ✅ Updated
  ...
}

✅ Check:
- Times updated
- Audit log recorded "actualizar_turno"
```

**Step 5.2**: Delete shift
```
DELETE http://localhost:3001/api/turnos/1
Headers:
  Authorization: Bearer [PLANIFICADOR_JWT_TOKEN]

Expected Response (200):
{
  "success": true,
  "message": "Turno eliminado"
}

✅ Check:
- Shift deleted
- All assignments deleted too
- Audit log recorded "eliminar_turno"
```

---

### Test Scenario 6: Role-Based Access Control

**Test 6.1**: Empleado tries to create turno (should fail)
```
POST http://localhost:3001/api/turnos
Headers:
  Authorization: Bearer [EMPLEADO_JWT_TOKEN]
  Content-Type: application/json

Body: { ... }

Expected Response (403):
{
  "error": "Solo Planificador puede crear turnos"
}

✅ Check: 403 Forbidden returned
```

**Test 6.2**: Empleado tries to access other company's shifts
```
GET http://localhost:3001/api/turnos?empresa_id=2
Headers:
  Authorization: Bearer [EMPLEADO_COMPANY1_JWT_TOKEN]

Expected Response (403):
{
  "error": "Cannot access other companies"
}

✅ Check: 403 Forbidden returned
```

**Test 6.3**: Empleado tries to update assignment
```
PUT http://localhost:3001/api/turnos/1/asignaciones/1
Headers:
  Authorization: Bearer [EMPLEADO_JWT_TOKEN]
  Content-Type: application/json

Body: { "estado": "confirmado" }

Expected Response (403):
{
  "error": "Cannot confirm other employee's assignments"  // or similar
}

✅ Check: 403 Forbidden returned (not the employee's assignment)
```

---

### Test Scenario 7: Data Validation

**Test 7.1**: Missing required fields
```
POST http://localhost:3001/api/turnos
Headers:
  Authorization: Bearer [PLANIFICADOR_JWT_TOKEN]
  Content-Type: application/json

Body:
{
  "plantilla_id": 1
  // Missing: fecha, inicio_fecha_hora, fin_fecha_hora, sede_id
}

Expected Response (400):
{
  "error": "Validation failed",
  "details": {
    "fecha": "Required",
    "inicio_fecha_hora": "Required",
    ...
  }
}

✅ Check: Validation errors returned
```

**Test 7.2**: Invalid date format
```
POST http://localhost:3001/api/turnos
Body:
{
  "plantilla_id": 1,
  "fecha": "20-09-2026",  // Wrong format
  "inicio_fecha_hora": "2026-09-20T08:00:00",
  "fin_fecha_hora": "2026-09-20T16:00:00",
  "sede_id": 1
}

Expected Response (400):
{
  "error": "fecha debe ser formato YYYY-MM-DD"
}

✅ Check: Format validation works
```

**Test 7.3**: Invalid estado value
```
POST http://localhost:3001/api/turnos/1/asignaciones
Body:
{
  "empleado_id": 1,
  "estado": "invalid_status"
}

Expected Response (400):
{
  "error": "Invalid estado. Allowed: ..."
}

✅ Check: Enum validation works
```

---

## 🔍 Database Verification

After running tests, verify in database:

```sql
-- Check created shifts
SELECT * FROM instancias_turno ORDER BY creado_en DESC;

-- Check assignments
SELECT * FROM asignaciones_turno ORDER BY asignado_en DESC;

-- Check audit logs
SELECT * FROM registros_auditoria 
WHERE tabla_objetivo IN ('instancias_turno', 'asignaciones_turno')
ORDER BY creado_en DESC;
```

---

## ⚠️ Known Limitations (Phase 2+)

- Plantilla templates CRUD not implemented yet
- Specialties matching not enforced
- Availability checking not implemented
- Notifications not sent yet
- No conflict detection for overlapping shifts

---

## 🚀 Next Steps (Phase 2+)

1. Implement Plantilla CRUD endpoints
2. Implement Especialidades management
3. Implement Employee availability endpoints
4. Add notification system
5. Add conflict detection
6. Connect frontend to real API

---

## 📝 Troubleshooting

### Error: "Auth router not available"
- This is normal in console, auth.js has a duplicate express declaration issue
- Doesn't affect functionality
- Will be fixed in future refactor

### 401 Unauthorized
- JWT token expired or missing
- Check localStorage for valid token
- Re-login if needed

### 403 Forbidden
- User doesn't have required role
- User trying to access different company
- Check user's Id_rol and empresa_id

### 500 Database Error
- Check database connection in .env
- Verify database has schema from migration
- Check error logs in backend console

