import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../componentes/themeSwitch';
import SelectorPerfil from '../../componentes/SelectorPerfil';
import LimiteVelocidadForm from './componentes_configuracion/LimiteVelocidadForm';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ConfiguracionScreenPppoeVelocidad = ({ route }) => {
    const { connectionId, nombres, apellidos, direccion, router, redSeleccionada, ipSeleccionada } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [idUsuario, setIdUsuario] = useState(null);
    const [idIsp, setIdIsp] = useState(null);
    const [perfiles, setPerfiles] = useState([]);
    const [perfilesLoading, setPerfilesLoading] = useState(false);
    const [guardandoConfig, setGuardandoConfig] = useState(false);
    const [config, setConfig] = useState({
        usuarioPppoe: '',
        secretPppoe: '',
        perfilPppoe: '',
        limite_subida: '',
        unidad_subida: 'Mbps',
        limite_bajada: '',
        unidad_bajada: 'Mbps',
    });
    const [isEnabled, setIsEnabled] = useState(true);
    const [noteboxText, setNoteboxText] = useState('');

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
        if (router?.id_router) {
            obtenerPerfilesPorRouter(router.id_router);
        }
        registrarNavegacion(); // Registrar la navegación al cargar la pantalla
    }, [router?.id_router]);

    const obtenerPerfilesPorRouter = async (idRouter) => {
        setPerfilesLoading(true);
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/routers/perfiles_pppoe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_router: idRouter }),
            });

            const data = await response.json();
            if (response.ok) {
                const perfilesFormateados = data.map((item, index) => ({
                    value: item.pppoe_perfil_nombre,
                    label: item.pppoe_perfil_nombre,
                    key: `${item.pppoe_perfil_nombre}-${index}`,
                    ...item
                }));
                setPerfiles(perfilesFormateados);
            } else {
                console.error('Error al obtener los perfiles PPPoE del router:', data);
                Alert.alert('Error', 'No se pudieron obtener los perfiles PPPoE del router. Por favor, intente nuevamente.');
            }
        } catch (error) {
            console.error('Error en la solicitud de obtención de perfiles PPPoE:', error);
            Alert.alert('Error de Conexión', 'No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.');
        } finally {
            setPerfilesLoading(false);
        }
    };

    const registrarNavegacion = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Retardo asíncrono de 2 segundos
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'ConfiguracionScreenPppoeVelocidad';

        const datos = JSON.stringify({
            connectionId,
            nombres,
            apellidos,
            direccion,
            router,
            redSeleccionada,
            ipSeleccionada,
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

    const handleSave = () => {
        Alert.alert(
            'Confirmar Guardado',
            '¿Está seguro de que desea guardar la configuración?',
            [
                {
                    text: 'Cancelar',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Guardar',
                    onPress: async () => {
                        setGuardandoConfig(true);
                        try {
                            const response = await fetch('https://wellnet-rd.com:444/api/guardar-configuracion', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    id_conexion: connectionId,
                                    id_tipo_conexion: 1,
                                    id_router: router.id_router,
                                    red_ip: redSeleccionada,
                                    direccion_ip: ipSeleccionada,
                                    usuario_pppoe: config.usuarioPppoe,
                                    secret_pppoe: config.secretPppoe,
                                    perfil_pppoe: config.perfilPppoe,
                                    subida_limite: config.limite_subida,
                                    unidad_subida: config.unidad_subida.charAt(0),
                                    bajada_limite: config.limite_bajada,
                                    unidad_bajada: config.unidad_bajada.charAt(0),
                                    nota: noteboxText,
                                    id_usuario: idUsuario,
                                    id_isp: idIsp,
                                }),
                            });

                            const data = await response.json();
                            if (response.ok) {
                                console.log('Respuesta del servidor:', data);

                                // Registrar el evento de configuración exitosa
                                try {
                                    const eventData = {
                                        id_conexion: connectionId,
                                        tipo_evento: 'Configuración de router',
                                        mensaje: `Router configurado: ${router?.nombre_router || 'Router'}`,
                                        id_usuario: idUsuario,
                                        nota: `Configuración completada. IP: ${ipSeleccionada}, Red: ${redSeleccionada}, Subida: ${config.limite_subida}${config.unidad_subida.charAt(0)}, Bajada: ${config.limite_bajada}${config.unidad_bajada.charAt(0)}`
                                    };

                                    console.log('📝 Registrando evento de configuración:', eventData);

                                    const eventoResponse = await fetch('https://wellnet-rd.com:444/api/log-cortes/registrar', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(eventData),
                                    });

                                    const eventoData = await eventoResponse.json();
                                    console.log('📥 Respuesta del registro de evento:', eventoData);

                                    if (eventoResponse.ok) {
                                        console.log('✅ Evento de configuración registrado exitosamente - ID:', eventoData.id_log);
                                    } else {
                                        console.error('❌ Error al registrar evento:', eventoData);
                                    }
                                } catch (error) {
                                    console.error('❌ Error al registrar el evento de configuración:', error);
                                    // No mostramos error al usuario para no interrumpir el flujo
                                }

                                Alert.alert('Configuración guardada', data.message, [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            navigation.navigate('ConexionDetalles', {
                                                connectionId: connectionId,
                                                id_tipo_conexion: 1,
                                                id_router: router.id_router,
                                                red_ip: redSeleccionada,
                                                direccion_ip: ipSeleccionada,
                                                usuario_pppoe: config.usuarioPppoe,
                                                secret_pppoe: config.secretPppoe,
                                                perfil_pppoe: config.perfilPppoe,
                                                subida_limite: config.limite_subida,
                                                unidad_subida: config.unidad_subida.charAt(0),
                                                bajada_limite: config.limite_bajada,
                                                unidad_bajada: config.unidad_bajada.charAt(0),
                                                nota: noteboxText,
                                                id_usuario: idUsuario,
                                            });
                                        },
                                    },
                                ]);
                            } else {
                                Alert.alert('Error', data.message || 'Error al guardar la configuración.');
                            }
                        } catch (error) {
                            console.error('Error al guardar la configuración:', error);
                            Alert.alert('Error', 'No se pudo guardar la configuración. Por favor, intente nuevamente.');
                        } finally {
                            setGuardandoConfig(false);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const toggleSwitch = () => setIsEnabled(previousState => !previousState);


    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.containerSuperior}>
                <TouchableOpacity onPress={() => { }}>
                    <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Configuración Final</Text>
                <ThemeSwitch />
            </View>

            <ScrollView 
                style={[styles.container, { paddingTop: 0 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Connection Summary Card */}
                <Card style={[styles.card, { marginTop: 16 }]}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="assignment" 
                            size={24} 
                            color={isDarkMode ? '#60A5FA' : '#2563EB'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Resumen de Configuración
                        </Text>
                    </View>
                    
                    <View style={styles.configSummaryContainer}>
                        <View style={styles.summaryRow}>
                            <Icon name="fingerprint" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <View style={styles.summaryContent}>
                                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Conexión</Text>
                                <Text style={[styles.summaryValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{connectionId}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Icon name="person" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <View style={styles.summaryContent}>
                                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Cliente</Text>
                                <Text style={[styles.summaryValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{nombres} {apellidos}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Icon name="router" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <View style={styles.summaryContent}>
                                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Router</Text>
                                <Text style={[styles.summaryValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{router?.nombre_router || 'No identificado'}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Icon name="lan" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <View style={styles.summaryContent}>
                                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Red</Text>
                                <Text style={[styles.summaryValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{redSeleccionada}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Icon name="my-location" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <View style={styles.summaryContent}>
                                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>IP Asignada</Text>
                                <Text style={[styles.summaryValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{ipSeleccionada}</Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* PPPoE Configuration Card */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="vpn-key" 
                            size={24} 
                            color={isDarkMode ? '#10B981' : '#059669'} 
                        />
                        <View style={styles.headerContent}>
                            <Text style={[styles.title, { fontSize: 18 }]}>
                                Credenciales PPPoE
                            </Text>
                            <Text style={[styles.subtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                {isEnabled ? 'Configuración activada' : 'Sin autenticación PPPoE'}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ 
                                false: isDarkMode ? '#374151' : '#E5E7EB', 
                                true: isDarkMode ? '#059669' : '#10B981' 
                            }}
                            thumbColor={isEnabled 
                                ? (isDarkMode ? '#10B981' : '#FFFFFF') 
                                : (isDarkMode ? '#6B7280' : '#9CA3AF')
                            }
                            ios_backgroundColor={isDarkMode ? '#374151' : '#E5E7EB'}
                            onValueChange={toggleSwitch}
                            value={isEnabled}
                        />
                    </View>
                    
                    {isEnabled ? (
                        <View style={styles.pppoeConfigContainer}>
                            <View style={styles.inputContainer}>
                                <Icon name="account-circle" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <TextInput
                                    style={[styles.modernInput, { 
                                        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                                        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                                        color: isDarkMode ? '#F9FAFB' : '#111827'
                                    }]}
                                    placeholder="Usuario PPPoE"
                                    value={config.usuarioPppoe}
                                    onChangeText={(value) => handleChange('usuarioPppoe', value)}
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                />
                            </View>
                            
                            <View style={styles.inputContainer}>
                                <Icon name="lock" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <TextInput
                                    style={[styles.modernInput, { 
                                        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                                        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                                        color: isDarkMode ? '#F9FAFB' : '#111827'
                                    }]}
                                    placeholder="Contraseña PPPoE"
                                    value={config.secretPppoe}
                                    onChangeText={(value) => handleChange('secretPppoe', value)}
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    secureTextEntry
                                />
                            </View>
                            
                            <View style={styles.perfilContainer}>
                                <View style={styles.perfilHeader}>
                                    <Icon name="settings" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={[styles.perfilLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        Perfil PPPoE
                                    </Text>
                                    {perfilesLoading && (
                                        <ActivityIndicator 
                                            size="small" 
                                            color={isDarkMode ? '#10B981' : '#059669'} 
                                            style={{ marginLeft: 8 }}
                                        />
                                    )}
                                </View>
                                
                                {perfilesLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color={isDarkMode ? '#10B981' : '#059669'} />
                                        <Text style={[styles.text, { marginTop: 12, textAlign: 'center', color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                            Cargando perfiles PPPoE...
                                        </Text>
                                    </View>
                                ) : (
                                    <SelectorPerfil
                                        label={null}
                                        placeholder="Seleccione un perfil PPPoE..."
                                        data={perfiles}
                                        selectedValue={config.perfilPppoe}
                                        onValueChange={(value) => handleChange('perfilPppoe', value)}
                                        isDarkMode={isDarkMode}
                                    />
                                )}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.disabledPppoeContainer}>
                            <Icon 
                                name="info" 
                                size={48} 
                                color={isDarkMode ? '#6B7280' : '#9CA3AF'} 
                            />
                            <Text style={[styles.disabledTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                PPPoE Desactivado
                            </Text>
                            <Text style={[styles.disabledText, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                                La conexión se configurará sin autenticación PPPoE
                            </Text>
                        </View>
                    )}
                </Card>

                {/* Speed Limits Card */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="speed" 
                            size={24} 
                            color={isDarkMode ? '#F59E0B' : '#D97706'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Límites de Velocidad
                        </Text>
                    </View>
                    
                    <View style={styles.speedLimitsContainer}>
                        <LimiteVelocidadForm
                            form={config}
                            handleChange={handleChange}
                        />
                    </View>
                </Card>

                {/* Notes Card */}
                <Card style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon 
                            name="note" 
                            size={24} 
                            color={isDarkMode ? '#8B5CF6' : '#7C3AED'} 
                        />
                        <Text style={[styles.title, { fontSize: 18, marginLeft: 12 }]}>
                            Notas Adicionales
                        </Text>
                    </View>
                    
                    <View style={styles.notesContainer}>
                        <TextInput
                            style={[styles.modernNotebox, { 
                                backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                                borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                                color: isDarkMode ? '#F9FAFB' : '#111827'
                            }]}
                            multiline
                            numberOfLines={4}
                            onChangeText={(text) => setNoteboxText(text)}
                            value={noteboxText}
                            placeholder="Ingrese notas adicionales sobre la configuración..."
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            textAlignVertical="top"
                        />
                    </View>
                </Card>

                {/* Save Button */}
                <View style={styles.saveButtonContainer}>
                    <TouchableOpacity 
                        style={[styles.modernSaveButton, { 
                            backgroundColor: guardandoConfig 
                                ? (isDarkMode ? '#374151' : '#E5E7EB')
                                : (isDarkMode ? '#10B981' : '#059669'),
                            borderColor: isDarkMode ? '#10B981' : '#047857'
                        }]}
                        onPress={handleSave}
                        disabled={guardandoConfig}
                        activeOpacity={0.8}
                    >
                        {guardandoConfig ? (
                            <>
                                <ActivityIndicator 
                                    size="small" 
                                    color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                                />
                                <Text style={[styles.saveButtonText, { 
                                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                    marginLeft: 8
                                }]}>
                                    Guardando...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Icon 
                                    name="save" 
                                    size={20} 
                                    color="#FFFFFF" 
                                />
                                <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>
                                    Guardar Configuración
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
                
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

export default ConfiguracionScreenPppoeVelocidad;
