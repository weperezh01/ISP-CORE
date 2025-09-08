// src/screens/IspDetailsScreen/IspDetailsScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    Dimensions, 
    ScrollView,
    ActivityIndicator,
    Pressable,
    Animated
} from 'react-native';

const { width } = Dimensions.get('window');
import { useTheme } from '../../../ThemeContext';
import HorizontalMenu from '../../componentes/HorizontalMenu';
import MenuModal from '../../componentes/MenuModal';
import getStyles from './IspDetailsStyles';
import ChartSection from './componentes/ChartSection';
import DataTable from './componentes/DataTable';
import { useIspDetails } from './hooks/useIspDetails';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CardButtonLayout from './componentes/renderCard';
import { set } from 'date-fns';

// -----------------------------------------------------------------------------
// Componente para texto parpadeante moderno
// -----------------------------------------------------------------------------
const BlinkingText = ({ text, colorSet, style }) => {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev === 0 ? 1 : 0));
    }, 800); // Cambia cada 800ms para efecto más suave

    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={[style, { color: colorSet[colorIndex] }]}>
      {text}
    </Text>
  );
};

// -----------------------------------------------------------------------------
// Pantalla principal: IspDetailsScreen
// -----------------------------------------------------------------------------
const IspDetailsScreen = ({ route, navigation }) => {
  // 1. Tema e estilos
  const { isDarkMode, toggleTheme } = useTheme();
  const styles = getStyles(isDarkMode);

  // 2. Parámetros de la ruta
  const { isp } = route.params;
//   const ispId = isp.id_isp;
  const [ispId, setIspId] = useState(isp.id_isp);
  const [isp_id, setIsp_id] = useState();

  // 3. useIspDetails para extraer datos y funciones
  const {
    nombreUsuario,
    usuarioId,
    nivelUsuario,
    permisosUsuario,
    id_isp,
    conexionesResumen,
    isOwner,
    tienePermiso,
  } = useIspDetails();

  // 4. Estados locales
  const [menuVisible, setMenuVisible] = useState(false);
  const [orderCounts, setOrderCounts] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [usuarioData, setUsuarioData] = useState([]);
  const [usuarioPermisos, setUsuarioPermisos] = useState([]);
  const [id_usuario, setIdUsuario] = useState();
  const [totalesIsp, setTotalesIsp] = useState({
    totalClientes: 0,
    clientesActivos: 0,
    clientesInactivos: 0,
    totalFacturasVencidas: 0,
    totalFacturasVencidasActivos: 0,
    totalFacturasVencidasInactivos: 0,
  });
  const [isAccountingActive, setIsAccountingActive] = useState(false);

  // 5. Estados para animación de header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef('down');

  // ---------------------------------------------------------------------------
  // Función para manejar el scroll y animación del header
  // ---------------------------------------------------------------------------
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
            // Scroll hacia arriba - ocultar header
            if (scrollDirection.current !== 'up') {
              scrollDirection.current = 'up';
              Animated.timing(headerHeight, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }
          } else if (diff < 0 || currentScrollY <= 50) {
            // Scroll hacia abajo o cerca del top - mostrar header
            if (scrollDirection.current !== 'down') {
              scrollDirection.current = 'down';
              Animated.timing(headerHeight, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }
          }
          lastScrollY.current = currentScrollY;
        }
      }
    }
  );

  // ---------------------------------------------------------------------------
  // useEffect para la hora y debug
  // ---------------------------------------------------------------------------
//   console.log('Fecha y hora actual:', new Date().toLocaleString());
//   console.log('usuarioId:', usuarioId);

  // ---------------------------------------------------------------------------
  // Filtra las conexiones según su estado
  // ---------------------------------------------------------------------------
  const activas = conexionesResumen.filter((item) => Number(item.activas) > 0);
  const suspendidas = conexionesResumen.filter((item) => Number(item.suspendidas) > 0);
  const averiadas = conexionesResumen.filter((item) => Number(item.averiada) > 0);

  // Obtiene la última cantidad de averías
  const lastAveriaCount = averiadas.length > 0
    ? averiadas[averiadas.length - 1].averiada
    : 0;

  // Obtiene la última cantidad de pendientes de instalación
  const pendientesInstalacion = conexionesResumen.filter(
    (item) => Number(item.pendientes_instalacion) > 0
  );
  const lastPendientesCount = pendientesInstalacion.length > 0
    ? pendientesInstalacion[pendientesInstalacion.length - 1].pendientes_instalacion
    : 0;

  // ---------------------------------------------------------------------------
  // Llamada a la API para obtener las órdenes pendientes
  // ---------------------------------------------------------------------------
  const fetchOrderCounts = async (ispId) => {
    try {
      const response = await axios.get(`https://wellnet-rd.com:444/api/ordenes-pendientes/${ispId}`);
      if (response.status === 200) {
        // Suponiendo que "estados" es la clave en la respuesta
        // y retorna algo como: [{ estado: 'Pendiente', cantidad: 5 }, ...]
        return response.data.estados;
      } else {
        console.error('Error al obtener las órdenes:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Error al realizar la petición de órdenes:', error);
      return [];
    }
  };

// ---------------------------------------------------------------------------
// Llamada a la API para obtener las órdenes pendientes
// ---------------------------------------------------------------------------
const totales = async (ispId) => {
    try {
      console.log('🔄 Llamando API totales con ispId:', ispId);
      const response = await axios.get(`https://wellnet-rd.com:444/api/totales-isp/${ispId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);
      console.log('📥 Response data type:', typeof response.data);
      
      // Verificar si la respuesta es HTML en lugar de JSON
      if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
        console.error('❌ API retornó HTML en lugar de JSON. Endpoint posiblemente no existe.');
        console.error('❌ URL llamada:', `https://wellnet-rd.com:444/api/totales-isp/${ispId}`);
        
        // Usar datos de ejemplo o mantener valores por defecto
        setTotalesIsp({
          totalClientes: 0,
          clientesActivos: 0,
          clientesInactivos: 0,
          totalFacturasVencidas: 0,
          totalFacturasVencidasActivos: 0,
          totalFacturasVencidasInactivos: 0,
        });
        return;
      }
      
      if (response.status === 200 && typeof response.data === 'object') {
        const data = response.data;
  
        // Actualiza el estado con los datos recibidos
        setTotalesIsp({
          totalClientes: data.totalClientes || 0,
          clientesActivos: data.clientesActivos || 0,
          clientesInactivos: data.clientesInactivos || 0,
          totalFacturasVencidas: data.totalFacturasVencidas || 0,
          totalFacturasVencidasActivos: data.totalFacturasVencidasActivos || 0,
          totalFacturasVencidasInactivos: data.totalFacturasVencidasInactivos || 0,
        });
  
        console.log('✅ Datos actualizados en estado:', {
          totalClientes: data.totalClientes || 0,
          clientesActivos: data.clientesActivos || 0,
          clientesInactivos: data.clientesInactivos || 0,
          totalFacturasVencidas: data.totalFacturasVencidas || 0,
          totalFacturasVencidasActivos: data.totalFacturasVencidasActivos || 0,
          totalFacturasVencidasInactivos: data.totalFacturasVencidasInactivos || 0,
        });
      } else {
        console.error('❌ Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error al realizar la petición de totales:', error.message);
      console.error('❌ URL que falló:', `https://wellnet-rd.com:444/api/totales-isp/${ispId}`);
      
      // Mantener valores por defecto en caso de error
      setTotalesIsp({
        totalClientes: 0,
        clientesActivos: 0,
        clientesInactivos: 0,
        totalFacturasVencidas: 0,
        totalFacturasVencidasActivos: 0,
        totalFacturasVencidasInactivos: 0,
      });
    }
  };
  
  useEffect(() => {
    const loadData = async () => {
      await totales(ispId);
      await checkAccountingSubscription(ispId);
    };
    loadData();
  }, [ispId]);

  // ---------------------------------------------------------------------------
  // Verificar estado de suscripción de contabilidad
  // ---------------------------------------------------------------------------
  const checkAccountingSubscription = async (currentIspId) => {
    try {
      console.log('🔍 [ACCOUNTING] Verificando suscripción de contabilidad...');
      const response = await fetch(`https://wellnet-rd.com:444/api/accounting/subscription/status/${currentIspId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const responseText = await response.text();
        try {
          const data = JSON.parse(responseText);
          if (data.success && data.data) {
            const isActive = data.data.isSubscribed || false;
            setIsAccountingActive(isActive);
            console.log(`✅ [ACCOUNTING] Estado de contabilidad: ${isActive ? 'Activo' : 'Inactivo'}`);
          } else {
            setIsAccountingActive(false);
            console.log('⚠️ [ACCOUNTING] No se pudo determinar estado de contabilidad');
          }
        } catch (jsonError) {
          console.error('❌ [ACCOUNTING] Error parsing JSON:', jsonError);
          setIsAccountingActive(false);
        }
      } else {
        console.log(`⚠️ [ACCOUNTING] Error en respuesta: ${response.status}`);
        setIsAccountingActive(false);
      }
    } catch (error) {
      console.error('❌ [ACCOUNTING] Error verificando suscripción:', error);
      setIsAccountingActive(false);
    }
  };
  

  // ---------------------------------------------------------------------------
  // useEffect para cargar las órdenes pendientes y guardarlas en orderCounts
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const loadOrderCounts = async () => {
      const counts = await fetchOrderCounts(ispId);
      setOrderCounts(counts);
      totales(ispId);
    };
    loadOrderCounts();
  }, [ispId]);

  // ---------------------------------------------------------------------------
  // Formatea la respuesta de la API a un string, por ejemplo "Pendiente: 5 | En Proceso: 2"
  // ---------------------------------------------------------------------------
  const formatOrderCounts = (counts) => {
    if (!counts || counts.length === 0) return '';
    return counts
      .map((item) => ` ${item.estado}: ${item.cantidad}`)
      .join('  ');
  };

  const orderCountsText = formatOrderCounts(orderCounts);

  // ---------------------------------------------------------------------------
  // useEffect para cargar permisos de usuario (adicional)
  // ---------------------------------------------------------------------------
//   useEffect(() => {
//     if (!usuarioId) return;
//     axios
//       .post('https://wellnet-rd.com:444/api/usuarios/obtener-permisos-usuario', {
//         id_usuario: usuarioId,
//       })
//       .then((response) => {
//         setPermisos(response.data);
//         console.log(
//           'useEffect para cargar permisos de usuario (adicional)\nRespuesta de /api/usuarios/obtener-permisos-usuario:',
//           JSON.stringify(response.data, null, 2)
//         );
//       })
//       .catch((error) => {
//         console.error('Error al obtener permisos del usuario:', error);
//       });
//   }, [usuarioId]);

// ---------------------------------------------------------------------------
// useFocusEffect para refrescar permisos cada vez que la pantalla se enfoca
// ---------------------------------------------------------------------------
useFocusEffect(
    React.useCallback(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post('https://wellnet-rd.com:444/api/usuarios/obtener-permisos-usuario', {
                    id_usuario: usuarioId,
                });
                setPermisos(response.data);
                console.log('Fecha y hora actual:', new Date().toLocaleString());
                console.log(
                    'useFocusEffect para refrescar permisos cada vez que la pantalla se enfoca\nRespuesta de /api/usuarios/obtener-permisos-usuario:',
                    JSON.stringify(response.data, null, 2)
                );

                // Asegúrate de que response.data.usuario es un array y tiene al menos un elemento
                if (response.data.usuario && response.data.usuario.length > 0) {
                    const idIsp = response.data.usuario[0].id_isp;
                    setIsp_id(idIsp);
                    setIspId(idIsp);
                    setUsuarioPermisos(response.data.usuario);
                    setIdUsuario(response.data.usuario[0].id);
                    await totales(idIsp);
                    await checkAccountingSubscription(idIsp); // Recargar estado de contabilidad
                    // await fetchOrderCounts(idIsp);
                } else {
                    console.error('No se encontró el usuario en la respuesta');
                }
            } catch (error) {
                console.error('Error al obtener permisos del usuario:', error);
            }
        };
        fetchData();
        return () => {};
    }, [usuarioId])
);

  // ---------------------------------------------------------------------------
  // Botones del menú inferior
  // ---------------------------------------------------------------------------
  const handleAccountingSubscriptionNavigation = () => {
    navigation.navigate('ContabilidadSuscripcionScreen', { ispId: isp.id_isp });
  };

  const botones = [
    {
      id: '6',
      title: 'Menú',
      action: () => setMenuVisible(true),
      icon: 'menu',
    },
    {
      id: '3',
      title: 'Reportes',
      screen: 'IngresosScreen',
      icon: 'assessment',
    },
    {
      id: '4',
      title: 'Suscripción Contabilidad',
      action: handleAccountingSubscriptionNavigation,
      icon: 'account_balance_wallet',
    },
  ];

  // ---------------------------------------------------------------------------
  // Botones principales (en tarjetas)
  // ---------------------------------------------------------------------------
const botonesData = [
    {
        id: '7',
        title: 'Conexiones',
        screen: 'ConexionesScreen',
        params: { ispId: isp.id_isp },
        permiso: 7,
        icon: 'wifi',
        color: '#FFA500',
    },
    {
        id: '15',
        title: 'Facturación ISP',
        screen: 'IspOwnerBillingDashboard',
        params: { ispId: isp.id_isp },
        permiso: 'owner', // Special permission for ISP owners
        icon: 'receipt_long',
        color: '#3B82F6',
    },
    // Este es el botón de Ordenes de Servicio, con la información de orderCountsText
    {
        id: '11',
        title: 'Ordenes de Servicio', // Se actualizará más abajo
        screen: 'AssignmentsScreen',
        params: { isp, usuarioId, id_isp, permisos },
        permiso: 4,
        icon: 'assignment',
        color: '#8A2BE2',
    },
    {
        id: '2',
        title: 'Clientes',
        screen: 'ClientListScreen',
        permiso: 2,
        icon: 'person',
        color: '#1E90FF',
    },
    {
        id: '1',
        title: 'Facturaciones',
        screen: 'FacturacionesScreen',
        permiso: 1,
        icon: 'receipt',
        color: '#FF4500',
        params: { ispId: ispId },
    },
    {
        id: '3',
        title: 'Servicios',
        screen: 'ServiciosScreen',
        params: { ispId },
        permiso: 3,
        icon: 'miscellaneous-services',
        color: '#32CD32',
    },
    {
        id: '5',
        title: 'Controles',
        screen: 'ControlDevicesScreen',
        params: { id_usuario: isp.usuarioId },
        permiso: 5,
        icon: 'videogame-asset',
        color: '#4682B4',
    },
    {
        id: '6',
        title: 'Usuarios',
        screen: 'UsuariosScreen',
        params: { ispId },
        permiso: 6,
        icon: 'people',
        color: '#FF6347',
    },
    {
        id: '10',
        title: 'Configuraciones',
        screen: 'ConfiguracionesScreen',
        permiso: 10,
        icon: 'settings',
        color: '#FFD700',
    },
    {
        id: '13',
        title: 'Contabilidad',
        screen: isAccountingActive ? 'DashboardScreenContabilidad' : null,
        params: { isp_id, nombreUsuario, id_usuario, usuarioPermisos },
        permiso: 10,
        icon: 'account-balance',
        color: isAccountingActive ? '#28B463' : '#9CA3AF',
        disabled: !isAccountingActive,
    },
    {
        id: '14',
        title: 'Proveedores',
        screen: 'ProveedoresScreen',
        params: { id_isp },
        permiso: 10,
        icon: 'local-shipping',
        color: '#FF8C00',
    },
    {
        id: '16',
        title: 'Gestión de SMS',
        screen: 'SMSManagementScreen',
        params: { ispId },
        permiso: 2,
        icon: 'sms',
        color: '#10B981',
    },
];

  // ---------------------------------------------------------------------------
  // Actualizar el texto de "Ordenes de Servicio" con los datos de orderCountsText
  // ---------------------------------------------------------------------------
  botonesData.forEach((btn) => {
    if (btn.id === '11') {
      if (orderCountsText) {
        // Ej: "Ordenes de Servicio (Pendiente: 5 | En Proceso: 2)"
        // <Text style={styles.buttonTitle}></Text>
        btn.title = `Ordenes de Servicio \n\n ${orderCountsText}`;
      } else {
        btn.title = 'Ordenes de Servicio';
      }
    }
  });

  botonesData.forEach((btn) => {
    if (btn.id === '2') {
      btn.title = `Clientes\n\nTotal: ${totalesIsp.totalClientes || 0}\n\nActivos: ${totalesIsp.clientesActivos || 0}\nFact. Vencidas: ${totalesIsp.totalFacturasVencidasActivos || 0}\n\nInactivos: ${totalesIsp.clientesInactivos || 0}\nFact. Vencidas: ${totalesIsp.totalFacturasVencidasInactivos || 0}`;
    } else if (btn.id === '1') {
      btn.title = `Facturaciones\n\nFacturas Vencidas: ${totalesIsp.totalFacturasVencidas || 0}`;
    }
  });
  

  // ---------------------------------------------------------------------------
  // Texto de conexiones averiadas/pendientes (elemento extra)
  // ---------------------------------------------------------------------------
  // let extraElement = null;
  // if (lastAveriaCount > 0 || lastPendientesCount > 0) {
  //   const averiaText = lastAveriaCount > 0 && (
  //     <BlinkingText
  //       text={`Averías: ${lastAveriaCount}`}
  //       colorSet={['white', 'red']}
  //       style={{ fontSize: 12, fontWeight: 'bold', marginRight: 5 }}
  //     />
  //   );

  //   const pendienteText = lastPendientesCount > 0 && (
  //     <BlinkingText
  //       text={`Por instalar: ${lastPendientesCount}`}
  //       colorSet={['white', 'yellow']}
  //       style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 5 }}
  //     />
  //   );

  //   extraElement = (
  //     <View style={{ textAlign: 'center', marginBottom: 5 }}>
  //       {averiaText && (
  //         <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>
  //           {averiaText}
  //         </Text>
  //       )}
  //       {pendienteText && (
  //         <Text style={{ color: 'yellow', fontSize: 12, fontWeight: 'bold' }}>
  //           {pendienteText}
  //         </Text>
  //       )}
  //     </View>
  //   );
  // }

  // ---------------------------------------------------------------------------
  // Función que mapea un ID al color en botonesData
  // ---------------------------------------------------------------------------
  const getColorForButton = (id) => {
    const button = botonesData.find((btn) => btn.id === id);
    return button?.color || '#dddddd';
  };

  // ---------------------------------------------------------------------------
  // Ejemplo de método para formatear fechas (si te hace falta)
  // ---------------------------------------------------------------------------
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${day}/${month}/${year} ${hours % 12 || 12}:${minutes} ${ampm}`;
  };

  // ---------------------------------------------------------------------------
  // Render de métricas principales
  // ---------------------------------------------------------------------------
  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <View style={[styles.statsIconContainer, { backgroundColor: '#059669' }]}>
            <Icon name="people" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.statsTitle}>Clientes</Text>
        </View>
        <Text style={styles.statsValue}>{totalesIsp.totalClientes}</Text>
        <Text style={styles.statsSubtext}>
          {totalesIsp.clientesActivos} activos • {totalesIsp.clientesInactivos} inactivos
        </Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <View style={[styles.statsIconContainer, { backgroundColor: '#DC2626' }]}>
            <Icon name="receipt" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.statsTitle}>Fact. Vencidas</Text>
        </View>
        <Text style={styles.statsValue}>{totalesIsp.totalFacturasVencidas}</Text>
        <Text style={styles.statsSubtext}>
          {totalesIsp.totalFacturasVencidasActivos} activos • {totalesIsp.totalFacturasVencidasInactivos} inactivos
        </Text>
      </View>
    </View>
  );

  // ---------------------------------------------------------------------------
  // Render de alertas y notificaciones
  // ---------------------------------------------------------------------------
  const renderAlerts = () => {
    if (lastAveriaCount === 0 && lastPendientesCount === 0) return null;

    return (
      <View style={styles.alertsContainer}>
        {lastAveriaCount > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertIconContainer}>
              <Icon name="warning" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Averías Pendientes</Text>
              <BlinkingText
                text={`${lastAveriaCount} conexiones con averías requieren atención`}
                colorSet={['#B45309', '#F59E0B']}
                style={styles.alertText}
              />
            </View>
          </View>
        )}

        {lastPendientesCount > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertIconContainer}>
              <Icon name="pending" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Instalaciones Pendientes</Text>
              <BlinkingText
                text={`${lastPendientesCount} conexiones pendientes de instalación`}
                colorSet={['#B45309', '#F59E0B']}
                style={styles.alertText}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // Componente para tarjeta de función individual
  // ---------------------------------------------------------------------------
  const FunctionCard = ({ item }) => {
    const [pressed, setPressed] = useState(false);

    if (!tienePermiso(item.permiso)) return null;

    const isDisabled = item.disabled || false;

    const handlePress = () => {
      if (isDisabled) {
        // Si está deshabilitado, navegar a la pantalla de suscripción
        if (item.id === '13') { // Botón de contabilidad
          navigation.navigate('ContabilidadSuscripcionScreen', { ispId: isp.id_isp });
        }
        return;
      }
      
      if (item.screen) {
        navigation.navigate(item.screen, item.params || {});
      } else if (item.action) {
        item.action();
      }
    };

    const titleParts = item.title.split('\n');
    const mainTitle = titleParts[0];
    const subTitle = titleParts.slice(1).join('\n').trim();

    return (
      <Pressable
        style={[
          styles.functionCard,
          pressed && styles.functionCardPressed,
          isDisabled && { opacity: 0.5 }
        ]}
        onPressIn={() => !isDisabled && setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={handlePress}
      >
        <View style={[
          styles.functionIconContainer, 
          { backgroundColor: item.color || '#3B82F6' }
        ]}>
          <Icon 
            name={item.icon} 
            size={28} 
            color={isDisabled ? '#FFFFFF80' : '#FFFFFF'} 
          />
        </View>
        <Text style={[
          styles.functionTitle,
          isDisabled && { color: '#9CA3AF' }
        ]}>
          {mainTitle}
        </Text>
        {subTitle.length > 0 && (
          <Text style={[
            styles.functionSubtext,
            isDisabled && { color: '#9CA3AF' }
          ]}>
            {subTitle}
          </Text>
        )}
        {isDisabled && item.id === '13' && (
          <Text style={[styles.functionSubtext, { color: '#9CA3AF', fontSize: 10, marginTop: 4 }]}>
            Requiere suscripción activa
          </Text>
        )}
      </Pressable>
    );
  };

  // ---------------------------------------------------------------------------
  // Render principal
  // ---------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Header moderno animado */}
      <Animated.View style={[
        styles.containerSuperior,
        {
          height: headerHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, width < 400 ? 60 : 80], // Altura dinámica según tamaño
          }),
          opacity: headerHeight.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.5, 1],
          }),
          transform: [{
            translateY: headerHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [width < 400 ? -60 : -80, 0],
            }),
          }],
        }
      ]}>
        <View style={styles.headerContent}>
          <Text style={styles.ispTitle}>{isp?.nombre || 'ISP Dashboard'}</Text>
          <Text style={styles.ispSubtitle}>Panel de control y gestión</Text>
        </View>
      </Animated.View>

      {/* Contenido principal */}
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.flatListContentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Métricas principales - Comentado para quitar las tarjetas */}
        {/* {renderStatsCards()} */}

        {/* Alertas y notificaciones */}
        {renderAlerts()}

        {/* Título de funciones */}
        <Text style={styles.sectionTitle}>Funciones Principales</Text>

        {/* Grid de funciones */}
        <View style={styles.functionsGrid}>
          {botonesData.map((item) => (
            <FunctionCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>

      {/* Menú inferior */}
      <HorizontalMenu
        botones={botones}
        navigation={navigation}
        isDarkMode={isDarkMode}
      />

      {/* Modal de menú lateral */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        menuItems={[
          {
            title: nombreUsuario,
            action: () =>
              navigation.navigate('UsuarioDetalleScreen', {
                ispId: id_isp,
                userId: usuarioId,
              }),
          },
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
    </View>
  );
};

export default IspDetailsScreen;
