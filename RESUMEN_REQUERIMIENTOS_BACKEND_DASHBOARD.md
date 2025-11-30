# RESUMEN: Requerimientos Backend para Dashboard de Panel de Control y Gestión

## 📋 Descripción General

El Panel de Control y Gestión del frontend requiere **8 endpoints** para mostrar indicadores numéricos dentro de los botones principales. Actualmente estos endpoints no funcionan correctamente (retornan HTML o no existen), causando que todos los indicadores muestren 0.

**Estado actual**:
- ✅ **8 endpoints completamente documentados** y listos para implementación backend
- ⚠️ **Usuarios**: Existe versión mejorada propuesta en `CONSULTA_BACKEND_USUARIOS_MEJORADO.md` (opcional, pendiente de respuesta backend)

---

## 🎯 Endpoints Requeridos

### 1. Totales de Conexiones
**Endpoint**: `GET /api/totales-conexiones/{ispId}`
**Documento**: [REQUERIMIENTO_BACKEND_TOTALES_CONEXIONES.md](./REQUERIMIENTO_BACKEND_TOTALES_CONEXIONES.md)
**Ubicación Frontend**: `IspDetailsScreen.tsx:379-415`
**Prioridad**: 🔴 ALTA

**Datos requeridos**:
```json
{
  "totalConexiones": 150,
  "conexionesActivas": 120,
  "conexionesSuspendidas": 20,
  "conexionesInactivas": 10
}
```

**Uso**: Botón "Conexiones" (ID: 7)

---

### 2. Totales de Ciclos de Facturación
**Endpoint**: `GET /api/totales-ciclos/{ispId}`
**Documento**: [REQUERIMIENTO_BACKEND_TOTALES_CICLOS.md](./REQUERIMIENTO_BACKEND_TOTALES_CICLOS.md)
**Ubicación Frontend**: `IspDetailsScreen.tsx:420-499`
**Prioridad**: 🔴 ALTA

**Datos requeridos**:
```json
{
  "totalCiclos": 24,
  "ciclosVigentes": 18,
  "ciclosCerrados": 5,
  "ciclosVencidos": 1,
  "resumenFinanciero": {
    "totalFacturas": 450,
    "totalDinero": 125000.50,
    "facturasPendientes": 85,
    "dineroPendiente": 28500.75,
    "dineroRecaudadoPorcentaje": 77.20
  }
}
```

**Uso**: Botón "Facturaciones" (ID: 1)

---

### 3. Totales de Gestión de SMS
**Endpoint**: `GET /api/totales-sms/{ispId}`
**Documento**: [REQUERIMIENTO_BACKEND_TOTALES_SMS.md](./REQUERIMIENTO_BACKEND_TOTALES_SMS.md)
**Ubicación Frontend**: `IspDetailsScreen.tsx:504-580`
**Prioridad**: 🔴 ALTA

**Datos requeridos**:
```json
{
  "totalSmsEnviados": 1250,
  "smsExitosos": 1180,
  "smsFallidos": 45,
  "smsPendientes": 20,
  "estadisticasEnvio": {
    "tasaExito": 94.40
  },
  "resumenFinanciero": {
    "costoTotal": 3750.50
  },
  "estadisticasTiempo": {
    "smsEsteMes": 380,
    "smsHoy": 12
  },
  "interactividad": {
    "mensajesEntrantes": 340
  }
}
```

**Uso**: Botón "Gestión de SMS" (ID: 16)

---

### 4. Totales de Órdenes de Servicio
**Endpoint**: `GET /api/totales-ordenes/{ispId}`
**Documento**: [REQUERIMIENTO_BACKEND_TOTALES_ORDENES.md](./REQUERIMIENTO_BACKEND_TOTALES_ORDENES.md)
**Ubicación Frontend**: `IspDetailsScreen.tsx:585-646`
**Prioridad**: 🔴 ALTA

**Datos requeridos**:
```json
{
  "totalOrdenes": 245,
  "ordenesPendientes": 45,
  "ordenesEnProgreso": 32,
  "ordenesCompletadas": 158,
  "ordenesCanceladas": 10,
  "estadisticasRendimiento": {
    "tasaCompletado": 64.49,
    "horasPromedioResolucion": 36.5
  },
  "estadisticasTiempo": {
    "ordenesEsteMes": 58
  }
}
```

**Uso**: Botón "Ordenes de Servicio" (ID: 11)

---

### 5. Totales de Configuraciones
**Endpoint**: `GET /api/totales-configuraciones/{ispId}`
**Documento**: [REQUERIMIENTO_BACKEND_TOTALES_CONFIGURACIONES.md](./REQUERIMIENTO_BACKEND_TOTALES_CONFIGURACIONES.md)
**Ubicación Frontend**: `IspDetailsScreen.tsx:651-712`
**Prioridad**: 🔴 ALTA

**Datos requeridos**:
```json
{
  "totalConfiguraciones": 320,
  "configuracionesActivas": 285,
  "configuracionesIncompletas": 35,
  "configuracionRed": {
    "porcentajeConfigurado": 89.06
  },
  "estadisticasTiempo": {
    "configuracionesEsteMes": 42
  },
  "configuracionesPorRouter": {
    "Router MikroTik RB750": 125,
    "Router Ubiquiti EdgeRouter": 98,
    "Router TP-Link": 65
  }
}
```

**Uso**: Botón "Configuraciones" (ID: 10)

---

### 6. Totales de Instalaciones
**Endpoint**: `GET /api/totales-instalaciones/{ispId}`
**Documento**: [REQUERIMIENTO_BACKEND_TOTALES_INSTALACIONES.md](./REQUERIMIENTO_BACKEND_TOTALES_INSTALACIONES.md)
**Ubicación Frontend**: `IspDetailsScreen.tsx:717-772`
**Prioridad**: 🔴 ALTA

**Datos requeridos**:
```json
{
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
```

**Uso**: Botón "Instalaciones" (ID: 17)

---

### 7. Totales de Usuarios
**Endpoint**: `GET /api/totales-usuarios/{ispId}`
**Documento**: [REQUERIMIENTO_BACKEND_TOTALES_USUARIOS.md](./REQUERIMIENTO_BACKEND_TOTALES_USUARIOS.md)
**Ubicación Frontend**: `IspDetailsScreen.tsx:777-806`
**Prioridad**: 🟡 MEDIA-ALTA

**Datos requeridos**:
```json
{
  "totalUsuarios": 45,
  "activos": 38,
  "inactivos": 7,
  "roles": {
    "Admin": 5,
    "Operador": 12,
    "Técnico": 18
  }
}
```

**Uso**: Botón "Usuarios" (ID: 6)

---

### 8. Totales de Servicios
**Endpoint**: `GET /api/totales-servicios/{ispId}`
**Documento**: [REQUERIMIENTO_BACKEND_TOTALES_SERVICIOS.md](./REQUERIMIENTO_BACKEND_TOTALES_SERVICIOS.md)
**Ubicación Frontend**: `IspDetailsScreen.tsx` (Botón ID: 3)
**Prioridad**: 🔴 ALTA

**Datos requeridos**:
```json
{
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
```

**Uso**: Botón "Servicios" (ID: 3)
**Nota**: Basado en estructura de base de datos real (tablas `TipoServicio` y `servicios_adicionales`)

---

## 🔧 Características Comunes

### Headers Requeridos
Todos los endpoints deben aceptar:
```http
Accept: application/json
Content-Type: application/json
```

### Formato de Respuesta
Todos los endpoints deben retornar:
```json
{
  "success": true,
  "data": {
    // ... datos específicos del endpoint
  }
}
```

### Formatos Soportados
El frontend soporta tanto **camelCase** como **snake_case**:
- ✅ `totalConexiones` o `total_conexiones`
- ✅ `smsExitosos` o `sms_exitosos`
- ✅ `ordenesCompletadas` o `ordenes_completadas`

### Timeout
- **Máximo**: 10 segundos
- Si excede, el frontend cancela la petición y muestra 0

### Manejo de Errores
Todos los endpoints deben:
- ❌ **NO** retornar HTML bajo ninguna circunstancia
- ✅ Retornar JSON válido siempre
- ✅ Incluir Content-Type: application/json
- ✅ Manejar errores con códigos HTTP apropiados

---

## 📊 Impacto Visual

Actualmente el dashboard muestra:

```
❌ ESTADO ACTUAL (Sin endpoints funcionales)
┌─────────────────────────────┐
│   🔌 Conexiones             │
│   Total: 0                   │
│   Activas: 0                 │
│   Suspendidas: 0             │
│   Inactivas: 0               │
└─────────────────────────────┘
```

Después de implementar los endpoints:

```
✅ ESTADO DESEADO (Con endpoints funcionales)
┌─────────────────────────────┐
│   🔌 Conexiones             │
│   Total: 150                 │
│   ▓▓▓▓▓▓▓░░                 │  ← Gráfico visual
│   🟢 Activas: 120            │
│   🟡 Suspendidas: 20         │
│   ⚪ Inactivas: 10           │
└─────────────────────────────┘
```

---

## ✅ Checklist General de Implementación

### Paso 1: Configuración Inicial
- [ ] Revisar los 8 documentos detallados de requerimientos
- [ ] Verificar acceso a las tablas de base de datos necesarias
- [ ] Configurar rutas en el servidor Express/API
- [ ] (Opcional) Responder consulta sobre Usuarios mejorado (`CONSULTA_BACKEND_USUARIOS_MEJORADO.md`)

### Paso 2: Implementación por Endpoint
- [ ] Implementar `/api/totales-conexiones/:ispId`
- [ ] Implementar `/api/totales-ciclos/:ispId`
- [ ] Implementar `/api/totales-sms/:ispId`
- [ ] Implementar `/api/totales-ordenes/:ispId`
- [ ] Implementar `/api/totales-configuraciones/:ispId`
- [ ] Implementar `/api/totales-instalaciones/:ispId`
- [ ] Implementar `/api/totales-usuarios/:ispId`
- [ ] Implementar `/api/totales-servicios/:ispId`

### Paso 3: Validación
- [ ] Probar cada endpoint con curl/Postman
- [ ] Verificar que retornen JSON (no HTML)
- [ ] Validar estructura de datos
- [ ] Probar con diferentes ISPs
- [ ] Medir tiempo de respuesta (<10s)

### Paso 4: Testing Integrado
- [ ] Probar desde el frontend (app React Native)
- [ ] Verificar que los indicadores se actualicen
- [ ] Validar gráficos visuales
- [ ] Probar manejo de errores

---

## 🧪 Comandos de Prueba Rápidos

```bash
# Probar endpoint de conexiones
curl -X GET 'https://wellnet-rd.com:444/api/totales-conexiones/5' \
  -H 'Accept: application/json'

# Probar endpoint de ciclos
curl -X GET 'https://wellnet-rd.com:444/api/totales-ciclos/5' \
  -H 'Accept: application/json'

# Probar endpoint de SMS
curl -X GET 'https://wellnet-rd.com:444/api/totales-sms/5' \
  -H 'Accept: application/json'

# Probar endpoint de órdenes
curl -X GET 'https://wellnet-rd.com:444/api/totales-ordenes/5' \
  -H 'Accept: application/json'

# Probar endpoint de configuraciones
curl -X GET 'https://wellnet-rd.com:444/api/totales-configuraciones/5' \
  -H 'Accept: application/json'

# Probar endpoint de instalaciones
curl -X GET 'https://wellnet-rd.com:444/api/totales-instalaciones/5' \
  -H 'Accept: application/json'

# Probar endpoint de usuarios
curl -X GET 'https://wellnet-rd.com:444/api/totales-usuarios/5' \
  -H 'Accept: application/json'

# Probar endpoint de servicios
curl -X GET 'https://wellnet-rd.com:444/api/totales-servicios/5' \
  -H 'Accept: application/json'
```

Reemplazar `5` con el ID del ISP de prueba.

---

## 📁 Estructura de Archivos

```
ISP-CORE/
├── RESUMEN_REQUERIMIENTOS_BACKEND_DASHBOARD.md (este archivo - resumen general)
│
├── Documentos de Requerimientos (8 endpoints completos):
│   ├── REQUERIMIENTO_BACKEND_TOTALES_CONEXIONES.md
│   ├── REQUERIMIENTO_BACKEND_TOTALES_CICLOS.md
│   ├── REQUERIMIENTO_BACKEND_TOTALES_SMS.md
│   ├── REQUERIMIENTO_BACKEND_TOTALES_ORDENES.md
│   ├── REQUERIMIENTO_BACKEND_TOTALES_CONFIGURACIONES.md
│   ├── REQUERIMIENTO_BACKEND_TOTALES_INSTALACIONES.md
│   ├── REQUERIMIENTO_BACKEND_TOTALES_USUARIOS.md
│   └── REQUERIMIENTO_BACKEND_TOTALES_SERVICIOS.md
│
└── Documentos de Consulta (opcional):
    ├── CONSULTA_BACKEND_SERVICIOS.md (respondido - sirvió para crear el requerimiento)
    └── CONSULTA_BACKEND_USUARIOS_MEJORADO.md (pendiente respuesta - versión mejorada)
```

---

## 🚀 Orden de Implementación Sugerido

### Fase 1: Endpoints Simples (Solo Contadores) ⭐ Baja Complejidad
1. **Totales de Conexiones** - Solo contadores por estado
2. **Totales de Instalaciones** - Contadores con geolocalización y equipos
3. **Totales de Usuarios** - Contadores activos/inactivos con roles

### Fase 2: Endpoints con Cálculos ⭐⭐ Media Complejidad
4. **Totales de Órdenes** - Incluye promedio de resolución y tasa de completado
5. **Totales de Configuraciones** - Incluye distribución por router y porcentajes

### Fase 3: Endpoints Complejos ⭐⭐⭐ Alta Complejidad
6. **Totales de Ciclos** - Incluye cálculos financieros complejos y porcentajes de recaudación
7. **Totales de SMS** - Múltiples objetos anidados y métricas de interactividad
8. **Totales de Servicios** - Múltiples consultas SQL, servicio más popular, rangos de precios

---

## 📞 Contacto y Soporte

**Frontend**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
**Estado Actual**: Todos los endpoints retornan HTML o 404
**Impacto**: Dashboard muestra 0 en todos los indicadores de los 8 botones principales
**Documentación**: 8 requerimientos completos listos para implementación

Para más detalles sobre cada endpoint, consultar los documentos específicos listados en la sección "Estructura de Archivos".

---

## 📈 Métricas de Éxito

Los endpoints estarán correctamente implementados cuando:

✅ Retornen JSON válido (no HTML)
✅ Respondan en menos de 10 segundos
✅ Los indicadores en el dashboard muestren datos reales
✅ Los gráficos visuales se generen correctamente
✅ No generen errores en la consola del frontend
✅ Los 8 botones principales muestren sus métricas correctamente
✅ Todos los datos sean consistentes con la base de datos

---

## 🎯 Resumen Rápido por Endpoint

| # | Endpoint | Botón UI | Complejidad | Campos Principales | Estado |
|---|----------|----------|-------------|-------------------|--------|
| 1 | `/totales-conexiones` | Conexiones | ⭐ Baja | 4 contadores | ✅ Completo |
| 2 | `/totales-ciclos` | Facturaciones | ⭐⭐⭐ Alta | 4 contadores + resumen financiero | ✅ Completo |
| 3 | `/totales-sms` | Gestión SMS | ⭐⭐⭐ Alta | 5 contadores + 4 objetos anidados | ✅ Completo |
| 4 | `/totales-ordenes` | Órdenes | ⭐⭐ Media | 5 contadores + rendimiento | ✅ Completo |
| 5 | `/totales-configuraciones` | Configuraciones | ⭐⭐ Media | 3 contadores + distribución | ✅ Completo |
| 6 | `/totales-instalaciones` | Instalaciones | ⭐ Baja | 1 contador + 3 objetos simples | ✅ Completo |
| 7 | `/totales-usuarios` | Usuarios | ⭐ Baja | 3 contadores + roles | ✅ Completo |
| 8 | `/totales-servicios` | Servicios | ⭐⭐⭐ Alta | Planes + suscripciones + ingresos + estadísticas | ✅ Completo |

**Nota sobre Usuarios**: Existe consulta opcional para versión mejorada (`CONSULTA_BACKEND_USUARIOS_MEJORADO.md`) con métricas de actividad y top roles.

---

**Fecha de creación**: 2025-11-30
**Última actualización**: 2025-11-30
**Versión**: 4.0 - Todos los 8 endpoints completamente documentados

**Cambios en v4.0**:
- ✅ Agregado `REQUERIMIENTO_BACKEND_TOTALES_SERVICIOS.md` completo
- ✅ Actualizada complejidad de Servicios a "Alta"
- ✅ Todos los 8 endpoints listos para implementación backend
- ℹ️ Consulta opcional de Usuarios mejorado disponible
