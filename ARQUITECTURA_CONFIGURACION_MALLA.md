# 🏗️ ARQUITECTURA: CONFIGURACIÓN DE MALLA DE TURNOS

## 📐 Diagrama de Relaciones de Base de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE CONFIGURACIÓN DE MALLA                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   EMPRESAS       │
├──────────────────┤
│ id (PK)          │
│ nombre           │
│ nit              │
│ ...              │
└────────┬─────────┘
         │ (1:N)
         │
         │ empresa_id
         ↓
┌──────────────────────────────────────┐
│  CONFIGURACIONES_MALLA               │
├──────────────────────────────────────┤
│ id (PK)                              │
│ empresa_id (FK) → empresas           │
│ nombre (UNIQUE)                      │
│ cantidad_empleados                   │
│ horas_por_semana = 42                │
│ horas_por_mes = 182                  │
│ dias_laborales_por_semana            │
│ cantidad_turnos                      │
│ tipo_distribucion (enum)             │
│ descripcion                          │
│ activo                               │
│ creado_por (FK) → usuarios           │
│ creado_en                            │
│ actualizado_por (FK) → usuarios      │
│ actualizado_en                       │
└─────────────┬──────────────────────┬─┘
              │ (1:N)                │
              │ configuracion_id     │
              │                      └────────────────┐
              ↓                                       │
┌──────────────────────────────────────┐             │
│  CONFIGURACIONES_MALLA_TURNOS        │             │
├──────────────────────────────────────┤             │
│ id (PK)                              │             │
│ configuracion_id (FK)    ◄───────────┘  (M:N)    │
│ plantilla_id (FK)        ◄────────────────────────┘
│ orden (1, 2, 3...)                   │
│ duracion_horas (8, 12)               │
│ creado_en                            │
│                                      │
│ UNIQUE: (configuracion_id, plantilla_id)
└──────────────┬───────────────────────┘
               │ (N:1)
               │
               ↓
         ┌──────────────────┐
         │ PLANTILLAS_TURNO │
         ├──────────────────┤
         │ id (PK)          │
         │ nombre           │
         │ hora_inicio      │
         │ hora_fin         │
         │ duracion_horas   │
         └──────────────────┘
```

## 🔄 Flujo de Datos: Frontend → Backend → Database

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                           │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  ConfiguracionMalla.jsx                                     │  │
│  │  ┌───────────────────────────────────────────────────────┐ │  │
│  │  │ Listar configuraciones                                │ │  │
│  │  │ Crear nueva configuración                             │ │  │
│  │  │ Editar configuración                                  │ │  │
│  │  │ Eliminar configuración                                │ │  │
│  │  │ Dropdown de plantillas disponibles                    │ │  │
│  │  │ Gestión dinámica de turnos (add/remove)              │ │  │
│  │  └───────────────────────────────────────────────────────┘ │  │
│  │                    ConfiguracionMalla.css                    │  │
│  │           (Estilos: gradiente, cards, formularios)          │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────┬──────────────────────────────────────────────────┘
                 │ HTTP (JSON)
                 │ Headers: Authorization: Bearer JWT
                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Express)                          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  configuraciones-malla.js                                   │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ GET /api/configuraciones-malla                       │  │  │
│  │  │   → Listar configuraciones por empresa               │  │  │
│  │  │   → SELECT FROM configuraciones_malla WHERE ...      │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ POST /api/configuraciones-malla (crear)              │  │  │
│  │  │   → Validar JWT y rol (Admin Empresa)                │  │  │
│  │  │   → Validar datos                                    │  │  │
│  │  │   → INSERT INTO configuraciones_malla                │  │  │
│  │  │   → INSERT INTO configuraciones_malla_turnos (loop)  │  │  │
│  │  │   → LOG en registros_auditoria                       │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ GET /api/configuraciones-malla/:id (obtener)         │  │  │
│  │  │   → Validar acceso                                   │  │  │
│  │  │   → SELECT configuración + turnos asociados (JOIN)   │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ PUT /api/configuraciones-malla/:id (actualizar)      │  │  │
│  │  │   → Validar JWT y rol                                │  │  │
│  │  │   → UPDATE configuraciones_malla                     │  │  │
│  │  │   → DELETE configuraciones_malla_turnos (cascade)    │  │  │
│  │  │   → INSERT nuevos turnos                             │  │  │
│  │  │   → LOG en auditoría                                 │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ DELETE /api/configuraciones-malla/:id (eliminar)     │  │  │
│  │  │   → Validar acceso                                   │  │  │
│  │  │   → DELETE configuraciones_malla                     │  │  │
│  │  │   → (turnos se borran en cascade)                    │  │  │
│  │  │   → LOG en auditoría                                 │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  Funciones auxiliares:                                      │  │
│  │  • authenticateToken(JWT)                                  │  │
│  │  • isAdminEmpresa(role)                                    │  │
│  │  • logAction(audit trail)                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────┬──────────────────────────────────────────────────┘
                 │ SQL (mysql2/promise)
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (MariaDB/MySQL)                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ TABLE: configuraciones_malla                                 │  │
│  │ ├─ id (PK)                                                   │  │
│  │ ├─ empresa_id (FK → empresas) [INDEX]                       │  │
│  │ ├─ nombre (UNIQUE con empresa_id)                           │  │
│  │ ├─ cantidad_empleados, horas_*, turnos, tipo                │  │
│  │ ├─ activo [INDEX]                                           │  │
│  │ └─ auditoría: creado_por, creado_en, actualizado_*, ...    │  │
│  │                                                              │  │
│  │ TABLE: configuraciones_malla_turnos (M2M)                   │  │
│  │ ├─ id (PK)                                                   │  │
│  │ ├─ configuracion_id (FK) [INDEX]                            │  │
│  │ ├─ plantilla_id (FK) [INDEX]                                │  │
│  │ ├─ UNIQUE (configuracion_id, plantilla_id)                  │  │
│  │ └─ orden, duracion_horas, creado_en                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ TABLE: registros_auditoria (auditoría de cambios)           │  │
│  │ ├─ id, empresa_id, usuario_id                               │  │
│  │ ├─ accion (CREATE, UPDATE, DELETE)                          │  │
│  │ ├─ tabla_objetivo (configuraciones_malla)                   │  │
│  │ ├─ id_objetivo, detalles (JSON), creado_en                 │  │
│  │ └─ [INDEX] empresa_id, tabla_objetivo                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Referencias (FK):                                                  │
│  ├─ configuraciones_malla.empresa_id → empresas.id                 │
│  ├─ configuraciones_malla.creado_por → usuarios.Id_usuario         │
│  ├─ configuraciones_malla_turnos.configuracion_id → ... (CASCADE)  │
│  └─ configuraciones_malla_turnos.plantilla_id → plantillas_turno   │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Ejemplo de Datos: Malla 2x12h

```
┌─────────────────────────────────────────────────────────────────┐
│ CONFIGURACIÓN: "Malla 2x12h Empresa A"                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ID: 1                                                           │
│ Empresa: Empresa A (id=1)                                       │
│ Nombre: "Malla 2x12h Empresa A"                                │
│ Descripción: "Rotación Día/Noche para 60 empleados"            │
│                                                                 │
│ Configuración:                                                  │
│   • Cantidad empleados: 60                                      │
│   • Horas por semana: 42 (legal Colombia)                      │
│   • Horas por mes: 182 (legal Colombia)                        │
│   • Días laborales: 5                                           │
│   • Cantidad turnos: 2                                          │
│   • Tipo: "equilibrada" (puede usar generador)                 │
│   • Activo: Sí ✅                                              │
│                                                                 │
│ Creado por: Usuario ID 1 (Admin)                              │
│ Creado en: 2026-09-22 10:30:00                                │
│ Actualizado en: 2026-09-22 10:30:00                           │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ TURNOS ASIGNADOS:                                        │   │
│ ├──────────────────────────────────────────────────────────┤   │
│ │                                                          │   │
│ │ Turno 1:                                                │   │
│ │   • Plantilla: "Turno Día" (id=1)                      │   │
│ │   • Orden: 1                                            │   │
│ │   • Duración: 12 horas                                 │   │
│ │   • Horario: 09:00 - 21:00                            │   │
│ │                                                          │   │
│ │ Turno 2:                                                │   │
│ │   • Plantilla: "Turno Noche" (id=2)                   │   │
│ │   • Orden: 2                                            │   │
│ │   • Duración: 12 horas                                 │   │
│ │   • Horario: 21:00 - 09:00                            │   │
│ │                                                          │   │
│ └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

SQL Equivalente:
─────────────────

SELECT 
  cm.id,
  cm.nombre,
  cm.cantidad_empleados,
  cm.horas_por_semana,
  cm.horas_por_mes,
  cm.cantidad_turnos,
  cm.tipo_distribucion,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'plantilla_id', cmt.plantilla_id,
      'orden', cmt.orden,
      'duracion_horas', cmt.duracion_horas,
      'nombre_turno', pt.nombre
    )
  ) as turnos
FROM configuraciones_malla cm
LEFT JOIN configuraciones_malla_turnos cmt ON cm.id = cmt.configuracion_id
LEFT JOIN plantillas_turno pt ON cmt.plantilla_id = pt.id
WHERE cm.id = 1
GROUP BY cm.id;

Resultado JSON:
───────────────
{
  "id": 1,
  "nombre": "Malla 2x12h Empresa A",
  "cantidad_empleados": 60,
  "horas_por_semana": 42,
  "horas_por_mes": 182,
  "cantidad_turnos": 2,
  "tipo_distribucion": "equilibrada",
  "turnos": [
    {
      "plantilla_id": 1,
      "orden": 1,
      "duracion_horas": 12,
      "nombre_turno": "Turno Día"
    },
    {
      "plantilla_id": 2,
      "orden": 2,
      "duracion_horas": 12,
      "nombre_turno": "Turno Noche"
    }
  ]
}
```

## 🔄 Ciclo de Vida de una Configuración

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CREACIÓN                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Usuario: Admin Empresa                                    │
│  Acción: POST /api/configuraciones-malla                   │
│  Datos: { nombre, cantidad_empleados, turnos[] }           │
│                                                             │
│  Flujo:                                                    │
│    1. Valida JWT y rol ✅                                 │
│    2. Valida datos (nombre, cantidad_empleados, etc) ✅   │
│    3. Verifica nombre único por empresa ✅                │
│    4. Verifica plantillas existen ✅                      │
│    5. INSERT en configuraciones_malla ✅                  │
│    6. INSERT en configuraciones_malla_turnos (loop) ✅     │
│    7. LOG en registros_auditoria ✅                       │
│    8. Retorna ID creada y datos ✅                        │
│                                                             │
│  Estado: CREADA ✅                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. LECTURA                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Usuario: Admin Empresa                                    │
│  Acción: GET /api/configuraciones-malla (listar)           │
│  Acción: GET /api/configuraciones-malla/:id (detalles)     │
│                                                             │
│  Flujo:                                                    │
│    1. Valida JWT ✅                                       │
│    2. Valida acceso (empresa_id) ✅                       │
│    3. SELECT con JOIN a turnos ✅                         │
│    4. Retorna datos con estructura completa ✅            │
│                                                             │
│  Estado: VISIBLE ✅                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ACTUALIZACIÓN                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Usuario: Admin Empresa                                    │
│  Acción: PUT /api/configuraciones-malla/:id                │
│  Datos: { nombre, cantidad_empleados, turnos[] }           │
│                                                             │
│  Flujo:                                                    │
│    1. Valida JWT y rol ✅                                 │
│    2. Verifica que la config existe ✅                    │
│    3. Valida datos ✅                                     │
│    4. UPDATE configuraciones_malla ✅                     │
│    5. DELETE configuraciones_malla_turnos (por config) ✅  │
│    6. INSERT nuevos turnos (loop) ✅                      │
│    7. LOG en registros_auditoria ✅                       │
│    8. Retorna datos actualizados ✅                       │
│                                                             │
│  Estado: ACTUALIZADA ✅                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. ELIMINACIÓN                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Usuario: Admin Empresa                                    │
│  Acción: DELETE /api/configuraciones-malla/:id             │
│                                                             │
│  Flujo:                                                    │
│    1. Valida JWT y rol ✅                                 │
│    2. Verifica que la config existe ✅                    │
│    3. DELETE configuraciones_malla ✅                     │
│    4. Turnos se borran en cascade ✅ (no requiere query)  │
│    5. LOG en registros_auditoria ✅                       │
│    6. Retorna confirmación ✅                            │
│                                                             │
│  Estado: ELIMINADA ✅                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Control de Acceso

```
┌──────────────────────────────────────────────────────────────┐
│ MATRIZ DE PERMISOS                                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Acción          │ Super Admin (1) │ Admin Empresa (2) │    │
│                 │                 │                   │    │
│ GET (Listar)    │ ✅ Todas        │ ✅ De su empresa  │    │
│ GET (Detalles)  │ ✅ Todas        │ ✅ De su empresa  │    │
│ POST (Crear)    │ ✅ Cualquier    │ ✅ Su empresa     │    │
│ PUT (Editar)    │ ✅ Cualquier    │ ✅ Su empresa     │    │
│ DELETE (Borrar) │ ✅ Cualquier    │ ✅ Su empresa     │    │
│                 │                 │                   │    │
│ Planificador(3) │ ❌ No acceso    │                   │    │
│ Empleado (4+)   │ ❌ No acceso    │                   │    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 📈 Próximos Pasos: FASE 2 (Generador)

```
FASE 1: Configuración (ACTUAL)
  ✅ Crear malla
  ✅ Definir turnos
  ✅ Almacenar en BD
  
  RESULTADO: Estructura definida
             (configuraciones_malla con turnos)

                           ↓

FASE 2: Generador (PRÓXIMO)
  ⏳ Leer configuración
  ⏳ Distribuir empleados
  ⏳ Crear instancias_turno (cada día)
  ⏳ Crear asignaciones_turno (empleado↔turno)
  ⏳ Validar restricciones legales
  ⏳ Generar malla real para usar
  
  RESULTADO: Malla ejecutable
             (turnos específicos para empleados
              en fechas concretas)
```

---

**Versión**: 1.0
**Fecha**: 2026-09-22
