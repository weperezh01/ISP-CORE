# Documentación: Endpoint de Servicios - Lista de Planes

## Endpoint Actual
`GET /api/totales-servicios/{id_isp}`

## Estructura de Datos Esperada

El frontend actualmente espera que el endpoint devuelva un objeto con la siguiente estructura:

```json
{
  "totalServicios": 25,
  "totalSuscripciones": 938,
  "precioPromedio": 850.50,
  "ingresoEstimadoMensual": 797869,
  "estadisticas": {
    "serviciosConUso": 20,
    "serviciosSinUso": 5,
    "servicioMasPopular": {
      "nombre": "Plan Premium 100 Mbps",
      "suscripciones": 350
    },
    "rangoPrecios": {
      "minimo": 200,
      "maximo": 2000
    }
  },
  "serviciosAdicionales": {
    "total": 15,
    "activos": 12,
    "inactivos": 3
  },
  "planes": [
    {
      "id": 1,
      "nombre": "Plan Premium 100 Mbps",
      "precio": 1200,
      "suscripciones": 350
    },
    {
      "id": 2,
      "nombre": "Plan Básico 50 Mbps",
      "precio": 600,
      "suscripciones": 280
    }
  ]
}
```

## NUEVO: Campo `planes` (Lista de Planes)

### Ubicación en la respuesta
El frontend busca el array de planes en cualquiera de estos campos (por orden de prioridad):
1. `body.servicios`
2. `body.planes` ⭐ **RECOMENDADO**
3. `body.listadoServicios`
4. `body.listado_servicios`

### Estructura de cada plan
```typescript
{
  id: number | string;          // ID único del plan
  nombre: string;               // Nombre del plan
  precio: number;               // Precio mensual
  suscripciones: number;        // Número de suscriptores/conexiones activas
}
```

### Campos alternativos soportados
El frontend soporta diferentes nombres de campos por flexibilidad:

**Para ID:**
- `id` ⭐ (recomendado)
- `id_servicio`
- `id_plan`

**Para nombre:**
- `nombre` ⭐ (recomendado)
- `descripcion`

**Para precio:**
- `precio` ⭐ (recomendado)
- `precio_mensual`
- `costo`

**Para suscripciones:**
- `suscripciones` ⭐ (recomendado)
- `conexiones`
- `cantidad_suscripciones`

### Ejemplo de respuesta del backend

#### Opción 1: Campo `planes` (Recomendado)
```json
{
  "totalServicios": 25,
  "totalSuscripciones": 938,
  "precioPromedio": 850.50,
  "ingresoEstimadoMensual": 797869,
  "estadisticas": { ... },
  "serviciosAdicionales": { ... },
  "planes": [
    {
      "id": 1,
      "nombre": "Plan Premium 100 Mbps",
      "precio": 1200,
      "suscripciones": 350
    },
    {
      "id": 2,
      "nombre": "Plan Básico 50 Mbps",
      "precio": 600,
      "suscripciones": 280
    },
    {
      "id": 3,
      "nombre": "Plan Gold 200 Mbps",
      "precio": 1800,
      "suscripciones": 150
    },
    {
      "id": 4,
      "nombre": "Plan Silver 75 Mbps",
      "precio": 800,
      "suscripciones": 120
    },
    {
      "id": 5,
      "nombre": "Plan Empresarial",
      "precio": 3000,
      "suscripciones": 38
    }
  ]
}
```

#### Opción 2: Campo `servicios` (Alternativo)
```json
{
  "totalServicios": 25,
  "totalSuscripciones": 938,
  "servicios": [
    {
      "id_servicio": 1,
      "descripcion": "Plan Premium 100 Mbps",
      "precio_mensual": 1200,
      "conexiones": 350
    }
  ]
}
```

## Comportamiento del Frontend

### Visualización
El frontend mostrará:
- **Top 4 planes** ordenados por número de suscripciones (mayor a menor)
- Para cada plan:
  - Nombre del plan (truncado si es muy largo)
  - Precio formateado (ej: $1,200)
  - Número de suscripciones
  - Porcentaje respecto al total de suscripciones (ej: 37.3%)

### Estado sin datos
Si el array de planes viene vacío o no existe:
- Se muestra el mensaje: "No hay información de planes disponible"
- No se rompe la aplicación

### Logs de debugging
El frontend registra en consola:
```
✅ Totales servicios: { totalServicios: 25, totalSuscripciones: 938, totalPlanes: 5 }
📋 Planes recibidos del backend: [array de planes]
📊 Primeros 3 planes: [primeros 3 elementos del array]
```

## Query SQL Sugerida

```sql
SELECT
    s.id,
    s.nombre,
    s.precio,
    COUNT(c.id) as suscripciones
FROM servicios s
LEFT JOIN conexiones c ON c.id_servicio = s.id
    AND c.id_isp = ?
    AND c.estado IN (3, 4)  -- Activas y suspendidas
WHERE s.id_isp = ?
    AND s.activo = 1
GROUP BY s.id, s.nombre, s.precio
ORDER BY suscripciones DESC;
```

## Implementación Backend Recomendada

### PHP/Laravel Ejemplo
```php
public function getTotalesServicios($idIsp) {
    // Obtener totales existentes
    $totales = $this->calcularTotales($idIsp);

    // Obtener lista de planes con suscripciones
    $planes = DB::table('servicios as s')
        ->leftJoin('conexiones as c', function($join) use ($idIsp) {
            $join->on('c.id_servicio', '=', 's.id')
                 ->where('c.id_isp', '=', $idIsp)
                 ->whereIn('c.estado', [3, 4]); // Activas y suspendidas
        })
        ->where('s.id_isp', $idIsp)
        ->where('s.activo', 1)
        ->select(
            's.id',
            's.nombre',
            's.precio',
            DB::raw('COUNT(c.id) as suscripciones')
        )
        ->groupBy('s.id', 's.nombre', 's.precio')
        ->orderByDesc('suscripciones')
        ->get();

    return [
        'totalServicios' => $totales->total,
        'totalSuscripciones' => $totales->suscripciones,
        'precioPromedio' => $totales->precio_promedio,
        'ingresoEstimadoMensual' => $totales->ingreso_mensual,
        'estadisticas' => $totales->estadisticas,
        'serviciosAdicionales' => $totales->adicionales,
        'planes' => $planes  // ⭐ NUEVO CAMPO
    ];
}
```

### Node.js/Express Ejemplo
```javascript
router.get('/totales-servicios/:id_isp', async (req, res) => {
    const { id_isp } = req.params;

    // Obtener totales existentes
    const totales = await calcularTotales(id_isp);

    // Obtener lista de planes con suscripciones
    const planes = await db.query(`
        SELECT
            s.id,
            s.nombre,
            s.precio,
            COUNT(c.id) as suscripciones
        FROM servicios s
        LEFT JOIN conexiones c ON c.id_servicio = s.id
            AND c.id_isp = ?
            AND c.estado IN (3, 4)
        WHERE s.id_isp = ?
            AND s.activo = 1
        GROUP BY s.id, s.nombre, s.precio
        ORDER BY suscripciones DESC
    `, [id_isp, id_isp]);

    res.json({
        ...totales,
        planes  // ⭐ NUEVO CAMPO
    });
});
```

## Notas Importantes

1. **Performance**: Considera agregar índices en `conexiones.id_servicio`, `conexiones.id_isp` y `conexiones.estado` para mejorar el rendimiento.

2. **Estados de conexión**: El frontend no hace suposiciones sobre qué estados son "activos". Asegúrate de filtrar correctamente en el backend.

3. **Planes sin suscriptores**: Está bien incluir planes con 0 suscripciones. El frontend los mostrará si están entre los top 4.

4. **Caché**: Considera implementar caché para este endpoint si la tabla de planes/conexiones es muy grande.

5. **Paginación**: Actualmente el frontend solo muestra 4 planes. Si en el futuro se necesita ver más, considera agregar paginación.

## Testing

### Caso 1: ISP con planes
```bash
curl -X GET "https://wellnet-rd.com:444/api/totales-servicios/12" \
  -H "Authorization: Bearer {token}"
```

Respuesta esperada: Array `planes` con al menos 1 elemento

### Caso 2: ISP sin planes
```bash
curl -X GET "https://wellnet-rd.com:444/api/totales-servicios/99" \
  -H "Authorization: Bearer {token}"
```

Respuesta esperada: Array `planes` vacío `[]`

### Caso 3: Verificar estructura
```javascript
// En el frontend, verificar en consola:
console.log('📋 Planes recibidos del backend:', planes);
console.log('📊 Primeros 3 planes:', planes.slice(0, 3));
```

## Estado Actual

❌ **Campo `planes` NO implementado en el backend**

El frontend está preparado para recibir el array de planes, pero el backend aún no lo está devolviendo. Actualmente muestra:
```
"No hay información de planes disponible"
```

## Próximos Pasos

1. Implementar el query SQL para obtener la lista de planes con sus suscripciones
2. Agregar el campo `planes` a la respuesta del endpoint `/api/totales-servicios/{id_isp}`
3. Probar con diferentes ISPs para verificar que los datos sean correctos
4. Verificar que el frontend muestre correctamente los planes
