# Especificación Backend: Preview de Notas en Lista de Facturas

## Problema Actual

El endpoint `/api/consulta-facturas` **NO retorna las notas** de cada factura, o las retorna mal formateadas (como `string` en lugar de `array`).

**Logs actuales:**
```javascript
// Factura 58592
notas: null  // ❌ No hay notas

// Factura 55853
notas: "Esto es una prueba..."  // ❌ String en lugar de array
```

El endpoint de detalle `/api/consulta-facturas-cobradas-por-id_factura` SÍ retorna las notas correctamente como array de objetos.

---

## Solución RECOMENDADA: Extender endpoint existente

### Endpoint a modificar:
**POST** `https://wellnet-rd.com:444/api/consulta-facturas`

### Request (sin cambios):
```json
{
  "id_ciclo": 123,
  "estado": "pendiente"  // opcional
}
```

### Response NUEVO (agregar 2 campos por factura):

```json
[
  {
    "id_factura": 58592,
    "id_cliente": 456,
    "id_ciclo": 123,
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono1": "8091234567",
    "direccion": "Calle 123",
    "monto_total": 1500.00,
    "estado": "pendiente",
    "fecha_emision": "2025-01-08T04:00:00.000Z",

    // ✅ NUEVOS CAMPOS
    "notes_preview": [
      {
        "id_nota": 2,
        "nombre": "Pedro",
        "apellido": "Martínez",
        "estado_revision": "revisado"
      },
      {
        "id_nota": 1,
        "nombre": "María",
        "apellido": "González",
        "estado_revision": "en_revision"
      }
    ],
    "notes_count": 5  // Total de notas de la factura
  }
]
```

### Reglas de negocio:

1. **`notes_preview`**: Array con las **2 notas más recientes** de la factura
   - Ordenar por `fecha DESC, hora DESC`
   - Incluir **SOLO** los campos: `id_nota`, `nombre`, `apellido`, `estado_revision`
   - **NO incluir**: `nota` (texto), `fecha`, `hora` (para reducir payload)
   - Si no hay notas: `notes_preview: null` o `notes_preview: []`

2. **`notes_count`**: Número total de notas de la factura
   - Si no hay notas: `notes_count: 0`

3. **`estado_revision`**: Debe ser uno de estos valores:
   - `"aprobada"` (verde) - Nota revisada y aprobada
   - `"en_revision"` (naranja, prioridad alta) - Nota en proceso de revisión
   - `null` (gris) - Nota pendiente de revisión

### Query SQL sugerido (pseudo-código):

```sql
-- Para cada factura en el resultado principal
SELECT
  f.*,
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'id_nota', n.id_nota,
        'nombre', u.nombre,
        'apellido', u.apellido,
        'estado_revision', COALESCE(n.estado_revision, 'pendiente')
      )
    )
    FROM (
      SELECT n.*, u.nombre, u.apellido
      FROM notas n
      INNER JOIN usuarios u ON n.id_usuario = u.id_usuario
      WHERE n.id_factura = f.id_factura
      ORDER BY n.fecha DESC, n.hora DESC
      LIMIT 2
    ) AS n
  ) AS notes_preview,
  (
    SELECT COUNT(*)
    FROM notas n
    WHERE n.id_factura = f.id_factura
  ) AS notes_count
FROM facturas f
WHERE f.id_ciclo = ?
  AND (? IS NULL OR f.estado = ?);
```

---

## Solución ALTERNATIVA: Endpoint batch (si no se puede tocar el listado)

Si no es posible modificar `/api/consulta-facturas`, crear un nuevo endpoint:

### Endpoint:
**POST** `https://wellnet-rd.com:444/api/consulta-notas-preview`

### Request:
```json
{
  "ids": [58592, 55853, 59123],  // Array de id_factura
  "limit": 2  // Opcional, por defecto 2
}
```

### Response:
```json
{
  "58592": {
    "notes_preview": [
      {
        "id_nota": 2,
        "nombre": "Pedro",
        "apellido": "Martínez",
        "estado_revision": "revisado"
      }
    ],
    "notes_count": 1
  },
  "55853": {
    "notes_preview": null,
    "notes_count": 0
  },
  "59123": {
    "notes_preview": [
      { "id_nota": 5, "nombre": "Ana", "apellido": "López", "estado_revision": "en_revision" },
      { "id_nota": 3, "nombre": "Carlos", "apellido": "Ruiz", "estado_revision": "revisado" }
    ],
    "notes_count": 8
  }
}
```

### Ventajas:
- Una sola llamada batch para todas las facturas visibles
- No modifica el endpoint existente
- Permite cachear resultados en el frontend

### Desventajas:
- Requiere un fetch adicional después de cargar el listado
- Mayor complejidad en el frontend

---

## Tipos TypeScript para referencia

```typescript
export type NotaEstado = 'en_revision' | 'revisado' | 'pendiente';

export interface NotaPreview {
  id_nota: number;
  nombre: string | null;
  apellido: string | null;
  estado_revision: NotaEstado;
}

export interface FacturaListItem {
  id_factura: number;
  id_cliente: number;
  id_ciclo: number;
  nombres: string;
  apellidos: string;
  telefono1: string;
  direccion: string;
  monto_total: number;
  estado: 'pagado' | 'pendiente' | 'vencido';
  fecha_emision: string;
  notes_preview?: NotaPreview[] | null;  // ✅ NUEVO
  notes_count?: number | null;           // ✅ NUEVO
}
```

---

## Pruebas sugeridas

### 1. Factura sin notas:
```json
{
  "id_factura": 1001,
  "notes_preview": null,
  "notes_count": 0
}
```

### 2. Factura con 1 nota:
```json
{
  "id_factura": 1002,
  "notes_preview": [
    { "id_nota": 1, "nombre": "Juan", "apellido": "Pérez", "estado_revision": "en_revision" }
  ],
  "notes_count": 1
}
```

### 3. Factura con 5 notas (devolver solo 2 más recientes):
```json
{
  "id_factura": 1003,
  "notes_preview": [
    { "id_nota": 5, "nombre": "Ana", "apellido": "López", "estado_revision": "revisado" },
    { "id_nota": 4, "nombre": "Carlos", "apellido": "Ruiz", "estado_revision": "en_revision" }
  ],
  "notes_count": 5
}
```

### 4. Nota con autor sin apellido:
```json
{
  "notes_preview": [
    { "id_nota": 7, "nombre": "María", "apellido": null, "estado_revision": "pendiente" }
  ]
}
```

---

## Rendimiento

- **Sin optimización**: 228 facturas → 228+ queries adicionales ❌
- **Con JOIN**: 228 facturas → 1 query principal ✅
- **Con batch**: 228 facturas → 1 query listado + 1 query batch ✅

**Recomendación**: Implementar con LEFT JOIN en el query principal para máxima eficiencia.

---

## Checklist de implementación

- [ ] Modificar query de `/api/consulta-facturas` para incluir `notes_preview` y `notes_count`
- [ ] Asegurar que `notes_preview` retorne máximo 2 notas ordenadas por fecha/hora descendente
- [ ] Validar que `estado_revision` sea uno de: `en_revision`, `revisado`, `pendiente`
- [ ] Manejar casos donde `nombre` o `apellido` sean NULL
- [ ] Manejar casos donde no hay notas (retornar `null` o `[]` y `notes_count: 0`)
- [ ] Probar con facturas con 0, 1, 2, y >2 notas
- [ ] Verificar performance con 200+ facturas en el ciclo
- [ ] Documentar cambios en API docs

---

## Contacto Frontend

Una vez implementado, el frontend ya está listo para consumir estos datos:
- Componente `NotesPreview` creado en `src/pantallas/factura/Cards/NotesPreview.tsx`
- Tipos TypeScript definidos en `src/pantallas/factura/types.ts`
- Integración en `FacturasScreen.tsx` lista para recibir los datos
- Scroll automático a notas implementado en `DetalleFacturaPantalla.tsx`

Solo falta que el backend retorne los campos `notes_preview` y `notes_count`.
