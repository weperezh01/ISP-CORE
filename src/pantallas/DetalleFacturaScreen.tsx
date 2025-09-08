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
import { useTheme } from '../../ThemeContext';
import { getStyles } from './DetalleFacturaStyles'; // Importar los estilos
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid } from 'react-native';
import ThermalPrinterModule from 'react-native-thermal-printer';
import CustomHamburgerMenu from './Facturas/componentes/CustomHamburgerMenu';
import { Menu, IconButton } from 'react-native-paper';



console.log('ThermalPrinterModule:', ThermalPrinterModule);

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
    const { isDarkMode, toggleTheme } = useTheme();
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


    // Hook de depuración
    useEffect(() => {
        console.log("Render count");
    });


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
                const response = await fetch('https://wellnet-rd.com:444/api/consulta-facturas-cobradas-por-id_factura', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_factura }),
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setFacturaData(data);  // Las notas ahora vienen incluidas en "data"
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


    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const registrarNavegacion = async () => {
        await delay(2000);
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'DetalleFacturaScreen';

        const datos = JSON.stringify({
            id_factura: id_factura,
            id_ciclo: id_ciclo,
        });

        const navigationLogData = {
            id_usuario: id_usuario,
            fecha,
            hora,
            pantalla,
            datos
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
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

    const guardarNuevoMonto = async () => {
        try {
            const response = await axios.post(
                'https://wellnet-rd.com:444/api/actualizar-monto-total',
                {
                    id_factura,
                    nuevoMontoTotal: parseFloat(nuevoMontoTotal)
                }
            );
            if (response.status === 200) {
                setFacturaData(prevState => ({
                    ...prevState,
                    factura: {
                        ...prevState.factura,
                        monto_total: parseFloat(nuevoMontoTotal)
                    }
                }));
                cerrarEditModal();
                Alert.alert('Éxito', 'Monto total actualizado correctamente.');
            } else {
                Alert.alert('Error', 'No se pudo actualizar el monto total.');
            }
        } catch (error) {
            console.error('Error al actualizar el monto total:', error);
            Alert.alert('Error', 'No se pudo actualizar el monto total.');
        }
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

    const procesarRecepcion = async () => {
        const montoRecibidoFormatted = parseFloat(montoRecibido).toFixed(2);

        const datosParaEnviar = {
            id_cliente: facturaData.factura.id_cliente,
            monto: montoRecibidoFormatted,
            id_usuario: idUsuario,
            id_ciclo: id_ciclo,
            facturas: [{
                id_factura: facturaData.factura.id_factura,
                monto_cobrado: montoRecibidoFormatted,
                nota: '',
            }],
            cargos: [],
        };

        console.log('Enviando datos al backend:', datosParaEnviar);

        try {
            const response = await axios.post(
                'https://wellnet-rd.com:444/api/facturas-procesar-cobro',
                datosParaEnviar,
            );
            const reciboData = response.data;
            navigation.navigate('ReciboScreen', {
                reciboData: {
                    ...reciboData,
                    totalRecibir: montoRecibidoFormatted,
                    facturas: [facturaData],
                },
            });
            cerrarModal();
        } catch (error) {
            console.error('Error al enviar datos:', error);
            Alert.alert('Error', 'No se pudo procesar el cobro correctamente.');
        }
    };

    const formatDate = (dateString, timeString) => {
        console.log('Fecha recibida:', dateString, 'Hora recibida:', timeString);

        if (!dateString || dateString === '0000-00-00' || !Date.parse(dateString)) {
            return 'Fecha u hora no válida'; // Validar si la fecha es correcta
        }

        // Validar si la hora es correcta (00:00:00 a 23:59:59)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

        let timePart = '12:00:00'; // Hora por defecto
        if (timeRegex.test(timeString)) {
            timePart = timeString;
        } else {
            console.warn('Hora no válida recibida:', timeString);
        }

        // Crear un objeto Date usando la fecha y la hora
        const dateTimeString = `${dateString.split('T')[0]}T${timePart}`;
        const date = new Date(dateTimeString);

        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
            return 'Fecha u hora no válida';  // Si no es válida, devolver un mensaje
        }

        // Opciones de formato de fecha y hora
        const options = {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };

        return new Intl.DateTimeFormat('es-ES', options).format(date);
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


    const handleGuardarNotaRevision = async () => {
        if (notaRevisada.trim() === '') {
            Alert.alert('Error', 'Debe escribir una nota de revisión.');
            return;
        }

        if (!notaActual || !notaActual.id_nota) {
            Alert.alert('Error', 'No se ha seleccionado ninguna nota válida.');
            return;
        }

        try {
            const idFactura = facturaData.factura.id_factura;
            const idNotaSeleccionada = notaActual.id_nota; // Obtenemos el id_nota de la nota actual
            const nuevaNota = notaRevisada.trim();

            // Enviar el id_nota al backend al agregar una nueva nota de revisión
            const responseNota = await axios.post(
                'https://wellnet-rd.com:444/api/factura/nota/agregar',
                {
                    id_factura: idFactura,
                    id_usuario: idUsuario,
                    nota: nuevaNota,
                    id_nota_revisada: idNotaSeleccionada, // Aquí enviamos el id_nota de la nota seleccionada
                }
            );

            if (responseNota.status === 200) {
                // Actualizar el estado local para incluir la nueva nota
                setFacturaData(prevState => ({
                    ...prevState,
                    notas: [...prevState.notas, responseNota.data],
                }));

                if (notaMarcadaComoRevisada) {
                    // Si se marcó como revisada, actualizar el estado de la nota original
                    const responseRevision = await axios.post(
                        'https://wellnet-rd.com:444/api/factura/revision/actualizar',
                        {
                            id_factura: idFactura,
                            id_usuario_aprueba: idUsuario,
                            comentario: nuevaNota,
                            id_nota_revisada: idNotaSeleccionada, // Enviamos el id_nota al backend
                        }
                    );

                    if (responseRevision.status === 200) {
                        Alert.alert('Éxito', 'La nota ha sido marcada como revisada.');
                        // Actualizar el estado de la nota en facturaData.notas
                        setFacturaData(prevState => {
                            const notasActualizadas = prevState.notas.map(nota => {
                                if (nota.id_nota === idNotaSeleccionada) {
                                    return { ...nota, estado_revision: 'revisada' };
                                }
                                return nota;
                            });
                            return { ...prevState, notas: notasActualizadas };
                        });
                    } else {
                        const errorMsg = responseRevision.data.error || 'No se pudo actualizar la revisión.';
                        Alert.alert('Error', errorMsg);
                    }
                } else {
                    Alert.alert('Éxito', 'Nota guardada correctamente.');
                }
            } else {
                Alert.alert('Error', 'No se pudo guardar la nota.');
            }

            // Cerrar el modal y reiniciar los estados
            setModalNotaRevisionVisible(false);
            setNotaRevisada('');
            setNotaMarcadaComoRevisada(false);
            setNotaActual(null); // Reiniciar la nota actual
        } catch (error) {
            console.error('Error al guardar la nota:', error);
            Alert.alert('Error', 'No se pudo procesar la solicitud.');
        }
    };

    // Llama a esta función dentro de un evento o acción como onPress:
    <TouchableOpacity onPress={handlePrintFactura}>
        <Text>Imprimir</Text>
    </TouchableOpacity>

    const handlePrintFactura = async () => {
        if (!facturaData) {
            Alert.alert('Error', 'No hay detalles de factura para imprimir');
            return;
        }

        const printerCharactersPerLine = 32;

        const centerText = (text) => {
            let spaces = (printerCharactersPerLine - text.length) / 2;
            return spaces >= 0 ? ' '.repeat(spaces) + text : text;
        };

        const formatCurrency = (amount) => {
            const parsedAmount = parseFloat(amount) || 0; // Asegúrate de que amount sea un número
            return `RD$ ${parsedAmount.toFixed(2)}`; // Formatea a 2 decimales
        };


        const formatLine = (left, right) => {
            const totalLength = printerCharactersPerLine;
            const spaceLength = totalLength - (left.length + right.length);
            const spaces = ' '.repeat(spaceLength > 0 ? spaceLength : 0);
            return `${left}${spaces}${right}`;
        };

        let facturaString = '\x1B\x40'; // Inicializar impresora
        facturaString += '\x1B\x5D\x01'; // Seleccionar fuente B

        // Encabezado
        facturaString += centerText(`NOMBRE DE TU EMPRESA`) + '\n';
        facturaString += centerText(`Dirección de la empresa`) + '\n';
        facturaString += centerText(`Tel: (+XX) XXX XXX XXX`) + '\n';
        facturaString += centerText(`contacto@empresa.com`) + '\n';
        facturaString += centerText(`NIF/CIF: ABC123456789`) + '\n';
        facturaString += centerText(`--------------------------------`) + '\n';

        // Detalles de la factura
        // facturaString += formatLine(`Factura Nº: ${facturaData.factura.id_factura}`, `Fecha: ${new Date(facturaData.factura.fecha_emision).toLocaleDateString()}`) + '\n';
        facturaString += formatLine(
            `Factura Nº: ${facturaData.factura.id_factura}`,
            `Fecha: ${facturaData.factura.fecha_emision
                ? new Date(facturaData.factura.fecha_emision).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : 'N/A'}`
        ) + '\n';
        facturaString += centerText(`--------------------------------`) + '\n';
        facturaString += formatLine(
            `Ciclo:`,
            `${facturaData.ciclo.inicio ? new Date(facturaData.ciclo.inicio).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'} - ${facturaData.ciclo.final ? new Date(facturaData.ciclo.final).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}`
        ) + '\n';


        // Información del cliente
        facturaString += `Cliente:\n`;
        facturaString += `${facturaData.cliente.nombres} ${facturaData.cliente.apellidos}\n`;
        facturaString += `${facturaData.cliente.direccion}\n`;
        facturaString += `Tel: ${formatPhoneNumber(facturaData.cliente.telefono1)}\n`;
        facturaString += `Correo: ${facturaData.cliente.correo_elect || 'N/A'}\n`;
        facturaString += `NIF/CIF: ${facturaData.cliente.cedula || facturaData.cliente.rnc || 'N/A'}\n`;
        facturaString += centerText(`--------------------------------`) + '\n';

        // Descripción de servicios/productos
        facturaString += centerText(`Descripción de servicios:`) + '\n';
        facturaString += formatLine(`Cant`, `Importe`) + '\n';
        facturaString += centerText(`--------------------------------`) + '\n';

        facturaData.articulos.forEach((articulo) => {
            facturaString += `${articulo.descripcion}\n`;
            facturaString += formatLine(
                ` ${articulo.cantidad_articulo}`,
                formatCurrency(articulo.cantidad_articulo * articulo.precio_unitario)
            ) + '\n';
        });

        facturaString += centerText(`--------------------------------`) + '\n';

        // Totales
        facturaString += formatLine('Subtotal:', formatCurrency(calcularSubtotal())) + '\n';
        facturaString += formatLine('Descuento:', formatCurrency(facturaData.factura.descuento)) + '\n';
        facturaString += formatLine('ITBIS:', formatCurrency(facturaData.factura.itbis)) + '\n';
        facturaString += formatLine('Total:', formatCurrency(facturaData.factura.monto_total)) + '\n';
        facturaString += centerText(`--------------------------------`) + '\n';

        console.log('Subtotal:', calcularSubtotal());
        console.log('Descuento:', facturaData.factura.descuento);
        console.log('ITBIS:', facturaData.factura.itbis);
        console.log('Total:', facturaData.factura.monto_total);


        // Notas adicionales
        facturaString += `Forma de pago:\n`;
        facturaString += `[Transferencia bancaria]\n`;
        facturaString += `Número de cuenta:\n[Detalles bancarios]\n`;
        facturaString += centerText(`--------------------------------`) + '\n';
        facturaString += `Notas:\nGracias por su confianza.\n`;
        facturaString += `Pago vence en 30 días.\n`;
        facturaString += `Para dudas, contáctenos.\n`;


        await loadSelectedPrinter();
        // Configuración para la impresora
        const printerConfig = {
            // macAddress: '86:67:7A:81:F0:0D', // Cambia esto por la MAC de tu impresora
            macAddress: selectedPrinter?.macAddress || '', // Cambia esto por la MAC de tu impresora
            payload: facturaString,
            printerNbrCharactersPerLine: printerCharactersPerLine, // Ajusta según tu impresora
        };

        try {
            await ThermalPrinterModule.printBluetooth(printerConfig);
            Alert.alert('Éxito', 'Factura impresa correctamente.');
        } catch (error) {
            console.error('Error al imprimir:', error);
            Alert.alert('Error', 'No se pudo imprimir la factura. Verifica la conexión con la impresora.');
        }

    };


    async function requestBluetoothPermissions() {
        if (Platform.OS === 'android' && Platform.Version >= 31) {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    {
                        title: "Permiso para conectar Bluetooth",
                        message: "La aplicación necesita permiso para conectarse a dispositivos Bluetooth",
                        buttonNeutral: "Preguntar más tarde",
                        buttonNegative: "Cancelar",
                        buttonPositive: "Aceptar",
                    }
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("Permiso concedido");
                } else {
                    console.log("Permiso denegado");
                }
            } catch (err) {
                console.warn(err);
            }
        }
    }

    // Función para listar impresoras disponibles y mostrar
    async function listAvailablePrinters() {
        try {
            const printers = await ThermalPrinterModule.getBluetoothDeviceList();
            if (printers && printers.length > 0) {
                setPrinterList(printers);
            } else {
                Alert.alert('No hay impresoras', 'No se encontraron dispositivos Bluetooth disponibles.');
            }
            setModalPrinterVisible(true); // Mostrar modal
        } catch (error) {
            console.error('Error al obtener dispositivos Bluetooth:', error);
            Alert.alert('Error', 'No se pudieron obtener los dispositivos Bluetooth.');
        }
    }

    // Función para cargar la impresora seleccionada
    async function CargarPrinterSeleccionado() {
        await loadSelectedPrinter();
        setModalPrinterVisible(false)
    }


    return (
        <View style={styles.container}>

            <CustomHamburgerMenu
                icon="home"
                size={30}
                toggleTheme={toggleTheme}
                handlePrintFactura={handlePrintFactura}
                listAvailablePrinters={listAvailablePrinters}
                selectedPrinter={selectedPrinter}
            />





            {/* <View style={styles.content}>
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
            </View> */}






            <Modal visible={modalPrinterVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecciona una impresora</Text>
                        {printerList.length > 0 ? (
                            <FlatList
                                data={printerList}
                                keyExtractor={(item) => item.macAddress}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.printerItem}
                                        onPress={async () => {
                                            try {
                                                // Guardar la impresora seleccionada en AsyncStorage
                                                await AsyncStorage.setItem(
                                                    'selectedPrinter',
                                                    JSON.stringify(item) // Guarda el objeto impresora como JSON
                                                );
                                                console.log(`Impresora seleccionada: ${item.deviceName} (${item.macAddress})`);
                                                Alert.alert('Impresora seleccionada', item.deviceName);

                                                // Cerrar el modal
                                                CargarPrinterSeleccionado();
                                            } catch (error) {
                                                console.error('Error al guardar la impresora:', error);
                                                Alert.alert('Error', 'No se pudo guardar la impresora seleccionada.');
                                            }
                                        }}
                                    >
                                        <Text style={styles.printerText}>
                                            {item.deviceName || 'Sin nombre'} ({item.macAddress})
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <Text style={styles.noPrintersText}>No se encontraron impresoras disponibles.</Text>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => CargarPrinterSeleccionado()}
                        >
                            <Text style={styles.buttonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>




            {/* Modal para agregar la nota de revisión */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalNotaRevisionVisible}
                onRequestClose={handleCerrarModal}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalBackground}
                >
                    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Escribir nota de revisión</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Escribe tu nota"
                                    value={notaRevisada}
                                    onChangeText={setNotaRevisada}
                                    multiline
                                />

                                {/* Check para marcar la nota como revisada */}
                                <View style={styles.checkboxContainer}>
                                    <Switch
                                        value={notaMarcadaComoRevisada}
                                        onValueChange={(value) => setNotaMarcadaComoRevisada(value)}
                                    />
                                    <Text style={styles.checkboxLabel}>Marcar como revisada</Text>
                                </View>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.modalButton} onPress={handleCerrarModal}>
                                        <Text style={styles.buttonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalButton} onPress={handleGuardarNotaRevision}>
                                        <Text style={styles.buttonText}>Guardar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>

            {/* Contenido principal */}
            <ScrollView>

                {/* Tarjeta de Información del Cliente */}
                <Card style={styles.cardStyle}>
                    <Card.Title title={`Información del Cliente`} titleStyle={styles.header} />
                    <Card.Content>
                        <Text style={styles.text}>ID Cliente: {facturaData?.cliente?.id_cliente}</Text>
                        <Text style={styles.text}>Nombre Completo: {facturaData?.cliente?.nombres.trim()} {facturaData?.cliente?.apellidos.trim()}</Text>
                        <Text style={styles.text}>Teléfonos: {formatPhoneNumber(facturaData?.cliente?.telefono1)}, {facturaData?.cliente?.telefono2 ? formatPhoneNumber(facturaData?.cliente?.telefono2) : 'N/A'}</Text>
                        <Text style={styles.text}>Dirección: {facturaData?.cliente?.direccion}</Text>
                        <Text style={styles.text}>Correo Electrónico: {facturaData?.cliente?.correo_elect || 'N/A'}</Text>
                        <Text style={styles.text}>Cédula/RNC: {facturaData?.cliente?.cedula || facturaData?.cliente?.rnc || 'N/A'}</Text>
                        {/* <Text style={styles.text}>Fecha de Creación del Cliente: {new Date(facturaData?.cliente?.fecha_creacion_cliente).toLocaleDateString()}</Text> */}
                        <Text style={styles.text}>
                            Fecha de Creación del Cliente: {facturaData?.cliente?.fecha_creacion_cliente
                                ? new Date(facturaData.cliente.fecha_creacion_cliente).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                : 'N/A'}
                        </Text>
                    </Card.Content>
                </Card>


                {/* Tarjeta de Detalle de Factura */}
                <Card style={[styles.cardStyle, { backgroundColor: isDarkMode ? '#1c1c1c' : '#fff' }]}>
                    <Card.Title
                        title={`Factura #${facturaData?.factura?.id_factura}`}
                        titleStyle={[
                            styles.header,
                            { color: isDarkMode ? '#fff' : '#000' },
                        ]}
                    />
                    <Card.Content>
                        {/* Detalles de Factura */}
                        <View style={styles.facturaDetails}>
                            <Text style={[styles.text, { color: isDarkMode ? '#ddd' : '#333' }]}>
                                Fecha de Emisión:{" "}
                                {facturaData?.factura?.fecha_emision
                                    ? new Date(facturaData.factura.fecha_emision).toLocaleDateString("es-DO", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })
                                    : "N/A"}
                            </Text>
                            <Text style={[styles.text, { color: isDarkMode ? '#ddd' : '#333' }]}>
                                Ciclo:{" "}
                                {facturaData?.ciclo?.inicio
                                    ? new Date(facturaData.ciclo.inicio).toLocaleDateString("es-DO", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })
                                    : "N/A"}{" "}
                                -{" "}
                                {facturaData?.ciclo?.final
                                    ? new Date(facturaData.ciclo.final).toLocaleDateString("es-DO", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })
                                    : "N/A"}
                            </Text>
                            <Text style={[styles.text, { color: isDarkMode ? '#ddd' : '#333' }]}>
                                Estado: {facturaData?.factura?.estado}
                            </Text>
                            <Text style={[styles.text, { color: isDarkMode ? '#ddd' : '#333' }]}>
                                NCF: {facturaData?.factura?.ncf || "N/A"}
                            </Text>
                        </View>

                        {/* Tabla de Productos */}
                        <View style={[styles.tableContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f7f7f7' }]}>
                            {/* Encabezado */}
                            <View style={[styles.tableHeader, { borderBottomColor: isDarkMode ? '#444' : '#ccc' }]}>
                                <Text style={[styles.tableCellHeader, { flex: 1, color: isDarkMode ? '#fff' : '#000' }]}>
                                    Cant
                                </Text>
                                <Text style={[styles.tableCellHeader, { flex: 3, color: isDarkMode ? '#fff' : '#000' }]}>
                                    Descripción
                                </Text>
                                <Text style={[styles.tableCellHeader, { flex: 2, color: isDarkMode ? '#fff' : '#000' }]}>
                                    Importe
                                </Text>
                            </View>

                            {/* Filas */}
                            {facturaData?.articulos.map((item, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.tableRow,
                                        { backgroundColor: index % 2 === 0 ? (isDarkMode ? '#333' : '#fff') : (isDarkMode ? '#444' : '#f9f9f9') },
                                    ]}
                                >
                                    <Text style={[styles.tableCell, { flex: 1, color: isDarkMode ? '#fff' : '#000' }]}>
                                        {item.cantidad_articulo}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 3, color: isDarkMode ? '#fff' : '#000' }]}>
                                        {item.descripcion}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 2, color: isDarkMode ? '#fff' : '#000' }]}>
                                        {formatMoney(item.cantidad_articulo * item.precio_unitario)}
                                    </Text>
                                </View>
                            ))}

                            {/* Totales */}
                            <View style={{ borderBottomWidth: 1, borderColor: isDarkMode ? '#666' : '#ccc', marginVertical: 5 }} />
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                                <Text style={[styles.tableCell, { flex: 3, color: isDarkMode ? '#ddd' : '#333' }]}>
                                    Subtotal:
                                </Text>
                                <Text style={[styles.tableCell, { flex: 2, color: isDarkMode ? '#ddd' : '#333' }]}>
                                    {formatMoney(subtotal)}
                                </Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                                <Text style={[styles.tableCell, { flex: 3, color: isDarkMode ? '#ddd' : '#333' }]}>
                                    Descuento:
                                </Text>
                                <Text style={[styles.tableCell, { flex: 2, color: isDarkMode ? '#ddd' : '#333' }]}>
                                    {formatMoney(descuento)}
                                </Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                                <Text style={[styles.tableCell, { flex: 3, color: isDarkMode ? '#ddd' : '#333' }]}>
                                    ITBIS:
                                </Text>
                                <Text style={[styles.tableCell, { flex: 2, color: isDarkMode ? '#ddd' : '#333' }]}>
                                    {formatMoney(itbis)}
                                </Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                                <Text style={[styles.tableCell, { flex: 3, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>
                                    Monto Total:
                                </Text>
                                <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>
                                    {formatMoney(montoTotal)}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>



                {/* Tarjeta de Detalles de la Conexión */}
                <Card style={styles.cardStyle}>
                    <Card.Title title="Detalles de la Conexión" titleStyle={styles.header} />
                    <Card.Content>
                        <Text style={styles.text}>ID Conexión: {facturaData?.conexion?.id_conexion}</Text>
                        <Text style={styles.text}>Dirección de Instalación: {facturaData?.conexion?.direccion}</Text>
                        <Text style={styles.text}>Referencia: {facturaData?.conexion?.referencia || 'N/A'}</Text>
                        <Text style={styles.text}>Estado: {facturaData?.conexion?.estado_conexion}</Text>
                        {/* <Text style={styles.text}>Fecha de Contratación: {new Date(facturaData?.conexion?.fecha_contratacion).toLocaleDateString()}</Text> */}
                        <Text style={styles.text}>
                            Fecha de Contratación: {facturaData?.conexion?.fecha_contratacion
                                ? new Date(facturaData.conexion.fecha_contratacion).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                : 'N/A'}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Tarjeta para las notas */}
                <Card style={styles.cardStyle}>
                    <Card.Title title="Notas" titleStyle={styles.header} />
                    <Card.Content>
                        {facturaData?.notas.length === 0 ? (
                            <Text style={styles.text}>No hay notas registradas para esta factura.</Text>
                        ) : (
                            <FlatList
                                data={facturaData?.notas || []}
                                keyExtractor={(item) => item.id_nota.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (item.estado_revision === 'en_revision') {
                                                handlePressNotaPendiente(item);
                                            }
                                        }}
                                        disabled={item.estado_revision !== 'en_revision'} // Deshabilitar si no está pendiente de revisión
                                    >
                                        <View style={styles.notaContainer}>
                                            {/* Nota y autor */}
                                            <Text style={styles.notaText}>{item.nota}</Text>
                                            <Text style={styles.notaAuthor}>
                                                <Text style={styles.notaLabel}>Autor: </Text>
                                                {item.nombre} {item.apellido}
                                            </Text>

                                            {/* Fecha y hora */}
                                            <Text style={styles.notaDate}>
                                                {formatDate(item.fecha, item.hora)}
                                            </Text>

                                            {/* Estado de revisión */}
                                            {item.estado_revision && (
                                                <Text style={styles.revisionStatus}>
                                                    Estado de revisión: {item.estado_revision.replace('_', ' ')}
                                                </Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
};

export default DetalleFacturaScreen;
