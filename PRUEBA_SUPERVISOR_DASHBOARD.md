# 🧪 Guía Rápida de Prueba - Dashboard Supervisor

## Acceso al Dashboard Supervisor

### 1. Login como Supervisor
- **Endpoint:** `POST /api/auth/login`
- **Usuario:** `supvi4` o cualquier usuario con `Id_rol = 4`
- **Contraseña:** [Según configuración de BD]

**Ejemplo de respuesta esperada:**
```json
{
  "success": true,
  "user": {
    "id": 4,
    "nombre": "Supervisor Demo",
    "email": "supervisor@empresa.com",
    "Id_rol": 4,
    "empresa_id": 1,
    "area_id": 5
  },
  "token": "eyJhbGc..."
}
```

### 2. Frontend Routing
Cuando el user.Id_rol = 4:
- `App.jsx` detecta automáticamente el rol
- Renderiza `<SupervisorDashboard onLogout={logout} />`
- Muestra interfaz con 4 tabs principales

---

## 📑 Navegación del Dashboard

### Tab 1: 🏠 INICIO (SupervisorHome)
**URL visual:** Mostrado al abrir el dashboard

**Elementos:**
- Panel de bienvenida: "Hola, [Nombre Supervisor]"
- Empresa: Logo/sigla con estado
- 4 Tarjetas de Estadísticas:
  - 🔴 **Novedades Pendientes:** 5
  - 👥 **Empleados Activos:** 12
  - 📊 **Cobertura Hoy:** 95%
  - ⚠️ **Ausencias Hoy:** 2

- 4 Botones de Acción Rápida:
  - ✓ Aprobar Novedades
  - 👥 Ver Mi Equipo
  - 📊 Ver Reportes
  - 📈 Cobertura Semana

- Caja de información: "Rol: Supervisor"

**Datos Mock:** Estadísticas hardcodeadas para demo

---

### Tab 2: ✓ APROBACIONES (NovedadesAprobacion)
**URL visual:** Click en tab "✓ Aprobaciones"

**Funcionalidades:**

#### Filtros
```
- Estado: [Todos] [Pendientes] [Aprobadas] [Rechazadas]
- Tipo: [Todos] [Cambio turno] [Permiso] [Incapacidad] [Licencia]
```

#### Tarjetas de Novedades (Mock Data)
1. **Juan Pérez** - Cambio de turno
   - Estado: Pendiente (🟠)
   - Descripción: "Necesito cambiar turno del 20"
   - Fecha: 20/09/2026
   - Detalles: "Tengo una cita médica"

2. **María López** - Permiso
   - Estado: Pendiente (🟠)
   - Descripción: "Permiso por razones personales"
   - Fecha: 22/09/2026

3. **Carlos García** - Incapacidad
   - Estado: Aprobado (🟢)
   - Descripción: "Reporto incapacidad médica"
   - Fecha: 15/09/2026

#### Acciones
1. Click en tarjeta → Expande con detalles
2. Campo: "Motivo de rechazo (si aplica)" → Textarea
3. Botones: ✓ Aprobar | ✗ Rechazar

**Validación:**
- ✓ Aprobar: Sin validación adicional
- ✗ Rechazar: Requiere motivo no vacío

**Estado Posterior:**
- Cambia estado en la tarjeta
- Muestra mensaje de éxito: "Solicitud aprobada/rechazada"
- Desaparece después de 3 segundos

---

### Tab 3: 👥 MI EQUIPO (MiEquipo)
**URL visual:** Click en tab "👥 Mi Equipo"

**Funcionalidades:**

#### Búsqueda
```
Input: "🔍 Buscar por nombre o email..."
- Busca en: nombre_completo, email
- Real-time filtering
```

#### Filtros
```
Estado: [Todos] [Activos] [Inactivos] [En Licencia] [En Permiso]
```

#### Tarjetas de Empleados (Mock Data - 4 Empleados)

**1. Juan Pérez**
- Avatar: "J" (verde - activo)
- Especialidad: Atención al cliente
- Estado: Activo (🟢)
- Stats: 8 turnos | 95% asistencia | 1 novedad pendiente
- Detalles al expandir:
  - Email: juan.perez@example.com
  - Teléfono: 3001234567
  - Ingreso: 15/01/2024
  - Asistencia: Barra de progreso 95%
  - Botones: ✉️ Contactar | 📊 Ver Reportes

**2. María López**
- Especialidad: Operaciones
- Estado: Activo (🟢)
- Stats: 8 turnos | 98% asistencia | 0 novedades
- Mejor desempeño

**3. Carlos García**
- Especialidad: Ventas
- Estado: Activo (🟢)
- Stats: 6 turnos | 92% asistencia | 2 novedades pendientes
- Requiere atención

**4. Ana Rodríguez**
- Especialidad: Soporte técnico
- Estado: En Licencia (🟠)
- Stats: 0 turnos | 88% asistencia | 0 novedades
- Sin turnos asignados

**Interacciones:**
- Hover: Tarjeta se eleva y brilla
- Click: Se expande con detalles
- Búsqueda: Filtra dinámicamente
- Botones de estado: Color-coding por estado

---

### Tab 4: 📊 REPORTES (ReportesSupervisor)
**URL visual:** Click en tab "📊 Reportes"

**Funcionalidades:**

#### Selector de Tipo de Reporte
```
Tipo: [📊 Cobertura] [👥 Disponibilidad] [⏳ Ausencias] [🔄 Cambios] [📈 Desempeño]
```

#### Filtros de Fecha
```
Desde: 2026-09-01
Hasta: 2026-09-30
```

#### Botón Generar
- Click → Estado: "⏳ Generando..."
- Espera 800ms
- Genera tabla con datos mock

#### Acciones de Descarga (Después de generar)
- 📄 PDF
- 📊 Excel
- 📋 CSV
- 🖨️ Imprimir

#### Tipos de Reporte (Mock Data)

**📊 COBERTURA DE TURNOS** (Default)
| Fecha | Total Turnos | Asignados | Cobertura | Estado |
|-------|--------------|-----------|-----------|---------|
| 2026-09-20 | 12 | 10 | 83% | Aceptable (🟠) |
| 2026-09-21 | 12 | 12 | 100% | Óptimo (🟢) |
| 2026-09-22 | 12 | 9 | 75% | Bajo (🔴) |

**👥 DISPONIBILIDAD DE EMPLEADOS**
| Empleado | Disponible | No Disponible | % Disponibilidad |
|----------|-----------|--------------|-----------------|
| Juan Pérez | 8 | 2 | 80% |
| María López | 10 | 0 | 100% |
| Carlos García | 6 | 4 | 60% |
| Ana Rodríguez | 0 | 10 | 0% |

**⏳ AUSENCIAS Y FALTAS**
| Empleado | Faltas | Permisos | Incapacidades | Total |
|----------|--------|----------|---------------|-------|
| Juan Pérez | 1 | 2 | 1 | 4 |
| María López | 0 | 1 | 0 | 1 |
| Carlos García | 2 | 1 | 2 | 5 |

**🔄 CAMBIOS DE TURNO**
| Fecha | Desde | Hacia | Turno | Motivo | Estado |
|-------|-------|-------|-------|--------|--------|
| 2026-09-18 | Juan Pérez | María López | Mañana | Cambio solicitado | Aprobado (🟢) |
| 2026-09-19 | Carlos García | Juan Pérez | Tarde | Cita médica | Aprobado (🟢) |

**📈 DESEMPEÑO DEL EQUIPO**
| Empleado | Puntualidad | Asistencia | Cumplimiento | Promedio |
|----------|-----------|-----------|------------|----------|
| Juan Pérez | 95% | 95% | 90% | 93% 🟢 |
| María López | 100% | 98% | 95% | 98% 🟢 |
| Carlos García | 85% | 92% | 88% | 88% 🟠 |

---

## 🔑 Validaciones y Comportamientos

### Aprobaciones (NovedadesAprobacion)
✅ **Válido:**
- Click Aprobar sin motivo
- Llenar motivo y rechazar

❌ **Inválido:**
- Click Rechazar sin motivo → Muestra error: "Debes proporcionar un motivo"

### Búsqueda (MiEquipo)
✅ **Funciona:**
- Buscar "Juan" → Filtra Juan Pérez
- Buscar "juan.perez@" → Filtra por email
- Buscar "Maria" → Case-insensitive

### Filtros
✅ **Combinados:**
- Filtro Estado = "Activos" + Búsqueda "Maria" = Solo María López

---

## 🎨 Visual Checklist

### Colores y Estilos
- ✓ Fondo: Gradiente azul oscuro (space-black a cosmic-blue)
- ✓ Paneles: Glassmorphism (semi-transparente con blur)
- ✓ Textos: Blanco neon (#f5f5f5)
- ✓ Acentos: Cyan eléctrico (#0fc1f9)
- ✓ Estados: Verde (#22c55e), Naranja (#f59e0b), Rojo (#ef4444)

### Animaciones
- ✓ Hover en tarjetas: Elevan y brillan
- ✓ Transiciones: Suaves (0.3s ease)
- ✓ Click en botones: Cambio de color instantáneo
- ✓ Loading: Spin suave

### Responsive
- ✓ Desktop (>1024px): Layout completo
- ✓ Tablet (720-1024px): Grid ajustado
- ✓ Mobile (<720px): Layout apilado

---

## 🔧 Testing Técnico

### Console Check
Abre DevTools (F12) → Console:
- [ ] No errors rojos
- [ ] No warnings de eslint críticos
- [ ] Fetch calls si backend está disponible

### Network Tab
- [ ] GET requests a /api/supervisor/* (cuando backend esté listo)
- [ ] POST requests para aprobar/rechazar (cuando backend esté listo)

### React DevTools
- [ ] SupervisorDashboard → activeTab state: 'inicio'
- [ ] NovedadesAprobacion → loading: false, novedades: array
- [ ] MiEquipo → empleados: array, filtrados dinámicamente

---

## 🚀 Casos de Uso Completos

### Caso 1: Aprobar una Novedad
1. Login como supervisor (Id_rol=4)
2. Click tab "✓ Aprobaciones"
3. Ver tarjeta "Juan Pérez - Cambio de turno"
4. Click en tarjeta → Expande
5. Click "✓ Aprobar" sin llenar motivo
6. Ver éxito: "Solicitud aprobada exitosamente"
7. Tarjeta cambia a verde (aprobado)

### Caso 2: Rechazar una Novedad
1. Pasos 1-4 iguales
2. Click "✗ Rechazar" → Muestra error (motivo requerido)
3. Llenar motivo: "No coincide con disponibilidad"
4. Click "✗ Rechazar" nuevamente
5. Ver éxito: "Solicitud rechazada"
6. Tarjeta cambia a roja (rechazado)

### Caso 3: Buscar Empleado
1. Click tab "👥 Mi Equipo"
2. Input búsqueda: "maria"
3. Ver solo "María López"
4. Borrar búsqueda → Ver todos 4 empleados
5. Filtro: "En Licencia" → Ver solo "Ana Rodríguez"

### Caso 4: Generar Reporte
1. Click tab "📊 Reportes"
2. Cambiar tipo: "Desempeño del Equipo"
3. Dejar fechas por defecto (01 a 30 de septiembre 2026)
4. Click "🔄 Generar" → Muestra loader
5. Tabla aparece con 3 empleados y sus scores
6. Click "📊 Excel" → Log en console (mock)

---

## 📝 Notas para Desarrollo Siguiente

### Backend Necesario
- [ ] Endpoints con filtrado por empresa_id
- [ ] Autenticación JWT validando empresa_id
- [ ] Validación que supervisor solo ve su empresa

### Frontend Mejoras
- [ ] Reemplazar mock data con fetch calls
- [ ] Agregar paginación en reportes grandes
- [ ] Implementar exportación real de PDF/Excel

### Database
- [ ] Verificar empresa_id en todas las tablas
- [ ] Verificar area_id/departamento_id en empleados

---

## 🐛 Debugging Tips

Si algo no funciona:

1. **Componente no muestra:**
   - Verificar en console: `user.Id_rol` es 4?
   - Verificar App.jsx: ¿Detecta isSupervisor correctamente?
   - Verificar token en localStorage

2. **Datos no cargan:**
   - Mock data está hardcodeado en useEffect
   - Cuando backend esté listo, cambiar por fetch

3. **Estilos rotos:**
   - Verificar CSS agregado a App.css
   - Verificar clases en componentes coinciden con CSS

4. **Errores en console:**
   - Verificar no hay typos en nombres de componentes
   - Verificar imports están correctos
   - Verificar props se pasan correctamente

