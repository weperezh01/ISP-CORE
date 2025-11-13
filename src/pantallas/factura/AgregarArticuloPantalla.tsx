import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { getStyles } from './AgregarArticuloStyles';
import ThemeSwitch from '../../componentes/themeSwitch';
import registrarEventoFactura from './Functions/RegistrarEventoFactura';


const AgregarArticuloPantalla = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id_factura, facturaData } = route.params;

    const [descripcion, setDescripcion] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [precioUnitario, setPrecioUnitario] = useState('');
    const [descuento, setDescuento] = useState('');
    const [codigo, setCodigo] = useState('');
    const [importe, setImporte] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [servicios, setServicios] = useState([]);
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [impuestos, setImpuestos] = useState({});
    const [impuestosCalculados, setImpuestosCalculados] = useState({});
    const [montoTotal, setMontoTotal] = useState(0);
    const [conexiones, setConexiones] = useState([]);
    const [conexionSeleccionada, setConexionSeleccionada] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [idUsuario, setIdUsuario] = useState(null);

    const styles = getStyles(isDarkMode);

    useEffect(() => {
        const fetchServiciosYConexiones = async () => {
            setIsLoading(true); // Activar indicador de carga
            try {
                // Tu lógica de carga...
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false); // Desactivar indicador de carga
            }
        };

        fetchServiciosYConexiones();
    }, []);



    useEffect(() => {
        const fetchServiciosYConexiones = async () => {
            setIsLoading(true);
            const id_isp = facturaData?.factura?.id_isp;
            const id_cliente = facturaData?.cliente?.id_cliente;

            const fechaActual = new Date();
            console.log('Fecha y Hora Actual:', fechaActual.toLocaleString());
            console.log('ID ISP:', id_isp);
            console.log('ID Cliente:', id_cliente);

            if (!id_isp || !id_cliente) {
                Alert.alert('Error', 'Datos de factura o cliente no disponibles.');
                setIsLoading(false);
                return;
            }

            try {
                const [serviciosRes, conexionesRes] = await Promise.all([
                    axios.get(`https://wellnet-rd.com/api/tiposervicio/${id_isp}`),
                    axios.get(`https://wellnet-rd.com/api/conexiones-cliente-articulo/${id_cliente}`)
                ]);

                console.log('Respuesta de servicios:', serviciosRes.data);
                console.log('Respuesta de conexiones:', conexionesRes.data);

                // Actualiza los servicios e impuestos
                setServicios(serviciosRes.data.servicios || []);
                setImpuestos(serviciosRes.data.impuestos || {});

                // Actualiza las conexiones
                setConexiones(conexionesRes.data.data || []);
            } catch (error) {
                console.error('Error al cargar servicios o conexiones:', error);
                Alert.alert('Error', 'No se pudieron cargar los servicios o conexiones. \n Revise si se ha registrado los impuestos.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchServiciosYConexiones();
    }, [facturaData]);



    // Calcular impuestos y monto total
    useEffect(() => {
        // Cálculo inicial del monto total basado en el importe
        let total = importe;

        // Solo calcula los impuestos si el cliente tiene RNC
        if (facturaData?.cliente?.rnc && Object.keys(impuestos).length > 0) {
            const calculados = {
                cdt: (importe * parseFloat(impuestos.cdt || 0)) / 100,
                impuestoSelectivo: (importe * parseFloat(impuestos.impuesto_selectivo || 0)) / 100,
                itbis: (importe * parseFloat(impuestos.itbis || 0)) / 100,
            };

            // Actualiza el monto total sumando los impuestos calculados
            total += calculados.cdt + calculados.impuestoSelectivo + calculados.itbis;

            // Guarda los impuestos calculados
            setImpuestosCalculados(calculados);
        } else {
            // Si no hay RNC, los impuestos no se calculan y el monto total solo incluye el importe
            setImpuestosCalculados({});
        }

        // Actualiza el monto total
        setMontoTotal(total);
    }, [importe, impuestos, facturaData]);



    useEffect(() => {
        const cantidadNum = parseFloat(cantidad) || 0;
        const precioNum = parseFloat(precioUnitario) || 0;
        const descuentoNum = parseFloat(descuento) || 0;

        const total = cantidadNum * precioNum - descuentoNum;
        setImporte(total > 0 ? total : 0);
    }, [cantidad, precioUnitario, descuento]);

    // Imprimir parámetros en la consola al cargar el componente
    useEffect(() => {
        console.log('Parámetros recibidos:', JSON.stringify({ id_factura, facturaData }, null, 2));
    }, [id_factura, facturaData]);

    // Calcular el importe automáticamente
    useEffect(() => {
        const cantidadNum = parseFloat(cantidad) || 0;
        const precioNum = parseFloat(precioUnitario) || 0;
        const descuentoNum = parseFloat(descuento) || 0;

        const total = (cantidadNum * precioNum) - descuentoNum;
        setImporte(total > 0 ? total : 0);
    }, [cantidad, precioUnitario, descuento]);

    // Cargar el tema inicial
    useEffect(() => {
        const loadTheme = async () => {
            const theme = await AsyncStorage.getItem('@theme');
            setIsDarkMode(theme === 'dark');
        };
        loadTheme();
    }, []);

    // Cargar ID de usuario
    useEffect(() => {
        const loadUserId = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
                if (userData && userData.id) {
                    setIdUsuario(userData.id);
                    console.log('🔍 [AgregarArticulo] ID Usuario cargado:', userData.id);
                } else {
                    console.warn('⚠️ [AgregarArticulo] No se encontró ID de usuario en AsyncStorage');
                }
            } catch (error) {
                console.error('❌ [AgregarArticulo] Error al cargar el ID de usuario:', error);
            }
        };
        loadUserId();
    }, []);

    // Función para manejar la solicitud al backend
    const agregarArticulo = async () => {
        if (!id_factura || !descripcion || !cantidad || !precioUnitario) {
            Alert.alert('Error', 'Por favor, complete todos los campos obligatorios.');
            return;
        }

        Alert.alert(
            'Confirmación',
            '¿Está seguro de que desea agregar este artículo?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                    onPress: () => console.log('Operación cancelada'),
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        // Crear el objeto del artículo en el formato esperado
                        const nuevoArticulo = {
                            id_factura,
                            id_cliente: facturaData?.cliente?.id_cliente,
                            id_isp: facturaData?.factura?.id_isp,
                            id_producto_servicio: servicioSeleccionado || null,
                            id_conexion: conexionSeleccionada || null, // Incluir la conexión seleccionada
                            descripcion,
                            cantidad_articulo: parseFloat(cantidad),
                            precio_unitario: parseFloat(precioUnitario),
                            descuentoArticulo: parseFloat(descuento) || 0,
                            itbis_monto: parseFloat(impuestosCalculados?.itbis) || 0,
                            impuesto_selectivo_monto: parseFloat(impuestosCalculados?.impuestoSelectivo) || 0,
                            cdt_monto: parseFloat(impuestosCalculados?.cdt) || 0,
                            total: parseFloat(montoTotal) || 0,
                        };

                        try {
                            // Enviar los datos al backend
                            const response = await axios.post(
                                'https://wellnet-rd.com/api/agregar-articulo',
                                { articulos: [nuevoArticulo] } // Enviar como array en la clave `articulos`
                            );

                            if (response.status === 200 || response.status === 201) {
                                // Registrar evento de artículo agregado
                                console.log('🔍 [AgregarArticulo] Artículo agregado exitosamente. idUsuario:', idUsuario);
                                if (idUsuario) {
                                    console.log('✅ [AgregarArticulo] Llamando a registrarEventoFactura...');
                                    await registrarEventoFactura(
                                        id_factura,
                                        idUsuario,
                                        'Artículo agregado',
                                        `Artículo "${descripcion}" agregado: ${cantidad} x ${formatMoney(parseFloat(precioUnitario))} = ${formatMoney(montoTotal)}`,
                                        JSON.stringify({
                                            id_producto_servicio: servicioSeleccionado,
                                            id_conexion: conexionSeleccionada,
                                            descripcion,
                                            cantidad: parseFloat(cantidad),
                                            precio_unitario: parseFloat(precioUnitario),
                                            descuento: parseFloat(descuento) || 0,
                                            total: parseFloat(montoTotal)
                                        })
                                    );
                                } else {
                                    console.warn('⚠️ [AgregarArticulo] No se puede registrar evento: idUsuario es null');
                                }

                                Alert.alert('Éxito', 'Artículo agregado correctamente.', [
                                    {
                                        text: 'Aceptar',
                                        onPress: () => {
                                            // Resetear los campos después de agregar
                                            setDescripcion('');
                                            setCantidad('');
                                            setPrecioUnitario('');
                                            setServicioSeleccionado('');
                                            setConexionSeleccionada(''); // Resetear conexión seleccionada
                                            setDescuento('');

                                            // Navegar a la pantalla anterior
                                            navigation.goBack();
                                        },
                                    },
                                ]);
                            } else {
                                Alert.alert('Error', 'Hubo un problema al agregar el artículo.');
                            }
                        } catch (error) {
                            console.error('Error al agregar artículo:', error);
                            Alert.alert('Error', 'No se pudo agregar el artículo. Inténtelo más tarde.');
                        }
                    },
                },
            ],
            { cancelable: false } // Evita cerrar la alerta tocando fuera de ella
        );
    };



    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        await AsyncStorage.setItem('@theme', newMode ? 'dark' : 'light');
        Alert.alert('Modo actualizado', newMode ? 'Modo oscuro activado' : 'Modo claro activado');
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#2563EB'} />
                <Text style={styles.loadingText}>Cargando servicios y conexiones...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>➕ Agregar Artículo</Text>
                        <Text style={styles.headerSubtitle}>
                            Factura #{id_factura}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            <View style={styles.contentContainer}>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* Invoice Information Card */}
                    <View style={styles.cardStyle}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>📋 Información de la Factura</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.invoiceInfoContainer}>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIcon}>
                                        <Text>🆔</Text>
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>ID Factura</Text>
                                        <Text style={styles.infoValue}>{id_factura}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIcon}>
                                        <Text>👤</Text>
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Cliente</Text>
                                        <Text style={styles.infoValue}>
                                            {facturaData?.cliente?.nombres || ''} {facturaData?.cliente?.apellidos || ''}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Article Form Card */}
                    <View style={styles.cardStyle}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>📝 Datos del Artículo</Text>
                        </View>
                        <View style={styles.cardContent}>

                            {/* Código */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Código (Opcional)</Text>
                                <View style={[
                                    styles.inputWrapper,
                                    focusedInput === 'codigo' && styles.inputWrapperFocused
                                ]}>
                                    <Icon 
                                        name="barcode" 
                                        size={20} 
                                        color={isDarkMode ? '#bbb' : '#555'} 
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={codigo}
                                        onChangeText={setCodigo}
                                        onFocus={() => setFocusedInput('codigo')}
                                        onBlur={() => setFocusedInput(null)}
                                        placeholder="Ingrese el código del artículo"
                                        placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                                    />
                                </View>
                            </View>

                            {/* Conexión */}
                            <View style={styles.pickerContainer}>
                                <Text style={styles.pickerLabel}>Conexión</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={conexionSeleccionada}
                                        onValueChange={(itemValue) => setConexionSeleccionada(itemValue)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Seleccionar una conexión" value="" />
                                        {Array.isArray(conexiones) &&
                                            conexiones.map((conexion) => (
                                                <Picker.Item
                                                    key={conexion.id_conexion}
                                                    label={`ID: ${conexion.id_conexion} - ${conexion.direccion || 'Sin dirección'} (${conexion.estado})`}
                                                    value={conexion.id_conexion}
                                                />
                                            ))}
                                    </Picker>
                                </View>
                                <Text style={styles.helperText}>Seleccione la conexión asociada al servicio</Text>
                            </View>



                            {/* Servicio */}
                            <View style={styles.pickerContainer}>
                                <Text style={styles.pickerLabel}>Tipo de Servicio</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={servicioSeleccionado}
                                        onValueChange={(itemValue) => {
                                            setServicioSeleccionado(itemValue);
                                            const servicio = servicios.find((s) => s.id_servicio === itemValue);
                                            if (servicio) {
                                                setDescripcion(servicio.descripcion_servicio);
                                                setPrecioUnitario(servicio.precio_servicio.toString());
                                            }
                                        }}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Seleccionar un servicio" value="" />
                                        {Array.isArray(servicios) && servicios.map((servicio) => (
                                            <Picker.Item
                                                key={servicio.id_servicio}
                                                label={`${servicio.nombre_servicio} - ${formatMoney(servicio.precio_servicio)}`}
                                                value={servicio.id_servicio}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                                <Text style={styles.helperText}>Los datos se completarán automáticamente</Text>
                            </View>


                            {/* Descripción */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Descripción *</Text>
                                <View style={[
                                    styles.inputWrapper,
                                    focusedInput === 'descripcion' && styles.inputWrapperFocused
                                ]}>
                                    <Icon 
                                        name="file-document-outline" 
                                        size={20} 
                                        color={isDarkMode ? '#bbb' : '#555'} 
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={descripcion}
                                        onChangeText={setDescripcion}
                                        onFocus={() => setFocusedInput('descripcion')}
                                        onBlur={() => setFocusedInput(null)}
                                        placeholder="Descripción del artículo o servicio"
                                        placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                                        multiline
                                        numberOfLines={2}
                                    />
                                </View>
                            </View>

                            {/* Cantidad */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Cantidad *</Text>
                                <View style={[
                                    styles.inputWrapper,
                                    focusedInput === 'cantidad' && styles.inputWrapperFocused
                                ]}>
                                    <Icon 
                                        name="numeric" 
                                        size={20} 
                                        color={isDarkMode ? '#bbb' : '#555'} 
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={cantidad}
                                        onChangeText={setCantidad}
                                        onFocus={() => setFocusedInput('cantidad')}
                                        onBlur={() => setFocusedInput(null)}
                                        placeholder="Ingrese la cantidad"
                                        keyboardType="numeric"
                                        placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                                        selectTextOnFocus={true}
                                    />
                                </View>
                            </View>

                            {/* Precio Unitario */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Precio Unitario *</Text>
                                <View style={[
                                    styles.inputWrapper,
                                    focusedInput === 'precio' && styles.inputWrapperFocused
                                ]}>
                                    <Icon 
                                        name="currency-usd" 
                                        size={20} 
                                        color={isDarkMode ? '#bbb' : '#555'} 
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={precioUnitario}
                                        onChangeText={setPrecioUnitario}
                                        onFocus={() => setFocusedInput('precio')}
                                        onBlur={() => setFocusedInput(null)}
                                        placeholder="Precio por unidad"
                                        keyboardType="numeric"
                                        placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                                        selectTextOnFocus={true}
                                    />
                                </View>
                            </View>

                            {/* Descuento */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Descuento (Opcional)</Text>
                                <View style={[
                                    styles.inputWrapper,
                                    focusedInput === 'descuento' && styles.inputWrapperFocused
                                ]}>
                                    <Icon 
                                        name="tag-outline" 
                                        size={20} 
                                        color={isDarkMode ? '#bbb' : '#555'} 
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={descuento}
                                        onChangeText={setDescuento}
                                        onFocus={() => setFocusedInput('descuento')}
                                        onBlur={() => setFocusedInput(null)}
                                        placeholder="Monto del descuento"
                                        keyboardType="numeric"
                                        placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                                        selectTextOnFocus={true}
                                    />
                                </View>
                                <Text style={styles.helperText}>Descuento aplicado al artículo</Text>
                            </View>

                        </View>
                    </View>

                    {/* Summary Card */}
                    <View style={styles.cardStyle}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>💰 Resumen de Cálculos</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.summaryContainer}>
                                <Text style={styles.summaryTitle}>Desglose de Montos</Text>
                                
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Importe:</Text>
                                    <Text style={styles.summaryValue}>{formatMoney(importe)}</Text>
                                </View>

                                {impuestosCalculados.cdt > 0 && (
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>CDT:</Text>
                                        <Text style={styles.summaryValue}>
                                            {formatMoney(impuestosCalculados.cdt || 0)}
                                        </Text>
                                    </View>
                                )}

                                {impuestosCalculados.impuestoSelectivo > 0 && (
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Impuesto Selectivo:</Text>
                                        <Text style={styles.summaryValue}>
                                            {formatMoney(impuestosCalculados.impuestoSelectivo || 0)}
                                        </Text>
                                    </View>
                                )}

                                {impuestosCalculados.itbis > 0 && (
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>ITBIS:</Text>
                                        <Text style={styles.summaryValue}>
                                            {formatMoney(impuestosCalculados.itbis || 0)}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.finalTotalRow}>
                                    <Text style={styles.finalTotalLabel}>💸 Total:</Text>
                                    <Text style={styles.finalTotalValue}>
                                        {formatMoney(montoTotal)}
                                    </Text>
                                </View>
                                
                                {!facturaData?.cliente?.rnc && (
                                    <Text style={styles.helperText}>
                                        ℹ️ Los impuestos no se aplican porque el cliente no tiene RNC registrado
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>❌ Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.button, styles.addButton]}
                    onPress={agregarArticulo}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>✅ Agregar Artículo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AgregarArticuloPantalla;
