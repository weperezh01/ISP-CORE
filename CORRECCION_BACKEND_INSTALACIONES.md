# Corrección Backend: Endpoint Instalaciones

## Problema Identificado

El endpoint `/api/instalaciones-isp` está devolviendo un error de SQL:

```json
{
  "error": "Error al obtener instalaciones",
  "message": "Unknown column 'cx.id_tecnico' in 'on clause'"
}
```

## Causa del Error

La consulta SQL está intentando hacer un **JOIN** usando la columna `cx.id_tecnico`, pero esta columna **NO EXISTE** en la tabla de conexiones (`cx`).

## Soluciones Posibles

### Opción 1: La información del técnico está en la tabla de instalaciones

Si el `id_tecnico` está en la tabla de **instalaciones** en lugar de conexiones:

```sql
-- ❌ INCORRECTO (causando el error)
SELECT ...
FROM instalaciones i
LEFT JOIN conexiones cx ON cx.id_conexion = i.id_conexion
LEFT JOIN tecnicos t ON t.id_tecnico = cx.id_tecnico  -- ❌ cx.id_tecnico NO EXISTE

-- ✅ CORRECTO
SELECT ...
FROM instalaciones i
LEFT JOIN conexiones cx ON cx.id_conexion = i.id_conexion
LEFT JOIN tecnicos t ON t.id_tecnico = i.id_tecnico  -- ✅ i.id_tecnico SI EXISTE
```

### Opción 2: Agregar la columna id_tecnico a la tabla conexiones

Si el diseño de la base de datos requiere que `id_tecnico` esté en la tabla de conexiones:

```sql
ALTER TABLE conexiones
ADD COLUMN id_tecnico INT,
ADD FOREIGN KEY (id_tecnico) REFERENCES tecnicos(id_tecnico);
```

## Ubicación del Código a Corregir

Buscar en el backend el archivo que maneja el endpoint:
- **Ruta**: `/api/instalaciones-isp`
- **Método**: POST
- **Buscar por**: `instalaciones-isp` o el error `"Error al obtener instalaciones"`

## Ejemplo de Query Corregido

Asumiendo que `id_tecnico` está en la tabla `instalaciones`:

```javascript
router.post('/instalaciones-isp', async (req, res) => {
    const { id_isp } = req.body;

    try {
        const query = `
            SELECT
                i.id_instalacion,
                i.id_conexion,
                i.id_estado_conexion,
                i.fecha_guardado,
                c.nombre AS nombreCliente,
                c.cedula AS cliente_cedula,
                c.telefono AS cliente_telefono,
                c.direccion AS cliente_direccion,
                t.nombre AS nombreTecnico,
                t.telefono AS tecnico_telefono,
                t.email AS tecnico_email,
                tc.nombre AS tipo_conexion,
                cx.velocidad_bajada AS conexion_velocidad_bajada,
                cx.velocidad_subida AS conexion_velocidad_subida,
                cx.estado AS conexion_estado,
                cx.direccion_instalacion AS conexion_direccion
            FROM instalaciones i
            LEFT JOIN conexiones cx ON cx.id_conexion = i.id_conexion
            LEFT JOIN clientes c ON c.id = cx.id_cliente
            LEFT JOIN tecnicos t ON t.id_tecnico = i.id_tecnico
            LEFT JOIN tipos_conexion tc ON tc.id_tipo_conexion = cx.id_tipo_conexion
            WHERE cx.id_isp = ?
            ORDER BY i.fecha_guardado DESC
        `;

        const [instalaciones] = await pool.query(query, [id_isp]);

        res.json(instalaciones);
    } catch (error) {
        console.error('Error al obtener instalaciones:', error);
        res.status(500).json({
            error: 'Error al obtener instalaciones',
            message: error.message
        });
    }
});
```

## Verificación

Para verificar qué columnas existen en la tabla de conexiones:

```sql
DESCRIBE conexiones;
-- o
SHOW COLUMNS FROM conexiones;
```

Para verificar qué columnas existen en la tabla de instalaciones:

```sql
DESCRIBE instalaciones;
-- o
SHOW COLUMNS FROM instalaciones;
```

## Estado Actual

- ✅ Frontend actualizado para mostrar el error de manera clara
- ❌ Backend requiere corrección en el endpoint `/api/instalaciones-isp`

---

**Fecha**: 2025-01-14
**Estado**: Pendiente corrección en backend
