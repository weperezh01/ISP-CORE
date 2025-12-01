# Requerimiento Backend: Endpoints de Totales del Dashboard

## Contexto del Problema

La pantalla "Panel de control y gestión" (`IspDetailsScreen`) no está mostrando los datos correctos porque **los endpoints del backend están devolviendo todos los contadores en 0**, excepto el endpoint de clientes que funciona correctamente.

**⚠️ IMPORTANTE**: Antes este sistema funcionaba correctamente. Hubo un problema con el control de versiones del backend y se perdió código que no se puede restaurar. Este documento describe el comportamiento esperado de todos los endpoints para que puedan ser reimplementados.

## Ubicación del Código Frontend

- **Archivo**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
- **Funciones de API**:
  - `totales` (línea ~285) → `/api/totales-isp/:ispId`
  - `conexionesTotales` (línea ~379) → `/api/totales-conexiones/:ispId`
  - `ciclosTotales` (línea ~420) → `/api/totales-ciclos/:ispId`
  - `smsTotales` (línea ~502) → `/api/totales-sms/:ispId`
  - `ordenes Totales` → `/api/totales-ordenes/:ispId`
  - `configuracionesTotales` (línea ~639) → `/api/totales-configuraciones/:ispId`
  - `instalacionesTotales` (línea ~707) → `/api/totales-instalaciones/:ispId`
  - `usuariosTotales` (línea ~774) → `/api/totales-usuarios/:ispId`

## 🔴 Problema Actual (Logs Capturados)

### ✅ Endpoint que SÍ funciona:

```
🔄 Llamando API totales con ispId: 12
📥 Response status: 200
✅ Datos actualizados en estado: {
  "totalClientes": 1282,
  "clientesActivos": 1075,
  "clientesInactivos": 209,
  "totalFacturasVencidas": 0,
  "totalFacturasVencidasActivos": 0,
  "totalFacturasVencidasInactivos": 0
}
```

### ❌ Endpoints que devuelven TODO en 0:

```
✅ Totales conexiones: {
  "totalConexiones": 0,
  "conexionesActivas": 0,
  "conexionesSuspendidas": 0,
  "conexionesInactivas": 0
}

✅ Totales ciclos: {
  "totalCiclos": 0,
  "ciclosVigentes": 0,
  "ciclosCerrados": 0,
  "ciclosVencidos": 0,
  "resumenFinanciero": {
    "totalFacturas": 0,
    "totalDinero": 0,
    "facturasPendientes": 0,
    "dineroPendiente": 0,
    "facturasCobradasPorcentaje": 0,
    "dineroRecaudadoPorcentaje": 0
  }
}

✅ Totales SMS: {
  "totalSmsEnviados": 0,
  "smsExitosos": 0,
  "smsFallidos": 0,
  "smsPendientes": 0,
  "smsCancelados": 0,
  ...
}

✅ Totales órdenes: {
  "totalOrdenes": 0,
  "ordenesPendientes": 0,
  ...
}

✅ Totales configuraciones: {
  "totalConfiguraciones": 0,
  ...
}

✅ Totales instalaciones: {
  "totalInstalaciones": 0,
  ...
}

✅ Totales usuarios: {
  "totalUsuarios": 0,
  "activos": 0,
  "inactivos": 0
}
```

**Todos devuelven status 200 OK**, pero con datos en 0, lo que indica que las queries SQL están fallando o los datos no se están consultando correctamente.

---

## Endpoints Requeridos

### 1. ✅ GET `/api/totales-isp/:ispId` - FUNCIONA CORRECTAMENTE

Este endpoint SÍ funciona. Es el modelo a seguir para los demás.

**URL**: `https://wellnet-rd.com:444/api/totales-isp/12`

**Respuesta Actual (CORRECTA)**:
```json
{
  "totalClientes": 1282,
  "clientesActivos": 1075,
  "clientesInactivos": 209,
  "totalFacturasVencidas": 0,
  "totalFacturasVencidasActivos": 0,
  "totalFacturasVencidasInactivos": 0
}
```

---

### 2. ❌ GET `/api/totales-conexiones/:ispId` - NO FUNCIONA

**URL**: `https://wellnet-rd.com:444/api/totales-conexiones/12`

#### Respuesta Actual (INCORRECTA):
```json
{
  "totalConexiones": 0,
  "conexionesActivas": 0,
  "conexionesSuspendidas": 0,
  "conexionesInactivas": 0
}
```

#### Respuesta Esperada:

Debe consultar la tabla `conexiones` filtrada por `id_isp = 12` y contar por estado:

```json
{
  "totalConexiones": 450,
  "conexionesActivas": 350,
  "conexionesSuspendidas": 50,
  "conexionesInactivas": 50,
  "conexionesPorEstado": {
    "estado0": 20,
    "estado1": 10,
    "estado2": 15,
    "estado3": 350,
    "estado4": 50,
    "estado5": 5,
    "estado6": 0
  }
}
```

#### Query SQL Recomendada:

```sql
-- Total de conexiones
SELECT COUNT(*) as totalConexiones
FROM conexiones
WHERE id_isp = ?;

-- Conexiones por estado
SELECT
  COUNT(CASE WHEN estado = 3 THEN 1 END) as conexionesActivas,
  COUNT(CASE WHEN estado = 4 THEN 1 END) as conexionesSuspendidas,
  COUNT(CASE WHEN estado IN (0, 5, 6) THEN 1 END) as conexionesInactivas
FROM conexiones
WHERE id_isp = ?;
```

---

### 3. ❌ GET `/api/totales-ciclos/:ispId` - NO FUNCIONA

**URL**: `https://wellnet-rd.com:444/api/totales-ciclos/12`

#### Respuesta Actual (INCORRECTA):
```json
{
  "totalCiclos": 0,
  "ciclosVigentes": 0,
  "ciclosCerrados": 0,
  "ciclosVencidos": 0,
  "resumenFinanciero": {
    "totalFacturas": 0,
    "totalDinero": 0,
    "facturasPendientes": 0,
    "dineroPendiente": 0,
    "facturasCobradasPorcentaje": 0,
    "dineroRecaudadoPorcentaje": 0
  }
}
```

#### Respuesta Esperada:

```json
{
  "totalCiclos": 24,
  "ciclosVigentes": 2,
  "ciclosCerrados": 20,
  "ciclosVencidos": 2,
  "resumenFinanciero": {
    "totalFacturas": 5430,
    "totalDinero": 2715000.00,
    "facturasPendientes": 890,
    "dineroPendiente": 445000.00,
    "facturasCobradasPorcentaje": 83.6,
    "dineroRecaudadoPorcentaje": 83.6
  }
}
```

#### Query SQL Recomendada:

```sql
-- Totales de ciclos
SELECT
  COUNT(*) as totalCiclos,
  COUNT(CASE WHEN estado_ciclo = 'vigente' THEN 1 END) as ciclosVigentes,
  COUNT(CASE WHEN estado_ciclo = 'cerrado' THEN 1 END) as ciclosCerrados,
  COUNT(CASE WHEN estado_ciclo = 'vencido' THEN 1 END) as ciclosVencidos
FROM ciclos_facturacion
WHERE id_isp = ?;

-- Resumen financiero de facturas
SELECT
  COUNT(*) as totalFacturas,
  SUM(monto_total) as totalDinero,
  COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as facturasPendientes,
  SUM(CASE WHEN estado = 'pendiente' THEN (monto_total - COALESCE(monto_recibido, 0)) ELSE 0 END) as dineroPendiente
FROM facturas
WHERE id_isp = ?;
```

---

### 4. ❌ GET `/api/totales-sms/:ispId` - NO FUNCIONA

**URL**: `https://wellnet-rd.com:444/api/totales-sms/12`

#### Respuesta Actual (INCORRECTA):
```json
{
  "totalSmsEnviados": 0,
  "smsExitosos": 0,
  "smsFallidos": 0,
  "smsPendientes": 0,
  "smsCancelados": 0,
  "estadisticasEnvio": {
    "tasaExito": 0,
    "tasaFallo": 0,
    "intentosPromedioEnvio": 0
  },
  "resumenFinanciero": {
    "costoTotal": 0,
    "costoPromedio": 0,
    "smsConCosto": 0,
    "smsSinCosto": 0
  },
  "estadisticasTiempo": {
    "smsEsteMes": 0,
    "smsEstaSemana": 0,
    "smsHoy": 0
  },
  "interactividad": {
    "mensajesEntrantes": 0,
    "tasaRespuesta": 0
  }
}
```

#### Respuesta Esperada:

```json
{
  "totalSmsEnviados": 15430,
  "smsExitosos": 14200,
  "smsFallidos": 1150,
  "smsPendientes": 80,
  "smsCancelados": 0,
  "estadisticasEnvio": {
    "tasaExito": 92.0,
    "tasaFallo": 7.5,
    "intentosPromedioEnvio": 1.2
  },
  "resumenFinanciero": {
    "costoTotal": 77150.00,
    "costoPromedio": 5.00,
    "smsConCosto": 15430,
    "smsSinCosto": 0
  },
  "estadisticasTiempo": {
    "smsEsteMes": 2340,
    "smsEstaSemana": 580,
    "smsHoy": 85
  },
  "interactividad": {
    "mensajesEntrantes": 450,
    "tasaRespuesta": 3.2
  }
}
```

#### Query SQL Recomendada:

```sql
SELECT
  COUNT(*) as totalSmsEnviados,
  COUNT(CASE WHEN estado = 'exitoso' OR estado = 'entregado' THEN 1 END) as smsExitosos,
  COUNT(CASE WHEN estado = 'fallido' OR estado = 'error' THEN 1 END) as smsFallidos,
  COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as smsPendientes,
  COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as smsCancelados,
  SUM(COALESCE(costo, 0)) as costoTotal,
  AVG(COALESCE(costo, 0)) as costoPromedio
FROM sms
WHERE id_isp = ?;

-- SMS por período de tiempo
SELECT
  COUNT(CASE WHEN fecha_envio >= CURDATE() THEN 1 END) as smsHoy,
  COUNT(CASE WHEN fecha_envio >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as smsEstaSemana,
  COUNT(CASE WHEN MONTH(fecha_envio) = MONTH(CURDATE()) AND YEAR(fecha_envio) = YEAR(CURDATE()) THEN 1 END) as smsEsteMes
FROM sms
WHERE id_isp = ?;
```

---

### 5. ❌ GET `/api/totales-ordenes/:ispId` - NO FUNCIONA

**URL**: `https://wellnet-rd.com:444/api/totales-ordenes/12`

#### Respuesta Actual (INCORRECTA):
```json
{
  "totalOrdenes": 0,
  "ordenesPendientes": 0,
  "ordenesEnProgreso": 0,
  "ordenesCompletadas": 0,
  "ordenesCanceladas": 0,
  "tasaCompletado": 0,
  "horasPromedioResolucion": 0,
  "ordenesEsteMes": 0
}
```

#### Respuesta Esperada:

```json
{
  "totalOrdenes": 850,
  "ordenesPendientes": 45,
  "ordenesEnProgreso": 120,
  "ordenesCompletadas": 670,
  "ordenesCanceladas": 15,
  "tasaCompletado": 78.8,
  "horasPromedioResolucion": 24.5,
  "ordenesEsteMes": 95
}
```

#### Query SQL Recomendada:

```sql
SELECT
  COUNT(*) as totalOrdenes,
  COUNT(CASE WHEN estado = 'pendiente' OR estado = 'Pendiente' THEN 1 END) as ordenesPendientes,
  COUNT(CASE WHEN estado = 'en_progreso' OR estado = 'En Progreso' THEN 1 END) as ordenesEnProgreso,
  COUNT(CASE WHEN estado = 'completada' OR estado = 'Completada' THEN 1 END) as ordenesCompletadas,
  COUNT(CASE WHEN estado = 'cancelada' OR estado = 'Cancelada' THEN 1 END) as ordenesCanceladas,
  AVG(CASE
    WHEN estado = 'completada' AND fecha_completado IS NOT NULL
    THEN TIMESTAMPDIFF(HOUR, fecha_creacion, fecha_completado)
  END) as horasPromedioResolucion
FROM ordenes_servicio
WHERE id_isp = ?;

-- Órdenes este mes
SELECT COUNT(*) as ordenesEsteMes
FROM ordenes_servicio
WHERE id_isp = ?
  AND MONTH(fecha_creacion) = MONTH(CURDATE())
  AND YEAR(fecha_creacion) = YEAR(CURDATE());
```

---

### 6. ❌ GET `/api/totales-configuraciones/:ispId` - NO FUNCIONA

**URL**: `https://wellnet-rd.com:444/api/totales-configuraciones/12`

#### Respuesta Actual (INCORRECTA):
```json
{
  "totalConfiguraciones": 0,
  "configuracionesActivas": 0,
  "configuracionesIncompletas": 0,
  "porcentajeConfigurado": 0,
  "configuracionesEsteMes": 0,
  "routersTop": []
}
```

#### Respuesta Esperada:

```json
{
  "totalConfiguraciones": 425,
  "configuracionesActivas": 380,
  "configuracionesIncompletas": 45,
  "porcentajeConfigurado": 89.4,
  "configuracionesEsteMes": 32,
  "routersTop": [
    {
      "router_id": 15,
      "router_nombre": "Router Central",
      "configuraciones": 85
    },
    {
      "router_id": 23,
      "router_nombre": "Router Norte",
      "configuraciones": 72
    }
  ]
}
```

#### Query SQL Recomendada:

```sql
SELECT
  COUNT(*) as totalConfiguraciones,
  COUNT(CASE WHEN estado = 'activa' OR completo = 1 THEN 1 END) as configuracionesActivas,
  COUNT(CASE WHEN estado = 'incompleta' OR completo = 0 THEN 1 END) as configuracionesIncompletas
FROM configuraciones
WHERE id_isp = ?;

-- Routers top con más configuraciones
SELECT
  r.id_router as router_id,
  r.nombre as router_nombre,
  COUNT(c.id_configuracion) as configuraciones
FROM routers r
LEFT JOIN configuraciones c ON r.id_router = c.id_router
WHERE r.id_isp = ?
GROUP BY r.id_router
ORDER BY configuraciones DESC
LIMIT 5;
```

---

### 7. ❌ GET `/api/totales-instalaciones/:ispId` - NO FUNCIONA

**URL**: `https://wellnet-rd.com:444/api/totales-instalaciones/12`

#### Respuesta Actual (INCORRECTA):
```json
{
  "totalInstalaciones": 0,
  "estadisticasTiempo": {
    "instalacionesEsteMes": 0,
    "instalacionesHoy": 0
  },
  "tracking": {
    "conUbicacion": 0,
    "sinUbicacion": 0
  },
  "equipos": {
    "configuradas": 0,
    "sinConfig": 0
  }
}
```

#### Respuesta Esperada:

```json
{
  "totalInstalaciones": 1150,
  "estadisticasTiempo": {
    "instalacionesEsteMes": 45,
    "instalacionesHoy": 3
  },
  "tracking": {
    "conUbicacion": 980,
    "sinUbicacion": 170
  },
  "equipos": {
    "configuradas": 1050,
    "sinConfig": 100
  }
}
```

#### Query SQL Recomendada:

```sql
SELECT
  COUNT(*) as totalInstalaciones,
  COUNT(CASE WHEN latitud IS NOT NULL AND longitud IS NOT NULL THEN 1 END) as conUbicacion,
  COUNT(CASE WHEN latitud IS NULL OR longitud IS NULL THEN 1 END) as sinUbicacion,
  COUNT(CASE WHEN equipo_configurado = 1 OR estado_configuracion = 'configurado' THEN 1 END) as configuradas,
  COUNT(CASE WHEN equipo_configurado = 0 OR estado_configuracion = 'sin_configurar' THEN 1 END) as sinConfig
FROM instalaciones
WHERE id_isp = ?;

-- Instalaciones por período
SELECT
  COUNT(CASE WHEN DATE(fecha_instalacion) = CURDATE() THEN 1 END) as instalacionesHoy,
  COUNT(CASE WHEN MONTH(fecha_instalacion) = MONTH(CURDATE()) AND YEAR(fecha_instalacion) = YEAR(CURDATE()) THEN 1 END) as instalacionesEsteMes
FROM instalaciones
WHERE id_isp = ?;
```

---

### 8. ❌ GET `/api/totales-usuarios/:ispId` - NO FUNCIONA

**URL**: `https://wellnet-rd.com:444/api/totales-usuarios/12`

#### Respuesta Actual (INCORRECTA):
```json
{
  "totalUsuarios": 0,
  "activos": 0,
  "inactivos": 0
}
```

#### Respuesta Esperada:

```json
{
  "totalUsuarios": 45,
  "activos": 38,
  "inactivos": 7,
  "roles": {
    "administradores": 5,
    "operadores": 25,
    "tecnicos": 10,
    "cajeros": 5
  }
}
```

#### Query SQL Recomendada:

```sql
SELECT
  COUNT(*) as totalUsuarios,
  COUNT(CASE WHEN is_online = 1 OR estado_usuario = 'ACTIVADO' THEN 1 END) as activos,
  COUNT(CASE WHEN is_online = 0 OR estado_usuario = 'DESACTIVADO' THEN 1 END) as inactivos
FROM usuarios
WHERE id_isp = ?;

-- Usuarios por rol
SELECT
  COUNT(CASE WHEN administrador = 'Y' THEN 1 END) as administradores,
  COUNT(CASE WHEN operador = 'Y' THEN 1 END) as operadores,
  COUNT(CASE WHEN nivel_usuario = 'TECNICO' THEN 1 END) as tecnicos
FROM usuarios
WHERE id_isp = ?;
```

---

## Requerimientos Técnicos

### 1. Filtrado por ISP

**MUY IMPORTANTE**: Todos los endpoints DEBEN filtrar por `id_isp`. Si el usuario pertenece al ISP 12, solo debe ver datos del ISP 12.

```sql
WHERE id_isp = ?
```

### 2. Manejo de Valores NULL

Si un contador es 0, devolver `0` en lugar de `null`:

```javascript
const data = {
  totalClientes: result.totalClientes || 0,
  clientesActivos: result.clientesActivos || 0,
  // ...
};
```

### 3. Formato de Respuesta

Todos los endpoints deben devolver JSON plano (sin envolturas):

✅ **CORRECTO**:
```json
{
  "totalConexiones": 450,
  "conexionesActivas": 350
}
```

❌ **INCORRECTO**:
```json
{
  "data": {
    "totalConexiones": 450
  }
}
```

El frontend puede manejar ambas estructuras, pero es preferible la forma plana.

### 4. Status Codes

- **200 OK**: Cuando la petición es exitosa (incluso si los contadores son 0 legítimamente)
- **400 Bad Request**: Cuando falta el `ispId` o es inválido
- **401 Unauthorized**: Cuando el token es inválido
- **500 Internal Server Error**: Cuando hay error en la base de datos

### 5. Logs del Backend

**MUY IMPORTANTE**: Agregar logs en cada endpoint:

```javascript
app.get('/api/totales-conexiones/:ispId', async (req, res) => {
  console.log('[API] totales-conexiones - ispId:', req.params.ispId);

  try {
    const result = await db.query(/* SQL query */);
    console.log('[API] totales-conexiones - Resultados:', result);

    res.json(result);
  } catch (error) {
    console.error('[API] totales-conexiones - ERROR:', error);
    res.status(500).json({ error: 'Error al obtener totales' });
  }
});
```

### 6. Performance

- Usar índices en las columnas `id_isp`, `estado`, `fecha_creacion`
- Los queries deben ejecutar en menos de 2 segundos
- Considerar caché si las consultas son muy pesadas

---

## Testing

Para verificar que los endpoints funcionan correctamente:

```bash
# Test endpoint clientes (este YA funciona)
curl -X GET "https://wellnet-rd.com:444/api/totales-isp/12" \
  -H "Authorization: Bearer {token}"

# Test endpoint conexiones
curl -X GET "https://wellnet-rd.com:444/api/totales-conexiones/12" \
  -H "Authorization: Bearer {token}"

# Test endpoint ciclos
curl -X GET "https://wellnet-rd.com:444/api/totales-ciclos/12" \
  -H "Authorization: Bearer {token}"

# ... etc
```

Verificar que:
1. Status code es 200
2. Los valores NO son todos 0
3. La estructura JSON es correcta

---

## Cambios Implementados en el Frontend

✅ El frontend ahora muestra **8 tarjetas de métricas**:
1. Clientes (funciona)
2. Facturas Vencidas (funciona)
3. Conexiones (datos en 0)
4. Ciclos (datos en 0)
5. SMS (datos en 0)
6. Órdenes (datos en 0)
7. Configuraciones (datos en 0)
8. Instalaciones (datos en 0)

✅ Logs extensivos para debugging:
- Cada API call se registra
- Los datos recibidos se muestran en consola
- El render de tarjetas muestra todos los valores

**El frontend está listo**. Solo falta que el backend devuelva datos correctos.

---

**Última actualización**: 2025-01-19
**Versión**: 1.0
**Autor**: Equipo de Desarrollo WellNet ISP
**ISP de prueba**: 12 (Well Net)
