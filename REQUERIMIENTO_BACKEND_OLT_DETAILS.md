# Requerimiento Backend: Endpoints de Detalles de OLT

## Contexto del Problema

La pantalla `OLTDetailsScreen` no está cargando los datos de la OLT. Las peticiones se envían al backend pero **nunca reciben respuesta**, causando que la pantalla se quede cargando indefinidamente.

## Ubicación del Código Frontend

- **Archivo**: `src/pantallas/controles/OLTs/OLTDetailsScreen.tsx`
- **Funciones principales**:
  - `fetchOltDetails` (línea ~157)
  - `fetchOnusStats` (línea ~271)

## Flujo de Usuario

1. Usuario navega a la lista de OLTs
2. Usuario selecciona una OLT
3. Se abre la pantalla `OLTDetailsScreen`
4. La pantalla intenta cargar:
   - **Detalles de la OLT** (información básica)
   - **Estadísticas de ONUs** (contadores de ONUs online, offline, pending, etc.)
5. **Comportamiento esperado**: Los datos se cargan y se muestran en pantalla
6. **Comportamiento actual**: Las peticiones se quedan colgadas y nunca responden

## 🔴 Problema Actual

### Logs Capturados

```
🔵 [OLT Details] oltId: 1
🔵 [OLT Details] URL completa: https://wellnet-rd.com:444/api/olts/realtime/detalles/1?force=true
🔵 [OLT Details] Enviando petición al backend...
⏱️ [Fetch Timeout] Configurando timeout de 30000ms
```

**Y luego... SILENCIO. No hay respuesta.**

Error ocasional:
```
ERROR  ❌ [OLT Details] Error: [TypeError: Network request failed]
```

### Análisis

- ✅ El `oltId` se pasa correctamente (1)
- ✅ El `authToken` está disponible
- ✅ La URL se construye correctamente
- ❌ **El backend NO responde a las peticiones**

Causas posibles:
1. El endpoint no existe
2. El backend está caído o sobrecargado
3. El endpoint tarda más de 30 segundos en responder (timeout)
4. Hay un error interno en el backend que no devuelve respuesta

## Endpoints Requeridos

### 1. GET `/api/olts/realtime/detalles/:oltId`

**URL completa**: `https://wellnet-rd.com:444/api/olts/realtime/detalles/{oltId}?force=true`

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `force` | boolean | No | Si es `true`, bypass del caché del backend y consulta directa a la OLT |

#### Headers Requeridos

```
Content-Type: application/json
Authorization: Bearer {token}
```

#### Respuesta Esperada (200 OK)

El backend debe devolver información completa de la OLT en una de estas estructuras:

**Opción 1** (preferida):
```json
{
  "success": true,
  "cached": false,
  "data": {
    "olt": {
      "id_olt": 1,
      "nombre_olt": "MA5800-X15",
      "ip_olt": "192.168.1.100",
      "modelo": "Huawei MA5800",
      "estado": "activa",
      "ubicacion": "OLT Huawei MA5800-X15 conectada detrás del Router 44",
      "puerto_gestion": 23,
      "puerto_api": 80,
      "protocolo_gestion": "hybrid",
      "olt_username": "wellnet",
      "olt_password": "********",
      "snmp_community_read": "public",
      "snmp_community_write": "private",
      "snmp_port": 161,
      "vpn_tunnel": "no",
      "iptv_enabled": false,
      "hardware_version": "MA5800-X15",
      "software_version": "V800R020C10",
      "pon_types": "GPON",
      "tr069_profile": "",
      "fecha_instalacion": "2023-05-15",
      "porcentaje_ocupacion": "67.51",
      "puertos_ocupados": 293,
      "puertos_disponibles": 141,
      "updated_at": "2025-01-19T16:12:59.000Z"
    }
  }
}
```

**Opción 2**:
```json
{
  "success": true,
  "data": {
    "olt": { /* objeto OLT */ }
  }
}
```

**Opción 3** (sin anidamiento):
```json
{
  "olt": { /* objeto OLT */ }
}
```

**Opción 4** (datos directos):
```json
{
  "id_olt": 1,
  "nombre_olt": "MA5800-X15",
  // ... resto de campos
}
```

#### Campos Importantes del Objeto OLT

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_olt` | Integer | ID único de la OLT |
| `nombre_olt` | String | Nombre descriptivo de la OLT |
| `ip_olt` | String | Dirección IP de gestión |
| `modelo` | String | Modelo de la OLT (ej: "Huawei MA5800", "ZTE C320") |
| `estado` | String | Estado: "activa", "inactiva", "mantenimiento" |
| `ubicacion` | String | Ubicación física |
| `puerto_gestion` | Integer | Puerto Telnet/SSH (normalmente 23) |
| `puerto_api` | Integer | Puerto API (normalmente 80) |
| `protocolo_gestion` | String | Protocolo: "telnet", "ssh", "hybrid" |
| `olt_username` | String | Usuario de gestión |
| `olt_password` | String | Contraseña (se oculta en frontend) |
| `snmp_community_read` | String | Community SNMP de lectura |
| `snmp_community_write` | String | Community SNMP de escritura |
| `snmp_port` | Integer | Puerto SNMP (normalmente 161) |
| `vpn_tunnel` | String | "yes" o "no" |
| `iptv_enabled` | Boolean | Si tiene IPTV habilitado |
| `hardware_version` | String | Versión de hardware |
| `software_version` | String | Versión de firmware |
| `pon_types` | String | Tipos de PON soportados: "GPON", "EPON", etc. |
| `tr069_profile` | String | Perfil TR069 (puede ser vacío) |
| `fecha_instalacion` | String | Fecha de instalación (YYYY-MM-DD) |
| `porcentaje_ocupacion` | String | Porcentaje de ocupación (ej: "67.51") |
| `puertos_ocupados` | Integer | Número de puertos ocupados |
| `puertos_disponibles` | Integer | Número de puertos disponibles |

#### Respuestas de Error

**400 - Bad Request**:
```json
{
  "error": true,
  "message": "ID de OLT inválido"
}
```

**401 - Unauthorized**:
```json
{
  "error": true,
  "message": "Token de autenticación inválido o expirado"
}
```

**404 - Not Found**:
```json
{
  "error": true,
  "message": "OLT no encontrada",
  "oltId": 1
}
```

**500 - Internal Server Error**:
```json
{
  "error": true,
  "message": "Error al consultar la OLT",
  "details": "Descripción técnica del error"
}
```

---

### 2. GET `/api/olts/realtime/:oltId/onus/estadisticas`

**URL completa**: `https://wellnet-rd.com:444/api/olts/realtime/{oltId}/onus/estadisticas?force=true`

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `force` | boolean | No | Si es `true`, bypass del caché y consulta directa a la OLT |

#### Headers Requeridos

```
Content-Type: application/json
Authorization: Bearer {token}
```

#### Respuesta Esperada (200 OK)

El backend debe devolver estadísticas de las ONUs conectadas a la OLT:

**Opción 1** (preferida):
```json
{
  "success": true,
  "cached": false,
  "data": {
    "estadisticas": {
      "pending": 15,
      "pending_discovered": 10,
      "pending_resync": 3,
      "pending_new": 2,
      "online": 250,
      "authorized": 293,
      "offline": 43,
      "offline_power_fail": 20,
      "offline_los": 18,
      "offline_na": 5,
      "low_signal": 12,
      "low_signal_warning": 8,
      "low_signal_critical": 4
    }
  }
}
```

**Opción 2**:
```json
{
  "success": true,
  "data": {
    "estadisticas": { /* objeto estadísticas */ }
  }
}
```

**Opción 3**:
```json
{
  "estadisticas": { /* objeto estadísticas */ }
}
```

**Opción 4** (datos directos):
```json
{
  "pending": 15,
  "online": 250,
  // ... resto de campos
}
```

#### Campos del Objeto Estadísticas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `pending` | Integer | Total de ONUs en espera de autorización |
| `pending_discovered` | Integer | ONUs descubiertas (D) |
| `pending_resync` | Integer | ONUs que necesitan resincronización |
| `pending_new` | Integer | ONUs nuevas |
| `online` | Integer | ONUs en línea (activas) |
| `authorized` | Integer | Total de ONUs autorizadas |
| `offline` | Integer | ONUs fuera de línea |
| `offline_power_fail` | Integer | Offline por falla de energía |
| `offline_los` | Integer | Offline por pérdida de señal |
| `offline_na` | Integer | Offline sin clasificar |
| `low_signal` | Integer | Total con señal baja |
| `low_signal_warning` | Integer | Señal baja - advertencia |
| `low_signal_critical` | Integer | Señal baja - crítico |

**Nota**: Si algún contador no está disponible, enviar `0` en lugar de `null` o `undefined`.

#### Respuestas de Error

Similar al endpoint de detalles.

---

## Requerimientos Técnicos

### 1. Performance

- **Tiempo de respuesta**: Menos de 30 segundos (idealmente menos de 10 segundos)
- Si la consulta a la OLT tarda mucho:
  - Implementar caché en el backend
  - El parámetro `?force=true` debe bypass el caché para obtener datos frescos
  - Sin `?force=true`, devolver datos del caché si están disponibles

### 2. Manejo de Errores

- Siempre devolver una respuesta HTTP válida (no timeout sin respuesta)
- Incluir mensajes de error descriptivos
- Si la OLT no responde, devolver error 503 (Service Unavailable):

```json
{
  "error": true,
  "message": "La OLT no responde",
  "details": "Timeout al conectar con la OLT en 192.168.1.100:23"
}
```

### 3. Caché

Si se implementa caché:
- Incluir el campo `cached: true/false` en la respuesta
- Agregar timestamp de cuándo se obtuvo la data:

```json
{
  "success": true,
  "cached": true,
  "cached_at": "2025-01-19T18:30:00.000Z",
  "data": { /* ... */ }
}
```

### 4. Logs del Backend

**MUY IMPORTANTE**: Agregar logs en el backend para depuración:

```javascript
console.log('[OLT Details] Recibiendo petición para OLT ID:', oltId);
console.log('[OLT Details] Force refresh:', req.query.force);
console.log('[OLT Details] User ID:', req.user.id);
console.log('[OLT Details] Consultando OLT...');
console.log('[OLT Details] Respuesta de la OLT:', oltData);
```

## Logs de Diagnóstico Agregados (Frontend)

Se han agregado logs extensivos en el frontend con el prefijo `[OLT Details]` y `[OLT Stats]`:

- 🔷 `loadData`: Inicio de carga completa
- 🟢 `obtenerDatosUsuario`: Obtención de datos de AsyncStorage
- 🔵 `fetchOltDetails`: Carga de detalles de OLT
- 🟡 `fetchOnusStats`: Carga de estadísticas
- ⏱️ `Fetch Timeout`: Control de timeout de peticiones
- ✅ Éxito
- 🔴 Errores

### Para Reproducir el Problema

1. Ejecutar la app en modo desarrollo
2. Navegar a OLTs → Seleccionar una OLT
3. Revisar los logs en la consola de Metro bundler

Los logs mostrarán:
- Las URLs exactas llamadas
- Los headers enviados (con token truncado)
- Si hay timeout o error de red
- La respuesta completa del backend (si llega)

## Estado Actual del Problema

**Último diagnóstico** (2025-01-19, 23:21 PM):

### ✅ Endpoint de Estadísticas - FUNCIONA
```
✅ [OLT Stats] URL: https://wellnet-rd.com:444/api/olts/realtime/1/onus/estadisticas?force=true
✅ [OLT Stats] Status Code: 200
✅ [OLT Stats] Tiempo de respuesta: 12.7 segundos
✅ [OLT Stats] Datos recibidos: {
  "total": 163,
  "authorized": 162,
  "online": 159,
  "pending": 1,
  "offline": 3,
  "low_signal": 87
}
```

### ❌ Endpoint de Detalles - TIMEOUT (>30 segundos)
```
🔵 [OLT Details] URL: https://wellnet-rd.com:444/api/olts/realtime/detalles/1?force=true
🔵 [OLT Details] Enviando petición al backend...
⏱️ [Fetch Timeout] Configurando timeout de 30000ms
⏱️ [Fetch Timeout] ¡TIMEOUT! La petición excedió 30000ms
🔴 Error: La petición tardó más de 30 segundos. El servidor no respondió a tiempo.
```

### 🔴 PROBLEMA CRÍTICO: Timeout en Consulta a OLT Hardware

El endpoint `/api/olts/realtime/detalles/:oltId` está tardando **MÁS de 30 segundos** en responder.

#### Causa Raíz

El backend está consultando **directamente a la OLT hardware** vía Telnet/SSH/SNMP y esto es extremadamente lento:
- Conexión Telnet/SSH: 5-10 segundos
- Comandos CLI de la OLT: 10-20 segundos
- Parsing de respuesta: 5-10 segundos
- **Total: 20-40 segundos**

#### Impacto

- ✅ Las **estadísticas de ONUs** sí cargan (12.7s)
- ❌ Los **detalles de la OLT** NO cargan (timeout >30s)
- ❌ La pantalla se queda en estado de loading
- ❌ El usuario ve error de timeout

### Posibles Causas Específicas

1. **La OLT tarda mucho en responder**: La consulta CLI a la OLT (Huawei/ZTE) puede tardar 30-60 segundos
2. **Sin caché implementado**: El backend consulta la OLT cada vez sin usar caché
3. **Timeout del backend no configurado**: El backend se queda esperando a la OLT indefinidamente
4. **Consultas bloqueantes**: Las consultas a la OLT son síncronas y bloquean el servidor

### 🚨 Soluciones URGENTES Requeridas

#### Solución 1: Implementar Sistema de Caché (RECOMENDADO)

**Problema**: Consultar la OLT hardware cada vez es muy lento (30-40s).

**Solución**: Implementar caché de 5-10 minutos en el backend:

```javascript
// Pseudo-código para el backend
const cacheKey = `olt_details_${oltId}`;
const cachedData = await redis.get(cacheKey);

if (cachedData && !forceRefresh) {
  console.log('Devolviendo datos del caché');
  return res.json({
    success: true,
    cached: true,
    cached_at: cachedData.timestamp,
    data: cachedData
  });
}

// Si no hay caché o force=true, consultar la OLT
console.log('Consultando OLT hardware (esto puede tardar 30-60s)...');
const oltData = await consultarOLTHardware(oltId);

// Guardar en caché por 10 minutos
await redis.set(cacheKey, JSON.stringify(oltData), 'EX', 600);

return res.json({
  success: true,
  cached: false,
  data: oltData
});
```

**Beneficios**:
- ✅ Respuesta instantánea (<100ms) cuando hay caché
- ✅ Solo consulta la OLT cuando se fuerza refresh (`?force=true`)
- ✅ Reduce carga en la OLT hardware
- ✅ Mejor experiencia de usuario

#### Solución 2: Aumentar Timeout del Backend

El backend debe tener un timeout de **al menos 60 segundos** para consultas a OLT:

```javascript
// Timeout de 60 segundos para consulta a OLT
const oltConnection = await telnet.connect(oltIp, {
  timeout: 60000, // 60 segundos
  negotiationMandatory: false
});

// Ejecutar comandos con timeout
const response = await Promise.race([
  oltConnection.exec('display ont info 0 all'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('OLT timeout')), 60000)
  )
]);
```

#### Solución 3: Consultas Asíncronas / Background Jobs

Para datos que no son críticos en tiempo real, usar jobs en background:

```javascript
// Cuando se pide consulta con force=true
if (forceRefresh) {
  // Iniciar job en background
  queue.add('refresh-olt-data', { oltId });

  // Devolver datos del caché mientras se actualiza
  return res.json({
    success: true,
    cached: true,
    message: 'Actualizando datos en background...',
    data: cachedData
  });
}
```

#### Solución 4: Usar Datos de Base de Datos en Lugar de OLT

**Muchos datos NO necesitan consultarse a la OLT hardware**. Estos están en la base de datos:

```sql
-- Estos datos están en la tabla 'olts' de la BD
SELECT
  id_olt,
  nombre_olt,
  ip_olt,
  modelo,
  ubicacion,
  puerto_gestion,
  olt_username,
  olt_password,
  snmp_community_read,
  snmp_community_write,
  -- ... etc
FROM olts
WHERE id_olt = ?;
```

**Solo consultar a la OLT hardware para**:
- Estado actual (online/offline)
- Versión de firmware actualizada
- Estadísticas en tiempo real

Todo lo demás (configuración, credenciales, ubicación) está en la BD y es instantáneo.

### Recomendaciones Adicionales

1. **Verificar que los endpoints existan**:
   ```bash
   # En el servidor backend
   curl -X GET "https://wellnet-rd.com:444/api/olts/realtime/detalles/1" \
     -H "Authorization: Bearer {token}"
   ```

2. **Implementar timeout en la consulta a la OLT**:
   - Si la OLT no responde en 20 segundos, devolver error 503
   - No dejar la petición HTTP colgada

3. **Agregar logs detallados**:
   - Log cuando se recibe la petición
   - Log antes de consultar la OLT
   - Log de la respuesta de la OLT
   - Log antes de devolver la respuesta al frontend

4. **Implementar caché**:
   - Guardar los datos de la OLT en base de datos/Redis
   - Devolver datos del caché si `force=false` o no está presente
   - Refrescar caché si `force=true`

5. **Manejo de errores robusto**:
   ```javascript
   try {
     const oltData = await consultarOLT(oltId);
     res.json({ success: true, data: { olt: oltData } });
   } catch (error) {
     console.error('Error consultando OLT:', error);
     res.status(503).json({
       error: true,
       message: 'Error al consultar la OLT',
       details: error.message
     });
   }
   ```

## Cambios Implementados en el Frontend

✅ Se agregó función `fetchWithTimeout` para evitar peticiones colgadas indefinidamente

✅ **Timeout aumentado a 60 segundos** para detalles de OLT (actualizado 2025-01-19):
```javascript
// Para detalles de OLT
const response = await fetchWithTimeout(url, options, 60000); // 60 segundos

// Para estadísticas de ONUs
const response = await fetchWithTimeout(url, options, 30000); // 30 segundos
```

**Razón**: Las estadísticas cargan en ~13 segundos, pero los detalles de OLT tardan >30 segundos debido a consulta directa al hardware.

✅ Si el backend no responde en 60 segundos, se muestra error:
```
La petición tardó más de 60 segundos. El servidor no respondió a tiempo.
```

✅ Logs extensivos para debugging en consola

## Siguiente Paso

Para el equipo de backend:

1. **Verificar que los endpoints estén implementados y funcionando**
2. **Revisar los logs del servidor** para ver si las peticiones están llegando
3. **Testear los endpoints directamente** con curl o Postman
4. **Implementar timeout** en la consulta a la OLT para evitar peticiones colgadas
5. **Devolver siempre una respuesta HTTP** (nunca dejar la conexión abierta sin respuesta)

---

**Última actualización**: 2025-01-19
**Versión**: 1.0
**Autor**: Equipo de Desarrollo WellNet ISP
