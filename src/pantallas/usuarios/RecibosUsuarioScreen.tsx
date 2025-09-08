import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

// Función para formatear la fecha en "DD de Mes del AAAA"
const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = `0${date.getUTCDate()}`.slice(-2); // Usar getUTCDate()
    const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = monthNames[date.getUTCMonth()]; // Usar getUTCMonth()
    const year = date.getUTCFullYear(); // Usar getUTCFullYear()
    return `${day} de ${month} del ${year}`;
};


// Función para formatear el dinero en "RD$ 123,123,123.00"
const formatMoney = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
        return 'RD$ 0.00';  // Valor predeterminado si el monto es inválido
    }
    return `RD$ ${Number(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

const RecibosUsuarioScreen = ({ route }) => {
    const { userId } = route.params; // Obtener el ID del usuario de las props
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [recibos, setRecibos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecibosUsuario = async () => {
            try {

                // 1. Obtener la fecha actual
                const fechaFin = new Date(); // hoy
                // 2. Restar 30 días para obtener la fecha de inicio
                const fechaInicio = new Date();
                fechaInicio.setDate(fechaInicio.getDate() - 30);

                // 3. Convertir a formato YYYY-MM-DD (si tu API lo requiere así)
                const fechaFinFormateada = fechaFin.toISOString().split('T')[0];
                const fechaInicioFormateada = fechaInicio.toISOString().split('T')[0];

                const response = await axios.post('https://wellnet-rd.com/api/recibos-por-usuario', {
                    fecha_inicio: fechaInicioFormateada,
                    fecha_fin: fechaFinFormateada,
                    id_usuario: userId,
                });

                const recibosOrdenados = response.data.reverse();
                setRecibos(recibosOrdenados);
            } catch (error) {
                console.error('Error al obtener los recibos del usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecibosUsuario();
    }, [userId]);

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

    const dataLength = recibos.length;
    const screenWidth = Dimensions.get('window').width;
    const expandedWidth = Math.max(screenWidth, dataLength * 150);
    const expandedHeight = 300;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recibos del Usuario</Text>

            {!loading && recibos.length > 0 ? (
                <ScrollView horizontal>
                    <ScrollView vertical>
                        <LineChart
                            data={{
                                labels: recibos.map(item => formatDate(item.dia)),
                                datasets: [
                                    {
                                        data: recibos.map(item => item.totalMonto),
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
                                return recibos.map((item, index) => {
                                    const x = index * (expandedWidth / dataLength) + 70;
                                    const y = expandedHeight - (item.totalMonto / Math.max(...recibos.map(i => i.totalMonto)) * expandedHeight) + 10;
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
                data={recibos}
                keyExtractor={(item) => item.dia}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('DetalleIngresoUsuarioScreen', { usuarioId: userId, fecha: item.dia })}>
                        <View style={styles.itemContainer}>
                            <Text style={styles.itemDate}>{formatDate(item.dia)}</Text>
                            <Text style={styles.itemDetails}>Total Recibos: {item.totalRecibos}</Text>
                            <Text style={styles.itemDetails}>Total Monto: {formatMoney(item.totalMonto)}</Text>
                        </View>
                    </TouchableOpacity>
                )}
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

export default RecibosUsuarioScreen;
