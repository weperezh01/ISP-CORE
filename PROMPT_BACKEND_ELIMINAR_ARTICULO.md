# PROMPT: Implementar Endpoint de Eliminar Artículo de Factura

## Contexto del Proyecto

Estás trabajando en el backend de **ISP-CORE**, un sistema de gestión para proveedores de servicios de internet (ISP). El sistema permite administrar facturas, artículos, clientes, conexiones, y más.

El frontend de React Native ya tiene implementada la funcionalidad de **eliminar artículos de una factura** desde la pantalla de edición (EditarFacturaPantalla), y necesitas implementar el endpoint correspondiente en el backend.

---

## Objetivo

Implementar un endpoint que permita **eliminar un artículo específico de una factura** y **recalcular automáticamente los totales** de la factura.

---

## Especificaciones del Endpoint

### Endpoint Requerido

```
DELETE /api/eliminar-articulo/:id_articulo
```

### Parámetros

- **Path Parameter**:
  - `id_articulo` (number, requerido): ID del artículo a eliminar

### Respuestas Esperadas

#### ✅ Éxito (200 OK)
```json
{
  "message": "Artículo eliminado correctamente",
  "articulo_eliminado": {
    "id_articulo": 74136,
    "descripcion": "Internet 10MB",
    "cantidad": 1,
    "precio_unitario": 300.00,
    "descuento": 0.00,
    "monto": 300.00
  },
  "factura_actualizada": {
    "id_factura": 64555,
    "subtotal": 1500.00,
    "descuento": 0.00,
    "itbis": 270.00,
    "impuesto_selectivo": 150.00,
    "cdt_monto": 30.00,
    "monto_total": 1950.00
  }
}
```

#### ❌ Error - Artículo no existe (404 Not Found)
```json
{
  "error": "Artículo no encontrado",
  "id_articulo": 99999
}
```

#### ❌ Error - Único artículo (400 Bad Request)
```json
{
  "error": "No se puede eliminar el último artículo de la factura",
  "message": "Una factura debe tener al menos un artículo"
}
```

#### ❌ Error - Error del servidor (500 Internal Server Error)
```json
{
  "error": "Error al eliminar el artículo",
  "message": "Descripción del error específico"
}
```

---

## Estructura de las Tablas (Base de Datos)

### Tabla: `articulos_factura`

```sql
CREATE TABLE articulos_factura (
  id_articulo INT AUTO_INCREMENT PRIMARY KEY,
  id_factura INT NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad_articulo DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  descuentoArticulo DECIMAL(10, 2) DEFAULT 0.00,
  itbis_monto DECIMAL(10, 2) DEFAULT 0.00,
  impuesto_selectivo_monto DECIMAL(10, 2) DEFAULT 0.00,
  cdt_monto DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,

  FOREIGN KEY (id_factura) REFERENCES facturas(id_factura) ON DELETE CASCADE
);
```

### Tabla: `facturas`

```sql
CREATE TABLE facturas (
  id_factura INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_ciclo INT NOT NULL,
  id_isp INT NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE,
  subtotal DECIMAL(10, 2) DEFAULT 0.00,
  descuento DECIMAL(10, 2) DEFAULT 0.00,
  itbis DECIMAL(10, 2) DEFAULT 0.00,
  impuesto_selectivo DECIMAL(10, 2) DEFAULT 0.00,
  cdt_monto DECIMAL(10, 2) DEFAULT 0.00,
  monto_total DECIMAL(10, 2) DEFAULT 0.00,
  estado VARCHAR(50) DEFAULT 'pendiente',

  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  FOREIGN KEY (id_ciclo) REFERENCES ciclos(id_ciclo),
  FOREIGN KEY (id_isp) REFERENCES isp(id_isp)
);
```

---

## Lógica de Implementación

### Paso 1: Validar que el artículo existe

```sql
SELECT * FROM articulos_factura WHERE id_articulo = ?
```

- Si no existe → retornar error 404
- Si existe → continuar al paso 2

### Paso 2: Obtener el ID de la factura

```sql
SELECT id_factura FROM articulos_factura WHERE id_articulo = ?
```

### Paso 3: Contar artículos de esa factura

```sql
SELECT COUNT(*) as total_articulos FROM articulos_factura WHERE id_factura = ?
```

- Si `total_articulos = 1` → retornar error 400 (no se puede eliminar el último artículo)
- Si `total_articulos > 1` → continuar al paso 4

### Paso 4: Eliminar el artículo

```sql
DELETE FROM articulos_factura WHERE id_articulo = ?
```

### Paso 5: Recalcular totales de la factura

Después de eliminar el artículo, debes recalcular los totales de la factura basándote en los artículos restantes:

```sql
-- Calcular nuevo subtotal
SELECT SUM(cantidad_articulo * precio_unitario) as nuevo_subtotal
FROM articulos_factura
WHERE id_factura = ?;

-- Calcular nuevo descuento total
SELECT SUM(descuentoArticulo) as nuevo_descuento
FROM articulos_factura
WHERE id_factura = ?;

-- Calcular nuevo ITBIS total
SELECT SUM(itbis_monto) as nuevo_itbis
FROM articulos_factura
WHERE id_factura = ?;

-- Calcular nuevo Impuesto Selectivo total
SELECT SUM(impuesto_selectivo_monto) as nuevo_impuesto_selectivo
FROM articulos_factura
WHERE id_factura = ?;

-- Calcular nuevo CDT total
SELECT SUM(cdt_monto) as nuevo_cdt
FROM articulos_factura
WHERE id_factura = ?;

-- Calcular nuevo monto total
SELECT SUM(total) as nuevo_monto_total
FROM articulos_factura
WHERE id_factura = ?;
```

### Paso 6: Actualizar la factura con los nuevos totales

```sql
UPDATE facturas
SET
  subtotal = ?,
  descuento = ?,
  itbis = ?,
  impuesto_selectivo = ?,
  cdt_monto = ?,
  monto_total = ?
WHERE id_factura = ?;
```

---

## Validaciones Importantes

### 1. Verificar que el artículo existe
```javascript
if (!articulo) {
    return res.status(404).json({
        error: "Artículo no encontrado",
        id_articulo: id_articulo
    });
}
```

### 2. Verificar que no es el último artículo
```javascript
if (totalArticulos <= 1) {
    return res.status(400).json({
        error: "No se puede eliminar el último artículo de la factura",
        message: "Una factura debe tener al menos un artículo"
    });
}
```

### 3. Usar transacciones SQL
Es **crítico** usar transacciones para garantizar que:
- Si falla la eliminación, no se actualizan los totales
- Si falla la actualización de totales, se hace rollback de la eliminación

```javascript
// Pseudocódigo
BEGIN TRANSACTION;

try {
    // 1. Eliminar artículo
    DELETE FROM articulos_factura WHERE id_articulo = ?;

    // 2. Recalcular totales
    SELECT SUM(...) FROM articulos_factura WHERE id_factura = ?;

    // 3. Actualizar factura
    UPDATE facturas SET ... WHERE id_factura = ?;

    COMMIT;
} catch (error) {
    ROLLBACK;
    throw error;
}
```

---

## Ejemplo de Implementación (Node.js + Express + MySQL)

### Estructura del Endpoint

```javascript
// routes/facturaRoutes.js
router.delete('/eliminar-articulo/:id_articulo', eliminarArticulo);

// controllers/facturaController.js
const eliminarArticulo = async (req, res) => {
    const { id_articulo } = req.params;
    const connection = await pool.getConnection();

    try {
        // Iniciar transacción
        await connection.beginTransaction();

        // 1. Verificar que el artículo existe y obtener datos
        const [articuloRows] = await connection.query(
            'SELECT * FROM articulos_factura WHERE id_articulo = ?',
            [id_articulo]
        );

        if (articuloRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                error: "Artículo no encontrado",
                id_articulo: parseInt(id_articulo)
            });
        }

        const articulo = articuloRows[0];
        const id_factura = articulo.id_factura;

        // 2. Contar artículos de la factura
        const [countRows] = await connection.query(
            'SELECT COUNT(*) as total_articulos FROM articulos_factura WHERE id_factura = ?',
            [id_factura]
        );

        const totalArticulos = countRows[0].total_articulos;

        if (totalArticulos <= 1) {
            await connection.rollback();
            return res.status(400).json({
                error: "No se puede eliminar el último artículo de la factura",
                message: "Una factura debe tener al menos un artículo"
            });
        }

        // 3. Eliminar el artículo
        await connection.query(
            'DELETE FROM articulos_factura WHERE id_articulo = ?',
            [id_articulo]
        );

        // 4. Recalcular totales de la factura
        const [totalesRows] = await connection.query(`
            SELECT
                COALESCE(SUM(cantidad_articulo * precio_unitario), 0) as subtotal,
                COALESCE(SUM(descuentoArticulo), 0) as descuento,
                COALESCE(SUM(itbis_monto), 0) as itbis,
                COALESCE(SUM(impuesto_selectivo_monto), 0) as impuesto_selectivo,
                COALESCE(SUM(cdt_monto), 0) as cdt,
                COALESCE(SUM(total), 0) as monto_total
            FROM articulos_factura
            WHERE id_factura = ?
        `, [id_factura]);

        const totales = totalesRows[0];

        // 5. Actualizar la factura con los nuevos totales
        await connection.query(`
            UPDATE facturas
            SET
                subtotal = ?,
                descuento = ?,
                itbis = ?,
                impuesto_selectivo = ?,
                cdt_monto = ?,
                monto_total = ?
            WHERE id_factura = ?
        `, [
            totales.subtotal,
            totales.descuento,
            totales.itbis,
            totales.impuesto_selectivo,
            totales.cdt,
            totales.monto_total,
            id_factura
        ]);

        // Confirmar transacción
        await connection.commit();

        // 6. Retornar respuesta exitosa
        res.status(200).json({
            message: "Artículo eliminado correctamente",
            articulo_eliminado: {
                id_articulo: articulo.id_articulo,
                descripcion: articulo.descripcion,
                cantidad: parseFloat(articulo.cantidad_articulo),
                precio_unitario: parseFloat(articulo.precio_unitario),
                descuento: parseFloat(articulo.descuentoArticulo),
                monto: parseFloat(articulo.total)
            },
            factura_actualizada: {
                id_factura: id_factura,
                subtotal: parseFloat(totales.subtotal),
                descuento: parseFloat(totales.descuento),
                itbis: parseFloat(totales.itbis),
                impuesto_selectivo: parseFloat(totales.impuesto_selectivo),
                cdt_monto: parseFloat(totales.cdt),
                monto_total: parseFloat(totales.monto_total)
            }
        });

    } catch (error) {
        // Revertir transacción en caso de error
        await connection.rollback();
        console.error('Error al eliminar artículo:', error);
        res.status(500).json({
            error: "Error al eliminar el artículo",
            message: error.message
        });
    } finally {
        connection.release();
    }
};

module.exports = { eliminarArticulo };
```

---

## Testing del Endpoint

### Prueba 1: Eliminar artículo exitosamente

```bash
curl -X DELETE http://localhost:3000/api/eliminar-articulo/74136
```

**Resultado esperado**: 200 OK con datos del artículo eliminado y totales actualizados

### Prueba 2: Intentar eliminar artículo inexistente

```bash
curl -X DELETE http://localhost:3000/api/eliminar-articulo/99999
```

**Resultado esperado**: 404 Not Found

### Prueba 3: Intentar eliminar el último artículo

```bash
# Primero, crear una factura con solo 1 artículo
# Luego intentar eliminar ese artículo
curl -X DELETE http://localhost:3000/api/eliminar-articulo/12345
```

**Resultado esperado**: 400 Bad Request con mensaje de error

---

## Consideraciones de Seguridad

### 1. Autenticación
- Verificar que el usuario esté autenticado
- Verificar que tenga permisos para eliminar artículos

### 2. Autorización
- Verificar que el usuario pertenezca al mismo ISP que la factura
- Verificar que el usuario tenga el rol adecuado (admin, super admin)

### 3. Validación de Estado
- NO permitir eliminar artículos de facturas ya pagadas
- NO permitir eliminar artículos de facturas cerradas o canceladas

```javascript
// Verificar estado de la factura antes de eliminar
const [facturaRows] = await connection.query(
    'SELECT estado FROM facturas WHERE id_factura = ?',
    [id_factura]
);

const estadoFactura = facturaRows[0].estado;

if (estadoFactura === 'pagada' || estadoFactura === 'cerrada' || estadoFactura === 'cancelada') {
    await connection.rollback();
    return res.status(403).json({
        error: "No se puede eliminar artículos de esta factura",
        message: `La factura está en estado: ${estadoFactura}`
    });
}
```

---

## Logs Recomendados

Agrega logs para debugging y auditoría:

```javascript
console.log(`[EliminarArticulo] Solicitud para eliminar artículo ID: ${id_articulo}`);
console.log(`[EliminarArticulo] Artículo pertenece a factura ID: ${id_factura}`);
console.log(`[EliminarArticulo] Total artículos antes de eliminar: ${totalArticulos}`);
console.log(`[EliminarArticulo] Artículo eliminado exitosamente`);
console.log(`[EliminarArticulo] Nuevos totales:`, totales);
```

---

## Integración con Sistema de Eventos

**IMPORTANTE**: El frontend ya registra el evento "Artículo eliminado" después de que este endpoint responde exitosamente. **NO necesitas** registrar el evento en el backend.

El frontend llama a `registrarEventoFactura()` automáticamente con estos datos:
- tipo_evento: "Artículo eliminado"
- descripcion: Información del artículo eliminado
- detalles: JSON con id_articulo, cantidad, precio, etc.

---

## Checklist de Implementación

- [ ] Crear el endpoint `DELETE /api/eliminar-articulo/:id_articulo`
- [ ] Implementar validación de artículo existente
- [ ] Implementar validación de último artículo
- [ ] Implementar validación de estado de factura
- [ ] Usar transacciones SQL para garantizar consistencia
- [ ] Eliminar el artículo de la BD
- [ ] Recalcular totales de la factura
- [ ] Actualizar la factura con nuevos totales
- [ ] Retornar respuesta con datos del artículo eliminado
- [ ] Agregar logs para debugging
- [ ] Probar todos los casos (éxito, errores)
- [ ] Verificar que los totales se recalculan correctamente

---

## Notas Adicionales

1. **CASCADE DELETE**: Si tienes configurado `ON DELETE CASCADE` en las foreign keys, ten cuidado de que no se eliminen datos relacionados inesperadamente.

2. **Decimales**: Asegúrate de manejar correctamente los decimales al calcular los totales. Usa `DECIMAL` en SQL y `parseFloat()` en JavaScript.

3. **NULL values**: Usa `COALESCE` en SQL para manejar valores NULL en las sumas.

4. **Performance**: Si tienes millones de facturas, considera agregar índices en `id_factura` en la tabla `articulos_factura`.

---

## Archivos a Crear/Modificar

1. `routes/facturaRoutes.js` - Agregar la nueva ruta
2. `controllers/facturaController.js` - Agregar la función `eliminarArticulo`
3. `server.js` - Asegurarse de que las rutas estén registradas

---

¡Implementa este endpoint y pruébalo! El frontend ya está listo y esperando esta funcionalidad. 🚀
