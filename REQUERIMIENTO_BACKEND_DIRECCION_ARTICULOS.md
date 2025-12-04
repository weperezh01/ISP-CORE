# Requerimiento Backend: Consolidación de Facturas por Cliente y Dirección de Conexión en Artículos

---

## 🎯 Resumen Ejecutivo (TL;DR)

**¿Qué necesitamos?**
1. ✅ **Consolidar facturas:** Un cliente con múltiples servicios debe recibir **UNA factura** (no múltiples)
2. ✅ **Agregar direcciones:** Cada artículo debe mostrar la dirección de su conexión

**¿Qué NO debemos hacer?**
- ❌ NO modificar el proceso de facturación masiva existente
- ❌ En su lugar, crear una COPIA y modificar la copia

**Estado del Frontend:** 🟢 Completado y listo para recibir los datos

**Prioridad:** 🔴 ALTA - Impacta facturación de clientes

---

## 📋 Descripción del Requerimiento

Este requerimiento tiene **DOS objetivos principales**:

### **Objetivo 1: Consolidar Facturas por Cliente en el Mismo Ciclo**
Actualmente el sistema genera **una factura por cada servicio** de un cliente. Esto debe cambiar para generar **UNA sola factura por cliente** que incluya todos sus servicios (artículos) si están en el mismo ciclo de facturación, donde cada artículo tenga su dirección de conexión correspondiente.

### **Objetivo 2: Incluir Dirección de Conexión en Artículos**
El endpoint `consulta-facturas-cobradas-por-id_factura` debe incluir la dirección de la conexión asociada a cada artículo de la factura, ya que una factura puede contener múltiples artículos y cada artículo puede pertenecer a una conexión diferente.

## 🎯 Beneficios

- **Para el cliente:** Recibe una sola factura consolidada en lugar de múltiples facturas
- **Para el ISP:** Mejor organización y claridad en la facturación
- **Para el sistema:** Datos más estructurados y trazables por dirección de conexión

---

## 🚨 IMPORTANTE: Proceso de Facturación Masiva

### **Problema Actual**

El proceso actual de generación masiva de facturas por ciclo está creando:
- ❌ **Una factura por cada servicio** de un cliente
- ❌ Sin información de dirección de conexión en los artículos

**Ejemplo del problema:**
```
Cliente: Juan Pérez
Servicios:
  - Internet 50 Mbps en Calle Principal #123
  - Internet 100 Mbps en Av. Independencia #45

Resultado actual (INCORRECTO):
  → Factura #001: Internet 50 Mbps
  → Factura #002: Internet 100 Mbps
```

### **Solución Requerida**

El proceso debe generar:
- ✅ **Una sola factura por cliente** con todos sus servicios del mismo ciclo
- ✅ **Cada artículo con su dirección de conexión correspondiente**

**Ejemplo esperado:**
```
Cliente: Juan Pérez

Factura #001:
  Artículos:
    - Internet 50 Mbps
      📍 Calle Principal #123
    - Internet 100 Mbps
      📍 Av. Independencia #45
```

### **⚠️ RESTRICCIÓN CRÍTICA: NO TOCAR EL CÓDIGO EXISTENTE**

**IMPORTANTE:** El equipo de backend **NO debe modificar** el proceso de facturación masiva existente.

**En su lugar:**
1. ✅ **Crear una COPIA del proceso actual** de generación de facturas masivas
2. ✅ **Modificar solo la COPIA** para implementar la nueva lógica
3. ✅ **Mantener el proceso viejo intacto** por si se necesita en el futuro
4. ✅ **Configurar el sistema para usar el nuevo proceso** (flag, configuración, etc.)

**Razón:** Backup y rollback en caso de problemas con el nuevo proceso.

### **Archivos/Procesos a Copiar** (Ejemplos - ajustar según estructura real)

```bash
# Ejemplo de cómo debería verse la estructura

Antes:
  /backend/procesos/facturacion_masiva.php (o .js, .py, etc.)

Después:
  /backend/procesos/facturacion_masiva_v1_legacy.php  ← COPIA SIN MODIFICAR
  /backend/procesos/facturacion_masiva_v2_consolidada.php  ← NUEVA VERSIÓN MODIFICADA
```

### **Lógica del Nuevo Proceso de Facturación Masiva**

**Pseudo-código de la nueva lógica:**

```sql
-- 1. Agrupar servicios por cliente y ciclo
SELECT
    c.id_cliente,
    cf.id_ciclo,
    GROUP_CONCAT(con.id_conexion) as conexiones
FROM clientes c
JOIN conexiones con ON c.id_cliente = con.id_cliente
JOIN ciclos_facturacion cf ON con.id_ciclo = cf.id_ciclo
WHERE cf.id_ciclo = ?  -- Ciclo actual
  AND con.estado_conexion = 'activo'
GROUP BY c.id_cliente, cf.id_ciclo

-- 2. Para cada cliente, crear UNA factura

-- 3. Insertar cada servicio como un artículo con su dirección
INSERT INTO articulos_factura (id_factura, descripcion, id_conexion, ...)
SELECT
    ?,  -- id_factura recién creada
    s.descripcion,
    con.id_conexion,
    -- otros campos...
FROM conexiones con
JOIN servicios s ON con.id_servicio = s.id_servicio
WHERE con.id_cliente = ?
  AND con.id_ciclo = ?
```

**Flujo del nuevo proceso:**
1. Obtener todos los clientes del ciclo actual
2. **Para cada cliente:**
   - Crear **UNA sola factura**
   - Obtener todos sus servicios/conexiones activas del ciclo
   - Insertar cada servicio como un **artículo** con:
     - Descripción del servicio
     - ID de conexión (`id_conexion`)
     - Dirección de la conexión (para consultas posteriores)
     - Precio, cantidad, etc.

---

## 🔧 Endpoints y Procesos Afectados

### **1. Proceso de Facturación Masiva** (NUEVO - COPIA DEL EXISTENTE)
- **Archivo/Script:** El que ejecuta la generación masiva de facturas por ciclo
- **Acción:** Crear copia y modificar lógica de agrupación
- **Cambio:** Consolidar facturas por cliente en lugar de por servicio

### **2. Endpoint de Consulta de Facturas**

**URL:** `https://wellnet-rd.com:444/api/consulta-facturas-cobradas-por-id_factura`

**Método:** POST

**Body:**
```json
{
  "id_factura": 123
}
```

## 📊 Estructura de Datos Actual

```json
{
  "factura": { ... },
  "cliente": { ... },
  "conexion": {
    "id_conexion": 456,
    "direccion": "Calle Principal #123, Santo Domingo"
  },
  "articulos": [
    {
      "id_articulo": 1,
      "descripcion": "Internet 50 Mbps",
      "cantidad_articulo": 1,
      "precio_unitario": 1500.00
    }
  ],
  "ciclo": { ... },
  "isp": { ... }
}
```

## ✅ Estructura de Datos Requerida

```json
{
  "factura": { ... },
  "cliente": { ... },
  "conexion": { ... },
  "articulos": [
    {
      "id_articulo": 1,
      "descripcion": "Internet 50 Mbps",
      "cantidad_articulo": 1,
      "precio_unitario": 1500.00,
      "id_conexion": 456,
      "direccion_conexion": "Calle Principal #123, Santo Domingo"
    },
    {
      "id_articulo": 2,
      "descripcion": "Cable TV Premium",
      "cantidad_articulo": 1,
      "precio_unitario": 800.00,
      "id_conexion": 789,
      "direccion_conexion": "Av. Independencia #45, Apto 3B"
    }
  ],
  "ciclo": { ... },
  "isp": { ... }
}
```

## 🔍 Campos Nuevos en `articulos[]`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id_conexion` | Integer | ✅ Sí | ID de la conexión asociada al artículo |
| `direccion_conexion` | String | ✅ Sí | Dirección completa de la conexión |

**Notas:**
- Si un artículo no tiene conexión asociada, `id_conexion` debe ser `null` y `direccion_conexion` debe ser `null` o cadena vacía `""`
- La dirección debe ser la dirección completa de instalación de la conexión

## 💡 Lógica Sugerida (SQL)

La consulta debería hacer un JOIN con la tabla de conexiones para obtener la dirección de cada artículo:

```sql
SELECT
    a.id_articulo,
    a.descripcion,
    a.cantidad_articulo,
    a.precio_unitario,
    a.id_conexion,
    c.direccion AS direccion_conexion
FROM articulos_factura a
LEFT JOIN conexiones c ON a.id_conexion = c.id_conexion
WHERE a.id_factura = ?
```

## 🎨 Visualización en el Frontend

### Vista Actual (antes):
```
Internet 50 Mbps
Cant: 1 x RD$ 1,500.00 = RD$ 1,500.00
```

### Vista Esperada (después):
```
Internet 50 Mbps
📍 Calle Principal #123, Santo Domingo
Cant: 1 x RD$ 1,500.00 = RD$ 1,500.00
```

## ⚠️ Compatibilidad

- Si el backend no puede modificarse inmediatamente, el frontend manejará el caso donde `direccion_conexion` no existe
- Los artículos sin conexión asociada mostrarán solo la descripción

## 📱 Impacto en Funciones

1. **Vista de Detalle**: Tabla de artículos mostrará dirección
2. **Impresión Térmica**: Incluirá dirección debajo de cada artículo
3. **Compartir WhatsApp**: Formato de texto incluirá dirección
4. **Compartir Email**: Formato de email incluirá dirección
5. **Generar PDF**: PDF incluirá dirección

## ✅ Criterios de Aceptación

### **Proceso de Facturación Masiva:**
- [ ] Se creó una copia del proceso existente (archivo legacy preservado)
- [ ] El nuevo proceso consolida servicios por cliente en una sola factura
- [ ] Cada artículo tiene asociado su `id_conexion`
- [ ] El sistema puede alternar entre proceso viejo y nuevo (configuración/flag)
- [ ] Se probó con clientes que tienen múltiples servicios en diferentes direcciones
- [ ] Las facturas consolidadas calculan correctamente los totales

### **Endpoint de Consulta:**
- [ ] Endpoint retorna `direccion_conexion` para cada artículo
- [ ] Endpoint retorna `id_conexion` para cada artículo
- [ ] Artículos sin conexión manejan valores `null` correctamente
- [ ] La dirección es la dirección completa de instalación
- [ ] Backward compatibility: si faltan campos, el frontend no falla

### **Frontend (Ya implementado ✅):**
- [x] Vista de detalle muestra dirección por artículo
- [x] Impresión térmica incluye dirección
- [x] Compartir WhatsApp/Email incluye dirección
- [x] Maneja casos donde `direccion_conexion` no existe

## 🕒 Prioridad

**ALTA** - Impacta directamente en la facturación de clientes y mejora significativamente UX

## 📋 Plan de Implementación Sugerido

### **Fase 1: Preparación** (Estimado: 1-2 días)
1. Identificar el archivo/script del proceso de facturación masiva actual
2. Crear copia de respaldo (renombrar a `_v1_legacy` o similar)
3. Analizar la lógica actual de generación de facturas
4. Documentar la estructura de tablas relacionadas

### **Fase 2: Modificación de Base de Datos** (Estimado: 1 día)
1. Verificar que tabla `articulos_factura` tenga campo `id_conexion`
   - Si no existe, agregar: `ALTER TABLE articulos_factura ADD COLUMN id_conexion INT NULL`
2. Crear índices necesarios para optimizar consultas

### **Fase 3: Nuevo Proceso de Facturación** (Estimado: 2-3 días)
1. Modificar la copia del proceso para:
   - Agrupar servicios por cliente
   - Crear una factura por cliente (no por servicio)
   - Insertar cada servicio como artículo con `id_conexion`
2. Agregar configuración para alternar entre proceso viejo y nuevo
3. Pruebas unitarias del nuevo proceso

### **Fase 4: Modificación del Endpoint** (Estimado: 1 día)
1. Modificar `consulta-facturas-cobradas-por-id_factura`
2. Agregar JOIN con tabla conexiones
3. Incluir campos `id_conexion` y `direccion_conexion` en respuesta
4. Probar con facturas existentes y nuevas

### **Fase 5: Pruebas y Deploy** (Estimado: 2 días)
1. Pruebas con datos de desarrollo
2. Pruebas con datos de producción (ambiente staging)
3. Validación con equipo frontend
4. Deploy a producción con monitoreo
5. Rollback plan si hay problemas (usar proceso legacy)

## 🚧 Casos Especiales y Consideraciones

### **Caso 1: Cliente con un solo servicio**
- Comportamiento: Igual que antes (una factura con un artículo)
- Sin cambios visibles para el usuario final

### **Caso 2: Cliente con múltiples servicios en la misma dirección**
- Comportamiento: Una factura con múltiples artículos, todos mostrando la misma dirección
- Ejemplo:
  ```
  Factura #123
    - Internet 50 Mbps (📍 Calle Principal #45)
    - Cable TV (📍 Calle Principal #45)
    - Teléfono (📍 Calle Principal #45)
  ```

### **Caso 3: Cliente con múltiples servicios en diferentes direcciones**
- Comportamiento: Una factura con múltiples artículos, cada uno con su dirección
- Ejemplo:
  ```
  Factura #123
    - Internet 50 Mbps (📍 Calle Principal #45)
    - Internet 100 Mbps (📍 Av. Independencia #78, Apto 3B)
    - Cable TV (📍 Calle Duarte #12)
  ```

### **Caso 4: Artículos sin conexión asociada**
- Ejemplo: Cargos administrativos, equipos vendidos, etc.
- Comportamiento: `id_conexion = null`, `direccion_conexion = null`
- Vista: Solo muestra descripción sin dirección

### **Caso 5: Facturas ya generadas (legacy)**
- Comportamiento: El endpoint debe funcionar con facturas viejas que no tienen `id_conexion`
- Frontend ya maneja estos casos (no muestra dirección si no existe)

### **Caso 6: Impuestos y Totales**
- Los impuestos (ITBIS, CDT, etc.) se calculan sobre el total de todos los artículos
- Debe funcionar igual que con múltiples facturas, pero consolidado

## 📊 Ejemplo Completo: Antes vs Después

### **Escenario:** Cliente "María Rodríguez" con 3 servicios

**ANTES (Sistema Actual - ❌ INCORRECTO):**
```
=== FACTURA #001 ===
Cliente: María Rodríguez
Fecha: 01/12/2025
Ciclo: Diciembre 2025

Artículos:
  1. Internet 50 Mbps
     Cant: 1 x RD$ 1,500.00 = RD$ 1,500.00

Subtotal: RD$ 1,500.00
ITBIS (18%): RD$ 270.00
Total: RD$ 1,770.00

=== FACTURA #002 ===
Cliente: María Rodríguez
Fecha: 01/12/2025
Ciclo: Diciembre 2025

Artículos:
  1. Internet 100 Mbps
     Cant: 1 x RD$ 2,000.00 = RD$ 2,000.00

Subtotal: RD$ 2,000.00
ITBIS (18%): RD$ 360.00
Total: RD$ 2,360.00

=== FACTURA #003 ===
Cliente: María Rodríguez
Fecha: 01/12/2025
Ciclo: Diciembre 2025

Artículos:
  1. Cable TV Premium
     Cant: 1 x RD$ 800.00 = RD$ 800.00

Subtotal: RD$ 800.00
ITBIS (18%): RD$ 144.00
Total: RD$ 944.00

TOTAL A PAGAR: RD$ 5,074.00 (3 facturas separadas)
```

**DESPUÉS (Sistema Nuevo - ✅ CORRECTO):**
```
=== FACTURA #001 ===
Cliente: María Rodríguez
Fecha: 01/12/2025
Ciclo: Diciembre 2025

Artículos:
  1. Internet 50 Mbps
     📍 Calle Principal #123, Santo Domingo
     Cant: 1 x RD$ 1,500.00 = RD$ 1,500.00

  2. Internet 100 Mbps
     📍 Av. Independencia #45, Apto 3B
     Cant: 1 x RD$ 2,000.00 = RD$ 2,000.00

  3. Cable TV Premium
     📍 Calle Principal #123, Santo Domingo
     Cant: 1 x RD$ 800.00 = RD$ 800.00

Subtotal: RD$ 4,300.00
ITBIS (18%): RD$ 774.00
Total: RD$ 5,074.00

TOTAL A PAGAR: RD$ 5,074.00 (1 factura consolidada)
```

**Beneficios visibles:**
- ✅ Cliente recibe 1 factura en lugar de 3
- ✅ Claridad sobre qué servicio está en qué dirección
- ✅ Mismo total a pagar
- ✅ Mejor experiencia de usuario

## 🔐 Seguridad y Validaciones

- Validar que todos los servicios pertenezcan al mismo cliente antes de consolidar
- Validar que todos los servicios pertenezcan al mismo ciclo de facturación
- Validar que `id_conexion` exista en la tabla de conexiones
- Validar que la dirección no esté vacía cuando existe `id_conexion`

## 📎 Información Adicional

### **Archivos Frontend (Ya Modificados ✅):**
- `src/pantallas/factura/Cards/FacturaCard.tsx` (líneas 99-134)
- `src/pantallas/factura/DetalleFacturaPantalla.tsx` (líneas 136-145) - Impresión
- `src/pantallas/factura/DetalleFacturaPantalla.tsx` (líneas 300-317) - Compartir

### **Archivos Backend a Modificar (Pendiente):**
- Proceso de facturación masiva (archivo a identificar)
- Endpoint: `/api/consulta-facturas-cobradas-por-id_factura`

### **Tablas de Base de Datos:**
- `facturas`
- `articulos_factura` (verificar/agregar campo `id_conexion`)
- `conexiones` (obtener dirección)
- `ciclos_facturacion`

---

**Creado:** 2025-12-02
**Actualizado:** 2025-12-02
**Solicitado por:** Usuario Frontend
**Implementado por:** [Pendiente - Equipo Backend]
**Estado:** 🟡 Pendiente de Implementación Backend | 🟢 Frontend Completo
