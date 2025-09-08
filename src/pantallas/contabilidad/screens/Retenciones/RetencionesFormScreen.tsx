import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import api from '../../utils/api';
import styles from './styles'; // Importar los estilos predefinidos

const RetencionesFormScreen = () => {
    const [form, setForm] = useState({
        tipo: '',
        fecha: '',
        total: '',
    });

    const handleInputChange = (key, value) => {
        setForm({ ...form, [key]: value });
    };

    const handleSubmit = async () => {
        try {
            await api.post('/retenciones', form);
            alert('Retención registrada con éxito');
        } catch (error) {
            console.error('Error al registrar retención:', error);
            alert('Ocurrió un error, intenta nuevamente.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Registrar Retención</Text>

            <Text style={styles.label}>Tipo:</Text>
            <TextInput
                style={styles.input}
                value={form.tipo}
                onChangeText={(text) => handleInputChange('tipo', text)}
                placeholder="Tipo de Retención"
            />

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

export default RetencionesFormScreen;
