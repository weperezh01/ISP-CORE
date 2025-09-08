import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../../../ThemeContext';

const TransaccionFormScreen = () => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const route = useRoute();

    const [fecha, setFecha] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cuentaDebito, setCuentaDebito] = useState('');
    const [cuentaCredito, setCuentaCredito] = useState('');
    const [monto, setMonto] = useState('');
    const [referenciaExterna, setReferenciaExterna] = useState('');
    const [usuarioId, setUsuarioId] = useState('');
    const [estado, setEstado] = useState('pendiente');
    const [transaccionId, setTransaccionId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (route.params && route.params.transaccion) {
            const { transaccion } = route.params;
            setFecha(transaccion.fecha);
            setDescripcion(transaccion.descripcion);
            setCuentaDebito(transaccion.cuenta_debito);
            setCuentaCredito(transaccion.cuenta_credito);
            setMonto(transaccion.monto);
            setReferenciaExterna(transaccion.referencia_externa);
            setUsuarioId(transaccion.usuario_id);
            setEstado(transaccion.estado);
            setTransaccionId(transaccion.id);
            setIsEditing(true);
        }
    }, [route.params]);

    const handleSubmit = async () => {
        const url = isEditing
            ? `https://wellnet-rd.com/api/contabilidad/transacciones/${transaccionId}`
            : 'https://wellnet-rd.com/api/contabilidad/transaccion';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fecha,
                    descripcion,
                    cuenta_debito: cuentaDebito,
                    cuenta_credito: cuentaCredito,
                    monto,
                    referencia_externa: referenciaExterna,
                    usuario_id: usuarioId,
                    estado,
                }),
            });

            if (response.ok) {
                Alert.alert('Éxito', `Transacción ${isEditing ? 'actualizada' : 'creada'} correctamente`);
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
            <Text style={styles.label}>Fecha:</Text>
            <TextInput
                style={styles.input}
                value={fecha}
                onChangeText={setFecha}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <Text style={styles.label}>Descripción:</Text>
            <TextInput
                style={styles.input}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <Text style={styles.label}>Cuenta Débito:</Text>
            <TextInput
                style={styles.input}
                value={cuentaDebito}
                onChangeText={setCuentaDebito}
                placeholder="ID de la Cuenta Débito"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <Text style={styles.label}>Cuenta Crédito:</Text>
            <TextInput
                style={styles.input}
                value={cuentaCredito}
                onChangeText={setCuentaCredito}
                placeholder="ID de la Cuenta Crédito"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <Text style={styles.label}>Monto:</Text>
            <TextInput
                style={styles.input}
                value={monto}
                onChangeText={setMonto}
                placeholder="Monto"
                keyboardType="numeric"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <Text style={styles.label}>Referencia Externa:</Text>
            <TextInput
                style={styles.input}
                value={referenciaExterna}
                onChangeText={setReferenciaExterna}
                placeholder="Referencia Externa"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <Text style={styles.label}>Estado:</Text>
            <TextInput
                style={styles.input}
                value={estado}
                onChangeText={setEstado}
                placeholder="Estado"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            />
            <Button title={isEditing ? 'Actualizar Transacción' : 'Crear Transacción'} onPress={handleSubmit} />
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

export default TransaccionFormScreen;
