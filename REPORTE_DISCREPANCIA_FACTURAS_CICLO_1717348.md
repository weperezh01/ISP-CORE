# 🚨 REPORTE: Discrepancia en Facturas del Ciclo 1717348

## 📋 Resumen Ejecutivo

Se ha detectado una **discrepancia en las estadísticas de facturas** del ciclo 1717348. Existe la sospecha de que se han asignado facturas de otros ciclos a este ciclo incorrectamente.

**Prioridad:** 🔴 **CRÍTICA**
**Impacto:** Datos financieros incorrectos, estadísticas no confiables
**Estado:** Pendiente de verificación y corrección por el backend

---

## 🔍 Problema Detectado

### Síntoma

Al revisar el ciclo 1717348 en el frontend, el usuario notó que:
- Las **estadísticas de facturas NO coinciden** con lo esperado
- Hay sospecha de que **facturas de otros ciclos** fueron asignadas incorrectamente a este ciclo

### Datos Observados (Frontend)

```
Ciclo: 1717348
- Total facturas reportado: ??? (verificar)
- Total facturas obtenidas: ??? (verificar)
- Discrepancia: ??? facturas
```

---

## ✅ Verificación Realizada por el Frontend

He creado un script de verificación (`verificar-ciclo-1717348.js`) que analiza:

1. ✅ Estadísticas del ciclo desde el endpoint
2. ✅ Lista de facturas asociadas al ciclo
3. ✅ Conexiones del ciclo
4. ✅ Validación de cada factura:
   - `id_ciclo` correcto
   - `id_ciclo_base` correcto
   - Fecha de emisión dentro del rango del ciclo
   - Suma de totales coincide

### Para ejecutar la verificación:

```bash
cd /mnt/c/Users/weper/reactNativeProjects/ISP-CORE
node verificar-ciclo-1717348.js
```

Este script generará un reporte JSON con todas las discrepancias encontradas.

---

## 🎯 Tareas Requeridas para el Backend

### 1. Verificar Integridad de Datos

**Query sugerida para investigar:**

```sql
-- Verificar facturas del ciclo 1717348
SELECT
    f.id_factura,
    f.numero_factura,
    f.id_ciclo,
    f.id_ciclo_base,
    f.fecha_emision,
    f.id_cliente,
    f.id_conexion,
    f.total,
    f.estado,
    c.id_ciclo_base AS conexion_ciclo_base,
    ciclo.inicio AS ciclo_inicio,
    ciclo.final AS ciclo_final
FROM facturas f
LEFT JOIN conexiones c ON f.id_conexion = c.id_conexion
LEFT JOIN ciclos ciclo ON f.id_ciclo = ciclo.id_ciclo
WHERE f.id_ciclo = 1717348
ORDER BY f.fecha_emision;
```

**Verificar:**
- ¿Todas las facturas tienen `id_ciclo = 1717348`?
- ¿Todas las facturas tienen el mismo `id_ciclo_base` que el ciclo 1717348?
- ¿Las fechas de emisión están dentro del rango del ciclo?
- ¿Las conexiones de esas facturas pertenecen al ciclo_base correcto?

### 2. Buscar Facturas Mal Asignadas

```sql
-- Buscar facturas que deberían estar en el ciclo 1717348 pero no están
SELECT
    f.id_factura,
    f.numero_factura,
    f.id_ciclo,
    f.id_ciclo_base,
    f.fecha_emision,
    c.id_ciclo_base AS conexion_ciclo_base
FROM facturas f
INNER JOIN conexiones c ON f.id_conexion = c.id_conexion
WHERE c.id_ciclo_base = (SELECT id_ciclo_base FROM ciclos WHERE id_ciclo = 1717348)
  AND f.id_ciclo != 1717348
  AND f.fecha_emision BETWEEN (SELECT inicio FROM ciclos WHERE id_ciclo = 1717348)
                           AND (SELECT final FROM ciclos WHERE id_ciclo = 1717348);
```

### 3. Buscar Facturas de Otros Ciclos Asignadas Incorrectamente

```sql
-- Buscar facturas en el ciclo 1717348 que NO deberían estar ahí
SELECT
    f.id_factura,
    f.numero_factura,
    f.id_ciclo,
    f.id_ciclo_base,
    f.fecha_emision,
    c.id_ciclo_base AS conexion_ciclo_base,
    (SELECT id_ciclo_base FROM ciclos WHERE id_ciclo = 1717348) AS ciclo_base_esperado
FROM facturas f
INNER JOIN conexiones c ON f.id_conexion = c.id_conexion
WHERE f.id_ciclo = 1717348
  AND (
    c.id_ciclo_base != (SELECT id_ciclo_base FROM ciclos WHERE id_ciclo = 1717348)
    OR f.fecha_emision NOT BETWEEN (SELECT inicio FROM ciclos WHERE id_ciclo = 1717348)
                                AND (SELECT final FROM ciclos WHERE id_ciclo = 1717348)
  );
```

### 4. Verificar Estadísticas del Ciclo

```sql
-- Recalcular estadísticas del ciclo manualmente
SELECT
    ciclo.id_ciclo,
    ciclo.id_ciclo_base,
    ciclo.inicio,
    ciclo.final,
    -- Estadísticas actuales del ciclo
    ciclo.total_facturas,
    ciclo.facturas_pendiente,
    ciclo.total_dinero,
    ciclo.dinero_cobrado,
    -- Recalcular desde facturas
    COUNT(f.id_factura) AS facturas_reales,
    SUM(CASE WHEN f.estado = 'pendiente' THEN 1 ELSE 0 END) AS pendientes_reales,
    SUM(f.total) AS total_dinero_real,
    SUM(CASE WHEN f.estado = 'pagado' THEN f.total ELSE 0 END) AS dinero_cobrado_real
FROM ciclos ciclo
LEFT JOIN facturas f ON f.id_ciclo = ciclo.id_ciclo
WHERE ciclo.id_ciclo = 1717348
GROUP BY ciclo.id_ciclo;
```

**Comparar:**
- `ciclo.total_facturas` vs `facturas_reales`
- `ciclo.facturas_pendiente` vs `pendientes_reales`
- `ciclo.total_dinero` vs `total_dinero_real`
- `ciclo.dinero_cobrado` vs `dinero_cobrado_real`

### 5. Investigar Causa Raíz

**Preguntas a responder:**

1. **¿Cuándo se asignan las facturas a un ciclo?**
   - En la creación de facturas
   - En la facturación masiva
   - En algún proceso de actualización

2. **¿Qué lógica determina el `id_ciclo` de una factura?**
   - ¿Se basa en la fecha de emisión?
   - ¿Se basa en el `id_ciclo_base` de la conexión?
   - ¿Se basa en el ciclo activo del ISP?

3. **¿Existe algún proceso que reasigna facturas?**
   - Correcciones manuales
   - Scripts de migración
   - Procesos automáticos

4. **¿Cuándo se actualizaron las estadísticas por última vez?**
   - ¿Se recalculan automáticamente?
   - ¿Se recalculan solo al crear/actualizar facturas?

---

## 🔧 Solución Propuesta

### Paso 1: Identificar Facturas Incorrectas

Ejecuta las queries de verificación anteriores y genera una lista de:
- Facturas que están en el ciclo 1717348 pero NO deberían estar
- Facturas que deberían estar en el ciclo 1717348 pero NO están

### Paso 2: Crear Script de Corrección

```sql
-- PLANTILLA: Reasignar facturas al ciclo correcto
UPDATE facturas
SET id_ciclo = (
    SELECT id_ciclo
    FROM ciclos
    WHERE id_ciclo_base = (
        SELECT id_ciclo_base
        FROM conexiones
        WHERE id_conexion = facturas.id_conexion
    )
    AND fecha_emision BETWEEN ciclos.inicio AND ciclos.final
    ORDER BY id_ciclo DESC
    LIMIT 1
)
WHERE id_factura IN (
    -- IDs de facturas problemáticas identificadas
);
```

**⚠️ IMPORTANTE:** Ejecutar en transacción y hacer backup antes de corregir.

### Paso 3: Recalcular Estadísticas

Después de corregir las facturas, recalcular las estadísticas del ciclo:

```sql
UPDATE ciclos
SET
    total_facturas = (
        SELECT COUNT(*) FROM facturas WHERE id_ciclo = ciclos.id_ciclo
    ),
    facturas_pendiente = (
        SELECT COUNT(*) FROM facturas
        WHERE id_ciclo = ciclos.id_ciclo AND estado = 'pendiente'
    ),
    total_dinero = (
        SELECT COALESCE(SUM(total), 0) FROM facturas
        WHERE id_ciclo = ciclos.id_ciclo
    ),
    dinero_cobrado = (
        SELECT COALESCE(SUM(total), 0) FROM facturas
        WHERE id_ciclo = ciclos.id_ciclo AND estado = 'pagado'
    )
WHERE id_ciclo = 1717348;
```

### Paso 4: Validar Corrección

1. Ejecutar nuevamente el script de verificación del frontend
2. Comparar estadísticas antes y después
3. Verificar que no haya discrepancias

---

## 📊 Información del Ciclo 1717348

**Para obtener información completa:**

```bash
# Obtener info del ciclo
curl -k -X GET https://localhost:444/api/ciclos/1717348

# Obtener estadísticas
curl -k -X POST https://localhost:444/api/conexiones/estadisticas-por-ciclo \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 1717348}'

# Obtener facturas del ciclo
curl -k -X GET https://localhost:444/api/facturas?id_ciclo=1717348

# Obtener conexiones del ciclo
curl -k -X POST https://localhost:444/api/conexiones/listar-por-ciclo \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 1717348}'
```

---

## 🎯 Resultados Esperados

Después de la corrección, el frontend debería mostrar:

✅ **Estadísticas Correctas:**
- Total de facturas coincide con las facturas listadas
- Total de dinero coincide con la suma de las facturas
- Todas las facturas tienen `id_ciclo = 1717348`
- Todas las facturas tienen el `id_ciclo_base` correcto
- Todas las fechas de emisión están dentro del rango del ciclo

✅ **Integridad de Datos:**
- No hay facturas de otros ciclos
- No faltan facturas que deberían estar
- Las estadísticas son confiables

---

## 📝 Checklist de Verificación

- [ ] Ejecutar queries de verificación
- [ ] Identificar facturas problemáticas
- [ ] Determinar causa raíz del problema
- [ ] Crear backup de la base de datos
- [ ] Crear script de corrección
- [ ] Ejecutar corrección en transacción
- [ ] Recalcular estadísticas del ciclo
- [ ] Validar con script del frontend
- [ ] Documentar la causa y la solución
- [ ] Prevenir que vuelva a ocurrir (agregar validaciones)

---

## 📄 Archivos de Soporte Creados

1. ✅ `verificar-ciclo-1717348.js` - Script de verificación ejecutable
2. ✅ `src/utils/verificarFacturasCiclo.js` - Utilidad reutilizable
3. ✅ `REPORTE_DISCREPANCIA_FACTURAS_CICLO_1717348.md` - Este documento

---

## 🚨 Notas Importantes

- **NO ejecutar correcciones sin antes hacer backup**
- **NO modificar datos sin validar primero**
- **Documentar todos los cambios realizados**
- **Ejecutar el script de verificación del frontend antes y después**
- **Informar al usuario cuando se complete la corrección**

---

## 📞 Siguiente Paso

Por favor, ejecuta las queries de verificación y proporciona:

1. **Lista de facturas problemáticas** (id_factura, id_ciclo actual, id_ciclo correcto)
2. **Cantidad total de facturas afectadas**
3. **Causa raíz identificada** (¿por qué se asignaron incorrectamente?)
4. **Plan de corrección** (pasos específicos a ejecutar)

Una vez tengas esta información, podemos proceder con la corrección segura de los datos.

---

**Fecha del reporte:** 2025-11-10
**Reportado por:** Frontend Developer
**Ciclo afectado:** 1717348
**Severidad:** 🔴 CRÍTICA
**Estado:** ⏳ PENDIENTE DE INVESTIGACIÓN
