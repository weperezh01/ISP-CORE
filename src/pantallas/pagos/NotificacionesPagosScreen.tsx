import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './NotificacionesPagosStyles';

const NotificacionesPagosScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    
    // Estados principales
    const [userId, setUserId] = useState(null);
    const [notificaciones, setNotificaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showOnlyUnread, setShowOnlyUnread] = useState(false);
    const [totalNoLeidas, setTotalNoLeidas] = useState(0);
    
    // Estados de modal
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    useEffect(() => {
        initializeScreen();
    }, []);

    useEffect(() => {
        if (userId) {
            loadNotificaciones();
        }
    }, [userId, showOnlyUnread]);

    const initializeScreen = async () => {
        try {
            console.log('🔄 [INIT] Inicializando pantalla de notificaciones...');
            
            const loginData = await AsyncStorage.getItem('@loginData');
            if (loginData) {
                const user = JSON.parse(loginData);
                console.log('✅ [INIT] Usuario encontrado:', user.nombre || 'Sin nombre');
                setUserId(user.id);
            } else {
                console.warn('⚠️ [INIT] No se encontraron datos de login');
                // Usar ID temporal para demo
                setUserId('demo_user');
            }
        } catch (error) {
            console.error('❌ [INIT] Error inicializando pantalla:', error);
            // Usar ID temporal para demo
            setUserId('demo_user');
        }
    };

    const loadNotificaciones = async () => {
        if (!userId) return;
        
        try {
            setIsLoading(true);
            console.log('🔔 [NOTIFICATIONS] Cargando notificaciones para usuario:', userId);
            
            // Si es usuario demo, cargar notificaciones de demostración
            if (userId === 'demo_user') {
                console.log('🎭 [NOTIFICATIONS] Cargando notificaciones de demostración...');
                await loadDemoNotifications();
                return;
            }
            
            // Timeout para la petición
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout')), 10000);
            });
            
            const fetchPromise = fetch('https://wellnet-rd.com:444/api/pagos/notificaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: userId,
                    limite: 50,
                    offset: 0,
                    solo_no_leidas: showOnlyUnread
                }),
            });
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            const data = await response.json();
            
            if (response.ok && data.success) {
                setNotificaciones(data.data.notificaciones || []);
                setTotalNoLeidas(data.data.total_no_leidas || 0);
                console.log('✅ [NOTIFICATIONS] Notificaciones cargadas:', data.data.notificaciones?.length || 0);
            } else {
                console.warn('⚠️ [NOTIFICATIONS] Error en respuesta:', data);
                await loadDemoNotifications();
            }
        } catch (error) {
            console.error('❌ [NOTIFICATIONS] Error:', error);
            console.log('🔄 [NOTIFICATIONS] Cargando notificaciones de demostración...');
            await loadDemoNotifications();
        } finally {
            setIsLoading(false);
        }
    };

    const loadDemoNotifications = async () => {
        // Simular delay de carga
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const notificacionesDemo = [
            {
                id: 1,
                titulo: 'Pago Exitoso',
                mensaje: 'Tu pago de RD$ 1,500.00 ha sido procesado exitosamente. Método: Visa **** 4242',
                tipo: 'pago_exitoso',
                fecha_creacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
                leida: false,
                datos_adicionales: {
                    monto: 1500,
                    metodo_pago: 'Visa **** 4242',
                    transaccion_id: 'demo_1234567890'
                }
            },
            {
                id: 2,
                titulo: 'Pago Fallido',
                mensaje: 'No se pudo procesar tu pago de RD$ 1,200.00. Motivo: Fondos insuficientes.',
                tipo: 'pago_fallido',
                fecha_creacion: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
                leida: false,
                datos_adicionales: {
                    monto: 1200,
                    metodo_pago: 'Visa **** 1234',
                    error: 'insufficient_funds'
                }
            },
            {
                id: 3,
                titulo: 'Reintento Programado',
                mensaje: 'Se intentará procesar tu pago nuevamente en 24 horas.',
                tipo: 'reintento_programado',
                fecha_creacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
                leida: true,
                datos_adicionales: {
                    fecha_reintento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                }
            },
            {
                id: 4,
                titulo: 'Configuración Actualizada',
                mensaje: 'Se ha actualizado tu método de pago PayPal correctamente.',
                tipo: 'configuracion_actualizada',
                fecha_creacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
                leida: true,
                datos_adicionales: {
                    tipo_cambio: 'metodo_pago_paypal'
                }
            },
            {
                id: 5,
                titulo: 'Pago Exitoso',
                mensaje: 'Tu pago de RD$ 850.00 vía PayPal ha sido confirmado.',
                tipo: 'pago_exitoso',
                fecha_creacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
                leida: true,
                datos_adicionales: {
                    monto: 850,
                    metodo_pago: 'PayPal',
                    transaccion_id: 'paypal_demo_456'
                }
            },
            {
                id: 6,
                titulo: 'Reintento Fallido',
                mensaje: 'El reintento de pago no fue exitoso. Por favor, verifica tu método de pago.',
                tipo: 'reintento_fallido',
                fecha_creacion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 días atrás
                leida: false,
                datos_adicionales: {
                    monto: 1200,
                    intentos: 3,
                    ultimo_error: 'card_declined'
                }
            }
        ];
        
        // Filtrar por leídas/no leídas si es necesario
        const notificacionesFiltradas = showOnlyUnread 
            ? notificacionesDemo.filter(n => !n.leida)
            : notificacionesDemo;
            
        setNotificaciones(notificacionesFiltradas);
        setTotalNoLeidas(notificacionesDemo.filter(n => !n.leida).length);
        
        console.log('✅ [NOTIFICATIONS] Notificaciones de demostración cargadas:', notificacionesFiltradas.length);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotificaciones();
        setRefreshing(false);
    };

    const marcarComoLeida = async (notificationId) => {
        try {
            console.log('📖 [MARK-READ] Marcando notificación como leída:', notificationId);
            
            const response = await fetch('https://wellnet-rd.com:444/api/pagos/marcar-leida', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificacion_id: notificationId,
                    id_usuario: userId
                }),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Actualizar estado local
                setNotificaciones(prev => 
                    prev.map(notif => 
                        notif.id === notificationId 
                            ? { ...notif, leida: true }
                            : notif
                    )
                );
                
                // Actualizar contador
                setTotalNoLeidas(prev => Math.max(0, prev - 1));
                
                console.log('✅ [MARK-READ] Notificación marcada como leída');
            } else {
                console.warn('⚠️ [MARK-READ] Error:', data);
            }
        } catch (error) {
            console.error('❌ [MARK-READ] Error:', error);
        }
    };

    const marcarTodasComoLeidas = async () => {
        try {
            console.log('📖 [MARK-ALL-READ] Marcando todas las notificaciones como leídas');
            
            const response = await fetch('https://wellnet-rd.com:444/api/pagos/marcar-todas-leidas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: userId
                }),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Actualizar estado local
                setNotificaciones(prev => 
                    prev.map(notif => ({ ...notif, leida: true }))
                );
                setTotalNoLeidas(0);
                
                console.log('✅ [MARK-ALL-READ] Todas las notificaciones marcadas como leídas');
                Alert.alert('Éxito', 'Todas las notificaciones han sido marcadas como leídas');
            } else {
                console.warn('⚠️ [MARK-ALL-READ] Error:', data);
                Alert.alert('Error', 'No se pudieron marcar todas las notificaciones');
            }
        } catch (error) {
            console.error('❌ [MARK-ALL-READ] Error:', error);
            Alert.alert('Error', 'Error de conexión');
        }
    };

    const showNotificationDetail = (notification) => {
        setSelectedNotification(notification);
        setDetailModalVisible(true);
        
        // Marcar como leída si no lo está
        if (!notification.leida) {
            marcarComoLeida(notification.id);
        }
    };

    const getNotificationIcon = (tipo) => {
        switch (tipo) {
            case 'pago_exitoso':
                return { name: 'check-circle', color: '#34C759' };
            case 'pago_fallido':
                return { name: 'times-circle', color: '#FF3B30' };
            case 'reintento_programado':
                return { name: 'clock-o', color: '#FF9500' };
            case 'reintento_fallido':
                return { name: 'exclamation-triangle', color: '#FF6B35' };
            case 'configuracion_actualizada':
                return { name: 'cog', color: '#007AFF' };
            default:
                return { name: 'bell', color: '#8E8E93' };
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffHours < 1) {
            return 'Hace menos de 1 hora';
        } else if (diffHours < 24) {
            return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const renderNotification = (notification) => {
        const icon = getNotificationIcon(notification.tipo);
        const isUnread = !notification.leida;
        
        return (
            <TouchableOpacity
                key={notification.id}
                style={[
                    styles.notificationCard,
                    isUnread && styles.unreadNotification
                ]}
                onPress={() => showNotificationDetail(notification)}
            >
                <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                        <View style={styles.notificationIcon}>
                            <Icon name={icon.name} size={24} color={icon.color} />
                        </View>
                        <View style={styles.notificationInfo}>
                            <Text style={[
                                styles.notificationTitle,
                                isUnread && styles.unreadTitle
                            ]}>
                                {notification.titulo}
                            </Text>
                            <Text style={styles.notificationTime}>
                                {formatTimestamp(notification.fecha_creacion)}
                            </Text>
                        </View>
                        {isUnread && (
                            <View style={styles.unreadIndicator}>
                                <View style={styles.unreadDot} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                        {notification.mensaje}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderDetailModal = () => {
        if (!selectedNotification) return null;
        
        const icon = getNotificationIcon(selectedNotification.tipo);
        
        return (
            <Modal
                visible={detailModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIcon}>
                                <Icon name={icon.name} size={32} color={icon.color} />
                            </View>
                            <Text style={styles.modalTitle}>
                                {selectedNotification.titulo}
                            </Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setDetailModalVisible(false)}
                            >
                                <Icon name="times" size={20} color={isDarkMode ? '#FFFFFF' : '#1A1A1A'} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalMessage}>
                                {selectedNotification.mensaje}
                            </Text>
                            
                            <View style={styles.modalDetails}>
                                <Text style={styles.modalDetailLabel}>Fecha:</Text>
                                <Text style={styles.modalDetailValue}>
                                    {new Date(selectedNotification.fecha_creacion).toLocaleString('es-ES')}
                                </Text>
                            </View>
                            
                            <View style={styles.modalDetails}>
                                <Text style={styles.modalDetailLabel}>Tipo:</Text>
                                <Text style={styles.modalDetailValue}>
                                    {selectedNotification.tipo.replace(/_/g, ' ')}
                                </Text>
                            </View>
                            
                            {selectedNotification.datos_adicionales && (
                                <View style={styles.modalDetails}>
                                    <Text style={styles.modalDetailLabel}>Información adicional:</Text>
                                    <Text style={styles.modalDetailValue}>
                                        {typeof selectedNotification.datos_adicionales === 'string' 
                                            ? selectedNotification.datos_adicionales 
                                            : JSON.stringify(selectedNotification.datos_adicionales, null, 2)
                                        }
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                        
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setDetailModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando notificaciones...</Text>
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
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.title}>Notificaciones</Text>
                    {totalNoLeidas > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{totalNoLeidas}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    onPress={marcarTodasComoLeidas}
                    disabled={totalNoLeidas === 0}
                    style={totalNoLeidas === 0 && styles.disabledButton}
                >
                    <Icon 
                        name="check-circle" 
                        size={24} 
                        color={totalNoLeidas > 0 ? '#34C759' : '#8E8E93'} 
                    />
                </TouchableOpacity>
            </View>

            {/* Filtros */}
            <View style={styles.filtersContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        !showOnlyUnread && styles.filterButtonActive
                    ]}
                    onPress={() => setShowOnlyUnread(false)}
                >
                    <Text style={[
                        styles.filterButtonText,
                        !showOnlyUnread && styles.filterButtonTextActive
                    ]}>
                        Todas ({notificaciones.length})
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        showOnlyUnread && styles.filterButtonActive
                    ]}
                    onPress={() => setShowOnlyUnread(true)}
                >
                    <Text style={[
                        styles.filterButtonText,
                        showOnlyUnread && styles.filterButtonTextActive
                    ]}>
                        No leídas ({totalNoLeidas})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Lista de notificaciones */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Mensaje informativo para notificaciones de demostración */}
                {userId === 'demo_user' && notificaciones.length > 0 && (
                    <View style={styles.demoMessage}>
                        <Icon name="info-circle" size={16} color="#007AFF" />
                        <Text style={styles.demoMessageText}>
                            Notificaciones de demostración. Datos simulados para pruebas.
                        </Text>
                    </View>
                )}
                
                {notificaciones.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="bell-slash" size={64} color="#8E8E93" />
                        <Text style={styles.emptyText}>
                            {showOnlyUnread ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {showOnlyUnread 
                                ? 'Todas las notificaciones han sido leídas' 
                                : 'Las notificaciones de pagos aparecerán aquí'
                            }
                        </Text>
                    </View>
                ) : (
                    <View style={styles.notificationsContainer}>
                        {notificaciones.map(renderNotification)}
                    </View>
                )}
            </ScrollView>

            {/* Modal de detalle */}
            {renderDetailModal()}
        </View>
    );
};

export default NotificacionesPagosScreen;