import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './NuevaFacturaScreenStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';


const NuevaFacturaScreen = ({ route, navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const { id_cliente, clientInfo } = route.params;

    const [ciclos, setCiclos] = useState([]);
    const [selectedCicloBase, setSelectedCicloBase] = useState('');
    const [cicloFacturacion, setCicloFacturacion] = useState([]);
    const [selectedCicloFacturacion, setSelectedCicloFacturacion] = useState('');
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [nota, setNota] = useState(''); // Nuevo estado para la nota

    console.log('Datos del cliente:', clientInfo);

    // Recuperar id_isp de AsyncStorage
    const fetchIspIdFromStorage = async () => {
        try {
            const storedIspId = await AsyncStorage.getItem('@selectedIspId');
            if (storedIspId) {
                clientInfo.id_isp = parseInt(storedIspId, 10);
                console.log('ID ISP recuperado del almacenamiento:', clientInfo.id_isp);
            } else {
                console.warn('No se encontró un ID ISP en el almacenamiento.');
            }
        } catch (e) {
            console.error('Error al recuperar el ID ISP de AsyncStorage:', e);
        }
    };

    useEffect(() => {
        const initializeScreen = async () => {
            await fetchIspIdFromStorage(); // Recupera el id_isp
            if (!id_cliente) {
                Alert.alert('Error', 'No se recibió la información del cliente.');
                navigation.goBack();
                return;
            }
            fetchCiclos(); // Llama a los ciclos después de recuperar el id_isp
        };

        initializeScreen();
    }, []);

    // Validación inicial para asegurarnos de que clientInfo es válido
    useEffect(() => {
        if (!id_cliente) {
            Alert.alert('Error', 'No se recibió la información del cliente.');
            navigation.goBack();
            return;
        }
        fetchCiclos();
    }, []);

    // Fetch ciclos base
    // Fetch ciclos base
    const fetchCiclos = async () => {
        try {
            console.log('ID CLIENTE enviado al servidor:', id_cliente);

            const response = await fetch('https://wellnet-rd.com:444/api/ciclos-itinerarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_cliente: id_cliente }),
            });

            if (!response.ok) throw new Error('Error al obtener los ciclos');

            const data = await response.json();
            setCiclos(data.ciclos || []);
        } catch (error) {
            console.error('Error al cargar los ciclos:', error.message);
            Alert.alert('Error', error.message);
        }
    };



    // Fetch ciclo facturación
    const fetchCicloFacturacion = async (idCicloBase) => {
        console.log('Entra a fetchCicloFacturacion');
        console.log('ID Ciclo Base:', idCicloBase);
        console.log('ID ISP:', clientInfo.id_isp);
        setIsLoading(true);
        try {
            console.log('ID ISP en clientInfo:', clientInfo.id_isp);
    
            if (!clientInfo.id_isp) {
                throw new Error('El ID del ISP no está disponible en clientInfo.');
            }
    
            const response = await fetch('https://wellnet-rd.com:444/api/ciclos-facturacion-para-factura', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_isp: clientInfo.id_isp,
                    id_ciclo_base: idCicloBase,
                }),
            });
    
            if (!response.ok) throw new Error('Error al obtener ciclo de facturación.');
    
            const responseJson = await response.json(); // Leer respuesta solo una vez
            console.log(`[${new Date().toLocaleString()}] fetchCicloFacturacion - Response JSON:`, JSON.stringify(responseJson, null, 2));
    
            setCicloFacturacion(responseJson.data || []); // Actualiza el estado con los datos obtenidos
        } catch (error) {
            console.error('Error al consultar ciclo de facturación:', error.message);
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };
    



    // Formatear fechas
    const formatDate = (isoDate) => {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('T')[0].split('-'); // Extraer fecha sin convertir a UTC
        return `${day}-${month}-${year}`;
    };


    // Guardar factura
    // Guardar factura
    const handleGuardarFactura = () => {
        if (!selectedCicloBase || !selectedCicloFacturacion) {
            Alert.alert('Error', 'Por favor complete todos los campos requeridos.');
            return;
        }

        Alert.alert(
            'Confirmar Guardado',
            '¿Está seguro de que desea crear la factura?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Guardar',
                    onPress: async () => {
                        try {
                            const response = await fetch('https://wellnet-rd.com:444/api/crear-factura-nueva-cliente', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id_isp: clientInfo.id_isp,
                                    id_cliente: id_cliente,
                                    id_ciclo: selectedCicloFacturacion,
                                    id_ciclo_base: selectedCicloBase,
                                    id_usuario_crea: 1,
                                    notas: descripcion || '',
                                }),
                            });

                            if (!response.ok) throw new Error('Error al crear la factura.');

                            const result = await response.json();
                            Alert.alert('Éxito', 'La factura ha sido creada correctamente.');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error al crear factura:', error.message);
                            Alert.alert('Error', 'No se pudo crear la factura.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };



    return (
        <View style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>Nueva Factura</Text>
                <Text style={styles.label}>Cliente</Text>
                <Text style={styles.value}>{clientInfo.nombres} {clientInfo.apellidos}</Text>

                {/* Ciclo Base */}
                <Text style={styles.label}>Ciclo Base</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedCicloBase}
                        onValueChange={(itemValue) => {
                            setSelectedCicloBase(itemValue);
                            setCicloFacturacion([]);
                            setSelectedCicloFacturacion('');
                            if (itemValue) fetchCicloFacturacion(itemValue);
                        }}
                        style={styles.picker}
                    >
                        <Picker.Item label="Seleccione un ciclo base" value="" />
                        {ciclos.map((ciclo) => (
                            <Picker.Item
                                key={ciclo.id_ciclo_base}
                                label={`${ciclo.detalle} (Día: ${ciclo.dia_mes})`}
                                value={ciclo.id_ciclo_base}
                            />
                        ))}
                    </Picker>
                </View>

                {/* Ciclo Facturación */}
                <Text style={styles.label}>Ciclo de Facturación</Text>
                <View style={styles.pickerContainer}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#007bff" />
                    ) : (
                        <Picker
                            selectedValue={selectedCicloFacturacion}
                            onValueChange={setSelectedCicloFacturacion}
                            style={styles.picker}
                            enabled={cicloFacturacion.length > 0}
                        >
                            <Picker.Item label="Seleccione un ciclo de facturación" value="" />
                            {cicloFacturacion.map((ciclo) => (
                                <Picker.Item
                                    key={ciclo.id_ciclo}
                                    label={`Inicio: ${formatDate(ciclo.inicio)}, Final: ${formatDate(ciclo.final)}`}
                                    value={ciclo.id_ciclo}
                                />
                            ))}
                        </Picker>
                    )}
                </View>

                {/* Campo de Nota */}
                <Text style={styles.label}>Nota</Text>
                <TextInput
                    style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
                    placeholder="Escriba una nota (opcional)"
                    placeholderTextColor={isDarkMode ? '#ccc' : '#333'}
                    multiline
                    value={descripcion}
                    onChangeText={setDescripcion}
                />

                <TouchableOpacity style={styles.button} onPress={handleGuardarFactura}>
                    <Text style={styles.buttonText}>Guardar Factura</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default NuevaFacturaScreen;



