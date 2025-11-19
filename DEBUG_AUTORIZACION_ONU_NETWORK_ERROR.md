# DEBUG - Error de Red al Autorizar ONU

## ⚠️ Problema Actual

**Error**: `Network request failed` al intentar autorizar una ONU

**Fecha**: 2025-01-19

---

## 📊 Información del Error

### Log del Frontend:
```
LOG  📤 [Authorization] Sending payload: {
  "board": 1,
  "download_mbps": 50,
  "download_speed": "50M",
  "gpon_channel": "GPON",
  "name": "Prueba 14",
  "ont_id": 0,
  "onu_external_id": "48575443439B989D",
  "onu_mode": "Routing",
  "onu_type": "HG8245H",
  "pon_type": "GPON",
  "port": 0,
  "puerto": "0/1/0",
  "sn": "48575443439B989D",
  "upload_mbps": 50,
  "upload_speed": "50M",
  "use_gps": false,
  "user_vlan_id": 100,
  "zona": "281"
}

ERROR  ❌ [API] Network/Fetch Error: [TypeError: Network request failed]
ERROR  ❌ [Authorization] Exception: [Error: Network request failed]
```

---

## 🔍 Análisis del Problema

### 1. **Endpoint Llamado**
```
POST https://wellnet-rd.com:444/api/olts/realtime/{oltId}/onus/48575443439B989D/authorize
```

**Nota**: No se ve el `oltId` en el log, pero se está enviando desde el frontend.

### 2. **Payload Correcto**
✅ El payload está perfectamente formateado:
- Serial: `48575443439B989D` (Huawei - formato válido)
- Puerto: `0/1/0` (formato correcto)
- Board: `1`
- Port: `0`
- VLAN: `100`
- Velocidad: `50M/50M`
- Zona: `281`
- ONU Type: `HG8245H`

### 3. **Posibles Causas del Error**

#### A. **Endpoint No Implementado**
El endpoint no existe en el backend:
```
POST /api/olts/realtime/:oltId/onus/:serial/authorize
```

**Verificar**:
```bash
# En el backend, revisar rutas registradas
grep -r "authorize" routes/
grep -r "/onus/:serial/authorize" .
```

#### B. **Backend Caído o No Responde**
El servidor no está corriendo en `wellnet-rd.com:444`

**Verificar**:
```bash
# Desde el servidor backend
netstat -tlnp | grep 444
# O
lsof -i :444
```

#### C. **Timeout**
El backend tarda demasiado en responder (más de 60 segundos)

**Verificar en logs del backend**:
```bash
tail -f /var/log/wellnet/backend.log
# O donde estén los logs
```

#### D. **Error de Certificado SSL**
Problema con el certificado HTTPS del puerto 444

**Verificar**:
```bash
openssl s_client -connect wellnet-rd.com:444 -servername wellnet-rd.com
```

#### E. **Firewall o Puerto Bloqueado**
El puerto 444 está bloqueado

**Verificar**:
```bash
# Desde el servidor
sudo ufw status
sudo iptables -L -n | grep 444
```

#### F. **Error en el Script Python de Autorización**
El script se cuelga o genera una excepción no manejada

---

## 🛠️ Soluciones Sugeridas

### 1. **Verificar si el Endpoint Existe**

Revisa el archivo de rutas del backend (probablemente `routes/olts.js` o `routes/onu.js`):

```javascript
// Debería existir algo como:
router.post('/realtime/:oltId/onus/:serial/authorize', async (req, res) => {
  // Implementación
});
```

**Si NO existe**: Implementar el endpoint según `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md`

### 2. **Implementación Mínima del Endpoint**

Si el endpoint no existe, crear esta implementación temporal para debugging:

```javascript
// routes/olts.js o routes/onu.js

router.post('/realtime/:oltId/onus/:serial/authorize', async (req, res) => {
  try {
    const { oltId, serial } = req.params;
    const payload = req.body;

    console.log('🔵 [Authorization] Request received:');
    console.log('   OLT ID:', oltId);
    console.log('   Serial:', serial);
    console.log('   Payload:', JSON.stringify(payload, null, 2));

    // TEMPORAL: Devolver respuesta de prueba
    res.json({
      success: true,
      message: 'Endpoint recibiendo datos correctamente (modo debug)',
      debug: {
        oltId,
        serial,
        receivedPayload: payload
      }
    });

  } catch (error) {
    console.error('❌ [Authorization] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});
```

### 3. **Agregar Logging en el Backend**

En el middleware o en el archivo principal del backend:

```javascript
// Logging de TODAS las peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});
```

### 4. **Verificar Conexión al Backend**

Probar manualmente con curl:

```bash
# Test básico de conectividad
curl -k https://wellnet-rd.com:444/api/olts/summary

# Test del endpoint de autorización (con token válido)
curl -k -X POST https://wellnet-rd.com:444/api/olts/realtime/1/onus/48575443439B989D/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "board": 1,
    "download_mbps": 50,
    "download_speed": "50M",
    "gpon_channel": "GPON",
    "name": "Prueba 14",
    "ont_id": 0,
    "onu_external_id": "48575443439B989D",
    "onu_mode": "Routing",
    "onu_type": "HG8245H",
    "pon_type": "GPON",
    "port": 0,
    "puerto": "0/1/0",
    "sn": "48575443439B989D",
    "upload_mbps": 50,
    "upload_speed": "50M",
    "use_gps": false,
    "user_vlan_id": 100,
    "zona": "281"
  }'
```

### 5. **Aumentar Timeout en el Frontend (Temporal)**

Si el problema es timeout, modificar `api.ts`:

```typescript
async function fetchWithAuth<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Agregar timeout de 60 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    // ... resto del código
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'La petición excedió el tiempo de espera (60 segundos)',
      };
    }
    // ... resto del manejo de errores
  }
}
```

---

## 📋 Checklist de Debugging

Ejecutar en orden:

- [ ] **1. Verificar que el backend esté corriendo**
  ```bash
  ps aux | grep node
  # o
  pm2 status
  ```

- [ ] **2. Verificar que el puerto 444 esté escuchando**
  ```bash
  netstat -tlnp | grep 444
  ```

- [ ] **3. Probar endpoint con curl** (ver comando arriba)

- [ ] **4. Revisar logs del backend en tiempo real**
  ```bash
  tail -f /var/log/wellnet/*.log
  # o
  pm2 logs
  ```

- [ ] **5. Verificar que la ruta existe en el código**
  ```bash
  grep -r "authorize" routes/
  ```

- [ ] **6. Revisar si hay errores en los logs del backend**
  ```bash
  journalctl -u wellnet-backend -n 100
  ```

- [ ] **7. Verificar certificado SSL**
  ```bash
  openssl s_client -connect wellnet-rd.com:444
  ```

- [ ] **8. Revisar firewall**
  ```bash
  sudo ufw status verbose
  ```

---

## 🎯 Acción Inmediata Recomendada

1. **Verificar que el backend está corriendo y escuchando en el puerto 444**
2. **Probar el endpoint con curl** usando el comando de arriba
3. **Revisar los logs del backend** para ver si la petición está llegando
4. **Si el endpoint no existe**: Implementar el handler temporal de arriba
5. **Si existe pero falla**: Revisar el script Python de autorización

---

## 📝 Información Adicional Necesaria

Para ayudar mejor, necesito saber:

1. **¿El backend está corriendo?**
   - Comando: `pm2 status` o `ps aux | grep node`

2. **¿Qué framework backend se está usando?**
   - Express.js, Fastify, NestJS, etc.

3. **¿Dónde están los logs del backend?**
   - `/var/log/wellnet/`
   - `pm2 logs`
   - Otro lugar

4. **¿El endpoint de autorización está implementado?**
   - Buscar en: `routes/`, `controllers/`, etc.

5. **¿Hay otros endpoints de OLT funcionando?**
   - Por ejemplo: GET `/api/olts/summary`
   - GET `/api/olts/:oltId/pending-onus`

---

## 🔗 Referencias

- Documentación completa del endpoint: `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md`
- Implementación frontend: `src/pantallas/controles/OLTs/ONUDetailsScreen.tsx` (líneas 366-469)
- API client: `src/pantallas/controles/OLTs/services/api.ts` (líneas 147-161)
