import React, { useState } from 'react';
import { View, FlatList, Modal, TouchableOpacity, TextInput as NativeTextInput } from 'react-native';
import { Text, Button } from 'react-native-paper';

const ClientSelector = ({ visible, onClose, clientes, onClienteSelect, isDarkMode, styles }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredClientes, setFilteredClientes] = useState(clientes);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredClientes(clientes);
        } else {
            const filtered = clientes.filter((cliente) => {
                const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.toLowerCase();
                const cedula = cliente.cedula ? cliente.cedula.toLowerCase() : '';
                const idCliente = cliente.id_cliente.toString();

                return (
                    nombreCompleto.includes(query.toLowerCase()) ||
                    cedula.includes(query.toLowerCase()) ||
                    idCliente.includes(query)
                );
            });
            setFilteredClientes(filtered);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Seleccionar Cliente</Text>

                <NativeTextInput
                    style={styles.searchInput}
                    placeholder="Buscar cliente por nombre, cédula o ID"
                    placeholderTextColor={isDarkMode ? '#888' : '#777'}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />

                <FlatList
                    data={filteredClientes}
                    keyExtractor={(item) => item.id_cliente.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                                onClienteSelect(item);
                                onClose();
                            }}
                        >
                            <Text style={styles.modalItemText}>
                                ID: {item.id_cliente} - {item.nombres} {item.apellidos}
                            </Text>
                            <Text style={styles.modalItemText}>
                                Tel.: {item.telefono1} Cédula: {item.cedula}
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

export default ClientSelector;
