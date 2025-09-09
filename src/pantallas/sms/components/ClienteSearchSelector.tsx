import React, {useState, useEffect, useRef, useCallback} from 'react';
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
import CheckBox from '@react-native-community/checkbox';
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

interface ClienteConEstado extends Cliente {
  habilitado?: boolean;
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
  const [estadosClientes, setEstadosClientes] = useState<{[key: number]: boolean}>({});
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
    const clientesCombinados = [...clientesDelFiltro, ...clientesIndividuales];
    
    // Crear un Map para eliminar duplicados de forma más robusta
    const clientesMap = new Map<number, Cliente>();
    clientesCombinados.forEach(cliente => {
      if (!clientesMap.has(cliente.id_cliente)) {
        clientesMap.set(cliente.id_cliente, cliente);
      }
    });
    
    return Array.from(clientesMap.values());
  }, [filtroGrupo, clientesSeleccionados]);

  // Obtener clientes realmente habilitados para envío
  const clientesHabilitados = React.useMemo(() => {
    return clientesVisibles.filter(cliente => {
      const estado = estadosClientes[cliente.id_cliente];
      return estado !== false; // Por defecto true, solo false si explícitamente deshabilitado
    });
  }, [clientesVisibles, estadosClientes]);

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Notificar cambios en clientes habilitados al componente padre
  const prevClientesHabilitadosRef = useRef<Cliente[]>([]);
  
  useEffect(() => {
    // Solo notificar si la lista realmente cambió
    const clientesActuales = clientesHabilitados;
    const clientesAnteriores = prevClientesHabilitadosRef.current;
    
    // Comparar si cambió el contenido de la lista
    const cambio = clientesActuales.length !== clientesAnteriores.length ||
      clientesActuales.some((cliente, index) => {
        return !clientesAnteriores[index] || 
               clientesAnteriores[index].id_cliente !== cliente.id_cliente;
      });
    
    if (cambio) {
      prevClientesHabilitadosRef.current = [...clientesActuales];
      onClientesSeleccionados(clientesActuales);
    }
  }, [clientesVisibles, estadosClientes]);

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
      // Limpiar estado individual
      const nuevosEstados = { ...estadosClientes };
      delete nuevosEstados[cliente.id_cliente];
      setEstadosClientes(nuevosEstados);
    } else {
      // Seleccionar cliente individual
      onClientesSeleccionados([...clientesSeleccionados, cliente]);
      // Habilitarlo por defecto
      setEstadosClientes(prev => ({
        ...prev,
        [cliente.id_cliente]: true
      }));
    }

    setBusqueda('');
    hideResultados();
    Keyboard.dismiss();
  };

  const toggleClienteIndividual = (clienteId: number) => {
    setEstadosClientes(prev => ({
      ...prev,
      [clienteId]: !prev[clienteId] // Alterna entre true/false, si no existe será true
    }));
  };

  const seleccionarTodosVisibles = () => {
    // Habilitar todos los clientes visibles
    const nuevosEstados = { ...estadosClientes };
    clientesVisibles.forEach(cliente => {
      nuevosEstados[cliente.id_cliente] = true;
    });
    setEstadosClientes(nuevosEstados);

    // Agregar clientes no seleccionados a la lista
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
    // Deshabilitar todos los clientes visibles
    const nuevosEstados = { ...estadosClientes };
    clientesVisibles.forEach(cliente => {
      nuevosEstados[cliente.id_cliente] = false;
    });
    setEstadosClientes(nuevosEstados);
  };

  const eliminarClienteSeleccionado = (clienteId: number) => {
    const nuevosSeleccionados = clientesSeleccionados.filter(
      c => c.id_cliente !== clienteId,
    );
    onClientesSeleccionados(nuevosSeleccionados);
    
    // Limpiar estado individual
    const nuevosEstados = { ...estadosClientes };
    delete nuevosEstados[clienteId];
    setEstadosClientes(nuevosEstados);
  };

  const estaSeleccionado = (clienteId: number) => {
    return clientesSeleccionados.some(c => c.id_cliente === clienteId);
  };

  const estaHabilitado = (clienteId: number) => {
    const estado = estadosClientes[clienteId];
    return estado !== false; // Por defecto true, solo false si explícitamente deshabilitado
  };

  const renderClienteBusqueda = ({item}: {item: Cliente}) => {
    // Construir información de identificación adicional
    const infoAdicional = [];
    if (item.cedula) infoAdicional.push(`Cédula: ${item.cedula}`);
    if (item.rnc) infoAdicional.push(`RNC: ${item.rnc}`);
    if (item.pasaporte) infoAdicional.push(`Pasaporte: ${item.pasaporte}`);
    if (item.telefono2) infoAdicional.push(`Tel2: ${item.telefono2}`);

    const seleccionado = estaSeleccionado(item.id_cliente);
    
    const handleCheckboxChange = () => {
      seleccionarClienteIndividual(item);
    };

    return (
      <View style={[styles.clienteBusquedaItem, seleccionado && styles.clienteItemSelected]}>
        <TouchableOpacity
          style={styles.clienteItemContent}
          onPress={handleCheckboxChange}
          activeOpacity={0.7}>
          <View style={styles.clienteAvatarContainer}>
            <View style={[styles.clienteAvatar, seleccionado && styles.clienteAvatarSelected]}>
              <Icon 
                name="person" 
                size={20} 
                color={seleccionado ? '#ffffff' : isDarkMode ? '#ffffff' : '#2196f3'} 
              />
            </View>
          </View>
          <View style={styles.clienteInfo}>
            <View style={styles.clienteHeader}>
              <Text style={[styles.clienteNombre, seleccionado && styles.clienteNombreSelected]}>
                {item.nombre_completo}
              </Text>
              <View style={[styles.clienteIdBadge, seleccionado && styles.clienteIdBadgeSelected]}>
                <Text style={[styles.clienteIdText, seleccionado && styles.clienteIdTextSelected]}>
                  #{item.id_cliente}
                </Text>
              </View>
            </View>
            <View style={styles.clienteContactInfo}>
              <Icon name="phone" size={14} color="#666" />
              <Text style={styles.clienteTelefono}>{item.telefono1}</Text>
              {item.direccion_ipv4 && (
                <>
                  <Icon name="public" size={14} color="#2196f3" style={{marginLeft: 8}} />
                  <Text style={styles.clienteIp}>{item.direccion_ipv4}</Text>
                </>
              )}
            </View>
            {infoAdicional.length > 0 && (
              <Text style={styles.clienteInfoAdicional}>
                {infoAdicional.join(' • ')}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={seleccionado}
            onValueChange={handleCheckboxChange}
            tintColors={{
              true: '#28a745',
              false: isDarkMode ? '#666666' : '#cccccc'
            }}
            boxType="square"
            onCheckColor="#ffffff"
            onFillColor="#28a745"
            onTintColor="#28a745"
            style={styles.checkbox}
          />
        </View>
      </View>
    );
  };

  const renderClienteSeleccionado = ({item}: {item: Cliente}) => {
    const esDeGrupo = !!filtroGrupo?.clientes?.some(
      (c: any) => c.id_cliente === item.id_cliente,
    );
    const habilitado = estaHabilitado(item.id_cliente);

    const handleToggleHabilitado = () => {
      toggleClienteIndividual(item.id_cliente);
    };

    const handleEliminar = () => {
      eliminarClienteSeleccionado(item.id_cliente);
    };

    return (
      <View style={[
        styles.clienteSeleccionadoItem, 
        styles.clienteItemSelected,
        !habilitado && styles.clienteItemDisabled
      ]}>
        <View style={styles.clienteItemContent}>
          <View style={styles.clienteAvatarContainer}>
            <View style={[
              styles.clienteAvatarSmall, 
              { 
                backgroundColor: esDeGrupo ? '#38BDF8' : '#10B981',
                opacity: habilitado ? 1 : 0.5
              }
            ]}>
              <Icon 
                name={esDeGrupo ? 'group' : 'person'} 
                size={16} 
                color="#ffffff" 
              />
            </View>
          </View>
          <View style={[styles.clienteSeleccionadoInfo, !habilitado && styles.infoDisabled]}>
            <View style={styles.clienteSeleccionadoHeader}>
              <Text style={[
                styles.clienteSeleccionadoNombre,
                !habilitado && styles.textDisabled
              ]}>
                {item.nombre_completo}
              </Text>
              <View
                style={[
                  styles.modernBadge,
                  { 
                    backgroundColor: esDeGrupo ? '#E0F2FE' : '#ECFDF5', 
                    borderColor: esDeGrupo ? '#38BDF8' : '#10B981',
                    opacity: habilitado ? 1 : 0.6
                  },
                ]}>
                <Icon 
                  name={esDeGrupo ? 'group' : 'person-add'} 
                  size={12} 
                  color={esDeGrupo ? '#0369A1' : '#047857'} 
                />
                <Text style={[styles.modernBadgeText, { color: esDeGrupo ? '#0369A1' : '#047857' }]}>
                  {esDeGrupo ? 'Grupo' : 'Manual'}
                </Text>
              </View>
            </View>
            <View style={styles.clienteContactInfo}>
              <Icon name="phone" size={12} color={habilitado ? "#666" : "#999"} />
              <Text style={[
                styles.clienteSeleccionadoTelefono,
                !habilitado && styles.textDisabled
              ]}>
                {item.telefono1}
              </Text>
              <Text style={[
                styles.clienteSeleccionadoId,
                !habilitado && styles.textDisabled
              ]}>
                #{item.id_cliente}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.clienteSeleccionadoActions}>
          <CheckBox
            value={habilitado}
            onValueChange={handleToggleHabilitado}
            tintColors={{
              true: esDeGrupo ? '#38BDF8' : '#28a745',
              false: isDarkMode ? '#666666' : '#cccccc'
            }}
            boxType="square"
            onCheckColor="#ffffff"
            onFillColor={habilitado ? (esDeGrupo ? '#38BDF8' : '#28a745') : (isDarkMode ? '#666666' : '#cccccc')}
            onTintColor={habilitado ? (esDeGrupo ? '#38BDF8' : '#28a745') : (isDarkMode ? '#666666' : '#cccccc')}
            style={styles.checkbox}
          />
          {!esDeGrupo && (
            <TouchableOpacity
              style={styles.modernEliminarButton}
              onPress={handleEliminar}
              activeOpacity={0.7}>
              <Icon name="close" size={16} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
            keyExtractor={(item, index) => `busqueda_${item.id_cliente}_${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
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
            keyExtractor={(item, index) => `visible_${item.id_cliente}_${index}`}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            style={styles.clientesVisiblesList}
          />
        </View>
      )}

      {/* Contador de seleccionados */}
      {clientesVisibles.length > 0 && (
        <View style={styles.contadorContainer}>
          <Icon name="people" size={20} color="#2196f3" />
          <Text style={styles.contadorText}>
            {clientesHabilitados.length} de {clientesVisibles.length} cliente
            {clientesVisibles.length !== 1 ? 's' : ''} habilitado
            {clientesHabilitados.length !== 1 ? 's' : ''} para envío
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
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1a1a1a',
      marginLeft: 12,
    },
    searchContainer: {
      marginBottom: 20,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
      borderRadius: 30,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderWidth: 2,
      borderColor: isDarkMode ? '#4a4a4a' : '#e8e9ea',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#333333',
      marginLeft: 12,
      marginRight: 8,
    },
    resultadosContainer: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      marginBottom: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDarkMode ? '#3a3a3a' : '#e8e9ea',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    // Nuevo estilo para búsqueda
    clienteBusquedaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      padding: 16,
      marginHorizontal: 8,
      marginVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#404040' : '#e8e9ea',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    clienteItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    clienteAvatarContainer: {
      marginRight: 12,
    },
    clienteAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDarkMode ? '#404040' : '#e3f2fd',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: isDarkMode ? '#505050' : '#bbdefb',
    },
    clienteAvatarSelected: {
      backgroundColor: '#2196f3',
      borderColor: '#1976d2',
    },
    clienteAvatarSmall: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    clienteInfo: {
      flex: 1,
    },
    clienteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    clienteNombre: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#ffffff' : '#1a1a1a',
      flex: 1,
      marginRight: 12,
    },
    clienteNombreSelected: {
      color: isDarkMode ? '#ffffff' : '#1976d2',
      fontWeight: '700',
    },
    clienteIdBadge: {
      backgroundColor: isDarkMode ? '#1a3a5a' : '#e3f2fd',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#2196f3' : '#bbdefb',
    },
    clienteIdBadgeSelected: {
      backgroundColor: '#1976d2',
      borderColor: '#0d47a1',
    },
    clienteIdText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#2196f3',
    },
    clienteIdTextSelected: {
      color: '#ffffff',
    },
    clienteContactInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    clienteTelefono: {
      fontSize: 14,
      color: isDarkMode ? '#b0b0b0' : '#666666',
      marginLeft: 6,
      fontWeight: '500',
    },
    clienteIp: {
      fontSize: 12,
      color: '#2196f3',
      marginLeft: 4,
      fontWeight: '600',
    },
    clienteInfoAdicional: {
      fontSize: 11,
      color: isDarkMode ? '#999999' : '#777777',
      fontStyle: 'italic',
      lineHeight: 16,
      marginTop: 4,
    },
    checkboxContainer: {
      marginLeft: 16,
      padding: 8,
      backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#4a4a4a' : '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
    },
    checkboxDisabled: {
      opacity: 0.6,
    },
    clienteItemDisabled: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      borderColor: isDarkMode ? '#333333' : '#d0d0d0',
      opacity: 0.7,
    },
    infoDisabled: {
      opacity: 0.6,
    },
    textDisabled: {
      color: isDarkMode ? '#666666' : '#999999',
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: '#888888',
      marginTop: 12,
      fontWeight: '500',
    },
    clientesVisiblesContainer: {
      backgroundColor: isDarkMode ? '#1a3a5a' : '#f0f8ff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: isDarkMode ? '#2196f3' : '#bbdefb',
      elevation: 2,
      shadowColor: '#2196f3',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    clientesVisiblesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    clientesVisiblesTitle: {
      fontSize: 18,
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
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    accionMasivaText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
      color: isDarkMode ? '#ffffff' : '#333333',
    },
    clientesVisiblesList: {
      flexGrow: 0,
    },
    clienteItemSelected: {
      backgroundColor: isDarkMode ? '#0f2a1f' : '#f0fff4',
      borderColor: '#10B981',
      borderWidth: 2,
      elevation: 3,
      shadowColor: '#10B981',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    clienteSeleccionadoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      padding: 12,
      marginBottom: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444444' : '#e0e0e0',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    clienteSeleccionadoInfo: {
      flex: 1,
    },
    clienteSeleccionadoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    clienteSeleccionadoNombre: {
      fontSize: 15,
      fontWeight: '600',
      color: isDarkMode ? '#ffffff' : '#1a1a1a',
      flex: 1,
      marginRight: 8,
    },
    clienteSeleccionadoTelefono: {
      fontSize: 12,
      color: isDarkMode ? '#b0b0b0' : '#666666',
      marginLeft: 4,
      fontWeight: '500',
    },
    clienteSeleccionadoId: {
      fontSize: 11,
      color: '#2196f3',
      marginLeft: 'auto',
      fontWeight: '600',
      backgroundColor: isDarkMode ? '#1a3a5a' : '#e3f2fd',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    clienteSeleccionadoActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    modernEliminarButton: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: isDarkMode ? '#4d1f1f' : '#ffebee',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? '#dc3545' : '#ffcdd2',
    },
    modernBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
    modernBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      marginLeft: 4,
    },
    contadorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? '#1a4d2e' : '#e8f5e8',
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#28a745',
      elevation: 2,
      shadowColor: '#28a745',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    contadorText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#28a745',
      marginLeft: 8,
    },
  });

export default ClienteSearchSelector;
