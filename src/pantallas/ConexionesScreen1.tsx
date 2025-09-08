import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Modal, TextInput, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../../ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../componentes/themeSwitch';
import { getStyles } from '../estilos/styles';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ConexionesScreen = ({ route }) => {
    const { ispId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [connectionStates, setConnectionStates] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStatusId, setSelectedStatusId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [connectionDetails, setConnectionDetails] = useState([]);
    const [filteredConnections, setFilteredConnections] = useState([]);
    const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });

    const obtenerDatosUsuario = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            if (jsonValue != null) {
                const userData = JSON.parse(jsonValue);
                setNombreUsuario(userData.nombre);
            }
        } catch (e) {
            console.error('Error al leer el nombre del usuario', e);
        }
    };

    const fetchConnectionStates = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/conexiones-estados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ispId: ispId })
            });
            if (response.ok) {
                const data = await response.json();
                setConnectionStates(data);
            } else {
                throw new Error('Fallo al obtener los estados de conexión');
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchConnectionDetails = async (estadoId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/obtener-conexiones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_isp: ispId, id_estado_conexion: estadoId, page: 1, limit: 100, searchQuery: '' })
            });
            if (response.ok) {
                const data = await response.json();
                setConnectionDetails(data);
                setFilteredConnections(data);
            } else {
                throw new Error('Fallo al obtener detalles de las conexiones');
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchChartData = async () => {
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/conexiones-diarias/${ispId}`);
            if (response.ok) {
                const data = await response.json();
                const labels = data.map(item => formatDate(item.fecha));
                const dataSet = data.map(item => item.cantidad_activa);
                setChartData({
                    labels,
                    datasets: [{ data: dataSet }]
                });
            } else {
                throw new Error('Fallo al obtener datos de la gráfica');
            }
        } catch (error) {
            console.error('Error al obtener datos de la gráfica:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useFocusEffect(
        useCallback(() => {
            obtenerDatosUsuario();
            fetchConnectionStates();
            fetchChartData();
        }, [])
    );

    useEffect(() => {
        if (searchQuery) {
            const filtered = connectionDetails.filter((connection) => {
                return (
                    (connection.id_conexion && connection.id_conexion.toString().includes(searchQuery)) ||
                    (connection.direccion && connection.direccion.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (connection.referencia && connection.referencia.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (connection.nombres && connection.nombres.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (connection.apellidos && connection.apellidos.toLowerCase().includes(searchQuery.toLowerCase()))
                );
            });
            setFilteredConnections(filtered);
        } else {
            setFilteredConnections(connectionDetails);
        }
    }, [searchQuery, connectionDetails]);

    const handleStatusPress = (id) => {
        setSelectedStatusId(id);
        fetchConnectionDetails(id);
        setModalVisible(true);
    };

    const seleccionarConexion = (conexion) => {
        console.log('id_conexion: ' + conexion.id_conexion);
        navigation.navigate('ConexionDetalles', { connectionId: conexion.id_conexion });
        setModalVisible(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const statusOptions = [
        { id: 1, title: 'Pendientes' },
        { id: 2, title: 'Ejecución' },
        { id: 3, title: 'Activas' },
        { id: 4, title: 'Suspendida' },
        { id: 5, title: 'Baja Voluntaria' },
        { id: 6, title: 'Baja Forzada' },
        { id: 7, title: 'Averías' },
        { id: 8, title: 'Reconexión' },
    ];

    const chartConfig = {
        backgroundColor: '#e26a00',
        backgroundGradientFrom: '#fb8c00',
        backgroundGradientTo: '#ffa726',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726'
        },
        formatYLabel: (yValue) => formatCurrency(yValue),
    };

    const lineChartWidth = screenWidth * (chartData.labels.length / 3);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.containerSuperior}>
                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Conexiones</Text>
                <ThemeSwitch />
            </View>
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={statusOptions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                item.id === selectedStatusId ? styles.selectedStatusButton : {}
                            ]}
                            onPress={() => handleStatusPress(item.id)}
                        >
                            <Text style={styles.statusButtonText}>
                                {`${item.title} (${connectionStates[item.id]?.cantidad || 0})`}
                            </Text>
                            <Text style={styles.statusButtonText}>
                                {formatCurrency(connectionStates[item.id]?.suma_precio || 0)}
                            </Text>
                        </TouchableOpacity>
                    )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    ListFooterComponent={
                        chartData.labels.length > 0 && chartData.datasets[0].data.length > 0 ? (
                            <View style={styles.chartContainer}>
                                <Text style={styles.title}>Conexiones Activas</Text>
                                <ScrollView horizontal>
                                    <LineChart
                                        data={chartData}
                                        width={lineChartWidth}
                                        height={220}
                                        chartConfig={chartConfig}
                                        bezier
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                        }}
                                        renderDotContent={({ x, y, index }) => (
                                            <Text key={index} style={{ position: 'absolute', top: y - 10, left: x + 5, fontSize: 10, color: '#000' }}>
                                                {chartData.datasets[0].data[index]}
                                            </Text>
                                        )}
                                    />
                                </ScrollView>
                            </View>
                        ) : null
                    }
                />
            )}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.darkMode : styles.lightMode]}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar conexión por ID, dirección o referencia"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <FlatList
                        data={filteredConnections}
                        keyExtractor={(item) => item.id_conexion.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.clienteItem}
                                onPress={() => seleccionarConexion(item)}
                            >
                                <Text style={styles.clienteItemText}>
                                    {`ID: ${item.id_conexion}, Dirección: ${item.direccion}, Referencia: ${item.referencia}, Cliente: ${item.nombres} ${item.apellidos}`}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.buttonText}>Cerrar</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    containerSuperior: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f8f8f8',
    },
    container: {
        flex: 1,
        padding: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    statusButton: {
        padding: 10,
        backgroundColor: '#ddd',
        marginVertical: 5,
        borderRadius: 5,
    },
    selectedStatusButton: {
        backgroundColor: '#bbb',
    },
    statusButtonText: {
        fontSize: 16,
        color: '#000',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        margin: 10,
    },
    clienteItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    clienteItemText: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    darkMode: {
        backgroundColor: '#333',
        color: '#fff',
    },
    lightMode: {
        backgroundColor: '#fff',
        color: '#000',
    },
    chartContainer: {
        marginTop: 20,
        flexDirection: 'row'
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#000',
    }
});

export default ConexionesScreen;
