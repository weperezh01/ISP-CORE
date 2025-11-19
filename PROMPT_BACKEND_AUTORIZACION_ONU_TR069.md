# Prompt para Backend: Implementación de Autorización de ONU con TR-069

## Contexto

Estamos implementando un sistema completo de gestión de ONUs (Optical Network Units) para OLTs (Optical Line Terminals) Huawei MA5800 y ZTE C320. El frontend de la aplicación móvil React Native ya está completamente desarrollado y necesita que implementes el endpoint de autorización de ONUs con soporte completo para TR-069 (CWMP).

## Objetivo

Implementar el endpoint `POST /api/olts/realtime/:oltId/onus/:serial/authorize` que reciba todos los parámetros TR-069 desde el frontend, configure la ONU en el OLT físico, y retorne una respuesta con el estado de la autorización.

---

## Especificación del Endpoint

### Método HTTP
```
POST /api/olts/realtime/:oltId/onus/:serial/authorize
```

### URL Parameters
- `oltId` (string, requerido): ID del OLT en la base de datos
- `serial` (string, requerido): Serial number de la ONU a autorizar (puede ser index, serial, o identificador único)

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

### Request Body (JSON)

```typescript
{
  // ==================== CAMPOS OBLIGATORIOS ====================

  // Ubicación PON
  "puerto": "0/1/5",                    // Formato Huawei: frame/slot/port (0/1/5)
                                        // Formato ZTE: rack/slot/port (1/1/5)
  "ont_id": 10,                         // ID único de la ONU en el puerto (0-127)

  // Tipo de PON
  "pon_type": "GPON",                   // "GPON" | "EPON"
  "gpon_channel": "GPON",               // "GPON" | "XG-PON" | "XGS-PON"

  // Tipo de ONU y Modo
  "onu_type": "HG8546M",                // Modelo del equipo: "COMCAST1", "HG8546M", "F660", "F601", "F670L", etc.
  "onu_mode": "Routing",                // "Routing" | "Bridging"

  // Configuración de Red
  "user_vlan_id": 100,                  // VLAN ID para el cliente
  "download_speed": "100M",             // Velocidad de bajada en formato string: "1G", "500M", "100M", "36M", etc.
  "upload_speed": "50M",                // Velocidad de subida en formato string: "1G", "500M", "100M", "36M", etc.
  "download_mbps": 100,                 // Velocidad de bajada en Mbps (numérico)
  "upload_mbps": 50,                    // Velocidad de subida en Mbps (numérico)

  // Ubicación del Cliente
  "zona": "30 de Mayo",                 // Zona geográfica / sector
  "name": "Juan Perez - Plan 100M",    // Nombre descriptivo del servicio

  // ==================== CAMPOS OPCIONALES ====================

  // Información del puerto detectado (usualmente read-only, enviados desde el detected)
  "board": 1,                           // Número de board/tarjeta
  "port": 0,                            // Número de puerto dentro del board
  "sn": "48575443ABCD1234",            // Serial Number (generalmente el mismo que :serial en URL)

  // Perfil personalizado
  "use_custom_profile": false,          // Si true, usar perfil TR-069 personalizado

  // Ubicación física (ODB - Optical Distribution Box)
  "odb_splitter": "ODB-15",            // Identificador del splitter
  "odb_port": "3",                     // Puerto en el splitter

  // Información adicional
  "address_comment": "Casa esquina color verde, portón negro",
  "onu_external_id": "CUST-2024-001",  // ID externo (default: mismo que SN)

  // Geolocalización GPS
  "use_gps": true,
  "gps_latitude": 18.4861,
  "gps_longitude": -69.9312,

  // ==================== CAMPOS LEGACY (compatibilidad) ====================
  // Estos campos son para mantener compatibilidad con el endpoint anterior
  // Pueden ser ignorados si ya usas los campos TR-069 arriba

  "line_profile": "100M",              // Perfil de línea (opcional si ya tienes download/upload_speed)
  "service_profile": "INTERNET",       // Perfil de servicio
  "descripcion": "Cliente residencial",
  "vlan": 100,                         // Alternativa a user_vlan_id
  "velocidad_bajada": 100,             // Alternativa numérica a download_speed
  "velocidad_subida": 50               // Alternativa numérica a upload_speed
}
```

---

## Validaciones Requeridas

### Campos Obligatorios
Validar que estén presentes:
- `puerto`
- `ont_id`
- `onu_type`
- `zona`
- `name`

### Validaciones de Formato

1. **puerto**: Debe tener formato válido:
   - Huawei: `frame/slot/port` (ej: "0/1/5", "0/2/10")
   - ZTE: `rack/slot/port` (ej: "1/1/5", "1/2/8")

2. **ont_id**:
   - Debe ser un número entero entre 0 y 127
   - Debe estar disponible en el puerto especificado (no en uso por otra ONU)

3. **pon_type**:
   - Solo valores permitidos: "GPON" o "EPON"

4. **gpon_channel**:
   - Solo valores permitidos: "GPON", "XG-PON", "XGS-PON"

5. **onu_mode**:
   - Solo valores permitidos: "Routing" o "Bridging"

6. **user_vlan_id**:
   - Debe ser un número entero entre 1 y 4094

7. **download_speed / upload_speed**:
   - Formato: número + unidad (ej: "100M", "1G", "36M", "150M")
   - Acepta CUALQUIER valor con formato válido (número seguido de "M" o "G")
   - NO validar contra lista hardcodeada
   - ⚠️ **IMPORTANTE**: Validar que la velocidad exista en la tabla `TipoServicio` del ISP
   - El frontend también envía `download_mbps` y `upload_mbps` (valores numéricos)

8. **GPS (si use_gps es true)**:
   - `gps_latitude`: número entre -90 y 90
   - `gps_longitude`: número entre -180 y 180

### Validaciones de Negocio

1. **OLT debe existir**: Verificar que `oltId` exista en la base de datos
2. **ONU debe estar pendiente**: La ONU debe estar en estado "pending", "discovered" o "pendiente"
3. **Serial debe coincidir**: El serial en la URL debe coincidir con el SN de la ONU detectada
4. **Puerto debe existir**: El puerto especificado debe existir físicamente en el OLT
5. **ONT ID disponible**: El `ont_id` no debe estar en uso en ese puerto
6. **Tipo de ONU soportado**: El `onu_type` debe ser compatible con el OLT
7. **Velocidad válida**:
   - Validar formato regex: `/^\d+(\.\d+)?(M|G)$/i`
   - ⚠️ **CRÍTICO**: Validar que `download_mbps` y `upload_mbps` existan en `TipoServicio` del ISP
   - Query: `SELECT id_servicio FROM TipoServicio WHERE velocidad_servicio = ? AND id_isp = ?`
   - Si no existe: retornar error `400` con mensaje: `"Velocidad no disponible en los planes del ISP"`

---

## Proceso de Autorización

### 1. Validar Datos de Entrada
- Verificar todos los campos obligatorios
- Validar formatos y rangos
- Verificar que el OLT existe y está activo

### 2. Consultar ONU Pendiente
```sql
-- Buscar la ONU pendiente en la tabla de ONUs detectadas
SELECT * FROM onus_detected
WHERE olt_id = :oltId
  AND (serial = :serial OR index = :serial)
  AND estado IN ('pending', 'discovered', 'pendiente');
```

Si no existe → Error 404

### 3. Verificar Disponibilidad de ONT ID
```sql
-- Verificar que el ont_id no esté en uso en ese puerto
SELECT COUNT(*) FROM onus
WHERE olt_id = :oltId
  AND puerto = :puerto
  AND ont_id = :ont_id
  AND estado != 'deleted';
```

Si existe → Error 409 (Conflict)

### 4. Conectar al OLT y Autorizar

**Para Huawei MA5800:**
```bash
# Entrar al modo de configuración
enable
config

# Navegar al puerto PON
interface gpon {frame}/{slot}
ont add {port} {ont_id} sn-auth {serial} omci ont-lineprofile-name {line_profile} ont-srvprofile-name {service_profile} desc {name}

# Configurar TR-069
ont tr069-server set {port} {ont_id} acs-url http://acs.wellnet-rd.com:7547 acs-user admin acs-password admin

# Configurar VLAN
service-port vlan {user_vlan_id} gpon {frame}/{slot}/{port} ont {ont_id} gemport 1 multi-service user-vlan {user_vlan_id}

# Configurar velocidad (DBA profile)
display dba-profile name {line_profile}
# Aplicar perfil de velocidad correspondiente

quit
quit
```

**Para ZTE C320:**
```bash
# Entrar al modo de configuración
configure terminal

# Navegar al puerto PON
interface gpon-olt_{rack}/{slot}/{port}
onu {ont_id} type {onu_type} sn {serial}

# Configurar servicios
onu {ont_id} profile line {line_profile} remote {service_profile}

# Configurar VLAN
interface gpon-onu_{rack}/{slot}/{port}:{ont_id}
tcont 1 profile {line_profile}
gemport 1 tcont 1
vlan-filter-mode tag-filter vlan-filter untag-filter discard
vlan port eth_0/1 mode tag vlan {user_vlan_id}

# Configurar TR-069
acs url http://acs.wellnet-rd.com:7547
acs username admin password admin

exit
exit
```

### 5. Guardar en Base de Datos

**Tabla: onus**
```sql
INSERT INTO onus (
  olt_id,
  serial,
  puerto,
  ont_id,
  board,
  port,
  pon_type,
  gpon_channel,
  onu_type,
  onu_mode,
  user_vlan_id,
  download_speed,
  upload_speed,
  zona,
  name,
  odb_splitter,
  odb_port,
  address_comment,
  onu_external_id,
  use_gps,
  gps_latitude,
  gps_longitude,
  estado,
  fecha_autorizacion,
  autorizado_por_usuario_id
) VALUES (
  :oltId,
  :serial,
  :puerto,
  :ont_id,
  :board,
  :port,
  :pon_type,
  :gpon_channel,
  :onu_type,
  :onu_mode,
  :user_vlan_id,
  :download_speed,
  :upload_speed,
  :zona,
  :name,
  :odb_splitter,
  :odb_port,
  :address_comment,
  :onu_external_id,
  :use_gps,
  :gps_latitude,
  :gps_longitude,
  'online',
  NOW(),
  :user_id
);
```

**Actualizar ONU Detectada:**
```sql
UPDATE onus_detected
SET
  estado = 'authorized',
  fecha_procesado = NOW()
WHERE olt_id = :oltId
  AND serial = :serial;
```

### 6. Registrar Evento

```sql
INSERT INTO onu_eventos (
  onu_id,
  tipo_evento,
  descripcion,
  usuario_id,
  fecha_evento
) VALUES (
  :onu_id,
  'autorizacion',
  'ONU autorizada vía TR-069',
  :user_id,
  NOW()
);
```

---

## Response Body

### Éxito (200 OK)

```json
{
  "success": true,
  "message": "ONU autorizada correctamente",
  "data": {
    "onu_id": 12345,
    "serial": "48575443ABCD1234",
    "puerto": "0/1/5",
    "ont_id": 10,
    "estado": "online",
    "fecha_autorizacion": "2024-01-15T10:30:00Z",
    "tr069_profile": "default",
    "mgmt_ip": "192.168.100.10",
    "actual_wan_ip": "10.0.5.123",
    "actual_onu_ip": "192.168.1.1"
  }
}
```

### Error - Campos Faltantes (400 Bad Request)

```json
{
  "success": false,
  "error": "Campos requeridos faltantes",
  "missing_fields": ["puerto", "ont_id", "zona"],
  "message": "Por favor complete todos los campos requeridos (*)"
}
```

### Error - Validación de Formato (400 Bad Request)

```json
{
  "success": false,
  "error": "Formato de puerto inválido",
  "message": "El puerto debe tener formato frame/slot/port (Huawei) o rack/slot/port (ZTE)",
  "provided": "invalid_format"
}
```

### Error - ONU No Encontrada (404 Not Found)

```json
{
  "success": false,
  "error": "ONU no encontrada",
  "message": "No se encontró una ONU pendiente con el serial especificado en este OLT"
}
```

### Error - ONT ID en Uso (409 Conflict)

```json
{
  "success": false,
  "error": "ONT ID ya está en uso",
  "message": "El ONT ID 10 ya está siendo usado en el puerto 0/1/5",
  "conflict_with": {
    "onu_id": 9876,
    "serial": "48575443XXXXZZZZ",
    "name": "Otro cliente"
  }
}
```

### Error - Comunicación con OLT (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Error de comunicación con el OLT",
  "message": "No se pudo conectar al OLT o ejecutar el comando de autorización",
  "olt_error": "SSH connection timeout after 30s",
  "olt_id": "olt-001"
}
```

### Error - Comando OLT Fallido (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Error al autorizar ONU en el OLT",
  "message": "El OLT rechazó el comando de autorización",
  "olt_error": "Failure: the ONT ID is used already(ONT ID=10)",
  "command": "ont add 5 10 sn-auth 48575443ABCD1234..."
}
```

---

## Endpoint Auxiliar: Obtener ONT IDs Disponibles

### Método HTTP
```
GET /api/olts/realtime/:oltId/available-ont-ids?puerto=0/1/5
```

### Query Parameters
- `puerto` (string, requerido): Puerto PON a consultar (ej: "0/1/5")

### Response Body (200 OK)

```json
{
  "success": true,
  "data": {
    "puerto": "0/1/5",
    "available_ids": [5, 6, 7, 8, 10, 11, 15, 20, 25, 30],
    "next_available": 5,
    "total_available": 10,
    "total_used": 3,
    "max_capacity": 128
  }
}
```

### Lógica del Endpoint

1. Conectar al OLT
2. Ejecutar comando para listar ONUs en el puerto:
   - **Huawei**: `display ont info {frame} {slot} {port}`
   - **ZTE**: `show gpon onu state gpon-olt_{rack}/{slot}/{port}`
3. Parsear la salida y extraer los ONT IDs en uso
4. Calcular IDs disponibles (0-127 - IDs_en_uso)
5. Retornar los primeros 10 disponibles ordenados

---

## Consideraciones Técnicas

### 1. Conexión al OLT
- Usar SSH para conectar a los OLTs
- Timeout de conexión: 30 segundos
- Timeout de comando: 60 segundos
- Reintentar 1 vez en caso de fallo de conexión

### 2. Parseo de Respuestas
- Las respuestas de OLTs Huawei y ZTE tienen formatos diferentes
- Implementar parsers específicos por marca
- Validar que el comando se ejecutó correctamente antes de guardar en BD

### 3. Transacciones
- Usar transacciones de base de datos
- Si falla el guardado en BD, intentar revertir el cambio en el OLT (best effort)
- Registrar todos los intentos fallidos para auditoría

### 4. Logs y Auditoría
- Loguear todos los comandos enviados al OLT
- Registrar respuestas completas del OLT
- Guardar timestamp de cada operación
- Incluir usuario_id del que autorizó

### 5. Seguridad
- Validar el token JWT
- Verificar permisos del usuario (debe tener rol de técnico o superior)
- Sanitizar todos los inputs para evitar inyección de comandos
- No exponer credenciales del OLT en los logs

### 6. Performance
- Implementar caché de 2 minutos para ONT IDs disponibles
- Ejecutar comandos OLT de forma asíncrona si es posible
- Considerar queue para múltiples autorizaciones simultáneas

---

## Casos de Prueba

### Test 1: Autorización Exitosa Básica
```bash
curl -X POST https://wellnet-rd.com:444/api/olts/realtime/olt-001/onus/48575443ABCD1234/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "puerto": "0/1/5",
    "ont_id": 10,
    "pon_type": "GPON",
    "gpon_channel": "GPON",
    "onu_type": "HG8546M",
    "onu_mode": "Routing",
    "user_vlan_id": 100,
    "download_speed": "100M",
    "upload_speed": "50M",
    "zona": "30 de Mayo",
    "name": "Juan Perez - Plan 100M"
  }'
```

**Resultado Esperado**: 200 OK con data de la ONU autorizada

### Test 2: Autorización con GPS
```bash
curl -X POST https://wellnet-rd.com:444/api/olts/realtime/olt-001/onus/48575443ABCD1234/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "puerto": "0/1/5",
    "ont_id": 12,
    "pon_type": "GPON",
    "gpon_channel": "GPON",
    "onu_type": "F660",
    "onu_mode": "Routing",
    "user_vlan_id": 200,
    "download_speed": "500M",
    "upload_speed": "200M",
    "zona": "Villa Mella",
    "name": "Maria Lopez - Plan 500M",
    "use_gps": true,
    "gps_latitude": 18.4861,
    "gps_longitude": -69.9312,
    "address_comment": "Casa azul, segunda planta",
    "odb_splitter": "ODB-25",
    "odb_port": "7"
  }'
```

**Resultado Esperado**: 200 OK con todos los datos guardados

### Test 3: Campo Requerido Faltante
```bash
curl -X POST https://wellnet-rd.com:444/api/olts/realtime/olt-001/onus/48575443ABCD1234/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "puerto": "0/1/5",
    "ont_id": 15,
    "pon_type": "GPON"
  }'
```

**Resultado Esperado**: 400 Bad Request con lista de campos faltantes

### Test 4: ONT ID Duplicado
```bash
# Intentar autorizar con un ONT ID ya en uso
curl -X POST https://wellnet-rd.com:444/api/olts/realtime/olt-001/onus/48575443NEWSERIAL/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "puerto": "0/1/5",
    "ont_id": 10,
    ...
  }'
```

**Resultado Esperado**: 409 Conflict con información de la ONU que ya usa ese ID

### Test 5: Obtener IDs Disponibles
```bash
curl -X GET "https://wellnet-rd.com:444/api/olts/realtime/olt-001/available-ont-ids?puerto=0/1/5" \
  -H "Authorization: Bearer {token}"
```

**Resultado Esperado**: 200 OK con array de IDs disponibles

---

## Estructura de Base de Datos Recomendada

### Tabla: onus

```sql
CREATE TABLE onus (
  -- Identificación
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  olt_id VARCHAR(50) NOT NULL,
  serial VARCHAR(50) NOT NULL,
  onu_external_id VARCHAR(100),

  -- Ubicación PON
  puerto VARCHAR(20) NOT NULL,              -- "0/1/5"
  ont_id INT NOT NULL,                      -- 10
  board INT,
  port INT,
  slot INT,

  -- Tipo de PON y ONU
  pon_type ENUM('GPON', 'EPON') DEFAULT 'GPON',
  gpon_channel ENUM('GPON', 'XG-PON', 'XGS-PON') DEFAULT 'GPON',
  onu_type VARCHAR(50),                     -- "HG8546M"
  onu_mode ENUM('Routing', 'Bridging') DEFAULT 'Routing',

  -- Configuración de Red
  user_vlan_id INT,
  download_speed VARCHAR(10),               -- "100M"
  upload_speed VARCHAR(10),                 -- "50M"
  line_profile VARCHAR(50),
  service_profile VARCHAR(50),

  -- Cliente
  zona VARCHAR(100),
  name VARCHAR(200),
  descripcion TEXT,

  -- Ubicación Física
  odb_splitter VARCHAR(50),
  odb_port VARCHAR(10),
  address_comment TEXT,

  -- GPS
  use_gps BOOLEAN DEFAULT FALSE,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),

  -- TR-069
  use_custom_profile BOOLEAN DEFAULT FALSE,
  tr069_profile VARCHAR(50),
  mgmt_ip VARCHAR(45),
  wan_setup_mode VARCHAR(20),
  actual_wan_ip VARCHAR(45),
  actual_onu_ip VARCHAR(45),

  -- Estado y Métricas
  estado VARCHAR(20) DEFAULT 'online',
  potencia_rx DECIMAL(5, 2),
  potencia_tx DECIMAL(5, 2),
  distancia INT,
  temperatura DECIMAL(5, 2),

  -- Auditoría
  fecha_autorizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  autorizado_por_usuario_id BIGINT,
  fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indices
  INDEX idx_olt_puerto_ont (olt_id, puerto, ont_id),
  INDEX idx_serial (serial),
  INDEX idx_estado (estado),
  UNIQUE KEY unique_olt_puerto_ontid (olt_id, puerto, ont_id)
);
```

### Tabla: onu_eventos

```sql
CREATE TABLE onu_eventos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  onu_id BIGINT NOT NULL,
  tipo_evento VARCHAR(50) NOT NULL,         -- 'autorizacion', 'desconexion', 'cambio_config', etc.
  descripcion TEXT,
  usuario_id BIGINT,
  fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_onu_id (onu_id),
  INDEX idx_tipo_evento (tipo_evento),
  INDEX idx_fecha (fecha_evento)
);
```

---

## Notas Finales

1. **Frontend ya está listo**: Todo el código React Native está implementado y funcionando. Solo falta conectar con el backend real.

2. **Priorizar validación**: Es crítico validar todos los inputs antes de enviar comandos al OLT, ya que comandos incorrectos pueden afectar el servicio.

3. **Manejo de errores robusto**: Los OLTs pueden responder de formas inesperadas. Implementar parseo defensivo.

4. **Logging extensivo**: Guardar todos los comandos y respuestas del OLT para debugging y auditoría.

5. **Reintentos**: Implementar lógica de reintentos para comandos que fallen por timeout o problemas de red.

6. **Notificaciones**: Considerar implementar WebSocket o polling para notificar al frontend cuando la ONU cambie de estado.

---

## Endpoints Relacionados Pendientes (Futuro)

Estos endpoints son referenciados en el frontend pero aún no son críticos para la funcionalidad básica:

- `GET /api/olts/:oltId/tr069-config/:serial` - Obtener configuración TR-069
- `POST /api/olts/:oltId/set-management-ip/:serial` - Configurar Management IP
- `POST /api/olts/:oltId/set-wan-config/:serial` - Configurar WAN
- `GET /api/olts/:oltId/sw-info/:serial` - Obtener información de software
- `GET /api/olts/:oltId/tr069-status/:serial` - Estado TR-069

---

## Contacto

Si tienes dudas sobre la implementación o necesitas aclaraciones sobre algún campo o flujo, consulta la documentación del frontend en:

- `src/pantallas/controles/OLTs/services/types.ts` - Definiciones TypeScript
- `src/pantallas/controles/OLTs/services/api.ts` - Funciones de API
- `src/pantallas/controles/OLTs/ONUDetailsScreen.tsx` - Implementación del flujo

**¡Éxito con la implementación!** 🚀
