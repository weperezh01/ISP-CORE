# REQUERIMIENTO BACKEND: Endpoint Totales de Usuarios

## 🎯 Objetivo
Implementar/arreglar el endpoint de totales de usuarios para que los indicadores numéricos en el botón "Usuarios" del Panel de Control y Gestión funcionen correctamente.

---

## 📍 Ubicación en Frontend
**Archivo**: `src/pantallas/operaciones/IspDetailsScreen.tsx`
**Líneas**: 777-806 (función `usuariosTotales`)
**Uso visual**: Líneas 1743-1762 (indicadores dentro del botón de Usuarios)

---

## 🔗 Endpoint Requerido

```
GET https://wellnet-rd.com:444/api/totales-usuarios/{ispId}
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
    "totalUsuarios": 45,
    "activos": 38,
    "inactivos": 7,
    "roles": {
      "Admin": 5,
      "Operador": 12,
      "Técnico": 18,
      "Soporte": 8,
      "Vendedor": 2
    }
  }
}
```

### Opción 2: Formato Snake Case (También Soportado)
```json
{
  "success": true,
  "data": {
    "total_usuarios": 45,
    "usuarios_activos": 38,
    "usuarios_inactivos": 7,
    "roles": {
      "Admin": 5,
      "Operador": 12,
      "Técnico": 18,
      "Soporte": 8,
      "Vendedor": 2
    }
  }
}
```

### Opción 3: Formatos Alternativos (También Soportados)

El frontend también reconoce:
```json
{
  "total_usuarios": 45,
  "usuariosActivos": 38,     // alternativa a "activos"
  "usuariosInactivos": 7     // alternativa a "inactivos"
}
```

---

## 📊 Campos Requeridos

### Campos Principales

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `totalUsuarios` | number | Total de usuarios del ISP | ✅ |
| `activos` | number | Usuarios activos (estado habilitado) | ✅ |
| `inactivos` | number | Usuarios inactivos (estado deshabilitado) | ✅ |
| `roles` | object | Distribución de usuarios por rol | ⚠️ Opcional |

### Objeto roles

Objeto clave-valor donde:
- **Clave**: Nombre del rol
- **Valor**: Cantidad de usuarios con ese rol

```json
{
  "Admin": 5,
  "Operador": 12,
  "Técnico": 18,
  "Soporte": 8,
  "Vendedor": 2
}
```

**Nota**: El objeto `roles` es opcional. Si no se envía, el frontend simplemente no lo muestra.

---

## 🎨 Uso en la UI

Los datos se muestran dentro del botón "Usuarios" en el Panel de Control y Gestión:

```
┌─────────────────────────────┐
│   👥 Usuarios               │
│                              │
│   Total: 45                  │
│   ▓▓▓▓▓▓▓░                  │  ← Gráfico: Activos/Inactivos
└─────────────────────────────┘
```

**Comportamiento del gráfico**:
- **Verde**: Usuarios activos
- **Gris**: Usuarios inactivos
- Si el total es 0, no se muestra el gráfico

**Nota**: A diferencia de otros botones, el botón de Usuarios tiene una UI más simple, mostrando solo:
- Total de usuarios
- Gráfico visual de activos/inactivos (si hay datos)

---

## 🔍 Estados de Usuarios

| Estado | Descripción |
|--------|-------------|
| **Activo** | Usuario habilitado con acceso al sistema |
| **Inactivo** | Usuario deshabilitado sin acceso al sistema |

---

## ⚠️ Manejo de Errores

### Caso 1: Endpoint No Disponible
```javascript
// Frontend mostrará: 0 en todos los campos
// Console: "❌ Error en totales-usuarios: [mensaje]"
```

### Caso 2: Respuesta HTML en lugar de JSON
```javascript
// Frontend detecta: payload.trim().startsWith('<')
// Console: "❌ API totales-usuarios retornó HTML"
// Acción: Todos los valores = 0, roles = {}
```

### Caso 3: Timeout (>10 segundos)
```javascript
// Frontend cancela la petición
// Console: "❌ Error en totales-usuarios: timeout"
// Acción: Todos los valores = 0, roles = {}
```

### Caso 4: roles vacío
Si `roles` está vacío o no se envía, simplemente no afecta la UI (solo se usa para logging/análisis).

---

## 📝 Lógica de Negocio Sugerida (Backend)

```sql
-- Ejemplo SQL para calcular los totales de usuarios
SELECT
    COUNT(*) as total_usuarios,
    SUM(CASE WHEN estado = 'activo' OR estado = 1 OR activo = TRUE THEN 1 ELSE 0 END) as activos,
    SUM(CASE WHEN estado = 'inactivo' OR estado = 0 OR activo = FALSE THEN 1 ELSE 0 END) as inactivos
FROM usuarios
WHERE id_isp = ?;

-- Ejemplo SQL para distribución por roles
SELECT
    r.nombre_rol,
    COUNT(u.id_usuario) as cantidad
FROM usuarios u
INNER JOIN roles r ON u.id_rol = r.id_rol
WHERE u.id_isp = ?
GROUP BY r.id_rol, r.nombre_rol
ORDER BY cantidad DESC;
```

**Formato del resultado de roles**:
```javascript
// Convertir resultado SQL a objeto:
{
  "Admin": 5,
  "Operador": 12,
  "Técnico": 18
}
```

---

## ✅ Checklist de Implementación

- [ ] Crear/verificar ruta `GET /api/totales-usuarios/:ispId`
- [ ] Validar que `ispId` sea un número válido
- [ ] Consultar tabla de usuarios filtrada por `id_isp`
- [ ] Calcular total de usuarios
- [ ] Calcular usuarios activos e inactivos
- [ ] Opcionalmente, obtener distribución por roles
- [ ] Convertir distribución a objeto clave-valor (si se incluye)
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
  'https://wellnet-rd.com:444/api/totales-usuarios/5' \
  -H 'Accept: application/json'
```

**Response esperada (con roles)**:
```json
{
  "success": true,
  "data": {
    "totalUsuarios": 45,
    "activos": 38,
    "inactivos": 7,
    "roles": {
      "Admin": 5,
      "Operador": 12,
      "Técnico": 18,
      "Soporte": 8,
      "Vendedor": 2
    }
  }
}
```

**Response mínima aceptable (sin roles)**:
```json
{
  "success": true,
  "data": {
    "totalUsuarios": 45,
    "activos": 38,
    "inactivos": 7,
    "roles": {}
  }
}
```

---

## 💡 Notas Adicionales

### Validación de Datos
Asegurarse que:
```
activos + inactivos ≈ totalUsuarios
```

Si hay discrepancia, puede haber usuarios en otros estados no contemplados.

### Consideraciones sobre Roles
- El objeto `roles` es principalmente para análisis y logging
- No afecta la visualización actual en la UI
- Puede ser útil para futuras mejoras del dashboard
- Los nombres de roles deben ser strings descriptivos

### Estados de Usuario
Típicamente un usuario puede estar:
- **Activo/Habilitado**: Puede acceder al sistema
- **Inactivo/Deshabilitado**: No puede acceder al sistema
- **Eliminado**: No debería contarse en los totales (excluir de la consulta)

---

## 📞 Contacto

**Frontend Developer**: Revisar `IspDetailsScreen.tsx` líneas 777-806 para más detalles
**Estado actual**: Endpoint retorna HTML o no existe, causando que todos los indicadores muestren 0

---

## 🚀 Prioridad

**MEDIA-ALTA** - Los usuarios necesitan ver estadísticas de su equipo en el dashboard.

---

## 🎯 Complejidad

**⭐ Baja** - Solo requiere contadores simples, sin cálculos complejos o métricas avanzadas.

---

**Fecha de creación**: 2025-11-30
**Última actualización**: 2025-11-30
