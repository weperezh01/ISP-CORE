# 🔧 REQUERIMIENTO BACKEND - RECURSOS DEL SISTEMA MIKROTIK

## 📋 **RESUMEN EJECUTIVO**

Necesitamos implementar un endpoint para obtener los recursos del sistema de routers MikroTik de forma optimizada, usando un script unificado en lugar de múltiples comandos SSH individuales.

---

## 🎯 **ENDPOINT REQUERIDO**

### **URL**: `POST /api/routers/system-resources`

### **Request Body**:
```json
{
    "id_router": 123
}
```

### **Response** (Basada en datos reales CCR2116-12G-4S+):
```json
{
    "success": true,
    "data": {
        "board_name": "CCR2116-12G-4S+",
        "serial_number": "HDK09XXXXXX",
        "architecture": "arm64",
        "version": "7.15",
        "factory_software": "7.8",
        "build_time": "29-may-2024 12:44:08",
        "uptime": 12893992,
        "cpu_load": 7,
        "cpu_count": 16,
        "cpu_frequency": "2 GHz",
        "total_memory": 17179869184,
        "free_memory": 16210263040,
        "total_hdd_space": 134217728,
        "free_hdd_space": 93323264,
        "bad_blocks": 0.1,
        "write_sect_since_reboot": 590452886,
        "write_sect_total": 590636422,
        "sensors": {
            "temperatures": {
                "cpu_temp": 55,
                "board_temp": 45,
                "switch_temp": 45,
                "sfp_temp": 43,
                "ambient_temp": 43
            },
            "power_supplies": {
                "psu1_status": "ok",
                "psu2_status": "fail"
            },
            "fans": {
                "fan1_speed": 0,
                "fan2_speed": 0,
                "fan3_speed": 0,
                "fan4_speed": 0
            }
        },
        "timestamp": "2024-07-09T15:30:00Z"
    }
}
```

---

## 🚀 **OPTIMIZACIÓN PROPUESTA: SCRIPT UNIFICADO**

### **Problema Actual**:
- Múltiples comandos SSH ejecutados uno por uno
- Alta latencia por conexiones repetidas
- No parece tiempo real
- Uso ineficiente de recursos

### **Solución: Script MikroTik RouterOS**

Crear un script que se ejecute en el router y devuelva toda la información en una sola respuesta JSON.

---

## 📜 **SCRIPT MIKROTIK PROPUESTO**

### **Nombre del Script**: `system-resources-json`

```routeros
# Script: system-resources-json
# Descripción: Obtiene todos los recursos del sistema en formato JSON

:local systemResource [/system resource print as-value]
:local systemRouterboard [/system routerboard print as-value]
:local systemIdentity [/system identity print as-value]
:local systemClock [/system clock print as-value]

# Obtener información del sistema
:local boardName ($systemRouterboard->0->"model")
:local serialNumber ($systemRouterboard->0->"serial-number")
:local architecture ($systemResource->0->"architecture-name")
:local version ($systemResource->0->"version")
:local factorySoftware ($systemRouterboard->0->"factory-software")
:local buildTime ($systemResource->0->"build-time")
:local uptime ($systemResource->0->"uptime")
:local cpuLoad ($systemResource->0->"cpu-load")
:local cpuCount ($systemResource->0->"cpu-count")
:local cpuFrequency ($systemResource->0->"cpu-frequency")
:local totalMemory ($systemResource->0->"total-memory")
:local freeMemory ($systemResource->0->"free-memory")
:local totalHddSpace ($systemResource->0->"total-hdd-space")
:local freeHddSpace ($systemResource->0->"free-hdd-space")
:local badBlocks ($systemResource->0->"bad-blocks")
:local writeSectSinceReboot ($systemResource->0->"write-sect-since-reboot")
:local writeSectTotal ($systemResource->0->"write-sect-total")

# Obtener información de sensores de hardware
:local sensorData ""
:local temperatures ""
:local powerSupplies ""
:local fans ""

# Obtener datos de sensores de hardware
:do {
    :local systemHealth [/system health print as-value]
    :if ([:len $systemHealth] > 0) do={
        # Construir JSON de temperaturas
        :set temperatures ("{\"cpu_temp\":" . ($systemHealth->0->"cpu-temperature") . ",")
        :set temperatures ($temperatures . "\"board_temp\":" . ($systemHealth->0->"board-temperature") . ",")
        :set temperatures ($temperatures . "\"switch_temp\":" . ($systemHealth->0->"switch-chip-temperature") . ",")
        :set temperatures ($temperatures . "\"sfp_temp\":" . ($systemHealth->0->"sfp-temperature") . ",")
        :set temperatures ($temperatures . "\"ambient_temp\":" . ($systemHealth->0->"temperature") . "}")
        
        # Construir JSON de fuentes de poder
        :set powerSupplies ("{\"psu1_status\":\"" . ($systemHealth->0->"psu1-state") . "\",")
        :set powerSupplies ($powerSupplies . "\"psu2_status\":\"" . ($systemHealth->0->"psu2-state") . "\"}")
        
        # Construir JSON de ventiladores
        :set fans ("{\"fan1_speed\":" . ($systemHealth->0->"fan1-speed") . ",")
        :set fans ($fans . "\"fan2_speed\":" . ($systemHealth->0->"fan2-speed") . ",")
        :set fans ($fans . "\"fan3_speed\":" . ($systemHealth->0->"fan3-speed") . ",")
        :set fans ($fans . "\"fan4_speed\":" . ($systemHealth->0->"fan4-speed") . "}")
    }
} on-error={}

# Construir JSON
:local jsonOutput "{"
:set jsonOutput ($jsonOutput . "\"board_name\":\"" . $boardName . "\",")
:set jsonOutput ($jsonOutput . "\"serial_number\":\"" . $serialNumber . "\",")
:set jsonOutput ($jsonOutput . "\"architecture\":\"" . $architecture . "\",")
:set jsonOutput ($jsonOutput . "\"version\":\"" . $version . "\",")
:set jsonOutput ($jsonOutput . "\"factory_software\":\"" . $factorySoftware . "\",")
:set jsonOutput ($jsonOutput . "\"build_time\":\"" . $buildTime . "\",")
:set jsonOutput ($jsonOutput . "\"uptime\":" . $uptime . ",")
:set jsonOutput ($jsonOutput . "\"cpu_load\":" . $cpuLoad . ",")
:set jsonOutput ($jsonOutput . "\"cpu_count\":" . $cpuCount . ",")
:set jsonOutput ($jsonOutput . "\"cpu_frequency\":\"" . $cpuFrequency . "\",")
:set jsonOutput ($jsonOutput . "\"total_memory\":" . $totalMemory . ",")
:set jsonOutput ($jsonOutput . "\"free_memory\":" . $freeMemory . ",")
:set jsonOutput ($jsonOutput . "\"total_hdd_space\":" . $totalHddSpace . ",")
:set jsonOutput ($jsonOutput . "\"free_hdd_space\":" . $freeHddSpace . ",")
:set jsonOutput ($jsonOutput . "\"bad_blocks\":" . $badBlocks . ",")
:set jsonOutput ($jsonOutput . "\"write_sect_since_reboot\":" . $writeSectSinceReboot . ",")
:set jsonOutput ($jsonOutput . "\"write_sect_total\":" . $writeSectTotal)

# Agregar datos de sensores si están disponibles
:if ([:len $temperatures] > 0) do={
    :set jsonOutput ($jsonOutput . ",\"sensors\":{")
    :set jsonOutput ($jsonOutput . "\"temperatures\":" . $temperatures)
    
    :if ([:len $powerSupplies] > 0) do={
        :set jsonOutput ($jsonOutput . ",\"power_supplies\":" . $powerSupplies)
    }
    
    :if ([:len $fans] > 0) do={
        :set jsonOutput ($jsonOutput . ",\"fans\":" . $fans)
    }
    
    :set jsonOutput ($jsonOutput . "}")
}

:set jsonOutput ($jsonOutput . "}")
:put $jsonOutput
```

---

## 💻 **IMPLEMENTACIÓN BACKEND**

### **Paso 1: Instalar el Script en el Router**

```javascript
// Función para instalar el script en el router
const installSystemScript = async (routerId) => {
    const script = `
        /system script add name="system-resources-json" source="[SCRIPT_CONTENT_ABOVE]"
    `;
    
    await sshClient.execCommand(script);
};
```

### **Paso 2: Ejecutar el Script**

```javascript
// Endpoint implementation
app.post('/api/routers/system-resources', async (req, res) => {
    try {
        const { id_router } = req.body;
        
        // Obtener configuración SSH del router
        const router = await getRouterById(id_router);
        
        // Ejecutar el script unificado
        const sshResult = await sshClient.execCommand(
            '/system script run system-resources-json',
            {
                host: router.ip_publica,
                username: router.router_username,
                password: router.router_password
            }
        );
        
        // Parsear el JSON response
        const systemData = JSON.parse(sshResult.stdout);
        
        // Agregar timestamp
        systemData.timestamp = new Date().toISOString();
        
        res.json({
            success: true,
            data: systemData
        });
        
    } catch (error) {
        console.error('Error getting system resources:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get system resources'
        });
    }
});
```

---

## ⚡ **SISTEMA DE ACTUALIZACIÓN EN TIEMPO REAL**

### **Propuesta: Polling Inteligente en Frontend**

```javascript
// En RouterDetailsScreen.tsx
useEffect(() => {
    let intervalId;
    
    const updateSystemResources = async () => {
        try {
            const response = await fetch('/api/routers/system-resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_router: routerId })
            });
            
            const data = await response.json();
            if (data.success) {
                setSystemResources(data.data);
            }
        } catch (error) {
            console.error('Error updating system resources:', error);
        }
    };
    
    // Actualizar cada 30 segundos mientras la pantalla esté activa
    const startPolling = () => {
        updateSystemResources(); // Carga inicial
        intervalId = setInterval(updateSystemResources, 30000);
    };
    
    const stopPolling = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
    
    const focusListener = navigation.addListener('focus', startPolling);
    const blurListener = navigation.addListener('blur', stopPolling);
    
    return () => {
        focusListener();
        blurListener();
        stopPolling();
    };
}, [routerId, navigation]);
```

---

## 📊 **VENTAJAS DE LA IMPLEMENTACIÓN**

### **Performance**:
- ✅ **1 comando SSH** vs 10+ comandos individuales
- ✅ **Latencia reducida** de ~2-3 segundos a ~0.5 segundos
- ✅ **Menor carga** en el router MikroTik

### **Tiempo Real**:
- ✅ **Actualización cada 30 segundos**
- ✅ **Datos frescos** mientras el usuario está en pantalla
- ✅ **Pausa automática** cuando sale de la pantalla

### **Mantenimiento**:
- ✅ **Script centralizado** fácil de actualizar
- ✅ **Un solo punto de fallo**
- ✅ **Debugging simplificado**

---

## 🔄 **FLUJO DE IMPLEMENTACIÓN**

### **Fase 1: Script Base**
1. Crear el script MikroTik básico
2. Implementar endpoint simple
3. Probar con datos estáticos

### **Fase 2: Optimización**
1. Instalar script automáticamente en routers
2. Implementar manejo de errores robusto
3. Agregar logging detallado

### **Fase 3: Tiempo Real**
1. Implementar polling en frontend
2. Optimizar frecuencia de actualización
3. Agregar indicadores visuales de estado

---

## 📋 **CHECKLIST PARA IMPLEMENTACIÓN**

- [ ] Crear endpoint `/api/routers/system-resources`
- [ ] Desarrollar script MikroTik unificado
- [ ] Implementar función de instalación de script
- [ ] Agregar manejo de errores
- [ ] Probar con router real
- [x] Implementar polling en frontend (✅ 30 segundos)
- [x] Frontend actualizado con datos reales (✅ CCR2116-12G-4S+)
- [x] Mostrar identificación del equipo (✅ modelo, serie, arquitectura)
- [x] Métricas de rendimiento con barras de progreso (✅ CPU, RAM, almacenamiento)
- [x] Información adicional (✅ bloques defectuosos, escrituras)
- [x] Indicadores de estado (✅ óptimo/moderado/alto)
- [x] Actualizaciones en tiempo real (✅ polling inteligente)
- [ ] Backend endpoint funcional
- [ ] Documentar para equipo

---

## 🚨 **CONSIDERACIONES IMPORTANTES**

### **Seguridad**:
- Validar permisos de usuario antes de ejecutar
- Sanitizar datos de entrada
- Manejar credenciales SSH de forma segura

### **Rendimiento**:
- Implementar caché temporal (30-60 segundos)
- Limitar frecuencia de llamadas por router
- Monitorear carga en routers

### **Compatibilidad**:
- Probar en diferentes versiones de RouterOS
- Manejar campos opcionales gracefully
- Fallback para routers sin ciertas métricas

Esta implementación transformará la experiencia del usuario de datos estáticos a un monitoreo en tiempo real de los recursos del sistema MikroTik.

---

## 🎯 **ESTADO ACTUAL DE IMPLEMENTACIÓN**

### **✅ Frontend Completado**
- **Sistema de polling**: Actualización cada 30 segundos con control de focus/blur
- **UI moderna**: Cards con identificación del equipo, métricas de rendimiento e información adicional
- **Indicadores visuales**: Barras de progreso con colores (verde/amarillo/rojo)
- **Manejo de errores**: Fallbacks elegantes cuando no hay datos disponibles
- **Datos reales integrados**: Estructura basada en router CCR2116-12G-4S+ real
- **Optimización**: useMemo y useCallback para prevenir re-renders innecesarios

### **⏳ Pendiente Backend**
- Implementar endpoint `/api/routers/system-resources`
- Crear script MikroTik unificado en RouterOS
- Instalar script en routers automáticamente
- Probar con múltiples modelos de routers

### **🌡️ NUEVA FUNCIONALIDAD: Sensores de Hardware**

#### **Monitoreo de Temperaturas**
- **CPU**: 55°C con indicador 🌡️ (cálido 51-65°C)
- **Placa**: 45°C con indicador ❄️ (óptimo ≤50°C)
- **Switch**: 45°C con indicador ❄️
- **SFP**: 43°C con indicador ❄️
- **Ambiente**: 43°C con indicador ❄️
- **Códigos de color**: Verde (hasta 50°C), Amarillo (51-70°C), Rojo (+70°C)

#### **Estado de Fuentes de Poder**
- **PSU 1**: ✅ Operativa (estado "ok")
- **PSU 2**: 🔴 Falla (estado "fail")
- **Indicadores**: ✅ Operativa, 🔴 Falla, ⚠️ Advertencia

#### **Monitoreo de Ventiladores**
- **Fan 1-4**: 🔴 0 RPM (Detenidos)
- **Estados**: 💨 Normal (+1000 RPM), ⚠️ Lento (-1000 RPM), 🔴 Detenido (0 RPM)

### **🔧 Detalles Técnicos Implementados**

#### **Identificación del Equipo**
- Modelo del router (board_name)
- Número de serie (serial_number)
- Arquitectura del procesador
- Versión de RouterOS
- Software de fábrica
- Fecha de compilación
- Tiempo online (uptime formateado)

#### **Métricas de Rendimiento**
- **CPU**: Porcentaje de uso con información de núcleos y frecuencia
- **Memoria RAM**: Uso en porcentaje y bytes (usado/total)
- **Almacenamiento**: Uso en porcentaje y bytes con conversión automática
- **Barras de progreso**: Colores dinámicos según umbral (verde < 50%, amarillo < 75%, rojo >= 75%)

#### **Información Adicional**
- **Bloques defectuosos**: Porcentaje con indicadores visuales (✅ 0%, ⚠️ <= 0.5%, 🔴 > 0.5%)
- **Escrituras del disco**: Sectores desde reinicio y totales con formato numérico
- **Número de serie**: Identificación única del hardware

#### **Sistema de Actualización**
- Polling cada 30 segundos solo cuando la pantalla está enfocada
- Indicador visual de "Actualizando..." durante las peticiones
- Timestamp de última actualización exitosa
- Manejo elegante de errores con reintentos automáticos
- Pausa automática cuando el usuario sale de la pantalla (ahorro de batería)

### **📊 Ejemplo de Datos Reales Soportados**
```json
{
  "board_name": "CCR2116-12G-4S+",
  "serial_number": "HDK09XXXXXX",
  "total_memory": 17179869184,  // 16 GiB
  "free_memory": 16210263040,   // ~15 GiB libre
  "total_hdd_space": 134217728, // 128 MiB
  "free_hdd_space": 93323264,   // ~89 MiB libre
  "uptime": 12893992,           // 149 días formateado
  "cpu_count": 16,              // 16 núcleos
  "cpu_frequency": "2 GHz",
  "bad_blocks": 0.1,            // 0.1% con indicador ⚠️
  "write_sect_since_reboot": 590452886,
  "write_sect_total": 590636422
}
```

#### **🌡️ Sensores de Hardware (NUEVA FUNCIONALIDAD)**
- **Monitoreo de temperaturas**: CPU, placa, switch, SFP y ambiente con umbrales de alerta
- **Estado de fuentes de poder**: PSU 1 (operativa) y PSU 2 (falla) con códigos de color
- **Velocidad de ventiladores**: 4 ventiladores con detección de estado (normal/lento/detenido)
- **Indicadores visuales inteligentes**: Emojis y colores que cambian según el estado del componente
- **Integración completa**: Nueva tarjeta independiente con organización por categorías
- **Leyendas explicativas**: Umbrales claramente definidos para cada tipo de sensor

### **📊 Ejemplo de Datos Reales con Sensores**
```json
{
  "sensors": {
    "temperatures": {
      "cpu_temp": 55,      // 🌡️ Cálido (51-65°C)
      "board_temp": 45,    // ❄️ Óptimo (≤50°C)
      "switch_temp": 45,   // ❄️ Óptimo
      "sfp_temp": 43,      // ❄️ Óptimo
      "ambient_temp": 43   // ❄️ Óptimo
    },
    "power_supplies": {
      "psu1_status": "ok",   // ✅ Operativa
      "psu2_status": "fail" // 🔴 Falla
    },
    "fans": {
      "fan1_speed": 0,      // 🔴 Detenido
      "fan2_speed": 0,      // 🔴 Detenido
      "fan3_speed": 0,      // 🔴 Detenido
      "fan4_speed": 0       // 🔴 Detenido
    }
  }
}
```

### **🚨 Alertas Críticas Detectadas en el Router**
1. **PSU 2 Fuera de Servicio**: La fuente redundante está en falla
2. **Todos los Ventiladores Detenidos**: Posible problema de refrigeración
3. **Temperaturas Moderadas**: CPU a 55°C requiere monitoreo

**El frontend está listo para recibir datos reales del backend, incluyendo la nueva funcionalidad completa de sensores de hardware. Solo falta implementar el endpoint y el script MikroTik actualizado.**