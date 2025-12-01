# ⚙️ Prompt para Claude (Backend) — Migrar Autorización de ONU a SSH Simplificado

## Contexto
- Frontend: el modal **"Autorizar ONU - TR-069"** en `src/pantallas/controles/OLTs/ONUDetailsScreen.tsx` (ver líneas ~1557–1650) dispara `handleAuthorizeOnu`, que a su vez consume `POST /api/olts/realtime/:oltId/onus/:serial/authorize`.
- Hoy la ONU sí se autoriza al presionar el botón desde ese modal, pero la ejecución depende de un flujo legacy que enviaba comandos vía **telnet**.
- Necesitamos movernos definitivamente a **SSH** y, por ahora, dejar la lógica reducida al mínimo viable: autorizar la ONU y aplicar la VLAN indicada en el formulario.

## Problema Actual
1. El backend sigue abriendo sesiones telnet para empujar comandos a la OLT (probablemente usando `telnetlib`, `app.utils.telnet_client` o un wrapper equivalente).
2. Ese flujo solo existe porque el script anterior abría telnet contra el puerto 23; el nuevo backend Express necesita operar usando SSH (puerto 22) y credenciales almacenadas para cada OLT.
3. Además de autorizar la ONU, el código intenta ejecutar varios pasos adicionales (perfiles, descripciones, GPS, etc.) que hoy no están completos y complican el debugging.

## Objetivo
Implementar un flujo **solo SSH** para el endpoint de autorización que ejecute exactamente dos acciones en la OLT:
1. **Autorizar la ONU** (crear la ONT/ONU en el puerto indicado).
2. **Aplicar la VLAN del usuario (`user_vlan_id`)**.

Una vez que esto quede estable y funcionando por SSH, retomaremos los pasos extra (perfiles de velocidad, descripción, GPS, etc.).

## Detalles Técnicos
- Endpoint a tocar: `POST /api/olts/realtime/:oltId/onus/:serial/authorize`.
- Payload disponible (ver `AuthorizeOnuPayload` en `src/pantallas/controles/OLTs/services/types.ts`):
  - Campos críticos ahora: `puerto` (formato `frame/slot/port`), `ont_id`, `onu_type`, `sn` (alias `onu_external_id`), `line_profile`/`download_speed`, `service_profile`/`upload_speed`, `user_vlan_id`.
  - El resto del payload se puede loggear para trazabilidad pero **no** ejecutar acciones adicionales todavía.
- Conexión a OLT: usar SSH con las credenciales almacenadas (`olt_ip`, `olt_username`, `olt_password`, puerto 22). Puedes usar `ssh2`, `node-ssh` o un helper interno si ya existe.
- Timeout sugerido: 120 s totales para la autorización.

## Flujo Requerido (Huawei como referencia)
1. Abrir sesión SSH (`ssh2.Client()`).
2. Entrar a config y a la interfaz GPON:
   ```
   enable
   config
   interface gpon <frame>/<slot>
   ```
3. Autorizar la ONU:
   ```
   ont add <port> <ont_id> sn-auth "<serial>" omci ont-lineprofile-id <line_profile||download_speed>
       ont-srvprofile-id <service_profile||upload_speed> desc "<name>"
   ```
   - Mientras no tengamos perfiles configurados, puedes mapear `download_speed`/`upload_speed` a perfiles por defecto (ej. `100M`).
4. Aplicar VLAN nativa e inicializar el service-port mínimo:
   ```
   ont port native-vlan <port> <ont_id> eth 1 vlan <user_vlan_id> priority 0
   service-port vlan <user_vlan_id> gpon <frame>/<slot>/<port> ont <ont_id> gemport 1
       multi-service user-vlan <user_vlan_id>
   ```
5. Salir (`quit`, `quit`) y cerrar la sesión SSH.
6. Retornar al frontend `{ success: true, message: 'ONU autorizada y VLAN aplicada via SSH', output: <stdout capturado> }`.

### Nota para ZTE (si aplica)
Si la OLT es ZTE, el flujo equivalente sería:
```
configure terminal
gpon-onu-mng gpon-onu_<frame>/<slot>/<port>:<ont_id>
onu add <port> <ont_id> sn <serial> type <onu_type>
switchport mode trunk vlan <user_vlan_id>
```
Asegúrate de detectar la marca/modelo de la OLT antes de construir los comandos.

## Simplificaciones/Ajustes
- **Eliminar telnet**: cualquier dependencia o helper telnet debe ser reemplazado por un cliente SSH. Si todavía necesitas parsing similar, crea un wrapper `runSshCommands(olt, commands)` reutilizable.
- **Sin GPS/ODB/Descripciones avanzadas**: loggea esos campos pero no ejecutes comandos de descripción, geolocalización ni perfiles adicionales en esta iteración.
- **Validaciones mínimas**: antes de conectar, valida que `puerto` tenga formato `x/y/z`, que `ont_id` sea numérico (>0) y que `user_vlan_id` exista.
- **Logging estructurado**: guarda en logs (o base de datos si ya existe tabla de auditoría) qué comandos se enviaron y la salida recibida. Esto ayudará cuando activemos el resto de campos.

## Criterios de Aceptación
1. Presionar "Autorizar" en el modal vuelve a llamar al endpoint y **ya no depende de telnet** (solo SSH).
2. La ONU queda autorizada en la OLT y aparece en estado online; la VLAN configurada coincide con `user_vlan_id` enviado.
3. El endpoint responde en <120 s con `success: true` y el log del CLI en `output`.
4. Errores de conexión SSH (credenciales, timeout, prompt inesperado) retornan HTTP 502 con mensaje claro para el frontend.
5. No se ejecutan pasos extra (perfiles, GPS, descripción); esos quedarán para la próxima iteración.

## QA / Pruebas sugeridas
- `curl -k -X POST https://<backend>/api/olts/realtime/<oltId>/onus/<serial>/authorize -H "Authorization: Bearer <token>" -d '{...}'` con una ONU pendiente real.
- Revisar en la OLT vía CLI (`display ont info ...`) que:
  - El `ont_id` quedó creado en el puerto correcto.
  - `native-vlan` coincide con el payload.
- Verificar en los logs del backend que se registró `protocol: 'ssh'` y no `telnet`.

Cuando esto esté estable, retomaremos los comandos extra para perfiles, ODB, GPS, etc.
