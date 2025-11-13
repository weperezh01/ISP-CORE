# PROMPT: Implementar Sistema de Eventos de Factura - Backend API

## Contexto del Proyecto

Estoy trabajando en **ISP-CORE**, una aplicación de gestión para ISPs (Proveedores de Servicios de Internet) desarrollada en React Native. El frontend ya tiene implementado un sistema completo de registro y visualización de eventos para facturas que permite auditar todas las acciones que los usuarios realizan sobre facturas.

**Necesito que implementes los endpoints del backend** para soportar este sistema de eventos.

## Stack Tecnológico del Backend

- Node.js con Express
- Base de datos: MySQL/MariaDB
- API REST
- Base URL: `https://wellnet-rd.com:444/api/`
- Autenticación: Token-based (headers: Authorization: Bearer token)

## 1. Crear Tabla de Base de Datos

Primero necesito que crees la tabla `eventos_factura` en MySQL:

```sql
CREATE TABLE eventos_factura (
  id_evento INT AUTO_INCREMENT PRIMARY KEY,
  id_factura INT NOT NULL,
  id_usuario INT NOT NULL,
  tipo_evento VARCHAR(100) NOT NULL,
  descripcion TEXT,
  detalles TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  fecha_hora DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  FOREIGN KEY (id_factura) REFERENCES facturas(id_factura) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,

  -- Índices para mejorar rendimiento
  INDEX idx_factura (id_factura),
  INDEX idx_usuario (id_usuario),
  INDEX idx_fecha_hora (fecha_hora),
  INDEX idx_tipo_evento (tipo_evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notas sobre la tabla**:
- `detalles`: Campo TEXT para almacenar JSON con información adicional
- `fecha` y `hora`: Separados para facilitar consultas
- `fecha_hora`: DATETIME para ordenamiento preciso
- Los índices optimizan las consultas frecuentes
- **IMPORTANTE**: Las fechas vienen en hora de República Dominicana (UTC-4), no en UTC

## 2. Endpoint: Registrar Evento de Factura

### Especificaciones

**URL**: `POST /api/factura/registrar-evento`

**Autenticación**: Requerida (token de usuario)

**Request Body**:
```json
{
  "id_factura": 123,
  "id_usuario": 5,
  "tipo_evento": "Artículo agregado",
  "descripcion": "Artículo 'Internet 10MB' agregado: 1 x RD$ 1,000.00 = RD$ 1,180.00",
  "detalles": "{\"id_producto_servicio\":5,\"descripcion\":\"Internet 10MB\",\"cantidad\":1}",
  "fecha": "2025-01-13",
  "hora": "16:39:25",
  "fecha_hora": "2025-01-13 16:39:25"
}
```

**⚠️ IMPORTANTE - Zona Horaria**:
- El frontend envía las fechas y horas **YA CONVERTIDAS** a hora de República Dominicana (America/Santo_Domingo - UTC-4)
- NO necesitas hacer ninguna conversión de zona horaria en el backend
- Simplemente guarda los valores tal como vienen
- El campo `fecha_hora` viene en formato MySQL DATETIME: `YYYY-MM-DD HH:MM:SS`

**Validaciones Requeridas**:
- `id_factura`: requerido, debe existir en tabla facturas
- `id_usuario`: requerido, debe existir en tabla usuarios
- `tipo_evento`: requerido, max 100 caracteres
- `descripcion`: opcional, puede ser texto largo
- `detalles`: opcional, validar que sea JSON válido si se proporciona
- `fecha`: requerido, formato YYYY-MM-DD
- `hora`: requerido, formato HH:MM:SS
- `fecha_hora`: requerido, formato YYYY-MM-DD HH:MM:SS

**Response Exitoso** (Status 200):
```json
{
  "success": true,
  "message": "Evento registrado exitosamente",
  "id_evento": 456
}
```

**Response de Error** (Status 400/500):
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos del error (opcional)"
}
```

**Casos de Error a Manejar**:
- Factura no existe → Status 404
- Usuario no existe → Status 404
- Campos requeridos faltantes → Status 400
- JSON inválido en detalles → Status 400
- Error de base de datos → Status 500

### Implementación Sugerida

```javascript
router.post('/factura/registrar-evento', async (req, res) => {
  try {
    const {
      id_factura,
      id_usuario,
      tipo_evento,
      descripcion,
      detalles,
      fecha,
      hora,
      fecha_hora
    } = req.body;

    // Validaciones
    if (!id_factura || !id_usuario || !tipo_evento || !fecha || !hora || !fecha_hora) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos faltantes'
      });
    }

    // Validar que la factura existe
    const facturaExists = await db.query(
      'SELECT id_factura FROM facturas WHERE id_factura = ?',
      [id_factura]
    );

    if (facturaExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Validar que el usuario existe
    const usuarioExists = await db.query(
      'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );

    if (usuarioExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validar JSON en detalles si se proporciona
    if (detalles) {
      try {
        JSON.parse(detalles);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'El campo detalles debe ser JSON válido'
        });
      }
    }

    // Insertar evento
    // IMPORTANTE: Las fechas ya vienen en hora de República Dominicana, solo guardarlas
    const result = await db.query(
      `INSERT INTO eventos_factura
       (id_factura, id_usuario, tipo_evento, descripcion, detalles, fecha, hora, fecha_hora)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_factura, id_usuario, tipo_evento, descripcion || null, detalles || null, fecha, hora, fecha_hora]
    );

    res.status(200).json({
      success: true,
      message: 'Evento registrado exitosamente',
      id_evento: result.insertId
    });

  } catch (error) {
    console.error('Error al registrar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el evento',
      error: error.message
    });
  }
});
```

## 3. Endpoint: Obtener Eventos de Factura

### Especificaciones

**URL**: `POST /api/factura/obtener-eventos`

**Autenticación**: Requerida (token de usuario)

**Request Body**:
```json
{
  "id_factura": 123
}
```

**Validaciones Requeridas**:
- `id_factura`: requerido, debe existir en tabla facturas

**Response Exitoso** (Status 200):
```json
[
  {
    "id_evento": 456,
    "id_factura": 123,
    "id_usuario": 5,
    "tipo_evento": "Artículo agregado",
    "descripcion": "Artículo 'Internet 10MB' agregado: 1 x RD$ 1,000.00 = RD$ 1,180.00",
    "detalles": "{\"id_producto_servicio\":5,\"descripcion\":\"Internet 10MB\",\"cantidad\":1}",
    "fecha": "2025-01-13",
    "hora": "16:39:25",
    "fecha_hora": "2025-01-13T16:39:25.000Z",
    "created_at": "2025-01-13T16:39:25.000Z",
    "nombre_usuario": "Juan",
    "apellido_usuario": "Pérez"
  },
  {
    "id_evento": 455,
    "id_factura": 123,
    "id_usuario": 3,
    "tipo_evento": "Artículos editados",
    "descripcion": "Se editaron 2 artículo(s) en la factura #123",
    "detalles": "{\"articulos_modificados\":2}",
    "fecha": "2025-01-13",
    "hora": "10:15:00",
    "fecha_hora": "2025-01-13T10:15:00.000Z",
    "created_at": "2025-01-13T10:15:00.000Z",
    "nombre_usuario": "María",
    "apellido_usuario": "González"
  }
]
```

**Response Vacío** (Status 200):
```json
[]
```

**Response de Error** (Status 400/404/500):
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

### Implementación Sugerida

```javascript
router.post('/factura/obtener-eventos', async (req, res) => {
  try {
    const { id_factura } = req.body;

    // Validaciones
    if (!id_factura) {
      return res.status(400).json({
        success: false,
        message: 'id_factura es requerido'
      });
    }

    // Validar que la factura existe
    const facturaExists = await db.query(
      'SELECT id_factura FROM facturas WHERE id_factura = ?',
      [id_factura]
    );

    if (facturaExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Obtener eventos con información del usuario
    // NOTA: Las fechas están en hora de República Dominicana, no necesitan conversión
    const eventos = await db.query(
      `SELECT
        e.id_evento,
        e.id_factura,
        e.id_usuario,
        e.tipo_evento,
        e.descripcion,
        e.detalles,
        e.fecha,
        e.hora,
        e.fecha_hora,
        e.created_at,
        u.nombres as nombre_usuario,
        u.apellidos as apellido_usuario
      FROM eventos_factura e
      LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
      WHERE e.id_factura = ?
      ORDER BY e.fecha_hora DESC`,
      [id_factura]
    );

    // Si no hay eventos, retornar array vacío (no un error)
    res.status(200).json(eventos);

  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los eventos',
      error: error.message
    });
  }
});
```

## 4. Tipos de Eventos a Registrar

El frontend registra los siguientes tipos de eventos:

| Tipo de Evento | Descripción |
|----------------|-------------|
| `Artículo agregado` | Cuando se agrega un artículo a la factura |
| `Artículos editados` | Cuando se modifican artículos existentes (con detección de cambios) |
| `Factura impresa` | Cuando se imprime la factura |
| `Factura compartida - WhatsApp` | Cuando se comparte por WhatsApp |
| `Factura compartida - Email` | Cuando se comparte por Email |
| `Factura compartida - PDF` | Cuando se genera y comparte PDF |
| `Factura compartida - Texto` | Cuando se comparte como texto |
| `Nota agregada` | Cuando se agrega una nota |
| `Revisión registrada` | Cuando se marca en revisión |

**NOTA**: El evento "Factura visualizada" fue eliminado porque generaba demasiados registros sin valor real de auditoría.

## 5. Consideraciones Importantes sobre Zona Horaria

### ⚠️ MUY IMPORTANTE

El frontend ya maneja la conversión de zona horaria y envía las fechas en hora de República Dominicana (America/Santo_Domingo - UTC-4).

**Lo que debes hacer en el backend**:
1. ✅ Guardar las fechas tal como vienen (ya están en hora correcta)
2. ✅ NO aplicar ninguna conversión de zona horaria
3. ✅ NO usar funciones como NOW() o CURRENT_TIMESTAMP que usan UTC del servidor
4. ✅ Simplemente insertar los valores de `fecha`, `hora` y `fecha_hora` tal cual

**Lo que NO debes hacer**:
1. ❌ NO convertir a UTC
2. ❌ NO usar la zona horaria del servidor
3. ❌ NO aplicar offset de zona horaria
4. ❌ NO usar funciones de fecha del servidor MySQL

**Ejemplo correcto**:
```javascript
// El frontend envía:
{
  "fecha": "2025-01-13",
  "hora": "16:39:25",
  "fecha_hora": "2025-01-13 16:39:25"
}

// Tú guardas exactamente eso en la BD:
INSERT INTO eventos_factura (fecha, hora, fecha_hora)
VALUES ('2025-01-13', '16:39:25', '2025-01-13 16:39:25');

// ✅ Correcto - Guardado tal cual
// ❌ Incorrecto - Aplicar CONVERT_TZ o cualquier conversión
```

## 6. Rendimiento y Optimización

### Rendimiento
- Los eventos se insertan de forma asíncrona (no bloquean operaciones principales)
- Usar índices en la tabla para optimizar consultas
- Considerar paginación si una factura tiene muchos eventos (implementar en el futuro)

### Seguridad
- Validar que el usuario tenga permiso para ver eventos de la factura
- No exponer información sensible en los eventos
- Sanitizar inputs para prevenir SQL injection
- Validar formato de fechas para prevenir errores

### Logging
- Registrar errores en logs del servidor
- No exponer stack traces al cliente
- Loguear eventos sospechosos (muchos eventos en poco tiempo del mismo usuario)

### Mantenimiento
- Considerar archivado de eventos antiguos (> 1 año) en el futuro
- Implementar soft delete en lugar de hard delete
- Mantener integridad referencial con CASCADE

## 7. Testing Sugerido

Por favor, prueba los siguientes casos:

### Para `/api/factura/registrar-evento`:
1. ✅ Registro exitoso con todos los campos
2. ✅ Registro exitoso sin detalles (opcional)
3. ✅ Verificar que la hora guardada coincide con la hora enviada (NO debe haber diferencia de 4 horas)
4. ❌ Error con id_factura inexistente
5. ❌ Error con id_usuario inexistente
6. ❌ Error con campos requeridos faltantes
7. ❌ Error con JSON inválido en detalles
8. ❌ Error con formato de fecha inválido

### Para `/api/factura/obtener-eventos`:
1. ✅ Obtener eventos de factura con eventos
2. ✅ Verificar que las horas mostradas son correctas (hora de República Dominicana)
3. ✅ Obtener eventos de factura sin eventos (retorna [])
4. ❌ Error con id_factura inexistente
5. ❌ Error sin id_factura en request

## 8. Ejemplo de Flujo Completo

```javascript
// 1. Usuario agrega un artículo a las 4:39 PM (hora local de RD)
// El frontend registra el evento con la hora correcta

// 2. Frontend envía POST a /api/factura/registrar-evento
{
  "id_factura": 123,
  "id_usuario": 5,
  "tipo_evento": "Artículo agregado",
  "descripcion": "Artículo 'Internet 10MB' agregado: 1 x RD$ 1,000.00 = RD$ 1,180.00",
  "detalles": "{\"id_producto_servicio\":5,\"cantidad\":1,\"precio_unitario\":1000}",
  "fecha": "2025-01-13",
  "hora": "16:39:25",  // ← 4:39 PM en formato 24h
  "fecha_hora": "2025-01-13 16:39:25"  // ← hora correcta de RD
}

// 3. Backend guarda EXACTAMENTE esos valores (sin conversión)
INSERT INTO eventos_factura VALUES (..., '16:39:25', ...);

// 4. Usuario ve el historial
POST /api/factura/obtener-eventos { "id_factura": 123 }

// 5. Backend retorna eventos con hora correcta
[
  {
    "hora": "16:39:25",  // ← Muestra 4:39 PM correctamente
    "fecha_hora": "2025-01-13T16:39:25.000Z",
    // ... resto de datos
  }
]

// ✅ Usuario ve: "4:39 PM" - CORRECTO
// ❌ NO debe ver: "8:39 PM" - sería INCORRECTO
```

## 9. Formato de Respuesta Consistente

Por favor, asegúrate de que todas las respuestas sigan este formato:

**Éxito**:
```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { /* datos */ }  // o array, según endpoint
}
```

**Error**:
```json
{
  "success": false,
  "message": "Mensaje de error user-friendly",
  "error": "Detalles técnicos (opcional, solo en desarrollo)"
}
```

## 10. Preguntas para Aclarar

Si necesitas más información sobre:
- Estructura de tablas `facturas` o `usuarios`
- Sistema de autenticación actual
- Configuración de la base de datos
- Ejemplos adicionales de eventos
- Manejo de zona horaria

Por favor pregúntame y te proporcionaré los detalles.

## 11. Entregables Esperados

1. ✅ Script SQL para crear la tabla `eventos_factura`
2. ✅ Endpoint `POST /api/factura/registrar-evento` implementado
3. ✅ Endpoint `POST /api/factura/obtener-eventos` implementado
4. ✅ Validaciones y manejo de errores implementados
5. ✅ Pruebas de zona horaria (verificar que no hay diferencia de 4 horas)
6. ✅ Pruebas básicas de todos los casos
7. ✅ Documentación de los endpoints (si es posible)

## 12. Checklist de Verificación Final

Antes de dar por completado, verifica:

- [ ] La tabla `eventos_factura` está creada con todos los índices
- [ ] El endpoint de registro guarda las fechas SIN conversión de zona horaria
- [ ] El endpoint de obtención retorna las fechas tal como están guardadas
- [ ] Un evento creado a las 4:39 PM se muestra como 4:39 PM (no como 8:39 PM)
- [ ] Los campos opcionales (descripcion, detalles) funcionan correctamente
- [ ] Las validaciones de factura y usuario funcionan
- [ ] Los errores retornan códigos HTTP apropiados
- [ ] El JOIN con la tabla usuarios funciona correctamente
- [ ] Los eventos se ordenan por `fecha_hora DESC` (más recientes primero)
- [ ] Un array vacío se retorna correctamente cuando no hay eventos

¡Gracias! Una vez implementado, el sistema de eventos de factura estará completamente funcional.
