# Implementación de Endpoints TR-069 Configuration (Escritura) para ONUs

## Contexto del Proyecto

Acabamos de implementar la pantalla TR-069 Statistics que muestra datos de las ONUs. Ahora necesitamos implementar los endpoints que permitan **CONFIGURAR** (escribir/actualizar) parámetros de las ONUs a través de TR-069.

La pantalla del frontend ya está preparada con campos editables (TextInput), radio buttons (Yes/No), y dropdowns. Necesitamos los endpoints del backend para guardar estos cambios.

## Arquitectura Actual

### Frontend
- Pantalla TR-069 Stats con campos editables implementada
- React Native con TypeScript
- Campos con validación local
- Llamadas API con AsyncStorage para token

### Backend
- FastAPI con Python
- Conexión a OLTs mediante Telnet/SSH
- Scripts Python en `scripts_olt/` para cada marca
- Endpoint de lectura ya implementado: `GET /api/olts/realtime/:oltId/onus/:serial/tr069-stats`

## Objetivo

Implementar endpoints para **actualizar/configurar** los siguientes parámetros TR-069 de las ONUs:

### Secciones Prioritarias

1. **LAN DHCP Server** - Configuración del servidor DHCP LAN
2. **IP Interface 1.1** - Configuración de interfaz WAN estática (TR-069)
3. **IP Interface 2.1** - Configuración de interfaz WAN dinámica (Internet)
4. **Wireless LAN** - Configuración WiFi 2.4GHz
5. **General** - Provisioning codes

---

## 1. LAN DHCP Server Configuration

### Endpoint

**Ruta:** `POST /api/olts/realtime/:oltId/onus/:serial/tr069/lan-dhcp`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "dhcp_server_enable": true,
  "start_address": "192.168.1.100",
  "end_address": "192.168.1.200",
  "subnet_mask": "255.255.255.0",
  "dns_servers": "8.8.8.8,1.1.1.1",
  "domain_name": "local",
  "lease_time": 86400
}
```

**Campos:**
- `dhcp_server_enable` (boolean, required) - Activar/desactivar DHCP server
- `start_address` (string, required) - IP inicial del pool DHCP (formato: x.x.x.x)
- `end_address` (string, required) - IP final del pool DHCP
- `subnet_mask` (string, required) - Máscara de subred (formato: x.x.x.x)
- `dns_servers` (string, required) - DNS separados por coma
- `domain_name` (string, optional) - Nombre de dominio
- `lease_time` (integer, required) - Tiempo de lease en segundos (default: 86400 = 24h)

### Response Exitoso (200)

```json
{
  "success": true,
  "message": "LAN DHCP configuration updated successfully",
  "data": {
    "applied": true,
    "reboot_required": false,
    "changes": {
      "dhcp_server_enable": true,
      "start_address": "192.168.1.100",
      "end_address": "192.168.1.200"
    }
  }
}
```

### Response de Error

```json
{
  "success": false,
  "error": "Invalid IP address format",
  "code": "INVALID_IP_FORMAT",
  "details": "start_address must be a valid IPv4 address"
}
```

### Validaciones Backend

1. **IP Address Format:**
   - Validar formato IPv4 (regex: `^(\d{1,3}\.){3}\d{1,3}$`)
   - Validar rangos válidos (0-255 por octeto)
   - Validar que start_address < end_address

2. **Subnet Mask:**
   - Validar formato válido de subnet mask
   - Validar que las IPs estén dentro de la subnet

3. **DNS Servers:**
   - Validar formato de cada DNS
   - Soportar múltiples DNS separados por coma

4. **Lease Time:**
   - Mínimo: 60 segundos (1 minuto)
   - Máximo: 604800 segundos (7 días)

### Comandos TR-069 (Opción A - Con ACS)

Si tienes servidor ACS (GenieACS, etc.):

```javascript
// Parámetros TR-069 a configurar
{
  "Device.DHCPv4.Server.Pool.1.Enable": true,
  "Device.DHCPv4.Server.Pool.1.MinAddress": "192.168.1.100",
  "Device.DHCPv4.Server.Pool.1.MaxAddress": "192.168.1.200",
  "Device.DHCPv4.Server.Pool.1.SubnetMask": "255.255.255.0",
  "Device.DHCPv4.Server.Pool.1.DNSServers": "8.8.8.8,1.1.1.1",
  "Device.DHCPv4.Server.Pool.1.DomainName": "local",
  "Device.DHCPv4.Server.Pool.1.LeaseTime": 86400
}
```

### Comandos CLI (Opción B - Sin ACS)

**Para Huawei:**
```bash
config
interface gpon 0/{slot}
ont dhcp 0/{slot}/{pon} {ont_id} lan 1 enable
ont dhcp-pool 0/{slot}/{pon} {ont_id} pool-name default start-ip 192.168.1.100 end-ip 192.168.1.200
ont dhcp-option 0/{slot}/{pon} {ont_id} option 6 ip-address 8.8.8.8,1.1.1.1
ont dhcp-option 0/{slot}/{pon} {ont_id} option 51 lease-time 86400
quit
```

**Para ZTE:**
```bash
configure terminal
interface gpon-onu_{frame}/{slot}/{pon}:{ont_id}
dhcp-server enable
dhcp-server pool default
start-ip 192.168.1.100
end-ip 192.168.1.200
subnet-mask 255.255.255.0
dns-server 8.8.8.8
dns-server 1.1.1.1
lease-time 86400
exit
exit
```

---

## 2. IP Interface 1.1 Configuration (WAN TR-069/Management)

### Endpoint

**Ruta:** `POST /api/olts/realtime/:oltId/onus/:serial/tr069/ip-interface-1`

### Request Body

```json
{
  "name": "OLT_C_TR069_Static_WAN",
  "addressing_type": "Static",
  "ip_address": "10.254.12.207",
  "subnet_mask": "255.255.224.0",
  "default_gateway": "10.254.0.1",
  "dns_servers": "8.8.8.8,1.1.1.1",
  "max_mtu_size": 1500,
  "nat_enabled": false,
  "vlan_id": "69"
}
```

**Campos:**
- `name` (string, required) - Nombre de la interfaz
- `addressing_type` (string, required) - "Static" o "DHCP"
- `ip_address` (string, required if Static) - Dirección IP
- `subnet_mask` (string, required if Static) - Máscara de subred
- `default_gateway` (string, required if Static) - Gateway
- `dns_servers` (string, required) - DNS separados por coma
- `max_mtu_size` (integer, required) - MTU (576-1500)
- `nat_enabled` (boolean, required) - Habilitar NAT
- `vlan_id` (string, required) - ID de VLAN (1-4094)

### Response Exitoso

```json
{
  "success": true,
  "message": "IP Interface 1.1 configured successfully",
  "data": {
    "applied": true,
    "reboot_required": true,
    "estimated_downtime": "30-60 seconds"
  }
}
```

### Validaciones

1. **Addressing Type:**
   - Solo permitir "Static" o "DHCP"
   - Si es Static, requerir ip_address, subnet_mask, gateway

2. **IP Configuration:**
   - Validar formato IPv4
   - Validar que IP esté en la subnet
   - Validar que gateway esté en la subnet

3. **MTU:**
   - Rango válido: 576-1500
   - Default: 1500

4. **VLAN:**
   - Rango válido: 1-4094
   - Validar que la VLAN exista en la OLT

### Comandos TR-069 (Con ACS)

```javascript
{
  "Device.IP.Interface.1.Name": "OLT_C_TR069_Static_WAN",
  "Device.IP.Interface.1.Enable": true,
  "Device.IP.Interface.1.IPv4Enable": true,
  "Device.IP.Interface.1.IPv4Address.1.Enable": true,
  "Device.IP.Interface.1.IPv4Address.1.IPAddress": "10.254.12.207",
  "Device.IP.Interface.1.IPv4Address.1.SubnetMask": "255.255.224.0",
  "Device.IP.Interface.1.IPv4Address.1.AddressingType": "Static",
  "Device.Routing.Router.1.IPv4Forwarding.1.Enable": true,
  "Device.Routing.Router.1.IPv4Forwarding.1.DestIPAddress": "0.0.0.0",
  "Device.Routing.Router.1.IPv4Forwarding.1.DestSubnetMask": "0.0.0.0",
  "Device.Routing.Router.1.IPv4Forwarding.1.GatewayIPAddress": "10.254.0.1",
  "Device.Routing.Router.1.IPv4Forwarding.1.Interface": "Device.IP.Interface.1",
  "Device.DNS.Client.Server.1.DNSServer": "8.8.8.8",
  "Device.DNS.Client.Server.2.DNSServer": "1.1.1.1",
  "Device.IP.Interface.1.MaxMTUSize": 1500,
  "Device.NAT.Enable": false,
  "Device.Ethernet.VLANTermination.1.VLANID": 69
}
```

### Comandos CLI (Sin ACS)

**Huawei:**
```bash
config
interface gpon 0/{slot}
ont ipconfig 0/{slot}/{pon} {ont_id} ip-index 0 static ip-address 10.254.12.207 mask 255.255.224.0 gateway 10.254.0.1 vlan {vlan_id} priority 0
ont dns 0/{slot}/{pon} {ont_id} dns-index 0 dns-ip 8.8.8.8
ont dns 0/{slot}/{pon} {ont_id} dns-index 1 dns-ip 1.1.1.1
ont mtu 0/{slot}/{pon} {ont_id} wan 1 mtu 1500
quit
```

**ZTE:**
```bash
configure terminal
interface gpon-onu_{frame}/{slot}/{pon}:{ont_id}
ip address 10.254.12.207 255.255.224.0
ip gateway 10.254.0.1
dns-server 8.8.8.8
dns-server 1.1.1.1
vlan {vlan_id}
mtu 1500
exit
```

---

## 3. IP Interface 2.1 Configuration (WAN Internet)

### Endpoint

**Ruta:** `POST /api/olts/realtime/:oltId/onus/:serial/tr069/ip-interface-2`

### Request Body

```json
{
  "name": "Internet_DHCP",
  "addressing_type": "DHCP",
  "nat_enabled": true,
  "vlan_id": "108",
  "ipv6_enabled": true,
  "ipv6_addressing_type": "SLAAC"
}
```

**Campos adicionales para Static:**
```json
{
  "addressing_type": "Static",
  "ip_address": "10.108.0.210",
  "subnet_mask": "255.255.255.0",
  "default_gateway": "10.108.0.1",
  "dns_servers": "8.8.8.8,1.1.1.1",
  "nat_enabled": true,
  "vlan_id": "108",
  "ipv6_enabled": true,
  "ipv6_address": "2803:1510:720:2900::1",
  "ipv6_prefix_length": 64,
  "ipv6_gateway": "fe80::6f4:1cff:fe00:9c01",
  "ipv6_delegated_prefix": "2803:1510:720:2900::/56"
}
```

### Response Exitoso

Similar a IP Interface 1.1

### Comandos TR-069 (Con ACS)

Similar a Interface 1.1, pero usando `Device.IP.Interface.2.*`

---

## 4. Wireless LAN Configuration (WiFi 2.4GHz)

### Endpoint

**Ruta:** `POST /api/olts/realtime/:oltId/onus/:serial/tr069/wireless-lan`

### Request Body

```json
{
  "ssid": "MiRedWiFi",
  "password": "password123",
  "auth_mode": "WPA2-PSK",
  "enable": true,
  "radio_enabled": true,
  "ssid_advertisement_enabled": true,
  "wpa_encryption": "AES",
  "channel_width": "20MHz",
  "auto_channel": true,
  "channel": 6,
  "country_domain": "DO",
  "tx_power": 100
}
```

**Campos:**
- `ssid` (string, required) - Nombre de la red (1-32 caracteres)
- `password` (string, required) - Contraseña WPA (8-63 caracteres)
- `auth_mode` (string, required) - "Open", "WPA-PSK", "WPA2-PSK", "WPA/WPA2-PSK"
- `enable` (boolean, required) - Habilitar WiFi
- `radio_enabled` (boolean, required) - Habilitar radio
- `ssid_advertisement_enabled` (boolean, required) - SSID visible
- `wpa_encryption` (string, required) - "TKIP", "AES", "TKIP+AES"
- `channel_width` (string, required) - "20MHz", "40MHz", "Auto 20/40 MHz"
- `auto_channel` (boolean, required) - Selección automática de canal
- `channel` (integer, required if auto_channel=false) - Canal (1-13 para 2.4GHz)
- `country_domain` (string, required) - Código de país (DO, US, CN, etc.)
- `tx_power` (integer, required) - Potencia de transmisión (0-100%)

### Response Exitoso

```json
{
  "success": true,
  "message": "Wireless LAN configured successfully",
  "data": {
    "applied": true,
    "reboot_required": false,
    "wifi_restart_required": true,
    "estimated_downtime": "10-15 seconds"
  }
}
```

### Validaciones

1. **SSID:**
   - Longitud: 1-32 caracteres
   - Caracteres permitidos: alfanuméricos, espacios, guiones

2. **Password:**
   - Longitud: 8-63 caracteres (para WPA/WPA2)
   - Vacío si auth_mode es "Open"

3. **Channel:**
   - 2.4GHz: 1-13 (según regulación del país)
   - Validar canal permitido según country_domain

4. **Tx Power:**
   - Rango: 0-100%
   - Algunos modelos solo soportan valores fijos (25%, 50%, 75%, 100%)

### Comandos TR-069 (Con ACS)

```javascript
{
  "Device.WiFi.SSID.1.SSID": "MiRedWiFi",
  "Device.WiFi.SSID.1.Enable": true,
  "Device.WiFi.AccessPoint.1.SSIDAdvertisementEnabled": true,
  "Device.WiFi.AccessPoint.1.Security.ModeEnabled": "WPA2-Personal",
  "Device.WiFi.AccessPoint.1.Security.KeyPassphrase": "password123",
  "Device.WiFi.AccessPoint.1.Security.EncryptionMode": "AESEncryption",
  "Device.WiFi.Radio.1.Enable": true,
  "Device.WiFi.Radio.1.Channel": 6,
  "Device.WiFi.Radio.1.AutoChannelEnable": true,
  "Device.WiFi.Radio.1.OperatingChannelBandwidth": "20MHz",
  "Device.WiFi.Radio.1.TransmitPower": 100,
  "Device.WiFi.Radio.1.RegulatoryDomain": "DO"
}
```

### Comandos CLI (Sin ACS)

**Huawei:**
```bash
config
interface gpon 0/{slot}
ont wifi 0/{slot}/{pon} {ont_id} ssid-index 1 ssid "MiRedWiFi"
ont wifi 0/{slot}/{pon} {ont_id} ssid-index 1 auth-mode wpa2-psk
ont wifi 0/{slot}/{pon} {ont_id} ssid-index 1 wpa-psk ascii "password123"
ont wifi 0/{slot}/{pon} {ont_id} ssid-index 1 encryption aes
ont wifi 0/{slot}/{pon} {ont_id} radio-index 1 channel 6
ont wifi 0/{slot}/{pon} {ont_id} radio-index 1 power 100
ont wifi 0/{slot}/{pon} {ont_id} ssid-index 1 enable
quit
```

**ZTE:**
```bash
configure terminal
interface gpon-onu_{frame}/{slot}/{pon}:{ont_id}
wifi ssid 1 name "MiRedWiFi"
wifi ssid 1 security wpa2-psk
wifi ssid 1 password "password123"
wifi ssid 1 encryption aes
wifi radio 1 channel 6
wifi radio 1 power 100
wifi ssid 1 enable
exit
```

---

## 5. General - Pending Provisions Configuration

### Endpoint

**Ruta:** `POST /api/olts/realtime/:oltId/onus/:serial/tr069/provisioning-code`

### Request Body

```json
{
  "provisioning_code": "sOLT.rDHC"
}
```

**Campo:**
- `provisioning_code` (string, required) - Código de aprovisionamiento TR-069

### Response Exitoso

```json
{
  "success": true,
  "message": "Provisioning code updated successfully",
  "data": {
    "applied": true,
    "reboot_required": true,
    "note": "ONU will re-provision on next ACS connection"
  }
}
```

### Comandos TR-069 (Con ACS)

```javascript
{
  "Device.DeviceInfo.ProvisioningCode": "sOLT.rDHC"
}
```

### Comandos CLI

**Nota:** El provisioning code generalmente no se puede cambiar vía CLI, requiere ACS.

---

## Estructura del Código Backend Sugerida

```python
# backend/app/api/routes/tr069_config.py

from fastapi import APIRouter, Depends, HTTPException, Body
from app.models.user import User
from app.api.deps import get_current_user
from app.scripts_olt.tr069_config import (
    configure_lan_dhcp,
    configure_ip_interface_1,
    configure_ip_interface_2,
    configure_wireless_lan,
    configure_provisioning_code
)
from pydantic import BaseModel, validator, Field
from typing import Optional

router = APIRouter()

# ============= Models =============

class LanDhcpConfig(BaseModel):
    dhcp_server_enable: bool
    start_address: str
    end_address: str
    subnet_mask: str
    dns_servers: str
    domain_name: Optional[str] = "local"
    lease_time: int = 86400

    @validator('start_address', 'end_address', 'subnet_mask')
    def validate_ip(cls, v):
        # Validar formato IPv4
        import ipaddress
        try:
            ipaddress.IPv4Address(v)
            return v
        except:
            raise ValueError(f'{v} is not a valid IPv4 address')

    @validator('lease_time')
    def validate_lease_time(cls, v):
        if v < 60 or v > 604800:
            raise ValueError('lease_time must be between 60 and 604800 seconds')
        return v


class IpInterfaceConfig(BaseModel):
    name: str
    addressing_type: str  # "Static" or "DHCP"
    ip_address: Optional[str] = None
    subnet_mask: Optional[str] = None
    default_gateway: Optional[str] = None
    dns_servers: str
    max_mtu_size: int = Field(default=1500, ge=576, le=1500)
    nat_enabled: bool
    vlan_id: str

    @validator('addressing_type')
    def validate_addressing_type(cls, v):
        if v not in ["Static", "DHCP"]:
            raise ValueError('addressing_type must be "Static" or "DHCP"')
        return v


class WirelessLanConfig(BaseModel):
    ssid: str = Field(..., min_length=1, max_length=32)
    password: Optional[str] = Field(None, min_length=8, max_length=63)
    auth_mode: str
    enable: bool
    radio_enabled: bool
    ssid_advertisement_enabled: bool
    wpa_encryption: str
    channel_width: str
    auto_channel: bool
    channel: int = Field(..., ge=1, le=13)
    country_domain: str = Field(..., min_length=2, max_length=2)
    tx_power: int = Field(..., ge=0, le=100)


class ProvisioningCodeConfig(BaseModel):
    provisioning_code: str


# ============= Endpoints =============

@router.post("/olts/realtime/{olt_id}/onus/{onu_serial}/tr069/lan-dhcp")
async def update_lan_dhcp(
    olt_id: int,
    onu_serial: str,
    config: LanDhcpConfig,
    current_user: User = Depends(get_current_user)
):
    """
    Configura el servidor DHCP LAN de una ONU
    """
    try:
        # Obtener OLT info
        olt = await get_olt_by_id(olt_id)
        if not olt:
            raise HTTPException(status_code=404, detail="OLT not found")

        # Obtener ONU info
        onu = await get_onu_by_serial(onu_serial, olt_id)
        if not onu:
            raise HTTPException(status_code=404, detail="ONU not found")

        # Configurar DHCP
        result = await configure_lan_dhcp(
            olt_ip=olt.ip,
            olt_user=olt.username,
            olt_password=olt.password,
            olt_brand=olt.brand,
            slot=onu.slot,
            pon=onu.pon,
            ont_id=onu.ont_id,
            config=config.dict()
        )

        return {
            "success": True,
            "message": "LAN DHCP configuration updated successfully",
            "data": result
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating LAN DHCP config: {str(e)}"
        )


@router.post("/olts/realtime/{olt_id}/onus/{onu_serial}/tr069/ip-interface-1")
async def update_ip_interface_1(
    olt_id: int,
    onu_serial: str,
    config: IpInterfaceConfig,
    current_user: User = Depends(get_current_user)
):
    """
    Configura IP Interface 1.1 (WAN TR-069/Management)
    """
    # Similar implementation...
    pass


@router.post("/olts/realtime/{olt_id}/onus/{onu_serial}/tr069/wireless-lan")
async def update_wireless_lan(
    olt_id: int,
    onu_serial: str,
    config: WirelessLanConfig,
    current_user: User = Depends(get_current_user)
):
    """
    Configura Wireless LAN 2.4GHz
    """
    # Similar implementation...
    pass

# ... más endpoints
```

```python
# backend/app/scripts_olt/tr069_config.py

async def configure_lan_dhcp(
    olt_ip: str,
    olt_user: str,
    olt_password: str,
    olt_brand: str,
    slot: int,
    pon: int,
    ont_id: int,
    config: dict
) -> dict:
    """
    Configura DHCP Server LAN en una ONU
    """
    if olt_brand.lower() == "huawei":
        return await configure_huawei_lan_dhcp(
            olt_ip, olt_user, olt_password, slot, pon, ont_id, config
        )
    elif olt_brand.lower() == "zte":
        return await configure_zte_lan_dhcp(
            olt_ip, olt_user, olt_password, slot, pon, ont_id, config
        )
    else:
        raise ValueError(f"Unsupported OLT brand: {olt_brand}")


async def configure_huawei_lan_dhcp(
    olt_ip: str,
    user: str,
    password: str,
    slot: int,
    pon: int,
    ont_id: int,
    config: dict
) -> dict:
    """
    Configura DHCP en ONU Huawei
    """
    from app.utils.telnet_client import TelnetClient

    client = TelnetClient(olt_ip, user, password)
    try:
        await client.connect()

        commands = [
            "config",
            f"interface gpon 0/{slot}",
        ]

        # Enable/Disable DHCP
        if config['dhcp_server_enable']:
            commands.append(f"ont dhcp 0/{slot}/{pon} {ont_id} lan 1 enable")
            commands.append(
                f"ont dhcp-pool 0/{slot}/{pon} {ont_id} pool-name default "
                f"start-ip {config['start_address']} end-ip {config['end_address']}"
            )
            # DNS servers
            commands.append(
                f"ont dhcp-option 0/{slot}/{pon} {ont_id} option 6 "
                f"ip-address {config['dns_servers']}"
            )
            # Lease time
            commands.append(
                f"ont dhcp-option 0/{slot}/{pon} {ont_id} option 51 "
                f"lease-time {config['lease_time']}"
            )
        else:
            commands.append(f"undo ont dhcp 0/{slot}/{pon} {ont_id} lan 1")

        commands.extend(["quit", "quit"])

        # Execute commands
        for cmd in commands:
            output = await client.send_command(cmd)
            print(f"[DHCP Config] {cmd} -> {output}")

        await client.disconnect()

        return {
            "applied": True,
            "reboot_required": False,
            "changes": config
        }

    except Exception as e:
        await client.disconnect()
        raise Exception(f"Error configuring DHCP: {str(e)}")
```

---

## Consideraciones Importantes

### 1. Seguridad

- **Validación exhaustiva** de todos los parámetros
- **Rate limiting** para evitar abuso de endpoints de configuración
- **Logging completo** de cambios de configuración
- **Rollback automático** si la configuración falla

### 2. Manejo de Errores

```json
{
  "success": false,
  "error": "Configuration failed",
  "code": "CONFIG_APPLY_FAILED",
  "details": "ONU did not respond after configuration",
  "rollback": {
    "performed": true,
    "previous_config": { ... }
  }
}
```

### 3. Testing

- **Validar** que la ONU sigue online después de cambios
- **Timeout** de 60 segundos para aplicar configuración
- **Verificar** que los cambios se aplicaron correctamente

### 4. ACS vs CLI

**Con ACS (Recomendado):**
- Más confiable
- Soporte completo de parámetros TR-069
- Confirmación automática de aplicación
- Rollback más fácil

**Sin ACS (CLI directo):**
- Limitado a comandos soportados por la OLT
- Menos confiable (parseo de output CLI)
- Requiere validación manual
- Algunos parámetros no disponibles

---

## Prioridad de Implementación

### ✅ Fase 1 (Crítico)
1. Wireless LAN Configuration (WiFi es crítico para usuarios)
2. LAN DHCP Server (configuración de red local)

### ✅ Fase 2 (Importante)
3. IP Interface 2.1 (configuración de Internet)
4. IP Interface 1.1 (management)

### ⏸️ Fase 3 (Opcional)
5. Provisioning Code (menos común)
6. Otros parámetros avanzados

---

## Frontend Integration

El frontend ya está preparado para enviar las configuraciones. Ejemplo:

```typescript
// src/pantallas/controles/OLTs/TR069StatsScreen.tsx

const saveLanDhcpConfig = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(
            `${API_BASE}/olts/realtime/${oltId}/onus/${onuSerial}/tr069/lan-dhcp`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    dhcp_server_enable: dhcpServerEnable,
                    start_address: dhcpStartAddress,
                    end_address: dhcpEndAddress,
                    subnet_mask: dhcpSubnetMask,
                    dns_servers: dhcpDnsServers,
                    lease_time: dhcpLeaseTime
                })
            }
        );

        const data = await response.json();

        if (data.success) {
            Alert.alert('Éxito', 'Configuración DHCP actualizada');
            loadTr069Stats(true); // Recargar datos
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        Alert.alert('Error', `No se pudo guardar: ${error.message}`);
    }
};
```

---

## Resultado Esperado

Al finalizar la implementación, los usuarios podrán:
- ✅ Configurar servidor DHCP LAN directamente desde la app
- ✅ Configurar interfaces WAN (estática/dinámica)
- ✅ Configurar WiFi completo (SSID, contraseña, canal, potencia)
- ✅ Ver confirmación de cambios aplicados
- ✅ Manejar errores y rollback automático

---

## Preguntas

1. ¿Tienen servidor ACS configurado? (GenieACS, SmartOLT, etc.)
2. ¿Qué nivel de acceso tiene el backend a las OLTs? (Telnet, SSH, API)
3. ¿Necesitan implementar rollback automático si falla la configuración?
4. ¿Quieren logging/auditoría de cambios de configuración en BD?
5. ¿Prefieren implementar con ACS o via CLI?
