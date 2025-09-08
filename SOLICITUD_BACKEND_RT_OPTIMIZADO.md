# Solicitud: Optimización de Datos RT Solo para Conexiones Visibles

## 📋 Descripción

El frontend ahora enviará al backend **solo los IDs de las conexiones que están visibles en pantalla** para obtener datos en tiempo real, en lugar de obtener datos de todas las conexiones.

## 🔧 Cambios Requeridos en el Backend

### Endpoint Modificado
- **URL**: `/api/active-connections?realtime=true`
- **Método**: Cambiar de `GET` a `POST`
- **Body**: 
```json
{
  "connection_ids": [1695, 1234, 5678, 9012]
}
```

### Comportamiento Esperado
1. **Con `connection_ids`**: Devolver datos RT solo de esas conexiones específicas
2. **Sin `connection_ids`**: Comportamiento actual (todas las conexiones activas)

## 📊 Beneficios

### Para el Servidor
- ✅ **Menos consultas a MikroTik**: Solo para conexiones visibles
- ✅ **Respuesta más rápida**: Menos datos procesados por request
- ✅ **Menor carga**: No procesar 50+ conexiones si solo 10 están visibles

### Para el Usuario
- ✅ **Actualización instantánea**: Al cambiar filtros, datos RT inmediatos
- ✅ **Mayor eficiencia**: Solo consume recursos para lo que se ve
- ✅ **Mejor UX**: Respuesta más rápida al navegar

## 🎯 Casos de Uso

### Filtrado por Estado
```
Usuario filtra por "Activos" → Frontend envía solo IDs activos → Backend consulta solo esos
```

### Búsqueda por Cliente
```
Usuario busca "Maria" → Frontend envía solo IDs de Maria → Backend consulta solo esos
```

### Paginación (futuro)
```
Usuario ve página 1 → Frontend envía IDs de página 1 → Backend consulta solo esos
```

## 📝 Implementación Sugerida

```javascript
// En el controlador activeConnectionsController.js
if (req.body.connection_ids && Array.isArray(req.body.connection_ids)) {
    // Filtrar solo las conexiones solicitadas
    const requestedIds = req.body.connection_ids;
    const filteredConnections = activeConnections.filter(conn => 
        requestedIds.includes(conn.id_conexion)
    );
    
    console.log(`🎯 Obteniendo RT para ${requestedIds.length} conexiones específicas`);
    // Procesar solo filteredConnections en lugar de todas
} else {
    // Comportamiento actual para retrocompatibilidad
    console.log(`🔄 Obteniendo RT para todas las conexiones activas`);
}
```

## 🚀 Resultado Esperado

**Antes**: 
- Request: GET sin parámetros
- Backend: Consulta 50 conexiones → Respuesta ~5-15 segundos
- Frontend: Recibe datos de todas, usa solo las visibles

**Después**:
- Request: POST con `connection_ids: [1695, 1234, 5678]`
- Backend: Consulta 3 conexiones → Respuesta ~1-3 segundos  
- Frontend: Recibe datos solo de las visibles

## 📋 Logs Frontend

El frontend ahora mostrará:
```
🔄 Obteniendo datos RT para 8 conexiones visibles: [1695, 1234, 5678, 9012, 1111]
🔄 Conexiones visibles cambiaron: 15 → 8, actualizando RT inmediatamente
RT: 8/8 • 6 activas
```

Esto permitirá un monitoreo mucho más eficiente y responsivo del sistema.