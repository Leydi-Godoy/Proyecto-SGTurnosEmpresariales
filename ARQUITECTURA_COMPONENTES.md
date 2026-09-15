# 🏗️ Arquitectura y Componentes - Dashboard Empleados

**Fecha:** 15 de Septiembre de 2026  
**Proyecto:** SGTurnos Empresariales  
**Módulo:** Dashboard Empleados (Emple5)  

---

## 📐 Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
│                       App.jsx                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ├─ Login.jsx (no change)
                     ├─ PasswordReset.jsx (no change)
                     └─ EmpleadoDashboard.jsx ✅ NEW
                            │
                            ├─ HomePanel.jsx ✅ UPDATED
                            ├─ CalendarTurns.jsx ✅ UPDATED
                            ├─ Novedades.jsx ✅ UPDATED
                            └─ EditProfile.jsx ✅ UPDATED
                            
                     
                    Backend API (Node.js/Express)
                            │
                            ├─ /api/auth/me (GET/PUT)
                            ├─ /api/auth/me/change-password (POST)
                            ├─ /api/empleado/turnos (GET)
                            └─ /api/empleado/novedades (GET/POST)
```

---

## 🧩 Componentes React

### 1. **EmpleadoDashboard.jsx** (Contenedor Principal)
```
┌────────────────────────────────────────────────┐
│          EmpleadoDashboard                      │
│         (Componente Contenedor)                │
│                                                 │
│  Props:                                        │
│  └─ onLogout (function)                       │
│                                                 │
│  State:                                        │
│  └─ activeTab: 'inicio' | 'calendario'        │
│                | 'novedades' | 'perfil'       │
│                                                 │
│  Hijos:                                        │
│  ├─ HomePanel (siempre visible)              │
│  └─ Módulo activo dinámico                   │
│                                                 │
│  Funcionalidad:                                │
│  └─ Navegación entre módulos                 │
│                                                 │
└────────────────────────────────────────────────┘

Archivos:
- Ubicación: frontend/src/components/EmpleadoDashboard.jsx
- Líneas: 65
- Responsabilidades:
  1. Gestionar tab activo
  2. Renderizar HomePanel
  3. Renderizar módulo según tab
  4. Pasar onLogout a HomePanel
```

---

### 2. **HomePanel.jsx** (Header Sticky)
```
┌─────────────────────────────────────────────────────┐
│              HomePanel (Header)                      │
│             (Componente Presentacional)              │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ [Logo]  Hola, Eduardo Felipe Soto Cardozo  │    │
│  │         Empresa: Acme | 🟢 Activo          │ -  │
│  │         Rol: Emple5                         │    │
│  └─────────────────────────────────────────────┘    │
│                            [Cerrar sesión] ✖️       │
│                                                       │
│  Props:                                             │
│  └─ onLogout (function)                             │
│                                                       │
│  State:                                             │
│  ├─ profile (user data)                            │
│  └─ loading (boolean)                              │
│                                                       │
│  API:                                               │
│  └─ GET /api/auth/me                               │
│                                                       │
│  Datos Obtenidos:                                   │
│  ├─ primer_nombre, segundo_nombre                  │
│  ├─ primer_apellido, segundo_apellido              │
│  ├─ email, telefono                                │
│  ├─ Id_rol, activo                                 │
│  ├─ empresa_nombre, empresa_logo                   │
│  └─ empresa_sigla                                  │
│                                                       │
└─────────────────────────────────────────────────────┘

Archivos:
- Ubicación: frontend/src/components/HomePanel.jsx
- Líneas: 75
- Responsabilidades:
  1. Obtener datos del usuario
  2. Mostrar información personalizada
  3. Mostrar empresa
  4. Manejar logout
```

---

### 3. **CalendarTurns.jsx** (Módulo 2)
```
┌──────────────────────────────────────────────────┐
│         CalendarTurns (Módulo Turnos)             │
│        (Componente Contenedor + Lógica)          │
│                                                   │
│  [Todos] [Próximos] [Pasados]                   │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  20   Lunes, 20 de septiembre de 2026   │    │
│  │ Sep   ⏱️ 08:00 - 16:00                   │    │
│  │       Turno diurno - Producción         │    │
│  │       🟢 Activo                          │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │  21   Martes, 21 de septiembre de 2026  │    │
│  │ Sep   ⏱️ 16:00 - 23:59                   │    │
│  │       Turno nocturno - Vigilancia       │    │
│  │       🟢 Activo                          │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  State:                                          │
│  ├─ turnos (array)                              │
│  ├─ loading (boolean)                           │
│  ├─ error (string)                              │
│  └─ filtro ('todos'|'proximos'|'pasados')       │
│                                                   │
│  API:                                            │
│  └─ GET /api/empleado/turnos                    │
│                                                   │
│  Funcionalidad:                                  │
│  ├─ Cargar turnos                               │
│  ├─ Filtrar por estado                          │
│  ├─ Ordenar por fecha                           │
│  └─ Mostrar tarjetas interactivas               │
│                                                   │
└──────────────────────────────────────────────────┘

Archivos:
- Ubicación: frontend/src/components/CalendarTurns.jsx
- Líneas: 130
- Responsabilidades:
  1. Obtener turnos del API
  2. Filtrar turnos
  3. Renderizar lista
  4. Mostrar información de turno
```

---

### 4. **Novedades.jsx** (Módulo 3)
```
┌──────────────────────────────────────────────────────────┐
│       Novedades (Módulo Solicitudes)                      │
│      (Componente Contenedor + Lógica Compleja)            │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Tipo: [Cambio de turno ▼]                        │    │
│  │ Fecha: [____/____/____]                          │    │
│  │ Descripción:                                     │    │
│  │ ┌────────────────────────────────────────────┐  │    │
│  │ │ Texto...                                  │  │    │
│  │ └────────────────────────────────────────────┘  │    │
│  │ [Enviar solicitud]                              │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  [Todas] [Pendientes] [Aprobadas] [Rechazadas]          │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ CAMBIO DE TURNO              🟡 PENDIENTE        │    │
│  │ Solicito cambiar mi turno...                     │    │
│  │ Enviado: 15/09/2026 14:30                        │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  State:                                                   │
│  ├─ novedades (array)                                   │
│  ├─ form (object)                                       │
│  ├─ loading (boolean)                                   │
│  ├─ error, success (strings)                           │
│  ├─ showForm (boolean)                                 │
│  └─ filtroEstado (string)                              │
│                                                            │
│  APIs:                                                   │
│  ├─ GET /api/empleado/novedades                        │
│  └─ POST /api/empleado/novedades                       │
│                                                            │
│  Funcionalidad:                                          │
│  ├─ Crear solicitud (POST)                             │
│  ├─ Obtener solicitudes (GET)                          │
│  ├─ Filtrar por estado                                 │
│  ├─ Validar formulario                                 │
│  └─ Mostrar mensajes                                    │
│                                                            │
└──────────────────────────────────────────────────────────┘

Archivos:
- Ubicación: frontend/src/components/Novedades.jsx
- Líneas: 180
- Responsabilidades:
  1. Crear nuevas solicitudes
  2. Obtener historial
  3. Filtrar por estado
  4. Validar datos
  5. Manejar errores
```

---

### 5. **EditProfile.jsx** (Módulo 4)
```
┌──────────────────────────────────────────────────────┐
│      EditProfile (Módulo Perfil)                      │
│    (Componente Contenedor + Lógica Seguridad)         │
│                                                        │
│  INFORMACIÓN PERSONAL:                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ Primer nombre:    [Eduardo]                  │   │
│  │ Segundo nombre:   [Felipe]                   │   │
│  │ Primer apellido:  [Soto]                     │   │
│  │ Segundo apellido: [Cardozo]                  │   │
│  │ Email:            [ej@empresa.com]          │   │
│  │ Teléfono:         [+57 300 1234567]         │   │
│  │                                              │   │
│  │ [Guardar cambios]                            │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  SEGURIDAD:                     [Cambiar contraseña] │
│  ┌──────────────────────────────────────────────┐   │
│  │ Contraseña actual: [••••••••]                │   │
│  │ Nueva contraseña: [••••••••]                 │   │
│  │ Confirmar: [••••••••]                        │   │
│  │                                              │   │
│  │ [Cambiar contraseña]  [Cancelar]             │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  State:                                              │
│  ├─ profile (user data)                             │
│  ├─ edit (form data)                                │
│  ├─ passwordForm (form data)                        │
│  ├─ msg (message)                                   │
│  ├─ msgType ('error'|'success')                     │
│  ├─ loading, enviando (booleans)                    │
│  └─ showPasswordForm (boolean)                      │
│                                                        │
│  APIs:                                               │
│  ├─ GET /api/auth/me                                │
│  ├─ PUT /api/auth/me                                │
│  └─ POST /api/auth/me/change-password               │
│                                                        │
│  Funcionalidad:                                      │
│  ├─ Cargar datos personales                         │
│  ├─ Actualizar datos                                │
│  ├─ Cambiar contraseña                              │
│  ├─ Validar contraseñas                             │
│  └─ Mostrar feedback                                │
│                                                        │
└──────────────────────────────────────────────────────┘

Archivos:
- Ubicación: frontend/src/components/EditProfile.jsx
- Líneas: 160
- Responsabilidades:
  1. Cargar datos del usuario
  2. Actualizar perfil
  3. Cambiar contraseña
  4. Validar contraseña actual
  5. Manejar seguridad
```

---

## 📦 Datos y APIs

### Estado (State) Global Requerido
```javascript
// En App.jsx (ya existe)
{
  user: {
    id,
    nombre,
    email,
    Id_rol,
    empresa,
    activo
  },
  token: string
}
```

### APIs por Componente

#### HomePanel
```
GET /api/auth/me
├─ Headers: Authorization: Bearer token
├─ Response: {
│   user: {
│     id, nombre, email, telefono,
│     Id_rol, activo,
│     empresa_id, empresa_nombre, empresa_logo
│   }
│ }
└─ Triggers: onMount
```

#### CalendarTurns
```
GET /api/empleado/turnos
├─ Headers: Authorization: Bearer token
├─ Query: ?filtro=todos|proximos|pasados
├─ Response: {
│   turnos: [{
│     id, fecha, inicio, fin,
│     descripcion, origen, estado
│   }]
│ }
└─ Triggers: onMount, onChange filtro
```

#### Novedades
```
GET /api/empleado/novedades
├─ Headers: Authorization: Bearer token
├─ Query: ?estado=pendiente|aprobado|rechazado
├─ Response: {
│   novedades: [{
│     id, tipo, descripcion, fecha_solicitada,
│     detalles_adicionales, estado,
│     created_at, respondido_en
│   }]
│ }
└─ Triggers: onMount, onChange filtro

POST /api/empleado/novedades
├─ Headers: Authorization: Bearer token
├─ Body: {
│   tipo, descripcion, fecha_solicitada,
│   detalles_adicionales
│ }
├─ Response: { message, novedad: {...} }
└─ Triggers: onSubmit formulario
```

#### EditProfile
```
GET /api/auth/me
├─ Obtener datos iniciales
└─ Triggers: onMount

PUT /api/auth/me
├─ Body: {
│   primer_nombre, segundo_nombre,
│   primer_apellido, segundo_apellido,
│   email, telefono
│ }
└─ Triggers: onSubmit formulario

POST /api/auth/me/change-password
├─ Body: {
│   oldPassword, newPassword, confirmPassword
│ }
└─ Triggers: onSubmit formulario contraseña
```

---

## 🎨 Estilos CSS

### Estructura CSS
```
App.css
├─ Global styles (variables, auth, login)
├─ Dashboard styles
├─ Empleado Dashboard styles
│  ├─ .empleado-dashboard
│  ├─ .home-panel
│  ├─ .panel (y variantes)
│  ├─ .calendar-turns-panel
│  ├─ .novedades-panel
│  ├─ .edit-profile-panel
│  ├─ Filter buttons
│  ├─ Form elements
│  ├─ Feedback messages
│  └─ Responsive media queries
└─ Responsive styles (@media)
```

### Clases CSS Principales
```
.empleado-dashboard      - Contenedor principal
.home-panel             - Header sticky
.panel                  - Paneles generales
.panel-heading          - Encabezado de panel
.filter-buttons         - Botones de filtro
.turno-item            - Tarjeta de turno
.novedad-item          - Tarjeta de solicitud
.form-group            - Grupo de formulario
.feedback              - Mensajes de retroalimentación
.button-primary        - Botones principales
.button-secondary      - Botones secundarios
.status-badge          - Badges de estado
```

---

## 🔄 Flujo de Datos

### Flujo de Login hasta Dashboard

```
1. Usuario ingresa credenciales
   ↓
2. Login.jsx hace POST /api/login
   ↓
3. Backend retorna token JWT
   ↓
4. App.jsx almacena token y user en localStorage
   ↓
5. App.jsx detecta rol = 'Emple5'
   ↓
6. Renderiza <EmpleadoDashboard />
   ↓
7. HomePanel carga datos de GET /api/auth/me
   ↓
8. Muestra panel de control
```

### Flujo de Navegación entre Módulos

```
EmpleadoDashboard (activeTab)
    ↓
    ├─ activeTab = 'inicio' → Panel de control
    ├─ activeTab = 'calendario' → CalendarTurns
    ├─ activeTab = 'novedades' → Novedades
    └─ activeTab = 'perfil' → EditProfile
    
Usuario hace clic en botón:
    ↓
setActiveTab(newTab) ejecuta
    ↓
Componente remontado con nuevos datos
    ↓
useEffect carga datos del API
```

---

## 📊 Tamaño del Código

| Archivo | Líneas | Tipo |
|---------|--------|------|
| HomePanel.jsx | 75 | Componente |
| CalendarTurns.jsx | 130 | Componente |
| Novedades.jsx | 180 | Componente |
| EditProfile.jsx | 160 | Componente |
| EmpleadoDashboard.jsx | 65 | Contenedor |
| App.css (adiciones) | 500+ | Estilos |
| **Total** | **1,100+** | **~2,000 con comentarios** |

---

## ✅ Validaciones Implementadas

### Validaciones en Frontend
- ✅ Campos obligatorios en formularios
- ✅ Formato de email válido
- ✅ Contraseña ≥ 8 caracteres
- ✅ Confirmación de contraseña
- ✅ Tipo de solicitud válido
- ✅ Fecha no puede ser anterior a hoy

### Validaciones Pendientes (Backend)
- ⏳ Email único en base de datos
- ⏳ Contraseña actual correcta
- ⏳ Autorización (solo ver datos propios)
- ⏳ Rol validado (Emple5 solo)
- ⏳ Estado del empleado (activo)

---

## 🔐 Seguridad Implementada

### Frontend
✅ JWT en headers Authorization  
✅ Token almacenado en localStorage  
✅ Validación de campos  
✅ Mensajes de error no sensibles  
✅ No exponer datos sensitivos en console  

### Backend (Requerido)
⏳ HTTPS en producción  
⏳ CORS configurado  
⏳ Rate limiting  
⏳ Sanitización de entrada  
⏳ Hash de contraseñas  
⏳ Verificación de permisos  

---

## 📱 Responsive Breakpoints

```css
/* Desktop (default) */
.panel { max-width: 1220px; }

/* Tablet */
@media (max-width: 1024px) {
  .home-panel { flex-direction: column; }
  .edit-profile-form { grid-template-columns: 1fr; }
}

/* Mobile */
@media (max-width: 720px) {
  .home-panel { padding: 20px 16px; }
  .panel { padding: 16px; }
  .button-primary { width: 100%; }
  .novedad-form { grid-template-columns: 1fr; }
}
```

---

## 🚀 Deployment Checklist

- [ ] Variables de entorno configuradas
- [ ] Base de datos actualizada
- [ ] Endpoints backend validados
- [ ] HTTPS activo
- [ ] CORS configurado
- [ ] Rate limiting configurado
- [ ] Logs configurados
- [ ] Monitoreo activo
- [ ] Backup de BD
- [ ] Plan de rollback

---

**Última actualización:** 15 de Septiembre de 2026  
**Versión:** 1.0  
**Autor:** Equipo de Frontend
