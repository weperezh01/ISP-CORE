import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemeSwitch from '../../componentes/themeSwitch';

const EventosFacturaScreen = ({ route, navigation }) => {
    const { id_factura, id_cliente } = route.params;
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const styles = getStyles(isDarkMode);

    // Cargar tema
    useEffect(() => {
        const loadTheme = async () => {
            const theme = await AsyncStorage.getItem('@theme');
            setIsDarkMode(theme === 'dark');
        };
        loadTheme();
    }, []);

    const fetchEventos = async () => {
        try {
            console.log('🔍 [EventosFacturaScreen] Solicitando eventos para factura:', id_factura);
            const response = await fetch('https://wellnet-rd.com:444/api/factura/obtener-eventos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_factura }),
            });

            const data = await response.json();
            console.log('📥 [EventosFacturaScreen] Eventos recibidos:', data.length, 'eventos');

            if (response.ok) {
                const eventosOrdenados = data.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
                setEventos(eventosOrdenados);
                console.log('✅ [EventosFacturaScreen] Eventos ordenados y establecidos:', eventosOrdenados.length);
            } else {
                throw new Error(data.message || 'Error al obtener los eventos');
            }
        } catch (error) {
            console.error('❌ [EventosFacturaScreen] Error al obtener los eventos:', error);
            Alert.alert('Error', error.message || 'Error al obtener los eventos.');
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
    }, [id_factura]);

    const registrarNavegacion = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0];
        const hora = fechaActual.toTimeString().split(' ')[0];
        const pantalla = 'EventosFacturaScreen';

        const datos = JSON.stringify({
            id_factura,
            id_cliente
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

    const renderEventIcon = (tipoEvento, size = 24, color = '#6B7280') => {
        const tipo = tipoEvento?.toLowerCase() || '';

        if (tipo.includes('crear') || tipo.includes('creada')) {
            return <Icon name="add-circle" size={size} color={color} />;
        }
        if (tipo.includes('artículo agregado') || tipo.includes('articulo agregado')) {
            return <Icon name="add-box" size={size} color={color} />;
        }
        if (tipo.includes('artículo eliminado') || tipo.includes('articulo eliminado')) {
            return <Icon name="delete" size={size} color={color} />;
        }
        if (tipo.includes('artículo editado') || tipo.includes('articulo editado')) {
            return <Icon name="edit" size={size} color={color} />;
        }
        if (tipo.includes('impri')) {
            return <Icon name="print" size={size} color={color} />;
        }
        if (tipo.includes('compartir') || tipo.includes('whatsapp') || tipo.includes('email') || tipo.includes('pdf')) {
            return <Icon name="share" size={size} color={color} />;
        }
        if (tipo.includes('nota')) {
            return <Icon name="note-add" size={size} color={color} />;
        }
        if (tipo.includes('pago') || tipo.includes('cobro')) {
            return <Icon name="attach-money" size={size} color={color} />;
        }
        if (tipo.includes('monto') || tipo.includes('edit')) {
            return <Icon name="edit" size={size} color={color} />;
        }
        if (tipo.includes('visualizar') || tipo.includes('ver')) {
            return <Icon name="visibility" size={size} color={color} />;
        }
        if (tipo.includes('revisión') || tipo.includes('revision')) {
            return <Icon name="rate-review" size={size} color={color} />;
        }
        return <Icon name="history" size={size} color={color} />;
    };

    const getEventColor = (tipoEvento) => {
        const tipo = tipoEvento?.toLowerCase() || '';

        if (tipo.includes('crear') || tipo.includes('creada')) return '#10B981'; // Verde
        if (tipo.includes('artículo agregado') || tipo.includes('articulo agregado')) return '#3B82F6'; // Azul
        if (tipo.includes('artículo eliminado') || tipo.includes('articulo eliminado')) return '#EF4444'; // Rojo
        if (tipo.includes('artículo editado') || tipo.includes('articulo editado')) return '#F59E0B'; // Naranja
        if (tipo.includes('impri')) return '#8B5CF6'; // Púrpura
        if (tipo.includes('compartir') || tipo.includes('whatsapp') || tipo.includes('email') || tipo.includes('pdf')) return '#06B6D4'; // Cyan
        if (tipo.includes('nota')) return '#14B8A6'; // Teal
        if (tipo.includes('pago') || tipo.includes('cobro')) return '#10B981'; // Verde
        if (tipo.includes('monto') || tipo.includes('edit')) return '#F59E0B'; // Naranja
        if (tipo.includes('visualizar') || tipo.includes('ver')) return '#6B7280'; // Gris
        if (tipo.includes('revisión') || tipo.includes('revision')) return '#EC4899'; // Rosa
        return '#6B7280'; // Gris por defecto
    };

    const formatDateTime = (fechaHora) => {
        const date = new Date(fechaHora);
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

    // Componente para mostrar detalles parseados del JSON
    const EventExtraData = ({ rawJson }) => {
        if (!rawJson || typeof rawJson !== 'string') return null;

        try {
            const data = JSON.parse(rawJson);

            // Si el objeto está vacío, no mostrar nada
            if (!data || typeof data !== 'object' || Object.keys(data).length === 0) return null;

            const formatCurrency = (amount) => {
                const num = parseFloat(amount);
                if (isNaN(num)) return 'RD$0.00';
                return `RD$${num.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            };

            // Detectar tipo de evento basado en las claves del JSON
            const hasArticuloAgregado = 'id_producto_servicio' in data && 'descripcion' in data && 'precio_unitario' in data;
            const hasArticulosEditados = 'articulos_modificados' in data || 'cambios_detallados' in data;

            // Renderizar datos de artículo agregado
            if (hasArticuloAgregado) {
                return (
                    <View style={styles.extraDataContainer}>
                        <View style={styles.extraDataHeader}>
                            <Icon name="info" size={14} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                            <Text style={[styles.extraDataTitle, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                                Detalles del artículo
                            </Text>
                        </View>
                        <View style={styles.extraDataContent}>
                            {data.descripcion && (
                                <View style={styles.extraDataRow}>
                                    <Text style={[styles.extraDataBullet, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>•</Text>
                                    <Text style={[styles.extraDataLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Descripción:
                                    </Text>
                                    <Text style={[styles.extraDataValue, { color: isDarkMode ? '#D1D5DB' : '#374151' }]} numberOfLines={2}>
                                        {data.descripcion}
                                    </Text>
                                </View>
                            )}
                            {data.cantidad !== undefined && (
                                <View style={styles.extraDataRow}>
                                    <Text style={[styles.extraDataBullet, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>•</Text>
                                    <Text style={[styles.extraDataLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Cantidad:
                                    </Text>
                                    <Text style={[styles.extraDataValue, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                        {data.cantidad}
                                    </Text>
                                </View>
                            )}
                            {data.precio_unitario !== undefined && (
                                <View style={styles.extraDataRow}>
                                    <Text style={[styles.extraDataBullet, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>•</Text>
                                    <Text style={[styles.extraDataLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Precio unitario:
                                    </Text>
                                    <Text style={[styles.extraDataValue, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                        {formatCurrency(data.precio_unitario)}
                                    </Text>
                                </View>
                            )}
                            {data.descuento !== undefined && (
                                <View style={styles.extraDataRow}>
                                    <Text style={[styles.extraDataBullet, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>•</Text>
                                    <Text style={[styles.extraDataLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Descuento:
                                    </Text>
                                    <Text style={[styles.extraDataValue, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                        {formatCurrency(data.descuento)}
                                    </Text>
                                </View>
                            )}
                            {data.total !== undefined && (
                                <View style={styles.extraDataRow}>
                                    <Text style={[styles.extraDataBullet, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>•</Text>
                                    <Text style={[styles.extraDataLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Total:
                                    </Text>
                                    <Text style={[styles.extraDataValue, { color: isDarkMode ? '#10B981' : '#059669', fontWeight: '600' }]}>
                                        {formatCurrency(data.total)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                );
            }

            // Renderizar datos de artículos editados
            if (hasArticulosEditados) {
                return (
                    <View style={styles.extraDataContainer}>
                        <View style={styles.extraDataHeader}>
                            <Icon name="info" size={14} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                            <Text style={[styles.extraDataTitle, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                                Resumen de cambios
                            </Text>
                        </View>
                        <View style={styles.extraDataContent}>
                            {data.articulos_modificados !== undefined && (
                                <View style={styles.extraDataRow}>
                                    <Text style={[styles.extraDataBullet, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>•</Text>
                                    <Text style={[styles.extraDataLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Artículos modificados:
                                    </Text>
                                    <Text style={[styles.extraDataValue, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                        {data.articulos_modificados}
                                    </Text>
                                </View>
                            )}
                            {data.monto_total_anterior !== undefined && (
                                <View style={styles.extraDataRow}>
                                    <Text style={[styles.extraDataBullet, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>•</Text>
                                    <Text style={[styles.extraDataLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Monto total anterior:
                                    </Text>
                                    <Text style={[styles.extraDataValue, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                                        {formatCurrency(data.monto_total_anterior)}
                                    </Text>
                                </View>
                            )}
                            {data.monto_total_nuevo !== undefined && (
                                <View style={styles.extraDataRow}>
                                    <Text style={[styles.extraDataBullet, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>•</Text>
                                    <Text style={[styles.extraDataLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Monto total nuevo:
                                    </Text>
                                    <Text style={[styles.extraDataValue, { color: isDarkMode ? '#10B981' : '#059669', fontWeight: '600' }]}>
                                        {formatCurrency(data.monto_total_nuevo)}
                                    </Text>
                                </View>
                            )}

                            {/* Cambios detallados si existen */}
                            {data.cambios_detallados && Array.isArray(data.cambios_detallados) && data.cambios_detallados.length > 0 && (
                                <>
                                    <View style={styles.extraDataDivider} />
                                    <Text style={[styles.extraDataSubtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Cambios detallados:
                                    </Text>
                                    {data.cambios_detallados.map((cambio, index) => (
                                        <View key={index} style={styles.extraDataChangeItem}>
                                            <Text style={[styles.extraDataBullet, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>•</Text>
                                            <Text style={[styles.extraDataValue, { color: isDarkMode ? '#D1D5DB' : '#374151', flex: 1 }]} numberOfLines={2}>
                                                {cambio.descripcion || 'Sin descripción'}
                                                {cambio.cantidad_anterior !== undefined && cambio.cantidad_nueva !== undefined && (
                                                    <Text style={[styles.extraDataChange, { color: isDarkMode ? '#F59E0B' : '#D97706' }]}>
                                                        {' — '}Cantidad: {parseFloat(cambio.cantidad_anterior).toFixed(2)} → {parseFloat(cambio.cantidad_nueva).toFixed(2)}
                                                    </Text>
                                                )}
                                            </Text>
                                        </View>
                                    ))}
                                </>
                            )}
                        </View>
                    </View>
                );
            }

            // Si no coincide con ningún formato conocido, mostrar mensaje genérico
            return (
                <View style={styles.extraDataContainer}>
                    <View style={styles.extraDataHeader}>
                        <Icon name="info" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.extraDataTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Detalles adicionales
                        </Text>
                    </View>
                    <View style={styles.extraDataContent}>
                        <Text style={[styles.extraDataValue, { color: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 11, fontStyle: 'italic' }]}>
                            Información técnica disponible
                        </Text>
                    </View>
                </View>
            );

        } catch (error) {
            // Si falla el parseo, mostrar mensaje
            return (
                <View style={styles.extraDataContainer}>
                    <View style={styles.extraDataHeader}>
                        <Icon name="info" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.extraDataTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Detalles técnicos no disponibles
                        </Text>
                    </View>
                </View>
            );
        }
    };

    const renderItem = ({ item }) => {
        const { date, time } = formatDateTime(item.fecha_hora);
        const eventColor = getEventColor(item.tipo_evento);

        return (
            <View
                style={[styles.eventCard, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <View style={[styles.eventIcon, { backgroundColor: eventColor + '20' }]}>
                            {renderEventIcon(item.tipo_evento, 24, eventColor)}
                        </View>
                        <View style={styles.headerText}>
                            <Text style={[styles.eventTitle, { color: isDarkMode ? '#F3F4F6' : '#1F2937' }]}>
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
                </View>

                {item.descripcion && (
                    <View style={styles.cardBody}>
                        <Text style={[styles.descripcion, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>
                            {item.descripcion}
                        </Text>
                    </View>
                )}

                <View style={styles.metaInfo}>
                    <View style={styles.metaRow}>
                        <Icon name="person" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.metaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            {item.nombre_usuario || 'Usuario desconocido'} (ID: {item.id_usuario})
                        </Text>
                    </View>

                    {/* Detalles parseados del JSON */}
                    {item.detalles && <EventExtraData rawJson={item.detalles} />}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTextContainer}>
                        <View style={styles.titleContainer}>
                            <Icon name="history" size={34} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                            <Text style={styles.title}>Historial de Eventos</Text>
                        </View>
                        <Text style={styles.subtitle}>
                            Factura #{id_factura}
                        </Text>
                        <Text style={styles.subtitle}>
                            {eventos.length} {eventos.length === 1 ? 'evento registrado' : 'eventos registrados'}
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
                        <Text style={styles.loadingText}>Cargando eventos...</Text>
                    </View>
                ) : eventos.length > 0 ? (
                    <FlatList
                        data={eventos}
                        keyExtractor={(item, index) => item.id_evento?.toString() || index.toString()}
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
                        <Icon name="history" size={64} color={isDarkMode ? '#4B5563' : '#9CA3AF'} />
                        <Text style={styles.emptyTitle}>Sin eventos registrados</Text>
                        <Text style={styles.emptySubtitle}>
                            No hay actividad registrada para esta factura
                        </Text>
                        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                            <Icon name="refresh" size={20} color="#FFFFFF" />
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
    headerTextContainer: {
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
        marginTop: 2,
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

    // Event Card Styles
    eventCard: {
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
        marginBottom: 8,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    eventIcon: {
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
    eventTitle: {
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
        paddingBottom: 8,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#334155' : '#F1F5F9',
    },
    descripcion: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 8,
        fontWeight: '500',
    },
    metaInfo: {
        gap: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#334155' : '#F1F5F9',
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

    // Extra Data Styles (parsed JSON)
    extraDataContainer: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#374151' : '#E5E7EB',
    },
    extraDataHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    extraDataTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    extraDataContent: {
        gap: 6,
    },
    extraDataRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingLeft: 4,
    },
    extraDataBullet: {
        fontSize: 14,
        marginRight: 6,
        marginTop: 1,
    },
    extraDataLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginRight: 6,
        minWidth: 90,
    },
    extraDataValue: {
        fontSize: 12,
        fontWeight: '400',
        flex: 1,
        flexWrap: 'wrap',
    },
    extraDataDivider: {
        height: 1,
        backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
        marginVertical: 8,
    },
    extraDataSubtitle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
        marginLeft: 20,
    },
    extraDataChangeItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingLeft: 20,
        marginBottom: 4,
    },
    extraDataChange: {
        fontSize: 11,
        fontWeight: '500',
        fontStyle: 'italic',
    },
});

export default EventosFacturaScreen;
