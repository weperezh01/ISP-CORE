# Actualizar Endpoint de Estadísticas de ONUs

## Objetivo

Actualizar el endpoint `GET /api/olts/realtime/:oltId/onus/estadisticas` para incluir estadísticas más detalladas que permitan mostrar 4 tarjetas de estado en el frontend.

## Endpoint Actual

```
GET /api/olts/realtime/:oltId/onus/estadisticas
```

### Respuesta Actual (simplificada)

```json
{
  "success": true,
  "cached": false,
  "data": {
    "estadisticas": {
      "total": 177,
      "authorized": 170,
      "pending": 3,
      "offline": 7
    }
  }
}
```

## Nueva Estructura Requerida

El frontend necesita las siguientes estadísticas adicionales para mostrar las 4 tarjetas:

### 1. Tarjeta Azul - En espera de autorización

Campos requeridos:
- `pending` (número total de ONUs pendientes)
- `pending_discovered` (ONUs descubiertas - estado "D")
- `pending_resync` (ONUs esperando resincronización)
- `pending_new` (ONUs nuevas sin autorizar)

### 2. Tarjeta Verde - ONUs en línea

Campos requeridos:
- `online` (número de ONUs actualmente en línea/conectadas)
- `authorized` (total de ONUs autorizadas, estén o no conectadas actualmente)

**Nota:** `online` y `authorized` son diferentes:
- `authorized` = todas las ONUs que tienen autorización (conectadas o no)
- `online` = solo las que están actualmente conectadas y operativas

### 3. Tarjeta Gris - ONUs fuera de línea

Campos requeridos:
- `offline` (número total de ONUs desconectadas)
- `offline_power_fail` (ONUs con falla de energía - "PwrFail")
- `offline_los` (ONUs con pérdida de señal óptica - "LoS")
- `offline_na` (ONUs desconectadas sin razón clasificada)

### 4. Tarjeta Naranja - ONUs con señal baja

Campos requeridos:
- `low_signal` (número total de ONUs con señal débil)
- `low_signal_warning` (señal baja pero aceptable, Rx entre -25 y -20 dBm)
- `low_signal_critical` (señal crítica, Rx < -25 dBm)

## Respuesta Actualizada Requerida

```json
{
  "success": true,
  "cached": false,
  "data": {
    "estadisticas": {
      "total": 177,
      "authorized": 170,
      "online": 170,
      "pending": 3,
      "pending_discovered": 1,
      "pending_resync": 0,
      "pending_new": 2,
      "offline": 7,
      "offline_power_fail": 4,
      "offline_los": 2,
      "offline_na": 1,
      "low_signal": 12,
      "low_signal_warning": 10,
      "low_signal_critical": 2
    }
  },
  "timestamp": "2025-11-15T12:00:00Z",
  "response_time_ms": 5000
}
```

## Cómo Obtener Estos Datos

### Para Huawei MA5800

#### 1. Estados de ONUs pendientes

Comando: `display ont autofind all`

La salida muestra ONUs pendientes con sus estados:
```
-----------------------------------------------------------------------------
F/S/P   ONT         SN         CtrlFlag    RunState    MatchState   Rssi(dBm)
-----------------------------------------------------------------------------
0/1/0   0           48575...   active      offline     match        -19.50
0/1/1   0           48575...   discover    offline     initial      -18.23
```

Estados de `CtrlFlag`:
- `discover` → `pending_discovered`
- `active` pero no autorizado → `pending_new`

#### 2. ONUs online vs authorized

Comando para todas las ONUs: `display ont info summary all`

```
F/S/P   ONTID   SN           ControlFlag   RunState    ...
0/1/0   0       48575...     active        online      ...
0/1/1   0       48575...     active        offline     ...
```

- `ControlFlag = active` + `RunState = online` → online
- `ControlFlag = active` (sin importar RunState) → authorized

#### 3. Razones de offline

Comando: `display ont info 0 1 0 0` (para cada ONU offline)

En la salida buscar:
```
Last down cause: dying-gasp    → offline_power_fail
Last down cause: LOS           → offline_los
Last down cause: unknown       → offline_na
```

#### 4. Señal baja

Comando: `display ont optical-info 0 1 0 0` (para cada ONU online)

Leer el valor de `Rx power(dBm)`:
```
Rx power(dBm): -19.50
```

Clasificar:
- Rx >= -20 dBm: Señal normal (no contar)
- Rx entre -25 y -20 dBm: `low_signal_warning`
- Rx < -25 dBm: `low_signal_critical`
- Total: `low_signal = low_signal_warning + low_signal_critical`

### Para ZTE C320

Los comandos son similares pero con diferente sintaxis:

- Estados: `show gpon onu uncfg`
- Info ONUs: `show gpon onu state gpon-olt_1/1/1`
- Potencia óptica: `show pon power attenuation gpon-onu_1/1/1:1`

## Implementación Sugerida

```python
def get_onu_statistics(olt_id):
    """Obtener estadísticas detalladas de ONUs"""

    stats = {
        'total': 0,
        'authorized': 0,
        'online': 0,
        'pending': 0,
        'pending_discovered': 0,
        'pending_resync': 0,
        'pending_new': 0,
        'offline': 0,
        'offline_power_fail': 0,
        'offline_los': 0,
        'offline_na': 0,
        'low_signal': 0,
        'low_signal_warning': 0,
        'low_signal_critical': 0
    }

    # 1. Obtener lista completa de ONUs autorizadas
    authorized_onus = get_authorized_onus(olt_id)
    stats['authorized'] = len(authorized_onus)
    stats['total'] = len(authorized_onus)

    # 2. Clasificar ONUs autorizadas por estado
    for onu in authorized_onus:
        if onu['run_state'] == 'online':
            stats['online'] += 1

            # Revisar señal para ONUs online
            rx_power = float(onu.get('rx_power', 0))
            if rx_power < -20:
                if rx_power >= -25:
                    stats['low_signal_warning'] += 1
                else:
                    stats['low_signal_critical'] += 1
        else:
            # ONU offline
            stats['offline'] += 1

            # Clasificar razón de offline
            down_cause = onu.get('last_down_cause', '').lower()
            if 'dying-gasp' in down_cause or 'power' in down_cause:
                stats['offline_power_fail'] += 1
            elif 'los' in down_cause:
                stats['offline_los'] += 1
            else:
                stats['offline_na'] += 1

    # Calcular total de señal baja
    stats['low_signal'] = stats['low_signal_warning'] + stats['low_signal_critical']

    # 3. Obtener ONUs pendientes de autorización
    pending_onus = get_pending_onus(olt_id)
    stats['pending'] = len(pending_onus)

    for onu in pending_onus:
        ctrl_flag = onu.get('ctrl_flag', '').lower()
        if ctrl_flag == 'discover':
            stats['pending_discovered'] += 1
        elif 'new' in ctrl_flag:
            stats['pending_new'] += 1
        else:
            stats['pending_resync'] += 1

    # Actualizar total
    stats['total'] += stats['pending']

    return stats
```

## Compatibilidad con Código Anterior

La respuesta sigue siendo compatible con el código anterior porque:
- Los campos originales (`total`, `authorized`, `pending`, `offline`) se mantienen
- Solo se agregan campos nuevos adicionales
- El frontend mostrará valores en 0 si algún campo no existe (usa `|| 0`)

## Beneficios

1. **Tarjetas informativas**: El usuario puede ver de un vistazo el estado detallado de todas las ONUs
2. **Diagnóstico rápido**: Puede identificar problemas (muchas ONUs con señal baja, fallas de energía, etc.)
3. **Navegación directa**: Al hacer clic en cada tarjeta, va directamente a la lista filtrada de ese tipo de ONUs
4. **Datos en tiempo real**: Las estadísticas se obtienen directamente del OLT vía SSH

## Prioridad

**Alta** - Estas estadísticas son fundamentales para la nueva interfaz de gestión de OLTs que acabamos de implementar.

---

**Nota:** Si inicialmente es muy costoso consultar todos estos datos en tiempo real, se puede:
1. Implementar primero los campos básicos con valores 0 para los detalles
2. Ir agregando la lógica de clasificación gradualmente
3. Usar caché más agresivo (120s en lugar de 60s) para este endpoint
