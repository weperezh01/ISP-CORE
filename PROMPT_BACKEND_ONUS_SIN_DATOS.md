# 🐛 BUG: ONUs sin Datos en Endpoint de Lista

## Problema Detectado

El endpoint `GET /api/olts/realtime/:oltId/onus` está retornando ONUs con datos vacíos o null:

```json
{
  "id_onu": null,
  "serial": null,
  "estado": "unknown",
  "puerto": "1/1/1",
  "ont_id": "1",
  "mac_address": null,
  "modelo": null,
  "potencia_rx": null,
  "tipo": "authorized",
  "es_pendiente": false
}
```

## Impacto

### En el Frontend

1. **Error de Keys Duplicadas:**
   - Múltiples ONUs con `key: null` causan el warning:
     ```
     Encountered two children with the same key, `null`
     ```

2. **Error al Abrir Detalles:**
   - Al hacer clic en la ONU, el frontend envía `onuId: "onu"` (fallback)
   - El backend retorna **HTTP 400**
   - Usuario no puede ver detalles de la ONU

3. **UX Degradada:**
   - Tarjetas muestran "ONU sin identificar"
   - No se puede distinguir entre diferentes ONUs
   - Datos incompletos confunden al usuario

### Frontend Fix Aplicado

Se implementaron validaciones temporales:
- ✅ keyExtractor con fallbacks múltiples para evitar null keys
- ✅ Validación antes de navegar: bloquea si no hay id_onu ni serial
- ✅ Mensaje de alerta explicando datos incompletos
- ✅ Indicador visual ⚠️ en tarjetas con datos incompletos

## Causa Raíz

El backend está creando registros de ONUs en la respuesta **sin consultar correctamente el OLT**.

### Posibles Causas

#### 1. Parsing Incorrecto de Comando SSH

**Huawei - `display ont info summary all`:**

Si el parsing falla al extraer el serial, podría crear ONUs vacías:

```python
# Parsing incorrecto
def parse_ont_info(line):
    match = re.search(r'(\d+/\d+/\d+)\s+(\d+)\s+(\w+)', line)
    if match:
        port, ont_id, serial = match.groups()
        # Si serial es vacío o no se captura, queda null
        return {
            'puerto': port,
            'ont_id': ont_id,
            'serial': serial if serial else None  # ← Problema
        }
```

**Solución:** Validar que el serial existe antes de crear el objeto ONU.

#### 2. ONUs que Existen en OLT pero sin Serial

Algunos estados de ONUs no tienen serial disponible:

**Huawei:**
```
0/1/1    1    -    offline    -    -
```

El guion (`-`) indica que no hay serial disponible porque la ONU está offline o en estado inicial.

**Solución:** Filtrar estas ONUs o marcarlas explícitamente como "sin datos".

#### 3. Comando OLT Retorna Errores Parciales

Si el OLT retorna errores en medio de la salida:

```
0/1/1    1    48575443ABCD    online    ...
Error: Timeout
0/1/3    3    -    -    -
```

Las líneas después del error podrían parsearse incorrectamente.

**Solución:** Validar cada línea parseada y descartar las que no tengan datos mínimos.

## Solución Requerida

### 1. Validar Datos Mínimos al Parsear

**Script Huawei:**

```python
def parse_ont_info_line(line):
    """Parsear una línea de 'display ont info summary all'"""

    # Regex para Huawei
    pattern = r'(\d+/\d+/\d+)\s+(\d+)\s+([A-F0-9]{16})\s+(\w+)'
    match = re.search(pattern, line)

    if not match:
        # Línea no parseable, ignorar
        return None

    port, ont_id, serial, status = match.groups()

    # Validar que el serial sea válido (no '-' o vacío)
    if not serial or serial == '-' or len(serial) < 10:
        # ONU sin serial válido, ignorar
        return None

    # Crear objeto ONU solo si tiene datos válidos
    return {
        'id_onu': None,  # Se asignará después si existe en BD
        'serial': serial,
        'puerto': port,
        'ont_id': ont_id,
        'estado': normalize_status(status),
        'mac_address': None,  # Requiere consulta individual
        'potencia_rx': None,  # Requiere consulta individual
    }

def get_all_onus(olt_client):
    """Obtener ONUs con validación"""

    output = olt_client.execute_command("display ont info summary all")
    onus = []

    for line in output.split('\n'):
        onu = parse_ont_info_line(line)
        if onu:  # Solo agregar si tiene datos válidos
            onus.append(onu)

    return onus
```

### 2. Logging de ONUs Rechazadas

Para debugging, loggear las ONUs que se descartan:

```python
def parse_ont_info_line(line):
    pattern = r'(\d+/\d+/\d+)\s+(\d+)\s+([A-F0-9-]+)\s+(\w+)'
    match = re.search(pattern, line)

    if not match:
        return None

    port, ont_id, serial, status = match.groups()

    if not serial or serial == '-' or len(serial) < 10:
        # Loggear para debugging
        logging.warning(f"ONU descartada por falta de serial: {port}:{ont_id} - {status}")
        return None

    return { /* ... */ }
```

### 3. Endpoint de Estadísticas

El endpoint de estadísticas debe **excluir** ONUs sin datos:

```javascript
// En el controller
const validOnus = allOnus.filter(onu =>
    onu.serial != null && onu.serial !== '' ||
    onu.id_onu != null
);

return {
    onus: validOnus,  // Solo ONUs con datos válidos
    estadisticas: {
        total: validOnus.length,
        // ...
    }
};
```

## Casos de Prueba

### Caso 1: ONU Offline sin Serial

**Entrada (OLT):**
```
0/1/3    5    -    offline    -
```

**Comportamiento Actual:** Crea ONU con `serial: null`

**Comportamiento Esperado:** **No crear** esta ONU en la lista (o marcarla explícitamente como "sin identificar")

### Caso 2: ONU Online con Serial Válido

**Entrada (OLT):**
```
0/1/1    1    48575443ABCD1234    online    2025-11-15
```

**Comportamiento Actual:** ✅ Funciona correctamente

**Comportamiento Esperado:** ✅ Incluir en la lista

### Caso 3: Línea Malformada

**Entrada (OLT):**
```
Error: Connection timeout
Invalid response
```

**Comportamiento Actual:** Posiblemente crea ONUs vacías

**Comportamiento Esperado:** Ignorar líneas no parseables

## Verificación

Después de implementar el fix:

1. **Consultar el endpoint:**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     https://wellnet-rd.com:444/api/olts/realtime/1/onus
   ```

2. **Verificar que TODAS las ONUs tengan:**
   - `serial != null` O `id_onu != null`
   - Si ambos son null, la ONU **NO debe estar en la lista**

3. **No debe haber warnings en frontend:**
   - No "Encountered two children with the same key"
   - Todas las ONUs deben ser clickeables

## Prioridad

**ALTA** - Las ONUs sin datos causan:
- ❌ Crashes al intentar abrir detalles
- ❌ Warnings de React
- ❌ Confusión del usuario
- ❌ Datos incorrectos en estadísticas

---

**Resumen:** Solo incluir ONUs que tengan al menos un identificador válido (serial o id_onu). ONUs sin estos datos deben ser filtradas o investigadas por qué el OLT las reporta sin información.
