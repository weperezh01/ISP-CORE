import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../ThemeContext';
import ThemeSwitch from '../componentes/themeSwitch';
import { getStyles } from '../estilos/styles';
import axios from 'axios';

const AsignacionServicioClienteScreen = ({ navigation, route }) => {
    const { serviceId, clientId, userId, ispId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [tiposDeConexion, setTiposDeConexion] = useState([]);
    const [tipoConexion, setTipoConexion] = useState(null);
    const [showTipoConexionList, setShowTipoConexionList] = useState(false);
    const [ciclosDeFacturacion, setCiclosDeFacturacion] = useState([]);
    const [cicloSeleccionado, setCicloSeleccionado] = useState(null);
    const [showCicloFacturacionList, setShowCicloFacturacionList] = useState(false);
    const [direccion, setDireccion] = useState('');
    const [referencia, setReferencia] = useState('');
    const [precio, setPrecio] = useState('');
    const isEditMode = route.params?.isEditMode || false;
    const [usuarioId, setUsuarioId] = useState('');
    const pageTitle = isEditMode ? "Cambiar Servicio" : "Asignar Nuevo Servicio";
    const [isLoading, setIsLoading] = useState(false);
    console.log('AsignacionServicioClienteScreen');
    console.log('route.params', route.params);

    const formatCurrency = (amount) => {
        const formatter = new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        });
        return formatter.format(amount);
    };

    useEffect(() => {
        const registrarNavegacion = async () => {
            try {
                const fechaActual = new Date();
                const fecha = fechaActual.toISOString().split('T')[0];
                const hora = fechaActual.toTimeString().split(' ')[0];
                const pantalla = pageTitle;

                const datos = JSON.stringify({
                    serviceId,
                    clientId,
                    tipoConexion,
                    cicloSeleccionado,
                    direccion,
                    referencia,
                    precio
                });

                const navigationLogData = {
                    id_usuario: usuarioId,
                    fecha,
                    hora,
                    pantalla,
                    datos
                };

                await axios.post('https://wellnet-rd.com:444/api/log-navegacion-registrar', navigationLogData);
                console.log('Navegación registrada exitosamente');
            } catch (error) {
                console.error('Error al registrar la navegación:', error);
            }
        };

        registrarNavegacion();
    }, [isEditMode, serviceId, clientId, usuarioId, ispId, pageTitle, tipoConexion, cicloSeleccionado, direccion, referencia, precio]);

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                if (jsonValue) {
                    const userData = JSON.parse(jsonValue);
                    setNombreUsuario(userData.nombre);
                    setUsuarioId(userData.id);
                }
            } catch (e) {
                console.error('Error al leer el nombre del usuario', e);
            }
        };

        fetchUserName();
    }, []);

    const fetchTiposDeConexion = async () => {
        try {
            const response = await axios.post('https://wellnet-rd.com:444/api/lista-servicios', { isp_id: ispId });

            // Ajustar a la respuesta real
            if (response.data && Array.isArray(response.data.servicios)) {
                const itemsDeConexion = response.data.servicios.map(servicio => ({
                    label: `${servicio.nombre_servicio} - ${formatCurrency(servicio.precio_servicio)} Mensual`,
                    value: servicio.id_servicio
                }));

                setTiposDeConexion(itemsDeConexion);

                // Si no es modo edición, preseleccionamos el primer servicio
                if (!isEditMode && itemsDeConexion.length > 0) {
                    setTipoConexion(itemsDeConexion[0].value);
                }
            } else {
                console.warn('La respuesta de tipos de conexión no es un arreglo', response.data);
                Alert.alert('Error', 'No se pudieron cargar los tipos de conexión.');
            }
        } catch (error) {
            console.error('Error al cargar los tipos de conexión:', error);
            Alert.alert('Error', 'No se pudieron cargar los tipos de conexión. Intente nuevamente.');
        }
    };


    const fetchCiclosDeFacturacion = async () => {
        try {
            const response = await axios.post('https://wellnet-rd.com:444/api/ciclos-base/por-isp', { ispId: ispId });
            if (Array.isArray(response.data)) {
                const opcionesDeCiclos = response.data.map(ciclo => ({
                    label: `Día ${ciclo.dia_mes} - Ciclo ${ciclo.detalle}`,
                    value: ciclo.id_ciclo_base
                }));
                setCiclosDeFacturacion(opcionesDeCiclos);
                if (!isEditMode && opcionesDeCiclos.length > 0) {
                    setCicloSeleccionado(opcionesDeCiclos[0].value);
                }
            } else {
                console.warn('La respuesta de ciclos de facturación no es un arreglo', response.data);
                Alert.alert('Error', 'No se pudieron cargar los ciclos de facturación.');
            }
        } catch (error) {
            console.error('Error al cargar los ciclos de facturación', error);
            Alert.alert('Error', 'No se pudieron cargar los ciclos de facturación. Intente nuevamente.');
        }
    };

    const fetchConnectionDetails = async () => {
        if (!isEditMode) return;
        try {
            const response = await axios.post('https://wellnet-rd.com:444/api/conexiones-id', {
                id_conexion: serviceId,
                id_cliente: clientId,
                id_isp: ispId
            });
            if (Array.isArray(response.data) && response.data.length > 0) {
                const connectionDetails = response.data[0];
                setDireccion(connectionDetails.direccion);
                setReferencia(connectionDetails.referencia);
                setPrecio(connectionDetails.precio);
                setTipoConexion(connectionDetails.id_servicio);
                setCicloSeleccionado(connectionDetails.id_ciclo_base);
            } else {
                console.warn('No se encontraron detalles de la conexión o el formato no es el esperado.');
            }
        } catch (error) {
            console.error('Error al obtener los detalles de la conexión:', error);
            Alert.alert('Error', 'No se pudo cargar la información de la conexión. Intente nuevamente.');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchTiposDeConexion();
            await fetchCiclosDeFacturacion();
            if (isEditMode) {
                await fetchConnectionDetails();
            }
            setIsLoading(false);
        };
        loadData();
    }, [isEditMode, ispId, serviceId, clientId]);

    const handleTipoConexionSelect = (item) => {
        setTipoConexion(item.value);
        setShowTipoConexionList(false);
    };

    const handleCicloSeleccionado = (item) => {
        setCicloSeleccionado(item.value);
        setShowCicloFacturacionList(false);
    };

    const handleChange = (setter) => (text) => setter(text);

    const handleAddNew = async () => {
        const newConnectionData = {
            id_isp: ispId,
            id_cliente: clientId,
            id_servicio: tipoConexion,
            id_ciclo_base: cicloSeleccionado,
            direccion,
            referencia,
            precio,
        };

        try {
            const response = await axios.post('https://wellnet-rd.com:444/api/conexiones/agregar', newConnectionData);

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Éxito', 'La nueva conexión se ha agregado correctamente.', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Error', 'No se pudo agregar la nueva conexión.');
            }
        } catch (error) {
            console.error('Error al agregar la nueva conexión:', error);
            Alert.alert('Error', 'No se pudo agregar la nueva conexión. Intente nuevamente.');
        }
    };

    const handleUpdate = async () => {
        const updateConnectionData = {
            id_conexion: serviceId,
            id_isp: ispId,
            id_cliente: clientId,
            id_servicio: tipoConexion,
            id_ciclo_base: cicloSeleccionado,
            direccion,
            referencia,
            precio,
        };

        try {
            const response = await axios.post('https://wellnet-rd.com:444/api/conexiones/editar-conexion-servicio', updateConnectionData);

            if (response.status === 200) {
                Alert.alert('Éxito', 'La conexión se ha actualizado correctamente.', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Error', 'No se pudo actualizar la conexión.');
            }
        } catch (error) {
            console.error('Error al actualizar la conexión:', error);
            Alert.alert('Error', 'No se pudo actualizar la conexión. Intente nuevamente.');
        }
    };

    const renderItem = ({ item, onPress }) => (
        <TouchableOpacity onPress={onPress} style={styles.item}>
            <Text style={styles.text}>{item.label}</Text>
        </TouchableOpacity>
    );

    const renderContent = () => (
        <>
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Tipo de Servicio</Text>
                <TouchableOpacity onPress={() => setShowTipoConexionList(!showTipoConexionList)} style={styles.inputTouchable}>
                    <Text style={styles.inputText}>
                        {tipoConexion
                            ? tiposDeConexion.find(item => item.value === tipoConexion)?.label
                            : 'Seleccione el servicio'}
                    </Text>
                </TouchableOpacity>
                {showTipoConexionList && (
                    <FlatList
                        data={tiposDeConexion}
                        renderItem={({ item }) => renderItem({ item, onPress: () => handleTipoConexionSelect(item) })}
                        keyExtractor={(item) => item.value.toString()}
                        style={styles.flatList}
                    />
                )}
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Ciclo de Facturación</Text>
                <TouchableOpacity onPress={() => setShowCicloFacturacionList(!showCicloFacturacionList)} style={styles.inputTouchable}>
                    <Text style={styles.inputText}>
                        {cicloSeleccionado
                            ? ciclosDeFacturacion.find(item => item.value === cicloSeleccionado)?.label
                            : 'Seleccione el ciclo de facturación'}
                    </Text>
                </TouchableOpacity>
                {showCicloFacturacionList && (
                    <FlatList
                        data={ciclosDeFacturacion}
                        renderItem={({ item }) => renderItem({ item, onPress: () => handleCicloSeleccionado(item) })}
                        keyExtractor={(item) => item.value.toString()}
                        style={styles.flatList}
                    />
                )}
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                    style={styles.notebox}
                    onChangeText={handleChange(setDireccion)}
                    value={direccion}
                    placeholder="Ingrese dirección"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Referencia</Text>
                <TextInput
                    style={styles.notebox}
                    onChangeText={handleChange(setReferencia)}
                    value={referencia}
                    placeholder="Ingrese referencia"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            {!isEditMode && (
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Precio de la instalación</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={handleChange(setPrecio)}
                        value={precio}
                        placeholder="Ingrese precio"
                        keyboardType="numeric"
                    />
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={isEditMode ? handleUpdate : handleAddNew}>
                <Text style={styles.buttonText}>{isEditMode ? 'Actualizar Conexión' : 'Guardar Conexión'}</Text>
            </TouchableOpacity>
        </>
    );

    return (
        <>
            <View style={styles.containerSuperior}>
                <TouchableOpacity style={styles.buttonText} >
                    <Text style={styles.buttonText}>{nombreUsuario}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.containerSuperior}>
                <TouchableOpacity style={styles.buttonText} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{pageTitle}</Text>
                <ThemeSwitch />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} style={{ marginTop: 20 }} />
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.flexContainer}
                    keyboardVerticalOffset={100}
                >
                    <FlatList
                        data={[{ key: 'content' }]}
                        renderItem={renderContent}
                        keyExtractor={(item) => item.key}
                        contentContainerStyle={styles.contentContainer}
                    />
                </KeyboardAvoidingView>
            )}
        </>
    );
};

export default AsignacionServicioClienteScreen;
