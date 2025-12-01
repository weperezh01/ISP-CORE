# MENSAJE PARA CLAUDE DEL BACKEND

## Contexto

Necesito verificar e implementar correctamente el endpoint que lista todas las conexiones de un ciclo específico para la pantalla ConexionesCicloScreen del frontend React Native.

**Endpoint**: `POST /api/conexiones/listar-por-ciclo`
**Parámetro**: `{ id_ciclo: number }`
**Pantalla Frontend**: `src/pantallas/factura/ConexionesCicloScreen.tsx`

## Problema Actual

El frontend ya consume este endpoint, pero necesito verificar que:
1. ✅ El endpoint esté implementado correctamente
2. ✅ Devuelva TODOS los campos que el frontend necesita
3. ✅ La estructura de datos sea la correcta
4. ✅ Incluya las relaciones (cliente, servicio, router, IPs)
5. ✅ Maneje correctamente casos especiales (sin router, sin IPs)

## Estructura de Datos Requerida

El frontend espera recibir un array de conexiones con esta estructura:

```json
{
  "success": true,
  "data": [
    {
      "id_conexion": 12345,
      "id_estado_conexion": 3,
      "direccion": "Calle Principal #123, Sector Los Jardines",
      "fecha_instalacion": "2024-01-15",
      "ultima_actualizacion": "2024-11-30T10:30:00",

      "cliente": {
        "id_cliente": 456,
        "nombre": "Juan",
        "apellido": "Pérez",
        "telefono": "809-555-1234",
        "cedula": "001-1234567-8"
      },

      "servicio": {
        "id_servicio": 789,
        "nombre": "Internet 100 Mbps",
        "precio_servicio": 1200
      },

      "router": {
        "id_router": 101,
        "nombre": "RouterMikrotik-Principal"
      },

      "router_direcciones_ip": [
        {
          "id": 1,
          "ip_address": "192.168.1.100"
        }
      ],

      "estado_conexion": {
        "id_estado_conexion": 3,
        "estado": "Activa"
      }
    }
  ]
}
```

## Campos CRÍTICOS (obligatorios)

### 1. Datos de la Conexión
- `id_conexion` (number) - ID único
- `id_estado_conexion` (number) - 3=Activa, 4=Suspendida
- `direccion` (string) - Dirección física

### 2. Objeto `cliente` (obligatorio)
```json
{
  "id_cliente": number,
  "nombre": string,
  "apellido": string,
  "telefono": string,      // opcional pero recomendado
  "cedula": string         // opcional pero recomendado
}
```

### 3. Objeto `servicio` (obligatorio)
```json
{
  "id_servicio": number,
  "nombre": string,
  "precio_servicio": number  // ⚠️ IMPORTANTE: debe ser NUMBER, no string
}
```

**CRÍTICO**: El frontend calcula la suma total de `precio_servicio` con `parseFloat()`. Asegúrate que sea un número.

## Campos OPCIONALES (recomendados)

### 4. Objeto `router` (puede ser null)
```json
{
  "id_router": number,
  "nombre": string
}
```

Si la conexión no tiene router, devolver `null`.

### 5. Array `router_direcciones_ip` (puede estar vacío)
```json
[
  {
    "id": number,
    "ip_address": string
  }
]
```

Si no hay IPs, devolver `[]` (array vacío).

### 6. Objeto `estado_conexion` (opcional)
```json
{
  "id_estado_conexion": number,
  "estado": string  // "Activa", "Suspendida", etc.
}
```

## Funcionalidad del Frontend

El frontend hace lo siguiente con los datos:

### 1. **Filtros por Estado**
Filtra localmente usando:
- Activas: `id_estado_conexion === 3`
- Suspendidas: `id_estado_conexion === 4`
- Inactivas: `id_estado_conexion !== 3 && !== 4`

### 2. **Búsqueda**
Busca en estos campos (case-insensitive):
- `conexion.direccion`
- `conexion.cliente.nombre`
- `conexion.cliente.apellido`
- `conexion.router_direcciones_ip[0].ip_address` (primera IP)
- `conexion.router.nombre`

### 3. **Suma Total**
Calcula la suma de todos los `servicio.precio_servicio`:
```javascript
const total = conexiones.reduce((acc, c) => {
  return acc + parseFloat(c.servicio.precio_servicio);
}, 0);
```

### 4. **Ordenamiento**
Ordena por `id_conexion DESC` (más recientes primero).

## Query SQL Sugerida

```sql
SELECT
    c.id_conexion,
    c.id_estado_conexion,
    c.direccion,
    c.fecha_instalacion,
    c.updated_at as ultima_actualizacion,

    -- Cliente
    cl.id_cliente,
    cl.nombre as cliente_nombre,
    cl.apellido as cliente_apellido,
    cl.telefono as cliente_telefono,
    cl.cedula as cliente_cedula,

    -- Servicio
    s.id_servicio,
    s.nombre as servicio_nombre,
    s.precio as servicio_precio,  -- ⚠️ Convertir a precio_servicio

    -- Router
    r.id_router,
    r.nombre as router_nombre,

    -- Estado
    ec.estado as estado_nombre

FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
INNER JOIN clientes cl ON cl.id_cliente = c.id_cliente
INNER JOIN servicios s ON s.id_servicio = c.id_servicio
LEFT JOIN routers r ON r.id_router = c.id_router
LEFT JOIN estados_conexion ec ON ec.id_estado_conexion = c.id_estado_conexion

WHERE f.id_ciclo = ?
GROUP BY c.id_conexion
ORDER BY c.id_conexion DESC;
```

**Para las IPs** (segunda query o subconsulta):
```sql
SELECT id, ip_address
FROM router_direcciones_ip
WHERE id_conexion = ?;
```

## Casos Especiales a Manejar

### 1. Conexión sin Router
```json
{
  "router": null,
  "router_direcciones_ip": []
}
```

### 2. Conexión sin IPs
```json
{
  "router": { ... },
  "router_direcciones_ip": []
}
```

### 3. Conexión con Múltiples IPs
```json
{
  "router_direcciones_ip": [
    { "id": 1, "ip_address": "192.168.1.100" },
    { "id": 2, "ip_address": "192.168.1.101" }
  ]
}
```

El frontend solo usa la primera `[0]` para búsqueda.

## Validaciones Requeridas

1. ✅ `id_ciclo` es requerido (400 Bad Request si falta)
2. ✅ `id_ciclo` debe ser un número válido
3. ✅ Todas las conexiones deben tener cliente y servicio
4. ✅ `precio_servicio` debe ser NUMBER, no string
5. ✅ Array vacío `[]` si no hay conexiones (NO error 404)

## Respuestas de Error

### Sin parámetro
```json
{
  "success": false,
  "message": "El parámetro id_ciclo es requerido"
}
```
Status: 400

### Ciclo sin conexiones
```json
{
  "success": true,
  "data": []
}
```
Status: 200

### Error de servidor
```json
{
  "success": false,
  "message": "Error al obtener conexiones del ciclo",
  "error": "Mensaje técnico"
}
```
Status: 500

## Optimización

### Índices Recomendados
```sql
CREATE INDEX idx_facturas_ciclo ON facturas(id_ciclo);
CREATE INDEX idx_router_ips_conexion ON router_direcciones_ip(id_conexion);
```

### Performance
- Si el ciclo tiene >1000 conexiones, considera paginación
- El frontend ya maneja listas grandes con virtualización
- Considera caché de 5-10 minutos si es necesario

## IMPORTANTE: Conversión de Nombres de Campos

| Tabla BD | Nombre en BD | Frontend Espera | Acción |
|----------|--------------|-----------------|---------|
| servicios | `precio` | `precio_servicio` | Renombrar en SELECT o mapping |
| conexiones | `updated_at` | `ultima_actualizacion` | Renombrar (opcional) |

## Testing Sugerido

### 1. Ciclo con datos
```bash
curl -X POST "https://localhost:444/api/conexiones/listar-por-ciclo" \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 362070}'
```

Verificar:
- ✅ Array con conexiones
- ✅ Todos los campos presentes
- ✅ `precio_servicio` es number
- ✅ IPs en array
- ✅ Ordenado por id DESC

### 2. Ciclo sin conexiones
```bash
curl -X POST "https://localhost:444/api/conexiones/listar-por-ciclo" \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 999999}'
```

Verificar:
- ✅ `{ "success": true, "data": [] }`
- ✅ Status 200

### 3. Sin parámetro
```bash
curl -X POST "https://localhost:444/api/conexiones/listar-por-ciclo" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Verificar:
- ✅ Error 400
- ✅ Mensaje claro

## Preguntas para Ti

1. **¿El endpoint ya existe?** Si sí, ¿qué estructura devuelve actualmente?
2. **¿Hay algún problema con las queries?** (performance, timeouts, etc.)
3. **¿Las tablas tienen los nombres correctos?** (conexiones, facturas, clientes, servicios, routers, router_direcciones_ip, estados_conexion)
4. **¿Qué estados de conexión existen en tu BD?** Necesito confirmar que 3=Activa y 4=Suspendida

## Archivo de Referencia Completo

Para más detalles técnicos, queries completas y ejemplos de implementación:
**REQUERIMIENTO_BACKEND_LISTADO_CONEXIONES_CICLO.md**

---

**¿Alguna duda sobre algún campo o query?** Pregunta antes de implementar.

¡Gracias! 🚀
