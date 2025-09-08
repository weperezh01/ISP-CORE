# 📋 SOLICITUD: Mejora del Muestreo de Tiempo Real

**Para:** Equipo Backend  
**De:** Equipo Frontend  
**Fecha:** 2025-07-04  
**Prioridad:** ALTA  

---

## 🎯 **PROBLEMA ESPECÍFICO**

El endpoint `/api/active-connections?realtime=true` no está devolviendo datos de velocidad para todas las conexiones de manera consistente.

**Ejemplo de respuesta problemática:**
```json
{
  "success": true,
  "data": [
    {
      "id_conexion": 5690,
      "download_rate": 12,    // ✅ BIEN
      "upload_rate": 1,       // ✅ BIEN
      "direccion_ip": "192.168.8.16",
      "router": {"id_router": 20, "nombre": "Mikrotik Principal"}
    },
    {
      "id_conexion": 5691,
      "download_rate": 0,     // ❌ PROBLEMA
      "upload_rate": 0,       // ❌ PROBLEMA
      "direccion_ip": "192.168.8.17", 
      "router": {"id_router": 22, "nombre": "Mikrotik OLT"}
    }
  ]
}
```

---

## 🔍 **DIAGNÓSTICO FRONTED**

**Logging mejorado implementado:**
- ✅ Identifica conexiones con datos exitosos vs problemáticas
- ✅ Agrupa problemas por router para identificar patrones
- ✅ Calcula tasa de éxito real del muestreo
- ✅ Reporta método de recolección usado

**Logs de ejemplo:**
```
📊 ✅ Conexión 5690: ⬇12 bps ⬆1 bps (IP: 192.168.8.16)
📊 ❌ Conexión 5691: ⬇0 bps ⬆0 bps (IP: 192.168.8.17) - Router: Mikrotik OLT (ID: 22)
⚠️ PROBLEMA MUESTREO: 15 conexiones con 0 bps de 25 total
📈 Tasa de éxito real: 40% (10/25)
```

---

## 🛠️ **SOLICITUDES AL BACKEND**

### **1. LOGGING DETALLADO (Inmediato)**

Agregar logs por cada paso del proceso:

```javascript
// En el endpoint active-connections
app.post('/api/active-connections', async (req, res) => {
  const connectionIds = req.body.connection_ids;
  console.log(`🔄 Procesando ${connectionIds.length} conexiones RT`);
  
  for (const connId of connectionIds) {
    try {
      console.log(`🔍 Procesando conexión ${connId}`);
      
      // 1. Obtener configuración de conexión
      const connection = await getConnection(connId);
      console.log(`📋 Config obtenida: IP ${connection.ip}, Router ${connection.router_id}`);
      
      // 2. Conectar al router
      const router = await connectToRouter(connection.router_id);
      console.log(`🔗 Conectado a router ${connection.router_id}: ${router.ip}`);
      
      // 3. Consultar datos de velocidad
      const speedData = await getSpeedData(router, connection.ip);
      console.log(`📊 Datos velocidad: down=${speedData.download}, up=${speedData.upload}`);
      
      // 4. Formatear respuesta
      const result = formatResponse(speedData);
      console.log(`✅ Resultado final para ${connId}: ${JSON.stringify(result)}`);
      
    } catch (error) {
      console.error(`❌ Error procesando conexión ${connId}:`, error);
    }
  }
});
```

### **2. MANEJO DE ERRORES GRANULAR**

```javascript
// No fallar toda la consulta si una conexión falla
const results = await Promise.allSettled(
  connectionIds.map(async (connId) => {
    try {
      return await processConnection(connId);
    } catch (error) {
      console.error(`❌ Conexión ${connId} falló:`, error.message);
      return {
        id_conexion: connId,
        download_rate: 0,
        upload_rate: 0,
        status: 'error',
        error_reason: error.message
      };
    }
  })
);
```

### **3. VERIFICACIÓN DE DATOS**

```javascript
// Validar que todas las conexiones devuelvan respuesta
const processedIds = results.map(r => r.id_conexion);
const missingIds = connectionIds.filter(id => !processedIds.includes(id));

if (missingIds.length > 0) {
  console.warn(`⚠️ Conexiones sin procesar: ${missingIds.join(', ')}`);
}

// Calcular tasa de éxito
const successfulConnections = results.filter(r => r.download_rate > 0 || r.upload_rate > 0);
const successRate = (successfulConnections.length / results.length * 100).toFixed(1);
console.log(`📈 Tasa de éxito: ${successRate}%`);
```

### **4. TIMEOUT POR CONEXIÓN**

```javascript
// Timeout individual para evitar que una conexión lenta bloquee todas
const INDIVIDUAL_TIMEOUT = 5000; // 5 segundos por conexión

const getConnectionDataWithTimeout = async (connectionId) => {
  return Promise.race([
    getConnectionData(connectionId),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout conexión ${connectionId}`)), INDIVIDUAL_TIMEOUT)
    )
  ]);
};
```

---

## 📊 **MÉTRICAS SOLICITADAS**

Incluir en la respuesta del endpoint:

```json
{
  "success": true,
  "data": [...],
  "debug_info": {
    "requested_connections": 25,
    "processed_connections": 23,
    "successful_connections": 18,
    "failed_connections": 5,
    "success_rate": "78.3%",
    "response_time": "8.4s",
    "errors": [
      {"connection_id": 5692, "error": "Router timeout"},
      {"connection_id": 5693, "error": "IP not found in queue"}
    ]
  }
}
```

---

## 🎯 **CRITERIOS DE ÉXITO**

### **Mínimo Aceptable:**
- ✅ **80% de conexiones** con datos válidos (`download_rate > 0` O `upload_rate > 0`)
- ✅ **Logs detallados** para identificar conexiones problemáticas
- ✅ **Error handling** que no bloquee toda la consulta

### **Objetivo Ideal:**
- ✅ **95% de conexiones** con datos válidos
- ✅ **Tiempo de respuesta ≤ 10s** para 25 conexiones
- ✅ **Fallback system** para conexiones sin datos RT

---

## 🧪 **TESTING SUGERIDO**

### **1. Test Individual:**
```bash
# Probar una conexión que sabemos que falla
curl -X POST https://wellnet-rd.com:444/api/active-connections?realtime=true \
  -H "Content-Type: application/json" \
  -d '{"connection_ids": [5691]}'
```

### **2. Test por Router:**
```bash
# Probar todas las conexiones de un router específico
# Router 20 (que funciona): [5690, ...]  
# Router 22 (que falla): [5691, ...]
```

### **3. Test de Carga:**
```bash
# Probar con 10, 25, 50 conexiones para ver donde empieza a fallar
```

---

## 📞 **SEGUIMIENTO**

**Esperamos del Backend:**

1. **48 horas**: Implementación de logging detallado
2. **1 semana**: Análisis de patrones y causas raíz
3. **2 semanas**: Implementación de mejoras y fallbacks

**Frontend proporcionará:**
- ✅ Logs detallados de conexiones problemáticas
- ✅ Estadísticas de tasa de éxito en tiempo real
- ✅ Identificación de patrones por router

---

**Estado:** 🔴 **ABIERTO**  
**Tracking:** Frontend continuará monitoreando y reportando estadísticas  
**Next Review:** 2025-07-06  

---

**¡Trabajemos juntos para lograr un muestreo de 95%+ de éxito! 🚀**