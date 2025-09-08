import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet } from 'react-native';

interface IncomingMessage {
  id: number;
  mensaje_id: string;
  telefono_cliente: string;
  id_cliente: number;
  mensaje: string;
  fecha_recibido: string;
  procesado: number; // 0 = no leído, 1 = leído
  respuesta_enviada: number; // 0 = no respondido, 1 = respondido
  tipo_respuesta: string;
}

interface MessageCardProps {
  message: IncomingMessage;
  isDarkMode: boolean;
  onMarkAsRead: (messageId: number) => void;
  formatDate: (dateString: string) => string;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  isDarkMode,
  onMarkAsRead,
  formatDate
}) => {
  const styles = getStyles(isDarkMode);
  const isUnread = message.procesado === 0;

  const handleMarkAsRead = () => {
    if (isUnread) {
      Alert.alert(
        'Confirmar',
        '¿Marcar este mensaje como procesado?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sí', onPress: () => onMarkAsRead(message.id) }
        ]
      );
    }
  };

  const getMessageType = (mensaje: string) => {
    const upperMsg = mensaje.toUpperCase();
    if (upperMsg.includes('STOP')) return 'stop';
    if (upperMsg.includes('INFO')) return 'info';
    if (upperMsg.includes('SALDO') || upperMsg.includes('PAGAR')) return 'payment';
    return 'general';
  };

  const getMessageTypeInfo = (type: string) => {
    switch (type) {
      case 'stop':
        return { icon: 'block', color: '#dc3545', label: 'BAJA' };
      case 'info':
        return { icon: 'info', color: '#17a2b8', label: 'INFO' };
      case 'payment':
        return { icon: 'payment', color: '#28a745', label: 'PAGO' };
      default:
        return { icon: 'message', color: '#6c757d', label: 'GENERAL' };
    }
  };

  const messageType = getMessageType(message.mensaje);
  const typeInfo = getMessageTypeInfo(messageType);

  return (
    <View style={[
      styles.messageCard,
      isUnread && styles.messageCardUnread
    ]}>
      {/* Header con teléfono y fecha */}
      <View style={styles.messageHeader}>
        <View style={styles.phoneContainer}>
          <Icon name="phone" size={16} color={isDarkMode ? '#cccccc' : '#666666'} />
          <Text style={styles.phoneText}>{message.telefono_cliente}</Text>
          {isUnread && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NUEVO</Text>
            </View>
          )}
        </View>
        <Text style={styles.dateText}>{formatDate(message.fecha_recibido)}</Text>
      </View>

      {/* Tipo de mensaje */}
      <View style={styles.messageTypeContainer}>
        <View style={[styles.messageTypeBadge, { backgroundColor: typeInfo.color + '20' }]}>
          <Icon name={typeInfo.icon} size={14} color={typeInfo.color} />
          <Text style={[styles.messageTypeText, { color: typeInfo.color }]}>
            {typeInfo.label}
          </Text>
        </View>
        <Text style={styles.clientIdText}>Cliente #{message.id_cliente}</Text>
      </View>

      {/* Mensaje */}
      <View style={styles.messageContentContainer}>
        <Text style={styles.messageText}>{message.mensaje}</Text>
      </View>

      {/* Footer con estados y acciones */}
      <View style={styles.messageFooter}>
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Icon 
              name={isUnread ? 'mark-email-unread' : 'mark-email-read'} 
              size={14} 
              color={isUnread ? '#dc3545' : '#28a745'} 
            />
            <Text style={[
              styles.statusText,
              { color: isUnread ? '#dc3545' : '#28a745' }
            ]}>
              {isUnread ? 'Sin procesar' : 'Procesado'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Icon 
              name={message.respuesta_enviada === 1 ? 'reply' : 'reply-all'} 
              size={14} 
              color={message.respuesta_enviada === 1 ? '#28a745' : '#6c757d'} 
            />
            <Text style={[
              styles.statusText,
              { color: message.respuesta_enviada === 1 ? '#28a745' : '#6c757d' }
            ]}>
              {message.respuesta_enviada === 1 ? 'Respondido' : 'Sin responder'}
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionContainer}>
          {isUnread && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkAsRead}
            >
              <Icon name="done" size={16} color="#28a745" />
              <Text style={[styles.actionButtonText, { color: '#28a745' }]}>
                Marcar procesado
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Botón responder (futuro) */}
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => Alert.alert('Próximamente', 'Función de respuesta en desarrollo')}
          >
            <Icon name="reply" size={16} color="#2196f3" />
            <Text style={[styles.actionButtonText, { color: '#2196f3' }]}>
              Responder
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  messageCard: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: isDarkMode ? '#333333' : '#e0e0e0',
  },
  messageCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    backgroundColor: isDarkMode ? '#3a2a2a' : '#fff5f5',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#333333',
    marginLeft: 6,
  },
  newBadge: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: isDarkMode ? '#aaaaaa' : '#666666',
  },
  messageTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageTypeText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  clientIdText: {
    fontSize: 12,
    color: isDarkMode ? '#aaaaaa' : '#666666',
    fontStyle: 'italic',
  },
  messageContentContainer: {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: isDarkMode ? '#ffffff' : '#333333',
  },
  messageFooter: {
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#333333' : '#e0e0e0',
    paddingTop: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: isDarkMode ? '#333333' : '#f0f0f0',
  },
  actionButtonSecondary: {
    backgroundColor: isDarkMode ? '#1a3a5a' : '#e3f2fd',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default MessageCard;