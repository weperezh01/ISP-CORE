import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../ThemeContext';
import ThemeSwitch from '../../componentes/themeSwitch';
import getStyles from './MainScreenStyles';

import MenuModal from '../../componentes/MenuModal'; // Ajusta la ruta según la ubicación del archivo
import HorizontalMenu from '../../componentes/HorizontalMenu'; // Ajusta la ruta según la ubicación del archivo

const MainScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const styles = getStyles(isDarkMode);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [usuarioId, setUsuarioId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const obtenerNombreUsuario = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@loginData');
        const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (userData && userData.nombre) {
          setNombreUsuario(userData.nombre);
          setUsuarioId(userData.id);  // Almacena el ID del usuario
          setUserRole(userData.nivel_usuario || ''); // Almacena el rol del usuario
        }
      } catch (e) {
        console.error('Error al leer el nombre del usuario', e);
      }
    };

    obtenerNombreUsuario();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <ThemeSwitch />
          <Text style={styles.headerRightText}>{nombreUsuario}</Text>
        </View>
      ),
    });
  }, [nombreUsuario, navigation, isDarkMode, toggleTheme]);

  useEffect(() => {
    const registrarNavegacion = async () => {
      if (!usuarioId) return;

      try {
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // Formato HH:mm:ss

        const logData = {
          id_usuario: usuarioId,
          fecha,
          hora,
          pantalla: 'MainScreen',
          datos: JSON.stringify({ isDarkMode }),  // Puedes agregar más datos si lo deseas
        };

        const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logData),
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || 'Error al registrar la navegación');
        }
        console.log('Navegación registrada exitosamente');
      } catch (error) {
        console.error('Error al registrar la navegación:', error);
      }
    };

    registrarNavegacion();
  }, [usuarioId]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@loginData');
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
      Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  // Botones del menú horizontal
  const botones = [
    // { id: '5', screen: 'BusquedaScreen', icon: 'search' }, // Botón de búsqueda
    { id: '4', action: () => setMenuVisible(true), icon: 'bars' },
    { id: '1', icon: 'plus', action: () => openAddModal() }, // Botón para abrir el modal de agregar
    // { id: '3', Usuarios: 'Base de ciclos', screen: 'BaseCicloScreen' },
    // { id: '2', title: 'Revisiones', screen: 'FacturasEnRevisionScreen', params: { id_isp: ispId, estado: 'en_revision' } },
    // { id: '3', title: 'Ingresos', screen: 'IngresosScreen', icon: 'dollar' }, // Ejemplo de otro icono
    // icon: 'people-circle'
    // icon: 'people'
    {
      id: '8',
      icon: 'user',
      screen: 'UserProfileScreen',
      title: 'Perfil de Usuario'
    }, // Botón de usuario
    {
      id: '2',
      icon: 'group',
      screen: 'AdminUsersScreen', // Nombre de la pantalla registrada
      title: 'Usuarios Administradores',
    },
    // {
    //   id: '9',
    //   icon: 'group',
    //   screen: 'UserProfileScreen',
    //   title: 'Usuarios Administradores'
    // }, // Botón de usuario
    {
      id: '7',
      screen: null, // Dejarlo en null si solo realiza una acción
      icon: isDarkMode ? 'sun-o' : 'moon-o', // Cambiar entre 'sun-o' y 'moon-o' basado en isDarkMode
      action: () => {
        toggleTheme(); // Lógica para cambiar el modo oscuro (debes tener esta función definida)
      },
    },
  ];

  return (
    <>
      {/* <View style={styles.containerSuperior}>
        <TouchableOpacity style={styles.userButton} onPress={() => { }}>
          <Text style={styles.userButtonText}>{nombreUsuario || 'Usuario'}</Text>
        </TouchableOpacity>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTheme}
          value={isDarkMode}
        />
      </View> */}
      <View style={styles.container}>
        <Text style={styles.title}>Pantalla Principal</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('IspListScreen')}>
          <Text style={styles.buttonText}>I. S. P. s</Text>
        </TouchableOpacity>
        {userRole === 'MEGA ADMINISTRADOR' && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('PlanManagementScreen')}
          >
            <Text style={styles.buttonText}>Gestión de Planes de Suscripción</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('ServiciosAdicionalesScreen')}
        >
          <Text style={styles.buttonText}>Servicios Adicionales</Text>
        </TouchableOpacity>
        {userRole === 'MEGA ADMINISTRADOR' && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('ContabilidadPlanManagementScreen')}
          >
            <Text style={styles.buttonText}>Gestión de Planes de Contabilidad</Text>
          </TouchableOpacity>
        )}
        {(userRole === 'MEGA ADMINISTRADOR' || userRole === 'SUPER ADMINISTRADOR') && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('ContabilidadSuscripcionScreen')}
          >
            <Text style={styles.buttonText}>Suscripción de Contabilidad</Text>
          </TouchableOpacity>
        )}
        {(userRole === 'MEGA ADMINISTRADOR' || userRole === 'SUPER ADMINISTRADOR') && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('CompanySettingsScreen')}
          >
            <Text style={styles.buttonText}>Configuración de Empresa</Text>
          </TouchableOpacity>
        )}
        
        {/* Botones de sistema de pagos para MEGA ADMINISTRADOR */}
        {userRole === 'MEGA ADMINISTRADOR' && (
          <>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('DashboardPagosSimple')}
            >
              <Text style={styles.buttonText}>📊 Dashboard de Pagos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('HistorialTransaccionesSimple')}
            >
              <Text style={styles.buttonText}>📋 Historial de Transacciones</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>


      {/* Menú Horizontal Reutilizable */}
      <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />


      {/* Modal del Menú */}
      <MenuModal
        visible={menuVisible}
        onClose={() => {
          setMenuVisible(false);
          // Refrescar el estado del tema cuando se cierra el modal
          const refreshTheme = async () => {
            try {
              const theme = await AsyncStorage.getItem('@theme');
              setIsDarkMode(theme === 'dark');
            } catch (error) {
              console.error('Error al cargar el tema', error);
            }
          };
          refreshTheme();
        }}
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
    </>
  );
};

export default MainScreen;
