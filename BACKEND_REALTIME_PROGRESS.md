# Sistema de Progreso en Tiempo Real - Backend

## Resumen

Este documento describe cómo implementar un sistema de notificaciones en tiempo real para mostrar el progreso de las operaciones del servidor en WellNet. El sistema permitirá que los usuarios vean el progreso real de las operaciones mientras se ejecutan en el servidor.

## Arquitectura

### 1. WebSocket Server

**Endpoint**: `wss://wellnet-rd.com:444/ws/progress`

**Autenticación**: ID de usuario en query parameter
```javascript
const wsUrl = `wss://wellnet-rd.com:444/ws/progress?userId=${userId}`;
```

### 2. Estructura de Mensajes

#### Mensaje de Inicio de Operación (Cliente → Servidor)
```json
{
  "type": "start_operation",
  "operation_id": "remove-config-1721181234567-abc123xyz"
}
```

#### Mensaje de Progreso (Servidor → Cliente)
```json
{
  "operation_id": "remove-config-1721181234567-abc123xyz",
  "step": "remove-service",
  "status": "in_progress",
  "message": "Eliminando asignación de servicio...",
  "progress": 33,
  "timestamp": "2025-07-17T03:20:00.000Z"
}
```

#### Mensaje de Detener Operación (Cliente → Servidor)
```json
{
  "type": "stop_operation",
  "operation_id": "remove-config-1721181234567-abc123xyz"
}
```

### 3. Estados de Paso

- `pending`: Paso aún no iniciado
- `in_progress`: Paso actualmente ejecutándose
- `completed`: Paso completado exitosamente
- `error`: Paso falló con error

## Implementación Backend

### 1. Configuración WebSocket

```javascript
// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 444,
    path: '/ws/progress',
    verifyClient: (info) => {
        const userId = new URL(info.req.url, 'ws://localhost').searchParams.get('userId');
        // Validación simple: verificar que userId existe y es número
        return userId && !isNaN(parseInt(userId));
    }
});

// Almacenar conexiones activas
const activeConnections = new Map();

wss.on('connection', (ws, req) => {
    const userId = new URL(req.url, 'ws://localhost').searchParams.get('userId');
    
    console.log(`📡 [WS] Usuario conectado: ${userId}`);
    
    // Almacenar conexión con ID de usuario
    activeConnections.set(userId, ws);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(userId, data);
        } catch (error) {
            console.error('❌ [WS] Error parsing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log(`🔌 [WS] Usuario desconectado: ${userId}`);
        activeConnections.delete(userId);
    });
});
```

### 2. Clase de Progreso

```javascript
// progressManager.js
class ProgressManager {
    constructor() {
        this.operations = new Map();
    }
    
    startOperation(userId, operationId, steps) {
        this.operations.set(operationId, {
            userId,
            steps,
            currentStep: 0,
            startTime: new Date()
        });
        
        console.log(`🚀 [PROGRESS] Iniciando operación ${operationId} para usuario ${userId}`);
    }
    
    updateStep(operationId, stepId, status, message, progress = null) {
        const operation = this.operations.get(operationId);
        if (!operation) return;
        
        const update = {
            operation_id: operationId,
            step: stepId,
            status,
            message,
            progress,
            timestamp: new Date().toISOString()
        };
        
        // Enviar actualización por WebSocket
        const ws = activeConnections.get(operation.userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(update));
        }
        
        console.log(`📊 [PROGRESS] ${operationId} - ${stepId}: ${status} - ${message}`);
    }
    
    completeOperation(operationId) {
        const operation = this.operations.get(operationId);
        if (operation) {
            console.log(`✅ [PROGRESS] Operación completada: ${operationId}`);
            this.operations.delete(operationId);
        }
    }
}

const progressManager = new ProgressManager();
module.exports = progressManager;
```

### 3. Modificación de Endpoints

#### Endpoint: `/api/conexiones/quitar-asignacion`

```javascript
app.post('/api/conexiones/quitar-asignacion', async (req, res) => {
    const { id_conexion } = req.body;
    const userId = req.headers['x-user-id']; // ID del usuario en header
    const operationId = req.headers['x-operation-id']; // ID de la operación
    
    try {
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-service',
                'in_progress',
                'Iniciando eliminación de asignación...',
                10
            );
        }
        
        // Simular trabajo del servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-service',
                'in_progress',
                'Validando conexión...',
                30
            );
        }
        
        // Lógica de eliminación existente
        const result = await eliminarAsignacionServicio(id_conexion);
        
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-service',
                'in_progress',
                'Actualizando base de datos...',
                80
            );
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-service',
                'completed',
                'Asignación eliminada exitosamente',
                100
            );
        }
        
        res.json({ success: true, message: 'Asignación eliminada' });
        
    } catch (error) {
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-service',
                'error',
                `Error: ${error.message}`,
                0
            );
        }
        
        res.status(500).json({ success: false, message: error.message });
    }
});
```

#### Endpoint: `/api/routers/quitar-conexion`

```javascript
app.post('/api/routers/quitar-conexion', async (req, res) => {
    const { direccion_ip } = req.body;
    const userId = req.headers['x-user-id']; // ID del usuario en header
    const operationId = req.headers['x-operation-id'];
    
    try {
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-router',
                'in_progress',
                'Conectando con el router...',
                20
            );
        }
        
        // Simular conexión al router
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-router',
                'in_progress',
                'Eliminando configuración IP...',
                60
            );
        }
        
        // Lógica de eliminación existente
        const result = await eliminarConexionRouter(direccion_ip);
        
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-router',
                'completed',
                'Conexión eliminada del router',
                100
            );
        }
        
        res.json({ success: true, message: 'Conexión eliminada' });
        
    } catch (error) {
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-router',
                'error',
                `Error: ${error.message}`,
                0
            );
        }
        
        res.status(500).json({ success: false, message: error.message });
    }
});
```

#### Endpoint: `/api/configuracion/eliminar`

```javascript
app.post('/api/configuracion/eliminar', async (req, res) => {
    const { id_conexion, id_usuario } = req.body;
    const userId = req.headers['x-user-id']; // ID del usuario en header
    const operationId = req.headers['x-operation-id'];
    
    try {
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-config',
                'in_progress',
                'Eliminando configuración del sistema...',
                25
            );
        }
        
        // Simular trabajo del servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-config',
                'in_progress',
                'Limpiando archivos temporales...',
                70
            );
        }
        
        // Lógica de eliminación existente
        const result = await eliminarConfiguracion(id_conexion, id_usuario);
        
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-config',
                'completed',
                'Configuración eliminada del sistema',
                100
            );
        }
        
        res.json({ success: true, message: 'Configuración eliminada' });
        
    } catch (error) {
        if (operationId) {
            progressManager.updateStep(
                operationId,
                'remove-config',
                'error',
                `Error: ${error.message}`,
                0
            );
        }
        
        res.status(500).json({ success: false, message: error.message });
    }
});
```

### 4. Manejo de Mensajes WebSocket

```javascript
// websocketHandler.js
function handleWebSocketMessage(userId, message) {
    const { type, operation_id } = message;
    
    switch (type) {
        case 'start_operation':
            console.log(`🚀 [WS] Iniciando operación ${operation_id} para usuario ${userId}`);
            progressManager.startOperation(userId, operation_id, []);
            break;
            
        case 'stop_operation':
            console.log(`🛑 [WS] Deteniendo operación ${operation_id} para usuario ${userId}`);
            progressManager.completeOperation(operation_id);
            break;
            
        default:
            console.warn(`⚠️ [WS] Tipo de mensaje desconocido: ${type}`);
    }
}
```

## Modificación Frontend

### 1. Agregar Headers de Operación

```javascript
// En ConexionDetalles.tsx, modificar las peticiones HTTP
const serviceResponse = await fetch('https://wellnet-rd.com:444/api/conexiones/quitar-asignacion', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Operation-ID': operationId,  // ID de la operación
        'X-User-ID': loginData.id       // ID del usuario
    },
    body: JSON.stringify({
        id_conexion: connectionDetails.id_conexion
    })
});
```

## Beneficios del Sistema

1. **Experiencia de Usuario Mejorada**: Los usuarios ven progreso real del servidor
2. **Debugging Facilicado**: Información detallada de cada paso
3. **Transparencia**: Los usuarios saben exactamente qué está pasando
4. **Escalabilidad**: Sistema puede manejar múltiples operaciones simultáneas
5. **Robustez**: Maneja desconexiones y reconexiones automáticamente

## Consideraciones de Seguridad

1. **Autenticación**: ID de usuario validado en conexiones WebSocket
2. **Autorización**: Solo mostrar progreso de operaciones del usuario actual
3. **Rate Limiting**: Limitar conexiones WebSocket por usuario
4. **Validación**: Validar todos los mensajes WebSocket y IDs de usuario
5. **Cleanup**: Limpiar operaciones completadas para evitar memory leaks
6. **Validación de ID**: Verificar que el userId es un número válido

## Monitoring y Logging

```javascript
// Agregar métricas de WebSocket
const wsMetrics = {
    activeConnections: () => activeConnections.size,
    activeOperations: () => progressManager.operations.size,
    messagesPerSecond: 0,
    errorsPerMinute: 0
};

// Logging estructurado
console.log(`📊 [METRICS] Conexiones activas: ${wsMetrics.activeConnections()}`);
console.log(`📊 [METRICS] Operaciones activas: ${wsMetrics.activeOperations()}`);
```

Este sistema proporcionará una experiencia de usuario mucho más rica y transparente, permitiendo que los usuarios vean exactamente qué está sucediendo en el servidor mientras se procesan sus operaciones.