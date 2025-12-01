# REQUERIMIENTO BACKEND: Endpoint Totales de Órdenes de Servicio

## 🎯 Objetivo
Implementar/arreglar el endpoint de totales de órdenes de servicio para que los indicadores numéricos en el botón "Ordenes de Servicio" del Panel de Control y Gestión funcionen correctamente.

---

## 📍 Ubicación en Frontend
**Archivo**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
**Líneas**: 585-646 (función `ordenesTotales`)
**Uso visual**: Líneas 1835-1907 (indicadores dentro del botón de Órdenes de Servicio)

---

## 🔗 Endpoint Requerido

```
GET https://wellnet-rd.com:444/api/totales-ordenes/{ispId}
```

**Parámetros**:
- `ispId` (path parameter): ID del ISP del cual se requieren los totales

**Headers esperados**:
```json
{
  "Accept": "application/json",
  "Content-Type": "application/json"
}
```

**Timeout**: 10 segundos

---

## 📤 Respuesta Esperada

El endpoint debe retornar un objeto JSON con la siguiente estructura:

### Opción 1: Formato Directo con CamelCase (Preferido)
```json
{
  "success": true,
  "data": {
    "totalOrdenes": 245,
    "ordenesPendientes": 45,
    "ordenesEnProgreso": 32,
    "ordenesCompletadas": 158,
    "ordenesCanceladas": 10,
    "estadisticasRendimiento": {
      "tasaCompletado": 64.49,
      "horasPromedioResolucion": 36.5
    },
    "estadisticasTiempo": {
      "ordenesEsteMes": 58
    }
  }
}
```

### Opción 2: Formato Snake Case (También Soportado)
```json
{
  "success": true,
  "data": {
    "total_ordenes": 245,
    "ordenes_pendientes": 45,
    "ordenes_en_progreso": 32,
    "ordenes_completadas": 158,
    "ordenes_canceladas": 10,
    "estadisticas_rendimiento": {
      "tasa_completado": 64.49,
      "horas_promedio_resolucion": 36.5
    },
    "estadisticas_tiempo": {
      "ordenes_este_mes": 58
    }
  }
}
```

---

## 📊 Campos Requeridos

### Campos Principales

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `totalOrdenes` | number | Total de órdenes de servicio | ✅ |
| `ordenesPendientes` | number | Órdenes pendientes de atención | ✅ |
| `ordenesEnProgreso` | number | Órdenes en proceso de resolución | ✅ |
| `ordenesCompletadas` | number | Órdenes finalizadas exitosamente | ✅ |
| `ordenesCanceladas` | number | Órdenes canceladas | ✅ |
| `estadisticasRendimiento` | object | Métricas de rendimiento | ✅ |
| `estadisticasTiempo` | object | Estadísticas temporales | ✅ |

### Objeto estadisticasRendimiento

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `tasaCompletado` | number | % de órdenes completadas (0-100) | ⚠️ Opcional* |
| `horasPromedioResolucion` | number | Promedio de horas para resolver una orden | ✅ |

**\*Nota sobre tasaCompletado**: Si no se envía, el frontend lo calculará automáticamente:
```javascript
tasaCompletado = (ordenesCompletadas / totalOrdenes) * 100
```

### Objeto estadisticasTiempo

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `ordenesEsteMes` | number | Órdenes creadas en el mes actual | ✅ |

---

## 🎨 Uso en la UI

Los datos se muestran dentro del botón "Ordenes de Servicio" en el Panel de Control y Gestión:

```
┌─────────────────────────────┐
│   📋 Órdenes de Servicio    │
│                              │
│   Total: 245                 │
│   ▓▓▓▓▓░░░                  │  ← Gráfico: Completadas/Pendientes/Canceladas
│                              │
│   🟢 Tasa completado: 64.49% │
│   ⏱️  Prom. resolución: 1.52 días │
│   🟡 Backlog: 45             │
│   📊 Este mes: 58            │
└─────────────────────────────┘
```

**Comportamiento visual de la tasa de completado**:
- **≥ 80%**: Color verde (excelente)
- **≤ 50%**: Color amarillo/rojo (advertencia)
- **Entre 51-79%**: Color normal

**Formato de tiempo de resolución**:
- Si es **≥ 24 horas**: Mostrar en días (ej: "1.52 días")
- Si es **< 24 horas**: Mostrar en horas (ej: "18.5 h")

---

## 🔍 Estados de Órdenes de Servicio

| Estado | Descripción |
|--------|-------------|
| **Pendiente** | Orden creada pero sin asignar o iniciar |
| **En Progreso** | Orden asignada y en proceso de resolución |
| **Completada** | Orden finalizada exitosamente |
| **Cancelada** | Orden cancelada por algún motivo |

---

## ⚠️ Manejo de Errores

### Caso 1: Endpoint No Disponible
```javascript
// Frontend mostrará: 0 en todos los campos
// Console: "❌ Error en totales-ordenes: [mensaje]"
```

### Caso 2: Respuesta HTML en lugar de JSON
```javascript
// Frontend detecta: payload.trim().startsWith('<')
// Console: "❌ API totales-ordenes retornó HTML"
// Acción: Todos los valores = 0
```

### Caso 3: Timeout (>10 segundos)
```javascript
// Frontend cancela la petición
// Console: "❌ Error en totales-ordenes: timeout"
// Acción: Todos los valores = 0
```

### Caso 4: Tasa de completado no calculada
Si el backend no envía `tasaCompletado` pero sí envía `totalOrdenes` y `ordenesCompletadas`, el frontend calcula:
```javascript
const tasaCompletado = (ordenesCompletadas / totalOrdenes) * 100;
```

---

## 📝 Lógica de Negocio Sugerida (Backend)

```sql
-- Ejemplo SQL para calcular los totales de órdenes
SELECT
    COUNT(*) as total_ordenes,
    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as ordenes_pendientes,
    SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as ordenes_en_progreso,
    SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as ordenes_completadas,
    SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as ordenes_canceladas
FROM ordenes_servicio
WHERE id_isp = ?;

-- Ejemplo SQL para estadísticas de rendimiento
SELECT
    AVG(TIMESTAMPDIFF(HOUR, fecha_creacion, fecha_completado)) as horas_promedio_resolucion
FROM ordenes_servicio
WHERE id_isp = ? AND estado = 'completada' AND fecha_completado IS NOT NULL;

-- Cálculo de tasa de completado (opcional en backend)
-- tasa_completado = (ordenes_completadas / total_ordenes) * 100

-- Ejemplo SQL para estadísticas de tiempo
SELECT
    SUM(CASE WHEN DATE_FORMAT(fecha_creacion, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m') THEN 1 ELSE 0 END) as ordenes_este_mes
FROM ordenes_servicio
WHERE id_isp = ?;
```

---

## ✅ Checklist de Implementación

- [ ] Crear/verificar ruta `GET /api/totales-ordenes/:ispId`
- [ ] Validar que `ispId` sea un número válido
- [ ] Consultar tabla de órdenes de servicio filtrada por `id_isp`
- [ ] Calcular totales por estado de orden
- [ ] Calcular promedio de horas de resolución (solo órdenes completadas)
- [ ] Calcular tasa de completado (o dejar que frontend lo haga)
- [ ] Calcular órdenes del mes actual
- [ ] Retornar JSON con estructura especificada
- [ ] Asegurar que el Content-Type sea `application/json`
- [ ] Probar con diferentes ISPs
- [ ] Validar que no retorne HTML en ningún caso
- [ ] Implementar manejo de errores apropiado
- [ ] Optimizar consulta para que responda en <10 segundos

---

## 🧪 Ejemplo de Prueba

**Request**:
```bash
curl -X GET \
  'https://wellnet-rd.com:444/api/totales-ordenes/5' \
  -H 'Accept: application/json'
```

**Response esperada**:
```json
{
  "success": true,
  "data": {
    "totalOrdenes": 245,
    "ordenesPendientes": 45,
    "ordenesEnProgreso": 32,
    "ordenesCompletadas": 158,
    "ordenesCanceladas": 10,
    "estadisticasRendimiento": {
      "tasaCompletado": 64.49,
      "horasPromedioResolucion": 36.5
    },
    "estadisticasTiempo": {
      "ordenesEsteMes": 58
    }
  }
}
```

---

## 💡 Notas Adicionales

### Cálculo de Promedio de Resolución
Solo se debe incluir en el cálculo las órdenes que:
- Tienen estado `completada`
- Tienen `fecha_completado` no nulo
- Se calcula: `fecha_completado - fecha_creacion` en horas

### Consideraciones de Tiempo
- **Este mes**: Desde el día 1 del mes actual hasta hoy
- Si no hay órdenes completadas, `horasPromedioResolucion` debe ser `0`

### Backlog
El término "Backlog" en la UI se refiere a `ordenesPendientes`, es decir, la cantidad de órdenes acumuladas sin resolver.

---

## 📞 Contacto

**Frontend Developer**: Revisar `IspDetailsScreen.tsx` líneas 585-646 para más detalles
**Estado actual**: Endpoint retorna HTML o no existe, causando que todos los indicadores muestren 0

---

## 🚀 Prioridad

**ALTA** - Los usuarios necesitan monitorear el estado de las órdenes de servicio y su rendimiento en el dashboard principal.

---

**Fecha de creación**: 2025-11-30
**Última actualización**: 2025-11-30
