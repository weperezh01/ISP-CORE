# 🐛 BUG: ONUs pendientes de autorización no se detectan

## Problema Reportado

Se conectaron **2 ONUs nuevas** a la OLT Huawei MA5800-X15 esperando autorización, pero el endpoint de estadísticas retorna:

```json
{
  "pending": 0,
  "pending_discovered": 0,
  "pending_new": 0,
  "total": 169
}
```

**Valor esperado:**
```json
{
  "pending": 2,
  "pending_discovered": 2,
  "pending_new": 0,
  "total": 171
}
```

## Causa del Bug

El backend **no está consultando las ONUs sin autorizar** (autofind) en el OLT. Solo está consultando las ONUs ya autorizadas.

Las ONUs nuevas que se conectan a un OLT quedan en estado "discovered" o "autofind" hasta que se les autoriza manualmente. Estas ONUs **NO aparecen** en los comandos normales de consulta de ONUs.

## Solución

### Comando Correcto para Huawei MA5800

Para detectar ONUs pendientes de autorización, usar el comando:

```bash
display ont autofind all
```

### Salida Ejemplo

Cuando hay ONUs sin autorizar:

```
-----------------------------------------------------------------------------
F/S/P   ONT         SN         CtrlFlag    RunState    MatchState   Rssi(dBm)
-----------------------------------------------------------------------------
0/1/3   0           48575443E4C53F46   discover    offline     initial      -18.23
0/1/5   0           48575443F2D89A12   discover    offline     initial      -19.56
-----------------------------------------------------------------------------
```

**Explicación de campos:**
- **F/S/P**: Frame/Slot/Port (puerto donde se detectó la ONU)
- **ONT**: ID temporal (siempre 0 para ONUs sin autorizar)
- **SN**: Serial Number de la ONU (identificador único)
- **CtrlFlag**: Estado de control
  - `discover` = ONU detectada esperando autorización
  - `active` = ONU ya autorizada (no debería aparecer aquí)
- **MatchState**: Estado de coincidencia
  - `initial` = Primera vez detectada
  - `match` = Ya existe en la configuración
- **Rssi(dBm)**: Potencia de señal recibida

### Interpretación

- **Cada línea = 1 ONU pendiente de autorización**
- Si el comando retorna "No ONT need to confirm", entonces `pending = 0`
- Si retorna líneas con `CtrlFlag = discover`, cada una es una ONU pendiente

## Implementación Requerida

### Script Python: `consultar_onus_pendientes.py`

```python
import sys
import json
import re
from olt_ssh_client import HuaweiOLTClient

def parse_autofind_output(output):
    """
    Parsear la salida del comando 'display ont autofind all'
    """
    pending_onus = []

    # Buscar líneas con datos de ONUs
    # Formato: F/S/P   ONT   SN   CtrlFlag   RunState   MatchState   Rssi
    pattern = r'(\d+)/(\d+)/(\d+)\s+(\d+)\s+([A-F0-9]+)\s+(\w+)\s+(\w+)\s+(\w+)\s+([-\d.]+)'

    for line in output.split('\n'):
        match = re.search(pattern, line)
        if match:
            frame, slot, port, ont_id, serial, ctrl_flag, run_state, match_state, rssi = match.groups()

            pending_onus.append({
                'frame': frame,
                'slot': slot,
                'port': port,
                'ont_id': ont_id,
                'serial': serial,
                'ctrl_flag': ctrl_flag.lower(),
                'run_state': run_state.lower(),
                'match_state': match_state.lower(),
                'rssi': rssi,
                'puerto': f"{frame}/{slot}/{port}"
            })

    return pending_onus

def count_pending_categories(pending_onus):
    """
    Categorizar ONUs pendientes
    """
    stats = {
        'pending': len(pending_onus),
        'pending_discovered': 0,
        'pending_new': 0,
        'pending_resync': 0
    }

    for onu in pending_onus:
        ctrl_flag = onu['ctrl_flag']
        match_state = onu['match_state']

        if ctrl_flag == 'discover':
            if match_state == 'initial':
                stats['pending_new'] += 1
            else:
                stats['pending_discovered'] += 1
        elif 'resync' in ctrl_flag or 'config' in ctrl_flag:
            stats['pending_resync'] += 1
        else:
            # Otros casos no clasificados
            stats['pending_discovered'] += 1

    return stats

def main():
    ip = sys.argv[1]
    user = sys.argv[2]
    password = sys.argv[3]

    try:
        client = HuaweiOLTClient(ip, user, password)
        client.connect()

        # Ejecutar comando para obtener ONUs pendientes
        output = client.execute_command("display ont autofind all")

        client.disconnect()

        # Parsear resultado
        pending_onus = parse_autofind_output(output)
        stats = count_pending_categories(pending_onus)

        result = {
            'success': True,
            'pending_onus': pending_onus,
            'statistics': stats,
            'raw_output': output
        }

        print(json.dumps(result))

    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'pending_onus': [],
            'statistics': {
                'pending': 0,
                'pending_discovered': 0,
                'pending_new': 0,
                'pending_resync': 0
            }
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main()
```

### Actualizar endpoint de estadísticas

En el endpoint `GET /api/olts/realtime/:oltId/onus/estadisticas`:

```python
@app.route('/api/olts/realtime/<int:olt_id>/onus/estadisticas', methods=['GET'])
def get_onu_realtime_statistics(olt_id):
    try:
        # 1. Obtener OLT info
        olt = get_olt_from_db(olt_id)

        # 2. Consultar ONUs autorizadas (comando actual que ya funciona)
        authorized_stats = get_authorized_onus_stats(olt)

        # 3. NUEVO: Consultar ONUs pendientes con autofind
        pending_result = subprocess.run([
            'python3',
            'scripts/consultar_onus_pendientes.py',
            olt.ip_address,
            olt.ssh_user,
            olt.ssh_password
        ], capture_output=True, text=True)

        pending_data = json.loads(pending_result.stdout)

        # 4. Combinar estadísticas
        stats = {
            'total': authorized_stats['authorized'] + pending_data['statistics']['pending'],
            'authorized': authorized_stats['authorized'],
            'online': authorized_stats['online'],
            'offline': authorized_stats['offline'],
            'offline_power_fail': authorized_stats['offline_power_fail'],
            'offline_los': authorized_stats['offline_los'],
            'offline_na': authorized_stats['offline_na'],
            'low_signal': authorized_stats['low_signal'],
            'low_signal_warning': authorized_stats['low_signal_warning'],
            'low_signal_critical': authorized_stats['low_signal_critical'],
            # ONUs pendientes
            'pending': pending_data['statistics']['pending'],
            'pending_discovered': pending_data['statistics']['pending_discovered'],
            'pending_new': pending_data['statistics']['pending_new'],
            'pending_resync': pending_data['statistics']['pending_resync']
        }

        return jsonify({
            'success': True,
            'cached': False,
            'data': {
                'estadisticas': stats,
                'timestamp': datetime.now().isoformat(),
                'execution_time_ms': execution_time
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

## Verificación

Después de implementar el fix, cuando conectes 2 ONUs nuevas, el endpoint debería retornar:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://wellnet-rd.com:444/api/olts/realtime/1/onus/estadisticas
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "estadisticas": {
      "total": 171,
      "authorized": 169,
      "pending": 2,
      "pending_discovered": 2,
      "pending_new": 0,
      "online": 164,
      "offline": 5
      // ... resto de stats
    }
  }
}
```

## Para ZTE C320

Comando equivalente:
```bash
show gpon onu uncfg
```

Salida:
```
OnuIndex   Sn                AuthStatus
gpon-onu_1/1/3:1   ZTEGC1234567      config
gpon-onu_1/1/5:1   ZTEGC9876543      config
```

- Cada línea con `AuthStatus = config` es una ONU pendiente

## Nota Importante

Las ONUs pendientes:
- **NO aparecen** en `display ont info summary all`
- **NO cuentan** en los puertos ocupados
- **Solo se ven** con `display ont autofind all`
- **Desaparecen** de autofind una vez autorizadas

Por eso el total debe ser: `authorized + pending`

---

**Resumen:** El backend debe ejecutar el comando `display ont autofind all` para detectar ONUs esperando autorización. Actualmente solo cuenta las ONUs ya autorizadas, por eso `pending` siempre es 0.
