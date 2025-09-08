import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LabsMobileCredential {
  id: number;
  username: string;
  ip_filter?: string;
  delivery_webhook_url?: string;
  clicks_webhook_url?: string;
  incoming_webhook_url?: string;
  is_active: boolean;
  is_default: boolean;
  token_status: 'CONFIGURED' | 'PENDING_CONFIGURATION';
  created_at: string;
  updated_at: string;
  notes?: string;
  // Estadísticas de uso (cuando están disponibles)
  total_messages_sent?: number;
  messages_delivered?: number;
  messages_failed?: number;
  last_used?: string;
}

interface UsageStats {
  total_messages_sent: number;
  messages_delivered: number;
  messages_failed: number;
  delivery_rate: number;
  last_30_days: number;
  last_7_days: number;
}

const LabsMobileCredentialsScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [credentials, setCredentials] = useState<LabsMobileCredential[]>([]);
  const [activeCredentials, setActiveCredentials] = useState<LabsMobileCredential[]>([]);
  
  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState<LabsMobileCredential | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    api_token: '',
    ip_filter: '',
    delivery_webhook_url: 'https://wellnet-rd.com:444/api/labsmobile/webhooks/delivery',
    clicks_webhook_url: 'https://wellnet-rd.com:444/api/labsmobile/webhooks/clicks',
    incoming_webhook_url: 'https://wellnet-rd.com:444/api/labsmobile/webhooks/incoming',
    is_active: true,
    is_default: false,
    notes: '',
  });

  // Estados adicionales
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  const [usageStats, setUsageStats] = useState<{[key: number]: UsageStats}>({});
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedCredentialForAudit, setSelectedCredentialForAudit] = useState<number | null>(null);

  const API_BASE = 'https://wellnet-rd.com:444/api';
  // No necesitamos ispId para credenciales LabsMobile ya que son globales

  // Cargar datos iniciales
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      console.log('🔄 [LabsMobile] Cargando credenciales...');

      // Cargar todas las credenciales
      const response = await fetch(`${API_BASE}/labsmobile/credentials`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      console.log('📥 [LabsMobile] Response status:', response.status);

      if (response.ok) {
        const responseText = await response.text();
        console.log('📥 [LabsMobile] Response preview:', responseText.substring(0, 200));

        let data;
        try {
          data = JSON.parse(responseText);
          console.log('✅ [LabsMobile] JSON parsed successfully');
        } catch (parseError) {
          console.error('❌ [LabsMobile] JSON parse error:', parseError);
          console.error('📄 [LabsMobile] Response content:', responseText);
          throw new Error('El servidor devolvió una respuesta inválida');
        }

        setCredentials(data.credentials || []);
        console.log('📊 [LabsMobile] Credentials data:', JSON.stringify(data.credentials, null, 2));
        
        // Log específico para tokens (sin mostrar el valor completo por seguridad)
        (data.credentials || []).forEach((cred, index) => {
          console.log(`🔑 [LabsMobile] Credential ${index + 1}:`);
          console.log(`   - ID: ${cred.id}`);
          console.log(`   - Username: ${cred.username}`);
          console.log(`   - Token Status: ${cred.token_status}`);
          console.log(`   - Has Token: ${cred.api_token ? 'YES' : 'NO'}`);
          if (cred.api_token) {
            console.log(`   - Token Length: ${cred.api_token.length}`);
            console.log(`   - Token Preview: ${cred.api_token.substring(0, 10)}...${cred.api_token.substring(cred.api_token.length - 10)}`);
          }
        });

        // Cargar credenciales activas con estadísticas
        try {
          const activeResponse = await fetch(`${API_BASE}/labsmobile/credentials/active`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });

          if (activeResponse.ok) {
            const activeResponseText = await activeResponse.text();
            let activeData;
            try {
              activeData = JSON.parse(activeResponseText);
              setActiveCredentials(activeData.credentials || []);
              
              // Cargar estadísticas para cada credencial activa
              for (const cred of activeData.credentials || []) {
                await loadUsageStats(cred.id, user.token);
              }
            } catch (activeParseError) {
              console.error('❌ [LabsMobile] Active credentials JSON parse error:', activeParseError);
              // Continuar sin estadísticas activas
            }
          }
        } catch (activeError) {
          console.error('⚠️ [LabsMobile] Error loading active credentials:', activeError);
          // Continuar sin estadísticas activas
        }
      } else if (response.status === 404) {
        console.log('ℹ️ [LabsMobile] Endpoint no encontrado - puede que no esté implementado aún');
        setCredentials([]);
        Alert.alert('Información', 'El sistema LabsMobile aún no está disponible en este servidor');
      } else {
        const errorText = await response.text();
        console.error('❌ [LabsMobile] Error response:', errorText);
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ [LabsMobile] Error loading credentials:', error);
      
      if (error.message.includes('fetch')) {
        Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor');
      } else {
        Alert.alert('Error', error.message || 'No se pudieron cargar las credenciales');
      }
      
      // Establecer estado vacío en caso de error
      setCredentials([]);
      setActiveCredentials([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUsageStats = async (credentialId: number, token: string) => {
    try {
      const response = await fetch(`${API_BASE}/labsmobile/credentials/${credentialId}/usage-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsageStats(prev => ({
          ...prev,
          [credentialId]: data.stats
        }));
      }
    } catch (error) {
      console.error(`Error loading usage stats for credential ${credentialId}:`, error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCredentials();
  };

  const openModal = (credential?: LabsMobileCredential) => {
    if (credential) {
      setEditingCredential(credential);
      setFormData({
        username: credential.username,
        api_token: '', // Por seguridad, no cargar el token
        ip_filter: credential.ip_filter || '',
        delivery_webhook_url: credential.delivery_webhook_url || 'https://wellnet-rd.com:444/api/labsmobile/webhooks/delivery',
        clicks_webhook_url: credential.clicks_webhook_url || 'https://wellnet-rd.com:444/api/labsmobile/webhooks/clicks',
        incoming_webhook_url: credential.incoming_webhook_url || 'https://wellnet-rd.com:444/api/labsmobile/webhooks/incoming',
        is_active: credential.is_active,
        is_default: credential.is_default,
        notes: credential.notes || '',
      });
    } else {
      setEditingCredential(null);
      setFormData({
        username: '',
        api_token: '',
        ip_filter: '',
        delivery_webhook_url: 'https://wellnet-rd.com:444/api/labsmobile/webhooks/delivery',
        clicks_webhook_url: 'https://wellnet-rd.com:444/api/labsmobile/webhooks/clicks',
        incoming_webhook_url: 'https://wellnet-rd.com:444/api/labsmobile/webhooks/incoming',
        is_active: true,
        is_default: false,
        notes: '',
      });
    }
    setShowPassword(false);
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'El email de usuario es requerido');
      return false;
    }

    if (!formData.username.includes('@')) {
      Alert.alert('Error', 'Ingresa un email válido');
      return false;
    }

    if (!editingCredential && !formData.api_token.trim()) {
      Alert.alert('Error', 'El token API es requerido para nuevas credenciales');
      return false;
    }

    // Validar URLs de webhooks
    const urlFields = ['delivery_webhook_url', 'clicks_webhook_url', 'incoming_webhook_url'];
    for (const field of urlFields) {
      const url = formData[field];
      if (url && !url.startsWith('http')) {
        Alert.alert('Error', `La URL de ${field.replace('_webhook_url', '')} debe comenzar con http:// o https://`);
        return false;
      }
    }

    return true;
  };

  const saveCredential = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      const method = editingCredential ? 'PUT' : 'POST';
      const url = editingCredential 
        ? `${API_BASE}/labsmobile/credentials/${editingCredential.id}`
        : `${API_BASE}/labsmobile/credentials`;

      const payload = { ...formData };
      
      // Solo eliminar el token del payload si estamos editando Y el campo está realmente vacío
      // (para no sobrescribir un token existente con vacío)
      if (editingCredential && !formData.api_token.trim()) {
        console.log('🔑 [LabsMobile] No se envía token porque el campo está vacío en edición');
        delete payload.api_token;
      } else if (formData.api_token.trim()) {
        console.log('🔑 [LabsMobile] Enviando token API:', formData.api_token ? 'SÍ' : 'NO');
      }

      console.log('📦 [LabsMobile] Payload completo:', JSON.stringify(payload, null, 2));
      console.log('🔑 [LabsMobile] Token original enviado:', formData.api_token);
      console.log('🔑 [LabsMobile] Token length:', formData.api_token ? formData.api_token.length : 0);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 [LabsMobile Save] Response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ [LabsMobile Save] Response data:', JSON.stringify(responseData, null, 2));
        
        // Verificar si el token devuelto es diferente al enviado
        if (responseData.credential && responseData.credential.api_token) {
          console.log('🔍 [LabsMobile Save] Token enviado:', formData.api_token);
          console.log('🔍 [LabsMobile Save] Token recibido del servidor:', responseData.credential.api_token);
          console.log('🔍 [LabsMobile Save] ¿Tokens coinciden?:', formData.api_token === responseData.credential.api_token);
        }
        
        Alert.alert(
          'Éxito', 
          editingCredential ? 'Credenciales actualizadas correctamente' : 'Credenciales creadas correctamente',
          [{ text: 'OK', onPress: () => {
            setShowModal(false);
            loadCredentials();
          }}]
        );
      } else {
        const errorText = await response.text();
        console.error('❌ [LabsMobile Save] Error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: `Error ${response.status}: ${errorText}` };
        }
        
        throw new Error(errorData.message || 'Error al guardar credenciales');
      }
    } catch (error) {
      console.error('Error saving credential:', error);
      Alert.alert('Error', error.message || 'No se pudieron guardar las credenciales');
    } finally {
      setSaving(false);
    }
  };

  const deleteCredential = (credential: LabsMobileCredential) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que deseas eliminar las credenciales para ${credential.username}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => performDelete(credential.id) }
      ]
    );
  };

  const performDelete = async (credentialId: number) => {
    try {
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      const response = await fetch(`${API_BASE}/labsmobile/credentials/${credentialId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Credenciales eliminadas correctamente');
        loadCredentials();
      } else {
        throw new Error('Error al eliminar credenciales');
      }
    } catch (error) {
      console.error('Error deleting credential:', error);
      Alert.alert('Error', 'No se pudieron eliminar las credenciales');
    }
  };

  const testConnection = async (credentialId: number) => {
    try {
      setTestingConnection(credentialId);
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      const response = await fetch(`${API_BASE}/labsmobile/test-connection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential_id: credentialId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Conexión Exitosa', `✅ Conexión establecida correctamente.\n\nSaldo: ${data.balance || 'No disponible'}\nEstado: ${data.status || 'Activo'}`);
      } else {
        Alert.alert('Error de Conexión', `❌ ${data.message || 'No se pudo establecer conexión con LabsMobile'}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      Alert.alert('Error', 'Error al probar la conexión');
    } finally {
      setTestingConnection(null);
    }
  };

  const refreshToken = async (credentialId: number) => {
    Alert.alert(
      'Refrescar Token',
      '¿Deseas generar un nuevo token API? El token actual quedará invalidado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Refrescar', style: 'default', onPress: () => performRefreshToken(credentialId) }
      ]
    );
  };

  const performRefreshToken = async (credentialId: number) => {
    try {
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      const response = await fetch(`${API_BASE}/labsmobile/credentials/${credentialId}/refresh-token`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Token API actualizado correctamente');
        loadCredentials();
      } else {
        throw new Error('Error al refrescar token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      Alert.alert('Error', 'No se pudo refrescar el token');
    }
  };

  const loadAuditLog = async (credentialId?: number) => {
    try {
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      console.log('🔄 [LabsMobile] Cargando log de auditoría...');

      // Si se proporciona credentialId, cargar logs específicos, sino cargar todos
      const url = credentialId 
        ? `${API_BASE}/labsmobile/credentials/${credentialId}/logs`
        : `${API_BASE}/labsmobile/credentials/logs`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      console.log('📥 [LabsMobile Audit] Response status:', response.status);

      if (response.ok) {
        const responseText = await response.text();
        console.log('📥 [LabsMobile Audit] Response preview:', responseText.substring(0, 200));

        let data;
        try {
          data = JSON.parse(responseText);
          console.log('✅ [LabsMobile Audit] JSON parsed successfully');
          setAuditLogs(data.logs || []);
          setSelectedCredentialForAudit(credentialId || null);
          setShowAuditLog(true);
        } catch (parseError) {
          console.error('❌ [LabsMobile Audit] JSON parse error:', parseError);
          console.error('📄 [LabsMobile Audit] Response content:', responseText);
          // Mostrar modal vacío pero funcional
          setAuditLogs([]);
          setSelectedCredentialForAudit(credentialId || null);
          setShowAuditLog(true);
          Alert.alert('Información', 'El log de auditoría aún no está disponible en este servidor');
        }
      } else if (response.status === 404) {
        console.log('ℹ️ [LabsMobile Audit] Endpoint no encontrado');
        setAuditLogs([]);
        setSelectedCredentialForAudit(credentialId || null);
        setShowAuditLog(true);
        Alert.alert('Información', 'El log de auditoría aún no está implementado');
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ [LabsMobile Audit] Error loading audit log:', error);
      
      // Mostrar modal vacío en caso de error
      setAuditLogs([]);
      setSelectedCredentialForAudit(credentialId || null);
      setShowAuditLog(true);
      
      if (error.message.includes('fetch')) {
        Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor para el log de auditoría');
      }
    }
  };

  const renderCredentialCard = (credential: LabsMobileCredential) => {
    // Validar que la credencial tenga los campos básicos
    if (!credential || !credential.id || !credential.username) {
      console.warn('⚠️ [LabsMobile] Credential inválida:', credential);
      return null;
    }

    const stats = usageStats[credential.id];
    
    return (
      <View key={credential.id} style={[styles.card, { marginBottom: 16 }]}>
        {/* Header de la credencial */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={[styles.cardTitle, { fontSize: 16, marginBottom: 4 }]}>
              {credential.username || 'Email no disponible'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Estado activo/inactivo */}
              <View style={{
                backgroundColor: (credential.is_active === true) 
                  ? (isDarkMode ? '#1a4a2a' : '#e8f5e8') 
                  : (isDarkMode ? '#4a4a4a' : '#f5f5f5'),
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 12,
                marginRight: 8,
                marginBottom: 4
              }}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: (credential.is_active === true) ? '#28a745' : '#6c757d'
                }}>
                  {(credential.is_active === true) ? 'Activa' : 'Inactiva'}
                </Text>
              </View>

              {/* Estado default */}
              {(credential.is_default === true) && (
                <View style={{
                  backgroundColor: isDarkMode ? '#2a3a4a' : '#e3f2fd',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 12,
                  marginRight: 8,
                  marginBottom: 4
                }}>
                  <Text style={{
                    fontSize: 11,
                    fontWeight: '500',
                    color: '#2196f3'
                  }}>
                    Predeterminada
                  </Text>
                </View>
              )}

              {/* Estado del token */}
              <View style={{
                backgroundColor: (credential.token_status === 'CONFIGURED')
                  ? (isDarkMode ? '#1a4a2a' : '#e8f5e8')
                  : (isDarkMode ? '#4a3a1a' : '#fff3cd'),
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 12,
                marginBottom: 4
              }}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: (credential.token_status === 'CONFIGURED') ? '#28a745' : '#856404'
                }}>
                  {(credential.token_status === 'CONFIGURED') ? '🔑 Configurado' : '⚠️ Pendiente'}
                </Text>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <TouchableOpacity
              onPress={() => testConnection(credential.id)}
              disabled={testingConnection === credential.id}
              style={{
                padding: 8,
                backgroundColor: isDarkMode ? '#2a4a2a' : '#e8f5e8',
                borderRadius: 6,
                marginRight: 4,
                opacity: testingConnection === credential.id ? 0.5 : 1
              }}
            >
              {testingConnection === credential.id ? (
                <ActivityIndicator size="small" color="#28a745" />
              ) : (
                <Icon name="wifi-tethering" size={16} color="#28a745" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openModal(credential)}
              style={{
                padding: 8,
                backgroundColor: isDarkMode ? '#3a3a4a' : '#f0f0f0',
                borderRadius: 6,
                marginRight: 4
              }}
            >
              <Icon name="edit" size={16} color={isDarkMode ? '#b0b0b0' : '#666666'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => loadAuditLog(credential.id)}
              style={{
                padding: 8,
                backgroundColor: isDarkMode ? '#3a2a4a' : '#f0e8ff',
                borderRadius: 6,
                marginRight: 4
              }}
            >
              <Icon name="history" size={16} color="#6f42c1" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deleteCredential(credential)}
              style={{
                padding: 8,
                backgroundColor: isDarkMode ? '#4a2a2a' : '#ffeaea',
                borderRadius: 6
              }}
            >
              <Icon name="delete-outline" size={16} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Estadísticas de uso */}
        {stats && typeof stats === 'object' && (
          <View style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12
          }}>
            <Text style={[styles.label, { fontSize: 12, marginBottom: 8 }]}>
              Estadísticas de Uso
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.itemDetails, { fontSize: 18, fontWeight: 'bold', color: '#2196f3' }]}>
                  {(stats?.total_messages_sent || 0).toString()}
                </Text>
                <Text style={[styles.itemDetails, { fontSize: 10 }]}>Enviados</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.itemDetails, { fontSize: 18, fontWeight: 'bold', color: '#28a745' }]}>
                  {(stats?.messages_delivered || 0).toString()}
                </Text>
                <Text style={[styles.itemDetails, { fontSize: 10 }]}>Entregados</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.itemDetails, { fontSize: 18, fontWeight: 'bold', color: '#dc3545' }]}>
                  {(stats?.messages_failed || 0).toString()}
                </Text>
                <Text style={[styles.itemDetails, { fontSize: 10 }]}>Fallidos</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.itemDetails, { fontSize: 18, fontWeight: 'bold', color: '#ff9800' }]}>
                  {stats?.delivery_rate ? `${(stats.delivery_rate * 100).toFixed(1)}%` : '0%'}
                </Text>
                <Text style={[styles.itemDetails, { fontSize: 10 }]}>Entrega</Text>
              </View>
            </View>
          </View>
        )}

        {/* Información adicional */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.itemDetails, { fontSize: 11 }]}>
            Creado: {credential.created_at ? new Date(credential.created_at).toLocaleDateString() : 'N/A'}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => refreshToken(credential.id)}
              style={{ marginRight: 16 }}
            >
              <Text style={[styles.itemDetails, { fontSize: 11, color: '#007bff' }]}>
                🔄 Refrescar Token
              </Text>
            </TouchableOpacity>

            {credential.last_used && typeof credential.last_used === 'string' && (
              <Text style={[styles.itemDetails, { fontSize: 11 }]}>
                Último uso: {new Date(credential.last_used).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {credential.notes && typeof credential.notes === 'string' && credential.notes.trim() && (
          <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: isDarkMode ? '#3a3a3a' : '#e0e0e0' }}>
            <Text style={[styles.itemDetails, { fontSize: 12, fontStyle: 'italic' }]}>
              {credential.notes}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#BB86FC' : '#6200EE'} />
        <Text style={[styles.itemDetails, { marginTop: 16 }]}>Cargando credenciales...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={isDarkMode ? 'white' : 'black'} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Credenciales LabsMobile</Text>
            <Text style={styles.headerSubtitle}>Gestión de API Keys</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            onPress={() => loadAuditLog()}
            style={{ 
              backgroundColor: isDarkMode ? '#3a2a4a' : '#f0e8ff',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              marginRight: 8
            }}
          >
            <Icon name="history" size={20} color="#6f42c1" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => openModal()}
            style={{ 
              backgroundColor: isDarkMode ? '#2a4a2a' : '#e8f5e8',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              marginRight: 8
            }}
          >
            <Icon name="add" size={20} color="#28a745" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Resumen */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="api" size={24} color={isDarkMode ? '#BB86FC' : '#6200EE'} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.cardTitle}>Estado del Sistema</Text>
              <Text style={styles.cardDetail}>
                {credentials.length} credencial(es) configurada(s)
              </Text>
            </View>
          </View>
          
          {activeCredentials.length > 0 && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDarkMode ? '#3a3a3a' : '#e0e0e0' }}>
              <Text style={[styles.itemDetails, { fontSize: 12, marginBottom: 8 }]}>
                Credenciales Activas: {(activeCredentials || []).length}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.itemDetails, { fontSize: 11 }]}>
                  ✅ Configuradas: {(activeCredentials || []).filter(c => c.token_status === 'CONFIGURED').length}
                </Text>
                <Text style={[styles.itemDetails, { fontSize: 11 }]}>
                  ⚠️ Pendientes: {(activeCredentials || []).filter(c => c.token_status === 'PENDING_CONFIGURATION').length}
                </Text>
                <Text style={[styles.itemDetails, { fontSize: 11 }]}>
                  🎯 Predeterminada: {(activeCredentials || []).filter(c => c.is_default).length}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Lista de credenciales */}
        <View style={[styles.card, { padding: 0 }]}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#3a3a3a' : '#e0e0e0' }}>
            <Text style={styles.sectionTitle}>Credenciales Configuradas</Text>
          </View>
          
          {(credentials || []).length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Icon name="api" size={48} color={isDarkMode ? '#666666' : '#cccccc'} />
              <Text style={[styles.itemDetails, { fontSize: 16, marginTop: 16, textAlign: 'center' }]}>
                No hay credenciales configuradas
              </Text>
              <Text style={[styles.itemDetails, { fontSize: 12, marginTop: 8, textAlign: 'center' }]}>
                Agrega tu primera credencial LabsMobile para comenzar a enviar SMS
              </Text>
              <TouchableOpacity
                onPress={() => openModal()}
                style={[styles.primaryButton, { marginTop: 16 }]}
              >
                <Icon name="add" size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.primaryButtonText}>Agregar Credenciales</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              {(credentials || []).map((credential, index) => {
                try {
                  return renderCredentialCard(credential);
                } catch (error) {
                  console.error(`❌ [LabsMobile] Error rendering credential ${index}:`, error);
                  console.error('📄 [LabsMobile] Credential data:', JSON.stringify(credential, null, 2));
                  return (
                    <View key={`error-${index}`} style={[styles.card, { padding: 16, marginBottom: 16 }]}>
                      <Text style={[styles.itemDetails, { color: '#dc3545' }]}>
                        Error al mostrar credencial {index + 1}
                      </Text>
                    </View>
                  );
                }
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Log de Auditoría */}
      <Modal
        visible={showAuditLog}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
          {/* Header del modal */}
          <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#3a3a3a' : '#e0e0e0' }]}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => setShowAuditLog(false)} style={styles.backButton}>
                <Icon name="close" size={24} color={isDarkMode ? 'white' : 'black'} />
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>Historial de Cambios</Text>
                <Text style={styles.headerSubtitle}>
                  {selectedCredentialForAudit 
                    ? `Credencial ID: ${selectedCredentialForAudit}` 
                    : 'Todas las credenciales'}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {auditLogs.length === 0 ? (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Icon name="history" size={48} color={isDarkMode ? '#666666' : '#cccccc'} />
                <Text style={[styles.itemDetails, { fontSize: 16, marginTop: 16, textAlign: 'center' }]}>
                  No hay registros de auditoría
                </Text>
                <Text style={[styles.itemDetails, { fontSize: 12, marginTop: 8, textAlign: 'center' }]}>
                  Los cambios en las credenciales aparecerán aquí
                </Text>
              </View>
            ) : (
              <View style={{ padding: 16 }}>
                {auditLogs.map((log, index) => (
                  <View 
                    key={index} 
                    style={[styles.card, { 
                      marginBottom: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: log.action === 'CREATE' ? '#28a745' :
                                       log.action === 'UPDATE' ? '#ffc107' :
                                       log.action === 'DELETE' ? '#dc3545' :
                                       log.action === 'TOKEN_REFRESH' ? '#17a2b8' : '#6c757d'
                    }]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Icon 
                            name={
                              log.action === 'CREATE' ? 'add-circle' :
                              log.action === 'UPDATE' ? 'edit' :
                              log.action === 'DELETE' ? 'delete' :
                              log.action === 'TOKEN_REFRESH' ? 'refresh' : 'info'
                            }
                            size={16}
                            color={
                              log.action === 'CREATE' ? '#28a745' :
                              log.action === 'UPDATE' ? '#ffc107' :
                              log.action === 'DELETE' ? '#dc3545' :
                              log.action === 'TOKEN_REFRESH' ? '#17a2b8' : '#6c757d'
                            }
                            style={{ marginRight: 6 }}
                          />
                          <Text style={[styles.itemName, { fontSize: 14 }]}>
                            {log.action === 'CREATE' ? 'Credencial Creada' :
                             log.action === 'UPDATE' ? 'Credencial Actualizada' :
                             log.action === 'DELETE' ? 'Credencial Eliminada' :
                             log.action === 'TOKEN_REFRESH' ? 'Token Actualizado' : log.action}
                          </Text>
                        </View>
                        
                        <Text style={[styles.itemDetails, { fontSize: 12, marginBottom: 4 }]}>
                          Usuario: {log.username || log.credential_username || 'Sistema'}
                        </Text>
                        
                        <Text style={[styles.itemDetails, { fontSize: 11 }]}>
                          {(log.created_at || log.timestamp) ? new Date(log.created_at || log.timestamp).toLocaleString() : 'Fecha no disponible'}
                        </Text>
                      </View>
                      
                      <View style={{ 
                        backgroundColor: log.action === 'CREATE' ? (isDarkMode ? '#1a4a2a' : '#e8f5e8') :
                                         log.action === 'UPDATE' ? (isDarkMode ? '#4a3a1a' : '#fff3cd') :
                                         log.action === 'DELETE' ? (isDarkMode ? '#4a1a1a' : '#f8d7da') :
                                         log.action === 'TOKEN_REFRESH' ? (isDarkMode ? '#1a3a4a' : '#d1ecf1') :
                                         (isDarkMode ? '#3a3a3a' : '#e9ecef'),
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '600',
                          color: log.action === 'CREATE' ? '#28a745' :
                                 log.action === 'UPDATE' ? '#856404' :
                                 log.action === 'DELETE' ? '#721c24' :
                                 log.action === 'TOKEN_REFRESH' ? '#0c5460' : '#495057'
                        }}>
                          {log.action}
                        </Text>
                      </View>
                    </View>
                    
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <View style={{ 
                        backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 8
                      }}>
                        <Text style={[styles.itemDetails, { fontSize: 11, marginBottom: 4, fontWeight: '500' }]}>
                          Cambios realizados:
                        </Text>
                        {Object.entries(log.changes || {}).map(([key, change], changeIndex) => (
                          <Text key={changeIndex} style={[styles.itemDetails, { fontSize: 10, marginBottom: 2 }]}>
                            • {key}: {(change?.from || 'vacío').toString()} → {(change?.to || 'vacío').toString()}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    {log.ip_address && (
                      <Text style={[styles.itemDetails, { fontSize: 10, marginTop: 4, fontStyle: 'italic' }]}>
                        IP: {log.ip_address}
                      </Text>
                    )}
                    
                    {log.notes && (
                      <Text style={[styles.itemDetails, { fontSize: 11, marginTop: 4, fontStyle: 'italic' }]}>
                        Notas: {log.notes}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de formulario */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
          {/* Header del modal */}
          <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#3a3a3a' : '#e0e0e0' }]}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.backButton}>
                <Icon name="close" size={24} color={isDarkMode ? 'white' : 'black'} />
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>
                  {editingCredential ? 'Editar Credenciales' : 'Nuevas Credenciales'}
                </Text>
                <Text style={styles.headerSubtitle}>LabsMobile API</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Credenciales de Autenticación */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📧 Credenciales de Autenticación</Text>
              
              {/* Username */}
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { 
                  marginBottom: 6, 
                  fontSize: 13,
                  fontWeight: '500',
                  color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
                }]}>
                  Email de la cuenta *
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
                  value={formData.username}
                  onChangeText={(text) => setFormData({...formData, username: text})}
                  placeholder="wdperezh@wellnet-rd.com"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* API Token */}
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { 
                  marginBottom: 6, 
                  fontSize: 13,
                  fontWeight: '500',
                  color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
                }]}>
                  Token API {editingCredential ? '(opcional - dejar vacío mantiene el actual)' : '*'}
                </Text>
                {editingCredential && (
                  <View style={{
                    backgroundColor: isDarkMode ? '#2a3a4a' : '#e3f2fd',
                    padding: 8,
                    borderRadius: 4,
                    marginBottom: 8
                  }}>
                    <Text style={[styles.itemDetails, { fontSize: 11, color: '#2196f3' }]}>
                      💡 Editando credenciales existentes. Ingresa un nuevo token solo si quieres cambiarlo.
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.input, {
                      flex: 1,
                      minHeight: 48,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      borderWidth: 1,
                      borderColor: isDarkMode ? '#4a4a4a' : '#d0d0d0',
                      borderRadius: 8,
                      fontSize: 14,
                      color: isDarkMode ? '#ffffff' : '#1a1a1a',
                      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                      marginRight: 8
                    }]}
                    value={formData.api_token}
                    onChangeText={(text) => setFormData({...formData, api_token: text})}
                    placeholder={editingCredential ? "Nuevo token LabsMobile (opcional)" : "Token de API LabsMobile"}
                    placeholderTextColor={isDarkMode ? '#888' : '#999'}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{
                      padding: 12,
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
                      borderRadius: 8,
                      minWidth: 44,
                      minHeight: 44,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={isDarkMode ? '#b0b0b0' : '#666666'} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.itemDetails, { fontSize: 11, marginTop: 4 }]}>
                  Obténlo desde tu panel de LabsMobile en Configuración → API
                </Text>
                
                {formData.api_token && formData.api_token.trim() && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 8,
                    padding: 8,
                    backgroundColor: isDarkMode ? '#2a3a2a' : '#e8f5e8',
                    borderRadius: 4
                  }}>
                    <Icon name="info" size={16} color="#28a745" style={{ marginRight: 6 }} />
                    <Text style={[styles.itemDetails, { fontSize: 11, color: '#28a745', flex: 1 }]}>
                      Token ingresado - podrás probarlo después de guardar
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Configuración de Seguridad */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>🔐 Configuración de Seguridad</Text>
              
              {/* IP Filter */}
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { 
                  marginBottom: 6, 
                  fontSize: 13,
                  fontWeight: '500',
                  color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
                }]}>
                  IPs Autorizadas (opcional)
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
                  value={formData.ip_filter}
                  onChangeText={(text) => setFormData({...formData, ip_filter: text})}
                  placeholder="190.110.34.116, 172.16.10.1"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  multiline
                />
                <Text style={[styles.itemDetails, { fontSize: 11, marginTop: 4 }]}>
                  Separa múltiples IPs con comas. Dejar vacío permite todas las IPs
                </Text>
              </View>
            </View>

            {/* Configuración de Webhooks */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>🔗 Webhooks de Notificación</Text>
              
              {/* Delivery Webhook */}
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { 
                  marginBottom: 6, 
                  fontSize: 13,
                  fontWeight: '500',
                  color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
                }]}>
                  URL Confirmaciones de Entrega
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
                  value={formData.delivery_webhook_url}
                  onChangeText={(text) => setFormData({...formData, delivery_webhook_url: text})}
                  placeholder="https://wellnet-rd.com:444/api/labsmobile/webhooks/delivery"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              {/* Clicks Webhook */}
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { 
                  marginBottom: 6, 
                  fontSize: 13,
                  fontWeight: '500',
                  color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
                }]}>
                  URL Notificaciones de Clics
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
                  value={formData.clicks_webhook_url}
                  onChangeText={(text) => setFormData({...formData, clicks_webhook_url: text})}
                  placeholder="https://wellnet-rd.com:444/api/labsmobile/webhooks/clicks"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              {/* Incoming Webhook */}
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { 
                  marginBottom: 6, 
                  fontSize: 13,
                  fontWeight: '500',
                  color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
                }]}>
                  URL Mensajes Entrantes
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
                  value={formData.incoming_webhook_url}
                  onChangeText={(text) => setFormData({...formData, incoming_webhook_url: text})}
                  placeholder="https://wellnet-rd.com:444/api/labsmobile/webhooks/incoming"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Configuración General */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>⚙️ Configuración General</Text>
              
              {/* Switches */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 12
                }}>
                  <Text style={[styles.label, { fontSize: 14 }]}>Credencial Activa</Text>
                  <Switch
                    value={formData.is_active}
                    onValueChange={(value) => setFormData({...formData, is_active: value})}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={formData.is_active ? '#28a745' : '#f4f3f4'}
                  />
                </View>

                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { fontSize: 14 }]}>Usar como Predeterminada</Text>
                    <Text style={[styles.itemDetails, { fontSize: 11, marginTop: 2 }]}>
                      Solo una credencial puede ser predeterminada
                    </Text>
                  </View>
                  <Switch
                    value={formData.is_default}
                    onValueChange={(value) => setFormData({...formData, is_default: value})}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={formData.is_default ? '#2196f3' : '#f4f3f4'}
                  />
                </View>
              </View>

              {/* Notas */}
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { 
                  marginBottom: 6, 
                  fontSize: 13,
                  fontWeight: '500',
                  color: isDarkMode ? '#e5e5e5' : '#2a2a2a'
                }]}>
                  Notas adicionales
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
                  value={formData.notes}
                  onChangeText={(text) => setFormData({...formData, notes: text})}
                  placeholder="Notas o comentarios sobre esta configuración..."
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  multiline
                  maxLength={500}
                />
                <Text style={[styles.itemDetails, { fontSize: 11, marginTop: 4 }]}>
                  {formData.notes.length}/500 caracteres
                </Text>
              </View>
            </View>

          </ScrollView>

          {/* Botones de acción - Fijos en la parte inferior */}
          <View style={{ 
            flexDirection: 'row', 
            padding: 16, 
            gap: 12,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#3a3a3a' : '#e0e0e0',
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'
          }}>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={[styles.secondaryButton, { flex: 1 }]}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={saveCredential}
              disabled={saving}
              style={[styles.primaryButton, { flex: 1, opacity: saving ? 0.5 : 1 }]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {editingCredential ? 'Actualizar Credenciales' : 'Guardar Credenciales'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LabsMobileCredentialsScreen;