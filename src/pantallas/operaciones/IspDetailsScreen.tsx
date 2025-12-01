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
// (Revert) No gradient header

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
import ConnectionsSummaryCard from './componentes/ConnectionsSummaryCard';
import ClientsSummaryCard from './componentes/ClientsSummaryCard';
import BillingSummaryCard from './componentes/BillingSummaryCard';
import ConfigurationsSummaryCard from './componentes/ConfigurationsSummaryCard';
import SmsSummaryCard from './componentes/SmsSummaryCard';
import InstallationsSummaryCard from './componentes/InstallationsSummaryCard';
import UsersSummaryCard from './componentes/UsersSummaryCard';
import ServicesSummaryCard from './componentes/ServicesSummaryCard';
import ServiceOrdersSummaryCard from './componentes/ServiceOrdersSummaryCard';
import { set } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [totalesCon, setTotalesCon] = useState({
    totalConexiones: 0,
    conexionesActivas: 0,
    conexionesSuspendidas: 0,
    conexionesInactivas: 0,
  });
  const [totalesCic, setTotalesCic] = useState({
    totalCiclos: 0,
    ciclosVigentes: 0,
    ciclosCerrados: 0,
    ciclosVencidos: 0,
    resumenFinanciero: {
      totalFacturas: 0,
      totalDinero: 0,
      facturasPendientes: 0,
      dineroPendiente: 0,
      facturasCobradasPorcentaje: 0,
      dineroRecaudadoPorcentaje: 0,
    },
  });
  const [totalesOrd, setTotalesOrd] = useState({
    totalOrdenes: 0,
    ordenesPendientes: 0,
    ordenesEnProgreso: 0,
    ordenesCompletadas: 0,
    ordenesCanceladas: 0,
    estadisticasRendimiento: {
      tasaCompletado: 0,
      horasPromedioResolucion: 0,
    },
    estadisticasTiempo: {
      ordenesEsteMes: 0,
    },
  });
  const [totalesCfg, setTotalesCfg] = useState({
    totalConfiguraciones: 0,
    configuracionesActivas: 0,
    configuracionesIncompletas: 0,
    configuracionRed: { porcentajeConfigurado: 0 },
    estadisticasTiempo: { configuracionesEsteMes: 0 },
    routersTop: [],
  });
  const [totalesUsr, setTotalesUsr] = useState({
    totalUsuarios: 0,
    activos: 0,
    inactivos: 0,
    roles: {},
  });
  const [totalesInst, setTotalesInst] = useState({
    totalInstalaciones: 0,
    estadisticasTiempo: { instalacionesEsteMes: 0, instalacionesHoy: 0 },
    tracking: { conUbicacion: 0, sinUbicacion: 0 },
    equipos: { configuradas: 0, sinConfig: 0 },
  });
  const [totalesSms, setTotalesSms] = useState({
    totalSmsEnviados: 0,
    smsExitosos: 0,
    smsFallidos: 0,
    smsPendientes: 0,
    smsCancelados: 0,
    estadisticasEnvio: {
      tasaExito: 0,
      tasaFallo: 0,
      intentosPromedioEnvio: 0,
    },
    resumenFinanciero: {
      costoTotal: 0,
      costoPromedio: 0,
      smsConCosto: 0,
      smsSinCosto: 0,
    },
    estadisticasTiempo: {
      smsEsteMes: 0,
      smsEstaSemana: 0,
      smsHoy: 0,
    },
    interactividad: {
      mensajesEntrantes: 0,
      tasaRespuesta: 0,
    },
  });
  const [totalesServ, setTotalesServ] = useState({
    totalServicios: 0,
    totalSuscripciones: 0,
    precioPromedio: 0,
    ingresoEstimadoMensual: 0,
    estadisticas: {
      serviciosConUso: 0,
      serviciosSinUso: 0,
      servicioMasPopular: null,
      rangoPrecios: {
        minimo: 0,
        maximo: 0,
      },
    },
    serviciosAdicionales: {
      total: 0,
      activos: 0,
      inactivos: 0,
    },
    planes: [],
  });

  // 5. Estados para animación de header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef('down');

  // ---------------------------------------------------------------------------
  // Función para manejar el cierre de sesión
  // ---------------------------------------------------------------------------
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@loginData');
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
      Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

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
      
      // Normalizar payload (manejar texto JSON, envolturas y snake_case)
      let payload = response.data;
      if (typeof payload === 'string') {
        if (payload.trim().startsWith('<')) {
          console.error('❌ API retornó HTML en lugar de JSON. URL:', `https://wellnet-rd.com:444/api/totales-isp/${ispId}`);
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
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.error('❌ No se pudo parsear JSON de texto:', e);
          payload = {};
        }
      }

      if (response.status === 200 && typeof payload === 'object') {
        // Extraer objeto de datos si viene envuelto
        const body = (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object')
          ? payload.data
          : payload;

        // Adaptar posibles snake_case
        const data = {
          totalClientes: body?.totalClientes ?? body?.total_clientes ?? 0,
          clientesActivos: body?.clientesActivos ?? body?.clientes_activos ?? 0,
          clientesInactivos: body?.clientesInactivos ?? body?.clientes_inactivos ?? 0,
          totalFacturasVencidas: body?.totalFacturasVencidas ?? body?.total_facturas_vencidas ?? 0,
          totalFacturasVencidasActivos: body?.totalFacturasVencidasActivos ?? body?.total_facturas_vencidas_activos ?? 0,
          totalFacturasVencidasInactivos: body?.totalFacturasVencidasInactivos ?? body?.total_facturas_vencidas_inactivos ?? 0,
        };
  
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

  // ---------------------------------------------------------------------------
  // Llamada a la API para obtener totales de conexiones
  // ---------------------------------------------------------------------------
  const conexionesTotales = async (currentIspId) => {
    try {
      console.log('🔄 Llamando API totales-conexiones con ispId:', currentIspId);
      const res = await axios.get(`https://wellnet-rd.com:444/api/totales-conexiones/${currentIspId}`, {
        headers: { 'Accept': 'application/json' },
        timeout: 10000,
      });

      let payload = res.data;
      if (typeof payload === 'string') {
        if (payload.trim().startsWith('<')) {
          console.error('❌ API totales-conexiones retornó HTML');
          setTotalesCon({ totalConexiones: 0, conexionesActivas: 0, conexionesSuspendidas: 0, conexionesInactivas: 0 });
          return;
        }
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      const body = (payload && payload.data && typeof payload.data === 'object') ? payload.data : payload;

      // Tomar valores directos o derivarlos desde conexionesPorEstado
      const totalConexiones = body?.totalConexiones ?? body?.total_conexiones ?? 0;
      const conexionesActivas = body?.conexionesActivas ?? body?.conexiones_activas ?? body?.conexionesPorEstado?.estado3 ?? 0;
      const conexionesSuspendidas = body?.conexionesSuspendidas ?? body?.conexiones_suspendidas ?? body?.conexionesPorEstado?.estado4 ?? 0;
      // Inactivas combinan 0,5,6 si no viene directo
      const inactivasDerivadas = (body?.conexionesPorEstado?.estado0 || 0)
        + (body?.conexionesPorEstado?.estado5 || 0)
        + (body?.conexionesPorEstado?.estado6 || 0);
      const conexionesInactivas = body?.conexionesInactivas ?? body?.conexiones_inactivas ?? inactivasDerivadas;

      setTotalesCon({ totalConexiones, conexionesActivas, conexionesSuspendidas, conexionesInactivas });
      console.log('✅ Totales conexiones:', { totalConexiones, conexionesActivas, conexionesSuspendidas, conexionesInactivas });
    } catch (e) {
      console.error('❌ Error en totales-conexiones:', e.message);
      setTotalesCon({ totalConexiones: 0, conexionesActivas: 0, conexionesSuspendidas: 0, conexionesInactivas: 0 });
    }
  };

  // ---------------------------------------------------------------------------
  // Llamada a la API para obtener totales de ciclos de facturación
  // ---------------------------------------------------------------------------
  const ciclosTotales = async (currentIspId) => {
    try {
      console.log('🔄 Llamando API totales-ciclos con ispId:', currentIspId);
      const res = await axios.get(`https://wellnet-rd.com:444/api/totales-ciclos/${currentIspId}`, {
        headers: { 'Accept': 'application/json' },
        timeout: 10000,
      });

      let payload = res.data;
      if (typeof payload === 'string') {
        if (payload.trim().startsWith('<')) {
          console.error('❌ API totales-ciclos retornó HTML');
          return setTotalesCic({
            totalCiclos: 0,
            ciclosVigentes: 0,
            ciclosCerrados: 0,
            ciclosVencidos: 0,
            resumenFinanciero: {
              totalFacturas: 0,
              totalDinero: 0,
              facturasPendientes: 0,
              dineroPendiente: 0,
              facturasCobradasPorcentaje: 0,
              dineroRecaudadoPorcentaje: 0,
            },
          });
        }
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      const body = (payload && payload.data && typeof payload.data === 'object') ? payload.data : payload;

      const totalCiclos = body?.totalCiclos ?? body?.total_ciclos ?? 0;
      const ciclosVigentes = body?.ciclosVigentes ?? body?.ciclos_vigentes ?? 0;
      const ciclosCerrados = body?.ciclosCerrados ?? body?.ciclos_cerrados ?? 0;
      const ciclosVencidos = body?.ciclosVencidos ?? body?.ciclos_vencidos ?? 0;

      const rf = body?.resumenFinanciero || body?.resumen_financiero || {};
      let resumenFinanciero = {
        totalFacturas: rf.totalFacturas ?? rf.total_facturas ?? 0,
        totalDinero: rf.totalDinero ?? rf.total_dinero ?? 0,
        facturasPendientes: rf.facturasPendientes ?? rf.facturas_pendientes ?? 0,
        dineroPendiente: rf.dineroPendiente ?? rf.dinero_pendiente ?? 0,
        facturasCobradasPorcentaje: rf.facturasCobradasPorcentaje ?? rf.facturas_cobradas_porcentaje ?? 0,
        dineroRecaudadoPorcentaje: rf.dineroRecaudadoPorcentaje ?? rf.dinero_recaudado_porcentaje ?? 0,
      };

      // Fallback: si porcentaje viene 0 pero hay totales, calcularlo
      if (
        (!resumenFinanciero.dineroRecaudadoPorcentaje || Number(resumenFinanciero.dineroRecaudadoPorcentaje) === 0)
        && Number(resumenFinanciero.totalDinero) > 0
      ) {
        const recaudado = Number(resumenFinanciero.totalDinero) - Number(resumenFinanciero.dineroPendiente || 0);
        const pct = (recaudado / Number(resumenFinanciero.totalDinero)) * 100;
        resumenFinanciero = {
          ...resumenFinanciero,
          dineroRecaudadoPorcentaje: Number.isFinite(pct) ? pct : 0,
        };
      }

      setTotalesCic({ totalCiclos, ciclosVigentes, ciclosCerrados, ciclosVencidos, resumenFinanciero });
      console.log('✅ Totales ciclos:', { totalCiclos, ciclosVigentes, ciclosCerrados, ciclosVencidos, resumenFinanciero });
    } catch (e) {
      console.error('❌ Error en totales-ciclos:', e.message);
      setTotalesCic({
        totalCiclos: 0,
        ciclosVigentes: 0,
        ciclosCerrados: 0,
        ciclosVencidos: 0,
        resumenFinanciero: {
          totalFacturas: 0,
          totalDinero: 0,
          facturasPendientes: 0,
          dineroPendiente: 0,
          facturasCobradasPorcentaje: 0,
          dineroRecaudadoPorcentaje: 0,
        },
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Llamada a la API para obtener totales de SMS
  // ---------------------------------------------------------------------------
  const smsTotales = async (currentIspId) => {
    try {
      console.log('🔄 Llamando API totales-sms con ispId:', currentIspId);
      const res = await axios.get(`https://wellnet-rd.com:444/api/totales-sms/${currentIspId}`, {
        headers: { 'Accept': 'application/json' },
        timeout: 10000,
      });

      let payload = res.data;
      if (typeof payload === 'string') {
        if (payload.trim().startsWith('<')) {
          console.error('❌ API totales-sms retornó HTML');
          return setTotalesSms({
            ...totalesSms,
            totalSmsEnviados: 0,
            smsExitosos: 0,
            smsFallidos: 0,
            smsPendientes: 0,
            smsCancelados: 0,
          });
        }
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      const body = (payload && payload.data && typeof payload.data === 'object') ? payload.data : payload;

      const totalSmsEnviados = body?.totalSmsEnviados ?? body.total_sms_enviados ?? 0;
      const smsExitosos = body?.smsExitosos ?? body.sms_exitosos ?? 0;
      const smsFallidos = body?.smsFallidos ?? body.sms_fallidos ?? 0;
      const smsPendientes = body?.smsPendientes ?? body.sms_pendientes ?? 0;
      const smsCancelados = body?.smsCancelados ?? body.sms_cancelados ?? 0;

      const ee = body?.estadisticasEnvio || body?.estadisticas_envio || {};
      const estadisticasEnvio = {
        tasaExito: ee.tasaExito ?? ee.tasa_exito ?? 0,
        tasaFallo: ee.tasaFallo ?? ee.tasa_fallo ?? 0,
        intentosPromedioEnvio: ee.intentosPromedioEnvio ?? ee.intentos_promedio_envio ?? 0,
      };

      const rf2 = body?.resumenFinanciero || body.resumen_financiero || {};
      const resumenFinanciero = {
        costoTotal: rf2.costoTotal ?? rf2.costo_total ?? 0,
        costoPromedio: rf2.costoPromedio ?? rf2.costo_promedio ?? 0,
        smsConCosto: rf2.smsConCosto ?? rf2.sms_con_costo ?? 0,
        smsSinCosto: rf2.smsSinCosto ?? rf2.sms_sin_costo ?? 0,
      };

      const et = body?.estadisticasTiempo || body?.estadisticas_tiempo || {};
      const estadisticasTiempo = {
        smsEsteMes: et.smsEsteMes ?? et.sms_este_mes ?? 0,
        smsEstaSemana: et.smsEstaSemana ?? et.sms_esta_semana ?? 0,
        smsHoy: et.smsHoy ?? et.sms_hoy ?? 0,
      };

      const inter = body?.interactividad || {};
      const interactividad = {
        mensajesEntrantes: inter.mensajesEntrantes ?? inter.mensajes_entrantes ?? 0,
        tasaRespuesta: inter.tasaRespuesta ?? inter.tasa_respuesta ?? 0,
      };

      setTotalesSms({
        totalSmsEnviados, smsExitosos, smsFallidos, smsPendientes, smsCancelados,
        estadisticasEnvio, resumenFinanciero, estadisticasTiempo, interactividad,
      });
      console.log('✅ Totales SMS:', { totalSmsEnviados, smsExitosos, smsFallidos, smsPendientes, smsCancelados, estadisticasEnvio, resumenFinanciero, estadisticasTiempo, interactividad });
    } catch (e) {
      console.error('❌ Error en totales-sms:', e.message);
      setTotalesSms({
        ...totalesSms,
        totalSmsEnviados: 0,
        smsExitosos: 0,
        smsFallidos: 0,
        smsPendientes: 0,
        smsCancelados: 0,
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Llamada a la API para obtener totales de órdenes de servicio
  // ---------------------------------------------------------------------------
  const ordenesTotales = async (currentIspId) => {
    try {
      console.log('🔄 Llamando API totales-ordenes con ispId:', currentIspId);
      const res = await axios.get(`https://wellnet-rd.com:444/api/totales-ordenes/${currentIspId}`, {
        headers: { 'Accept': 'application/json' },
        timeout: 10000,
      });

      let payload = res.data;
      if (typeof payload === 'string') {
        if (payload.trim().startsWith('<')) {
          console.error('❌ API totales-ordenes retornó HTML');
          return setTotalesOrd({
            totalOrdenes: 0,
            ordenesPendientes: 0,
            ordenesEnProgreso: 0,
            ordenesCompletadas: 0,
            ordenesCanceladas: 0,
            estadisticasRendimiento: { tasaCompletado: 0, horasPromedioResolucion: 0 },
            estadisticasTiempo: { ordenesEsteMes: 0 },
          });
        }
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      const body = (payload && payload.data && typeof payload.data === 'object') ? payload.data : payload;

      const totalOrdenes = body?.totalOrdenes ?? body.total_ordenes ?? 0;
      const ordenesPendientes = body?.ordenesPendientes ?? body.ordenes_pendientes ?? 0;
      const ordenesEnProgreso = body?.ordenesEnProgreso ?? body.ordenes_en_progreso ?? 0;
      const ordenesCompletadas = body?.ordenesCompletadas ?? body.ordenes_completadas ?? 0;
      const ordenesCanceladas = body?.ordenesCanceladas ?? body.ordenes_canceladas ?? 0;

      const er = body?.estadisticasRendimiento || body?.estadisticas_rendimiento || {};
      let tasaCompletado = er.tasaCompletado ?? er.tasa_completado ?? 0;
      const horasPromedioResolucion = er.horasPromedioResolucion ?? er.horas_promedio_resolucion ?? 0;
      if ((!tasaCompletado || Number(tasaCompletado) === 0) && totalOrdenes > 0) {
        tasaCompletado = (ordenesCompletadas / totalOrdenes) * 100;
      }

      const et2 = body?.estadisticasTiempo || body?.estadisticas_tiempo || {};
      const ordenesEsteMes = et2.ordenesEsteMes ?? et2.ordenes_este_mes ?? 0;

      setTotalesOrd({
        totalOrdenes, ordenesPendientes, ordenesEnProgreso, ordenesCompletadas, ordenesCanceladas,
        estadisticasRendimiento: { tasaCompletado, horasPromedioResolucion },
        estadisticasTiempo: { ordenesEsteMes },
      });
      console.log('✅ Totales órdenes:', { totalOrdenes, ordenesPendientes, ordenesEnProgreso, ordenesCompletadas, ordenesCanceladas, tasaCompletado, horasPromedioResolucion, ordenesEsteMes });
    } catch (e) {
      console.error('❌ Error en totales-ordenes:', e.message);
      setTotalesOrd({
        totalOrdenes: 0,
        ordenesPendientes: 0,
        ordenesEnProgreso: 0,
        ordenesCompletadas: 0,
        ordenesCanceladas: 0,
        estadisticasRendimiento: { tasaCompletado: 0, horasPromedioResolucion: 0 },
        estadisticasTiempo: { ordenesEsteMes: 0 },
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Llamada a la API para obtener totales de configuraciones
  // ---------------------------------------------------------------------------
  const configuracionesTotales = async (currentIspId) => {
    try {
      console.log('🔄 Llamando API totales-configuraciones con ispId:', currentIspId);
      const res = await axios.get(`https://wellnet-rd.com:444/api/totales-configuraciones/${currentIspId}`, {
        headers: { 'Accept': 'application/json' },
        timeout: 10000,
      });

      let payload = res.data;
      if (typeof payload === 'string') {
        if (payload.trim().startsWith('<')) {
          console.error('❌ API totales-configuraciones retornó HTML');
          return setTotalesCfg({
            totalConfiguraciones: 0,
            configuracionesActivas: 0,
            configuracionesIncompletas: 0,
            configuracionRed: { porcentajeConfigurado: 0 },
            estadisticasTiempo: { configuracionesEsteMes: 0 },
          });
        }
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      const body = (payload && payload.data && typeof payload.data === 'object') ? payload.data : payload;

      const totalConfiguraciones = body?.totalConfiguraciones ?? body?.total_configuraciones ?? 0;
      const configuracionesActivas = body?.configuracionesActivas ?? body?.configuraciones_activas ?? 0;
      const configuracionesIncompletas = body?.configuracionesIncompletas ?? body?.configuraciones_incompletas ?? 0;
      const cr = body?.configuracionRed || body?.configuracion_red || {};
      const porcentajeConfigurado = cr?.porcentajeConfigurado ?? cr?.porcentaje_configurado ?? 0;
      const et = body?.estadisticasTiempo || body?.estadisticas_tiempo || {};
      const configuracionesEsteMes = et?.configuracionesEsteMes ?? et?.configuraciones_este_mes ?? 0;
      const cpr = body?.configuracionesPorRouter || body?.configuraciones_por_router || {};

      // Calcular top de routers por configuraciones
      const totalCfg = totalConfiguraciones || 0;
      const routersTop = Object.entries(cpr || {})
        .map(([name, count]) => ({ name, count: Number(count) || 0, pct: totalCfg > 0 ? (Number(count) * 100) / totalCfg : 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 routers

      setTotalesCfg({
        totalConfiguraciones,
        configuracionesActivas,
        configuracionesIncompletas,
        configuracionRed: { porcentajeConfigurado },
        estadisticasTiempo: { configuracionesEsteMes },
        routersTop,
      });
      console.log('✅ Totales configuraciones:', { totalConfiguraciones, configuracionesActivas, configuracionesIncompletas, porcentajeConfigurado, configuracionesEsteMes, routersTop });
    } catch (e) {
      console.error('❌ Error en totales-configuraciones:', e.message);
      setTotalesCfg({
        totalConfiguraciones: 0,
        configuracionesActivas: 0,
        configuracionesIncompletas: 0,
        configuracionRed: { porcentajeConfigurado: 0 },
        estadisticasTiempo: { configuracionesEsteMes: 0 },
        routersTop: [],
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Llamada a la API para obtener totales de instalaciones
  // ---------------------------------------------------------------------------
  const instalacionesTotales = async (currentIspId) => {
    try {
      console.log('🔄 Llamando API totales-instalaciones con ispId:', currentIspId);
      const res = await axios.get(`https://wellnet-rd.com:444/api/totales-instalaciones/${currentIspId}`, {
        headers: { 'Accept': 'application/json' },
        timeout: 10000,
      });

      let payload = res.data;
      if (typeof payload === 'string') {
        if (payload.trim().startsWith('<')) {
          console.error('❌ API totales-instalaciones retornó HTML');
          return setTotalesInst({
            totalInstalaciones: 0,
            estadisticasTiempo: { instalacionesEsteMes: 0, instalacionesHoy: 0 },
            tracking: { conUbicacion: 0, sinUbicacion: 0 },
            equipos: { configuradas: 0, sinConfig: 0 },
          });
        }
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      const body = (payload && payload.data && typeof payload.data === 'object') ? payload.data : payload;

      const totalInstalaciones = body?.totalInstalaciones ?? body.total_instalaciones ?? 0;

      const et = body?.estadisticasTiempo || body?.estadisticas_tiempo || {};
      const estadisticasTiempo = {
        instalacionesEsteMes: et.instalacionesEsteMes ?? et.instalaciones_este_mes ?? et.esteMes ?? 0,
        instalacionesHoy: et.instalacionesHoy ?? et.instalaciones_hoy ?? et.hoy ?? 0,
      };

      const tr = body?.tracking || body?.seguimiento || {};
      const tracking = {
        conUbicacion: tr.conUbicacion ?? tr.con_ubicacion ?? tr.geo_ok ?? 0,
        sinUbicacion: tr.sinUbicacion ?? tr.sin_ubicacion ?? tr.geo_faltante ?? 0,
      };

      const eq = body?.equipos || body?.equipamiento || {};
      const equipos = {
        configuradas: eq.configuradas ?? eq.equiposConfigurados ?? eq.config_ok ?? 0,
        sinConfig: eq.sinConfig ?? eq.equiposSinConfig ?? eq.config_faltante ?? 0,
      };

      setTotalesInst({ totalInstalaciones, estadisticasTiempo, tracking, equipos });
      console.log('✅ Totales instalaciones:', { totalInstalaciones, estadisticasTiempo, tracking, equipos });
    } catch (e) {
      console.error('❌ Error en totales-instalaciones:', e.message);
      setTotalesInst({
        totalInstalaciones: 0,
        estadisticasTiempo: { instalacionesEsteMes: 0, instalacionesHoy: 0 },
        tracking: { conUbicacion: 0, sinUbicacion: 0 },
        equipos: { configuradas: 0, sinConfig: 0 },
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Llamada a la API para obtener totales de usuarios
  // ---------------------------------------------------------------------------
  const usuariosTotales = async (currentIspId) => {
    try {
      console.log('🔄 Llamando API totales-usuarios con ispId:', currentIspId);
      const res = await axios.get(`https://wellnet-rd.com:444/api/totales-usuarios/${currentIspId}`, {
        headers: { 'Accept': 'application/json' },
        timeout: 10000,
      });

      let payload = res.data;
      if (typeof payload === 'string') {
        if (payload.trim().startsWith('<')) {
          console.error('❌ API totales-usuarios retornó HTML');
          return setTotalesUsr({ totalUsuarios: 0, activos: 0, inactivos: 0, roles: {} });
        }
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      const body = (payload && payload.data && typeof payload.data === 'object') ? payload.data : payload;
      const totalUsuarios = body?.totalUsuarios ?? body.total_usuarios ?? 0;
      const activos = body?.activos ?? body?.usuariosActivos ?? body?.usuarios_activos ?? 0;
      const inactivos = body?.inactivos ?? body?.usuariosInactivos ?? body?.usuarios_inactivos ?? 0;
      const roles = body?.roles || {};

      setTotalesUsr({ totalUsuarios, activos, inactivos, roles });
      console.log('✅ Totales usuarios:', { totalUsuarios, activos, inactivos });
    } catch (e) {
      console.error('❌ Error en totales-usuarios:', e.message);
      setTotalesUsr({ totalUsuarios: 0, activos: 0, inactivos: 0, roles: {} });
    }
  };

  // ---------------------------------------------------------------------------
  // Llamada a la API para obtener totales de servicios
  // ---------------------------------------------------------------------------
  const serviciosTotales = async (currentIspId) => {
    try {
      console.log('🔄 Llamando API totales-servicios con ispId:', currentIspId);
      const res = await axios.get(`https://wellnet-rd.com:444/api/totales-servicios/${currentIspId}`, {
        headers: { 'Accept': 'application/json' },
        timeout: 10000,
      });

      let payload = res.data;
      if (typeof payload === 'string') {
        if (payload.trim().startsWith('<')) {
          console.error('❌ API totales-servicios retornó HTML');
          return setTotalesServ({
            totalServicios: 0,
            totalSuscripciones: 0,
            precioPromedio: 0,
            ingresoEstimadoMensual: 0,
            estadisticas: {
              serviciosConUso: 0,
              serviciosSinUso: 0,
              servicioMasPopular: null,
              rangoPrecios: { minimo: 0, maximo: 0 },
            },
            serviciosAdicionales: { total: 0, activos: 0, inactivos: 0 },
            planes: [],
          });
        }
        try { payload = JSON.parse(payload); } catch { payload = {}; }
      }

      const body = (payload && payload.data && typeof payload.data === 'object') ? payload.data : payload;

      const totalServicios = body?.totalServicios ?? body?.total_servicios ?? 0;
      const totalSuscripciones = body?.totalSuscripciones ?? body?.total_suscripciones ?? 0;
      const precioPromedio = body?.precioPromedio ?? body?.precio_promedio ?? 0;
      const ingresoEstimadoMensual = body?.ingresoEstimadoMensual ?? body?.ingreso_estimado_mensual ?? 0;

      const est = body?.estadisticas || {};
      const estadisticas = {
        serviciosConUso: est.serviciosConUso ?? est.servicios_con_uso ?? 0,
        serviciosSinUso: est.serviciosSinUso ?? est.servicios_sin_uso ?? 0,
        servicioMasPopular: est.servicioMasPopular ?? est.servicio_mas_popular ?? null,
        rangoPrecios: {
          minimo: est.rangoPrecios?.minimo ?? est.rango_precios?.minimo ?? 0,
          maximo: est.rangoPrecios?.maximo ?? est.rango_precios?.maximo ?? 0,
        },
      };

      const servAd = body?.serviciosAdicionales ?? body?.servicios_adicionales ?? {};
      const serviciosAdicionales = {
        total: servAd.total ?? 0,
        activos: servAd.activos ?? 0,
        inactivos: servAd.inactivos ?? 0,
      };

      // Extraer lista de planes/servicios
      const planes = body?.servicios ?? body?.planes ?? body?.listadoServicios ?? body?.listado_servicios ?? [];

      setTotalesServ({ totalServicios, totalSuscripciones, precioPromedio, ingresoEstimadoMensual, estadisticas, serviciosAdicionales, planes });
      console.log('✅ Totales servicios:', { totalServicios, totalSuscripciones, precioPromedio, ingresoEstimadoMensual, totalPlanes: planes.length });
      console.log('📋 Planes recibidos del backend:', planes.length > 0 ? planes : 'Array vacío o no existe');
      if (planes.length > 0) {
        console.log('📊 Primeros 3 planes:', planes.slice(0, 3));
      }
    } catch (e) {
      console.error('❌ Error en totales-servicios:', e.message);
      setTotalesServ({
        totalServicios: 0,
        totalSuscripciones: 0,
        precioPromedio: 0,
        ingresoEstimadoMensual: 0,
        estadisticas: {
          serviciosConUso: 0,
          serviciosSinUso: 0,
          servicioMasPopular: null,
          rangoPrecios: { minimo: 0, maximo: 0 },
        },
        serviciosAdicionales: { total: 0, activos: 0, inactivos: 0 },
        planes: [],
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await totales(ispId);
      await conexionesTotales(ispId);
      await ciclosTotales(ispId);
      await smsTotales(ispId);
      await ordenesTotales(ispId);
      await configuracionesTotales(ispId);
      await instalacionesTotales(ispId);
      await usuariosTotales(ispId);
      await serviciosTotales(ispId);
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
                    await conexionesTotales(idIsp);
                    await ciclosTotales(idIsp);
                    await smsTotales(idIsp);
                    await ordenesTotales(idIsp);
                    await configuracionesTotales(idIsp);
                    await instalacionesTotales(idIsp);
                    await usuariosTotales(idIsp);
                    await serviciosTotales(idIsp);
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
        icon: 'router',
        color: '#FFA500',
    },
    {
        id: '2',
        title: 'Clientes',
        screen: 'ClientListScreen',
        permiso: 2,
        icon: 'groups',
        color: '#3B82F6',
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
        id: '16',
        title: 'Gestión de SMS',
        screen: 'SMSManagementScreen',
        params: { ispId },
        permiso: 2,
        icon: 'sms',
        color: '#10B981',
    },
    {
        id: '10',
        title: 'Configuraciones',
        screen: 'ConfiguracionesListScreen',
        params: { id_isp: isp.id_isp },
        permiso: 10,
        icon: 'settings',
        color: '#FFD700',
    },
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
        id: '17',
        title: 'Instalaciones',
        screen: 'InstalacionesListScreen',
        params: { id_isp: isp.id_isp },
        permiso: 4,
        icon: 'handyman',
        color: '#22A6B3',
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
];

  // ---------------------------------------------------------------------------
  // Actualizar el texto de "Ordenes de Servicio" con los datos de orderCountsText
  // ---------------------------------------------------------------------------
  botonesData.forEach((btn) => {
    if (btn.id === '11') {
      // Mantener solo el título sin subtítulo legado
      btn.title = 'Ordenes de Servicio';
    }
  });

  // Ocultar datos numéricos si el usuario es Operador
  const esOperador = nivelUsuario && nivelUsuario.toUpperCase() === 'OPERADOR';

  botonesData.forEach((btn) => {
    if (!esOperador) {
      if (btn.id === '2') {
        // Restaurar el título con el formato de texto anterior (mismas letras)
        btn.title = `Clientes\n\nTotal: ${totalesIsp?.totalClientes || 0}\n\nActivos: ${totalesIsp?.clientesActivos || 0}\nFact. Vencidas: ${totalesIsp?.totalFacturasVencidasActivos || 0}\n\nInactivos: ${totalesIsp?.clientesInactivos || 0}\nFact. Vencidas: ${totalesIsp?.totalFacturasVencidasInactivos || 0}`;
      } else if (btn.id === '1') {
        btn.title = `Facturaciones\n\nFacturas Vencidas: ${totalesIsp?.totalFacturasVencidas || 0}`;
      }
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
  const renderStatsCards = () => {
    console.log('📊 [Dashboard] ========================================');
    console.log('📊 [Dashboard] renderStatsCards - RENDERIZANDO TARJETAS');
    console.log('📊 [Dashboard] ========================================');
    console.log('📊 [Dashboard] totalesIsp:', JSON.stringify(totalesIsp, null, 2));
    console.log('📊 [Dashboard] totalesCon:', JSON.stringify(totalesCon, null, 2));
    console.log('📊 [Dashboard] totalesCic:', JSON.stringify(totalesCic, null, 2));
    console.log('📊 [Dashboard] totalesSms:', JSON.stringify(totalesSms, null, 2));
    console.log('📊 [Dashboard] totalesOrd:', JSON.stringify(totalesOrd, null, 2));
    console.log('📊 [Dashboard] totalesCfg:', JSON.stringify(totalesCfg, null, 2));
    console.log('📊 [Dashboard] totalesInst:', JSON.stringify(totalesInst, null, 2));
    console.log('📊 [Dashboard] ========================================');

    return (
      <>
        {/* Primera fila de tarjetas */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#059669' }]}>
                <Icon name="people" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statsTitle}>Clientes</Text>
            </View>
            <Text style={styles.statsValue}>{totalesIsp?.totalClientes || 0}</Text>
            <Text style={styles.statsSubtext}>
              {totalesIsp?.clientesActivos || 0} activos • {totalesIsp?.clientesInactivos || 0} inactivos
            </Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#DC2626' }]}>
                <Icon name="receipt" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statsTitle}>Fact. Vencidas</Text>
            </View>
            <Text style={styles.statsValue}>{totalesIsp?.totalFacturasVencidas || 0}</Text>
            <Text style={styles.statsSubtext}>
              {totalesIsp?.totalFacturasVencidasActivos || 0} activos • {totalesIsp?.totalFacturasVencidasInactivos || 0} inactivos
            </Text>
          </View>
        </View>

        {/* Segunda fila de tarjetas */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#2563EB' }]}>
                <Icon name="settings-ethernet" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statsTitle}>Conexiones</Text>
            </View>
            <Text style={styles.statsValue}>{totalesCon?.totalConexiones || 0}</Text>
            <Text style={styles.statsSubtext}>
              {totalesCon?.conexionesActivas || 0} activas • {totalesCon?.conexionesInactivas || 0} inactivas
            </Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#7C3AED' }]}>
                <Icon name="description" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statsTitle}>Ciclos</Text>
            </View>
            <Text style={styles.statsValue}>{totalesCic?.totalCiclos || 0}</Text>
            <Text style={styles.statsSubtext}>
              {totalesCic?.ciclosVigentes || 0} vigentes • {totalesCic?.ciclosCerrados || 0} cerrados
            </Text>
          </View>
        </View>

        {/* Tercera fila de tarjetas */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#EC4899' }]}>
                <Icon name="message" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statsTitle}>SMS</Text>
            </View>
            <Text style={styles.statsValue}>{totalesSms?.totalSmsEnviados || 0}</Text>
            <Text style={styles.statsSubtext}>
              {totalesSms?.smsExitosos || 0} exitosos • {totalesSms?.smsFallidos || 0} fallidos
            </Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#F59E0B' }]}>
                <Icon name="assignment" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statsTitle}>Órdenes</Text>
            </View>
            <Text style={styles.statsValue}>{totalesOrd?.totalOrdenes || 0}</Text>
            <Text style={styles.statsSubtext}>
              {totalesOrd?.ordenesPendientes || 0} pendientes • {totalesOrd?.ordenesCompletadas || 0} completadas
            </Text>
          </View>
        </View>

        {/* Cuarta fila de tarjetas */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#10B981' }]}>
                <Icon name="settings" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statsTitle}>Configuraciones</Text>
            </View>
            <Text style={styles.statsValue}>{totalesCfg?.totalConfiguraciones || 0}</Text>
            <Text style={styles.statsSubtext}>
              {totalesCfg?.configuracionesActivas || 0} activas • {totalesCfg?.configuracionesIncompletas || 0} incompletas
            </Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#8B5CF6' }]}>
                <Icon name="build" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statsTitle}>Instalaciones</Text>
            </View>
            <Text style={styles.statsValue}>{totalesInst?.totalInstalaciones || 0}</Text>
            <Text style={styles.statsSubtext}>
              {totalesInst?.equipos?.configuradas || 0} config. • {totalesInst?.equipos?.sinConfig || 0} sin config.
            </Text>
          </View>
        </View>
      </>
    );
  };

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
          {Array.isArray(item.icons) && item.icons.length > 1 ? (
            <View style={styles.iconRow}>
              {item.icons.map((ic, idx) => (
                <Icon
                  key={`ic-${idx}`}
                  name={ic}
                  size={24}
                  color={isDisabled ? '#FFFFFF80' : '#FFFFFF'}
                  style={styles.iconPair}
                />
              ))}
            </View>
          ) : (
            <Icon 
              name={item.icon} 
              size={28} 
              color={isDisabled ? '#FFFFFF80' : '#FFFFFF'} 
            />
          )}
        </View>
        <Text style={[
          styles.functionTitle,
          isDisabled && { color: '#9CA3AF' }
        ]}>
          {mainTitle}
        </Text>
        {item.id !== '2' && item.id !== '7' && item.id !== '1' && item.id !== '11' && item.id !== '10' && subTitle.length > 0 && (
          <Text style={[
            styles.functionSubtext,
            isDisabled && { color: '#9CA3AF' }
          ]}>
            {subTitle}
          </Text>
        )}

        {!esOperador && item.id === '2' && (
          <ClientsSummaryCard
            totalClients={totalesIsp?.totalClientes || 0}
            activeClients={totalesIsp?.clientesActivos || 0}
            inactiveClients={totalesIsp?.clientesInactivos || 0}
            overdueActive={totalesIsp?.totalFacturasVencidasActivos || 0}
            overdueInactive={totalesIsp?.totalFacturasVencidasInactivos || 0}
            theme={{ styles, isDarkMode }}
          />
        )}

        {!esOperador && item.id === '7' && (
          <ConnectionsSummaryCard
            totalConnections={totalesCon?.totalConexiones || 0}
            active={totalesCon?.conexionesActivas || 0}
            suspended={totalesCon?.conexionesSuspendidas || 0}
            inactive={totalesCon?.conexionesInactivas || 0}
            theme={{ styles, isDarkMode }}
          />
        )}

        {!esOperador && item.id === '1' && (
          <BillingSummaryCard
            totalCycles={totalesCic?.totalCiclos || 0}
            activeCycles={totalesCic?.ciclosVigentes || 0}
            closedCycles={totalesCic?.ciclosCerrados || 0}
            overdueCycles={totalesCic?.ciclosVencidos || 0}
            collectedPercent={totalesCic?.resumenFinanciero?.dineroRecaudadoPorcentaje || 0}
            pendingAmount={totalesCic?.resumenFinanciero?.dineroPendiente || 0}
            theme={{ styles, isDarkMode }}
          />
        )}

        {!esOperador && item.id === '16' && (
          <SmsSummaryCard
            totalEnviados={totalesSms?.totalSmsEnviados || 0}
            tasaExito={Number(totalesSms?.estadisticasEnvio?.tasaExito || 0)}
            costoTotal={Number(totalesSms?.resumenFinanciero?.costoTotal || 0)}
            entrantes={totalesSms?.interactividad?.mensajesEntrantes || 0}
            enviadosEsteMes={totalesSms?.estadisticasTiempo?.smsEsteMes || 0}
            enviadosHoy={totalesSms?.estadisticasTiempo?.smsHoy || 0}
            theme={{ styles, isDarkMode }}
          />
        )}

        {!esOperador && item.id === '17' && (
          <InstallationsSummaryCard
            totalInstalaciones={totalesInst?.totalInstalaciones || 0}
            instalacionesMes={totalesInst?.estadisticasTiempo?.instalacionesEsteMes || 0}
            instalacionesHoy={totalesInst?.estadisticasTiempo?.instalacionesHoy || 0}
            theme={{ styles, isDarkMode }}
          />
        )}

        {!esOperador && item.id === '6' && (() => {
          const rolesEntries = Object.entries(totalesUsr?.roles || {}).map(([nombre, cantidad]) => ({
            nombre,
            cantidad: Number(cantidad) || 0,
          }));
          return (
            <UsersSummaryCard
              totalUsuarios={totalesUsr?.totalUsuarios || 0}
              activos={totalesUsr?.activos || 0}
              inactivos={totalesUsr?.inactivos || 0}
              rolesTop={rolesEntries}
              theme={{ styles, isDarkMode }}
            />
          );
        })()}

        {!esOperador && item.id === '3' && (
          <ServicesSummaryCard
            totalPlanes={totalesServ?.totalServicios || 0}
            totalSuscripciones={totalesServ?.totalSuscripciones || 0}
            precioPromedio={Number(totalesServ?.precioPromedio || 0)}
            ingresoMensual={Number(totalesServ?.ingresoEstimadoMensual || 0)}
            planMasPopular={totalesServ?.estadisticas?.servicioMasPopular || null}
            planesDetalle={(totalesServ?.planes || []).map((plan, idx) => ({
              id: plan.id ?? plan.id_servicio ?? plan.id_plan ?? idx,
              nombre: plan.nombre ?? plan.descripcion ?? 'Plan sin nombre',
              precio: Number(plan.precio ?? plan.precio_mensual ?? plan.costo ?? 0),
              suscripciones: Number(plan.suscripciones ?? plan.conexiones ?? plan.cantidad_suscripciones ?? 0),
            }))}
            theme={{ styles, isDarkMode }}
          />
        )}

        {!esOperador && item.id === '10' && (
          <ConfigurationsSummaryCard
            totalConfiguraciones={totalesCfg?.totalConfiguraciones || 0}
            eficiencia={Number(totalesCfg?.configuracionRed?.porcentajeConfigurado || 0)}
            configuracionesEsteMes={totalesCfg?.estadisticasTiempo?.configuracionesEsteMes || 0}
            routersTop={totalesCfg?.routersTop || []}
            theme={{ styles, isDarkMode }}
          />
        )}

        {!esOperador && item.id === '11' && (
          <ServiceOrdersSummaryCard
            totalOrdenes={totalesOrd?.totalOrdenes || 0}
            tasaCompletado={Number(totalesOrd?.estadisticasRendimiento?.tasaCompletado || 0)}
            promedioResolucionDias={Number(totalesOrd?.estadisticasRendimiento?.horasPromedioResolucion || 0) / 24}
            backlog={totalesOrd?.ordenesPendientes || 0}
            ordenesEsteMes={totalesOrd?.estadisticasTiempo?.ordenesEsteMes || 0}
            theme={{ styles, isDarkMode }}
          />
        )}
        {/* Sin badges: se mantiene el texto original de métricas dentro del título */}
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
  console.log('🎨 [Dashboard] ========================================');
  console.log('🎨 [Dashboard] RENDER PRINCIPAL DEL DASHBOARD');
  console.log('🎨 [Dashboard] ========================================');
  console.log('🎨 [Dashboard] ISP:', isp?.nombre);
  console.log('🎨 [Dashboard] ispId:', ispId);
  console.log('🎨 [Dashboard] totalesIsp disponible:', totalesIsp ? 'Sí' : 'No');
  console.log('🎨 [Dashboard] Total clientes:', totalesIsp?.totalClientes);
  console.log('🎨 [Dashboard] ========================================');

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
        {/* Métricas principales - OCULTAS */}
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
          { title: 'Cerrar Sesión', action: handleLogout },
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
