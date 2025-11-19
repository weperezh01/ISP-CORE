# PROMPT: Implementar Endpoint de Totales/Estadísticas de Instalaciones

## Contexto del Proyecto

Estás trabajando en el backend de **ISP-CORE**, un sistema de gestión para proveedores de servicios de internet (ISP). El frontend ya tiene implementado un panel de control que muestra estadísticas de instalaciones en el botón "Instalaciones", pero el endpoint del backend aún no existe.

---

## Objetivo

Implementar un endpoint que retorne **estadísticas y totales de instalaciones de un ISP específico**, incluyendo totales generales, métricas de tiempo (este mes, hoy), tracking de ubicación GPS, y estado de equipos.

---

## Especificaciones del Endpoint

### Endpoint Requerido

```
GET /api/totales-instalaciones/:id_isp
```

### Parámetros de Entrada

**URL Parameters**:
- **id_isp** (number, requerido): ID del ISP del cual se quieren obtener las estadísticas

**Ejemplo de Request**:
```bash
GET /api/totales-instalaciones/12
```

### Respuesta Esperada

#### ✅ Éxito (200 OK)

```json
{
  "totalInstalaciones": 45,
  "estadisticasTiempo": {
    "instalacionesEsteMes": 12,
    "instalacionesHoy": 3
  },
  "tracking": {
    "conUbicacion": 38,
    "sinUbicacion": 7
  },
  "equipos": {
    "configuradas": 40,
    "sinConfig": 5
  }
}
```

**Descripción de Campos**:
- `totalInstalaciones`: Total de instalaciones del ISP
- `estadisticasTiempo.instalacionesEsteMes`: Instalaciones creadas en el mes actual
- `estadisticasTiempo.instalacionesHoy`: Instalaciones creadas hoy
- `tracking.conUbicacion`: Instalaciones con coordenadas GPS registradas
- `tracking.sinUbicacion`: Instalaciones sin coordenadas GPS
- `equipos.configuradas`: Instalaciones con router/equipo configurado
- `equipos.sinConfig`: Instalaciones sin router/equipo configurado

#### ❌ Error - ISP no especificado (400 Bad Request)

```json
{
  "error": "ID de ISP no proporcionado",
  "message": "El parámetro id_isp es requerido"
}
```

#### ❌ Error del servidor (500 Internal Server Error)

```json
{
  "error": "Error al obtener totales de instalaciones",
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

---

## Implementación del Endpoint

### SQL Queries Requeridas

```sql
-- 1. Total de instalaciones
SELECT COUNT(*) as totalInstalaciones
FROM instalacion i
INNER JOIN conexiones cx ON i.id_conexion = cx.id_conexion
WHERE cx.id_isp = ?;

-- 2. Instalaciones este mes
SELECT COUNT(*) as instalacionesEsteMes
FROM instalacion i
INNER JOIN conexiones cx ON i.id_conexion = cx.id_conexion
WHERE cx.id_isp = ?
  AND MONTH(i.fecha_guardado) = MONTH(CURRENT_DATE())
  AND YEAR(i.fecha_guardado) = YEAR(CURRENT_DATE());

-- 3. Instalaciones hoy
SELECT COUNT(*) as instalacionesHoy
FROM instalacion i
INNER JOIN conexiones cx ON i.id_conexion = cx.id_conexion
WHERE cx.id_isp = ?
  AND DATE(i.fecha_guardado) = CURDATE();

-- 4. Tracking GPS (con y sin ubicación)
SELECT
    SUM(CASE
        WHEN i.latitud IS NOT NULL AND i.longitud IS NOT NULL
             AND i.latitud != '' AND i.longitud != ''
        THEN 1
        ELSE 0
    END) as conUbicacion,
    SUM(CASE
        WHEN i.latitud IS NULL OR i.longitud IS NULL
             OR i.latitud = '' OR i.longitud = ''
        THEN 1
        ELSE 0
    END) as sinUbicacion
FROM instalacion i
INNER JOIN conexiones cx ON i.id_conexion = cx.id_conexion
WHERE cx.id_isp = ?;

-- 5. Equipos configurados
SELECT
    SUM(CASE
        WHEN i.router_wifi IS NOT NULL AND i.router_wifi != ''
        THEN 1
        ELSE 0
    END) as configuradas,
    SUM(CASE
        WHEN i.router_wifi IS NULL OR i.router_wifi = ''
        THEN 1
        ELSE 0
    END) as sinConfig
FROM instalacion i
INNER JOIN conexiones cx ON i.id_conexion = cx.id_conexion
WHERE cx.id_isp = ?;
```

### Query Optimizada (Todo en Una)

Para mejor performance, puedes obtener todas las estadísticas en una sola query:

```sql
SELECT
    -- Total
    COUNT(*) as totalInstalaciones,

    -- Este mes
    SUM(CASE
        WHEN MONTH(i.fecha_guardado) = MONTH(CURRENT_DATE())
             AND YEAR(i.fecha_guardado) = YEAR(CURRENT_DATE())
        THEN 1
        ELSE 0
    END) as instalacionesEsteMes,

    -- Hoy
    SUM(CASE
        WHEN DATE(i.fecha_guardado) = CURDATE()
        THEN 1
        ELSE 0
    END) as instalacionesHoy,

    -- Con ubicación GPS
    SUM(CASE
        WHEN i.latitud IS NOT NULL AND i.longitud IS NOT NULL
             AND i.latitud != '' AND i.longitud != ''
        THEN 1
        ELSE 0
    END) as conUbicacion,

    -- Sin ubicación GPS
    SUM(CASE
        WHEN i.latitud IS NULL OR i.longitud IS NULL
             OR i.latitud = '' OR i.longitud = ''
        THEN 1
        ELSE 0
    END) as sinUbicacion,

    -- Equipos configurados
    SUM(CASE
        WHEN i.router_wifi IS NOT NULL AND i.router_wifi != ''
        THEN 1
        ELSE 0
    END) as configuradas,

    -- Sin configurar
    SUM(CASE
        WHEN i.router_wifi IS NULL OR i.router_wifi = ''
        THEN 1
        ELSE 0
    END) as sinConfig

FROM instalacion i
INNER JOIN conexiones cx ON i.id_conexion = cx.id_conexion
WHERE cx.id_isp = ?;
```

---

## Ejemplo de Implementación (Node.js + Express + MySQL)

### Estructura del Endpoint

```javascript
// routes/instalacionRoutes.js
router.get('/totales-instalaciones/:id_isp', obtenerTotalesInstalaciones);

// controllers/instalacionController.js
const obtenerTotalesInstalaciones = async (req, res) => {
    const { id_isp } = req.params;

    try {
        // 1. Validar que id_isp esté presente
        if (!id_isp) {
            return res.status(400).json({
                error: "ID de ISP no proporcionado",
                message: "El parámetro id_isp es requerido"
            });
        }

        // 2. Validar que sea un número
        const idIspNum = parseInt(id_isp);
        if (isNaN(idIspNum)) {
            return res.status(400).json({
                error: "ID de ISP inválido",
                message: "El id_isp debe ser un número válido"
            });
        }

        console.log(`📊 [TotalesInstalaciones] Obteniendo totales para ISP: ${idIspNum}`);

        // 3. Ejecutar query optimizada
        const [results] = await pool.query(`
            SELECT
                -- Total
                COUNT(*) as totalInstalaciones,

                -- Este mes
                SUM(CASE
                    WHEN MONTH(i.fecha_guardado) = MONTH(CURRENT_DATE())
                         AND YEAR(i.fecha_guardado) = YEAR(CURRENT_DATE())
                    THEN 1
                    ELSE 0
                END) as instalacionesEsteMes,

                -- Hoy
                SUM(CASE
                    WHEN DATE(i.fecha_guardado) = CURDATE()
                    THEN 1
                    ELSE 0
                END) as instalacionesHoy,

                -- Con ubicación GPS
                SUM(CASE
                    WHEN i.latitud IS NOT NULL AND i.longitud IS NOT NULL
                         AND i.latitud != '' AND i.longitud != ''
                    THEN 1
                    ELSE 0
                END) as conUbicacion,

                -- Sin ubicación GPS
                SUM(CASE
                    WHEN i.latitud IS NULL OR i.longitud IS NULL
                         OR i.latitud = '' OR i.longitud = ''
                    THEN 1
                    ELSE 0
                END) as sinUbicacion,

                -- Equipos configurados (con router_wifi)
                SUM(CASE
                    WHEN i.router_wifi IS NOT NULL AND i.router_wifi != ''
                    THEN 1
                    ELSE 0
                END) as configuradas,

                -- Sin configurar
                SUM(CASE
                    WHEN i.router_wifi IS NULL OR i.router_wifi = ''
                    THEN 1
                    ELSE 0
                END) as sinConfig

            FROM instalacion i
            INNER JOIN conexiones cx ON i.id_conexion = cx.id_conexion
            WHERE cx.id_isp = ?
        `, [idIspNum]);

        // 4. Procesar resultados
        const row = results[0] || {};

        const response = {
            totalInstalaciones: parseInt(row.totalInstalaciones) || 0,
            estadisticasTiempo: {
                instalacionesEsteMes: parseInt(row.instalacionesEsteMes) || 0,
                instalacionesHoy: parseInt(row.instalacionesHoy) || 0,
            },
            tracking: {
                conUbicacion: parseInt(row.conUbicacion) || 0,
                sinUbicacion: parseInt(row.sinUbicacion) || 0,
            },
            equipos: {
                configuradas: parseInt(row.configuradas) || 0,
                sinConfig: parseInt(row.sinConfig) || 0,
            },
        };

        console.log('✅ [TotalesInstalaciones] Datos obtenidos:', response);

        // 5. Retornar respuesta
        res.status(200).json(response);

    } catch (error) {
        console.error('❌ [TotalesInstalaciones] Error:', error);
        res.status(500).json({
            error: "Error al obtener totales de instalaciones",
            message: error.message
        });
    }
};

module.exports = { obtenerTotalesInstalaciones };
```

---

## Validaciones Importantes

### 1. Verificar que id_isp esté presente y sea válido

```javascript
if (!id_isp) {
    return res.status(400).json({
        error: "ID de ISP no proporcionado",
        message: "El parámetro id_isp es requerido"
    });
}

const idIspNum = parseInt(id_isp);
if (isNaN(idIspNum)) {
    return res.status(400).json({
        error: "ID de ISP inválido",
        message: "El id_isp debe ser un número válido"
    });
}
```

### 2. Manejar caso de ISP sin instalaciones

Si el ISP no tiene instalaciones, retornar estructura con ceros:

```json
{
  "totalInstalaciones": 0,
  "estadisticasTiempo": {
    "instalacionesEsteMes": 0,
    "instalacionesHoy": 0
  },
  "tracking": {
    "conUbicacion": 0,
    "sinUbicacion": 0
  },
  "equipos": {
    "configuradas": 0,
    "sinConfig": 0
  }
}
```

### 3. Conversión a enteros

Asegúrate de convertir todos los valores a enteros para evitar problemas en el frontend:

```javascript
totalInstalaciones: parseInt(row.totalInstalaciones) || 0
```

---

## Testing del Endpoint

### Prueba 1: ISP con instalaciones

```bash
curl -X GET http://localhost:3000/api/totales-instalaciones/12
```

**Resultado esperado**: 200 OK con objeto de estadísticas

### Prueba 2: ISP sin instalaciones

```bash
curl -X GET http://localhost:3000/api/totales-instalaciones/999
```

**Resultado esperado**: 200 OK con todos los valores en 0

### Prueba 3: ID inválido

```bash
curl -X GET http://localhost:3000/api/totales-instalaciones/abc
```

**Resultado esperado**: 400 Bad Request con mensaje de error

---

## Consideraciones de Performance

### 1. Índices en la Base de Datos

Asegúrate de tener índices en:
- `instalacion.id_conexion`
- `instalacion.fecha_guardado`
- `conexiones.id_isp`

### 2. Cache (Opcional)

Para ISPs con muchas instalaciones, considera cachear los resultados por 5-10 minutos:

```javascript
const cacheKey = `totales-instalaciones-${id_isp}`;
const cached = cache.get(cacheKey);
if (cached) {
    return res.status(200).json(cached);
}

// ... obtener datos de la BD ...

cache.set(cacheKey, response, 300); // 5 minutos
```

### 3. Query Optimizada

La query única con múltiples SUM(CASE...) es más eficiente que múltiples queries separadas.

---

## Logs Recomendados

```javascript
console.log(`📊 [TotalesInstalaciones] Obteniendo totales para ISP: ${idIspNum}`);
console.log('✅ [TotalesInstalaciones] Datos obtenidos:', response);
console.error('❌ [TotalesInstalaciones] Error:', error);
```

---

## Integración con Frontend

El frontend **IspDetailsScreen** consume este endpoint de la siguiente manera:

```javascript
const instalacionesTotales = async (currentIspId) => {
    try {
        const res = await axios.get(
            `https://wellnet-rd.com:444/api/totales-instalaciones/${currentIspId}`,
            {
                headers: { 'Accept': 'application/json' },
                timeout: 10000,
            }
        );

        const body = res.data;
        const totalInstalaciones = body.totalInstalaciones ?? 0;
        const estadisticasTiempo = body.estadisticasTiempo || {};
        const tracking = body.tracking || {};
        const equipos = body.equipos || {};

        setTotalesInst({ totalInstalaciones, estadisticasTiempo, tracking, equipos });
    } catch (e) {
        console.error('❌ Error en totales-instalaciones:', e.message);
    }
};
```

El frontend espera:
- **Objeto JSON** con la estructura especificada
- **Números enteros** para todos los contadores
- **Nombres de campos en camelCase** (instalacionesEsteMes, conUbicacion, etc.)

---

## Checklist de Implementación

- [ ] Crear el endpoint `GET /api/totales-instalaciones/:id_isp`
- [ ] Implementar validación de `id_isp`
- [ ] Crear query SQL optimizada con todos los SUM(CASE...)
- [ ] Incluir totales generales
- [ ] Incluir estadísticas de tiempo (este mes, hoy)
- [ ] Incluir tracking GPS (con/sin ubicación)
- [ ] Incluir estado de equipos (configuradas/sin configurar)
- [ ] Convertir todos los valores a enteros
- [ ] Agregar logs para debugging
- [ ] Probar con ISP que tiene instalaciones
- [ ] Probar con ISP sin instalaciones
- [ ] Probar con id_isp inválido
- [ ] Verificar performance con muchos registros
- [ ] Verificar índices en la base de datos

---

## Archivos a Crear/Modificar

1. `routes/instalacionRoutes.js` - Agregar la nueva ruta GET
2. `controllers/instalacionController.js` - Agregar la función `obtenerTotalesInstalaciones`
3. `server.js` - Asegurarse de que las rutas estén registradas

---

¡Implementa este endpoint y pruébalo! El frontend ya está configurado y esperando estos datos. 🚀

## Notas Adicionales

- **Formato de respuesta**: El frontend acepta múltiples formatos de nombres de campos (camelCase, snake_case) gracias al mapeo flexible
- **Fechas**: MySQL CURDATE() retorna la fecha actual, CURRENT_DATE() es equivalente
- **GPS**: Se considera que hay ubicación si tanto latitud como longitud tienen valores no vacíos
- **Equipos configurados**: Se determina por la presencia del campo `router_wifi` (también podrías incluir `onu` o `radio`)
- **Performance**: La query única es altamente eficiente incluso con miles de instalaciones
