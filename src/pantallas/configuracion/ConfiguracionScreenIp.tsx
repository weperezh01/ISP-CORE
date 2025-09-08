import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, FlatList, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../componentes/themeSwitch';
import SelectorIp from '../../componentes/SelectorIp';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ConfiguracionScreenIp = ({ route }) => {
    const { connectionId, nombres, apellidos, direccion, router, redSeleccionada } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [ips, setIps] = useState([]);
    const [ipsLoading, setIpsLoading] = useState(false);
    const [ipActual, setIpActual] = useState(null);
    const [ipActualLoading, setIpActualLoading] = useState(false);
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

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                if (jsonValue != null) {
                    const userData = JSON.parse(jsonValue);
                    setNombreUsuario(userData.nombre);
                }
            } catch (e) {
                console.error('Error al leer el nombre del usuario', e);
            }
        };

        const obtenerIpActual = async (connectionId, redSeleccionada) => {
            setIpActualLoading(true);
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/obtener-ip-por-conexion-configuracion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_conexion: connectionId }),
                });

                const data = await response.json();
                if (response.ok && data.length > 0) {
                    const ip = data[0].direccion_ip;
                    if (isIpInRange(ip, redSeleccionada)) {
                        setIpActual(ip);
                    } else {
                        setIpActual(null);
                    }
                } else {
                    setIpActual(null);
                    console.log('No hay IP actual configurada para esta conexión');
                }
            } catch (error) {
                console.error('Error en la solicitud de obtención de la IP actual:', error);
                setIpActual(null);
            } finally {
                setIpActualLoading(false);
            }
        };

        obtenerDatosUsuario();
        obtenerIpActual(connectionId, redSeleccionada);
        if (redSeleccionada) {
            obtenerIpsPorRed(redSeleccionada);
        }
        registrarNavegacion(); // Registrar la navegación al cargar la pantalla
    }, [redSeleccionada, connectionId]);

    const obtenerIpsPorRed = async (network) => {
        setIpsLoading(true);
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/routers/rango-ip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ network }),
            });

            const data = await response.json();
            if (response.ok) {
                const ipsFormateadas = data.map((item, index) => ({
                    direccion_ip: item.direccion_ip,
                    key: `ip-${index}-${item.direccion_ip}`,
                    estado: item.estado || 'disponible',
                    ...item
                }));
                setIps(ipsFormateadas);
            } else {
                console.error('Error al obtener las IPs de la red:', data);
                Alert.alert('Error', 'No se pudieron obtener las IPs de la red. Por favor, intente nuevamente.');
            }
        } catch (error) {
            console.error('Error en la solicitud de obtención de IPs:', error);
            Alert.alert('Error de Conexión', 'No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.');
        } finally {
            setIpsLoading(false);
        }
    };

    const isIpInRange = (ip, network) => {
        const [networkAddress, networkPrefixLength] = network.split('/');
        const ipBinary = ipToBinary(ip);
        const networkBinary = ipToBinary(networkAddress);
        return ipBinary.substring(0, networkPrefixLength) === networkBinary.substring(0, networkPrefixLength);
    };

    const ipToBinary = (ip) => {
        return ip.split('.').map(octet => parseInt(octet, 10).toString(2).padStart(8, '0')).join('');
    };

    const registrarNavegacion = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Retardo asíncrono de 2 segundos
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'ConfiguracionScreenIp';

        const datos = JSON.stringify({
            connectionId,
            nombres,
            apellidos,
            direccion,
            router,
            redSeleccionada,
            config
        });

        const navigationLogData = {
            id_usuario: await AsyncStorage.getItem('@loginData').then(data => JSON.parse(data).id),
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

    const handleChange = (name, value) => {
        setConfig({ ...config, [name]: value });
    };

    const handleIpSelection = (value) => {
        const selectedIp = ips.find(ip => ip.direccion_ip === value) || value;
        navigation.navigate('ConfiguracionScreenPppoeVelocidad', {
            connectionId,
            nombres,
            apellidos,
            direccion,
            router,
            redSeleccionada,
            ipSeleccionada: selectedIp.direccion_ip || selectedIp,
        });
    };


    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.containerSuperior}>
                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Asignación de IP</Text>
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
                    </View>
                </Card>

                {/* Router and Network Info Card */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="lan" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Red y Router Seleccionados
                        </Text>
                    </View>
                    
                    <View style={styles.networkRouterContainer}>
                        <View style={styles.networkRouterDetailRow}>
                            <Icon 
                                name="router" 
                                size={20} 
                                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                            />
                            <View style={styles.networkRouterDetailContent}>
                                <Text style={[styles.networkRouterDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Router del Proveedor
                                </Text>
                                <Text style={[styles.networkRouterDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    {router?.nombre_router || 'No identificado'}
                                </Text>
                                <Text style={[styles.networkRouterDetailSubValue, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                                    ID: {router?.id_router || 'N/A'}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.networkRouterDetailRow}>
                            <Icon 
                                name="network-check" 
                                size={20} 
                                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                            />
                            <View style={styles.networkRouterDetailContent}>
                                <Text style={[styles.networkRouterDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Red LAN Seleccionada
                                </Text>
                                <Text style={[styles.networkRouterDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    {redSeleccionada}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Current IP Card (if exists) */}
                {(ipActual || ipActualLoading) && (
                    <Card style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Icon 
                                name="sync" 
                                size={24} 
                                color={isDarkMode ? '#10B981' : '#059669'} 
                            />
                            <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                                IP Actual de la Conexión
                            </Text>
                            {ipActualLoading && (
                                <ActivityIndicator 
                                    size="small" 
                                    color={isDarkMode ? '#10B981' : '#059669'} 
                                    style={{ marginLeft: 12 }}
                                />
                            )}
                        </View>
                        
                        {ipActualLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={isDarkMode ? '#10B981' : '#059669'} />
                                <Text style={[styles.text, { marginTop: 12, textAlign: 'center', color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Verificando IP actual...
                                </Text>
                            </View>
                        ) : ipActual ? (
                            <View style={styles.currentIpContainer}>
                                <TouchableOpacity 
                                    style={[styles.currentIpCard, { 
                                        backgroundColor: isDarkMode ? '#065F46' : '#ECFDF5',
                                        borderColor: isDarkMode ? '#10B981' : '#059669'
                                    }]}
                                    onPress={() => handleIpSelection(ipActual)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.currentIpHeader}>
                                        <Icon 
                                            name="language" 
                                            size={24} 
                                            color={isDarkMode ? '#10B981' : '#059669'} 
                                        />
                                        <View style={styles.currentIpInfo}>
                                            <Text style={[styles.currentIpTitle, { color: isDarkMode ? '#34D399' : '#047857' }]}>
                                                {ipActual}
                                            </Text>
                                            <Text style={[styles.currentIpSubtitle, { color: isDarkMode ? '#A7F3D0' : '#065F46' }]}>
                                                IP actualmente asignada
                                            </Text>
                                        </View>
                                        <Icon 
                                            name="chevron-right" 
                                            size={24} 
                                            color={isDarkMode ? '#10B981' : '#059669'} 
                                        />
                                    </View>
                                    
                                    <View style={[styles.currentIpAction, { 
                                        backgroundColor: isDarkMode ? '#047857' : '#D1FAE5',
                                        borderColor: isDarkMode ? '#10B981' : '#A7F3D0'
                                    }]}>
                                        <Icon 
                                            name="refresh" 
                                            size={16} 
                                            color={isDarkMode ? '#34D399' : '#047857'} 
                                        />
                                        <Text style={[styles.currentIpActionText, { color: isDarkMode ? '#34D399' : '#047857' }]}>
                                            Mantener esta IP
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </Card>
                )}

                {/* IP Selection Card */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="my-location" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <View style={styles.headerContent}>
                            <Text style={[styles.title, { fontSize: 18 }]}>
                                Seleccionar Nueva IP
                            </Text>
                            {ipsLoading && (
                                <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Cargando IPs disponibles...
                                </Text>
                            )}
                            {!ipsLoading && ips.length > 0 && (
                                <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    {ips.length} direcciones IP en el rango
                                </Text>
                            )}
                        </View>
                        {ipsLoading && (
                            <ActivityIndicator 
                                size="small" 
                                color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                                style={{ marginLeft: 12 }}
                            />
                        )}
                    </View>
                    
                    <View style={styles.ipSelectorContainer}>
                        {ipsLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                                <Text style={[styles.text, { marginTop: 12, textAlign: 'center', color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Generando rango de IPs...
                                </Text>
                            </View>
                        ) : (
                            <SelectorIp
                                label="Seleccione una dirección IP disponible"
                                placeholder="No hay direcciones IP disponibles en esta red..."
                                data={ips}
                                selectedValue={config.direccionIp}
                                onValueChange={handleIpSelection}
                                isDarkMode={isDarkMode}
                            />
                        )}
                        
                        {!ipsLoading && ips.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Icon 
                                    name="my-location" 
                                    size={48} 
                                    color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                                />
                                <Text style={[styles.emptyTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Sin IPs Disponibles
                                </Text>
                                <Text style={[styles.emptyText, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                                    No se pudieron generar direcciones IP para esta red.
                                </Text>
                            </View>
                        )}
                    </View>
                </Card>
                
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

export default ConfiguracionScreenIp;
