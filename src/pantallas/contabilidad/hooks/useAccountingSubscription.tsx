import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCOUNTING_PLANS, getAccountingPlanById } from '../config/accountingPlans';

export interface AccountingSubscriptionStatus {
    planId: string;
    isActive: boolean;
    transactionCount: number;
    transactionLimit: number | null;
    usagePercentage: number;
    nextBillingDate: string;
    daysUntilRenewal: number;
    currentPlan: any;
}

export const useAccountingSubscription = (ispId: string) => {
    const [subscriptionStatus, setSubscriptionStatus] = useState<AccountingSubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [userToken, setUserToken] = useState('');

    const API_BASE = 'https://wellnet-rd.com:444/api';

    useEffect(() => {
        loadUserToken();
    }, []);

    useEffect(() => {
        if (userToken && ispId) {
            refreshStatus();
        }
    }, [userToken, ispId]);

    const loadUserToken = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            if (loginData && loginData.token) {
                setUserToken(loginData.token);
            } else {
                setUserToken('');
            }
        } catch (error) {
            console.error('Error loading user token:', error);
            setUserToken('');
        }
    };

    const refreshStatus = async () => {
        if (!userToken || !ispId) return;

        try {
            setLoading(true);

            // Get subscription status
            const subscriptionResponse = await fetch(
                `${API_BASE}/accounting-subscription/status?isp_id=${ispId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            const subscriptionData = await subscriptionResponse.json();

            if (subscriptionResponse.ok && subscriptionData.success) {
                const plan = getAccountingPlanById(subscriptionData.data.planId);
                
                // Get usage data
                const usageResponse = await fetch(
                    `${API_BASE}/accounting-usage/monthly?isp_id=${ispId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${userToken}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                const usageData = await usageResponse.json();
                let transactionCount = 0;
                
                if (usageResponse.ok && usageData.success) {
                    transactionCount = usageData.data.transactionsUsed || 0;
                }

                const transactionLimit = plan?.transactionLimit || null;
                const usagePercentage = transactionLimit 
                    ? Math.min((transactionCount / transactionLimit) * 100, 100)
                    : 0;

                setSubscriptionStatus({
                    planId: subscriptionData.data.planId,
                    isActive: subscriptionData.data.isActive,
                    transactionCount,
                    transactionLimit,
                    usagePercentage,
                    nextBillingDate: subscriptionData.data.nextBillingDate,
                    daysUntilRenewal: subscriptionData.data.daysUntilRenewal,
                    currentPlan: plan
                });
            } else {
                setSubscriptionStatus(null);
            }
        } catch (error) {
            console.error('Error fetching accounting subscription status:', error);
            setSubscriptionStatus(null);
        } finally {
            setLoading(false);
        }
    };

    const upgradePlan = async (newPlanId: string) => {
        try {
            const response = await fetch(`${API_BASE}/accounting-subscription/upgrade`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isp_id: ispId,
                    plan_id: newPlanId
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                await refreshStatus();
                return { success: true, message: 'Plan actualizado exitosamente' };
            } else {
                return { success: false, message: data.message || 'Error al actualizar plan' };
            }
        } catch (error) {
            console.error('Error upgrading plan:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    const getSuggestedPlan = () => {
        if (!subscriptionStatus) return null;
        
        const currentTransactions = subscriptionStatus.transactionCount;
        
        // Find the most economical plan that covers current usage
        const availablePlans = ACCOUNTING_PLANS.filter(plan => 
            !plan.transactionLimit || plan.transactionLimit >= currentTransactions
        ).sort((a, b) => a.price - b.price);

        return availablePlans[0] || null;
    };

    const checkAccess = (feature: string) => {
        if (!subscriptionStatus?.isActive) return false;
        
        const currentPlan = subscriptionStatus.currentPlan;
        if (!currentPlan) return false;

        // Check transaction limits
        if (currentPlan.transactionLimit && 
            subscriptionStatus.transactionCount >= currentPlan.transactionLimit) {
            return false;
        }

        // Feature-based access control
        const featureAccess = {
            'basic_accounting': ['contabilidad_basico', 'contabilidad_profesional', 'contabilidad_enterprise'],
            'advanced_reports': ['contabilidad_profesional', 'contabilidad_enterprise'],
            'api_access': ['contabilidad_enterprise'],
            'priority_support': ['contabilidad_profesional', 'contabilidad_enterprise'],
            'unlimited_transactions': ['contabilidad_enterprise']
        };

        const allowedPlans = featureAccess[feature];
        return allowedPlans ? allowedPlans.includes(currentPlan.id) : true;
    };

    const getUsageWarning = () => {
        if (!subscriptionStatus?.transactionLimit) return null;
        
        const percentage = subscriptionStatus.usagePercentage;
        
        if (percentage >= 90) {
            return {
                type: 'error',
                message: 'Has alcanzado el 90% de tu límite de transacciones',
                action: 'Considera actualizar tu plan'
            };
        } else if (percentage >= 75) {
            return {
                type: 'warning',
                message: 'Has usado el 75% de tus transacciones mensuales',
                action: 'Monitorea tu uso'
            };
        }
        
        return null;
    };

    return {
        subscriptionStatus,
        loading,
        refreshStatus,
        upgradePlan,
        getSuggestedPlan,
        checkAccess,
        getUsageWarning
    };
};

export default useAccountingSubscription;