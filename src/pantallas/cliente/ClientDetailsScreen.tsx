import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Alert, View, Text, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import fetchUserData from '../funciones/solicitudes_backend/Solicitudes';
import { useIsFocused } from '@react-navigation/native';
import { getStyles } from './ClientDetailsScreenStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HorizontalMenu from '../../componentes/HorizontalMenu';
import MenuModal from '../../componentes/MenuModal';

const ClientDetailsScreen = ({ route, navigation }) => {
    console.log('🔍 ClientDetailsScreen - route.params:', route.params);
    const { clientId } = route.params;
    console.log('🔍 ClientDetailsScreen - clientId extraído:', clientId);
    const { isDarkMode } = useTheme();
    const { width } = Dimensions.get('window');
    const styles = getStyles(isDarkMode);
    const [clientDetails, setClientDetails] = useState(null);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [usuarioId, setUsuarioId] = useState(null);
    const [ispId, setIspId] = useState('');
    const [conexiones, setConexiones] = useState([]);
    const [expandedItems, setExpandedItems] = useState(new Set()); // Track which items are expanded
    const [menuVisible, setMenuVisible] = useState(false);

    // Estados para animación de header y menu
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerHeight = useRef(new Animated.Value(1)).current;
    const menuHeight = useRef(new Animated.Value(1)).current;
    const lastScrollY = useRef(0);
    const isHidden = useRef(false);
    const isAnimating = useRef(false);

    // Función para manejar el scroll y animación del header y menu
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;
                
                // Evitar animaciones si ya hay una en curso
                if (isAnimating.current) return;
                
                if (Math.abs(diff) > 15 && currentScrollY > 50) {
                    if (diff > 0 && !isHidden.current) {
                        // Scroll hacia arriba - ocultar
                        isHidden.current = true;
                        isAnimating.current = true;
                        
                        Animated.parallel([
                            Animated.timing(headerHeight, {
                                toValue: 0,
                                duration: 200,
                                useNativeDriver: false,
                            }),
                            Animated.timing(menuHeight, {
                                toValue: 0,
                                duration: 200,
                                useNativeDriver: false,
                            })
                        ]).start(() => {
                            isAnimating.current = false;
                        });
                    } else if (diff < 0 && isHidden.current) {
                        // Scroll hacia abajo - mostrar
                        isHidden.current = false;
                        isAnimating.current = true;
                        
                        Animated.parallel([
                            Animated.timing(headerHeight, {
                                toValue: 1,
                                duration: 200,
                                useNativeDriver: false,
                            }),
                            Animated.timing(menuHeight, {
                                toValue: 1,
                                duration: 200,
                                useNativeDriver: false,
                            })
                        ]).start(() => {
                            isAnimating.current = false;
                        });
                    }
                }
                lastScrollY.current = currentScrollY;
            }
        }
    );

    const isFocused = useIsFocused();

    // Funciones para el menú horizontal
    const handleEditClient = () => {
        Alert.alert('Función en desarrollo', 'La edición de cliente estará disponible pronto');
    };

    const handleDeleteClient = () => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar este cliente?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => {
                    Alert.alert('Función en desarrollo', 'La eliminación de cliente estará disponible pronto');
                }}
            ]
        );
    };

    const handleBackToClients = () => {
        navigation.goBack();
    };

    // Botones del menú horizontal
    const botones = useMemo(() => [
        { id: '1', title: 'Menú', action: () => setMenuVisible(true), icon: 'menu' },
        { id: '2', title: '|' },
        { id: '3', title: 'Volver', action: handleBackToClients, icon: 'arrow-back' },
        { id: '4', title: '|' },
        { id: '5', title: 'Editar', action: handleEditClient, icon: 'edit' },
        { id: '6', title: '|' },
        { id: '7', title: 'Eliminar', action: handleDeleteClient, icon: 'delete' },
    ], [handleEditClient, handleDeleteClient, handleBackToClients]);

    useEffect(() => {
        if (isFocused) {
            fetchClientDetails();
        }
    }, [isFocused]);


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
                console.error('Error al leer los datos del usuario', e);
            }
        };

        // const obtenerIspId = async () => {
        //     try {
        //         const id = await AsyncStorage.getItem('ispId');
        //         if (id) {
        //             console.log('ISP ID obtenido:', id);
        //             setIspId(id);
        //         } else {
        //             console.log('No se encontró ISP ID en el almacenamiento.');
        //             setIspId('No ID');
        //         }
        //     } catch (error) {
        //         console.error('Error al recuperar el ID del ISP', error);
        //     }
        // };

        obtenerDatosUsuario();
        // obtenerIspId();
    }, []);

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
        if (ispId && clientId) {
            fetchClientDetails();
        }
    }, [ispId, clientId]);

    useEffect(() => {
        if (clientDetails && usuarioId) {
            registrarNavegacion(); // Registrar la navegación cuando se tengan los detalles del cliente y el usuario ID
        }
    }, [clientDetails, usuarioId]);

    const fetchClientDetails = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/cliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_cliente: clientId })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch client details');
            }

            const details = await response.json();
            setClientDetails(details);
            fetchConexiones();
        } catch (error) {
            console.error('Error fetching client details:', error);
        }
    };

    const fetchConexiones = async () => {
        console.log('Realizando solicitud de conexiones con:', { clientId, ispId });

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/conexiones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_cliente: clientId, id_isp: ispId })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch conexiones');
            }

            const conexionData = await response.json();
            if (!conexionData || conexionData.length === 0) {
                console.log('No hay conexiones disponibles.');
                setConexiones([]);
            } else {
                console.log('Conexiones recibidas:', conexionData);
                setConexiones(conexionData);
            }

        } catch (error) {
            console.error('Error fetching conexiones:', error);
        }
    };

    const registrarNavegacion = async () => {
        if (!usuarioId || !clientDetails) return;

        try {
            const fechaActual = new Date();
            const fecha = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const hora = fechaActual.toTimeString().split(' ')[0]; // Formato HH:mm:ss

            const logData = {
                id_usuario: usuarioId,
                fecha,
                hora,
                pantalla: 'ClientDetailsScreen',
                datos: JSON.stringify({
                    clienteId: clientDetails.id_cliente,
                    nombres: clientDetails.nombres,
                    apellidos: clientDetails.apellidos,
                    telefono1: clientDetails.telefono1,
                    telefono2: clientDetails.telefono2,
                    direccion: clientDetails.direccion,
                    rnc: clientDetails.rnc,
                    correo_elect: clientDetails.correo_elect,
                    cedula: clientDetails.cedula,
                    pasaporte: clientDetails.pasaporte,
                    referencia: clientDetails.referencia,
                    activo: clientDetails.activo,
                    fecha_creacion_cliente: clientDetails.fecha_creacion_cliente,
                    conexiones,  // Aquí se incluye la lista de conexiones
                }),
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

    const handleAddService = () => {
        navigation.navigate('AsignacionServicioClienteScreen', {
            clientId,
            userId: usuarioId,
            ispId
        });
    };

    // const handleEditClient = () => {
    //     navigation.navigate('AddClientScreen', { clienteId: clientId });
    // };

    if (!clientDetails) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#3B82F6'} />
                <Text style={styles.loadingText}>Cargando detalles...</Text>
            </View>
        );
    }

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const formattedFechaCreacion = (fecha) => {
        const fechaObj = new Date(fecha);
        const dia = fechaObj.getDate().toString().padStart(2, '0');
        const mes = meses[fechaObj.getMonth()];
        const anio = fechaObj.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

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

    const renderItem = ({ item }) => {
        const formattedDate = formattedFechaCreacion(item.fecha_contratacion);
        const isExpanded = expandedItems.has(item.id_conexion);

        const handleRemove = (item) => {
            Alert.alert(
                "Quitar Asignación de Servicio",
                "¿Estás seguro de que quieres quitar la asignación de este servicio?",
                [
                    {
                        text: "Cancelar",
                        style: "cancel"
                    },
                    {
                        text: "Confirmar",
                        onPress: () => removeAssignment(item)
                    }
                ],
                { cancelable: false }
            );
        };

        const removeAssignment = async (item) => {
            console.log("Eliminar conexión:", item.id_conexion);
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/conexiones/quitar-asignacion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_conexion: item.id_conexion
                    })
                });

                if (!response.ok) {
                    throw new Error('Fallo al quitar la asignación de la conexión');
                }

                alert('Asignación de servicio quitada correctamente.');
                setConexiones(conexiones.filter(conn => conn.id_conexion !== item.id_conexion));
            } catch (error) {
                console.error('Error al quitar la asignación de la conexión:', error);
                alert('Error al quitar la asignación de la conexión.');
            }
        };

        const handleEdit = (item) => {
            console.log("Editar conexión:", item.id_conexion);
            navigation.navigate('AsignacionServicioClienteScreen', {
                isEditMode: true,
                serviceId: item.id_conexion,
                ispId
            });
        };

        const handleCardPress = () => {
            navigation.navigate('ConexionDetalles', { connectionId: item.id_conexion, usuarioId });
        };

        const handleExpandToggle = (e) => {
            e.stopPropagation(); // Prevent card navigation when tapping expand button
            toggleItemExpansion(item.id_conexion);
        };

        return (
            <TouchableOpacity 
                style={styles.connectionCard}
                onPress={handleCardPress}
                activeOpacity={0.7}
            >
                {/* Header - Always visible */}
                <View style={styles.connectionHeader}>
                    <View style={styles.connectionHeaderLeft}>
                        <Text style={styles.connectionTitle}>{item.detallesServicio?.nombre_servicio || 'Servicio'}</Text>
                        <Text style={[
                            styles.connectionStatus,
                            item.estadoConexion?.estado === 'Activo' ? styles.connectionStatusActive : styles.connectionStatusInactive
                        ]}>
                            {item.estadoConexion?.estado || 'N/A'}
                        </Text>
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
                            color={isExpanded ? "#FFFFFF" : (isDarkMode ? '#9CA3AF' : '#6B7280')} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Compact info - Always visible */}
                <View style={styles.compactInfo}>
                    <View style={styles.connectionDetailRow}>
                        <Text style={styles.connectionDetailLabel}>ID:</Text>
                        <Text style={styles.connectionDetailValue}>{item.id_conexion || 'N/A'}</Text>
                    </View>
                    <View style={styles.connectionDetailRow}>
                        <Text style={styles.connectionDetailLabel}>Dirección:</Text>
                        <Text style={styles.connectionDetailAddress} numberOfLines={1} ellipsizeMode="tail">
                            {item.direccion || 'N/A'}
                        </Text>
                    </View>
                </View>
                
                {/* Expanded details - Only visible when expanded */}
                {isExpanded && (
                    <>
                        <View style={styles.connectionDetails}>
                            <View style={styles.connectionDetailRow}>
                                <Text style={styles.connectionDetailLabel}>Precio Mensual</Text>
                                <Text style={styles.connectionDetailPrice}>{formatCurrency(item.detallesServicio?.precio_servicio) || 'N/A'}</Text>
                            </View>
                            
                            <View style={styles.connectionDetailRow}>
                                <Text style={styles.connectionDetailLabel}>Precio Instalación</Text>
                                <Text style={styles.connectionDetailPrice}>{formatCurrency(item.precio) || 'N/A'}</Text>
                            </View>
                            
                            <View style={styles.connectionDetailRow}>
                                <Text style={styles.connectionDetailLabel}>Contratación</Text>
                                <Text style={styles.connectionDetailDate}>{formattedDate || 'N/A'}</Text>
                            </View>
                            
                            {item.detallesServicio?.descripcion_servicio && (
                                <View style={styles.connectionDetailRow}>
                                    <Text style={styles.connectionDetailLabel}>Descripción</Text>
                                    <Text style={styles.connectionDetailValue}>{item.detallesServicio.descripcion_servicio}</Text>
                                </View>
                            )}
                        </View>
                        
                        <View style={styles.connectionButtonsContainer}>
                            <TouchableOpacity 
                                style={[styles.connectionButton, styles.connectionEditButton]} 
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleEdit(item);
                                }}
                            >
                                <Text style={styles.connectionButtonText}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.connectionButton, styles.connectionDeleteButton]} 
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleRemove(item);
                                }}
                            >
                                <Text style={styles.connectionButtonText}>Quitar</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </TouchableOpacity>
        );
    };

    const getClientInitials = () => {
        const firstName = clientDetails.nombres?.charAt(0) || '';
        const lastName = clientDetails.apellidos?.charAt(0) || '';
        return (firstName + lastName).toUpperCase();
    };

    const ClientDetailsHeader = () => (
        <View style={styles.clientInfoContainer}>
            <View style={styles.clientHeader}>
                <View style={styles.clientAvatar}>
                    <Text style={styles.clientAvatarText}>{getClientInitials()}</Text>
                </View>
                <View style={styles.clientHeaderInfo}>
                    <Text style={styles.clientName}>
                        {clientDetails.nombres} {clientDetails.apellidos}
                    </Text>
                    <Text style={styles.clientId}>ID: {clientDetails.id_cliente}</Text>
                    {/* <Text style={[
                        styles.clientStatus,
                        clientDetails.activo === 'Si' ? styles.clientStatusActive : styles.clientStatusInactive
                    ]}>
                        {clientDetails.activo === 'Si' ? 'Activo' : 'Inactivo'}
                    </Text> */}
                </View>
            </View>
            
            <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Información de Contacto</Text>
                
                {clientDetails.telefono1 && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📞</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Teléfono 1</Text>
                            <Text style={styles.detailValueLink}>{clientDetails.telefono1}</Text>
                        </View>
                    </View>
                )}
                
                {clientDetails.telefono2 && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📱</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Teléfono 2</Text>
                            <Text style={styles.detailValueLink}>{clientDetails.telefono2}</Text>
                        </View>
                    </View>
                )}
                
                {clientDetails.correo_elect && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📧</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Correo Electrónico</Text>
                            <Text style={styles.detailValueLink}>{clientDetails.correo_elect}</Text>
                        </View>
                    </View>
                )}
                
                {clientDetails.direccion && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📍</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Dirección</Text>
                            <Text style={styles.detailValue}>{clientDetails.direccion}</Text>
                        </View>
                    </View>
                )}
                
                {clientDetails.referencia && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>🗺️</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Referencia</Text>
                            <Text style={styles.detailValue}>{clientDetails.referencia}</Text>
                        </View>
                    </View>
                )}
            </View>
            
            <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Documentos de Identidad</Text>
                
                {clientDetails.cedula && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>🆔</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Cédula</Text>
                            <Text style={styles.detailValue}>{clientDetails.cedula}</Text>
                        </View>
                    </View>
                )}
                
                {clientDetails.pasaporte && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>📄</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Pasaporte</Text>
                            <Text style={styles.detailValue}>{clientDetails.pasaporte}</Text>
                        </View>
                    </View>
                )}
                
                {clientDetails.rnc && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Text>🏢</Text>
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>RNC</Text>
                            <Text style={styles.detailValue}>{clientDetails.rnc}</Text>
                        </View>
                    </View>
                )}
                
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>📅</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Cliente desde</Text>
                        <Text style={styles.detailValueDate}>
                            {formattedFechaCreacion(clientDetails.fecha_creacion_cliente)}
                        </Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => navigation.navigate('AddClientScreen', { clienteId: clientId })}
                    activeOpacity={0.8}
                >
                    <Text>✏️</Text>
                    <Text style={styles.actionButtonText}>Editar Cliente</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.actionButton, styles.addServiceButton]} 
                    onPress={handleAddService}
                    activeOpacity={0.8}
                >
                    <Text>➕</Text>
                    <Text style={styles.actionButtonText}>Asignar Servicio</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const BottomButtons = () => (
        <View style={styles.actionsCard}>
            <Text style={styles.connectionsSectionTitle}>Acciones del Cliente</Text>
            <View style={styles.actionsButtonsContainer}>
                <TouchableOpacity 
                    style={styles.newActionButton} 
                    onPress={() => navigation.navigate('ClienteFacturasScreen', { clientId, usuarioId, ispId })}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonIcon}>📄</Text>
                        <Text style={styles.newActionButtonText}>Ver Facturas</Text>
                        <Text style={styles.actionButtonSubtext}>Historial de facturación</Text>
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.newActionButton} 
                    onPress={() => navigation.navigate('Recibos1ClienteScreen', { clientId, usuarioId, ispId })}
                    activeOpacity={0.8}
                >
                    <View style={styles.actionButtonContent}>
                        <Text style={styles.actionButtonIcon}>🧾</Text>
                        <Text style={styles.newActionButtonText}>Ver Recibos</Text>
                        <Text style={styles.actionButtonSubtext}>Historial de pagos</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Menú Horizontal Animado - Encima de la cabecera */}
            <Animated.View style={[
                {
                    height: menuHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width < 400 ? 50 : 60], // Altura dinámica según tamaño
                    }),
                    overflow: 'hidden',
                    transform: [{
                        translateY: menuHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -50 : -60, 0],
                        })
                    }]
                }
            ]}>
                <HorizontalMenu 
                    botones={botones} 
                    navigation={navigation} 
                    isDarkMode={isDarkMode} 
                />
            </Animated.View>

            {/* Header Animado */}
            <Animated.View style={[
                styles.headerContainer,
                {
                    height: headerHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width < 400 ? 60 : 70], // Altura reducida
                    }),
                    opacity: headerHeight.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.5, 1],
                    }),
                    transform: [{
                        translateY: headerHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -60 : -70, 0],
                        }),
                    }],
                }
            ]}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Detalles del Cliente</Text>
                    </View>
                </View>
            </Animated.View>
            
            <Animated.View style={[
                { flex: 1 },
                {
                    marginTop: Animated.add(
                        headerHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -60 : -70, 0],
                        }),
                        menuHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width < 400 ? -50 : -60, 0],
                        })
                    ),
                }
            ]}>
                <ScrollView 
                    style={styles.container} 
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={styles.scrollContent}
                >
                <ClientDetailsHeader />
                
                <View style={styles.connectionsContainer}>
                    <Text style={styles.connectionsSectionTitle}>Conexiones Activas</Text>
                    {conexiones.length > 0 ? (
                        conexiones.map((item) => (
                            <View key={item.id_conexion.toString()}>
                                {renderItem({ item })}
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Text style={{ fontSize: 32 }}>🔌</Text>
                            </View>
                            <Text style={styles.emptyTitle}>No hay conexiones</Text>
                            <Text style={styles.emptyMessage}>
                                Este cliente no tiene conexiones asignadas aún.
                            </Text>
                        </View>
                    )}
                </View>
                
                <BottomButtons />
                
                </ScrollView>
            </Animated.View>

            {/* MenuModal */}
            <MenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                menuItems={[
                    { title: `👤 ${nombreUsuario || 'Usuario'}`, action: () => {}, isUserInfo: true },
                    { title: '——————————————', action: () => {}, isDivider: true },
                    { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
                    { title: 'Clientes', action: () => navigation.navigate('ClientesScreen') },
                    { title: 'Conexiones', action: () => navigation.navigate('ConexionesScreen') },
                    { title: 'Facturación', action: () => navigation.navigate('FacturacionScreen') },
                    { title: 'Reportes', action: () => navigation.navigate('ReportesScreen') },
                ]}
                isDarkMode={isDarkMode}
                onItemPress={(item) => {
                    if (!item.isUserInfo && !item.isDivider) {
                        item.action();
                        setMenuVisible(false);
                    }
                }}
            />
        </View>
    );
};


export default ClientDetailsScreen;
