# Mensaje para el Codex del Backend: Guardar Datos Completos de Autorización en la OLT

## Contexto
En la pantalla **Detalles de ONU** del frontend (`src/pantallas/controles/OLTs/ONUDetailsScreen.tsx`), cuando el usuario abre el modal “Autorizar ONU - TR-069” se envían **todos** los campos obligatorios al endpoint `POST /api/olts/realtime/:oltId/onus/:serial/authorize`. La ONU queda autorizada físicamente, pero **los metadatos no se guardan en la OLT ni en la BD** (nombre, zona, VLAN, velocidades, ODB, GPS, etc.). Esto deja la ONU sin descripción ni datos administrativos.

## Payload Enviado Actualmente
```json
{
  "sn": "48575443439B989D",
  "onu_external_id": "48575443439B989D",
  "puerto": "0/1/5",
  "board": 1,
  "port": 5,
  "ont_id": 0,
  "onu_type": "HG8245H",
  "onu_mode": "Routing",
  "pon_type": "GPON",
  "gpon_channel": "GPON",
  "user_vlan_id": 100,
  "download_speed": "50M",
  "upload_speed": "50M",
  "download_mbps": 50,
  "upload_mbps": 50,
  "zona": "281",
  "zona_nombre": "ZONA 281",
  "name": "Casa de Juan Pérez",
  "address_comment": "Frente al parque, casa amarilla",
  "odb_splitter": "ODB-123",
  "odb_port": "8",
  "use_gps": true,
  "gps_latitude": 18.4861,
  "gps_longitude": -69.9312
}
```

## Problema
1. La ONU queda autorizada, pero **no se ejecutan los comandos para guardar descripción, VLAN, perfiles de velocidad, ODB y GPS en la OLT**.
2. La tabla `onus` tampoco recibe estos valores (o se guarda parcial/incompleto), por lo que al refrescar no aparece la información capturada.

## Lo que necesitamos que el backend haga
1. **Ejecutar comandos CLI/TR-069 adicionales** después del `ont add`/`onu add` para aplicar:
   - `ont description` o `pon-onu-mng ... description` con `name`/`address_comment`.
   - Configuración de VLAN nativa (`user_vlan_id`) y perfil de velocidades (`download_mbps`/`upload_mbps`).
   - Asociación al splitter (`odb_splitter`/`odb_port`) y zona (`zona`, `zona_nombre`).
   - Guardar coordenadas GPS si `use_gps` es `true`.
2. **Persistir todos los campos** del payload en la tabla `onus` (y tabla relacionada de zonas/odb si aplica), incluyendo `download_mbps`, `upload_mbps`, `zona`, `zona_nombre`, `odb_splitter`, `odb_port`, `name`, `address_comment`, `gps_latitude`, `gps_longitude`.
3. Al completar la autorización, devolver en la respuesta los datos finales (`ont_id` asignado, estado, valores guardados) para que el frontend pueda refrescar.
4. Registrar en logs/monitoreo la secuencia completa y errores intermedios.

## Reproducción rápida
1. Ir a **Controles → OLTs → Detalles de ONU** para una ONU pendiente.
2. Abrir “Autorizar ONU - TR-069”, llenar todos los campos y enviar.
3. Verificar en la OLT que solo aparece el alta básica ✔️ pero no la descripción ni VLANs configuradas ❌.
4. Consultar la tabla `onus` y observar que los campos enviados llegan vacíos o null.

## Criterio de aceptación
- Después de autorizar, los datos aparecen al instante al refrescar la pantalla (provienen de la BD y de la OLT).
- El comando `display ont info`/`show gpon onu detail` muestra la descripción/nombre y VLAN configurada.
- La tabla `onus` refleja exactamente el payload enviado + `ont_id` asignado + timestamp de autorización.

Gracias 🙏. Avísenme si necesitan payloads adicionales, logs o acceso a la OLT para validar los comandos.
