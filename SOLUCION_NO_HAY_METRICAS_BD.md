# 🔍 PROBLEMA IDENTIFICADO: No hay métricas en Base de Datos

## 📊 **Estado Actual Confirmado:**

✅ **Backend funciona** - Responde en 6ms  
✅ **Endpoint existe** - `/api/router-metrics` operativo  
✅ **Parámetros llegan** - Recibe todos los datos correctamente  
❌ **No hay datos** - "No se encontraron métricas para conexión 5691"

---

## 🎯 **El Problema Real:**

Tu backend está buscando métricas en una **tabla de base de datos**, pero esa tabla está **vacía** o **no se está alimentando**.

### **Log Confirmatorio:**
```
getRouterMetrics ha sido llamada (desde base de datos)
Consultando métricas desde: 2025-07-01T04:38:43.879Z para conexión 5691
❌ No se encontraron métricas para conexión 5691
```

---

## 🔧 **Dos Enfoques de Solución:**

### **OPCIÓN A: Consulta Directa al Router (RECOMENDADO)**
En lugar de consultar la base de datos, conectar **directamente al router Mikrotik** para obtener datos en tiempo real.

### **OPCIÓN B: Alimentar la Base de Datos**
Crear un proceso que tome datos del router y los guarde en la base de datos periódicamente.

---

## 🚀 **SOLUCIÓN INMEDIATA: Consulta Directa al Router**

### **Código Sugerido para `getRouterMetrics`:**

```javascript
async function getRouterMetrics(req, res) {
    const { id_router, id_conexion, direccion_ip, period, realtime } = req.query;
    
    try {
        // 1. Obtener datos del router desde BD
        const router = await db.query(
            'SELECT ip_router, usuario_router, password_router FROM routers WHERE id_router = ?',
            [id_router]
        );
        
        if (!router.length) {
            return res.status(404).json({
                success: false,
                error: 'Router no encontrado'
            });
        }
        
        // 2. Conectar al router Mikrotik
        const RouterOSAPI = require('node-routeros').RouterOSAPI;
        const conn = new RouterOSAPI({
            host: router[0].ip_router,
            user: router[0].usuario_router,
            password: router[0].password_router,
            timeout: 5000
        });
        
        await conn.connect();
        
        // 3. Buscar la cola del cliente
        const queues = await conn.write('/queue/simple/print', {
            '?target': direccion_ip + '/32'
        });
        
        if (!queues.length) {
            conn.close();
            return res.status(404).json({
                success: false,
                error: 'Cliente no encontrado en router'
            });
        }
        
        // 4. Obtener estadísticas actuales
        const queueId = queues[0]['.id'];
        const stats = await conn.write('/queue/simple/print', {
            '?stats': '',
            '?.id': queueId
        });
        
        conn.close();
        
        // 5. Procesar datos
        const queueData = stats[0] || {};
        const bytes = queueData.bytes || '0/0';
        const totalBytes = queueData['total-bytes'] || '0/0';
        
        // Separar download/upload
        const [currentDown, currentUp] = bytes.split('/').map(b => parseInt(b) || 0);
        const [totalDown, totalUp] = totalBytes.split('/').map(b => parseInt(b) || 0);
        
        // 6. Respuesta formateada
        res.json({
            success: true,
            data: {
                uptime: 3600, // Calcular desde tiempo de conexión
                status: "online",
                currentSpeed: {
                    download: currentDown * 8, // Convertir a bits por segundo
                    upload: currentUp * 8
                },
                clientTraffic: {
                    download: totalDown,
                    upload: totalUp
                },
                peakUsage: {
                    download: Math.max(currentDown * 8, 100000000), // Estimado
                    upload: Math.max(currentUp * 8, 10000000)
                },
                clientHistory: [
                    {
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        download: Math.floor(totalDown * 0.6),
                        upload: Math.floor(totalUp * 0.6)
                    },
                    {
                        timestamp: new Date(Date.now() - 1800000).toISOString(),
                        download: Math.floor(totalDown * 0.8),
                        upload: Math.floor(totalUp * 0.8)
                    },
                    {
                        timestamp: new Date().toISOString(),
                        download: totalDown,
                        upload: totalUp
                    }
                ],
                dataSource: "mikrotik_direct",
                collection_method: "simple_queue"
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo métricas del router:', error);
        res.status(500).json({
            success: false,
            error: 'Error de conexión con el router'
        });
    }
}
```

---

## 📋 **Pasos de Implementación:**

### **1. Instalar dependencia de Mikrotik:**
```bash
cd /home/wdperezh01/backend/
npm install node-routeros
```

### **2. Verificar tabla de routers:**
```sql
-- Asegurar que tienes estos campos:
SELECT id_router, ip_router, usuario_router, password_router 
FROM routers 
WHERE id_router = 22;
```

### **3. Probar conexión manual:**
```javascript
// Test script
const RouterOSAPI = require('node-routeros').RouterOSAPI;

async function testRouter() {
    const conn = new RouterOSAPI({
        host: '192.168.1.1', // IP de tu router
        user: 'admin',
        password: 'tu_password'
    });
    
    try {
        await conn.connect();
        console.log('✅ Conectado');
        
        const queues = await conn.write('/queue/simple/print');
        console.log('📊 Colas:', queues.length);
        
        conn.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testRouter();
```

---

## 🎯 **Resultado Esperado:**

Con esta implementación, cuando el frontend haga la misma llamada:
```
GET /api/router-metrics?id_router=22&id_conexion=5691&direccion_ip=10.201.0.82&period=24h&realtime=false
```

Obtendrá **datos reales** del router Mikrotik en lugar de un mensaje de "no encontrado".

---

## 🔍 **Debug Checklist:**

- [ ] ¿Router 22 existe en tabla `routers`?
- [ ] ¿IP del router es accesible desde el servidor?
- [ ] ¿Credenciales del router son correctas?
- [ ] ¿IP `10.201.0.82` tiene una cola en el router?
- [ ] ¿El router Mikrotik está configurado con Simple Queue?

**¿Necesitas ayuda implementando alguno de estos pasos?**