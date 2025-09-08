import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../componentes/themeSwitch';

const ConexionesActivas = ({ route }) => {
    const navigation = useNavigation();
    // const { ispId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [connectionStates, setConnectionStates] = useState({});
    const [connectionDetails, setConnectionDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedStatusId, setSelectedStatusId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredConnectionDetails, setFilteredConnectionDetails] = useState([]);
    const [ispId, setIspId] = useState(null);



    const loadInitialData = async () => {
        try {
            const storedIspId = await AsyncStorage.getItem('@selectedIspId');
            const storedStatusId = await AsyncStorage.getItem('@selectedStatusId');

            console.log('ISP ID from storage:', storedIspId);
            console.log('Status ID from storage:', storedStatusId);

            if (storedIspId !== null) {
                setIspId(storedIspId);
            }
            if (storedStatusId !== null) {
                setSelectedStatusId(parseInt(storedStatusId));
            }
        } catch (e) {
            console.error('Error reading from local storage', e);
        }
    };
    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (ispId) {
            fetchConnectionStates();
        }
        // `obtenerDatosUsuario` puede permanecer aquí si no depende de `ispId`
        obtenerDatosUsuario();
    }, [ispId]); // Este efecto depende de `ispId` y se ejecutará de nuevo cuando `ispId` cambie

    // Elimina la llamada a `fetchConnectionStates()` del efecto que se ejecuta en el montaje



    // useEffect(() => {
    //     const loadFromStorage = async () => {
    //         try {
    //             const storedIspId = await AsyncStorage.getItem('@ispId');
    //             if (storedIspId !== null) {
    //                 setIspId(storedIspId);
    //             }
    //         } catch (e) {
    //             console.error('Error al leer el ISP ID del local storage', e);
    //         }
    //     };

    //     loadFromStorage();
    //     obtenerDatosUsuario();
    // }, []);

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

    const fetchConnectionStates = useCallback(async () => {
        console.log('ispId: ' + ispId);
        if (!ispId) return; // Asegúrate de tener un ispId antes de hacer la llamada
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
                fetchConnectionDetails();
            } else {
                throw new Error('Fallo al obtener los estados de conexión');
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoading(false);
        }
    }, [ispId]);

    // fetchConnectionDetails ahora se define usando useCallback para evitar recreaciones innecesarias
    const fetchConnectionDetails = useCallback(async (page = 1) => {
        if (!ispId || isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/conexiones-isp?page=${page}&limit=10`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_isp: ispId, id_estado_conexion: 8 })
            });
            if (response.ok) {
                const newConnectionDetails = await response.json();
                if (newConnectionDetails.length < 10) {
                    setHasMore(false);
                }
                setConnectionDetails(prevConnectionDetails => {
                    const allConnectionDetails = [...prevConnectionDetails, ...newConnectionDetails];
                    const uniqueConnectionDetails = Array.from(new Set(allConnectionDetails.map(item => item.id_conexion)))
                        .map(id => allConnectionDetails.find(item => item.id_conexion === id));
                    setFilteredConnectionDetails(uniqueConnectionDetails);
                    return uniqueConnectionDetails;
                });
            } else {
                throw new Error('Fallo al obtener detalles de las conexiones');
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoading(false);
        }
        setCurrentPage(page);
    }, [ispId, isLoading, hasMore]);  // Dependencias del useCallback


    // Este efecto se ejecuta una sola vez al montar el componente
    useEffect(() => {
        console.log('Parámetros recibidos:', route.params);
        loadInitialData();
        fetchConnectionStates();
        obtenerDatosUsuario();
        // No incluir fetchConnectionDetails aquí para evitar llamadas duplicadas
    }, []);

    useEffect(() => {
        handleSearch(searchQuery); // Re-filtrar siempre que los detalles de conexión cambien
    }, [connectionDetails, searchQuery]);


    // Esta función se activará cuando se presione un botón de estado
    const handleStatusPress = (id) => {
        setSelectedStatusId(id); // Guarda el ID del estado seleccionado
        fetchConnectionDetails(currentPage, id); // Pasa el ID a la función de obtener detalles
    };


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Add this inside your ConexionesScreen component, above the return statement.
    const statusOptions = [
        // { id: 1, title: 'Pendientes' },
        // { id: 2, title: 'Ejecución' },
        // { id: 3, title: 'Activas' },
        // { id: 4, title: 'Suspendida' },
        // { id: 5, title: 'Baja Voluntaria' },
        // { id: 6, title: 'Baja Forzada' },
        // { id: 7, title: 'Averías' },
        { id: 8, title: 'Reconexión' },
    ];



    const handleSearch = (text) => {
        setSearchQuery(text);
        const formattedQuery = text.toLowerCase();
        const filteredData = connectionDetails.filter(item => {
            const matchIdConexion = item.id_conexion?.toString().includes(formattedQuery);
            const matchDireccion = item.direccion?.toLowerCase().includes(formattedQuery);
            const matchNombres = item.detallesCliente?.nombres?.toLowerCase().includes(formattedQuery);
            const matchIdCliente = item.detallesCliente?.id_cliente?.toString().includes(formattedQuery);

            return matchIdConexion || matchDireccion || matchNombres || matchIdCliente;
        });
        setFilteredConnectionDetails(filteredData);
    };





    return (
        <>
            <View style={styles.containerSuperior}>
                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
                </TouchableOpacity>
                {/* <Text style={styles.title}>Conexiones</Text> */}
                <ThemeSwitch />
            </View>
            <View style={styles.containerSuperior}>



                <Text style={styles.title}>Re-Conexiones</Text>

            </View>
            <View style={styles.containerSuperior}>
                <TextInput
                    style={styles.searchInput}
                    onChangeText={handleSearch}
                    value={searchQuery}
                    placeholder="Buscar por ID, dirección, nombre o ID de cliente"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    clearButtonMode="always"
                />
            </View>
            <View style={styles.containerSuperior}>
                <View style={styles.container}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <FlatList
                            data={statusOptions}
                            horizontal={true}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.statusButton,
                                        item.id === selectedStatusId ? styles.selectedStatusButton : {}
                                    ]}
                                    onPress={() => setSelectedStatusId(item.id)} // Actualiza el estado al presionar el botón
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
                        />

                    )}
                </View>
            </View>
            <View style={styles.container}>
                <FlatList
                    data={filteredConnectionDetails}
                    keyExtractor={(item) => item.id_conexion.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.itemContainer}
                            onPress={() => navigation.navigate('ConexionDetalles', { connectionId: item.id_conexion })}
                        >
                            <Text style={styles.itemName}>{item.direccion}</Text>
                            <Text style={styles.itemDetails}>ID conexión: {`${item.id_conexion}`}</Text>
                            {/* Check if `detallesCliente` is not null before accessing `nombres` */}
                            <Text style={styles.itemDetails}>
                                {item.detallesCliente ? `${item.detallesCliente.nombres}` : 'No disponible'}
                            </Text>
                            <Text style={styles.itemDetails}>ID cliente: {`${item.detallesCliente ? item.detallesCliente.id_cliente : 'No disponible'}`}</Text>
                            <Text style={styles.itemDetails}>Estado: {`${item.estadoConexion.estado}`}</Text>
                        </TouchableOpacity>
                    )}
                    onEndReached={() => {
                        if (!isLoading && hasMore) fetchConnectionDetails(currentPage + 1);
                        setCurrentPage(currentPage + 1);
                    }}
                    onEndReachedThreshold={0.5}
                    refreshing={isLoading}
                    onRefresh={() => {
                        setCurrentPage(1);
                        fetchConnectionDetails(1);
                    }}
                />

            </View>
        </>
    );
};

export default ConexionesActivas;
