# 🚨 URGENTE: Inconsistencia entre Endpoints de Listado y Estadísticas

## Problema Detectado

Los dos endpoints que manejan conexiones de un ciclo están devolviendo **datos inconsistentes**:

### Endpoint 1: Estadísticas
**Ruta**: `POST /api/conexiones/estadisticas-por-ciclo`
**Devuelve**: 4 conexiones inactivas

### Endpoint 2: Listado
**Ruta**: `POST /api/conexiones/listar-por-ciclo`
**Devuelve**: Solo 2 conexiones inactivas

## Impacto en el Usuario

El usuario ve en la pantalla:
- **Indicador**: "Inactivas: 4" (del endpoint de estadísticas)
- **Lista filtrada**: Solo muestra 2 conexiones (del endpoint de listado)

**Esto genera confusión y falta de confianza en los datos.**

## Causa Probable

El endpoint de **listado** está usando una query SQL que **excluye algunas conexiones** que el endpoint de **estadísticas** sí está contando.

Posibles razones:

### 1. GROUP BY incorrecto
```sql
-- ❌ MAL: Puede eliminar conexiones duplicadas incorrectamente
SELECT ...
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = ?
GROUP BY c.id_conexion  -- Si hay múltiples facturas, puede causar problemas
```

### 2. INNER JOIN vs LEFT JOIN
```sql
-- ❌ MAL: Excluye conexiones sin router
INNER JOIN routers r ON r.id_router = c.id_router

-- ✅ BIEN: Incluye todas las conexiones
LEFT JOIN routers r ON r.id_router = c.id_router
```

### 3. Filtros adicionales en WHERE
El listado puede tener filtros que estadísticas no tiene:
```sql
-- ❌ MAL: Filtros que excluyen conexiones
WHERE f.id_ciclo = ?
  AND c.activo = 1  -- ¿Estadísticas también usa esto?
  AND f.estado = 'pagado'  -- ¿Estadísticas también usa esto?
```

## Solución Requerida

### 1. Verificar Query del Endpoint de Estadísticas

Revisar la query que usa `/api/conexiones/estadisticas-por-ciclo` para contar conexiones:

```sql
-- ¿Qué query usa ESTADÍSTICAS para contar?
SELECT
    COUNT(*) as total_conexiones,
    SUM(CASE WHEN c.id_estado_conexion = 3 THEN 1 ELSE 0 END) as activas,
    SUM(CASE WHEN c.id_estado_conexion = 4 THEN 1 ELSE 0 END) as suspendidas,
    SUM(CASE WHEN c.id_estado_conexion NOT IN (3, 4) THEN 1 ELSE 0 END) as inactivas
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = ?
-- ¿Hay más condiciones aquí?
```

### 2. Verificar Query del Endpoint de Listado

Revisar la query que usa `/api/conexiones/listar-por-ciclo`:

```sql
-- ¿Qué query usa LISTADO?
SELECT
    c.id_conexion,
    c.id_estado_conexion,
    -- ... más campos
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
INNER JOIN clientes cl ON cl.id_cliente = c.id_cliente
INNER JOIN servicios s ON s.id_servicio = c.id_servicio
LEFT JOIN routers r ON r.id_router = c.id_router  -- ¿INNER o LEFT?
LEFT JOIN estados_conexion ec ON ec.id_estado_conexion = c.id_estado_conexion
WHERE f.id_ciclo = ?
GROUP BY c.id_conexion  -- ¿Esto está causando el problema?
ORDER BY c.id_conexion DESC;
```

### 3. Asegurar que Ambas Queries Sean Idénticas en Filtrado

**CRÍTICO**: Ambos endpoints deben usar **exactamente la misma lógica** para determinar qué conexiones pertenecen a un ciclo.

**Recomendación**: Crear una función/vista compartida:

```sql
-- Función reutilizable para obtener conexiones de un ciclo
CREATE VIEW conexiones_por_ciclo AS
SELECT DISTINCT
    c.id_conexion,
    c.id_estado_conexion,
    c.id_cliente,
    c.id_servicio,
    c.id_router,
    f.id_ciclo
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
-- NO agregar más filtros aquí que no estén en estadísticas
```

Luego ambos endpoints la usan:
```sql
-- Estadísticas
SELECT ... FROM conexiones_por_ciclo WHERE id_ciclo = ?

-- Listado
SELECT ... FROM conexiones_por_ciclo cpc
JOIN clientes cl ON cl.id_cliente = cpc.id_cliente
-- etc.
WHERE cpc.id_ciclo = ?
```

## Debugging

### Paso 1: Contar en Ambos Endpoints

Ejecutar manualmente y comparar:

```sql
-- Query de ESTADÍSTICAS (simplificada)
SELECT COUNT(DISTINCT c.id_conexion) as total_estadisticas
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = 362070
  AND c.id_estado_conexion NOT IN (3, 4);
-- Resultado esperado: 4

-- Query de LISTADO (simplificada)
SELECT COUNT(DISTINCT c.id_conexion) as total_listado
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
INNER JOIN clientes cl ON cl.id_cliente = c.id_cliente
INNER JOIN servicios s ON s.id_servicio = c.id_servicio
LEFT JOIN routers r ON r.id_router = c.id_router
WHERE f.id_ciclo = 362070
  AND c.id_estado_conexion NOT IN (3, 4)
GROUP BY c.id_conexion;
-- Resultado actual: 2
-- ¿Por qué solo 2?
```

### Paso 2: Identificar las 2 Conexiones Faltantes

```sql
-- Encontrar las conexiones que ESTADÍSTICAS cuenta pero LISTADO no devuelve
SELECT c.id_conexion, c.id_estado_conexion
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = 362070
  AND c.id_estado_conexion NOT IN (3, 4)
  AND c.id_conexion NOT IN (
    -- IDs que SÍ devuelve el listado
    SELECT DISTINCT c2.id_conexion
    FROM conexiones c2
    INNER JOIN facturas f2 ON f2.id_conexion = c2.id_conexion
    INNER JOIN clientes cl ON cl.id_cliente = c2.id_cliente
    INNER JOIN servicios s ON s.id_servicio = c2.id_servicio
    LEFT JOIN routers r ON r.id_router = c2.id_router
    WHERE f2.id_ciclo = 362070
      AND c2.id_estado_conexion NOT IN (3, 4)
  );
```

### Paso 3: Investigar por qué se excluyen

Una vez identificadas las 2 conexiones faltantes, verificar:

```sql
-- Para cada conexión faltante (ejemplo: id_conexion = 12345)
SELECT
    c.id_conexion,
    c.id_cliente,
    c.id_servicio,
    c.id_router,
    cl.id_cliente IS NOT NULL as tiene_cliente,
    s.id_servicio IS NOT NULL as tiene_servicio,
    r.id_router IS NOT NULL as tiene_router
FROM conexiones c
LEFT JOIN clientes cl ON cl.id_cliente = c.id_cliente
LEFT JOIN servicios s ON s.id_servicio = c.id_servicio
LEFT JOIN routers r ON r.id_router = c.id_router
WHERE c.id_conexion = 12345;
```

**Preguntas clave**:
- ¿Tiene cliente? Si no, el INNER JOIN lo excluye
- ¿Tiene servicio? Si no, el INNER JOIN lo excluye
- ¿Tiene router? Si usa INNER JOIN, lo excluye

## Estados de Conexión (Referencia)

Según el frontend:
- **1**: Pendiente de Instalación (INACTIVA)
- **2**: En Ejecución (INACTIVA)
- **3**: Activa (ACTIVA) ✅
- **4**: Suspendida (SUSPENDIDA) ⚠️
- **5**: Baja Voluntaria (INACTIVA)
- **6**: Baja Forzada (INACTIVA)
- **7**: Averiada (INACTIVA)
- **8**: Pendiente de Reconexión (INACTIVA)

**Inactivas** = Todo lo que NO es estado 3 o 4

## Acciones Requeridas

### Para el Backend:

1. ✅ **Revisar y comparar las queries** de ambos endpoints
2. ✅ **Identificar las diferencias** en filtros y JOINs
3. ✅ **Ejecutar queries de debugging** para encontrar las 2 conexiones faltantes
4. ✅ **Corregir la query del listado** para incluir todas las conexiones que estadísticas cuenta
5. ✅ **Probar con el ciclo específico** (ej: 362070) donde se detectó el problema
6. ✅ **Verificar que los totales coincidan** en ambos endpoints

### Para Testing:

```bash
# 1. Obtener estadísticas
curl -X POST "https://localhost:444/api/conexiones/estadisticas-por-ciclo" \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 362070}'

# Anotar: resumen.conexionesInactivas = ?

# 2. Obtener listado
curl -X POST "https://localhost:444/api/conexiones/listar-por-ciclo" \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 362070}'

# Contar manualmente: conexiones con id_estado_conexion NOT IN (3, 4) = ?

# 3. Comparar
# ¿Son iguales? ✅ Solucionado
# ¿Son diferentes? ❌ Investigar más
```

## Ejemplo de Corrección

### ANTES (Incorrecto):
```sql
-- Listado excluye conexiones sin router
SELECT ...
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
INNER JOIN clientes cl ON cl.id_cliente = c.id_cliente
INNER JOIN servicios s ON s.id_servicio = c.id_servicio
INNER JOIN routers r ON r.id_router = c.id_router  -- ❌ Excluye sin router
WHERE f.id_ciclo = ?
GROUP BY c.id_conexion;
```

### DESPUÉS (Correcto):
```sql
-- Listado incluye todas las conexiones
SELECT ...
FROM conexiones c
INNER JOIN facturas f ON f.id_conexion = c.id_conexion
INNER JOIN clientes cl ON cl.id_cliente = c.id_cliente
INNER JOIN servicios s ON s.id_servicio = c.id_servicio
LEFT JOIN routers r ON r.id_router = c.id_router  -- ✅ Incluye sin router
WHERE f.id_ciclo = ?
GROUP BY c.id_conexion;
```

## Prioridad

🔴 **ALTA** - Afecta directamente a la experiencia del usuario y genera desconfianza en los datos.

## Referencias

- **Pantalla Frontend**: `src/pantallas/factura/ConexionesCicloScreen.tsx`
- **Tarjeta Estadísticas**: `src/pantallas/factura/DetalleCiclo.tsx` (líneas 666-1037)
- **Constantes Estados**: `src/constants/estadosConexion.ts`
- **Documentación Listado**: `REQUERIMIENTO_BACKEND_LISTADO_CONEXIONES_CICLO.md`
- **Documentación Estadísticas**: `REQUERIMIENTO_BACKEND_ESTADISTICAS_CONEXIONES_CICLO.md`

---

**Reportado**: 1 de Diciembre de 2025
**Estado**: 🔴 URGENTE - Requiere corrección inmediata
**Impacto**: Discrepancia visible para el usuario entre indicadores y listado
