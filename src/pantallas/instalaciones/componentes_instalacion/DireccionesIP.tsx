import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../ThemeContext';

const DireccionesIP = ({ direccionesIP, selectedDireccionIP, handleSelectDireccionIP }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Direcciones IP en la red seleccionada:</Text>
            <FlatList
                data={direccionesIP}
                keyExtractor={(item) => item.id_direccion_ip.toString()}
                renderItem={({ item }) => (
                    !selectedDireccionIP || item.direccion_ip === selectedDireccionIP ? (
                        <TouchableOpacity onPress={() => handleSelectDireccionIP(item)}>
                            <View style={[
                                styles.itemContainer,
                                item.direccion_ip === selectedDireccionIP && styles.selectedItem
                            ]}>
                                <Text style={styles.text}>{item.direccion_ip}</Text>
                            </View>
                        </TouchableOpacity>
                    ) : null
                )}
                style={styles.flatList}
            />
            {selectedDireccionIP && (
                <View style={[styles.itemContainer, styles.selectedItem]}>
                    <Text style={styles.text}>{selectedDireccionIP}</Text>
                </View>
            )}
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: 10,
    },
    itemContainer: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: isDarkMode ? '#444' : '#fff',
        borderRadius: 5,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    text: {
        color: isDarkMode ? '#fff' : '#000',
    },
    selectedItem: {
        backgroundColor: 'green', // Cambiar el color de fondo del ítem seleccionado a verde fuerte
    },
    flatList: {
        maxHeight: 200,
    },
});

export default DireccionesIP;
