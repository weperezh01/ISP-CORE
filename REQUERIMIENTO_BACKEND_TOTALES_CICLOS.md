# REQUERIMIENTO BACKEND: Endpoint Totales de Ciclos de Facturación

## 🎯 Objetivo
Implementar/arreglar el endpoint de totales de ciclos de facturación para que los indicadores numéricos en el botón "Facturaciones" del Panel de Control y Gestión funcionen correctamente.

---

## 📍 Ubicación en Frontend
**Archivo**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
**Líneas**: 420-499 (función `ciclosTotales`)
**Uso visual**: Líneas 1564-1616 (indicadores dentro del botón de Facturaciones)

---

## 🔗 Endpoint Requerido

```
GET https://wellnet-rd.com:444/api/totales-ciclos/{ispId}
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
    "totalCiclos": 24,
    "ciclosVigentes": 18,
    "ciclosCerrados": 5,
    "ciclosVencidos": 1,
    "resumenFinanciero": {
      "totalFacturas": 450,
      "totalDinero": 125000.50,
      "facturasPendientes": 85,
      "dineroPendiente": 28500.75,
      "facturasCobradasPorcentaje": 81.11,
      "dineroRecaudadoPorcentaje": 77.20
    }
  }
}
```

### Opción 2: Formato Snake Case (También Soportado)
```json
{
  "success": true,
  "data": {
    "total_ciclos": 24,
    "ciclos_vigentes": 18,
    "ciclos_cerrados": 5,
    "ciclos_vencidos": 1,
    "resumen_financiero": {
      "total_facturas": 450,
      "total_dinero": 125000.50,
      "facturas_pendientes": 85,
      "dinero_pendiente": 28500.75,
      "facturas_cobradas_porcentaje": 81.11,
      "dinero_recaudado_porcentaje": 77.20
    }
  }
}
```

---

## 📊 Campos Requeridos

### Campos Principales

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `totalCiclos` | number | Total de ciclos de facturación del ISP | ✅ |
| `ciclosVigentes` | number | Ciclos actualmente vigentes/activos | ✅ |
| `ciclosCerrados` | number | Ciclos que ya cerraron | ✅ |
| `ciclosVencidos` | number | Ciclos vencidos sin cerrar | ✅ |
| `resumenFinanciero` | object | Resumen financiero de los ciclos | ✅ |

### Objeto resumenFinanciero

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `totalFacturas` | number | Total de facturas generadas | ✅ |
| `totalDinero` | number | Monto total facturado | ✅ |
| `facturasPendientes` | number | Facturas sin cobrar | ✅ |
| `dineroPendiente` | number | Monto pendiente de cobro | ✅ |
| `facturasCobradasPorcentaje` | number | % de facturas cobradas | ⚠️ Opcional* |
| `dineroRecaudadoPorcentaje` | number | % del dinero recaudado | ⚠️ Opcional* |

**\*Nota sobre porcentajes**: Si no se envían, el frontend los calculará automáticamente:
```javascript
dineroRecaudadoPorcentaje = ((totalDinero - dineroPendiente) / totalDinero) * 100
```

---

## 🎨 Uso en la UI

Los datos se muestran dentro del botón "Facturaciones" en el Panel de Control y Gestión:

```
┌─────────────────────────────┐
│   💰 Facturaciones          │
│                              │
│   Total: 24 ciclos           │
│   ▓▓▓▓▓▓▓░░                 │  ← Gráfico: Vigentes/Cerrados/Vencidos
│                              │
│   🟢 Recaudación: 77.20%     │
│   🟡 Pendiente: $28,500.75   │
└─────────────────────────────┘
```

**Comportamiento visual del porcentaje de recaudación**:
- **≥ 80%**: Color verde (éxito)
- **≤ 10%**: Color amarillo/rojo (advertencia)
- **Entre 11-79%**: Color normal

---

## 🔍 Definición de Estados de Ciclos

| Estado | Descripción |
|--------|-------------|
| **Vigente** | Ciclo actualmente activo, dentro del período de facturación |
| **Cerrado** | Ciclo finalizado correctamente |
| **Vencido** | Ciclo que superó su fecha límite sin cerrarse correctamente |

---

## ⚠️ Manejo de Errores

### Caso 1: Endpoint No Disponible
```javascript
// Frontend mostrará: 0 en todos los campos
// Console: "❌ Error en totales-ciclos: [mensaje]"
```

### Caso 2: Respuesta HTML en lugar de JSON
```javascript
// Frontend detecta: payload.trim().startsWith('<')
// Console: "❌ API totales-ciclos retornó HTML"
// Acción: Todos los valores = 0
```

### Caso 3: Timeout (>10 segundos)
```javascript
// Frontend cancela la petición
// Console: "❌ Error en totales-ciclos: timeout"
// Acción: Todos los valores = 0
```

### Caso 4: Porcentaje no calculado
Si el backend no envía `dineroRecaudadoPorcentaje` pero sí envía `totalDinero` y `dineroPendiente`, el frontend calcula:
```javascript
const recaudado = totalDinero - dineroPendiente;
const porcentaje = (recaudado / totalDinero) * 100;
```

---

## 📝 Lógica de Negocio Sugerida (Backend)

```sql
-- Ejemplo SQL para calcular los totales de ciclos
SELECT
    COUNT(*) as total_ciclos,
    SUM(CASE WHEN estado = 'vigente' THEN 1 ELSE 0 END) as ciclos_vigentes,
    SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as ciclos_cerrados,
    SUM(CASE WHEN estado = 'vencido' THEN 1 ELSE 0 END) as ciclos_vencidos
FROM ciclos_facturacion
WHERE id_isp = ?;

-- Ejemplo SQL para resumen financiero
SELECT
    COUNT(DISTINCT f.id_factura) as total_facturas,
    COALESCE(SUM(f.monto_total), 0) as total_dinero,
    COUNT(DISTINCT CASE WHEN f.estado_pago = 'pendiente' THEN f.id_factura END) as facturas_pendientes,
    COALESCE(SUM(CASE WHEN f.estado_pago = 'pendiente' THEN f.monto_total ELSE 0 END), 0) as dinero_pendiente
FROM facturas f
INNER JOIN ciclos_facturacion c ON f.id_ciclo = c.id_ciclo
WHERE c.id_isp = ?;

-- Cálculo de porcentajes (opcional en backend)
-- facturas_cobradas_porcentaje = ((total_facturas - facturas_pendientes) / total_facturas) * 100
-- dinero_recaudado_porcentaje = ((total_dinero - dinero_pendiente) / total_dinero) * 100
```

---

## ✅ Checklist de Implementación

- [ ] Crear/verificar ruta `GET /api/totales-ciclos/:ispId`
- [ ] Validar que `ispId` sea un número válido
- [ ] Consultar tabla de ciclos de facturación filtrada por `id_isp`
- [ ] Calcular totales por estado de ciclo
- [ ] Consultar facturas relacionadas a los ciclos
- [ ] Calcular resumen financiero
- [ ] Calcular porcentajes (o dejar que frontend los calcule)
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
  'https://wellnet-rd.com:444/api/totales-ciclos/5' \
  -H 'Accept: application/json'
```

**Response esperada**:
```json
{
  "success": true,
  "data": {
    "totalCiclos": 24,
    "ciclosVigentes": 18,
    "ciclosCerrados": 5,
    "ciclosVencidos": 1,
    "resumenFinanciero": {
      "totalFacturas": 450,
      "totalDinero": 125000.50,
      "facturasPendientes": 85,
      "dineroPendiente": 28500.75,
      "facturasCobradasPorcentaje": 81.11,
      "dineroRecaudadoPorcentaje": 77.20
    }
  }
}
```

---

## 📞 Contacto

**Frontend Developer**: Revisar `IspDetailsScreen.tsx` líneas 420-499 para más detalles
**Estado actual**: Endpoint retorna HTML o no existe, causando que todos los indicadores muestren 0

---

## 🚀 Prioridad

**ALTA** - Los usuarios necesitan ver las estadísticas de facturación en el dashboard principal.

---

**Fecha de creación**: 2025-11-30
**Última actualización**: 2025-11-30
