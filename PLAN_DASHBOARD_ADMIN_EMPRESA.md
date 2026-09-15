# PLAN DE IMPLEMENTACIÓN: DASHBOARD ADMIN EMPRESA

**Rol:** Admin Empresa (ID: 2, Username: ademp2)  
**Prioridad:** Phase 2 Backend + Phase 3 Frontend  
**Complejidad:** ALTA (Múltiples módulos de configuración)  
**Estimado:** 20-25 días desarrollo

---

## 1. DESCRIPCIÓN GENERAL

El Dashboard Admin Empresa proporciona una interfaz integral para que los administradores de cada empresa configuren todos los parámetros operacionales, normativas laborales, y políticas de negocio que rigen sus turnos y personal.

### Objetivo Principal
Permitir que cada Admin Empresa defina cómo funciona su operación:
- Horarios (cantidad de horas semanales, diarias, mensuales)
- Perfiles/Profesiones requeridas
- Modalidades de turnos disponibles
- Normativas laborales (máximos de horas, descansos, recargos)
- Sedes y departamentos organizacionales
- Políticas de novedades y permisos
- Reglas de intercambio de turnos

### Alcance de Aislamiento Multi-tenant
**Criterio de Aceptación 1 & 2:**
- ✅ El cambio SOLO afecta a la empresa a la que pertenece el Admin Empresa
- ✅ Todos los datos se filtran por `empresa_id` en backend
- ✅ Super Admin VE una sección/pestaña especial para seleccionar empresa objetivo

---

## 2. CRITERIOS DE ACEPTACIÓN

### CA-1: Aislamiento Multi-tenant
```
DADO que soy Admin Empresa de "Empresa A"
CUANDO configuro horas máximas semanales en 40h
ENTONCES solo "Empresa A" es afectada
Y los empleados de "Empresa B" no ven este cambio
Y el Super Admin puede cambiar esto a otra empresa sin afectar "Empresa A"
```

### CA-2: Motor de Políticas
```
DADO que ingreso al formulario de configuración
CUANDO selecciono "Motor de Políticas y Reglas de Negocio"
ENTONCES veo una sección clara que explica qué parámetros rige
Y cada configuración muestra su impacto operativo
Y hay preview/simulación de cómo afecta a futuros turnos
```

### CA-3: Perfiles Profesionales
```
DADO que soy Admin Empresa
CUANDO configuro "Profesiones/Perfiles"
ENTONCES puedo especificar cantidad de: Vigilantes, Doctores, Operarios, etc.
Y cada perfil tiene especialidades/habilidades asociadas
Y puedo crear perfiles customizados
Y los turnos posteriores requieren asignar empleados del perfil correcto
```

### CA-4: Modalidades de Turnos
```
DADO que configuro "Modalidades de Turnos"
CUANDO selecciono opciones (8h, 12h, 6h, Rotativos, Fijos)
ENTONCES puedo activar/desactivar según necesidad
Y cada modalidad tiene parámetros propios (ej: rotativo define ciclo de 7-14 días)
Y las mallas de turnos solo permiten crear con modalidades activas
```

### CA-5: Intensidad Laboral - Horas Máximas
```
DADO que configuro "Normatividad de Intensidad Laboral"
CUANDO establezco:
  - Horas máximas por hora: 1.0
  - Horas máximas por día: 8/10/12
  - Horas máximas por semana: 40/44/48
  - Horas máximas por mes: 160/176/192
ENTONCES el sistema VALIDA que no se asignen turnos que superen estos límites
Y hay ALERTAS cuando un empleado está cerca del límite
Y se registran VIOLACIONES cuando se exceden (con justificación requerida)
```

### CA-6: Control de Horas Extras
```
DADO que configuro "Control de Horas Extras"
CUANDO establezco:
  - Límite permitido de horas extras: (ej. 8h/semana, 4h/día)
  - Mecanismo de alerta
  - Aprobación requerida sí/no
ENTONCES cualquier turno que supere las horas base triggerea ALERTA
Y se requiere aprobación antes de asignación
Y hay reporte de horas extras por empleado/semana/mes
```

### CA-7: Descanso Interjornada
```
DADO que configuro "Descanso Interjornada"
CUANDO establezco "Mínimo 11 o 12 horas consecutivas entre turnos"
ENTONCES el sistema VALIDA que no haya dos turnos consecutivos con < tiempo especificado
Y hay ALERTA visual si se violaría esta regla
Y Planificador ve advertencia al intentar asignar
```

### CA-8: Descanso Dominical/Doméstico
```
DADO que configuro "Descanso Dominical"
CUANDO establezco "1 día de descanso tras 6 días laborados"
ENTONCES el sistema VALIDA este patrón en las mallas
Y hay reporte de cumplimiento por empleado
Y Super Admin/Supervisor ven si algún empleado viola esta regla
```

### CA-9: Pausas y Almuerzos
```
DADO que configuro "Pausas Intrajornada"
CUANDO establezco:
  - Duración de almuerzo: 30/60 min
  - ¿Remunerado? sí/no
  - ¿Cuenta hacia meta semanal? sí/no
ENTONCES los turnos reflejan esto en cálculo de horas
Y reportes separan "horas trabajadas" vs "horas pagadas"
Y pausas aparecen en calendario del empleado
```

### CA-10: Ventana Nocturna
```
DADO que configuro "Ventana Nocturna"
CUANDO establezco rango horario (ej. 21:00 a 06:00)
ENTONCES turnos dentro de este rango se marcan como "nocturnos"
Y aplican recargos configurables (ej. +25% salario)
Y hay reporte de "Horas Nocturnas" por empleado
Y Supervisor ve claro cuáles turnos son nocturnos
```

### CA-11: Días Festivos y Recargos
```
DADO que configuro "Tratamiento de Días Festivos"
CUANDO cargo calendario de: Domingos, Festivos Nacionales, Días Especiales
ENTONCES:
  - Puedo especificar % recargo para cada tipo (ej. Domingo: +50%, Festivo: +100%)
  - Turnos en estas fechas se marcan automáticamente
  - Reportes separan "normal" vs "festivo" vs "domingo"
  - Cálculo de salarios incluye recargos
```

### CA-12: Catálogo de Tipos de Turnos
```
DADO que configuro "Catálogo de Turnos"
CUANDO defino tipos estándar:
  - Mañana (6:00-14:00)
  - Tarde (14:00-22:00)
  - Noche (22:00-06:00)
  - Personalizado
ENTONCES:
  - Cada tipo tiene horario fijo asociado
  - Puedo crear ilimitados tipos personalizados
  - Las mallas usan estos tipos
  - Calendario muestra tipo en cada turno
```

### CA-13: Plantillas de Cobertura por Rol/Sede
```
DADO que configuro "Plantillas de Cobertura"
CUANDO establezco:
  - Sede Norte → Área de Ventas → Turno Mañana = 3 Vendedores + 1 Cajero
  - Sede Sur → Área de Almacén → Turno Tarde = 2 Operarios + 1 Supervisor
ENTONCES:
  - Malla de turnos VALIDA esta cobertura
  - ALERTA si falta asignar roles
  - Reportes de "Cobertura Cumplida vs Requerida"
  - Planificador ve claramente qué falta cubrir
```

### CA-14: Sedes, Departamentos y Áreas
```
DADO que configuro "Estructura Organizacional"
CUANDO creo:
  - Sedes: Sede Norte, Sede Sur, Sede Centro
  - Departamentos: Ventas, Almacén, Recursos Humanos
  - Áreas: Caja, Piso de Ventas, etc.
ENTONCES:
  - Cada empleado se asigna a Sede + Departamento + Área
  - Turnos se asignan a Sede + Área específica
  - Reportes filtran por estructura
  - Cobertura se define por esta estructura
```

### CA-15: Tipificación de Novedades
```
DADO que configuro "Política de Novedades"
CUANDO defino tipos:
  - Incapacidad Médica
  - Licencia de Luto
  - Permiso Personal
  - Vacaciones
  - Cambio de Turno
  - Plus Otros
ENTONCES para cada tipo puedo especificar:
  - ¿Es remunerada? sí/no
  - ¿Descuenta de meta semanal? sí/no
  - ¿Requiere reemplazo? sí/no
  - Duración máxima permitida
  - Requiere justificación/documentación
  - Requiere aprobación de quién (Supervisor/Planificador/Ambos)
```

### CA-16: Impacto Operativo de Novedades
```
DADO que un empleado solicita Incapacidad Médica (3 días)
CUANDO Supervisor aprueba
ENTONCES:
  - Los 3 turnos asignados se marcan como "cubiertos por novedad"
  - El sistema BUSCA automáticamente quien puede reemplazar
  - Si hay cobertura en espera → auto-asigna (opcional)
  - Reportes reflejan el cambio
  - Calculadora de horas excluye esos días de meta
```

### CA-17: Flexibilidad de Intercambio de Turnos
```
DADO que configuro "Política de Intercambio de Turnos"
CUANDO establecer:
  - ¿Empleados pueden solicitar cambio? sí/no
  - ¿Requiere aprobación Planificador? sí/no
  - Tiempo mínimo de antelación: 24h/48h/72h/7 días
  - ¿Compañero debe tener mismo rol? sí/no
  - ¿Compañero debe tener misma especialidad? sí/no
ENTONCES:
  - Interfaz Empleado muestra opciones permitidas
  - Validaciones se aplican automáticamente
  - Workflow de aprobación se dispara si es requerido
  - Cambios registrados en audit trail
```

### CA-18: Validación de Cambios de Turno
```
DADO que un empleado solicita cambiar turno con compañero
CUANDO aplica reglas de validación configuradas
ENTONCES:
  - ✓ Ambos cumplen horario mínimo de antelación
  - ✓ Ambos tienen el rol/especialidad requerida
  - ✓ El cambio no violaría descanso interjornada
  - ✓ El cambio no excedería horas máximas semanales
  - ✓ Aprobación fluye a persona correcta
  - ✓ Cambio se registra en auditoría
```

---

## 3. ESTRUCTURA DE COMPONENTES

### Componente Principal
```
AdminEmpresaDashboard.jsx (65 líneas)
  ├─ Tab Navigation (12 tabs/secciones)
  └─ Conditional Rendering (por activeTab)
```

### Componentes por Sección (12 módulos)

#### 1. **PerfilEmpresa.jsx** (300+ líneas)
**Propósito:** Información básica y "motor de políticas"

**Campos:**
- Nombre empresa (read-only)
- Logo empresa
- País + Zona horaria
- Moneda de pago
- Contacto principal
- Email de notificaciones
- Descripción breve

**Features:**
- Vista clara de "Motor de Políticas y Reglas Negocio"
- Explicación de qué regula cada sección
- Preview/simulación de impacto de cambios
- Historial de cambios de configuración

**Mock Data:**
```javascript
{
  id: 1,
  nombre: "TechCorp Solutions",
  pais: "Colombia",
  moneda: "COP",
  zona_horaria: "America/Bogota",
  contacto: "Carlos Mendoza",
  email_notificaciones: "admin@techcorp.com"
}
```

---

#### 2. **PerfilesYProfesiones.jsx** (280+ líneas)
**Propósito:** Definir profesiones/perfiles de empleados

**Campos por Perfil:**
- Nombre del perfil
- Descripción
- Especialidades/habilidades (multi-select)
- Cantidad estimada en empresa
- Requerimientos específicos
- Salario base (referencia)

**Especialidades Predefinidas:**
- Vigilancia, Seguridad
- Medicina, Enfermería, Odontología
- Operarios, Técnicos
- Administrativo, Secretarial
- Ventas, Servicio al Cliente
- Logística, Almacén
- RRHH, Financiero

**Features:**
- CRUD completo
- Agregar especialidades custom
- Cantidad empleados por perfil (estadística)
- Validar que mallas de turnos solo usen perfiles activos

**Mock Data:**
```javascript
[
  {
    id: 1,
    nombre: "Vigilante",
    especialidades: ["Seguridad", "Vigilancia Nocturna"],
    cantidad: 12
  },
  {
    id: 2,
    nombre: "Operario",
    especialidades: ["Manejo de Máquinas", "Seguridad Industrial"],
    cantidad: 8
  }
]
```

---

#### 3. **ModalidadesTurnos.jsx** (250+ líneas)
**Propósito:** Configurar tipos de turnos disponibles

**Modalidades Base:**
- 8 horas (Fijo)
- 12 horas (Fijo)
- 6 horas (Fijo)
- Rotativo (Ciclos)
- Flexible (Rango de horas)

**Para cada modalidad:**
- Duración base
- ¿Incluye pausas?
- Ciclo de rotación (si aplica)
- Horarios permitidos
- Penalización si no se cumplen
- Ejemplos de casos de uso

**Features:**
- Toggle para activar/desactivar
- Editar parámetros
- Visualizar empleados en cada modalidad
- Impacto en cálculo de horas

**Mock Data:**
```javascript
{
  id: 1,
  tipo: "8 Horas Fijo",
  duracion_base: 8,
  pausa_incluida: true,
  duracion_pausa: 60,
  pausa_remunerada: true,
  activo: true
}
```

---

#### 4. **IntensidadLaboral.jsx** (350+ líneas)
**Propósito:** Configurar normativa de horas máximas

**Secciones:**

**A) Topes de Horas:**
- Máximo por hora (para trabajos muy densos)
- Máximo por día: 8 / 10 / 12 / custom
- Máximo por semana: 40 / 44 / 48 / custom
- Máximo por mes: 160 / 176 / 192 / custom

**B) Horas Extras:**
- ¿Se permiten? sí/no
- Máximo por día: none / 2 / 4 / 8
- Máximo por semana: none / 8 / 16 / custom
- Máximo por mes: none / 20 / 40 / custom
- ¿Requiere aprobación? sí/no
- Porcentaje de pago extra: 0% / 25% / 50% / 100%

**C) Validaciones Automáticas:**
- Al crear malla: validar cumplimiento
- Alerta si se acerca al límite
- Error si supera límite

**Features:**
- Preset templates por país/industria
- Calculadora de horas (simular malla)
- Histórico de cambios
- Reportes de compliance

**Mock Data:**
```javascript
{
  max_horas_dia: 8,
  max_horas_semana: 40,
  max_horas_mes: 160,
  horas_extras_permitidas: true,
  max_extras_dia: 2,
  max_extras_semana: 8,
  porcentaje_pago_extras: 25
}
```

---

#### 5. **DescansoInterjornada.jsx** (200+ líneas)
**Propósito:** Configurar tiempo mínimo entre turnos

**Campos:**
- Horas mínimas entre turnos: 8 / 10 / 11 / 12 / custom
- ¿Excepciones? sí/no (y qué son)
- ¿Validar automáticamente? sí/no
- Penalty si se viola (ej: alerta, bloqueo, registrar)

**Features:**
- Explicación clara de regulación (ej: Ley laboral colombiana)
- Calculadora (si turno A termina a las 14:00, turno B mínimo a las 02:00)
- Validación al asignar turnos
- Reporte de violaciones

**Mock Data:**
```javascript
{
  horas_minimas_entre_turnos: 12,
  excepciones_permitidas: false,
  validar_automaticamente: true,
  penalidad: "bloqueo"
}
```

---

#### 6. **DescansoSemanal.jsx** (250+ líneas)
**Propósito:** Configurar descansos dominicales y domésticos

**Secciones:**

**A) Descanso Dominical:**
- ¿Es obligatorio? sí/no
- Frecuencia: Cada domingo / 1 cada 4 domingos / flexible
- ¿Se trabaja a cambio de otro día? sí/no

**B) Descanso Doméstico:**
- Patrón: 1 día cada N días (ej: 1 día cada 6 laborados)
- Puede ser en domingo o día de semana
- Debe ser continuo

**C) Flexibilidades:**
- Compensación: otro día de descanso
- Cambio: trabajar domingo por otro día
- Penalización: remuneración extra

**Features:**
- Calendario visual de patrones
- Validación de mallas
- Reporte de compliance por empleado
- Alertas de violaciones

**Mock Data:**
```javascript
{
  descanso_dominical_obligatorio: true,
  descanso_patron: "1 cada 6 dias",
  debe_ser_continuo: true,
  permite_compensacion: true,
  bonificacion_si_trabaja_domingo: 50
}
```

---

#### 7. **PausasYAlmuerzos.jsx** (220+ líneas)
**Propósito:** Configurar tiempos de pausa intrajornada

**Campos:**
- Duración de almuerzo: 30 / 60 / 90 min / custom
- ¿Es remunerado? sí/no
- ¿Cuenta hacia meta semanal? sí/no
- Rango horario permitido para almuerzo

**Descansos Intermedios:**
- Cantidad por jornada
- Duración cada uno
- ¿Remunerados?
- Rango horario permitido

**Features:**
- Configuración diferente por modalidad de turno
- Ejemplo visual en timeline de turno
- Calculadora: "Si turno es 8h con 1h almuerzo, horas pagadas = 8 o 7?"
- Reportes de pausa cumplida vs real

**Mock Data:**
```javascript
{
  duracion_almuerzo: 60,
  almuerzo_remunerado: true,
  cuenta_hacia_meta: false,
  descansos_intermedios: 2,
  duracion_descanso: 15,
  descansos_remunerados: true
}
```

---

#### 8. **VentananocturnaYFestivos.jsx** (320+ líneas)
**Propósito:** Configurar recargos nocturnos y días festivos

**Sección A: Ventana Nocturna**
- Horario inicio: (default 21:00)
- Horario fin: (default 06:00)
- ¿Aplica a toda la empresa?
- Penalización/Recargo: 0% / 25% / 50% / 75% / 100%
- ¿Se aplica a horas o a días completos?

**Sección B: Calendario de Festivos**
- Carga de fechas festivas del año
- Por cada festivo:
  - Fecha
  - Nombre (ej: "Día de Navidad")
  - Tipo (Nacional / Local / Especial)
  - Recargo aplicable: 0% / 50% / 75% / 100%
  - ¿Es día de descanso obligatorio?

**Sección C: Tratamiento de Domingos**
- Recargo específico para domingos: 0% / 25% / 50% / 100%
- ¿Se suma a recargo nocturno?
- Ejemplo: Domingo nocturno = 50% + 25% = 75%

**Features:**
- Calendario visual de festivos
- Pre-carga por país
- Edición manual
- Validación de sobreposición
- Reporte "Horas Nocturnas" por empleado
- Cálculo automático de recargos en nómina

**Mock Data:**
```javascript
{
  ventana_nocturna: {
    inicio: "21:00",
    fin: "06:00",
    recargo_porcentaje: 25
  },
  festivos: [
    { fecha: "2026-12-25", nombre: "Navidad", recargo: 100 },
    { fecha: "2026-01-01", nombre: "Año Nuevo", recargo: 100 }
  ],
  recargo_domingo: 50
}
```

---

#### 9. **CatalogoDeTurnos.jsx** (280+ líneas)
**Propósito:** Definir tipos de turnos estándar de la empresa

**Turnos Base Predefinidos:**
- Mañana: 06:00 - 14:00
- Tarde: 14:00 - 22:00
- Noche: 22:00 - 06:00
- Madrugada: 22:00 - 06:00 (mismo que noche pero visual diferente)

**Para cada turno:**
- Nombre
- Horario inicio
- Horario fin
- Duración total
- Duración pausa (si aplica)
- Horas efectivas de trabajo
- ¿Incluye nocturno?
- ¿Incluye festivo?
- Color para calendario (visual)
- Descripción

**Turnos Personalizados:**
- CRUD para crear turno custom
- Validación de sobreposición
- Validación de duración (vs modalidad permitida)

**Features:**
- Timeline visual de cada turno
- Calculadora automática de horas
- Uso: Cuántos empleados en este turno
- Impacto en cobertura

**Mock Data:**
```javascript
[
  {
    id: 1,
    nombre: "Mañana",
    hora_inicio: "06:00",
    hora_fin: "14:00",
    duracion_total: 8,
    pausa_duracion: 60,
    horas_efectivas: 8,
    es_nocturno: false
  },
  {
    id: 2,
    nombre: "Noche Extendida",
    hora_inicio: "20:00",
    hora_fin: "08:00",
    duracion_total: 12,
    pausa_duracion: 60,
    horas_efectivas: 12,
    es_nocturno: true
  }
]
```

---

#### 10. **PlantillasCobertura.jsx** (400+ líneas)
**Propósito:** Definir requerimiento de personal mínimo por turno/sede/área

**Estructura de entrada:**
```
Sede: [dropdown]
  Área/Departamento: [dropdown]
    Turno: [dropdown]
      → Requiere: N empleados del Perfil X, M empleados del Perfil Y
```

**Para cada entrada:**
- Sede (select)
- Área/Departamento (select)
- Turno (select)
- Perfil 1: Cantidad requerida + Especialidad específica (opcional)
- Perfil 2: Cantidad requerida + Especialidad específica
- ... (ilimitados perfiles)

**Features:**
- Agregar/Remover filas
- Templats predefinidas (ej: "Turno estándar 3-1-1")
- Importar/Exportar
- Validación: ¿Tenemos suficientes empleados?
- Reporte de "Cobertura Cumplida vs Requerida"
- Alerta cuando falta asignar
- Vista de "Faltantes" por turno

**Ejemplo:**
```
Sede Norte | Área Ventas | Turno Mañana:
  - 3x Vendedor (especialidad: Electrónica)
  - 1x Cajero (especialidad: POS)
  - 1x Supervisor (especialidad: Liderazgo)
```

**Mock Data:**
```javascript
[
  {
    sede: "Sede Norte",
    area: "Ventas",
    turno: "Mañana",
    requerimientos: [
      { perfil: "Vendedor", cantidad: 3, especialidad: "Electrónica" },
      { perfil: "Cajero", cantidad: 1, especialidad: "POS" },
      { perfil: "Supervisor", cantidad: 1, especialidad: null }
    ]
  }
]
```

---

#### 11. **EstructuraOrganizacional.jsx** (300+ líneas)
**Propósito:** Definir sedes, departamentos, áreas

**Sección A: Sedes**
- CRUD de Sedes
- Para cada sede:
  - Nombre
  - Ubicación (ciudad, dirección)
  - Zona horaria (puede diferir)
  - Contacto
  - ¿Activa?

**Sección B: Departamentos**
- CRUD de Departamentos
- Para cada departamento:
  - Nombre
  - Descripción
  - Gerente/Responsable
  - Sede a la que pertenece
  - ¿Activo?

**Sección C: Áreas**
- CRUD de Áreas
- Para cada área:
  - Nombre
  - Departamento que contiene
  - Sed (se hereda)
  - Supervisor
  - Descripción
  - ¿Activa?

**Features:**
- Árbol visual (Sede → Departamento → Área)
- Validación de jerarquía
- Relaciones con empleados
- Relaciones con turnos
- No permitir eliminar si hay referencias

**Mock Data:**
```javascript
{
  sedes: [
    { id: 1, nombre: "Sede Norte", ciudad: "Bogotá" },
    { id: 2, nombre: "Sede Sur", ciudad: "Cali" }
  ],
  departamentos: [
    { id: 1, nombre: "Ventas", sede_id: 1 },
    { id: 2, nombre: "Almacén", sede_id: 1 }
  ],
  areas: [
    { id: 1, nombre: "Piso de Ventas", depto_id: 1 },
    { id: 2, nombre: "Caja", depto_id: 1 }
  ]
}
```

---

#### 12. **PolíticaNovedades.jsx** (350+ líneas)
**Propósito:** Tipificación de novedades e incidencias

**Para CADA tipo de novedad, configurar:**

**Datos Básicos:**
- Nombre de novedad (ej: "Incapacidad Médica")
- Código (ej: "INC_MED")
- Descripción
- Categoría: Ausencia / Permiso / Licencia / Cambio_Turno / Plus_Otros
- Color para UI
- Icono

**Características Operativas:**
- ¿Es remunerada? sí/no
- ¿Descuenta de meta semanal? sí/no
- ¿Requiere reemplazo obligatorio? sí/no (si no hay reemplazo, ¿qué pasa?)
- Duración máxima permitida: 1 día / 3 días / 7 días / 30 días / ilimitada
- ¿Se puede renovar? sí/no (ej: incapacidad de 3 días, luego otra de 3)

**Requisitos y Aprobación:**
- ¿Requiere documentación? (sí/no + tipo)
- ¿Requiere justificación? (sí/no)
- ¿Requiere aprobación? (sí/no)
- Aprobador: Supervisor / Planificador / Ambos / RRHH
- Tiempo máximo para responder: 24h / 48h / 72h / ninguno
- ¿Puede aprobar el empleado a sí mismo? (para vacaciones programadas)

**Novedades Predefinidas:**
1. Incapacidad Médica
2. Licencia de Luto
3. Permiso Personal
4. Vacaciones
5. Licencia Maternidad/Paternidad
6. Cambio de Turno
7. Sobretiempo/Horas Extras (especial)
8. Plus Otros

**Features:**
- CRUD completo
- Validación de lógica
- Presets por país
- Prueba: Simular novedad + ver impacto
- Historial de cambios
- Reporte de novedades más usadas

**Mock Data:**
```javascript
[
  {
    id: 1,
    nombre: "Incapacidad Médica",
    codigo: "INC_MED",
    es_remunerada: true,
    descuenta_meta: true,
    requiere_reemplazo: true,
    duracion_maxima: 3,
    requiere_documentacion: true,
    tipo_doc: "Certificado médico",
    requiere_aprobacion: true,
    aprobador: "Supervisor",
    tiempo_respuesta: "24h"
  },
  {
    id: 2,
    nombre: "Cambio de Turno",
    codigo: "CAM_TURN",
    es_remunerada: true,
    descuenta_meta: false,
    requiere_reemplazo: false,
    duracion_maxima: 1,
    requiere_documentacion: false,
    requiere_aprobacion: true,
    aprobador: "Planificador",
    tiempo_respuesta: "48h"
  }
]
```

---

#### 13. **PolíticaIntercambioTurnos.jsx** (280+ líneas)
**Propósito:** Configurar reglas de cambio de turno entre empleados

**Configuración General:**
- ¿Se permite intercambio? sí/no
- ¿Se permite auto-solicitud (empleado pide cambiar con otro)? sí/no
- ¿Se permite que Planificador sugiera cambios? sí/no

**Validaciones:**
- Tiempo mínimo de antelación:
  - Ninguno (mismo día)
  - 24 horas
  - 48 horas
  - 72 horas
  - 1 semana
  - 2 semanas

- ¿Compañero debe tener MISMO ROL? sí/no
- ¿Compañero debe tener MISMA ESPECIALIDAD? sí/no
- ¿Compañero debe estar en MISMA SEDE? sí/no

**Aprobación:**
- ¿Se requiere aprobación? sí/no
- Aprobador: Supervisor / Planificador / Ambos
- Tiempo máximo para aprobar: 24h / 48h / 72h / ninguno
- ¿Ambos empleados deben aprobar? sí/no

**Validaciones Adicionales:**
- No violar Descanso Interjornada
- No exceder Horas Máximas
- No violar Descanso Dominical
- No violar Modalidad de Turno
- Validar Cobertura (no dejar área descubierta)

**Features:**
- Checklist visual de validaciones
- Simulador: "Si Juan y María cambian de turno X por Y, ¿qué pasa?"
- Reportes de cambios aprobados/rechazados
- Audit trail completo

**Mock Data:**
```javascript
{
  intercambio_permitido: true,
  tiempo_minimo_antelacion: "48h",
  mismo_rol_requerido: true,
  misma_especialidad_requerida: false,
  misma_sede_requerida: true,
  requiere_aprobacion: true,
  aprobador: "Planificador",
  tiempo_respuesta: "48h",
  validar_descanso_interjornada: true,
  validar_horas_maximas: true,
  validar_cobertura: true
}
```

---

### Componente Contenedor
```
AdminEmpresaDashboard.jsx (70 líneas)
  - 13 tabs de navegación
  - Logout button
  - Role verification
  - Conditional imports
```

### Integración en App.jsx
```javascript
import AdminEmpresaDashboard from './components/AdminEmpresaDashboard'

const isAdmin = ['ademp2', 'admin', 'admin', '2'].includes(rolStr) || user.Id_rol === 2
if (isAdmin) return <AdminEmpresaDashboard onLogout={logout} />
```

---

## 4. DISEÑO DE DATOS (BACKEND)

### Tablas Nuevas Requeridas

```sql
-- Motor de Políticas (relación empresa <-> configuración)
CREATE TABLE empresa_configuracion (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  seccion VARCHAR(100),
  parametro VARCHAR(255),
  valor JSONB,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP,
  fecha_actualizacion TIMESTAMP,
  actualizado_por INT
);

-- Perfiles Profesionales
CREATE TABLE perfiles (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  nombre VARCHAR(150),
  descripcion TEXT,
  cantidad_estimada INT,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP
);

-- Especialidades por Perfil
CREATE TABLE perfil_especialidades (
  id SERIAL PRIMARY KEY,
  perfil_id INT NOT NULL,
  especialidad VARCHAR(150),
  requerida BOOLEAN,
  FOREIGN KEY (perfil_id) REFERENCES perfiles(id)
);

-- Modalidades de Turnos
CREATE TABLE modalidades_turnos (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  tipo VARCHAR(100),
  duracion_base DECIMAL(5,2),
  pausa_incluida BOOLEAN,
  duracion_pausa INT,
  pausa_remunerada BOOLEAN,
  activo BOOLEAN DEFAULT true
);

-- Intensidad Laboral
CREATE TABLE intensidad_laboral (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  max_horas_dia DECIMAL(5,2),
  max_horas_semana DECIMAL(5,2),
  max_horas_mes DECIMAL(5,2),
  horas_extras_permitidas BOOLEAN,
  max_extras_dia DECIMAL(5,2),
  max_extras_semana DECIMAL(5,2),
  porcentaje_pago_extras DECIMAL(5,2),
  requiere_aprobacion BOOLEAN,
  fecha_actualizacion TIMESTAMP
);

-- Descanso Interjornada
CREATE TABLE descanso_config (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  horas_minimas_entre_turnos DECIMAL(5,2),
  excepciones_permitidas BOOLEAN,
  validar_automaticamente BOOLEAN,
  penalidad VARCHAR(50)
);

-- Descanso Semanal
CREATE TABLE descanso_semanal_config (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  descanso_dominical_obligatorio BOOLEAN,
  frecuencia_domingo VARCHAR(50),
  patron_descanso VARCHAR(100),
  debe_ser_continuo BOOLEAN,
  permite_compensacion BOOLEAN,
  bonificacion_si_trabaja_domingo DECIMAL(5,2)
);

-- Pausas y Almuerzos
CREATE TABLE pausas_config (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  duracion_almuerzo INT,
  almuerzo_remunerado BOOLEAN,
  cuenta_hacia_meta BOOLEAN,
  descansos_intermedios INT,
  duracion_descanso INT,
  descansos_remunerados BOOLEAN
);

-- Ventana Nocturna
CREATE TABLE ventana_nocturna_config (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  recargo_porcentaje DECIMAL(5,2),
  aplica_a_dias_completos BOOLEAN
);

-- Festivos
CREATE TABLE festivos (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  fecha DATE,
  nombre VARCHAR(150),
  tipo VARCHAR(50),
  recargo_porcentaje DECIMAL(5,2),
  es_descanso_obligatorio BOOLEAN,
  fecha_creacion TIMESTAMP
);

-- Catálogo de Turnos
CREATE TABLE catalogo_turnos (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  nombre VARCHAR(100),
  hora_inicio TIME,
  hora_fin TIME,
  duracion_total DECIMAL(5,2),
  pausa_duracion INT,
  horas_efectivas DECIMAL(5,2),
  es_nocturno BOOLEAN,
  es_festivo BOOLEAN,
  color_ui VARCHAR(20),
  descripcion TEXT
);

-- Plantillas de Cobertura
CREATE TABLE plantillas_cobertura (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  sede_id INT,
  area_id INT,
  turno_id INT,
  JSON JSONB (requerimientos: [{ perfil_id, cantidad, especialidad }])
);

-- Estructura Organizacional (Sedes, Deptos, Áreas)
CREATE TABLE sedes (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  nombre VARCHAR(150),
  ciudad VARCHAR(100),
  direccion TEXT,
  zona_horaria VARCHAR(50),
  contacto VARCHAR(150),
  activo BOOLEAN
);

CREATE TABLE departamentos (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  sede_id INT NOT NULL,
  nombre VARCHAR(150),
  descripcion TEXT,
  gerente_id INT,
  activo BOOLEAN
);

CREATE TABLE areas (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  depto_id INT NOT NULL,
  nombre VARCHAR(150),
  supervisor_id INT,
  descripcion TEXT,
  activo BOOLEAN
);

-- Tipos de Novedades
CREATE TABLE tipos_novedades (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  nombre VARCHAR(150),
  codigo VARCHAR(50),
  descripcion TEXT,
  categoria VARCHAR(50),
  color_ui VARCHAR(20),
  es_remunerada BOOLEAN,
  descuenta_meta BOOLEAN,
  requiere_reemplazo BOOLEAN,
  duracion_maxima INT,
  requiere_documentacion BOOLEAN,
  tipo_documentacion VARCHAR(100),
  requiere_aprobacion BOOLEAN,
  aprobador VARCHAR(100),
  tiempo_respuesta VARCHAR(50),
  activo BOOLEAN
);

-- Política de Intercambio de Turnos
CREATE TABLE politica_intercambio (
  id SERIAL PRIMARY KEY,
  empresa_id INT NOT NULL,
  intercambio_permitido BOOLEAN,
  tiempo_minimo_antelacion VARCHAR(50),
  mismo_rol_requerido BOOLEAN,
  misma_especialidad_requerida BOOLEAN,
  misma_sede_requerida BOOLEAN,
  requiere_aprobacion BOOLEAN,
  aprobador VARCHAR(100),
  tiempo_respuesta VARCHAR(50),
  validar_descanso_interjornada BOOLEAN,
  validar_horas_maximas BOOLEAN,
  validar_cobertura BOOLEAN,
  fecha_actualizacion TIMESTAMP
);
```

---

## 5. COMPONENTES VISUALES

### Colores y Componentes Reutilizables

**Componentes por Sección:**
- Sección Config: Header + Form + Preview + Historial
- Sección CRUD: Tabla + Modal Agregar/Editar + Confirmación
- Sección Calendar: Calendario + Festivos + Recargos
- Sección Árbol: TreeView (Sede → Depto → Área)
- Sección Validación: Checklist + Alertas + Simulador

**Patrones CSS:**
- `.admin-dashboard` - Container principal
- `.config-section` - Sección de configuración
- `.form-group` - Grupo de formulario
- `.config-preview` - Preview de cambios
- `.tree-view` - Árbol organizacional
- `.coverage-matrix` - Matriz de cobertura
- `.validation-checklist` - Checklist de validaciones
- `.alert-box` - Caja de alertas
- `.simulator` - Simulador de cambios

---

## 6. FLUJOS PRINCIPALES

### Flujo 1: Configurar Horas Máximas
```
1. Admin ingresa a "Intensidad Laboral"
2. Modifica Max Horas Día: 8 → 10
3. Sistema muestra PREVIEW:
   "Si cambio esto, X empleados estarían fuera de límite"
4. Admin confirma cambio
5. Sistema VALIDA todas las mallas actuales
6. Si hay violaciones, muestra reporte
7. Admin resuelve o mantiene violación (con registro)
8. Cambio se guarda + se registra en auditoría
9. Email notificación a Planificador
```

### Flujo 2: Crear Plantilla de Cobertura
```
1. Admin ingresa a "Plantillas de Cobertura"
2. Selecciona: Sede Norte → Área Ventas → Turno Mañana
3. Agrega Requerimientos:
   - 3x Vendedor (Electrónica)
   - 1x Cajero (POS)
   - 1x Supervisor
4. Sistema valida:
   - ¿Tenemos suficientes empleados?
   - ¿Todos tienen habilidades necesarias?
5. Admin guarda plantilla
6. Malla de turnos ahora REQUIERE esta cobertura
7. Planificador ve advertencia si no cumple
```

### Flujo 3: Configurar Intercambio de Turnos
```
1. Admin configura política:
   - Permitir intercambio: SÍ
   - Tiempo mínimo: 48h
   - Debe ser mismo rol: SÍ
   - Requiere aprobación: SÍ (Planificador)
2. Empleado luego solicita cambio con compañero
3. Sistema VALIDA:
   - ✓ Cumple 48h de antelación
   - ✓ Ambos son Vendedores (mismo rol)
   - ✓ No violaría descanso interjornada
   - ✓ No excedería horas máximas
4. Solicitud va a Planificador
5. Planificador aprueba
6. Cambio se efectúa
7. Auditoría registra: "Cambio solicitado por Juan, aprobado por Planificador, ejecutado en [turno]"
```

---

## 7. VALIDACIONES CRÍTICAS

### En Backend (Todo debe filtrar por empresa_id)

**GET /api/admin/empresa/:empresa_id/config** → Devuelve SOLO config de esa empresa  
**POST /api/admin/empresa/:empresa_id/config** → Guarda SOLO para esa empresa  
**GET /api/admin/empresa/:empresa_id/perfiles** → SOLO perfiles de esa empresa  
**PUT /api/admin/empresa/:empresa_id/intensidad-laboral** → SOLO esa empresa  
**DELETE /api/admin/empresa/:empresa_id/festivos/:id** → SOLO si pertenece a esa empresa  

**Middleware de validación:**
```javascript
// Validar que usuario sea admin de la empresa_id en la URL
router.use('/:empresa_id', (req, res, next) => {
  const userEmpresaId = req.user.empresa_id
  const urlEmpresaId = req.params.empresa_id
  
  if (userEmpresaId != urlEmpresaId && req.user.role != 'super_admin') {
    return res.status(403).json({ error: 'No autorizado para esta empresa' })
  }
  next()
})
```

### En Frontend (Todo usa empresa_id del usuario)
```javascript
const empresa_id = user.empresa_id // Tomado del localStorage
const response = await fetch(`/api/admin/empresa/${empresa_id}/perfiles`)
```

---

## 8. TIMELINE ESTIMADO

| Fase | Tarea | Días | Estado |
|------|-------|------|--------|
| 1 | Plan + Especificación | 1 | ✅ EN PROGRESO |
| 2 | Backend: Tablas + Migraciones | 3-4 | 📋 Pendiente |
| 3 | Backend: Endpoints (13 módulos) | 5-7 | 📋 Pendiente |
| 4 | Backend: Validaciones + Middleware | 2-3 | 📋 Pendiente |
| 5 | Frontend: Componentes (13 módulos) | 6-8 | 📋 Pendiente |
| 6 | Frontend: Styling + Responsiva | 2-3 | 📋 Pendiente |
| 7 | Integración + Testing | 2-3 | 📋 Pendiente |
| **TOTAL** | | **20-25 días** | |

---

## 9. CRITERIOS DE ÉXITO

✅ Admin Empresa puede configurar TODOS los parámetros operacionales  
✅ Cada cambio SOLO afecta su empresa (multi-tenant validado)  
✅ Super Admin PUEDE cambiar configs de otras empresas (sección especial)  
✅ Cambios se validan automáticamente contra mallas existentes  
✅ Hay alertas/warnings de impacto  
✅ Sistema es intuitivo y autoexplicativo  
✅ Documentación clara en cada sección  
✅ Pruebas: 40+ test cases de validación  
✅ Performance: Carga rápida incluso con 1000s de registros  
✅ Seguridad: TODOS los endpoints filtran por empresa_id  

---

## 10. SIGUIENTES PASOS

1. ✅ **Completado:** Plan + Especificación
2. 📋 **Siguiente:** Crear estructura backend (tablas + migrations)
3. 📋 **Luego:** Implementar endpoints backend
4. 📋 **Luego:** Crear componentes frontend
5. 📋 **Luego:** Testing e integración

**¿Procedemos con backend?**
