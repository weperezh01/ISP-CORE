# PROMPT: Implementar Endpoint de Listado de Instalaciones por ISP

## Contexto del Proyecto

Estás trabajando en el backend de **ISP-CORE**, un sistema de gestión para proveedores de servicios de internet (ISP). El sistema permite administrar instalaciones de servicios, técnicos, conexiones, y más.

El frontend de React Native ha implementado una nueva pantalla **`InstalacionesListScreen`** que muestra un listado completo de todas las instalaciones/labores del ISP, y necesitas implementar el endpoint correspondiente en el backend.

---

## Objetivo

Implementar un endpoint que permita **obtener un listado completo de todas las instalaciones de un ISP específico**, con información detallada de cada instalación incluyendo datos del cliente, técnico, conexión y estado.

---

## Especificaciones del Endpoint

### Endpoint Requerido

```
POST /api/instalaciones-isp
```

### Parámetros de Entrada

**Body (JSON)**:
```json
{
  "id_isp": 12
}
```

- **id_isp** (number, requerido): ID del ISP del cual se quieren obtener las instalaciones

### Respuesta Esperada

#### ✅ Éxito (200 OK)
```json
[
  {
    "id_instalacion": 1234,
    "id_conexion": 5678,
    "id_estado_conexion": 3,
    "fecha_guardado": "2025-01-13T10:30:00.000Z",
    "tipo_conexion": "Fibra Óptica",
    "router_wifi": "TP-Link Archer C6",
    "notas_instalacion": "Instalación completada sin problemas",
    "notas_config": "VLAN 100, IP fija",
    "latitud": "19.4561",
    "longitud": "-70.6867",
    "nombreCliente": "Juan Pérez",
    "apellidoCliente": "González",
    "nombreTecnico": "Carlos Rodríguez",
    "apellidoTecnico": "Martínez"
  },
  {
    "id_instalacion": 1235,
    "id_conexion": 5679,
    "id_estado_conexion": 2,
    "fecha_guardado": "2025-01-13T14:15:00.000Z",
    "tipo_conexion": "Radio Enlace",
    "router_wifi": "Ubiquiti EdgeRouter",
    "notas_instalacion": "Pendiente completar configuración",
    "notas_config": "PPPoE, usuario: cliente123",
    "latitud": null,
    "longitud": null,
    "nombreCliente": "María López",
    "apellidoCliente": "Hernández",
    "nombreTecnico": "Pedro Sánchez",
    "apellidoTecnico": "Díaz"
  }
]
```

#### ❌ Error - ISP no especificado (400 Bad Request)
```json
{
  "error": "ID de ISP no proporcionado",
  "message": "El campo id_isp es requerido"
}
```

#### ❌ Error - No hay instalaciones (200 OK con array vacío)
```json
[]
```

#### ❌ Error del servidor (500 Internal Server Error)
```json
{
  "error": "Error al obtener instalaciones",
  "message": "Descripción del error específico"
}
```

---

## Estructura de las Tablas (Base de Datos)

### Tabla: `instalacion`

```sql
CREATE TABLE instalacion (
  id_instalacion INT AUTO_INCREMENT PRIMARY KEY,
  id_conexion INT NOT NULL,
  id_estado_conexion INT DEFAULT 2,
  fecha_guardado DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Configuración de red
  tipo_conexion VARCHAR(100),
  router_wifi VARCHAR(255),
  onu VARCHAR(255),
  radio VARCHAR(255),

  -- Configuración PPPoE
  usuario_pppoe VARCHAR(100),
  contrasena_pppoe VARCHAR(100),
  ip_fija VARCHAR(50),
  ip_router VARCHAR(50),
  velocidad_bajada VARCHAR(50),
  velocidad_subida VARCHAR(50),

  -- Materiales
  cable_fibra INT DEFAULT 0,
  conectores_fibra INT DEFAULT 0,
  cable_utp INT DEFAULT 0,
  conectores_rj45 INT DEFAULT 0,
  cajas_empalme INT DEFAULT 0,
  grapas INT DEFAULT 0,
  cinta_aislante INT DEFAULT 0,

  -- Coordenadas GPS
  latitud VARCHAR(50),
  longitud VARCHAR(50),

  -- Notas
  notas_instalacion TEXT,
  notas_config TEXT,

  -- Foreign Keys
  FOREIGN KEY (id_conexion) REFERENCES conexiones(id_conexion) ON DELETE CASCADE,
  FOREIGN KEY (id_estado_conexion) REFERENCES estado_conexion(id_estado_conexion),

  -- Índices
  INDEX idx_conexion (id_conexion),
  INDEX idx_estado (id_estado_conexion),
  INDEX idx_fecha (fecha_guardado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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

### Tabla: `usuarios` (técnicos)

```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  -- ... otros campos
);
```

### Tabla: `estado_conexion`

```sql
CREATE TABLE estado_conexion (
  id_estado_conexion INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
  -- Valores comunes:
  -- 1: Nueva
  -- 2: Guardada (pendiente)
  -- 3: Finalizada
);
```

---

## Implementación del Endpoint

### SQL Query Requerida

```sql
SELECT
    i.id_instalacion,
    i.id_conexion,
    i.id_estado_conexion,
    i.fecha_guardado,
    i.tipo_conexion,
    i.router_wifi,
    i.notas_instalacion,
    i.notas_config,
    i.latitud,
    i.longitud,

    -- Datos del cliente
    c.nombres AS nombreCliente,
    c.apellidos AS apellidoCliente,

    -- Datos del técnico
    u.nombre AS nombreTecnico,
    u.apellido AS apellidoTecnico

FROM instalacion i

-- JOIN con conexiones para obtener el ISP y cliente
INNER JOIN conexiones cx ON i.id_conexion = cx.id_conexion

-- JOIN con clientes
LEFT JOIN clientes c ON cx.id_cliente = c.id_cliente

-- JOIN con técnicos (usuarios)
LEFT JOIN usuarios u ON cx.id_tecnico = u.id

-- Filtrar por ISP
WHERE cx.id_isp = ?

-- Ordenar por fecha más reciente primero
ORDER BY i.fecha_guardado DESC;
```

---

## Ejemplo de Implementación (Node.js + Express + MySQL)

### Estructura del Endpoint

```javascript
// routes/instalacionRoutes.js
router.post('/instalaciones-isp', obtenerInstalacionesIsp);

// controllers/instalacionController.js
const obtenerInstalacionesIsp = async (req, res) => {
    const { id_isp } = req.body;

    try {
        // 1. Validar que id_isp esté presente
        if (!id_isp) {
            return res.status(400).json({
                error: "ID de ISP no proporcionado",
                message: "El campo id_isp es requerido"
            });
        }

        console.log(`📋 [InstalacionesISP] Obteniendo instalaciones del ISP: ${id_isp}`);

        // 2. Ejecutar query
        const [instalaciones] = await pool.query(`
            SELECT
                i.id_instalacion,
                i.id_conexion,
                i.id_estado_conexion,
                i.fecha_guardado,
                i.tipo_conexion,
                i.router_wifi,
                i.notas_instalacion,
                i.notas_config,
                i.latitud,
                i.longitud,

                -- Datos del cliente
                c.nombres AS nombreCliente,
                c.apellidos AS apellidoCliente,

                -- Datos del técnico
                u.nombre AS nombreTecnico,
                u.apellido AS apellidoTecnico

            FROM instalacion i

            -- JOIN con conexiones para obtener el ISP y cliente
            INNER JOIN conexiones cx ON i.id_conexion = cx.id_conexion

            -- JOIN con clientes
            LEFT JOIN clientes c ON cx.id_cliente = c.id_cliente

            -- JOIN con técnicos (usuarios)
            LEFT JOIN usuarios u ON cx.id_tecnico = u.id

            -- Filtrar por ISP
            WHERE cx.id_isp = ?

            -- Ordenar por fecha más reciente primero
            ORDER BY i.fecha_guardado DESC
        `, [id_isp]);

        console.log(`✅ [InstalacionesISP] ${instalaciones.length} instalaciones encontradas`);

        // 3. Retornar instalaciones (puede ser array vacío si no hay ninguna)
        res.status(200).json(instalaciones);

    } catch (error) {
        console.error('❌ [InstalacionesISP] Error:', error);
        res.status(500).json({
            error: "Error al obtener instalaciones",
            message: error.message
        });
    }
};

module.exports = { obtenerInstalacionesIsp };
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
- Si no hay instalaciones, retornar array vacío `[]`, NO un error
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

## Mejoras Opcionales (Futuro)

### 1. Paginación

Si en el futuro hay muchas instalaciones, puedes agregar paginación:

```javascript
// Body request:
{
  "id_isp": 12,
  "page": 1,
  "limit": 20
}

// Query con LIMIT y OFFSET:
const offset = (page - 1) * limit;
const query = `... ORDER BY i.fecha_guardado DESC LIMIT ? OFFSET ?`;
const [instalaciones] = await pool.query(query, [id_isp, limit, offset]);

// Response:
{
  "instalaciones": [...],
  "total": 150,
  "pagina_actual": 1,
  "total_paginas": 8
}
```

### 2. Filtros Adicionales

```javascript
// Body request:
{
  "id_isp": 12,
  "filtros": {
    "estado": 2,              // Solo pendientes
    "fecha_inicio": "2025-01-01",
    "fecha_fin": "2025-01-31",
    "id_tecnico": 5
  }
}

// Query con WHERE dinámico:
let conditions = ['cx.id_isp = ?'];
let params = [id_isp];

if (filtros?.estado) {
    conditions.push('i.id_estado_conexion = ?');
    params.push(filtros.estado);
}

if (filtros?.fecha_inicio) {
    conditions.push('DATE(i.fecha_guardado) >= ?');
    params.push(filtros.fecha_inicio);
}

if (filtros?.fecha_fin) {
    conditions.push('DATE(i.fecha_guardado) <= ?');
    params.push(filtros.fecha_fin);
}

const whereClause = conditions.join(' AND ');
const query = `SELECT ... WHERE ${whereClause} ORDER BY ...`;
```

---

## Testing del Endpoint

### Prueba 1: Obtener instalaciones exitosamente

```bash
curl -X POST http://localhost:3000/api/instalaciones-isp \
  -H "Content-Type: application/json" \
  -d '{"id_isp": 12}'
```

**Resultado esperado**: 200 OK con array de instalaciones

### Prueba 2: ISP sin instalaciones

```bash
curl -X POST http://localhost:3000/api/instalaciones-isp \
  -H "Content-Type: application/json" \
  -d '{"id_isp": 999}'
```

**Resultado esperado**: 200 OK con array vacío `[]`

### Prueba 3: Sin ID de ISP

```bash
curl -X POST http://localhost:3000/api/instalaciones-isp \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Resultado esperado**: 400 Bad Request con mensaje de error

---

## Consideraciones de Performance

### 1. Índices en la Base de Datos
Asegúrate de tener índices en:
- `instalacion.id_conexion`
- `instalacion.id_estado_conexion`
- `instalacion.fecha_guardado`
- `conexiones.id_isp`
- `conexiones.id_cliente`
- `conexiones.id_tecnico`

### 2. Límite de Resultados
Si hay muchas instalaciones (>1000), considera implementar paginación desde el inicio:
```sql
LIMIT 100
```

### 3. Cache (Opcional)
Para ISPs con muchas instalaciones, podrías cachear los resultados por 5-10 minutos.

---

## Logs Recomendados

Agrega logs para debugging y auditoría:

```javascript
console.log(`📋 [InstalacionesISP] Solicitud para ISP: ${id_isp}`);
console.log(`✅ [InstalacionesISP] ${instalaciones.length} instalaciones encontradas`);

// Si hay filtros (futuro):
console.log(`🔍 [InstalacionesISP] Filtros aplicados:`, filtros);
```

---

## Integración con Frontend

El frontend **`InstalacionesListScreen`** consume este endpoint de la siguiente manera:

```javascript
const fetchInstalaciones = async () => {
    try {
        const response = await fetch('https://wellnet-rd.com:444/api/instalaciones-isp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_isp }),
        });

        const data = await response.json();
        setInstalaciones(data || []);
    } catch (error) {
        console.error('Error al obtener instalaciones:', error);
        Alert.alert('Error', 'No se pudieron cargar las instalaciones');
    }
};
```

El frontend espera:
- **Array de objetos** con las propiedades especificadas
- **Nombres de campos en camelCase** (nombreCliente, nombreTecnico, etc.)
- **Fechas en formato ISO 8601** o MySQL DATETIME

---

## Checklist de Implementación

- [ ] Crear el endpoint `POST /api/instalaciones-isp`
- [ ] Implementar validación de `id_isp`
- [ ] Crear query SQL con JOINs necesarios
- [ ] Incluir datos del cliente (nombres, apellidos)
- [ ] Incluir datos del técnico (nombre, apellido)
- [ ] Ordenar por `fecha_guardado DESC`
- [ ] Manejar caso de array vacío correctamente
- [ ] Agregar logs para debugging
- [ ] Probar con ISP que tiene instalaciones
- [ ] Probar con ISP sin instalaciones
- [ ] Probar con id_isp inválido
- [ ] Verificar performance con muchos registros

---

## Archivos a Crear/Modificar

1. `routes/instalacionRoutes.js` - Agregar la nueva ruta
2. `controllers/instalacionController.js` - Agregar la función `obtenerInstalacionesIsp`
3. `server.js` - Asegurarse de que las rutas estén registradas

---

¡Implementa este endpoint y pruébalo! El frontend ya está listo y esperando esta funcionalidad. 🚀

## Notas Adicionales

- **Nombres de campos**: El frontend espera nombres en camelCase (nombreCliente, nombreTecnico)
- **Estados comunes**:
  - `id_estado_conexion = 2`: Guardada (pendiente)
  - `id_estado_conexion = 3`: Finalizada
- **LEFT JOIN vs INNER JOIN**: Usa LEFT JOIN para técnicos ya que no todas las conexiones pueden tener técnico asignado
- **Fechas NULL**: Los campos `latitud` y `longitud` pueden ser NULL si no se obtuvieron las coordenadas GPS
