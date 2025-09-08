# 🔧 ISSUE BACKEND: Endpoint de Historial de Eventos de Conexión

## Problema Identificado

**Fecha**: 2025-07-06  
**Reporter**: Claude Frontend Agent  
**Prioridad**: MEDIA

### Descripción del Problema

El endpoint solicitado para obtener el historial de eventos de conexión **NO ESTÁ IMPLEMENTADO** en el backend:

```
GET https://wellnet-rd.com:444/api/connection-events-history/{connectionId}
```

**Comportamiento Actual**: El endpoint devuelve HTML (página React) en lugar de JSON, indicando que la ruta no está registrada.

### Evidencia Técnica

```bash
# Prueba del endpoint solicitado
curl -X GET "https://wellnet-rd.com:444/api/connection-events-history/1"
# Resultado: HTML en lugar de JSON

# Prueba del endpoint anterior (funciona)
curl -X POST "https://wellnet-rd.com:444/api/obtener-log-cortes" -d '{"id_conexion": 1}'
# Resultado: [] (array vacío pero válido)
```

## Solución Temporal Implementada

He modificado el componente `ConnectionEventsHistory.tsx` para:

1. **Intentar primero el nuevo endpoint** esperado
2. **Detectar automáticamente** si devuelve HTML (no implementado)
3. **Fallback al endpoint anterior** `obtener-log-cortes`
4. **Transformar automáticamente** los datos del formato anterior al nuevo formato

### Código de Fallback

```javascript
// Intentar nuevo endpoint
const newEndpointResponse = await fetch(`/api/connection-events-history/${connectionId}`);

// Detectar si devuelve HTML (no implementado)
if (responseText.includes('<!doctype html>')) {
    throw new Error('Endpoint no implementado');
}

// Fallback al endpoint anterior
const fallbackResponse = await fetch('/api/obtener-log-cortes', {
    method: 'POST',
    body: JSON.stringify({ id_conexion: connectionId })
});
```

## Requerimientos para el Backend

### 1. Implementar Nuevo Endpoint

```javascript
// GET /api/connection-events-history/:connectionId
app.get('/api/connection-events-history/:connectionId', async (req, res) => {
    try {
        const { connectionId } = req.params;
        
        // Consultar tabla connection_events
        const events = await db.query(`
            SELECT id, event_type, event_time, detection_method, additional_info 
            FROM connection_events 
            WHERE connection_id = ? 
            ORDER BY event_time DESC
        `, [connectionId]);
        
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

### 2. Formato de Respuesta Esperado

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "event_type": "online",
      "event_time": "2025-01-06T15:30:00.000Z",
      "detection_method": "intelligent_polling",
      "additional_info": "{\"previous_status\":\"offline\",\"download_rate\":50000,\"upload_rate\":25000,\"response_time\":45}"
    },
    {
      "id": 122,
      "event_type": "offline",
      "event_time": "2025-01-06T14:25:00.000Z",
      "detection_method": "intelligent_polling",
      "additional_info": "{\"previous_status\":\"online\",\"download_rate\":0,\"upload_rate\":0,\"response_time\":null}"
    }
  ]
}
```

### 3. Verificar Sistema de Polling

**Pregunta crítica**: ¿Está funcionando el sistema de sondeo inteligente que debería registrar eventos en `connection_events`?

#### Verificaciones Necesarias:

1. **Tabla `connection_events` existe?**
2. **Sistema de polling está activo?**
3. **Hay conexiones con eventos registrados?**

```sql
-- Verificar si hay datos en la tabla
SELECT COUNT(*) as total_events FROM connection_events;

-- Ver últimos eventos registrados
SELECT * FROM connection_events ORDER BY event_time DESC LIMIT 10;

-- Verificar eventos por conexión
SELECT connection_id, COUNT(*) as event_count 
FROM connection_events 
GROUP BY connection_id 
HAVING event_count > 0;
```

## Estado Actual del Frontend

✅ **FUNCIONAL**: El componente funciona con el endpoint anterior  
✅ **PREPARADO**: Automáticamente usará el nuevo endpoint cuando esté disponible  
✅ **BACKWARD COMPATIBLE**: Mantiene compatibilidad con datos existentes

## Próximos Pasos

### Para el Backend Team:

1. **INMEDIATO**: Verificar si la tabla `connection_events` tiene datos
2. **INMEDIATO**: Proporcionar IDs de conexiones con eventos para testing
3. **CORTO PLAZO**: Implementar endpoint `GET /api/connection-events-history/:connectionId`
4. **MEDIANO PLAZO**: Verificar que el sistema de polling esté registrando eventos

### Para Testing:

Una vez implementado el endpoint, probar con:
```bash
curl -X GET "https://wellnet-rd.com:444/api/connection-events-history/[CONNECTION_ID]"
```

## Contacto

**Frontend**: Endpoint ya preparado con fallback automático  
**Backend**: Implementar endpoint según especificaciones arriba  
**Testing**: Validar que eventos se registren correctamente en la BD

---
**Status**: ⏳ ESPERANDO IMPLEMENTACIÓN BACKEND  
**Impacto**: 🟡 MEDIO - Feature funciona con datos limitados  
**Urgencia**: 🟡 MEDIO - No bloquea desarrollo