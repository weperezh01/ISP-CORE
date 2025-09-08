import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../ThemeContext';
import ThemeSwitch from '../componentes/themeSwitch';
import { getStyles } from '../estilos/styles';
import { useFocusEffect } from '@react-navigation/native';

const AddServiceScreen = ({ navigation, route }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [nombreServicio, setNombreServicio] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [usuarioId, setUsuarioId] = useState('');
    const { ispId, serviceId, idCliente, id_usuario, isEditMode } = route.params;
    const [velocidad, setVelocidad] = useState('');
    const [loading, setLoading] = useState(false);

    const screenTitle = isEditMode ? 'Editar Servicio' : 'Crear nuevo Servicio';
    const actionButtonTitle = isEditMode ? 'Actualizar Servicio' : 'Guardar Servicio';

    console.log('ℹ️ Datos recibidos en la pantalla:', route.params);

    useEffect(() => {
        const cargarPantalla = async () => {
            await obtenerDatosUsuario();
            if (route.params?.isEditMode && route.params?.serviceId) {
                await fetchServiceData(route.params.serviceId);
            }
        };
        cargarPantalla();
    }, [route.params?.isEditMode, route.params?.serviceId]);

    const obtenerDatosUsuario = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
            if (userData) {
                setNombreUsuario(userData.nombre);
                setUsuarioId(userData.id);
            }
        } catch (e) {
            console.error('Error al leer los datos del usuario', e);
        }
    };

    const fetchServiceData = async (serviceId) => {
        setLoading(true);
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/servicio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_servicio: serviceId, id_isp: ispId, id_cliente: idCliente }),
            });
    
            const data = await response.json();
            console.log('Datos recibidos del servidor:', data);
    
            if (response.ok && data) {
                // Asignar valores recuperados del backend a los campos del formulario
                setNombreServicio(data.nombre_servicio || '');
                setDescripcion(data.descripcion_servicio || '');
                setPrecio(
                    data.precio_servicio !== null && data.precio_servicio !== undefined
                        ? parseFloat(data.precio_servicio).toString()
                        : '0'
                );
                setVelocidad(
                    data.velocidad_servicio !== null && data.velocidad_servicio !== undefined
                        ? parseFloat(data.velocidad_servicio).toString()
                        : '0'
                );
            } else {
                Alert.alert('Error', 'No se encontraron datos para el servicio proporcionado.');
            }
        } catch (error) {
            console.error('Error al cargar los datos del servicio:', error);
            Alert.alert('Error', 'No se pudo comunicar con el servidor.');
        } finally {
            setLoading(false);
        }
    };
    
    
    


    const registrarNavegacion = async () => {
        if (!usuarioId) return;

        try {
            const fechaActual = new Date();
            const fecha = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const hora = fechaActual.toTimeString().split(' ')[0]; // Formato HH:mm:ss

            const logData = {
                id_usuario: usuarioId,
                fecha,
                hora,
                pantalla: isEditMode ? 'EditarServicio' : 'AgregarServicio',
                datos: JSON.stringify({
                    isDarkMode,
                    nombreServicio,
                    descripcion,
                    precio,
                    velocidad,
                }),
            };

            const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData),
            });

            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(responseData.message || 'Error al registrar la navegación');
            }
            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            registrarNavegacion();
            return () => { };
        }, [usuarioId, nombreServicio, descripcion, precio, velocidad])
    );


    const handleSaveOrUpdateService = async () => {
        if (!nombreServicio.trim()) {
            Alert.alert('Error', 'El nombre del servicio es obligatorio.');
            return;
        }
        if (!precio.trim()) {
            Alert.alert('Error', 'El precio del servicio es obligatorio.');
            return;
        }
    
        // Mostrar alerta de confirmación antes de guardar o actualizar
        Alert.alert(
            'Confirmación',
            isEditMode
                ? '¿Estás seguro de que deseas actualizar este servicio?'
                : '¿Estás seguro de que deseas guardar este nuevo servicio?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel', // Acción de cancelar
                },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        // Ejecutar la lógica de guardar o actualizar el servicio
                        console.log('🚀 Valores antes de enviar:');
                        console.log('ispId:', ispId);
                        console.log('usuarioId:', usuarioId);
                        console.log('nombreServicio:', nombreServicio);
                        console.log('descripcion:', descripcion);
                        console.log('precio:', precio);
                        console.log('velocidad:', velocidad);
    
                        const url = isEditMode
                            ? 'https://wellnet-rd.com:444/api/actualizar-servicio'
                            : 'https://wellnet-rd.com:444/api/insertar-servicio';
                        const method = 'POST';
    
                        const servicioData = isEditMode
                            ? {
                                  id_servicio: serviceId,
                                  nombre_servicio: nombreServicio.trim(),
                                  descripcion_servicio: descripcion.trim() || null,
                                  precio_servicio: parseFloat(precio),
                                  velocidad_servicio: velocidad ? parseFloat(velocidad) : null,
                              }
                            : {
                                  id_isp: typeof ispId === 'object' ? ispId.id_isp : ispId,
                                  id_usuario: usuarioId,
                                  nombre_servicio: nombreServicio.trim(),
                                  descripcion_servicio: descripcion.trim() || null,
                                  precio_servicio: parseFloat(precio),
                                  velocidad_servicio: velocidad ? parseFloat(velocidad) : null,
                              };
    
                        console.log('🔷 Datos enviados al servidor:', JSON.stringify(servicioData, null, 2));
    
                        try {
                            const response = await fetch(url, {
                                method,
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(servicioData),
                            });
    
                            if (response.ok) {
                                const successMessage = isEditMode
                                    ? 'Servicio actualizado con éxito.'
                                    : 'Servicio guardado con éxito.';
                                // Alert.alert('Éxito', successMessage);
                                navigation.goBack();
                            } else {
                                const errorData = await response.json();
                                console.error('❌ Error en el servidor:', errorData);
                                throw new Error(errorData.error || 'Error desconocido al guardar el servicio.');
                            }
                        } catch (error) {
                            console.error('❌ Error al guardar o actualizar el servicio:', error.message);
                            Alert.alert('Error', error.message || 'No se pudo completar la acción.');
                        }
                    },
                },
            ]
        );
    };
    




    return (
        loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
        ) : (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.containerSuperior}>
                        <TouchableOpacity style={styles.buttonText} onPress={() => { }}>
                            <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>{screenTitle}</Text>
                        <ThemeSwitch />
                    </View>
                    <View style={styles.container}>
                        <Text style={styles.label}>Nombre del Servicio</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre del Servicio"
                            value={nombreServicio}
                            onChangeText={setNombreServicio}
                        />
                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Descripción del Servicio"
                            value={descripcion}
                            onChangeText={setDescripcion}
                        />
                        <Text style={styles.label}>Precio</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Precio"
                            keyboardType="numeric"
                            value={precio}
                            onChangeText={setPrecio}
                        />
                        <Text style={styles.label}>Velocidad</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Velocidad (Mbps)"
                            keyboardType="numeric"
                            value={velocidad}
                            onChangeText={setVelocidad}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleSaveOrUpdateService}>
                            <Text style={styles.buttonText}>{actionButtonTitle}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    );
};

export default AddServiceScreen;
