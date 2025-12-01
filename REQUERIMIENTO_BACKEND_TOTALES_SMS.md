# REQUERIMIENTO BACKEND: Endpoint Totales de Gestión de SMS

## 🎯 Objetivo
Implementar/arreglar el endpoint de totales de SMS para que los indicadores numéricos en el botón "Gestión de SMS" del Panel de Control y Gestión funcionen correctamente.

---

## 📍 Ubicación en Frontend
**Archivo**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
**Líneas**: 504-580 (función `smsTotales`)
**Uso visual**: Líneas 1618-1689 (indicadores dentro del botón de Gestión de SMS)

---

## 🔗 Endpoint Requerido

```
GET https://wellnet-rd.com:444/api/totales-sms/{ispId}
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
    "totalSmsEnviados": 1250,
    "smsExitosos": 1180,
    "smsFallidos": 45,
    "smsPendientes": 20,
    "smsCancelados": 5,
    "estadisticasEnvio": {
      "tasaExito": 94.40,
      "tasaFallo": 3.60,
      "intentosPromedioEnvio": 1.2
    },
    "resumenFinanciero": {
      "costoTotal": 3750.50,
      "costoPromedio": 3.00,
      "smsConCosto": 1200,
      "smsSinCosto": 50
    },
    "estadisticasTiempo": {
      "smsEsteMes": 380,
      "smsEstaSemana": 95,
      "smsHoy": 12
    },
    "interactividad": {
      "mensajesEntrantes": 340,
      "tasaRespuesta": 27.20
    }
  }
}
```

### Opción 2: Formato Snake Case (También Soportado)
```json
{
  "success": true,
  "data": {
    "total_sms_enviados": 1250,
    "sms_exitosos": 1180,
    "sms_fallidos": 45,
    "sms_pendientes": 20,
    "sms_cancelados": 5,
    "estadisticas_envio": {
      "tasa_exito": 94.40,
      "tasa_fallo": 3.60,
      "intentos_promedio_envio": 1.2
    },
    "resumen_financiero": {
      "costo_total": 3750.50,
      "costo_promedio": 3.00,
      "sms_con_costo": 1200,
      "sms_sin_costo": 50
    },
    "estadisticas_tiempo": {
      "sms_este_mes": 380,
      "sms_esta_semana": 95,
      "sms_hoy": 12
    },
    "interactividad": {
      "mensajes_entrantes": 340,
      "tasa_respuesta": 27.20
    }
  }
}
```

---

## 📊 Campos Requeridos

### Campos Principales

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `totalSmsEnviados` | number | Total de SMS enviados | ✅ |
| `smsExitosos` | number | SMS entregados exitosamente | ✅ |
| `smsFallidos` | number | SMS que fallaron en el envío | ✅ |
| `smsPendientes` | number | SMS en cola o procesando | ✅ |
| `smsCancelados` | number | SMS cancelados antes de enviar | ✅ |
| `estadisticasEnvio` | object | Métricas de rendimiento | ✅ |
| `resumenFinanciero` | object | Costos y métricas económicas | ✅ |
| `estadisticasTiempo` | object | Estadísticas por período de tiempo | ✅ |
| `interactividad` | object | Mensajes entrantes y respuestas | ✅ |

### Objeto estadisticasEnvio

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `tasaExito` | number | % de SMS exitosos (0-100) | ✅ |
| `tasaFallo` | number | % de SMS fallidos (0-100) | ✅ |
| `intentosPromedioEnvio` | number | Promedio de intentos por SMS | ⚠️ Opcional |

### Objeto resumenFinanciero

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `costoTotal` | number | Costo total en SMS enviados | ✅ |
| `costoPromedio` | number | Costo promedio por SMS | ✅ |
| `smsConCosto` | number | Cantidad de SMS con cargo | ✅ |
| `smsSinCosto` | number | Cantidad de SMS gratuitos | ✅ |

### Objeto estadisticasTiempo

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `smsEsteMes` | number | SMS enviados en el mes actual | ✅ |
| `smsEstaSemana` | number | SMS enviados esta semana | ✅ |
| `smsHoy` | number | SMS enviados hoy | ✅ |

### Objeto interactividad

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `mensajesEntrantes` | number | Mensajes recibidos de clientes | ✅ |
| `tasaRespuesta` | number | % de SMS que recibieron respuesta | ✅ |

---

## 🎨 Uso en la UI

Los datos se muestran dentro del botón "Gestión de SMS" en el Panel de Control y Gestión:

```
┌─────────────────────────────┐
│   📱 Gestión de SMS         │
│                              │
│   Total enviados: 1,250      │
│   ▓▓▓▓▓▓▓▓▓░                │  ← Gráfico: Exitosos/Fallidos/Pendientes
│                              │
│   🟢 Tasa de éxito: 94.40%   │
│   💰 Costo total: $3,750.50  │
│   📨 Entrantes: 340          │
│                              │
│   📊 Este mes: 380           │
│   📅 Hoy: 12                 │
└─────────────────────────────┘
```

**Comportamiento visual de la tasa de éxito**:
- **≥ 90%**: Color verde (excelente)
- **≤ 50%**: Color amarillo/rojo (advertencia)
- **Entre 51-89%**: Color normal

---

## 🔍 Estados de SMS

| Estado | Descripción |
|--------|-------------|
| **Exitoso** | SMS entregado correctamente al destinatario |
| **Fallido** | SMS que no pudo ser entregado (número inválido, sin cobertura, etc.) |
| **Pendiente** | SMS en cola esperando ser enviado |
| **Cancelado** | SMS cancelado por el usuario antes de enviarse |

---

## ⚠️ Manejo de Errores

### Caso 1: Endpoint No Disponible
```javascript
// Frontend mostrará: 0 en todos los campos principales
// Console: "❌ Error en totales-sms: [mensaje]"
```

### Caso 2: Respuesta HTML en lugar de JSON
```javascript
// Frontend detecta: payload.trim().startsWith('<')
// Console: "❌ API totales-sms retornó HTML"
// Acción: Valores principales = 0
```

### Caso 3: Timeout (>10 segundos)
```javascript
// Frontend cancela la petición
// Console: "❌ Error en totales-sms: timeout"
// Acción: Valores principales = 0
```

---

## 📝 Lógica de Negocio Sugerida (Backend)

```sql
-- Ejemplo SQL para calcular los totales de SMS
SELECT
    COUNT(*) as total_sms_enviados,
    SUM(CASE WHEN estado = 'exitoso' OR estado = 'entregado' THEN 1 ELSE 0 END) as sms_exitosos,
    SUM(CASE WHEN estado = 'fallido' OR estado = 'error' THEN 1 ELSE 0 END) as sms_fallidos,
    SUM(CASE WHEN estado = 'pendiente' OR estado = 'en_cola' THEN 1 ELSE 0 END) as sms_pendientes,
    SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as sms_cancelados
FROM sms_log
WHERE id_isp = ?;

-- Cálculo de tasas de éxito/fallo
-- tasa_exito = (sms_exitosos / total_sms_enviados) * 100
-- tasa_fallo = (sms_fallidos / total_sms_enviados) * 100

-- Ejemplo SQL para resumen financiero
SELECT
    COALESCE(SUM(costo), 0) as costo_total,
    COALESCE(AVG(costo), 0) as costo_promedio,
    SUM(CASE WHEN costo > 0 THEN 1 ELSE 0 END) as sms_con_costo,
    SUM(CASE WHEN costo = 0 THEN 1 ELSE 0 END) as sms_sin_costo
FROM sms_log
WHERE id_isp = ?;

-- Ejemplo SQL para estadísticas de tiempo
SELECT
    SUM(CASE WHEN DATE_FORMAT(fecha_envio, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m') THEN 1 ELSE 0 END) as sms_este_mes,
    SUM(CASE WHEN YEARWEEK(fecha_envio) = YEARWEEK(NOW()) THEN 1 ELSE 0 END) as sms_esta_semana,
    SUM(CASE WHEN DATE(fecha_envio) = CURDATE() THEN 1 ELSE 0 END) as sms_hoy
FROM sms_log
WHERE id_isp = ?;

-- Ejemplo SQL para interactividad (si existe tabla de mensajes entrantes)
SELECT
    COUNT(*) as mensajes_entrantes
FROM sms_entrantes
WHERE id_isp = ? AND fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- tasa_respuesta = (mensajes_entrantes / sms_exitosos) * 100
```

---

## ✅ Checklist de Implementación

- [ ] Crear/verificar ruta `GET /api/totales-sms/:ispId`
- [ ] Validar que `ispId` sea un número válido
- [ ] Consultar tabla de SMS log filtrada por `id_isp`
- [ ] Calcular totales por estado de SMS
- [ ] Calcular tasas de éxito y fallo
- [ ] Calcular resumen financiero (costos)
- [ ] Calcular estadísticas por período de tiempo (mes, semana, hoy)
- [ ] Calcular interactividad (mensajes entrantes y tasa de respuesta)
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
  'https://wellnet-rd.com:444/api/totales-sms/5' \
  -H 'Accept: application/json'
```

**Response esperada**:
```json
{
  "success": true,
  "data": {
    "totalSmsEnviados": 1250,
    "smsExitosos": 1180,
    "smsFallidos": 45,
    "smsPendientes": 20,
    "smsCancelados": 5,
    "estadisticasEnvio": {
      "tasaExito": 94.40,
      "tasaFallo": 3.60,
      "intentosPromedioEnvio": 1.2
    },
    "resumenFinanciero": {
      "costoTotal": 3750.50,
      "costoPromedio": 3.00,
      "smsConCosto": 1200,
      "smsSinCosto": 50
    },
    "estadisticasTiempo": {
      "smsEsteMes": 380,
      "smsEstaSemana": 95,
      "smsHoy": 12
    },
    "interactividad": {
      "mensajesEntrantes": 340,
      "tasaRespuesta": 27.20
    }
  }
}
```

---

## 💡 Notas Adicionales

### Cálculo de Tasas
Si el backend no calcula las tasas, pueden calcularse así:
```javascript
tasaExito = (smsExitosos / totalSmsEnviados) * 100
tasaFallo = (smsFallidos / totalSmsEnviados) * 100
tasaRespuesta = (mensajesEntrantes / smsExitosos) * 100
```

### Consideraciones de Tiempo
- **Este mes**: Desde el día 1 del mes actual hasta hoy
- **Esta semana**: De lunes a domingo de la semana actual
- **Hoy**: Solo los SMS del día actual

---

## 📞 Contacto

**Frontend Developer**: Revisar `IspDetailsScreen.tsx` líneas 504-580 para más detalles
**Estado actual**: Endpoint retorna HTML o no existe, causando que todos los indicadores muestren 0

---

## 🚀 Prioridad

**ALTA** - Los usuarios necesitan ver las estadísticas de SMS en el dashboard principal para monitorear el sistema de comunicación con clientes.

---

**Fecha de creación**: 2025-11-30
**Última actualización**: 2025-11-30
