# 🔴 URGENTE: Fix Parámetro Board en Autorización ONU

**Fecha:** 2025-11-17
**Prioridad:** ALTA
**Estado:** Script implementado correctamente, pero parámetro `board` incorrecto

---

## 🚨 Problema Detectado

El endpoint está pasando `--board 0` al script Python cuando el payload del frontend envía `"board": 1`.

### 📤 Payload del Frontend (Correcto)

```json
{
  "board": 1,        // ✅ CORRECTO
  "port": 0,         // ✅ CORRECTO
  "puerto": "0/1/0"  // ✅ CORRECTO
}
```

### ❌ Comando Ejecutado (Incorrecto)

```bash
python3 "/home/wdperezh01/backend/scripts/autorizar_onu_tr069.py" \
  --olt-type huawei \
  --puerto "0/1/0" \
  --board 0 \         # ❌ DEBERÍA SER: --board 1
  --port 0 \          # ✅ CORRECTO
  --ont-id 0 \
  --serial "485754437F6C089D" \
  ...
```

---

## 🔍 Causa Raíz

Probablemente en el controller estás parseando el puerto `"0/1/0"` y tomando el primer segmento como `board`:

```javascript
// ❌ CÓDIGO INCORRECTO
const parts = payload.puerto.split('/');
const board = parseInt(parts[0]);  // Esto da 0
const port = parseInt(parts[2]);   // Esto da 0
```

### ⚠️ Formato del Puerto PON

El formato `"0/1/0"` es:
- **Segmento 0**: Frame (siempre 0 en Huawei)
- **Segmento 1**: Board/Slot (el que necesitas)
- **Segmento 2**: Port (el que necesitas)

---

## ✅ Solución

Usa los valores directamente del payload en lugar de parsear el puerto:

```javascript
// controllers/oltRealtimeController.js

async function autorizarONUPendiente(req, res) {
    try {
        const { oltId, serial } = req.params;
        const payload = req.body;

        // ✅ CORRECTO: Usar directamente del payload
        const board = payload.board;  // Ya viene parseado: 1
        const port = payload.port;    // Ya viene parseado: 0
        const puerto = payload.puerto; // "0/1/0"

        // Construir comando
        const command = [
            'python3',
            scriptPath,
            '--olt-type', oltType,
            '--puerto', puerto,
            '--board', board,           // ✅ Usar payload.board
            '--port', port,             // ✅ Usar payload.port
            '--ont-id', payload.ont_id || 0,
            '--serial', serial,
            // ... resto de parámetros
        ];

        console.log('🔧 [ONU Auth] Command:', command.join(' '));

        // Ejecutar comando...
    }
}
```

---

## 🧪 Verificación

### Antes del Fix

```bash
# ❌ Comando incorrecto
--board 0 --port 0 --puerto "0/1/0"
```

### Después del Fix

```bash
# ✅ Comando correcto
--board 1 --port 0 --puerto "0/1/0"
```

---

## 📝 Checklist de Validación

Verifica que el payload tenga estos campos:

```javascript
console.log('📋 [ONU Auth] Payload validation:');
console.log('  - puerto:', payload.puerto);      // "0/1/0"
console.log('  - board:', payload.board);        // 1 (número)
console.log('  - port:', payload.port);          // 0 (número)
console.log('  - ont_id:', payload.ont_id);      // 0 (número)
console.log('  - serial:', serial);              // "485754437F6C089D"
console.log('  - onu_type:', payload.onu_type);  // "HG8545M"
console.log('  - vlan_id:', payload.user_vlan_id); // 100 (número)
```

---

## 🎯 Resultado Esperado

Después del fix, el comando debe ejecutarse con los parámetros correctos:

```bash
python3 "/home/wdperezh01/backend/scripts/autorizar_onu_tr069.py" \
  --olt-type huawei \
  --puerto "0/1/0" \
  --board 1 \              # ✅ Ahora correcto
  --port 0 \               # ✅ Correcto
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

---

## ⚡ Código de Referencia

```javascript
// controllers/oltRealtimeController.js

exports.autorizarONUPendiente = async (req, res) => {
    try {
        const { oltId, serial } = req.params;
        const payload = req.body;

        console.log('📥 [ONU Auth] Received payload:', JSON.stringify(payload, null, 2));

        // Validar campos requeridos
        const requiredFields = ['puerto', 'board', 'port', 'onu_type', 'user_vlan_id', 'zona', 'name'];
        for (const field of requiredFields) {
            if (payload[field] === undefined && payload[field] !== 0) {
                return res.status(400).json({
                    success: false,
                    error: `Campo requerido faltante: ${field}`,
                    code: 'MISSING_FIELD'
                });
            }
        }

        // Obtener info del OLT
        const [olts] = await db.query('SELECT * FROM olts WHERE id = ?', [oltId]);
        if (!olts.length) {
            return res.status(404).json({
                success: false,
                error: 'OLT no encontrado',
                code: 'OLT_NOT_FOUND'
            });
        }

        const olt = olts[0];
        const oltType = olt.olt_type?.toLowerCase() || 'huawei';

        // Construir comando con valores del payload
        const scriptPath = path.join(__dirname, '../scripts/autorizar_onu_tr069.py');

        const command = [
            'python3',
            `"${scriptPath}"`,
            '--olt-type', oltType,
            '--puerto', `"${payload.puerto}"`,
            '--board', payload.board.toString(),        // ✅ Del payload
            '--port', payload.port.toString(),          // ✅ Del payload
            '--ont-id', (payload.ont_id || 0).toString(),
            '--serial', `"${serial}"`,
            '--onu-type', `"${payload.onu_type}"`,
            '--onu-mode', `"${payload.onu_mode || 'Routing'}"`,
            '--pon-type', `"${payload.pon_type || 'GPON'}"`,
            '--gpon-channel', `"${payload.gpon_channel || 'GPON'}"`,
            '--vlan-id', payload.user_vlan_id.toString(),
            '--download-speed', `"${payload.download_speed}"`,
            '--upload-speed', `"${payload.upload_speed}"`,
            '--download-mbps', payload.download_mbps.toString(),
            '--upload-mbps', payload.upload_mbps.toString(),
            '--zona', `"${payload.zona}"`,
            '--name', `"${payload.name}"`,
            '--line-profile', `"${payload.download_speed}"`,
            '--service-profile', '"INTERNET"'
        ];

        // Agregar parámetros opcionales
        if (payload.odb_splitter) {
            command.push('--odb-splitter', `"${payload.odb_splitter}"`);
        }
        if (payload.odb_port) {
            command.push('--odb-port', `"${payload.odb_port}"`);
        }
        if (payload.address_comment) {
            command.push('--address-comment', `"${payload.address_comment}"`);
        }
        if (payload.gps_latitude) {
            command.push('--gps-latitude', payload.gps_latitude.toString());
        }
        if (payload.gps_longitude) {
            command.push('--gps-longitude', payload.gps_longitude.toString());
        }

        const fullCommand = command.join(' ');
        console.log('🔧 [ONU Auth] Executing command:', fullCommand);

        // Ejecutar comando
        const { stdout, stderr } = await execPromise(fullCommand, {
            timeout: 30000,
            maxBuffer: 1024 * 1024 * 10
        });

        console.log('✅ [ONU Auth] Command output:', stdout);

        if (stderr && !stderr.includes('Warning')) {
            console.error('⚠️ [ONU Auth] Command stderr:', stderr);
        }

        // Parse JSON output del script
        let result;
        try {
            const jsonMatch = stdout.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn('⚠️ [ONU Auth] Could not parse JSON output');
        }

        res.json({
            success: true,
            message: 'ONU autorizada correctamente',
            data: {
                serial: serial,
                puerto: payload.puerto,
                board: payload.board,
                port: payload.port,
                ont_id: payload.ont_id,
                output: stdout,
                result: result
            }
        });

    } catch (error) {
        console.error('❌ [ONU Auth] Error:', error);

        res.status(500).json({
            success: false,
            error: 'Error interno autorizando ONU',
            message: error.message,
            code: 'INTERNAL_ERROR',
            debug: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                command: error.cmd
            } : undefined
        });
    }
};
```

---

## 🚀 Testing

Después del fix, prueba con:

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
    "name": "Cliente Test",
    "onu_external_id": "485754437F6C089D"
  }'
```

Y verifica en los logs del backend que muestre:

```
🔧 [ONU Auth] Executing command: python3 ... --board 1 --port 0 --puerto "0/1/0" ...
```

---

**Este es el último ajuste necesario para que la autorización funcione al 100%.** 🚀
