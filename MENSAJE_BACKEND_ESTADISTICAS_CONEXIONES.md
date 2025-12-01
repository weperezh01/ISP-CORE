# MENSAJE PARA CLAUDE DEL BACKEND

## Contexto

Necesito mejorar el endpoint de estadísticas de conexiones por ciclo para darle funcionalidad al 100% a la tarjeta en la pantalla DetalleCiclo del frontend React Native.

**Endpoint actual**: `POST /api/conexiones/estadisticas-por-ciclo`
**Parámetro**: `{ id_ciclo: number }`

## Problema Actual

El endpoint actualmente devuelve datos muy básicos:

```json
{
  "success": true,
  "data": {
    "totalConexiones": 938,
    "conexionesActivas": 650,
    "conexionesSuspendidas": 200,
    "conexionesInactivas": 88,
    "detalleEstados": []  // ⚠️ Siempre viene vacío
  }
}
```

Esto solo permite mostrar 4 números en la tarjeta. Necesitamos mucha más información para que la tarjeta sea realmente útil.

## Datos Requeridos

Necesito que el endpoint devuelva la siguiente estructura completa:

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
      }
      // ... resto de estados
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

## Detalles de cada sección

### 1. `resumen` (ALTA PRIORIDAD)
- **Incluir porcentajes** de cada categoría
- **Conexiones morosas**: Conexiones con facturas pendientes en este ciclo
- **Conexiones al día**: Conexiones sin deudas

### 2. `detalleEstados` (ALTA PRIORIDAD)
- **Listar TODOS los estados**, no solo activa/suspendida/inactiva
- Incluir: Pendiente de instalación, Activa, Desconectada, Suspendida, Cancelada, etc.
- Cada estado con: id, nombre, cantidad, porcentaje
- El campo `color` es opcional (pero ayuda al frontend)

### 3. `financiero` (MEDIA PRIORIDAD)
- **Ingresos potenciales**: Suma de precios de servicios de conexiones activas + suspendidas
- **Ingresos perdidos por suspensión**: Suma de precios de servicios suspendidos
- **Ingresos perdidos por inactivas**: Suma de precios de servicios de conexiones inactivas
- **Porcentaje de ingresos perdidos**: % sobre el potencial total

### 4. `morosidad` (ALTA PRIORIDAD)
- **Total morosos**: Conexiones con facturas pendientes de pago VENCIDAS
- **Porcentaje morosos**: % sobre total de conexiones
- **Deuda total**: Suma de todas las facturas pendientes vencidas
- **Promedio días mora**: Promedio de días de atraso (CURDATE() - fecha_vencimiento)

### 5. `tendencias` (BAJA PRIORIDAD - nice to have)
- Comparar con el ciclo anterior del mismo día del mes
- Indicar si aumentó o disminuyó el total de conexiones
- Nuevas conexiones y bajas EN ESTE CICLO (por fechas de creación/actualización)

### 6. `alertas` (MEDIA PRIORIDAD)
Generar alertas automáticas basadas en los datos:
- Si morosidad > 15% → warning de alta prioridad
- Si suspensiones > 20% → warning de media prioridad
- Si hay disminución de conexiones → error de alta prioridad
- Si hay nuevas conexiones → info de media prioridad

## Queries SQL de Referencia

### Resumen con porcentajes:
```sql
SELECT
    COUNT(*) as total_conexiones,
    SUM(CASE WHEN c.id_estado_conexion = 3 THEN 1 ELSE 0 END) as conexiones_activas,
    SUM(CASE WHEN c.id_estado_conexion = 4 THEN 1 ELSE 0 END) as conexiones_suspendidas,
    SUM(CASE WHEN c.id_estado_conexion NOT IN (3, 4) THEN 1 ELSE 0 END) as conexiones_inactivas,
    ROUND(SUM(CASE WHEN c.id_estado_conexion = 3 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as porcentaje_activas
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = ?;
```

### Detalle por estado:
```sql
SELECT
    ec.id_estado_conexion,
    ec.nombre as nombre_estado,
    COUNT(c.id_conexion) as cantidad,
    ROUND(COUNT(c.id_conexion) * 100.0 / (
        SELECT COUNT(*) FROM conexiones c2
        INNER JOIN facturas f2 ON f2.id_conexion = c2.id_conexion
        WHERE f2.id_ciclo = ?
    ), 1) as porcentaje
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
INNER JOIN estados_conexion ec ON ec.id_estado_conexion = c.id_estado_conexion
WHERE f.id_ciclo = ?
GROUP BY ec.id_estado_conexion, ec.nombre;
```

### Información financiera:
```sql
SELECT
    SUM(CASE WHEN c.id_estado_conexion IN (3, 4) THEN s.precio ELSE 0 END) as ingresos_potenciales,
    SUM(CASE WHEN c.id_estado_conexion = 4 THEN s.precio ELSE 0 END) as ingresos_perdidos_suspension
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
INNER JOIN servicios s ON s.id_servicio = c.id_servicio
WHERE f.id_ciclo = ?;
```

### Morosidad:
```sql
SELECT
    COUNT(DISTINCT c.id_conexion) as total_morosos,
    SUM(f.total) as deuda_total,
    AVG(DATEDIFF(CURDATE(), f.fecha_vencimiento)) as promedio_dias_mora
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = ?
  AND f.estado_factura = 'pendiente'
  AND f.fecha_vencimiento < CURDATE();
```

## Prioridad de Implementación

### 🔴 ALTA (implementar YA)
1. `resumen` completo con porcentajes
2. `detalleEstados` con todos los estados
3. `morosidad` básica

### 🟡 MEDIA (implementar después)
4. `financiero` completo
5. `alertas` automáticas

### 🟢 BAJA (nice to have)
6. `tendencias` con comparación de ciclos

## Notas Importantes

1. **IDs de estados**: Verifica que los IDs de estados sean correctos:
   - 3 = Activa
   - 4 = Suspendida
   - (Confirma los demás en tu BD)

2. **Morosidad**: Solo contar facturas VENCIDAS (fecha_vencimiento < CURDATE())

3. **Performance**: Considera agregar caché (5-10 minutos) porque las queries pueden ser pesadas

4. **Colores sugeridos** (opcional):
   - Activa: `#10B981`
   - Suspendida: `#F59E0B`
   - Desconectada: `#6B7280`
   - Pendiente: `#3B82F6`

## Archivo de Referencia Completo

Para más detalles técnicos, queries completas y ejemplos de implementación, revisa:
**REQUERIMIENTO_BACKEND_ESTADISTICAS_CONEXIONES_CICLO.md**

Ese archivo tiene queries completas para tendencias, comparación de ciclos, y lógica para generar alertas automáticas.

## Testing

Por favor prueba con:
1. Ciclo con muchas conexiones (>500)
2. Ciclo sin conexiones
3. Ciclo con alta morosidad
4. Ciclo reciente vs ciclo antiguo

---

**¿Alguna duda sobre algún campo o query?** Pregunta antes de implementar.

¡Gracias! 🚀
