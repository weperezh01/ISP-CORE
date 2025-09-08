import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './RouterDetailsScreenStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';
import { format } from 'date-fns';
import SystemResources from './components/SystemResources';
import RouterInfoCard from './components/RouterInfoCard';
import InterfaceItem from './components/InterfaceItem';
import VlanItem from './components/VlanItem';

const RouterDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { routerId, id_usuario } = route.params; // Asegúrate de recibir id_usuario por parámetro
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [router, setRouter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [interfaces, setInterfaces] = useState([]);
    const [vlans, setVlans] = useState([]);
    const [ipAddresses, setIpAddresses] = useState([]);
    const [systemResources, setSystemResources] = useState(null);
    const [isUpdatingResources, setIsUpdatingResources] = useState(false);
    const [lastResourcesUpdate, setLastResourcesUpdate] = useState(null);
    const [resourcesError, setResourcesError] = useState(null);
    const [error, setError] = useState(null);
    const [showMockData, setShowMockData] = useState(false);

    // Helper function to process API responses
    const processResponse = async (response, context) => {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.message || `Failed to fetch ${context}`);
            }
        } else {
            const text = await response.text();
            throw new Error(`Unexpected content-type for ${context}: ${contentType}`);
        }
    }

    const registrarNavegacion = useCallback(async (routerData, interfacesData, vlansData, ipAddressesData) => {
        if (!id_usuario) return;

        const fechaActual = new Date();
        const fecha = format(fechaActual, 'yyyy-MM-dd');
        const hora = format(fechaActual, 'HH:mm:ss');
        const pantalla = 'RouterDetailsScreen';

        const datos = JSON.stringify({
            routerId,
            router: routerData,
            interfaces: interfacesData,
            vlans: vlansData,
            ipAddresses: ipAddressesData
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
        } catch (error) {
            // Silent error logging for navigation tracking
            if (__DEV__) {
                console.error('Error al registrar la navegación:', error);
            }
        }
    }, [id_usuario, routerId]);

    // Debounced navigation logging
    const debouncedNavigationLog = useCallback(
        (() => {
            let timeoutId;
            return (routerData, interfacesData, vlansData, ipAddressesData) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    registrarNavegacion(routerData, interfacesData, vlansData, ipAddressesData);
                }, 1000);
            };
        })(),
        [registrarNavegacion]
    );

    // Helper functions for system resources
    const formatUptime = useCallback((uptime) => {
        if (!uptime) return 'N/A';
        const days = Math.floor(uptime / (24 * 3600));
        const hours = Math.floor((uptime % (24 * 3600)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }, []);

    const formatBytes = useCallback((bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }, []);

    const formatNumber = useCallback((number) => {
        if (!number && number !== 0) return 'N/A';
        return number.toLocaleString();
    }, []);

    // Helper functions for hardware sensors
    const getTemperatureStatus = useCallback((temp) => {
        if (!temp && temp !== 0) return { color: '#9CA3AF', level: 'N/A', icon: '❓' };
        if (temp <= 50) return { color: '#10B981', level: 'Óptimo', icon: '❄️' };
        if (temp <= 65) return { color: '#F59E0B', level: 'Normal', icon: '🌡️' };
        if (temp <= 70) return { color: '#F59E0B', level: 'Cálido', icon: '🔥' };
        return { color: '#EF4444', level: 'Crítico', icon: '🚨' };
    }, []);

    const getPowerStatus = useCallback((status) => {
        if (!status) return { color: '#9CA3AF', level: 'Desconocido', icon: '❓' };
        if (status.toLowerCase() === 'ok') return { color: '#10B981', level: 'Operativa', icon: '✅' };
        if (status.toLowerCase() === 'fail') return { color: '#EF4444', level: 'Falla', icon: '🔴' };
        return { color: '#F59E0B', level: 'Advertencia', icon: '⚠️' };
    }, []);

    const getFanStatus = useCallback((rpm) => {
        if (!rpm && rpm !== 0) return { color: '#9CA3AF', level: 'N/A', icon: '❓' };
        if (rpm === 0) return { color: '#EF4444', level: 'Detenido', icon: '🔴' };
        if (rpm < 1000) return { color: '#F59E0B', level: 'Lento', icon: '⚠️' };
        return { color: '#10B981', level: 'Normal', icon: '💨' };
    }, []);

    const getResourceStatus = useCallback((percentage) => {
        if (percentage < 50) return { color: '#10B981', level: 'Óptimo' };
        if (percentage < 75) return { color: '#F59E0B', level: 'Moderado' };
        return { color: '#EF4444', level: 'Alto' };
    }, []);

    const calculatePercentage = useCallback((used, total) => {
        if (!used || !total) return 0;
        return Math.round((used / total) * 100);
    }, []);

    useEffect(() => {
        if (!routerId) {
            setError('Router ID is required');
            return;
        }

        const fetchAllRouterData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Fetch router details, interfaces data, and system resources in parallel
                const [routerResponse, interfacesResponse, resourcesResponse] = await Promise.all([
                    fetch(`https://wellnet-rd.com:444/api/routers/${routerId}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    }),
                    fetch('https://wellnet-rd.com:444/api/routers/interfaces', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_router: routerId })
                    }),
                    fetch('https://wellnet-rd.com:444/api/routers/system-resources', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_router: routerId })
                    })
                ]);

                // Process router response
                const routerData = await processResponse(routerResponse, 'router details');
                setRouter(routerData);

                // Process interfaces response
                const interfacesData = await processResponse(interfacesResponse, 'router interfaces');
                setInterfaces(interfacesData.interfaces || []);
                
                // Optimize array manipulation with add buttons
                const vlansData = interfacesData.vlans || [];
                const ipAddressesData = interfacesData.ipAddresses || [];
                
                setVlans(vlansData);
                setIpAddresses(ipAddressesData);

                // Process system resources response
                try {
                    const resourcesData = await processResponse(resourcesResponse, 'system resources');
                    setSystemResources(resourcesData);
                    setResourcesError(null); // Clear any previous errors
                } catch (resourceError) {
                    // Resources are optional - don't fail if not available
                    setSystemResources(null);
                    
                    // Set a user-friendly error message
                    if (resourceError.message.includes('Unexpected content-type')) {
                        setResourcesError('Endpoint no implementado - Próximamente disponible');
                    } else {
                        setResourcesError('Datos no disponibles temporalmente');
                    }
                    
                    if (__DEV__) {
                        console.warn('System resources not available:', resourceError);
                    }
                }

                // Debounced navigation logging
                if (id_usuario) {
                    debouncedNavigationLog(routerData, interfacesData.interfaces, vlansData, ipAddressesData);
                }

            } catch (error) {
                const errorMessage = error.message || 'Error desconocido al cargar datos del router';
                setError(errorMessage);
                
                // Show user-friendly error alert
                Alert.alert(
                    'Error de Conexión',
                    errorMessage,
                    [
                        { text: 'Reintentar', onPress: () => fetchAllRouterData() },
                        { text: 'Cancelar', style: 'cancel' }
                    ]
                );
                
                if (__DEV__) {
                    console.error('Error fetching router data:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllRouterData();
    }, [routerId, id_usuario, debouncedNavigationLog]);

    // Real-time system resources polling
    useEffect(() => {
        let resourcesIntervalId;
        let isPollingActive = false;
        
        const updateSystemResources = async () => {
            if (!routerId || isUpdatingResources) return;
            
            setIsUpdatingResources(true);
            setResourcesError(null);
            
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/routers/system-resources', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_router: routerId })
                });
                
                const resourcesData = await processResponse(response, 'system resources');
                setSystemResources(resourcesData);
                setLastResourcesUpdate(new Date());
                setResourcesError(null);
                
                if (__DEV__) {
                    console.log('System resources updated:', resourcesData);
                }
            } catch (error) {
                // Set a user-friendly error message based on error type
                if (error.message.includes('Unexpected content-type')) {
                    setResourcesError('Endpoint no implementado - Próximamente disponible');
                } else if (error.message.includes('fetch')) {
                    setResourcesError('Error de conexión con el servidor');
                } else {
                    setResourcesError('Datos no disponibles temporalmente');
                }
                
                if (__DEV__) {
                    console.warn('Error updating system resources:', error);
                }
            } finally {
                setIsUpdatingResources(false);
            }
        };
        
        const startResourcesPolling = () => {
            if (isPollingActive) return; // Prevent multiple polling instances
            
            isPollingActive = true;
            updateSystemResources(); // Initial load
            
            // Only set up interval if this is not a "not implemented" error
            if (!resourcesError || !resourcesError.includes('no implementado')) {
                resourcesIntervalId = setInterval(() => {
                    if (isPollingActive) {
                        updateSystemResources();
                    }
                }, 30000); // Update every 30 seconds
            }
        };
        
        const stopResourcesPolling = () => {
            isPollingActive = false;
            if (resourcesIntervalId) {
                clearInterval(resourcesIntervalId);
                resourcesIntervalId = null;
            }
        };
        
        // Start/stop polling based on screen focus
        const focusListener = navigation.addListener('focus', () => {
            if (router) { // Only start if we have router data
                startResourcesPolling();
            }
        });
        
        const blurListener = navigation.addListener('blur', stopResourcesPolling);
        
        // Start polling if component is already focused and has router data
        if (router && navigation.isFocused()) {
            startResourcesPolling();
        }
        
        return () => {
            focusListener();
            blurListener();
            stopResourcesPolling();
        };
    }, [routerId, router, navigation, processResponse, isUpdatingResources]);

    const handleAddVlan = useCallback(() => {
        navigation.navigate('AddVlan', { routerId, id_usuario });
    }, [navigation, routerId, id_usuario]);

    const handleAddIpAddress = useCallback(() => {
        navigation.navigate('AddIpAddressScreen', { routerId, id_usuario });
    }, [navigation, routerId, id_usuario]);

    const handleIpAddressPress = useCallback((ipDetails) => {
        navigation.navigate('IpAddressDetailsScreen', { ipDetails, id_usuario, routerId });
    }, [navigation, id_usuario, routerId]);

    // Mock data for testing UI (remove in production)
    const generateMockData = useCallback(() => {
        const mockData = {
            board_name: "CCR2116-12G-4S+",
            serial_number: "HDK09XXXXXX",
            architecture: "arm64",
            version: "7.15",
            factory_software: "7.8",
            build_time: "29-may-2024 12:44:08",
            uptime: 12893992, // 149 days
            cpu_load: 7,
            cpu_count: 16,
            cpu_frequency: "2 GHz",
            total_memory: 17179869184, // 16 GiB
            free_memory: 16210263040,  // ~15 GiB
            total_hdd_space: 134217728, // 128 MiB
            free_hdd_space: 93323264,   // ~89 MiB
            bad_blocks: 0.1,
            write_sect_since_reboot: 590452886,
            write_sect_total: 590636422,
            sensors: {
                temperatures: {
                    cpu_temp: 55,
                    board_temp: 45,
                    switch_temp: 45,
                    sfp_temp: 43,
                    ambient_temp: 43
                },
                power_supplies: {
                    psu1_status: "ok",
                    psu2_status: "fail"
                },
                fans: {
                    fan1_speed: 0,
                    fan2_speed: 0,
                    fan3_speed: 0,
                    fan4_speed: 0
                }
            }
        };

        setSystemResources(mockData);
        setResourcesError(null);
        setLastResourcesUpdate(new Date());
        setShowMockData(true);
        
        if (__DEV__) {
            console.log('Mock data loaded for UI testing');
        }
    }, []);

    const clearMockData = useCallback(() => {
        setSystemResources(null);
        setShowMockData(false);
        setResourcesError('Endpoint no implementado - Próximamente disponible');
    }, []);

    const renderInterfaceItem = useCallback(({ item }) => (
        <View style={[styles.card, styles.interfaceCard]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🔌</Text>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.name || 'Interface'}</Text>
                    <Text style={styles.cardSubtitle}>Interfaz de Red</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.cardDetailRow}>
                    <Text style={styles.cardDetailLabel}>MTU</Text>
                    <Text style={styles.cardDetailValue}>{item.mtu || 'N/A'}</Text>
                </View>
                <View style={styles.cardDetailRow}>
                    <Text style={styles.cardDetailLabel}>MAC Address</Text>
                    <Text style={styles.cardDetailValue}>{item['mac-address'] || 'No asignada'}</Text>
                </View>
                <View style={styles.cardDetailRow}>
                    <Text style={styles.cardDetailLabel}>ARP</Text>
                    <Text style={styles.cardDetailValue}>{item.arp || 'Deshabilitado'}</Text>
                </View>
                <View style={styles.cardDetailRow}>
                    <Text style={styles.cardDetailLabel}>Switch Info</Text>
                    <Text style={styles.cardDetailValue}>{item.switch || 'N/A'}</Text>
                </View>
            </View>
        </View>
    ), [styles]);

    const renderVlanItem = useCallback(({ item }) => {
        if (item.isAddButton) {
            return (
                <TouchableOpacity style={styles.addCard} onPress={handleAddVlan}>
                    <Text style={styles.addCardIcon}>➕</Text>
                    <Text style={styles.addCardText}>Agregar VLAN</Text>
                </TouchableOpacity>
            );
        }
        return (
            <View style={[styles.card, styles.vlanCard]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>🏷️</Text>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{item.name || 'VLAN'}</Text>
                        <Text style={styles.cardSubtitle}>ID: {item.vlan_id}</Text>
                    </View>
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>VLAN ID</Text>
                        <Text style={styles.cardDetailValue}>{item.vlan_id || 'No asignado'}</Text>
                    </View>
                    <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>MTU</Text>
                        <Text style={styles.cardDetailValue}>{item.mtu || 'N/A'}</Text>
                    </View>
                    <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>ARP</Text>
                        <Text style={styles.cardDetailValue}>{item.arp || 'Deshabilitado'}</Text>
                    </View>
                    <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>Interface</Text>
                        <Text style={styles.cardDetailValue}>{item.interface || 'No asignada'}</Text>
                    </View>
                    {item.comment && (
                        <View style={styles.cardDetailRow}>
                            <Text style={styles.cardDetailLabel}>Comentario</Text>
                            <Text style={styles.cardDetailValue}>{item.comment}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }, [styles, handleAddVlan]);

    const renderIpAddressItem = useCallback(({ item }) => {
        if (item.isAddButton) {
            return (
                <TouchableOpacity style={styles.addCard} onPress={handleAddIpAddress}>
                    <Text style={styles.addCardIcon}>➕</Text>
                    <Text style={styles.addCardText}>Agregar IP</Text>
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity 
                style={[styles.card, styles.ipCard]} 
                onPress={() => handleIpAddressPress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>🌐</Text>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{item.address || 'Dirección IP'}</Text>
                        <Text style={styles.cardSubtitle}>Dirección de Red</Text>
                    </View>
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>Dirección</Text>
                        <Text style={styles.cardDetailValue}>{item.address || 'No asignada'}</Text>
                    </View>
                    <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>Red</Text>
                        <Text style={styles.cardDetailValue}>{item.network || 'No especificada'}</Text>
                    </View>
                    <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>Interfaz</Text>
                        <Text style={styles.cardDetailValue}>{item.interface || 'No asignada'}</Text>
                    </View>
                    {item.comment && (
                        <View style={styles.cardDetailRow}>
                            <Text style={styles.cardDetailLabel}>Comentario</Text>
                            <Text style={styles.cardDetailValue}>{item.comment}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    }, [styles, handleAddIpAddress, handleIpAddressPress]);

    const getRouterStatus = useMemo(() => {
        if (!router) return null;
        
        if (router?.ip_publica && router?.nombre_router) {
            return {
                badge: styles.statusActive,
                text: styles.statusTextActive,
                label: '🟢 En Línea'
            };
        } else {
            return {
                badge: styles.statusInactive,
                text: styles.statusTextInactive,
                label: '🔴 Fuera de Línea'
            };
        }
    }, [router, styles]);

    const renderLoadingState = useMemo(() => {
        if (!isLoading) return null;
        
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando detalles del router...</Text>
                    <Text style={styles.loadingSubtext}>Obteniendo configuración de red</Text>
                </View>
            </View>
        );
    }, [isLoading, styles]);

    const renderEmptyState = useMemo(() => {
        if (router || isLoading) return null;
        
        return (
            <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>🌐</Text>
                <Text style={styles.emptyStateTitle}>Router no encontrado</Text>
                <Text style={styles.emptyStateMessage}>
                    {error || 'No se pudieron cargar los detalles del router. Verifica la conexión e intenta nuevamente.'}
                </Text>
            </View>
        );
    }, [router, isLoading, error, styles]);

    // System Resources Component
    const renderSystemResources = useMemo(() => {
        if (__DEV__) {
            console.log('System Resources Data:', systemResources);
        }
        
        if (!systemResources) {
            // Fallback placeholder when no system resources data
            return (
                <View style={styles.systemResourcesCard}>
                    <View style={styles.systemResourcesHeader}>
                        <Text style={styles.systemResourcesIcon}>⚡</Text>
                        <Text style={styles.systemResourcesTitle}>Recursos del Sistema</Text>
                        {isUpdatingResources && (
                            <View style={styles.updatingIndicator}>
                                <ActivityIndicator size="small" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                                <Text style={styles.updatingText}>Actualizando...</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.resourceSection}>
                        <Text style={styles.resourceSectionTitle}>📋 Estado del Sistema</Text>
                        
                        {resourcesError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>
                                    {resourcesError.includes('no implementado') ? '🚧' : '⚠️'} {resourcesError}
                                </Text>
                                {resourcesError.includes('no implementado') ? (
                                    <Text style={[styles.metricSubtext, { textAlign: 'center', marginTop: 8 }]}>
                                        El backend está desarrollando esta funcionalidad.
                                        El frontend ya está listo para recibir los datos.
                                    </Text>
                                ) : (
                                    <Text style={[styles.metricSubtext, { textAlign: 'center', marginTop: 8 }]}>
                                        Reintentando automáticamente cada 30 segundos
                                    </Text>
                                )}
                            </View>
                        ) : (
                            <View style={styles.resourceItem}>
                                <Text style={styles.resourceLabel}>Estado</Text>
                                <Text style={styles.resourceValue}>🔄 Esperando datos...</Text>
                            </View>
                        )}
                        
                        {lastResourcesUpdate && (
                            <Text style={[styles.metricSubtext, { textAlign: 'center', marginTop: 8 }]}>
                                Última actualización exitosa: {format(lastResourcesUpdate, 'HH:mm:ss')}
                            </Text>
                        )}
                        
                        {!resourcesError && (
                            <Text style={[styles.metricSubtext, { textAlign: 'center', marginTop: 12 }]}>
                                📊 Una vez implementado el endpoint, aquí se mostrarán:
                                • CPU, Memoria y Almacenamiento
                                • Temperaturas de hardware
                                • Estado de fuentes de poder
                                • Velocidad de ventiladores
                            </Text>
                        )}
                    </View>
                </View>
            );
        }

        const memoryUsed = systemResources.total_memory - systemResources.free_memory;
        const memoryPercentage = calculatePercentage(memoryUsed, systemResources.total_memory);
        const storageUsed = systemResources.total_hdd_space - systemResources.free_hdd_space;
        const storagePercentage = calculatePercentage(storageUsed, systemResources.total_hdd_space);
        const cpuStatus = getResourceStatus(systemResources.cpu_load || 0);
        const memoryStatus = getResourceStatus(memoryPercentage);
        const storageStatus = getResourceStatus(storagePercentage);

        return (
            <View style={styles.systemResourcesCard}>
                <View style={styles.systemResourcesHeader}>
                    <Text style={styles.systemResourcesIcon}>⚡</Text>
                    <Text style={styles.systemResourcesTitle}>Recursos del Sistema</Text>
                    {isUpdatingResources && (
                        <View style={styles.updatingIndicator}>
                            <ActivityIndicator size="small" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                            <Text style={styles.updatingText}>Actualizando...</Text>
                        </View>
                    )}
                    {__DEV__ && showMockData && (
                        <View style={[styles.updatingIndicator, { backgroundColor: isDarkMode ? '#1D4ED8' : '#3B82F6' }]}>
                            <Text style={[styles.updatingText, { color: '#FFFFFF' }]}>DEMO</Text>
                        </View>
                    )}
                </View>

                {/* System Identification */}
                <View style={styles.resourceSection}>
                    <Text style={styles.resourceSectionTitle}>📋 Identificación del Equipo</Text>
                    <View style={styles.resourceGrid}>
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>Modelo</Text>
                            <Text style={styles.resourceValue}>{systemResources.board_name || 'N/A'}</Text>
                        </View>
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>Arquitectura</Text>
                            <Text style={styles.resourceValue}>{systemResources.architecture || 'N/A'}</Text>
                        </View>
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>RouterOS</Text>
                            <Text style={styles.resourceValue}>{systemResources.version || 'N/A'}</Text>
                        </View>
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>Software de Fábrica</Text>
                            <Text style={styles.resourceValue}>{systemResources.factory_software || 'N/A'}</Text>
                        </View>
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>Fecha de Compilación</Text>
                            <Text style={styles.resourceValue}>{systemResources.build_time || 'N/A'}</Text>
                        </View>
                        <View style={styles.resourceItem}>
                            <Text style={styles.resourceLabel}>Tiempo Online</Text>
                            <Text style={styles.resourceValue}>{formatUptime(systemResources.uptime)}</Text>
                        </View>
                    </View>
                </View>

                {/* Performance Metrics */}
                <View style={styles.resourceSection}>
                    <Text style={styles.resourceSectionTitle}>📊 Métricas de Rendimiento</Text>
                    
                    {/* CPU Usage */}
                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricTitle}>CPU</Text>
                            <View style={[styles.statusBadge, { backgroundColor: cpuStatus.color }]}>
                                <Text style={styles.statusText}>{cpuStatus.level}</Text>
                            </View>
                        </View>
                        <View style={styles.metricContent}>
                            <Text style={styles.metricValue}>{systemResources.cpu_load || 0}%</Text>
                            <Text style={styles.metricSubtext}>
                                {systemResources.cpu_count ? `${systemResources.cpu_count} núcleos` : 'Carga promedio'}
                                {systemResources.cpu_frequency ? ` @ ${systemResources.cpu_frequency}` : ''}
                            </Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View 
                                style={[
                                    styles.progressFill, 
                                    { 
                                        width: `${systemResources.cpu_load || 0}%`,
                                        backgroundColor: cpuStatus.color 
                                    }
                                ]} 
                            />
                        </View>
                    </View>

                    {/* Memory Usage */}
                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricTitle}>Memoria RAM</Text>
                            <View style={[styles.statusBadge, { backgroundColor: memoryStatus.color }]}>
                                <Text style={styles.statusText}>{memoryStatus.level}</Text>
                            </View>
                        </View>
                        <View style={styles.metricContent}>
                            <Text style={styles.metricValue}>{memoryPercentage}%</Text>
                            <Text style={styles.metricSubtext}>
                                {formatBytes(memoryUsed)} / {formatBytes(systemResources.total_memory)}
                            </Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View 
                                style={[
                                    styles.progressFill, 
                                    { 
                                        width: `${memoryPercentage}%`,
                                        backgroundColor: memoryStatus.color 
                                    }
                                ]} 
                            />
                        </View>
                    </View>

                    {/* Storage Usage */}
                    <View style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <Text style={styles.metricTitle}>Almacenamiento</Text>
                            <View style={[styles.statusBadge, { backgroundColor: storageStatus.color }]}>
                                <Text style={styles.statusText}>{storageStatus.level}</Text>
                            </View>
                        </View>
                        <View style={styles.metricContent}>
                            <Text style={styles.metricValue}>{storagePercentage}%</Text>
                            <Text style={styles.metricSubtext}>
                                {formatBytes(storageUsed)} / {formatBytes(systemResources.total_hdd_space)}
                            </Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View 
                                style={[
                                    styles.progressFill, 
                                    { 
                                        width: `${storagePercentage}%`,
                                        backgroundColor: storageStatus.color 
                                    }
                                ]} 
                            />
                        </View>
                    </View>
                </View>

                {/* Additional Info */}
                {(systemResources.bad_blocks !== undefined || systemResources.write_sect_since_reboot) && (
                    <View style={styles.resourceSection}>
                        <Text style={styles.resourceSectionTitle}>🔧 Información Adicional</Text>
                        <View style={styles.resourceGrid}>
                            {systemResources.bad_blocks !== undefined && (
                                <View style={styles.resourceItem}>
                                    <Text style={styles.resourceLabel}>Bloques Defectuosos</Text>
                                    <Text style={[
                                        styles.resourceValue,
                                        { color: systemResources.bad_blocks > 0.5 ? '#EF4444' : systemResources.bad_blocks > 0 ? '#F59E0B' : '#10B981' }
                                    ]}>
                                        {systemResources.bad_blocks}% {systemResources.bad_blocks === 0 ? '✅' : systemResources.bad_blocks <= 0.5 ? '⚠️' : '🔴'}
                                    </Text>
                                </View>
                            )}
                            {systemResources.write_sect_since_reboot && (
                                <View style={styles.resourceItem}>
                                    <Text style={styles.resourceLabel}>Escrituras desde reinicio</Text>
                                    <Text style={styles.resourceValue}>
                                        {formatNumber(systemResources.write_sect_since_reboot)} sectores
                                    </Text>
                                </View>
                            )}
                            {systemResources.write_sect_total && (
                                <View style={styles.resourceItem}>
                                    <Text style={styles.resourceLabel}>Escrituras totales</Text>
                                    <Text style={styles.resourceValue}>
                                        {formatNumber(systemResources.write_sect_total)} sectores
                                    </Text>
                                </View>
                            )}
                            {systemResources.serial_number && (
                                <View style={styles.resourceItem}>
                                    <Text style={styles.resourceLabel}>Número de Serie</Text>
                                    <Text style={styles.resourceValue}>{systemResources.serial_number}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Hardware Sensors */}
                <View style={styles.resourceSection}>
                    <Text style={styles.resourceSectionTitle}>🌡️ Sensores de Hardware</Text>
                    
                    {(systemResources.sensors || systemResources.temperature || systemResources.psu_status || systemResources.fan_speed) ? (
                        <View>
                            {/* Temperature Sensors */}
                            {systemResources.sensors?.temperatures && (
                            <View style={styles.metricCard}>
                                <View style={styles.metricHeader}>
                                    <Text style={styles.metricTitle}>Temperaturas</Text>
                                </View>
                                <View style={styles.resourceGrid}>
                                    {systemResources.sensors.temperatures.cpu_temp !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>CPU {getTemperatureStatus(systemResources.sensors.temperatures.cpu_temp).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getTemperatureStatus(systemResources.sensors.temperatures.cpu_temp).color }
                                            ]}>
                                                {systemResources.sensors.temperatures.cpu_temp}°C
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.temperatures.board_temp !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Placa {getTemperatureStatus(systemResources.sensors.temperatures.board_temp).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getTemperatureStatus(systemResources.sensors.temperatures.board_temp).color }
                                            ]}>
                                                {systemResources.sensors.temperatures.board_temp}°C
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.temperatures.switch_temp !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Switch {getTemperatureStatus(systemResources.sensors.temperatures.switch_temp).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getTemperatureStatus(systemResources.sensors.temperatures.switch_temp).color }
                                            ]}>
                                                {systemResources.sensors.temperatures.switch_temp}°C
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.temperatures.sfp_temp !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>SFP {getTemperatureStatus(systemResources.sensors.temperatures.sfp_temp).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getTemperatureStatus(systemResources.sensors.temperatures.sfp_temp).color }
                                            ]}>
                                                {systemResources.sensors.temperatures.sfp_temp}°C
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.temperatures.ambient_temp !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Ambiente {getTemperatureStatus(systemResources.sensors.temperatures.ambient_temp).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getTemperatureStatus(systemResources.sensors.temperatures.ambient_temp).color }
                                            ]}>
                                                {systemResources.sensors.temperatures.ambient_temp}°C
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.metricSubtext, { marginTop: 12 }]}>
                                    ✅ Óptimo (hasta 50°C)  🌡️ Normal (51-65°C)  🔥 Cálido (66-70°C)  🚨 Crítico (+70°C)
                                </Text>
                            </View>
                        )}

                        {/* Power Supply Status */}
                        {systemResources.sensors?.power_supplies && (
                            <View style={styles.metricCard}>
                                <View style={styles.metricHeader}>
                                    <Text style={styles.metricTitle}>Fuentes de Poder</Text>
                                </View>
                                <View style={styles.resourceGrid}>
                                    {systemResources.sensors.power_supplies.psu1_status && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>PSU 1 {getPowerStatus(systemResources.sensors.power_supplies.psu1_status).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getPowerStatus(systemResources.sensors.power_supplies.psu1_status).color }
                                            ]}>
                                                {getPowerStatus(systemResources.sensors.power_supplies.psu1_status).level}
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.power_supplies.psu2_status && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>PSU 2 {getPowerStatus(systemResources.sensors.power_supplies.psu2_status).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getPowerStatus(systemResources.sensors.power_supplies.psu2_status).color }
                                            ]}>
                                                {getPowerStatus(systemResources.sensors.power_supplies.psu2_status).level}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.metricSubtext, { marginTop: 12 }]}>
                                    ✅ Operativa  🔴 Falla  ⚠️ Advertencia
                                </Text>
                            </View>
                        )}

                        {/* Fan Status */}
                        {systemResources.sensors?.fans && (
                            <View style={styles.metricCard}>
                                <View style={styles.metricHeader}>
                                    <Text style={styles.metricTitle}>Ventiladores</Text>
                                </View>
                                <View style={styles.resourceGrid}>
                                    {systemResources.sensors.fans.fan1_speed !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Fan 1 {getFanStatus(systemResources.sensors.fans.fan1_speed).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getFanStatus(systemResources.sensors.fans.fan1_speed).color }
                                            ]}>
                                                {systemResources.sensors.fans.fan1_speed} RPM
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.fans.fan2_speed !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Fan 2 {getFanStatus(systemResources.sensors.fans.fan2_speed).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getFanStatus(systemResources.sensors.fans.fan2_speed).color }
                                            ]}>
                                                {systemResources.sensors.fans.fan2_speed} RPM
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.fans.fan3_speed !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Fan 3 {getFanStatus(systemResources.sensors.fans.fan3_speed).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getFanStatus(systemResources.sensors.fans.fan3_speed).color }
                                            ]}>
                                                {systemResources.sensors.fans.fan3_speed} RPM
                                            </Text>
                                        </View>
                                    )}
                                    {systemResources.sensors.fans.fan4_speed !== undefined && (
                                        <View style={styles.resourceItem}>
                                            <Text style={styles.resourceLabel}>Fan 4 {getFanStatus(systemResources.sensors.fans.fan4_speed).icon}</Text>
                                            <Text style={[
                                                styles.resourceValue,
                                                { color: getFanStatus(systemResources.sensors.fans.fan4_speed).color }
                                            ]}>
                                                {systemResources.sensors.fans.fan4_speed} RPM
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.metricSubtext, { marginTop: 12 }]}>
                                    💨 Normal (+1000 RPM)  ⚠️ Lento (-1000 RPM)  🔴 Detenido (0 RPM)
                                </Text>
                            </View>
                        )}
                    ) : (
                        <View style={styles.metricCard}>
                            <View style={styles.metricHeader}>
                                <Text style={styles.metricTitle}>Estado de Sensores</Text>
                            </View>
                            <View style={styles.resourceItem}>
                                <Text style={styles.resourceLabel}>Estado</Text>
                                <Text style={styles.resourceValue}>
                                    {showMockData ? '🚧 Datos mock cargados' : '🔄 Esperando datos del endpoint...'}
                                </Text>
                            </View>
                            <Text style={[styles.metricSubtext, { textAlign: 'center', marginTop: 12 }]}>
                                🌡️ Una vez implementado el endpoint, aquí se mostrarán:
                                • Temperaturas de hardware (CPU, placa, switch, SFP)
                                • Estado de fuentes de poder (PSU 1 y PSU 2)
                                • Velocidad de ventiladores (4 ventiladores)
                            </Text>
                        </View>
                    )}

                    {/* Last Update Timestamp */}
                    {lastResourcesUpdate && (
                        <View style={styles.resourceSection}>
                            <Text style={[styles.metricSubtext, { textAlign: 'center', opacity: 0.7 }]}>
                                Última actualización: {format(lastResourcesUpdate, 'HH:mm:ss')} • 
                                Próxima actualización en 30 segundos
                            </Text>
                        </View>
                    )}
                </View>
            ) : null}
        );
    }, [systemResources, calculatePercentage, getResourceStatus, formatUptime, formatBytes, formatNumber, getTemperatureStatus, getPowerStatus, getFanStatus, styles, lastResourcesUpdate, resourcesError, isUpdatingResources, showMockData, isDarkMode]);

    const renderSectionHeader = useCallback((title, count) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionCount}>{count}</Text>
        </View>
    ), [styles]);

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
                            <Text style={styles.headerTitle}>Detalles del Router</Text>
                            <Text style={styles.headerSubtitle}>
                                {router?.nombre_router || 'Cargando...'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        {__DEV__ && (
                            <>
                                {!showMockData ? (
                                    <TouchableOpacity 
                                        style={[styles.statusBadge, { backgroundColor: '#3B82F6' }]}
                                        onPress={generateMockData}
                                    >
                                        <Text style={[styles.statusText, { fontSize: 10 }]}>DEMO</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity 
                                        style={[styles.statusBadge, { backgroundColor: '#EF4444' }]}
                                        onPress={clearMockData}
                                    >
                                        <Text style={[styles.statusText, { fontSize: 10 }]}>CLEAR</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                        {getRouterStatus && (
                            <View style={[styles.statusBadge, getRouterStatus.badge]}>
                                <Text style={getRouterStatus.text}>
                                    {getRouterStatus.label}
                                </Text>
                            </View>
                        )}
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {renderLoadingState}
                {renderEmptyState}
                
                {!isLoading && router && (
                    <ScrollView 
                        style={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Router Info Card */}
                        <View style={styles.routerInfoCard}>
                            <View style={styles.routerInfoHeader}>
                                <Text style={styles.routerIcon}>🌐</Text>
                                <View style={styles.routerMainInfo}>
                                    <Text style={styles.routerName}>
                                        {router.nombre_router || 'Router Sin Nombre'}
                                    </Text>
                                    <Text style={styles.routerId}>ID: {router.id_router}</Text>
                                </View>
                                {getRouterStatus && (
                                    <View style={[styles.routerStatusIndicator, getRouterStatus.badge]}>
                                        <Text style={getRouterStatus.text}>
                                            {getRouterStatus.label}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            
                            <View style={styles.routerDetailsGrid}>
                                <View style={styles.routerDetailRow}>
                                    <Text style={styles.routerDetailLabel}>Usuario del Router</Text>
                                    <Text style={styles.routerDetailValue}>
                                        {router.router_username || 'No configurado'}
                                    </Text>
                                </View>
                                <View style={styles.routerDetailRow}>
                                    <Text style={styles.routerDetailLabel}>IP Pública</Text>
                                    <Text style={styles.routerDetailValue}>
                                        {router.ip_publica || 'No asignada'}
                                    </Text>
                                </View>
                                <View style={styles.routerDetailRow}>
                                    <Text style={styles.routerDetailLabel}>IP WAN</Text>
                                    <Text style={styles.routerDetailValue}>
                                        {router.ip_wan || 'No configurada'}
                                    </Text>
                                </View>
                                <View style={styles.routerDetailRow}>
                                    <Text style={styles.routerDetailLabel}>IP LAN</Text>
                                    <Text style={styles.routerDetailValue}>
                                        {router.ip_lan || 'No configurada'}
                                    </Text>
                                </View>
                                {router.descripcion && (
                                    <View style={styles.routerDetailRow}>
                                        <Text style={styles.routerDetailLabel}>Descripción</Text>
                                        <Text style={styles.routerDetailValue}>{router.descripcion}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* System Resources Section */}
                        {renderSystemResources}

                        {/* Interfaces Section */}
                        {renderSectionHeader('Interfaces', interfaces.length)}
                        <FlatList
                            data={interfaces}
                            renderItem={renderInterfaceItem}
                            keyExtractor={(item, index) => item.name || `interface-${index}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            style={styles.cardContainer}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={3}
                            windowSize={5}
                        />

                        {/* VLANs Section */}
                        {renderSectionHeader('VLANs', vlans.length)}
                        <FlatList
                            data={[...vlans, { isAddButton: true }]}
                            renderItem={renderVlanItem}
                            keyExtractor={(item, index) => item.vlan_id?.toString() || `vlan-${index}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            style={styles.cardContainer}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={3}
                            windowSize={5}
                        />

                        {/* IP Addresses Section */}
                        {renderSectionHeader('Direcciones IP', ipAddresses.length)}
                        <FlatList
                            data={[...ipAddresses, { isAddButton: true }]}
                            renderItem={renderIpAddressItem}
                            keyExtractor={(item, index) => item.address || `ip-${index}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            style={styles.cardContainer}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={3}
                            windowSize={5}
                        />

                        <View style={styles.spacer} />
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

export default RouterDetailsScreen;
