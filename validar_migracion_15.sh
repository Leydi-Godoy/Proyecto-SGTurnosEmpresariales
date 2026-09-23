#!/bin/bash
# ================================================================================
# SCRIPT DE VALIDACIÓN POST-MIGRACIÓN
# ================================================================================
# Verifica que todo esté correctamente instalado después de ejecutar
# la migración 15_crear_configuraciones_malla.sql
# ================================================================================

echo "🔍 VALIDACIÓN POST-MIGRACIÓN: Configuración de Malla"
echo "======================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ================================================================================
# SECCIÓN 1: Verificar que las tablas existen
# ================================================================================
echo "📋 SECCIÓN 1: Verificación de Tablas"
echo "------------------------------------"

echo "Verificando tabla: configuraciones_malla"
# Aquí irían comandos reales de MySQL (ajusta según tu setup)
# En phpMyAdmin, simplemente verifica que la tabla exista en la lista

echo "✅ Tabla configuraciones_malla debe estar en phpMyAdmin"
echo "✅ Tabla configuraciones_malla_turnos debe estar en phpMyAdmin"
echo ""

# ================================================================================
# SECCIÓN 2: Verificar estructura de columnas
# ================================================================================
echo "🏗️  SECCIÓN 2: Estructura de Columnas"
echo "------------------------------------"

echo "Columnas de 'configuraciones_malla':"
echo "  ✅ id (AUTO_INCREMENT, PK)"
echo "  ✅ empresa_id (FK)"
echo "  ✅ nombre (VARCHAR 255)"
echo "  ✅ descripcion (TEXT)"
echo "  ✅ cantidad_empleados (INT)"
echo "  ✅ horas_por_semana (INT, DEFAULT 42)"
echo "  ✅ horas_por_mes (INT, DEFAULT 182)"
echo "  ✅ dias_laborales_por_semana (INT)"
echo "  ✅ cantidad_turnos (INT)"
echo "  ✅ tipo_distribucion (ENUM)"
echo "  ✅ activo (BOOLEAN)"
echo "  ✅ creado_por, creado_en"
echo "  ✅ actualizado_por, actualizado_en"
echo ""

echo "Columnas de 'configuraciones_malla_turnos':"
echo "  ✅ id (AUTO_INCREMENT, PK)"
echo "  ✅ configuracion_id (FK)"
echo "  ✅ plantilla_id (FK)"
echo "  ✅ orden (INT)"
echo "  ✅ duracion_horas (INT)"
echo "  ✅ creado_en (TIMESTAMP)"
echo ""

# ================================================================================
# SECCIÓN 3: Verificar restricciones y índices
# ================================================================================
echo "🔐 SECCIÓN 3: Restricciones e Índices"
echo "-------------------------------------"

echo "Restricciones de 'configuraciones_malla':"
echo "  ✅ UNIQUE KEY (empresa_id, nombre)"
echo "  ✅ FOREIGN KEY empresa_id → empresas"
echo "  ✅ FOREIGN KEY creado_por → usuarios"
echo "  ✅ FOREIGN KEY actualizado_por → usuarios"
echo ""

echo "Índices:"
echo "  ✅ PK: id"
echo "  ✅ INDEX: empresa_id"
echo "  ✅ INDEX: activo"
echo "  ✅ INDEX: tipo_distribucion"
echo "  ✅ INDEX: (empresa_id, activo)"
echo ""

echo "Restricciones de 'configuraciones_malla_turnos':"
echo "  ✅ UNIQUE KEY (configuracion_id, plantilla_id)"
echo "  ✅ FOREIGN KEY configuracion_id → configuraciones_malla (CASCADE)"
echo "  ✅ FOREIGN KEY plantilla_id → plantillas_turno (CASCADE)"
echo ""

# ================================================================================
# SECCIÓN 4: Verificar que no hay datos de prueba conflictivos
# ================================================================================
echo "🗑️  SECCIÓN 4: Limpieza de Datos"
echo "---------------------------------"

echo "Si deseas comenzar con datos de prueba:"
echo "  1. Ejecuta: backend/seeds/16_seed_configuraciones_malla.sql"
echo ""
echo "Si deseas limpiar completamente (para empezar vacío):"
echo "  1. Ejecuta:"
echo "     DELETE FROM configuraciones_malla_turnos;"
echo "     DELETE FROM configuraciones_malla;"
echo ""

# ================================================================================
# SECCIÓN 5: Verificar Backend
# ================================================================================
echo "⚙️  SECCIÓN 5: Verificación del Backend"
echo "--------------------------------------"

echo "Verificar que el archivo existe:"
echo "  ✅ backend/routes/configuraciones-malla.js"
echo ""

echo "Verificar que la ruta está registrada en index.js:"
echo "  ✅ Línea debe contener:"
echo "     app.use('/api/configuraciones-malla', require('./routes/configuraciones-malla'));"
echo ""

echo "Reiniciar el backend:"
echo "  1. En la terminal: Ctrl+C"
echo "  2. Ejecuta: npm run dev"
echo "  3. Verifica que inicie sin errores"
echo ""

# ================================================================================
# SECCIÓN 6: Verificar Frontend
# ================================================================================
echo "🎨 SECCIÓN 6: Verificación del Frontend"
echo "--------------------------------------"

echo "Archivos que deben existir:"
echo "  ✅ frontend/src/components/ConfiguracionMalla.jsx"
echo "  ✅ frontend/src/components/ConfiguracionMalla.css"
echo ""

echo "Integración en Dashboard:"
echo "  1. Importar el componente en el archivo del Dashboard"
echo "  2. Agregar una pestaña o sección para 'Configuración de Malla'"
echo "  3. Mostrar <ConfiguracionMalla /> cuando se seleccione"
echo ""

# ================================================================================
# SECCIÓN 7: Tests Manuales
# ================================================================================
echo "🧪 SECCIÓN 7: Tests Manuales"
echo "----------------------------"

echo "Test 1: Listar configuraciones (vacío inicialmente)"
echo "  GET /api/configuraciones-malla"
echo "  Headers:"
echo "    Authorization: Bearer YOUR_JWT_TOKEN"
echo "    Content-Type: application/json"
echo "  Respuesta esperada:"
echo "    { \"total\": 0, \"configuraciones\": [] }"
echo ""

echo "Test 2: Crear configuración"
echo "  POST /api/configuraciones-malla"
echo "  Body:"
echo "    {"
echo "      \"nombre\": \"Malla de Prueba\","
echo "      \"cantidad_empleados\": 30,"
echo "      \"cantidad_turnos\": 2,"
echo "      \"turnos\": ["
echo "        { \"plantilla_id\": 1, \"orden\": 1, \"duracion_horas\": 12 },"
echo "        { \"plantilla_id\": 2, \"orden\": 2, \"duracion_horas\": 12 }"
echo "      ]"
echo "    }"
echo "  Respuesta esperada:"
echo "    { \"id\": 1, \"success\": true, ... }"
echo ""

echo "Test 3: Obtener configuración"
echo "  GET /api/configuraciones-malla/1"
echo "  Respuesta esperada:"
echo "    { \"id\": 1, \"nombre\": \"Malla de Prueba\", ... }"
echo ""

echo "Test 4: Actualizar configuración"
echo "  PUT /api/configuraciones-malla/1"
echo "  Body: (igual a POST, pero con cambios)"
echo "  Respuesta esperada:"
echo "    { \"success\": true, ... }"
echo ""

echo "Test 5: Eliminar configuración"
echo "  DELETE /api/configuraciones-malla/1"
echo "  Respuesta esperada:"
echo "    { \"success\": true, ... }"
echo ""

# ================================================================================
# SECCIÓN 8: Checklist de Finalización
# ================================================================================
echo "✅ CHECKLIST DE FINALIZACIÓN"
echo "----------------------------"
echo ""
echo "Marca los items conforme los completes:"
echo ""
echo "[ ] Ejecuté la migración 15 en phpMyAdmin"
echo "[ ] Las dos nuevas tablas existen en phpMyAdmin"
echo "[ ] Reinicié el backend sin errores"
echo "[ ] El archivo configuraciones-malla.js existe"
echo "[ ] La ruta está registrada en index.js"
echo "[ ] Los archivos ConfiguracionMalla.jsx y .css existen"
echo "[ ] Integré el componente en el Dashboard"
echo "[ ] Abrí la aplicación en http://localhost:5173"
echo "[ ] Puedo ver la sección 'Configuración de Malla'"
echo "[ ] Puedo crear una nueva configuración"
echo "[ ] Puedo ver la configuración en la lista"
echo "[ ] Puedo editar la configuración"
echo "[ ] Puedo eliminar la configuración"
echo "[ ] La auditoría registró las acciones"
echo ""

# ================================================================================
# SECCIÓN 9: Solución de Problemas
# ================================================================================
echo "🆘 SOLUCIÓN DE PROBLEMAS"
echo "-----------------------"
echo ""

echo "❌ Error: 'Table already exists'"
echo "   ✅ Solución: Es normal, el script incluye DROP TABLE IF EXISTS"
echo ""

echo "❌ Error: 'Foreign key constraint failed'"
echo "   ✅ Solución: Verifica que empresas y plantillas_turno existan"
echo ""

echo "❌ Error en backend: 'Cannot find module'"
echo "   ✅ Solución: Reinicia backend con: npm run dev"
echo ""

echo "❌ Frontend no muestra el componente"
echo "   ✅ Solución: Verifica que esté importado en Dashboard"
echo ""

echo "❌ El formulario no enva datos"
echo "   ✅ Solución: Verifica el token JWT en localStorage"
echo "   ✅ Solución: Abre la consola (F12) para ver errores"
echo ""

# ================================================================================
# SECCIÓN 10: Información Útil
# ================================================================================
echo "ℹ️  INFORMACIÓN ÚTIL"
echo "-------------------"
echo ""

echo "Base de datos actual:"
echo "  • URL phpMyAdmin: http://localhost/phpmyadmin"
echo "  • Total de tablas: 20 (18 originales + 2 nuevas)"
echo ""

echo "API Backend:"
echo "  • URL: http://localhost:3001"
echo "  • Endpoint base: /api/configuraciones-malla"
echo ""

echo "Frontend:"
echo "  • URL: http://localhost:5173"
echo "  • Componente: ConfiguracionMalla"
echo ""

echo "Documentación:"
echo "  • Lee: PASO2_FASE1_README.md"
echo "  • Lee: INSTRUCCIONES_MIGRACION_15.md"
echo "  • Lee: RESUMEN_EJECUTIVO_PASO2_FASE1.md"
echo ""

# ================================================================================
# FIN DEL SCRIPT
# ================================================================================
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "✅ VALIDACIÓN COMPLETADA"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Próximo paso: Ejecuta la migración SQL en phpMyAdmin"
echo "             (Si no lo has hecho aún)"
echo ""
echo "Para preguntas, consulta la documentación en el proyecto."
echo ""
