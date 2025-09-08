import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Card } from 'react-native-paper';

const NotasCard = ({ facturaData, styles, handlePressNotaPendiente, formatDate }) => (
    <Card style={styles.cardStyle}>
        <Card.Title title="Notas" titleStyle={styles.header} />
        <Card.Content>
            {facturaData?.notas.length === 0 ? (
                <Text style={styles.text}>No hay notas registradas para esta factura.</Text>
            ) : (
                <FlatList
                    data={facturaData?.notas || []}
                    keyExtractor={(item) => item.id_nota.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                if (item.estado_revision === 'en_revision') {
                                    handlePressNotaPendiente(item);
                                }
                            }}
                            disabled={item.estado_revision !== 'en_revision'} // Deshabilitar si no está pendiente de revisión
                        >
                            <View style={styles.notaContainer}>
                                {/* Nota y autor */}
                                <Text style={styles.notaText}>{item.nota}</Text>
                                <Text style={styles.notaAuthor}>
                                    <Text style={styles.notaLabel}>Autor: </Text>
                                    {item.nombre} {item.apellido}
                                </Text>

                                {/* Fecha y hora */}
                                <Text style={styles.notaDate}>
                                    {formatDate(item.fecha, item.hora)}
                                </Text>

                                {/* Estado de revisión */}
                                {item.estado_revision && (
                                    <Text style={styles.revisionStatus}>
                                        Estado de revisión: {item.estado_revision.replace('_', ' ')}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </Card.Content>
    </Card>
);

export default NotasCard;
