# 📊 REPORTE BACKEND - DASHBOARD DE MÉTRICAS

**Fecha:** 2025-07-02  
**Prioridad:** ALTA  
**Endpoint objetivo:** `/api/router-metrics`  
**Componente afectado:** MetricsDashboard en ConexionDetalles  
**Estado actual:** Usando datos simulados

---

## 🎯 OBJETIVO

Implementar el endpoint `/api/router-metrics` para proporcionar métricas reales de consumo de ancho de banda por cliente individual en el Dashboard de Métricas.

---

## 📋 ESPECIFICACIÓN DEL ENDPOINT

### **URL y Método**
```
GET /api/router-metrics
```

### **Parámetros de Query Requeridos**
```javascript
{
    id_router: number,        // ID del router configurado
    id_conexion: number,      // ID de la conexión del cliente
    direccion_ip: string,     // IP del cliente (desde configuración)
    period: string,           // "24h", "7d", "30d"
    realtime: boolean         // true/false para datos en tiempo real
}
```

### **Ejemplo de URL Completa**
```
https://wellnet-rd.com:444/api/router-metrics?id_router=22&id_conexion=5690&direccion_ip=192.168.8.15&period=24h&realtime=true
```

---

## 📤 FORMATO DE RESPUESTA ESPERADO

### **Estructura JSON de Respuesta**
```javascript
{
    "success": true,
    "data": {
        // Estado de la conexión
        "uptime": 25678,                    // Tiempo en línea en segundos
        "status": "online",                 // "online", "offline", "unknown"
        
        // Velocidades actuales en tiempo real
        "currentSpeed": {
            "download": 150000000,          // Velocidad de descarga actual en bps
            "upload": 36000000              // Velocidad de subida actual en bps
        },
        
        // Tráfico acumulado del cliente en el período
        "clientTraffic": {
            "download": 32709776948,        // Bytes descargados en el período
            "upload": 1628219461            // Bytes subidos en el período
        },
        
        // Picos de uso en el período
        "peakUsage": {
            "download": 458000000,          // Velocidad máxima de descarga en bps
            "upload": 196000000             // Velocidad máxima de subida en bps
        },
        
        // Historial para gráficos (mínimo 3 puntos)
        "clientHistory": [
            {
                "timestamp": "2025-07-02T01:00:00.000Z",
                "download": 1363740706,      // Bytes acumulados hasta este punto
                "upload": 67912727
            },
            {
                "timestamp": "2025-07-02T02:00:00.000Z", 
                "download": 1636488847,
                "upload": 81495280
            },
            {
                "timestamp": "2025-07-02T03:00:00.000Z",
                "download": 1854235612,
                "upload": 92711780
            }
        ],
        
        // Metadatos (opcional)
        "dataSource": "mikrotik_api",       // Fuente de los datos
        "collection_method": "queue_simple", // Método usado para obtener datos
        "last_update": "2025-07-02T03:00:00.000Z"
    },
    "timestamp": "2025-07-02T03:00:00.000Z"
}
```

### **Respuesta de Error**
```javascript
{
    "success": false,
    "error": "Router no encontrado o cliente no configurado",
    "code": "ROUTER_NOT_FOUND",
    "timestamp": "2025-07-02T03:00:00.000Z"
}
```

---

## 🔧 LÓGICA DE IMPLEMENTACIÓN SUGERIDA

### **1. Validación de Parámetros**
```javascript
// Verificar que todos los parámetros requeridos estén presentes
const { id_router, id_conexion, direccion_ip, period, realtime } = req.query;

// Validar que el router existe y está activo
const router = await getRouterById(id_router);
if (!router) {
    return res.status(404).json({ 
        success: false, 
        error: "Router no encontrado" 
    });
}

// Validar que la conexión existe y tiene configuración
const conexion = await getConexionById(id_conexion);
if (!conexion || conexion.direccion_ip !== direccion_ip) {
    return res.status(404).json({ 
        success: false, 
        error: "Configuración de cliente no válida" 
    });
}
```

### **2. Conexión con Router (Mikrotik)**
```javascript
// Establecer conexión con el router
const mikrotikAPI = new MikrotikAPI(router.ip, router.username, router.password);

// Obtener datos actuales de la cola del cliente
const queueData = await mikrotikAPI.getQueueData(direccion_ip);

// Obtener estadísticas de tráfico
const trafficData = await mikrotikAPI.getTrafficStats(direccion_ip, period);
```

### **3. Procesamiento de Datos por Período**
```javascript
const getPeriodQuery = (period) => {
    switch(period) {
        case '24h':
            return 'WHERE timestamp >= NOW() - INTERVAL 24 HOUR';
        case '7d':
            return 'WHERE timestamp >= NOW() - INTERVAL 7 DAY';
        case '30d':
            return 'WHERE timestamp >= NOW() - INTERVAL 30 DAY';
        default:
            return 'WHERE timestamp >= NOW() - INTERVAL 24 HOUR';
    }
};
```

### **4. Almacenamiento de Métricas (Opcional)**
```sql
-- Tabla sugerida para almacenar métricas históricas
CREATE TABLE client_metrics_realtime (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_conexion INT NOT NULL,
    id_router INT NOT NULL,
    direccion_ip VARCHAR(15) NOT NULL,
    download_bytes BIGINT DEFAULT 0,
    upload_bytes BIGINT DEFAULT 0,
    download_rate BIGINT DEFAULT 0,
    upload_rate BIGINT DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conexion_time (id_conexion, timestamp),
    INDEX idx_router_ip (id_router, direccion_ip)
);
```

---

## 📊 CASOS DE USO ESPERADOS

### **Caso 1: Cliente Activo con Tráfico**
- Cliente está online y navegando
- Mostrar velocidades actuales > 0
- Historial con datos reales de consumo
- Status: "online"

### **Caso 2: Cliente Conectado sin Actividad**
- Cliente está online pero sin tráfico
- Velocidades actuales = 0 o muy bajas
- Tráfico acumulado del período
- Status: "online"

### **Caso 3: Cliente Offline**
- Cliente desconectado del router
- Velocidades actuales = 0
- Solo datos históricos disponibles
- Status: "offline"

### **Caso 4: Error de Configuración**
- IP no encontrada en el router
- Router inaccesible
- Status: "unknown" con mensaje de error

---

## 🔗 INTEGRACIÓN CON FRONTEND

### **Llamada Actual del Frontend**
```javascript
const response = await fetch(
    `https://wellnet-rd.com:444/api/router-metrics?id_router=${configDetails.router.id_router}&id_conexion=${connectionId}&direccion_ip=${direccionIp}&period=${selectedPeriod}&realtime=${isRealTimeActive}`,
    {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }
);
```

### **Procesamiento en Frontend**
```javascript
if (result.success && result.data) {
    // Datos reales del backend
    setMetricsData(result.data);
} else {
    // Fallback a datos simulados (actual)
    setMetricsData(mockData);
}
```

---

## ⚡ RENDIMIENTO Y OPTIMIZACIÓN

### **Caché Recomendado**
- **Datos en tiempo real**: Caché de 15-30 segundos
- **Datos históricos**: Caché de 5-10 minutos
- **Usar Redis** para caché distribuido

### **Límites de Rate**
- **Máximo 4 consultas por minuto** por cliente
- **Timeout de 5 segundos** para consultas a routers
- **Fallback** a datos históricos si router no responde

### **Optimizaciones**
- **Consultas asíncronas** a múltiples routers
- **Batch processing** para múltiples clientes
- **Índices optimizados** en base de datos

---

## 🚨 MANEJO DE ERRORES

### **Códigos de Error Específicos**
```javascript
{
    "ROUTER_NOT_FOUND": "Router no existe en la base de datos",
    "ROUTER_UNREACHABLE": "Router no responde a las consultas",
    "CLIENT_NOT_CONFIGURED": "Cliente no tiene configuración válida",
    "INVALID_PERIOD": "Período solicitado no válido",
    "MIKROTIK_API_ERROR": "Error en la API de Mikrotik",
    "DATABASE_ERROR": "Error al consultar datos históricos"
}
```

### **Respuestas de Fallback**
- Si router no responde: devolver solo datos históricos
- Si no hay datos históricos: devolver estructura vacía
- Si error crítico: devolver error con código específico

---

## 📝 TESTING RECOMENDADO

### **Casos de Prueba**
1. ✅ **Cliente activo**: Verificar datos en tiempo real
2. ✅ **Cliente inactivo**: Verificar solo datos históricos  
3. ✅ **Router offline**: Verificar manejo de timeouts
4. ✅ **IP inexistente**: Verificar respuesta de error
5. ✅ **Períodos diferentes**: Verificar 24h, 7d, 30d
6. ✅ **Parámetros faltantes**: Verificar validación

### **URLs de Prueba**
```
GET /api/router-metrics?id_router=22&id_conexion=5690&direccion_ip=192.168.8.15&period=24h&realtime=true
GET /api/router-metrics?id_router=23&id_conexion=5691&direccion_ip=10.201.0.82&period=7d&realtime=false
```

---

## 🎯 PRIORIDAD DE IMPLEMENTACIÓN

### **FASE 1 (Crítica)**
- [ ] Endpoint básico con datos de router en tiempo real
- [ ] Validación de parámetros y manejo de errores
- [ ] Respuesta con formato JSON correcto

### **FASE 2 (Importante)**
- [ ] Datos históricos desde base de datos
- [ ] Caché para optimizar rendimiento
- [ ] Logging para debugging

### **FASE 3 (Opcional)**
- [ ] Almacenamiento automático de métricas
- [ ] Dashboard de monitoreo del endpoint
- [ ] Métricas de rendimiento del API

---

## 🔧 CONFIGURACIÓN ACTUAL FRONTEND

**Estado:** ✅ Listo para integración  
**Fallback:** ✅ Datos simulados funcionando  
**Polling:** ✅ Cada 15 segundos cuando pantalla activa  
**Manejo errores:** ✅ Graceful degradation implementado  

**Una vez implementado el endpoint, el Dashboard mostrará automáticamente datos reales sin cambios adicionales en el frontend.**

---

**Contacto para consultas:** Equipo Frontend  
**Seguimiento:** Revisar en 48 horas para implementación