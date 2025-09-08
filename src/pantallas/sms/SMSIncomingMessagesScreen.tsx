import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getStyles from './SMSIncomingMessagesScreenStyles';
import MessageCard from './components/MessageCard';

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

interface ApiResponse {
  success: boolean;
  total: number;
  mensajes_nuevos?: IncomingMessage[];
  mensajes?: IncomingMessage[];
}

const API_BASE = 'https://wellnet-rd.com:444/api';

const SMSIncomingMessagesScreen = () => {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const navigation = useNavigation();
  const route = useRoute();
  const { ispId } = route.params || {};

  const [messages, setMessages] = useState<IncomingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages(false); // false para no mostrar loading
    }, 30000);

    return () => clearInterval(interval);
  }, [filter]);

  // Cargar mensajes al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [filter])
  );

  const loadMessages = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      const endpoint = filter === 'unread' 
        ? `${API_BASE}/sms-messages/unread`
        : `${API_BASE}/sms-messages/incoming`;

      console.log('🔄 [SMS Incoming] Cargando mensajes desde:', endpoint);

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      console.log('📥 [SMS Incoming] Response status:', response.status);

      if (response.ok) {
        const data: ApiResponse = await response.json();
        console.log('✅ [SMS Incoming] Data received:', JSON.stringify(data, null, 2));
        
        const messageList = data.mensajes_nuevos || data.mensajes || [];
        setMessages(messageList);
        
        // Contar mensajes no leídos
        const unreadMessages = messageList.filter(msg => msg.procesado === 0);
        setUnreadCount(unreadMessages.length);
        
        console.log(`📊 [SMS Incoming] Total: ${messageList.length}, No leídos: ${unreadMessages.length}`);
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ [SMS Incoming] Error loading messages:', error);
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      console.log(`🔄 [SMS Incoming] Marcando mensaje ${messageId} como leído`);

      const response = await fetch(`${API_BASE}/sms-messages/${messageId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        console.log(`✅ [SMS Incoming] Mensaje ${messageId} marcado como leído`);
        
        // Actualizar el estado local
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, procesado: 1 } : msg
          )
        );
        
        // Actualizar contador de no leídos
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        Alert.alert('Éxito', 'Mensaje marcado como procesado');
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ [SMS Incoming] Error marking as read:', error);
      Alert.alert('Error', 'No se pudo marcar el mensaje como procesado');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages(false);
  };

  const filteredMessages = messages.filter(msg => 
    filter === 'all' ? true : msg.procesado === 0
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={isDarkMode ? '#ffffff' : '#333333'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SMS Entrantes</Text>
        {unreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'all' && styles.filterButtonTextActive
          ]}>
            Todos ({messages.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'unread' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'unread' && styles.filterButtonTextActive
          ]}>
            Nuevos ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de mensajes */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? '#ffffff' : '#000000'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196f3" />
            <Text style={styles.loadingText}>Cargando mensajes...</Text>
          </View>
        ) : filteredMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="sms" size={64} color={isDarkMode ? '#555555' : '#cccccc'} />
            <Text style={styles.emptyTitle}>
              {filter === 'unread' ? 'No hay mensajes nuevos' : 'No hay mensajes'}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'unread' 
                ? 'Todos los mensajes han sido procesados' 
                : 'Los mensajes de respuesta de los clientes aparecerán aquí'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.messagesList}>
            {filteredMessages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                isDarkMode={isDarkMode}
                onMarkAsRead={markAsRead}
                formatDate={formatDate}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Info footer */}
      <View style={styles.infoFooter}>
        <Icon name="info" size={16} color="#2196f3" />
        <Text style={styles.infoText}>
          Los mensajes se actualizan automáticamente cada 30 segundos
        </Text>
      </View>
    </View>
  );
};

export default SMSIncomingMessagesScreen;