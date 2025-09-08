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
import { useTheme } from '../../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ACCOUNTING_PLANS, getAccountingPlanById } from '../config/accountingPlans';

const { width } = Dimensions.get('window');

const ContabilidadDashboardSuscripcion = ({ route, navigation }) => {
    const { ispId } = route.params || {};
    const { isDarkMode } = useTheme();
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userToken, setUserToken] = useState('');
    const [monthlyTransactions, setMonthlyTransactions] = useState(0);
    const [accountingUsage, setAccountingUsage] = useState({
        transactionsUsed: 0,
        reportsGenerated: 0,
        lastActivity: null
    });

    const API_BASE = 'https://wellnet-rd.com:444/api';

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (userToken) {
            loadSubscriptionData();
            loadUsageData();
        }
    }, [userToken]);

    const loadUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            if (loginData && loginData.token) {
                setUserToken(loginData.token);
            } else {
                Alert.alert('Error', 'No se encontraron datos de autenticación');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadSubscriptionData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/accounting-subscription/status?isp_id=${ispId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setSubscriptionStatus(data.data);
            } else {
                console.log('No subscription found');
                setSubscriptionStatus(null);
            }
        } catch (error) {
            console.error('Error loading subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsageData = async () => {
        try {
            const response = await fetch(`${API_BASE}/accounting-usage/monthly?isp_id=${ispId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setAccountingUsage(data.data);
                setMonthlyTransactions(data.data.transactionsUsed || 0);
            }
        } catch (error) {
            console.error('Error loading usage data:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getUsageColor = (percentage) => {
        if (percentage >= 90) return '#EF4444';
        if (percentage >= 75) return '#F59E0B';
        return '#10B981';
    };

    const calculateUsagePercentage = () => {
        if (!subscriptionStatus?.currentPlan?.transactionLimit) return 0;
        return Math.min((monthlyTransactions / subscriptionStatus.currentPlan.transactionLimit) * 100, 100);
    };

    const getCurrentPlan = () => {
        if (!subscriptionStatus?.planId) return null;
        return getAccountingPlanById(subscriptionStatus.planId);
    };

    const UsageCard = () => {
        const currentPlan = getCurrentPlan();
        const usagePercentage = calculateUsagePercentage();

        return (
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                <View style={styles.cardHeader}>
                    <Icon name="analytics" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.cardTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        Uso de Contabilidad
                    </Text>
                </View>
                
                <View style={styles.usageContent}>
                    <View style={styles.usageStats}>
                        <Text style={[styles.usageNumber, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                            {monthlyTransactions}
                        </Text>
                        <Text style={[styles.usageLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            {currentPlan?.transactionLimit 
                                ? `de ${currentPlan.transactionLimit}` 
                                : 'ilimitadas'
                            }
                        </Text>
                        <Text style={[styles.usageLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            transacciones este mes
                        </Text>
                    </View>
                    
                    {currentPlan?.transactionLimit && (
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <View 
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${usagePercentage}%`,
                                            backgroundColor: getUsageColor(usagePercentage)
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.progressText, { color: getUsageColor(usagePercentage) }]}>
                                {usagePercentage.toFixed(1)}% usado
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const PlanCard = () => {
        const currentPlan = getCurrentPlan();

        return (
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                <View style={styles.cardHeader}>
                    <Icon name="business_center" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.cardTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        Plan de Contabilidad
                    </Text>
                </View>
                
                <View style={styles.planContent}>
                    {currentPlan ? (
                        <View style={styles.planInfo}>
                            <Text style={[styles.planName, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                                {currentPlan.name}
                            </Text>
                            <View style={styles.priceContainer}>
                                <Text style={[styles.planPrice, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                                    ${currentPlan.price}
                                </Text>
                                <Text style={[styles.priceLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    /mes
                                </Text>
                            </View>
                            
                            <View style={styles.featuresPreview}>
                                <Text style={[styles.featuresTitle, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                    Características principales:
                                </Text>
                                {currentPlan.features.slice(0, 3).map((feature, index) => (
                                    <View key={index} style={styles.featureItem}>
                                        <Icon name="check_circle" size={14} color="#10B981" />
                                        <Text style={[styles.featureText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                            {feature}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.noPlanInfo}>
                            <Text style={[styles.noPlanText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                No tienes un plan de contabilidad activo
                            </Text>
                        </View>
                    )}
                    
                    <TouchableOpacity 
                        style={[styles.upgradeButton, { backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB' }]}
                        onPress={() => navigation.navigate('ContabilidadSuscripcionScreen', { ispId })}
                    >
                        <Text style={styles.upgradeButtonText}>
                            {currentPlan ? 'Cambiar Plan' : 'Seleccionar Plan'}
                        </Text>
                        <Icon name="navigate_next" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const BillingCard = () => {
        const currentPlan = getCurrentPlan();

        return (
            <View style={[styles.card, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                <View style={styles.cardHeader}>
                    <Icon name="receipt" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.cardTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        Próxima Facturación
                    </Text>
                </View>
                
                <View style={styles.billingContent}>
                    <Text style={[styles.billingDate, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        {subscriptionStatus ? formatDate(subscriptionStatus.nextBillingDate) : 'No activo'}
                    </Text>
                    <Text style={[styles.billingAmount, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                        ${currentPlan?.price || 0} USD
                    </Text>
                    <Text style={[styles.billingDays, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {subscriptionStatus?.daysUntilRenewal || 0} días restantes
                    </Text>
                    
                    <TouchableOpacity 
                        style={[styles.historyButton, { borderColor: isDarkMode ? '#4B5563' : '#D1D5DB' }]}
                        onPress={() => navigation.navigate('ContabilidadBillingHistoryScreen', { ispId })}
                    >
                        <Text style={[styles.historyButtonText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Ver Historial de Facturación
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const ActivityCard = () => (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
                <Icon name="history" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                    Actividad Reciente
                </Text>
            </View>
            
            <View style={styles.activityContent}>
                <View style={styles.activityItem}>
                    <Icon name="receipt_long" size={20} color="#10B981" />
                    <View style={styles.activityText}>
                        <Text style={[styles.activityTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                            Reportes Generados
                        </Text>
                        <Text style={[styles.activitySubtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            {accountingUsage.reportsGenerated || 0} este mes
                        </Text>
                    </View>
                </View>
                
                <View style={styles.activityItem}>
                    <Icon name="update" size={20} color="#3B82F6" />
                    <View style={styles.activityText}>
                        <Text style={[styles.activityTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                            Última Actividad
                        </Text>
                        <Text style={[styles.activitySubtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            {accountingUsage.lastActivity 
                                ? formatDate(accountingUsage.lastActivity)
                                : 'Sin actividad reciente'
                            }
                        </Text>
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={[styles.activityButton, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
                    onPress={() => navigation.navigate('ContabilidadScreen', { ispId })}
                >
                    <Text style={[styles.activityButtonText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                        Ir a Contabilidad
                    </Text>
                    <Icon name="arrow_forward" size={16} color={isDarkMode ? '#D1D5DB' : '#374151'} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const styles = {
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
        },
        header: {
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            paddingTop: 60,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB',
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
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
        },
        refreshButton: {
            padding: 8,
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
            marginBottom: 16,
        },
        planPrice: {
            fontSize: 32,
            fontWeight: '700',
        },
        priceLabel: {
            fontSize: 16,
            marginLeft: 4,
        },
        featuresPreview: {
            alignItems: 'flex-start',
            width: '100%',
        },
        featuresTitle: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 8,
        },
        featureItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        featureText: {
            fontSize: 12,
            marginLeft: 8,
        },
        noPlanInfo: {
            alignItems: 'center',
            marginBottom: 20,
        },
        noPlanText: {
            fontSize: 16,
            textAlign: 'center',
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
        activityContent: {
            gap: 16,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        activityText: {
            marginLeft: 12,
            flex: 1,
        },
        activityTitle: {
            fontSize: 16,
            fontWeight: '600',
        },
        activitySubtitle: {
            fontSize: 14,
            marginTop: 2,
        },
        activityButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderRadius: 8,
            marginTop: 8,
        },
        activityButtonText: {
            fontSize: 14,
            fontWeight: '600',
            marginRight: 8,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: 16,
            fontSize: 16,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
        },
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow_back" size={24} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Dashboard Contabilidad</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={styles.loadingText}>Cargando información de suscripción...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow_back" size={24} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Dashboard Contabilidad</Text>
                    <TouchableOpacity 
                        style={styles.refreshButton}
                        onPress={() => {
                            loadSubscriptionData();
                            loadUsageData();
                        }}
                    >
                        <Icon name="refresh" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <UsageCard />
                <PlanCard />
                <BillingCard />
                <ActivityCard />
            </ScrollView>
        </View>
    );
};

export default ContabilidadDashboardSuscripcion;