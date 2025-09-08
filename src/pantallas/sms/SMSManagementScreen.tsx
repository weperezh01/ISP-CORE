import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getStyles from './SMSManagementScreenStyles';

const API_BASE = 'https://wellnet-rd.com:444/api';

const SMSManagementScreen = () => {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const navigation = useNavigation();
  const route = useRoute();
  const { ispId } = route.params || {};
  const [unreadCount, setUnreadCount] = useState(0);

  const smsButtons = [
    {
      id: '1',
      title: 'SMS Entrantes',
      description: 'Ver respuestas de clientes y mensajes recibidos',
      screen: 'SMSIncomingMessagesScreen',
      params: { ispId },
      icon: 'message',
      color: '#dc3545',
      badge: true, // Para mostrar badge de mensajes nuevos
    },
    {
      id: '2',
      title: 'SMS Masivos',
      description: 'Enviar SMS masivos por grupos de clientes',
      screen: 'SMSMassCampaignsScreen',
      params: { ispId },
      icon: 'campaign',
      color: '#ff9800',
    },
    {
      id: '3',
      title: 'SMS Recordatorios',
      description: 'Configurar y enviar recordatorios automáticos',
      screen: 'ConfiguracionSMSScreen',
      params: { ispId },
      icon: 'sms',
      color: '#9C27B0',
    },
    {
      id: '4',
      title: 'Monitoreo SMS',
      description: 'Panel de control y estadísticas en tiempo real',
      screen: 'MonitoreoSMSScreen',
      params: { ispId },
      icon: 'dashboard',
      color: '#28a745',
    },
    {
      id: '5',
      title: 'Historial SMS',
      description: 'Consultar el historial de mensajes enviados',
      screen: 'HistorialSMSScreen',
      params: { ispId },
      icon: 'history',
      color: '#007bff',
    },
  ];

  // Cargar contador de mensajes nuevos
  const loadUnreadCount = async () => {
    try {
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user?.token) return;

      const response = await fetch(`${API_BASE}/sms-notifications/count`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
        console.log('📊 [SMS Management] Unread count:', data.count);
      }
    } catch (error) {
      console.error('❌ [SMS Management] Error loading unread count:', error);
    }
  };

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cargar al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, [])
  );

  const handleButtonPress = (button) => {
    if (button.screen) {
      navigation.navigate(button.screen, button.params || {});
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={isDarkMode ? '#ffffff' : '#333333'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de SMS</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Centro de control para la gestión de SMS. Desde aquí puedes configurar recordatorios, 
            monitorear el estado de los envíos y consultar el historial completo.
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          {smsButtons.map((button) => (
            <TouchableOpacity
              key={button.id}
              style={[styles.button, { borderLeftColor: button.color }]}
              onPress={() => handleButtonPress(button)}
            >
              <View style={styles.buttonContent}>
                <View style={[styles.iconContainer, { backgroundColor: button.color + '20' }]}>
                  <Icon name={button.icon} size={28} color={button.color} />
                  {button.badge && unreadCount > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.textContainer}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.buttonTitle}>{button.title}</Text>
                    {button.badge && unreadCount > 0 && (
                      <View style={styles.titleBadge}>
                        <Text style={styles.titleBadgeText}>
                          {unreadCount} nuevo{unreadCount > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.buttonDescription}>{button.description}</Text>
                </View>
                
                <View style={styles.arrowContainer}>
                  <Icon name="chevron-right" size={24} color={isDarkMode ? '#888888' : '#cccccc'} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Icon name="info" size={24} color="#2196f3" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Información</Text>
              <Text style={styles.infoText}>
                Para utilizar las funciones de SMS, asegúrate de haber configurado 
                correctamente las credenciales de LabsMobile en la configuración del sistema.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SMSManagementScreen;