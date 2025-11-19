# 🚨 RESUMEN DE PROBLEMAS URGENTES DEL BACKEND

**Fecha**: 2025-01-19
**Prioridad**: ALTA
**Afecta a**: Producción

---

## 📊 Estado General

| Problema | Endpoint | Estado | Prioridad |
|----------|----------|--------|-----------|
| Timeout en autorización ONU | POST `/api/olts/realtime/:oltId/onus/:serial/authorize` | ⚠️ Funciona pero tarda 68s | ALTA |
| Lista de ISPs no responde | POST `/api/usuarios/super-admin-usuario-isp` | ❌ Network failed | CRÍTICA |
| Actualizar ISP usuario | POST `/api/usuarios/actualizar-isp-usuario` | ⚠️ No verificado | MEDIA |

---

## 🔥 PROBLEMA 1: Timeout en Autorización de ONU

### Descripción
El endpoint de autorización de ONU funciona correctamente pero tarda ~68 segundos. El frontend tiene timeout de 60s por defecto y cancela la petición antes de recibir respuesta.

### Endpoint
```
POST https://wellnet-rd.com:444/api/olts/realtime/:oltId/onus/:serial/authorize
```

### Diagnóstico del Backend
✅ **BACKEND FUNCIONA CORRECTAMENTE**
- Tiempo de respuesta: 68 segundos
- Respuesta: HTTP 409 (ONU duplicada) o HTTP 200 (éxito)
- Script Python `autorizar_onu_tr069.py` funciona bien
- Conexión SSH a OLT funciona

### Problema
El frontend cancelaba a los 60s. **YA SOLUCIONADO EN FRONTEND** (timeout aumentado a 180s).

### Acción Requerida del Backend
**✅ NO SE REQUIERE ACCIÓN** - El backend funciona correctamente.

### Documentos de Referencia
- `URGENTE_BACKEND_AUTORIZACION_ONU_ROTA.md` - Diagnóstico completo
- `FIX_TIMEOUT_AUTORIZACION_ONU.md` - Fix implementado en frontend
- `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md` - Especificación de endpoints de acción

---

## 🔥 PROBLEMA 2: Endpoint de Lista de ISPs No Responde

### Descripción
El endpoint para obtener la lista de ISPs asignados a un super admin no responde. Frontend recibe "Network request failed".

### Endpoint
```
POST https://wellnet-rd.com:444/api/usuarios/super-admin-usuario-isp
```

**Request**:
```json
{
  "id": <usuario_id>
}
```

**Respuesta Esperada**:
```json
{
  "isp_asignados": [
    {
      "id_isp": 1,
      "nombre": "ISP Example",
      "direccion": "...",
      "telefono": "...",
      "email": "...",
      "pagina_web": "..."
    }
  ]
}
```

### Diagnóstico
⚠️ **REQUIERE VERIFICACIÓN**

Posibles causas:
1. Endpoint no implementado (404)
2. Error de SQL o base de datos (500)
3. Backend caído
4. Timeout en query SQL

### Acción Requerida del Backend

#### Paso 1: Verificar que el endpoint existe
```bash
grep -r "super-admin-usuario-isp" routes/
grep -r "super-admin-usuario-isp" controllers/
```

#### Paso 2: Probar el endpoint
```bash
curl -k -X POST https://wellnet-rd.com:444/api/usuarios/super-admin-usuario-isp \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
```

#### Paso 3: Si no existe, implementarlo
Ver implementación completa en `URGENTE_BACKEND_ENDPOINT_ISP_LIST.md`

#### Paso 4: Verificar tabla usuario_isp
```sql
-- Verificar estructura
DESCRIBE usuario_isp;

-- Ver datos
SELECT
  u.nombre AS usuario,
  i.nombre AS isp
FROM usuario_isp ui
INNER JOIN usuarios u ON ui.id_usuario = u.id
INNER JOIN isps i ON ui.id_isp = i.id_isp
WHERE ui.id_usuario = 1;
```

### Documentos de Referencia
- `URGENTE_BACKEND_ENDPOINT_ISP_LIST.md` - Diagnóstico y solución completa

---

## 🔥 PROBLEMA 3: Endpoints de Acciones ONU No Implementados

### Descripción
Los 5 botones de acción en la pantalla de detalles de ONU requieren endpoints en el backend que probablemente no están implementados.

### Endpoints Requeridos

#### 1. Reiniciar ONU
```
POST /api/olts/realtime/:oltId/onus/:serial/tr069/reboot
Body: { "confirm": true }
```

#### 2. Resincronizar Configuración
```
POST /api/olts/realtime/:oltId/onus/:serial/tr069/resync-config
Body: {}
```

#### 3. Restaurar Valores de Fábrica
```
POST /api/olts/realtime/:oltId/onus/:serial/tr069/factory-reset
Body: { "confirm": true }
```

#### 4. Deshabilitar ONU
```
POST /api/olts/realtime/:oltId/onus/:serial/tr069/disable
Body: {}
```

#### 5. Desautorizar/Eliminar ONU
```
DELETE /api/olts/realtime/:oltId/onus/:serial/deauthorize
Body: { "puerto": "0/1/0", "ont_id": 10 }
```

### Acción Requerida del Backend
Implementar estos 5 endpoints según especificación completa.

### Documentos de Referencia
- `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md` - Especificación COMPLETA de los 5 endpoints

---

## 📋 CHECKLIST GENERAL DE DIAGNÓSTICO

### Backend en General
- [ ] Backend está corriendo (`pm2 status`)
- [ ] Puerto 444 escuchando (`netstat -tlnp | grep 444`)
- [ ] Sin errores en logs (`pm2 logs --lines 100`)
- [ ] Sin procesos Python colgados (`ps aux | grep python`)

### Base de Datos
- [ ] MySQL está corriendo
- [ ] Tabla `usuario_isp` existe
- [ ] Tabla `onus` existe
- [ ] Tabla `isps` existe
- [ ] Índices creados correctamente

### Endpoints Críticos
- [ ] POST `/api/usuarios/super-admin-usuario-isp` - **VERIFICAR**
- [ ] POST `/api/usuarios/actualizar-isp-usuario` - **VERIFICAR**
- [ ] POST `/api/olts/realtime/:oltId/onus/:serial/authorize` - ✅ Funciona
- [ ] POST `/api/olts/realtime/:oltId/onus/:serial/tr069/reboot` - **IMPLEMENTAR**
- [ ] POST `/api/olts/realtime/:oltId/onus/:serial/tr069/resync-config` - **IMPLEMENTAR**
- [ ] POST `/api/olts/realtime/:oltId/onus/:serial/tr069/factory-reset` - **IMPLEMENTAR**
- [ ] POST `/api/olts/realtime/:oltId/onus/:serial/tr069/disable` - **IMPLEMENTAR**
- [ ] DELETE `/api/olts/realtime/:oltId/onus/:serial/deauthorize` - **IMPLEMENTAR**

---

## 🎯 PRIORIDADES DE IMPLEMENTACIÓN

### PRIORIDAD 1 (Crítica - Bloqueante)
1. **Endpoint de lista de ISPs** - App no funciona sin esto
   - Archivo: `URGENTE_BACKEND_ENDPOINT_ISP_LIST.md`

### PRIORIDAD 2 (Alta - Funcionalidad Principal)
2. **Desautorizar ONU** - Más usado
   - Archivo: `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md` (sección 5)

3. **Deshabilitar ONU** - Para suspensiones
   - Archivo: `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md` (sección 4)

### PRIORIDAD 3 (Media - Operaciones Comunes)
4. **Reiniciar ONU** - Para troubleshooting
   - Archivo: `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md` (sección 1)

5. **Resincronizar ONU** - Para inconsistencias
   - Archivo: `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md` (sección 2)

### PRIORIDAD 4 (Baja - Usado Raramente)
6. **Factory Reset ONU** - Operación rara pero crítica cuando se necesita
   - Archivo: `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md` (sección 3)

---

## 🛠️ COMANDOS ÚTILES DE DIAGNÓSTICO

### Ver estado del backend
```bash
pm2 status
pm2 logs --lines 100
```

### Verificar puerto 444
```bash
netstat -tlnp | grep 444
lsof -i :444
```

### Ver procesos Python
```bash
ps aux | grep python
ps aux | grep autorizar
```

### Reiniciar backend si es necesario
```bash
pm2 restart wellnet-backend
pm2 logs
```

### Conectar a MySQL
```bash
mysql -u well -p'874494Aa.' wellnetrddb
```

### Probar endpoints manualmente
```bash
# Lista de ISPs
curl -k -X POST https://wellnet-rd.com:444/api/usuarios/super-admin-usuario-isp \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'

# Autorizar ONU (tarda ~68 segundos)
curl -k -X POST https://wellnet-rd.com:444/api/olts/realtime/1/onus/SERIAL_AQUI/authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{ payload aquí }'
```

---

## 📚 DOCUMENTOS DE REFERENCIA

Todos los documentos están en la raíz del proyecto:

### Problemas y Diagnósticos
1. `URGENTE_BACKEND_AUTORIZACION_ONU_ROTA.md` - Diagnóstico de timeout en autorización
2. `DEBUG_AUTORIZACION_ONU_NETWORK_ERROR.md` - Análisis técnico del error
3. `URGENTE_BACKEND_ENDPOINT_ISP_LIST.md` - Endpoint de lista de ISPs

### Soluciones Implementadas
4. `FIX_TIMEOUT_AUTORIZACION_ONU.md` - Fix de timeout en frontend
5. `SOLUCION_TIMEOUT_REACT_NATIVE.md` - Soluciones alternativas para RN

### Especificaciones de Endpoints
6. `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md` - **DOCUMENTO PRINCIPAL** para implementar los 5 botones
7. `ENDPOINTS_CATALOGOS_AUTORIZACION_ONU.md` - Catálogos para autorización

### Guías y Testing
8. `GUIA_TESTING_TR069.md` - Testing de TR-069
9. Múltiples archivos `PROMPT_BACKEND_*.md` - Prompts para fixes específicos

---

## 🚀 SIGUIENTE PASO

**Para el Claude del Backend:**

1. **INMEDIATO**: Verificar y arreglar endpoint de lista de ISPs
   - Leer: `URGENTE_BACKEND_ENDPOINT_ISP_LIST.md`
   - Ejecutar checklist de diagnóstico
   - Implementar si no existe

2. **ALTA PRIORIDAD**: Implementar endpoints de acciones ONU
   - Leer: `MENSAJE_BACKEND_BOTONES_ACCION_ONU.md`
   - Implementar los 5 endpoints en orden de prioridad
   - Testing con curl

3. **VERIFICACIÓN**: Confirmar que autorización de ONU funciona
   - Ya funciona (tarda 68s, es normal)
   - Solo confirmar que no hay errores

---

## 📞 REPORTE DE RESULTADOS

Después de trabajar en estos problemas, reportar:

1. ✅ Endpoint de ISPs:
   - [ ] Existía y funciona
   - [ ] No existía, lo implementé
   - [ ] Tenía error, lo arreglé
   - Resultado del curl test: _______

2. ✅ Endpoints de acciones ONU:
   - [ ] Reiniciar: Implementado
   - [ ] Resincronizar: Implementado
   - [ ] Factory Reset: Implementado
   - [ ] Deshabilitar: Implementado
   - [ ] Desautorizar: Implementado

3. ✅ Testing:
   - [ ] Todos los endpoints probados con curl
   - [ ] Logs sin errores
   - [ ] Timeouts apropiados configurados

---

**IMPORTANTE**: El frontend YA está actualizado con timeouts apropiados (180s para autorización, etc.). Solo falta que el backend implemente los endpoints faltantes.
