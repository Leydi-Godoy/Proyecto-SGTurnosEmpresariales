# PASO 2 FASE 2.1: Modalidades Personalizadas
## Migración 16 - Extender plantillas_turno para soportar patrones rotativos

**Fecha:** 22 Septiembre 2026

### Cambios Realizados

#### 1. Base de Datos
- **Archivo:** `backend/migrations/16_agregar_modalidades_personalizadas.sql`
- **Cambios a `plantillas_turno`:**
  - ✅ Agregar columna `es_personalizada` (TINYINT(1), default 0)
  - ✅ Agregar columna `patron_rotativo` (JSON, para almacenar patrones complejos)
  - ✅ Agregar índice para búsquedas rápidas por personalización

#### 2. Backend (Node.js / Express)
- **Archivo:** `backend/routes/plantillas.js`
- **Cambios:**
  - ✅ Actualizado POST `/api/plantillas-turno` para aceptar modalidades personalizadas
  - ✅ Ahora acepta: `es_personalizada`, `patron_rotativo`, `tipo`, `descripcion`
  - ✅ Validaciones condicionales según tipo (fija vs personalizada)
  - ✅ Almacena JSON del patrón cuando es personalizado
  - ✅ Corregidos errores de autenticación (`req.user` → `req.auth`)

#### 3. Frontend (React)
- **Archivo:** `frontend/src/components/ModalidadesTurnos.jsx`
- **Cambios:**
  - ✅ Agregada sección "🎨 Crear Modalidad Personalizada"
  - ✅ Interfaz para definir patrón de 7 días
  - ✅ Selector de tipo de turno por día (12D, 12N, 8D, 8N, 6D, 6N, CMP, DESC)
  - ✅ Entrada de horas por día
  - ✅ Validación de horas totales por ciclo
  - ✅ Listado de modalidades personalizadas creadas
  - ✅ Integrado en misma pestaña (sin crear nuevas pestañas)

- **Archivo:** `frontend/src/index.css`
- **Cambios:**
  - ✅ Agregados estilos para formulario de modalidades personalizadas
  - ✅ Estilos para patrón de días
  - ✅ Tarjetas para mostrar modalidades personalizadas
  - ✅ Tema visual coherente con diseño existente

### Instrucciones de Implementación

#### Paso 1: Ejecutar Migración SQL

**En phpMyAdmin:**
1. Abre phpMyAdmin → base de datos `sgturnos_empresas`
2. Ve a la pestaña "SQL"
3. Copia y pega el contenido de `backend/migrations/16_agregar_modalidades_personalizadas.sql`
4. Click en "Ejecutar"

**O desde línea de comandos (MySQL):**
```bash
mysql -u usuario -p sgturnos_empresas < backend/migrations/16_agregar_modalidades_personalizadas.sql
```

#### Paso 2: Reiniciar Backend
```bash
# Terminal backend
npm start
# O si está corriendo: Ctrl+C y npm start nuevamente
```

#### Paso 3: Verificar Cambios en Frontend
- El componente ModalidadesTurnos ahora muestra:
  1. **Sección Superior:** Modalidades fijas predeterminadas (8h, 12h, 6h, Rotativo)
  2. **Sección Media:** 🎨 Crear Modalidad Personalizada (NUEVA)
  3. **Sección Inferior:** ⚙️ Configuración de Mallas

### Funcionamiento

#### Admin Empresa
1. Va a "Modalidades de Turnos & Configuración de Mallas"
2. Hace click en "+ Crear Modalidad Personalizada"
3. Llena:
   - **Nombre:** "12D-12D-DESC-12N-DESC-DESC-12N"
   - **Descripción:** "Sistema rotativo de mi empresa"
   - **Patrón de 7 días:** Define qué sucede cada día
4. Click en "Guardar Modalidad"
5. La modalidad aparece en el listado "Modalidades Personalizadas Creadas"

#### Planificador
1. Verá todas las modalidades (fijas + personalizadas)
2. Al crear una configuración de malla, podrá seleccionar:
   - Las modalidades predeterminadas
   - Las modalidades personalizadas creadas por su Admin
3. La generación automática usará el patrón definido

### Estructura JSON del Patrón

```json
[
  { "dia": 1, "tipo": "12D", "horas": 12 },
  { "dia": 2, "tipo": "12D", "horas": 12 },
  { "dia": 3, "tipo": "DESC", "horas": 0 },
  { "dia": 4, "tipo": "12N", "horas": 12 },
  { "dia": 5, "tipo": "DESC", "horas": 0 },
  { "dia": 6, "tipo": "DESC", "horas": 0 },
  { "dia": 7, "tipo": "12N", "horas": 12 }
]
```

### Tipos de Turnos Soportados

| Código | Descripción | Horas |
|--------|-------------|-------|
| 12D | 12 horas Día | 12 |
| 12N | 12 horas Noche | 12 |
| 8D | 8 horas Día | 8 |
| 8N | 8 horas Noche | 8 |
| 6D | 6 horas Día | 6 |
| 6N | 6 horas Noche | 6 |
| CMP | Comité Primario | 3 |
| DESC | Descanso | 0 |

### Testing

**Prueba 1: Crear Modalidad Personalizada**
- Admin Empresa → ModalidadesTurnos
- "+ Crear Modalidad Personalizada"
- Nombre: "Mi Patrón"
- Rellenar patrón
- Click "Guardar Modalidad"
- ✅ Debe aparecer en "Modalidades Personalizadas Creadas"

**Prueba 2: Usar en Configuración**
- Admin Empresa → Crear Configuración de Malla
- Seleccionar la modalidad personalizada como una de las plantillas
- Generar malla
- ✅ Debe respetar el patrón definido

**Prueba 3: Ver en Planificador**
- Planificador → ModalidadesTurnos (cuando se integre)
- ✅ Debe ver todas las modalidades (fijas + personalizadas)

### Notas Técnicas

- **Sin nuevas tablas:** Las modalidades personalizadas se almacenan en la misma tabla `plantillas_turno`
- **Compatibilidad:** Las modalidades fijas existentes continúan funcionando igual
- **Escalabilidad:** Se pueden crear ilimitadas modalidades personalizadas por empresa
- **Seguridad:** Multi-tenant verification en POST
- **Formato:** Patrón almacenado como JSON para flexibilidad

### Archivos Modificados

1. ✅ `backend/migrations/16_agregar_modalidades_personalizadas.sql` (NUEVO)
2. ✅ `backend/routes/plantillas.js` (MODIFICADO)
3. ✅ `backend/routes/configuraciones-malla.js` (CORREGIDO: req.user → req.auth)
4. ✅ `frontend/src/components/ModalidadesTurnos.jsx` (MODIFICADO)
5. ✅ `frontend/src/index.css` (MODIFICADO)

### Status Final

- ✅ Código implementado
- ⏳ BD: Espera migración SQL
- ⏳ Testing: Espera pruebas del usuario
- ⏳ Integración Planificador: Próxima fase

