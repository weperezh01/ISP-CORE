# REQUERIMIENTO BACKEND: Asociar ONU con Servidor TR-069 al Autorizar

## Contexto

Actualmente, cuando se autoriza una ONU desde la aplicación móvil (pantalla `AutorizarONUScreen`), el backend solo configura la ONU en la OLT física. Sin embargo, necesitamos que **AUTOMÁTICAMENTE** también se registre/asocie la ONU en nuestro servidor TR-069 (ACS - Auto Configuration Server) que vive en el mismo servidor backend.

---

## Problema Actual

**Pantalla:** `src/pantallas/controles/OLTs/AutorizarONUScreen.tsx`

**Líneas 81-83:**
```typescript
// TODO: reemplazar por endpoint real de autorización
console.log('➡️ Payload autorización ONU', payload);
Alert.alert('Autorizar ONU', 'Petición enviada (simulada). Integra el endpoint real.');
```

**Estado:**
- ❌ El endpoint de autorización NO está implementado en el backend
- ❌ No hay integración con el servidor TR-069/ACS
- ❌ Las ONUs se quedan sin gestión TR-069 automática

---

## Objetivo

Implementar el endpoint de autorización de ONU que:

1. ✅ Configure la ONU en la OLT física (Huawei MA5800 / ZTE C320)
2. ✅ **REGISTRE/ASOCIE automáticamente la ONU en el servidor TR-069 (ACS)**
3. ✅ Guarde la información en la base de datos
4. ✅ Retorne respuesta con el estado de la ONU y la asociación TR-069

---

## Especificación del Endpoint

### Método HTTP
```
POST /api/olts/realtime/:oltId/onus/:serial/authorize
```

### Request Body

El frontend ya envía este payload completo:

```typescript
{
  // Identificadores
  oltId: string,                        // ID de la OLT en BD

  // Configuración PON
  pon_type: "GPON" | "EPON",           // Tipo de PON
  board: string,                        // Número de board
  port: string,                         // Número de puerto
  sn: string,                           // Serial Number (ej: "48575443ABCD1234")

  // Configuración ONU
  onu_type: string,                     // Modelo/Tipo de ONU (ej: "HG8546M", "F660")
  custom_profile: boolean,              // Si usa perfil personalizado
  mode: "Routing" | "Bridging",        // Modo de operación

  // Configuración de Red
  user_vlan: string,                    // VLAN del usuario (ej: "100")
  download_speed: string,               // Velocidad bajada (ej: "100M", "1G")
  upload_speed: string,                 // Velocidad subida (ej: "50M", "500M")

  // Ubicación y Cliente
  zone: string,                         // Zona geográfica
  name: string,                         // Nombre del cliente/servicio
  address: string,                      // Dirección física / comentario

  // Ubicación física (ODB)
  odb: string,                          // Identificador del ODB/Splitter
  odb_port: string,                     // Puerto en el ODB

  // Otros
  external_id: string,                  // ID externo (default: mismo que SN)
  use_gps: boolean,                     // Si se guardó ubicación GPS
  // gps_latitude?: number,
  // gps_longitude?: number,
}
```

---

## Flujo de Autorización con TR-069

### Paso 1: Validar Datos de Entrada
- Verificar que todos los campos obligatorios estén presentes
- Validar formatos (puerto, VLAN, velocidades, etc.)
- Verificar que la ONU esté en estado "pending" en la BD

### Paso 2: Autorizar en la OLT Física

**Para Huawei MA5800:**
```bash
enable
config
interface gpon 0/1

# Autorizar ONU
ont add 5 10 sn-auth 48575443ABCD1234 omci ont-lineprofile-name 100M ont-srvprofile-name INTERNET desc "Cliente Plan 100M"

# Configurar TR-069 en la OLT (URL del servidor ACS)
ont tr069-server set 5 10 acs-url http://wellnet-rd.com:7547 acs-user admin acs-password admin

# Configurar VLAN
service-port vlan 100 gpon 0/1/5 ont 10 gemport 1 multi-service user-vlan 100

quit
quit
```

**Para ZTE C320:**
```bash
configure terminal
interface gpon-olt_1/1/5

# Autorizar ONU
onu 10 type HG8546M sn 48575443ABCD1234
onu 10 profile line 100M remote INTERNET

# Configurar TR-069
interface gpon-onu_1/1/5:10
acs url http://wellnet-rd.com:7547
acs username admin password admin

# Configurar VLAN
tcont 1 profile 100M
gemport 1 tcont 1
vlan port eth_0/1 mode tag vlan 100

exit
exit
```

### Paso 3: **REGISTRAR EN SERVIDOR TR-069 (ACS)** ⭐ NUEVO

**Esto es lo que falta implementar:**

El backend debe comunicarse con el servidor TR-069/ACS para registrar la nueva ONU.

#### Opción A: Si usas GenieACS

```javascript
// Endpoint interno del ACS
const acsUrl = 'http://localhost:7547';

// Registrar dispositivo en GenieACS
const acsPayload = {
  deviceId: serial,              // Serial de la ONU
  serialNumber: serial,
  productClass: onu_type,        // Modelo de la ONU
  manufacturer: detectManufacturer(serial), // "Huawei", "ZTE", etc.

  // Parámetros TR-069
  connectionRequest: {
    url: `http://${managementIp}:7547/`,
    username: 'admin',
    password: 'admin'
  },

  // Información adicional
  tags: [
    'authorized',
    `zone_${zone}`,
    `vlan_${user_vlan}`,
    `speed_${download_speed}`
  ],

  // Metadata
  customFields: {
    oltId: oltId,
    clientName: name,
    zone: zone,
    vlan: user_vlan,
    downloadSpeed: download_speed,
    uploadSpeed: upload_speed,
    odbSplitter: odb,
    odbPort: odb_port,
    authorizationDate: new Date().toISOString()
  }
};

// Llamar al API de GenieACS
const response = await fetch(`${acsUrl}/devices`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(acsPayload)
});
```

#### Opción B: Si usas otro servidor ACS

Consultar la documentación del servidor TR-069 que estés utilizando para:
- Registrar dispositivo nuevo
- Configurar parámetros TR-069
- Asociar con perfil de configuración

### Paso 4: Guardar en Base de Datos

**Tabla: `onus`**
```sql
INSERT INTO onus (
  olt_id,
  serial,
  puerto,
  ont_id,
  board,
  port,
  pon_type,
  onu_type,
  onu_mode,
  user_vlan_id,
  download_speed,
  upload_speed,
  zona,
  name,
  address_comment,
  odb_splitter,
  odb_port,
  onu_external_id,
  use_gps,

  -- TR-069 INFO (NUEVO) ⭐
  tr069_registered: BOOLEAN,
  tr069_acs_url: VARCHAR,
  tr069_connection_status: VARCHAR,
  tr069_last_inform: TIMESTAMP,

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
  :onu_type,
  :mode,
  :user_vlan,
  :download_speed,
  :upload_speed,
  :zone,
  :name,
  :address,
  :odb,
  :odb_port,
  :external_id,
  :use_gps,

  -- TR-069 INFO
  TRUE,                                    -- tr069_registered
  'http://wellnet-rd.com:7547',           -- tr069_acs_url
  'pending_inform',                        -- tr069_connection_status
  NULL,                                    -- tr069_last_inform (se actualiza cuando la ONU contacte al ACS)

  'online',
  NOW(),
  :user_id
);
```

### Paso 5: Responder al Frontend

**Success (200 OK):**
```json
{
  "success": true,
  "message": "ONU autorizada y registrada en TR-069",
  "data": {
    "onu_id": 12345,
    "serial": "48575443ABCD1234",
    "puerto": "0/1/5",
    "ont_id": 10,
    "estado": "online",
    "fecha_autorizacion": "2025-11-20T14:30:00Z",

    // TR-069 INFO
    "tr069_registered": true,
    "tr069_acs_url": "http://wellnet-rd.com:7547",
    "tr069_status": "pending_inform",
    "tr069_message": "Dispositivo registrado en ACS. Esperando primer INFORM desde la ONU."
  }
}
```

**Error - Fallo en OLT pero éxito en TR-069 (206 Partial Content):**
```json
{
  "success": false,
  "error": "Autorización parcial",
  "message": "La ONU se registró en TR-069 pero falló la configuración en la OLT",
  "data": {
    "olt_error": "SSH connection timeout",
    "tr069_registered": true,
    "tr069_status": "registered",
    "action_required": "Revisar conectividad con la OLT y reintentar"
  }
}
```

**Error - Fallo en TR-069 pero éxito en OLT (206 Partial Content):**
```json
{
  "success": false,
  "error": "Autorización parcial",
  "message": "La ONU se autorizó en la OLT pero falló el registro en TR-069",
  "data": {
    "onu_id": 12345,
    "olt_configured": true,
    "tr069_registered": false,
    "tr069_error": "ACS connection refused",
    "action_required": "La ONU funciona pero no está gestionada por TR-069. Configurar manualmente."
  }
}
```

---

## Configuración del Servidor TR-069/ACS

### Información Requerida

Para implementar esta integración, necesitamos conocer:

1. **¿Qué servidor TR-069 están usando?**
   - [ ] GenieACS (open source)
   - [ ] FreeACS
   - [ ] Otro (especificar): _________________

2. **URL del servidor ACS:**
   - Ejemplo: `http://wellnet-rd.com:7547` o `http://localhost:7547`

3. **Credenciales del API del ACS:**
   - Usuario: ______________
   - Password: ______________
   - API Key (si aplica): ______________

4. **¿El ACS está en el mismo servidor que el backend?**
   - [ ] Sí, localhost
   - [ ] No, servidor separado (IP: ___________)

5. **Puerto del ACS:**
   - Por defecto TR-069 usa: `7547`
   - Puerto actual: ______________

6. **¿El ACS tiene API REST?**
   - [ ] Sí (proveer documentación)
   - [ ] No (¿cómo se registran dispositivos?)

---

## Cambios en la Base de Datos

### Tabla: `onus` - Agregar Columnas TR-069

```sql
ALTER TABLE onus
ADD COLUMN tr069_registered BOOLEAN DEFAULT FALSE COMMENT 'Si está registrado en el servidor ACS',
ADD COLUMN tr069_acs_url VARCHAR(255) COMMENT 'URL del servidor ACS',
ADD COLUMN tr069_connection_status VARCHAR(50) COMMENT 'Estado: pending_inform, online, offline, error',
ADD COLUMN tr069_last_inform TIMESTAMP NULL COMMENT 'Última vez que la ONU contactó al ACS',
ADD COLUMN tr069_device_id VARCHAR(100) COMMENT 'ID del dispositivo en el ACS',
ADD COLUMN tr069_error_message TEXT COMMENT 'Último error de TR-069 si aplica';
```

### Índices Recomendados

```sql
CREATE INDEX idx_tr069_status ON onus(tr069_connection_status);
CREATE INDEX idx_tr069_registered ON onus(tr069_registered);
CREATE INDEX idx_tr069_last_inform ON onus(tr069_last_inform);
```

---

## Endpoints Adicionales TR-069 (Opcionales pero Recomendados)

Una vez que la ONU esté registrada en TR-069, sería útil tener:

### 1. Verificar Estado TR-069
```
GET /api/onus/:onuId/tr069-status
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "registered": true,
    "status": "online",
    "last_inform": "2025-11-20T14:35:00Z",
    "connection_request_url": "http://192.168.100.10:7547/",
    "parameters_count": 245,
    "last_parameter_sync": "2025-11-20T14:30:00Z"
  }
}
```

### 2. Forzar Refresh TR-069
```
POST /api/onus/:onuId/tr069-refresh
```

Respuesta:
```json
{
  "success": true,
  "message": "Connection Request enviado. La ONU debería contactar al ACS en breve.",
  "data": {
    "task_id": "cr-12345",
    "status": "pending"
  }
}
```

### 3. Obtener Parámetros TR-069
```
GET /api/onus/:onuId/tr069-parameters
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "parameters": {
      "InternetGatewayDevice.DeviceInfo.SoftwareVersion": "V5.0.10P6T38",
      "InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.ExternalIPAddress": "10.0.5.123",
      "InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID": "MiWiFi_2024"
    },
    "last_updated": "2025-11-20T14:30:00Z"
  }
}
```

---

## Casos de Prueba

### Test 1: Autorización Completa (OLT + TR-069)
```bash
curl -X POST https://wellnet-rd.com:444/api/olts/realtime/olt-001/onus/48575443ABCD1234/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "pon_type": "GPON",
    "board": "1",
    "port": "5",
    "sn": "48575443ABCD1234",
    "onu_type": "HG8546M",
    "custom_profile": false,
    "mode": "Routing",
    "user_vlan": "100",
    "download_speed": "100M",
    "upload_speed": "50M",
    "zone": "30 de Mayo",
    "name": "Juan Perez - Plan 100M",
    "address": "Calle 5 #123",
    "odb": "ODB-15",
    "odb_port": "3",
    "external_id": "48575443ABCD1234",
    "use_gps": false
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "message": "ONU autorizada y registrada en TR-069",
  "data": {
    "onu_id": 12345,
    "serial": "48575443ABCD1234",
    "estado": "online",
    "tr069_registered": true,
    "tr069_status": "pending_inform"
  }
}
```

### Test 2: Verificar Estado TR-069
```bash
curl -X GET https://wellnet-rd.com:444/api/onus/12345/tr069-status \
  -H "Authorization: Bearer {token}"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "registered": true,
    "status": "online",
    "last_inform": "2025-11-20T14:35:00Z"
  }
}
```

---

## Consideraciones Técnicas

### 1. Orden de Operaciones

**Opción A: OLT primero, luego TR-069 (Recomendado)**
```
1. Autorizar en OLT física
2. Si éxito → Registrar en ACS
3. Si ambos OK → Guardar en BD con tr069_registered = true
4. Si falla ACS → Guardar en BD con tr069_registered = false y loguear error
```

**Ventajas:**
- La ONU funciona incluso si falla TR-069
- Servicio de Internet inmediato
- TR-069 es "best effort"

**Opción B: TR-069 primero, luego OLT**
```
1. Registrar en ACS
2. Si éxito → Autorizar en OLT
3. Si ambos OK → Guardar en BD
```

**Ventajas:**
- TR-069 está listo cuando la ONU se conecte
- Mejor para gestión centralizada

**Desventajas:**
- Si falla OLT, la ONU no funciona aunque esté en TR-069

### 2. Manejo de Errores

- **Falla OLT pero éxito TR-069:** Retornar error pero marcar que TR-069 está OK
- **Éxito OLT pero falla TR-069:** Retornar éxito parcial, la ONU funciona pero sin gestión TR-069
- **Ambos fallan:** Retornar error completo

### 3. Logs y Auditoría

```sql
-- Tabla de eventos TR-069
CREATE TABLE onu_tr069_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  onu_id BIGINT NOT NULL,
  event_type VARCHAR(50),  -- 'register', 'inform', 'parameter_change', 'connection_request'
  event_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_onu_id (onu_id),
  INDEX idx_event_type (event_type)
);
```

### 4. Timeout

- Autorización en OLT: 90 segundos
- Registro en TR-069: 30 segundos
- Total: 120 segundos máximo

### 5. Seguridad

- No exponer credenciales del ACS en logs
- Validar que el usuario tenga permisos de técnico o superior
- Sanitizar inputs para evitar inyección de comandos

---

## Próximos Pasos

1. **Backend Team:**
   - [ ] Confirmar qué servidor TR-069/ACS están usando
   - [ ] Proveer URL y credenciales del ACS
   - [ ] Implementar endpoint `/api/olts/realtime/:oltId/onus/:serial/authorize`
   - [ ] Agregar integración con servidor TR-069
   - [ ] Agregar columnas TR-069 a tabla `onus`
   - [ ] Implementar endpoints de verificación TR-069 (opcional)

2. **Frontend Team:**
   - [x] Pantalla de autorización lista y esperando endpoint real
   - [ ] Actualizar `AutorizarONUScreen.tsx` cuando endpoint esté disponible
   - [ ] Mostrar estado TR-069 en pantalla de detalles ONU

3. **Testing:**
   - [ ] Probar autorización con ONU real
   - [ ] Verificar que aparezca en el servidor TR-069
   - [ ] Confirmar que se puede gestionar vía TR-069

---

## Documentación de Referencia

- Archivo frontend: `src/pantallas/controles/OLTs/AutorizarONUScreen.tsx`
- API Services: `src/pantallas/controles/OLTs/services/api.ts`
- Documentación TR-069 existente: `PROMPT_BACKEND_AUTORIZACION_ONU_TR069.md`

---

## Preguntas para el Backend

Para implementar correctamente esta integración, necesitamos que respondan:

1. **¿Qué servidor TR-069/ACS están usando?** (GenieACS, FreeACS, otro)
2. **¿Cuál es la URL del servidor ACS?** (ejemplo: `http://localhost:7547`)
3. **¿El ACS tiene API REST?** Si sí, ¿dónde está la documentación?
4. **¿Cómo se registra actualmente un dispositivo en el ACS?** (manual, script, otro)
5. **¿Hay credenciales/API keys para acceder al ACS?**

---

**¡Implementar esta integración permitirá gestión remota completa de las ONUs vía TR-069!** 🚀
