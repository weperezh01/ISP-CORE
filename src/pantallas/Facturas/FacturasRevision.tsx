import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const FacturasEnRevisionScreen = () => {
    const [facturas, setFacturas] = useState([]);
    const [filteredFacturas, setFilteredFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const { id_isp, estado } = route.params;

    // Función para formatear la fecha en el formato "DD de MES de AAAA"
    const formatDate = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const day = date.getDate();
        const monthNames = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
    };

    // Función para calcular la fecha de vencimiento
    const calculateFechaVencimiento = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        date.setMonth(date.getMonth() + 1); // Añadir un mes
        date.setDate(date.getDate() - 1); // Restar un día

        return formatDate(date); // Devuelve la fecha formateada
    };

    useEffect(() => {
        const fetchFacturasCobradas = async () => {
            console.log('ID del ISP:', id_isp, 'Estado:', estado);
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/facturas-en-revision', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_isp, estado_revision: estado })
                });
    
                if (!response.ok) {
                    const errorDetails = await response.text();  
                    throw new Error(`Error del servidor: ${response.status} - ${errorDetails}`);
                }
    
                const data = await response.json();
                setFacturas(data);
                setFilteredFacturas(data);
    
            } catch (error) {
                console.error('Error fetching facturas:', error.message);
                setError('Error al cargar las facturas: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
    
        if (id_isp) {
            fetchFacturasCobradas();
        } else {
            setError('No se proporcionó un ID de ISP válido.');
            setLoading(false);
        }
    }, [id_isp]);
    

    useEffect(() => {
        const filterData = (text) => {
            if (!text) {
                setFilteredFacturas(facturas);
            } else {
                const lowercasedFilter = text.toLowerCase();
                const filteredData = facturas.filter(item => {
                    const nombreCliente = item.nombres ? item.nombres.toLowerCase() : '';
                    const apellidoCliente = item.apellidos ? item.apellidos.toLowerCase() : '';
                    const idFactura = item.id_factura ? item.id_factura.toString().toLowerCase() : '';
                    const montoTotal = item.monto_total ? item.monto_total.toString().toLowerCase() : '';
                    const fechaFormateada = item.fecha_formateada ? item.fecha_formateada.toLowerCase() : '';
                    const telefono = item.telefono1 ? item.telefono1.toLowerCase() : '';

                    return `${nombreCliente} ${apellidoCliente}`.includes(lowercasedFilter)
                        || idFactura.includes(lowercasedFilter)
                        || montoTotal.includes(lowercasedFilter)
                        || fechaFormateada.includes(lowercasedFilter)
                        || telefono.includes(lowercasedFilter);
                });
                setFilteredFacturas(filteredData);
            }
        };

        filterData(searchText);
    }, [searchText, facturas]);

    const backgroundColor = isDarkMode ? '#121212' : '#FFF';
    const textColor = isDarkMode ? '#FFF' : '#000';

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return (
            <View style={[styles.center, { backgroundColor }]}>
                <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <Text>Facturas pendiente</Text>
            <View style={styles.header}>
                <TextInput
                    style={[styles.searchBar, { backgroundColor: isDarkMode ? '#555' : '#e8e8e8', color: textColor }]}
                    placeholder="Buscar en facturas..."
                    placeholderTextColor={isDarkMode ? '#bbb' : '#333'}
                    value={searchText}
                    onChangeText={setSearchText}
                    clearButtonMode="while-editing"
                />
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => setIsDarkMode(previousState => !previousState)}
                    value={isDarkMode}
                />
            </View>
            <FlatList
                data={filteredFacturas}
                keyExtractor={item => item.id_factura.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.item, { backgroundColor: isDarkMode ? '#1e1e1e' : '#FFF', borderBottomColor: isDarkMode ? '#303030' : '#DDD' }]}
                        onPress={() => navigation.navigate('DetalleFacturaScreen', { id_factura: item.id_factura, isDarkMode: isDarkMode })}
                    >
                        <Text style={[styles.text, { color: textColor }]}>Factura #{item.id_factura}</Text>
                        <Text style={[styles.text, { color: textColor }]}>Monto: RD${item.monto_total}</Text>
                        <Text style={[styles.text, { color: textColor }]}>
                            Cliente: {item.nombres.trim()} {item.apellidos.trim()}
                        </Text>
                        <Text style={[styles.text, { color: textColor }]}>Teléfono: {item.telefono1}</Text>
                        <Text style={[styles.text, { color: textColor }]}>Fecha Emisión: {formatDate(item.fecha_emision)}</Text>
                        {/* Mostrar la fecha de vencimiento calculada */}
                        <Text style={[styles.text, { color: textColor }]}>Fecha Vencimiento: {calculateFechaVencimiento(item.fecha_emision)}</Text>
                    </TouchableOpacity>
                )}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchBar: {
        flex: 1,
        fontSize: 18,
        padding: 10,
        borderRadius: 10,
        marginRight: 10,
    },
    item: {
        padding: 10,
        marginVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
    },
    text: {
        fontSize: 16,
        marginVertical: 2,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#ff0000',
    },
});

export default FacturasEnRevisionScreen;
