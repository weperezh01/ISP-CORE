# 🔧 Fix: Spacing Issue en Script Expect Huawei

## Problema

El script `scripts/huawei-consultar-ont-ids.exp` está enviando el comando sin el espacio necesario:

**Comando Enviado (Incorrecto)**:
```
display ont info 0/1/5all
                     ↑ Falta espacio
```

**Comando Esperado (Correcto)**:
```
display ont info 0/1/5 all
                     ↑ Espacio necesario
```

**Error Resultante**:
```
Parameter error
```

## Ubicación del Bug

**Archivo**: `scripts/huawei-consultar-ont-ids.exp`

**Línea Problemática** (probablemente):
```tcl
# ❌ INCORRECTO - Sin espacio
send "display ont info $port$ont_id_param\r"

# O también puede ser:
send "display ont info ${port}all\r"
```

## Solución

### Opción 1: Agregar Espacio Explícito

```tcl
# ✅ CORRECTO - Con espacio explícito
send "display ont info $port all\r"
```

### Opción 2: Variable con Espacio

```tcl
# ✅ CORRECTO - Variable separada con espacio
set port_param "$port"
send "display ont info $port_param all\r"
```

### Opción 3: String Interpolation Explícito

```tcl
# ✅ CORRECTO - Concatenación explícita
send "display ont info ${port} all\r"
```

## Código Completo Sugerido

```tcl
#!/usr/bin/expect -f

set timeout 30
set ip [lindex $argv 0]
set port_ssh [lindex $argv 1]
set username [lindex $argv 2]
set password [lindex $argv 3]
set puerto_pon [lindex $argv 4]

# Parsear puerto PON (formato: 0/1/5)
set port_parts [split $puerto_pon "/"]
set frame [lindex $port_parts 0]
set slot [lindex $port_parts 1]
set port [lindex $port_parts 2]

# Conectar vía SSH
spawn ssh -p $port_ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $username@$ip
expect {
    timeout {
        puts stderr "Error: Connection timeout"
        exit 1
    }
    "password:" {
        send "$password\r"
    }
}

# Esperar prompt
expect {
    timeout {
        puts stderr "Error: Login timeout"
        exit 1
    }
    ">" {
        # Login exitoso
    }
}

# Entrar a modo enable
send "enable\r"
expect "#"

# ✅ SOLUCIÓN: Comando con espacio explícito
# Nota: Usar solo el número del puerto (port), no todo el path
send "display ont info $port all\r"

# Esperar respuesta del comando
expect {
    timeout {
        puts stderr "Error: Command timeout"
        exit 1
    }
    "#" {
        # Comando completado
    }
}

# Salir
send "quit\r"
expect eof
```

## Explicación del Formato Correcto

### Comando Huawei

```bash
display ont info <port> all
```

**Parámetros**:
- `<port>`: Número del puerto (ej: `5`, no `0/1/5`)
- `all`: Keyword para mostrar todas las ONUs del puerto
- **Espacio requerido** entre `<port>` y `all`

### Ejemplos Correctos

```bash
# Puerto 5
display ont info 5 all

# Puerto 10
display ont info 10 all

# Puerto 1
display ont info 1 all
```

### Ejemplos Incorrectos

```bash
# ❌ Sin espacio
display ont info 5all

# ❌ Path completo
display ont info 0/1/5 all

# ❌ Formato incorrecto
display ont info all 5
```

## Testing del Fix

### Prueba Manual del Script

```bash
# Ejecutar script manualmente
expect scripts/huawei-consultar-ont-ids.exp \
    "10.200.200.2" \
    "23" \
    "wellnet" \
    "password" \
    "0/1/5"
```

**Salida Esperada**:
```
# Login y enable mode
MA5800-X15>enable
MA5800-X15#display ont info 5 all

  F/S/P   ONT-ID  ...
  0/1/5   1       ...
  0/1/5   2       ...
  0/1/5   3       ...
  ...

MA5800-X15#quit
```

### Verificación de Output

El script debe imprimir datos entre marcadores:

```
<<<ONT_IDS_START>>>
0/1/5   1   ...
0/1/5   2   ...
0/1/5   3   ...
<<<ONT_IDS_END>>>
```

## Debugging

### Agregar Debug al Script

Para ver exactamente qué comando se está enviando:

```tcl
# Activar debug
exp_internal 1

# Antes de enviar el comando
puts stderr "DEBUG: Sending command: display ont info $port all"
send "display ont info $port all\r"

# Después de recibir respuesta
puts stderr "DEBUG: Command sent successfully"
```

### Ver Output del Expect

```bash
# Ejecutar con output verbose
expect -d scripts/huawei-consultar-ont-ids.exp \
    "10.200.200.2" "23" "wellnet" "password" "0/1/5" 2>&1 | tee debug.log
```

### Verificar Espacios

```bash
# Buscar el comando en el log
grep "display ont info" debug.log

# Debe mostrar:
# send: sending "display ont info 5 all\r" to { exp6 }
#                                  ↑ Espacio debe estar aquí
```

## Código Python - Parseo del Puerto

El script Python también debe parsear correctamente el puerto:

```python
def parsear_puerto_huawei(puerto_pon):
    """
    Parsear puerto PON para Huawei

    Args:
        puerto_pon: String con formato "0/1/5" (frame/slot/port)

    Returns:
        str: Solo el número del puerto (ej: "5")
    """
    parts = puerto_pon.split('/')
    if len(parts) != 3:
        raise ValueError(f"Formato de puerto inválido: {puerto_pon}")

    frame, slot, port = parts

    # Huawei usa solo el número del puerto en el comando
    return port

# Uso
puerto_pon = "0/1/5"
port_number = parsear_puerto_huawei(puerto_pon)  # "5"

# Comando correcto
command = f"display ont info {port_number} all"
# Resultado: "display ont info 5 all"
```

## Resumen del Fix

### Cambio Mínimo Requerido

En `scripts/huawei-consultar-ont-ids.exp`, cambiar:

```tcl
# ANTES (línea problemática - buscar algo similar)
send "display ont info ${port}all\r"

# DESPUÉS (con espacio)
send "display ont info ${port} all\r"
#                            ↑ Agregar este espacio
```

### Verificación

1. ✅ Revisar que haya espacio antes de "all"
2. ✅ Usar solo el número del puerto (no `0/1/5`, solo `5`)
3. ✅ Probar con `expect -d` para ver el comando enviado
4. ✅ Verificar que el OLT responde sin "Parameter error"

## Tests Esperados Después del Fix

Una vez corregido el spacing:

```bash
node test-available-ont-ids.js
```

**Resultado Esperado**:
```
✅ Test 1 PASADO: Port format validation
✅ Test 2 PASADO: OLT not found validation
✅ Test 3 PASADO: Huawei - Port with available IDs
✅ Test 4 PASADO: Huawei - Empty port
✅ Test 5 PASADO: Huawei - Full port
✅ Test 6 PASADO: ZTE - Port with available IDs
✅ Test 7 PASADO: ZTE - Empty port

7/7 tests passing (100%)
```

## Tiempo Estimado

**Fix**: 2-5 minutos (cambiar una línea)
**Testing**: 5 minutos
**Total**: <10 minutos

---

**Prioridad**: ALTA - Bloqueante para funcionalidad de ONT IDs
**Complejidad**: BAJA - Simple error de spacing
**Impacto**: ALTO - Desbloquea toda la funcionalidad de auto-sugerencia
