# Documentación: Endpoint de Estadísticas de Conexiones por Ciclo

## Endpoint Actual
`POST /api/conexiones/estadisticas-por-ciclo`

## Ubicación en Frontend
**Pantalla**: `src/pantallas/factura/DetalleCiclo.tsx`
**Tarjeta**: "Estadísticas de Conexiones" (líneas 637-678)
**Navegación**: Al hacer clic en la tarjeta, lleva a `ConexionesCicloScreen` con el listado completo

## Contexto del Problema

Actualmente la tarjeta de "Estadísticas de Conexiones" en la pantalla DetalleCiclo muestra información muy básica:
- Total de conexiones
- Conexiones activas
- Conexiones suspendidas
- Conexiones inactivas

**El usuario quiere darle funcionalidad al 100%** a esta tarjeta, mostrando información más completa y útil para la toma de decisiones.

## Datos que Actualmente Recibe el Frontend

```javascript
{
  totalConexiones: 0,
  conexionesActivas: 0,
  conexionesSuspendidas: 0,
  conexionesInactivas: 0,
  detalleEstados: []  // ⚠️ Este campo existe pero no se está usando
}
```

## NUEVO: Estructura de Datos Completa Requerida

El frontend necesita recibir una respuesta mucho más completa y detallada:

```json
{
  "success": true,
  "data": {
    "resumen": {
      "totalConexiones": 938,
      "conexionesActivas": 650,
      "conexionesSuspendidas": 200,
      "conexionesInactivas": 88,
      "conexionesMorosas": 180,
      "conexionesAlDia": 758,
      "porcentajeActivas": 69.3,
      "porcentajeSuspendidas": 21.3,
      "porcentajeInactivas": 9.4
    },
    "detalleEstados": [
      {
        "id_estado": 3,
        "nombre_estado": "Activa",
        "cantidad": 650,
        "porcentaje": 69.3,
        "color": "#10B981"
      },
      {
        "id_estado": 4,
        "nombre_estado": "Suspendida",
        "cantidad": 200,
        "porcentaje": 21.3,
        "color": "#F59E0B"
      },
      {
        "id_estado": 2,
        "nombre_estado": "Desconectada",
        "cantidad": 50,
        "porcentaje": 5.3,
        "color": "#6B7280"
      },
      {
        "id_estado": 1,
        "nombre_estado": "Pendiente de instalación",
        "cantidad": 38,
        "porcentaje": 4.1,
        "color": "#3B82F6"
      }
    ],
    "financiero": {
      "ingresosPotencialesMensual": 797869,
      "ingresosPerdidosPorSuspension": 85000,
      "ingresosPerdidosPorInactivas": 12000,
      "porcentajeIngresosPerdidos": 12.2
    },
    "morosidad": {
      "totalMorosos": 180,
      "porcentajeMorosos": 19.2,
      "deudaTotal": 156000,
      "promedioDiasMora": 15
    },
    "tendencias": {
      "cambioVsCicloAnterior": {
        "totalConexiones": 25,
        "porcentajeCambio": 2.7,
        "direccion": "aumento"
      },
      "nuevosCiclo": 42,
      "bajasCiclo": 17
    },
    "alertas": [
      {
        "tipo": "warning",
        "mensaje": "180 conexiones morosas (19.2%)",
        "prioridad": "alta"
      },
      {
        "tipo": "info",
        "mensaje": "42 nuevas conexiones este ciclo",
        "prioridad": "media"
      }
    ]
  }
}
```

## Campos Detallados

### 1. `resumen` (Objeto)
Resumen general de las conexiones:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `totalConexiones` | number | Total de conexiones en el ciclo | 938 |
| `conexionesActivas` | number | Conexiones con estado "Activa" (id_estado = 3) | 650 |
| `conexionesSuspendidas` | number | Conexiones con estado "Suspendida" (id_estado = 4) | 200 |
| `conexionesInactivas` | number | Conexiones con otros estados (desconectadas, pendientes, etc.) | 88 |
| `conexionesMorosas` | number | Conexiones con facturas pendientes de pago | 180 |
| `conexionesAlDia` | number | Conexiones sin deudas | 758 |
| `porcentajeActivas` | number | % de activas sobre total | 69.3 |
| `porcentajeSuspendidas` | number | % de suspendidas sobre total | 21.3 |
| `porcentajeInactivas` | number | % de inactivas sobre total | 9.4 |

### 2. `detalleEstados` (Array)
Desglose detallado por cada estado de conexión:

```typescript
type EstadoDetalle = {
  id_estado: number;           // ID del estado en la BD
  nombre_estado: string;       // Nombre legible del estado
  cantidad: number;            // Cantidad de conexiones en ese estado
  porcentaje: number;          // Porcentaje sobre el total
  color: string;               // Color hex para visualización (opcional)
}
```

**Incluir TODOS los estados**, no solo activa/suspendida/inactiva. Ejemplos:
- Pendiente de instalación
- Activa
- Desconectada
- Suspendida
- Cancelada
- etc.

### 3. `financiero` (Objeto)
Impacto financiero de las conexiones:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `ingresosPotencialesMensual` | number | Suma de precios de todas las conexiones activas y suspendidas | 797869 |
| `ingresosPerdidosPorSuspension` | number | Suma de precios de conexiones suspendidas | 85000 |
| `ingresosPerdidosPorInactivas` | number | Suma de precios de conexiones inactivas | 12000 |
| `porcentajeIngresosPerdidos` | number | % de ingresos perdidos sobre potencial | 12.2 |

### 4. `morosidad` (Objeto)
Información sobre morosidad:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `totalMorosos` | number | Conexiones con facturas pendientes de pago | 180 |
| `porcentajeMorosos` | number | % de morosos sobre total | 19.2 |
| `deudaTotal` | number | Suma total de deudas pendientes | 156000 |
| `promedioDiasMora` | number | Promedio de días de atraso en pago | 15 |

### 5. `tendencias` (Objeto)
Comparación con ciclos anteriores:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `cambioVsCicloAnterior.totalConexiones` | number | Diferencia de conexiones vs ciclo anterior | 25 |
| `cambioVsCicloAnterior.porcentajeCambio` | number | % de cambio vs ciclo anterior | 2.7 |
| `cambioVsCicloAnterior.direccion` | string | "aumento" o "disminucion" | "aumento" |
| `nuevosCiclo` | number | Nuevas conexiones en este ciclo | 42 |
| `bajasCiclo` | number | Bajas/cancelaciones en este ciclo | 17 |

### 6. `alertas` (Array)
Alertas y notificaciones importantes:

```typescript
type Alerta = {
  tipo: 'warning' | 'error' | 'info' | 'success';
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
}
```

Ejemplos de alertas útiles:
- Alto porcentaje de morosidad (>15%)
- Aumento significativo de suspensiones
- Muchas nuevas conexiones
- Tendencia negativa vs ciclo anterior
- etc.

## Queries SQL Sugeridas

### Query Principal: Resumen de Estados

```sql
SELECT
    COUNT(*) as total_conexiones,
    SUM(CASE WHEN c.id_estado_conexion = 3 THEN 1 ELSE 0 END) as conexiones_activas,
    SUM(CASE WHEN c.id_estado_conexion = 4 THEN 1 ELSE 0 END) as conexiones_suspendidas,
    SUM(CASE WHEN c.id_estado_conexion NOT IN (3, 4) THEN 1 ELSE 0 END) as conexiones_inactivas,
    ROUND(SUM(CASE WHEN c.id_estado_conexion = 3 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as porcentaje_activas,
    ROUND(SUM(CASE WHEN c.id_estado_conexion = 4 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as porcentaje_suspendidas,
    ROUND(SUM(CASE WHEN c.id_estado_conexion NOT IN (3, 4) THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as porcentaje_inactivas
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = ?
GROUP BY f.id_ciclo;
```

### Query: Detalle por Estado

```sql
SELECT
    ec.id_estado_conexion,
    ec.nombre as nombre_estado,
    COUNT(c.id_conexion) as cantidad,
    ROUND(COUNT(c.id_conexion) * 100.0 / (
        SELECT COUNT(*)
        FROM conexiones c2
        INNER JOIN facturas f2 ON f2.id_conexion = c2.id_conexion
        WHERE f2.id_ciclo = ?
    ), 1) as porcentaje
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
INNER JOIN estados_conexion ec ON ec.id_estado_conexion = c.id_estado_conexion
WHERE f.id_ciclo = ?
GROUP BY ec.id_estado_conexion, ec.nombre
ORDER BY cantidad DESC;
```

### Query: Información Financiera

```sql
SELECT
    SUM(CASE WHEN c.id_estado_conexion IN (3, 4) THEN s.precio ELSE 0 END) as ingresos_potenciales,
    SUM(CASE WHEN c.id_estado_conexion = 4 THEN s.precio ELSE 0 END) as ingresos_perdidos_suspension,
    SUM(CASE WHEN c.id_estado_conexion NOT IN (3, 4) THEN s.precio ELSE 0 END) as ingresos_perdidos_inactivas
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
INNER JOIN servicios s ON s.id_servicio = c.id_servicio
WHERE f.id_ciclo = ?;
```

### Query: Morosidad

```sql
SELECT
    COUNT(DISTINCT c.id_conexion) as total_morosos,
    ROUND(COUNT(DISTINCT c.id_conexion) * 100.0 / (
        SELECT COUNT(DISTINCT c2.id_conexion)
        FROM conexiones c2
        INNER JOIN facturas f2 ON f2.id_conexion = c2.id_conexion
        WHERE f2.id_ciclo = ?
    ), 1) as porcentaje_morosos,
    SUM(f.total) as deuda_total,
    AVG(DATEDIFF(CURDATE(), f.fecha_vencimiento)) as promedio_dias_mora
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = ?
  AND f.estado_factura = 'pendiente'
  AND f.fecha_vencimiento < CURDATE();
```

### Query: Tendencias (Comparación con Ciclo Anterior)

```sql
-- Obtener el ciclo anterior
WITH ciclo_actual AS (
    SELECT * FROM ciclos WHERE id_ciclo = ?
),
ciclo_anterior AS (
    SELECT * FROM ciclos
    WHERE dia_de_mes = (SELECT dia_de_mes FROM ciclo_actual)
      AND inicio < (SELECT inicio FROM ciclo_actual)
    ORDER BY inicio DESC
    LIMIT 1
)

-- Comparar totales
SELECT
    (SELECT COUNT(DISTINCT c.id_conexion)
     FROM conexiones c
     INNER JOIN facturas f ON f.id_conexion = c.id_conexion
     WHERE f.id_ciclo = ?) as total_actual,

    (SELECT COUNT(DISTINCT c.id_conexion)
     FROM conexiones c
     INNER JOIN facturas f ON f.id_conexion = c.id_conexion
     WHERE f.id_ciclo = (SELECT id_ciclo FROM ciclo_anterior)) as total_anterior;
```

### Query: Nuevas Conexiones y Bajas del Ciclo

```sql
-- Nuevas conexiones
SELECT COUNT(*) as nuevos_ciclo
FROM conexiones c
WHERE c.fecha_creacion BETWEEN
    (SELECT inicio FROM ciclos WHERE id_ciclo = ?) AND
    (SELECT final FROM ciclos WHERE id_ciclo = ?);

-- Bajas del ciclo
SELECT COUNT(*) as bajas_ciclo
FROM conexiones c
WHERE c.id_estado_conexion = 5  -- Cancelada/Desconectada definitivamente
  AND c.fecha_actualizacion BETWEEN
    (SELECT inicio FROM ciclos WHERE id_ciclo = ?) AND
    (SELECT final FROM ciclos WHERE id_ciclo = ?);
```

## Implementación Backend Recomendada

### PHP/Laravel Ejemplo

```php
public function obtenerEstadisticasConexionesPorCiclo(Request $request) {
    $idCiclo = $request->input('id_ciclo');

    // Obtener resumen
    $resumen = $this->obtenerResumenConexiones($idCiclo);

    // Obtener detalle por estados
    $detalleEstados = $this->obtenerDetalleEstados($idCiclo);

    // Obtener información financiera
    $financiero = $this->obtenerInfoFinanciera($idCiclo);

    // Obtener morosidad
    $morosidad = $this->obtenerMorosidad($idCiclo);

    // Obtener tendencias
    $tendencias = $this->obtenerTendencias($idCiclo);

    // Generar alertas
    $alertas = $this->generarAlertas($resumen, $morosidad, $tendencias);

    return response()->json([
        'success' => true,
        'data' => [
            'resumen' => $resumen,
            'detalleEstados' => $detalleEstados,
            'financiero' => $financiero,
            'morosidad' => $morosidad,
            'tendencias' => $tendencias,
            'alertas' => $alertas
        ]
    ]);
}

private function generarAlertas($resumen, $morosidad, $tendencias) {
    $alertas = [];

    // Alerta de morosidad alta
    if ($morosidad['porcentajeMorosos'] > 15) {
        $alertas[] = [
            'tipo' => 'warning',
            'mensaje' => "{$morosidad['totalMorosos']} conexiones morosas ({$morosidad['porcentajeMorosos']}%)",
            'prioridad' => 'alta'
        ];
    }

    // Alerta de suspensiones altas
    if ($resumen['porcentajeSuspendidas'] > 20) {
        $alertas[] = [
            'tipo' => 'warning',
            'mensaje' => "Alto porcentaje de suspensiones ({$resumen['porcentajeSuspendidas']}%)",
            'prioridad' => 'media'
        ];
    }

    // Alerta de crecimiento
    if ($tendencias['nuevosCiclo'] > 0) {
        $alertas[] = [
            'tipo' => 'info',
            'mensaje' => "{$tendencias['nuevosCiclo']} nuevas conexiones este ciclo",
            'prioridad' => 'media'
        ];
    }

    // Alerta de tendencia negativa
    if ($tendencias['cambioVsCicloAnterior']['direccion'] === 'disminucion') {
        $alertas[] = [
            'tipo' => 'error',
            'mensaje' => "Disminución de {$tendencias['cambioVsCicloAnterior']['totalConexiones']} conexiones vs ciclo anterior",
            'prioridad' => 'alta'
        ];
    }

    return $alertas;
}
```

### Node.js/Express Ejemplo

```javascript
router.post('/conexiones/estadisticas-por-ciclo', async (req, res) => {
    const { id_ciclo } = req.body;

    try {
        // Obtener todas las estadísticas en paralelo
        const [resumen, detalleEstados, financiero, morosidad, tendencias] = await Promise.all([
            obtenerResumenConexiones(id_ciclo),
            obtenerDetalleEstados(id_ciclo),
            obtenerInfoFinanciera(id_ciclo),
            obtenerMorosidad(id_ciclo),
            obtenerTendencias(id_ciclo)
        ]);

        // Generar alertas basadas en los datos
        const alertas = generarAlertas(resumen, morosidad, tendencias);

        res.json({
            success: true,
            data: {
                resumen,
                detalleEstados,
                financiero,
                morosidad,
                tendencias,
                alertas
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas de conexiones'
        });
    }
});
```

## Comportamiento del Frontend

### Visualización Mejorada

La tarjeta mostrará:

1. **Resumen Visual** (4 columnas actuales):
   - Total, Activas, Suspendidas, Inactivas
   - Con porcentajes

2. **Indicadores Financieros** (nuevos):
   - Ingresos potenciales mensuales
   - Ingresos perdidos por suspensiones
   - % de ingresos en riesgo

3. **Alertas Destacadas** (nuevas):
   - Badges de color según prioridad
   - Mensajes concisos y accionables

4. **Tendencias** (nuevas):
   - Indicador de crecimiento/decrecimiento
   - Comparación con ciclo anterior
   - Nuevas conexiones y bajas

5. **Gráfico de Estados** (nuevo):
   - Pequeño gráfico circular o de barras
   - Mostrando distribución de estados

### Interactividad

- Al hacer clic en la tarjeta → Navega a `ConexionesCicloScreen` (comportamiento actual)
- Posibilidad de expandir/colapsar secciones
- Tooltips con información adicional

## Testing

### Caso 1: Ciclo con datos completos
```bash
curl -X POST "https://wellnet-rd.com:444/api/conexiones/estadisticas-por-ciclo" \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 123}'
```

Respuesta esperada: Objeto completo con todos los campos poblados

### Caso 2: Ciclo sin conexiones
```bash
curl -X POST "https://wellnet-rd.com:444/api/conexiones/estadisticas-por-ciclo" \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 999}'
```

Respuesta esperada: Objeto con valores en 0 y arrays vacíos

### Caso 3: Verificar alertas
Verificar que las alertas se generen correctamente según umbrales:
- Morosidad > 15% → Alerta warning
- Suspensiones > 20% → Alerta warning
- Disminución de conexiones → Alerta error
- Nuevas conexiones > 0 → Alerta info

## Prioridad de Implementación

### 🔴 Prioridad ALTA (Implementar primero)
1. `resumen` completo con porcentajes
2. `detalleEstados` con todos los estados
3. `morosidad` con información básica

### 🟡 Prioridad MEDIA (Implementar después)
4. `financiero` con impacto económico
5. `alertas` automáticas

### 🟢 Prioridad BAJA (Nice to have)
6. `tendencias` con comparación de ciclos
7. Nuevas conexiones y bajas del ciclo

## Notas Importantes

1. **Performance**: Las queries pueden ser pesadas. Considera:
   - Índices en `facturas.id_ciclo`, `conexiones.id_estado_conexion`
   - Caché de resultados (TTL: 5-10 minutos)
   - Paginación si el ciclo tiene muchas conexiones

2. **Estados de Conexión**: Verifica que la tabla `estados_conexion` esté bien definida y que los IDs coincidan con los que usa el frontend.

3. **Cálculo de Morosidad**: Asegúrate de filtrar correctamente:
   - Solo facturas del ciclo actual
   - Solo facturas pendientes
   - Solo facturas vencidas (fecha_vencimiento < CURDATE())

4. **Comparación de Ciclos**: Para ciclos mensuales, buscar el ciclo anterior por:
   - Mismo `dia_de_mes`
   - `inicio` anterior al ciclo actual
   - Ordenar por `inicio DESC` y tomar el primero

5. **Colores para Estados**: Son opcionales, pero ayudan al frontend a visualizar mejor. Sugerencias:
   - Activa: `#10B981` (verde)
   - Suspendida: `#F59E0B` (naranja)
   - Desconectada: `#6B7280` (gris)
   - Pendiente: `#3B82F6` (azul)
   - Cancelada: `#EF4444` (rojo)

## Estado Actual

❌ **El endpoint actual NO devuelve datos completos**

Actualmente solo devuelve:
```json
{
  "success": true,
  "data": {
    "totalConexiones": 938,
    "conexionesActivas": 650,
    "conexionesSuspendidas": 200,
    "conexionesInactivas": 88,
    "detalleEstados": []  // ⚠️ Vacío
  }
}
```

Falta implementar:
- ✅ Porcentajes en el resumen
- ❌ `detalleEstados` poblado
- ❌ `financiero`
- ❌ `morosidad`
- ❌ `tendencias`
- ❌ `alertas`

## Próximos Pasos

1. **Backend**: Implementar las queries y la lógica para devolver todos los campos especificados
2. **Backend**: Probar con diferentes ciclos (con datos, sin datos, ciclos cerrados, etc.)
3. **Frontend**: Una vez que el backend devuelva los datos, implementar la visualización mejorada
4. **Testing**: Verificar que los cálculos de porcentajes, morosidad y tendencias sean correctos

## Contacto y Dudas

Si tienes dudas sobre algún campo o necesitas más información sobre cómo se usan los datos en el frontend, por favor pregunta antes de implementar.

¡Gracias! 🚀
