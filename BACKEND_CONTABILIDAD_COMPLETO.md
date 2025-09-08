# 💼 BACKEND COMPLETO - SISTEMA DE SUSCRIPCIÓN Y GESTIÓN DE PLANES DE CONTABILIDAD

## 📋 **REQUERIMIENTO COMPLETO:**

Implementar un sistema dual para servicios de contabilidad:

1. **🔧 GESTIÓN DE PLANES** - Para MEGA ADMINISTRADORES crear/editar planes
2. **💼 SUSCRIPCIÓN** - Para ISPs suscribirse y pagar mensualmente por contabilidad

## 🎯 **FUNCIONALIDAD DUAL REQUERIDA:**

### **PARTE 1: Gestión de Planes (Admin)**
Los MEGA ADMINISTRADORES pueden:
- ✅ **Crear** nuevos planes de contabilidad
- ✅ **Editar** planes existentes (precios, límites, características)
- ✅ **Activar/Desactivar** planes
- ✅ **Eliminar** planes no utilizados
- ✅ **Marcar** planes como "recomendados"

### **PARTE 2: Suscripción (ISPs)**
Los ISPs pueden:
- ✅ **Ver** planes disponibles con precios
- ✅ **Suscribirse** a un plan específico
- ✅ **Cambiar** de plan cuando necesiten
- ✅ **Monitorear** su uso mensual de transacciones
- ✅ **Recibir facturación** automática mensual

## 🗄️ **1. ESTRUCTURA DE BASE DE DATOS COMPLETA:**

### **Tabla: `accounting_plans` (Planes Administrables)**

```sql
CREATE TABLE accounting_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    transaction_limit INT NULL, -- NULL = ilimitado
    price_per_transaction DECIMAL(5,2) DEFAULT 0.00,
    features JSON,
    active BOOLEAN DEFAULT TRUE,
    recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para optimización
    INDEX idx_active (active),
    INDEX idx_recommended (recommended),
    INDEX idx_price (price)
);
```

### **Datos Iniciales REQUERIDOS:**
```sql
-- IMPORTANTE: Insertar estos planes exactos en la base de datos
INSERT INTO accounting_plans (id, name, price, transaction_limit, price_per_transaction, features, active, recommended) VALUES

('contabilidad_basico', 'Contabilidad Básica', 250.00, 100, 0.50, 
 JSON_ARRAY(
   'Facturación mensual',
   'Estados financieros básicos', 
   'Conciliación bancaria',
   'Hasta 100 transacciones/mes',
   'Soporte por email',
   'Backup automático'
 ), TRUE, FALSE),

('contabilidad_profesional', 'Contabilidad Profesional', 500.00, 500, 0.35,
 JSON_ARRAY(
   'Todo lo del plan básico',
   'Análisis de rentabilidad',
   'Reportes de cobranza', 
   'Control de inventario',
   'Hasta 500 transacciones/mes',
   'Dashboard avanzado',
   'Soporte telefónico',
   'Reportes personalizados'
 ), TRUE, TRUE),

('contabilidad_enterprise', 'Contabilidad Enterprise', 1200.00, NULL, 0.25,
 JSON_ARRAY(
   'Todo lo del plan profesional',
   'Transacciones ilimitadas',
   'Dashboard ejecutivo en tiempo real',
   'Análisis predictivo financiero', 
   'Gestión multi-ISP',
   'Soporte 24/7',
   'Consultoría mensual incluida',
   'API personalizada',
   'Auditoría trimestral'
 ), TRUE, FALSE);
```

### **Tabla: `accounting_subscriptions` (Suscripciones de ISPs)**

```sql
CREATE TABLE accounting_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isp_id INT NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    status ENUM('active', 'suspended', 'cancelled', 'trial') DEFAULT 'trial',
    start_date DATE NOT NULL,
    end_date DATE,
    next_billing_date DATE NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    transaction_limit INT NULL, -- NULL = ilimitado
    transactions_used INT DEFAULT 0,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (isp_id) REFERENCES isps(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES accounting_plans(id) ON UPDATE CASCADE,
    
    -- Índices
    INDEX idx_isp_status (isp_id, status),
    INDEX idx_billing_date (next_billing_date),
    INDEX idx_plan_id (plan_id)
);
```

### **Tabla: `accounting_billing_history` (Historial de Facturación)**

```sql
CREATE TABLE accounting_billing_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT NOT NULL,
    isp_id INT NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    overage_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    transactions_included INT,
    transactions_used INT,
    overage_transactions INT DEFAULT 0,
    status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    payment_method VARCHAR(50),
    invoice_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (subscription_id) REFERENCES accounting_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (isp_id) REFERENCES isps(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_subscription (subscription_id),
    INDEX idx_billing_period (billing_period_start, billing_period_end),
    INDEX idx_status (status)
);
```

### **Tabla: `accounting_transaction_logs` (Log de Uso)**

```sql
CREATE TABLE accounting_transaction_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isp_id INT NOT NULL,
    subscription_id INT NOT NULL,
    transaction_type ENUM('journal_entry', 'report_generation', 'balance_sheet', 'income_statement', 'api_call') NOT NULL,
    description TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (isp_id) REFERENCES isps(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES accounting_subscriptions(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_isp_date (isp_id, logged_at),
    INDEX idx_subscription (subscription_id),
    INDEX idx_type (transaction_type)
);
```

## 🔗 **2. ENDPOINTS COMPLETOS REQUERIDOS:**

### **PARTE A: GESTIÓN DE PLANES (Para Administradores)**

#### **A1. Listar Todos los Planes**
```
GET /api/accounting-plans
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contabilidad_basico",
      "name": "Contabilidad Básica",
      "price": 250.00,
      "transaction_limit": 100,
      "price_per_transaction": 0.50,
      "features": [
        "Facturación mensual",
        "Estados financieros básicos",
        "Conciliación bancaria",
        "Hasta 100 transacciones/mes",
        "Soporte por email",
        "Backup automático"
      ],
      "active": true,
      "recommended": false,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "contabilidad_profesional", 
      "name": "Contabilidad Profesional",
      "price": 500.00,
      "transaction_limit": 500,
      "price_per_transaction": 0.35,
      "features": [
        "Todo lo del plan básico",
        "Análisis de rentabilidad",
        "Reportes de cobranza",
        "Control de inventario",
        "Hasta 500 transacciones/mes",
        "Dashboard avanzado",
        "Soporte telefónico",
        "Reportes personalizados"
      ],
      "active": true,
      "recommended": true,
      "created_at": "2024-01-15T10:35:00.000Z",
      "updated_at": "2024-01-15T10:35:00.000Z"
    },
    {
      "id": "contabilidad_enterprise",
      "name": "Contabilidad Enterprise", 
      "price": 1200.00,
      "transaction_limit": null,
      "price_per_transaction": 0.25,
      "features": [
        "Todo lo del plan profesional",
        "Transacciones ilimitadas",
        "Dashboard ejecutivo en tiempo real",
        "Análisis predictivo financiero",
        "Gestión multi-ISP",
        "Soporte 24/7",
        "Consultoría mensual incluida",
        "API personalizada",
        "Auditoría trimestral"
      ],
      "active": true,
      "recommended": false,
      "created_at": "2024-01-15T10:40:00.000Z",
      "updated_at": "2024-01-15T10:40:00.000Z"
    }
  ],
  "message": "Planes de contabilidad obtenidos exitosamente"
}
```

#### **A2. Crear Nuevo Plan**
```
POST /api/accounting-plans
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "id": "contabilidad_premium",
  "name": "Contabilidad Premium",
  "price": 800.00,
  "transaction_limit": 1000,
  "price_per_transaction": 0.30,
  "features": [
    "Análisis avanzado",
    "Reportes en tiempo real",
    "Soporte prioritario"
  ],
  "active": true,
  "recommended": false
}
```

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "id": "contabilidad_premium",
    "name": "Contabilidad Premium",
    "price": 800.00,
    "transaction_limit": 1000,
    "price_per_transaction": 0.30,
    "features": [
      "Análisis avanzado",
      "Reportes en tiempo real", 
      "Soporte prioritario"
    ],
    "active": true,
    "recommended": false,
    "created_at": "2024-01-15T14:20:00.000Z",
    "updated_at": "2024-01-15T14:20:00.000Z"
  },
  "message": "Plan de contabilidad creado exitosamente"
}
```

#### **A3. Actualizar Plan Existente**
```
PUT /api/accounting-plans/{plan_id}
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Contabilidad Básica Plus",
  "price": 299.00,
  "transaction_limit": 150,
  "price_per_transaction": 0.45,
  "features": [
    "Facturación mensual mejorada",
    "Estados financieros básicos",
    "Conciliación bancaria automática",
    "Hasta 150 transacciones/mes",
    "Soporte por email y chat",
    "Backup automático diario"
  ],
  "active": true,
  "recommended": true
}
```

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "id": "contabilidad_basico",
    "name": "Contabilidad Básica Plus",
    "price": 299.00,
    "transaction_limit": 150,
    "price_per_transaction": 0.45,
    "features": [
      "Facturación mensual mejorada",
      "Estados financieros básicos",
      "Conciliación bancaria automática",
      "Hasta 150 transacciones/mes",
      "Soporte por email y chat",
      "Backup automático diario"
    ],
    "active": true,
    "recommended": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T16:45:00.000Z"
  },
  "message": "Plan de contabilidad actualizado exitosamente"
}
```

#### **A4. Eliminar Plan**
```
DELETE /api/accounting-plans/{plan_id}
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response exitosa:**
```json
{
  "success": true,
  "message": "Plan de contabilidad eliminado exitosamente"
}
```

### **PARTE B: SUSCRIPCIÓN (Para ISPs)**

#### **B1. Listar Planes Disponibles para ISPs**
```
GET /api/accounting-subscription/plans
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contabilidad_basico",
      "name": "Contabilidad Básica",
      "price": 250.00,
      "transaction_limit": 100,
      "price_per_transaction": 0.50,
      "features": [
        "Facturación mensual",
        "Estados financieros básicos",
        "Conciliación bancaria",
        "Hasta 100 transacciones/mes",
        "Soporte por email",
        "Backup automático"
      ],
      "recommended": false
    },
    {
      "id": "contabilidad_profesional",
      "name": "Contabilidad Profesional", 
      "price": 500.00,
      "transaction_limit": 500,
      "price_per_transaction": 0.35,
      "features": [
        "Todo lo del plan básico",
        "Análisis de rentabilidad",
        "Reportes de cobranza",
        "Control de inventario",
        "Hasta 500 transacciones/mes",
        "Dashboard avanzado",
        "Soporte telefónico",
        "Reportes personalizados"
      ],
      "recommended": true
    },
    {
      "id": "contabilidad_enterprise",
      "name": "Contabilidad Enterprise",
      "price": 1200.00,
      "transaction_limit": null,
      "price_per_transaction": 0.25,
      "features": [
        "Todo lo del plan profesional",
        "Transacciones ilimitadas",
        "Dashboard ejecutivo en tiempo real",
        "Análisis predictivo financiero",
        "Gestión multi-ISP",
        "Soporte 24/7",
        "Consultoría mensual incluida",
        "API personalizada",
        "Auditoría trimestral"
      ],
      "recommended": false
    }
  ],
  "message": "Planes disponibles obtenidos exitosamente"
}
```

#### **B2. Estado de Suscripción del ISP**
```
GET /api/accounting-subscription/status?isp_id={isp_id}
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": 1,
    "planId": "contabilidad_profesional",
    "planName": "Contabilidad Profesional",
    "status": "active",
    "monthlyPrice": 500.00,
    "transactionLimit": 500,
    "transactionsUsed": 342,
    "usagePercentage": 68.4,
    "nextBillingDate": "2024-02-01",
    "daysUntilRenewal": 12,
    "isActive": true
  },
  "message": "Estado de suscripción obtenido exitosamente"
}
```

#### **B3. Crear/Actualizar Suscripción**
```
POST /api/accounting-subscription/upgrade
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "isp_id": 1,
  "plan_id": "contabilidad_enterprise"
}
```

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": 1,
    "planId": "contabilidad_enterprise",
    "status": "active",
    "nextBillingDate": "2024-02-01",
    "prorationAmount": 233.33,
    "newMonthlyPrice": 1200.00
  },
  "message": "Suscripción actualizada exitosamente"
}
```

#### **B4. Uso Mensual de Contabilidad**
```
GET /api/accounting-usage/monthly?isp_id={isp_id}
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "transactionsUsed": 342,
    "reportsGenerated": 28,
    "lastActivity": "2024-01-25T14:30:00.000Z",
    "monthlyBreakdown": {
      "journal_entries": 245,
      "reports": 28,
      "api_calls": 69
    }
  },
  "message": "Datos de uso obtenidos exitosamente"
}
```

#### **B5. Registrar Transacción Contable**
```
POST /api/accounting-usage/log
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "isp_id": 1,
  "transaction_type": "journal_entry",
  "description": "Registro de ingresos por servicios de internet"
}
```

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "logId": 1234,
    "transactionsUsed": 343,
    "transactionLimit": 500,
    "remainingTransactions": 157,
    "overageWarning": false
  },
  "message": "Transacción registrada exitosamente"
}
```

#### **B6. Historial de Facturación**
```
GET /api/accounting-billing/history?isp_id={isp_id}
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "billingPeriod": "2024-01-01 - 2024-01-31",
      "baseAmount": 500.00,
      "overageAmount": 0,
      "totalAmount": 500.00,
      "transactionsIncluded": 500,
      "transactionsUsed": 342,
      "status": "paid",
      "paymentDate": "2024-01-31T23:59:59.000Z",
      "invoiceNumber": "ACC-2024-001"
    }
  ],
  "message": "Historial de facturación obtenido exitosamente"
}
```

## 🔧 **3. IMPLEMENTACIÓN REQUERIDA:**

### **Archivo: `routes/accountingPlans.js` (Para Gestión de Planes)**

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken, requireMegaAdmin } = require('../middleware/auth');
const {
    getAllPlans,
    createPlan,
    updatePlan,
    deletePlan
} = require('../controllers/accountingPlansController');

// Middleware de autenticación y autorización para todas las rutas
router.use(authenticateToken);
router.use(requireMegaAdmin); // Solo MEGA ADMINISTRADORES

// Rutas CRUD para gestión de planes
router.get('/', getAllPlans);           // GET /api/accounting-plans
router.post('/', createPlan);           // POST /api/accounting-plans
router.put('/:planId', updatePlan);     // PUT /api/accounting-plans/contabilidad_basico
router.delete('/:planId', deletePlan);  // DELETE /api/accounting-plans/contabilidad_basico

module.exports = router;
```

### **Archivo: `routes/accountingSubscription.js` (Para Suscripciones)**

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getAvailablePlans,
    getSubscriptionStatus,
    upgradeSubscription,
    getMonthlyUsage,
    logTransaction,
    getBillingHistory,
    processMonthlyBilling
} = require('../controllers/accountingSubscriptionController');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas de planes disponibles
router.get('/plans', getAvailablePlans);             // GET /api/accounting-subscription/plans

// Rutas de suscripción
router.get('/status', getSubscriptionStatus);        // GET /api/accounting-subscription/status?isp_id=1
router.post('/upgrade', upgradeSubscription);        // POST /api/accounting-subscription/upgrade

// Rutas de uso
router.get('/usage/monthly', getMonthlyUsage);       // GET /api/accounting-usage/monthly?isp_id=1
router.post('/usage/log', logTransaction);           // POST /api/accounting-usage/log

// Rutas de facturación
router.get('/billing/history', getBillingHistory);   // GET /api/accounting-billing/history?isp_id=1

// Ruta administrativa (solo para procesamiento automático)
router.post('/billing/process', processMonthlyBilling); // POST /api/accounting-subscription/billing/process

module.exports = router;
```

## 🔗 **4. REGISTRO DE RUTAS COMPLETO:**

### **Archivo: `app.js` o `server.js`**

```javascript
// Importar rutas de contabilidad
const accountingPlansRoutes = require('./routes/accountingPlans');
const accountingSubscriptionRoutes = require('./routes/accountingSubscription');

// Registrar rutas
app.use('/api/accounting-plans', accountingPlansRoutes);           // Para gestión de planes
app.use('/api/accounting-subscription', accountingSubscriptionRoutes); // Para suscripciones
app.use('/api/accounting-usage', accountingSubscriptionRoutes);         // Para uso y logs
app.use('/api/accounting-billing', accountingSubscriptionRoutes);       // Para facturación
```

## 🧪 **5. TESTING COMPLETO DE ENDPOINTS:**

### **Gestión de Planes (Admin):**

```bash
# A1. Listar todos los planes
curl -X GET "https://wellnet-rd.com:444/api/accounting-plans" \
  -H "Authorization: Bearer MEGA_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# A2. Crear nuevo plan
curl -X POST "https://wellnet-rd.com:444/api/accounting-plans" \
  -H "Authorization: Bearer MEGA_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "contabilidad_premium",
    "name": "Contabilidad Premium",
    "price": 800.00,
    "transaction_limit": 1000,
    "price_per_transaction": 0.30,
    "features": ["Análisis avanzado", "Reportes en tiempo real"],
    "active": true,
    "recommended": false
  }'

# A3. Actualizar plan existente
curl -X PUT "https://wellnet-rd.com:444/api/accounting-plans/contabilidad_basico" \
  -H "Authorization: Bearer MEGA_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contabilidad Básica Plus",
    "price": 299.00,
    "transaction_limit": 150
  }'

# A4. Eliminar plan
curl -X DELETE "https://wellnet-rd.com:444/api/accounting-plans/contabilidad_premium" \
  -H "Authorization: Bearer MEGA_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### **Suscripción (ISPs):**

```bash
# B1. Ver planes disponibles
curl -X GET "https://wellnet-rd.com:444/api/accounting-subscription/plans" \
  -H "Authorization: Bearer ISP_TOKEN" \
  -H "Content-Type: application/json"

# B2. Ver estado de suscripción
curl -X GET "https://wellnet-rd.com:444/api/accounting-subscription/status?isp_id=1" \
  -H "Authorization: Bearer ISP_TOKEN" \
  -H "Content-Type: application/json"

# B3. Crear/actualizar suscripción
curl -X POST "https://wellnet-rd.com:444/api/accounting-subscription/upgrade" \
  -H "Authorization: Bearer ISP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isp_id": 1,
    "plan_id": "contabilidad_profesional"
  }'

# B4. Ver uso mensual
curl -X GET "https://wellnet-rd.com:444/api/accounting-usage/monthly?isp_id=1" \
  -H "Authorization: Bearer ISP_TOKEN" \
  -H "Content-Type: application/json"

# B5. Registrar transacción
curl -X POST "https://wellnet-rd.com:444/api/accounting-usage/log" \
  -H "Authorization: Bearer ISP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isp_id": 1,
    "transaction_type": "journal_entry",
    "description": "Registro contable"
  }'
```

## 📊 **6. DATOS DE EJEMPLO PARA TESTING:**

### **Suscripciones de ejemplo:**
```sql
-- Después de crear los planes, insertar suscripciones de ejemplo
INSERT INTO accounting_subscriptions (isp_id, plan_id, status, start_date, next_billing_date, monthly_price, transaction_limit) VALUES
(1, 'contabilidad_profesional', 'active', '2024-01-01', '2024-02-01', 500.00, 500),
(2, 'contabilidad_basico', 'active', '2024-01-15', '2024-02-15', 250.00, 100),
(3, 'contabilidad_enterprise', 'trial', '2024-01-20', '2024-02-20', 1200.00, NULL);
```

### **Historial de facturación de ejemplo:**
```sql
INSERT INTO accounting_billing_history (subscription_id, isp_id, billing_period_start, billing_period_end, base_amount, total_amount, transactions_included, transactions_used, status, invoice_number) VALUES
(1, 1, '2024-01-01', '2024-01-31', 500.00, 500.00, 500, 342, 'paid', 'ACC-2024-001'),
(2, 2, '2024-01-15', '2024-02-14', 250.00, 250.00, 100, 78, 'paid', 'ACC-2024-002');
```

## 🎯 **7. CARACTERÍSTICAS CRÍTICAS A IMPLEMENTAR:**

✅ **Seguridad Dual:**
- Gestión de planes: Solo MEGA ADMINISTRADORES
- Suscripciones: ISPs con acceso a su propio ISP únicamente

✅ **Validaciones Importantes:**
- No eliminar planes con suscripciones activas
- Mantener integridad referencial entre planes y suscripciones
- Validar límites de transacciones en tiempo real

✅ **Funcionalidad de Negocio:**
- Cálculo automático de sobrecostos por transacciones extra
- Renovación automática mensual de suscripciones
- Logs detallados de todas las operaciones

✅ **Respuestas Consistentes:**
- Formato JSON uniforme en todas las respuestas
- Códigos de estado HTTP apropiados
- Mensajes descriptivos en español

## 💰 **8. MODELO DE INGRESOS ESPERADO:**

**Con los planes definidos:**
- **Plan Básico ($250)**: ISPs pequeños (1-50 conexiones)
- **Plan Profesional ($500)**: ISPs medianos (51-200 conexiones)  
- **Plan Enterprise ($1,200)**: ISPs grandes (200+ conexiones)

**Proyección con 50 ISPs:**
- 20 Básicos: $5,000/mes
- 25 Profesionales: $12,500/mes
- 5 Enterprise: $6,000/mes
- **Total: $23,500 USD/mes = $282,000 USD/año**

## 🚀 **IMPLEMENTACIÓN INMEDIATA REQUERIDA:**

1. **Crear las 4 tablas** con la estructura exacta proporcionada
2. **Insertar los 3 planes iniciales** con los datos exactos
3. **Implementar todos los endpoints** con las respuestas exactas
4. **Configurar middleware de autorización** para separar admin vs ISP
5. **Probar todos los endpoints** con los comandos curl proporcionados

**¡Con esta implementación tendrás un sistema completo de contabilidad como servicio generando ingresos recurrentes significativos!** 💼🚀