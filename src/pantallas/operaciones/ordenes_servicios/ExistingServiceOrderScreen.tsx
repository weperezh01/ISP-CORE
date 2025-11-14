import React, { useEffect, useState } from 'react';
import { View, Alert, FlatList, TouchableOpacity, Modal, TextInput as NativeTextInput, ScrollView } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { useTheme } from '../../../../ThemeContext';
import getStyles from './NewServiceOrderStyles';
import HorizontalMenu from '../../../componentes/HorizontalMenu';
import MenuModal from '../../../componentes/MenuModal';
import { Card } from 'react-native-paper'; // Importa Card si usas react-native-paper
import AsyncStorage from '@react-native-async-storage/async-storage';


const ExistingServiceOrderScreen = ({ route, navigation }) => {
    const { assignment, isp, usuarioId, permisos } = route.params; // Recibe los datos pasados desde AssignmentsScreen
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);

    const [form, setForm] = useState({
        idOrden: assignment.id || '',
        tipoOrden: assignment.tipo_orden_nombre || '',
        fechaOrden: assignment.fecha_creacion || '',
        fechaActOrden: assignment.fecha_actualizacion || '',
        tipoOrdenId: assignment.id_orden_tipo || '',
        descripcionGeneral: assignment.tipo_orden_descripcion || '',
        notasInstalador: assignment.notas_instalador || '',
        estadoOrden: assignment.estado || '',
        cliente: assignment.cliente_nombre || '',
        clienteTelefono: assignment.cliente_telefono || 'No especificado',
        clienteCedula: assignment.cliente_cedula || 'No especificada',
        clienteDireccion: assignment.cliente_direccion || 'No especificada',
        servicioNombre: assignment.servicio_nombre || '',
        servicioDescripcion: assignment.servicio_descripcion || '',
        servicioPrecio: assignment.servicio_precio || 'No especificado',
        servicioVelocidad: assignment.servicio_velocidad || 'No especificada',
        conexionDireccion: assignment.conexion_direccion || '',
        conexionId: assignment.id_conexion || '',
        conexionEstado: assignment.conexion_estado || 'No especificado',
        conexionVelocidadBajada: assignment.conexion_velocidad_bajada || 'No especificada',
        conexionVelocidadSubida: assignment.conexion_velocidad_subida || 'No especificada',
        tecnicoId: assignment.id_tecnico || '',
        tecnicoNombre: assignment.tecnico_nombre || '',
        tecnicoTelefono: assignment.tecnico_telefono || 'No especificado',
        tecnicoEmail: assignment.tecnico_email || 'No especificado',
        descripcion: assignment.descripcion || '',
        idCliente: assignment.id_cliente || '',
        idServicio: assignment.id_servicio || '',
    });






    const [orderTypes, setOrderTypes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]); // Lista filtrada de clientes
    const [filteredServicios, setFilteredServicios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // Texto de búsqueda
    const [selectedDescription, setSelectedDescription] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // Control del modal de clientes
    const [servicioModalVisible, setServicioModalVisible] = useState(false);
    const [conexionModalVisible, setConexionModalVisible] = useState(false); // Estado para el modal de conexiones
    const [conexiones, setConexiones] = useState([]); // Estado para las conexiones obtenidas
    const [filteredConexiones, setFilteredConexiones] = useState([]); // Estado para las conexiones filtradas
    const [tecnicos, setTecnicos] = useState([]); // Lista de técnicos
    const [filteredTecnicos, setFilteredTecnicos] = useState([]); // Lista filtrada de técnicos
    const [tecnicoModalVisible, setTecnicoModalVisible] = useState(false); // Control del modal de técnicos

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





    // Botón y modal de Conexión
    <View style={styles.orderTypeButton}>
        <Text
            style={styles.orderTypeButtonText}
            onPress={() => {
                fetchConexiones(form.idCliente, isp.id_isp, setConexiones, setFilteredConexiones); // Solicitar conexiones al abrir el modal
                setConexionModalVisible(true);
            }}
        >
            {form.conexion || 'Seleccione una conexión'}
        </Text>
    </View>

    {
        form.conexion && (
            <View style={styles.conexionDetails}>
                <Text style={styles.clientDetailsText}>
                    <Text style={styles.idexText}>Conexión:</Text> {form.conexion}
                </Text>
                <Text style={styles.clientDetailsText}>
                    <Text style={styles.idexText}>Servicio:</Text> {form.conexionServicio}
                </Text>
                <Text style={styles.clientDetailsText}>
                    <Text style={styles.idexText}>Estado:</Text> {form.conexionEstado}
                </Text>
            </View>
        )
    }



    useEffect(() => {
        console.log('Datos recibidos en detalle:', assignment);
        console.log('Datos en formato JSON:', JSON.stringify(assignment, null, 2));
    }, []);



    const handleSubmit = async () => {
        Alert.alert(
            'Confirmación',
            '¿Está seguro de que desea guardar esta orden de servicio?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const response = await fetch('https://wellnet-rd.com:444/api/ordenes', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id_tipo_servicio: form.tipoOrden,
                                    id_instalacion: null, // Si aplica, ajusta según la lógica
                                    id_conexion: form.conexion,
                                    id_cliente: form.idCliente,
                                    id_servicio: form.idServicio,
                                    id_tecnico: form.tecnicoId,
                                    id_usuario_creador: usuarioId,
                                    descripcion: form.descripcion,
                                    estado: 'pendiente', // Valor inicial de estado
                                }),
                            });

                            if (response.ok) {
                                Alert.alert('Éxito', 'La orden de servicio se creó correctamente.');
                                navigation.goBack(); // Redirige a la pantalla anterior
                            } else {
                                const error = await response.json();
                                Alert.alert('Error', error.message || 'No se pudo crear la orden.');
                            }
                        } catch (error) {
                            console.error('Error al crear la orden de servicio:', error);
                            Alert.alert('Error', 'Hubo un problema al crear la orden de servicio.');
                        }
                    },
                },
            ],
            { cancelable: true } // Permite que el usuario cierre la alerta tocando fuera de ella
        );
    };

    const handleEjecutar = () => {
        Alert.alert(
            'Confirmación',
            '¿Está seguro de que desea cambiar el estado de la orden a "en progreso"?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel', // Botón de cancelar
                },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wellnet-rd.com:444/api/ordenes-estado/${form.idOrden}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ estado: 'en progreso' }),
                            });

                            if (response.ok) {
                                Alert.alert('Éxito', 'El estado de la orden cambió a "en progreso".');
                                setForm({ ...form, estadoOrden: 'en progreso' }); // Actualiza el estado en el formulario
                            } else {
                                const error = await response.json();
                                Alert.alert('Error', error.message || 'No se pudo actualizar el estado.');
                            }
                        } catch (error) {
                            console.error('Error al cambiar el estado de la orden:', error);
                            Alert.alert('Error', 'Hubo un problema al actualizar el estado de la orden.');
                        }
                    },
                },
            ],
            { cancelable: true } // Permite que el usuario cierre la alerta tocando fuera de ella
        );
    };

    const handleCompletar = () => {
        Alert.alert(
            'Confirmación',
            '¿Está seguro de que desea cambiar el estado de la orden a "completado"?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel', // Botón de cancelar
                },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wellnet-rd.com:444/api/ordenes-estado/${form.idOrden}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ estado: 'completado' }),
                            });

                            if (response.ok) {
                                Alert.alert('Éxito', 'El estado de la orden se a "completado".');
                                navigation.goBack(); // Navega a la pantalla anterior
                            } else {
                                const error = await response.json();
                                Alert.alert('Error', error.message || 'No se pudo actualizar el estado.');
                            }
                        } catch (error) {
                            console.error('Error al cambiar el estado de la orden:', error);
                            Alert.alert('Error', 'Hubo un problema al actualizar el estado de la orden.');
                        }
                    },
                },
            ],
            { cancelable: true } // Permite que el usuario cierre la alerta tocando fuera de ella
        );
    };


    const handleCancelar = () => {
        Alert.alert(
            'Confirmación',
            '¿Está seguro de que desea cambiar el estado de la orden a "cancelado"?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel', // Botón de cancelar
                },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wellnet-rd.com:444/api/ordenes-estado/${form.idOrden}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ estado: 'cancelado' }),
                            });

                            if (response.ok) {
                                Alert.alert('Éxito', 'El estado de la orden se a "cancelado".');
                                navigation.goBack(); // Navega a la pantalla anterior
                            } else {
                                const error = await response.json();
                                Alert.alert('Error', error.message || 'No se pudo actualizar ancelado.');
                            }
                        } catch (error) {
                            console.error('Error al cambiar el estado de la orden:', error);
                            Alert.alert('Error', 'Hubo un problema al actualizar el estado de la orden.');
                        }
                    },
                },
            ],
            { cancelable: true } // Permite que el usuario cierre la alerta tocando fuera de ella
        );
    };

    const handleReiniciar = () => {
        Alert.alert(
            'Confirmación',
            '¿Está seguro de que desea cambiar el estado de la orden a "pendiente"?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel', // Botón de cancelar
                },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wellnet-rd.com:444/api/ordenes-estado/${form.idOrden}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ estado: 'pendiente' }),
                            });

                            if (response.ok) {
                                Alert.alert('Éxito', 'El estado de la orden se a "pendiente".');
                                navigation.goBack(); // Navega a la pantalla anterior
                            } else {
                                const error = await response.json();
                                Alert.alert('Error', error.message || 'No se pudo actualizar pendiente.');
                            }
                        } catch (error) {
                            console.error('Error al cambiar el estado de la orden:', error);
                            Alert.alert('Error', 'Hubo un problema al actualizar el estado de la orden.');
                        }
                    },
                },
            ],
            { cancelable: true } // Permite que el usuario cierre la alerta tocando fuera de ella
        );
    };


    // 1) Saca la lista de permisos
    // Lo más seguro es que tengas permisos.permisos
    // (es decir, un array dentro de la propiedad "permisos")
    const permisosArray = permisos?.permisos || [];

    // 2) Verifica si al menos uno de los objetos en ese array
    // cumple con id_permiso=4, id_permiso_sub=44, estado_permiso='Y'
    const hasNewOrderPermission = permisosArray.some(
        (perm) =>
            perm.id_permiso === 4 &&
            perm.id_permiso_sub === 45 &&
            perm.estado_permiso === 'Y'
    );
    const hasNewOrderPermission2 = permisosArray.some(
        (perm) =>
            perm.id_permiso === 4 &&
            perm.id_permiso_sub === 46 &&
            perm.estado_permiso === 'Y'
    );
    const hasNewOrderPermission3 = permisosArray.some(
        (perm) =>
            perm.id_permiso === 4 &&
            perm.id_permiso_sub === 47 && 
            perm.estado_permiso === 'Y'
    );

    // 3) Construye el array de botones y solo agrega el de "Nueva Orden"
    // si el usuario tiene el permiso

    // Botones para el menú
    const botones = [
        { id: '6', action: () => setMenuVisible(true), icon: 'bars' },

        ...(hasNewOrderPermission
            ? [
                {
                    id: '1',
                    title: 'Ejecutar',
                    icon: 'play-circle',
                    action: handleEjecutar, // Usa la función separada
                    // Usa la función separada
                },
            ]
            : []),
        ...(hasNewOrderPermission2
            ? [
                { id: '5', title: 'Cancelar', icon: 'times-circle', action: handleCancelar },
            ]
            : []),

        ...(hasNewOrderPermission3
            ? [
                { id: '2', title: 'Reiniciar', icon: 'refresh', action: handleReiniciar },
            ]
            : []),

        // {
        //     id: '2',
        //     title: 'Asignar',
        //     screen: 'TechServiceOrderScreen',
        //     icon: 'user-plus', // Asignar
        //     params: { isp, usuarioId },
        // },
        // { id: '3', title: 'Informe ejecuciones', screen: 'IngresosScreen', icon: 'bar-chart' },
        {
            id: '4',
            title: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
            icon: isDarkMode ? 'sun-o' : 'moon-o',
            action: toggleTheme,
        },
    ];

    const getEstadoStyle = (estado) => {
        switch (estado) {
            case 'pendiente':
                return { color: 'orange', fontWeight: 'bold' }; // Color naranja para pendientes
            case 'en progreso':
                return { color: 'blue', fontWeight: 'bold' }; // Azul para progreso
            case 'completado':
                return { color: 'green', fontWeight: 'bold' }; // Verde para completados
            case 'cancelado':
                return { color: 'red', fontWeight: 'bold' }; // Rojo para cancelados
            default:
                return { color: 'gray', fontWeight: 'normal' }; // Gris para indefinido
        }
    };

    const getEstadoBackgroundStyle = (estado) => {
        switch (estado) {
            case 'pendiente':
                return { backgroundColor: '#FFF5E6' }; // Fondo naranja claro
            case 'en progreso':
                return { backgroundColor: '#E6F0FF' }; // Fondo azul claro
            case 'completado':
                return { backgroundColor: '#E6FFE6' }; // Fondo verde claro
            case 'cancelado':
                return { backgroundColor: '#FFE6E6' }; // Fondo rojo claro
            default:
                return { backgroundColor: '#F2F2F2' }; // Fondo gris claro
        }
    };

    // Formatea la fecha al formato deseado
    const formatFechaDominicana = (fechaISO) => {
        const fecha = new Date(fechaISO);
        return new Intl.DateTimeFormat('es-DO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(fecha).replace('de ', 'de ').replace(/^(.)/, (char) => char.toUpperCase());
    };

    // Formatea la hora al formato "a las HH:MM PM o AM"
    const formatHoraDominicana = (fechaISO) => {
        const fecha = new Date(fechaISO);
        const opciones = { hour: 'numeric', minute: 'numeric', hour12: true };
        const hora = new Intl.DateTimeFormat('es-DO', opciones).format(fecha);
        return `a las ${hora}`;
    };


    return (
        <>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1, // Permite que el contenido se expanda según sea necesario
                    backgroundColor: isDarkMode ? '#000' : '#f9f9f9', // Fondo dinámico
                }}
            >
                <View
                    style={{
                        flex: 1, // Ocupa todo el espacio disponible
                        backgroundColor: isDarkMode ? '#000' : '#f9f9f9', // Fondo dinámico
                        padding: 16, // Espaciado interno
                    }}
                >
                    <Text style={styles.title}>Orden de Servicio # {form.idOrden} </Text>


                    {/* Selector de Tipo de Orden */}

                    {/* Selector de Tipo de Orden */}
                    <View>
                        <View style={styles.orderTypeButton}>
                            <Text style={styles.orderTypeButtonText}>
                                {form.tipoOrdenId || '#'} - {form.tipoOrden || 'Tipo de orden'}
                            </Text>
                            <Text style={styles.descriptionText}>
                                Fecha: {form.fechaOrden ? `${formatFechaDominicana(form.fechaOrden)} ${formatHoraDominicana(form.fechaOrden)}` : 'Fecha no disponible'}
                            </Text>


                        </View>

                        {/* Descripción del tipo de orden */}
                        {form.descripcionGeneral ? (
                            <Text style={[styles.orderTypeText, { marginTop: 8 }]}>
                                {form.descripcionGeneral}
                            </Text>
                        ) : null}

                        {/* Estado de la orden con estilo dinámico */}
                        <View style={[styles.estadoContainer, getEstadoBackgroundStyle(form.estadoOrden)]}>
                            <Text
                                style={[
                                    styles.orderTypeText,
                                    getEstadoStyle(form.estadoOrden),
                                    { margin: 8 },
                                ]}
                            >
                                {form.estadoOrden || 'Estado de la orden'}
                            </Text>
                            <Text style={styles.descriptionText}>
                                Fecha: {form.fechaActOrden ? `${formatFechaDominicana(form.fechaActOrden)} ${formatHoraDominicana(form.fechaActOrden)}` : 'Fecha no disponible'}
                            </Text>
                        </View>
                    </View>


                    {selectedDescription ? (
                        <Text style={styles.orderTypeText}>
                            {selectedDescription}
                        </Text>
                    ) : null}

                    {/* Botón de Cliente */}
                    <View style={styles.orderTypeButton}>
                        <Text
                            style={styles.orderTypeButtonText}
                        // onPress={() => setModalVisible(true)}
                        >
                            {form.cliente || 'Seleccione un cliente'}
                        </Text>
                    </View>

                    {/* Detalles del Cliente Seleccionado */}
                    {form.cliente && (
                        <View style={styles.clientDetails}>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Cliente ID:</Text> {form.idCliente}
                            </Text>
                            {/* <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Nombre:</Text> {form.cliente}
                        </Text> */}
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Teléfono:</Text> {form.clienteTelefono}
                            </Text>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Cédula:</Text> {form.clienteCedula}
                            </Text>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Dirección:</Text> {form.clienteDireccion}
                            </Text>
                        </View>
                    )}

                    {/* <Text>  </Text> */}
                    {/* Botón de Servicio */}
                    <View style={styles.orderTypeButton}>
                        <Text
                            style={styles.orderTypeButtonText}
                            onPress={() => {
                                // fetchServicios(); // Solicitar servicios al abrir el modal
                                setServicioModalVisible(true);
                            }}
                        >
                            Servicio: {form.servicioNombre || 'Seleccione un servicio'}
                        </Text>
                    </View>

                    {/** Detalles del Servicio */}
                    {form.servicioNombre && (
                        <View style={styles.serviceDetails}>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Servicio ID: </Text>{form.idServicio}
                            </Text>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Servicio: </Text>{form.servicioNombre}
                            </Text>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Descripción: </Text>{form.servicioDescripcion}
                            </Text>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Precio: </Text>
                                {`RD$ ${new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(form.servicioPrecio || 0)}`}
                            </Text>


                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Velocidad: </Text>{form.servicioVelocidad} Mbps
                            </Text>
                        </View>
                    )}


                    {/* Botón de Conexión */}
                    <View style={styles.orderTypeButton}>
                        <Text
                            style={styles.orderTypeButtonText}
                        // onPress={() => {
                        //     if (!form.idCliente) {
                        //         Alert.alert('Error', 'Primero debe seleccionar un cliente.');
                        //         return;
                        //     }
                        //     fetchConexiones(form.idCliente.trim()); // Solicita las conexiones basadas en el cliente
                        //     setConexionModalVisible(true); // Abre el modal
                        // }}
                        >
                            Conexión: {form.conexionDireccion || 'Seleccione una conexión'}
                        </Text>
                    </View>



                    {/** Detalles de la Conexión */}
                    {form.conexionDireccion && (
                        <View style={styles.conexionDetails}>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Conexión ID: </Text>{form.conexionId || 'No especificado'}
                            </Text>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Dirección: </Text>{form.conexionDireccion}
                            </Text>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Estado: </Text>{form.conexionEstado}
                            </Text>
                            {/* <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Velocidad Bajada: </Text>{form.conexionVelocidadBajada || 'N/A'} Mbps
                        </Text>
                        <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Velocidad Subida: </Text>{form.conexionVelocidadSubida || 'N/A'} Mbps
                        </Text> */}
                        </View>
                    )}

                    {/* Botón de Técnico */}
                    <View style={styles.orderTypeButton}>
                        <Text
                            style={styles.orderTypeButtonText}
                        // onPress={() => {
                        //     fetchTecnicos(); // Solicitar técnicos al abrir el modal
                        //     setTecnicoModalVisible(true); // Abre el modal
                        // }}
                        >
                            Técnico: {form.tecnicoNombre || 'Seleccione un técnico'}
                        </Text>
                    </View>

                    {/** Detalles del Técnico */}
                    {form.tecnicoNombre && (
                        <View style={styles.tecnicoDetails}>


                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Técnico ID: </Text>{form.tecnicoId}
                            </Text>
                            {/* <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Técnico: </Text>{form.tecnicoNombre}
                        </Text> */}
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Teléfono: </Text>{form.tecnicoTelefono}
                            </Text>
                            <Text style={styles.clientDetailsText}>
                                <Text style={styles.idexText}>Email: </Text>{form.tecnicoEmail}
                            </Text>
                        </View>
                    )}

                    {/* Descripción de la Orden */}
                    <TextInput
                        mode="outlined"
                        label="Descripción"
                        placeholder="Ingrese la descripción"
                        value={form.descripcion}
                        onChangeText={(text) => setForm({ ...form, descripcion: text })}
                        multiline
                        editable={false} // Deshabilita el campo
                        placeholderTextColor={isDarkMode ? '#888' : '#777'} // Cambia el color del placeholder según el modo
                        textColor={isDarkMode ? '#fff' : '#777'}
                        labelColor={isDarkMode ? '#fff' : '#777'}
                        style={[
                            styles.input,
                            styles.textArea,
                            {
                                backgroundColor: isDarkMode ? '#333' : '#f3f3f3', // Cambia el fondo para diferenciarlo como deshabilitado
                                color: isDarkMode ? '#aaa' : '#777',             // Cambia el color del texto para un estilo deshabilitado
                                borderColor: isDarkMode ? '#555' : '#ccc',       // Ajusta el color del borde para un estilo deshabilitado
                                fontWeight: 'bold',                             // Hace que el texto sea más fuerte
                            },
                        ]}
                    />

                    {/* Tarjeta Condicional */}
                    {form.estadoOrden === 'en progreso' && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <View style={styles.cardButtonsContainer}>
                                    {/* Botón Configuración */}
                                    <Button
                                        mode="contained"
                                        icon="cog"
                                        style={styles.cardButton}
                                        onPress={() => navigation.navigate('ConfiguracionScreen', { connectionId: form.conexionId, idOrden: form.idOrden })} // Navegar a ConfiguracionScreen
                                    >
                                        Configuración
                                    </Button>

                                    {/* Botón Instalación */}
                                    <Button
                                        mode="contained"
                                        icon="wrench"
                                        style={styles.cardButton}
                                        onPress={() => navigation.navigate('InstalacionForm', { isEditMode: false, id_conexion: form.conexionId, id_isp: isp.id_isp, idOrden: form.idOrden })}
                                    // const { id_instalacion, id_conexion, id_isp, isEditMode, id_averia, descripcion_averia } = route.params;
                                    >
                                        Instalación
                                    </Button>

                                    {/* Botón Servicio */}
                                    <Button
                                        mode="contained"
                                        icon="account-settings"
                                        style={styles.cardButton}
                                        onPress={() => navigation.navigate('AsignacionServicioClienteScreen', { isEditMode: true, ispId: isp.id_isp, serviceId: form.conexionId, usuarioId, id_conexion: form.conexionId })}
                                    // onPress={() => console.log('Servicio presionado')}
                                    // const { serviceId, clientId, userId, ispId } = route.params;
                                    >
                                        Servicio
                                    </Button>

                                    {/* Botón Corte/Reconexión */}
                                    <Button
                                        mode="contained"
                                        icon="cash"
                                        style={styles.cardButton}
                                        onPress={() => navigation.navigate('ClienteFacturasScreen', { clientId: form.idCliente, isEditMode: true, ispId: isp.id_isp, serviceId: form.conexionId, usuarioId, id_conexion: form.conexionId })}
                                    // onPress={() => console.log('Cobrar f')}
                                    // const { clientId, usuarioId } = route.params;
                                    >
                                        Cobrar Facturas
                                    </Button>

                                    {/* Botón Corte/Reconexión */}
                                    <Button
                                        mode="contained"
                                        icon="power"
                                        style={styles.cardButton}
                                        onPress={() => console.log('Corte/Reconexión presionada')}
                                    >
                                        Corte/Reconexión
                                    </Button>
                                </View>
                                {/* Notas del ejecutor de la Orden */}
                                <TextInput
                                    mode="outlined"
                                    label="Notas del Instalador"
                                    placeholder="Ingrese detalles de la ejecución"
                                    value={form.notasInstalador}
                                    onChangeText={(text) => setForm({ ...form, notasInstalador: text })}
                                    multiline
                                    placeholderTextColor={isDarkMode ? '#888' : '#777'} // Cambia el color del placeholder según el modo
                                    textColor={isDarkMode ? '#fff' : '#777'}
                                    labelColor={isDarkMode ? '#fff' : '#777'}
                                    style={[
                                        styles.input,
                                        styles.textArea,
                                        {
                                            backgroundColor: isDarkMode ? '#333' : '#fff', // Fondo dinámico según el modo
                                            color: isDarkMode ? '#fff' : '#000',          // Color del texto según el modo
                                            borderColor: isDarkMode ? '#888' : '#777',    // Bordes dinámicos según el modo
                                            fontWeight: 'bold',                          // Hace que el texto sea más fuerte

                                        },
                                    ]}
                                />

                                {/* Botón de Guardar */}
                                <Button
                                    mode="contained"
                                    onPress={handleCompletar}
                                    style={styles.button}
                                    labelStyle={styles.buttonLabel}
                                >
                                    Completar Orden #{form.idOrden}
                                </Button>
                            </Card.Content>
                        </Card>
                    )}



                </View>
            </ScrollView>
            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />

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
        </>
    );
};

export default ExistingServiceOrderScreen;
