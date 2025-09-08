import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';

const ConnectionTypeItemModern = ({ item, styles, onToggleSwitch, onLongPress, isDarkMode }) => {
    const getStatusStyle = (estado) => {
        const isActive = estado === 'activo';
        return {
            badge: isActive ? styles.statusActive : styles.statusInactive,
            text: isActive ? styles.statusTextActive : styles.statusTextInactive,
            label: isActive ? '🟢 Activo' : '🔴 Inactivo'
        };
    };

    const statusInfo = getStatusStyle(item.estado);

    const handleLongPress = () => {
        if (onLongPress) {
            onLongPress(item);
        }
    };

    const handleToggle = (newValue) => {
        if (onToggleSwitch) {
            onToggleSwitch(item.id_tipo_conexion, newValue);
        }
    };

    return (
        <TouchableOpacity 
            style={styles.connectionTypeCard} 
            onLongPress={handleLongPress} 
            activeOpacity={0.8}
        >
            {/* Header with ID and Status */}
            <View style={styles.connectionTypeHeader}>
                <Text style={styles.connectionTypeId}>
                    🏷️ Tipo #{item.id_tipo_conexion}
                </Text>
                <View style={[styles.statusBadge, statusInfo.badge]}>
                    <Text style={statusInfo.text}>{statusInfo.label}</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.connectionTypeContent}>
                {/* Description */}
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>📝</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Descripción</Text>
                        <Text style={styles.detailValue}>{item.descripcion_tipo_conexion}</Text>
                    </View>
                </View>

                {/* Creation Date (if available) */}
                {item.fecha_creacion && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📅</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Fecha de Creación</Text>
                            <Text style={styles.detailValue}>
                                {new Date(item.fecha_creacion).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Switch Section */}
                <View style={styles.switchSection}>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Estado del Tipo</Text>
                        <Text style={styles.switchStatus}>
                            {item.estado === 'activo' ? 'Habilitado' : 'Deshabilitado'}
                        </Text>
                    </View>
                    <Switch
                        value={item.estado === 'activo'}
                        onValueChange={handleToggle}
                        thumbColor={isDarkMode ? '#FFFFFF' : '#3B82F6'}
                        trackColor={{ 
                            false: isDarkMode ? '#374151' : '#D1D5DB', 
                            true: '#3B82F6' 
                        }}
                        style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
                    />
                </View>

                {/* Usage Info (if available) */}
                {item.conexiones_count !== undefined && (
                    <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                        <View style={styles.detailIcon}>
                            <Text>🔌</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Conexiones Usando Este Tipo</Text>
                            <Text style={styles.detailValue}>
                                {item.conexiones_count} conexión{item.conexiones_count !== 1 ? 'es' : ''}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ConnectionTypeItemModern;