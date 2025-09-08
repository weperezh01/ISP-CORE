import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {StyleSheet} from 'react-native';

interface MessageComposerProps {
  titulo: string;
  mensaje: string;
  onTituloChange: (titulo: string) => void;
  onMensajeChange: (mensaje: string) => void;
  onAplicarPlantilla: (plantilla: string) => void;
  isDarkMode: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  titulo,
  mensaje,
  onTituloChange,
  onMensajeChange,
  onAplicarPlantilla,
  isDarkMode,
}) => {
  const [showPlantillas, setShowPlantillas] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const styles = getStyles(isDarkMode);

  const variables = [
    {
      key: '{cliente}',
      example: 'Juan Pérez',
      description: 'Nombre completo del cliente',
    },
    {
      key: '{monto}',
      example: 'RD$1,200.00',
      description: 'Monto de la factura con formato',
    },
    {
      key: '{fecha_vencimiento}',
      example: '15/09/2025',
      description: 'Fecha de vencimiento de la factura',
    },
    {
      key: '{dias_gracia}',
      example: '5',
      description: 'Días de gracia configurados',
    },
    {
      key: '{isp_nombre}',
      example: 'Well Net Technologies',
      description: 'Nombre del ISP/empresa',
    },
    {
      key: '{id_factura}',
      example: '12345',
      description: 'Número de ID de la factura',
    },
  ];

  const plantillas = [
    {
      id: 'mantenimiento',
      nombre: '🔧 Mantenimiento Programado',
      descripcion: 'Notificación de mantenimiento planificado',
      icono: 'build',
      color: '#ff9800',
    },
    {
      id: 'averia',
      nombre: '⚠️ Avería Reportada',
      descripcion: 'Notificación de problemas técnicos',
      icono: 'warning',
      color: '#dc3545',
    },
    {
      id: 'restaurado',
      nombre: '✅ Servicio Restaurado',
      descripcion: 'Confirmación de servicio restablecido',
      icono: 'check-circle',
      color: '#28a745',
    },
    {
      id: 'emergencia',
      nombre: '🚨 Emergencia de Red',
      descripcion: 'Alertas de emergencia críticas',
      icono: 'emergency',
      color: '#dc3545',
    },
  ];

  const caracteresRestantes = 160 - mensaje.length;
  const excedeLimite = caracteresRestantes < 0;

  const segmentos = Math.ceil(mensaje.length / 160);
  const costoEstimado = segmentos > 1 ? segmentos : 1;

  const getCharacterCountColor = () => {
    if (excedeLimite) return '#dc3545';
    if (caracteresRestantes < 20) return '#ff9800';
    return '#28a745';
  };

  const getSMSInfo = () => {
    if (mensaje.length === 0) return null;

    if (mensaje.length <= 160) {
      return {
        tipo: 'SMS Simple',
        segmentos: 1,
        caracteresMax: 160,
        color: '#28a745',
      };
    } else {
      return {
        tipo: 'SMS Múltiple',
        segmentos: Math.ceil(mensaje.length / 153), // 153 chars por segmento en SMS múltiples
        caracteresMax: 153,
        color: '#ff9800',
      };
    }
  };

  const smsInfo = getSMSInfo();

  const insertarVariable = (variable: string) => {
    const nuevoMensaje = mensaje + variable;
    onMensajeChange(nuevoMensaje);
  };

  const reemplazarVariables = (texto: string) => {
    let textoReemplazado = texto;
    variables.forEach(variable => {
      textoReemplazado = textoReemplazado.replace(
        new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g'),
        variable.example,
      );
    });
    return textoReemplazado;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="edit" size={24} color="#2196f3" />
        <Text style={styles.title}>📝 Compositor de Mensaje</Text>
      </View>

      {/* Campo Título */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Título del SMS:</Text>
        <TextInput
          style={styles.titleInput}
          value={titulo}
          onChangeText={onTituloChange}
          placeholder="Ej: Mantenimiento Programado"
          placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
          maxLength={50}
        />
        <Text style={styles.fieldHint}>
          Máximo 50 caracteres • {50 - titulo.length} restantes
        </Text>
      </View>

      {/* Campo Mensaje */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Mensaje SMS:</Text>
        <TextInput
          style={[
            styles.messageInput,
            excedeLimite && styles.messageInputError,
          ]}
          value={mensaje}
          onChangeText={onMensajeChange}
          placeholder="Escribe tu mensaje aquí..."
          placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
          multiline
          textAlignVertical="top"
          maxLength={320} // Permitir hasta 2 SMS
        />

        {/* Contador de caracteres y información SMS */}
        <View style={styles.messageInfoContainer}>
          <View style={styles.characterCount}>
            <Text
              style={[
                styles.characterCountText,
                {color: getCharacterCountColor()},
              ]}>
              {mensaje.length}/160 caracteres
            </Text>
            {smsInfo && (
              <View style={styles.smsInfoBadge}>
                <Text style={[styles.smsInfoText, {color: smsInfo.color}]}>
                  {smsInfo.segmentos} SMS{' '}
                  {smsInfo.segmentos > 1
                    ? `(${smsInfo.caracteresMax} c/u)`
                    : ''}
                </Text>
              </View>
            )}
          </View>

          {excedeLimite && (
            <Text style={styles.exceedWarning}>
              ⚠️ El mensaje excede 160 caracteres y se enviará como múltiples
              SMS
            </Text>
          )}
        </View>
      </View>

      {/* Botón Variables */}
      <TouchableOpacity
        style={styles.variablesButton}
        onPress={() => setShowVariables(!showVariables)}>
        <Icon name="code" size={20} color="#28a745" />
        <Text style={styles.variablesButtonText}>
          {showVariables ? 'Ocultar Variables' : 'Variables Disponibles'}
        </Text>
        <Icon
          name={showVariables ? 'expand-less' : 'expand-more'}
          size={20}
          color="#28a745"
        />
      </TouchableOpacity>

      {/* Lista de Variables */}
      {showVariables && (
        <View style={styles.variablesContainer}>
          <Text style={styles.variablesHint}>
            Toca una variable para agregarla al final del mensaje
          </Text>
          <View style={styles.variablesGrid}>
            {variables.map((variable, index) => (
              <TouchableOpacity
                key={index}
                style={styles.variableCard}
                onPress={() => insertarVariable(variable.key)}>
                <View style={styles.variableHeader}>
                  <Text style={styles.variableKey}>{variable.key}</Text>
                  <Icon name="add" size={16} color="#28a745" />
                </View>
                <Text style={styles.variableExample}>
                  Ej: {variable.example}
                </Text>
                <Text style={styles.variableDescription}>
                  {variable.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Botón Plantillas */}
      <TouchableOpacity
        style={styles.plantillasButton}
        onPress={() => setShowPlantillas(!showPlantillas)}>
        <Icon name="template" size={20} color="#6f42c1" />
        <Text style={styles.plantillasButtonText}>
          {showPlantillas ? 'Ocultar Plantillas' : 'Usar Plantilla Predefinida'}
        </Text>
        <Icon
          name={showPlantillas ? 'expand-less' : 'expand-more'}
          size={20}
          color="#6f42c1"
        />
      </TouchableOpacity>

      {/* Lista de Plantillas */}
      {showPlantillas && (
        <ScrollView
          style={styles.plantillasContainer}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {plantillas.map(plantilla => (
            <TouchableOpacity
              key={plantilla.id}
              style={[styles.plantillaCard, {borderColor: plantilla.color}]}
              onPress={() => {
                onAplicarPlantilla(plantilla.id);
                setShowPlantillas(false);
              }}>
              <View
                style={[
                  styles.plantillaIcon,
                  {backgroundColor: plantilla.color + '20'},
                ]}>
                <Icon
                  name={plantilla.icono}
                  size={24}
                  color={plantilla.color}
                />
              </View>
              <Text style={styles.plantillaNombre}>{plantilla.nombre}</Text>
              <Text style={styles.plantillaDescripcion}>
                {plantilla.descripcion}
              </Text>
              <View style={styles.plantillaAction}>
                <Icon name="add" size={16} color={plantilla.color} />
                <Text
                  style={[
                    styles.plantillaActionText,
                    {color: plantilla.color},
                  ]}>
                  Usar
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Vista previa del mensaje */}
      {mensaje.length > 0 && (
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Icon name="preview" size={16} color="#2196f3" />
            <Text style={styles.previewTitle}>Vista Previa del SMS</Text>
            {variables.some(v => mensaje.includes(v.key)) && (
              <Text style={styles.previewSubtitle}>
                (con variables reemplazadas)
              </Text>
            )}
          </View>
          <View style={styles.previewPhone}>
            <View style={styles.previewSMS}>
              {titulo && <Text style={styles.previewSMSTitle}>{titulo}</Text>}
              <Text style={styles.previewSMSMessage}>
                {reemplazarVariables(mensaje)}
              </Text>
              <Text style={styles.previewSMSFooter}>WellNet RD</Text>
            </View>
          </View>
          {variables.some(v => mensaje.includes(v.key)) && (
            <View style={styles.variableNote}>
              <Icon name="info" size={14} color="#2196f3" />
              <Text style={styles.variableNoteText}>
                Las variables se reemplazarán automáticamente con datos reales
                de cada cliente
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Consejos para redactar SMS */}
      <View style={styles.tipsContainer}>
        <View style={styles.tipsHeader}>
          <Icon name="lightbulb" size={16} color="#ff9800" />
          <Text style={styles.tipsTitle}>💡 Consejos para SMS efectivos</Text>
        </View>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• Sé claro y conciso</Text>
          <Text style={styles.tipItem}>• Incluye información de contacto</Text>
          <Text style={styles.tipItem}>• Especifica tiempos estimados</Text>
          <Text style={styles.tipItem}>
            • Usa un tono profesional y empático
          </Text>
        </View>
      </View>
    </View>
  );
};

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#333333',
      marginLeft: 8,
    },
    fieldContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#cccccc' : '#666666',
      marginBottom: 8,
    },
    titleInput: {
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#333333',
    },
    messageInput: {
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#333333',
      minHeight: 120,
      maxHeight: 200,
    },
    messageInputError: {
      borderColor: '#dc3545',
    },
    fieldHint: {
      fontSize: 12,
      color: isDarkMode ? '#aaaaaa' : '#888888',
      marginTop: 4,
    },
    messageInfoContainer: {
      marginTop: 8,
    },
    characterCount: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    characterCountText: {
      fontSize: 12,
      fontWeight: '600',
    },
    smsInfoBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
    },
    smsInfoText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    exceedWarning: {
      fontSize: 11,
      color: '#dc3545',
      marginTop: 4,
      fontStyle: 'italic',
    },
    plantillasButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? '#2a1a4a' : '#f3e5f5',
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#6f42c1',
    },
    plantillasButtonText: {
      color: '#6f42c1',
      fontSize: 14,
      fontWeight: '600',
      marginHorizontal: 8,
    },
    variablesButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? '#1a3a1a' : '#e8f5e8',
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#28a745',
    },
    variablesButtonText: {
      color: '#28a745',
      fontSize: 14,
      fontWeight: '600',
      marginHorizontal: 8,
    },
    variablesContainer: {
      backgroundColor: isDarkMode ? '#1a3a1a' : '#f0f8f0',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#28a745',
    },
    variablesHint: {
      fontSize: 12,
      color: isDarkMode ? '#90caf9' : '#1976d2',
      marginBottom: 12,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    variablesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    variableCard: {
      width: '48%',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      borderRadius: 8,
      padding: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
    },
    variableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    variableKey: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#28a745',
      fontFamily: 'monospace',
    },
    variableExample: {
      fontSize: 10,
      color: isDarkMode ? '#aaaaaa' : '#666666',
      marginBottom: 4,
      fontStyle: 'italic',
    },
    variableDescription: {
      fontSize: 9,
      color: isDarkMode ? '#888888' : '#777777',
      lineHeight: 12,
    },
    plantillasContainer: {
      marginBottom: 16,
    },
    plantillaCard: {
      width: 160,
      padding: 12,
      backgroundColor: isDarkMode ? '#3a3a3a' : '#ffffff',
      borderRadius: 8,
      marginRight: 12,
      borderWidth: 1,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    plantillaIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    plantillaNombre: {
      fontSize: 12,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#333333',
      marginBottom: 4,
    },
    plantillaDescripcion: {
      fontSize: 10,
      color: isDarkMode ? '#aaaaaa' : '#666666',
      marginBottom: 8,
      lineHeight: 14,
    },
    plantillaAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    plantillaActionText: {
      fontSize: 12,
      fontWeight: 'bold',
      marginLeft: 4,
    },
    previewContainer: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333333' : '#e0e0e0',
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    previewTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#2196f3',
      marginLeft: 6,
    },
    previewSubtitle: {
      fontSize: 10,
      color: '#666666',
      marginLeft: 6,
      fontStyle: 'italic',
    },
    previewPhone: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      borderRadius: 12,
      padding: 12,
      borderWidth: 2,
      borderColor: '#e0e0e0',
    },
    previewSMS: {
      backgroundColor: '#e3f2fd',
      borderRadius: 8,
      padding: 10,
      alignSelf: 'flex-start',
      maxWidth: '85%',
    },
    previewSMSTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1565c0',
      marginBottom: 4,
    },
    previewSMSMessage: {
      fontSize: 12,
      color: '#1565c0',
      lineHeight: 16,
    },
    previewSMSFooter: {
      fontSize: 10,
      color: '#1976d2',
      marginTop: 6,
      textAlign: 'right',
      fontWeight: '600',
    },
    variableNote: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      padding: 8,
      backgroundColor: isDarkMode ? '#1a2a3a' : '#e3f2fd',
      borderRadius: 6,
    },
    variableNoteText: {
      fontSize: 11,
      color: isDarkMode ? '#90caf9' : '#1976d2',
      marginLeft: 6,
      flex: 1,
      lineHeight: 14,
    },
    tipsContainer: {
      backgroundColor: isDarkMode ? '#2a2a1a' : '#fff8e1',
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: '#ff9800',
    },
    tipsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    tipsTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#ff9800',
      marginLeft: 6,
    },
    tipsList: {
      paddingLeft: 8,
    },
    tipItem: {
      fontSize: 12,
      color: isDarkMode ? '#ffcc80' : '#e65100',
      marginBottom: 2,
      lineHeight: 16,
    },
  });

export default MessageComposer;
