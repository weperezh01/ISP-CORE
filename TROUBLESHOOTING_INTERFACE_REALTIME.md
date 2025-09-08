# Troubleshooting: Datos en Tiempo Real de InterfaceDetailsScreen

## 🔍 Cómo Debuggear el Problema

### 1. Verificar Logs en Consola
Abrir las DevTools y observar la secuencia de logs:

```bash
# Secuencia normal esperada:
🎯 InterfaceDetailsScreen: Screen focused - Starting traffic polling for ether1
🔄 InterfaceDetailsScreen: Fetching traffic for interface ether1 on router 123
📦 InterfaceDetailsScreen: Raw API response: { "status": "success", "data": {...} }
📊 InterfaceDetailsScreen: Traffic data: { "tx_rate": 12345, "rx_rate": 67890, ... }
🔄 InterfaceDetailsScreen: Mapped traffic data: { "upload_bps": 12345, "download_bps": 67890 }
✅ InterfaceDetailsScreen: Traffic data updated for ether1
```

### 2. Problemas Comunes y Soluciones

#### A. No se ven logs de peticiones
**Síntoma:** No aparecen logs `🔄 InterfaceDetailsScreen: Fetching traffic...`

**Posibles causas:**
- Polling está pausado (verificar estado del botón pause/play)
- La pantalla no está enfocada (verificar si aparece log `🎯 Screen focused`)
- routerId o interfaceName son undefined

**Solución:**
1. Verificar que el botón pause/play muestre "Pause" (polling activo)
2. Navegar a otra pantalla y regresar para verificar logs de focus
3. Revisar la debug card amarilla para verificar Router ID e Interface Name

#### B. Error HTTP 404
**Síntoma:** Log `❌ Router or interface not found`

**Posibles causas:**
- Router ID incorrecto
- Nombre de interfaz incorrecto
- Endpoint no registrado en backend

**Solución:**
1. Verificar que el Router ID sea válido en la debug card
2. Verificar que el nombre de interfaz sea exacto (case-sensitive)
3. Probar manualmente el endpoint: `GET /api/router/{id}/interface/{name}/traffic`

#### C. Error HTTP 500
**Síntoma:** Log `❌ Server error - possibly SSH connection failed`

**Posibles causas:**
- Error de conexión SSH al router MikroTik
- Router fuera de línea
- Credenciales SSH incorrectas
- Timeout de conexión

**Solución:**
1. Verificar que el router esté en línea
2. Revisar logs del backend para errores SSH
3. Verificar credenciales en la base de datos
4. Probar conexión SSH manual al router

#### D. Datos llegan pero no se muestran
**Síntoma:** Logs ✅ aparecen pero la UI no se actualiza

**Posibles causas:**
- Estructura de respuesta incorrecta
- Valores null/undefined en los datos
- Formato de números incorrecto

**Solución:**
1. Revisar el log `📦 Raw API response` para verificar estructura
2. Verificar que `result.status === 'success'`
3. Verificar que `result.data` contenga `tx_rate` y `rx_rate`
4. Usar el botón "🧪 Test API Manualmente" para una petición inmediata

### 3. Debug Card Visual
En modo desarrollo, aparece una tarjeta amarilla con información clave:

```
🐛 Debug Info (Solo Desarrollo)
Router ID: 123
Interface Name: ether1
Polling Enabled: Sí
Loading Traffic: No
Traffic Data: ↗️ 12345 bps ↙️ 67890 bps
URL de Tráfico: /api/router/123/interface/ether1/traffic
[🧪 Test API Manualmente]
```

### 4. Estructura de Respuesta Esperada
El backend debe retornar exactamente este formato:

```json
{
  "status": "success",
  "data": {
    "interface_name": "ether1",
    "tx_rate": 182100000,
    "rx_rate": 12800000,
    "tx_packets_per_sec": 18618,
    "rx_packets_per_sec": 7809,
    "timestamp": "2025-01-10T15:30:45.123Z"
  }
}
```

### 5. Checklist de Verificación

#### Frontend:
- [ ] InterfaceDetailsScreen recibe routerId válido
- [ ] InterfaceDetailsScreen recibe interfaceDetails.name válido
- [ ] Polling está habilitado (botón muestra "Pause")
- [ ] Pantalla está enfocada (logs 🎯 aparecen)
- [ ] Debug card muestra datos correctos

#### Backend:
- [ ] Endpoint registrado: `GET /api/router/:routerId/interface/:interfaceName/traffic`
- [ ] Router existe en base de datos
- [ ] Credenciales SSH correctas
- [ ] Conexión SSH funcional
- [ ] Comando MikroTik ejecuta correctamente
- [ ] Respuesta tiene formato JSON correcto

#### Red:
- [ ] Router está en línea
- [ ] Puerto SSH (22) accesible desde servidor
- [ ] Firewall permite conexiones SSH
- [ ] Interfaz existe en el router MikroTik

### 6. Comandos de Testing Manual

#### Probar endpoint directamente:
```bash
curl -X GET "https://wellnet-rd.com:444/api/router/123/interface/ether1/traffic" \
  -H "Content-Type: application/json"
```

#### Probar conexión SSH al router:
```bash
ssh admin@router-ip '/interface monitor-traffic interface=ether1 count=1'
```

### 7. Logs de Debugging Útiles

**En el frontend (consola del navegador):**
```javascript
// Verificar estado de polling
console.log('Polling enabled:', isPollingEnabled);

// Verificar parámetros
console.log('Router ID:', routerId);
console.log('Interface Name:', interfaceDetails.name);

// Verificar datos recibidos
console.log('Current traffic data:', trafficData);
```

**En el backend (logs del servidor):**
```javascript
// Verificar parámetros recibidos
console.log('Router ID received:', req.params.routerId);
console.log('Interface name received:', req.params.interfaceName);

// Verificar conexión SSH
console.log('SSH connection status:', connection.status);

// Verificar respuesta de MikroTik
console.log('MikroTik response:', mikrotikResponse);
```

### 8. Estados de la Aplicación

#### Estado Normal (Funcionando):
- Indicador LIVE con punto verde
- Datos de tráfico actualizándose cada 3 segundos
- Timestamp actualizándose
- Sin errores en consola

#### Estado con Errores:
- Indicador PAUSADO o sin actualizar
- Errores HTTP en consola
- Timestamp no actualiza
- Datos permanecen en 0

### 9. Solución Rápida

Si todo falla, reiniciar en orden:
1. Pausar y reanudar polling (botón pause/play)
2. Navegar a otra pantalla y regresar
3. Usar botón "🧪 Test API Manualmente"
4. Reiniciar servidor backend
5. Verificar conectividad de red al router