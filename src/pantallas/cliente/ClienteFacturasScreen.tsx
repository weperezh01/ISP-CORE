import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput, Linking, Modal, ScrollView, Animated, Dimensions, Share } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import ThemeSwitch from '../../componentes/themeSwitch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
// Usar fallback debido a problema con el archivo original de estilos
import { getStyles } from './ClienteFacturasScreenStylesFallback';
import HorizontalMenu from '../../componentes/HorizontalMenu';
import MenuModal from '../../componentes/MenuModal';
import { buildAddressInfo } from '../../utils/addressFormatter';

const ClienteFacturasScreen = ({ route }) => {
    const { clientId, usuarioId } = route.params;
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const { width } = Dimensions.get('window');
    const [facturas, setFacturas] = useState([]);
    const [originalFacturas, setOriginalFacturas] = useState([]);
    const [filter, setFilter] = useState('');
    const [clientInfo, setClientInfo] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [idUsuario, setIdUsuario] = useState('');
    const [showClientDetails, setShowClientDetails] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    // Pago: método y detalles
    const [payMethodModalVisible, setPayMethodModalVisible] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null as null | 'efectivo' | 'transferencia' | 'cheque');
    const [bankName, setBankName] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [showExtraFields, setShowExtraFields] = useState(false);
    const [destAccount, setDestAccount] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [checkDate, setCheckDate] = useState(''); // YYYY-MM-DD
    const [paymentNote, setPaymentNote] = useState('');
    const [nota, setNota] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedFacturaId, setSelectedFacturaId] = useState(null);
    const [checklist, setChecklist] = useState([
        { id: 1, label: 'Factura en revisión', checked: false },
        { id: 2, label: 'Pago parcial', checked: false },
        { id: 3, label: 'Pendiente de aprobación', checked: false }
    ]);
    const [ispId, setIspId] = useState(null);  // Estado para almacenar el id_isp
    const addressInfo = useMemo(() => buildAddressInfo(clientInfo?.direccion, clientInfo?.referencia), [clientInfo?.direccion, clientInfo?.referencia]);
    const direccionPrincipal = addressInfo.principal || addressInfo.original;
    const referenciaDireccion = addressInfo.referencia;
    const gpsDireccion = addressInfo.gps;
    const mostrarDireccion = direccionPrincipal !== '' || Boolean(referenciaDireccion) || Boolean(gpsDireccion);
    const [addressModalVisible, setAddressModalVisible] = useState(false);

    // Estados para animación de header y menu
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerHeight = useRef(new Animated.Value(1)).current;
    const menuHeight = useRef(new Animated.Value(1)).current;
    const lastScrollY = useRef(0);
    const isHidden = useRef(false);
    const isAnimating = useRef(false);

    // Función para manejar el scroll y animación del header y menu
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;
                
                // Evitar animaciones si ya hay una en curso
                if (isAnimating.current) return;
                
                if (Math.abs(diff) > 15 && currentScrollY > 50) {
                    if (diff > 0 && !isHidden.current) {
                        // Scroll hacia arriba - ocultar header y menu
                        isHidden.current = true;
                        isAnimating.current = true;
                        
                        Animated.parallel([
                            Animated.timing(headerHeight, {
                                toValue: 0,
                                duration: 200,
                                useNativeDriver: false,
                            }),
                            Animated.timing(menuHeight, {
                                toValue: 0,
                                duration: 200,
                                useNativeDriver: false,
                            })
                        ]).start(() => {
                            isAnimating.current = false;
                        });
                    } else if (diff < 0 && isHidden.current) {
                        // Scroll hacia abajo - mostrar header y menu
                        isHidden.current = false;
                        isAnimating.current = true;
                        
                        Animated.parallel([
                            Animated.timing(headerHeight, {
                                toValue: 1,
                                duration: 200,
                                useNativeDriver: false,
                            }),
                            Animated.timing(menuHeight, {
                                toValue: 1,
                                duration: 200,
                                useNativeDriver: false,
                            })
                        ]).start(() => {
                            isAnimating.current = false;
                        });
                    }
                }
                lastScrollY.current = currentScrollY;
            }
        }
    );

    const currentDateTime = new Date();
    console.log('Fecha y Hora:', currentDateTime.toLocaleString());
    console.log('clientInfo:', JSON.stringify(clientInfo, null, 2));

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

    const botones = [
        {
            id: '6',
            title: 'Buscar',
            screen: 'ClientListScreen',
            icon: 'search',
            action: () => setSearchVisible((prev) => !prev) // Alternar visibilidad
        },
        { id: '8', title: 'Filtrar', screen: 'ClientListScreen', icon: 'filter', action: () => setModalVisible(!modalVisible) },
        // { id: '5', title: 'Nueva Factura', screen: 'ClientListScreen', icon: 'plus' },
        {
            id: '5',
            title: 'Nueva Factura',
            screen: 'NuevaFacturaScreen', // Nombre de la pantalla
            icon: 'plus',
            action: () => navigation.navigate('NuevaFacturaScreen', {id_cliente: clientId, clientInfo }), // Enviar datos del cliente
        },        
        // { id: '7', title: 'Tipos de conexión', screen: 'TiposDeConexionScreen', icon: 'plug' },
        { id: '1', title: 'Clientes', screen: 'ClientListScreen', icon: 'users' },
        { id: '2', title: 'Ciclos Facturaciones', screen: 'FacturacionesScreen', icon: 'file-text' },
        { id: '3', title: 'Reportes', screen: 'IngresosScreen', icon: 'bar-chart' },
        {
            id: '4',
            title: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
            icon: isDarkMode ? 'sun-o' : 'moon-o',
            action: toggleTheme, // Aquí se conecta al mismo toggleTheme del switch
        },
    ];
    
    useEffect(() => {
        const obtenerIspId = async () => {
            try {
                const ispId = await AsyncStorage.getItem('@selectedIspId');
                if (ispId) {
                    setIspId(ispId);
                }
            } catch (error) {
                console.error('Error al recuperar el ID del ISP', error);
            }
        };

        obtenerIspId();
    }, []);



    const toggleChecklistItem = (id) => {
        setChecklist(prevChecklist =>
            prevChecklist.map(item =>
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        );
    };




    const delay = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

    const registrarNavegacion = async () => {
        // Introduce un retardo de 2 segundos
        // await delay(2000);

        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'ClienteFacturasScreen';

        const datos = JSON.stringify({
            clientId,
            usuarioId
            // facturas: facturas.map(factura => factura.id_factura)
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


    const [facturasCount, setFacturasCount] = useState({
        todas: 0,
        vigentes: 0,
        vencidas: 0,
        pagadas: 0,
    });

    useEffect(() => {
        obtenerNombreUsuario();
    }, [clientId]);

    useFocusEffect(
        useCallback(() => {
            fetchFacturas();
            registrarNavegacion();
        }, [clientId])
    );

    useEffect(() => {
        let total = 0;
        facturas.forEach(factura => {
            if (factura.isSelected) {
                const montoRestante = parseFloat(factura.monto_total) - (factura.monto_recibido ? parseFloat(factura.monto_recibido) : 0);
                total += factura.partialPaymentActive && factura.partialPayment ? parseFloat(factura.partialPayment) : montoRestante;
            }
        });
        setTotalAmount(total);
    }, [facturas]);

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        date.setDate(date.getDate() + 1); // Adjust the date to correct the issue
        const day = date.getDate();
        const monthNames = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} de ${month} del ${year}`;
    };

    const formatTime = (timeString) => {
        const [hour, minute, second] = timeString.split(':');
        let hour12 = hour % 12 || 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minute}:${second} ${ampm}`;
    };


    // Function to calculate the remaining amount
    const calculateMonto = (monto_total, monto_recibido) => {
        return parseFloat(monto_total) - (monto_recibido ? parseFloat(monto_recibido) : 0);
    };




    const obtenerNombreUsuario = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
            if (userData) {
                setNombreUsuario(userData.nombre);
                setIdUsuario(userData.id);
            }
        } catch (e) {
            console.error('Error al leer el nombre y ID del usuario', e);
        }
    };

    const fetchFacturas = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/facturas-cliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_cliente: clientId })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch invoices');
            }

            let data = await response.json();
            data = data.reverse();
            setFacturas(data);
            setOriginalFacturas(data);

            if (data.length > 0) {
                setClientInfo({
                    id_cliente: data[0].id_cliente,
                    nombres: data[0].nombres,
                    apellidos: data[0].apellidos,
                    telefono: data[0].telefono1,
                    direccion: data[0].direccion,
                });
            }

            const now = new Date();
            const vigentes = data.filter(factura => {
                const fechaEmision = new Date(factura.fecha_emision);
                const diffTime = Math.abs(now - fechaEmision);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return factura.estado === 'pendiente' && diffDays <= 30;
            }).length;

            const vencidas = data.filter(factura => {
                const fechaEmision = new Date(factura.fecha_emision);
                const diffTime = Math.abs(now - fechaEmision);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return factura.estado === 'pendiente' && diffDays > 30;
            }).length;

            const pagadas = data.filter(factura => factura.estado === 'pagado').length;

            setFacturasCount({
                todas: data.length,
                vigentes,
                vencidas,
                pagadas,
            });

        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    const handleSendSMS = (phoneNumber) => {
        const url = `sms:${phoneNumber}`;
        Linking.openURL(url)
            .then(() => registrarSMS(clientInfo.id_cliente, idUsuario))
            .catch(err => console.error('Error sending SMS', err));
    };

    const handleSendWhatsApp = (phoneNumber) => {
        const phone = phoneNumber.replace(/\D/g, '');
        Linking.openURL(`https://wa.me/${phone}`)
            .then(() => registrarWhatsApp(clientInfo.id_cliente, idUsuario))
            .catch(err => console.error('Error opening WhatsApp', err));
    };

    const handlePhoneCall = () => {
        makeCall(selectedPhone);
        closePhoneModal();
    };

    const handlePhoneSms = () => {
        handleSendSMS(selectedPhone);
        closePhoneModal();
    };

    const handlePhoneWhatsApp = () => {
        handleSendWhatsApp(selectedPhone);
        closePhoneModal();
    };

    const registrarSMS = async (id_cliente, idUsuario) => {
        try {
            const response = await fetch('https://wellnet-rd.com/api/registrar-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_usuario: idUsuario, id_cliente })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo registrar el intento de SMS');
            }

            console.log('Intento de SMS registrado exitosamente');
        } catch (error) {
            console.error('Error al registrar el intento de SMS:', error.message);
            Alert.alert('Error', error.message);
        }
    };

    const registrarWhatsApp = async (id_cliente, idUsuario) => {
        try {
            const response = await fetch('https://wellnet-rd.com/api/registrar-whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_usuario: idUsuario, id_cliente })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo registrar el intento de WhatsApp');
            }

            console.log('Intento de WhatsApp registrado exitosamente');
        } catch (error) {
            console.error('Error al registrar el intento de WhatsApp:', error.message);
            Alert.alert('Error', error.message);
        }
    };

    const registrarLlamada = async (id_cliente, idUsuario) => {
        try {
            const response = await fetch('https://wellnet-rd.com/api/registrar-llamada', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_usuario: idUsuario, id_cliente })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo registrar la llamada');
            }

            console.log('Llamada registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la llamada:', error.message);
            Alert.alert('Error', error.message);
        }
    };

    const [phoneModalVisible, setPhoneModalVisible] = useState(false);
    const [selectedPhone, setSelectedPhone] = useState('');

    const openPhoneModal = (phoneNumber) => {
        if (!phoneNumber) {
            Alert.alert('Número de teléfono no disponible');
            return;
        }
        setSelectedPhone(phoneNumber);
        setPhoneModalVisible(true);
    };

    const closePhoneModal = () => {
        setPhoneModalVisible(false);
    };

    const makeCall = (phoneNumber) => {
        const url = `tel:${phoneNumber}`;
        Linking.openURL(url)
            .then(() => registrarLlamada(clientInfo.id_cliente, idUsuario))
            .catch(err => console.error('Error making a call', err));
    };

    const handleDireccionPress = () => {
        if (!direccionPrincipal && !addressInfo.coords) {
            return;
        }
        setAddressModalVisible(true);
    };

    const handleAbrirMapa = () => {
        if (!addressInfo.coords) {
            setAddressModalVisible(false);
            return;
        }
        const query = `${addressInfo.coords.lat},${addressInfo.coords.lng}`;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        Linking.openURL(url)
            .catch(() => Alert.alert('Error', 'No se pudo abrir Google Maps.'))
            .finally(() => setAddressModalVisible(false));
    };

    const handleCompartirUbicacion = async () => {
        const query = addressInfo.coords ? `${addressInfo.coords.lat},${addressInfo.coords.lng}` : direccionPrincipal;
        if (!query) {
            return;
        }
        const mapsUrl = addressInfo.coords
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addressInfo.coords.lat},${addressInfo.coords.lng}`)}`
            : direccionPrincipal;
        const message = [
            `Ubicación del cliente: ${direccionPrincipal || 'Sin dirección'}`,
            referenciaDireccion ? `Referencia: ${referenciaDireccion}` : null,
            addressInfo.coords ? `Coordenadas: ${addressInfo.coords.lat}, ${addressInfo.coords.lng}` : null,
            mapsUrl
        ].filter(Boolean).join('\n');

        try {
            await Share.share({ message });
        } catch (error) {
            // noop
        } finally {
            setAddressModalVisible(false);
        }
    };

    const renderDireccionModal = () => (
        <Modal
            transparent
            visible={addressModalVisible}
            animationType="fade"
            onRequestClose={() => setAddressModalVisible(false)}
        >
            <View style={styles.addressModalOverlay}>
                <View style={styles.addressModalCard}>
                    <Text style={styles.addressModalTitle}>Ubicación del cliente</Text>
                    {direccionPrincipal ? (
                        <Text style={styles.addressModalSubtitle}>{direccionPrincipal}</Text>
                    ) : null}
                    {addressInfo.coords && (
                        <Text style={styles.addressModalCoords}>
                            {addressInfo.coords.lat}, {addressInfo.coords.lng}
                        </Text>
                    )}
                    <View style={styles.addressModalButtons}>
                        {addressInfo.coords && (
                            <TouchableOpacity
                                style={[styles.addressModalButton, styles.addressModalPrimary]}
                                onPress={handleAbrirMapa}
                            >
                                <Text style={styles.addressModalButtonText}>Abrir en Google Maps</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.addressModalButton, styles.addressModalSecondary]}
                            onPress={handleCompartirUbicacion}
                        >
                            <Text style={styles.addressModalSecondaryText}>Compartir ubicación</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                        <Text style={styles.addressModalCancel}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderPhoneModal = () => (
        <Modal
            transparent
            visible={phoneModalVisible}
            animationType="fade"
            onRequestClose={closePhoneModal}
        >
            <View style={styles.phoneModalOverlay}>
                <View style={styles.phoneModalCard}>
                    <Text style={styles.phoneModalTitle}>Contacto</Text>
                    <Text style={styles.phoneModalNumber}>{selectedPhone}</Text>
                    <View style={styles.phoneModalButtons}>
                        <TouchableOpacity
                            style={[styles.phoneModalButton, styles.phoneModalPrimary]}
                            onPress={handlePhoneCall}
                        >
                            <Text style={styles.phoneModalButtonText}>Llamar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.phoneModalButton, styles.phoneModalPrimary]}
                            onPress={handlePhoneSms}
                        >
                            <Text style={styles.phoneModalButtonText}>Enviar SMS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.phoneModalButton, styles.phoneModalSecondary]}
                            onPress={handlePhoneWhatsApp}
                        >
                            <Text style={styles.phoneModalSecondaryText}>WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={closePhoneModal}>
                        <Text style={styles.phoneModalCancel}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const applyFilter = (filterType) => {
        setFilter(filterType);

        if (filterType === '') {
            setFacturas(originalFacturas);
        } else if (filterType === 'Vigente') {
            const now = new Date();
            const filteredFacturas = originalFacturas.filter(factura => {
                const fechaEmision = new Date(factura.fecha_emision);
                const diffTime = Math.abs(now - fechaEmision);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return factura.estado === 'pendiente' && diffDays <= 30;
            });
            setFacturas(filteredFacturas);
        } else if (filterType === 'Vencida') {
            const now = new Date();
            const filteredFacturas = originalFacturas.filter(factura => {
                const fechaEmision = new Date(factura.fecha_emision);
                const diffTime = Math.abs(now - fechaEmision);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return factura.estado === 'pendiente' && diffDays > 30;
            });
            setFacturas(filteredFacturas);
        } else if (filterType === 'Pagada') {
            const filteredFacturas = originalFacturas.filter(factura => factura.estado === 'pagado');
            setFacturas(filteredFacturas);
        }
    };

    const handleCobrarPress = (id_factura, monto_total, monto_recibido) => {
        setFacturas(prevFacturas => {
            let newTotalAmount = totalAmount;
            const updatedFacturas = prevFacturas.map(factura => {
                if (factura.id_factura === id_factura) {
                    const monto = calculateMonto(monto_total, monto_recibido);

                    if (factura.isSelected) {
                        const montoARestar = factura.partialPaymentActive && factura.partialPayment ? parseFloat(factura.partialPayment) : monto;
                        newTotalAmount -= montoARestar;
                    } else {
                        const montoASumar = factura.partialPaymentActive && factura.partialPayment ? parseFloat(factura.partialPayment) : monto;
                        newTotalAmount += montoASumar;
                    }

                    return {
                        ...factura,
                        isSelected: !factura.isSelected,
                        disablePartialPayment: !factura.isSelected,
                    };
                }
                return factura;
            });
            setTotalAmount(newTotalAmount);
            return updatedFacturas;
        });
    };

    const handlePartialPaymentChange = (id_factura, value) => {
        setFacturas(prevFacturas =>
            prevFacturas.map(factura =>
                factura.id_factura === id_factura
                    ? { ...factura, partialPayment: value }
                    : factura
            )
        );
    };

    const togglePartialPayment = (id_factura) => {
        setFacturas(prevFacturas =>
            prevFacturas.map(factura => {
                if (factura.id_factura === id_factura) {
                    return {
                        ...factura,
                        partialPaymentActive: !factura.partialPaymentActive,
                        partialPayment: factura.partialPaymentActive ? null : factura.partialPayment,
                    };
                }
                return factura;
            })
        );
    };

    const handleFacturaPress = (id_factura) => {
        navigation.navigate('DetalleFacturaPantalla', {
            id_factura: id_factura,
            id_cliente: clientId,
            id_usuario: usuarioId
        });
    };


    // onPress={() => navigation.navigate('DetalleFacturaPantalla', { id_factura: item.id_factura, factura: item, isDarkMode: isDarkMode, id_cliente: item.id_cliente })}





    const handleNotaPress = (id_factura) => {
        setSelectedFacturaId(id_factura);
        setModalVisible(true);
    };

    const guardarNota = async () => {
        if (!nota.trim()) {
            Alert.alert('Error', 'La nota no puede estar vacía.');
            return;
        }

        try {
            // 1. Guardar la nota
            const responseNota = await fetch('https://wellnet-rd.com:444/api/guardar-nota-factura', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nota,
                    id_usuario: idUsuario,
                    id_factura: selectedFacturaId,
                    id_recibo: 0,
                    fecha: new Date().toISOString().split('T')[0],
                    hora: new Date().toLocaleTimeString('en-GB')
                })
            });

            const notaData = await responseNota.json(); // Obtener los datos de la respuesta

            if (!responseNota.ok) {
                throw new Error('Error al guardar la nota');
            }

            const idNota = notaData.id_nota; // Capturar el id_nota de la respuesta
            Alert.alert('Nota guardada', 'La nota ha sido guardada exitosamente.');
            setNota('');
            setModalVisible(false);

            // 2. Registrar la revisión de la factura con el id_nota recién creado
            const facturaEnRevision = checklist.find(item => item.id === 1).checked; // Factura en revisión
            if (facturaEnRevision) {  // Solo hacer la llamada si la revisión está marcada
                const responseRevision = await fetch('https://wellnet-rd.com:444/api/registrar-revision', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_usuario: idUsuario,
                        id_factura: selectedFacturaId,
                        id_nota: idNota, // Usar el id_nota devuelto
                        id_isp: ispId  // Asegúrate de enviar el id_isp aquí
                    })
                });

                const revisionData = await responseRevision.json();
                if (responseRevision.ok) {
                    Alert.alert('Revisión actualizada', revisionData.message);
                } else {
                    throw new Error(revisionData.message || 'Error al registrar la revisión');
                }
            }
        } catch (error) {
            console.error('Error al guardar la nota o registrar la revisión:', error);
            Alert.alert('Error', 'No se pudo guardar la nota o actualizar la revisión.');
        }
    };




    const renderFactura = ({ item }) => {
        const fechaEmision = new Date(item.fecha_emision);
        const fechaCobrada = new Date(item.fecha_cobrada);

        const diffTime = Math.abs(fechaCobrada - fechaEmision);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const isPagoATiempo = diffDays <= 40;
        const diasATiempo = diffDays > 30 && diffDays <= 40 ? diffDays - 30 : 0;
        const diasTardanza = !isPagoATiempo ? diffDays - 40 : 0;

        const formattedDate = new Date(fechaEmision.setDate(fechaEmision.getDate() + 1)).toLocaleDateString('es-DO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const formattedCobradaDate = new Date(fechaCobrada.setDate(fechaCobrada.getDate() + 1)).toLocaleDateString('es-DO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const isPagada = item.estado === 'pagado';
        const montoRestante = isPagada
            ? parseFloat(item.monto_total)
            : parseFloat(item.monto_total) - parseFloat(item.monto_recibido || 0);

        const formattedMontoRestante = new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2,
        }).format(montoRestante);

        const nombreServicio = item.conexion?.tipoServicio?.nombre_servicio || 'Servicio no especificado';
        const isSelected = item.isSelected;

        const formattedPartialPayment = item.partialPayment
            ? new Intl.NumberFormat('es-DO', {
                style: 'currency',
                currency: 'DOP',
                minimumFractionDigits: 2,
            }).format(item.partialPayment)
            : null;

        const getStatusStyle = () => {
            if (isPagada) return styles.statusPagado;
            
            const now = new Date();
            const diffTime = Math.abs(now - fechaEmision);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 30) return styles.statusVencido;
            return styles.statusPendiente;
        };

        return (
            <TouchableOpacity
                onPress={() => handleFacturaPress(item.id_factura)}
                style={[
                    styles.facturaCard,
                    isSelected && styles.selectedFacturaCard
                ]}
                activeOpacity={0.7}
            >
                <View style={styles.facturaHeader}>
                    <Text style={styles.facturaNumber}>#{item.id_factura}</Text>
                    <Text style={[styles.facturaStatus, getStatusStyle()]}>
                        {item.estado === 'pagado' ? 'Pagado' : item.estado === 'pendiente' ? 'Pendiente' : 'Vencido'}
                    </Text>
                </View>
                
                <View style={styles.facturaRow}>
                    <View style={styles.facturaDataColumn}>
                        <Text style={styles.facturaText}>🏷️ {nombreServicio}</Text>
                        <Text style={styles.facturaText}>📅 Emisión: {formattedDate}</Text>
                        {isPagada && (
                            <Text style={styles.facturaText}>💰 Cobrada: {formattedCobradaDate}</Text>
                        )}
                        <Text style={styles.facturaAmount}>💵 {formattedMontoRestante}</Text>

                        {isPagada && (
                            <Text style={[
                                styles.facturaText,
                                isPagoATiempo ? styles.pagoATiempo : styles.pagoConTardanza
                            ]}>
                                {isPagoATiempo
                                    ? diasATiempo > 0
                                        ? `✅ Pago a tiempo (+${diasATiempo}d)`
                                        : '✅ Pago a tiempo'
                                    : `⚠️ Pago tardío (+${diasTardanza}d)`}
                            </Text>
                        )}

                        {item.partialPayment && item.partialPayment < montoRestante && (
                            <Text style={[styles.facturaText, { color: isDarkMode ? '#FFA726' : '#FF6F00' }]}>
                                💳 Pago parcial: {formattedPartialPayment}
                            </Text>
                        )}

                        {/* Mostrar la lista de notas */}
                        {item.notas && item.notas.length > 0 && (
                            <View style={styles.notasContainer}>
                                <Text style={styles.notasTitle}>📝 Notas:</Text>
                                {item.notas.map((nota, index) => (
                                    <Text key={index} style={styles.notaText}>
                                        {formatDate(nota.fecha)} • {formatTime(nota.hora)}
                                        {"\n"}{nota.nota}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.facturaButtonColumn}>
                        {!isPagada && (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.cobrarButton,
                                        isSelected && styles.selectedCobrarButton
                                    ]}
                                    onPress={() => handleCobrarPress(item.id_factura)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.buttonText}>
                                        {isSelected ? '✓ Seleccionado' : 'Cobrar'}
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[styles.button, styles.notaButton]}
                                    onPress={() => handleNotaPress(item.id_factura)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.buttonText}>📝 Nota</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.button, 
                                        styles.partialPaymentButton,
                                        (item.disablePartialPayment || isSelected) && { opacity: 0.5 }
                                    ]}
                                    onPress={() => togglePartialPayment(item.id_factura)}
                                    disabled={item.disablePartialPayment || isSelected}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.buttonText}>💳 Parcial</Text>
                                </TouchableOpacity>

                                {item.partialPaymentActive && (
                                    <TextInput
                                        style={[
                                            styles.partialPaymentInput,
                                            item.disablePartialPayment && styles.disabledInput
                                        ]}
                                        keyboardType="numeric"
                                        placeholder="Monto"
                                        placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                        value={item.partialPayment?.toString() || ''}
                                        onChangeText={text => handlePartialPaymentChange(item.id_factura, text)}
                                        editable={!item.disablePartialPayment}
                                    />
                                )}
                            </>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFilterButton = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                filter === item.value && styles.selectedButton,
            ]}
            onPress={() => applyFilter(item.value)}
        >
            <Text style={[
                styles.filterText,
                filter === item.value && styles.selectedButtonText,
            ]}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );

    const filterButtons = [
        { label: `Todas (${facturasCount.todas})`, value: '' },
        { label: `Vigentes (${facturasCount.vigentes})`, value: 'Vigente' },
        { label: `Vencidas (${facturasCount.vencidas})`, value: 'Vencida' },
        { label: `Pagadas (${facturasCount.pagadas})`, value: 'Pagada' },
    ];

    const proceedCobro = async (metodo: 'efectivo' | 'transferencia' | 'cheque', detalles?: { banco?: string; referencia?: string }) => {
        try {
            if (!idUsuario) {
                Alert.alert('Error', 'No se pudo obtener el ID de usuario.');
                return;
            }

            const facturasToCobrar = facturas.filter(factura => factura.isSelected).map(factura => ({
                id_factura: factura.id_factura,
                monto_cobrado: factura.partialPaymentActive && factura.partialPayment
                    ? parseFloat(factura.partialPayment)
                    : parseFloat(factura.monto_total) - parseFloat(factura.monto_recibido || 0),
                nota: '',
                id_ciclo: factura.id_ciclo
            }));

            const now = new Date();
            facturas.filter(factura => {
                const fechaEmision = new Date(factura.fecha_emision);
                const diffTime = Math.abs(now - fechaEmision);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return !factura.isSelected && factura.estado === 'pendiente' && diffDays > 30;
            }).forEach(factura => {
                facturasToCobrar.push({
                    id_factura: factura.id_factura,
                    monto_cobrado: 0,
                    nota: '',
                    id_ciclo: factura.id_ciclo
                });
            });

            const id_ciclo = facturasToCobrar.length > 0 ? facturasToCobrar[0].id_ciclo : null;

            if (!id_ciclo) {
                Alert.alert('Error', 'No se pudo obtener el ID del ciclo.');
                return;
            }

            const payload: any = {
                id_cliente: clientId,
                monto: totalAmount,
                id_usuario: idUsuario,
                id_ciclo: id_ciclo,
                facturas: facturasToCobrar,
                id_isp: ispId,
                cargos: [],
                metodo_pago: metodo,
            };
            if (detalles && (detalles.banco || detalles.referencia)) {
                payload.detalle_pago = detalles;
            }

            const response = await fetch('https://wellnet-rd.com:444/api/facturas-procesar-cobro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const responseData = await response.json();
                Alert.alert('Dinero Recibido', `Has recibido un total de RD$${totalAmount.toFixed(2)}`);
                navigation.navigate('ReciboScreen', { reciboData: responseData, id_isp: ispId });
            } else {
                Alert.alert('Error', 'Hubo un error al procesar el cobro.');
            }
        } catch (error) {
            console.error('Error al procesar el cobro:', error);
            Alert.alert('Error', 'Hubo un error al procesar el cobro.');
        }
    };

    const confirmAndProceed = (metodo: 'efectivo' | 'transferencia' | 'cheque', detalles?: { banco?: string; referencia?: string }) => {
        Alert.alert(
            'Confirmación',
            `¿Confirmas que deseas recibir un total de RD$${totalAmount.toFixed(2)}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => proceedCobro(metodo, detalles) }
            ]
        );
    };

    const handleFooterPress = async () => {
        if (totalAmount > 0) {
            setPayMethodModalVisible(true);
        } else {
            Alert.alert('No hay dinero a recibir', 'Seleccione facturas para recibir dinero.');
        }
    };


    return (
        <View style={styles.container}>
            {renderDireccionModal()}
            {renderDireccionModal()}
            {renderPhoneModal()}
            {/* Menú Horizontal Animado - Encima de la cabecera */}
            <Animated.View style={[
                {
                    height: menuHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width < 400 ? 50 : 60], // Altura dinámica según tamaño
                    }),
                    overflow: 'hidden',
                    transform: [{
                        translateY: menuHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -50 : -60, 0],
                        })
                    }]
                }
            ]}>
                <HorizontalMenu
                    botones={botones}
                    navigation={navigation}
                    isDarkMode={isDarkMode}
                />
            </Animated.View>

            {/* Header Animado */}
            <Animated.View style={[
                styles.headerContainer,
                {
                    height: headerHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width < 400 ? 60 : 70], // Altura reducida
                    }),
                    opacity: headerHeight.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.5, 1],
                    }),
                    transform: [{
                        translateY: headerHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -60 : -70, 0],
                        }),
                    }],
                }
            ]}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Facturas del Cliente</Text>
                    </View>
                </View>
            </Animated.View>

            {/* Modern Client Info Card */}
            {showClientDetails ? (
                <View style={styles.clientInfoContainer}>
                    <View style={styles.clientHeader}>
                        <View style={styles.clientAvatar}>
                            <Text style={styles.clientAvatarText}>
                                {clientInfo.nombres?.charAt(0) || ''}{clientInfo.apellidos?.charAt(0) || ''}
                            </Text>
                        </View>
                        <View style={styles.clientHeaderInfo}>
                            <Text style={styles.clientName}>{clientInfo.nombres} {clientInfo.apellidos}</Text>
                            <Text style={styles.clientId}>ID: {clientInfo.id_cliente}</Text>
                        </View>
                    </View>

                    {mostrarDireccion && (
                        <TouchableOpacity
                            style={[styles.clientAddressBlock, styles.clientAddressPressable]}
                            activeOpacity={0.85}
                            onPress={handleDireccionPress}
                        >
                            <Text style={styles.clientInfoLabel}>📍 Dirección</Text>
                            {direccionPrincipal !== '' && (
                                <Text style={styles.clientInfoText}>{direccionPrincipal}</Text>
                            )}
                            {(referenciaDireccion || gpsDireccion) && (
                                <View style={styles.detailSubList}>
                                    {referenciaDireccion && (
                                        <View style={styles.detailSubItem}>
                                            <Text style={styles.detailSubLabel}>Referencia</Text>
                                            <Text style={styles.detailSubValue}>{referenciaDireccion}</Text>
                                        </View>
                                    )}
                                    {gpsDireccion && (
                                        <View style={styles.detailSubItem}>
                                            <Text style={styles.detailSubLabel}>GPS</Text>
                                            <Text style={styles.detailSubValue}>{gpsDireccion}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                            {addressInfo.coords && (
                                <Text style={styles.clientAddressHint}>Toca para abrir o compartir</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {clientInfo.telefono && (
                        <TouchableOpacity
                            style={styles.phoneButton}
                            onPress={() => openPhoneModal(clientInfo.telefono)}
                        >
                            <Text style={styles.phoneButtonText}>{clientInfo.telefono}</Text>
                            <Text style={styles.phoneButtonHint}>Toca para llamar o enviar mensaje</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setShowClientDetails(false)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Ocultar Cliente</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ marginHorizontal: 16, marginTop: -20, marginBottom: 20 }}>
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setShowClientDetails(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Mostrar información del cliente</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Animated.View style={[
                { flex: 1 },
                {
                    marginTop: Animated.add(
                        headerHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -60 : -70, 0],
                        }),
                        menuHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -50 : -60, 0],
                        })
                    ),
                }
            ]}>
                <ScrollView 
                    style={styles.contentContainer}
                    contentContainerStyle={styles.scrollContent}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                >
                {/* Filter Chips */}
                <FlatList
                    data={filterButtons}
                    renderItem={renderFilterButton}
                    keyExtractor={(item) => item.value}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                    contentContainerStyle={styles.filterContainer}
                />

                {/* Invoice List */}
                {facturas.length > 0 ? (
                    facturas.map((item) => (
                        <View key={item.id_factura.toString()}>
                            {renderFactura({ item })}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Text style={{ fontSize: 32 }}>📜</Text>
                        </View>
                        <Text style={styles.emptyTitle}>No hay facturas</Text>
                        <Text style={styles.emptyMessage}>
                            Este cliente no tiene facturas registradas aún.
                        </Text>
                    </View>
                )}
            </ScrollView>
            </Animated.View>

            {/* Modern Payment Footer */}
            <TouchableOpacity 
                style={[styles.footer, totalAmount > 0 && styles.footerHighlight]} 
                onPress={handleFooterPress}
                activeOpacity={0.8}
            >
                <Text style={styles.footerText}>
                    💰 Total a recibir: {new Intl.NumberFormat('es-DO', {
                        style: 'currency',
                        currency: 'DOP',
                        minimumFractionDigits: 2,
                    }).format(totalAmount)}
                </Text>
                <Text style={styles.footerSubText}>
                    {totalAmount > 0 ? 'Toca para procesar el cobro' : 'Selecciona facturas para cobrar'}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Escribe una Nota</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Escribe la nota aquí..."
                            placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
                            multiline={true}
                            value={nota}
                            onChangeText={setNota}
                        />

                        {/* Checklist */}
                        <FlatList
                            data={checklist}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => toggleChecklistItem(item.id)} style={styles.checklistItem}>
                                    <Text style={styles.checklistLabel}>{item.label}</Text>
                                    <Text>{item.checked ? '✔️' : '⬜'}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.acceptButton]}
                                onPress={guardarNota}
                            >
                                <Text style={styles.modalButtonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal Método de Pago */}
            <Modal
                visible={payMethodModalVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setPayMethodModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecciona método de pago</Text>

                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                            <TouchableOpacity
                                onPress={() => setPaymentMethod('efectivo')}
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: paymentMethod === 'efectivo' ? '#2563EB' : (isDarkMode ? '#475569' : '#CBD5E1'), backgroundColor: paymentMethod === 'efectivo' ? (isDarkMode ? '#1E3A8A' : '#DBEAFE') : (isDarkMode ? '#334155' : '#F1F5F9') }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>Efectivo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setPaymentMethod('transferencia')}
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: paymentMethod === 'transferencia' ? '#2563EB' : (isDarkMode ? '#475569' : '#CBD5E1'), backgroundColor: paymentMethod === 'transferencia' ? (isDarkMode ? '#1E3A8A' : '#DBEAFE') : (isDarkMode ? '#334155' : '#F1F5F9') }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>Transferencia</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setPaymentMethod('cheque')}
                                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: paymentMethod === 'cheque' ? '#2563EB' : (isDarkMode ? '#475569' : '#CBD5E1'), backgroundColor: paymentMethod === 'cheque' ? (isDarkMode ? '#1E3A8A' : '#DBEAFE') : (isDarkMode ? '#334155' : '#F1F5F9') }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>Cheque</Text>
                            </TouchableOpacity>
                        </View>

                        {paymentMethod && paymentMethod !== 'efectivo' && (
                            <View style={{ marginTop: 8 }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: isDarkMode ? '#E2E8F0' : '#0F172A', marginBottom: 8 }}>
                                    Detalles de {paymentMethod}
                                </Text>
                                <TextInput
                                    placeholder="Banco"
                                    placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                    value={bankName}
                                    onChangeText={setBankName}
                                    style={{ borderWidth: 2, borderColor: isDarkMode ? '#475569' : '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: isDarkMode ? '#F8FAFC' : '#0F172A', marginBottom: 12 }}
                                />
                                <TextInput
                                    placeholder={paymentMethod === 'cheque' ? 'Nº de cheque' : 'Nº de referencia'}
                                    placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                    value={referenceNumber}
                                    onChangeText={setReferenceNumber}
                                    style={{ borderWidth: 2, borderColor: isDarkMode ? '#475569' : '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: isDarkMode ? '#F8FAFC' : '#0F172A' }}
                                />

                                {/* Link para datos adicionales opcionales */}
                                {!showExtraFields ? (
                                    <TouchableOpacity onPress={() => setShowExtraFields(true)} style={{ marginTop: 12 }}>
                                        <Text style={{ color: '#2563EB', fontWeight: '700', textAlign: 'right' }}>Agregar datos adicionales</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={{ marginTop: 12 }}>
                                        <TouchableOpacity onPress={() => setShowExtraFields(false)}>
                                            <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontWeight: '700', textAlign: 'right' }}>Ocultar datos adicionales</Text>
                                        </TouchableOpacity>
                                        <TextInput
                                            placeholder="Cuenta destino (opcional)"
                                            placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                            value={destAccount}
                                            onChangeText={setDestAccount}
                                            style={{ borderWidth: 2, borderColor: isDarkMode ? '#475569' : '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: isDarkMode ? '#F8FAFC' : '#0F172A', marginTop: 12 }}
                                        />
                                        <TextInput
                                            placeholder="Titular (opcional)"
                                            placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                            value={accountHolder}
                                            onChangeText={setAccountHolder}
                                            style={{ borderWidth: 2, borderColor: isDarkMode ? '#475569' : '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: isDarkMode ? '#F8FAFC' : '#0F172A', marginTop: 12 }}
                                        />
                                        {paymentMethod === 'cheque' && (
                                            <TextInput
                                                placeholder="Fecha del cheque (YYYY-MM-DD) (opcional)"
                                                placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                                value={checkDate}
                                                onChangeText={setCheckDate}
                                                keyboardType="numbers-and-punctuation"
                                                style={{ borderWidth: 2, borderColor: isDarkMode ? '#475569' : '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: isDarkMode ? '#F8FAFC' : '#0F172A', marginTop: 12 }}
                                            />
                                        )}
                                        <TextInput
                                            placeholder="Nota (opcional)"
                                            placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                            value={paymentNote}
                                            onChangeText={setPaymentNote}
                                            multiline
                                            style={{ borderWidth: 2, borderColor: isDarkMode ? '#475569' : '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: isDarkMode ? '#F8FAFC' : '#0F172A', marginTop: 12, minHeight: 80, textAlignVertical: 'top' }}
                                        />
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                            <TouchableOpacity
                                style={[{ flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }, { backgroundColor: '#EF4444' }]}
                                onPress={() => { setPayMethodModalVisible(false); }}
                            >
                                <Text style={{ color: 'white', fontWeight: '700' }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[{ flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }, { backgroundColor: '#10B981' }]}
                                onPress={() => {
                                    if (!paymentMethod) {
                                        Alert.alert('Selecciona un método de pago');
                                        return;
                                    }
                                    if (paymentMethod === 'efectivo') {
                                        setPayMethodModalVisible(false);
                                        setTimeout(() => confirmAndProceed('efectivo'), 200);
                                        return;
                                    }
                                    if (!bankName.trim() || !referenceNumber.trim()) {
                                        Alert.alert('Datos incompletos', 'Completa banco y número.');
                                        return;
                                    }
                                    const detalles: any = { banco: bankName.trim(), referencia: referenceNumber.trim() };
                                    if (showExtraFields) {
                                        if (destAccount.trim()) detalles.cuenta_destino = destAccount.trim();
                                        if (accountHolder.trim()) detalles.titular = accountHolder.trim();
                                        if (paymentMethod === 'cheque' && checkDate.trim()) detalles.fecha_cheque = checkDate.trim();
                                        if (paymentNote.trim()) detalles.nota = paymentNote.trim();
                                    }
                                    setPayMethodModalVisible(false);
                                    setTimeout(() => confirmAndProceed(paymentMethod, detalles), 200);
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: '700' }}>Continuar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal del Menú */}
            <MenuModal
                visible={menuVisible}
                onClose={() => {
                    setMenuVisible(false);
                    setRefreshFlag((prevFlag) => !prevFlag);
                }}
                menuItems={[
                    { title: `👤 ${nombreUsuario || 'Usuario'}`, action: () => {}, isUserInfo: true },
                    { title: '——————————————', action: () => {}, isDivider: true },
                    { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
                    { title: 'Perfil', action: () => navigation.navigate('ProfileScreen') },
                    { title: 'Configuración', action: () => navigation.navigate('SettingsScreen') },
                    { title: 'Dispositivos Bluetooth', action: () => navigation.navigate('BluetoothDevicesScreen') },
                    { title: 'Cerrar Sesión', action: handleLogout },
                ]}
                isDarkMode={isDarkMode}
                onItemPress={(item) => {
                    if (!item.isUserInfo && !item.isDivider) {
                        item.action();
                        setMenuVisible(false);
                        setRefreshFlag((prevFlag) => !prevFlag);
                    }
                }}
            />

        </View>
    );
};

export default ClienteFacturasScreen;
