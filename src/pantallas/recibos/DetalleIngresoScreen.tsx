import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = `${date.getDate()}`.slice(-2);
    const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} del ${year}`;
};

const formatMoney = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
        return 'RD$ 0.00';
    }
    return `RD$ ${Number(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

const formatTime = (timeString) => {
    if (!timeString) return '';
    let [hours, minutes] = timeString.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ampm}`;
};

const DetalleIngresoScreen = ({ route }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const { ingreso, ispId } = route.params;
    const [recibos, setRecibos] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredRecibos, setFilteredRecibos] = useState([]);
    const navigation = useNavigation();
    const [usuarioId, setUsuarioId] = useState(null);

    console.log('Fecha:', formatDate(ingreso.dia));
    console.log('Hora:', formatTime(ingreso.dia.split('T')[1]));
    console.log('DetalleIngresoScreen', ingreso);
    console.log('ISP ID:', ispId);
    console.log('params:', route.params);   

    useEffect(() => {
        const cargarDatosUsuario = async () => {
            try {
                const usuarioData = await AsyncStorage.getItem('@loginData');
                const usuarioInfo = usuarioData ? JSON.parse(usuarioData) : {};
                setUsuarioId(usuarioInfo.id || '');

                if (!usuarioInfo.id) {
                    console.error('No se pudo obtener el ID del usuario');
                }
            } catch (e) {
                console.error('Error al leer los datos del usuario', e);
            }
        };

        cargarDatosUsuario();
    }, []);

    useEffect(() => {
        const fetchRecibos = async () => {
            try {
                const response = await axios.post('https://wellnet-rd.com/api/recibos-por-dia-especifico', {
                    fecha: ingreso.dia.split('T')[0], 
                    id_cliente: ingreso.id_cliente,
                    id_isp: ispId,
                });
                const recibosOrdenados = response.data.reverse();
                setRecibos(recibosOrdenados);
                setFilteredRecibos(recibosOrdenados);

                if (usuarioId) {
                    registrarNavegacion(recibosOrdenados);
                }
            } catch (error) {
                console.error('Error al obtener los recibos:', error);
            }
        };

        if (usuarioId) {
            fetchRecibos();
        }
    }, [ingreso.dia, usuarioId]);

    const registrarNavegacion = async (recibosData) => {
        if (!usuarioId) return;

        try {
            const fechaActual = new Date();
            const fecha = fechaActual.toISOString().split('T')[0];
            const hora = fechaActual.toTimeString().split(' ')[0];

            const logData = {
                id_usuario: usuarioId,
                fecha,
                hora,
                pantalla: 'DetalleIngresoScreen',
                datos: JSON.stringify({
                    isDarkMode,
                    ingreso,
                    recibos: recibosData || []
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
        if (searchText.trim() === '') {
            setFilteredRecibos(recibos);
        } else {
            const filtered = recibos.filter((item) => 
                item.cliente_nombres?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.cliente_apellidos?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.usuario_nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.usuario_apellido?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.id_recibo.toString().includes(searchText) ||
                (item.facturas && item.facturas.some(factura => 
                    factura.id_factura.toString().includes(searchText) ||
                    (factura.detallesFactura && factura.detallesFactura.id_conexion && factura.detallesFactura.id_conexion.toString().includes(searchText))
                ))
            );
            setFilteredRecibos(filtered.reverse());
        }
    }, [searchText, recibos]);

    const renderFactura = (factura) => (
        <View style={styles.facturaContainer} key={factura.id_factura}>
            <Text style={styles.facturaText}>ID Factura: {factura.id_factura}</Text>
            <Text style={styles.facturaText}>
                ID Conexión: {factura.detallesFactura?.id_conexion ?? 'N/A'}
            </Text>
            <Text style={styles.facturaText}>
                Dirección Conexión: {factura.detallesFactura?.detallesConexion?.direccion ?? 'N/A'}
            </Text>
            <Text style={styles.facturaText}>
                Monto Total: {factura.detallesFactura ? formatMoney(factura.detallesFactura.monto_total) : 'N/A'}
            </Text>
            <Text style={styles.facturaText}>
                Fecha Emisión: {factura.detallesFactura ? formatDate(factura.detallesFactura.fecha_emision) : 'N/A'}
            </Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.reciboContainer}
            onPress={() => navigation.navigate('ReciboScreen', { reciboData: item })}
        >
            <Text style={styles.reciboText}>ID Recibo: {item.id_recibo}</Text>
            <Text style={styles.reciboText}>Monto: {formatMoney(item.monto)}</Text>
            <Text style={styles.reciboText}>Cliente: {item.cliente_nombres} {item.cliente_apellidos}</Text>
            <Text style={styles.reciboText}>Fecha: {formatDate(item.fecha)}</Text>
            <Text style={styles.reciboText}>Hora: {formatTime(item.hora)}</Text>
            <Text style={styles.reciboText}>Usuario: {item.usuario_nombre} {item.usuario_apellido}</Text>
            {item.facturas && item.facturas.map(renderFactura)}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Detalle del Ingreso</Text>
            <Text style={styles.itemDate}>{formatDate(ingreso.dia)}</Text>  
            <Text style={styles.itemDetails}>Total Recibos: {ingreso.totalRecibos}</Text>
            <Text style={styles.itemDetails}>Total Monto: {formatMoney(ingreso.totalMonto)}</Text>

            <TextInput
                style={styles.searchBar}
                placeholder="Buscar recibos..."
                placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                value={searchText}
                onChangeText={setSearchText}
            />

            <FlatList
                data={filteredRecibos}
                keyExtractor={(item) => item.id_recibo.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.noDataText}>No hay recibos para este día</Text>}
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
    searchBar: {
        backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
        color: isDarkMode ? '#fff' : '#000',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    reciboContainer: {
        backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
    },
    reciboText: {
        fontSize: 16,
        color: isDarkMode ? '#ccc' : '#555',
    },
    facturaContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: isDarkMode ? '#444' : '#ececec',
        borderRadius: 8,
    },
    facturaText: {
        fontSize: 14,
        color: isDarkMode ? '#ccc' : '#555',
    },
    noDataText: {
        fontSize: 18,
        color: isDarkMode ? '#ccc' : '#555',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default DetalleIngresoScreen;
