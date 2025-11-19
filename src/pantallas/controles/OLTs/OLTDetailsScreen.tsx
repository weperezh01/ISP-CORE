import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
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

    // State for sensitive data visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showSnmpRead, setShowSnmpRead] = useState(false);
    const [showSnmpWrite, setShowSnmpWrite] = useState(false);

    const getOltImage = (oltData) => {
        const model = (oltData?.modelo || oltData?.nombre_olt || '').toLowerCase();

        if (model.includes('zte') || model.includes('c320')) {
            return require('../../../images/OLTs/ZTE-C320.png');
        }

        if (model.includes('huawei') || model.includes('ma5800') || model.includes('olt huawei')) {
            return require('../../../images/OLTs/Huawei-MA5800-X15.png');
        }

        return null;
    };

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

            // ✅ FIX: Agregar parámetro force para bypass del caché del backend
            const url = `https://wellnet-rd.com:444/api/olts/realtime/detalles/${oltId}${forceRefresh ? '?force=true' : ''}`;

            const response = await fetch(url, {
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
    const fetchOnusStats = useCallback(async (forceRefresh = false) => {
        if (!oltId) return;

        if (!authToken) {
            console.log('⚠️ [OLT Details] No auth token for stats');
            return;
        }

        try {
            // ✅ FIX: Agregar parámetro force para bypass del caché
            const url = `https://wellnet-rd.com:444/api/olts/realtime/${oltId}/onus/estadisticas${forceRefresh ? '?force=true' : ''}`;

            const response = await fetch(url, {
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

    // Load all data (optimized with parallel loading)
    const loadData = useCallback(async (forceRefresh = false) => {
        await obtenerDatosUsuario();

        // ✅ FIX: Ejecutar ambas llamadas en PARALELO en lugar de secuencial
        // Pasar forceRefresh a AMBAS llamadas para asegurar datos frescos
        await Promise.all([
            fetchOltDetails(forceRefresh),
            fetchOnusStats(forceRefresh)
        ]);
    }, [obtenerDatosUsuario, fetchOltDetails, fetchOnusStats]);

    // Handle manual refresh (force update from OLT)
    const handleRefresh = useCallback(async () => {
        // ✅ FIX: Forzar refresh real del OLT, no usar caché
        await Promise.all([
            fetchOltDetails(true),
            fetchOnusStats(true)
        ]);
    }, [fetchOltDetails, fetchOnusStats]);

    // Initial load and focus refresh
    useFocusEffect(
        useCallback(() => {
            // ✅ FIX: Forzar refresh en cada foco para obtener datos actualizados
            // Esto asegura que después de autorizar una ONU, los contadores se actualicen
            loadData(true);
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
        const imageSource = getOltImage(olt);

        return (
            <View style={styles.oltCard}>
                <View style={styles.oltHeader}>
                    <View style={styles.oltMainInfo}>
                        {imageSource ? (
                            <Image source={imageSource} style={styles.oltImage} resizeMode="contain" />
                        ) : (
                            <Text style={styles.oltIcon}>📡</Text>
                        )}
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

    // Render OLT detailed settings
    const renderOltSettings = () => {
        if (!olt) return null;

        const maskValue = (value) => {
            if (!value) return '**********';
            return '**********';
        };

        const settings = [
            { label: 'Name', value: olt.nombre_olt || 'N/A', sensitive: false },
            { label: 'OLT IP', value: olt.ip_olt || 'N/A', sensitive: false },
            { label: 'Reachable via VPN tunnel', value: olt.vpn_tunnel || 'no', sensitive: false },
            { label: 'Telnet TCP port', value: String(olt.puerto_telnet || olt.puerto_gestion || '23'), sensitive: false },
            { label: 'OLT telnet username', value: olt.olt_username || 'N/A', sensitive: true, showState: showPassword, setShowState: setShowPassword },
            { label: 'OLT telnet password', value: olt.olt_password || 'N/A', sensitive: true, showState: showPassword, setShowState: setShowPassword },
            { label: 'SNMP read-only community', value: olt.snmp_community_read || olt.snmp_community || 'N/A', sensitive: true, showState: showSnmpRead, setShowState: setShowSnmpRead },
            { label: 'SNMP read-write community', value: olt.snmp_community_write || 'N/A', sensitive: true, showState: showSnmpWrite, setShowState: setShowSnmpWrite },
            { label: 'SNMP UDP port', value: String(olt.snmp_port || '161'), sensitive: false },
            { label: 'IPTV module', value: olt.iptv_enabled ? 'enabled' : 'disabled', sensitive: false },
            { label: 'OLT hardware version', value: olt.hardware_version || olt.modelo || 'N/A', sensitive: false },
            { label: 'OLT software version', value: olt.software_version || 'N/A', sensitive: false },
            { label: 'Supported PON types', value: olt.pon_types || 'GPON', sensitive: false },
            { label: 'TR069 Profile', value: olt.tr069_profile || '', sensitive: false },
        ];

        const actionButtons = [
            {
                id: 'edit',
                icon: '✏️',
                label: 'Editar Configuración',
                onPress: () => {
                    Alert.alert(
                        'Editar Configuración OLT',
                        `Editar configuración de: ${olt.nombre_olt}`,
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                                text: 'Editar',
                                onPress: () => {
                                    // TODO: Navegar a pantalla de edición
                                    console.log('Navegando a editar OLT');
                                }
                            }
                        ]
                    );
                },
                style: 'primary'
            },
            {
                id: 'history',
                icon: '📜',
                label: 'Historial',
                onPress: () => {
                    Alert.alert(
                        'Ver Historial',
                        `Historial de cambios de: ${olt.nombre_olt}`,
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                                text: 'Ver',
                                onPress: () => {
                                    // TODO: Navegar a pantalla de historial
                                    console.log('Navegando a historial OLT');
                                }
                            }
                        ]
                    );
                },
                style: 'secondary'
            },
            {
                id: 'cli',
                icon: '>_',
                label: 'CLI',
                onPress: () => {
                    Alert.alert(
                        'Interfaz de Línea de Comandos',
                        `Acceder a CLI de: ${olt.nombre_olt}\n\nIP: ${olt.ip_olt}`,
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                                text: 'Conectar',
                                onPress: () => {
                                    // TODO: Navegar a pantalla de CLI
                                    console.log('Abriendo CLI para OLT');
                                }
                            }
                        ]
                    );
                },
                style: 'secondary'
            },
            {
                id: 'backups',
                icon: '💾',
                label: 'Respaldos',
                onPress: () => {
                    Alert.alert(
                        'Respaldos de Configuración',
                        `Gestionar respaldos de configuración de: ${olt.nombre_olt}`,
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                                text: 'Ver Respaldos',
                                onPress: () => {
                                    // TODO: Navegar a pantalla de backups
                                    console.log('Navegando a config backups');
                                }
                            }
                        ]
                    );
                },
                style: 'secondary'
            }
        ];

        return (
            <View style={styles.settingsCard}>
                <View style={styles.settingsHeader}>
                    <Text style={styles.sectionTitle}>⚙️ OLT Settings</Text>

                    {/* Action Buttons */}
                    <View style={styles.settingsActions}>
                        {actionButtons.map((button) => (
                            <TouchableOpacity
                                key={button.id}
                                style={[
                                    styles.settingsActionButton,
                                    button.style === 'primary' && styles.settingsActionButtonPrimary
                                ]}
                                onPress={button.onPress}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.settingsActionIcon}>{button.icon}</Text>
                                <Text style={[
                                    styles.settingsActionText,
                                    button.style === 'primary' && styles.settingsActionTextPrimary
                                ]}>
                                    {button.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.settingsTable}>
                    {settings.map((setting, index) => (
                        <View
                            key={index}
                            style={[
                                styles.settingRow,
                                index % 2 === 0 && styles.settingRowEven
                            ]}
                        >
                            <Text style={styles.settingLabel}>{setting.label}</Text>
                            <View style={styles.settingValueContainer}>
                                {setting.sensitive ? (
                                    <>
                                        <Text style={styles.settingValue}>
                                            {setting.showState ? setting.value : maskValue(setting.value)}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.toggleButton}
                                            onPress={() => setting.setShowState(!setting.showState)}
                                        >
                                            <Text style={styles.toggleButtonText}>
                                                {setting.showState ? '👁️' : '👁️‍🗨️'}
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <Text style={styles.settingValue}>{setting.value}</Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* TR069 Profile Management Link */}
                <TouchableOpacity
                    style={styles.tr069Link}
                    onPress={() => {
                        Alert.alert(
                            'Manage TR069 Profiles',
                            `Configurar perfiles TR069 para OLT: ${olt.nombre_olt}`,
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                    text: 'Ir',
                                    onPress: () => {
                                        // TODO: Navegar a pantalla de TR069 profiles
                                        console.log('Navegando a TR069 Profiles');
                                    }
                                }
                            ]
                        );
                    }}
                    activeOpacity={0.7}
                >
                    <Text style={styles.tr069LinkIcon}>🔧</Text>
                    <Text style={styles.tr069LinkText}>Manage TR069 profiles</Text>
                    <Text style={styles.tr069LinkArrow}>→</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Render ONUs statistics cards
    const renderOnuStatistics = () => {
        if (!onusStats) return null;

        return (
            <View style={styles.onuStatsContainer}>
                <Text style={styles.sectionTitle}>📊 Estado de ONUs</Text>

                <View style={styles.statsCardsGrid}>
                    {/* Tarjeta Azul - En espera de autorización */}
                    <TouchableOpacity
                        style={[styles.statCard, styles.statCardPending]}
                        onPress={() => handleViewOnus('pending')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.statCardHeader}>
                            <Text style={styles.statCardIcon}>⏳</Text>
                            <Text style={styles.statCardValue}>
                                {String(onusStats.pending || 0)}
                            </Text>
                        </View>
                        <Text style={styles.statCardTitle}>En espera de autorización</Text>
                        <View style={styles.statCardDetails}>
                            <Text style={styles.statCardDetailText}>
                                D: {String(onusStats.pending_discovered || 0)}
                            </Text>
                            <Text style={styles.statCardDetailText}>
                                Resync: {String(onusStats.pending_resync || 0)}
                            </Text>
                            <Text style={styles.statCardDetailText}>
                                Nuevas: {String(onusStats.pending_new || 0)}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Tarjeta Verde - ONUs en línea */}
                    <TouchableOpacity
                        style={[styles.statCard, styles.statCardOnline]}
                        onPress={() => handleViewOnus('authorized')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.statCardHeader}>
                            <Text style={styles.statCardIcon}>✅</Text>
                            <Text style={styles.statCardValue}>
                                {String(onusStats.online || onusStats.authorized || 0)}
                            </Text>
                        </View>
                        <Text style={styles.statCardTitle}>ONUs en línea</Text>
                        <View style={styles.statCardDetails}>
                            <Text style={styles.statCardDetailText}>
                                Total autorizadas: {String(onusStats.authorized || 0)}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Tarjeta Gris - ONUs fuera de línea */}
                    <TouchableOpacity
                        style={[styles.statCard, styles.statCardOffline]}
                        onPress={() => handleViewOnus('offline')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.statCardHeader}>
                            <Text style={styles.statCardIcon}>🔴</Text>
                            <Text style={styles.statCardValue}>
                                {String(onusStats.offline || 0)}
                            </Text>
                        </View>
                        <Text style={styles.statCardTitle}>ONUs fuera de línea</Text>
                        <View style={styles.statCardDetails}>
                            <Text style={styles.statCardDetailText}>
                                Falla energía: {String(onusStats.offline_power_fail || 0)}
                            </Text>
                            <Text style={styles.statCardDetailText}>
                                Pérdida señal: {String(onusStats.offline_los || 0)}
                            </Text>
                            <Text style={styles.statCardDetailText}>
                                Sin clasificar: {String(onusStats.offline_na || 0)}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Tarjeta Naranja - ONUs con señal baja */}
                    <TouchableOpacity
                        style={[styles.statCard, styles.statCardLowSignal]}
                        onPress={() => handleViewOnus('low_signal')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.statCardHeader}>
                            <Text style={styles.statCardIcon}>⚠️</Text>
                            <Text style={styles.statCardValue}>
                                {String(onusStats.low_signal || 0)}
                            </Text>
                        </View>
                        <Text style={styles.statCardTitle}>ONUs con señal baja</Text>
                        <View style={styles.statCardDetails}>
                            <Text style={styles.statCardDetailText}>
                                Advertencia: {String(onusStats.low_signal_warning || 0)}
                            </Text>
                            <Text style={styles.statCardDetailText}>
                                Críticas: {String(onusStats.low_signal_critical || 0)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Render advanced options/links
    const renderAdvancedOptions = () => {
        const options = [
            { id: 'cards', icon: '🎴', label: 'OLT Cards', screen: 'OLTCards' },
            { id: 'pon_ports', icon: '🔌', label: 'PON Ports', screen: 'PONPorts' },
            { id: 'uplink', icon: '↗️', label: 'Uplink', screen: 'OLTUplink' },
            { id: 'vlans', icon: '🏷️', label: 'VLANs', screen: 'OLTVLANs' },
            { id: 'mgmt_ips', icon: '🌐', label: 'ONU Mgmt IPs', screen: 'ONUMgmtIPs' },
            { id: 'remote_acls', icon: '🔒', label: 'Remote ACLs', screen: 'RemoteACLs' },
            { id: 'voip', icon: '📞', label: 'VoIP Profiles', screen: 'VoIPProfiles' },
            { id: 'advanced', icon: '⚙️', label: 'Advanced', screen: 'OLTAdvanced' },
        ];

        return (
            <View style={styles.advancedOptionsContainer}>
                <Text style={styles.sectionTitle}>🔧 Configuración Avanzada</Text>
                <View style={styles.optionsGrid}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.optionCard}
                            onPress={() => {
                                // Navegación directa para OLT Cards
                                if (option.id === 'cards') {
                                    navigation.navigate(option.screen, {
                                        oltId: oltId,
                                        oltName: olt?.nombre_olt,
                                        oltData: olt
                                    });
                                    return;
                                }

                                // TODO: Navegar a la pantalla correspondiente (otras opciones)
                                Alert.alert(
                                    option.label,
                                    `Navegando a ${option.label}...\n\nPantalla: ${option.screen}\nOLT ID: ${oltId}`,
                                    [
                                        {
                                            text: 'Cancelar',
                                            style: 'cancel'
                                        },
                                        {
                                            text: 'Ir',
                                            onPress: () => {
                                                // Descomentar cuando las pantallas estén creadas
                                                // navigation.navigate(option.screen, {
                                                //     oltId: oltId,
                                                //     oltName: olt?.nombre_olt,
                                                //     oltData: olt
                                                // });
                                                console.log(`Navegando a ${option.screen}`);
                                            }
                                        }
                                    ]
                                );
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.optionIcon}>{option.icon}</Text>
                            <Text style={styles.optionLabel}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
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
                        {renderOltSettings()}
                        {renderOnuStatistics()}
                        {renderAdvancedOptions()}
                    </>
                )}

                {lastUpdate && (
                    <View style={styles.lastUpdateContainer}>
                        <Text style={styles.lastUpdateText}>
                            Última actualización: {format(lastUpdate, 'dd/MM/yyyy HH:mm:ss')}
                        </Text>
                        {isCached && (
                            <View style={styles.cacheWarningContainer}>
                                <Text style={styles.cacheIndicator}>
                                    📦 Datos en caché del backend
                                </Text>
                                <TouchableOpacity
                                    style={styles.forceRefreshButton}
                                    onPress={handleRefresh}
                                    disabled={isRefreshing}
                                >
                                    <Text style={styles.forceRefreshButtonText}>
                                        {isRefreshing ? '⟳ Actualizando...' : '🔄 Actualizar Ahora'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
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
