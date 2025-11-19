# 🔴 URGENTE: Script Python Fallando - Error INTERNAL_ERROR

**Fecha:** 2025-11-17
**Prioridad:** CRÍTICA
**Error Actual:** `INTERNAL_ERROR` - Script Python fallando durante ejecución

---

## 📨 Para: Claude del Backend

Hola, necesito tu ayuda urgente. El script de autorización de ONU está fallando durante la ejecución.

---

## 🚨 Error Actual

```json
{
  "code": "INTERNAL_ERROR",
  "error": "Command failed: python3 \"/home/wdperezh01/backend/scripts/autorizar_onu_tr069.py\" --olt-type huawei --puerto \"0/1/0\" --board 1 --port 0 --ont-id 0 --serial \"48575443439B989D\" --onu-type \"HG8245H\" --onu-mode \"Routing\" --pon-type \"GPON\" --gpon-channel \"GPON\" --vlan-id 100 --download-speed \"1M\" --upload-speed \"1M\" --download-mbps 1 --upload-mbps 1 --zona \"281\" --name \"Prueba 1\" --line-profile \"1M\" --service-profile \"INTERNET\"\n",
  "message": "Error interno autorizando ONU"
}
```

**Cambio importante:** El error cambió de `PARSE_ERROR` (output truncado) a `INTERNAL_ERROR` (script fallando).

---

## ✅ Lo Que Está Funcionando

1. ✅ **Frontend**: Payload completo y correcto
2. ✅ **Backend Controller**: Construyendo comando correctamente
3. ✅ **Parámetros**: Todos los valores son correctos:
   - `--board 1` ✅
   - `--port 0` ✅
   - `--serial "48575443439B989D"` ✅
   - `--vlan-id 100` ✅
   - `--zona "281"` ✅ (sin prefijo)
   - `--download-speed "1M"` ✅
   - `--download-mbps 1` ✅

---

## ❌ El Problema

El script Python **está fallando internamente** durante la ejecución. Posibles causas:

1. 🐍 **Error de Python**: Sintaxis, imports, o excepción no manejada
2. 📦 **Dependencias faltantes**: netmiko, paramiko
3. 🔌 **Conexión OLT**: Credenciales, timeout, firewall
4. 🔑 **Permisos**: Script sin permisos de ejecución
5. 📊 **Perfil inexistente**: Line profile "1M" no existe en la OLT
6. 🔍 **ONU no encontrada**: Serial no está en estado pending

---

## 🔍 PASO 1: Ejecutar Comando Manualmente (CRÍTICO)

**Por favor ejecuta esto en el servidor backend:**

```bash
cd /home/wdperezh01/backend

python3 scripts/autorizar_onu_tr069.py \
  --olt-type huawei \
  --puerto "0/1/0" \
  --board 1 \
  --port 0 \
  --ont-id 0 \
  --serial "48575443439B989D" \
  --onu-type "HG8245H" \
  --onu-mode "Routing" \
  --pon-type "GPON" \
  --gpon-channel "GPON" \
  --vlan-id 100 \
  --download-speed "1M" \
  --upload-speed "1M" \
  --download-mbps 1 \
  --upload-mbps 1 \
  --zona "281" \
  --name "Prueba 1" \
  --line-profile "1M" \
  --service-profile "INTERNET" 2>&1 | tee /tmp/onu_test.log

# Ver el log completo
cat /tmp/onu_test.log
```

**Esto te mostrará:**
- ✅ El traceback completo de Python si hay error
- ✅ La salida del script si funciona
- ✅ Mensajes de error específicos de la OLT
- ✅ Problemas de conexión, credenciales, etc.

**⚠️ IMPORTANTE:** Copia y pégame la salida completa para poder ayudarte.

---

## 🔍 PASO 2: Verificaciones Básicas

### 2.1. Verificar que el script existe y tiene permisos

```bash
ls -la /home/wdperezh01/backend/scripts/autorizar_onu_tr069.py

# Si existe pero sin permisos:
chmod +x /home/wdperezh01/backend/scripts/autorizar_onu_tr069.py
```

### 2.2. Verificar dependencias de Python

```bash
# Verificar netmiko
python3 -c "import netmiko; print('netmiko:', netmiko.__version__)"

# Si falla, instalar:
pip3 install netmiko paramiko
```

### 2.3. Verificar sintaxis del script

```bash
python3 -m py_compile scripts/autorizar_onu_tr069.py
# Si hay errores de sintaxis, los mostrará aquí
```

### 2.4. Probar ayuda del script

```bash
python3 scripts/autorizar_onu_tr069.py --help
# Debería mostrar la ayuda con todos los parámetros
```

---

## 🔍 PASO 3: Capturar STDERR en el Controller

**Actualiza el controller para ver el error completo:**

```javascript
// controllers/oltRealtimeController.js

try {
    const { stdout, stderr } = await execPromise(fullCommand, {
        timeout: 120000,          // 2 minutos
        maxBuffer: 1024 * 1024 * 50  // 50 MB
    });

    console.log('📤 [ONU Auth] STDOUT:', stdout);
    console.error('📤 [ONU Auth] STDERR:', stderr);  // ← VER ESTO

    if (stderr && stderr.trim() && !stderr.includes('Warning')) {
        // El stderr puede contener el traceback de Python
        console.error('❌ [ONU Auth] Script error:', stderr);

        return res.status(500).json({
            success: false,
            error: 'Script de autorización falló',
            message: stderr.substring(0, 500),
            code: 'SCRIPT_ERROR',
            debug: {
                stdout: stdout.substring(0, 500),
                stderr: stderr
            }
        });
    }

    // ... resto del código
} catch (error) {
    console.error('❌ [ONU Auth] Execution error:', error);
    console.error('❌ [ONU Auth] Error message:', error.message);
    console.error('❌ [ONU Auth] Error stdout:', error.stdout);
    console.error('❌ [ONU Auth] Error stderr:', error.stderr);  // ← CLAVE

    // ... resto del manejo de errores
}
```

Esto te mostrará en los logs **por qué el script está fallando**.

---

## 🐛 Problemas Comunes y Soluciones Rápidas

### Error: "ModuleNotFoundError: No module named 'netmiko'"

```bash
pip3 install netmiko paramiko
```

### Error: "Permission denied"

```bash
chmod +x scripts/autorizar_onu_tr069.py
```

### Error: "Line profile '1M' not found"

**Causa:** El perfil de velocidad no existe en la OLT.

**Solución temporal:** Cambiar a una velocidad que SÍ exista:
- Probar con `"10M"`, `"20M"`, `"50M"`, `"100M"`
- O crear el perfil "1M" en la OLT primero

### Error: "ONU not found" o "Serial no existe"

**Causa:** La ONU ya fue autorizada o no está en estado pending.

**Verificar en la OLT:**
```bash
ssh wellnet@10.200.200.2
enable
config
display ont autofind all
```

### Error: "Connection timeout" o "Authentication failed"

**Verificar:**
1. ¿La OLT está encendida? `ping 10.200.200.2`
2. ¿Las credenciales son correctas? Verificar en la BD
3. ¿El puerto es 23 (telnet) o 22 (ssh)?

---

## 📚 Documentos de Referencia

Ya tienes estos documentos creados con información completa:

1. **`PROMPT_BACKEND_DEBUG_SCRIPT_PYTHON.md`** ← Guía completa de debugging
2. **`PROMPT_BACKEND_FIX_TIMEOUT_Y_PARSEO.md`** ← Fixes de timeout (aplicar después)
3. **`PROMPT_BACKEND_FIX_AUTORIZACION_ONU_SCRIPT.md`** ← Especificación completa
4. **`ENDPOINTS_CATALOGOS_AUTORIZACION_ONU.md`** ← API de catálogos
5. **`PROMPT_BACKEND_AUTORIZACION_ONU_TR069.md`** ← Endpoint de autorización

---

## 🎯 Próximos Pasos

1. **AHORA:** Ejecutar el comando manual (PASO 1) y compartir la salida
2. **Después:** Según el error, aplicar la solución correspondiente
3. **Finalmente:** Aplicar los fixes de timeout del documento anterior

---

## 📤 Payload Actual del Frontend (Para Referencia)

```json
{
  "board": 1,
  "download_mbps": 1,
  "download_speed": "1M",
  "gpon_channel": "GPON",
  "name": "Prueba 1",
  "ont_id": 0,
  "onu_external_id": "48575443439B989D",
  "onu_mode": "Routing",
  "onu_type": "HG8245H",
  "pon_type": "GPON",
  "port": 0,
  "puerto": "0/1/0",
  "sn": "48575443439B989D",
  "upload_mbps": 1,
  "upload_speed": "1M",
  "use_gps": false,
  "user_vlan_id": 100,
  "zona": "281"
}
```

**✅ El payload está perfecto** - no hay problemas en el frontend.

---

## ⚡ ¿Qué Necesito de Ti?

**Por favor ejecuta el PASO 1** (comando manual) y comparte:

1. ✅ La salida completa del comando
2. ✅ Cualquier mensaje de error
3. ✅ El contenido de `/tmp/onu_test.log`

Con eso podré identificar exactamente qué está fallando y darte la solución específica. 🚀

---

**Gracias por tu ayuda!** 🙏
