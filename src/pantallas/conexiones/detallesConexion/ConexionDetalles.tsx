import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Modal, Button, ScrollView } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './ConexionDetallesStyles'; // Ruta del archivo de estilos
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ejemplo con Material Icons (puedes cambiarlo)
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import InstallationDetailsModern from './components/InstallationDetailsModern';
import RealTimeConnections from './components/RealTimeConnections';
import ConnectionEventsHistory from './components/ConnectionEventsHistory';
import RealTimeTrafficChart from '../../controles/Routers/components/RealTimeTrafficChart';
import ProgressModal from './components/ProgressModal';
import { useRealTimeProgress } from './hooks/useRealTimeProgress';

const SafeText = ({ children, style }) => (
    <Text style={style}>{children ?? 'N/A'}</Text>
);


const ModalInput = ({ isVisible, onRequestClose, onConfirm, note, setNote, title }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [inputHeight, setInputHeight] = useState(50);


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onRequestClose}>
            <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalView, { backgroundColor: isDarkMode ? '#333' : 'white' }]}>
                    <Text style={[styles.modalText, { color: isDarkMode ? 'white' : 'black' }]}>{title}</Text>
                    <TextInput
                        
                        // style={[styles.input, { color: isDarkMode ? 'white' : 'black', borderColor: isDarkMode ? 'white' : 'gray', textAlignVertical: 'top', height: inputHeight }]}
                        style={[
                            styles.modalInput, // Aplica el estilo base
                            {
                                color: isDarkMode ? 'white' : 'black',
                                borderColor: isDarkMode ? 'white' : 'gray',
                                height: inputHeight > 100 ? inputHeight : 100, // Altura mínima de 100
                                textAlignVertical: 'top', // Asegura que el texto comience arriba
                            },
                        ]}
                        placeholder="Escriba la nota aquí"
                        placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
                        value={note}
                        onChangeText={setNote}
                        multiline={true}
                        onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
                    />
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={styles.modalButtonSecondary} onPress={onRequestClose}>
                            <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={onConfirm}>
                            <Text style={styles.modalButtonText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const ConexionDetalles = ({ route }) => {
    const { connectionId, usuarioId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const s2 = styles2(isDarkMode);
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [idUsuario, setIdUsuario] = useState(null);
    const [connectionDetails, setConnectionDetails] = useState(null);
    const [configDetails, setConfigDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [note, setNote] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [reconnectModalVisible, setReconnectModalVisible] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [error, setError] = useState(null);
    const [pendingIssue, setPendingIssue] = useState(null); // Nueva variable para la avería pendiente
    const [voluntaryDisconnectionModalVisible, setVoluntaryDisconnectionModalVisible] = useState(false);
    
    // Real-time progress modal hook
    const progressModal = useRealTimeProgress();
    const [forcedDisconnectionModalVisible, setForcedDisconnectionModalVisible] = useState(false);
    // Estado para forzar el refresco de la pantalla
    const [refreshKey, setRefreshKey] = useState(0);
    const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);
    const [limitType, setLimitType] = useState(''); // 'subida' o 'bajada'
    const [limitValue, setLimitValue] = useState('');
    const [limitUnit, setLimitUnit] = useState('');
    const [uploadLimit, setUploadLimit] = useState({ value: '', unit: 'M' }); // Límite de subida
    const [downloadLimit, setDownloadLimit] = useState({ value: '', unit: 'M' }); // Límite de bajada
    const [limitValueSubida, setLimitValueSubida] = useState(''); // Valor para subida
    const [limitUnitSubida, setLimitUnitSubida] = useState('M'); // Unidad para subida

    const [limitValueBajada, setLimitValueBajada] = useState(''); // Valor para bajada
    const [limitUnitBajada, setLimitUnitBajada] = useState('M'); // Unidad para bajada
    const [realtimeData, setRealtimeData] = useState(null); // Datos en tiempo real
    const [isTrafficChartPollingEnabled, setIsTrafficChartPollingEnabled] = useState(true); // Control del polling del gráfico
    const [realtimeInterval, setRealtimeInterval] = useState(null); // Intervalo de tiempo real
    const [uptimeData, setUptimeData] = useState(null); // Datos de uptime del backend
    const [uptimeLoading, setUptimeLoading] = useState(false); // Estado de carga del uptime
    const [expandedCards, setExpandedCards] = useState(new Set()); // Track which cards are expanded

    // Colors palette for expand buttons
    const colors = {
        primary: {
            500: '#3B82F6',
            600: '#2563EB',
        },
        gray: {
            300: '#CBD5E1',
            600: '#475569',
        }
    };

    // Function to toggle card expansion
    const toggleCardExpansion = (cardId) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardId)) {
                newSet.delete(cardId);
            } else {
                newSet.add(cardId);
            }
            return newSet;
        });
    };

    // Función para formatear velocidades en tiempo real
    const formatRealtimeSpeed = (bps) => {
        try {
            if (!bps || bps === 0 || isNaN(bps)) return '0 bps';
            const numBps = Number(bps);
            if (numBps <= 0) return '0 bps';
            
            const k = 1000;
            const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
            const i = Math.max(0, Math.min(sizes.length - 1, Math.floor(Math.log(numBps) / Math.log(k))));
            const value = parseFloat((numBps / Math.pow(k, i)).toFixed(1));
            return `${value} ${sizes[i]}`;
        } catch (error) {
            console.error('Error formatting speed:', error);
            return '0 bps';
        }
    };

    // Función para formatear tiempo en línea
    const formatUptime = (seconds) => {
        try {
            if (!seconds || seconds === 0 || isNaN(seconds)) return 'Sin datos';
            const numSeconds = Number(seconds);
            if (numSeconds <= 0) return 'Sin datos';
            
            const days = Math.floor(numSeconds / 86400);
            const hours = Math.floor((numSeconds % 86400) / 3600);
            const minutes = Math.floor((numSeconds % 3600) / 60);
            
            if (days > 0) {
                return `${days}d ${hours}h ${minutes}m`;
            } else if (hours > 0) {
                return `${hours}h ${minutes}m`;
            } else {
                return `${minutes}m`;
            }
        } catch (error) {
            console.error('Error formatting uptime:', error);
            return 'Sin datos';
        }
    };

    // Función para obtener uptime del backend
    const fetchConnectionUptime = async () => {
        if (!connectionId) return;
        
        try {
            setUptimeLoading(true);
            console.log(`📊 Obteniendo uptime para conexión ${connectionId}`);
            
            const response = await fetch(`https://wellnet-rd.com:444/api/connection-uptime/${connectionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const responseText = await response.text();
                
                // Verificar si la respuesta es HTML (endpoint no disponible)
                if (responseText.includes('<!doctype html>') || responseText.includes('<html')) {
                    console.log(`⚠️ Endpoint de uptime no disponible aún para conexión ${connectionId}`);
                    setUptimeData(null);
                    return;
                }
                
                try {
                    const data = JSON.parse(responseText);
                    if (data.success && data.data) {
                        console.log(`✅ Uptime recibido para conexión ${connectionId}:`, data.data);
                        setUptimeData(data.data);
                    } else {
                        console.log(`❌ No hay datos de uptime para conexión ${connectionId}:`, data);
                        setUptimeData(null);
                    }
                } catch (parseError) {
                    console.log(`⚠️ Respuesta no es JSON válido - endpoint no implementado`);
                    setUptimeData(null);
                }
            } else {
                console.error(`❌ Error HTTP ${response.status} obteniendo uptime`);
                setUptimeData(null);
            }
        } catch (error) {
            console.error('❌ Error obteniendo uptime:', error);
            setUptimeData(null);
        } finally {
            setUptimeLoading(false);
        }
    };

    // Función para obtener datos en tiempo real de esta conexión
    const fetchRealtimeData = async () => {
        if (!connectionId) return;
        
        try {
            console.log(`🔄 Obteniendo datos RT para conexión ${connectionId}`);
            const response = await fetch('https://wellnet-rd.com:444/api/active-connections?realtime=true', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    connection_ids: [parseInt(connectionId)]
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data && data.data.length > 0) {
                    const connectionData = data.data[0];
                    console.log(`📊 Datos RT recibidos para conexión ${connectionId}:`, connectionData);
                    
                    setRealtimeData({
                        downloadSpeed: Number(connectionData.download_rate) || 0,
                        uploadSpeed: Number(connectionData.upload_rate) || 0,
                        status: String(connectionData.status || 'unknown'),
                        lastUpdate: new Date(),
                        routerInfo: connectionData.router || null,
                        responseTime: Number(connectionData.response_time) || 0
                    });
                } else {
                    console.log(`❌ No hay datos RT para conexión ${connectionId}`);
                    setRealtimeData({
                        downloadSpeed: 0,
                        uploadSpeed: 0,
                        status: 'no_data',
                        lastUpdate: new Date(),
                        routerInfo: null,
                        responseTime: 0
                    });
                }
            } else {
                console.error(`❌ Error HTTP ${response.status} obteniendo datos RT`);
                setRealtimeData({
                    downloadSpeed: 0,
                    uploadSpeed: 0,
                    status: 'http_error',
                    lastUpdate: new Date(),
                    routerInfo: null,
                    responseTime: 0
                });
            }
        } catch (error) {
            console.error('❌ Error obteniendo datos RT:', error);
            // No establecer realtimeData si hay un error de renderizado para evitar ciclos
            if (error.message && error.message.includes('Text strings must be rendered')) {
                console.error('🚨 Error de renderizado detectado, no actualizando realtimeData');
                return;
            }
            // En caso de error de red, establecer un estado seguro
            setRealtimeData({
                downloadSpeed: 0,
                uploadSpeed: 0,
                status: 'error',
                lastUpdate: new Date(),
                routerInfo: null,
                responseTime: 0
            });
        }
    };

    



    const registrarNavegacion = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Retardo asíncrono de 2 segundos
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'ConexionDetalles';

        const datos = JSON.stringify({
            connectionId,
            usuarioId
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

    const obtenerDatosUsuario = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            if (jsonValue != null) {
                const userData = JSON.parse(jsonValue);
                setNombreUsuario(userData.nombre);
                setIdUsuario(userData.id); // Aquí asignas el ID del usuario
            }
        } catch (e) {
            console.error('Error al leer el nombre del usuario', e);
        }
    };



    const handleVoluntaryDisconnection = () => {
        setVoluntaryDisconnectionModalVisible(true);
    };

    const handleForcedDisconnection = () => {
        setForcedDisconnectionModalVisible(true);
    };



    const handleNavigateToFacturas = () => {
        if (idUsuario && connectionDetails) {
            navigation.navigate('ClienteFacturasScreen', { clientId: connectionDetails.id_cliente, idUsuario, usuarioId });
        } else {
            Alert.alert('Error', 'ID de usuario no disponible');
        }
    };



    const fetchConnectionDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/conexion-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_conexion: connectionId }),
            });
            if (response.ok) {
                const newConnectionDetails = await response.json();
                console.log('📡 Fetched connection details:', newConnectionDetails);
                setConnectionDetails(newConnectionDetails[0]);
            } else {
                throw new Error('Fallo al obtener detalles de las conexiones');
            }
        } catch (error) {
            setError('Error al obtener datos');
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoading(false);
        }
    }, [connectionId]);


    const fetchConfigDetails = useCallback(async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/obtener-configuracion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_conexion: connectionId })
            });
            if (response.ok) {
                const configData = await response.json();
                // 👉 Agregado: Log para ver cómo responde el backend con los datos del Dashboard de Métricas
                console.log('📊 Datos de configuración para Dashboard de Métricas:', configData);
                setConfigDetails(configData);
            } else {
                console.error('Failed to fetch configuration details');
            }
        } catch (error) {
            console.error('Error fetching configuration details:', error);
        }
    }, [connectionId]);

    const fetchPendingIssue = useCallback(async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/obtener-averia-pendiente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_conexion: connectionId })
            });
            if (response.ok) {
                const issueData = await response.json();
                if (issueData.length > 0) {
                    setPendingIssue(issueData[0]); // Suponiendo que solo hay una avería pendiente por conexión
                }
            } else {
                console.error('Failed to fetch pending issue');
            }
        } catch (error) {
            console.error('Error fetching pending issue:', error);
        }
    }, [connectionId]);

    useEffect(() => {
        console.log('🔄 Refrescando datos...');
        obtenerDatosUsuario();
        fetchConnectionDetails();
        fetchConfigDetails();
        fetchPendingIssue(); // Llamada a la nueva función para obtener la avería pendiente
        registrarNavegacion(); // Registrar la navegación
    }, [refreshKey]);

    // Effect para obtener uptime (una vez al cargar)
    useEffect(() => {
        if (!connectionId) return;
        
        console.log(`📊 Obteniendo uptime inicial para conexión ${connectionId}`);
        fetchConnectionUptime();
        
        // Actualizar uptime cada 5 minutos
        const uptimeInterval = setInterval(() => {
            fetchConnectionUptime();
        }, 5 * 60 * 1000); // 5 minutos
        
        return () => {
            if (uptimeInterval) {
                clearInterval(uptimeInterval);
            }
        };
    }, [connectionId]);

    // Effect para manejar datos en tiempo real
    useEffect(() => {
        if (!connectionId) return;

        console.log(`🔴 Iniciando tiempo real para conexión ${connectionId}`);
        
        // Hacer la primera llamada inmediatamente
        fetchRealtimeData();
        
        // Configurar polling cada 3 segundos (optimizado para una sola conexión)
        const interval = setInterval(() => {
            fetchRealtimeData();
        }, 3000);
        
        setRealtimeInterval(interval);
        
        // Cleanup al desmontar el componente
        return () => {
            console.log(`⚫ Deteniendo tiempo real para conexión ${connectionId}`);
            if (interval) {
                clearInterval(interval);
            }
            setRealtimeInterval(null);
        };
    }, [connectionId]);

    useFocusEffect(
        useCallback(() => {
            console.log('🔄 Pantalla ConexionDetalles ha ganado el foco. Refrescando datos...');
            fetchConnectionDetails();
            fetchConfigDetails();
            fetchPendingIssue(); // Opcional: actualiza la avería pendiente si es necesario
            
            // Refrescar también el refreshKey para forzar re-render
            setRefreshKey(prev => prev + 1);
        }, [])
    );


    const formatCurrency = (amount) => new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2
    }).format(amount);

    const handleUpdate = async () => {
        // Implementar la lógica de actualización
    };

    const handleInstall = (instalacion) => {
        navigation.navigate('InstalacionForm', {
            id_conexion: connectionId,
            id_isp: connectionDetails.id_isp,
            id_instalacion: instalacion ? instalacion.id_instalacion : null,
            isEditMode: !!instalacion
        });
    };

    const handleServiceInputChange = (field, value) => {
        setEditServiceData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleServiceUpdate = async () => {
        // Implementar la lógica de actualización del servicio
    };

    const handleEditService = (serviceId) => {
        navigation.navigate('AsignacionServicioClienteScreen', {
            isEditMode: true,
            serviceId: connectionId,
            ispId: connectionDetails.id_isp,
            usuarioId
        });
    };

    const confirmReconnect = () => {
        setReconnectModalVisible(true);
    };

    const confirmSuspension = () => {
        setModalVisible(true);
    };

    const confirmReport = () => {
        setReportModalVisible(true);
    };

    const handleAction = async (idEstadoConexion, successMessage, errorMessage, modalSetter) => {
        try {
            const body = JSON.stringify({
                id_conexion: connectionDetails?.id_conexion,
                id_estado_conexion: idEstadoConexion,
                id_usuario: idUsuario,
                nota: note
            });
    
            console.log('📡 Enviando datos al backend:', body);
    
            // Realizamos ambas llamadas en paralelo
            const [responseConexiones, responseFacturas] = await Promise.all([
                fetch('https://wellnet-rd.com:444/api/conexiones/actualizar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body
                }),
                fetch(`https://wellnet-rd.com:444/api/estados-conexiones-resumen-isp/${connectionDetails.id_isp}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            ]);
    
            const dataConexiones = await responseConexiones.json();
            const dataFacturas = await responseFacturas.json();
    
            if (responseConexiones.ok && responseFacturas.ok) {
                console.log('✅ Respuesta conexiones:', dataConexiones);
                console.log('✅ Respuesta facturas:', dataFacturas);
                Alert.alert('Éxito', successMessage);
                modalSetter(false);
                setNote('');
            } else {
                console.error(errorMessage, dataConexiones, dataFacturas);
                Alert.alert('Error', errorMessage);
            }
        } catch (error) {
            console.error(errorMessage, error);
            Alert.alert(
                'Error de Conexión',
                'No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.'
            );
        }
    };
    
    
    


    const handleSuspend = async () => {
        await handleAction(
            4, // ID para "suspender"
            'Servicio suspendido',
            'No se pudo suspender el servicio',
            setModalVisible
        );
        // Forzar actualización de la pantalla
        setRefreshKey(prev => prev + 1);
    };

    const handleReconnect = async () => {
        await handleAction(
            3, // ID para "reconectar"
            'Servicio reconectado',
            'No se pudo reconectar el servicio',
            setReconnectModalVisible
        );
        // Forzar actualización de la pantalla
        setRefreshKey(prev => prev + 1);
    };


    const handleReport = () => handleAction(7, 'Avería reportada', 'No se pudo reportar la avería', setReportModalVisible);

    const handleDisconnection = (type) => {
        const idEstadoConexion = type === 'voluntary' ? 5 : 6;
        const successMessage = type === 'voluntary' ? 'Servicio dado de baja (voluntaria)' : 'Servicio dado de baja (forzada)';
        const errorMessage = type === 'voluntary' ? 'No se pudo realizar la baja voluntaria' : 'No se pudo realizar la baja forzada';
        const modalSetter = type === 'voluntary' ? setVoluntaryDisconnectionModalVisible : setForcedDisconnectionModalVisible;

        handleAction(idEstadoConexion, successMessage, errorMessage, modalSetter);
    };


    const handleRemoveConfig = () => {
        Alert.alert(
            "Confirmar Desasignación",
            "¿Estás seguro de que deseas desasignar esta configuración?\n\nEsto eliminará:\n• La configuración de la base de datos\n• Queue del router\n• DHCP Leasing\n• PPPoE Secret (si existe)\n\nLa dirección IP permanecerá disponible para futuras asignaciones.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Desasignar",
                    style: "destructive",
                    onPress: () => executeRemoveConfig()
                }
            ],
            { cancelable: true }
        );
    };

    const executeRemoveConfig = async () => {
        // Definir los pasos de la operación (desasignar configuración)
        const operationSteps = [
            {
                id: 'remove-router',
                title: 'Desasignar Configuración',
                description: 'Desasignando configuración y limpiando elementos del MikroTik...'
            }
        ];

        // Iniciar el modal de progreso en tiempo real
        const operationId = `remove-config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await progressModal.startOperation(operationId, operationSteps);

        try {
            console.log('🗑️ [REMOVE-CONFIG] Iniciando eliminación de configuración...');
            console.log('  📋 ID Conexión:', connectionDetails.id_conexion);
            console.log('  🌐 IP Dirección:', configDetails?.direccion_ip);
            console.log('  👤 ID Usuario:', idUsuario);
            console.log('  🆔 Operation ID:', operationId);

            // Obtener datos del usuario para headers
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const loginData = jsonValue ? JSON.parse(jsonValue) : null;
            
            let success = false;
            let errorMessage = '';

            // Solo quitar conexión de router (solo si tenemos dirección IP)
            if (configDetails?.direccion_ip) {
                try {
                    progressModal.updateStep('remove-router', { 
                        message: 'Desasignando configuración...' 
                    });
                    
                    console.log('🔧 [REMOVE-CONFIG] Desasignando configuración...');
                    const routerResponse = await fetch('https://wellnet-rd.com:444/api/configuracion/desasignar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Operation-ID': operationId,
                            'X-User-ID': loginData?.id || idUsuario
                        },
                        body: JSON.stringify({
                            id_conexion: connectionDetails.id_conexion,
                            direccion_ip: configDetails.direccion_ip
                        })
                    });

                    if (routerResponse.ok) {
                        console.log('✅ [REMOVE-CONFIG] Configuración desasignada exitosamente');
                        progressModal.completeStep('remove-router', 'Configuración desasignada correctamente');
                        success = true;
                    } else {
                        const errorData = await routerResponse.json();
                        console.error('❌ [REMOVE-CONFIG] Error desasignando configuración:', errorData);
                        progressModal.errorStep('remove-router', 'Error al desasignar configuración');
                        errorMessage = 'Error al desasignar configuración';
                    }
                } catch (error) {
                    console.error('❌ [REMOVE-CONFIG] Error de red al desasignar configuración:', error);
                    progressModal.errorStep('remove-router', 'Error de conexión');
                    errorMessage = 'Error de conexión al desasignar configuración';
                }
            } else {
                console.log('⚠️ [REMOVE-CONFIG] No hay dirección IP disponible');
                progressModal.errorStep('remove-router', 'No hay IP asignada para quitar');
                errorMessage = 'No hay dirección IP asignada para quitar';
            }

            // Evaluar resultado final
            console.log(`📊 [REMOVE-CONFIG] Resultado: ${success ? 'Éxito' : 'Error'}`);

            // Esperar un poco para que se vea el progreso completo
            setTimeout(() => {
                progressModal.closeModal();
                
                if (success) {
                    // Operación exitosa
                    setConfigDetails(null);
                    fetchConnectionDetails();
                    Alert.alert('Éxito', 'Configuración desasignada exitosamente.');
                    // Mantenerse en la misma pantalla, solo refrescar
                } else {
                    // Operación falló
                    console.error('❌ [REMOVE-CONFIG] Operación falló');
                    Alert.alert(
                        'Error', 
                        errorMessage || 'No se pudo desasignar la configuración.'
                    );
                }
            }, 1500);

        } catch (error) {
            console.error('❌ [REMOVE-CONFIG] Error general:', error);
            progressModal.closeModal();
            Alert.alert('Error de Conexión', 'No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.');
        }
    };

    const handleConfigure = () => {
        navigation.navigate('ConfiguracionScreen', { 
            connectionId, 
            id_isp: connectionDetails.id_isp,
            // Callback para refrescar cuando se regrese
            onConfigComplete: () => {
                console.log('🔄 [CONFIG] Configuración completada, refrescando...');
                fetchConnectionDetails();
                fetchConfigDetails();
                setRefreshKey(prev => prev + 1);
            }
        });
    };

    const handleIssuePress = () => {
        navigation.navigate('InstalacionForm', {
            id_conexion: connectionId,
            id_isp: connectionDetails.id_isp,
            id_instalacion: null,
            isEditMode: false,
            id_averia: pendingIssue.id_averia, // Nuevo parámetro
            descripcion_averia: pendingIssue.descripcion_averia // Nuevo parámetro
        });
    };


    const handleDismantle = () => {
        navigation.navigate('DesmantelamientoForm', {
            id_conexion: connectionId,
            id_isp: connectionDetails.id_isp,
            usuarioId
        });
    };

    const openLimitModal = (type, value, unit) => {
        setLimitType(type); // Define si es subida o bajada
        setLimitValue(value); // Asigna el valor actual
        setLimitUnit(unit); // Asigna la unidad actual
        setIsLimitModalVisible(true); // Abre el modal
    };

    const handleLimitChange = async () => {
        const payload = {
            id_router: configDetails?.router?.id_router,
            id_conexion: connectionDetails?.id_conexion,
            id_usuario: idUsuario,
            id_isp: connectionDetails?.id_isp,
            direccion_ip: configDetails?.direccion_ip,
            maxLimit: `${limitValueSubida}${limitUnitSubida}/${limitValueBajada}${limitUnitBajada}`,
        };
    
        console.log('📡 Enviando payload al backend:', payload);
    
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/actualizar-limite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (response.ok) {
                const responseData = await response.json();
                console.log('✅ Respuesta del backend:', responseData);
                Alert.alert('Éxito', 'El límite se actualizó correctamente.');
                fetchConfigDetails(); // Actualiza los detalles de configuración
                fetchPendingIssue();  // Actualiza la avería pendiente
                setIsLimitModalVisible(false);
            } else {
                console.error('❌ Error al actualizar el límite:', await response.text());
                Alert.alert('Error', 'No se pudo actualizar el límite. Intenta nuevamente.');
            }
        } catch (error) {
            console.error('❌ Error en la solicitud:', error);
            Alert.alert(
                'Error de Conexión',
                'No se pudo establecer conexi����n con el servidor. Por favor, verifica tu conexión a internet.'
            );
        }
    };
    
    const renderItem = ({ item }) => {
        if (!item) {
            return null;
        }
    
        return (
            <View style={styles.detailItem}>
                <View style={styles.container}>
                    <Card style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <Icon name="person" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} style={styles.iconContainer} />
                                <Text style={styles.cardTitle}>Detalles del Cliente</Text>
                            </View>
                            <TouchableOpacity 
                                style={[styles.expandButton, expandedCards.has('cliente') && styles.expandButtonActive]} 
                                onPress={() => toggleCardExpansion('cliente')}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                activeOpacity={0.7}
                            >
                                <Icon 
                                    name={expandedCards.has('cliente') ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                    size={20} 
                                    color={expandedCards.has('cliente') ? "#FFFFFF" : (isDarkMode ? colors.gray[300] : colors.gray[600])} 
                                />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Compact info - Always visible */}
                        <View style={styles.compactInfo}>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Icon name="account-circle" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Nombre</Text>
                                    <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                        {`${item.detallesCliente?.nombres ?? ''} ${item.detallesCliente?.apellidos ?? ''}`.trim() || 'N/A'}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Icon name="badge" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>ID Cliente</Text>
                                    <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.id_cliente ?? 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: 'transparent' }]}>
                                <Icon name="phone" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Teléfono</Text>
                                    <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.detallesCliente?.telefono1 ?? 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        
                        {/* Expanded details - Only visible when expanded */}
                        {expandedCards.has('cliente') && (
                            <View style={styles.connectionDetailsContainer}>
                                <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                    <Icon name="email" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <View style={styles.connectionDetailContent}>
                                        <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>E-mail</Text>
                                        <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.detallesCliente?.correo_elect ?? 'N/A'}</Text>
                                    </View>
                                </View>
                                
                                <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                    <Icon name="home" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <View style={styles.connectionDetailContent}>
                                        <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Dirección</Text>
                                        <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.detallesCliente?.direccion ?? 'N/A'}</Text>
                                    </View>
                                </View>
                                
                                <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                    <Icon name="location-on" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <View style={styles.connectionDetailContent}>
                                        <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Referencia</Text>
                                        <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.detallesCliente?.referencia ?? 'N/A'}</Text>
                                    </View>
                                </View>
                                
                                <View style={[styles.connectionDetailRow, { borderBottomColor: 'transparent' }]}>
                                    <Icon name="event" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <View style={styles.connectionDetailContent}>
                                        <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Cliente desde</Text>
                                        <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                            {item.detallesCliente?.fecha_creacion_cliente 
                                                ? new Date(item.detallesCliente.fecha_creacion_cliente).toLocaleDateString('es', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                                  }) 
                                                : 'N/A'
                                            }
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </Card>

                    <Card style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <Icon name="wifi" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} style={styles.iconContainer} />
                                <Text style={styles.cardTitle}>Detalles del Servicio</Text>
                            </View>
                            <TouchableOpacity 
                                style={[styles.expandButton, expandedCards.has('servicio') && styles.expandButtonActive]} 
                                onPress={() => toggleCardExpansion('servicio')}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                activeOpacity={0.7}
                            >
                                <Icon 
                                    name={expandedCards.has('servicio') ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                    size={20} 
                                    color={expandedCards.has('servicio') ? "#FFFFFF" : (isDarkMode ? colors.gray[300] : colors.gray[600])} 
                                />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Compact info - Always visible */}
                        <View style={styles.compactInfo}>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Icon name="dns" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Servicio</Text>
                                    <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.detallesServicio?.nombre_servicio ?? 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Icon name="speed" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Velocidad</Text>
                                    <Text style={[styles.connectionDetailValue, { color: '#10B981' }]}>
                                        {`${item.detallesServicio?.velocidad_servicio ?? 'N/A'} Mbps`}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: 'transparent' }]}>
                                <Icon name="attach-money" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Precio</Text>
                                    <Text style={[styles.connectionDetailValue, { color: '#10B981' }]}>
                                        {formatCurrency(item.detallesServicio?.precio_servicio) || 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        
                        {/* Expanded details - Only visible when expanded */}
                        {expandedCards.has('servicio') && (
                            <>
                                <View style={styles.connectionDetailsContainer}>
                                    <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                        <Icon name="settings" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                        <View style={styles.connectionDetailContent}>
                                            <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Tecnología</Text>
                                            <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.detallesServicio?.descripcion_servicio ?? 'N/A'}</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={[styles.connectionDetailRow, { borderBottomColor: 'transparent' }]}>
                                        <Icon name="schedule" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                        <View style={styles.connectionDetailContent}>
                                            <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Servicio desde</Text>
                                            <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                                {item.detallesServicio?.created_at_servicio ? 
                                                    new Date(item.detallesServicio.created_at_servicio).toLocaleDateString('es', {
                                                        day: '2-digit', month: '2-digit', year: 'numeric'
                                                    }) : 'N/A'
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                
                                <View style={styles.modernActionsContainer}>
                                    <TouchableOpacity 
                                        style={[
                                            styles.modernActionCard, 
                                            { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC', borderColor: isDarkMode ? '#374151' : '#E5E7EB', width: '100%' }
                                        ]}
                                        onPress={() => handleEditService(item.detallesServicio.id_servicio)}
                                    >
                                        <View style={[styles.modernActionIcon, { backgroundColor: '#8B5CF6' }]}>
                                            <Icon name="edit" size={20} color="#FFFFFF" />
                                        </View>
                                        <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Editar servicio</Text>
                                        <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Modificar plan contratado</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </Card>

                    <Card style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <Icon name="settings-ethernet" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} style={styles.iconContainer} />
                                <Text style={styles.cardTitle}>Detalles de la Conexión</Text>
                            </View>
                            <TouchableOpacity 
                                style={[styles.expandButton, expandedCards.has('conexion') && styles.expandButtonActive]} 
                                onPress={() => toggleCardExpansion('conexion')}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                activeOpacity={0.7}
                            >
                                <Icon 
                                    name={expandedCards.has('conexion') ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                    size={20} 
                                    color={expandedCards.has('conexion') ? "#FFFFFF" : (isDarkMode ? colors.gray[300] : colors.gray[600])} 
                                />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Compact info - Always visible */}
                        <View style={styles.compactInfo}>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Icon name="fingerprint" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>ID Conexión</Text>
                                    <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.id_conexion ?? 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Icon name="place" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Dirección</Text>
                                    <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.direccion ?? 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: 'transparent' }]}>
                                <Icon name="power" size={20} color={
                                    item.estadoConexion?.id_estado_conexion === 3 ? '#10B981' :
                                    item.estadoConexion?.id_estado_conexion === 4 ? '#F59E0B' :
                                    item.estadoConexion?.id_estado_conexion === 5 || item.estadoConexion?.id_estado_conexion === 6 ? '#EF4444' :
                                    '#6B7280'
                                } />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Estado</Text>
                                    <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.estadoConexion?.estado ?? 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                        
                        {/* Expanded details - Only visible when expanded */}
                        {expandedCards.has('conexion') && (
                            <>
                                <View style={styles.connectionDetailsContainer}>
                                    <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                        <Icon name="location-on" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                        <View style={styles.connectionDetailContent}>
                                            <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Referencia</Text>
                                            <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{item.detallesCliente?.referencia ?? 'N/A'}</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                        <Icon name="power" size={20} color={
                                            item.estadoConexion?.id_estado_conexion === 3 ? '#10B981' :
                                            item.estadoConexion?.id_estado_conexion === 4 ? '#F59E0B' :
                                            item.estadoConexion?.id_estado_conexion === 5 || item.estadoConexion?.id_estado_conexion === 6 ? '#EF4444' :
                                            '#6B7280'
                                        } />
                                        <View style={styles.connectionDetailContent}>
                                            <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Estado Detallado</Text>
                                            <View style={styles.statusContainer}>
                                                <View style={[
                                                    styles.statusIndicator,
                                                    {
                                                        backgroundColor: item.estadoConexion?.id_estado_conexion === 3 ? '#10B981' :
                                                        item.estadoConexion?.id_estado_conexion === 4 ? '#F59E0B' :
                                                        item.estadoConexion?.id_estado_conexion === 5 || item.estadoConexion?.id_estado_conexion === 6 ? '#EF4444' :
                                                        '#6B7280'
                                                    }
                                                ]} />
                                                <Text style={[
                                                    styles.statusValue,
                                                    {
                                                        color: item.estadoConexion?.id_estado_conexion === 3 ? '#10B981' :
                                                        item.estadoConexion?.id_estado_conexion === 4 ? '#F59E0B' :
                                                        item.estadoConexion?.id_estado_conexion === 5 || item.estadoConexion?.id_estado_conexion === 6 ? '#EF4444' :
                                                        '#6B7280'
                                                    }
                                                ]}>
                                                    {item.estadoConexion?.estado ?? 'N/A'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                        {/* Alerta de avería pendiente */}
                        {pendingIssue && (
                            <TouchableOpacity style={[styles.modernIssueCard, { backgroundColor: isDarkMode ? '#451A03' : '#FEF3C7' }]} onPress={handleIssuePress}>
                                <View style={styles.modernIssueHeader}>
                                    <Icon name="warning" size={20} color="#F59E0B" />
                                    <Text style={styles.modernIssueTitle}>Avería pendiente</Text>
                                </View>
                                <Text style={[styles.modernIssueDescription, { color: isDarkMode ? '#FCD34D' : '#92400E' }]}>{pendingIssue.descripcion_averia || 'Sin descripción'}</Text>
                                <View style={styles.modernIssueAction}>
                                    <Text style={styles.modernIssueActionText}>Tocar para resolver</Text>
                                    <Icon name="arrow-forward" size={16} color="#F59E0B" />
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Sección de acciones organizadas en grid */}
                        <View style={[styles.connectionActionsContainer, { borderTopColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                            <View style={styles.connectionActionsGrid}>
                                {/* Botón de desmantelar - siempre visible */}
                                <TouchableOpacity style={[
                                    styles.modernActionCard, 
                                    { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }
                                ]} onPress={handleDismantle}>
                                    <View style={[styles.modernActionIcon, { backgroundColor: '#EF4444' }]}>
                                        <Icon name="build" size={20} color="#FFFFFF" />
                                    </View>
                                    <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Desmantelar</Text>
                                    <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Quitar equipo</Text>
                                </TouchableOpacity>

                                {/* Botones condicionales según el estado */}
                                {(item.estadoConexion?.id_estado_conexion === 5 || 
                                  item.estadoConexion?.id_estado_conexion === 4 || 
                                  item.estadoConexion?.id_estado_conexion === 6) && (
                                    <TouchableOpacity style={[
                                        styles.modernActionCard, 
                                        { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }
                                    ]} onPress={confirmReconnect}>
                                        <View style={[styles.modernActionIcon, { backgroundColor: '#10B981' }]}>
                                            <Icon name="power" size={20} color="#FFFFFF" />
                                        </View>
                                        <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Reconectar</Text>
                                        <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Activar servicio</Text>
                                    </TouchableOpacity>
                                )}

                                {item.estadoConexion?.id_estado_conexion === 3 && (
                                    <TouchableOpacity style={[
                                        styles.modernActionCard, 
                                        { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }
                                    ]} onPress={confirmSuspension}>
                                        <View style={[styles.modernActionIcon, { backgroundColor: '#F59E0B' }]}>
                                            <Icon name="pause" size={20} color="#FFFFFF" />
                                        </View>
                                        <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Suspender</Text>
                                        <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Pausar servicio</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Botones de baja - solo para estados específicos */}
                                {item.estadoConexion?.id_estado_conexion !== 6 && item.estadoConexion?.id_estado_conexion !== 5 && (
                                    <>
                                        <TouchableOpacity style={[
                                            styles.modernActionCard, 
                                            { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }
                                        ]} onPress={handleVoluntaryDisconnection}>
                                            <View style={[styles.modernActionIcon, { backgroundColor: '#6B7280' }]}>
                                                <Icon name="person-remove" size={20} color="#FFFFFF" />
                                            </View>
                                            <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Baja Voluntaria</Text>
                                            <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Por solicitud</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity style={[
                                            styles.modernActionCard, 
                                            { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }
                                        ]} onPress={handleForcedDisconnection}>
                                            <View style={[styles.modernActionIcon, { backgroundColor: '#DC2626' }]}>
                                                <Icon name="block" size={20} color="#FFFFFF" />
                                            </View>
                                            <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Baja Forzada</Text>
                                            <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Por incumplimiento</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {/* Botón de reportar avería */}
                                {item.estadoConexion?.id_estado_conexion !== 7 && (
                                    <TouchableOpacity style={[
                                        styles.modernActionCard, 
                                        { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }
                                    ]} onPress={confirmReport}>
                                        <View style={[styles.modernActionIcon, { backgroundColor: '#F59E0B' }]}>
                                            <Icon name="report-problem" size={20} color="#FFFFFF" />
                                        </View>
                                        <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Reportar avería</Text>
                                        <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Crear incidencia</Text>
                                    </TouchableOpacity>
                                )}
                                </View>
                                </View>
                            </>
                        )}
                    </Card>

                    {configDetails && configDetails.router ? (
                        <Card style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <Icon name="router" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                                    <Text style={styles.cardTitle}>Configuración del Router</Text>
                                </View>
                                <TouchableOpacity 
                                    style={[styles.expandButton, expandedCards.has('router') && styles.expandButtonActive]} 
                                    onPress={() => toggleCardExpansion('router')}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    activeOpacity={0.7}
                                >
                                    <Icon 
                                        name={expandedCards.has('router') ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                        size={20} 
                                        color={expandedCards.has('router') ? "#FFFFFF" : (isDarkMode ? colors.gray[300] : colors.gray[600])} 
                                    />
                                </TouchableOpacity>
                            </View>
                            
                            {/* Compact info - Always visible */}
                            <View style={styles.compactInfo}>
                                <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                    <Icon name="storage" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <View style={styles.connectionDetailContent}>
                                        <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Router</Text>
                                        <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{configDetails.router.nombre_router ?? 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                    <Icon name="language" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <View style={styles.connectionDetailContent}>
                                        <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Dirección IP</Text>
                                        <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{configDetails.direccion_ip ?? 'No asignada'}</Text>
                                    </View>
                                </View>
                                <View style={[styles.connectionDetailRow, { borderBottomColor: 'transparent' }]}>
                                    <Icon name="settings-ethernet" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <View style={styles.connectionDetailContent}>
                                        <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Tipo de Conexión</Text>
                                        <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{
                                            configDetails.usuario_pppoe && configDetails.secret_pppoe && configDetails.perfil_pppoe ? 'PPPoE' : 'Simple Queue'
                                        }</Text>
                                    </View>
                                </View>
                            </View>
                            
                            {/* Expanded details - Only visible when expanded */}
                            {expandedCards.has('router') && (
                                <>
                                    {/* Información del Router */}
                                    <View style={styles.configSection}>
                                        <View style={styles.configRow}>
                                            <Icon name="storage" size={20} color={isDarkMode ? '#888' : '#666'} />
                                            <View style={styles.configDetails}>
                                                <Text style={[styles.text, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>Router</Text>
                                                <Text style={[styles.text, { fontSize: 16, color: isDarkMode ? '#fff' : '#000' }]}>{configDetails.router.nombre_router ?? 'N/A'}</Text>
                                                <Text style={[styles.text, { fontSize: 12, color: isDarkMode ? '#ccc' : '#666' }]}>{configDetails.router.descripcion ?? 'Sin descripción'}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Información de Red */}
                                    <View style={styles.configSection}>
                                        <View style={styles.configRow}>
                                            <Icon name="language" size={20} color={isDarkMode ? '#888' : '#666'} />
                                            <View style={styles.configDetails}>
                                                <Text style={[styles.text, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>Dirección IP</Text>
                                                <Text style={[styles.text, { fontSize: 16, color: isDarkMode ? '#fff' : '#000' }]}>{configDetails.direccion_ip ?? 'No asignada'}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Tipo de Conexión */}
                                    <View style={styles.configSection}>
                                        <View style={styles.configRow}>
                                            <Icon name="settings-ethernet" size={20} color={isDarkMode ? '#888' : '#666'} />
                                            <View style={styles.configDetails}>
                                                <Text style={[styles.text, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>Tipo de Conexión</Text>
                                                {configDetails.usuario_pppoe && configDetails.secret_pppoe && configDetails.perfil_pppoe ? (
                                                    <View>
                                                        <Text style={[styles.text, { fontSize: 16, color: isDarkMode ? '#fff' : '#000' }]}>PPPoE</Text>
                                                        <Text style={[styles.text, { fontSize: 12, color: isDarkMode ? '#ccc' : '#666' }]}>Usuario: {configDetails.usuario_pppoe}</Text>
                                                        <Text style={[styles.text, { fontSize: 12, color: isDarkMode ? '#ccc' : '#666' }]}>Perfil: {configDetails.perfil_pppoe}</Text>
                                                    </View>
                                                ) : (
                                                    <Text style={[styles.text, { fontSize: 16, color: isDarkMode ? '#fff' : '#000' }]}>Simple Queue</Text>
                                                )}
                                            </View>
                                        </View>
                                    </View>


                            {/* Límites de Velocidad */}
                            <View style={styles.configSection}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={[styles.text, { fontWeight: 'bold', fontSize: 16, color: isDarkMode ? '#fff' : '#000' }]}>Límites de Velocidad</Text>
                                    {realtimeData && realtimeData.status && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: '#10B981',
                                                marginRight: 6
                                            }} />
                                            <Text style={[styles.text, { 
                                                fontSize: 11, 
                                                color: '#10B981',
                                                fontWeight: '600'
                                            }]}>
                                                EN VIVO
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                
                                <TouchableOpacity
                                    style={[styles.limitCard, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa' }]}
                                    onPress={() => openLimitModal('subida', configDetails.subida_limite, configDetails.unidad_subida)}
                                >
                                    <View style={styles.limitContent}>
                                        <Icon name="upload" size={20} color="#10B981" />
                                        <View style={styles.limitDetails}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Text style={[styles.text, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>Subida</Text>
                                                {realtimeData && realtimeData.status && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: 4,
                                                            backgroundColor: !!(realtimeData?.uploadSpeed && realtimeData.uploadSpeed > 0) ? '#10B981' : '#6B7280',
                                                            marginRight: 4
                                                        }} />
                                                        <Text style={[styles.text, { 
                                                            fontSize: 12, 
                                                            color: !!(realtimeData?.uploadSpeed && realtimeData.uploadSpeed > 0) ? '#10B981' : (isDarkMode ? '#888' : '#666'),
                                                            fontWeight: '600'
                                                        }]}>
                                                            {`↑${formatRealtimeSpeed(realtimeData?.uploadSpeed || 0)}`}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={[styles.text, { fontSize: 16, color: isDarkMode ? '#fff' : '#000' }]}>
                                                {`Límite: ${configDetails.subida_limite ?? 'No configurado'} ${configDetails.unidad_subida ?? ''}`}
                                            </Text>
                                        </View>
                                        <Icon name="edit" size={16} color={isDarkMode ? '#888' : '#666'} />
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.limitCard, { backgroundColor: isDarkMode ? '#444' : '#f8f9fa' }]}
                                    onPress={() => openLimitModal('bajada', configDetails.bajada_limite, configDetails.unidad_bajada)}
                                >
                                    <View style={styles.limitContent}>
                                        <Icon name="download" size={20} color="#3B82F6" />
                                        <View style={styles.limitDetails}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Text style={[styles.text, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>Bajada</Text>
                                                {realtimeData && realtimeData.status && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: 4,
                                                            backgroundColor: !!(realtimeData?.downloadSpeed && realtimeData.downloadSpeed > 0) ? '#3B82F6' : '#6B7280',
                                                            marginRight: 4
                                                        }} />
                                                        <Text style={[styles.text, { 
                                                            fontSize: 12, 
                                                            color: !!(realtimeData?.downloadSpeed && realtimeData.downloadSpeed > 0) ? '#3B82F6' : (isDarkMode ? '#888' : '#666'),
                                                            fontWeight: '600'
                                                        }]}>
                                                            {`↓${formatRealtimeSpeed(realtimeData?.downloadSpeed || 0)}`}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={[styles.text, { fontSize: 16, color: isDarkMode ? '#fff' : '#000' }]}>
                                                {`Límite: ${configDetails.bajada_limite ?? 'No configurado'} ${configDetails.unidad_bajada ?? ''}`}
                                            </Text>
                                        </View>
                                        <Icon name="edit" size={16} color={isDarkMode ? '#888' : '#666'} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Gráfica de Tráfico en Tiempo Real */}
                            {realtimeData && (
                                <View style={[styles.configSection, { marginTop: 15 }]}>
                                    <RealTimeTrafficChart
                                        isDarkMode={isDarkMode}
                                        trafficData={{
                                            upload_bps: realtimeData.uploadSpeed || 0,
                                            download_bps: realtimeData.downloadSpeed || 0
                                        }}
                                        isPollingEnabled={isTrafficChartPollingEnabled}
                                        maxDataPoints={60}
                                        visibleDataPoints={15}
                                    />
                                </View>
                            )}

                                    {/* Nota */}
                                    {!!configDetails.nota && (
                                        <View style={styles.configSection}>
                                            <View style={styles.configRow}>
                                                <Icon name="note" size={20} color={isDarkMode ? '#888' : '#666'} />
                                                <View style={styles.configDetails}>
                                                    <Text style={[styles.text, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>Nota</Text>
                                                    <Text style={[styles.text, { fontSize: 14, color: isDarkMode ? '#ccc' : '#666' }]}>{configDetails.nota}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {/* Botones de Acción Modernos */}
                                    <View style={styles.modernActionsContainer}>
                                        <View style={styles.modernActionsGrid}>
                                            <TouchableOpacity 
                                                style={[
                                                    styles.modernActionCard, 
                                                    { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }
                                                ]}
                                                onPress={handleConfigure}
                                            >
                                                <View style={[styles.modernActionIcon, { backgroundColor: '#3B82F6' }]}>
                                                    <Icon name="edit" size={20} color="#FFFFFF" />
                                                </View>
                                                <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Editar</Text>
                                                <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Configurar router</Text>
                                            </TouchableOpacity>
                                            
                                            <TouchableOpacity 
                                                style={[
                                                    styles.modernActionCard, 
                                                    { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }
                                                ]}
                                                onPress={handleRemoveConfig}
                                            >
                                                <View style={[styles.modernActionIcon, { backgroundColor: '#EF4444' }]}>
                                                    <Icon name="delete" size={20} color="#FFFFFF" />
                                                </View>
                                                <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Quitar</Text>
                                                <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Eliminar configuración</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                            )}
                        </Card>
                    ) : (
                        <Card style={styles.card}>
                            <Text style={styles.title}>Detalles de la Configuración</Text>
                            <Text style={styles.text}>Aún no tienes configuración con el router principal.</Text>
                            <TouchableOpacity onPress={handleConfigure}>
                                <Text style={styles.statusButton}>Configurar</Text>
                            </TouchableOpacity>
                        </Card>
                    )}

                    <Card style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <Icon name="apps" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                                <Text style={styles.cardTitle}>Acciones Rápidas</Text>
                            </View>
                            <TouchableOpacity 
                                style={[styles.expandButton, expandedCards.has('acciones') && styles.expandButtonActive]} 
                                onPress={() => toggleCardExpansion('acciones')}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                activeOpacity={0.7}
                            >
                                <Icon 
                                    name={expandedCards.has('acciones') ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                    size={20} 
                                    color={expandedCards.has('acciones') ? "#FFFFFF" : (isDarkMode ? colors.gray[300] : colors.gray[600])} 
                                />
                            </TouchableOpacity>
                        </View>
                        
                        {/* Compact info - Always visible */}
                        <View style={styles.compactInfo}>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Icon name="receipt" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Facturas</Text>
                                    <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>Ver historial</Text>
                                </View>
                            </View>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                                <Icon name="payment" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Recibos</Text>
                                    <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>Pagos</Text>
                                </View>
                            </View>
                            <View style={[styles.connectionDetailRow, { borderBottomColor: 'transparent' }]}>
                                <Icon name="support" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <View style={styles.connectionDetailContent}>
                                    <Text style={[styles.connectionDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Incidencias</Text>
                                    <Text style={[styles.connectionDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>Soporte</Text>
                                </View>
                            </View>
                        </View>
                        
                        {/* Expanded details - Only visible when expanded */}
                        {expandedCards.has('acciones') && (
                            <View style={styles.modernActionsContainer}>
                                <View style={styles.modernActionsGrid}>
                                    {/* Facturas */}
                                    <TouchableOpacity 
                                        style={[styles.modernActionCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC' }]} 
                                        onPress={handleNavigateToFacturas}
                                    >
                                        <View style={[styles.modernActionIcon, { backgroundColor: '#3B82F6' }]}>
                                            <Icon name="receipt" size={20} color="#FFFFFF" />
                                        </View>
                                        <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Facturas</Text>
                                        <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Ver historial</Text>
                                    </TouchableOpacity>

                                    {/* Recibos */}
                                    <TouchableOpacity 
                                        style={[styles.modernActionCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC' }]} 
                                        onPress={() => navigation.navigate('Recibos1ClienteScreen', { clientId: item?.id_cliente, usuarioId })}
                                    >
                                        <View style={[styles.modernActionIcon, { backgroundColor: '#10B981' }]}>
                                            <Icon name="payment" size={20} color="#FFFFFF" />
                                        </View>
                                        <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Recibos</Text>
                                        <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Pagos</Text>
                                    </TouchableOpacity>

                                    {/* Incidencias */}
                                    <TouchableOpacity 
                                        style={[styles.modernActionCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC' }]} 
                                        onPress={() => navigation.navigate('IncidenciasScreen', { clientId: item?.id_cliente, usuarioId })}
                                    >
                                        <View style={[styles.modernActionIcon, { backgroundColor: '#F59E0B' }]}>
                                            <Icon name="support" size={20} color="#FFFFFF" />
                                        </View>
                                        <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Incidencias</Text>
                                        <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Soporte</Text>
                                    </TouchableOpacity>

                                    {/* Acciones Administrativas */}
                                    <TouchableOpacity 
                                        style={[styles.modernActionCard, { backgroundColor: isDarkMode ? '#1F2937' : '#F8FAFC' }]} 
                                        onPress={() => navigation.navigate('EventosScreen', {
                                            clientId: item?.id_cliente,
                                            connectionId: item?.id_conexion,
                                            usuarioId
                                        })}
                                    >
                                        <View style={[styles.modernActionIcon, { backgroundColor: '#8B5CF6' }]}>
                                            <Icon name="event" size={20} color="#FFFFFF" />
                                        </View>
                                        <Text style={[styles.modernActionText, { color: isDarkMode ? '#F9FAFB' : '#1F2937' }]}>Acciones</Text>
                                        <Text style={[styles.modernActionSubtext, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Administrativas</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </Card>


                    <InstallationDetailsModern 
                        connectionDetails={connectionDetails}
                        styles={styles}
                        isDarkMode={isDarkMode}
                        navigation={navigation}
                        connectionId={connectionId}
                        expandedCards={expandedCards}
                        toggleCardExpansion={toggleCardExpansion}
                    />

                    <ConnectionEventsHistory 
                        connectionId={connectionId}
                        isDarkMode={isDarkMode}
                        styles={styles}
                        expandedCards={expandedCards}
                        toggleCardExpansion={toggleCardExpansion}
                    />
                </View>
            </View>
        );
    };




    return (
        <>
            <View style={styles.containerSuperior}>
                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Conexión</Text>
                <ThemeSwitch />
            </View>
            <View style={styles.containerSuperior}>
                <Text style={styles.title}>Conexión ID: {connectionId} </Text>
            </View>
            <View style={styles.container}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                        <Text style={styles.loadingText}>Cargando detalles de la conexión...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.loadingContainer}>
                        <Icon name="error" size={48} color="#DC2626" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <FlatList
                        data={connectionDetails ? [connectionDetails] : []}
                        extraData={connectionDetails}
                        keyExtractor={item => (item?.id_cliente || item?.id_conexion || Math.random()).toString()}
                        renderItem={renderItem}
                    />
                )}
            </View>

            <ModalInput
                isVisible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                onConfirm={handleSuspend}
                note={note}
                setNote={setNote}
                title="Escriba la razón del corte:"
            />

            <ModalInput
                isVisible={reconnectModalVisible}
                onRequestClose={() => setReconnectModalVisible(false)}
                onConfirm={handleReconnect}
                note={note}
                setNote={setNote}
                title="Escriba la razón de la reconexión:"
            />

            <ModalInput
                isVisible={reportModalVisible}
                onRequestClose={() => setReportModalVisible(false)}
                onConfirm={handleReport}
                note={note}
                setNote={setNote}
                title="Escriba la razón del reporte de avería:"
            />

            <ModalInput
                isVisible={voluntaryDisconnectionModalVisible}
                onRequestClose={() => setVoluntaryDisconnectionModalVisible(false)}
                onConfirm={() => handleDisconnection('voluntary')}
                note={note}
                setNote={setNote}
                title="Escriba la razón de la baja voluntaria:"
            />

            <ModalInput
                isVisible={forcedDisconnectionModalVisible}
                onRequestClose={() => setForcedDisconnectionModalVisible(false)}
                onConfirm={() => handleDisconnection('forced')}
                note={note}
                setNote={setNote}
                title="Escriba la razón de la baja forzada:"
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={isLimitModalVisible}
                onRequestClose={() => setIsLimitModalVisible(false)}>
                <View
                    style={[
                        styles.modalContainer,
                        {
                            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)', // Fondo semitransparente dinámico
                        },
                    ]}>
                    <View
                        style={[
                            styles.modalView,
                            {
                                backgroundColor: isDarkMode ? '#444' : '#f0f0f0', // Fondo del input
                                borderColor: isDarkMode ? '#888' : '#ccc', // Borde dinámico
                                color: isDarkMode ? '#fff' : '#000', // Texto dinámico
                                width: '90%',
                            },
                        ]}>
                        <Text style={[styles.modalText, { color: isDarkMode ? '#fff' : '#000' }]}>
                            Editar Límites de Velocidad
                        </Text>

                        {/* Campo de Subida */}
                        <View style={styles.inputRow}>
                            <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Subida:</Text>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: isDarkMode ? '#444' : '#f0f0f0',
                                            borderColor: isDarkMode ? '#888' : '#ccc',
                                            color: isDarkMode ? '#fff' : '#000',
                                            flex: 0.5, // Proporción del ancho en relación al Picker
                                            marginRight: 10, // Espacio entre el TextInput y el Picker
                                            width: '60%', // Ancho del TextInput
                                        },
                                    ]}
                                    placeholder="Ingrese"
                                    placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                                    keyboardType="numeric"
                                    value={limitValueSubida}
                                    onChangeText={setLimitValueSubida}
                                />
                                <Picker
                                    selectedValue={limitUnitSubida}
                                    style={[
                                        styles.unitPicker,
                                        {
                                            flex: 1, // Ajusta el tamaño del Picker
                                        },
                                    ]}
                                    onValueChange={(itemValue) => setLimitUnitSubida(itemValue)}>
                                    <Picker.Item label="Kbps" value="K" />
                                    <Picker.Item label="Mbps" value="M" />
                                    <Picker.Item label="Gbps" value="G" />
                                    <Picker.Item label="Tbps" value="T" />
                                </Picker>
                            </View>
                        </View>


                        {/* Campo de Bajada */}
                        <View style={styles.inputRow}>
                            <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Bajada:</Text>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: isDarkMode ? '#444' : '#f0f0f0', // Fondo del input
                                            borderColor: isDarkMode ? '#888' : '#ccc', // Borde dinámico
                                            color: isDarkMode ? '#fff' : '#000', // Texto dinámico
                                            flex: 0.5, // Proporción del ancho del input
                                            marginRight: 10, // Espacio entre el TextInput y el Picker
                                        },
                                    ]}
                                    placeholder="Ingrese"
                                    placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                                    keyboardType="numeric"
                                    value={limitValueBajada}
                                    onChangeText={setLimitValueBajada}
                                />
                                <Picker
                                    selectedValue={limitUnitBajada}
                                    style={[
                                        styles.unitPicker,
                                        {
                                            flex: 1, // Proporción del ancho del picker
                                        },
                                    ]}
                                    onValueChange={(itemValue) => setLimitUnitBajada(itemValue)}>
                                    <Picker.Item label="Kbps" value="K" />
                                    <Picker.Item label="Mbps" value="M" />
                                    <Picker.Item label="Gbps" value="G" />
                                    <Picker.Item label="Tbps" value="T" />
                                </Picker>
                            </View>
                        </View>


                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity 
                                style={styles.modalButtonSecondary} 
                                onPress={() => setIsLimitModalVisible(false)}
                            >
                                <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.modalButton} 
                                onPress={handleLimitChange}
                            >
                                <Text style={styles.modalButtonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Progress Modal */}
            <ProgressModal
                visible={progressModal.isVisible}
                title="Desasignando Configuración"
                steps={progressModal.steps}
                currentStep={progressModal.currentStep}
                overallProgress={progressModal.overallProgress}
                isWebSocketConnected={progressModal.isWebSocketConnected}
                webSocketError={progressModal.webSocketError}
                onComplete={progressModal.closeModal}
            />

        </>
    );
};

// const styles = (isDarkMode) => getStyles(isDarkMode);

const styles2 = (isDarkMode) => ({
    ...getStyles(isDarkMode),
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    actionButton: {
        marginHorizontal: 30,
        paddingVertical: 12,
        paddingHorizontal: 15, // Ajusta el padding horizontal para una mejor apariencia
        backgroundColor: isDarkMode ? '#444' : '#ddd',
        borderRadius: 5,
        alignItems: 'center',
        borderColor: isDarkMode ? '#fff' : '#000',
        borderWidth: 1,
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    actionButtonText: {
        color: isDarkMode ? 'white' : 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        backgroundColor: isDarkMode ? '#333' : '#fff',
        marginVertical: 10,
        padding: 15,
        borderRadius: 8,
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isDarkMode ? 'white' : 'black',
        marginBottom: 10,
    },
    limitButton: {
        backgroundColor: '#007bff', // Azul como fondo
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginVertical: 5,
        borderRadius: 8,
        alignItems: 'center',
    },
    limitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});

export default ConexionDetalles;