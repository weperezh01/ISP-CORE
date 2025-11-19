import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../ThemeContext';
import ThemeSwitch from '../componentes/themeSwitch';
import { getStyles } from '../estilos/styles';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AsignacionServicioClienteScreen = ({ navigation, route }) => {
    const { serviceId, clientId, userId, ispId, clienteDireccion, clienteReferencia } = route.params || {};
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [tiposDeConexion, setTiposDeConexion] = useState([]);
    const [tipoConexion, setTipoConexion] = useState(null);
    const [showTipoConexionList, setShowTipoConexionList] = useState(false);
    const [modalServiciosVisible, setModalServiciosVisible] = useState(false);
    const [ciclosDeFacturacion, setCiclosDeFacturacion] = useState([]);
    const [cicloSeleccionado, setCicloSeleccionado] = useState(null);
    const [showCicloFacturacionList, setShowCicloFacturacionList] = useState(false);
    const [direccion, setDireccion] = useState('');
    const [referencia, setReferencia] = useState('');
    const clienteDireccionBase = clienteDireccion || '';
    const clienteReferenciaBase = clienteReferencia || '';
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

    const tieneDireccionCliente = !!clienteDireccionBase;

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
                    value: servicio.id_servicio,
                    nombre: servicio.nombre_servicio,
                    precio: servicio.precio_servicio,
                    descripcion: servicio.descripcion_servicio || '',
                    velocidad: servicio.velocidad_servicio || ''
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

    const handleUsarDireccionCliente = () => {
        if (clienteDireccionBase) {
            setDireccion(clienteDireccionBase);
        }
        if (clienteReferenciaBase) {
            setReferencia(prev => (prev && prev.trim() !== '' ? prev : clienteReferenciaBase));
        }
    };

    const registrarEventoAsignacion = async (idConexion, nombreServicio) => {
        try {
            const eventData = {
                id_conexion: idConexion,
                tipo_evento: 'Asignación de servicio',
                mensaje: `Servicio asignado: ${nombreServicio}`,
                id_usuario: usuarioId,
                nota: `Nueva conexión creada con el servicio ${nombreServicio}`
            };

            console.log('📝 Registrando evento de asignación:', eventData);

            const response = await axios.post('https://wellnet-rd.com:444/api/log-cortes/registrar', eventData);

            if (response.status === 200 || response.status === 201) {
                console.log('✅ Evento de asignación registrado exitosamente');
            } else {
                console.warn('⚠️ No se pudo registrar el evento de asignación');
            }
        } catch (error) {
            console.error('❌ Error al registrar el evento de asignación:', error);
            // No mostramos error al usuario para no interrumpir el flujo
        }
    };

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
                console.log('✅ Conexión creada exitosamente:', response.data);

                // Obtener el ID de la nueva conexión y el nombre del servicio
                const nuevaConexionId = response.data?.id_conexion || response.data?.insertId;
                const servicioSeleccionado = tiposDeConexion.find(item => item.value === tipoConexion);
                const nombreServicio = servicioSeleccionado?.label || 'Servicio desconocido';

                // Registrar el evento de asignación de servicio
                if (nuevaConexionId) {
                    await registrarEventoAsignacion(nuevaConexionId, nombreServicio);
                } else {
                    console.warn('⚠️ No se pudo obtener el ID de la nueva conexión para registrar el evento');
                }

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

    const registrarEventoCambioServicio = async (idConexion, servicioNuevo) => {
        try {
            const eventData = {
                id_conexion: idConexion,
                tipo_evento: 'Cambio de servicio',
                mensaje: `Servicio actualizado a: ${servicioNuevo}`,
                id_usuario: usuarioId,
                nota: `El servicio de esta conexión fue actualizado a ${servicioNuevo}`
            };

            console.log('📝 Registrando evento de cambio de servicio:', eventData);

            const response = await axios.post('https://wellnet-rd.com:444/api/log-cortes/registrar', eventData);

            if (response.status === 200 || response.status === 201) {
                console.log('✅ Evento de cambio de servicio registrado exitosamente');
            } else {
                console.warn('⚠️ No se pudo registrar el evento de cambio de servicio');
            }
        } catch (error) {
            console.error('❌ Error al registrar el evento de cambio de servicio:', error);
            // No mostramos error al usuario para no interrumpir el flujo
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
            // NO incluir id_usuario por ahora, causa error en el backend
            // El backend necesita ser actualizado para soportar este campo
        };

        console.log('📤 Enviando datos de actualización:', JSON.stringify(updateConnectionData, null, 2));
        console.log('📋 Usuario que realiza la acción:', usuarioId);

        try {
            const response = await axios.post('https://wellnet-rd.com:444/api/conexiones/editar-conexion-servicio', updateConnectionData);

            console.log('✅ Respuesta del servidor:', response.data);

            if (response.status === 200) {
                // Obtener los nombres de los servicios para el evento
                const servicioNuevoObj = tiposDeConexion.find(item => item.value === tipoConexion);
                const servicioNuevo = servicioNuevoObj?.label || 'Servicio desconocido';

                // Registrar el evento de cambio de servicio con el nombre del usuario
                // El backend registra automáticamente un evento "Sistema automático" que no queremos
                // Por eso registramos manualmente este evento con los datos correctos del usuario
                await registrarEventoCambioServicio(serviceId, servicioNuevo);

                console.log('✅ Conexión actualizada exitosamente');

                Alert.alert('Éxito', 'La conexión se ha actualizado correctamente.', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                console.error('❌ Error en la respuesta:', response.data);
                Alert.alert('Error', 'No se pudo actualizar la conexión.');
            }
        } catch (error) {
            console.error('❌ Error al actualizar la conexión:', error);
            console.error('❌ Detalles del error:', error.response?.data || error.message);

            // Mostrar más detalles del error si están disponibles
            const errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || 'No se pudo actualizar la conexión. Intente nuevamente.';

            Alert.alert('Error', errorMessage);
        }
    };

    const renderServiceItem = ({ item }) => {
        const isSelected = tipoConexion === item.value;

        return (
            <TouchableOpacity
                onPress={() => {
                    setTipoConexion(item.value);
                    setModalServiciosVisible(false);
                }}
                style={[
                    styles.modernServiceItem,
                    isSelected && styles.modernServiceItemSelected
                ]}
                activeOpacity={0.7}
            >
                {/* Icono de servicio */}
                <View style={[
                    styles.serviceIconContainer,
                    { backgroundColor: isSelected ? (isDarkMode ? '#3B82F6' : '#2563EB') : (isDarkMode ? '#374151' : '#F3F4F6') }
                ]}>
                    <Icon
                        name="wifi"
                        size={24}
                        color={isSelected ? '#FFFFFF' : (isDarkMode ? '#9CA3AF' : '#6B7280')}
                    />
                </View>

                {/* Información del servicio */}
                <View style={styles.serviceInfoContainer}>
                    <View style={styles.serviceHeaderRow}>
                        <Text style={[
                            styles.serviceName,
                            { color: isDarkMode ? '#F9FAFB' : '#111827' },
                            isSelected && { color: isDarkMode ? '#60A5FA' : '#2563EB', fontWeight: '700' }
                        ]}>
                            {item.nombre}
                        </Text>
                        {isSelected && (
                            <View style={[styles.selectedBadge, { backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB' }]}>
                                <Icon name="check" size={14} color="#FFFFFF" />
                                <Text style={styles.selectedBadgeText}>Seleccionado</Text>
                            </View>
                        )}
                    </View>

                    {item.descripcion && (
                        <Text style={[
                            styles.serviceDescription,
                            { color: isDarkMode ? '#9CA3AF' : '#6B7280' }
                        ]} numberOfLines={2}>
                            {item.descripcion}
                        </Text>
                    )}

                    <View style={styles.serviceFooterRow}>
                        {item.velocidad && (
                            <View style={styles.serviceMetaItem}>
                                <Icon name="speed" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <Text style={[styles.serviceMetaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    {item.velocidad} Mbps
                                </Text>
                            </View>
                        )}
                        <View style={[
                            styles.servicePriceBadge,
                            { backgroundColor: isSelected ? (isDarkMode ? '#10B981' : '#059669') : (isDarkMode ? '#374151' : '#E5E7EB') }
                        ]}>
                            <Text style={[
                                styles.servicePriceText,
                                { color: isSelected ? '#FFFFFF' : (isDarkMode ? '#F9FAFB' : '#111827') }
                            ]}>
                                {formatCurrency(item.precio)}/mes
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Indicador de selección (radio button) */}
                <Icon
                    name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                    size={24}
                    color={isSelected ? (isDarkMode ? '#60A5FA' : '#2563EB') : (isDarkMode ? '#4B5563' : '#D1D5DB')}
                />
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item, onPress }) => (
        <TouchableOpacity onPress={onPress} style={styles.dropdownItem}>
            <Text style={styles.dropdownItemText}>{item.label}</Text>
        </TouchableOpacity>
    );

    const renderContent = () => {
        const servicioSeleccionado = tipoConexion
            ? tiposDeConexion.find(item => item.value === tipoConexion)
            : null;
        const cicloSeleccionadoInfo = cicloSeleccionado
            ? ciclosDeFacturacion.find(item => item.value === cicloSeleccionado)
            : null;
        const submitDisabled = !tipoConexion || !cicloSeleccionado || direccion.trim() === '';

        return (
            <View style={styles.formWrapper}>
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Servicio</Text>
                        {servicioSeleccionado && (
                            <View style={styles.sectionBadge}>
                                <Text style={styles.sectionBadgeText}>ID {servicioSeleccionado.value}</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => setModalServiciosVisible(true)}
                        style={styles.selectorButton}
                    >
                        <View style={styles.selectorContent}>
                            <Text style={styles.selectorLabel}>Tipo de servicio</Text>
                            <Text style={styles.selectorValue}>
                                {servicioSeleccionado ? servicioSeleccionado.nombre : 'Selecciona el plan a asignar'}
                            </Text>
                        </View>
                        <Icon name="chevron-right" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                    <Text style={styles.sectionHelper}>Incluye la tarifa mensual y características del servicio seleccionado.</Text>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Ciclo de facturación</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowCicloFacturacionList(!showCicloFacturacionList)}
                        style={styles.selectorButton}
                    >
                        <View style={styles.selectorContent}>
                            <Text style={styles.selectorLabel}>Ciclo activo</Text>
                            <Text style={styles.selectorValue}>
                                {cicloSeleccionadoInfo ? cicloSeleccionadoInfo.label : 'Selecciona el ciclo al que pertenece'}
                            </Text>
                        </View>
                        <Text style={styles.selectorCaret}>{showCicloFacturacionList ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {showCicloFacturacionList && (
                        <View style={styles.dropdownList}>
                            <FlatList
                                data={ciclosDeFacturacion}
                                renderItem={({ item }) => renderItem({ item, onPress: () => handleCicloSeleccionado(item) })}
                                keyExtractor={(item) => item.value.toString()}
                                nestedScrollEnabled
                                scrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                                style={{ maxHeight: 250 }}
                            />
                        </View>
                    )}
                    <Text style={styles.sectionHelper}>El ciclo define cuándo se facturará este nuevo servicio.</Text>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Ubicación del servicio</Text>
                    </View>
                    {tieneDireccionCliente && (
                        <TouchableOpacity
                            style={[
                                styles.copyAddressButton,
                                { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }
                            ]}
                            onPress={() => {
                                handleUsarDireccionCliente();
                                Alert.alert(
                                    'Dirección copiada',
                                    'Se ha copiado la dirección del cliente a los campos de ubicación.',
                                    [{ text: 'OK' }]
                                );
                            }}
                            activeOpacity={0.7}
                        >
                            <Icon name="location-on" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                            <View style={styles.copyAddressContent}>
                                <Text style={[styles.copyAddressButtonText, { color: isDarkMode ? '#60A5FA' : '#2563EB' }]}>
                                    Usar dirección del cliente
                                </Text>
                                <Text style={[styles.copyAddressHint, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    {clienteDireccionBase.substring(0, 50)}{clienteDireccionBase.length > 50 ? '...' : ''}
                                </Text>
                            </View>
                            <Icon name="content-copy" size={18} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                        </TouchableOpacity>
                    )}
                    <TextInput
                        style={[styles.notebox, styles.inputLarge]}
                        onChangeText={handleChange(setDireccion)}
                        value={direccion}
                        placeholder="Ingresa la dirección del servicio"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    <Text style={styles.sectionHelper}>Puedes ajustar detalles como apartamento, referencias o puntos de instalación.</Text>
                    <TextInput
                        style={[styles.notebox, styles.inputLarge]}
                        onChangeText={handleChange(setReferencia)}
                        value={referencia}
                        placeholder="Referencia adicional (opcional)"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {!isEditMode && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Precio de instalación</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            onChangeText={handleChange(setPrecio)}
                            value={precio}
                            placeholder="Ingresa el monto acordado"
                            keyboardType="numeric"
                        />
                        <Text style={styles.sectionHelper}>Si no se cobrará instalación, deja el campo vacío.</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.primaryButton, submitDisabled && styles.primaryButtonDisabled]}
                    onPress={isEditMode ? handleUpdate : handleAddNew}
                    disabled={submitDisabled}
                >
                    <Text style={styles.primaryButtonText}>
                        {isEditMode ? 'Actualizar servicio' : 'Guardar nuevo servicio'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

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
                        contentContainerStyle={styles.formContentContainer}
                    />
                </KeyboardAvoidingView>
            )}

            {/* Modal de Selección de Servicios */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalServiciosVisible}
                onRequestClose={() => setModalServiciosVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
                        {/* Header del Modal */}
                        <View style={[styles.modalHeader, { borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                            <View style={styles.modalHeaderContent}>
                                <Icon name="dns" size={24} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                                <Text style={[styles.modalTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                    Seleccionar Servicio
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setModalServiciosVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            </TouchableOpacity>
                        </View>

                        {/* Contador de servicios */}
                        <View style={[styles.modalSubheader, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                            <Icon name="list" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text style={[styles.modalSubheaderText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                {tiposDeConexion.length} {tiposDeConexion.length === 1 ? 'servicio disponible' : 'servicios disponibles'}
                            </Text>
                        </View>

                        {/* Lista de servicios */}
                        <FlatList
                            data={tiposDeConexion}
                            renderItem={renderServiceItem}
                            keyExtractor={(item) => item.value.toString()}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={styles.modalList}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default AsignacionServicioClienteScreen;
