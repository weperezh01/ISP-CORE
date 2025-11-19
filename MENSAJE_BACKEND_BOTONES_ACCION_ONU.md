# Mensaje para Claude del Backend - Botones de Acción ONU

## Contexto
En la pantalla de detalles de ONU (`ONUDetailsScreen.tsx`), hay 5 botones de acción en la parte inferior que necesitan estar 100% funcionales. El frontend ya está completamente implementado con validaciones, manejo de errores y feedback al usuario. Necesito que implementes los endpoints correspondientes en el backend.

## Endpoints a Implementar

### 1. **Reiniciar ONU** (Reboot via TR-069)
**Endpoint**: `POST /api/olts/realtime/:oltId/onus/:serial/tr069/reboot`

**Parámetros de ruta**:
- `oltId`: ID numérico de la OLT
- `serial`: Serial number de la ONU (ej: "HWTC12345678")

**Body**:
```json
{
  "confirm": true
}
```

**Funcionalidad requerida**:
- Enviar comando de reinicio a la ONU a través de TR-069 (ACS) o CLI de la OLT
- El comando debe ser **asíncrono**: enviar el comando y devolver respuesta inmediata
- La ONU estará fuera de servicio por aproximadamente 60 segundos
- El frontend automáticamente refrescará los datos después de 5 segundos

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Comando de reinicio enviado exitosamente",
  "task_id": "opcional-id-tarea-asincrona"
}
```

**Manejo de errores**:
- Si la ONU no está conectada a TR-069, devolver error claro
- Si el serial no existe, devolver HTTP 404
- Si hay timeout, devolver error descriptivo

---

### 2. **Resincronizar Configuración** (Resync Config)
**Endpoint**: `POST /api/olts/realtime/:oltId/onus/:serial/tr069/resync-config`

**Parámetros de ruta**:
- `oltId`: ID numérico de la OLT
- `serial`: Serial number de la ONU

**Body**: No requiere body (o `{}` vacío)

**Funcionalidad requerida**:
- Forzar resincronización de la configuración de la ONU desde la OLT
- Actualizar parámetros TR-069 desde el ACS (si está disponible)
- Refrescar estado, VLAN, velocidades, y otros parámetros de configuración
- El frontend refrescará automáticamente después de recibir respuesta exitosa

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Configuración resincronizada exitosamente",
  "task_id": "opcional-id-tarea"
}
```

**Manejo de errores**:
- Si TR-069 no está disponible, intentar resync via CLI de la OLT
- Si ambos fallan, devolver error descriptivo con detalles

---

### 3. **Restaurar Valores Predeterminados** (Factory Reset)
**Endpoint**: `POST /api/olts/realtime/:oltId/onus/:serial/tr069/factory-reset`

**Parámetros de ruta**:
- `oltId`: ID numérico de la OLT
- `serial`: Serial number de la ONU

**Body**:
```json
{
  "confirm": true
}
```

**Funcionalidad requerida**:
- **⚠️ OPERACIÓN DESTRUCTIVA**: Restaurar la ONU a configuración de fábrica
- Resetear **TODAS** las configuraciones: WiFi, DHCP, contraseñas, etc.
- La ONU estará fuera de servicio por aproximadamente 120 segundos
- El frontend muestra **doble confirmación** al usuario antes de ejecutar
- Solo ejecutar si `confirm: true` está en el body
- El frontend refrescará automáticamente después de 10 segundos

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Factory reset ejecutado exitosamente. La ONU se reiniciará con configuración de fábrica.",
  "task_id": "opcional-id-tarea"
}
```

**Manejo de errores**:
- Si `confirm` no es `true`, devolver HTTP 400 con mensaje de seguridad
- Si TR-069 no soporta factory reset, devolver error claro
- Logging obligatorio de esta operación para auditoría

---

### 4. **Deshabilitar ONU** (Disable)
**Endpoint**: `POST /api/olts/realtime/:oltId/onus/:serial/tr069/disable`

**Parámetros de ruta**:
- `oltId`: ID numérico de la OLT
- `serial`: Serial number de la ONU

**Body**: No requiere body (o `{}` vacío)

**Funcionalidad requerida**:
- Deshabilitar la ONU **temporalmente** (NO desautorizar)
- La ONU pierde servicio de internet pero permanece autorizada en la OLT
- El cliente puede ser re-habilitado posteriormente (sin perder configuración)
- Útil para suspensiones por falta de pago
- Ejecutar comando via TR-069 o CLI de la OLT

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "ONU deshabilitada exitosamente",
  "data": {
    "previous_state": "online",
    "new_state": "disabled"
  }
}
```

**Manejo de errores**:
- Si la ONU ya está deshabilitada, devolver mensaje informativo (no error)
- Si hay error al ejecutar comando, devolver detalles

**Nota importante**:
- Este endpoint **NO** desautoriza la ONU (no elimina de la OLT)
- Solo cambia el estado administrativo a "disabled"
- La ONU debe poder ser re-habilitada con un futuro endpoint `POST .../enable`

---

### 5. **Eliminar ONU** (Deauthorize/Delete)
**Endpoint**: `DELETE /api/olts/realtime/:oltId/onus/:serial/deauthorize`

**Parámetros de ruta**:
- `oltId`: ID numérico de la OLT
- `serial`: Serial number de la ONU

**Body**:
```json
{
  "puerto": "0/1/5",
  "ont_id": 10
}
```

**Funcionalidad requerida**:
- **⚠️ OPERACIÓN DESTRUCTIVA**: Desautorizar la ONU de la OLT
- Eliminar configuración de la ONU desde la OLT (via CLI)
- Liberar el ONT ID para que pueda ser reutilizado
- Si la ONU permanece conectada físicamente, volverá a aparecer como "Pendiente de Autorización"
- Ejecutar comando `no ont add` o equivalente en la OLT
- El frontend navegará de vuelta a la pantalla anterior después de éxito

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "ONU desautorizada exitosamente"
}
```

**Manejo de errores**:
- Si `puerto` no está en formato correcto (ej: "0/1/5"), devolver HTTP 400
- Si `ont_id` no es válido, devolver HTTP 400
- Si la ONU no existe en ese puerto/ONT ID, devolver HTTP 404
- Si hay error al ejecutar comando en la OLT, devolver detalles

**Comandos CLI de ejemplo**:
- **Huawei**:
  ```
  interface gpon 0/1
  ont delete 5 10
  quit
  ```
- **ZTE**:
  ```
  no onu 10 type ipdslam gpon-olt_1/1/5
  ```

---

## Consideraciones Técnicas Generales

### 1. **Formato de respuesta consistente**
Todos los endpoints deben devolver este formato:
```json
{
  "success": boolean,
  "message": string,
  "data": object (opcional),
  "error": string (solo si success = false),
  "code": string (opcional, código de error),
  "details": string (opcional, detalles adicionales),
  "debug": object (opcional, info de debugging)
}
```

### 2. **Autenticación**
- Todos los endpoints requieren header `Authorization: Bearer <token>`
- Validar que el usuario tenga permisos para modificar ONUs

### 3. **Validación de parámetros**
- Validar que `oltId` existe en la base de datos
- Validar que `serial` tiene formato correcto (12-16 caracteres alfanuméricos)
- Para `puerto`: validar formato "X/Y/Z"
- Para `ont_id`: validar rango (típicamente 0-127)

### 4. **Logging y Auditoría**
- **OBLIGATORIO**: Registrar en logs TODAS estas operaciones con:
  - Timestamp
  - Usuario que ejecutó la acción
  - OLT ID y Serial de la ONU
  - Acción ejecutada
  - Resultado (éxito/error)
- Especialmente importante para factory-reset y deauthorize (operaciones destructivas)

### 5. **Timeout y Manejo de Comandos CLI**
- Los comandos a la OLT pueden tardar varios segundos
- Implementar timeout de **30 segundos** para comandos CLI
- Si hay timeout, devolver error claro al frontend
- Considerar implementación asíncrona con task_id para operaciones largas

### 6. **Soporte Multi-Vendor**
Los scripts deben funcionar con:
- **Huawei** (MA5608T, MA5683T, etc.)
- **ZTE** (C300, C320, etc.)

Detectar el vendor automáticamente desde la tabla `olts` en la base de datos.

### 7. **TR-069 vs CLI**
- Preferir TR-069 cuando esté disponible (más confiable)
- Usar CLI de la OLT como fallback si TR-069 no está disponible
- Para **reboot** y **factory-reset**: TR-069 es obligatorio (CLI no soporta estas operaciones de forma confiable)
- Para **disable** y **deauthorize**: CLI es necesario (TR-069 no maneja autorización)

### 8. **Estados de la ONU**
Después de cada operación, la ONU puede estar en diferentes estados:
- **Reboot**: ONU offline → online (60 segundos aprox)
- **Resync**: ONU permanece online, solo actualiza config
- **Factory Reset**: ONU offline → online con config de fábrica (120 segundos aprox)
- **Disable**: ONU online → disabled (inmediato)
- **Deauthorize**: ONU desaparece de la OLT, puede reaparecer como "pending" si sigue conectada

---

## Prioridad de Implementación

1. **Alta prioridad**:
   - ✅ Desautorizar (Eliminar) - Es el más usado
   - ✅ Deshabilitar - Usado frecuentemente para suspensiones

2. **Media prioridad**:
   - ✅ Reiniciar - Usado para troubleshooting
   - ✅ Resincronizar - Útil cuando hay inconsistencias

3. **Baja prioridad**:
   - ✅ Factory Reset - Se usa raramente, pero cuando se necesita es crítico

---

## Testing Sugerido

Después de implementar cada endpoint, probar con:
1. ONU online y con TR-069 activo
2. ONU online sin TR-069
3. ONU offline
4. Serial inexistente (debe devolver 404)
5. Usuario sin permisos (debe devolver 403)
6. Timeout en comando CLI
7. Error en la OLT (sintaxis de comando incorrecta)

---

## Ejemplo de Flujo Completo (Deauthorize)

1. Frontend envía:
   ```
   DELETE /api/olts/realtime/1/onus/HWTC12345678/deauthorize
   Body: { "puerto": "0/1/5", "ont_id": 10 }
   ```

2. Backend:
   - Valida auth token ✅
   - Verifica que OLT ID=1 existe ✅
   - Verifica formato de puerto "0/1/5" ✅
   - Valida ont_id = 10 (rango válido) ✅
   - Detecta que OLT es Huawei MA5608T
   - Conecta a OLT via SSH
   - Ejecuta comandos:
     ```
     enable
     config
     interface gpon 0/1
     ont delete 5 10
     quit
     quit
     display ont info 5 10
     ```
   - Verifica que ONU ya no aparece en el listado
   - Registra en logs la operación
   - Devuelve respuesta:
     ```json
     {
       "success": true,
       "message": "ONU desautorizada exitosamente"
     }
     ```

3. Frontend:
   - Muestra alert de éxito
   - Navega de vuelta a pantalla anterior
   - Usuario ve que la ONU desapareció del listado (o aparece como "pending")

---

## Notas Adicionales

- El frontend ya maneja **todos los casos de error** con alerts descriptivos
- El frontend hace **refresh automático** después de operaciones exitosas
- Todas las operaciones destructivas tienen **confirmación doble** en el frontend
- Los handlers en el frontend muestran el **serial** de la ONU en cada confirmación para evitar errores

## Archivo de Referencia Frontend

El archivo con toda la implementación del frontend está en:
```
src/pantallas/controles/OLTs/ONUDetailsScreen.tsx
```

Handlers específicos:
- `handleReboot` - líneas 472-518
- `handleResyncConfig` - líneas 520-562
- `handleRestoreDefaults` - líneas 564-625
- `handleDisableOnu` - líneas 627-670
- `handleDeleteOnu` - líneas 672-739

API client functions:
```
src/pantallas/controles/OLTs/services/api.ts
```

---

## Pregunta Final

¿Necesitas alguna aclaración sobre alguno de estos endpoints antes de comenzar la implementación? ¿Tienes acceso a las funciones helper existentes para conectar a las OLTs via SSH y ejecutar comandos?
