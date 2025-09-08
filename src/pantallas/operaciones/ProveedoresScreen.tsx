import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProveedoresScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id_isp } = route.params || {};
    const { isDarkMode } = useTheme();
    
    const [proveedores, setProveedores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [id_usuario, setIdUsuario] = useState(null);

    const styles = {
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
        },
        headerContainer: {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            paddingTop: 40,
            paddingHorizontal: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        headerContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerLeft: {
            flex: 1,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            marginBottom: 4,
        },
        headerSubtitle: {
            fontSize: 16,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            fontWeight: '500',
        },
        backButton: {
            backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
            padding: 10,
            borderRadius: 8,
            marginRight: 12,
        },
        backButtonText: {
            color: isDarkMode ? '#F9FAFB' : '#111827',
            fontSize: 16,
            fontWeight: '600',
        },
        contentContainer: {
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical: 16,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            fontSize: 16,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            marginTop: 16,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
        },
        emptyIcon: {
            fontSize: 64,
            marginBottom: 16,
        },
        emptyTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            marginBottom: 8,
            textAlign: 'center',
        },
        emptyMessage: {
            fontSize: 16,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 24,
        },
        proveedorCard: {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1,
            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
        },
        proveedorHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        proveedorIcon: {
            fontSize: 24,
            marginRight: 12,
        },
        proveedorName: {
            fontSize: 18,
            fontWeight: '600',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            flex: 1,
        },
        proveedorInfo: {
            marginBottom: 8,
        },
        proveedorLabel: {
            fontSize: 12,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            fontWeight: '500',
        },
        proveedorValue: {
            fontSize: 14,
            color: isDarkMode ? '#F9FAFB' : '#111827',
            fontWeight: '600',
            marginTop: 2,
        },
        addButton: {
            backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 16,
        },
        addButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
    };

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    setIdUsuario(parsedData.id_usuario);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };
        
        loadUserData();
    }, []);

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Aquí iría la llamada real a la API
            // const response = await fetch(`https://wellnet-rd.com:444/api/proveedores?id_isp=${id_isp.id_isp}`);
            // const data = await response.json();
            
            // Por ahora, simularemos datos de ejemplo
            setTimeout(() => {
                setProveedores([
                    {
                        id: 1,
                        nombre: 'Proveedor de Equipos de Red',
                        contacto: 'Juan Pérez',
                        telefono: '809-555-0101',
                        email: 'juan@equiposred.com',
                        direccion: 'Av. Principal 123, Santo Domingo',
                        tipo: 'Equipos'
                    },
                    {
                        id: 2,
                        nombre: 'Servicios de Fibra Óptica',
                        contacto: 'María González',
                        telefono: '809-555-0102',
                        email: 'maria@fibraoptica.com',
                        direccion: 'Calle Secundaria 456, Santiago',
                        tipo: 'Servicios'
                    }
                ]);
                setIsLoading(false);
            }, 1000);
            
        } catch (err) {
            setError('Error al cargar los proveedores');
            setIsLoading(false);
        }
    };

    const renderProveedorItem = ({ item }) => (
        <View style={styles.proveedorCard}>
            <View style={styles.proveedorHeader}>
                <Text style={styles.proveedorIcon}>🏢</Text>
                <Text style={styles.proveedorName}>{item.nombre}</Text>
            </View>
            
            <View style={styles.proveedorInfo}>
                <Text style={styles.proveedorLabel}>Contacto</Text>
                <Text style={styles.proveedorValue}>{item.contacto}</Text>
            </View>
            
            <View style={styles.proveedorInfo}>
                <Text style={styles.proveedorLabel}>Teléfono</Text>
                <Text style={styles.proveedorValue}>{item.telefono}</Text>
            </View>
            
            <View style={styles.proveedorInfo}>
                <Text style={styles.proveedorLabel}>Email</Text>
                <Text style={styles.proveedorValue}>{item.email}</Text>
            </View>
            
            <View style={styles.proveedorInfo}>
                <Text style={styles.proveedorLabel}>Tipo</Text>
                <Text style={styles.proveedorValue}>{item.tipo}</Text>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={styles.emptyTitle}>No hay proveedores</Text>
            <Text style={styles.emptyMessage}>
                Aún no se han registrado proveedores para este ISP
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={() => {
                Alert.alert('Funcionalidad en desarrollo', 'La función de agregar proveedores estará disponible próximamente');
            }}>
                <Text style={styles.addButtonText}>Agregar Proveedor</Text>
            </TouchableOpacity>
        </View>
    );

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
            <Text style={styles.loadingText}>Cargando proveedores...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Volver</Text>
                    </TouchableOpacity>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Proveedores</Text>
                        <Text style={styles.headerSubtitle}>
                            {id_isp?.nombre || 'ISP'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {isLoading ? (
                    renderLoadingState()
                ) : error ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>⚠️</Text>
                        <Text style={styles.emptyTitle}>Error</Text>
                        <Text style={styles.emptyMessage}>{error}</Text>
                        <TouchableOpacity style={styles.addButton} onPress={fetchProveedores}>
                            <Text style={styles.addButtonText}>Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                ) : proveedores.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <FlatList
                        data={proveedores}
                        renderItem={renderProveedorItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </View>
    );
};

export default ProveedoresScreen;