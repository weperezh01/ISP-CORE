import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';

const ConnectionItemModern = ({ item, styles, navigation, onPress, realtimeData, isExpanded, onToggleExpanded }) => {
    // Usar datos de tiempo real pasados como prop o estado por defecto
    const realTimeData = realtimeData || {
        downloadSpeed: 0,
        uploadSpeed: 0,
        status: 'unknown',
        isLoading: false,
        lastUpdate: null
    };

    // Función para formatear velocidades en tiempo real
    const formatRealtimeSpeed = (bps) => {
        if (!bps || bps === 0) return '0 bps';
        const k = 1000;
        const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
        const i = Math.floor(Math.log(bps) / Math.log(k));
        const value = parseFloat((bps / Math.pow(k, i)).toFixed(1));
        return `${value} ${sizes[i]}`;
    };

    // Función para obtener información de estado según error code
    const getRealtimeStatus = (errorCode, statusCode) => {
        switch(errorCode) {
            case 'MISSING_IP_ADDRESS':
                return { 
                    status: '⚠️ Sin IP configurada', 
                    color: '#F59E0B',
                    message: 'Sin IP configurada'
                };
            case 'MISSING_ROUTER':
                return { 
                    status: '⚠️ Sin router asignado', 
                    color: '#F59E0B',
                    message: 'Sin router asignado'
                };
            case 'ROUTER_TIMEOUT':
                return { 
                    status: '⏱️ Router no responde', 
                    color: '#EF4444',
                    message: 'Router no responde'
                };
            case 'ROUTER_CONNECTION_FAILED':
                return { 
                    status: '🔌 Error de conexión', 
                    color: '#EF4444',
                    message: 'Error de conexión'
                };
            default:
                return { 
                    status: '❌ Error desconocido', 
                    color: '#6B7280',
                    message: `Error ${statusCode || 'desconocido'}`
                };
        }
    };

    // Determinar el estado de configuración
    const getConfigStatus = () => {
        // Verificar si tenemos IP y router configurados
        const hasIp = item.direccion_ipv4 || realTimeData?.ipAddress;
        const hasRouter = item.id_router || realTimeData?.routerInfo?.id_router;
        
        if (!hasIp && !hasRouter) {
            return {
                status: 'config_error',
                errorCode: 'MISSING_BOTH',
                errorMessage: 'Sin IP ni router configurados'
            };
        } else if (!hasIp) {
            return {
                status: 'config_error',
                errorCode: 'MISSING_IP_ADDRESS',
                errorMessage: 'Sin IP configurada'
            };
        } else if (!hasRouter) {
            return {
                status: 'config_error',
                errorCode: 'MISSING_ROUTER',
                errorMessage: 'Sin router asignado'
            };
        }
        return null;
    };

    // Si no hay datos de tiempo real y hay problemas de configuración, mostrar error
    const configError = !realTimeData && getConfigStatus();
    const finalRealTimeData = configError ? { ...realTimeData, ...configError } : realTimeData;

    const getStatusStyle = (estado) => {
        const status = estado?.toLowerCase() || '';
        if (status.includes('activ')) {
            return {
                badge: styles.statusActive,
                text: styles.statusTextActive,
                label: '🟢 Activa'
            };
        } else if (status.includes('inactiv') || status.includes('suspend')) {
            return {
                badge: styles.statusInactive,
                text: styles.statusTextInactive,
                label: '🔴 Inactiva'
            };
        } else {
            return {
                badge: styles.statusPending,
                text: styles.statusTextPending,
                label: '🟡 Pendiente'
            };
        }
    };

    const formatAddress = (address) => {
        if (!address) return 'Dirección no disponible';
        return address.length > 40 ? `${address.substring(0, 40)}...` : address;
    };

    const formatClientName = (cliente) => {
        if (!cliente) return 'Cliente no asignado';
        const nombres = cliente.nombres || '';
        const apellidos = cliente.apellidos || '';
        return `${nombres} ${apellidos}`.trim() || 'Sin nombre';
    };

    const formatSpeed = (velocidad) => {
        if (!velocidad) return 'No especificada';
        return `${velocidad} Mbps`;
    };

    const formatIP = () => {
        // Mostrar la IP que se está usando para las consultas RT
        const ip = realTimeData?.ipAddress || item.direccion_ipv4;
        if (!ip) return 'No asignada';
        
        // Indicar si tiene datos RT activos
        const hasActivity = realTimeData && (realTimeData.downloadSpeed > 0 || realTimeData.uploadSpeed > 0);
        const statusIcon = hasActivity ? '✅' : realTimeData ? '🟡' : '⚪';
        
        return `${statusIcon} ${ip}`;
    };
    
    const formatRouterInfo = () => {
        if (realTimeData?.routerInfo) {
            const router = realTimeData.routerInfo;
            return `${router.nombre || `Router ${router.id_router}`}`;
        }
        return null;
    };

    const formatService = (servicio) => {
        return servicio?.nombre_servicio || 'Sin servicio asignado';
    };

    const formatMonthlyPrice = (servicio) => {
        if (!servicio?.precio_servicio) return 'No definido';
        return formatCurrency(servicio.precio_servicio);
    };

    const formatInstallationPrice = (precio) => {
        if (!precio) return 'Gratuita';
        return formatCurrency(precio);
    };

    const formatBillingDay = (ciclo_base) => {
        if (!ciclo_base?.dia_mes) return 'No definido';
        return `Día ${ciclo_base.dia_mes}`;
    };

    const formatBillingDetail = (ciclo_base) => {
        return ciclo_base?.detalle || 'Sin detalle';
    };

    const statusInfo = getStatusStyle(item.estado_conexion?.estado);

    const handlePress = () => {
        if (onPress) {
            onPress(item);
        } else {
            navigation.navigate('ConexionDetalles', { 
                connectionId: item.id_conexion, 
                id_cliente: item.cliente?.id_cliente || item.id_cliente 
            });
        }
    };

    // Renderizar vista colapsada (compacta)
    if (!isExpanded) {
        return (
            <TouchableOpacity 
                style={[
                    styles.connectionCard,
                    {
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        marginBottom: 8
                    }
                ]} 
                onPress={onToggleExpanded}
                activeOpacity={0.8}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Lado izquierdo: ID, Cliente e IP */}
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={[styles.connectionId, { fontSize: 14, marginRight: 8 }]}>
                                🔌 #{item.id_conexion}
                            </Text>
                            <View style={[styles.statusBadge, statusInfo.badge, { paddingHorizontal: 6, paddingVertical: 2 }]}>
                                <Text style={[statusInfo.text, { fontSize: 10 }]}>{statusInfo.label}</Text>
                            </View>
                        </View>
                        
                        <Text style={[styles.detailValue, { fontSize: 13, marginBottom: 2 }]} numberOfLines={1}>
                            👤 {item.cliente ? formatClientName(item.cliente) : `Cliente ID: ${item.id_cliente || 'No asignado'}`}
                        </Text>
                        
                        <Text style={[styles.detailValue, { fontSize: 12, opacity: 0.8 }]} numberOfLines={1}>
                            🌐 {formatIP()}
                        </Text>
                    </View>

                    {/* Lado derecho: Velocidades RT y botón expandir */}
                    <View style={{ alignItems: 'flex-end', minWidth: 100 }}>
                        {/* Velocidades en tiempo real compactas */}
                        <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            backgroundColor: finalRealTimeData.status === 'online' && (finalRealTimeData.downloadSpeed > 0 || finalRealTimeData.uploadSpeed > 0) 
                                ? 'rgba(34, 197, 94, 0.1)'
                                : 'rgba(156, 163, 175, 0.1)',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            marginBottom: 4
                        }}>
                            <View style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: finalRealTimeData.status === 'online' && (finalRealTimeData.downloadSpeed > 0 || finalRealTimeData.uploadSpeed > 0) 
                                    ? '#22C55E' : '#9CA3AF',
                                marginRight: 6
                            }} />
                            <Text style={{ fontSize: 10, fontWeight: '600', color: finalRealTimeData.downloadSpeed > 0 ? '#22C55E' : '#9CA3AF' }}>
                                ⬇{formatRealtimeSpeed(finalRealTimeData.downloadSpeed)}
                            </Text>
                            <Text style={{ fontSize: 10, marginHorizontal: 4, opacity: 0.5 }}>|</Text>
                            <Text style={{ fontSize: 10, fontWeight: '600', color: finalRealTimeData.uploadSpeed > 0 ? '#22C55E' : '#9CA3AF' }}>
                                ⬆{formatRealtimeSpeed(finalRealTimeData.uploadSpeed)}
                            </Text>
                        </View>
                        
                        <TouchableOpacity
                            onPress={onToggleExpanded}
                            style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: 4
                            }}
                        >
                            <Text style={{ fontSize: 10, color: '#3B82F6', fontWeight: '600' }}>
                                📋 Detalles
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // Renderizar vista expandida (completa)
    return (
        <TouchableOpacity style={styles.connectionCard} onPress={handlePress} activeOpacity={0.8}>
            {/* Header with ID and Status */}
            <View style={styles.connectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={styles.connectionId}>
                        🔌 Conexión #{item.id_conexion}
                    </Text>
                    <View style={[styles.statusBadge, statusInfo.badge, { marginLeft: 8 }]}>
                        <Text style={statusInfo.text}>{statusInfo.label}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={onToggleExpanded}
                    style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        backgroundColor: 'rgba(156, 163, 175, 0.2)',
                        borderRadius: 4
                    }}
                >
                    <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600' }}>
                        📄 Compacto
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Real-time speeds section */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: finalRealTimeData.status === 'online' && (finalRealTimeData.downloadSpeed > 0 || finalRealTimeData.uploadSpeed > 0) 
                    ? 'rgba(34, 197, 94, 0.1)'
                    : finalRealTimeData.status === 'config_error' || finalRealTimeData.status === 'error'
                        ? 'rgba(251, 146, 60, 0.1)'
                        : 'rgba(156, 163, 175, 0.1)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginTop: 8,
                borderRadius: 6,
                borderLeftWidth: 3,
                borderLeftColor: finalRealTimeData.status === 'online' && (finalRealTimeData.downloadSpeed > 0 || finalRealTimeData.uploadSpeed > 0) 
                    ? '#22C55E'
                    : finalRealTimeData.status === 'config_error' || finalRealTimeData.status === 'error'
                        ? '#F59E0B'
                        : '#9CA3AF'
            }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: finalRealTimeData.isLoading 
                                ? '#F59E0B' 
                                : finalRealTimeData.status === 'online' && (finalRealTimeData.downloadSpeed > 0 || finalRealTimeData.uploadSpeed > 0)
                                    ? '#22C55E'
                                    : finalRealTimeData.status === 'config_error' || finalRealTimeData.status === 'error'
                                        ? '#F59E0B'
                                        : '#9CA3AF',
                            marginRight: 6
                        }} />
                        <Text style={[styles.detailLabel, { fontSize: 12, fontWeight: '600' }]}>
                            {finalRealTimeData.isLoading 
                                ? 'Actualizando...' 
                                : finalRealTimeData.status === 'online' && (finalRealTimeData.downloadSpeed > 0 || finalRealTimeData.uploadSpeed > 0)
                                    ? 'Actividad en Tiempo Real'
                                    : finalRealTimeData.status === 'online'
                                        ? 'Online - Sin Actividad'
                                        : finalRealTimeData.status === 'config_error'
                                            ? finalRealTimeData.errorMessage || 'Configuración incompleta'
                                            : finalRealTimeData.status === 'error'
                                                ? finalRealTimeData.errorMessage || 'Error obteniendo datos'
                                                : 'Sin Datos RT'
                            }
                        </Text>
                    </View>
                    
                    {/* Solo mostrar velocidades si no hay errores de configuración graves */}
                    {finalRealTimeData.status !== 'config_error' ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={[styles.detailLabel, { fontSize: 10, marginBottom: 2 }]}>
                                    ⬇ DESCARGA
                                </Text>
                                <Text style={[
                                    styles.detailValue, 
                                    { 
                                        fontSize: 13, 
                                        fontWeight: 'bold',
                                        color: finalRealTimeData.downloadSpeed > 0 ? '#22C55E' : '#9CA3AF'
                                    }
                                ]}>
                                    {formatRealtimeSpeed(finalRealTimeData.downloadSpeed)}
                                </Text>
                            </View>
                            
                            <View style={{ alignItems: 'center' }}>
                                <Text style={[styles.detailLabel, { fontSize: 10, marginBottom: 2 }]}>
                                    ⬆ SUBIDA
                                </Text>
                                <Text style={[
                                    styles.detailValue, 
                                    { 
                                        fontSize: 13, 
                                        fontWeight: 'bold',
                                        color: finalRealTimeData.uploadSpeed > 0 ? '#22C55E' : '#9CA3AF'
                                    }
                                ]}>
                                    {formatRealtimeSpeed(finalRealTimeData.uploadSpeed)}
                                </Text>
                            </View>
                            
                            {finalRealTimeData.lastUpdate && (
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={[styles.detailLabel, { fontSize: 10, marginBottom: 2 }]}>
                                        🕒 ÚLTIMA ACTUALIZACIÓN
                                    </Text>
                                    <Text style={[styles.detailValue, { fontSize: 10, fontStyle: 'italic' }]}>
                                        {finalRealTimeData.lastUpdate.toLocaleTimeString('es', { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                            <Text style={[styles.detailLabel, { fontSize: 11, textAlign: 'center', fontStyle: 'italic' }]}>
                                Esta conexión requiere configuración adicional para el monitoreo en tiempo real
                            </Text>
                            <Text style={[styles.detailValue, { fontSize: 10, marginTop: 4, color: '#F59E0B' }]}>
                                {finalRealTimeData.errorCode === 'MISSING_IP_ADDRESS' 
                                    ? 'Contacte al administrador para asignar una dirección IP'
                                    : finalRealTimeData.errorCode === 'MISSING_ROUTER'
                                        ? 'Contacte al administrador para configurar el router'
                                        : 'Contacte al administrador para completar la configuración'
                                }
                            </Text>
                        </View>
                    )}
                    
                    {/* Información adicional del método de recolección */}
                    {finalRealTimeData?.collectionMethod && finalRealTimeData.collectionMethod !== 'unknown' && (
                        <View style={{ alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(156, 163, 175, 0.3)' }}>
                            <Text style={[styles.detailLabel, { fontSize: 9, textAlign: 'center', opacity: 0.7 }]}>
                                Método: {finalRealTimeData.collectionMethod.replace(/_/g, ' ')}
                                {finalRealTimeData.responseTime > 0 && ` • ${finalRealTimeData.responseTime}ms`}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Content */}
            <View style={styles.connectionContent}>
                {/* Details Grid */}
                <View style={styles.detailsGrid}>
                    {/* Address */}
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📍</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Dirección</Text>
                            <Text style={styles.detailValue}>{formatAddress(item.direccion)}</Text>
                        </View>
                    </View>

                    {/* Client */}
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>👤</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Cliente</Text>
                            <Text style={styles.detailValue}>
                                {item.cliente ? formatClientName(item.cliente) : `Cliente ID: ${item.id_cliente || 'No asignado'}`}
                            </Text>
                        </View>
                    </View>

                    {/* IP Address */}
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>🌐</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Dirección IP</Text>
                            <Text style={styles.detailValue}>{formatIP()}</Text>
                            {realTimeData?.ipAddress && realTimeData.ipAddress !== item.direccion_ipv4 && (
                                <Text style={[styles.detailLabel, { fontSize: 11, marginTop: 2, fontStyle: 'italic', color: '#10B981' }]}>
                                    📡 IP de router_direcciones_ip
                                </Text>
                            )}
                            {!item.direccion_ipv4 && realTimeData?.ipAddress && (
                                <Text style={[styles.detailLabel, { fontSize: 10, marginTop: 2, fontStyle: 'italic', color: '#F59E0B' }]}>
                                    ⚡ Solo en router_direcciones_ip
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Speed */}
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>⚡</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Velocidad</Text>
                            <Text style={styles.detailValue}>{formatSpeed(item.velocidad)}</Text>
                        </View>
                    </View>

                    {/* Service */}
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📦</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Servicio</Text>
                            <Text style={styles.detailValue}>{formatService(item.servicio)}</Text>
                            {formatRouterInfo() && (
                                <Text style={[styles.detailLabel, { fontSize: 11, marginTop: 2, fontStyle: 'italic' }]}>
                                    Router: {formatRouterInfo()}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Price Section */}
                <View style={styles.priceSection}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Precio Mensual</Text>
                        <Text style={styles.priceValue}>{formatMonthlyPrice(item.servicio)}</Text>
                        {item.precio && parseFloat(item.precio) > 0 && (
                            <Text style={[styles.detailLabel, { marginTop: 4 }]}>
                                Instalación: {formatInstallationPrice(item.precio)}
                            </Text>
                        )}
                    </View>
                    <View style={styles.billingInfo}>
                        <Text style={styles.detailLabel}>Facturación</Text>
                        <Text style={styles.billingDay}>{formatBillingDay(item.ciclo_base)}</Text>
                        {item.ciclo_base?.detalle && (
                            <Text style={[styles.detailLabel, { marginTop: 2, textAlign: 'right' }]}>
                                {formatBillingDetail(item.ciclo_base)}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Status Description */}
                {item.estado_conexion?.descripcion && (
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                        <Text style={[styles.detailLabel, { marginBottom: 4 }]}>Estado Detallado</Text>
                        <Text style={[styles.detailValue, { fontSize: 13, opacity: 0.8 }]}>
                            {item.estado_conexion.descripcion}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ConnectionItemModern;