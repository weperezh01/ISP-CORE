# Solicitud Backend - Sensores de Hardware Faltantes

## 🚨 Datos Faltantes en System Resources

El endpoint `POST /api/routers/system-resources` está funcionando correctamente, pero **faltan los datos de sensores de hardware** que el frontend necesita para mostrar la información completa del router.

## 📊 Respuesta Actual del Backend:
```json
{
  "success": true,
  "data": {
    "uptime": "28w4d20h46m32s",
    "version": "7.11.3 (stable)",
    "freeMemory": 15,
    "totalMemory": 15,
    "cpuLoad": 11,
    "freeHddSpace": 103,
    "totalHddSpace": 129,
    "architectureName": "arm64",
    "boardName": "CCR2116-12G-4S+",
    "platform": "MikroTik",
    "memoryUsagePercent": 0,
    "hddUsagePercent": 20
  }
}
```

## 🔧 Campos de Sensores Requeridos:

Necesitamos agregar un objeto `sensors` con la siguiente estructura:

```json
{
  "success": true,
  "data": {
    // ... campos existentes ...
    "sensors": {
      "temperatures": {
        "cpu_temp": 45,
        "board_temp": 42,
        "switch_temp": 38,
        "sfp_temp": 35,
        "ambient_temp": 40
      },
      "power_supplies": {
        "psu1_status": "ok",
        "psu2_status": "ok"
      },
      "fans": {
        "fan1_speed": 1200,
        "fan2_speed": 1150,
        "fan3_speed": 1300,
        "fan4_speed": 1250
      }
    }
  }
}
```

## 📋 Comandos MikroTik para Sensores:

### 1. Temperaturas:
```bash
/system health print
```
**Output esperado:**
```
temperature: 45C
cpu-temperature: 45C
board-temperature: 42C
switch-chip-temperature: 38C
sfp-temperature: 35C
```

### 2. Fuentes de Poder:
```bash
/system health print
```
**Output esperado:**
```
psu1-state: ok
psu2-state: ok
power-consumption: 25W
```

### 3. Ventiladores:
```bash
/system health print
```
**Output esperado:**
```
fan1-speed: 1200
fan2-speed: 1150
fan3-speed: 1300
fan4-speed: 1250
```

## 🎯 Implementación Sugerida:

### Función para obtener sensores:
```javascript
async function getRouterSensors(routerConfig) {
  try {
    const healthOutput = await executeSSHCommand(routerConfig, '/system health print');
    
    return {
      temperatures: {
        cpu_temp: parseTemperature(healthOutput, 'cpu-temperature'),
        board_temp: parseTemperature(healthOutput, 'board-temperature'),
        switch_temp: parseTemperature(healthOutput, 'switch-chip-temperature'),
        sfp_temp: parseTemperature(healthOutput, 'sfp-temperature'),
        ambient_temp: parseTemperature(healthOutput, 'temperature')
      },
      power_supplies: {
        psu1_status: parsePowerStatus(healthOutput, 'psu1-state'),
        psu2_status: parsePowerStatus(healthOutput, 'psu2-state')
      },
      fans: {
        fan1_speed: parseFanSpeed(healthOutput, 'fan1-speed'),
        fan2_speed: parseFanSpeed(healthOutput, 'fan2-speed'),
        fan3_speed: parseFanSpeed(healthOutput, 'fan3-speed'),
        fan4_speed: parseFanSpeed(healthOutput, 'fan4-speed')
      }
    };
  } catch (error) {
    // Retornar estructura vacía si no se pueden obtener sensores
    return {
      temperatures: {},
      power_supplies: {},
      fans: {}
    };
  }
}
```

### Funciones de parsing:
```javascript
function parseTemperature(output, field) {
  const match = output.match(new RegExp(`${field}:\\s*(\\d+)C`));
  return match ? parseInt(match[1]) : null;
}

function parsePowerStatus(output, field) {
  const match = output.match(new RegExp(`${field}:\\s*(\\w+)`));
  return match ? match[1] : 'unknown';
}

function parseFanSpeed(output, field) {
  const match = output.match(new RegExp(`${field}:\\s*(\\d+)`));
  return match ? parseInt(match[1]) : 0;
}
```

## 🎨 Visualización Frontend:

El frontend ya está preparado para mostrar:

### Temperaturas:
- **CPU**: 45°C 🌡️
- **Placa**: 42°C ✅  
- **Switch**: 38°C ✅
- **SFP**: 35°C ✅

### Fuentes de Poder:
- **PSU 1**: Operativa ✅
- **PSU 2**: Operativa ✅

### Ventiladores:
- **Fan 1**: 1200 RPM 💨
- **Fan 2**: 1150 RPM 💨
- **Fan 3**: 1300 RPM 💨
- **Fan 4**: 1250 RPM 💨

## 🚨 Prioridad:

- **Alta**: Los sensores son críticos para monitoreo de salud del hardware
- **Impacto**: Sin sensores, no se puede detectar sobrecalentamiento o fallas de hardware
- **Usuarios**: Administradores de red necesitan esta información para mantenimiento preventivo

## ✅ Casos de Prueba:

1. **Router con todos los sensores** (CCR2116-12G-4S+)
2. **Router con sensores limitados** (modelos más simples)
3. **Router sin sensores** (devolver estructura vacía)
4. **Error de conexión** (devolver estructura vacía con manejo de errores)

## 📝 Resultado Esperado:

Después de la implementación, la respuesta completa debe incluir:

```json
{
  "success": true,
  "data": {
    "uptime": "28w4d20h46m32s",
    "version": "7.11.3 (stable)",
    "freeMemory": 15,
    "totalMemory": 15,
    "cpuLoad": 11,
    "freeHddSpace": 103,
    "totalHddSpace": 129,
    "architectureName": "arm64",
    "boardName": "CCR2116-12G-4S+",
    "platform": "MikroTik",
    "memoryUsagePercent": 0,
    "hddUsagePercent": 20,
    "sensors": {
      "temperatures": {
        "cpu_temp": 45,
        "board_temp": 42,
        "switch_temp": 38,
        "sfp_temp": 35,
        "ambient_temp": 40
      },
      "power_supplies": {
        "psu1_status": "ok",
        "psu2_status": "ok"
      },
      "fans": {
        "fan1_speed": 1200,
        "fan2_speed": 1150,
        "fan3_speed": 1300,
        "fan4_speed": 1250
      }
    }
  }
}
```

¡Esto completará la funcionalidad de monitoreo de hardware del router! 🚀