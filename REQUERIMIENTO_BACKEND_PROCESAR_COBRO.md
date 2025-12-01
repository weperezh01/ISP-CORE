# Requerimiento Backend: Endpoint `facturas-procesar-cobro`

## Contexto del Problema

Estamos experimentando un problema en la funcionalidad de cobro de facturas en la aplicación móvil WellNet ISP. El flujo de cobro se encuentra en la pantalla `ClienteFacturasScreen.tsx` y específicamente falla cuando el usuario presiona el botón "Total a recibir" después de seleccionar facturas para cobrar.

**⚠️ IMPORTANTE**: Hubo un problema con el control de versiones en el backend y se perdió código que no se puede restaurar. Este documento describe el comportamiento esperado del endpoint para que pueda ser reimplementado correctamente.

## Ubicación del Código Frontend

- **Archivo**: `src/pantallas/cliente/ClienteFacturasScreen.tsx`
- **Función principal**: `proceedCobro` (línea 974)
- **Endpoint**: `POST https://wellnet-rd.com:444/api/facturas-procesar-cobro`

## Flujo de Usuario

1. El usuario navega desde `ClientDetailsScreen` → botón "Ver Facturas" → `ClienteFacturasScreen`
2. En la pantalla de facturas del cliente, el usuario ve todas las facturas (vigentes, vencidas, pagadas)
3. El usuario puede:
   - Seleccionar una o más facturas pendientes presionando el botón "Cobrar" en cada factura
   - Opcionalmente activar "Pago Parcial" para cobrar solo una parte del monto de una factura
4. Al seleccionar facturas, el footer muestra el "Total a recibir" actualizado
5. El usuario presiona el footer "Total a recibir"
6. Se abre un modal para seleccionar el método de pago:
   - **Efectivo**: No requiere detalles adicionales
   - **Transferencia**: Requiere banco y número de referencia (opcional: cuenta destino, titular, nota)
   - **Cheque**: Requiere banco y número de cheque (opcional: cuenta destino, titular, fecha del cheque, nota)
7. El usuario confirma el cobro
8. Se envía la petición al backend
9. **Comportamiento esperado**: El backend procesa el cobro y devuelve los datos del recibo
10. **Comportamiento esperado**: La app navega a `ReciboScreen` mostrando el recibo generado

## Payload Enviado al Backend

El frontend envía el siguiente payload en formato JSON:

```json
{
  "id_cliente": 123,
  "monto": 1500.50,
  "id_usuario": 45,
  "id_ciclo": 78,
  "id_isp": 5,
  "metodo_pago": "efectivo",
  "cargos": [],
  "facturas": [
    {
      "id_factura": 101,
      "monto_cobrado": 800.00,
      "nota": "",
      "id_ciclo": 78
    },
    {
      "id_factura": 102,
      "monto_cobrado": 700.50,
      "nota": "",
      "id_ciclo": 78
    },
    {
      "id_factura": 95,
      "monto_cobrado": 0,
      "nota": "",
      "id_ciclo": 78
    }
  ],
  "detalle_pago": {
    "banco": "Banco Popular",
    "referencia": "1234567890",
    "cuenta_destino": "9876543210",
    "titular": "Juan Pérez",
    "fecha_cheque": "2025-01-15",
    "nota": "Pago parcial acordado con el cliente"
  }
}
```

### Descripción de Campos del Payload

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id_cliente` | Integer | Sí | ID del cliente que está realizando el pago |
| `monto` | Float | Sí | Monto total que se está recibiendo (suma de todos los `monto_cobrado` de las facturas seleccionadas) |
| `id_usuario` | Integer | Sí | ID del usuario (empleado/cajero) que está procesando el cobro |
| `id_ciclo` | Integer | Sí | ID del ciclo de facturación |
| `id_isp` | Integer | Sí | ID del ISP (proveedor de internet) |
| `metodo_pago` | String | Sí | Método de pago: `"efectivo"`, `"transferencia"`, o `"cheque"` |
| `cargos` | Array | Sí | Array de cargos adicionales (actualmente siempre vacío `[]`) |
| `facturas` | Array | Sí | Array de objetos de factura (ver detalles abajo) |
| `detalle_pago` | Object | No | Detalles adicionales del pago (solo si método es transferencia o cheque) |

#### Estructura de cada objeto en `facturas[]`:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_factura` | Integer | ID de la factura |
| `monto_cobrado` | Float | Monto que se está cobrando de esta factura. Puede ser `0` para facturas vencidas no seleccionadas que se incluyen en el recibo |
| `nota` | String | Nota de la factura (actualmente siempre vacío `""`) |
| `id_ciclo` | Integer | ID del ciclo de facturación de esta factura |

**Nota importante sobre facturas con `monto_cobrado: 0`**:
El frontend incluye en el array `facturas` todas las facturas vencidas (más de 30 días desde emisión) que NO fueron seleccionadas, pero con `monto_cobrado: 0`. Esto es para que aparezcan en el recibo como facturas pendientes/vencidas sin cobrarse.

#### Estructura de `detalle_pago` (opcional):

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `banco` | String | Sí (si transferencia/cheque) | Nombre del banco |
| `referencia` | String | Sí (si transferencia/cheque) | Número de referencia (transferencia) o número de cheque (cheque) |
| `cuenta_destino` | String | No | Cuenta destino (opcional) |
| `titular` | String | No | Titular de la cuenta (opcional) |
| `fecha_cheque` | String | No | Fecha del cheque en formato YYYY-MM-DD (solo para cheques) |
| `nota` | String | No | Nota adicional sobre el pago |

## Comportamiento Esperado del Backend

### 1. Validaciones Requeridas

El endpoint debe validar:
- Que todos los campos requeridos estén presentes
- Que `id_cliente`, `id_usuario`, `id_ciclo`, e `id_isp` sean válidos y existan en la base de datos
- Que todas las facturas en el array `facturas` existan
- Que el `monto` total coincida con la suma de los `monto_cobrado` de las facturas seleccionadas
- Que el `metodo_pago` sea uno de los valores permitidos: `"efectivo"`, `"transferencia"`, o `"cheque"`
- Si `metodo_pago` es `"transferencia"` o `"cheque"`, validar que `detalle_pago.banco` y `detalle_pago.referencia` estén presentes

### 2. Procesamiento del Cobro

El backend debe:

1. **Crear un recibo** con los siguientes datos:
   - Información del cliente
   - Información del usuario que procesa el cobro
   - Fecha y hora del cobro
   - Método de pago
   - Detalles del pago (si aplica)
   - Monto total recibido

2. **Actualizar el estado de las facturas**:
   - Para cada factura con `monto_cobrado > 0`:
     - Si `monto_cobrado` es igual al monto pendiente de la factura, marcar la factura como `"pagado"`
     - Si `monto_cobrado` es menor al monto pendiente, actualizar el campo `monto_recibido` sumando el `monto_cobrado` y mantener el estado como `"pendiente"`
     - Registrar la fecha de cobro (`fecha_cobrada`)

3. **Asociar las facturas al recibo**:
   - Crear registros en la tabla de relación recibo-factura para todas las facturas en el array (incluyendo las de `monto_cobrado: 0`)

4. **Registrar el pago en la contabilidad**:
   - Crear un registro de ingreso en el sistema contable del ISP
   - Asociar el ingreso con el método de pago utilizado

### 3. Respuesta Exitosa Esperada

El backend debe devolver un **status code 200** con un JSON que contenga los datos del recibo creado:

```json
{
  "id_recibo": 456,
  "numero_recibo": "REC-2025-000456",
  "fecha": "2025-01-15",
  "hora": "14:30:25",
  "id_cliente": 123,
  "cliente": {
    "id_cliente": 123,
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono1": "809-555-1234",
    "cedula": "402-1234567-8",
    "direccion": "Calle Principal #123"
  },
  "id_usuario": 45,
  "usuario": {
    "id": 45,
    "nombre": "María López",
    "rol": "Cajero"
  },
  "id_isp": 5,
  "monto_total": 1500.50,
  "metodo_pago": "transferencia",
  "detalle_pago": {
    "banco": "Banco Popular",
    "referencia": "1234567890",
    "cuenta_destino": "9876543210",
    "titular": "Juan Pérez",
    "nota": "Pago parcial acordado con el cliente"
  },
  "facturas": [
    {
      "id_factura": 101,
      "numero_factura": "FAC-2025-000101",
      "monto_total": 800.00,
      "monto_cobrado": 800.00,
      "monto_recibido_anterior": 0,
      "monto_recibido_total": 800.00,
      "estado": "pagado",
      "fecha_emision": "2024-12-15",
      "fecha_cobrada": "2025-01-15",
      "servicio": "Internet 50 Mbps"
    },
    {
      "id_factura": 102,
      "numero_factura": "FAC-2025-000102",
      "monto_total": 1200.00,
      "monto_cobrado": 700.50,
      "monto_recibido_anterior": 0,
      "monto_recibido_total": 700.50,
      "estado": "pendiente",
      "saldo_pendiente": 499.50,
      "fecha_emision": "2025-01-10",
      "servicio": "Internet 100 Mbps + TV"
    },
    {
      "id_factura": 95,
      "numero_factura": "FAC-2024-000095",
      "monto_total": 600.00,
      "monto_cobrado": 0,
      "monto_recibido_anterior": 0,
      "monto_recibido_total": 0,
      "estado": "pendiente",
      "saldo_pendiente": 600.00,
      "fecha_emision": "2024-11-20",
      "dias_vencida": 56,
      "servicio": "Internet 30 Mbps"
    }
  ],
  "cargos": [],
  "subtotal": 1500.50,
  "impuestos": 0,
  "total": 1500.50
}
```

### Campos de la Respuesta

| Campo | Descripción |
|-------|-------------|
| `id_recibo` | ID único del recibo creado |
| `numero_recibo` | Número de recibo legible (formato: REC-YYYY-NNNNNN) |
| `fecha` | Fecha del recibo en formato YYYY-MM-DD |
| `hora` | Hora del recibo en formato HH:mm:ss |
| `cliente` | Objeto con información completa del cliente |
| `usuario` | Objeto con información del usuario que procesó el cobro |
| `monto_total` | Monto total recibido |
| `metodo_pago` | Método de pago utilizado |
| `detalle_pago` | Detalles del pago (si aplica) |
| `facturas` | Array de facturas procesadas con su estado actualizado |
| `cargos` | Array de cargos adicionales |
| `subtotal` | Subtotal del recibo |
| `impuestos` | Impuestos aplicados |
| `total` | Total del recibo |

### 4. Respuestas de Error

#### Error 400 - Bad Request
Cuando faltan campos requeridos o hay datos inválidos:

```json
{
  "error": true,
  "message": "Datos incompletos o inválidos",
  "details": {
    "campo": "detalle_pago.banco",
    "descripcion": "El campo banco es requerido para pagos con transferencia"
  }
}
```

#### Error 404 - Not Found
Cuando no se encuentra un recurso:

```json
{
  "error": true,
  "message": "Cliente no encontrado",
  "id_cliente": 123
}
```

#### Error 500 - Internal Server Error
Cuando hay un error en el servidor:

```json
{
  "error": true,
  "message": "Error interno del servidor al procesar el cobro",
  "details": "Descripción técnica del error"
}
```

## Casos de Uso Específicos

### Caso 1: Pago completo de una factura con efectivo

**Payload**:
```json
{
  "id_cliente": 50,
  "monto": 950.00,
  "id_usuario": 12,
  "id_ciclo": 33,
  "id_isp": 2,
  "metodo_pago": "efectivo",
  "cargos": [],
  "facturas": [
    {
      "id_factura": 200,
      "monto_cobrado": 950.00,
      "nota": "",
      "id_ciclo": 33
    }
  ]
}
```

**Comportamiento esperado**:
- Crear recibo por $950.00
- Actualizar factura 200: `estado = "pagado"`, `monto_recibido = 950.00`, `fecha_cobrada = HOY`
- Devolver recibo con datos completos

### Caso 2: Pago parcial de una factura

**Payload**:
```json
{
  "id_cliente": 75,
  "monto": 500.00,
  "id_usuario": 8,
  "id_ciclo": 40,
  "id_isp": 3,
  "metodo_pago": "transferencia",
  "cargos": [],
  "facturas": [
    {
      "id_factura": 305,
      "monto_cobrado": 500.00,
      "nota": "",
      "id_ciclo": 40
    }
  ],
  "detalle_pago": {
    "banco": "BanReservas",
    "referencia": "TRANS-2025-9876"
  }
}
```

**Escenario**: La factura 305 tiene un `monto_total` de $1200.00 y `monto_recibido` de $0.

**Comportamiento esperado**:
- Crear recibo por $500.00
- Actualizar factura 305: `estado = "pendiente"`, `monto_recibido = 500.00`, saldo pendiente = $700.00
- Devolver recibo indicando saldo pendiente

### Caso 3: Cobro de múltiples facturas con facturas vencidas incluidas

**Payload**:
```json
{
  "id_cliente": 100,
  "monto": 1850.00,
  "id_usuario": 15,
  "id_ciclo": 45,
  "id_isp": 1,
  "metodo_pago": "cheque",
  "cargos": [],
  "facturas": [
    {
      "id_factura": 400,
      "monto_cobrado": 900.00,
      "nota": "",
      "id_ciclo": 45
    },
    {
      "id_factura": 401,
      "monto_cobrado": 950.00,
      "nota": "",
      "id_ciclo": 45
    },
    {
      "id_factura": 380,
      "monto_cobrado": 0,
      "nota": "",
      "id_ciclo": 42
    },
    {
      "id_factura": 385,
      "monto_cobrado": 0,
      "nota": "",
      "id_ciclo": 43
    }
  ],
  "detalle_pago": {
    "banco": "Banco BHD León",
    "referencia": "CHQ-5554321",
    "fecha_cheque": "2025-01-15"
  }
}
```

**Escenario**:
- Facturas 400 y 401 son las seleccionadas para cobrar
- Facturas 380 y 385 son facturas vencidas (>30 días) que se incluyen en el recibo pero no se cobran

**Comportamiento esperado**:
- Crear recibo por $1850.00
- Actualizar facturas 400 y 401 a estado `"pagado"`
- Las facturas 380 y 385 se incluyen en el recibo pero permanecen en estado `"pendiente"` sin cambios
- Devolver recibo mostrando todas las facturas (las cobradas y las vencidas pendientes)

## Notas Adicionales para el Desarrollo

1. **Transacciones de Base de Datos**:
   - El procesamiento del cobro debe ser atómico (usar transacciones)
   - Si cualquier paso falla, debe hacer rollback completo

2. **Auditoría**:
   - Registrar en log todas las operaciones de cobro con timestamp
   - Guardar el payload original recibido para auditoría

3. **Números de Recibo**:
   - El número de recibo debe ser único y secuencial por ISP
   - Formato sugerido: `REC-{YYYY}-{NNNNNN}` donde NNNNNN es un contador

4. **Fechas**:
   - Usar la fecha/hora del servidor al momento de procesar el cobro
   - Formato de fecha: `YYYY-MM-DD`
   - Formato de hora: `HH:mm:ss` (24 horas)

5. **Impresión de Recibos**:
   - El frontend usa los datos de respuesta para navegar a `ReciboScreen`
   - `ReciboScreen` permite imprimir el recibo vía Bluetooth (impresoras térmicas ESC/POS)

6. **Performance**:
   - El endpoint debe responder en menos de 3 segundos para evitar timeouts en la app móvil

## Logs de Diagnóstico Agregados

Para facilitar la depuración, se han agregado logs extensivos en el frontend con el prefijo `[COBRO]`:

- 🔵 `handleFooterPress`: Cuando se presiona "Total a recibir"
- 🟢 `confirmAndProceed`: Antes de confirmar el cobro
- 🟡 `proceedCobro`: Durante todo el proceso de cobro
- ✅ Respuesta exitosa del backend
- 🔴 Errores

**Para reproducir el problema**:
1. Ejecutar la app en modo desarrollo
2. Navegar a Cliente → Ver Facturas
3. Seleccionar facturas y presionar "Total a recibir"
4. Completar el flujo de pago
5. Revisar los logs en la consola del metro bundler

Los logs mostrarán:
- El payload exacto enviado al backend
- El status code de la respuesta
- El cuerpo de la respuesta (exitosa o de error)
- Cualquier excepción capturada

## 🔍 Diagnóstico del Problema Actual (Ejecutado 2025-01-19)

### Logs Reales Obtenidos

Hemos ejecutado el flujo de cobro y capturado los siguientes logs:

```
🟡 [COBRO] idUsuario: 1
🟡 [COBRO] clientId: 4602
🟡 [COBRO] ispId: 12
🟡 [COBRO] Facturas a cobrar (seleccionadas): [{"id_ciclo": 361180, "id_factura": 45192, "monto_cobrado": 10, "nota": ""}]
🟡 [COBRO] Facturas vencidas no seleccionadas encontradas: 60
🟡 [COBRO] Total de facturas en el array facturasToCobrar: 61
```

**Payload enviado**:
```json
{
  "id_cliente": 4602,
  "monto": 10,
  "id_usuario": 1,
  "id_ciclo": 361180,
  "facturas": [
    {
      "id_factura": 45192,
      "monto_cobrado": 10,
      "nota": "",
      "id_ciclo": 361180
    },
    // ... 60 facturas vencidas adicionales con monto_cobrado: 0
  ],
  "id_isp": 12,
  "cargos": [],
  "metodo_pago": "efectivo"
}
```

**Respuesta del backend**:
```
Status Code: 500
Status Text: (vacío)
Response Body: {"error":"Error interno del servidor"}
```

### Análisis del Error

❌ **Error 500**: El backend está fallando internamente al procesar el cobro.

#### Posibles Causas:

1. **Problema con muchas facturas**: El backend podría tener un límite o problema al procesar 61 facturas simultáneamente (1 seleccionada + 60 vencidas)

2. **Error en transacciones SQL**: Si el backend usa transacciones, podría estar fallando al intentar actualizar 61 facturas en una sola transacción

3. **Timeout de base de datos**: 61 queries UPDATE podrían estar causando un timeout

4. **Validación incorrecta**: El backend podría estar validando algo que no debería (ej: que todas las facturas tengan monto_cobrado > 0)

5. **Código incompleto**: Por el problema de control de versiones mencionado, el endpoint podría estar incompleto o con bugs

#### Recomendaciones Específicas para el Backend:

1. **Agregar logs detallados en el backend**:
   ```javascript
   console.log('Recibiendo petición de cobro:', req.body);
   console.log('Número de facturas a procesar:', req.body.facturas.length);
   ```

2. **Validar correctamente las facturas con monto_cobrado: 0**:
   - Estas facturas NO deben actualizarse en la base de datos
   - Solo deben incluirse en el recibo como referencia

3. **Usar try-catch con mensajes descriptivos**:
   ```javascript
   try {
     // Lógica de procesamiento
   } catch (error) {
     console.error('Error detallado:', error);
     return res.status(500).json({
       error: "Error al procesar cobro",
       details: error.message,  // ← MUY IMPORTANTE
       stack: error.stack        // Solo en desarrollo
     });
   }
   ```

4. **Procesar facturas en batch o filtrar las de monto 0**:
   ```javascript
   // Solo actualizar facturas con monto > 0
   const facturasACobrar = req.body.facturas.filter(f => f.monto_cobrado > 0);
   const facturasReferencia = req.body.facturas.filter(f => f.monto_cobrado === 0);
   ```

5. **Verificar límites de transacción**:
   - Asegurarse de que la base de datos permite transacciones con múltiples updates
   - Considerar aumentar el timeout de las transacciones si es necesario

### Cambios Implementados en el Frontend

✅ Se corrigió el tipo de dato de `id_isp` para enviarlo como número en lugar de string:
```javascript
id_isp: parseInt(ispId, 10)
```

### Siguiente Paso Recomendado

Para el equipo de backend:

1. **Revisar los logs del servidor** al momento del error 500 para ver el stack trace completo
2. **Agregar manejo de errores más descriptivo** que indique exactamente qué está fallando
3. **Testear con un caso simple primero**: 1 factura con monto_cobrado > 0 sin facturas vencidas
4. **Luego testear con facturas vencidas**: Asegurarse de que las facturas con monto_cobrado: 0 se manejan correctamente

## Contacto y Soporte

Si necesitas más información sobre el flujo o tienes preguntas sobre casos edge, revisar:
- Código frontend: `src/pantallas/cliente/ClienteFacturasScreen.tsx`
- Función `proceedCobro` (línea 974) para ver toda la lógica de construcción del payload

---

**Última actualización**: 2025-01-19
**Versión**: 1.0
**Autor**: Equipo de Desarrollo WellNet ISP
