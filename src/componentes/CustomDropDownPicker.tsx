import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useTheme } from '../../ThemeContext';

const DropDownPickerCustom = ({ items, selectedValue, onValueChange, placeholder }) => {
    const { isDarkMode } = useTheme();
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen(!open);
    };

    const handleSelect = (value) => {
        onValueChange(value);
        setOpen(false);
    };

    const containerStyle = {
        ...styles.container,
        backgroundColor: isDarkMode ? '#333' : '#eee'
    };

    const itemStyle = {
        ...styles.item,
        backgroundColor: isDarkMode ? '#333' : '#eee',
        color: isDarkMode ? '#fff' : '#000'
    };

    const placeholderStyle = {
        color: isDarkMode ? '#aaa' : '#555'
    };

    return (
        <View style={containerStyle}>
            <TouchableOpacity onPress={toggleOpen} style={styles.input}>
                <Text style={placeholderStyle}>
                    {selectedValue ? items.find(item => item.value === selectedValue)?.label : placeholder}
                </Text>
            </TouchableOpacity>
            {open && (
                <View style={styles.dropdown}>
                    <FlatList
                        data={items}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSelect(item.value)} style={itemStyle}>
                                <Text>{item.label}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.value.toString()}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    input: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5
    },
    dropdown: {
        maxHeight: Dimensions.get('window').height * 0.4, // Ajustar la altura máxima del dropdown
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginTop: 5,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    }
});

export default DropDownPickerCustom;
