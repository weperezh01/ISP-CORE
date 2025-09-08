import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ConnectionEventsHistory = ({ connectionId, isDarkMode, styles, expandedCards, toggleCardExpansion }) => {
    const [eventHistory, setEventHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);

    // Función para obtener el historial de eventos
    const fetchEventHistory = async () => {
        if (!connectionId) return;
        
        try {
            setIsLoading(true);
            setError(null);
            console.log(`📊 Obteniendo historial de eventos para conexión ${connectionId}`);
            
            // Intentar primero el nuevo endpoint
            const newEndpointResponse = await fetch(`https://wellnet-rd.com:444/api/connection-events-history/${connectionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Si el nuevo endpoint devuelve JSON válido
            if (newEndpointResponse.ok) {
                const responseText = await newEndpointResponse.text();
                if (responseText.includes('<!doctype html>') || responseText.includes('<html')) {
                    console.log(`⚠️ Endpoint nuevo no implementado, usando endpoint existente`);
                    throw new Error('Endpoint no implementado');
                }
                
                try {
                    const data = JSON.parse(responseText);
                    if (data.success && Array.isArray(data.data)) {
                        const eventosOrdenados = data.data.sort((a, b) => new Date(b.event_time) - new Date(a.event_time));
                        console.log(`✅ Historial recibido (nuevo endpoint) para conexión ${connectionId}:`, eventosOrdenados.length, 'eventos');
                        setEventHistory(eventosOrdenados);
                        return;
                    }
                } catch (parseError) {
                    console.log(`⚠️ Error parsing nuevo endpoint, intentando endpoint anterior`);
                }
            }
            
            // Fallback al endpoint anterior
            console.log(`🔄 Usando endpoint anterior: obtener-log-cortes`);
            const fallbackResponse = await fetch('https://wellnet-rd.com:444/api/obtener-log-cortes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_conexion: connectionId }),
            });

            if (fallbackResponse.ok) {
                const data = await fallbackResponse.json();
                if (Array.isArray(data)) {
                    // Transformar datos del formato anterior al nuevo formato
                    const transformedEvents = data.map(event => ({
                        id: event.id_log_unico || event.id,
                        event_type: event.tipo_evento?.includes('corte') || event.tipo_evento?.includes('suspension') ? 'offline' : 'online',
                        event_time: event.fecha,
                        detection_method: 'legacy_system',
                        additional_info: JSON.stringify({
                            legacy_type: event.tipo_evento,
                            message: event.mensaje,
                            username: event.nombre_usuario,
                            ip: event.direccion_ipv4
                        })
                    }));
                    
                    const eventosOrdenados = transformedEvents.sort((a, b) => new Date(b.event_time) - new Date(a.event_time));
                    console.log(`✅ Historial recibido (endpoint anterior) para conexión ${connectionId}:`, eventosOrdenados.length, 'eventos');
                    setEventHistory(eventosOrdenados);
                } else {
                    console.log(`❌ No hay historial para conexión ${connectionId}`);
                    setEventHistory([]);
                }
            } else {
                throw new Error(`Error HTTP: ${fallbackResponse.status}`);
            }
        } catch (err) {
            console.error('Error al obtener historial de eventos:', err);
            if (err.message === 'Endpoint no implementado') {
                setError('El endpoint de historial de eventos no está implementado en el backend aún. Contacta al equipo de backend.');
            } else {
                setError('Error al cargar el historial de eventos.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEventHistory();
    }, [connectionId]);

    // Función para formatear fecha y hora
    const formatDateTime = (eventTime) => {
        const date = new Date(eventTime);
        return {
            date: date.toLocaleDateString('es-DO', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }),
            time: date.toLocaleTimeString('es-DO', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            })
        };
    };

    // Función para obtener el icono del evento
    const getEventIcon = (eventType) => {
        const tipo = eventType?.toLowerCase() || '';
        if (tipo === 'online') return 'wifi';
        if (tipo === 'offline') return 'wifi-off';
        return 'event';
    };

    // Función para obtener el color del evento
    const getEventColor = (eventType) => {
        const tipo = eventType?.toLowerCase() || '';
        if (tipo === 'online') return '#10B981';
        if (tipo === 'offline') return '#EF4444';
        return isDarkMode ? '#9CA3AF' : '#6B7280';
    };

    // Renderizar cada evento
    const renderEventItem = ({ item }) => {
        if (!item) return null;

        const { date, time } = formatDateTime(item.event_time);
        const eventColor = getEventColor(item.event_type);
        
        let additionalInfo = {};
        try {
            additionalInfo = item.additional_info ? JSON.parse(item.additional_info) : {};
        } catch (e) {
            console.error('Error parsing additional_info:', e);
            additionalInfo = {};
        }

        return (
            <View style={[
                {
                    backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    borderLeftWidth: 3,
                    borderLeftColor: eventColor
                }
            ]}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: eventColor + '20',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 8
                        }]}>
                            <Icon name={getEventIcon(item.event_type)} size={14} color={eventColor} />
                        </View>
                        <Text style={[{
                            fontSize: 14,
                            fontWeight: '600',
                            color: isDarkMode ? '#fff' : '#000'
                        }]}>
                            {item.event_type === 'online' ? 'Conectado' : 'Desconectado'}
                        </Text>
                    </View>
                    <Text style={[{
                        fontSize: 11,
                        color: isDarkMode ? '#9CA3AF' : '#6B7280'
                    }]}>
                        {date} • {time}
                    </Text>
                </View>
                
                <View style={{ marginLeft: 32 }}>
                    <Text style={[{
                        fontSize: 12,
                        color: isDarkMode ? '#D1D5DB' : '#374151',
                        marginBottom: 4
                    }]}>
                        Método: {item.detection_method || 'N/A'}
                    </Text>
                    
                    {/* Datos del nuevo formato */}
                    {additionalInfo.previous_status && (
                        <Text style={[{
                            fontSize: 11,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            marginBottom: 2
                        }]}>
                            Estado anterior: {additionalInfo.previous_status}
                        </Text>
                    )}
                    
                    {/* Datos del formato anterior (legacy) */}
                    {additionalInfo.legacy_type && (
                        <Text style={[{
                            fontSize: 11,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            marginBottom: 2
                        }]}>
                            Tipo: {additionalInfo.legacy_type}
                        </Text>
                    )}
                    
                    {additionalInfo.message && (
                        <Text style={[{
                            fontSize: 11,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            marginBottom: 2
                        }]}>
                            Mensaje: {additionalInfo.message}
                        </Text>
                    )}
                    
                    {additionalInfo.username && (
                        <Text style={[{
                            fontSize: 11,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            marginBottom: 2
                        }]}>
                            Usuario: {additionalInfo.username}
                        </Text>
                    )}
                    
                    {additionalInfo.ip && (
                        <Text style={[{
                            fontSize: 11,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            marginBottom: 2
                        }]}>
                            IP: {additionalInfo.ip}
                        </Text>
                    )}
                    
                    {/* Velocidades del nuevo formato */}
                    {(additionalInfo.download_rate !== undefined || additionalInfo.upload_rate !== undefined) && (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 4
                        }}>
                            {additionalInfo.download_rate !== undefined && (
                                <Text style={[{
                                    fontSize: 11,
                                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                    marginRight: 8
                                }]}>
                                    ↓ {additionalInfo.download_rate} bps
                                </Text>
                            )}
                            {additionalInfo.upload_rate !== undefined && (
                                <Text style={[{
                                    fontSize: 11,
                                    color: isDarkMode ? '#9CA3AF' : '#6B7280'
                                }]}>
                                    ↑ {additionalInfo.upload_rate} bps
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    // Mostrar solo los últimos eventos o todos
    const displayedEvents = showAll ? eventHistory : eventHistory.slice(0, 5);

    if (isLoading) {
        return (
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <Icon name="history" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                        <Text style={styles.cardTitle}>Historial de Eventos de Conexión</Text>
                    </View>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    <ActivityIndicator size="small" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    <Text style={[{
                        marginLeft: 10,
                        fontSize: 14,
                        color: isDarkMode ? '#ccc' : '#666'
                    }]}>
                        Cargando historial...
                    </Text>
                </View>
            </Card>
        );
    }

    if (error) {
        return (
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <Icon name="history" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                        <Text style={styles.cardTitle}>Historial de Eventos de Conexión</Text>
                    </View>
                </View>
                <View style={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FEF2F2',
                    borderRadius: 8,
                    padding: 12,
                    margin: 10
                }}>
                    <Text style={[{
                        fontSize: 14,
                        color: isDarkMode ? '#DC2626' : '#B91C1C'
                    }]}>
                        {error}
                    </Text>
                    <TouchableOpacity 
                        style={{
                            marginTop: 8,
                            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                            borderRadius: 6,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            alignSelf: 'flex-start'
                        }}
                        onPress={fetchEventHistory}
                    >
                        <Text style={[{
                            fontSize: 12,
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            fontWeight: '600'
                        }]}>
                            Reintentar
                        </Text>
                    </TouchableOpacity>
                </View>
            </Card>
        );
    }

    // Colors palette for expand buttons
    const colors = {
        primary: {
            500: '#3B82F6',
            600: '#2563EB',
        },
        gray: {
            300: '#CBD5E1',
            600: '#475569',
        }
    };

    return (
        <Card style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <Icon name="history" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    <Text style={styles.cardTitle}>Historial de Eventos de Conexión</Text>
                </View>
                {eventHistory.length > 0 && (
                    <View style={{
                        backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        minWidth: 40,
                        alignItems: 'center',
                        marginRight: 10
                    }}>
                        <Text style={[{
                            fontSize: 12,
                            fontWeight: '600',
                            color: isDarkMode ? '#D1D5DB' : '#374151'
                        }]}>
                            {eventHistory.length}
                        </Text>
                    </View>
                )}
                <TouchableOpacity 
                    style={[styles.expandButton, expandedCards?.has('historial') && styles.expandButtonActive]} 
                    onPress={() => toggleCardExpansion('historial')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                >
                    <Icon 
                        name={expandedCards?.has('historial') ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={20} 
                        color={expandedCards?.has('historial') ? "#FFFFFF" : (isDarkMode ? colors.gray[300] : colors.gray[600])} 
                    />
                </TouchableOpacity>
            </View>
            
            {/* Compact info - Always visible */}
            <View style={styles.compactInfo}>
                <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                    <Icon name="event" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <View style={styles.connectionDetailContent}>
                        <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Total Eventos</Text>
                        <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{eventHistory.length}</Text>
                    </View>
                </View>
                {eventHistory.length > 0 && (
                    <>
                        <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                            <Icon name={eventHistory[0]?.event_type === 'online' ? 'wifi' : 'wifi-off'} size={20} color={eventHistory[0]?.event_type === 'online' ? '#10B981' : '#EF4444'} />
                            <View style={styles.connectionDetailContent}>
                                <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Último Estado</Text>
                                <Text style={[styles.connectionDetailValue, { color: eventHistory[0]?.event_type === 'online' ? '#10B981' : '#EF4444' }]}>
                                    {eventHistory[0]?.event_type === 'online' ? 'Conectado' : 'Desconectado'}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.connectionDetailRow, { borderBottomColor: 'transparent' }]}>
                            <Icon name="schedule" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <View style={styles.connectionDetailContent}>
                                <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Último Evento</Text>
                                <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{
                                    formatDateTime(eventHistory[0]?.event_time).date
                                }</Text>
                            </View>
                        </View>
                    </>
                )}
            </View>
            
            {/* Expanded details - Only visible when expanded */}
            {expandedCards?.has('historial') && (
                eventHistory.length === 0 ? (
                    <View style={{
                        backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                        borderRadius: 8,
                        padding: 20,
                        margin: 10,
                        alignItems: 'center'
                    }}>
                        <Icon name="event-busy" size={32} color={isDarkMode ? '#374151' : '#E5E7EB'} />
                        <Text style={[{
                            marginTop: 8,
                            fontSize: 14,
                            fontWeight: '600',
                            color: isDarkMode ? '#9CA3AF' : '#6B7280',
                            textAlign: 'center'
                        }]}>
                            No hay historial de conexión disponible
                        </Text>
                        <Text style={[{
                            marginTop: 4,
                            fontSize: 12,
                            color: isDarkMode ? '#6B7280' : '#9CA3AF',
                            textAlign: 'center'
                        }]}>
                            Los eventos de conexión aparecerán aquí una vez que se registren
                        </Text>
                    </View>
                ) : (
                    <View style={{ padding: 10 }}>
                        <FlatList
                            data={displayedEvents}
                            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                            renderItem={renderEventItem}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                        
                        {eventHistory.length > 5 && (
                            <TouchableOpacity 
                                style={{
                                    backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                                    borderRadius: 8,
                                    paddingVertical: 10,
                                    paddingHorizontal: 15,
                                    marginTop: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onPress={() => setShowAll(!showAll)}
                            >
                                <Text style={[{
                                    fontSize: 14,
                                    color: isDarkMode ? '#60A5FA' : '#2563EB',
                                    fontWeight: '600',
                                    marginRight: 5
                                }]}>
                                    {showAll ? 'Mostrar menos' : `Ver todos (${eventHistory.length})`}
                                </Text>
                                <Icon 
                                    name={showAll ? 'expand-less' : 'expand-more'} 
                                    size={16} 
                                    color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                )
            )}
        </Card>
    );
};

export default ConnectionEventsHistory;