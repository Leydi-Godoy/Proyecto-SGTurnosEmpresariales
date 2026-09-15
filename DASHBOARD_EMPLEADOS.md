# Dashboard de Empleados Estándar (Emple5)

## Descripción General

El dashboard de empleados estándar está diseñado para que los empleados (rol: Emple5) puedan gestionar sus turnos, solicitar cambios y administrar su perfil de forma intuitiva y segura.

---

## 📋 Estructura del Dashboard

### **1. Módulo de Inicio (Home Panel)**
Ubicado en la parte superior como header sticky.

**Elementos:**
- ✅ Saludo personalizado: "Hola, [Nombre Completo]"
- ✅ Logo/Sigla de la empresa a la que pertenece
- ✅ Nombre de la empresa
- ✅ Información del rol (Emple5)
- ✅ Estado del usuario (Activo/Inactivo)
- ✅ Botón "Cerrar sesión"
- ✅ Panel de control con acceso rápido a los otros módulos

**Componente:** `HomePanel.jsx`
**Responsabilidad:** Obtener datos del usuario y mostrar información personizada

---

### **2. Módulo: Calendario y Turnos**
Para consultar y visualizar los turnos asignados.

**Funcionalidades:**
- 📅 Visualización de todos los turnos asignados
- 🔍 Filtros por estado:
  - Todos los turnos
  - Turnos próximos
  - Turnos pasados
- 📊 Información detallada:
  - Fecha del turno
  - Hora de inicio y fin
  - Descripción del turno
  - Estado/Origen del turno
- 📱 Diseño responsivo con tarjetas interactivas

**Componente:** `CalendarTurns.jsx`
**API:** GET `/api/empleado/turnos`
**Respuesta esperada:**
```json
{
  "turnos": [
    {
      "id": 1,
      "fecha": "2026-09-20",
      "inicio": "08:00",
      "fin": "16:00",
      "descripcion": "Turno diurno",
      "origen": "Sistema",
      "estado": "Activo"
    }
  ]
}
```

---

### **3. Módulo: Novedades y Solicitudes**
Para crear y gestionar solicitudes de cambios, permisos, incapacidades y licencias.

**Funcionalidades:**
- 📝 Crear nuevas solicitudes con tipos:
  - **Cambio de turno**: Solicitar intercambio de turno
  - **Permiso**: Solicitar un permiso
  - **Incapacidad**: Reportar incapacidad/enfermedad
  - **Licencia**: Solicitar licencia
- 📅 Especificar fecha solicitada
- 📄 Descripción detallada de la solicitud
- 📌 Detalles adicionales opcionales
- 📊 Ver histórico de solicitudes con filtros:
  - Todas las solicitudes
  - Solicitudes pendientes
  - Solicitudes aprobadas
  - Solicitudes rechazadas
- ✨ Estado visual con colores diferenciados
- ⏰ Marca de tiempo de creación

**Componente:** `Novedades.jsx`
**APIs:**
- GET `/api/empleado/novedades` - Obtener solicitudes
- POST `/api/empleado/novedades` - Crear nueva solicitud

**Body para POST:**
```json
{
  "tipo": "cambio_turno|permiso|incapacidad|licencia",
  "descripcion": "Descripción de la solicitud",
  "fecha_solicitada": "2026-09-20",
  "detalles_adicionales": "Información adicional"
}
```

---

### **4. Módulo: Editar Datos y Perfil**
Para gestionar información personal y seguridad.

**Secciones:**

#### A. Información Personal
- 👤 Primer nombre
- 👤 Segundo nombre
- 👤 Primer apellido
- 👤 Segundo apellido
- 📧 Correo electrónico
- 📞 Teléfono

#### B. Seguridad
- 🔐 Cambiar contraseña
  - Verificar contraseña actual
  - Ingresar nueva contraseña (mín. 8 caracteres)
  - Confirmar nueva contraseña
  - Validaciones automáticas

**Componente:** `EditProfile.jsx`
**APIs:**
- GET `/api/auth/me` - Obtener datos personales
- PUT `/api/auth/me` - Actualizar datos personales
- POST `/api/auth/me/change-password` - Cambiar contraseña

**Body para PUT:**
```json
{
  "primer_nombre": "Eduardo",
  "segundo_nombre": "Felipe",
  "primer_apellido": "Soto",
  "segundo_apellido": "Cardozo",
  "email": "user@email.com",
  "telefono": "+57 300 1234567"
}
```

**Body para POST change-password:**
```json
{
  "oldPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña_123",
  "confirmPassword": "nueva_contraseña_123"
}
```

---

## 🎨 Estilos y Diseño

### Colores del Sistema
- **Fondo primario:** Gradiente azul-púrpura oscuro
- **Acentos:** Cian eléctrico (#0fc1f9)
- **Fondos de panel:** Vidrio (glassmorphism)
- **Estados:**
  - Verde para aprobado: `#22c55e`
  - Naranja para pendiente: `#f59e0b`
  - Rojo para rechazado: `#ef4444`
  - Cian para en proceso: `#06b6d4`

### Características Visuales
- ✨ Glassmorphism en paneles
- 🎭 Gradientes suaves
- 📱 Totalmente responsivo
- ⚡ Transiciones suaves
- 🎯 Focus states visibles

---

## 🔄 Flujo de Navegación

```
┌─────────────────────┐
│   HOME PANEL        │ (Header Sticky)
│  (Saludo + Datos)   │
└─────────────────────┘
          │
    ┌─────┴─────┬──────────┬──────────┐
    │            │          │          │
    ▼            ▼          ▼          ▼
┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│CALENDARIO│ │NOVEDADES│ │ PERFIL   │ │  INICIO  │
│ Y TURNOS │ │ Y SOLICR.│ │ Y DATOS  │ │(Dashboard)
└──────────┘ └─────────┘ └──────────┘ └──────────┘
    │            │          │          │
    └─────────────┴──────────┴──────────┘
            (Volver al inicio)
```

---

## 🛠️ Archivos Modificados

- `frontend/src/components/HomePanel.jsx` - Panel de bienvenida mejorado
- `frontend/src/components/CalendarTurns.jsx` - Visualización de turnos con filtros
- `frontend/src/components/Novedades.jsx` - Sistema de solicitudes completo
- `frontend/src/components/EditProfile.jsx` - Gestión de perfil y seguridad
- `frontend/src/components/EmpleadoDashboard.jsx` - Contenedor principal con navegación
- `frontend/src/App.css` - Estilos completos del dashboard

---

## 📱 Responsividad

El dashboard está optimizado para:
- 📱 Dispositivos móviles (320px - 768px)
- 💻 Tablets (768px - 1024px)
- 🖥️ Escritorio (1024px+)

---

## ⚙️ Próximas Mejoras

- [ ] Exportar turnos a calendario (iCal)
- [ ] Notificaciones push en tiempo real
- [ ] Descarga de reportes en PDF
- [ ] Integración de chat para soporte
- [ ] Visualización en modo calendario mes completo
- [ ] Estadísticas de turnos trabajados

---

## 📞 Soporte Técnico

Para reportar problemas o sugerencias, contaceta al equipo de desarrollo.

**Última actualización:** 15 de Septiembre de 2026
