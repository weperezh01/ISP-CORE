# 🚨 IMPLEMENTACIÓN URGENTE: Endpoints de Contabilidad Backend (Express/Node.js)

Este documento contiene la implementación completa de los 3 endpoints críticos que necesita el frontend de contabilidad para funcionar correctamente en Express/Node.js.

## 📍 ENDPOINTS REQUERIDOS INMEDIATAMENTE

### 1. `POST /api/accounting/subscription/toggle`
**Estado:** ❌ NO IMPLEMENTADO - Frontend está recibiendo 404
**Llamado desde:** `ContabilidadSuscripcionScreen.tsx` línea 344

#### Implementación Express/Node.js:

```javascript
// En tu app.js o routes/accounting.js
const express = require('express');
const app = express();

app.post('/api/accounting/subscription/toggle', async (req, res) => {
    try {
        const { ispId, action } = req.body;
        
        if (!ispId || !action) {
            return res.status(400).json({
                success: false,
                message: 'ispId y action son requeridos'
            });
        }

        if (!['activate', 'deactivate'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'action debe ser "activate" o "deactivate"'
            });
        }

        // 1. Contar usuarios de la ISP
        const userCountQuery = `SELECT COUNT(*) as count FROM usuarios WHERE id_isp = ?`;
        const userCountResult = await db.query(userCountQuery, [ispId]);
        const userCount = userCountResult[0].count;

        // 2. Determinar plan automáticamente basado en cantidad de usuarios
        // Lógica exacta del frontend:
        let planId, planName, price, transactionLimit, pricePerTransaction;
        
        if (userCount === 1) {
            planId = 'contabilidad_basico';
            planName = 'Contabilidad Básica';
            price = 250;
            transactionLimit = 100;
            pricePerTransaction = 0.50;
        } else if (userCount >= 2 && userCount <= 5) {
            planId = 'contabilidad_profesional';
            planName = 'Contabilidad Profesional';
            price = 500;
            transactionLimit = 500;
            pricePerTransaction = 0.35;
        } else { // 6+ usuarios
            planId = 'contabilidad_enterprise';
            planName = 'Contabilidad Enterprise';
            price = 1200;
            transactionLimit = null; // Ilimitado
            pricePerTransaction = 0.25;
        }

        let subscription = null;
        let message;
        let billingIntegration;

        if (action === 'activate') {
            // Verificar si ya existe suscripción
            const existingQuery = `SELECT * FROM accounting_subscriptions WHERE isp_id = ?`;
            const existing = await db.query(existingQuery, [ispId]);

            if (existing.length > 0) {
                // Actualizar suscripción existente
                const updateQuery = `
                    UPDATE accounting_subscriptions 
                    SET plan_id = ?, plan_name = ?, price = ?, transaction_limit = ?, 
                        price_per_transaction = ?, status = 'active', activated_at = NOW(), 
                        deactivated_at = NULL, updated_at = NOW()
                    WHERE isp_id = ?
                `;
                await db.query(updateQuery, [
                    planId, planName, price, transactionLimit, 
                    pricePerTransaction, ispId
                ]);
                
                subscription = {
                    id: existing[0].id,
                    isp_id: ispId,
                    plan_id: planId,
                    plan_name: planName,
                    status: 'active',
                    price: price
                };
            } else {
                // Crear nueva suscripción
                const insertQuery = `
                    INSERT INTO accounting_subscriptions 
                    (isp_id, plan_id, plan_name, price, transaction_limit, price_per_transaction, 
                     status, activated_at, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW(), NOW())
                `;
                const result = await db.query(insertQuery, [
                    ispId, planId, planName, price, transactionLimit, pricePerTransaction
                ]);
                
                subscription = {
                    id: result.insertId,
                    isp_id: ispId,
                    plan_id: planId,
                    plan_name: planName,
                    status: 'active',
                    price: price
                };
            }

            // TODO: Integrar con facturación mensual de la ISP
            // Ejemplo: 
            // await addToMonthlyBilling(ispId, price, planName);

            message = 'Servicio de contabilidad activado exitosamente';
            billingIntegration = {
                added_to_monthly_billing: true,
                monthly_charge: price,
                next_billing_date: new Date(Date.now() + 30*24*60*60*1000) // 30 días
            };

        } else if (action === 'deactivate') {
            // Desactivar suscripción
            const deactivateQuery = `
                UPDATE accounting_subscriptions 
                SET status = 'inactive', deactivated_at = NOW(), updated_at = NOW()
                WHERE isp_id = ?
            `;
            await db.query(deactivateQuery, [ispId]);

            // TODO: Remover de facturación mensual
            // await removeFromMonthlyBilling(ispId);

            message = 'Servicio de contabilidad desactivado exitosamente';
            billingIntegration = {
                added_to_monthly_billing: false,
                monthly_charge: 0
            };
        }

        // Respuesta esperada por el frontend (estructura exacta)
        res.json({
            success: true,
            message: message,
            data: {
                subscription: subscription,
                recommendedPlan: {
                    id: planId,
                    name: planName,
                    price: price,
                    reason: `Recomendado para ISPs con ${userCount} usuarios`,
                    transaction_limit: transactionLimit,
                    price_per_transaction: pricePerTransaction
                },
                billing_integration: billingIntegration,
                user_count: userCount
            }
        });

    } catch (error) {
        console.error('Error en toggle subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    }
});
```

### 2. `GET /api/accounting/subscription/status/:ispId`
**Estado:** ❌ NO IMPLEMENTADO - Frontend está recibiendo 404
**Llamado desde:** `ContabilidadSuscripcionScreen.tsx` línea 237

#### Implementación Express/Node.js:

```javascript
app.get('/api/accounting/subscription/status/:ispId', async (req, res) => {
    try {
        const { ispId } = req.params;

        if (!ispId) {
            return res.status(400).json({
                success: false,
                message: 'ispId es requerido'
            });
        }

        const query = `
            SELECT * FROM accounting_subscriptions 
            WHERE isp_id = ? AND status = 'active'
            ORDER BY activated_at DESC
            LIMIT 1
        `;
        const result = await db.query(query, [ispId]);

        if (result.length === 0) {
            return res.json({
                success: true,
                data: {
                    isSubscribed: false,
                    isActive: false,
                    current_plan: null,
                    subscription_date: null,
                    daysUntilRenewal: null,
                    nextBillingDate: null
                }
            });
        }

        const subscription = result[0];

        // Calcular días hasta renovación (30 días desde activación)
        const activatedAt = new Date(subscription.activated_at);
        const nextBillingDate = new Date(activatedAt.getTime() + 30*24*60*60*1000);
        const now = new Date();
        const daysUntilRenewal = Math.max(0, Math.ceil((nextBillingDate - now) / (24*60*60*1000)));

        res.json({
            success: true,
            data: {
                isSubscribed: true,
                isActive: true,
                planId: subscription.plan_id,
                current_plan: {
                    id: subscription.plan_id,
                    name: subscription.plan_name,
                    price: subscription.price
                },
                subscription_date: subscription.activated_at,
                daysUntilRenewal: daysUntilRenewal,
                nextBillingDate: nextBillingDate.toISOString().split('T')[0]
            }
        });

    } catch (error) {
        console.error('Error obteniendo status de suscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    }
});
```

### 3. `GET /api/accounting/plans`
**Estado:** ❌ NO IMPLEMENTADO - Frontend está recibiendo 404
**Llamado desde:** `ContabilidadSuscripcionScreen.tsx` línea 127

#### Implementación Express/Node.js:

```javascript
app.get('/api/accounting/plans', async (req, res) => {
    try {
        // Planes estáticos - estructura exacta esperada por el frontend
        const plans = [
            {
                id: 'contabilidad_basico',
                name: 'Contabilidad Básica',
                price: 250,
                price_per_transaction: 0.50,
                transaction_limit: 100,
                features: [
                    'Facturación mensual',
                    'Estados financieros básicos',
                    'Conciliación bancaria',
                    'Hasta 100 transacciones/mes',
                    'Soporte por email',
                    'Backup automático'
                ],
                recommended: false,
                popular: false,
                color: '#10B981',
                icon: 'account_balance',
                target_users: '1 usuario'
            },
            {
                id: 'contabilidad_profesional',
                name: 'Contabilidad Profesional',
                price: 500,
                price_per_transaction: 0.35,
                transaction_limit: 500,
                features: [
                    'Todo lo del plan básico',
                    'Análisis de rentabilidad',
                    'Reportes de cobranza',
                    'Control de inventario',
                    'Hasta 500 transacciones/mes',
                    'Dashboard avanzado',
                    'Soporte telefónico',
                    'Reportes personalizados'
                ],
                recommended: true,
                popular: true,
                color: '#3B82F6',
                icon: 'analytics',
                target_users: '2-5 usuarios'
            },
            {
                id: 'contabilidad_enterprise',
                name: 'Contabilidad Enterprise',
                price: 1200,
                price_per_transaction: 0.25,
                transaction_limit: null, // Ilimitado
                features: [
                    'Todo lo del plan profesional',
                    'Transacciones ilimitadas',
                    'Dashboard ejecutivo en tiempo real',
                    'Análisis predictivo financiero',
                    'Gestión multi-ISP',
                    'Soporte 24/7',
                    'Consultoría mensual incluida',
                    'API personalizada',
                    'Auditoría trimestral'
                ],
                recommended: false,
                popular: false,
                color: '#7C3AED',
                icon: 'business_center',
                target_users: '6+ usuarios'
            }
        ];

        res.json({
            success: true,
            data: plans
        });

    } catch (error) {
        console.error('Error obteniendo planes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message
        });
    }
});
```

## 🗃️ TABLA DE BASE DE DATOS

### Crear tabla en MySQL/PostgreSQL:

```sql
CREATE TABLE accounting_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isp_id INT NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100),
    price DECIMAL(10,2),
    transaction_limit INT NULL, -- NULL = ilimitado
    price_per_transaction DECIMAL(5,2),
    status ENUM('active', 'inactive') DEFAULT 'inactive',
    activated_at TIMESTAMP NULL,
    deactivated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_isp_id (isp_id),
    INDEX idx_status (status),
    INDEX idx_isp_status (isp_id, status)
);
```

## 📋 ENDPOINTS ADICIONALES QUE PUEDEN SER ÚTILES

El frontend también hace llamadas a estos endpoints:

### 4. `GET /api/isp/:ispId/users/count`
**Llamado desde:** `ContabilidadSuscripcionScreen.tsx` línea 167

```javascript
app.get('/api/isp/:ispId/users/count', async (req, res) => {
    try {
        const { ispId } = req.params;
        
        const query = `SELECT COUNT(*) as count FROM usuarios WHERE id_isp = ?`;
        const result = await db.query(query, [ispId]);
        const userCount = result[0].count;
        
        res.json({
            success: true,
            data: {
                userCount: userCount,
                ispId: ispId
            }
        });
    } catch (error) {
        console.error('Error al contar usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al contar usuarios: ' + error.message
        });
    }
});
```

### 5. `GET /api/accounting-transactions/count?isp_id={ispId}`
**Llamado desde:** `ContabilidadSuscripcionScreen.tsx` línea 280

```javascript
app.get('/api/accounting-transactions/count', async (req, res) => {
    try {
        const ispId = req.query.isp_id;
        
        if (!ispId) {
            return res.status(400).json({
                success: false,
                message: 'isp_id es requerido'
            });
        }
        
        // Contar transacciones del mes actual
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const query = `
            SELECT COUNT(*) as count 
            FROM accounting_transactions 
            WHERE isp_id = ? 
            AND MONTH(created_at) = ? 
            AND YEAR(created_at) = ?
        `;
        const result = await db.query(query, [ispId, currentMonth, currentYear]);
        const monthlyCount = result[0].count;
        
        res.json({
            success: true,
            data: {
                monthlyCount: monthlyCount,
                month: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
                ispId: ispId
            }
        });
    } catch (error) {
        console.error('Error al contar transacciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al contar transacciones: ' + error.message
        });
    }
});
```

## 🔧 CONFIGURACIÓN EXPRESS

```javascript
// En tu app.js o server.js principal
const express = require('express');
const mysql = require('mysql2/promise'); // o el driver de BD que uses
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de base de datos (ajusta según tu setup)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'tu_usuario',
    password: 'tu_password',
    database: 'wellnet'
});

// Si usas rutas separadas:
// const accountingRoutes = require('./routes/accounting');
// app.use('/api', accountingRoutes);

// O agrega los endpoints directamente aquí...

const PORT = process.env.PORT || 444;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

## 🚀 PASOS PARA IMPLEMENTAR

1. **Crear la tabla en tu base de datos:**
   ```sql
   -- Ejecuta el script SQL de arriba
   ```

2. **Agregar los endpoints a tu servidor Express:**
   - Copia los 3 endpoints principales
   - Ajusta la conexión a BD según tu configuración
   - Agrega los endpoints adicionales si los necesitas

3. **Probar los endpoints:**
   ```bash
   # Obtener planes
   curl -X GET "https://wellnet-rd.com:444/api/accounting/plans" \
        -H "Authorization: Bearer {token}"

   # Activar suscripción
   curl -X POST "https://wellnet-rd.com:444/api/accounting/subscription/toggle" \
        -H "Authorization: Bearer {token}" \
        -H "Content-Type: application/json" \
        -d '{"ispId": 12, "action": "activate"}'
   ```

4. **Remover el fallback del frontend** una vez que todo funcione

## ⚠️ IMPORTANTE

- El frontend **ya tiene un fallback temporal** cuando recibe 404
- Los planes se asignan **automáticamente** basándose en el número de usuarios
- Mantén la **estructura exacta de respuesta** que espera el frontend
- Implementa **autenticación y autorización** adecuada
- Integra con tu **sistema de facturación mensual** existente

**El frontend está esperando exactamente esta estructura, así que es crítico mantener la compatibilidad.**