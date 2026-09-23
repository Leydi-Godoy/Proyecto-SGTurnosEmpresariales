# 🗄️ INSTRUCCIONES: Ejecutar Migración de Base de Datos

## Paso 1: Acceder a phpMyAdmin

1. Abre tu navegador y ve a: `http://localhost/phpmyadmin`
2. Inicia sesión con tus credenciales (usuario y contraseña de MariaDB)

## Paso 2: Seleccionar la Base de Datos

1. En el panel izquierdo, haz clic en tu base de datos: `sgturnos_empresas`
2. Verifica que estés en la base de datos correcta

## Paso 3: Ejecutar la Migración

### Opción A: Usando la pestaña SQL (Recomendado)

1. Haz clic en la pestaña **"SQL"** en la barra superior
2. Borra cualquier contenido que haya en el editor
3. Abre el archivo: `backend/migrations/15_crear_configuraciones_malla.sql`
4. Copia TODO el contenido del archivo SQL
5. Pega el contenido en el editor de phpMyAdmin
6. Haz clic en el botón **"Ejecutar"** (Enter o botón de ejecutar)

### Opción B: Importar archivo SQL

1. Asegúrate de estar en la BD: `sgturnos_empresas`
2. Haz clic en la pestaña **"Importar"**
3. Haz clic en **"Seleccionar archivo"**
4. Navega a: `backend/migrations/15_crear_configuraciones_malla.sql`
5. Haz clic en **"Continuar"** o **"Ejecutar"**

## Paso 4: Verificar que se Crearon las Tablas

Después de ejecutar, deberías ver:

✅ **Mensaje de éxito**: "Las consultas se han ejecutado correctamente"

✅ **Nuevas tablas en la lista**:
- `configuraciones_malla`
- `configuraciones_malla_turnos`

Para verificar, haz clic en tu base de datos en el panel izquierdo y busca estas dos tablas en la lista.

## Paso 5: Reiniciar el Backend

Una vez ejecutada la migración:

1. Ve a la terminal donde corre el backend
2. Presiona `Ctrl + C` para detener el servidor
3. Ejecuta nuevamente: `npm run dev`
4. Deberías ver el mensaje de conexión exitosa

## Paso 6: Verificar en la Aplicación

Ahora el formulario de "Configuración de Malla" debería funcionar correctamente:

1. Abre la aplicación en: `http://localhost:5173`
2. Inicia sesión como Admin Empresa
3. Navega a la sección "Configuración de Malla"
4. Prueba crear una nueva configuración

---

## 🆘 Solución de Problemas

### Error: "Tabla ya existe"
Si ves un error "Table already exists":
- Las tablas ya están creadas, esto es normal
- El script incluye `DROP TABLE IF EXISTS` para limpiar primero

### Error: "FK constraint failed"
Si ves este error:
- Verifica que la tabla `plantillas_turno` existe y tiene datos
- Verifica que la tabla `empresas` existe y tiene datos

### Error de sintaxis SQL
- Copia el SQL exactamente tal como está en el archivo
- Verifica que no falten puntos y coma (;) al final de cada instrucción
- En phpMyAdmin, múltiples statements deben separarse con `;`

### El backend no puede conectarse
- Verifica que MariaDB esté ejecutándose
- Verifica las credenciales en `backend/db.js`
- Reinicia el servidor: `npm run dev`

---

## ✅ Checklist de Verificación

Después de completar todo:

- [ ] Las dos tablas existen en phpMyAdmin
- [ ] El backend reinició sin errores
- [ ] Puedes acceder a la sección de Configuración de Malla
- [ ] Puedes ver el formulario de creación
- [ ] La lista de configuraciones carga (aunque esté vacía)

---

## 📝 Notas Técnicas

### Estructura de la Migración

El archivo SQL contiene:

1. **DROP TABLE IF EXISTS** (líneas iniciales)
   - Borra las tablas si ya existen
   - Permite re-ejecutar el script sin errores

2. **CREATE TABLE configuraciones_malla** 
   - Tabla principal con configuración de malla
   - Campos: nombre, cantidad_empleados, horas, turnos, etc.
   - Índices optimizados para búsquedas

3. **CREATE TABLE configuraciones_malla_turnos**
   - Tabla de relación Muchos-a-Muchos
   - Vincula configuraciones con plantillas_turno
   - Almacena orden y duración de cada turno

4. **Comentarios extensos en SQL**
   - Explicaciones de cada campo
   - Ejemplos de uso
   - Restricciones y validaciones

### Diseño de Base de Datos

```
empresas (1)
    ↓
    └─→ configuraciones_malla (1:N)
            ↓
            └─→ configuraciones_malla_turnos (1:N)
                    ↓
                    └─→ plantillas_turno (M:1)

Restricciones:
- Cada configuración pertenece a una empresa
- Las plantillas de turno deben existir previamente
- Cascade DELETE: Borrar empresa → Borra sus mallas
- Cascade DELETE: Borrar plantilla → Borra referencias
```

---

## 🔗 Rutas de Backend Disponibles

Una vez ejecutada la migración, estos endpoints funcionan:

```
GET    /api/configuraciones-malla
       → Lista todas las mallas de la empresa
       
POST   /api/configuraciones-malla
       → Crear nueva malla (Admin Empresa)
       
GET    /api/configuraciones-malla/:id
       → Obtener malla específica con sus turnos
       
PUT    /api/configuraciones-malla/:id
       → Actualizar malla existente
       
DELETE /api/configuraciones-malla/:id
       → Eliminar malla (cascade delete de turnos)
```

Todos requieren header de autenticación:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 📚 Próximos Pasos (Phase 2)

Después de que la migración esté completa:

1. ✅ Configuración de Malla (FASE 1) - COMPLETA
2. ⏳ Generador Automático de Mallas (FASE 2)
   - Crear `backend/services/generadorMallas.js`
   - Algoritmo de distribución equilibrada
   - Validaciones legales (42h/semana, etc)
   - Endpoint: `POST /api/mallas/generar`
   - UI para lanzar generador

---

**¿Necesitas ayuda?** Revisa la carpeta `backend/routes/configuraciones-malla.js` para ver el código de los endpoints.
