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
import { useTheme } from '../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SubscriptionPlan, LAUNCH_PROMOTION } from '../../config/subscriptionPlans';
import { useSubscription } from '../../hooks/useSubscription';

const { width } = Dimensions.get('window');

const TarifasConexionesScreen = ({ route, navigation }) => {
    const { ispId, currentPlan, recommendedPlan, userId } = route.params || {};
    const { isDarkMode } = useTheme();
    const { upgradePlan } = useSubscription(ispId);
    const [selectedPlan, setSelectedPlan] = useState(currentPlan);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [upgrading, setUpgrading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [connectionsData, setConnectionsData] = useState(null);
    const [loadingConnections, setLoadingConnections] = useState(true);
    const [userIdFromStorage, setUserIdFromStorage] = useState(null);

    const API_BASE = 'https://wellnet-rd.com:444/api';

    useEffect(() => {
        loadUserToken();
    }, []);

    useEffect(() => {
        if (userToken !== null) {
            loadAvailablePlans();
            
            // Usar userId de parámetros o del storage
            const finalUserId = userId || userIdFromStorage;
            if (finalUserId) {
                console.log('🔍 [FRONTEND] Cargando conexiones para userId:', finalUserId);
                loadUserConnections(finalUserId);
            } else {
                console.log('⚠️ [FRONTEND] No hay userId disponible (ni de parámetros ni de storage)');
            }
        }
    }, [userToken, userId, userIdFromStorage]);

    const loadUserToken = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            console.log('🔍 [FRONTEND] Datos del localStorage:', JSON.stringify(loginData, null, 2));
            
            if (loginData && loginData.token) {
                setUserToken(loginData.token);
                
                // Extraer userId del loginData (puede ser 'id' o 'userId')
                const userIdValue = loginData.userId || loginData.id;
                if (userIdValue) {
                    setUserIdFromStorage(userIdValue);
                    console.log('✅ [FRONTEND] User ID extraído del storage:', userIdValue);
                } else {
                    console.warn('⚠️ [FRONTEND] No se encontró userId ni id en loginData');
                    setUserIdFromStorage(null);
                }
            } else {
                console.warn('No token found in login data - proceeding without authentication');
                setUserToken('');
                setUserIdFromStorage(null);
            }
        } catch (error) {
            console.error('Error loading user token:', error);
            setUserToken('');
            setUserIdFromStorage(null);
        }
    };

    const loadAvailablePlans = async () => {
        try {
            setLoading(true);
            
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (userToken) {
                headers['Authorization'] = `Bearer ${userToken}`;
            }

            const url = `${API_BASE}/subscription-plans`;

            // 📤 LOG: Request de planes
            console.log('🔍 [FRONTEND] Cargando planes disponibles:');
            console.log('  📋 URL:', url);
            console.log('  📊 Headers:', headers);
            console.log('  🔑 Con token:', !!userToken);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            // 📥 LOG: Respuesta de planes
            console.log('📥 [FRONTEND] Respuesta de planes:');
            console.log('  📊 Status:', response.status);
            console.log('  📊 OK:', response.ok);

            const data = await response.json();
            console.log('  📋 Data received:', JSON.stringify(data, null, 2));
            
            if (response.ok && data.success) {
                const sortedPlans = (data.data || []).sort((a, b) => {
                    const priceA = parseFloat(a.price) || 0;
                    const priceB = parseFloat(b.price) || 0;
                    return priceA - priceB;
                });

                console.log('✅ [FRONTEND] Planes procesados exitosamente:');
                console.log('  📊 Total planes:', sortedPlans.length);
                console.log('  💰 Planes ordenados:', sortedPlans.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    limit: p.connection_limit
                })));

                setPlans(sortedPlans);
            } else {
                console.error('❌ [FRONTEND] Error cargando planes:', data.message);
                Alert.alert('Error', 'No se pudieron cargar los planes: ' + (data.message || 'Error desconocido'));
                setPlans([]);
            }
        } catch (error) {
            console.error('❌ [FRONTEND] Error de conexión planes:', error);
            Alert.alert('Error', 'No se pudieron cargar los planes: ' + error.message);
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    const loadUserConnections = async (userIdToUse) => {
        try {
            setLoadingConnections(true);
            
            const url = `${API_BASE}/usuarios/connections-count?user_id=${userIdToUse}`;
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            // 📤 LOG: Datos enviados al backend
            console.log('🔍 [FRONTEND] Enviando request al backend:');
            console.log('  📋 URL:', url);
            console.log('  🌐 Method:', requestOptions.method);
            console.log('  📊 Headers:', requestOptions.headers);
            console.log('  👤 User ID:', userIdToUse);
            console.log('  📍 User ID origen:', userId ? 'parámetros' : 'localStorage');
            console.log('  ⏰ Timestamp:', new Date().toISOString());
            
            const response = await fetch(url, requestOptions);

            // 📥 LOG: Respuesta raw del backend
            console.log('📥 [FRONTEND] Respuesta recibida del backend:');
            console.log('  📊 Response status:', response.status);
            console.log('  📊 Response ok:', response.ok);
            console.log('  📊 Response headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();
            
            // 📥 LOG: Datos procesados del backend
            console.log('  📋 Response data (raw):', JSON.stringify(data, null, 2));
            
            if (response.ok && data.success) {
                // Adaptar nueva estructura del backend
                const backendData = data.data;
                
                // Mapear estados con iconos y colores
                const stateMapping = {
                    active: { icon: '🟢', color: '#10B981', label: 'Activas' },
                    suspended: { icon: '🟡', color: '#F59E0B', label: 'Suspendidas' },
                    low_voluntary: { icon: '🔻', color: '#6366F1', label: 'Baja Voluntaria' },
                    low_forced: { icon: '❌', color: '#EF4444', label: 'Baja Forzada' },
                    damaged: { icon: '🔧', color: '#8B5CF6', label: 'Averías' }
                };
                
                // Adaptar ISPs con estados detallados
                const isps = backendData.isp_details?.map(isp => ({
                    isp_id: isp.id_isp,
                    isp_name: isp.nombre_isp,
                    total_connections: isp.total,
                    states: {
                        active: isp.active || 0,
                        suspended: isp.suspended || 0,
                        low_voluntary: isp.low_voluntary || 0,
                        low_forced: isp.low_forced || 0,
                        damaged: isp.damaged || 0
                    },
                    detailed_states: isp.states || {}
                })) || [];
                
                const adaptedData = {
                    // Usar totales del backend si están disponibles, sino calcular
                    total_connections: backendData.totals?.total || backendData.total || 0,
                    total_active: backendData.totals?.active || backendData.active || 0,
                    total_suspended: backendData.totals?.suspended || backendData.suspended || 0,
                    // Nuevos campos para estados adicionales
                    total_low_voluntary: backendData.totals?.low_voluntary || 0,
                    total_low_forced: backendData.totals?.low_forced || 0,
                    total_damaged: backendData.totals?.damaged || 0,
                    // Desglose por ISP mejorado
                    isps: isps,
                    user_isps: backendData.user_isps || [],
                    state_mapping: stateMapping,
                    suggested_plan: null // Se calculará después con los planes
                };
                
                // 📊 LOG: Datos adaptados para uso interno
                console.log('✅ [FRONTEND] Procesamiento exitoso con nueva estructura:');
                console.log('  📋 Datos originales del backend:', {
                    success: data.success,
                    message: data.message,
                    totals: backendData.totals,
                    isp_count: backendData.isp_details?.length || 0
                });
                console.log('  🔄 Datos adaptados para frontend:', adaptedData);
                console.log('  📊 Estados por ISP:', adaptedData.isps.map(isp => ({
                    name: isp.isp_name,
                    total: isp.total_connections,
                    states: isp.states
                })));
                
                setConnectionsData(adaptedData);
            } else {
                console.error('❌ [FRONTEND] Error en respuesta del backend:');
                console.error('  📊 Status:', response.status);
                console.error('  📋 Data:', data);
                console.error('  💬 Message:', data.message);
                setConnectionsData(null);
            }
        } catch (error) {
            console.error('❌ [FRONTEND] Error de conexión/fetch:', error);
            console.error('  📋 Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            setConnectionsData(null);
        } finally {
            setLoadingConnections(false);
        }
    };

    // Calcular plan sugerido cuando se tengan conexiones y planes
    useEffect(() => {
        if (connectionsData && plans.length > 0 && connectionsData.total_connections > 0 && !connectionsData.suggested_plan) {
            console.log('🎯 [FRONTEND] Calculando plan sugerido con nueva estructura:');
            console.log('  📊 Conexiones totales:', connectionsData.total_connections);
            console.log('  📊 Desglose de estados:', {
                active: connectionsData.total_active,
                suspended: connectionsData.total_suspended,
                low_voluntary: connectionsData.total_low_voluntary,
                low_forced: connectionsData.total_low_forced,
                damaged: connectionsData.total_damaged
            });
            console.log('  📋 Planes disponibles:', plans.length);
            
            // Calcular conexiones facturables (activas + suspendidas + averías)
            // Las bajas (voluntarias y forzadas) no se facturan
            const billableConnections = connectionsData.total_active + 
                                      connectionsData.total_suspended + 
                                      connectionsData.total_damaged;
            
            console.log('  💰 Conexiones facturables:', billableConnections, '(activas + suspendidas + averías)');
            console.log('  ❌ Conexiones no facturables:', connectionsData.total_low_voluntary + connectionsData.total_low_forced, '(bajas)');
            
            // Buscar el plan más económico que cubra las conexiones facturables
            const sortedPlans = [...plans].sort((a, b) => {
                const priceA = parseFloat(a.price) || 0;
                const priceB = parseFloat(b.price) || 0;
                return priceA - priceB;
            });

            console.log('  💰 Planes ordenados por precio:', sortedPlans.map(p => ({
                name: p.name,
                price: p.price,
                limit: p.connection_limit || 'ilimitado'
            })));

            let suggestedPlan = null;
            for (const plan of sortedPlans) {
                const covers = !plan.connection_limit || plan.connection_limit >= billableConnections;
                console.log(`  📋 Evaluando ${plan.name}: límite=${plan.connection_limit || 'ilimitado'}, cubre ${billableConnections} facturables=${covers}`);
                
                if (covers) {
                    suggestedPlan = {
                        id: plan.id,
                        name: plan.name,
                        price: parseFloat(plan.price),
                        connection_limit: plan.connection_limit,
                        features: plan.features,
                        reason: `Cubre ${billableConnections} conexiones facturables (${connectionsData.total_active} activas, ${connectionsData.total_suspended} suspendidas, ${connectionsData.total_damaged} averías)`
                    };
                    console.log(`  ✅ Plan seleccionado: ${plan.name} ($${plan.price}) para ${billableConnections} conexiones facturables`);
                    break;
                }
            }

            // Si ningún plan tiene límite suficiente, usar el de mayor capacidad
            if (!suggestedPlan && sortedPlans.length > 0) {
                const highestPlan = sortedPlans[sortedPlans.length - 1];
                console.log(`  ⚠️ Ningún plan cubre ${billableConnections} conexiones facturables, usando plan mayor: ${highestPlan.name}`);
                suggestedPlan = {
                    id: highestPlan.id,
                    name: highestPlan.name,
                    price: parseFloat(highestPlan.price),
                    connection_limit: highestPlan.connection_limit,
                    features: highestPlan.features,
                    reason: `Plan de mayor capacidad disponible (${billableConnections} conexiones facturables exceden límites)`
                };
            }

            if (suggestedPlan) {
                console.log('  🎉 Plan sugerido final:', {
                    name: suggestedPlan.name,
                    price: suggestedPlan.price,
                    limit: suggestedPlan.connection_limit,
                    reason: suggestedPlan.reason
                });
                
                setConnectionsData(prev => ({
                    ...prev,
                    suggested_plan: suggestedPlan
                }));
            } else {
                console.log('  ❌ No se pudo calcular plan sugerido');
            }
        }
    }, [connectionsData?.total_connections, plans.length]);

    const handlePlanSelection = (planId: string) => {
        setSelectedPlan(planId);
    };

    const handleUpgrade = async () => {
        if (selectedPlan === currentPlan) {
            Alert.alert('Info', 'Ya estás en este plan.');
            return;
        }

        Alert.alert(
            'Confirmar Cambio de Plan',
            `¿Estás seguro de que quieres cambiar al plan ${plans.find(p => p.id === selectedPlan)?.name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Confirmar', 
                    onPress: async () => {
                        setUpgrading(true);
                        const success = await upgradePlan(selectedPlan);
                        setUpgrading(false);
                        
                        if (success) {
                            navigation.goBack();
                        }
                    }
                }
            ]
        );
    };

    const getPlanStatus = (planId: string) => {
        // Priorizar el plan sugerido calculado sobre el plan actual de suscripción
        if (connectionsData?.suggested_plan && planId === connectionsData.suggested_plan.id) return 'current';
        if (planId === currentPlan) return 'current';
        return 'available';
    };

    const PlanCard = ({ plan }) => {
        // Validaciones seguras para datos del backend
        const safeName = plan?.name ? String(plan.name) : 'Plan sin nombre';
        const safePrice = plan?.price !== undefined && plan?.price !== null ? String(plan.price) : '0';
        const safePricePerConnection = plan?.price_per_connection !== undefined && plan?.price_per_connection !== null ? String(plan.price_per_connection) : '0';
        const safeConnectionLimit = plan?.connection_limit ? String(plan.connection_limit) : null;
        const isRecommended = Boolean(plan?.recommended);
        
        // Validar features de manera segura
        let safeFeatures = [];
        try {
            if (plan?.features) {
                if (Array.isArray(plan.features)) {
                    safeFeatures = plan.features.filter(f => f && typeof f === 'string').map(f => String(f));
                } else if (typeof plan.features === 'string') {
                    try {
                        const parsed = JSON.parse(plan.features);
                        if (Array.isArray(parsed)) {
                            safeFeatures = parsed.filter(f => f && typeof f === 'string').map(f => String(f));
                        } else {
                            safeFeatures = [String(plan.features)];
                        }
                    } catch {
                        safeFeatures = [String(plan.features)];
                    }
                }
            }
        } catch (error) {
            console.log('Error processing features:', error);
            safeFeatures = [];
        }

        const status = getPlanStatus(plan.id);
        const isSelected = selectedPlan === plan.id;
        
        // 🔍 DEBUG: Log para verificar IDs y highlighting
        if (connectionsData?.suggested_plan) {
            console.log(`🔍 [PLAN CARD] ${plan.name}: id="${plan.id}", suggested_id="${connectionsData.suggested_plan.id}", status="${status}", willHighlight="${status === 'current'}"`);
        }
        
        return (
            <TouchableOpacity
                style={[
                    styles.planCard,
                    {
                        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                        borderColor: isSelected 
                            ? '#3B82F6' 
                            : (isDarkMode ? '#374151' : '#E5E7EB'),
                        borderWidth: isSelected ? 2 : 1,
                    },
                    status === 'current' && styles.recommendedCard
                ]}
                onPress={() => handlePlanSelection(plan.id)}
                disabled={upgrading}
            >
                {/* Plan Header */}
                <View style={styles.planHeader}>
                    <View style={styles.planTitleContainer}>
                        <Text style={[styles.planName, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                            {safeName}
                        </Text>
                        {status === 'current' && (
                            <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
                                <Text style={styles.statusText}>Tu Plan</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.priceContainer}>
                        <Text style={[styles.planPrice, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                            US${safePrice}
                        </Text>
                        <Text style={[styles.priceLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            /mes
                        </Text>
                    </View>
                    
                </View>

                {/* Client Limit */}
                <View style={styles.limitContainer}>
                    <Icon name="people" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.limitText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                        {safeConnectionLimit ? `Hasta ${safeConnectionLimit} conexiones` : 'Conexiones ilimitadas'}
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    {safeFeatures.length > 0 ? (
                        <>
                            {safeFeatures.slice(0, 4).map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <Icon name="check-circle" size={16} color="#10B981" />
                                    <Text style={[styles.featureText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                        {feature}
                                    </Text>
                                </View>
                            ))}
                            {safeFeatures.length > 4 && (
                                <Text style={[styles.moreFeatures, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    +{safeFeatures.length - 4} características más
                                </Text>
                            )}
                        </>
                    ) : (
                        <View style={styles.featureItem}>
                            <Icon name="info" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text style={[styles.featureText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                No hay características definidas
                            </Text>
                        </View>
                    )}
                </View>

                {/* Selection Indicator */}
                {isSelected && (
                    <View style={styles.selectedIndicator}>
                        <Icon name="check-circle" size={24} color="#3B82F6" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const PromoModal = () => (
        <Modal
            visible={showPromoModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPromoModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                    <View style={styles.modalHeader}>
                        <Icon name="local-offer" size={32} color="#F59E0B" />
                        <Text style={[styles.modalTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                            ¡Oferta de Lanzamiento!
                        </Text>
                    </View>
                    
                    <View style={styles.promoContent}>
                        <View style={styles.promoItem}>
                            <Icon name="local-offer" size={24} color="#10B981" />
                            <Text style={[styles.promoText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                25% de descuento en el primer año
                            </Text>
                        </View>
                        
                        <View style={styles.promoItem}>
                            <Icon name="schedule" size={24} color="#10B981" />
                            <Text style={[styles.promoText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                1 mes gratis de prueba
                            </Text>
                        </View>
                        
                        <View style={styles.promoItem}>
                            <Icon name="support" size={24} color="#10B981" />
                            <Text style={[styles.promoText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                Migración de datos completamente gratis
                            </Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.modalButton, { backgroundColor: '#F59E0B' }]}
                        onPress={() => setShowPromoModal(false)}
                    >
                        <Text style={styles.modalButtonText}>¡Aprovecha la Oferta!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        Tarifas por Conexiones
                    </Text>
                    <TouchableOpacity onPress={() => setShowPromoModal(true)}>
                        <Icon name="local-offer" size={24} color="#F59E0B" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Connections Info */}
                {(userId || userIdFromStorage) && (
                    <View style={[styles.connectionsInfoCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC' }]}>
                        <View style={styles.connectionsHeader}>
                            <Icon name="router" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                            <Text style={[styles.connectionsTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                                Tus Conexiones
                            </Text>
                        </View>
                        
                        {loadingConnections ? (
                            <View style={styles.connectionsLoading}>
                                <ActivityIndicator size="small" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                                <Text style={[styles.connectionsLoadingText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Consultando conexiones...
                                </Text>
                            </View>
                        ) : connectionsData ? (
                            <>
                                <View style={styles.connectionsMainInfo}>
                                    <Text style={[styles.connectionsCount, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                                        {connectionsData.total_connections} conexiones totales
                                    </Text>
                                    
                                    <View style={styles.statesGrid}>
                                        {connectionsData.total_active > 0 && (
                                            <View style={styles.stateItem}>
                                                <Text style={styles.stateIcon}>🟢</Text>
                                                <Text style={[styles.stateCount, { color: '#10B981' }]}>
                                                    {connectionsData.total_active}
                                                </Text>
                                                <Text style={[styles.stateLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                                    activas
                                                </Text>
                                            </View>
                                        )}
                                        
                                        {connectionsData.total_suspended > 0 && (
                                            <View style={styles.stateItem}>
                                                <Text style={styles.stateIcon}>🟡</Text>
                                                <Text style={[styles.stateCount, { color: '#F59E0B' }]}>
                                                    {connectionsData.total_suspended}
                                                </Text>
                                                <Text style={[styles.stateLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                                    suspendidas
                                                </Text>
                                            </View>
                                        )}
                                        
                                        {connectionsData.total_low_voluntary > 0 && (
                                            <View style={styles.stateItem}>
                                                <Text style={styles.stateIcon}>🔻</Text>
                                                <Text style={[styles.stateCount, { color: '#6366F1' }]}>
                                                    {connectionsData.total_low_voluntary}
                                                </Text>
                                                <Text style={[styles.stateLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                                    baja vol.
                                                </Text>
                                            </View>
                                        )}
                                        
                                        {connectionsData.total_low_forced > 0 && (
                                            <View style={styles.stateItem}>
                                                <Text style={styles.stateIcon}>❌</Text>
                                                <Text style={[styles.stateCount, { color: '#EF4444' }]}>
                                                    {connectionsData.total_low_forced}
                                                </Text>
                                                <Text style={[styles.stateLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                                    baja forz.
                                                </Text>
                                            </View>
                                        )}
                                        
                                        {connectionsData.total_damaged > 0 && (
                                            <View style={styles.stateItem}>
                                                <Text style={styles.stateIcon}>🔧</Text>
                                                <Text style={[styles.stateCount, { color: '#8B5CF6' }]}>
                                                    {connectionsData.total_damaged}
                                                </Text>
                                                <Text style={[styles.stateLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                                    averías
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Desglose por ISP */}
                                {connectionsData.isps && connectionsData.isps.length > 0 && (
                                    <View style={[styles.ispBreakdownContainer, { backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' }]}>
                                        <Text style={[styles.ispBreakdownTitle, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                            Desglose por ISP:
                                        </Text>
                                        {connectionsData.isps.map((isp, index) => (
                                            <View key={index} style={styles.ispBreakdownItem}>
                                                <View style={styles.ispHeader}>
                                                    <Icon name="business" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                                    <Text style={[styles.ispName, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                                        {isp.isp_name}
                                                    </Text>
                                                    <Text style={[styles.ispTotal, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                                                        {isp.total_connections} total
                                                    </Text>
                                                </View>
                                                
                                                <View style={styles.ispStatesGrid}>
                                                    {Object.entries(isp.states).map(([state, count]) => {
                                                        if (count === 0) return null;
                                                        const stateInfo = connectionsData.state_mapping[state];
                                                        if (!stateInfo) return null;
                                                        
                                                        return (
                                                            <View key={state} style={styles.ispStateItem}>
                                                                <Text style={styles.ispStateIcon}>{stateInfo.icon}</Text>
                                                                <Text style={[styles.ispStateCount, { color: stateInfo.color }]}>
                                                                    {count}
                                                                </Text>
                                                                <Text style={[styles.ispStateLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                                                    {stateInfo.label.toLowerCase()}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                                
                                {/* Plan sugerido */}
                                {connectionsData.suggested_plan && (
                                    <View style={[styles.suggestedPlanContainer, { backgroundColor: isDarkMode ? '#065F46' : '#D1FAE5' }]}>
                                        <Icon name="recommend" size={16} color="#10B981" />
                                        <View style={styles.suggestedPlanContent}>
                                            <Text style={[styles.suggestedPlanText, { color: isDarkMode ? '#A7F3D0' : '#065F46' }]}>
                                                Tu tarifa mensual: {connectionsData.suggested_plan.name} - US${connectionsData.suggested_plan.price}/mes
                                            </Text>
                                            <Text style={[styles.suggestedPlanReason, { color: isDarkMode ? '#6EE7B7' : '#047857' }]}>
                                                {connectionsData.suggested_plan.reason}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </>
                        ) : (
                            <Text style={[styles.connectionsError, { color: isDarkMode ? '#F87171' : '#DC2626' }]}>
                                No se pudieron cargar las conexiones
                            </Text>
                        )}
                    </View>
                )}

                {/* Promo Banner */}
                <TouchableOpacity 
                    style={[styles.promoBanner, { backgroundColor: '#FEF3C7' }]}
                    onPress={() => setShowPromoModal(true)}
                >
                    <Icon name="campaign" size={24} color="#F59E0B" />
                    <Text style={[styles.promoText, { color: '#92400E' }]}>
                        ¡Oferta especial de lanzamiento! Toca para ver detalles
                    </Text>
                </TouchableOpacity>

                {/* Plans Grid */}
                <View style={styles.plansContainer}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                            <Text style={[styles.loadingText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                Cargando planes disponibles...
                            </Text>
                        </View>
                    ) : (
                        plans.map((plan) => (
                            <PlanCard key={plan.id} plan={plan} />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Bottom Action Button */}
            {selectedPlan !== currentPlan && (
                <View style={[styles.bottomContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                    <TouchableOpacity 
                        style={[
                            styles.upgradeButton, 
                            { 
                                backgroundColor: upgrading ? '#9CA3AF' : '#3B82F6',
                                opacity: upgrading ? 0.7 : 1 
                            }
                        ]}
                        onPress={handleUpgrade}
                        disabled={upgrading}
                    >
                        <Text style={styles.upgradeButtonText}>
                            {upgrading ? 'Procesando...' : 'Cambiar Plan'}
                        </Text>
                        {!upgrading && <Icon name="arrow-forward" size={20} color="#FFFFFF" />}
                    </TouchableOpacity>
                </View>
            )}

            <PromoModal />
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
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
    },
    connectionsInfoCard: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    connectionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    connectionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    connectionsLoading: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    connectionsLoadingText: {
        fontSize: 14,
        marginLeft: 8,
    },
    connectionsCount: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    connectionsBreakdown: {
        fontSize: 14,
        marginBottom: 12,
    },
    connectionsError: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    connectionsMainInfo: {
        marginBottom: 16,
    },
    statesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    stateItem: {
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '18%',
        marginBottom: 8,
    },
    stateIcon: {
        fontSize: 16,
        marginBottom: 4,
    },
    stateCount: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    stateLabel: {
        fontSize: 11,
        textAlign: 'center',
        fontWeight: '500',
    },
    ispBreakdownContainer: {
        marginTop: 8,
        marginBottom: 12,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    ispBreakdownTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    ispBreakdownItem: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    ispHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ispName: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
        flex: 1,
    },
    ispTotal: {
        fontSize: 12,
        fontWeight: '600',
    },
    ispStatesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 22,
    },
    ispStateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    ispStateIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    ispStateCount: {
        fontSize: 12,
        fontWeight: '600',
        marginRight: 4,
    },
    ispStateLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    suggestedPlanContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 8,
    },
    suggestedPlanContent: {
        flex: 1,
        marginLeft: 6,
    },
    suggestedPlanText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    suggestedPlanReason: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    promoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        padding: 16,
        borderRadius: 12,
    },
    promoText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    plansContainer: {
        padding: 16,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    planCard: {
        marginBottom: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    recommendedCard: {
        borderColor: '#F59E0B',
        borderWidth: 2,
    },
    planHeader: {
        marginBottom: 16,
    },
    planTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    planName: {
        fontSize: 20,
        fontWeight: '700',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    planPrice: {
        fontSize: 28,
        fontWeight: '700',
    },
    priceLabel: {
        fontSize: 16,
        marginLeft: 4,
    },
    pricePerConnectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pricePerConnectionText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    limitContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    limitText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    featuresContainer: {
        marginBottom: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    moreFeatures: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 4,
    },
    selectedIndicator: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    bottomContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    upgradeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        margin: 20,
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 12,
        textAlign: 'center',
    },
    promoContent: {
        marginBottom: 24,
    },
    promoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
};

export default TarifasConexionesScreen;