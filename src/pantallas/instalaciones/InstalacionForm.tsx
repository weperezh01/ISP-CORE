import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './InstalacionFormStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EquiposForm from './componentes_instalacion/EquiposForm';
import MaterialesForm from './componentes_instalacion/MaterialesForm';
import LimiteVelocidadForm from './componentes_instalacion/LimiteVelocidadForm';
import PPPoECredentials from './componentes_instalacion/PPPoECredentials';
import DropDownPicker from 'react-native-dropdown-picker';
import CoordinatesFormModern from './componentes_instalacion/CoordinatesFormModern';
import ModernHeader from './componentes_instalacion/ModernHeader';
import SectionCard from './componentes_instalacion/SectionCard';

const InstalacionForm = ({ route, navigation }) => {
    const { id_instalacion, id_conexion, id_isp, isEditMode, id_averia, descripcion_averia, viewMode } = route.params;
    console.log('route params:', route.params);
    
    // Determinar si estamos en modo de solo vista
    const isViewOnly = viewMode === 'materials';
    
    // Debug: Log para verificar los modos
    console.log('🔍 Modos detectados:');
    console.log('- isEditMode:', isEditMode);
    console.log('- id_instalacion:', id_instalacion);
    console.log('- isViewOnly:', isViewOnly);
    console.log('- viewMode:', viewMode);
    
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [nombreUsuario, setNombreUsuario] = useState('');
    const [idUsuario, setIdUsuario] = useState('');
    const [routers, setRouters] = useState([]);
    const [selectedRouter, setSelectedRouter] = useState('');
    const [tiposConexion, setTiposConexion] = useState([]);
    const [selectedTipoConexion, setSelectedTipoConexion] = useState('');
    const [redesIP, setRedesIP] = useState([]);
    const [selectedRedIP, setSelectedRedIP] = useState('');
    const [direccionesIP, setDireccionesIP] = useState([]);
    const [selectedDireccionIP, setSelectedDireccionIP] = useState('');
    const [pppoeUsuario, setPppoeUsuario] = useState('');
    const [pppoeSecret, setPppoeSecret] = useState('');
    const [pppoePerfil, setPppoePerfil] = useState('');
    const [idConfiguracion, setIdConfiguracion] = useState(null);
    const [modoOperacion, setModoOperacion] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [openTipoConexion, setOpenTipoConexion] = useState(false); // Estado para el picker
    const [showRedes, setShowRedes] = useState(false);
    const [showDirecciones, setShowDirecciones] = useState(false);

    const [form, setForm] = useState({
        notas_config: '',
        router_wifi: '',
        router_onu: '',
        serial_onu: '',
        radios: '',
        pies_utp_cat5: '',
        pies_utp_cat6: '',
        pies_drop_fibra: '',
        conector_mecanico_fibra: '',
        conector_rj45: '',
        pinzas_anclaje: '',
        bridas: '',
        grapas: '',
        velas_silicon: '',
        pies_tubo: '',
        rollos_cable_dulce: '',
        clavos: '',
        tornillos: '',
        abrazaderas: '',
        notas_instalacion: '',
        latitud: '',
        longitud: '',
        limite_subida: '',
        unidad_subida: 'Mbps',
        limite_bajada: '',
        unidad_bajada: 'Mbps'
    });

    // Estado para rastrear si ya se cargaron los datos
    const [datosYaCargados, setDatosYaCargados] = useState(false);
    
    // Función robusta para llenar el formulario con datos de instalación
    const llenarFormularioConDatos = async (data) => {
        console.log('🏗️ Iniciando llenado robusto del formulario');
        
        // Paso 1: Preparar todos los datos
        const datosConvertidos = {
            notas_config: data.notas_config || '',
            router_wifi: data.router_wifi || '',
            router_onu: data.router_onu || '',
            serial_onu: data.serial_onu || '',
            radios: data.radios !== undefined ? String(data.radios) : '',
            pies_utp_cat5: data.pies_utp_cat5 !== undefined ? String(data.pies_utp_cat5) : '',
            pies_utp_cat6: data.pies_utp_cat6 !== undefined ? String(data.pies_utp_cat6) : '',
            pies_drop_fibra: data.pies_drop_fibra !== undefined ? String(data.pies_drop_fibra) : '',
            conector_mecanico_fibra: data.conector_mecanico_fibra !== undefined ? String(data.conector_mecanico_fibra) : '',
            conector_rj45: data.conector_rj45 !== undefined ? String(data.conector_rj45) : '',
            pinzas_anclaje: data.pinzas_anclaje !== undefined ? String(data.pinzas_anclaje) : '',
            bridas: data.bridas !== undefined ? String(data.bridas) : '',
            grapas: data.grapas !== undefined ? String(data.grapas) : '',
            velas_silicon: data.velas_silicon !== undefined ? String(data.velas_silicon) : '',
            pies_tubo: data.pies_tubo !== undefined ? String(data.pies_tubo) : '',
            rollos_cable_dulce: data.rollos_cable_dulce !== undefined ? String(data.rollos_cable_dulce) : '',
            clavos: data.clavos !== undefined ? String(data.clavos) : '',
            tornillos: data.tornillos !== undefined ? String(data.tornillos) : '',
            abrazaderas: data.abrazaderas !== undefined ? String(data.abrazaderas) : '',
            notas_instalacion: data.notas_instalacion || '',
            latitud: data.latitud || '',
            longitud: data.longitud || '',
            limite_subida: data.limite_subida !== undefined ? String(data.limite_subida) : '',
            limite_bajada: data.limite_bajada !== undefined ? String(data.limite_bajada) : '',
            unidad_subida: data.unidad_subida || 'Mbps',
            unidad_bajada: data.unidad_bajada || 'Mbps'
        };
        
        console.log('📋 Datos convertidos y preparados:', datosConvertidos);
        
        // Paso 2: Establecer en el formulario usando un enfoque directo
        setForm(datosConvertidos);
        
        // Paso 3: Esperar y verificar
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('✅ Función llenarFormularioConDatos completada');
        return datosConvertidos;
    };

    // Efecto para resetear el estado de datos cargados cuando cambia la instalación
    useEffect(() => {
        console.log('🔄 Reseteando estado de datos cargados para nueva instalación:', id_instalacion);
        setDatosYaCargados(false);
        
        // También resetear el formulario cuando cambia la instalación para evitar datos viejos
        if ((isEditMode || isViewOnly) && id_instalacion) {
            console.log('🧹 Limpiando formulario para nueva instalación');
            setForm({
                notas_config: '',
                router_wifi: '',
                router_onu: '',
                serial_onu: '',
                radios: '',
                pies_utp_cat5: '',
                pies_utp_cat6: '',
                pies_drop_fibra: '',
                conector_mecanico_fibra: '',
                conector_rj45: '',
                pinzas_anclaje: '',
                bridas: '',
                grapas: '',
                velas_silicon: '',
                pies_tubo: '',
                rollos_cable_dulce: '',
                clavos: '',
                tornillos: '',
                abrazaderas: '',
                notas_instalacion: '',
                latitud: '',
                longitud: '',
                limite_subida: '',
                unidad_subida: 'Mbps',
                limite_bajada: '',
                unidad_bajada: 'Mbps'
            });
        }
    }, [id_instalacion, isEditMode, isViewOnly]);

    useEffect(() => {
        const fetchTiposConexion = async () => {
            try {
                const storedIspId = await AsyncStorage.getItem('@selectedIspId');
                if (!storedIspId) throw new Error('ID ISP no encontrado en el almacenamiento local');

                const ispIdParsed = JSON.parse(storedIspId);
                if (!ispIdParsed || typeof ispIdParsed !== 'number') {
                    throw new Error('El ID ISP almacenado es inválido.');
                }

                const response = await fetch('https://wellnet-rd.com:444/api/conexion-tipos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_isp: ispIdParsed })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Fallo al obtener los tipos de conexión: ${errorText}`);
                }

                const data = await response.json();
                setTiposConexion(data.data.map(tipo => ({
                    label: tipo.descripcion_tipo_conexion,
                    value: tipo.id_tipo_conexion
                })));
            } catch (error) {
                console.error('Error al cargar tipos de conexión:', error);
                setError('No se pudo cargar la información. Intente de nuevo más tarde.');
            }
        };

        fetchTiposConexion();
    }, []);




    useEffect(() => {
        const fetchConexionData = async () => {
            try {
                if (!id_conexion) return; // Salir si no hay id_conexion
    
                // Solicitar la información de la conexión
                const response = await fetch('https://wellnet-rd.com:444/api/conexiones-id', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_conexion })
                });
    
                if (!response.ok) {
                    throw new Error('Fallo al obtener los datos de la conexión.');
                }
    
                const conexionData = await response.json();
                const idTipoConexionExistente = conexionData?.id_tipo_conexion;
    
                if (idTipoConexionExistente) {
                    // Actualizar el valor del tipo de conexión seleccionado
                    setSelectedTipoConexion(idTipoConexionExistente);
                }
            } catch (error) {
                console.error('Error al cargar los datos de la conexión:', error);
                setError('No se pudo cargar la información de la conexión. Intente de nuevo más tarde.');
            }
        };
    
        fetchConexionData();
    }, []);
    


    useEffect(() => {
        console.log('Tipos de conexión cargados:', tiposConexion);
        console.log('Tipo de conexión seleccionado:', selectedTipoConexion);
    }, [tiposConexion, selectedTipoConexion]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedIspId = await AsyncStorage.getItem('@selectedIspId');
                if (!storedIspId) throw new Error('ID ISP no encontrado en el almacenamiento local');

                const ispIdParsed = JSON.parse(storedIspId);

                const response = await fetch('https://wellnet-rd.com:444/api/routers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_isp: ispIdParsed })
                });

                if (!response.ok) throw new Error('Fallo al obtener datos de los routers');

                const data = await response.json();
                if (!Array.isArray(data.data)) throw new Error('Se esperaba un arreglo, pero se recibió otro tipo de dato');

                setRouters(data.data.map(router => ({
                    label: `ID: ${router.id_router}, ${router.nombre_router}, ${router.descripcion}`,
                    value: router.id_router
                })));
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            console.log('🔄 useEffect loadData ejecutándose...');
            console.log('- isEditMode:', isEditMode);
            console.log('- isViewOnly:', isViewOnly);
            console.log('- id_instalacion:', id_instalacion);
            console.log('- ¿Debe cargar datos?:', (isEditMode || isViewOnly) && id_instalacion && !datosYaCargados);
            
            // Cargar datos si estamos en modo edición o en modo vista de materiales Y tenemos id_instalacion Y no se han cargado ya
            if ((isEditMode || isViewOnly) && id_instalacion && !datosYaCargados) {
                console.log('✅ Condición cumplida, cargando datos...');
                console.log('🔒 datosYaCargados:', datosYaCargados);
                
                // Agregar un pequeño delay para asegurar que el reset del formulario se complete
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log('⏱️ Delay completado, procediendo con la carga de datos');
                
                try {
                    const response = await fetch('https://wellnet-rd.com:444/api/instalacion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_instalacion })
                    });
                    if (!response.ok) throw new Error('Failed to fetch installation data');
                    const data = await response.json();
                    console.log('📡 Datos de instalación recibidos del API:', JSON.stringify(data, null, 2));
                    console.log('🔍 Verificando campos específicos:');
                    console.log('- router_wifi:', data.router_wifi);
                    console.log('- pies_utp_cat5:', data.pies_utp_cat5);
                    console.log('- bridas:', data.bridas);
                    console.log('- notas_instalacion:', data.notas_instalacion);
                    
                    // Verificar si el problema está en el setForm
                    console.log('📝 Estado actual del form antes de setForm:', JSON.stringify(form, null, 2));
                    
                    // USAR LA NUEVA FUNCIÓN ROBUSTA PARA LLENAR EL FORMULARIO
                    const datosEstablecidos = await llenarFormularioConDatos(data);
                    
                    console.log('✅ setForm ejecutado con datos del API');
                    
                    // Paso 4: Verificar que los datos se establecieron correctamente
                    console.log('🔍 Verificación inmediata de datos establecidos:');
                    console.log('- pies_utp_cat5 establecido:', datosEstablecidos.pies_utp_cat5);
                    console.log('- bridas establecido:', datosEstablecidos.bridas);
                    console.log('- tornillos establecido:', datosEstablecidos.tornillos);
                    console.log('- router_wifi establecido:', datosEstablecidos.router_wifi);
                    console.log('- latitud establecida:', datosEstablecidos.latitud);
                    
                    // Marcar que los datos ya se cargaron para evitar re-cargas
                    setDatosYaCargados(true);
                    console.log('🔒 Datos marcados como cargados exitosamente');
                    
                    
                    // Si tenemos datos de configuración en la instalación, también los cargamos
                    if (data.id_router) setSelectedRouter(data.id_router);
                    if (data.id_tipo_conexion) setSelectedTipoConexion(data.id_tipo_conexion);
                    if (data.red_ip) setSelectedRedIP(data.red_ip);
                    if (data.direccion_ip) setSelectedDireccionIP(data.direccion_ip);
                    if (data.pppoe_usuario) setPppoeUsuario(data.pppoe_usuario);
                    if (data.pppoe_secret) setPppoeSecret(data.pppoe_secret);
                    if (data.pppoe_perfil) setPppoePerfil(data.pppoe_perfil);
                } catch (error) {
                    console.error('❌ Error al cargar datos de instalación:', error);
                    console.log('🔄 Intentando recargar datos en 1 segundo...');
                    
                    // Resetear el estado de carga para permitir un reintento
                    setDatosYaCargados(false);
                    
                    // Reintentar después de un segundo
                    setTimeout(() => {
                        console.log('♻️ Reintentando carga de datos automáticamente');
                        setDatosYaCargados(false); // Forzar recarga
                    }, 1000);
                    
                    Alert.alert("Error", "Error al cargar datos de instalación. Se reintentará automáticamente.");
                }
            } else {
                console.log('❌ Condición NO cumplida, no se cargarán datos de instalación');
                console.log('- Necesitamos: (isEditMode=true o isViewOnly=true) Y id_instalacion válido Y datosYaCargados=false');
                console.log('- Estado actual: isEditMode=', isEditMode, ', isViewOnly=', isViewOnly, ', id_instalacion=', id_instalacion, ', datosYaCargados=', datosYaCargados);
            }
            obtenerDatosUsuario();
            cargarConfiguracionExistente(id_conexion);
        };
        loadData();
        registrarNavegacion();  // Registrar la navegación al cargar la pantalla
    }, [id_instalacion, id_conexion, isEditMode, isViewOnly, datosYaCargados]);

    // Debug: Para ver los datos del formulario cuando cambien
    useEffect(() => {
        if (isViewOnly || isEditMode) {
            console.log('🔍 Datos actuales del formulario (cambio detectado):');
            console.log('- router_wifi:', form.router_wifi);
            console.log('- router_onu:', form.router_onu);
            console.log('- pies_utp_cat5:', form.pies_utp_cat5);
            console.log('- pies_utp_cat6:', form.pies_utp_cat6);
            console.log('- bridas:', form.bridas);
            console.log('- tornillos:', form.tornillos);
            console.log('- notas_instalacion:', form.notas_instalacion);
            console.log('- notas_config:', form.notas_config);
            console.log('- latitud:', form.latitud);
            console.log('- longitud:', form.longitud);
            console.log('📊 Formulario completo:', JSON.stringify(form, null, 2));
        }
    }, [form, isViewOnly, isEditMode]);

    const registrarNavegacion = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Retardo asíncrono de 2 segundos
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'InstalacionForm';

        const datos = JSON.stringify({
            id_instalacion,
            id_conexion,
            id_isp,
            isEditMode,
            id_averia,
            descripcion_averia,
            form,
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


    const cargarConfiguracionExistente = async (idConexion) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/obtener-configuracion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_conexion: idConexion })
            });
            if (!response.ok) throw new Error('Error al cargar la configuración existente');
            const data = await response.json();
            if (data) {
                setIdConfiguracion(data.id_configuracion);
                setSelectedTipoConexion(data.id_tipo_conexion);
                setSelectedRouter(data.id_router);
                setSelectedRedIP(data.red_ip);
                setSelectedDireccionIP(data.direccion_ip);
                setPppoeUsuario(data.usuario_pppoe);
                setPppoeSecret(data.secret_pppoe);
                setPppoePerfil(data.perfil_pppoe);
                setForm({
                    ...form,
                    limite_subida: data.subida_limite.toString(),
                    unidad_subida: data.unidad_subida === 'M' ? 'Mbps' : data.unidad_subida === 'K' ? 'Kbps' : data.unidad_subida === 'G' ? 'Gbps' : '',
                    limite_bajada: data.bajada_limite.toString(),
                    unidad_bajada: data.unidad_bajada === 'M' ? 'Mbps' : data.unidad_bajada === 'K' ? 'Kbps' : data.unidad_bajada === 'G' ? 'Gbps' : '',
                    notas_config: data.nota,
                });
            }
        } catch (error) {
            console.error('Error al cargar la configuración existente:', error);
        }
    };

    useEffect(() => {
        if (selectedRouter) fetchRedesIP(selectedRouter);
    }, [selectedRouter]);

    const fetchRedesIP = async (selectedRouterId) => {
        try {
            const storedIspId = await AsyncStorage.getItem('@selectedIspId');
            if (!storedIspId) throw new Error('ID ISP no encontrado en el almacenamiento local');
            const ispIdParsed = JSON.parse(storedIspId);

            const response = await fetch('https://wellnet-rd.com:444/api/routers/redes-ip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_router: selectedRouterId })
            });

            if (!response.ok) throw new Error('Error al cargar las redes IP');

            const data = await response.json();
            setRedesIP(data.map(red => ({
                label: red.address,
                value: red.address
            })));
        } catch (error) {
            console.error('Error fetching IP networks:', error);
        }
    };

    const handleChange = (name, value) => {
        setForm(prevForm => ({ ...prevForm, [name]: value }));
    };

    const handleSelectRedIP = async (item) => {
        if (selectedRedIP === item.value) {
            setSelectedRedIP('');
            setDireccionesIP([]);
        } else {
            setSelectedRedIP(item.value);
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/routers/rango-ip', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ network: item.value })
                });
                if (!response.ok) throw new Error('Fallo al obtener las direcciones IP');
                const data = await response.json();
                setDireccionesIP(data);
            } catch (error) {
                console.error('Error fetching IP addresses:', error);
                setDireccionesIP([]);
            }
        }
    };

    const handleSelectDireccionIP = async (item) => {
        if (selectedDireccionIP === item.direccion_ip) {
            setSelectedDireccionIP('');
            setModoOperacion('');
        } else {
            setSelectedDireccionIP(item.direccion_ip);
            try {
                const response = await fetch(`https://wellnet-rd.com:444/api/routers/${selectedRouter}`);
                if (!response.ok) throw new Error('Fallo al obtener el modo de operación');
                const data = await response.json();
                setModoOperacion(data.operacion);

                const perfilesResponse = await fetch('https://wellnet-rd.com:444/api/routers/perfiles_pppoe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_router: selectedRouter })
                });
                if (!perfilesResponse.ok) throw new Error('Fallo al obtener los perfiles PPPoE');
                const perfilesData = await perfilesResponse.json();
                setPppoePerfiles(perfilesData);
            } catch (error) {
                console.error('Error fetching PPPoE profiles:', error);
                setModoOperacion('');
            }
        }
    };

    const handleSubmit = () => {
        Alert.alert(
            "Continuar Instalación Más Tarde",
            "¿Deseas guardar la instalación actual para continuarla más tarde? La instalación quedará pendiente hasta que sea finalizada.",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Guardar", 
                    style: "default",
                    onPress: async () => {
                        const url = 'https://wellnet-rd.com:444/api/insertar-instalacion';
                        try {
                            const response = await fetch(url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ...form,
                                    id_usuario: idUsuario,
                                    id_isp: id_isp,
                                    id_conexion: id_conexion,
                                    id_estado_conexion: 2,
                                    id_router: selectedRouter,
                                    id_tipo_conexion: selectedTipoConexion,
                                    red_ip: selectedRedIP,
                                    direccion_ip: selectedDireccionIP,
                                    pppoe_usuario: pppoeUsuario,
                                    pppoe_secret: pppoeSecret,
                                    pppoe_perfil: pppoePerfil
                                }),
                            });
                            if (!response.ok) throw new Error('Server response was not ok');
                            const result = await response.json();
                            Alert.alert("Éxito", "Instalación guardada correctamente. Puedes continuarla más tarde desde los detalles de la conexión.", [
                                { text: "OK", onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error('Error al guardar instalación:', error);
                            Alert.alert("Error", "Fallo al guardar la instalación. Por favor intente nuevamente.");
                        }
                    }
                }
            ]
        );
    };

    const handleClose = () => {
        Alert.alert(
            "Finalizar Instalación",
            "¿Estás seguro de que quieres finalizar esta instalación? Una vez finalizada, la conexión estará activa y lista para uso.",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Finalizar", 
                    style: "default",
                    onPress: async () => {
                        const url = 'https://wellnet-rd.com:444/api/insertar-instalacion';
                        try {
                            const response = await fetch(url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ...form,
                                    id_usuario: idUsuario,
                                    id_isp: id_isp,
                                    id_conexion: id_conexion,
                                    id_estado_conexion: 3,
                                    id_router: selectedRouter,
                                    id_tipo_conexion: selectedTipoConexion,
                                    red_ip: selectedRedIP,
                                    direccion_ip: selectedDireccionIP,
                                    pppoe_usuario: pppoeUsuario,
                                    pppoe_secret: pppoeSecret,
                                    pppoe_perfil: pppoePerfil,
                                    id_averia: id_averia,  // Asegúrate de enviar el id de la avería
                                }),
                            });
                            if (!response.ok) throw new Error('Server response was not ok');
                            const result = await response.json();
                            Alert.alert("Éxito", "Instalación finalizada correctamente. La conexión está ahora activa y lista para uso.", [
                                { text: "OK", onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error('Error al finalizar instalación:', error);
                            Alert.alert("Error", "Fallo al finalizar la instalación. Por favor intente nuevamente.");
                        }
                    }
                }
            ]
        );
    };

    const handleSaveConfig = async () => {
        const url = 'https://wellnet-rd.com:444/api/guardar-configuracion';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_conexion: id_conexion,
                    id_tipo_conexion: selectedTipoConexion,
                    id_router: selectedRouter,
                    red_ip: selectedRedIP,
                    direccion_ip: selectedDireccionIP,
                    usuario_pppoe: pppoeUsuario,
                    secret_pppoe: pppoeSecret,
                    perfil_pppoe: pppoePerfil,
                    subida_limite: form.limite_subida,
                    unidad_subida: form.unidad_subida.charAt(0),
                    bajada_limite: form.limite_bajada,
                    unidad_bajada: form.unidad_bajada.charAt(0),
                    nota: form.notas_config,
                    id_usuario: idUsuario
                }),
            });
            if (!response.ok) throw new Error('Server response was not ok');
            const result = await response.json();
            setIdConfiguracion(result.id_configuracion);
            Alert.alert("Success", "Configuración guardada correctamente");
        } catch (error) {
            Alert.alert("Error", "Fallo al guardar la configuración. Por favor, intente nuevamente.");
        }
    };

    const handleUpdateConfig = () => {
        Alert.alert("Actualización", "Configuración actualizada correctamente");
    };

    // Nuevas funciones para modo edición
    const handleUpdate = () => {
        Alert.alert(
            "Actualizar Instalación",
            "¿Estás seguro de que quieres actualizar esta instalación con los cambios realizados?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Actualizar", 
                    style: "default",
                    onPress: async () => {
                        const url = 'https://wellnet-rd.com:444/api/actualizar-instalacion';
                        try {
                            const response = await fetch(url, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id_instalacion: id_instalacion,
                                    ...form,
                                    id_usuario: idUsuario,
                                    id_isp: id_isp,
                                    id_conexion: id_conexion,
                                    id_router: selectedRouter,
                                    id_tipo_conexion: selectedTipoConexion,
                                    red_ip: selectedRedIP,
                                    direccion_ip: selectedDireccionIP,
                                    pppoe_usuario: pppoeUsuario,
                                    pppoe_secret: pppoeSecret,
                                    pppoe_perfil: pppoePerfil
                                }),
                            });
                            if (!response.ok) throw new Error('Server response was not ok');
                            const result = await response.json();
                            Alert.alert("Éxito", "La instalación ha sido actualizada correctamente", [
                                { text: "OK", onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error('Error al actualizar instalación:', error);
                            Alert.alert("Error", "Fallo al actualizar la instalación. Por favor intente nuevamente.");
                        }
                    }
                }
            ]
        );
    };

    const handleCancel = () => {
        Alert.alert(
            "Cancelar Edición",
            "¿Estás seguro de que quieres cancelar? Se perderán todos los cambios no guardados.",
            [
                { text: "Continuar Editando", style: "cancel" },
                { text: "Cancelar", style: "destructive", onPress: () => navigation.goBack() }
            ]
        );
    };

    const obtenerDatosUsuario = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@loginData');
            if (jsonValue) {
                const userData = JSON.parse(jsonValue);
                setNombreUsuario(userData.nombre);
                setIdUsuario(userData.id);
            } else {
                setNombreUsuario('Usuario');
            }
        } catch (e) {
            console.error('Failed to read user data', e);
            setNombreUsuario('Usuario');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#2563EB'} />
                <Text style={styles.loadingText}>Cargando información de instalación...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                </View>
            </View>
        );
    }

    const getStatusInfo = () => {
        if (id_averia) return `Avería #${id_averia}`;
        if (idConfiguracion) return `Config #${idConfiguracion}`;
        return 'Nueva Instalación';
    };

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <ModernHeader
                title={isViewOnly ? "📋 Ver Materiales de Instalación" : isEditMode ? "🔧 Continuar Instalación" : "🆕 Nueva Instalación"}
                subtitle={`Conexión #${id_conexion}`}
                statusInfo={getStatusInfo()}
                styles={styles}
            />

            <View style={styles.contentContainer}>
                <ScrollView 
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Status Info */}
                    {id_averia && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>
                                ⚠️ Avería ID: {id_averia} - {descripcion_averia}
                            </Text>
                        </View>
                    )}

                    {/* Network Configuration Section */}
                    <SectionCard title="Configuración de Red" icon="🌐" styles={styles}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Router Principal</Text>
                            <TextInput
                                style={[styles.input, styles.inputDisabled, styles.multilineInput]}
                                value={selectedRouter ? routers.find(router => router.value === selectedRouter)?.label : ''}
                                editable={false}
                                multiline={true}
                                placeholder="Router no seleccionado"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>

                        <View style={styles.networkContainer}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Red IP</Text>
                                <TextInput
                                    style={[styles.input, styles.inputDisabled]}
                                    value={selectedRedIP}
                                    editable={false}
                                    placeholder="Red IP no asignada"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Dirección IP</Text>
                                <TextInput
                                    style={[styles.input, styles.inputDisabled]}
                                    value={selectedDireccionIP}
                                    editable={false}
                                    placeholder="IP no asignada"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                />
                            </View>
                        </View>

                        {/* Speed Limits */}
                        {selectedDireccionIP && (
                            <View style={styles.limitsContainer}>
                                <View style={styles.limitGroup}>
                                    <Text style={styles.label}>Límite de Subida</Text>
                                    <TextInput
                                        style={[styles.input, styles.inputDisabled]}
                                        value={`${form.limite_subida || ''} ${form.unidad_subida}`}
                                        editable={false}
                                        placeholder="No definido"
                                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    />
                                </View>
                                <View style={styles.limitGroup}>
                                    <Text style={styles.label}>Límite de Bajada</Text>
                                    <TextInput
                                        style={[styles.input, styles.inputDisabled]}
                                        value={`${form.limite_bajada || ''} ${form.unidad_bajada}`}
                                        editable={false}
                                        placeholder="No definido"
                                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Configuration Notes */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Notas de Configuración</Text>
                            <TextInput
                                style={[styles.input, styles.inputDisabled, styles.multilineInput]}
                                value={form.notas_config}
                                onChangeText={isViewOnly ? undefined : (value) => handleChange('notas_config', value)}
                                placeholder="Añade notas relevantes sobre la configuración"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                multiline
                                editable={!isViewOnly}
                            />
                        </View>
                    </SectionCard>

                    {/* PPPoE Credentials */}
                    {modoOperacion === 'pppoe' && (
                        <View style={styles.pppoeContainer}>
                            <Text style={styles.pppoeTitle}>🔐 Credenciales PPPoE</Text>
                            <PPPoECredentials
                                pppoeUsuario={pppoeUsuario}
                                pppoeSecret={pppoeSecret}
                                pppoePerfil={pppoePerfil}
                                setPppoeUsuario={setPppoeUsuario}
                                setPppoeSecret={setPppoeSecret}
                                setPppoePerfil={setPppoePerfil}
                                pppoePerfiles={pppoePerfiles}
                            />
                        </View>
                    )}

                    {/* Connection Type Section */}
                    <SectionCard title="Tipo de Conexión" icon="🔌" styles={styles}>
                        <View style={styles.dropdownContainer}>
                            <Text style={styles.label}>Seleccionar Tipo</Text>
                            <DropDownPicker
                                open={isViewOnly ? false : openTipoConexion}
                                setOpen={isViewOnly ? () => {} : setOpenTipoConexion}
                                items={tiposConexion}
                                value={selectedTipoConexion}
                                setValue={isViewOnly ? () => {} : setSelectedTipoConexion}
                                containerStyle={{ height: openTipoConexion ? 300 : 50 }}
                                style={[styles.dropdown, isViewOnly && styles.inputDisabled]}
                                dropDownContainerStyle={styles.dropdownList}
                                disabled={isViewOnly}
                                itemStyle={{
                                    justifyContent: 'flex-start',
                                    paddingVertical: 15,
                                    paddingHorizontal: 16,
                                }}
                                labelStyle={{
                                    color: isDarkMode ? '#F1F5F9' : '#1E293B',
                                    fontSize: 16,
                                }}
                                activeLabelStyle={{ 
                                    color: isDarkMode ? '#DBEAFE' : '#2563EB',
                                    fontWeight: '600'
                                }}
                                placeholderStyle={{ 
                                    color: isDarkMode ? '#9CA3AF' : '#6B7280' 
                                }}
                                placeholder="Selecciona un tipo de conexión"
                            />
                        </View>

                        {/* Router Info */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Información del Router</Text>
                            <TextInput
                                style={[styles.input, isViewOnly && styles.inputDisabled]}
                                value={form.router_wifi}
                                onChangeText={isViewOnly ? undefined : (value) => handleChange('router_wifi', value)}
                                placeholder="Añade información adicional del router"
                                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                editable={!isViewOnly}
                            />
                        </View>
                    </SectionCard>

                    {/* Equipment Section */}
                    <SectionCard title="Equipos" icon="📡" styles={styles}>
                        <EquiposForm form={form} handleChange={handleChange} isViewOnly={isViewOnly} />
                    </SectionCard>

                    {/* Materials Section */}
                    <SectionCard title="Materiales" icon="🔧" styles={styles}>
                        <MaterialesForm form={form} handleChange={handleChange} isViewOnly={isViewOnly} />
                    </SectionCard>

                    {/* Coordinates Section with GPS */}
                    <CoordinatesFormModern 
                        form={form} 
                        handleChange={handleChange} 
                        styles={styles}
                        isDarkMode={isDarkMode}
                        isViewOnly={isViewOnly}
                    />

                    {/* Botón de Recargar Datos - Mostrar en modo vista o edición si los datos están vacíos */}
                    {(isViewOnly || isEditMode) && id_instalacion && (
                        // Mostrar el botón si los campos principales están vacíos (datos no cargados)
                        (form.pies_utp_cat5 === '' && form.bridas === '' && form.tornillos === '' && form.router_wifi === '' && form.notas_config === '') && (
                            <View style={styles.reloadContainer}>
                                <View style={styles.warningMessage}>
                                    <Text style={styles.warningText}>⚠️ Los datos de instalación no se han cargado</Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.reloadButton} 
                                    onPress={async () => {
                                        console.log('🔄 Recarga manual solicitada por el usuario');
                                        setDatosYaCargados(false);
                                        
                                        // Forzar recarga inmediata
                                        try {
                                            const response = await fetch('https://wellnet-rd.com:444/api/instalacion', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ id_instalacion })
                                            });
                                            if (!response.ok) throw new Error('Failed to fetch installation data');
                                            const data = await response.json();
                                            console.log('📡 Datos recargados manualmente:', data);
                                            
                                            await llenarFormularioConDatos(data);
                                            setDatosYaCargados(true);
                                            console.log('✅ Recarga manual completada exitosamente');
                                        } catch (error) {
                                            console.error('❌ Error en recarga manual:', error);
                                            Alert.alert("Error", "No se pudieron recargar los datos");
                                        }
                                    }}
                                >
                                    <Text style={styles.reloadButtonText}>🔄 Recargar Datos de Instalación</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    )}

                    {/* Action Buttons - Solo mostrar si no estamos en modo vista */}
                    {!isViewOnly && (
                        <View style={styles.buttonContainer}>
                            {isEditMode && id_instalacion ? (
                                // Botones para modo edición (cuando se está editando una instalación existente)
                                <>
                                    <TouchableOpacity 
                                        style={styles.successButton} 
                                        onPress={handleUpdate}
                                    >
                                        <Text style={styles.buttonText}>✏️ Actualizar Instalación</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.dangerButton} 
                                        onPress={handleCancel}
                                    >
                                        <Text style={styles.buttonText}>❌ Cancelar</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                // Botones para nueva instalación
                                <>
                                    <TouchableOpacity 
                                        style={styles.successButton} 
                                        onPress={handleSubmit}
                                    >
                                        <Text style={styles.buttonText}>💾 Continuar Instalación Más Tarde</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.dangerButton} 
                                        onPress={handleClose}
                                    >
                                        <Text style={styles.buttonText}>✅ Finalizar Instalación</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

export default InstalacionForm;
