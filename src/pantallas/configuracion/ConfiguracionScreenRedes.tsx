import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, FlatList, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../componentes/themeSwitch';
import SelectorRedes from '../../componentes/SelectorRedes';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ConfiguracionScreenRedes = ({ route }) => {
    const { connectionId, nombres, apellidos, direccion, router } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [redes, setRedes] = useState([]);
    const [redesLoading, setRedesLoading] = useState(false);

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
        obtenerDatosUsuario();
        if (router?.id_router) {
            obtenerRedesPorRouter(router.id_router);
        }
        registrarNavegacion(); // Registrar la navegación al cargar la pantalla
    }, [router?.id_router]);

    const obtenerRedesPorRouter = async (idRouter) => {
        setRedesLoading(true);
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
                    ...item // Incluir datos adicionales si los hay
                }));
                setRedes(redesFormateadas);
            } else {
                console.error('Error al obtener las redes del router:', data);
                Alert.alert('Error', 'No se pudieron obtener las redes del router. Por favor, intente nuevamente.');
            }
        } catch (error) {
            console.error('Error en la solicitud de obtención de redes:', error);
            Alert.alert('Error de Conexión', 'No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.');
        } finally {
            setRedesLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setConfig({ ...config, [name]: value });
        if (name === 'redIp') {
            const selectedRed = redes.find((red) => red.value === value);
            navigation.navigate('ConfiguracionScreenIp', {
                connectionId,
                nombres,
                apellidos,
                direccion,
                router,
                redSeleccionada: selectedRed ? selectedRed.label : value,
            });
        }
    };

    const handleSaveConfig = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/configuracion/guardar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_conexion: connectionId, ...config }),
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('Éxito', 'Configuración guardada correctamente.');
                navigation.goBack();
            } else {
                console.error('Error al guardar la configuración:', data);
                Alert.alert('Error', 'No se pudo guardar la configuración. Por favor, intente nuevamente.');
            }
        } catch (error) {
            console.error('Error en la solicitud de guardado:', error);
            Alert.alert('Error de Conexión', 'No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.');
        }
    };

    const registrarNavegacion = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Retardo asíncrono de 2 segundos
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'ConfiguracionScreenRedes';

        const datos = JSON.stringify({
            connectionId,
            nombres,
            apellidos,
            direccion,
            router,
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


    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.containerSuperior}>
                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Configuración de Red</Text>
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

                {/* Router Info Card */}
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
                    
                    <View style={styles.routerInfoContainer}>
                        <View style={[styles.routerInfoCard, { 
                            backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                            borderColor: isDarkMode ? '#4B5563' : '#E5E7EB'
                        }]}>
                            <View style={styles.routerInfoHeader}>
                                <Icon 
                                    name="memory" 
                                    size={20} 
                                    color={isDarkMode ? '#10B981' : '#059669'} 
                                />
                                <View style={styles.routerInfoContent}>
                                    <Text style={[styles.routerInfoTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                        {router?.nombre_router || 'Router no identificado'}
                                    </Text>
                                    <Text style={[styles.routerInfoSubtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        ID: {router?.id_router || 'N/A'}
                                    </Text>
                                </View>
                            </View>
                            
                            {router?.descripcion && (
                                <View style={styles.routerInfoDescription}>
                                    <Icon 
                                        name="description" 
                                        size={16} 
                                        color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                                    />
                                    <Text style={[styles.routerInfoDescText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        {router.descripcion}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Card>

                {/* Network Selection Card */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="lan" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <View style={styles.headerContent}>
                            <Text style={[styles.title, { fontSize: 18 }]}>
                                Selección de Red LAN
                            </Text>
                            {redesLoading && (
                                <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Cargando redes disponibles...
                                </Text>
                            )}
                            {!redesLoading && redes.length > 0 && (
                                <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    {redes.length} redes disponibles
                                </Text>
                            )}
                        </View>
                        {redesLoading && (
                            <ActivityIndicator 
                                size="small" 
                                color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                                style={{ marginLeft: 12 }}
                            />
                        )}
                    </View>
                    
                    <View style={styles.networkSelectorContainer}>
                        {redesLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                                <Text style={[styles.text, { marginTop: 12, textAlign: 'center', color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Obteniendo redes del router...
                                </Text>
                            </View>
                        ) : (
                            <SelectorRedes
                                label="Seleccione la red LAN para asignar la IP"
                                placeholder="Elija una red disponible..."
                                data={redes}
                                selectedValue={config.redIp}
                                onValueChange={(value) => handleChange('redIp', value)}
                                isDarkMode={isDarkMode}
                            />
                        )}
                        
                        {!redesLoading && redes.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Icon 
                                    name="lan" 
                                    size={48} 
                                    color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                                />
                                <Text style={[styles.emptyTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    Sin Redes Disponibles
                                </Text>
                                <Text style={[styles.emptyText, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                                    Este router no tiene redes LAN configuradas.
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

export default ConfiguracionScreenRedes;
