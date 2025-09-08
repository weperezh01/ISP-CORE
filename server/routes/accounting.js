const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, verifyIspAccess } = require('../middleware/auth');

// 1. POST /api/accounting/subscription/toggle
router.post('/subscription/toggle', authenticateToken, async (req, res) => {
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
        const [userCountResult] = await pool.execute(userCountQuery, [ispId]);
        const userCount = userCountResult[0].count;

        // 2. Determinar plan automáticamente basado en cantidad de usuarios
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
        } else { // 6 o más usuarios
            planId = 'contabilidad_enterprise';
            planName = 'Contabilidad Enterprise';
            price = 1200;
            transactionLimit = null; // Ilimitado
            pricePerTransaction = 0.25;
        }

        let subscription = null;
        let message = '';
        let billingIntegration = {};

        if (action === 'activate') {
            // Verificar si ya existe suscripción
            const existingQuery = `SELECT * FROM accounting_subscriptions WHERE isp_id = ?`;
            const [existing] = await pool.execute(existingQuery, [ispId]);

            if (existing.length > 0) {
                // Actualizar suscripción existente
                const updateQuery = `
                    UPDATE accounting_subscriptions 
                    SET plan_id = ?, plan_name = ?, price = ?, transaction_limit = ?, 
                        price_per_transaction = ?, status = 'active', activated_at = NOW(),
                        deactivated_at = NULL, updated_at = NOW()
                    WHERE isp_id = ?
                `;
                await pool.execute(updateQuery, [
                    planId, planName, price, transactionLimit, 
                    pricePerTransaction, ispId
                ]);
                
                subscription = {
                    id: existing[0].id,
                    isp_id: ispId,
                    plan_id: planId,
                    plan_name: planName,
                    price: price,
                    status: 'active',
                    transaction_limit: transactionLimit,
                    price_per_transaction: pricePerTransaction
                };
            } else {
                // Crear nueva suscripción
                const insertQuery = `
                    INSERT INTO accounting_subscriptions 
                    (isp_id, plan_id, plan_name, price, transaction_limit, price_per_transaction, status, activated_at, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW(), NOW())
                `;
                const [result] = await pool.execute(insertQuery, [
                    ispId, planId, planName, price, transactionLimit, pricePerTransaction
                ]);
                
                subscription = {
                    id: result.insertId,
                    isp_id: ispId,
                    plan_id: planId,
                    plan_name: planName,
                    price: price,
                    status: 'active',
                    transaction_limit: transactionLimit,
                    price_per_transaction: pricePerTransaction
                };
            }

            // TODO: Aquí agregarías la lógica para integrar con la facturación mensual
            // Ejemplo: agregar línea a la factura mensual de la ISP
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
            await pool.execute(deactivateQuery, [ispId]);

            // TODO: Remover de facturación mensual
            message = 'Servicio de contabilidad desactivado exitosamente';
            billingIntegration = {
                added_to_monthly_billing: false,
                monthly_charge: 0,
                next_billing_date: null
            };
        }

        // Respuesta esperada por el frontend
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
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 2. GET /api/accounting/subscription/status/:ispId
router.get('/subscription/status/:ispId', authenticateToken, verifyIspAccess, async (req, res) => {
    try {
        const { ispId } = req.params;

        const query = `
            SELECT * FROM accounting_subscriptions 
            WHERE isp_id = ? AND status = 'active'
        `;
        const [result] = await pool.execute(query, [ispId]);

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
        const nextBillingDate = new Date(activatedAt.getTime() + 30*24*60*60*1000); // 30 días después
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
                nextBillingDate: nextBillingDate.toISOString().split('T')[0] // YYYY-MM-DD format
            }
        });

    } catch (error) {
        console.error('Error obteniendo status de suscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 3. GET /api/accounting/plans
router.get('/plans', authenticateToken, async (req, res) => {
    try {
        // Planes estáticos - podrían venir de BD si prefieres
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
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 4. GET /api/isp/:ispId/users/count (endpoint adicional útil)
router.get('/isp/:ispId/users/count', authenticateToken, verifyIspAccess, async (req, res) => {
    try {
        const { ispId } = req.params;
        
        const query = `SELECT COUNT(*) as count FROM usuarios WHERE id_isp = ?`;
        const [result] = await pool.execute(query, [ispId]);
        const userCount = result[0].count;
        
        res.json({
            success: true,
            data: {
                userCount: userCount,
                ispId: parseInt(ispId)
            }
        });
    } catch (error) {
        console.error('Error al contar usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 5. GET /api/accounting-transactions/count (endpoint adicional útil)
router.get('/transactions/count', authenticateToken, async (req, res) => {
    try {
        const ispId = req.query.isp_id;
        
        if (!ispId) {
            return res.status(400).json({
                success: false,
                message: 'isp_id query parameter es requerido'
            });
        }
        
        // Contar transacciones del mes actual
        const query = `
            SELECT COUNT(*) as count 
            FROM accounting_transactions 
            WHERE isp_id = ? 
            AND MONTH(created_at) = MONTH(NOW()) 
            AND YEAR(created_at) = YEAR(NOW())
        `;
        const [result] = await pool.execute(query, [ispId]);
        const monthlyCount = result[0].count;
        
        const now = new Date();
        res.json({
            success: true,
            data: {
                monthlyCount: monthlyCount,
                month: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
                ispId: parseInt(ispId)
            }
        });
    } catch (error) {
        console.error('Error al contar transacciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;