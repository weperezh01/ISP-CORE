# MENSAJE BACKEND: Pantalla Historial de Eventos de Factura - Verificación y Mejoras

## 🎯 Objetivo
Asegurar que la pantalla de historial de eventos de factura (`EventosFacturaScreen.tsx`) funcione correctamente mostrando todos los eventos y acciones relacionadas a una factura específica.

---

## 📍 Estado Actual del Frontend

**Archivo**: `src/pantallas/factura/EventosFacturaScreen.tsx`

**Endpoint actual usado**:
```javascript
POST https://wellnet-rd.com:444/api/factura/obtener-eventos
Body: { "id_factura": 123 }
```

**Parámetros recibidos**:
- `id_factura`: ID de la factura para ver su historial
- `id_cliente`: ID del cliente (para referencia)

---

## ✅ Lo Que Ya Funciona en el Frontend

1. **Lista de eventos** ordenada por fecha (más recientes primero)
2. **Iconos dinámicos** según tipo de evento:
   - ➕ Crear/Creada → Add circle verde
   - 📦 Artículo agregado → Add box azul
   - 🗑️ Artículo eliminado → Delete rojo
   - ✏️ Artículo editado → Edit naranja
   - 🖨️ Impresión → Print púrpura
   - 📤 Compartir/WhatsApp/Email/PDF → Share cyan
   - 📝 Nota → Note add teal
   - 💰 Pago/Cobro → Attach money verde
   - 💵 Monto/Edit → Edit naranja
   - 👁️ Visualizar/Ver → Visibility gris
   - 📋 Revisión → Rate review rosa
   - 🕐 Otros eventos → History gris

3. **Colores temáticos** por tipo de evento (11 tipos diferentes)
4. **Formateo de fechas** en español (ej: "30 nov. 2024 • 14:30")
5. **Pull-to-refresh** para actualizar la lista
6. **Estado vacío** cuando no hay eventos
7. **Contador** de eventos registrados en el header
8. **Información del usuario** que realizó cada acción
9. **Descripción y detalles** adicionales de cada evento

---

## 📊 Campos que el Frontend Usa Actualmente

```typescript
interface EventoFactura {
  id_evento?: number;           // Opcional - ID único del evento (usado en keyExtractor)
  tipo_evento: string;          // Requerido - Tipo de acción
  descripcion?: string;         // Opcional - Descripción del evento
  fecha_hora: string;           // Requerido - ISO date (YYYY-MM-DDTHH:mm:ss)
  nombre_usuario: string;       // Requerido - Nombre del usuario que realizó la acción
  id_usuario: number;           // Requerido - ID del usuario
  detalles?: string;            // Opcional - Detalles adicionales del evento
}
```

---

## ❓ Preguntas para el Backend

### 1. Endpoint Principal

**¿El endpoint `POST /api/factura/obtener-eventos` existe y funciona correctamente?**
- [ ] Sí, retorna JSON válido
- [ ] No, retorna HTML
- [ ] No existe
- [ ] Existe pero tiene otro nombre

### 2. Tipos de Eventos Disponibles

**¿Qué tipos de eventos se registran para facturas?**

Tipos que el frontend reconoce:
- [ ] "Crear" / "Creada"
- [ ] "Artículo agregado" / "Articulo agregado"
- [ ] "Artículo eliminado" / "Articulo eliminado"
- [ ] "Artículo editado" / "Articulo editado"
- [ ] "Impresión" / "Imprimir"
- [ ] "Compartir" / "WhatsApp" / "Email" / "PDF"
- [ ] "Nota"
- [ ] "Pago" / "Cobro"
- [ ] "Monto" / "Edit"
- [ ] "Visualizar" / "Ver"
- [ ] "Revisión"
- [ ] Otros: _______________

**¿Cómo se guardan en la BD?**
```sql
-- Ejemplos:
tipo_evento = 'Factura creada'
tipo_evento = 'Artículo agregado - Cable UTP'
tipo_evento = 'Pago recibido'
tipo_evento = 'Impresión de factura'
tipo_evento = 'Compartir por WhatsApp'
-- ...
```

### 3. Estructura de la Tabla

**¿Cuál es el nombre de la tabla de eventos de factura?**
- [ ] `eventos_factura`
- [ ] `historial_facturas`
- [ ] `log_facturas`
- [ ] `audit_factura`
- [ ] Otro: _______________

**¿Qué campos tiene la tabla?**
```sql
CREATE TABLE ??? (
  id_evento INT PRIMARY KEY,
  id_factura INT,
  tipo_evento VARCHAR(255),
  descripcion TEXT,
  fecha_hora DATETIME,
  id_usuario INT,
  detalles TEXT,
  -- ¿Hay otros campos?
  ...
);
```

### 4. Relación con Tabla de Usuarios

**¿Cómo se obtiene el nombre del usuario?**
```sql
-- ¿Hay un JOIN con la tabla usuarios?
LEFT JOIN usuarios ON eventos.id_usuario = usuarios.id_usuario

-- ¿O el nombre ya está en la tabla de eventos?
eventos.nombre_usuario
```

### 5. Campos Adicionales Útiles

**¿Hay campos adicionales que podrían ser útiles?**
- [ ] `monto_anterior` / `monto_nuevo` (para cambios de monto)
- [ ] `articulo_id` (ID del artículo afectado)
- [ ] `articulo_nombre` (nombre del artículo)
- [ ] `cantidad` (para artículos agregados/eliminados)
- [ ] `precio` (para artículos agregados/eliminados)
- [ ] `metodo_pago` (para eventos de pago)
- [ ] `monto_pagado` (para eventos de pago)
- [ ] `destinatario` (email/teléfono para compartir)
- [ ] `ip_address` (IP desde donde se realizó la acción)
- [ ] `notas_adicionales`
- [ ] Otros: _______________

### 6. Eventos de Artículos

**¿Cómo se registran los cambios en artículos de la factura?**

Cuando se agrega un artículo:
```json
{
  "tipo_evento": "Artículo agregado",
  "descripcion": "Cable UTP Cat6 - 100 metros",
  "detalles": "Cantidad: 1, Precio: $500.00"
}
```

Cuando se elimina un artículo:
```json
{
  "tipo_evento": "Artículo eliminado",
  "descripcion": "Servicio de instalación",
  "detalles": "Cantidad: 1, Precio: $200.00"
}
```

**¿Es así como se guarda actualmente?**
- [ ] Sí, así está
- [ ] No, se guarda diferente: _______________

### 7. Eventos de Pagos

**¿Cómo se registran los pagos en el historial?**
```json
{
  "tipo_evento": "Pago recibido",
  "descripcion": "Pago parcial registrado",
  "detalles": "Monto: $500.00, Método: Efectivo"
}
```

**¿Hay información adicional de pagos?**
- [ ] Referencia de pago
- [ ] Balance pendiente
- [ ] Método de pago
- [ ] Usuario que procesó el pago
- [ ] Otros: _______________

### 8. Eventos de Compartir

**¿Se registra cuando se comparte la factura?**
```json
{
  "tipo_evento": "Compartir por WhatsApp",
  "descripcion": "Factura compartida al cliente",
  "detalles": "Enviado a: +1829-555-1234"
}
```

**¿Qué información se guarda?**
- [ ] Método de envío (WhatsApp, Email, SMS)
- [ ] Destinatario
- [ ] Estado del envío (exitoso/fallido)
- [ ] Otros: _______________

---

## 🔧 Problemas Potenciales Identificados

### Problema 1: Campo `id_evento` Opcional
```javascript
// El frontend usa id_evento para keyExtractor pero es opcional
keyExtractor={(item, index) => item.id_evento?.toString() || index.toString()}
```

**Solución requerida**: Si `id_evento` existe, siempre incluirlo en la respuesta.

### Problema 2: Campo `nombre_usuario` Faltante
```javascript
// Si el JOIN no se hace correctamente:
nombre_usuario: null // ❌ Frontend muestra "Usuario desconocido"
```

**Solución requerida**: Asegurar que el JOIN con tabla usuarios funcione siempre.

### Problema 3: Formato de Fecha
```javascript
// El frontend espera formato ISO:
fecha_hora: "2024-11-30T14:30:00" // ✅ Correcto
fecha_hora: "2024-11-30 14:30:00" // ⚠️ También funciona pero menos estándar
fecha_hora: "30/11/2024"          // ❌ No funciona
```

**Solución requerida**: Retornar fechas en formato ISO 8601.

### Problema 4: Descripción Vacía
```javascript
// El frontend solo muestra descripción si existe:
{item.descripcion && (
  <View style={styles.cardBody}>
    <Text>{item.descripcion}</Text>
  </View>
)}
```

**Solución recomendada**: Siempre incluir una descripción clara del evento.

---

## 📝 SQL Sugerido para el Endpoint

### Consulta Base
```sql
SELECT
  e.id_evento,
  e.id_factura,
  e.tipo_evento,
  e.descripcion,
  e.fecha_hora,
  e.id_usuario,
  e.detalles,
  CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario
FROM eventos_factura e
LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
WHERE e.id_factura = ?
ORDER BY e.fecha_hora DESC;
```

### Consulta con Información Expandida de Artículos
```sql
SELECT
  e.id_evento,
  e.id_factura,
  e.tipo_evento,
  e.descripcion,
  e.fecha_hora,
  e.id_usuario,
  e.detalles,
  CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
  -- Si hay relación con artículos:
  a.nombre_articulo,
  a.cantidad,
  a.precio
FROM eventos_factura e
LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
LEFT JOIN articulos_factura a ON e.id_articulo = a.id_articulo
WHERE e.id_factura = ?
ORDER BY e.fecha_hora DESC;
```

### Consulta con Información de Pagos
```sql
SELECT
  e.id_evento,
  e.id_factura,
  e.tipo_evento,
  e.descripcion,
  e.fecha_hora,
  e.id_usuario,
  e.detalles,
  CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
  -- Si el evento es un pago:
  p.monto AS monto_pagado,
  p.metodo_pago,
  p.referencia
FROM eventos_factura e
LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
LEFT JOIN pagos p ON e.id_pago = p.id_pago
WHERE e.id_factura = ?
ORDER BY e.fecha_hora DESC;
```

---

## 🎨 Mejoras Sugeridas al Endpoint

### Mejora 1: Estadísticas de Eventos
Agregar contadores al response:
```json
{
  "success": true,
  "data": [ ... ],
  "estadisticas": {
    "total": 25,
    "articulos_agregados": 8,
    "articulos_eliminados": 2,
    "impresiones": 5,
    "compartidas": 3,
    "pagos": 4,
    "visualizaciones": 3
  }
}
```

**Beneficio**: El frontend puede mostrar resúmenes visuales.

### Mejora 2: Información Expandida de Artículos
Para eventos de artículos, incluir detalles completos:
```json
{
  "tipo_evento": "Artículo agregado",
  "descripcion": "Cable UTP Cat6 agregado a la factura",
  "articulo": {
    "id": 123,
    "nombre": "Cable UTP Cat6",
    "cantidad": 100,
    "unidad": "metros",
    "precio_unitario": 5.00,
    "subtotal": 500.00
  }
}
```

**Beneficio**: Detalles completos sin necesidad de parsear strings.

### Mejora 3: Información de Cambios
Para eventos de edición, mostrar antes/después:
```json
{
  "tipo_evento": "Monto modificado",
  "descripcion": "Monto de factura actualizado",
  "cambios": {
    "campo": "monto_total",
    "valor_anterior": 1000.00,
    "valor_nuevo": 1200.00,
    "motivo": "Agregado servicio de instalación"
  }
}
```

**Beneficio**: Auditoría completa de cambios.

### Mejora 4: Eventos de Compartir con Estado
```json
{
  "tipo_evento": "Compartir por WhatsApp",
  "descripcion": "Factura enviada al cliente",
  "compartir": {
    "metodo": "whatsapp",
    "destinatario": "+1829-555-1234",
    "estado": "enviado",
    "fecha_envio": "2024-11-30T14:30:00",
    "leido": true,
    "fecha_lectura": "2024-11-30T14:35:00"
  }
}
```

**Beneficio**: Seguimiento completo del envío.

---

## 🧪 Testing Recomendado

### Test 1: Factura con Eventos
```bash
curl -X POST 'https://wellnet-rd.com:444/api/factura/obtener-eventos' \
  -H 'Content-Type: application/json' \
  -d '{"id_factura": 123}'
```

**Respuesta esperada**: Array de eventos con todos los campos requeridos.

### Test 2: Factura Sin Eventos
```bash
curl -X POST 'https://wellnet-rd.com:444/api/factura/obtener-eventos' \
  -H 'Content-Type: application/json' \
  -d '{"id_factura": 9999}'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": []
}
```
O simplemente: `[]`

### Test 3: Factura Recién Creada
```bash
# Factura que solo tiene evento de creación
curl -X POST 'https://wellnet-rd.com:444/api/factura/obtener-eventos' \
  -H 'Content-Type: application/json' \
  -d '{"id_factura": 1}'
```

**Respuesta esperada**:
```json
[
  {
    "id_evento": 1,
    "tipo_evento": "Factura creada",
    "descripcion": "Factura generada para el cliente",
    "fecha_hora": "2024-11-30T10:00:00",
    "nombre_usuario": "Juan Pérez",
    "id_usuario": 5,
    "detalles": null
  }
]
```

### Test 4: Factura Inválida
```bash
curl -X POST 'https://wellnet-rd.com:444/api/factura/obtener-eventos' \
  -H 'Content-Type: application/json' \
  -d '{"id_factura": "invalid"}'
```

**Respuesta esperada**:
```json
{
  "success": false,
  "error": "id_factura debe ser numérico"
}
```

---

## 📋 Ejemplo de Respuesta Ideal

```json
[
  {
    "id_evento": 156,
    "tipo_evento": "Pago recibido",
    "descripcion": "Pago parcial registrado por el cliente",
    "fecha_hora": "2024-11-30T15:30:00",
    "nombre_usuario": "María García",
    "id_usuario": 8,
    "detalles": "Monto: $500.00, Método: Transferencia, Ref: TRX-12345"
  },
  {
    "id_evento": 155,
    "tipo_evento": "Compartir por WhatsApp",
    "descripcion": "Factura enviada al cliente vía WhatsApp",
    "fecha_hora": "2024-11-30T14:00:00",
    "nombre_usuario": "Carlos Rodríguez",
    "id_usuario": 3,
    "detalles": "Enviado a: +1829-555-1234, Estado: Entregado"
  },
  {
    "id_evento": 154,
    "tipo_evento": "Artículo agregado",
    "descripcion": "Servicio de instalación agregado",
    "fecha_hora": "2024-11-30T12:00:00",
    "nombre_usuario": "Juan Pérez",
    "id_usuario": 5,
    "detalles": "Cantidad: 1, Precio: $200.00"
  },
  {
    "id_evento": 153,
    "tipo_evento": "Artículo editado",
    "descripcion": "Cantidad de Cable UTP modificada",
    "fecha_hora": "2024-11-30T11:30:00",
    "nombre_usuario": "Juan Pérez",
    "id_usuario": 5,
    "detalles": "Cantidad anterior: 50m, Nueva cantidad: 100m"
  },
  {
    "id_evento": 152,
    "tipo_evento": "Impresión de factura",
    "descripcion": "Factura impresa para entrega física",
    "fecha_hora": "2024-11-30T11:00:00",
    "nombre_usuario": "Ana López",
    "id_usuario": 12,
    "detalles": "Impresora: HP LaserJet, Copias: 2"
  },
  {
    "id_evento": 151,
    "tipo_evento": "Factura creada",
    "descripcion": "Factura generada para el cliente",
    "fecha_hora": "2024-11-30T10:00:00",
    "nombre_usuario": "Sistema",
    "id_usuario": 1,
    "detalles": "Ciclo de facturación: Noviembre 2024"
  }
]
```

---

## ✅ Checklist de Implementación

### Endpoint Principal
- [ ] Ruta `POST /api/factura/obtener-eventos` configurada
- [ ] Validar que `id_factura` sea numérico
- [ ] Retornar JSON, nunca HTML
- [ ] Incluir todos los campos requeridos:
  - [ ] `id_evento` (si existe en la tabla)
  - [ ] `tipo_evento`
  - [ ] `descripcion`
  - [ ] `fecha_hora` (formato ISO)
  - [ ] `nombre_usuario` (con JOIN a tabla usuarios)
  - [ ] `id_usuario`
  - [ ] `detalles` (si existe)
- [ ] Ordenar por fecha_hora DESC (más recientes primero)
- [ ] Manejar caso cuando no hay eventos (retornar array vacío)
- [ ] Content-Type: application/json
- [ ] Responder en <3 segundos

### Registro de Eventos (Verificar que Funcione)
- [ ] Se registra evento al crear factura
- [ ] Se registra evento al agregar artículo
- [ ] Se registra evento al eliminar artículo
- [ ] Se registra evento al editar artículo
- [ ] Se registra evento al imprimir factura
- [ ] Se registra evento al compartir factura (WhatsApp, Email, PDF)
- [ ] Se registra evento al agregar nota
- [ ] Se registra evento al recibir pago
- [ ] Se registra evento al modificar monto
- [ ] Se registra evento al visualizar factura

### Mejoras Opcionales
- [ ] Agregar estadísticas de eventos
- [ ] Información expandida de artículos
- [ ] Detalles de cambios (antes/después)
- [ ] Estado de envíos (compartir)
- [ ] Filtros por tipo de evento
- [ ] Paginación (si >100 eventos)

---

## 📞 Respuestas Requeridas

**Por favor, responder las siguientes preguntas:**

1. **¿El endpoint `POST /api/factura/obtener-eventos` existe y funciona?**
   - Respuesta: _______________

2. **¿Qué tipos de eventos se registran actualmente para facturas?**
   - Respuesta: _______________

3. **¿Cuál es el nombre real de la tabla de eventos en la BD?**
   - Respuesta: _______________

4. **¿Se hace JOIN con tabla usuarios para obtener el nombre?**
   - Respuesta: _______________

5. **¿Hay campos adicionales útiles que no estamos usando?**
   - Respuesta: _______________

6. **¿Se registran automáticamente todos los eventos (crear, editar, pagar, compartir)?**
   - Respuesta: _______________

7. **¿Hay información de artículos/pagos en eventos relacionados?**
   - Respuesta: _______________

8. **¿Hay algún problema conocido con este endpoint?**
   - Respuesta: _______________

---

## 🚀 Prioridad

**MEDIA** - Esta pantalla es útil para auditoría y seguimiento de cambios en facturas, especialmente para resolver disputas con clientes.

---

## 🎯 Resultado Esperado

Después de verificar/corregir el endpoint:

1. ✅ La lista de eventos se carga correctamente
2. ✅ Todos los tipos de eventos se muestran
3. ✅ Los nombres de usuarios se muestran correctamente
4. ✅ Las fechas se formatean correctamente
5. ✅ Los íconos y colores se asignan según el tipo de evento
6. ✅ Las descripciones son claras y útiles
7. ✅ No hay errores en consola
8. ✅ El rendimiento es óptimo (<3 segundos)

---

## 💡 Casos de Uso Reales

### Caso 1: Auditoría de Cambios
Cliente reclama que le cobraron más de lo acordado:
- Ver historial completo de la factura
- Verificar si se agregaron artículos
- Quién los agregó y cuándo
- Qué cambios de monto hubo

### Caso 2: Seguimiento de Pagos
Verificar el estado de pagos de una factura:
- Cuántos pagos se han recibido
- Fechas de cada pago
- Métodos de pago utilizados
- Quién procesó cada pago

### Caso 3: Verificar Envíos
Cliente dice que no recibió la factura:
- Ver si se compartió por WhatsApp/Email
- A qué número/email se envió
- Cuándo se envió
- Si fue entregado/leído

### Caso 4: Historial de Impresiones
Saber cuántas veces se imprimió una factura:
- Fechas de impresión
- Quién la imprimió
- Cuántas copias

---

**Fecha de creación**: 2025-11-30
**Desarrollador Frontend**: Verificar `src/pantallas/factura/EventosFacturaScreen.tsx`
**Estado**: Esperando respuesta del backend para verificar funcionalidad
