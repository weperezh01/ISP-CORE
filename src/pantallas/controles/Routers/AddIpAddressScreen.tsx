import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from '../../../estilos/styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import ThemeSwitch from '../../../componentes/themeSwitch';
import DropDownPicker from 'react-native-dropdown-picker';

const AddIpAddressScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { routerId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [address, setAddress] = useState('');
    const [network, setNetwork] = useState('');
    const [comment, setComment] = useState('');
    const [interfaces, setInterfaces] = useState([]);
    const [selectedInterface, setSelectedInterface] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchInterfaces = async () => {
            try {
                const response = await fetch(`https://wellnet-rd.com:444/api/routers/obtener-interfaces`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id_router: routerId })
                });

                if (response.ok) {
                    const data = await response.json();
                    const formattedInterfaces = data.map((iface) => ({
                        label: iface.nombre_interface,
                        value: iface.nombre_interface
                    }));
                    setInterfaces(formattedInterfaces);
                } else {
                    throw new Error('Failed to fetch interfaces');
                }
            } catch (error) {
                Alert.alert('Error', error.message);
            }
        };

        fetchInterfaces();
    }, [routerId]);

    const confirmAddIpAddress = () => {
        Alert.alert(
            'Confirmar',
            '¿Estás seguro de que quieres agregar esta IP?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'OK', onPress: handleAddIpAddress }
            ],
            { cancelable: false }
        );
    };

    const handleAddIpAddress = async () => {
        if (!address || !network || !selectedInterface) {
            Alert.alert('Error', 'Por favor, complete todos los campos obligatorios.');
            return;
        }

        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/routers/add-ip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_router: routerId,
                    address,
                    network,
                    interface: selectedInterface,
                    comment
                })
            });

            if (response.ok) {
                Alert.alert('Éxito', 'IP agregada correctamente', [
                    { text: 'OK', onPress: () => navigation.navigate('RouterDetailsScreen', { routerId }) }
                ]);
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Error al agregar IP');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const dropdownStyles = {
        container: { height: 40 },
        dropdown: { backgroundColor: isDarkMode ? '#333' : '#eee' },
        item: { backgroundColor: isDarkMode ? '#333' : '#eee', color: isDarkMode ? '#fff' : '#000' },
        placeholder: { color: isDarkMode ? '#aaa' : '#555' },
        dropDownContainer: { backgroundColor: isDarkMode ? '#333' : '#eee' }
    };

    return (
        <View style={styles.container}>
            <View style={styles.containerSuperior}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Agregar IP</Text>
                <ThemeSwitch />
            </View>
            <View style={styles.scrollViewContainer}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Dirección IP</Text>
                    <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Ej. 192.168.1.1/24"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Red</Text>
                    <TextInput
                        style={styles.input}
                        value={network}
                        onChangeText={setNetwork}
                        placeholder="Ej. 192.168.1.0"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Interfaz</Text>
                    <DropDownPicker
                        open={open}
                        value={selectedInterface}
                        items={interfaces}
                        setOpen={setOpen}
                        setValue={setSelectedInterface}
                        setItems={setInterfaces}
                        placeholder="Seleccione una interfaz"
                        containerStyle={dropdownStyles.container}
                        style={dropdownStyles.dropdown}
                        dropDownContainerStyle={dropdownStyles.dropDownContainer}
                        textStyle={dropdownStyles.item}
                        placeholderStyle={dropdownStyles.placeholder}
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Comentario</Text>
                    <TextInput
                        style={styles.input}
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Comentario opcional"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={confirmAddIpAddress}>
                    <Text style={styles.buttonText}>Agregar IP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AddIpAddressScreen;
