# Nuevo Endpoint: Desasignar Configuración

## Resumen
Necesitamos crear un nuevo endpoint que desasigne la configuración de una conexión sin afectar la tabla `routers_direcciones_ip`. Este endpoint debe limpiar la configuración de la base de datos y eliminar elementos específicos del MikroTik.

## Especificación del Endpoint

### **Endpoint**: `POST /api/configuracion/desasignar`

### **Propósito**
Desasignar la configuración de una conexión específica sin eliminar la IP de la tabla de routers. Solo limpia la configuración y los elementos del MikroTik.

### **Request Body**
```json
{
    "id_conexion": 123,
    "direccion_ip": "192.168.1.100"
}
```

### **Headers**
```json
{
    "Content-Type": "application/json",
    "X-Operation-ID": "remove-config-1721181234567-abc123xyz",
    "X-User-ID": "456"
}
```

### **Response Success**
```json
{
    "success": true,
    "message": "Configuración desasignada exitosamente",
    "data": {
        "id_conexion": 123,
        "direccion_ip": "192.168.1.100",
        "desasignado_en": "2025-07-17T03:20:00.000Z"
    }
}
```

### **Response Error**
```json
{
    "success": false,
    "message": "Error al desasignar configuración",
    "error": "Detalles del error"
}
```

## Funcionalidad Requerida

### **1. Base de Datos**
- **Limpiar configuración**: Eliminar o marcar como desasignada la configuración en la tabla correspondiente
- **NO tocar `routers_direcciones_ip`**: Mantener la IP disponible en la tabla de routers
- **Actualizar estado**: Marcar la conexión como sin configuración

### **2. MikroTik (Router)**
El backend ya sabe cómo hacer esto desde otros endpoints, necesita:

- **Eliminar Queue**: Quitar la cola de tráfico específica para esta IP
- **Eliminar DHCP Leasing**: Remover el lease DHCP asignado
- **Eliminar PPPoE Secret**: Quitar el secreto PPPoE si existe

### **3. Logging de Progreso**
Si se proporciona `X-Operation-ID`, enviar actualizaciones de progreso:

```javascript
// Paso 1: Validación
progressManager.updateStep(operationId, 'remove-router', 'in_progress', 'Validando configuración...', 20);

// Paso 2: Limpieza de base de datos
progressManager.updateStep(operationId, 'remove-router', 'in_progress', 'Limpiando configuración de base de datos...', 40);

// Paso 3: Conectando al router
progressManager.updateStep(operationId, 'remove-router', 'in_progress', 'Conectando al MikroTik...', 60);

// Paso 4: Eliminando elementos del router
progressManager.updateStep(operationId, 'remove-router', 'in_progress', 'Eliminando Queue, DHCP y PPPoE...', 80);

// Paso 5: Completado
progressManager.updateStep(operationId, 'remove-router', 'completed', 'Configuración desasignada exitosamente', 100);
```

## Diferencias con Endpoints Existentes

### **vs `/api/routers/quitar-conexion`**
- **Actual**: Elimina la IP de `routers_direcciones_ip`
- **Nuevo**: Mantiene la IP en `routers_direcciones_ip`

### **vs `/api/configuracion/eliminar`**
- **Actual**: Elimina toda la configuración del sistema
- **Nuevo**: Solo desasigna la configuración de la conexión específica

## Implementación Sugerida

### **Estructura del Endpoint**
```javascript
app.post('/api/configuracion/desasignar', async (req, res) => {
    const { id_conexion, direccion_ip } = req.body;
    const userId = req.headers['x-user-id'];
    const operationId = req.headers['x-operation-id'];
    
    try {
        // Paso 1: Validar datos
        if (operationId) {
            progressManager.updateStep(operationId, 'remove-router', 'in_progress', 'Validando configuración...', 20);
        }
        
        // Validar que la configuración existe
        const config = await validarConfiguracion(id_conexion, direccion_ip);
        if (!config) {
            throw new Error('Configuración no encontrada');
        }
        
        // Paso 2: Limpiar base de datos
        if (operationId) {
            progressManager.updateStep(operationId, 'remove-router', 'in_progress', 'Limpiando configuración de base de datos...', 40);
        }
        
        await desasignarConfiguracionBD(id_conexion);
        
        // Paso 3: Conectar al router
        if (operationId) {
            progressManager.updateStep(operationId, 'remove-router', 'in_progress', 'Conectando al MikroTik...', 60);
        }
        
        const routerConnection = await conectarMikroTik(config.router_id);
        
        // Paso 4: Limpiar elementos del router
        if (operationId) {
            progressManager.updateStep(operationId, 'remove-router', 'in_progress', 'Eliminando Queue, DHCP y PPPoE...', 80);
        }
        
        await Promise.all([
            eliminarQueue(routerConnection, direccion_ip),
            eliminarDHCPLease(routerConnection, direccion_ip),
            eliminarPPPoESecret(routerConnection, config.usuario_pppoe)
        ]);
        
        // Paso 5: Completar
        if (operationId) {
            progressManager.updateStep(operationId, 'remove-router', 'completed', 'Configuración desasignada exitosamente', 100);
        }
        
        res.json({
            success: true,
            message: 'Configuración desasignada exitosamente',
            data: {
                id_conexion,
                direccion_ip,
                desasignado_en: new Date().toISOString()
            }
        });
        
    } catch (error) {
        if (operationId) {
            progressManager.updateStep(operationId, 'remove-router', 'error', `Error: ${error.message}`, 0);
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al desasignar configuración',
            error: error.message
        });
    }
});
```

## Funciones Auxiliares Requeridas

### **1. `desasignarConfiguracionBD(id_conexion)`**
- Marcar la configuración como desasignada
- NO eliminar de `routers_direcciones_ip`
- Limpiar campos de configuración en la tabla de conexiones

### **2. `eliminarQueue(routerConnection, ip)`**
- Eliminar la cola de tráfico para la IP específica
- Función que ya existe en el backend

### **3. `eliminarDHCPLease(routerConnection, ip)`**
- Remover el lease DHCP asignado
- Función que ya existe en el backend

### **4. `eliminarPPPoESecret(routerConnection, usuario)`**
- Quitar el secreto PPPoE si existe
- Función que ya existe en el backend

## Casos de Uso

### **Éxito**
- Configuración desasignada de la base de datos
- Queue eliminada del MikroTik
- DHCP lease removido
- PPPoE secret eliminado (si existe)
- IP permanece disponible en `routers_direcciones_ip`

### **Error**
- Error de conexión al MikroTik
- Configuración no encontrada
- Error en base de datos

### **Validaciones**
- Verificar que `id_conexion` existe
- Verificar que `direccion_ip` es válida
- Verificar que la configuración existe y está asignada
- Verificar permisos del usuario

## Integración con Frontend

El frontend ya está preparado para usar este endpoint:
- URL: `https://wellnet-rd.com:444/api/configuracion/desasignar`
- Headers: `X-Operation-ID` y `X-User-ID`
- Payload: `{ id_conexion, direccion_ip }`
- Progreso en tiempo real compatible

Este endpoint proporcionará la funcionalidad exacta que necesitas: desasignar la configuración sin afectar la disponibilidad de la IP en el sistema.