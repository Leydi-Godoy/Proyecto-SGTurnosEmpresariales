# 🏗️ Arquitectura: Generador Automático de Mallas

## Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO (Planificador)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (React/Vite)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PlanificadorDashboard                                      │
│  └─ MallasTurnos.jsx                                        │
│     ├─ Formulario Generador Automático                      │
│     │  ├─ Selector de Configuración                         │
│     │  ├─ Input Fecha Inicio                                │
│     │  ├─ Input Cantidad Semanas                            │
│     │  ├─ Selector Distribución                             │
│     │  └─ [🚀 Generar Malla]                                │
│     │                                                       │
│     └─ Lista de Mallas Generadas                            │
│        ├─ Tarjeta Malla 1                                   │
│        ├─ Tarjeta Malla 2                                   │
│        └─ ...                                               │
│                                                             │
│  MallasTurnos.css (Estilos)                                 │
│  └─ Gradient backgrounds                                    │
│  └─ Animaciones                                             │
│  └─ Responsive design                                       │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/JSON + JWT
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                BACKEND (Express.js)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /api/planificador (nuevo router)                           │
│  ├─ POST /generar-malla                                     │
│  │  ├─ Validar JWT                                          │
│  │  ├─ Validar rol (Planificador)                           │
│  │  ├─ Validar datos de entrada                             │
│  │  ├─ Validar acceso multitenant                           │
│  │  └─ Llamar: generadorMallas.generarMalla()               │
│  │                                                         │
│  ├─ GET /mallas                                             │
│  │  ├─ Validar JWT                                          │
│  │  ├─ Listar por empresa                                   │
│  │  └─ Retornar con estadísticas                            │
│  │                                                         │
│  ├─ GET /mallas/:id                                         │
│  │  ├─ Obtener configuración                                │
│  │  ├─ Obtener turnos                                       │
│  │  └─ Obtener instancias                                   │
│  │                                                         │
│  ├─ POST /asignar-turno                                     │
│  │  ├─ Validaciones                                         │
│  │  ├─ Insertar en asignaciones_turno                       │
│  │  └─ Registrar auditoría                                  │
│  │                                                         │
│  └─ GET /cobertura                                          │
│     ├─ Calcular estadísticas                                │
│     ├─ Filtrar por período                                  │
│     └─ Retornar resumen                                     │
│                                                             │
│  generadorMallas.js (servicio)                              │
│  ├─ _generarInstancias()                                    │
│  ├─ _validarCumplimientoLegal()                             │
│  ├─ _guardarInstancias()                                    │
│  ├─ _registrarAuditoria()                                   │
│  └─ (otros métodos privados)                                │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           DATABASE (MySQL/MariaDB)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 configuraciones_malla                                   │
│  ├─ id, empresa_id, nombre, cantidad_empleados              │
│  ├─ horas_por_semana, horas_por_mes                         │
│  └─ tipo_distribucion, activo, creado_en                    │
│                                                             │
│  🎯 plantillas_turno                                         │
│  ├─ id, empresa_id, nombre, tipo                            │
│  ├─ hora_inicio, hora_fin, es_nocturno                      │
│  └─ patron_recurrencia, creado_en                           │
│                                                             │
│  👥 empleados                                               │
│  ├─ id, empresa_id, usuario_id, codigo_empleado             │
│  ├─ especialidad_id, estado                                 │
│  └─ fecha_ingreso, creado_en                                │
│                                                             │
│  📅 instancias_turno (↑ GENERADAS)                           │
│  ├─ id, plantilla_id, fecha, inicio_fecha_hora              │
│  ├─ fin_fecha_hora, sede_id                                 │
│  ├─ creado_por, creado_en                                   │
│  └─ (Hasta 80+ registros por malla)                          │
│                                                             │
│  ✅ asignaciones_turno                                       │
│  ├─ id, instancia_turno_id, empleado_id                     │
│  ├─ estado, asignado_en, asignado_por                       │
│  └─ confirmado_en, confirmado_por                           │
│                                                             │
│  📝 registros_auditoria (↑ REGISTRADOS)                      │
│  ├─ id, empresa_id, usuario_id, accion                      │
│  ├─ tabla_objetivo, id_objetivo, detalles                   │
│  └─ creado_en                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de Generación Detallado

```
1️⃣ USUARIO INICIA GENERACIÓN
   └─ Completa formulario en frontend
   └─ Click en "🚀 Generar Malla"
   
   ↓
   
2️⃣ FRONTEND PREPARA REQUEST
   └─ Valida campos localmente
   └─ Obtiene JWT del localStorage
   └─ Construye payload JSON
   └─ POST /api/planificador/generar-malla
   
   ↓
   
3️⃣ BACKEND RECIBE REQUEST
   └─ Extrae token JWT
   └─ Valida token (middleware)
   └─ Extrae usuario_id, rol, empresa_id
   
   ↓
   
4️⃣ VALIDACIÓN DE PERMISOS
   └─ ¿Usuario es Planificador+? ✓
   └─ ¿Acceso a esta empresa? ✓
   
   ↓
   
5️⃣ VALIDACIÓN DE DATOS
   └─ ¿Configuración existe? ✓
   └─ ¿Configuración pertenece a empresa? ✓
   └─ ¿Fecha válida? ✓
   └─ ¿Semanas entre 1-52? ✓
   
   ↓
   
6️⃣ VALIDACIÓN DE RECURSOS
   └─ ¿Empleados activos ≥ requeridos? ✓
   └─ ¿Plantillas configuradas? ✓
   
   ↓
   
7️⃣ GENERADOR DE MALLAS ACTÚA
   └─ Obtiene configuración
   └─ Obtiene turnos asignados
   └─ Obtiene empleados
   └─ Genera instancias (algoritmo equilibrado)
   │  ├─ Distribuye turnos equitativamente
   │  ├─ Calcula descansos
   │  └─ Asigna 80+ instancias
   └─ Valida cumplimiento legal
   │  ├─ Verifica 42 hrs/semana
   │  └─ Verifica 182 hrs/mes
   
   ↓
   
8️⃣ PERSISTENCIA EN BD
   └─ Inserta en instancias_turno (80+ registros)
   └─ Registra en registros_auditoria
   │  ├─ usuario_id
   │  ├─ empresa_id
   │  ├─ accion: "generar_malla_automatica"
   │  ├─ cantidad de instancias
   │  └─ timestamp
   
   ↓
   
9️⃣ RESPUESTA AL FRONTEND
   └─ Status: 201 Created
   └─ JSON:
      ├─ exito: true
      ├─ totalInstancias: 80
      ├─ periodo: {inicio, fin, semanas}
      └─ resumenLegal: {esValido, hrs}
   
   ↓
   
🔟 FRONTEND ACTUALIZA UI
   └─ Muestra: "✓ Malla generada exitosamente"
   └─ Recarga lista de mallas
   └─ Limpia formulario
   └─ Cierra el generador
```

---

## Matriz de Decisiones

```
ENTRADA                    VALIDACIÓN              RESULTADO
═══════════════════════════════════════════════════════════════

empresa_id = 1
configuracion_id = 5       ✓ Existe                 Continue
fecha = 2026-10-01         ✓ Formato válido         Continue
semanas = 4                ✓ Rango 1-52             Continue
distribución = equilibrada ✓ Tipo válido            Continue
                                                      ↓
                           ✓ Empleados suficientes  Generate
                           ✓ Legal compliance       ✓ Success
                                                      ↓
                           ✗ Empleados insuficientes → Error 400
                           ✗ Config no activa       → Error 404
                           ✗ Permisos insuficientes → Error 403
                           ✗ Fecha inválida         → Error 400
```

---

## Stack Tecnológico

```
FRONTEND                    BACKEND                 DATABASE
════════════════════════════════════════════════════════════════

React 18                    Express.js              MySQL/MariaDB
├─ Hooks (useState)         ├─ Routing              ├─ InnoDB
├─ Fetch API               ├─ Middleware           ├─ UTF-8
└─ CSS3                    ├─ JWT Auth             └─ Triggers
                           ├─ Error Handling
Vite 5                      │                       node-mysql2
├─ Hot reload              └─ Logging              ├─ Pool
├─ Building                                        ├─ Promises
└─ Optimization            Node.js 16+             └─ SSL-ready
                           ├─ Async/Await
CSS3                        ├─ ES6+
├─ Gradients               └─ bcryptjs
├─ Animations
├─ Flexbox                 jwt/jsonwebtoken
└─ Grid                    ├─ Verify
                           └─ Sign

Babel                       dotenv
├─ JSX                     ├─ Config
├─ Modern JS               └─ Secrets
└─ Polyfills
```

---

## Seguridad en Capas

```
┌──────────────────────────────────────────────────────────┐
│  CAPA 1: AUTENTICACIÓN                                   │
│  └─ JWT Token obligatorio en Headers                     │
│  └─ Validación en middleware                             │
│  └─ Rechazo si token inválido/expirado                   │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  CAPA 2: AUTORIZACIÓN                                    │
│  └─ Verificación de rol                                  │
│  └─ Planificador (4), Admin (2), Super Admin (1)         │
│  └─ Rechazo si rol insuficiente                          │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  CAPA 3: ACCESO MULTITENANT                              │
│  └─ Usuario solo ve su empresa                           │
│  └─ Validación de empresa_id en cada query               │
│  └─ Rechazo si empresa no coincide                       │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  CAPA 4: VALIDACIÓN DE DATOS                             │
│  └─ Tipos correctos                                      │
│  └─ Rangos permitidos                                    │
│  └─ Formatos válidos                                     │
│  └─ SQL Injection prevention (prepared statements)       │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  CAPA 5: VALIDACIÓN DE LÓGICA                            │
│  └─ Configuración existe y activa                        │
│  └─ Empleados suficientes                                │
│  └─ Cumplimiento legal                                   │
│  └─ Estado consistente en BD                             │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  CAPA 6: AUDITORÍA                                       │
│  └─ Registro de todas las operaciones                    │
│  └─ Usuario, fecha, acción, detalles                     │
│  └─ Trazabilidad completa                                │
└──────────────────────────────────────────────────────────┘
```

---

## Estados de la Malla

```
CREACIÓN
  │
  ├─ BORRADOR (En construcción)
  │  ├─ Sin validar
  │  ├─ Editable
  │  └─ No visible a empleados
  │
  ├─ VALIDADA (Cumple normas)
  │  ├─ Cobertura OK
  │  ├─ Legal OK
  │  └─ Lista para publicar
  │
  └─ ACTIVA/PUBLICADA (En uso)
     ├─ Visible a empleados
     ├─ Asignaciones activas
     └─ En ejecución
```

---

## Métricas de Rendimiento

```
OPERACIÓN               TIEMPO TÍPICO    LIMITE
═══════════════════════════════════════════════════

Generar 80 turnos       250-500 ms       <1000 ms
Validar legal           50-100 ms        <200 ms
Guardar en BD           150-300 ms       <500 ms
Cargar lista mallas     100-200 ms       <500 ms
Auditoría               30-50 ms         <100 ms
─────────────────────────────────────────────────
TOTAL REQUEST           500-1200 ms      <2000 ms
```

---

**Diagrama creado:** 23 de Septiembre de 2026  
**Versión:** 2.0.0  
**Status:** ✅ Documentado  
