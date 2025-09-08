import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from '../../../estilos/styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import ThemeSwitch from '../../../componentes/themeSwitch';
import { ButtonGroup } from 'react-native-elements';

const AddRouterScreen = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const placeholderColor = isDarkMode ? '#bfbfbf' : '#404040';
    const styles = getStyles(isDarkMode);
    const route = useRoute();
    const { routerId } = route.params || {};
    const [idIsp, setIdIsp] = useState(null);
    const isEditing = !!routerId;
    const screenTitle = isEditing ? "Editar Router" : "Añadir Nuevo Router";
    const buttonTitle = isEditing ? "Actualizar Router" : "Añadir Router";

    const [routerData, setRouterData] = useState({
        id_isp: idIsp,
        fecha_entrada: new Date().toISOString().slice(0, 10),
        nombre: '',
        routerUserName: '', 
        ipPublica: '',
        ipWan: '',
        ipLan: '',
        contrasena: '',
        descripcion: '',
        operacion: 'simpleQueue' // Valor predeterminado cambiado a 'simpleQueue'
    });

    const radioButtonsData = ['PPPoE', 'Simple Queue', 'DHCP'];
    const [selectedIndex, setSelectedIndex] = useState(radioButtonsData.indexOf('Simple Queue'));

    useEffect(() => {
        const loadRouterData = async () => {
            if (isEditing) {
                const response = await fetch(`https://wellnet-rd.com:444/api/routers/${routerId}`);
                if (response.ok) {
                    const data = await response.json();
                    const selectedOperacion = data.operacion || 'simpleQueue';
                    setRouterData({
                        id_isp: idIsp,
                        nombre: data.nombre_router,
                        routerUserName: data.router_username,
                        ipPublica: data.ip_publica,
                        ipWan: data.ip_wan,
                        ipLan: data.ip_lan,
                        contrasena: data.contrasena,
                        descripcion: data.descripcion || '',
                        operacion: selectedOperacion
                    });
                    // Convertir el valor de operacion en el índice correcto
                    const index = radioButtonsData.findIndex(option => option.toLowerCase() === selectedOperacion.toLowerCase());
                    setSelectedIndex(index);
                } else {
                    Alert.alert('Error', 'No se pudo cargar la información del router.');
                }
            }
        };

        loadRouterData();
    }, [routerId, isEditing]);

    useEffect(() => {
        const loadIspId = async () => {
            try {
                const storedIspId = await AsyncStorage.getItem('@selectedIspId');
                if (storedIspId !== null) {
                    setIdIsp(storedIspId);
                } else {
                    Alert.alert('Error', 'No ISP ID found in storage.');
                }
            } catch (e) {
                Alert.alert('Error', 'Failed to read ISP ID from local storage.');
            }
        };
        loadIspId();
    }, []);

    const handleInputChange = (name, value) => {
        setRouterData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAddRouter = async () => {
        if (!idIsp) {
            Alert.alert('Error', 'ISP ID is not available. Please try again.');
            return;
        }
        if (!routerData.nombre.trim()) {
            Alert.alert('Error', 'El nombre del router es obligatorio.');
            return;
        }

        const apiUrl = 'https://wellnet-rd.com:444/api/routers/agregar';
        const payload = {
            id_isp: idIsp,
            nombre_router: routerData.nombre,
            router_username: routerData.routerUserName,
            ip_publica: routerData.ipPublica,
            ip_wan: routerData.ipWan,
            ip_lan: routerData.ipLan,
            contrasena: routerData.contrasena,
            descripcion: routerData.descripcion,
            fecha_entrada: new Date().toISOString().slice(0, 10),
            operacion: radioButtonsData[selectedIndex].toLowerCase()
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                Alert.alert('Success', 'Router agregado satisfactoriamente');
                // navigation.navigate('RouterListScreen');
                navigation.goBack();
            } else {
                const errorResponse = await response.text();
                throw new Error(errorResponse || 'Unknown error');
            }
        } catch (error) {
            Alert.alert('Error', `Error adding the router: ${error.message}`);
        }
    };

    const handleUpdateRouter = async () => {
        if (!idIsp) {
            Alert.alert('Error', 'ISP ID is not available. Please try again.');
            return;
        }
        if (!routerData.nombre.trim()) {
            Alert.alert('Error', 'El nombre del router es obligatorio.');
            return;
        }

        const apiUrl = `https://wellnet-rd.com:444/api/routers/actualizar/${routerId}`;

        const payload = {
            id_isp: idIsp,
            nombre_router: routerData.nombre,
            router_username: routerData.routerUserName,
            ip_publica: routerData.ipPublica,
            ip_wan: routerData.ipWan,
            ip_lan: routerData.ipLan,
            contrasena: routerData.contrasena,
            descripcion: routerData.descripcion,
            fecha_entrada: new Date().toISOString().slice(0, 10),
            operacion: radioButtonsData[selectedIndex].toLowerCase()
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const responseData = await response.json();
                Alert.alert('Success', 'Router actualizado satisfactoriamente');
                navigation.navigate('RouterListScreen');
            } else {
                const errorResponse = await response.text();
                throw new Error(errorResponse || 'Unknown error');
            }
        } catch (error) {
            Alert.alert('Error', `Error updating the router: ${error.message}`);
        }
    };

    const onRadioButtonPress = (index) => {
        setSelectedIndex(index);
        handleInputChange('operacion', radioButtonsData[index].toLowerCase());
    };

    const renderFormItem = ({ item }) => (
        <View style={styles.formContainer}>
            <Text style={styles.label}>{item.label}</Text>
            <TextInput
                style={styles.input}
                value={item.value}
                onChangeText={text => handleInputChange(item.name, text)}
                placeholder={item.placeholder}
                placeholderTextColor={placeholderColor}
                secureTextEntry={item.secureTextEntry || false}
            />
        </View>
    );

    const confirmAction = () => {
        Alert.alert(
            "Confirmar Acción",
            "¿Estás seguro de que deseas proceder?",
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Cancelado"),
                    style: "cancel"
                },
                {
                    text: "Aceptar", onPress: () => {
                        if (isEditing) {
                            handleUpdateRouter();
                        } else {
                            handleAddRouter();
                        }
                    }
                }
            ],
            { cancelable: false }
        );
    };

    const formItems = [
        { name: 'nombre', label: 'Nombre del Router:', placeholder: 'Introduce el nombre del router', value: routerData.nombre },
        { name: 'routerUserName', label: 'Nombre de usuario del router:', placeholder: 'Introduce el nombre de usuario del router', value: routerData.routerUserName },
        { name: 'ipPublica', label: 'IP Pública:', placeholder: 'Introduce la IP pública', value: routerData.ipPublica },
        { name: 'ipWan', label: 'IP WAN:', placeholder: 'Introduce la IP WAN', value: routerData.ipWan },
        { name: 'ipLan', label: 'IP LAN:', placeholder: 'Introduce la IP LAN', value: routerData.ipLan },
        { name: 'contrasena', label: 'Contraseña:', placeholder: 'Introduce la contraseña', value: routerData.contrasena, secureTextEntry: true },
        { name: 'descripcion', label: 'Descripción:', placeholder: 'Añade una descripción o nota', value: routerData.descripcion }
    ];

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <FlatList
                data={formItems}
                keyExtractor={(item, index) => item.name}
                renderItem={renderFormItem}
                ListHeaderComponent={
                    <View style={styles.containerSuperior}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.buttonText}>Volver</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>{screenTitle}</Text>
                        <ThemeSwitch />
                    </View>
                }
                ListFooterComponent={
                    <>
                        <View style={styles.formContainer}>
                            <Text style={styles.label}>Método de Administración:</Text>
                            <ButtonGroup
                                onPress={onRadioButtonPress}
                                selectedIndex={selectedIndex}
                                buttons={radioButtonsData}
                                containerStyle={{ height: 50 }}
                            />
                        </View>
                        <Button
                            title={buttonTitle}
                            onPress={confirmAction}
                            disabled={!idIsp}
                        />
                    </>
                }
            />
        </KeyboardAvoidingView>
    );
};

export default AddRouterScreen;
