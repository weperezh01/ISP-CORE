# MENSAJE BACKEND: Pantalla Historial de Acciones - Verificación y Mejoras

## 🎯 Objetivo
Asegurar que la pantalla de historial de acciones (`EventosScreen.tsx`) funcione correctamente mostrando todos los eventos y acciones administrativas de una conexión.

---

## 📍 Estado Actual del Frontend

**Archivo**: `src/pantallas/conexiones/detallesConexion/EventosScreen.tsx`

**Endpoint actual usado**:
```javascript
POST https://wellnet-rd.com:444/api/obtener-log-cortes
Body: { "id_conexion": 123 }
```

**Parámetros recibidos**:
- `connectionId`: ID de la conexión para ver su historial
- `clientId`: ID del cliente (para referencia)

---

## ✅ Lo Que Ya Funciona en el Frontend

1. **Lista de eventos/acciones** ordenada por fecha (más recientes primero)
2. **Iconos dinámicos** según tipo de evento:
   - ✂️ Corte/Suspensión → Tijeras rojas
   - ⚡ Reconexión/Activación → Power verde
   - 👤 Baja/Cancelación → Person remove naranja
   - 🔨 Alta/Instalación → Build azul
   - ↔️ Cambio de servicio → Swap cyan
   - ➕ Asignación de servicio → Add circle teal
   - ⚙️ Configuración → Settings púrpura
   - ✏️ Modificación → Edit morado
   - 🕐 Otros eventos → History gris

3. **Colores temáticos** por tipo de acción
4. **Formateo de fechas** en español (ej: "30 nov. 2024 • 14:30")
5. **Navegación** a detalles del evento (`DetalleEventoScreen`)
6. **Pull-to-refresh** para actualizar la lista
7. **Estado vacío** cuando no hay eventos
8. **Contador** de acciones registradas en el header

---

## 📊 Campos que el Frontend Usa Actualmente

```typescript
interface Evento {
  id_log_unico: string;        // Requerido - ID único del evento
  tipo_evento: string;          // Requerido - Tipo de acción
  mensaje: string;              // Requerido - Descripción de la acción
  fecha: string;                // Requerido - ISO date (YYYY-MM-DDTHH:mm:ss)
  nombre_usuario: string;       // Requerido - Nombre del usuario que realizó la acción
  id_usuario: number;           // Requerido - ID del usuario
  direccion_ipv4?: string;      // Opcional - IP desde donde se realizó la acción
}
```

---

## ❓ Preguntas para el Backend

### 1. Endpoint Principal

**¿El endpoint `POST /api/obtener-log-cortes` existe y funciona correctamente?**
- [ ] Sí, retorna JSON válido
- [ ] No, retorna HTML
- [ ] No existe
- [ ] Existe pero tiene otro nombre

**Nota**: El nombre "obtener-log-cortes" sugiere que solo retorna cortes, pero el frontend espera TODOS los tipos de eventos.

### 2. Tipos de Eventos Disponibles

**¿Qué tipos de eventos se registran en la base de datos?**

Tipos que el frontend reconoce:
- [ ] "Corte" / "Suspensión"
- [ ] "Reconexión" / "Activación"
- [ ] "Baja" / "Cancelación"
- [ ] "Alta" / "Crear" / "Instalación"
- [ ] "Cambio de servicio" / "Cambiar servicio"
- [ ] "Asignación de servicio" / "Asignar servicio"
- [ ] "Configuración" / "Configurar"
- [ ] "Modificación" / "Editar"
- [ ] Otros: _______________

**¿Cómo se guardan en la BD?**
```sql
-- Ejemplos:
tipo_evento = 'Corte manual'
tipo_evento = 'Reconexión automática'
tipo_evento = 'Cambio de servicio - 10 Mbps a 20 Mbps'
-- ...
```

### 3. Estructura de la Tabla

**¿Cuál es el nombre de la tabla de logs?**
- [ ] `log_cortes`
- [ ] `historial_acciones`
- [ ] `eventos_conexion`
- [ ] `audit_log`
- [ ] Otro: _______________

**¿Qué campos tiene la tabla?**
```sql
CREATE TABLE ??? (
  id_log_unico INT PRIMARY KEY,
  id_conexion INT,
  tipo_evento VARCHAR(255),
  mensaje TEXT,
  fecha DATETIME,
  id_usuario INT,
  direccion_ipv4 VARCHAR(45),
  -- ¿Hay otros campos?
  ...
);
```

### 4. Relación con Tabla de Usuarios

**¿Cómo se obtiene el nombre del usuario?**
```sql
-- ¿Hay un JOIN con la tabla usuarios?
LEFT JOIN usuarios ON log.id_usuario = usuarios.id_usuario

-- ¿O el nombre ya está en la tabla de logs?
log.nombre_usuario
```

### 5. Campos Adicionales Útiles

**¿Hay campos adicionales que podrían ser útiles?**
- [ ] `cambios_realizados` (JSON con antes/después)
- [ ] `motivo` (razón de la acción)
- [ ] `aprobado_por` (supervisor que aprobó)
- [ ] `costo` (si la acción tiene costo)
- [ ] `estado_anterior` / `estado_nuevo`
- [ ] `servicio_anterior` / `servicio_nuevo`
- [ ] `notas_tecnico`
- [ ] Otros: _______________

### 6. Pantalla de Detalle

**¿Existe el endpoint para ver detalles de un evento?**

El frontend navega a `DetalleEventoScreen` con `eventoId`:
```javascript
navigation.navigate('DetalleEventoScreen', { eventoId: item.id_log_unico })
```

**¿Hay un endpoint como:**
```
GET /api/evento-detalle/:id_log_unico
POST /api/obtener-detalle-evento
```

---

## 🔧 Problemas Potenciales Identificados

### Problema 1: Nombre Engañoso del Endpoint
```javascript
// El endpoint se llama "obtener-log-cortes"
// Pero el frontend espera TODOS los eventos, no solo cortes
```

**Solución requerida**:
- Opción A: Renombrar a `obtener-log-eventos` o `obtener-historial-acciones`
- Opción B: Documentar que retorna todos los eventos, no solo cortes

### Problema 2: Campo `nombre_usuario` Faltante
```javascript
// Si el JOIN no se hace correctamente:
nombre_usuario: null // ❌ Frontend muestra "Usuario desconocido"
```

**Solución requerida**: Asegurar que el JOIN con tabla usuarios funcione siempre.

### Problema 3: Formato de Fecha
```javascript
// El frontend espera formato ISO:
fecha: "2024-11-30T14:30:00" // ✅ Correcto
fecha: "2024-11-30 14:30:00" // ⚠️ También funciona pero menos estándar
fecha: "30/11/2024"          // ❌ No funciona
```

**Solución requerida**: Retornar fechas en formato ISO 8601.

---

## 📝 SQL Sugerido para el Endpoint

### Consulta Base
```sql
SELECT
  l.id_log_unico,
  l.id_conexion,
  l.tipo_evento,
  l.mensaje,
  l.fecha,
  l.id_usuario,
  l.direccion_ipv4,
  u.nombre AS nombre_usuario,
  u.apellido AS apellido_usuario
FROM log_cortes l
LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
WHERE l.id_conexion = ?
ORDER BY l.fecha DESC;
```

**Nota**: Si apellido está disponible, se puede concatenar:
```sql
CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario
```

### Consulta con Filtros (Opcional pero Recomendado)
```sql
-- Filtrar por tipo de evento
WHERE l.id_conexion = ? AND l.tipo_evento LIKE '%Corte%'

-- Filtrar por rango de fechas
WHERE l.id_conexion = ? AND l.fecha BETWEEN ? AND ?

-- Filtrar por usuario
WHERE l.id_conexion = ? AND l.id_usuario = ?

-- Combinado con paginación
LIMIT ? OFFSET ?
```

---

## 🎨 Mejoras Sugeridas al Endpoint

### Mejora 1: Estadísticas de Eventos
Agregar contadores al response:
```json
{
  "success": true,
  "data": [ ... ],
  "estadisticas": {
    "total": 45,
    "cortes": 12,
    "reconexiones": 10,
    "cambios_servicio": 5,
    "configuraciones": 8,
    "otros": 10
  }
}
```

**Beneficio**: El frontend puede mostrar resúmenes visuales.

### Mejora 2: Paginación
Si hay muchos eventos (>100):
```json
{
  "success": true,
  "data": [ ... ],
  "paginacion": {
    "pagina_actual": 1,
    "total_paginas": 5,
    "total_registros": 234,
    "por_pagina": 50
  }
}
```

**Beneficio**: Mejor performance, menos datos transferidos.

### Mejora 3: Información del Usuario Expandida
```json
{
  "id_log_unico": 123,
  "usuario": {
    "id": 5,
    "nombre_completo": "Juan Pérez",
    "rol": "Técnico",
    "foto_perfil": "https://..."
  }
}
```

**Beneficio**: UI más rica con foto del usuario y su rol.

### Mejora 4: Cambios Detallados (Para DetalleEventoScreen)
```json
{
  "id_log_unico": 123,
  "tipo_evento": "Cambio de servicio",
  "cambios": {
    "servicio_anterior": {
      "id": 3,
      "nombre": "Internet 10 Mbps",
      "precio": 800.00
    },
    "servicio_nuevo": {
      "id": 7,
      "nombre": "Internet 20 Mbps",
      "precio": 1200.00
    }
  }
}
```

**Beneficio**: Detalles completos de qué cambió exactamente.

---

## 🧪 Testing Recomendado

### Test 1: Conexión con Eventos
```bash
curl -X POST 'https://wellnet-rd.com:444/api/obtener-log-cortes' \
  -H 'Content-Type: application/json' \
  -d '{"id_conexion": 123}'
```

**Respuesta esperada**: Array de eventos con todos los campos requeridos.

### Test 2: Conexión Sin Eventos
```bash
curl -X POST 'https://wellnet-rd.com:444/api/obtener-log-cortes' \
  -H 'Content-Type: application/json' \
  -d '{"id_conexion": 9999}'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": []
}
```
O simplemente: `[]`

### Test 3: Conexión Inválida
```bash
curl -X POST 'https://wellnet-rd.com:444/api/obtener-log-cortes' \
  -H 'Content-Type: application/json' \
  -d '{"id_conexion": "invalid"}'
```

**Respuesta esperada**:
```json
{
  "success": false,
  "error": "id_conexion debe ser numérico"
}
```

---

## 📋 Ejemplo de Respuesta Ideal

```json
[
  {
    "id_log_unico": "12345",
    "tipo_evento": "Corte manual",
    "mensaje": "Conexión suspendida por falta de pago - Factura vencida desde hace 15 días",
    "fecha": "2024-11-30T14:30:00",
    "nombre_usuario": "Juan Pérez",
    "id_usuario": 5,
    "direccion_ipv4": "192.168.1.100"
  },
  {
    "id_log_unico": "12344",
    "tipo_evento": "Cambio de servicio",
    "mensaje": "Plan cambiado de Internet 10 Mbps a Internet 20 Mbps",
    "fecha": "2024-11-25T10:15:00",
    "nombre_usuario": "María García",
    "id_usuario": 8,
    "direccion_ipv4": "192.168.1.50"
  },
  {
    "id_log_unico": "12343",
    "tipo_evento": "Reconexión automática",
    "mensaje": "Servicio restaurado - Pago registrado correctamente",
    "fecha": "2024-11-20T09:00:00",
    "nombre_usuario": "Sistema Automático",
    "id_usuario": 1,
    "direccion_ipv4": null
  }
]
```

---

## ✅ Checklist de Implementación

### Endpoint Principal
- [ ] Ruta `POST /api/obtener-log-cortes` (o renombrada) configurada
- [ ] Validar que `id_conexion` sea numérico
- [ ] Retornar JSON, nunca HTML
- [ ] Incluir todos los campos requeridos:
  - [ ] `id_log_unico`
  - [ ] `tipo_evento`
  - [ ] `mensaje`
  - [ ] `fecha` (formato ISO)
  - [ ] `nombre_usuario` (con JOIN a tabla usuarios)
  - [ ] `id_usuario`
  - [ ] `direccion_ipv4` (si existe)
- [ ] Ordenar por fecha DESC (más recientes primero)
- [ ] Manejar caso cuando no hay eventos (retornar array vacío)
- [ ] Content-Type: application/json
- [ ] Responder en <3 segundos

### Mejoras Opcionales
- [ ] Agregar estadísticas de eventos
- [ ] Implementar paginación (si >100 eventos)
- [ ] Información expandida del usuario (rol, foto)
- [ ] Detalles de cambios (antes/después)

### Endpoint de Detalle (Si No Existe)
- [ ] Crear `GET /api/evento-detalle/:id` o `POST /api/obtener-detalle-evento`
- [ ] Retornar información completa del evento
- [ ] Incluir cambios detallados si aplica
- [ ] Incluir archivos adjuntos si existen

---

## 📞 Respuestas Requeridas

**Por favor, responder las siguientes preguntas:**

1. **¿El endpoint `POST /api/obtener-log-cortes` existe y funciona?**
   - Respuesta: _______________

2. **¿Retorna todos los tipos de eventos o solo cortes?**
   - Respuesta: _______________

3. **¿Qué tipos de eventos se registran actualmente?**
   - Respuesta: _______________

4. **¿Cuál es el nombre real de la tabla de logs en la BD?**
   - Respuesta: _______________

5. **¿Se hace JOIN con tabla usuarios para obtener el nombre?**
   - Respuesta: _______________

6. **¿Existe endpoint para ver detalle de un evento específico?**
   - Respuesta: _______________

7. **¿Hay campos adicionales útiles que no estamos usando?**
   - Respuesta: _______________

8. **¿Hay algún problema conocido con este endpoint?**
   - Respuesta: _______________

---

## 🚀 Prioridad

**MEDIA-ALTA** - Esta pantalla es importante para auditoría y seguimiento de acciones administrativas en las conexiones.

---

## 🎯 Resultado Esperado

Después de verificar/corregir el endpoint:

1. ✅ La lista de eventos se carga correctamente
2. ✅ Todos los tipos de eventos se muestran (no solo cortes)
3. ✅ Los nombres de usuarios se muestran correctamente
4. ✅ Las fechas se formatean correctamente
5. ✅ Los íconos y colores se asignan según el tipo de evento
6. ✅ La navegación a detalles funciona (si existe el endpoint)
7. ✅ No hay errores en consola
8. ✅ El rendimiento es óptimo (<3 segundos)

---

## 💡 Casos de Uso Reales

### Caso 1: Auditoría de Cortes
Un supervisor quiere ver por qué se cortó un cliente:
- ¿Quién lo cortó?
- ¿Cuándo?
- ¿Por qué? (mensaje)
- ¿Desde qué IP?

### Caso 2: Historial de Cambios de Servicio
Cliente reclama que le cambiaron el plan sin autorización:
- Ver todos los cambios de servicio
- Quién lo hizo
- Cuándo
- De qué plan a qué plan

### Caso 3: Seguimiento de Instalación
Verificar el proceso completo de una instalación:
- Alta → Asignación de servicio → Configuración de router → Activación

---

**Fecha de creación**: 2025-11-30
**Desarrollador Frontend**: Verificar `src/pantallas/conexiones/detallesConexion/EventosScreen.tsx`
**Estado**: Esperando respuesta del backend para verificar funcionalidad
