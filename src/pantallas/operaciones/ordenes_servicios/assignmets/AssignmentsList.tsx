import React from 'react';
import { FlatList, TouchableOpacity, Text, View } from 'react-native';

const AssignmentsList = ({
    assignments,
    isDarkMode,
    navigation,
    isp,
    usuarioId,
    setTecnicoModalVisible,
}) => {
    const renderAssignment = ({ item }) => (
        <TouchableOpacity
            style={{ backgroundColor: isDarkMode ? '#444' : '#EEE' }}
            onPress={() => navigation.navigate('ExistingServiceOrderScreen', {
                assignment: item,
                isp,
                usuarioId,
            })}
            onLongPress={() => {
                setTecnicoModalVisible(true);
            }}
        >
            <Text>Orden ID: {item.id || 'Sin ID'}</Text>
            <Text>Estado: {item.estado || 'Sin estado'}</Text>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={assignments}
            keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
            renderItem={renderAssignment}
            ListEmptyComponent={<Text>No hay asignaciones disponibles.</Text>}
        />
    );
};

export default AssignmentsList;
