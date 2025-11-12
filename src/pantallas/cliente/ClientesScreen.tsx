import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, StyleSheet, Modal, SafeAreaView, ScrollView, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import ThemeSwitch from '../../componentes/themeSwitch';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HorizontalMenu from '../../componentes/HorizontalMenu';
import MenuModal from '../../componentes/MenuModal';
import { buildAddressInfo } from '../../utils/addressFormatter';
import { getStyles, getFabStyles } from './ClientesScreenStyle';

// Colors palette - needed for the expand button
const colors = {
    primary: {
        500: '#3B82F6',
        600: '#2563EB',
    },
    gray: {
        300: '#CBD5E1',
        600: '#475569',
    }
};

const ClientListScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const fabStyles = getFabStyles(isDarkMode);
    const [clientList, setClientList] = useState([]);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [usuarioId, setUsuarioId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [ispId, setIspId] = useState('');
    const [clientCount, setClientCount] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false); // Estado para el modal
    const [selectedEstados, setSelectedEstados] = useState([]); // Estados seleccionados
    const [filteredClientCount, setFilteredClientCount] = useState(0);
    const [estadoCounts, setEstadoCounts] = useState({});
    const [menuVisible, setMenuVisible] = useState(false);
    const PAGE_SIZE = 50; // Tamaño de página del backend
    const [offset, setOffset] = useState(0); // Offset para backend
    const [expandedItems, setExpandedItems] = useState(new Set()); // Track which items are expanded
    
    // Referencia para el TextInput
    const searchInputRef = React.useRef(null);

    // Estados para animación de header, search bar y bottom menu
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerHeight = useRef(new Animated.Value(1)).current;
    const searchBarHeight = useRef(new Animated.Value(1)).current;
    const bottomMenuHeight = useRef(new Animated.Value(1)).current;
    const lastScrollY = useRef(0);
    const scrollDirection = useRef('down');

    // Función para manejar el scroll y animación del header
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;
                
                // Determinar dirección del scroll
                if (Math.abs(diff) > 5) { // Threshold para evitar micro-movimientos
                    if (diff > 0 && currentScrollY > 50) {
                        // Scroll hacia abajo - ocultar header/search bar, mostrar bottom menu
                        if (scrollDirection.current !== 'down') {
                            scrollDirection.current = 'down';
                            Animated.parallel([
                                Animated.timing(headerHeight, {
                                    toValue: 0,
                                    duration: 400,
                                    useNativeDriver: false,
                                }),
                                Animated.timing(searchBarHeight, {
                                    toValue: 0,
                                    duration: 400,
                                    useNativeDriver: false,
                                }),
                                Animated.timing(bottomMenuHeight, {
                                    toValue: 1,
                                    duration: 400,
                                    useNativeDriver: false,
                                })
                            ]).start();
                        }
                    } else if (diff < 0 || currentScrollY <= 50) {
                        // Scroll hacia arriba - mostrar header/search bar, ocultar bottom menu
                        if (scrollDirection.current !== 'up') {
                            scrollDirection.current = 'up';
                            Animated.parallel([
                                Animated.timing(headerHeight, {
                                    toValue: 1,
                                    duration: 400,
                                    useNativeDriver: false,
                                }),
                                Animated.timing(searchBarHeight, {
                                    toValue: 1,
                                    duration: 400,
                                    useNativeDriver: false,
                                }),
                                Animated.timing(bottomMenuHeight, {
                                    toValue: 0,
                                    duration: 400,
                                    useNativeDriver: false,
                                })
                            ]).start();
                        }
                    }
                    lastScrollY.current = currentScrollY;
                }
            }
        }
    );

    // const toggleModal = () => {
    //     // Filtrar y mantener las cantidades solo de los estados seleccionados
    //     const filteredCounts = {};
    //     selectedEstados.forEach((estadoId) => {
    //         filteredCounts[estadoId] = estadoCounts[estadoId] || 0;
    //     });
    //     setEstadoCounts(filteredCounts);
    //     setModalVisible(!isModalVisible);
    // };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };


    const toggleEstado = (estadoId) => {
        setSelectedEstados((prevEstados) =>
            prevEstados.includes(estadoId)
                ? prevEstados.filter((id) => id !== estadoId) // Eliminar si ya está seleccionado
                : [...prevEstados, estadoId] // Agregar si no está seleccionado
        );
    };

    useEffect(() => {
        const obtenerIspId = async () => {
            try {
                // Recuperar el valor utilizando la clave correcta
                const id = await AsyncStorage.getItem('@selectedIspId');
    
                if (id !== null) {
                    console.log('✅ ID de ISP recuperado de AsyncStorage:', id);
                    setIspId(id); // Actualiza el estado con el ID recuperado
                } else {
                    console.log('⚠️ No se encontró ningún ID de ISP en AsyncStorage.');
                    setIspId('No ID');
                }
            } catch (error) {
                console.error('❌ Error al recuperar el ID del ISP desde AsyncStorage:', error);
            }
        };
    
        obtenerIspId();
    }, []);
    

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
                if (userData) {
                    setNombreUsuario(userData.nombre);
                    setUsuarioId(userData.id);
                }
            } catch (e) {
                console.error('Error al leer el nombre del usuario', e);
            }
        };

        obtenerDatosUsuario();
    }, []);

    useEffect(() => {
        if (usuarioId) {
            registrarNavegacion(); // Registrar la navegación cuando el usuario ID esté disponible
            // fetchClientList();
            console.log('ID de usuario:', usuarioId);
            console.log('Lista de clientes:', clientList);
        }
    }, [usuarioId]);

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
                pantalla: 'ClientListScreen',
                datos: JSON.stringify({ isDarkMode }), // No registrar la lista, solo el modo oscuro/claro
            };

            const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logData),
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Error al registrar la navegación');
            }
            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    const fetchClientList = async () => {

        if (!usuarioId || !ispId || ispId === 'No ID') {
            console.log('⏳ fetchClientList pospuesto: faltan IDs', { usuarioId, ispId });
            return;
        }

        console.log('ID de usuario enviado al servidor:', usuarioId);
        console.log('ID de ISP enviado al servidor:', ispId);

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/lista-clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Enviar ambas claves por compatibilidad y parámetros de paginación
                body: JSON.stringify({
                    usuarioId,
                    isp_id: ispId,
                    id_isp: ispId,
                    limite: PAGE_SIZE,
                    limit: PAGE_SIZE,
                    offset: 0,
                })
            });

            if (!response.ok) {
                throw new Error('Error al obtener datos de clientes');
            }

            const data = await response.json();

            if (data && data.clientes && Array.isArray(data.clientes)) {
                // Debug logs removidos - datos identificados correctamente
                
                const sortedClients = data.clientes.sort((a, b) => Number(b.id_cliente) - Number(a.id_cliente));
                setClientList(sortedClients);
                setOffset(sortedClients.length); // preparar próximo offset
                console.log('Cantidad de clientes consultados: ' + data.cantidad);
                setClientCount(data.cantidad);
                setFilteredClientCount(data.cantidad); // Inicialmente, todos los clientes están visibles

                // Guardar los conteos de estados en el estado (opcional)
                setEstadoCounts(data.estados);

                // Mostrar en consola las cantidades de los estados
                console.log('Conteo de estados:', data.estados);

                // Si quieres mostrar los nombres de los estados
                const estadoNombres = {
                    '1': 'Pendiente',
                    '3': 'Activado',
                    '4': 'Suspendido',
                    '5': 'Baja voluntaria',
                    '6': 'Baja forzada',
                    '7': 'Avería',
                };

                console.log('Detalle de conteo por estados:');
                for (const [estadoId, cantidad] of Object.entries(data.estados)) {
                    const nombreEstado = estadoNombres[estadoId] || 'Desconocido';
                    console.log(`${nombreEstado} (${estadoId}): ${cantidad}`);
                }

            } else {
                throw new Error('Formato de datos incorrecto');
            }
        } catch (error) {
            console.error('Error al cargar la lista de clientes:', error);
            Alert.alert('Error', 'No se pudo cargar la lista de clientes.');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (usuarioId && ispId && ispId !== 'No ID') {
                fetchClientList();
            }
            return () => { };
        }, [usuarioId, ispId])
    );

    const handleAddClient = () => {
        navigation.navigate('AddClientScreen');
    };

    const deleteClient = async (clientId) => {
        Alert.alert(
            "Confirmar eliminación",
            "¿Estás seguro de que quieres eliminar este cliente?",
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Cancelado"),
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            const deleteData = { id_cliente: clientId, usuarioId: usuarioId };
                            console.log('Enviando datos al servidor para eliminar cliente:', deleteData);

                            const response = await fetch('https://wellnet-rd.com:444/api/borrar-cliente', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(deleteData)
                            });

                            if (!response.ok) {
                                throw new Error('No se pudo eliminar el cliente');
                            }

                            setClientList(currentClientList => currentClientList.filter(client => client.id_cliente !== clientId));

                            Alert.alert('Eliminado', 'El cliente se eliminó correctamente.');
                        } catch (error) {
                            console.error('Error al eliminar el cliente:', error);
                            Alert.alert('Error', 'No se pudo eliminar el cliente.');
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Formatear fecha estilo República Dominicana (completa)
    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'N/A';
        
        try {
            const meses = [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
            ];
        
            const fecha = new Date(fechaISO);
            if (isNaN(fecha.getTime())) return 'Fecha inválida';
        
            const dia = fecha.getDate();
            const mes = meses[fecha.getMonth()];
            const año = fecha.getFullYear();
        
            let horas = fecha.getHours();
            const minutos = fecha.getMinutes().toString().padStart(2, '0');
            const periodo = horas >= 12 ? 'PM' : 'AM';
            horas = horas % 12 || 12;
        
            return `${dia} de ${mes} del ${año} a las ${horas}:${minutos} ${periodo}`;
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha inválida';
        }
    };

    // Formatear fecha corta para conexiones
    const formatearFechaCorta = (fechaISO) => {
        if (!fechaISO) return 'N/A';
        
        try {
            const fecha = new Date(fechaISO);
            if (isNaN(fecha.getTime())) return 'Fecha inválida';
            
            const dia = fecha.getDate().toString().padStart(2, '0');
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
            const año = fecha.getFullYear();
            
            return `${dia}/${mes}/${año}`;
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    // Formatear fecha con información adicional
    const formatearFechaDetallada = (fechaISO) => {
        if (!fechaISO) return 'N/A';
        
        try {
            const fecha = new Date(fechaISO);
            if (isNaN(fecha.getTime())) return 'Fecha inválida';
            
            const ahora = new Date();
            const diferencia = ahora - fecha;
            const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
            const años = Math.floor(dias / 365);
            const meses = Math.floor((dias % 365) / 30);
            
            const dia = fecha.getDate().toString().padStart(2, '0');
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
            const año = fecha.getFullYear();
            
            let tiempo = '';
            if (años > 0) {
                tiempo = `(${años} año${años > 1 ? 's' : ''})`;
            } else if (meses > 0) {
                tiempo = `(${meses} mes${meses > 1 ? 'es' : ''})`;
            } else if (dias > 0) {
                tiempo = `(${dias} día${dias > 1 ? 's' : ''})`;
            } else {
                tiempo = '(Hoy)';
            }
            
            return `${dia}/${mes}/${año} ${tiempo}`;
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    // Función para normalizar texto (eliminar acentos y espacios extra)
    const normalizeText = (text) => {
        if (!text) return '';
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
            .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
            .trim();
    };

    // Filtrar todos los clientes
    const allFilteredClients = useMemo(() => {
        if (clientList.length === 0) return [];

        const filtered = clientList.filter((client) => {
            const query = normalizeText(searchQuery);

            // Si no hay búsqueda, pasar al filtro de estados
            if (!query) {
                // Filtrar por estados seleccionados
                const matchesEstados =
                    selectedEstados.length === 0 ||
                    (client.conexiones && client.conexiones.length > 0 &&
                        client.conexiones.some((conexion) =>
                            selectedEstados.includes(conexion.id_estado_conexion)
                        ));
                return matchesEstados;
            }

            // Construir nombre completo normalizado
            const nombreCompleto = normalizeText(`${client.nombres || ''} ${client.apellidos || ''}`);
            const nombresNormalizado = normalizeText(client.nombres);
            const apellidosNormalizado = normalizeText(client.apellidos);
            const cedulaNormalizada = normalizeText(client.cedula);

            // Filtrar por texto de búsqueda con lógica mejorada
            const matchesSearchQuery =
                nombreCompleto.includes(query) || // Buscar en nombre completo
                nombresNormalizado.includes(query) || // Buscar en nombres
                apellidosNormalizado.includes(query) || // Buscar en apellidos
                client.id_cliente.toString().includes(searchQuery) || // ID sin normalizar
                cedulaNormalizada.includes(query) ||
                (client.telefono1 && client.telefono1.includes(searchQuery)) || // Teléfono sin normalizar
                (client.telefono2 && client.telefono2.includes(searchQuery)) ||
                (client.email && normalizeText(client.email).includes(query)) ||
                (client.conexiones && client.conexiones.some((conexion) =>
                    conexion.id_conexion.toString().includes(searchQuery) ||
                    (conexion.direccion_ip && conexion.direccion_ip.toLowerCase().includes(searchQuery)) ||
                    (conexion.direccion && normalizeText(conexion.direccion).includes(query))
                ));

            // Filtrar por estados seleccionados
            const matchesEstados =
                selectedEstados.length === 0 || // Si no hay estados seleccionados, mostrar TODOS los clientes
                (client.conexiones && client.conexiones.length > 0 &&
                    client.conexiones.some((conexion) =>
                        selectedEstados.includes(conexion.id_estado_conexion) // Coincidir con el ID de estado
                    ));

            return matchesSearchQuery && matchesEstados;
        });

        // Actualizar cantidad filtrada total
        setFilteredClientCount(filtered.length);
        
        // Debug logs removidos - estructura de datos identificada
        
        return filtered;
    }, [clientList, searchQuery, selectedEstados]);

    // Los clientes filtrados son TODOS los que pasan los filtros (sin límite de visualización)
    const filteredClients = allFilteredClients;

    // Cargar más: primero intenta traer del backend; si ya tenemos todos, expande la ventana local
    const fetchMoreClients = useCallback(async () => {
        if (!usuarioId || !ispId || ispId === 'No ID') return;
        if (clientList.length >= clientCount) return;
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/lista-clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId,
                    isp_id: ispId,
                    id_isp: ispId,
                    limite: PAGE_SIZE,
                    limit: PAGE_SIZE,
                    offset,
                }),
            });
            if (!response.ok) throw new Error('Error al paginar clientes');
            const data = await response.json();
            const newItems = (data?.clientes || []).sort((a, b) => Number(b.id_cliente) - Number(a.id_cliente));
            if (newItems.length > 0) {
                const existingIds = new Set(clientList.map(c => c.id_cliente));
                const deduped = newItems.filter(c => !existingIds.has(c.id_cliente));
                setClientList(prev => [...prev, ...deduped]);
                setOffset(offset + newItems.length);
            }
        } catch (e) {
            console.error('Error al cargar más clientes:', e);
        }
    }, [usuarioId, ispId, clientList, clientCount, offset]);

    const loadMoreClients = useCallback(() => {
        if (clientList.length < clientCount) {
            fetchMoreClients();
        }
    }, [clientList.length, clientCount, fetchMoreClients]);

    // Función estable para manejar cambios en la búsqueda
    const handleSearchChange = useCallback((text) => {
        setSearchQuery(text);
    }, []);

    // Función para manejar exportación de clientes
    const handleExportClients = useCallback(() => {
        console.log('Exportando clientes...', { 
            total_clientes: filteredClients.length,
            filtros_activos: selectedEstados.length 
        });
        alert(`Exportando ${filteredClients.length} clientes`);
    }, [filteredClients.length, selectedEstados.length]);

    // Función para manejar colapso/expansión de items
    const toggleItemExpansion = (itemId) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    // Botones del menú horizontal
    const botones = useMemo(() => [
        { id: '1', title: 'Menú', action: () => setMenuVisible(true), icon: 'menu' },
        { id: '2', title: '|' },
        { id: '3', title: 'Buscar', action: () => toggleModal(), icon: 'filter-list' },
        { id: '4', title: '|' },
        { id: '5', title: 'Nuevo Cliente', action: handleAddClient, icon: 'person-add' },
        { id: '6', title: '|' },
        { id: '7', title: 'Exportar', action: handleExportClients, icon: 'download' },
    ], [handleAddClient, handleExportClients]);

    const estadoOptions = [
        { id: 1, label: 'Pendiente' },
        { id: 3, label: 'Activado' },
        { id: 4, label: 'Suspendido' },
        { id: 5, label: 'Baja volutaria' },
        { id: 6, label: 'Baja forzada' },
        { id: 7, label: 'Averia' },
    ];

    const ClientItem = React.memo(({ item, isExpanded, toggleExpansion }) => {
        
        // Debug: Verificar si existe el campo balance
        React.useEffect(() => {
            console.log(`💰 CLIENTE ID ${item.id_cliente} - Balance:`, {
                balance: item.balance,
                balance_type: typeof item.balance,
                all_fields: Object.keys(item)
            });
        }, [item.id_cliente]);

        // Fecha del cliente confirmada: fecha_creacion_cliente

        const getEstadoColor = (id_estado_conexion) => {
            switch (id_estado_conexion) {
                case 1:
                    return { backgroundColor: '#FEF3C7', color: '#D97706' }; // Pendiente - Amarillo
                case 3:
                    return { backgroundColor: '#D1FAE5', color: '#047857' }; // Activado - Verde
                case 4:
                    return { backgroundColor: '#FEE2E2', color: '#DC2626' }; // Suspendido - Rojo
                case 5:
                case 6:
                    return { backgroundColor: '#F1F5F9', color: '#64748B' }; // Baja - Gris
                case 7:
                case 8:
                    return { backgroundColor: '#FEE2E2', color: '#DC2626' }; // Avería - Rojo
                default:
                    return { backgroundColor: '#F1F5F9', color: '#64748B' };
            }
        };

        const handleCardPress = () => {
            navigation.navigate('ClientDetailsScreen', { clientId: item.id_cliente });
        };

        const handleExpandToggle = (e) => {
            e.stopPropagation(); // Prevent card navigation when tapping expand button
            toggleExpansion();
        };

        const addressInfo = useMemo(() => buildAddressInfo(item.direccion, item.referencia), [item.direccion, item.referencia]);
        const direccionPrincipal = addressInfo.principal || addressInfo.original;
        const referenciaDireccion = addressInfo.referencia;
        const gpsDireccion = addressInfo.gps;
        const mostrarDireccion = direccionPrincipal !== '' || Boolean(referenciaDireccion) || Boolean(gpsDireccion);

        return (
            <TouchableOpacity 
                style={styles.clientCard}
                onPress={handleCardPress}
                activeOpacity={0.7}
            >
                {/* Header - Always visible */}
                <View style={styles.clientHeader}>
                    <View style={styles.clientHeaderLeft}>
                        <View style={styles.clientIconContainer}>
                            <Icon name="person" size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.clientHeaderContent}>
                            <Text style={styles.clientName}>
                                {item.nombres} {item.apellidos}
                            </Text>
                            <Text style={styles.clientId}>
                                ID: {item.id_cliente}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.expandButton, isExpanded && styles.expandButtonActive]} 
                        onPress={handleExpandToggle}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={0.7}
                    >
                        <Icon 
                            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                            size={20} 
                            color={isExpanded ? "#FFFFFF" : (isDarkMode ? colors.gray[300] : colors.gray[600])} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Compact info - Always visible */}
                <View style={styles.compactInfo}>
                    {item.telefono1 && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>📞 Teléfono:</Text>
                            <Text style={styles.detailPhone}>{item.telefono1}</Text>
                        </View>
                    )}
                    {item.balance !== undefined && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>💰 Balance:</Text>
                            <Text style={[styles.detailBalance, { color: item.balance >= 0 ? '#10B981' : '#EF4444' }]}>
                                RD${Number(item.balance).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    )}
                    {item.conexiones && item.conexiones.length > 0 && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>🔌 Conexiones:</Text>
                            <Text style={styles.detailValue}>{item.conexiones.length}</Text>
                        </View>
                    )}
                </View>
                
                {/* Expanded details - Only visible when expanded */}
                {isExpanded && (
                    <>
                        <View style={styles.clientDetails}>

                            {item.telefono2 && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>📱 Tel. 2:</Text>
                                    <Text style={styles.detailPhone}>{item.telefono2}</Text>
                                </View>
                            )}
                            {item.cedula && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>🆔 Cédula:</Text>
                                    <Text style={styles.detailValue}>{item.cedula}</Text>
                                </View>
                            )}
                            {item.email && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>📧 Email:</Text>
                                    <Text style={styles.detailEmail}>{item.email}</Text>
                                </View>
                            )}
                            {mostrarDireccion && (
                                <View style={[styles.detailRow, styles.detailRowFull]}>
                                    <Text style={styles.detailLabel}>🏠 Dirección:</Text>
                                    {direccionPrincipal !== '' && (
                                        <Text style={[styles.detailValue, styles.detailValueFull]}>{direccionPrincipal}</Text>
                                    )}
                                    {(referenciaDireccion || gpsDireccion) && (
                                        <View style={styles.detailSubList}>
                                            {referenciaDireccion && (
                                                <View style={styles.detailSubItem}>
                                                    <Text style={styles.detailSubLabel}>Referencia</Text>
                                                    <Text style={styles.detailSubValue}>{referenciaDireccion}</Text>
                                                </View>
                                            )}
                                            {gpsDireccion && (
                                                <View style={styles.detailSubItem}>
                                                    <Text style={styles.detailSubLabel}>GPS</Text>
                                                    <Text style={styles.detailSubValue}>{gpsDireccion}</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}
                            {item.fecha_creacion_cliente && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>📅 Cliente desde:</Text>
                                    <Text style={styles.detailDateImportant}>
                                        {formatearFecha(item.fecha_creacion_cliente)}
                                    </Text>
                                </View>
                            )}
                            {item.ultimo_pago && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>💳 Último pago:</Text>
                                    <Text style={styles.detailDate}>{formatearFechaCorta(item.ultimo_pago)}</Text>
                                </View>
                            )}
                            {/* Mostrar estado de cuenta (temporal para debug) */}
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>📊 Estado cuenta:</Text>
                                <Text style={
                                    item.balance !== undefined 
                                        ? (item.balance >= 0 ? styles.detailBalanceAlDia : styles.detailBalancePendiente)
                                        : styles.detailBalanceSinDatos
                                }>
                                    {item.balance !== undefined 
                                        ? (item.balance >= 0 ? '✅ Al día' : '⚠️ Pendiente')
                                        : '❓ Sin datos'
                                    }
                                </Text>
                            </View>
                        </View>

                        {item.conexiones && item.conexiones.length > 0 ? (
                            <View style={styles.connectionsSection}>
                                <Text style={styles.connectionsSectionTitle}>
                                    Conexiones ({item.conexiones.length})
                                </Text>
                                {item.conexiones.map((conexion) => (
                                    <View key={conexion.id_conexion} style={styles.connectionCard}>
                                        <View style={styles.connectionHeader}>
                                            <Text style={styles.connectionId}>
                                                #{conexion.id_conexion}
                                            </Text>
                                            <Text style={[
                                                styles.connectionStatus,
                                                getEstadoColor(conexion.id_estado_conexion)
                                            ]}>
                                                {conexion.estado}
                                            </Text>
                                        </View>
                                        
                                        <View style={styles.connectionDetails}>
                                            <Text style={styles.connectionText} numberOfLines={2}>
                                                📍 {conexion.direccion}
                                            </Text>
                                            
                                            {conexion.direccion_ip && (
                                                <Text style={styles.connectionIp}>
                                                    🌐 IP: {conexion.direccion_ip}
                                                </Text>
                                            )}
                                            
                                            {(conexion.velocidad || conexion.velocidad_bajada || conexion.velocidad_subida) && (
                                                <Text style={styles.connectionSpeed}>
                                                    ⚡ Velocidad: {
                                                        conexion.velocidad_bajada && conexion.velocidad_subida 
                                                            ? `${conexion.velocidad_bajada}/${conexion.velocidad_subida} Mbps`
                                                            : conexion.velocidad 
                                                                ? `${conexion.velocidad} Mbps`
                                                                : 'No especificada'
                                                    }
                                                </Text>
                                            )}
                                            
                                            {conexion.precio && (
                                                <Text style={styles.connectionPrice}>
                                                    💰 Precio: RD${Number(conexion.precio).toLocaleString('es-DO')}
                                                </Text>
                                            )}
                                            
                                            {conexion.nombre_router && (
                                                <Text style={styles.connectionRouter}>
                                                    📡 Router: {conexion.nombre_router}
                                                </Text>
                                            )}
                                            
                                            {conexion.mac_address && (
                                                <Text style={styles.connectionMac}>
                                                    🔧 MAC: {conexion.mac_address}
                                                </Text>
                                            )}
                                            
                                            {conexion.instalador && (
                                                <Text style={styles.connectionTech}>
                                                    👷 Instalador: {conexion.instalador}
                                                </Text>
                                            )}
                                            
                                            {/* Fechas de conexión desde la base de datos */}
                                            {conexion.fecha_contratacion && (
                                                <Text style={styles.connectionDateImportant}>
                                                    📅 Contratado: {formatearFecha(conexion.fecha_contratacion)}
                                                </Text>
                                            )}
                                            
                                            {conexion.fecha_instalacion && (
                                                <Text style={styles.connectionDate}>
                                                    🔧 Instalado: {conexion.fecha_instalacion}
                                                </Text>
                                            )}

                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.noConnectionText}>Sin conexiones</Text>
                        )}

                        {/* Resumen del cliente */}
                        <View style={styles.clientSummary}>
                            {/* Estado de cuenta siempre visible (temporal para debug) */}
                            {/* <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Estado cuenta:</Text>
                                <Text style={
                                    item.balance !== undefined 
                                        ? (item.balance >= 0 ? styles.summaryBalanceAlDia : styles.summaryBalancePendiente)
                                        : styles.summaryBalancePendiente
                                }>
                                    {item.balance !== undefined 
                                        ? (item.balance >= 0 ? '✅ Al día' : '⚠️ Pendiente')
                                        : '❓ Sin datos'
                                    }
                                </Text>
                            </View> */}
                            {item.fecha_creacion_cliente && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Antigüedad:</Text>
                                    <Text style={styles.summaryAntiguedad}>
                                        {(() => {
                                            const fechaOriginal = item.fecha_creacion_cliente;
                                            
                                            const fecha = new Date(fechaOriginal);
                                            const ahora = new Date();
                                            const diferencia = ahora - fecha;
                                            const años = Math.floor(diferencia / (1000 * 60 * 60 * 24 * 365));
                                            const meses = Math.floor((diferencia % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
                                            
                                            if (años > 0) {
                                                return `${años} año${años > 1 ? 's' : ''}${meses > 0 ? ` y ${meses} mes${meses > 1 ? 'es' : ''}` : ''}`;
                                            } else if (meses > 0) {
                                                return `${meses} mes${meses > 1 ? 'es' : ''}`;
                                            } else {
                                                const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
                                                return dias > 0 ? `${dias} día${dias > 1 ? 's' : ''}` : 'Hoy';
                                            }
                                        })()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </TouchableOpacity>
        );
    });

    // Renderizar header de la lista (solo filter chips)
    const renderHeader = useCallback(() => (
        <>
            {/* Filter Chips */}
            {selectedEstados.length > 0 && (
                <View style={styles.filterSummaryContainer}>
                    {selectedEstados.map((estadoId) => {
                        const estado = estadoOptions.find((opt) => opt.id.toString() === estadoId.toString());
                        return (
                            <View key={estadoId} style={styles.filterChip}>
                                <Text style={styles.filterChipText}>
                                    {estado ? estado.label : 'Estado desconocido'}: {estadoCounts[estadoId] || 0}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </>
    ), [selectedEstados, estadoCounts]);

    // Renderizar estado vacío con useCallback
    const renderEmpty = useCallback(() => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Icon name="people" size={40} color={isDarkMode ? '#64748B' : '#94A3B8'} />
            </View>
            <Text style={styles.emptyTitle}>No hay clientes</Text>
            <Text style={styles.emptyMessage}>
                {searchQuery ? 'No se encontraron clientes que coincidan con tu búsqueda.' : 'No hay clientes registrados aún.'}
            </Text>
        </View>
    ), [searchQuery, isDarkMode]);

    // Renderizar item de cliente optimizado
    const renderClientItem = useCallback(({ item }) => (
        <ClientItem 
            item={item} 
            isExpanded={expandedItems.has(item.id_cliente)}
            toggleExpansion={() => toggleItemExpansion(item.id_cliente)}
        />
    ), [expandedItems, toggleItemExpansion]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Modern Header Animado */}
            <Animated.View style={[
                styles.headerContainer,
                {
                    height: headerHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width < 400 ? 80 : 100], // Altura dinámica según tamaño
                    }),
                    opacity: headerHeight.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.5, 1],
                    }),
                    transform: [{
                        translateY: headerHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -80 : -100, 0],
                        }),
                    }],
                }
            ]}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Clientes</Text>
                        {/* <Text style={styles.headerSubtitle}>
                            Mostrando {filteredClients.length} de {clientCount || clientList.length} clientes
                        </Text> */}
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.filterButton} onPress={toggleModal}>
                            <Icon name="filter-list" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            {/* Search Section Animada */}
            <Animated.View style={[
                styles.searchContainer,
                {
                    opacity: searchBarHeight.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.5, 1],
                    }),
                    transform: [
                        {
                            translateY: searchBarHeight.interpolate({
                                inputRange: [0, 1],
                                outputRange: [width < 400 ? -80 : -100, 0],
                            }),
                        },
                        {
                            scaleY: searchBarHeight.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                            }),
                        },
                    ],
                }
            ]}>
                <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder="Buscar por nombre, cédula, teléfono, ID..."
                    placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    clearButtonMode="while-editing"
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="default"
                    returnKeyType="search"
                    blurOnSubmit={false}
                    enablesReturnKeyAutomatically={false}
                />
            </Animated.View>

            {/* Single optimized FlatList */}
            <Animated.View style={[
                { flex: 1 },
                {
                    marginTop: Animated.add(
                        headerHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -80 : -100, 0],
                        }),
                        searchBarHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -56 : -64, 0],
                        })
                    ),
                    marginBottom: bottomMenuHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-80, 0], // Espacio negativo cuando menú está oculto para eliminar el espacio
                    }),
                }
            ]}>
                <FlatList
                    style={{ flex: 1 }}
                    data={filteredClients}
                    keyExtractor={(item, index) => `client-${item.id_cliente || index}`}
                    renderItem={renderClientItem}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={() => (
                        (clientList.length < clientCount) ? (
                            <TouchableOpacity
                                style={styles.loadMoreButton}
                                onPress={loadMoreClients}
                            >
                                <Text style={styles.loadMoreText}>
                                    Cargar más clientes ({Math.max(clientCount - clientList.length, 0)} restantes)
                                </Text>
                            </TouchableOpacity>
                        ) : null
                        // : filteredClients.length > 0 ? (
                        //     <Text style={styles.endOfListText}>
                        //         Mostrando todos los {clientCount || filteredClients.length} clientes
                        //     </Text>
                        // ) : null
                    )}
                    contentContainerStyle={{ 
                        paddingHorizontal: 16, 
                        paddingTop: 8, 
                        paddingBottom: 40 // Padding fijo, el espacio se maneja con marginBottom
                    }}
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                    alwaysBounceVertical={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    getItemLayout={null}
                    removeClippedSubviews={false}
                    maxToRenderPerBatch={10}
                    windowSize={21}
                    initialNumToRender={10}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />
            </Animated.View>

            <TouchableOpacity style={fabStyles.fab} onPress={handleAddClient}>
                <Icon name="person-add" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* HorizontalMenu Animado */}
            <Animated.View style={[
                {
                    opacity: bottomMenuHeight.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.5, 1],
                    }),
                    transform: [{
                        translateY: bottomMenuHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [100, 0], // Se mueve hacia abajo cuando se oculta
                        }),
                    }],
                }
            ]}>
                <HorizontalMenu 
                    botones={botones} 
                    navigation={navigation} 
                    isDarkMode={isDarkMode} 
                />
            </Animated.View>

            {/* MenuModal */}
            <MenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                menuItems={[
                    { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
                    { title: 'Perfil', action: () => navigation.navigate('ProfileScreen') },
                    { title: 'Configuración', action: () => navigation.navigate('SettingsScreen') },
                    { title: 'Cerrar Sesión', action: () => console.log('Cerrando sesión') },
                ]}
                isDarkMode={isDarkMode}
                onItemPress={(item) => {
                    item.action();
                    setMenuVisible(false);
                }}
            />

            {/* Filter Modal */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={toggleModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <Icon name="filter-list" size={32} color="#FFFFFF" />
                            </View>
                            <Text style={styles.modalTitle}>Filtros de Estado</Text>
                            <Text style={styles.modalText}>
                                Selecciona los estados de conexión que deseas ver
                            </Text>
                        </View>

                        <FlatList
                            data={estadoOptions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.filterOption,
                                        selectedEstados.includes(item.id) && styles.filterOptionSelected
                                    ]}
                                    onPress={() => toggleEstado(item.id)}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            selectedEstados.includes(item.id) && styles.checkboxSelected,
                                        ]}
                                    >
                                        {selectedEstados.includes(item.id) && (
                                            <Text style={styles.checkboxCheck}>✓</Text>
                                        )}
                                    </View>
                                    <Text style={styles.filterOptionText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                            style={{ maxHeight: 300 }}
                        />
                        
                        <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
                            <Text style={styles.modalButtonText}>Aplicar Filtros</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ClientListScreen;
