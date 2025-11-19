# Implementación de Endpoints TR-069 Stats para ONUs

## Contexto del Proyecto

Estamos trabajando en una aplicación ISP que gestiona OLTs (Optical Line Terminals) y ONUs (Optical Network Units). Acabamos de implementar en el frontend React Native una pantalla completa de "TR-069 Statistics" que muestra información detallada de las ONUs que soportan el protocolo TR-069 (CWMP).

## Objetivo

Necesito que implementes los endpoints del backend para obtener las estadísticas TR-069 de las ONUs. Vamos a empezar con las siguientes secciones prioritarias:

1. **General** - Información general del dispositivo
2. **IP Interface 1.1** - Primera interfaz WAN (típicamente estática para TR-069)
3. **IP Interface 2.1** - Segunda interfaz WAN (típicamente DHCP para internet)
4. **Wireless LAN 1** - Configuración WiFi 2.4GHz
5. **Wifi 2.4GHz Site Survey** - Escaneo de redes WiFi cercanas

## Arquitectura Actual

### Backend
- FastAPI con Python
- Conexión a OLTs mediante Telnet/SSH
- Scripts Python en `scripts_olt/` para cada marca de OLT
- Actualmente soportamos OLTs Huawei y ZTE

### Frontend
La pantalla TR-069 Stats ya está implementada y espera recibir datos en el siguiente formato:

```typescript
// Endpoint esperado
GET /api/olts/{olt_id}/onus/{onu_serial}/tr069-stats

// Headers
Authorization: Bearer {token}
```

## Estructura de Datos Esperada

### 1. General Section

```json
{
  "general": {
    "manufacturer": "ETCH Technologies Co., Ltd (OUI: 00259E)",
    "modelName": "HS8545M5",
    "softwareVersion": "V5R019C20S100",
    "hardwareVersion": "147C.A",
    "provisioningCode": "sOLT.rDHC",
    "serialNumber": "4857544325F08D9D",
    "cpuUsage": "2%",
    "totalRam": "256 MB",
    "freeRam": "131 MB",
    "uptime": "2025-11-17 21:24:50",
    "uptimeAgo": "3 hours, 26 minutes, 38 seconds ago"
  }
}
```

**Campos requeridos:**
- `manufacturer` - Fabricante y OUI
- `modelName` - Modelo de la ONU
- `softwareVersion` - Versión de firmware
- `hardwareVersion` - Versión de hardware
- `provisioningCode` - Código de aprovisionamiento TR-069
- `serialNumber` - Número de serie
- `cpuUsage` - Uso de CPU en porcentaje
- `totalRam` - RAM total
- `freeRam` - RAM libre
- `uptime` - Timestamp del último reinicio
- `uptimeAgo` - Tiempo relativo desde el último reinicio

### 2. IP Interface 1.1 (WAN TR-069/Management)

```json
{
  "ipInterface11": {
    "name": "OLT_C_TR069_Static_WAN",
    "addressingType": "Static",
    "connectionStatus": "Connected",
    "uptime": "2025-11-17 21:25:41",
    "uptimeAgo": "3 hours, 28 minutes, 13 seconds ago",
    "ipAddress": "10.254.12.207",
    "subnetMask": "255.255.224.0",
    "defaultGateway": "10.254.0.1",
    "dnsServers": "8.8.8.8,1.1.1.1",
    "lastConnectionError": "unknown",
    "macAddress": "34:0A:98:97:A8:A0",
    "maxMtuSize": "1500",
    "natEnabled": false,
    "vlanId": "69"
  }
}
```

**Campos requeridos:**
- `name` - Nombre de la interfaz
- `addressingType` - "Static" o "DHCP"
- `connectionStatus` - "Connected", "Disconnected", etc.
- `uptime` - Timestamp de la última conexión
- `uptimeAgo` - Tiempo relativo
- `ipAddress` - Dirección IP
- `subnetMask` - Máscara de subred
- `defaultGateway` - Gateway por defecto
- `dnsServers` - Servidores DNS (separados por coma)
- `lastConnectionError` - Último error o "unknown"/"no error"
- `macAddress` - Dirección MAC
- `maxMtuSize` - Tamaño MTU
- `natEnabled` - Boolean si NAT está habilitado
- `vlanId` - ID de VLAN

### 3. IP Interface 2.1 (WAN Internet)

```json
{
  "ipInterface21": {
    "name": "Internet_DHCP",
    "addressingType": "DHCP",
    "connectionStatus": "Connected",
    "uptime": "2025-11-17 21:25:48",
    "uptimeAgo": "3 hours, 29 minutes, 26 seconds ago",
    "ipAddress": "10.108.0.210",
    "subnetMask": "255.255.255.0",
    "defaultGateway": "10.108.0.1",
    "dnsServers": "8.8.8.8,1.1.1.1",
    "ipv6Address": "fc00:8::360a:98ff:fe97:a8a1",
    "ipv6Gateway": "fe80::6f4:1cff:fe00:9c01",
    "ipv6DelegatedPrefix": "2803:1510:720:2900::/56",
    "lastConnectionError": "no error",
    "macAddress": "34:0A:98:97:A8:A1",
    "maxMtuSize": "1500",
    "natEnabled": true,
    "vlanId": "108"
  }
}
```

**Campos adicionales (opcionales):**
- `ipv6Address` - Dirección IPv6 si está disponible
- `ipv6Gateway` - Gateway IPv6
- `ipv6DelegatedPrefix` - Prefijo delegado IPv6

### 4. Wireless LAN 1 (WiFi 2.4GHz)

```json
{
  "wirelessLan": {
    "ssid": "Marleny",
    "password": "",
    "authMode": "WPA/WPA2 PreSharedKey",
    "status": "Up",
    "enable": "Yes",
    "rfBand": "2.4GHz",
    "standard": "802.11 b/g/n",
    "radioEnabled": "Yes",
    "totalAssociations": "2",
    "ssidAdvertisementEnabled": "Yes",
    "wpaEncryption": "TKIP + AES",
    "channelWidth": "Auto 20/40 MHZ",
    "autoChannel": "on",
    "channel": "11",
    "countryDomain": "CN - China",
    "txPower": "100"
  }
}
```

**Campos requeridos:**
- `ssid` - Nombre de la red WiFi
- `password` - Contraseña (puede estar vacía por seguridad)
- `authMode` - Modo de autenticación
- `status` - "Up", "Down"
- `enable` - "Yes", "No"
- `rfBand` - "2.4GHz" o "5GHz"
- `standard` - Estándar 802.11 (b/g/n/ac/ax)
- `radioEnabled` - "Yes", "No"
- `totalAssociations` - Número de dispositivos conectados
- `ssidAdvertisementEnabled` - Si el SSID es visible
- `wpaEncryption` - Tipo de encriptación
- `channelWidth` - Ancho de canal
- `autoChannel` - "on", "off"
- `channel` - Número de canal actual
- `countryDomain` - Dominio regulatorio
- `txPower` - Potencia de transmisión (0-100)

### 5. Wifi 2.4GHz Site Survey

```json
{
  "wifiSurvey": {
    "hasRecords": false,
    "networks": []
  }
}
```

**Campos cuando hay redes detectadas:**
```json
{
  "wifiSurvey": {
    "hasRecords": true,
    "networks": [
      {
        "ssid": "RedVecina",
        "channel": "6",
        "signalStrength": "-65 dBm",
        "security": "WPA2"
      }
    ]
  }
}
```

## Implementación Técnica Requerida

### 1. Endpoint Principal

**Ruta:** `/api/olts/{olt_id}/onus/{onu_serial}/tr069-stats`

**Método:** GET

**Parámetros:**
- `olt_id` (path) - ID de la OLT
- `onu_serial` (path) - Serial de la ONU

**Headers:**
- `Authorization: Bearer {token}` - Token JWT del usuario

**Response exitoso (200):**
```json
{
  "success": true,
  "data": {
    "general": { /* datos de general */ },
    "ipInterface11": { /* datos de interface 1.1 */ },
    "ipInterface21": { /* datos de interface 2.1 */ },
    "wirelessLan": { /* datos de wireless */ },
    "wifiSurvey": { /* datos de survey */ }
  },
  "message": "TR-069 statistics retrieved successfully"
}
```

**Response de error (400/500):**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

### 2. Script de Comunicación TR-069

Necesitas crear scripts que se comuniquen con las ONUs a través de TR-069/CWMP. Aquí hay dos opciones:

#### Opción A: Comunicación directa con ACS (TR-069 Server)
Si tienes un servidor ACS (Auto Configuration Server) como GenieACS, SmartOLT, etc.:

1. Crear cliente para consultar el ACS
2. El ACS ya tiene conexión CWMP con las ONUs
3. Obtener los parámetros TR-069 del ACS

**Parámetros TR-069 a consultar:**

```python
# Para General
"Device.DeviceInfo.Manufacturer"
"Device.DeviceInfo.ModelName"
"Device.DeviceInfo.SoftwareVersion"
"Device.DeviceInfo.HardwareVersion"
"Device.DeviceInfo.ProvisioningCode"
"Device.DeviceInfo.SerialNumber"
"Device.DeviceInfo.ProcessStatus.CPUUsage"
"Device.DeviceInfo.MemoryStatus.Total"
"Device.DeviceInfo.MemoryStatus.Free"
"Device.DeviceInfo.UpTime"

# Para IP Interface
"Device.IP.Interface.1.Name"
"Device.IP.Interface.1.Enable"
"Device.IP.Interface.1.Status"
"Device.IP.Interface.1.IPv4Address.1.IPAddress"
"Device.IP.Interface.1.IPv4Address.1.SubnetMask"
"Device.IP.Interface.1.Stats.BytesSent"
"Device.IP.Interface.1.Stats.BytesReceived"

# Para WiFi
"Device.WiFi.SSID.1.SSID"
"Device.WiFi.SSID.1.Enable"
"Device.WiFi.Radio.1.Channel"
"Device.WiFi.Radio.1.TransmitPower"
"Device.WiFi.AccessPoint.1.AssociatedDeviceNumberOfEntries"
```

#### Opción B: Comandos CLI de la OLT
Si no tienes ACS, puedes obtener la info desde la OLT:

**Para Huawei:**
```bash
display ont info 0 {slot} {pon} {ont_id}
display ont wan-info 0 {slot} {pon} {ont_id}
display ont wifi-info 0 {slot} {pon} {ont_id}
```

**Para ZTE:**
```bash
show gpon onu detail-info gpon-onu_{frame}/{slot}/{pon}:{ont_id}
show pon onu uncfg gpon_olt-{frame}/{slot}/{pon}
```

### 3. Estructura del Código Sugerida

```python
# backend/app/api/routes/tr069.py

from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.api.deps import get_current_user
from app.scripts_olt.tr069_stats import get_tr069_statistics

router = APIRouter()

@router.get("/olts/{olt_id}/onus/{onu_serial}/tr069-stats")
async def get_onu_tr069_stats(
    olt_id: int,
    onu_serial: str,
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene estadísticas TR-069 de una ONU específica
    """
    try:
        # Obtener información de la OLT desde la BD
        olt = await get_olt_by_id(olt_id)
        if not olt:
            raise HTTPException(status_code=404, detail="OLT not found")

        # Obtener información de la ONU
        onu = await get_onu_by_serial(onu_serial, olt_id)
        if not onu:
            raise HTTPException(status_code=404, detail="ONU not found")

        # Obtener estadísticas TR-069
        stats = await get_tr069_statistics(
            olt_ip=olt.ip,
            olt_user=olt.username,
            olt_password=olt.password,
            olt_brand=olt.brand,
            onu_serial=onu_serial,
            slot=onu.slot,
            pon=onu.pon,
            ont_id=onu.ont_id
        )

        return {
            "success": True,
            "data": stats,
            "message": "TR-069 statistics retrieved successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving TR-069 statistics: {str(e)}"
        )
```

```python
# backend/app/scripts_olt/tr069_stats.py

async def get_tr069_statistics(
    olt_ip: str,
    olt_user: str,
    olt_password: str,
    olt_brand: str,
    onu_serial: str,
    slot: int,
    pon: int,
    ont_id: int
) -> dict:
    """
    Obtiene estadísticas TR-069 de una ONU
    """
    if olt_brand.lower() == "huawei":
        return await get_huawei_tr069_stats(
            olt_ip, olt_user, olt_password, slot, pon, ont_id
        )
    elif olt_brand.lower() == "zte":
        return await get_zte_tr069_stats(
            olt_ip, olt_user, olt_password, slot, pon, ont_id
        )
    else:
        raise ValueError(f"Unsupported OLT brand: {olt_brand}")


async def get_huawei_tr069_stats(
    olt_ip: str, user: str, password: str,
    slot: int, pon: int, ont_id: int
) -> dict:
    """
    Obtiene stats TR-069 de ONU Huawei
    """
    # TODO: Implementar comunicación con OLT/ACS Huawei
    # Aquí debes ejecutar los comandos necesarios

    return {
        "general": {
            # Parse data from OLT commands
        },
        "ipInterface11": {
            # Parse data
        },
        # ... más secciones
    }


async def get_zte_tr069_stats(
    olt_ip: str, user: str, password: str,
    slot: int, pon: int, ont_id: int
) -> dict:
    """
    Obtiene stats TR-069 de ONU ZTE
    """
    # TODO: Implementar comunicación con OLT/ACS ZTE

    return {
        "general": {
            # Parse data from OLT commands
        },
        # ... más secciones
    }
```

## Notas Importantes

1. **Timeout**: Las consultas TR-069 pueden tardar varios segundos. Considera usar un timeout de al menos 30 segundos.

2. **Caché**: Sería ideal implementar caché (Redis) para no consultar la misma información repetidamente en corto tiempo.

3. **ONUs sin TR-069**: No todas las ONUs soportan TR-069. Debes manejar el caso cuando una ONU no tiene capacidades TR-069:
```json
{
  "success": false,
  "error": "ONU does not support TR-069 protocol",
  "code": "TR069_NOT_SUPPORTED"
}
```

4. **Datos Mock para Testing**: Mientras implementas, puedes usar datos mock basados en los ejemplos que te proporcioné.

5. **Prioridad de Implementación**:
   - ✅ Primero: General + IP Interface 1.1
   - ✅ Segundo: IP Interface 2.1
   - ✅ Tercero: Wireless LAN
   - ⏸️ Cuarto: WiFi Survey (puede ser opcional inicialmente)

## Testing

Para probar el endpoint desde el frontend, el flujo es:

1. Usuario navega a ONU Details screen
2. Presiona botón "TR-069 Stats"
3. Frontend llama: `GET /api/olts/{oltId}/onus/{onuSerial}/tr069-stats`
4. Backend devuelve datos
5. Frontend muestra la información en la pantalla TR-069 Stats

## Preguntas para Aclarar

1. ¿Tienen un servidor ACS (GenieACS, SmartOLT, etc.) configurado?
2. ¿Las ONUs ya están registradas en el ACS con TR-069 activo?
3. ¿Qué marcas de ONUs soportan TR-069 en tu red? (Huawei, ZTE, GPON genérico, etc.)
4. ¿Prefieres comunicación directa con ACS o parseo desde CLI de la OLT?

## Resultado Esperado

Al finalizar la implementación, el usuario podrá:
- Ver información detallada del dispositivo ONU
- Ver configuración de interfaces WAN (TR-069 e Internet)
- Ver configuración WiFi completa
- Potencialmente ver redes WiFi cercanas detectadas por la ONU

¿Tienes acceso a un ACS o necesitas que implemente la solución mediante comandos CLI de las OLTs?
