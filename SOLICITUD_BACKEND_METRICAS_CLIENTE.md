# Solicitud Backend - Métricas de Cliente

## Descripción General
Se requiere implementar un endpoint para obtener métricas de consumo específicas de un cliente individual desde routers MikroTik.

## Endpoint Requerido

### POST `/api/router-metrics`

**Propósito:** Obtener métricas de consumo específicas de un cliente/conexión individual

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "id_router": 123,
  "direccion_ip": "192.168.1.100",
  "id_conexion": 456,
  "period": "24h" // Opciones: "24h", "7d", "30d"
}
```

**Response Body esperado:**
```json
{
  "success": true,
  "data": {
    "uptime": 86400, // Tiempo de conexión en segundos
    "status": "online", // "online" | "offline"
    "currentSpeed": {
      "download": 50000000, // bps actual de descarga
      "upload": 10000000    // bps actual de subida
    },
    "clientTraffic": {
      "download": 5368709120, // Bytes descargados en el período
      "upload": 1073741824    // Bytes subidos en el período
    },
    "peakUsage": {
      "download": 95000000, // Pico máximo de descarga en bps
      "upload": 15000000    // Pico máximo de subida en bps
    },
    "clientHistory": [
      {
        "timestamp": "2025-06-29T10:00:00Z",
        "download": 104857600, // Bytes descargados en esta hora/día
        "upload": 52428800     // Bytes subidos en esta hora/día
      },
      // ... más puntos de datos según el período
    ]
  }
}
```

## Especificaciones Técnicas

### Integración con MikroTik
- **API utilizada:** RouterOS API o SNMP
- **Datos específicos:** Solo del cliente con la IP especificada
- **Período de datos:** Configurable (24h, 7d, 30d)

### Datos requeridos desde MikroTik

#### 1. Estado de Conexión y Uptime
```bash
# Comando RouterOS para obtener uptime del cliente
/interface monitor-traffic interface=bridge duration=1

# Para obtener estado de conexión
/ip dhcp-server lease print where address=192.168.1.100
```

#### 2. Velocidad Actual
```bash
# Monitoreo en tiempo real del tráfico
/interface monitor-traffic interface=bridge duration=1
# Filtrar por IP del cliente específico
```

#### 3. Tráfico Acumulado
```bash
# Estadísticas de Simple Queue (si se usa)
/queue simple print stats where target=192.168.1.100/32

# O desde DHCP lease
/ip dhcp-server lease print stats where address=192.168.1.100
```

#### 4. Historial de Consumo
- **Para 24h:** Datos cada hora (24 puntos)
- **Para 7d:** Datos cada día (7 puntos)  
- **Para 30d:** Datos cada día (30 puntos)

### Estructura de Base de Datos (sugerida)

```sql
-- Tabla para almacenar métricas históricas
CREATE TABLE client_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_conexion INT,
    id_router INT,
    direccion_ip VARCHAR(15),
    timestamp DATETIME,
    download_bytes BIGINT,
    upload_bytes BIGINT,
    download_speed_bps BIGINT,
    upload_speed_bps BIGINT,
    status ENUM('online', 'offline'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conexion_timestamp (id_conexion, timestamp),
    INDEX idx_router_ip (id_router, direccion_ip)
);
```

## Casos de Uso

### 1. Cliente Conectado con Datos Disponibles
**Respuesta:** Datos completos con historial según período solicitado

### 2. Cliente Desconectado
**Respuesta:** 
```json
{
  "success": true,
  "data": {
    "uptime": 0,
    "status": "offline",
    "currentSpeed": { "download": 0, "upload": 0 },
    "clientTraffic": { "download": 0, "upload": 0 },
    "peakUsage": { "download": 0, "upload": 0 },
    "clientHistory": []
  }
}
```

### 3. Cliente Sin Configuración de Router
**Respuesta:** 
```json
{
  "success": false,
  "error": "Cliente no configurado en router",
  "code": "NO_ROUTER_CONFIG"
}
```

### 4. Error de Conexión con Router
**Respuesta:**
```json
{
  "success": false,
  "error": "No se pudo conectar con el router",
  "code": "ROUTER_CONNECTION_ERROR"
}
```

## Consideraciones de Implementación

### Seguridad
- Validar que el usuario tenga acceso al ISP del router
- Validar que la conexión pertenezca al ISP del usuario
- No exponer datos de otros clientes

### Performance
- Cachear datos del router por 5-10 minutos
- Implementar timeout de 30 segundos para conexión MikroTik
- Procesar datos históricos en background

### Manejo de Errores
- Timeout de conexión con router
- Router no disponible
- Cliente no encontrado en router
- Datos históricos no disponibles

## Ejemplo de Uso desde Frontend

```javascript
const response = await fetch('https://wellnet-rd.com:444/api/router-metrics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id_router: configDetails.router.id_router,
    direccion_ip: configDetails.direccion_ip,
    id_conexion: connectionId,
    period: '24h'
  }),
});

const data = await response.json();
if (data.success) {
  // Usar data.data para mostrar métricas
} else {
  // Manejar error
}
```

## Notas Adicionales

- Los datos de historial deben ser específicos solo del cliente consultado
- No incluir información de otros clientes o del router completo
- Considerar implementar WebSocket para actualizaciones en tiempo real
- Los bytes deben convertirse a unidades legibles en el frontend (KB, MB, GB)
- Los bps deben convertirse a Kbps, Mbps, etc. en el frontend