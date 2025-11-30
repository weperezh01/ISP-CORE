# MENSAJE BACKEND: Pantalla de Instalaciones - Completar Funcionalidad

## 🎯 Objetivo
Asegurar que la pantalla de instalaciones (`InstalacionesListScreen.tsx`) funcione 100% correctamente con todos sus filtros, estadísticas y funcionalidades.

---

## 📍 Estado Actual del Frontend

**Archivo**: `src/pantallas/instalaciones/InstalacionesListScreen.tsx`

**Endpoint actual usado**:
```javascript
POST https://wellnet-rd.com:444/api/instalaciones-isp
Body: { "id_isp": 12 }
```

---

## ✅ Lo Que Ya Funciona en el Frontend

1. **Lista de instalaciones** con tarjetas (cards)
2. **Filtros avanzados**:
   - Por búsqueda (cliente, técnico, ID)
   - Por estado (todas, pendientes, finalizadas)
   - Por período (hoy, este mes, pendientes)
3. **Estadísticas calculadas localmente**:
   - Total de instalaciones
   - Instalaciones pendientes (estado 2)
   - Instalaciones este mes
   - Instalaciones hoy
4. **Gráficas dinámicas**:
   - Por día (últimos 7 días)
   - Por semana (últimas 12 semanas)
   - Por mes (últimos 12 meses)
   - Por año (últimos 5 años)
5. **Navegación**:
   - Ver detalles de instalación
   - Ver materiales usados
   - Editar instalación
   - Nueva instalación

---

## ❓ Preguntas para el Backend

### 1. Endpoint de Lista de Instalaciones

**¿El endpoint `POST /api/instalaciones-isp` existe y funciona correctamente?**
- [ ] Sí, retorna JSON válido
- [ ] No, retorna HTML
- [ ] No existe

**Si existe, ¿qué estructura retorna?**
```json
// Opción A: Array directo
[
  {
    "id_instalacion": 123,
    "id_conexion": 456,
    ...
  }
]

// Opción B: Objeto con array
{
  "success": true,
  "data": [ ... ],
  "instalaciones": [ ... ]
}
```

### 2. Campos Disponibles en Cada Instalación

**¿Qué campos están disponibles en la tabla de instalaciones?**

El frontend actualmente usa:
- `id_instalacion` (requerido)
- `id_conexion` (requerido)
- `id_estado_conexion` (requerido - 2=pendiente, 3=finalizada)
- `nombreCliente` (requerido)
- `nombreTecnico` (requerido)
- `fecha_guardado` (requerido)
- `tipo_conexion` (opcional)

**¿Hay campos adicionales disponibles?**
- [ ] `latitud` / `longitude` (geolocalización)
- [ ] `direccion_instalacion`
- [ ] `descripcion` / `notas`
- [ ] `materiales_usados` (JSON o tabla relacionada)
- [ ] `costo_instalacion`
- [ ] `fecha_inicio` / `fecha_fin`
- [ ] `id_servicio` (servicio/plan contratado)
- [ ] `equipo_instalado` (router, ONU, etc.)
- [ ] `ip_asignada`
- [ ] Otros: _______________

### 3. Estados de Instalación

**¿Qué valores tiene `id_estado_conexion` para instalaciones?**
- [ ] 2 = Pendiente / En proceso
- [ ] 3 = Finalizada / Completada
- [ ] ¿Hay otros estados? _______________

### 4. Relaciones con Otras Tablas

**¿Cómo se obtiene la información del cliente y técnico?**
```sql
-- ¿Hay un JOIN con tabla de clientes?
LEFT JOIN clientes ON instalaciones.id_cliente = clientes.id_cliente

-- ¿Hay un JOIN con tabla de usuarios (técnicos)?
LEFT JOIN usuarios ON instalaciones.id_tecnico = usuarios.id_usuario

-- ¿O los nombres ya están en la tabla de instalaciones?
instalaciones.nombreCliente
instalaciones.nombreTecnico
```

### 5. Materiales de Instalación

**¿Existe una tabla de materiales usados en cada instalación?**
- [ ] Sí, existe `materiales_instalacion` o similar
- [ ] No, se guarda en un campo JSON
- [ ] No está implementado

**Si existe, ¿qué estructura tiene?**
```sql
CREATE TABLE materiales_instalacion (
  id INT PRIMARY KEY,
  id_instalacion INT,
  id_material INT,
  cantidad INT,
  -- ...
);
```

---

## 🔧 Problemas Potenciales Identificados

### Problema 1: Endpoint No Retorna JSON
```javascript
// El frontend detecta si el backend retorna HTML:
if (data && data.error) {
  console.error('Error de la API:', data.error);
  Alert.alert('Error del Servidor', ...);
}
```

**Solución requerida**: El endpoint DEBE retornar JSON siempre, nunca HTML.

### Problema 2: Estructura de Respuesta Inconsistente
El frontend intenta normalizar múltiples formatos:
```javascript
let instalacionesArray = [];
if (Array.isArray(data)) {
  instalacionesArray = data;
} else if (data && typeof data === 'object') {
  instalacionesArray = data.instalaciones || data.data || data.results || data.items || [];
}
```

**Solución recomendada**: Usar formato estándar:
```json
{
  "success": true,
  "data": [ ... ]
}
```

### Problema 3: Campos Faltantes
Si alguno de estos campos falta, el frontend mostrará "N/A":
- `nombreCliente`
- `nombreTecnico`
- `fecha_guardado`

**Solución requerida**: Asegurar que estos campos siempre se retornen con valores válidos.

---

## 📊 Optimización Sugerida: Endpoint con Filtros

**Actualmente**: El frontend obtiene TODAS las instalaciones y filtra localmente.

**Mejor práctica**: El backend podría aceptar parámetros de filtro:

```javascript
POST /api/instalaciones-isp
Body: {
  "id_isp": 12,
  "estado": 2,              // Opcional: filtrar por estado
  "fecha_desde": "2024-01-01", // Opcional: filtrar por rango de fechas
  "fecha_hasta": "2024-12-31",
  "incluir_estadisticas": true // Si true, incluir contadores
}
```

**Respuesta con estadísticas**:
```json
{
  "success": true,
  "data": [ ... ],
  "estadisticas": {
    "total": 150,
    "pendientes": 12,
    "finalizadas": 138,
    "este_mes": 8,
    "hoy": 2
  }
}
```

**Beneficios**:
- ✅ Reduce tráfico de red
- ✅ Mejora performance del frontend
- ✅ Reduce procesamiento en el cliente
- ✅ Estadísticas más precisas

---

## 📝 SQL Sugerido para el Endpoint

### Consulta Base (Todas las Instalaciones)
```sql
SELECT
  i.id_instalacion,
  i.id_conexion,
  i.id_estado_conexion,
  i.fecha_guardado,
  i.tipo_conexion,
  i.latitud,
  i.longitude,
  i.direccion_instalacion,
  i.notas,
  c.nombre_completo AS nombreCliente,
  u.nombre AS nombreTecnico
FROM instalaciones i
LEFT JOIN conexiones con ON i.id_conexion = con.id_conexion
LEFT JOIN clientes c ON con.id_cliente = c.id_cliente
LEFT JOIN usuarios u ON i.id_tecnico = u.id_usuario
WHERE i.id_isp = ?
ORDER BY i.fecha_guardado DESC;
```

### Consulta con Filtro de Estado
```sql
-- Agregar WHERE adicional:
AND i.id_estado_conexion = ?
```

### Consulta de Estadísticas
```sql
SELECT
  COUNT(*) AS total,
  SUM(CASE WHEN id_estado_conexion = 2 THEN 1 ELSE 0 END) AS pendientes,
  SUM(CASE WHEN id_estado_conexion = 3 THEN 1 ELSE 0 END) AS finalizadas,
  SUM(CASE
    WHEN DATE_FORMAT(fecha_guardado, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
    THEN 1 ELSE 0
  END) AS este_mes,
  SUM(CASE
    WHEN DATE(fecha_guardado) = CURDATE()
    THEN 1 ELSE 0
  END) AS hoy
FROM instalaciones
WHERE id_isp = ?;
```

---

## 🎨 Campos Adicionales Útiles (Opcional)

Si el backend puede proporcionar estos campos adicionales, mejoraría la experiencia:

### Geolocalización
```json
{
  "latitud": -18.4655,
  "longitude": -70.3312,
  "tiene_ubicacion": true
}
```

**Uso**: Mostrar mapa de instalaciones, rutas de técnicos.

### Equipo Instalado
```json
{
  "equipo_instalado": {
    "router": "MikroTik RB750",
    "onu": "Huawei HG8245H",
    "antena": "Ubiquiti NanoStation M5"
  }
}
```

**Uso**: Saber qué equipos se usaron en cada instalación.

### Servicio Contratado
```json
{
  "servicio": {
    "id_servicio": 5,
    "nombre": "Internet 10 Mbps",
    "precio": 800.00
  }
}
```

**Uso**: Ver qué plan contrató el cliente.

### Materiales Usados
```json
{
  "materiales": [
    { "nombre": "Cable UTP Cat6", "cantidad": 50, "unidad": "metros" },
    { "nombre": "Conectores RJ45", "cantidad": 4, "unidad": "unidades" },
    { "nombre": "Canaleta", "cantidad": 5, "unidad": "metros" }
  ]
}
```

**Uso**: Control de inventario, costos de instalación.

---

## 🧪 Testing Recomendado

### Test 1: Endpoint Básico
```bash
curl -X POST 'https://wellnet-rd.com:444/api/instalaciones-isp' \
  -H 'Content-Type: application/json' \
  -d '{"id_isp": 12}'
```

**Respuesta esperada**: JSON válido con array de instalaciones.

### Test 2: ISP Sin Instalaciones
```bash
curl -X POST 'https://wellnet-rd.com:444/api/instalaciones-isp' \
  -H 'Content-Type: application/json' \
  -d '{"id_isp": 9999}'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": []
}
```

### Test 3: ISP Inválido
```bash
curl -X POST 'https://wellnet-rd.com:444/api/instalaciones-isp' \
  -H 'Content-Type: application/json' \
  -d '{"id_isp": "invalid"}'
```

**Respuesta esperada**:
```json
{
  "success": false,
  "error": "id_isp es requerido y debe ser numérico"
}
```

---

## ✅ Checklist de Implementación

### Endpoint Principal
- [ ] Ruta `POST /api/instalaciones-isp` configurada
- [ ] Validar que `id_isp` sea numérico
- [ ] Retornar JSON, nunca HTML
- [ ] Incluir todos los campos requeridos:
  - [ ] `id_instalacion`
  - [ ] `id_conexion`
  - [ ] `id_estado_conexion`
  - [ ] `nombreCliente`
  - [ ] `nombreTecnico`
  - [ ] `fecha_guardado`
- [ ] Incluir campos opcionales útiles:
  - [ ] `tipo_conexion`
  - [ ] `latitud`, `longitude`
  - [ ] `direccion_instalacion`
- [ ] Manejar caso cuando no hay instalaciones (retornar array vacío)
- [ ] Content-Type: application/json
- [ ] Responder en <10 segundos

### Optimización (Recomendado)
- [ ] Aceptar parámetros de filtro opcionales
- [ ] Incluir estadísticas en la respuesta
- [ ] Optimizar consultas con índices
- [ ] Implementar paginación (si hay muchas instalaciones)

### Endpoints Relacionados (Si Existen)
- [ ] `GET /api/instalacion/:id` - Detalles de una instalación
- [ ] `POST /api/instalacion` - Crear nueva instalación
- [ ] `PUT /api/instalacion/:id` - Actualizar instalación
- [ ] `DELETE /api/instalacion/:id` - Eliminar instalación
- [ ] `GET /api/instalacion/:id/materiales` - Materiales usados

---

## 📞 Respuestas Requeridas

**Por favor, responder las siguientes preguntas:**

1. **¿El endpoint `POST /api/instalaciones-isp` existe y funciona?**
   - Respuesta: _______________

2. **¿Qué estructura de respuesta retorna actualmente?**
   - Respuesta: _______________

3. **¿Qué campos adicionales están disponibles en la BD?**
   - Respuesta: _______________

4. **¿Existe tabla de materiales por instalación?**
   - Respuesta: _______________

5. **¿Se guarda la geolocalización (lat/lng) de las instalaciones?**
   - Respuesta: _______________

6. **¿Es factible agregar estadísticas en la respuesta del endpoint?**
   - Respuesta: _______________

7. **¿Hay algún problema conocido con este endpoint?**
   - Respuesta: _______________

---

## 🚀 Prioridad

**ALTA** - Esta es una pantalla principal de operaciones del ISP, usada diariamente por técnicos y administradores.

---

## 🎯 Resultado Esperado

Después de implementar/corregir el endpoint:

1. ✅ La lista de instalaciones se carga correctamente
2. ✅ Todos los filtros funcionan (búsqueda, estado, período)
3. ✅ Las estadísticas se muestran correctamente
4. ✅ Las gráficas se generan con datos reales
5. ✅ No hay errores en consola
6. ✅ La navegación a detalles/edición funciona
7. ✅ El rendimiento es óptimo (<3 segundos de carga)

---

**Fecha de creación**: 2025-11-30
**Desarrollador Frontend**: Verificar `src/pantallas/instalaciones/InstalacionesListScreen.tsx`
**Estado**: Esperando respuesta del backend para completar funcionalidad
