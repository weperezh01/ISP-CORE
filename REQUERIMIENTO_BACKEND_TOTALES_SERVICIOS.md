# REQUERIMIENTO BACKEND: Endpoint Totales de Servicios

## 🎯 Objetivo
Implementar el endpoint de totales de servicios para que los indicadores numéricos en el botón "Servicios" del Panel de Control y Gestión muestren información valiosa sobre planes, suscripciones e ingresos.

---

## 📍 Ubicación en Frontend
**Archivo**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
**Botón**: "Servicios" (ID: 3)
**Pantalla destino**: `ServiciosScreen`
**Estado actual**: Sin indicadores (navegación básica)

---

## 🔗 Endpoint Requerido

```
GET https://wellnet-rd.com:444/api/totales-servicios/{ispId}
```

**Parámetros**:
- `ispId` (path parameter): ID del ISP del cual se requieren los totales

**Headers esperados**:
```json
{
  "Accept": "application/json",
  "Content-Type": "application/json"
}
```

**Timeout**: 10 segundos

---

## 📤 Respuesta Esperada

El endpoint debe retornar un objeto JSON con la siguiente estructura:

### Formato Directo con CamelCase (Preferido)
```json
{
  "success": true,
  "data": {
    "totalServicios": 25,
    "totalSuscripciones": 905,
    "precioPromedio": 1050.50,
    "ingresoEstimadoMensual": 950702.50,
    "estadisticas": {
      "serviciosConUso": 20,
      "serviciosSinUso": 5,
      "servicioMasPopular": {
        "nombre": "Internet 10 Mbps",
        "suscripciones": 459,
        "precio": 800.00
      },
      "rangoPrecios": {
        "minimo": 300.00,
        "maximo": 1500.00
      }
    },
    "serviciosAdicionales": {
      "total": 6,
      "activos": 5,
      "inactivos": 1
    }
  }
}
```

### Formato Snake Case (También Soportado)
```json
{
  "success": true,
  "data": {
    "total_servicios": 25,
    "total_suscripciones": 905,
    "precio_promedio": 1050.50,
    "ingreso_estimado_mensual": 950702.50,
    "estadisticas": {
      "servicios_con_uso": 20,
      "servicios_sin_uso": 5,
      "servicio_mas_popular": {
        "nombre": "Internet 10 Mbps",
        "suscripciones": 459,
        "precio": 800.00
      },
      "rango_precios": {
        "minimo": 300.00,
        "maximo": 1500.00
      }
    },
    "servicios_adicionales": {
      "total": 6,
      "activos": 5,
      "inactivos": 1
    }
  }
}
```

---

## 📊 Campos Requeridos

### Campos Principales

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `totalServicios` | number | Total de planes/servicios configurados | ✅ |
| `totalSuscripciones` | number | Total de conexiones activas con servicio asignado | ✅ |
| `precioPromedio` | number | Precio promedio de los servicios | ✅ |
| `ingresoEstimadoMensual` | number | Ingreso mensual estimado (suma de todos los servicios activos) | ✅ |
| `estadisticas` | object | Estadísticas detalladas | ✅ |
| `serviciosAdicionales` | object | Información de servicios complementarios | ⚠️ Opcional |

### Objeto estadisticas

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `serviciosConUso` | number | Servicios que tienen al menos 1 suscripción activa | ✅ |
| `serviciosSinUso` | number | Servicios configurados sin suscripciones | ✅ |
| `servicioMasPopular` | object | Servicio con más suscripciones | ✅ |
| `rangoPrecios` | object | Rango de precios (mínimo y máximo) | ✅ |

### Objeto servicioMasPopular

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `nombre` | string | Nombre del servicio | ✅ |
| `suscripciones` | number | Cantidad de suscripciones activas | ✅ |
| `precio` | number | Precio del servicio | ✅ |

### Objeto rangoPrecios

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `minimo` | number | Precio del servicio más económico | ✅ |
| `maximo` | number | Precio del servicio más caro | ✅ |

### Objeto serviciosAdicionales (Opcional)

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `total` | number | Total de servicios adicionales | ⚠️ Opcional |
| `activos` | number | Servicios adicionales activos | ⚠️ Opcional |
| `inactivos` | number | Servicios adicionales inactivos | ⚠️ Opcional |

---

## 🎨 Uso en la UI

Los datos se muestran dentro del botón "Servicios" en el Panel de Control y Gestión:

```
┌─────────────────────────────┐
│   📦 Servicios              │
│                              │
│   Planes: 25                 │
│   Suscripciones: 905         │
│   ▓▓▓▓▓▓▓▓░                 │  ← Gráfico: Con uso / Sin uso
│                              │
│   💰 Ingreso mensual         │
│      $950,702.50             │
│                              │
│   📊 Precio prom: $1,050.50  │
│   🌟 Más popular:            │
│      Internet 10 Mbps (459)  │
└─────────────────────────────┘
```

**Gráfico visual**:
- **Verde**: Servicios con uso (tienen suscripciones)
- **Gris**: Servicios sin uso (configurados pero sin suscripciones)

**Formato de moneda**:
- Usar separadores de miles con comas
- 2 decimales
- Símbolo $ o la moneda local

---

## 🗄️ Estructura de Base de Datos

### Tabla TipoServicio (Planes Principales)
```sql
CREATE TABLE TipoServicio (
  id_servicio INT PRIMARY KEY,
  id_isp INT,
  id_usuario INT,
  nombre_servicio VARCHAR(255),
  descripcion_servicio TEXT,
  precio_servicio DECIMAL(10,2),
  velocidad_servicio DECIMAL(10,2),  -- NULL para servicios no-Internet
  created_at_servicio TIMESTAMP,
  updated_at_servicio TIMESTAMP
);
```

### Tabla servicios_adicionales (Complementarios)
```sql
CREATE TABLE servicios_adicionales (
  id INT PRIMARY KEY,
  isp_id INT,
  nombre VARCHAR(255),
  descripcion TEXT,
  precio DECIMAL(10,2),
  tipo ENUM('producto', 'servicio', 'complemento'),
  activo TINYINT(1),  -- 0 = inactivo, 1 = activo
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Relación con Conexiones
```sql
conexiones.id_servicio -> TipoServicio.id_servicio
```

**Estado de conexión activa**: `id_estado_conexion = 3`

---

## 📝 Lógica de Negocio Implementada (Backend)

### Consulta 1: Totales Principales
```sql
SELECT
    COUNT(DISTINCT s.id_servicio) as totalServicios,
    COUNT(DISTINCT c.id_conexion) as totalSuscripciones,
    COALESCE(AVG(s.precio_servicio), 0) as precioPromedio,
    COALESCE(SUM(CASE WHEN c.id_conexion IS NOT NULL THEN s.precio_servicio ELSE 0 END), 0) as ingresoEstimadoMensual,
    COUNT(DISTINCT CASE WHEN c.id_conexion IS NOT NULL THEN s.id_servicio END) as serviciosConUso,
    COUNT(DISTINCT CASE WHEN c.id_conexion IS NULL THEN s.id_servicio END) as serviciosSinUso
FROM TipoServicio s
LEFT JOIN conexiones c ON s.id_servicio = c.id_servicio AND c.id_estado_conexion = 3
WHERE s.id_isp = ?;
```

### Consulta 2: Servicio Más Popular
```sql
SELECT
    s.nombre_servicio as nombre,
    s.precio_servicio as precio,
    COUNT(c.id_conexion) as suscripciones
FROM TipoServicio s
INNER JOIN conexiones c ON s.id_servicio = c.id_servicio AND c.id_estado_conexion = 3
WHERE s.id_isp = ?
GROUP BY s.id_servicio, s.nombre_servicio, s.precio_servicio
ORDER BY suscripciones DESC
LIMIT 1;
```

### Consulta 3: Rango de Precios
```sql
SELECT
    MIN(precio_servicio) as minimo,
    MAX(precio_servicio) as maximo
FROM TipoServicio
WHERE id_isp = ?;
```

### Consulta 4: Servicios Adicionales (Opcional)
```sql
SELECT
    COUNT(*) as total,
    SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
    SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos
FROM servicios_adicionales
WHERE isp_id = ?;
```

---

## ⚠️ Manejo de Errores

### Caso 1: Endpoint No Disponible
```javascript
// Frontend mostrará: 0 en todos los campos
// Console: "❌ Error en totales-servicios: [mensaje]"
```

### Caso 2: Respuesta HTML en lugar de JSON
```javascript
// Frontend detecta: payload.trim().startsWith('<')
// Console: "❌ API totales-servicios retornó HTML"
// Acción: Todos los valores = 0
```

### Caso 3: Timeout (>10 segundos)
```javascript
// Frontend cancela la petición
// Console: "❌ Error en totales-servicios: timeout"
// Acción: Todos los valores = 0
```

### Caso 4: Sin Servicios Configurados
Si `totalServicios` es 0:
```json
{
  "success": true,
  "data": {
    "totalServicios": 0,
    "totalSuscripciones": 0,
    "precioPromedio": 0,
    "ingresoEstimadoMensual": 0,
    "estadisticas": {
      "serviciosConUso": 0,
      "serviciosSinUso": 0,
      "servicioMasPopular": null,
      "rangoPrecios": {
        "minimo": 0,
        "maximo": 0
      }
    }
  }
}
```

### Caso 5: Sin Servicio Más Popular
Si no hay servicios con suscripciones:
```json
"servicioMasPopular": null
```

---

## ✅ Checklist de Implementación

- [ ] Crear ruta `GET /api/totales-servicios/:ispId`
- [ ] Validar que `ispId` sea un número válido
- [ ] Implementar consulta para totales principales (Consulta 1)
- [ ] Implementar consulta para servicio más popular (Consulta 2)
- [ ] Implementar consulta para rango de precios (Consulta 3)
- [ ] Opcionalmente implementar consulta de servicios adicionales (Consulta 4)
- [ ] Calcular `ingresoEstimadoMensual` correctamente
- [ ] Manejar caso cuando `servicioMasPopular` es null
- [ ] Retornar JSON con estructura especificada
- [ ] Asegurar que el Content-Type sea `application/json`
- [ ] Probar con diferentes ISPs
- [ ] Validar que no retorne HTML en ningún caso
- [ ] Implementar manejo de errores apropiado
- [ ] Optimizar consultas para que respondan en <10 segundos

---

## 🧪 Ejemplo de Prueba

**Request**:
```bash
curl -X GET \
  'https://wellnet-rd.com:444/api/totales-servicios/12' \
  -H 'Accept: application/json'
```

**Response esperada (basada en datos reales del ISP 12)**:
```json
{
  "success": true,
  "data": {
    "totalServicios": 25,
    "totalSuscripciones": 905,
    "precioPromedio": 1050.50,
    "ingresoEstimadoMensual": 950702.50,
    "estadisticas": {
      "serviciosConUso": 20,
      "serviciosSinUso": 5,
      "servicioMasPopular": {
        "nombre": "Internet 10 Mbps",
        "suscripciones": 459,
        "precio": 800.00
      },
      "rangoPrecios": {
        "minimo": 300.00,
        "maximo": 1500.00
      }
    },
    "serviciosAdicionales": {
      "total": 6,
      "activos": 5,
      "inactivos": 1
    }
  }
}
```

---

## 💡 Notas Adicionales

### Cálculo de Ingreso Estimado Mensual
```javascript
// Solo sumar precios de servicios con conexiones activas
ingresoEstimadoMensual = SUM(precio_servicio)
  WHERE EXISTS(conexion activa con ese servicio)
```

### Tipos de Servicios Encontrados
Basado en análisis de datos reales:
- ✅ Internet por velocidad (3Mbps, 5Mbps, 10Mbps, 20Mbps, 30Mbps, 60Mbps)
- ✅ Paquetes combinados (ej: "10 Mbps + Netflix")
- ✅ Servicios adicionales (Netflix, Fire TV stick)
- ✅ Productos (clasificados como 'producto' en servicios_adicionales)

### Consideraciones de Servicios Sin Uso
Un servicio se considera "sin uso" cuando:
- Está configurado en `TipoServicio`
- NO tiene ninguna conexión activa (id_estado_conexion = 3) asociada
- Puede ser útil para detectar servicios obsoletos

### Optimización de Consultas
- Las consultas usan LEFT JOIN para incluir servicios sin uso
- Se filtra por `id_estado_conexion = 3` para contar solo conexiones activas
- Se usan COALESCE para manejar valores NULL
- Se recomienda indexar: `id_isp`, `id_servicio`, `id_estado_conexion`

---

## 📞 Contacto

**Frontend Developer**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
**Backend Developer**: Consulta respondida - estructura de datos confirmada
**Estado actual**: Botón sin indicadores, listo para implementar endpoint

---

## 🚀 Prioridad

**MEDIA** - Información valiosa para gestión de planes y análisis de ingresos del ISP.

---

## 🎯 Complejidad

**⭐⭐ Media** - Requiere múltiples consultas pero son relativamente simples, uso de JOINs y agregaciones básicas.

---

**Fecha de creación**: 2025-11-30
**Última actualización**: 2025-11-30
**Basado en**: Respuesta del backend sobre estructura de datos reales
