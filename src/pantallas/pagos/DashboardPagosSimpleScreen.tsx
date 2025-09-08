import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Alert,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './DashboardPagosStyles';

const { width } = Dimensions.get('window');

const DashboardPagosSimpleScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    
    // Datos estáticos de demostración
    const metricas = {
        metricas_generales: {
            total_transacciones: 1247,
            transacciones_exitosas: 1189,
            transacciones_fallidas: 58,
            ingresos_totales: 1867500,
            ticket_promedio: 1498.20,
            usuarios_unicos: 892,
            tasa_exito: 95.35
        },
        top_usuarios: [
            { id_usuario: 1, nombre: 'Ana Martínez', total_transacciones: 12, total_ingresos: 18000 },
            { id_usuario: 2, nombre: 'Carlos Rodríguez', total_transacciones: 8, total_ingresos: 15600 },
            { id_usuario: 3, nombre: 'María González', total_transacciones: 15, total_ingresos: 14250 },
            { id_usuario: 4, nombre: 'Luis Pérez', total_transacciones: 9, total_ingresos: 13500 },
            { id_usuario: 5, nombre: 'Elena Jiménez', total_transacciones: 11, total_ingresos: 12900 }
        ]
    };

    const onRefresh = async () => {
        setRefreshing(true);
        // Simular refresh
        setTimeout(() => {
            setRefreshing(false);
            Alert.alert('Actualizado', 'Dashboard actualizado con datos de demostración');
        }, 1000);
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

    const renderSimpleChart = () => {
        const chartData = [
            { day: 'Lun', amount: 85 },
            { day: 'Mar', amount: 92 },
            { day: 'Mié', amount: 78 },
            { day: 'Jue', amount: 105 },
            { day: 'Vie', amount: 98 },
            { day: 'Sáb', amount: 112 },
            { day: 'Dom', amount: 125 }
        ];

        const maxAmount = Math.max(...chartData.map(item => item.amount));

        return (
            <View style={styles.simpleChartContainer}>
                <View style={styles.simpleChartHeader}>
                    <Text style={styles.simpleChartTitle}>Tendencia Semanal (Miles RD$)</Text>
                </View>
                <View style={styles.simpleChart}>
                    {chartData.map((item, index) => (
                        <View key={index} style={styles.chartBar}>
                            <View 
                                style={[
                                    styles.chartBarFill, 
                                    { 
                                        height: `${(item.amount / maxAmount) * 100}%`,
                                        backgroundColor: '#34C759'
                                    }
                                ]} 
                            />
                            <Text style={styles.chartBarLabel}>{item.day}</Text>
                            <Text style={styles.chartBarValue}>{item.amount}K</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderGatewaySummary = () => {
        const gateways = [
            { name: 'Stripe', amount: 1200000, color: '#007AFF' },
            { name: 'PayPal', amount: 467500, color: '#34C759' },
            { name: 'Azul', amount: 150000, color: '#FF9500' },
            { name: 'CardNet', amount: 50000, color: '#FF3B30' }
        ];

        return (
            <View style={styles.gatewaySummaryContainer}>
                <Text style={styles.gatewaySummaryTitle}>Ingresos por Gateway</Text>
                {gateways.map((gateway, index) => (
                    <View key={index} style={styles.gatewayItem}>
                        <View style={[styles.gatewayColor, { backgroundColor: gateway.color }]} />
                        <Text style={styles.gatewayName}>{gateway.name}</Text>
                        <Text style={styles.gatewayAmount}>{formatCurrency(gateway.amount)}</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={styles.title}>Dashboard de Pagos</Text>
                <TouchableOpacity onPress={() => navigation.navigate('HistorialTransaccionesSimple')}>
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

                {/* Gráfico simple de tendencia */}
                <View style={styles.chartCard}>
                    {renderSimpleChart()}
                </View>

                {/* Resumen de gateways */}
                <View style={styles.chartCard}>
                    {renderGatewaySummary()}
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
                        onPress={() => navigation.navigate('HistorialTransaccionesSimple')}
                    >
                        <Icon name="history" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Ver Historial</Text>
                    </TouchableOpacity>
                </View>

                {/* Mensaje de demostración */}
                <View style={styles.demoMessage}>
                    <Icon name="info-circle" size={16} color="#007AFF" />
                    <Text style={styles.demoMessageText}>
                        Dashboard de demostración con datos de prueba. 
                        Funciona sin necesidad de backend.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default DashboardPagosSimpleScreen;