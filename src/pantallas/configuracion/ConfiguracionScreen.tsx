import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../componentes/themeSwitch';
import Selector from '../../componentes/Selector';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ConfiguracionScreen = ({ route }) => {
    const { connectionId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [nombreCliente, setNombreCliente] = useState('');
    const [direccion, setDireccion] = useState('');
    const [routers, setRouters] = useState([]);
    const [redes, setRedes] = useState([]);

    const [config, setConfig] = useState({
        idRouter: '',
        nombreRouter: '',
        descripcionRouter: '',
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
        obtenerDatosUsuario();
        obtenerCliente();
        obtenerRoutersPorIsp();
        registrarNavegacion(); // Registrar la navegación al cargar la pantalla
    }, []);

    const obtenerCliente = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/obtener-cliente-por-conexion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_conexion: connectionId }),
            });

            const data = await response.json();
            if (response.ok) {
                setNombreCliente(`${data.nombres} ${data.apellidos}`);
                setDireccion(data.direccion || '-');
            } else {
                console.error('Error al obtener los datos del cliente:', data);
                Alert.alert('Error', 'No se pudieron obtener los datos del cliente. Por favor, intente nuevamente.');
            }
        } catch (error) {
            console.error('Error en la solicitud de obtención:', error);
            Alert.alert('Error de Conexión', 'No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.');
        }
    };

    const obtenerRoutersPorIsp = async () => {
        try {
            const ispId = await AsyncStorage.getItem('@selectedIspId');
            console.log('ispId: ' + ispId);
            const response = await fetch('https://wellnet-rd.com:444/api/routers/por-isp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ispId }),
            });

            const data = await response.json();
            if (response.ok) {
                setRouters(data);
            } else {
                console.error('Error al obtener los routers:', data);
                Alert.alert('Error', 'No se pudieron obtener los routers. Por favor, intente nuevamente.');
            }
        } catch (error) {
            console.error('Error en la solicitud de obtención:', error);
            Alert.alert('Error de Conexión', 'No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.');
        }
    };

    const handleRouterChange = (value) => {
        const selectedRouter = routers.find((router) => router.id_router === value);
        handleChange('idRouter', value);
        navigation.navigate('ConfiguracionFijarIP', {
            connectionId,
            nombres: nombreCliente.split(' ')[0],
            apellidos: nombreCliente.split(' ').slice(1).join(' '),
            direccion,
            router: selectedRouter
        });
    };

    const handleChange = (name, value) => {
        setConfig({ ...config, [name]: value });
    };

    const registrarNavegacion = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Retardo asíncrono de 2 segundos
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'ConfiguracionScreen';

        const datos = JSON.stringify({
            connectionId,
            nombreCliente,
            direccion,
            config,
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

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.containerSuperior}>
                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Configuración</Text>
                <ThemeSwitch />
            </View>

            <ScrollView 
                style={[styles.container, { paddingTop: 0 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Connection Header Card */}
                <Card style={[styles.card, { marginTop: 16 }]}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="settings-ethernet" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Configuración de Conexión
                        </Text>
                    </View>
                    
                    <View style={styles.connectionIdContainer}>
                        <Icon 
                            name="fingerprint" 
                            size={20} 
                            color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                        />
                        <View style={styles.connectionIdContent}>
                            <Text style={[styles.connectionIdLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                ID de Conexión
                            </Text>
                            <Text style={[styles.connectionIdValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                {connectionId}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Client Information Card */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="person" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Información del Cliente
                        </Text>
                    </View>
                    
                    <View style={styles.clientInfoContainer}>
                        <View style={styles.clientDetailRow}>
                            <Icon 
                                name="account-circle" 
                                size={20} 
                                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                            />
                            <View style={styles.clientDetailContent}>
                                <Text style={[styles.clientDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Nombre del Cliente
                                </Text>
                                <Text style={[styles.clientDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    {nombreCliente || 'Cargando...'}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.clientDetailRow}>
                            <Icon 
                                name="location-on" 
                                size={20} 
                                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                            />
                            <View style={styles.clientDetailContent}>
                                <Text style={[styles.clientDetailLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Dirección
                                </Text>
                                <Text style={[styles.clientDetailValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    {direccion || 'No especificada'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Router Selection Card */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="router" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Router del Proveedor
                        </Text>
                    </View>
                    
                    <View style={styles.routerSelectionContainer}>
                        <View style={styles.routerSelectorWrapper}>
                            <Selector
                                label="Seleccione el equipo de red central"
                                placeholder="Elija el router del proveedor..."
                                data={routers}
                                selectedValue={config.idRouter}
                                onValueChange={handleRouterChange}
                                isDarkMode={isDarkMode}
                            />
                        </View>
                        
                        {routers.length > 0 && (
                            <View style={styles.routerStatsContainer}>
                                <View style={styles.routerStatItem}>
                                    <Icon 
                                        name="network-check" 
                                        size={16} 
                                        color={isDarkMode ? '#10B981' : '#059669'} 
                                    />
                                    <Text style={[styles.routerStatText, { color: isDarkMode ? '#10B981' : '#059669' }]}>
                                        {routers.length} equipos de red disponibles
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </Card>
                
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

export default ConfiguracionScreen;
