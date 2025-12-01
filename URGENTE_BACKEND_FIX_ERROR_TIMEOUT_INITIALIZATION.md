# 🚨 URGENTE: Fix Error "Cannot access 'timeout' before initialization"

## Error Actual

```
❌ Error en autorizarONUPendiente: ReferenceError: Cannot access 'timeout' before initialization
    at autorizarONUPendiente (/home/wdperezh01/backend/controllers/oltRealtimeController.js:1887:47)
```

**Archivo:** `/home/wdperezh01/backend/controllers/oltRealtimeController.js`
**Línea:** 1887
**Función:** `autorizarONUPendiente`

---

## ¿Qué está pasando?

Este error ocurre cuando intentas **usar una variable antes de declararla** en JavaScript. Es un problema del "Temporal Dead Zone" (TDZ) con `const` o `let`.

### Ejemplo del problema:

```javascript
// ❌ MAL - Esto genera el error
function autorizarONUPendiente() {
    // Intentas usar 'timeout' aquí
    console.log(timeout); // ERROR: Cannot access 'timeout' before initialization

    // Pero lo declaras después
    const timeout = 180000;
}
```

---

## Cómo Encontrar el Problema

En el archivo `/home/wdperezh01/backend/controllers/oltRealtimeController.js`, buscar alrededor de la **línea 1887** dentro de la función `autorizarONUPendiente`.

Buscar:
1. Una variable llamada `timeout`
2. Dónde se está **usando** (antes de la línea 1887)
3. Dónde se está **declarando** (después de donde se usa)

---

## Soluciones

### Solución 1: Mover la declaración ANTES de usarla

```javascript
// ✅ BIEN - Declarar primero
function autorizarONUPendiente() {
    const timeout = 180000; // Declarar primero

    // Ahora sí puedes usarla
    console.log(timeout);
    setTimeout(() => {}, timeout);
}
```

### Solución 2: Si timeout es un parámetro de función

```javascript
// ✅ BIEN - Pasar como parámetro con valor por defecto
function autorizarONUPendiente(timeout = 180000) {
    // Ya puedes usar timeout
    console.log(timeout);
}
```

### Solución 3: Si timeout viene de otro lugar

```javascript
// ✅ BIEN - Importar o definir al inicio del archivo
const DEFAULT_TIMEOUT = 180000;

function autorizarONUPendiente() {
    const timeout = req.body.timeout || DEFAULT_TIMEOUT;
    // Usar timeout...
}
```

---

## Pasos para Corregir

### Paso 1: Abrir el archivo
```bash
nano /home/wdperezh01/backend/controllers/oltRealtimeController.js
```

### Paso 2: Ir a la línea 1887
En nano: `Ctrl + _` luego escribir `1887` y presionar Enter

### Paso 3: Buscar la función `autorizarONUPendiente`

Buscar hacia arriba desde la línea 1887 para encontrar el inicio de la función.

### Paso 4: Identificar el problema

Buscar todas las referencias a `timeout`:
```bash
# En otra terminal
grep -n "timeout" /home/wdperezh01/backend/controllers/oltRealtimeController.js | grep -A5 -B5 "autorizarONUPendiente"
```

### Paso 5: Aplicar la solución

Mover la declaración de `timeout` al **inicio** de la función `autorizarONUPendiente`, antes de cualquier uso.

**Ejemplo de cambio:**

```javascript
// ❌ ANTES (código actual con error)
async function autorizarONUPendiente(req, res) {
    try {
        console.log('🔧 [TR-069] Autorizando ONU...');

        // ... código ...

        // Aquí se usa timeout (línea ~1887)
        const result = await someFunction(timeout); // ❌ ERROR

        // ... más código ...

        // Aquí se declara (después de usarlo)
        const timeout = 180000; // ❌ Muy tarde!

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
}
```

```javascript
// ✅ DESPUÉS (código corregido)
async function autorizarONUPendiente(req, res) {
    try {
        // ✅ Declarar timeout AL INICIO de la función
        const timeout = 180000; // 3 minutos

        console.log('🔧 [TR-069] Autorizando ONU...');

        // ... código ...

        // Ahora sí puedes usar timeout
        const result = await someFunction(timeout); // ✅ OK

        // ... más código ...

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
}
```

---

## Testing

### Test 1: Verificar que el error se corrigió

```bash
# Reiniciar el servidor backend
pm2 restart backend

# Ver los logs
pm2 logs backend --lines 100
```

### Test 2: Probar la autorización desde el frontend

1. Abrir la app móvil
2. Ir a una ONU pendiente
3. Llenar el formulario de autorización
4. Presionar "Autorizar ONU"

**Resultado esperado:**
- ✅ No debe aparecer el error "Cannot access 'timeout' before initialization"
- ✅ La autorización debe proceder normalmente
- ✅ Los logs deben mostrar: "✅ ONU autorizada exitosamente"

---

## Prevención: Buenas Prácticas

Para evitar este error en el futuro:

### 1. Declarar variables al inicio de la función
```javascript
function myFunction() {
    // ✅ Todas las variables al inicio
    const timeout = 180000;
    const maxRetries = 3;
    let result = null;

    // Luego el código que las usa
    // ...
}
```

### 2. Usar constantes globales para timeouts
```javascript
// Al inicio del archivo
const TIMEOUTS = {
    AUTHORIZATION: 180000,  // 3 minutos
    CONNECTION: 30000,      // 30 segundos
    COMMAND: 60000          // 1 minuto
};

function autorizarONUPendiente() {
    const timeout = TIMEOUTS.AUTHORIZATION;
    // ...
}
```

### 3. ESLint para detectar estos errores
```bash
# Instalar ESLint si no lo tienen
npm install eslint --save-dev

# Crear configuración
npx eslint --init

# Ejecutar en el archivo
npx eslint controllers/oltRealtimeController.js
```

---

## Información Adicional del Log

Del log que compartiste, veo que:

✅ **Lo que SÍ funciona:**
- Conexión a la OLT ✅
- Consulta del puerto ✅
- Detección de ONUs existentes ✅
- Auto-asignación de ONT ID ✅
- Validación de parámetros ✅

❌ **Lo que falla:**
- Ejecución de la autorización TR-069 (por el error de timeout)

**Nota importante:** El log muestra:
```
✅ [ONT ID Validation] Auto-asignado ONT ID: 1
📋 [ONT ID Validation] ONT ID final a usar: 1
```

Esto indica que el backend está funcionando bien hasta el momento de ejecutar el comando de autorización, donde falla por el error de `timeout`.

---

## Payload que Está Enviando el Frontend

```json
{
  "address_comment": "Comentarrio de la direccion de la prueba 20",
  "board": 1,
  "download_mbps": 500,
  "download_speed": "500M",
  "gpon_channel": "GPON",
  "name": "Prueba 20",
  "ont_id": 0,
  "onu_external_id": "485754437F6C089D",
  "onu_mode": "Routing",
  "onu_type": "HG8545M",
  "pon_type": "GPON",
  "port": 0,
  "puerto": "0/1/0",
  "sn": "485754437F6C089D",
  "upload_mbps": 500,
  "upload_speed": "500M",
  "use_gps": false,
  "user_vlan_id": 100,
  "zona": "281",
  "zona_nombre": "30 de Mayo"
}
```

Este payload está correcto. El problema no es con los datos enviados, sino con el código del backend.

---

## Comando de Búsqueda Útil

Para encontrar rápidamente dónde está el problema:

```bash
# Buscar la función autorizarONUPendiente
grep -n "autorizarONUPendiente" /home/wdperezh01/backend/controllers/oltRealtimeController.js

# Buscar todas las ocurrencias de 'timeout' en esa función
sed -n '/autorizarONUPendiente/,/^}/p' /home/wdperezh01/backend/controllers/oltRealtimeController.js | grep -n "timeout"

# Ver el contexto alrededor de la línea 1887
sed -n '1877,1897p' /home/wdperezh01/backend/controllers/oltRealtimeController.js
```

---

## Resumen

**Problema:** Variable `timeout` usada antes de ser declarada en `oltRealtimeController.js:1887`

**Solución:** Mover la declaración de `timeout` al **inicio** de la función `autorizarONUPendiente`

**Impacto:** Este error está **bloqueando completamente** la autorización de ONUs

**Prioridad:** 🚨 **CRÍTICA** - Debe corregirse antes de agregar la integración TR-069

---

## Después de Corregir Este Error

Una vez corregido este error, pueden proceder a:
1. Probar que la autorización funciona correctamente
2. Agregar la integración con TR-069 según el documento `MENSAJE_BACKEND_AGREGAR_TR069_A_AUTORIZACION.md`

---

¿Necesitan ayuda adicional para encontrar o corregir el error? 🔧
