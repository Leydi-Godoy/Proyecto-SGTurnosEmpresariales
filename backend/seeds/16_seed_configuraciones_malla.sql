-- ================================================================================
-- DATOS DE PRUEBA: Configuraciones de Malla
-- ================================================================================
-- Estas son configuraciones de ejemplo que puedes insertar después de ejecutar
-- la migración 15, para probar la aplicación sin tener que crear desde UI
-- ================================================================================

-- ================================================================================
-- IMPORTANTE: Ejecuta PRIMERO la migración 15_crear_configuraciones_malla.sql
-- LUEGO ejecuta este archivo con los datos de prueba
-- ================================================================================

-- Verificar que las plantillas de turno existan
-- SELECT id, nombre FROM plantillas_turno;
-- Deberías ver:
-- 1 | Turno Día
-- 2 | Turno Noche

-- ================================================================================
-- EJEMPLO 1: Configuración 2x12h para Empresa con ID 1
-- ================================================================================

-- Crear la configuración
INSERT INTO configuraciones_malla (
  empresa_id,
  nombre,
  descripcion,
  cantidad_empleados,
  horas_por_semana,
  horas_por_mes,
  dias_laborales_por_semana,
  cantidad_turnos,
  tipo_distribucion,
  activo,
  creado_por,
  actualizado_por
) VALUES (
  1,
  'Malla 2x12h Empresa A',
  'Rotación 2 turnos de 12 horas: Día (09:00-21:00) y Noche (21:00-09:00)',
  60,
  42,
  182,
  5,
  2,
  'equilibrada',
  TRUE,
  1,  -- Usuario ID 1 (Super Admin)
  1
);

-- Obtener el ID de la configuración creada (será 1 si es la primera)
SET @config_id_1 = LAST_INSERT_ID();

-- Asignar los turnos a esta configuración
INSERT INTO configuraciones_malla_turnos (
  configuracion_id,
  plantilla_id,
  orden,
  duracion_horas
) VALUES
(
  @config_id_1,
  1,  -- Turno Día
  1,  -- Orden 1 (primer turno)
  12  -- Duración: 12 horas
),
(
  @config_id_1,
  2,  -- Turno Noche
  2,  -- Orden 2 (segundo turno)
  12  -- Duración: 12 horas
);

-- ================================================================================
-- EJEMPLO 2: Configuración 2x12h para Empresa con ID 3
-- ================================================================================

INSERT INTO configuraciones_malla (
  empresa_id,
  nombre,
  descripcion,
  cantidad_empleados,
  horas_por_semana,
  horas_por_mes,
  dias_laborales_por_semana,
  cantidad_turnos,
  tipo_distribucion,
  activo,
  creado_por,
  actualizado_por
) VALUES (
  3,
  'Malla 2x12h Empresa C',
  'Configuración de prueba con 45 empleados',
  45,
  42,
  182,
  5,
  2,
  'equilibrada',
  TRUE,
  2,  -- Usuario ID 2 (Admin Empresa)
  2
);

SET @config_id_2 = LAST_INSERT_ID();

-- Asignar los mismos turnos
INSERT INTO configuraciones_malla_turnos (
  configuracion_id,
  plantilla_id,
  orden,
  duracion_horas
) VALUES
(
  @config_id_2,
  1,
  1,
  12
),
(
  @config_id_2,
  2,
  2,
  12
);

-- ================================================================================
-- VERIFICACIÓN: Ver las configuraciones creadas
-- ================================================================================

-- Ver todas las configuraciones
SELECT 
  cm.id,
  cm.empresa_id,
  cm.nombre,
  cm.cantidad_empleados,
  cm.cantidad_turnos,
  cm.tipo_distribucion,
  cm.activo,
  cm.creado_en
FROM configuraciones_malla cm
ORDER BY cm.empresa_id, cm.creado_en;

-- Ver los turnos de cada configuración
SELECT 
  cm.id AS config_id,
  cm.nombre AS config_nombre,
  pt.nombre AS turno_nombre,
  cmt.orden,
  cmt.duracion_horas
FROM configuraciones_malla cm
LEFT JOIN configuraciones_malla_turnos cmt ON cm.id = cmt.configuracion_id
LEFT JOIN plantillas_turno pt ON cmt.plantilla_id = pt.id
ORDER BY cm.id, cmt.orden;

-- ================================================================================
-- QUERIES DE PRUEBA ÚTILES
-- ================================================================================

-- 1. Contar configuraciones por empresa
SELECT 
  e.nombre AS empresa,
  COUNT(cm.id) AS total_configuraciones
FROM empresas e
LEFT JOIN configuraciones_malla cm ON e.id = cm.empresa_id
GROUP BY e.id, e.nombre
ORDER BY total_configuraciones DESC;

-- 2. Obtener detalles de una configuración específica
-- (Cambiar ID 1 por el ID real de la configuración)
SELECT 
  cm.*,
  COUNT(cmt.id) AS total_turnos_asignados
FROM configuraciones_malla cm
LEFT JOIN configuraciones_malla_turnos cmt ON cm.id = cmt.configuracion_id
WHERE cm.id = 1
GROUP BY cm.id;

-- 3. Ver configuraciones activas e inactivas
SELECT 
  cm.nombre,
  CASE 
    WHEN cm.activo = 1 THEN '✅ ACTIVA'
    ELSE '❌ INACTIVA'
  END AS estado,
  cm.cantidad_empleados,
  cm.tipo_distribucion
FROM configuraciones_malla cm
ORDER BY cm.activo DESC, cm.nombre;

-- 4. Validar que todas las configuraciones tengan al menos un turno
SELECT 
  cm.id,
  cm.nombre,
  COUNT(cmt.id) AS turnos,
  CASE 
    WHEN COUNT(cmt.id) = 0 THEN '⚠️ SIN TURNOS'
    WHEN COUNT(cmt.id) = cm.cantidad_turnos THEN '✅ CORRECTO'
    ELSE '⚠️ TURNOS INCOMPLETOS'
  END AS validacion
FROM configuraciones_malla cm
LEFT JOIN configuraciones_malla_turnos cmt ON cm.id = cmt.configuracion_id
GROUP BY cm.id, cm.nombre, cm.cantidad_turnos;

-- ================================================================================
-- LIMPIAR DATOS DE PRUEBA (Si necesitas empezar de nuevo)
-- ================================================================================

/*
DELETE FROM configuraciones_malla_turnos 
WHERE configuracion_id IN (
  SELECT id FROM configuraciones_malla 
  WHERE empresa_id IN (1, 3)  -- Cambiar por IDs reales
);

DELETE FROM configuraciones_malla 
WHERE empresa_id IN (1, 3);  -- Cambiar por IDs reales
*/

-- ================================================================================
-- NOTAS IMPORTANTES
-- ================================================================================

/*
1. ANTES DE INSERTAR: Asegúrate de que plantillas_turno exista con datos

2. EMPRESA_ID: Cambia el empresa_id según tus empresas reales
   - Verifica IDs disponibles: SELECT id, nombre FROM empresas;

3. CREADO_POR: Debe ser un usuario_id válido
   - Verifica usuarios: SELECT Id_usuario, nombre FROM usuarios;

4. PLANTILLA_ID: Debe referenciar plantillas_turno existentes
   - Verifica: SELECT id, nombre FROM plantillas_turno;

5. ORDEN: Es importante para la rotación, debe ser único por configuración
   - Orden 1 = Primer turno
   - Orden 2 = Segundo turno
   - Etc.

6. DURACION_HORAS: Total de horas del turno
   - 2x12h = 12 horas c/u
   - 3x8h = 8 horas c/u

7. DESPUÉS DE INSERTAR: Verifica los datos con las queries de validación
*/

-- ================================================================================
-- SCRIPT DE PRUEBA COMPLETO (Para copiar y pegar en phpMyAdmin)
-- ================================================================================

/*

Este archivo contiene:
✅ Definiciones de dos configuraciones de ejemplo
✅ Inserción de datos de prueba
✅ Queries de verificación
✅ Queries de análisis
✅ Instrucciones de limpieza

PASOS:
1. Ejecuta primero: backend/migrations/15_crear_configuraciones_malla.sql
2. Ejecuta este archivo
3. Verifica los datos con las queries incluidas
4. Prueba el frontend

Si algo falla:
- Verifica que empresa_id exista en tabla empresas
- Verifica que plantilla_id exista en tabla plantillas_turno
- Verifica que usuario_id exista en tabla usuarios

*/
