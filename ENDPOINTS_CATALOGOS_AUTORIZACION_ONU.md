# 📋 Endpoints de Catálogos para Autorización de ONU

## 📌 Contexto

El formulario de autorización de ONU en el frontend **NO** obtiene datos directamente de la OLT.
Todos los desplegables (selects) se alimentan desde la **base de datos** a través de estos endpoints.

El frontend ya está implementado y consume estos endpoints.
**Tu trabajo:** Implementar estos 6 endpoints en el backend.

---

## ⚠️ IMPORTANTE: Arquitectura de Datos

### 🗄️ Todos los Catálogos DEBEN estar en Base de Datos

**CRÍTICO:** Ningún catálogo debe estar hardcodeado en el código del backend.

**Razones:**
1. **Administración por Usuario**: En el futuro, se implementará una interfaz de administración donde el usuario podrá:
   - Agregar nuevos tipos de ONU
   - Crear nuevos perfiles de velocidad
   - Configurar VLANs personalizadas
   - Gestionar ODB Splitters y sus puertos
   - Asignar catálogos específicos por ISP o por OLT

2. **Multi-ISP**: Cada ISP puede tener:
   - Sus propias VLANs
   - Sus propios perfiles de velocidad/precio
   - Sus propios tipos de ONU compatibles

3. **Multi-OLT**: Cada OLT puede soportar:
   - Diferentes tipos de ONU según su marca (Huawei vs ZTE)
   - Diferentes configuraciones de puerto

### 📊 Filtros Requeridos

Todos los catálogos deben soportar filtrado por:
- ✅ **`isp_id`**: Para mostrar solo datos del ISP del usuario
- ✅ **`olt_id`** (cuando aplique): Para mostrar solo datos compatibles con ese OLT

### 🚫 NO Hacer

```javascript
// ❌ INCORRECTO: Datos hardcodeados
const ONU_TYPES = [
  { value: 'HG8546M', label: 'Huawei HG8546M' },
  { value: 'F660', label: 'ZTE F660' }
];
```

### ✅ Hacer

```javascript
// ✅ CORRECTO: Consultar base de datos
const onuTypes = await db.query(
  "SELECT * FROM onu_types WHERE olt_id = ? OR is_global = TRUE",
  [olt_id]
);
```

---

## 🔗 Endpoints Requeridos

### 1️⃣ GET `/api/catalogs/vlans`

**Descripción:** Retorna lista de VLANs disponibles para configurar ONUs

**Query Parameters:**
- `isp_id` (opcional): Filtrar por ISP

**Tabla BD:** `router_vlans`

**Query SQL:**
```sql
SELECT
  vlan_id,
  name,
  comment
FROM router_vlans
WHERE id_isp = ? OR ? IS NULL
ORDER BY vlan_id;
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "vlan_id": 10,
      "name": "vlan104",
      "comment": "",
      "display": "VLAN 10 (vlan104)"
    },
    {
      "vlan_id": 100,
      "name": "vlan-clientes",
      "comment": "Clientes residenciales",
      "display": "VLAN 100 (vlan-clientes) - Clientes residenciales"
    }
  ]
}
```

**Notas:**
- El campo `display` es calculado: combina vlan_id, name y comment
- Si no hay comment, solo mostrar "VLAN {id} ({name})"

---

### 2️⃣ GET `/api/catalogs/zones`

**Descripción:** Retorna lista de zonas geográficas (barrios y parajes)

**Query Parameters:**
- `search` (opcional): Filtrar por nombre parcial

**Tabla BD:** `one_parajes` ⚠️ **IMPORTANTE: Esta tabla contiene los barrios y parajes**

**Query SQL:**
```sql
SELECT id, nombre
FROM one_parajes
WHERE nombre LIKE CONCAT('%', ?, '%') OR ? IS NULL
ORDER BY nombre
LIMIT 100;
```

**⚠️ IMPORTANTE - Formato del ID:**
- El campo `id` debe retornar SOLO el número (ej: `281`, `211`, `635`)
- **NO incluir prefijos** como "P281", "B211", etc.
- El frontend necesita IDs numéricos limpios para el endpoint de autorización

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 281,           // ✅ CORRECTO: Solo número
      "nombre": "30 de Mayo"
    },
    {
      "id": 211,           // ✅ CORRECTO: Solo número
      "nombre": "Agua Fría"
    },
    {
      "id": 635,           // ✅ CORRECTO: Solo número
      "nombre": "Villa Mella"
    }
  ],
  "total": 802
}
```

**❌ Respuesta INCORRECTA (NO hacer):**
```json
{
  "data": [
    {
      "id": "P281",      // ❌ INCORRECTO: Incluye prefijo
      "nombre": "30 de Mayo"
    }
  ]
}
```

**Notas:**
- ⚠️ **CRÍTICO**: Esta tabla almacena tanto **barrios como parajes** (zonas geográficas)
- Limitar a 100 resultados para evitar listas gigantes
- Si se usa search, solo retornar coincidencias
- El frontend muestra esto en el dropdown "Zone (Zona)" de la sección "Ubicación del Cliente"
- El ID debe ser numérico sin prefijos para el endpoint de autorización

---

### 3️⃣ GET `/api/catalogs/odbs`

**Descripción:** Retorna lista de ODB Splitters

**Query Parameters:**
- `isp_id` (opcional): Filtrar por ISP
- `zone_id` (opcional): Filtrar por zona
- `olt_id` (opcional): Filtrar por OLT

**Tabla BD:** `odb_splitters` ⚠️ **DEBE CREARSE**

**Schema SQL:**
```sql
CREATE TABLE odb_splitters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,           -- Ej: "ODB-01", "ODB-15"
  name VARCHAR(100),                    -- Nombre descriptivo
  isp_id INT,                           -- ISP propietario
  olt_id INT,                           -- OLT asociado (opcional)
  zone_id INT,                          -- Zona geográfica
  capacity INT DEFAULT 16,              -- Capacidad de puertos (8, 16, 32)
  latitude DECIMAL(10,8),               -- GPS
  longitude DECIMAL(11,8),              -- GPS
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (isp_id) REFERENCES isp(id),
  FOREIGN KEY (olt_id) REFERENCES olts(id),
  FOREIGN KEY (zone_id) REFERENCES one_parajes(id),

  UNIQUE KEY unique_code_per_isp (code, isp_id)
);

-- Índices para mejorar performance
CREATE INDEX idx_odb_isp ON odb_splitters(isp_id);
CREATE INDEX idx_odb_zone ON odb_splitters(zone_id);
CREATE INDEX idx_odb_olt ON odb_splitters(olt_id);
```

**Query SQL:**
```sql
SELECT
  id,
  code,
  name,
  capacity,
  zone_id,
  latitude,
  longitude
FROM odb_splitters
WHERE
  status = 'active'
  AND (isp_id = ? OR ? IS NULL)
  AND (zone_id = ? OR ? IS NULL)
  AND (olt_id = ? OR ? IS NULL OR olt_id IS NULL)
ORDER BY code;
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ODB-01",
      "name": "ODB Principal - 30 de Mayo",
      "capacity": 16,
      "zone_id": 281,
      "latitude": 18.4861,
      "longitude": -69.9312
    },
    {
      "id": 15,
      "code": "ODB-15",
      "name": "ODB Secundario - Agua Fría",
      "capacity": 8,
      "zone_id": 211,
      "latitude": null,
      "longitude": null
    }
  ]
}
```

**Datos Iniciales (Seed):**
```sql
-- Insertar ODBs de ejemplo para testing
INSERT INTO odb_splitters (code, name, isp_id, zone_id, capacity) VALUES
('ODB-01', 'ODB Principal', 1, 281, 16),
('ODB-02', 'ODB Secundario', 1, 281, 16),
('ODB-15', 'ODB Agua Fría', 1, 211, 8),
('ODB-25', 'ODB Villa Mella', 1, 635, 16);
```

**Notas:**
- ⚠️ Esta tabla **DEBE** crearse en la base de datos
- El usuario podrá agregar/editar ODBs desde la interfaz de administración (futuro)
- Cada ISP puede tener sus propios códigos de ODB
- `olt_id` puede ser NULL si el ODB es compartido entre varios OLTs

---

### 4️⃣ GET `/api/catalogs/odb-ports`

**Descripción:** Retorna puertos disponibles para un ODB Splitter

**Query Parameters:**
- `odb_id` (opcional): ID del ODB Splitter
- `capacity` (opcional, default: 16): Capacidad del splitter

**Lógica:**
1. Si se provee `odb_id`, buscar su capacidad en la tabla (futuro)
2. Usar `capacity` para generar array de puertos
3. Retornar puertos del 1 al `capacity`

**Response Example:**
```json
{
  "success": true,
  "data": [
    { "value": "1", "label": "Puerto 1" },
    { "value": "2", "label": "Puerto 2" },
    { "value": "3", "label": "Puerto 3" },
    ...
    { "value": "16", "label": "Puerto 16" }
  ]
}
```

**Implementación Simple:**
```javascript
const capacity = parseInt(req.query.capacity) || 16;
const ports = Array.from({ length: capacity }, (_, i) => ({
  value: String(i + 1),
  label: `Puerto ${i + 1}`
}));

res.json({ success: true, data: ports });
```

---

### 5️⃣ GET `/api/catalogs/speed-profiles`

**Descripción:** Retorna perfiles de velocidad disponibles

**Query Parameters:**
- `isp_id` (opcional): Filtrar por ISP

**Tabla BD:** `TipoServicio`

**Query SQL:**
```sql
SELECT
  id_servicio as id,
  nombre_servicio as name,
  velocidad_servicio as download_mbps,
  precio_servicio as price
FROM TipoServicio
WHERE id_isp = ? OR ? IS NULL
  AND velocidad_servicio IS NOT NULL
ORDER BY velocidad_servicio;
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 13,
      "name": "Internet 10 Mbps",
      "download_mbps": 10,
      "upload_mbps": 10,
      "download_speed": "10M",
      "upload_speed": "10M",
      "price": 1000.00
    },
    {
      "id": 16,
      "name": "Internet 20M",
      "download_mbps": 20,
      "upload_mbps": 20,
      "download_speed": "20M",
      "upload_speed": "20M",
      "price": 1100.00
    },
    {
      "id": 12,
      "name": "Internet 30 Mbps",
      "download_mbps": 30,
      "upload_mbps": 30,
      "download_speed": "30M",
      "upload_speed": "30M",
      "price": 1300.00
    },
    {
      "id": 3,
      "name": "Internet 100 Mbps",
      "download_mbps": 100,
      "upload_mbps": 100,
      "download_speed": "100M",
      "upload_speed": "100M",
      "price": 1500.00
    },
    {
      "id": 25,
      "name": "Internet 1G",
      "download_mbps": 1000,
      "upload_mbps": 1000,
      "download_speed": "1G",
      "upload_speed": "1G",
      "price": 3000.00
    }
  ]
}
```

**Conversión de Velocidad:**
```javascript
function convertSpeed(mbps) {
  if (mbps >= 1000) {
    return `${mbps / 1000}G`;
  }
  return `${mbps}M`;
}

// Aplicar a cada perfil:
{
  ...profile,
  download_speed: convertSpeed(profile.download_mbps),
  upload_speed: convertSpeed(profile.download_mbps), // Simétrico
}
```

---

### 6️⃣ GET `/api/olts/:oltId/onu-types`

**Descripción:** Retorna tipos de ONU soportados por el OLT

**URL Parameters:**
- `oltId` (required): ID del OLT

**Query Parameters:**
- `isp_id` (opcional): Filtrar por ISP

**Tabla BD:** `onu_types` ⚠️ **DEBE CREARSE**

**Schema SQL:**
```sql
CREATE TABLE onu_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,                    -- Código técnico: "HG8546M", "F660"
  label VARCHAR(100) NOT NULL,                  -- Nombre para mostrar: "Huawei HG8546M"
  vendor ENUM('HUAWEI', 'ZTE', 'NOKIA', 'FIBERHOME', 'OTHER') NOT NULL,
  isp_id INT,                                   -- ISP propietario (NULL = global)
  is_global BOOLEAN DEFAULT FALSE,              -- Si es TRUE, disponible para todos los ISPs
  olt_vendor_compatibility JSON,                -- ["HUAWEI", "ZTE"] - OLTs compatibles
  ports INT DEFAULT 1,                          -- Número de puertos ethernet
  has_wifi BOOLEAN DEFAULT FALSE,               -- Tiene WiFi
  has_voip BOOLEAN DEFAULT FALSE,               -- Tiene puertos de voz
  status ENUM('active', 'inactive') DEFAULT 'active',
  notes TEXT,                                   -- Notas adicionales
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (isp_id) REFERENCES isp(id),

  UNIQUE KEY unique_code_per_isp (code, isp_id)
);

-- Índices
CREATE INDEX idx_onu_types_isp ON onu_types(isp_id);
CREATE INDEX idx_onu_types_vendor ON onu_types(vendor);
```

**Query SQL:**
```sql
-- Obtener vendor del OLT
SELECT olt_type, isp_id FROM olts WHERE id = ?;

-- Consultar tipos compatibles
SELECT
  code AS value,
  label,
  vendor,
  olt_vendor_compatibility AS compatible_with,
  ports,
  has_wifi,
  has_voip
FROM onu_types
WHERE
  status = 'active'
  AND (
    is_global = TRUE
    OR isp_id = ?
  )
  AND (
    -- Compatible con el vendor del OLT
    JSON_CONTAINS(olt_vendor_compatibility, JSON_QUOTE(?))
    OR olt_vendor_compatibility IS NULL
  )
ORDER BY vendor, label;
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "value": "HG8546M",
      "label": "Huawei HG8546M",
      "vendor": "HUAWEI",
      "compatible_with": ["HUAWEI", "ZTE"],
      "ports": 4,
      "has_wifi": true,
      "has_voip": false
    },
    {
      "value": "HG8310M",
      "label": "Huawei HG8310M",
      "vendor": "HUAWEI",
      "compatible_with": ["HUAWEI"],
      "ports": 1,
      "has_wifi": false,
      "has_voip": false
    },
    {
      "value": "F660",
      "label": "ZTE F660",
      "vendor": "ZTE",
      "compatible_with": ["ZTE"],
      "ports": 4,
      "has_wifi": true,
      "has_voip": true
    },
    {
      "value": "COMCAST1",
      "label": "COMCAST1 (Genérico)",
      "vendor": "OTHER",
      "compatible_with": ["HUAWEI", "ZTE"],
      "ports": 1,
      "has_wifi": false,
      "has_voip": false
    }
  ]
}
```

**Datos Iniciales (Seed):**
```sql
-- Insertar tipos de ONU globales (is_global = TRUE)
INSERT INTO onu_types (code, label, vendor, is_global, olt_vendor_compatibility, ports, has_wifi, has_voip) VALUES
-- Huawei ONUs
('HG8546M', 'Huawei HG8546M', 'HUAWEI', TRUE, '["HUAWEI"]', 4, true, false),
('HG8310M', 'Huawei HG8310M', 'HUAWEI', TRUE, '["HUAWEI"]', 1, false, false),
('HG8245H', 'Huawei HG8245H', 'HUAWEI', TRUE, '["HUAWEI"]', 4, true, true),
('HS8145V', 'Huawei HS8145V', 'HUAWEI', TRUE, '["HUAWEI"]', 4, true, true),

-- ZTE ONUs
('F660', 'ZTE F660', 'ZTE', TRUE, '["ZTE"]', 4, true, true),
('F601', 'ZTE F601', 'ZTE', TRUE, '["ZTE"]', 1, false, false),
('F670L', 'ZTE F670L', 'ZTE', TRUE, '["ZTE"]', 4, true, true),

-- Genéricos
('COMCAST1', 'COMCAST1 (Genérico)', 'OTHER', TRUE, '["HUAWEI", "ZTE"]', 1, false, false);
```

**Notas:**
- ⚠️ Esta tabla **DEBE** crearse en la base de datos
- `is_global = TRUE`: Disponible para todos los ISPs
- `is_global = FALSE`: Solo para el ISP específico (permite ONUs personalizados)
- `olt_vendor_compatibility`: JSON array con vendors compatibles (HUAWEI, ZTE, etc.)
- El usuario podrá agregar tipos de ONU personalizados desde la interfaz de administración (futuro)

---

## 🔄 Dependencias entre Campos

| Campo           | Depende de              | Comportamiento                                      |
|-----------------|-------------------------|-----------------------------------------------------|
| VLAN            | ISP                     | Filtrar por `isp_id` del usuario                    |
| Zone            | Ninguno                 | Lista completa (con search opcional)                |
| ODB Splitter    | Zone (opcional)         | Filtrar por zona si se implementa tabla             |
| ODB Port        | ODB Splitter            | Generar puertos 1-N según capacidad del splitter    |
| Upload Speed    | Download Speed          | Auto-llenado simétrico (igual que download)         |
| ONU Type        | Marca del OLT           | Filtrar por tipos compatibles con Huawei o ZTE      |

---

## ✅ Casos de Uso del Frontend

### Carga Inicial del Formulario:
1. Usuario abre modal de autorización
2. Frontend llama a TODOS los endpoints de catálogos en paralelo:
   ```javascript
   const [vlans, zones, odbs, speeds, onuTypes] = await Promise.all([
     getVlansCatalog(token, ispId),
     getZonesCatalog(token),
     getOdbsCatalog(token),
     getSpeedProfilesCatalog(token, ispId),
     getOnuTypesCatalog(oltId, token)
   ]);
   ```
3. Puebla los desplegables con los datos recibidos

### Cambio de ODB Splitter:
1. Usuario selecciona un ODB Splitter (ej: "ODB-15")
2. Frontend llama a `getOdbPortsCatalog(token, "ODB-15", 16)`
3. Puebla el desplegable de puertos con la respuesta

### Cambio de Download Speed:
1. Usuario selecciona velocidad de bajada (ej: "100M")
2. Frontend auto-llena Upload Speed con el mismo valor
3. Usuario puede editarlo si quiere asimétrico

---

## 🚫 Errores Comunes a Evitar

### ❌ NO Hacer:
```javascript
// ❌ NO consultar la OLT desde estos endpoints
ssh.connect(olt_ip, ...)
```

### ✅ Hacer:
```javascript
// ✅ Consultar solo la base de datos
db.query("SELECT vlan_id, name FROM router_vlans WHERE id_isp = ?", [isp_id])
```

---

## 🔐 Seguridad

Todos los endpoints deben:
1. ✅ Validar el token JWT
2. ✅ Verificar permisos del usuario (rol técnico o superior)
3. ✅ Filtrar resultados por ISP del usuario (no mostrar datos de otros ISPs)
4. ✅ Sanitizar parámetros de búsqueda (evitar SQL injection)

---

## ⚡ Performance

### Recomendaciones:
1. **Cache de catálogos:** 5 minutos
   - VLANs, Zones, ODB Splitters raramente cambian
   - Speed Profiles casi nunca cambian

2. **Límite de resultados:**
   - Zones: máximo 100 con search
   - VLANs: sin límite (usualmente < 50)
   - ODB Splitters: sin límite (< 100)

3. **Índices de BD:**
   ```sql
   CREATE INDEX idx_router_vlans_isp ON router_vlans(id_isp);
   CREATE INDEX idx_parajes_nombre ON one_parajes(nombre);
   CREATE INDEX idx_tipo_servicio_isp ON TipoServicio(id_isp);
   ```

---

## 📝 Resumen de Implementación

```
✅ 6 Endpoints GET a implementar
✅ Todos consultan base de datos (NO la OLT)
✅ Formato JSON estandarizado: { "success": true, "data": [...] }
✅ Filtros opcionales por isp_id, zone_id, search
✅ Validación de token en todos los endpoints
✅ Cache de 5 minutos recomendado
```

---

## 🎯 Próximos Pasos

Una vez implementados estos 6 endpoints:
1. Frontend los consumirá automáticamente
2. Los desplegables se poblarán con datos reales
3. El técnico podrá autorizar ONUs con datos correctos de la BD

**El endpoint de autorización** (`POST /api/olts/realtime/:oltId/onus/:serial/authorize`) ya está documentado en:
- `PROMPT_BACKEND_AUTORIZACION_ONU_TR069.md`

---

**¿Dudas?** El frontend ya está listo. Solo falta que implementes estos 6 endpoints. 🚀
