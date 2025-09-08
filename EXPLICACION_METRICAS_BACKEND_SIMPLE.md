# 📊 ¿QUÉ SON LAS MÉTRICAS? - Explicación para Backend

## 🎯 **¿Qué queremos mostrar?**

Imagina que tienes un cliente con **internet de 100 Mbps**. Queremos saber:

### **En este momento:**
- ¿Está **navegando**? → Velocidad actual: 45 Mbps descarga, 12 Mbps subida
- ¿Está **descargando** algo? → Velocidad actual: 98 Mbps descarga, 5 Mbps subida  
- ¿**No está usando** internet? → Velocidad actual: 0 Mbps, 0 Mbps
- ¿Está **desconectado**? → Sin datos, mostrar "Offline"

### **En las últimas 24 horas:**
- **¿Cuánto descargó?** → Total: 15.7 GB
- **¿Cuánto subió?** → Total: 2.3 GB
- **¿Cuándo usó más internet?** → Pico: 98 Mbps a las 8:30 PM

---

## 🔧 **¿Cómo obtienes estos datos del router Mikrotik?**

### **Datos en Tiempo Real:**
```bash
# En Mikrotik Terminal:
/queue simple print stats where target="192.168.8.15"

# Esto devuelve algo como:
# rate: 45M/12M (actual download/upload del cliente AHORA)
# total-bytes: 15700000000/2300000000 (total descargado/subido)
```

### **Estado de Conexión:**
```bash
# Ver si el cliente está conectado:
/ip dhcp-server lease print where address="192.168.8.15"

# O si usa PPPoE:
/ppp active print where name="cliente_usuario"
```

### **Traducir a tu API:**
```javascript
// Lo que el frontend necesita:
{
    "currentSpeed": {
        "download": 45000000,  // 45 Mbps en bits por segundo
        "upload": 12000000     // 12 Mbps en bits por segundo  
    },
    "clientTraffic": {
        "download": 15700000000,  // 15.7 GB en bytes
        "upload": 2300000000      // 2.3 GB en bytes
    },
    "status": "online"  // o "offline"
}
```

---

## 🚨 **Problema Actual: ¿Por qué todo está en 0?**

### **Posibles Causas:**

#### **1. No estás conectando con el router:**
```javascript
// ¿Esto funciona?
const mikrotik = new RouterOSAPI({
    host: '192.168.1.1',  // IP del router
    user: 'admin',
    password: 'tu_password'
});
```

#### **2. Estás pidiendo datos de un cliente que no existe:**
```javascript
// ¿Esta IP realmente existe en el router?
const clientIP = "192.168.8.15";

// Verificar en Mikrotik:
// /queue simple print where target~"192.168.8.15"
```

#### **3. El cliente no tiene tráfico activo:**
```javascript
// Si el cliente no está navegando AHORA mismo:
// currentSpeed será 0, pero clientTraffic debería tener datos históricos
```

#### **4. Mikrotik no está configurado para Simple Queue:**
```javascript
// Si usas PPPoE o Hotspot en lugar de Simple Queue,
// necesitas diferentes comandos de Mikrotik
```

---

## 💡 **Solución Paso a Paso:**

### **PASO 1: Probar conexión básica**
```javascript
// Test simple - ¿puedes conectar al router?
async function testRouterConnection() {
    try {
        const conn = new RouterOSAPI({
            host: 'IP_DEL_ROUTER',
            user: 'admin', 
            password: 'PASSWORD'
        });
        
        await conn.connect();
        console.log('✅ Conectado al router');
        
        // Listar TODAS las colas activas
        const queues = await conn.write('/queue/simple/print');
        console.log('📊 Colas encontradas:', queues.length);
        
        conn.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}
```

### **PASO 2: Buscar cliente específico**
```javascript
// ¿Existe el cliente en el router?
async function findClient(clientIP) {
    const queues = await conn.write('/queue/simple/print', {
        '?target': clientIP + '/32'  // Buscar IP específica
    });
    
    console.log(`📍 Cliente ${clientIP}:`, queues);
    return queues;
}
```

### **PASO 3: Obtener estadísticas reales**
```javascript
// Si el cliente existe, obtener sus stats
async function getClientStats(queueId) {
    const stats = await conn.write('/queue/simple/print', {
        '?stats': '',
        '?.id': queueId
    });
    
    console.log('📈 Estadísticas:', stats);
    return stats;
}
```

---

## 🔍 **Debug: ¿Qué revisar?**

### **En el router Mikrotik:**
```bash
# 1. ¿Hay colas configuradas?
/queue simple print

# 2. ¿La IP del cliente está ahí?
/queue simple print where target~"192.168.8.15"

# 3. ¿Hay tráfico activo?
/queue simple print stats

# 4. ¿El cliente está conectado?
/ip dhcp-server lease print where address="192.168.8.15"
```

### **En tu código backend:**
```javascript
// Agregar logs para debug:
console.log('🔍 Buscando cliente IP:', direccion_ip);
console.log('🔍 Router conectado:', router.ip);
console.log('🔍 Colas encontradas:', queues.length);
console.log('🔍 Estadísticas obtenidas:', stats);
```

---

## 📖 **Ejemplo Real de Respuesta Mikrotik:**

Cuando ejecutas `/queue simple print stats`, Mikrotik devuelve algo así:

```
0  name="Cliente_Juan" target="192.168.8.15/32" 
   rate="100M/50M" total-bytes="15700000000/2300000000"
   bytes="45000000/12000000" packets="156789/89654"
```

### **Traducción:**
- `rate="100M/50M"` → Límites configurados (no velocidad actual)
- `bytes="45000000/12000000"` → **Velocidad actual AHORA**
- `total-bytes="15700000000/2300000000"` → **Total acumulado**

---

## ✅ **Resultado Esperado en tu API:**

```javascript
{
    "success": true,
    "data": {
        "currentSpeed": {
            "download": 45000000,     // ← De "bytes" actual
            "upload": 12000000
        },
        "clientTraffic": {
            "download": 15700000000,  // ← De "total-bytes"
            "upload": 2300000000
        },
        "status": "online",           // ← Cliente encontrado y activo
        "uptime": 3600               // ← Tiempo conectado en segundos
    }
}
```

---

## 🎯 **Puntos Clave:**

1. **Conectar al router** primero
2. **Buscar la cola** del cliente por IP
3. **Obtener estadísticas** en tiempo real
4. **Traducir datos** al formato JSON
5. **Manejar casos** donde cliente no existe o está offline

**¿Necesitas ayuda con algún paso específico?**