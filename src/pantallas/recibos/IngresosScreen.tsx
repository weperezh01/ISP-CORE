import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Adjust for timezone offset
    const day = `${date.getDate()}`.padStart(2, '0');
    const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} del ${year}`;
};

const formatMoney = (amount) => {
    return `RD$ ${amount?.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

const IngresosScreen = ({ route }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [ingresos, setIngresos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usuarioId, setUsuarioId] = useState(null);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [selectedIspId, setSelectedIspId] = useState(null);
    const { ispId } = route.params;

    useEffect(() => {
        const fetchSelectedIspId = async () => {
            try {
                const storedIspId = await AsyncStorage.getItem('@selectedIspId');
                if (storedIspId) {
                    setSelectedIspId(storedIspId);
                    console.log('Recuperado ID del ISP:', storedIspId);
                } else {
                    console.warn('No se encontró un ISP seleccionado.');
                }
            } catch (error) {
                console.error('Error al recuperar el ID del ISP:', error);
                Alert.alert('Error', 'No se pudo cargar el ISP seleccionado.');
            }
        };

        fetchSelectedIspId();
        console.log('IngresosScreen montado');
        console.log('ID del ISP seleccionado:', selectedIspId); 
    }, []);

    useEffect(() => {
        const cargarDatosUsuario = async () => {
            try {
                const usuarioData = await AsyncStorage.getItem('@loginData');
                const usuarioInfo = usuarioData ? JSON.parse(usuarioData) : {};
                setUsuarioId(usuarioInfo.id || '');
                setNombreUsuario(usuarioInfo.nombre || '');

                if (!usuarioInfo.id) {
                    console.error('No se pudo obtener el ID del usuario');
                }
            } catch (e) {
                console.error('Error al leer los datos del usuario', e);
            }
        };

        cargarDatosUsuario();
    }, []);

    const registrarNavegacion = async (ingresoData) => {
        if (!usuarioId) return;

        try {
            const fechaActual = new Date();
            const fecha = fechaActual.toISOString().split('T')[0];
            const hora = fechaActual.toTimeString().split(' ')[0];

            const logData = {
                id_usuario: usuarioId,
                fecha,
                hora,
                pantalla: 'IngresosScreen',
                datos: JSON.stringify({
                    isDarkMode,
                    ingresos: ingresoData || []
                }),
            };

            const response = await fetch('https://wellnet-rd.com/api/log-navegacion-registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData),
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Error al registrar la navegación');
            }

            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    useEffect(() => {
        const currentDate = new Date();
        const startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 2);
    
        const formatDateString = (date) => {
            const year = date.getFullYear();
            const month = `0${date.getMonth() + 1}`.slice(-2);
            const day = `0${date.getDate()}`.slice(-2);
            return `${year}-${month}-${day}`;
        };
    
        const fechaInicio = formatDateString(startDate);
        const fechaFin = formatDateString(currentDate);
    
        const fetchIngresos = async () => {
            console.log('Obteniendo ingresos por día...');
            console.log('Fecha de inicio:', fechaInicio);
            console.log('Fecha de fin:', fechaFin);
            console.log('ID del ISP seleccionado:', selectedIspId);

            if (!selectedIspId) {
                console.warn('No se encontró un ID de ISP seleccionado.');
                setLoading(false);
                return;
            }
    
            try {
                const response = await axios.post('https://wellnet-rd.com/api/recibos-por-dia', {
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    id_isp: selectedIspId, // Incluir el id_isp en el payload
                });
    
                const ingresosOrdenados = response.data.reverse();
                setIngresos(ingresosOrdenados);
    
                registrarNavegacion(ingresosOrdenados);
            } catch (error) {
                console.error('Error al obtener los ingresos por día:', error);
            } finally {
                setLoading(false);
            }
        };
    
        if (usuarioId) {
            fetchIngresos();
        }
    }, [usuarioId, selectedIspId]); // Añadir selectedIspId a las dependencias
    

    const chartConfig = {
        backgroundColor: isDarkMode ? '#000' : '#fff',
        backgroundGradientFrom: isDarkMode ? '#000' : '#fff',
        backgroundGradientTo: isDarkMode ? '#333' : '#f4f4f4',
        decimalPlaces: 2,
        color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: isDarkMode ? "#ffa726" : "#ffa726"
        }
    };

    const dataLength = ingresos.length;
    const screenWidth = Dimensions.get('window').width;
    const expandedWidth = Math.max(screenWidth, dataLength * 150);
    const expandedHeight = 300;

    const renderItem = useCallback(({ item }) => (
        <TouchableOpacity onPress={() => {
            navigation.navigate('DetalleIngresoScreen', { ingreso: item, ispId });
            registrarNavegacion(item);
        }}>
            <View style={styles.itemContainer}>
                <Text style={styles.itemDate}>{formatDate(item.dia)}</Text>
                <Text style={styles.itemDetails}>Total Recibos: {item.totalRecibos}</Text>
                <Text style={styles.itemDetails}>Total Monto: {formatMoney(item.totalMonto)}</Text>
            </View>
        </TouchableOpacity>
    ), [navigation]);

    return (
        <View style={styles.container}>
            {/* <View style={styles.container}>
                <Text style={styles.title}>Ingresos para el ISP Seleccionado</Text>
                {selectedIspId ? (
                    <Text style={styles.text}>ID del ISP Seleccionado: {selectedIspId}</Text>
                ) : (
                    <Text style={styles.text}>No se ha seleccionado un ISP.</Text>
                )}
            </View> */}

            <Text style={styles.title}>Ingresos por Día</Text>

            {!loading && ingresos.length > 0 ? (
                <ScrollView horizontal>
                    <ScrollView vertical>
                        <LineChart
                            data={{
                                labels: ingresos.map(item => formatDate(item.dia)),
                                datasets: [
                                    {
                                        data: ingresos.map(item => item.totalMonto),
                                        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                                        strokeWidth: 2,
                                    }
                                ],
                                legend: ["Monto"],
                            }}
                            width={expandedWidth}
                            height={expandedHeight}
                            chartConfig={chartConfig}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                            }}
                            decorator={() => {
                                return ingresos.map((item, index) => {
                                    const x = index * (expandedWidth / dataLength) + 70;
                                    const y = expandedHeight - (item.totalMonto / Math.max(...ingresos.map(i => i.totalMonto)) * expandedHeight) + 10;
                                    return (
                                        <View key={index} style={{ position: 'absolute', top: y, left: x, alignItems: 'flex-start' }}>
                                            <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 12 }}>{formatMoney(item.totalMonto)}</Text>
                                            <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 12 }}>{item.totalRecibos} Recibos</Text>
                                        </View>
                                    );
                                });
                            }}
                        />
                    </ScrollView>
                </ScrollView>
            ) : (
                <Text style={styles.noDataText}>Cargando datos...</Text>
            )}

            <FlatList
                data={ingresos}
                keyExtractor={(item) => item.dia}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.noDataText}>No hay datos disponibles</Text>}
                style={{ marginTop: 10 }}
            />
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#000' : '#fff',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: 16,
    },
    itemContainer: {
        backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
    },
    itemDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: 5,
    },
    itemDetails: {
        fontSize: 16,
        color: isDarkMode ? '#ccc' : '#555',
    },
    noDataText: {
        fontSize: 18,
        color: isDarkMode ? '#ccc' : '#555',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default IngresosScreen;
