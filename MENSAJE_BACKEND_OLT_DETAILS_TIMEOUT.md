# Mensaje para Codex Backend: Timeout Persistente en Detalles de OLT

**Fecha:** 2025-11-20 00:00 AST (aprox)

## Resumen
- La pantalla `OLTDetailsScreen` sigue sin recibir datos del endpoint `GET /api/olts/realtime/detalles/:oltId`.
- Aunque las estadísticas (`/api/olts/realtime/:oltId/onus/estadisticas`) responden a veces, ahora también están empezando a caer en timeout de 30s en algunas ejecuciones.
- El frontend dispara ambas peticiones en paralelo con `force=true`, tiene token válido y mantuvimos los timeouts elevados (60s para detalles, 30s para stats). Aun así, el backend nunca retorna respuesta exitosa para los detalles y ocasionalmente tampoco para las estadísticas.

## Evidencia de Logs
```
🔵 [OLT Details] URL completa: https://wellnet-rd.com:444/api/olts/realtime/detalles/1?force=true
🔵 [OLT Details] Headers: { Authorization: "Bearer eyJh...", Content-Type: "application/json" }
🔵 [OLT Details] Enviando petición al backend...
⏱️ [Fetch Timeout] Configurando timeout de 60000ms
... (sin respuesta del servidor)
⏱️ [Fetch Timeout] ¡TIMEOUT! La petición excedió 60000ms
🔴 [OLT Details] Error: La petición tardó más de 60 segundos. El servidor no respondió a tiempo.
```
```
🟡 [OLT Stats] URL completa: https://wellnet-rd.com:444/api/olts/realtime/1/onus/estadisticas?force=true
🟡 [OLT Stats] Status Code: 200 (cuando logra responder)
...
⏱️ [Fetch Timeout] ¡TIMEOUT! La petición excedió 30000ms (otras veces)
🔴 [OLT Stats] Error: La petición tardó más de 30 segundos. El servidor no respondió a tiempo.
```
- Los logs completos (ver captura arriba) muestran que primero no hay token y el hook vuelve a intentar; en el segundo intento el token ya está presente y la petición sale correctamente, pero el backend igual nunca devuelve payload.
- La lista de OLTs (`GET /api/olts/isp/:id`) responde perfecto en ~7 ms, así que la red y el token están OK.

## Impacto
- El usuario solo ve loaders y errores, por lo que la pantalla de Detalles de OLT es inutilizable.
- El timeout de 60 s bloquea la navegación cada vez que se intenta consultar una OLT.
- Ahora hasta las estadísticas se ven afectadas de forma intermitente.

## Requerimientos de Corrección
1. **Endpoint `/api/olts/realtime/detalles/:oltId`**
   - Debe responder en <60 s. Ideal 10 s (usando caché) como se pide en `REQUERIMIENTO_BACKEND_OLT_DETAILS.md`.
   - En caso de falla, devolver siempre HTTP 4xx/5xx con cuerpo JSON (no dejar la conexión abierta hasta que el frontend aborte).
   - Registrar en logs del backend: oltId, force flag, usuario, origen de datos (cache vs realtime) y error capturado.
2. **Endpoint `/api/olts/realtime/:oltId/onus/estadisticas`**
   - Está funcionando a ratos pero debe evitar timeouts. Confirmar que `force=true` invalida la caché y que hay respuesta consistente (<30 s).
3. **Soporte de Caché y Force Refresh**
   - Implementar la lógica descrita en el documento `REQUERIMIENTO_BACKEND_OLT_DETAILS.md`: redis/mem cache, invalidación si `force=true`, campos `cached`/`cached_at` en la respuesta.
4. **Time-out en consultas a hardware**
   - Si la OLT tarda demasiado, retornar HTTP 503 con un mensaje tipo "La OLT no responde (timeout)" en lugar de dejar colgada la petición.
5. **Pruebas**
   - Ejecutar `curl` o Postman contra ambos endpoints con `force=true` y con el token real para verificar que se obtiene respuesta en menos del timeout configurado.

## Próximos Pasos Esperados del Backend
- Revisar logs del servidor alrededor de las 23:50 UTC-4 del 19/11 para ver las solicitudes que quedaron pendientes.
- Confirmar si el controlador realmente está entrando y si hay promesas que nunca se resuelven (e.g., await bloqueado contra Telnet/SSH).
- Implementar las mejoras y avisar al frontend cuando los endpoints estén desplegados para volver a probar.

Gracias,
Equipo Frontend ISP-CORE

## Nuevos Intentos (2025-11-20 ~00:10 AST)
- Reintentamos navegar varias veces; el hook primero no tiene token, pero enseguida lo obtiene y vuelve a disparar las dos peticiones con `force=true`.
- Resultado: **ambos endpoints** (`detalles` y `estadísticas`) quedan en timeout en la misma sesión. Las estadísticas a veces logran responder (status 200), pero en el último intento también superaron los 30 s y se abortaron.
- Logs relevantes del último intento:
```
🔵 [OLT Details] URL completa: https://wellnet-rd.com:444/api/olts/realtime/detalles/1?force=true
⏱️ Timeout configurado: 60000ms ...
⏱️ [Fetch Timeout] ¡TIMEOUT! La petición excedió 60000ms
🔴 Error: La petición tardó más de 60 segundos. El servidor no respondió a tiempo.
```
```
🟡 [OLT Stats] URL completa: https://wellnet-rd.com:444/api/olts/realtime/1/onus/estadisticas?force=true
⏱️ Timeout configurado: 30000ms ...
⏱️ [Fetch Timeout] ¡TIMEOUT! La petición excedió 30000ms
🔴 Error: La petición tardó más de 30 segundos. El servidor no respondió a tiempo.
```
- Los tokens están correctos (Bearer se ve en los headers) y la lista de OLTs sigue respondiendo rápido, por lo que descartamos problemas de autenticación o red.

**Seguimos bloqueados** hasta que el backend implemente las correcciones descritas anteriormente.
