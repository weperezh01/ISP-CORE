import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EventoSMSCard from './components/EventoSMSCard';

interface SMSEvento {
  id?: number;
  dias_antes_vencimiento: number;
  mensaje: string;
  activo: boolean;
  tipo_mensaje: string;
  orden_envio: number;
}

interface SMSAgenda {
  id?: number;
  id_isp: number;
  nombre_agenda: string;
  descripcion: string;
  activa: boolean;
}

const ConfiguracionSMSScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agenda, setAgenda] = useState<SMSAgenda | null>(null);
  const [eventos, setEventos] = useState<SMSEvento[]>([]);
  const [nombreAgenda, setNombreAgenda] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [userIsp, setUserIsp] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const API_BASE = 'https://wellnet-rd.com:444/api';
  
  // Obtener ispId desde los parámetros de navegación
  const { ispId } = route.params || {};

  const variables = [
    { key: '{cliente}', example: 'Juan Pérez' },
    { key: '{monto}', example: 'RD$1,200.00' },
    { key: '{fecha_vencimiento}', example: '15/09/2025' },
    { key: '{dias_gracia}', example: '5' },
    { key: '{isp_nombre}', example: 'Well Net Technologies' },
    { key: '{id_factura}', example: '12345' },
  ];

  const tiposMensaje = [
    { value: 'recordatorio', label: 'Recordatorio' },
    { value: 'urgente', label: 'Urgente' },
    { value: 'mora', label: 'Mora' },
    { value: 'corte', label: 'Corte' },
  ];

  const momentosEnvio = [
    { value: -7, label: '7 días antes' },
    { value: -5, label: '5 días antes' },
    { value: -3, label: '3 días antes' },
    { value: -2, label: '2 días antes' },
    { value: -1, label: '1 día antes' },
    { value: 0, label: 'Día del vencimiento' },
    { value: 1, label: '1 día después' },
    { value: 2, label: '2 días después' },
    { value: 3, label: '3 días después' },
    { value: 5, label: '5 días después' },
    { value: 7, label: '7 días después' },
  ];

  const plantillasPredefinidas = {
    estandar: [
      { dias: -3, mensaje: 'Hola {cliente}, tu factura de {monto} vence en 3 días. ¡No olvides pagarla! - {isp_nombre}', tipo: 'recordatorio' },
      { dias: -1, mensaje: '{cliente}, tu factura de {monto} vence mañana. Evita cortes pagando hoy. - {isp_nombre}', tipo: 'urgente' },
      { dias: 0, mensaje: '{cliente}, tu factura de {monto} vence HOY. Paga antes de las 6pm para evitar corte. - {isp_nombre}', tipo: 'urgente' },
      { dias: 1, mensaje: '{cliente}, tu servicio será suspendido. Factura #{id_factura} de {monto} está vencida. Paga urgente. - {isp_nombre}', tipo: 'mora' },
    ],
    conservador: [
      { dias: -5, mensaje: 'Estimado {cliente}, le recordamos que su factura de {monto} vence en 5 días. - {isp_nombre}', tipo: 'recordatorio' },
      { dias: -2, mensaje: '{cliente}, su factura de {monto} vence en 2 días. Por favor realice su pago. - {isp_nombre}', tipo: 'recordatorio' },
      { dias: 0, mensaje: '{cliente}, su factura de {monto} vence hoy. Evite inconvenientes pagando a tiempo. - {isp_nombre}', tipo: 'urgente' },
    ],
    agresivo: [
      { dias: -3, mensaje: '{cliente}! Tu factura de {monto} vence en 3 días. ¡PAGA YA! - {isp_nombre}', tipo: 'recordatorio' },
      { dias: -1, mensaje: '⚠️ {cliente}, ÚLTIMO AVISO: Factura de {monto} vence mañana. Paga o serás cortado. - {isp_nombre}', tipo: 'urgente' },
      { dias: 0, mensaje: '🚨 {cliente}, TU FACTURA DE {monto} VENCE HOY. Paga AHORA o corte inmediato. - {isp_nombre}', tipo: 'urgente' },
      { dias: 1, mensaje: '❌ {cliente}, SERVICIO SUSPENDIDO. Factura #{id_factura} vencida. Paga {monto} para reconexión. - {isp_nombre}', tipo: 'corte' },
      { dias: 2, mensaje: '⛔ {cliente}, 2do día sin pago. Reconecta pagando {monto} + recargo. Factura #{id_factura}. - {isp_nombre}', tipo: 'corte' },
      { dias: 3, mensaje: '🔴 {cliente}, 3 días de mora. Paga {monto} + recargos o cancelación definitiva. - {isp_nombre}', tipo: 'corte' },
    ],
    minimo: [
      { dias: -1, mensaje: '{cliente}, tu factura de {monto} vence mañana. - {isp_nombre}', tipo: 'recordatorio' },
      { dias: 0, mensaje: '{cliente}, tu factura de {monto} vence hoy. - {isp_nombre}', tipo: 'urgente' },
    ],
  };

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('@loginData');
      if (!userData) {
        console.log('🚫 [SMS CONFIG] No hay datos de usuario en AsyncStorage');
        Alert.alert('Error', 'No se pudo obtener información del usuario');
        return;
      }

      const user = JSON.parse(userData);
      console.log('👤 [SMS CONFIG] Usuario cargado:', { id: user.id, nombre: user.nombre });
      console.log('📋 [SMS CONFIG] ispId desde parámetros:', ispId);
      setUserIsp(user);

      const token = user.token;
      const url = `${API_BASE}/sms/agenda/${ispId}`;
      console.log('🔗 [SMS CONFIG] Llamando endpoint:', url);
      console.log('🔑 [SMS CONFIG] Token:', token ? `${token.substring(0, 20)}...` : 'No token');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 [SMS CONFIG] Response status:', response.status);
      console.log('📥 [SMS CONFIG] Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('📥 [SMS CONFIG] Response data type:', typeof responseText);
      console.log('📥 [SMS CONFIG] Response content preview:', responseText.substring(0, 200));

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ [SMS CONFIG] JSON parsed successfully:', data);
      } catch (parseError) {
        console.error('❌ [SMS CONFIG] JSON Parse Error:', parseError.message);
        console.log('📄 [SMS CONFIG] Raw response:', responseText);
        throw new Error('El servidor retornó HTML en lugar de JSON. Endpoint posiblemente no existe.');
      }
      
      if (data.success) {
        console.log('✅ [SMS CONFIG] Configuración cargada exitosamente');
        setAgenda(data.agenda);
        setEventos(data.eventos || []);
        setNombreAgenda(data.agenda?.nombre_agenda || '');
        setDescripcion(data.agenda?.descripcion || '');
      } else {
        console.log('⚠️ [SMS CONFIG] No hay configuración existente, inicializando nueva');
        inicializarConfiguracion(user);
      }
    } catch (error) {
      console.error('❌ [SMS CONFIG] Error cargando configuración:', error.message);
      console.error('❌ [SMS CONFIG] Error stack:', error.stack);
      Alert.alert('Error', `No se pudo cargar la configuración: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inicializarConfiguracion = (user: any) => {
    setNombreAgenda(`Recordatorios ${user?.nombre || 'SMS'}`);
    setDescripcion('Configuración de recordatorios automáticos');
    setEventos([]);
  };

  const agregarEvento = () => {
    const nuevoEvento: SMSEvento = {
      dias_antes_vencimiento: -3,
      mensaje: 'Hola {cliente}, tu factura de {monto} vence en 3 días. - {isp_nombre}',
      activo: true,
      tipo_mensaje: 'recordatorio',
      orden_envio: eventos.length + 1,
    };
    setEventos([...eventos, nuevoEvento]);
  };

  const eliminarEvento = (index: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este recordatorio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          const nuevosEventos = eventos.filter((_, i) => i !== index);
          setEventos(nuevosEventos);
        }},
      ]
    );
  };

  const actualizarEvento = (index: number, campo: keyof SMSEvento, valor: any) => {
    const nuevosEventos = [...eventos];
    nuevosEventos[index] = { ...nuevosEventos[index], [campo]: valor };
    setEventos(nuevosEventos);
  };

  const insertarVariable = (eventoIndex: number, variable: string) => {
    const evento = eventos[eventoIndex];
    const nuevoMensaje = evento.mensaje + variable;
    actualizarEvento(eventoIndex, 'mensaje', nuevoMensaje);
  };

  const aplicarPlantilla = (plantilla: string) => {
    const eventosPlantilla = plantillasPredefinidas[plantilla];
    const nuevosEventos = eventosPlantilla.map((item, index) => ({
      dias_antes_vencimiento: item.dias,
      mensaje: item.mensaje,
      activo: true,
      tipo_mensaje: item.tipo,
      orden_envio: index + 1,
    }));
    setEventos(nuevosEventos);
    setShowTemplateModal(false);
  };

  const guardarConfiguracion = async () => {
    console.log('💾 [SMS SAVE] Iniciando proceso de guardado');
    
    if (!nombreAgenda.trim()) {
      console.log('❌ [SMS SAVE] Error: Nombre de agenda vacío');
      Alert.alert('Error', 'Por favor ingresa un nombre para la agenda');
      return;
    }

    if (eventos.length === 0) {
      console.log('❌ [SMS SAVE] Error: No hay eventos configurados');
      Alert.alert('Error', 'Debes agregar al menos un recordatorio');
      return;
    }

    try {
      setSaving(true);
      console.log('🔄 [SMS SAVE] Obteniendo datos del usuario...');
      
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user) {
        console.log('❌ [SMS SAVE] Error: No se encontraron datos de usuario');
        Alert.alert('Error', 'No se pudo obtener información del usuario');
        return;
      }
      
      console.log('👤 [SMS SAVE] Usuario:', { id: user.id, nombre: user.nombre });
      console.log('📋 [SMS SAVE] ispId desde parámetros:', ispId);
      
      const token = user?.token;
      console.log('🔑 [SMS SAVE] Token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const payload = {
        nombre_agenda: nombreAgenda,
        descripcion: descripcion,
        eventos: eventos,
      };
      
      console.log('📦 [SMS SAVE] Payload a enviar:', JSON.stringify(payload, null, 2));

      const url = `${API_BASE}/sms/agenda/${ispId}`;
      console.log('🔗 [SMS SAVE] Llamando endpoint PUT:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 [SMS SAVE] Response status:', response.status);
      console.log('📥 [SMS SAVE] Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('📥 [SMS SAVE] Response data type:', typeof responseText);
      console.log('📥 [SMS SAVE] Response content preview:', responseText.substring(0, 200));

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ [SMS SAVE] JSON parsed successfully:', data);
      } catch (parseError) {
        console.error('❌ [SMS SAVE] JSON Parse Error:', parseError.message);
        console.log('📄 [SMS SAVE] Raw response:', responseText);
        Alert.alert('Error', 'El servidor retornó una respuesta inválida. Revisa los logs para más detalles.');
        return;
      }
      
      if (data.success) {
        console.log('✅ [SMS SAVE] Configuración guardada exitosamente');
        Alert.alert('Éxito', 'Configuración guardada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        console.log('❌ [SMS SAVE] Error del servidor:', data.message);
        Alert.alert('Error', data.message || 'No se pudo guardar la configuración');
      }
    } catch (error) {
      console.error('❌ [SMS SAVE] Error guardando configuración:', error.message);
      console.error('❌ [SMS SAVE] Error stack:', error.stack);
      Alert.alert('Error', `No se pudo guardar la configuración: ${error.message}`);
    } finally {
      console.log('🏁 [SMS SAVE] Proceso de guardado finalizado');
      setSaving(false);
    }
  };

  const probarConfiguracion = async () => {
    if (eventos.length === 0) {
      Alert.alert('Error', 'Primero configura al menos un recordatorio');
      return;
    }

    Alert.alert(
      'Probar Configuración',
      '¿Deseas ejecutar una prueba de envío de recordatorios con la configuración actual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Probar',
          onPress: () => navigation.navigate('MonitoreoSMSScreen')
        }
      ]
    );
  };

  const reemplazarVariables = (mensaje: string) => {
    let mensajeEjemplo = mensaje;
    variables.forEach(variable => {
      mensajeEjemplo = mensajeEjemplo.replace(new RegExp(variable.key, 'g'), variable.example);
    });
    return mensajeEjemplo;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={[styles.text, { marginTop: 16 }]}>Cargando configuración...</Text>
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
        <Text style={styles.title}>Configuración SMS</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('MonitoreoSMSScreen')}
            style={{ marginRight: 16 }}
          >
            <Icon name="dashboard" size={24} color="#28a745" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('HistorialSMSScreen')}>
            <Icon name="history" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Información del ISP */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="business" size={24} color={isDarkMode ? '#BB86FC' : '#6200EE'} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.cardTitle}>ISP: {userIsp?.nombre || 'Cargando...'}</Text>
              <Text style={styles.cardDetail}>
                Sistema SMS: {agenda?.activa ? 'Activo' : 'Configurando...'}
              </Text>
            </View>
          </View>
        </View>

        {/* Configuración Principal */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Agenda de Recordatorios</Text>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { 
              marginBottom: 6, 
              fontSize: 13,
              fontWeight: '500',
              color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
            }]}>
              Nombre de la agenda *
            </Text>
            <TextInput
              style={[styles.input, {
                minHeight: 48,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: isDarkMode ? '#4a4a4a' : '#d0d0d0',
                borderRadius: 8,
                fontSize: 14,
                color: isDarkMode ? '#ffffff' : '#1a1a1a',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff'
              }]}
              value={nombreAgenda}
              onChangeText={setNombreAgenda}
              placeholder="Ej: Recordatorios de Facturación Well Net"
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              maxLength={100}
            />
            <Text style={[styles.itemDetails, { 
              fontSize: 11,
              marginTop: 4,
              color: isDarkMode ? '#b0b0b0' : '#666666'
            }]}>
              {nombreAgenda.length}/100 caracteres
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { 
              marginBottom: 6, 
              fontSize: 13,
              fontWeight: '500',
              color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
            }]}>
              Descripción <Text style={{ opacity: 0.6 }}>(opcional)</Text>
            </Text>
            <TextInput
              style={[styles.notebox, {
                minHeight: 80,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: isDarkMode ? '#4a4a4a' : '#d0d0d0',
                borderRadius: 8,
                fontSize: 14,
                color: isDarkMode ? '#ffffff' : '#1a1a1a',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                textAlignVertical: 'top'
              }]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe el propósito de esta agenda de recordatorios SMS..."
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              multiline
              maxLength={250}
              numberOfLines={3}
            />
            <Text style={[styles.itemDetails, { 
              fontSize: 11,
              marginTop: 4,
              color: isDarkMode ? '#b0b0b0' : '#666666'
            }]}>
              {descripcion.length}/250 caracteres
            </Text>
          </View>
        </View>

        {/* Lista de Eventos */}
        <View style={styles.card}>
          <View style={styles.buttonContainer2}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>Recordatorios ({eventos.length})</Text>
              <TouchableOpacity 
                onPress={() => setShowTemplateModal(true)}
                style={styles.editButton}
              >
                <Text style={styles.buttonText}>Plantillas</Text>
              </TouchableOpacity>
            </View>
            
            {eventos.map((evento, index) => (
              <EventoSMSCard
                key={index}
                evento={evento}
                index={index}
                onUpdate={actualizarEvento}
                onDelete={eliminarEvento}
                onInsertVariable={insertarVariable}
                momentosEnvio={momentosEnvio}
                tiposMensaje={tiposMensaje}
                variables={variables}
                isDarkMode={isDarkMode}
                styles={styles}
              />
            ))}

            <TouchableOpacity style={styles.addButton} onPress={agregarEvento}>
              <Icon name="add" size={24} color="white" />
              <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                Agregar Recordatorio
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vista Previa */}
        {eventos.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Vista Previa</Text>
            <TouchableOpacity 
              style={styles.statusButton}
              onPress={() => setShowPreview(!showPreview)}
            >
              <Text style={styles.statusButtonText}>
                {showPreview ? 'Ocultar' : 'Ver'} Timeline de Mensajes
              </Text>
            </TouchableOpacity>
            
            {showPreview && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.cardDetail, { marginBottom: 12 }]}>
                  Ejemplo: Factura $1,200 que vence el 15/09/2025
                </Text>
                {eventos
                  .sort((a, b) => a.dias_antes_vencimiento - b.dias_antes_vencimiento)
                  .map((evento, index) => (
                    <View key={index} style={[styles.innerCard, { marginBottom: 8 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Icon 
                          name={evento.dias_antes_vencimiento <= 0 ? 'schedule' : 'access-time'} 
                          size={16} 
                          color={evento.tipo_mensaje === 'corte' ? '#dc3545' : 
                                evento.tipo_mensaje === 'urgente' ? '#ffc107' : '#28a745'} 
                        />
                        <Text style={[styles.itemDetails, { marginLeft: 8 }]}>
                          {momentosEnvio.find(m => m.value === evento.dias_antes_vencimiento)?.label} - 
                          {tiposMensaje.find(t => t.value === evento.tipo_mensaje)?.label}
                        </Text>
                      </View>
                      <Text style={[styles.itemDetails, { fontStyle: 'italic' }]}>
                        "{reemplazarVariables(evento.mensaje)}"
                      </Text>
                      <Text style={[styles.itemDetails, { fontSize: 12, marginTop: 4 }]}>
                        Caracteres: {evento.mensaje.length}/160
                      </Text>
                    </View>
                  ))}
              </View>
            )}
          </View>
        )}

        {/* Accesos Rápidos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity 
              style={[styles.statusButton, { flex: 1, marginRight: 8, backgroundColor: '#28a745' }]}
              onPress={() => navigation.navigate('MonitoreoSMSScreen')}
            >
              <Icon name="dashboard" size={20} color="white" />
              <Text style={[styles.statusButtonText, { fontSize: 12, marginTop: 4 }]}>
                Monitoreo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statusButton, { flex: 1, marginLeft: 8, backgroundColor: '#007bff' }]}
              onPress={() => navigation.navigate('HistorialSMSScreen')}
            >
              <Icon name="history" size={20} color="white" />
              <Text style={[styles.statusButtonText, { fontSize: 12, marginTop: 4 }]}>
                Historial
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón Guardar */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity 
            style={[styles.button, { opacity: saving ? 0.6 : 1 }]} 
            onPress={guardarConfiguracion}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Guardar Configuración</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Plantillas */}
      <Modal visible={showTemplateModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={[styles.card, { width: '90%', maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.cardTitle}>Plantillas Predefinidas</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <Icon name="close" size={24} color={isDarkMode ? 'white' : 'black'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {Object.entries(plantillasPredefinidas).map(([key, eventos]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.statusButton, { marginBottom: 12 }]}
                  onPress={() => aplicarPlantilla(key)}
                >
                  <Text style={styles.statusButtonText}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} ({eventos.length} mensajes)
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConfiguracionSMSScreen;