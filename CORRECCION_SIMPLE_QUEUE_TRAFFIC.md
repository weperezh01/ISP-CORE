# 🔧 CORRECCIÓN: Simple Queue > Traffic (No Torch)

**Fecha:** 2025-07-02  
**Prioridad:** ALTA  
**Referencia:** Simple Queue > Traffic en MikroTik  
**Estado:** Requiere ajuste en backend

---

## 🎯 **ACLARACIÓN DEL REQUERIMIENTO**

### **NO es MikroTik Torch:**
❌ Gráfico de velocidades en tiempo real  
❌ Curvas de actividad por minutos/horas  
❌ Tráfico acumulado calculado por períodos

### **SÍ es Simple Queue > Traffic:**
✅ **Total de bytes** desde creación de la queue  
✅ **Contador acumulativo** que nunca se resetea  
✅ **Valores reales** desde `/queue simple print`

---

## 📊 **Qué Muestra Simple Queue > Traffic**

### **En MikroTik Winbox:**
```
Simple Queues > [Cliente] > Traffic tab:

📈 Bytes:
   Download: 15,847,293,847 bytes (14.8 GB)
   Upload:   2,394,857,293 bytes (2.2 GB)

📊 Packets:
   Download: 12,547,832 packets
   Upload:   3,248,947 packets

⏱️ Rate:
   Download: 45,234,567 bps (45.2 Mbps) 
   Upload:   12,847,293 bps (12.8 Mbps)
```

### **Traducción para Dashboard:**
```
📊 Dashboard de Métricas

🚀 Velocidad Actual: 
   45.2 Mbps ↓ / 12.8 Mbps ↑

📥 Tráfico Total (Histórico):
   Descarga: 14.8 GB
   Subida: 2.2 GB

📦 Paquetes Totales:
   Descarga: 12.5M paquetes  
   Subida: 3.2M paquetes
```

---

## 🔧 **COMANDO MIKROTIK CORRECTO**

### **Para obtener estos datos:**
```bash
# En MikroTik Terminal:
/queue simple print stats where name="Cliente_Juan"

# Respuesta esperada:
   name="Cliente_Juan" 
   target="192.168.8.15/32"
   bytes="15847293847/2394857293"     # ← ESTO necesitamos
   packets="12547832/3248947"         # ← Y esto también
   rate="45234567/12847293"           # ← Velocidad actual
```

### **Explicación de Campos:**
```javascript
// bytes="15847293847/2394857293"
const [totalDownloadBytes, totalUploadBytes] = bytes.split('/');
// → totalDownloadBytes = 15,847,293,847 (desde creación de queue)
// → totalUploadBytes = 2,394,857,293 (desde creación de queue)

// rate="45234567/12847293"  
const [currentDownloadRate, currentUploadRate] = rate.split('/');
// → currentDownloadRate = 45,234,567 bps (velocidad AHORA)
// → currentUploadRate = 12,847,293 bps (velocidad AHORA)
```

---

## 🚨 **PROBLEMA ACTUAL DEL BACKEND**

### **Lo que Backend Envía:**
```javascript
{
    clientHistory: [
        {
            download: 0,              // ❌ Siempre 0
            upload: 0,                // ❌ Siempre 0
            downloadSpeed: 44051947,  // ✅ Velocidad actual
            uploadSpeed: 3026070      // ✅ Velocidad actual
        }
    ]
}
```

### **Lo que Necesitamos:**
```javascript
{
    // Velocidades actuales (YA las tiene)
    currentSpeed: {
        download: 44051947,        // ✅ Del campo "rate"
        upload: 3026070           // ✅ Del campo "rate"  
    },
    
    // FALTA: Tráfico total histórico
    totalTraffic: {
        download: 15847293847,     // ← Del campo "bytes" MikroTik
        upload: 2394857293        // ← Del campo "bytes" MikroTik
    },
    
    // FALTA: Contadores de paquetes  
    totalPackets: {
        download: 12547832,        // ← Del campo "packets" MikroTik
        upload: 3248947           // ← Del campo "packets" MikroTik
    }
}
```

---

## 🔧 **SOLUCIÓN PARA BACKEND**

### **Modificar la consulta MikroTik:**
```javascript
// EN LUGAR DE: Solo obtener velocidades
const stats = await conn.write('/queue/simple/print', {
    '?stats': '',
    '?.id': queueId
});

// HACER: Obtener estadísticas completas
const stats = await conn.write('/queue/simple/print', {
    '?stats': '',
    '?.id': queueId
});

// Procesar TODOS los campos:
const queueData = stats[0] || {};
const bytes = queueData.bytes || '0/0';           // ← TOTAL histórico
const packets = queueData.packets || '0/0';       // ← Paquetes históricos  
const rate = queueData.rate || '0/0';            // ← Velocidad actual

// Separar valores:
const [totalDownBytes, totalUpBytes] = bytes.split('/').map(b => parseInt(b) || 0);
const [totalDownPackets, totalUpPackets] = packets.split('/').map(p => parseInt(p) || 0);
const [currentDownRate, currentUpRate] = rate.split('/').map(r => parseInt(r) || 0);
```

### **Respuesta Corregida del Backend:**
```javascript
{
    success: true,
    data: {
        // Velocidades actuales
        currentSpeed: {
            download: currentDownRate,    // bps actual
            upload: currentUpRate        // bps actual
        },
        
        // Tráfico TOTAL desde creación de queue
        totalTraffic: {
            download: totalDownBytes,     // bytes totales históricos
            upload: totalUpBytes         // bytes totales históricos  
        },
        
        // Paquetes totales
        totalPackets: {
            download: totalDownPackets,   // paquetes totales
            upload: totalUpPackets       // paquetes totales
        },
        
        // Estado y metadatos
        status: "online",
        uptime: calculateUptime(),       // tiempo desde primera conexión
        dataSource: "mikrotik_simple_queue",
        collection_method: "queue_stats"
    }
}
```

---

## 📊 **DASHBOARD RESULTANTE**

### **Con Datos Reales de Simple Queue:**
```
📊 Dashboard de Métricas
🟢 Tiempo Real Activo

⏱️ Tiempo de Conexión: 15 días 8h (Conectado)
🚀 Velocidad Actual: 44.0 Mbps ↓ / 3.0 Mbps ↑

📥 Tráfico Total Histórico: 14.8 GB
📤 Tráfico Total Histórico: 2.2 GB

📦 Paquetes Totales: 12.5M ↓ / 3.2M ↑  
📈 Desde: Creación de la queue

ℹ️ Router: Mikrotik Principal
ℹ️ IP: 10.201.0.82
ℹ️ Queue: Cliente_Juan
```

### **Sin Gráfico Temporal:**
- ❌ **No mostrar** gráfico de 24h/7d/30d
- ✅ **Mostrar** totales acumulados desde siempre
- ✅ **Mostrar** velocidades actuales en tiempo real
- ✅ **Mostrar** contadores de paquetes

---

## 🎯 **CAMBIO REQUERIDO EN BACKEND**

### **1. Obtener campo `bytes` de MikroTik:**
```javascript
// Usar este comando:
/queue simple print stats where target="192.168.8.15/32"

// Obtener campo: bytes="15847293847/2394857293"
```

### **2. Procesar y enviar datos históricos:**
```javascript
// Enviar en la respuesta:
totalTraffic: {
    download: 15847293847,  // bytes reales de MikroTik
    upload: 2394857293     // bytes reales de MikroTik
}
```

### **3. Opcional - Agregar paquetes:**
```javascript
totalPackets: {
    download: 12547832,     // paquetes de MikroTik
    upload: 3248947        // paquetes de MikroTik  
}
```

---

## ✅ **RESULTADO ESPERADO**

Una vez implementado, el Dashboard mostrará:
- **Tráfico real acumulado** desde creación de queue
- **Velocidades actuales** en tiempo real  
- **Contadores de paquetes** (opcional)
- **Tiempo de conexión** desde primera vez
- **Sin gráficos temporales** artificiales

**Exactamente como Simple Queue > Traffic en MikroTik Winbox.** 🎯

---

**Estado:** ⚠️ Requiere implementación en backend  
**Prioridad:** Alta - Datos incorrectos actualmente  
**Impacto:** Dashboard mostrará métricas reales de MikroTik