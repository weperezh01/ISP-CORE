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
    const [dataSource, setDataSource] = useState('');
    const isFetchingRef = React.useRef(false);
    const hasLoadedOnceRef = React.useRef(false);

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

    // Estadísticas locales de respaldo para no esperar una segunda llamada
    const computeLocalStats = (onusArray = []) => {
        const totals = onusArray.reduce((acc, onu) => {
            acc.total += 1;

            // Soportar tanto formato Huawei como ZTE
            const estadoResumido = String(onu?.estado_resumido || '').toLowerCase();
            const estadoDetallado = String(onu?.estado_detallado || '').toLowerCase();
            const estado = String(onu?.estado || '').toLowerCase();
            const esPendiente = onu?.es_pendiente === true;

            // ZTE: Usar estado_resumido y estado_detallado
            if (estadoResumido) {
                if (estadoResumido === 'online') {
                    acc.authorized += 1;
                    acc.online += 1;
                } else if (estadoResumido === 'offline') {
                    acc.authorized += 1;  // Offline pero autorizada
                    acc.offline += 1;

                    // Contar subtipos de offline
                    if (estadoDetallado === 'offline_power_fail') acc.offline_power_fail += 1;
                    else if (estadoDetallado === 'offline_los') acc.offline_los += 1;
                    else acc.offline_other += 1;
                }
            }
            // Huawei: Usar estado tradicional
            else if (['autorizada', 'online', 'active', 'authorized'].includes(estado)) {
                acc.authorized += 1;
                acc.online += 1;
            } else if (['offline', 'desconectada', 'inactive'].includes(estado)) {
                acc.offline += 1;
                acc.authorized += 1;
            }

            // Pendientes (ambos formatos)
            if (esPendiente || ['pendiente', 'discovered', 'pending'].includes(estado)) {
                acc.pending += 1;
            }

            return acc;
        }, {
            total: 0,
            authorized: 0,
            online: 0,
            offline: 0,
            pending: 0,
            offline_power_fail: 0,
            offline_los: 0,
            offline_other: 0
        });

        const stats = {
            total: totals.total,
            authorized: totals.authorized,
            online: totals.online,
            offline: totals.offline,
            pending: totals.pending,
            offline_power_fail: totals.offline_power_fail,
            offline_los: totals.offline_los,
            offline_other: totals.offline_other,
            availability_percent: totals.total > 0
                ? Number(((totals.online / totals.total) * 100).toFixed(2))
                : 0,
            filtradas: totals.total,
        };

        console.log('📊 [ONUs] Estadísticas locales calculadas:', stats);
        return stats;
    };

    const fetchOnus = async (forceRefresh = false) => {
        console.log('🔍 [ONUs] Iniciando fetchOnus para OLT:', oltId, 'Force refresh:', forceRefresh);

        if (isFetchingRef.current) {
            console.log('⏳ [ONUs] Fetch en curso, se omite nueva llamada');
            return;
        }

        if (!authToken) {
            console.log('⚠️ [ONUs] No auth token available yet');
            return;
        }

        isFetchingRef.current = true;

        if (forceRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            // Use realtime endpoint for ONUs list
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

                if (data && data.success && data.data) {
                    if (data.data.onus && Array.isArray(data.data.onus)) {
                        onusArray = data.data.onus;
                    }
                    setIsCached(data.cached || false);
                    setDataSource(data.source || data.data.source || '');
                } else if (data && data.data) {
                    if (data.data.onus && Array.isArray(data.data.onus)) {
                        onusArray = data.data.onus;
                    }
                } else if (Array.isArray(data)) {
                    onusArray = data;
                }

                console.log('✅ [ONUs] ONUs procesadas:', onusArray.length);
                setOnus(onusArray);
                setFilteredOnus(onusArray);

                // Estadísticos: usar los que vengan; si no, fallback local inmediato para evitar doble fase
                const localStats = computeLocalStats(onusArray);
                if (data && data.success && data.data && data.data.estadisticas) {
                    setOnuStats(data.data.estadisticas);
                } else if (data && data.estadisticas) {
                    setOnuStats(data.estadisticas);
                } else {
                    setOnuStats(localStats);
                }

                // Apply initial filter if provided
                if (filter && filter !== 'all') {
                    applyFilter(filter, onusArray);
                }
                hasLoadedOnceRef.current = true;
            } else {
                const errorText = await response.text();
                console.error('❌ [ONUs] Error response:', errorText);

                // Parse error message if possible
                let errorMessage = 'No se pudieron cargar las ONUs de esta OLT';
                let errorDetail = '';

                try {
                    const errorData = JSON.parse(errorText);
                    if (response.status === 503) {
                        if (errorData.error && errorData.error.includes('TimeoutExpired')) {
                            errorMessage = 'Timeout Consultando OLT';
                            errorDetail = 'La consulta al OLT está tardando más de lo esperado. El backend necesita aumentar el timeout del script expect.\n\nVer: PROMPT_BACKEND_FIX_TIMEOUT_ZTE.md';
                        } else {
                            errorMessage = 'Error en el Script del OLT';
                            errorDetail = errorData.message || 'El backend no pudo consultar el OLT correctamente.';
                        }
                    }
                } catch (e) {
                    // Si no se puede parsear, usar mensaje genérico
                }

                if (errorDetail) {
                    Alert.alert(errorMessage, errorDetail);
                } else {
                    Alert.alert('Error', errorMessage);
                }

                throw new Error(`Failed to fetch ONUs: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ [ONUs] Error fetching ONUs:', error);
            // No mostrar alert aquí si ya se mostró arriba
            if (!error.message?.includes('Failed to fetch ONUs')) {
                Alert.alert('Error', 'No se pudieron cargar las ONUs de esta OLT');
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            isFetchingRef.current = false;
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
            if (authToken && !isFetchingRef.current) {
                if (hasLoadedOnceRef.current) {
                    fetchOnus(true);
                }
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
        console.log(`🔍 [ONUs] Aplicando filtro: ${filterType} a ${onusData.length} ONUs`);
        setActiveFilter(filterType);
        let filtered = [...onusData];

        switch (filterType) {
            case 'authorized':
                filtered = filtered.filter(onu => {
                    const estadoResumido = String(onu?.estado_resumido || '').toLowerCase();
                    const estado = String(onu?.estado || '').toLowerCase();
                    const esPendiente = onu?.es_pendiente === true;

                    // ZTE: Usar estado_resumido (excluir pendientes)
                    if (estadoResumido) {
                        return !esPendiente && (estadoResumido === 'online' || estadoResumido === 'offline');
                    }
                    // Huawei: Usar estado tradicional
                    return ['autorizada', 'online', 'active', 'authorized', 'offline', 'desconectada'].includes(estado);
                });
                break;
            case 'online':
                filtered = filtered.filter(onu => {
                    const estadoResumido = String(onu?.estado_resumido || '').toLowerCase();
                    const estado = String(onu?.estado || '').toLowerCase();

                    // ZTE: Usar estado_resumido
                    if (estadoResumido) {
                        return estadoResumido === 'online';
                    }
                    // Huawei: Usar estado tradicional
                    return ['online', 'active'].includes(estado);
                });
                break;
            case 'pending':
                filtered = filtered.filter(onu => {
                    const esPendiente = onu?.es_pendiente === true;
                    const estado = String(onu?.estado || '').toLowerCase();

                    // Ambos formatos
                    return esPendiente || ['pendiente', 'discovered', 'pending'].includes(estado);
                });
                break;
            case 'offline':
                filtered = filtered.filter(onu => {
                    const estadoResumido = String(onu?.estado_resumido || '').toLowerCase();
                    const estado = String(onu?.estado || '').toLowerCase();

                    // ZTE: Usar estado_resumido
                    if (estadoResumido) {
                        return estadoResumido === 'offline';
                    }
                    // Huawei: Usar estado tradicional
                    return ['offline', 'desconectada', 'inactive'].includes(estado);
                });
                break;
            case 'low_signal':
                filtered = filtered.filter(onu => {
                    const rxPower = parseFloat(onu?.potencia_rx || 0);
                    // Solo aplicable si hay datos de potencia disponibles
                    return rxPower !== 0 && rxPower < -20 && rxPower > -50;
                });
                break;
            case 'offline_power_fail':
                filtered = filtered.filter(onu => {
                    const estadoDetallado = String(onu?.estado_detallado || '').toLowerCase();
                    const estado = String(onu?.estado || '').toLowerCase();
                    const downCause = String(onu?.razon_desconexion || '').toLowerCase();

                    // ZTE: Usar estado_detallado
                    if (estadoDetallado) {
                        return estadoDetallado === 'offline_power_fail';
                    }
                    // Huawei: Usar razon_desconexion
                    return estado.includes('offline') &&
                           (downCause.includes('dying-gasp') || downCause.includes('power'));
                });
                break;
            case 'offline_los':
                filtered = filtered.filter(onu => {
                    const estadoDetallado = String(onu?.estado_detallado || '').toLowerCase();
                    const estado = String(onu?.estado || '').toLowerCase();
                    const downCause = String(onu?.razon_desconexion || '').toLowerCase();

                    // ZTE: Usar estado_detallado
                    if (estadoDetallado) {
                        return estadoDetallado === 'offline_los';
                    }
                    // Huawei: Usar razon_desconexion
                    return estado.includes('offline') && downCause.includes('los');
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
                String(onu?.id_onu || '').toString().includes(formattedQuery) ||
                String(onu?.index || '').toLowerCase().includes(formattedQuery) ||
                String(onu?.puerto || '').toLowerCase().includes(formattedQuery)
            );
        }

        console.log(`✅ [ONUs] Filtro ${filterType} aplicado: ${filtered.length} ONUs resultantes`);
        setFilteredOnus(filtered);
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        applyFilter(activeFilter);
    };

    const getOnuStatus = (onu) => {
        const estadoResumido = String(onu?.estado_resumido || '').toLowerCase();
        const estadoDetallado = String(onu?.estado_detallado || '').toLowerCase();
        const estado = String(onu?.estado || '').toLowerCase();
        const esPendiente = onu?.es_pendiente === true;

        // Pendientes (prioridad más alta)
        if (esPendiente || ['pendiente', 'discovered', 'pending'].includes(estado)) {
            return {
                badge: styles.statusPending,
                text: styles.statusTextPending,
                label: '⏳ Pendiente'
            };
        }

        // ZTE: Usar estado_resumido y estado_detallado
        if (estadoResumido) {
            if (estadoResumido === 'online') {
                return {
                    badge: styles.statusAuthorized,
                    text: styles.statusTextAuthorized,
                    label: '✅ En Línea'
                };
            } else if (estadoResumido === 'offline') {
                // Mostrar motivo específico si está disponible
                if (estadoDetallado === 'offline_power_fail') {
                    return {
                        badge: styles.statusOffline,
                        text: styles.statusTextOffline,
                        label: '⚡ Sin Energía'
                    };
                } else if (estadoDetallado === 'offline_los') {
                    return {
                        badge: styles.statusOffline,
                        text: styles.statusTextOffline,
                        label: '📡 Sin Señal'
                    };
                } else if (estadoDetallado === 'offline_disabled') {
                    return {
                        badge: styles.statusOffline,
                        text: styles.statusTextOffline,
                        label: '🚫 Deshabilitada'
                    };
                } else {
                    return {
                        badge: styles.statusOffline,
                        text: styles.statusTextOffline,
                        label: '🔴 Desconectada'
                    };
                }
            }
        }

        // Huawei: Usar estado tradicional
        switch (estado) {
            case 'autorizada':
            case 'online':
            case 'active':
            case 'authorized':
                return {
                    badge: styles.statusAuthorized,
                    text: styles.statusTextAuthorized,
                    label: '✅ En Línea'
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

        // Validar que la ONU tenga datos suficientes para mostrar detalles
        const hasIdOnu = onuItem?.id_onu != null;
        const hasSerial = onuItem?.serial != null && onuItem?.serial !== '';
        const hasPuerto = onuItem?.puerto != null && onuItem?.puerto !== '';

        if (!hasIdOnu && !hasSerial) {
            Alert.alert(
                'Datos Incompletos',
                `Esta ONU no tiene suficiente información para mostrar detalles.\n\nPuerto: ${hasPuerto ? onuItem.puerto : 'Desconocido'}\nONT ID: ${ontIdentifier ?? 'Desconocido'}\n\nLos datos podrían estar incompletos en el OLT.`,
                [{ text: 'OK' }]
            );
            return;
        }

        // Determinar el mejor identificador para la ONU
        let onuIdentifier;
        if (hasIdOnu) {
            onuIdentifier = onuItem.id_onu.toString();
        } else if (hasSerial) {
            onuIdentifier = onuItem.serial;
        } else {
            // No debería llegar aquí por la validación anterior
            onuIdentifier = 'onu';
        }

        navigation.navigate('ONUDetailsScreen', {
            onuId: onuIdentifier,
            oltId,
            id_usuario,
            puerto: onuItem?.puerto || null,
            slot: onuItem?.slot || null,
            ontId: ontIdentifier ?? null,
            ont_id: ontIdentifier ?? null,
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
        const hasSerial = item.serial != null && item.serial !== '';
        const hasIdOnu = item.id_onu != null;
        const isIncomplete = !hasSerial && !hasIdOnu;

        // Determinar el título de la tarjeta
        let cardTitle;
        if (hasSerial) {
            cardTitle = item.serial;
        } else if (hasIdOnu) {
            cardTitle = `ONU ${item.id_onu}`;
        } else if (item.puerto && item.ont_id != null) {
            cardTitle = `${item.puerto}:${item.ont_id}`;
        } else {
            cardTitle = 'ONU sin identificar';
        }

        return (
            <TouchableOpacity
                style={[
                    styles.onuCard,
                    isIncomplete && styles.onuCardIncomplete
                ]}
                onPress={() => handleOpenOnu(item)}
                activeOpacity={0.8}
            >
                <View style={styles.onuHeader}>
                    <View style={styles.onuInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={styles.onuSerial}>{String(cardTitle)}</Text>
                            {isIncomplete && (
                                <Text style={styles.incompleteWarning}>⚠️</Text>
                            )}
                        </View>
                        <Text style={styles.onuDescription}>
                            {String(item.descripcion || (isIncomplete ? 'Datos incompletos' : 'Sin descripción'))}
                        </Text>
                    </View>
                    <View style={[styles.onuStatusBadge, statusInfo.badge]}>
                        <Text style={statusInfo.text}>{statusInfo.label}</Text>
                    </View>
                </View>

                <View style={styles.onuDetails}>
                    <View style={styles.onuDetailRow}>
                        <Text style={styles.onuDetailLabel}>
                            {hasSerial ? 'MAC Address' : 'Serial'}
                        </Text>
                        <Text style={styles.onuDetailValue}>
                            {hasSerial
                                ? String(item.mac_address || 'No registrada')
                                : 'No disponible'
                            }
                        </Text>
                    </View>
                    <View style={styles.onuDetailRow}>
                        <Text style={styles.onuDetailLabel}>Puerto/Slot</Text>
                        <Text style={styles.onuDetailValue}>
                            {item.puerto
                                ? `${item.puerto}${item.ont_id != null ? `:${item.ont_id}` : ''}`
                                : 'No asignado'
                            }
                        </Text>
                    </View>
                    <View style={styles.onuDetailRow}>
                        <Text style={styles.onuDetailLabel}>
                            {item.tipo ? `Tipo: ${item.tipo}` : 'Última Conexión'}
                        </Text>
                        <Text style={styles.onuDetailValue}>
                            {item.ultima_conexion
                                ? new Date(item.ultima_conexion).toLocaleDateString()
                                : 'No disponible'
                            }
                        </Text>
                    </View>
                </View>

                {(item.distancia || item.potencia_rx) && (
                    <View style={styles.onuMetrics}>
                        {item.distancia && (
                            <Text style={styles.onuMetricsLabel}>📏 Distancia: {String(item.distancia)}m</Text>
                        )}
                        {item.potencia_rx && (
                            <Text style={styles.onuMetricsLabel}>📶 Señal: {String(item.potencia_rx)} dBm</Text>
                        )}
                    </View>
                )}

                {/* Authorize Button - Only for pending ONUs */}
                {(String(item.estado || '').toLowerCase() === 'pending' ||
                  String(item.estado || '').toLowerCase() === 'pendiente' ||
                  String(item.estado || '').toLowerCase() === 'discovered' ||
                  item.es_pendiente === true) && (
                    <TouchableOpacity
                        style={styles.authorizeButtonInCard}
                        onPress={(e) => {
                            e.stopPropagation();
                            navigation.navigate('ONUDetailsScreen', {
                                oltId: oltId,
                                onuId: item.serial || item.id_onu || item.index,
                                oltName: oltName,
                                portHint: item.puerto,
                                ontIdHint: item.ont_id,
                                autoOpenAuthModal: true
                            });
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.authorizeButtonText}>Autorizar ONU</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const renderFilterButtons = () => {
        const primaryFilters = [
            { key: 'all', label: 'Todas', icon: '📋', count: onuStats?.total || onus.length },
            { key: 'online', label: 'En línea', icon: '🟢', count: onuStats?.online || 0 },
            { key: 'pending', label: 'Pendientes', icon: '⏳', count: onuStats?.pending || 0 },
            { key: 'offline', label: 'Desconectadas', icon: '🔴', count: onuStats?.offline || 0 },
        ];

        const secondaryFilters = [
            { key: 'authorized', label: 'Autorizadas', icon: '✅', count: onuStats?.authorized || 0 },
            { key: 'low_signal', label: 'Señal baja', icon: '⚠️', count: onuStats?.low_signal || 0 },
            { key: 'offline_power_fail', label: 'Falla energía', icon: '⚡', count: onuStats?.offline_power_fail || 0 },
            { key: 'offline_los', label: 'Sin señal', icon: '📡', count: onuStats?.offline_los || 0 },
        ];

        return (
            <View style={styles.filtersSection}>
                {/* Filtros principales */}
                <View style={styles.filtersContainer}>
                    {primaryFilters.map((filterOption) => (
                        <TouchableOpacity
                            key={filterOption.key}
                            style={[
                                styles.filterButton,
                                activeFilter === filterOption.key && styles.filterButtonActive
                            ]}
                            onPress={() => applyFilter(filterOption.key)}
                        >
                            <Text style={styles.filterIcon}>{filterOption.icon}</Text>
                            <View style={styles.filterContent}>
                                <Text style={[
                                    styles.filterText,
                                    activeFilter === filterOption.key && styles.filterTextActive
                                ]}>
                                    {filterOption.label}
                                </Text>
                                <Text style={[
                                    styles.filterCount,
                                    activeFilter === filterOption.key && styles.filterCountActive
                                ]}>
                                    {String(filterOption.count)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Filtros secundarios - colapsables */}
                <View style={styles.secondaryFiltersContainer}>
                    {secondaryFilters.map((filterOption) => (
                        <TouchableOpacity
                            key={filterOption.key}
                            style={[
                                styles.secondaryFilterButton,
                                activeFilter === filterOption.key && styles.secondaryFilterButtonActive
                            ]}
                            onPress={() => applyFilter(filterOption.key)}
                        >
                            <Text style={styles.secondaryFilterIcon}>{filterOption.icon}</Text>
                            <Text style={[
                                styles.secondaryFilterText,
                                activeFilter === filterOption.key && styles.secondaryFilterTextActive
                            ]}>
                                {filterOption.label}
                            </Text>
                            <Text style={[
                                styles.secondaryFilterCount,
                                activeFilter === filterOption.key && styles.secondaryFilterCountActive
                            ]}>
                                {String(filterOption.count)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
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
            // Special message for pending ONUs filter
            if (activeFilter === 'pending' && onuStats?.pending > 0) {
                return (
                    <View style={styles.emptyStateContainer}>
                        <Text style={styles.emptyStateIcon}>⏳</Text>
                        <Text style={styles.emptyStateTitle}>ONUs Pendientes No Disponibles</Text>
                        <Text style={styles.emptyStateMessage}>
                            Hay {onuStats.pending} ONU(s) esperando autorización en el OLT, pero aún no están incluidas en la lista.
                        </Text>
                        <Text style={styles.emptyStateMessage}>
                            Para autorizar ONUs nuevas, acceda directamente a la consola del OLT.
                        </Text>
                    </View>
                );
            }

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
                        keyExtractor={(item, index) => {
                            // Generar key única con múltiples fallbacks
                            if (item.id_onu) return `onu-${item.id_onu}`;
                            if (item.serial) return `serial-${item.serial}`;
                            if (item.puerto && item.ont_id !== null && item.ont_id !== undefined) {
                                return `port-${item.puerto}-${item.ont_id}`;
                            }
                            // Último recurso: usar index (no ideal pero evita null keys)
                            return `index-${index}`;
                        }}
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
                                {dataSource && (
                                    <Text style={styles.footerMeta}>
                                        Fuente: {dataSource}
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
