import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Switch, TextInput, Modal, ScrollView, Animated } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import ThemeSwitch from '../../componentes/themeSwitch';
import { useNavigation } from '@react-navigation/native';
import { getStyles } from './UsuarioDetalleStyles'; // Ajusta la ruta según tu estructura de carpetas
import { KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Componente FloatingLabelInput personalizado
const FloatingLabelInput = ({ 
    label, 
    value, 
    onChangeText, 
    keyboardType = 'default', 
    secureTextEntry = false,
    isDarkMode,
    style 
}) => {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    const labelStyle = {
        position: 'absolute',
        left: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 8], // Izquierda desde el inicio, luego un poco más a la izquierda
        }),
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [14, 4],
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [
                isDarkMode ? '#8E8E93' : '#8E8E93',
                isDarkMode ? '#007AFF' : '#007AFF'
            ],
        }),
        fontWeight: '500',
        backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
        paddingHorizontal: 4,
        zIndex: 1,
    };

    const inputStyle = {
        backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
        padding: 14,
        borderRadius: 12,
        color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
        fontSize: 16,
        borderWidth: isFocused ? 2 : 1,
        borderColor: isFocused 
            ? '#007AFF' 
            : isDarkMode ? '#3A3A3C' : '#E5E5EA',
        marginBottom: 16,
        ...style,
    };

    return (
        <View style={{ position: 'relative' }}>
            <Animated.Text style={labelStyle}>
                {label}
            </Animated.Text>
            <TextInput
                style={inputStyle}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
            />
        </View>
    );
};

const UsuarioDetalleScreen = ({ route }) => {
    const navigation = useNavigation();
    const { userId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode, isPermissionsVisible);
    const [usuario, setUsuario] = useState({});
    const [switchStates, setSwitchStates] = useState({});
    const [showPermissions, setShowPermissions] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false); // Toggle visibility for current password
    const [showNewPassword, setShowNewPassword] = useState(false); // Toggle visibility for new password
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle visibility for confirm password
    // Agregar el estado para controlar el colapso de la tarjeta
    const [isPermissionsVisible, setIsPermissionsVisible] = useState(false);
    const [permisos, setPermisos] = useState([]);
    const [expandedPermissions, setExpandedPermissions] = useState({});
    const [permissionSwitchStates, setPermissionSwitchStates] = useState({});
    const [subPermisos, setSubPermisos] = useState({}); // Almacena sub-permisos por permiso
    const [subPermissionSwitchStates, setSubPermissionSwitchStates] = useState({});
    const [isActionsVisible, setIsActionsVisible] = useState(false); // Estado para acciones
    const [visibleEyes, setVisibleEyes] = useState({}); // Controla la visibilidad de los ojos
    const [editModalVisible, setEditModalVisible] = useState(false); // Controla el modal
    const [editUserData, setEditUserData] = useState({
        usuario: '',
        nombre: '',
        apellido: '',
        telefono1: '',
        telefono2: '',
        email: '',
        rol: '',
        direccion: '',
        cedula: '',
        id: ''
    }); // Almacena los datos del formulario
    const [confirmPasswordModalVisible, setConfirmPasswordModalVisible] = useState(false);
    const [enteredPassword, setEnteredPassword] = useState('');
    const [hidePassword, setHidePassword] = useState(true);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [idUsuario, setIdUsuario] = useState(null);
    const [usuarioActual, setUsuarioActual] = useState({}); // Datos completos del usuario actual
    const [esPerfilPropio, setEsPerfilPropio] = useState(false); // Si está viendo su propio perfil
    const [cargandoDatos, setCargandoDatos] = useState(true); // Estado de carga de datos

    // Función helper para convertir valores de forma segura a string
    const safeStringify = (value) => {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }
        if (typeof value === 'object') {
            // Si es un objeto con nombre o id, intentar extraer esos valores
            if (value.nombre) return String(value.nombre);
            if (value.name) return String(value.name);
            if (value.usuario) return String(value.usuario);
            if (value.id) return String(value.id);
            // Si es un array, unir los elementos
            if (Array.isArray(value)) {
                return value.map(item => safeStringify(item)).join(', ');
            }
            // Como último recurso, usar JSON.stringify pero limpio
            try {
                return JSON.stringify(value);
            } catch {
                return '[Objeto complejo]';
            }
        }
        return String(value);
    };
    
    // Estados para métodos de pago
    const [isPaymentMethodsVisible, setIsPaymentMethodsVisible] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [addPaymentModalVisible, setAddPaymentModalVisible] = useState(false);
    const [editPaymentModalVisible, setEditPaymentModalVisible] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [newPaymentMethod, setNewPaymentMethod] = useState({
        tipo: 'tarjeta',
        nombre: '',
        numero: '',
        titular: '',
        vencimiento: '',
        cvv: '',
        banco: '',
        email_paypal: '',
        activo: true
    });

    // Función separada para obtener datos del usuario actual desde AsyncStorage
    const obtenerDatosUsuarioLocal = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            if (jsonValue != null) {
                const userData = JSON.parse(jsonValue);
                setNombreUsuario(userData.nombre);
                setIdUsuario(userData.id);
                return userData.id; // Retornamos el ID para usarlo en otras funciones
            }
        } catch (e) {
            console.error('Error al leer el nombre del usuario', e);
        }
        return null;
    };

    // Función para obtener datos completos del usuario actual desde el backend
    const obtenerDatosUsuarioActual = async (currentUserId) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/datos-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentUserId }),
            });
            const currentUserData = await response.json();
            
            // Debug: Log completo de los datos del usuario actual
            console.log('👤 Datos completos del usuario actual:', JSON.stringify(currentUserData, null, 2));
            
            // Extraer los datos del usuario actual de la estructura de respuesta
            const actualCurrentUserData = currentUserData.usuario || currentUserData;
            console.log('👤 Datos extraídos del usuario actual:', JSON.stringify(actualCurrentUserData, null, 2));
            console.log('👤 Campos específicos del usuario actual:');
            console.log('  - usuario:', actualCurrentUserData.usuario);
            console.log('  - nombre:', actualCurrentUserData.nombre);
            console.log('  - apellido:', actualCurrentUserData.apellido);
            console.log('  - rol:', actualCurrentUserData.rol);
            
            setUsuarioActual(actualCurrentUserData);
            
            console.log('👤 Usuario actual obtenido:', actualCurrentUserData.nombre, actualCurrentUserData.apellido, '(ID:', currentUserId, ')');
            return actualCurrentUserData;
        } catch (error) {
            console.error('Error al obtener datos completos del usuario actual:', error);
            return null;
        }
    };

    // Función principal que coordina la carga de ambos usuarios
    const cargarDatosUsuarios = async () => {
        try {
            setCargandoDatos(true);
            
            // 1. Obtener ID del usuario actual desde AsyncStorage
            const currentUserId = await obtenerDatosUsuarioLocal();
            
            if (currentUserId) {
                // 2. Cargar datos completos de ambos usuarios en paralelo
                const [currentUserData, visitedUserData] = await Promise.all([
                    obtenerDatosUsuarioActual(currentUserId),
                    fetchUsuarioVisitado(userId)
                ]);

                // 3. Verificar si está viendo su propio perfil
                const esPropio = String(currentUserId) === String(userId);
                setEsPerfilPropio(esPropio);

                console.log('🔄 Datos cargados:');
                console.log('👤 Usuario actual:', currentUserData?.nombre, currentUserData?.apellido, '(ID:', currentUserId, ')');
                console.log('👁️ Usuario visitado:', visitedUserData?.nombre, visitedUserData?.apellido, '(ID:', userId, ')');
                console.log('🔍 Es perfil propio:', esPropio);
            }
        } catch (error) {
            console.error('Error al cargar datos de usuarios:', error);
        } finally {
            setCargandoDatos(false);
        }
    };

    // Función para obtener datos del usuario visitado
    const fetchUsuarioVisitado = async (userIdToFetch) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/datos-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userIdToFetch }),
            });
            const data = await response.json();
            
            // Debug: Log completo de los datos del usuario
            console.log('📋 Datos completos del usuario visitado:', JSON.stringify(data, null, 2));
            
            // Extraer los datos del usuario de la estructura de respuesta
            const actualUserData = data.usuario || data;
            console.log('📋 Datos extraídos del usuario para la tarjeta:', JSON.stringify(actualUserData, null, 2));
            console.log('📋 Campos específicos extraídos:');
            console.log('  - usuario:', actualUserData.usuario);
            console.log('  - nombre:', actualUserData.nombre);
            console.log('  - apellido:', actualUserData.apellido);
            console.log('  - telefono1:', actualUserData.telefono1);
            console.log('  - telefono2:', actualUserData.telefono2);
            console.log('  - email:', actualUserData.email);
            
            // Establecer los datos correctos en el estado usuario
            setUsuario(actualUserData);
            setSwitchStates({
                permiso_facturaciones: Boolean(actualUserData.permiso_facturaciones),
                permiso_clientes: Boolean(actualUserData.permiso_clientes),
                permiso_servicios: Boolean(actualUserData.permiso_servicios),
                permiso_productos: Boolean(actualUserData.permiso_productos),
                permiso_controles: Boolean(actualUserData.permiso_controles),
                permiso_usuarios: Boolean(actualUserData.permiso_usuarios),
                permiso_conexiones: Boolean(actualUserData.permiso_conexiones),
                permiso_contabilidad: Boolean(actualUserData.permiso_contabilidad),
            });
            return data;
        } catch (error) {
            console.error('Error al obtener datos del usuario visitado:', error);
            Alert.alert('Error', 'Error al obtener los datos del usuario.');
            return null;
        }
    };



    // Función para alternar la visibilidad de las acciones
    const toggleActionsVisibility = () => {
        setIsActionsVisible(!isActionsVisible);
    };

    // Función para alternar la visibilidad de métodos de pago
    const togglePaymentMethodsVisibility = () => {
        setIsPaymentMethodsVisible(!isPaymentMethodsVisible);
    };

    // Función para obtener métodos de pago
    const fetchPaymentMethods = async () => {
        try {
            console.log('📥 [FETCH-PAYMENTS] Obteniendo métodos de pago para usuario:', userId);
            
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/metodos-pago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_usuario: userId }),
            });
            
            console.log('📥 [FETCH-PAYMENTS] Response status:', response.status);
            console.log('📥 [FETCH-PAYMENTS] Response ok:', response.ok);
            
            const data = await response.json();
            console.log('📥 [FETCH-PAYMENTS] Data recibida:', JSON.stringify(data, null, 2));
            
            setPaymentMethods(data || []);
        } catch (error) {
            console.error('❌ [FETCH-PAYMENTS] Error al obtener métodos de pago:', error);
            Alert.alert('Error', 'No se pudieron cargar los métodos de pago.');
        }
    };

    // Función para agregar método de pago
    const handleAddPaymentMethod = async () => {
        try {
            const payload = { 
                id_usuario: userId, 
                ...newPaymentMethod 
            };
            
            console.log('📤 [ADD-PAYMENT] Enviando payload:', JSON.stringify(payload, null, 2));
            console.log('📤 [ADD-PAYMENT] userId:', userId);
            console.log('📤 [ADD-PAYMENT] newPaymentMethod:', JSON.stringify(newPaymentMethod, null, 2));
            
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/agregar-metodo-pago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            console.log('📥 [ADD-PAYMENT] Response status:', response.status);
            console.log('📥 [ADD-PAYMENT] Response ok:', response.ok);
            
            const responseData = await response.json();
            console.log('📥 [ADD-PAYMENT] Response data:', JSON.stringify(responseData, null, 2));
            
            if (response.ok) {
                fetchPaymentMethods(); // Recargar la lista
                setAddPaymentModalVisible(false);
                setNewPaymentMethod({
                    tipo: 'tarjeta',
                    nombre: '',
                    numero: '',
                    titular: '',
                    vencimiento: '',
                    cvv: '',
                    banco: '',
                    email_paypal: '',
                    activo: true
                });
                Alert.alert('Éxito', 'Método de pago agregado correctamente.');
            } else {
                console.error('❌ [ADD-PAYMENT] Error del backend:', responseData);
                const errorMessage = responseData.message || responseData.error || 'Error desconocido del servidor';
                Alert.alert('Error', `No se pudo agregar el método de pago: ${errorMessage}`);
            }
        } catch (error) {
            console.error('❌ [ADD-PAYMENT] Error de red o parsing:', error);
            Alert.alert('Error', 'Error de conexión. Verifica tu internet e intenta nuevamente.');
        }
    };

    // Función para editar método de pago
    const handleEditPaymentMethod = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/editar-metodo-pago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_metodo: selectedPaymentMethod.id,
                    ...newPaymentMethod 
                }),
            });
            
            if (response.ok) {
                fetchPaymentMethods(); // Recargar la lista
                setEditPaymentModalVisible(false);
                setSelectedPaymentMethod(null);
                Alert.alert('Éxito', 'Método de pago actualizado correctamente.');
            } else {
                throw new Error('Error al editar método de pago');
            }
        } catch (error) {
            console.error('Error al editar método de pago:', error);
            Alert.alert('Error', 'No se pudo actualizar el método de pago.');
        }
    };

    // Función para eliminar método de pago
    const handleDeletePaymentMethod = (metodo) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de que deseas eliminar el método de pago "${metodo.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', onPress: () => confirmDeletePaymentMethod(metodo.id) }
            ]
        );
    };

    const confirmDeletePaymentMethod = async (id) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/eliminar-metodo-pago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_metodo: id }),
            });
            
            if (response.ok) {
                fetchPaymentMethods(); // Recargar la lista
                Alert.alert('Éxito', 'Método de pago eliminado correctamente.');
            } else {
                throw new Error('Error al eliminar método de pago');
            }
        } catch (error) {
            console.error('Error al eliminar método de pago:', error);
            Alert.alert('Error', 'No se pudo eliminar el método de pago.');
        }
    };

    // Función para abrir modal de agregar método de pago
    const openAddPaymentModal = () => {
        console.log('🆕 [ADD-MODAL] Abriendo modal de agregar - limpiando estado...');
        
        // Limpiar completamente el estado antes de abrir el modal
        const cleanState = {
            tipo: 'tarjeta',
            nombre: '',
            numero: '',
            titular: '',
            vencimiento: '',
            cvv: '',
            banco: '',
            email_paypal: '',
            activo: true
        };
        
        console.log('🆕 [ADD-MODAL] Estado limpio:', JSON.stringify(cleanState, null, 2));
        setNewPaymentMethod(cleanState);
        setAddPaymentModalVisible(true);
    };

    // Función para abrir modal de edición
    const openEditPaymentModal = (metodo) => {
        setSelectedPaymentMethod(metodo);
        setNewPaymentMethod({
            tipo: metodo.tipo,
            nombre: metodo.nombre,
            numero: metodo.numero,
            titular: metodo.titular,
            vencimiento: metodo.vencimiento,
            cvv: metodo.cvv,
            banco: metodo.banco,
            email_paypal: metodo.email_paypal || '',
            activo: metodo.activo
        });
        setEditPaymentModalVisible(true);
    };

    const handlePermissionSwitchChange = (id_permiso, value) => {
        setPermissionSwitchStates((prevState) => ({
            ...prevState,
            [id_permiso]: value, // Actualiza el estado del switch localmente
        }));

        // Llama al backend con todos los parámetros necesarios
        updatePermissionStatusBackend(id_permiso, value, userId);
    };

    // Función para alternar el colapso
    const togglePermissionsVisibility = () => {
        setIsPermissionsVisible(!isPermissionsVisible);
    };


    const toggleVisibility = async (id_permiso, isSubPermission = false, id_permiso_sub = 0) => {
        const key = isSubPermission
            ? `${id_permiso}-${id_permiso_sub}` // Sub-permiso
            : id_permiso; // Permiso principal

        const nuevaVista = visibleEyes[key] ? 'Basica' : 'Avanzada'; // Alternar entre Basica y Avanzada

        setVisibleEyes((prev) => ({
            ...prev,
            [key]: !prev[key], // Cambia el estado (mostrar/ocultar)
        }));

        // Llama a la función para actualizar la Vista
        await updateSubPermissionStatusBackend(id_permiso, id_permiso_sub, true, userId, nuevaVista);
    };

    // Lista optimizada de permisos
    const permissionItems = useMemo(() => [
        { key: 'permiso_facturaciones', label: 'Facturaciones' },
        { key: 'permiso_clientes', label: 'Clientes' },
        { key: 'permiso_servicios', label: 'Servicios' },
        { key: 'permiso_productos', label: 'Productos' },
        { key: 'permiso_controles', label: 'Controles' },
        { key: 'permiso_usuarios', label: 'Usuarios' },
        { key: 'permiso_conexiones', label: 'Conexiones' },
        { key: 'permiso_contabilidad', label: 'Contabilidad' },
    ], []);

    // Efecto principal para cargar datos cuando cambia userId
    useEffect(() => {
        console.log('🔍 userId recibido desde route.params:', userId);
        if (userId) {
            cargarDatosUsuarios();
        }
    }, [userId]);

    useEffect(() => {
        const fetchPermisos = async () => {
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/usuarios/permisos');
                const data = await response.json();
                setPermisos(data);
            } catch (error) {
                Alert.alert('Error', 'Error al obtener los permisos.');
            }
        };
        fetchPermisos();
    }, []);


    // Cargar métodos de pago solo si es el perfil propio
    useEffect(() => {
        if (userId && esPerfilPropio) {
            fetchPaymentMethods();
        }
    }, [userId, esPerfilPropio]);


    const togglePermissionCollapse = async (id_permiso) => {
        console.log('🔽 Expandiendo permiso:', id_permiso);

        setExpandedPermissions((prevState) => ({
            ...prevState,
            [id_permiso]: !prevState[id_permiso],
        }));

        // Si los sub-permisos ya están cargados, no hacemos la llamada
        if (subPermisos[id_permiso]) {
            return;
        }

        try {
            const id_usuario = userId;

            if (!id_usuario) {
                console.error('❌ No se encontró el id_usuario');
                Alert.alert('Error', 'No se encontró el ID de usuario.');
                return;
            }

            // Llamada al backend para obtener los sub-permisos
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/obtener-sub-permisos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_permiso, id_usuario }), // Incluye id_usuario en el payload
            });

            if (!response.ok) throw new Error('Error al obtener sub-permisos');

            const data = await response.json();
            console.log(`✅ Sub-permisos para permiso ${id_permiso}:`, data);

            // Actualiza el estado de los sub-permisos
            setSubPermisos((prevState) => ({
                ...prevState,
                [id_permiso]: data,
            }));

            // Actualiza los estados de los switches de sub-permisos y los ojos
            const newSubPermissionStates = {};
            const newVisibleEyes = {};
            data.forEach((subPermiso) => {
                const key = `${id_permiso}-${subPermiso.id_permiso_sub}`;
                newSubPermissionStates[key] = subPermiso.estado_permiso === 'Y'; // Estado del switch
                newVisibleEyes[key] = subPermiso.Vista === 'Avanzada'; // Usa 'Vista' con V mayúscula

                // Agrega un log para verificar el valor de Vista
                console.log(`Sub-permiso ${key} - Vista: ${subPermiso.Vista}`);
            });

            setSubPermissionSwitchStates((prevState) => ({
                ...prevState,
                ...newSubPermissionStates,
            }));

            setVisibleEyes((prevState) => ({
                ...prevState,
                ...newVisibleEyes,
            }));

            console.log('✅ Estados de switches de sub-permisos actualizados:', newSubPermissionStates);
            console.log('✅ Estados de ojos de sub-permisos actualizados:', newVisibleEyes);
        } catch (error) {
            console.error('❌ Error al cargar los sub-permisos:', error);
            Alert.alert('Error', 'No se pudieron cargar los sub-permisos.');
        }
    };

    // Fetch permission states
    // Carga los estados de los permisos del usuario
    const [vistaSwitchStates, setVistaSwitchStates] = useState({}); // Estado para almacenar las vistas de los permisos

    useEffect(() => {
        const fetchPermissionStates = async () => {
            try {
                const response = await fetch(`https://wellnet-rd.com:444/api/usuarios/permisos-usuario?id_usuario=${userId}`);
                const data = await response.json();

                if (response.ok) {
                    // Estados iniciales para permisos y vistas
                    const initialStates = {};
                    const initialEyes = {};

                    data.forEach((permiso) => {
                        const key = permiso.id_permiso_sub === 0
                            ? permiso.id_permiso // Permiso principal
                            : `${permiso.id_permiso}-${permiso.id_permiso_sub}`; // Sub-permiso

                        initialStates[key] = permiso.estado_permiso === 'Y'; // Estado del switch
                        initialEyes[key] = permiso.Vista === 'Avanzada'; // Usa 'Vista' con V mayúscula

                        // Agrega un log para verificar el valor de Vista
                        console.log(`Permiso ${key} - Vista: ${permiso.Vista}`);
                    });

                    // Actualizar estados en React
                    setPermissionSwitchStates((prev) => ({
                        ...prev,
                        ...Object.fromEntries(Object.entries(initialStates).filter(([k, v]) => !k.includes('-'))),
                    })); // Solo permisos principales

                    setSubPermissionSwitchStates((prev) => ({
                        ...prev,
                        ...Object.fromEntries(Object.entries(initialStates).filter(([k, v]) => k.includes('-'))),
                    })); // Solo sub-permisos

                    setVisibleEyes(initialEyes); // Estados de los ojos
                    console.log('✅ Estados cargados:', { initialStates, initialEyes });
                } else {
                    throw new Error('Error al cargar los estados de permisos');
                }
            } catch (error) {
                console.error('❌ Error al obtener los estados de permisos:', error);
                Alert.alert('Error', 'No se pudieron cargar los permisos y las vistas.');
            }
        };

        fetchPermissionStates();
    }, [userId]);

    // Carga todos los sub-permisos
    useEffect(() => {
        const fetchAllSubPermisos = async () => {
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/usuarios/sub-permisos');
                const data = await response.json();

                // Organiza los sub-permisos por id_permiso
                const groupedSubPermisos = data.reduce((acc, subPermiso) => {
                    const { id_permiso } = subPermiso;
                    if (!acc[id_permiso]) acc[id_permiso] = [];
                    acc[id_permiso].push(subPermiso);
                    return acc;
                }, {});

                setSubPermisos(groupedSubPermisos);
                console.log('✅ Sub-permisos cargados:', groupedSubPermisos);
            } catch (error) {
                console.error('❌ Error al cargar los sub-permisos:', error);
                Alert.alert('Error', 'No se pudieron cargar los sub-permisos.');
            }
        };

        fetchAllSubPermisos();
    }, []);



    useEffect(() => {
        console.log('🔍 Estados de permisos principales:', permissionSwitchStates);
        console.log('🔍 Estados de sub-permisos:', subPermissionSwitchStates);
    }, [permissionSwitchStates, subPermissionSwitchStates]);



    useEffect(() => {
        const initialSubPermissionStates = {};
        Object.keys(subPermisos).forEach((id_permiso) => {
            subPermisos[id_permiso].forEach((subPermiso) => {
                initialSubPermissionStates[`${id_permiso}-${subPermiso.id_permiso_sub}`] =
                    subPermiso.estado_permiso === 'Y';
            });
        });
        setSubPermissionSwitchStates(initialSubPermissionStates);
        console.log('✅ Estados iniciales de sub-permisos cargados:', initialSubPermissionStates);
    }, [subPermisos]);


    // Handle password change
    const handlePasswordChange = async () => {
        if (newPassword !== confirmNewPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/cambiar-contrasena', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_usuario: userId, currentPassword, newPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Éxito', 'La contraseña se cambió correctamente.');
                setPasswordModalVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                Alert.alert('Error', data.message || 'No se pudo cambiar la contraseña.');
            }
        } catch (error) {
            Alert.alert('Error', 'Hubo un problema al cambiar la contraseña.');
        }
    };

    // const handleSwitchChange = (id_permiso, value) => {
    //     // Actualiza el estado del interruptor localmente
    //     setSwitchStates((prevState) => ({
    //         ...prevState,
    //         [id_permiso]: value,
    //     }));

    //     // Llama a la función para actualizar en el backend
    //     updatePermissionStatusBackend(id_permiso, value, userId);
    // };



    const updatePermissionStatusBackend = async (id_permiso, value, id_usuario) => {
        if (!id_usuario || !id_permiso) {
            console.error('❌ Faltan datos requeridos para actualizar el permiso.');
            Alert.alert('Error', 'Faltan datos para actualizar el permiso.');
            return;
        }

        const payload = {
            id_usuario,
            id_permiso,
            id_permiso_sub: 0, // Para permisos principales
            estado_permiso: value ? 'Y' : 'N',
        };

        console.log('📤 Payload enviado al backend:', payload);

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/actualizar-permiso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Error en el servidor');

            const data = await response.json();
            console.log('✅ Permiso actualizado correctamente:', data);
            Alert.alert('Éxito', 'Permiso actualizado correctamente.');
        } catch (error) {
            console.error('❌ Error al actualizar el permiso:', error);
            Alert.alert('Error', 'No se pudo actualizar el permiso.');
        }
    };


    const handleSubPermissionSwitchChange = (id_permiso, id_permiso_sub, value) => {
        console.log(`🔄 Cambiando estado del sub-permiso: ${id_permiso_sub}, Permiso padre: ${id_permiso}`);

        // Actualiza el estado local del switch
        setSubPermissionSwitchStates((prevState) => ({
            ...prevState,
            [`${id_permiso}-${id_permiso_sub}`]: value,
        }));

        // Llama al backend para actualizar el estado del sub-permiso
        updateSubPermissionStatusBackend(id_permiso, id_permiso_sub, value, userId);
    };

    const updateSubPermissionStatusBackend = async (
        id_permiso,
        id_permiso_sub,
        value,
        userId,
        vista = null // Agregamos un parámetro opcional para la vista
    ) => {
        const payload = {
            id_usuario: userId,
            id_permiso, // Asegúrate de enviar el ID correcto del permiso padre
            id_permiso_sub,
            estado_permiso: value ? 'Y' : 'N', // Convertir el valor booleano a 'Y' o 'N'
        };

        // Si se especifica la vista, la agregamos al payload
        if (vista) {
            payload.vista = vista;
        }

        console.log('📤 Enviando al backend:', payload);

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/actualizar-permiso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el permiso');
            }

            const data = await response.json();
            console.log('✅ Respuesta del backend:', data);
            Alert.alert('Éxito', vista ? 'Vista actualizada correctamente.' : 'Sub-permiso actualizado correctamente.');
        } catch (error) {
            console.error('❌ Error al actualizar:', error);
            Alert.alert('Error', vista ? 'No se pudo actualizar la Vista.' : 'No se pudo actualizar el sub-permiso.');
        }
    };



    const renderActionButton = (title, screen, iconName) => (
        <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate(screen, { userId })}
        >
            <Icon name={iconName} size={16} color="#FFF" style={styles.actionButtonIcon} />
            <Text style={styles.actionButtonText}>{title}</Text>
        </TouchableOpacity>
    );

    const handleLongPress = async (id_permiso, id_permiso_sub = 0) => {
        const key = id_permiso_sub > 0
            ? `${id_permiso}-${id_permiso_sub}` // Sub-permiso
            : id_permiso; // Permiso principal

        const nuevaVista = visibleEyes[key] ? 'Basica' : 'Avanzada'; // Alternar entre Basica y Avanzada
        const estadoActual = id_permiso_sub > 0
            ? subPermissionSwitchStates[key] || false // Estado del sub-permiso
            : permissionSwitchStates[key] || false; // Estado del permiso principal

        // Alternar visibilidad de los ojos (sin auto-ocultarlos)
        setVisibleEyes((prev) => ({
            ...prev,
            [key]: !prev[key], // Alternar visibilidad
        }));

        // Llama al backend para actualizar la vista y el estado del permiso/sub-permiso
        try {
            const payload = {
                id_usuario: userId,
                id_permiso,
                id_permiso_sub, // 0 para principal o valor del sub-permiso
                estado_permiso: estadoActual ? 'Y' : 'N', // Convertir el estado a 'Y' o 'N'
                vista: nuevaVista,
            };

            console.log('📤 Enviando datos al backend:', payload);

            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/actualizar-permiso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Error al actualizar la vista y el estado');

            const data = await response.json();
            console.log('✅ Vista y estado actualizados correctamente:', data);
            Alert.alert('Éxito', `Vista actualizada a ${nuevaVista}.`);
        } catch (error) {
            console.error('❌ Error al actualizar la vista y el estado:', error);
            Alert.alert('Error', 'No se pudo actualizar la vista y el estado.');
        }
    };

    // Función para mostrar el modal con datos del usuario actual
    // const openEditModal = () => {
    //     setEditUserData(usuario); // Inicializa con los datos actuales del usuario
    //     setEditModalVisible(true);
    // };

    const openEditModal = async () => {
        try {
            console.log('🔄 Obteniendo datos del usuario para edición...');
            console.log('🔍 userId:', userId);
            
            // Usar el endpoint que sabemos que funciona
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/datos-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId }),
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);
            
            if (response.ok) {
                const userData = await response.json();
                console.log('📝 Raw userData recibida:', JSON.stringify(userData, null, 2));
                
                // Extraer datos del usuario (estructura conocida: userData.usuario)
                const actualUserData = userData.usuario || userData;
                console.log('📝 actualUserData extraída:', JSON.stringify(actualUserData, null, 2));
                
                // Crear objeto de datos para el formulario
                const editData = {
                    usuario: actualUserData.usuario || '',
                    nombre: actualUserData.nombre || '',
                    apellido: actualUserData.apellido || '',
                    telefono1: actualUserData.telefono1 || '',
                    telefono2: actualUserData.telefono2 || '',
                    email: actualUserData.email || '',
                    rol: actualUserData.rol || '',
                    direccion: actualUserData.direccion || '',
                    cedula: actualUserData.cedula || '',
                    id: actualUserData.id || userId, 
                };
                
                console.log('📝 editData final para el formulario:', JSON.stringify(editData, null, 2));
                
                // Establecer los datos en el estado
                setEditUserData(editData);
                
                // Verificar que se estableció correctamente
                console.log('✅ setEditUserData llamado con:', JSON.stringify(editData, null, 2));
                
                // Abrir el modal
                setEditModalVisible(true);
                console.log('✅ Modal abierto');
            } else {
                const errorText = await response.text();
                console.error('❌ Error en response:', response.status, errorText);
                Alert.alert('Error', 'No se pudieron cargar los datos del usuario para edición.');
            }
        } catch (error) {
            console.error('❌ Error en openEditModal:', error);
            Alert.alert('Error', 'Error al obtener los datos del usuario.');
        }
    };


    // Función para manejar los cambios en los campos del formulario
    const handleInputChange = (field, value) => {
        setEditUserData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    // Función para enviar los datos al backend
    const handleEditUser = async () => {
        try {
            const payload = {
                ...editUserData, // Incluye todos los datos del usuario en el estado
                id: idUsuario, // Asegúrate de que el ID esté presente
            };
    
            console.log('📤 Payload enviado al backend:', payload);
    
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/editar-usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) throw new Error('Error al editar el usuario.');
    
            const data = await response.json();
            Alert.alert('Éxito', 'Usuario actualizado correctamente.');
    
            setUsuario(data); // Actualiza los datos locales del usuario
            setEditModalVisible(false); // Cierra el modal
    
            // Recargar la pantalla después de la edición
            navigation.replace('UsuarioDetalleScreen', { userId });
        } catch (error) {
            console.error('❌ Error al actualizar el usuario:', error);
            Alert.alert('Error', 'No se pudo actualizar el usuario.');
        }
    };
    
    

    // const handleEditUser = async () => {
    //     try {
    //         const response = await fetch('https://wellnet-rd.com:444/api/usuarios/editar-usuario', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(editUserData),
    //         });
    
    //         if (!response.ok) throw new Error('Error al editar el usuario.');
    
    //         const data = await response.json();
    //         Alert.alert('Éxito', 'Usuario actualizado correctamente.');
    
    //         setUsuario(data); // Actualiza los datos locales del usuario
    //         setEditModalVisible(false); // Cierra el modal
    
    //         // Recargar la pantalla después de la edición
    //         navigation.replace('UsuarioDetalleScreen', { userId }); // Reemplaza la pantalla actual para recargar los datos
    //     } catch (error) {
    //         console.error('❌ Error al actualizar el usuario:', error);
    //         Alert.alert('Error', 'No se pudo actualizar el usuario.');
    //     }
    // };
    
    

    const validatePassword = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/validar-contrasena', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_usuario: idUsuario, contrasena: enteredPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setConfirmPasswordModalVisible(false);
                openEditModal(); // Llama al modal de edición si la contraseña es correcta
            } else {
                Alert.alert('Error', 'Contraseña incorrecta.');
            }
        } catch (error) {
            Alert.alert('Error', 'Hubo un problema al validar la contraseña.');
            console.error(error);
        }
    };


    return (
        <FlatList
            style={styles.container}
            ListHeaderComponent={
                <View>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{`${usuario.nombre || ''} ${usuario.apellido || ''}`}</Text>
                            {!esPerfilPropio && (
                                <View style={styles.viewingAsContainer}>
                                    <Icon name="eye" size={12} color={isDarkMode ? '#FF6B35' : '#FF6B35'} />
                                    <Text style={styles.viewingAsText}>
                                        Viendo como: {usuarioActual.nombre} {usuarioActual.apellido}
                                    </Text>
                                </View>
                            )}
                            {esPerfilPropio && (
                                <View style={styles.ownProfileContainer}>
                                    <Icon name="user-circle" size={12} color={isDarkMode ? '#34C759' : '#34C759'} />
                                    <Text style={styles.ownProfileText}>Mi Perfil</Text>
                                </View>
                            )}
                        </View>
                        <ThemeSwitch />
                    </View>


                    {/* User Details */}
                    <View style={styles.detailCard}>
                        {/* Debug: Log del estado usuario para la tarjeta */}
                        {console.log('🏷️ Estado usuario para la tarjeta:', JSON.stringify(usuario, null, 2))}
                        
                        {/* Información Personal */}
                        <View style={styles.sectionHeader}>
                            <Icon name="user" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.sectionIcon} />
                            <Text style={styles.sectionTitle}>Información Personal</Text>
                        </View>
                        
                        {safeStringify(usuario.usuario) && (
                            <View style={styles.detailItem}>
                                <Icon name="at" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Usuario: {safeStringify(usuario.usuario)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.nombre) && (
                            <View style={styles.detailItem}>
                                <Icon name="user" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Nombre: {safeStringify(usuario.nombre)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.apellido) && (
                            <View style={styles.detailItem}>
                                <Icon name="user" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Apellido: {safeStringify(usuario.apellido)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.cedula) && (
                            <View style={styles.detailItem}>
                                <Icon name="id-card" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Cédula: {safeStringify(usuario.cedula)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.fecha_nacimiento) && (
                            <View style={styles.detailItem}>
                                <Icon name="calendar" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Fecha de Nacimiento: {safeStringify(usuario.fecha_nacimiento)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.genero) && (
                            <View style={styles.detailItem}>
                                <Icon name="venus-mars" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Género: {safeStringify(usuario.genero)}</Text>
                            </View>
                        )}

                        {/* Información de Contacto */}
                        <View style={styles.sectionHeader}>
                            <Icon name="phone" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.sectionIcon} />
                            <Text style={styles.sectionTitle}>Contacto</Text>
                        </View>
                        
                        {safeStringify(usuario.telefono1) && (
                            <View style={styles.detailItem}>
                                <Icon name="phone" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Teléfono 1: {safeStringify(usuario.telefono1)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.telefono2) && (
                            <View style={styles.detailItem}>
                                <Icon name="phone" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Teléfono 2: {safeStringify(usuario.telefono2)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.email) && (
                            <View style={styles.detailItem}>
                                <Icon name="envelope" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Email: {safeStringify(usuario.email)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.direccion) && (
                            <View style={styles.detailItem}>
                                <Icon name="map-marker" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Dirección: {safeStringify(usuario.direccion)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.ciudad) && (
                            <View style={styles.detailItem}>
                                <Icon name="building" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Ciudad: {safeStringify(usuario.ciudad)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.provincia) && (
                            <View style={styles.detailItem}>
                                <Icon name="map" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Provincia: {safeStringify(usuario.provincia)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.pais) && (
                            <View style={styles.detailItem}>
                                <Icon name="globe" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>País: {safeStringify(usuario.pais)}</Text>
                            </View>
                        )}

                        {/* Información del Sistema */}
                        <View style={styles.sectionHeader}>
                            <Icon name="cog" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.sectionIcon} />
                            <Text style={styles.sectionTitle}>Sistema</Text>
                        </View>
                        
                        {safeStringify(usuario.rol) && (
                            <View style={styles.detailItem}>
                                <Icon name="shield" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Rol: {safeStringify(usuario.rol)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.id_isp) && (
                            <View style={styles.detailItem}>
                                <Icon name="wifi" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>ID ISP: {safeStringify(usuario.id_isp)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.dia_facturacion) && (
                            <View style={styles.detailItem}>
                                <Icon name="calendar" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Día de Facturación: {safeStringify(usuario.dia_facturacion)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.nivel_usuario) && (
                            <View style={styles.detailItem}>
                                <Icon name="level-up" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Nivel: {safeStringify(usuario.nivel_usuario)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.categoria) && (
                            <View style={styles.detailItem}>
                                <Icon name="tag" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Categoría: {safeStringify(usuario.categoria)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.precio_por_conexion) && (
                            <View style={styles.detailItem}>
                                <Icon name="dollar" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Precio por Conexión: {safeStringify(usuario.precio_por_conexion)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.fecha_registro) && (
                            <View style={styles.detailItem}>
                                <Icon name="calendar-plus-o" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Fecha de Registro: {safeStringify(usuario.fecha_registro)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.fecha_creacion) && (
                            <View style={styles.detailItem}>
                                <Icon name="calendar-plus-o" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Fecha de Creación: {safeStringify(usuario.fecha_creacion)}</Text>
                            </View>
                        )}
                        
                        {safeStringify(usuario.ultimo_acceso) && (
                            <View style={styles.detailItem}>
                                <Icon name="clock-o" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Último Acceso: {safeStringify(usuario.ultimo_acceso)}</Text>
                            </View>
                        )}
                        
                        <View style={styles.detailItem}>
                            <Icon name="circle" size={12} color={usuario.is_online ? '#34C759' : '#FF3B30'} style={styles.detailIcon} />
                            <Text style={styles.detailText}>
                                Estado: {usuario.is_online ? 'En línea' : 'Desconectado'}
                            </Text>
                        </View>
                        
                        {safeStringify(usuario.estado_usuario) && (
                            <View style={styles.detailItem}>
                                <Icon name="info-circle" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Estado Usuario: {safeStringify(usuario.estado_usuario)}</Text>
                            </View>
                        )}
                        
                        {usuario.usuario_eliminado !== undefined && (
                            <View style={styles.detailItem}>
                                <Icon name="trash" size={16} color={usuario.usuario_eliminado ? '#FF3B30' : '#34C759'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>
                                    Eliminado: {usuario.usuario_eliminado ? 'Sí' : 'No'}
                                </Text>
                            </View>
                        )}
                        
                        {usuario.mega_administrador !== undefined && usuario.mega_administrador && (
                            <View style={styles.detailItem}>
                                <Icon name="crown" size={16} color={isDarkMode ? '#FFD60A' : '#FF6B35'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Mega Administrador</Text>
                            </View>
                        )}
                        
                        {usuario.super_administrador !== undefined && usuario.super_administrador && (
                            <View style={styles.detailItem}>
                                <Icon name="star" size={16} color={isDarkMode ? '#FFD60A' : '#FF6B35'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Super Administrador</Text>
                            </View>
                        )}
                        
                        {usuario.administrador !== undefined && usuario.administrador && (
                            <View style={styles.detailItem}>
                                <Icon name="user-circle" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Administrador</Text>
                            </View>
                        )}
                        
                        {usuario.operador !== undefined && usuario.operador && (
                            <View style={styles.detailItem}>
                                <Icon name="wrench" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Operador</Text>
                            </View>
                        )}
                        
                        {usuario.cliente !== undefined && usuario.cliente && (
                            <View style={styles.detailItem}>
                                <Icon name="user" size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Cliente</Text>
                            </View>
                        )}
                        
                        {usuario.owner !== undefined && usuario.owner && (
                            <View style={styles.detailItem}>
                                <Icon name="key" size={16} color={isDarkMode ? '#FFD60A' : '#FF6B35'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>Propietario</Text>
                            </View>
                        )}
                        
                        {usuario.activo !== undefined && (
                            <View style={styles.detailItem}>
                                <Icon name="check-circle" size={16} color={usuario.activo ? '#34C759' : '#FF3B30'} style={styles.detailIcon} />
                                <Text style={styles.detailText}>
                                    Cuenta: {usuario.activo ? 'Activa' : 'Inactiva'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        {/* // Botón "Editar" para abrir el modal */}
                        <TouchableOpacity
                            style={styles.button('#007AFF')}
                            onPress={() => setConfirmPasswordModalVisible(true)}
                        >
                            <Icon name="edit" size={16} color="#FFF" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.button('#FF6B35')}
                            onPress={() => setPasswordModalVisible(true)}
                        >
                            <Icon name="lock" size={16} color="#FFF" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Contraseña</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Lista de permisos */}
                    {/* Permisos Card */}
                    <View style={styles.card}>
                        <TouchableOpacity onPress={togglePermissionsVisibility} style={styles.cardHeader}>
                            <View style={styles.cardTitleContainer}>
                                <Icon name="shield" size={18} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.cardIcon} />
                                <Text style={styles.cardTitle}>Permisos</Text>
                            </View>
                            <Icon name={isPermissionsVisible ? 'chevron-down' : 'chevron-right'} size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} />
                        </TouchableOpacity>
                        {isPermissionsVisible && (
                            <View style={styles.cardContent}>


                                {/* Mapea los permisos y crea una tarjeta para cada uno */}
                                {permisos.map((permiso) => (
                                    <View key={permiso.id_permiso} style={styles.permissionCard}>
                                        <View style={styles.permissionHeader}>
                                            {/* Toggle del permiso padre */}
                                            <TouchableOpacity
                                                onPress={() => togglePermissionCollapse(permiso.id_permiso)}
                                            >
                                                <Text style={styles.toggleText}>
                                                    {expandedPermissions[permiso.id_permiso] ? '⬇   ' : '➔ '}
                                                </Text>
                                            </TouchableOpacity>

                                            {/* Texto del permiso padre con LongPress para alternar visibilidad del ícono 👁️J👁️ */}
                                            <TouchableOpacity
                                                onLongPress={() => toggleVisibility(permiso.id_permiso)} // Detecta presión prolongada
                                            >
                                                <Text style={styles.permissionTitle}>{permiso.nombre_permiso}</Text>
                                            </TouchableOpacity>

                                            {/* Ícono 👁️J👁️ visible solo si está activo */}
                                            {visibleEyes[permiso.id_permiso] && (
                                                <Text style={styles.eyes}>👁️J👁️</Text>
                                            )}

                                            {/* Switch para el permiso padre */}
                                            <Switch
                                                value={permissionSwitchStates[permiso.id_permiso] || false} // Estado del switch
                                                onValueChange={(value) =>
                                                    handlePermissionSwitchChange(permiso.id_permiso, value)
                                                } // Maneja el cambio
                                            />
                                        </View>

                                        {/* Renderizar sub-permisos si el permiso padre está expandido */}
                                        {expandedPermissions[permiso.id_permiso] && (
                                            <View style={styles.permissionContent}>
                                                {/* Mapea los sub-permisos y crea una tarjeta para cada uno */}
                                                {subPermisos[permiso.id_permiso]?.map((subPermiso) => (
                                                    <View
                                                        key={subPermiso.id_permiso_sub}
                                                        style={styles.subPermission}
                                                    >
                                                        {/* Texto del sub-permiso con LongPress */}
                                                        <TouchableOpacity
                                                            onLongPress={() =>
                                                                handleLongPress(permiso.id_permiso, subPermiso.id_permiso_sub) // Detecta presión prolongada
                                                            }
                                                        >
                                                            <Text style={styles.subPermissionText}>
                                                                🔹 {subPermiso.nombre_permiso_sub}
                                                            </Text>
                                                        </TouchableOpacity>

                                                        {/* Ícono 👁️ visible solo si está activo */}
                                                        {visibleEyes[`${permiso.id_permiso}-${subPermiso.id_permiso_sub}`] && (
                                                            <Text style={styles.eyes}>👁️J👁️</Text>
                                                        )}

                                                        {/* Switch del sub-permiso */}
                                                        <Switch
                                                            value={
                                                                subPermissionSwitchStates[
                                                                `${permiso.id_permiso}-${subPermiso.id_permiso_sub}`
                                                                ] || false
                                                            }
                                                            onValueChange={(value) =>
                                                                handleSubPermissionSwitchChange(
                                                                    permiso.id_permiso,
                                                                    subPermiso.id_permiso_sub,
                                                                    value
                                                                )
                                                            }
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Métodos de Pago */}
                    <View style={styles.card}>
                        <TouchableOpacity 
                            onPress={esPerfilPropio ? togglePaymentMethodsVisibility : null} 
                            style={[styles.cardHeader, !esPerfilPropio && styles.cardHeaderDisabled]}
                            disabled={!esPerfilPropio}
                        >
                            <View style={styles.cardTitleContainer}>
                                <Icon 
                                    name="credit-card" 
                                    size={18} 
                                    color={esPerfilPropio ? (isDarkMode ? '#007AFF' : '#007AFF') : (isDarkMode ? '#6D6D70' : '#8E8E93')} 
                                    style={styles.cardIcon} 
                                />
                                <Text style={[styles.cardTitle, !esPerfilPropio && styles.cardTitleDisabled]}>
                                    Métodos de Pago
                                </Text>
                                {!esPerfilPropio && (
                                    <Icon name="lock" size={14} color={isDarkMode ? '#8E8E93' : '#8E8E93'} style={styles.lockIcon} />
                                )}
                            </View>
                            {esPerfilPropio ? (
                                <Icon name={isPaymentMethodsVisible ? 'chevron-down' : 'chevron-right'} size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} />
                            ) : (
                                <Icon name="eye-slash" size={16} color={isDarkMode ? '#8E8E93' : '#8E8E93'} />
                            )}
                        </TouchableOpacity>
                        
                        {/* Contenido para perfil propio */}
                        {esPerfilPropio && isPaymentMethodsVisible && (
                            <View style={styles.cardContent}>
                                {/* Botón para agregar método de pago */}
                                <TouchableOpacity
                                    style={styles.addPaymentButton}
                                    onPress={openAddPaymentModal}
                                >
                                    <Icon name="plus" size={16} color="#FFF" />
                                    <Text style={styles.addPaymentButtonText}>Agregar Método de Pago</Text>
                                </TouchableOpacity>

                                {/* Lista de métodos de pago */}
                                {paymentMethods.map((metodo, index) => (
                                    <View key={index} style={styles.paymentMethodCard}>
                                        <View style={styles.paymentMethodInfo}>
                                            <Text style={styles.paymentMethodName}>{metodo.nombre}</Text>
                                            <Text style={styles.paymentMethodType}>
                                                {metodo.tipo === 'tarjeta' ? 'Tarjeta' : metodo.tipo === 'paypal' ? 'PayPal' : 'Cuenta Bancaria'}
                                            </Text>
                                            {metodo.tipo === 'paypal' ? (
                                                <Text style={styles.paymentMethodNumber}>
                                                    {metodo.email_paypal}
                                                </Text>
                                            ) : (
                                                <Text style={styles.paymentMethodNumber}>
                                                    **** **** **** {metodo.numero.slice(-4)}
                                                </Text>
                                            )}
                                            <Text style={styles.paymentMethodStatus}>
                                                Estado: {metodo.activo ? 'Activo' : 'Inactivo'}
                                            </Text>
                                        </View>
                                        <View style={styles.paymentMethodActions}>
                                            <TouchableOpacity
                                                style={styles.editButton}
                                                onPress={() => openEditPaymentModal(metodo)}
                                            >
                                                <Icon name="edit" size={16} color="#2196F3" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleDeletePaymentMethod(metodo)}
                                            >
                                                <Icon name="trash" size={16} color="#F44336" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}

                                {paymentMethods.length === 0 && (
                                    <Text style={styles.noPaymentMethodsText}>
                                        No hay métodos de pago registrados
                                    </Text>
                                )}
                            </View>
                        )}
                        
                        {/* Mensaje para perfiles ajenos */}
                        {!esPerfilPropio && (
                            <View style={styles.cardContentDisabled}>
                                <Icon name="shield" size={24} color={isDarkMode ? '#6D6D70' : '#8E8E93'} style={styles.privacyIcon} />
                                <Text style={styles.privacyText}>
                                    Información Privada
                                </Text>
                                <Text style={styles.privacySubtext}>
                                    Los métodos de pago solo son visibles para el propietario del perfil
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Acciones */}
                    <View style={styles.card}>
                        <TouchableOpacity onPress={toggleActionsVisibility} style={styles.cardHeader}>
                            <View style={styles.cardTitleContainer}>
                                <Icon name="cogs" size={18} color={isDarkMode ? '#007AFF' : '#007AFF'} style={styles.cardIcon} />
                                <Text style={styles.cardTitle}>Acciones</Text>
                            </View>
                            <Icon name={isActionsVisible ? 'chevron-down' : 'chevron-right'} size={16} color={isDarkMode ? '#007AFF' : '#007AFF'} />
                        </TouchableOpacity>
                        {isActionsVisible && (
                            <View style={styles.cardContent}>
                                {/* Botones de acción */}
                                {renderActionButton('Recibos', 'RecibosUsuarioScreen', 'file-text')}
                                {renderActionButton('Llamadas', 'LlamadasUsuarioScreen', 'phone')}
                                {renderActionButton('SMS', 'SmsUsuarioScreen', 'envelope')}
                                {renderActionButton('WhatsApp', 'WhatsappUsuarioScreen', 'whatsapp')}
                                {renderActionButton('Cortes de Servicio', 'CortesUsuarioScreen', 'power-off')}
                                {renderActionButton('Reconexiones de Servicio', 'ReconexionesUsuarioScreen', 'plug')}
                            </View>
                        )}
                    </View>

                    {/* Password Modal */}
                    <Modal
                        visible={passwordModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setPasswordModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Contraseña Actual"
                                        secureTextEntry={!showCurrentPassword}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                        style={styles.togglePasswordButton}
                                    >
                                        <Text style={styles.togglePasswordText}>
                                            {showCurrentPassword ? '👁️' : '🔒'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nueva Contraseña"
                                        secureTextEntry={!showNewPassword}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                        style={styles.togglePasswordButton}
                                    >
                                        <Text style={styles.togglePasswordText}>
                                            {showNewPassword ? '👁️' : '🔒'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirmar Nueva Contraseña"
                                        secureTextEntry={!showConfirmPassword}
                                        value={confirmNewPassword}
                                        onChangeText={setConfirmNewPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.togglePasswordButton}
                                    >
                                        <Text style={styles.togglePasswordText}>
                                            {showConfirmPassword ? '👁️' : '🔒'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.modalButtonRow}>
                                    <TouchableOpacity
                                        style={styles.modalButton('#2196F3')}
                                        onPress={handlePasswordChange}
                                    >
                                        <Text style={styles.modalButtonText}>Guardar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalButton('#FF5722')}
                                        onPress={() => setPasswordModalVisible(false)}
                                    >
                                        <Text style={styles.modalButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>






                    {/* Edit User Modal */}
                    <Modal
                        visible={editModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setEditModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Editar Usuario</Text>
                                <ScrollView style={styles.scrollContainer}>
                                    {/* Debug: Log del estado actual */}
                                    {console.log('🔍 Estado editUserData en render:', JSON.stringify(editUserData, null, 2))}
                                    
                                    {/* Campos de Texto */}

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Usuario"
                                        placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                        value={editUserData.usuario || ''}
                                        onChangeText={(text) => handleInputChange('usuario', text)}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nombre"
                                        placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                        value={editUserData.nombre || ''}
                                        onChangeText={(text) => handleInputChange('nombre', text)}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Apellido"
                                        placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                        value={editUserData.apellido || ''}
                                        onChangeText={(text) => handleInputChange('apellido', text)}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Teléfono 1"
                                        placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                        value={editUserData.telefono1 || ''}
                                        onChangeText={(text) => handleInputChange('telefono1', text)}
                                        keyboardType="phone-pad"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Teléfono 2"
                                        placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                        value={editUserData.telefono2 || ''}
                                        onChangeText={(text) => handleInputChange('telefono2', text)}
                                        keyboardType="phone-pad"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                        value={editUserData.email || ''}
                                        onChangeText={(text) => handleInputChange('email', text)}
                                        keyboardType="email-address"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Dirección"
                                        placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                        value={editUserData.direccion || ''}
                                        onChangeText={(text) => handleInputChange('direccion', text)}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Cédula"
                                        placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                                        value={editUserData.cedula || ''}
                                        onChangeText={(text) => handleInputChange('cedula', text)}
                                        keyboardType="numeric"
                                    />
                                
                                </ScrollView>

                                {/* Botones */}
                                <View style={styles.modalButtonRow}>
                                    <TouchableOpacity
                                        style={styles.modalButton('#2196F3')}
                                        onPress={handleEditUser}
                                    >
                                        <Text style={styles.modalButtonText}>Guardar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalButton('#FF5722')}
                                        onPress={() => setEditModalVisible(false)}
                                    >
                                        <Text style={styles.modalButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>









                    {/* Confirm Password Modal */}
                    <Modal
                        visible={confirmPasswordModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setConfirmPasswordModalVisible(false)}
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={[styles.modalContainer, { justifyContent: 'center', alignItems: 'center' }]}
                        >
                            <View
                                style={[
                                    styles.modalContent,
                                    {
                                        width: '90%', // Aumenta el ancho del modal
                                        padding: 20,
                                        borderRadius: 15,
                                        backgroundColor: '#fff',
                                    },
                                ]}
                            >
                                <Text style={[styles.modalTitle, { textAlign: 'center', fontSize: 18 }]}>
                                    Confirmar Contraseña
                                </Text>

                                {/* Contenedor del campo de texto */}
                                <View style={{ marginTop: 15, position: 'relative' }}>
                                    <TextInput
                                        style={{
                                            height: 40, // Reduce la altura del campo de texto
                                            borderWidth: 1,
                                            borderColor: '#ccc',
                                            borderRadius: 8,
                                            paddingHorizontal: 10,
                                            backgroundColor: '#f9f9f9',
                                            color: '#000',
                                        }}
                                        placeholder="Contraseña"
                                        secureTextEntry={hidePassword}
                                        value={enteredPassword}
                                        onChangeText={(text) => setEnteredPassword(text)}
                                        placeholderTextColor="#888"
                                    />
                                    <TouchableOpacity
                                        style={{
                                            position: 'absolute',
                                            right: 10,
                                            top: 8,
                                        }}
                                        onPress={() => setHidePassword(!hidePassword)}
                                    >
                                        <Text style={{ fontSize: 16 }}>
                                            {hidePassword ? '👁️' : '🔒'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.modalButtonRow, { marginTop: 20 }]}>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: '#2196F3',
                                            borderRadius: 8,
                                            padding: 12,
                                            width: '45%',
                                            alignItems: 'center',
                                        }}
                                        onPress={validatePassword}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 16 }}>Confirmar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: '#FF5722',
                                            borderRadius: 8,
                                            padding: 12,
                                            width: '45%',
                                            alignItems: 'center',
                                        }}
                                        onPress={() => setConfirmPasswordModalVisible(false)}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 16 }}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </Modal>

                    {/* Modal para agregar método de pago */}
                    <Modal
                        visible={addPaymentModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setAddPaymentModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Agregar Método de Pago</Text>
                                <ScrollView style={styles.scrollContainer}>
                                    {/* Tipo de método de pago */}
                                    <Text style={styles.inputLabel}>Tipo de Método:</Text>
                                    <View style={styles.radioContainer}>
                                            <TouchableOpacity
                                                style={[styles.radioButton, newPaymentMethod.tipo === 'tarjeta' && styles.radioButtonSelected]}
                                                onPress={() => setNewPaymentMethod(prev => ({ ...prev, tipo: 'tarjeta' }))}
                                            >
                                                <Text style={styles.radioButtonText}>Tarjeta</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.radioButton, newPaymentMethod.tipo === 'cuenta' && styles.radioButtonSelected]}
                                                onPress={() => setNewPaymentMethod(prev => ({ ...prev, tipo: 'cuenta' }))}
                                            >
                                                <Text style={styles.radioButtonText}>Cuenta Bancaria</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.radioButton, newPaymentMethod.tipo === 'paypal' && styles.radioButtonSelected]}
                                                onPress={() => setNewPaymentMethod(prev => ({ ...prev, tipo: 'paypal' }))}
                                            >
                                                <Text style={styles.radioButtonText}>PayPal</Text>
                                            </TouchableOpacity>
                                        </View>

                                    <FloatingLabelInput
                                        label="Nombre del método"
                                        value={newPaymentMethod.nombre}
                                        onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, nombre: text }))}
                                        isDarkMode={isDarkMode}
                                    />

                                    {newPaymentMethod.tipo === 'paypal' ? (
                                        <FloatingLabelInput
                                            label="Email de PayPal"
                                            value={newPaymentMethod.email_paypal}
                                            onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, email_paypal: text }))}
                                            keyboardType="email-address"
                                            isDarkMode={isDarkMode}
                                        />
                                    ) : (
                                        <>
                                            <FloatingLabelInput
                                                label={newPaymentMethod.tipo === 'tarjeta' ? 'Número de tarjeta' : 'Número de cuenta'}
                                                value={newPaymentMethod.numero}
                                                onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, numero: text }))}
                                                keyboardType="numeric"
                                                isDarkMode={isDarkMode}
                                            />

                                            <FloatingLabelInput
                                                label="Titular"
                                                value={newPaymentMethod.titular}
                                                onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, titular: text }))}
                                                isDarkMode={isDarkMode}
                                            />
                                        </>
                                    )}

                                    {newPaymentMethod.tipo === 'tarjeta' && (
                                        <>
                                            <FloatingLabelInput
                                                label="Vencimiento (MM/AA)"
                                                value={newPaymentMethod.vencimiento}
                                                onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, vencimiento: text }))}
                                                keyboardType="numeric"
                                                isDarkMode={isDarkMode}
                                            />
                                            <FloatingLabelInput
                                                label="CVV"
                                                value={newPaymentMethod.cvv}
                                                onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, cvv: text }))}
                                                keyboardType="numeric"
                                                secureTextEntry={true}
                                                isDarkMode={isDarkMode}
                                            />
                                        </>
                                    )}

                                    {newPaymentMethod.tipo === 'cuenta' && (
                                        <FloatingLabelInput
                                            label="Banco"
                                            value={newPaymentMethod.banco}
                                            onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, banco: text }))}
                                            isDarkMode={isDarkMode}
                                        />
                                    )}

                                    <View style={styles.switchContainer}>
                                        <Text style={styles.switchLabel}>Activo:</Text>
                                        <Switch
                                            value={newPaymentMethod.activo}
                                            onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, activo: value }))}
                                        />
                                    </View>
                                </ScrollView>

                                <View style={styles.modalButtonRow}>
                                    <TouchableOpacity
                                        style={styles.modalButton('#4CAF50')}
                                        onPress={handleAddPaymentMethod}
                                    >
                                        <Text style={styles.modalButtonText}>Agregar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalButton('#FF5722')}
                                        onPress={() => setAddPaymentModalVisible(false)}
                                    >
                                        <Text style={styles.modalButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Modal para editar método de pago */}
                    <Modal
                        visible={editPaymentModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setEditPaymentModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Editar Método de Pago</Text>
                                <ScrollView style={styles.scrollContainer}>
                                    {/* Tipo de método de pago */}
                                    <Text style={styles.inputLabel}>Tipo de Método:</Text>
                                    <View style={styles.radioContainer}>
                                            <TouchableOpacity
                                                style={[styles.radioButton, newPaymentMethod.tipo === 'tarjeta' && styles.radioButtonSelected]}
                                                onPress={() => setNewPaymentMethod(prev => ({ ...prev, tipo: 'tarjeta' }))}
                                            >
                                                <Text style={styles.radioButtonText}>Tarjeta</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.radioButton, newPaymentMethod.tipo === 'cuenta' && styles.radioButtonSelected]}
                                                onPress={() => setNewPaymentMethod(prev => ({ ...prev, tipo: 'cuenta' }))}
                                            >
                                                <Text style={styles.radioButtonText}>Cuenta Bancaria</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.radioButton, newPaymentMethod.tipo === 'paypal' && styles.radioButtonSelected]}
                                                onPress={() => setNewPaymentMethod(prev => ({ ...prev, tipo: 'paypal' }))}
                                            >
                                                <Text style={styles.radioButtonText}>PayPal</Text>
                                            </TouchableOpacity>
                                        </View>

                                    <FloatingLabelInput
                                        label="Nombre del método"
                                        value={newPaymentMethod.nombre}
                                        onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, nombre: text }))}
                                        isDarkMode={isDarkMode}
                                    />

                                    {newPaymentMethod.tipo === 'paypal' ? (
                                        <FloatingLabelInput
                                            label="Email de PayPal"
                                            value={newPaymentMethod.email_paypal}
                                            onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, email_paypal: text }))}
                                            keyboardType="email-address"
                                            isDarkMode={isDarkMode}
                                        />
                                    ) : (
                                        <>
                                            <FloatingLabelInput
                                                label={newPaymentMethod.tipo === 'tarjeta' ? 'Número de tarjeta' : 'Número de cuenta'}
                                                value={newPaymentMethod.numero}
                                                onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, numero: text }))}
                                                keyboardType="numeric"
                                                isDarkMode={isDarkMode}
                                            />

                                            <FloatingLabelInput
                                                label="Titular"
                                                value={newPaymentMethod.titular}
                                                onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, titular: text }))}
                                                isDarkMode={isDarkMode}
                                            />
                                        </>
                                    )}

                                    {newPaymentMethod.tipo === 'tarjeta' && (
                                        <>
                                            <FloatingLabelInput
                                                label="Vencimiento (MM/AA)"
                                                value={newPaymentMethod.vencimiento}
                                                onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, vencimiento: text }))}
                                                keyboardType="numeric"
                                                isDarkMode={isDarkMode}
                                            />
                                            <FloatingLabelInput
                                                label="CVV"
                                                value={newPaymentMethod.cvv}
                                                onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, cvv: text }))}
                                                keyboardType="numeric"
                                                secureTextEntry={true}
                                                isDarkMode={isDarkMode}
                                            />
                                        </>
                                    )}

                                    {newPaymentMethod.tipo === 'cuenta' && (
                                        <FloatingLabelInput
                                            label="Banco"
                                            value={newPaymentMethod.banco}
                                            onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, banco: text }))}
                                            isDarkMode={isDarkMode}
                                        />
                                    )}

                                    <View style={styles.switchContainer}>
                                        <Text style={styles.switchLabel}>Activo:</Text>
                                        <Switch
                                            value={newPaymentMethod.activo}
                                            onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, activo: value }))}
                                        />
                                    </View>
                                </ScrollView>

                                <View style={styles.modalButtonRow}>
                                    <TouchableOpacity
                                        style={styles.modalButton('#2196F3')}
                                        onPress={handleEditPaymentMethod}
                                    >
                                        <Text style={styles.modalButtonText}>Guardar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalButton('#FF5722')}
                                        onPress={() => setEditPaymentModalVisible(false)}
                                    >
                                        <Text style={styles.modalButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                </View>
            }
        />
    );
};

export default UsuarioDetalleScreen;
