import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../../ThemeContext';

const NetworkSelection = ({ selectedRouter, selectedRedIP, setSelectedRedIP, selectedDireccionIP, setSelectedDireccionIP, modoOperacion, setModoOperacion }) => {
    const [redesIP, setRedesIP] = useState([]);
    const [direccionesIP, setDireccionesIP] = useState([]);
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    useEffect(() => {
        if (selectedRouter) {
            fetchRedesIP(selectedRouter);
        }
    }, [selectedRouter]);

    const fetchRedesIP = async (selectedRouterId) => {
        try {
            const storedIspId = await AsyncStorage.getItem('@selectedIspId');
            if (storedIspId === null) {
                throw new Error('ID ISP no encontrado en el almacenamiento local');
            }
            const ispIdParsed = JSON.parse(storedIspId);

            const response = await fetch('https://wellnet-rd.com:444/api/routers/redes-ip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_router: selectedRouterId })
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Response Error:', text);
                throw new Error(text || 'Error al cargar las redes IP');
            }

            const data = await response.json();

            if (data) {
                setRedesIP(data.map(red => ({
                    label: red.address,
                    value: red.address
                })));
            } else {
                console.log('No data received');
            }
        } catch (error) {
            console.error('Error fetching IP networks:', error);
        }
    };

    const handleSelectRedIP = async (item) => {
        if (selectedRedIP === item.value) {
            setSelectedRedIP(null); // Deselect if the same item is selected
            setDireccionesIP([]);  // Clear IP addresses if deselected
        } else {
            setSelectedRedIP(item.value); // Select the new item
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/routers/rango-ip', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ network: item.value })
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error('Fallo al obtener las direcciones IP');
                }
                setDireccionesIP(data); // Set the IP addresses returned from the backend
            } catch (error) {
                console.error('Error fetching IP addresses:', error);
                setDireccionesIP([]);
            }
        }
    };

    const handleSelectDireccionIP = async (item) => {
        if (!selectedRedIP) return; // Only allow selection if a network is selected

        if (selectedDireccionIP === item.direccion_ip) {
            setSelectedDireccionIP(null); // Deselect if the same item is selected
            setModoOperacion(''); // Clear mode of operation if deselected
        } else {
            setSelectedDireccionIP(item.direccion_ip); // Select the new item
            try {
                const response = await fetch(`https://wellnet-rd.com:444/api/routers/${selectedRouter}`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error('Fallo al obtener el modo de operación');
                }
                setModoOperacion(data.operacion); // Set the mode of operation
            } catch (error) {
                console.error('Error fetching router mode of operation:', error);
                setModoOperacion('');
            }
        }
    };

    return (
        <View>
            <Text>Redes IP</Text>
            <FlatList
                data={redesIP}
                keyExtractor={(item) => item.value.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelectRedIP(item)}>
                        <View style={[
                            styles.itemContainer,
                            item.value === selectedRedIP && styles.selectedItem
                        ]}>
                            <Text style={styles.text}>{item.label}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                style={styles.flatList}
            />
            <View>
                <Text>Direcciones IP en la red seleccionada:</Text>
                <FlatList
                    data={direccionesIP}
                    keyExtractor={(item) => item.id_direccion_ip.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelectDireccionIP(item)}>
                            <View style={[
                                styles.itemContainer,
                                item.direccion_ip === selectedDireccionIP && styles.selectedItem,
                                !selectedRedIP && styles.disabledItem // Apply disabled style if no network is selected
                            ]}>
                                <Text style={styles.text}>{item.direccion_ip}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    style={styles.flatList}
                />
            </View>
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    itemContainer: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: isDarkMode ? '#444' : '#fff',
        borderRadius: 5,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    selectedItem: {
        backgroundColor: isDarkMode ? '#666' : '#ddd',
    },
    disabledItem: {
        opacity: 0.5,
    },
    text: {
        color: isDarkMode ? '#fff' : '#000',
    },
    flatList: {
        maxHeight: 200,
    },
});

export default NetworkSelection;
