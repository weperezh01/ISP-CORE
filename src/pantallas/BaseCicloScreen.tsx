import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Alert, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MenuModal from '../componentes/MenuModal';
import styles from './BaseCicloScreenStyle';
import HorizontalMenu from '../componentes/HorizontalMenu';

const BaseCicloScreen = () => {
    const botones = [
        { id: '4', screen: null, action: () => setMenuVisible(true), icon: 'bars' },
        // { id: '6', action: () => setMenuVisible(true), icon: 'bars' },
        { id: '5', screen: 'BusquedaScreen', icon: 'search' },
        { id: '1', icon: 'plus', action: () => openAddModal() }, // Botón para abrir el modal de agregar
        { id: '2', title: 'Revisiones', screen: 'FacturasEnRevisionScreen', params: { estado: 'en_revision' } },
        { id: '3', title: 'Ingresos', screen: 'IngresosScreen' },
        {
            id: '7',
            screen: null, // Dejarlo en null si solo realiza una acción
            icon: isDarkMode ? 'sun-o' : 'moon-o', // Cambiar entre 'sun-o' y 'moon-o' basado en isDarkMode
            action: () => {
              toggleTheme(); // Lógica para cambiar el modo oscuro (debes tener esta función definida)
            },
          },
    ];



    // const botones = [
    //     { id: '5', screen: 'BusquedaScreen', icon: 'search' }, // Botón de búsqueda
    //     { id: '1', title: 'Base de ciclos', screen: 'BaseCicloScreen' },
    //     { id: '2', title: 'Revisiones', screen: 'FacturasEnRevisionScreen', params: { estado: 'en_revision' } },
    //     { id: '3', title: 'Ingresos', screen: 'IngresosScreen', icon: 'dollar' }, // Ejemplo de otro icono
    //   ];






    const navigation = useNavigation();
    const [ciclosBase, setCiclosBase] = useState([]);
    const [usuarioId, setUsuarioId] = useState(null);
    const [ispId, setIspId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [cicloEditando, setCicloEditando] = useState(null);
    const [diaMes, setDiaMes] = useState('');
    const [detalle, setDetalle] = useState('');
    const [diasGracia, setDiasGracia] = useState('0');


    const toggleTheme = async () => {
        try {
            const newTheme = isDarkMode ? 'light' : 'dark';
            await AsyncStorage.setItem('@theme', newTheme); // Guarda el nuevo tema
            setIsDarkMode(!isDarkMode); // Actualiza el estado
        } catch (error) {
            console.error('Error al cambiar el tema:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('@loginData');
            navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
            Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente.');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert('Error', 'No se pudo cerrar sesión.');
        }
    };



    // Cargar el tema desde AsyncStorage al montar el componente
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const theme = await AsyncStorage.getItem('@theme');
                setIsDarkMode(theme === 'dark');
            } catch (error) {
                console.error('Error al cargar el tema', error);
            }
        };
        loadTheme();
    }, []);    

    // Refrescar el tema cada vez que el menú se abre o cierra, o cuando cambie refreshFlag
    useEffect(() => {
        const refreshTheme = async () => {
            try {
                const theme = await AsyncStorage.getItem('@theme');
                setIsDarkMode(theme === 'dark');
            } catch (error) {
                console.error('Error al cargar el tema', error);
            }
        };
        refreshTheme();
    }, [menuVisible, refreshFlag]);

    useEffect(() => {
        const obtenerDatosUsuarioYFetchCiclos = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
                const ispIdStorage = await AsyncStorage.getItem('@selectedIspId');

                if (userData && ispIdStorage) {
                    setUsuarioId(userData.id);
                    setIspId(ispIdStorage);
                    await fetchCiclosBase(ispIdStorage);
                } else {
                    console.error('Error: No se encontraron datos de usuario o ISP');
                    Alert.alert('Error', 'No se encontraron datos de usuario o ISP. Asegúrese de haber iniciado sesión correctamente.');
                }
            } catch (e) {
                console.error('Error al leer los datos del usuario o ISP', e);
                Alert.alert('Error', 'No se pudo cargar los datos de usuario o ISP');
            } finally {
                setLoading(false);
            }
        };

        obtenerDatosUsuarioYFetchCiclos();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (usuarioId && ispId) {
                registrarNavegacion();
            } else {
                console.error('No se puede registrar la navegación. Datos faltantes: usuarioId o ispId.');
            }
        }, [usuarioId, ispId])
    );

    const fetchCiclosBase = async (ispId) => {
        if (!ispId) {
            Alert.alert('Error', 'ID de ISP no disponible.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/ciclos-base/por-isp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ispId: ispId })
            });

            if (!response.ok) {
                throw new Error('Error al obtener la lista de ciclos base');
            }

            const data = await response.json();
            setCiclosBase(data || []);
        } catch (error) {
            console.error('Error al cargar la lista de ciclos base:', error);
            Alert.alert('Error', 'No se pudo cargar la lista de ciclos base.');
        } finally {
            setLoading(false);
        }
    };

    const registrarNavegacion = async () => {
        if (!usuarioId) {
            console.error('No se puede registrar la navegación: usuarioId es nulo.');
            return;
        }

        try {
            const fechaActual = new Date();
            const fecha = fechaActual.toISOString().split('T')[0];
            const hora = fechaActual.toTimeString().split(' ')[0];

            const logData = {
                id_usuario: usuarioId,
                fecha,
                hora,
                pantalla: 'CiclosBaseExpoScreen',
            };

            const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData),
            });

            if (!response.ok) {
                throw new Error('Error al registrar la navegación');
            }
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    const guardarCiclo = async () => {
        const diaMesNum = parseInt(diaMes);
        const diasGraciaNum = parseInt(diasGracia);
        if (!diaMes || !detalle || isNaN(diaMesNum) || diaMesNum < 1 || diaMesNum > 27 || isNaN(diasGraciaNum)) {
            Alert.alert("Error", "Todos los campos son obligatorios y deben ser válidos. El día del mes debe estar entre 1 y 27.");
            return;
        }

        try {
            const method = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion
                ? `https://wellnet-rd.com:444/api/ciclos-base/actualizar/${cicloEditando.id_ciclo_base}`
                : 'https://wellnet-rd.com:444/api/ciclos-base/agregar';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dia_mes: diaMesNum,
                    detalle: detalle,
                    id_usuario: usuarioId,
                    id_isp: parseInt(ispId, 10),
                    dias_gracia: diasGraciaNum,
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                Alert.alert("Éxito", modoEdicion ? "Ciclo actualizado correctamente." : "Ciclo creado correctamente.");
                setModalVisible(false);
                setRefreshFlag((prev) => !prev); // Refrescar la lista de ciclos
                await fetchCiclosBase(ispId);
            } else {
                Alert.alert("Error", responseData.message || "No se pudo procesar el ciclo.");
            }
        } catch (error) {
            console.error('Error al procesar el ciclo:', error);
            Alert.alert("Error", "Error al conectar con el servidor.");
        }
    };

    const handleEditCicloBase = useCallback((ciclo) => {
        if (ciclo) {
            setModoEdicion(true);
            setCicloEditando(ciclo);
            setDiaMes(ciclo.dia_mes?.toString() || ''); // Asegurar que no haya undefined
            setDetalle(ciclo.detalle || ''); // Asegurar que no haya undefined
            setDiasGracia(ciclo.dias_gracia?.toString() || '0'); // Asegurar que no haya undefined
            setModalVisible(true);
        }
    }, []);

    const openAddModal = () => {
        setModoEdicion(false);
        setCicloEditando(null);
        setDiaMes('');
        setDetalle('');
        setDiasGracia('0');
        setModalVisible(true);
    };

    const renderItem = useCallback(({ item }) => (
        <TouchableOpacity
            style={[styles.itemContainer, isDarkMode ? styles.darkItemContainer : styles.lightItemContainer]}
            onPress={() => handleEditCicloBase(item)}
        >
            <Text style={[styles.itemName, isDarkMode ? styles.darkText : styles.lightText]}>Día del Mes: {item.dia_mes}</Text>
            <Text style={[styles.itemDetails, isDarkMode ? styles.darkText : styles.lightText]}>Detalle: {item.detalle}</Text>
            <Text style={[styles.itemDetails, isDarkMode ? styles.darkText : styles.lightText]}>Fecha Creación: {item.fecha_creacion}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.editButton, isDarkMode ? styles.darkEditButton : styles.lightEditButton]} onPress={() => handleEditCicloBase(item)}>
                    <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deleteButton, isDarkMode ? styles.darkDeleteButton : styles.lightDeleteButton]} onPress={() => handleDeleteCicloBase(item.id_ciclo_base)}>
                    <Text style={styles.buttonText}>Borrar</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    ), [isDarkMode]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#BB86FC" />
            </View>
        );
    }

    return (
        <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
            {/* Ciclos de base */}
            <FlatList
                data={ciclosBase}
                keyExtractor={(item) => item.id_ciclo_base.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={[styles.emptyMessage, isDarkMode ? styles.darkText : styles.lightText]}>
                        No hay ciclos base disponibles.
                    </Text>
                }
            />

            {/* Menú Horizontal Reutilizable */}
            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />

            {/* Modal para crear o editar un ciclo base */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, isDarkMode ? styles.darkModalContainer : styles.lightModalContainer]}>
                        <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>
                            {modoEdicion ? 'Editar Ciclo de Facturación' : 'Nuevo Ciclo de Facturación'}
                        </Text>

                        <TextInput
                            style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                            placeholder="Día del mes (1-27)"
                            placeholderTextColor={isDarkMode ? '#888' : '#666'}
                            value={diaMes}
                            onChangeText={(text) => setDiaMes(text.replace(/[^0-9]/g, ''))}
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                            placeholder="Detalle del ciclo"
                            placeholderTextColor={isDarkMode ? '#888' : '#666'}
                            value={detalle}
                            onChangeText={setDetalle}
                            multiline
                        />

                        <TextInput
                            style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
                            placeholder="Días de gracia"
                            placeholderTextColor={isDarkMode ? '#888' : '#666'}
                            value={diasGracia}
                            onChangeText={(text) => setDiasGracia(text.replace(/[^0-9]/g, ''))}
                            keyboardType="numeric"
                        />

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={guardarCiclo}>
                                <Text style={styles.buttonText}>{modoEdicion ? 'Actualizar' : 'Guardar'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal del Menú */}
            <MenuModal
                visible={menuVisible}
                onClose={() => {
                    setMenuVisible(false);
                    setRefreshFlag((prevFlag) => !prevFlag);
                }}
                menuItems={[
                    { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
                    { title: 'Perfil', action: () => navigation.navigate('ProfileScreen') },
                    { title: 'Configuración', action: () => navigation.navigate('SettingsScreen') },
                    { title: 'Cerrar Sesión', action: handleLogout },
                ]}
                isDarkMode={isDarkMode}
                onItemPress={(item) => {
                    item.action();
                    setMenuVisible(false);
                    setRefreshFlag((prevFlag) => !prevFlag);
                }}
            />
        </View>
    );
};

export default BaseCicloScreen;
