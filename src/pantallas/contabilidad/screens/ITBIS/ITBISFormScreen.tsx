import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../../utils/api';
import styles from './styles'; // Importar los estilos predefinidos

const ITBISFormScreen = () => {
    const [form, setForm] = useState({
        fecha: '',
        total: '',
    });

    const handleInputChange = (key, value) => {
        setForm({ ...form, [key]: value });
    };

    const handleSubmit = async () => {
        try {
            await api.post('/itbis', form);
            Alert.alert('Datos enviados con éxito');
        } catch (error) {
            console.error('Error al enviar datos:', error);
            Alert.alert('Ocurrió un error, intenta nuevamente.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Registrar ITBIS</Text>

            <Text style={styles.label}>Fecha:</Text>
            <TextInput
                style={styles.input}
                value={form.fecha}
                onChangeText={(text) => handleInputChange('fecha', text)}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Total:</Text>
            <TextInput
                style={styles.input}
                value={form.total}
                onChangeText={(text) => handleInputChange('total', text)}
                placeholder="Monto Total"
                keyboardType="numeric"
            />

            <Button title="Registrar" onPress={handleSubmit} />
        </View>
    );
};

export default ITBISFormScreen;
