# 📅 Plan: Dashboard del Planificador

## Roles y Permisos
- **Rol clave:** `planner` / `planificador` / `2`
- **Alcance:** Nivel empresa (toda la empresa)

## Permisos Clave
✅ create_schedule (crear mallas)
✅ edit_schedule (editar mallas)
✅ publish_schedule (publicar mallas)
✅ assign_shifts (asignar turnos)
✅ view_coverage (ver cobertura)
✅ export_schedule (exportar)

---

## Módulos del Dashboard (4 tabs)

### 1️⃣ **INICIO (Home)**
Panel bienvenida con:
- Logo empresa + nombre
- Saludo personalizado
- Estado general (turnos por asignar, cobertura %)
- Acceso rápido a funciones principales
- Logout

### 2️⃣ **MALLAS DE TURNOS (Scheduling)**
Gestión de calendarios de turnos:
- **Acciones:**
  - Crear nueva malla
  - Ver mallas existentes (lista/tabla)
  - Editar malla
  - Publicar/despublicar
  - Duplicar malla
  - Eliminar malla

- **Información mostrada:**
  - Nombre malla
  - Período (fecha inicio/fin)
  - Estado (borrador/publicada)
  - Cantidad turnos
  - Última modificación
  - Acciones (editar, publicar, ver detalles, eliminar)

### 3️⃣ **ASIGNACIÓN DE TURNOS (Assign Shifts)**
Asignación manual o automática de turnos:
- **Acciones:**
  - Ver malla seleccionada con grid de turnos
  - Arrastrar empleado a turno (drag & drop)
  - Asignación automática (algoritmo básico)
  - Buscar/filtrar empleados
  - Ver disponibilidad empleado
  - Desasignar turno
  - Validar cobertura

- **Información mostrada:**
  - Malla seleccionada
  - Grid: Empleados (filas) x Días (columnas)
  - Turnos con colores por tipo
  - Empleados disponibles (lista)
  - Indicador cobertura (%)

### 4️⃣ **REPORTES (Reports)**
Reportes operativos:
- **Reportes disponibles:**
  - Cobertura por día
  - Turnos por empleado
  - Disponibilidad por área/especialidad
  - Horas totales por empleado
  - Turnos sin asignar
  - Historial cambios

- **Funcionalidades:**
  - Filtrar por período
  - Filtrar por área/departamento
  - Exportar a CSV/Excel
  - Vista previa
  - Imprimir

---

## Estructura de Componentes React

```
frontend/src/components/
├── PlanificadorDashboard.jsx (Main container)
├── PlanificadorHome.jsx (Tab Inicio)
├── MallasTurnos.jsx (Tab Mallas)
├── AsignacionTurnos.jsx (Tab Asignación)
└── ReportesPlanificador.jsx (Tab Reportes)
```

---

## Endpoints API Requeridos

### 1. Mallas
- `GET /api/planificador/mallas` - Listar mallas
- `POST /api/planificador/mallas` - Crear malla
- `GET /api/planificador/mallas/:id` - Obtener detalles
- `PUT /api/planificador/mallas/:id` - Editar malla
- `DELETE /api/planificador/mallas/:id` - Eliminar
- `POST /api/planificador/mallas/:id/publish` - Publicar
- `POST /api/planificador/mallas/:id/duplicate` - Duplicar

### 2. Asignaciones
- `GET /api/planificador/turnos` - Listar turnos de malla
- `POST /api/planificador/turnos/asignar` - Asignar turno
- `DELETE /api/planificador/turnos/:id/desasignar` - Desasignar
- `POST /api/planificador/turnos/auto-asignar` - Asignación automática
- `GET /api/planificador/cobertura` - Obtener cobertura

### 3. Reportes
- `GET /api/planificador/reportes/cobertura` - Reporte cobertura
- `GET /api/planificador/reportes/empleados` - Reporte empleados
- `GET /api/planificador/reportes/turnos-sin-asignar` - Turnos vacíos
- `POST /api/planificador/reportes/exportar` - Exportar

### 4. Datos Auxiliares
- `GET /api/planificador/empleados` - Listar empleados activos
- `GET /api/planificador/areas` - Listar áreas/departamentos
- `GET /api/planificador/especialidades` - Listar especialidades

---

## Estado (useState)

```javascript
// Mallas
const [mallas, setMallas] = useState([])
const [mallaSeleccionada, setMallaSeleccionada] = useState(null)
const [showNuevaMalla, setShowNuevaMalla] = useState(false)
const [formMalla, setFormMalla] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' })

// Asignación
const [turnos, setTurnos] = useState([])
const [empleados, setEmpleados] = useState([])
const [cobertura, setCobertura] = useState({})

// Reportes
const [tipoReporte, setTipoReporte] = useState('cobertura')
const [reporteData, setReporteData] = useState(null)

// General
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [success, setSuccess] = useState('')
```

---

## Flujo de Datos (Diagrama ASCII)

```
┌─────────────────────────────────────────────────────┐
│  PLANIFICADOR DASHBOARD                             │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
    ┌───▼───┐  ┌──▼────┐  ┌──▼────┐  ┌─▼──────┐
    │ Inicio│  │Mallas │  │Asignar│  │Reportes│
    └───┬───┘  └──┬────┘  └──┬────┘  └─┬──────┘
        │         │          │         │
        │    ┌────▼─────┐    │         │
        │    │ GET Mallas   │    │         │
        │    │ POST Crear   │    │         │
        │    │ PUT Editar   │    │         │
        │    │ DEL Eliminar │    │         │
        │    └─────┬──────┘    │         │
        │          │      ┌────▼────┐    │
        │          │      │GET Turnos   │
        │          │      │POST Asignar │
        │          │      │DEL Desasignar
        │          │      │GET Cobertura│
        │          │      └─────┬──────┘
        │          │            │
        └──────────┼────────────┼──────┐
                   │            │      │
            ┌──────▼──────┐     │      │
            │ GET Empleados   │      │
            │ GET Areas    │      │
            └──────┬──────┘     │
                   │      ┌─────▼──────┐
                   │      │GET Reportes│
                   │      │POST Exportar
                   │      └────────────┘
                   │
            ┌──────▼──────────────┐
            │  LocalStorage Token  │
            └─────────────────────┘
```

---

## UI/UX: Paleta de Colores

- **Fondo:** var(--space-black) #0a0e27
- **Paneles:** var(--night-blue) #1a2847
- **Acentos:** var(--electric-cyan) #0fc1f9
- **Estados turnos:**
  - Asignado: Verde #22c55e
  - Sin asignar: Gris #6b7280
  - Conflicto: Rojo #ef4444
  - En proceso: Azul #3b82f6

---

## CSS Classes Nuevas

```css
.planificador-dashboard
.planificador-home
.mallas-panel
.malla-item
.malla-item.draft
.malla-item.published
.asignacion-panel
.turnos-grid
.turno-cell
.turno-cell.asignado
.turno-cell.vacante
.empleados-list
.empleado-item
.cobertura-bar
.reportes-panel
.reporte-selector
.reporte-table
.reporte-chart
```

---

## Fases de Implementación

**Fase 1:** Componentes básicos (sin API)
- PlanificadorHome.jsx
- MallasTurnos.jsx (lista mallas, crear, editar)
- AsignacionTurnos.jsx (grid básico)
- ReportesPlanificador.jsx (lista reportes)
- Estilos CSS

**Fase 2:** Integración API (cuando backend esté listo)
- Conectar endpoints
- Validaciones
- Manejo errores

**Fase 3:** Funcionalidades avanzadas
- Drag & drop
- Auto-asignación
- Gráficas
- Exportación

---

## Siguiente Paso

▶ Empezar con Fase 1: Crear 4 componentes + CSS
