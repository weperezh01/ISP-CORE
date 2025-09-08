import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Alert, TextInput, ScrollView } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './IpAddressDetailsScreenStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';
import { format } from 'date-fns';

const IpAddressDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { ipDetails, id_usuario, routerId } = route.params; // Asegúrate de recibir id_usuario por parámetro
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [ips, setIps] = useState([]);
    const [filteredIps, setFilteredIps] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [isIpDetailsCollapsed, setIsIpDetailsCollapsed] = useState(false);


    useEffect(() => {
        const fetchIps = async () => {
            setIsLoading(true);
            try {
                console.log('🔍 Starting IP fetch process');
                console.log('📋 Request parameters:', {
                    address: ipDetails.address,
                    routerId: routerId,
                    id_usuario: id_usuario
                });
                
                // Preparar el payload
                const requestPayload = { 
                    direccion_ip: ipDetails.address, 
                    id_router: routerId 
                };
                
                console.log('📦 Request payload:', JSON.stringify(requestPayload, null, 2));
                console.log('🌐 Making request to: https://wellnet-rd.com:444/api/routers/ips-por-network');
                console.log('⏱️ Request started at:', new Date().toISOString());
                
                // Crear un timeout para la petición (aumentado a 30 segundos para debugging)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.log('⏰ Request timeout after 30 seconds');
                    console.log('⏰ Timeout occurred at:', new Date().toISOString());
                    controller.abort();
                }, 30000); // 30 segundos timeout para debugging

                const response = await fetch(`https://wellnet-rd.com:444/api/routers/ips-por-network`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestPayload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                
                console.log('📡 Response received at:', new Date().toISOString());
                console.log('📊 Response status:', response.status);
                console.log('📋 Response headers:', response.headers);
                console.log('⏱️ Response time: Success within 30 seconds');
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ API Error Response:', errorText);
                    console.error('❌ Response Status:', response.status);
                    console.error('❌ Response StatusText:', response.statusText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                const data = await response.json();
                console.log('✅ API Response Data:', JSON.stringify(data, null, 2));
                console.log('🔍 Data type:', typeof data);
                console.log('📏 Data length:', Array.isArray(data) ? data.length : 'Not an array');
                
                // Verificar si la respuesta tiene la estructura esperada
                if (Array.isArray(data)) {
                    setIps(data);
                    setFilteredIps(data);
                } else if (data && data.data && Array.isArray(data.data)) {
                    setIps(data.data);
                    setFilteredIps(data.data);
                } else {
                    console.warn('⚠️ Unexpected response format:', data);
                    setIps([]);
                    setFilteredIps([]);
                }
            } catch (error) {
                console.error('❌ Error fetching IPs - Full error object:', error);
                console.error('❌ Error name:', error.name);
                console.error('❌ Error message:', error.message);
                console.error('❌ Error stack:', error.stack);
                
                let errorMessage = 'Error de conexión';
                if (error.name === 'AbortError') {
                    errorMessage = 'Timeout: La solicitud tardó demasiado';
                    console.log('⏰ Request was aborted due to timeout');
                } else if (error.message.includes('Network request failed')) {
                    errorMessage = 'Error de red: Servidor no disponible';
                    console.log('🌐 Network request failed - server might be down');
                } else if (error.message.includes('JSON')) {
                    errorMessage = 'Error de formato en la respuesta';
                    console.log('📝 JSON parsing error');
                } else {
                    console.log('❓ Unknown error type:', error.constructor.name);
                }
                
                console.log('📱 Showing error alert to user:', errorMessage);
                
                // Mostrar error al usuario
                Alert.alert('Error', errorMessage);
                
                // Limpiar datos en caso de error
                setIps([]);
                setFilteredIps([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIps();
    }, [ipDetails.address]);

    useEffect(() => {
        registrarNavegacion(); // Registrar la navegación cuando se cargue la pantalla
    }, []);

    const registrarNavegacion = async () => {
        if (!id_usuario) return;

        const fechaActual = new Date();
        const fecha = format(fechaActual, 'yyyy-MM-dd');
        const hora = format(fechaActual, 'HH:mm:ss');
        const pantalla = 'IpAddressDetailsScreen';

        const datos = JSON.stringify({
            ipDetails,
            searchQuery: search,
            filteredIps,
        });

        const navigationLogData = {
            id_usuario,
            fecha,
            hora,
            pantalla,
            datos
        };

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(navigationLogData),
            });

            if (!response.ok) {
                throw new Error('Error al registrar la navegación.');
            }

            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    useEffect(() => {
        const filtered = ips.filter(ip => 
            ip.direccion_ip.includes(search) || 
            (ip.id_conexion && ip.id_conexion.toString().includes(search)) ||
            (ip.nombres_cliente && ip.nombres_cliente.toLowerCase().includes(search.toLowerCase())) ||
            (ip.apellidos_cliente && ip.apellidos_cliente.toLowerCase().includes(search.toLowerCase()))
        );
        setFilteredIps(filtered);
    }, [search, ips]);

    const getIpStatus = (item) => {
        if (item.id_conexion) {
            return {
                badge: styles.statusAssigned,
                text: styles.statusTextAssigned,
                label: '🔗 Asignada',
                cardStyle: styles.assignedCard
            };
        } else {
            return {
                badge: styles.statusAvailable,
                text: styles.statusTextAvailable,
                label: '✅ Disponible',
                cardStyle: styles.availableCard
            };
        }
    };

    const renderIpItem = ({ item }) => {
        const statusInfo = getIpStatus(item);
        
        return (
            <TouchableOpacity 
                style={[styles.ipCard, statusInfo.cardStyle]}
                onPress={() => navigation.navigate('AssignConnectionScreen', { ipDetails: item, id_usuario })}
                activeOpacity={0.8}
            >
                <View style={styles.ipCardHeader}>
                    <Text style={styles.ipCardIcon}>🌐</Text>
                    <View style={styles.ipCardInfo}>
                        <Text style={styles.ipCardAddress}>{item.direccion_ip}</Text>
                        <Text style={styles.ipCardSubtitle}>Dirección IP de Red</Text>
                    </View>
                    <View style={[styles.ipCardStatusBadge, statusInfo.badge]}>
                        <Text style={statusInfo.text}>{statusInfo.label}</Text>
                    </View>
                </View>
                
                <View style={styles.ipCardContent}>
                    <View style={styles.ipCardDetailRow}>
                        <Text style={styles.ipCardDetailLabel}>ID Conexión</Text>
                        <Text style={styles.ipCardDetailValue}>
                            {item.id_conexion ? item.id_conexion : (
                                <Text style={styles.availableText}>Disponible</Text>
                            )}
                        </Text>
                    </View>
                    
                    {item.id_conexion && (item.nombres_cliente || item.apellidos_cliente) && (
                        <View style={styles.clientInfo}>
                            <Text style={styles.clientName}>
                                👤 {item.nombres_cliente} {item.apellidos_cliente}
                            </Text>
                            {item.direccion_conexion && (
                                <Text style={styles.clientAddress}>
                                    📍 {item.direccion_conexion}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const getMainIpStatus = () => {
        return {
            badge: styles.statusAvailable,
            text: styles.statusTextAvailable,
            label: '🟢 Configurada'
        };
    };

    const renderLoadingState = () => {
        if (!isLoading) return null;
        
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>Cargando direcciones IP...</Text>
                    <Text style={styles.loadingSubtext}>Buscando IPs en la misma red</Text>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => {
        if (filteredIps.length === 0 && !isLoading && search) {
            return (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateIcon}>🔍</Text>
                    <Text style={styles.emptyStateTitle}>No se encontraron resultados</Text>
                    <Text style={styles.emptyStateMessage}>
                        No hay direcciones IP que coincidan con "{search}". Intenta con otros términos de búsqueda.
                    </Text>
                </View>
            );
        }
        
        if (ips.length === 0 && !isLoading) {
            return (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateIcon}>🌐</Text>
                    <Text style={styles.emptyStateTitle}>Red vacía</Text>
                    <Text style={styles.emptyStateMessage}>
                        No se encontraron otras direcciones IP en esta red.
                    </Text>
                </View>
            );
        }
        
        return null;
    };

    const renderNetworkStats = () => {
        const totalIps = ips.length;
        const availableIps = ips.filter(ip => !ip.id_conexion).length;
        const assignedIps = ips.filter(ip => ip.id_conexion).length;
        
        return (
            <View style={styles.networkVisualization}>
                <Text style={styles.networkTitle}>📊 Estadísticas de Red</Text>
                <View style={styles.networkStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{totalIps}</Text>
                        <Text style={styles.statLabel}>Total IPs</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>{availableIps}</Text>
                        <Text style={styles.statLabel}>Disponibles</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: '#3B82F6' }]}>{assignedIps}</Text>
                        <Text style={styles.statLabel}>Asignadas</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderSectionHeader = (title, count) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionCount}>{count}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        {/* <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backButtonText}>← Volver</Text>
                        </TouchableOpacity> */}
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Detalles de IP</Text>
                            <Text style={styles.headerSubtitle}>
                                {ipDetails.address || 'Red de direcciones IP'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <ScrollView 
                    style={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* IP Details Card */}
                    <View style={[
                        styles.ipDetailsCard, 
                        isIpDetailsCollapsed && styles.collapsedCard
                    ]}>
                        {isIpDetailsCollapsed ? (
                            // Collapsed View
                            <View style={styles.collapsedContent}>
                                <View style={styles.collapsedInfo}>
                                    <Text style={styles.ipIcon}>🌐</Text>
                                    <Text style={styles.collapsedAddress}>
                                        {ipDetails.address || 'Dirección no disponible'}
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.collapseButton}
                                    onPress={() => setIsIpDetailsCollapsed(false)}
                                >
                                    <Text style={styles.collapseIcon}>⌄</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // Expanded View
                            <>
                                <TouchableOpacity 
                                    style={styles.collapseButton}
                                    onPress={() => setIsIpDetailsCollapsed(true)}
                                >
                                    <Text style={styles.collapseIcon}>⌃</Text>
                                </TouchableOpacity>
                                
                                <View style={styles.ipDetailsHeader}>
                                    <Text style={styles.ipIcon}>🌐</Text>
                                    <View style={styles.ipMainInfo}>
                                        <Text style={styles.ipAddress}>
                                            {ipDetails.address || 'Dirección no disponible'}
                                        </Text>
                                        <Text style={styles.ipType}>Dirección IP Principal</Text>
                                    </View>
                                    <View style={[styles.ipStatusIndicator, getMainIpStatus().badge]}>
                                        <Text style={getMainIpStatus().text}>
                                            {getMainIpStatus().label}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.ipDetailsGrid}>
                                    <View style={styles.ipDetailRow}>
                                        <Text style={styles.ipDetailLabel}>Red</Text>
                                        <Text style={styles.ipDetailValue}>
                                            {ipDetails.network || 'No especificada'}
                                        </Text>
                                    </View>
                                    <View style={styles.ipDetailRow}>
                                        <Text style={styles.ipDetailLabel}>Interfaz</Text>
                                        <Text style={styles.ipDetailValue}>
                                            {ipDetails.interface || 'No asignada'}
                                        </Text>
                                    </View>
                                    {ipDetails.comment && (
                                        <View style={styles.ipDetailRow}>
                                            <Text style={styles.ipDetailLabel}>Comentario</Text>
                                            <Text style={styles.ipDetailValue}>{ipDetails.comment}</Text>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}
                    </View>

                    {/* Network Statistics */}
                    {ips.length > 0 && renderNetworkStats()}

                    {/* Search Section */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputContainer}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar por IP, ID de Conexión, Nombre o Apellido..."
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                value={search}
                                onChangeText={setSearch}
                                autoCapitalize="none"
                                clearButtonMode="always"
                            />
                        </View>
                    </View>

                    {/* Section Header */}
                    {renderSectionHeader('Direcciones IP en la Red', filteredIps.length)}
                    

                    <View style={styles.spacer} />
                </ScrollView>

                {/* IP List */}
                {renderLoadingState()}
                {renderEmptyState()}
                
                {!isLoading && filteredIps.length > 0 && (
                    <FlatList
                        data={filteredIps}
                        renderItem={renderIpItem}
                        keyExtractor={(item) => item.id_direccion_ip.toString()}
                        contentContainerStyle={styles.ipListContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
};

export default IpAddressDetailsScreen;
