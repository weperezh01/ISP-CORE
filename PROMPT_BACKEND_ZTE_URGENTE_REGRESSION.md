# 🚨 URGENTE: Regresión en Endpoint ZTE - Solo Muestra ONUs Pendientes

## Problema Crítico

Después de los últimos cambios, el endpoint de ONUs para **ZTE C320** solo está retornando **ONUs pendientes**, perdiendo todas las **ONUs autorizadas**.

## Evidencia

### Antes de los Cambios
- OLT ZTE tenía ~756 ONUs autorizadas
- 665 online
- 91 offline
- 1 pendiente

### Después de los Cambios
```json
GET /api/olts/realtime/2/onus/estadisticas
{
  "total": 1,           // ← Solo 1 ONU
  "authorized": 0,      // ← Perdió las 756 ONUs
  "online": 0,
  "offline": 0,
  "pending": 1,
  "consistency_check": "ok"
}
```

### Confirmación del Problema

El endpoint de detalles de OLT **SÍ** muestra los datos correctos:
```json
GET /api/olts/realtime/2
{
  "puertos_ocupados": 665,   // ✅ Hay 665 ONUs
  "puertos_offline": 91,      // ✅ Hay 91 offline
  "capacidad_puertos": 756    // ✅ Total correcto
}
```

Esto confirma que:
- ✅ El OLT físico tiene las ONUs
- ✅ El comando SSH funciona para contar
- ❌ El endpoint de lista NO las está retornando

## Causa Probable

Al implementar la funcionalidad de incluir ONUs pendientes, el backend:

1. Agregó el comando para pendientes: `show gpon onu uncfg` ✅
2. **REMOVIÓ o comentó** el comando para autorizadas: `show gpon onu state` ❌

### Código Problemático (Sospechado)

**Antes (Funcionaba):**
```javascript
// ZTE
if (olt.modelo.includes('ZTE')) {
    // Obtener ONUs autorizadas
    const stateResult = execSync(`python3 scripts/zte_estado.py ...`);
    const authorizedOnus = JSON.parse(stateResult);

    return authorizedOnus;  // Retornaba las ONUs autorizadas
}
```

**Después (Roto):**
```javascript
// ZTE
if (olt.modelo.includes('ZTE')) {
    // Obtener ONUs pendientes
    const uncfgResult = execSync(`python3 scripts/zte_pendientes.py ...`);
    const pendingOnus = JSON.parse(uncfgResult);

    return pendingOnus;  // ← PROBLEMA: Solo retorna pendientes
}
```

### Código Correcto (Requerido)

```javascript
// ZTE
if (olt.modelo.includes('ZTE')) {
    // 1. Obtener ONUs autorizadas
    const stateResult = execSync(`python3 scripts/zte_estado.py ...`);
    const authorizedOnus = JSON.parse(stateResult);

    // 2. Obtener ONUs pendientes
    const uncfgResult = execSync(`python3 scripts/zte_pendientes.py ...`);
    const pendingOnus = JSON.parse(uncfgResult);

    // 3. COMBINAR ambas listas
    const allOnus = [...authorizedOnus, ...pendingOnus];

    return allOnus;
}
```

## Archivos Afectados (Probables)

1. **Controller:** `controllers/oltRealtimeController.js`
   - Función: `getOnusList()` o `getZteOnus()`

2. **Script Python ZTE:**
   - Posiblemente se creó un nuevo script que SOLO consulta pendientes
   - Y se olvidó mantener el script que consulta autorizadas

## Solución Requerida

### Paso 1: Restaurar Consulta de ONUs Autorizadas

El comando `show gpon onu state` **DEBE** ejecutarse para obtener las ONUs autorizadas:

```bash
# Este comando retorna ~756 ONUs autorizadas
show gpon onu state
```

### Paso 2: Combinar Autorizadas + Pendientes

```python
def get_all_zte_onus(olt_client):
    """Obtener TODAS las ONUs: autorizadas + pendientes"""

    all_onus = []

    # 1. ONUs autorizadas (comando principal)
    state_output = olt_client.execute_command("show gpon onu state")
    authorized = parse_zte_state(state_output)
    all_onus.extend(authorized)  # Agregar ~756 ONUs

    # 2. ONUs pendientes (comando adicional)
    uncfg_output = olt_client.execute_command("show gpon onu uncfg")
    pending = parse_zte_uncfg(uncfg_output)
    all_onus.extend(pending)  # Agregar ~1 ONU

    # Total: ~757 ONUs
    return all_onus
```

### Paso 3: Verificar Resultados

Después del fix:
```json
{
  "total": 757,        // 756 autorizadas + 1 pendiente
  "authorized": 756,
  "online": 665,
  "offline": 91,
  "pending": 1
}
```

## Testing

### 1. OLT Huawei (Control - No Tocar)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://wellnet-rd.com:444/api/olts/realtime/1/onus/estadisticas

# Debe seguir retornando ~165 ONUs
```

### 2. OLT ZTE (Arreglar)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://wellnet-rd.com:444/api/olts/realtime/2/onus/estadisticas

# Debe retornar ~757 ONUs (no solo 1)
```

## Comparación Huawei vs ZTE

| Comando | Huawei | ZTE |
|---------|--------|-----|
| ONUs autorizadas | `display ont info summary all` | `show gpon onu state` |
| ONUs pendientes | `display ont autofind all` | `show gpon onu uncfg` |
| **Ambos deben ejecutarse** | ✅ | ❌ Falta el primero |

## Impacto

### Frontend
- Usuario abre OLT ZTE
- Solo ve 1 ONU en la lista (la pendiente)
- Las 756 ONUs autorizadas son **invisibles**
- Estadísticas muestran todo en 0

### Operaciones
- **CRÍTICO:** No se puede gestionar ninguna ONU de ZTE
- No se pueden ver ONUs online/offline
- No se pueden ver detalles de ONUs
- Funcionalidad completamente rota para ZTE

## Prioridad

**🚨 CRÍTICA - BLOQUEANTE**

La funcionalidad de gestión de ONUs ZTE está **completamente rota**. Las 756 ONUs de la OLT ZTE son inaccesibles desde la aplicación.

## Rollback Temporal (Si es necesario)

Si el fix toma tiempo, considerar rollback temporal:
1. Revertir los cambios recientes al endpoint ZTE
2. Volver a retornar solo ONUs autorizadas (sin pendientes)
3. Esto al menos restaura funcionalidad básica mientras se implementa correctamente

## Archivos para Revisar

```bash
# Buscar cambios recientes en archivos ZTE
git log --since="2 days ago" --oneline -- "*zte*"
git log --since="2 days ago" --oneline -- "*ZTE*"
git log --since="2 days ago" --oneline -- "controllers/oltRealtimeController.js"

# Ver diff de cambios recientes
git diff HEAD~5 -- "controllers/oltRealtimeController.js"
```

---

**Resumen:** El backend está ejecutando SOLO el comando de ONUs pendientes (`show gpon onu uncfg`) pero NO está ejecutando el comando de ONUs autorizadas (`show gpon onu state`). Necesita ejecutar AMBOS comandos y combinar los resultados.

**Tiempo estimado de fix:** 15-30 minutos (agregar comando faltante + combinar listas)
