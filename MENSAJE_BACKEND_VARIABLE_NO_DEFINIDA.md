# 🔴 URGENTE: Error "scriptResult is not defined"

**Fecha:** 2025-11-17
**Prioridad:** CRÍTICA
**Error:** Variable no definida en el controller de Node.js

---

## 📨 Para: Claude del Backend

Hola, gracias por resolver el fix del "ONU ya existe". Sin embargo, ahora tenemos un **error de programación** en el controller.

---

## 🚨 Error Actual

```json
{
  "code": "INTERNAL_ERROR",
  "error": "scriptResult is not defined",
  "message": "Error interno autorizando ONU"
}
```

**Tipo de Error:** `ReferenceError` - Variable no definida en JavaScript/Node.js

**Ubicación:** `controllers/oltRealtimeController.js` - Función `autorizarONUPendiente`

---

## 📤 Payload que Causó el Error (Correcto)

```json
{
  "board": 1,
  "download_mbps": 1,
  "download_speed": "1M",
  "gpon_channel": "GPON",
  "name": "Prueba 2",
  "ont_id": 0,
  "onu_external_id": "485754437F6C089D",
  "onu_mode": "Routing",
  "onu_type": "HG8545M",
  "pon_type": "GPON",
  "port": 0,
  "puerto": "0/1/0",
  "sn": "485754437F6C089D",
  "upload_mbps": 1,
  "upload_speed": "1M",
  "use_gps": false,
  "user_vlan_id": 100,
  "zona": "211"
}
```

**✅ El payload está perfecto** - este es un error en el código del controller, no del frontend.

---

## 🔍 Análisis del Problema

### ¿Qué es `scriptResult`?

Probablemente es una variable que debería contener el resultado del script Python, pero:

1. ❌ **No está declarada** con `let` o `const`
2. ❌ **No está asignada** antes de usarse
3. ❌ **Se usa antes de que exista** (timing issue)

### Escenarios Comunes

**Escenario 1: Variable mal nombrada**
```javascript
// ❌ INCORRECTO
const result = await executeScript(...);
console.log(scriptResult);  // ← scriptResult no existe, debería ser "result"
```

**Escenario 2: Variable en scope incorrecto**
```javascript
// ❌ INCORRECTO
if (condition) {
    const scriptResult = await executeScript(...);
}
console.log(scriptResult);  // ← fuera de scope
```

**Escenario 3: Typo en el nombre**
```javascript
// ❌ INCORRECTO
const script_result = await executeScript(...);
return scriptResult;  // ← debería ser script_result
```

---

## 🔧 Solución

### PASO 1: Revisar el Controller

Abre `controllers/oltRealtimeController.js` y busca todas las referencias a `scriptResult`:

```bash
cd /home/wdperezh01/backend
grep -n "scriptResult" controllers/oltRealtimeController.js
```

Esto te mostrará todas las líneas donde se menciona `scriptResult`.

### PASO 2: Verificar la Declaración

**Busca el código donde se ejecuta el script Python:**

```javascript
// ✅ CORRECTO - Ejemplo de cómo debería verse
const { stdout, stderr } = await execPromise(fullCommand, {
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 50
});

// Parsear el output
let result = null;  // ← Debe estar DECLARADO AQUÍ

try {
    const jsonMatches = stdout.match(/\{[\s\S]*?\}(?=\s*(\{|$))/g);

    if (jsonMatches && jsonMatches.length > 0) {
        const lastJson = jsonMatches[jsonMatches.length - 1];
        result = JSON.parse(lastJson);  // ← Asignar a "result"
        console.log('✅ [ONU Auth] Parsed result:', result);
    }
} catch (e) {
    console.error('❌ [ONU Auth] Parse error:', e);
}

// ✅ Usar la variable correcta
if (result && result.success) {
    // Procesar resultado exitoso
    return res.json({
        success: true,
        message: 'ONU autorizada correctamente',
        data: result.data  // ← Usar "result", NO "scriptResult"
    });
}
```

### PASO 3: Verificar el Problema Específico

**Posibles problemas en el código actual:**

1. **Declaración faltante:**
```javascript
// ❌ PROBLEMA
if (jsonMatches && jsonMatches.length > 0) {
    const lastJson = jsonMatches[jsonMatches.length - 1];
    scriptResult = JSON.parse(lastJson);  // ← SIN declarar con let/const
}
```

**Solución:**
```javascript
// ✅ CORRECTO
let scriptResult = null;  // ← DECLARAR AQUÍ

if (jsonMatches && jsonMatches.length > 0) {
    const lastJson = jsonMatches[jsonMatches.length - 1];
    scriptResult = JSON.parse(lastJson);
}
```

2. **Inconsistencia de nombres:**
```javascript
// ❌ PROBLEMA
const result = JSON.parse(lastJson);

// Más adelante en el código...
if (scriptResult.success) {  // ← Debería ser "result"
    // ...
}
```

**Solución:**
```javascript
// ✅ CORRECTO - Usar el MISMO nombre siempre
const scriptResult = JSON.parse(lastJson);

// Más adelante...
if (scriptResult.success) {
    // ...
}
```

---

## 📝 Checklist de Verificación

Por favor revisa estos puntos en `oltRealtimeController.js`:

- [ ] ¿Está `scriptResult` declarado con `let` o `const`?
- [ ] ¿Se declara ANTES de usarse?
- [ ] ¿Está en el scope correcto?
- [ ] ¿El nombre es consistente en todo el código?
- [ ] ¿No hay typos en el nombre de la variable?

---

## 🧪 Testing Rápido

Una vez corregido, verifica con:

```bash
# Reiniciar servidor
pm2 restart server

# Ver logs en tiempo real
pm2 logs server --lines 100

# Probar desde frontend
# (El frontend ya está listo)
```

---

## 💡 Ejemplo de Código Correcto Completo

**Basado en el documento `PROMPT_BACKEND_FIX_TIMEOUT_Y_PARSEO.md`:**

```javascript
exports.autorizarONUPendiente = async (req, res) => {
    try {
        const { oltId, serial } = req.params;
        const bodyData = req.body;

        // ... validaciones y construcción del comando ...

        const fullCommand = commandArgs.join(' ');
        console.log('⏱️ [ONU Auth] Starting authorization...');
        console.log('🔧 [ONU Auth] Command:', fullCommand);

        const startTime = Date.now();
        const timeout = 120000;
        const maxBuffer = 1024 * 1024 * 50;

        try {
            const { stdout, stderr } = await execPromise(fullCommand, {
                timeout: timeout,
                maxBuffer: maxBuffer,
                encoding: 'utf8'
            });

            const duration = Date.now() - startTime;
            console.log(`✅ [ONU Auth] Completed in ${duration}ms`);
            console.log('📄 [ONU Auth] Output length:', stdout.length);

            // ✅ DECLARACIÓN CORRECTA
            let scriptResult = null;  // ← IMPORTANTE: Declarar AQUÍ

            // Buscar JSON en el output
            const jsonMatches = stdout.match(/\{[\s\S]*?\}(?=\s*(\{|$))/g);

            if (jsonMatches && jsonMatches.length > 0) {
                try {
                    const lastJson = jsonMatches[jsonMatches.length - 1];
                    scriptResult = JSON.parse(lastJson);  // ← Asignar aquí
                    console.log('✅ [ONU Auth] Parsed result:', scriptResult);
                } catch (parseError) {
                    console.error('❌ [ONU Auth] JSON parse failed:', parseError.message);
                }
            }

            // ✅ Usar scriptResult correctamente
            if (!scriptResult && stdout.includes('AUTORIZACIÓN DE ONU TR-069')) {
                console.warn('⚠️ [ONU Auth] No JSON found but script started');

                return res.status(500).json({
                    success: false,
                    error: 'Timeout durante la autorización',
                    message: 'El script tardó demasiado.',
                    code: 'TIMEOUT'
                });
            }

            // Si tenemos resultado exitoso
            if (scriptResult && scriptResult.success) {
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
                    bodyData.board,
                    bodyData.port,
                    0, // slot
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
                        result: scriptResult  // ← Usar scriptResult aquí
                    }
                });
            }

            // Si hay resultado pero es error
            if (scriptResult && !scriptResult.success) {
                return res.status(400).json({
                    success: false,
                    error: scriptResult.error || 'Error en la autorización',
                    message: scriptResult.message || 'Ver detalles',
                    code: scriptResult.code || 'AUTHORIZATION_FAILED',
                    debug: scriptResult
                });
            }

            // Fallback
            return res.status(500).json({
                success: false,
                error: 'Respuesta del script no reconocida',
                code: 'UNKNOWN_RESPONSE',
                debug: {
                    stdout: stdout.substring(0, 1000)
                }
            });

        } catch (execError) {
            const duration = Date.now() - startTime;
            console.error(`❌ [ONU Auth] Execution error:`, execError.message);

            if (execError.killed) {
                return res.status(500).json({
                    success: false,
                    error: 'Timeout ejecutando script',
                    code: 'TIMEOUT'
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
            code: 'INTERNAL_ERROR'
        });
    }
};
```

---

## 🎯 Resumen

### El Problema:
```javascript
// Somewhere in the code...
scriptResult.success  // ❌ "scriptResult is not defined"
```

### La Solución:
```javascript
// At the start of the parsing section
let scriptResult = null;  // ✅ Declare it first

// Then use it
const jsonMatches = stdout.match(/\{[\s\S]*?\}(?=\s*(\{|$))/g);
if (jsonMatches && jsonMatches.length > 0) {
    scriptResult = JSON.parse(jsonMatches[jsonMatches.length - 1]);
}

// Now you can safely use it
if (scriptResult && scriptResult.success) {
    // ...
}
```

---

## ⚡ Acción Requerida

1. **Buscar** todas las referencias a `scriptResult` en el controller
2. **Declarar** la variable con `let scriptResult = null;` al inicio
3. **Verificar** que el nombre sea consistente
4. **Reiniciar** el servidor con `pm2 restart server`
5. **Probar** desde el frontend

---

## 📚 Documentación de Referencia

- **PROMPT_BACKEND_FIX_TIMEOUT_Y_PARSEO.md** - Código completo correcto
- **FIX_WARNING_ONU_EXISTE_COMPLETADO.md** - Fix anterior (ya aplicado)

---

**¿Necesitas que te ayude a encontrar exactamente dónde está el problema en el código?** Puedo revisar el código si me compartes la función completa de `autorizarONUPendiente`. 🚀
