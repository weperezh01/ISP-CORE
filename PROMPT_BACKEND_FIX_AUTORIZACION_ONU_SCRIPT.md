# 🔴 URGENTE: Fix Script de Autorización de ONUs TR-069

**Fecha:** 2025-11-17
**Prioridad:** CRÍTICA
**Impacto:** El formulario de autorización de ONUs no funciona

---

## 🚨 Problema Actual

El endpoint `POST /api/olts/realtime/:oltId/onus/:serial/authorize` está fallando con este error:

```
Command failed: python3 "/home/wdperezh01/backend/scripts/autorizar_onu.py" huawei "0/1/0" 0 "485754437F6C089D" "1M" "INTERNET" "Prueba "
```

### ❌ Problemas Identificados

1. **Script Legacy**: El backend está usando `autorizar_onu.py` con una interfaz muy limitada
2. **Parámetros Insuficientes**: Solo pasa 7 parámetros básicos
3. **Datos Ignorados**: El frontend envía 20+ campos importantes que se están ignorando
4. **Hardcoded**: El perfil de servicio "INTERNET" parece estar hardcodeado

---

## 📤 Payload del Frontend (Datos Enviados)

El frontend React Native está enviando este payload completo:

```json
{
  "board": 1,
  "download_mbps": 1,
  "download_speed": "1M",
  "gpon_channel": "GPON",
  "name": "Prueba ",
  "ont_id": 0,
  "onu_external_id": "485754437F6C089D",
  "onu_mode": "Routing",
  "onu_type": "HG8545M",          // ← IMPORTANTE
  "pon_type": "GPON",
  "port": 0,
  "puerto": "0/1/0",
  "sn": "485754437F6C089D",
  "upload_mbps": 1,
  "upload_speed": "1M",
  "use_gps": false,
  "user_vlan_id": 100,            // ← IMPORTANTE
  "zona": "281"                   // ← IMPORTANTE
}
```

### 📊 Campos Críticos Que Se Están Ignorando

| Campo | Valor | ¿Se está usando? | Impacto |
|-------|-------|------------------|---------|
| `user_vlan_id` | 100 | ❌ NO | La ONU se autoriza sin VLAN correcta |
| `onu_type` | "HG8545M" | ❌ NO | No se configura el tipo correcto |
| `onu_mode` | "Routing" | ❌ NO | Modo no configurado |
| `zona` | "281" | ❌ NO | Zona geográfica perdida |
| `download_mbps` | 1 | ❌ NO | Solo se usa string "1M" |
| `upload_mbps` | 1 | ❌ NO | Solo se usa string "1M" |
| `board` | 1 | ❌ NO | Se construye mal el puerto |
| `port` | 0 | ❌ NO | Se construye mal el puerto |

---

## 🔍 Comando Actual del Script

```bash
python3 "/home/wdperezh01/backend/scripts/autorizar_onu.py" \
  huawei \           # Marca del OLT (OK)
  "0/1/0" \          # Puerto (OK)
  0 \                # ONT ID (OK)
  "485754437F6C089D" \  # Serial (OK)
  "1M" \             # Velocidad (OK pero incompleto)
  "INTERNET" \       # ⚠️ HARDCODEADO
  "Prueba "          # Nombre (OK)
```

### ❌ Lo Que Falta

```bash
# Debería ser algo como:
python3 "/home/wdperezh01/backend/scripts/autorizar_onu_tr069.py" \
  --olt-type "huawei" \
  --puerto "0/1/0" \
  --board 1 \
  --port 0 \
  --ont-id 0 \
  --serial "485754437F6C089D" \
  --onu-type "HG8545M" \              # ← FALTA
  --onu-mode "Routing" \              # ← FALTA
  --vlan-id 100 \                     # ← FALTA
  --download-speed "1M" \
  --upload-speed "1M" \
  --download-mbps 1 \                 # ← FALTA
  --upload-mbps 1 \                   # ← FALTA
  --zona 281 \                        # ← FALTA
  --name "Prueba" \
  --pon-type "GPON" \                 # ← FALTA
  --gpon-channel "GPON"               # ← FALTA
```

---

## ✅ Solución Requerida

### Opción 1: Actualizar Script Python (RECOMENDADO)

Crear un nuevo script `autorizar_onu_tr069.py` que acepte todos los parámetros:

```python
#!/usr/bin/env python3
import argparse
import json

parser = argparse.ArgumentParser(description='Autorizar ONU con TR-069')

# Parámetros básicos
parser.add_argument('--olt-type', required=True, help='Tipo de OLT: huawei, zte')
parser.add_argument('--puerto', required=True, help='Puerto PON: 0/1/0')
parser.add_argument('--board', type=int, required=True, help='Board/Frame')
parser.add_argument('--port', type=int, required=True, help='Port/Slot')
parser.add_argument('--ont-id', type=int, required=True, help='ONT ID')
parser.add_argument('--serial', required=True, help='Serial Number')

# Configuración ONU
parser.add_argument('--onu-type', required=True, help='Tipo de ONU: HG8545M, F660, etc.')
parser.add_argument('--onu-mode', required=True, choices=['Routing', 'Bridging'])

# Configuración de Red
parser.add_argument('--vlan-id', type=int, required=True, help='VLAN ID')
parser.add_argument('--download-speed', required=True, help='Velocidad bajada: 100M, 1G')
parser.add_argument('--upload-speed', required=True, help='Velocidad subida: 50M, 1G')
parser.add_argument('--download-mbps', type=int, required=True, help='Velocidad bajada en Mbps')
parser.add_argument('--upload-mbps', type=int, required=True, help='Velocidad subida en Mbps')

# Ubicación
parser.add_argument('--zona', required=True, help='ID de zona geográfica')
parser.add_argument('--name', required=True, help='Nombre descriptivo')

# Configuración PON
parser.add_argument('--pon-type', required=True, help='Tipo PON: GPON, EPON')
parser.add_argument('--gpon-channel', required=True, help='Canal GPON')

# Opcionales
parser.add_argument('--odb-splitter', help='Código del ODB Splitter')
parser.add_argument('--odb-port', help='Puerto del ODB')
parser.add_argument('--address-comment', help='Dirección/comentario')
parser.add_argument('--gps-latitude', type=float, help='Latitud GPS')
parser.add_argument('--gps-longitude', type=float, help='Longitud GPS')

args = parser.parse_args()

# Aquí va la lógica de autorización usando TODOS los parámetros
# ...
```

### Opción 2: Usar Netmiko Directamente en Node.js

En lugar de llamar a Python, hacer la autorización directamente desde Node.js usando SSH:

```javascript
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function autorizarOnuHuawei(payload) {
    const commands = [
        `interface gpon ${payload.puerto}`,
        `ont add ${payload.ont_id} sn-auth ${payload.sn} omci ont-lineprofile-id ${payload.onu_type} ont-srvprofile-id ${payload.service_profile}`,
        `ont port native-vlan ${payload.ont_id} eth 1 vlan ${payload.user_vlan_id} priority 0`,
        `service-port vlan ${payload.user_vlan_id} gpon ${payload.puerto} ont ${payload.ont_id} gemport 1 multi-service user-vlan ${payload.user_vlan_id}`,
        `quit`
    ];

    // Ejecutar comandos SSH usando netmiko o similar
    // ...
}
```

---

## 🎯 Especificación del Endpoint

El endpoint debe procesar TODOS estos campos del payload:

### Campos Obligatorios

```typescript
{
  // Identificación
  puerto: string;           // "0/1/0"
  board: number;            // 1
  port: number;             // 0
  ont_id: number;           // 0 (auto-asignar si es 0)
  sn: string;               // "485754437F6C089D"

  // Tipo de ONU
  onu_type: string;         // "HG8545M"
  onu_mode: string;         // "Routing" | "Bridging"

  // Configuración PON
  pon_type: string;         // "GPON"
  gpon_channel: string;     // "GPON"

  // Red
  user_vlan_id: number;     // 100
  download_speed: string;   // "1M"
  upload_speed: string;     // "1M"
  download_mbps: number;    // 1
  upload_mbps: number;      // 1

  // Ubicación
  zona: string;             // "281"
  name: string;             // "Prueba"
}
```

### Campos Opcionales

```typescript
{
  odb_splitter?: string;       // "ODB-15"
  odb_port?: string;           // "5"
  address_comment?: string;    // "Casa esquina..."
  gps_latitude?: number;       // 18.4861
  gps_longitude?: number;      // -69.9312
  use_gps: boolean;            // false

  // Legacy (para compatibilidad)
  onu_external_id: string;     // Mismo que sn
}
```

---

## 📝 Ejemplo de Implementación Node.js

```javascript
// routes/oltRoutes.js o controllers/onuController.js

async function authorizeOnu(req, res) {
    try {
        const { oltId, serial } = req.params;
        const payload = req.body;

        // Validar campos requeridos
        const requiredFields = [
            'puerto', 'board', 'port', 'ont_id', 'onu_type', 'onu_mode',
            'user_vlan_id', 'download_speed', 'upload_speed',
            'zona', 'name', 'pon_type'
        ];

        for (const field of requiredFields) {
            if (!payload[field] && payload[field] !== 0) {
                return res.status(400).json({
                    success: false,
                    error: `Campo requerido faltante: ${field}`,
                    code: 'MISSING_FIELD'
                });
            }
        }

        // Obtener info del OLT
        const olt = await db.query('SELECT * FROM olts WHERE id = ?', [oltId]);
        if (!olt.length) {
            return res.status(404).json({
                success: false,
                error: 'OLT no encontrado',
                code: 'OLT_NOT_FOUND'
            });
        }

        const oltType = olt[0].olt_type.toLowerCase(); // 'huawei' o 'zte'

        // Construir comando con TODOS los parámetros
        const scriptPath = '/home/wdperezh01/backend/scripts/autorizar_onu_tr069.py';
        const command = [
            'python3',
            scriptPath,
            '--olt-type', oltType,
            '--puerto', payload.puerto,
            '--board', payload.board,
            '--port', payload.port,
            '--ont-id', payload.ont_id,
            '--serial', serial,
            '--onu-type', payload.onu_type,
            '--onu-mode', payload.onu_mode,
            '--vlan-id', payload.user_vlan_id,
            '--download-speed', payload.download_speed,
            '--upload-speed', payload.upload_speed,
            '--download-mbps', payload.download_mbps,
            '--upload-mbps', payload.upload_mbps,
            '--zona', payload.zona,
            '--name', payload.name,
            '--pon-type', payload.pon_type,
            '--gpon-channel', payload.gpon_channel
        ];

        // Agregar parámetros opcionales si existen
        if (payload.odb_splitter) {
            command.push('--odb-splitter', payload.odb_splitter);
        }
        if (payload.odb_port) {
            command.push('--odb-port', payload.odb_port);
        }
        if (payload.address_comment) {
            command.push('--address-comment', payload.address_comment);
        }
        if (payload.gps_latitude) {
            command.push('--gps-latitude', payload.gps_latitude);
        }
        if (payload.gps_longitude) {
            command.push('--gps-longitude', payload.gps_longitude);
        }

        // Ejecutar comando
        const { stdout, stderr } = await execPromise(command.join(' '));

        if (stderr && !stderr.includes('Warning')) {
            throw new Error(stderr);
        }

        // Guardar en BD
        await db.query(`
            INSERT INTO onus_autorizadas
            (olt_id, serial, puerto, ont_id, onu_type, vlan_id, zona_id, nombre, velocidad_bajada, velocidad_subida)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            oltId,
            serial,
            payload.puerto,
            payload.ont_id,
            payload.onu_type,
            payload.user_vlan_id,
            payload.zona,
            payload.name,
            payload.download_mbps,
            payload.upload_mbps
        ]);

        res.json({
            success: true,
            message: 'ONU autorizada correctamente',
            data: {
                serial: serial,
                puerto: payload.puerto,
                ont_id: payload.ont_id,
                output: stdout
            }
        });

    } catch (error) {
        console.error('Error autorizando ONU:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno autorizando ONU',
            message: error.message,
            code: 'INTERNAL_ERROR',
            debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
```

---

## 🧪 Testing

### Request de Prueba

```bash
curl -k -X POST \
  "https://localhost:444/api/olts/realtime/1/onus/485754437F6C089D/authorize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "puerto": "0/1/0",
    "board": 1,
    "port": 0,
    "ont_id": 0,
    "sn": "485754437F6C089D",
    "onu_type": "HG8545M",
    "onu_mode": "Routing",
    "pon_type": "GPON",
    "gpon_channel": "GPON",
    "user_vlan_id": 100,
    "download_speed": "100M",
    "upload_speed": "100M",
    "download_mbps": 100,
    "upload_mbps": 100,
    "zona": "281",
    "name": "Cliente Prueba - 100M",
    "onu_external_id": "485754437F6C089D"
  }'
```

### Response Esperado

```json
{
  "success": true,
  "message": "ONU autorizada correctamente",
  "data": {
    "serial": "485754437F6C089D",
    "puerto": "0/1/0",
    "ont_id": 1,
    "output": "Configuración aplicada exitosamente..."
  }
}
```

---

## 🚨 Prioridad

**CRÍTICA** - El formulario de autorización de ONUs está completamente bloqueado hasta que se resuelva esto.

El frontend está listo y funcional. Solo falta que el backend procese correctamente todos los campos que se están enviando.

---

## 📚 Referencias

- **Documentación del Payload:** `PROMPT_BACKEND_AUTORIZACION_ONU_TR069.md`
- **Catálogos de Datos:** `ENDPOINTS_CATALOGOS_AUTORIZACION_ONU.md`
- **Archivo Frontend:** `src/pantallas/controles/OLTs/ONUDetailsScreen.tsx:565`

---

**¿Necesitas ayuda con la implementación?** Avísame y puedo ayudarte a crear el script Python actualizado o la implementación en Node.js. 🚀
