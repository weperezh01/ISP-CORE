# Solicitud Backend - Tráfico en Tiempo Real para Interfaces

## Resumen Ejecutivo

Se necesita implementar el endpoint `POST /api/routers/interfaces` con datos de tráfico en tiempo real para mostrar velocidades de transmisión y recepción en las interfaces de red, similar a la funcionalidad de WinBox.

## Requerimiento Específico

### Endpoint: `POST /api/routers/interfaces`

**Request:**
```json
{
  "id_router": 123
}
```

**Response Actualizada:**
```json
{
  "interfaces": [
    {
      "name": "ether1",
      "running": true,
      "mtu": 1500,
      "mac-address": "48:A9:8A:12:34:56",
      "arp": "enabled",
      "comment": "Conexión principal WAN",
      "switch-info": {
        "port": 1,
        "switch-host": "switch1"
      },
      "tx_rate": 182100000,
      "rx_rate": 12800000,
      "tx_packets_per_sec": 18618,
      "rx_packets_per_sec": 7809
    }
  ],
  "vlans": [...],
  "ipAddresses": [...]
}
```

## Nuevos Campos Requeridos (Interfaces)

### 1. Tráfico de Datos
- **`tx_rate`** (number): Velocidad de transmisión en bytes por segundo
- **`rx_rate`** (number): Velocidad de recepción en bytes por segundo
- **`tx_packets_per_sec`** (number): Paquetes transmitidos por segundo
- **`rx_packets_per_sec`** (number): Paquetes recibidos por segundo

### 2. Especificaciones Técnicas

#### Formato de Datos:
- **Unidad**: Bytes por segundo (no bits)
- **Tipo**: Números enteros (long/int64)
- **Valor cero**: Para interfaces inactivas, enviar `0`

#### Ejemplos de Velocidades:
```json
{
  "tx_rate": 182100000,     // 182.1 Mbps
  "rx_rate": 12800000,      // 12.8 Mbps
  "tx_packets_per_sec": 18618,
  "rx_packets_per_sec": 7809
}
```

## Implementación Sugerida

### 1. Consulta a RouterOS/Mikrotik
```bash
# Comando para obtener estadísticas de interfaces
/interface print stats
/interface monitor-traffic interface=ether1 count=1
```

### 2. Campos de RouterOS a Mapear:
- `tx-bits-per-second` → `tx_rate` (convertir bits a bytes ÷ 8)
- `rx-bits-per-second` → `rx_rate` (convertir bits a bytes ÷ 8)
- `tx-packets-per-second` → `tx_packets_per_sec`
- `rx-packets-per-second` → `rx_packets_per_sec`

### 3. Consideraciones de Performance:
- **Cache**: Implementar cache de 5-10 segundos para evitar sobrecarga
- **Batch Processing**: Obtener estadísticas de todas las interfaces en una sola consulta
- **Error Handling**: Si no se pueden obtener estadísticas, enviar `0`

## Funcionalidad Frontend Implementada

### Visualización:
- **Indicador LIVE**: Punto verde animado
- **Formato automático**: bps → Kbps → Mbps → Gbps
- **Colores dinámicos**:
  - Verde: < 1 Mbps
  - Amarillo: 1-100 Mbps
  - Rojo: > 100 Mbps

### Ejemplo Visual:
```
📊 Tráfico en Tiempo Real • LIVE
↗️ TX 182.1 Mbps    ↙️ RX 12.8 Mbps
   18618 pkt/s         7809 pkt/s
```

## Casos de Uso

### Interface Activa:
```json
{
  "name": "ether1",
  "running": true,
  "tx_rate": 182100000,
  "rx_rate": 12800000,
  "tx_packets_per_sec": 18618,
  "rx_packets_per_sec": 7809
}
```

### Interface Inactiva:
```json
{
  "name": "ether2", 
  "running": false,
  "tx_rate": 0,
  "rx_rate": 0,
  "tx_packets_per_sec": 0,
  "rx_packets_per_sec": 0
}
```

### Interface 10 Gb:
```json
{
  "name": "sfp-sfpplus1",
  "running": true,
  "tx_rate": 1030000000,  // 1.03 Gbps
  "rx_rate": 108000000,   // 108 Mbps
  "tx_packets_per_sec": 104575,
  "rx_packets_per_sec": 50329
}
```

## Prioridad y Timeline

- **Prioridad**: Alta
- **Impacto**: Funcionalidad crítica para monitoreo de red
- **Usuarios afectados**: Administradores de red y técnicos ISP
- **Dependencias**: Conexión activa con RouterOS API

## Validación y Testing

### Casos de Prueba:
1. **Interface con tráfico alto** (>100 Mbps)
2. **Interface con tráfico bajo** (<1 Mbps)
3. **Interface inactiva** (0 bps)
4. **Interface 10 Gb** (>1 Gbps)
5. **Error de conexión** (valores por defecto en 0)

### Validación Frontend:
- Formato correcto de velocidades
- Colores apropiados según tráfico
- Actualización en tiempo real
- Manejo de errores

## Beneficios

1. **Monitoreo en Tiempo Real**: Visibilidad inmediata del tráfico de red
2. **Diagnóstico Rápido**: Identificación de interfaces saturadas
3. **Experiencia de Usuario**: Información similar a WinBox
4. **Optimización de Red**: Datos para toma de decisiones

## Documentación Completa

Ver archivo: `REQUERIMIENTO_BACKEND_INTERFACES_COMPLETO.md` para especificaciones técnicas completas.