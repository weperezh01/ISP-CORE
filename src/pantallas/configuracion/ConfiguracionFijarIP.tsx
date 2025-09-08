import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, FlatList, Modal, Button, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import { conseguirStyles } from './ConfiguracionFijarIPGetStyle';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../componentes/themeSwitch';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ConfiguracionFijarIP = ({ route }) => {
    const { connectionId, nombres, apellidos, direccion, router } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const estilos = conseguirStyles(isDarkMode);
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [redes, setRedes] = useState([]);
    const [leases, setLeases] = useState([]);
    const [leasesLoading, setLeasesLoading] = useState(false);
    const [leasesRefreshing, setLeasesRefreshing] = useState(false);
    const [leasesError, setLeasesError] = useState(null);
    const [leasesInitialized, setLeasesInitialized] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLease, setSelectedLease] = useState(null);
    const [uploadSpeed, setUploadSpeed] = useState(''); // Velocidad de subida
    const [uploadUnit, setUploadUnit] = useState('Mbps'); // Unidad de velocidad de subida
    const [downloadSpeed, setDownloadSpeed] = useState(''); // Velocidad de bajada
    const [downloadUnit, setDownloadUnit] = useState('Mbps'); // Unidad de velocidad de bajada
    const [idUsuario, setIdUsuario] = useState(null);
    const [idIsp, setIdIsp] = useState(null);
    
    let intervalId = null;

    const [config, setConfig] = useState({
        idRouter: router?.value || '',
        nombreRouter: router?.label || '',
        descripcionRouter: router?.descripcion || '',
        redIp: '',
        direccionIp: '',
        usuarioPppoe: '',
        secretPppoe: '',
        perfilPppoe: '',
        subidaLimite: '',
        bajadaLimite: '',
        unidadSubida: '',
        unidadBajada: '',
        nota: '',
    });


    // useEffect(() => {
    //     const obtenerDatosUsuario = async () => {
    //         try {
    //             const jsonValue = await AsyncStorage.getItem('@loginData');
    //             if (jsonValue != null) {
    //                 const userData = JSON.parse(jsonValue);
    //                 setNombreUsuario(userData.nombre);
    //                 setIdUsuario(userData.id);
    //             }
    //             const ispIdValue = await AsyncStorage.getItem('@selectedIspId');
    //             if (ispIdValue != null) {
    //                 setIdIsp(ispIdValue);
    //             }
    //         } catch (e) {
    //             console.error('Error al leer los datos del usuario o del ISP', e);
    //         }
    //     };
    //     obtenerDatosUsuario();
    //     if (router?.id_router) {
    //         obtenerPerfilesPorRouter(router.id_router);
    //     }
    //     registrarNavegacion(); // Registrar la navegación al cargar la pantalla
    // }, [router?.id_router]);



    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                if (jsonValue != null) {
                    const userData = JSON.parse(jsonValue);
                    setNombreUsuario(userData.nombre);
                    setIdUsuario(userData.id);
                }
                const ispIdValue = await AsyncStorage.getItem('@selectedIspId');
                if (ispIdValue != null) {
                    setIdIsp(ispIdValue);
                }
            } catch (e) {
                console.error('Error al leer los datos del usuario o del ISP', e);
            }
        };
        obtenerDatosUsuario();


        const actualizarDatos = (isRefresh = false) => {
            if (router?.id_router) {
                obtenerRedesPorRouter(router.id_router);
                obtenerLeases(router.id_router, isRefresh);
            }
        };

        const focusListener = navigation.addListener('focus', () => {
            // Iniciar el refresco al enfocar la pantalla
            actualizarDatos(false); // Llamada inicial (primera carga)
            intervalId = setInterval(() => {
                actualizarDatos(true); // Llamadas subsecuentes (refresh)
            }, 10000); // Intervalo de 10 segundos
        });

        const blurListener = navigation.addListener('blur', () => {
            // Limpiar el intervalo al salir de la pantalla
            if (intervalId) {
                clearInterval(intervalId);
            }
        });

        obtenerDatosUsuario();

        // Limpia los listeners al desmontar
        return () => {
            focusListener();
            blurListener();
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [router?.id_router, navigation]);



    const obtenerRedesPorRouter = async (idRouter) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/routers/redes-ip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_router: idRouter }),
            });

            const data = await response.json();
            if (response.ok) {
                const redesFormateadas = data.map((item) => ({
                    label: item.address,
                    value: item.address,
                }));
                setRedes(redesFormateadas);
            } else {
                console.error('Error al obtener las redes del router:', data);
                Alert.alert('Error', 'No se pudieron obtener las redes del router. Por favor, intente nuevamente.');
            }
        } catch (error) {
            console.error('Error en la solicitud de obtención de redes:', error);
            Alert.alert('Error de Conexión', 'No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.');
        }
    };

    const obtenerLeases = async (idRouter, isRefresh = false) => {
        // Si es la primera carga, usar loading completo
        // Si es refresh, usar refreshing para mantener la lista visible
        if (!leasesInitialized) {
            setLeasesLoading(true);
        } else if (isRefresh) {
            setLeasesRefreshing(true);
        }
        
        setLeasesError(null);
        
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/mikrotik-dhcp-leases-dynamic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_router: idRouter }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Datos de concesiones dinámicas:', data);
                setLeases(data.data || []);
                setLeasesError(null);
                setLeasesInitialized(true);
            } else {
                console.warn('No se pudieron obtener las concesiones DHCP dinámicas:', data);
                // Solo limpiar leases en la primera carga
                if (!leasesInitialized) {
                    setLeases([]);
                }
                setLeasesError('Este router no tiene dispositivos conectados vía DHCP actualmente.');
                setLeasesInitialized(true);
            }
        } catch (error) {
            console.warn('Error en la solicitud de obtención de leases:', error);
            // Solo limpiar leases en la primera carga
            if (!leasesInitialized) {
                setLeases([]);
            }
            setLeasesError('No se pudo conectar con el servidor. Este router podría no tener servicio DHCP configurado.');
            setLeasesInitialized(true);
        } finally {
            setLeasesLoading(false);
            setLeasesRefreshing(false);
        }
    };

    // Función para simplificar las unidades
    const simplificarUnidad = (unidad) => {
        switch (unidad) {
            case 'bps': return 'b';
            case 'kbps': return 'K';
            case 'Mbps': return 'M';
            case 'Gbps': return 'G';
            case 'Tbps': return 'T';
            default: return unidad; // Por si alguna unidad no está en el switch
        }
    };

    const manejarSeleccionLease = async () => {
        if (!selectedLease) return;

        Alert.alert(
            "Confirmar acción",
            `¿Estás seguro de que deseas fijar la IP ${selectedLease?.['active-address']} a la MAC ${selectedLease?.['mac-address']} con estas configuraciones?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        try {
                            const payload = {
                                macAddress: selectedLease['mac-address'],
                                direccion_ip: selectedLease['active-address'],
                                server: selectedLease['server'] || '', // Incluye el servidor DHCP
                                id_router: router.id_router,
                                id_conexion: connectionId,
                                // clientName: `${nombres} ${apellidos}`,
                                subida_limite: uploadSpeed,
                                unidad_subida: simplificarUnidad(uploadUnit), // Simplificar la unidad de subida
                                bajada_limite: downloadSpeed,
                                unidad_bajada: simplificarUnidad(downloadUnit), // Simplificar la unidad de bajada
                                nota: '',
                                id_usuario: idUsuario,
                                id_isp: idIsp
                            };

                            const response = await fetch('https://wellnet-rd.com:444/api/guardar-configuracion', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(payload),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                Alert.alert('Éxito', 'La selección fue enviada al servidor correctamente.');
                                console.log('Respuesta del servidor:', data);

                                // Navegar a la pantalla ConexionDetalles
                                navigation.navigate('ConexionDetalles', {
                                    connectionId,
                                    usuarioId: router.id_router, // Reemplaza con el ID de usuario correspondiente
                                });
                            } else {
                                console.error('Error al enviar la selección:', data);
                                Alert.alert('Error', 'No se pudo enviar la selección al servidor.');
                            }
                        } catch (error) {
                            console.error('Error en la solicitud al servidor:', error);
                            Alert.alert('Error', 'No se pudo conectar con el servidor.');
                        } finally {
                            setModalVisible(false);
                        }
                    },
                },
            ]
        );
    };




    const renderDhcpLeasesSection = () => {
        // Solo mostrar loading completo en la primera carga
        if (leasesLoading && !leasesInitialized) {
            return (
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="network-wifi" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Dispositivos Conectados (DHCP)
                        </Text>
                    </View>
                    
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                        <Text style={[styles.text, { marginTop: 12, textAlign: 'center' }]}>
                            Obteniendo concesiones DHCP...
                        </Text>
                    </View>
                </Card>
            );
        }

        // Si hay error pero ya hay datos previos, mostrar los datos con indicador de error
        if (leasesError && leases.length === 0) {
            return (
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="network-wifi" 
                            size={24} 
                            color={isDarkMode ? '#F59E0B' : '#D97706'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Dispositivos Conectados (DHCP)
                        </Text>
                    </View>
                    
                    <View style={styles.warningContainer}>
                        <Icon 
                            name="info" 
                            size={48} 
                            color={isDarkMode ? '#F59E0B' : '#D97706'} 
                        />
                        <Text style={[styles.warningTitle, { color: isDarkMode ? '#F59E0B' : '#D97706' }]}>
                            Sin Dispositivos DHCP
                        </Text>
                        <Text style={[styles.warningText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            {leasesError}
                        </Text>
                    </View>
                </Card>
            );
        }

        // Si no hay leases y no hay error, mostrar estado vacío
        if (leases.length === 0 && leasesInitialized && !leasesError) {
            return (
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="network-wifi" 
                            size={24} 
                            color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Dispositivos Conectados (DHCP)
                        </Text>
                        {leasesRefreshing && (
                            <ActivityIndicator 
                                size="small" 
                                color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                                style={{ marginLeft: 12 }}
                            />
                        )}
                    </View>
                    
                    <View style={styles.emptyContainer}>
                        <Icon 
                            name="wifi-off" 
                            size={48} 
                            color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                        />
                        <Text style={[styles.emptyTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            Sin Dispositivos Conectados
                        </Text>
                        <Text style={[styles.emptyText, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                            No hay dispositivos conectados dinámicamente a este router.
                        </Text>
                    </View>
                </Card>
            );
        }

        // Mostrar lista con datos (con o sin refreshing)
        return (
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <Icon 
                        name="network-wifi" 
                        size={24} 
                        color={isDarkMode ? '#10B981' : '#059669'} 
                    />
                    <View style={styles.headerContent}>
                        <Text style={[styles.title, { fontSize: 18 }]}>
                            Dispositivos Conectados (DHCP)
                        </Text>
                        <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            {leases.length} dispositivos • Selecciona para crear reserva
                        </Text>
                    </View>
                    {leasesRefreshing && (
                        <ActivityIndicator 
                            size="small" 
                            color={isDarkMode ? '#10B981' : '#059669'} 
                            style={{ marginLeft: 12 }}
                        />
                    )}
                    {leasesError && (
                        <Icon 
                            name="warning" 
                            size={20} 
                            color={isDarkMode ? '#F59E0B' : '#D97706'} 
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </View>
                
                {/* Mostrar error si existe, pero mantener la lista visible */}
                {leasesError && (
                    <View style={[styles.errorBanner, { 
                        backgroundColor: isDarkMode ? '#7C2D12' : '#FEF3C7',
                        borderColor: isDarkMode ? '#F59E0B' : '#D97706'
                    }]}>
                        <Icon 
                            name="warning" 
                            size={16} 
                            color={isDarkMode ? '#F59E0B' : '#D97706'} 
                        />
                        <Text style={[styles.errorBannerText, { 
                            color: isDarkMode ? '#FCD34D' : '#92400E' 
                        }]}>
                            Error al actualizar: {leasesError}
                        </Text>
                    </View>
                )}
                
                <View style={[styles.leasesContainer, { 
                    opacity: leasesRefreshing ? 0.7 : 1 
                }]}>
                    {leases.map((item, index) => (
                        <TouchableOpacity
                            key={`${item['mac-address']}-${index}`}
                            style={[styles.leaseCard, { 
                                backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                                borderColor: isDarkMode ? '#4B5563' : '#E5E7EB'
                            }]}
                            onPress={() => {
                                setSelectedLease(item);
                                setModalVisible(true);
                            }}
                            activeOpacity={0.7}
                            disabled={leasesRefreshing}
                        >
                            <View style={styles.leaseHeader}>
                                <Icon 
                                    name="device-hub" 
                                    size={20} 
                                    color={isDarkMode ? '#10B981' : '#059669'} 
                                />
                                <View style={styles.leaseInfo}>
                                    <Text style={[styles.leaseTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                        {item['active-address']}
                                    </Text>
                                    <Text style={[styles.leaseSubtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        MAC: {item['mac-address']}
                                    </Text>
                                </View>
                                <Icon 
                                    name="chevron-right" 
                                    size={20} 
                                    color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                                />
                            </View>
                            
                            <View style={styles.leaseDetails}>
                                <View style={styles.leaseDetailItem}>
                                    <Icon 
                                        name="dns" 
                                        size={16} 
                                        color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                                    />
                                    <Text style={[styles.leaseDetailText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Servidor: {item['server'] || 'Desconocido'}
                                    </Text>
                                </View>
                                <View style={styles.leaseDetailItem}>
                                    <Icon 
                                        name="schedule" 
                                        size={16} 
                                        color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                                    />
                                    <Text style={[styles.leaseDetailText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Expira: {item['expires-after']}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.containerSuperior}>
                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Configuración de IP</Text>
                <ThemeSwitch />
            </View>

            <ScrollView 
                style={[styles.container, { paddingTop: 0 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Connection Info Card */}
                <Card style={[styles.card, { marginTop: 16 }]}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="settings-ethernet" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Información de Conexión
                        </Text>
                    </View>
                    
                    <View style={styles.connectionInfoContainer}>
                        <View style={styles.connectionDetailRow}>
                            <Icon 
                                name="fingerprint" 
                                size={20} 
                                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                            />
                            <View style={styles.connectionDetailContent}>
                                <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    ID de Conexión
                                </Text>
                                <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    {connectionId}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.connectionDetailRow}>
                            <Icon 
                                name="person" 
                                size={20} 
                                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                            />
                            <View style={styles.connectionDetailContent}>
                                <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Cliente
                                </Text>
                                <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    {nombres} {apellidos}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.connectionDetailRow}>
                            <Icon 
                                name="location-on" 
                                size={20} 
                                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                            />
                            <View style={styles.connectionDetailContent}>
                                <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Dirección
                                </Text>
                                <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    {direccion}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.connectionDetailRow}>
                            <Icon 
                                name="router" 
                                size={20} 
                                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                            />
                            <View style={styles.connectionDetailContent}>
                                <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Router del Proveedor
                                </Text>
                                <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    {router?.descripcion || router?.nombre_router || 'No seleccionado'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Configuration Options Card */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="network-check" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Opciones de Configuración
                        </Text>
                    </View>
                    
                    <View style={styles.configOptionsContainer}>
                        <TouchableOpacity
                            style={[styles.configOption, { 
                                backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                                borderColor: isDarkMode ? '#4B5563' : '#D1D5DB'
                            }]}
                            onPress={() => {
                                navigation.navigate('ConfiguracionScreenRedes', {
                                    connectionId,
                                    router,
                                    nombres,
                                    apellidos,
                                    direccion,
                                });
                            }}
                            activeOpacity={0.7}
                        >
                            <Icon 
                                name="settings-input-antenna" 
                                size={32} 
                                color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                            />
                            <View style={styles.configOptionContent}>
                                <Text style={[styles.configOptionTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    Configuración Manual
                                </Text>
                                <Text style={[styles.configOptionSubtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Asignar IP estática manualmente
                                </Text>
                            </View>
                            <Icon 
                                name="chevron-right" 
                                size={24} 
                                color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                            />
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Information Card */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="info" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Tipos de Configuración
                        </Text>
                    </View>
                    
                    <View style={styles.infoSectionContainer}>
                        {/* Manual Configuration Info */}
                        <View style={[styles.infoItem, { 
                            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                            borderColor: isDarkMode ? '#4B5563' : '#E5E7EB'
                        }]}>
                            <View style={styles.infoItemHeader}>
                                <Icon 
                                    name="settings-input-antenna" 
                                    size={20} 
                                    color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                                />
                                <Text style={[styles.infoItemTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    Configuración Manual
                                </Text>
                            </View>
                            <Text style={[styles.infoItemDescription, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                Asigna una dirección IP fija específica. Recomendado para dispositivos que necesitan siempre la misma IP (servidores, impresoras, cámaras).
                            </Text>
                        </View>

                        {/* DHCP Reservation Info */}
                        <View style={[styles.infoItem, { 
                            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                            borderColor: isDarkMode ? '#4B5563' : '#E5E7EB'
                        }]}>
                            <View style={styles.infoItemHeader}>
                                <Icon 
                                    name="link" 
                                    size={20} 
                                    color={isDarkMode ? '#10B981' : '#059669'} 
                                />
                                <Text style={[styles.infoItemTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    Concesión DHCP (Reserva)
                                </Text>
                            </View>
                            <Text style={[styles.infoItemDescription, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                Amarra una dirección IP específica a una dirección MAC. El dispositivo siempre obtendrá la misma IP automáticamente cuando se conecte.
                            </Text>
                        </View>

                        {/* Recommendation */}
                        <View style={[styles.recommendationBox, { 
                            backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF',
                            borderColor: isDarkMode ? '#3B82F6' : '#DBEAFE'
                        }]}>
                            <Icon 
                                name="lightbulb" 
                                size={20} 
                                color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                            />
                            <View style={styles.recommendationContent}>
                                <Text style={[styles.recommendationTitle, { color: isDarkMode ? '#DBEAFE' : '#1E40AF' }]}>
                                    Recomendación
                                </Text>
                                <Text style={[styles.recommendationText, { color: isDarkMode ? '#93C5FD' : '#1E3A8A' }]}>
                                    Si ves un dispositivo ya conectado abajo, selecciónalo para crear una reserva DHCP (amarra la IP a su MAC). Si el dispositivo no está conectado aún, usa la configuración manual.
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* DHCP Leases Section */}
                {renderDhcpLeasesSection()}
                
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Modal for DHCP Lease Configuration */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={estilos.modalContainer}>
                    <View style={estilos.modalContent}>
                        <View style={styles.modalHeader}>
                            <Icon 
                                name="network-check" 
                                size={24} 
                                color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                            />
                            <Text style={[estilos.modalText, { fontSize: 20, fontWeight: 'bold' }]}>
                                Configurar Dispositivo
                            </Text>
                        </View>
                        
                        <View style={styles.modalDeviceInfo}>
                            <Text style={[estilos.modalText, { fontSize: 16, marginBottom: 8 }]}>
                                IP: {selectedLease?.['active-address']}
                            </Text>
                            <Text style={[estilos.modalText, { fontSize: 14, opacity: 0.8 }]}>
                                MAC: {selectedLease?.['mac-address']}
                            </Text>
                        </View>

                        <View style={estilos.row}>
                            <TextInput
                                style={estilos.inputPicker}
                                placeholder="Velocidad de subida"
                                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                                keyboardType="numeric"
                                value={uploadSpeed}
                                onChangeText={setUploadSpeed}
                            />
                            <Picker
                                selectedValue={uploadUnit}
                                style={estilos.unitPicker}
                                onValueChange={(itemValue) => setUploadUnit(itemValue)}
                            >
                                <Picker.Item label="bps" value="bps" />
                                <Picker.Item label="kbps" value="kbps" />
                                <Picker.Item label="Mbps" value="Mbps" />
                                <Picker.Item label="Gbps" value="Gbps" />
                                <Picker.Item label="Tbps" value="Tbps" />
                            </Picker>
                        </View>
                        
                        <View style={estilos.row}>
                            <TextInput
                                style={estilos.inputPicker}
                                placeholder="Velocidad de bajada"
                                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                                keyboardType="numeric"
                                value={downloadSpeed}
                                onChangeText={setDownloadSpeed}
                            />
                            <Picker
                                selectedValue={downloadUnit}
                                style={estilos.unitPicker}
                                onValueChange={(itemValue) => setDownloadUnit(itemValue)}
                            >
                                <Picker.Item label="bps" value="bps" />
                                <Picker.Item label="kbps" value="kbps" />
                                <Picker.Item label="Mbps" value="Mbps" />
                                <Picker.Item label="Gbps" value="Gbps" />
                                <Picker.Item label="Tbps" value="Tbps" />
                            </Picker>
                        </View>

                        <View style={estilos.modalButtons}>
                            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
                            <Button title="Configurar" onPress={manejarSeleccionLease} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ConfiguracionFijarIP;
