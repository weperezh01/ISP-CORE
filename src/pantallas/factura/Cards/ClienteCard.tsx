import React from 'react';
import { View, Text } from 'react-native';

const ClienteCard = ({ facturaData, styles, formatPhoneNumber }) => {
    const getClientInitials = () => {
        const firstName = facturaData?.cliente?.nombres?.charAt(0) || '';
        const lastName = facturaData?.cliente?.apellidos?.charAt(0) || '';
        return (firstName + lastName).toUpperCase();
    };

    return (
        <View style={styles.cardStyle}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>👤 Información del Cliente</Text>
                <View style={styles.clientBadge}>
                    <Text style={styles.clientBadgeText}>{getClientInitials()}</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>🆔</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>ID Cliente</Text>
                        <Text style={styles.value}>{facturaData?.cliente?.id_cliente || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>👨‍💼</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Nombre Completo</Text>
                        <Text style={styles.value}>
                            {`${facturaData?.cliente?.nombres?.trim() || ''} ${facturaData?.cliente?.apellidos?.trim() || ''}`.trim() || 'N/A'}
                        </Text>
                    </View>
                </View>

                {facturaData?.cliente?.telefono1 && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📞</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.label}>Teléfono Principal</Text>
                            <Text style={styles.value}>{formatPhoneNumber(facturaData.cliente.telefono1)}</Text>
                        </View>
                    </View>
                )}

                {facturaData?.cliente?.telefono2 && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📱</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.label}>Teléfono Secundario</Text>
                            <Text style={styles.value}>{formatPhoneNumber(facturaData.cliente.telefono2)}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>📍</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Dirección</Text>
                        <Text style={styles.value}>{facturaData?.cliente?.direccion || 'N/A'}</Text>
                    </View>
                </View>

                {facturaData?.cliente?.correo_elect && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📧</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.label}>Correo Electrónico</Text>
                            <Text style={styles.value}>{facturaData.cliente.correo_elect}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>🆔</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Cédula/RNC</Text>
                        <Text style={styles.value}>
                            {facturaData?.cliente?.cedula || facturaData?.cliente?.rnc || 'N/A'}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>📅</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Cliente desde</Text>
                        <Text style={styles.value}>
                            {facturaData?.cliente?.fecha_creacion_cliente
                                ? new Date(facturaData.cliente.fecha_creacion_cliente).toLocaleDateString('es-DO', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric' 
                                })
                                : 'N/A'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ClienteCard;