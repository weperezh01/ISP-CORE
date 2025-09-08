import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Card, TextInput, Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../../ThemeContext';
import HorizontalMenu from '../../../../componentes/HorizontalMenu';
import api from '../../utils/api';
import getStyles from './styles'; // Importar estilos dinámicos

const ConfiguracionScreen2 = () => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode); // Generar estilos dinámicos
    const navigation = useNavigation();

    const [config, setConfig] = useState({
        tasaITBIS: '',
        moneda: 'DOP',
        empresaNombre: '',
    });

    const [impuestos, setImpuestos] = useState({
        isr: 0,
        itbis: 0,
        impuesto_selectivo: 0,
        impuesto_patrimonio: 0,
        impuesto_sucesion: 0,
        impuesto_activos: 0,
        impuesto_cheques: 0,
        impuesto_vehiculos: 0,
        impuesto_ganancia_capital: 0,
        impuesto_transferencia_inmobiliaria: 0,
        cdt: 0,
    });

    const handleInputChange = (key, value) => {
        setImpuestos({ ...impuestos, [key]: value });
    };

    const handleSave = () => {
        // Validar si todos los valores de impuestos son numéricos
        const hasInvalidValues = Object.values(impuestos).some((val) => isNaN(val) || val < 0);
        if (hasInvalidValues) {
            Alert.alert('Error', 'Por favor ingrese valores válidos para todos los impuestos.');
            return;
        }

        Alert.alert('Configuración Guardada', 'Los cambios se han guardado correctamente.');
        console.log('Impuestos actualizados:', impuestos);
    };


    useEffect(() => {
        const fetchImpuestos = async () => {
            try {
                const response = await api.get('/contabilidad/obtener-impuestos', {
                    params: { id_isp: 1 }, // Cambiar por el id_isp dinámico si es necesario
                });
                if (response.data) {
                    setImpuestos(response.data[0]);
                }
            } catch (error) {
                console.error('Error al obtener impuestos:', error);
                Alert.alert('Error', 'No se pudieron cargar los impuestos.');
            }
        };

        fetchImpuestos();
    }, []);

    const botones = [
        {
            id: '1',
            title: 'Menú',
            action: () => navigation.navigate('DashboardScreenContabilidad'),
            icon: 'bars',
        },
        {
            id: '2',
            title: 'Configuraciones',
            screen: 'ConfiguracionScreen2',
            icon: 'cog',
        },
        {
            id: '3',
            title: 'Plan de Cuentas',
            screen: 'PlanDeCuentasScreen',
            icon: 'book',
        },
        {
            id: '4',
            title: 'Libro Diario',
            screen: 'LibroDiarioScreen',
            icon: 'book',
        },
    ];
    const sendDataToAPI = async () => {
        try {
            const formattedData = {
                ...impuestos,
                tasaITBIS: parseFloat(config.tasaITBIS),
            };

            const response = await api.post('/contabilidad/guardar-impuestos', formattedData);
            if (response.status === 200) {
                Alert.alert('Éxito', 'Los cambios se han guardado en el servidor.');
            }
        } catch (error) {
            console.error('Error al guardar los impuestos:', error);
            Alert.alert('Error', 'No se pudieron guardar los datos.');
        }
    };

    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#f9f9f9' }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
                    <View style={styles.container}>
                        <Card style={styles.card}>
                            <Card.Title
                                title="Configuración de Impuestos"
                                titleStyle={styles.cardTitle}
                            />
                            <Divider style={styles.divider} />
                            <Card.Content>
                                <TextInput
                                    mode="outlined"
                                    label="Nombre de la Empresa"
                                    placeholder="Ingrese el nombre de la empresa"
                                    value={config.empresaNombre}
                                    onChangeText={(text) => setConfig({ ...config, empresaNombre: text })}
                                    style={styles.input}
                                    theme={{
                                        colors: {
                                            text: isDarkMode ? '#fff' : '#000', // Texto blanco en modo oscuro
                                            placeholder: isDarkMode ? '#aaa' : '#666', // Placeholder claro en modo oscuro
                                            background: isDarkMode ? '#2c2c2c' : '#fff', // Fondo
                                            primary: isDarkMode ? '#fff' : '#000', // Color del borde activo
                                        },
                                    }}
                                />

                                <TextInput
                                    mode="outlined"
                                    label="Tasa de ITBIS (%)"
                                    placeholder="Ingrese la tasa de ITBIS"
                                    value={config.tasaITBIS}
                                    onChangeText={(text) => setConfig({ ...config, tasaITBIS: text })}
                                    keyboardType="numeric"
                                    style={styles.input}
                                    theme={{
                                        colors: {
                                            text: isDarkMode ? '#fff' : '#000',
                                            placeholder: isDarkMode ? '#aaa' : '#666',
                                            background: isDarkMode ? '#2c2c2c' : '#fff',
                                        },
                                    }}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Moneda"
                                    placeholder="Ingrese el tipo de moneda"
                                    value={config.moneda}
                                    onChangeText={(text) => setConfig({ ...config, moneda: text })}
                                    style={styles.input}
                                    theme={{
                                        colors: {
                                            text: isDarkMode ? '#fff' : '#000',
                                            placeholder: isDarkMode ? '#aaa' : '#666',
                                            background: isDarkMode ? '#2c2c2c' : '#fff',
                                        },
                                    }}
                                />
                                <Divider style={styles.divider} />
                                {Object.keys(impuestos).map((key) => (
                                    <TextInput
                                        key={key}
                                        mode="outlined"
                                        label={key.replace(/_/g, ' ').toUpperCase()}
                                        placeholder="0.00"
                                        value={impuestos[key].toString()}
                                        onChangeText={(text) => handleInputChange(key, parseFloat(text))}
                                        keyboardType="numeric"
                                        style={styles.input}
                                        theme={{
                                            colors: {
                                                text: isDarkMode ? '#fff' : '#000',
                                                placeholder: isDarkMode ? '#aaa' : '#666',
                                                background: isDarkMode ? '#2c2c2c' : '#fff',
                                            },
                                        }}
                                    />
                                ))}
                            </Card.Content>

                        </Card>
                        <View style={styles.buttonContainer}>
                            <Button
                                mode="contained"
                                onPress={handleSave}
                                style={styles.button}
                                labelStyle={styles.buttonLabel}
                            >
                                Guardar Configuración
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Menú horizontal */}
            <HorizontalMenu
                botones={botones}
                navigation={navigation}
                isDarkMode={isDarkMode}
            />
        </>
    );
};

export default ConfiguracionScreen2;
