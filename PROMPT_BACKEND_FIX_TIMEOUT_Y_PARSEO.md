# 🔴 URGENTE: Fix Timeout y Parseo de Respuesta del Script

**Fecha:** 2025-11-17
**Problema:** Script funcionando pero output truncado y error de parseo
**Código de Error:** `PARSE_ERROR`

---

## 🎉 ¡Buenas Noticias!

El script Python **SÍ está funcionando**. La evidencia:

```
🔧 AUTORIZACIÓN DE ONU TR-069
OLT Tipo: HUAWEI
Serial: 48575443439B989D
Puerto: 0/1/0
ONT ID: 0
Tipo ONU: HG8245H
Modo ONU: Routing
VLAN: 100
Velocidad Bajada: 1M (1 Mbps)
Velocidad Subida: 1M (1 Mbps)
Zona: 281
Nombre: Prueba 1
🔄 Ejecutando autorizaci  ← SE CORTÓ AQUÍ
```

---

## 🚨 Problemas Identificados

### 1. Output Truncado

El texto se corta en medio de "Ejecutando autorización". Causas posibles:
- ⏱️ **Timeout muy corto**: El script tarda más de lo esperado
- 📦 **Buffer pequeño**: El maxBuffer es insuficiente
- 🔌 **Conexión SSH lenta**: La OLT tarda en responder

### 2. Error de Parseo

```json
{
  "code": "PARSE_ERROR",
  "message": "Error parseando respuesta del script de autorización"
}
```

**Causa:** El backend espera JSON pero el script está imprimiendo texto formateado.

---

## ✅ Soluciones Requeridas

### Solución 1: Aumentar Timeout y Buffer (CRÍTICO)

En `controllers/oltRealtimeController.js`, aumenta los valores:

```javascript
// ANTES (valores pequeños)
const { stdout, stderr } = await execPromise(fullCommand, {
    timeout: 30000,           // 30 segundos
    maxBuffer: 1024 * 1024 * 10  // 10 MB
});

// DESPUÉS (valores mayores)
const { stdout, stderr } = await execPromise(fullCommand, {
    timeout: 120000,          // ⚠️ 120 segundos (2 minutos)
    maxBuffer: 1024 * 1024 * 50  // ⚠️ 50 MB
});
```

**Justificación:**
- La conexión SSH a la OLT puede tardar 30-60 segundos
- Los comandos de autorización pueden tardar otros 30-60 segundos
- Total estimado: 60-120 segundos

### Solución 2: Parsear JSON del Output (CRÍTICO)

El script probablemente imprime el JSON al final, pero el texto formateado confunde el parser.

```javascript
// controllers/oltRealtimeController.js

// ANTES (busca JSON desde el inicio)
let result;
try {
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
    }
} catch (e) {
    console.warn('⚠️ [ONU Auth] Could not parse JSON output');
}

// DESPUÉS (busca el ÚLTIMO bloque JSON)
let result;
try {
    // Buscar TODOS los bloques JSON
    const jsonMatches = stdout.match(/\{[\s\S]*?\}(?=\s*(\{|$))/g);

    if (jsonMatches && jsonMatches.length > 0) {
        // Tomar el ÚLTIMO bloque JSON (el resultado final)
        const lastJson = jsonMatches[jsonMatches.length - 1];
        result = JSON.parse(lastJson);

        console.log('✅ [ONU Auth] Parsed JSON result:', result);
    } else {
        console.warn('⚠️ [ONU Auth] No JSON found in output');
        console.log('📄 [ONU Auth] Raw output:', stdout);
    }
} catch (e) {
    console.error('❌ [ONU Auth] JSON parse error:', e.message);
    console.log('📄 [ONU Auth] Failed output:', stdout);
}

// Si el script NO terminó pero imprimió info, considerarlo éxito parcial
if (!result && stdout.includes('AUTORIZACIÓN DE ONU TR-069')) {
    // El script empezó a ejecutarse pero fue interrumpido
    return res.status(500).json({
        success: false,
        error: 'Script timeout - La autorización está en progreso',
        message: 'El script tardó demasiado. Verifica manualmente si la ONU fue autorizada.',
        code: 'TIMEOUT',
        debug: {
            output: stdout.substring(0, 500),
            hint: 'Aumenta el timeout o verifica la velocidad de conexión a la OLT'
        }
    });
}
```

### Solución 3: Logging Mejorado (RECOMENDADO)

Agregar logs para debugging:

```javascript
console.log('⏱️ [ONU Auth] Starting command execution...');
console.log('📋 [ONU Auth] Timeout:', timeout, 'ms');
console.log('📦 [ONU Auth] MaxBuffer:', maxBuffer, 'bytes');

const startTime = Date.now();

try {
    const { stdout, stderr } = await execPromise(fullCommand, {
        timeout: 120000,
        maxBuffer: 1024 * 1024 * 50
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [ONU Auth] Command completed in ${duration}ms`);
    console.log('📄 [ONU Auth] Output length:', stdout.length, 'chars');
    console.log('📄 [ONU Auth] First 500 chars:', stdout.substring(0, 500));
    console.log('📄 [ONU Auth] Last 500 chars:', stdout.substring(stdout.length - 500));

} catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [ONU Auth] Command failed after ${duration}ms`);
    console.error('📄 [ONU Auth] Error:', error.message);

    if (error.killed) {
        console.error('⏱️ [ONU Auth] Process was killed (timeout)');
    }
}
```

---

## 🧪 Testing

### Prueba 1: Verificar Timeout Actual

Ejecuta el comando manualmente y mide el tiempo:

```bash
time python3 /home/wdperezh01/backend/scripts/autorizar_onu_tr069.py \
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
  --download-speed "100M" \
  --upload-speed "100M" \
  --download-mbps 100 \
  --upload-mbps 100 \
  --zona "281" \
  --name "Prueba Manual" \
  --line-profile "100M" \
  --service-profile "INTERNET"

# El output mostrará cuánto tardó, ej:
# real    1m23.456s
# user    0m2.123s
# sys     0m0.234s
```

Si tarda más de 30 segundos → **Aumenta el timeout a 120s o más**.

### Prueba 2: Verificar Formato del Output

```bash
# Ejecutar y guardar output
python3 scripts/autorizar_onu_tr069.py [...parámetros...] > /tmp/onu_output.txt 2>&1

# Ver el output completo
cat /tmp/onu_output.txt

# Buscar JSON en el output
grep -o '{.*}' /tmp/onu_output.txt | tail -1 | jq .
```

Si el JSON está al final → **Usa la regex mejorada** (Solución 2).

---

## 📝 Código Completo Actualizado

```javascript
// controllers/oltRealtimeController.js

exports.autorizarONUPendiente = async (req, res) => {
    try {
        const { oltId, serial } = req.params;
        const bodyData = req.body;

        // ... validaciones y construcción del comando ...

        const fullCommand = commandArgs.join(' ');

        console.log('⏱️ [ONU Auth] Starting authorization...');
        console.log('🔧 [ONU Auth] Command:', fullCommand);

        const startTime = Date.now();
        const timeout = 120000;  // 2 minutos
        const maxBuffer = 1024 * 1024 * 50;  // 50 MB

        try {
            const { stdout, stderr } = await execPromise(fullCommand, {
                timeout: timeout,
                maxBuffer: maxBuffer,
                encoding: 'utf8'
            });

            const duration = Date.now() - startTime;
            console.log(`✅ [ONU Auth] Completed in ${duration}ms`);
            console.log('📄 [ONU Auth] Output length:', stdout.length);

            // Mostrar primeros y últimos 500 caracteres
            if (stdout.length > 1000) {
                console.log('📄 [ONU Auth] First 500:', stdout.substring(0, 500));
                console.log('📄 [ONU Auth] Last 500:', stdout.substring(stdout.length - 500));
            } else {
                console.log('📄 [ONU Auth] Full output:', stdout);
            }

            if (stderr && stderr.trim()) {
                console.warn('⚠️ [ONU Auth] STDERR:', stderr);
            }

            // Buscar JSON en el output
            let result = null;

            // Intentar parsear múltiples bloques JSON y tomar el último
            const jsonMatches = stdout.match(/\{[\s\S]*?\}(?=\s*(\{|$))/g);

            if (jsonMatches && jsonMatches.length > 0) {
                try {
                    // Tomar el último bloque JSON (resultado final)
                    const lastJson = jsonMatches[jsonMatches.length - 1];
                    result = JSON.parse(lastJson);
                    console.log('✅ [ONU Auth] Parsed result:', result);
                } catch (parseError) {
                    console.error('❌ [ONU Auth] JSON parse failed:', parseError.message);

                    // Intentar con cada bloque JSON hasta encontrar uno válido
                    for (let i = jsonMatches.length - 1; i >= 0; i--) {
                        try {
                            result = JSON.parse(jsonMatches[i]);
                            console.log(`✅ [ONU Auth] Parsed JSON block ${i}:`, result);
                            break;
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }

            // Si no se pudo parsear JSON pero el script ejecutó
            if (!result && stdout.includes('AUTORIZACIÓN DE ONU TR-069')) {
                console.warn('⚠️ [ONU Auth] No JSON found but script started');

                // Verificar si fue timeout
                if (duration >= timeout - 1000) {
                    return res.status(500).json({
                        success: false,
                        error: 'Timeout durante la autorización',
                        message: 'El script tardó demasiado. La ONU puede haberse autorizado.',
                        code: 'TIMEOUT',
                        debug: {
                            duration: duration,
                            timeout: timeout,
                            output_preview: stdout.substring(0, 500),
                            hint: 'Verifica manualmente en la OLT si la ONU fue autorizada'
                        }
                    });
                }

                // Si no fue timeout, es error de parseo
                return res.status(500).json({
                    success: false,
                    error: 'Error parseando respuesta del script',
                    message: 'El script se ejecutó pero no retornó JSON válido',
                    code: 'PARSE_ERROR',
                    debug: {
                        output_preview: stdout.substring(0, 500),
                        stderr: stderr
                    }
                });
            }

            // Si tenemos resultado exitoso
            if (result && result.success) {
                // Guardar en BD
                await db.query(`
                    INSERT INTO onus_autorizadas
                    (olt_id, serial, puerto, board, port, slot, ont_id, onu_type, vlan_id,
                     zona_id, nombre, velocidad_bajada, velocidad_subida, fecha_autorizacion)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `, [
                    oltId,
                    serial,
                    bodyData.puerto,
                    board,
                    portFinal,
                    slot,
                    bodyData.ont_id,
                    bodyData.onu_type,
                    bodyData.user_vlan_id,
                    bodyData.zona,
                    bodyData.name,
                    bodyData.download_mbps,
                    bodyData.upload_mbps
                ]);

                return res.json({
                    success: true,
                    message: 'ONU autorizada correctamente',
                    data: {
                        serial: serial,
                        puerto: bodyData.puerto,
                        ont_id: bodyData.ont_id,
                        duration: duration,
                        result: result
                    }
                });
            }

            // Si hay resultado pero es error
            if (result && !result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error || 'Error en la autorización',
                    message: result.message || 'Ver detalles',
                    code: result.code || 'AUTHORIZATION_FAILED',
                    debug: result
                });
            }

            // Fallback: no hay resultado ni error claro
            return res.status(500).json({
                success: false,
                error: 'Respuesta del script no reconocida',
                message: 'El script se ejecutó pero la respuesta no es clara',
                code: 'UNKNOWN_RESPONSE',
                debug: {
                    stdout: stdout.substring(0, 1000),
                    stderr: stderr
                }
            });

        } catch (execError) {
            const duration = Date.now() - startTime;
            console.error(`❌ [ONU Auth] Execution error after ${duration}ms:`, execError.message);

            if (execError.killed) {
                return res.status(500).json({
                    success: false,
                    error: 'Timeout ejecutando script de autorización',
                    message: `El script tardó más de ${timeout/1000} segundos`,
                    code: 'TIMEOUT',
                    debug: {
                        duration: duration,
                        timeout: timeout,
                        killed: true
                    }
                });
            }

            throw execError;
        }

    } catch (error) {
        console.error('❌ [ONU Auth] Error general:', error);

        return res.status(500).json({
            success: false,
            error: 'Error interno autorizando ONU',
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

## 🎯 Resultado Esperado

Después de aplicar estos fixes:

1. ✅ El script tendrá suficiente tiempo (120s) para completar
2. ✅ El output completo se capturará (50 MB buffer)
3. ✅ El JSON se parseará correctamente del output
4. ✅ Los logs mostrarán duración y detalles
5. ✅ Errores claros si hay timeout

**El frontend recibirá:**

```json
{
  "success": true,
  "message": "ONU autorizada correctamente",
  "data": {
    "serial": "48575443439B989D",
    "puerto": "0/1/0",
    "ont_id": 1,
    "duration": 45000,
    "result": {
      "success": true,
      "ont_id": 1,
      "commands_executed": [...]
    }
  }
}
```

---

## 🚀 Aplicar Fix

1. Modificar `controllers/oltRealtimeController.js` con el código actualizado
2. Reiniciar servidor: `pm2 restart server`
3. Probar desde el frontend
4. Revisar logs: `pm2 logs server --lines 200`

---

**Este es el último fix necesario. El script funciona, solo necesita más tiempo y mejor parseo.** 🎉
