# Guía de Testing - Funcionalidades TR-069

## Estado de Implementación

### ✅ FASE 1 - MVP (Backend Implementado y App Lista)

| Funcionalidad | Pantalla | Endpoint Backend | Estado App |
|---------------|----------|------------------|------------|
| Ver estadísticas TR-069 | TR069StatsScreen | `GET /tr069-stats` | ✅ Listo |
| Ver hosts conectados | TR069StatsScreen | `GET /tr069/hosts` | ✅ Listo |
| Reiniciar ONU | ONUDetailsScreen | `POST /tr069/reboot` | ✅ Listo |
| Configurar WiFi | TR069StatsScreen | `POST /tr069/wireless-lan` | ✅ Listo |
| Configurar DHCP LAN | TR069StatsScreen | `POST /tr069/lan-dhcp` | ✅ Listo |

### ⚠️ FASE 2 - Media Prioridad (Endpoints Pendientes en Backend)

| Funcionalidad | Pantalla | Endpoint Backend | Estado App |
|---------------|----------|------------------|------------|
| Resincronizar config | ONUDetailsScreen | `POST /tr069/resync-config` | ✅ Listo (esperando backend) |
| Ping diagnóstico | TR069StatsScreen | `POST /tr069/diagnostic/ping` | ✅ Listo (esperando backend) |
| Speed test descarga | TR069StatsScreen | `POST /tr069/diagnostic/speedtest` | ✅ Listo (esperando backend) |
| Speed test subida | TR069StatsScreen | `POST /tr069/diagnostic/speedtest` | ✅ Listo (esperando backend) |
| Traceroute | TR069StatsScreen | `POST /tr069/diagnostic/traceroute` | ✅ Listo (esperando backend) |

### 🔜 FASE 3 - Baja Prioridad (Endpoints Pendientes en Backend)

| Funcionalidad | Pantalla | Endpoint Backend | Estado App |
|---------------|----------|------------------|------------|
| Factory reset | ONUDetailsScreen | `POST /tr069/factory-reset` | ✅ Listo (esperando backend) |
| Deshabilitar ONU | ONUDetailsScreen | `POST /tr069/disable` | ✅ Listo (esperando backend) |

---

## Escenarios de Testing

### 1. ✅ Ver Estadísticas TR-069

**Objetivo:** Verificar que se pueden ver las estadísticas TR-069 de una ONU.

**Pasos:**
1. Navegar a: **OLTs → Seleccionar OLT → Detalles de ONU**
2. En la sección "Diagnóstico Técnico", presionar el botón **"TR-069 Stats"**
3. La pantalla TR069StatsScreen debe cargar

**Resultados Esperados:**
- ✅ Se muestra una card con **"Información del Cliente"** (nombre, dirección, modelo, MAC, etc.)
- ✅ Se muestra la sección **"General"** con datos de la ONU (modelo, versión software, serial, optical power, etc.)
- ✅ Se muestran secciones expandibles para IP Interfaces, WiFi, LAN DHCP, etc.
- ✅ Los datos se cargan desde el backend en ~2-5 segundos
- ⚠️ Si alguna sección requiere ACS, se muestra un mensaje explicativo

**Endpoints Usados:**
- `GET /api/olts/realtime/{olt_id}/onus/{serial}/tr069-stats`

**Logs Esperados en Consola:**
```
🔄 [TR069Stats] Fetching stats for ONU: HWTC12345678 on OLT: 123
✅ [TR069Stats] Data loaded successfully
📊 [TR069Stats] Raw data: {...}
```

---

### 2. ✅ Ver Hosts Conectados

**Objetivo:** Ver dispositivos conectados a la ONU del cliente.

**Pasos:**
1. En TR069StatsScreen, expandir la sección **"Hosts"**
2. Revisar la tabla de dispositivos conectados

**Resultados Esperados:**
- ✅ Se muestra una tabla con columnas: #, MAC Address, IP Address, Address Source, Hostname, Port, Active
- ✅ Se listan todos los dispositivos conectados a la ONU (computadoras, celulares, TVs, etc.)
- ✅ Los dispositivos activos muestran "Yes" en la columna Active

**Endpoints Usados:**
- Incluido en `GET /api/olts/realtime/{olt_id}/onus/{serial}/tr069-stats`

---

### 3. ✅ Reiniciar ONU

**Objetivo:** Reiniciar una ONU remotamente.

**Pasos:**
1. En ONUDetailsScreen, hacer scroll hasta los botones de acción
2. Presionar el botón **"Reiniciar"**
3. Confirmar la acción en el diálogo

**Resultados Esperados:**
- ✅ Se muestra un diálogo de confirmación con advertencia de 60 segundos de downtime
- ✅ Al confirmar, se envía el comando al backend
- ✅ Se muestra mensaje de éxito: "Comando de reinicio enviado a la ONU"
- ✅ La ONU se reinicia (verificar después de 60 segundos)
- ✅ Los datos se refrescan automáticamente después de 5 segundos

**Endpoints Usados:**
- `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/reboot`

**Logs Esperados en Consola:**
```
🔄 [Reboot] Reiniciando ONU: HWTC12345678
```

---

### 4. ✅ Configurar WiFi

**Objetivo:** Cambiar SSID y password de WiFi de una ONU.

**Pasos:**
1. En TR069StatsScreen, expandir la sección **"Wireless LAN 1"**
2. Modificar el campo **"SSID"** (ej: "NuevoWiFi_Test")
3. Modificar el campo **"Password"** (ej: "nuevaPassword123")
4. Opcional: Cambiar canal (ej: de 11 a 6)
5. Presionar el botón **"Guardar Configuración WiFi"**

**Resultados Esperados:**
- ✅ Se muestra "Guardando..." con spinner
- ✅ Se envía la configuración al backend
- ✅ Se muestra mensaje de éxito: "Configuración WiFi actualizada exitosamente"
- ✅ Los datos se recargan automáticamente
- ✅ El cliente puede conectarse con el nuevo SSID/password

**Endpoints Usados:**
- `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/wireless-lan`

**Payload Enviado:**
```json
{
  "ssid": "NuevoWiFi_Test",
  "password": "nuevaPassword123",
  "auth_mode": "wpa2-psk",
  "channel": 6,
  "tx_power": 100,
  "country_domain": "DO"
}
```

**Logs Esperados en Consola:**
```
💾 [TR069Stats] Saving WiFi config...
```

---

### 5. ✅ Configurar DHCP Server LAN

**Objetivo:** Habilitar/deshabilitar y configurar el servidor DHCP de la ONU.

**Pasos:**
1. En TR069StatsScreen, expandir la sección **"LAN DHCP Server"**
2. Cambiar **"DHCP Server Enable"** (Yes/No)
3. Si está habilitado, modificar:
   - DHCP IP Pool Min addr (ej: 192.168.1.10)
   - DHCP IP Pool Max addr (ej: 192.168.1.200)
   - DHCP DNS Servers (ej: 8.8.8.8, 1.1.1.1)
4. Presionar **"Guardar Configuración DHCP"**

**Resultados Esperados:**
- ✅ Se muestra "Guardando..." con spinner
- ✅ Se envía la configuración al backend
- ✅ Se muestra mensaje de éxito según estado:
  - Si habilitado: "Servidor DHCP habilitado y configurado exitosamente"
  - Si deshabilitado: "Servidor DHCP deshabilitado exitosamente"
- ✅ Los datos se recargan automáticamente

**Endpoints Usados:**
- `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/lan-dhcp`

**Payload Enviado (Habilitado):**
```json
{
  "dhcp_server_enable": true,
  "start_address": "192.168.1.10",
  "end_address": "192.168.1.200",
  "subnet_mask": "255.255.255.0",
  "dns_servers": "8.8.8.8, 1.1.1.1",
  "lease_time": 86400
}
```

**Payload Enviado (Deshabilitado):**
```json
{
  "dhcp_server_enable": false
}
```

**Logs Esperados en Consola:**
```
💾 [TR069Stats] Saving DHCP config...
```

---

### 6. ⚠️ Ping Diagnóstico (Esperando Backend - FASE 2)

**Objetivo:** Hacer ping desde la ONU a una IP/dominio.

**Pasos:**
1. En TR069StatsScreen, expandir la sección **"Troubleshooting"**
2. Presionar el botón **"IP Ping"**
3. Ingresar una IP o dominio (ej: "8.8.8.8" o "google.com")
4. Presionar **"Ejecutar"**

**Resultados Esperados:**
- ✅ Se muestra "Ejecutando, Por favor espere..."
- ⚠️ **ACTUALMENTE:** Puede fallar si backend no está implementado
- ✅ **CUANDO BACKEND ESTÉ LISTO:** Se muestra resultado con:
  - Paquetes exitosos/fallidos
  - Tiempo promedio/mínimo/máximo

**Endpoints Usados:**
- `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/diagnostic/ping`

**Payload Enviado:**
```json
{
  "host": "8.8.8.8",
  "number_of_repetitions": 4,
  "timeout": 1000
}
```

**Respuesta Esperada del Backend:**
```json
{
  "success": true,
  "data": {
    "success_count": 4,
    "failure_count": 0,
    "average_response_time": 15,
    "min_response_time": 12,
    "max_response_time": 18
  }
}
```

---

### 7. ⚠️ Speed Test (Esperando Backend - FASE 2)

**Objetivo:** Medir velocidad de descarga/subida desde la ONU.

**Pasos:**
1. En TR069StatsScreen, expandir la sección **"Troubleshooting"**
2. Presionar **"Download test"** o **"Upload test"**
3. Confirmar la acción (advierte que puede tardar 15-30 segundos)

**Resultados Esperados:**
- ✅ Se muestra "Ejecutando, Midiendo velocidad..."
- ⚠️ **ACTUALMENTE:** Puede fallar si backend no está implementado
- ✅ **CUANDO BACKEND ESTÉ LISTO:** Se muestra resultado con:
  - Velocidad de descarga/subida en Mbps
  - Latencia y Jitter

**Endpoints Usados:**
- `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/diagnostic/speedtest`

**Payload Enviado:**
```json
{
  "direction": "download"  // o "upload" o "both"
}
```

---

### 8. ⚠️ Resincronizar Configuración (Esperando Backend - FASE 2)

**Objetivo:** Forzar actualización de configuración desde la OLT.

**Pasos:**
1. En ONUDetailsScreen, presionar **"Resincronizar"**
2. Confirmar la acción

**Resultados Esperados:**
- ✅ Se muestra diálogo de confirmación
- ⚠️ **ACTUALMENTE:** Puede fallar si backend no está implementado
- ✅ **CUANDO BACKEND ESTÉ LISTO:**
  - Se envía comando al backend
  - Se muestra mensaje de éxito
  - Los datos se refrescan

**Endpoints Usados:**
- `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/resync-config`

---

### 9. 🔜 Factory Reset (Esperando Backend - FASE 3)

**Objetivo:** Restaurar ONU a configuración de fábrica.

**Pasos:**
1. En ONUDetailsScreen, presionar **"Restaurar"**
2. Confirmar en el primer diálogo (advertencia de pérdida de configuraciones)
3. Confirmar en el segundo diálogo (confirmación final)

**Resultados Esperados:**
- ✅ Se muestran DOS diálogos de confirmación (doble verificación)
- ✅ Advertencias claras sobre pérdida de datos
- ⚠️ **ACTUALMENTE:** Puede fallar si backend no está implementado
- ✅ **CUANDO BACKEND ESTÉ LISTO:**
  - Se envía comando al backend
  - La ONU se resetea (120 segundos de downtime)
  - Los datos se refrescan después de 10 segundos

**Endpoints Usados:**
- `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/factory-reset`

**Payload Enviado:**
```json
{
  "confirm": true
}
```

---

### 10. 🔜 Deshabilitar ONU (Esperando Backend - FASE 3)

**Objetivo:** Deshabilitar temporalmente una ONU.

**Pasos:**
1. En ONUDetailsScreen, presionar **"Deshabilitar"**
2. Confirmar la acción

**Resultados Esperados:**
- ✅ Se muestra advertencia de pérdida de servicio para el cliente
- ⚠️ **ACTUALMENTE:** Puede fallar si backend no está implementado
- ✅ **CUANDO BACKEND ESTÉ LISTO:**
  - Se envía comando al backend
  - Se muestra estado anterior y nuevo
  - Los datos se refrescan

**Endpoints Usados:**
- `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/disable`

---

## Verificación de Autenticación

**Token de Autenticación:**
- La app obtiene el token desde `@loginData` en AsyncStorage
- Fallback a `userToken` si no existe `@loginData`
- El token se envía en todas las peticiones: `Authorization: Bearer {token}`

**Para Verificar:**
1. En DevTools / React Native Debugger, inspeccionar AsyncStorage
2. Verificar que exista la clave `@loginData` con estructura:
```json
{
  "id": 123,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "nombre": "Usuario Test",
  ...
}
```

**Si hay problemas de autenticación:**
- Verificar que el token no haya expirado
- Hacer logout y login nuevamente
- Revisar logs de consola para mensajes de error

---

## Logs de Consola para Debugging

### TR069StatsScreen

```javascript
// Inicio de carga
🔄 [TR069Stats] Fetching stats for ONU: {serial} on OLT: {oltId}

// Éxito
✅ [TR069Stats] Data loaded successfully
📊 [TR069Stats] Raw data: {...}

// Error
❌ [TR069Stats] Error loading data: {error}

// Guardando WiFi
💾 [TR069Stats] Saving WiFi config...
❌ [TR069Stats] Error saving WiFi config: {error}

// Guardando DHCP
💾 [TR069Stats] Saving DHCP config...
❌ [TR069Stats] Error saving DHCP config: {error}
```

### ONUDetailsScreen

```javascript
// Reiniciar
🔄 [Reboot] Reiniciando ONU: {serial}
❌ [Reboot] Error: {error}

// Resincronizar
🔄 [Resync] Resincronizando configuración: {serial}
❌ [Resync] Error: {error}

// Factory Reset
⚠️ [Factory Reset] Restaurando ONU: {serial}
❌ [Factory Reset] Error: {error}

// Deshabilitar
⚠️ [Disable] Deshabilitando ONU: {serial}
❌ [Disable] Error: {error}
```

---

## Checklist de Testing Completo

### FASE 1 - MVP (Listo para Probar) ✅

- [ ] Ver estadísticas TR-069 completas
- [ ] Verificar información del cliente en TR069StatsScreen
- [ ] Ver hosts conectados
- [ ] Reiniciar ONU y verificar que se reinicia
- [ ] Cambiar SSID de WiFi y verificar que se aplica
- [ ] Cambiar password de WiFi y verificar conexión
- [ ] Habilitar/deshabilitar servidor DHCP
- [ ] Modificar rango de IPs DHCP

### FASE 2 - Media Prioridad (Esperando Backend)

- [ ] Resincronizar configuración
- [ ] Ping a 8.8.8.8
- [ ] Ping a google.com
- [ ] Speed test de descarga
- [ ] Speed test de subida
- [ ] Traceroute a 8.8.8.8

### FASE 3 - Baja Prioridad (Esperando Backend)

- [ ] Factory reset de ONU
- [ ] Deshabilitar ONU
- [ ] Habilitar ONU deshabilitada

---

## Errores Comunes y Soluciones

### Error: "No authentication token found"
**Solución:** Hacer logout y login nuevamente

### Error: "Missing OLT ID or ONU Serial"
**Solución:** Verificar que se esté navegando correctamente desde la lista de ONUs

### Error: "HTTP 401 Unauthorized"
**Solución:** Token expirado, hacer logout y login

### Error: "HTTP 404 Not Found"
**Solución:** Endpoint no implementado en backend (verificar fase)

### Error: "Timeout" al cargar TR-069 Stats
**Solución:** El backend puede tardar hasta 30 segundos en consultar la OLT, esperar

### WiFi configurado pero cliente no puede conectar
**Solución:**
1. Verificar que el password tenga mínimo 8 caracteres
2. Verificar que el canal esté disponible
3. Reiniciar la ONU después de cambiar WiFi
4. Esperar 2-3 minutos para que se apliquen los cambios

---

## Contacto para Reportar Problemas

Al reportar un problema, incluir:
1. Pantalla donde ocurrió el error
2. Pasos exactos para reproducir
3. Screenshot del error
4. Logs de consola relevantes
5. Serial de la ONU y ID de OLT

---

**Última actualización:** 2025-01-18
**Versión de la app:** 1.0.0
**Estado backend:** FASE 1 completa, FASE 2 y 3 pendientes
