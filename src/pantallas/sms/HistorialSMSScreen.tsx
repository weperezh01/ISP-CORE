import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HistorialSMS {
  id: number;
  cliente_nombre: string;
  telefono: string;
  mensaje: string;
  estado: string;
  fecha_envio: string;
  tipo_mensaje: string;
  monto?: string;
  id_factura?: string;
  error_detalle?: string;
  intentos: number;
}

interface Filtros {
  fechaDesde: string;
  fechaHasta: string;
  estado: string;
  telefono: string;
  tipoMensaje: string;
}

const HistorialSMSScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const { ispId } = (route.params as any) || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [historial, setHistorial] = useState<HistorialSMS[]>([]);
  const [historialFiltrado, setHistorialFiltrado] = useState<HistorialSMS[]>([]);
  const [showFiltros, setShowFiltros] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState<Filtros>({
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
    telefono: '',
    tipoMensaje: '',
  });

  const API_BASE = 'https://wellnet-rd.com:444/api';
  const itemsPorPagina = 20;

  const estadosDisponibles = [
    { value: '', label: 'Todos los estados' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'fallido', label: 'Fallido' },
    { value: 'pendiente', label: 'Pendiente' },
  ];

  const tiposMensaje = [
    { value: '', label: 'Todos los tipos' },
    { value: 'recordatorio', label: 'Recordatorio' },
    { value: 'urgente', label: 'Urgente' },
    { value: 'mora', label: 'Mora' },
    { value: 'corte', label: 'Corte' },
  ];

  useEffect(() => {
    cargarHistorial();
  }, [currentPage]);

  useEffect(() => {
    aplicarFiltros();
  }, [historial, filtros]);

  const cargarHistorial = async () => {
    try {
      console.log('🔄 [SMS History] Iniciando carga de historial...', { ispId, currentPage });
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPorPagina.toString(),
        ...(ispId ? { isp_id: String(ispId) } : {}),
      });

      const url = `${API_BASE}/sms/historial?${params}`;
      console.log('🔗 [SMS History] Cargando historial:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(ispId ? { 'X-ISP-ID': String(ispId) } : {}),
        },
      });

      console.log('📥 [SMS History] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SMS History] Error response:', errorText.slice(0, 300));
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [SMS History] Datos cargados:', { 
        historial: data.historial?.length || 0, 
        total: data.total,
        currentPage 
      });
      
      if (data.success) {
        if (currentPage === 1) {
          setHistorial(data.historial || []);
        } else {
          setHistorial(prev => [...prev, ...(data.historial || [])]);
        }
        setTotalPages(Math.ceil((data.total || 0) / itemsPorPagina));
      } else {
        console.error('❌ [SMS History] API returned success=false:', data.message);
        Alert.alert('Error', data.message || 'No se pudo cargar el historial');
      }
    } catch (error) {
      console.error('❌ [SMS History] Error cargando historial:', error);
      Alert.alert('Error', `No se pudo cargar el historial: ${error?.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...historial];

    // Filtrar por fecha desde
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter(item => 
        new Date(item.fecha_envio) >= fechaDesde
      );
    }

    // Filtrar por fecha hasta
    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
      resultado = resultado.filter(item => 
        new Date(item.fecha_envio) <= fechaHasta
      );
    }

    // Filtrar por estado
    if (filtros.estado) {
      resultado = resultado.filter(item => 
        item.estado === filtros.estado
      );
    }

    // Filtrar por teléfono
    if (filtros.telefono) {
      resultado = resultado.filter(item => 
        item.telefono.includes(filtros.telefono)
      );
    }

    // Filtrar por tipo de mensaje
    if (filtros.tipoMensaje) {
      resultado = resultado.filter(item => 
        item.tipo_mensaje === filtros.tipoMensaje
      );
    }

    setHistorialFiltrado(resultado);
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      estado: '',
      telefono: '',
      tipoMensaje: '',
    });
  };

  const cargarMasDatos = () => {
    if (currentPage < totalPages && !loading) {
      setCurrentPage(currentPage + 1);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await cargarHistorial();
    setRefreshing(false);
  };

  const exportarCSV = async () => {
    Alert.alert(
      'Exportar Historial',
      `¿Deseas exportar ${historialFiltrado.length} registros a CSV?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: async () => {
            try {
              console.log('📤 [SMS History] Iniciando exportación CSV...', { filtros, ispId });
              setExporting(true);
              
              const params = new URLSearchParams({
                formato: 'csv',
                ...(ispId && { isp_id: String(ispId) }),
                ...(filtros.fechaDesde && { fecha_desde: filtros.fechaDesde }),
                ...(filtros.fechaHasta && { fecha_hasta: filtros.fechaHasta }),
                ...(filtros.estado && { estado: filtros.estado }),
                ...(filtros.telefono && { telefono: filtros.telefono }),
                ...(filtros.tipoMensaje && { tipo_mensaje: filtros.tipoMensaje }),
              });

              const url = `${API_BASE}/sms/historial/export?${params}`;
              console.log('🔗 [SMS History] URL de exportación:', url);

              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  ...(ispId ? { 'X-ISP-ID': String(ispId) } : {}),
                },
              });

              console.log('📥 [SMS History] Response status export:', response.status);

              if (response.ok) {
                console.log('✅ [SMS History] Exportación exitosa');
                Alert.alert('Éxito', 'El archivo CSV ha sido generado y está disponible para descarga');
              } else {
                const errorText = await response.text();
                console.error('❌ [SMS History] Error en exportación:', errorText.slice(0, 300));
                Alert.alert('Error', 'No se pudo generar el archivo CSV');
              }
            } catch (error) {
              console.error('❌ [SMS History] Error exportando:', error);
              Alert.alert('Error', `No se pudo exportar el historial: ${error?.message || 'Error desconocido'}`);
            } finally {
              setExporting(false);
            }
          }
        }
      ]
    );
  };

  const getIconoEstado = (estado: string) => {
    switch (estado) {
      case 'enviado': return 'check-circle';
      case 'fallido': return 'error';
      case 'pendiente': return 'access-time';
      default: return 'help';
    }
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'enviado': return '#28a745';
      case 'fallido': return '#dc3545';
      case 'pendiente': return '#ffc107';
      default: return '#6c757d';
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

  const renderHistorialItem = ({ item }: { item: HistorialSMS }) => (
    <View style={[styles.innerCard, { marginBottom: 12 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Icon 
          name={getIconoEstado(item.estado)} 
          size={20} 
          color={getColorEstado(item.estado)} 
        />
        <Text style={[styles.itemName, { marginLeft: 8, fontSize: 16, flex: 1 }]}>
          {item.cliente_nombre}
        </Text>
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          backgroundColor: getColorTipoMensaje(item.tipo_mensaje) + '20',
        }}>
          <Text style={{
            fontSize: 10,
            fontWeight: 'bold',
            color: getColorTipoMensaje(item.tipo_mensaje),
          }}>
            {item.tipo_mensaje.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 8 }}>
        <Text style={styles.itemDetails}>
          📞 {item.telefono} • Estado: {item.estado}
          {item.intentos > 1 && ` • Intentos: ${item.intentos}`}
        </Text>
        <Text style={styles.itemDetails}>
          📅 {formatearFecha(item.fecha_envio)}
          {item.monto && ` • 💰 ${item.monto}`}
          {item.id_factura && ` • #${item.id_factura}`}
        </Text>
      </View>

      <Text style={[styles.itemDetails, { 
        fontStyle: 'italic', 
        backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
        padding: 8,
        borderRadius: 4,
        fontSize: 12,
        marginBottom: item.error_detalle ? 8 : 0
      }]}>
        "{item.mensaje}"
      </Text>

      {item.error_detalle && (
        <View style={{
          backgroundColor: '#dc3545' + '20',
          padding: 8,
          borderRadius: 4,
          borderLeftWidth: 4,
          borderLeftColor: '#dc3545',
        }}>
          <Text style={[styles.itemDetails, { color: '#dc3545', fontSize: 12 }]}>
            ⚠️ Error: {item.error_detalle}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading && currentPage === 1) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={[styles.text, { marginTop: 16 }]}>Cargando historial...</Text>
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
        <Text style={styles.title}>Historial SMS</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            onPress={() => setShowFiltros(true)}
            style={{ marginRight: 16 }}
          >
            <Icon name="filter-list" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={exportarCSV}>
            <Icon name="file-download" size={24} color="#28a745" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Información de filtros activos */}
      {(filtros.fechaDesde || filtros.fechaHasta || filtros.estado || filtros.telefono || filtros.tipoMensaje) && (
        <View style={[styles.card, { marginHorizontal: 10, marginTop: 10 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.itemDetails, { fontSize: 12 }]}>
              Filtros activos • {historialFiltrado.length} de {historial.length} registros
            </Text>
            <TouchableOpacity onPress={limpiarFiltros}>
              <Text style={[styles.itemDetails, { color: '#007bff', fontSize: 12 }]}>
                Limpiar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lista de Historial */}
      <FlatList
        data={historialFiltrado}
        renderItem={renderHistorialItem}
        keyExtractor={(item) => item.id.toString()}
        style={{ flex: 1, paddingHorizontal: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={cargarMasDatos}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Icon name="sms" size={64} color="#6c757d" />
            <Text style={[styles.itemName, { marginTop: 16 }]}>
              Sin historial
            </Text>
            <Text style={styles.itemDetails}>
              No se encontraron SMS en el historial
            </Text>
          </View>
        }
        ListFooterComponent={
          loading && currentPage > 1 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#007bff" />
            </View>
          ) : null
        }
      />

      {/* Modal de Filtros */}
      <Modal visible={showFiltros} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={[styles.card, { width: '95%', maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.cardTitle}>Filtrar Historial</Text>
              <TouchableOpacity onPress={() => setShowFiltros(false)}>
                <Icon name="close" size={24} color={isDarkMode ? 'white' : 'black'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Filtro por fechas */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fecha Desde</Text>
                <TextInput
                  style={styles.input}
                  value={filtros.fechaDesde}
                  onChangeText={(text) => setFiltros({...filtros, fechaDesde: text})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fecha Hasta</Text>
                <TextInput
                  style={styles.input}
                  value={filtros.fechaHasta}
                  onChangeText={(text) => setFiltros({...filtros, fechaHasta: text})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                />
              </View>

              {/* Filtro por estado */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Estado</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {estadosDisponibles.map((estado) => (
                    <TouchableOpacity
                      key={estado.value}
                      style={[
                        styles.statusButton,
                        { 
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          backgroundColor: filtros.estado === estado.value ? '#007bff' : '#6c757d'
                        }
                      ]}
                      onPress={() => setFiltros({...filtros, estado: estado.value})}
                    >
                      <Text style={[styles.statusButtonText, { fontSize: 12 }]}>
                        {estado.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro por tipo de mensaje */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tipo de Mensaje</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {tiposMensaje.map((tipo) => (
                    <TouchableOpacity
                      key={tipo.value}
                      style={[
                        styles.statusButton,
                        { 
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          backgroundColor: filtros.tipoMensaje === tipo.value ? getColorTipoMensaje(tipo.value || 'recordatorio') : '#6c757d'
                        }
                      ]}
                      onPress={() => setFiltros({...filtros, tipoMensaje: tipo.value})}
                    >
                      <Text style={[styles.statusButtonText, { fontSize: 12 }]}>
                        {tipo.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro por teléfono */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={filtros.telefono}
                  onChangeText={(text) => setFiltros({...filtros, telefono: text})}
                  placeholder="Ingresa número de teléfono"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                />
              </View>

              {/* Botones */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.deleteButton, { flex: 1, marginRight: 8 }]}
                  onPress={limpiarFiltros}
                >
                  <Text style={styles.buttonText}>Limpiar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, { flex: 1, marginLeft: 8 }]}
                  onPress={() => setShowFiltros(false)}
                >
                  <Text style={styles.buttonText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Loading overlay para exportar */}
      {exporting && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={[styles.card, { padding: 24, alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={[styles.text, { marginTop: 16 }]}>
              Generando CSV...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default HistorialSMSScreen;