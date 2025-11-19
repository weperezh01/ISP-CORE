# 🚨 URGENTE: Timeout en Script Expect ZTE

## Problema

El endpoint `/api/olts/realtime/2/onus` está retornando **HTTP 503** debido a timeout del script expect.

### Error Completo:

```python
subprocess.TimeoutExpired: Command '['expect', '/home/wdperezh01/backend/scripts/zte-estadisticas-rapidas.exp']' timed out after 30 seconds

Exception: Timeout ejecutando script expect (90s)
```

### Observación Clave:

- ✅ **Endpoint de estadísticas FUNCIONA**: `/api/olts/realtime/2/onus/estadisticas` (23s)
- ❌ **Endpoint de lista FALLA**: `/api/olts/realtime/2/onus` (timeout > 30s)

**Ambos endpoints usan el MISMO script expect**, pero:
- Estadísticas: Funciona en 23 segundos
- Lista: Timeout después de 30 segundos

## Causa Raíz

En el archivo `consultar_estadisticas_zte_detalladas.py`, el timeout del script expect está configurado en **30 segundos**:

```python
def ejecutar_expect_script():
    """Ejecutar script expect y retornar output"""
    try:
        result = subprocess.run(
            ['expect', '/home/wdperezh01/backend/scripts/zte-estadisticas-rapidas.exp'],
            capture_output=True,
            text=True,
            timeout=30  # ← PROBLEMA: Timeout muy corto
        )
```

Pero el script puede tardar hasta **35-40 segundos** dependiendo de:
- Latencia de red al Router 22
- Velocidad de respuesta de la OLT ZTE
- Cantidad de ONUs a procesar (791 ONUs)

## Solución Requerida

### Opción 1: Aumentar Timeout del Script Expect (RECOMENDADO)

**Archivo**: `scripts/consultar_estadisticas_zte_detalladas.py`

```python
def ejecutar_expect_script():
    """Ejecutar script expect y retornar output"""
    try:
        # Aumentar timeout a 60 segundos (suficiente para modo rápido)
        result = subprocess.run(
            ['expect', '/home/wdperezh01/backend/scripts/zte-estadisticas-rapidas.exp'],
            capture_output=True,
            text=True,
            timeout=60  # ← Cambiado de 30 a 60 segundos
        )

        if result.returncode != 0:
            stderr = result.stderr.strip()
            raise Exception(f"Script expect falló: {stderr}")

        return result.stdout

    except subprocess.TimeoutExpired:
        # Timeout ahora es 60s en lugar de 30s
        raise Exception("Timeout ejecutando script expect (60s)")
```

### Opción 2: Timeout Adaptativo por Modo

Si se quiere mantener diferentes timeouts para modo normal vs rápido:

```python
def ejecutar_expect_script(modo='normal'):
    """Ejecutar script expect con timeout adaptativo"""

    # Timeout basado en modo
    timeout_config = {
        'normal': 90,   # Modo completo (con potencia)
        'rapido': 45    # Modo rápido (sin potencia)
    }

    timeout = timeout_config.get(modo, 60)

    try:
        result = subprocess.run(
            ['expect', f'/path/to/zte-estadisticas-{modo}.exp'],
            capture_output=True,
            text=True,
            timeout=timeout
        )

        return result.stdout

    except subprocess.TimeoutExpired:
        raise Exception(f"Timeout ejecutando script expect ({timeout}s)")
```

### Opción 3: Aumentar SOLO para Lista, Mantener para Estadísticas

Si el endpoint de lista necesita más tiempo que el de estadísticas:

```python
def consultar_estadisticas_zte(ip, puerto, usuario, password, modo='rapido', tipo_consulta='estadisticas'):
    """
    tipo_consulta: 'estadisticas' | 'lista'
    """

    # Timeout diferenciado por tipo de consulta
    if tipo_consulta == 'lista':
        timeout_expect = 60  # Lista completa necesita más tiempo
    else:
        timeout_expect = 40  # Estadísticas son más rápidas

    # ... rest of code
```

## Testing

Después del fix:

### Test 1: Endpoint de Lista
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://wellnet-rd.com:444/api/olts/realtime/2/onus
```

**Resultado esperado:**
- ✅ HTTP 200
- ✅ Retorna 791 ONUs
- ✅ Tiempo: 35-45 segundos (dentro del nuevo timeout de 60s)

### Test 2: Endpoint de Estadísticas (No debe cambiar)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://wellnet-rd.com:444/api/olts/realtime/2/onus/estadisticas
```

**Resultado esperado:**
- ✅ HTTP 200
- ✅ Tiempo: ~23 segundos
- ✅ Sigue funcionando correctamente

## Diagnóstico Adicional

Si después de aumentar el timeout el problema persiste, verificar:

### 1. Conexión SSH al Router 22
```bash
# Probar desde el servidor backend
ssh wellnet@190.110.34.116 -p 2222
# Debe conectar rápidamente (<2 segundos)
```

### 2. Latencia al OLT ZTE
```bash
# Desde Router 22
ping 136.1.1.100 -c 5
# Debe responder <10ms
```

### 3. Script Expect Manual
```bash
# Ejecutar el script manualmente para ver cuánto tarda
time expect /home/wdperezh01/backend/scripts/zte-estadisticas-rapidas.exp

# Debe completar en < 60 segundos
```

### 4. Logs del Script Expect
```bash
# Verificar si hay errores en stderr del script expect
expect /home/wdperezh01/backend/scripts/zte-estadisticas-rapidas.exp 2>&1 | tee expect_debug.log
```

## Comparación de Tiempos

| Componente | Tiempo Típico | Timeout Actual | Timeout Recomendado |
|------------|---------------|----------------|---------------------|
| Conexión SSH Router 22 | ~2s | - | - |
| Conexión ZTE desde Router | ~1s | - | - |
| Comandos GPON (uncfg + state) | ~5s | - | - |
| Procesamiento Python | ~3s | - | - |
| **Script Expect Total** | **~25-35s** | **30s ❌** | **60s ✅** |

## Impacto del Fix

### Performance
- ✅ **Elimina timeouts** para consultas normales (25-35s)
- ✅ **Mantiene protección** contra bloqueos (timeout 60s)
- ✅ **No afecta** consultas rápidas (<30s)

### Funcionalidad
- ✅ **Endpoint de lista funcionará** correctamente
- ✅ **Frontend recibirá las 791 ONUs** sin errores
- ✅ **Filtros funcionarán** con datos reales

## Prioridad

**🚨 CRÍTICA - BLOQUEANTE**

La funcionalidad de lista de ONUs ZTE está completamente rota. Sin este fix:
- ❌ Usuario no puede ver lista de ONUs
- ❌ Todos los filtros muestran 0 resultados
- ❌ Pantalla de ONUs inútil para ZTE

## Tiempo Estimado de Fix

**5 minutos** - Cambiar un solo número (30 → 60) en una línea de código.

## Rollback (Si es necesario)

Si el aumento de timeout causa otros problemas:

1. Volver timeout a 30 segundos
2. Deshabilitar temporalmente el modo "rápido"
3. Usar modo "normal" (completo) con timeout de 90s
4. Investigar por qué el script tarda más de 30s

---

**Fecha**: 2025-11-16
**Severidad**: Crítica
**Componente**: Backend - Script Expect ZTE
**Fix estimado**: 5 minutos
**Testing estimado**: 10 minutos
