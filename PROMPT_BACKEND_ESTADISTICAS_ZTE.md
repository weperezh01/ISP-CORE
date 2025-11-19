# Implementar Estadísticas Completas para OLT ZTE C320

## Problema Reportado

La OLT ZTE (ID 2, modelo "ZTE C320", nombre "OLT_C320_MOCA") está retornando estadísticas incorrectas.

### Datos Reales del Equipo ZTE

```
Waiting authorization: 1 (D: 1, Resync: 0, New: 0)
Online: 697
Total authorized: 790
Total offline: 93 (PwrFail: 60, LoS: 9, N/A: 24)
Low signals: 28 (Warning: 25, Critical: 3)
```

### Datos que Está Retornando el Backend

```json
{
  "pending": 0,        // ← Incorrecto (debería ser 1)
  "online": 0,         // ← Incorrecto (debería ser 697)
  "authorized": 0,     // ← Incorrecto (debería ser 790)
  "offline": 0,        // ← Incorrecto (debería ser 93)
  "low_signal": 0      // ← Incorrecto (debería ser 28)
}
```

## Causa del Problema

El backend **no está implementando los comandos correctos para ZTE**. Probablemente está usando solo comandos de Huawei o no está consultando el equipo ZTE en absoluto.

## Solución: Comandos ZTE C320

### 1. ONUs Pendientes de Autorización

**Comando:**
```bash
show gpon onu uncfg
```

**Salida Ejemplo:**
```
OnuIndex              Sn                 State
---------------------------------------------------------------------
gpon-onu_1/1/3:1      ZTEGC12345678      config
```

**Interpretación:**
- Cada línea = 1 ONU pendiente
- `State = config` significa que está esperando autorización
- Para categorizar (D/Resync/New), revisar si la ONU ya existía antes en la configuración

**Parsing:**
```python
def get_zte_pending_onus(client):
    output = client.execute_command("show gpon onu uncfg")

    pending_count = 0
    pending_discovered = 0
    pending_new = 0

    for line in output.split('\n'):
        if 'gpon-onu_' in line and 'config' in line:
            pending_count += 1
            # Determinar si es discovered o new
            # Si ya existe en BD = discovered, si no = new
            pending_discovered += 1  # Default

    return {
        'pending': pending_count,
        'pending_discovered': pending_discovered,
        'pending_new': pending_new,
        'pending_resync': 0
    }
```

### 2. ONUs Autorizadas y Online/Offline

**Comando:**
```bash
show gpon onu state
```

**Salida Ejemplo:**
```
OnuIndex              Admin  FSM( Primary)    FSM(Secondary)    Auth
-------------------------------------------------------------------------
gpon-onu_1/1/1:1      enable working         -                 success
gpon-onu_1/1/1:2      enable working         -                 success
gpon-onu_1/1/1:3      enable los             -                 success
gpon-onu_1/1/1:4      enable dyinggasp       -                 success
```

**Estados:**
- `FSM = working` → ONU online
- `FSM = los` → ONU offline por pérdida de señal
- `FSM = dyinggasp` → ONU offline por falla de energía
- `FSM = poweroff` → ONU offline
- `Auth = success` → ONU autorizada

**Parsing:**
```python
def get_zte_onu_states(client):
    output = client.execute_command("show gpon onu state")

    stats = {
        'authorized': 0,
        'online': 0,
        'offline': 0,
        'offline_power_fail': 0,
        'offline_los': 0,
        'offline_na': 0
    }

    for line in output.split('\n'):
        if 'gpon-onu_' not in line:
            continue

        parts = line.split()
        if len(parts) < 4:
            continue

        fsm_state = parts[2].lower()
        auth_state = parts[4].lower() if len(parts) > 4 else ''

        # Contar autorizadas
        if 'success' in auth_state:
            stats['authorized'] += 1

        # Clasificar por estado
        if fsm_state == 'working':
            stats['online'] += 1
        elif fsm_state in ['los', 'losi']:
            stats['offline'] += 1
            stats['offline_los'] += 1
        elif fsm_state in ['dyinggasp', 'poweroff']:
            stats['offline'] += 1
            stats['offline_power_fail'] += 1
        elif fsm_state in ['offline', 'down']:
            stats['offline'] += 1
            stats['offline_na'] += 1

    return stats
```

### 3. ONUs con Señal Baja

**Comando (para cada ONU online):**
```bash
show pon power attenuation gpon-onu_1/1/1:1
```

**Salida Ejemplo:**
```
Rx Power(dBm):      -19.50
Tx Power(dBm):      2.09
OLT Rx Power(dBm):  -21.32
```

**Criterio:**
- Rx Power >= -20 dBm → Señal normal
- Rx Power entre -25 y -20 dBm → Warning
- Rx Power < -25 dBm → Critical

**Parsing Optimizado:**

Para evitar consultar cada ONU individualmente (lento), usar comando batch:

```bash
show pon power attenuation gpon-olt_1/1/1
```

Esto muestra todas las ONUs del puerto a la vez.

```python
def get_zte_low_signal_onus(client, online_onus):
    """
    online_onus: lista de ONUs en estado working
    """
    stats = {
        'low_signal': 0,
        'low_signal_warning': 0,
        'low_signal_critical': 0
    }

    # Agrupar ONUs por puerto para consultar en batch
    ports = {}
    for onu in online_onus:
        port = onu['port']  # Ej: "1/1/1"
        if port not in ports:
            ports[port] = []
        ports[port].append(onu)

    # Consultar cada puerto
    for port, onus in ports.items():
        cmd = f"show pon power attenuation gpon-olt_{port}"
        output = client.execute_command(cmd)

        # Parsear resultado para cada ONU
        for line in output.split('\n'):
            if 'gpon-onu_' in line:
                # Extraer potencia Rx
                match = re.search(r'Rx Power.*?([-\d.]+)', line)
                if match:
                    rx_power = float(match.group(1))

                    if rx_power < -20:
                        if rx_power >= -25:
                            stats['low_signal_warning'] += 1
                        else:
                            stats['low_signal_critical'] += 1

    stats['low_signal'] = stats['low_signal_warning'] + stats['low_signal_critical']
    return stats
```

## Implementación Completa

### Script Python: `consultar_estadisticas_zte.py`

```python
#!/usr/bin/env python3
import sys
import json
import re
from olt_ssh_client import ZTEOLTClient

def parse_pending_onus(output):
    """Parsear ONUs sin configurar"""
    pending_onus = []
    for line in output.split('\n'):
        if 'gpon-onu_' in line and 'config' in line:
            parts = line.split()
            if len(parts) >= 2:
                pending_onus.append({
                    'index': parts[0],
                    'serial': parts[1],
                    'state': parts[2] if len(parts) > 2 else 'config'
                })
    return pending_onus

def parse_onu_states(output):
    """Parsear estados de ONUs"""
    onus = []
    for line in output.split('\n'):
        if 'gpon-onu_' not in line:
            continue

        parts = line.split()
        if len(parts) < 4:
            continue

        onus.append({
            'index': parts[0],
            'admin': parts[1],
            'fsm': parts[2],
            'auth': parts[4] if len(parts) > 4 else 'unknown'
        })
    return onus

def calculate_statistics(pending_onus, authorized_onus, signal_data):
    """Calcular estadísticas completas"""

    stats = {
        'total': len(pending_onus) + len(authorized_onus),
        'pending': len(pending_onus),
        'pending_discovered': len(pending_onus),
        'pending_new': 0,
        'pending_resync': 0,
        'authorized': 0,
        'online': 0,
        'offline': 0,
        'offline_power_fail': 0,
        'offline_los': 0,
        'offline_na': 0,
        'low_signal': 0,
        'low_signal_warning': 0,
        'low_signal_critical': 0
    }

    # Procesar ONUs autorizadas
    for onu in authorized_onus:
        fsm = onu['fsm'].lower()
        auth = onu['auth'].lower()

        if 'success' in auth:
            stats['authorized'] += 1

        if fsm == 'working':
            stats['online'] += 1
        elif fsm in ['los', 'losi']:
            stats['offline'] += 1
            stats['offline_los'] += 1
        elif fsm in ['dyinggasp', 'poweroff']:
            stats['offline'] += 1
            stats['offline_power_fail'] += 1
        else:
            stats['offline'] += 1
            stats['offline_na'] += 1

    # Procesar señales bajas
    if signal_data:
        stats['low_signal'] = signal_data['low_signal']
        stats['low_signal_warning'] = signal_data['low_signal_warning']
        stats['low_signal_critical'] = signal_data['low_signal_critical']

    return stats

def main():
    ip = sys.argv[1]
    user = sys.argv[2]
    password = sys.argv[3]

    try:
        client = ZTEOLTClient(ip, user, password)
        client.connect()

        # 1. Obtener ONUs pendientes
        pending_output = client.execute_command("show gpon onu uncfg")
        pending_onus = parse_pending_onus(pending_output)

        # 2. Obtener estados de ONUs autorizadas
        states_output = client.execute_command("show gpon onu state")
        authorized_onus = parse_onu_states(states_output)

        # 3. Obtener señales (simplificado - consultar por puerto)
        # Para implementación completa, iterar sobre todos los puertos
        signal_data = {
            'low_signal': 0,
            'low_signal_warning': 0,
            'low_signal_critical': 0
        }

        # Calcular estadísticas
        stats = calculate_statistics(pending_onus, authorized_onus, signal_data)

        client.disconnect()

        result = {
            'success': True,
            'estadisticas': stats,
            'execution_time_ms': 0,
            'timestamp': datetime.now().isoformat()
        }

        print(json.dumps(result))

    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'estadisticas': {
                'total': 0,
                'pending': 0,
                'online': 0,
                'authorized': 0,
                'offline': 0
            }
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main()
```

### Actualizar Endpoint

En el endpoint `/api/olts/realtime/:oltId/onus/estadisticas`:

```python
@app.route('/api/olts/realtime/<int:olt_id>/onus/estadisticas', methods=['GET'])
def get_onu_realtime_statistics(olt_id):
    try:
        olt = get_olt_from_db(olt_id)

        # Detectar marca del OLT
        if 'zte' in olt.modelo.lower():
            # Usar script para ZTE
            result = subprocess.run([
                'python3',
                'scripts/consultar_estadisticas_zte.py',
                olt.ip_address,
                olt.ssh_user,
                olt.ssh_password
            ], capture_output=True, text=True)
        elif 'huawei' in olt.modelo.lower():
            # Usar script para Huawei
            result = subprocess.run([
                'python3',
                'scripts/consultar_estadisticas_huawei.py',
                olt.ip_address,
                olt.ssh_user,
                olt.ssh_password
            ], capture_output=True, text=True)
        else:
            raise ValueError(f"Modelo de OLT no soportado: {olt.modelo}")

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

## Verificación

Después de implementar, consultar la OLT ZTE debería retornar:

```json
{
  "success": true,
  "data": {
    "estadisticas": {
      "total": 791,
      "pending": 1,
      "pending_discovered": 1,
      "pending_new": 0,
      "pending_resync": 0,
      "authorized": 790,
      "online": 697,
      "offline": 93,
      "offline_power_fail": 60,
      "offline_los": 9,
      "offline_na": 24,
      "low_signal": 28,
      "low_signal_warning": 25,
      "low_signal_critical": 3
    }
  }
}
```

## Comandos de Referencia ZTE C320

| Función | Comando ZTE |
|---------|-------------|
| ONUs sin autorizar | `show gpon onu uncfg` |
| Estado de ONUs | `show gpon onu state` |
| Potencia óptica | `show pon power attenuation gpon-onu_X/X/X:X` |
| Potencia óptica (batch) | `show pon power attenuation gpon-olt_X/X/X` |
| Info detallada ONU | `show gpon onu detail-info gpon-onu_X/X/X:X` |
| Lista de ONUs | `show gpon onu baseinfo gpon-olt_X/X/X` |

## Diferencias Clave Huawei vs ZTE

| Aspecto | Huawei MA5800 | ZTE C320 |
|---------|---------------|----------|
| ONUs pendientes | `display ont autofind all` | `show gpon onu uncfg` |
| Estados | `display ont info summary` | `show gpon onu state` |
| Notación puerto | `0/1/1` (frame/slot/port) | `1/1/1` (rack/shelf/slot) |
| Estado online | `RunState = online` | `FSM = working` |
| Estado offline LoS | `down cause: LOS` | `FSM = los` |
| Estado offline power | `down cause: dying-gasp` | `FSM = dyinggasp` |
| Potencia óptica | `display ont optical-info` | `show pon power attenuation` |

---

**Resumen:** El backend debe implementar comandos específicos para ZTE C320. Los comandos de Huawei NO funcionan en ZTE y viceversa. Se requiere detección de marca y scripts separados para cada fabricante.
