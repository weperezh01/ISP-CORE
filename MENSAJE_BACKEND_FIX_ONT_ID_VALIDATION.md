# 🔴 CRÍTICO: Fix Validación de ONT ID - Consultar OLT Real

**Fecha:** 2025-11-17
**Prioridad:** CRÍTICA
**Problema:** Validación de ONT ID usando BD en lugar de consultar OLT real

---

## 📨 Para: Claude del Backend

Hola, hemos detectado un problema **crítico de arquitectura** en la validación de ONT IDs durante la autorización de ONUs.

---

## 🚨 Problema Actual

### Error Reportado

```json
{
  "code": "ONT_ID_IN_USE",
  "error": "El ONT ID 0 ya está siendo usado en el puerto 0/1/0",
  "message": "El ONT ID 0 ya está siendo usado en el puerto 0/1/0",
  "conflict_with": {
    "name": "Prueba 2",
    "onu_id": 1,
    "serial": "485754437F6C089D"
  }
}
```

### Flujo Actual (Incorrecto)

```
1. Usuario intenta autorizar ONU con ONT ID 0 en puerto 0/1/0
2. Backend verifica tabla `onus_autorizadas` en la BD
3. Backend encuentra registro con ONT ID 0
4. Backend retorna error "ONT_ID_IN_USE"
5. ❌ Backend NUNCA consulta la OLT real
```

### ¿Por Qué Esto es Incorrecto?

**La OLT es la fuente de verdad, NO la base de datos del backend.**

Escenarios donde la validación actual falla:

#### Escenario 1: ONU Eliminada de la OLT
```
1. Backend autorizó ONU con ONT ID 0 → guardó en BD
2. Técnico eliminó esa ONU directamente desde la OLT
3. ONT ID 0 ahora está LIBRE en la OLT
4. ❌ Backend sigue diciendo "ONT ID 0 en uso" (según la BD)
5. ❌ No permite autorizar nueva ONU aunque el ONT ID está libre
```

#### Escenario 2: ONU Desconectada
```
1. Backend autorizó ONU con ONT ID 0 → guardó en BD
2. Cliente canceló servicio, ONU desconectada físicamente
3. ONT ID 0 está libre para reutilizar
4. ❌ Backend sigue bloqueando el ONT ID 0
```

#### Escenario 3: Movimiento de Puerto
```
1. Backend autorizó ONU con ONT ID 0 en puerto 0/1/0
2. Técnico movió la ONU al puerto 0/1/1 desde la OLT
3. ONT ID 0 en puerto 0/1/0 ahora está libre
4. ❌ Backend sigue bloqueando ONT ID 0 en puerto 0/1/0
```

#### Escenario 4: Configuración Manual en OLT
```
1. Técnico autorizó ONUs manualmente en la OLT (sin usar el sistema)
2. Backend no tiene registro de esas ONUs en su BD
3. Usuario intenta autorizar ONU con ONT ID que ya existe en OLT
4. ✅ Backend permite (porque no está en BD)
5. ❌ Script falla al ejecutar en OLT (conflicto real)
```

---

## ✅ Solución Correcta

### Principio Fundamental

**🏢 La OLT es la ÚNICA fuente de verdad para el estado de las ONUs.**

La base de datos del backend es solo un **registro histórico** para reporting/análisis, NO para validación de disponibilidad.

### Flujo Correcto

```
1. Usuario intenta autorizar ONU con ONT ID X en puerto Y
2. Backend consulta la OLT REAL: "¿ONT ID X está en uso en puerto Y?"
3. OLT responde con lista de ONT IDs activos en ese puerto
4. Si ONT ID X está libre en la OLT → ✅ Permitir autorización
5. Si ONT ID X está ocupado en la OLT → ❌ Rechazar con error
```

---

## 🔧 Implementación Requerida

### Cambio 1: Consultar OLT en Lugar de BD

**Archivo:** `controllers/oltRealtimeController.js` - Función `autorizarONUPendiente`

**ANTES (Incorrecto):**
```javascript
// ❌ Verificar en la base de datos
const [existingOnus] = await db.query(`
    SELECT * FROM onus_autorizadas
    WHERE olt_id = ?
    AND puerto = ?
    AND ont_id = ?
`, [oltId, puerto, ontId]);

if (existingOnus.length > 0) {
    return res.status(409).json({
        success: false,
        error: 'ONT ID ya está en uso',
        message: `El ONT ID ${ontId} ya está siendo usado en el puerto ${puerto}`,
        code: 'ONT_ID_IN_USE',
        conflict_with: existingOnus[0]
    });
}
```

**DESPUÉS (Correcto):**
```javascript
// ✅ Consultar la OLT REAL
const onusEnPuerto = await consultarOnusEnPuerto(oltId, puerto);

// Verificar si el ONT ID está realmente en uso EN LA OLT
const ontIdEnUso = onusEnPuerto.find(onu => onu.ont_id === ontId);

if (ontIdEnUso) {
    return res.status(409).json({
        success: false,
        error: 'ONT ID ya está en uso en la OLT',
        message: `El ONT ID ${ontId} ya está siendo usado en el puerto ${puerto}`,
        code: 'ONT_ID_IN_USE',
        conflict_with: {
            ont_id: ontIdEnUso.ont_id,
            serial: ontIdEnUso.serial,
            estado: ontIdEnUso.estado,
            source: 'OLT_REAL'  // Indicar que viene de la OLT real
        }
    });
}

// ONT ID libre en la OLT → continuar con la autorización
```

### Cambio 2: Función para Consultar ONUs en Puerto

**Nueva función requerida:**

```javascript
/**
 * Consulta las ONUs activas en un puerto específico de la OLT REAL
 * @param {number} oltId - ID del OLT
 * @param {string} puerto - Puerto en formato "0/1/0"
 * @returns {Array} Lista de ONUs en ese puerto con sus ONT IDs
 */
async function consultarOnusEnPuerto(oltId, puerto) {
    try {
        // Obtener info del OLT
        const [olts] = await db.query('SELECT * FROM olts WHERE id = ?', [oltId]);
        if (!olts.length) {
            throw new Error('OLT no encontrado');
        }

        const olt = olts[0];
        const oltType = olt.olt_type?.toLowerCase() || 'huawei';

        // Construir comando para consultar ONUs en el puerto
        const scriptPath = path.join(__dirname, '../scripts/consultar_onus_puerto.py');

        const command = [
            'python3',
            `"${scriptPath}"`,
            '--olt-type', oltType,
            '--puerto', `"${puerto}"`
        ];

        const { stdout, stderr } = await execPromise(command.join(' '), {
            timeout: 30000,
            maxBuffer: 1024 * 1024 * 10
        });

        // Parsear respuesta JSON del script
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No se pudo parsear respuesta del script');
        }

        const result = JSON.parse(jsonMatch[0]);

        if (!result.success) {
            throw new Error(result.error || 'Error consultando ONUs en puerto');
        }

        // Retornar lista de ONUs
        return result.onus || [];

    } catch (error) {
        console.error('❌ [Consulta Puerto] Error:', error);

        // En caso de error, retornar array vacío para no bloquear
        // (mejor permitir que el script de autorización maneje el error)
        return [];
    }
}
```

### Cambio 3: Script Python para Consultar ONUs en Puerto

**Nuevo archivo:** `scripts/consultar_onus_puerto.py`

```python
#!/usr/bin/env python3
"""
Script para consultar ONUs activas en un puerto específico de la OLT
Retorna lista de ONT IDs en uso para validación
"""

import argparse
import json
import sys
import subprocess
import os

def consultar_onus_huawei(puerto):
    """Consulta ONUs en puerto para OLT Huawei"""
    try:
        # Ejecutar script Expect para consultar el puerto
        script_path = os.path.join(os.path.dirname(__file__), 'huawei-consultar-puerto.exp')

        result = subprocess.run(
            ['expect', script_path, puerto],
            capture_output=True,
            text=True,
            timeout=30
        )

        output = result.stdout

        # Parsear output del OLT
        # Ejemplo de output:
        # ONT-ID: 0  SN: 48575443439B989D  Estado: online
        # ONT-ID: 1  SN: 48575443439B989E  Estado: offline

        onus = []
        for line in output.split('\n'):
            if 'ONT-ID:' in line:
                parts = line.split()
                ont_id = int(parts[1])
                serial = parts[3] if len(parts) > 3 else None
                estado = parts[5] if len(parts) > 5 else None

                onus.append({
                    'ont_id': ont_id,
                    'serial': serial,
                    'estado': estado
                })

        return {
            'success': True,
            'puerto': puerto,
            'total_onus': len(onus),
            'onus': onus
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'puerto': puerto,
            'onus': []
        }

def consultar_onus_zte(puerto):
    """Consulta ONUs en puerto para OLT ZTE"""
    # Similar a Huawei pero con comandos ZTE
    pass

def main():
    parser = argparse.ArgumentParser(description='Consultar ONUs en puerto')
    parser.add_argument('--olt-type', required=True, choices=['huawei', 'zte'])
    parser.add_argument('--puerto', required=True, help='Puerto PON: 0/1/0')

    args = parser.parse_args()

    if args.olt_type == 'huawei':
        result = consultar_onus_huawei(args.puerto)
    elif args.olt_type == 'zte':
        result = consultar_onus_zte(args.puerto)
    else:
        result = {
            'success': False,
            'error': f'Tipo de OLT no soportado: {args.olt_type}',
            'onus': []
        }

    print(json.dumps(result))

if __name__ == '__main__':
    main()
```

### Cambio 4: Script Expect para Huawei

**Nuevo archivo:** `scripts/huawei-consultar-puerto.exp`

```tcl
#!/usr/bin/expect -f

# Parámetros
set puerto [lindex $argv 0]

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
    # Consultar ONUs en el puerto
    send "display ont info $puerto all\r"
}

expect {
    "(config)#" {
        # Capturar output
        puts $expect_out(buffer)
        send "quit\r"
    }
    timeout { puts "ERROR: Timeout consultando puerto"; exit 1 }
}

expect "#" { send "quit\r" }
expect eof
```

---

## 🎯 Mejora Adicional: Auto-Asignar ONT ID

En lugar de rechazar cuando el ONT ID está en uso, el backend podría **auto-asignar** el siguiente ONT ID disponible:

```javascript
// Si el usuario envía ont_id: 0 (auto-asignar)
let ontIdFinal = bodyData.ont_id;

if (ontIdFinal === 0) {
    // Consultar ONUs en el puerto
    const onusEnPuerto = await consultarOnusEnPuerto(oltId, puerto);

    // Encontrar el siguiente ONT ID disponible
    const ontIdsEnUso = onusEnPuerto.map(onu => onu.ont_id);

    for (let i = 0; i < 128; i++) {  // Máximo 128 ONUs por puerto
        if (!ontIdsEnUso.includes(i)) {
            ontIdFinal = i;
            console.log(`✅ [ONU Auth] Auto-asignado ONT ID: ${i}`);
            break;
        }
    }

    if (ontIdFinal === 0 && ontIdsEnUso.includes(0)) {
        return res.status(409).json({
            success: false,
            error: 'No hay ONT IDs disponibles en este puerto',
            code: 'NO_ONT_IDS_AVAILABLE'
        });
    }
}
```

---

## 📊 Flujo Correcto Completo

```
1. Usuario intenta autorizar ONU
   - Payload: { ont_id: 0, puerto: "0/1/0", ... }

2. Backend valida parámetros básicos
   ✅ Puerto válido
   ✅ Serial correcto
   ✅ VLAN existe

3. Backend consulta OLT REAL
   → python3 consultar_onus_puerto.py --olt-type huawei --puerto "0/1/0"
   → OLT responde: ONT IDs en uso: [0, 1, 5, 10]

4. Backend valida ONT ID
   - Si ont_id === 0 → Auto-asignar siguiente disponible (ej: 2)
   - Si ont_id !== 0 y está en uso → Rechazar
   - Si ont_id !== 0 y está libre → Continuar

5. Backend ejecuta script de autorización
   → python3 autorizar_onu_tr069.py ... --ont-id 2

6. Backend guarda en BD (registro histórico)
   → INSERT INTO onus_autorizadas (ont_id, puerto, ...)

7. Backend retorna éxito
   → { success: true, ont_id: 2, ... }
```

---

## 🔍 Sincronización de BD (Opcional pero Recomendado)

Para mantener la BD actualizada, puedes implementar:

### Opción 1: Sincronización Periódica
```javascript
// Ejecutar cada 5 minutos
setInterval(async () => {
    await sincronizarOnusConOLT();
}, 5 * 60 * 1000);

async function sincronizarOnusConOLT() {
    // Para cada OLT
    const olts = await db.query('SELECT id FROM olts');

    for (const olt of olts) {
        // Consultar todas las ONUs de la OLT
        const onusReales = await consultarTodasOnusOLT(olt.id);

        // Actualizar tabla onus_autorizadas
        // - Marcar como "offline" las que ya no existen en OLT
        // - Agregar las que existen en OLT pero no en BD
    }
}
```

### Opción 2: Invalidación al Eliminar
```javascript
// Cuando se elimina una ONU desde el sistema
exports.eliminarONU = async (req, res) => {
    // 1. Eliminar de la OLT
    await ejecutarScriptEliminarONU(...);

    // 2. Actualizar BD (marcar como eliminada, NO borrar registro)
    await db.query(`
        UPDATE onus_autorizadas
        SET estado = 'eliminada', fecha_eliminacion = NOW()
        WHERE olt_id = ? AND ont_id = ? AND puerto = ?
    `, [oltId, ontId, puerto]);
};
```

---

## ✅ Checklist de Implementación

### Archivos Nuevos
- [ ] `scripts/consultar_onus_puerto.py` - Script Python para consultar ONUs
- [ ] `scripts/huawei-consultar-puerto.exp` - Script Expect para Huawei
- [ ] `scripts/zte-consultar-puerto.exp` - Script Expect para ZTE (si aplica)

### Archivos Modificados
- [ ] `controllers/oltRealtimeController.js`
  - [ ] Agregar función `consultarOnusEnPuerto()`
  - [ ] Modificar validación de ONT ID en `autorizarONUPendiente()`
  - [ ] Implementar auto-asignación de ONT ID
  - [ ] Retornar ONT ID final asignado en la respuesta

### Testing
- [ ] Probar con ONT ID que existe en OLT → Debe rechazar
- [ ] Probar con ONT ID libre en OLT pero ocupado en BD → Debe permitir
- [ ] Probar con ont_id: 0 (auto-asignar) → Debe asignar siguiente disponible
- [ ] Verificar que el script de consulta funciona correctamente
- [ ] Reiniciar servidor: `pm2 restart server`

---

## 🎯 Resultado Esperado

### Antes del Fix
```
Usuario: Autoriza ONU con ONT ID 0
Backend: ❌ "ONT ID 0 ya en uso" (según BD)
OLT Real: ONT ID 0 está LIBRE
Resultado: ❌ No puede autorizar aunque está libre
```

### Después del Fix
```
Usuario: Autoriza ONU con ONT ID 0
Backend: Consulta OLT real
OLT Real: ONT ID 0 está LIBRE
Backend: ✅ Permite autorización
Resultado: ✅ ONU autorizada correctamente
```

### Con Auto-Asignación
```
Usuario: Autoriza ONU con ont_id: 0 (auto)
Backend: Consulta OLT → ONT IDs en uso: [0, 1, 5]
Backend: Auto-asigna ONT ID 2 (siguiente disponible)
OLT: ✅ Autoriza con ONT ID 2
Backend: Retorna { success: true, ont_id: 2 }
Frontend: Muestra "ONU autorizada con ONT ID 2"
```

---

## 📞 Prioridad

**CRÍTICA** - Este problema bloquea completamente la autorización de ONUs en puertos donde hubo autorizaciones previas.

---

**Este fix es fundamental para que el sistema funcione correctamente en producción.** 🚀

La OLT debe ser la única fuente de verdad para validaciones de disponibilidad.
