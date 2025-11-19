# 🚨 URGENTE - Guardar Datos de Autorización en la OLT

## Problema Reportado

**La autorización de ONU funciona correctamente (la ONU se autoriza) pero NO se están guardando los datos del formulario en la OLT.**

---

## 📊 Datos que se Envían desde el Frontend

### Payload Completo Enviado

```json
{
  // Identificación
  "sn": "48575443439B989D",
  "onu_external_id": "48575443439B989D",

  // Puerto PON
  "puerto": "0/1/5",
  "board": 1,
  "port": 5,
  "ont_id": 0,

  // Tipo y Modo
  "onu_type": "HG8245H",
  "onu_mode": "Routing",
  "pon_type": "GPON",
  "gpon_channel": "GPON",

  // VLAN
  "user_vlan_id": 100,

  // Velocidades
  "download_speed": "50M",
  "upload_speed": "50M",
  "download_mbps": 50,
  "upload_mbps": 50,

  // Ubicación
  "zona": "281",
  "name": "Casa de Juan Pérez",
  "address_comment": "Frente al parque, casa amarilla",

  // ODB (Splitter)
  "odb_splitter": "ODB-123",
  "odb_port": "8",

  // GPS (opcional)
  "use_gps": true,
  "gps_latitude": 18.4861,
  "gps_longitude": -69.9312
}
```

---

## ⚠️ Problema Actual

**El backend solo está AUTORIZANDO la ONU en la OLT (ejecuta comandos básicos) pero NO está:**

1. ❌ Guardando la descripción (`name`) en la OLT
2. ❌ Configurando el ODB splitter y puerto
3. ❌ Guardando la dirección/comentarios
4. ❌ Asociando las coordenadas GPS
5. ❌ Posiblemente no está guardando correctamente VLAN o velocidades

---

## ✅ Lo que el Backend DEBE Hacer

### 1. Autorizar la ONU en la OLT (✅ Ya funciona)

**Comando básico en Huawei**:
```
interface gpon 0/1
ont add 5 10 sn-auth 48575443439B989D omci ont-lineprofile-id 5 ont-srvprofile-id 5
quit
```

**Comando básico en ZTE**:
```
onu 10 type HG8245H sn 48575443439B989D
```

### 2. Configurar VLAN en la ONU (⚠️ Verificar si se está haciendo)

**Comando en Huawei**:
```
interface gpon 0/1
ont port native-vlan 5 10 eth 1 vlan 100 priority 0
quit
```

**Comando en ZTE**:
```
interface gpon-onu_1/1/5:10
switchport mode trunk vlan 100
```

### 3. Configurar Perfil de Velocidad (⚠️ Verificar si se está haciendo)

**Comando en Huawei**:
```
dba-profile add profile-id 10 profile-name 50M type4 max 51200
service-port vlan 100 gpon 0/1/5 ont 10 gemport 1 multi-service user-vlan 100 rx-cttr 10 tx-cttr 10
```

**Comando en ZTE**:
```
pon-onu-mng gpon-onu_1/1/5:10
service internet gemport 1 vlan 100
vlan port eth_0/1 mode tag vlan 100
tcont 1 name 50M profile 50M
gemport 1 tcont 1 traffic-limit upstream 50M downstream 50M
```

### 4. **IMPORTANTE**: Configurar Descripción/Nombre

**Comando en Huawei**:
```
interface gpon 0/1
ont description 5 10 "Casa de Juan Pérez"
quit
```

**Comando en ZTE**:
```
pon-onu-mng gpon-onu_1/1/5:10
description "Casa de Juan Pérez"
```

**❌ Este comando probablemente NO se está ejecutando actualmente.**

### 5. **IMPORTANTE**: Guardar Datos en Base de Datos

El backend DEBE guardar TODOS estos datos en la tabla `onus`:

```sql
INSERT INTO onus (
  olt_id,
  serial,
  puerto,
  ont_id,
  board,
  port,
  onu_type,
  onu_mode,
  user_vlan_id,
  download_speed,
  upload_speed,
  download_mbps,
  upload_mbps,
  zona_id,
  nombre,
  direccion_comentario,
  odb_splitter,
  odb_port,
  use_gps,
  gps_latitude,
  gps_longitude,
  estado,
  fecha_autorizacion
) VALUES (
  1,                              -- olt_id
  '48575443439B989D',            -- serial
  '0/1/5',                        -- puerto
  10,                             -- ont_id (asignado por la OLT)
  1,                              -- board
  5,                              -- port
  'HG8245H',                      -- onu_type
  'Routing',                      -- onu_mode
  100,                            -- user_vlan_id
  '50M',                          -- download_speed
  '50M',                          -- upload_speed
  50,                             -- download_mbps
  50,                             -- upload_mbps
  281,                            -- zona_id
  'Casa de Juan Pérez',          -- nombre
  'Frente al parque, casa amarilla', -- direccion_comentario
  'ODB-123',                      -- odb_splitter
  '8',                            -- odb_port
  1,                              -- use_gps (boolean)
  18.4861,                        -- gps_latitude
  -69.9312,                       -- gps_longitude
  'online',                       -- estado
  NOW()                           -- fecha_autorizacion
);
```

**❌ Algunos de estos campos probablemente NO se están guardando actualmente.**

---

## 🔍 Diagnóstico del Problema

### Script Python: `autorizar_onu_tr069.py`

El script probablemente se ve así actualmente:

```python
def autorizar_onu(olt_id, serial, puerto, onu_type, vlan, download, upload):
    # Conectar a OLT
    ssh = conectar_olt(olt_id)

    # Ejecutar comandos básicos
    commands = [
        f"interface gpon {puerto}",
        f"ont add {slot} {pon} sn-auth {serial} omci ...",
        f"ont port native-vlan {slot} {pon} eth 1 vlan {vlan}",
        "quit"
    ]

    for cmd in commands:
        ssh.send(cmd)

    ssh.close()

    return {"success": True}
```

**Problema**: El script NO está usando todos los datos del payload.

### Solución Requerida

Modificar el script para usar TODOS los campos:

```python
def autorizar_onu(olt_id, payload):
    # Extraer TODOS los datos del payload
    serial = payload['sn']
    puerto = payload['puerto']
    onu_type = payload['onu_type']
    vlan = payload['user_vlan_id']
    download = payload['download_speed']
    upload = payload['upload_speed']
    name = payload.get('name', '')  # ← IMPORTANTE
    address = payload.get('address_comment', '')
    odb_splitter = payload.get('odb_splitter', '')
    odb_port = payload.get('odb_port', '')

    # Conectar a OLT
    ssh = conectar_olt(olt_id)

    # Ejecutar comandos
    commands = [
        f"interface gpon {puerto}",
        f"ont add {slot} {ont_id} sn-auth {serial} omci ...",
        f"ont port native-vlan {slot} {ont_id} eth 1 vlan {vlan}",
        f"ont description {slot} {ont_id} \"{name}\"",  # ← AGREGAR ESTO
        "quit"
    ]

    # ... configurar DBA, service-port, etc.

    ssh.close()

    # GUARDAR EN BASE DE DATOS
    guardar_en_db(olt_id, payload, ont_id_asignado)

    return {"success": True, "ont_id": ont_id_asignado}
```

---

## 📋 Checklist de Verificación

### Comandos en la OLT

- [ ] **Autorización básica**: ✅ Funciona
- [ ] **Configurar VLAN**: ⚠️ Verificar
- [ ] **Configurar velocidad (DBA)**: ⚠️ Verificar
- [ ] **Configurar descripción**: ❌ NO se está haciendo
- [ ] **Service-port**: ⚠️ Verificar

### Base de Datos

- [ ] **Serial guardado**: ✅ Funciona
- [ ] **Puerto guardado**: ✅ Funciona
- [ ] **ONT ID guardado**: ⚠️ Verificar
- [ ] **VLAN guardada**: ⚠️ Verificar
- [ ] **Velocidades guardadas**: ⚠️ Verificar
- [ ] **Nombre guardado**: ❌ Probablemente NO
- [ ] **Dirección guardada**: ❌ Probablemente NO
- [ ] **ODB Splitter guardado**: ❌ Probablemente NO
- [ ] **ODB Port guardado**: ❌ Probablemente NO
- [ ] **GPS guardado**: ❌ Probablemente NO

---

## 🛠️ Solución Detallada

### Paso 1: Modificar el Endpoint

**Archivo**: `routes/olts.js` o similar

```javascript
router.post('/realtime/:oltId/onus/:serial/authorize', async (req, res) => {
  try {
    const { oltId, serial } = req.params;
    const payload = req.body;

    console.log('📤 [Authorization] Payload recibido:', payload);

    // Validar que todos los campos requeridos estén presentes
    const requiredFields = [
      'puerto', 'onu_type', 'user_vlan_id',
      'download_speed', 'upload_speed', 'zona', 'name'
    ];

    for (const field of requiredFields) {
      if (!payload[field]) {
        return res.status(400).json({
          success: false,
          error: `Campo requerido faltante: ${field}`
        });
      }
    }

    // Ejecutar script Python con TODOS los datos
    const result = await ejecutarScriptPython(
      'autorizar_onu_tr069.py',
      [
        '--olt-id', oltId,
        '--serial', serial,
        '--puerto', payload.puerto,
        '--onu-type', payload.onu_type,
        '--vlan', payload.user_vlan_id,
        '--download', payload.download_speed,
        '--upload', payload.upload_speed,
        '--name', payload.name,  // ← AGREGAR
        '--address', payload.address_comment || '',  // ← AGREGAR
        '--odb-splitter', payload.odb_splitter || '',  // ← AGREGAR
        '--odb-port', payload.odb_port || '',  // ← AGREGAR
        '--zona', payload.zona,
      ]
    );

    if (result.success) {
      // Guardar en base de datos
      await db.query(`
        INSERT INTO onus (
          olt_id, serial, puerto, ont_id, board, port,
          onu_type, onu_mode, user_vlan_id,
          download_speed, upload_speed, download_mbps, upload_mbps,
          zona_id, nombre, direccion_comentario,
          odb_splitter, odb_port,
          use_gps, gps_latitude, gps_longitude,
          estado, fecha_autorizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'online', NOW())
      `, [
        oltId,
        serial,
        payload.puerto,
        result.ont_id,  // Devuelto por el script
        payload.board,
        payload.port,
        payload.onu_type,
        payload.onu_mode || 'Routing',
        payload.user_vlan_id,
        payload.download_speed,
        payload.upload_speed,
        payload.download_mbps,
        payload.upload_mbps,
        payload.zona,
        payload.name,
        payload.address_comment || null,
        payload.odb_splitter || null,
        payload.odb_port || null,
        payload.use_gps ? 1 : 0,
        payload.gps_latitude || null,
        payload.gps_longitude || null,
      ]);

      res.json({
        success: true,
        message: 'ONU autorizada y configurada correctamente',
        ont_id: result.ont_id
      });
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('❌ [Authorization] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Paso 2: Modificar el Script Python

**Archivo**: `autorizar_onu_tr069.py`

```python
import argparse
import sys

def autorizar_onu_huawei(olt, serial, puerto, ont_id, onu_type, vlan,
                         download, upload, name, address, odb_splitter, odb_port):
    """
    Autoriza ONU en OLT Huawei con TODOS los datos
    """
    try:
        # Conectar vía SSH
        ssh = conectar_ssh(olt['ip'], olt['username'], olt['password'])

        # Parsear puerto (ej: "0/1/5" -> frame=0, slot=1, port=5)
        frame, slot, port = puerto.split('/')

        comandos = [
            "enable",
            "config",
            f"interface gpon {frame}/{slot}",

            # Autorizar ONU
            f"ont add {port} {ont_id} sn-auth {serial} omci ont-lineprofile-id 5 ont-srvprofile-id 5",

            # Configurar VLAN
            f"ont port native-vlan {port} {ont_id} eth 1 vlan {vlan} priority 0",

            # Configurar descripción (NOMBRE)
            f"ont description {port} {ont_id} \"{name}\"",

            "quit",

            # Configurar DBA (velocidad)
            f"dba-profile add profile-id {ont_id} profile-name {download} type4 max {int(download.replace('M', '')) * 1024}",

            # Service port
            f"service-port vlan {vlan} gpon {frame}/{slot}/{port} ont {ont_id} gemport 1 multi-service user-vlan {vlan}",

            "quit",
            "quit"
        ]

        for cmd in comandos:
            output = ssh.send_command(cmd)
            print(f"Comando: {cmd}")
            print(f"Output: {output}")

        ssh.disconnect()

        return {
            "success": True,
            "ont_id": ont_id,
            "message": f"ONU {serial} autorizada en puerto {puerto} con ONT ID {ont_id}"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--olt-id', required=True)
    parser.add_argument('--serial', required=True)
    parser.add_argument('--puerto', required=True)
    parser.add_argument('--onu-type', required=True)
    parser.add_argument('--vlan', required=True, type=int)
    parser.add_argument('--download', required=True)
    parser.add_argument('--upload', required=True)
    parser.add_argument('--name', required=True)  # ← NUEVO
    parser.add_argument('--address', default='')  # ← NUEVO
    parser.add_argument('--odb-splitter', default='')  # ← NUEVO
    parser.add_argument('--odb-port', default='')  # ← NUEVO
    parser.add_argument('--zona', required=True)

    args = parser.parse_args()

    # ... resto del código
```

---

## 🎯 Resumen de Cambios Necesarios

### Backend (Node.js)
1. ✅ Aceptar TODOS los campos del payload
2. ✅ Pasar TODOS los campos al script Python
3. ✅ Guardar TODOS los campos en la base de datos

### Script Python
1. ✅ Recibir TODOS los parámetros
2. ✅ Ejecutar comando de descripción (`ont description`)
3. ✅ Configurar correctamente VLAN y velocidades
4. ✅ Devolver ONT ID asignado

### Tabla de Base de Datos
1. ✅ Agregar columnas si faltan:
   - `nombre` (VARCHAR)
   - `direccion_comentario` (TEXT)
   - `odb_splitter` (VARCHAR)
   - `odb_port` (VARCHAR)
   - `gps_latitude` (DECIMAL)
   - `gps_longitude` (DECIMAL)
   - `use_gps` (BOOLEAN)

---

## 🧪 Testing

Después de implementar:

```bash
# Prueba completa
curl -k -X POST https://wellnet-rd.com:444/api/olts/realtime/1/onus/TEST123/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "puerto": "0/1/5",
    "board": 1,
    "port": 5,
    "ont_id": 0,
    "onu_type": "HG8245H",
    "user_vlan_id": 100,
    "download_speed": "50M",
    "upload_speed": "50M",
    "name": "Test ONU",
    "address_comment": "Casa de prueba",
    "odb_splitter": "ODB-001",
    "odb_port": "5",
    "zona": "281"
  }'
```

**Verificar**:
1. ONU aparece en la OLT
2. Descripción en OLT muestra "Test ONU"
3. VLAN configurada correctamente
4. Velocidad configurada correctamente
5. Datos guardados en base de datos

---

## 📞 Siguiente Paso

Implementar los cambios en:
1. Endpoint de autorización
2. Script Python
3. Base de datos (agregar columnas si faltan)
4. Testing completo
