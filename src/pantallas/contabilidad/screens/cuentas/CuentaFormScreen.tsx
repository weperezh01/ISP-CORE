import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../../../../ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const CuentaFormScreen = () => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const route = useRoute();

    const [codigo, setCodigo] = useState('');
    const [nombre, setNombre] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [cuentaId, setCuentaId] = useState(null);

    useEffect(() => {
        if (route.params && route.params.cuenta) {
            const { cuenta } = route.params;
            setCodigo(cuenta.codigo);
            setNombre(cuenta.nombre);
            setCuentaId(cuenta.id);
            setIsEditing(true);
        }
    }, [route.params]);

    const handleSubmit = async () => {
        const url = isEditing
            ? `https://tu-servidor.com/api/contabilidad/cuentas/${cuentaId}`
            : 'https://tu-servidor.com/api/contabilidad/cuentas';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ codigo, nombre }),
            });

            if (response.ok) {
                Alert.alert('Éxito', `Cuenta ${isEditing ? 'actualizada' : 'creada'} correctamente`);
                navigation.goBack();
            } else {
                Alert.alert('Error', 'No se pudo procesar la solicitud');
            }
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
            Alert.alert('Error', 'Hubo un problema al procesar la solicitud');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Código:</Text>
            <TextInput
                style={styles.input}
                value={codigo}
                onChangeText={setCodigo}
                placeholder="Código"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <Button title={isEditing ? 'Actualizar Cuenta' : 'Crear Cuenta'} onPress={handleSubmit} />
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: isDarkMode ? '#121212' : '#fff',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: isDarkMode ? '#fff' : '#000',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        padding: 8,
        borderRadius: 4,
        backgroundColor: isDarkMode ? '#333' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
    },
});

export default CuentaFormScreen;
