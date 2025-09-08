import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/configurationConstants';
import { useConfiguration } from '../context/ConfigurationContext';

interface UserData {
  id: string;
  nombre: string;
}

interface ClientData {
  nombres: string;
  apellidos: string;
  direccion: string;
}

interface Router {
  id_router: string;
  label: string;
  descripcion: string;
}

interface Network {
  label: string;
  value: string;
}

interface Lease {
  'mac-address': string;
  'active-address': string;
  server?: string;
  status: string;
  'expires-after': string;
}

export const useConfigurationAPI = () => {
  const { setLoading, setError } = useConfiguration();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [ispId, setIspId] = useState<string | null>(null);

  // Obtener datos del usuario desde AsyncStorage
  const getUserData = useCallback(async (): Promise<UserData | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem('@loginData');
      if (jsonValue) {
        const data = JSON.parse(jsonValue);
        setUserData(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      setError('Error al obtener datos del usuario');
      return null;
    }
  }, [setError]);

  // Obtener ISP ID desde AsyncStorage
  const getIspId = useCallback(async (): Promise<string | null> => {
    try {
      const id = await AsyncStorage.getItem('@selectedIspId');
      setIspId(id);
      return id;
    } catch (error) {
      console.error('Error al obtener ISP ID:', error);
      setError('Error al obtener ISP ID');
      return null;
    }
  }, [setError]);

  // Obtener datos del cliente por conexión
  const getClientByConnection = useCallback(async (connectionId: string): Promise<ClientData | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/obtener-cliente-por-conexion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_conexion: connectionId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          nombres: data.nombres,
          apellidos: data.apellidos,
          direccion: data.direccion || '-',
        };
      } else {
        throw new Error(data.message || 'Error al obtener datos del cliente');
      }
    } catch (error) {
      console.error('Error en getClientByConnection:', error);
      setError('No se pudieron obtener los datos del cliente');
      Alert.alert('Error', 'No se pudieron obtener los datos del cliente. Por favor, intente nuevamente.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Obtener routers por ISP
  const getRoutersByIsp = useCallback(async (): Promise<Router[]> => {
    try {
      setLoading(true);
      setError(null);

      const ispId = await getIspId();
      if (!ispId) {
        throw new Error('ISP ID no disponible');
      }

      const response = await fetch(`${API_BASE_URL}/routers/por-isp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ispId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Error al obtener routers');
      }
    } catch (error) {
      console.error('Error en getRoutersByIsp:', error);
      setError('No se pudieron obtener los routers');
      Alert.alert('Error', 'No se pudieron obtener los routers. Por favor, intente nuevamente.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, getIspId]);

  // Obtener redes por router
  const getNetworksByRouter = useCallback(async (routerId: string): Promise<Network[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/routers/redes-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_router: routerId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return data.map((item: any) => ({
          label: item.address,
          value: item.address,
        }));
      } else {
        throw new Error(data.message || 'Error al obtener redes');
      }
    } catch (error) {
      console.error('Error en getNetworksByRouter:', error);
      setError('No se pudieron obtener las redes del router');
      Alert.alert('Error', 'No se pudieron obtener las redes del router. Por favor, intente nuevamente.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Obtener leases DHCP dinámicos
  const getDynamicLeases = useCallback(async (routerId: string): Promise<Lease[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/mikrotik-dhcp-leases-dynamic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_router: routerId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Error al obtener leases DHCP');
      }
    } catch (error) {
      console.error('Error en getDynamicLeases:', error);
      setError('No se pudieron obtener las concesiones DHCP dinámicas');
      Alert.alert('Error', 'No se pudieron obtener las concesiones DHCP dinámicas. Por favor, intente nuevamente.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Guardar configuración
  const saveConfiguration = useCallback(async (configData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const user = await getUserData();
      const isp = await getIspId();

      if (!user || !isp) {
        throw new Error('Datos de usuario o ISP no disponibles');
      }

      const payload = {
        ...configData,
        id_usuario: user.id,
        id_isp: isp,
      };

      const response = await fetch(`${API_BASE_URL}/guardar-configuracion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Éxito', 'La configuración fue guardada correctamente.');
        return true;
      } else {
        throw new Error(data.message || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error en saveConfiguration:', error);
      setError('No se pudo guardar la configuración');
      Alert.alert('Error', 'No se pudo guardar la configuración al servidor.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, getUserData, getIspId]);

  // Registrar navegación (optimizada sin delay)
  const logNavigation = useCallback(async (screen: string, data: any): Promise<void> => {
    try {
      const user = await getUserData();
      if (!user) return;

      const fechaActual = new Date();
      const fecha = fechaActual.toISOString().split('T')[0];
      const hora = fechaActual.toTimeString().split(' ')[0];

      const navigationLogData = {
        id_usuario: user.id,
        fecha,
        hora,
        pantalla: screen,
        datos: JSON.stringify(data),
      };

      // Ejecutar en background sin bloquear la UI
      fetch(`${API_BASE_URL}/log-navegacion-registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(navigationLogData),
      }).catch((error) => {
        console.warn('Error al registrar navegación:', error);
      });
    } catch (error) {
      console.warn('Error al registrar navegación:', error);
    }
  }, [getUserData]);

  return {
    userData,
    ispId,
    getUserData,
    getIspId,
    getClientByConnection,
    getRoutersByIsp,
    getNetworksByRouter,
    getDynamicLeases,
    saveConfiguration,
    logNavigation,
  };
};

export default useConfigurationAPI;