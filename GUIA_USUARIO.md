# 🚀 Guía de Uso - Dashboard Empleados

## 📖 Índice
1. [Inicio de Sesión](#inicio-de-sesión)
2. [Módulo de Inicio](#módulo-de-inicio)
3. [Calendario y Turnos](#calendario-y-turnos)
4. [Novedades y Solicitudes](#novedades-y-solicitudes)
5. [Editar Perfil](#editar-perfil)
6. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Inicio de Sesión

### ¿Cómo accedo al dashboard?

1. Ve a la página de login
2. Ingresa tu correo y contraseña
3. Haz clic en "Iniciar sesión"
4. Serás redirigido al dashboard si tu rol es **Emple5**

### Credenciales de Prueba
```
Email: empleado@empresa.com
Contraseña: (Solicita a administrador)
Rol: Emple5 (Empleado estándar)
```

⚠️ **Nota:** Solo usuarios con rol **Emple5** verán este dashboard

---

## Módulo de Inicio

### ¿Qué es el Módulo de Inicio?

Es la primera pantalla que ves al entrar al dashboard. Contiene:

#### 1. **Header Superior (Sticky)**
```
[Logo Empresa] Hola, Eduardo Felipe Soto Cardozo
               Empresa: Acme Corp
               Rol: Emple5 | 🟢 Activo                    [Cerrar sesión]
```

**Elementos:**
- 🏢 **Logo de tu empresa** - Identifica tu compañía
- 👋 **Saludo personalizado** - Tu nombre completo
- 📋 **Nombre de la empresa** - Donde trabajas
- 🎫 **Rol** - Tu posición (Emple5)
- 🟢 **Estado** - Indica si tu cuenta está activa
- 🚪 **Cerrar sesión** - Para salir del dashboard

#### 2. **Panel de Control**
```
╔════════════════════════════════════════════════╗
║         Panel de Control                       ║
║                                                ║
║  Bienvenido a tu panel de empleado. Aquí      ║
║  puedes acceder a tus turnos, solicitar       ║
║  cambios y administrar tu perfil.             ║
║                                                ║
║  ┌──────────────┐  ┌──────────────┐           ║
║  │ 📅 Ver       │  │ 📝 Mis       │           ║
║  │ Turnos       │  │ Solicitudes  │           ║
║  └──────────────┘  └──────────────┘           ║
║                     ┌──────────────┐           ║
║                     │ ⚙️ Mi Perfil │           ║
║                     └──────────────┘           ║
╚════════════════════════════════════════════════╝
```

### Acciones Disponibles

| Botón | Acción | Descripción |
|-------|--------|------------|
| 📅 Ver Turnos | Ir a Calendario | Ver tus turnos asignados |
| 📝 Mis Solicitudes | Ir a Novedades | Crear y ver solicitudes |
| ⚙️ Mi Perfil | Ir a Editar | Cambiar tus datos y contraseña |
| 🚪 Cerrar sesión | Salir | Cerrar tu sesión |

---

## Calendario y Turnos

### ¿Cuáles son mis turnos?

Haz clic en **"📅 Ver Turnos"** para ver todos tus turnos asignados.

```
CALENDARIO Y TURNOS
[Todos] [Próximos] [Pasados]

┌────┬─────────────────────────────────────────────────┐
│ 20 │ Lunes, 20 de septiembre de 2026               │
│Sep │ ⏱️ 08:00 - 16:00                                │
├────┤ Turno diurno - Producción                      │
│    │ 🟢 Activo                                       │
└────┴─────────────────────────────────────────────────┘

┌────┬─────────────────────────────────────────────────┐
│ 21 │ Martes, 21 de septiembre de 2026              │
│Sep │ ⏱️ 16:00 - 23:59                                │
├────┤ Turno nocturno - Vigilancia                    │
│    │ 🟢 Activo                                       │
└────┴─────────────────────────────────────────────────┘
```

### Filtros Disponibles

1. **[Todos]** - Muestra todos tus turnos
2. **[Próximos]** - Muestra los turnos que vienen
3. **[Pasados]** - Muestra los turnos ya completados

### Información de cada Turno

| Campo | Ejemplo | Descripción |
|-------|---------|------------|
| Fecha | Lunes, 20 de septiembre | Día que laboras |
| Horario | 08:00 - 16:00 | Hora de entrada y salida |
| Descripción | Turno diurno - Producción | Tipo de turno |
| Estado | 🟢 Activo | Si el turno es válido |

### ¿Cómo vuelvo al inicio?

Haz clic en el botón **"← Volver al inicio"** al final de la página.

---

## Novedades y Solicitudes

### ¿Qué son las Novedades?

Son solicitudes que puedes hacer para:
- 📋 **Cambio de turno** - Intercambiar turno con un compañero
- 📄 **Permiso** - Solicitar un permiso especial
- 🏥 **Incapacidad** - Reportar enfermedad o lesión
- 🗓️ **Licencia** - Solicitar licencia (vacaciones, personal)

### Crear una Nueva Solicitud

#### Paso 1: Haz clic en "Nueva solicitud"
```
NOVEDADES Y SOLICITUDES
                        [Nueva solicitud] ← Haz clic aquí
```

#### Paso 2: Completa el formulario

```
┌─────────────────────────────────────────────────┐
│ Tipo de solicitud:                              │
│ [Seleccionar tipo ▼]                            │ ← Cambio de turno, Permiso, etc.
│                                                  │
│ Fecha solicitada:                               │
│ [____/____/____]                                │ ← Fecha del evento
│                                                  │
│ Descripción:                                    │
│ ┌────────────────────────────────────────────┐  │
│ │ Describe tu solicitud con detalle...      │  │ ← OBLIGATORIO
│ │                                            │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ Detalles adicionales:                          │
│ ┌────────────────────────────────────────────┐  │
│ │ Información adicional (opcional)           │  │ ← Opcional
│ └────────────────────────────────────────────┘  │
│                                                  │
│ [Enviar solicitud]  [Cancelar]                 │
└─────────────────────────────────────────────────┘
```

#### Paso 3: Envía la solicitud

- Revisa que todo esté correcto
- Haz clic en **"Enviar solicitud"**
- Verás un mensaje de confirmación ✅

### Ver tu Histórico de Solicitudes

La sección inferior muestra todas tus solicitudes pasadas:

```
Filtros: [Todas] [Pendientes] [Aprobadas] [Rechazadas]

┌──────────────────────────────────────────────────┐
│ CAMBIO DE TURNO                    🟡 PENDIENTE  │
│ Necesito cambiar mi turno...                    │
│ Fecha solicitada: 20 de septiembre de 2026     │
│ Enviado: 15/09/2026 14:30                      │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ PERMISO                                🟢 APROBADO │
│ Permiso para asuntos personales                  │
│ Fecha solicitada: 18 de septiembre de 2026     │
│ Enviado: 14/09/2026 10:15                      │
└──────────────────────────────────────────────────┘
```

### Estados de Solicitudes

| Estado | Color | Significado |
|--------|-------|------------|
| 🟡 Pendiente | Naranja | Esperando respuesta del administrador |
| 🟢 Aprobado | Verde | Tu solicitud fue aprobada |
| 🔴 Rechazado | Rojo | Tu solicitud fue rechazada |
| 🔵 En proceso | Cian | Se está procesando tu solicitud |

---

## Editar Perfil

### Acceder a Editar Perfil

Haz clic en **"⚙️ Mi Perfil"** en el panel de control.

### Sección 1: Información Personal

Aquí puedes cambiar tus datos:

```
┌────────────────────────────────────────────┐
│ INFORMACIÓN PERSONAL                       │
├────────────────────────────────────────────┤
│                                            │
│ Primer nombre:      [Eduardo]              │
│ Segundo nombre:     [Felipe]               │
│ Primer apellido:    [Soto]                 │
│ Segundo apellido:   [Cardozo]              │
│ Correo electrónico: [ej@empresa.com]      │
│ Teléfono:           [+57 300 1234567]     │
│                                            │
│ [Guardar cambios]                          │
│                                            │
└────────────────────────────────────────────┘
```

**Campos que puedes editar:**
- ✏️ Nombre (completo)
- ✏️ Email
- ✏️ Teléfono

**Campos que NO puedes editar:**
- ❌ Rol (lo asigna el administrador)
- ❌ Empresa (no puedes cambiarla tú)

### Cambiar Contraseña

#### Paso 1: Haz clic en "Cambiar contraseña"

```
SEGURIDAD
                    [Cambiar contraseña] ← Haz clic
```

#### Paso 2: Completa el formulario

```
┌──────────────────────────────────────────┐
│ Contraseña actual:                       │
│ [••••••••••••••••••]                     │ ← Tu contraseña actual
│                                          │
│ Nueva contraseña:                       │
│ [••••••••••••••••••]                     │ ← Mínimo 8 caracteres
│ (mínimo 8 caracteres)                   │
│                                          │
│ Confirmar contraseña:                   │
│ [••••••••••••••••••]                     │ ← Igual a la anterior
│                                          │
│ [Cambiar contraseña]  [Cancelar]        │
│                                          │
└──────────────────────────────────────────┘
```

#### Paso 3: Confirma el cambio

- Verifica que las contraseñas coincidan
- Haz clic en **"Cambiar contraseña"**
- Verás un mensaje de confirmación ✅

⚠️ **Recuerda:** 
- Usa una contraseña fuerte (combinación de letras, números, caracteres)
- No compartas tu contraseña con nadie
- Cambia tu contraseña periódicamente

---

## Preguntas Frecuentes

### ❓ ¿Olvidé mi contraseña?

1. Ve a la página de login
2. Haz clic en **"¿Olvidaste tu contraseña?"**
3. Ingresa tu correo
4. Recibirás un link para restablecerla

### ❓ ¿Por qué no veo mis turnos?

- Puede que aún no te hayan asignado turnos
- Contacta a tu administrador si crees que es un error
- Los turnos aparecen automáticamente cuando se asignen

### ❓ ¿Cuánto tiempo tarda en procesarse mi solicitud?

- **Cambio de turno:** 1-2 días hábiles
- **Permiso:** 1 día hábil
- **Incapacidad:** Inmediatamente
- **Licencia:** Depende de la política de la empresa

### ❓ ¿Puedo cancelar una solicitud?

- Si está **PENDIENTE**: Contacta a tu administrador
- Si está **APROBADA**: No puedes cancelarla
- Si está **RECHAZADA**: Ya fue denegada

### ❓ ¿Qué hago si cometo un error al crear una solicitud?

- Crea una **nueva solicitud** aclarando el error
- Incluye en la descripción el ID de la solicitud anterior
- El administrador podrá descartar la incorrecta

### ❓ ¿Puedo cambiar mi email?

Sí, en la sección **"Información Personal"** del módulo de Perfil.

⚠️ Asegúrate que el nuevo email sea correcto, ya que se usará para futuras comunicaciones.

### ❓ ¿Es seguro editar mis datos?

✅ Sí, todos tus datos están protegidos con:
- Encriptación HTTPS
- Autenticación JWT
- Base de datos segura
- Solo tú puedes ver y editar tus datos

### ❓ ¿Qué pasa si cierro sesión accidentalmente?

No hay problema. Solo vuelve a iniciar sesión con tu correo y contraseña.

### ❓ ¿Dónde reporto un problema?

Contacta a:
- 📧 Email: soporte@empresa.com
- 📞 Teléfono: +57 1 XXXXX
- 💬 Chat de soporte (si está disponible)

---

## 🎨 Consejos para Usar el Dashboard

### ✅ Haz esto:
- ✅ Revisa tus turnos regularmente
- ✅ Solicita cambios con anticipación
- ✅ Mantén tus datos actualizados
- ✅ Usa descripciones claras en tus solicitudes
- ✅ Cambia tu contraseña cada 90 días

### ❌ No hagas esto:
- ❌ No compartas tu contraseña
- ❌ No dejes tu sesión abierta en computadoras públicas
- ❌ No hagas solicitudes a último momento
- ❌ No intentes crear solicitudes duplicadas
- ❌ No modifiques tus datos de forma incorrecta

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Esc` | Cerrar diálogo/formulario |
| `Tab` | Navegar entre campos |
| `Enter` | Enviar formulario |

---

## 📱 Usar en Móvil

El dashboard funciona perfectamente en dispositivos móviles:

1. Los botones son más grandes
2. El texto es más legible
3. Los formularios se ajustan automáticamente
4. Acceso rápido desde la pantalla de inicio

---

## 🆘 Problemas Comunes

### ❌ "No se puede cargar los turnos"
**Solución:**
1. Recarga la página
2. Verifica tu conexión a internet
3. Contacta a soporte si persiste

### ❌ "Error al enviar solicitud"
**Solución:**
1. Verifica que todos los campos obligatorios tengan datos
2. Comprueba que la fecha sea válida
3. Intenta de nuevo

### ❌ "Contraseña rechazada"
**Solución:**
1. Verifica que la contraseña actual sea correcta
2. Asegúrate que las nuevas contraseñas coincidan
3. La contraseña debe tener mínimo 8 caracteres

---

## 📞 Contacto y Soporte

Para cualquier duda o problema:

- **Correo:** soporte@empresa.com
- **Teléfono:** +57 1 XXXXXX
- **Horario:** Lunes a viernes, 8:00 AM a 5:00 PM

---

**Última actualización:** 15 de septiembre de 2026
**Versión:** 1.0
**Idioma:** Español (Colombia)

¡Bienvenido al SGTurnos Empresariales! 🎉
