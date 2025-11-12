# 📖 Guía Rápida: Verificación de Ciclo 1717348

## 🎯 Objetivo

Confirmar la discrepancia en las facturas del ciclo 1717348 para reportarla al backend.

---

## ⚡ Ejecución Rápida

### Paso 1: Ejecutar el Script de Verificación

```bash
cd /mnt/c/Users/weper/reactNativeProjects/ISP-CORE
node verificar-ciclo-1717348.js
```

### Paso 2: Revisar el Output

El script mostrará en consola:
- ✅ Información del ciclo
- ✅ Estadísticas obtenidas
- ✅ Cantidad de facturas y conexiones
- ❌ **DISCREPANCIAS ENCONTRADAS** (si existen)
- 📄 Lista de facturas problemáticas

### Paso 3: Revisar el Reporte JSON

Se generará un archivo: `reporte-ciclo-1717348-[timestamp].json`

Este archivo contiene:
```json
{
  "timestamp": "2025-11-10T...",
  "ciclo_id": 1717348,
  "resumen": {
    "discrepancias_encontradas": true/false,
    "total_discrepancias": 0,
    "facturas_problematicas": 0,
    "total_facturas_esperadas": 120,
    "total_facturas_obtenidas": 150,
    "total_conexiones": 120
  },
  "discrepancias": [
    {
      "tipo": "CANTIDAD_FACTURAS",
      "severidad": "ALTA",
      "mensaje": "...",
      "esperado": 120,
      "obtenido": 150,
      "diferencia": 30
    }
  ],
  "facturas_problematicas": [
    {
      "id_factura": 12345,
      "numero_factura": "FAC-2024-001",
      "id_ciclo": 1717350,  // ← Incorrecto (debería ser 1717348)
      "problemas": [...]
    }
  ]
}
```

---

## 📋 Qué Buscar en el Reporte

### 1. Discrepancia en Cantidad de Facturas

```
❌ DISCREPANCIA 1: El ciclo reporta 120 facturas, pero se obtuvieron 150 facturas
   Esperado: 120
   Obtenido: 150
   Diferencia: 30 facturas
```

**Significado:** Hay 30 facturas de más asignadas al ciclo.

### 2. Facturas con ID de Ciclo Incorrecto

```
❌ DISCREPANCIA 3: Se encontraron 25 facturas con datos incorrectos

1. Factura #FAC-2024-001 (ID: 12345)
   ID Ciclo: 1717350 ⚠️ INCORRECTO
   ID Ciclo Base: 15 ⚠️ INCORRECTO
   Fecha: 2024-09-15
   Total: RD$ 1,500.00
   Problemas:
      - ID ciclo incorrecto: 1717350 (esperado: 1717348)
      - ID ciclo base incorrecto: 15 (esperado: 10)
```

**Significado:** Esta factura pertenece a otro ciclo (1717350) pero fue asignada al 1717348.

### 3. Facturas con Fechas Fuera de Rango

```
Problemas:
   - Fecha fuera de rango: 2024-09-15 (ciclo: 2024-08-01 - 2024-08-31)
```

**Significado:** La factura fue emitida en septiembre pero el ciclo es de agosto.

### 4. Discrepancia en Totales de Dinero

```
❌ DISCREPANCIA 4: Suma de facturas (150,000.00) ≠ Total ciclo (120,000.00)
   Suma de facturas: RD$ 150,000.00
   Total del ciclo: RD$ 120,000.00
   Diferencia: RD$ 30,000.00
```

**Significado:** Hay RD$ 30,000 de más en el ciclo por las facturas incorrectas.

---

## 📤 Qué Enviar al Backend

### Información a Compartir

1. **El archivo JSON generado** (reporte-ciclo-1717348-*.json)
2. **El documento de reporte** (REPORTE_DISCREPANCIA_FACTURAS_CICLO_1717348.md)
3. **Screenshots de la consola** (si hay muchas facturas problemáticas)

### Ejemplo de Mensaje para el Backend

```
Hola, he ejecutado la verificación del ciclo 1717348 y encontré las siguientes discrepancias:

📊 RESUMEN:
- Total facturas esperadas: 120
- Total facturas obtenidas: 150
- Diferencia: 30 facturas de más
- Facturas con datos incorrectos: 25

🔍 PROBLEMAS IDENTIFICADOS:
1. 25 facturas tienen id_ciclo incorrecto (pertenecen a otros ciclos)
2. 30 facturas de más asignadas al ciclo
3. Diferencia en total de dinero: RD$ 30,000

📄 DETALLES:
Ver archivo adjunto: reporte-ciclo-1717348-[timestamp].json

📋 ACCIÓN REQUERIDA:
Por favor revisar el documento REPORTE_DISCREPANCIA_FACTURAS_CICLO_1717348.md
que contiene las queries SQL sugeridas para investigar y corregir el problema.

Necesitamos:
1. Identificar las facturas que NO deberían estar en el ciclo 1717348
2. Reasignarlas a sus ciclos correctos
3. Recalcular las estadísticas del ciclo
4. Prevenir que esto vuelva a ocurrir
```

---

## 🔄 Después de la Corrección del Backend

### Validar que se Corrigió

1. Ejecutar nuevamente el script:
   ```bash
   node verificar-ciclo-1717348.js
   ```

2. Verificar que NO haya discrepancias:
   ```
   ✅ NO SE ENCONTRARON DISCREPANCIAS
      Todas las facturas están correctamente asignadas.
   ```

3. Verificar en el frontend:
   - Entrar a DetalleCiclo del ciclo 1717348
   - Verificar que las estadísticas sean correctas
   - Presionar la tarjeta de conexiones
   - Verificar que la cantidad de conexiones coincida con facturas

---

## 🚨 Si el Script No Funciona

### Error: "Cannot find module 'axios'"

```bash
npm install axios
```

### Error: "ECONNREFUSED" o "socket hang up"

- Verificar que el backend esté corriendo
- Verificar la URL del backend en el script

### Error: "Unauthorized" o "403"

- El endpoint puede requerir autenticación
- Agregar token de autenticación al script si es necesario

---

## 📝 Archivos Creados

1. **verificar-ciclo-1717348.js**
   - Script ejecutable de verificación

2. **src/utils/verificarFacturasCiclo.js**
   - Utilidad reutilizable para verificar cualquier ciclo

3. **REPORTE_DISCREPANCIA_FACTURAS_CICLO_1717348.md**
   - Reporte completo para el backend con queries SQL

4. **GUIA_VERIFICACION_CICLO.md**
   - Esta guía rápida

5. **reporte-ciclo-1717348-[timestamp].json** (generado al ejecutar)
   - Reporte en formato JSON con todos los detalles

---

## ✅ Checklist

- [ ] Ejecutar `node verificar-ciclo-1717348.js`
- [ ] Revisar output en consola
- [ ] Abrir archivo JSON generado
- [ ] Identificar tipos de discrepancias
- [ ] Tomar screenshots si es necesario
- [ ] Compartir reporte con backend
- [ ] Esperar corrección del backend
- [ ] Ejecutar verificación nuevamente
- [ ] Confirmar que no hay discrepancias

---

**Listo!** Una vez ejecutes el script, tendrás toda la evidencia necesaria para reportar el problema al backend de Claude.
