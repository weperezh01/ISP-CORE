import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    Button,
    Alert,
    Modal,
    TextInput as NativeTextInput
} from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import getStyles from './AssignmentsStyle';
// import getStyles from './ConexionesScreenStyle';
import HorizontalMenu from '../../../componentes/HorizontalMenu';
import MenuModal from '../../../componentes/MenuModal';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AssignmentsScreen = ({ route, navigation }) => {
    const { isp, usuarioId, id_isp, permisos } = route.params;
    const [assignments, setAssignments] = useState([]);
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);
    const [menuVisible, setMenuVisible] = React.useState(false);
    const [tecnicoModalVisible, setTecnicoModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // Inicializa ambos estados para técnicos
    const [tecnicos, setTecnicos] = useState([]);
    const [filteredTecnicos, setFilteredTecnicos] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null); // Guarda la asignación seleccionada
    const [filtersModalVisible, setFiltersModalVisible] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [selectedOrderType, setSelectedOrderType] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedStates, setSelectedStates] = useState([]);
    const [orderTypes, setOrderTypes] = useState([]);
    const [selectedTechnicians, setSelectedTechnicians] = useState([]);
    const [selectedOrderTypes, setSelectedOrderTypes] = useState([]);
    // const [selectedStates, setSelectedStates] = useState([]);
    const [usuario, setUsuario] = useState({});

    // Debe coincidir id_permiso:4, id_permiso_sub:44 y estado_permiso:Y


    // console.log('params:', route.params);
    // console.log('ISP:', isp);
    // console.log('Usuario ID:', usuarioId);
    // console.log('I S P:', isp.);
    console.log('Fecha y hora actual:', new Date().toLocaleString());
    console.log('Permisos:', JSON.stringify(permisos, null, 2));

    let conteo = 0;


    // useEffect para obtener los datos del usuario cuando se cargue la pantalla
    // Quita completamente la lógica de forzar assignments aquí. 
    // Úsalo solo para gatillar applyFilters una vez al tener los datos.
    // (1) Efecto que sólo se llama UNA VEZ al montar el componente y llama a obtenerDatosUsuario.
    useEffect(() => {
        obtenerDatosUsuario();
    }, []);

    // (2) Efecto que depende de que tengamos usuario y assignments,
    //     y que se dispare cada vez que se actualicen, para aplicar el filtro.
    useEffect(() => {
        if (!usuario?.nivel_usuario) return;
        if (originalAssignments.length === 0) return;

        applyFilters(false);
    }, [usuario, originalAssignments]);

    // Handle logout
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

    // Función para obtener los datos del usuario
    const obtenerDatosUsuario = async () => {
        try {
            const response = await axios.post('https://wellnet-rd.com/api/usuarios/datos-usuario', { id: usuarioId });
            const { usuario, permisos } = response.data;
            // console.log('Datos del usuario:', usuario);
            setUsuario(response.data.usuario);
            // console.log('Fecha y hora actual:', new Date().toLocaleString());
            // console.log('Datos del usuario en formato JSON:', JSON.stringify(usuario, null, 2));
            // console.log('Permisos del usuario:', permisos);
            // console.log('Permisos del usuario en formato JSON:', JSON.stringify(permisos, null, 2));
            // Aquí puedes actualizar el estado con los datos del usuario y permisos

            // Después de obtener los datos del usuario, realizar las demás consultas
            fetchAssignments(usuario.id_isp);
            fetchTecnicos(usuario.id_isp);
            fetchOrderTypes(usuario.id_isp).then((data) => {
                setOrderTypes(data); // Actualiza el estado con los tipos de órdenes
            });
        } catch (error) {
            console.error('Error al obtener los datos del usuario:', error);
        }
    };



    // useEffect para obtener los datos del usuario cuando se cargue la pantalla
    // useEffect(() => {
    //     obtenerDatosUsuario();
    //     // Solo si ya tenemos usuario y sus asignaciones
    //     if (!usuario?.nivel_usuario || originalAssignments.length === 0) return;

    //     // Si es operador, filtra directamente
    //     if (usuario.nivel_usuario === 'OPERADOR') {
    //         // Filtra sólo órdenes asignadas a él
    //         const filtered = originalAssignments.filter(
    //             (assignment) => assignment.id_tecnico === usuario.id
    //         );
    //         setAssignments(filtered);
    //         // Ajustamos `selectedTechnicians` si quieres que en el modal ya aparezca marcado
    //         setSelectedTechnicians([usuario.id]);
    //     } else {
    //         // Caso contrario (ADMIN, MEGA, etc.) muestra todas
    //         setAssignments(originalAssignments);
    //     }
    // }, [usuario, originalAssignments]);





    // Modificar las funciones fetchAssignments, fetchTecnicos y fetchOrderTypes para aceptar idIsp como parámetro
    const fetchAssignments = async (idIsp) => {
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/ordenes/${idIsp}`);
            const data = await response.json();
            // Solo guardamos las órdenes originales, sin tocar "assignments"
            setOriginalAssignments(data.assignments || []);
        } catch (error) {
            console.error('Error al cargar asignaciones:', error);
        }
    };

    const fetchTecnicos = async (idIsp) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ispId: idIsp }),
            });

            const responseData = await response.json();
            if (!response.ok) {
                console.error('Error en el servidor:', responseData.error);
                Alert.alert('Error', responseData.error || 'Error al obtener la lista de técnicos.');
            } else {
                setTecnicos(responseData || []);
                setFilteredTecnicos(responseData || []); // Inicializa la lista filtrada
            }
        } catch (error) {
            console.error('Error al cargar los técnicos:', error);
            Alert.alert('Error', 'Hubo un problema al cargar los técnicos.');
        }
    };

    const fetchOrderTypes = async (idIsp: any) => {
        console.log('Fecha y hora actual:', new Date().toLocaleString());
        console.log('Entro a la función fetchOrderTypes');
        console.log('ID ISP:', idIsp);
        try {
            const response = await fetch(
                `https://wellnet-rd.com/api/order-types?id_isp=${idIsp}`
            ); // URL de la API, ajusta el dominio
            const data = await response.json();

            if (!response.ok) {
                // console.error('Error al obtener tipos de órdenes:', data.error);
                return [];
            }

            return data; // Devuelve los tipos de órdenes
        } catch (error) {
            console.error('Error al cargar los tipos de órdenes:', error);
            return [];
        }
    };
    // useEffect(() => {
    //     // console.log('Assignments:', JSON.stringify(assignments, null, 2));
    //     // console.log('Tecnicos:', JSON.stringify(tecnicos, null, 2));
    //     // console.log('Order Types:', JSON.stringify(orderTypes, null, 2));
    // }, [assignments, tecnicos, orderTypes]);



    // const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedConnection, setSelectedConnection] = useState([]);

    const toggleCheckbox = (item) => {
        if (selectedStatus.includes(item)) {
            setSelectedStatus(selectedStatus.filter((status) => status !== item));
        } else {
            setSelectedStatus([...selectedStatus, item]);
        }
    };

    const toggleStateFilter = (estado) => {
        if (selectedStates.includes(estado)) {
            setSelectedStates(selectedStates.filter((item) => item !== estado));
        } else {
            setSelectedStates([...selectedStates, estado]);
        }
    };

    const toggleSelection = (listName, id) => {
        let currentList;
        let setList;

        if (listName === 'selectedTechnicians') {
            currentList = selectedTechnicians;
            setList = setSelectedTechnicians;
        } else if (listName === 'selectedOrderTypes') {
            currentList = selectedOrderTypes;
            setList = setSelectedOrderTypes;
        } else if (listName === 'selectedStates') {
            currentList = selectedStates;
            setList = setSelectedStates;
        }

        if (currentList.includes(id)) {
            setList(currentList.filter((item) => item !== id)); // Eliminar
        } else {
            setList([...currentList, id]); // Agregar
        }

        // console.log(`${listName} actualizado:`, currentList);
    };





    const toggleFiltersModal = () => setFiltersModalVisible(!filtersModalVisible);

    const applyFilters = (shouldCloseModal = true) => {
        // console.log('Entro a la funcion applyFilterssssssssssssssssssssssss');
        // console.log('Fecha y hora actual:', new Date().toLocaleString());
        // console.log('Técnicos seleccionados:', selectedTechnicians);
        const { nivel_usuario, id } = usuario; // Asume que 'usuario' contiene los datos del usuario
        // console.log('Nivel de usuario:', nivel_usuario);
        // console.log('ID de usuario:', id);

        let filteredAssignments = [];

        if (['ADMINISTRADOR', 'SUPER ADMINISTRADOR', 'MEGA ADMINISTRADOR'].includes(nivel_usuario)) {
            // Filtros para administradores
            filteredAssignments = originalAssignments.filter((assignment) => {
                const matchTechnicians =
                    selectedTechnicians.length > 0
                        ? selectedTechnicians.includes(assignment.id_tecnico)
                        : true;

                const matchOrderTypes =
                    selectedOrderTypes.length > 0
                        ? selectedOrderTypes.includes(assignment.id_orden_tipo)
                        : true;


                const matchStates =
                    selectedStates.length > 0
                        ? selectedStates.includes(assignment.estado)
                        : true;

                return matchTechnicians && matchOrderTypes && matchStates;
            });
        } else if (nivel_usuario === 'OPERADOR') {
            // Filtros para operadores, pero limitando a sus propias asignaciones
            filteredAssignments = originalAssignments.filter((assignment) => {
                // Primero, aseguramos que la asignación pertenezca al operador
                if (assignment.id_tecnico !== id) return false;

                const matchTechnicians =
                    selectedTechnicians.length > 0
                        ? selectedTechnicians.includes(assignment.id_tecnico)
                        : true;

                const matchOrderTypes =
                    selectedOrderTypes.length > 0
                        ? selectedOrderTypes.includes(assignment.id_orden_tipo)
                        : true;

                const matchStates =
                    selectedStates.length > 0
                        ? selectedStates.includes(assignment.estado)
                        : true;

                return matchTechnicians && matchOrderTypes && matchStates;
            });
        } else {
            // Si no es ninguno de los niveles mencionados, no filtramos o mostramos todos
            filteredAssignments = originalAssignments;
        }

        setAssignments(filteredAssignments);
        // Cierra o no cierra el modal según el flag
        if (shouldCloseModal) {
            setFiltersModalVisible(false);
        }
    };


    // Estado para controlar el modal y los campos del formulario
    const [modalVisible, setModalVisible] = useState(false);
    const [newOrder, setNewOrder] = useState({
        id_cliente: '',
        id_servicio: '',
        descripcion: '',
    });

    // Función para obtener asignaciones del backend

    const [originalAssignments, setOriginalAssignments] = useState([]);
    // const [assignments, setAssignments] = useState([]);


    // Refresca datos cuando la pantalla tiene foco
    useFocusEffect(
        useCallback(() => {
            let count = 0;
            const intervalId = setInterval(() => {
                if (count >= 1) {
                    clearInterval(intervalId);
                    return;
                }
                obtenerDatosUsuario();
                fetchOrderTypes(id_isp).then((data) => {
                    setOrderTypes(data); // Actualiza el estado con los tipos de órdenes
                });
                count++;
            }, 1500);

            return () => clearInterval(intervalId);
        }, [id_isp])
    );


    // Función para crear una nueva orden
    const handleCreateOrder = async () => {
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/ordenes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newOrder,
                    id_usuario_creador: usuarioId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Éxito', 'Orden de servicio creada correctamente.');
                setAssignments((prev) => [...prev, data]);
                setModalVisible(false);
                setNewOrder({ id_cliente: '', id_servicio: '', descripcion: '' });
            } else {
                console.error('Error al crear la orden:', data.error);
                Alert.alert('Error', 'No se pudo crear la orden de servicio.');
            }
        } catch (error) {
            console.error('Error al crear la orden de servicio:', error);
            Alert.alert('Error', 'Ocurrió un error al crear la orden de servicio.');
        }
    };

    // useEffect(() => {
    // const fetchTecnicos = async () => {
    //     try {
    //         const response = await fetch('https://wellnet-rd.com:444/api/usuarios/usuarios', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ ispId: id_isp }),
    //         });

    //         const responseData = await response.json();
    //         // console.log('Respuesta del backend (técnicos):', responseData);

    //         if (!response.ok) {
    //             console.error('Error en el servidor:', responseData.error);
    //             Alert.alert('Error', responseData.error || 'Error al obtener la lista de técnicos.');
    //         } else {
    //             setTecnicos(responseData || []);
    //             setFilteredTecnicos(responseData || []); // Inicializa la lista filtrada
    //         }
    //     } catch (error) {
    //         console.error('Error al cargar los técnicos:', error);
    //         Alert.alert('Error', 'Hubo un problema al cargar los técnicos.');
    //     }
    // };

    // fetchTecnicos();
    // }, [id_isp]);

    const actualizarTecnicoEnOrden = async (tecnicoId) => {
        if (!selectedAssignment || !selectedAssignment.id) {
            Alert.alert('Error', 'No se ha seleccionado una asignación válida.');
            return;
        }

        try {
            const tecnicoSeleccionado = tecnicos.find((tecnico) => tecnico.id === tecnicoId);
            const response = await fetch(`https://wellnet-rd.com:444/api/ordenes-tecnico/${selectedAssignment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_tecnico: tecnicoId }),
            });

            const data = await response.json();

            if (response.ok) {
                // Alert.alert('Éxito', 'Técnico actualizado correctamente en la orden de servicio.');

                // Actualiza assignments con el nuevo técnico
                setAssignments((prevAssignments) =>
                    prevAssignments.map((assignment) =>
                        assignment.id === selectedAssignment.id
                            ? {
                                ...assignment,
                                id_tecnico: tecnicoId,
                                tecnico_nombre: tecnicoSeleccionado ? tecnicoSeleccionado.nombre : 'Sin técnico',
                            }
                            : assignment
                    )
                );
            } else {
                console.error('Error al actualizar el técnico:', data.error);
                Alert.alert('Error', data.message || 'No se pudo actualizar el técnico.');
            }
        } catch (error) {
            console.error('Error al actualizar el técnico:', error);
            Alert.alert('Error', 'Ocurrió un error al actualizar el técnico.');
        } finally {
            setTecnicoModalVisible(false); // Cierra el modal
        }
    };

    const formatFechaRD = (fechaISO) => {
        try {
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true, // Para formato AM/PM
                timeZone: 'America/Santo_Domingo', // Zona horaria de República Dominicana
            };

            const formatter = new Intl.DateTimeFormat('es-ES', options);
            return formatter.format(new Date(fechaISO));
        } catch (error) {
            console.error('Error al formatear la fecha:', error);
            return 'Fecha no válida';
        }
    };

    const calculateDays = (fechaISO) => {
        if (!fechaISO) return 0;

        try {
            const fechaCreacion = new Date(fechaISO);
            const fechaHoy = new Date();

            // Asegúrate de usar la misma zona horaria
            const fechaCreacionUTC = new Date(
                fechaCreacion.getUTCFullYear(),
                fechaCreacion.getUTCMonth(),
                fechaCreacion.getUTCDate()
            );
            const fechaHoyUTC = new Date(
                fechaHoy.getUTCFullYear(),
                fechaHoy.getUTCMonth(),
                fechaHoy.getUTCDate()
            );

            // Calcular la diferencia en milisegundos y convertir a días
            const diffMs = fechaHoyUTC - fechaCreacionUTC;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            console.error('Error al calcular los días:', error);
            return 0;
        }
    };

    const getEstadoStyles = (estado, isDarkMode) => {
        let color = '';
        let fontWeight = 'normal';

        switch (estado) {
            case 'completado':
                color = isDarkMode ? '#0F0' : '#080'; // Verde para "completado"
                fontWeight = 'bold'; // Negrita para "completado"
                break;
            case 'en progreso':
                color = isDarkMode ? '#FF0' : '#880'; // Amarillo para "en progreso"
                fontWeight = 'normal'; // Normal para "en progreso"
                break;
            case 'cancelado':
                color = isDarkMode ? '#F00' : '#800'; // Rojo para "cancelado"
                fontWeight = 'normal'; // Normal para "cancelado"
                break;
            default:
                color = isDarkMode ? '#CCC' : '#555'; // Gris para otros estados
                fontWeight = 'normal'; // Normal para otros estados
                break;
        }

        return { color, fontWeight };
    };


    // Función para renderizar cada asignación
    const renderAssignment = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.itemContainer,
                { backgroundColor: isDarkMode ? '#444' : '#EEE' },
            ]}
            onPress={() => navigation.navigate('ExistingServiceOrderScreen', {
                assignment: item,
                isp,
                usuarioId,
                permisos,
            })}

            onLongPress={() => {
                setSelectedAssignment(item); // Guarda la asignación seleccionada
                setTecnicoModalVisible(true); // Abre el modal
            }}
        >
            <Text style={[styles.itemText, { color: isDarkMode ? '#FFF' : '#000' }]}>
                Orden ID: {item.id || 'Sin ID'}
            </Text>
            <Text
                style={[
                    styles.itemText,
                    {
                        color: isDarkMode ? '#FFF' : '#000',
                        fontSize: 18,
                        fontWeight: 'bold',
                    },
                ]}
            >
                {item.id_orden_tipo || 'Sin ID Tipo de Orden'} - {item.tipo_orden_nombre || 'Sin tipo de orden'}
            </Text>



            <Text style={[styles.itemText, { color: isDarkMode ? '#FFF' : '#000' }]}>
                Desde: {formatFechaRD(item.fecha_creacion) || 'Sin Fecha'}
            </Text>

            <Text style={[styles.itemText, { color: isDarkMode ? '#FFF' : '#000' }]}>
                Cliente ID: {item.id_cliente || 'Sin ID'} {item.cliente_nombre || 'Sin nombre'}
            </Text>
            <Text style={[styles.itemText, { color: isDarkMode ? '#FFF' : '#000' }]}>
                Conex ID: {item.id_conexion || 'Sin nombre'} - {item.conexion_direccion || 'Sin dirección'}
            </Text>
            <Text style={[styles.itemText, { color: isDarkMode ? '#CCC' : '#555' }]}>
                Descripción: {item.descripcion || 'Sin descripción'}
            </Text>


            <Text
                style={[
                    styles.itemText,
                    {
                        color:
                            item.estado === 'completado'
                                ? (isDarkMode ? '#0F0' : '#080')
                                : item.estado === 'en progreso'
                                    ? (isDarkMode ? '#FF0' : '#880')
                                    : item.estado === 'cancelado'
                                        ? (isDarkMode ? '#F00' : '#800')
                                        : (isDarkMode ? '#CCC' : '#555'),
                        fontWeight: item.estado === 'completado' ? 'bold' : 'normal',
                    },
                ]}
            >
                Estado: {item.estado || 'Sin estado'} -
                {item.estado !== 'completado' && (
                    <>
                        - {calculateDays(item.fecha_creacion)} {calculateDays(item.fecha_creacion) === 1 ? 'día' : 'días'}
                    </>
                )}
            </Text>

            <Text style={[styles.itemText, { color: isDarkMode ? '#FFF' : '#000' }]}>
                Desde: {formatFechaRD(item.fecha_actualizacion) || 'Sin Fecha'}
            </Text>

            <View style={styles.progressBarContainer}>
                {item.estado === 'cancelado' ? (
                    <View style={styles.cancelledPoint}>
                        <Text style={styles.cancelledText}>X</Text>
                    </View>
                ) : (
                    <View style={styles.progressBar}>
                        {/* Barra que conecta los puntos */}
                        <View style={styles.progressLine}>
                            <View
                                style={[
                                    styles.filledLine,
                                    {
                                        width: item.estado === 'completado'
                                            ? '100%'
                                            : item.estado === 'en progreso'
                                                ? '50%'
                                                : '0%', // Relleno progresivo
                                    },
                                ]}
                            />
                        </View>

                        {/* Puntos */}
                        {[30, 60, 90].map((_, index) => {
                            const { color } = getEstadoStyles(
                                item.estado === 'completado' && index <= 2
                                    ? 'completado'
                                    : item.estado === 'en progreso' && index <= 1
                                        ? 'en progreso'
                                        : index === 0
                                            ? 'pendiente'
                                            : 'default',
                                isDarkMode
                            );

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.progressPoint,
                                        {
                                            backgroundColor: color,
                                        },
                                    ]}
                                />
                            );
                        })}
                    </View>
                )}
            </View>






            <View
                style={[
                    {
                        padding: 10, // Espaciado interno
                        borderRadius: 8, // Esquinas redondeadas
                        marginVertical: 5, // Separación entre elementos
                        backgroundColor: item.id_tecnico
                            ? (isDarkMode ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 128, 0, 0.2)') // Fondo verde opaco si tiene técnico
                            : (isDarkMode ? 'rgba(255, 0, 0, 0.2)' : 'rgba(128, 0, 0, 0.2)'), // Fondo rojo opaco si no tiene técnico
                    },
                ]}
            >
                <Text
                    style={[
                        styles.itemText,
                        {
                            color: item.id_tecnico ? (isDarkMode ? '#0F0' : '#080') : (isDarkMode ? '#F00' : '#800'), // Color condicional
                            fontWeight: item.id_tecnico ? 'bold' : 'normal', // Texto en negrita si tiene técnico
                            fontStyle: item.id_tecnico ? 'normal' : 'italic', // Texto en cursiva si no tiene técnico
                        },
                    ]}
                >
                    Técnico: {item.id_tecnico ? `${item.tecnico_nombre}` : 'Sin técnico asignado'}
                </Text>
            </View>


        </TouchableOpacity>
    );

    // 1) Saca la lista de permisos
    // Lo más seguro es que tengas permisos.permisos
    // (es decir, un array dentro de la propiedad "permisos")
    const permisosArray = permisos?.permisos || [];

    // 2) Verifica si al menos uno de los objetos en ese array
    // cumple con id_permiso=4, id_permiso_sub=44, estado_permiso='Y'
    const hasNewOrderPermission = permisosArray.some(
        (perm) =>
            perm.id_permiso === 4 &&
            perm.id_permiso_sub === 44 &&
            perm.estado_permiso === 'Y'
    );

    // 3) Construye el array de botones y solo agrega el de "Nueva Orden"
    // cuando hasNewOrderPermission sea verdadero:
    const botones = [
        { id: '6', action: () => setMenuVisible(true), icon: 'bars' },

        ...(hasNewOrderPermission
            ? [
                {
                    id: '1',
                    title: 'Nueva Orden de Servicio',
                    screen: 'NewServiceOrderScreen',
                    icon: 'plus',
                    params: { isp, usuarioId },
                },
            ]
            : []),

        // Mostrar el botón de filtro solo si el usuario no es operador
        ...(usuario.nivel_usuario !== 'OPERADOR'
            ? [
                {
                    id: '5',
                    title: 'Filtro',
                    icon: 'filter',
                    action: () => setFiltersModalVisible(true),
                },
            ]
            : []),

        {
            id: '2',
            title: 'Tipos de Orden',
            screen: 'OrderTypesScreen',
            icon: 'file-text',
            params: { id_isp: usuario.id_isp, usuarioId, permisos },
        },
        {
            id: '4',
            title: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
            icon: isDarkMode ? 'sun-o' : 'moon-o',
            action: toggleTheme,
        },
    ];


    return (
        <>
            <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
                <Text style={[styles.title, styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>Asignaciones</Text>
                <FlatList
                    data={assignments}
                    keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
                    renderItem={renderAssignment}
                    contentContainerStyle={styles.flatListContentContainer}
                    ListEmptyComponent={
                        <Text style={[styles.noDataText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                            No hay asignaciones disponibles.
                        </Text>
                    }
                />

            </View>


            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />

            {/* Modal para menú de opciones */}
            <MenuModal
                visible={menuVisible}
                onClose={() => { setMenuVisible(false); }}
                menuItems={[
                    { title: isp.nombreUsuario, action: () => navigation.navigate('UsuarioDetalleScreen', { ispId: isp.id_isp, userId: usuarioId }) },
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

            {/* Modal para seleccionar técnico */}
            {/* Modal para seleccionar técnico */}
            <Modal
                visible={tecnicoModalVisible}
                animationType="slide"
                onRequestClose={() => setTecnicoModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Seleccionar Técnico</Text>

                    {/* Barra de búsqueda */}
                    <NativeTextInput
                        style={styles.searchInput}
                        placeholder="Buscar técnico por nombre o email"
                        placeholderTextColor={isDarkMode ? '#888' : '#777'}
                        value={searchQuery}
                        onChangeText={(query) => {
                            setSearchQuery(query);
                            if (query.trim() === '') {
                                setFilteredTecnicos(tecnicos);
                            } else {
                                const filtered = tecnicos.filter((tecnico) =>
                                    tecnico.nombre.toLowerCase().includes(query.toLowerCase()) ||
                                    tecnico.email.toLowerCase().includes(query.toLowerCase())
                                );
                                setFilteredTecnicos(filtered);
                            }
                        }}
                    />

                    {/* Lista de técnicos con la opción "Sin asignación" */}
                    <FlatList
                        data={[{ id: null, nombre: 'Sin asignación', email: '' }, ...filteredTecnicos]} // Agregar opción adicional
                        keyExtractor={(item, index) => (item.id !== null ? item.id.toString() : `null-${index}`)}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    actualizarTecnicoEnOrden(item.id); // Enviar null si es "Sin asignación"
                                }}
                            >
                                <Text style={styles.modalItemText}>
                                    {item.nombre} {item.apellido || ''} - {item.email || ''}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity
                        onPress={() => setTecnicoModalVisible(false)}
                        style={styles.modalCloseButton}
                    >
                        <Text style={styles.modalCloseButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>


            {/* Modal para filtros */}
            <Modal
                visible={filtersModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={toggleFiltersModal}
            >
                {/* Overlay oscuro */}
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Filtros</Text>

                        {/* Contenedor de la lista con scroll limitado */}
                        <View style={{ maxHeight: 400 /* o 50% o lo que quieras */ }}>
                            <FlatList
                                data={[
                                    { type: 'title', text: 'Selecciona Técnico:' },
                                    ...tecnicos.map((tecnico) => ({
                                        type: 'technician',
                                        id: tecnico.id,
                                        nombre: tecnico.nombre,
                                    })),
                                    { type: 'title', text: 'Selecciona Tipo de Orden:' },
                                    ...orderTypes.map((orderType) => ({
                                        type: 'orderType',
                                        id: orderType.id_orden_tipo,
                                        nombre: orderType.orden_nombre,
                                    })),
                                    { type: 'title', text: 'Selecciona Estado:' },
                                    ...['pendiente', 'en progreso', 'completado', 'cancelado'].map(
                                        (estado) => ({
                                            type: 'status',
                                            id: estado,
                                            nombre: estado.charAt(0).toUpperCase() + estado.slice(1),
                                        })
                                    ),
                                ]}
                                keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
                                renderItem={({ item }) => {
                                    if (item.type === 'title') {
                                        return <Text style={styles.modalSubTitle}>{item.text}</Text>;
                                    }

                                    if (item.type === 'technician') {
                                        return (
                                            <TouchableOpacity
                                                style={styles.filterOption}
                                                onPress={() => toggleSelection('selectedTechnicians', item.id)}
                                            >
                                                <View style={styles.checkboxRow}>
                                                    <View
                                                        style={[
                                                            styles.checkbox,
                                                            selectedTechnicians.includes(item.id) && styles.checkboxSelected,
                                                        ]}
                                                    >
                                                        {selectedTechnicians.includes(item.id) && (
                                                            <Text style={styles.checkboxCheck}>✔</Text>
                                                        )}
                                                    </View>
                                                    <Text style={styles.filterOptionText}>{item.nombre}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }

                                    if (item.type === 'orderType') {
                                        return (
                                            <TouchableOpacity
                                                style={styles.filterOption}
                                                onPress={() => toggleSelection('selectedOrderTypes', item.id)}
                                            >
                                                <View style={styles.checkboxRow}>
                                                    <View
                                                        style={[
                                                            styles.checkbox,
                                                            selectedOrderTypes.includes(item.id) && styles.checkboxSelected,
                                                        ]}
                                                    >
                                                        {selectedOrderTypes.includes(item.id) && (
                                                            <Text style={styles.checkboxCheck}>✔</Text>
                                                        )}
                                                    </View>
                                                    <Text style={styles.filterOptionText}>{item.nombre}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }

                                    if (item.type === 'status') {
                                        return (
                                            <TouchableOpacity
                                                style={styles.filterOption}
                                                onPress={() => toggleSelection('selectedStates', item.id)}
                                            >
                                                <View style={styles.checkboxRow}>
                                                    <View
                                                        style={[
                                                            styles.checkbox,
                                                            selectedStates.includes(item.id) && styles.checkboxSelected,
                                                        ]}
                                                    >
                                                        {selectedStates.includes(item.id) && (
                                                            <Text style={styles.checkboxCheck}>✔</Text>
                                                        )}
                                                    </View>
                                                    <Text style={styles.filterOptionText}>{item.nombre}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }

                                    return null;
                                }}
                            />
                        </View>

                        {/* Botones fuera de la lista */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                            <TouchableOpacity onPress={() => applyFilters(true)} style={[styles.modalButton, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.modalButtonText}>Aplicar Filtros</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={toggleFiltersModal} style={[styles.modalButton, { flex: 1, backgroundColor: '#e74c3c', marginLeft: 10 }]}>
                                <Text style={styles.modalButtonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* style={styles.modalButton}  */}
            {/* style={[styles.modalButton, { backgroundColor: '#e74c3c' }]}     */}



        </>
    );
};

export default AssignmentsScreen;
