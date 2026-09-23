# 🚀 Guía Rápida: Generador Automático de Mallas

## ⚡ Inicio Rápido (5 minutos)

### Paso 1: Iniciar los servidores

#### Terminal 1 - Backend
```bash
cd E:\Proyecto-SGTurnosEmpresariales\backend
npm install  # Si es primera vez
npm run dev
```

Deberías ver:
```
Backend listening on 3001
```

#### Terminal 2 - Frontend
```bash
cd E:\Proyecto-SGTurnosEmpresariales\frontend
npm install  # Si es primera vez
npm run dev
```

Deberías ver:
```
VITE v5.x.x ready in XXX ms
➜ Local: http://localhost:5173/
```

---

### Paso 2: Acceder a la Aplicación

1. Abre navegador en: **http://localhost:5173**
2. Login con credenciales de **Planificador**
   - Email: `planificador@empresa.com` (o similar)
   - Contraseña: (la configurada en BD)

---

### Paso 3: Generar tu Primera Malla

1. **Haz click en la pestaña "📅 Mallas"**

2. **Haz click en "⚙️ Generar Automático"**

3. **Completa el formulario:**
   ```
   📋 Configuración de Malla:  [selecciona una config]
   📅 Fecha de Inicio:         [2026-10-01]
   📊 Cantidad de Semanas:      [4]
   ⚖️ Tipo de Distribución:    [Equilibrada ✓]
   ```

4. **Haz click en "🚀 Generar Malla"**

5. **¡Listo!** Verás:
   ```
   ✓ Malla generada exitosamente con 80 instancias de turnos
   ```

---

## 📊 Datos Requeridos en BD

Antes de generar mallas, asegúrate de que existan:

### 1. Empresa
```sql
SELECT * FROM empresas WHERE id = 1;
```

Debe tener: `id`, `nombre`, `estado = 'activa'`

### 2. Empleados Activos
```sql
SELECT COUNT(*) FROM empleados WHERE empresa_id = 1 AND estado = 'activo';
```

Necesitas **al menos tantos empleados como indica la configuración**

### 3. Plantillas de Turnos
```sql
SELECT * FROM plantillas_turno WHERE empresa_id = 1;
```

Ejemplos:
- Turno Mañana (06:00-14:00)
- Turno Tarde (14:00-22:00)
- Turno Noche (22:00-06:00)

### 4. Configuración de Malla
```sql
SELECT * FROM configuraciones_malla WHERE empresa_id = 1;
```

Debe tener:
- `nombre`: Descripción de la malla
- `cantidad_empleados`: Cuántos empleados cubrirá
- `horas_por_semana`: 42 (Colombia)
- `horas_por_mes`: 182 (Colombia)
- `tipo_distribucion`: 'equilibrada' o 'personalizada'

---

## 🔍 Verificar que Todo Funciona

### Test 1: ¿Backend está corriendo?
```bash
curl http://localhost:3001/api/health
```

Deberías ver:
```json
{"ok":true,"time":"2026-09-23T..."}
```

### Test 2: ¿Puedes autenticarte?
Intenta login en el frontend. Si funciona, tu JWT es válido.

### Test 3: ¿Existen configuraciones?
Abre DevTools (F12) → Console y corre:
```javascript
fetch('http://localhost:3001/api/configuraciones-malla?empresa_id=1', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(d => console.log(d))
```

Deberías ver un array de configuraciones.

---

## ⚙️ Crear Datos de Prueba (SQL)

Si necesitas datos de prueba:

### Crear empresa
```sql
INSERT INTO empresas (nombre, estado) 
VALUES ('Empresa Prueba', 'activa');
```

### Crear empleados
```sql
INSERT INTO empleados (empresa_id, usuario_id, codigo_empleado, estado, especialidad_id)
VALUES 
  (1, 5, 'EMP001', 'activo', 1),
  (1, 6, 'EMP002', 'activo', 1),
  (1, 7, 'EMP003', 'activo', 2),
  (1, 8, 'EMP004', 'activo', 2),
  (1, 9, 'EMP005', 'activo', 3);
```

### Crear plantillas
```sql
INSERT INTO plantillas_turno (empresa_id, nombre, hora_inicio, hora_fin, es_nocturno)
VALUES 
  (1, 'Mañana', '06:00:00', '14:00:00', 0),
  (1, 'Tarde', '14:00:00', '22:00:00', 0),
  (1, 'Noche', '22:00:00', '06:00:00', 1);
```

### Crear configuración de malla
```sql
INSERT INTO configuraciones_malla 
(empresa_id, nombre, cantidad_empleados, horas_por_semana, horas_por_mes, tipo_distribucion)
VALUES 
(1, 'Malla Octubre 2026', 5, 42, 182, 'equilibrada');
```

### Asignar turnos a configuración
```sql
INSERT INTO configuraciones_malla_turnos (configuracion_id, plantilla_id, orden, duracion_horas)
VALUES 
  (1, 1, 1, 8),
  (1, 2, 2, 8),
  (1, 3, 3, 8);
```

---

## 📋 Posibles Errores y Soluciones

### ❌ "Acceso denegado: solo Planificadores..."
**Causa:** Usuario no tiene rol de Planificador
**Solución:** Verifica que el usuario tenga rol_id = 4 (Planificador)

### ❌ "Configuración no encontrada..."
**Causa:** No existe la configuración o no pertenece a tu empresa
**Solución:** 
```sql
SELECT * FROM configuraciones_malla WHERE empresa_id = 1;
```
Verifica que exista una configuración activa.

### ❌ "No hay suficientes empleados activos"
**Causa:** Menos empleados que lo que requiere la configuración
**Solución:**
```sql
-- Ver cuántos necesitas
SELECT cantidad_empleados FROM configuraciones_malla WHERE id = 5;

-- Ver cuántos tienes
SELECT COUNT(*) FROM empleados WHERE empresa_id = 1 AND estado = 'activo';

-- Agregar más si es necesario
INSERT INTO empleados (empresa_id, usuario_id, codigo_empleado, estado, especialidad_id)
VALUES (1, 10, 'EMP006', 'activo', 1);
```

### ❌ "Error al generar malla" (genérico)
**Solución:**
1. Abre DevTools (F12)
2. Ve a Network
3. Busca la request POST a `/api/planificador/generar-malla`
4. Mira la respuesta en la pestaña Response
5. Copia el error y busca la causa

---

## 🎯 Próximos Pasos después de Generar

### 1. Ver detalles de la malla generada
En la lista de mallas, haz click en "👁️ Detalles"

### 2. Asignar turnos automáticamente
Ve a la pestaña "⚡ Asignación" (próxima feature)

### 3. Ver cobertura
Ve a "📊 Reportes" para ver gráficos de cobertura

### 4. Publicar la malla
(Feature en desarrollo)

---

## 💡 Tips y Mejores Prácticas

✅ **Genera mallas con anticipación**
- Idealmente 2-4 semanas antes

✅ **Usa distribución equilibrada**
- Es la opción recomendada para mayoría de casos

✅ **Verifica empleados antes de generar**
- Asegúrate de tener empleados suficientes

✅ **Revisa la cobertura después**
- Asegúrate de que sea la deseada

✅ **Guarda el histórico**
- Antes de generar una nueva, archive la anterior

---

## 📞 Soporte

Si algo no funciona:

1. **Revisa los logs del backend**
   ```
   Backend listening on 3001
   [error/info/debug messages]
   ```

2. **Revisa la consola del navegador** (F12)
   - Busca errores en red
   - Busca errores de JavaScript

3. **Verifica la base de datos**
   ```sql
   SELECT COUNT(*) FROM configuraciones_malla;
   SELECT COUNT(*) FROM empleados WHERE estado = 'activo';
   SELECT COUNT(*) FROM plantillas_turno;
   ```

4. **Consulta el archivo de documentación completa**
   - [GENERADOR_MALLAS_IMPLEMENTACION.md](./GENERADOR_MALLAS_IMPLEMENTACION.md)

---

**¡Listo para generar mallas automáticas! 🎉**

*Última actualización: 23 de Septiembre de 2026*
