# 🔍 DEBUG: Script Python Autorización ONU Fallando

**Fecha:** 2025-11-17
**Script:** `autorizar_onu_tr069.py`
**Estado:** ✅ Parámetros correctos, ❌ Script falla durante ejecución

---

## 📊 Situación Actual

### ✅ Lo Que Funciona

1. **Payload del frontend**: Correcto y completo
2. **Parámetros del comando**: Todos correctos (`--board 1` ✅)
3. **Controller**: Construyendo comando correctamente

### ❌ El Problema

El script Python falla con:
```
Command failed: python3 "/home/wdperezh01/backend/scripts/autorizar_onu_tr069.py"
--olt-type huawei
--puerto "0/1/0"
--board 1
--port 0
--ont-id 0
--serial "485754437F6C089D"
--onu-type "HG8545M"
--onu-mode "Routing"
--pon-type "GPON"
--gpon-channel "GPON"
--vlan-id 100
--download-speed "1M"
--upload-speed "1M"
--download-mbps 1
--upload-mbps 1
--zona "281"
--name "Prueba"
--line-profile "1M"
--service-profile "INTERNET"
```

---

## 🔍 Pasos de Debugging

### 1. Verificar Salida del Script

Primero, ejecuta el comando manualmente para ver el error completo:

```bash
cd /home/wdperezh01/backend

python3 scripts/autorizar_onu_tr069.py \
  --olt-type huawei \
  --puerto "0/1/0" \
  --board 1 \
  --port 0 \
  --ont-id 0 \
  --serial "485754437F6C089D" \
  --onu-type "HG8545M" \
  --onu-mode "Routing" \
  --pon-type "GPON" \
  --gpon-channel "GPON" \
  --vlan-id 100 \
  --download-speed "1M" \
  --upload-speed "1M" \
  --download-mbps 1 \
  --upload-mbps 1 \
  --zona "281" \
  --name "Prueba" \
  --line-profile "1M" \
  --service-profile "INTERNET"
```

Esto te mostrará el traceback completo de Python con el error exacto.

### 2. Verificar Permisos del Script

```bash
# Ver permisos
ls -la scripts/autorizar_onu_tr069.py

# Si no es ejecutable, darle permisos
chmod +x scripts/autorizar_onu_tr069.py

# Verificar propietario
chown wdperezh01:wdperezh01 scripts/autorizar_onu_tr069.py
```

### 3. Verificar Sintaxis del Script

```bash
# Verificar que no tenga errores de sintaxis
python3 -m py_compile scripts/autorizar_onu_tr069.py

# Si hay errores, los mostrará aquí
```

### 4. Verificar Dependencias

```bash
# Verificar que netmiko esté instalado
python3 -c "import netmiko; print(netmiko.__version__)"

# Si falta, instalar
pip3 install netmiko paramiko

# Verificar otras dependencias
python3 -c "import paramiko, json, sys, argparse; print('OK')"
```

### 5. Probar con Argumentos Mínimos

```bash
# Probar solo con --help
python3 scripts/autorizar_onu_tr069.py --help

# Debería mostrar la ayuda del script
```

### 6. Verificar Conexión a la OLT

```bash
# Ver si la OLT está accesible
ping -c 3 10.200.200.2

# Intentar SSH manual
ssh wellnet@10.200.200.2

# Si pide contraseña, verificar credenciales en la BD
```

---

## 🐛 Problemas Comunes y Soluciones

### Error 1: "ModuleNotFoundError: No module named 'netmiko'"

**Solución:**
```bash
pip3 install netmiko paramiko
```

### Error 2: "Permission denied"

**Solución:**
```bash
chmod +x scripts/autorizar_onu_tr069.py
chown wdperezh01:wdperezh01 scripts/autorizar_onu_tr069.py
```

### Error 3: "SyntaxError" o errores de Python

**Solución:** Revisar el código del script, probablemente hay errores de sintaxis.

### Error 4: "Timeout" o "Connection refused"

**Causas posibles:**
- OLT apagada o inaccesible
- Credenciales incorrectas
- Firewall bloqueando SSH
- Puerto SSH incorrecto

**Solución:**
```bash
# Verificar conexión
telnet 10.200.200.2 23

# Verificar credenciales en BD
mysql -u root -p
USE isp_management;
SELECT ip_olt, olt_username, olt_password FROM olts WHERE id = 1;
```

### Error 5: "ONU not found" o "Serial no existe"

**Causa:** La ONU ya fue autorizada o no está en estado pending.

**Solución:** Verificar en la OLT:
```bash
ssh wellnet@10.200.200.2
enable
config
display ont autofind all
```

### Error 6: "Line profile not found"

**Causa:** El perfil de velocidad "1M" no existe en la OLT.

**Solución:**
1. Usar una velocidad válida como "10M", "100M"
2. O crear el perfil en la OLT primero

---

## 📝 Capturar Logs Detallados

Modifica temporalmente el script para agregar más logging:

```python
# En autorizar_onu_tr069.py, al inicio
import sys
import traceback

try:
    # ... código del script ...

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": str(e),
        "traceback": traceback.format_exc(),
        "args": sys.argv
    }), file=sys.stderr)
    sys.exit(1)
```

Y en el controller, captura stderr:

```javascript
// oltRealtimeController.js
const { stdout, stderr } = await execPromise(fullCommand, {
    timeout: 30000,
    maxBuffer: 1024 * 1024 * 10
});

console.log('📤 [ONU Auth] STDOUT:', stdout);
console.error('📤 [ONU Auth] STDERR:', stderr);  // ← Ver errores detallados
```

---

## 🧪 Script de Prueba Simplificado

Crea un script de prueba mínimo para validar la conexión:

```python
#!/usr/bin/env python3
# test_olt_connection.py

from netmiko import ConnectHandler
import json

device = {
    'device_type': 'huawei',
    'ip': '10.200.200.2',
    'username': 'wellnet',
    'password': 'TU_PASSWORD_AQUI',  # Obtener de BD
    'port': 23,
    'timeout': 10,
}

try:
    print("Conectando a OLT...")
    connection = ConnectHandler(**device)

    print("Conectado! Ejecutando comando...")
    output = connection.send_command('display version')

    print(json.dumps({
        "success": True,
        "message": "Conexión exitosa",
        "output": output[:200]  # Primeros 200 chars
    }))

    connection.disconnect()

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": str(e),
        "type": type(e).__name__
    }))
```

Ejecutar:
```bash
python3 test_olt_connection.py
```

---

## 🎯 Checklist de Verificación

- [ ] Script tiene permisos de ejecución
- [ ] Script no tiene errores de sintaxis
- [ ] Dependencias de Python instaladas (netmiko)
- [ ] OLT accesible por ping
- [ ] SSH funciona manualmente
- [ ] Credenciales correctas
- [ ] ONU realmente existe en estado pending
- [ ] Perfil de velocidad existe en la OLT

---

## 📞 Siguiente Paso

**Ejecuta el comando manual** (paso 1) y pégame la salida completa de error. Con eso podré ayudarte a resolver el problema específico.

```bash
python3 scripts/autorizar_onu_tr069.py \
  --olt-type huawei \
  --puerto "0/1/0" \
  --board 1 \
  --port 0 \
  --ont-id 0 \
  --serial "485754437F6C089D" \
  --onu-type "HG8545M" \
  --onu-mode "Routing" \
  --pon-type "GPON" \
  --gpon-channel "GPON" \
  --vlan-id 100 \
  --download-speed "100M" \
  --upload-speed "100M" \
  --download-mbps 100 \
  --upload-mbps 100 \
  --zona "281" \
  --name "Prueba" \
  --line-profile "100M" \
  --service-profile "INTERNET" 2>&1 | tee /tmp/onu_test.log

# Ver el log
cat /tmp/onu_test.log
```

Comparte la salida y podré identificar el problema exacto. 🔍
