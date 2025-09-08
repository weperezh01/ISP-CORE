import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './HistorialTransaccionesStyles';

const HistorialTransaccionesScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    
    // Estados principales
    const [userId, setUserId] = useState(null);
    const [userIsp, setUserIsp] = useState(null);
    const [transacciones, setTransacciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Estados de filtros
    const [filtros, setFiltros] = useState({
        estado: 'todas', // todas, completed, failed, pending
        gateway: 'todos', // todos, stripe, paypal, azul, cardnet
        fecha_inicio: '',
        fecha_fin: '',
        monto_min: '',
        monto_max: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    
    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalTransacciones, setTotalTransacciones] = useState(0);
    const ITEMS_PER_PAGE = 20;
    
    // Estados de modal
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    useEffect(() => {
        initializeScreen();
    }, []);

    useEffect(() => {
        if (userId) {
            resetAndLoadTransacciones();
        }
    }, [userId, filtros]);

    const initializeScreen = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                setUserId(user.id);
                setUserIsp(user.id_isp);
                
                // Configurar fechas por defecto (último mes)
                const fechaFin = new Date();
                const fechaInicio = new Date();
                fechaInicio.setMonth(fechaInicio.getMonth() - 1);
                
                setFiltros(prev => ({
                    ...prev,
                    fecha_inicio: fechaInicio.toISOString().split('T')[0],
                    fecha_fin: fechaFin.toISOString().split('T')[0]
                }));
            }
        } catch (error) {
            console.error('❌ Error inicializando pantalla:', error);
            Alert.alert('Error', 'No se pudo cargar la información del usuario');
        }
    };

    const resetAndLoadTransacciones = () => {
        setCurrentPage(0);
        setTransacciones([]);
        setHasMore(true);
        loadTransacciones(0, true);
    };

    const loadTransacciones = async (page = 0, reset = false) => {
        if (!userId) return;
        
        try {
            if (reset) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            
            console.log('📊 [TRANSACTIONS] Cargando transacciones - página:', page);
            
            const payload = {
                id_usuario: userId,
                limite: ITEMS_PER_PAGE,
                offset: page * ITEMS_PER_PAGE,
                ...filtros
            };
            
            // Convertir "todas" y "todos" a valores esperados por el backend
            if (filtros.estado === 'todas') {
                delete payload.estado;
            }
            if (filtros.gateway === 'todos') {
                delete payload.gateway;
            }
            
            console.log('📤 [TRANSACTIONS] Payload:', JSON.stringify(payload, null, 2));
            
            const response = await fetch('https://wellnet-rd.com:444/api/pagos/historial-transacciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                const newTransacciones = data.data.transacciones || [];
                
                if (reset) {
                    setTransacciones(newTransacciones);
                } else {
                    setTransacciones(prev => [...prev, ...newTransacciones]);
                }
                
                setTotalTransacciones(data.data.total || 0);
                setHasMore(newTransacciones.length === ITEMS_PER_PAGE);
                
                console.log('✅ [TRANSACTIONS] Transacciones cargadas:', newTransacciones.length);
            } else {
                console.warn('⚠️ [TRANSACTIONS] Error en respuesta:', data);
                if (reset) {
                    setTransacciones([]);
                    setTotalTransacciones(0);
                }
            }
        } catch (error) {
            console.error('❌ [TRANSACTIONS] Error:', error);
            if (reset) {
                Alert.alert('Error', 'Error de conexión al cargar transacciones');
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const loadMoreTransacciones = () => {
        if (!isLoadingMore && hasMore) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            loadTransacciones(nextPage);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await resetAndLoadTransacciones();
        setRefreshing(false);
    };

    const showTransactionDetail = (transaction) => {
        setSelectedTransaction(transaction);
        setDetailModalVisible(true);
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'completed':
                return '#34C759';
            case 'failed':
                return '#FF3B30';
            case 'pending':
                return '#FF9500';
            case 'processing':
                return '#007AFF';
            case 'cancelled':
                return '#8E8E93';
            case 'refunded':
                return '#AF52DE';
            default:
                return '#8E8E93';
        }
    };

    const getStatusText = (estado) => {
        switch (estado) {
            case 'completed':
                return 'Completado';
            case 'failed':
                return 'Fallido';
            case 'pending':
                return 'Pendiente';
            case 'processing':
                return 'Procesando';
            case 'cancelled':
                return 'Cancelado';
            case 'refunded':
                return 'Reembolsado';
            default:
                return estado;
        }
    };

    const getGatewayIcon = (gateway) => {
        switch (gateway) {
            case 'stripe':
                return 'credit-card';
            case 'paypal':
                return 'paypal';
            case 'azul':
                return 'credit-card-alt';
            case 'cardnet':
                return 'credit-card';
            default:
                return 'credit-card';
        }
    };

    const formatCurrency = (amount) => {
        return `RD$ ${amount.toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const applyFilters = () => {
        setShowFilters(false);
        resetAndLoadTransacciones();
    };

    const clearFilters = () => {
        const fechaFin = new Date();
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        
        setFiltros({
            estado: 'todas',
            gateway: 'todos',
            fecha_inicio: fechaInicio.toISOString().split('T')[0],
            fecha_fin: fechaFin.toISOString().split('T')[0],
            monto_min: '',
            monto_max: ''
        });
    };

    const exportarCSV = async () => {
        try {
            console.log('📄 [EXPORT] Iniciando exportación CSV...');
            
            const payload = {
                id_isp: userIsp,
                ...filtros
            };
            
            if (filtros.estado === 'todas') {
                delete payload.estado;
            }
            if (filtros.gateway === 'todos') {
                delete payload.gateway;
            }
            
            const response = await fetch('https://wellnet-rd.com:444/api/pagos/exportar-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                Alert.alert(
                    'Exportación exitosa',
                    `Se exportaron ${data.data.total_registros} transacciones. El archivo CSV se ha generado.`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', data.message || 'No se pudo exportar el archivo');
            }
        } catch (error) {
            console.error('❌ [EXPORT] Error:', error);
            Alert.alert('Error', 'Error de conexión al exportar');
        }
    };

    const renderFiltersModal = () => (
        <Modal
            visible={showFilters}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowFilters(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.filtersModal}>
                    <View style={styles.filtersHeader}>
                        <Text style={styles.filtersTitle}>Filtros</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Icon name="times" size={20} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.filtersContent}>
                        {/* Estado */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Estado</Text>
                            <View style={styles.filterOptions}>
                                {['todas', 'completed', 'failed', 'pending', 'processing'].map(estado => (
                                    <TouchableOpacity
                                        key={estado}
                                        style={[
                                            styles.filterOption,
                                            filtros.estado === estado && styles.filterOptionActive
                                        ]}
                                        onPress={() => setFiltros(prev => ({ ...prev, estado }))}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            filtros.estado === estado && styles.filterOptionTextActive
                                        ]}>
                                            {estado === 'todas' ? 'Todas' : getStatusText(estado)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        {/* Gateway */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Gateway</Text>
                            <View style={styles.filterOptions}>
                                {['todos', 'stripe', 'paypal', 'azul', 'cardnet'].map(gateway => (
                                    <TouchableOpacity
                                        key={gateway}
                                        style={[
                                            styles.filterOption,
                                            filtros.gateway === gateway && styles.filterOptionActive
                                        ]}
                                        onPress={() => setFiltros(prev => ({ ...prev, gateway }))}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            filtros.gateway === gateway && styles.filterOptionTextActive
                                        ]}>
                                            {gateway === 'todos' ? 'Todos' : gateway.charAt(0).toUpperCase() + gateway.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        {/* Rango de fechas */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Rango de fechas</Text>
                            <View style={styles.dateInputs}>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="Fecha inicio (YYYY-MM-DD)"
                                    placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                    value={filtros.fecha_inicio}
                                    onChangeText={(text) => setFiltros(prev => ({ ...prev, fecha_inicio: text }))}
                                />
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="Fecha fin (YYYY-MM-DD)"
                                    placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                    value={filtros.fecha_fin}
                                    onChangeText={(text) => setFiltros(prev => ({ ...prev, fecha_fin: text }))}
                                />
                            </View>
                        </View>
                        
                        {/* Rango de montos */}
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Rango de montos</Text>
                            <View style={styles.dateInputs}>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="Monto mínimo"
                                    placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                    value={filtros.monto_min}
                                    onChangeText={(text) => setFiltros(prev => ({ ...prev, monto_min: text }))}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="Monto máximo"
                                    placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                    value={filtros.monto_max}
                                    onChangeText={(text) => setFiltros(prev => ({ ...prev, monto_max: text }))}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </ScrollView>
                    
                    <View style={styles.filtersActions}>
                        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                            <Text style={styles.clearButtonText}>Limpiar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                            <Text style={styles.applyButtonText}>Aplicar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderTransaction = (transaction) => (
        <TouchableOpacity
            key={transaction.id}
            style={styles.transactionCard}
            onPress={() => showTransactionDetail(transaction)}
        >
            <View style={styles.transactionHeader}>
                <View style={styles.transactionIcon}>
                    <Icon 
                        name={getGatewayIcon(transaction.gateway)} 
                        size={20} 
                        color={getStatusColor(transaction.estado)} 
                    />
                </View>
                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                        {transaction.descripcion || 'Pago de servicio'}
                    </Text>
                    <Text style={styles.transactionDate}>
                        {formatDate(transaction.fecha_intento)}
                    </Text>
                </View>
                <View style={styles.transactionAmount}>
                    <Text style={styles.transactionAmountText}>
                        {formatCurrency(transaction.monto)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.estado) }]}>
                        <Text style={styles.statusText}>{getStatusText(transaction.estado)}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.transactionFooter}>
                <Text style={styles.transactionGateway}>
                    {transaction.gateway.charAt(0).toUpperCase() + transaction.gateway.slice(1)}
                </Text>
                <Text style={styles.transactionId}>
                    ID: {transaction.id}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderDetailModal = () => {
        if (!selectedTransaction) return null;
        
        return (
            <Modal
                visible={detailModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.detailModal}>
                        <View style={styles.detailHeader}>
                            <Text style={styles.detailTitle}>Detalle de Transacción</Text>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                <Icon name="times" size={20} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.detailContent}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>ID Transacción:</Text>
                                <Text style={styles.detailValue}>{selectedTransaction.id}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Monto:</Text>
                                <Text style={styles.detailValue}>{formatCurrency(selectedTransaction.monto)}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Estado:</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTransaction.estado) }]}>
                                    <Text style={styles.statusText}>{getStatusText(selectedTransaction.estado)}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Gateway:</Text>
                                <Text style={styles.detailValue}>
                                    {selectedTransaction.gateway.charAt(0).toUpperCase() + selectedTransaction.gateway.slice(1)}
                                </Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Fecha intento:</Text>
                                <Text style={styles.detailValue}>{formatDate(selectedTransaction.fecha_intento)}</Text>
                            </View>
                            
                            {selectedTransaction.fecha_completado && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Fecha completado:</Text>
                                    <Text style={styles.detailValue}>{formatDate(selectedTransaction.fecha_completado)}</Text>
                                </View>
                            )}
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Descripción:</Text>
                                <Text style={styles.detailValue}>{selectedTransaction.descripcion || 'Sin descripción'}</Text>
                            </View>
                            
                            {selectedTransaction.gateway_transaction_id && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>ID Gateway:</Text>
                                    <Text style={styles.detailValue}>{selectedTransaction.gateway_transaction_id}</Text>
                                </View>
                            )}
                            
                            {selectedTransaction.error_message && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Error:</Text>
                                    <Text style={[styles.detailValue, { color: '#FF3B30' }]}>
                                        {selectedTransaction.error_message}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando transacciones...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={styles.title}>Historial de Transacciones</Text>
                <TouchableOpacity onPress={exportarCSV}>
                    <Icon name="download" size={24} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                </TouchableOpacity>
            </View>

            {/* Estadísticas */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{totalTransacciones}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{transacciones.filter(t => t.estado === 'completed').length}</Text>
                    <Text style={styles.statLabel}>Exitosas</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{transacciones.filter(t => t.estado === 'failed').length}</Text>
                    <Text style={styles.statLabel}>Fallidas</Text>
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
                    <Icon name="filter" size={16} color="#007AFF" />
                    <Text style={styles.filterButtonText}>Filtros</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de transacciones */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const paddingToBottom = 20;
                    
                    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                        loadMoreTransacciones();
                    }
                }}
                scrollEventThrottle={400}
            >
                {transacciones.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="receipt" size={64} color="#8E8E93" />
                        <Text style={styles.emptyText}>No hay transacciones</Text>
                        <Text style={styles.emptySubtext}>
                            No se encontraron transacciones con los filtros aplicados
                        </Text>
                    </View>
                ) : (
                    <View style={styles.transactionsContainer}>
                        {transacciones.map(renderTransaction)}
                        
                        {isLoadingMore && (
                            <View style={styles.loadingMoreContainer}>
                                <ActivityIndicator size="small" color="#007AFF" />
                                <Text style={styles.loadingMoreText}>Cargando más...</Text>
                            </View>
                        )}
                        
                        {!hasMore && transacciones.length > 0 && (
                            <Text style={styles.endText}>No hay más transacciones</Text>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Modales */}
            {renderFiltersModal()}
            {renderDetailModal()}
        </View>
    );
};

export default HistorialTransaccionesScreen;