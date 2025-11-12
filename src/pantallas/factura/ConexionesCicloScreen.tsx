import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../conexiones/ConexionesScreenStyles';
import ConnectionItemModern from '../conexiones/components/ConnectionItemModern';
import { formatCurrency } from '../conexiones/utils/formatCurrency';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { ESTADOS_CONEXION } from '../../constants/estadosConexion';

const ConexionesCicloScreen = ({ route, navigation }) => {
    const { id_ciclo } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [connectionList, setConnectionList] = useState([]);
    const [filteredConnectionList, setFilteredConnectionList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [connectionCount, setConnectionCount] = useState(0);
    const [filteredConnectionCount, setFilteredConnectionCount] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState('Total'); // 'Total', 'Activas', 'Suspendidas', 'Inactivas'
    const [isSearchVisible, setSearchVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState(new Set());
    const [estadisticas, setEstadisticas] = useState({
        totalConexiones: 0,
        conexionesActivas: 0,
        conexionesSuspendidas: 0,
        conexionesInactivas: 0,
    });

    // Fetch connections for this cycle
    const fetchConexionesCiclo = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post(
                'https://wellnet-rd.com:444/api/conexiones/listar-por-ciclo',
                { id_ciclo }
            );

            if (response.data.success && response.data.data) {
                const connections = response.data.data;
                const sortedConnections = connections.sort((a, b) => b.id_conexion - a.id_conexion);
                setConnectionList(sortedConnections);
                setFilteredConnectionList(sortedConnections);
                setConnectionCount(sortedConnections.length);
                setFilteredConnectionCount(sortedConnections.length);

                // Calcular estadísticas
                const stats = {
                    totalConexiones: sortedConnections.length,
                    conexionesActivas: sortedConnections.filter(c => c.id_estado_conexion === ESTADOS_CONEXION.ACTIVA).length,
                    conexionesSuspendidas: sortedConnections.filter(c => c.id_estado_conexion === ESTADOS_CONEXION.SUSPENDIDA).length,
                    conexionesInactivas: sortedConnections.filter(c =>
                        c.id_estado_conexion !== ESTADOS_CONEXION.ACTIVA &&
                        c.id_estado_conexion !== ESTADOS_CONEXION.SUSPENDIDA
                    ).length,
                };
                setEstadisticas(stats);
            }
        } catch (error) {
            console.error('Error al cargar conexiones del ciclo:', error);
            Alert.alert('Error', 'No se pudo cargar la lista de conexiones del ciclo.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id_ciclo) {
            fetchConexionesCiclo();
        }
    }, [id_ciclo]);

    // Aplicar filtros
    useEffect(() => {
        if (connectionList.length === 0) return;

        let filtered = [...connectionList];

        // Filtro por estado
        if (selectedFilter === 'Activas') {
            filtered = filtered.filter(c => c.id_estado_conexion === ESTADOS_CONEXION.ACTIVA);
        } else if (selectedFilter === 'Suspendidas') {
            filtered = filtered.filter(c => c.id_estado_conexion === ESTADOS_CONEXION.SUSPENDIDA);
        } else if (selectedFilter === 'Inactivas') {
            filtered = filtered.filter(c =>
                c.id_estado_conexion !== ESTADOS_CONEXION.ACTIVA &&
                c.id_estado_conexion !== ESTADOS_CONEXION.SUSPENDIDA
            );
        }

        // Filtro de búsqueda
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(connection => {
                const direccion = connection.direccion?.toLowerCase() || '';
                const nombreCliente = connection.cliente?.nombre?.toLowerCase() || '';
                const apellidoCliente = connection.cliente?.apellido?.toLowerCase() || '';
                const ipAddress = connection.router_direcciones_ip?.[0]?.ip_address?.toLowerCase() || '';
                const nombreRouter = connection.router?.nombre?.toLowerCase() || '';

                return (
                    direccion.includes(query) ||
                    nombreCliente.includes(query) ||
                    apellidoCliente.includes(query) ||
                    ipAddress.includes(query) ||
                    nombreRouter.includes(query)
                );
            });
        }

        setFilteredConnectionList(filtered);
        setFilteredConnectionCount(filtered.length);
    }, [connectionList, selectedFilter, searchQuery]);

    // Cálculo de suma total
    const totalMonthlySum = filteredConnectionList.reduce((acc, c) => {
        const precio = c.servicio?.precio_servicio ? parseFloat(c.servicio.precio_servicio) : 0;
        return acc + precio;
    }, 0);

    const toggleItemExpanded = (connectionId) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(connectionId)) {
                newSet.delete(connectionId);
            } else {
                newSet.add(connectionId);
            }
            return newSet;
        });
    };

    const toggleAllItems = () => {
        if (expandedItems.size === 0) {
            const allIds = new Set(filteredConnectionList.map(item => item.id_conexion));
            setExpandedItems(allIds);
        } else {
            setExpandedItems(new Set());
        }
    };

    const handleConnectionPress = (connection) => {
        navigation.navigate('ConexionDetalles', {
            connectionId: connection.id_conexion,
            id_cliente: connection.cliente?.id_cliente || connection.id_cliente
        });
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchVisible(false);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ padding: 8 }}
                    >
                        <Icon name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Conexiones del Ciclo</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#2563EB'} />
                    <Text style={styles.loadingText}>Cargando conexiones...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header con botón de regreso */}
            <View style={styles.headerContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ padding: 8, marginRight: 8 }}
                    >
                        <Icon name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.headerTitle, { fontSize: 16 }]}>
                            Conexiones del Ciclo
                        </Text>
                        <Text style={[styles.headerTitle, { fontSize: 12, opacity: 0.7 }]}>
                            {filteredConnectionCount} conexiones
                        </Text>
                    </View>
                    <View style={{
                        backgroundColor: isDarkMode ? '#065F46' : '#ECFDF5',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6
                    }}>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: isDarkMode ? '#10B981' : '#047857'
                        }}>
                            {formatCurrency(totalMonthlySum)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.contentContainer}>
                {/* Filtros de estado */}
                <View style={{
                    flexDirection: 'row',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 8
                }}>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: selectedFilter === 'Total'
                                ? (isDarkMode ? '#2563EB' : '#3B82F6')
                                : (isDarkMode ? '#374151' : '#F3F4F6'),
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            alignItems: 'center'
                        }}
                        onPress={() => setSelectedFilter('Total')}
                    >
                        <Text style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: selectedFilter === 'Total' ? '#FFFFFF' : (isDarkMode ? '#D1D5DB' : '#374151')
                        }}>
                            Total
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: selectedFilter === 'Total' ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#1F2937')
                        }}>
                            {estadisticas.totalConexiones}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: selectedFilter === 'Activas'
                                ? '#10B981'
                                : (isDarkMode ? '#374151' : '#F3F4F6'),
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            alignItems: 'center'
                        }}
                        onPress={() => setSelectedFilter('Activas')}
                    >
                        <Text style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: selectedFilter === 'Activas' ? '#FFFFFF' : (isDarkMode ? '#D1D5DB' : '#374151')
                        }}>
                            Activas
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: selectedFilter === 'Activas' ? '#FFFFFF' : '#10B981'
                        }}>
                            {estadisticas.conexionesActivas}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: selectedFilter === 'Suspendidas'
                                ? '#F59E0B'
                                : (isDarkMode ? '#374151' : '#F3F4F6'),
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            alignItems: 'center'
                        }}
                        onPress={() => setSelectedFilter('Suspendidas')}
                    >
                        <Text style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: selectedFilter === 'Suspendidas' ? '#FFFFFF' : (isDarkMode ? '#D1D5DB' : '#374151')
                        }}>
                            Suspendidas
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: selectedFilter === 'Suspendidas' ? '#FFFFFF' : '#F59E0B'
                        }}>
                            {estadisticas.conexionesSuspendidas}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: selectedFilter === 'Inactivas'
                                ? '#6B7280'
                                : (isDarkMode ? '#374151' : '#F3F4F6'),
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            alignItems: 'center'
                        }}
                        onPress={() => setSelectedFilter('Inactivas')}
                    >
                        <Text style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: selectedFilter === 'Inactivas' ? '#FFFFFF' : (isDarkMode ? '#D1D5DB' : '#374151')
                        }}>
                            Inactivas
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: selectedFilter === 'Inactivas' ? '#FFFFFF' : '#6B7280'
                        }}>
                            {estadisticas.conexionesInactivas}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Barra de búsqueda */}
                <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8
                    }}>
                        <Icon name="search" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <TextInput
                            style={{
                                flex: 1,
                                marginLeft: 8,
                                fontSize: 14,
                                color: isDarkMode ? '#FFFFFF' : '#1F2937'
                            }}
                            placeholder="Buscar por dirección, cliente, IP..."
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery !== '' && (
                            <TouchableOpacity onPress={clearSearch}>
                                <Icon name="close" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Botón expandir/colapsar */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    marginBottom: 8
                }}>
                    <Text style={{
                        fontSize: 12,
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        fontWeight: '600'
                    }}>
                        {selectedFilter}: {filteredConnectionCount} conexiones
                    </Text>
                    <TouchableOpacity
                        onPress={toggleAllItems}
                        style={{
                            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        <Icon
                            name={expandedItems.size === 0 ? 'unfold-more' : 'unfold-less'}
                            size={16}
                            color={isDarkMode ? '#D1D5DB' : '#374151'}
                        />
                        <Text style={{
                            fontSize: 12,
                            color: isDarkMode ? '#D1D5DB' : '#374151',
                            fontWeight: '600'
                        }}>
                            {expandedItems.size === 0 ? 'Expandir' : 'Colapsar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Lista de conexiones */}
                {filteredConnectionList.length > 0 ? (
                    <FlatList
                        data={filteredConnectionList}
                        keyExtractor={(item) => item.id_conexion.toString()}
                        renderItem={({ item }) => (
                            <ConnectionItemModern
                                item={item}
                                styles={styles}
                                navigation={navigation}
                                onPress={handleConnectionPress}
                                realtimeData={null}
                                isExpanded={expandedItems.has(item.id_conexion)}
                                onToggleExpanded={() => toggleItemExpanded(item.id_conexion)}
                            />
                        )}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={30}
                        windowSize={15}
                        initialNumToRender={25}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🔌</Text>
                        <Text style={styles.emptyTitle}>
                            No se encontraron conexiones
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery !== ''
                                ? 'Intenta ajustar la búsqueda'
                                : `No hay conexiones ${selectedFilter.toLowerCase()} en este ciclo`
                            }
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default ConexionesCicloScreen;
