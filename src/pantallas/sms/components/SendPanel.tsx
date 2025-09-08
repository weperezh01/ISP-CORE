import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet } from 'react-native';

interface Group {
  tipo: string;
  id: string | number;
  nombre: string;
  descripcion: string;
  cantidad_clientes: number;
}

interface SendPanelProps {
  grupoSeleccionado: Group | null;
  totalClientes: number;
  titulo: string;
  mensaje: string;
  enviando: boolean;
  onSend: () => void;
  onReset: () => void;
  isDarkMode: boolean;
}

const SendPanel: React.FC<SendPanelProps> = ({
  grupoSeleccionado,
  totalClientes,
  titulo,
  mensaje,
  enviando,
  onSend,
  onReset,
  isDarkMode
}) => {
  const styles = getStyles(isDarkMode);

  const calcularCosto = () => {
    const segmentos = Math.ceil(mensaje.length / 160);
    const smsCount = segmentos * totalClientes;
    const costoPorSMS = 0.05; // Costo estimado por SMS en USD
    return {
      smsCount,
      costoEstimado: smsCount * costoPorSMS,
      segmentosPorMensaje: segmentos
    };
  };

  const { smsCount, costoEstimado, segmentosPorMensaje } = calcularCosto();

  const isReadyToSend = grupoSeleccionado && totalClientes > 0 && titulo.trim() && mensaje.trim();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="send" size={24} color="#28a745" />
        <Text style={styles.title}>🚀 Confirmar Envío Masivo</Text>
      </View>

      {/* Resumen del envío */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Icon name="group" size={16} color="#2196f3" />
          <Text style={styles.summaryLabel}>Grupo:</Text>
          <Text style={styles.summaryValue}>{grupoSeleccionado?.nombre || 'No seleccionado'}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Icon name="people" size={16} color="#28a745" />
          <Text style={styles.summaryLabel}>Destinatarios:</Text>
          <Text style={styles.summaryValue}>{totalClientes} clientes</Text>
        </View>

        <View style={styles.summaryRow}>
          <Icon name="title" size={16} color="#6c757d" />
          <Text style={styles.summaryLabel}>Título:</Text>
          <Text style={styles.summaryValue} numberOfLines={1}>
            {titulo || 'Sin título'}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Icon name="message" size={16} color="#6c757d" />
          <Text style={styles.summaryLabel}>Mensaje:</Text>
          <Text style={styles.summaryValue} numberOfLines={2}>
            {mensaje.substring(0, 100)}{mensaje.length > 100 ? '...' : ''}
          </Text>
        </View>
      </View>

      {/* Información del costo */}
      <View style={styles.costContainer}>
        <View style={styles.costHeader}>
          <Icon name="attach-money" size={20} color="#ff9800" />
          <Text style={styles.costTitle}>💰 Información de Costo</Text>
        </View>
        
        <View style={styles.costGrid}>
          <View style={styles.costItem}>
            <Text style={styles.costNumber}>{smsCount}</Text>
            <Text style={styles.costLabel}>SMS Total</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costNumber}>{segmentosPorMensaje}</Text>
            <Text style={styles.costLabel}>Segmentos</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costNumber}>${costoEstimado.toFixed(2)}</Text>
            <Text style={styles.costLabel}>Costo Est.</Text>
          </View>
        </View>

        {segmentosPorMensaje > 1 && (
          <View style={styles.multiSMSWarning}>
            <Icon name="warning" size={16} color="#ff9800" />
            <Text style={styles.multiSMSText}>
              Mensaje largo: Se enviará como {segmentosPorMensaje} SMS por cliente
            </Text>
          </View>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onReset}
          disabled={enviando}
        >
          <Icon name="refresh" size={18} color="#6c757d" />
          <Text style={styles.resetButtonText}>Reiniciar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            !isReadyToSend && styles.sendButtonDisabled,
            enviando && styles.sendButtonSending
          ]}
          onPress={onSend}
          disabled={!isReadyToSend || enviando}
        >
          {enviando ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.sendButtonText}>Enviando...</Text>
            </>
          ) : (
            <>
              <Icon name="send" size={18} color="#ffffff" />
              <Text style={styles.sendButtonText}>Enviar SMS Masivo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Información importante */}
      <View style={styles.importantInfo}>
        <View style={styles.infoHeader}>
          <Icon name="info" size={16} color="#dc3545" />
          <Text style={styles.infoTitle}>⚠️ Información Importante</Text>
        </View>
        <View style={styles.infoList}>
          <Text style={styles.infoItem}>
            • El envío masivo es irreversible una vez iniciado
          </Text>
          <Text style={styles.infoItem}>
            • Los SMS se enviarán inmediatamente a todos los clientes
          </Text>
          <Text style={styles.infoItem}>
            • Verifica la información antes de confirmar el envío
          </Text>
          <Text style={styles.infoItem}>
            • El proceso puede tomar varios minutos para grupos grandes
          </Text>
        </View>
      </View>

      {/* Estado de progreso (cuando está enviando) */}
      {enviando && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <ActivityIndicator size="small" color="#2196f3" />
            <Text style={styles.progressTitle}>Enviando SMS...</Text>
          </View>
          <Text style={styles.progressText}>
            Por favor espera mientras se procesan {totalClientes} mensajes
          </Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
      )}
    </View>
  );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: '#28a745',
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
  summaryContainer: {
    backgroundColor: isDarkMode ? '#1a3a2a' : '#f0fff4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: isDarkMode ? '#90ee90' : '#155724',
    marginLeft: 8,
    minWidth: 80,
  },
  summaryValue: {
    fontSize: 14,
    color: isDarkMode ? '#ffffff' : '#333333',
    marginLeft: 8,
    flex: 1,
  },
  costContainer: {
    backgroundColor: isDarkMode ? '#3a2a1a' : '#fff8e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff9800',
    marginLeft: 8,
  },
  costGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  costItem: {
    alignItems: 'center',
  },
  costNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff9800',
  },
  costLabel: {
    fontSize: 12,
    color: isDarkMode ? '#ffcc80' : '#e65100',
    marginTop: 2,
  },
  multiSMSWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#2a2a1a' : '#fff3cd',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  multiSMSText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 6,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  resetButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  sendButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#28a745',
    borderRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  sendButtonSending: {
    backgroundColor: '#fd7e14',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  importantInfo: {
    backgroundColor: isDarkMode ? '#3a1a1a' : '#f8d7da',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545',
    marginLeft: 6,
  },
  infoList: {
    paddingLeft: 8,
  },
  infoItem: {
    fontSize: 12,
    color: isDarkMode ? '#f5c6cb' : '#721c24',
    marginBottom: 4,
    lineHeight: 16,
  },
  progressContainer: {
    backgroundColor: isDarkMode ? '#1a2a4a' : '#d1ecf1',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196f3',
    marginLeft: 8,
  },
  progressText: {
    fontSize: 12,
    color: isDarkMode ? '#bee5eb' : '#0c5460',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: isDarkMode ? '#3a3a3a' : '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196f3',
    width: '100%',
    borderRadius: 2,
  },
});

export default SendPanel;