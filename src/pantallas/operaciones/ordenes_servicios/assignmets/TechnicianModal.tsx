import React from 'react';
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';

const TechnicianModal = ({
    tecnicos,
    filteredTecnicos,
    tecnicoModalVisible,
    actualizarTecnicoEnOrden,
    setTecnicoModalVisible,
    setFilteredTecnicos,
}) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    return (
        <Modal visible={tecnicoModalVisible} animationType="slide">
            <View>
                <Text>Seleccionar Técnico</Text>
                <TextInput
                    placeholder="Buscar técnico"
                    value={searchQuery}
                    onChangeText={(query) => {
                        setSearchQuery(query);
                        setFilteredTecnicos(
                            tecnicos.filter((tecnico) =>
                                tecnico.nombre.toLowerCase().includes(query.toLowerCase())
                            )
                        );
                    }}
                />
                <FlatList
                    data={filteredTecnicos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                actualizarTecnicoEnOrden(item.id);
                            }}
                        >
                            <Text>{item.nombre}</Text>
                        </TouchableOpacity>
                    )}
                />
                <TouchableOpacity onPress={() => setTecnicoModalVisible(false)}>
                    <Text>Cerrar</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default TechnicianModal;
