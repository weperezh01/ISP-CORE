# Requisitos Backend - Gestión TR-069 para ONUs

## Contexto

La aplicación móvil WellNet necesita permitir a los técnicos/administradores **configurar y gestionar ONUs de clientes directamente desde la app** usando el protocolo TR-069 (CWMP - CPE WAN Management Protocol).

Actualmente, cuando un usuario ve los detalles de una ONU y presiona el botón "TR-069 Stats", se abre una pantalla que debe mostrar **configuraciones en tiempo real** y permitir **modificar parámetros** de la ONU del cliente.

## Arquitectura TR-069

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   React Native  │   API   │   Backend API   │  TR-069 │   ACS Server    │
│      App        │◄───────►│   (FastAPI)     │◄───────►│   (GenieACS)    │
│  (Mobile/Web)   │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                                                │
                                                                │ TR-069/CWMP
                                                                │
                                                         ┌──────▼──────┐
                                                         │     ONU     │
                                                         │  (Cliente)  │
                                                         └─────────────┘
```

## Datos Disponibles desde la App

Cuando el usuario accede a TR-069 Stats, la app envía:

```javascript
{
    "olt_id": 123,              // ID de la OLT en la DB
    "onu_serial": "HWTC12345678", // Serial Number de la ONU
    "onu_id": "456",            // ID interno de la ONU (puede ser serial o ID de DB)
    "puerto": "0/1/5",          // Puerto PON donde está conectada (opcional)
    "ont_id": 25,               // ONT ID asignado (opcional)
    "mac_address": "AA:BB:CC:DD:EE:FF", // MAC de la ONU (opcional)
    "vlan": 100                 // VLAN del cliente (opcional)
}
```

## Endpoints Requeridos

### 1. Obtener Estadísticas TR-069 Completas
**Endpoint existente:** `GET /api/olts/realtime/{olt_id}/onus/{serial}/tr069-stats`

**Respuesta esperada:**
```json
{
    "success": true,
    "data": {
        "general": {
            "model_name": "HS8545M5",
            "software_version": "V5R019C20S100",
            "hardware_version": "147C.A",
            "serial_number": "HWTC12345678",
            "mac_address": "AA:BB:CC:DD:EE:FF",
            "optical_power_rx": "-18.5 dBm",
            "optical_power_tx": "2.3 dBm",
            "distance": "1250 m",
            "temperature": "45°C",
            "voltage": "3.3V",
            "uptime": "2025-01-15 10:30:00",
            "last_seen": "2025-01-18 14:20:00"
        },
        "ip_interface_1_1": {
            "name": "OLT_TR069_Management",
            "status": "Connected",
            "ip_address": "10.254.12.207",
            "subnet_mask": "255.255.224.0",
            "gateway": "10.254.0.1",
            "dns_servers": "8.8.8.8, 1.1.1.1",
            "mac_address": "AA:BB:CC:DD:EE:FF",
            "vlan_id": "69",
            "available_via_cli": false,
            "data_completeness": "limited",
            "limitation": "Full configuration requires ACS",
            "recommendation": "Install GenieACS for complete management"
        },
        "ip_interface_2_1": {
            "name": "Internet_DHCP",
            "status": "Connected",
            "ip_address": "10.108.0.210",
            "subnet_mask": "255.255.255.0",
            "gateway": "10.108.0.1",
            "dns_servers": "8.8.8.8, 1.1.1.1",
            "mac_address": "AA:BB:CC:DD:EE:F0",
            "vlan_id": "108",
            "ipv6_address": "fc00:8::360a:98ff:fe97:a8a1",
            "ipv6_gateway": "fe80::6f4:1cff:fe00:9c01",
            "available_via_cli": false
        },
        "wireless_lan_2_4ghz": {
            "ssid": "Cliente_WiFi",
            "password": "",  // No devolver password real por seguridad
            "auth_mode": "WPA2-PSK",
            "status": "Up",
            "enable": "Yes",
            "rf_band": "2.4GHz",
            "standard": "802.11 b/g/n",
            "radio_enabled": "Yes",
            "total_associations": 3,
            "ssid_advertisement_enabled": "Yes",
            "wpa_encryption": "AES",
            "channel_width": "Auto 20/40 MHz",
            "auto_channel": "on",
            "channel": 11,
            "country_domain": "DO",
            "tx_power": 100,
            "available_via_cli": false,
            "recommendation": "Requires ACS for full WiFi management"
        },
        "wifi_site_survey": {
            "available_via_cli": false,
            "networks": [],  // Requiere ACS
            "recommendation": "WiFi site survey requires ACS connection"
        },
        "lan_dhcp_server": {
            "lan_ip_address": "192.168.100.1",
            "lan_netmask": "255.255.255.0",
            "dhcp_enabled": true,
            "dhcp_min_addr": "192.168.100.2",
            "dhcp_max_addr": "192.168.100.254",
            "dhcp_subnet_mask": "255.255.255.0",
            "dhcp_gateway": "192.168.100.1",
            "dhcp_dns_servers": "192.168.100.1",
            "lease_time_sec": 86400
        },
        "hosts": [
            {
                "mac_address": "88:36:5f:d7:41:81",
                "ip_address": "192.168.100.17",
                "address_source": "DHCP",
                "hostname": "android-device",
                "port": "SSID1",
                "active": true
            }
        ]
    },
    "timestamp": "2025-01-18T14:25:30Z",
    "source": "acs",  // "acs" o "cli"
    "cached": false
}
```

### 2. Configurar WiFi (Wireless LAN)
**Endpoint existente:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/wireless-lan`

**Payload:**
```json
{
    "ssid": "NuevoWiFi",
    "password": "nuevaPassword123",
    "auth_mode": "wpa2-psk",
    "channel": 6,
    "tx_power": 100,
    "country_domain": "DO"
}
```

**Respuesta:**
```json
{
    "success": true,
    "message": "WiFi configuration updated successfully",
    "data": {
        "task_id": "tr069_task_12345",  // ID de tarea async si aplica
        "status": "completed",
        "applied_at": "2025-01-18T14:30:00Z"
    }
}
```

**Implementación requerida:**
- Si tienes ACS (GenieACS): Usar API de GenieACS para enviar `SetParameterValues`
- Si NO tienes ACS: Usar CLI directo de la OLT (telnet/ssh) con los comandos apropiados según vendor

### 3. Configurar DHCP Server LAN
**Endpoint existente:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/lan-dhcp`

**Payload:**
```json
{
    "dhcp_server_enable": true,
    "start_address": "192.168.1.10",
    "end_address": "192.168.1.200",
    "subnet_mask": "255.255.255.0",
    "dns_servers": "8.8.8.8, 1.1.1.1",
    "lease_time": 86400
}
```

### 4. Reiniciar ONU (NUEVO - Falta implementar)
**Endpoint:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/reboot`

**Respuesta:**
```json
{
    "success": true,
    "message": "Reboot command sent successfully",
    "data": {
        "task_id": "reboot_task_67890",
        "estimated_downtime_seconds": 60
    }
}
```

### 5. Resincronizar Configuración (NUEVO - Falta implementar)
**Endpoint:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/resync-config`

**Respuesta:**
```json
{
    "success": true,
    "message": "Configuration resync initiated",
    "data": {
        "task_id": "resync_task_11111"
    }
}
```

### 6. Restaurar Valores de Fábrica (NUEVO - Falta implementar)
**Endpoint:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/factory-reset`

**Payload:**
```json
{
    "confirm": true  // Requiere confirmación explícita
}
```

**Respuesta:**
```json
{
    "success": true,
    "message": "Factory reset command sent",
    "warning": "ONU will lose all custom configurations",
    "data": {
        "task_id": "reset_task_22222",
        "estimated_downtime_seconds": 120
    }
}
```

### 7. Deshabilitar ONU (NUEVO - Falta implementar)
**Endpoint:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/disable`

**Respuesta:**
```json
{
    "success": true,
    "message": "ONU disabled successfully",
    "data": {
        "previous_state": "online",
        "new_state": "disabled"
    }
}
```

### 8. Configurar IP Management (WAN TR-069)
**Endpoint:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/management-ip`

**Payload:**
```json
{
    "addressing_type": "static",  // "static" o "dhcp"
    "ip_address": "10.254.12.207",  // Solo si static
    "subnet_mask": "255.255.224.0",
    "gateway": "10.254.0.1",
    "dns_servers": "8.8.8.8, 1.1.1.1",
    "vlan_id": 69
}
```

### 9. Configurar IP WAN (Internet del cliente)
**Endpoint:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/wan-config`

**Payload:**
```json
{
    "addressing_type": "dhcp",  // "static", "dhcp", o "pppoe"
    "ip_address": "10.108.0.210",  // Solo si static
    "subnet_mask": "255.255.255.0",
    "gateway": "10.108.0.1",
    "dns_servers": "8.8.8.8, 1.1.1.1",
    "vlan_id": 108,
    "nat_enabled": true,

    // Si es PPPoE:
    "pppoe_username": "cliente@isp.com",
    "pppoe_password": "password123"
}
```

### 10. Diagnóstico - Ping
**Endpoint:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/diagnostic/ping`

**Payload:**
```json
{
    "host": "8.8.8.8",
    "number_of_repetitions": 4,
    "timeout": 1000
}
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "success_count": 4,
        "failure_count": 0,
        "average_response_time": 15,
        "min_response_time": 12,
        "max_response_time": 18
    }
}
```

### 11. Diagnóstico - Traceroute
**Endpoint:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/diagnostic/traceroute`

**Payload:**
```json
{
    "host": "8.8.8.8",
    "max_hop_count": 30,
    "timeout": 5000
}
```

### 12. Diagnóstico - Speed Test
**Endpoint:** `POST /api/olts/realtime/{olt_id}/onus/{serial}/tr069/diagnostic/speedtest`

**Payload:**
```json
{
    "direction": "download",  // "download", "upload", o "both"
    "test_server": "speedtest.net"  // Opcional
}
```

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "download_mbps": 95.3,
        "upload_mbps": 48.7,
        "latency_ms": 12,
        "jitter_ms": 2,
        "test_duration_seconds": 15
    }
}
```

## Implementación Sugerida

### Opción A: Con Servidor ACS (GenieACS) - **RECOMENDADO**

```python
# backend/services/tr069_service.py

import requests
from typing import Dict, Any

class TR069Service:
    def __init__(self, acs_url: str = "http://localhost:7557"):
        self.acs_url = acs_url

    def get_device_by_serial(self, serial: str):
        """Obtener device ID de GenieACS por serial"""
        response = requests.get(
            f"{self.acs_url}/devices",
            params={"query": json.dumps({"_id": serial})}
        )
        devices = response.json()
        return devices[0] if devices else None

    def get_parameters(self, device_id: str, parameters: list):
        """Obtener valores de parámetros TR-069"""
        device = requests.get(f"{self.acs_url}/devices/{device_id}").json()

        result = {}
        for param in parameters:
            # Ejemplo: "InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID"
            value = self._get_nested_value(device, param)
            result[param] = value

        return result

    def set_parameters(self, device_id: str, parameters: Dict[str, Any]):
        """Configurar parámetros TR-069"""
        tasks = []
        for param, value in parameters.items():
            task = {
                "name": "setParameterValues",
                "parameterValues": [[param, value, "xsd:string"]]
            }

            response = requests.post(
                f"{self.acs_url}/devices/{device_id}/tasks",
                params={"timeout": 3000, "connection_request": True},
                json=task
            )
            tasks.append(response.json())

        return tasks

    def configure_wifi(self, serial: str, config: dict):
        """Configurar WiFi 2.4GHz"""
        device = self.get_device_by_serial(serial)
        if not device:
            raise ValueError(f"Device {serial} not found in ACS")

        device_id = device["_id"]

        # Mapeo a parámetros TR-069 (InternetGatewayDevice data model)
        params = {
            "InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID":
                config["ssid"],
            "InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.PreSharedKey.1.KeyPassphrase":
                config.get("password", ""),
            "InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.Channel":
                config["channel"],
            "InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.TransmitPower":
                config["tx_power"],
        }

        return self.set_parameters(device_id, params)

    def reboot_device(self, serial: str):
        """Reiniciar ONU via TR-069"""
        device = self.get_device_by_serial(serial)
        if not device:
            raise ValueError(f"Device {serial} not found in ACS")

        task = {
            "name": "reboot"
        }

        response = requests.post(
            f"{self.acs_url}/devices/{device['_id']}/tasks",
            params={"timeout": 3000, "connection_request": True},
            json=task
        )

        return response.json()
```

### Opción B: Sin ACS - CLI Directo de la OLT

```python
# backend/services/olt_cli_service.py

import paramiko
from typing import Dict, Any

class OltCliService:
    def __init__(self, olt_connection_info: dict):
        self.host = olt_connection_info["ip"]
        self.username = olt_connection_info["username"]
        self.password = olt_connection_info["password"]
        self.vendor = olt_connection_info["vendor"]  # "huawei" o "zte"

    def configure_onu_wifi(self, puerto: str, ont_id: int, config: dict):
        """
        Configurar WiFi de ONU via CLI de OLT
        NOTA: Limitado comparado con ACS, solo funciones básicas
        """
        if self.vendor == "huawei":
            return self._configure_wifi_huawei(puerto, ont_id, config)
        elif self.vendor == "zte":
            return self._configure_wifi_zte(puerto, ont_id, config)
        else:
            raise ValueError(f"Vendor {self.vendor} not supported")

    def _configure_wifi_huawei(self, puerto: str, ont_id: int, config: dict):
        """Configurar WiFi en Huawei OLT"""
        commands = [
            "enable",
            "config",
            f"interface gpon {puerto}",
            f"ont wifi ssid {ont_id} 0 ssid-name {config['ssid']}",
            f"ont wifi wpa-psk {ont_id} 0 key {config['password']}",
            f"ont wifi rf-mode {ont_id} 0 b-g-n",
            "quit",
            "quit"
        ]

        return self._execute_commands(commands)

    def _execute_commands(self, commands: list):
        """Ejecutar comandos via SSH"""
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            ssh.connect(self.host, username=self.username, password=self.password)
            shell = ssh.invoke_shell()

            output = ""
            for cmd in commands:
                shell.send(cmd + "\n")
                time.sleep(0.5)
                if shell.recv_ready():
                    output += shell.recv(4096).decode()

            return {"success": True, "output": output}

        except Exception as e:
            return {"success": False, "error": str(e)}
        finally:
            ssh.close()
```

## Topología de Red TR-069

Para que TR-069 funcione, la ONU debe poder comunicarse con el ACS. Esto requiere:

1. **VLAN de Management TR-069**: Una VLAN dedicada (ej: VLAN 69) para tráfico TR-069
2. **IP Management en la ONU**: La ONU necesita una IP en la red de management
3. **ACS Server**: Debe estar accesible desde la red de management
4. **Connection Request**: El ACS debe poder hacer "Connection Request" a la ONU

```
ONU (Cliente)
  ├─ WAN Interface 1 (VLAN 69 - TR-069 Management)
  │    └─ IP: 10.254.12.207/19
  │         └─ Gateway: 10.254.0.1
  │              └─ [Internet] → ACS Server (ej: acs.tuisp.com:7547)
  │
  └─ WAN Interface 2 (VLAN 108 - Internet del Cliente)
       └─ IP: 10.108.0.210/24 (DHCP)
            └─ Gateway: 10.108.0.1 → Internet
```

## Configuración OLT para TR-069

### Huawei OLT

```
# Crear service-port para VLAN TR-069
service-port 1001 vlan 69 gpon 0/1/5 ont 25 gemport 1 multi-service user-vlan 69

# Configurar TR-069
interface gpon 0/1/5
  ont tr069-management 25 server-url https://acs.tuisp.com:7547/
  ont tr069-management 25 username admin password admin123
  ont tr069-management 25 enable
```

### ZTE OLT

```
# Configurar service para TR-069
pon-onu-mng gpon-onu_1/1/5:25
  service 1 gemport 1 vlan 69
  tr069-server url https://acs.tuisp.com:7547
  tr069-server username admin password admin123
  tr069-enable
```

## Testing

Para probar que TR-069 funciona:

1. Verificar que la ONU tenga IP en VLAN de management
2. Desde el ACS, verificar que el device aparezca conectado
3. Hacer un simple GetParameterValues para confirmar comunicación
4. Probar SetParameterValues con un parámetro no crítico (ej: Description)

## Seguridad

⚠️ **IMPORTANTE:**

1. **NO devolver passwords**: Cuando se consulten configuraciones, NO incluir passwords reales en la respuesta
2. **Validar permisos**: Solo usuarios con rol admin/técnico deben poder modificar configuraciones
3. **Rate limiting**: Implementar límites para evitar spam de configuraciones
4. **Logs de auditoría**: Registrar TODOS los cambios con usuario, timestamp y valores anteriores/nuevos
5. **Confirmaciones**: Operaciones destructivas (factory reset, disable) deben requerir confirmación explícita

## Prioridades de Implementación

### Alta Prioridad (MVP)
1. ✅ GET tr069-stats (básico) - **YA EXISTE**
2. ✅ POST wireless-lan - **YA EXISTE**
3. ✅ POST lan-dhcp - **YA EXISTE**
4. ⚠️ POST reboot - **FALTA IMPLEMENTAR**
5. ⚠️ GET hosts - **FALTA IMPLEMENTAR**

### Media Prioridad
6. ⚠️ POST management-ip - **FALTA IMPLEMENTAR**
7. ⚠️ POST wan-config - **FALTA IMPLEMENTAR**
8. ⚠️ POST diagnostic/ping - **FALTA IMPLEMENTAR**
9. ⚠️ POST resync-config - **FALTA IMPLEMENTAR**

### Baja Prioridad
10. ⚠️ POST factory-reset - **FALTA IMPLEMENTAR**
11. ⚠️ POST disable - **FALTA IMPLEMENTAR**
12. ⚠️ POST diagnostic/traceroute - **FALTA IMPLEMENTAR**
13. ⚠️ POST diagnostic/speedtest - **FALTA IMPLEMENTAR**

## Preguntas para el Backend Team

1. ¿Ya tienen un servidor ACS (GenieACS u otro) instalado?
2. ¿Las ONUs ya tienen configuración de TR-069 en la OLT?
3. ¿Cuál es la VLAN usada para management TR-069?
4. ¿Qué vendors de ONU soportan? (Huawei, ZTE, etc.)
5. ¿Prefieren implementar vía ACS o vía CLI directo de la OLT?

## Recursos

- GenieACS Documentation: https://docs.genieacs.com/
- TR-069 Protocol Spec: https://www.broadband-forum.org/technical/download/TR-069.pdf
- Huawei OLT TR-069 Config: Huawei SmartAX MA5800 Configuration Guide
- ZTE OLT TR-069 Config: ZTE C600/C620 Configuration Manual
