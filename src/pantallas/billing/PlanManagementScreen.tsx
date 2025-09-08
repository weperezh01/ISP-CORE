import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SubscriptionPlan } from '../../config/subscriptionPlans';

const PlanManagementScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const [plans, setPlans] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [userToken, setUserToken] = useState('');
    
    // Form state for creating/editing plans
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        price: '',
        connectionLimit: '',
        pricePerConnection: '',
        features: '',
        recommended: false
    });

    // API Base URL
    const API_BASE = 'https://wellnet-rd.com:444/api';

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        // Cargar planes solo si el token de usuario está disponible
        if (userToken) {
            loadPlans();
        }
    }, [userToken]);

    const loadUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            
            if (loginData && loginData.token) {
                // Determinar nivel de usuario (puede estar en nivel raíz o en objeto usuario)
                const userLevel = loginData.nivel_usuario || loginData.usuario?.nivel_usuario;
                
                // Check if user is MEGA ADMINISTRADOR
                if (userLevel !== 'MEGA ADMINISTRADOR') {
                    Alert.alert('Acceso Denegado', 'Solo los MEGA ADMINISTRADORES pueden gestionar planes de suscripción.');
                    navigation.goBack();
                    return;
                }
                
                setUserToken(loginData.token);
            } else {
                console.warn('No token found in login data');
                redirectToLogin();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            Alert.alert('Error', 'Error al cargar datos de usuario');
            navigation.goBack();
        }
    };


    const redirectToLogin = () => {
        Alert.alert(
            'Sesión Expirada', 
            'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        AsyncStorage.removeItem('@loginData');
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'LoginScreen' }],
                            })
                        );
                    }
                }
            ]
        );
    };

    const loadPlans = async () => {
        try {
            setInitialLoading(true);
            
            const response = await fetch(`${API_BASE}/subscription-plans`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setPlans(data.data || []);
                console.log('✅ Plans loaded from database:', data.data?.length || 0, 'plans');
                console.log('🔍 Sample plan structure:', data.data?.[0] ? JSON.stringify(data.data[0], null, 2) : 'No plans');
            } else {
                if (response.status === 401) {
                    Alert.alert('Error de Autenticación', 'Token inválido o expirado. Por favor inicia sesión nuevamente.');
                    await AsyncStorage.removeItem('@loginData');
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'LoginScreen' }],
                        })
                    );
                } else {
                    throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
                }
            }
        } catch (error) {
            console.error('Error loading plans:', error);
            Alert.alert('Error', 'No se pudieron cargar los planes: ' + error.message);
        } finally {
            setInitialLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            price: '',
            connectionLimit: '',
            pricePerConnection: '',
            features: '',
            recommended: false
        });
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEditModal = (plan) => {
        setSelectedPlan(plan);
        setFormData({
            id: plan.id,
            name: plan.name,
            price: plan.price.toString(),
            connectionLimit: plan.connection_limit?.toString() || '',
            pricePerConnection: plan.price_per_connection.toString(),
            features: Array.isArray(plan.features) ? plan.features.join('\n') : plan.features,
            recommended: plan.recommended || false
        });
        setShowEditModal(true);
    };

    const validateForm = () => {
        // Validar nombre (mínimo 3 caracteres según backend)
        if (!formData.name || formData.name.trim().length < 3) {
            Alert.alert('Error', 'El nombre es requerido y debe tener al menos 3 caracteres');
            return false;
        }

        // Validar precio (debe ser un número no negativo, puede ser 0 para planes gratuitos)
        if (formData.price === '' || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
            Alert.alert('Error', 'El precio debe ser un número no negativo (0 o mayor)');
            return false;
        }

        // Validar precio por conexión (debe ser un número no negativo, puede ser 0)
        if (formData.pricePerConnection === '' || isNaN(parseFloat(formData.pricePerConnection)) || parseFloat(formData.pricePerConnection) < 0) {
            Alert.alert('Error', 'El precio por conexión debe ser un número no negativo (0 o mayor)');
            return false;
        }

        // Validar límite de conexiones (si se proporciona)
        if (formData.connectionLimit && (isNaN(parseInt(formData.connectionLimit)) || parseInt(formData.connectionLimit) <= 0)) {
            Alert.alert('Error', 'El límite de conexiones debe ser un número mayor a 0');
            return false;
        }

        // Validar que tenga al menos una característica
        const features = formData.features.split('\n').filter(f => f.trim());
        if (features.length === 0) {
            Alert.alert('Error', 'Debe agregar al menos una característica del plan');
            return false;
        }

        return true;
    };

    const createPlan = async () => {
        if (!validateForm()) return;

        // Confirmación antes de crear
        Alert.alert(
            'Confirmar Creación',
            `¿Estás seguro de que quieres crear el plan "${formData.name}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Crear Plan',
                    style: 'default',
                    onPress: () => executeCreatePlan()
                }
            ]
        );
    };

    const executeCreatePlan = async () => {
        setLoading(true);
        try {
            const requestBody = {
                name: formData.name,
                price: parseFloat(formData.price),
                connection_limit: formData.connectionLimit ? parseInt(formData.connectionLimit) : null,
                price_per_connection: parseFloat(formData.pricePerConnection),
                features: formData.features.split('\n').filter(f => f.trim()),
                recommended: formData.recommended
            };

            const response = await fetch(`${API_BASE}/subscription-plans`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setShowCreateModal(false);
                resetForm();
                loadPlans(); // Reload plans from server
                Alert.alert('Éxito', 'Plan creado exitosamente');
            } else {
                // Si hay errores específicos, mostrarlos
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).join('\n');
                    Alert.alert('Error de Validación', errorMessages);
                } else {
                    Alert.alert('Error', data.message || 'Error al crear el plan');
                }
                return; // No lanzar excepción, ya mostramos el error
            }
        } catch (error) {
            console.error('Error creating plan:', error);
            Alert.alert('Error', 'No se pudo crear el plan: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updatePlan = async () => {
        if (!validateForm()) return;

        // Confirmación antes de actualizar
        Alert.alert(
            'Confirmar Actualización',
            `¿Estás seguro de que quieres actualizar el plan "${formData.name}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Actualizar',
                    style: 'default',
                    onPress: () => executeUpdatePlan()
                }
            ]
        );
    };

    const executeUpdatePlan = async () => {
        setLoading(true);
        try {
            const requestBody = {
                name: formData.name,
                price: parseFloat(formData.price),
                connection_limit: formData.connectionLimit ? parseInt(formData.connectionLimit) : null,
                price_per_connection: parseFloat(formData.pricePerConnection),
                features: formData.features.split('\n').filter(f => f.trim()),
                recommended: formData.recommended
            };

            const response = await fetch(`${API_BASE}/subscription-plans/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setShowEditModal(false);
                setSelectedPlan(null);
                resetForm();
                loadPlans(); // Reload plans from server
                Alert.alert('Éxito', 'Plan actualizado exitosamente');
            } else {
                // Si hay errores específicos, mostrarlos
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).join('\n');
                    Alert.alert('Error de Validación', errorMessages);
                } else {
                    Alert.alert('Error', data.message || 'Error al actualizar el plan');
                }
                return; // No lanzar excepción, ya mostramos el error
            }
        } catch (error) {
            console.error('Error updating plan:', error);
            Alert.alert('Error', 'No se pudo actualizar el plan: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const deletePlan = (plan) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de que quieres eliminar el plan "${plan.name}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_BASE}/subscription-plans/${plan.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${userToken}`,
                                    'Content-Type': 'application/json',
                                }
                            });

                            const data = await response.json();
                            
                            if (response.ok && data.success) {
                                loadPlans(); // Reload plans from server
                                Alert.alert('Éxito', 'Plan eliminado exitosamente');
                            } else {
                                throw new Error(data.message || 'Error al eliminar el plan');
                            }
                        } catch (error) {
                            console.error('Error deleting plan:', error);
                            Alert.alert('Error', 'No se pudo eliminar el plan: ' + error.message);
                        }
                    }
                }
            ]
        );
    };

    const PlanCard = ({ plan }) => {
        // Validaciones seguras
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
                    safeFeatures = [String(plan.features)];
                }
            }
        } catch (error) {
            console.log('Error processing features:', error);
            safeFeatures = [];
        }

        return (
            <View style={[
                styles.planCard,
                { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
                isRecommended && styles.recommendedCard
            ]}>
                <View style={styles.planHeader}>
                    <View style={styles.planTitleContainer}>
                        <Text style={[styles.planName, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                            {safeName}
                        </Text>
                        {isRecommended && (
                            <View style={[styles.recommendedBadge, { backgroundColor: '#F59E0B' }]}>
                                <Text style={styles.badgeText}>Recomendado</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.planActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                            onPress={() => openEditModal(plan)}
                        >
                            <Icon name="edit" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                            onPress={() => deletePlan(plan)}
                        >
                            <Icon name="delete" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.planDetails}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.planPrice, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                            US${safePrice}
                        </Text>
                        <Text style={[styles.priceLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            /mes
                        </Text>
                    </View>

                    <View style={styles.planInfo}>
                        <View style={styles.infoRow}>
                            <Icon name="wifi" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text style={[styles.infoText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                {safeConnectionLimit ? `${safeConnectionLimit} conexiones` : 'Conexiones ilimitadas'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="attach-money" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text style={[styles.infoText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                US${safePricePerConnection}/conexión
                            </Text>
                        </View>
                    </View>

                    <View style={styles.featuresContainer}>
                        <Text style={[styles.featuresTitle, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                            Características:
                        </Text>
                        {safeFeatures.length > 0 ? (
                            <>
                                {safeFeatures.slice(0, 3).map((feature, index) => (
                                    <View key={index} style={styles.featureItem}>
                                        <Icon name="check-circle" size={14} color="#10B981" />
                                        <Text style={[styles.featureText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                            {feature}
                                        </Text>
                                    </View>
                                ))}
                                {safeFeatures.length > 3 && (
                                    <Text style={[styles.moreFeatures, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        +{safeFeatures.length - 3} más...
                                    </Text>
                                )}
                            </>
                        ) : (
                            <Text style={[styles.featureText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                No hay características definidas
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const PlanFormModal = ({ visible, onClose, onSave, title }) => (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                            {title}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                Nombre del Plan *
                            </Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                                        color: isDarkMode ? '#F9FAFB' : '#1F2937',
                                        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB'
                                    }
                                ]}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Ej: Premium"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                Precio Mensual (USD) *
                            </Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                                        color: isDarkMode ? '#F9FAFB' : '#1F2937',
                                        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB'
                                    }
                                ]}
                                value={formData.price}
                                onChangeText={(text) => setFormData({ ...formData, price: text })}
                                placeholder="75"
                                keyboardType="numeric"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                Límite de Conexiones (vacío = ilimitado)
                            </Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                                        color: isDarkMode ? '#F9FAFB' : '#1F2937',
                                        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB'
                                    }
                                ]}
                                value={formData.connectionLimit}
                                onChangeText={(text) => setFormData({ ...formData, connectionLimit: text })}
                                placeholder="1000"
                                keyboardType="numeric"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                Precio por Conexión (USD) *
                            </Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                                        color: isDarkMode ? '#F9FAFB' : '#1F2937',
                                        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB'
                                    }
                                ]}
                                value={formData.pricePerConnection}
                                onChangeText={(text) => setFormData({ ...formData, pricePerConnection: text })}
                                placeholder="0.075"
                                keyboardType="numeric"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                Características (una por línea)
                            </Text>
                            <TextInput
                                style={[
                                    styles.textAreaInput,
                                    {
                                        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                                        color: isDarkMode ? '#F9FAFB' : '#1F2937',
                                        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB'
                                    }
                                ]}
                                value={formData.features}
                                onChangeText={(text) => setFormData({ ...formData, features: text })}
                                placeholder="Dashboard personalizado&#10;Reportes exportables&#10;Soporte prioritario"
                                multiline
                                numberOfLines={4}
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.checkboxContainer,
                                { backgroundColor: isDarkMode ? '#374151' : '#F9FAFB' }
                            ]}
                            onPress={() => setFormData({ ...formData, recommended: !formData.recommended })}
                        >
                            <Icon 
                                name={formData.recommended ? 'check-box' : 'check-box-outline-blank'} 
                                size={24} 
                                color={formData.recommended ? '#3B82F6' : (isDarkMode ? '#9CA3AF' : '#6B7280')} 
                            />
                            <Text style={[styles.checkboxLabel, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                Marcar como plan recomendado
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton, { borderColor: isDarkMode ? '#4B5563' : '#D1D5DB' }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.cancelButtonText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton, { backgroundColor: '#3B82F6' }]}
                            onPress={onSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (initialLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }]}>
                <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                <Text style={[styles.loadingText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                    Cargando planes de suscripción...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color={isDarkMode ? '#F9FAFB' : '#1F2937'} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        Gestión de Planes
                    </Text>
                    <TouchableOpacity onPress={openCreateModal}>
                        <Icon name="add" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Info Banner */}
                <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#1E3A8A' : '#DBEAFE' }]}>
                    <Icon name="info" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={[styles.infoText, { color: isDarkMode ? '#93C5FD' : '#1E40AF' }]}>
                        Gestiona los planes de suscripción para ISPs. Los cambios se aplicarán inmediatamente.
                    </Text>
                </View>

                {/* Plans List */}
                <View style={styles.plansContainer}>
                    {plans.map((plan) => (
                        <PlanCard 
                            key={plan.id} 
                            plan={plan} 
                            openEditModal={openEditModal}
                            deletePlan={deletePlan}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Create Plan Modal */}
            <PlanFormModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSave={createPlan}
                title="Crear Nuevo Plan"
                formData={formData}
                setFormData={setFormData}
                loading={loading}
            />

            {/* Edit Plan Modal */}
            <PlanFormModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={updatePlan}
                title="Editar Plan"
                formData={formData}
                setFormData={setFormData}
                loading={loading}
            />
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
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    infoText: {
        marginLeft: 12,
        fontSize: 14,
        flex: 1,
    },
    plansContainer: {
        gap: 16,
    },
    planCard: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    recommendedCard: {
        borderColor: '#F59E0B',
        borderWidth: 2,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    planTitleContainer: {
        flex: 1,
    },
    planName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    recommendedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    planActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planDetails: {
        gap: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    planPrice: {
        fontSize: 28,
        fontWeight: '700',
    },
    priceLabel: {
        fontSize: 16,
        marginLeft: 4,
    },
    planInfo: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '500',
    },
    featuresContainer: {
        gap: 6,
    },
    featuresTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        fontSize: 13,
        flex: 1,
    },
    moreFeatures: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        margin: 20,
        borderRadius: 16,
        maxHeight: '90%',
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    modalContent: {
        padding: 20,
        maxHeight: 400,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textAreaInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    modalButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    saveButton: {
        backgroundColor: '#3B82F6',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
};

export default PlanManagementScreen;