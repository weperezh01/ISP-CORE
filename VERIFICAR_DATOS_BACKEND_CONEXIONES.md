# Verificación: Datos de Cliente y Velocidad en Endpoint de Conexiones

## 🎯 Objetivo

Verificar que el endpoint `POST /api/conexiones/listar-por-ciclo` esté retornando correctamente:
1. **Nombre completo del cliente** (nombre + apellido)
2. **Velocidad del servicio/plan**

## 📋 Datos Requeridos en la Respuesta

### Estructura Esperada

```json
{
  "success": true,
  "data": [
    {
      "id_conexion": 5818,
      "cliente": {
        "id_cliente": 4835,
        "nombre": "Juan",           // ← REQUERIDO
        "apellido": "Pérez",        // ← REQUERIDO
        "cedula": "00112345678",
        "telefono": "8091234567",
        "email": "juan@example.com"
      },
      "servicio": {
        "id_servicio": 30,
        "nombre_servicio": "Internet 50 Mbps",
        "precio_servicio": "1500.00",
        "velocidad_servicio": "50"  // ← REQUERIDO (o "velocidad")
      },
      "velocidad": "50",            // ← ALTERNATIVA (si no está en servicio)
      // ... otros campos
    }
  ]
}
```

## ✅ Verificación Requerida

### 1. Verificar Query SQL

Por favor, revisa el endpoint `listarConexionesPorCiclo` en `controllers/conexionesController.js` y confirma que el SELECT incluye:

**Para Cliente:**
```sql
SELECT
    -- ...
    cl.id_cliente,
    cl.nombre,      -- ← ¿Está incluido?
    cl.apellido,    -- ← ¿Está incluido?
    cl.cedula,
    cl.telefono,
    cl.email,
    -- ...
FROM facturas f
INNER JOIN conexiones c ON f.id_conexion = c.id_conexion
LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
```

**Para Velocidad:**
```sql
SELECT
    -- ...
    c.velocidad,                    -- ← Desde conexiones (si existe)
    s.velocidad_servicio,           -- ← Desde servicios (alternativa)
    s.nombre_servicio,
    s.precio_servicio,
    -- ...
FROM facturas f
INNER JOIN conexiones c ON f.id_conexion = c.id_conexion
LEFT JOIN servicios s ON c.id_servicio = s.id_servicio
```

### 2. Ejecutar Test con Ciclo Real

Ejecuta este curl y muéstrame las **primeras 2 conexiones completas**:

```bash
curl -k -X POST https://localhost:444/api/conexiones/listar-por-ciclo \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 1717348}' | jq '.data[0:2]'
```

### 3. Verificar Campos Críticos

De la respuesta anterior, confirma que cada conexión tenga:

```javascript
// ✅ Verificar que estos campos NO sean null/undefined
data[0].cliente.nombre          // ← Debe tener valor
data[0].cliente.apellido        // ← Debe tener valor
data[0].velocidad              // ← O este...
data[0].servicio.velocidad_servicio  // ← ...o este
```

## 🐛 Problemas Comunes

### Problema 1: Cliente sin nombre/apellido

**Síntoma:** `cliente.nombre` o `cliente.apellido` son `null`

**Causa:** El JOIN con `clientes` no está trayendo estos campos

**Solución:** Verificar que el SELECT incluya:
```sql
cl.nombre,
cl.apellido,
```

### Problema 2: Velocidad no disponible

**Síntoma:** No hay campo `velocidad` ni `velocidad_servicio`

**Causa:** Falta incluir el campo en el SELECT

**Solución:** Agregar a la query:
```sql
c.velocidad,                    -- Desde tabla conexiones
s.velocidad_servicio,           -- Desde tabla servicios
```

### Problema 3: Mapeo incorrecto en el código

**Síntoma:** Los campos existen en la base de datos pero no en el JSON

**Causa:** El código del controlador no está mapeando los campos correctamente

**Solución:** Verificar que el mapeo incluya:
```javascript
cliente: {
  id_cliente: row.id_cliente,
  nombre: row.cliente_nombre,      // ← Verificar alias
  apellido: row.cliente_apellido,  // ← Verificar alias
  // ...
},
servicio: {
  id_servicio: row.id_servicio,
  nombre_servicio: row.nombre_servicio,
  precio_servicio: row.precio_servicio,
  velocidad_servicio: row.velocidad_servicio,  // ← Agregar si falta
  // ...
},
velocidad: row.velocidad,  // ← Agregar si falta
```

## 🔧 Corrección Sugerida (Si es necesario)

### Opción A: Agregar campos faltantes al SELECT

```sql
SELECT
    c.id_conexion,
    c.direccion,
    c.id_estado_conexion,
    c.velocidad,                    -- ← AGREGAR SI FALTA
    -- Cliente
    cl.id_cliente,
    cl.nombre AS cliente_nombre,    -- ← AGREGAR SI FALTA
    cl.apellido AS cliente_apellido, -- ← AGREGAR SI FALTA
    cl.cedula,
    cl.telefono,
    cl.email,
    -- Servicio
    s.id_servicio,
    s.nombre_servicio,
    s.precio_servicio,
    s.velocidad_servicio,           -- ← AGREGAR SI FALTA
    -- ... resto de campos
FROM facturas f
INNER JOIN conexiones c ON f.id_conexion = c.id_conexion
LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
LEFT JOIN servicios s ON c.id_servicio = s.id_servicio
-- ... resto de JOINs
WHERE f.id_ciclo = ?
```

### Opción B: Verificar Mapeo de Datos

```javascript
// En el controlador, al construir el objeto de respuesta:
const conexiones = rows.map(row => ({
  id_conexion: row.id_conexion,
  direccion: row.direccion,
  velocidad: row.velocidad,  // ← AGREGAR SI FALTA

  cliente: {
    id_cliente: row.id_cliente,
    nombre: row.cliente_nombre,     // ← VERIFICAR ALIAS
    apellido: row.cliente_apellido, // ← VERIFICAR ALIAS
    cedula: row.cedula,
    telefono: row.telefono,
    email: row.email,
  },

  servicio: {
    id_servicio: row.id_servicio,
    nombre_servicio: row.nombre_servicio,
    precio_servicio: row.precio_servicio,
    velocidad_servicio: row.velocidad_servicio,  // ← AGREGAR SI FALTA
  },

  // ... resto de campos
}));
```

## ✅ Criterios de Éxito

Después de la verificación/corrección:

```bash
# Test 1: Verificar estructura
curl -k -X POST https://localhost:444/api/conexiones/listar-por-ciclo \
  -H "Content-Type: application/json" \
  -d '{"id_ciclo": 1717348}' | jq '.data[0] | {
    cliente: {
      nombre: .cliente.nombre,
      apellido: .cliente.apellido
    },
    velocidad: (.velocidad // .servicio.velocidad_servicio)
  }'

# Resultado esperado:
# {
#   "cliente": {
#     "nombre": "Juan",      # ← NO debe ser null
#     "apellido": "Pérez"    # ← NO debe ser null
#   },
#   "velocidad": "50"        # ← Desde uno de los dos campos
# }
```

## 📊 Frontend ya Actualizado

El frontend (ConnectionItemModern.tsx) ya fue actualizado para:

1. **Soportar ambos formatos de nombre:**
   ```javascript
   const nombres = cliente.nombres || cliente.nombre || '';
   const apellidos = cliente.apellidos || cliente.apellido || '';
   ```

2. **Buscar velocidad en múltiples lugares:**
   ```javascript
   const speed = velocidad || servicio?.velocidad_servicio || servicio?.velocidad;
   ```

3. **Mostrar en vista compacta:**
   - Nombre del cliente
   - Velocidad del plan
   - Precio mensual

Por lo tanto, una vez que el backend retorne los datos correctamente, **el frontend los mostrará automáticamente**.

## 🎯 Respuesta Esperada

Por favor proporciona:

1. **Confirmación de campos en SELECT** (nombre, apellido, velocidad)
2. **Output del test curl** (primeras 2 conexiones)
3. **Confirmación de que los valores NO son null**
4. **Código corregido** (si fue necesario hacer cambios)

## Prioridad

**🟡 MEDIA** - Los datos existen pero no se están mostrando correctamente en el frontend.
