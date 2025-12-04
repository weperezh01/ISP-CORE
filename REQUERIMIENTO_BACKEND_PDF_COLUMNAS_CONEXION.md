# Requerimiento Backend: Agregar Columnas de Conexión en PDF de Factura

---

## 🎯 Resumen Ejecutivo

Agregar dos nuevas columnas informativas en la tabla de detalles del PDF de factura:
- **Conex ID**: Identificador de la conexión asociada al artículo
- **Dirección**: Dirección de instalación de la conexión

**Ubicación:** Entre las columnas "Descripción" y "Precio Unit."

**Prioridad:** 🟡 MEDIA - Mejora de claridad en facturación

**Estado:** 🟡 Pendiente de Implementación Backend

---

## 📋 Requerimiento Detallado

### **Tabla Actual (ANTES):**

```
┌──────┬─────────────────┬─────────────┬────────┬──────────┐
│ Cant.│ Descripción     │ Precio Unit.│ Desc.  │ Importe  │
├──────┼─────────────────┼─────────────┼────────┼──────────┤
│  1   │ Internet 50 Mbps│ RD$ 1,500.00│   0.00 │ 1,500.00 │
│  1   │ Cable TV        │ RD$   800.00│   0.00 │   800.00 │
└──────┴─────────────────┴─────────────┴────────┴──────────┘
```

### **Tabla Requerida (DESPUÉS):**

```
┌──────┬─────────────────┬──────────┬─────────────────────┬─────────────┬────────┬──────────┐
│ Cant.│ Descripción     │ Conex ID │ Dirección           │ Precio Unit.│ Desc.  │ Importe  │
├──────┼─────────────────┼──────────┼─────────────────────┼─────────────┼────────┼──────────┤
│  1   │ Internet 50 Mbps│   5817   │ F-120               │ RD$ 1,500.00│   0.00 │ 1,500.00 │
│  1   │ Cable TV        │   5818   │ Residencial Zuriel  │ RD$   800.00│   0.00 │   800.00 │
└──────┴─────────────────┴──────────┴─────────────────────┴─────────────┴────────┴──────────┘
```

---

## 🔧 Especificaciones Técnicas

### **Endpoint Afectado**

**URL:** `POST https://wellnet-rd.com:444/api/generar-pdf-factura`

**Request Body:**
```json
{
  "id_factura": 123,
  "datos_factura": {
    "factura": { ... },
    "cliente": { ... },
    "articulos": [
      {
        "id_articulo": 1,
        "descripcion": "Internet 50 Mbps",
        "cantidad_articulo": 1,
        "precio_unitario": 1500.00,
        "descuento": 0.00,
        "id_conexion": 5817,              ← USAR PARA COLUMNA "Conex ID"
        "direccion_conexion": "F-120"     ← USAR PARA COLUMNA "Dirección"
      }
    ],
    ...
  }
}
```

**Response Actual:**
```json
{
  "success": true,
  "pdfUrl": "https://wellnet-rd.com:444/pdfs/factura_123.pdf"
}
```

**Modificación Requerida:**
- Agregar columnas "Conex ID" y "Dirección" en la tabla de detalles del PDF
- Usar `articulo.id_conexion` y `articulo.direccion_conexion` que vienen en `datos_factura.articulos[]`
- Mantener la estructura de response sin cambios

### **Cambios Requeridos**

#### **1. Encabezado de la Tabla**

**Antes:**
```
Cant. | Descripción | Precio Unit. | Desc. | Importe
```

**Después:**
```
Cant. | Descripción | Conex ID | Dirección | Precio Unit. | Desc. | Importe
```

#### **2. Filas de Detalle**

Para cada artículo de la factura:

**Columna "Conex ID":**
- Mostrar: `articulo.id_conexion`
- Formato: Número entero
- Ejemplo: `5817`
- Si es NULL: Mostrar `N/A` o `-`

**Columna "Dirección":**
- Mostrar: `articulo.direccion_conexion` (disponible desde la implementación V2)
- Formato: Texto completo
- Ejemplo: `F-120`, `Residencial Zuriel`, `Calle Principal #123`
- Si es NULL: Mostrar `N/A` o `-`

---

## 📊 Datos Disponibles (Implementación V2)

Desde la implementación V2 consolidada, cada artículo **ya tiene** estos campos disponibles:

```json
{
  "articulos": [
    {
      "id_articulo": 77232,
      "descripcion": "Internet 50 Mbps",
      "cantidad_articulo": 1,
      "precio_unitario": 1500.00,
      "id_conexion": 5817,                    ← YA DISPONIBLE
      "direccion_conexion": "F-120"           ← YA DISPONIBLE
    }
  ]
}
```

**Fuente de datos:**
- Query en `consultaFacturasCobradasPorIdFactura()` ya hace LEFT JOIN con tabla `conexiones`
- Los campos están disponibles en el modelo de datos actual

---

## 🎨 Diseño y Layout

### **Anchos de Columnas Sugeridos**

Considerando que el PDF probablemente usa una tabla con ancho fijo:

| Columna | Ancho Anterior | Ancho Nuevo | Justificación |
|---------|----------------|-------------|---------------|
| Cant. | 8% | 8% | Sin cambio |
| Descripción | 35% | 25% | Reducir para dar espacio |
| **Conex ID** | - | **8%** | **NUEVA** |
| **Dirección** | - | **17%** | **NUEVA** |
| Precio Unit. | 20% | 15% | Reducir ligeramente |
| Desc. | 12% | 10% | Reducir ligeramente |
| Importe | 25% | 17% | Ajustar |

**Total:** 100%

**Nota:** Estos son valores sugeridos. Ajustar según el diseño actual del PDF.

### **Consideraciones de Diseño**

1. **Dirección larga:** Si la dirección es muy larga, considerar:
   - Truncar con `...` si excede espacio
   - O ajustar altura de la fila automáticamente
   - O reducir tamaño de fuente solo para esa columna

2. **Alineación:**
   - Conex ID: Centrado
   - Dirección: Alineado a la izquierda
   - Resto: Mantener alineación actual

3. **Responsive:** Asegurar que la tabla no se desborde del ancho del PDF

---

## 🔍 Casos de Uso

### **Caso 1: Factura con un solo servicio**

```
Cliente: Juan Pérez
Factura #123

┌──────┬─────────────────┬──────────┬─────────────────┬─────────────┬────────┬──────────┐
│ Cant.│ Descripción     │ Conex ID │ Dirección       │ Precio Unit.│ Desc.  │ Importe  │
├──────┼─────────────────┼──────────┼─────────────────┼─────────────┼────────┼──────────┤
│  1   │ Internet 50 Mbps│   5817   │ F-120           │ RD$ 1,500.00│   0.00 │ 1,500.00 │
└──────┴─────────────────┴──────────┴─────────────────┴─────────────┴────────┴──────────┘
```

### **Caso 2: Factura consolidada (múltiples servicios, diferentes direcciones)**

```
Cliente: María Rodríguez
Factura #456 (CONSOLIDADA)

┌──────┬─────────────────┬──────────┬─────────────────────┬─────────────┬────────┬──────────┐
│ Cant.│ Descripción     │ Conex ID │ Dirección           │ Precio Unit.│ Desc.  │ Importe  │
├──────┼─────────────────┼──────────┼─────────────────────┼─────────────┼────────┼──────────┤
│  1   │ Internet 50 Mbps│   5817   │ Calle Principal #123│ RD$ 1,500.00│   0.00 │ 1,500.00 │
│  1   │ Internet 100Mbps│   5818   │ Av. Independencia 45│ RD$ 2,000.00│   0.00 │ 2,000.00 │
│  1   │ Cable TV Premium│   5819   │ Residencial Zuriel  │ RD$   800.00│   0.00 │   800.00 │
└──────┴─────────────────┴──────────┴─────────────────────┴─────────────┴────────┴──────────┘
```

### **Caso 3: Artículo sin conexión (cargo administrativo)**

```
┌──────┬─────────────────┬──────────┬─────────────────┬─────────────┬────────┬──────────┐
│ Cant.│ Descripción     │ Conex ID │ Dirección       │ Precio Unit.│ Desc.  │ Importe  │
├──────┼─────────────────┼──────────┼─────────────────┼─────────────┼────────┼──────────┤
│  1   │ Cargo Admin.    │   N/A    │ N/A             │ RD$   100.00│   0.00 │   100.00 │
└──────┴─────────────────┴──────────┴─────────────────┴─────────────┴────────┴──────────┘
```

---

## 🚨 Restricciones y Validaciones

### **Restricciones**

1. ✅ **NO afectar cálculos:**
   - Los totales, impuestos, y cálculos de precios deben mantenerse idénticos
   - Solo estamos agregando columnas **informativas**

2. ✅ **NO romper layout:**
   - La tabla debe seguir viéndose bien en el diseño actual
   - No debe desbordarse del ancho del PDF
   - Ajustar anchos proporcionalmente

3. ✅ **Compatibilidad con facturas viejas:**
   - Facturas generadas antes de V2 no tienen `direccion_conexion`
   - En ese caso, mostrar `N/A` o dejar en blanco

### **Validaciones**

- ✅ Si `id_conexion` es NULL → Mostrar `N/A`
- ✅ Si `direccion_conexion` es NULL → Mostrar `N/A`
- ✅ Si `direccion_conexion` es muy larga → Truncar o ajustar altura de fila
- ✅ Números de conexión deben ser enteros (sin decimales)

---

## 📂 Archivos Probablemente Afectados

**Nota:** Ubicación exacta puede variar según la estructura del proyecto backend

Posibles ubicaciones:
```
/backend/
├── controllers/
│   ├── facturasController.js  ← Función que genera PDF
│   └── pdfController.js       ← O un controlador específico de PDF
├── utils/
│   └── pdfGenerator.js        ← Lógica de generación de PDF
└── templates/
    └── factura.html           ← Template HTML del PDF (si usa HTML)
```

**Librerías comunes para generar PDF:**
- `pdfkit`
- `jspdf`
- `puppeteer` (HTML → PDF)
- `html-pdf`

---

## ✅ Criterios de Aceptación

### **Frontend:**
- [ ] Al presionar "📄 PDF" en el menú de compartir, se genera el PDF
- [ ] El PDF se puede visualizar en línea (enlace devuelto por backend)

### **Backend - Estructura de Tabla:**
- [ ] La tabla tiene 7 columnas (antes tenía 5)
- [ ] El orden es: Cant. | Descripción | Conex ID | Dirección | Precio Unit. | Desc. | Importe
- [ ] Las nuevas columnas están entre "Descripción" y "Precio Unit."

### **Backend - Datos:**
- [ ] Columna "Conex ID" muestra `articulo.id_conexion`
- [ ] Columna "Dirección" muestra `articulo.direccion_conexion`
- [ ] Artículos sin conexión muestran `N/A` o `-`

### **Backend - Diseño:**
- [ ] La tabla no se desborda del ancho del PDF
- [ ] Todas las columnas son legibles
- [ ] Los anchos están balanceados proporcionalmente

### **Backend - Cálculos:**
- [ ] Los totales se calculan correctamente (sin cambios)
- [ ] Los impuestos se calculan correctamente (sin cambios)
- [ ] El importe por artículo es correcto (sin cambios)

---

## 🧪 Plan de Pruebas

### **1. Generar PDF con Factura Simple**
```bash
# Factura con 1 artículo, 1 conexión
# Verificar que muestra Conex ID y Dirección
```

### **2. Generar PDF con Factura Consolidada**
```bash
# Factura V2 con múltiples artículos, múltiples conexiones
# Verificar que cada artículo muestra su Conex ID y Dirección correctos
```

### **3. Generar PDF con Factura Legacy (V1)**
```bash
# Factura antigua sin direccion_conexion
# Verificar que muestra N/A sin errores
```

### **4. Generar PDF con Artículo sin Conexión**
```bash
# Factura con cargo administrativo (id_conexion = NULL)
# Verificar que muestra N/A en ambas columnas nuevas
```

### **5. Validar Layout**
```bash
# Verificar que la tabla se ve bien en PDF
# Que no se desborda
# Que es legible
```

---

## 📊 Ejemplo de Estructura de Datos (Ya Disponible)

El endpoint de consulta de factura ya retorna estos datos desde la implementación V2:

```json
{
  "factura": {
    "id_factura": 123,
    "monto_total": 4300.00
  },
  "articulos": [
    {
      "id_articulo": 1,
      "descripcion": "Internet 50 Mbps",
      "cantidad_articulo": 1,
      "precio_unitario": 1500.00,
      "descuento": 0.00,
      "id_conexion": 5817,                    ← USAR AQUÍ
      "direccion_conexion": "F-120"           ← USAR AQUÍ
    },
    {
      "id_articulo": 2,
      "descripcion": "Cable TV Premium",
      "cantidad_articulo": 1,
      "precio_unitario": 800.00,
      "descuento": 0.00,
      "id_conexion": 5818,                    ← USAR AQUÍ
      "direccion_conexion": "Residencial Zuriel"  ← USAR AQUÍ
    }
  ]
}
```

---

## 💡 Implementación Sugerida (Pseudo-código)

### **Si el PDF se genera con HTML Template:**

```html
<!-- Antes -->
<table>
  <thead>
    <tr>
      <th>Cant.</th>
      <th>Descripción</th>
      <th>Precio Unit.</th>
      <th>Desc.</th>
      <th>Importe</th>
    </tr>
  </thead>
  <tbody>
    {{#each articulos}}
    <tr>
      <td>{{cantidad_articulo}}</td>
      <td>{{descripcion}}</td>
      <td>{{precio_unitario}}</td>
      <td>{{descuento}}</td>
      <td>{{importe}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>

<!-- Después -->
<table>
  <thead>
    <tr>
      <th width="8%">Cant.</th>
      <th width="25%">Descripción</th>
      <th width="8%">Conex ID</th>        ← NUEVO
      <th width="17%">Dirección</th>      ← NUEVO
      <th width="15%">Precio Unit.</th>
      <th width="10%">Desc.</th>
      <th width="17%">Importe</th>
    </tr>
  </thead>
  <tbody>
    {{#each articulos}}
    <tr>
      <td>{{cantidad_articulo}}</td>
      <td>{{descripcion}}</td>
      <td>{{id_conexion || 'N/A'}}</td>              ← NUEVO
      <td>{{direccion_conexion || 'N/A'}}</td>       ← NUEVO
      <td>{{formatMoney precio_unitario}}</td>
      <td>{{formatMoney descuento}}</td>
      <td>{{formatMoney importe}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>
```

### **Si el PDF se genera con PDFKit u otra librería:**

```javascript
// Ejemplo con PDFKit (ajustar según librería real)

// Antes
doc.text('Cant.', x, y);
doc.text('Descripción', x + 50, y);
doc.text('Precio Unit.', x + 250, y);
doc.text('Desc.', x + 350, y);
doc.text('Importe', x + 420, y);

// Después
doc.text('Cant.', x, y);
doc.text('Descripción', x + 50, y);
doc.text('Conex ID', x + 180, y);        // NUEVO
doc.text('Dirección', x + 240, y);       // NUEVO
doc.text('Precio Unit.', x + 330, y);
doc.text('Desc.', x + 420, y);
doc.text('Importe', x + 480, y);

// Para cada artículo
articulos.forEach((item, index) => {
  const rowY = y + (index + 1) * 20;
  doc.text(item.cantidad_articulo, x, rowY);
  doc.text(item.descripcion, x + 50, rowY);
  doc.text(item.id_conexion || 'N/A', x + 180, rowY);          // NUEVO
  doc.text(item.direccion_conexion || 'N/A', x + 240, rowY);   // NUEVO
  doc.text(formatMoney(item.precio_unitario), x + 330, rowY);
  doc.text(formatMoney(item.descuento), x + 420, rowY);
  doc.text(formatMoney(item.importe), x + 480, rowY);
});
```

---

## 🎯 Beneficios de Este Cambio

1. ✅ **Claridad para el cliente:**
   - Puede identificar exactamente qué servicio está en qué dirección
   - Útil para clientes con múltiples conexiones

2. ✅ **Trazabilidad:**
   - Cada línea de la factura tiene su ID de conexión
   - Facilita la resolución de dudas o reclamos

3. ✅ **Consistencia:**
   - Alinea el PDF con lo que muestra el frontend
   - La información es coherente en todos los canales

4. ✅ **Soporte a Facturación V2:**
   - Aprovecha los datos que ya están disponibles desde V2
   - No requiere nuevas consultas a BD

---

## 📞 Información Adicional

### **Contexto:**
- Este requerimiento es complementario a la **Implementación V2 Consolidada**
- Los datos necesarios (`id_conexion` y `direccion_conexion`) ya están disponibles
- El frontend ya muestra esta información en la app

### **Archivos Frontend de Referencia:**
- `src/pantallas/factura/Cards/FacturaCard.tsx` (muestra direcciones en app)
- `src/pantallas/factura/DetalleFacturaPantalla.tsx` (función de compartir)

### **Documentación Relacionada:**
- `IMPLEMENTACION_FACTURACION_V2_CONSOLIDADA.md` (implementación V2)
- `REQUERIMIENTO_BACKEND_DIRECCION_ARTICULOS.md` (requerimiento original)

---

**Creado:** 2025-12-02
**Solicitado por:** Equipo Frontend
**Para:** Equipo Backend - Modificación de PDF
**Prioridad:** 🟡 MEDIA
**Estado:** 🟡 Pendiente de Implementación
