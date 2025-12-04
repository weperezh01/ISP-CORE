import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { ACCOUNTING_PLANS, AccountingPlan, calculateAccountingAnnualSavings } from '../config/accountingPlans';

const FEATURE_PRODUCTS = [
    {
        id: 'contabilidad',
        title: 'Contabilidad Inteligente',
        description: 'Automatiza estados financieros, conciliaciones y reportes fiscales.',
        icon: 'receipt-long',
        accent: '#3B82F6',
        availability: 'Suscripción disponible'
    },
    {
        id: 'sms-engagement',
        title: 'Engagement SMS',
        description: 'Segmenta audiencias y crea campañas omnicanal con seguimiento en tiempo real.',
        icon: 'sms',
        accent: '#8B5CF6',
        availability: 'Próximamente'
    },
    {
        id: 'automation-suite',
        title: 'Automation Suite',
        description: 'Flujos automáticos para cobranza, onboarding y retención de clientes.',
        icon: 'flash-on',
        accent: '#F97316',
        availability: 'En desarrollo'
    }
];

const { width } = Dimensions.get('window');

const ContabilidadSuscripcionScreen = ({ route, navigation }) => {
    const { ispId } = route.params || {};
    const { isDarkMode } = useTheme();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [recommendedPlan, setRecommendedPlan] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userToken, setUserToken] = useState('');
    const [monthlyTransactions, setMonthlyTransactions] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [availablePlans, setAvailablePlans] = useState(ACCOUNTING_PLANS);

    const API_BASE = 'https://wellnet-rd.com:444/api';

    useEffect(() => {
        loadUserData().then(() => {
            logInitialState();
        });
    }, []);

    const logInitialState = () => {
        const currentIspId = route.params?.ispId || ispId;
        console.log('🚀 [SUBSCRIPTION] Inicializando ContabilidadSuscripcionScreen');
        console.log('  🏢 ISP ID:', currentIspId);
        console.log('  🌐 API Base:', API_BASE);
        console.log('  📦 Planes locales disponibles:', ACCOUNTING_PLANS.length);
        console.log('  📋 Planes:', ACCOUNTING_PLANS.map(p => ({ id: p.id, name: p.name, price: p.price })));
        
        // Validación crítica del ISP ID
        if (!currentIspId) {
            console.error('❌ [SUBSCRIPTION] ISP ID es undefined! Esto causará errores en las peticiones.');
            Alert.alert('Error', 'ID de ISP no disponible. Regresa y selecciona un ISP válido.');
        }
    };

    useEffect(() => {
        const currentIspId = route.params?.ispId || ispId;
        if (userToken && currentIspId) {
            loadAvailablePlans();
            loadUserCount();
            loadMonthlyTransactions();
            loadAccountingSubscriptionStatus();
        } else if (userToken && !currentIspId) {
            console.error('❌ [SUBSCRIPTION] No se puede cargar datos sin ISP ID');
        }
    }, [userToken, route.params?.ispId, ispId]);

    useEffect(() => {
        if (userCount > 0 && availablePlans.length > 0) {
            determineRecommendedPlan();
        }
    }, [userCount, availablePlans]);

    const loadUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            if (loginData && loginData.token) {
                setUserToken(loginData.token);
                
                // Si no hay ispId en parámetros, intentar obtenerlo de AsyncStorage o del usuario
                if (!ispId) {
                    console.log('⚠️ [SUBSCRIPTION] ISP ID no encontrado en parámetros, buscando alternativas...');
                    
                    try {
                        // Intentar obtener el ISP ID seleccionado previamente
                        const selectedIspId = await AsyncStorage.getItem('@selectedIspId');
                        if (selectedIspId) {
                            console.log('📋 [SUBSCRIPTION] ISP ID encontrado en AsyncStorage:', selectedIspId);
                            // Actualizar el parámetro route para futuros usos
                            route.params = { ...route.params, ispId: selectedIspId };
                        } else if (loginData.isp) {
                            // Usar el ISP del usuario logueado como fallback
                            console.log('📋 [SUBSCRIPTION] Usando ISP del usuario logueado:', loginData.isp);
                            route.params = { ...route.params, ispId: loginData.isp.toString() };
                        } else {
                            console.error('❌ [SUBSCRIPTION] No se encontró ISP ID en ningún lugar');
                            Alert.alert('Error', 'No se pudo determinar el ISP. Regresa y selecciona un ISP válido.');
                            navigation.goBack();
                            return;
                        }
                    } catch (asyncError) {
                        console.error('❌ [SUBSCRIPTION] Error al obtener ISP ID:', asyncError);
                        Alert.alert('Error', 'Error al obtener información del ISP');
                        navigation.goBack();
                        return;
                    }
                }
            } else {
                Alert.alert('Error', 'No se encontraron datos de autenticación');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            Alert.alert('Error', 'Error al cargar datos del usuario');
        }
    };

    const handleExploreProduct = (productId) => {
        if (productId === 'contabilidad') {
            if (isSubscribed) {
                navigation.navigate('ContabilidadDashboardSuscripcion', { ispId: route.params?.ispId || ispId });
            } else {
                setShowConfirmModal(true);
            }
            return;
        }
        Alert.alert('Próximamente', 'Estamos preparando este producto. Regresa pronto para más novedades.');
    };

    const loadAvailablePlans = async () => {
        try {
            console.log('🔍 [SUBSCRIPTION] Cargando planes disponibles...');
            
            // Cargar planes locales primero como fallback
            console.log('📋 [SUBSCRIPTION] Cargando planes locales como base');
            setAvailablePlans(ACCOUNTING_PLANS);
            
            const response = await fetch(`${API_BASE}/accounting/plans`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ [SUBSCRIPTION] Planes del servidor cargados:', data.data?.length || 0);
                // Convertir estructura de servidor a formato local
                const normalizedPlans = (data.data || []).map(plan => ({
                    id: plan.id,
                    name: plan.name,
                    price: plan.price,
                    pricePerTransaction: plan.price_per_transaction,
                    transactionLimit: plan.transaction_limit,
                    features: plan.features,
                    recommended: plan.recommended || false,
                    popular: plan.popular || false,
                    color: plan.color || '#3B82F6',
                    icon: plan.icon || 'account_balance'
                }));
                setAvailablePlans(normalizedPlans);
            } else {
                console.error('❌ [SUBSCRIPTION] Error loading plans:', data.message);
                console.log('📋 [SUBSCRIPTION] Manteniendo planes locales');
            }
        } catch (error) {
            console.error('❌ [SUBSCRIPTION] Error fetching plans:', error);
            console.log('📋 [SUBSCRIPTION] Manteniendo planes locales por error de conexión');
        }
    };

    const loadUserCount = async () => {
        try {
            const currentIspId = route.params?.ispId || ispId;
            console.log('🔍 [USER-COUNT] Cargando cantidad de usuarios...');
            const response = await fetch(`${API_BASE}/isp/${currentIspId}/users/count`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const responseText = await response.text();
            
            try {
                const data = JSON.parse(responseText);
                if (response.ok && data.success) {
                    console.log('✅ [USER-COUNT] Usuarios cargados:', data.data.userCount);
                    setUserCount(data.data.userCount || 0);
                } else {
                    console.log('❌ [USER-COUNT] Error del servidor:', data.message);
                    // Fallback: usar cantidad por defecto para testing
                    setUserCount(10); // Valor por defecto para testing
                }
            } catch (jsonError) {
                console.error('❌ [USER-COUNT] Error parsing JSON:', jsonError);
                console.log('Response text:', responseText);
                // Fallback: usar cantidad por defecto para testing
                setUserCount(10); // Valor por defecto para testing
            }
        } catch (error) {
            console.error('❌ [USER-COUNT] Error loading user count:', error);
            // Fallback: usar cantidad por defecto para testing
            setUserCount(10); // Valor por defecto para testing
        }
    };

    const determineRecommendedPlan = () => {
        // Lógica para determinar el plan basado en cantidad de usuarios
        // Coincide con la lógica del backend:
        // 1 usuario → Plan Básico (ID: 1)
        // 2-5 usuarios → Plan Profesional (ID: 2) 
        // 6+ usuarios → Plan Empresarial (ID: 3)
        
        let recommendedPlan = null;
        
        console.log('🎯 [PLAN-SELECTION] Determinando plan para', userCount, 'usuarios');
        
        if (userCount === 1) {
            recommendedPlan = availablePlans.find(plan => plan.id === 'contabilidad_basico');
            console.log('📋 [PLAN-SELECTION] 1 usuario → Plan Básico');
        } else if (userCount >= 2 && userCount <= 5) {
            recommendedPlan = availablePlans.find(plan => plan.id === 'contabilidad_profesional');
            console.log('📋 [PLAN-SELECTION] 2-5 usuarios → Plan Profesional');
        } else if (userCount >= 6) {
            recommendedPlan = availablePlans.find(plan => plan.id === 'contabilidad_enterprise');
            console.log('📋 [PLAN-SELECTION] 6+ usuarios → Plan Empresarial');
        }

        if (recommendedPlan) {
            console.log('✅ [PLAN-SELECTION] Plan recomendado:', recommendedPlan.name);
            setRecommendedPlan(recommendedPlan);
        } else {
            // Fallback al plan profesional si no encuentra uno específico
            console.log('⚠️ [PLAN-SELECTION] Usando fallback al plan profesional');
            setRecommendedPlan(availablePlans[1] || availablePlans[0]);
        }
    };

    const loadAccountingSubscriptionStatus = async () => {
        try {
            const currentIspId = route.params?.ispId || ispId;
            setLoading(true);
            console.log('🔍 [SUBSCRIPTION] Verificando estado de suscripción...');
            const response = await fetch(`${API_BASE}/accounting/subscription/status/${currentIspId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const responseText = await response.text();
            
            try {
                const data = JSON.parse(responseText);
                if (response.ok && data.success) {
                    // Manejo seguro de data.data que puede ser null
                    const subscriptionData = data.data || {};
                    const subscriptionStatus = subscriptionData.isSubscribed || false;
                    setIsSubscribed(subscriptionStatus);
                    console.log('✅ [SUBSCRIPTION] Estado de suscripción:', subscriptionStatus ? 'Activo' : 'Inactivo');
                    
                    // Si hay plan actual, guardarlo
                    if (subscriptionData.current_plan) {
                        console.log('📋 [SUBSCRIPTION] Plan actual:', subscriptionData.current_plan.name);
                    }
                } else {
                    console.log('❌ [SUBSCRIPTION] Error del servidor:', data.message);
                    setIsSubscribed(false);
                }
            } catch (jsonError) {
                console.error('❌ [SUBSCRIPTION] Error parsing JSON:', jsonError);
                console.log('Response text:', responseText);
                setIsSubscribed(false);
            }
        } catch (error) {
            console.error('❌ [SUBSCRIPTION] Error loading subscription status:', error);
            setIsSubscribed(false);
        } finally {
            setLoading(false);
        }
    };

    const loadMonthlyTransactions = async () => {
        try {
            const currentIspId = route.params?.ispId || ispId;
            const response = await fetch(`${API_BASE}/accounting-transactions/count?isp_id=${currentIspId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const responseText = await response.text();
            
            try {
                const data = JSON.parse(responseText);
                if (response.ok && data.success) {
                    setMonthlyTransactions(data.data.monthlyCount || 0);
                } else {
                    console.log('Transaction count API returned error:', data.message || 'Unknown error');
                    setMonthlyTransactions(0);
                }
            } catch (jsonError) {
                console.error('Error parsing transaction count response:', jsonError);
                console.log('Response text:', responseText);
                setMonthlyTransactions(0);
            }
        } catch (error) {
            console.error('Error loading transaction count:', error);
            setMonthlyTransactions(0);
        }
    };

    const handleToggleSubscription = () => {
        setShowConfirmModal(true);
    };

    const confirmToggleSubscription = async () => {
        // Validación previa crítica
        const currentIspId = route.params?.ispId || ispId;
        if (!currentIspId) {
            console.error('❌ [SUBSCRIPTION] ISP ID es undefined, cancelando operación');
            Alert.alert('Error', 'ID de ISP no disponible. No se puede proceder con la operación.');
            return;
        }

        if (!recommendedPlan && !isSubscribed) {
            console.error('❌ [SUBSCRIPTION] No hay plan recomendado, cancelando operación');
            Alert.alert('Error', 'No se pudo determinar el plan recomendado. Intenta de nuevo.');
            return;
        }

        try {
            setProcessing(true);
            const action = isSubscribed ? 'deactivate' : 'activate';
            const actionText = isSubscribed ? 'Desactivando' : 'Activando';
            
            console.log(`🔄 [SUBSCRIPTION] ${actionText} servicio de contabilidad...`);
            console.log(`  📋 Endpoint: ${API_BASE}/accounting/subscription/toggle`);
            console.log(`  🏢 ISP ID: ${currentIspId}`);
            console.log(`  👥 User Count: ${userCount}`);
            console.log(`  📦 Plan Recomendado: ${recommendedPlan?.name} (ID: ${recommendedPlan?.id})`);
            
            const requestBody = {
                ispId: parseInt(currentIspId),
                action: action
            };
            
            const response = await fetch(`${API_BASE}/accounting/subscription/toggle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log(`📊 [SUBSCRIPTION] Response status: ${response.status}`);
            const responseText = await response.text();
            console.log(`📋 [SUBSCRIPTION] Response text: ${responseText}`);


            try {
                // Verificar si la respuesta es HTML (error de servidor)
                if (responseText.trim().startsWith('<!DOCTYPE html') || responseText.trim().startsWith('<html')) {
                    console.error('❌ [SUBSCRIPTION] Servidor devolvió HTML en lugar de JSON');
                    throw new Error('Respuesta inesperada del servidor (HTML)');
                }
                
                const data = JSON.parse(responseText);
                
                if (response.ok && data.success) {
                    const newStatus = !isSubscribed;
                    setIsSubscribed(newStatus);
                    
                    console.log(`✅ [SUBSCRIPTION] ${newStatus ? 'Activado' : 'Desactivado'} exitosamente`);
                    
                    // Si hay plan asignado automáticamente por el backend, usarlo
                    if (data.data && data.data.recommendedPlan) {
                        const backendPlan = data.data.recommendedPlan;
                        
                        // Asegurar que el plan tenga todas las propiedades necesarias
                        const safePlan = {
                            id: backendPlan.id || 'contabilidad_profesional',
                            name: backendPlan.name || 'Plan Contabilidad',
                            price: backendPlan.price || 500,
                            features: backendPlan.features || [
                                'Facturación automática',
                                'Reportes financieros',
                                'Soporte técnico',
                                'Backup automático'
                            ],
                            color: backendPlan.color || '#3B82F6',
                            icon: backendPlan.icon || 'account_balance',
                            transaction_limit: backendPlan.transaction_limit,
                            price_per_transaction: backendPlan.price_per_transaction || 0.35,
                            reason: backendPlan.reason || 'Plan recomendado'
                        };
                        
                        setRecommendedPlan(safePlan);
                        console.log(`📦 [SUBSCRIPTION] Plan asignado automáticamente: ${safePlan.name}`);
                    }
                    
                    // Información adicional sobre facturación
                    if (data.data && data.data.billing_integration) {
                        console.log(`💰 [BILLING] Facturación integrada:`, data.data.billing_integration);
                    }
                    
                    const actualPlan = (data.data && data.data.recommendedPlan) || recommendedPlan;
                    
                    Alert.alert(
                        newStatus ? '¡Suscripción Activada!' : '¡Suscripción Desactivada!',
                        newStatus 
                            ? `El servicio de contabilidad "${actualPlan?.name}" ha sido activado automáticamente basado en tu número de usuarios y se agregará $${actualPlan?.price} a tu factura mensual.`
                            : `El servicio de contabilidad ha sido desactivado y se eliminará de tu factura mensual.`,
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    setShowConfirmModal(false);
                                    // Recargar estado para reflejar cambios
                                    loadAccountingSubscriptionStatus();
                                }
                            }
                        ]
                    );
                } else {
                    console.error(`❌ [SUBSCRIPTION] Error del servidor: ${data.message}`);
                    Alert.alert('Error', data.message || 'Error al cambiar suscripción');
                }
            } catch (jsonError) {
                console.error('❌ [SUBSCRIPTION] Error parsing JSON:', jsonError);
                console.log('Response text:', responseText);
                Alert.alert('Error', 'Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('❌ [SUBSCRIPTION] Error toggling subscription:', error);
            Alert.alert('Error', 'Error de conexión al cambiar suscripción');
        } finally {
            setProcessing(false);
        }
    };


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
        dashboardButton: {
            backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        dashboardButtonText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
            marginLeft: 4,
        },
        content: {
            flex: 1,
            padding: 16,
        },
        heroSection: {
            paddingHorizontal: 12,
            paddingTop: 4,
            paddingBottom: 12,
        },
        heroCard: {
            borderRadius: 24,
            padding: 20,
        },
        heroBadge: {
            color: isDarkMode ? '#DBEAFE' : '#1E3A8A',
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 10,
        },
        heroTitle: {
            fontSize: 24,
            fontWeight: '800',
            color: isDarkMode ? '#FFFFFF' : '#0F172A',
            marginBottom: 8,
        },
        heroSubtitle: {
            fontSize: 14,
            color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)',
            lineHeight: 20,
            marginBottom: 16,
        },
        heroStatsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 14,
        },
        heroStat: {
            flex: 1,
            paddingRight: 10,
        },
        heroStatValue: {
            fontSize: 20,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#0F172A',
        },
        heroStatLabel: {
            fontSize: 12,
            color: isDarkMode ? 'rgba(255,255,255,0.75)' : 'rgba(31,41,55,0.75)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        heroActions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        heroPrimaryButton: {
            backgroundColor: '#FFFFFF',
            borderRadius: 999,
            paddingVertical: 10,
            paddingHorizontal: 18,
            marginRight: 12,
            marginBottom: 10,
        },
        heroPrimaryText: {
            color: '#1D4ED8',
            fontWeight: '700',
        },
        heroSecondaryButton: {
            borderRadius: 999,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.6)' : '#1E3A8A',
            paddingVertical: 10,
            paddingHorizontal: 18,
            marginBottom: 10,
        },
        heroSecondaryText: {
            color: isDarkMode ? '#FFFFFF' : '#1E3A8A',
            fontWeight: '600',
        },
        productsSection: {
            paddingHorizontal: 12,
            paddingBottom: 16,
        },
        productGrid: {
            marginTop: 12,
        },
        productCard: {
            borderWidth: 1,
            borderRadius: 18,
            padding: 16,
            marginBottom: 12,
        },
        productCardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        productIconWrapper: {
            width: 44,
            height: 44,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
        },
        productStatusChip: {
            fontSize: 12,
            fontWeight: '700',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
        },
        productTitle: {
            fontSize: 18,
            fontWeight: '700',
            marginBottom: 6,
        },
        productDescription: {
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 12,
        },
        productActionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        productActionText: {
            fontSize: 15,
            fontWeight: '700',
        },
        serviceStatusSection: {
            marginBottom: 24,
        },
        statusCard: {
            padding: 20,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        statusHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        statusInfo: {
            marginLeft: 16,
            flex: 1,
        },
        statusTitle: {
            fontSize: 20,
            fontWeight: '600',
            marginBottom: 4,
        },
        statusSubtitle: {
            fontSize: 16,
            fontWeight: '500',
        },
        usageInfo: {
            padding: 12,
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
            borderRadius: 8,
        },
        usageText: {
            fontSize: 14,
        },
        recommendedPlanSection: {
            marginBottom: 24,
        },
        planHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        planInfo: {
            marginLeft: 16,
            flex: 1,
        },
        planPrice: {
            fontSize: 18,
            fontWeight: '700',
            marginTop: 4,
        },
        planFeatures: {
            marginTop: 16,
        },
        featuresTitle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 12,
        },
        moreFeatures: {
            fontSize: 14,
            fontWeight: '500',
            marginTop: 8,
            textAlign: 'center',
        },
        actionSection: {
            marginBottom: 24,
            alignItems: 'center',
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            marginBottom: 12,
            width: '100%',
        },
        actionButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 8,
        },
        actionNote: {
            fontSize: 14,
            textAlign: 'center',
            fontStyle: 'italic',
        },
        allPlansSection: {
            marginBottom: 24,
        },
        sectionSubtitle: {
            fontSize: 14,
            marginBottom: 16,
            textAlign: 'center',
            fontStyle: 'italic',
        },
        infoPlanCard: {
            padding: 20,
            borderRadius: 12,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        infoPlanHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 16,
        },
        planTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
            flexWrap: 'wrap',
        },
        planLimits: {
            fontSize: 12,
            marginTop: 4,
        },
        featuresGrid: {
            marginTop: 8,
        },
        usageRecommendation: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderRadius: 8,
            marginTop: 16,
        },
        recommendedBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginLeft: 8,
        },
        recommendedText: {
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '600',
            marginLeft: 4,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            marginBottom: 12,
        },
        currentPlanCard: {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            padding: 20,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: '#10B981',
        },
        currentPlanText: {
            fontSize: 16,
            fontWeight: '500',
            color: isDarkMode ? '#10B981' : '#059669',
            marginBottom: 8,
        },
        currentPlanName: {
            fontSize: 20,
            fontWeight: '700',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
        },
        transactionUsage: {
            marginTop: 12,
            padding: 12,
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
            borderRadius: 8,
        },
        usageText: {
            fontSize: 14,
            color: isDarkMode ? '#D1D5DB' : '#374151',
        },
        plansContainer: {
            marginBottom: 24,
        },
        planCard: {
            marginBottom: 24,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 8,
            position: 'relative',
            overflow: 'hidden',
        },
        cardHeaderGradient: {
            padding: 24,
            paddingBottom: 16,
        },
        cardBody: {
            padding: 20,
            paddingTop: 16,
        },
        iconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
        },
        glowEffect: {
            position: 'absolute',
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: 20,
            zIndex: -1,
        },
        recommendedBadge: {
            position: 'absolute',
            top: -8,
            left: 20,
            right: 20,
            paddingVertical: 6,
            paddingHorizontal: 16,
            borderRadius: 20,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            zIndex: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
        },
        recommendedText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '700',
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        // planHeader moved to dynamic styles inside PlanCard
        planName: {
            fontSize: 22,
            fontWeight: '800',
            marginTop: 8,
            textAlign: 'center',
            letterSpacing: 0.3,
        },
        priceContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'center',
            marginBottom: 12,
        },
        price: {
            fontSize: 36,
            fontWeight: '900',
            letterSpacing: -0.5,
        },
        priceLabel: {
            fontSize: 18,
            marginLeft: 6,
            fontWeight: '500',
        },
        costBreakdown: {
            alignItems: 'center',
            marginBottom: 16,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
            borderRadius: 8,
        },
        baseCost: {
            fontSize: 12,
            fontStyle: 'italic',
        },
        transactionInfo: {
            marginBottom: 20,
        },
        transactionBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            marginBottom: 8,
        },
        overageBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FEF2F2',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#FECACA',
        },
        transactionLimit: {
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 6,
        },
        overageWarning: {
            fontSize: 12,
            fontWeight: '700',
            marginLeft: 4,
        },
        featuresContainer: {
            marginBottom: 20,
        },
        featuresTitle: {
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 12,
            textAlign: 'center',
        },
        featureItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
            paddingHorizontal: 8,
        },
        featureText: {
            fontSize: 15,
            marginLeft: 10,
            flex: 1,
            lineHeight: 20,
            fontWeight: '500',
        },
        moreFeaturesBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
            borderRadius: 12,
        },
        moreFeatures: {
            fontSize: 13,
            fontWeight: '600',
            marginLeft: 4,
        },
        savingsContainer: {
            backgroundColor: isDarkMode ? '#064E3B' : '#F0FDF4',
            padding: 12,
            borderRadius: 12,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: isDarkMode ? '#059669' : '#BBF7D0',
        },
        savingsText: {
            fontSize: 13,
            fontWeight: '700',
            marginLeft: 6,
        },
        selectedIndicator: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
        },
        selectedText: {
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: '700',
            marginLeft: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
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
        // Modal styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            margin: 20,
            borderRadius: 12,
            padding: 24,
            width: '90%',
            maxWidth: 400,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            marginBottom: 16,
            textAlign: 'center',
        },
        modalText: {
            fontSize: 16,
            color: isDarkMode ? '#D1D5DB' : '#374151',
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 24,
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        modalButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            marginHorizontal: 8,
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: isDarkMode ? '#4B5563' : '#6B7280',
        },
        confirmButton: {
            backgroundColor: '#3B82F6',
        },
        modalButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
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
                        <Text style={styles.headerTitle}>Suscripciones</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={styles.loadingText}>Cargando planes de contabilidad...</Text>
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
                    <Text style={styles.headerTitle}>Suscripciones</Text>
                    {isSubscribed && (
                        <TouchableOpacity 
                            style={styles.dashboardButton}
                            onPress={() => navigation.navigate('ContabilidadDashboardSuscripcion', { ispId: route.params?.ispId || ispId })}
                        >
                            <Icon name="dashboard" size={16} color="#FFFFFF" />
                            <Text style={styles.dashboardButtonText}>Dashboard</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <LinearGradient
                        colors={isDarkMode ? ['#0f172a', '#1d4ed8'] : ['#eff6ff', '#93c5fd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <Text style={styles.heroBadge}>Centro de suscripciones</Text>
                        <Text style={styles.heroTitle}>Expande tu portafolio digital</Text>
                        <Text style={styles.heroSubtitle}>
                            Gestiona servicios financieros, engagement y automatización desde un solo lugar.
                        </Text>

                        <View style={styles.heroStatsRow}>
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatValue}>{availablePlans.length}</Text>
                                <Text style={styles.heroStatLabel}>Planes activos</Text>
                            </View>
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatValue}>{userCount}</Text>
                                <Text style={styles.heroStatLabel}>Usuarios en tu equipo</Text>
                            </View>
                        </View>

                        <View style={styles.heroActions}>
                            <TouchableOpacity
                                style={styles.heroPrimaryButton}
                                onPress={() => {
                                    if (isSubscribed) {
                                        navigation.navigate('ContabilidadDashboardSuscripcion', { ispId: route.params?.ispId || ispId });
                                    } else {
                                        setShowConfirmModal(true);
                                    }
                                }}
                            >
                                <Text style={styles.heroPrimaryText}>
                                    {isSubscribed ? 'Ver suscripción activa' : 'Activar contabilidad'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.heroSecondaryButton}
                                onPress={() => Alert.alert('Habla con nuestro equipo', 'Un asesor comercial te contactará para mostrarte las nuevas suscripciones.')}
                            >
                                <Text style={styles.heroSecondaryText}>Hablar con un asesor</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

                {/* Products Section */}
                <View style={styles.productsSection}>
                    <Text style={styles.sectionTitle}>Explora otros productos</Text>
                    <Text style={[styles.sectionSubtitle, { color: isDarkMode ? '#94A3B8' : '#4B5563', textAlign: 'left', fontStyle: 'normal' }]}>
                        Combina herramientas para acelerar ventas, automatizar operaciones y fidelizar clientes.
                    </Text>

                    <View style={styles.productGrid}>
                        {FEATURE_PRODUCTS.map((product) => {
                            const isMainProduct = product.id === 'contabilidad';
                            const statusLabel = isMainProduct
                                ? (isSubscribed ? 'Suscripción activa' : 'Disponible ahora')
                                : product.availability;
                            const actionLabel = isMainProduct
                                ? (isSubscribed ? 'Ir al dashboard' : 'Activar')
                                : 'Notificarme';
                            return (
                                <TouchableOpacity
                                    key={product.id}
                                    style={[
                                        styles.productCard,
                                        {
                                            backgroundColor: isDarkMode ? '#0f172a' : '#FFFFFF',
                                            borderColor: `${product.accent}33`,
                                        },
                                    ]}
                                    activeOpacity={0.9}
                                    onPress={() => handleExploreProduct(product.id)}
                                >
                                    <View style={styles.productCardHeader}>
                                        <View style={[styles.productIconWrapper, { backgroundColor: `${product.accent}20` }]}>
                                            <Icon name={product.icon} size={24} color={product.accent} />
                                        </View>
                                        <Text style={[styles.productStatusChip, { color: product.accent, backgroundColor: `${product.accent}26` }]}>
                                            {statusLabel}
                                        </Text>
                                    </View>
                                    <Text style={[styles.productTitle, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}>{product.title}</Text>
                                    <Text style={[styles.productDescription, { color: isDarkMode ? '#CBD5F5' : '#475569' }]}>
                                        {product.description}
                                    </Text>
                                    <View style={styles.productActionRow}>
                                        <Text style={[styles.productActionText, { color: product.accent }]}>{actionLabel}</Text>
                                        <Icon name="arrow-forward" size={18} color={product.accent} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Service Status Section */}
                <View style={styles.serviceStatusSection}>
                    <View style={[styles.statusCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                        <View style={styles.statusHeader}>
                            <Icon 
                                name={isSubscribed ? 'check_circle' : 'radio_button_unchecked'} 
                                size={32} 
                                color={isSubscribed ? '#10B981' : '#6B7280'} 
                            />
                            <View style={styles.statusInfo}>
                                <Text style={[styles.statusTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                                    Suscripción de Contabilidad
                                </Text>
                                <Text style={[styles.statusSubtitle, { color: isSubscribed ? '#10B981' : '#6B7280' }]}>
                                    {isSubscribed ? 'Activo' : 'Inactivo'}
                                </Text>
                            </View>
                        </View>
                        
                        {isSubscribed && (
                            <View style={styles.usageInfo}>
                                <Text style={[styles.usageText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                    Transacciones este mes: {monthlyTransactions}
                                    {recommendedPlan?.transactionLimit && ` de ${recommendedPlan.transactionLimit}`}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Recommended Plan Section */}
                {recommendedPlan && (
                    <View style={styles.recommendedPlanSection}>
                        <Text style={styles.sectionTitle}>
                            Plan Recomendado para tu ISP ({userCount} usuarios)
                        </Text>
                        <View style={[styles.planCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                            <View style={styles.planHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: `${recommendedPlan.color}20` }]}>
                                    <Icon name={recommendedPlan.icon} size={36} color={recommendedPlan.color} />
                                </View>
                                <View style={styles.planInfo}>
                                    <Text style={[styles.planName, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                                        {recommendedPlan.name}
                                    </Text>
                                    <Text style={[styles.planPrice, { color: recommendedPlan.color }]}>
                                        ${recommendedPlan.price}/mes
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.planFeatures}>
                                <Text style={[styles.featuresTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                                    Características incluidas:
                                </Text>
                                {(recommendedPlan.features || []).slice(0, 4).map((feature, index) => (
                                    <View key={index} style={styles.featureItem}>
                                        <Icon name="check" size={16} color={recommendedPlan.color} />
                                        <Text style={[styles.featureText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                            {feature}
                                        </Text>
                                    </View>
                                ))}
                                {recommendedPlan.features.length > 4 && (
                                    <Text style={[styles.moreFeatures, { color: recommendedPlan.color }]}>
                                        +{recommendedPlan.features.length - 4} características adicionales
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* All Plans Section - Informative */}
                <View style={styles.allPlansSection}>
                    <Text style={styles.sectionTitle}>Planes de suscripción disponibles</Text>
                    <Text style={[styles.sectionSubtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        Conoce todas las opciones que puedes activar y cambia cuando tu equipo lo necesite.
                    </Text>
                    
                    {availablePlans.map((plan, index) => (
                        <View key={plan.id} style={[styles.infoPlanCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                            {/* Plan Header */}
                            <View style={styles.infoPlanHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: `${plan.color}20` }]}>
                                    <Icon name={plan.icon} size={24} color={plan.color} />
                                </View>
                                <View style={styles.planInfo}>
                                    <View style={styles.planTitleRow}>
                                        <Text style={[styles.planName, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                                            {plan.name}
                                        </Text>
                                        {plan.id === recommendedPlan?.id && (
                                            <View style={[styles.recommendedBadge, { backgroundColor: plan.color }]}>
                                                <Icon name="grade" size={12} color="#FFFFFF" />
                                                <Text style={styles.recommendedText}>Recomendado</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.planPrice, { color: plan.color }]}>
                                        ${plan.price}/mes
                                    </Text>
                                    <Text style={[styles.planLimits, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        {plan.transactionLimit 
                                            ? `${plan.transactionLimit} transacciones/mes` 
                                            : 'Transacciones ilimitadas'
                                        }
                                        {plan.pricePerTransaction && ` • $${plan.pricePerTransaction} por transacción extra`}
                                    </Text>
                                </View>
                            </View>

                            {/* Plan Features */}
                            <View style={styles.planFeatures}>
                                <Text style={[styles.featuresTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                                    Características incluidas:
                                </Text>
                                <View style={styles.featuresGrid}>
                                    {plan.features.map((feature, featureIndex) => (
                                        <View key={featureIndex} style={styles.featureItem}>
                                            <Icon name="check" size={16} color={plan.color} />
                                            <Text style={[styles.featureText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                                {feature}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Usage Recommendation */}
                            <View style={[styles.usageRecommendation, { backgroundColor: `${plan.color}10` }]}>
                                <Icon name="info" size={16} color={plan.color} />
                                <Text style={[styles.usageText, { color: plan.color }]}>
                                    {plan.id === 'contabilidad_basico' && 'Recomendado para ISPs pequeños (1 usuario)'}
                                    {plan.id === 'contabilidad_profesional' && 'Recomendado para ISPs medianos (2-5 usuarios)'}
                                    {plan.id === 'contabilidad_enterprise' && 'Recomendado para ISPs grandes (6+ usuarios)'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Action Section */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            { backgroundColor: isSubscribed ? '#EF4444' : '#10B981' }
                        ]}
                        onPress={handleToggleSubscription}
                        disabled={processing}
                    >
                        {processing ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Icon 
                                    name={isSubscribed ? 'cancel' : 'add_circle'} 
                                    size={20} 
                                    color="#FFFFFF" 
                                />
                                <Text style={styles.actionButtonText}>
                                    {isSubscribed ? 'Desactivar Servicio' : 'Activar Servicio'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                    
                    <Text style={[styles.actionNote, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {isSubscribed 
                            ? 'El servicio se eliminará de tu factura mensual'
                            : 'El servicio se agregará a tu factura mensual'
                        }
                    </Text>
                </View>
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showConfirmModal}
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {isSubscribed ? 'Desactivar Servicio' : 'Activar Servicio'}
                        </Text>
                        <Text style={styles.modalText}>
                            {isSubscribed 
                                ? '¿Estás seguro de que deseas desactivar el servicio de contabilidad? Se eliminará de tu factura mensual.'
                                : `¿Estás seguro de que deseas activar el servicio de contabilidad? Se agregará $${recommendedPlan?.price || 0} a tu factura mensual.`
                            }
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowConfirmModal(false)}
                                disabled={processing}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmToggleSubscription}
                                disabled={processing}
                            >
                                {processing ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.modalButtonText}>Confirmar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ContabilidadSuscripcionScreen;
