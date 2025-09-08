# SOLICITUD PARA BACKEND - CAMPO ESTADO EN DETALLES DE INSTALACIÓN

## Problema Detectado
Para implementar el indicador de instalaciones abiertas/pendientes, necesitamos el campo `id_estado_conexion` en la respuesta del endpoint que devuelve los detalles de instalaciones.

## Endpoint Afectado
**Cualquier endpoint que devuelva `detallesInstalacion`** (probablemente en la respuesta de detalles de conexión)

## Campo Requerido

### **id_estado_conexion**
- **Tipo**: INTEGER
- **Valores**:
  - `2`: Instalación guardada para continuar más tarde (ABIERTA)
  - `3`: Instalación finalizada (CERRADA)

## Estructura Actual vs Requerida

### **Estructura Actual** (lo que recibimos):
```json
{
  "detallesInstalacion": [
    {
      "id_instalacion": 1237,
      "fecha_guardado": "2025-06-28T04:23:21.000Z",
      "tipo_conexion": "",
      "notas_config": "",
      "router_wifi": "",
      "notas_instalacion": "Prueba de edición",
      "latitud": "40.76799300",
      "longitud": "-74.03214300",
      "detalleUsuario": {
        "nombre": "Juan Pérez"
      }
      // FALTA: id_estado_conexion
    }
  ]
}
```

### **Estructura Requerida** (lo que necesitamos):
```json
{
  "detallesInstalacion": [
    {
      "id_instalacion": 1237,
      "fecha_guardado": "2025-06-28T04:23:21.000Z",
      "tipo_conexion": "",
      "notas_config": "",
      "router_wifi": "",
      "notas_instalacion": "Prueba de edición",
      "latitud": "40.76799300",
      "longitud": "-74.03214300",
      "id_estado_conexion": 2,  // ← ESTE CAMPO ES NECESARIO
      "detalleUsuario": {
        "nombre": "Juan Pérez"
      }
    }
  ]
}
```

## Lógica de Negocio

### **Estados de Instalación**:
1. **Estado 2 (Guardada)**: 
   - Se guarda cuando el usuario presiona "💾 Continuar Instalación Más Tarde"
   - Indica que la instalación está ABIERTA/PENDIENTE
   - **Dispara la alerta**: "Instalación Pendiente"

2. **Estado 3 (Finalizada)**:
   - Se guarda cuando el usuario presiona "✅ Finalizar Instalación"
   - Indica que la instalación está CERRADA/COMPLETADA
   - **NO dispara alerta**

### **Comportamiento del Indicador**:
- **Mostrar alerta**: Si la instalación MÁS RECIENTE tiene `id_estado_conexion = 2`
- **Ocultar alerta**: Si la instalación MÁS RECIENTE tiene `id_estado_conexion = 3`

## Query SQL Sugerido
Si el endpoint actual hace algo como:
```sql
SELECT i.*, u.nombre as instalador_nombre 
FROM instalaciones i 
LEFT JOIN usuarios u ON i.id_usuario = u.id 
WHERE i.id_conexion = ?
```

Debe incluir:
```sql
SELECT i.*, u.nombre as instalador_nombre, i.id_estado_conexion
FROM instalaciones i 
LEFT JOIN usuarios u ON i.id_usuario = u.id 
WHERE i.id_conexion = ?
ORDER BY i.fecha_guardado DESC
```

## Verificación

Para probar que funciona:
1. Crear una instalación y guardarla con "Continuar más tarde" (debe tener `id_estado_conexion: 2`)
2. Ver que aparece la alerta en ConexionDetalles
3. Editar esa instalación y usar "Finalizar Instalación" (debe cambiar a `id_estado_conexion: 3`)
4. Ver que la alerta desaparece

## Impacto
Sin este campo, el sistema no puede determinar si una instalación está pendiente o completada, y por tanto no puede mostrar las alertas apropiadas para guiar al usuario.

## Prioridad
**ALTA** - Requerido para la funcionalidad de indicadores de instalaciones pendientes.