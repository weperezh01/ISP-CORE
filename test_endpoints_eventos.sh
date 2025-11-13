#!/bin/bash

echo "=================================================="
echo "PRUEBA DE ENDPOINTS DE EVENTOS DE FACTURA"
echo "=================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Probar endpoint de registrar evento
echo "1. Probando endpoint: POST /api/factura/registrar-evento"
echo "------------------------------------------------"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST https://wellnet-rd.com:444/api/factura/registrar-evento \
  -H "Content-Type: application/json" \
  -d '{
    "id_factura": 99999,
    "id_usuario": 1,
    "tipo_evento": "Test desde script",
    "descripcion": "Prueba de endpoint",
    "fecha": "2025-01-13",
    "hora": "12:00:00",
    "fecha_hora": "2025-01-13 12:00:00"
  }')

# Extraer status code y body
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_STATUS")

echo "Status Code: $http_status"
echo "Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"

if [ "$http_status" -eq 200 ] || [ "$http_status" -eq 201 ]; then
    echo -e "${GREEN}✅ Endpoint de registrar evento EXISTE y funciona${NC}"
elif [ "$http_status" -eq 404 ]; then
    echo -e "${RED}❌ Endpoint NO EXISTE (404)${NC}"
    echo -e "${YELLOW}⚠️  Necesitas implementar el backend usando PROMPT_BACKEND_EVENTOS_FACTURA.md${NC}"
elif [ "$http_status" -eq 500 ]; then
    echo -e "${RED}❌ Endpoint existe pero tiene ERROR (500)${NC}"
    echo -e "${YELLOW}⚠️  Revisa los logs del backend o verifica que la tabla eventos_factura exista${NC}"
else
    echo -e "${RED}❌ Status inesperado: $http_status${NC}"
fi

echo ""
echo ""

# 2. Probar endpoint de obtener eventos
echo "2. Probando endpoint: POST /api/factura/obtener-eventos"
echo "------------------------------------------------"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST https://wellnet-rd.com:444/api/factura/obtener-eventos \
  -H "Content-Type: application/json" \
  -d '{"id_factura": 64555}')

# Extraer status code y body
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_STATUS")

echo "Status Code: $http_status"
echo "Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"

if [ "$http_status" -eq 200 ]; then
    echo -e "${GREEN}✅ Endpoint de obtener eventos EXISTE y funciona${NC}"

    # Contar cuántos eventos hay
    event_count=$(echo "$body" | jq 'length' 2>/dev/null)
    if [ ! -z "$event_count" ]; then
        echo -e "${GREEN}📊 Eventos encontrados para factura 64555: $event_count${NC}"
    fi
elif [ "$http_status" -eq 404 ]; then
    echo -e "${RED}❌ Endpoint NO EXISTE (404)${NC}"
    echo -e "${YELLOW}⚠️  Necesitas implementar el backend usando PROMPT_BACKEND_EVENTOS_FACTURA.md${NC}"
elif [ "$http_status" -eq 500 ]; then
    echo -e "${RED}❌ Endpoint existe pero tiene ERROR (500)${NC}"
    echo -e "${YELLOW}⚠️  Revisa los logs del backend o verifica que la tabla eventos_factura exista${NC}"
else
    echo -e "${RED}❌ Status inesperado: $http_status${NC}"
fi

echo ""
echo "=================================================="
echo "RESUMEN"
echo "=================================================="

# Hacer un resumen final
if [ "$http_status" -eq 404 ]; then
    echo -e "${RED}Los endpoints NO están implementados en el backend.${NC}"
    echo ""
    echo "📋 SIGUIENTE PASO:"
    echo "   1. Abre el archivo: PROMPT_BACKEND_EVENTOS_FACTURA.md"
    echo "   2. Úsalo para implementar los endpoints en el backend"
    echo "   3. Verifica que la tabla eventos_factura exista en la BD"
    echo "   4. Ejecuta este script nuevamente para verificar"
elif [ "$http_status" -eq 500 ]; then
    echo -e "${YELLOW}Los endpoints existen pero hay errores.${NC}"
    echo ""
    echo "📋 SIGUIENTE PASO:"
    echo "   1. Revisa los logs del backend"
    echo "   2. Verifica que la tabla eventos_factura exista:"
    echo "      SHOW TABLES LIKE 'eventos_factura';"
    echo "   3. Si no existe, créala con el SQL en PROMPT_BACKEND_EVENTOS_FACTURA.md"
elif [ "$http_status" -eq 200 ] || [ "$http_status" -eq 201 ]; then
    echo -e "${GREEN}✅ Los endpoints están funcionando correctamente.${NC}"
    echo ""
    echo "📋 SIGUIENTE PASO:"
    echo "   1. Abre la app y agrega un artículo a una factura"
    echo "   2. Ejecuta: npx react-native log-android | grep 'RegistrarEventoFactura\\|AgregarArticulo'"
    echo "   3. Revisa los logs para ver si se está llamando la función"
    echo "   4. Verifica que idUsuario tenga un valor (no sea null)"
fi

echo ""
