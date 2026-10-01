# Contexto de base de datos

Base local: `sgturnos_empresas` (MySQL/MariaDB de XAMPP).

El esquema completo, exportado sin filas de datos, esta en [scripts/sgturnos_empresas_schema.sql](scripts/sgturnos_empresas_schema.sql). Se genera desde la base local con `scripts/exportar_esquema.ps1`; el archivo representa el esquema real de XAMPP, no necesariamente todas las migraciones presentes en el repositorio.

## Modelo central

- `empresas` es el tenant principal. La mayoria de los catalogos y registros operativos llevan `empresa_id`.
- `usuarios` contiene cuentas de acceso y su empresa/rol.
- `empleados` representa a las personas que reciben turnos y vincula `usuario_id`, `empresa_id`, `especialidad_id` y `estado`.
- `especialidades` es el catalogo de profesiones/cargos de una empresa. La relacion actual es `empleados.especialidad_id`; un empleado tiene una especialidad principal.
- `sedes` pertenece a una empresa.
- `plantillas_turno` define turnos disponibles por empresa y puede vincularse a una sede.
- `configuraciones_malla` pertenece a una empresa y `configuraciones_malla_turnos` relaciona la configuracion con sus plantillas.
- `instancias_turno` representa turnos concretos; `asignaciones_turno` vincula una instancia con un empleado.
- `disponibilidad`, `solicitudes_novedad`, `aprobaciones` y `documentos_solicitud` soportan disponibilidad y novedades de empleados.
- `roles` y `usuario_roles` modelan la asignacion de roles; `registros_auditoria` conserva acciones relevantes.

## Reglas de implementacion

- Aislar lecturas y escrituras por empresa en el backend, incluso cuando el ID consultado sea globalmente unico.
- Para contar empleados por profesion, unir `especialidades.id` con `empleados.especialidad_id`, filtrar por `empleados.empresa_id` y aplicar el estado requerido por la pantalla.
- La exportacion actual no contiene la tabla `empleado_especialidades`; no consultarla sin aplicar y verificar antes su migracion.
- Confirmar columnas, claves foraneas, indices, triggers y rutinas en el dump vigente antes de disenar cambios de persistencia.
- El dump incluye sentencias `CREATE` y no incluye `DROP TABLE`; es una referencia para agentes, no una migracion para ejecutar directamente en una base existente.

## Actualizar el esquema

Con XAMPP/MySQL en ejecucion, desde PowerShell en la raiz del repositorio:

```powershell
.\scripts\exportar_esquema.ps1
```

El script usa `C:\xampp\mysql\bin\mysqldump.exe`, el usuario `root` y contrasena vacia, valores confirmados para este entorno local. Si root tiene contrasena, agrega `-PromptForPassword`. Revisa el diff y no agregues contrasenas al repositorio.