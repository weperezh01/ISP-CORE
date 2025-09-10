# Solicitud Backend: Detalles de Pago en Recibos

Hola Claude,

Desde el frontend ya capturamos el método de pago al cobrar facturas del cliente y, cuando aplica, datos opcionales para transferencias/cheques. Necesitamos que el backend persista estos datos y que los endpoints los acepten y devuelvan.

## Contexto actual

- Endpoint de cobro en uso: `POST /api/facturas-procesar-cobro`.
- Payload base actual (resumen):
  - `id_cliente: number`
  - `monto: number`
  - `id_usuario: number`
  - `id_ciclo: number`
  - `id_isp: number`
  - `facturas: Array<{ id_factura: number, monto_cobrado: number, nota?: string }>`
  - `cargos: Array` (opcional)

## Nuevos campos (frontend ya los envía)

- `metodo_pago`: string (uno de: `efectivo`, `transferencia`, `cheque`)
- `detalle_pago`: object (opcional; presente cuando `metodo_pago` ≠ `efectivo`)
  - `banco`: string (requerido para transferencia/cheque)
  - `referencia`: string (requerido para transferencia/cheque). En cheque es el número de cheque.
  - `cuenta_destino`: string (opcional)
  - `titular`: string (opcional)
  - `fecha_cheque`: string (opcional; formato `YYYY-MM-DD`, sólo para `cheque`)
  - `nota`: string (opcional)

Ejemplo payload extendido:

```json
{
  "id_cliente": 7676,
  "monto": 2500.00,
  "id_usuario": 2,
  "id_ciclo": 897,
  "id_isp": 12,
  "facturas": [
    { "id_factura": 44432, "monto_cobrado": 1500.00 },
    { "id_factura": 44433, "monto_cobrado": 1000.00 }
  ],
  "cargos": [],
  "metodo_pago": "transferencia",
  "detalle_pago": {
    "banco": "Banco Popular",
    "referencia": "TRX-2025-000123",
    "cuenta_destino": "012-3456789-0",
    "titular": "Wellnet RD, SRL",
    "nota": "Pago vía app móvil"
  }
}
```

Para cheque:

```json
{
  "metodo_pago": "cheque",
  "detalle_pago": {
    "banco": "BHD",
    "referencia": "CHQ-00098765",
    "titular": "Wellnet RD, SRL",
    "fecha_cheque": "2025-09-10"
  }
}
```

Si el frontend no envía `metodo_pago`, asumir `efectivo` para compatibilidad retro.

## Diseño de base de datos (opciones)

### Opción A (rápida): columnas en `recibos`

- Agregar a `recibos`:
  - `metodo_pago VARCHAR(32) NOT NULL DEFAULT 'efectivo'`
  - `pago_banco VARCHAR(100) NULL`
  - `pago_referencia VARCHAR(100) NULL`
  - `pago_cuenta_destino VARCHAR(64) NULL`
  - `pago_titular VARCHAR(120) NULL`
  - `pago_fecha_cheque DATE NULL`
  - `pago_nota VARCHAR(500) NULL`

Pro:
- Simple y directo. Fácil de incluir en reportes rápidos.

Contra:
- Menos flexible si luego añadimos otros métodos/campos.

### Opción B (recomendada): tabla `recibo_payment_details`

Tabla nueva, 1:1 con `recibos`:

```sql
CREATE TABLE recibo_payment_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_recibo INT NOT NULL,
  metodo_pago VARCHAR(32) NOT NULL, -- efectivo | transferencia | cheque | tarjeta | etc.
  banco VARCHAR(100) NULL,
  referencia VARCHAR(100) NULL,
  cuenta_destino VARCHAR(64) NULL,
  titular VARCHAR(120) NULL,
  fecha_cheque DATE NULL,
  nota VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recibo_payment_details_recibo FOREIGN KEY (id_recibo) REFERENCES recibos(id_recibo)
);

CREATE INDEX idx_recibo_payment_details_recibo ON recibo_payment_details (id_recibo);
CREATE INDEX idx_recibo_payment_details_ref ON recibo_payment_details (referencia);
```

Pro:
- Escalable, extensible a más métodos (tarjeta, PayPal, etc.).
- No contamina `recibos` con muchas columnas opcionales.

Contra:
- Requiere join adicional en consultas detalladas del recibo.

### Opción C (granular): tablas separadas `recibo_transferencias`, `recibo_cheques`

Pro:
- Validación por tipo a nivel de esquema.

Contra:
- Más tablas/joins y duplicación de columnas comunes.

Recomendación: Opción B.

## Cambios de API

1) `POST /api/facturas-procesar-cobro`
- Aceptar `metodo_pago` y `detalle_pago` como se describió.
- Validaciones:
  - Si `metodo_pago` ∈ {transferencia, cheque} ⇒ exigir `detalle_pago.banco` y `detalle_pago.referencia` (no vacíos, longitud máxima 100).
  - `fecha_cheque` (si llega) en formato `YYYY-MM-DD` válido.
  - Longitudes máximas: banco(100), referencia(100), cuenta_destino(64), titular(120), nota(500).
- Persistencia:
  - Crear el `recibo` como hoy.
  - Insertar en `recibo_payment_details` con `id_recibo` y los campos.
- Respuesta: incluir `metodo_pago` en la raíz del objeto `recibo` y un nodo `detalle_pago` (o anidarlo en `recibo.detalle_pago`).

2) `POST /api/facturas/consulta-recibo-id` (y alias de compatibilidad)
- Devolver los detalles si existen. Ejemplo:

```json
{
  "recibo": {
    "id_recibo": 1234,
    "monto": 2500.00,
    "fecha_formateada": "2025-09-10",
    "hora_formateada": "12:34 PM",
    "metodo_pago": "transferencia",
    "detalle_pago": {
      "banco": "Banco Popular",
      "referencia": "TRX-2025-000123",
      "cuenta_destino": "012-3456789-0",
      "titular": "Wellnet RD, SRL",
      "nota": "Pago vía app móvil"
    }
  },
  "cliente": { ... },
  "facturas": [ ... ]
}
```

## Compatibilidad

- Si el frontend antiguo no envía `metodo_pago`, asumir `efectivo` y no crear registro en detalles (o crearlo con `metodo_pago='efectivo'`).

## Seguridad y consistencia

- Sanitizar entradas de texto (trim, longitud máxima, caracteres permitidos opcionalmente).
- Considerar `UNIQUE (id_isp, referencia)` en transferencias/cheques si la referencia debe ser única por ISP (opcional; confirmar reglas de negocio).
- Registrar `id_usuario` en la fila de detalles si desean auditoría más granular.

## Migración sugerida (opción B)

```sql
-- Tabla de detalles de pago
CREATE TABLE IF NOT EXISTS recibo_payment_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_recibo INT NOT NULL,
  metodo_pago VARCHAR(32) NOT NULL,
  banco VARCHAR(100) NULL,
  referencia VARCHAR(100) NULL,
  cuenta_destino VARCHAR(64) NULL,
  titular VARCHAR(120) NULL,
  fecha_cheque DATE NULL,
  nota VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recibo_payment_details_recibo FOREIGN KEY (id_recibo) REFERENCES recibos(id_recibo)
);
CREATE INDEX IF NOT EXISTS idx_recibo_payment_details_recibo ON recibo_payment_details (id_recibo);
CREATE INDEX IF NOT EXISTS idx_recibo_payment_details_ref ON recibo_payment_details (referencia);
```

## Checklist de implementación

- [ ] Agregar tabla `recibo_payment_details` (o columnas en `recibos`).
- [ ] Actualizar servicio de cobro para guardar método y detalles.
- [ ] Validar payload según reglas anteriores.
- [ ] Ajustar respuestas para incluir `metodo_pago` y `detalle_pago`.
- [ ] Actualizar `consulta-recibo-id` para devolver los detalles.
- [ ] Probar con casos: efectivo, transferencia con y sin opcionales, cheque con fecha.

Gracias, cualquier duda nos dices y ajustamos el frontend.

