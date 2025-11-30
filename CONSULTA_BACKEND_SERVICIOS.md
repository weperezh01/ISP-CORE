# CONSULTA AL BACKEND: Indicadores para Botón de Servicios

## 📋 Contexto

Se requiere implementar indicadores numéricos para el botón "Servicios" en el Panel de Control y Gestión del frontend. Actualmente este botón **NO tiene indicadores**, solo navega a `ServiciosScreen`.

---

## ❓ Preguntas al Backend

### 1. Estructura de Datos de Servicios

**¿Cómo se almacenan los servicios en la base de datos?**
- ¿Existe una tabla `servicios` o similar?
- ¿Los servicios también se llaman "planes", "paquetes" o "productos"?
- ¿Cada servicio tiene campos como: nombre, precio, tipo, estado, descripción?

### 2. Relación con Otros Módulos

**¿Cómo se relacionan los servicios con otros datos?**
- ¿Los servicios están asociados a conexiones? (ej: cada conexión tiene un servicio asignado)
- ¿Los servicios están asociados a clientes directamente?
- ¿Los servicios tienen suscripciones activas?

### 3. Tipos de Servicios

**¿Existen diferentes tipos/categorías de servicios?**

Por favor, indicar cuáles de estos tipos existen o si hay otros:
- [ ] Internet (por velocidad: 10Mbps, 20Mbps, 50Mbps, 100Mbps, etc.)
- [ ] Internet + TV
- [ ] Internet + Telefonía
- [ ] Paquetes Triple Play (Internet + TV + Teléfono)
- [ ] Servicios adicionales (IP estática, dominio, hosting, etc.)
- [ ] Otros: _______________

### 4. Estados de Servicios

**¿Los servicios tienen estados?**
- [ ] Activo / Inactivo
- [ ] Disponible / No disponible
- [ ] Vigente / Descontinuado
- [ ] Otros: _______________

### 5. Información de Precios

**¿Qué información de precios está disponible?**
- [ ] Precio base del servicio
- [ ] Precio con descuentos
- [ ] Precio promocional
- [ ] Precio por instalación
- [ ] Precio por mantenimiento
- [ ] IVA incluido/excluido

---

## 💡 Propuesta de Indicadores para la UI

Basándome en sistemas ISP típicos, propongo mostrar estos indicadores en el botón "Servicios":

### Opción A: Indicadores Simples (Recomendado para MVP)
```
┌─────────────────────────────┐
│   📦 Servicios              │
│                              │
│   Total: 12                  │
│   ▓▓▓▓▓▓▓▓                  │
│   🟢 Activos: 10             │
│   ⚪ Inactivos: 2            │
│   💰 Precio promedio: $45.00 │
└─────────────────────────────┘
```

**Datos necesarios**:
- `totalServicios`: Total de servicios/planes configurados
- `serviciosActivos`: Servicios disponibles para contratar
- `serviciosInactivos`: Servicios descontinuados o no disponibles
- `precioPromedio`: Precio promedio de los servicios activos

### Opción B: Indicadores con Suscripciones
```
┌─────────────────────────────┐
│   📦 Servicios              │
│                              │
│   Total servicios: 12        │
│   Suscripciones: 145         │
│   ▓▓▓▓▓▓▓▓                  │
│   💰 Precio promedio: $45.00 │
│   📊 Ingreso estimado: $6,525│
└─────────────────────────────┘
```

**Datos necesarios**:
- `totalServicios`: Total de servicios configurados
- `totalSuscripciones`: Total de clientes/conexiones usando servicios
- `precioPromedio`: Precio promedio
- `ingresoEstimadoMensual`: Suma de todos los servicios activos contratados

### Opción C: Indicadores por Tipo
```
┌─────────────────────────────┐
│   📦 Servicios              │
│                              │
│   Total: 12                  │
│   ▓▓▓▓▓▓▓▓                  │
│                              │
│   🌐 Internet: 8             │
│   📺 TV+Internet: 3          │
│   📞 Triple Play: 1          │
│                              │
│   💰 Desde $25 hasta $120    │
└─────────────────────────────┘
```

**Datos necesarios**:
- `totalServicios`: Total de servicios
- `serviciosPorTipo`: Objeto con distribución por tipo
- `precioMinimo`: Precio del servicio más económico
- `precioMaximo`: Precio del servicio más caro

---

## 🎯 Recomendación del Frontend

**Recomiendo implementar la Opción A** (Indicadores Simples) porque:
1. Es más simple de implementar
2. Mantiene consistencia con otros botones del dashboard
3. Muestra información clara y útil
4. Puede expandirse fácilmente en el futuro

---

## 📊 Estructura JSON Propuesta (Opción A)

```json
{
  "success": true,
  "data": {
    "totalServicios": 12,
    "serviciosActivos": 10,
    "serviciosInactivos": 2,
    "precioPromedio": 45.50,
    "estadisticasAdicionales": {
      "servicioMasContratado": "Internet 50Mbps",
      "totalSuscripciones": 145,
      "ingresoEstimadoMensual": 6525.00
    }
  }
}
```

---

## 📝 Consultas SQL Sugeridas (Para Referencia)

**Si el backend puede confirmar la estructura de tablas, aquí hay ejemplos de consultas:**

```sql
-- Total de servicios
SELECT
    COUNT(*) as total_servicios,
    SUM(CASE WHEN estado = 'activo' OR activo = TRUE THEN 1 ELSE 0 END) as servicios_activos,
    SUM(CASE WHEN estado = 'inactivo' OR activo = FALSE THEN 1 ELSE 0 END) as servicios_inactivos
FROM servicios
WHERE id_isp = ?;

-- Precio promedio
SELECT
    AVG(precio) as precio_promedio
FROM servicios
WHERE id_isp = ? AND (estado = 'activo' OR activo = TRUE);

-- Total de suscripciones (si servicios están en conexiones)
SELECT
    COUNT(DISTINCT c.id_conexion) as total_suscripciones,
    SUM(s.precio) as ingreso_estimado_mensual
FROM conexiones c
INNER JOIN servicios s ON c.id_servicio = s.id_servicio
WHERE c.id_isp = ? AND c.id_estado_conexion = 3; -- 3 = Activa

-- Distribución por tipo
SELECT
    tipo_servicio,
    COUNT(*) as cantidad
FROM servicios
WHERE id_isp = ? AND activo = TRUE
GROUP BY tipo_servicio;
```

---

## ✅ Solicitud al Backend

**Por favor, responder las siguientes preguntas:**

1. **¿Cuál es el nombre de la tabla de servicios?**
   - Respuesta: _______________

2. **¿Qué campos tiene la tabla de servicios?**
   - Respuesta: _______________

3. **¿Los servicios tienen estado (activo/inactivo)?**
   - Respuesta: _______________

4. **¿Hay una relación entre servicios y conexiones/clientes?**
   - Respuesta: _______________

5. **¿Cuál de las 3 opciones propuestas (A, B, o C) es más factible implementar?**
   - Respuesta: _______________

6. **¿Hay algún dato adicional que crees que sería útil mostrar?**
   - Respuesta: _______________

---

## 🚀 Próximos Pasos

1. Backend responde las preguntas de este documento
2. Frontend crea el documento de requerimiento final `REQUERIMIENTO_BACKEND_TOTALES_SERVICIOS.md`
3. Backend implementa el endpoint `GET /api/totales-servicios/{ispId}`
4. Frontend agrega los indicadores al botón de Servicios

---

**Fecha de creación**: 2025-11-30
**Esperando respuesta del backend**
