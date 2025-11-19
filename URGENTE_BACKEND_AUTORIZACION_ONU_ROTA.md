# 🚨 URGENTE - Autorización de ONU Dejó de Funcionar

## Problema

**El endpoint de autorización de ONU ESTABA FUNCIONANDO pero ahora devuelve "Network request failed"**

---

## Error Actual

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

## Endpoint Afectado

```
POST https://wellnet-rd.com:444/api/olts/realtime/:oltId/onus/:serial/authorize
```

**Ejemplo real**:
```
POST https://wellnet-rd.com:444/api/olts/realtime/1/onus/48575443439B989D/authorize
```

---

## Diagnóstico Requerido

### 1. **Verificar si el Backend Está Corriendo**

```bash
pm2 status
# o
ps aux | grep node

# Verificar puerto 444
netstat -tlnp | grep 444
```

**Si no está corriendo**: Reiniciar el backend
```bash
pm2 restart wellnet-backend
# o el nombre del proceso
```

### 2. **Revisar Logs Inmediatamente**

```bash
# Logs de PM2
pm2 logs --lines 200

# Logs del sistema
journalctl -u wellnet-backend -n 100 --no-pager

# O donde estén los logs
tail -f /var/log/wellnet/*.log
```

**Buscar**:
- Errores de Python
- Errores de SSH/Telnet
- Errores de base de datos
- Excepciones no manejadas
- Stack traces

### 3. **Probar el Endpoint Manualmente**

```bash
# Reemplazar YOUR_TOKEN con un token válido
curl -k -v -X POST https://wellnet-rd.com:444/api/olts/realtime/1/onus/48575443439B989D/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

### 4. **Verificar Script Python de Autorización**

El script Python puede estar:
- Colgado (hung)
- Con timeout
- Con error de sintaxis
- Con error de conexión SSH a la OLT
- Con error de parseo

**Revisar**:
```bash
# Encontrar el script
find /opt -name "*authorize*" -type f 2>/dev/null
find /var/www -name "*authorize*" -type f 2>/dev/null
find ~ -name "*authorize*" -type f 2>/dev/null

# Probar el script manualmente
python3 /ruta/al/script/authorize_onu.py \
  --olt-id 1 \
  --serial 48575443439B989D \
  --puerto "0/1/0" \
  --ont-id 0 \
  --vlan 100 \
  --speed-down 50 \
  --speed-up 50
```

---

## Causas Probables (en orden de probabilidad)

### ⚠️ 1. **Script Python Colgado o con Timeout**

**Síntomas**:
- El endpoint NO responde (timeout)
- Backend se queda esperando respuesta del script
- Frontend recibe "Network request failed" después de mucho tiempo

**Solución**:
- Agregar timeout al script Python (máximo 30 segundos)
- Revisar conexión SSH a la OLT
- Verificar que la OLT esté respondiendo

**Verificar**:
```bash
# Ver si hay procesos Python colgados
ps aux | grep python | grep authorize

# Matar procesos colgados si los hay
pkill -f authorize_onu.py
```

### ⚠️ 2. **Conexión SSH a la OLT Fallando**

**Síntomas**:
- Timeout al conectar a la OLT
- Credenciales SSH incorrectas
- OLT no responde en el puerto SSH

**Solución**:
- Probar conexión SSH manualmente:
```bash
ssh admin@IP_DE_LA_OLT
# Verificar que funcione
```

- Revisar credenciales en la base de datos o config:
```sql
SELECT ip_address, ssh_port, ssh_username FROM olts WHERE id = 1;
```

### ⚠️ 3. **Error en el Script Python (Cambio Reciente)**

**Síntomas**:
- Exception en Python
- Sintaxis incorrecta
- Imports faltantes

**Solución**:
- Revisar último commit/cambio en el script
- Ver logs de Python para exception traces
- Ejecutar el script manualmente para ver el error

### ⚠️ 4. **Base de Datos Bloqueada o Lenta**

**Síntomas**:
- Query de base de datos muy lenta
- Timeout en queries
- Deadlock

**Solución**:
```bash
# Revisar conexiones activas (PostgreSQL)
psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Ver queries lentas
psql -U postgres -c "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC;"

# Matar query colgada si es necesaria
psql -U postgres -c "SELECT pg_terminate_backend(PID_AQUI);"
```

### ⚠️ 5. **Backend con Excepción No Manejada**

**Síntomas**:
- Backend crasheó
- PM2 muestra restart reciente
- Error 500 o crash total

**Solución**:
```bash
# Ver estado PM2
pm2 status

# Ver logs de errores
pm2 logs wellnet-backend --err --lines 100

# Reiniciar si es necesario
pm2 restart wellnet-backend
```

---

## Checklist de Acciones (Ejecutar en Orden)

**PASO 1**: Verificar estado del backend
```bash
pm2 status
netstat -tlnp | grep 444
```
- [ ] Backend corriendo: Sí / No
- [ ] Puerto 444 escuchando: Sí / No

**PASO 2**: Revisar logs
```bash
pm2 logs --lines 100
```
- [ ] ¿Hay errores visibles?: Sí / No
- [ ] ¿Qué error específico hay?: _____________

**PASO 3**: Probar endpoint con curl
```bash
# Usar el comando curl de arriba
```
- [ ] ¿Responde el endpoint?: Sí / No
- [ ] ¿Qué código HTTP devuelve?: _____________
- [ ] ¿Qué mensaje devuelve?: _____________

**PASO 4**: Revisar procesos Python
```bash
ps aux | grep python
```
- [ ] ¿Hay procesos colgados?: Sí / No
- [ ] ¿Cuántos procesos authorize_onu?: _____________

**PASO 5**: Probar script Python manualmente
```bash
# Ejecutar script manualmente
```
- [ ] ¿El script funciona manualmente?: Sí / No
- [ ] ¿Qué error da si falla?: _____________

**PASO 6**: Probar conexión SSH a OLT
```bash
ssh admin@IP_OLT
```
- [ ] ¿SSH funciona?: Sí / No
- [ ] ¿Qué error da si falla?: _____________

---

## Soluciones Rápidas (Quick Fixes)

### Si el backend está caído:
```bash
pm2 restart wellnet-backend
pm2 logs --lines 50
```

### Si hay procesos Python colgados:
```bash
pkill -f authorize_onu.py
pm2 restart wellnet-backend
```

### Si la OLT no responde SSH:
```bash
# Verificar IP y puerto
ping IP_DE_LA_OLT
telnet IP_DE_LA_OLT 22

# Reiniciar servicio SSH en la OLT (si tienes acceso físico/web)
# O contactar al administrador de red
```

### Si es problema de timeout:
Modificar el timeout en el código del backend:

```javascript
// En el handler del endpoint
const timeout = setTimeout(() => {
  return res.status(504).json({
    success: false,
    error: 'Timeout al autorizar ONU',
    details: 'La operación tardó más de 30 segundos'
  });
}, 30000);

try {
  // Ejecutar script Python
  const result = await executeAuthorizationScript(...);
  clearTimeout(timeout);
  res.json(result);
} catch (error) {
  clearTimeout(timeout);
  // Manejo de errores
}
```

---

## Información del Payload Enviado

El frontend está enviando los datos correctamente:

| Campo | Valor | Validación |
|-------|-------|-----------|
| Serial | `48575443439B989D` | ✅ Formato válido (Huawei) |
| Puerto | `0/1/0` | ✅ Formato correcto |
| Board | `1` | ✅ |
| Port | `0` | ✅ |
| ONT ID | `0` | ✅ |
| VLAN | `100` | ✅ |
| Velocidad | `50M/50M` | ✅ |
| Zona | `281` | ✅ |
| ONU Type | `HG8245H` | ✅ (Huawei) |

**El payload es válido**. El problema está 100% en el backend.

---

## Siguiente Paso

1. **Ejecutar el checklist de arriba**
2. **Reportar los resultados** de cada paso
3. **Compartir los logs** si hay errores
4. **Indicar qué solución rápida se aplicó** (si alguna funcionó)

---

## Contacto

Si necesitas ayuda adicional, proporciona:
- ✅ Output de `pm2 status`
- ✅ Últimas 100 líneas de logs (`pm2 logs --lines 100`)
- ✅ Resultado del curl test
- ✅ Output de `ps aux | grep python`
