import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getStyles from './SMSMassCampaignsScreenStyles';
import GroupSelector from './components/GroupSelector';
import ClienteSearchSelector from './components/ClienteSearchSelector';
import ClientPreview from './components/ClientPreview';
import MessageComposer from './components/MessageComposer';
import SendPanel from './components/SendPanel';

interface Group {
  tipo: string;
  id: string | number;
  nombre: string;
  descripcion: string;
  cantidad_clientes: number;
}

interface Cliente {
  id_cliente: number;
  nombre_completo: string;
  telefono1: string;
  direccion_ipv4?: string;
  cedula?: string;
  nombre?: string;
  apellido?: string;
  telefono2?: string;
  rnc?: string;
  pasaporte?: string;
}

interface GroupsResponse {
  success: boolean;
  grupos: {
    por_red: Group[];
    por_router: Group[];
    por_estado: Group[];
    por_pon: Group[];
    por_vlan: Group[];
    por_tipo_conexion: Group[];
    por_cableado_cobre: Group[];
    por_inalambrico: Group[];
  };
}

interface PreviewResponse {
  success: boolean;
  tipo_grupo: string;
  grupo_id: string | number;
  cantidad_clientes: number;
  clientes: Cliente[];
}

interface SendResponse {
  success: boolean;
  mensaje: string;
  estadisticas: {
    total_enviados: number;
    exitosos: number;
    fallidos: number;
    errores: any[];
  };
}

const API_BASE = 'https://wellnet-rd.com:444/api';

const SMSMassCampaignsScreen = () => {
  const {isDarkMode} = useTheme();
  const styles = getStyles(isDarkMode);
  const navigation = useNavigation();
  const route = useRoute();
  const {ispId} = (route.params as any) || {};

  // Estados principales
  const [grupos, setGrupos] = useState<GroupsResponse['grupos']>({
    por_red: [],
    por_router: [],
    por_estado: [],
    por_pon: [],
    por_vlan: [],
    por_tipo_conexion: [],
    por_cableado_cobre: [],
    por_inalambrico: [],
  });
  const [loading, setLoading] = useState(true);

  // Estados de selección y filtros
  const [clientesSeleccionados, setClientesSeleccionados] = useState<Cliente[]>(
    [],
  );
  const [filtroGrupo, setFiltroGrupo] = useState<{
    tipo_grupo: string;
    grupo_id: string | number;
    clientes: Cliente[];
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Estados de mensaje
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Estados de envío
  const [enviando, setEnviando] = useState(false);
  const [resultadosEnvio, setResultadosEnvio] = useState<
    SendResponse['estadisticas'] | null
  >(null);

  // Cargar grupos al montar el componente
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;

      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      console.log('🔄 [SMS Campaigns] Cargando grupos...', { ispId });

      // Intentar varias rutas/formatos de API por compatibilidad
      const candidates = [
        `${API_BASE}/sms-campaigns-simple/groups${ispId ? `?isp_id=${encodeURIComponent(String(ispId))}` : ''}`,
        ...(ispId ? [
          `${API_BASE}/sms-campaigns-simple/groups/${encodeURIComponent(String(ispId))}`,
        ] : []),
        `${API_BASE}/sms-campaigns-simple/groups`,
      ];

      let success = false;
      for (const url of candidates) {
        console.log('🔗 [SMS Campaigns] Intentando URL:', url);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            ...(ispId ? { 'X-ISP-ID': String(ispId) } : {}),
          },
        });

        console.log('📥 [SMS Campaigns] Response status:', response.status);

        if (response.ok) {
          let data: GroupsResponse;
          try {
            data = (await response.json()) as GroupsResponse;
          } catch (e) {
            const text = await response.text();
            console.error('❌ [SMS Campaigns] JSON parse error. Raw:', text?.slice(0, 300));
            continue; // probar siguiente candidato
          }
          console.log('✅ [SMS Campaigns] Grupos cargados');
          setGrupos(data.grupos);
          success = true;
          break;
        } else {
          const raw = await response.text();
          console.error('❌ [SMS Campaigns] Error del servidor:', response.status, raw?.slice(0, 300));
          // probar el siguiente formato si es 400/404
          if (![400, 404].includes(response.status)) {
            throw new Error(`Error del servidor: ${response.status}`);
          }
        }
      }

      if (!success) {
        throw new Error('No se pudieron cargar los grupos con ninguno de los formatos de URL.');
      }
    } catch (error) {
      console.error('❌ [SMS Campaigns] Error loading groups:', error);
      Alert.alert('Error', `No se pudieron cargar los grupos de clientes. ${error?.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroAplicado = (
    filtro: {
      tipo_grupo: string;
      grupo_id: string | number;
      clientes: Cliente[];
    } | null,
  ) => {
    console.log(
      '🔄 [SMS Campaigns] Filtro aplicado:',
      filtro ? `${filtro.clientes.length} clientes` : 'Sin filtro',
    );
    setFiltroGrupo(filtro);
  };

  const handleClientesSeleccionados = (clientes: Cliente[]) => {
    console.log('🔄 [SMS Campaigns] Clientes seleccionados:', clientes.length);
    setClientesSeleccionados(clientes);
  };

  const handleSend = async () => {
    if (!titulo.trim() || !mensaje.trim()) {
      Alert.alert('Error', 'Título y mensaje son requeridos');
      return;
    }

    if (clientesSeleccionados.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un cliente para enviar SMS');
      return;
    }

    // Confirmación antes de enviar
    Alert.alert(
      'Confirmar Envío Masivo',
      `¿Enviar SMS a ${clientesSeleccionados.length} cliente${
        clientesSeleccionados.length !== 1 ? 's' : ''
      }?\n\nTítulo: ${titulo}\nMensaje: ${mensaje.substring(0, 50)}...`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Enviar SMS', style: 'destructive', onPress: performSend},
      ],
    );
  };

  const performSend = async () => {
    try {
      setEnviando(true);
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;

      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      console.log(
        `🚀 [SMS Campaigns] Enviando a ${clientesSeleccionados.length} clientes`,
      );

      // Envío a clientes seleccionados individualmente
      const clientesIds = clientesSeleccionados.map(c => c.id_cliente);

      const response = await fetch(
        `${API_BASE}/sms-campaigns-simple/send-individual`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientes_ids: clientesIds,
            titulo: titulo,
            mensaje: mensaje,
          }),
        },
      );

      if (response.ok) {
        const data: SendResponse = await response.json();
        console.log(
          '✅ [SMS Campaigns] Enviado exitosamente:',
          data.estadisticas,
        );

        setResultadosEnvio(data.estadisticas);

        Alert.alert(
          'SMS Enviado',
          `✅ Exitosos: ${data.estadisticas.exitosos}\n❌ Fallidos: ${data.estadisticas.fallidos}\n📊 Total: ${data.estadisticas.total_enviados}`,
          [
            {
              text: 'Ver Detalles',
              onPress: () => showDetailedResults(data.estadisticas),
            },
            {text: 'OK'},
          ],
        );

        // Limpiar formulario después de envío exitoso
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el envío');
      }
    } catch (error) {
      console.error('❌ [SMS Campaigns] Error sending:', error);
      Alert.alert('Error', `No se pudo enviar el SMS masivo: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  const showDetailedResults = (stats: SendResponse['estadisticas']) => {
    let detailedMessage = `Resultados del envío masivo:\n\n`;
    detailedMessage += `📊 Total enviados: ${stats.total_enviados}\n`;
    detailedMessage += `✅ Exitosos: ${stats.exitosos}\n`;
    detailedMessage += `❌ Fallidos: ${stats.fallidos}\n`;

    if (stats.errores && stats.errores.length > 0) {
      detailedMessage += `\n🚨 Errores:\n`;
      stats.errores.slice(0, 3).forEach((error, index) => {
        detailedMessage += `${index + 1}. ${error}\n`;
      });
      if (stats.errores.length > 3) {
        detailedMessage += `... y ${stats.errores.length - 3} más`;
      }
    }

    Alert.alert('Detalles del Envío', detailedMessage);
  };

  const resetForm = () => {
    setTitulo('');
    setMensaje('');
    setClientesSeleccionados([]);
    setFiltroGrupo(null);
    setResultadosEnvio(null);
  };

  const aplicarPlantilla = (plantilla: string) => {
    const plantillas = {
      mantenimiento: {
        titulo: 'Mantenimiento Programado',
        mensaje:
          'AVISO: Mantenimiento programado en su zona. Servicio interrumpido temporalmente. Disculpe las molestias - WellNet RD',
      },
      averia: {
        titulo: 'Avería Reportada',
        mensaje:
          'AVISO: Reportamos avería en su zona. Equipo técnico trabajando. Tiempo estimado: 2 horas. Info: (809) 555-1234 - WellNet RD',
      },
      restaurado: {
        titulo: 'Servicio Restaurado',
        mensaje:
          'SERVICIO RESTAURADO: Internet completamente restablecido. Reinicie su router. Gracias por su paciencia - WellNet RD',
      },
      emergencia: {
        titulo: 'Emergencia de Red',
        mensaje:
          'EMERGENCIA: Interrupción por corte eléctrico. Trabajamos 24/7. Actualizaciones: wellnet-rd.com - WellNet RD',
      },
    };

    const plantillaSeleccionada =
      plantillas[plantilla as keyof typeof plantillas];
    if (plantillaSeleccionada) {
      setTitulo(plantillaSeleccionada.titulo);
      setMensaje(plantillaSeleccionada.mensaje);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#ffffff' : '#333333'}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SMS Masivos</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadGroups}
          disabled={loading}>
          <Icon
            name="refresh"
            size={24}
            color={loading ? '#888888' : isDarkMode ? '#ffffff' : '#333333'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196f3" />
            <Text style={styles.loadingText}>
              Cargando grupos de clientes...
            </Text>
          </View>
        ) : (
          <>
            {/* Filtro de Grupos (Filtro Avanzado) */}
            <GroupSelector
              grupos={grupos}
              onFiltroAplicado={handleFiltroAplicado}
              loadingPreview={loadingPreview}
              isDarkMode={isDarkMode}
              ispId={ispId as any}
            />

            {/* Selector de Clientes Individual + Visualización de Filtro */}
            <ClienteSearchSelector
              onClientesSeleccionados={handleClientesSeleccionados}
              clientesSeleccionados={clientesSeleccionados}
              isDarkMode={isDarkMode}
              filtroGrupo={filtroGrupo}
            />

            {/* Compositor de Mensaje */}
            {clientesSeleccionados.length > 0 && (
              <MessageComposer
                titulo={titulo}
                mensaje={mensaje}
                onTituloChange={setTitulo}
                onMensajeChange={setMensaje}
                onAplicarPlantilla={aplicarPlantilla}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Panel de Envío */}
            {clientesSeleccionados.length > 0 && titulo && mensaje && (
              <SendPanel
                grupoSeleccionado={null} // Ya no usamos grupo seleccionado
                totalClientes={clientesSeleccionados.length}
                titulo={titulo}
                mensaje={mensaje}
                enviando={enviando}
                onSend={handleSend}
                onReset={resetForm}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Resultados del último envío */}
            {resultadosEnvio && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>📊 Último Envío</Text>
                <View style={styles.resultsGrid}>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultNumber}>
                      {resultadosEnvio.total_enviados}
                    </Text>
                    <Text style={styles.resultLabel}>Total</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={[styles.resultNumber, {color: '#28a745'}]}>
                      {resultadosEnvio.exitosos}
                    </Text>
                    <Text style={styles.resultLabel}>Exitosos</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={[styles.resultNumber, {color: '#dc3545'}]}>
                      {resultadosEnvio.fallidos}
                    </Text>
                    <Text style={styles.resultLabel}>Fallidos</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default SMSMassCampaignsScreen;
