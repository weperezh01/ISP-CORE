import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
    Animated,
    Pressable,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ThemeSwitch from '../../componentes/themeSwitch';
import MenuModal from '../../componentes/MenuModal';
import HorizontalMenu from '../../componentes/HorizontalMenu';
import { getIspListStyles, getModalStyles } from '../ispScreenStyle';


/* ======================================
   COMPONENTE PRINCIPAL: IspListScreen
   ====================================== */
const IspListScreen = ({ navigation }) => {
    // Uso del ThemeContext para darkMode
    const { isDarkMode, toggleTheme } = useTheme();

    // Estilos de la pantalla
    const styles = getIspListStyles(isDarkMode);
    // Estilos del modal
    const modalStyles = getModalStyles(isDarkMode);

    // Estados
    const [ispList, setIspList] = useState([]);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [usuarioId, setUsuarioId] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Modal y datos del ISP seleccionado
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIsp, setSelectedIsp] = useState(null);

    // Campos de edición
    const [nombreEdit, setNombreEdit] = useState('');
    const [direccionEdit, setDireccionEdit] = useState('');
    const [telefonoEdit, setTelefonoEdit] = useState('');
    const [emailEdit, setEmailEdit] = useState('');
    const [paginaWebEdit, setPaginaWebEdit] = useState('');

    // Estados para focus de inputs
    const [focusedInput, setFocusedInput] = useState(null);

    // Estados para animación de header
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerHeight = useRef(new Animated.Value(1)).current;
    const lastScrollY = useRef(0);
    const scrollDirection = useRef('down');

    /* ======================================================
       FUNCIÓN PARA MANEJAR EL SCROLL Y ANIMACIÓN DEL HEADER
       ====================================================== */
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;
                
                // Determinar dirección del scroll
                if (Math.abs(diff) > 5) { // Threshold para evitar micro-movimientos
                    if (diff > 0 && currentScrollY > 50) {
                        // Scroll hacia arriba - ocultar header
                        if (scrollDirection.current !== 'up') {
                            scrollDirection.current = 'up';
                            Animated.timing(headerHeight, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: false,
                            }).start();
                        }
                    } else if (diff < 0 || currentScrollY <= 50) {
                        // Scroll hacia abajo o cerca del top - mostrar header
                        if (scrollDirection.current !== 'down') {
                            scrollDirection.current = 'down';
                            Animated.timing(headerHeight, {
                                toValue: 1,
                                duration: 300,
                                useNativeDriver: false,
                            }).start();
                        }
                    }
                    lastScrollY.current = currentScrollY;
                }
            }
        }
    );

    /* ======================================================
       FUNCIÓN PARA MANEJAR EL CIERRE DE SESIÓN
       ====================================================== */
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

    /* ======================================================
       1. OBTENER DATOS USUARIO (AsyncStorage) AL MONTAR
       ====================================================== */
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

    /* ======================================================
       2. FETCH LISTA DE ISPs DESDE BACKEND
       ====================================================== */
    const fetchIspList = async () => {
        if (!usuarioId) {
            Alert.alert('Error', 'ID de usuario no disponible.');
            return;
        }

        setIsLoading(true);
        try {
            console.log('🔍 [ISP-LIST] Cargando lista de ISPs...');
            console.log('  👤 Usuario ID:', usuarioId);
            
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/super-admin-usuario-isp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: usuarioId }),
            });

            console.log('📊 [ISP-LIST] Response status:', response.status);
            
            const responseText = await response.text();
            console.log('📋 [ISP-LIST] Response text:', responseText);

            if (!response.ok) {
                console.error('❌ [ISP-LIST] Error response:', responseText);
                throw new Error(`Error ${response.status}: ${responseText}`);
            }

            try {
                const data = JSON.parse(responseText);
                console.log('✅ [ISP-LIST] Usuario data recibido:', data);
                
                // Extraer la lista de ISPs del campo isp_asignados
                const ispList = data.isp_asignados || [];
                console.log('✅ [ISP-LIST] ISPs cargados:', ispList.length);
                setIspList(ispList);
            } catch (jsonError) {
                console.error('❌ [ISP-LIST] Error parsing JSON:', jsonError);
                console.log('Raw response:', responseText);
                throw new Error('Error al procesar la respuesta del servidor');
            }
        } catch (error) {
            console.error('❌ [ISP-LIST] Error al cargar la lista de ISPs:', error);
            Alert.alert('Error', `No se pudo cargar la lista de ISPs: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    /* ======================================================
       3. ACTUALIZAR id_isp EN EL BACKEND Y NAVEGAR
       ====================================================== */
    const storeIspIdAndNavigate = async (isp) => {
        try {
            if (!usuarioId) {
                Alert.alert('Error', 'ID del usuario no disponible.');
                return;
            }

            console.log('🔄 Actualizando id_isp en el servidor...');

            const response = await fetch(
                'https://wellnet-rd.com:444/api/usuarios/actualizar-isp-usuario',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_usuario: usuarioId, id_isp: isp.id_isp }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            console.log(`✅ ID de ISP actualizado exitosamente en el servidor: ${isp.id_isp}`);

            // Guardar localmente en AsyncStorage
            await AsyncStorage.setItem('@selectedIspId', isp.id_isp.toString());
            console.log('✅ ID de ISP guardado localmente:', isp.id_isp);

            // Navegar a detalles
            navigation.navigate('IspDetailsScreen', { isp, id_isp: isp.id_isp });
        } catch (e) {
            console.error('❌ Error al actualizar el ID de ISP:', e);
            Alert.alert('Error', 'No se pudo actualizar el ID de ISP. Intenta de nuevo.');
        }
    };

    /* ======================================================
       4. REGISTRAR NAVEGACIÓN AL ENFOCARSE LA PANTALLA
       ====================================================== */
    useFocusEffect(
        React.useCallback(() => {
            if (usuarioId) {
                fetchIspList();
                registrarNavegacion();
            }
            return () => { };
        }, [usuarioId])
    );

    const registrarNavegacion = async () => {
        if (!usuarioId) return;
        try {
            const fechaActual = new Date();
            const fecha = fechaActual.toISOString().split('T')[0];
            const hora = fechaActual.toTimeString().split(' ')[0];

            const logData = {
                id_usuario: usuarioId,
                fecha,
                hora,
                pantalla: 'IspListScreen',
                datos: JSON.stringify({ isDarkMode }),
            };

            const response = await fetch(
                'https://wellnet-rd.com:444/api/log-navegacion-registrar',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(logData),
                }
            );

            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(responseData.message || 'Error al registrar la navegación');
            }
            console.log('✅ Navegación registrada exitosamente.');
        } catch (error) {
            console.error('❌ Error al registrar la navegación:', error);
        }
    };

    /* ======================================================
       5. MANEJAR MODAL (LONG PRESS) - EDITAR/ELIMINAR
       ====================================================== */
    // Abrir modal y precargar datos
    const handleLongPress = (isp) => {
        setSelectedIsp(isp);
        setNombreEdit(isp.nombre || '');
        setDireccionEdit(isp.direccion || '');
        setTelefonoEdit(isp.telefono || '');
        setEmailEdit(isp.email || '');
        setPaginaWebEdit(isp.pagina_web || '');

        setModalVisible(true);
    };

    // Cerrar modal sin cambios
    const handleCancel = () => {
        setModalVisible(false);
    };

    // Eliminar ISP
    const handleDelete = async () => {
        if (!selectedIsp) return;
        try {
            const response = await fetch(
                'https://wellnet-rd.com:444/api/usuarios/eliminar-isp',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_isp: selectedIsp.id_isp }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            // Remover de la lista local
            const nuevaLista = ispList.filter((item) => item.id_isp !== selectedIsp.id_isp);
            setIspList(nuevaLista);

            setModalVisible(false);
            Alert.alert('Exito', 'ISP eliminado correctamente.');
        } catch (error) {
            console.error('Error eliminando el ISP:', error);
            Alert.alert('Error', 'No se pudo eliminar el ISP.');
        }
    };

    // Actualizar ISP
    const handleUpdate = async () => {
        if (!selectedIsp) return;
        try {
            // Enviar los datos al backend
            const response = await fetch('https://wellnet-rd.com:444/api/actualizar-isp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ispId: selectedIsp.id_isp, // ID de la ISP seleccionada
                    usuarioId: usuarioId, // ID del usuario actual (ya almacenado en estado)
                    nombre: nombreEdit,
                    direccion: direccionEdit,
                    telefono: telefonoEdit,
                    rnc: selectedIsp.rnc || '', // Si el campo RNC es requerido
                    email: emailEdit,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            // Respuesta del servidor
            const responseData = await response.json();
            console.log('✅ Respuesta del servidor:', responseData);

            // Actualizar la lista local
            const updatedIspList = ispList.map((item) => {
                if (item.id_isp === selectedIsp.id_isp) {
                    return {
                        ...item,
                        nombre: nombreEdit,
                        direccion: direccionEdit,
                        telefono: telefonoEdit,
                        rnc: selectedIsp.rnc || '', // RNC permanece igual
                        email: emailEdit,
                    };
                }
                return item;
            });

            setIspList(updatedIspList);
            setModalVisible(false); // Cerrar el modal
            Alert.alert('Exito', 'ISP actualizada correctamente.');
        } catch (error) {
            console.error('❌ Error al actualizar la ISP:', error);
            Alert.alert('Error', 'No se pudo actualizar la ISP. Intenta de nuevo.');
        }
    };


    /* ======================================================
       6. RENDER DE CADA ITEM (FLATLIST) - MODERN CARD
       ====================================================== */
    const generateIspIcon = (name) => {
        if (!name) return 'business';
        const firstLetter = name.charAt(0).toUpperCase();
        return firstLetter;
    };

    const IspItem = ({ item }) => {
        const [pressed, setPressed] = useState(false);

        return (
            <Pressable
                style={[
                    styles.ispCard,
                    pressed && styles.ispCardPressed
                ]}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                onPress={() => storeIspIdAndNavigate(item)}
                onLongPress={() => handleLongPress(item)}
            >
                {/* Card Header with Icon and Name */}
                <View style={styles.ispCardHeader}>
                    <View style={styles.ispIconContainer}>
                        <Text style={styles.ispIconText}>
                            {generateIspIcon(item.nombre)}
                        </Text>
                    </View>
                    <View style={styles.ispNameContainer}>
                        <Text style={styles.ispName}>{item.nombre}</Text>
                        <Text style={styles.ispStatus}>Activo</Text>
                    </View>
                </View>

                {/* ISP Details */}
                <View style={styles.ispDetailsContainer}>
                    {item.direccion && (
                        <View style={styles.ispDetailRow}>
                            <View style={styles.ispDetailIcon}>
                                <Icon name="location-on" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                            </View>
                            <Text style={styles.ispDetailText}>{item.direccion}</Text>
                        </View>
                    )}
                    
                    {item.telefono && (
                        <View style={styles.ispDetailRow}>
                            <View style={styles.ispDetailIcon}>
                                <Icon name="phone" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                            </View>
                            <Text style={styles.ispDetailText}>{item.telefono}</Text>
                        </View>
                    )}
                    
                    {item.email && (
                        <View style={styles.ispDetailRow}>
                            <View style={styles.ispDetailIcon}>
                                <Icon name="email" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                            </View>
                            <Text style={styles.ispDetailText}>{item.email}</Text>
                        </View>
                    )}
                    
                    {item.pagina_web && (
                        <View style={styles.ispDetailRow}>
                            <View style={styles.ispDetailIcon}>
                                <Icon name="language" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                            </View>
                            <Text style={styles.ispDetailText}>{item.pagina_web}</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.ispActionContainer}>
                    <TouchableOpacity 
                        style={styles.ispActionButton}
                        onPress={() => storeIspIdAndNavigate(item)}
                    >
                        <Text style={styles.ispActionButtonText}>Seleccionar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.ispActionButton, styles.ispActionButtonSecondary]}
                        onPress={() => handleLongPress(item)}
                    >
                        <Text style={[styles.ispActionButtonText, styles.ispActionButtonSecondaryText]}>Editar</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        );
    };

    /* ======================================================
       7. BOTONES MENU HORIZONTAL
       ====================================================== */
    const handleSubscriptionNavigation = () => {
        navigation.navigate('SubscriptionDashboard');
    };

    const handleAccountingSubscriptionNavigation = () => {
        navigation.navigate('ContabilidadSuscripcionScreen');
    };

    const botones = [
        { id: '6', action: () => setMenuVisible(true), icon: 'menu' },
        { id: '5', title: 'Agregar ISP', screen: 'AddIspScreen', icon: 'add' },
        { id: '7', title: 'Suscripción', action: handleSubscriptionNavigation, icon: 'payment' },
        { id: '8', title: 'Contabilidad', action: handleAccountingSubscriptionNavigation, icon: 'account_balance' },
        { id: '2', title: 'Facturas para mi', screen: 'FacturasParaMiScreen', icon: 'receipt' },
        // Botones de sistema de notificaciones para propietarios ISP
        { id: '10', title: 'Notificaciones', screen: 'NotificacionesPagos', icon: 'notifications' },
        // Botones de facturación ISP
        { id: '11', title: 'Facturación ISP', screen: 'IspOwnerBillingDashboard', icon: 'business' },
        { id: '12', title: 'Historial Transacciones', screen: 'IspTransactionHistoryScreen', icon: 'history' },
    ];

    /* ======================================================
       8. RENDER PRINCIPAL
       ====================================================== */
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="business" size={64} color={isDarkMode ? '#64748B' : '#94A3B8'} />
            <Text style={styles.emptyTitle}>No hay ISPs disponibles</Text>
            <Text style={styles.emptySubtitle}>
                Agrega una nueva ISP para comenzar a gestionar tus servicios de internet
            </Text>
        </View>
    );

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
            <Text style={styles.loadingText}>Cargando ISPs...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header Animado */}
            <Animated.View style={[
                styles.containerSuperior,
                {
                    height: headerHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width < 400 ? 70 : 90], // Altura dinámica según tamaño
                    }),
                    opacity: headerHeight.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.5, 1],
                    }),
                    transform: [{
                        translateY: headerHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -70 : -90, 0],
                        }),
                    }],
                }
            ]}>
                <Text style={styles.title}>Nuestras ISPs</Text>
                <Text style={styles.subtitle}>Selecciona tu proveedor de servicios</Text>
            </Animated.View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {isLoading ? (
                    renderLoadingState()
                ) : ispList.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <FlatList
                        data={ispList}
                        keyExtractor={(item) => item.id_isp.toString()}
                        renderItem={({ item }) => <IspItem item={item} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    />
                )}
            </View>

            {/* ============ Modal del Menú ============ */}
            <MenuModal
                visible={menuVisible}
                onClose={() => {
                    setMenuVisible(false);
                    // Refrescar el estado del tema cuando se cierra el modal
                    const refreshTheme = async () => {
                        try {
                            const theme = await AsyncStorage.getItem('@theme');
                            // setIsDarkMode(theme === 'dark'); // Sólo si fuera necesario
                        } catch (error) {
                            console.error('Error al cargar el tema', error);
                        }
                    };
                    refreshTheme();
                }}
                menuItems={[
                    {
                        title: nombreUsuario,
                        action: () =>
                            navigation.navigate('UsuarioDetalleScreen', {
                                ispId: 'id_isp', // <-- Ajustar si se requiere
                                userId: usuarioId,
                            }),
                    },
                    { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
                    { title: 'Perfil', action: () => navigation.navigate('ProfileScreen') },
                    { title: 'Configuración', action: () => navigation.navigate('SettingsScreen') },
                    { title: 'Cerrar Sesión', action: handleLogout },
                ]}
                isDarkMode={isDarkMode}
                onItemPress={(item) => {
                    item.action();
                    setMenuVisible(false);
                }}
            />

            {/* ============ Modal para Editar ISP ============ */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancel}
            >
                <View style={modalStyles.modalOverlay}>
                    <View style={modalStyles.modalContainer}>
                        {/* Modal Header */}
                        <View style={modalStyles.modalHeader}>
                            <View style={modalStyles.modalIconContainer}>
                                <Icon name="edit" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={modalStyles.modalTitle}>Editar ISP</Text>
                            <Text style={modalStyles.modalSubtitle}>
                                Actualiza la información de {selectedIsp?.nombre}
                            </Text>
                        </View>

                        {/* Form Fields */}
                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.inputLabel}>Nombre</Text>
                            <TextInput
                                style={[
                                    modalStyles.input,
                                    focusedInput === 'nombre' && modalStyles.inputFocused
                                ]}
                                placeholder="Nombre de la ISP"
                                placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                value={nombreEdit}
                                onChangeText={setNombreEdit}
                                onFocus={() => setFocusedInput('nombre')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.inputLabel}>Dirección</Text>
                            <TextInput
                                style={[
                                    modalStyles.input,
                                    focusedInput === 'direccion' && modalStyles.inputFocused
                                ]}
                                placeholder="Dirección física"
                                placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                value={direccionEdit}
                                onChangeText={setDireccionEdit}
                                onFocus={() => setFocusedInput('direccion')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.inputLabel}>Teléfono</Text>
                            <TextInput
                                style={[
                                    modalStyles.input,
                                    focusedInput === 'telefono' && modalStyles.inputFocused
                                ]}
                                placeholder="Número de teléfono"
                                placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                value={telefonoEdit}
                                onChangeText={setTelefonoEdit}
                                keyboardType="phone-pad"
                                onFocus={() => setFocusedInput('telefono')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.inputLabel}>Email</Text>
                            <TextInput
                                style={[
                                    modalStyles.input,
                                    focusedInput === 'email' && modalStyles.inputFocused
                                ]}
                                placeholder="Correo electrónico"
                                placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                value={emailEdit}
                                onChangeText={setEmailEdit}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <View style={modalStyles.inputContainer}>
                            <Text style={modalStyles.inputLabel}>Página Web</Text>
                            <TextInput
                                style={[
                                    modalStyles.input,
                                    focusedInput === 'web' && modalStyles.inputFocused
                                ]}
                                placeholder="Sitio web corporativo"
                                placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                value={paginaWebEdit}
                                onChangeText={setPaginaWebEdit}
                                keyboardType="url"
                                autoCapitalize="none"
                                onFocus={() => setFocusedInput('web')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        {/* Action Buttons */}
                        <View style={modalStyles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[modalStyles.modalButton, modalStyles.modalButtonSecondary]}
                                onPress={handleCancel}
                            >
                                <Text style={modalStyles.modalButtonSecondaryText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[modalStyles.modalButton, modalStyles.modalButtonPrimary]}
                                onPress={handleUpdate}
                            >
                                <Text style={modalStyles.modalButtonText}>Actualizar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ============ Menú Horizontal ============ */}
            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />
        </View>
    );
};

export default IspListScreen;
