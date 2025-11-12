import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './ControlDevicesScreenStyles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../componentes/themeSwitch';
import { format } from 'date-fns';

const ControlDevicesScreen = ({ route }) => {
    const { ispId, id_usuario } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [deviceStates, setDeviceStates] = useState({});
    const [deviceDetails, setDeviceDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [usuarioId, setUsuarioId] = useState(null);

    const deviceTypes = [
        { 
            id: 'routers', 
            name: 'Routers', 
            icon: '🌐', 
            description: 'Dispositivos de enrutamiento de red',
            count: deviceStates?.routers?.length || 0,
            status: 'active',
            styleClass: 'routerCard'
        },
        { 
            id: 'switches', 
            name: 'Switches', 
            icon: '🔀', 
            description: 'Conmutadores de red',
            count: deviceStates?.switches?.length || 0,
            status: 'active',
            styleClass: 'switchCard'
        },
        { 
            id: 'olts', 
            name: 'OLTs', 
            icon: '📡', 
            description: 'Terminales de línea óptica',
            count: deviceStates?.olts?.length || 0,
            status: 'active',
            styleClass: 'oltCard'
        },
        { 
            id: 'cameras', 
            name: 'Cámaras de Vigilancia', 
            icon: '📹', 
            description: 'Sistema de videovigilancia',
            count: deviceStates?.cameras?.length || 0,
            status: 'active',
            styleClass: 'cameraCard'
        },
        { 
            id: 'linuxServers', 
            name: 'Servidores Linux', 
            icon: '🖥️', 
            description: 'Servidores del sistema',
            count: deviceStates?.linuxServers?.length || 0,
            status: 'active',
            styleClass: 'serverCard'
        },
        { 
            id: 'powerOutlets', 
            name: 'Tomas de Corriente', 
            icon: '🔌', 
            description: 'Control de energía',
            count: deviceStates?.powerOutlets?.length || 0,
            status: 'active',
            styleClass: 'routerCard'
        },
        { 
            id: 'acUnits', 
            name: 'Aires Acondicionados', 
            icon: '❄️', 
            description: 'Control de climatización',
            count: deviceStates?.acUnits?.length || 0,
            status: 'active',
            styleClass: 'switchCard'
        },
        { 
            id: 'powerInverters', 
            name: 'Inversores de Corriente', 
            icon: '⚡', 
            description: 'Sistemas de energía',
            count: deviceStates?.powerInverters?.length || 0,
            status: 'active',
            styleClass: 'oltCard'
        },
        { 
            id: 'fiberConverters', 
            name: 'Convertidores FO-Ethernet', 
            icon: '🔄', 
            description: 'Conversores de fibra óptica',
            count: deviceStates?.fiberConverters?.length || 0,
            status: 'active',
            styleClass: 'cameraCard'
        },
        { 
            id: 'bateryCharger', 
            name: 'Cargadores de Batería', 
            icon: '🔋', 
            description: 'Sistemas de respaldo',
            count: deviceStates?.bateryCharger?.length || 0,
            status: 'active',
            styleClass: 'serverCard'
        }
    ];

    const obtenerDatosUsuario = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            if (jsonValue != null) {
                const userData = JSON.parse(jsonValue);
                setNombreUsuario(userData.nombre);
                setUsuarioId(userData.id);
            }
        } catch (e) {
            console.error('Error al leer el nombre del usuario', e);
        }
    };

    const fetchDeviceStates = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://your-api-url/api/device-states', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ispId: ispId })
            });
            if (response.ok) {
                const data = await response.json();
                setDeviceStates(data);
            } else {
                console.error('Fallo al obtener los estados de los dispositivos', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error al obtener datos:', error.message);
        } finally {
            setIsLoading(false);
        }
    };
    

    const fetchDeviceDetails = async () => {
        try {
            const response = await fetch('https://your-api-url/api/device-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_isp: ispId })
            });
            if (response.ok) {
                const data = await response.json();
                setDeviceDetails(data);
            } else {
                throw new Error('Fallo al obtener detalles de los dispositivos');
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        }
    };


    const registrarNavegacion = async () => {
        const fechaActual = new Date();
        const fecha = format(fechaActual, 'yyyy-MM-dd');
        const hora = format(fechaActual, 'HH:mm:ss');
        const pantalla = 'ControlDevicesScreen';

        const datos = JSON.stringify({
            usuarioId,
            deviceStates,
            deviceDetails
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


    useFocusEffect(
        useCallback(() => {
            obtenerDatosUsuario();
            if (usuarioId) {
                fetchDeviceStates();
                registrarNavegacion();
            }
            return () => { };
        }, [usuarioId])
    );

    const handleDevicePress = (deviceId) => {
        if (deviceId === 'routers') {
            // navigation.navigate('RouterListScreen');
            navigation.navigate('RouterListScreen', { id_usuario: usuarioId });
        } else if (deviceId === 'olts') {
            navigation.navigate('OLTsListScreen', { id_usuario: usuarioId });
        } else {
            console.log("Device pressed:", deviceId);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'active':
                return {
                    badge: styles.statusActive,
                    text: styles.statusTextActive,
                    label: '🟢 Operativo'
                };
            case 'inactive':
                return {
                    badge: styles.statusInactive,
                    text: styles.statusTextInactive,
                    label: '🔴 Inactivo'
                };
            default:
                return {
                    badge: styles.statusPending,
                    text: styles.statusTextPending,
                    label: '🟡 Verificando'
                };
        }
    };

    const renderDeviceCard = ({ item }) => {
        const statusInfo = getStatusInfo(item.status);
        
        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.deviceCard, styles[item.styleClass]]}
                onPress={() => handleDevicePress(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.deviceHeader}>
                    <Text style={styles.deviceIcon}>{item.icon}</Text>
                    <View style={styles.deviceInfo}>
                        <Text style={styles.deviceName}>{item.name}</Text>
                        <Text style={styles.deviceDescription}>{item.description}</Text>
                    </View>
                    <View style={[styles.deviceStatusBadge, statusInfo.badge]}>
                        <Text style={statusInfo.text}>{statusInfo.label}</Text>
                    </View>
                </View>
                
                <View style={styles.deviceDetails}>
                    <View style={styles.deviceDetailRow}>
                        <Text style={styles.deviceDetailLabel}>Dispositivos</Text>
                        <Text style={styles.deviceDetailValue}>{item.count} unidades</Text>
                    </View>
                    <View style={styles.deviceDetailRow}>
                        <Text style={styles.deviceDetailLabel}>Estado</Text>
                        <Text style={styles.deviceDetailValue}>
                            {item.count > 0 ? 'Configurados' : 'Sin configurar'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderLoadingOverlay = () => {
        if (!isLoading) return null;
        
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando dispositivos...</Text>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => {
        if (deviceTypes.some(device => device.count > 0)) return null;
        
        return (
            <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>🔧</Text>
                <Text style={styles.emptyStateTitle}>No hay dispositivos configurados</Text>
                <Text style={styles.emptyStateMessage}>
                    Configura tus dispositivos de red para comenzar a monitorearlos desde esta pantalla.
                </Text>
                <TouchableOpacity style={styles.actionButton}>
                    <Text>⚙️</Text>
                    <Text style={styles.actionButtonText}>Configurar Dispositivos</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Control de Dispositivos</Text>
                        <Text style={styles.headerSubtitle}>
                            Bienvenido, {nombreUsuario || 'Usuario'}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.deviceGrid}
                >
                    {deviceTypes.map((item) => (
                        <View key={item.id}>
                            {renderDeviceCard({ item })}
                        </View>
                    ))}
                    
                    {renderEmptyState()}
                </ScrollView>
            </View>

            {renderLoadingOverlay()}
        </View>
    );
};

export default ControlDevicesScreen;
