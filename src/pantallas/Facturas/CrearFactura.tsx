import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    FlatList,
    Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import ThemeSwitch from '../../componentes/themeSwitch';

const CrearFactura = ({ route, navigation }) => {
    const { cicloId } = route.params;
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);
    const [ncf, setNcf] = useState('');
    const [idCliente, setIdCliente] = useState('');
    const [idConexion, setIdConexion] = useState('');
    const [montoTotal, setMontoTotal] = useState('');
    const [itbis, setItbis] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [clienteNombre, setClienteNombre] = useState('');
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [conexiones, setConexiones] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [conexionesModalVisible, setConexionesModalVisible] = useState(false);
    const [articulosModalVisible, setArticulosModalVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [ispId, setIspId] = useState('');
    const [articulos, setArticulos] = useState([]);
    const [idProducto, setIdProducto] = useState('');
    const [descripcionArticulo, setDescripcionArticulo] = useState('');
    const [cantidadArticulo, setCantidadArticulo] = useState('');
    const [precioUnitario, setPrecioUnitario] = useState('');
    const [subtotal, setSubtotal] = useState(0);
    const [descuento, setDescuento] = useState(0);
    const [permisoOperacion, setPermisoOperacion] = useState(false);

    useEffect(() => {
        const fetchIspId = async () => {
            try {
                const storedIspId = await AsyncStorage.getItem('@selectedIspId');
                if (storedIspId) {
                    setIspId(storedIspId);
                }
            } catch (error) {
                console.error('Error al obtener el ID de ISP', error);
            }
        };

        fetchIspId();
    }, []);

    useEffect(() => {
        const obtenerPermisos = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
                if (userData) {
                    const response = await axios.post('https://wellnet-rd.com:444/api/usuarios/obtener-permisos-usuario', {
                        id_usuario: userData.id,
                    });
                    const permisos = response.data;
                    const permisoFacturaciones = permisos.find(p => p.permiso === 'permiso_facturaciones');
                    if (permisoFacturaciones) {
                        setPermisoOperacion(permisoFacturaciones.activo === 1);
                    }
                }
            } catch (error) {
                console.error('Error al obtener permisos del usuario:', error);
            }
        };

        obtenerPermisos();
    }, []);

    useEffect(() => {
        calcularTotales();
    }, [articulos, descuento]);

    const buscarCliente = async (idCliente) => {
        try {
            const response = await axios.get(`https://wellnet-rd.com:444/api/clientes/${idCliente}`);
            if (response.data) {
                setClienteNombre(`${response.data.nombres} ${response.data.apellidos}`);
            } else {
                setClienteNombre('Cliente no encontrado');
            }
        } catch (error) {
            console.error('Error al buscar el cliente:', error);
            setClienteNombre('Error al buscar el cliente');
        }
    };

    const crearFactura = async () => {
        const fecha_emision = new Date().toISOString().split('T')[0];
        const hora_emision = new Date().toTimeString().split(' ')[0];

        const payload = {
            id_isp: ispId,
            ncf: ncf || 0,  // Asegúrate de que ncf no esté vacío
            id_cliente: idCliente,
            id_ciclo: cicloId,
            id_conexion: idConexion,
            monto_total: montoTotal,
            itbis,
            descripcion,
            estado: 'pendiente',
            fecha_emision,
            hora_emision,
            descuento
        };

        try {
            const response = await axios.post('https://wellnet-rd.com:444/api/crear-factura', payload);
            console.log('Factura creada con éxito', response.data);
            const id_factura = response.data.id_factura;
            await agregarArticulos(id_factura);
            alert('Factura creada con éxito.');
            navigation.navigate('DetalleFacturaScreen', { id_factura });
        } catch (error) {
            console.error('Error al crear la factura:', error);
            alert('Error al crear la factura.');
        }
    };

    const agregarArticulos = async (id_factura) => {
        try {
            const response = await axios.post('https://wellnet-rd.com:444/api/agregar-articulos', {
                articulos,
                id_factura
            });
            console.log('Artículos agregados con éxito', response.data);
        } catch (error) {
            console.error('Error al agregar los artículos:', error);
            alert('Error al agregar los artículos.');
        }
    };

    const obtenerClientes = async () => {
        try {
            const response = await axios.get('https://wellnet-rd.com:444/api/todos-los-clientes');
            setClientes(response.data);
            setFilteredClientes(response.data);
        } catch (error) {
            console.error('Error al obtener la lista de clientes:', error);
        }
    };

    const obtenerConexiones = async (idCliente) => {
        try {
            const response = await axios.get(`https://wellnet-rd.com:444/api/conexiones/${idCliente}`);
            setConexiones(response.data);
        } catch (error) {
            console.error('Error al obtener las conexiones del cliente:', error);
        }
    };

    useEffect(() => {
        if (modalVisible) {
            obtenerClientes();
        }
    }, [modalVisible]);

    useEffect(() => {
        if (conexionesModalVisible && idCliente) {
            obtenerConexiones(idCliente);
        }
    }, [conexionesModalVisible, idCliente]);

    useEffect(() => {
        if (search) {
            const filtered = clientes.filter((cliente) => {
                return (
                    (cliente.id_cliente && cliente.id_cliente.toString().includes(search)) ||
                    (cliente.nombres && cliente.nombres.toLowerCase().includes(search.toLowerCase())) ||
                    (cliente.cedula && cliente.cedula.includes(search)) ||
                    (cliente.telefono1 && cliente.telefono1.includes(search))
                );
            });
            setFilteredClientes(filtered);
        } else {
            setFilteredClientes(clientes);
        }
    }, [search, clientes]);

    const seleccionarCliente = (cliente) => {
        setIdCliente(cliente.id_cliente.toString());
        setClienteNombre(`${cliente.nombres} ${cliente.apellidos}`);
        setModalVisible(false);
    };

    const seleccionarConexion = (conexion) => {
        setIdConexion(conexion.id_conexion.toString());
        setConexionesModalVisible(false);
    };

    const agregarArticulo = () => {
        if (descripcionArticulo && cantidadArticulo && precioUnitario) {
            const nuevoArticulo = {
                numero_orden: articulos.length + 1,
                id_producto: idProducto ? parseInt(idProducto, 10) : null,
                descripcion: descripcionArticulo,
                cantidad_articulo: parseFloat(cantidadArticulo),
                precio_unitario: parseFloat(precioUnitario),
                total: parseFloat(cantidadArticulo) * parseFloat(precioUnitario),
                fecha: new Date().toISOString().split('T')[0]
            };
            setArticulos([...articulos, nuevoArticulo]);
            setDescripcionArticulo('');
            setCantidadArticulo('');
            setPrecioUnitario('');
            setIdProducto('');
            setArticulosModalVisible(false);
        } else {
            alert('Por favor, complete todos los campos del artículo.');
        }
    };

    const eliminarArticulo = (index) => {
        const nuevosArticulos = articulos.filter((_, i) => i !== index);
        setArticulos(nuevosArticulos);
    };

    const calcularTotales = () => {
        const subtotal = articulos.reduce((acc, articulo) => acc + articulo.total, 0);
        setSubtotal(subtotal);
        const itbis = subtotal * 0.18;
        setItbis(itbis);
        const montoTotal = subtotal - descuento + itbis;
        setMontoTotal(montoTotal);
    };

    const handleDescuentoChange = (value) => {
        const regex = /^[0-9]*\.?[0-9]*$/;
        if (regex.test(value)) {
            setDescuento(value);
            calcularTotales();
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const confirmarCreacionFactura = () => {
        Alert.alert(
            "Confirmar Creación",
            "¿Estás seguro de que deseas crear esta factura?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "OK", onPress: crearFactura }
            ],
            { cancelable: false }
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.containerSuperior}>
                <Text style={styles.text}>Crear Factura</Text>
                <ThemeSwitch onValueChange={toggleTheme} value={isDarkMode} />
            </View>
            {!permisoOperacion && (
                <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>
                    No tienes permiso para crear facturas.
                </Text>
            )}
            <FlatList
                data={[{}]}
                renderItem={() => (
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            <Text style={styles.label}>NCF:</Text>
                            <TextInput
                                style={styles.input}
                                value={ncf}
                                onChangeText={setNcf}
                                keyboardType="numeric"
                                editable={permisoOperacion}
                            />

                            <View style={styles.detailsContainer}>
                                <Text style={styles.label}>ID Cliente:</Text>
                                <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={() => setModalVisible(true)}
                                    disabled={!permisoOperacion}
                                >
                                    <Text style={styles.searchButtonText}>Buscar</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.row}>
                                <TextInput
                                    style={styles.input}
                                    value={idCliente}
                                    onChangeText={(value) => {
                                        setIdCliente(value);
                                        if (value) {
                                            buscarCliente(value);
                                        } else {
                                            setClienteNombre('');
                                        }
                                    }}
                                    keyboardType="numeric"
                                    editable={permisoOperacion}
                                />
                            </View>

                            <Text style={styles.label}>Nombre del Cliente:</Text>
                            <TextInput
                                style={styles.input}
                                value={clienteNombre}
                                editable={false}
                            />

                            <View style={styles.detailsContainer}>
                                <Text style={styles.label}>ID Conexión:</Text>
                                <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={() => setConexionesModalVisible(true)}
                                    disabled={!permisoOperacion}
                                >
                                    <Text style={styles.searchButtonText}>Buscar</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.row}>
                                <TextInput
                                    style={styles.input}
                                    value={idConexion}
                                    onChangeText={setIdConexion}
                                    keyboardType="numeric"
                                    editable={permisoOperacion}
                                />
                            </View>

                            <View style={styles.detailsContainer}>
                                <Text style={styles.label}>Artículos:</Text>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => setArticulosModalVisible(true)}
                                    disabled={!permisoOperacion}
                                >
                                    <Text style={styles.addButtonText}>Agregar Artículo</Text>
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={articulos}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <View style={[styles.articuloItem, isDarkMode ? styles.darkMode : styles.lightMode]}>
                                        <Text style={styles.articuloText}>{`${item.numero_orden}. ${item.id_producto ? item.id_producto + ' - ' : ''}${item.descripcion}`}</Text>
                                        <Text style={styles.articuloText}>{`${item.cantidad_articulo} x ${formatMoney(item.precio_unitario)} = ${formatMoney(item.total)}`}</Text>
                                        {permisoOperacion && (
                                            <TouchableOpacity onPress={() => eliminarArticulo(index)}>
                                                <Text style={styles.eliminarTexto}>Eliminar</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            />

                            <Text style={styles.label}>Sub-Total:</Text>
                            <TextInput
                                style={styles.input}
                                value={formatMoney(subtotal)}
                                editable={false}
                            />

                            <Text style={styles.label}>Descuento:</Text>
                            <TextInput
                                style={styles.input}
                                value={descuento.toString()}
                                onChangeText={handleDescuentoChange}
                                keyboardType="numeric"
                                editable={permisoOperacion}
                            />

                            <Text style={styles.label}>ITBIS:</Text>
                            <TextInput
                                style={styles.input}
                                value={formatMoney(itbis)}
                                editable={false}
                            />

                            <Text style={styles.label}>Monto Total:</Text>
                            <TextInput
                                style={styles.input}
                                value={formatMoney(montoTotal)}
                                editable={false}
                            />

                            <Text style={styles.label}>Nota:</Text>
                            <TextInput
                                style={styles.input}
                                value={descripcion}
                                onChangeText={setDescripcion}
                                editable={permisoOperacion}
                            />

                            <TouchableOpacity
                                style={styles.button}
                                onPress={confirmarCreacionFactura}
                                disabled={!permisoOperacion}
                            >
                                <Text style={styles.buttonText}>Crear Factura</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.darkMode : styles.lightMode]}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar cliente por ID, nombre, cédula o teléfono"
                        value={search}
                        onChangeText={setSearch}
                        editable={permisoOperacion}
                    />
                    <FlatList
                        data={filteredClientes}
                        keyExtractor={(item) => item.id_cliente.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.clienteItem}
                                onPress={() => seleccionarCliente(item)}
                                disabled={!permisoOperacion}
                            >
                                <Text style={styles.clienteItemText}>{`ID: ${item.id_cliente}, Nombre: ${item.nombres} ${item.apellidos}, Cédula: ${item.cedula}, Teléfono: ${item.telefono1}`}</Text>
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

            <Modal
                visible={conexionesModalVisible}
                animationType="slide"
                onRequestClose={() => setConexionesModalVisible(false)}
            >
                <SafeAreaView style={[styles.safeArea, isDarkMode ? styles.darkMode : styles.lightMode]}>
                    <FlatList
                        data={conexiones}
                        keyExtractor={(item) => item.id_conexion.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.clienteItem}
                                onPress={() => seleccionarConexion(item)}
                                disabled={!permisoOperacion}
                            >
                                <Text style={styles.clienteItemText}>{`ID Conexión: ${item.id_conexion}, Dirección: ${item.direccion}, Velocidad: ${item.velocidad} Mbps`}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setConexionesModalVisible(false)}
                    >
                        <Text style={styles.buttonText}>Cerrar</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={articulosModalVisible}
                animationType="slide"
                onRequestClose={() => setArticulosModalVisible(false)}
            >
                <SafeAreaView style={styles.safeArea}>
                    <FlatList
                        data={[{}]}
                        renderItem={() => (
                            <View style={styles.card}>
                                <Text style={styles.title}>Agregar Artículo</Text>
                                <View style={styles.cardContent}>
                                    <Text style={styles.label}>ID Producto:</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={idProducto}
                                        onChangeText={setIdProducto}
                                        keyboardType="numeric"
                                        editable={permisoOperacion}
                                    />

                                    <Text style={styles.label}>Descripción:</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={descripcionArticulo}
                                        onChangeText={setDescripcionArticulo}
                                        editable={permisoOperacion}
                                    />

                                    <Text style={styles.label}>Cantidad:</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={cantidadArticulo}
                                        onChangeText={setCantidadArticulo}
                                        keyboardType="numeric"
                                        editable={permisoOperacion}
                                    />

                                    <Text style={styles.label}>Precio Unitario:</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={precioUnitario}
                                        onChangeText={setPrecioUnitario}
                                        keyboardType="numeric"
                                        editable={permisoOperacion}
                                    />

                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={agregarArticulo}
                                        disabled={!permisoOperacion}
                                    >
                                        <Text style={styles.buttonText}>Agregar Artículo</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => setArticulosModalVisible(false)}
                                    >
                                        <Text style={styles.buttonText}>Cerrar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

export default CrearFactura;
