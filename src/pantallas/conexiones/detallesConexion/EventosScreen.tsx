import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemeSwitch from '../../../componentes/themeSwitch';
import HistoryIcon from './components/HistoryIcon';
import ChevronRightIcon from './components/ChevronRightIcon';
import ActionsIcon from './components/ActionsIcon';

const EventosScreen = ({ route, navigation }) => {
    const { clientId, connectionId } = route.params;  // Recibir ambos parámetros
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEventos = async () => {
        try {
            console.log('🔍 [EventosScreen] Solicitando eventos para conexión:', connectionId);
            const response = await fetch('https://wellnet-rd.com:444/api/obtener-log-cortes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_conexion: connectionId }),
            });

            const data = await response.json();
            console.log('📥 [EventosScreen] Eventos recibidos:', data.length, 'eventos');
            console.log('📋 [EventosScreen] Tipos de eventos:', data.map(e => e.tipo_evento));

            if (response.ok) {
                const eventosOrdenados = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setEventos(eventosOrdenados);
                console.log('✅ [EventosScreen] Eventos ordenados y establecidos:', eventosOrdenados.length);
            } else {
                throw new Error(data.message || 'Error al obtener las acciones');
            }
        } catch (error) {
            console.error('❌ [EventosScreen] Error al obtener las acciones:', error);
            Alert.alert('Error', error.message || 'Error al obtener las acciones.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchEventos();
    };

    useEffect(() => {
        fetchEventos();
        registrarNavegacion();
    }, [clientId, connectionId]);

    const registrarNavegacion = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Retardo asíncrono de 2 segundos
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'EventosScreen';

        const datos = JSON.stringify({
            clientId,
            connectionId
        });

        const navigationLogData = {
            id_usuario: await AsyncStorage.getItem('@loginData').then(data => JSON.parse(data).id),
            fecha,
            hora,
            pantalla,
            datos
        };

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(navigationLogData),
            });

            if (!response.ok) {
                throw new Error('Error al registrar la navegación.');
            }

            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    const renderActionIcon = (tipoEvento, size = 24, color = '#6B7280') => {
        const tipo = tipoEvento?.toLowerCase() || '';

        if (tipo.includes('corte') || tipo.includes('suspend')) {
            return <Icon name="content-cut" size={size} color={color} />; // Tijeras/corte
        }
        if (tipo.includes('reconex') || tipo.includes('activ')) {
            return <Icon name="power" size={size} color={color} />; // Reconexión
        }
        if (tipo.includes('baja') || tipo.includes('cancel')) {
            return <Icon name="person_remove" size={size} color={color} />; // Baja
        }
        if (tipo.includes('alta') || tipo.includes('crear') || tipo.includes('instal')) {
            return <Icon name="build" size={size} color={color} />; // Instalación/construcción
        }
        if (tipo.includes('cambio de servicio') || tipo.includes('cambiar servicio')) {
            return <Icon name="swap-horiz" size={size} color={color} />; // Cambio de servicio
        }
        if (tipo.includes('asignación de servicio') || tipo.includes('asignar servicio')) {
            return <Icon name="add-circle" size={size} color={color} />; // Asignación de servicio
        }
        if (tipo.includes('configuración') || tipo.includes('configurar')) {
            return <Icon name="settings" size={size} color={color} />; // Configuración de router
        }
        if (tipo.includes('modif') || tipo.includes('edit')) {
            return <Icon name="edit" size={size} color={color} />; // Modificación
        }
        return <Icon name="history" size={size} color={color} />; // Otros eventos
    };

    const getActionColor = (tipoEvento) => {
        const tipo = tipoEvento?.toLowerCase() || '';
        if (tipo.includes('corte') || tipo.includes('suspend')) return '#EF4444';
        if (tipo.includes('reconex') || tipo.includes('activ')) return '#10B981';
        if (tipo.includes('baja') || tipo.includes('cancel')) return '#F59E0B';
        if (tipo.includes('alta') || tipo.includes('crear')) return '#3B82F6';
        if (tipo.includes('cambio de servicio') || tipo.includes('cambiar servicio')) return '#0EA5E9'; // Cyan
        if (tipo.includes('asignación de servicio') || tipo.includes('asignar servicio')) return '#14B8A6'; // Teal
        if (tipo.includes('configuración') || tipo.includes('configurar')) return '#8B5CF6'; // Purple
        if (tipo.includes('modif') || tipo.includes('edit')) return '#A855F7';
        return '#6B7280';
    };

    const formatDateTime = (fecha) => {
        const date = new Date(fecha);
        return {
            date: date.toLocaleDateString('es-DO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('es-DO', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const renderItem = ({ item }) => {
        const { date, time } = formatDateTime(item.fecha);
        const actionColor = getActionColor(item.tipo_evento);
        
        return (
            <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
                onPress={() => navigation.navigate('DetalleEventoScreen', { eventoId: item.id_log_unico })}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <View style={[styles.actionIcon, { backgroundColor: actionColor + '20' }]}>
                            {renderActionIcon(item.tipo_evento, 24, actionColor)}
                        </View>
                        <View style={styles.headerText}>
                            <Text style={[styles.actionTitle, { color: isDarkMode ? '#F3F4F6' : '#1F2937' }]}>
                                {item.tipo_evento}
                            </Text>
                            <View style={styles.dateTimeContainer}>
                                <Icon name="schedule" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <Text style={[styles.dateTime, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    {date} • {time}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <ChevronRightIcon size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                </View>

                <View style={styles.cardBody}>
                    <Text style={[styles.mensaje, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                        {item.mensaje}
                    </Text>
                    
                    <View style={styles.metaInfo}>
                        <View style={styles.metaRow}>
                            <Icon name="person" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text style={[styles.metaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                {item.nombre_usuario || 'Usuario desconocido'} (ID: {item.id_usuario})
                            </Text>
                        </View>
                        
                        {item.direccion_ipv4 && (
                            <View style={styles.metaRow}>
                                <Icon name="computer" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <Text style={[styles.metaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    IP: {item.direccion_ipv4}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerText}>
                        <View style={styles.titleContainer}>
                            <ActionsIcon size={34} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                            <Text style={styles.title}>Historial de Acciones</Text>
                        </View>
                        <Text style={styles.subtitle}>
                            {eventos.length} {eventos.length === 1 ? 'acción registrada' : 'acciones registradas'}
                        </Text>
                    </View>
                    <ThemeSwitch />
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                        <Text style={styles.loadingText}>Cargando acciones...</Text>
                    </View>
                ) : eventos.length > 0 ? (
                    <FlatList
                        data={eventos}
                        keyExtractor={(item) => item.id_log_unico}
                        renderItem={renderItem}
                        refreshControl={
                            <RefreshControl 
                                refreshing={refreshing} 
                                onRefresh={onRefresh}
                                colors={['#3B82F6']}
                                tintColor={isDarkMode ? '#60A5FA' : '#3B82F6'}
                            />
                        }
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <HistoryIcon size={64} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
                        <Text style={styles.emptyTitle}>Sin acciones registradas</Text>
                        <Text style={styles.emptySubtitle}>
                            No hay actividad administrativa registrada para esta conexión
                        </Text>
                        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                            <Icon name="refresh" size={20} color="#3B82F6" />
                            <Text style={styles.refreshButtonText}>Actualizar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );

};

const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
    },
    
    // Header Styles
    header: {
        backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#334155' : '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        flex: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: isDarkMode ? '#F1F5F9' : '#1E293B',
        marginLeft: 12,
    },
    subtitle: {
        fontSize: 14,
        color: isDarkMode ? '#94A3B8' : '#64748B',
        fontWeight: '500',
    },
    
    // Content Styles
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContent: {
        paddingVertical: 16,
    },
    separator: {
        height: 12,
    },
    
    // Loading Styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 16,
        color: isDarkMode ? '#94A3B8' : '#64748B',
        marginTop: 16,
        fontWeight: '500',
    },
    
    // Empty State Styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: isDarkMode ? '#F1F5F9' : '#1E293B',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: isDarkMode ? '#94A3B8' : '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    refreshButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    
    // Action Card Styles
    actionCard: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateTime: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    cardBody: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#334155' : '#F1F5F9',
    },
    mensaje: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 12,
        fontWeight: '500',
    },
    metaInfo: {
        gap: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
        flex: 1,
    },
});

export default EventosScreen;