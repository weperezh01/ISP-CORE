import React, { useState } from 'react';
import { View, FlatList, Modal, TouchableOpacity, TextInput as NativeTextInput } from 'react-native';
import { Text, Button } from 'react-native-paper';

const ServiceSelector = ({ visible, onClose, servicios, onServicioSelect, isDarkMode, styles }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredServicios, setFilteredServicios] = useState(servicios);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredServicios(servicios);
        } else {
            const filtered = servicios.filter((servicio) =>
                servicio.nombre_servicio.toLowerCase().includes(query.toLowerCase()) ||
                (servicio.descripcion_servicio || '').toLowerCase().includes(query.toLowerCase())
            );
            setFilteredServicios(filtered);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Seleccionar Servicio</Text>

                <NativeTextInput
                    style={styles.searchInput}
                    placeholder="Buscar servicio por nombre o descripción"
                    placeholderTextColor={isDarkMode ? '#888' : '#777'}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />

                <FlatList
                    data={filteredServicios}
                    keyExtractor={(item) => item.id_servicio.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                                onServicioSelect(item);
                                onClose();
                            }}
                        >
                            <Text style={styles.modalItemText}>
                                ID: {item.id_servicio} - {item.nombre_servicio}
                            </Text>
                            <Text style={styles.modalItemText}>
                                Descripción: {item.descripcion_servicio || 'No especificada'}
                            </Text>
                            <Text style={styles.modalItemText}>
                                Precio: ${item.precio_servicio} - Velocidad: {item.velocidad_servicio || 'N/A'} Mbps
                            </Text>
                        </TouchableOpacity>
                    )}
                />
                <Button mode="outlined" onPress={onClose} style={styles.modalCloseButton}>
                    Cerrar
                </Button>
            </View>
        </Modal>
    );
};

export default ServiceSelector;
