import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Button,
    Alert,
    AppState,
    ScrollView,
} from 'react-native';
import { useTheme } from '../../../ThemeContext';
import ThemeSwitch from '../../componentes/themeSwitch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStyles } from './UsuariosScreenStyles';
import { Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';


const UsuariosScreen = ({ route, navigation }) => {
    const { ispId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [usuarios, setUsuarios] = useState([]);
    const [filteredUsuarios, setFilteredUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [telefono1, setTelefono1] = useState('');
    const [telefono2, setTelefono2] = useState('');
    const [email, setEmail] = useState('');
    const [rol, setRol] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [usuarioDisponible, setUsuarioDisponible] = useState(true);
    const [emailDisponible, setEmailDisponible] = useState(true);
    const appState = useRef(AppState.currentState);
    const inactivityTimeout = useRef(null);
    const [switchStates, setSwitchStates] = useState({}); // Estado para los Switch
    const [menuModalVisible, setMenuModalVisible] = useState(false); // Controla el modal del menú
    const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado
    const [nivelUsuario, setNivelUsuario] = useState('OPERADOR'); // Estado inicial para el Picker
    const validFilteredUsuarios = filteredUsuarios?.filter((item) => item && item.id);
    // Define el estado para debounceTimer
    const [debounceTimer, setDebounceTimer] = useState(null);

    console.log('ISP ID desde la pantalla usuariosssss: ', ispId);



    // Debounce para usuario
    // useEffect(() => {
    //     if (debounceTimer) {
    //         clearTimeout(debounceTimer); // Limpia el temporizador anterior
    //     }

    //     if (usuario) {
    //         const timer = setTimeout(() => verificarUsuarioDisponibilidad(usuario), 500); // Llama a la función después de 500ms
    //         setDebounceTimer(timer); // Guarda el nuevo temporizador
    //     }

    //     return () => {
    //         if (debounceTimer) {
    //             clearTimeout(debounceTimer); // Limpia el temporizador si el componente se desmonta
    //         }
    //     };
    // }, [usuario]);


    // Debounce para usuario
    useEffect(() => {
        clearTimeout(debounceTimer);
        if (usuario) {
            setDebounceTimer(setTimeout(() => verificarDisponibilidadUsuario(usuario), 500));
        }
    }, [usuario]);

    // Debounce para email
    useEffect(() => {
        clearTimeout(debounceTimer);
        if (email) {
            setDebounceTimer(setTimeout(() => verificarDisponibilidadEmail(email), 500));
        }
    }, [email]);



    useEffect(() => {
        
        fetchUsuarios();
    }, [ispId]);
    
    
    const fetchUsuarios = async () => {
        console.log('Obteniendo usuarios...');
        console.log('ISP ID desde la pantalla usuarios: ', ispId.id_isp);
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ispId }),
            });

            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

            const data = await response.json();
            setUsuarios(data);
            setFilteredUsuarios(data);

            // Inicializa el estado de los switches con el estado_usuario de los usuarios
            const estadosIniciales = data.reduce((acc, usuario) => {
                acc[usuario.id] = usuario.estado_usuario === 'ACTIVADO';
                return acc;
            }, {});
            setSwitchStates(estadosIniciales); // Inicializa switchStates con los datos obtenidos
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            setError('Error al comunicarse con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
            clearTimeout(inactivityTimeout.current);
        };
    }, []);

    useEffect(() => {
        const inicializarSwitchStates = () => {
            const estadosIniciales = usuarios.reduce((acc, usuario) => {
                acc[usuario.id] = usuario.activo; // Cambia "activo" según tu backend
                return acc;
            }, {});
            setSwitchStates(estadosIniciales);
        };

        if (usuarios.length > 0) {
            inicializarSwitchStates();
        }
    }, [usuarios]);

    useEffect(() => {
        console.log('Modal visible:', menuModalVisible);
        console.log('Usuario seleccionado:', selectedUser);
    }, [menuModalVisible, selectedUser]);

    useEffect(() => {
        fetchUsuarios();
    }, [ispId]);
    

    const handleAppStateChange = (nextAppState) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            resetInactivityTimeout();
        } else if (nextAppState.match(/inactive|background/)) {
            clearTimeout(inactivityTimeout.current);
        }
        appState.current = nextAppState;
    };

    const resetInactivityTimeout = () => {
        clearTimeout(inactivityTimeout.current);
        inactivityTimeout.current = setTimeout(setUsuarioOffline, 120000); // 2 minutos
    };

    const setUsuarioOffline = async () => {
        try {
            const loginData = await AsyncStorage.getItem('@loginData');
            const { userId } = JSON.parse(loginData);
            await fetch('https://wellnet-rd.com:444/api/usuarios/desconectar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            console.log('Usuario desconectado por inactividad');
        } catch (error) {
            console.error('Error al desconectar usuario por inactividad:', error);
        }
    };

    const handleAddUser = () => {
        setModalVisible(true);
    };

    const handleRegister = async () => {
        if (!usuario || !contrasena || !nombre || !email) {
            Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
            return;
        }
        if (!usuarioDisponible) {
            Alert.alert('Error', 'El nombre de usuario ya está en uso.');
            return;
        }
        if (!emailDisponible) {
            Alert.alert('Error', 'El correo electrónico ya está en uso.');
            return;
        }
    
        const newUser = {
            id_isp: ispId,
            usuario,
            contrasena,
            rol,
            nombre,
            apellido,
            telefono1,
            telefono2,
            email,
            nivel_usuario: nivelUsuario || 'OPERADOR',
            categoria: 'EMPLEADO',
        };
    
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/agregar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }
    
            const data = await response.json();
    
            // Llama a fetchUsuarios para refrescar la lista
            await fetchUsuarios(); 
    
            setModalVisible(false); // Cierra el modal
            Alert.alert('Éxito', 'Usuario registrado exitosamente.');
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            Alert.alert('Error', error.message || 'No se pudo registrar el usuario.');
        }
    };
    

    const handleCancel = () => {
        setModalVisible(false);
        fetchUsuarios(); // Refresca la lista al cerrar el modal
    };

    const handleSearch = (text) => {
        setSearchTerm(text);
        setFilteredUsuarios(
            usuarios.filter(
                (usuario) =>
                    usuario.usuario.toLowerCase().includes(text.toLowerCase()) ||
                    usuario.rol.toLowerCase().includes(text.toLowerCase())
            )
        );
    };

    // const [switchStates, setSwitchStates] = useState({}); // Estado para los Switch

    const toggleSwitch = (userId, isActive) => {
        // Actualiza el estado local del switch
        setSwitchStates((prevState) => ({
            ...prevState,
            [userId]: isActive,
        }));

        // Envía el nuevo estado al backend
        actualizarEstadoUsuario(userId, isActive ? 'ACTIVADO' : 'DESACTIVADO');
    };

    const actualizarEstadoUsuario = async (userId, nuevoEstado) => {
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/usuarios/actualizar-estado-usuario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, estadoUsuario: nuevoEstado }),
            });

            if (!response.ok) throw new Error('Error al actualizar el estado del usuario.');

            console.log(`Estado del usuario con ID ${userId} actualizado a ${nuevoEstado}`);
        } catch (error) {
            console.error('Error al actualizar el estado del usuario:', error);
        }
    };



    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.usuarioItem,
                isDarkMode ? styles.usuarioItemDark : styles.usuarioItemLight,
            ]}
            onPress={() => navigation.navigate('UsuarioDetalleScreen', { userId: item.id })}
            onLongPress={() => {
                setSelectedUser(item); // Establece el usuario seleccionado
                setMenuModalVisible(true); // Muestra el modal
            }}
            delayLongPress={1000} // Ajusta el tiempo de espera a 1 segundo
        >
            <View style={styles.usuarioInfo}>
                <View
                    style={[
                        styles.statusIndicator,
                        item.is_online ? styles.online : styles.offline,
                    ]}
                />
                <Text
                    style={[
                        styles.usuarioText,
                        isDarkMode ? styles.usuarioTextDark : styles.usuarioTextLight,
                    ]}
                >
                    {item.nombre}
                </Text>
            </View>
            <Switch
                value={switchStates[item.id] || false}
                onValueChange={(value) => toggleSwitch(item.id, value)}
            />
        </TouchableOpacity>
    );




    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/usuarios/eliminar-usuario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) throw new Error('Error al eliminar el usuario.');

            Alert.alert('Éxito', 'Usuario eliminado correctamente.');
            // Filtra el usuario eliminado de la lista local
            setUsuarios((prevUsuarios) => prevUsuarios.filter((user) => user.id !== userId));
            setFilteredUsuarios((prevFiltered) => prevFiltered.filter((user) => user.id !== userId));
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            Alert.alert('Error', 'No se pudo eliminar el usuario.');
        }
    };

    const handleNivelChange = async (newNivel) => {
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/usuarios/actualizar-nivel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser?.id, nivel_usuario: newNivel }),
            });

            if (!response.ok) throw new Error('Error al actualizar el nivel de usuario.');

            Alert.alert('Éxito', `Nivel actualizado a ${newNivel}`);
            // Actualiza localmente el usuario seleccionado
            setSelectedUser((prev) => ({ ...prev, nivel_usuario: newNivel }));
            // También actualiza la lista de usuarios para reflejar el cambio
            setUsuarios((prev) =>
                prev.map((user) =>
                    user.id === selectedUser?.id ? { ...user, nivel_usuario: newNivel } : user
                )
            );
        } catch (error) {
            console.error('Error al actualizar el nivel de usuario:', error);
            Alert.alert('Error', 'No se pudo actualizar el nivel de usuario.');
        }
    };


    // Validar disponibilidad de usuario en tiempo real
    const verificarDisponibilidadUsuario = async (usuario) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/verificar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario }),
            });
            const data = await response.json();
            setUsuarioDisponible(data.disponible); // Aquí se actualiza el estado de si el usuario está disponible
        } catch (error) {
            console.error('Error al verificar usuario:', error);
        }
    };


    // Validar disponibilidad de email en tiempo real
    const verificarDisponibilidadEmail = async (email) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/verificar-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            setEmailDisponible(data.disponible); // Aquí se actualiza el estado de si el correo está disponible
        } catch (error) {
            console.error('Error al verificar email:', error);
        }
    };



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Usuarios</Text>
                <ThemeSwitch />
            </View>
            {/* <TextInput
                style={styles.searchInput}
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChangeText={handleSearch}
            /> */}
            <Text></Text>
            {loading ? (
                <Text style={styles.loadingText}>Cargando...</Text>
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <FlatList
                    data={validFilteredUsuarios}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                />

            )}
            <TouchableOpacity style={styles.fab} onPress={handleAddUser}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>



            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancel} // Cierra el modal al presionar fuera
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.menuModal, isDarkMode ? styles.menuModalDark : styles.menuModalLight]}>
                        {/* Botón de Cerrar (X) */}
                        <TouchableOpacity
                            style={[styles.closeButton, isDarkMode ? styles.closeButtonDark : styles.closeButtonLight]}
                            onPress={handleCancel}
                        >
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>

                        {/* Título del Modal */}
                        <Text style={[styles.menuTitle, isDarkMode ? styles.menuTitleDark : styles.menuTitleLight]}>
                            Agregar Usuario
                        </Text>

                        {/* Contenido del Modal */}
                        <ScrollView style={styles.modalContent}>
                            {/* // Campo Usuario */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Usuario"
                                    placeholderTextColor={isDarkMode ? '#CCC' : '#555'}
                                    value={usuario}
                                    onChangeText={(text) => setUsuario(text)}
                                />
                                {usuario.length >= 3 && (
                                    <Text
                                        style={{
                                            color: usuarioDisponible ? 'green' : 'red',
                                            fontSize: 12,
                                            marginTop: 5,
                                        }}
                                    >
                                        {usuarioDisponible ? 'Usuario disponible' : 'Usuario ya está en uso'}
                                    </Text>
                                )}
                            </View>

                            {/* Campo Contraseña */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contraseña"
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor={isDarkMode ? '#CCC' : '#555'}
                                    value={contrasena}
                                    onChangeText={(text) => setContrasena(text)}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIconContainer}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Campo Email */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor={isDarkMode ? '#CCC' : '#555'}
                                    value={email}
                                    onChangeText={(text) => setEmail(text)}
                                />
                                {email.length >= 5 && (
                                    <Text
                                        style={{
                                            color: emailDisponible ? 'green' : 'red',
                                            fontSize: 12,
                                            marginTop: 5,
                                        }}
                                    >
                                        {emailDisponible ? 'Email disponible' : 'Email ya está en uso'}
                                    </Text>
                                )}
                            </View>
                            {/* Otros Campos */}
                            {[
                                { placeholder: 'Nombre', value: nombre, onChangeText: setNombre },
                                { placeholder: 'Apellido', value: apellido, onChangeText: setApellido },
                                { placeholder: 'Teléfono 1', value: telefono1, onChangeText: setTelefono1 },
                                { placeholder: 'Teléfono 2 (Opcional)', value: telefono2, onChangeText: setTelefono2 },
                                // { placeholder: 'Email', value: email, onChangeText: setEmail },
                                { placeholder: 'Rol', value: rol, onChangeText: setRol },
                            ].map((field, index) => (
                                <View style={styles.inputContainer} key={index}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={field.placeholder}
                                        placeholderTextColor={isDarkMode ? '#CCC' : '#555'}
                                        value={field.value}
                                        onChangeText={(text) => field.onChangeText(text)}
                                    />
                                </View>
                            ))}
                            {!emailDisponible && (
                                <Text style={styles.errorText}>El correo electrónico ya está en uso.</Text>
                            )}

                            {/* Picker para Nivel de Usuario */}
                            <View style={styles.pickerContainer}>
                                <Text style={[styles.pickerLabel, isDarkMode ? styles.pickerLabelDark : styles.pickerLabelLight]}>
                                    Nivel de Usuario:
                                </Text>
                                <Picker
                                    selectedValue={nivelUsuario}
                                    onValueChange={(itemValue) => setNivelUsuario(itemValue)}
                                    style={[styles.picker, isDarkMode ? styles.pickerDark : styles.pickerLight]}
                                >
                                    <Picker.Item label="Cliente" value="CLIENTE" />
                                    <Picker.Item label="Operador" value="OPERADOR" />
                                    <Picker.Item label="Administrador" value="ADMINISTRADOR" />
                                </Picker>
                            </View>

                            {/* Botones de Acción */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.actionButton, isDarkMode ? styles.registerButtonDark : styles.registerButtonLight]}
                                    onPress={() =>
                                        Alert.alert(
                                            'Confirmación', // Título
                                            '¿Estás seguro de que deseas registrar este usuario?', // Mensaje
                                            [
                                                { text: 'Cancelar', style: 'cancel' }, // Botón de Cancelar
                                                { text: 'Confirmar', onPress: handleRegister }, // Botón de Confirmar
                                            ],
                                            { cancelable: true } // Permitir cerrar tocando fuera del cuadro
                                        )
                                    }
                                >
                                    <Text style={styles.buttonText}>Registrar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, isDarkMode ? styles.cancelButtonDark : styles.cancelButtonLight]}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>
                    </View>
                </View>
            </Modal>







            <Modal
                animationType="fade"
                transparent={true}
                visible={menuModalVisible}
                onRequestClose={() => setMenuModalVisible(false)} // Cierra el modal al presionar fuera
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.menuModal, isDarkMode ? styles.menuModalDark : styles.menuModalLight]}>
                        {/* Botón de Cerrar (X) */}
                        <TouchableOpacity
                            style={[styles.closeButton, isDarkMode ? styles.closeButtonDark : styles.closeButtonLight]}
                            onPress={() => setMenuModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>

                        {/* Título del Modal */}
                        <Text style={[styles.menuTitle, isDarkMode ? styles.menuTitleDark : styles.menuTitleLight]}>
                            Opciones para {selectedUser?.nombre}
                        </Text>

                        {/* Detalles del Usuario */}
                        <View style={styles.userDetailsContainer}>
                            <Text style={[styles.userDetailText, isDarkMode ? styles.userDetailTextDark : styles.userDetailTextLight]}>
                                ID: {selectedUser?.id}
                            </Text>
                            <Text style={[styles.userDetailText, isDarkMode ? styles.userDetailTextDark : styles.userDetailTextLight]}>
                                Usuario: {selectedUser?.usuario}
                            </Text>
                            <Text style={[styles.userDetailText, isDarkMode ? styles.userDetailTextDark : styles.userDetailTextLight]}>
                                Rol: {selectedUser?.rol}
                            </Text>
                            <Text style={[styles.userDetailText, isDarkMode ? styles.userDetailTextDark : styles.userDetailTextLight]}>
                                Email: {selectedUser?.email}
                            </Text>
                            <Text style={[styles.userDetailText, isDarkMode ? styles.userDetailTextDark : styles.userDetailTextLight]}>
                                Teléfono 1: {selectedUser?.telefono1}
                            </Text>
                            {selectedUser?.telefono2 ? (
                                <Text style={[styles.userDetailText, isDarkMode ? styles.userDetailTextDark : styles.userDetailTextLight]}>
                                    Teléfono 2: {selectedUser?.telefono2}
                                </Text>
                            ) : null}
                            <Text style={[styles.userDetailText, isDarkMode ? styles.userDetailTextDark : styles.userDetailTextLight]}>
                                Estado: {selectedUser?.estado_usuario === 'ACTIVADO' ? 'Activo' : 'Inactivo'}
                            </Text>
                            <Text style={[styles.userDetailText, isDarkMode ? styles.userDetailTextDark : styles.userDetailTextLight]}>
                                Conectado: {selectedUser?.is_online ? 'Sí' : 'No'}
                            </Text>
                        </View>

                        {/* Campo Desplegable para Nivel */}
                        <View style={styles.pickerContainer}>
                            <Text style={[styles.pickerLabel, isDarkMode ? styles.pickerLabelDark : styles.pickerLabelLight]}>
                                Nivel:
                            </Text>
                            <Picker
                                selectedValue={selectedUser?.nivel_usuario || 'OPERADOR'} // Valor inicial
                                onValueChange={(value) => handleNivelChange(value)} // Maneja el cambio de valor
                                style={[styles.picker, isDarkMode ? styles.pickerDark : styles.pickerLight]}
                            >
                                <Picker.Item label="Cliente" value="CLIENTE" />
                                <Picker.Item label="Operador" value="OPERADOR" />
                                <Picker.Item label="Administrador" value="ADMINISTRADOR" />
                            </Picker>
                        </View>

                        {/* Botones de Acción */}
                        <Button
                            title="Eliminar Usuario"
                            color={isDarkMode ? '#FF6F61' : '#FF0000'} // Cambia el color del botón en modo oscuro
                            onPress={() => {
                                Alert.alert(
                                    'Confirmación',
                                    `¿Estás seguro de que deseas eliminar al usuario ${selectedUser?.nombre}?`,
                                    [
                                        {
                                            text: 'Cancelar',
                                            style: 'cancel',
                                        },
                                        {
                                            text: 'Eliminar',
                                            onPress: () => {
                                                setMenuModalVisible(false);
                                                handleDeleteUser(selectedUser?.id); // Llama a la función para eliminar el usuario
                                            },
                                            style: 'destructive', // Hace que el botón tenga un estilo de advertencia (solo en iOS)
                                        },
                                    ],
                                    { cancelable: true } // Permite cerrar el diálogo al tocar fuera
                                );
                            }}
                        />

                    </View>
                </View>
            </Modal>

        </View>
    );




};

export default UsuariosScreen;
