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
    FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ServiciosAdicionalesScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [userToken, setUserToken] = useState('');
    const [ispId, setIspId] = useState(null);
    
    // Form data
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        tipo: 'producto', // producto, servicio, complemento
        activo: true
    });

    const API_BASE = 'https://wellnet-rd.com:444/api';

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (userToken && ispId) {
            loadServicios();
        }
    }, [userToken, ispId]);

    const loadUserData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue != null ? JSON.parse(jsonValue) : null;
            
            if (loginData && loginData.token) {
                setUserToken(loginData.token);
                // Asumiendo que el ISP ID está en los datos del usuario
                setIspId(loginData.isp_id || 1);
            } else {
                Alert.alert('Error', 'No se encontraron datos de autenticación');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            Alert.alert('Error', 'Error al cargar datos del usuario');
        }
    };

    const loadServicios = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/servicios-adicionales?isp_id=${ispId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setServicios(data.data || []);
            } else {
                console.error('Error loading services:', data.message);
                setServicios([]);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            Alert.alert('Error', 'Error al cargar servicios adicionales');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                nombre: service.nombre || '',
                descripcion: service.descripcion || '',
                precio: service.precio?.toString() || '',
                tipo: service.tipo || 'producto',
                activo: service.activo !== false
            });
        } else {
            setEditingService(null);
            setFormData({
                nombre: '',
                descripcion: '',
                precio: '',
                tipo: 'producto',
                activo: true
            });
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingService(null);
        setFormData({
            nombre: '',
            descripcion: '',
            precio: '',
            tipo: 'producto',
            activo: true
        });
    };

    const handleSave = async () => {
        if (!formData.nombre.trim()) {
            Alert.alert('Error', 'El nombre del servicio es requerido');
            return;
        }

        if (!formData.precio.trim() || isNaN(parseFloat(formData.precio))) {
            Alert.alert('Error', 'El precio debe ser un número válido');
            return;
        }

        try {
            const method = editingService ? 'PUT' : 'POST';
            const url = editingService 
                ? `${API_BASE}/servicios-adicionales/${editingService.id}`
                : `${API_BASE}/servicios-adicionales`;

            const payload = {
                ...formData,
                precio: parseFloat(formData.precio),
                isp_id: ispId
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert(
                    'Éxito', 
                    editingService ? 'Servicio actualizado exitosamente' : 'Servicio creado exitosamente'
                );
                closeModal();
                loadServicios();
            } else {
                Alert.alert('Error', data.message || 'Error al guardar el servicio');
            }
        } catch (error) {
            console.error('Error saving service:', error);
            Alert.alert('Error', 'Error al guardar el servicio');
        }
    };

    const handleDelete = (service) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de que deseas eliminar "${service.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: () => deleteService(service.id)
                }
            ]
        );
    };

    const deleteService = async (serviceId) => {
        try {
            const response = await fetch(`${API_BASE}/servicios-adicionales/${serviceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert('Éxito', 'Servicio eliminado exitosamente');
                loadServicios();
            } else {
                Alert.alert('Error', data.message || 'Error al eliminar el servicio');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            Alert.alert('Error', 'Error al eliminar el servicio');
        }
    };

    const renderServiceItem = ({ item }) => (
        <View style={[styles.serviceCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                    <Text style={[styles.serviceName, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>
                        {item.nombre}
                    </Text>
                    <Text style={[styles.serviceType, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                    </Text>
                </View>
                <View style={styles.serviceActions}>
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
            
            {item.descripcion ? (
                <Text style={[styles.serviceDescription, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                    {item.descripcion}
                </Text>
            ) : null}
            
            <View style={styles.serviceFooter}>
                <Text style={[styles.servicePrice, { color: isDarkMode ? '#34D399' : '#059669' }]}>
                    ${parseFloat(item.precio || 0).toFixed(2)}
                </Text>
                <View style={[
                    styles.statusBadge, 
                    { backgroundColor: item.activo ? '#10B981' : '#6B7280' }
                ]}>
                    <Text style={styles.statusText}>
                        {item.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                </View>
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
        serviceCard: {
            marginBottom: 16,
            padding: 20,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        serviceHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
        },
        serviceInfo: {
            flex: 1,
        },
        serviceName: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 4,
        },
        serviceType: {
            fontSize: 14,
            fontWeight: '500',
        },
        serviceActions: {
            flexDirection: 'row',
            gap: 8,
        },
        actionButton: {
            padding: 8,
            borderRadius: 6,
        },
        serviceDescription: {
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 12,
        },
        serviceFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        servicePrice: {
            fontSize: 18,
            fontWeight: '700',
        },
        statusBadge: {
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
        },
        statusText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
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
            marginBottom: 20,
            textAlign: 'center',
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
        typeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        typeButton: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            borderWidth: 1,
            marginHorizontal: 4,
            alignItems: 'center',
        },
        typeButtonActive: {
            backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
            borderColor: isDarkMode ? '#3B82F6' : '#2563EB',
        },
        typeButtonInactive: {
            backgroundColor: 'transparent',
            borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
        },
        typeButtonText: {
            fontSize: 14,
            fontWeight: '500',
        },
        typeButtonTextActive: {
            color: '#FFFFFF',
        },
        typeButtonTextInactive: {
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
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
                        <Text style={styles.headerTitle}>Servicios Adicionales</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                    <Text style={styles.loadingText}>Cargando servicios...</Text>
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
                    <Text style={styles.headerTitle}>Servicios Adicionales</Text>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => openModal()}
                    >
                        <Icon name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Agregar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {servicios.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="miscellaneous_services" size={64} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
                        <Text style={styles.emptyText}>
                            No hay servicios adicionales registrados.{'\n'}
                            Toca "Agregar" para crear el primero.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={servicios}
                        renderItem={renderServiceItem}
                        keyExtractor={(item) => item.id.toString()}
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
                            {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nombre *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Nombre del servicio"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                value={formData.nombre}
                                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Descripción</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Descripción del servicio"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                value={formData.descripcion}
                                onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                                multiline={true}
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Precio *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="0.00"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                value={formData.precio}
                                onChangeText={(text) => setFormData({ ...formData, precio: text })}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Tipo</Text>
                            <View style={styles.typeContainer}>
                                {['producto', 'servicio', 'complemento'].map((tipo) => (
                                    <TouchableOpacity
                                        key={tipo}
                                        style={[
                                            styles.typeButton,
                                            formData.tipo === tipo ? styles.typeButtonActive : styles.typeButtonInactive
                                        ]}
                                        onPress={() => setFormData({ ...formData, tipo })}
                                    >
                                        <Text style={[
                                            styles.typeButtonText,
                                            formData.tipo === tipo ? styles.typeButtonTextActive : styles.typeButtonTextInactive
                                        ]}>
                                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

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
                                    {editingService ? 'Actualizar' : 'Guardar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ServiciosAdicionalesScreen;