# DIAGNÓSTICO: Sistema de Eventos de Factura

## Problema Reportado
No se ven eventos registrados después de agregar un artículo a la factura #64555

## Pasos de Diagnóstico

### 1. Verificar que el endpoint del backend existe

El problema más común es que **el backend aún no tiene implementados los endpoints**.

**Verificación rápida**:
```bash
# Prueba manual del endpoint
curl -X POST https://wellnet-rd.com:444/api/factura/registrar-evento \
  -H "Content-Type: application/json" \
  -d '{
    "id_factura": 64555,
    "id_usuario": 1,
    "tipo_evento": "Test",
    "descripcion": "Prueba",
    "fecha": "2025-01-13",
    "hora": "12:00:00",
    "fecha_hora": "2025-01-13 12:00:00"
  }'
```

**Respuestas posibles**:

✅ **Si el endpoint existe**:
```json
{
  "success": true,
  "message": "Evento registrado exitosamente",
  "id_evento": 123
}
```

❌ **Si el endpoint NO existe**:
```json
{
  "error": "Not Found"
}
```
o
```
Cannot POST /api/factura/registrar-evento
```

**SOLUCIÓN**: Si el endpoint no existe, usa el archivo `PROMPT_BACKEND_EVENTOS_FACTURA.md` para implementarlo.

---

### 2. Verificar los logs de la aplicación

Con los logs mejorados, ahora puedes ver exactamente qué está pasando:

**En Android**:
```bash
npx react-native log-android | grep "RegistrarEventoFactura"
```

**En iOS**:
```bash
npx react-native log-ios | grep "RegistrarEventoFactura"
```

**Logs esperados cuando agregas un artículo**:

```
📝 [RegistrarEventoFactura] Registrando evento: {
  id_factura: 64555,
  tipo_evento: "Artículo agregado",
  usuario: 5,
  fecha: "2025-01-13",
  hora: "16:45:30",
  fecha_hora: "2025-01-13 16:45:30"
}

📤 [RegistrarEventoFactura] Datos completos del evento: {
  "id_factura": 64555,
  "id_usuario": 5,
  "tipo_evento": "Artículo agregado",
  "descripcion": "Artículo 'Internet 10MB' agregado...",
  "detalles": "{...}",
  "fecha": "2025-01-13",
  "hora": "16:45:30",
  "fecha_hora": "2025-01-13 16:45:30"
}

📥 [RegistrarEventoFactura] Response status: 200

📥 [RegistrarEventoFactura] Response data: {
  "success": true,
  "message": "Evento registrado exitosamente",
  "id_evento": 456
}

✅ [RegistrarEventoFactura] Evento registrado exitosamente: Artículo agregado - ID: 456
```

**Si ves esto, el evento se registró correctamente.**

**Logs de error comunes**:

❌ **Error 404** (Endpoint no existe):
```
📥 [RegistrarEventoFactura] Response status: 404
❌ [RegistrarEventoFactura] Error del servidor: { error: "Not Found" }
```

❌ **Error 500** (Error en el backend):
```
📥 [RegistrarEventoFactura] Response status: 500
❌ [RegistrarEventoFactura] Error del servidor: { message: "Error en la base de datos" }
```

❌ **Error de red**:
```
❌ [RegistrarEventoFactura] Error al registrar evento: TypeError: Network request failed
```

---

### 3. Verificar que la función se está llamando

**Ubicación**: `AgregarArticuloPantalla.tsx` línea ~230-247

Busca en los logs:
```
📝 [RegistrarEventoFactura] Registrando evento
```

**Si NO ves este log**, significa que:
- La función `registrarEventoFactura` no se está llamando
- Hay un error antes de llegar a esa línea
- El `idUsuario` está vacío (por eso no entra al `if (idUsuario)`)

**Verificar que idUsuario existe**:
Agrega temporalmente en `AgregarArticuloPantalla.tsx` después de guardar el artículo:
```javascript
console.log('🔍 [AgregarArticulo] idUsuario:', idUsuario);
```

Si es `null` o `undefined`, el problema es que no se está cargando el usuario correctamente desde AsyncStorage.

---

### 4. Verificar que EventosFacturaScreen carga eventos

**Pasos**:
1. Abre la factura #64555
2. Presiona el botón de historial (icono de reloj)
3. Revisa los logs:

**Logs esperados**:
```
🔍 [EventosFacturaScreen] Solicitando eventos para factura: 64555
📥 [EventosFacturaScreen] Eventos recibidos: 5 eventos
✅ [EventosFacturaScreen] Eventos ordenados y establecidos: 5
```

**Si ves**:
```
📥 [EventosFacturaScreen] Eventos recibidos: 0 eventos
```

Significa que:
- El endpoint funciona PERO no hay eventos en la base de datos
- Los eventos no se están guardando
- O el backend no está retornando los eventos correctamente

---

### 5. Verificar manualmente en la base de datos

Si tienes acceso a la base de datos MySQL, ejecuta:

```sql
-- Ver si la tabla existe
SHOW TABLES LIKE 'eventos_factura';

-- Ver si hay eventos para la factura 64555
SELECT * FROM eventos_factura WHERE id_factura = 64555 ORDER BY fecha_hora DESC;

-- Ver todos los eventos (para debug)
SELECT
  id_evento,
  id_factura,
  tipo_evento,
  descripcion,
  fecha,
  hora,
  fecha_hora
FROM eventos_factura
ORDER BY fecha_hora DESC
LIMIT 20;
```

**Resultados posibles**:

✅ **Hay eventos**:
```
id_evento | id_factura | tipo_evento        | fecha      | hora
----------|------------|--------------------|------------|----------
456       | 64555      | Artículo agregado  | 2025-01-13 | 16:45:30
```
→ El backend funciona, problema en el frontend al mostrarlos

❌ **No hay eventos**:
```
Empty set (0.00 sec)
```
→ El backend no está guardando los eventos

❌ **La tabla no existe**:
```
ERROR 1146: Table 'eventos_factura' doesn't exist
```
→ Necesitas crear la tabla (ver paso 6)

---

### 6. Crear la tabla de eventos (si no existe)

Si la tabla no existe, ejecuta este SQL:

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

  -- Índices
  INDEX idx_factura (id_factura),
  INDEX idx_usuario (id_usuario),
  INDEX idx_fecha_hora (fecha_hora),
  INDEX idx_tipo_evento (tipo_evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Checklist de Diagnóstico

Revisa esto en orden:

- [ ] **Paso 1**: ¿El endpoint `/api/factura/registrar-evento` existe?
  - Si NO → Implementa el backend usando `PROMPT_BACKEND_EVENTOS_FACTURA.md`

- [ ] **Paso 2**: ¿Ves los logs `📝 [RegistrarEventoFactura]` cuando agregas un artículo?
  - Si NO → Verifica que `idUsuario` no sea null

- [ ] **Paso 3**: ¿El response status es 200?
  - Si NO → Revisa el error en los logs del backend

- [ ] **Paso 4**: ¿La tabla `eventos_factura` existe?
  - Si NO → Crea la tabla (ver paso 6)

- [ ] **Paso 5**: ¿Hay eventos en la base de datos para esa factura?
  - Si NO → El problema está en el backend (no guarda)

- [ ] **Paso 6**: ¿EventosFacturaScreen muestra los eventos?
  - Si NO → Problema en el endpoint de obtener eventos

---

## Soluciones Rápidas

### Problema: "No veo logs de RegistrarEventoFactura"

**Causa**: El `idUsuario` es null o la función no se está llamando.

**Solución**:
1. Verifica que el usuario esté logueado
2. Revisa AsyncStorage para `@loginData`
3. Agrega log temporal en AgregarArticuloPantalla:
   ```javascript
   console.log('🔍 ID Usuario:', idUsuario);
   ```

---

### Problema: "Response status: 404"

**Causa**: El endpoint del backend no existe.

**Solución**:
1. Implementa el backend usando el prompt
2. O verifica que la URL sea correcta: `https://wellnet-rd.com:444/api/factura/registrar-evento`

---

### Problema: "Response status: 500"

**Causa**: Error en el backend (probablemente SQL).

**Solución**:
1. Revisa los logs del backend
2. Verifica que la tabla exista
3. Verifica que las foreign keys sean correctas

---

### Problema: "Eventos guardados pero no se muestran"

**Causa**: Problema en el endpoint de obtener eventos.

**Solución**:
1. Verifica que el endpoint `/api/factura/obtener-eventos` exista
2. Revisa los logs de EventosFacturaScreen
3. Verifica que el JOIN con usuarios funcione

---

## Comando de Debug Rápido

Ejecuta esto mientras agregas un artículo:

```bash
# Terminal 1: Ver logs en tiempo real
npx react-native log-android | grep -E "RegistrarEventoFactura|AgregarArticulo|EventosFactura"

# Terminal 2: Probar el endpoint manualmente
curl -X POST https://wellnet-rd.com:444/api/factura/obtener-eventos \
  -H "Content-Type: application/json" \
  -d '{"id_factura": 64555}'
```

---

## Siguiente Paso Recomendado

Basándome en tu reporte, lo más probable es que:

1. ❌ **El backend NO tiene los endpoints implementados** (90% probable)
2. ❌ La tabla `eventos_factura` no existe (80% probable)
3. ✅ El frontend está correcto y esperando la implementación del backend

**Acción recomendada**:
1. Verifica los logs con: `npx react-native log-android | grep "RegistrarEventoFactura"`
2. Si ves logs de error 404, implementa el backend usando `PROMPT_BACKEND_EVENTOS_FACTURA.md`
3. Si no ves ningún log, verifica que `idUsuario` tenga valor

---

## Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas, comparte:
1. Los logs completos de cuando agregas el artículo
2. El response que ves en los logs
3. Si la tabla `eventos_factura` existe en tu BD

¡Y te ayudaré a resolverlo! 🚀
