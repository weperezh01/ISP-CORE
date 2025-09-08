import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../../ThemeContext';
import RealTimeTrafficChart from './components/RealTimeTrafficChart';

interface InterfaceDetailsScreenRouteParams {
    interfaceDetails: any;
    trafficData: { upload_bps: number; download_bps: number } | undefined;
    routerId: string;
    id_usuario: string;
}

const InterfaceDetailsScreen = () => {
    const route = useRoute();
    const { interfaceDetails: initialInterfaceDetails, trafficData: initialTrafficData, routerId, id_usuario } = route.params as InterfaceDetailsScreenRouteParams;
    const { isDarkMode } = useTheme();

    // State for real-time data
    const [interfaceDetails, setInterfaceDetails] = useState(initialInterfaceDetails);
    const [trafficData, setTrafficData] = useState(initialTrafficData || { upload_bps: 0, download_bps: 0 });
    const [isLoadingTraffic, setIsLoadingTraffic] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isPollingEnabled, setIsPollingEnabled] = useState(true);
    const [performanceMetrics, setPerformanceMetrics] = useState({ 
        tx_packets_per_sec: 0, 
        rx_packets_per_sec: 0,
        fp_tx_rate: 0,
        fp_rx_rate: 0,
        tx_bytes: 0,
        rx_bytes: 0,
        tx_packets: 0,
        rx_packets: 0,
        tx_errors: 0,
        rx_errors: 0,
        tx_drops: 0,
        rx_drops: 0
    });

    // Fetch real-time traffic data for this specific interface
    const fetchInterfaceTraffic = useCallback(async () => {
        if (!routerId || !interfaceDetails.name) return;
        
        console.log(`🔄 InterfaceDetailsScreen: Fetching traffic for interface ${interfaceDetails.name} on router ${routerId}`);
        setIsLoadingTraffic(true);
        try {
            // API call to get specific interface traffic data
            const response = await fetch(`https://wellnet-rd.com:444/api/router/${routerId}/interface/${interfaceDetails.name}/traffic`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                if (response.status === 404) {
                    console.error('❌ Router or interface not found');
                } else if (response.status === 500) {
                    console.error('❌ Server error - possibly SSH connection failed');
                } else {
                    console.error(`❌ Unexpected HTTP status: ${response.status}`);
                }
                return;
            }
            
            const result = await response.json();
            console.log(`📦 InterfaceDetailsScreen: Raw API response:`, JSON.stringify(result, null, 2));
            
            // Verificar estructura de respuesta
            if (!result || typeof result !== 'object') {
                console.error('❌ Invalid response format: not an object');
                return;
            }
            
            if (result.status !== 'success') {
                console.error('❌ API returned error status:', result.status);
                return;
            }
            
            const data = result.data;
            if (!data) {
                console.error('❌ No data field in response');
                return;
            }
            
            console.log(`📊 InterfaceDetailsScreen: Traffic data:`, JSON.stringify(data, null, 2));
            
            // Update traffic data with the specific interface data
            const mappedTrafficData = {
                upload_bps: Number(data.tx_rate) || 0,    // TX from router = upload from user
                download_bps: Number(data.rx_rate) || 0   // RX from router = download from user
            };
            
            console.log(`🔄 InterfaceDetailsScreen: Mapped traffic data:`, mappedTrafficData);
            
            setTrafficData(mappedTrafficData);
            setPerformanceMetrics({
                tx_packets_per_sec: Number(data.tx_packets_per_sec) || 0,
                rx_packets_per_sec: Number(data.rx_packets_per_sec) || 0,
                fp_tx_rate: Number(data.fp_tx_rate) || 0,
                fp_rx_rate: Number(data.fp_rx_rate) || 0,
                tx_bytes: Number(data.tx_bytes) || 0,
                rx_bytes: Number(data.rx_bytes) || 0,
                tx_packets: Number(data.tx_packets) || 0,
                rx_packets: Number(data.rx_packets) || 0,
                tx_errors: Number(data.tx_errors) || 0,
                rx_errors: Number(data.rx_errors) || 0,
                tx_drops: Number(data.tx_drops) || 0,
                rx_drops: Number(data.rx_drops) || 0
            });
            setLastUpdate(new Date());
            console.log(`✅ InterfaceDetailsScreen: Traffic data updated for ${interfaceDetails.name}`, {
                upload_bps: mappedTrafficData.upload_bps,
                download_bps: mappedTrafficData.download_bps,
                tx_packets: Number(data.tx_packets_per_sec) || 0,
                rx_packets: Number(data.rx_packets_per_sec) || 0,
                timestamp: data.timestamp
            });
            
        } catch (err) {
            console.error('Error fetching interface traffic:', err);
        } finally {
            setIsLoadingTraffic(false);
        }
    }, [routerId, interfaceDetails.name]);

    // Fetch detailed interface information
    const fetchInterfaceDetails = useCallback(async () => {
        if (!routerId || !interfaceDetails.name) return;
        
        console.log(`🔄 InterfaceDetailsScreen: Fetching details for interface ${interfaceDetails.name} on router ${routerId}`);
        try {
            // API call to get updated interface details
            const response = await fetch(`https://wellnet-rd.com:444/api/router/${routerId}/interface/${interfaceDetails.name}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return;
            }
            
            const result = await response.json();
            console.log(`📦 InterfaceDetailsScreen: Interface details response:`, JSON.stringify(result, null, 2));
            
            setInterfaceDetails(result.data);
            console.log(`✅ InterfaceDetailsScreen: Interface details updated for ${interfaceDetails.name}`);
            
        } catch (err) {
            console.error('Error fetching interface details:', err);
        }
    }, [routerId, interfaceDetails.name]);

    const formatBps = (bps: number): string => {
        if (bps === undefined || bps === null || bps < 0) return 'N/A';
        if (bps === 0) return '0 bps';
    
        const k = 1000;
        const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
        const i = Math.floor(Math.log(bps) / Math.log(k));
    
        return parseFloat((bps / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === undefined || bytes === null || bytes < 0) return 'N/A';
        if (bytes === 0) return '0 B';
    
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatPackets = (packets: number): string => {
        if (packets === undefined || packets === null || packets < 0) return 'N/A';
        if (packets === 0) return '0';
        
        if (packets >= 1000000) {
            return (packets / 1000000).toFixed(1) + 'M';
        } else if (packets >= 1000) {
            return (packets / 1000).toFixed(1) + 'K';
        }
        
        return packets.toString();
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('es-ES', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Set up real-time polling for traffic data - only when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (!isPollingEnabled) return;
            
            console.log(`🎯 InterfaceDetailsScreen: Screen focused - Starting traffic polling for ${interfaceDetails.name}`);
            
            // Initial fetch when screen comes into focus
            fetchInterfaceTraffic();
            
            // Set up polling interval (every 3 seconds)
            const trafficInterval = setInterval(() => {
                if (isPollingEnabled) {
                    fetchInterfaceTraffic();
                }
            }, 3000);
            
            // Cleanup when screen loses focus or component unmounts
            return () => {
                console.log(`🛑 InterfaceDetailsScreen: Screen unfocused - Stopping traffic polling for ${interfaceDetails.name}`);
                clearInterval(trafficInterval);
            };
        }, [fetchInterfaceTraffic, isPollingEnabled, interfaceDetails.name])
    );

    // Set up polling for interface details (less frequent) - only when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (!isPollingEnabled) return;
            
            console.log(`🎯 InterfaceDetailsScreen: Screen focused - Starting details polling for ${interfaceDetails.name}`);
            
            // Initial fetch when screen comes into focus
            fetchInterfaceDetails();
            
            // Set up polling interval (every 30 seconds)
            const detailsInterval = setInterval(() => {
                if (isPollingEnabled) {
                    fetchInterfaceDetails();
                }
            }, 30000);
            
            // Cleanup when screen loses focus or component unmounts
            return () => {
                console.log(`🛑 InterfaceDetailsScreen: Screen unfocused - Stopping details polling for ${interfaceDetails.name}`);
                clearInterval(detailsInterval);
            };
        }, [fetchInterfaceDetails, isPollingEnabled, interfaceDetails.name])
    );

    // Toggle polling function
    const togglePolling = () => {
        setIsPollingEnabled(!isPollingEnabled);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#121212' : '#F0F2F5',
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDarkMode ? '#E0E0E0' : '#333333',
            marginBottom: 20,
        },
        detailCard: {
            backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        detailLabel: {
            fontSize: 16,
            color: isDarkMode ? '#B0B0B0' : '#666666',
        },
        detailValue: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        trafficSection: {
            marginTop: 20,
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#333333' : '#E0E0E0',
        },
        trafficTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#E0E0E0' : '#333333',
            marginBottom: 10,
        },
        trafficValue: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        // Styles for the Interface Toolbar
        interfaceToolbar: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 10,
            backgroundColor: isDarkMode ? '#2C2C2C' : '#E0E0E0',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#333333' : '#CCCCCC',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
            marginBottom: 10,
        },
        toolbarButton: {
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 4,
        },
        toolbarButtonText: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4,
            color: isDarkMode ? '#B0B0B0' : '#666666',
        },
        // Specific button colors (using hex codes directly as colors object is not available here)
        addButton: {
            color: '#3B82F6',
        },
        removeButton: {
            color: '#666666',
        },
        enableButton: {
            color: '#059669',
        },
        disableButton: {
            color: '#DC2626',
        },
        resetButton: {
            color: '#F59E0B',
        },
        filterButton: {
            color: '#3B82F6',
        },
        detectButton: {
            color: '#3B82F6',
        },
        // Real-time indicator styles
        titleContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        realtimeIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
        },
        liveDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 6,
        },
        realtimeText: {
            fontSize: 12,
            fontWeight: '600',
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
        },
        // Enhanced traffic section styles
        trafficHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        trafficIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        trafficUpdateText: {
            fontSize: 11,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            marginLeft: 4,
        },
        trafficGrid: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 16,
        },
        trafficItem: {
            flex: 1,
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#111827' : '#F8FAFC',
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
        },
        trafficIconContainer: {
            marginBottom: 8,
        },
        trafficLabel: {
            fontSize: 14,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            marginBottom: 4,
            fontWeight: '500',
        },
        trafficValue: {
            fontSize: 18,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        lastUpdateContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
            gap: 6,
        },
        lastUpdateText: {
            fontSize: 12,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
        },
        // Debug styles
        debugSectionTitle: {
            fontSize: 14,
            fontWeight: '700',
            marginBottom: 8,
        },
        debugButtonsContainer: {
            flexDirection: 'row',
            gap: 8,
        },
        testButton: {
            marginTop: 12,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignItems: 'center',
        },
        testButtonText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
        },
        // Detailed metrics styles
        metricsContainer: {
            gap: 16,
        },
        metricCard: {
            backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        metricHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        metricTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: isDarkMode ? '#E0E0E0' : '#333333',
            marginLeft: 8,
        },
        metricDescription: {
            fontSize: 12,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            marginBottom: 12,
            lineHeight: 16,
        },
        metricGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        metricItem: {
            flex: 1,
            minWidth: '45%',
            backgroundColor: isDarkMode ? '#111827' : '#F8FAFC',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
        },
        metricItemLabel: {
            fontSize: 12,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            marginBottom: 4,
        },
        metricItemValue: {
            fontSize: 14,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        errorMetric: {
            color: '#EF4444',
        },
        successMetric: {
            color: '#10B981',
        },
        warningMetric: {
            color: '#F59E0B',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Detalles de la Interfaz: {interfaceDetails.name}</Text>
                <View style={styles.realtimeIndicator}>
                    <View style={[styles.liveDot, { 
                        backgroundColor: !isPollingEnabled ? '#6B7280' : (isLoadingTraffic ? '#F59E0B' : '#10B981')
                    }]} />
                    <Text style={styles.realtimeText}>
                        {isPollingEnabled ? 'LIVE' : 'PAUSADO'} • {formatTime(lastUpdate)}
                    </Text>
                    {isLoadingTraffic && isPollingEnabled && (
                        <ActivityIndicator 
                            size="small" 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </View>
            </View>

            <View style={styles.interfaceToolbar}>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => console.log('Add / Nueva interfaz')}> 
                    <Icon name="add-circle-outline" size={28} color={styles.addButton.color} />
                    <Text style={[styles.toolbarButtonText, styles.addButton]}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => console.log('Remove / Eliminar')}> 
                    <Icon name="delete-outline" size={28} color={styles.removeButton.color} />
                    <Text style={[styles.toolbarButtonText, styles.removeButton]}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => console.log('Enable / Habilitar')}> 
                    <Icon name="check-circle-outline" size={28} color={styles.enableButton.color} />
                    <Text style={[styles.toolbarButtonText, styles.enableButton]}>Enable</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => console.log('Reset Counters / Reiniciar contadores')}> 
                    <Icon name="refresh" size={28} color={styles.resetButton.color} />
                    <Text style={[styles.toolbarButtonText, styles.resetButton]}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => console.log('Filter / Filtrar')}> 
                    <Icon name="filter-list" size={28} color={styles.filterButton.color} />
                    <Text style={[styles.toolbarButtonText, styles.filterButton]}>Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => console.log('Detect Internet')}> 
                    <Icon name="public" size={28} color={styles.detectButton.color} />
                    <Text style={[styles.toolbarButtonText, styles.detectButton]}>Detect</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={togglePolling}> 
                    <Icon 
                        name={isPollingEnabled ? "pause" : "play-arrow"} 
                        size={28} 
                        color={isPollingEnabled ? '#F59E0B' : '#10B981'} 
                    />
                    <Text style={[styles.toolbarButtonText, { 
                        color: isPollingEnabled ? '#F59E0B' : '#10B981' 
                    }]}>
                        {isPollingEnabled ? 'Pause' : 'Play'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tipo:</Text>
                        <Text style={styles.detailValue}>{interfaceDetails.type || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>MTU Actual:</Text>
                        <Text style={styles.detailValue}>{interfaceDetails.mtu || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>MTU L2:</Text>
                        <Text style={styles.detailValue}>{interfaceDetails['l2-mtu'] || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>MAC Address:</Text>
                        <Text style={styles.detailValue}>{interfaceDetails['mac-address'] || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>ARP:</Text>
                        <Text style={styles.detailValue}>{interfaceDetails.arp || 'N/A'}</Text>
                    </View>
                    {interfaceDetails.comment && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Comentario:</Text>
                            <Text style={styles.detailValue}>{interfaceDetails.comment}</Text>
                        </View>
                    )}
                </View>

                <View style={[styles.detailCard, styles.trafficSection]}>
                    <View style={styles.trafficHeader}>
                        <Text style={styles.trafficTitle}>Tráfico en Tiempo Real</Text>
                        <View style={styles.trafficIndicator}>
                            <View style={[styles.liveDot, { 
                                backgroundColor: !isPollingEnabled ? '#6B7280' : (isLoadingTraffic ? '#F59E0B' : '#10B981')
                            }]} />
                            <Text style={styles.trafficUpdateText}>
                                {isPollingEnabled ? 'Actualizando cada 3s' : 'Actualizaciones pausadas'}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.trafficGrid}>
                        <View style={styles.trafficItem}>
                            <View style={styles.trafficIconContainer}>
                                <Icon name="upload" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.trafficLabel}>Subida</Text>
                            <Text style={styles.trafficValue}>{formatBps(trafficData?.upload_bps || 0)}</Text>
                        </View>
                        
                        <View style={styles.trafficItem}>
                            <View style={styles.trafficIconContainer}>
                                <Icon name="download" size={24} color="#3B82F6" />
                            </View>
                            <Text style={styles.trafficLabel}>Bajada</Text>
                            <Text style={styles.trafficValue}>{formatBps(trafficData?.download_bps || 0)}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.lastUpdateContainer}>
                        <Icon name="schedule" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <Text style={styles.lastUpdateText}>
                            Última actualización: {formatTime(lastUpdate)}
                        </Text>
                    </View>
                </View>

                <RealTimeTrafficChart
                    isDarkMode={isDarkMode}
                    trafficData={trafficData}
                    isPollingEnabled={isPollingEnabled}
                    maxDataPoints={60}
                    visibleDataPoints={15}
                />


                {/* Métricas Básicas de Interfaz */}
                <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                        <Icon name="info" size={20} color="#3B82F6" />
                        <Text style={styles.metricTitle}>Información Básica</Text>
                    </View>
                    <Text style={styles.metricDescription}>
                        Datos fundamentales de configuración y estado de la interfaz
                    </Text>
                    <View style={styles.metricGrid}>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Name (Nombre)</Text>
                            <Text style={styles.metricItemValue}>{interfaceDetails.name || 'N/A'}</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Type (Tipo)</Text>
                            <Text style={styles.metricItemValue}>{interfaceDetails.type || 'N/A'}</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Actual MTU (L3)</Text>
                            <Text style={styles.metricItemValue}>{interfaceDetails.mtu || 'N/A'} bytes</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>L2 MTU (Ethernet)</Text>
                            <Text style={styles.metricItemValue}>{interfaceDetails['l2-mtu'] || 'N/A'} bytes</Text>
                        </View>
                    </View>
                </View>

                {/* Métricas de Throughput en Tiempo Real */}
                <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                        <Icon name="speed" size={20} color="#10B981" />
                        <Text style={styles.metricTitle}>Throughput en Tiempo Real</Text>
                    </View>
                    <Text style={styles.metricDescription}>
                        Velocidad de transmisión y recepción de datos en tiempo real (actualiza cada 3s)
                    </Text>
                    <View style={styles.metricGrid}>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Tx (Transmisión)</Text>
                            <Text style={styles.metricItemValue}>{formatBps(trafficData?.upload_bps || 0)}</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Rx (Recepción)</Text>
                            <Text style={styles.metricItemValue}>{formatBps(trafficData?.download_bps || 0)}</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Tx Packet (p/s)</Text>
                            <Text style={styles.metricItemValue}>{formatPackets(performanceMetrics.tx_packets_per_sec)}</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Rx Packet (p/s)</Text>
                            <Text style={styles.metricItemValue}>{formatPackets(performanceMetrics.rx_packets_per_sec)}</Text>
                        </View>
                    </View>
                </View>

                {/* Métricas de Fast-Path */}
                <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                        <Icon name="flash-on" size={20} color="#F59E0B" />
                        <Text style={styles.metricTitle}>Fast-Path (Aceleración Hardware)</Text>
                    </View>
                    <Text style={styles.metricDescription}>
                        Tráfico procesado por hardware (Fast-Path) vs CPU. Valores altos indican mejor rendimiento
                    </Text>
                    <View style={styles.metricGrid}>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>FP Tx (Hardware)</Text>
                            <Text style={[styles.metricItemValue, performanceMetrics.fp_tx_rate > 0 ? styles.successMetric : styles.warningMetric]}>
                                {formatBps(performanceMetrics.fp_tx_rate)}
                            </Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>FP Rx (Hardware)</Text>
                            <Text style={[styles.metricItemValue, performanceMetrics.fp_rx_rate > 0 ? styles.successMetric : styles.warningMetric]}>
                                {formatBps(performanceMetrics.fp_rx_rate)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Métricas Acumulativas */}
                <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                        <Icon name="trending-up" size={20} color="#6366F1" />
                        <Text style={styles.metricTitle}>Contadores Acumulativos</Text>
                    </View>
                    <Text style={styles.metricDescription}>
                        Estadísticas totales desde el último reinicio del router o reset de contadores
                    </Text>
                    <View style={styles.metricGrid}>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Total Tx Bytes</Text>
                            <Text style={styles.metricItemValue}>{formatBytes(performanceMetrics.tx_bytes)}</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Total Rx Bytes</Text>
                            <Text style={styles.metricItemValue}>{formatBytes(performanceMetrics.rx_bytes)}</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Total Tx Packets</Text>
                            <Text style={styles.metricItemValue}>{formatPackets(performanceMetrics.tx_packets)}</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Total Rx Packets</Text>
                            <Text style={styles.metricItemValue}>{formatPackets(performanceMetrics.rx_packets)}</Text>
                        </View>
                    </View>
                </View>

                {/* Métricas de Errores */}
                <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                        <Icon name="error" size={20} color="#EF4444" />
                        <Text style={styles.metricTitle}>Errores y Drops</Text>
                    </View>
                    <Text style={styles.metricDescription}>
                        Paquetes perdidos o con errores. Valores altos pueden indicar problemas de red o hardware
                    </Text>
                    <View style={styles.metricGrid}>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Tx Errors</Text>
                            <Text style={[styles.metricItemValue, performanceMetrics.tx_errors > 0 ? styles.errorMetric : styles.successMetric]}>
                                {formatPackets(performanceMetrics.tx_errors)}
                            </Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Rx Errors</Text>
                            <Text style={[styles.metricItemValue, performanceMetrics.rx_errors > 0 ? styles.errorMetric : styles.successMetric]}>
                                {formatPackets(performanceMetrics.rx_errors)}
                            </Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Tx Drops</Text>
                            <Text style={[styles.metricItemValue, performanceMetrics.tx_drops > 0 ? styles.errorMetric : styles.successMetric]}>
                                {formatPackets(performanceMetrics.tx_drops)}
                            </Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricItemLabel}>Rx Drops</Text>
                            <Text style={[styles.metricItemValue, performanceMetrics.rx_drops > 0 ? styles.errorMetric : styles.successMetric]}>
                                {formatPackets(performanceMetrics.rx_drops)}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default InterfaceDetailsScreen;
