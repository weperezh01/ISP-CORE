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

const DashboardPagosScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    
    // Estados principales
    const [userIsp, setUserIsp] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month'); // month, week, year
    
    // Estados de métricas
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
    }, []);

    useEffect(() => {
        if (userIsp) {
            loadMetricas();
        }
    }, [userIsp, selectedPeriod]);

    const initializeScreen = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                setUserIsp(user.id_isp);
            }
        } catch (error) {
            console.error('❌ Error inicializando pantalla:', error);
            Alert.alert('Error', 'No se pudo cargar la información del usuario');
        }
    };

    const loadMetricas = async () => {
        if (!userIsp) return;
        
        try {
            setIsLoading(true);
            console.log('📊 [METRICS] Cargando métricas para ISP:', userIsp);
            
            const fechas = getPeriodDates(selectedPeriod);
            
            const response = await fetch('https://wellnet-rd.com:444/api/pagos/dashboard-metricas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_isp: userIsp,
                    fecha_inicio: fechas.inicio,
                    fecha_fin: fechas.fin
                }),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Calcular tasa de éxito
                const tasaExito = data.data.metricas_generales.total_transacciones > 0 
                    ? (data.data.metricas_generales.transacciones_exitosas / data.data.metricas_generales.total_transacciones) * 100
                    : 0;
                
                setMetricas({
                    ...data.data,
                    metricas_generales: {
                        ...data.data.metricas_generales,
                        tasa_exito: tasaExito
                    }
                });
                
                console.log('✅ [METRICS] Métricas cargadas exitosamente');
            } else {
                console.warn('⚠️ [METRICS] Error en respuesta:', data);
                Alert.alert('Error', 'No se pudieron cargar las métricas');
            }
        } catch (error) {
            console.error('❌ [METRICS] Error:', error);
            Alert.alert('Error', 'Error de conexión al cargar métricas');
        } finally {
            setIsLoading(false);
        }
    };

    const getPeriodDates = (period) => {
        const now = new Date();
        const inicio = new Date();
        
        switch (period) {
            case 'week':
                inicio.setDate(now.getDate() - 7);
                break;
            case 'month':
                inicio.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                inicio.setFullYear(now.getFullYear() - 1);
                break;
            default:
                inicio.setMonth(now.getMonth() - 1);
        }
        
        return {
            inicio: inicio.toISOString().split('T')[0],
            fin: now.toISOString().split('T')[0]
        };
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMetricas();
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
        if (!metricas.tendencia_diaria || metricas.tendencia_diaria.length === 0) {
            return (
                <View style={styles.noDataContainer}>
                    <Icon name="line-chart" size={48} color="#8E8E93" />
                    <Text style={styles.noDataText}>No hay datos de tendencia</Text>
                </View>
            );
        }

        const data = {
            labels: metricas.tendencia_diaria.map(item => {
                const date = new Date(item.fecha);
                return `${date.getDate()}/${date.getMonth() + 1}`;
            }),
            datasets: [{
                data: metricas.tendencia_diaria.map(item => item.ingresos || 0),
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
        if (!metricas.metricas_por_gateway || metricas.metricas_por_gateway.length === 0) {
            return (
                <View style={styles.noDataContainer}>
                    <Icon name="pie-chart" size={48} color="#8E8E93" />
                    <Text style={styles.noDataText}>No hay datos por gateway</Text>
                </View>
            );
        }

        const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE'];
        const data = metricas.metricas_por_gateway.map((item, index) => ({
            name: item.gateway.charAt(0).toUpperCase() + item.gateway.slice(1),
            population: item.ingresos || 0,
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
        if (!metricas.top_usuarios || metricas.top_usuarios.length === 0) {
            return (
                <View style={styles.noDataContainer}>
                    <Icon name="users" size={48} color="#8E8E93" />
                    <Text style={styles.noDataText}>No hay datos de usuarios</Text>
                </View>
            );
        }

        return (
            <View style={styles.topUsuariosContainer}>
                {metricas.top_usuarios.slice(0, 5).map((usuario, index) => (
                    <View key={usuario.id_usuario} style={styles.topUsuarioItem}>
                        <View style={styles.topUsuarioRank}>
                            <Text style={styles.topUsuarioRankText}>{index + 1}</Text>
                        </View>
                        <View style={styles.topUsuarioInfo}>
                            <Text style={styles.topUsuarioName}>{usuario.nombre || 'Usuario'}</Text>
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
                <Text style={styles.title}>Dashboard de Pagos</Text>
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
                    <Text style={styles.chartTitle}>Tendencia de Ingresos</Text>
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
                        onPress={() => navigation.navigate('ReportePagos')}
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
            </ScrollView>
        </View>
    );
};

export default DashboardPagosScreen;