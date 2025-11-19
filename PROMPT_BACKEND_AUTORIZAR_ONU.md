# 🔐 Endpoint: Autorizar ONU Pendiente

## Descripción

Endpoint para autorizar (provisionar) una ONU que está en estado "pendiente" en la OLT. Este endpoint ejecuta los comandos necesarios en la OLT para:
1. Autorizar la ONU pendiente
2. Asignarle perfil de servicio
3. Configurar parámetros iniciales
4. Retornar el estado actualizado

## Endpoint

```
POST /api/olts/realtime/:id_olt/onus/:serial/authorize
```

### Parámetros de URL

- `id_olt` (required): ID de la OLT en la base de datos
- `serial` (required): Serial number de la ONU a autorizar (puede ser el índice temporal para ZTE)

### Body Parameters

```json
{
  "puerto": "0/1/5",           // Puerto PON donde se autorizará la ONU
  "ont_id": 10,                // ONT ID a asignar (debe estar disponible en ese puerto)
  "onu_type": "HG8546M",       // Tipo/modelo de ONU (opcional)
  "zona": "30 de Mayo",        // Zona geográfica/sector (opcional)
  "velocidad_bajada": 100,     // Velocidad de descarga en Mbps (opcional)
  "velocidad_subida": 50,      // Velocidad de subida en Mbps (opcional)
  "line_profile": "100M",      // Perfil de línea (velocidad/servicio) - opcional si se usan velocidades separadas
  "service_profile": "INTERNET", // Perfil de servicio
  "descripcion": "Cliente Juan Perez - Plan 100Mbps",  // Descripción opcional
  "vlan": 100                  // VLAN (opcional, algunos modelos)
}
```

**Campos Requeridos**:
- `puerto`: Puerto PON en formato frame/slot/port
- `ont_id`: ID único en el puerto (0-127)
- `service_profile`: Perfil de servicio

**Campos Opcionales**:
- `onu_type`: Modelo del equipo (ej: HG8546M, F660, ZTE-F601, COMCAST1)
- `zona`: Sector o área geográfica del cliente
- `velocidad_bajada`: Velocidad de descarga en Mbps (se puede usar en lugar de line_profile)
- `velocidad_subida`: Velocidad de subida en Mbps
- `line_profile`: Perfil de línea predefinido (si no se usan velocidades separadas)
- `descripcion`: Descripción del servicio o cliente
- `vlan`: ID de VLAN (principalmente para ZTE)

## Implementación por Modelo de OLT

### Huawei MA5800-X15

#### Comandos SSH Requeridos

```bash
# 1. Entrar al modo de configuración
enable
config

# 2. Navegar a la interfaz PON
interface gpon 0/1

# 3. Autorizar la ONU
ont add 5 10 sn-auth "48575443ABCD1234" omci ont-lineprofile-id 100M ont-srvprofile-id INTERNET desc "Cliente Juan Perez - Plan 100Mbps"

# Sintaxis completa:
# ont add <port> <ont-id> sn-auth <serial> omci ont-lineprofile-id <line-profile> ont-srvprofile-id <service-profile> desc <descripcion>

# 4. Salir y guardar
quit
quit
```

#### Script Python Sugerido

```python
def autorizar_onu_huawei(olt_client, puerto, ont_id, serial, line_profile, service_profile,
                         descripcion="", onu_type=None, zona=None,
                         velocidad_bajada=None, velocidad_subida=None):
    """
    Autorizar ONU pendiente en Huawei MA5800

    Args:
        olt_client: Cliente SSH conectado al OLT
        puerto: Puerto PON (ej: "0/1/5" → frame/slot/port)
        ont_id: ONT ID a asignar (ej: 10)
        serial: Serial number de la ONU (ej: "48575443ABCD1234")
        line_profile: Profile de línea (ej: "100M")
        service_profile: Profile de servicio (ej: "INTERNET")
        descripcion: Descripción opcional
        onu_type: Tipo/modelo de ONU (ej: "HG8546M", "F660") - se añade a la descripción
        zona: Zona geográfica (ej: "30 de Mayo") - se añade a la descripción
        velocidad_bajada: Velocidad de descarga en Mbps (opcional)
        velocidad_subida: Velocidad de subida en Mbps (opcional)

    Returns:
        dict: {'success': bool, 'message': str}
    """

    try:
        # Parsear puerto: "0/1/5" → frame=0, slot=1, port=5
        parts = puerto.split('/')
        if len(parts) != 3:
            raise ValueError(f"Formato de puerto inválido: {puerto}")

        frame, slot, port = parts

        # Construir descripción mejorada con campos adicionales
        desc_parts = []
        if descripcion:
            desc_parts.append(descripcion)
        if onu_type:
            desc_parts.append(f"Tipo:{onu_type}")
        if zona:
            desc_parts.append(f"Zona:{zona}")
        if velocidad_bajada and velocidad_subida:
            desc_parts.append(f"{velocidad_bajada}↓/{velocidad_subida}↑Mbps")

        desc_final = " | ".join(desc_parts) if desc_parts else ""

        # Limpiar descripción para evitar problemas con caracteres especiales
        desc_cleaned = desc_final.replace('"', '').replace("'", "")

        # Comandos de configuración
        commands = [
            "enable",
            "config",
            f"interface gpon {frame}/{slot}",
            f'ont add {port} {ont_id} sn-auth "{serial}" omci ont-lineprofile-id {line_profile} ont-srvprofile-id {service_profile} desc "{desc_cleaned}"',
            "quit",
            "quit"
        ]

        # Ejecutar comandos
        output = ""
        for cmd in commands:
            olt_client.send_command(cmd)
            output += olt_client.receive_output()

        # Verificar si el comando fue exitoso
        if "succeeded" in output.lower() or "success" in output.lower():
            return {
                'success': True,
                'message': f'ONU autorizada exitosamente en puerto {puerto} con ONT ID {ont_id}',
                'output': output
            }
        elif "failed" in output.lower() or "error" in output.lower():
            return {
                'success': False,
                'message': f'Error autorizando ONU: {output}',
                'output': output
            }
        else:
            # Si no hay mensaje claro, verificar que la ONU fue añadida
            verify_cmd = f"display ont info {port} {ont_id}"
            verify_output = olt_client.send_command(verify_cmd)

            if serial in verify_output:
                return {
                    'success': True,
                    'message': 'ONU autorizada exitosamente (verificado)',
                    'output': output
                }
            else:
                return {
                    'success': False,
                    'message': 'No se pudo verificar la autorización de la ONU',
                    'output': output
                }

    except Exception as e:
        return {
            'success': False,
            'message': f'Error ejecutando comando: {str(e)}',
            'error': str(e)
        }
```

### ZTE C320

#### Comandos SSH Requeridos

```bash
# 1. Entrar al modo de configuración
configure terminal

# 2. Navegar a la interfaz PON
interface gpon-olt_1/1/5

# 3. Autorizar la ONU
onu 10 type ZTE-F660 sn ZTEG48575443

# 4. Configurar perfil de servicio (en modo global)
exit
pon-onu-mng gpon-onu_1/1/5:10

# 5. Asignar perfiles
service INTERNET gemport 1 vlan 100
tcont 1 name tcont_1 profile 100M

# 6. Descripción
description "Cliente Juan Perez - Plan 100Mbps"

# 7. Salir y guardar
exit
exit
write
```

#### Script Python Sugerido

```python
def autorizar_onu_zte(olt_client, puerto, ont_id, serial, line_profile, service_profile,
                      descripcion="", vlan=None, onu_type=None, zona=None,
                      velocidad_bajada=None, velocidad_subida=None):
    """
    Autorizar ONU pendiente en ZTE C320

    Args:
        olt_client: Cliente SSH conectado al OLT
        puerto: Puerto PON (ej: "1/1/5" → rack/slot/port)
        ont_id: ONT ID a asignar (ej: 10)
        serial: Serial number de la ONU (ej: "ZTEG48575443")
        line_profile: Profile de línea/velocidad (ej: "100M")
        service_profile: Profile de servicio (ej: "INTERNET")
        descripcion: Descripción opcional
        vlan: VLAN ID (opcional)
        onu_type: Tipo/modelo de ONU (ej: "HG8546M", "F660") - se añade a la descripción
        zona: Zona geográfica (ej: "30 de Mayo") - se añade a la descripción
        velocidad_bajada: Velocidad de descarga en Mbps (opcional)
        velocidad_subida: Velocidad de subida en Mbps (opcional)

    Returns:
        dict: {'success': bool, 'message': str}
    """

    try:
        # Construir descripción mejorada con campos adicionales
        desc_parts = []
        if descripcion:
            desc_parts.append(descripcion)
        if onu_type:
            desc_parts.append(f"Tipo:{onu_type}")
        if zona:
            desc_parts.append(f"Zona:{zona}")
        if velocidad_bajada and velocidad_subida:
            desc_parts.append(f"{velocidad_bajada}↓/{velocidad_subida}↑Mbps")

        desc_final = " | ".join(desc_parts) if desc_parts else ""

        # Limpiar descripción
        desc_cleaned = desc_final.replace('"', '').replace("'", "")

        # Determinar tipo de ONU basado en serial
        # ZTE serials generalmente empiezan con "ZTEG"
        onu_type = "ZTE-F660" if serial.startswith("ZTEG") else "ZTE-F601"

        # Comandos de configuración
        commands = [
            "configure terminal",
            f"interface gpon-olt_{puerto}",
            f"onu {ont_id} type {onu_type} sn {serial}",
            "exit",
            f"pon-onu-mng gpon-onu_{puerto}:{ont_id}",
        ]

        # Agregar configuración de servicio
        if vlan:
            commands.append(f"service {service_profile} gemport 1 vlan {vlan}")
        else:
            commands.append(f"service {service_profile} gemport 1")

        # Agregar TCONT con perfil de velocidad
        commands.append(f"tcont 1 name tcont_1 profile {line_profile}")

        # Agregar descripción si existe
        if desc_cleaned:
            commands.append(f'description "{desc_cleaned}"')

        # Salir y guardar
        commands.extend(["exit", "exit", "write"])

        # Ejecutar comandos
        output = ""
        for cmd in commands:
            olt_client.send_command(cmd)
            output += olt_client.receive_output()

        # Verificar éxito
        if "success" in output.lower() or not ("error" in output.lower() or "failed" in output.lower()):
            # Verificar que la ONU fue añadida
            verify_cmd = f"show gpon onu state gpon-onu_{puerto}:{ont_id}"
            verify_output = olt_client.send_command(verify_cmd)

            if serial in verify_output or "working" in verify_output.lower():
                return {
                    'success': True,
                    'message': f'ONU autorizada exitosamente en puerto {puerto} con ONT ID {ont_id}',
                    'output': output
                }

        return {
            'success': False,
            'message': f'Error autorizando ONU: {output}',
            'output': output
        }

    except Exception as e:
        return {
            'success': False,
            'message': f'Error ejecutando comando: {str(e)}',
            'error': str(e)
        }
```

## Validaciones Requeridas

### 1. Validar que la ONU existe y está pendiente

```python
def validar_onu_pendiente(olt_client, modelo_olt, serial):
    """Verificar que la ONU existe y está en estado pendiente"""

    if modelo_olt == 'Huawei MA5800':
        # Comando: display ont autofind all
        output = olt_client.send_command("display ont autofind all")
        return serial in output

    elif modelo_olt == 'ZTE C320':
        # Comando: show gpon onu uncfg
        output = olt_client.send_command("show gpon onu uncfg")
        return serial in output

    return False
```

### 2. Validar que el ONT ID está disponible

```python
def validar_ont_id_disponible(olt_client, modelo_olt, puerto, ont_id):
    """Verificar que el ONT ID no está ocupado en ese puerto"""

    if modelo_olt == 'Huawei MA5800':
        # Comando: display ont info <port> <ont_id>
        output = olt_client.send_command(f"display ont info {puerto.split('/')[-1]} {ont_id}")
        # Si retorna "No related ONT", está disponible
        return "no related ont" in output.lower() or "does not exist" in output.lower()

    elif modelo_olt == 'ZTE C320':
        # Comando: show gpon onu state gpon-onu_<puerto>:<ont_id>
        output = olt_client.send_command(f"show gpon onu state gpon-onu_{puerto}:{ont_id}")
        # Si no hay output o error, está disponible
        return "not exist" in output.lower() or output.strip() == ""

    return False
```

### 3. Validar que los perfiles existen

```python
def validar_perfiles_existen(olt_client, modelo_olt, line_profile, service_profile):
    """Verificar que los perfiles especificados existen en la OLT"""

    if modelo_olt == 'Huawei MA5800':
        # Verificar line profile
        output = olt_client.send_command(f"display ont-lineprofile gpon name {line_profile}")
        if "no such" in output.lower():
            return False, f"Line profile '{line_profile}' no existe"

        # Verificar service profile
        output = olt_client.send_command(f"display ont-srvprofile gpon name {service_profile}")
        if "no such" in output.lower():
            return False, f"Service profile '{service_profile}' no existe"

    elif modelo_olt == 'ZTE C320':
        # Verificar TCONT profile (velocidad)
        output = olt_client.send_command(f"show gpon profile tcont {line_profile}")
        if "not exist" in output.lower():
            return False, f"TCONT profile '{line_profile}' no existe"

    return True, "Perfiles válidos"
```

## Response del Endpoint

### Success Response

```json
{
  "success": true,
  "message": "ONU autorizada exitosamente",
  "data": {
    "serial": "48575443ABCD1234",
    "puerto": "0/1/5",
    "ont_id": 10,
    "estado": "online",
    "descripcion": "Cliente Juan Perez - Plan 100Mbps",
    "line_profile": "100M",
    "service_profile": "INTERNET",
    "timestamp": "2025-11-16T04:30:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error autorizando ONU",
  "error": "ONT ID 10 ya está ocupado en puerto 0/1/5",
  "code": "ONT_ID_OCCUPIED"
}
```

### Códigos de Error Posibles

| Código | Descripción |
|--------|-------------|
| `ONU_NOT_PENDING` | La ONU no está en estado pendiente |
| `ONT_ID_OCCUPIED` | El ONT ID ya está ocupado en ese puerto |
| `PROFILE_NOT_FOUND` | Uno de los perfiles especificados no existe |
| `PORT_NOT_FOUND` | El puerto especificado no existe en la OLT |
| `SERIAL_INVALID` | El serial number no tiene formato válido |
| `COMMAND_FAILED` | El comando SSH falló en la OLT |
| `OLT_UNREACHABLE` | No se puede conectar a la OLT |

## Flujo Completo del Endpoint

```javascript
// controllers/oltRealtimeController.js

async function autorizarOnu(req, res) {
    const { id_olt, serial } = req.params;
    const { puerto, ont_id, line_profile, service_profile, descripcion, vlan } = req.body;

    try {
        // 1. Obtener datos de la OLT desde BD
        const olt = await getOltFromDB(id_olt);

        if (!olt) {
            return res.status(404).json({
                success: false,
                message: 'OLT no encontrada'
            });
        }

        // 2. Conectar a la OLT vía SSH
        const olt_client = await connectToOLT(olt.ip_olt, olt.usuario_ssh, olt.password_ssh);

        // 3. Validar que la ONU está pendiente
        const esPendiente = await validarOnuPendiente(olt_client, olt.modelo, serial);
        if (!esPendiente) {
            return res.status(400).json({
                success: false,
                message: 'La ONU no está en estado pendiente',
                code: 'ONU_NOT_PENDING'
            });
        }

        // 4. Validar que el ONT ID está disponible
        const idDisponible = await validarOntIdDisponible(olt_client, olt.modelo, puerto, ont_id);
        if (!idDisponible) {
            return res.status(400).json({
                success: false,
                message: `ONT ID ${ont_id} ya está ocupado en puerto ${puerto}`,
                code: 'ONT_ID_OCCUPIED'
            });
        }

        // 5. Validar que los perfiles existen
        const [perfilesValidos, perfilError] = await validarPerfilesExisten(
            olt_client,
            olt.modelo,
            line_profile,
            service_profile
        );
        if (!perfilesValidos) {
            return res.status(400).json({
                success: false,
                message: perfilError,
                code: 'PROFILE_NOT_FOUND'
            });
        }

        // 6. Ejecutar comando de autorización
        let result;
        if (olt.modelo.includes('Huawei')) {
            result = await autorizarOnuHuawei(
                olt_client, puerto, ont_id, serial,
                line_profile, service_profile, descripcion
            );
        } else if (olt.modelo.includes('ZTE')) {
            result = await autorizarOnuZTE(
                olt_client, puerto, ont_id, serial,
                line_profile, service_profile, descripcion, vlan
            );
        } else {
            return res.status(400).json({
                success: false,
                message: 'Modelo de OLT no soportado para autorización automática'
            });
        }

        // 7. Verificar resultado
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message,
                code: 'COMMAND_FAILED',
                details: result.output
            });
        }

        // 8. Retornar éxito
        return res.json({
            success: true,
            message: 'ONU autorizada exitosamente',
            data: {
                serial: serial,
                puerto: puerto,
                ont_id: ont_id,
                estado: 'online',
                descripcion: descripcion,
                line_profile: line_profile,
                service_profile: service_profile,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error autorizando ONU:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}
```

## Testing

### Test Manual con cURL

```bash
# Autorizar ONU en Huawei
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "puerto": "0/1/5",
    "ont_id": 10,
    "line_profile": "100M",
    "service_profile": "INTERNET",
    "descripcion": "Cliente Prueba - Plan 100Mbps"
  }' \
  https://wellnet-rd.com:444/api/olts/realtime/1/onus/48575443ABCD1234/authorize

# Autorizar ONU en ZTE
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "puerto": "1/1/5",
    "ont_id": 10,
    "line_profile": "100M",
    "service_profile": "INTERNET",
    "descripcion": "Cliente Prueba - Plan 100Mbps",
    "vlan": 100
  }' \
  https://wellnet-rd.com:444/api/olts/realtime/2/onus/ZTEG48575443/authorize
```

### Casos de Prueba

1. **ONU Pendiente Válida**: Debe autorizar correctamente
2. **ONU Ya Autorizada**: Debe retornar error `ONU_NOT_PENDING`
3. **ONT ID Ocupado**: Debe retornar error `ONT_ID_OCCUPIED`
4. **Perfil Inexistente**: Debe retornar error `PROFILE_NOT_FOUND`
5. **Puerto Inválido**: Debe retornar error `PORT_NOT_FOUND`

## Notas Importantes

1. **Perfiles Disponibles**: El frontend debería obtener la lista de perfiles disponibles de otro endpoint antes de mostrar el formulario de autorización.

2. **ONT IDs Disponibles**: Sería útil tener un endpoint que retorne los ONT IDs disponibles para un puerto específico.

3. **Timeout**: Los comandos de autorización pueden tardar varios segundos. Configurar timeout de al menos 30 segundos.

4. **Idempotencia**: Si se intenta autorizar la misma ONU dos veces, el segundo intento debe fallar con error apropiado.

5. **Logging**: Registrar todas las autorizaciones en un log para auditoría.

6. **Rollback**: Si la autorización falla a mitad del proceso, considerar implementar rollback automático.

## Endpoints Adicionales Recomendados

### 1. Obtener Perfiles Disponibles

```
GET /api/olts/realtime/:id_olt/profiles
```

Retorna lista de line_profiles y service_profiles disponibles.

### 2. Obtener ONT IDs Disponibles

```
GET /api/olts/realtime/:id_olt/ports/:puerto/available-ont-ids
```

Retorna lista de ONT IDs disponibles en un puerto específico.

### 3. Desautorizar ONU

```
DELETE /api/olts/realtime/:id_olt/onus/:serial
```

Elimina una ONU autorizada (útil para rollback o mantenimiento).

---

**Prioridad**: Alta
**Tiempo Estimado**: 2-3 horas (backend + testing)
**Impacto**: Crítico - Funcionalidad clave para operaciones del ISP
