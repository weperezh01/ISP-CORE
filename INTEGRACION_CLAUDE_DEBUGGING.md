# 🤖 Integración Claude API para Debugging Automático

## 🎯 **Objetivo**

La integración con la API de Claude permite envío automático de datos de debugging cuando se detectan problemas en el sistema de historial de conexiones, facilitando el soporte técnico y análisis de issues.

## ⚙️ **Cómo Funciona**

### **1. Detección Automática de Problemas**

El sistema detecta automáticamente:
- ❌ **Errores de endpoints** (500, 404, timeout)
- ⚠️ **Timestamps futuros** del backend
- 🔄 **Duraciones estáticas** (5 min fijos)
- 📊 **Inconsistencias de datos** (RT vs Uptime)
- 🔌 **Falta de conectividad** con APIs

### **2. Envío Automático a Claude**

```javascript
// Se ejecuta automáticamente cuando hay problemas
const sendDebugDataToClaude = async () => {
    // Solo enviar una vez por sesión
    if (debugDataSent) return;
    
    // Detectar problemas
    const issues = [];
    if (error) issues.push(`Error: ${error}`);
    if (dataIssue) issues.push(`Data issue: ${dataIssue}`);
    
    // Solo enviar si hay problemas reales
    if (issues.length === 0) return;
    
    // Preparar reporte técnico
    const debugMessage = `🔧 DEBUGGING REPORT - Conexión ${connectionId}:
    
    Problemas detectados: ${issues.join(', ')}
    
    Datos técnicos:
    - Realtime: ${JSON.stringify(realtimeData)}
    - Uptime: ${JSON.stringify(uptimeData)} 
    - History: ${JSON.stringify(historyData)}
    - Error actual: ${error}
    
    ¿Qué análisis y recomendaciones tienes para estos problemas?`;
    
    // Enviar a Claude API
    await fetch('https://wellnet-rd.com:444/api/claude/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: debugMessage,
            userId: 999, // ID especial para debugging
            userName: 'Debug System',
            sessionId: `debug_${connectionId}_${Date.now()}`,
            contextData: {
                connectionId,
                screen: 'ConexionDetalles',
                debugSession: true,
                issues: issues,
                timestamp: new Date().toISOString()
            }
        })
    });
};
```

### **3. Cuándo Se Activa**

El envío automático se dispara:
- **2 segundos después** de cargar datos (para detectar inconsistencias)
- **1 segundo después** de errores críticos de conectividad
- **Solo una vez por sesión** (evita spam)

## 📊 **Datos Enviados a Claude**

### **Información Técnica:**
- **Connection ID**: Identificador de la conexión
- **Realtime Data**: Estado actual y velocidades
- **Uptime Data**: Métricas de disponibilidad
- **History Data**: Últimas 2 sesiones para contexto
- **Error Messages**: Errores específicos detectados
- **Timestamps**: Para análisis de sincronización

### **Contexto de Debugging:**
```json
{
  "connectionId": 5654,
  "screen": "ConexionDetalles", 
  "debugSession": true,
  "issues": ["Timestamps futuros", "Duraciones estáticas"],
  "timestamp": "2025-07-04T14:48:19.831Z",
  "userAgent": "React Native App"
}
```

## 🎯 **Beneficios**

### **Para el Equipo de Desarrollo:**
1. **Detección Proactiva**: Los problemas se reportan automáticamente
2. **Contexto Completo**: Datos técnicos detallados para debugging
3. **Análisis Inteligente**: Claude proporciona recomendaciones específicas
4. **Historial Centralizado**: Todos los reports en la BD de Claude

### **Para el Usuario Final:**
1. **Sin Interferencia**: El proceso es completamente transparente
2. **Mejor Soporte**: Los problemas se documentan automáticamente
3. **Indicador Sutil**: Icono 🤖 cuando se envían datos (opcional)

## 📱 **Indicadores Visuales**

### **En la UI:**
- **🤖 Icono**: Aparece en el footer cuando se envían datos de debugging
- **Logs de Console**: Detalles técnicos para desarrolladores

```
📊 Sistema de polling activo - Mostrando datos de monitoreo 🤖
```

### **En los Logs:**
```
🤖 Enviando datos de debugging a Claude para análisis...
✅ Datos de debugging enviados a Claude exitosamente
📋 Session ID: debug_5654_1751640500123
```

## 🔒 **Privacidad y Seguridad**

### **Datos NO Enviados:**
- ❌ Información personal del cliente
- ❌ Passwords o credenciales
- ❌ Datos financieros
- ❌ IPs privadas completas

### **Datos SÍ Enviados:**
- ✅ IDs de conexión (números públicos)
- ✅ Estados técnicos (online/offline)
- ✅ Métricas de performance
- ✅ Mensajes de error del sistema
- ✅ Timestamps para análisis

### **Identificación:**
- **User ID 999**: Reservado para debugging automático
- **Session ID**: `debug_{connectionId}_{timestamp}`
- **User Name**: "Debug System"

## 🔧 **Configuración**

### **Activar/Desactivar:**
```javascript
// Para desactivar debugging automático
const CLAUDE_DEBUG_ENABLED = false; // Cambiar a false

const sendDebugDataToClaude = async () => {
    if (!CLAUDE_DEBUG_ENABLED) return;
    // ... resto del código
};
```

### **Personalizar Umbrales:**
```javascript
// Personalizar qué problemas activar el debugging
const shouldSendDebug = () => {
    return (
        error ||                           // Siempre enviar errores
        dataIssue?.includes('timestamps') || // Solo timestamps futuros
        historyData?.length === 0          // Solo cuando no hay datos
    );
};
```

## 📋 **Casos de Uso Reales**

### **Caso 1: Timestamps Futuros**
```
🔧 DEBUGGING REPORT - Conexión 5654:

Problemas detectados: Timestamps futuros, Duraciones estáticas 5min

Datos técnicos:
- Realtime: {"status": "online", "download_rate": 160}
- History: [{"start_time": "2025-07-04T14:43:19.831Z", "duration_seconds": 300}]
- Error actual: null

¿Qué análisis y recomendaciones tienes para estos problemas?
```

### **Caso 2: Error de Conectividad**
```
🔧 DEBUGGING REPORT - Conexión 5679:

Problemas detectados: Error: No se pudieron obtener datos de ningún endpoint

Datos técnicos:
- Realtime: null
- Uptime: null
- History: null
- Error actual: No se pudieron obtener datos de ningún endpoint

¿Qué análisis y recomendaciones tienes para estos problemas?
```

## 📊 **Análisis en el Backend**

### **Consultar Reports:**
```sql
-- Ver todos los debugging reports
SELECT * FROM claude_messages 
WHERE user_id = 999 
AND user_name = 'Debug System'
ORDER BY timestamp DESC;

-- Análizar problemas por conexión
SELECT 
    JSON_EXTRACT(context_data, '$.connectionId') as connection_id,
    JSON_EXTRACT(context_data, '$.issues') as issues,
    COUNT(*) as report_count
FROM claude_messages 
WHERE user_id = 999
GROUP BY connection_id
ORDER BY report_count DESC;
```

### **Estadísticas de Problemas:**
```sql
-- Top problemas detectados
SELECT 
    JSON_EXTRACT(context_data, '$.issues') as issue_type,
    COUNT(*) as frequency
FROM claude_messages 
WHERE user_id = 999
GROUP BY issue_type
ORDER BY frequency DESC;
```

## 🚀 **Próximas Mejoras**

### **Funcionalidades Planeadas:**
1. **Clasificación de Severidad**: Critical, Warning, Info
2. **Alertas por Email**: Para problemas críticos recurrentes  
3. **Dashboard de Issues**: Panel de control de problemas
4. **Auto-resolución**: Scripts automáticos para problemas conocidos
5. **ML Analysis**: Detección de patrones en problemas

### **Integraciones Futuras:**
1. **Sistema de Tickets**: Crear tickets automáticamente
2. **Slack/Teams**: Notificaciones en tiempo real
3. **Grafana**: Métricas de debugging
4. **PagerDuty**: Alertas para DevOps

## ✅ **Estado Actual**

- ✅ **Detección automática** de problemas implementada
- ✅ **Envío a Claude API** funcional
- ✅ **Context data completo** incluido
- ✅ **Rate limiting** respetado (una vez por sesión)
- ✅ **Logging detallado** para monitoring
- ✅ **Indicadores visuales** opcionales

¡El sistema de debugging automático está listo y funcionando! 🎯

Cuando veas el icono 🤖 en el historial de conexiones, significa que se detectaron problemas y se enviaron automáticamente a Claude para análisis técnico.