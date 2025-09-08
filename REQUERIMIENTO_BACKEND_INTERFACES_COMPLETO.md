# Requerimiento Backend - Endpoint Interfaces Completo

## Router Details Screen - Datos Requeridos

### Endpoint Principal: `POST /api/routers/interfaces`

**Request Body:**
```json
{
  "id_router": 123
}
```

**Response Structure Requerida:**
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
  "vlans": [
    {
      "name": "vlan100",
      "vlan_id": 100,
      "running": true,
      "mtu": 1500,
      "interface": "ether1",
      "arp": "enabled",
      "comment": "VLAN de administración"
    }
  ],
  "ipAddresses": [
    {
      "address": "192.168.1.1/24",
      "interface": "ether1",
      "network": "192.168.1.0",
      "gateway": "192.168.1.254",
      "dns": "8.8.8.8"
    }
  ]
}
```

## Campos Requeridos por Sección

### 1. **Interfaces** (Campos Obligatorios)

#### Información Básica:
- `name` (string): Nombre de la interfaz (ej: "ether1", "sfp-sfpplus1")
- `running` (boolean): Estado de la interfaz (true/false)
- `mtu` (number): Maximum Transmission Unit
- `mac-address` (string): Dirección MAC
- `arp` (string): Estado ARP ("enabled"/"disabled")
- `comment` (string, opcional): Comentario descriptivo

#### Información de Switch (opcional):
- `switch-info` (object, opcional):
  - `port` (number): Puerto del switch
  - `switch-host` (string): Host del switch

#### **NUEVO: Datos de Tráfico en Tiempo Real**
- `tx_rate` (number): Velocidad de transmisión en bytes por segundo
- `rx_rate` (number): Velocidad de recepción en bytes por segundo  
- `tx_packets_per_sec` (number): Paquetes transmitidos por segundo
- `rx_packets_per_sec` (number): Paquetes recibidos por segundo

**Ejemplo de Tráfico:**
```json
{
  "name": "ether1",
  "running": true,
  "tx_rate": 182100000,     // 182.1 Mbps
  "rx_rate": 12800000,      // 12.8 Mbps
  "tx_packets_per_sec": 18618,
  "rx_packets_per_sec": 7809
}
```

### 2. **VLANs** (Campos Obligatorios)

- `name` (string): Nombre de la VLAN
- `vlan_id` (number): ID numérico de la VLAN
- `running` (boolean): Estado de la VLAN
- `mtu` (number): Maximum Transmission Unit
- `interface` (string): Interfaz asociada
- `arp` (string): Estado ARP
- `comment` (string, opcional): Comentario descriptivo

### 3. **IP Addresses** (Campos Obligatorios)

- `address` (string): Dirección IP con máscara (ej: "192.168.1.1/24")
- `interface` (string): Interfaz asociada
- `network` (string): Red base (ej: "192.168.1.0")
- `gateway` (string, opcional): Gateway de la red
- `dns` (string, opcional): Servidor DNS

## Funcionalidad de Tráfico en Tiempo Real

### Formato de Velocidades:
- **Unidades**: Bytes por segundo (bps)
- **Conversiones automáticas en frontend**:
  - < 1,000 bps → "X bps"
  - < 1,000,000 bps → "X.X Kbps"
  - < 1,000,000,000 bps → "X.X Mbps"
  - ≥ 1,000,000,000 bps → "X.X Gbps"

### Colores de Tráfico (Frontend):
- **Verde**: < 1 Mbps (tráfico bajo)
- **Amarillo**: 1-100 Mbps (tráfico medio)
- **Rojo**: > 100 Mbps (tráfico alto)

### Actualización:
- **Frecuencia**: Se sugiere actualizar cada 5-10 segundos
- **Manejo de errores**: Si no hay datos de tráfico, mostrar "0 bps"

## Ejemplos de Datos Reales

### Interface con Tráfico Alto:
```json
{
  "name": "sfp-sfpplus3",
  "running": true,
  "mtu": 1500,
  "mac-address": "48:A9:8A:12:34:60",
  "arp": "enabled",
  "comment": "Enlace 10 Gb salida",
  "tx_rate": 840800000,    // 840.8 Mbps
  "rx_rate": 94600000,     // 94.6 Mbps
  "tx_packets_per_sec": 85005,
  "rx_packets_per_sec": 42557
}
```

### Interface Inactiva:
```json
{
  "name": "ether2",
  "running": false,
  "mtu": 1500,
  "mac-address": "48:A9:8A:12:34:57",
  "arp": "enabled",
  "comment": "Puerto backup",
  "tx_rate": 0,
  "rx_rate": 0,
  "tx_packets_per_sec": 0,
  "rx_packets_per_sec": 0
}
```

## Notas de Implementación

1. **Performance**: El endpoint debe ser optimizado para manejar múltiples consultas simultáneas
2. **Cache**: Considerar cache de 5-10 segundos para datos de tráfico
3. **Error Handling**: Retornar arrays vacíos si no hay datos
4. **Compatibilidad**: Todos los campos opcionales deben manejarse graciosamente
5. **Seguridad**: Validar que el `id_router` pertenezca al usuario autenticado

## Prioridades de Implementación

1. **Alta**: Campos básicos de interfaces, VLANs e IPs
2. **Alta**: Datos de tráfico en tiempo real (tx_rate, rx_rate, packets)
3. **Media**: Información de switch
4. **Baja**: Comentarios y campos opcionales