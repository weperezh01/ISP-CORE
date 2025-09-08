import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from '../../estilos/styles';
import Selector from '../../componentes/Selector';

// Componentes optimizados
import ConfigurationHeader from './components/ConfigurationHeader';
import LoadingOverlay from './components/LoadingOverlay';

// Hooks optimizados
import { useConfiguration, ConfigurationProvider } from './context/ConfigurationContext';
import { useConfigurationAPI } from './hooks/useConfigurationAPI';
import { useValidation, routerSelectionSchema } from './hooks/useValidation';

// Constantes
import { SCREEN_TITLES, ERROR_MESSAGES } from './constants/configurationConstants';

const ConfiguracionScreenContent = ({ route }) => {
  const { connectionId } = route.params;
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const navigation = useNavigation();

  // Context y hooks
  const {
    state,
    setConnectionId,
    setClientData,
    setSelectedRouter,
    setRouters,
    setCurrentStep,
  } = useConfiguration();

  const {
    userData,
    getClientByConnection,
    getRoutersByIsp,
    logNavigation,
  } = useConfigurationAPI();

  const { errors, validate, validateField } = useValidation(routerSelectionSchema);

  const [userName, setUserName] = useState('');

  // Inicialización
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // Establecer ID de conexión
        setConnectionId(connectionId);
        setCurrentStep('router');

        // Obtener datos del usuario
        const user = await userData || await getUserData();
        if (user) {
          setUserName(user.nombre);
        }

        // Obtener datos del cliente
        const clientData = await getClientByConnection(connectionId);
        if (clientData) {
          setClientData(clientData);
        }

        // Obtener routers disponibles
        const routersData = await getRoutersByIsp();
        if (routersData) {
          setRouters(routersData);
        }

        // Registrar navegación sin delay
        logNavigation('ConfiguracionScreenOptimized', {
          connectionId,
          clientData,
        });

      } catch (error) {
        console.error('Error inicializando ConfiguracionScreen:', error);
        Alert.alert('Error', ERROR_MESSAGES.NO_CONNECTION);
      }
    };

    initializeScreen();
  }, [connectionId]);

  const handleRouterSelection = (routerId: string) => {
    const selectedRouter = state.routers.find((router) => router.id_router === routerId);
    
    if (!selectedRouter) {
      Alert.alert('Error', 'Router no encontrado');
      return;
    }

    // Validar selección
    const isValid = validate({ selectedRouter });
    if (!isValid) {
      return;
    }

    // Actualizar contexto
    setSelectedRouter({
      id_router: selectedRouter.id_router,
      label: selectedRouter.label || selectedRouter.nombre_router || '',
      descripcion: selectedRouter.descripcion || '',
    });

    // Navegar a la siguiente pantalla
    navigation.navigate('ConfiguracionFijarIP', {
      connectionId,
      nombres: state.clientData?.nombres || '',
      apellidos: state.clientData?.apellidos || '',
      direccion: state.clientData?.direccion || '',
      router: selectedRouter,
    });
  };

  return (
    <>
      <ConfigurationHeader
        userName={userName}
        showProgress={true}
      />
      
      <View style={styles.container}>
        {/* Información de la conexión */}
        <View style={{
          backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderLeftWidth: 4,
          borderLeftColor: '#3B82F6',
        }}>
          <Text style={[styles.title, { fontSize: 18, marginBottom: 8 }]}>
            Configuración de la Conexión: {connectionId}
          </Text>
          
          {state.clientData && (
            <>
              <Text style={[styles.infoText, { marginBottom: 4 }]}>
                Cliente: {state.clientData.nombres} {state.clientData.apellidos}
              </Text>
              <Text style={styles.infoText}>
                Dirección: {state.clientData.direccion}
              </Text>
            </>
          )}
        </View>

        {/* Selector de Router */}
        <View style={{ marginBottom: 20 }}>
          <Selector
            label="Seleccionar Router Principal"
            placeholder="Elija el router para esta conexión"
            data={state.routers.map(router => ({
              label: router.descripcion || router.nombre_router || `Router ${router.id_router}`,
              value: router.id_router,
            }))}
            selectedValue={''}
            onValueChange={handleRouterSelection}
            isDarkMode={isDarkMode}
          />
          
          {errors.selectedRouter && (
            <Text style={{
              color: '#EF4444',
              fontSize: 12,
              marginTop: 4,
              marginLeft: 4,
            }}>
              {errors.selectedRouter}
            </Text>
          )}
        </View>

        {/* Información adicional */}
        {state.routers.length === 0 && !state.isLoading && (
          <View style={{
            backgroundColor: isDarkMode ? '#FEF3C7' : '#FFFBEB',
            borderColor: '#F59E0B',
            borderWidth: 1,
            borderRadius: 8,
            padding: 16,
            alignItems: 'center',
          }}>
            <Text style={{
              color: '#92400E',
              fontSize: 14,
              textAlign: 'center',
              fontWeight: '500',
            }}>
              ⚠️ No hay routers disponibles para este ISP
            </Text>
            <Text style={{
              color: '#92400E',
              fontSize: 12,
              textAlign: 'center',
              marginTop: 4,
            }}>
              Contacte al administrador para configurar routers
            </Text>
          </View>
        )}

        {/* Resumen del progreso */}
        {state.selectedRouter && (
          <View style={{
            backgroundColor: isDarkMode ? '#065F46' : '#ECFDF5',
            borderColor: '#10B981',
            borderWidth: 1,
            borderRadius: 8,
            padding: 16,
            marginTop: 20,
          }}>
            <Text style={{
              color: isDarkMode ? '#A7F3D0' : '#065F46',
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 4,
            }}>
              ✅ Router Seleccionado
            </Text>
            <Text style={{
              color: isDarkMode ? '#6EE7B7' : '#047857',
              fontSize: 12,
            }}>
              {state.selectedRouter.descripcion}
            </Text>
          </View>
        )}
      </View>

      <LoadingOverlay
        visible={state.isLoading}
        message="Cargando datos de configuración..."
      />
    </>
  );
};

// Wrapper con Provider
const ConfiguracionScreenOptimized = ({ route }) => {
  return (
    <ConfigurationProvider>
      <ConfiguracionScreenContent route={route} />
    </ConfigurationProvider>
  );
};

export default ConfiguracionScreenOptimized;