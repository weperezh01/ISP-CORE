import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SubscriptionDemo = ({ route, navigation }) => {
    const { isDarkMode } = useTheme();
    
    // State management
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userCurrentUsage, setUserCurrentUsage] = useState({
        activeConnections: 0,
        totalAllowed: 0,
        currentPlan: '',
        percentage: 0
    });
    const [userData, setUserData] = useState({
        userId: null,
        ispId: null,
        token: null
    });

    // Fallback hardcoded plans (in case API fails)
    const fallbackPlans = [
        { id: 1, name: 'Gratis', price: 0, connections: 50, pricePerConnection: 0, color: '#10B981', features: ['Facturación automática', 'Soporte técnico'] },
        { id: 2, name: 'Básico', price: 25, connections: 200, pricePerConnection: 0.125, color: '#3B82F6', features: ['Facturación automática', 'Soporte técnico', 'Precio competitivo'] },
        { id: 3, name: 'Estándar', price: 45, connections: 500, pricePerConnection: 0.09, color: '#8B5CF6', features: ['Facturación automática', 'Soporte técnico', 'Precio competitivo'] },
        { id: 4, name: 'Premium', price: 75, connections: 1000, pricePerConnection: 0.075, color: '#F59E0B', features: ['Facturación automática', 'Soporte técnico', 'Precio competitivo'] },
        { id: 5, name: 'Professional', price: 120, connections: 2000, pricePerConnection: 0.06, color: '#EF4444', features: ['Facturación automática', 'Soporte técnico', 'Precio competitivo'] }
    ];
    
    const handlePlanSelection = (planName) => {
        Alert.alert('Plan Seleccionado', `Has seleccionado el plan ${planName}`);
    };

    // Fetch user data from AsyncStorage
    const fetchUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            const selectedIspId = await AsyncStorage.getItem('@selectedIspId');
            
            if (loginData) {
                setUserData({
                    userId: loginData.id,
                    ispId: selectedIspId || loginData.id_isp,
                    token: loginData.token || null
                });
                return {
                    userId: loginData.id,
                    ispId: selectedIspId || loginData.id_isp,
                    token: loginData.token || null
                };
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'No se pudo cargar los datos del usuario');
        }
        return null;
    };

    // Fetch subscription plans from backend
    const fetchSubscriptionPlans = async (userId, ispId) => {
        if (!userId) {
            console.log('No userId available, using fallback plans');
            setPlans(fallbackPlans);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/subscription-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userId: userId,
                    ispId: ispId || null
                }),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data && Array.isArray(data) && data.length > 0) {
                // Map backend data to expected format
                const formattedPlans = data.map((plan, index) => ({
                    id: plan.id || index + 1,
                    name: plan.name || plan.plan_name || 'Plan Sin Nombre',
                    price: parseFloat(plan.price || plan.monthly_price || 0),
                    connections: parseInt(plan.connections || plan.max_connections || 0),
                    pricePerConnection: plan.price_per_connection || (plan.price / plan.connections) || 0,
                    color: plan.color || fallbackPlans[index % fallbackPlans.length]?.color || '#3B82F6',
                    features: plan.features || ['Facturación automática', 'Soporte técnico'],
                    description: plan.description || '',
                    isPopular: plan.is_popular || false
                }));
                
                setPlans(formattedPlans);
                console.log('✅ Subscription plans loaded from backend:', formattedPlans.length);
            } else {
                console.log('No plans returned from backend, using fallback');
                setPlans(fallbackPlans);
            }
        } catch (error) {
            console.error('❌ Error fetching subscription plans:', error);
            console.log('Using fallback plans due to error');
            setPlans(fallbackPlans);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user current usage/connection data
    const fetchUserUsage = async (userId, ispId) => {
        if (!userId) {
            // Use demo data if no user ID
            setUserCurrentUsage({
                activeConnections: 147,
                totalAllowed: 200,
                currentPlan: 'Básico',
                percentage: 73
            });
            return;
        }

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/user-usage-stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userId: userId,
                    ispId: ispId || null
                }),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data) {
                setUserCurrentUsage({
                    activeConnections: data.active_connections || data.activeConnections || 0,
                    totalAllowed: data.total_allowed || data.totalAllowed || 0,
                    currentPlan: data.current_plan || data.currentPlan || 'Plan Actual',
                    percentage: data.percentage || Math.round((data.active_connections / data.total_allowed) * 100) || 0
                });
                console.log('✅ User usage data loaded from backend');
            }
        } catch (error) {
            console.error('❌ Error fetching user usage:', error);
            // Use demo data as fallback
            setUserCurrentUsage({
                activeConnections: 147,
                totalAllowed: 200,
                currentPlan: 'Básico',
                percentage: 73
            });
        }
    };

    // Load all data when component mounts or when focused
    const loadAllData = async () => {
        const user = await fetchUserData();
        if (user) {
            await Promise.all([
                fetchSubscriptionPlans(user.userId, user.ispId),
                fetchUserUsage(user.userId, user.ispId)
            ]);
        } else {
            // No user data, use fallback
            setPlans(fallbackPlans);
            setUserCurrentUsage({
                activeConnections: 147,
                totalAllowed: 200,
                currentPlan: 'Básico',
                percentage: 73
            });
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadAllData();
    }, []);

    // Reload data when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            loadAllData();
        }, [])
    );

    return (
        <View style={{
            flex: 1,
            backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC'
        }}>
            {/* Header */}
            <View style={{
                backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                paddingTop: 60,
                paddingBottom: 20,
                paddingHorizontal: 20,
                borderBottomWidth: 1,
                borderBottomColor: isDarkMode ? '#334155' : '#E2E8F0'
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow_back" size={24} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 20,
                        fontWeight: '600',
                        color: isDarkMode ? '#F9FAFB' : '#1F2937'
                    }}>
                        Planes WellNet
                    </Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                {/* Promoción Banner */}
                <View style={{
                    backgroundColor: '#FEF3C7',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 20,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <Icon name="local_offer" size={24} color="#F59E0B" />
                    <Text style={{
                        marginLeft: 12,
                        color: '#92400E',
                        fontWeight: '600',
                        flex: 1
                    }}>
                        ¡Oferta de lanzamiento! 25% descuento primer año + 1 mes gratis
                    </Text>
                </View>

                {/* Loading Indicator */}
                {isLoading && (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 40
                    }}>
                        <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                        <Text style={{
                            marginTop: 16,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            fontSize: 16
                        }}>
                            Cargando planes de suscripción...
                        </Text>
                    </View>
                )}

                {/* Empty State */}
                {!isLoading && plans.length === 0 && (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 40
                    }}>
                        <Icon name="error_outline" size={64} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                        <Text style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: isDarkMode ? '#F9FAFB' : '#1F2937',
                            marginTop: 16,
                            textAlign: 'center'
                        }}>
                            No hay planes disponibles
                        </Text>
                        <Text style={{
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            marginTop: 8,
                            textAlign: 'center'
                        }}>
                            No se pudieron cargar los planes de suscripción. Por favor, intenta más tarde.
                        </Text>
                        <TouchableOpacity
                            onPress={loadAllData}
                            style={{
                                backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                borderRadius: 8,
                                marginTop: 16
                            }}
                        >
                            <Text style={{
                                color: '#FFFFFF',
                                fontWeight: '600'
                            }}>
                                Reintentar
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Plans */}
                {!isLoading && plans.length > 0 && plans.map((plan, index) => (
                    <TouchableOpacity
                        key={index}
                        style={{
                            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                            borderRadius: 12,
                            padding: 20,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3
                        }}
                        onPress={() => handlePlanSelection(plan.name)}
                    >
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 12
                        }}>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: '700',
                                color: isDarkMode ? '#F9FAFB' : '#1F2937'
                            }}>
                                {plan.name}
                            </Text>
                            <View>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'baseline'
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: '700',
                                        color: plan.color
                                    }}>
                                        US${plan.price}
                                    </Text>
                                    <Text style={{
                                        marginLeft: 4,
                                        color: isDarkMode ? '#9CA3AF' : '#6B7280'
                                    }}>
                                        /mes
                                    </Text>
                                </View>
                                {plan.pricePerConnection > 0 && (
                                    <Text style={{
                                        fontSize: 12,
                                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                        marginTop: 2
                                    }}>
                                        US${plan.pricePerConnection}/conexión
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 12
                        }}>
                            <Icon name="wifi" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text style={{
                                marginLeft: 8,
                                color: isDarkMode ? '#D1D5DB' : '#374151',
                                fontWeight: '500'
                            }}>
                                Hasta {plan.connections} conexiones
                            </Text>
                        </View>

                        {/* Dynamic Features */}
                        {plan.features && plan.features.map((feature, featureIndex) => (
                            <View key={featureIndex} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: featureIndex > 0 ? 4 : 0
                            }}>
                                <Icon name="check_circle" size={16} color="#10B981" />
                                <Text style={{
                                    marginLeft: 8,
                                    color: isDarkMode ? '#D1D5DB' : '#374151'
                                }}>
                                    {feature}
                                </Text>
                            </View>
                        ))}

                        {plan.pricePerConnection > 0 && (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 8
                            }}>
                                <Icon name="trending_down" size={16} color="#10B981" />
                                <Text style={{
                                    marginLeft: 4,
                                    color: '#10B981',
                                    fontWeight: '600',
                                    fontSize: 12
                                }}>
                                    Precio por conexión competitivo
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Usage Demo - Dynamic Data */}
                {!isLoading && (
                    <View style={{
                        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 20,
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#374151' : '#E5E7EB'
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 16
                        }}>
                            <Icon name="analytics" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: isDarkMode ? '#F9FAFB' : '#1F2937',
                                marginLeft: 12
                            }}>
                                Uso Actual {userData.userId ? '' : '(Demo)'}
                            </Text>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={{
                                fontSize: 48,
                                fontWeight: '700',
                                color: isDarkMode ? '#F9FAFB' : '#1F2937'
                            }}>
                                {userCurrentUsage.activeConnections}
                            </Text>
                            <Text style={{
                                color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                marginBottom: 16
                            }}>
                                de {userCurrentUsage.totalAllowed} conexiones activas/suspendidas
                            </Text>

                            <View style={{
                                width: '100%',
                                height: 8,
                                backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
                                borderRadius: 4,
                                overflow: 'hidden'
                            }}>
                                <View style={{
                                    width: `${Math.min(userCurrentUsage.percentage, 100)}%`,
                                    height: '100%',
                                    backgroundColor: userCurrentUsage.percentage > 90 ? '#EF4444' : 
                                                   userCurrentUsage.percentage > 75 ? '#F59E0B' : '#10B981',
                                    borderRadius: 4
                                }} />
                            </View>

                            <Text style={{
                                color: userCurrentUsage.percentage > 90 ? '#EF4444' : 
                                       userCurrentUsage.percentage > 75 ? '#F59E0B' : '#10B981',
                                fontWeight: '600',
                                marginTop: 8
                            }}>
                                {userCurrentUsage.percentage}% usado - Plan {userCurrentUsage.currentPlan}
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default SubscriptionDemo;