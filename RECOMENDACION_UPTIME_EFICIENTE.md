# 📊 RECOMENDACIÓN: Implementación Eficiente de Uptime

**Fecha:** 2025-07-03  
**Contexto:** Tiempo en línea para diagnóstico técnico  
**Problema:** Escalabilidad con 7000+ conexiones  
**Estado:** Propuesta de solución

---

## 🎯 **PROBLEMA IDENTIFICADO**

### **Requerimiento del Frontend:**
- Mostrar **tiempo en línea** de cada conexión para diagnóstico
- Detectar **reconexiones frecuentes** y **conexiones estables**
- Ayudar en **diagnóstico de averías** y **problemas de estabilidad**

### **Limitación Actual:**
- **7 ISPs × 1000+ clientes = 7000+ conexiones**
- Consultar uptime en tiempo real sería **muy costoso**
- Cada consulta requiere **conexión SSH al router**
- **Impacto en performance** del router y servidor

---

## 💡 **SOLUCIONES PROPUESTAS**

### **OPCIÓN A: Base de Datos de Eventos (RECOMENDADA)**

#### **1. Crear tabla de eventos de conexión:**
```sql
CREATE TABLE connection_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_conexion INT NOT NULL,
    event_type ENUM('online', 'offline', 'reconnect') NOT NULL,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_router INT,
    detection_method VARCHAR(50), -- 'realtime_check', 'manual', 'system'
    INDEX idx_conexion_time (id_conexion, event_time),
    INDEX idx_event_type (event_type),
    FOREIGN KEY (id_conexion) REFERENCES conexiones(id_conexion)
);
```

#### **2. Proceso automático de monitoreo:**
```javascript
// Ejecutar cada 15-30 minutos (no en tiempo real)
async function updateConnectionEvents() {
    const activeConnections = await getActiveConnections(); // Desde router
    const dbConnections = await getDBConnectionStates();     // Desde DB
    
    for (const connection of allConnections) {
        const wasOnline = dbConnections[connection.id]?.status === 'online';
        const isOnline = activeConnections.includes(connection.id);
        
        if (wasOnline !== isOnline) {
            // Solo insertar cuando cambia el estado
            await insertConnectionEvent({
                id_conexion: connection.id,
                event_type: isOnline ? 'online' : 'offline',
                id_router: connection.router_id,
                detection_method: 'periodic_check'
            });
        }
    }
}
```

#### **3. Calcular uptime cuando se solicite:**
```javascript
// Solo cuando el frontend pida datos de una conexión específica
async function getConnectionUptime(id_conexion) {
    const query = `
        SELECT 
            event_type,
            event_time,
            TIMESTAMPDIFF(SECOND, event_time, NOW()) as seconds_ago
        FROM connection_events 
        WHERE id_conexion = ? 
        ORDER BY event_time DESC 
        LIMIT 1
    `;
    
    const [lastEvent] = await db.query(query, [id_conexion]);
    
    if (lastEvent && lastEvent.event_type === 'online') {
        return {
            status: 'online',
            uptime: lastEvent.seconds_ago,
            last_event: lastEvent.event_time
        };
    } else {
        return {
            status: 'offline',
            offline_time: lastEvent ? lastEvent.seconds_ago : null,
            last_event: lastEvent ? lastEvent.event_time : null
        };
    }
}
```

---

### **OPCIÓN B: Uptime Desde Router (Solo Cuando Se Solicite)**

#### **1. Modificar endpoint active-connections:**
```javascript
// Agregar campo uptime solo cuando se especifique
async function getActiveConnections(req, res) {
    const { connection_ids, include_uptime = false } = req.body;
    
    if (include_uptime && connection_ids.length === 1) {
        // Solo para consultas de conexión individual
        const uptimeData = await getUptimeFromRouter(connection_ids[0]);
        return { ...connectionData, uptime: uptimeData };
    }
    
    // Para consultas masivas, omitir uptime
    return connectionData;
}
```

#### **2. Consulta específica de uptime:**
```javascript
// Nuevo endpoint para uptime individual
async function getConnectionUptime(req, res) {
    const { id_conexion } = req.params;
    
    try {
        // Obtener datos del router
        const connection = await getConnectionConfig(id_conexion);
        const routerData = await connectToRouter(connection.router);
        
        // Comando específico para obtener uptime
        const uptimeResult = await routerData.query(`
            /ppp active print where name="${connection.pppoe_user}"
        `);
        
        if (uptimeResult.length > 0) {
            return res.json({
                success: true,
                uptime: parseUptimeFromRouter(uptimeResult[0].uptime),
                status: 'online',
                last_check: new Date()
            });
        } else {
            return res.json({
                success: true,
                uptime: 0,
                status: 'offline',
                last_check: new Date()
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            error: 'No se pudo obtener uptime',
            uptime: 0,
            status: 'unknown'
        });
    }
}
```

---

### **OPCIÓN C: Híbrida (Mejor de Ambos Mundos)**

#### **1. Eventos en base de datos + Consulta específica:**
- **Monitoreo general**: Tabla de eventos cada 30 minutos
- **Consulta específica**: Uptime real del router cuando se solicite
- **Cache**: Cachear resultados por 5 minutos

#### **2. Frontend mejorado:**
```javascript
// Llamada inicial para uptime específico
useEffect(() => {
    if (connectionId && configDetails) {
        fetchConnectionUptime();
    }
}, [connectionId, configDetails]);

const fetchConnectionUptime = async () => {
    try {
        const response = await fetch(`/api/connection-uptime/${connectionId}`);
        const data = await response.json();
        
        if (data.success) {
            setUptimeData(data);
        }
    } catch (error) {
        console.error('Error obteniendo uptime:', error);
    }
};
```

---

## 📊 **COMPARACIÓN DE OPCIONES**

| Aspecto | Opción A (DB) | Opción B (Router) | Opción C (Híbrida) |
|---------|---------------|-------------------|-------------------|
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Precisión** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Escalabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Complejidad** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Costo servidor** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 **RECOMENDACIÓN FINAL**

### **Para el corto plazo (1-2 semanas):**
**Opción A - Base de Datos de Eventos**
- Implementar tabla `connection_events`
- Proceso cada 30 minutos para detectar cambios
- Calcular uptime desde último evento 'online'

### **Para el mediano plazo (1 mes):**
**Opción C - Híbrida**
- Mantener eventos en BD para overview general
- Consulta específica del router para detalles precisos
- Cache de 5 minutos para optimizar

### **Beneficios:**
- ✅ **Escalable** para 7000+ conexiones
- ✅ **Eficiente** en uso de recursos
- ✅ **Preciso** para diagnóstico
- ✅ **Flexible** para crecimiento futuro

---

## 🔧 **IMPLEMENTACIÓN PROPUESTA**

### **Fase 1: Base de Datos (1 semana)**
```sql
-- 1. Crear tabla
CREATE TABLE connection_events (...);

-- 2. Proceso inicial para poblar tabla
INSERT INTO connection_events 
SELECT id_conexion, 'online', NOW(), id_router 
FROM conexiones 
WHERE estado_conexion = 'Activa';
```

### **Fase 2: Monitoreo Automático (1 semana)**
```javascript
// 3. Script de monitoreo cada 30 min
setInterval(updateConnectionEvents, 30 * 60 * 1000);
```

### **Fase 3: API Endpoints (3 días)**
```javascript
// 4. Endpoint para uptime
GET /api/connection-uptime/:id_conexion
```

### **Fase 4: Frontend Integration (2 días)**
```javascript
// 5. Mostrar uptime calculado
const uptimeData = await fetchConnectionUptime(connectionId);
```

---

## ✅ **PRÓXIMOS PASOS**

1. **Decidir** qué opción implementar
2. **Crear** la tabla `connection_events`
3. **Implementar** el proceso de monitoreo
4. **Crear** endpoint de uptime
5. **Integrar** con frontend actualizado

**¿Qué opción prefieres que implementemos primero?**

---

**Estado:** ⚠️ Esperando decisión del equipo  
**Prioridad:** Media - Funcionalidad de diagnóstico  
**Impacto:** Mejor soporte técnico y diagnóstico de problemas