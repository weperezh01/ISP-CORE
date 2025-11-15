import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './OLTDetailsScreenStyles';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';
import { format } from 'date-fns';

const OLTDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { oltId, id_usuario } = route.params || {};
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    // State variables
    const [olt, setOlt] = useState(null);
    const [onusStats, setOnusStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [usuarioId, setUsuarioId] = useState(id_usuario || null);
    const [authToken, setAuthToken] = useState(null);
    const [isCached, setIsCached] = useState(false);

    // Helper function to process API responses
    const processResponse = useCallback(async (response, context) => {
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
    }, []);

    // Navigation logging function
    const registrarNavegacion = useCallback(async (oltData, onusData) => {
        if (!usuarioId) return;

        const fechaActual = new Date();
        const fecha = format(fechaActual, 'yyyy-MM-dd');
        const hora = format(fechaActual, 'HH:mm:ss');
        const pantalla = 'OLTDetailsScreen';

        const datos = JSON.stringify({
            olt: oltData,
            onus: onusData,
            oltId
        });

        const navigationLogData = {
            id_usuario: usuarioId,
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
    }, [usuarioId, oltId]);

    // Get user data from storage
    const obtenerDatosUsuario = useCallback(async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            if (jsonValue != null) {
                const userData = JSON.parse(jsonValue);
                setUsuarioId(userData.id);
                setAuthToken(userData.token);
            }
        } catch (e) {
            console.error('Error al leer el nombre del usuario', e);
        }
    }, []);

    // Fetch OLT details (realtime)
    const fetchOltDetails = useCallback(async (forceRefresh = false) => {
        console.log('🔍 [OLT Details] Fetching OLT details for ID:', oltId, 'Force refresh:', forceRefresh);

        if (!oltId) {
            setError('ID de OLT no proporcionado');
            setIsLoading(false);
            return;
        }

        if (!authToken) {
            console.log('⚠️ [OLT Details] No auth token available yet');
            return;
        }

        try {
            if (forceRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            // Use realtime endpoint
            const response = await fetch(`https://wellnet-rd.com:444/api/olts/realtime/detalles/${oltId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await processResponse(response, 'OLT details');

            console.log('✅ [OLT Details] Realtime data received:', data);

            // Handle response structure from realtime API
            let oltData = null;
            if (data && data.success && data.data && data.data.olt) {
                oltData = data.data.olt;
                setIsCached(data.cached || false);
            } else if (data && data.data && data.data.olt) {
                oltData = data.data.olt;
            } else if (data && data.olt) {
                oltData = data.olt;
            } else if (data) {
                oltData = data;
            }

            setOlt(oltData);
            setLastUpdate(new Date());

            // Register navigation
            await registrarNavegacion(oltData, null);

        } catch (error) {
            console.error('❌ [OLT Details] Error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [oltId, authToken, processResponse, registrarNavegacion]);

    // Fetch ONUs statistics (realtime)
    const fetchOnusStats = useCallback(async () => {
        if (!oltId) return;

        if (!authToken) {
            console.log('⚠️ [OLT Details] No auth token for stats');
            return;
        }

        try {
            // Use realtime endpoint
            const response = await fetch(`https://wellnet-rd.com:444/api/olts/realtime/${oltId}/onus/estadisticas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await processResponse(response, 'ONUs statistics');

            console.log('✅ [OLT Details] Realtime stats received:', data);

            // Handle response structure from realtime API
            let statsData = null;
            if (data && data.success && data.data && data.data.estadisticas) {
                statsData = data.data.estadisticas;
            } else if (data && data.data && data.data.estadisticas) {
                statsData = data.data.estadisticas;
            } else if (data && data.estadisticas) {
                statsData = data.estadisticas;
            } else if (data) {
                statsData = data;
            }

            setOnusStats(statsData);

        } catch (error) {
            console.error('❌ [OLT Details] Error fetching ONUs stats:', error);
            // Don't show error for stats, it's optional
        }
    }, [oltId, authToken, processResponse]);

    // Load all data
    const loadData = useCallback(async () => {
        await obtenerDatosUsuario();
        await fetchOltDetails();
        await fetchOnusStats();
    }, [obtenerDatosUsuario, fetchOltDetails, fetchOnusStats]);

    // Handle manual refresh (force update from OLT)
    const handleRefresh = useCallback(async () => {
        await fetchOltDetails(true);
        await fetchOnusStats();
    }, [fetchOltDetails, fetchOnusStats]);

    // Initial load and focus refresh
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    // Navigate to ONUs list
    const handleViewOnus = (status = null) => {
        navigation.navigate('ONUsListScreen', {
            oltId: oltId,
            oltName: olt?.nombre_olt || 'OLT',
            id_usuario: usuarioId,
            filter: status // 'authorized', 'pending', 'offline', etc.
        });
    };

    // Get status info for display
    const getStatusInfo = (status) => {
        const statusStr = String(status || '').toLowerCase();
        switch (statusStr) {
            case 'activa':
            case 'online':
            case 'active':
                return {
                    badge: styles.statusActive,
                    text: styles.statusTextActive,
                    label: '🟢 Activa'
                };
            case 'inactiva':
            case 'offline':
            case 'inactive':
                return {
                    badge: styles.statusInactive,
                    text: styles.statusTextInactive,
                    label: '🔴 Inactiva'
                };
            case 'mantenimiento':
            case 'maintenance':
                return {
                    badge: styles.statusMaintenance,
                    text: styles.statusTextMaintenance,
                    label: '🟡 Mantenimiento'
                };
            default:
                return {
                    badge: styles.statusPending,
                    text: styles.statusTextPending,
                    label: '⚪ Desconocido'
                };
        }
    };

    // Render loading state
    const renderLoadingState = () => {
        if (!isLoading) return null;

        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingText}>Cargando detalles de OLT...</Text>
            </View>
        );
    };

    // Render error state
    const renderErrorState = () => {
        if (!error) return null;

        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Error al cargar OLT</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Render OLT info card
    const renderOltInfo = () => {
        if (!olt) return null;

        const statusInfo = getStatusInfo(olt.estado);

        return (
            <View style={styles.oltCard}>
                <View style={styles.oltHeader}>
                    <View style={styles.oltMainInfo}>
                        <Text style={styles.oltIcon}>📡</Text>
                        <View style={styles.oltTitleContainer}>
                            <Text style={styles.oltName}>{String(olt.nombre_olt || 'OLT Sin Nombre')}</Text>
                            <Text style={styles.oltModel}>{String(olt.modelo || 'Modelo no especificado')}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, statusInfo.badge]}>
                        <Text style={statusInfo.text}>{statusInfo.label}</Text>
                    </View>
                </View>

                <View style={styles.oltDetailsSection}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>IP de Gestión</Text>
                        <Text style={styles.detailValue}>{String(olt.ip_olt || 'No asignada')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Ubicación</Text>
                        <Text style={styles.detailValue}>{String(olt.ubicacion || 'No especificada')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Puerto de Gestión</Text>
                        <Text style={styles.detailValue}>{String(olt.puerto_gestion || 'No configurado')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Protocolo</Text>
                        <Text style={styles.detailValue}>{String(olt.protocolo_gestion || 'No especificado')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Usuario</Text>
                        <Text style={styles.detailValue}>{String(olt.olt_username || 'No configurado')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Fecha Instalación</Text>
                        <Text style={styles.detailValue}>
                            {olt.fecha_instalacion
                                ? format(new Date(olt.fecha_instalacion), 'dd/MM/yyyy')
                                : 'No registrada'
                            }
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // Render capacity stats
    const renderCapacityStats = () => {
        if (!olt) return null;

        const ocupacion = parseFloat(olt.porcentaje_ocupacion || 0);
        const capacidadTotal = parseInt(olt.capacidad_puertos || 0, 10);
        const puestosOcupados = parseInt(olt.puertos_ocupados || 0, 10);
        const puestosDisponibles = capacidadTotal - puestosOcupados;

        return (
            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>📊 Estadísticas de Puertos</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{String(capacidadTotal)}</Text>
                        <Text style={styles.statLabel}>Capacidad Total</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, styles.statValueActive]}>{String(puestosOcupados)}</Text>
                        <Text style={styles.statLabel}>Puertos Ocupados</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, styles.statValueAvailable]}>{String(puestosDisponibles)}</Text>
                        <Text style={styles.statLabel}>Disponibles</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, styles.statValuePercentage]}>{ocupacion.toFixed(1)}%</Text>
                        <Text style={styles.statLabel}>Ocupación</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, ocupacion))}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{ocupacion.toFixed(1)}% ocupado</Text>
                </View>
            </View>
        );
    };

    // Render ONUs management section
    const renderOnusManagement = () => {
        return (
            <View style={styles.managementCard}>
                <Text style={styles.managementTitle}>🔗 Gestión de ONUs</Text>
                <Text style={styles.managementSubtitle}>Administra las unidades ópticas de red conectadas</Text>

                <View style={styles.onuButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.onuButton, styles.onuButtonAll]}
                        onPress={() => handleViewOnus()}
                    >
                        <Text style={styles.onuButtonIcon}>📋</Text>
                        <Text style={styles.onuButtonText}>Todas las ONUs</Text>
                        {onusStats?.total != null && (
                            <Text style={styles.onuButtonCount}>{String(onusStats.total)}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.onuButton, styles.onuButtonAuthorized]}
                        onPress={() => handleViewOnus('authorized')}
                    >
                        <Text style={styles.onuButtonIcon}>✅</Text>
                        <Text style={styles.onuButtonText}>Autorizadas</Text>
                        {onusStats?.authorized != null && (
                            <Text style={styles.onuButtonCount}>{String(onusStats.authorized)}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.onuButton, styles.onuButtonPending]}
                        onPress={() => handleViewOnus('pending')}
                    >
                        <Text style={styles.onuButtonIcon}>⏳</Text>
                        <Text style={styles.onuButtonText}>En Espera</Text>
                        {onusStats?.pending != null && (
                            <Text style={styles.onuButtonCount}>{String(onusStats.pending)}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.onuButton, styles.onuButtonOffline]}
                        onPress={() => handleViewOnus('offline')}
                    >
                        <Text style={styles.onuButtonIcon}>🔴</Text>
                        <Text style={styles.onuButtonText}>Desconectadas</Text>
                        {onusStats?.offline != null && (
                            <Text style={styles.onuButtonCount}>{String(onusStats.offline)}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backButtonText}>← Volver</Text>
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Detalles de OLT</Text>
                            <Text style={styles.headerSubtitle}>
                                {String(olt?.nombre_olt || 'Cargando...')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <Text style={styles.refreshButtonText}>
                                {isRefreshing ? '⟳' : '🔄'}
                            </Text>
                        </TouchableOpacity>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.contentContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderLoadingState()}
                {renderErrorState()}

                {!isLoading && !error && olt && (
                    <>
                        {renderOltInfo()}
                        {renderCapacityStats()}
                        {renderOnusManagement()}
                    </>
                )}

                {lastUpdate && (
                    <View style={styles.lastUpdateContainer}>
                        <Text style={styles.lastUpdateText}>
                            Última actualización: {format(lastUpdate, 'dd/MM/yyyy HH:mm:ss')}
                        </Text>
                        {isCached && (
                            <Text style={styles.cacheIndicator}>
                                📦 Datos en caché (actualiza en 60s)
                            </Text>
                        )}
                        {!isCached && olt && (
                            <Text style={styles.realtimeIndicator}>
                                ⚡ Datos en tiempo real del OLT
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default OLTDetailsScreen;