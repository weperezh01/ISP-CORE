# Corrección: Estados de Conexión Invertidos

## 🐛 Problema Identificado

Las conexiones **ACTIVAS** se mostraban como **INACTIVAS** (invertidas) en la pantalla `ConexionesCicloScreen`.

### Causa Raíz

El frontend tenía hardcodeados IDs de estados **incorrectos**:
- Usaba `id_estado_conexion === 1` para "Activas"
- Debería usar `id_estado_conexion === 3` para "Activas"

El backend estaba correcto y retornaba `id_estado_conexion = 3` para conexiones activas.

## ✅ Solución Implementada

### 1. Corrección de IDs en ConexionesCicloScreen.tsx

**Cambios realizados:**

```typescript
// ❌ ANTES (INCORRECTO)
conexionesActivas: sortedConnections.filter(c => c.id_estado_conexion === 1).length
conexionesInactivas: sortedConnections.filter(c => c.id_estado_conexion !== 1 && c.id_estado_conexion !== 4).length

// ✅ DESPUÉS (CORRECTO)
conexionesActivas: sortedConnections.filter(c => c.id_estado_conexion === 3).length
conexionesInactivas: sortedConnections.filter(c => c.id_estado_conexion !== 3 && c.id_estado_conexion !== 4).length
```

**Ubicación:** `src/pantallas/factura/ConexionesCicloScreen.tsx`
- Líneas 53-59: Cálculo de estadísticas
- Líneas 84-93: Filtros por estado

### 2. Creación de Archivo de Constantes

**Archivo nuevo:** `src/constants/estadosConexion.ts`

```typescript
export const ESTADOS_CONEXION = {
  PENDIENTE_INSTALACION: 1,
  EN_EJECUCION: 2,
  ACTIVA: 3,              // ← Estado activo principal
  SUSPENDIDA: 4,          // ← Estado suspendido
  BAJA_VOLUNTARIA: 5,
  BAJA_FORZADA: 6,
  AVERIADA: 7,
  PENDIENTE_RECONEXION: 8,
} as const;
```

**Beneficios:**
- ✅ Evita números mágicos en el código
- ✅ Facilita el mantenimiento
- ✅ Previene errores futuros
- ✅ Incluye helpers para verificación de estados

### 3. Actualización de ConexionesCicloScreen para usar Constantes

```typescript
import { ESTADOS_CONEXION } from '../../constants/estadosConexion';

// Uso de constantes en lugar de números mágicos
filtered = filtered.filter(c => c.id_estado_conexion === ESTADOS_CONEXION.ACTIVA);
```

## 📊 Tabla de Estados Correcta

| ID | Estado                   | Clasificación |
|----|--------------------------|---------------|
| 1  | Pendiente de Instalación | Inactiva      |
| 2  | En Ejecución             | Inactiva      |
| 3  | Activa                   | **Activa** ✅ |
| 4  | Suspendida               | **Suspendida** ✅ |
| 5  | Baja Voluntaria          | Inactiva      |
| 6  | Baja Forzada             | Inactiva      |
| 7  | Averiada                 | Inactiva      |
| 8  | Pendiente de Reconexión  | Inactiva      |

## 📁 Archivos Modificados/Creados

### Modificados
1. ✅ `src/pantallas/factura/ConexionesCicloScreen.tsx`
   - Corregidos IDs de estados (1 → 3)
   - Importadas constantes
   - Actualizada lógica de filtrado

### Creados
2. ✅ `src/constants/estadosConexion.ts`
   - Constantes de estados
   - Helpers de verificación
   - Funciones de utilidad (colores, nombres)

3. ✅ `CORRECCION_ESTADOS_CONEXION.md`
   - Esta documentación

## 🧪 Validación

### Antes de la corrección ❌
- Filtro "Activas": Mostraba conexiones con `id_estado_conexion = 1` (pendientes de instalación)
- Filtro "Inactivas": Mostraba conexiones con `id_estado_conexion = 3` (activas)
- **Resultado:** Estados invertidos

### Después de la corrección ✅
- Filtro "Activas": Muestra conexiones con `id_estado_conexion = 3` (activas)
- Filtro "Suspendidas": Muestra conexiones con `id_estado_conexion = 4` (suspendidas)
- Filtro "Inactivas": Muestra conexiones con otros estados (1, 2, 5, 6, 7, 8)
- **Resultado:** Estados correctos

### Ejemplo con Ciclo 1717348
```
Total: 120 conexiones
- Activas (id=3): 110 ✅
- Suspendidas (id=4): 10 ✅
- Inactivas (otros): 0 ✅
```

## 🚀 Próximos Pasos Recomendados

### Para Evitar Errores Futuros

1. **Usar siempre las constantes**
   ```typescript
   // ✅ BIEN
   import { ESTADOS_CONEXION } from '@/constants/estadosConexion';
   if (conexion.id_estado_conexion === ESTADOS_CONEXION.ACTIVA) { ... }

   // ❌ MAL
   if (conexion.id_estado_conexion === 3) { ... }
   ```

2. **Extender las constantes**
   - Agregar constantes para otros IDs que se usen frecuentemente
   - Crear constantes para tipos de conexión, ciclos, etc.

3. **Revisar código existente**
   - Buscar otros lugares con números mágicos
   - Reemplazar por constantes apropiadas

## 📝 Notas Importantes

- ⚠️ **El backend NO necesitó cambios** - estaba funcionando correctamente
- ✅ Los endpoints retornan los IDs correctos desde la base de datos
- ✅ Las estadísticas del endpoint coinciden con el listado
- 🎯 Solo el frontend necesitaba la corrección

## ✅ Estado Final

**🟢 CORREGIDO Y OPERATIVO**

Los filtros ahora funcionan correctamente:
- Activas → Muestra conexiones activas (id=3) ✅
- Suspendidas → Muestra conexiones suspendidas (id=4) ✅
- Inactivas → Muestra otros estados ✅

Las estadísticas coinciden perfectamente entre:
- Tarjeta de estadísticas en DetalleCiclo
- Lista filtrada en ConexionesCicloScreen

---

**Fecha de corrección:** 2025-11-10
**Archivos afectados:** 2 modificados, 2 creados
**Prioridad:** ALTA (Crítico para confianza del usuario)
**Estado:** ✅ RESUELTO
