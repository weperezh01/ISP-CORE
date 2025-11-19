# Mejoras Necesarias en Estadísticas ZTE C320

## Contexto

La implementación actual de estadísticas para ZTE C320 está funcionando parcialmente, pero hay discrepancias con los datos reales del equipo.

## Problemas Detectados

### 1. 🔴 CRÍTICO: Señal Baja No Implementada

**Problema:**
```json
"low_signal": 0,
"low_signal_warning": 0,
"low_signal_critical": 0
```

**Valor Real:** 28 ONUs con señal baja (25 warning, 3 critical)

**Causa:** El script `consultar_estadisticas_zte_detalladas.py` no está consultando la potencia óptica de las ONUs.

**Solución:**

Después de obtener las ONUs online, consultar su potencia óptica.

#### Comando ZTE para potencia óptica:

```bash
show pon power attenuation gpon-onu_1/1/1:1
```

**Salida:**
```
Rx Power(dBm):      -19.50
Tx Power(dBm):      2.09
OLT Rx Power(dBm):  -21.32
```

#### Implementación Optimizada

Para evitar consultar cada ONU individualmente (muy lento con 697 ONUs), consultar por puerto:

```bash
show pon power attenuation gpon-olt_1/1/1
```

Esto muestra todas las ONUs del puerto a la vez.

#### Actualizar `zte-estadisticas-detalladas.exp`

Agregar después de obtener el estado de ONUs:

```tcl
# Consultar potencias ópticas (ejemplo para puerto 1/1/1)
send "show pon power attenuation gpon-olt_1/1/1\r"
expect {
    "gpon-olt" {
        # Capturar más output
        send " "
        exp_continue
    }
    "#" {
        # Comando completo
    }
}
set power_output $expect_out(buffer)
```

**IMPORTANTE:** Necesitas consultar TODOS los puertos que tengan ONUs online, no solo uno.

#### Actualizar `consultar_estadisticas_zte_detalladas.py`

Agregar función para parsear potencias:

```python
def parse_signal_quality(power_output, online_onus):
    """
    Parsear potencias ópticas y clasificar ONUs con señal baja
    """
    stats = {
        'low_signal': 0,
        'low_signal_warning': 0,
        'low_signal_critical': 0
    }

    # Regex para extraer potencia Rx
    # Formato ZTE: "gpon-onu_1/1/1:1    Rx: -19.50 dBm"
    pattern = r'gpon-onu_(\d+/\d+/\d+):(\d+).*?Rx.*?([-\d.]+)\s*dBm'

    for match in re.finditer(pattern, power_output, re.IGNORECASE):
        port = match.group(1)
        onu_id = match.group(2)
        rx_power = float(match.group(3))

        # Clasificar señal
        if rx_power < -20:
            if rx_power >= -25:
                stats['low_signal_warning'] += 1
            else:
                stats['low_signal_critical'] += 1

    stats['low_signal'] = stats['low_signal_warning'] + stats['low_signal_critical']
    return stats
```

Integrar en la función principal:

```python
def main():
    # ... código existente ...

    # Parsear estados
    authorized_onus = parse_onu_states(states_output)

    # NUEVO: Parsear potencias
    signal_stats = parse_signal_quality(power_output, authorized_onus)

    # Calcular estadísticas
    stats = calculate_statistics(
        pending_onus,
        authorized_onus,
        signal_stats  # Pasar datos de señal
    )

    # ... resto del código ...
```

### 2. ⚠️ Consulta Incompleta de Puertos

**Problema:**

Diferencias en totales:
- Backend: 668 online vs Real: 697 online (faltan 29)
- Backend: 756 autorizadas vs Real: 790 autorizadas (faltan 34)

**Causa Probable:** El script solo está consultando algunos puertos, no todos.

**Solución:**

Verificar que el script consulte TODOS los puertos con ONUs:

```bash
# Consultar todos los puertos
show gpon onu state gpon-olt_1/1/1
show gpon onu state gpon-olt_1/1/2
show gpon onu state gpon-olt_1/1/3
# ... todos los puertos activos
```

O mejor aún, usar el comando sin especificar puerto (si el equipo lo soporta):

```bash
show gpon onu state
```

Esto debería mostrar TODAS las ONUs de TODOS los puertos.

#### Verificar en `zte-estadisticas-detalladas.exp`:

```tcl
# Asegurarse de usar el comando sin filtro de puerto
send "show gpon onu state\r"

# Manejar paginación correctamente
expect {
    "More" {
        send " "
        exp_continue
    }
    "#" {
        # Comando completo
    }
    timeout {
        puts "ERROR: Timeout esperando respuesta"
    }
}
```

### 3. ❌ Mapping Incorrecto de ONUs Pendientes

**Problema:**
```json
"pending_discovered": 0,
"pending_resync": 1
```

**Valor Real:** D: 1 (discovered), Resync: 0

**Causa:** El parsing está clasificando incorrectamente la ONU pendiente.

**Solución:**

En ZTE, cuando una ONU aparece en `show gpon onu uncfg`, su estado indica el tipo:

```
OnuIndex              Sn                 State
---------------------------------------------------------------------
gpon-onu_1/1/3:1      ZTEGC12345678      config
```

- `State = config` → ONU nueva descubierta (D)
- Si la ONU ya existía en la configuración → Resync
- Si la ONU es completamente nueva → New

#### Actualizar `consultar_estadisticas_zte_detalladas.py`:

```python
def classify_pending_onu(onu_index, serial, state, db_connection):
    """
    Clasificar ONU pendiente como D/Resync/New
    """
    # Buscar en BD si esta ONU ya existía
    existing = db_connection.query(
        "SELECT * FROM onus WHERE serial = %s AND puerto LIKE %s",
        (serial, f"%{onu_index.split(':')[0]}%")
    )

    if existing:
        # ONU ya existía en configuración
        return 'resync'
    else:
        # ONU nueva descubierta
        return 'discovered'
```

Integrar en el parsing:

```python
pending_stats = {
    'pending_discovered': 0,
    'pending_new': 0,
    'pending_resync': 0
}

for onu in pending_onus:
    classification = classify_pending_onu(
        onu['index'],
        onu['serial'],
        onu['state'],
        db_connection
    )

    if classification == 'discovered':
        pending_stats['pending_discovered'] += 1
    elif classification == 'resync':
        pending_stats['pending_resync'] += 1
    else:
        pending_stats['pending_new'] += 1
```

## Verificación

Después de implementar estos fixes, el endpoint debería retornar:

```json
{
  "success": true,
  "data": {
    "estadisticas": {
      "total": 791,
      "authorized": 790,
      "online": 697,
      "pending": 1,
      "pending_discovered": 1,
      "pending_new": 0,
      "pending_resync": 0,
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

## Testing

Para verificar cada fix:

### 1. Test Señal Baja
```bash
ssh router22
ssh wellnet@136.1.1.100
show pon power attenuation gpon-olt_1/1/1
```

Contar manualmente cuántas ONUs tienen Rx < -20 dBm

### 2. Test Puertos Completos
```bash
show gpon onu state
```

Contar el total de líneas. Debe coincidir con "Total authorized"

### 3. Test Pending Classification
```bash
show gpon onu uncfg
```

Verificar qué seriales aparecen y si existen en la base de datos

## Prioridades

1. 🔴 **ALTA:** Implementar consulta de señal baja (actualmente 0, debería ser 28)
2. 🟡 **MEDIA:** Verificar consulta completa de puertos (falta ~30 ONUs)
3. 🟢 **BAJA:** Corregir clasificación de pendientes (1 ONU mal clasificada)

---

**Nota:** El fix de señal baja es CRÍTICO porque actualmente el frontend muestra "0 ONUs con señal baja" cuando en realidad hay 28 que necesitan atención técnica.
