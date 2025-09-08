import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './DesmantelamientoStyles'; // Crea un archivo de estilos para esta pantalla
import AsyncStorage from '@react-native-async-storage/async-storage';

const DesmantelamientoScreen = ({ route, navigation }) => {
    const { connectionId, id_isp } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [notes, setNotes] = useState('');
    const [idUsuario, setIdUsuario] = useState(null);

    const registrarNavegacion = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Retardo asíncrono de 2 segundos
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'DesmantelamientoScreen';

        const datos = JSON.stringify({
            connectionId,
            id_isp,
            notas_desmantelamiento: notes
        });

        const navigationLogData = {
            id_usuario: idUsuario,
            fecha,
            hora,
            pantalla,
            datos
        };

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(navigationLogData),
            });

            if (!response.ok) {
                throw new Error('Error al registrar la navegación.');
            }

            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    const obtenerDatosUsuario = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            if (jsonValue != null) {
                const userData = JSON.parse(jsonValue);
                setIdUsuario(userData.id);
            }
        } catch (e) {
            console.error('Error al leer el ID del usuario', e);
        }
    };

    useEffect(() => {
        obtenerDatosUsuario();
        registrarNavegacion(); // Registrar la navegación al cargar la pantalla
    }, []);

    const handleSubmit = async () => {
        // Implementa la lógica para registrar el desmantelamiento
        try {
            const response = await fetch('https://wellnet-rd.com/api/desmantelamientos/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_conexion: connectionId,
                    id_isp: id_isp,
                    notas_desmantelamiento: notes,
                }),
            });

            if (response.ok) {
                Alert.alert('Éxito', 'Desmantelamiento registrado exitosamente');
                navigation.goBack();
            } else {
                throw new Error('Error al registrar el desmantelamiento');
            }
        } catch (error) {
            console.error('Error al registrar el desmantelamiento:', error);
            Alert.alert('Error', 'No se pudo registrar el desmantelamiento');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Desmantelamiento de la Conexión</Text>
            <TextInput
                style={styles.input}
                placeholder="Notas del desmantelamiento"
                value={notes}
                onChangeText={setNotes}
                multiline
            />
            <Button title="Registrar Desmantelamiento" onPress={handleSubmit} />
        </View>
    );
};

export default DesmantelamientoScreen;
