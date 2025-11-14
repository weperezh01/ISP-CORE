import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStyles } from './ConfiguracionesListScreenStyles';

const ConfiguracionesListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id_isp } = route.params || {};

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [configuraciones, setConfiguraciones] = useState([]);
    const [filteredConfiguraciones, setFilteredConfiguraciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [estadisticas, setEstadisticas] = useState(null);

    // Filtros
    const [searchText, setSearchText] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('todos'); // 'todos', 'pppoe', 'simple_queue'
    const [periodoFiltro, setPeriodoFiltro] = useState(null); // null, 'activas', 'este_mes', 'hoy'

    const styles = getStyles(isDarkMode);

    // Cargar tema
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const theme = await AsyncStorage.getItem('@theme');
                setIsDarkMode(theme === 'dark');
            } catch (error) {
                console.error('Error al cargar el tema:', error);
            }
        };
        loadTheme();
    }, []);

    // Cargar datos al enfocar la pantalla
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [id_isp])
    );

    const fetchData = async () => {
        setLoading(true);
        await fetchConfiguraciones();
        setLoading(false);
    };

    const fetchConfiguraciones = async () => {
        try {
            console.log('🔍 [ConfiguracionesListScreen] Obteniendo configuraciones del ISP:', id_isp);

            const response = await fetch('https://wellnet-rd.com:444/api/configuraciones-isp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_isp }),
            });

            const data = await response.json();
            console.log('📥 [ConfiguracionesListScreen] Configuraciones recibidas:', data.length);

            setConfiguraciones(data || []);
            setFilteredConfiguraciones(data || []);
        } catch (error) {
            console.error('❌ [ConfiguracionesListScreen] Error al obtener configuraciones:', error);
            Alert.alert('Error', 'No se pudieron cargar las configuraciones');
            setConfiguraciones([]);
            setFilteredConfiguraciones([]);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // Calcular estadísticas localmente
    useEffect(() => {
        if (configuraciones.length > 0) {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const today = now.toISOString().split('T')[0];

            // Contar routers únicos
            const routersUnicos = new Set(
                configuraciones
                    .filter(item => item.nombre_router)
                    .map(item => item.nombre_router)
            ).size;

            const configuracionesEsteMes = configuraciones.filter(item => {
                if (!item.fecha_creacion) return false;
                const itemDate = new Date(item.fecha_creacion);
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
            }).length;

            const configuracionesHoy = configuraciones.filter(item => {
                if (!item.fecha_creacion) return false;
                const itemDate = new Date(item.fecha_creacion).toISOString().split('T')[0];
                return itemDate === today;
            }).length;

            const pppoe = configuraciones.filter(item => item.usuario_pppoe && item.usuario_pppoe.trim() !== '').length;
            const simpleQueue = configuraciones.length - pppoe;

            // Calcular configuraciones por router
            const configPorRouter = {};
            configuraciones.forEach(item => {
                if (item.nombre_router) {
                    configPorRouter[item.nombre_router] = (configPorRouter[item.nombre_router] || 0) + 1;
                }
            });

            // Ordenar y obtener top routers
            // Si son 5 o menos, mostrar todos. Si son más, mostrar top 5
            const routersArray = Object.entries(configPorRouter)
                .sort((a, b) => b[1] - a[1]);

            const numToShow = routersArray.length <= 5 ? routersArray.length : 5;

            const topRouters = routersArray
                .slice(0, numToShow)
                .map(([nombre, count]) => ({
                    nombre,
                    count,
                    porcentaje: ((count / configuraciones.length) * 100).toFixed(1)
                }));

            setEstadisticas({
                totalConfiguraciones: configuraciones.length,
                routersUnicos,
                estadisticasTiempo: {
                    configuracionesEsteMes,
                    configuracionesHoy,
                },
                tipoConfig: {
                    pppoe,
                    simpleQueue,
                },
                topRouters,
            });
        } else {
            setEstadisticas(null);
        }
    }, [configuraciones]);

    // Aplicar filtros
    useEffect(() => {
        let filtered = [...configuraciones];

        // Filtro por período (desde tarjetas de estadísticas)
        if (periodoFiltro === 'este_mes') {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            filtered = filtered.filter(item => {
                if (!item.fecha_creacion) return false;
                const itemDate = new Date(item.fecha_creacion);
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
            });
        } else if (periodoFiltro === 'hoy') {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            filtered = filtered.filter(item => {
                if (!item.fecha_creacion) return false;
                const itemDate = new Date(item.fecha_creacion).toISOString().split('T')[0];
                return itemDate === today;
            });
        }

        // Filtro por tipo (desde tabs)
        if (tipoFiltro === 'pppoe') {
            filtered = filtered.filter(item => item.usuario_pppoe && item.usuario_pppoe.trim() !== '');
        } else if (tipoFiltro === 'simple_queue') {
            filtered = filtered.filter(item => !item.usuario_pppoe || item.usuario_pppoe.trim() === '');
        }

        // Filtro por búsqueda de texto
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(item => {
                const cliente = item.nombreCliente?.toLowerCase() || '';
                const ip = item.direccion_ip?.toLowerCase() || '';
                const router = item.nombre_router?.toLowerCase() || '';
                const usuarioPppoe = item.usuario_pppoe?.toLowerCase() || '';

                return cliente.includes(searchLower) ||
                       ip.includes(searchLower) ||
                       router.includes(searchLower) ||
                       usuarioPppoe.includes(searchLower);
            });
        }

        setFilteredConfiguraciones(filtered);
    }, [searchText, tipoFiltro, periodoFiltro, configuraciones]);

    const getTipoBadge = (item) => {
        if (item.usuario_pppoe && item.usuario_pppoe.trim() !== '') {
            return {
                text: 'PPPoE',
                color: '#8B5CF6',
                bgColor: isDarkMode ? '#8B5CF620' : '#EDE9FE',
            };
        }
        return {
            text: 'Simple Queue',
            color: '#3B82F6',
            bgColor: isDarkMode ? '#3B82F620' : '#DBEAFE',
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            // Convertir a formato de 12 horas
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // La hora '0' debe ser '12'
            const hoursFormatted = String(hours).padStart(2, '0');

            return `${day}/${month}/${year} ${hoursFormatted}:${minutes} ${ampm}`;
        } catch {
            return 'N/A';
        }
    };

    const handleVerDetalles = (configuracion) => {
        navigation.navigate('ConexionDetalles', {
            connectionId: configuracion.id_conexion,
        });
    };

    const handleEditarVelocidad = (configuracion) => {
        // Aquí podrías implementar edición de velocidad si tienes una pantalla dedicada
        Alert.alert(
            'Editar Velocidad',
            `Configuración para ${configuracion.nombreCliente}\n\nBajada: ${configuracion.bajada_limite} ${configuracion.unidad_bajada}\nSubida: ${configuracion.subida_limite} ${configuracion.unidad_subida}`,
            [{ text: 'OK' }]
        );
    };

    // Funciones para filtrar por estadísticas
    const handleFiltrarEsteMes = () => {
        if (periodoFiltro === 'este_mes') {
            setPeriodoFiltro(null);
        } else {
            setPeriodoFiltro('este_mes');
        }
    };

    const handleFiltrarHoy = () => {
        if (periodoFiltro === 'hoy') {
            setPeriodoFiltro(null);
        } else {
            setPeriodoFiltro('hoy');
        }
    };

    const renderHeader = useMemo(() => (
        <View style={styles.headerContainer}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#1F2937'} />
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>⚙️ Configuraciones</Text>
                <Text style={styles.subtitle}>Gestión de configuraciones de routers</Text>
            </View>

            {/* Estadísticas Cards */}
            {estadisticas && (
                <>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Icon name="router-wireless" size={24} color="#3B82F6" />
                            <Text style={styles.statValue}>{estadisticas.totalConfiguraciones || 0}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Icon name="server-network" size={24} color="#10B981" />
                            <Text style={styles.statValue}>
                                {estadisticas.routersUnicos || 0}
                            </Text>
                            <Text style={styles.statLabel}>Routers</Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.statCard,
                                periodoFiltro === 'este_mes' && styles.statCardActive
                            ]}
                            onPress={handleFiltrarEsteMes}
                            activeOpacity={0.7}
                        >
                            <Icon name="calendar-month" size={24} color="#F59E0B" />
                            <Text style={styles.statValue}>
                                {estadisticas.estadisticasTiempo?.configuracionesEsteMes || 0}
                            </Text>
                            <Text style={styles.statLabel}>Este Mes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.statCard,
                                periodoFiltro === 'hoy' && styles.statCardActive
                            ]}
                            onPress={handleFiltrarHoy}
                            activeOpacity={0.7}
                        >
                            <Icon name="calendar-today" size={24} color="#8B5CF6" />
                            <Text style={styles.statValue}>
                                {estadisticas.estadisticasTiempo?.configuracionesHoy || 0}
                            </Text>
                            <Text style={styles.statLabel}>Hoy</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Top Routers Section */}
                    {estadisticas.topRouters && estadisticas.topRouters.length > 0 && (
                        <View style={styles.topRoutersContainer}>
                            <View style={styles.topRoutersHeader}>
                                <Icon name="chart-bar" size={20} color="#3B82F6" />
                                <Text style={styles.topRoutersTitle}>Top Routers</Text>
                            </View>
                            {estadisticas.topRouters.map((router, index) => (
                                <View key={router.nombre} style={styles.routerRow}>
                                    <View style={styles.routerRank}>
                                        <Text style={styles.routerRankText}>{index + 1}</Text>
                                    </View>
                                    <View style={styles.routerInfo}>
                                        <Text style={styles.routerName}>{router.nombre}</Text>
                                        <View style={styles.routerStats}>
                                            <Text style={styles.routerCount}>
                                                {router.count} config{router.count !== 1 ? 's' : ''}
                                            </Text>
                                            <View style={styles.routerPercentageBar}>
                                                <View
                                                    style={[
                                                        styles.routerPercentageFill,
                                                        { width: `${router.porcentaje}%` }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.routerPercentage}>{router.porcentaje}%</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por cliente, IP, router..."
                    placeholderTextColor="#9CA3AF"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <Icon name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, tipoFiltro === 'todos' && styles.filterTabActive]}
                    onPress={() => setTipoFiltro('todos')}
                >
                    <Text style={[styles.filterText, tipoFiltro === 'todos' && styles.filterTextActive]}>
                        Todas ({configuraciones.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterTab, tipoFiltro === 'pppoe' && styles.filterTabActive]}
                    onPress={() => setTipoFiltro('pppoe')}
                >
                    <Text style={[styles.filterText, tipoFiltro === 'pppoe' && styles.filterTextActive]}>
                        PPPoE ({estadisticas?.tipoConfig?.pppoe || 0})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterTab, tipoFiltro === 'simple_queue' && styles.filterTabActive]}
                    onPress={() => setTipoFiltro('simple_queue')}
                >
                    <Text style={[styles.filterText, tipoFiltro === 'simple_queue' && styles.filterTextActive]}>
                        Simple Queue ({estadisticas?.tipoConfig?.simpleQueue || 0})
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    ), [isDarkMode, estadisticas, configuraciones, searchText, periodoFiltro, tipoFiltro, navigation]);

    const renderConfiguracionCard = ({ item }) => {
        const tipoBadge = getTipoBadge(item);

        return (
            <View style={styles.card}>
                {/* Header del Card */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <Icon name="router-wireless" size={20} color="#3B82F6" />
                        <Text style={styles.cardId}>{item.nombre_router || 'Router'}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: tipoBadge.bgColor }]}>
                        <Text style={[styles.badgeText, { color: tipoBadge.color }]}>
                            {tipoBadge.text}
                        </Text>
                    </View>
                </View>

                {/* Información del Cliente */}
                <View style={styles.cardRow}>
                    <Icon name="account" size={18} color="#6B7280" />
                    <View style={styles.cardRowContent}>
                        <Text style={styles.cardLabel}>Cliente</Text>
                        <Text style={styles.cardValue}>{item.nombreCliente || 'N/A'}</Text>
                    </View>
                </View>

                {/* IP Asignada */}
                <View style={styles.cardRow}>
                    <Icon name="ip-network" size={18} color="#6B7280" />
                    <View style={styles.cardRowContent}>
                        <Text style={styles.cardLabel}>Dirección IP</Text>
                        <Text style={styles.cardValue}>{item.direccion_ip || 'No asignada'}</Text>
                    </View>
                </View>

                {/* Usuario PPPoE (si aplica) */}
                {item.usuario_pppoe && (
                    <View style={styles.cardRow}>
                        <Icon name="account-key" size={18} color="#6B7280" />
                        <View style={styles.cardRowContent}>
                            <Text style={styles.cardLabel}>Usuario PPPoE</Text>
                            <Text style={styles.cardValue}>{item.usuario_pppoe}</Text>
                        </View>
                    </View>
                )}

                {/* Velocidades */}
                <View style={styles.speedContainer}>
                    <View style={styles.speedBox}>
                        <Icon name="download" size={16} color="#10B981" />
                        <Text style={styles.speedLabel}>Bajada</Text>
                        <Text style={styles.speedValue}>
                            {item.bajada_limite || 'N/A'} {item.unidad_bajada || ''}
                        </Text>
                    </View>
                    <View style={styles.speedBox}>
                        <Icon name="upload" size={16} color="#F59E0B" />
                        <Text style={styles.speedLabel}>Subida</Text>
                        <Text style={styles.speedValue}>
                            {item.subida_limite || 'N/A'} {item.unidad_subida || ''}
                        </Text>
                    </View>
                </View>

                {/* Estado */}
                <View style={styles.cardRow}>
                    <Icon name="check-circle" size={18} color={item.activo ? '#10B981' : '#EF4444'} />
                    <View style={styles.cardRowContent}>
                        <Text style={styles.cardLabel}>Estado</Text>
                        <Text style={[styles.cardValue, { color: item.activo ? '#10B981' : '#EF4444' }]}>
                            {item.activo ? 'Activa' : 'Inactiva'}
                        </Text>
                    </View>
                </View>

                {/* Fecha y Hora de Creación */}
                <View style={styles.cardRow}>
                    <Icon name="calendar-clock" size={18} color="#6B7280" />
                    <View style={styles.cardRowContent}>
                        <Text style={styles.cardLabel}>Fecha de Creación</Text>
                        <Text style={styles.cardValue}>{formatDate(item.fecha_creacion)}</Text>
                    </View>
                </View>

                {/* Botones de Acción */}
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        onPress={() => handleVerDetalles(item)}
                    >
                        <Icon name="eye" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Ver Conexión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonSecondary]}
                        onPress={() => handleEditarVelocidad(item)}
                    >
                        <Icon name="speedometer" size={16} color="#F59E0B" />
                        <Text style={[styles.actionButtonText, { color: '#F59E0B' }]}>Velocidad</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="router-wireless" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No hay configuraciones</Text>
            <Text style={styles.emptyStateText}>
                {searchText || tipoFiltro !== 'todos'
                    ? 'No se encontraron configuraciones con los filtros aplicados'
                    : 'Aún no se han registrado configuraciones para este ISP'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Cargando configuraciones...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredConfiguraciones}
                renderItem={renderConfiguracionCard}
                keyExtractor={(item) => item.id_configuracion?.toString() || Math.random().toString()}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3B82F6']}
                        tintColor="#3B82F6"
                    />
                }
            />
        </View>
    );
};

export default ConfiguracionesListScreen;
