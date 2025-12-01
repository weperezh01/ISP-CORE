# 🚨 URGENTE: Los Dos Endpoints Devuelven Datos Diferentes

## Problema

Los endpoints de estadísticas y listado de conexiones están devolviendo **números diferentes** para el mismo ciclo:

```
Ciclo: 362070

Endpoint ESTADÍSTICAS:
POST /api/conexiones/estadisticas-por-ciclo
Inactivas: 4

Endpoint LISTADO:
POST /api/conexiones/listar-por-ciclo
Inactivas en el array: 2
```

**Solo 2 de 4 conexiones inactivas aparecen en el listado** 😱

## Impacto

El usuario ve:
- Indicador dice: **"Inactivas: 4"**
- Lista muestra: **Solo 2 conexiones**

Esto genera **confusión y desconfianza**.

## Causa Probable

El endpoint de **listado** está usando una query que **excluye conexiones** que el de **estadísticas** sí cuenta.

Posibles causas:

### 1. INNER JOIN en lugar de LEFT JOIN
```sql
-- ❌ Excluye conexiones sin router
INNER JOIN routers r ON r.id_router = c.id_router

-- ✅ Incluye todas
LEFT JOIN routers r ON r.id_router = c.id_router
```

### 2. GROUP BY incorrecto
```sql
-- Puede estar eliminando duplicados incorrectamente
GROUP BY c.id_conexion
```

### 3. Filtros adicionales
El listado puede tener filtros que estadísticas no tiene.

## Qué Necesito

### 1. Revisar la Query del Listado

Compara estas dos queries:

**Estadísticas** (la que cuenta):
```sql
SELECT
    SUM(CASE WHEN c.id_estado_conexion NOT IN (3, 4) THEN 1 ELSE 0 END) as inactivas
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = ?
```

**Listado** (la que devuelve el array):
```sql
SELECT ...
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
INNER JOIN clientes cl ON cl.id_cliente = c.id_cliente
INNER JOIN servicios s ON s.id_servicio = c.id_servicio
-- ¿Qué más hay aquí?
WHERE f.id_ciclo = ?
```

### 2. Encontrar las Conexiones Faltantes

Ejecuta esto para encontrar las 2 que faltan:

```sql
-- Conexiones que ESTADÍSTICAS cuenta pero LISTADO no devuelve
SELECT c.id_conexion, c.id_estado_conexion, c.id_cliente, c.id_servicio, c.id_router
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = 362070
  AND c.id_estado_conexion NOT IN (3, 4)
  AND c.id_conexion NOT IN (
    -- Los IDs que SÍ devuelve el listado actual
    SELECT DISTINCT c2.id_conexion
    FROM conexiones c2
    INNER JOIN facturas f2 ON f2.id_conexion = c2.id_conexion
    INNER JOIN clientes cl ON cl.id_cliente = c2.id_cliente
    INNER JOIN servicios s ON s.id_servicio = c2.id_servicio
    -- ... resto de tu query actual
    WHERE f2.id_ciclo = 362070
  );
```

### 3. Investigar Por Qué se Excluyen

Para cada conexión faltante, verificar:
- ¿Tiene cliente? (Si no, INNER JOIN lo excluye)
- ¿Tiene servicio? (Si no, INNER JOIN lo excluye)
- ¿Tiene router? (Si usas INNER JOIN, lo excluye)
- ¿Tiene facturas en estado específico?

## Solución

**Asegúrate que AMBAS queries usen la MISMA lógica** para determinar qué conexiones pertenecen al ciclo.

### Opción 1: Usar LEFT JOIN para opcionales
```sql
LEFT JOIN routers r ON r.id_router = c.id_router
LEFT JOIN estados_conexion ec ON ec.id_estado_conexion = c.id_estado_conexion
```

### Opción 2: Crear vista compartida
```sql
CREATE VIEW conexiones_por_ciclo AS
SELECT DISTINCT c.id_conexion, c.id_estado_conexion, f.id_ciclo
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion;

-- Luego ambos endpoints la usan
```

## Testing

Prueba que los números coincidan:

```bash
# 1. Estadísticas
curl -X POST "https://localhost:444/api/conexiones/estadisticas-por-ciclo" \
  -d '{"id_ciclo": 362070}'
# Inactivas: ?

# 2. Listado
curl -X POST "https://localhost:444/api/conexiones/listar-por-ciclo" \
  -d '{"id_ciclo": 362070}'
# Contar manualmente inactivas (estado NOT IN [3,4]): ?

# Deben ser iguales ✅
```

## Estados de Conexión (Referencia)

**Inactivas** = Todo lo que NO sea estado 3 (Activa) o 4 (Suspendida):
- 1: Pendiente de Instalación
- 2: En Ejecución
- 5: Baja Voluntaria
- 6: Baja Forzada
- 7: Averiada
- 8: Pendiente de Reconexión

## Pregunta Directa

**¿Qué diferencias hay entre la query de ESTADÍSTICAS y la de LISTADO?**

Específicamente:
1. ¿Usas INNER JOIN o LEFT JOIN para routers?
2. ¿El WHERE tiene filtros diferentes?
3. ¿El GROUP BY está afectando?

Una vez identifiques las diferencias, ajusta el LISTADO para que incluya **todas** las conexiones que ESTADÍSTICAS cuenta.

---

**Archivo completo con más detalles**: `URGENTE_BACKEND_INCONSISTENCIA_LISTADO_ESTADISTICAS.md`

¡Gracias! 🚀
