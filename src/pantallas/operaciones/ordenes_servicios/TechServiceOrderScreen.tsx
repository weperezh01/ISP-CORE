import React, { useEffect, useState } from 'react';
import { View, Alert, FlatList, TouchableOpacity, Modal, TextInput as NativeTextInput, ScrollView } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { useTheme } from '../../../../ThemeContext';
import getStyles from './NewServiceOrderStyles';

const TechServiceOrderScreen = ({ route, navigation }) => {
    const { isp, usuarioId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [form, setForm] = useState({
        tipoOrden: '', // ID del tipo de orden seleccionado
        cliente: '', // Cliente seleccionado
        servicio: '',
        conexion: '',
        tecnico: '',
        tecnicoId: '',
        descripcion: '',
        idCliente: '',
        clienteTelefono: '',
        clienteCedula: '',
        clienteDireccion: '',
        idServicio: '',
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



    useEffect(() => {
        // Cargar tipos de órdenes
        const fetchOrderTypes = async () => {
            try {
                const response = await fetch(`https://wellnet-rd.com:444/api/order-types?id_isp=${isp.id_isp}`);
                const data = await response.json();
                if (!response.ok) {
                    console.error('Error en el servidor:', data.error);
                    Alert.alert('Error', data.error);
                } else {
                    setOrderTypes(data);
                }
            } catch (error) {
                console.error('Error al cargar los tipos de órdenes:', error);
                Alert.alert('Error', 'Hubo un problema al cargar los tipos de órdenes.');
            }
        };

        fetchOrderTypes();

        // Cargar clientes
        const fetchClientes = async () => {
            try {
                const response = await fetch(`https://wellnet-rd.com:444/api/lista-clientes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isp_id: isp.id_isp, usuarioId }),
                });
                const data = await response.json();
                if (!response.ok) {
                    console.error('Error en el servidor:', data.error);
                    Alert.alert('Error', data.error);
                } else {
                    setClientes(data.clientes || []);
                    setFilteredClientes(data.clientes || []); // Inicializa la lista filtrada
                }
            } catch (error) {
                console.error('Error al cargar los clientes:', error);
                Alert.alert('Error', 'Hubo un problema al cargar los clientes.');
            }
        };

        fetchClientes();
    }, []);

    const handleOrderTypeSelect = (orderType) => {
        setForm({
            ...form,
            tipoOrden: orderType.id_orden_tipo,
            servicio: (orderType.nombre === 'instalacion' || orderType.nombre === 'inspeccion')
                ? '' // Vaciar para permitir la selección manual
                : form.servicio, // Mantener el servicio actual si no aplica
        });
        setSelectedDescription(orderType.orden_tipo_descripcion_general || '');
        setMenuVisible(false);
    };

    const handleClienteSelect = (cliente) => {
        setForm({
            ...form,
            cliente: `${cliente.nombres} ${cliente.apellidos}`,
            idCliente: `${cliente.id_cliente} `,
            clienteTelefono: cliente.telefono1 || 'No especificado',
            clienteCedula: cliente.cedula || 'No especificada',
            clienteDireccion: cliente.direccion || 'No especificada',
        });
        setModalVisible(false); // Cierra el modal
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredClientes(clientes);
        } else {
            const filtered = clientes.filter((cliente) => {
                const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.toLowerCase();
                const cedula = cliente.cedula ? cliente.cedula.toLowerCase() : ''; // Manejo de valores nulos
                const telefono = cliente.telefono1 ? cliente.telefono1.toLowerCase() : ''; // Manejo de valores nulos
                const idCliente = cliente.id_cliente.toString();

                return (
                    nombreCompleto.includes(query.toLowerCase()) ||
                    cedula.includes(query.toLowerCase()) ||
                    telefono.includes(query.toLowerCase()) ||
                    idCliente.includes(query)
                );
            });
            setFilteredClientes(filtered);
        }
    };



    const fetchServicios = async () => {
        try {
            const response = await fetch(`https://wellnet-rd.com:444/api/lista-servicios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isp_id: isp.id_isp, usuarioId }),
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('Error en el servidor:', data.error);
                Alert.alert('Error', data.error);
            } else {
                setServicios(data.servicios || []);
                setFilteredServicios(data.servicios || []);
            }
        } catch (error) {
            console.error('Error al cargar los servicios:', error);
            Alert.alert('Error', 'Hubo un problema al cargar los servicios.');
        }
    };

    const fetchTecnicos = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/usuarios/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ispId: isp.id_isp }),
            });

            const responseData = await response.json();
            console.log('Respuesta del backend (técnicos):', responseData);

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

    const handleServicioSelect = (servicio) => {
        setForm({
            ...form,
            servicio: servicio.nombre_servicio,
            idServicio: servicio.id_servicio,
            servicioDescripcion: servicio.descripcion_servicio || 'No especificada',
            servicioPrecio: servicio.precio_servicio || 'No especificado',
            servicioVelocidad: servicio.velocidad_servicio || 'No especificada',
        });
        setServicioModalVisible(false); // Cerrar modal
    };


    const fetchConexiones = async (idCliente) => {
        try {
            const url = `https://wellnet-rd.com:444/api/conexiones-cliente-articulo/${idCliente}`;
            console.log("Solicitando conexiones a:", url);

            const response = await fetch(url, {
                method: 'GET', // Usamos GET ya que no se necesita enviar un cuerpo
                headers: { 'Content-Type': 'application/json' },
            });

            const responseData = await response.json();
            console.log("Respuesta del backend:", responseData);

            if (!response.ok || !responseData.success) {
                console.error('Error en el servidor:', responseData.error || 'Error desconocido');
                Alert.alert('Error', responseData.error || 'Error al obtener las conexiones.');
            } else {
                // Usamos la clave `data` para obtener las conexiones
                const conexiones = responseData.data || [];
                setConexiones(conexiones);
                setFilteredConexiones(conexiones); // Inicializa la lista filtrada
            }
        } catch (error) {
            console.error('Error al cargar las conexiones:', error);
            Alert.alert('Error', 'Hubo un problema al cargar las conexiones.');
        }
    };


    // Nueva función para manejar selección de conexión
    const handleConexionSelect = (conexion) => {
        setForm({
            ...form,
            conexion: conexion.nombre_conexion || conexion.id_conexion, // Supongamos que tiene un campo `nombre_conexion`
            idConexion: conexion.id_conexion,
            servicio: (form.tipoOrden === 'instalacion' || form.tipoOrden === 'inspeccion')
                ? '' // Permitir seleccionar manualmente
                : conexion.id_servicio, // Tomar automáticamente el servicio asociado
        });
        setConexionModalVisible(false); // Cerrar modal
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
                                    id_orden_tipo: form.tipoOrden,
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


    return (
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
                <Text style={styles.title}>Nueva Orden de Servicio</Text>


                {/* Selector de Tipo de Orden */}
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <View style={styles.orderTypeButton}>
                            <Text
                                style={styles.orderTypeButtonText}
                                onPress={() => setMenuVisible(true)}
                            >
                                {form.tipoOrden
                                    ? orderTypes.find((type) => type.id_orden_tipo === form.tipoOrden)?.orden_nombre
                                    : 'Seleccione el tipo de orden'}
                            </Text>
                        </View>
                    }
                >
                    {orderTypes.map((orderType) => (
                        <Menu.Item
                            key={orderType.id_orden_tipo}
                            onPress={() => handleOrderTypeSelect(orderType)}
                            title={orderType.orden_nombre}
                        />
                    ))}
                </Menu>

                {selectedDescription ? (
                    <Text style={styles.orderTypeText}>
                        {selectedDescription}
                    </Text>
                ) : null}

                {/* Botón de Cliente */}
                <View style={styles.orderTypeButton}>
                    <Text
                        style={styles.orderTypeButtonText}
                        onPress={() => setModalVisible(true)}
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
                            fetchServicios(); // Solicitar servicios al abrir el modal
                            setServicioModalVisible(true);
                        }}
                    >
                        {form.servicio || 'Seleccione un servicio'}
                    </Text>
                </View>

                {form.servicio && (
                    <View style={styles.serviceDetails}>
                        <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Servicio: </Text>{form.servicio}
                        </Text>
                        <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Descripción: </Text>{form.servicioDescripcion}
                        </Text>
                        <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Precio: </Text> ${form.servicioPrecio}
                        </Text>
                        <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Velocidad: </Text> {form.servicioVelocidad} Mbps
                        </Text>
                    </View>
                )}

                {/* Botón de Conexión */}
                <View style={styles.orderTypeButton}>
                    <Text
                        style={styles.orderTypeButtonText}
                        onPress={() => {
                            if (!form.idCliente) {
                                Alert.alert('Error', 'Primero debe seleccionar un cliente.');
                                return;
                            }
                            fetchConexiones(form.idCliente.trim()); // Solicita las conexiones basadas en el cliente
                            setConexionModalVisible(true); // Abre el modal
                        }}
                    >
                        {form.direccion || 'Seleccione una conexión'}
                    </Text>
                </View>



                {form.conexion && (
                    <View style={styles.conexionDetails}>
                        <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Conexión:</Text> {form.conexion}
                        </Text>
                        {/* <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Servicio:</Text> {form.conexionServicio}
                        </Text> */}
                        <Text style={styles.clientDetailsText}>
                            <Text style={styles.idexText}>Estado:</Text> {form.conexionEstado}
                        </Text>
                    </View>
                )}

                {/* Botón de Técnico */}
                <View style={styles.orderTypeButton}>
                    <Text
                        style={styles.orderTypeButtonText}
                        onPress={() => {
                            fetchTecnicos(); // Solicitar técnicos al abrir el modal
                            setTecnicoModalVisible(true); // Abre el modal
                        }}
                    >
                        Técnico: {form.tecnico || 'Seleccione un técnico'}
                    </Text>
                </View>


                {/* Modal de Clientes */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Seleccionar Cliente</Text>

                        {/* Barra de búsqueda */}
                        <NativeTextInput
                            style={styles.searchInput}
                            placeholder="Buscar cliente por nombre, cédula o ID"
                            placeholderTextColor={isDarkMode ? '#888' : '#777'}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />

                        <FlatList
                            data={filteredClientes}
                            keyExtractor={(item) => item.id_cliente.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleClienteSelect(item)}
                                >
                                    <Text style={styles.modalItemText}>
                                        ID: {item.id_cliente} - {item.nombres} {item.apellidos}
                                    </Text>
                                    <Text style={styles.modalItemText}>
                                        Tel.: {item.telefono1} Cédula: {item.cedula}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button
                            mode="outlined"
                            onPress={() => setModalVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            Cerrar
                        </Button>
                    </View>
                </Modal>

                {/* Modal de Servicios */}

                <Modal
                    visible={servicioModalVisible}
                    animationType="slide"
                    onRequestClose={() => setServicioModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Seleccionar Servicio</Text>

                        {/* Barra de búsqueda (opcional) */}
                        <NativeTextInput
                            style={styles.searchInput}
                            placeholder="Buscar servicio por nombre o descripción"
                            placeholderTextColor={isDarkMode ? '#888' : '#777'}
                            value={searchQuery}
                            onChangeText={(query) => {
                                setSearchQuery(query);
                                if (query.trim() === '') {
                                    setFilteredServicios(servicios);
                                } else {
                                    const filtered = servicios.filter((servicio) =>
                                        servicio.nombre_servicio.toLowerCase().includes(query.toLowerCase()) ||
                                        (servicio.descripcion_servicio || '').toLowerCase().includes(query.toLowerCase())
                                    );
                                    setFilteredServicios(filtered);
                                }
                            }}
                        />

                        {/* Lista de Servicios */}
                        <FlatList
                            data={filteredServicios}
                            keyExtractor={(item) => item.id_servicio.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleServicioSelect(item)}
                                >
                                    <Text style={styles.modalItemText}>
                                        ID: {item.id_servicio} - {item.nombre_servicio}
                                    </Text>
                                    <Text style={styles.modalItemText}>
                                        Descripción: {item.descripcion_servicio || 'No especificada'}
                                    </Text>
                                    <Text style={styles.modalItemText}>
                                        Precio: ${item.precio_servicio} - Velocidad: {item.velocidad_servicio || 'N/A'} Mbps
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button
                            mode="outlined"
                            onPress={() => setServicioModalVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            Cerrar
                        </Button>
                    </View>
                </Modal>

                {/* Modal de Conexiones */}
                <Modal
                    visible={conexionModalVisible}
                    animationType="slide"
                    onRequestClose={() => setConexionModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Seleccionar Conexión</Text>

                        {/* Barra de búsqueda (opcional) */}
                        <NativeTextInput
                            style={styles.searchInput}
                            placeholder="Buscar conexión por dirección o estado"
                            placeholderTextColor={isDarkMode ? '#888' : '#777'}
                            value={searchQuery}
                            onChangeText={(query) => {
                                setSearchQuery(query);
                                if (query.trim() === '') {
                                    setFilteredConexiones(conexiones);
                                } else {
                                    const filtered = conexiones.filter((conexion) =>
                                        (conexion.direccion || '').toLowerCase().includes(query.toLowerCase()) ||
                                        (conexion.estado || '').toLowerCase().includes(query.toLowerCase())
                                    );
                                    setFilteredConexiones(filtered);
                                }
                            }}
                        />

                        {/* Lista de Conexiones */}
                        <FlatList
                            data={filteredConexiones}
                            keyExtractor={(item) => item.id_conexion.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setForm({
                                            ...form,
                                            conexion: item.id_conexion,
                                            direccion: item.direccion || 'No especificada',
                                            estado: item.estado || 'No especificado',
                                        });
                                        setConexionModalVisible(false); // Cierra el modal
                                    }}
                                >
                                    <Text style={styles.modalItemText}>
                                        ID: {item.id_conexion} - Dirección: {item.direccion || 'No especificada'}
                                    </Text>
                                    <Text style={styles.modalItemText}>
                                        Estado: {item.estado || 'No especificado'}
                                    </Text>
                                    <Text style={styles.modalItemText}>
                                        Velocidad: {item.velocidad_bajada || 'N/A'} / {item.velocidad_subida || 'N/A'} Mbps
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button
                            mode="outlined"
                            onPress={() => setConexionModalVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            Cerrar
                        </Button>
                    </View>
                </Modal>


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

                        {/* Lista de técnicos */}
                        <FlatList
                            data={filteredTecnicos}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setForm({
                                            ...form,
                                            tecnico: `${item.nombre} ${item.apellido}`,
                                            tecnicoId: `${item.id}`,
                                        });
                                        setTecnicoModalVisible(false); // Cierra el modal
                                    }}
                                >
                                    <Text style={styles.modalItemText}>
                                        {item.nombre} {item.apellido} - {item.email}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button
                            mode="outlined"
                            onPress={() => setTecnicoModalVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            Cerrar
                        </Button>
                    </View>
                </Modal>



                {/* <TextInput
                    mode="outlined"
                    label="Conexión"
                    placeholder="Ingrese la conexión"
                    value={form.conexion}
                    onChangeText={(text) => setForm({ ...form, conexion: text })}
                    style={styles.input}
                />
                <TextInput
                    mode="outlined"
                    label="Técnico"
                    placeholder="Ingrese el técnico asignado"
                    value={form.tecnico}
                    onChangeText={(text) => setForm({ ...form, tecnico: text })}
                    style={styles.input}
                /> */}
                <TextInput
                    mode="outlined"
                    label="Descripción"
                    placeholder="Ingrese la descripción"
                    value={form.descripcion}
                    onChangeText={(text) => setForm({ ...form, descripcion: text })}
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


                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                >
                    Guardar
                </Button>

            </View>
        </ScrollView>
    );
};

export default TechServiceOrderScreen;
