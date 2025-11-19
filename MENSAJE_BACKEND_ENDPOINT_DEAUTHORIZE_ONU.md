# 🔧 Implementar Endpoint: Desautorizar ONU

**Fecha:** 2025-11-17
**Prioridad:** MEDIA
**Objetivo:** Permitir eliminar/desautorizar ONUs desde el frontend

---

## 📨 Para: Claude del Backend

Hola, hemos implementado en el frontend la funcionalidad para que los usuarios puedan desautorizar ONUs. Necesitamos que implementes el endpoint correspondiente.

---

## 🎯 Endpoint Requerido

### DELETE /api/olts/realtime/:oltId/onus/:serial/deauthorize

**Descripción:** Elimina/desautoriza una ONU de la OLT y actualiza la base de datos.

---

## 📤 Request

### URL Parameters

- **oltId** (string): ID del OLT
- **serial** (string): Serial number de la ONU (ej: "485754437F6C089D")

### Body (JSON)

```json
{
  "puerto": "0/1/0",    // Puerto PON donde está la ONU
  "ont_id": 0           // ONT ID de la ONU
}
```

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 📥 Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "ONU desautorizada correctamente",
  "data": {
    "serial": "485754437F6C089D",
    "puerto": "0/1/0",
    "ont_id": 0,
    "deleted_at": "2025-11-17T14:30:00Z"
  }
}
```

### Error Responses

#### 404 - ONU No Encontrada

```json
{
  "success": false,
  "error": "ONU no encontrada en la OLT",
  "message": "No existe una ONU con ese serial en el puerto especificado",
  "code": "ONU_NOT_FOUND"
}
```

#### 400 - Parámetros Inválidos

```json
{
  "success": false,
  "error": "Parámetros inválidos",
  "message": "Puerto y ONT ID son requeridos",
  "code": "INVALID_PARAMETERS"
}
```

#### 500 - Error de Ejecución

```json
{
  "success": false,
  "error": "Error ejecutando script de desautorización",
  "message": "Detalles del error...",
  "code": "SCRIPT_ERROR",
  "debug": {
    "stdout": "...",
    "stderr": "..."
  }
}
```

---

## 🔧 Implementación Requerida

### Archivo: `controllers/oltRealtimeController.js`

```javascript
/**
 * Desautorizar/Eliminar una ONU autorizada
 * DELETE /api/olts/realtime/:oltId/onus/:serial/deauthorize
 */
exports.desautorizarONU = async (req, res) => {
    try {
        const { oltId, serial } = req.params;
        const { puerto, ont_id } = req.body;

        console.log('🗑️ [ONU Deauth] Request:', {
            oltId,
            serial,
            puerto,
            ont_id
        });

        // Validar parámetros
        if (!puerto || ont_id === undefined || ont_id === null) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros inválidos',
                message: 'Puerto y ONT ID son requeridos',
                code: 'INVALID_PARAMETERS'
            });
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

        // Parsear puerto
        const parts = puerto.split('/');
        if (parts.length !== 3) {
            return res.status(400).json({
                success: false,
                error: 'Formato de puerto inválido',
                message: 'El puerto debe tener formato: 0/1/0',
                code: 'INVALID_PORT_FORMAT'
            });
        }

        const board = parseInt(parts[1]);
        const port = parseInt(parts[2]);

        // Construir comando para script Python
        const scriptPath = path.join(__dirname, '../scripts/desautorizar_onu.py');

        const command = [
            'python3',
            `"${scriptPath}"`,
            '--olt-type', oltType,
            '--puerto', `"${puerto}"`,
            '--board', board,
            '--port', port,
            '--ont-id', ont_id,
            '--serial', `"${serial}"`
        ];

        const fullCommand = command.join(' ');
        console.log('🔧 [ONU Deauth] Executing command:', fullCommand);

        const startTime = Date.now();

        try {
            const { stdout, stderr } = await execPromise(fullCommand, {
                timeout: 60000,  // 1 minuto
                maxBuffer: 1024 * 1024 * 10
            });

            const duration = Date.now() - startTime;
            console.log(`✅ [ONU Deauth] Completed in ${duration}ms`);
            console.log('📄 [ONU Deauth] Output:', stdout);

            if (stderr && stderr.trim()) {
                console.warn('⚠️ [ONU Deauth] STDERR:', stderr);
            }

            // Parsear respuesta JSON del script
            let result = null;
            const jsonMatches = stdout.match(/\{[\s\S]*?\}(?=\s*(\{|$))/g);

            if (jsonMatches && jsonMatches.length > 0) {
                try {
                    const lastJson = jsonMatches[jsonMatches.length - 1];
                    result = JSON.parse(lastJson);
                    console.log('✅ [ONU Deauth] Parsed result:', result);
                } catch (parseError) {
                    console.error('❌ [ONU Deauth] JSON parse failed:', parseError.message);
                }
            }

            // Si hay resultado exitoso
            if (result && result.success) {
                // Actualizar BD: marcar como eliminada (no borrar registro)
                await db.query(`
                    UPDATE onus_autorizadas
                    SET estado = 'eliminada',
                        fecha_eliminacion = NOW()
                    WHERE olt_id = ?
                    AND serial = ?
                    AND puerto = ?
                    AND ont_id = ?
                `, [oltId, serial, puerto, ont_id]);

                return res.json({
                    success: true,
                    message: 'ONU desautorizada correctamente',
                    data: {
                        serial: serial,
                        puerto: puerto,
                        ont_id: ont_id,
                        deleted_at: new Date().toISOString(),
                        execution_time: duration
                    }
                });
            }

            // Si hay resultado pero es error
            if (result && !result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error || 'Error desautorizando ONU',
                    message: result.message || 'Ver detalles',
                    code: result.code || 'DEAUTH_FAILED',
                    debug: result
                });
            }

            // Fallback: no hay resultado claro
            return res.status(500).json({
                success: false,
                error: 'Respuesta del script no reconocida',
                message: 'El script se ejecutó pero la respuesta no es clara',
                code: 'UNKNOWN_RESPONSE',
                debug: {
                    stdout: stdout.substring(0, 1000)
                }
            });

        } catch (execError) {
            const duration = Date.now() - startTime;
            console.error(`❌ [ONU Deauth] Execution error after ${duration}ms:`, execError.message);

            if (execError.killed) {
                return res.status(500).json({
                    success: false,
                    error: 'Timeout ejecutando script de desautorización',
                    message: 'El script tardó más de 60 segundos',
                    code: 'TIMEOUT'
                });
            }

            throw execError;
        }

    } catch (error) {
        console.error('❌ [ONU Deauth] Error general:', error);

        return res.status(500).json({
            success: false,
            error: 'Error interno desautorizando ONU',
            message: error.message,
            code: 'INTERNAL_ERROR',
            debug: process.env.NODE_ENV === 'development' ? {
                stack: error.stack
            } : undefined
        });
    }
};
```

---

## 🐍 Script Python Requerido

### Archivo: `scripts/desautorizar_onu.py`

```python
#!/usr/bin/env python3
"""
Script para desautorizar/eliminar una ONU de la OLT
"""

import argparse
import json
import sys
import subprocess
import os

def desautorizar_onu_huawei(puerto, board, port, ont_id, serial):
    """Desautorizar ONU en OLT Huawei"""
    try:
        script_path = os.path.join(os.path.dirname(__file__), 'huawei-desautorizar-onu.exp')

        result = subprocess.run(
            ['expect', script_path, puerto, str(ont_id)],
            capture_output=True,
            text=True,
            timeout=60
        )

        output = result.stdout

        # Verificar si la desautorización fue exitosa
        if "SUCCESS" in output or "deleted successfully" in output:
            return {
                'success': True,
                'message': f'ONU desautorizada exitosamente',
                'data': {
                    'serial': serial,
                    'puerto': puerto,
                    'ont_id': ont_id
                }
            }
        elif "ERROR" in output or "failed" in output:
            error_msg = "Error desautorizando ONU"
            if "not exist" in output:
                error_msg = "ONU no encontrada en la OLT"
            elif "not found" in output:
                error_msg = "ONT ID no encontrado en el puerto"

            return {
                'success': False,
                'error': error_msg,
                'output': output
            }
        else:
            return {
                'success': False,
                'error': 'Respuesta inesperada del OLT',
                'output': output
            }

    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Timeout conectando a la OLT',
            'code': 'TIMEOUT'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'code': 'SCRIPT_ERROR'
        }

def desautorizar_onu_zte(puerto, board, port, ont_id, serial):
    """Desautorizar ONU en OLT ZTE"""
    # Similar a Huawei
    pass

def main():
    parser = argparse.ArgumentParser(description='Desautorizar ONU')
    parser.add_argument('--olt-type', required=True, choices=['huawei', 'zte'])
    parser.add_argument('--puerto', required=True, help='Puerto PON: 0/1/0')
    parser.add_argument('--board', type=int, required=True)
    parser.add_argument('--port', type=int, required=True)
    parser.add_argument('--ont-id', type=int, required=True)
    parser.add_argument('--serial', required=True)

    args = parser.parse_args()

    if args.olt_type == 'huawei':
        result = desautorizar_onu_huawei(
            args.puerto,
            args.board,
            args.port,
            args.ont_id,
            args.serial
        )
    elif args.olt_type == 'zte':
        result = desautorizar_onu_zte(
            args.puerto,
            args.board,
            args.port,
            args.ont_id,
            args.serial
        )
    else:
        result = {
            'success': False,
            'error': f'Tipo de OLT no soportado: {args.olt_type}'
        }

    print(json.dumps(result))

if __name__ == '__main__':
    main()
```

---

## 📜 Script Expect para Huawei

### Archivo: `scripts/huawei-desautorizar-onu.exp`

```tcl
#!/usr/bin/expect -f

# Parámetros
set puerto [lindex $argv 0]
set ont_id [lindex $argv 1]

# Configuración de la OLT (obtener de BD o config)
set host "10.200.200.2"
set username "wellnet"
set password "TU_PASSWORD"

# Timeout
set timeout 30

# Conectar a la OLT
spawn telnet $host 23

expect {
    "Username:" { send "$username\r" }
    timeout { puts "ERROR: Timeout conectando"; exit 1 }
}

expect {
    "Password:" { send "$password\r" }
    timeout { puts "ERROR: Timeout en password"; exit 1 }
}

expect ">" { send "enable\r" }
expect "#" { send "config\r" }
expect "(config)#" {
    send "interface gpon $puerto\r"
}

expect "(config-if-gpon-$puerto)#" {
    # Eliminar ONU
    send "no ont $ont_id\r"
}

expect {
    "(config-if-gpon-$puerto)#" {
        puts "SUCCESS: ONU deleted successfully"
        send "quit\r"
    }
    "%" {
        puts "ERROR: Command failed"
        send "quit\r"
        exit 1
    }
    timeout {
        puts "ERROR: Timeout eliminando ONU"
        exit 1
    }
}

expect "(config)#" { send "quit\r" }
expect "#" { send "quit\r" }
expect eof
```

---

## 🛣️ Actualización de Rutas

### Archivo: `routes/oltRoutes.js` o similar

```javascript
// Agregar la ruta
router.delete(
    '/realtime/:oltId/onus/:serial/deauthorize',
    authMiddleware,
    oltRealtimeController.desautorizarONU
);
```

---

## 🗄️ Actualización de Base de Datos (Opcional)

Si aún no existe, agregar columna de estado en la tabla `onus_autorizadas`:

```sql
ALTER TABLE onus_autorizadas
ADD COLUMN estado VARCHAR(20) DEFAULT 'activa',
ADD COLUMN fecha_eliminacion DATETIME NULL;

-- Estados posibles: 'activa', 'eliminada', 'offline'
```

---

## ✅ Checklist de Implementación

- [ ] Crear script Python `desautorizar_onu.py`
- [ ] Crear script Expect `huawei-desautorizar-onu.exp`
- [ ] Implementar función `desautorizarONU` en controller
- [ ] Agregar ruta DELETE en routes
- [ ] Actualizar tabla `onus_autorizadas` (si no existe columna estado)
- [ ] Probar endpoint desde Postman/curl
- [ ] Probar desde frontend
- [ ] Reiniciar servidor: `pm2 restart server`

---

## 🧪 Testing

### Request de Prueba

```bash
curl -k -X DELETE \
  "https://wellnet-rd.com:444/api/olts/realtime/1/onus/485754437F6C089D/deauthorize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "puerto": "0/1/0",
    "ont_id": 0
  }'
```

### Response Esperado

```json
{
  "success": true,
  "message": "ONU desautorizada correctamente",
  "data": {
    "serial": "485754437F6C089D",
    "puerto": "0/1/0",
    "ont_id": 0,
    "deleted_at": "2025-11-17T14:30:00.000Z",
    "execution_time": 5234
  }
}
```

---

## 🎯 Comportamiento Esperado

1. Usuario presiona "Desautorizar ONU" en el frontend
2. Se muestra confirmación con advertencia
3. Usuario confirma
4. Frontend llama endpoint DELETE
5. Backend ejecuta script Python
6. Script conecta a OLT vía Telnet
7. Ejecuta comando `no ont {ont_id}` en el puerto
8. ONU es eliminada de la OLT
9. Backend actualiza BD marcando ONU como "eliminada"
10. Frontend recibe success y navega de vuelta
11. Usuario no ve más esa ONU en la lista de autorizadas

---

**Este endpoint permitirá a los usuarios gestionar completamente el ciclo de vida de las ONUs.** 🚀
