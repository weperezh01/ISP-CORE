import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const RealTimeConnections = ({ isDarkMode, styles, currentConnectionId }) => {
    const [activeConnections, setActiveConnections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRealTimeActive, setIsRealTimeActive] = useState(false);
    const [realTimeInterval, setRealTimeInterval] = useState(null);
    const navigation = useNavigation();

    const formatSpeed = (bps) => {
        if (!bps || bps === 0) return '0 bps';
        const k = 1000;
        const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
        const i = Math.floor(Math.log(bps) / Math.log(k));
        return parseFloat((bps / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const fetchActiveConnections = useCallback(async () => {
        try {
            console.log('🌐 RealTimeConnections: Obteniendo conexiones activas...');
            const response = await fetch('https://wellnet-rd.com:444/api/metrics-stats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.stats && result.stats.connections) {
                    // Filtrar solo conexiones online con actividad
                    const activeConns = result.stats.connections
                        .filter(conn => 
                            conn.status === 'online' && 
                            (conn.rx_rate > 0 || conn.tx_rate > 0 || conn.rx_bytes > 0)
                        )
                        .sort((a, b) => (b.rx_rate + b.tx_rate) - (a.rx_rate + a.tx_rate)) // Ordenar por mayor actividad
                        .slice(0, 20); // Top 20

                    setActiveConnections(activeConns);
                    console.log(`🌐 RealTimeConnections: ${activeConns.length} conexiones activas encontradas`);
                } else {
                    console.log('🌐 RealTimeConnections: No se encontraron datos de conexiones');
                    setActiveConnections([]);
                }
            } else {
                console.error('🌐 RealTimeConnections: Error en respuesta:', response.status);
                setActiveConnections([]);
            }
        } catch (error) {
            console.error('🌐 RealTimeConnections: Error obteniendo conexiones:', error);
            setActiveConnections([]);
        }
    }, []);

    // Activar polling cuando el componente está activo
    useFocusEffect(
        useCallback(() => {
            console.log('🟢 RealTimeConnections: Activando monitoring de conexiones activas');
            setIsRealTimeActive(true);
            fetchActiveConnections();

            const interval = setInterval(() => {
                console.log('🔄 RealTimeConnections: Actualizando conexiones activas...');
                fetchActiveConnections();
            }, 10000); // Cada 10 segundos

            setRealTimeInterval(interval);

            return () => {
                console.log('🔴 RealTimeConnections: Desactivando monitoring');
                setIsRealTimeActive(false);
                if (interval) {
                    clearInterval(interval);
                }
                setRealTimeInterval(null);
            };
        }, [fetchActiveConnections])
    );

    const navigateToConnection = (connection) => {
        navigation.navigate('ConexionDetalles', {
            connectionId: connection.id_conexion,
            usuarioId: connection.id_usuario || null
        });
    };

    const renderConnectionItem = ({ item }) => {
        const isCurrentConnection = item.id_conexion === currentConnectionId;
        const totalSpeed = (item.rx_rate || 0) + (item.tx_rate || 0);
        const totalBytes = (item.rx_bytes || 0) + (item.tx_bytes || 0);

        return (
            <TouchableOpacity
                style={[
                    styles.connectionItem,
                    isCurrentConnection && styles.currentConnectionItem,
                    {
                        backgroundColor: isCurrentConnection 
                            ? (isDarkMode ? '#2563EB' : '#3B82F6')
                            : (isDarkMode ? '#444' : '#f8f9fa'),
                        borderColor: isCurrentConnection 
                            ? (isDarkMode ? '#60A5FA' : '#2563EB')
                            : 'transparent',
                        borderWidth: isCurrentConnection ? 2 : 0,
                        padding: 12,
                        marginVertical: 4,
                        borderRadius: 8,
                    }
                ]}
                onPress={() => navigateToConnection(item)}
                disabled={isCurrentConnection}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: totalSpeed > 0 ? '#00ff00' : '#orange',
                                marginRight: 8
                            }} />
                            <Text style={[
                                styles.connectionId,
                                { 
                                    color: isCurrentConnection ? '#fff' : (isDarkMode ? '#fff' : '#000'),
                                    fontWeight: isCurrentConnection ? 'bold' : 'normal'
                                }
                            ]}>
                                ID {item.id_conexion}
                            </Text>
                            {isCurrentConnection && (
                                <Text style={{ color: '#fff', fontSize: 12, marginLeft: 8 }}>
                                    (Actual)
                                </Text>
                            )}
                        </View>
                        <Text style={[
                            styles.connectionIP,
                            { 
                                color: isCurrentConnection ? '#e0e7ff' : (isDarkMode ? '#ccc' : '#666'),
                                fontSize: 13
                            }
                        ]}>
                            {item.direccion_ip}
                        </Text>
                    </View>
                    
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[
                            styles.connectionSpeed,
                            { 
                                color: isCurrentConnection ? '#fff' : (isDarkMode ? '#60A5FA' : '#2563EB'),
                                fontWeight: 'bold'
                            }
                        ]}>
                            {formatSpeed(totalSpeed)}
                        </Text>
                        <Text style={[
                            styles.connectionBytes,
                            { 
                                color: isCurrentConnection ? '#e0e7ff' : (isDarkMode ? '#888' : '#999'),
                                fontSize: 11
                            }
                        ]}>
                            {formatBytes(totalBytes)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Card style={[styles.card, { backgroundColor: isDarkMode ? '#333' : '#fff', marginTop: 16 }]}>
            <View style={styles.cardHeader}>
                <Icon name="network-check" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                        Conexiones Activas
                    </Text>
                    {isRealTimeActive && (
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
                                Monitoring Activo ({activeConnections.length})
                            </Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={fetchActiveConnections} disabled={isLoading}>
                    <Icon 
                        name="refresh" 
                        size={20} 
                        color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        style={{ opacity: isLoading ? 0.5 : 1 }}
                    />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    <Text style={{ color: isDarkMode ? '#ccc' : '#666', marginTop: 8 }}>
                        Buscando conexiones activas...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={activeConnections}
                    keyExtractor={(item, index) => `${item.id_conexion}-${index}`}
                    renderItem={renderConnectionItem}
                    showsVerticalScrollIndicator={false}
                    style={{ maxHeight: 300 }}
                    ListEmptyComponent={
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Icon name="signal-wifi-off" size={48} color={isDarkMode ? '#666' : '#ccc'} />
                            <Text style={{ color: isDarkMode ? '#ccc' : '#666', textAlign: 'center', marginTop: 8 }}>
                                No hay conexiones con actividad detectada
                            </Text>
                        </View>
                    }
                    ListHeaderComponent={
                        activeConnections.length > 0 ? (
                            <Text style={{ 
                                color: isDarkMode ? '#888' : '#999', 
                                fontSize: 12, 
                                textAlign: 'center', 
                                marginBottom: 8 
                            }}>
                                Toca cualquier conexión para ver sus métricas
                            </Text>
                        ) : null
                    }
                />
            )}
        </Card>
    );
};

export default RealTimeConnections;