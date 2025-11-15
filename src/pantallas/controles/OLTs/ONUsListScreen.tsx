import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './ONUsListScreenStyles';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';

const ONUsListScreen = () => {
    const route = useRoute();
    const { oltId, oltName, id_usuario, filter } = route.params || {};
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [onus, setOnus] = useState([]);
    const [filteredOnus, setFilteredOnus] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState(filter || 'all');
    const [onuStats, setOnuStats] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [isCached, setIsCached] = useState(false);

    // Get auth token from storage
    useEffect(() => {
        const getAuthToken = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                if (jsonValue != null) {
                    const userData = JSON.parse(jsonValue);
                    setAuthToken(userData.token);
                }
            } catch (e) {
                console.error('Error al leer el token del usuario', e);
            }
        };
        getAuthToken();
    }, []);

    useEffect(() => {
        if (authToken) {
            fetchOnus();
        }
    }, [authToken]);

    const fetchOnus = async (forceRefresh = false) => {
        console.log('🔍 [ONUs] Iniciando fetchOnus para OLT:', oltId, 'Force refresh:', forceRefresh);

        if (!authToken) {
            console.log('⚠️ [ONUs] No auth token available yet');
            return;
        }

        if (forceRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            // Use realtime endpoint
            const response = await fetch(`https://wellnet-rd.com:444/api/olts/realtime/${oltId}/onus`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            console.log('🔍 [ONUs] Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ [ONUs] Realtime data received:', data);

                // Handle response structure from realtime API
                let onusArray = [];
                let statsData = null;

                if (data && data.success && data.data) {
                    if (data.data.onus && Array.isArray(data.data.onus)) {
                        onusArray = data.data.onus;
                    }
                    if (data.data.estadisticas) {
                        statsData = data.data.estadisticas;
                    }
                    setIsCached(data.cached || false);
                } else if (data && data.data) {
                    if (data.data.onus && Array.isArray(data.data.onus)) {
                        onusArray = data.data.onus;
                    }
                    if (data.data.estadisticas) {
                        statsData = data.data.estadisticas;
                    }
                } else if (Array.isArray(data)) {
                    onusArray = data;
                }

                console.log('✅ [ONUs] ONUs procesadas:', onusArray.length);
                setOnus(onusArray);
                setFilteredOnus(onusArray);
                setOnuStats(statsData);

                // Apply initial filter if provided
                if (filter && filter !== 'all') {
                    applyFilter(filter, onusArray);
                }
            } else {
                const errorText = await response.text();
                console.error('❌ [ONUs] Error response:', errorText);
                throw new Error(`Failed to fetch ONUs: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ [ONUs] Error fetching ONUs:', error);
            Alert.alert('Error', 'No se pudieron cargar las ONUs de esta OLT');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const registrarNavegacion = async () => {
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0];
        const hora = fechaActual.toTimeString().split(' ')[0];
        const pantalla = 'ONUsListScreen';

        const datos = JSON.stringify({
            oltId,
            oltName,
            filter: activeFilter,
            searchQuery,
            totalOnus: filteredOnus.length
        });

        const navigationLogData = {
            id_usuario: id_usuario,
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

    useFocusEffect(
        useCallback(() => {
            if (authToken) {
                fetchOnus();
                registrarNavegacion();
            }
            return () => {};
        }, [authToken])
    );

    // Handle manual refresh
    const handleRefresh = useCallback(async () => {
        await fetchOnus(true);
    }, [authToken]);

    const applyFilter = (filterType, onusData = onus) => {
        setActiveFilter(filterType);
        let filtered = [...onusData];

        switch (filterType) {
            case 'authorized':
                filtered = filtered.filter(onu => {
                    const estado = String(onu?.estado || '').toLowerCase();
                    return ['autorizada', 'online', 'active', 'authorized'].includes(estado);
                });
                break;
            case 'pending':
                filtered = filtered.filter(onu => {
                    const estado = String(onu?.estado || '').toLowerCase();
                    return ['pendiente', 'discovered', 'pending'].includes(estado);
                });
                break;
            case 'offline':
                filtered = filtered.filter(onu => {
                    const estado = String(onu?.estado || '').toLowerCase();
                    return ['offline', 'desconectada', 'inactive'].includes(estado);
                });
                break;
            case 'all':
            default:
                // No filter, show all
                break;
        }

        // Apply search query if exists
        if (searchQuery) {
            const formattedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(onu =>
                String(onu?.serial || '').toLowerCase().includes(formattedQuery) ||
                String(onu?.descripcion || '').toLowerCase().includes(formattedQuery) ||
                String(onu?.mac_address || '').toLowerCase().includes(formattedQuery) ||
                String(onu?.id_onu || '').toString().includes(formattedQuery)
            );
        }

        setFilteredOnus(filtered);
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        applyFilter(activeFilter);
    };

    const getOnuStatus = (onu) => {
        const estado = String(onu?.estado || '').toLowerCase();
        switch (estado) {
            case 'autorizada':
            case 'online':
            case 'active':
            case 'authorized':
                return {
                    badge: styles.statusAuthorized,
                    text: styles.statusTextAuthorized,
                    label: '✅ Autorizada'
                };
            case 'pendiente':
            case 'discovered':
            case 'pending':
                return {
                    badge: styles.statusPending,
                    text: styles.statusTextPending,
                    label: '⏳ Pendiente'
                };
            case 'offline':
            case 'desconectada':
            case 'inactive':
                return {
                    badge: styles.statusOffline,
                    text: styles.statusTextOffline,
                    label: '🔴 Desconectada'
                };
            default:
                return {
                    badge: styles.statusUnknown,
                    text: styles.statusTextUnknown,
                    label: '⚪ Desconocido'
                };
        }
    };

    const handleOpenOnu = (onuItem) => {
        if (!onuItem) return;

        const ontIdentifier = onuItem?.ont_id ?? onuItem?.ontId ?? onuItem?.ont;

        console.log('🔍 [ONUs List] Opening ONU with data:', {
            id_onu: onuItem?.id_onu,
            serial: onuItem?.serial,
            puerto: onuItem?.puerto,
            ont_id: ontIdentifier,
            full_item: onuItem
        });

        navigation.navigate('ONUDetailsScreen', {
            onuId: onuItem?.id_onu || onuItem?.serial || 'onu',
            oltId,
            id_usuario,
            puerto: onuItem?.puerto || null,
            slot: onuItem?.slot || null,
            ontId: ontIdentifier ?? null,
            ont_id: ontIdentifier ?? null,  // Agregado para compatibilidad
            onuPreview: {
                id_onu: onuItem?.id_onu,
                serial: onuItem?.serial,
                descripcion: onuItem?.descripcion,
                mac_address: onuItem?.mac_address,
                modelo: onuItem?.modelo,
                estado: onuItem?.estado,
                puerto: onuItem?.puerto,
                slot: onuItem?.slot,
                distancia: onuItem?.distancia,
                potencia_rx: onuItem?.potencia_rx,
                potencia_tx: onuItem?.potencia_tx,
                ultima_conexion: onuItem?.ultima_conexion,
                cliente_nombre: onuItem?.cliente_nombre,
                cliente_direccion: onuItem?.cliente_direccion,
                cliente_telefono: onuItem?.cliente_telefono,
                plan_servicio: onuItem?.plan_servicio,
                estado_pago: onuItem?.estado_pago,
                potencia: onuItem?.potencia,
                ont_id: ontIdentifier ?? null,
            }
        });
    };

    const renderOnuCard = ({ item }) => {
        const statusInfo = getOnuStatus(item);

        return (
            <TouchableOpacity
                style={styles.onuCard}
                onPress={() => handleOpenOnu(item)}
                activeOpacity={0.8}
            >
                <View style={styles.onuHeader}>
                    <View style={styles.onuInfo}>
                        <Text style={styles.onuSerial}>{String(item.serial || `ONU ${item.id_onu || ''}`)}</Text>
                        <Text style={styles.onuDescription}>{String(item.descripcion || 'Sin descripción')}</Text>
                    </View>
                    <View style={[styles.onuStatusBadge, statusInfo.badge]}>
                        <Text style={statusInfo.text}>{statusInfo.label}</Text>
                    </View>
                </View>

                <View style={styles.onuDetails}>
                    <View style={styles.onuDetailRow}>
                        <Text style={styles.onuDetailLabel}>MAC Address</Text>
                        <Text style={styles.onuDetailValue}>{String(item.mac_address || 'No registrada')}</Text>
                    </View>
                    <View style={styles.onuDetailRow}>
                        <Text style={styles.onuDetailLabel}>Puerto/Slot</Text>
                        <Text style={styles.onuDetailValue}>
                            {item.puerto ? `${item.puerto}${item.slot ? `/${item.slot}` : ''}` : 'No asignado'}
                        </Text>
                    </View>
                    <View style={styles.onuDetailRow}>
                        <Text style={styles.onuDetailLabel}>Última Conexión</Text>
                        <Text style={styles.onuDetailValue}>
                            {item.ultima_conexion ? new Date(item.ultima_conexion).toLocaleDateString() : 'No disponible'}
                        </Text>
                    </View>
                </View>

                {item.distancia && (
                    <View style={styles.onuMetrics}>
                        <Text style={styles.onuMetricsLabel}>📏 Distancia: {String(item.distancia)}m</Text>
                        {item.potencia_rx && (
                            <Text style={styles.onuMetricsLabel}>📶 Señal: {String(item.potencia_rx)} dBm</Text>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderFilterButtons = () => {
        const filters = [
            { key: 'all', label: 'Todas', icon: '📋', count: onus.length },
            { key: 'authorized', label: 'Autorizadas', icon: '✅', count: onuStats?.authorized || 0 },
            { key: 'pending', label: 'Pendientes', icon: '⏳', count: onuStats?.pending || 0 },
            { key: 'offline', label: 'Desconectadas', icon: '🔴', count: onuStats?.offline || 0 }
        ];

        return (
            <View style={styles.filtersContainer}>
                {filters.map((filterOption) => (
                    <TouchableOpacity
                        key={filterOption.key}
                        style={[
                            styles.filterButton,
                            activeFilter === filterOption.key && styles.filterButtonActive
                        ]}
                        onPress={() => applyFilter(filterOption.key)}
                    >
                        <Text style={styles.filterIcon}>{filterOption.icon}</Text>
                        <Text style={[
                            styles.filterText,
                            activeFilter === filterOption.key && styles.filterTextActive
                        ]}>
                            {filterOption.label}
                        </Text>
                        <View style={styles.filterCount}>
                            <Text style={styles.filterCountText}>{String(filterOption.count)}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderEmptyState = () => {
        if (onus.length === 0 && !isLoading) {
            return (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateIcon}>🔗</Text>
                    <Text style={styles.emptyStateTitle}>No hay ONUs registradas</Text>
                    <Text style={styles.emptyStateMessage}>
                        Esta OLT no tiene unidades ópticas de red registradas en el sistema.
                    </Text>
                </View>
            );
        }

        if (filteredOnus.length === 0 && (searchQuery || activeFilter !== 'all') && !isLoading) {
            return (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateIcon}>🔍</Text>
                    <Text style={styles.emptyStateTitle}>No se encontraron ONUs</Text>
                    <Text style={styles.emptyStateMessage}>
                        No hay ONUs que coincidan con los filtros aplicados.
                    </Text>
                </View>
            );
        }

        return null;
    };

    const renderLoadingState = () => {
        if (!isLoading) return null;

        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingText}>Cargando ONUs...</Text>
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
                            <Text style={styles.headerTitle}>ONUs - {String(oltName || 'OLT')}</Text>
                            <Text style={styles.headerSubtitle}>
                                {filteredOnus.length} de {onus.length} ONUs
                                {activeFilter !== 'all' && ` (${activeFilter})`}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <View style={styles.totalBadge}>
                            <Text style={styles.totalBadgeText}>{String(onus.length)}</Text>
                        </View>
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

            {/* Filters */}
            {renderFilterButtons()}

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        onChangeText={handleSearch}
                        value={searchQuery}
                        placeholder="Buscar por serial, MAC o descripción..."
                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                        autoCapitalize="none"
                        clearButtonMode="always"
                    />
                </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {renderLoadingState()}
                {renderEmptyState()}

                {!isLoading && filteredOnus.length > 0 && (
                    <FlatList
                        data={filteredOnus}
                        keyExtractor={(item) => item.id_onu?.toString() || item.serial}
                        renderItem={renderOnuCard}
                        contentContainerStyle={styles.onuList}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={
                            <View style={styles.footerContainer}>
                                {isCached && (
                                    <Text style={styles.cacheIndicator}>
                                        📦 Datos en caché (actualiza en 60s)
                                    </Text>
                                )}
                                {!isCached && onus.length > 0 && (
                                    <Text style={styles.realtimeIndicator}>
                                        ⚡ Datos en tiempo real del OLT
                                    </Text>
                                )}
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
};

export default ONUsListScreen;
