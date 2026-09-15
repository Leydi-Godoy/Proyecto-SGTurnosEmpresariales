# 👁️ Plan: Dashboard del Supervisor

## Rol y Permisos
- **Rol:** `supvi4` / `supervisor` / ID = 4
- **Alcance:** Nivel empresa + su área/departamento
- **Acceso:** Solo su equipo

## Permisos Clave
✅ Ver empleados de su área
✅ Aprobar/rechazar novedades
✅ Ver cobertura de su equipo
✅ Generar reportes del equipo
✅ Ver historial de cambios
✅ Enviar notificaciones al equipo

---

## Módulos del Dashboard (4 tabs)

### 1️⃣ **INICIO (Home)**
Panel bienvenida con:
- Logo empresa + nombre
- Saludo personalizado
- Estadísticas: novedades pendientes, empleados activos, cobertura hoy
- Acceso rápido a aprobar novedades
- Logout

### 2️⃣ **NOVEDADES Y APROBACIONES (Solicitudes)**
Gestión de solicitudes del equipo:
- **Ver novedades por estado:**
  - Pendientes (amarillo) - requieren acción
  - Aprobadas (verde) - ya procesadas
  - Rechazadas (rojo) - denegadas

- **Funcionalidades:**
  - Listar novedades de empleados del área
  - Filtrar por tipo (cambio turno, permiso, incapacidad, licencia)
  - Filtrar por estado
  - Ver detalles completos
  - **Aprobar solicitud** (cambiar a aprobada)
  - **Rechazar solicitud** (cambiar a rechazada + motivo)
  - Agregar comentario/justificación
  - Ver historial de aprobaciones

- **Información mostrada:**
  - Empleado (nombre, área)
  - Tipo de solicitud
  - Descripción
  - Fecha solicitada
  - Estado actual
  - Botones de acción (Aprobar/Rechazar)

### 3️⃣ **MI EQUIPO (Team)**
Gestión de empleados del área:
- **Ver empleados:**
  - Nombre completo
  - Área/departamento
  - Estado (activo/permiso/incapacidad)
  - Próximo turno
  - Disponibilidad
  - Última novedad

- **Funcionalidades:**
  - Listar empleados de su área
  - Buscar/filtrar por nombre
  - Ver disponibilidad por día
  - Ver turnos del mes
  - Ver historial de cambios
  - Filtrar por estado

- **Información detallada (al hacer clic):**
  - Perfil completo
  - Turnos del mes
  - Novedades (solicitudes)
  - Días de permiso/incapacidad

### 4️⃣ **REPORTES (Reports)**
Reportes de cobertura y equipo:
- **Reportes disponibles:**
  - Cobertura por día (% cobertura del área)
  - Disponibilidad de empleados
  - Novedades aprobadas/rechazadas
  - Ausencias por motivo
  - Historial de cambios

- **Funcionalidades:**
  - Filtrar por período
  - Exportar a CSV
  - Ver gráficas simples
  - Imprimir

---

## Estructura de Componentes React

```
frontend/src/components/
├── SupervisorDashboard.jsx (Main container)
├── SupervisorHome.jsx (Tab Inicio)
├── NovedadesAprobacion.jsx (Tab Novedades)
├── MiEquipo.jsx (Tab Equipo)
└── ReportesSupervisor.jsx (Tab Reportes)
```

---

## Endpoints API Requeridos

### 1. Novedades
- `GET /api/supervisor/novedades?estado=pendiente` - Novedades del área
- `POST /api/supervisor/novedades/:id/aprobar` - Aprobar
- `POST /api/supervisor/novedades/:id/rechazar` - Rechazar con motivo

### 2. Empleados del Área
- `GET /api/supervisor/empleados` - Empleados de su área
- `GET /api/supervisor/empleados/:id` - Detalles empleado
- `GET /api/supervisor/empleados/:id/turnos` - Turnos del empleado

### 3. Cobertura
- `GET /api/supervisor/cobertura` - Cobertura del área
- `GET /api/supervisor/cobertura/:fecha` - Cobertura de un día

### 4. Reportes
- `GET /api/supervisor/reportes/disponibilidad` - Reporte disponibilidad
- `GET /api/supervisor/reportes/ausencias` - Reporte ausencias

---

## Estado (useState)

```javascript
// Novedades
const [novedades, setNovedades] = useState([])
const [filtroEstado, setFiltroEstado] = useState('pendiente')
const [filtroTipo, setFiltroTipo] = useState('todos')

// Equipo
const [empleados, setEmpleados] = useState([])
const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)

// Reportes
const [tipoReporte, setTipoReporte] = useState('cobertura')
const [reporteData, setReporteData] = useState(null)

// General
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [success, setSuccess] = useState('')
```

---

## Colores y Estilos

- **Fondo:** var(--space-black) #0a0e27
- **Paneles:** var(--night-blue) #1a2847
- **Acentos:** var(--electric-cyan) #0fc1f9
- **Estados:**
  - Pendiente: Naranja #f59e0b
  - Aprobado: Verde #22c55e
  - Rechazado: Rojo #ef4444
  - Activo empleado: Verde #22c55e
  - En permiso: Azul #3b82f6

---

## Flujo Principal

```
1. Supervisor inicia sesión (ID=4)
2. Ve panel de bienvenida con novedades pendientes
3. Clica en "Novedades y Aprobaciones"
4. Ve lista de solicitudes pendientes
5. Clica en una solicitud
6. Decide: Aprobar o Rechazar
7. Sistema actualiza estado
8. Ve "Mi Equipo" para monitorear disponibilidad
9. Genera reportes de su área
10. Cierra sesión
```

---

## Siguiente Paso

Crear 4 componentes + CSS + integración en App.jsx
