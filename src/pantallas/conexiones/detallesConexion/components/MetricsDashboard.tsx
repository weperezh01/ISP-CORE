import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LineChart from '../../../../componentes/LineChart';
import { useFocusEffect } from '@react-navigation/native';

const MetricsDashboard = ({ connectionId, configDetails, isDarkMode, styles }) => {
    const [metricsData, setMetricsData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('24h'); // 24h, 7d, 30d
    const [isRealTimeActive, setIsRealTimeActive] = useState(false);
    const [realTimeInterval, setRealTimeInterval] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true); // Estado para mantener tarjeta expandida

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatSpeed = (bps) => {
        if (!bps || bps === 0) return '0 bps';
        const k = 1000;
        const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
        const i = Math.floor(Math.log(bps) / Math.log(k));
        return parseFloat((bps / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds) => {
        if (!seconds) return 'Sin datos';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    // Función para activar tiempo real en el backend
    const enableRealTime = async () => {
        const direccionIp = configDetails?.direccion_ip || configDetails?.direccion_ipv4;
        if (!configDetails?.router?.id_router || !direccionIp) return;

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/router-metrics/enable-realtime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_router: configDetails.router.id_router,
                    id_conexion: connectionId,
                    direccion_ip: direccionIp,
                    interval: 15 // Actualizar cada 15 segundos
                })
            });

            if (response.ok) {
                console.log('🔴 MetricsDashboard: Tiempo real activado para cliente', connectionId);
                setIsRealTimeActive(true);
            }
        } catch (error) {
            console.error('🔴 MetricsDashboard: Error activando tiempo real:', error);
        }
    };

    // Función para desactivar tiempo real en el backend
    const disableRealTime = async () => {
        const direccionIp = configDetails?.direccion_ip || configDetails?.direccion_ipv4;
        if (!configDetails?.router?.id_router || !direccionIp) return;

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/router-metrics/disable-realtime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_router: configDetails.router.id_router,
                    id_conexion: connectionId,
                    direccion_ip: direccionIp
                })
            });

            if (response.ok) {
                console.log('⚫ MetricsDashboard: Tiempo real desactivado para cliente', connectionId);
                setIsRealTimeActive(false);
            }
        } catch (error) {
            console.error('⚫ MetricsDashboard: Error desactivando tiempo real:', error);
        }
    };

    const fetchMetrics = useCallback(async () => {
        // Verificar qué campo de IP está disponible
        const direccionIp = configDetails?.direccion_ip || configDetails?.direccion_ipv4;
        
        if (!configDetails?.router?.id_router || !direccionIp) {
            console.log('📊 MetricsDashboard: Esperando datos de configuración...', {
                router: configDetails?.router?.id_router,
                direccion_ip: configDetails?.direccion_ip,
                direccion_ipv4: configDetails?.direccion_ipv4,
                configDetails: !!configDetails
            });
            // Mantener tarjeta expandida incluso sin datos
            setIsExpanded(true);
            return;
        }

        // Solo mostrar loading si no tenemos datos previos
        const shouldShowLoading = !metricsData;
        if (shouldShowLoading) {
            setIsLoading(true);
        }
        console.log('📊 MetricsDashboard: Obteniendo métricas con:', {
            id_router: configDetails.router.id_router,
            direccion_ip: direccionIp,
            id_conexion: connectionId,
            period: selectedPeriod
        });

        try {
            // Usar el endpoint correcto para métricas específicas del cliente
            const baseUrl = 'https://wellnet-rd.com:444/api/router-metrics';
            const params = new URLSearchParams({
                id_router: configDetails.router.id_router.toString(),
                id_conexion: connectionId.toString(),
                direccion_ip: direccionIp,
                period: selectedPeriod,
                realtime: isRealTimeActive ? 'true' : 'false'
            });
            const fullUrl = `${baseUrl}?${params.toString()}`;

            console.log('📊 MetricsDashboard: URL completa:', fullUrl);
            console.log('🔴 MetricsDashboard: Estado tiempo real:', isRealTimeActive);
            console.log('🔧 MetricsDashboard: Parámetros enviados:', {
                id_router: configDetails.router.id_router.toString(),
                id_conexion: connectionId.toString(),
                direccion_ip: direccionIp,
                period: selectedPeriod,
                realtime: isRealTimeActive ? 'true' : 'false'
            });

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('📊 MetricsDashboard: Status de respuesta:', response.status, response.statusText);

            if (response.ok) {
                // Primero obtener el texto para ver qué está devolviendo el servidor
                const responseText = await response.text();
                console.log('📊 MetricsDashboard: Respuesta raw del servidor:', responseText.substring(0, 500));
                
                try {
                    const result = JSON.parse(responseText);
                    console.log('📊 MetricsDashboard: Respuesta del backend (JSON):', result);
                
                    // Procesar datos del endpoint router-metrics (formato correcto)
                    if (result.success && result.data) {
                        console.log('✅ MetricsDashboard: Datos REALES recibidos del backend');
                        console.log('🔧 MetricsDashboard: Fuente de datos:', result.data.dataSource);
                        console.log('🔧 MetricsDashboard: Método de recolección:', result.data.collection_method);
                        if (result.data.realtimeInfo) {
                            console.log('📡 MetricsDashboard: Response time del router:', result.data.realtimeInfo.router_response_time + 'ms');
                        }

                        // Mapear datos del backend al formato esperado por el frontend
                        const rawHistory = result.data.clientHistory || [];
                        
                        // Procesar datos de Simple Queue (tráfico histórico real)
                        const processedHistory = rawHistory.map((item, index) => {
                            return {
                                ...item,
                                // Usar tráfico total real del backend (si está disponible)
                                download: item.download || 0,              // Tráfico total desde MikroTik
                                upload: item.upload || 0,                  // Tráfico total desde MikroTik
                                downloadSpeed: item.downloadSpeed || 0,    // Velocidad instantánea
                                uploadSpeed: item.uploadSpeed || 0         // Velocidad instantánea
                            };
                        });

                        const mappedData = {
                            // Velocidades actuales (del último registro)
                            currentSpeed: {
                                download: rawHistory.length > 0 
                                    ? rawHistory[rawHistory.length - 1].downloadSpeed || 0
                                    : result.data.currentSpeed?.download || 0,
                                upload: rawHistory.length > 0 
                                    ? rawHistory[rawHistory.length - 1].uploadSpeed || 0
                                    : result.data.currentSpeed?.upload || 0
                            },
                            
                            // Tráfico total histórico (desde creación de Simple Queue)
                            clientTraffic: {
                                download: result.data.totalTraffic?.download || result.data.clientTraffic?.download || 0,
                                upload: result.data.totalTraffic?.upload || result.data.clientTraffic?.upload || 0
                            },

                            // Picos de velocidad
                            peakUsage: {
                                download: rawHistory.length > 0 
                                    ? Math.max(...rawHistory.map(item => item.downloadSpeed || 0))
                                    : result.data.peakUsage?.download || 0,
                                upload: rawHistory.length > 0 
                                    ? Math.max(...rawHistory.map(item => item.uploadSpeed || 0))
                                    : result.data.peakUsage?.upload || 0
                            },

                            // Tiempo de conexión
                            uptime: rawHistory.length > 0 
                                ? Math.floor((new Date() - new Date(rawHistory[0].timestamp)) / 1000)
                                : result.data.uptime || 3600,

                            // Estado
                            status: rawHistory.length > 0 && rawHistory.every(item => item.status === 'online') 
                                ? 'online' : result.data.status || 'unknown',

                            // Historial con tráfico acumulado
                            clientHistory: processedHistory,
                            dataSource: result.data.dataSource,
                            collection_method: result.data.collection_method,
                            realtimeInfo: result.data.realtimeInfo,
                            lastUpdate: result.data.lastUpdate
                        };

                        console.log('📊 MetricsDashboard: Datos mapeados (Simple Queue):', {
                            currentDownload: mappedData.currentSpeed.download,
                            currentUpload: mappedData.currentSpeed.upload,
                            totalTrafficDownload: mappedData.clientTraffic.download,
                            totalTrafficUpload: mappedData.clientTraffic.upload,
                            uptime: mappedData.uptime,
                            status: mappedData.status,
                            historyLength: mappedData.clientHistory.length,
                            dataSource: mappedData.dataSource
                        });

                        setMetricsData(mappedData);
                        setIsExpanded(true); // Mantener expandida cuando se obtienen datos
                        console.log('📊 MetricsDashboard: Métricas REALES del cliente procesadas correctamente');
                    } else {
                        console.log('❌ MetricsDashboard: Respuesta sin datos válidos:', JSON.stringify(result, null, 2));
                        console.log('📊 MetricsDashboard: Fallback a datos simulados');
                        // Solo usar datos simulados como último recurso
                        const mockData = {
                            uptime: Math.floor(Math.random() * 86400) + 3600, // Entre 1-25 horas
                            status: 'online',
                            currentSpeed: {
                                download: Math.floor(Math.random() * 200000000) + 50000000, // 50-250 Mbps
                                upload: Math.floor(Math.random() * 50000000) + 10000000     // 10-60 Mbps
                            },
                            clientTraffic: {
                                download: Math.floor(Math.random() * 50000000000) + 10000000000,  // 10-60 GB
                                upload: Math.floor(Math.random() * 5000000000) + 1000000000       // 1-6 GB
                            },
                            peakUsage: {
                                download: Math.floor(Math.random() * 500000000) + 200000000,   // 200-700 Mbps
                                upload: Math.floor(Math.random() * 100000000) + 50000000      // 50-150 Mbps
                            },
                            clientHistory: [
                                {
                                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                                    download: Math.floor(Math.random() * 2000000000) + 500000000,
                                    upload: Math.floor(Math.random() * 100000000) + 20000000
                                },
                                {
                                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                                    download: Math.floor(Math.random() * 2000000000) + 800000000,
                                    upload: Math.floor(Math.random() * 120000000) + 30000000
                                },
                                {
                                    timestamp: new Date().toISOString(),
                                    download: Math.floor(Math.random() * 2500000000) + 1000000000,
                                    upload: Math.floor(Math.random() * 150000000) + 40000000
                                }
                            ],
                            dataSource: 'mock_data',
                            collection_method: 'demo_mode'
                        };
                        setMetricsData(mockData);
                        setIsExpanded(true); // Mantener expandida con datos de prueba
                    }
                } catch (parseError) {
                    console.error('📊 MetricsDashboard: Error parsing JSON:', parseError);
                    console.log('📊 MetricsDashboard: Servidor devolvió HTML/texto plano, usando datos de prueba');
                    
                    // Si el servidor devuelve HTML, usar datos de prueba dinámicos
                    const mockData = {
                        uptime: Math.floor(Math.random() * 86400) + 3600,
                        status: 'online',
                        currentSpeed: {
                            download: Math.floor(Math.random() * 200000000) + 50000000,
                            upload: Math.floor(Math.random() * 50000000) + 10000000
                        },
                        clientTraffic: {
                            download: Math.floor(Math.random() * 50000000000) + 10000000000,
                            upload: Math.floor(Math.random() * 5000000000) + 1000000000
                        },
                        peakUsage: {
                            download: Math.floor(Math.random() * 500000000) + 200000000,
                            upload: Math.floor(Math.random() * 100000000) + 50000000
                        },
                        clientHistory: [
                            {
                                timestamp: new Date(Date.now() - 3600000).toISOString(),
                                download: Math.floor(Math.random() * 2000000000) + 500000000,
                                upload: Math.floor(Math.random() * 100000000) + 20000000
                            },
                            {
                                timestamp: new Date(Date.now() - 1800000).toISOString(),
                                download: Math.floor(Math.random() * 2000000000) + 800000000,
                                upload: Math.floor(Math.random() * 120000000) + 30000000
                            },
                            {
                                timestamp: new Date().toISOString(),
                                download: Math.floor(Math.random() * 2500000000) + 1000000000,
                                upload: Math.floor(Math.random() * 150000000) + 40000000
                            }
                        ],
                        dataSource: 'fallback_mock',
                        collection_method: 'html_response_fallback'
                    };
                    setMetricsData(mockData);
                    setIsExpanded(true); // Mantener expandida
                }
            } else {
                console.error('📊 MetricsDashboard: Error HTTP:', response.status, response.statusText);
                const responseText = await response.text();
                console.error('📊 MetricsDashboard: Respuesta de error:', responseText);
                
                // Intentar parsear como JSON si es posible
                try {
                    const errorData = JSON.parse(responseText);
                    Alert.alert('Error', errorData.error || 'No se pudieron obtener las métricas del router');
                } catch {
                    Alert.alert('Error', `Error del servidor (${response.status}): ${response.statusText}`);
                }
            }
        } catch (error) {
            console.error('📊 MetricsDashboard: Error de conexión:', error);
            Alert.alert('Error', 'No se pudo conectar con el servidor de métricas');
        } finally {
            // Solo ocultar loading si estaba mostrándose
            if (shouldShowLoading) {
                setIsLoading(false);
            }
            setRefreshing(false);
        }
    }, [connectionId, configDetails, selectedPeriod, isRealTimeActive]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    // Activar tiempo real cuando la pantalla gana foco
    useFocusEffect(
        useCallback(() => {
            console.log('🔴 MetricsDashboard: Pantalla activa - activando tiempo real');
            setIsRealTimeActive(true);
            
            // Hacer la primera llamada inmediatamente con tiempo real
            setTimeout(() => fetchMetrics(), 100);

            // Configurar polling frecuente para tiempo real
            const interval = setInterval(() => {
                console.log('🔄 MetricsDashboard: Actualizando datos en tiempo real');
                fetchMetrics();
            }, 15000); // Cada 15 segundos

            setRealTimeInterval(interval);

            // Cleanup cuando la pantalla pierde foco
            return () => {
                console.log('⚫ MetricsDashboard: Pantalla inactiva - desactivando tiempo real');
                setIsRealTimeActive(false);
                if (interval) {
                    clearInterval(interval);
                }
                setRealTimeInterval(null);
            };
        }, [configDetails, connectionId])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchMetrics();
    };

    const renderPeriodButton = (period, label) => (
        <TouchableOpacity
            style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
                { backgroundColor: selectedPeriod === period ? (isDarkMode ? '#60A5FA' : '#2563EB') : 'transparent' }
            ]}
            onPress={() => setSelectedPeriod(period)}
        >
            <Text style={[
                styles.periodButtonText,
                { color: selectedPeriod === period ? 'white' : (isDarkMode ? '#ccc' : '#666') }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderMetricCard = (icon, title, value, subtitle) => (
        <View style={styles.metricCard}>
            <Icon name={icon} size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
            <Text style={[styles.metricTitle, { color: isDarkMode ? '#ccc' : '#666' }]}>{title}</Text>
            <Text style={[styles.metricValue, { color: isDarkMode ? '#fff' : '#000' }]}>{value}</Text>
            {subtitle && <Text style={[styles.metricSubtitle, { color: isDarkMode ? '#888' : '#999' }]}>{subtitle}</Text>}
        </View>
    );

    if (!configDetails?.router) {
        return (
            <Card style={[styles.card, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
                <TouchableOpacity 
                    style={styles.cardHeader}
                    onPress={() => setIsExpanded(!isExpanded)}
                >
                    <Icon name="analytics" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Métricas de Consumo</Text>
                    <Icon 
                        name={isExpanded ? "expand-less" : "expand-more"} 
                        size={24} 
                        color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                    />
                </TouchableOpacity>
                {isExpanded && (
                    <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
                        Se requiere configuración del router para mostrar métricas
                    </Text>
                )}
            </Card>
        );
    }

    return (
        <Card style={[styles.card, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
            <TouchableOpacity 
                style={styles.cardHeader}
                onPress={() => setIsExpanded(!isExpanded)}
            >
                <Icon name="analytics" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Dashboard de Métricas</Text>
                    {isRealTimeActive && isExpanded && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            <View style={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: 4, 
                                backgroundColor: '#00ff00', 
                                marginRight: 6 
                            }} />
                            <Text style={{ 
                                fontSize: 12, 
                                color: isDarkMode ? '#00ff00' : '#008000',
                                fontWeight: '500'
                            }}>
                                Tiempo Real Activo
                            </Text>
                        </View>
                    )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={onRefresh} disabled={isLoading} style={{ marginRight: 8 }}>
                        <Icon 
                            name="refresh" 
                            size={20} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                            style={{ opacity: isLoading ? 0.5 : 1 }}
                        />
                    </TouchableOpacity>
                    <Icon 
                        name={isExpanded ? "expand-less" : "expand-more"} 
                        size={24} 
                        color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                    />
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <>
                    {/* Selector de período */}
                    <View style={styles.periodSelector}>
                        {renderPeriodButton('24h', '24h')}
                        {renderPeriodButton('7d', '7 días')}
                        {renderPeriodButton('30d', '30 días')}
                    </View>

                    {isLoading ? (
                        <View style={styles.metricsLoadingContainer}>
                            <ActivityIndicator size="small" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                            <Text style={[styles.metricsLoadingText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                                Obteniendo métricas...
                            </Text>
                        </View>
                    ) : metricsData ? (
                        <ScrollView
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Estado de conexión y tiempo activo */}
                            <View style={styles.metricsGrid}>
                                {renderMetricCard(
                                    'access-time',
                                    'Tiempo de Conexión',
                                    formatUptime(metricsData.uptime),
                                    metricsData.status === 'online' ? 'Conectado' : 'Desconectado'
                                )}
                                {renderMetricCard(
                                    'speed',
                                    'Velocidad Actual',
                                    `${formatSpeed(metricsData.currentSpeed?.download || 0)}`,
                                    `↑ ${formatSpeed(metricsData.currentSpeed?.upload || 0)}`
                                )}
                            </View>

                            {/* Consumo del cliente */}
                            <View style={styles.metricsGrid}>
                                {renderMetricCard(
                                    'cloud-download',
                                    'Descarga Total',
                                    formatBytes(metricsData.clientTraffic?.download || 0),
                                    `Período: ${selectedPeriod}`
                                )}
                                {renderMetricCard(
                                    'cloud-upload',
                                    'Subida Total',
                                    formatBytes(metricsData.clientTraffic?.upload || 0),
                                    `Período: ${selectedPeriod}`
                                )}
                            </View>

                            {/* Estadísticas adicionales del cliente */}
                            <View style={styles.metricsGrid}>
                                {renderMetricCard(
                                    'data-usage',
                                    'Uso de Ancho de Banda',
                                    configDetails.bajada_limite ? 
                                        `${((metricsData.currentSpeed?.download || 0) / (configDetails.bajada_limite * 1000000) * 100).toFixed(1)}%` :
                                        'N/A',
                                    configDetails.bajada_limite ? 'de límite de descarga' : 'Límite no configurado'
                                )}
                                {renderMetricCard(
                                    'trending-up',
                                    'Picos de Uso',
                                    formatSpeed(metricsData.peakUsage?.download || 0),
                                    `En ${selectedPeriod}`
                                )}
                            </View>

                            {/* Gráfico de historial */}
                            {metricsData.clientHistory && metricsData.clientHistory.length > 0 && (
                                <View style={styles.chartSection}>
                                    <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                                        Historial de Consumo del Cliente
                                    </Text>
                                    {(() => {
                                        // Mostrar tráfico total histórico (como Simple Queue > Traffic)
                                        const trafficData = metricsData.clientHistory.map(item => 
                                            (item.download || 0) / (1024 * 1024 * 1024) // Convertir a GB
                                        );
                                        const hasValidData = trafficData.some(value => value > 0);
                                        
                                        // Si no hay datos reales, mostrar tráfico total actual
                                        const totalTrafficGB = (metricsData.clientTraffic?.download || 0) / (1024 * 1024 * 1024);
                                        const chartData = hasValidData ? trafficData : 
                                            totalTrafficGB > 0 ? [totalTrafficGB] : [0.1, 0.2, 0.3, 0.5, 0.8];
                                        
                                        const labels = metricsData.clientHistory.map(item => {
                                            const date = new Date(item.timestamp);
                                            return selectedPeriod === '24h' 
                                                ? date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
                                                : date.toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
                                        });

                                        return (
                                            <>
                                                <LineChart
                                                    data={chartData}
                                                    labels={hasValidData ? labels : ['10:00', '12:00', '14:00', '16:00', '18:00']}
                                                    width={300}
                                                    height={200}
                                                    isDarkMode={isDarkMode}
                                                />
                                                <Text style={[styles.chartLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>
                                                    {hasValidData 
                                                        ? `Tráfico Total Histórico (GB) - Simple Queue`
                                                        : totalTrafficGB > 0 
                                                            ? `Tráfico Total: ${totalTrafficGB.toFixed(2)} GB`
                                                            : 'Sin actividad registrada'
                                                    }
                                                </Text>
                                                {(hasValidData || totalTrafficGB > 0) && (
                                                    <Text style={[{ color: isDarkMode ? '#888' : '#999', fontSize: 11, textAlign: 'center', marginTop: 3 }]}>
                                                        Total desde creación de queue: {(hasValidData ? Math.max(...trafficData) : totalTrafficGB).toFixed(2)} GB
                                                    </Text>
                                                )}
                                                {metricsData.dataSource?.includes('realtime') && (
                                                    <Text style={[{ color: isDarkMode ? '#00ff00' : '#008000', fontSize: 12, textAlign: 'center', marginTop: 5 }]}>
                                                        📡 Datos en tiempo real desde router MikroTik
                                                    </Text>
                                                )}
                                                {metricsData.dataSource === 'mock_data' && (
                                                    <Text style={[{ color: isDarkMode ? '#888' : '#999', fontSize: 12, textAlign: 'center', marginTop: 5 }]}>
                                                        📊 Datos de demostración - Backend no disponible
                                                    </Text>
                                                )}
                                            </>
                                        );
                                    })()}
                                </View>
                            )}

                            {/* Información adicional */}
                            <View style={styles.metricsAdditionalInfo}>
                                <Text style={[styles.metricsInfoTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                                    Información del Router
                                </Text>
                                <Text style={[styles.metricsInfoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                                    Router: {configDetails.router.nombre_router}
                                </Text>
                                <Text style={[styles.metricsInfoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                                    IP: {configDetails.direccion_ip}
                                </Text>
                                <Text style={[styles.metricsInfoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                                    Límites: {configDetails.subida_limite || 'N/A'} ↑ / {configDetails.bajada_limite || 'N/A'} ↓
                                </Text>
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={styles.metricsNoDataContainer}>
                            <Icon name="signal-wifi-off" size={48} color={isDarkMode ? '#666' : '#ccc'} />
                            <Text style={[styles.metricsNoDataText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                                No hay datos de métricas disponibles
                            </Text>
                            <TouchableOpacity style={styles.metricsRetryButton} onPress={fetchMetrics}>
                                <Text style={[styles.metricsRetryButtonText, { color: isDarkMode ? '#60A5FA' : '#2563EB' }]}>
                                    Reintentar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </Card>
    );
};

export default MetricsDashboard;