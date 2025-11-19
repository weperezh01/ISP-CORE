# 🔢 Endpoint: Obtener ONT IDs Disponibles por Puerto

## Descripción

Endpoint para obtener los ONT IDs disponibles (libres) en un puerto PON específico. Esto permite al usuario saber qué IDs puede usar al autorizar una nueva ONU sin causar conflictos.

## Endpoint

```
GET /api/olts/realtime/:id_olt/ports/:puerto/available-ont-ids
```

### Parámetros de URL

- `id_olt` (required): ID de la OLT en la base de datos
- `puerto` (required): Puerto PON en formato URL-encoded
  - Huawei: `0/1/5` → `0%2F1%2F5`
  - ZTE: `1/1/5` → `1%2F1%2F5`

### Query Parameters (Opcional)

- `limit`: Número máximo de IDs a retornar (default: 10)
- `suggest_next`: Si es `true`, retorna el próximo ID disponible (default: true)

## Respuesta

### Success Response

```json
{
  "success": true,
  "data": {
    "puerto": "0/1/5",
    "total_capacity": 128,
    "occupied_count": 15,
    "available_count": 113,
    "next_available": 16,
    "available_ids": [16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    "occupied_ids": [1, 2, 3, 5, 8, 10, 11, 12, 13, 14, 15, 16, 50, 60, 100]
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Puerto no encontrado o formato inválido",
  "code": "INVALID_PORT"
}
```

## Implementación por Modelo de OLT

### Huawei MA5800-X15

#### Comando SSH

```bash
# Obtener todas las ONUs autorizadas en un puerto
display ont info 5 all

# Formato de salida:
# F/S/P   ONT-ID  ...
# 0/1/5   1       ...
# 0/1/5   2       ...
# 0/1/5   3       ...
```

#### Script Python

```python
def obtener_ont_ids_disponibles_huawei(olt_client, puerto):
    """
    Obtener ONT IDs disponibles en un puerto Huawei

    Args:
        olt_client: Cliente SSH conectado
        puerto: Puerto PON (ej: "0/1/5")

    Returns:
        dict: Información de IDs disponibles
    """

    try:
        # Parsear puerto
        parts = puerto.split('/')
        if len(parts) != 3:
            raise ValueError(f"Formato de puerto inválido: {puerto}")

        frame, slot, port = parts

        # Obtener información de ONUs en el puerto
        command = f"display ont info {port} all"
        output = olt_client.send_command(command)

        # Parsear ONT IDs ocupados
        occupied_ids = set()
        for line in output.split('\n'):
            # Buscar líneas con formato: 0/1/5   <ont-id>   ...
            match = re.search(rf'{frame}/{slot}/{port}\s+(\d+)\s+', line)
            if match:
                ont_id = int(match.group(1))
                occupied_ids.add(ont_id)

        # Huawei soporta ONT IDs de 0 a 127 (128 total)
        total_capacity = 128
        all_ids = set(range(0, total_capacity))
        available_ids = sorted(all_ids - occupied_ids)

        # Encontrar el próximo disponible
        next_available = available_ids[0] if available_ids else None

        return {
            'success': True,
            'puerto': puerto,
            'total_capacity': total_capacity,
            'occupied_count': len(occupied_ids),
            'available_count': len(available_ids),
            'next_available': next_available,
            'available_ids': available_ids[:20],  # Primeros 20
            'occupied_ids': sorted(list(occupied_ids))
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
```

### ZTE C320

#### Comando SSH

```bash
# Obtener ONUs autorizadas en un puerto
show gpon onu state gpon-olt_1/1/5

# Formato de salida:
# OnuIndex        FSM         ...
# gpon-onu_1/1/5:1    working     ...
# gpon-onu_1/1/5:2    working     ...
# gpon-onu_1/1/5:5    dyinggasp   ...
```

#### Script Python

```python
def obtener_ont_ids_disponibles_zte(olt_client, puerto):
    """
    Obtener ONT IDs disponibles en un puerto ZTE

    Args:
        olt_client: Cliente SSH conectado
        puerto: Puerto PON (ej: "1/1/5")

    Returns:
        dict: Información de IDs disponibles
    """

    try:
        # Obtener información de ONUs en el puerto
        command = f"show gpon onu state gpon-olt_{puerto}"
        output = olt_client.send_command(command)

        # Parsear ONT IDs ocupados
        occupied_ids = set()
        for line in output.split('\n'):
            # Buscar líneas con formato: gpon-onu_1/1/5:<ont-id>
            match = re.search(rf'gpon-onu_{re.escape(puerto)}:(\d+)', line)
            if match:
                ont_id = int(match.group(1))
                occupied_ids.add(ont_id)

        # ZTE soporta ONT IDs de 1 a 128 (128 total)
        total_capacity = 128
        all_ids = set(range(1, total_capacity + 1))
        available_ids = sorted(all_ids - occupied_ids)

        # Encontrar el próximo disponible
        next_available = available_ids[0] if available_ids else None

        return {
            'success': True,
            'puerto': puerto,
            'total_capacity': total_capacity,
            'occupied_count': len(occupied_ids),
            'available_count': len(available_ids),
            'next_available': next_available,
            'available_ids': available_ids[:20],  # Primeros 20
            'occupied_ids': sorted(list(occupied_ids))
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
```

## Controller Implementation

```javascript
// controllers/oltRealtimeController.js

async function getAvailableOntIds(req, res) {
    const { id_olt, puerto } = req.params;
    const { limit = 10, suggest_next = 'true' } = req.query;

    try {
        // 1. Obtener datos de la OLT
        const olt = await getOltFromDB(id_olt);

        if (!olt) {
            return res.status(404).json({
                success: false,
                message: 'OLT no encontrada',
                code: 'OLT_NOT_FOUND'
            });
        }

        // 2. Conectar a la OLT
        const olt_client = await connectToOLT(olt.ip_olt, olt.usuario_ssh, olt.password_ssh);

        // 3. Obtener IDs disponibles según modelo
        let result;
        if (olt.modelo.includes('Huawei')) {
            result = await obtenerOntIdsDisponiblesHuawei(olt_client, puerto);
        } else if (olt.modelo.includes('ZTE')) {
            result = await obtenerOntIdsDisponiblesZTE(olt_client, puerto);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Modelo de OLT no soportado',
                code: 'UNSUPPORTED_MODEL'
            });
        }

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Error consultando IDs disponibles',
                error: result.error,
                code: 'QUERY_FAILED'
            });
        }

        // 4. Aplicar límite si se especificó
        const limitNum = parseInt(limit);
        const limitedAvailableIds = result.available_ids.slice(0, limitNum);

        // 5. Retornar resultado
        return res.json({
            success: true,
            data: {
                puerto: result.puerto,
                total_capacity: result.total_capacity,
                occupied_count: result.occupied_count,
                available_count: result.available_count,
                next_available: suggest_next === 'true' ? result.next_available : undefined,
                available_ids: limitedAvailableIds,
                occupied_ids: result.occupied_ids
            }
        });

    } catch (error) {
        console.error('Error obteniendo ONT IDs disponibles:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

// Registrar ruta
router.get('/olts/realtime/:id_olt/ports/:puerto/available-ont-ids', getAvailableOntIds);
```

## Casos de Uso en Frontend

### 1. Sugerencia Automática

Cuando el usuario escribe el puerto, automáticamente obtener el próximo ID disponible:

```javascript
const handlePortChange = async (puerto) => {
    setAuthForm({...authForm, puerto});

    if (!puerto || puerto.length < 5) return;

    try {
        const encodedPort = encodeURIComponent(puerto);
        const response = await fetch(
            `https://wellnet-rd.com:444/api/olts/realtime/${oltId}/ports/${encodedPort}/available-ont-ids?limit=5`,
            {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }
        );

        const data = await response.json();

        if (data.success && data.data.next_available) {
            // Sugerir automáticamente el próximo ID disponible
            setAuthForm(prev => ({
                ...prev,
                ont_id: String(data.data.next_available)
            }));

            // Mostrar IDs disponibles al usuario
            setAvailableIds(data.data.available_ids);
        }
    } catch (error) {
        console.error('Error obteniendo IDs disponibles:', error);
    }
};
```

### 2. Mostrar IDs Disponibles

```javascript
{availableIds.length > 0 && (
    <View style={styles.availableIdsBox}>
        <Text style={styles.availableIdsLabel}>IDs Disponibles:</Text>
        <Text style={styles.availableIdsText}>
            {availableIds.join(', ')}
        </Text>
        <Text style={styles.availableIdsHint}>
            Próximo sugerido: {availableIds[0]}
        </Text>
    </View>
)}
```

### 3. Validación antes de Autorizar

```javascript
const validateOntId = async () => {
    const response = await fetch(
        `https://wellnet-rd.com:444/api/olts/realtime/${oltId}/ports/${encodedPort}/available-ont-ids`,
        { headers: { 'Authorization': `Bearer ${authToken}` } }
    );

    const data = await response.json();

    if (!data.data.available_ids.includes(parseInt(authForm.ont_id))) {
        Alert.alert(
            'ONT ID No Disponible',
            `El ID ${authForm.ont_id} ya está ocupado en el puerto ${authForm.puerto}.\n\n` +
            `IDs disponibles: ${data.data.available_ids.slice(0, 5).join(', ')}...`
        );
        return false;
    }

    return true;
};
```

## Testing

### Test 1: Puerto con Espacio Disponible

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://wellnet-rd.com:444/api/olts/realtime/1/ports/0%2F1%2F5/available-ont-ids?limit=10"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "puerto": "0/1/5",
    "total_capacity": 128,
    "occupied_count": 15,
    "available_count": 113,
    "next_available": 16,
    "available_ids": [16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
  }
}
```

### Test 2: Puerto Completamente Lleno

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://wellnet-rd.com:444/api/olts/realtime/1/ports/0%2F1%2F1/available-ont-ids"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "puerto": "0/1/1",
    "total_capacity": 128,
    "occupied_count": 128,
    "available_count": 0,
    "next_available": null,
    "available_ids": []
  }
}
```

### Test 3: Puerto Vacío

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://wellnet-rd.com:444/api/olts/realtime/2/ports/1%2F1%2F10/available-ont-ids?limit=5"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "puerto": "1/1/10",
    "total_capacity": 128,
    "occupied_count": 0,
    "available_count": 128,
    "next_available": 1,
    "available_ids": [1, 2, 3, 4, 5]
  }
}
```

## Consideraciones de Performance

### Caching

Cachear los resultados por 30 segundos ya que los IDs no cambian tan frecuentemente:

```javascript
const cache = {};
const CACHE_TTL = 30000; // 30 segundos

function getCachedOntIds(cacheKey) {
    const cached = cache[cacheKey];
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedOntIds(cacheKey, data) {
    cache[cacheKey] = {
        data: data,
        timestamp: Date.now()
    };
}
```

### Rate Limiting

Limitar consultas al mismo puerto a 1 vez cada 5 segundos para evitar sobrecarga:

```javascript
const rateLimiter = {};

function isRateLimited(key) {
    const lastCall = rateLimiter[key];
    if (lastCall && (Date.now() - lastCall) < 5000) {
        return true;
    }
    rateLimiter[key] = Date.now();
    return false;
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `OLT_NOT_FOUND` | OLT no existe en base de datos |
| `INVALID_PORT` | Formato de puerto inválido |
| `UNSUPPORTED_MODEL` | Modelo de OLT no soportado |
| `QUERY_FAILED` | Error ejecutando comando SSH |
| `OLT_UNREACHABLE` | No se puede conectar a la OLT |

---

**Prioridad**: Alta
**Tiempo Estimado**: 1-2 horas
**Dependencia**: Ninguna (puede implementarse independientemente)
**Beneficio**: Evita conflictos de ONT ID y mejora UX significativamente
