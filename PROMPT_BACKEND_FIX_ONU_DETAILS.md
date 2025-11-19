# 🐛 BUG: Endpoint de detalles de ONU siempre retorna la misma ONU

## Problema Detectado

El endpoint `GET /api/olts/realtime/:oltId/onus/:onuId` está ignorando el parámetro `onuId` y siempre retorna los datos de la misma ONU.

### Evidencia del Bug

Cuando el frontend hace 3 peticiones diferentes con diferentes IDs:

**Petición 1:**
```
GET /api/olts/realtime/1/onus/1?puerto=0/1/0
```
**Respuesta:** `serial: "48575443673429A6"`, `puerto: "0/1/9"`

**Petición 2:**
```
GET /api/olts/realtime/1/onus/2?puerto=0/1/1
```
**Respuesta:** `serial: "48575443673429A6"`, `puerto: "0/1/9"` ← **MISMOS DATOS**

**Petición 3:**
```
GET /api/olts/realtime/1/onus/8?puerto=0/1/1
```
**Respuesta:** `serial: "48575443673429A6"`, `puerto: "0/1/9"` ← **MISMOS DATOS**

## Diagnóstico

El endpoint probablemente está usando valores hardcodeados para testing:
- Siempre consulta el mismo puerto: `0/1/9`
- Siempre consulta el mismo ONT ID: probablemente `0`

## Solución Requerida

El endpoint debe usar dinámicamente el parámetro `puerto` del query string para consultar la ONU correcta en el equipo físico.

### Datos Disponibles en la Petición

El frontend envía estos parámetros:

```typescript
// URL params
:oltId → El ID de la OLT (ej: 1)
:onuId → El ID en base de datos (ej: 1, 2, 8)

// Query params
?puerto=0/1/1 → El puerto/slot/pon donde está la ONU (CRUCIAL)
&ont_id=0     → El ONT ID dentro del puerto (opcional, puede estar undefined)
```

### Flujo Correcto

1. **Extraer el parámetro `puerto` del query string:**
   ```python
   puerto = request.args.get('puerto')  # Ej: "0/1/1"
   ```

2. **Parsear el puerto para obtener frame/slot/port:**
   ```python
   # Para Huawei formato: "frame/slot/port"
   # Ejemplo: "0/1/1" → frame=0, slot=1, port=1

   parts = puerto.split('/')
   frame = parts[0]
   slot = parts[1]
   port = parts[2]
   ```

3. **Obtener el ONT ID:**
   ```python
   ont_id = request.args.get('ont_id')

   # Si no viene en query params, buscar en la lista de ONUs
   # Por ejemplo, del endpoint /api/olts/realtime/:oltId/onus
   # que ya retorna esta info en cada ONU
   ```

4. **Construir el comando correcto para la ONU específica:**
   ```python
   # Huawei MA5800
   comando = f"display ont info {frame} {slot} {port} {ont_id}"

   # En lugar de usar valores hardcodeados como:
   # comando = "display ont info 0 1 9 0"  ← ESTO ESTÁ MAL
   ```

### Ejemplo de Implementación

```python
@app.route('/api/olts/realtime/<int:olt_id>/onus/<int:onu_id>', methods=['GET'])
def get_onu_realtime_details(olt_id, onu_id):
    try:
        # 1. Obtener parámetros del query string
        puerto = request.args.get('puerto')  # Ej: "0/1/1"
        ont_id_param = request.args.get('ont_id')  # Ej: "6"

        if not puerto:
            return jsonify({
                'success': False,
                'error': 'Parámetro puerto es requerido'
            }), 400

        # 2. Obtener info de la OLT desde DB
        olt = get_olt_from_db(olt_id)

        # 3. Parsear el puerto
        frame, slot, port = puerto.split('/')

        # 4. Si no hay ont_id en params, intentar obtenerlo de la DB
        if ont_id_param is None:
            # Buscar en tabla onus o en caché de lista de ONUs
            ont_id_param = get_ont_id_from_db(onu_id)

        # 5. Llamar al script Python de consulta
        result = subprocess.run([
            'python3',
            'scripts/consultar_onu_details.py',
            olt.ip_address,
            olt.ssh_user,
            olt.ssh_password,
            frame,
            slot,
            port,
            str(ont_id_param)
        ], capture_output=True, text=True)

        # 6. Parsear y retornar resultado
        data = json.loads(result.stdout)

        return jsonify({
            'success': True,
            'cached': False,
            'data': data,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

### Script Python Actualizado

El archivo `scripts/consultar_onu_details.py` debe recibir los parámetros dinámicamente:

```python
import sys
import json
from olt_ssh_client import HuaweiOLTClient

def main():
    # Recibir argumentos
    ip = sys.argv[1]
    user = sys.argv[2]
    password = sys.argv[3]
    frame = sys.argv[4]      # ← DINÁMICO, no hardcoded
    slot = sys.argv[5]       # ← DINÁMICO
    port = sys.argv[6]       # ← DINÁMICO
    ont_id = sys.argv[7]     # ← DINÁMICO

    client = HuaweiOLTClient(ip, user, password)
    client.connect()

    # Comando con valores dinámicos
    comando = f"display ont info {frame} {slot} {port} {ont_id}"
    output = client.execute_command(comando)

    # Parsear output y construir JSON
    onu_data = parse_ont_info(output, frame, slot, port, ont_id)

    client.disconnect()

    print(json.dumps(onu_data))

def parse_ont_info(output, frame, slot, port, ont_id):
    """Parsear la salida del comando display ont info"""
    data = {
        'puerto': f"{frame}/{slot}/{port}",
        'ont_id': ont_id,
        'serial': extract_field(output, 'SN'),
        'modelo': extract_field(output, 'Equipment ID'),
        'estado': extract_field(output, 'Run state'),
        'distancia': extract_field(output, 'ONT distance'),
        # ... más campos
    }
    return data

if __name__ == '__main__':
    main()
```

## Verificación

Después de implementar el fix, estas peticiones deben retornar datos diferentes:

```bash
# ONU en puerto 0/1/0, ONT 0
curl "https://wellnet-rd.com:444/api/olts/realtime/1/onus/1?puerto=0/1/0&ont_id=0"

# ONU en puerto 0/1/1, ONT 0
curl "https://wellnet-rd.com:444/api/olts/realtime/1/onus/2?puerto=0/1/1&ont_id=0"

# ONU en puerto 0/1/1, ONT 6
curl "https://wellnet-rd.com:444/api/olts/realtime/1/onus/8?puerto=0/1/1&ont_id=6"
```

Cada una debe retornar el `serial`, `potencia_rx`, `distancia`, etc. de la ONU específica, no siempre los mismos valores.

## Nota Importante

El endpoint `/api/olts/realtime/:oltId/onus` (lista de ONUs) ya está retornando el `puerto` correcto para cada ONU:
- `"puerto": "0/1/0"` para ONU 1
- `"puerto": "0/1/1"` para ONU 2
- `"puerto": "0/1/1"` para ONU 8

Entonces el backend ya tiene esta información. Solo falta usarla en el endpoint de detalles individuales.

---

**Resumen:** El bug está en que el endpoint de detalles ignora los parámetros `puerto` y `ont_id` que envía el frontend, y siempre consulta la misma ONU hardcodeada. Necesita usar estos parámetros dinámicamente para consultar la ONU correcta en el equipo físico.
