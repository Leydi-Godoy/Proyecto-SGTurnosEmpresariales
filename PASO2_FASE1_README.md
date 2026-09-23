# 📋 PASO 2 - FASE 1: Configuración de Malla de Turnos

## Estado Actual: ✅ CÓDIGO COMPLETADO - ⏳ PENDIENTE MIGRACIÓN SQL

---

## 🎯 Objetivo de FASE 1

Permitir que los **Administradores de Empresa** configuren la estructura base de cómo se distribuirán los turnos:
- Cantidad de empleados
- Horas legales por semana/mes
- Qué plantillas de turno forman la malla
- Orden y duración de cada turno

**Una vez completada FASE 1**, se puede proceder a FASE 2 (Generador Automático).

---

## 📦 Archivos Creados/Modificados

### ✅ NUEVO: Backend

**Archivo**: `backend/routes/configuraciones-malla.js` (263 líneas)

Proporciona 5 endpoints RESTful:

```javascript
GET    /api/configuraciones-malla
POST   /api/configuraciones-malla
GET    /api/configuraciones-malla/:id
PUT    /api/configuraciones-malla/:id
DELETE /api/configuraciones-malla/:id
```

**Características**:
- ✅ Autenticación JWT requerida
- ✅ Control de roles (Solo Admin Empresa y Super Admin)
- ✅ Multi-empresa (cada empresa ve solo sus configuraciones)
- ✅ Auditoría completa de acciones
- ✅ Gestión de array de turnos (M2M)
- ✅ Validaciones en backend

### ✅ NUEVO: Base de Datos

**Archivo**: `backend/migrations/15_crear_configuraciones_malla.sql` (180+ líneas)

Crea dos tablas:

#### Tabla 1: `configuraciones_malla`
```sql
Campos principales:
- id (PK)
- empresa_id (FK → empresas)
- nombre (unique por empresa)
- cantidad_empleados
- horas_por_semana (default 42)
- horas_por_mes (default 182)
- dias_laborales_por_semana
- cantidad_turnos
- tipo_distribucion (enum: equilibrada|personalizada)
- descripcion
- activo (boolean)
- creado_por, creado_en
- actualizado_por, actualizado_en

Índices:
- PK: id
- UNIQUE: (empresa_id, nombre)
- INDEX: empresa_id, activo, tipo_distribucion
```

#### Tabla 2: `configuraciones_malla_turnos`
```sql
Campos principales:
- id (PK)
- configuracion_id (FK → configuraciones_malla) CASCADE
- plantilla_id (FK → plantillas_turno) CASCADE
- orden (posición en la rotación)
- duracion_horas (horas del turno)
- creado_en

Restricciones:
- UNIQUE: (configuracion_id, plantilla_id)
- M2M relationship

Índices:
- PK: id
- FK: configuracion_id, plantilla_id
```

### ✅ NUEVO: Frontend

**Archivo**: `frontend/src/components/ConfiguracionMalla.jsx` (458 líneas)

**Archivo**: `frontend/src/components/ConfiguracionMalla.css` (400+ líneas)

**Componente React** con:
- ✅ Listar todas las configuraciones
- ✅ Crear nueva configuración
- ✅ Editar configuración existente
- ✅ Eliminar configuración
- ✅ Dropdown de plantillas disponibles
- ✅ Gestión dinámica de turnos (agregar/quitar)
- ✅ Validaciones en frontend
- ✅ Mensajes de error/éxito
- ✅ Indicadores de carga
- ✅ Diseño responsive

**UI Features**:
- Gradiente azul profesional
- Cards animadas
- Formularios intuitivos
- Retroalimentación visual
- Tema oscuro/moderno

### ✅ MODIFICADO: Backend

**Archivo**: `backend/index.js`

Agregada la ruta:
```javascript
app.use('/api/configuraciones-malla', require('./routes/configuraciones-malla'));
```

---

## 📊 Estructura de Datos

### Ejemplo: Malla 2x12h

```
Configuración:
├─ Nombre: "Malla 2x12h Rotatoria"
├─ Cantidad empleados: 60
├─ Horas por semana: 42
├─ Horas por mes: 182
├─ Cantidad turnos: 2
├─ Tipo: "equilibrada"
└─ Turnos:
   ├─ Turno Día (09:00-21:00) - orden 1 - 12 horas
   └─ Turno Noche (21:00-09:00) - orden 2 - 12 horas
```

### Ejemplo: Malla 3x8h

```
Configuración:
├─ Nombre: "Malla 3x8h Estándar"
├─ Cantidad empleados: 45
├─ Horas por semana: 40
├─ Horas por mes: 160
├─ Cantidad turnos: 3
├─ Tipo: "equilibrada"
└─ Turnos:
   ├─ Turno Mañana (06:00-14:00) - orden 1 - 8 horas
   ├─ Turno Tarde (14:00-22:00) - orden 2 - 8 horas
   └─ Turno Noche (22:00-06:00) - orden 3 - 8 horas
```

---

## 🚀 Pasos para Activar FASE 1

### Paso 1: Ejecutar la Migración SQL ⏳ PENDIENTE

1. Abre `http://localhost/phpmyadmin`
2. Selecciona tu base de datos
3. Ve a la pestaña "SQL"
4. Abre `backend/migrations/15_crear_configuraciones_malla.sql`
5. Copia TODO el contenido
6. Pégalo en phpMyAdmin
7. Haz clic en "Ejecutar"

**Ver instrucciones detalladas**: `INSTRUCCIONES_MIGRACION_15.md`

### Paso 2: Reiniciar Backend ⏳ PENDIENTE

```bash
# En la terminal del backend
Ctrl + C
npm run dev
```

Deberías ver sin errores de conexión a las nuevas tablas.

### Paso 3: Probar Endpoints ⏳ PENDIENTE

Opción A - Con curl:
```bash
# Listar configuraciones
curl -X GET http://localhost:3001/api/configuraciones-malla \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Opción B - Con Postman:
1. Importa la colección si tienes
2. Usa el endpoint GET `/api/configuraciones-malla`
3. Asegúrate de incluir el token JWT

### Paso 4: Integrar en Dashboard ⏳ PENDIENTE

Añade el componente a tu dashboard de Admin Empresa:

```jsx
import ConfiguracionMalla from './components/ConfiguracionMalla';

export default function AdminEmpresaDashboard() {
  const [activeTab, setActiveTab] = useState('configuracion');
  
  return (
    <div>
      <button onClick={() => setActiveTab('configuracion')}>
        Configuración de Malla
      </button>
      
      {activeTab === 'configuracion' && <ConfiguracionMalla />}
    </div>
  );
}
```

### Paso 5: Crear Configuración de Prueba ⏳ PENDIENTE

1. Abre la aplicación en `http://localhost:5173`
2. Inicia sesión como Admin Empresa
3. Ve a "Configuración de Malla"
4. Clic en "Nueva Configuración"
5. Llena el formulario:
   - Nombre: "Malla de Prueba"
   - Cantidad empleados: 30
   - Cantidad turnos: 2
   - Selecciona "Turno Día" y "Turno Noche"
6. Haz clic en "Guardar"

---

## ✅ Checklist de Validación

- [ ] Migración SQL ejecutada sin errores
- [ ] Tablas `configuraciones_malla` y `configuraciones_malla_turnos` existen
- [ ] Backend reiniciado correctamente
- [ ] Endpoint GET `/api/configuraciones-malla` responde (vacío es ok)
- [ ] Componente `ConfiguracionMalla.jsx` existe
- [ ] Componente integrado en Dashboard
- [ ] Puedo crear una nueva configuración desde UI
- [ ] Puedo ver la configuración creada en la lista
- [ ] Puedo editar la configuración
- [ ] Puedo eliminar la configuración
- [ ] La auditoría registra las acciones

---

## 📝 Validaciones Implementadas

### Frontend
- ✅ Nombre requerido
- ✅ Cantidad empleados mínimo 2
- ✅ Cantidad turnos mínimo 1
- ✅ Al menos un turno debe estar asignado
- ✅ Validaciones de campos numéricos

### Backend
- ✅ Token JWT válido
- ✅ Rol: Solo Admin Empresa (1, 2)
- ✅ Empresa_id coherente
- ✅ Plantillas existen antes de asignar
- ✅ Nombres únicos por empresa
- ✅ Auditoría de acciones

---

## 🔐 Seguridad

**Control de Acceso:**
- Solo usuarios autenticados con JWT
- Solo Admin Empresa (rol 1, 2)
- Cada empresa ve solo sus datos
- Validaciones en backend

**Auditoría:**
- Toda acción se registra en `registros_auditoria`
- Usuario que realizó la acción
- Timestamp de creación/modificación
- Detalles JSON de cambios

---

## 📈 Próximos Pasos (FASE 2: Generador)

Una vez completada FASE 1, procederemos a FASE 2:

### FASE 2 Components

**Backend**:
- `backend/services/generadorMallas.js`
- Algoritmo de distribución equilibrada
- Validaciones legales (42h/semana, rotaciones, etc)
- Endpoint: `POST /api/mallas/{id}/generar`

**Base de Datos**:
- Poblar `instancias_turno` (cada día del mes)
- Poblar `asignaciones_turno` (empleado↔turno)

**Frontend**:
- Interfaz para seleccionar configuración y mes
- Preview de la malla generada
- Botón "Generar Malla"
- Validaciones antes de generar

---

## 🔗 Documentación Relacionada

- [Backend Routes](../backend/routes/configuraciones-malla.js)
- [Frontend Component](../frontend/src/components/ConfiguracionMalla.jsx)
- [SQL Migration](../backend/migrations/15_crear_configuraciones_malla.sql)
- [Instrucciones Migración](INSTRUCCIONES_MIGRACION_15.md)

---

## 💬 Notas Técnicas

### Relación M2M (Muchos a Muchos)

Una malla puede tener varios turnos.
Un turno puede estar en varias mallas diferentes.

```
configuraciones_malla (1) ←→ (M) configuraciones_malla_turnos (M) ←→ (1) plantillas_turno
```

### Cascade Delete

- Borrar empresa → Borra sus configuraciones → Borra sus turnos
- Borrar plantilla → Borra referencias en mallas
- Borrar malla → Borra sus turnos

### Tipos de Distribución

**equilibrada**: El generador automático distribuirá los turnos de forma equilibrada.
**personalizada**: Configuración manual, no dispara generador, se puede usar como plantilla.

---

## 📞 Soporte

Si encuentras errores:

1. **Migración SQL falla**: Ver `INSTRUCCIONES_MIGRACION_15.md`
2. **Backend no conecta**: Verificar credenciales en `db.js`
3. **Frontend no carga**: Verificar que esté importado en Dashboard
4. **Validaciones fallan**: Revisar consola del navegador y logs del backend

---

**Versión**: 1.0
**Fecha**: 2026-09-22
**Autor**: Sistema Automático
**Estado**: ✅ Código - ⏳ Migración Pendiente
