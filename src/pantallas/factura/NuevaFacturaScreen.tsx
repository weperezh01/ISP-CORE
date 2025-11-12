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



    const cicloBaseSeleccionado = ciclos.find(c => c.id_ciclo_base === selectedCicloBase);
    const cicloFacturaSeleccionado = cicloFacturacion.find(c => c.id_ciclo === selectedCicloFacturacion);
    const summaryItems = [
        { label: 'Ciclo base', value: cicloBaseSeleccionado ? `${cicloBaseSeleccionado.detalle} · día ${cicloBaseSeleccionado.dia_mes}` : 'Sin seleccionar' },
        { label: 'Facturación', value: cicloFacturaSeleccionado ? `${formatDate(cicloFacturaSeleccionado.inicio)} → ${formatDate(cicloFacturaSeleccionado.final)}` : 'Sin seleccionar' }
    ];
    const isDisabled = !selectedCicloBase || !selectedCicloFacturacion;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionCard}>
                    <Text style={styles.eyebrow}>Cliente</Text>
                    <Text style={styles.headline}>{clientInfo.nombres} {clientInfo.apellidos}</Text>
                    <Text style={styles.subhead}>ID {clientInfo.id_cliente}</Text>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Ciclo base</Text>
                        {cicloBaseSeleccionado && (
                            <View style={styles.badge}><Text style={styles.badgeText}>día {cicloBaseSeleccionado.dia_mes}</Text></View>
                        )}
                    </View>
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
                                    label={`${ciclo.detalle} · día ${ciclo.dia_mes}`}
                                    value={ciclo.id_ciclo_base}
                                />
                            ))}
                        </Picker>
                    </View>
                    <Text style={styles.helperText}>Este ciclo agrupa a los clientes por su día habitual de cobro.</Text>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Ciclo de facturación</Text>
                    </View>
                    <View style={styles.pickerContainer}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color={isDarkMode ? '#93C5FD' : '#2563EB'} />
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
                                        label={`Inicio ${formatDate(ciclo.inicio)} / Fin ${formatDate(ciclo.final)}`}
                                        value={ciclo.id_ciclo}
                                    />
                                ))}
                            </Picker>
                        )}
                    </View>
                    <Text style={styles.helperText}>Define la ventana que se cobrará al cliente. Debe pertenecer al ciclo base anterior.</Text>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Nota</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe el motivo de la factura, trabajos realizados o instrucciones especiales"
                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#94A3B8'}
                        multiline
                        value={descripcion}
                        onChangeText={setDescripcion}
                    />
                    <Text style={styles.helperText}>La nota es opcional y se mostrará en el historial del cliente.</Text>
                </View>

                <View style={styles.sectionCard}>
                    {summaryItems.map(item => (
                        <View key={item.label} style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{item.label}</Text>
                            <Text style={styles.summaryValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.primaryButton, isDisabled && styles.primaryButtonDisabled]}
                    onPress={handleGuardarFactura}
                    disabled={isDisabled}
                >
                    <Text style={styles.primaryButtonText}>Guardar factura</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default NuevaFacturaScreen;



