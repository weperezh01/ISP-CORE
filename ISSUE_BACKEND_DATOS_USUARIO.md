# PROBLEMA: Endpoint `/api/usuarios/datos-usuario` no devuelve datos completos

## 🚨 Problema Identificado

El endpoint `/api/usuarios/datos-usuario` está devolviendo campos importantes como **strings vacíos** (`""`) en lugar de los valores reales que están almacenados en la base de datos.

## 📋 Campos Afectados

Los siguientes campos se devuelven vacíos cuando **SÍ tienen datos en la base de datos**:

- `nombre` 
- `apellido`
- `telefono1`
- `telefono2` 
- `email`
- `direccion` (si existe)
- `cedula` (si existe)

## 🔍 Evidencia del Problema

### Respuesta Actual del Endpoint:
```json
{
  "usuario": {
    "id": 1,
    "usuario": "well",
    "nombre": "",          // ❌ VACÍO - pero existe en BD
    "apellido": "",        // ❌ VACÍO - pero existe en BD
    "telefono1": "",       // ❌ VACÍO - pero existe en BD
    "telefono2": "",       // ❌ VACÍO - pero existe en BD
    "email": "",           // ❌ VACÍO - pero existe en BD
    "rol": "",
    // ... otros campos ...
  }
}
```

### Llamada al Endpoint:
```
POST https://wellnet-rd.com:444/api/usuarios/datos-usuario
Content-Type: application/json

{
  "id": 1
}
```

## 🎯 Solución Requerida

**El endpoint debe devolver los valores reales de la base de datos** para estos campos en lugar de strings vacíos.

### Respuesta Esperada:
```json
{
  "usuario": {
    "id": 1,
    "usuario": "well",
    "nombre": "Juan",           // ✅ VALOR REAL de la BD
    "apellido": "Pérez",        // ✅ VALOR REAL de la BD
    "telefono1": "809-123-4567", // ✅ VALOR REAL de la BD
    "telefono2": "829-987-6543", // ✅ VALOR REAL de la BD
    "email": "juan@example.com", // ✅ VALOR REAL de la BD
    "rol": "admin",
    // ... otros campos ...
  }
}
```

## 🔧 Investigación Adicional Sugerida

1. **Verificar la consulta SQL** del endpoint para asegurar que incluye todos los campos
2. **Revisar si hay JOINs faltantes** con otras tablas que contengan estos datos
3. **Verificar mapeo de campos** entre la BD y la respuesta del endpoint
4. **Comprobar si hay filtros** que estén limpiando estos campos

## 📱 Impacto en la Aplicación

- **Formulario de edición de usuario**: Los campos aparecen vacíos cuando deberían mostrar datos existentes
- **Pantalla de detalles de usuario**: Información incompleta del usuario
- **Experiencia de usuario**: Confusión al ver campos vacíos que deberían tener datos

## 🧪 Para Probar la Solución

1. Hacer la llamada al endpoint con un usuario que tenga datos completos en la BD
2. Verificar que todos los campos devuelven los valores correctos
3. Confirmar que la estructura de respuesta se mantiene igual

## 📞 Contacto

Este issue fue identificado durante el desarrollo del formulario de edición de usuarios en la aplicación React Native.

**Fecha**: ${new Date().toLocaleDateString()}
**Prioridad**: Alta - Afecta funcionalidad crítica de edición de usuarios