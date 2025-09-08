import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './HistorialTransaccionesStyles';

const HistorialTransaccionesSimpleScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    
    // Estados de filtros
    const [filtros, setFiltros] = useState({
        estado: 'todas',
        gateway: 'todos',
        fecha_inicio: '2025-01-01',
        fecha_fin: '2025-01-18',
        monto_min: '',
        monto_max: ''
    });

    // Datos de transacciones de demostración
    const transaccionesDemo = [
        {
            id: 1,
            descripcion: 'Pago mensual ISP - Enero 2025',
            monto: 1500.00,
            estado: 'completed',
            gateway: 'stripe',
            fecha_intento: '2025-01-18T10:30:00Z',
            fecha_completado: '2025-01-18T10:30:15Z',
            gateway_transaction_id: 'pi_1234567890abcdef',
            usuario: 'Ana Martínez',
            metodo_pago: 'Visa **** 4242'
        },
        {
            id: 2,
            descripcion: 'Pago por servicios adicionales',
            monto: 850.00,
            estado: 'completed',
            gateway: 'paypal',
            fecha_intento: '2025-01-18T09:15:00Z',
            fecha_completado: '2025-01-18T09:15:12Z',
            gateway_transaction_id: 'PAYID-123456789',
            usuario: 'Carlos Rodríguez',
            metodo_pago: 'PayPal carlos@email.com'
        },
        {
            id: 3,
            descripcion: 'Pago mensual ISP - Enero 2025',
            monto: 1200.00,
            estado: 'failed',
            gateway: 'stripe',
            fecha_intento: '2025-01-18T08:45:00Z',
            fecha_completado: null,
            gateway_transaction_id: 'pi_failed_123456',
            usuario: 'María González',
            metodo_pago: 'Visa **** 1234',
            error_message: 'Tarjeta declinada por fondos insuficientes'
        },
        {
            id: 4,
            descripcion: 'Pago de instalación',
            monto: 2500.00,
            estado: 'completed',
            gateway: 'azul',
            fecha_intento: '2025-01-17T16:20:00Z',
            fecha_completado: '2025-01-17T16:20:45Z',
            gateway_transaction_id: 'AZ789012345',
            usuario: 'Luis Pérez',
            metodo_pago: 'Azul **** 5678'
        },
        {
            id: 5,
            descripcion: 'Pago mensual ISP - Enero 2025',
            monto: 1800.00,
            estado: 'pending',
            gateway: 'stripe',
            fecha_intento: '2025-01-17T14:30:00Z',
            fecha_completado: null,
            gateway_transaction_id: 'pi_pending_789012',
            usuario: 'Elena Jiménez',
            metodo_pago: 'Visa **** 9876'
        },
        {
            id: 6,
            descripcion: 'Pago por reconexión',
            monto: 750.00,
            estado: 'completed',
            gateway: 'cardnet',
            fecha_intento: '2025-01-17T11:15:00Z',
            fecha_completado: '2025-01-17T11:15:30Z',
            gateway_transaction_id: 'CN456789012',
            usuario: 'Roberto Silva',
            metodo_pago: 'CardNet **** 3456'
        },
        {
            id: 7,
            descripcion: 'Pago mensual ISP - Enero 2025',
            monto: 1350.00,
            estado: 'completed',
            gateway: 'paypal',
            fecha_intento: '2025-01-16T15:45:00Z',
            fecha_completado: '2025-01-16T15:45:18Z',
            gateway_transaction_id: 'PAYID-987654321',
            usuario: 'Carmen López',
            metodo_pago: 'PayPal carmen@email.com'
        },
        {
            id: 8,
            descripcion: 'Pago por servicios técnicos',
            monto: 950.00,
            estado: 'refunded',
            gateway: 'stripe',
            fecha_intento: '2025-01-16T10:00:00Z',
            fecha_completado: '2025-01-16T10:00:25Z',
            gateway_transaction_id: 'pi_refunded_345678',
            usuario: 'Diego Morales',
            metodo_pago: 'Visa **** 7890'
        }
    ];

    const totalTransacciones = transaccionesDemo.length;
    const transaccionesExitosas = transaccionesDemo.filter(t => t.estado === 'completed').length;
    const transaccionesFallidas = transaccionesDemo.filter(t => t.estado === 'failed').length;

    const onRefresh = async () => {
        setRefreshing(true);
        // Simular refresh
        setTimeout(() => {
            setRefreshing(false);
            Alert.alert('Actualizado', 'Historial actualizado con datos de demostración');
        }, 1000);
    };

    const showTransactionDetail = (transaction) => {
        setSelectedTransaction(transaction);
        setDetailModalVisible(true);
    };

    const exportarCSV = () => {
        Alert.alert(
            'Exportar CSV',
            `Se exportarían ${transaccionesDemo.length} transacciones.\n\nEsta es una función de demostración.`,
            [{ text: 'OK' }]
        );
    };

    const applyFilters = () => {
        setShowFilters(false);
        Alert.alert('Filtros', 'Filtros aplicados correctamente (Demo)');
    };

    const clearFilters = () => {
        setFiltros({
            estado: 'todas',
            gateway: 'todos',
            fecha_inicio: '2025-01-01',
            fecha_fin: '2025-01-18',
            monto_min: '',
            monto_max: ''
        });
        Alert.alert('Filtros', 'Filtros limpiados');
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
                        {transaction.descripcion}
                    </Text>
                    <Text style={styles.transactionDate}>
                        {formatDate(transaction.fecha_intento)}
                    </Text>
                    <Text style={styles.transactionUser}>
                        {transaction.usuario}
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
                                <Text style={styles.detailLabel}>Usuario:</Text>
                                <Text style={styles.detailValue}>{selectedTransaction.usuario}</Text>
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
                                <Text style={styles.detailLabel}>Método de Pago:</Text>
                                <Text style={styles.detailValue}>{selectedTransaction.metodo_pago}</Text>
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
                                <Text style={styles.detailValue}>{selectedTransaction.descripcion}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>ID Gateway:</Text>
                                <Text style={styles.detailValue}>{selectedTransaction.gateway_transaction_id}</Text>
                            </View>
                            
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
                    <Text style={styles.statNumber}>{transaccionesExitosas}</Text>
                    <Text style={styles.statLabel}>Exitosas</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{transaccionesFallidas}</Text>
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
            >
                <View style={styles.transactionsContainer}>
                    {transaccionesDemo.map(renderTransaction)}
                </View>
                
                {/* Mensaje de demostración */}
                <View style={styles.demoMessage}>
                    <Icon name="info-circle" size={16} color="#007AFF" />
                    <Text style={styles.demoMessageText}>
                        Historial de demostración con datos de prueba. 
                        Funciona sin necesidad de backend.
                    </Text>
                </View>
            </ScrollView>

            {/* Modales */}
            {renderFiltersModal()}
            {renderDetailModal()}
        </View>
    );
};

export default HistorialTransaccionesSimpleScreen;