import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
    FlatList,
    Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ACCOUNTING_PLANS } from '../config/accountingPlans';

const ContabilidadPlanManagementScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [userToken, setUserToken] = useState('');
    
    // Form data
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        price: '',
        transaction_limit: '',
        price_per_transaction: '',
        features: '',
        active: true,
        recommended: false
    });

    const API_BASE = 'https://wellnet-rd.com:444/api';

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (userToken) {
            loadPlans();
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
            Alert.alert('Error', 'Error al cargar datos del usuario');
        }
    };

    const loadPlans = async () => {
        try {
            setLoading(true);
            console.log('🔍 [PLAN-MGMT] Cargando planes de contabilidad...');
            console.log('  📋 URL:', `${API_BASE}/accounting/plans`);
            console.log('  🔑 Token disponible:', userToken ? 'Sí' : 'No');
            
            const response = await fetch(`${API_BASE}/accounting/plans`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            console.log('  📊 Response status:', response.status);
            const data = await response.json();
            console.log('  📋 Response data:', data);
            
            if (response.ok && data.success) {
                console.log('  ✅ Planes cargados:', data.data?.length || 0);
                
                // Convertir active de número a boolean para compatibilidad
                const processedPlans = (data.data || []).map(plan => ({
                    ...plan,
                    active: plan.active === 1 || plan.active === true
                }));
                
                setPlans(processedPlans);
            } else {
                console.error('  ❌ Error loading plans:', data.message);
                Alert.alert('Error', data.message || 'Error al cargar planes de contabilidad');
                setPlans([]);
            }
        } catch (error) {
            console.error('  ❌ Error fetching plans:', error);
            console.log('  📋 Usando planes de fallback...');
            
            // Usar planes centralizados como fallback
            const fallbackPlans = ACCOUNTING_PLANS.map(plan => ({
                ...plan,
                price: plan.price,
                transaction_limit: plan.transactionLimit,
                price_per_transaction: plan.pricePerTransaction,
                active: true
            }));
            
            setPlans(fallbackPlans);
            Alert.alert(
                'Modo Sin Conexión', 
                'Mostrando planes por defecto. Algunas funciones pueden estar limitadas.'
            );
        } finally {
            setLoading(false);
        }
    };

    const openModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                id: plan.id || '',
                name: plan.name || '',
                price: plan.price?.toString() || '',
                transaction_limit: plan.transaction_limit?.toString() || '',
                price_per_transaction: plan.price_per_transaction?.toString() || '',
                features: Array.isArray(plan.features) ? plan.features.join('\n') : plan.features || '',
                active: plan.active !== false,
                recommended: plan.recommended === true
            });
        } else {
            setEditingPlan(null);
            setFormData({
                id: '',
                name: '',
                price: '',
                transaction_limit: '',
                price_per_transaction: '',
                features: '',
                active: true,
                recommended: false
            });
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingPlan(null);
        setFormData({
            id: '',
            name: '',
            price: '',
            transaction_limit: '',
            price_per_transaction: '',
            features: '',
            active: true,
            recommended: false
        });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'El nombre del plan es requerido');
            return;
        }

        if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
            Alert.alert('Error', 'El precio debe ser un número válido');
            return;
        }

        if (!formData.id.trim()) {
            Alert.alert('Error', 'El ID del plan es requerido');
            return;
        }

        try {
            const method = editingPlan ? 'PUT' : 'POST';
            const url = editingPlan 
                ? `${API_BASE}/accounting/plans/${editingPlan.id}`
                : `${API_BASE}/accounting/plans`;

            const payload = {
                id: formData.id.trim(),
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                transaction_limit: formData.transaction_limit ? parseInt(formData.transaction_limit) : null,
                price_per_transaction: formData.price_per_transaction ? parseFloat(formData.price_per_transaction) : 0,
                features: formData.features.split('\n').filter(f => f.trim() !== ''),
                active: formData.active,
                recommended: formData.recommended
            };

            console.log('💾 [PLAN-SAVE] Guardando plan...');
            console.log('  📋 Method:', method);
            console.log('  🌐 URL:', url);
            console.log('  📦 Payload:', payload);

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('  📊 Response status:', response.status);
            console.log('  📋 Response headers:', response.headers);

            // Obtener texto de respuesta primero para detectar HTML
            const responseText = await response.text();
            console.log('  📄 Response text (first 200 chars):', responseText.substring(0, 200));

            // Verificar si la respuesta es HTML (indica error del servidor)
            if (responseText.trim().startsWith('<')) {
                console.error('❌ [PLAN-SAVE] Servidor devolvió HTML en lugar de JSON');
                console.log('  🔍 Full HTML response:', responseText);
                Alert.alert(
                    'Error del Servidor', 
                    'El endpoint no existe o hay un error en el servidor. El backend devolvió HTML en lugar de JSON.'
                );
                return;
            }

            let data;
            try {
                data = JSON.parse(responseText);
                console.log('  📋 Response JSON:', data);
            } catch (jsonError) {
                console.error('❌ [PLAN-SAVE] Error parsing JSON:', jsonError);
                console.log('  📄 Raw response:', responseText);
                Alert.alert('Error', 'Respuesta inválida del servidor');
                return;
            }

            if (response.ok && data.success) {
                console.log('✅ [PLAN-SAVE] Plan guardado exitosamente');
                Alert.alert(
                    'Éxito', 
                    editingPlan ? 'Plan actualizado exitosamente' : 'Plan creado exitosamente'
                );
                closeModal();
                loadPlans();
            } else {
                console.error('❌ [PLAN-SAVE] Error del servidor:', data.message);
                Alert.alert('Error', data.message || 'Error al guardar el plan');
            }
        } catch (error) {
            console.error('❌ [PLAN-SAVE] Error de red:', error);
            Alert.alert('Error', 'Error de conexión al guardar el plan');
        }
    };

    const handleDelete = (plan) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de que deseas eliminar el plan "${plan.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: () => deletePlan(plan.id)
                }
            ]
        );
    };

    const deletePlan = async (planId) => {
        try {
            console.log('🗑️ [PLAN-DELETE] Eliminando plan...');
            console.log('  📋 Plan ID:', planId);
            console.log('  🌐 URL:', `${API_BASE}/accounting/plans/${planId}`);

            const response = await fetch(`${API_BASE}/accounting/plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            console.log('  📊 Response status:', response.status);

            // Obtener texto de respuesta primero para detectar HTML
            const responseText = await response.text();
            console.log('  📄 Response text (first 200 chars):', responseText.substring(0, 200));

            // Verificar si la respuesta es HTML (indica error del servidor)
            if (responseText.trim().startsWith('<')) {
                console.error('❌ [PLAN-DELETE] Servidor devolvió HTML en lugar de JSON');
                Alert.alert(
                    'Error del Servidor', 
                    'El endpoint DELETE no existe o hay un error en el servidor.'
                );
                return;
            }

            let data;
            try {
                data = JSON.parse(responseText);
                console.log('  📋 Response JSON:', data);
            } catch (jsonError) {
                console.error('❌ [PLAN-DELETE] Error parsing JSON:', jsonError);
                Alert.alert('Error', 'Respuesta inválida del servidor');
                return;
            }

            if (response.ok && data.success) {
                console.log('✅ [PLAN-DELETE] Plan eliminado exitosamente');
                Alert.alert('Éxito', 'Plan eliminado exitosamente');
                loadPlans();
            } else {
                console.error('❌ [PLAN-DELETE] Error del servidor:', data.message);
                Alert.alert('Error', data.message || 'Error al eliminar el plan');
            }
        } catch (error) {
            console.error('❌ [PLAN-DELETE] Error de red:', error);
            Alert.alert('Error', 'Error de conexión al eliminar el plan');
        }
    };

    const togglePlanStatus = async (plan) => {
        try {
            console.log('🔄 [PLAN-TOGGLE] Cambiando estado del plan...');
            console.log('  📋 Plan:', plan.name);
            console.log('  🔄 Estado actual → nuevo:', plan.active, '→', !plan.active);

            const response = await fetch(`${API_BASE}/accounting/plans/${plan.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...plan,
                    active: !plan.active
                })
            });

            console.log('  📊 Response status:', response.status);

            // Obtener texto de respuesta primero para detectar HTML
            const responseText = await response.text();
            console.log('  📄 Response text (first 200 chars):', responseText.substring(0, 200));

            // Verificar si la respuesta es HTML (indica error del servidor)
            if (responseText.trim().startsWith('<')) {
                console.error('❌ [PLAN-TOGGLE] Servidor devolvió HTML en lugar de JSON');
                Alert.alert(
                    'Error del Servidor', 
                    'El endpoint PUT no existe o hay un error en el servidor.'
                );
                return;
            }

            let data;
            try {
                data = JSON.parse(responseText);
                console.log('  📋 Response JSON:', data);
            } catch (jsonError) {
                console.error('❌ [PLAN-TOGGLE] Error parsing JSON:', jsonError);
                Alert.alert('Error', 'Respuesta inválida del servidor');
                return;
            }

            if (response.ok && data.success) {
                console.log('✅ [PLAN-TOGGLE] Estado cambiado exitosamente');
                loadPlans();
            } else {
                console.error('❌ [PLAN-TOGGLE] Error del servidor:', data.message);
                Alert.alert('Error', data.message || 'Error al cambiar estado del plan');
            }
        } catch (error) {
            console.error('❌ [PLAN-TOGGLE] Error de red:', error);
            Alert.alert('Error', 'Error de conexión al cambiar estado del plan');
        }
    };

    const renderPlanItem = ({ item }) => (
        <View style={[styles.planCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.planHeader}>
                <View style={styles.planTitleContainer}>
                    <Text style={[styles.planName, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        {item.name}
                    </Text>
                    <Text style={[styles.planId, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        ID: {item.id}
                    </Text>
                    {item.recommended && (
                        <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedText}>Recomendado</Text>
                        </View>
                    )}
                </View>
                <View style={styles.planActions}>
                    <Switch
                        value={item.active}
                        onValueChange={() => togglePlanStatus(item)}
                        trackColor={{ false: '#767577', true: '#10B981' }}
                        thumbColor={item.active ? '#FFFFFF' : '#f4f3f4'}
                    />
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB' }]}
                        onPress={() => openModal(item)}
                    >
                        <Icon name="edit" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleDelete(item)}
                    >
                        <Icon name="delete" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.planDetails}>
                <View style={styles.priceContainer}>
                    <Text style={[styles.planPrice, { color: '#10B981' }]}>
                        ${parseFloat(item.price || 0).toFixed(2)}
                    </Text>
                    <Text style={[styles.priceLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        /mes
                    </Text>
                </View>

                <View style={styles.limitContainer}>
                    <Icon name="analytics" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.limitText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {item.transaction_limit 
                            ? `${item.transaction_limit} transacciones/mes`
                            : 'Transacciones ilimitadas'
                        }
                    </Text>
                </View>

                {item.price_per_transaction > 0 && (
                    <View style={styles.overageContainer}>
                        <Icon name="attach_money" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.overageText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            ${item.price_per_transaction} por transacción extra
                        </Text>
                    </View>
                )}

                {item.features && item.features.length > 0 && (
                    <View style={styles.featuresContainer}>
                        <Text style={[styles.featuresTitle, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                            Características:
                        </Text>
                        {item.features.slice(0, 3).map((feature, index) => (
                            <View key={index} style={styles.featureItem}>
                                <Icon name="check_circle" size={14} color="#10B981" />
                                <Text style={[styles.featureText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                    {feature}
                                </Text>
                            </View>
                        ))}
                        {item.features.length > 3 && (
                            <Text style={[styles.moreFeatures, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                +{item.features.length - 3} características más
                            </Text>
                        )}
                    </View>
                )}
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
        addButton: {
            backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        addButtonText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 4,
        },
        content: {
            flex: 1,
            padding: 16,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 100,
        },
        emptyText: {
            fontSize: 16,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            textAlign: 'center',
            marginTop: 16,
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
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 4,
        },
        planId: {
            fontSize: 12,
            marginBottom: 8,
        },
        recommendedBadge: {
            backgroundColor: '#F59E0B',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 12,
            alignSelf: 'flex-start',
        },
        recommendedText: {
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '600',
        },
        planActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        actionButton: {
            padding: 8,
            borderRadius: 6,
        },
        planDetails: {
            gap: 12,
        },
        priceContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
        },
        planPrice: {
            fontSize: 24,
            fontWeight: '700',
        },
        priceLabel: {
            fontSize: 14,
            marginLeft: 4,
        },
        limitContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        limitText: {
            fontSize: 14,
            marginLeft: 4,
        },
        overageContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        overageText: {
            fontSize: 12,
            marginLeft: 4,
        },
        featuresContainer: {
            marginTop: 8,
        },
        featuresTitle: {
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 4,
        },
        featureItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 2,
        },
        featureText: {
            fontSize: 12,
            marginLeft: 4,
            flex: 1,
        },
        moreFeatures: {
            fontSize: 10,
            fontStyle: 'italic',
            marginTop: 2,
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
            maxWidth: 500,
            maxHeight: '90%',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            marginBottom: 20,
            textAlign: 'center',
        },
        modalContent: {
            maxHeight: 400,
        },
        inputContainer: {
            marginBottom: 16,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: isDarkMode ? '#D1D5DB' : '#374151',
            marginBottom: 8,
        },
        textInput: {
            borderWidth: 1,
            borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            color: isDarkMode ? '#F9FAFB' : '#1F2937',
            backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
        },
        textArea: {
            height: 80,
            textAlignVertical: 'top',
        },
        switchContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        switchLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: isDarkMode ? '#D1D5DB' : '#374151',
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 24,
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
        saveButton: {
            backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
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
                        <Text style={styles.headerTitle}>Gestión de Planes</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={styles.loadingText}>Cargando planes...</Text>
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
                    <Text style={styles.headerTitle}>Gestión de Planes de Contabilidad</Text>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => openModal()}
                    >
                        <Icon name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Nuevo</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {plans.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="business_center" size={64} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
                        <Text style={styles.emptyText}>
                            No hay planes de contabilidad registrados.{'\n'}
                            Toca "Nuevo" para crear el primero.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={plans}
                        renderItem={renderPlanItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingPlan ? 'Editar Plan' : 'Nuevo Plan de Contabilidad'}
                        </Text>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>ID del Plan *</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="contabilidad_basico"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={formData.id}
                                    onChangeText={(text) => setFormData({ ...formData, id: text })}
                                    editable={!editingPlan}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Nombre del Plan *</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Contabilidad Básica"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Precio Mensual *</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="250.00"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={formData.price}
                                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Límite de Transacciones</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="100 (vacío = ilimitado)"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={formData.transaction_limit}
                                    onChangeText={(text) => setFormData({ ...formData, transaction_limit: text })}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Precio por Transacción Extra</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="0.50"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={formData.price_per_transaction}
                                    onChangeText={(text) => setFormData({ ...formData, price_per_transaction: text })}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Características (una por línea)</Text>
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    placeholder="Facturación mensual&#10;Estados financieros básicos&#10;Conciliación bancaria"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={formData.features}
                                    onChangeText={(text) => setFormData({ ...formData, features: text })}
                                    multiline={true}
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={styles.switchContainer}>
                                <Text style={styles.switchLabel}>Plan Activo</Text>
                                <Switch
                                    value={formData.active}
                                    onValueChange={(value) => setFormData({ ...formData, active: value })}
                                    trackColor={{ false: '#767577', true: '#10B981' }}
                                    thumbColor={formData.active ? '#FFFFFF' : '#f4f3f4'}
                                />
                            </View>

                            <View style={styles.switchContainer}>
                                <Text style={styles.switchLabel}>Plan Recomendado</Text>
                                <Switch
                                    value={formData.recommended}
                                    onValueChange={(value) => setFormData({ ...formData, recommended: value })}
                                    trackColor={{ false: '#767577', true: '#F59E0B' }}
                                    thumbColor={formData.recommended ? '#FFFFFF' : '#f4f3f4'}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={closeModal}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSave}
                            >
                                <Text style={styles.modalButtonText}>
                                    {editingPlan ? 'Actualizar' : 'Crear'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ContabilidadPlanManagementScreen;