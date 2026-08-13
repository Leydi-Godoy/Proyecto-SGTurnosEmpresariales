# Proyecto SGTurnosEmpresariales

Este repositorio contiene el frontend (Vite + React) y el backend (Node + Express) del proyecto.

Requisitos
- Node.js (v16+ recomendado)
- npm
- Git

Estructura
- `frontend/` - aplicación frontend creada con Vite + React
- `backend/` - API básica con Express

Cómo ejecutar en desarrollo

1) Abrir dos terminales (o pestañas) en la carpeta del proyecto:

Frontend
```
cd E:\Proyecto-SGTurnosEmpresariales\frontend
npm install
npm run dev
```

Backend
```
cd E:\Proyecto-SGTurnosEmpresariales\backend
npm install
npm run dev
```

Comprobar endpoints
- Frontend: abre la URL que muestra Vite (por ejemplo `http://localhost:5173`).
- Backend: `http://localhost:3001/api/health` (debería devolver JSON `{ ok: true, time: ... }`).

Git
```
git add .
git commit -m "Scaffold frontend (Vite+React) and backend (Express)"
```

VS Code
- Para ejecutar desde VS Code: usa `Terminal > Run Task...` y elige `Start Frontend` o `Start Backend`.
- Para depurar el backend: abre la vista Run and Debug y selecciona "Launch Backend (nodemon)".

Siguientes pasos sugeridos
- Añadir rutas y lógica al backend.
- Conectar el frontend al backend (fetch/Axios) y manejar variables de entorno.
- Añadir pruebas y linting según necesidad.

Si quieres, puedo crear un `README.md` más detallado o subir los cambios a un repo remoto.
