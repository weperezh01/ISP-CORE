import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSubscription } from '../../hooks/useSubscription';
import { SUBSCRIPTION_PLANS, getPlanById, calculateAnnualSavings } from '../../config/subscriptionPlans';

const { width } = Dimensions.get('window');

const SubscriptionDashboard = ({ route, navigation }) => {
    const { ispId } = route.params || {};
    const { isDarkMode } = useTheme();
    const { subscriptionStatus, loading, refreshStatus, getSuggestedPlan } = useSubscription(ispId);
    
    // Backend plans state
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [userToken, setUserToken] = useState('');
    
    // User connections and calculated plan state
    const [connectionsData, setConnectionsData] = useState(null);
    const [loadingConnections, setLoadingConnections] = useState(true);
    const [userIdFromStorage, setUserIdFromStorage] = useState(null);

    const API_BASE = 'https://wellnet-rd.com:444/api';
    
    // Use calculated plan from connections if available, otherwise fallback to subscription status
    const calculatedPlan = connectionsData?.suggested_plan;
    const currentPlan = calculatedPlan || 
        (subscriptionStatus ? 
            (plans.find(p => p.id === subscriptionStatus.planId) || getPlanById(subscriptionStatus.planId)) : 
            null);
    const suggestedPlan = getSuggestedPlan();

    // Debug: Log what plan is being displayed
    useEffect(() => {
        if (currentPlan) {
            console.log('🎯 [DASHBOARD] Current plan being displayed:', {
                name: currentPlan.name,
                id: currentPlan.id,
                price: currentPlan.price,
                source: calculatedPlan ? 'calculated' : 'subscription_status',
                billable_connections: connectionsData?.billable_connections
            });
        }
    }, [currentPlan, calculatedPlan, connectionsData?.billable_connections]);

    useEffect(() => {
        loadUserToken();
    }, []);

    useEffect(() => {
        if (userToken) {
            console.log('🔄 [DASHBOARD] Token available, loading plans and connections...');
            loadPlansFromBackend();
            
            // Load user connections if we have userId
            if (userIdFromStorage) {
                loadUserConnections(userIdFromStorage);
            }
        } else if (userToken === '') {
            console.log('⚠️ [DASHBOARD] No token available, stopping loading');
            setPlansLoading(false);
            setLoadingConnections(false);
        }
    }, [userToken, userIdFromStorage]);

    // Debug useEffect
    useEffect(() => {
        console.log('📊 Dashboard State:', { 
            loading, 
            plansLoading, 
            userToken: userToken ? 'exists' : 'empty',
            plansCount: plans.length 
        });
    }, [loading, plansLoading, userToken, plans]);

    const loadUserToken = async () => {
        try {
            console.log('🔍 [DASHBOARD] Loading user token...');
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            if (loginData && loginData.token) {
                console.log('✅ [DASHBOARD] Token found, setting user token');
                setUserToken(loginData.token);
                
                // Extract userId from loginData
                const userIdValue = loginData.userId || loginData.id;
                if (userIdValue) {
                    setUserIdFromStorage(userIdValue);
                    console.log('✅ [DASHBOARD] User ID extracted:', userIdValue);
                }
            } else {
                console.warn('⚠️ [DASHBOARD] No token found, using fallback plans');
                setUserToken(''); // Set empty string to trigger useEffect
                setPlansLoading(false);
                setLoadingConnections(false);
            }
        } catch (error) {
            console.error('❌ [DASHBOARD] Error loading user token:', error);
            setUserToken(''); // Set empty string to trigger useEffect
            setPlansLoading(false);
            setLoadingConnections(false);
        }
    };

    const loadPlansFromBackend = async () => {
        try {
            setPlansLoading(true);
            
            // Timeout de seguridad de 10 segundos
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout loading plans')), 10000)
            );

            const fetchPromise = fetch(`${API_BASE}/subscription-plans`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]);
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Transform backend plans to match expected format
                const transformedPlans = data.data.map(plan => ({
                    id: plan.id,
                    name: plan.name,
                    price: parseFloat(plan.price || 0),
                    pricePerConnection: parseFloat(plan.price_per_connection || 0),
                    connectionLimit: plan.connection_limit,
                    features: Array.isArray(plan.features) ? plan.features : 
                              (typeof plan.features === 'string' ? [plan.features] : []),
                    recommended: Boolean(plan.recommended)
                }));
                
                setPlans(transformedPlans);
                console.log('✅ Plans loaded for dashboard:', transformedPlans.length, 'plans');
            } else {
                console.error('Error loading plans:', data.message);
                setPlans([]);
            }
        } catch (error) {
            console.error('Error loading plans from backend:', error);
            setPlans([]);
        } finally {
            setPlansLoading(false);
        }
    };

    const loadUserConnections = async (userIdToUse) => {
        try {
            setLoadingConnections(true);
            console.log('🔍 [DASHBOARD] Loading user connections for userId:', userIdToUse);
            
            const url = `${API_BASE}/usuarios/connections-count?user_id=${userIdToUse}`;
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            const response = await fetch(url, requestOptions);
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ [DASHBOARD] Connections data received:', data.data);
                setConnectionsData(data.data);
            } else {
                console.error('❌ [DASHBOARD] Error loading connections:', data.message);
                setConnectionsData(null);
            }
        } catch (error) {
            console.error('❌ [DASHBOARD] Error fetching connections:', error);
            setConnectionsData(null);
        } finally {
            setLoadingConnections(false);
        }
    };

    // Calculate suggested plan based on connections
    useEffect(() => {
        // Only calculate if we have connections data and plans, and haven't already calculated
        if (connectionsData && plans.length > 0 && !connectionsData.suggested_plan) {
            console.log('🎯 [DASHBOARD] Calculating suggested plan...');
            console.log('📊 [DASHBOARD] Full connections data:', connectionsData);
            console.log('📋 [DASHBOARD] Available plans count:', plans.length);
            
            // Handle different data structures (from our enhanced backend vs simple backend)
            let billableConnections = 0;
            
            if (connectionsData.totals) {
                // Enhanced structure with totals
                billableConnections = (connectionsData.totals.active || 0) + 
                                    (connectionsData.totals.suspended || 0) + 
                                    (connectionsData.totals.damaged || 0);
            } else {
                // Simple structure (fallback)
                billableConnections = (connectionsData.total_active || 0) + 
                                    (connectionsData.total_suspended || 0) + 
                                    (connectionsData.total_damaged || 0);
            }
            
            console.log('💰 [DASHBOARD] Billable connections calculated:', billableConnections);
            console.log('📋 [DASHBOARD] Connection breakdown:', {
                active: connectionsData.totals?.active || connectionsData.total_active || 0,
                suspended: connectionsData.totals?.suspended || connectionsData.total_suspended || 0,
                damaged: connectionsData.totals?.damaged || connectionsData.total_damaged || 0,
                total: connectionsData.totals?.total || connectionsData.total_connections || 0
            });
            
            // If no billable connections, use a default minimum plan (not free plan)
            if (billableConnections === 0) {
                console.log('⚠️ [DASHBOARD] No billable connections found, using basic plan');
                // Find basic plan (not free) as default
                const basicPlan = plans.find(p => p.id === 'basic') || plans.find(p => parseFloat(p.price) > 0);
                if (basicPlan) {
                    const defaultSuggestedPlan = {
                        ...basicPlan,
                        reason: 'Plan básico por defecto (sin conexiones activas)'
                    };
                    setConnectionsData(prev => ({
                        ...prev,
                        suggested_plan: defaultSuggestedPlan,
                        billable_connections: 0
                    }));
                    return;
                }
            }
            
            // Filter out free plan for users with connections
            const availablePlans = plans.filter(plan => {
                // Always exclude free plan for business users with any connections
                if (billableConnections > 0 && (plan.id === 'plan_gratuito' || parseFloat(plan.price) === 0)) {
                    console.log(`🚫 [DASHBOARD] Excluding free plan: ${plan.name} for ${billableConnections} connections`);
                    return false;
                }
                return true;
            });
            
            console.log('📋 [DASHBOARD] Available plans for calculation:', availablePlans.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                limit: p.connectionLimit || p.connection_limit
            })));
            
            // Find the most economical plan that covers the connections
            const sortedPlans = [...availablePlans].sort((a, b) => {
                const priceA = parseFloat(a.price) || 0;
                const priceB = parseFloat(b.price) || 0;
                return priceA - priceB;
            });

            console.log('💰 [DASHBOARD] Plans sorted by price:', sortedPlans.map(p => ({
                name: p.name,
                price: p.price,
                limit: p.connectionLimit || p.connection_limit || 'unlimited'
            })));

            let suggestedPlan = null;
            for (const plan of sortedPlans) {
                const planLimit = plan.connectionLimit || plan.connection_limit;
                const covers = !planLimit || planLimit >= billableConnections;
                console.log(`🔍 [DASHBOARD] Evaluating ${plan.name}: limit=${planLimit || 'unlimited'}, covers ${billableConnections}=${covers}`);
                
                if (covers) {
                    suggestedPlan = {
                        ...plan,
                        connection_limit: planLimit,
                        reason: `Cubre ${billableConnections} conexiones facturables con el menor costo`
                    };
                    console.log(`✅ [DASHBOARD] Selected plan: ${plan.name} ($${plan.price})`);
                    break;
                }
            }

            // If no plan has enough limit, use the highest capacity plan
            if (!suggestedPlan && sortedPlans.length > 0) {
                const highestPlan = sortedPlans[sortedPlans.length - 1];
                console.log(`⚠️ [DASHBOARD] No plan covers ${billableConnections} connections, using highest: ${highestPlan.name}`);
                suggestedPlan = {
                    ...highestPlan,
                    connection_limit: highestPlan.connectionLimit || highestPlan.connection_limit,
                    reason: `Plan de mayor capacidad disponible (${billableConnections} conexiones exceden límites)`
                };
            }

            if (suggestedPlan) {
                console.log('🎉 [DASHBOARD] Final suggested plan:', {
                    name: suggestedPlan.name,
                    price: suggestedPlan.price,
                    limit: suggestedPlan.connection_limit,
                    reason: suggestedPlan.reason
                });
                setConnectionsData(prev => ({
                    ...prev,
                    suggested_plan: suggestedPlan,
                    billable_connections: billableConnections
                }));
            } else {
                console.log('❌ [DASHBOARD] No suggested plan calculated');
            }
        }
    }, [connectionsData, plans]);

    // Fallback: if connections data fails to load, show a default plan
    useEffect(() => {
        if (!loadingConnections && !connectionsData && plans.length > 0) {
            console.log('⚠️ [DASHBOARD] Connections data failed to load, using fallback plan');
            // Use basic plan as fallback
            const fallbackPlan = plans.find(p => p.id === 'basic') || plans.find(p => parseFloat(p.price) > 0);
            if (fallbackPlan) {
                setConnectionsData({
                    suggested_plan: {
                        ...fallbackPlan,
                        reason: 'Plan por defecto (no se pudieron cargar conexiones)'
                    },
                    billable_connections: 0,
                    totals: { active: 0, suspended: 0, damaged: 0, total: 0 }
                });
            }
        }
    }, [loadingConnections, connectionsData, plans.length]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return '#EF4444';
        if (percentage >= 75) return '#F59E0B';
        return '#10B981';
    };

    const UsageCard = () => (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
                <Icon name="analytics" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                    Uso Actual
                </Text>
            </View>
            
            <View style={styles.usageContent}>
                <View style={styles.usageStats}>
                    <Text style={[styles.usageNumber, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        {subscriptionStatus?.clientCount || 0}
                    </Text>
                    <Text style={[styles.usageLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {subscriptionStatus?.clientLimit ? `de ${subscriptionStatus.clientLimit}` : 'ilimitados'}
                    </Text>
                    <Text style={[styles.usageLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        clientes activos
                    </Text>
                </View>
                
                {subscriptionStatus?.clientLimit && (
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                            <View 
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${subscriptionStatus.usagePercentage}%`,
                                        backgroundColor: getUsageColor(subscriptionStatus.usagePercentage)
                                    }
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressText, { color: getUsageColor(subscriptionStatus.usagePercentage) }]}>
                            {subscriptionStatus.usagePercentage}% usado
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    const PlanCard = () => (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
                <Icon name="payment" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                    {calculatedPlan ? 'Tu Tarifa Calculada' : 'Plan Actual'}
                </Text>
            </View>
            
            <View style={styles.planContent}>
                {/* Loading state */}
                {loadingConnections && !connectionsData ? (
                    <View style={styles.planInfo}>
                        <ActivityIndicator size="small" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                        <Text style={[styles.loadingText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Calculando tarifa...
                        </Text>
                    </View>
                ) : currentPlan ? (
                    <View style={styles.planInfo}>
                        {/* Plan Name and Price */}
                        <Text style={[styles.planName, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                            {currentPlan.name}
                        </Text>
                        <View style={styles.priceContainer}>
                            <Text style={[styles.planPrice, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                                US${parseFloat(currentPlan.price || 0).toFixed(2)}
                            </Text>
                            <Text style={[styles.priceLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                /mes
                            </Text>
                        </View>
                        
                        {/* Connection Summary */}
                        {connectionsData && (
                            <View style={styles.connectionSummaryContainer}>
                                <View style={styles.connectionSummaryItem}>
                                    <Text style={[styles.connectionSummaryNumber, { color: '#10B981' }]}>
                                        {connectionsData.billable_connections || connectionsData.totals?.active || 0}
                                    </Text>
                                    <Text style={[styles.connectionSummaryLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        conexiones facturables
                                    </Text>
                                </View>
                                
                                {connectionsData.totals?.total > (connectionsData.billable_connections || 0) && (
                                    <View style={styles.connectionSummaryItem}>
                                        <Text style={[styles.connectionSummaryNumber, { color: '#6B7280' }]}>
                                            {connectionsData.totals.total - (connectionsData.billable_connections || 0)}
                                        </Text>
                                        <Text style={[styles.connectionSummaryLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                            no facturables
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                        
                        {/* Connection Limit */}
                        {currentPlan.connection_limit && (
                            <View style={styles.connectionLimitContainer}>
                                <Icon name="people" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <Text style={[styles.connectionLimitText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Hasta {currentPlan.connection_limit} conexiones
                                </Text>
                            </View>
                        )}
                        
                        {/* Calculated reason */}
                        {calculatedPlan && currentPlan.reason && (
                            <Text style={[styles.planReason, { color: isDarkMode ? '#34D399' : '#059669' }]}>
                                {currentPlan.reason}
                            </Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.planInfo}>
                        <Text style={[styles.planName, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            No hay plan calculado
                        </Text>
                        <Text style={[styles.noPlanSubtext, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                            Selecciona un plan basado en tus conexiones
                        </Text>
                    </View>
                )}
                
                <TouchableOpacity 
                    style={[styles.upgradeButton, { backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB' }]}
                    onPress={() => navigation.navigate('TarifasConexionesScreen', { 
                        ispId, 
                        currentPlan: subscriptionStatus?.planId,
                        backendPlans: plans.length > 0 ? plans : undefined
                    })}
                >
                    <Text style={styles.upgradeButtonText}>Ver Tarifas</Text>
                    <Icon name="navigate_next" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const BillingCard = () => (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
                <Icon name="receipt" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                    Próxima Facturación
                </Text>
            </View>
            
            <View style={styles.billingContent}>
                <Text style={[styles.billingDate, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                    {subscriptionStatus ? formatDate(subscriptionStatus.nextBillingDate) : 'Cargando...'}
                </Text>
                <Text style={[styles.billingAmount, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                    US${currentPlan?.price || 0}
                </Text>
                <Text style={[styles.billingDays, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                    {subscriptionStatus?.daysUntilRenewal || 0} días restantes
                </Text>
                
                <TouchableOpacity 
                    style={[styles.historyButton, { borderColor: isDarkMode ? '#4B5563' : '#D1D5DB' }]}
                    onPress={() => navigation.navigate('BillingHistoryScreen', { ispId })}
                >
                    <Text style={[styles.historyButtonText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        Ver Historial
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const AccountingCard = () => (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
                <Icon name="business_center" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                    Servicios de Contabilidad
                </Text>
            </View>
            
            <View style={styles.accountingContent}>
                <Text style={[styles.accountingDescription, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                    Optimiza la gestión financiera de tu ISP con nuestros servicios profesionales de contabilidad.
                </Text>
                
                <View style={styles.accountingFeatures}>
                    <View style={styles.accountingFeature}>
                        <Icon name="check_circle" size={16} color="#10B981" />
                        <Text style={[styles.accountingFeatureText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Reportes financieros automatizados
                        </Text>
                    </View>
                    <View style={styles.accountingFeature}>
                        <Icon name="check_circle" size={16} color="#10B981" />
                        <Text style={[styles.accountingFeatureText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Control de gastos e ingresos
                        </Text>
                    </View>
                    <View style={styles.accountingFeature}>
                        <Icon name="check_circle" size={16} color="#10B981" />
                        <Text style={[styles.accountingFeatureText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Cumplimiento normativo RD
                        </Text>
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={[styles.accountingButton, { backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB' }]}
                    onPress={() => navigation.navigate('ContabilidadSuscripcionScreen', { ispId })}
                >
                    <Text style={styles.accountingButtonText}>Ver Planes de Contabilidad</Text>
                    <Icon name="navigate_next" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const SuggestionCard = () => {
        if (!suggestedPlan || suggestedPlan.id === currentPlan?.id) return null;
        
        return (
            <View style={[styles.card, styles.suggestionCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                <View style={styles.cardHeader}>
                    <Icon name="lightbulb" size={24} color="#F59E0B" />
                    <Text style={[styles.cardTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        Recomendación
                    </Text>
                </View>
                
                <Text style={[styles.suggestionText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                    Basado en tu cantidad de conexiones, te recomendamos el plan {suggestedPlan.name} 
                    para optimizar costos y evitar limitaciones.
                </Text>
                
                <TouchableOpacity 
                    style={[styles.suggestionButton, { backgroundColor: '#F59E0B' }]}
                    onPress={() => navigation.navigate('TarifasConexionesScreen', { 
                        ispId, 
                        currentPlan: subscriptionStatus?.planId,
                        recommendedPlan: suggestedPlan.id,
                        backendPlans: plans.length > 0 ? plans : undefined
                    })}
                >
                    <Text style={styles.suggestionButtonText}>Tarifas</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Solo mostrar loading inicial
    if (plansLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }]}>
                <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.loadingText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                    Cargando información de suscripción...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow_back" size={24} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        Suscripción
                    </Text>
                    <TouchableOpacity onPress={() => {
                        refreshStatus();
                        if (userToken) {
                            loadPlansFromBackend();
                            if (userIdFromStorage) {
                                loadUserConnections(userIdFromStorage);
                            }
                        }
                    }}>
                        <Icon name="refresh" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <UsageCard />
                <PlanCard />
                <BillingCard />
                <AccountingCard />
                <SuggestionCard />
            </ScrollView>
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        marginBottom: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    suggestionCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 12,
    },
    usageContent: {
        alignItems: 'center',
    },
    usageStats: {
        alignItems: 'center',
        marginBottom: 20,
    },
    usageNumber: {
        fontSize: 48,
        fontWeight: '700',
    },
    usageLabel: {
        fontSize: 16,
        textAlign: 'center',
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    planContent: {
        alignItems: 'center',
    },
    planInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    planName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    planPrice: {
        fontSize: 32,
        fontWeight: '700',
    },
    priceLabel: {
        fontSize: 16,
        marginLeft: 4,
    },
    pricePerConnectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    pricePerConnectionText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    connectionLimitContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 4,
    },
    connectionLimitText: {
        fontSize: 14,
        marginLeft: 4,
    },
    noPlanSubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
        fontStyle: 'italic',
    },
    connectionSummaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 12,
        paddingHorizontal: 8,
    },
    connectionSummaryItem: {
        alignItems: 'center',
    },
    connectionSummaryNumber: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    connectionSummaryLabel: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    planReason: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
        fontWeight: '500',
    },
    loadingText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: '100%',
    },
    upgradeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
        flexShrink: 1,
        textAlign: 'center',
    },
    billingContent: {
        alignItems: 'center',
    },
    billingDate: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    billingAmount: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    billingDays: {
        fontSize: 14,
        marginBottom: 20,
    },
    historyButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
    },
    historyButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    suggestionText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    suggestionButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'center',
        minWidth: 120,
    },
    suggestionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        flexShrink: 1,
    },
    // Accounting card styles
    accountingContent: {
        alignItems: 'flex-start',
    },
    accountingDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
        textAlign: 'center',
    },
    accountingFeatures: {
        width: '100%',
        marginBottom: 16,
    },
    accountingFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    accountingFeatureText: {
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
    },
    accountingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        width: '100%',
    },
    accountingButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        marginRight: 8,
    },
};

export default SubscriptionDashboard;