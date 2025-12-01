# REQUERIMIENTO BACKEND: Endpoint Totales de Instalaciones

## 🎯 Objetivo
Implementar/arreglar el endpoint de totales de instalaciones para que los indicadores numéricos en el botón "Instalaciones" del Panel de Control y Gestión funcionen correctamente.

---

## 📍 Ubicación en Frontend
**Archivo**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
**Líneas**: 717-772 (función `instalacionesTotales`)
**Uso visual**: Líneas 1691-1741 (indicadores dentro del botón de Instalaciones)

---

## 🔗 Endpoint Requerido

```
GET https://wellnet-rd.com:444/api/totales-instalaciones/{ispId}
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

### Opción 1: Formato Directo con CamelCase (Preferido)
```json
{
  "success": true,
  "data": {
    "totalInstalaciones": 485,
    "estadisticasTiempo": {
      "instalacionesEsteMes": 38,
      "instalacionesHoy": 3
    },
    "tracking": {
      "conUbicacion": 420,
      "sinUbicacion": 65
    },
    "equipos": {
      "configuradas": 455,
      "sinConfig": 30
    }
  }
}
```

### Opción 2: Formato Snake Case (También Soportado)
```json
{
  "success": true,
  "data": {
    "total_instalaciones": 485,
    "estadisticas_tiempo": {
      "instalaciones_este_mes": 38,
      "instalaciones_hoy": 3
    },
    "tracking": {
      "con_ubicacion": 420,
      "sin_ubicacion": 65
    },
    "equipos": {
      "configuradas": 455,
      "sin_config": 30
    }
  }
}
```

### Opción 3: Formatos Alternativos (También Soportados)

El frontend también reconoce estos nombres alternativos:

**Para estadisticasTiempo**:
```json
{
  "estadisticas_tiempo": {
    "esteMes": 38,    // alternativa a instalacionesEsteMes
    "hoy": 3          // alternativa a instalacionesHoy
  }
}
```

**Para tracking** (también acepta "seguimiento"):
```json
{
  "seguimiento": {
    "geo_ok": 420,           // alternativa a conUbicacion
    "geo_faltante": 65       // alternativa a sinUbicacion
  }
}
```

**Para equipos** (también acepta "equipamiento"):
```json
{
  "equipamiento": {
    "equiposConfigurados": 455,    // alternativa a configuradas
    "equiposSinConfig": 30,        // alternativa a sinConfig
    "config_ok": 455,              // otra alternativa
    "config_faltante": 30          // otra alternativa
  }
}
```

---

## 📊 Campos Requeridos

### Campos Principales

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `totalInstalaciones` | number | Total de instalaciones realizadas | ✅ |
| `estadisticasTiempo` | object | Estadísticas por período de tiempo | ✅ |
| `tracking` | object | Métricas de geolocalización | ✅ |
| `equipos` | object | Estado de configuración de equipos | ✅ |

### Objeto estadisticasTiempo

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `instalacionesEsteMes` | number | Instalaciones realizadas este mes | ✅ |
| `instalacionesHoy` | number | Instalaciones realizadas hoy | ✅ |

### Objeto tracking

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `conUbicacion` | number | Instalaciones con GPS/ubicación registrada | ✅ |
| `sinUbicacion` | number | Instalaciones sin GPS/ubicación | ✅ |

### Objeto equipos

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `configuradas` | number | Instalaciones con equipos configurados | ✅ |
| `sinConfig` | number | Instalaciones sin configuración de equipos | ✅ |

---

## 🎨 Uso en la UI

Los datos se muestran dentro del botón "Instalaciones" en el Panel de Control y Gestión:

```
┌─────────────────────────────┐
│   🔧 Instalaciones          │
│                              │
│   Total: 485                 │
│   ▓▓▓▓▓▓▓░                  │  ← Gráfico: Con ubicación/Sin ubicación
│                              │        (o Configuradas/Sin configurar)
│                              │
│   📊 Este mes: 38            │
│   📅 Hoy: 3                  │
└─────────────────────────────┘
```

**Comportamiento del gráfico**:
El frontend muestra el gráfico de manera inteligente:
- **Si hay datos de tracking** (conUbicacion + sinUbicacion > 0): Muestra gráfico de ubicación
  - Verde: Instalaciones con ubicación
  - Amarillo: Instalaciones sin ubicación
- **Si NO hay datos de tracking**: Muestra gráfico de equipos
  - Verde: Equipos configurados
  - Amarillo: Equipos sin configurar

---

## 🔍 Métricas de Instalaciones

### Tracking/Geolocalización
- **Con ubicación**: Instalaciones que tienen coordenadas GPS registradas
- **Sin ubicación**: Instalaciones sin coordenadas GPS

### Estado de Equipos
- **Configuradas**: Instalaciones con equipos completamente configurados
- **Sin configurar**: Instalaciones con equipos pendientes de configuración

### Estadísticas de Tiempo
- **Este mes**: Instalaciones desde el día 1 del mes actual hasta hoy
- **Hoy**: Instalaciones realizadas en el día actual

---

## ⚠️ Manejo de Errores

### Caso 1: Endpoint No Disponible
```javascript
// Frontend mostrará: 0 en todos los campos
// Console: "❌ Error en totales-instalaciones: [mensaje]"
```

### Caso 2: Respuesta HTML en lugar de JSON
```javascript
// Frontend detecta: payload.trim().startsWith('<')
// Console: "❌ API totales-instalaciones retornó HTML"
// Acción: Todos los valores = 0
```

### Caso 3: Timeout (>10 segundos)
```javascript
// Frontend cancela la petición
// Console: "❌ Error en totales-instalaciones: timeout"
// Acción: Todos los valores = 0
```

### Caso 4: Datos parciales
Si alguno de los objetos está vacío o falta, el frontend usa valores por defecto de 0.

---

## 📝 Lógica de Negocio Sugerida (Backend)

```sql
-- Ejemplo SQL para calcular los totales de instalaciones
SELECT
    COUNT(*) as total_instalaciones
FROM instalaciones
WHERE id_isp = ?;

-- Ejemplo SQL para estadísticas de tiempo
SELECT
    SUM(CASE WHEN DATE_FORMAT(fecha_instalacion, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m') THEN 1 ELSE 0 END) as instalaciones_este_mes,
    SUM(CASE WHEN DATE(fecha_instalacion) = CURDATE() THEN 1 ELSE 0 END) as instalaciones_hoy
FROM instalaciones
WHERE id_isp = ?;

-- Ejemplo SQL para tracking/geolocalización
SELECT
    SUM(CASE WHEN latitud IS NOT NULL AND longitud IS NOT NULL THEN 1 ELSE 0 END) as con_ubicacion,
    SUM(CASE WHEN latitud IS NULL OR longitud IS NULL THEN 1 ELSE 0 END) as sin_ubicacion
FROM instalaciones
WHERE id_isp = ?;

-- Ejemplo SQL para estado de equipos
SELECT
    SUM(CASE WHEN equipo_configurado = 1 OR estado_equipo = 'configurado' THEN 1 ELSE 0 END) as configuradas,
    SUM(CASE WHEN equipo_configurado = 0 OR estado_equipo = 'sin_configurar' THEN 1 ELSE 0 END) as sin_config
FROM instalaciones
WHERE id_isp = ?;
```

---

## ✅ Checklist de Implementación

- [ ] Crear/verificar ruta `GET /api/totales-instalaciones/:ispId`
- [ ] Validar que `ispId` sea un número válido
- [ ] Consultar tabla de instalaciones filtrada por `id_isp`
- [ ] Calcular total de instalaciones
- [ ] Calcular instalaciones del mes actual
- [ ] Calcular instalaciones del día actual
- [ ] Calcular instalaciones con/sin ubicación GPS
- [ ] Calcular instalaciones con equipos configurados/sin configurar
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
  'https://wellnet-rd.com:444/api/totales-instalaciones/5' \
  -H 'Accept: application/json'
```

**Response esperada**:
```json
{
  "success": true,
  "data": {
    "totalInstalaciones": 485,
    "estadisticasTiempo": {
      "instalacionesEsteMes": 38,
      "instalacionesHoy": 3
    },
    "tracking": {
      "conUbicacion": 420,
      "sinUbicacion": 65
    },
    "equipos": {
      "configuradas": 455,
      "sinConfig": 30
    }
  }
}
```

---

## 💡 Notas Adicionales

### Determinación de Ubicación
Una instalación se considera "con ubicación" si:
- Tiene coordenadas de latitud Y longitud no nulas
- O tiene algún campo de geolocalización válido

### Consideraciones de Tiempo
- **Este mes**: Desde el día 1 del mes actual (00:00:00) hasta el momento actual
- **Hoy**: Desde las 00:00:00 hasta las 23:59:59 del día actual

### Gráfico Adaptativo
El frontend prioriza mostrar:
1. **Primero**: Datos de tracking (si conUbicacion + sinUbicacion > 0)
2. **Segundo**: Datos de equipos (como fallback)

Esto permite que la UI se adapte según qué información esté disponible.

### Validación de Datos
Asegurarse que:
```
conUbicacion + sinUbicacion ≈ totalInstalaciones
configuradas + sinConfig ≈ totalInstalaciones
```

---

## 📞 Contacto

**Frontend Developer**: Revisar `IspDetailsScreen.tsx` líneas 717-772 para más detalles
**Estado actual**: Endpoint retorna HTML o no existe, causando que todos los indicadores muestren 0

---

## 🚀 Prioridad

**ALTA** - Los usuarios necesitan monitorear el progreso de instalaciones y detectar problemas de geolocalización o configuración de equipos.

---

**Fecha de creación**: 2025-11-30
**Última actualización**: 2025-11-30
