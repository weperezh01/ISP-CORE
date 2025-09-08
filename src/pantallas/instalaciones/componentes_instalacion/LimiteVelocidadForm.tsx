import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../ThemeContext';

const LimiteVelocidadForm = ({ form, handleChange }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [selectedUnitSubida, setSelectedUnitSubida] = useState(form.unidad_subida);
    const [selectedUnitBajada, setSelectedUnitBajada] = useState(form.unidad_bajada);

    const units = [
        { label: 'Kbps', value: 'Kbps' },
        { label: 'Mbps', value: 'Mbps' },
        { label: 'Gbps', value: 'Gbps' },
        { label: 'Tbps', value: 'Tbps' },
    ];

    const renderUnitItem = ({ item, field }) => (
        <TouchableOpacity onPress={() => handleUnitChange(field, item.value)}>
            <View style={[
                styles.unitItem,
                (field === 'unidad_subida' && selectedUnitSubida === item.value) ||
                (field === 'unidad_bajada' && selectedUnitBajada === item.value)
                    ? styles.selectedItem
                    : null,
            ]}>
                <Text style={styles.unitText}>{item.label}</Text>
            </View>
        </TouchableOpacity>
    );

    const handleUnitChange = (field, value) => {
        if (field === 'unidad_subida') {
            setSelectedUnitSubida((prevValue) => (prevValue === value ? '' : value));
            handleChange('unidad_subida', selectedUnitSubida === value ? '' : value);
        } else {
            setSelectedUnitBajada((prevValue) => (prevValue === value ? '' : value));
            handleChange('unidad_bajada', selectedUnitBajada === value ? '' : value);
        }
    };

    const renderLimiteVelocidadItem = (item) => (
        <View key={item.field} style={styles.inputGroup}>
            <Text style={styles.label}>{item.label}</Text>
            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    value={form[item.field]}
                    onChangeText={(value) => handleChange(item.field, value)}
                    placeholder={item.placeholder}
                    placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                    keyboardType="numeric"
                />
                <FlatList
                    data={units}
                    renderItem={({ item: unit }) => 
                        ((item.unitField === 'unidad_subida' && selectedUnitSubida === unit.value) || 
                        (item.unitField === 'unidad_bajada' && selectedUnitBajada === unit.value) ||
                        ((item.unitField === 'unidad_subida' && selectedUnitSubida === '') || 
                        (item.unitField === 'unidad_bajada' && selectedUnitBajada === ''))) 
                        ? renderUnitItem({ item: unit, field: item.unitField }) : null
                    }
                    keyExtractor={(unit) => unit.value}
                    horizontal
                    style={styles.flatList}
                />
            </View>
        </View>
    );

    return (
        <View>
            <Text style={styles.mainLabel}>Límite de Velocidad</Text>
            {[
                {
                    label: 'Límite de Subida',
                    field: 'limite_subida',
                    placeholder: 'Ingrese el límite de subida',
                    unitField: 'unidad_subida',
                },
                {
                    label: 'Límite de Bajada',
                    field: 'limite_bajada',
                    placeholder: 'Ingrese el límite de bajada',
                    unitField: 'unidad_bajada',
                },
            ].map(renderLimiteVelocidadItem)}
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    inputGroup: {
        marginBottom: 20, // Add space between input groups
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: isDarkMode ? '#444' : '#fff',
        color: isDarkMode ? 'white' : 'black',
        width: 150, // Reduce the width of the input field
        marginRight: 10, // Add some space between the input and the picker
    },
    flatList: {
        flex: 1,
    },
    unitItem: {
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginRight: 10,
        backgroundColor: isDarkMode ? '#444' : '#fff',
    },
    unitText: {
        color: isDarkMode ? 'white' : 'black',
    },
    selectedItem: {
        borderColor: 'blue',
        borderWidth: 2,
    },
    mainLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: 20,
    },
});

export default LimiteVelocidadForm;
