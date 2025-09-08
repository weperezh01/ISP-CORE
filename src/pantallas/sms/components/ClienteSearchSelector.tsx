import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
} from 'react-native';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Cliente {
  id_cliente: number;
  nombre_completo: string;
  telefono1: string;
  direccion_ipv4?: string;
  cedula?: string;
  nombre?: string;
  apellido?: string;
  telefono2?: string;
  rnc?: string;
  pasaporte?: string;
}

interface ClienteSearchSelectorProps {
  onClientesSeleccionados: (clientes: Cliente[]) => void;
  clientesSeleccionados: Cliente[];
  isDarkMode: boolean;
  filtroGrupo?: {
    tipo_grupo: string;
    grupo_id: string | number;
    clientes: Cliente[];
  };
}

const API_BASE = 'https://wellnet-rd.com:444/api';

const ClienteSearchSelector: React.FC<ClienteSearchSelectorProps> = ({
  onClientesSeleccionados,
  clientesSeleccionados,
  isDarkMode,
  filtroGrupo,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [clientesBusqueda, setClientesBusqueda] = useState<Cliente[]>([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const styles = getStyles(isDarkMode);

  // Combinar clientes del filtro de grupo con clientes seleccionados individualmente
  const clientesVisibles = React.useMemo(() => {
    const clientesDelFiltro = filtroGrupo ? filtroGrupo.clientes : [];
    const clientesIndividuales = clientesSeleccionados.filter(
      cliente =>
        !clientesDelFiltro.some(cf => cf.id_cliente === cliente.id_cliente),
    );
    return [...clientesDelFiltro, ...clientesIndividuales];
  }, [filtroGrupo, clientesSeleccionados]);

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Buscar clientes con debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (busqueda.trim().length >= 2) {
      debounceTimer.current = setTimeout(() => {
        buscarClientes();
      }, 300);
    } else {
      setClientesBusqueda([]);
      hideResultados();
    }
  }, [busqueda]);

  const buscarClientes = async () => {
    try {
      setCargandoBusqueda(true);
      const userData = await AsyncStorage.getItem('@loginData');
      const user = userData ? JSON.parse(userData) : null;

      if (!user?.token) {
        Alert.alert('Error', 'Token de autenticación no encontrado');
        return;
      }

      const response = await fetch(
        `${API_BASE}/clientes/search?q=${encodeURIComponent(busqueda)}`,
        {
          headers: {Authorization: `Bearer ${user.token}`},
        },
      );

      if (response.ok) {
        const data = await response.json();
        setClientesBusqueda(data.clientes || []);
        showResultados();
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ [Cliente Search] Error searching clients:', error);
      Alert.alert('Error', 'No se pudieron buscar clientes');
    } finally {
      setCargandoBusqueda(false);
    }
  };

  const showResultados = () => {
    setMostrarResultados(true);
    Animated.timing(animatedHeight, {
      toValue: 250,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const hideResultados = () => {
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setMostrarResultados(false);
    });
  };

  const seleccionarClienteIndividual = (cliente: Cliente) => {
    const yaSeleccionado = clientesSeleccionados.some(
      c => c.id_cliente === cliente.id_cliente,
    );

    if (yaSeleccionado) {
      // Deseleccionar cliente individual
      const nuevosSeleccionados = clientesSeleccionados.filter(
        c => c.id_cliente !== cliente.id_cliente,
      );
      onClientesSeleccionados(nuevosSeleccionados);
    } else {
      // Seleccionar cliente individual
      onClientesSeleccionados([...clientesSeleccionados, cliente]);
    }

    setBusqueda('');
    hideResultados();
    Keyboard.dismiss();
  };

  const seleccionarTodosVisibles = () => {
    const clientesNoSeleccionados = clientesVisibles.filter(
      cliente =>
        !clientesSeleccionados.some(cs => cs.id_cliente === cliente.id_cliente),
    );
    onClientesSeleccionados([
      ...clientesSeleccionados,
      ...clientesNoSeleccionados,
    ]);
  };

  const deseleccionarTodosVisibles = () => {
    const idsVisibles = clientesVisibles.map(c => c.id_cliente);
    const clientesMantenidos = clientesSeleccionados.filter(
      cliente => !idsVisibles.includes(cliente.id_cliente),
    );
    onClientesSeleccionados(clientesMantenidos);
  };

  const eliminarClienteSeleccionado = (clienteId: number) => {
    const nuevosSeleccionados = clientesSeleccionados.filter(
      c => c.id_cliente !== clienteId,
    );
    onClientesSeleccionados(nuevosSeleccionados);
  };

  const estaSeleccionado = (clienteId: number) => {
    return clientesSeleccionados.some(c => c.id_cliente === clienteId);
  };

  const renderClienteBusqueda = ({item}: {item: Cliente}) => {
    // Construir información de identificación adicional
    const infoAdicional = [];
    if (item.cedula) infoAdicional.push(`Cédula: ${item.cedula}`);
    if (item.rnc) infoAdicional.push(`RNC: ${item.rnc}`);
    if (item.pasaporte) infoAdicional.push(`Pasaporte: ${item.pasaporte}`);
    if (item.telefono2) infoAdicional.push(`Tel2: ${item.telefono2}`);

    return (
      <TouchableOpacity
        style={styles.clienteItem}
        onPress={() => seleccionarClienteIndividual(item)}>
        <View style={styles.clienteInfo}>
          <View style={styles.clienteHeader}>
            <Text style={styles.clienteNombre}>{item.nombre_completo}</Text>
            <Text style={styles.clienteId}>ID: {item.id_cliente}</Text>
          </View>
          <Text style={styles.clienteTelefono}>{item.telefono1}</Text>
          {item.direccion_ipv4 && (
            <Text style={styles.clienteIp}>IP: {item.direccion_ipv4}</Text>
          )}
          {infoAdicional.length > 0 && (
            <Text style={styles.clienteInfoAdicional}>
              {infoAdicional.join(' • ')}
            </Text>
          )}
        </View>
        <Icon
          name={
            estaSeleccionado(item.id_cliente)
              ? 'check-circle'
              : 'add-circle-outline'
          }
          size={24}
          color={estaSeleccionado(item.id_cliente) ? '#28a745' : '#2196f3'}
        />
      </TouchableOpacity>
    );
  };

  const renderClienteSeleccionado = ({item}: {item: Cliente}) => (
    <View style={styles.clienteSeleccionadoItem}>
      <View style={styles.clienteSeleccionadoInfo}>
        <Text style={styles.clienteSeleccionadoNombre}>
          {item.nombre_completo}
        </Text>
        <Text style={styles.clienteSeleccionadoTelefono}>{item.telefono1}</Text>
      </View>
      <TouchableOpacity
        style={styles.eliminarButton}
        onPress={() => eliminarClienteSeleccionado(item.id_cliente)}>
        <Icon name="close" size={20} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="search" size={24} color="#2196f3" />
        <Text style={styles.title}>🔍 Seleccionar Clientes</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#888888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por ID, cédula, teléfono, nombre, apellido, RNC, pasaporte o IP..."
            placeholderTextColor="#888888"
            value={busqueda}
            onChangeText={setBusqueda}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {cargandoBusqueda && (
            <ActivityIndicator size="small" color="#2196f3" />
          )}
        </View>
      </View>

      {/* Resultados de búsqueda */}
      {mostrarResultados && (
        <Animated.View
          style={[styles.resultadosContainer, {height: animatedHeight}]}>
          <FlatList
            data={clientesBusqueda}
            renderItem={renderClienteBusqueda}
            keyExtractor={item => item.id_cliente.toString()}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={40} color="#888888" />
                <Text style={styles.emptyText}>No se encontraron clientes</Text>
              </View>
            }
          />
        </Animated.View>
      )}

      {/* Clientes visibles (filtro de grupo + seleccionados individualmente) */}
      {clientesVisibles.length > 0 && (
        <View style={styles.clientesVisiblesContainer}>
          <View style={styles.clientesVisiblesHeader}>
            <Text style={styles.clientesVisiblesTitle}>
              📋 Clientes para SMS ({clientesVisibles.length})
            </Text>
            <View style={styles.accionesMasivas}>
              <TouchableOpacity
                style={styles.accionMasivaButton}
                onPress={seleccionarTodosVisibles}>
                <Icon name="check-box" size={18} color="#28a745" />
                <Text style={styles.accionMasivaText}>Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.accionMasivaButton}
                onPress={deseleccionarTodosVisibles}>
                <Icon
                  name="check-box-outline-blank"
                  size={18}
                  color="#dc3545"
                />
                <Text style={styles.accionMasivaText}>Ninguno</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={clientesVisibles}
            renderItem={renderClienteSeleccionado}
            keyExtractor={item => item.id_cliente.toString()}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            maxHeight={300}
            style={styles.clientesVisiblesList}
          />
        </View>
      )}

      {/* Contador de seleccionados */}
      {clientesSeleccionados.length > 0 && (
        <View style={styles.contadorContainer}>
          <Icon name="people" size={20} color="#2196f3" />
          <Text style={styles.contadorText}>
            {clientesSeleccionados.length} cliente
            {clientesSeleccionados.length !== 1 ? 's' : ''} seleccionado
            {clientesSeleccionados.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
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
    searchContainer: {
      marginBottom: 16,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
      borderRadius: 25,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#333333',
      marginLeft: 12,
      marginRight: 8,
    },
    resultadosContainer: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
      borderRadius: 8,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDarkMode ? '#333333' : '#e0e0e0',
    },
    clienteItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333333' : '#e0e0e0',
    },
    clienteInfo: {
      flex: 1,
    },
    clienteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    clienteNombre: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#ffffff' : '#333333',
      flex: 1,
      marginRight: 8,
    },
    clienteId: {
      fontSize: 12,
      fontWeight: '500',
      color: '#2196f3',
      backgroundColor: isDarkMode ? '#1a3a5a' : '#e3f2fd',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    clienteTelefono: {
      fontSize: 14,
      color: isDarkMode ? '#aaaaaa' : '#666666',
      marginBottom: 2,
    },
    clienteIp: {
      fontSize: 12,
      color: '#2196f3',
      marginBottom: 2,
    },
    clienteInfoAdicional: {
      fontSize: 11,
      color: isDarkMode ? '#999999' : '#777777',
      fontStyle: 'italic',
      lineHeight: 16,
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: '#888888',
      marginTop: 8,
    },
    clientesVisiblesContainer: {
      backgroundColor: isDarkMode ? '#1a3a5a' : '#e3f2fd',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#2196f3' : '#bbdefb',
    },
    clientesVisiblesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    clientesVisiblesTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#64b5f6' : '#1976d2',
    },
    accionesMasivas: {
      flexDirection: 'row',
      gap: 8,
    },
    accionMasivaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
    },
    accionMasivaText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
      color: isDarkMode ? '#ffffff' : '#333333',
    },
    clientesVisiblesList: {
      maxHeight: 300,
    },
    clienteSeleccionadoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      padding: 10,
      marginBottom: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
    },
    clienteSeleccionadoInfo: {
      flex: 1,
    },
    clienteSeleccionadoNombre: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#ffffff' : '#333333',
      marginBottom: 2,
    },
    clienteSeleccionadoTelefono: {
      fontSize: 12,
      color: isDarkMode ? '#aaaaaa' : '#666666',
    },
    eliminarButton: {
      padding: 4,
    },
    contadorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? '#1a3a1a' : '#e8f5e8',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#28a745',
    },
    contadorText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#28a745',
      marginLeft: 8,
    },
  });

export default ClienteSearchSelector;
