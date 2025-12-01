# Documentación: Endpoint de Listado de Conexiones por Ciclo

## Endpoint Actual
`POST /api/conexiones/listar-por-ciclo`

## Ubicación en Frontend
**Pantalla**: `src/pantallas/factura/ConexionesCicloScreen.tsx`
**Función**: `fetchConexionesCiclo()` (líneas 35-69)
**Navegación**: Desde DetalleCiclo → Al hacer clic en tarjeta "Estadísticas de Conexiones"

## Contexto del Problema

La pantalla ConexionesCicloScreen muestra el listado completo de conexiones de un ciclo específico con:
- Filtros por estado (Total, Activas, Suspendidas, Inactivas)
- Búsqueda por dirección, cliente, IP, router
- Suma total de ingresos mensuales
- Navegación a detalles de cada conexión

**Necesitamos asegurarnos que el backend devuelva TODOS los datos necesarios** para que la pantalla funcione correctamente.

## Datos que el Frontend Actualmente Espera

### Request
```json
{
  "id_ciclo": 362070
}
```

### Response Esperada
```json
{
  "success": true,
  "data": [
    {
      "id_conexion": 12345,
      "id_estado_conexion": 3,
      "direccion": "Calle Principal #123, Sector Los Jardines",
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
      },
      "fecha_instalacion": "2024-01-15",
      "ultima_actualizacion": "2024-11-30T10:30:00"
    }
  ]
}
```

## Estructura Detallada de Cada Conexión

### Campos Requeridos (CRÍTICOS)

| Campo | Tipo | Descripción | Uso en Frontend |
|-------|------|-------------|-----------------|
| `id_conexion` | number | ID único de la conexión | Navegación a detalles, key en FlatList |
| `id_estado_conexion` | number | ID del estado (3=Activa, 4=Suspendida) | Filtros por estado, colores visuales |
| `direccion` | string | Dirección física de instalación | Búsqueda, mostrar en card |
| `cliente` | object | Datos del cliente | Mostrar nombre, búsqueda |
| `servicio` | object | Datos del plan/servicio | Calcular suma total, mostrar plan |

### Campos Opcionales (Recomendados)

| Campo | Tipo | Descripción | Uso en Frontend |
|-------|------|-------------|-----------------|
| `router` | object | Datos del router | Búsqueda, mostrar equipo |
| `router_direcciones_ip` | array | IPs asignadas | Búsqueda, mostrar IP |
| `estado_conexion` | object | Nombre del estado | Mostrar estado legible |
| `fecha_instalacion` | string | Fecha de instalación | Información adicional |
| `ultima_actualizacion` | string | Última modificación | Información adicional |

### Estructura de Objetos Anidados

#### `cliente` (Objeto)
```typescript
{
  id_cliente: number;           // ID del cliente
  nombre: string;               // Nombre del cliente
  apellido: string;             // Apellido del cliente
  telefono?: string;            // Teléfono (opcional)
  cedula?: string;              // Cédula/RNC (opcional)
}
```

#### `servicio` (Objeto)
```typescript
{
  id_servicio: number;          // ID del servicio/plan
  nombre: string;               // Nombre del plan
  precio_servicio: number;      // Precio mensual
  velocidad?: string;           // Velocidad (opcional, ej: "100 Mbps")
}
```

#### `router` (Objeto - Opcional)
```typescript
{
  id_router: number;            // ID del router
  nombre: string;               // Nombre/identificador del router
  ip_mikrotik?: string;         // IP del MikroTik
}
```

#### `router_direcciones_ip` (Array - Opcional)
```typescript
[
  {
    id: number;                 // ID de la asignación IP
    ip_address: string;         // Dirección IP asignada
  }
]
```

#### `estado_conexion` (Objeto - Opcional)
```typescript
{
  id_estado_conexion: number;   // ID del estado
  estado: string;               // Nombre del estado ("Activa", "Suspendida", etc.)
  color?: string;               // Color para UI (opcional)
}
```

## Funcionalidad del Frontend

### 1. Filtros por Estado

El frontend filtra localmente por:
- **Total**: Todas las conexiones
- **Activas**: `id_estado_conexion === 3`
- **Suspendidas**: `id_estado_conexion === 4`
- **Inactivas**: `id_estado_conexion !== 3 && id_estado_conexion !== 4`

**Valores de estados según `ESTADOS_CONEXION`:**
```javascript
ESTADOS_CONEXION = {
  ACTIVA: 3,
  SUSPENDIDA: 4
}
```

### 2. Búsqueda

El frontend busca en:
- `conexion.direccion`
- `conexion.cliente.nombre`
- `conexion.cliente.apellido`
- `conexion.router_direcciones_ip[0].ip_address`
- `conexion.router.nombre`

**Búsqueda case-insensitive** con `toLowerCase()` y `includes()`.

### 3. Suma Total

Calcula la suma de todos los `servicio.precio_servicio` de las conexiones filtradas:

```javascript
const totalMonthlySum = filteredConnectionList.reduce((acc, c) => {
  const precio = c.servicio?.precio_servicio ? parseFloat(c.servicio.precio_servicio) : 0;
  return acc + precio;
}, 0);
```

Mostrado en header con formato de moneda.

### 4. Visualización

Cada conexión se muestra con `ConnectionItemModern` component que usa:
- `item.id_conexion`
- `item.direccion`
- `item.cliente.nombre + apellido`
- `item.servicio.nombre`
- `item.servicio.precio_servicio`
- `item.id_estado_conexion` (para colores)
- `item.router_direcciones_ip[0].ip_address` (si existe)

### 5. Navegación

Al tocar una conexión:
```javascript
navigation.navigate('ConexionDetalles', {
  connectionId: connection.id_conexion,
  id_cliente: connection.cliente?.id_cliente || connection.id_cliente
});
```

## Query SQL Sugerida

### Obtener Conexiones del Ciclo

```sql
SELECT
    c.id_conexion,
    c.id_estado_conexion,
    c.direccion,
    c.fecha_instalacion,
    c.updated_at as ultima_actualizacion,

    -- Datos del cliente
    cl.id_cliente,
    cl.nombre as cliente_nombre,
    cl.apellido as cliente_apellido,
    cl.telefono as cliente_telefono,
    cl.cedula as cliente_cedula,

    -- Datos del servicio
    s.id_servicio,
    s.nombre as servicio_nombre,
    s.precio as servicio_precio,

    -- Datos del router
    r.id_router,
    r.nombre as router_nombre,
    r.ip_mikrotik,

    -- Estado de conexión
    ec.id_estado_conexion,
    ec.estado as estado_nombre,

    -- Primera IP asignada
    (SELECT ip_address
     FROM router_direcciones_ip rip
     WHERE rip.id_conexion = c.id_conexion
     LIMIT 1) as primera_ip

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

**Nota**: Si una conexión puede tener múltiples IPs, deberás hacer un JOIN adicional o una subconsulta para obtenerlas todas.

### Query Alternativa con Todas las IPs

```sql
-- Primero obtener las conexiones
SELECT
    c.id_conexion,
    c.id_estado_conexion,
    c.direccion,
    -- ... resto de campos ...
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = ?
GROUP BY c.id_conexion;

-- Luego para cada conexión, obtener sus IPs:
SELECT
    id,
    ip_address
FROM router_direcciones_ip
WHERE id_conexion = ?;
```

## Implementación Backend Recomendada

### PHP/Laravel Ejemplo

```php
public function listarConexionesPorCiclo(Request $request) {
    $idCiclo = $request->input('id_ciclo');

    if (!$idCiclo) {
        return response()->json([
            'success' => false,
            'message' => 'El parámetro id_ciclo es requerido'
        ], 400);
    }

    // Obtener conexiones del ciclo
    $conexiones = DB::table('conexiones as c')
        ->join('facturas as f', 'f.id_conexion', '=', 'c.id_conexion')
        ->join('clientes as cl', 'cl.id_cliente', '=', 'c.id_cliente')
        ->join('servicios as s', 's.id_servicio', '=', 'c.id_servicio')
        ->leftJoin('routers as r', 'r.id_router', '=', 'c.id_router')
        ->leftJoin('estados_conexion as ec', 'ec.id_estado_conexion', '=', 'c.id_estado_conexion')
        ->where('f.id_ciclo', $idCiclo)
        ->select(
            'c.id_conexion',
            'c.id_estado_conexion',
            'c.direccion',
            'c.fecha_instalacion',
            'c.updated_at as ultima_actualizacion',
            'cl.id_cliente',
            'cl.nombre as cliente_nombre',
            'cl.apellido as cliente_apellido',
            'cl.telefono as cliente_telefono',
            'cl.cedula as cliente_cedula',
            's.id_servicio',
            's.nombre as servicio_nombre',
            's.precio as servicio_precio',
            'r.id_router',
            'r.nombre as router_nombre',
            'ec.estado as estado_nombre'
        )
        ->groupBy('c.id_conexion')
        ->orderByDesc('c.id_conexion')
        ->get();

    // Para cada conexión, obtener sus IPs
    $result = $conexiones->map(function($conexion) {
        $ips = DB::table('router_direcciones_ip')
            ->where('id_conexion', $conexion->id_conexion)
            ->select('id', 'ip_address')
            ->get();

        return [
            'id_conexion' => $conexion->id_conexion,
            'id_estado_conexion' => $conexion->id_estado_conexion,
            'direccion' => $conexion->direccion,
            'fecha_instalacion' => $conexion->fecha_instalacion,
            'ultima_actualizacion' => $conexion->ultima_actualizacion,
            'cliente' => [
                'id_cliente' => $conexion->id_cliente,
                'nombre' => $conexion->cliente_nombre,
                'apellido' => $conexion->cliente_apellido,
                'telefono' => $conexion->cliente_telefono,
                'cedula' => $conexion->cliente_cedula
            ],
            'servicio' => [
                'id_servicio' => $conexion->id_servicio,
                'nombre' => $conexion->servicio_nombre,
                'precio_servicio' => (float)$conexion->servicio_precio
            ],
            'router' => $conexion->id_router ? [
                'id_router' => $conexion->id_router,
                'nombre' => $conexion->router_nombre
            ] : null,
            'router_direcciones_ip' => $ips->toArray(),
            'estado_conexion' => [
                'id_estado_conexion' => $conexion->id_estado_conexion,
                'estado' => $conexion->estado_nombre
            ]
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $result
    ]);
}
```

### Node.js/Express Ejemplo

```javascript
router.post('/conexiones/listar-por-ciclo', async (req, res) => {
    const { id_ciclo } = req.body;

    if (!id_ciclo) {
        return res.status(400).json({
            success: false,
            message: 'El parámetro id_ciclo es requerido'
        });
    }

    try {
        // Obtener conexiones
        const conexiones = await db.query(`
            SELECT
                c.id_conexion,
                c.id_estado_conexion,
                c.direccion,
                c.fecha_instalacion,
                c.updated_at as ultima_actualizacion,
                cl.id_cliente,
                cl.nombre as cliente_nombre,
                cl.apellido as cliente_apellido,
                cl.telefono as cliente_telefono,
                cl.cedula as cliente_cedula,
                s.id_servicio,
                s.nombre as servicio_nombre,
                s.precio as servicio_precio,
                r.id_router,
                r.nombre as router_nombre,
                ec.estado as estado_nombre
            FROM conexiones c
            INNER JOIN facturas f ON f.id_conexion = c.id_conexion
            INNER JOIN clientes cl ON cl.id_cliente = c.id_cliente
            INNER JOIN servicios s ON s.id_servicio = c.id_servicio
            LEFT JOIN routers r ON r.id_router = c.id_router
            LEFT JOIN estados_conexion ec ON ec.id_estado_conexion = c.id_estado_conexion
            WHERE f.id_ciclo = ?
            GROUP BY c.id_conexion
            ORDER BY c.id_conexion DESC
        `, [id_ciclo]);

        // Para cada conexión, obtener IPs
        const result = await Promise.all(conexiones.map(async (conexion) => {
            const ips = await db.query(`
                SELECT id, ip_address
                FROM router_direcciones_ip
                WHERE id_conexion = ?
            `, [conexion.id_conexion]);

            return {
                id_conexion: conexion.id_conexion,
                id_estado_conexion: conexion.id_estado_conexion,
                direccion: conexion.direccion,
                fecha_instalacion: conexion.fecha_instalacion,
                ultima_actualizacion: conexion.ultima_actualizacion,
                cliente: {
                    id_cliente: conexion.id_cliente,
                    nombre: conexion.cliente_nombre,
                    apellido: conexion.cliente_apellido,
                    telefono: conexion.cliente_telefono,
                    cedula: conexion.cliente_cedula
                },
                servicio: {
                    id_servicio: conexion.id_servicio,
                    nombre: conexion.servicio_nombre,
                    precio_servicio: parseFloat(conexion.servicio_precio)
                },
                router: conexion.id_router ? {
                    id_router: conexion.id_router,
                    nombre: conexion.router_nombre
                } : null,
                router_direcciones_ip: ips,
                estado_conexion: {
                    id_estado_conexion: conexion.id_estado_conexion,
                    estado: conexion.estado_nombre
                }
            };
        }));

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error al listar conexiones por ciclo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener conexiones del ciclo',
            error: error.message
        });
    }
});
```

## Casos de Uso Especiales

### 1. Conexión sin Router
Si una conexión no tiene router asignado, devolver `null`:
```json
{
  "router": null,
  "router_direcciones_ip": []
}
```

### 2. Conexión sin IPs Asignadas
Si no hay IPs asignadas, devolver array vacío:
```json
{
  "router_direcciones_ip": []
}
```

### 3. Múltiples IPs
Si una conexión tiene varias IPs, devolver todas:
```json
{
  "router_direcciones_ip": [
    { "id": 1, "ip_address": "192.168.1.100" },
    { "id": 2, "ip_address": "192.168.1.101" }
  ]
}
```

**Nota**: El frontend solo usa la primera IP `[0]` para búsqueda y visualización.

## Estados de Conexión

Verifica que los IDs de estados coincidan:

| ID | Estado | Descripción |
|----|--------|-------------|
| 3 | Activa | Conexión funcionando normalmente |
| 4 | Suspendida | Conexión suspendida por falta de pago |
| 1 | Pendiente | Pendiente de instalación |
| 2 | Desconectada | Desconectada temporalmente |
| 5 | Cancelada | Cancelada definitivamente |

**CRÍTICO**: El frontend usa `id_estado_conexion === 3` para ACTIVA y `=== 4` para SUSPENDIDA.

## Performance y Optimización

### Índices Recomendados

```sql
-- Para búsqueda por ciclo
CREATE INDEX idx_facturas_ciclo ON facturas(id_ciclo);

-- Para JOINs
CREATE INDEX idx_conexiones_cliente ON conexiones(id_cliente);
CREATE INDEX idx_conexiones_servicio ON conexiones(id_servicio);
CREATE INDEX idx_conexiones_router ON conexiones(id_router);
CREATE INDEX idx_conexiones_estado ON conexiones(id_estado_conexion);

-- Para IPs
CREATE INDEX idx_router_ips_conexion ON router_direcciones_ip(id_conexion);
```

### Caché

Considera implementar caché si:
- El ciclo tiene muchas conexiones (>1000)
- La pantalla se accede frecuentemente
- Los datos no cambian constantemente

**TTL sugerido**: 5-10 minutos

### Paginación

Si hay ciclos con miles de conexiones, considera:
- Implementar paginación en el backend
- Limit/Offset o cursor-based pagination
- El frontend ya maneja grandes listas con `FlatList` virtualizado

## Testing

### Caso 1: Ciclo con conexiones
```bash
curl -X POST "https://wellnet-rd.com:444/api/conexiones/listar-por-ciclo" \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 362070}'
```

Respuesta esperada: Array con conexiones completas

### Caso 2: Ciclo sin conexiones
```bash
curl -X POST "https://wellnet-rd.com:444/api/conexiones/listar-por-ciclo" \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 999999}'
```

Respuesta esperada: Array vacío `[]`

### Caso 3: Sin parámetro
```bash
curl -X POST "https://wellnet-rd.com:444/api/conexiones/listar-por-ciclo" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Respuesta esperada: Error 400 con mensaje

## Validaciones

### Backend debe validar:
1. ✅ `id_ciclo` es requerido
2. ✅ `id_ciclo` es un número válido
3. ✅ El ciclo existe en la base de datos
4. ✅ Todas las conexiones tienen cliente y servicio
5. ✅ Los precios son números válidos (float)

### Manejo de Errores

```json
{
  "success": false,
  "message": "Mensaje descriptivo del error",
  "error": "Detalle técnico (solo en desarrollo)"
}
```

## Notas Importantes

1. **ORDER BY**: El frontend espera el array ordenado por `id_conexion DESC` (más recientes primero)

2. **GROUP BY**: Usar `GROUP BY c.id_conexion` para evitar duplicados si hay múltiples facturas

3. **JOINS**: Usar `LEFT JOIN` para router y estados_conexion por si no existen

4. **Tipos de Datos**:
   - `precio_servicio` debe ser `number` (float), no string
   - `id_conexion`, `id_cliente`, etc. deben ser `number`, no string

5. **Valores NULL**:
   - Si un campo es NULL en BD, puedes devolver `null` o un valor por defecto
   - El frontend usa optional chaining (`?.`) para manejar nulls

6. **Nombres de Campos**:
   - Backend: `precio` (tabla servicios)
   - Frontend espera: `precio_servicio`
   - **Hacer la conversión en el SELECT o en el mapping**

## Estado Actual

❓ **Verificar si el endpoint existe y funciona correctamente**

Necesitamos confirmar:
1. ¿El endpoint `/api/conexiones/listar-por-ciclo` existe?
2. ¿Devuelve la estructura correcta?
3. ¿Incluye todos los campos necesarios?
4. ¿Las relaciones (JOINs) están correctas?
5. ¿Maneja correctamente conexiones sin router o sin IPs?

## Próximos Pasos

1. **Verificar implementación actual del backend**
2. **Ajustar query SQL si es necesario**
3. **Asegurar que todos los campos estén presentes**
4. **Probar con diferentes ciclos**
5. **Optimizar performance si es necesario**

---

**Referencia Frontend**: `src/pantallas/factura/ConexionesCicloScreen.tsx`
**Relacionado con**: `POST /api/conexiones/estadisticas-por-ciclo`
