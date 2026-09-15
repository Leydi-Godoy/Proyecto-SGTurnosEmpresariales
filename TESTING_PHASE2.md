# 🧪 Testing Phase 2 - Plantillas de Turno

**Status**: Endpoints Ready for Testing  
**Phase**: 2 (Shift Templates Management)  
**Endpoints**: 5 (Create, List, Get, Update, Delete)  

---

## 📋 Test Setup

### Test User Credentials

```
Email: admin@example.com
Contraseña: password123
Rol: Admin Empresa (Id_rol = 2)
Empresa: 1
```

### Prerequisites

1. Backend running on `http://localhost:3001`
2. Database connected with demo data
3. User logged in and JWT token available

---

## 🧪 Test Scenarios

### Test Scenario 1: Create Shift Template (Crear Malla)

**Objective**: Create a new shift template for the company

**Steps**:

1. **Login and get JWT token**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "correo": "admin@example.com",
       "contrasena": "password123"
     }'
   ```

   **Expected Response** (201):
   ```json
   {
     "access_token": "eyJhbGc...",
     "user": {
       "Id_usuario": 69314746,
       "correo": "admin@example.com",
       "nombre": "Admin",
       "Id_rol": 2,
       "empresa_id": 1
     }
   }
   ```

2. **Create a new shift template**:
   ```bash
   curl -X POST http://localhost:3001/api/plantillas-turno \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "empresa_id": 1,
       "nombre": "Vigilancia Diurna",
       "hora_inicio": "08:00:00",
       "hora_fin": "16:00:00",
       "es_nocturno": false,
       "patron_recurrencia": "L-V"
     }'
   ```

   **Expected Response** (201):
   ```json
   {
     "mensaje": "Plantilla creada exitosamente",
     "plantilla": {
       "id": 1,
       "empresa_id": 1,
       "nombre": "Vigilancia Diurna",
       "hora_inicio": "08:00:00",
       "hora_fin": "16:00:00",
       "duracion_minutos": 480,
       "es_nocturno": false,
       "patron_recurrencia": "L-V",
       "creado_en": "2026-09-15T14:30:00.000Z"
     }
   }
   ```

3. **Verify in database**:
   ```sql
   SELECT * FROM plantillas_turno WHERE empresa_id = 1;
   ```

**Success Criteria**:
- ✅ Response 201 received
- ✅ Plantilla object returned with all fields
- ✅ `duracion_minutos` calculated correctly (16:00 - 08:00 = 480 minutes)
- ✅ Record appears in database

---

### Test Scenario 2: List Shift Templates (Listar Mallas)

**Objective**: Retrieve all shift templates for a company

**Steps**:

1. **List all templates for company 1**:
   ```bash
   curl -X GET http://localhost:3001/api/plantillas-turno?empresa_id=1 \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

   **Expected Response** (200):
   ```json
   {
     "total": 1,
     "plantillas": [
       {
         "id": 1,
         "empresa_id": 1,
         "nombre": "Vigilancia Diurna",
         "hora_inicio": "08:00:00",
         "hora_fin": "16:00:00",
         "duracion_minutos": 480,
         "es_nocturno": false,
         "patron_recurrencia": "L-V",
         "creado_en": "2026-09-15T14:30:00.000Z"
       }
     ]
   }
   ```

**Success Criteria**:
- ✅ Response 200 received
- ✅ Array of plantillas returned
- ✅ Total count matches actual templates
- ✅ All fields populated correctly

---

### Test Scenario 3: Get Single Template Details

**Objective**: Retrieve details for a specific shift template

**Steps**:

1. **Get template by ID**:
   ```bash
   curl -X GET http://localhost:3001/api/plantillas-turno/1 \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

   **Expected Response** (200):
   ```json
   {
     "plantilla": {
       "id": 1,
       "empresa_id": 1,
       "nombre": "Vigilancia Diurna",
       "hora_inicio": "08:00:00",
       "hora_fin": "16:00:00",
       "duracion_minutos": 480,
       "es_nocturno": false,
       "patron_recurrencia": "L-V",
       "creado_en": "2026-09-15T14:30:00.000Z",
       "usos": 0
     }
   }
   ```

**Success Criteria**:
- ✅ Response 200 received
- ✅ Single plantilla object returned
- ✅ `usos` field shows count of shifts using this template (0 initially)

---

### Test Scenario 4: Update Shift Template (Editar Malla)

**Objective**: Modify an existing shift template

**Steps**:

1. **Update the template (change times)**:
   ```bash
   curl -X PUT http://localhost:3001/api/plantillas-turno/1 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "nombre": "Vigilancia Diurna Modificada",
       "hora_inicio": "07:00:00",
       "hora_fin": "15:00:00"
     }'
   ```

   **Expected Response** (200):
   ```json
   {
     "mensaje": "Plantilla actualizada exitosamente",
     "plantilla": {
       "id": 1,
       "empresa_id": 1,
       "nombre": "Vigilancia Diurna Modificada",
       "hora_inicio": "07:00:00",
       "hora_fin": "15:00:00",
       "duracion_minutos": 480,
       "es_nocturno": false,
       "patron_recurrencia": "L-V",
       "creado_en": "2026-09-15T14:30:00.000Z"
     }
   }
   ```

2. **Verify update in database**:
   ```sql
   SELECT * FROM plantillas_turno WHERE id = 1;
   ```

**Success Criteria**:
- ✅ Response 200 received
- ✅ Updated plantilla returned
- ✅ All changes reflected
- ✅ `duracion_minutos` recalculated if times changed

---

### Test Scenario 5: Access Control Test

**Objective**: Verify only Admin Empresa (2) and Super Admin (1) can create/edit

**Steps**:

1. **Try to create template as Planificador (role 3)**:
   - Login as: `planificador@example.com`
   - Try POST request to create template
   
   **Expected Response** (403):
   ```json
   {
     "error": "Acceso denegado: Solo Admin Empresa o Super Admin pueden crear plantillas"
   }
   ```

2. **Try to create template as Empleado (role 5)**:
   - Login as: `empleado@example.com`
   - Try POST request
   
   **Expected Response** (403):
   ```json
   {
     "error": "Acceso denegado: Solo Admin Empresa o Super Admin pueden crear plantillas"
   }
   ```

**Success Criteria**:
- ✅ Response 403 for non-admin users
- ✅ Error message clear and consistent
- ✅ Data not modified

---

### Test Scenario 6: Company Isolation Test

**Objective**: Verify users can only access templates from their company

**Steps**:

1. **Create template for company 1** (as admin@example.com):
   ```bash
   curl -X POST http://localhost:3001/api/plantillas-turno \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN_COMPANY1" \
     -d '{
       "empresa_id": 1,
       "nombre": "Template Empresa 1",
       "hora_inicio": "09:00:00",
       "hora_fin": "17:00:00"
     }'
   ```

2. **Try to access with user from company 2**:
   - Login as admin from company 2
   - Try to GET template from company 1
   
   **Expected Response** (403):
   ```json
   {
     "error": "Acceso denegado: No tiene permiso para esta plantilla"
   }
   ```

**Success Criteria**:
- ✅ Response 403 when accessing other company's data
- ✅ Multi-tenant isolation working

---

### Test Scenario 7: Validation Test

**Objective**: Verify input validation works correctly

**Test 7A - Invalid time format**:

```bash
curl -X POST http://localhost:3001/api/plantillas-turno \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "empresa_id": 1,
    "nombre": "Template",
    "hora_inicio": "8:00",
    "hora_fin": "16:00"
  }'
```

**Expected Response** (400):
```json
{
  "error": "Formato de hora_inicio inválido. Use HH:MM:SS",
  "valor_recibido": "8:00"
}
```

**Test 7B - Missing required fields**:

```bash
curl -X POST http://localhost:3001/api/plantillas-turno \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nombre": "Template"
  }'
```

**Expected Response** (400):
```json
{
  "error": "Faltan campos requeridos: empresa_id, nombre, hora_inicio, hora_fin",
  "details": {
    "empresa_id": "Requerido",
    "nombre": "OK",
    "hora_inicio": "Requerido",
    "hora_fin": "Requerido"
  }
}
```

**Test 7C - Invalid time range (fin before inicio)**:

```bash
curl -X POST http://localhost:3001/api/plantillas-turno \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "empresa_id": 1,
    "nombre": "Template",
    "hora_inicio": "16:00:00",
    "hora_fin": "08:00:00"
  }'
```

**Expected Response** (400):
```json
{
  "error": "La hora de fin debe ser posterior a la hora de inicio",
  "hora_inicio": "16:00:00",
  "hora_fin": "08:00:00"
}
```

**Success Criteria**:
- ✅ All validation errors caught
- ✅ Clear error messages provided
- ✅ Specific field information included

---

### Test Scenario 8: Delete Template (Eliminar Malla)

**Objective**: Verify template deletion works and respects constraints

**Test 8A - Delete unused template**:

```bash
curl -X DELETE http://localhost:3001/api/plantillas-turno/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (200):
```json
{
  "mensaje": "Plantilla eliminada exitosamente",
  "id": 1
}
```

**Test 8B - Try to delete template with active shifts**:

1. Create a shift using template ID 2
2. Try to delete template 2:

```bash
curl -X DELETE http://localhost:3001/api/plantillas-turno/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (400):
```json
{
  "error": "No se puede eliminar: Esta plantilla tiene turnos asociados",
  "turnos_asociados": 1
}
```

**Success Criteria**:
- ✅ Unused templates deleted successfully
- ✅ Cannot delete templates with active shifts
- ✅ Error message indicates reason

---

## 🔍 Database Verification Queries

### Verify template creation:
```sql
SELECT * FROM plantillas_turno WHERE empresa_id = 1 ORDER BY creado_en DESC;
```

### Verify audit log:
```sql
SELECT usuario_id, accion, tabla_objetivo, detalles, creado_en 
FROM registros_auditoria 
WHERE tabla_objetivo = 'plantillas_turno' 
ORDER BY creado_en DESC 
LIMIT 10;
```

### Check template usage:
```sql
SELECT p.id, p.nombre, COUNT(i.id) as turnos_asociados
FROM plantillas_turno p
LEFT JOIN instancias_turno i ON p.id = i.plantilla_id
WHERE p.empresa_id = 1
GROUP BY p.id;
```

### Verify company isolation:
```sql
SELECT DISTINCT empresa_id FROM plantillas_turno;
```

---

## ⚠️ Known Limitations

1. **Recurrence Pattern**: `patron_recurrencia` field stored but not used in Phase 2
   - Will be used in Phase 5+ for advanced scheduling
   
2. **No Validation of Specialty Requirements**: 
   - Templates don't specify required specialties yet
   - This will be added in Phase 4

3. **No Template Cloning**:
   - Currently must create templates manually
   - Bulk operations not available yet

4. **No Template Versioning**:
   - Updates don't preserve version history
   - Consider for future enhancement

---

## 🛠️ Troubleshooting

### "Plantilla no encontrada" (Template not found)

**Problem**: Getting 404 when accessing template ID

**Solutions**:
1. Verify template ID exists: `SELECT id FROM plantillas_turno;`
2. Check you're using correct company_id
3. Verify you're not accessing another company's template

---

### "Acceso denegado: No tiene permiso"

**Problem**: Getting 403 even as Admin

**Solutions**:
1. Verify your user has `Id_rol = 2` (Admin Empresa)
2. Check `empresa_id` in JWT matches template's company
3. Super Admin (Id_rol = 1) can access any company

---

### "Faltan campos requeridos"

**Problem**: Getting validation error

**Solutions**:
1. Ensure `empresa_id`, `nombre`, `hora_inicio`, `hora_fin` all provided
2. Use format `HH:MM:SS` for times (e.g., `08:00:00`, not `8:00`)
3. `es_nocturno` and `patron_recurrencia` optional

---

### Audit logs not showing

**Problem**: Changes made but no audit trail

**Solutions**:
1. Verify `registros_auditoria` table exists: `SHOW TABLES LIKE 'registros_auditoria';`
2. Check query: `SELECT * FROM registros_auditoria ORDER BY creado_en DESC LIMIT 5;`
3. Verify action name: `crear_plantilla_turno`, `actualizar_plantilla_turno`, `eliminar_plantilla_turno`

---

## 📊 Expected Results Summary

| Test | Endpoint | Method | Status | Response |
|------|----------|--------|--------|----------|
| Create Template | POST /plantillas-turno | POST | 201 | Plantilla object |
| List Templates | GET /plantillas-turno?empresa_id=1 | GET | 200 | Array of plantillas |
| Get Single | GET /plantillas-turno/:id | GET | 200 | Single plantilla |
| Update | PUT /plantillas-turno/:id | PUT | 200 | Updated plantilla |
| Delete (unused) | DELETE /plantillas-turno/:id | DELETE | 200 | Success message |
| Delete (with shifts) | DELETE /plantillas-turno/:id | DELETE | 400 | Error: in use |
| Access Control | POST /plantillas-turno (as Planificador) | POST | 403 | Access denied |
| Company Isolation | GET /plantillas-turno/:id (other co) | GET | 403 | Access denied |
| Validation | POST (invalid format) | POST | 400 | Error details |

---

## ✅ Testing Checklist

- [ ] All 5 endpoints responding
- [ ] Correct HTTP status codes
- [ ] All required fields validated
- [ ] Time format validation working
- [ ] Access control enforced
- [ ] Company isolation verified
- [ ] Audit logs created
- [ ] Database records correct
- [ ] Error messages clear
- [ ] Duration calculated correctly

---

**Next Steps**:
1. Run all test scenarios
2. Verify database records
3. Check audit logs
4. Integrate with frontend forms
5. Proceed to Phase 3 (Employee Management)

