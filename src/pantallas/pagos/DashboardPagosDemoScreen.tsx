import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './DashboardPagosStyles';

const { width } = Dimensions.get('window');

const DashboardPagosDemoScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    
    // Estados principales
    const [userIsp, setUserIsp] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    
    // Datos de demostración
    const [metricas, setMetricas] = useState({
        metricas_generales: {
            total_transacciones: 0,
            transacciones_exitosas: 0,
            transacciones_fallidas: 0,
            ingresos_totales: 0,
            ticket_promedio: 0,
            usuarios_unicos: 0,
            tasa_exito: 0
        },
        metricas_por_gateway: [],
        tendencia_diaria: [],
        top_usuarios: []
    });

    const chartConfig = {
        backgroundGradientFrom: isDarkMode ? '#1C1C1E' : '#FFFFFF',
        backgroundGradientTo: isDarkMode ? '#1C1C1E' : '#FFFFFF',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(26, 26, 26, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#007AFF',
        },
    };

    useEffect(() => {
        initializeScreen();
        loadMetricasDemo(); // Cargar datos inmediatamente
    }, []);

    useEffect(() => {
        loadMetricasDemo(); // Recargar cuando cambie el período
    }, [selectedPeriod]);

    const initializeScreen = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                setUserIsp(user.id_isp || 1);
            }
        } catch (error) {
            console.error('❌ Error inicializando pantalla:', error);
            Alert.alert('Error', 'No se pudo cargar la información del usuario');
        }
    };

    const loadMetricasDemo = async () => {
        try {
            setIsLoading(true);
            console.log('📊 [METRICS-DEMO] Cargando métricas de demostración...');
            
            // Simular un pequeño delay para mostrar loading
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Datos de demostración realistas
            const metricasDemo = {
                metricas_generales: {
                    total_transacciones: 1247,
                    transacciones_exitosas: 1189,
                    transacciones_fallidas: 58,
                    ingresos_totales: 1867500,
                    ticket_promedio: 1498.20,
                    usuarios_unicos: 892,
                    tasa_exito: 95.35
                },
                metricas_por_gateway: [
                    { gateway: 'stripe', ingresos: 1200000, transacciones: 800 },
                    { gateway: 'paypal', ingresos: 467500, transacciones: 312 },
                    { gateway: 'azul', ingresos: 150000, transacciones: 100 },
                    { gateway: 'cardnet', ingresos: 50000, transacciones: 35 }
                ],
                tendencia_diaria: [
                    { fecha: '2025-01-12', ingresos: 85000, transacciones: 67 },
                    { fecha: '2025-01-13', ingresos: 92000, transacciones: 73 },
                    { fecha: '2025-01-14', ingresos: 78000, transacciones: 61 },
                    { fecha: '2025-01-15', ingresos: 105000, transacciones: 84 },
                    { fecha: '2025-01-16', ingresos: 98000, transacciones: 79 },
                    { fecha: '2025-01-17', ingresos: 112000, transacciones: 91 },
                    { fecha: '2025-01-18', ingresos: 125000, transacciones: 98 }
                ],
                top_usuarios: [
                    { id_usuario: 1, nombre: 'Ana Martínez', total_transacciones: 12, total_ingresos: 18000 },
                    { id_usuario: 2, nombre: 'Carlos Rodríguez', total_transacciones: 8, total_ingresos: 15600 },
                    { id_usuario: 3, nombre: 'María González', total_transacciones: 15, total_ingresos: 14250 },
                    { id_usuario: 4, nombre: 'Luis Pérez', total_transacciones: 9, total_ingresos: 13500 },
                    { id_usuario: 5, nombre: 'Elena Jiménez', total_transacciones: 11, total_ingresos: 12900 }
                ]
            };
            
            setMetricas(metricasDemo);
            console.log('✅ [METRICS-DEMO] Métricas de demostración cargadas');
            
        } catch (error) {
            console.error('❌ [METRICS-DEMO] Error:', error);
            Alert.alert('Error', 'Error al cargar datos de demostración');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMetricasDemo();
        setRefreshing(false);
    };

    const formatCurrency = (amount) => {
        return `RD$ ${amount.toLocaleString()}`;
    };

    const renderPeriodSelector = () => {
        const periods = [
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mes' },
            { key: 'year', label: 'Año' }
        ];
        
        return (
            <View style={styles.periodSelector}>
                {periods.map((period) => (
                    <TouchableOpacity
                        key={period.key}
                        style={[
                            styles.periodButton,
                            selectedPeriod === period.key && styles.periodButtonActive
                        ]}
                        onPress={() => setSelectedPeriod(period.key)}
                    >
                        <Text style={[
                            styles.periodButtonText,
                            selectedPeriod === period.key && styles.periodButtonTextActive
                        ]}>
                            {period.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderMetricCard = (title, value, subtitle, icon, color) => (
        <View style={[styles.metricCard, { borderLeftColor: color }]}>
            <View style={styles.metricHeader}>
                <Icon name={icon} size={20} color={color} />
                <Text style={styles.metricTitle}>{title}</Text>
            </View>
            <Text style={styles.metricValue}>{value}</Text>
            {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
        </View>
    );

    const renderTendenciaChart = () => {
        const data = {
            labels: metricas.tendencia_diaria.map(item => {
                const date = new Date(item.fecha);
                return `${date.getDate()}/${date.getMonth() + 1}`;
            }),
            datasets: [{
                data: metricas.tendencia_diaria.map(item => item.ingresos / 1000), // Convertir a miles
                color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                strokeWidth: 2
            }]
        };

        return (
            <LineChart
                data={data}
                width={width - 60}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
            />
        );
    };

    const renderGatewayChart = () => {
        const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30'];
        const data = metricas.metricas_por_gateway.map((item, index) => ({
            name: item.gateway.charAt(0).toUpperCase() + item.gateway.slice(1),
            population: item.ingresos,
            color: colors[index % colors.length],
            legendFontColor: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            legendFontSize: 14
        }));

        return (
            <PieChart
                data={data}
                width={width - 60}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                style={styles.chart}
            />
        );
    };

    const renderTopUsuarios = () => {
        return (
            <View style={styles.topUsuariosContainer}>
                {metricas.top_usuarios.map((usuario, index) => (
                    <View key={usuario.id_usuario} style={styles.topUsuarioItem}>
                        <View style={styles.topUsuarioRank}>
                            <Text style={styles.topUsuarioRankText}>{index + 1}</Text>
                        </View>
                        <View style={styles.topUsuarioInfo}>
                            <Text style={styles.topUsuarioName}>{usuario.nombre}</Text>
                            <Text style={styles.topUsuarioDetail}>
                                {usuario.total_transacciones} transacciones
                            </Text>
                        </View>
                        <View style={styles.topUsuarioAmount}>
                            <Text style={styles.topUsuarioAmountText}>
                                {formatCurrency(usuario.total_ingresos)}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando dashboard...</Text>
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
                <Text style={styles.title}>Dashboard de Pagos (Demo)</Text>
                <TouchableOpacity onPress={() => navigation.navigate('HistorialTransacciones')}>
                    <Icon name="history" size={24} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Selector de período */}
                {renderPeriodSelector()}

                {/* Métricas principales */}
                <View style={styles.metricsContainer}>
                    {renderMetricCard(
                        'Total Transacciones',
                        metricas.metricas_generales.total_transacciones.toString(),
                        `${metricas.metricas_generales.transacciones_exitosas} exitosas`,
                        'credit-card',
                        '#007AFF'
                    )}
                    
                    {renderMetricCard(
                        'Ingresos Totales',
                        formatCurrency(metricas.metricas_generales.ingresos_totales),
                        `Ticket promedio: ${formatCurrency(metricas.metricas_generales.ticket_promedio)}`,
                        'money',
                        '#34C759'
                    )}
                    
                    {renderMetricCard(
                        'Tasa de Éxito',
                        `${metricas.metricas_generales.tasa_exito.toFixed(1)}%`,
                        `${metricas.metricas_generales.transacciones_fallidas} fallidas`,
                        'check-circle',
                        '#FF9500'
                    )}
                    
                    {renderMetricCard(
                        'Usuarios Únicos',
                        metricas.metricas_generales.usuarios_unicos.toString(),
                        'Usuarios que han pagado',
                        'users',
                        '#AF52DE'
                    )}
                </View>

                {/* Tendencia de ingresos */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Tendencia de Ingresos (Miles RD$)</Text>
                    {renderTendenciaChart()}
                </View>

                {/* Distribución por gateway */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Ingresos por Gateway</Text>
                    {renderGatewayChart()}
                </View>

                {/* Top usuarios */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Top Usuarios</Text>
                    {renderTopUsuarios()}
                </View>

                {/* Botones de acción */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.reportButton]}
                        onPress={() => Alert.alert('Demo', 'Función de reportes en desarrollo')}
                    >
                        <Icon name="file-text" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Generar Reporte</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.actionButton, styles.historyButton]}
                        onPress={() => navigation.navigate('HistorialTransacciones')}
                    >
                        <Icon name="history" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Ver Historial</Text>
                    </TouchableOpacity>
                </View>

                {/* Mensaje de demostración */}
                <View style={styles.demoMessage}>
                    <Icon name="info-circle" size={16} color="#007AFF" />
                    <Text style={styles.demoMessageText}>
                        Esta es una versión de demostración con datos de prueba. 
                        Los datos reales se cargarán cuando el backend esté disponible.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default DashboardPagosDemoScreen;