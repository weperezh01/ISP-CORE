# 🧪 Guía para Generar Tráfico de Prueba en MikroTik

## Objetivo
Generar tráfico > 1 Gbps en interfaces SFP+ para reproducir el problema donde se muestra "1 Mbps" en lugar de "1+ Gbps".

## ⚠️ Precauciones de Seguridad

1. **Horario**: Realizar pruebas durante horas de bajo tráfico
2. **Duración**: Limitar las pruebas a 1-2 minutos máximo
3. **Monitoreo**: Tener Winbox abierto para supervisar el sistema
4. **Backup**: Realizar backup de configuración antes de modificar

## Método 1: Traffic Generator (Recomendado)

### 1.1 Acceso por Terminal
```bash
# En Winbox, ir a "New Terminal" o usar SSH
/tool traffic-generator
```

### 1.2 Generar Tráfico UDP
```bash
# Generar tráfico de 1.5 Gbps en interfaz SFP+
/tool traffic-generator
add name=test-traffic interface=sfp-sfpplus1-IN tx-size=1500 tx-count=1000000 tx-rate=1500000000
start test-traffic

# Esperar 30-60 segundos para ver el tráfico
# Luego detener:
stop test-traffic
remove test-traffic
```

### 1.3 Parámetros Ajustables
```bash
# Para 2 Gbps:
tx-rate=2000000000

# Para 1.2 Gbps:
tx-rate=1200000000

# Para múltiples interfaces:
add name=test-sfp1 interface=sfp-sfpplus1-IN tx-rate=1500000000
add name=test-sfp2 interface=sfp-sfpplus3-LAN tx-rate=1200000000
```

## Método 2: Bandwidth Test (Entre Interfaces)

### 2.1 Configurar Test Server
```bash
# Habilitar servidor de test de ancho de banda
/tool bandwidth-test
# Configurar IP de la interfaz a testear
```

### 2.2 Usar Winbox GUI
1. **Tools → Bandwidth Test**
2. **Direction**: Both o Upload/Download
3. **Protocol**: UDP
4. **Target**: IP de otra interfaz o gateway
5. **Duration**: 60 segundos
6. **Tx Rate**: 1500000000 (1.5 Gbps)

## Método 3: Iperf3 (Si está disponible)

### 3.1 Instalar Iperf3
```bash
# Si el MikroTik tiene paquetes adicionales
/system package print
# Buscar si existe iperf3
```

### 3.2 Generar Tráfico
```bash
# Servidor
iperf3 -s

# Cliente (generar 1.5 Gbps)
iperf3 -c [IP_DESTINO] -b 1500M -t 60
```

## Método 4: Ping Flood (Para Tráfico Más Ligero)

### 4.1 Ping Masivo
```bash
# Generar tráfico con ping de gran tamaño
/ping 8.8.8.8 count=100000 size=1400 interval=0.001
```

## Método 5: Simulación con Netwatch

### 5.1 Crear Múltiples Conexiones
```bash
# Crear múltiples netwatch para generar tráfico
/tool netwatch
add host=8.8.8.8 interval=1s
add host=1.1.1.1 interval=1s
add host=208.67.222.222 interval=1s
```

## Procedimiento de Prueba Completo

### Paso 1: Preparación
```bash
# 1. Tomar screenshot de tráfico actual
# 2. Abrir app ReactNative en RouterDetailsScreen
# 3. Tener Winbox abierto para monitorear
```

### Paso 2: Ejecutar Test
```bash
# Usar Método 1 (Traffic Generator) - MÁS RECOMENDADO
/tool traffic-generator
add name=gbps-test interface=sfp-sfpplus1-IN tx-size=1500 tx-count=2000000 tx-rate=1500000000
start gbps-test

# Dejar correr 30-60 segundos
```

### Paso 3: Monitorear
```bash
# En otra terminal, monitorear tráfico
/interface monitor-traffic sfp-sfpplus1-IN once

# O usar Winbox: Interfaces → Monitor Traffic
```

### Paso 4: Capturar Logs
```bash
# En la app ReactNative, revisar logs:
# - "=== TODOS LOS VALORES DEL BACKEND ==="
# - "🚨 POSIBLE GBPS ISSUE"
```

### Paso 5: Limpiar
```bash
# Detener generador
/tool traffic-generator stop gbps-test
/tool traffic-generator remove gbps-test
```

## Comandos de Monitoreo

### Ver Tráfico en Tiempo Real
```bash
# Monitorear interfaz específica
/interface monitor-traffic sfp-sfpplus1-IN

# Ver estadísticas
/interface print stats

# Monitor gráfico (Winbox)
# Interfaces → [Interfaz] → Traffic
```

### Verificar Recursos del Sistema
```bash
# CPU y memoria
/system resource print

# Temperatura (si disponible)
/system health print
```

## Interpretación de Resultados

### Valores Esperados en Winbox
- **TX Rate**: 1.5 Gbps (1,500,000,000 bps)
- **RX Rate**: Variable según tráfico de respuesta

### Valores Esperados en App
- **Backend debería recibir**: ~1500000000 o algún valor proporcional
- **Frontend debería mostrar**: "1.5 Gbps"
- **Problema actual**: Probablemente muestre "1.5 Mbps"

## Alternativas Si No Funciona

### Opción A: Usar Interfaz Bridge
```bash
# Crear bridge con alto tráfico
/interface bridge add name=test-bridge
/interface bridge port add bridge=test-bridge interface=sfp-sfpplus1-IN
```

### Opción B: Modificar QoS Temporalmente
```bash
# Crear reglas de QoS para generar tráfico
/queue simple add target=sfp-sfpplus1-IN max-limit=1500M/1500M
```

## Notas Importantes

1. **Duración**: No mantener tests > 2 minutos
2. **Horario**: Preferiblemente 2-5 AM cuando hay menos usuarios
3. **Monitoreo**: Supervisar temperatura y CPU del router
4. **Backup**: Tener configuración respaldada

## Comandos de Emergencia

```bash
# Detener TODOS los traffic generators
/tool traffic-generator stop [find]
/tool traffic-generator remove [find]

# Reiniciar interfaz si es necesario
/interface disable sfp-sfpplus1-IN
/interface enable sfp-sfpplus1-IN
```

---

**Prioridad**: Alta - Necesario para reproducir y corregir el bug de unidades
**Riesgo**: Medio - Puede afectar temporalmente el servicio
**Duración**: 5-10 minutos total de prueba