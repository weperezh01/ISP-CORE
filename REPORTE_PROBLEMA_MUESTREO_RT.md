# 🚨 REPORTE: Problema de Muestreo en Datos de Tiempo Real

**Fecha:** 2025-07-04  
**Prioridad:** ALTA  
**Componente:** Backend - Endpoint de tiempo real  
**Estado:** 🔴 Requiere atención inmediata  

---

## 📋 **RESUMEN DEL PROBLEMA**

El sistema de tiempo real no está obteniendo datos de velocidad (subida/bajada) para todas las conexiones de manera consistente. Solo algunas conexiones muestran velocidades, mientras que otras aparecen con 0 bps a pesar de estar activas.

---

## 🔍 **SÍNTOMAS OBSERVADOS**

### **Frontend:**
- Solo algunas conexiones muestran velocidades reales (ej: ⬇12 bps ⬆1 bps)
- Muchas conexiones activas aparecen con `download_rate: 0` y `upload_rate: 0`
- Los datos están llegando al frontend, pero con valores en cero
- El problema es inconsistente - no afecta siempre las mismas conexiones

### **Logs del Frontend:**
```
LOG  📊 Conexión 5690: ⬇12 bps ⬆1 bps (IP: 192.168.8.16) ✅ BIEN
LOG  📊 Conexión 5691: ⬇0 bps ⬆0 bps (IP: 192.168.8.17)  ❌ PROBLEMA
```

---

## 🔧 **ANÁLISIS TÉCNICO**

### **Endpoint Actual:**
```
POST https://wellnet-rd.com:444/api/active-connections?realtime=true
```

### **Request Body:**
```json
{
  "connection_ids": [5690, 5691, 5692, ...]
}
```

### **Response Esperada vs Actual:**
```json
{
  "success": true,
  "data": [
    {
      "id_conexion": 5690,
      "download_rate": 12,    // ✅ FUNCIONA
      "upload_rate": 1,       // ✅ FUNCIONA
      "status": "recently_active"
    },
    {
      "id_conexion": 5691,
      "download_rate": 0,     // ❌ PROBLEMA - debería tener datos
      "upload_rate": 0,       // ❌ PROBLEMA - debería tener datos  
      "status": "recently_active"
    }
  ]
}
```

---

## 🎯 **POSIBLES CAUSAS EN EL BACKEND**

### **1. Problema de Consulta a MikroTik:**
```javascript
// Posible problema: No todas las consultas SSH están funcionando
router.query('/interface/print') // ¿Timeout para algunos routers?
router.query('/queue/simple/print') // ¿Algunos queues no responden?
```

### **2. Problema de Mapeo de Datos:**
```javascript
// Posible problema: Mapping incompleto entre conexiones y datos RT
const connectionData = routerResponse.find(data => 
  data.target === connectionIP // ¿No encuentra todas las IPs?
);
```

### **3. Problema de Cache/Estado:**
```javascript
// Posible problema: Cache no actualizado para todas las conexiones
if (cachedData.age > threshold) {
  // ¿Solo algunas entradas se actualizan?
  refreshData(connection);
}
```

### **4. Problema de Concurrencia:**
```javascript
// Posible problema: Race conditions en consultas paralelas
Promise.all(routerQueries) // ¿Algunas promesas fallan silenciosamente?
```

---

## 🛠️ **RECOMENDACIONES PARA EL BACKEND**

### **Inmediatas (1-2 días):**

1. **Logging Detallado:**
```javascript
console.log('🔍 Procesando conexión:', connectionId);
console.log('📡 Consultando router:', routerInfo);
console.log('📊 Datos obtenidos:', rawData);
console.log('✅ Resultado final:', finalData);
```

2. **Validación de Respuestas:**
```javascript
// Verificar que todas las conexiones solicitadas devuelvan datos
const requestedIds = req.body.connection_ids;
const returnedIds = result.data.map(item => item.id_conexion);
const missingIds = requestedIds.filter(id => !returnedIds.includes(id));

if (missingIds.length > 0) {
  console.warn('⚠️ Datos faltantes para conexiones:', missingIds);
}
```

3. **Timeout por Conexión:**
```javascript
// Timeout individual para cada consulta
const connectionPromises = connections.map(async (conn) => {
  try {
    const data = await Promise.race([
      getConnectionData(conn),
      timeoutPromise(5000) // 5s por conexión
    ]);
    return data;
  } catch (error) {
    console.error(`❌ Error en conexión ${conn.id}:`, error);
    return null; // Devolver null en lugar de fallar toda la consulta
  }
});
```

### **Mediano Plazo (1 semana):**

4. **Implementar Fallbacks:**
```javascript
// Si datos RT fallan, usar datos históricos recientes
if (!realtimeData || realtimeData.download_rate === 0) {
  const historicalData = await getRecentHistoricalData(connectionId);
  return {
    ...connectionData,
    download_rate: historicalData.avg_download || 0,
    upload_rate: historicalData.avg_upload || 0,
    collection_method: 'historical_fallback'
  };
}
```

5. **Sistema de Health Check:**
```javascript
// Endpoint para verificar salud del sistema RT
GET /api/realtime-health
{
  "routers_online": 5,
  "routers_total": 7,
  "connections_with_data": 145,
  "connections_total": 200,
  "success_rate": 72.5,
  "last_update": "2025-07-04T10:30:00Z"
}
```

---

## 🧪 **DEBUGGING SUGERIDO**

### **Paso 1: Verificar Router por Router**
```bash
# Probar conexión directa a cada router
ssh admin@190.110.34.116 -p 8899
/interface/print
/queue/simple/print
```

### **Paso 2: Simular Petición Individual**
```bash
curl -X POST https://wellnet-rd.com:444/api/active-connections?realtime=true \
  -H "Content-Type: application/json" \
  -d '{"connection_ids": [5690]}' # Probar UNA conexión que falla
```

### **Paso 3: Comparar Conexiones Exitosas vs Fallidas**
```javascript
// Identificar patrones en conexiones que funcionan vs que no
const workingConnections = data.filter(conn => conn.download_rate > 0);
const failingConnections = data.filter(conn => conn.download_rate === 0);

console.log('✅ Funcionan:', workingConnections.map(c => ({
  id: c.id_conexion, 
  router: c.router.id_router,
  ip: c.direccion_ip
})));

console.log('❌ Fallan:', failingConnections.map(c => ({
  id: c.id_conexion,
  router: c.router.id_router, 
  ip: c.direccion_ip
})));
```

---

## 📊 **DATOS PARA ANÁLISIS**

### **Conexiones que SÍ funcionan:**
- ✅ Conexión 5690: IP 192.168.8.16, Router 20 (Mikrotik Principal)
- ✅ Conexión XXXX: IP x.x.x.x, Router XX

### **Conexiones que NO funcionan:**
- ❌ Conexión 5691: IP 192.168.8.17, Router 22 (Mikrotik OLT)  
- ❌ Conexión XXXX: IP x.x.x.x, Router XX

### **Preguntas para Backend:**
1. ¿Todos los routers responden correctamente a consultas SSH?
2. ¿Hay diferencias en configuración entre routers que funcionan vs que no?
3. ¿El mapeo de IPs a interfaces/queues está completo?
4. ¿Hay límites de concurrencia en las consultas?

---

## 🎯 **OBJETIVOS DE RESOLUCIÓN**

### **Éxito Mínimo:**
- **80% de conexiones** con datos RT válidos (no ceros)
- **Tiempo de respuesta** ≤ 15 segundos
- **Logs claros** para identificar conexiones problemáticas

### **Éxito Ideal:**
- **95% de conexiones** con datos RT válidos
- **Tiempo de respuesta** ≤ 10 segundos  
- **Sistema de fallback** para conexiones sin datos RT

---

## 📞 **SIGUIENTE PASO**

**Backend debe:**
1. ✅ Revisar logs del endpoint `/api/active-connections?realtime=true`
2. ✅ Identificar por qué algunas conexiones devuelven `download_rate: 0`
3. ✅ Implementar logging detallado por conexión
4. ✅ Probar consultas individuales a routers problemáticos
5. ✅ Reportar hallazgos para iteración de solución

---

**Estado:** 🔴 **CRÍTICO** - Impacta experiencia de usuario en tiempo real  
**Asignado a:** Equipo Backend  
**Seguimiento:** Revisar progreso en 48 horas  

---

**Reportado por:** Frontend Team  
**Contacto:** Este reporte contiene toda la información técnica necesaria