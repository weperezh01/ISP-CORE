# REQUERIMIENTOS DE INTEGRACIÓN BACKEND - SISTEMA DE PAGOS

## 🎯 ENDPOINTS CRÍTICOS QUE NECESITAN IMPLEMENTACIÓN INMEDIATA

### 1. 🔐 **Health Check Endpoint**
**PRIORIDAD: ALTA**
```http
GET /api/health
Authorization: Bearer {token}
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### 2. 💳 **Métodos de Pago del Usuario**
**PRIORIDAD: ALTA**
```http
POST /api/usuarios/metodos-pago
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "id_usuario": 123
}
```
**Response:**
```json
[
  {
    "id": "pm_1234567890",
    "nombre": "Visa **** 4242",
    "tipo": "tarjeta",
    "numero": "4242424242424242",
    "activo": true,
    "created_at": "2024-01-15T10:30:00Z",
    "expires_at": "2025-12-31"
  },
  {
    "id": "paypal_user123",
    "nombre": "PayPal Account",
    "tipo": "paypal",
    "email_paypal": "user@example.com",
    "activo": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### 3. 💰 **Procesamiento de Pagos con Tarjeta**
**PRIORIDAD: CRÍTICA**
```http
POST /api/pagos/procesar-pago-tarjeta
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "id_usuario": 123,
  "id_metodo_pago": "pm_1234567890",
  "monto": 1700.00,
  "descripcion": "Pago de factura #WTL-2025-07-0012 - Well Net",
  "id_factura": 456,
  "invoice_number": "WTL-2025-07-0012",
  "id_isp": 12,
  "currency": "USD",
  "payment_type": "invoice_payment",
  "metadata": {
    "due_date": "2025-08-17",
    "isp_name": "Well Net",
    "processed_from": "mobile_app"
  }
}
```
**Response exitosa:**
```json
{
  "success": true,
  "message": "Pago procesado exitosamente",
  "data": {
    "transaccion_id": "txn_1234567890abcdef",
    "monto": 1700.00,
    "moneda": "USD",
    "estado": "completed",
    "fecha_procesamiento": "2024-01-15T10:30:00Z",
    "gateway_response": {
      "stripe_payment_intent": "pi_1234567890",
      "last4": "4242",
      "brand": "visa"
    }
  }
}
```
**Response de error:**
```json
{
  "success": false,
  "message": "Tarjeta declinada",
  "error": "card_declined",
  "error_code": "insufficient_funds"
}
```

### 4. 🟡 **Procesamiento de Pagos con PayPal**
**PRIORIDAD: CRÍTICA**
```http
POST /api/pagos/procesar-pago-paypal
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:** (mismo formato que tarjeta)
**Response:** (mismo formato que tarjeta)

### 5. 📋 **Actualización de Estado de Factura**
**PRIORIDAD: ALTA**
```http
POST /api/isp-owner/invoices/update-status
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "invoice_id": 456,
  "status": "paid",
  "updated_by": 123,
  "payment_reference": "txn_1234567890abcdef"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Estado de factura actualizado",
  "data": {
    "invoice_id": 456,
    "old_status": "pending",
    "new_status": "paid",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 6. 📊 **Historial de Transacciones**
**PRIORIDAD: MEDIA**
```http
POST /api/billing/transaction-history
Authorization: Bearer {token}
Content-Type: application/json
```
**Request:**
```json
{
  "isp_id": 12,
  "period_days": 30
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "date": "2024-01-15",
        "amount": 1700.00,
        "transaction_count": 5
      },
      {
        "date": "2024-01-14",
        "amount": 2400.00,
        "transaction_count": 8
      }
    ],
    "total_revenue": 12500.00,
    "transaction_count": 45,
    "period_start": "2023-12-15",
    "period_end": "2024-01-15"
  }
}
```

## 🗄️ ESTRUCTURA DE BASE DE DATOS RECOMENDADA

### **Tabla: payment_methods**
```sql
CREATE TABLE payment_methods (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('tarjeta', 'paypal', 'cuenta') NOT NULL,
    card_number VARCHAR(20), -- últimos 4 dígitos
    card_brand VARCHAR(20),
    paypal_email VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    gateway_reference VARCHAR(100), -- ID en Stripe/PayPal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **Tabla: transactions**
```sql
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    payment_method_id VARCHAR(50),
    invoice_id INT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL,
    gateway VARCHAR(20) NOT NULL, -- 'stripe', 'paypal'
    gateway_transaction_id VARCHAR(100),
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
```

### **Tabla: invoice_payments**
```sql
CREATE TABLE invoice_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    transaction_id VARCHAR(50) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);
```

### **Actualización tabla: invoices**
```sql
ALTER TABLE invoices 
ADD COLUMN payment_status ENUM('unpaid', 'partial', 'paid', 'overpaid') DEFAULT 'unpaid',
ADD COLUMN last_payment_date TIMESTAMP NULL,
ADD COLUMN total_paid DECIMAL(10,2) DEFAULT 0.00;
```

## 🔧 CONFIGURACIÓN DE GATEWAYS DE PAGO

### **Stripe Configuration**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function processCardPayment(paymentData) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentData.monto * 100), // centavos
      currency: paymentData.currency.toLowerCase(),
      payment_method: paymentData.id_metodo_pago,
      confirm: true,
      description: paymentData.descripcion,
      metadata: {
        invoice_id: paymentData.id_factura.toString(),
        user_id: paymentData.id_usuario.toString(),
        isp_id: paymentData.id_isp.toString()
      }
    });

    return {
      success: true,
      transactionId: paymentIntent.id,
      status: paymentIntent.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
}
```

### **PayPal Configuration**
```javascript
const paypal = require('@paypal/checkout-server-sdk');

// Configuración del ambiente
const environment = process.env.NODE_ENV === 'production' 
  ? new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID, 
      process.env.PAYPAL_CLIENT_SECRET
    )
  : new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID, 
      process.env.PAYPAL_CLIENT_SECRET
    );

const client = new paypal.core.PayPalHttpClient(environment);
```

## 🚨 MANEJO DE ERRORES CRÍTICOS

### **Códigos de Error Esperados por el Frontend**
```javascript
const ERROR_CODES = {
  // Errores de tarjeta
  'card_declined': 'Tarjeta declinada por el banco',
  'insufficient_funds': 'Fondos insuficientes',
  'invalid_card': 'Información de tarjeta inválida',
  'expired_card': 'Tarjeta expirada',
  
  // Errores de PayPal
  'paypal_insufficient_funds': 'Fondos insuficientes en PayPal',
  'paypal_account_restricted': 'Cuenta PayPal restringida',
  
  // Errores del sistema
  'gateway_timeout': 'Timeout del procesador de pagos',
  'invalid_amount': 'Monto inválido',
  'invoice_already_paid': 'Factura ya está pagada',
  'user_not_found': 'Usuario no encontrado',
  'payment_method_not_found': 'Método de pago no encontrado'
};
```

## 📝 LOGGING REQUERIDO

### **Eventos Críticos a Loggear**
1. **Intento de pago iniciado**
2. **Método de pago validado**
3. **Request enviado al gateway**
4. **Respuesta recibida del gateway**
5. **Estado de factura actualizado**
6. **Pago completado/fallado**

### **Formato de Log Recomendado**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "event": "payment_processed",
  "user_id": 123,
  "invoice_id": 456,
  "transaction_id": "txn_1234567890",
  "amount": 1700.00,
  "gateway": "stripe",
  "status": "completed",
  "processing_time_ms": 1250
}
```

## 🔒 SEGURIDAD Y VALIDACIONES

### **Validaciones Obligatorias**
1. **Token JWT válido y no expirado**
2. **Usuario existe y está activo**
3. **Método de pago pertenece al usuario**
4. **Factura existe y está pendiente**
5. **Monto coincide con el total de la factura**
6. **ISP del usuario coincide con ISP de la factura**

### **Rate Limiting Recomendado**
- **Pagos**: 3 intentos por minuto por usuario
- **Métodos de pago**: 10 requests por minuto por usuario
- **Historial**: 20 requests por minuto por usuario

## ⚡ WEBHOOKS RECOMENDADOS

### **Stripe Webhooks**
```javascript
// payment_intent.succeeded
// payment_intent.payment_failed
// charge.dispute.created
```

### **PayPal Webhooks**
```javascript
// PAYMENT.CAPTURE.COMPLETED
// PAYMENT.CAPTURE.DENIED
// BILLING.SUBSCRIPTION.CANCELLED
```

## 🧪 TESTING

### **Casos de Prueba Críticos**
1. **Pago exitoso con tarjeta válida**
2. **Pago fallido con tarjeta declinada**
3. **Pago exitoso con PayPal**
4. **Actualización correcta de estado de factura**
5. **Manejo de timeouts**
6. **Validación de tokens expirados**
7. **Prevención de doble pago**

---

## 🚀 PLAN DE IMPLEMENTACIÓN SUGERIDO

### **Fase 1: Endpoints Básicos (1-2 días)**
- [ ] Health check
- [ ] Métodos de pago
- [ ] Estructura básica de DB

### **Fase 2: Procesamiento Core (3-4 días)**
- [ ] Stripe integration
- [ ] Actualización de facturas
- [ ] Logging básico

### **Fase 3: PayPal y Robustez (2-3 días)**
- [ ] PayPal integration
- [ ] Error handling completo
- [ ] Rate limiting

### **Fase 4: Analytics y Optimización (1-2 días)**
- [ ] Historial de transacciones
- [ ] Webhooks
- [ ] Monitoring avanzado

**TOTAL ESTIMADO: 7-11 días de desarrollo**

---

**⚠️ NOTA IMPORTANTE:** El frontend ya está 100% implementado y probado con datos demo. Una vez que estos endpoints estén listos, el sistema estará completamente funcional en producción.