# 📊 Requerimiento Backend: Historial de Sesiones de Conexión

## 🎯 Objetivo
Implementar un endpoint que proporcione el historial detallado de sesiones de conexión/desconexión para cada cliente, obteniendo datos directamente de los routers Mikrotik.

## 📋 Endpoint Requerido

### `GET /api/connection-history/{connection_id}`

**Parámetros:**
- `connection_id`: ID de la conexión
- `limit`: Número de sesiones a devolver (default: 10, max: 50)
- `hours`: Filtrar por últimas X horas (opcional)

## 🗂️ Estructura de Respuesta Requerida

```json
{
  "success": true,
  "connection_id": 5691,
  "total_sessions": 15,
  "sessions": [
    {
      "session_id": "sess_123",
      "type": "connected",
      "status": "current", // "current" | "completed"
      "start_time": "2025-07-04T01:30:00.000Z",
      "end_time": null, // null si es sesión actual
      "duration_seconds": 7200,
      "connection_method": "pppoe", // "pppoe" | "dhcp" | "static"
      "client_ip": "10.201.0.82",
      "router_info": {
        "router_id": 22,
        "router_name": "Mikrotik OLT",
        "interface": "ether1"
      },
      "traffic_stats": {
        "bytes_downloaded": 156842000,
        "bytes_uploaded": 45231000,
        "average_download_bps": 21783,
        "average_upload_bps": 6281,
        "peak_download_bps": 2100000,
        "peak_upload_bps": 512000
      },
      "disconnection_reason": null
    },
    {
      "session_id": "disc_122",
      "type": "disconnected",
      "status": "completed",
      "start_time": "2025-07-04T00:45:00.000Z",
      "end_time": "2025-07-04T01:30:00.000Z",
      "duration_seconds": 2700,
      "disconnection_reason": "timeout",
      "disconnection_details": "PPPoE session timeout after 300s",
      "router_info": {
        "router_id": 22,
        "router_name": "Mikrotik OLT"
      }
    }
  ],
  "summary": {
    "total_uptime_today": 18000,
    "total_downtime_today": 3600,
    "uptime_percentage_24h": 83.3,
    "average_session_duration": 14400,
    "total_disconnections_24h": 3
  }
}
```

## 🔧 Fuentes de Datos en Mikrotik

### 1. **Para PPPoE (Conexiones dinámicas):**
```bash
# Logs de PPPoE activos
/ppp active print detail

# Logs de conexiones PPPoE
/log print where topics~"pppoe"

# Estadísticas de interfaces PPPoE
/interface pppoe-server server print stats
```

### 2. **Para DHCP:**
```bash
# Leases DHCP activos
/ip dhcp-server lease print detail

# Logs DHCP
/log print where topics~"dhcp"
```

### 3. **Para Tráfico:**
```bash
# Monitoreo en tiempo real
/interface monitor-traffic interface=ether1 count=1

# Estadísticas de Simple Queue
/queue simple print stats

# Logs de torch (si está habilitado)
/tool torch interface=ether1
```

### 4. **Para Logs de Desconexión:**
```bash
# Logs del sistema
/log print where topics~"system,error,critical,warning"

# Logs específicos de interfaces
/log print where topics~"interface"
```

## 📊 Datos Específicos por Tipo de Conexión

### **PPPoE:**
- Session ID único
- Tiempo de conexión/desconexión
- Razón de desconexión (timeout, admin, client)
- Estadísticas de bytes transferidos
- IP asignada dinámicamente

### **Simple Queue (IP estática):**
- Estado del queue (active/inactive)
- Estadísticas de tráfico acumulado
- Límites configurados vs. uso real
- Tiempo de última actividad

### **DHCP:**
- Estado del lease (bound/expired)
- Tiempo de renovación
- MAC address del cliente
- Hostname si está disponible

## 🎯 Casos de Uso Específicos

### **1. Cliente con conexión PPPoE activa:**
```json
{
  "type": "connected",
  "status": "current",
  "connection_method": "pppoe",
  "pppoe_details": {
    "username": "cliente_5691",
    "session_id": "8a000016",
    "assigned_ip": "10.201.0.82",
    "uptime": "02:15:30"
  }
}
```

### **2. Cliente desconectado por timeout:**
```json
{
  "type": "disconnected",
  "disconnection_reason": "timeout",
  "disconnection_details": "no LCP replies received, PPPoE session terminated",
  "last_seen": "2025-07-04T01:30:00.000Z"
}
```

### **3. Cliente con Simple Queue sin actividad:**
```json
{
  "type": "connected",
  "status": "idle",
  "connection_method": "static",
  "idle_duration_seconds": 1800,
  "last_traffic_time": "2025-07-04T01:00:00.000Z"
}
```

## ⚡ Optimizaciones Recomendadas

### **1. Caché de Datos:**
- Cachear historial por 5 minutos
- Actualizar solo datos de sesión actual en tiempo real
- Pre-calcular estadísticas diarias

### **2. Consultas Eficientes:**
- Usar conexiones persistentes a Mikrotik
- Limitar consultas de logs por tiempo
- Implementar paginación para historiales largos

### **3. Manejo de Errores:**
- Timeout de 10 segundos para consultas Mikrotik
- Fallback a datos en caché si router no responde
- Logging detallado de errores de conexión

## 🔄 Frecuencia de Actualización

- **Datos actuales (sesión activa):** Cada 10 segundos
- **Historial completado:** Cada 5 minutos
- **Estadísticas diarias:** Cada hora
- **Logs de desconexión:** En tiempo real (webhooks si es posible)

## 🧪 Datos Mock para Testing

Mientras se implementa, el frontend está usando datos simulados que muestran:
- 3 sesiones de ejemplo (1 actual, 1 desconexión, 1 completada)
- Formato visual completo del historial
- Indicadores de estado en tiempo real

## 🚀 Prioridad de Implementación

1. **Fase 1:** Obtener datos básicos de sesión actual (PPPoE active)
2. **Fase 2:** Implementar logs de desconexión recientes
3. **Fase 3:** Añadir estadísticas de tráfico detalladas
4. **Fase 4:** Optimizar rendimiento y caché

## 📱 Integración Frontend

El componente `ConnectionHistoryModern.tsx` ya está preparado para recibir estos datos y mostrarlos en una interfaz intuitiva con:
- Timeline visual de conexiones
- Estadísticas de velocidad promedio
- Duración de sesiones
- Razones de desconexión
- Estado actual en tiempo real

---

**Nota:** Este requerimiento busca aprovechar al máximo las capacidades de monitoreo de Mikrotik para proporcionar insights valiosos sobre la estabilidad y rendimiento de las conexiones de cada cliente.