import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_PLANS, getPlanById, getPlanByConnectionCount, calculateMonthlyConnectionCost } from '../config/subscriptionPlans';

export interface SubscriptionStatus {
    planId: string;
    connectionCount: number;
    connectionLimit: number | null;
    usagePercentage: number;
    isOverLimit: boolean;
    daysUntilRenewal: number;
    price: number;
    canAddConnections: boolean;
    nextBillingDate: string;
}

export const useSubscription = (ispId: string) => {
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch subscription status from API
    const fetchSubscriptionStatus = async () => {
        try {
            setLoading(true);
            
            // Mock connection count for now (replace with real API call)
            const connectionCount = Math.floor(Math.random() * 120) + 8; // Random between 8-128
            
            // Get subscription info from API (or localStorage for now)
            const subscriptionData = await getStoredSubscription(ispId);
            const currentPlan = getPlanById(subscriptionData.planId) || SUBSCRIPTION_PLANS[0];
            
            // Calculate usage metrics
            const usagePercentage = currentPlan.connectionLimit 
                ? Math.round((connectionCount / currentPlan.connectionLimit) * 100)
                : 0;
                
            const isOverLimit = currentPlan.connectionLimit 
                ? connectionCount > currentPlan.connectionLimit
                : false;
                
            const canAddConnections = currentPlan.connectionLimit 
                ? connectionCount < currentPlan.connectionLimit
                : true;

            const status: SubscriptionStatus = {
                planId: currentPlan.id,
                connectionCount,
                connectionLimit: currentPlan.connectionLimit,
                usagePercentage,
                isOverLimit,
                daysUntilRenewal: subscriptionData.daysUntilRenewal || 30,
                price: currentPlan.price,
                canAddConnections,
                nextBillingDate: subscriptionData.nextBillingDate || getNextBillingDate()
            };

            setSubscriptionStatus(status);
            
            // Check for alerts
            checkUsageAlerts(status);
            
        } catch (error) {
            console.error('Error fetching subscription status:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get stored subscription data (temporary - replace with API)
    const getStoredSubscription = async (ispId: string) => {
        try {
            const stored = await AsyncStorage.getItem(`@subscription_${ispId}`);
            if (stored) {
                return JSON.parse(stored);
            }
            // Default to free plan
            return {
                planId: 'free',
                daysUntilRenewal: 30,
                nextBillingDate: getNextBillingDate()
            };
        } catch (error) {
            console.error('Error getting stored subscription:', error);
            return { planId: 'free', daysUntilRenewal: 30 };
        }
    };

    // Generate next billing date (30 days from now)
    const getNextBillingDate = (): string => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    };

    // Check for usage alerts
    const checkUsageAlerts = (status: SubscriptionStatus) => {
        if (status.isOverLimit) {
            Alert.alert(
                'Límite Excedido',
                `Has superado el límite de ${status.connectionLimit} conexiones. Actualiza tu plan para continuar agregando conexiones.`,
                [
                    { text: 'Actualizar Plan', onPress: () => navigateToUpgrade() },
                    { text: 'Entendido', style: 'cancel' }
                ]
            );
        } else if (status.usagePercentage >= 90) {
            Alert.alert(
                'Próximo al Límite',
                `Estás usando ${status.usagePercentage}% de tu límite de conexiones. Considera actualizar tu plan.`,
                [
                    { text: 'Ver Planes', onPress: () => navigateToUpgrade() },
                    { text: 'Más Tarde', style: 'cancel' }
                ]
            );
        }
    };

    // Navigate to upgrade screen (to be implemented)
    const navigateToUpgrade = () => {
        // navigation.navigate('SubscriptionUpgradeScreen', { currentPlan: subscriptionStatus?.planId });
        console.log('Navigate to upgrade screen');
    };

    // Upgrade plan
    const upgradePlan = async (newPlanId: string) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/upgrade-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ispId, newPlanId })
            });

            if (response.ok) {
                // Store new plan locally (temporary)
                await AsyncStorage.setItem(`@subscription_${ispId}`, JSON.stringify({
                    planId: newPlanId,
                    daysUntilRenewal: 30,
                    nextBillingDate: getNextBillingDate()
                }));
                
                // Refresh status
                await fetchSubscriptionStatus();
                
                Alert.alert('Éxito', 'Plan actualizado correctamente');
                return true;
            } else {
                throw new Error('Error al actualizar plan');
            }
        } catch (error) {
            console.error('Error upgrading plan:', error);
            Alert.alert('Error', 'No se pudo actualizar el plan');
            return false;
        }
    };

    // Check if can add connection
    const canAddConnection = (): boolean => {
        return subscriptionStatus?.canAddConnections || false;
    };

    // Get suggested plan based on current usage
    const getSuggestedPlan = () => {
        if (!subscriptionStatus) return null;
        
        const projectedConnections = Math.ceil(subscriptionStatus.connectionCount * 1.2); // 20% growth
        return getPlanByConnectionCount(projectedConnections);
    };

    useEffect(() => {
        if (ispId) {
            fetchSubscriptionStatus();
        }
    }, [ispId]);

    return {
        subscriptionStatus,
        loading,
        refreshStatus: fetchSubscriptionStatus,
        upgradePlan,
        canAddConnection,
        getSuggestedPlan
    };
};