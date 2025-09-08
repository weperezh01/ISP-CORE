import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComponent from '../../componentes/HeaderComponent';
import { Card } from 'react-native-paper';
import { getAdditionalStyles } from './componentes_instalacion/additionalStyles'; // Estilos adicionales
import EquiposForm from './componentes_instalacion/EquiposForm'; // Componentes reutilizables
import MaterialesForm from './componentes_instalacion/MaterialesForm';

const DesmantelamientoForm = ({ route, navigation }) => {
    const { id_desmantelamiento, id_conexion, id_isp, isEditMode } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const additionalStyles = getAdditionalStyles(isDarkMode);

    const [nombreUsuario, setNombreUsuario] = useState('');
    const [idUsuario, setIdUsuario] = useState('');
    const [form, setForm] = useState({
        motivo_desmantelamiento: '',
        notas_desmantelamiento: '',
        router_wifi: '',
        router_onu: '',
        serial_onu: '',
        radios: '',
        pies_utp_cat5: '',
        pies_utp_cat6: '',
        pies_drop_fibra: '',
        conector_mecanico_fibra: '',
        conector_rj45: '',
        pinzas_anclaje: '',
        bridas: '',
        grapas: '',
        velas_silicon: '',
        pies_tubo: '',
        rollos_cable_dulce: '',
        clavos: '',
        tornillos: '',
        abrazaderas: '',
        latitud: '',
        longitud: '',
    });

    useEffect(() => {
        const loadData = async () => {
            if (isEditMode) {
                try {
                    const response = await fetch('https://wellnet-rd.com:444/api/desmantelamiento', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_desmantelamiento })
                    });
                    if (!response.ok) throw new Error('Failed to fetch desmantelamiento data');
                    const data = await response.json();
                    setForm(data);
                } catch (error) {
                    Alert.alert("Error", error.message);
                }
            }
            obtenerDatosUsuario();
        };
        loadData();
    }, [id_desmantelamiento, isEditMode]);

    const handleChange = (name, value) => {
        setForm(prevForm => ({ ...prevForm, [name]: value }));
    };

    const handleSubmit = async () => {
        const url = 'https://wellnet-rd.com:444/api/insertar-desmantelamiento';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    id_usuario: idUsuario,
                    id_isp: id_isp,
                    id_conexion: id_conexion,
                }),
            });
            if (!response.ok) throw new Error('Server response was not ok');
            Alert.alert("Éxito", "Desmantelamiento registrado exitosamente", [{ text: "OK", onPress: () => navigation.goBack() }]);
        } catch (error) {
            Alert.alert("Error", "Fallo al guardar el desmantelamiento. Por favor intente nuevamente.");
        }
    };

    const obtenerDatosUsuario = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            if (jsonValue) {
                const userData = JSON.parse(jsonValue);
                setNombreUsuario(userData.nombre);
                setIdUsuario(userData.id);
            } else {
                setNombreUsuario('Usuario');
            }
        } catch (e) {
            console.error('Failed to read user data', e);
            setNombreUsuario('Usuario');
        }
    };

    return (
        <View style={styles.container}>
            <HeaderComponent nombreUsuario={nombreUsuario} titulo={isEditMode ? "Editar Desmantelamiento" : "Nuevo Desmantelamiento"} />
            <ScrollView>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Motivo del Desmantelamiento</Text>
                    <TextInput
                        style={styles.input}
                        value={form.motivo_desmantelamiento}
                        onChangeText={(value) => handleChange('motivo_desmantelamiento', value)}
                        placeholder="Ingrese el motivo"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Notas del Desmantelamiento</Text>
                    <TextInput
                        style={styles.input}
                        value={form.notas_desmantelamiento}
                        onChangeText={(value) => handleChange('notas_desmantelamiento', value)}
                        placeholder="Añade notas relevantes"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                        multiline
                    />
                </View>
                <EquiposForm form={form} handleChange={handleChange} />
                <MaterialesForm form={form} handleChange={handleChange} />
                <Card style={styles.card}>
                    <Card.Title title="Coordenadas" />
                    <Card.Content>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Latitud</Text>
                            <TextInput
                                style={styles.input}
                                value={form.latitud}
                                onChangeText={(value) => handleChange('latitud', value)}
                                placeholder="Coordenadas de latitud"
                                placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Longitud</Text>
                            <TextInput
                                style={styles.input}
                                value={form.longitud}
                                onChangeText={(value) => handleChange('longitud', value)}
                                placeholder="Coordenadas de longitud"
                                placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </Card.Content>
                </Card>
                <View style={styles.buttonContainer}>
                    <Button title="Guardar Desmantelamiento" onPress={handleSubmit} color="#4CAF50" />
                </View>
            </ScrollView>
        </View>
    );
};

export default DesmantelamientoForm;
