# 🚨 SOLICITUD URGENTE: Implementación de Endpoints para Cortes Masivos

## 📋 Descripción del Problema

El frontend está intentando realizar cortes masivos desde la pantalla `DetalleCiclo.tsx` pero está recibiendo **ERROR 404** porque los endpoints no existen en el backend.

## 🔗 Endpoints Requeridos (FALTANTES)

### 1. **Obtener Conexiones Morosas**
- **URL**: `POST https://wellnet-rd.com:444/api/conexiones/obtener-morosos`
- **Payload**:
```json
{
  "id_ciclo": 123
}
```
- **Respuesta Esperada**:
```json
{
  "success": true,
  "conexiones": [
    {
      "id_conexion": 1695,
      "id_cliente": 456,
      "direccion_ip": "192.168.1.100",
      "estado_actual": "activo",
      "dias_morosidad": 15,
      "monto_pendiente": 1500.00
    }
  ],
  "total": 25
}
```

### 2. **Cortar Conexión Individual**
- **URL**: `POST https://wellnet-rd.com:444/api/conexiones/cortar-individual`
- **Payload**:
```json
{
  "id_conexion": 1695,
  "id_usuario": 789,
  "id_estado_conexion": 4,
  "motivo": "Corte masivo por morosidad"
}
```
- **Respuesta Esperada**:
```json
{
  "success": true,
  "message": "Conexión cortada exitosamente",
  "id_conexion": 1695,
  "nuevo_estado": "cortado",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3. **Completar Proceso de Cortes Masivos**
- **URL**: `POST https://wellnet-rd.com:444/api/conexiones/cortes-masivos-completar`
- **Payload**:
```json
{
  "id_ciclo": 123,
  "id_usuario": 789,
  "id_estado_conexion": 4,
  "conexiones_procesadas": 25
}
```
- **Respuesta Esperada**:
```json
{
  "success": true,
  "message": "Proceso de cortes masivos completado",
  "ciclo_id": 123,
  "total_procesadas": 25,
  "timestamp": "2024-01-15T10:35:00Z"
}
```

## 🎯 Funcionalidad Requerida

### **Obtener Conexiones Morosas**
- Buscar todas las conexiones del ciclo que tengan facturas pendientes
- Considerar los `dias_gracia` del ciclo para determinar morosidad
- Filtrar solo conexiones que están actualmente "activas" (no ya cortadas)
- Incluir información del cliente y monto pendiente

### **Cortar Conexión Individual**
- Cambiar el estado de la conexión a "cortado" (id_estado_conexion = 4)
- **IMPORTANTE**: Realizar el corte físico a través del router MikroTik
- Registrar en logs quién realizó el corte y cuándo
- Actualizar el estado en la base de datos

### **Completar Proceso**
- Actualizar estadísticas del ciclo
- Registrar el proceso de corte masivo en logs
- Actualizar contadores de conexiones cortadas

## 🔧 Integración con MikroTik

**CRÍTICO**: Los cortes deben ser **físicos**, no solo cambios de estado en la base de datos.

### Pasos para Corte Real:
1. Obtener la IP de la conexión desde `router_direcciones_ip`
2. Conectar al router MikroTik vía SSH/API
3. Crear/activar regla de firewall para bloquear la IP
4. Verificar que el corte se aplicó correctamente
5. Solo entonces actualizar el estado en la base de datos

### Ejemplo de Regla MikroTik:
```bash
/ip firewall filter add chain=forward src-address=192.168.1.100 action=drop comment="Corte por morosidad - Conexion 1695"
```

## 📊 Criterios de Morosidad

Una conexión es morosa si:
- Tiene facturas pendientes del ciclo actual
- Ha pasado la fecha límite de pago (fecha_final + dias_gracia)
- Su estado actual es "activo" (no está ya cortada)

## 🚨 Consideraciones de Seguridad

1. **Verificar Permisos**: Solo usuarios con permisos de cortes masivos
2. **Logs Detallados**: Registrar cada corte con timestamp y usuario
3. **Rollback**: Considerar mecanismo para revertir cortes masivos
4. **Timeouts**: Evitar que el proceso se cuelgue en routers lentos

## 🔍 Testing Recomendado

1. **Test con 1 conexión**: Verificar que el corte físico funciona
2. **Test con 5 conexiones**: Verificar que el batch processing funciona
3. **Test de rollback**: Verificar que se pueden reactivar conexiones
4. **Test de errores**: Qué pasa si un router no responde

## 📱 Comunicación con Frontend

El frontend ya está preparado para:
- Mostrar progreso en tiempo real
- Manejar errores de conexión
- Procesar respuestas en batches de 5 conexiones
- Mostrar estadísticas de éxito/fallo

## ⏰ Prioridad: ALTA

Esta funcionalidad es crítica para las operaciones diarias del ISP. Los cortes masivos son necesarios para el flujo de trabajo de facturación.

## 📞 Próximos Pasos

1. **Confirmar** que van a implementar estos endpoints
2. **Estimar** tiempo de desarrollo
3. **Coordinar** testing conjunto cuando esté listo
4. **Notificar** cuando esté deployed para testing

---

**Desarrollado por**: Frontend Team  
**Fecha**: $(date)  
**Archivo de referencia**: `src/pantallas/factura/DetalleCiclo.tsx:281-379`