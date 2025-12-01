import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Switch,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Modal,
    Pressable,
    Alert,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Text as SvgText } from 'react-native-svg';
import { BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../ThemeContext';
import getStyles from '../DetalleCicloStyles';
import MenuModal from '../../componentes/MenuModal';
import HorizontalMenu from '../../componentes/HorizontalMenu';

const screenWidth = Dimensions.get('window').width;

const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2,
    }).format(amount);
};

const chartConfig = {
    backgroundColor: '#e26a00',
    backgroundGradientFrom: '#fb8c00',
    backgroundGradientTo: '#ffa726',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#ffa726',
    },
    formatYLabel: (yValue) => formatMoney(yValue),
};

const DetalleCiclo = ({ route }) => {
    const { ciclo } = route.params;
    const navigation = useNavigation();
    
    // Theme and styles
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);

    // States
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [usuarioId, setUsuarioId] = useState(null);
    const [diasGracia, setDiasGracia] = useState(ciclo.dias_gracia || '');
    const [produccion, setProduccion] = useState([]);
    const [facturasCobradas, setFacturasCobradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [estadisticasConexiones, setEstadisticasConexiones] = useState({
        resumen: {
            totalConexiones: 0,
            conexionesActivas: 0,
            conexionesSuspendidas: 0,
            conexionesInactivas: 0,
            conexionesMorosas: 0,
            conexionesAlDia: 0,
            porcentajeActivas: 0,
            porcentajeSuspendidas: 0,
            porcentajeInactivas: 0
        },
        detalleEstados: [],
        financiero: {
            ingresosPotencialesMensual: 0,
            ingresosPerdidosPorSuspension: 0,
            ingresosPerdidosPorInactivas: 0,
            porcentajeIngresosPerdidos: 0
        },
        morosidad: {
            totalMorosos: 0,
            porcentajeMorosos: 0,
            deudaTotal: 0,
            promedioDiasMora: 0
        },
        tendencias: {
            cambioVsCicloAnterior: {
                totalConexiones: 0,
                porcentajeCambio: 0,
                direccion: 'sin_cambio'
            },
            nuevosCiclo: 0,
            bajasCiclo: 0
        },
        alertas: []
    });

    // Estados para permisos
    const [vista, setVista] = useState('basica');
    const [permisoOperacion, setPermisoOperacion] = useState(false);

    // Menu and modal states
    const [menuBotones, setMenuBotones] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);

    // Cycle control states
    const [tipoCorte, setTipoCorte] = useState(ciclo.tipo_corte === 'automatico');
    const [cerrarCiclo, setCerrarCiclo] = useState(ciclo.estado === 'cerrado');
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    
    // Mass cut progress states
    const [isMassCutInProgress, setIsMassCutInProgress] = useState(false);
    const [cutProgress, setCutProgress] = useState(0);
    const [cutProgressText, setCutProgressText] = useState('');
    const [totalConnections, setTotalConnections] = useState(0);
    const [processedConnections, setProcessedConnections] = useState(0);

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


    useEffect(() => {
        const guardarIdCiclo = async () => {
            try {
                await AsyncStorage.setItem('@idCiclo', ciclo.id_ciclo.toString());
                console.log('id_ciclo guardado en el almacenamiento local');
            } catch (e) {
                console.error('Error al guardar el id_ciclo en el almacenamiento local', e);
            }
        };
        if (ciclo && ciclo.id_ciclo) {
            guardarIdCiclo();
        }
    }, [ciclo]);

    useEffect(() => {
        const obtenerProduccion = async () => {
            try {
                const response = await axios.get(
                    `https://wellnet-rd.com:444/api/produccion?id_ciclo=${ciclo.id_ciclo}`
                );
                console.log('Producción obtenida:', response.data);
                setProduccion(response.data.produccion || []);
                setFacturasCobradas(response.data.facturasCobradas || []);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener la producción:', error);
                setLoading(false);
            }
        };
        if (ciclo && ciclo.id_ciclo) {
            obtenerProduccion();
        }
    }, [ciclo]);

    useEffect(() => {
        const obtenerEstadisticasConexiones = async () => {
            try {
                const response = await axios.post(
                    'https://wellnet-rd.com:444/api/conexiones/estadisticas-por-ciclo',
                    { id_ciclo: ciclo.id_ciclo }
                );
                console.log('Estadísticas de conexiones obtenidas:', response.data);
                if (response.data.success && response.data.data) {
                    setEstadisticasConexiones(response.data.data);
                }
            } catch (error) {
                console.error('Error al obtener estadísticas de conexiones:', error);
            }
        };
        if (ciclo && ciclo.id_ciclo) {
            obtenerEstadisticasConexiones();
        }
    }, [ciclo]);

    // Al tener el usuarioId, llamamos a la función que obtiene los permisos // <-- CAMBIO
    useEffect(() => {
        if (usuarioId) {
            obtenerPermisosUsuario();
        }
    }, [usuarioId]);
    // -------------------------------------------------------------------- // <-- CAMBIO

    // Block navigation when mass cut is in progress
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (isMassCutInProgress) {
                    alert('No puedes salir de esta pantalla mientras se está realizando el corte masivo. Por favor espera a que termine el proceso.');
                    return true; // Prevent default behavior
                }
                return false; // Allow default behavior
            };

            // Add event listener for hardware back button (Android)
            const backHandler = require('react-native').BackHandler;
            backHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => backHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [isMassCutInProgress])
    );

    // Función que obtiene los permisos y construye el menú // <-- CAMBIO
    const obtenerPermisosUsuario = async () => {
        try {
            const response = await axios.post(
                'https://wellnet-rd.com:444/api/usuarios/obtener-permisos-usuario',
                { id_usuario: usuarioId }
            );

            const { usuario, permisos } = response.data;
            const esSuperAdministrador = usuario[0]?.super_administrador === 'Y';
            const esAdministrador = usuario[0]?.administrador === 'Y';

            // Botones base con iconos modernos
            const botonesBase = [
                { id: '4', title: 'Menú', screen: null, action: () => setMenuVisible(true), icon: 'menu' },
                { id: '5', title: '|' }, 
                {
                  id: '6',
                  title: 'Facturas',
                  screen: 'FacturasScreen',
                  params: { id_ciclo: ciclo.id_ciclo },
                  icon: 'receipt-long',
                },
                {
                  id: '9',
                  title: 'Recibos',
                  screen: 'RecibosScreen',
                  params: { id_ciclo: ciclo.id_ciclo },
                  icon: 'receipt',
                },
                { id: '10', title: '|' },
                {
                  id: '11',
                  title: 'Cortes Masivo',
                  screen: null,
                  action: () => handleMassiveCut(),
                  icon: 'content-cut',
                },
            ];

            // Si es superAdmin o Admin, se le asigna todo
            if (esSuperAdministrador || esAdministrador) {
                console.log('Usuario con acceso total (super_administrador o administrador)');
                setVista('avanzada');
                setPermisoOperacion(true);
                setMenuBotones(botonesBase);
            } else {
                // Caso usuario con permisos parciales
                // Podemos filtrar o agregar según sub-permisos si deseas
                // Aquí un ejemplo similar a FacturacionesScreen.
                let botonesFiltrados = [...botonesBase];

                // Ejemplo si tuvieras un botón "Facturas" que requiera un sub-permiso en particular
                if (!permisos.some(
                      (p) => p.id_permiso === 1 && p.id_permiso_sub === 41 && p.estado_permiso === 'Y'
                  )) {
                    // Eliminar o no agregar el botón
                    botonesFiltrados = botonesFiltrados.filter(b => b.id !== '6');
                }

                if (!permisos.some(
                      (p) => p.id_permiso === 1 && p.id_permiso_sub === 42 && p.estado_permiso === 'Y'
                  )) {
                    // Eliminar o no agregar el botón
                    botonesFiltrados = botonesFiltrados.filter(b => b.id !== '9');
                }

                if (!permisos.some(
                      (p) => p.id_permiso === 1 && p.id_permiso_sub === 43 && p.estado_permiso === 'Y'
                  )) {
                    // Eliminar o no agregar el botón
                    botonesFiltrados = botonesFiltrados.filter(b => b.id !== '11');
                }

                // Verifica permiso general para "Facturaciones" con vista Avanzada
                const permisoFacturaciones = permisos.find(
                    (p) =>
                        p.id_permiso === 1 &&
                        p.id_permiso_sub === 0 &&
                        p.Vista?.toLowerCase() === 'avanzada' &&
                        p.estado_permiso === 'Y'
                );
                if (permisoFacturaciones) {
                    setVista('avanzada');
                    setPermisoOperacion(true);
                } else {
                    setVista('basica');
                    setPermisoOperacion(false);
                }

                setMenuBotones(botonesFiltrados);
            }
        } catch (error) {
            console.error('Error al obtener permisos del usuario:', error);
        }
    };
    // -------------------------------------------------------------------- // <-- CAMBIO

    // ... resto de tu lógica y funciones (corte masivo, formatDate, etc.) ...

    const handleMassiveCut = () => {
        setIsConfirmModalVisible(true); 
    };

    const confirmMassiveCut = () => {
        setIsConfirmModalVisible(false); 
        realizarCorteMasivo(); 
    };

    const realizarCorteMasivo = async () => {
        setIsMassCutInProgress(true);
        setCutProgress(0);
        setCutProgressText('Iniciando proceso de corte masivo...');
        
        try {
            // First, get the list of connections to be cut
            setCutProgressText('Obteniendo lista de conexiones morosas...');
            const connectionsResponse = await axios.post(
                'https://wellnet-rd.com:444/api/conexiones/obtener-morosos',
                { id_ciclo: ciclo.id_ciclo }
            );
            
            if (connectionsResponse.status !== 200) {
                throw new Error('No se pudieron obtener las conexiones morosas');
            }
            
            const connections = connectionsResponse.data.conexiones || [];
            const total = connections.length;
            setTotalConnections(total);
            setProcessedConnections(0);
            
            if (total === 0) {
                alert('No hay conexiones morosas para cortar en este ciclo.');
                setIsMassCutInProgress(false);
                return;
            }
            
            setCutProgressText(`Procesando ${total} conexiones...`);
            
            // Process cuts in batches to show progress
            const batchSize = 5; // Process 5 connections at a time
            let processed = 0;
            
            for (let i = 0; i < connections.length; i += batchSize) {
                const batch = connections.slice(i, i + batchSize);
                
                // Process current batch
                setCutProgressText(`Cortando conexiones ${processed + 1} a ${Math.min(processed + batchSize, total)} de ${total}...`);
                
                try {
                    const batchPromises = batch.map(connection => 
                        axios.post('https://wellnet-rd.com:444/api/conexiones/cortar-individual', {
                            id_conexion: connection.id_conexion,
                            id_usuario: usuarioId,
                            id_estado_conexion: 4,
                            motivo: 'Corte masivo por morosidad'
                        })
                    );
                    
                    await Promise.all(batchPromises);
                    processed += batch.length;
                    setProcessedConnections(processed);
                    
                    // Update progress
                    const progressPercentage = (processed / total) * 100;
                    setCutProgress(progressPercentage);
                    
                    // Small delay to show progress
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (batchError) {
                    console.error('Error processing batch:', batchError);
                    // Continue with next batch even if some fail
                }
            }
            
            setCutProgressText('Finalizando proceso...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Final API call to update cycle status
            const payload = {
                id_ciclo: ciclo.id_ciclo,
                id_usuario: usuarioId,
                id_estado_conexion: 4,
                conexiones_procesadas: processed
            };
            
            const response = await axios.post(
                'https://wellnet-rd.com:444/api/conexiones/cortes-masivos-completar',
                payload
            );
            
            if (response.status === 200) {
                console.log('Corte masivo completado:', response.data);
                alert(`Corte masivo completado exitosamente. Se procesaron ${processed} de ${total} conexiones.`);
            }
            
        } catch (error) {
            console.error('Error al realizar el corte masivo:', error);
            alert('Error durante el proceso de corte masivo. Algunas conexiones pueden no haber sido procesadas.');
        } finally {
            setIsMassCutInProgress(false);
            setCutProgress(0);
            setCutProgressText('');
            setTotalConnections(0);
            setProcessedConnections(0);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const [year, month, day] = dateString.split('T')[0].split('-');
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        return `${parseInt(day)} de ${meses[parseInt(month) - 1]} del ${year}`;
    };

    const calcularFechaLimitePago = (fechaFinal, diasGracia) => {
        if (!fechaFinal || !diasGracia) return 'N/A';
        const date = new Date(fechaFinal);
        date.setDate(date.getDate() + parseInt(diasGracia));
        return formatDate(date.toISOString());
    };

    const calcularFacturasCobradas = (totalFacturas, facturasPendientes) => {
        if (totalFacturas == null || facturasPendientes == null) return 'N/A';
        return totalFacturas - facturasPendientes;
    };

    const calcularDineroPendiente = (totalDinero, dineroCobrado) => {
        if (totalDinero == null || dineroCobrado == null) return 'N/A';
        return totalDinero - dineroCobrado;
    };

    const verFacturasPendientes = () => {
        navigation.navigate('FacturasPendientesScreen', { id_ciclo: ciclo.id_ciclo });
    };

    const verFacturasCobradas = () => {
        navigation.navigate('FacturasCobradasScreen', { id_ciclo: ciclo.id_ciclo, estado: 'pagado' });
    };

    const verFacturasSinCobrar = () => {
        navigation.navigate('FacturasCobradasScreen', { id_ciclo: ciclo.id_ciclo, estado: 'pendiente' });
    };

    const verRecibos = () => {
        navigation.navigate('RecibosScreen', { id_ciclo: ciclo.id_ciclo });
    };

    const crearFactura = () => {
        navigation.navigate('CrearFacturaScreen', { cicloId: ciclo.id_ciclo });
    };

    const actualizarDiasGracia = async () => {
        const url = 'https://wellnet-rd.com:444/api/ciclo-actualizar-dias-gracia';
        const payload = {
            id_ciclo: ciclo.id_ciclo,
            dias_gracia: diasGracia,
        };
        try {
            const response = await axios.post(url, payload);
            console.log('Días de gracia actualizados con éxito', response.data);
            alert('Los días de gracia se han actualizado correctamente.');
        } catch (error) {
            console.error('Error al actualizar los días de gracia:', error);
        }
    };

    const actualizarTipoCorte = async (valor) => {
        const url = 'https://wellnet-rd.com:444/api/ciclo-tipo-corte';
        const payload = {
            id_ciclo: ciclo.id_ciclo,
            tipo_corte: valor ? 'automatico' : 'manual',
            dias_gracia: diasGracia
        };
        try {
            const response = await axios.post(url, payload);
            console.log('Tipo de corte actualizado con éxito', response.data);
            setTipoCorte(valor);
            alert('El tipo de corte se ha actualizado correctamente.');
        } catch (error) {
            console.error('Error al actualizar el tipo de corte:', error);
        }
    };

    const cerrarCicloFacturacion = async (valor) => {
        const url = 'https://wellnet-rd.com:444/api/ciclos-incompleto-cerrar';
        const payload = {
            id_ciclo: ciclo.id_ciclo,
            estado: valor ? 'cerrado' : 'abierto',
        };
        try {
            const response = await axios.post(url, payload);
            console.log('Estado del ciclo actualizado con éxito', response.data);
            setCerrarCiclo(valor);
            alert('El ciclo de facturación se ha cerrado correctamente.');
        } catch (error) {
            console.error('Error al actualizar el estado del ciclo:', error);
        }
    };

    // Construir data para el gráfico
    const data = {
        labels: produccion.map(item => formatDate(item.fecha)),
        datasets: [
            {
                data: produccion.map(item => item.total_produccion),
            },
        ],
    };
    const lineChartWidth = screenWidth * (data.labels.length / 3);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Detalle del Ciclo</Text>
                        <Text style={styles.headerSubtitle}>ID: {ciclo.id_ciclo}</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    <Text style={styles.loadingText}>Cargando datos del ciclo...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const barData = {
        labels: ['Dinero Total', 'Dinero Cobrado'],
        datasets: [{ data: [ciclo.total_dinero, ciclo.dinero_cobrado] }],
    };
    const chartHeight = 220; 
    const facturasOrdenadas = [...facturasCobradas].reverse();

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Detalle del Ciclo</Text>
                    <Text style={styles.headerSubtitle}>
                        {formatDate(ciclo.inicio)} - {formatDate(ciclo.final)}
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                {/* Información Básica del Ciclo */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIconContainer}>
                            <Icon name="event" size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.cardHeaderContent}>
                            <Text style={styles.cardTitle}>Información del Ciclo</Text>
                            <Text style={styles.cardSubtitle}>Datos básicos y fechas</Text>
                        </View>
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>ID del Ciclo:</Text>
                            <Text style={styles.detailValue}>{ciclo.id_ciclo}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Día del Mes:</Text>
                            <Text style={styles.detailValue}>{ciclo.dia_de_mes}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tipo de Ciclo:</Text>
                            <Text style={styles.detailValue}>
                                {ciclo.tipo_ciclo === 0 ? 'Mensual' : 'Otro'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Estado:</Text>
                            <Text style={styles.detailValue}>{ciclo.estado}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Fecha de Inicio:</Text>
                            <Text style={styles.detailValue}>{formatDate(ciclo.inicio)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Fecha Final:</Text>
                            <Text style={styles.detailValue}>{formatDate(ciclo.final)}</Text>
                        </View>
                    </View>
                </View>

                {vista === 'avanzada' && (
                    <>
                        {/* Estadísticas de Facturas */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <Icon name="receipt-long" size={24} color="#FFFFFF" />
                                </View>
                                <View style={styles.cardHeaderContent}>
                                    <Text style={styles.cardTitle}>Estadísticas de Facturas</Text>
                                    <Text style={styles.cardSubtitle}>Resumen de facturación</Text>
                                </View>
                            </View>

                            <View style={styles.statusContainer}>
                                <View style={styles.statusItem}>
                                    <Text style={styles.statusNumber}>{ciclo.total_facturas}</Text>
                                    <Text style={styles.statusLabel}>Total Facturas</Text>
                                </View>
                                <View style={styles.statusItem}>
                                    <Text style={styles.statusNumber}>
                                        {calcularFacturasCobradas(ciclo.total_facturas, ciclo.facturas_pendiente)}
                                    </Text>
                                    <Text style={styles.statusLabel}>Cobradas</Text>
                                </View>
                                <View style={styles.statusItem}>
                                    <Text style={styles.statusNumber}>{ciclo.facturas_pendiente || 0}</Text>
                                    <Text style={styles.statusLabel}>Pendientes</Text>
                                </View>
                            </View>
                        </View>

                        {/* Estadísticas de Conexiones - MEJORADA */}
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('ConexionesCicloScreen', { id_ciclo: ciclo.id_ciclo })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <Icon name="router" size={24} color="#FFFFFF" />
                                </View>
                                <View style={styles.cardHeaderContent}>
                                    <Text style={styles.cardTitle}>Estadísticas de Conexiones</Text>
                                    <Text style={styles.cardSubtitle}>Análisis completo del ciclo</Text>
                                </View>
                                <Icon name="chevron-right" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            </View>

                            {/* Alertas */}
                            {estadisticasConexiones.alertas && estadisticasConexiones.alertas.length > 0 && (
                                <View style={{
                                    paddingHorizontal: 20,
                                    paddingTop: 16,
                                    gap: 8
                                }}>
                                    {estadisticasConexiones.alertas.map((alerta, index) => (
                                        <View
                                            key={index}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor:
                                                    alerta.tipo === 'error' ? (isDarkMode ? '#7F1D1D' : '#FEE2E2') :
                                                    alerta.tipo === 'warning' ? (isDarkMode ? '#78350F' : '#FEF3C7') :
                                                    alerta.tipo === 'success' ? (isDarkMode ? '#064E3B' : '#D1FAE5') :
                                                    (isDarkMode ? '#1E3A8A' : '#DBEAFE'),
                                                paddingHorizontal: 12,
                                                paddingVertical: 8,
                                                borderRadius: 8,
                                                borderLeftWidth: 3,
                                                borderLeftColor:
                                                    alerta.tipo === 'error' ? '#EF4444' :
                                                    alerta.tipo === 'warning' ? '#F59E0B' :
                                                    alerta.tipo === 'success' ? '#10B981' :
                                                    '#3B82F6'
                                            }}
                                        >
                                            <Icon
                                                name={
                                                    alerta.tipo === 'error' ? 'error' :
                                                    alerta.tipo === 'warning' ? 'warning' :
                                                    alerta.tipo === 'success' ? 'check-circle' :
                                                    'info'
                                                }
                                                size={18}
                                                color={
                                                    alerta.tipo === 'error' ? '#EF4444' :
                                                    alerta.tipo === 'warning' ? '#F59E0B' :
                                                    alerta.tipo === 'success' ? '#10B981' :
                                                    '#3B82F6'
                                                }
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text style={{
                                                flex: 1,
                                                fontSize: 13,
                                                fontWeight: '500',
                                                color:
                                                    alerta.tipo === 'error' ? (isDarkMode ? '#FCA5A5' : '#991B1B') :
                                                    alerta.tipo === 'warning' ? (isDarkMode ? '#FCD34D' : '#92400E') :
                                                    alerta.tipo === 'success' ? (isDarkMode ? '#6EE7B7' : '#065F46') :
                                                    (isDarkMode ? '#93C5FD' : '#1E40AF')
                                            }}>
                                                {alerta.mensaje}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Resumen Principal con Porcentajes */}
                            <View style={styles.statusContainer}>
                                <View style={styles.statusItem}>
                                    <Text style={styles.statusNumber}>
                                        {estadisticasConexiones.resumen?.totalConexiones || 0}
                                    </Text>
                                    <Text style={styles.statusLabel}>Total</Text>
                                </View>
                                <View style={styles.statusItem}>
                                    <Text style={[styles.statusNumber, { color: '#10B981' }]}>
                                        {estadisticasConexiones.resumen?.conexionesActivas || 0}
                                    </Text>
                                    <Text style={styles.statusLabel}>Activas</Text>
                                    <Text style={{
                                        fontSize: 11,
                                        color: '#10B981',
                                        fontWeight: '600',
                                        marginTop: 2
                                    }}>
                                        {estadisticasConexiones.resumen?.porcentajeActivas?.toFixed(1) || 0}%
                                    </Text>
                                </View>
                                <View style={styles.statusItem}>
                                    <Text style={[styles.statusNumber, { color: '#F59E0B' }]}>
                                        {estadisticasConexiones.resumen?.conexionesSuspendidas || 0}
                                    </Text>
                                    <Text style={styles.statusLabel}>Suspendidas</Text>
                                    <Text style={{
                                        fontSize: 11,
                                        color: '#F59E0B',
                                        fontWeight: '600',
                                        marginTop: 2
                                    }}>
                                        {estadisticasConexiones.resumen?.porcentajeSuspendidas?.toFixed(1) || 0}%
                                    </Text>
                                </View>
                                <View style={styles.statusItem}>
                                    <Text style={[styles.statusNumber, { color: '#6B7280' }]}>
                                        {estadisticasConexiones.resumen?.conexionesInactivas || 0}
                                    </Text>
                                    <Text style={styles.statusLabel}>Inactivas</Text>
                                    <Text style={{
                                        fontSize: 11,
                                        color: '#6B7280',
                                        fontWeight: '600',
                                        marginTop: 2
                                    }}>
                                        {estadisticasConexiones.resumen?.porcentajeInactivas?.toFixed(1) || 0}%
                                    </Text>
                                </View>
                            </View>

                            {/* Información Financiera */}
                            {estadisticasConexiones.financiero && (
                                <View style={{
                                    paddingHorizontal: 20,
                                    paddingVertical: 16,
                                    borderTopWidth: 1,
                                    borderTopColor: isDarkMode ? '#374151' : '#E5E7EB'
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <Icon name="attach-money" size={18} color={isDarkMode ? '#10B981' : '#059669'} />
                                        <Text style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: isDarkMode ? '#F3F4F6' : '#1F2937',
                                            marginLeft: 6
                                        }}>
                                            Impacto Financiero
                                        </Text>
                                    </View>

                                    <View style={{ gap: 8 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 13, color: isDarkMode ? '#D1D5DB' : '#4B5563' }}>
                                                Ingresos Potenciales:
                                            </Text>
                                            <Text style={{
                                                fontSize: 15,
                                                fontWeight: '700',
                                                color: isDarkMode ? '#10B981' : '#059669'
                                            }}>
                                                {formatMoney(estadisticasConexiones.financiero.ingresosPotencialesMensual || 0)}
                                            </Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 13, color: isDarkMode ? '#D1D5DB' : '#4B5563' }}>
                                                Pérdidas por Suspensión:
                                            </Text>
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: '600',
                                                color: '#F59E0B'
                                            }}>
                                                {formatMoney(estadisticasConexiones.financiero.ingresosPerdidosPorSuspension || 0)}
                                            </Text>
                                        </View>

                                        {estadisticasConexiones.financiero.porcentajeIngresosPerdidos > 0 && (
                                            <View style={{
                                                marginTop: 4,
                                                paddingHorizontal: 10,
                                                paddingVertical: 6,
                                                backgroundColor: isDarkMode ? '#78350F' : '#FEF3C7',
                                                borderRadius: 6
                                            }}>
                                                <Text style={{
                                                    fontSize: 12,
                                                    fontWeight: '600',
                                                    color: isDarkMode ? '#FCD34D' : '#92400E',
                                                    textAlign: 'center'
                                                }}>
                                                    {estadisticasConexiones.financiero.porcentajeIngresosPerdidos.toFixed(1)}% de ingresos en riesgo
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Morosidad */}
                            {estadisticasConexiones.morosidad && estadisticasConexiones.morosidad.totalMorosos > 0 && (
                                <View style={{
                                    paddingHorizontal: 20,
                                    paddingVertical: 16,
                                    borderTopWidth: 1,
                                    borderTopColor: isDarkMode ? '#374151' : '#E5E7EB'
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <Icon name="account-balance-wallet" size={18} color="#EF4444" />
                                        <Text style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: isDarkMode ? '#F3F4F6' : '#1F2937',
                                            marginLeft: 6
                                        }}>
                                            Morosidad
                                        </Text>
                                    </View>

                                    <View style={{ gap: 8 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 13, color: isDarkMode ? '#D1D5DB' : '#4B5563' }}>
                                                Conexiones Morosas:
                                            </Text>
                                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#EF4444' }}>
                                                {estadisticasConexiones.morosidad.totalMorosos} ({estadisticasConexiones.morosidad.porcentajeMorosos.toFixed(1)}%)
                                            </Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 13, color: isDarkMode ? '#D1D5DB' : '#4B5563' }}>
                                                Deuda Total:
                                            </Text>
                                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#DC2626' }}>
                                                {formatMoney(estadisticasConexiones.morosidad.deudaTotal || 0)}
                                            </Text>
                                        </View>

                                        {estadisticasConexiones.morosidad.promedioDiasMora > 0 && (
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ fontSize: 13, color: isDarkMode ? '#D1D5DB' : '#4B5563' }}>
                                                    Promedio de Mora:
                                                </Text>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkMode ? '#FCA5A5' : '#B91C1C' }}>
                                                    {Math.round(estadisticasConexiones.morosidad.promedioDiasMora)} días
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Tendencias */}
                            {estadisticasConexiones.tendencias && (
                                <View style={{
                                    paddingHorizontal: 20,
                                    paddingVertical: 16,
                                    borderTopWidth: 1,
                                    borderTopColor: isDarkMode ? '#374151' : '#E5E7EB'
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <Icon name="trending-up" size={18} color={isDarkMode ? '#3B82F6' : '#2563EB'} />
                                        <Text style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: isDarkMode ? '#F3F4F6' : '#1F2937',
                                            marginLeft: 6
                                        }}>
                                            Tendencias
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        {estadisticasConexiones.tendencias.nuevosCiclo > 0 && (
                                            <View style={{
                                                flex: 1,
                                                backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5',
                                                paddingHorizontal: 12,
                                                paddingVertical: 10,
                                                borderRadius: 8,
                                                alignItems: 'center'
                                            }}>
                                                <Icon name="add-circle" size={20} color="#10B981" />
                                                <Text style={{
                                                    fontSize: 18,
                                                    fontWeight: '700',
                                                    color: '#10B981',
                                                    marginTop: 4
                                                }}>
                                                    {estadisticasConexiones.tendencias.nuevosCiclo}
                                                </Text>
                                                <Text style={{
                                                    fontSize: 11,
                                                    color: isDarkMode ? '#6EE7B7' : '#065F46',
                                                    marginTop: 2
                                                }}>
                                                    Nuevas
                                                </Text>
                                            </View>
                                        )}

                                        {estadisticasConexiones.tendencias.bajasCiclo > 0 && (
                                            <View style={{
                                                flex: 1,
                                                backgroundColor: isDarkMode ? '#7F1D1D' : '#FEE2E2',
                                                paddingHorizontal: 12,
                                                paddingVertical: 10,
                                                borderRadius: 8,
                                                alignItems: 'center'
                                            }}>
                                                <Icon name="remove-circle" size={20} color="#EF4444" />
                                                <Text style={{
                                                    fontSize: 18,
                                                    fontWeight: '700',
                                                    color: '#EF4444',
                                                    marginTop: 4
                                                }}>
                                                    {estadisticasConexiones.tendencias.bajasCiclo}
                                                </Text>
                                                <Text style={{
                                                    fontSize: 11,
                                                    color: isDarkMode ? '#FCA5A5' : '#991B1B',
                                                    marginTop: 2
                                                }}>
                                                    Bajas
                                                </Text>
                                            </View>
                                        )}

                                        {estadisticasConexiones.tendencias.cambioVsCicloAnterior &&
                                         estadisticasConexiones.tendencias.cambioVsCicloAnterior.direccion !== 'sin_cambio' && (
                                            <View style={{
                                                flex: 1,
                                                backgroundColor:
                                                    estadisticasConexiones.tendencias.cambioVsCicloAnterior.direccion === 'aumento'
                                                        ? (isDarkMode ? '#1E3A8A' : '#DBEAFE')
                                                        : (isDarkMode ? '#78350F' : '#FEF3C7'),
                                                paddingHorizontal: 12,
                                                paddingVertical: 10,
                                                borderRadius: 8,
                                                alignItems: 'center'
                                            }}>
                                                <Icon
                                                    name={estadisticasConexiones.tendencias.cambioVsCicloAnterior.direccion === 'aumento' ? 'arrow-upward' : 'arrow-downward'}
                                                    size={20}
                                                    color={estadisticasConexiones.tendencias.cambioVsCicloAnterior.direccion === 'aumento' ? '#3B82F6' : '#F59E0B'}
                                                />
                                                <Text style={{
                                                    fontSize: 16,
                                                    fontWeight: '700',
                                                    color: estadisticasConexiones.tendencias.cambioVsCicloAnterior.direccion === 'aumento' ? '#3B82F6' : '#F59E0B',
                                                    marginTop: 4
                                                }}>
                                                    {estadisticasConexiones.tendencias.cambioVsCicloAnterior.porcentajeCambio?.toFixed(1) || 0}%
                                                </Text>
                                                <Text style={{
                                                    fontSize: 11,
                                                    color: estadisticasConexiones.tendencias.cambioVsCicloAnterior.direccion === 'aumento'
                                                        ? (isDarkMode ? '#93C5FD' : '#1E40AF')
                                                        : (isDarkMode ? '#FCD34D' : '#92400E'),
                                                    marginTop: 2,
                                                    textAlign: 'center'
                                                }}>
                                                    vs anterior
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Información Financiera */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <Icon name="account-balance-wallet" size={24} color="#FFFFFF" />
                                </View>
                                <View style={styles.cardHeaderContent}>
                                    <Text style={styles.cardTitle}>Información Financiera</Text>
                                    <Text style={styles.cardSubtitle}>Ingresos y pendientes</Text>
                                </View>
                            </View>

                            <View style={styles.moneyContainer}>
                                <View style={styles.moneyRow}>
                                    <Text style={styles.moneyLabel}>Total Esperado:</Text>
                                    <Text style={styles.moneyTotal}>{formatMoney(ciclo.total_dinero)}</Text>
                                </View>
                                <View style={styles.moneyRow}>
                                    <Text style={styles.moneyLabel}>Dinero Cobrado:</Text>
                                    <Text style={styles.moneyValue}>{formatMoney(ciclo.dinero_cobrado)}</Text>
                                </View>
                                <View style={styles.moneyRow}>
                                    <Text style={styles.moneyLabel}>Dinero Pendiente:</Text>
                                    <Text style={styles.moneyValue}>
                                        {formatMoney(calcularDineroPendiente(ciclo.total_dinero, ciclo.dinero_cobrado))}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Gráfica de Comparación */}
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Comparación de Ingresos</Text>
                            <BarChart
                                data={barData}
                                width={screenWidth - 64}
                                height={chartHeight}
                                fromZero={true}
                                yAxisLabel="RD$ "
                                chartConfig={chartConfig}
                                style={{
                                    borderRadius: 16,
                                }}
                            />
                            {/* Valores encima de las barras */}
                            <View style={styles.chartValuesOverlay}>
                                <Text style={styles.chartValueText}>
                                    {formatMoney(ciclo.total_dinero)}
                                </Text>
                                <Text style={styles.chartValueText}>
                                    {formatMoney(ciclo.dinero_cobrado)}
                                </Text>
                            </View>
                        </View>

                        {/* Configuración del Ciclo */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <Icon name="settings" size={24} color="#FFFFFF" />
                                </View>
                                <View style={styles.cardHeaderContent}>
                                    <Text style={styles.cardTitle}>Configuración del Ciclo</Text>
                                    <Text style={styles.cardSubtitle}>Controles y ajustes</Text>
                                </View>
                            </View>

                            <View style={styles.cardContent}>
                                {/* Modo de Corte */}
                                <View style={styles.controlContainer}>
                                    <Text style={styles.controlLabel}>Modo de Corte de Servicio</Text>
                                    <Switch
                                        value={tipoCorte}
                                        onValueChange={(valor) => actualizarTipoCorte(valor)}
                                        disabled={!permisoOperacion}
                                        trackColor={{ false: '#767577', true: '#059669' }}
                                        thumbColor={tipoCorte ? '#10B981' : '#f4f3f4'}
                                    />
                                    <Text style={styles.controlValue}>
                                        {tipoCorte ? 'Automático' : 'Manual'}
                                    </Text>
                                </View>

                                {/* Días de Gracia */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Días de Gracia</Text>
                                    <View style={styles.controlContainer}>
                                        <TextInput
                                            style={[styles.input, !permisoOperacion && styles.buttonDisabled]}
                                            value={diasGracia.toString()}
                                            onChangeText={(text) => setDiasGracia(text.replace(/[^0-9]/g, ''))}
                                            keyboardType="numeric"
                                            editable={permisoOperacion}
                                            placeholder="0"
                                            placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                        />
                                        <TouchableOpacity
                                            style={[
                                                styles.button,
                                                !permisoOperacion && styles.buttonDisabled
                                            ]}
                                            onPress={actualizarDiasGracia}
                                            disabled={!permisoOperacion}
                                        >
                                            <Text style={[
                                                styles.buttonText,
                                                !permisoOperacion && styles.buttonTextDisabled
                                            ]}>
                                                Actualizar
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Fecha Límite de Pago */}
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Fecha Límite de Pago:</Text>
                                    <Text style={styles.detailValue}>
                                        {calcularFechaLimitePago(ciclo.final, ciclo.dias_gracia)}
                                    </Text>
                                </View>

                                {/* Estado del Ciclo */}
                                <View style={styles.controlContainer}>
                                    <Text style={styles.controlLabel}>Estado del Ciclo</Text>
                                    <Switch
                                        value={cerrarCiclo}
                                        onValueChange={(valor) => cerrarCicloFacturacion(valor)}
                                        disabled={!permisoOperacion}
                                        trackColor={{ false: '#767577', true: '#DC2626' }}
                                        thumbColor={cerrarCiclo ? '#EF4444' : '#f4f3f4'}
                                    />
                                    <Text style={styles.controlValue}>
                                        {cerrarCiclo ? 'Cerrado' : 'Abierto'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Menú Horizontal dinámico, en base al estado menuBotones */} 
            <HorizontalMenu
                botones={menuBotones}
                navigation={navigation}
                isDarkMode={isDarkMode}
            />

            {/* Modal del Menú */}
            <MenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
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
                }}
            />

            {/* Modal de Confirmación de Corte Masivo */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isConfirmModalVisible}
                onRequestClose={() => {
                    if (!isMassCutInProgress) {
                        setIsConfirmModalVisible(false);
                    }
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <Icon name="warning" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={styles.modalTitle}>
                                ¿Confirmar Corte Masivo?
                            </Text>
                            <Text style={styles.modalMessage}>
                                Esta acción afectará a todos los clientes morosos del ciclo. 
                                Los servicios serán cortados automáticamente.
                            </Text>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSecondary]}
                                onPress={() => setIsConfirmModalVisible(false)}
                                disabled={isMassCutInProgress}
                            >
                                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={confirmMassiveCut}
                                disabled={isMassCutInProgress}
                            >
                                <Text style={styles.buttonText}>Confirmar Corte</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Progreso de Corte Masivo */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isMassCutInProgress}
                onRequestClose={() => {
                    Alert.alert(
                        'Proceso en Curso',
                        'No puedes cerrar esta ventana mientras se está realizando el corte masivo. Por favor espera a que termine el proceso.',
                        [{ text: 'Entendido', style: 'default' }]
                    );
                }}
            >
                <View style={styles.progressModalContainer}>
                    <View style={styles.progressModalView}>
                        <View style={styles.progressHeader}>
                            <View style={styles.progressIconContainer}>
                                <Icon name="content-cut" size={32} color="#FFFFFF" />
                            </View>
                            <Text style={styles.progressTitle}>
                                Corte Masivo en Progreso
                            </Text>
                            <Text style={styles.progressSubtitle}>
                                Por favor no salgas de esta pantalla
                            </Text>
                        </View>

                        <View style={styles.progressContent}>
                            <View style={styles.warningContainer}>
                                <Icon name="warning" size={20} color="#F59E0B" />
                                <Text style={styles.warningText}>
                                    ⚠️ No cierres la aplicación ni salgas de esta pantalla mientras se realiza el proceso
                                </Text>
                            </View>

                            <View style={styles.progressSection}>
                                <Text style={styles.progressLabel}>Progreso del Corte</Text>
                                
                                <Progress.Bar
                                    progress={cutProgress / 100}
                                    width={screenWidth - 120}
                                    height={12}
                                    color="#10B981"
                                    unfilledColor={isDarkMode ? '#374151' : '#E5E7EB'}
                                    borderWidth={0}
                                    borderRadius={6}
                                />
                                
                                <View style={styles.progressStats}>
                                    <Text style={styles.progressPercentage}>
                                        {Math.round(cutProgress)}%
                                    </Text>
                                    <Text style={styles.progressCount}>
                                        {processedConnections} de {totalConnections} conexiones
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.progressStatus}>
                                <ActivityIndicator 
                                    size="small" 
                                    color="#10B981" 
                                    style={styles.progressSpinner}
                                />
                                <Text style={styles.progressText}>
                                    {cutProgressText}
                                </Text>
                            </View>

                            <View style={styles.progressInfo}>
                                <Text style={styles.progressInfoTitle}>
                                    ℹ️ Información del Proceso
                                </Text>
                                <Text style={styles.progressInfoText}>
                                    • Los cortes se están realizando a través del router{'\n'}
                                    • Este proceso puede tomar varios minutos{'\n'}
                                    • Los clientes afectados perderán el servicio de internet{'\n'}
                                    • El proceso no se puede cancelar una vez iniciado
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default DetalleCiclo;
