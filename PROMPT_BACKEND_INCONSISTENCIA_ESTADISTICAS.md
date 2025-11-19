# 🐛 BUG: Inconsistencia en Estadísticas de ONUs Entre Endpoints

## Problema Detectado

El sistema tiene DOS endpoints que retornan estadísticas de ONUs, pero **retornan números diferentes y contradictorios**:

### Endpoint 1: Estadísticas Detalladas (CORRECTO ✅)

**URL:** `GET /api/olts/realtime/:oltId/onus/estadisticas`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "estadisticas": {
      "total": 171,
      "authorized": 169,
      "online": 164,
      "pending": 2,
      "offline": 5,
      "low_signal": 85
    },
    "consistency_check": "fail"
  }
}
```

### Endpoint 2: Lista de ONUs (INCORRECTO ❌)

**URL:** `GET /api/olts/realtime/:oltId/onus`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "onus": [ /* 177 ONUs */ ],
    "estadisticas": {
      "total": 177,          // ← Diferente
      "authorized": 0,       // ← INCORRECTO (debería ser 169)
      "pending": 0,          // ← INCORRECTO (debería ser 2)
      "offline": 5,          // ← Coincide
      "filtradas": 177
    },
    "consistency_check": "fail"
  }
}
```

## Análisis del Problema

### Inconsistencias Detectadas

| Métrica | Endpoint Estadísticas | Endpoint Lista | Diferencia |
|---------|----------------------|----------------|------------|
| Total | 171 | 177 | **+6 ONUs** |
| Authorized | 169 | **0** | **-169 ONUs** |
| Pending | 2 | **0** | **-2 ONUs** |
| Offline | 5 | 5 | ✅ Coincide |

### `consistency_check: "fail"`

Ambos endpoints retornan `"consistency_check": "fail"`, lo que indica que **el backend ya detectó** que los números no cuadran entre diferentes fuentes de datos.

## Causas Posibles

### 1. El Endpoint de Lista NO está Ejecutando Comandos SSH

El endpoint `/api/olts/realtime/:oltId/onus` probablemente:
- Está retornando datos de **base de datos** (no del OLT físico)
- No está ejecutando `display ont info summary all` (Huawei)
- No está ejecutando `show gpon onu state` (ZTE)

Esto explicaría por qué:
- `authorized: 0` (no puede determinar el estado de autorización desde BD)
- `pending: 0` (ONUs pendientes NO están en BD)
- `total: 177` (177 ONUs en BD, pero solo 171 existen físicamente en el OLT)

### 2. Datos Huérfanos en Base de Datos

Hay 6 ONUs (`177 - 171 = 6`) que:
- Existen en la base de datos
- **NO existen** físicamente en el OLT
- Probablemente fueron desconectadas o removidas del OLT

## Impacto en el Frontend

### Antes del Fix (Comportamiento Incorrecto)

**Pantalla de Detalles de OLT:**
- Usa endpoint de estadísticas
- Muestra: 171 total, 169 autorizadas, 2 pendientes ✅

**Pantalla de Lista de ONUs:**
- Usa endpoint de lista
- Muestra: 177 total, **0 autorizadas**, **0 pendientes** ❌

**Resultado:** Usuario ve números contradictorios entre pantallas.

### Después del Fix Frontend (Solución Temporal)

El frontend ahora:
1. Obtiene la lista de ONUs del endpoint `/api/olts/realtime/:oltId/onus` (177 ONUs)
2. Obtiene las estadísticas del endpoint `/api/olts/realtime/:oltId/onus/estadisticas` (números correctos)
3. **Ignora** las estadísticas del endpoint de lista
4. Muestra estadísticas consistentes en ambas pantallas

## Solución Requerida en Backend

### Opción 1: Eliminar Estadísticas del Endpoint de Lista (RECOMENDADO)

Si el endpoint de lista no puede calcular estadísticas correctas, **no debería incluirlas**:

```javascript
// En /api/olts/realtime/:oltId/onus
// ELIMINAR o dejar en null:
{
  "onus": [ /* lista de ONUs */ ],
  "estadisticas": null,  // ← No incluir si no son confiables
  "nota": "Para estadísticas precisas, usar /onus/estadisticas"
}
```

### Opción 2: Calcular Estadísticas Correctas (IDEAL)

Si el endpoint de lista SÍ consulta el OLT físico, debería calcular las estadísticas correctamente:

```javascript
// Pseudocódigo
const onus = await queryOLTDirectly(oltId);  // 171 ONUs del OLT real

const stats = {
  total: onus.length,  // 171
  authorized: onus.filter(o => o.status === 'working').length,  // 169
  pending: await getPendingONUs(oltId).length,  // 2
  offline: onus.filter(o => o.status !== 'working').length,  // 5
  filtradas: onus.length
};
```

### Opción 3: Sincronizar Base de Datos con OLT (MANTENIMIENTO)

Las 6 ONUs huérfanas deberían:
- Marcarse como "desconectadas" o "removidas" en BD
- O eliminarse si ya no son relevantes

Esto reduciría el `total` de BD de 177 a 171.

## Verificación

Después de implementar la solución, verificar:

```bash
# 1. Endpoint de estadísticas
curl -H "Authorization: Bearer $TOKEN" \
  https://wellnet-rd.com:444/api/olts/realtime/1/onus/estadisticas

# 2. Endpoint de lista
curl -H "Authorization: Bearer $TOKEN" \
  https://wellnet-rd.com:444/api/olts/realtime/1/onus
```

**Los números deben coincidir:**
- `total` debe ser igual en ambos (171)
- `authorized` debe ser igual en ambos (169)
- `pending` debe ser igual en ambos (2)
- `offline` debe ser igual en ambos (5)
- `consistency_check` debe ser `"ok"` en ambos

## Prioridad

**MEDIA** - El frontend ya implementó un workaround, pero es importante corregir el backend para:
1. Evitar confusión en logs
2. Permitir que otras aplicaciones/clientes confíen en el endpoint de lista
3. Detectar y limpiar datos huérfanos en BD

## Archivos Afectados en Backend

Probablemente:
- `controllers/oltRealtimeController.js` - función `getOnusList()`
- Scripts Python de consulta OLT
- Lógica de construcción de estadísticas en endpoint de lista

---

**Nota:** El `consistency_check: "fail"` es un buen mecanismo de detección. Mantenerlo, pero también corregir la causa raíz de las inconsistencias.
