import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    StyleSheet, 
    Pressable,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MenuModal from '../../componentes/MenuModal';
import HorizontalMenu from '../../componentes/HorizontalMenu';
import getStyles from './FacturacionesStyles';

// Modern progress bar component for time
const TimeProgressBar = ({ progress, styles }) => (
    <View style={styles.timeProgressContainer}>
        <Text style={styles.progressLabel}>Progreso del Ciclo</Text>
        <View style={styles.timeProgressBar}>
            <View style={[styles.timeProgressFill, { width: `${progress}%` }]}>
                <View style={styles.timeProgressBall}></View>
            </View>
        </View>
        <Text style={[styles.statLabel, { textAlign: 'right' }]}>{Math.round(progress)}%</Text>
    </View>
);

// Modern progress bar component for money
const MoneyProgressBar = ({ amountProgress, styles, collected, total, formatMoney }) => (
    <View style={styles.moneyProgressContainer}>
        <Text style={styles.progressLabel}>Ingresos Cobrados</Text>
        <View style={styles.moneyProgressBar}>
            <View style={[styles.moneyProgressFill, { width: `${amountProgress}%` }]}></View>
        </View>
        <View style={styles.moneyRow}>
            <Text style={styles.moneyLabel}>Cobrado:</Text>
            <Text style={styles.moneyValue}>{formatMoney(collected)}</Text>
        </View>
        <View style={styles.moneyRow}>
            <Text style={styles.moneyLabel}>Total:</Text>
            <Text style={styles.moneyTotal}>{formatMoney(total)}</Text>
        </View>
    </View>
);

// Filter component
const FilterChips = ({ activeFilter, onFilterChange, cycles, styles }) => {
    const filterOptions = [
        { 
            key: 'todos', 
            label: 'Todos', 
            icon: 'view-list',
            count: cycles.length 
        },
        { 
            key: 'actuales', 
            label: 'Actuales', 
            icon: 'schedule',
            count: cycles.filter(ciclo => {
                const currentDate = new Date();
                const start = new Date(ciclo.inicio);
                const end = new Date(ciclo.final);
                return currentDate >= start && currentDate <= end;
            }).length
        },
        { 
            key: 'vencidos', 
            label: 'Vencidos', 
            icon: 'error',
            count: cycles.filter(ciclo => {
                const currentDate = new Date();
                const end = new Date(ciclo.final);
                return currentDate > end;
            }).length
        },
        { 
            key: 'proximos_vencer', 
            label: 'Por Vencer', 
            icon: 'warning',
            count: cycles.filter(ciclo => {
                const currentDate = new Date();
                const start = new Date(ciclo.inicio);
                const end = new Date(ciclo.final);
                const daysDifference = Math.floor((end - currentDate) / (1000 * 60 * 60 * 24));
                return currentDate >= start && currentDate <= end && daysDifference <= 7;
            }).length
        },
        { 
            key: 'futuros', 
            label: 'Futuros', 
            icon: 'event',
            count: cycles.filter(ciclo => {
                const currentDate = new Date();
                const start = new Date(ciclo.inicio);
                return currentDate < start;
            }).length
        }
    ];

    return (
        <View style={styles.filterContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollView}
            >
                {filterOptions.map((option) => (
                    <TouchableOpacity
                        key={option.key}
                        style={[
                            styles.filterChip,
                            activeFilter === option.key && styles.filterChipActive
                        ]}
                        onPress={() => onFilterChange(option.key)}
                    >
                        <Text style={[
                            styles.filterChipText,
                            activeFilter === option.key && styles.filterChipTextActive
                        ]}>
                            {option.label}
                        </Text>
                        {option.count > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>
                                    {option.count}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const FacturacionesScreen = () => {
  // Theme and styles
  const { isDarkMode, toggleTheme } = useTheme();
  const styles = getStyles(isDarkMode);
  const navigation = useNavigation();

  // States
  const [ciclos, setCiclos] = useState([]);
  const [filteredCiclos, setFilteredCiclos] = useState([]);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [usuarioId, setUsuarioId] = useState(null);
  const [ispId, setIspId] = useState('');
  const [facturacionPermiso, setFacturacionPermiso] = useState('basica');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuBotones, setMenuBotones] = useState([]);
  const [loading, setLoading] = useState(true);


  // Cargar el ispId
  useEffect(() => {
    const obtenerIspId = async () => {
      try {
        const id = await AsyncStorage.getItem('@selectedIspId');
        setIspId(id || 'No ID');
      } catch (error) {
        console.error('Error al recuperar el ID del ISP', error);
      }
    };
    obtenerIspId();
  }, []);

  // Cargar datos usuario
  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@loginData');
        const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (userData) {
          setNombreUsuario(userData.nombre);
          setUsuarioId(userData.id);
        }
      } catch (e) {
        console.error('Error al leer el nombre del usuario', e);
      }
    };
    obtenerDatosUsuario();
  }, []);

  // Registrar navegación
  useEffect(() => {
    const registrarNavegacion = async () => {
      if (!usuarioId) {
        console.error('No se puede registrar la navegación sin un id_usuario válido.');
        return;
      }

      try {
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // Formato HH:mm:ss

        const logData = {
          id_usuario: usuarioId,
          fecha,
          hora,
          pantalla: 'FacturacionesScreen',
          datos: JSON.stringify({ modo: isDarkMode ? 'Oscuro' : 'Claro' }),
        };

        const response = await axios.post(
          'https://wellnet-rd.com:444/api/log-navegacion-registrar',
          logData
        );

        if (response.status !== 201) {
          throw new Error(response.data.message || 'Error al registrar la navegación');
        }

        console.log('Navegación registrada exitosamente');
      } catch (error) {
        console.error('Error al registrar la navegación:', error);
      }
    };

    if (usuarioId) {
      registrarNavegacion();
    }
  }, [usuarioId, isDarkMode]);


  // Cargar ciclos
  const cargarCiclos = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://wellnet-rd.com:444/api/ciclos-incompleto', {
        id_isp: ispId,
      });
      console.log(
        'Respuesta de /api/ciclos-incompleto:',
        JSON.stringify(response.data, null, 2)
      );
      setCiclos(response.data);
      applyFilter('todos', response.data); // Apply default filter
    } catch (error) {
      console.error('Error al realizar la petición:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter cycles based on their date status
  const applyFilter = (filterType, data = ciclos) => {
    const currentDate = new Date();
    let filtered = [...data];

    switch (filterType) {
      case 'actuales':
        filtered = data.filter(ciclo => {
          const start = new Date(ciclo.inicio);
          const end = new Date(ciclo.final);
          return currentDate >= start && currentDate <= end;
        });
        break;
      case 'pasados':
        filtered = data.filter(ciclo => {
          const end = new Date(ciclo.final);
          return currentDate > end;
        });
        break;
      case 'futuros':
        filtered = data.filter(ciclo => {
          const start = new Date(ciclo.inicio);
          return currentDate < start;
        });
        break;
      case 'vencidos':
        filtered = data.filter(ciclo => {
          const end = new Date(ciclo.final);
          const daysDifference = Math.floor((currentDate - end) / (1000 * 60 * 60 * 24));
          return currentDate > end && daysDifference > 0;
        });
        break;
      case 'proximos_vencer':
        filtered = data.filter(ciclo => {
          const start = new Date(ciclo.inicio);
          const end = new Date(ciclo.final);
          const daysDifference = Math.floor((end - currentDate) / (1000 * 60 * 60 * 24));
          return currentDate >= start && currentDate <= end && daysDifference <= 7;
        });
        break;
      case 'todos':
      default:
        filtered = data;
        break;
    }

    setFilteredCiclos(filtered);
    setActiveFilter(filterType);
  };

  // Obtener permisos y construir menú
  const obtenerPermisos = async () => {
    try {
      const response = await axios.post(
        'https://wellnet-rd.com:444/api/usuarios/obtener-permisos-usuario',
        { id_usuario: usuarioId }
      );

      console.log(
        'Respuesta de /api/usuarios/obtener-permisos-usuario:',
        JSON.stringify(response.data, null, 2)
      );

      const { usuario, permisos } = response.data;
      const esSuperAdministrador = usuario[0]?.super_administrador === 'Y';
      const esAdministrador = usuario[0]?.administrador === 'Y';

      // Botones base (siempre visibles)
      const botonesBase = [
        { id: '4', title: 'Menú', action: () => setMenuVisible(true), icon: 'menu' },
        {
          id: '10',
          title: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
          icon: isDarkMode ? 'light-mode' : 'dark-mode',
          action: toggleTheme,
        },
      ];

      if (esSuperAdministrador || esAdministrador) {
        console.log('Usuario con acceso total (super_administrador o administrador)');
        setFacturacionPermiso('avanzada');

        setMenuBotones([
          ...botonesBase,
          { id: '1', title: 'Base de ciclos', screen: 'BaseCicloScreen', icon: 'event' },
          {
            id: '2',
            title: 'Revisiones',
            screen: 'FacturasEnRevisionScreen',
            params: { id_isp: ispId, estado: 'en_revision' },
            icon: 'rate-review',
          },
          { id: '3', title: 'Ingresos', screen: 'IngresosScreen', icon: 'trending-up', params: { ispId } },
        ]);
      } else {
        const botonesFiltrados = [...botonesBase];

        // Base de ciclos
        if (
          permisos.some(
            (permiso) =>
              permiso.id_permiso === 1 &&
              permiso.id_permiso_sub === 1 &&
              permiso.estado_permiso === 'Y'
          )
        ) {
          botonesFiltrados.push({
            id: '1',
            title: 'Base de ciclos',
            screen: 'BaseCicloScreen',
          });
        }

        // Revisiones
        if (
          permisos.some(
            (permiso) =>
              permiso.id_permiso === 1 &&
              permiso.id_permiso_sub === 2 &&
              permiso.estado_permiso === 'Y'
          )
        ) {
          botonesFiltrados.push({
            id: '2',
            title: 'Revisiones',
            screen: 'FacturasEnRevisionScreen',
            params: { id_isp: ispId, estado: 'en_revision' },
          });
        }

        // Ingresos
        if (
          permisos.some(
            (permiso) =>
              permiso.id_permiso === 1 &&
              permiso.id_permiso_sub === 3 &&
              permiso.estado_permiso === 'Y'
          )
        ) {
          botonesFiltrados.push({
            id: '3',
            title: 'Ingresos',
            screen: 'IngresosScreen',
            icon: 'trending-up',
          });
        }

        setMenuBotones(botonesFiltrados);

        const permisoAvanzado = permisos.find(
          (permiso) =>
            permiso.id_permiso === 1 &&
            permiso.id_permiso_sub === 0 &&
            permiso.Vista === 'Avanzada' &&
            permiso.estado_permiso === 'Y'
        );

        if (permisoAvanzado) {
          console.log('Usuario con permiso avanzado');
          setFacturacionPermiso('avanzada');
        } else {
          console.log('Usuario con permiso básico');
          setFacturacionPermiso('basica');
        }
      }
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
    }
  };

  // Efecto para cargar ciclos y permisos cuando tengamos ispId y usuarioId
  useEffect(() => {
    if (ispId && usuarioId) {
      cargarCiclos();
      obtenerPermisos();
    }
  }, [ispId, usuarioId]);

  // Funciones de formateo
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha inválida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Santo_Domingo',
    });
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Determine cycle status and styling
  const getCycleStatus = (startDate, endDate) => {
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDifference = Math.floor((currentDate - end) / (1000 * 60 * 60 * 24));

    if (currentDate >= start && currentDate <= end) {
      return {
        status: 'En Tiempo',
        style: styles.inTimeBackground,
        statusStyle: styles.statusInTime,
        icon: 'check-circle'
      };
    } else if (currentDate > end && daysDifference <= 10) {
      return {
        status: 'Próximo a Vencer',
        style: styles.nearDueBackground,
        statusStyle: styles.statusNearDue,
        icon: 'warning'
      };
    } else if (currentDate > end && daysDifference > 10) {
      return {
        status: 'Vencido',
        style: styles.overDueBackground,
        statusStyle: styles.statusOverDue,
        icon: 'error'
      };
    } else {
      return {
        status: 'Pendiente',
        style: styles.defaultBackground,
        statusStyle: styles.statusDefault,
        icon: 'schedule'
      };
    }
  };

  // Modern cycle item component
  const CycleItem = ({ item }) => {
    const [pressed, setPressed] = useState(false);
    
    const cycleStatus = getCycleStatus(item.inicio, item.final);
    const totalDays = (new Date(item.final) - new Date(item.inicio)) / (1000 * 60 * 60 * 24);
    const currentDay = (new Date() - new Date(item.inicio)) / (1000 * 60 * 60 * 24);
    const timeProgress = Math.min(Math.max((currentDay / totalDays) * 100, 0), 100);

    const amountProgress = Math.min(
      Math.max((item.dinero_cobrado / item.total_dinero) * 100, 0),
      100
    );

    const outstandingAmount = item.total_dinero - item.dinero_cobrado;

    const handlePress = () => {
      navigation.navigate('DetalleCicloScreen', { ciclo: item });
    };

    return (
      <Pressable
        style={[
          styles.cycleCard,
          cycleStatus.style,
          pressed && styles.cycleCardPressed
        ]}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={handlePress}
      >
        {/* Card Header */}
        <View style={styles.cycleHeader}>
          <View style={styles.cycleIconContainer}>
            <Icon name={cycleStatus.icon} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cycleHeaderContent}>
            <Text style={styles.cycleName}>Ciclo de Facturación</Text>
            <Text style={styles.cycleDates}>
              {formatDate(item.inicio)} - {formatDate(item.final)}
            </Text>
            <Text style={[styles.cycleStatus, cycleStatus.statusStyle]}>
              {cycleStatus.status}
            </Text>
          </View>
        </View>

        {facturacionPermiso === 'avanzada' && (
          <>
            {/* Time Progress */}
            <TimeProgressBar 
              progress={timeProgress} 
              styles={styles} 
            />

            {/* Money Progress */}
            <MoneyProgressBar 
              amountProgress={amountProgress} 
              styles={styles}
              collected={item.dinero_cobrado}
              total={item.total_dinero}
              formatMoney={formatMoney}
            />

            {/* Outstanding Amount */}
            {outstandingAmount > 0 && (
              <View style={styles.outstandingAmount}>
                <Text style={styles.outstandingLabel}>Faltante por Cobrar</Text>
                <Text style={styles.outstandingValue}>
                  {formatMoney(outstandingAmount)}
                </Text>
              </View>
            )}

            {/* Invoice Statistics */}
            <View style={styles.invoiceStats}>
              <View style={styles.invoiceStatItem}>
                <Text style={styles.invoiceStatNumber}>
                  {item.total_facturas - item.facturas_pendiente}
                </Text>
                <Text style={styles.invoiceStatLabel}>Cobradas</Text>
              </View>
              <View style={styles.invoiceStatItem}>
                <Text style={styles.invoiceStatNumber}>
                  {item.facturas_pendiente}
                </Text>
                <Text style={styles.invoiceStatLabel}>Pendientes</Text>
              </View>
              <View style={styles.invoiceStatItem}>
                <Text style={styles.invoiceStatNumber}>
                  {item.total_facturas}
                </Text>
                <Text style={styles.invoiceStatLabel}>Total</Text>
              </View>
            </View>
          </>
        )}
      </Pressable>
    );
  };

  const renderItem = ({ item }) => <CycleItem item={item} />;

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Facturaciones</Text>
            <Text style={styles.headerSubtitle}>Gestión de ciclos de facturación</Text>
          </View>
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
          <Text style={[styles.itemDetails, { marginTop: 16, textAlign: 'center' }]}>
            Cargando ciclos de facturación...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Facturaciones</Text>
          <Text style={styles.headerSubtitle}>Gestión de ciclos de facturación</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <FilterChips 
        activeFilter={activeFilter}
        onFilterChange={applyFilter}
        cycles={ciclos}
        styles={styles}
      />

      {/* Content */}
      <View style={styles.contentContainer}>
        <FlatList
          data={filteredCiclos}
          keyExtractor={(item) => item.id_ciclo.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="event-note" size={64} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              <Text style={styles.emptyMessage}>
                {activeFilter === 'todos' 
                  ? 'No hay ciclos de facturación disponibles'
                  : `No hay ciclos ${activeFilter === 'actuales' ? 'actuales' : 
                                    activeFilter === 'vencidos' ? 'vencidos' :
                                    activeFilter === 'futuros' ? 'futuros' :
                                    activeFilter === 'proximos_vencer' ? 'próximos a vencer' : 'encontrados'}`
                }
              </Text>
            </View>
          }
        />
      </View>

      {/* Menú Horizontal */}
      <HorizontalMenu botones={menuBotones} navigation={navigation} isDarkMode={isDarkMode} />

      {/* Modal del Menú Lateral (o hamburguesa) */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        menuItems={[
          { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
          { title: 'Perfil', action: () => navigation.navigate('ProfileScreen') },
          { title: 'Configuración', action: () => navigation.navigate('SettingsScreen') },
          { title: 'Cerrar Sesión', action: () => console.log('Cerrando sesión') },
        ]}
        isDarkMode={isDarkMode}
        onItemPress={(item) => {
          item.action();
          setMenuVisible(false);
        }}
      />
    </View>
  );
};

export default FacturacionesScreen;
