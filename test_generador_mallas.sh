#!/bin/bash
# ================================================
# Script de Prueba: Generador de Mallas Automático
# ================================================
# Requisitos:
# - Backend ejecutándose en http://localhost:3001
# - Usuario con rol Planificador autenticado
# - Token JWT válido

# ================================================
# CONFIGURACIÓN
# ================================================

BACKEND_URL="http://localhost:3001"
TOKEN="tu_token_jwt_aqui"  # Reemplazar con token válido
EMPRESA_ID=1
CONFIGURACION_ID=5

# ================================================
# TEST 1: Generar Malla Automática
# ================================================

echo "🚀 TEST 1: Generando malla automática..."
echo "==========================================="

curl -X POST "${BACKEND_URL}/api/planificador/generar-malla" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": '${EMPRESA_ID}',
    "configuracion_id": '${CONFIGURACION_ID}',
    "fecha_inicio": "2026-10-01",
    "cantidad_semanas": 4,
    "tipo_distribucion": "equilibrada",
    "pautas_seleccionadas": []
  }' | jq '.'

echo ""
echo ""

# ================================================
# TEST 2: Listar Mallas
# ================================================

echo "📋 TEST 2: Listando mallas..."
echo "================================"

curl -X GET "${BACKEND_URL}/api/planificador/mallas?empresa_id=${EMPRESA_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo ""

# ================================================
# TEST 3: Obtener Detalles de Malla
# ================================================

echo "📊 TEST 3: Obteniendo detalles de malla..."
echo "==========================================="

curl -X GET "${BACKEND_URL}/api/planificador/mallas/${CONFIGURACION_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo ""

# ================================================
# TEST 4: Ver Cobertura
# ================================================

echo "📈 TEST 4: Ver cobertura de período..."
echo "======================================"

curl -X GET "${BACKEND_URL}/api/planificador/cobertura?empresa_id=${EMPRESA_ID}&fecha_inicio=2026-10-01&fecha_fin=2026-10-31" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo ""

# ================================================
# TEST 5: Asignar Turno
# ================================================

echo "✅ TEST 5: Asignando turno a empleado..."
echo "========================================"

curl -X POST "${BACKEND_URL}/api/planificador/asignar-turno" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": '${EMPRESA_ID}',
    "instancia_turno_id": 1,
    "empleado_id": 5
  }' | jq '.'

echo ""
echo ""

# ================================================
# TEST 6: Error - Permiso Denegado
# ================================================

echo "🔒 TEST 6: Intento sin permisos..."
echo "=================================="

curl -X POST "${BACKEND_URL}/api/planificador/generar-malla" \
  -H "Authorization: Bearer token_invalido" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": '${EMPRESA_ID}',
    "configuracion_id": '${CONFIGURACION_ID}',
    "fecha_inicio": "2026-10-01",
    "cantidad_semanas": 4,
    "tipo_distribucion": "equilibrada"
  }' | jq '.'

echo ""
echo "================================"
echo "✓ Pruebas completadas"
echo "================================"
