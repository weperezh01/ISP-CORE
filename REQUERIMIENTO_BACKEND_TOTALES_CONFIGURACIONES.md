# REQUERIMIENTO BACKEND: Endpoint Totales de Configuraciones

## 🎯 Objetivo
Implementar/arreglar el endpoint de totales de configuraciones para que los indicadores numéricos en el botón "Configuraciones" del Panel de Control y Gestión funcionen correctamente.

---

## 📍 Ubicación en Frontend
**Archivo**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
**Líneas**: 651-712 (función `configuracionesTotales`)
**Uso visual**: Líneas 1764-1833 (indicadores dentro del botón de Configuraciones)

---

## 🔗 Endpoint Requerido

```
GET https://wellnet-rd.com:444/api/totales-configuraciones/{ispId}
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
    "totalConfiguraciones": 320,
    "configuracionesActivas": 285,
    "configuracionesIncompletas": 35,
    "configuracionRed": {
      "porcentajeConfigurado": 89.06
    },
    "estadisticasTiempo": {
      "configuracionesEsteMes": 42
    },
    "configuracionesPorRouter": {
      "Router MikroTik RB750": 125,
      "Router Ubiquiti EdgeRouter": 98,
      "Router TP-Link": 65,
      "Router Cisco": 32
    }
  }
}
```

### Opción 2: Formato Snake Case (También Soportado)
```json
{
  "success": true,
  "data": {
    "total_configuraciones": 320,
    "configuraciones_activas": 285,
    "configuraciones_incompletas": 35,
    "configuracion_red": {
      "porcentaje_configurado": 89.06
    },
    "estadisticas_tiempo": {
      "configuraciones_este_mes": 42
    },
    "configuraciones_por_router": {
      "Router MikroTik RB750": 125,
      "Router Ubiquiti EdgeRouter": 98,
      "Router TP-Link": 65,
      "Router Cisco": 32
    }
  }
}
```

---

## 📊 Campos Requeridos

### Campos Principales

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `totalConfiguraciones` | number | Total de configuraciones de red | ✅ |
| `configuracionesActivas` | number | Configuraciones activas y funcionales | ✅ |
| `configuracionesIncompletas` | number | Configuraciones incompletas o con errores | ✅ |
| `configuracionRed` | object | Métricas de eficiencia de red | ✅ |
| `estadisticasTiempo` | object | Estadísticas temporales | ✅ |
| `configuracionesPorRouter` | object | Distribución por modelo de router | ⚠️ Opcional |

### Objeto configuracionRed

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `porcentajeConfigurado` | number | % de eficiencia de configuración (0-100) | ✅ |

### Objeto estadisticasTiempo

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `configuracionesEsteMes` | number | Configuraciones realizadas este mes | ✅ |

### Objeto configuracionesPorRouter

Objeto clave-valor donde:
- **Clave**: Nombre del modelo de router
- **Valor**: Cantidad de configuraciones en ese router

```json
{
  "Router MikroTik RB750": 125,
  "Router Ubiquiti EdgeRouter": 98
}
```

**Nota**: El frontend solo muestra el **Top 3** de routers con más configuraciones.

---

## 🎨 Uso en la UI

Los datos se muestran dentro del botón "Configuraciones" en el Panel de Control y Gestión:

```
┌─────────────────────────────┐
│   ⚙️  Configuraciones       │
│                              │
│   Total: 320                 │
│   ▓▓▓▓▓▓▓░                  │  ← Gráfico: Activas/Incompletas/Sin config
│                              │
│   🟢 Eficiencia: 89.06%      │
│   📊 Este mes: 42            │
│                              │
│   Top Routers:               │
│   • MikroTik: 125 (39.1%)    │
│   • Ubiquiti: 98 (30.6%)     │
│   • TP-Link: 65 (20.3%)      │
└─────────────────────────────┘
```

**Comportamiento visual de la eficiencia**:
- **≥ 95%**: Color verde (excelente)
- **≤ 80%**: Color amarillo/rojo (advertencia)
- **Entre 81-94%**: Color normal

**Comportamiento del Top Routers**:
- Solo se muestran si hay datos en `configuracionesPorRouter`
- Se ordenan de mayor a menor cantidad
- Solo se muestran los **3 primeros**
- Se calcula el porcentaje de cada uno respecto al total
- Si un router tiene **≥ 60%** del total, se marca en amarillo (advertencia de concentración)

---

## 🔍 Estados de Configuraciones

| Estado | Descripción |
|--------|-------------|
| **Activa** | Configuración completa y funcional |
| **Incompleta** | Configuración parcial o con errores |
| **Sin configurar** | Calculado como: `total - activas - incompletas` |

---

## ⚠️ Manejo de Errores

### Caso 1: Endpoint No Disponible
```javascript
// Frontend mostrará: 0 en todos los campos
// Console: "❌ Error en totales-configuraciones: [mensaje]"
```

### Caso 2: Respuesta HTML en lugar de JSON
```javascript
// Frontend detecta: payload.trim().startsWith('<')
// Console: "❌ API totales-configuraciones retornó HTML"
// Acción: Todos los valores = 0
```

### Caso 3: Timeout (>10 segundos)
```javascript
// Frontend cancela la petición
// Console: "❌ Error en totales-configuraciones: timeout"
// Acción: Todos los valores = 0
```

### Caso 4: configuracionesPorRouter vacío
Si no se envía o está vacío, simplemente no se muestra la sección de Top Routers en la UI.

---

## 📝 Lógica de Negocio Sugerida (Backend)

```sql
-- Ejemplo SQL para calcular los totales de configuraciones
SELECT
    COUNT(*) as total_configuraciones,
    SUM(CASE WHEN estado = 'activa' OR estado = 'completa' THEN 1 ELSE 0 END) as configuraciones_activas,
    SUM(CASE WHEN estado = 'incompleta' OR estado = 'parcial' THEN 1 ELSE 0 END) as configuraciones_incompletas
FROM configuraciones
WHERE id_isp = ?;

-- Cálculo de porcentaje configurado
-- porcentaje_configurado = (configuraciones_activas / total_configuraciones) * 100

-- Ejemplo SQL para estadísticas de tiempo
SELECT
    SUM(CASE WHEN DATE_FORMAT(fecha_creacion, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m') THEN 1 ELSE 0 END) as configuraciones_este_mes
FROM configuraciones
WHERE id_isp = ?;

-- Ejemplo SQL para distribución por router
SELECT
    r.nombre_modelo as router_nombre,
    COUNT(c.id_configuracion) as cantidad
FROM configuraciones c
INNER JOIN routers r ON c.id_router = r.id_router
WHERE c.id_isp = ?
GROUP BY r.id_router, r.nombre_modelo
ORDER BY cantidad DESC;
```

**Formato del resultado de configuracionesPorRouter**:
```javascript
// Convertir resultado SQL a objeto:
{
  "Router MikroTik RB750": 125,
  "Router Ubiquiti EdgeRouter": 98,
  "Router TP-Link": 65
}
```

---

## ✅ Checklist de Implementación

- [ ] Crear/verificar ruta `GET /api/totales-configuraciones/:ispId`
- [ ] Validar que `ispId` sea un número válido
- [ ] Consultar tabla de configuraciones filtrada por `id_isp`
- [ ] Calcular totales por estado de configuración
- [ ] Calcular porcentaje de eficiencia
- [ ] Calcular configuraciones del mes actual
- [ ] Obtener distribución por modelo de router
- [ ] Convertir distribución a objeto clave-valor
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
  'https://wellnet-rd.com:444/api/totales-configuraciones/5' \
  -H 'Accept: application/json'
```

**Response esperada**:
```json
{
  "success": true,
  "data": {
    "totalConfiguraciones": 320,
    "configuracionesActivas": 285,
    "configuracionesIncompletas": 35,
    "configuracionRed": {
      "porcentajeConfigurado": 89.06
    },
    "estadisticasTiempo": {
      "configuracionesEsteMes": 42
    },
    "configuracionesPorRouter": {
      "Router MikroTik RB750": 125,
      "Router Ubiquiti EdgeRouter": 98,
      "Router TP-Link": 65,
      "Router Cisco": 32
    }
  }
}
```

---

## 💡 Notas Adicionales

### Cálculo de Porcentaje de Eficiencia
```javascript
porcentajeConfigurado = (configuracionesActivas / totalConfiguraciones) * 100
```

### Procesamiento del Top 3 Routers (Frontend)
El frontend procesa `configuracionesPorRouter` así:
1. Convierte el objeto a array de { name, count, pct }
2. Ordena por count descendente
3. Toma solo los primeros 3
4. Calcula el porcentaje de cada uno

### Consideraciones de Tiempo
- **Este mes**: Desde el día 1 del mes actual hasta hoy

### Gráfico Visual
El gráfico de barras muestra 3 segmentos:
- **Verde**: Configuraciones activas
- **Amarillo**: Configuraciones incompletas
- **Rojo**: Sin configurar (calculado: total - activas - incompletas)

---

## 📞 Contacto

**Frontend Developer**: Revisar `IspDetailsScreen.tsx` líneas 651-712 para más detalles
**Estado actual**: Endpoint retorna HTML o no existe, causando que todos los indicadores muestren 0

---

## 🚀 Prioridad

**ALTA** - Los usuarios necesitan monitorear el estado de las configuraciones de red y detectar problemas de concentración en ciertos routers.

---

**Fecha de creación**: 2025-11-30
**Última actualización**: 2025-11-30
