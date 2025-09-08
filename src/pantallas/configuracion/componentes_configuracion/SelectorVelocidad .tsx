import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';

const SelectorVelocidad = ({ data, isDarkMode }) => {
    const [selectedValue, setSelectedValue] = useState('Mbps');
    const [collapsed, setCollapsed] = useState(true);
    const styles = getStyles(isDarkMode);

    const handlePress = (value) => {
        setSelectedValue(value);
        setCollapsed(true);
    };

    const displayedData = collapsed
        ? [{ value: selectedValue, label: data.find(item => item.value === selectedValue)?.label || 'Mbps' }]
        : data;

    return (
        <ScrollView horizontal contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <FlatList
                    data={displayedData}
                    horizontal
                    keyExtractor={(item) => item.value}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={index === 0 ? styles.selectedItem : styles.item}
                            onPress={() => {
                                if (collapsed) {
                                    setCollapsed(false);
                                } else {
                                    handlePress(item.value);
                                }
                            }}
                        >
                            <Text style={styles.itemText}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.listContainer}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        </ScrollView>
    );
};

const getStyles = (isDarkMode) =>
    StyleSheet.create({
        scrollContainer: {
            flexGrow: 1,
        },
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingTop: 10,
        },
        item: {
            padding: 10,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 5,
            marginHorizontal: 5,
            backgroundColor: isDarkMode ? '#333' : '#fff',
        },
        selectedItem: {
            padding: 10,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 5,
            marginHorizontal: 5,
            backgroundColor: isDarkMode ? '#555' : '#ddd',
        },
        itemText: {
            color: isDarkMode ? '#fff' : '#000',
        },
        listContainer: {
            flexDirection: 'row',
            paddingVertical: 10,
        },
    });

export default SelectorVelocidad;

// Ejemplo de uso
const data = [
    { value: 'Kbps', label: 'Kbps' },
    { value: 'Mbps', label: 'Mbps' },
    { value: 'Gbps', label: 'Gbps' },
    { value: 'Tbps', label: 'Tbps' },
];

// En tu componente principal
<SelectorVelocidad data={data} isDarkMode={true} />
