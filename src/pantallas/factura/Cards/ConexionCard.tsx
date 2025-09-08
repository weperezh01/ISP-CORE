import React from 'react';
import { View, Text } from 'react-native';

const ConexionCard = ({ conexionData, styles }) => {
    if (!conexionData) {
        return (
            <View style={styles.cardStyle}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>🔌 Detalles de la Conexión</Text>
                    <View style={styles.connectionBadge}>
                        <Text style={styles.connectionBadgeText}>N/A</Text>
                    </View>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.text}>No hay información de conexión disponible para esta factura.</Text>
                </View>
            </View>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-DO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'America/Santo_Domingo'
        });
    };

    return (
        <View style={styles.cardStyle}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🔌 Detalles de la Conexión</Text>
                <View style={styles.connectionBadge}>
                    <Text style={styles.connectionBadgeText}>#{conexionData.id_conexion}</Text>
                </View>
            </View>
            
            <View style={styles.cardContent}>
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>🆔</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>ID de Conexión</Text>
                        <Text style={styles.value}>{conexionData.id_conexion}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>📍</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Dirección de Instalación</Text>
                        <Text style={styles.value}>{conexionData.direccion || 'N/A'}</Text>
                    </View>
                </View>

                {conexionData.referencia && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>🗺️</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.label}>Referencia</Text>
                            <Text style={styles.value}>{conexionData.referencia}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>⚡</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Estado de Conexión</Text>
                        <Text style={[
                            styles.value,
                            conexionData.estado_conexion === 'Activo' 
                                ? { color: '#10B981' } 
                                : { color: '#EF4444' }
                        ]}>
                            {conexionData.estado_conexion || 'N/A'}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>📅</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Fecha de Contratación</Text>
                        <Text style={styles.value}>{formatDate(conexionData.fecha_contratacion)}</Text>
                    </View>
                </View>

                {/* Additional service details if available */}
                {conexionData.tipoServicio && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>🌐</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.label}>Tipo de Servicio</Text>
                            <Text style={styles.value}>{conexionData.tipoServicio.nombre_servicio || 'N/A'}</Text>
                        </View>
                    </View>
                )}

                {conexionData.ip_address && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>🔗</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.label}>Dirección IP</Text>
                            <Text style={styles.value}>{conexionData.ip_address}</Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

export default ConexionCard;