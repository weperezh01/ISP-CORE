# Diagnóstico: Eventos de Cambio de Servicio no aparecen en Historial

## Problema Reportado
Se realizó un cambio de servicio en la conexión ID 2753, pero el evento NO aparece en el "Historial de Acciones" de la app móvil.

## Cambios Implementados

### 1. Frontend - EventosScreen.tsx
✅ Se agregaron los nuevos tipos de eventos:
- **"Cambio de servicio"** - Color Cyan (#0EA5E9), ícono swap-horiz
- **"Asignación de servicio"** - Color Teal (#14B8A6), ícono add-circle

✅ Se agregaron console logs de diagnóstico para ver:
- ID de conexión solicitada
- Cantidad de eventos recibidos del backend
- Tipos de eventos recibidos

### 2. Backend (Pendiente de verificación)
El backend debe registrar automáticamente eventos en la tabla `log_cortes` cuando se llaman:
- `/api/conexiones/agregar` → Debe crear evento "Asignación de servicio"
- `/api/conexiones/editar-conexion-servicio` → Debe crear evento "Cambio de servicio"

## Pasos de Diagnóstico

### Paso 1: Verificar Console Logs
Después de hacer un cambio de servicio en la conexión 2753, ve al Historial de Acciones y revisa los console logs:

```
npx react-native log-android  # Para Android
# o
npx react-native log-ios      # Para iOS
```

**Busca estos logs:**
```
🔍 [EventosScreen] Solicitando eventos para conexión: 2753
📥 [EventosScreen] Eventos recibidos: X eventos
📋 [EventosScreen] Tipos de eventos: [array de tipos]
✅ [EventosScreen] Eventos ordenados y establecidos: X
```

**Analiza:**
- ¿Aparece "Cambio de servicio" en el array de tipos de eventos?
- ¿La cantidad de eventos incluye el nuevo evento?

### Paso 2: Resultados Posibles

#### Escenario A: El evento SÍ aparece en los logs pero NO en la pantalla
**Causa:** Problema de renderizado o detección del tipo de evento en el frontend.
**Solución:** Verificar la lógica de `renderActionIcon()` y `getActionColor()` en EventosScreen.tsx.

#### Escenario B: El evento NO aparece en los logs del backend
**Causa:** El backend no está registrando el evento en la tabla `log_cortes`.
**Solución:** El backend debe implementar la lógica de logging en los endpoints mencionados.

### Paso 3: Verificación Manual en Base de Datos
Pídele al equipo de backend que ejecute esta consulta:

```sql
-- Verificar si el evento fue registrado
SELECT
    id_log_unico,
    id_conexion,
    tipo_evento,
    mensaje,
    fecha,
    id_usuario,
    nombre_usuario
FROM log_cortes
WHERE id_conexion = 2753
ORDER BY fecha DESC
LIMIT 10;
```

**¿Qué buscar?**
- ¿Existe un registro con `tipo_evento = 'Cambio de servicio'`?
- ¿La fecha corresponde al momento del cambio?
- ¿El `id_conexion` es correcto?

### Paso 4: Verificar endpoint `/api/obtener-log-cortes`
Si el evento existe en la BD pero no llega a la app, el problema está en el endpoint.

Prueba manual con curl:
```bash
curl -X POST https://wellnet-rd.com:444/api/obtener-log-cortes \
  -H "Content-Type: application/json" \
  -d '{"id_conexion": 2753}'
```

**Verifica:**
- ¿El evento "Cambio de servicio" está en la respuesta?
- ¿Todos los campos necesarios están presentes?

## Solución Esperada

### Backend debe implementar:

**En `/api/conexiones/editar-conexion-servicio`:**
```javascript
// Después de actualizar la conexión exitosamente
await conexion.query(
    `INSERT INTO log_cortes
    (id_conexion, tipo_evento, mensaje, fecha, id_usuario, nombre_usuario, direccion_ipv4)
    VALUES (?, 'Cambio de servicio', ?, NOW(), ?, ?, ?)`,
    [
        id_conexion,
        `Servicio cambiado de ${servicio_anterior.nombre} a ${servicio_nuevo.nombre}`,
        id_usuario,
        nombre_usuario,
        ip_address
    ]
);
```

**En `/api/conexiones/agregar`:**
```javascript
// Después de crear la conexión exitosamente
await conexion.query(
    `INSERT INTO log_cortes
    (id_conexion, tipo_evento, mensaje, fecha, id_usuario, nombre_usuario, direccion_ipv4)
    VALUES (?, 'Asignación de servicio', ?, NOW(), ?, ?, ?)`,
    [
        id_conexion_nueva,
        `Servicio asignado: ${servicio.nombre}`,
        id_usuario,
        nombre_usuario,
        ip_address
    ]
);
```

## Estado Actual
- ✅ Frontend actualizado y con logs de diagnóstico
- ✅ **IMPLEMENTADO**: Registro de evento de "Asignación de servicio" en AsignacionServicioClienteScreen.tsx
- ⏳ Backend: Pendiente de verificación e implementación del endpoint `/api/log-cortes/registrar`
- 🔍 Caso de prueba: Conexión ID 2753

## Cambios Implementados - Frontend (AsignacionServicioClienteScreen.tsx)

### Nueva función: `registrarEventoAsignacion`
Se agregó una función que registra el evento cuando se asigna un nuevo servicio:

```javascript
const registrarEventoAsignacion = async (idConexion, nombreServicio) => {
    const eventData = {
        id_conexion: idConexion,
        tipo_evento: 'Asignación de servicio',
        mensaje: `Servicio asignado: ${nombreServicio}`,
        id_usuario: usuarioId,
        nota: `Nueva conexión creada con el servicio ${nombreServicio}`
    };

    await axios.post('https://wellnet-rd.com:444/api/log-cortes/registrar', eventData);
};
```

### Modificación en `handleAddNew`
Después de crear una nueva conexión exitosamente:
1. Obtiene el `id_conexion` de la respuesta del backend
2. Obtiene el nombre del servicio seleccionado
3. Llama a `registrarEventoAsignacion()` para registrar el evento
4. Incluye logs de diagnóstico para seguimiento

## Próximos Pasos

### Backend - Endpoint Requerido: `/api/log-cortes/registrar`
El backend debe implementar este endpoint para recibir y guardar los eventos:

**Método:** POST
**Body esperado:**
```json
{
    "id_conexion": 2753,
    "tipo_evento": "Asignación de servicio",
    "mensaje": "Servicio asignado: Plan 10MB - $500.00 Mensual",
    "id_usuario": 123,
    "nota": "Nueva conexión creada con el servicio Plan 10MB"
}
```

**Implementación sugerida:**
```javascript
app.post('/api/log-cortes/registrar', async (req, res) => {
    const { id_conexion, tipo_evento, mensaje, id_usuario, nota } = req.body;

    try {
        // Obtener información del usuario
        const [usuario] = await conexion.query(
            'SELECT nombre, direccion_ipv4 FROM usuarios WHERE id_usuario = ?',
            [id_usuario]
        );

        // Insertar el evento
        await conexion.query(
            `INSERT INTO log_cortes
            (id_conexion, tipo_evento, mensaje, fecha, id_usuario, nombre_usuario, direccion_ipv4, nota)
            VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
            [
                id_conexion,
                tipo_evento,
                mensaje,
                id_usuario,
                usuario[0]?.nombre || 'Desconocido',
                usuario[0]?.direccion_ipv4 || req.ip,
                nota
            ]
        );

        res.status(201).json({ success: true, message: 'Evento registrado exitosamente' });
    } catch (error) {
        console.error('Error al registrar evento:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
```

### Verificación del endpoint `/api/conexiones/agregar`
Asegurarse de que este endpoint devuelve el `id_conexion` de la nueva conexión creada:

**Respuesta esperada:**
```json
{
    "success": true,
    "id_conexion": 2753,
    "message": "Conexión creada exitosamente"
}
```
O alternativamente:
```json
{
    "success": true,
    "insertId": 2753
}
```

## Pruebas
1. Ejecutar la app y asignar un nuevo servicio a un cliente
2. Revisar los console logs para verificar:
   - ✅ Conexión creada exitosamente
   - 📝 Registrando evento de asignación
   - ✅ Evento registrado exitosamente
3. Navegar al "Historial de Acciones" de la nueva conexión
4. Verificar que aparece el evento "Asignación de servicio"
