import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';

const IspTransactionHistoryScreen = ({ navigation, route }) => {
    const { isDarkMode } = useTheme();
    const { width: screenWidth } = Dimensions.get('window');
    
    // Estados
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [userToken, setUserToken] = useState('');
    const [ispId, setIspId] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('30'); // 30, 90, 180, 365 días
    const [totalAmount, setTotalAmount] = useState(0);
    const [chartData, setChartData] = useState(null);

    // Cargar datos del usuario desde AsyncStorage
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                if (jsonValue) {
                    const userData = JSON.parse(jsonValue);
                    setUserToken(userData.token || '');
                    setIspId(userData.isp_id || await AsyncStorage.getItem('@selectedIspId'));
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };
        loadUserData();
    }, []);

    // Cargar historial de transacciones
    const loadTransactionHistory = async () => {
        if (!userToken || !ispId) return;

        try {
            setLoading(true);
            console.log('🔄 Cargando historial de transacciones...');
            
            const response = await fetch('https://wellnet-rd.com:444/api/billing/transaction-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    isp_id: ispId,
                    period_days: parseInt(selectedPeriod),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions || []);
                setTotalAmount(data.total_amount || 0);
                
                // Procesar datos para el gráfico
                if (data.chart_data) {
                    setChartData({
                        labels: data.chart_data.labels,
                        datasets: [{
                            data: data.chart_data.amounts,
                            strokeWidth: 2,
                        }]
                    });
                }
            } else {
                console.log('⚠️  Error al cargar transacciones, usando datos demo');
                loadDemoData();
            }
        } catch (error) {
            console.error('Error loading transaction history:', error);
            loadDemoData();
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Datos demo
    const loadDemoData = () => {
        const demoTransactions = [
            {
                id: 1,
                fecha: '2024-01-15',
                descripcion: 'Pago de suscripción mensual',
                monto: -2500.00,
                tipo: 'salida',
                estado: 'completado',
                metodo_pago: 'tarjeta_credito',
                invoice_id: 'INV-2024-001',
            },
            {
                id: 2,
                fecha: '2024-01-10',
                descripcion: 'Facturación de cliente - Plan Premium',
                monto: 1200.00,
                tipo: 'entrada',
                estado: 'completado',
                metodo_pago: 'transferencia',
                cliente: 'Juan Pérez',
            },
            {
                id: 3,
                fecha: '2024-01-08',
                descripcion: 'Pago de servicio contabilidad',
                monto: -800.00,
                tipo: 'salida',
                estado: 'completado',
                metodo_pago: 'paypal',
                invoice_id: 'INV-2024-002',
            },
            {
                id: 4,
                fecha: '2024-01-05',
                descripcion: 'Facturación de cliente - Plan Básico',
                monto: 600.00,
                tipo: 'entrada',
                estado: 'completado',
                metodo_pago: 'efectivo',
                cliente: 'María García',
            },
            {
                id: 5,
                fecha: '2024-01-03',
                descripcion: 'Reembolso por servicio cancelado',
                monto: -350.00,
                tipo: 'salida',
                estado: 'procesando',
                metodo_pago: 'tarjeta_credito',
                cliente: 'Carlos López',
            },
        ];
        
        setTransactions(demoTransactions);
        setTotalAmount(demoTransactions.reduce((sum, t) => sum + t.monto, 0));
        
        // Datos demo para el gráfico
        setChartData({
            labels: ['Ene 1', 'Ene 5', 'Ene 8', 'Ene 10', 'Ene 15'],
            datasets: [{
                data: [0, 600, 250, 1450, -1050],
                strokeWidth: 2,
            }]
        });
    };

    useFocusEffect(
        React.useCallback(() => {
            if (userToken && ispId) {
                loadTransactionHistory();
            }
        }, [userToken, ispId, selectedPeriod])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadTransactionHistory();
    };

    const getTransactionIcon = (tipo) => {
        return tipo === 'entrada' ? 'arrow-downward' : 'arrow-upward';
    };

    const getTransactionColor = (tipo) => {
        return tipo === 'entrada' ? '#10B981' : '#EF4444';
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'completado': return '#10B981';
            case 'procesando': return '#F59E0B';
            case 'fallido': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusText = (estado) => {
        switch (estado) {
            case 'completado': return 'Completado';
            case 'procesando': return 'Procesando';
            case 'fallido': return 'Fallido';
            default: return 'Desconocido';
        }
    };

    const getPaymentMethodText = (metodo) => {
        switch (metodo) {
            case 'tarjeta_credito': return 'Tarjeta de Crédito';
            case 'transferencia': return 'Transferencia';
            case 'paypal': return 'PayPal';
            case 'efectivo': return 'Efectivo';
            default: return 'Otro';
        }
    };

    const formatAmount = (amount) => {
        const sign = amount >= 0 ? '+' : '';
        return `${sign}$${Math.abs(amount).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-DO', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const styles = getStyles(isDarkMode);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                <Text style={styles.loadingText}>Cargando historial de transacciones...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Historial de Transacciones</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[isDarkMode ? '#60A5FA' : '#2563EB']}
                    />
                }
            >
                {/* Resumen */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Text style={styles.summaryTitle}>Resumen del Período</Text>
                        <View style={styles.periodSelector}>
                            {['30', '90', '180', '365'].map((period) => (
                                <TouchableOpacity
                                    key={period}
                                    style={[
                                        styles.periodButton,
                                        selectedPeriod === period && styles.periodButtonActive
                                    ]}
                                    onPress={() => setSelectedPeriod(period)}
                                >
                                    <Text style={[
                                        styles.periodButtonText,
                                        selectedPeriod === period && styles.periodButtonTextActive
                                    ]}>
                                        {period}d
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    
                    <View style={styles.totalAmountContainer}>
                        <Text style={styles.totalAmountLabel}>Balance Total</Text>
                        <Text style={[
                            styles.totalAmount,
                            { color: totalAmount >= 0 ? '#10B981' : '#EF4444' }
                        ]}>
                            {formatAmount(totalAmount)}
                        </Text>
                    </View>
                </View>

                {/* Gráfico */}
                {chartData && (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Tendencia de Transacciones</Text>
                        <LineChart
                            data={chartData}
                            width={screenWidth - 40}
                            height={220}
                            chartConfig={{
                                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                backgroundGradientFrom: isDarkMode ? '#1F2937' : '#FFFFFF',
                                backgroundGradientTo: isDarkMode ? '#1F2937' : '#FFFFFF',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16,
                                },
                                propsForDots: {
                                    r: '6',
                                    strokeWidth: '2',
                                    stroke: '#3B82F6',
                                },
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </View>
                )}

                {/* Lista de Transacciones */}
                <View style={styles.transactionsCard}>
                    <Text style={styles.transactionsTitle}>Transacciones Recientes</Text>
                    
                    {transactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="account-balance-wallet" size={48} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
                            <Text style={styles.emptyStateText}>No hay transacciones registradas</Text>
                        </View>
                    ) : (
                        transactions.map((transaction) => (
                            <View key={transaction.id} style={styles.transactionItem}>
                                <View style={styles.transactionIcon}>
                                    <Icon
                                        name={getTransactionIcon(transaction.tipo)}
                                        size={20}
                                        color={getTransactionColor(transaction.tipo)}
                                    />
                                </View>
                                
                                <View style={styles.transactionDetails}>
                                    <View style={styles.transactionHeader}>
                                        <Text style={styles.transactionDescription}>
                                            {transaction.descripcion}
                                        </Text>
                                        <Text style={[
                                            styles.transactionAmount,
                                            { color: getTransactionColor(transaction.tipo) }
                                        ]}>
                                            {formatAmount(transaction.monto)}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.transactionMeta}>
                                        <Text style={styles.transactionDate}>
                                            {formatDate(transaction.fecha)}
                                        </Text>
                                        <Text style={styles.transactionMethod}>
                                            {getPaymentMethodText(transaction.metodo_pago)}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.transactionFooter}>
                                        {transaction.cliente && (
                                            <Text style={styles.transactionClient}>
                                                Cliente: {transaction.cliente}
                                            </Text>
                                        )}
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: getStatusColor(transaction.estado) + '20' }
                                        ]}>
                                            <Text style={[
                                                styles.statusText,
                                                { color: getStatusColor(transaction.estado) }
                                            ]}>
                                                {getStatusText(transaction.estado)}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    {transaction.invoice_id && (
                                        <TouchableOpacity
                                            style={styles.invoiceButton}
                                            onPress={() => {
                                                // Navegar a detalles de factura
                                                navigation.navigate('InvoiceDetailsScreen', {
                                                    invoiceId: transaction.invoice_id
                                                });
                                            }}
                                        >
                                            <Icon name="description" size={16} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                                            <Text style={styles.invoiceButtonText}>
                                                Ver Factura: {transaction.invoice_id}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const getStyles = (isDarkMode) => ({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: isDarkMode ? '#FFFFFF' : '#111827',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    scrollView: {
        flex: 1,
    },
    summaryCard: {
        margin: 16,
        padding: 20,
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: isDarkMode ? '#FFFFFF' : '#111827',
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
        borderRadius: 8,
        padding: 2,
    },
    periodButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    periodButtonActive: {
        backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
    },
    periodButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: isDarkMode ? '#D1D5DB' : '#6B7280',
    },
    periodButtonTextActive: {
        color: '#FFFFFF',
    },
    totalAmountContainer: {
        alignItems: 'center',
    },
    totalAmountLabel: {
        fontSize: 14,
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: '700',
    },
    chartCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? '#FFFFFF' : '#111827',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
    },
    transactionsCard: {
        margin: 16,
        padding: 20,
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    transactionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: isDarkMode ? '#FFFFFF' : '#111827',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: isDarkMode ? '#6B7280' : '#9CA3AF',
        textAlign: 'center',
    },
    transactionItem: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB',
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    transactionDescription: {
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? '#FFFFFF' : '#111827',
        flex: 1,
        marginRight: 8,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    transactionMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    transactionDate: {
        fontSize: 14,
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    transactionMethod: {
        fontSize: 14,
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    transactionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    transactionClient: {
        fontSize: 14,
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    invoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    invoiceButtonText: {
        fontSize: 14,
        color: isDarkMode ? '#60A5FA' : '#2563EB',
        marginLeft: 4,
    },
});

export default IspTransactionHistoryScreen;