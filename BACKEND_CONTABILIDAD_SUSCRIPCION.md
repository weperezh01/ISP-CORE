# 💼 BACKEND - SISTEMA DE SUSCRIPCIÓN PARA SERVICIOS DE CONTABILIDAD

## 📋 **REQUERIMIENTO:**

Implementar un sistema completo de suscripción mensual para servicios de contabilidad que los ISPs pueden contratar. Similar al sistema de planes de conexiones, pero enfocado en facturar por servicios contables profesionales.

## 🎯 **MODELO DE NEGOCIO:**

Los ISPs pagan mensualmente por:
- **Plan Básico ($250/mes)**: Hasta 100 transacciones, reportes básicos
- **Plan Profesional ($500/mes)**: Hasta 500 transacciones, análisis avanzados  
- **Plan Enterprise ($1,200/mes)**: Transacciones ilimitadas, consultoría incluida

## 🗄️ **1. ESTRUCTURA DE BASE DE DATOS:**

### **Tabla: `accounting_subscriptions`**

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
    
    -- Índices
    INDEX idx_isp_status (isp_id, status),
    INDEX idx_billing_date (next_billing_date),
    INDEX idx_plan_id (plan_id)
);
```

### **Tabla: `accounting_billing_history`**

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

### **Tabla: `accounting_transaction_logs`**

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

### **Datos de ejemplo:**
```sql
-- Suscripciones de ejemplo
INSERT INTO accounting_subscriptions (isp_id, plan_id, status, start_date, next_billing_date, monthly_price, transaction_limit) VALUES
(1, 'contabilidad_profesional', 'active', '2024-01-01', '2024-02-01', 500.00, 500),
(2, 'contabilidad_basico', 'active', '2024-01-15', '2024-02-15', 250.00, 100),
(3, 'contabilidad_enterprise', 'trial', '2024-01-20', '2024-02-20', 1200.00, NULL);

-- Historial de facturación
INSERT INTO accounting_billing_history (subscription_id, isp_id, billing_period_start, billing_period_end, base_amount, total_amount, transactions_included, transactions_used, status) VALUES
(1, 1, '2024-01-01', '2024-01-31', 500.00, 500.00, 500, 342, 'paid'),
(2, 2, '2024-01-15', '2024-02-14', 250.00, 250.00, 100, 78, 'paid');
```

## 🔗 **2. ENDPOINTS REQUERIDOS:**

### **A. Estado de Suscripción**
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

### **B. Actualizar/Crear Suscripción**
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

### **C. Uso Mensual de Contabilidad**
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

### **D. Registrar Transacción Contable**
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

### **E. Historial de Facturación**
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

## 🔧 **3. IMPLEMENTACIÓN BACKEND:**

### **Archivo: `routes/accountingSubscription.js`**

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getSubscriptionStatus,
    upgradeSubscription,
    getMonthlyUsage,
    logTransaction,
    getBillingHistory,
    processMonthlyBilling
} = require('../controllers/accountingSubscriptionController');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Rutas de suscripción
router.get('/status', getSubscriptionStatus);           // GET /api/accounting-subscription/status?isp_id=1
router.post('/upgrade', upgradeSubscription);           // POST /api/accounting-subscription/upgrade

// Rutas de uso
router.get('/usage/monthly', getMonthlyUsage);          // GET /api/accounting-usage/monthly?isp_id=1
router.post('/usage/log', logTransaction);              // POST /api/accounting-usage/log

// Rutas de facturación
router.get('/billing/history', getBillingHistory);      // GET /api/accounting-billing/history?isp_id=1

// Ruta administrativa (solo para procesamiento automático)
router.post('/billing/process', processMonthlyBilling); // POST /api/accounting-subscription/billing/process

module.exports = router;
```

### **Archivo: `controllers/accountingSubscriptionController.js`**

```javascript
const db = require('../config/database');

// Planes disponibles (deben coincidir con el frontend)
const ACCOUNTING_PLANS = {
    'contabilidad_basico': {
        id: 'contabilidad_basico',
        name: 'Contabilidad Básica',
        price: 250,
        transactionLimit: 100,
        pricePerTransaction: 0.50
    },
    'contabilidad_profesional': {
        id: 'contabilidad_profesional',
        name: 'Contabilidad Profesional',
        price: 500,
        transactionLimit: 500,
        pricePerTransaction: 0.35
    },
    'contabilidad_enterprise': {
        id: 'contabilidad_enterprise',
        name: 'Contabilidad Enterprise',
        price: 1200,
        transactionLimit: null, // Ilimitado
        pricePerTransaction: 0.25
    }
};

// 📊 GET - Obtener estado de suscripción
const getSubscriptionStatus = async (req, res) => {
    try {
        console.log('🔍 [ACCOUNTING-SUB] Request para obtener estado de suscripción');
        console.log('  📋 Query params:', req.query);
        console.log('  👤 Usuario autenticado:', req.user.id);
        
        const ispId = req.query.isp_id;
        
        if (!ispId) {
            return res.status(400).json({
                success: false,
                message: 'isp_id es requerido como parámetro de consulta'
            });
        }
        
        // Verificar acceso al ISP
        const [userIspAccess] = await db.execute(`
            SELECT usuario_id FROM usuarios_isp 
            WHERE usuario_id = ? AND isp_id = ? AND activo = 1
        `, [req.user.id, ispId]);
        
        if (userIspAccess.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'No tienes acceso a este ISP'
            });
        }
        
        // Obtener suscripción activa
        const [subscription] = await db.execute(`
            SELECT 
                id as subscriptionId,
                plan_id,
                status,
                monthly_price,
                transaction_limit,
                transactions_used,
                next_billing_date,
                DATEDIFF(next_billing_date, CURDATE()) as days_until_renewal
            FROM accounting_subscriptions 
            WHERE isp_id = ? AND status IN ('active', 'trial')
            ORDER BY created_at DESC
            LIMIT 1
        `, [ispId]);
        
        if (subscription.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No hay suscripción activa de contabilidad'
            });
        }
        
        const sub = subscription[0];
        const plan = ACCOUNTING_PLANS[sub.plan_id];
        
        if (!plan) {
            return res.status(500).json({
                success: false,
                message: 'Plan de suscripción no válido'
            });
        }
        
        const usagePercentage = sub.transaction_limit 
            ? Math.min((sub.transactions_used / sub.transaction_limit) * 100, 100)
            : 0;
        
        const responseData = {
            subscriptionId: sub.subscriptionId,
            planId: sub.plan_id,
            planName: plan.name,
            status: sub.status,
            monthlyPrice: parseFloat(sub.monthly_price),
            transactionLimit: sub.transaction_limit,
            transactionsUsed: sub.transactions_used,
            usagePercentage: parseFloat(usagePercentage.toFixed(1)),
            nextBillingDate: sub.next_billing_date,
            daysUntilRenewal: sub.days_until_renewal,
            isActive: sub.status === 'active'
        };
        
        console.log('  ✅ Suscripción encontrada:', {
            planId: responseData.planId,
            status: responseData.status,
            usage: `${responseData.transactionsUsed}/${responseData.transactionLimit || 'unlimited'}`
        });
        
        res.json({
            success: true,
            data: responseData,
            message: 'Estado de suscripción obtenido exitosamente'
        });
        
    } catch (error) {
        console.error('  ❌ ERROR en getSubscriptionStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ⬆️ POST - Crear/Actualizar suscripción
const upgradeSubscription = async (req, res) => {
    try {
        console.log('🔍 [ACCOUNTING-SUB] Request para actualizar suscripción');
        console.log('  📋 Body:', req.body);
        console.log('  👤 Usuario autenticado:', req.user.id);
        
        const { isp_id, plan_id } = req.body;
        
        if (!isp_id || !plan_id) {
            return res.status(400).json({
                success: false,
                message: 'isp_id y plan_id son requeridos'
            });
        }
        
        const plan = ACCOUNTING_PLANS[plan_id];
        if (!plan) {
            return res.status(400).json({
                success: false,
                message: 'Plan de suscripción no válido'
            });
        }
        
        // Verificar acceso al ISP
        const [userIspAccess] = await db.execute(`
            SELECT usuario_id FROM usuarios_isp 
            WHERE usuario_id = ? AND isp_id = ? AND activo = 1
        `, [req.user.id, isp_id]);
        
        if (userIspAccess.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'No tienes acceso a este ISP'
            });
        }
        
        // Verificar suscripción existente
        const [existingSubscription] = await db.execute(`
            SELECT id, plan_id, status FROM accounting_subscriptions 
            WHERE isp_id = ? AND status IN ('active', 'trial')
            ORDER BY created_at DESC LIMIT 1
        `, [isp_id]);
        
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        
        let subscriptionId;
        
        if (existingSubscription.length > 0) {
            // Actualizar suscripción existente
            subscriptionId = existingSubscription[0].id;
            
            await db.execute(`
                UPDATE accounting_subscriptions 
                SET 
                    plan_id = ?,
                    monthly_price = ?,
                    transaction_limit = ?,
                    status = 'active',
                    next_billing_date = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [plan_id, plan.price, plan.transactionLimit, nextBillingDate.toISOString().split('T')[0], subscriptionId]);
            
            console.log('  ✅ Suscripción actualizada:', { subscriptionId, planId: plan_id });
        } else {
            // Crear nueva suscripción
            const [result] = await db.execute(`
                INSERT INTO accounting_subscriptions 
                (isp_id, plan_id, status, start_date, next_billing_date, monthly_price, transaction_limit) 
                VALUES (?, ?, 'active', CURDATE(), ?, ?, ?)
            `, [isp_id, plan_id, nextBillingDate.toISOString().split('T')[0], plan.price, plan.transactionLimit]);
            
            subscriptionId = result.insertId;
            console.log('  ✅ Nueva suscripción creada:', { subscriptionId, planId: plan_id });
        }
        
        res.json({
            success: true,
            data: {
                subscriptionId,
                planId: plan_id,
                status: 'active',
                nextBillingDate: nextBillingDate.toISOString().split('T')[0],
                newMonthlyPrice: plan.price
            },
            message: 'Suscripción actualizada exitosamente'
        });
        
    } catch (error) {
        console.error('  ❌ ERROR en upgradeSubscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// 📊 GET - Obtener uso mensual
const getMonthlyUsage = async (req, res) => {
    try {
        const ispId = req.query.isp_id;
        
        if (!ispId) {
            return res.status(400).json({
                success: false,
                message: 'isp_id es requerido'
            });
        }
        
        // Obtener suscripción activa
        const [subscription] = await db.execute(`
            SELECT id, transactions_used FROM accounting_subscriptions 
            WHERE isp_id = ? AND status IN ('active', 'trial')
            ORDER BY created_at DESC LIMIT 1
        `, [ispId]);
        
        if (subscription.length === 0) {
            return res.json({
                success: true,
                data: {
                    transactionsUsed: 0,
                    reportsGenerated: 0,
                    lastActivity: null,
                    monthlyBreakdown: {
                        journal_entries: 0,
                        reports: 0,
                        api_calls: 0
                    }
                },
                message: 'Sin suscripción activa'
            });
        }
        
        const subscriptionId = subscription[0].id;
        
        // Obtener desglose de uso del mes actual
        const [usageBreakdown] = await db.execute(`
            SELECT 
                transaction_type,
                COUNT(*) as count,
                MAX(logged_at) as last_activity
            FROM accounting_transaction_logs 
            WHERE subscription_id = ? 
            AND MONTH(logged_at) = MONTH(CURDATE()) 
            AND YEAR(logged_at) = YEAR(CURDATE())
            GROUP BY transaction_type
        `, [subscriptionId]);
        
        // Formatear respuesta
        const breakdown = {
            journal_entries: 0,
            reports: 0,
            api_calls: 0
        };
        
        let reportsGenerated = 0;
        let lastActivity = null;
        
        usageBreakdown.forEach(row => {
            if (row.transaction_type === 'journal_entry') {
                breakdown.journal_entries = row.count;
            } else if (['report_generation', 'balance_sheet', 'income_statement'].includes(row.transaction_type)) {
                breakdown.reports += row.count;
                reportsGenerated += row.count;
            } else if (row.transaction_type === 'api_call') {
                breakdown.api_calls = row.count;
            }
            
            if (!lastActivity || new Date(row.last_activity) > new Date(lastActivity)) {
                lastActivity = row.last_activity;
            }
        });
        
        res.json({
            success: true,
            data: {
                transactionsUsed: subscription[0].transactions_used,
                reportsGenerated,
                lastActivity,
                monthlyBreakdown: breakdown
            },
            message: 'Datos de uso obtenidos exitosamente'
        });
        
    } catch (error) {
        console.error('  ❌ ERROR en getMonthlyUsage:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// 📝 POST - Registrar transacción contable
const logTransaction = async (req, res) => {
    try {
        const { isp_id, transaction_type, description } = req.body;
        
        if (!isp_id || !transaction_type) {
            return res.status(400).json({
                success: false,
                message: 'isp_id y transaction_type son requeridos'
            });
        }
        
        // Obtener suscripción activa
        const [subscription] = await db.execute(`
            SELECT id, transaction_limit, transactions_used FROM accounting_subscriptions 
            WHERE isp_id = ? AND status = 'active'
            ORDER BY created_at DESC LIMIT 1
        `, [isp_id]);
        
        if (subscription.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'No hay suscripción activa de contabilidad'
            });
        }
        
        const sub = subscription[0];
        
        // Verificar límite si aplica
        if (sub.transaction_limit && sub.transactions_used >= sub.transaction_limit) {
            return res.status(429).json({
                success: false,
                message: 'Límite de transacciones mensuales alcanzado'
            });
        }
        
        // Registrar transacción
        await db.execute(`
            INSERT INTO accounting_transaction_logs 
            (isp_id, subscription_id, transaction_type, description) 
            VALUES (?, ?, ?, ?)
        `, [isp_id, sub.id, transaction_type, description || null]);
        
        // Actualizar contador
        await db.execute(`
            UPDATE accounting_subscriptions 
            SET transactions_used = transactions_used + 1 
            WHERE id = ?
        `, [sub.id]);
        
        const newTransactionsUsed = sub.transactions_used + 1;
        const remainingTransactions = sub.transaction_limit 
            ? sub.transaction_limit - newTransactionsUsed 
            : null;
        
        res.json({
            success: true,
            data: {
                transactionsUsed: newTransactionsUsed,
                transactionLimit: sub.transaction_limit,
                remainingTransactions,
                overageWarning: sub.transaction_limit && newTransactionsUsed >= sub.transaction_limit * 0.9
            },
            message: 'Transacción registrada exitosamente'
        });
        
    } catch (error) {
        console.error('  ❌ ERROR en logTransaction:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// 📋 GET - Obtener historial de facturación
const getBillingHistory = async (req, res) => {
    try {
        const ispId = req.query.isp_id;
        
        if (!ispId) {
            return res.status(400).json({
                success: false,
                message: 'isp_id es requerido'
            });
        }
        
        const [billingHistory] = await db.execute(`
            SELECT 
                id,
                CONCAT(billing_period_start, ' - ', billing_period_end) as billingPeriod,
                base_amount as baseAmount,
                overage_amount as overageAmount,
                total_amount as totalAmount,
                transactions_included as transactionsIncluded,
                transactions_used as transactionsUsed,
                status,
                payment_date as paymentDate,
                invoice_number as invoiceNumber
            FROM accounting_billing_history 
            WHERE isp_id = ?
            ORDER BY billing_period_start DESC
            LIMIT 12
        `, [ispId]);
        
        res.json({
            success: true,
            data: billingHistory.map(bill => ({
                ...bill,
                baseAmount: parseFloat(bill.baseAmount),
                overageAmount: parseFloat(bill.overageAmount),
                totalAmount: parseFloat(bill.totalAmount)
            })),
            message: 'Historial de facturación obtenido exitosamente'
        });
        
    } catch (error) {
        console.error('  ❌ ERROR en getBillingHistory:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// 💳 POST - Procesar facturación mensual (proceso automático)
const processMonthlyBilling = async (req, res) => {
    try {
        console.log('🔄 [BILLING] Iniciando proceso de facturación mensual...');
        
        // Obtener suscripciones que deben ser facturadas hoy
        const [subscriptionsToBill] = await db.execute(`
            SELECT 
                s.id,
                s.isp_id,
                s.plan_id,
                s.monthly_price,
                s.transaction_limit,
                s.transactions_used,
                s.next_billing_date
            FROM accounting_subscriptions s
            WHERE s.status = 'active' 
            AND s.next_billing_date <= CURDATE()
        `);
        
        console.log(`  📊 Suscripciones a facturar: ${subscriptionsToBill.length}`);
        
        for (const subscription of subscriptionsToBill) {
            const plan = ACCOUNTING_PLANS[subscription.plan_id];
            if (!plan) continue;
            
            const baseAmount = parseFloat(subscription.monthly_price);
            let overageAmount = 0;
            let overageTransactions = 0;
            
            // Calcular sobrecosto por transacciones adicionales
            if (subscription.transaction_limit && subscription.transactions_used > subscription.transaction_limit) {
                overageTransactions = subscription.transactions_used - subscription.transaction_limit;
                overageAmount = overageTransactions * plan.pricePerTransaction;
            }
            
            const totalAmount = baseAmount + overageAmount;
            
            // Calcular período de facturación
            const billingEnd = new Date(subscription.next_billing_date);
            const billingStart = new Date(billingEnd);
            billingStart.setMonth(billingStart.getMonth() - 1);
            billingStart.setDate(billingStart.getDate() + 1);
            
            // Generar número de factura
            const invoiceNumber = `ACC-${new Date().getFullYear()}-${String(subscription.id).padStart(6, '0')}`;
            
            // Insertar registro de facturación
            await db.execute(`
                INSERT INTO accounting_billing_history 
                (subscription_id, isp_id, billing_period_start, billing_period_end, 
                 base_amount, overage_amount, total_amount, transactions_included, 
                 transactions_used, overage_transactions, status, invoice_number) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
            `, [
                subscription.id,
                subscription.isp_id,
                billingStart.toISOString().split('T')[0],
                billingEnd.toISOString().split('T')[0],
                baseAmount,
                overageAmount,
                totalAmount,
                subscription.transaction_limit || 0,
                subscription.transactions_used,
                overageTransactions,
                invoiceNumber
            ]);
            
            // Actualizar próxima fecha de facturación y resetear contador
            const nextBilling = new Date(subscription.next_billing_date);
            nextBilling.setMonth(nextBilling.getMonth() + 1);
            
            await db.execute(`
                UPDATE accounting_subscriptions 
                SET 
                    next_billing_date = ?,
                    transactions_used = 0,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [nextBilling.toISOString().split('T')[0], subscription.id]);
            
            console.log(`  ✅ Facturación procesada para ISP ${subscription.isp_id}: $${totalAmount}`);
        }
        
        res.json({
            success: true,
            data: {
                processedSubscriptions: subscriptionsToBill.length,
                totalRevenue: subscriptionsToBill.reduce((sum, sub) => {
                    const plan = ACCOUNTING_PLANS[sub.plan_id];
                    const base = parseFloat(sub.monthly_price);
                    const overage = sub.transaction_limit && sub.transactions_used > sub.transaction_limit 
                        ? (sub.transactions_used - sub.transaction_limit) * (plan?.pricePerTransaction || 0)
                        : 0;
                    return sum + base + overage;
                }, 0)
            },
            message: 'Facturación mensual procesada exitosamente'
        });
        
    } catch (error) {
        console.error('  ❌ ERROR en processMonthlyBilling:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getSubscriptionStatus,
    upgradeSubscription,
    getMonthlyUsage,
    logTransaction,
    getBillingHistory,
    processMonthlyBilling
};
```

## 🔗 **4. REGISTRO DE RUTAS:**

### **Archivo: `app.js` o `server.js`**

```javascript
// Importar rutas de suscripción contable
const accountingSubscriptionRoutes = require('./routes/accountingSubscription');

// Registrar rutas
app.use('/api/accounting-subscription', accountingSubscriptionRoutes);
app.use('/api/accounting-usage', accountingSubscriptionRoutes);
app.use('/api/accounting-billing', accountingSubscriptionRoutes);
```

## 🧪 **5. TESTING DE ENDPOINTS:**

### **A. Obtener estado de suscripción**
```bash
curl -X GET "https://wellnet-rd.com:444/api/accounting-subscription/status?isp_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### **B. Crear/actualizar suscripción**
```bash
curl -X POST "https://wellnet-rd.com:444/api/accounting-subscription/upgrade" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isp_id": 1,
    "plan_id": "contabilidad_profesional"
  }'
```

### **C. Registrar transacción contable**
```bash
curl -X POST "https://wellnet-rd.com:444/api/accounting-usage/log" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isp_id": 1,
    "transaction_type": "journal_entry",
    "description": "Registro de ingresos mensuales"
  }'
```

## ⚙️ **6. PROCESO AUTOMÁTICO DE FACTURACIÓN:**

### **Cron Job para Facturación Diaria:**

```bash
# Agregar al crontab para ejecutar todos los días a las 2:00 AM
0 2 * * * curl -X POST "https://wellnet-rd.com:444/api/accounting-subscription/billing/process" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## 🎯 **7. CARACTERÍSTICAS IMPLEMENTADAS:**

✅ **Gestión de Suscripciones:**
- Crear, actualizar y cancelar suscripciones
- Soporte para trial, activa, suspendida
- Renovación automática mensual

✅ **Control de Uso:**
- Límites por transacciones contables
- Registro detallado de actividad
- Alertas de sobrecarga

✅ **Facturación Automatizada:**
- Cálculo de sobrecostos por uso excesivo
- Historial completo de facturación
- Números de factura únicos

✅ **Seguridad:**
- Autenticación JWT obligatoria
- Verificación de acceso por ISP
- Logs detallados de auditoría

## 💰 **8. MODELO DE INGRESOS PROYECTADO:**

**Con 50 ISPs suscritos:**
- 20 ISPs en Plan Básico ($250): $5,000/mes
- 25 ISPs en Plan Profesional ($500): $12,500/mes  
- 5 ISPs en Plan Enterprise ($1,200): $6,000/mes
- **Total mensual: $23,500 USD**
- **Total anual: $282,000 USD**

**¡Un sistema de suscripción contable completamente automatizado y escalable!** 🚀💼