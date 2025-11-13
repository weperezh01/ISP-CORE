# PASOS DE DIAGNÓSTICO RÁPIDO - Eventos de Factura

## ¿Qué he hecho?

He agregado **logs de debug detallados** en varios puntos clave para ayudarte a diagnosticar por qué no se ven los eventos:

### Archivos modificados:

1. **`AgregarArticuloPantalla.tsx`** - Agregué 3 logs importantes:
   - 🔍 Log cuando se carga el ID de usuario desde AsyncStorage
   - ⚠️ Advertencia si no se encuentra el ID de usuario
   - ✅ Log antes de llamar a `registrarEventoFactura`
   - ⚠️ Advertencia si idUsuario es null

2. **`RegistrarEventoFactura.tsx`** (ya tenía logs extensos):
   - 📝 Log al iniciar el registro del evento
   - 📤 Log con los datos completos que se envían
   - 📥 Log del status HTTP de la respuesta
   - 📥 Log de los datos recibidos del backend
   - ✅ Log de éxito o ❌ log de error

### Archivo nuevo creado:

3. **`test_endpoints_eventos.sh`** - Script bash para probar los endpoints del backend

---

## PASO 1: Probar los endpoints del backend

Este es el paso más importante. **Ejecuta esto primero**:

```bash
./test_endpoints_eventos.sh
```

O si no funciona:

```bash
bash test_endpoints_eventos.sh
```

### ¿Qué hace este script?

- Prueba el endpoint `POST /api/factura/registrar-evento`
- Prueba el endpoint `POST /api/factura/obtener-eventos`
- Te muestra con colores si existen o no
- Te da recomendaciones específicas según el resultado

### Resultados posibles:

#### ✅ **Status 200/201** - Todo bien
```
✅ Endpoint de registrar evento EXISTE y funciona
```
→ Continúa al PASO 2

#### ❌ **Status 404** - Endpoint no existe
```
❌ Endpoint NO EXISTE (404)
⚠️  Necesitas implementar el backend usando PROMPT_BACKEND_EVENTOS_FACTURA.md
```
→ **SOLUCIÓN**: Implementa el backend usando el archivo `PROMPT_BACKEND_EVENTOS_FACTURA.md`

#### ❌ **Status 500** - Error en el backend
```
❌ Endpoint existe pero tiene ERROR (500)
⚠️  Revisa los logs del backend o verifica que la tabla eventos_factura exista
```
→ **SOLUCIÓN**:
1. Revisa los logs del servidor backend
2. Verifica que la tabla `eventos_factura` exista en MySQL
3. Si no existe, créala con el SQL del archivo `PROMPT_BACKEND_EVENTOS_FACTURA.md`

---

## PASO 2: Verificar los logs de la app (solo si PASO 1 pasó)

Si los endpoints existen y funcionan, ejecuta la app y monitorea los logs:

```bash
npx react-native log-android | grep -E "RegistrarEventoFactura|AgregarArticulo"
```

O si estás en iOS:

```bash
npx react-native log-ios | grep -E "RegistrarEventoFactura|AgregarArticulo"
```

### Luego, en la app:

1. Abre una factura (por ejemplo, la #64555)
2. Agrega un artículo
3. Observa los logs en la terminal

### Logs que deberías ver (en orden):

```
🔍 [AgregarArticulo] ID Usuario cargado: 5
🔍 [AgregarArticulo] Artículo agregado exitosamente. idUsuario: 5
✅ [AgregarArticulo] Llamando a registrarEventoFactura...
📝 [RegistrarEventoFactura] Registrando evento: {...}
📤 [RegistrarEventoFactura] Datos completos del evento: {...}
📥 [RegistrarEventoFactura] Response status: 200
📥 [RegistrarEventoFactura] Response data: {"success": true, ...}
✅ [RegistrarEventoFactura] Evento registrado exitosamente: Artículo agregado - ID: 123
```

### ¿Qué significa cada escenario?

#### ❌ Escenario 1: No ves NINGÚN log
```
(nada aparece en la terminal)
```
**Problema**: La pantalla AgregarArticulo no se está cargando o hay un error antes.
**Solución**:
- Verifica que estés en la pantalla correcta
- Revisa si hay errores en los logs generales: `npx react-native log-android`

#### ⚠️ Escenario 2: Ves la advertencia de ID Usuario null
```
⚠️ [AgregarArticulo] No se encontró ID de usuario en AsyncStorage
```
**Problema**: El usuario no está logueado correctamente o AsyncStorage está vacío.
**Solución**:
- Cierra la app completamente
- Vuelve a iniciar sesión
- Intenta de nuevo

#### ⚠️ Escenario 3: Ves que idUsuario es null al agregar artículo
```
🔍 [AgregarArticulo] Artículo agregado exitosamente. idUsuario: null
⚠️ [AgregarArticulo] No se puede registrar evento: idUsuario es null
```
**Problema**: El ID de usuario no se cargó correctamente desde AsyncStorage.
**Solución**:
- Verifica que el login funcione correctamente
- Revisa que se guarde el usuario en AsyncStorage con la clave `@loginData`

#### ❌ Escenario 4: Ves error 404 en los logs
```
📥 [RegistrarEventoFactura] Response status: 404
❌ [RegistrarEventoFactura] Error del servidor: { error: "Not Found" }
```
**Problema**: El endpoint del backend no existe (aunque el script del PASO 1 debería haberlo detectado).
**Solución**: Implementa el backend usando `PROMPT_BACKEND_EVENTOS_FACTURA.md`

#### ❌ Escenario 5: Ves error 500 en los logs
```
📥 [RegistrarEventoFactura] Response status: 500
❌ [RegistrarEventoFactura] Error del servidor: { message: "Error en la base de datos" }
```
**Problema**: El endpoint existe pero hay un error en el backend.
**Solución**:
1. Revisa los logs del backend
2. Verifica que la tabla `eventos_factura` exista
3. Verifica que los foreign keys sean correctos

---

## PASO 3: Verificar en la base de datos (opcional)

Si los logs muestran éxito (status 200) pero no ves eventos en la app, verifica la base de datos:

```sql
-- Ver si hay eventos para la factura 64555
SELECT * FROM eventos_factura
WHERE id_factura = 64555
ORDER BY fecha_hora DESC;
```

### Resultados posibles:

#### ✅ Hay eventos en la BD
```
id_evento | id_factura | tipo_evento        | descripcion
----------|------------|--------------------|---------------------------
456       | 64555      | Artículo agregado  | Artículo "..." agregado...
```
**Problema**: Los eventos se guardan pero no se muestran en la app.
**Solución**: El problema está en `EventosFacturaScreen.tsx` o en el endpoint de obtener eventos.

#### ❌ No hay eventos en la BD
```
Empty set (0.00 sec)
```
**Problema**: El backend recibe la petición pero no guarda nada.
**Solución**: Revisa la implementación del endpoint en el backend.

---

## RESUMEN - CHECKLIST DE DIAGNÓSTICO

Marca cada paso que completes:

- [ ] **PASO 1**: Ejecuté `./test_endpoints_eventos.sh`
  - [ ] Los endpoints existen (status 200/201) → Continúa al PASO 2
  - [ ] Los endpoints NO existen (status 404) → Implementa el backend
  - [ ] Los endpoints tienen error (status 500) → Revisa backend y BD

- [ ] **PASO 2**: Monitoreé los logs mientras agrego un artículo
  - [ ] Veo el log de ID Usuario cargado → idUsuario existe ✅
  - [ ] Veo el log de "Llamando a registrarEventoFactura" → Se llama la función ✅
  - [ ] Veo el log de "Registrando evento" → La función se ejecuta ✅
  - [ ] Veo "Response status: 200" → El backend responde bien ✅
  - [ ] Veo "Evento registrado exitosamente" → Todo funciona ✅

- [ ] **PASO 3**: Verifiqué la base de datos (opcional)
  - [ ] Hay eventos guardados → El backend funciona ✅
  - [ ] No hay eventos guardados → Problema en el backend ❌

---

## ¿Cuál es el problema más probable?

Basándome en tu reporte de que "no veo ningún evento registrado después de agregar un artículo", los problemas más probables son:

1. **90% probable**: El backend NO tiene los endpoints implementados (404)
2. **8% probable**: La tabla `eventos_factura` no existe en la BD (500)
3. **2% probable**: El `idUsuario` es null (no se cargó desde AsyncStorage)

**Ejecuta el PASO 1 primero** para confirmar cuál es el problema exacto.

---

## Archivos de Referencia

- **DIAGNOSTICO_EVENTOS_FACTURA.md** - Guía completa de diagnóstico (más detallada)
- **PROMPT_BACKEND_EVENTOS_FACTURA.md** - Prompt para implementar el backend
- **SISTEMA_EVENTOS_FACTURA.md** - Documentación completa del sistema de eventos
- **test_endpoints_eventos.sh** - Script para probar los endpoints

---

## ¿Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas, comparte:

1. El output completo del script `test_endpoints_eventos.sh`
2. Los logs que ves cuando agregas un artículo
3. Si la tabla `eventos_factura` existe en tu base de datos

¡Y te ayudaré a resolverlo! 🚀
