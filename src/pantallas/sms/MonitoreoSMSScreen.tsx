import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface RecordatorioPendiente {
  id: number;
  cliente_nombre: string;
  telefono: string;
  monto: string;
  fecha_vencimiento: string;
  dias_hasta_vencimiento: number;
  mensaje: string;
  tipo_mensaje: string;
}

interface Estadisticas {
  sms_enviados_hoy: number;
  sms_enviados_semana: number;
  sms_enviados_mes: number;
  recordatorios_pendientes: number;
  tasa_entrega: number;
  ultimo_envio: string;
}

interface UltimoSMS {
  id: number;
  cliente_nombre: string;
  telefono: string;
  mensaje: string;
  estado: string;
  fecha_envio: string;
  error_detalle?: string;
}

const MonitoreoSMSScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const { ispId } = (route.params as any) || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [recordatoriosPendientes, setRecordatoriosPendientes] = useState<RecordatorioPendiente[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [ultimosSMS, setUltimosSMS] = useState<UltimoSMS[]>([]);
  const [userIsp, setUserIsp] = useState(null);

  const API_BASE = 'https://wellnet-rd.com:444/api';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      console.log('🔄 [SMS Monitor] Iniciando carga de datos...', { ispId });
      setLoading(true);

      console.log('🚀 [SMS Monitor] Ejecutando llamadas a APIs en paralelo...');
      await Promise.all([
        cargarRecordatoriosPendientes(),
        cargarEstadisticas(),
        cargarUltimosSMS(),
      ]);
      console.log('✅ [SMS Monitor] Todas las APIs completadas');
    } catch (error) {
      console.error('❌ [SMS Monitor] Error cargando datos:', error);
      Alert.alert('Error', `No se pudieron cargar los datos: ${error?.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const cargarRecordatoriosPendientes = async () => {
    try {
      const url = ispId 
        ? `${API_BASE}/sms/recordatorios-pendientes?isp_id=${encodeURIComponent(String(ispId))}`
        : `${API_BASE}/sms/recordatorios-pendientes`;
      
      console.log('🔗 [SMS Monitor] Cargando recordatorios pendientes:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(ispId ? { 'X-ISP-ID': String(ispId) } : {}),
        },
      });

      console.log('📥 [SMS Monitor] Response status recordatorios:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SMS Monitor] Error response recordatorios:', errorText.slice(0, 300));
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [SMS Monitor] Recordatorios cargados:', data.recordatorios?.length || 0, 'items');
      
      if (data.success) {
        setRecordatoriosPendientes(data.recordatorios || []);
      } else {
        console.error('❌ [SMS Monitor] API returned success=false for recordatorios:', data.message);
      }
    } catch (error) {
      console.error('❌ [SMS Monitor] Error cargando recordatorios pendientes:', error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const url = ispId 
        ? `${API_BASE}/sms/estadisticas?isp_id=${encodeURIComponent(String(ispId))}`
        : `${API_BASE}/sms/estadisticas`;
      
      console.log('🔗 [SMS Monitor] Cargando estadísticas:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(ispId ? { 'X-ISP-ID': String(ispId) } : {}),
        },
      });

      console.log('📥 [SMS Monitor] Response status estadísticas:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SMS Monitor] Error response estadísticas:', errorText.slice(0, 300));
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [SMS Monitor] Estadísticas cargadas:', data.estadisticas);
      
      if (data.success) {
        setEstadisticas(data.estadisticas);
      } else {
        console.error('❌ [SMS Monitor] API returned success=false for estadisticas:', data.message);
      }
    } catch (error) {
      console.error('❌ [SMS Monitor] Error cargando estadísticas:', error);
    }
  };

  const cargarUltimosSMS = async () => {
    try {
      const baseUrl = `${API_BASE}/sms/historial?limit=10`;
      const url = ispId 
        ? `${baseUrl}&isp_id=${encodeURIComponent(String(ispId))}`
        : baseUrl;
      
      console.log('🔗 [SMS Monitor] Cargando últimos SMS:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(ispId ? { 'X-ISP-ID': String(ispId) } : {}),
        },
      });

      console.log('📥 [SMS Monitor] Response status historial:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SMS Monitor] Error response historial:', errorText.slice(0, 300));
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [SMS Monitor] Historial cargado:', data.historial?.length || 0, 'items');
      
      if (data.success) {
        setUltimosSMS(data.historial || []);
      } else {
        console.error('❌ [SMS Monitor] API returned success=false for historial:', data.message);
      }
    } catch (error) {
      console.error('❌ [SMS Monitor] Error cargando últimos SMS:', error);
    }
  };

  const ejecutarEnviosAhora = async () => {
    Alert.alert(
      'Confirmar Envío',
      `¿Deseas ejecutar los ${recordatoriosPendientes.length} recordatorios pendientes ahora?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ejecutar',
          style: 'default',
          onPress: async () => {
            try {
              setProcesando(true);
              const url = ispId 
                ? `${API_BASE}/sms/procesar-recordatorios-diarios?isp_id=${encodeURIComponent(String(ispId))}`
                : `${API_BASE}/sms/procesar-recordatorios-diarios`;
              
              console.log('🚀 [SMS Monitor] Ejecutando recordatorios:', url);
              
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(ispId ? { 'X-ISP-ID': String(ispId) } : {}),
                },
              });
              
              console.log('📥 [SMS Monitor] Response status ejecutar:', response.status);

              const data = await response.json();
              if (data.success) {
                Alert.alert(
                  'Éxito',
                  `Se han procesado ${data.enviados || 0} recordatorios correctamente`,
                  [{ text: 'OK', onPress: () => cargarDatos() }]
                );
              } else {
                Alert.alert('Error', data.message || 'No se pudieron enviar los recordatorios');
              }
            } catch (error) {
              console.error('Error ejecutando envíos:', error);
              Alert.alert('Error', 'No se pudieron enviar los recordatorios');
            } finally {
              setProcesando(false);
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  const getIconoTipoMensaje = (tipo: string) => {
    switch (tipo) {
      case 'recordatorio': return 'access-time';
      case 'urgente': return 'warning';
      case 'mora': return 'error';
      case 'corte': return 'block';
      default: return 'sms';
    }
  };

  const getColorTipoMensaje = (tipo: string) => {
    switch (tipo) {
      case 'recordatorio': return '#28a745';
      case 'urgente': return '#ffc107';
      case 'mora': return '#fd7e14';
      case 'corte': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={[styles.text, { marginTop: 16 }]}>Cargando monitoreo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.containerSuperior}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={isDarkMode ? 'white' : 'black'} />
        </TouchableOpacity>
        <Text style={styles.title}>Monitoreo SMS</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HistorialSMSScreen')}>
          <Icon name="history" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Estadísticas Rápidas */}
        {estadisticas && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <View style={[styles.innerCard, { width: '48%', marginBottom: 12 }]}>
                <Icon name="today" size={24} color="#007bff" />
                <Text style={[styles.itemName, { marginTop: 8 }]}>Hoy</Text>
                <Text style={[styles.cardDetail, { fontSize: 24, fontWeight: 'bold' }]}>
                  {estadisticas.sms_enviados_hoy}
                </Text>
              </View>

              <View style={[styles.innerCard, { width: '48%', marginBottom: 12 }]}>
                <Icon name="date-range" size={24} color="#28a745" />
                <Text style={[styles.itemName, { marginTop: 8 }]}>Esta Semana</Text>
                <Text style={[styles.cardDetail, { fontSize: 24, fontWeight: 'bold' }]}>
                  {estadisticas.sms_enviados_semana}
                </Text>
              </View>

              <View style={[styles.innerCard, { width: '48%', marginBottom: 12 }]}>
                <Icon name="calendar-today" size={24} color="#ffc107" />
                <Text style={[styles.itemName, { marginTop: 8 }]}>Este Mes</Text>
                <Text style={[styles.cardDetail, { fontSize: 24, fontWeight: 'bold' }]}>
                  {estadisticas.sms_enviados_mes}
                </Text>
              </View>

              <View style={[styles.innerCard, { width: '48%', marginBottom: 12 }]}>
                <Icon name="check-circle" size={24} color="#17a2b8" />
                <Text style={[styles.itemName, { marginTop: 8 }]}>Tasa Entrega</Text>
                <Text style={[styles.cardDetail, { fontSize: 24, fontWeight: 'bold' }]}>
                  {estadisticas.tasa_entrega}%
                </Text>
              </View>
            </View>

            {estadisticas.ultimo_envio && (
              <Text style={[styles.itemDetails, { textAlign: 'center', marginTop: 12 }]}>
                Último envío: {formatearFecha(estadisticas.ultimo_envio)}
              </Text>
            )}
          </View>
        )}

        {/* Recordatorios Pendientes */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>
              Recordatorios Pendientes ({recordatoriosPendientes.length})
            </Text>
            
            {recordatoriosPendientes.length > 0 && (
              <TouchableOpacity
                style={[styles.button, { 
                  paddingVertical: 8, 
                  paddingHorizontal: 12, 
                  opacity: procesando ? 0.6 : 1 
                }]}
                onPress={ejecutarEnviosAhora}
                disabled={procesando}
              >
                {procesando ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Icon name="send" size={16} color="white" />
                    <Text style={[styles.buttonText, { marginLeft: 4, fontSize: 14 }]}>
                      Ejecutar Ahora
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {recordatoriosPendientes.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 24 }}>
              <Icon name="check-circle" size={48} color="#28a745" />
              <Text style={[styles.itemName, { marginTop: 12 }]}>
                ¡Todo al día!
              </Text>
              <Text style={styles.itemDetails}>
                No hay recordatorios pendientes por enviar
              </Text>
            </View>
          ) : (
            recordatoriosPendientes.slice(0, 10).map((recordatorio) => (
              <View key={recordatorio.id} style={[styles.innerCard, { marginBottom: 8 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon 
                    name={getIconoTipoMensaje(recordatorio.tipo_mensaje)} 
                    size={20} 
                    color={getColorTipoMensaje(recordatorio.tipo_mensaje)} 
                  />
                  <Text style={[styles.itemName, { marginLeft: 8, fontSize: 16 }]}>
                    {recordatorio.cliente_nombre}
                  </Text>
                  <View style={{
                    marginLeft: 'auto',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: getColorTipoMensaje(recordatorio.tipo_mensaje) + '20',
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: getColorTipoMensaje(recordatorio.tipo_mensaje),
                    }}>
                      {recordatorio.dias_hasta_vencimiento === 0 
                        ? 'Vence hoy' 
                        : recordatorio.dias_hasta_vencimiento > 0 
                          ? `+${recordatorio.dias_hasta_vencimiento}d` 
                          : `${recordatorio.dias_hasta_vencimiento}d`}
                    </Text>
                  </View>
                </View>

                <View style={{ marginBottom: 8 }}>
                  <Text style={styles.itemDetails}>
                    📞 {recordatorio.telefono} • 💰 {recordatorio.monto}
                  </Text>
                  <Text style={styles.itemDetails}>
                    📅 Vence: {new Date(recordatorio.fecha_vencimiento).toLocaleDateString('es-DO')}
                  </Text>
                </View>

                <Text style={[styles.itemDetails, { 
                  fontStyle: 'italic', 
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 12
                }]}>
                  "{recordatorio.mensaje}"
                </Text>
              </View>
            ))
          )}

          {recordatoriosPendientes.length > 10 && (
            <Text style={[styles.itemDetails, { textAlign: 'center', marginTop: 12 }]}>
              ... y {recordatoriosPendientes.length - 10} más
            </Text>
          )}
        </View>

        {/* Últimos SMS Enviados */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>Últimos SMS Enviados</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistorialSMSScreen')}>
              <Text style={[styles.itemDetails, { color: '#007bff' }]}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {ultimosSMS.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 24 }}>
              <Icon name="sms" size={48} color="#6c757d" />
              <Text style={[styles.itemName, { marginTop: 12 }]}>
                Sin historial
              </Text>
              <Text style={styles.itemDetails}>
                Aún no se han enviado SMS
              </Text>
            </View>
          ) : (
            ultimosSMS.map((sms) => (
              <View key={sms.id} style={[styles.innerCard, { marginBottom: 8 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon 
                    name={sms.estado === 'enviado' ? 'check-circle' : 'error'} 
                    size={16} 
                    color={sms.estado === 'enviado' ? '#28a745' : '#dc3545'} 
                  />
                  <Text style={[styles.itemName, { marginLeft: 8, fontSize: 14 }]}>
                    {sms.cliente_nombre}
                  </Text>
                  <Text style={[styles.itemDetails, { marginLeft: 'auto', fontSize: 12 }]}>
                    {formatearFecha(sms.fecha_envio)}
                  </Text>
                </View>

                <Text style={[styles.itemDetails, { marginBottom: 4 }]}>
                  📞 {sms.telefono} • Estado: {sms.estado}
                </Text>

                {sms.error_detalle && (
                  <Text style={[styles.itemDetails, { color: '#dc3545', fontSize: 12 }]}>
                    Error: {sms.error_detalle}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MonitoreoSMSScreen;