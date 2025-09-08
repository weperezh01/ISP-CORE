import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../ThemeContext';
import ThemeSwitch from '../componentes/themeSwitch';
import { getStyles } from '../estilos/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import GetLocation from 'react-native-get-location';
import { getAddClientStyles } from './AddClienteStyles';
import OneLocationSelector from '../componentes/OneLocationSelector';

const AddClientScreen = ({ navigation, route }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);
    const ui = getAddClientStyles(isDarkMode);

    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [telefono1, setTelefono1] = useState('');
    const [telefono2, setTelefono2] = useState('');
    const [direccion, setDireccion] = useState('');
    // Dirección (ONE)
    const [provincia, setProvincia] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [distritoMunicipal, setDistritoMunicipal] = useState('');
    const [seccion, setSeccion] = useState('');
    const [paraje, setParaje] = useState('');
    const [sectorBarrio, setSectorBarrio] = useState('');
    const [calle, setCalle] = useState('');
    const [numero, setNumero] = useState('');
    const [edificio, setEdificio] = useState('');
    const [apartamento, setApartamento] = useState('');
    const [codigoPostal, setCodigoPostal] = useState('');
    const [referenciaExacta, setReferenciaExacta] = useState('');
    // Coordenadas
    const [latitud, setLatitud] = useState('');
    const [longitud, setLongitud] = useState('');
    // ONE modal
    const [oneModalVisible, setOneModalVisible] = useState(false);
    const [rnc, setRnc] = useState('');
    const [isPersonaJuridica, setIsPersonaJuridica] = useState(false);
    const [razonSocial, setRazonSocial] = useState('');
    const [correoElect, setCorreoElect] = useState('');
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [usuarioId, setUsuarioId] = useState('');
    const [clienteId, setClienteId] = useState(null);
    const [cedula, setCedula] = useState('');
    const [pasaporte, setPasaporte] = useState('');
    const [referencia, setReferencia] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const cargarPantalla = async () => {
            await obtenerDatosUsuario();
            await cargarDatosCliente();
            setTimeout(() => {
                registrarNavegacion();
            }, 3000);
        };

        cargarPantalla();
    }, []);

    // Recuperar datos del usuario
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

    // Obtener el `id_isp` almacenado
    const getStoredIspId = async () => {
        try {
            const ispId = await AsyncStorage.getItem('@selectedIspId');
            if (!ispId) {
                Alert.alert('Error', 'No se ha seleccionado un ISP.');
                return null;
            }
            console.log('ISP ID recuperado:', ispId);
            return ispId;
        } catch (e) {
            console.error('Error al recuperar el ISP ID:', e);
            return null;
        }
    };

    // Cargar datos del cliente (en modo edición)
    const cargarDatosCliente = async () => {
        if (route.params?.clienteId) {
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/cliente', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_cliente: route.params.clienteId }),
                });
                const cliente = await response.json();
                if (cliente) {
                    setNombres(cliente.nombres);
                    setApellidos(cliente.apellidos);
                    setTelefono1(cliente.telefono1);
                    setTelefono2(cliente.telefono2);
                    setDireccion(cliente.direccion);
                    if (cliente.latitud) setLatitud(String(cliente.latitud));
                    if (cliente.longitud) setLongitud(String(cliente.longitud));
                    
                    // Cargar datos ONE en modo edición
                    setProvincia(cliente.provincia || '');
                    setMunicipio(cliente.municipio || '');
                    setDistritoMunicipal(cliente.distrito_municipal || '');
                    setSeccion(cliente.seccion || '');
                    setParaje(cliente.paraje || '');
                    setSectorBarrio(cliente.sector_barrio || '');
                    setCalle(cliente.calle || '');
                    setNumero(cliente.numero || '');
                    setEdificio(cliente.edificio || '');
                    setApartamento(cliente.apartamento || '');
                    setCodigoPostal(cliente.codigo_postal || '');
                    setReferenciaExacta(cliente.referencia_exacta || '');
                    
                    setRnc(cliente.rnc);
                    if (cliente.razon_social || cliente.razonSocial) {
                        setRazonSocial(cliente.razon_social || cliente.razonSocial);
                        setIsPersonaJuridica(true);
                    }
                    setCorreoElect(cliente.correo_elect);
                    setCedula(cliente.cedula);
                    setPasaporte(cliente.pasaporte);
                    setReferencia(cliente.referencia);
                    setClienteId(cliente.id_cliente);
                    setIsEditMode(true);
                }
            } catch (error) {
                console.error('Error al obtener el cliente:', error);
                Alert.alert('Error', 'No se pudo cargar los datos del cliente');
            }
        } else {
            setIsEditMode(false);
        }
    };

    // Registrar navegación
    const registrarNavegacion = async () => {
        if (!usuarioId) return;

        try {
            const fechaActual = new Date();
            const fecha = fechaActual.toISOString().split('T')[0];
            const hora = fechaActual.toTimeString().split(' ')[0];

            const logData = {
                id_usuario: usuarioId,
                fecha,
                hora,
                pantalla: isEditMode ? 'EditarCliente' : 'AgregarCliente',
                datos: JSON.stringify({
                    isDarkMode,
                    clienteId,
                    nombres,
                    apellidos,
                    telefono1,
                    telefono2,
                    direccion,
                    provincia,
                    municipio,
                    distritoMunicipal,
                    seccion,
                    paraje,
                    sectorBarrio,
                    calle,
                    numero,
                    edificio,
                    apartamento,
                    codigoPostal,
                    referenciaExacta,
                    latitud,
                    longitud,
                    rnc,
                    isPersonaJuridica,
                    razonSocial,
                    correoElect,
                    cedula,
                    pasaporte,
                    referencia,
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
                throw new Error('Error al registrar la navegación');
            }
            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    // Manejo de guardar o actualizar cliente
    // Manejo de guardar o actualizar cliente
    const handleSaveOrUpdate = () => {
        if (!nombres.trim()) {
            Alert.alert('Error', 'El campo Nombres es obligatorio.');
            return;
        }

        Alert.alert(
            'Confirmación',
            isEditMode
                ? '¿Estás seguro de que deseas actualizar este cliente?'
                : '¿Estás seguro de que deseas guardar este cliente?',
            [
                {
                    text: 'Cancelar',
                    onPress: () => console.log('Acción cancelada'),
                    style: 'cancel',
                },
                {
                    text: isEditMode ? 'Actualizar' : 'Guardar',
                    onPress: () => {
                        if (isEditMode) {
                            actualizarCliente();
                        } else {
                            guardarCliente();
                        }
                    },
                },
            ],
            { cancelable: false } // Evita que se cierre al tocar fuera del cuadro de diálogo
        );
    };


    // Guardar cliente
    const guardarCliente = async () => {
        const url = 'https://wellnet-rd.com:444/api/insertar-cliente';

        try {
            const id_isp = await getStoredIspId();
            if (!id_isp) return;

            // Construir dirección compuesta siguiendo ONE
            const composedDireccion = buildDireccion();
            
            // Truncar dirección para evitar exceder VARCHAR(255) de la BD
            const direccionTruncada = composedDireccion.substring(0, 250);
            
            // Log longitud de dirección para debug
            console.log('📏 [DIRECCION DEBUG] Original:', composedDireccion.length, 'chars');
            console.log('📏 [DIRECCION DEBUG] Truncada:', direccionTruncada.length, 'chars');

            // DEBUG: Log para verificar datos ONE
            console.log('🏠 [ONE DEBUG] Datos de ubicación:', {
                provincia,
                municipio,
                distritoMunicipal,
                seccion,
                paraje,
                composedDireccion
            });

            const clienteData: any = {
                usuarioId,
                id_isp,
                nombres,
                apellidos,
                telefono1,
                telefono2,
                direccion: direccionTruncada,
                latitud,
                longitud,
                correoElect,
                pasaporte,
                referencia,
                cedula,
                // Campos ONE (nombres exactos que espera el backend) - Truncados para seguridad BD
                provincia: provincia?.substring(0, 90),
                municipio: municipio?.substring(0, 90),
                distrito_municipal: distritoMunicipal?.substring(0, 90),  // snake_case para backend
                seccion: seccion?.substring(0, 90),
                paraje: paraje?.substring(0, 90),
                // Campos adicionales de dirección - Truncados para seguridad BD
                sector_barrio: sectorBarrio?.substring(0, 110),
                calle: calle?.substring(0, 110),
                numero: numero?.substring(0, 25),
                edificio: edificio?.substring(0, 110),
                apartamento: apartamento?.substring(0, 25),
                codigo_postal: codigoPostal?.substring(0, 12),
                referencia_exacta: referenciaExacta?.substring(0, 250),
                // Campo requerido
                activo: 'Y'
            };
            // Persona jurídica vs física
            if (isPersonaJuridica) {
                clienteData.persona_juridica = true;
                if (rnc) clienteData.rnc = rnc;
                if (razonSocial) clienteData.razon_social = razonSocial;
            } else {
                clienteData.persona_juridica = false;
            }

            // DEBUG: Log datos completos enviados al backend
            console.log('📡 [BACKEND DEBUG] Datos enviados a /api/insertar-cliente:', clienteData);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData),
            });

            if (response.ok) {
                Alert.alert('Éxito', 'Cliente guardado con éxito.');
                navigation.navigate('ClientListScreen');
            } else {
                throw new Error('Algo salió mal al guardar el cliente');
            }
        } catch (error) {
            console.error('Error al guardar el cliente:', error);
            Alert.alert('Error', 'No se pudo guardar el cliente');
        }
    };

    // Actualizar cliente
    const actualizarCliente = async () => {
        const url = `https://wellnet-rd.com:444/api/actualizar-cliente`;

        // Validación de campos obligatorios
        if (!clienteId) {
            Alert.alert('Error', 'No se pudo identificar el cliente a actualizar');
            console.error('❌ clienteId faltante:', clienteId);
            return;
        }
        if (!usuarioId) {
            Alert.alert('Error', 'ID de usuario requerido');
            console.error('❌ usuarioId faltante:', usuarioId);
            return;
        }

        const clienteData: any = {
            clienteId,
            usuarioId,
            nombres,
            apellidos,
            telefono1,
            telefono2,
            direccion: buildDireccion().substring(0, 250),
            latitud,
            longitud,
            correoElect,
            pasaporte,
            referencia,
            cedula,
            // Campos ONE (nombres exactos que espera el backend) - Truncados para seguridad BD
            provincia: provincia?.substring(0, 90),
            municipio: municipio?.substring(0, 90),
            distrito_municipal: distritoMunicipal?.substring(0, 90),  // snake_case para backend
            seccion: seccion?.substring(0, 90),
            paraje: paraje?.substring(0, 90),
            // Campos adicionales de dirección - Truncados para seguridad BD
            sector_barrio: sectorBarrio?.substring(0, 110),
            calle: calle?.substring(0, 110),
            numero: numero?.substring(0, 25),
            edificio: edificio?.substring(0, 110),
            apartamento: apartamento?.substring(0, 25),
            codigo_postal: codigoPostal?.substring(0, 12),
            referencia_exacta: referenciaExacta?.substring(0, 250),
            // Campo requerido
            activo: 'Y'
        };
        if (isPersonaJuridica) {
            clienteData.persona_juridica = true;
            if (rnc) clienteData.rnc = rnc;
            if (razonSocial) clienteData.razon_social = razonSocial;
        } else {
            clienteData.persona_juridica = false;
        }

        // DEBUG: Log datos completos enviados al backend (actualización)
        console.log('📡 [UPDATE DEBUG] URL:', url);
        console.log('📡 [UPDATE DEBUG] clienteId:', clienteId, 'tipo:', typeof clienteId);
        console.log('📡 [UPDATE DEBUG] usuarioId:', usuarioId, 'tipo:', typeof usuarioId);
        console.log('📡 [UPDATE DEBUG] Datos completos enviados:', clienteData);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData),
            });

            if (response.ok) {
                Alert.alert('Éxito', 'Cliente actualizado con éxito.');
                navigation.navigate('ClientListScreen');
            } else {
                // Mejor logging del error
                const errorText = await response.text();
                console.error('❌ [UPDATE ERROR] Status:', response.status);
                console.error('❌ [UPDATE ERROR] Response:', errorText);
                throw new Error(`Error ${response.status}: ${errorText.slice(0, 200)}`);
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            Alert.alert('Error', 'No se pudo actualizar el cliente');
        }
    };

    // Helper: compone la dirección siguiendo niveles ONE
    const buildDireccion = () => {
        const parts: string[] = [];
        // Línea libre si existe
        if (direccion) parts.push(direccion);
        if (calle) parts.push(`C/${calle}${numero ? ` #${numero}` : ''}`);
        if (edificio || apartamento) parts.push(`${edificio ? `Edif. ${edificio}` : ''}${edificio && apartamento ? ', ' : ''}${apartamento ? `Apt. ${apartamento}` : ''}`.trim());
        if (sectorBarrio) parts.push(`Sector ${sectorBarrio}`);
        if (paraje) parts.push(`Paraje ${paraje}`);
        if (seccion) parts.push(`Sección ${seccion}`);
        if (distritoMunicipal) parts.push(`DM ${distritoMunicipal}`);
        if (municipio) parts.push(`Municipio ${municipio}`);
        if (provincia) parts.push(`Provincia ${provincia}`);
        if (codigoPostal) parts.push(`CP ${codigoPostal}`);
        if (referenciaExacta) parts.push(`Ref: ${referenciaExacta}`);
        if (latitud && longitud) parts.push(`GPS ${latitud}, ${longitud}`);
        // Limpia separadores sobrantes
        return parts.filter(Boolean).join(', ');
    };

    // Geolocalización: solicita permiso (Android) y obtiene coordenadas
    const requestLocationPermission = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') return true;
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Permiso de ubicación',
                    message: 'Necesitamos tu ubicación para completar las coordenadas del cliente.',
                    buttonPositive: 'Permitir',
                    buttonNegative: 'Cancelar',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            return false;
        }
    };

    const obtenerUbicacionActual = async () => {
        const ok = await requestLocationPermission();
        if (!ok) {
            Alert.alert('Permiso denegado', 'Activa la ubicación para continuar.');
            return;
        }
        try {
            const location = await GetLocation.getCurrentPosition({
                enableHighAccuracy: false,
                timeout: 60000,
                maximumAge: 300000,
            });
            const lat = location.latitude.toFixed(6);
            const lng = location.longitude.toFixed(6);
            setLatitud(lat);
            setLongitud(lng);
            Alert.alert('Ubicación obtenida', `Lat: ${lat}\nLng: ${lng}`);
            return;
        } catch (err) {
            // fallback con Geolocation
        }

        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const lat = latitude.toFixed(6);
                const lng = longitude.toFixed(6);
                setLatitud(lat);
                setLongitud(lng);
                Alert.alert('Ubicación obtenida', `Lat: ${lat}\nLng: ${lng}`);
            },
            (error) => {
                Alert.alert(
                    'GPS no disponible',
                    'No se pudo obtener la ubicación automáticamente. Verifica GPS/Permisos e inténtalo de nuevo.'
                );
            },
            { enableHighAccuracy: false, timeout: 45000, maximumAge: 300000 }
        );
    };

    return (
        <>
        <View style={ui.screen}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                    {/* Header */}
                    <View style={ui.header}>
                        <View>
                            <Text style={ui.title}>{isEditMode ? 'Editar cliente' : 'Nuevo cliente'}</Text>
                            <Text style={ui.subtitle}>{nombreUsuario ? `Usuario: ${nombreUsuario}` : ''}</Text>
                        </View>
                        <ThemeSwitch />
                    </View>

                    {/* Datos personales */}
                    <View style={ui.card}>
                        <View style={ui.sectionHeader}>
                            <Icon name="person" size={18} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
                            <Text style={ui.sectionTitle}>Datos personales</Text>
                        </View>
                        <Text style={styles.label}>Nombres</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombres"
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                            value={nombres}
                            onChangeText={setNombres}
                            autoCapitalize="words"
                            returnKeyType="next"
                        />
                        <Text style={styles.label}>Apellidos</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Apellidos"
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                            value={apellidos}
                            onChangeText={setApellidos}
                            autoCapitalize="words"
                            returnKeyType="next"
                        />
                    </View>

                    {/* Contacto */}
                    <View style={ui.card}>
                        <View style={ui.sectionHeader}>
                            <Icon name="call" size={18} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
                            <Text style={ui.sectionTitle}>Contacto</Text>
                        </View>
                        <View style={ui.row}>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Teléfono 1</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Teléfono 1"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={telefono1}
                                    onChangeText={setTelefono1}
                                    keyboardType="phone-pad"
                                    returnKeyType="next"
                                />
                            </View>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Teléfono 2</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Teléfono 2"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={telefono2}
                                    onChangeText={setTelefono2}
                                    keyboardType="phone-pad"
                                    returnKeyType="next"
                                />
                            </View>
                        </View>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="correo@dominio.com"
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                            value={correoElect}
                            onChangeText={setCorreoElect}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="next"
                        />
                        <Text style={styles.label}>Dirección (línea 1)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Calle o referencia principal"
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                            value={direccion}
                            onChangeText={setDireccion}
                            returnKeyType="next"
                        />
                    </View>

                    {/* Dirección detallada (ONE) */}
                    <View style={ui.card}>
                        <View style={ui.sectionHeader}>
                            <Icon name="place" size={18} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
                            <Text style={ui.sectionTitle}>Dirección (estándar ONE)</Text>
                        </View>
                        <TouchableOpacity style={[ui.saveButton, { marginHorizontal: 0, marginVertical: 8, backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} onPress={() => setOneModalVisible(true)}>
                            <Icon name="place" size={20} color={isDarkMode ? '#F3F4F6' : '#111827'} />
                            <Text style={[ui.saveButtonText, { color: isDarkMode ? '#F3F4F6' : '#111827' }]}>Seleccionar ubicación (ONE)</Text>
                        </TouchableOpacity>
                        <View style={ui.row}>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Provincia</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Provincia"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={provincia}
                                    onChangeText={setProvincia}
                                />
                            </View>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Municipio</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Municipio"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={municipio}
                                    onChangeText={setMunicipio}
                                />
                            </View>
                        </View>
                        <View style={ui.row}>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Distrito municipal</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Distrito municipal"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={distritoMunicipal}
                                    onChangeText={setDistritoMunicipal}
                                />
                            </View>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Sección</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Sección"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={seccion}
                                    onChangeText={setSeccion}
                                />
                            </View>
                        </View>
                        <View style={ui.row}>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Paraje</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Paraje"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={paraje}
                                    onChangeText={setParaje}
                                />
                            </View>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Sector/Barrio</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Sector o barrio"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={sectorBarrio}
                                    onChangeText={setSectorBarrio}
                                />
                            </View>
                        </View>
                        <View style={ui.row}>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Calle/Avenida</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre de la vía"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={calle}
                                    onChangeText={setCalle}
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Número</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="No./KM"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={numero}
                                    onChangeText={setNumero}
                                />
                            </View>
                        </View>
                        <View style={ui.row}>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Edificio</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Edif./Residencial"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={edificio}
                                    onChangeText={setEdificio}
                                />
                            </View>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Apartamento</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Apt./Nivel"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={apartamento}
                                    onChangeText={setApartamento}
                                />
                            </View>
                        </View>
                        <View style={ui.row}>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Código postal</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Código postal"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={codigoPostal}
                                    onChangeText={setCodigoPostal}
                                    keyboardType="number-pad"
                                />
                            </View>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Referencia exacta</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Esquina, punto, entre calles"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={referenciaExacta}
                                    onChangeText={setReferenciaExacta}
                                />
                            </View>
                        </View>

                        {/* Coordenadas */}
                        <View style={ui.sectionHeader}>
                            <Icon name="my-location" size={18} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
                            <Text style={ui.sectionTitle}>Coordenadas</Text>
                        </View>
                        <View style={ui.row}>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Latitud</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="18.48..."
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={latitud}
                                    onChangeText={setLatitud}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Longitud</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="-69.91..."
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={longitud}
                                    onChangeText={setLongitud}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>
                        <TouchableOpacity style={ui.saveButton} onPress={obtenerUbicacionActual}>
                            <Icon name="gps-fixed" size={20} color="#fff" />
                            <Text style={ui.saveButtonText}>Usar mi ubicación actual</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Identificación y facturación */}
                    <View style={ui.card}>
                        <View style={ui.sectionHeader}>
                            <Icon name="badge" size={18} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
                            <Text style={ui.sectionTitle}>Identificación y facturación</Text>
                        </View>
                        {/* Tipo de persona: radio buttons */}
                        <View style={{ marginBottom: 8 }}>
                            <Text style={styles.label}>Tipo de persona</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    onPress={() => { setIsPersonaJuridica(false); setRnc(''); setRazonSocial(''); }}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
                                >
                                    <Icon
                                        name={isPersonaJuridica ? 'radio-button-unchecked' : 'radio-button-checked'}
                                        size={20}
                                        color={isDarkMode ? '#93C5FD' : '#2563EB'}
                                    />
                                    <Text style={{ marginLeft: 8, color: isDarkMode ? '#fff' : '#333' }}>Persona física</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setIsPersonaJuridica(true)}
                                    style={{ flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Icon
                                        name={isPersonaJuridica ? 'radio-button-checked' : 'radio-button-unchecked'}
                                        size={20}
                                        color={isDarkMode ? '#93C5FD' : '#2563EB'}
                                    />
                                    <Text style={{ marginLeft: 8, color: isDarkMode ? '#fff' : '#333' }}>Persona jurídica</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* RNC y Razón Social: solo si persona jurídica */}
                        {isPersonaJuridica && (
                            <View style={ui.row}>
                                <View style={ui.inputHalf}>
                                    <Text style={styles.label}>RNC</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="RNC"
                                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                        value={rnc}
                                        onChangeText={setRnc}
                                        keyboardType="number-pad"
                                    />
                                </View>
                                <View style={ui.inputHalf}>
                                    <Text style={styles.label}>Razón social</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nombre legal de la empresa"
                                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                        value={razonSocial}
                                        onChangeText={setRazonSocial}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>
                        )}
                        <View style={ui.row}>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Cédula</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="000-0000000-0"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={cedula}
                                    onChangeText={setCedula}
                                    keyboardType="number-pad"
                                    returnKeyType="next"
                                />
                            </View>
                            <View style={ui.inputHalf}>
                                <Text style={styles.label}>Pasaporte</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Pasaporte"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                                    value={pasaporte}
                                    onChangeText={setPasaporte}
                                    returnKeyType="next"
                                />
                            </View>
                        </View>
                        {/* RNC ya gestionado arriba con Razón Social */}
                        <Text style={styles.label}>Referencia</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Referencia (opcional)"
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
                            value={referencia}
                            onChangeText={setReferencia}
                        />
                    </View>

                    {/* Save button */}
                    <TouchableOpacity style={ui.saveButton} onPress={handleSaveOrUpdate}>
                        <Icon name={isEditMode ? 'save' : 'check-circle'} size={20} color="#FFFFFF" />
                        <Text style={ui.saveButtonText}>{isEditMode ? 'Actualizar cliente' : 'Guardar cliente'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
        {/* ONE Modal */}
        <OneLocationSelector
            visible={oneModalVisible}
            onClose={() => setOneModalVisible(false)}
            isDarkMode={isDarkMode}
            initialSelection={{
                provincia: provincia ? { label: provincia } as any : null,
                municipio: municipio ? { label: municipio } as any : null,
                distrito_municipal: distritoMunicipal ? { label: distritoMunicipal } as any : null,
                seccion: seccion ? { label: seccion } as any : null,
                paraje: paraje ? { label: paraje } as any : null,
            }}
            onConfirm={(sel) => {
                setProvincia(sel.provincia?.label || '');
                setMunicipio(sel.municipio?.label || '');
                setDistritoMunicipal(sel.distrito_municipal?.label || '');
                setSeccion(sel.manualSeccion ? sel.manualSeccion : (sel.seccion?.label || ''));
                setParaje(sel.manualParaje ? sel.manualParaje : (sel.paraje?.label || ''));
            }}
        />
        </>
    );
};

export default AddClientScreen;
