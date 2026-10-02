# Contexto para agentes

Antes de modificar consultas, migraciones o flujos de turnos, lee [DATABASE_CONTEXT.md](DATABASE_CONTEXT.md) y consulta el esquema vigente en [scripts/sgturnos_empresas_schema.sql](scripts/sgturnos_empresas_schema.sql).

La base es multiempresa. En endpoints autenticados, deriva la empresa desde el contexto autenticado del backend y valida que cada registro relacionado pertenezca a esa empresa; no confies en un `empresa_id` enviado por el cliente como autorizacion.

El dump es solo estructura, no contiene filas de negocio. No asumas que una migracion del repositorio ya se aplico en XAMPP: confirma el esquema desplegado antes de consultar una tabla nueva. Para actualizar el dump, ejecuta `./scripts/exportar_esquema.ps1` desde PowerShell.