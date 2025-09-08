# Solicitud de Mejora - Campos Adicionales de Conexiones

## 📋 Solicitud para el Desarrollador del Backend

### 🎯 **Objetivo**
Agregar campos adicionales de las conexiones que están disponibles en la base de datos pero no se están enviando en la respuesta actual.

### 📍 **Endpoint Afectado**
- **URL**: `https://wellnet-rd.com:444/api/lista-clientes`
- **Método**: POST
- **Parámetros**: `{ usuarioId, isp_id }`

### 📊 **Estructura Actual de Conexiones**
```json
{
  "conexiones": [
    {
      "id_conexion": 5684,
      "direccion": "Quebrada Honda, barrio la leche",
      "velocidad": null,
      "id_estado_conexion": 3,
      "estado": "Activa",
      "direccion_ip": "10.213.0.46"
    }
  ]
}
```

### 🗄️ **Campos Disponibles en la Tabla `conexiones`**
Según el schema de la base de datos, estos campos están disponibles pero no se envían:
- `fecha_contratacion` (datetime)
- `fecha_instalacion` (varchar)
- `precio` (decimal)
- `nombre_router` (varchar)
- `mac_address` (varchar)
- `instalador` (varchar)
- `velocidad_bajada` (float)
- `velocidad_subida` (float)

### ✅ **Estructura Solicitada**
```json
{
  "conexiones": [
    {
      "id_conexion": 5684,
      "direccion": "Quebrada Honda, barrio la leche",
      "velocidad": 50,
      "id_estado_conexion": 3,
      "estado": "Activa",
      "direccion_ip": "10.213.0.46",
      
      // 🆕 CAMPOS NUEVOS SOLICITADOS:
      "fecha_contratacion": "2024-03-15T10:30:00.000Z",  // Fecha de contratación
      "fecha_instalacion": "15/03/2024",                 // Fecha de instalación (varchar)
      "precio": "1500.00",                              // Precio mensual
      "nombre_router": "TP-Link Archer C6",            // Nombre del router
      "mac_address": "AA:BB:CC:DD:EE:FF",              // Dirección MAC
      "instalador": "Juan Pérez",                       // Técnico instalador
      "velocidad_bajada": 50.0,                        // Velocidad de bajada
      "velocidad_subida": 10.0                         // Velocidad de subida
    }
  ]
}
```

### 🎨 **Uso en la Aplicación**
Los nuevos campos se mostrarán como:
- **📅 Fecha Contratación**: "Contratado: 15 de marzo del 2024 a las 10:30 AM"
- **🔧 Fecha Instalación**: "Instalado: 15/03/2024" (tal como está en BD)
- **💰 Precio**: "Precio: RD$1,500"
- **📡 Router**: "Router: TP-Link Archer C6"
- **🔧 MAC**: "MAC: AA:BB:CC:DD:EE:FF"
- **👷 Instalador**: "Instalador: Juan Pérez"
- **⚡ Velocidades**: "Velocidad: 50/10 Mbps"

### 📝 **Notas Técnicas**
1. **Fecha Contratación**: Usar formato ISO 8601 del campo `fecha_contratacion`
2. **Fecha Instalación**: Mostrar tal como está almacenado en `fecha_instalacion` (varchar)
3. **Compatibilidad**: El frontend ya está preparado para todos estos campos
4. **Impacto**: Información técnica y comercial completa para cada conexión

### 🔄 **Código Frontend Preparado**
```javascript
// Fechas
{conexion.fecha_contratacion && (
    <Text>📅 Contratado: {formatearFecha(conexion.fecha_contratacion)}</Text>
)}
{conexion.fecha_instalacion && (
    <Text>🔧 Instalado: {conexion.fecha_instalacion}</Text>
)}

// Información técnica y comercial
{conexion.precio && (
    <Text>💰 Precio: RD${Number(conexion.precio).toLocaleString()}</Text>
)}
{conexion.nombre_router && (
    <Text>📡 Router: {conexion.nombre_router}</Text>
)}
{conexion.mac_address && (
    <Text>🔧 MAC: {conexion.mac_address}</Text>
)}
{conexion.instalador && (
    <Text>👷 Instalador: {conexion.instalador}</Text>
)}
```

### 🛠️ **Modificación Requerida en el Backend**
Agregar estos campos al SELECT de la consulta SQL en el endpoint `/api/lista-clientes`:

```sql
SELECT 
  c.id_cliente, c.nombres, c.apellidos, c.telefono1, c.cedula, c.fecha_creacion_cliente,
  con.id_conexion, con.direccion, con.velocidad, con.id_estado_conexion,
  con.fecha_contratacion, con.fecha_instalacion, con.precio, 
  con.nombre_router, con.mac_address, con.instalador,
  con.velocidad_bajada, con.velocidad_subida,
  ec.estado
FROM conexiones con
-- ... resto de la consulta
```

### 🚀 **Beneficios**
- ✅ Usuario puede ver cuándo se instaló cada conexión
- ✅ Mejor seguimiento histórico de conexiones
- ✅ Información más completa para soporte técnico
- ✅ Coherencia con las fechas de cliente que ya se muestran

### ⏱️ **Prioridad**
**Media** - Mejora la experiencia del usuario pero no es crítica para el funcionamiento básico.

---

**Desarrollado por**: Equipo Frontend WellNet  
**Fecha**: 27 de junio del 2025  
**Contacto**: [Tu información de contacto]