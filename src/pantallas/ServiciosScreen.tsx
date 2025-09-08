import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, Modal, StyleSheet, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../ThemeContext';
import { getStyles } from '../estilos/styles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ThemeSwitch from '../componentes/themeSwitch';
import { format } from 'date-fns';
import HorizontalMenu from '../componentes/HorizontalMenu';
import MenuModal from '../componentes/MenuModal';

const ServiciosScreen = ({ route, navigation }) => {
    const { ispId } = route.params;
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [serviciosList, setServiciosList] = useState([]);
    const [usuarioId, setUsuarioId] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // Estado para controlar el modal
    const [precioReconexion, setPrecioReconexion] = useState(''); // Estado para el precio de reconexión

    console.log('ID de ISP recibido en ServiciosScreen:', ispId.id_isp);

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
                if (userData) {
                    setNombreUsuario(userData.nombre);
                    setUsuarioId(userData.id);
                }
            } catch (e) {
                console.error('Error al leer el nombre del usuario', e);
            }
        };

        obtenerDatosUsuario();
    }, []);

    const fetchServiciosList = async () => {
        if (!usuarioId) {
            Alert.alert('Error', 'ID de usuario no disponible.');
            return;
        }

        console.log('ID de usuario enviado al servidor: ' + usuarioId);
        console.log('ID de ISP enviado al servidor: ' + ispId);

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/lista-servicios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuarioId: usuarioId, isp_id: ispId }),
            });

            if (!response.ok) {
                throw new Error('Error al obtener datos de servicios');
            }

            const data = await response.json();

            if (data && Array.isArray(data.servicios)) {
                setServiciosList(data.servicios);

                // Establecer el precio de reconexión desde la API
                if (data.reconexion_precio !== undefined) {
                    setPrecioReconexion(data.reconexion_precio.toString());
                }
            } else {
                throw new Error('Formato de datos incorrecto');
            }
        } catch (error) {
            console.error('Error al cargar la lista de servicios:', error);
            Alert.alert('Error', 'No se pudo cargar la lista de servicios.');
        }
    };

    const registrarNavegacion = async () => {
        const fechaActual = new Date();
        const fecha = format(fechaActual, 'yyyy-MM-dd');
        const hora = format(fechaActual, 'HH:mm:ss');
        const pantalla = 'ServiciosScreen';

        const datos = JSON.stringify({
            usuarioId,
            serviciosList
        });

        const navigationLogData = {
            id_usuario: usuarioId,
            fecha,
            hora,
            pantalla,
            datos
        };

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(navigationLogData),
            });

            if (!response.ok) {
                throw new Error('Error al registrar la navegación.');
            }

            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (usuarioId) {
                fetchServiciosList();
                registrarNavegacion();
            }
            return () => { };
        }, [usuarioId])
    );

    const handleAddService = () => {
        console.log('Agregar nuevo servicio');
        navigation.navigate('AddServiceScreen', { ispId: ispId.id_isp, isEditMode: false, id_usuario: usuarioId });
    };

    const handleEditService = (serviceId) => {
        navigation.navigate('AddServiceScreen', { serviceId: serviceId, isEditMode: true, id_usuario: usuarioId });
    };

    const handleDeleteService = (serviceId) => {
        Alert.alert(
            "Eliminar Servicio",
            "¿Estás seguro de que quieres eliminar este servicio?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            const response = await fetch('https://wellnet-rd.com:444/api/eliminar-servicio', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ id_servicio: serviceId }),
                            });

                            const result = await response.json();
                            if (response.ok) {
                                Alert.alert('Servicio eliminado', 'El servicio se ha eliminado correctamente.');
                                setServiciosList(currentList => currentList.filter(item => item.id_servicio !== serviceId));
                            } else {
                                Alert.alert('Error', result.error || 'No se pudo eliminar el servicio.');
                            }
                        } catch (error) {
                            console.error('Error al eliminar el servicio:', error);
                            Alert.alert('Error', 'No se pudo comunicar con el servidor.');
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.itemContainer}>
                <Text style={styles.itemName}>{item.nombre_servicio}</Text>
                <Text style={styles.itemDetails}>Descripción: {item.descripcion_servicio || 'No disponible'}</Text>
                <Text style={styles.itemDetails}>Precio: {formatCurrency(item.precio_servicio)}</Text>
                <Text style={styles.itemDetails}>Velocidad: {item.velocidad_servicio} Mbps</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEditService(item.id_servicio)}>
                        <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteService(item.id_servicio)}>
                        <Text style={styles.buttonText}>Borrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const handleOpenModal = () => {
        setModalVisible(true);
    };
    
    const handleAcceptModal = async () => {
        try {
            // Verificar que el precio de reconexión no esté vacío
            if (!precioReconexion) {
                Alert.alert('Error', 'Por favor, ingrese un precio válido.');
                return;
            }
    
            // Crear el cuerpo de la solicitud
            const requestBody = {
                id_isp: ispId.id_isp,
                id_usuario: usuarioId,
                precio_reconexion: parseFloat(precioReconexion), // Convertir a número
            };
    
            // Realizar la solicitud al backend
            const response = await fetch('https://wellnet-rd.com:444/api/precio-reconexion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
    
            // Verificar si la solicitud fue exitosa
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar los datos.');
            }
    
            // Si se envió correctamente
            const result = await response.json();
            Alert.alert('Éxito', result.message || 'Precio de reconexión actualizado correctamente.');
    
            // Cerrar el modal
            setModalVisible(false);
        } catch (error) {
            console.error('Error al enviar el precio de reconexión:', error);
            Alert.alert('Error', 'No se pudo actualizar el precio de reconexión. Intente de nuevo.');
        }
    };
    

    const handleCancelModal = () => {
        setModalVisible(false);
    };

    const renderItemReconexion = ({ item }) => {
        return (
            <View style={styles.itemContainer}>
                <Text style={styles.itemName}>{item.nombre_servicio}</Text>
                <Text style={styles.itemDetails}>Descripción: {item.descripcion_servicio || 'No disponible'}</Text>
                <Text style={styles.itemDetails}>Precio: RD$ {item.precio_servicio}</Text>
            </View>
        );
    };

    const botones = [
        // {
        //     id: '6',
        //     title: 'Buscar',
        //     screen: 'ClientListScreen',
        //     icon: 'search',
        //     action: () => setSearchVisible((prev) => !prev) // Alternar visibilidad
        // },
        // { id: '6', action: () => setMenuVisible(true), icon: 'bars' },
        // { id: '8', title: 'Filtrar', screen: 'ClientListScreen', icon: 'filter', action: toggleModal },
        { id: '5', title: 'Agregar Servicio', screen: 'AddServiceScreen', params: { ispId, isEditMode: false, id_usuario: usuarioId }, icon: 'plus' },
        // { id: '3', title: 'Precio Reconexion', screen: 'AddServiceScreen', params: { ispId: ispId.id_isp, isEditMode: false, id_usuario: usuarioId }, icon: 'plug' },
        // { id: '7', title: 'Tipos de conexión', screen: 'TiposDeConexionScreen', icon: 'plug' },

        {
            id: '3',
            title: 'Precio Reconexión',
            action: handleOpenModal,
            icon: 'plug',
        },

        // { id: '1', title: 'Clientes', screen: 'ClientListScreen', icon: 'users' },
        // { id: '2', title: 'Facturas para mi', screen: 'FacturasParaMiScreen', icon: 'file-text' },
        // { id: '3', title: 'Reportes', screen: 'IngresosScreen', icon: 'bar-chart' },
        {
            id: '4',
            title: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
            icon: isDarkMode ? 'sun-o' : 'moon-o',
            action: toggleTheme,
        },
    ];

    return (
        <>
            <View style={styles.containerSuperior}>
                {/* <TouchableOpacity style={styles.buttonText} onPress={() => { }}>
                    <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
                </TouchableOpacity> */}

                <Text style={styles.title}>Servicios</Text>

            </View>
            <View style={styles.container}>
                <FlatList
                    data={serviciosList}
                    keyExtractor={item => item.id_servicio.toString()}
                    renderItem={renderItem}
                />
            </View>

            {/* Modal del Menú */}
            <MenuModal
                visible={menuVisible}
                onClose={() => {
                    setMenuVisible(false);
                    // Refrescar el estado del tema cuando se cierra el modal
                    const refreshTheme = async () => {
                        try {
                            const theme = await AsyncStorage.getItem('@theme');
                            setIsDarkMode(theme === 'dark');
                        } catch (error) {
                            console.error('Error al cargar el tema', error);
                        }
                    };
                    refreshTheme();
                }}

                menuItems={[
                    { title: nombreUsuario, action: () => navigation.navigate('UsuarioDetalleScreen', { ispId: id_isp, userId: usuarioId }) },
                    { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
                    { title: 'Perfil', action: () => navigation.navigate('ProfileScreen') },
                    { title: 'Configuración', action: () => navigation.navigate('SettingsScreen') },
                    { title: 'Cerrar Sesión', action: () => console.log('Cerrando sesión') },
                ]}
                isDarkMode={isDarkMode}
                onItemPress={(item) => {
                    item.action();
                    setMenuVisible(false);
                }}
            />


            {/* Modal para Precio de Reconexion */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={handleCancelModal}
            >
                <View style={[modalStyles.modalContainer, isDarkMode && modalStyles.darkModal]}>
                    <View style={[modalStyles.modalContent, isDarkMode && modalStyles.darkContent]}>
                        <Text style={[modalStyles.modalTitle, isDarkMode && modalStyles.darkText]}>
                            Ingresar Precio de Reconexion
                        </Text>
                        <TextInput
                            style={[modalStyles.input, isDarkMode && modalStyles.darkInput]}
                            keyboardType="numeric"
                            placeholder="RD$ 0.00"
                            placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                            value={precioReconexion}
                            onChangeText={setPrecioReconexion}
                        />
                        <View style={modalStyles.buttonContainer}>
                            <TouchableOpacity
                                style={[modalStyles.button, modalStyles.cancelButton]}
                                onPress={handleCancelModal}
                            >
                                <Text style={modalStyles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[modalStyles.button, modalStyles.acceptButton]}
                                onPress={handleAcceptModal}
                            >
                                <Text style={modalStyles.buttonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />
        </>
    );
};


const modalStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#000',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#f5f5f5',
        color: '#000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#d9534f',
    },
    acceptButton: {
        backgroundColor: '#5cb85c',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    darkModal: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    darkContent: {
        backgroundColor: '#1e1e1e',
    },
    darkText: {
        color: '#fff',
    },
    darkInput: {
        backgroundColor: '#333',
        borderColor: '#555',
        color: '#fff',
    },
});

export default ServiciosScreen;
