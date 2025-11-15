import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './ONUDetailsScreenStyles';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ONUDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const routeParams = route.params || {};
    const { onuId, oltId, id_usuario } = routeParams;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const previewData = routeParams.onuPreview || null;
    const [portHint] = useState(routeParams.puerto || previewData?.puerto || null);
    const [ontIdHint] = useState(
        routeParams.ont_id ??
        routeParams.ontId ??
        previewData?.ont_id ??
        previewData?.ontId ??
        null
    );

    // State variables
    const [onu, setOnu] = useState(previewData || null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(
        previewData?.timestamp ? new Date(previewData.timestamp) : null
    );
    const [usuarioId, setUsuarioId] = useState(id_usuario || null);
    const [authToken, setAuthToken] = useState(null);
    const [isCached, setIsCached] = useState(false);
    const hasLoadedOnce = useRef(false);

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
            console.error('Error al leer el token del usuario', e);
        }
    }, []);

    // Fetch ONU details
    const fetchOnuDetails = useCallback(async (forceRefresh = false) => {
        console.log('🔍 [ONU Details] Fetching ONU details for ID:', onuId);

        if (!onuId) {
            setError('ID de ONU no proporcionado');
            setIsLoading(false);
            return;
        }

        if (!oltId) {
            setError('ID de OLT no proporcionado');
            setIsLoading(false);
            return;
        }

        if (!authToken) {
            console.log('⚠️ [ONU Details] No auth token available yet');
            return;
        }

        try {
            if (forceRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const queryParams = [];
            if (portHint) {
                queryParams.push(`puerto=${encodeURIComponent(portHint)}`);
            }
            if (ontIdHint !== null && ontIdHint !== undefined && ontIdHint !== '') {
                queryParams.push(`ont_id=${encodeURIComponent(ontIdHint)}`);
            }

            const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
            const endpoint = `https://wellnet-rd.com:444/api/olts/realtime/${oltId}/onus/${onuId}${queryString}`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ [ONU Details] Data received:', data);

            // Handle response structure
            let onuData = null;
            if (data && data.success && data.data && data.data.onu) {
                onuData = data.data.onu;
                setIsCached(data.cached || false);
            } else if (data && data.data && data.data.onu) {
                onuData = data.data.onu;
            } else if (data && data.onu) {
                onuData = data.onu;
            } else if (data) {
                onuData = data;
            }

            setOnu(onuData);
            const apiTimestamp = data?.timestamp || onuData?.timestamp;
            setLastUpdate(apiTimestamp ? new Date(apiTimestamp) : new Date());
            hasLoadedOnce.current = true;

        } catch (error) {
            console.error('❌ [ONU Details] Error:', error);
            setError(error.message || 'Error desconocido al consultar la ONU');
            Alert.alert('Error', 'No se pudieron cargar los detalles de la ONU');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [onuId, oltId, authToken, portHint, ontIdHint]);

    // Initial load
    useEffect(() => {
        obtenerDatosUsuario();
    }, [obtenerDatosUsuario]);

    useEffect(() => {
        if (authToken) {
            fetchOnuDetails();
        }
    }, [authToken, fetchOnuDetails]);

    // Refresh on focus
    useFocusEffect(
        useCallback(() => {
            if (authToken && hasLoadedOnce.current) {
                // Soft refresh when coming back to screen
                fetchOnuDetails(true);
            }
            return () => {};
        }, [authToken, fetchOnuDetails])
    );

    // Handle manual refresh
    const handleRefresh = useCallback(() => {
        fetchOnuDetails(true);
    }, [fetchOnuDetails]);

    // Get status info for display
    const getStatusInfo = (status) => {
        const statusStr = String(status || '').toLowerCase();
        switch (statusStr) {
            case 'online':
            case 'active':
            case 'authorized':
            case 'autorizada':
                return {
                    badge: styles.statusOnline,
                    icon: 'check-circle',
                    iconColor: '#10B981',
                    label: 'En Línea'
                };
            case 'offline':
            case 'inactive':
            case 'desconectada':
                return {
                    badge: styles.statusOffline,
                    icon: 'close-circle',
                    iconColor: '#EF4444',
                    label: 'Desconectada'
                };
            case 'pending':
            case 'discovered':
            case 'pendiente':
                return {
                    badge: styles.statusPending,
                    icon: 'clock-outline',
                    iconColor: '#F59E0B',
                    label: 'Pendiente'
                };
            default:
                return {
                    badge: styles.statusUnknown,
                    icon: 'help-circle',
                    iconColor: '#9CA3AF',
                    label: 'Desconocido'
                };
        }
    };

    // Get signal strength indicator
    const getSignalStrength = (rxPower) => {
        const power = parseFloat(rxPower || 0);
        if (!Number.isFinite(power)) {
            return { color: '#6B7280', label: 'Sin datos', icon: 'signal-cellular-outline' };
        }
        if (power >= -15) {
            return { color: '#10B981', label: 'Excelente', icon: 'signal-cellular-3' };
        } else if (power >= -20) {
            return { color: '#3B82F6', label: 'Buena', icon: 'signal-cellular-2' };
        } else if (power >= -25) {
            return { color: '#F59E0B', label: 'Regular', icon: 'signal-cellular-1' };
        }
        return { color: '#EF4444', label: 'Débil', icon: 'signal-cellular-outline' };
    };

    const getPaymentStatusInfo = (status) => {
        if (!status) return null;
        const normalized = String(status).trim().toLowerCase();

        if (['al dia', 'al día', 'aldia', 'pagado', 'al corriente'].includes(normalized)) {
            return { label: 'Al día', badgeStyle: styles.paymentStatusBadgePaid };
        }

        if (['moroso', 'atrasado', 'late'].includes(normalized)) {
            return { label: 'Moroso', badgeStyle: styles.paymentStatusBadgeLate };
        }

        if (['suspendido', 'suspendida', 'suspendido por pago'].includes(normalized)) {
            return { label: 'Suspendido', badgeStyle: styles.paymentStatusBadgeSuspended };
        }

        return { label: String(status), badgeStyle: styles.paymentStatusBadgeUnknown };
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) {
            const formatted = numeric
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return `RD$ ${formatted}`;
        }
        return String(value);
    };

    const formatPercentage = (value) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        if (typeof value === 'string' && value.includes('%')) {
            return value;
        }
        const numeric = Number(value);
        if (Number.isNaN(numeric)) {
            return String(value);
        }
        if (Number.isInteger(numeric)) {
            return `${numeric}%`;
        }
        return `${numeric.toFixed(2)}%`;
    };

    const formatSnrValue = (value) => {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const normalized = String(value);
        return normalized.toLowerCase().includes('db') ? normalized : `${normalized} dB`;
    };

    const parseDateTimeValue = (value) => {
        if (!value && value !== 0) return null;
        const trimmed = String(value).trim();
        if (!trimmed) return null;

        let normalized = trimmed;
        if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(trimmed)) {
            normalized = trimmed.replace(' ', 'T');
        }

        let parsed = new Date(normalized);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            parsed = new Date(`${trimmed}T00:00:00`);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        return null;
    };

    const formatDateTimeValue = (value) => {
        const parsed = parseDateTimeValue(value);
        if (parsed) {
            return format(parsed, 'dd/MM/yyyy HH:mm:ss');
        }
        return value ? String(value) : 'N/A';
    };

    // Render loading state
    if (isLoading && !onu) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>Cargando detalles de ONU...</Text>
                </View>
            </View>
        );
    }

    // Render error state
    if (error && !onu) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={64} color="#EF4444" />
                    <Text style={styles.errorTitle}>Error al cargar ONU</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!onu) return null;

    const statusInfo = getStatusInfo(onu.estado);
    const signalStrength = getSignalStrength(onu.potencia_rx);
    const paymentStatusInfo = getPaymentStatusInfo(onu.estado_pago);
    const snrValue = onu.snr ?? onu.snr_db ?? onu.snr_value ?? null;
    const signalQualityLabel = onu.calidad_senal || signalStrength.label;
    const formattedSnr = formatSnrValue(snrValue);
    const portUtilization = onu.utilizacion_puerto ?? onu.utilizacion_bw ?? onu.utilizacion;
    const hasAdvancedStats = Boolean(
        formattedSnr ||
        portUtilization ||
        onu.calidad_senal ||
        onu.errores_fec != null ||
        onu.paquetes_descartados != null
    );

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
                            <Icon name="arrow-left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Detalles de ONU</Text>
                            <Text style={styles.headerSubtitle}>
                                {String(onu.serial || `ONU ${onuId}`)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <Icon
                                name={isRefreshing ? 'loading' : 'refresh'}
                                size={24}
                                color="#FFFFFF"
                            />
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
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#10B981"
                    />
                }
            >
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Icon name={statusInfo.icon} size={48} color={statusInfo.iconColor} />
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusLabel}>Estado de Conexión</Text>
                            <Text style={[styles.statusValue, { color: statusInfo.iconColor }]}>
                                {statusInfo.label}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* General Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="information" size={24} color="#3B82F6" />
                        <Text style={styles.cardTitle}>Información General</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Serial Number</Text>
                            <Text style={styles.infoValue}>{String(onu.serial || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Descripción</Text>
                            <Text style={styles.infoValue}>{String(onu.descripcion || 'Sin descripción')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>MAC Address</Text>
                            <Text style={styles.infoValue}>{String(onu.mac_address || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Modelo</Text>
                            <Text style={styles.infoValue}>{String(onu.modelo || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Versión Firmware</Text>
                            <Text style={styles.infoValue}>{String(onu.version_firmware || 'N/A')}</Text>
                        </View>
                    </View>
                </View>

                {/* Optical Signal Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="waves" size={24} color="#10B981" />
                        <Text style={styles.cardTitle}>Señal Óptica</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.signalGrid}>
                            <View style={styles.signalBox}>
                                <Icon name="download" size={32} color="#3B82F6" />
                                <Text style={styles.signalLabel}>RX (Recibida)</Text>
                                <Text style={styles.signalValue}>
                                    {onu.potencia_rx ? `${onu.potencia_rx} dBm` : 'N/A'}
                                </Text>
                                {onu.potencia_rx && (
                                    <View style={[styles.signalIndicator, { backgroundColor: signalStrength.color }]}>
                                        <Text style={styles.signalIndicatorText}>{signalStrength.label}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.signalBox}>
                                <Icon name="upload" size={32} color="#8B5CF6" />
                                <Text style={styles.signalLabel}>TX (Transmitida)</Text>
                                <Text style={styles.signalValue}>
                                    {onu.potencia_tx ? `${onu.potencia_tx} dBm` : 'N/A'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Temperatura</Text>
                            <Text style={styles.infoValue}>
                                {onu.temperatura ? `${onu.temperatura}°C` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Voltaje</Text>
                            <Text style={styles.infoValue}>
                                {onu.voltaje ? `${onu.voltaje} V` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Corriente</Text>
                            <Text style={styles.infoValue}>
                                {onu.corriente ? `${onu.corriente} mA` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>SNR</Text>
                            <Text style={styles.infoValue}>
                                {formattedSnr || 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Connection Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="connection" size={24} color="#F59E0B" />
                        <Text style={styles.cardTitle}>Información de Conexión</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Puerto PON</Text>
                            <Text style={styles.infoValue}>
                                {onu.puerto ? `${onu.puerto}${onu.slot ? `/${onu.slot}` : ''}` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Distancia</Text>
                            <Text style={styles.infoValue}>
                                {onu.distancia ? `${onu.distancia} m` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Última Conexión</Text>
                            <Text style={styles.infoValue}>
                                {formatDateTimeValue(onu.ultima_conexion)}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Uptime</Text>
                            <Text style={styles.infoValue}>{String(onu.uptime || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Última Desconexión</Text>
                            <Text style={styles.infoValue}>
                                {formatDateTimeValue(onu.ultima_desconexion)}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Razón Desconexión</Text>
                            <Text style={styles.infoValue}>{String(onu.razon_desconexion || 'N/A')}</Text>
                        </View>
                    </View>
                </View>

                {/* Configuration Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="cog" size={24} color="#8B5CF6" />
                        <Text style={styles.cardTitle}>Configuración</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>VLAN</Text>
                            <Text style={styles.infoValue}>{String(onu.vlan || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Perfil de Servicio</Text>
                            <Text style={styles.infoValue}>{String(onu.perfil_servicio || 'N/A')}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Velocidad Bajada</Text>
                            <Text style={styles.infoValue}>
                                {onu.velocidad_bajada ? `${onu.velocidad_bajada} Mbps` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Velocidad Subida</Text>
                            <Text style={styles.infoValue}>
                                {onu.velocidad_subida ? `${onu.velocidad_subida} Mbps` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Modo Autorización</Text>
                            <Text style={styles.infoValue}>{String(onu.modo_autorizacion || 'N/A')}</Text>
                        </View>
                    </View>
                </View>

                {/* Traffic Stats Card */}
                {(onu.trafico_rx || onu.trafico_tx) && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="chart-line" size={24} color="#EF4444" />
                            <Text style={styles.cardTitle}>Estadísticas de Tráfico</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.trafficGrid}>
                                <View style={styles.trafficBox}>
                                    <Icon name="arrow-down-bold" size={24} color="#3B82F6" />
                                    <Text style={styles.trafficLabel}>Descarga (RX)</Text>
                                    <Text style={styles.trafficValue}>
                                        {onu.trafico_rx ? `${onu.trafico_rx}` : '0 B'}
                                    </Text>
                                </View>
                                <View style={styles.trafficBox}>
                                    <Icon name="arrow-up-bold" size={24} color="#8B5CF6" />
                                    <Text style={styles.trafficLabel}>Subida (TX)</Text>
                                    <Text style={styles.trafficValue}>
                                        {onu.trafico_tx ? `${onu.trafico_tx}` : '0 B'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Advanced Stats */}
                {hasAdvancedStats && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="chart-areaspline" size={24} color="#10B981" />
                            <Text style={styles.cardTitle}>Estadísticas Avanzadas</Text>
                        </View>
                        <View style={styles.cardContent}>
                            {(formattedSnr || portUtilization) && (
                                <View style={styles.metricsGrid}>
                                    {formattedSnr && (
                                        <View style={styles.metricBox}>
                                            <Icon name="signal" size={28} color="#14B8A6" />
                                            <Text style={styles.metricLabel}>SNR</Text>
                                            <Text style={styles.metricValue}>{formattedSnr}</Text>
                                        </View>
                                    )}
                                    {portUtilization !== null && portUtilization !== undefined && portUtilization !== '' && (
                                        <View style={styles.metricBox}>
                                            <Icon name="swap-vertical" size={28} color="#F59E0B" />
                                            <Text style={styles.metricLabel}>Utilización</Text>
                                            <Text style={styles.metricValue}>{formatPercentage(portUtilization)}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Calidad de Señal</Text>
                                <Text style={styles.infoValue}>{String(signalQualityLabel || 'N/A')}</Text>
                            </View>
                            {onu.errores_fec != null && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Errores FEC</Text>
                                    <Text style={styles.infoValue}>{String(onu.errores_fec)}</Text>
                                </View>
                            )}
                            {onu.paquetes_descartados != null && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Paquetes Descartados</Text>
                                    <Text style={styles.infoValue}>{String(onu.paquetes_descartados)}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Client Info Card (if available) */}
                {(onu.cliente_nombre || onu.cliente_direccion || onu.cliente_telefono || onu.plan_servicio || onu.estado_pago || onu.precio_servicio) && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon name="account" size={24} color="#10B981" />
                            <Text style={styles.cardTitle}>Información del Cliente</Text>
                        </View>
                        <View style={styles.cardContent}>
                            {onu.cliente_nombre && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Nombre</Text>
                                    <Text style={styles.infoValue}>{String(onu.cliente_nombre)}</Text>
                                </View>
                            )}
                            {onu.cliente_direccion && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Dirección</Text>
                                    <Text style={styles.infoValue}>{String(onu.cliente_direccion)}</Text>
                                </View>
                            )}
                            {onu.cliente_telefono && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Teléfono</Text>
                                    <Text style={styles.infoValue}>{String(onu.cliente_telefono)}</Text>
                                </View>
                            )}
                            {onu.plan_servicio && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Plan de Servicio</Text>
                                    <Text style={styles.infoValue}>{String(onu.plan_servicio)}</Text>
                                </View>
                            )}
                            {onu.precio_servicio && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Precio</Text>
                                    <Text style={styles.infoValue}>{formatCurrency(onu.precio_servicio)}</Text>
                                </View>
                            )}
                            {paymentStatusInfo && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Estado de Pago</Text>
                                    <View style={[styles.paymentStatusBadge, paymentStatusInfo.badgeStyle]}>
                                        <Text style={styles.paymentStatusText}>{paymentStatusInfo.label}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Last Update Info */}
                {lastUpdate && (
                    <View style={styles.lastUpdateContainer}>
                        <Text style={styles.lastUpdateText}>
                            Última actualización: {format(lastUpdate, 'dd/MM/yyyy HH:mm:ss')}
                        </Text>
                        {isCached && (
                            <Text style={styles.cacheIndicator}>
                                📦 Datos en caché
                            </Text>
                        )}
                        {!isCached && (
                            <Text style={styles.realtimeIndicator}>
                                ⚡ Datos en tiempo real
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default ONUDetailsScreen;
