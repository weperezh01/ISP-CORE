import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

const NotasCard = ({ facturaData, styles, handlePressNotaPendiente, formatDate }) => {
    const formatNoteDate = (fecha, hora) => {
        if (!fecha) return 'Fecha desconocida';
        
        const date = new Date(fecha);
        const formattedDate = date.toLocaleDateString('es-DO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        return hora ? `${formattedDate} a las ${hora}` : formattedDate;
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'revisado':
                return '#10B981'; // Green
            case 'en_revision':
                return '#F59E0B'; // Orange
            default:
                return '#6B7280'; // Gray
        }
    };

    const getStatusText = (estado) => {
        switch (estado) {
            case 'revisado':
                return '✅ Revisado';
            case 'en_revision':
                return '⏳ En Revisión';
            default:
                return '📝 Pendiente';
        }
    };

    return (
        <View style={styles.cardStyle}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>📝 Notas de la Factura</Text>
                <View style={styles.notesBadge}>
                    <Text style={styles.notesBadgeText}>
                        {facturaData?.notas?.length || 0}
                    </Text>
                </View>
            </View>
            
            <View style={styles.cardContent}>
                {!facturaData?.notas || facturaData.notas.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <Text style={{ fontSize: 48, marginBottom: 12 }}>📝</Text>
                        <Text style={styles.text}>No hay notas registradas para esta factura.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={facturaData.notas}
                        keyExtractor={(item) => item.id_nota.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    if (item.estado_revision === 'en_revision') {
                                        handlePressNotaPendiente(item);
                                    }
                                }}
                                disabled={item.estado_revision !== 'en_revision'}
                                activeOpacity={item.estado_revision === 'en_revision' ? 0.7 : 1}
                            >
                                <View style={[
                                    styles.notaContainer,
                                    { 
                                        marginBottom: index === facturaData.notas.length - 1 ? 0 : 16,
                                        opacity: item.estado_revision === 'en_revision' ? 1 : 0.8
                                    }
                                ]}>
                                    {/* Note header with author and status */}
                                    <View style={{ 
                                        flexDirection: 'row', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginBottom: 12 
                                    }}>
                                        <Text style={styles.notaAuthor}>
                                            👤 {item.nombre} {item.apellido}
                                        </Text>
                                        <Text style={[
                                            styles.revisionStatus,
                                            { 
                                                backgroundColor: `${getStatusColor(item.estado_revision)}20`,
                                                color: getStatusColor(item.estado_revision),
                                                borderWidth: 1,
                                                borderColor: getStatusColor(item.estado_revision)
                                            }
                                        ]}>
                                            {getStatusText(item.estado_revision)}
                                        </Text>
                                    </View>

                                    {/* Note content */}
                                    <Text style={styles.notaText}>{item.nota}</Text>

                                    {/* Date and time */}
                                    <Text style={styles.notaDate}>
                                        📅 {formatNoteDate(item.fecha, item.hora)}
                                    </Text>

                                    {/* Interaction hint for pending notes */}
                                    {item.estado_revision === 'en_revision' && (
                                        <Text style={[
                                            styles.notaDate, 
                                            { 
                                                fontStyle: 'italic', 
                                                color: '#F59E0B', 
                                                marginTop: 8,
                                                fontSize: 12
                                            }
                                        ]}>
                                            💡 Toca para revisar esta nota
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

export default NotasCard;