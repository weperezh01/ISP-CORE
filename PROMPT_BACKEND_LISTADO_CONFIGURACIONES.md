# PROMPT: Implementar Endpoint de Listado de Configuraciones por ISP

## Contexto del Proyecto

Estás trabajando en el backend de **ISP-CORE**, un sistema de gestión para proveedores de servicios de internet (ISP). El frontend de React Native ha implementado una nueva pantalla **`ConfiguracionesListScreen`** que muestra un listado completo de todas las configuraciones de routers del ISP, y necesitas implementar el endpoint correspondiente en el backend.

---

## Objetivo

Implementar un endpoint que permita **obtener un listado completo de todas las configuraciones de routers de un ISP específico**, con información detallada de cada configuración incluyendo datos del cliente, router, dirección IP, método de configuración (PPPoE o Simple Queue), límites de velocidad, y estado.

---

## Especificaciones del Endpoint

### Endpoint Requerido

```
POST /api/configuraciones-isp
```

### Parámetros de Entrada

**Body (JSON)**:
```json
{
  "id_isp": 12
}
```

- **id_isp** (number, requerido): ID del ISP del cual se quieren obtener las configuraciones

### Respuesta Esperada

#### ✅ Éxito (200 OK)

```json
[
  {
    "id_configuracion": 1234,
    "id_conexion": 5678,
    "id_router": 42,
    "nombre_router": "MikroTik CCR1036",
    "descripcion_router": "Router principal zona norte",
    "direccion_ip": "192.168.1.100",
    "red_ip": "192.168.1.0/24",
    "usuario_pppoe": "cliente123",
    "secret_pppoe": "pass123",
    "perfil_pppoe": "10M",
    "bajada_limite": "10",
    "unidad_bajada": "Mbps",
    "subida_limite": "5",
    "unidad_subida": "Mbps",
    "activo": 1,
    "fecha_creacion": "2025-01-10T14:30:00.000Z",
    "nombreCliente": "Juan Pérez",
    "apellidoCliente": "González",
    "nota": "Configuración estándar residencial"
  },
  {
    "id_configuracion": 1235,
    "id_conexion": 5679,
    "id_router": 43,
    "nombre_router": "MikroTik RB4011",
    "descripcion_router": "Router zona sur",
    "direccion_ip": "192.168.2.50",
    "red_ip": "192.168.2.0/24",
    "usuario_pppoe": null,
    "secret_pppoe": null,
    "perfil_pppoe": null,
    "bajada_limite": "20",
    "unidad_bajada": "Mbps",
    "subida_limite": "10",
    "unidad_subida": "Mbps",
    "activo": 1,
    "fecha_creacion": "2025-01-12T09:15:00.000Z",
    "nombreCliente": "María López",
    "apellidoCliente": "Hernández",
    "nota": "Simple Queue - Plan empresarial"
  }
]
```

**Descripción de Campos**:
- `id_configuracion`: ID de la configuración
- `id_conexion`: ID de la conexión asociada
- `id_router`: ID del router
- `nombre_router`: Nombre del router
- `descripcion_router`: Descripción del router
- `direccion_ip`: Dirección IP asignada
- `red_ip`: Red IP del router
- `usuario_pppoe`: Usuario PPPoE (null si es Simple Queue)
- `secret_pppoe`: Contraseña PPPoE (null si es Simple Queue)
- `perfil_pppoe`: Perfil PPPoE (null si es Simple Queue)
- `bajada_limite`: Límite de bajada
- `unidad_bajada`: Unidad de medida (Kbps, Mbps, Gbps)
- `subida_limite`: Límite de subida
- `unidad_subida`: Unidad de medida
- `activo`: Estado de la configuración (1 = activa, 0 = inactiva)
- `fecha_creacion`: Fecha y hora de creación
- `nombreCliente`: Nombre del cliente
- `apellidoCliente`: Apellido del cliente
- `nota`: Notas adicionales

#### ❌ Error - ISP no especificado (400 Bad Request)

```json
{
  "error": "ID de ISP no proporcionado",
  "message": "El campo id_isp es requerido"
}
```

#### ❌ Error - No hay configuraciones (200 OK con array vacío)

```json
[]
```

#### ❌ Error del servidor (500 Internal Server Error)

```json
{
  "error": "Error al obtener configuraciones",
  "message": "Descripción del error específico"
}
```

---

## Estructura de las Tablas (Base de Datos)

### Tabla Principal: `configuracion_router` (o nombre similar)

**Nota**: El nombre exacto de la tabla puede variar. Común: `router_config`, `configuraciones`, `config_router`, etc.

```sql
CREATE TABLE configuracion_router (
  id_configuracion INT AUTO_INCREMENT PRIMARY KEY,
  id_conexion INT NOT NULL,
  id_router INT NOT NULL,

  -- Dirección IP
  direccion_ip VARCHAR(50),
  red_ip VARCHAR(50),

  -- PPPoE (si aplica)
  usuario_pppoe VARCHAR(100),
  secret_pppoe VARCHAR(100),
  perfil_pppoe VARCHAR(100),

  -- Límites de velocidad
  bajada_limite VARCHAR(50),
  unidad_bajada VARCHAR(10),  -- Kbps, Mbps, Gbps
  subida_limite VARCHAR(50),
  unidad_subida VARCHAR(10),

  -- Estado y timestamps
  activo TINYINT(1) DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Notas
  nota TEXT,

  -- Foreign Keys
  FOREIGN KEY (id_conexion) REFERENCES conexiones(id_conexion) ON DELETE CASCADE,
  FOREIGN KEY (id_router) REFERENCES routers(id_router) ON DELETE CASCADE,

  -- Índices
  INDEX idx_conexion (id_conexion),
  INDEX idx_router (id_router),
  INDEX idx_activo (activo),
  INDEX idx_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla: `routers`

```sql
CREATE TABLE routers (
  id_router INT AUTO_INCREMENT PRIMARY KEY,
  id_isp INT NOT NULL,
  nombre_router VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ip_router VARCHAR(50),
  usuario VARCHAR(100),
  contrasena VARCHAR(255),
  puerto INT DEFAULT 8728,
  activo TINYINT(1) DEFAULT 1,

  FOREIGN KEY (id_isp) REFERENCES isp(id_isp)
);
```

### Tabla: `conexiones`

```sql
CREATE TABLE conexiones (
  id_conexion INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_isp INT NOT NULL,
  id_tecnico INT,
  estado VARCHAR(50),
  -- ... otros campos

  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  FOREIGN KEY (id_isp) REFERENCES isp(id_isp),
  FOREIGN KEY (id_tecnico) REFERENCES usuarios(id)
);
```

### Tabla: `clientes`

```sql
CREATE TABLE clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  -- ... otros campos
);
```

---

## Implementación del Endpoint

### SQL Query Requerida

```sql
SELECT
    cr.id_configuracion,
    cr.id_conexion,
    cr.id_router,
    cr.direccion_ip,
    cr.red_ip,
    cr.usuario_pppoe,
    cr.secret_pppoe,
    cr.perfil_pppoe,
    cr.bajada_limite,
    cr.unidad_bajada,
    cr.subida_limite,
    cr.unidad_subida,
    cr.activo,
    cr.fecha_creacion,
    cr.nota,

    -- Datos del router
    r.nombre_router,
    r.descripcion AS descripcion_router,

    -- Datos del cliente
    c.nombres AS nombreCliente,
    c.apellidos AS apellidoCliente

FROM configuracion_router cr

-- JOIN con conexiones para obtener el ISP y cliente
INNER JOIN conexiones cx ON cr.id_conexion = cx.id_conexion

-- JOIN con router
LEFT JOIN routers r ON cr.id_router = r.id_router

-- JOIN con clientes
LEFT JOIN clientes c ON cx.id_cliente = c.id_cliente

-- Filtrar por ISP
WHERE cx.id_isp = ?

-- Ordenar por fecha más reciente primero
ORDER BY cr.fecha_creacion DESC;
```

---

## Ejemplo de Implementación (Node.js + Express + MySQL)

### Estructura del Endpoint

```javascript
// routes/configuracionRoutes.js
router.post('/configuraciones-isp', obtenerConfiguracionesIsp);

// controllers/configuracionController.js
const obtenerConfiguracionesIsp = async (req, res) => {
    const { id_isp } = req.body;

    try {
        // 1. Validar que id_isp esté presente
        if (!id_isp) {
            return res.status(400).json({
                error: "ID de ISP no proporcionado",
                message: "El campo id_isp es requerido"
            });
        }

        console.log(`📋 [ConfiguracionesISP] Obteniendo configuraciones del ISP: ${id_isp}`);

        // 2. Ejecutar query
        const [configuraciones] = await pool.query(`
            SELECT
                cr.id_configuracion,
                cr.id_conexion,
                cr.id_router,
                cr.direccion_ip,
                cr.red_ip,
                cr.usuario_pppoe,
                cr.secret_pppoe,
                cr.perfil_pppoe,
                cr.bajada_limite,
                cr.unidad_bajada,
                cr.subida_limite,
                cr.unidad_subida,
                cr.activo,
                cr.fecha_creacion,
                cr.nota,

                -- Datos del router
                r.nombre_router,
                r.descripcion AS descripcion_router,

                -- Datos del cliente
                c.nombres AS nombreCliente,
                c.apellidos AS apellidoCliente

            FROM configuracion_router cr

            -- JOIN con conexiones para obtener el ISP y cliente
            INNER JOIN conexiones cx ON cr.id_conexion = cx.id_conexion

            -- JOIN con router
            LEFT JOIN routers r ON cr.id_router = r.id_router

            -- JOIN con clientes
            LEFT JOIN clientes c ON cx.id_cliente = c.id_cliente

            -- Filtrar por ISP
            WHERE cx.id_isp = ?

            -- Ordenar por fecha más reciente primero
            ORDER BY cr.fecha_creacion DESC
        `, [id_isp]);

        console.log(`✅ [ConfiguracionesISP] ${configuraciones.length} configuraciones encontradas`);

        // 3. Retornar configuraciones (puede ser array vacío si no hay ninguna)
        res.status(200).json(configuraciones);

    } catch (error) {
        console.error('❌ [ConfiguracionesISP] Error:', error);
        res.status(500).json({
            error: "Error al obtener configuraciones",
            message: error.message
        });
    }
};

module.exports = { obtenerConfiguracionesIsp };
```

---

## Validaciones Importantes

### 1. Verificar que id_isp esté presente

```javascript
if (!id_isp) {
    return res.status(400).json({
        error: "ID de ISP no proporcionado",
        message: "El campo id_isp es requerido"
    });
}
```

### 2. Manejar caso de array vacío

- Si no hay configuraciones, retornar array vacío `[]`, NO un error
- Esto es válido y el frontend lo maneja correctamente

### 3. Validar números

```javascript
const id_isp_num = parseInt(id_isp);
if (isNaN(id_isp_num)) {
    return res.status(400).json({
        error: "ID de ISP inválido",
        message: "El id_isp debe ser un número válido"
    });
}
```

---

## Diferencias entre PPPoE y Simple Queue

### PPPoE (Point-to-Point Protocol over Ethernet)
- Tiene `usuario_pppoe`, `secret_pppoe`, y `perfil_pppoe` no nulos
- El cliente se autentica con usuario y contraseña
- El router maneja la sesión PPPoE
- Límites de velocidad configurados en el perfil PPPoE

### Simple Queue
- Los campos `usuario_pppoe`, `secret_pppoe`, y `perfil_pppoe` son NULL
- Se configura directamente por dirección IP
- Límites de velocidad configurados en queues simples
- No requiere autenticación

**Identificación en el frontend**:
```javascript
const esPppoe = (item.usuario_pppoe && item.usuario_pppoe.trim() !== '');
```

---

## Testing del Endpoint

### Prueba 1: Obtener configuraciones exitosamente

```bash
curl -X POST http://localhost:3000/api/configuraciones-isp \
  -H "Content-Type: application/json" \
  -d '{"id_isp": 12}'
```

**Resultado esperado**: 200 OK con array de configuraciones

### Prueba 2: ISP sin configuraciones

```bash
curl -X POST http://localhost:3000/api/configuraciones-isp \
  -H "Content-Type: application/json" \
  -d '{"id_isp": 999}'
```

**Resultado esperado**: 200 OK con array vacío `[]`

### Prueba 3: Sin ID de ISP

```bash
curl -X POST http://localhost:3000/api/configuraciones-isp \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Resultado esperado**: 400 Bad Request con mensaje de error

---

## Consideraciones de Performance

### 1. Índices en la Base de Datos

Asegúrate de tener índices en:
- `configuracion_router.id_conexion`
- `configuracion_router.id_router`
- `configuracion_router.fecha_creacion`
- `configuracion_router.activo`
- `conexiones.id_isp`
- `conexiones.id_cliente`
- `routers.id_isp`

### 2. Límite de Resultados (Opcional)

Si hay muchas configuraciones (>1000), considera implementar paginación:
```sql
LIMIT 100
```

### 3. Cache (Opcional)

Para ISPs con muchas configuraciones, podrías cachear los resultados por 5-10 minutos.

---

## Logs Recomendados

Agrega logs para debugging y auditoría:

```javascript
console.log(`📋 [ConfiguracionesISP] Solicitud para ISP: ${id_isp}`);
console.log(`✅ [ConfiguracionesISP] ${configuraciones.length} configuraciones encontradas`);

// Si implementas filtros (futuro):
console.log(`🔍 [ConfiguracionesISP] Filtros aplicados:`, filtros);
```

---

## Integración con Frontend

El frontend **`ConfiguracionesListScreen`** consume este endpoint de la siguiente manera:

```javascript
const fetchConfiguraciones = async () => {
    try {
        const response = await fetch('https://wellnet-rd.com:444/api/configuraciones-isp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_isp }),
        });

        const data = await response.json();
        setConfiguraciones(data || []);
    } catch (error) {
        console.error('Error al obtener configuraciones:', error);
        Alert.alert('Error', 'No se pudieron cargar las configuraciones');
    }
};
```

El frontend espera:
- **Array de objetos** con las propiedades especificadas
- **Nombres de campos en camelCase** (nombreCliente, nombreRouter, etc.)
- **Fechas en formato ISO 8601** o MySQL DATETIME
- **Valores booleanos o enteros para `activo`** (1/0 o true/false)

---

## Mejoras Opcionales (Futuro)

### 1. Filtros Adicionales

```javascript
// Body request:
{
  "id_isp": 12,
  "filtros": {
    "tipo": "pppoe",           // "pppoe" o "simple_queue"
    "activo": 1,               // Solo activas
    "id_router": 42,           // Filtrar por router específico
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-01-31"
  }
}
```

### 2. Paginación

```javascript
// Body request:
{
  "id_isp": 12,
  "page": 1,
  "limit": 20
}

// Response:
{
  "configuraciones": [...],
  "total": 150,
  "pagina_actual": 1,
  "total_paginas": 8
}
```

### 3. Ordenamiento

```javascript
// Body request:
{
  "id_isp": 12,
  "ordenar_por": "fecha_creacion",  // o "cliente", "router", "ip"
  "orden": "DESC"                   // o "ASC"
}
```

---

## Checklist de Implementación

- [ ] Crear el endpoint `POST /api/configuraciones-isp`
- [ ] Implementar validación de `id_isp`
- [ ] Crear query SQL con JOINs necesarios
- [ ] Incluir datos del router (nombre, descripción)
- [ ] Incluir datos del cliente (nombres, apellidos)
- [ ] Incluir todos los campos de configuración (IP, PPPoE, velocidades)
- [ ] Ordenar por `fecha_creacion DESC`
- [ ] Manejar caso de array vacío correctamente
- [ ] Agregar logs para debugging
- [ ] Probar con ISP que tiene configuraciones PPPoE
- [ ] Probar con ISP que tiene configuraciones Simple Queue
- [ ] Probar con ISP sin configuraciones
- [ ] Probar con id_isp inválido
- [ ] Verificar performance con muchos registros
- [ ] Verificar índices en la base de datos

---

## Archivos a Crear/Modificar

1. `routes/configuracionRoutes.js` - Agregar la nueva ruta
2. `controllers/configuracionController.js` - Agregar la función `obtenerConfiguracionesIsp`
3. `server.js` - Asegurarse de que las rutas estén registradas

---

¡Implementa este endpoint y pruébalo! El frontend ya está listo y esperando esta funcionalidad. 🚀

## Notas Adicionales

- **Nombres de campos**: El frontend espera nombres en camelCase (nombreCliente, nombreRouter)
- **Tipos de configuración**: Se determina por la presencia de `usuario_pppoe` (PPPoE vs Simple Queue)
- **LEFT JOIN vs INNER JOIN**: Usa LEFT JOIN para router y clientes por si hay datos faltantes
- **Estado activo**: El campo `activo` puede ser TINYINT(1), BOOLEAN, o INT
- **Fechas NULL**: La fecha de creación debería tener DEFAULT CURRENT_TIMESTAMP
- **Seguridad**: Considera no retornar `secret_pppoe` en producción o encriptarlo
