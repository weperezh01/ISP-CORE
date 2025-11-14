import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Switch,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    FlatList,
} from 'react-native';
import { Card } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getStyles } from './DetalleFacturaStyles'; // Importar los estilos
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid } from 'react-native';
import { Menu, IconButton } from 'react-native-paper';
import ConexionCard from './Cards/ConexionCard'; 
import FacturaCard from './Cards/FacturaCard'; 
import NotasCard from './Cards/NotasCard'; 
import ClienteCard from './Cards/ClienteCard'; 
import PrinterSelectionModal from './Modals/PrinterSelectionModal'; 
import ReviewNoteModal from './Modals/ReviewNoteModal'; 
import requestBluetoothPermissions from './Functions/BluetoothPermissionsRequest'; 
import procesarRecepcion from './Functions/ProcesarRecepcion'; 
import guardarNuevoMonto from './Functions/GuardarNuevoMonto'; 
import registrarNavegacion from './Functions/RegisterNavigation'; 
import formatDate from './Functions/FormatDateUtility'; 
import handleGuardarNotaRevision from './Functions/GuardarNotaRevision';
import handlePrintFactura from './Functions/handlePrintFactura';
import HorizontalMenu from '../../../../componentes/HorizontalMenu';
import MenuModal from '@/app/componentes/MenuModal';
// import { BleManager } from 'react-native-ble-plx';

console.log('Bluetooth:', BleManager);

const DetalleFacturaScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [facturaData, setFacturaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [montoRecibido, setMontoRecibido] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [nuevoMontoTotal, setNuevoMontoTotal] = useState('');
    const [idUsuario, setIdUsuario] = useState('');
    const [permisoOperacion, setPermisoOperacion] = useState(false);

    const id_factura = route.params?.id_factura;
    const id_ciclo = route.params?.id_ciclo;
    const id_usuario = route.params?.id_usuario;

    // Estado para la nota de revisión y el modal
    const [notaRevisada, setNotaRevisada] = useState('');
    const [notaActual, setNotaActual] = useState(null); // Nota actual que se toca para revisar
    const [modalNotaRevisionVisible, setModalNotaRevisionVisible] = useState(false); // Modal para escribir la nota de revisión
    const [notaMarcadaComoRevisada, setNotaMarcadaComoRevisada] = useState(false); // Check para marcar la nota como revisada

    const [modalPrinterVisible, setModalPrinterVisible] = useState(false);
    const [printerList, setPrinterList] = useState([]);
    const [selectedPrinter, setSelectedPrinter] = useState(null);

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(false);

    // Toggle the theme mode and save it to AsyncStorage
    const toggleTheme = async () => {
        const newMode = !isDarkMode; // Cambia el modo actual
        setIsDarkMode(newMode);
        await AsyncStorage.setItem('@theme', newMode ? 'dark' : 'light'); // Guarda el nuevo modo
    };

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

    // Cargar el modo inicial desde AsyncStorage
    useEffect(() => {
        const loadTheme = async () => {
            const theme = await AsyncStorage.getItem('@theme'); // Obtiene el tema
            setIsDarkMode(theme === 'dark'); // Si es 'dark', activa el modo oscuro
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
        if (facturaData) {
            console.log("Datos de la factura:");
            console.log(`ID Factura: ${facturaData.factura?.id_factura}`);
            console.log(`Fecha de Emisión: ${facturaData.factura?.fecha_emision}`);
            console.log(`Estado: ${facturaData.factura?.estado}`);
            console.log(`NCF: ${facturaData.factura?.ncf}`);
            console.log(`Subtotal: ${calcularSubtotal()}`);
            console.log(`Descuento: ${facturaData.factura?.descuento}`);
            console.log(`ITBIS: ${facturaData.factura?.itbis}`);
            console.log(`Monto Total: ${facturaData.factura?.monto_total}`);
            console.log(`Monto Recibido: ${facturaData.factura?.monto_recibido}`);

            console.log("Cliente:");
            console.log(`Nombre: ${facturaData.cliente?.nombres} ${facturaData.cliente?.apellidos}`);
            console.log(`Dirección: ${facturaData.cliente?.direccion}`);
            console.log(`Teléfonos: ${formatPhoneNumber(facturaData.cliente?.telefono1)}, ${formatPhoneNumber(facturaData.cliente?.telefono2)}`);
            console.log(`Correo: ${facturaData.cliente?.correo_elect}`);
            console.log(`Cédula/RNC: ${facturaData.cliente?.cedula || facturaData.cliente?.rnc}`);
            console.log(`Fecha de Creación del Cliente: ${facturaData.cliente?.fecha_creacion_cliente}`);

            console.log("Artículos:");
            facturaData.articulos?.forEach((articulo, index) => {
                console.log(`Artículo ${index + 1}:`);
                console.log(`Descripción: ${articulo.descripcion}`);
                console.log(`Cantidad: ${articulo.cantidad_articulo}`);
                console.log(`Precio Unitario: ${articulo.precio_unitario}`);
                console.log(`Total: ${articulo.cantidad_articulo * articulo.precio_unitario}`);
            });

            console.log("Conexión:");
            console.log(`ID Conexión: ${facturaData.conexion?.id_conexion}`);
            console.log(`Dirección de Instalación: ${facturaData.conexion?.direccion}`);
            console.log(`Referencia: ${facturaData.conexion?.referencia}`);
            console.log(`Estado: ${facturaData.conexion?.estado}`);
            console.log(`Fecha de Contratación: ${facturaData.conexion?.fecha_contratacion}`);

            console.log("Notas:");
            if (facturaData.notas?.length === 0) {
                console.log("No hay notas registradas.");
            } else {
                facturaData.notas?.forEach((nota, index) => {
                    console.log(`Nota ${index + 1}:`);
                    console.log(`Contenido: ${nota.nota}`);
                    console.log(`Estado de Revisión: ${nota.estado_revision}`);
                    console.log(`Autor: ${nota.nombre} ${nota.apellido}`);
                    console.log(`Fecha: ${nota.fecha}, Hora: ${nota.hora}`);
                });
            }
        }
    }, [facturaData]);

    useEffect(() => {
        loadSelectedPrinter();
    }, []);

    const loadSelectedPrinter = async () => {
        try {
            const printer = await AsyncStorage.getItem('selectedPrinter');
            if (printer) {
                setSelectedPrinter(JSON.parse(printer)); // Actualiza el estado con la impresora seleccionada
                console.log('Impresora seleccionada previamente:', JSON.parse(printer));
            }
        } catch (error) {
            console.error('Error al cargar la impresora seleccionada:', error);
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchFacturaDetails = async () => {
            try {
                const endpoints = [
                    'https://wellnet-rd.com:444/api/facturas/consulta-facturas-cobradas-por-id_factura', // nuevo
                    'https://wellnet-rd.com:444/api/consulta-facturas-cobradas-por-id_factura', // compatibilidad
                ];

                let data: any = null;
                let ok = false;
                let lastErr: any = null;

                for (const url of endpoints) {
                    try {
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_factura }),
                            signal: controller.signal,
                        });
                        const body = await response.json();
                        if (response.ok) { data = body; ok = true; break; }
                        lastErr = new Error(body?.message || `HTTP ${response.status}`);
                    } catch (e) { lastErr = e; }
                }

                if (!ok || !data) throw lastErr || new Error('Network response was not ok');

                setFacturaData(data);
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError('Failed to fetch data: ' + error.message);
                    console.error('Error fetching data:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        if (id_factura) {
            fetchFacturaDetails();
        } else {
            setError('ID de factura no proporcionado.');
            setLoading(false);
        }

        return () => {
            controller.abort();
        };
    }, [id_factura]);

    useEffect(() => {
        const obtenerIdUsuarioYPermisos = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
                if (userData && userData.id) {
                    setIdUsuario(userData.id);
                    // Fetch permissions
                    const permisosResponse = await axios.post('https://wellnet-rd.com:444/api/usuarios/obtener-permisos-usuario', {
                        id_usuario: userData.id,
                    });
                    const permisos = permisosResponse.data;
                    const permisoFacturacion = permisos.find(p => p.permiso === 'permiso_facturaciones');
                    if (permisoFacturacion) {
                        setPermisoOperacion(permisoFacturacion.activo === 1);
                    }
                }
            } catch (e) {
                console.error('Error al leer el nombre del usuario', e);
            }
        };
        obtenerIdUsuarioYPermisos();
        registrarNavegacion();
    }, []);

    useEffect(() => {
        const checkPermissions = async () => {
            await requestBluetoothPermissions();
        };
        checkPermissions();
    }, []);

    const botones = [
    { id: '4', screen: null, action: () => setMenuVisible(true), icon: 'bars' },
    { id: '5', screen: 'BusquedaScreen', icon: 'search' },
    { id: '1', icon: 'plus', action: () => openAddModal() }, // Botón para abrir el modal de agregar
    { id: '6', icon: 'edit', action: () => abrirEditModal() }, // Icono para editar
    { id: '7', icon: 'print', action: () => handlePrintFactura() }, // Icono para imprimir
    { id: '8', icon: 'share', action: () => Alert.alert('Compartir') }, // Icono para compartir
    { id: '2', title: 'Revisiones', screen: 'FacturasEnRevisionScreen', params: { estado: 'en_revision' } },
    { id: '3', title: 'Ingresos', screen: 'IngresosScreen' },
];



    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return 'N/A';
        const cleaned = ('' + phoneNumber).replace(/\D/g, '');
        const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return ['+1 ', '(', match[1], ') ', match[2], '-', match[3]].join('');
        }
        const localMatch = cleaned.match(/(\d{3})(\d{3})(\d{4})$/);
        if (localMatch) {
            return ['(', localMatch[1], ') ', localMatch[2], '-', localMatch[3]].join('');
        }
        return phoneNumber;
    };

    const calcularSubtotal = () => {
        return facturaData?.articulos?.reduce((acc, item) => acc + (item.cantidad_articulo * item.precio_unitario), 0) || 0;
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    const abrirEditModal = () => {
        setEditModalVisible(true);
    };

    const cerrarEditModal = () => {
        setEditModalVisible(false);
    };

    const styles = getStyles(isDarkMode);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!facturaData) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>No se encontraron datos para esta factura.</Text>
            </View>
        );
    }

    const subtotal = calcularSubtotal();
    const descuento = facturaData?.factura?.descuento || 0;
    const itbis = facturaData?.factura?.itbis || 0;
    const montoTotal = facturaData?.factura?.monto_total || 0;
    const montoRecibidoFactura = facturaData?.factura?.monto_recibido || 0;

    const abrirModal = () => {
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setModalPrinterVisible(false);
    };

    const onRecibir = async () => {
        if (!idUsuario || !id_ciclo) {
            Alert.alert('Error', 'ID de usuario o ID de ciclo no disponibles.');
            return;
        }

        Alert.alert(
            'Confirmar Recepción',
            '¿Estás seguro de que quieres recibir el dinero?',
            [
                {
                    text: 'Cancelar',
                    onPress: () => console.log('Cancelado'),
                    style: 'cancel',
                },
                { text: 'Aceptar', onPress: () => procesarRecepcion() },
            ],
        );
    };

    // Función que abre el modal cuando se toca la nota pendiente
    const handlePressNotaPendiente = (nota) => {
        setNotaActual(nota);  // Guardamos la nota que se está tocando
        setNotaRevisada('');  // Reiniciamos el valor de la nota a revisar
        setNotaMarcadaComoRevisada(false);  // Reiniciamos el check
        setModalNotaRevisionVisible(true);  // Abrimos el modal
    };

    // Función para cerrar el modal sin reiniciarlo innecesariamente
    const handleCerrarModal = () => {
        setModalNotaRevisionVisible(false);  // Cerramos el modal explícitamente
    };

    // Llama a esta función dentro de un evento o acción como onPress:
    <TouchableOpacity onPress={handlePrintFactura}>
        <Text>Imprimir</Text>
    </TouchableOpacity>
    
    // Función para listar impresoras disponibles y mostrar
    async function listAvailablePrinters() {
        try {
            const bleManager = new BleManager();
            bleManager.startDeviceScan(null, null, (error, device) => {
                if (error) {
                    console.error('Error al obtener dispositivos Bluetooth:', error);
                    Alert.alert('Error', 'No se pudieron obtener los dispositivos Bluetooth. Asegúrate de que el módulo esté correctamente vinculado.');
                    return;
                }
                if (device) {
                    setPrinterList((prevList) => {
                        if (!prevList.some((d) => d.id === device.id)) {
                            return [...prevList, device];
                        }
                        return prevList;
                    });
                }
            });

            setTimeout(() => {
                bleManager.stopDeviceScan();
            }, 5000);
            setModalPrinterVisible(true);
        } catch (error) {
            console.error('Error al obtener dispositivos Bluetooth:', error);
            Alert.alert('Error', 'No se pudieron obtener los dispositivos Bluetooth. Asegúrate de que el módulo esté correctamente vinculado.');
        }
    }

    // Función para cargar la impresora seleccionada
    async function CargarPrinterSeleccionado() {
        await loadSelectedPrinter();
        setModalPrinterVisible(false)
    }


    return (
        <View style={styles.container}>

            {/* <CustomHamburgerMenu
                icon="home"
                size={30}
                toggleTheme={toggleTheme}
                handlePrintFactura={handlePrintFactura}
                listAvailablePrinters={listAvailablePrinters}
                selectedPrinter={selectedPrinter}
            /> */}





            <View style={styles.content}>
                <View style={styles.printerInfoContainer}>
                    {selectedPrinter ? (
                        <Text style={styles.printerText}>
                            Impresora seleccionada:{" "}
                            <Text style={styles.printerName}>{selectedPrinter.deviceName}</Text>
                        </Text>
                    ) : (
                        <Text style={styles.noPrinterText}>No se ha seleccionado una impresora.</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handlePrintFactura}>
                    <Text style={styles.actionButtonText}>Imprimir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.listButton]}
                    onPress={listAvailablePrinters}>
                    <Text style={styles.actionButtonText}>Listar Impresoras</Text>
                </TouchableOpacity>
            </View>





            {/* Modal para seleccionar la impresora */}
            <PrinterSelectionModal
                modalPrinterVisible={modalPrinterVisible}
                styles={styles}
                printerList={printerList}
                CargarPrinterSeleccionado={CargarPrinterSeleccionado}
            />





            {/* Modal para agregar la nota de revisión */}
            <ReviewNoteModal
                modalNotaRevisionVisible={modalNotaRevisionVisible}
                styles={styles}
                notaRevisada={notaRevisada}
                setNotaRevisada={setNotaRevisada}
                notaMarcadaComoRevisada={notaMarcadaComoRevisada}
                setNotaMarcadaComoRevisada={setNotaMarcadaComoRevisada}
                handleCerrarModal={handleCerrarModal}
                handleGuardarNotaRevision={handleGuardarNotaRevision}
            />


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
                toggleTheme={toggleTheme} // Pasar toggleTheme para cambiar entre modos
            />

            {/* Contenido principal */}
            <ScrollView>

                {/* Tarjeta de Información del Cliente */}
                <ClienteCard
                    facturaData={facturaData}
                    styles={styles}
                    formatPhoneNumber={formatPhoneNumber}
                />

                {/* Tarjeta de Detalle de Factura */}
                <FacturaCard facturaData={facturaData} isDarkMode={isDarkMode} styles={styles} formatMoney={formatMoney} />

                {/* Tarjeta de Detalles de la Conexión */}
                <ConexionCard conexionData={facturaData?.conexion} styles={styles} />

                {/* Tarjeta para las notas */}
                <NotasCard
                    facturaData={facturaData}
                    styles={styles}
                    handlePressNotaPendiente={handlePressNotaPendiente}
                    formatDate={formatDate}
                />

            </ScrollView>

            {/* Menú Horizontal Reutilizable */}
            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />

        </View>
    );
};

export default DetalleFacturaScreen;
