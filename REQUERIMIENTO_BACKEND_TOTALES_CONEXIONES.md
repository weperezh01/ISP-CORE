# REQUERIMIENTO BACKEND: Endpoint Totales de Conexiones

## 🎯 Objetivo
Implementar/arreglar el endpoint de totales de conexiones para que los indicadores numéricos en el botón "Conexiones" del Panel de Control y Gestión funcionen correctamente.

---

## 📍 Ubicación en Frontend
**Archivo**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
**Líneas**: 379-415 (función `conexionesTotales`)
**Uso visual**: Líneas 1510-1562 (indicadores dentro del botón de Conexiones)

---

## 🔗 Endpoint Requerido

```
GET https://wellnet-rd.com:444/api/totales-conexiones/{ispId}
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

### Opción 1: Formato Directo (Preferido)
```json
{
  "success": true,
  "data": {
    "totalConexiones": 150,
    "conexionesActivas": 120,
    "conexionesSuspendidas": 20,
    "conexionesInactivas": 10
  }
}
```

### Opción 2: Formato Snake Case (También Soportado)
```json
{
  "success": true,
  "data": {
    "total_conexiones": 150,
    "conexiones_activas": 120,
    "conexiones_suspendidas": 20,
    "conexiones_inactivas": 10
  }
}
```

### Opción 3: Con Detalle por Estado (Alternativa)
Si es más fácil retornar los datos por estado, el frontend puede procesarlos:

```json
{
  "success": true,
  "data": {
    "totalConexiones": 150,
    "conexionesPorEstado": {
      "estado0": 5,   // Inactiva (suma a inactivas)
      "estado1": 10,  // Pendiente instalación
      "estado2": 15,  // Instalada
      "estado3": 120, // Activa
      "estado4": 20,  // Suspendida
      "estado5": 3,   // Baja temporal (suma a inactivas)
      "estado6": 2    // Baja definitiva (suma a inactivas)
    }
  }
}
```

**Nota**: El frontend calculará automáticamente:
- `conexionesActivas` = `estado3`
- `conexionesSuspendidas` = `estado4`
- `conexionesInactivas` = `estado0 + estado5 + estado6`

---

## 📊 Campos Requeridos

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `totalConexiones` | number | Total de conexiones del ISP | ✅ |
| `conexionesActivas` | number | Conexiones en estado activo | ✅ |
| `conexionesSuspendidas` | number | Conexiones suspendidas | ✅ |
| `conexionesInactivas` | number | Conexiones inactivas/de baja | ✅ |

---

## 🎨 Uso en la UI

Los datos se muestran dentro del botón "Conexiones" en el Panel de Control y Gestión:

```
┌─────────────────────────────┐
│   🔌 Conexiones             │
│                              │
│   Total: 150                 │
│   ▓▓▓▓▓▓░░                  │  ← Gráfico visual
│                              │
│   🟢 Activas: 120            │
│   🟡 Suspendidas: 20         │
│   ⚪ Inactivas: 10           │
└─────────────────────────────┘
```

---

## ⚠️ Manejo de Errores

### Caso 1: Endpoint No Disponible
Si el endpoint retorna error 404/500:
```javascript
// Frontend mostrará: 0 en todos los campos
// Console: "❌ Error en totales-conexiones: [mensaje]"
```

### Caso 2: Respuesta HTML en lugar de JSON
```javascript
// Frontend detecta: payload.trim().startsWith('<')
// Console: "❌ API totales-conexiones retornó HTML"
// Acción: Todos los valores = 0
```

### Caso 3: Timeout (>10 segundos)
```javascript
// Frontend cancela la petición
// Console: "❌ Error en totales-conexiones: timeout"
// Acción: Todos los valores = 0
```

---

## 🔍 Estados de Conexión (Referencia)

Basado en el modelo de datos actual:

| ID Estado | Nombre | Categoría |
|-----------|--------|-----------|
| 0 | Inactiva | Inactiva |
| 1 | Pendiente Instalación | Pendiente |
| 2 | Instalada | En proceso |
| 3 | **Activa** | **Activa** |
| 4 | **Suspendida** | **Suspendida** |
| 5 | Baja Temporal | Inactiva |
| 6 | Baja Definitiva | Inactiva |

---

## 📝 Lógica de Negocio Sugerida (Backend)

```sql
-- Ejemplo SQL para calcular los totales
SELECT
    COUNT(*) as total_conexiones,
    SUM(CASE WHEN id_estado_conexion = 3 THEN 1 ELSE 0 END) as conexiones_activas,
    SUM(CASE WHEN id_estado_conexion = 4 THEN 1 ELSE 0 END) as conexiones_suspendidas,
    SUM(CASE WHEN id_estado_conexion IN (0, 5, 6) THEN 1 ELSE 0 END) as conexiones_inactivas
FROM conexiones
WHERE id_isp = ?
```

---

## ✅ Checklist de Implementación

- [ ] Crear/verificar ruta `GET /api/totales-conexiones/:ispId`
- [ ] Validar que `ispId` sea un número válido
- [ ] Consultar tabla de conexiones filtrada por `id_isp`
- [ ] Calcular totales por estado
- [ ] Retornar JSON con estructura especificada
- [ ] Asegurar que el Content-Type sea `application/json`
- [ ] Probar con diferentes ISPs
- [ ] Validar que no retorne HTML en ningún caso
- [ ] Implementar manejo de errores apropiado
- [ ] Optimizar consulta para que responda en <10 segundos

---

## 🧪 Ejemplo de Prueba

**Request**:
```bash
curl -X GET \
  'https://wellnet-rd.com:444/api/totales-conexiones/5' \
  -H 'Accept: application/json'
```

**Response esperada**:
```json
{
  "success": true,
  "data": {
    "totalConexiones": 150,
    "conexionesActivas": 120,
    "conexionesSuspendidas": 20,
    "conexionesInactivas": 10
  }
}
```

---

## 📞 Contacto

**Frontend Developer**: Revisar `IspDetailsScreen.tsx` líneas 379-415 para más detalles
**Estado actual**: Endpoint retorna HTML o no existe, causando que todos los indicadores muestren 0

---

## 🚀 Prioridad

**ALTA** - Los usuarios necesitan ver las estadísticas de conexiones en el dashboard principal.

---

**Fecha de creación**: 2025-11-30
**Última actualización**: 2025-11-30
