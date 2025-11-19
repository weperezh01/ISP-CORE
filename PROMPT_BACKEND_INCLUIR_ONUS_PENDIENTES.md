# Incluir ONUs Pendientes en Endpoint de Lista

## Problema

El endpoint `GET /api/olts/realtime/:oltId/onus` **NO incluye las ONUs pendientes** en su respuesta, aunque el endpoint de estadísticas indica que existen.

### Comportamiento Actual

**Endpoint de estadísticas:**
```json
GET /api/olts/realtime/1/onus/estadisticas
{
  "estadisticas": {
    "total": 171,
    "pending": 2,      // ← Indica que hay 2 ONUs pendientes
    "authorized": 169
  }
}
```

**Endpoint de lista:**
```json
GET /api/olts/realtime/1/onus
{
  "onus": [
    // Solo incluye 169 ONUs autorizadas
    // Las 2 ONUs pendientes NO están aquí ❌
  ],
  "estadisticas": {
    "total": 177  // ← Incluye ONUs de BD, no del OLT
  }
}
```

### Resultado

Cuando el usuario presiona el botón "Pendientes" en el frontend:
1. Frontend filtra la lista buscando ONUs con estado "pending"
2. No encuentra ninguna porque no están en la lista
3. Muestra "0 resultados" aunque las estadísticas digan "2 pendientes"

## Causa

El endpoint de lista solo ejecuta comandos que retornan ONUs **autorizadas**:

**Huawei:**
```bash
display ont info summary all  # Solo ONUs autorizadas
```

**ZTE:**
```bash
show gpon onu state  # Solo ONUs autorizadas
```

Las ONUs pendientes requieren comandos **adicionales**:

**Huawei:**
```bash
display ont autofind all  # ONUs pendientes
```

**ZTE:**
```bash
show gpon onu uncfg  # ONUs pendientes
```

## Solución Requerida

El endpoint `/api/olts/realtime/:oltId/onus` debe incluir **TODAS** las ONUs del OLT, tanto autorizadas como pendientes.

### Implementación

#### 1. Modificar Script de Huawei

**Archivo:** `scripts/consultar_onus_huawei.py` (o similar)

```python
def get_all_onus(olt_client):
    """Obtener TODAS las ONUs: autorizadas + pendientes"""

    # 1. Obtener ONUs autorizadas
    authorized_output = olt_client.execute_command("display ont info summary all")
    authorized_onus = parse_authorized_onus(authorized_output)

    # 2. Obtener ONUs pendientes
    pending_output = olt_client.execute_command("display ont autofind all")
    pending_onus = parse_pending_onus(pending_output)

    # 3. Combinar ambas listas
    all_onus = authorized_onus + pending_onus

    return all_onus

def parse_pending_onus(output):
    """Parsear ONUs pendientes de autofind"""
    pending_list = []

    for line in output.split('\n'):
        # Formato: F/S/P   ONT   SN   CtrlFlag   RunState   MatchState   Rssi
        if 'discover' in line.lower():
            match = re.search(r'(\d+)/(\d+)/(\d+)\s+(\d+)\s+([A-F0-9]+)', line)
            if match:
                frame, slot, port, ont_id, serial = match.groups()

                pending_list.append({
                    'id_onu': None,  # No tiene ID en BD aún
                    'serial': serial,
                    'puerto': f"{frame}/{slot}/{port}",
                    'ont_id': ont_id,
                    'estado': 'pending',  # ← Estado especial para pendientes
                    'descripcion': f'ONU pendiente en {frame}/{slot}/{port}',
                    'mac_address': None,
                    'potencia_rx': extract_rssi(line),
                    'distancia': None,
                    'ultima_conexion': None,
                    # Campos específicos de pendientes
                    'ctrl_flag': 'discover',
                    'match_state': extract_match_state(line),
                    'es_pendiente': True  # Flag para identificar en frontend
                })

    return pending_list
```

#### 2. Modificar Script de ZTE

**Archivo:** `scripts/consultar_onus_zte.py` (o similar)

```python
def get_all_onus_zte(olt_client):
    """Obtener TODAS las ONUs ZTE: autorizadas + pendientes"""

    # 1. Obtener ONUs autorizadas
    authorized_output = olt_client.execute_command("show gpon onu state")
    authorized_onus = parse_zte_authorized(authorized_output)

    # 2. Obtener ONUs pendientes
    pending_output = olt_client.execute_command("show gpon onu uncfg")
    pending_onus = parse_zte_pending(pending_output)

    # 3. Combinar
    all_onus = authorized_onus + pending_onus

    return all_onus

def parse_zte_pending(output):
    """Parsear ONUs pendientes ZTE"""
    pending_list = []

    for line in output.split('\n'):
        # Formato: OnuIndex   Sn   State
        if 'gpon-onu_' in line and 'config' in line:
            match = re.search(r'gpon-onu_(\d+/\d+/\d+):(\d+)\s+([A-Z0-9]+)\s+(\w+)', line)
            if match:
                port, onu_id, serial, state = match.groups()

                pending_list.append({
                    'id_onu': None,
                    'serial': serial,
                    'puerto': port,
                    'ont_id': onu_id,
                    'estado': 'pending',
                    'descripcion': f'ONU pendiente en {port}:{onu_id}',
                    'mac_address': None,
                    'potencia_rx': None,
                    'distancia': None,
                    'ultima_conexion': None,
                    'zte_state': state,
                    'es_pendiente': True
                })

    return pending_list
```

#### 3. Actualizar Controller

**Archivo:** `controllers/oltRealtimeController.js`

```javascript
async function getOnusList(req, res) {
    const { oltId } = req.params;

    try {
        const olt = await getOltFromDB(oltId);

        let allOnus = [];

        if (olt.modelo.includes('Huawei')) {
            // Ejecutar script que obtiene autorizadas + pendientes
            const result = execSync(`python3 scripts/consultar_onus_huawei.py ${olt.ip} ${olt.user} ${olt.pass}`);
            allOnus = JSON.parse(result.toString());
        } else if (olt.modelo.includes('ZTE')) {
            // Ejecutar script que obtiene autorizadas + pendientes
            const result = execSync(`python3 scripts/consultar_onus_zte.py ${olt.ip} ${olt.user} ${olt.pass}`);
            allOnus = JSON.parse(result.toString());
        }

        // Separar para estadísticas
        const authorized = allOnus.filter(o => o.estado !== 'pending').length;
        const pending = allOnus.filter(o => o.estado === 'pending').length;

        return res.json({
            success: true,
            data: {
                onus: allOnus,  // ← Incluye TODAS las ONUs
                estadisticas: {
                    total: allOnus.length,
                    authorized: authorized,
                    pending: pending,
                    online: allOnus.filter(o => o.estado === 'online').length,
                    offline: allOnus.filter(o => o.estado === 'offline').length
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
```

## Respuesta Esperada Después del Fix

```json
GET /api/olts/realtime/1/onus
{
  "success": true,
  "data": {
    "onus": [
      // 169 ONUs autorizadas
      {
        "id_onu": 1,
        "serial": "48575443673429A6",
        "estado": "online",
        "puerto": "0/1/9",
        "es_pendiente": false
      },
      // ... más ONUs autorizadas ...

      // 2 ONUs pendientes ← NUEVO
      {
        "id_onu": null,
        "serial": "48575443ABCD1234",
        "estado": "pending",
        "puerto": "0/1/3",
        "ctrl_flag": "discover",
        "es_pendiente": true
      },
      {
        "id_onu": null,
        "serial": "48575443EFGH5678",
        "estado": "pending",
        "puerto": "0/1/5",
        "ctrl_flag": "discover",
        "es_pendiente": true
      }
    ],
    "estadisticas": {
      "total": 171,        // 169 + 2
      "authorized": 169,
      "pending": 2,
      "online": 164,
      "offline": 5
    }
  }
}
```

## Beneficios

1. **Consistencia:** Frontend puede filtrar y mostrar ONUs pendientes
2. **Completitud:** La lista refleja TODAS las ONUs del OLT físico
3. **UX:** Usuario puede ver las ONUs pendientes sin acceder a la consola del OLT
4. **Funcionalidad futura:** Permitirá implementar autorización de ONUs desde la app

## Testing

Después de implementar:

1. Conectar 1-2 ONUs nuevas al OLT (sin autorizar)
2. Llamar al endpoint de lista
3. Verificar que las ONUs pendientes aparezcan en el array con `estado: "pending"`
4. En el frontend, presionar el botón "Pendientes" debería mostrar esas ONUs

## Prioridad

**MEDIA-ALTA** - Actualmente el frontend muestra un mensaje explicativo, pero es fundamental poder ver y gestionar las ONUs pendientes desde la aplicación.

---

**Nota:** Las ONUs pendientes deben tener `id_onu: null` ya que no tienen registro en la base de datos hasta que se autoricen. El frontend ya está preparado para manejar este caso usando el serial como key alternativo.
