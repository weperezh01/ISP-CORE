# Requerimiento Backend: Datos en Tiempo Real para InterfaceDetailsScreen

## 📋 Resumen
Se requiere implementar endpoints específicos para obtener datos en tiempo real de interfaces individuales en la pantalla `InterfaceDetailsScreen.tsx`.

## 🎯 Funcionalidad Requerida
La pantalla `InterfaceDetailsScreen` debe mostrar datos actualizados automáticamente cada 3 segundos para una interfaz específica de un router.

## 🔗 Endpoints Necesarios

### 1. Datos de Tráfico de Interfaz Individual
**Endpoint:** `GET /api/router/{routerId}/interface/{interfaceName}/traffic`

**Descripción:** Obtiene datos de tráfico en tiempo real para una interfaz específica

**Parámetros:**
- `routerId`: ID del router (string)
- `interfaceName`: Nombre de la interfaz (string, ej: "ether1", "sfp-sfpplus1")

**Respuesta Esperada:**
```json
{
  "status": "success",
  "data": {
    "interface_name": "ether1",
    "tx_rate": 182100000,
    "rx_rate": 12800000,
    "tx_packets_per_sec": 18618,
    "rx_packets_per_sec": 7809,
    "tx_bytes": 1234567890,
    "rx_bytes": 9876543210,
    "tx_packets": 123456,
    "rx_packets": 654321,
    "tx_errors": 0,
    "rx_errors": 0,
    "tx_drops": 0,
    "rx_drops": 0,
    "timestamp": "2025-01-10T15:30:45Z"
  }
}
```

### 2. Detalles Completos de Interfaz Individual
**Endpoint:** `GET /api/router/{routerId}/interface/{interfaceName}`

**Descripción:** Obtiene información detallada y actualizada de una interfaz específica

**Parámetros:**
- `routerId`: ID del router (string)
- `interfaceName`: Nombre de la interfaz (string)

**Respuesta Esperada:**
```json
{
  "status": "success",
  "data": {
    "name": "ether1",
    "type": "ether",
    "running": true,
    "enabled": true,
    "mtu": 1500,
    "l2-mtu": 1518,
    "mac-address": "48:A9:8A:12:34:56",
    "arp": "enabled",
    "auto-negotiation": true,
    "duplex": "full",
    "speed": "1Gbps",
    "link-downs": 0,
    "rx-fcs-error": 0,
    "rx-align-error": 0,
    "rx-fragment": 0,
    "rx-overflow": 0,
    "tx-collision": 0,
    "tx-excessive-collision": 0,
    "tx-multiple-collision": 0,
    "tx-single-collision": 0,
    "tx-deferred": 0,
    "switch-info": {
      "port": 1,
      "switch-host": "switch1"
    },
    "comment": "Conexión principal WAN",
    "last-link-up-time": "jan/02/2025 14:23:15",
    "last-link-down-time": "jan/01/2025 08:15:30",
    "timestamp": "2025-01-10T15:30:45Z"
  }
}
```

## ⚙️ Implementación Frontend

### Configuración de Polling
- **Tráfico**: Actualización cada 3 segundos
- **Detalles de interfaz**: Actualización cada 30 segundos
- **Control de pausar/reanudar**: Disponible mediante botón en toolbar

### Mapeo de Datos
El frontend mapea automáticamente los datos recibidos:
```javascript
// Para compatibilidad con componentes existentes
const mappedTrafficData = {
  upload_bps: data.tx_rate || 0,
  download_bps: data.rx_rate || 0
};
```

## 🚨 Manejo de Errores
- **404**: Interfaz no encontrada → Mostrar mensaje informativo
- **500**: Error del servidor → Continuar con datos anteriores
- **Timeout**: Sin respuesta → Mantener datos previos y mostrar indicador

## 🔧 Consideraciones Técnicas

### Rendimiento
- Los endpoints deben ser optimizados para respuestas rápidas (< 500ms)
- Implementar caché si es necesario para reducir carga en equipos
- Considerar rate limiting por router para evitar sobrecarga

### Compatibilidad
- Mantener compatibilidad con estructura existente de datos de tráfico
- Soportar tanto nombres cortos (`ether1`) como largos (`ethernet-1/0/1`)
- Manejar interfaces que pueden no existir o estar desconectadas

### Autenticación
- Usar el mismo sistema de autenticación existente
- Validar permisos de usuario para acceso a routers específicos

## 📱 Estado Actual del Frontend
✅ **Completado:**
- Interfaz de usuario con indicadores en tiempo real
- Sistema de polling configurado (pausar/reanudar)
- Mapeo de datos automático
- Manejo de estados de carga
- Navegación desde RouterDetailsScreen

⏳ **Pendiente (Backend):**
- Implementación de endpoints específicos
- Optimización de consultas a equipos MikroTik
- Configuración de caché y rate limiting

## 🧪 Testing
Una vez implementados los endpoints, se puede probar la funcionalidad:
1. Navegar a RouterDetailsScreen
2. Seleccionar cualquier interfaz
3. Verificar que los datos se actualicen automáticamente
4. Probar funcionalidad de pausar/reanudar
5. Verificar comportamiento con interfaces inactivas

## 📞 Contacto
Para dudas sobre la implementación frontend o estructura de datos esperada, contactar al equipo de desarrollo frontend.