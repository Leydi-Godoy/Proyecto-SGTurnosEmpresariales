# 🔌 Endpoints API - Dashboard Empleados

## Base URL
```
http://localhost:3000/api
```

## Headers Requeridos
```json
{
  "Authorization": "Bearer <token_jwt>",
  "Content-Type": "application/json"
}
```

---

## 👤 Autenticación y Perfil

### GET /auth/me
**Descripción:** Obtener datos del usuario actual

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "primer_nombre": "Eduardo",
    "segundo_nombre": "Felipe",
    "primer_apellido": "Soto",
    "segundo_apellido": "Cardozo",
    "email": "eduardo.soto@empresa.com",
    "telefono": "+57 300 1234567",
    "Id_rol": "Emple5",
    "activo": true,
    "empresa_id": 1,
    "empresa_nombre": "Acme Corp",
    "empresa_logo": "/logos/acme.png",
    "empresa_sigla": "ACME"
  }
}
```

---

### PUT /auth/me
**Descripción:** Actualizar datos personales del usuario

**Request Body:**
```json
{
  "primer_nombre": "Eduardo",
  "segundo_nombre": "Felipe",
  "primer_apellido": "Soto",
  "segundo_apellido": "Cardozo",
  "email": "new.email@empresa.com",
  "telefono": "+57 301 9876543"
}
```

**Response (200):**
```json
{
  "message": "Perfil actualizado exitosamente",
  "user": {
    "id": 1,
    "primer_nombre": "Eduardo",
    "segundo_nombre": "Felipe",
    "primer_apellido": "Soto",
    "segundo_apellido": "Cardozo",
    "email": "new.email@empresa.com",
    "telefono": "+57 301 9876543"
  }
}
```

**Error (400):**
```json
{
  "error": "El correo ya está registrado"
}
```

---

### POST /auth/me/change-password
**Descripción:** Cambiar contraseña del usuario

**Request Body:**
```json
{
  "oldPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña_123",
  "confirmPassword": "nueva_contraseña_123"
}
```

**Response (200):**
```json
{
  "message": "Contraseña cambiada exitosamente"
}
```

**Error (400):**
```json
{
  "error": "La contraseña actual es incorrecta"
}
```

**Error (400):**
```json
{
  "error": "Las contraseñas no coinciden"
}
```

**Error (400):**
```json
{
  "error": "La contraseña debe tener al menos 8 caracteres"
}
```

---

## 📅 Turnos

### GET /empleado/turnos
**Descripción:** Obtener todos los turnos asignados al empleado

**Query Parameters:**
```
?filtro=todos|proximos|pasados  (opcional)
?limit=10                         (opcional)
?offset=0                         (opcional)
```

**Response (200):**
```json
{
  "turnos": [
    {
      "id": 1,
      "fecha": "2026-09-20",
      "inicio": "08:00",
      "fin": "16:00",
      "descripcion": "Turno diurno - Producción",
      "origen": "Sistema",
      "estado": "Activo",
      "empresa_id": 1,
      "empleado_id": 1
    },
    {
      "id": 2,
      "fecha": "2026-09-21",
      "inicio": "16:00",
      "fin": "23:59",
      "descripcion": "Turno nocturno - Vigilancia",
      "origen": "Asignación manual",
      "estado": "Activo",
      "empresa_id": 1,
      "empleado_id": 1
    }
  ],
  "total": 2,
  "pagina": 1
}
```

**Error (401):**
```json
{
  "error": "No autorizado"
}
```

---

## 📝 Novedades (Solicitudes)

### GET /empleado/novedades
**Descripción:** Obtener histórico de solicitudes del empleado

**Query Parameters:**
```
?estado=pendiente|aprobado|rechazado|en_proceso|todos  (opcional)
?tipo=cambio_turno|permiso|incapacidad|licencia|todos   (opcional)
?limit=20                                                (opcional)
?offset=0                                                (opcional)
```

**Response (200):**
```json
{
  "novedades": [
    {
      "id": 1,
      "tipo": "cambio_turno",
      "descripcion": "Necesito cambiar mi turno del 20 con Juan",
      "fecha_solicitada": "2026-09-20",
      "detalles_adicionales": "Información adicional si es necesaria",
      "estado": "pendiente",
      "empleado_id": 1,
      "empresa_id": 1,
      "created_at": "2026-09-15T14:30:00Z",
      "updated_at": "2026-09-15T14:30:00Z",
      "respuesta_admin": null,
      "respondido_en": null
    },
    {
      "id": 2,
      "tipo": "permiso",
      "descripcion": "Permiso para asuntos personales",
      "fecha_solicitada": "2026-09-18",
      "detalles_adicionales": null,
      "estado": "aprobado",
      "empleado_id": 1,
      "empresa_id": 1,
      "created_at": "2026-09-14T10:15:00Z",
      "updated_at": "2026-09-14T14:00:00Z",
      "respuesta_admin": "Aprobado",
      "respondido_en": "2026-09-14T14:00:00Z"
    }
  ],
  "total": 2,
  "pagina": 1
}
```

---

### POST /empleado/novedades
**Descripción:** Crear una nueva solicitud de novedad

**Request Body:**
```json
{
  "tipo": "cambio_turno",
  "descripcion": "Solicito cambiar mi turno del 20 de septiembre",
  "fecha_solicitada": "2026-09-20",
  "detalles_adicionales": "Preferencia: cambiar con Juan Pérez"
}
```

**Valores válidos para `tipo`:**
- `cambio_turno` - Cambio de turno
- `permiso` - Permiso
- `incapacidad` - Incapacidad/Enfermedad
- `licencia` - Licencia

**Response (201):**
```json
{
  "message": "Solicitud creada exitosamente",
  "novedad": {
    "id": 3,
    "tipo": "cambio_turno",
    "descripcion": "Solicito cambiar mi turno del 20 de septiembre",
    "fecha_solicitada": "2026-09-20",
    "detalles_adicionales": "Preferencia: cambiar con Juan Pérez",
    "estado": "pendiente",
    "empleado_id": 1,
    "empresa_id": 1,
    "created_at": "2026-09-15T15:45:00Z",
    "updated_at": "2026-09-15T15:45:00Z"
  }
}
```

**Error (400):**
```json
{
  "error": "El tipo de solicitud es inválido"
}
```

**Error (400):**
```json
{
  "error": "La descripción es obligatoria"
}
```

**Error (422):**
```json
{
  "error": "La fecha solicitada no puede ser anterior a hoy"
}
```

---

## 🔐 Códigos de Estado HTTP

| Código | Significado |
|--------|------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Error en los datos enviados |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - No tiene permisos |
| 404 | Not Found - Recurso no existe |
| 422 | Unprocessable Entity - Validación fallida |
| 500 | Internal Server Error - Error del servidor |

---

## 🧪 Ejemplos cURL

### Obtener datos del usuario
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

### Actualizar perfil
```bash
curl -X PUT http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "primer_nombre": "Juan",
    "segundo_nombre": "Carlos",
    "primer_apellido": "Pérez",
    "segundo_apellido": "López",
    "telefono": "+57 300 1234567"
  }'
```

### Cambiar contraseña
```bash
curl -X POST http://localhost:3000/api/auth/me/change-password \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "contraseña_actual",
    "newPassword": "nueva_contraseña_123",
    "confirmPassword": "nueva_contraseña_123"
  }'
```

### Obtener turnos
```bash
curl -X GET "http://localhost:3000/api/empleado/turnos?filtro=proximos" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Obtener novedades
```bash
curl -X GET "http://localhost:3000/api/empleado/novedades?estado=pendiente" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Crear novedad
```bash
curl -X POST http://localhost:3000/api/empleado/novedades \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "permiso",
    "descripcion": "Permiso para asuntos personales",
    "fecha_solicitada": "2026-09-18",
    "detalles_adicionales": "Volveré en 2 horas"
  }'
```

---

## 📊 Estructura de Datos

### Usuario
```javascript
{
  id: number,
  primer_nombre: string,
  segundo_nombre: string,
  primer_apellido: string,
  segundo_apellido: string,
  email: string,
  telefono: string,
  Id_rol: "Emple5" | "Admin" | "Manager",
  activo: boolean,
  empresa_id: number,
  empresa_nombre: string,
  empresa_logo: string,
  empresa_sigla: string,
  created_at: ISO8601,
  updated_at: ISO8601
}
```

### Turno
```javascript
{
  id: number,
  fecha: "YYYY-MM-DD",
  inicio: "HH:mm",
  fin: "HH:mm",
  descripcion: string,
  origen: string,
  estado: "Activo" | "Cancelado" | "Completado",
  empresa_id: number,
  empleado_id: number,
  created_at: ISO8601,
  updated_at: ISO8601
}
```

### Novedad (Solicitud)
```javascript
{
  id: number,
  tipo: "cambio_turno" | "permiso" | "incapacidad" | "licencia",
  descripcion: string,
  fecha_solicitada: "YYYY-MM-DD" | null,
  detalles_adicionales: string | null,
  estado: "pendiente" | "aprobado" | "rechazado" | "en_proceso",
  empleado_id: number,
  empresa_id: number,
  respuesta_admin: string | null,
  respondido_en: ISO8601 | null,
  created_at: ISO8601,
  updated_at: ISO8601
}
```

---

**Última actualización:** 15 de septiembre de 2026
**Versión de API:** v1.0
**Status:** En desarrollo
