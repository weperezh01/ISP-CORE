# BACKEND: Agregar Asociación TR-069 al Endpoint de Autorización

## Situación Actual

✅ **LO QUE YA FUNCIONA:**
- Endpoint: `POST /api/olts/realtime/:oltId/onus/:serial/authorize`
- La ONU se autoriza correctamente en la OLT física (Huawei/ZTE)
- Se guarda la información en la base de datos
- El frontend está enviando todos los datos necesarios

❌ **LO QUE FALTA:**
- Cuando se autoriza una ONU, **NO se está asociando automáticamente con el servidor TR-069**
- Tienen un servidor TR-069 corriendo en el backend, pero no se integra con la autorización

---

## Lo Que Necesitan Hacer

**Modificar el endpoint existente** `POST /api/olts/realtime/:oltId/onus/:serial/authorize` para que ADEMÁS de autorizar en la OLT, también:

1. Registre/asocie la ONU en su servidor TR-069
2. Guarde el estado de la asociación TR-069 en la base de datos
3. Retorne en la respuesta si la asociación TR-069 fue exitosa

---

## Flujo Actual vs Flujo Necesario

### Flujo Actual (lo que ya tienen)
```
1. Frontend envía request a /api/olts/realtime/:oltId/onus/:serial/authorize
2. Backend conecta a la OLT via SSH
3. Backend ejecuta comandos para autorizar la ONU en la OLT
4. Backend guarda información en tabla `onus` de la BD
5. Backend retorna success al frontend
```

### Flujo Necesario (lo que falta agregar)
```
1. Frontend envía request a /api/olts/realtime/:oltId/onus/:serial/authorize
2. Backend conecta a la OLT via SSH
3. Backend ejecuta comandos para autorizar la ONU en la OLT
4. ⭐ NUEVO: Backend registra la ONU en el servidor TR-069
5. Backend guarda información en tabla `onus` de la BD (incluyendo estado TR-069)
6. Backend retorna success al frontend (incluyendo info de TR-069)
```

---

## Código Que Deben Agregar

Dentro de la función del endpoint `/api/olts/realtime/:oltId/onus/:serial/authorize`, después de autorizar en la OLT, agregar:

### Paso 1: Registrar en Servidor TR-069

```javascript
// Después de autorizar exitosamente en la OLT...

// ==================== REGISTRAR EN TR-069 ====================
try {
    console.log('🔄 [TR-069] Registrando ONU en servidor ACS...');

    // Configuración del servidor TR-069 (ajustar según su implementación)
    const acsUrl = process.env.ACS_URL || 'http://localhost:7547';
    const acsApiKey = process.env.ACS_API_KEY || '';

    // Datos para registrar en TR-069
    const tr069Payload = {
        // Identificación del dispositivo
        serialNumber: serial,
        deviceId: serial,
        productClass: onu_type || 'ONU',
        manufacturer: detectManufacturer(serial), // "Huawei", "ZTE", etc.

        // URL de Connection Request (para que el ACS pueda contactar la ONU)
        connectionRequestUrl: `http://${managementIp}:7547/`,
        connectionRequestUsername: 'admin',
        connectionRequestPassword: 'admin',

        // Tags para organización en el ACS
        tags: [
            'authorized',
            `olt_${oltId}`,
            `zone_${zona_nombre}`,
            `vlan_${user_vlan_id}`,
            `speed_${download_speed}`
        ],

        // Metadata personalizada
        customParameters: {
            // Información de red
            oltId: oltId,
            puerto: puerto,
            ontId: ont_id,
            userVlan: user_vlan_id,

            // Información del cliente
            clientName: name,
            zone: zona_nombre,
            odbSplitter: odb_splitter,
            odbPort: odb_port,

            // Velocidades
            downloadSpeed: download_speed,
            uploadSpeed: upload_speed,
            downloadMbps: download_mbps,
            uploadMbps: upload_mbps,

            // Fechas
            authorizationDate: new Date().toISOString(),
            authorizedBy: req.user.id // Usuario que autorizó
        }
    };

    // Llamar al API del servidor TR-069
    // IMPORTANTE: Ajustar según el servidor TR-069 que estén usando

    // Opción A: Si usan GenieACS
    const acsResponse = await fetch(`${acsUrl}/devices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': acsApiKey
        },
        body: JSON.stringify(tr069Payload)
    });

    // Opción B: Si usan FreeACS u otro servidor
    // const acsResponse = await registerDeviceInACS(serial, tr069Payload);

    if (acsResponse.ok) {
        console.log('✅ [TR-069] ONU registrada exitosamente en ACS');
        tr069Registered = true;
        tr069Status = 'registered';
        tr069Message = 'Dispositivo registrado en ACS. Esperando primer INFORM.';
    } else {
        console.error('⚠️ [TR-069] Error al registrar en ACS:', await acsResponse.text());
        tr069Registered = false;
        tr069Status = 'error';
        tr069Message = 'No se pudo registrar en el servidor TR-069';
    }

} catch (tr069Error) {
    console.error('❌ [TR-069] Excepción al registrar en ACS:', tr069Error);
    tr069Registered = false;
    tr069Status = 'error';
    tr069Message = tr069Error.message;
}
```

### Paso 2: Guardar Estado TR-069 en Base de Datos

```sql
-- Modificar el INSERT a la tabla onus para incluir información TR-069

INSERT INTO onus (
  -- ... campos existentes ...
  olt_id,
  serial,
  puerto,
  ont_id,
  onu_type,
  user_vlan_id,
  download_speed,
  upload_speed,
  zona,
  name,
  estado,
  fecha_autorizacion,

  -- ⭐ NUEVOS CAMPOS TR-069
  tr069_registered,
  tr069_acs_url,
  tr069_connection_status,
  tr069_error_message,
  tr069_device_id

) VALUES (
  -- ... valores existentes ...
  :oltId,
  :serial,
  :puerto,
  :ont_id,
  :onu_type,
  :user_vlan_id,
  :download_speed,
  :upload_speed,
  :zona,
  :name,
  'online',
  NOW(),

  -- ⭐ VALORES TR-069
  :tr069Registered,          -- true/false
  :acsUrl,                   -- 'http://localhost:7547'
  :tr069Status,              -- 'registered', 'error', 'pending_inform'
  :tr069Message,             -- Mensaje de error si aplica
  :serial                    -- deviceId en el ACS
);
```

### Paso 3: Retornar Info TR-069 en la Respuesta

```javascript
// Modificar la respuesta del endpoint para incluir información TR-069

return res.status(200).json({
    success: true,
    message: tr069Registered
        ? 'ONU autorizada y registrada en TR-069'
        : 'ONU autorizada (TR-069 no disponible)',
    data: {
        onu_id: newOnuId,
        serial: serial,
        puerto: puerto,
        ont_id: ont_id,
        estado: 'online',
        fecha_autorizacion: new Date().toISOString(),

        // ⭐ INFORMACIÓN TR-069
        tr069: {
            registered: tr069Registered,
            status: tr069Status,
            message: tr069Message,
            acs_url: tr069Registered ? acsUrl : null
        }
    }
});
```

---

## Cambios en Base de Datos

### Agregar Columnas TR-069 a la Tabla `onus`

```sql
ALTER TABLE onus
ADD COLUMN tr069_registered BOOLEAN DEFAULT FALSE COMMENT 'Si está registrado en el servidor TR-069',
ADD COLUMN tr069_acs_url VARCHAR(255) COMMENT 'URL del servidor TR-069/ACS',
ADD COLUMN tr069_connection_status VARCHAR(50) COMMENT 'Estado: registered, pending_inform, online, offline, error',
ADD COLUMN tr069_last_inform TIMESTAMP NULL COMMENT 'Última vez que la ONU contactó al ACS',
ADD COLUMN tr069_device_id VARCHAR(100) COMMENT 'ID del dispositivo en el ACS (normalmente el serial)',
ADD COLUMN tr069_error_message TEXT COMMENT 'Mensaje de error si falló el registro';

-- Índices para optimizar consultas
CREATE INDEX idx_tr069_registered ON onus(tr069_registered);
CREATE INDEX idx_tr069_status ON onus(tr069_connection_status);
CREATE INDEX idx_tr069_last_inform ON onus(tr069_last_inform);
```

---

## Información Que Necesitamos

Para implementar esto correctamente, necesitamos que nos respondan:

### 1. ¿Qué servidor TR-069/ACS están usando?
- [ ] GenieACS
- [ ] FreeACS
- [ ] Otro (especificar): _________________

### 2. ¿Cuál es la URL del servidor TR-069?
```
Ejemplo: http://localhost:7547
         http://wellnet-rd.com:7547
         http://192.168.1.100:7547

URL actual: _________________
```

### 3. ¿El servidor TR-069 tiene API REST?
- [ ] Sí (¿cuál es la documentación?)
- [ ] No (¿cómo se registran dispositivos actualmente?)

### 4. ¿Hay credenciales/API keys para acceder al servidor TR-069?
```
Usuario API: _________________
Password/API Key: _________________
```

### 5. ¿Cómo se registran dispositivos actualmente en el TR-069?
- [ ] Manualmente desde la interfaz web
- [ ] Con un script
- [ ] Automáticamente cuando la ONU hace INFORM
- [ ] Otro: _________________

### 6. ¿El servidor TR-069 está en el mismo servidor que el backend?
- [ ] Sí, localhost
- [ ] No, servidor separado (IP: _________)

---

## Ejemplo de Respuesta Exitosa

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
    "fecha_autorizacion": "2025-11-20T15:30:00Z",

    "tr069": {
      "registered": true,
      "status": "registered",
      "message": "Dispositivo registrado en ACS. Esperando primer INFORM.",
      "acs_url": "http://localhost:7547"
    }
  }
}
```

## Ejemplo de Respuesta con Error en TR-069 (pero ONU autorizada)

```json
{
  "success": true,
  "message": "ONU autorizada (TR-069 no disponible)",
  "data": {
    "onu_id": 12345,
    "serial": "48575443ABCD1234",
    "puerto": "0/1/5",
    "ont_id": 10,
    "estado": "online",
    "fecha_autorizacion": "2025-11-20T15:30:00Z",

    "tr069": {
      "registered": false,
      "status": "error",
      "message": "No se pudo conectar con el servidor ACS",
      "acs_url": null
    }
  }
}
```

---

## Manejo de Errores

### Estrategia Recomendada: "Best Effort"

```javascript
// La autorización en la OLT es CRÍTICA
// La asociación TR-069 es OPCIONAL (best effort)

try {
    // 1. Autorizar en OLT (CRÍTICO)
    await authorizeOnuInOlt(oltId, serial, payload);

    // 2. Intentar registrar en TR-069 (OPCIONAL)
    try {
        await registerInTr069(serial, payload);
        tr069Registered = true;
    } catch (tr069Error) {
        // No fallar la operación completa si TR-069 falla
        console.error('TR-069 registration failed, but ONU is authorized:', tr069Error);
        tr069Registered = false;
    }

    // 3. Guardar en BD (con estado TR-069)
    await saveOnuToDatabase(payload, tr069Registered);

    // 4. Retornar éxito (aunque TR-069 haya fallado)
    return success;

} catch (oltError) {
    // Si falla la autorización en OLT, sí retornar error
    return error;
}
```

**Ventajas de este enfoque:**
- La ONU funciona y da servicio de Internet aunque TR-069 falle
- No se bloquea la operación si el servidor TR-069 está caído
- Se puede corregir manualmente después si es necesario
- Se registra el intento para auditoría

---

## Función Helper: Detectar Fabricante

```javascript
/**
 * Detectar fabricante basado en el serial number
 */
function detectManufacturer(serial) {
    if (!serial) return 'Unknown';

    const prefix = serial.substring(0, 4).toUpperCase();

    const manufacturers = {
        'HWTC': 'Huawei',
        'ZTEG': 'ZTE',
        'ALCL': 'Nokia/Alcatel-Lucent',
        'CXNK': 'CIG',
        'FHTT': 'FiberHome',
        'GPON': 'Generic'
    };

    return manufacturers[prefix] || 'Unknown';
}
```

---

## Testing

### Test 1: Verificar que la ONU se autorizó y se registró en TR-069

**Endpoint:**
```bash
curl -X POST https://wellnet-rd.com:444/api/olts/realtime/olt-001/onus/48575443ABCD1234/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "puerto": "0/1/5",
    "ont_id": 10,
    "onu_type": "HG8546M",
    "user_vlan_id": 100,
    "download_speed": "100M",
    "upload_speed": "50M",
    "zona_nombre": "30 de Mayo",
    "name": "Cliente Test"
  }'
```

**Verificar en el servidor TR-069:**
1. Ingresar a la interfaz web del servidor TR-069
2. Buscar el dispositivo con serial `48575443ABCD1234`
3. Verificar que aparezca en la lista de dispositivos
4. Verificar que tenga los tags correctos
5. Verificar que tenga la metadata (zona, VLAN, etc.)

**Verificar en la base de datos:**
```sql
SELECT
    serial,
    estado,
    tr069_registered,
    tr069_connection_status,
    tr069_acs_url,
    fecha_autorizacion
FROM onus
WHERE serial = '48575443ABCD1234';
```

Debe retornar:
```
serial: 48575443ABCD1234
estado: online
tr069_registered: 1
tr069_connection_status: registered
tr069_acs_url: http://localhost:7547
fecha_autorizacion: 2025-11-20 15:30:00
```

### Test 2: Verificar comportamiento si TR-069 falla

1. Detener el servidor TR-069 temporalmente
2. Autorizar una ONU
3. Verificar que:
   - La ONU SÍ se autorizó en la OLT
   - La ONU SÍ se guardó en la base de datos
   - `tr069_registered` = FALSE
   - `tr069_connection_status` = 'error'
   - La respuesta indica el error pero success = true

---

## Logs Recomendados

Agregar logs claros para debugging:

```javascript
console.log('🔄 [Authorization] Iniciando autorización de ONU...');
console.log('📡 [OLT] Conectando a OLT:', oltId);
console.log('✅ [OLT] ONU autorizada exitosamente en la OLT');
console.log('🔄 [TR-069] Intentando registrar en servidor ACS...');
console.log('✅ [TR-069] ONU registrada exitosamente en ACS');
console.log('⚠️ [TR-069] Error al registrar en ACS:', error.message);
console.log('💾 [DB] Guardando información en base de datos...');
console.log('✅ [Authorization] Proceso completado exitosamente');
```

---

## Resumen

**MODIFICAR:** Endpoint existente `POST /api/olts/realtime/:oltId/onus/:serial/authorize`

**AGREGAR:**
1. Llamada al servidor TR-069 para registrar la ONU
2. Columnas TR-069 en la tabla `onus`
3. Información TR-069 en la respuesta del endpoint

**RESULTADO:**
- Cuando se autorice una ONU, automáticamente se registrará en el servidor TR-069
- Si TR-069 falla, la ONU igual se autoriza (best effort)
- El frontend verá el estado de TR-069 en la respuesta

---

## Próximos Pasos

1. **Responder las preguntas de la sección "Información Que Necesitamos"**
2. Agregar las columnas TR-069 a la tabla `onus`
3. Modificar el endpoint de autorización con el código proporcionado
4. Probar con una ONU real
5. Verificar que aparezca en el servidor TR-069
6. Confirmar que funciona correctamente

---

¿Tienen alguna pregunta sobre la implementación? 🚀
