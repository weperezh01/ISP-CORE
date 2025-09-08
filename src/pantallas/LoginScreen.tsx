import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const loginData = await AsyncStorage.getItem('@loginData');
                if (loginData) {
                    const parsedData = JSON.parse(loginData);
    
                    // Validar que los datos sean correctos antes de redirigir
                    if (parsedData && parsedData.token) {
                        redirigirUsuario(parsedData);
                    } else {
                        console.warn('Datos de inicio de sesión incompletos o inválidos');
                    }
                }
            } catch (error) {
                console.error('Error al verificar el estado de inicio de sesión:', error);
            } finally {
                setLoading(false);
            }
        };
    
        checkLoginStatus();
    }, []);
    
    const redirigirUsuario = (data) => {
        // console.log('Datos de inicio de sesión:', data);
        console.log('Datos de inicio de sesión:', JSON.stringify(data, null, 2));

        const { nivel_usuario, isp } = data;

        switch (nivel_usuario) {
            case 'MEGA ADMINISTRADOR':
                navigation.navigate('Main', { data });
                break;
            case 'SUPER ADMINISTRADOR':
                navigation.navigate('IspListScreen');
                break;
            case 'ADMINISTRADOR':
            case 'OPERADOR':
                if (isp) {
                    navigation.navigate('IspDetailsScreen', { isp: data });
                } else {
                    Alert.alert('Error', 'No se encontró información de ISP para este usuario.');
                }
                break;
            case 'CLIENTE':
                navigation.navigate('ClientDetailsScreen');
                break;
            default:
                Alert.alert('Error', 'No tienes permisos para acceder a esta aplicación.');
                break;
        }
    };


    const handleLogin = async () => {
        if (!usuario.trim() || !contrasena.trim()) {
            Alert.alert('Error', 'Por favor, introduce tu usuario y contraseña.');
            return;
        }
    
        try {
            const response = await axios.post(
                'https://wellnet-rd.com:444/api/usuarios/login',
                { usuario, contrasena }
            );
    
            if (response.data.success) {
                // Almacenar los datos necesarios en AsyncStorage
                await AsyncStorage.setItem('@loginData', JSON.stringify(response.data));
    
                // Recuperar y mostrar en consola los datos guardados
                const savedData = await AsyncStorage.getItem('@loginData');
                console.log('Datos almacenados en AsyncStorage:', JSON.stringify(JSON.parse(savedData), null, 2));
    
                // Redirigir según los permisos
                redirigirUsuario(response.data);
                Alert.alert('Éxito', 'Inicio de sesión exitoso.');
            } else {
                Alert.alert(
                    'Error de Inicio de Sesión',
                    response.data.error || 'Error desconocido'
                );
            }
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data.error
                : 'No se pudo conectar con el servidor.';
            Alert.alert('Error de Conexión', errorMessage);
            console.error('Error al realizar la petición:', error);
        }
    };
    

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#BB86FC" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title1}>Well Net</Text>
            <Text style={styles.title2}>Technologies</Text>
            <TextInput
                style={styles.input}
                placeholder="Usuario"
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry
                autoCapitalize="none"
            />
            <Button title="Iniciar Sesión" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#121212',
    },
    title1: {
        fontSize: 34,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    title2: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 100,
    },
    input: {
        width: '100%',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 5,
        color: 'white',
        backgroundColor: '#1e1e1e',
    },
    button: {
        backgroundColor: '#BB86FC',
        color: 'white',
    },
});

export default LoginScreen;
