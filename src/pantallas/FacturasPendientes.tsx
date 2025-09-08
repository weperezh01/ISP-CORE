import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../ThemeContext';
import ThemeSwitch from '../componentes/themeSwitch';
import { getStyles } from '../estilos/styles';
import axios from 'axios';

const FacturasPendientesScreen = () => {
  const { id_ciclo } = useRoute().params;
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme();
  const styles = getStyles(isDarkMode);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [facturas, setFacturas] = useState([]);
  const [facturasFiltradas, setFacturasFiltradas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [ispId, setIspId] = useState(null);

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@loginData');
        if (jsonValue) {
          const userData = JSON.parse(jsonValue);
          setNombreUsuario(userData.nombre);
        }
      } catch (e) {
        console.error('Error al leer el nombre del usuario', e);
      }
    };

    const obtenerIspId = async () => {
      try {
        const id = await AsyncStorage.getItem('ispId');
        if (id) {
          setIspId(id);
        }
      } catch (error) {
        console.error('Error al recuperar el ID del ISP', error);
      }
    };

    obtenerDatosUsuario();
    obtenerIspId();
  }, []);

  useEffect(() => {
    if (ispId) {
      cargarFacturasPendientes();
    }
  }, [ispId]);

  const cargarFacturasPendientes = async () => {
    try {
      const response = await axios.post('https://wellnet-rd.com:444/api/ciclo-factura-pendiente', {
        id_ciclo: id_ciclo,
        estado: ['pendiente', 'vencida'], // Modificado para solicitar ambos tipos de estados
        id_isp: ispId,
      });
      setFacturas(response.data);
      setFacturasFiltradas(response.data);
    } catch (error) {
      console.error('Error al cargar facturas pendientes y vencidas:', error);
    }
  };

  const filtrarFacturas = texto => {
    setFiltro(texto);
    const textoBusqueda = texto.toLowerCase().trim();
    const filtradas = facturas.filter(factura => {
      console.log('Factura:', factura);
      const idFactura = factura.factura.id_factura ? factura.factura.id_factura.toString().toLowerCase() : '';
      const idCliente = factura.cliente.id_cliente ? factura.cliente.id_cliente.toString().toLowerCase() : '';
      const montoTotal = factura.factura.monto_total ? factura.factura.monto_total.toString().toLowerCase() : '';
      const estado = factura.factura.estado ? factura.factura.estado.toLowerCase() : '';
      const nombresCliente = factura.cliente.nombres ? factura.cliente.nombres.toLowerCase() : '';
      const apellidosCliente = factura.cliente.apellidos ? factura.cliente.apellidos.toLowerCase() : '';

      return idFactura.includes(textoBusqueda) ||
        idCliente.includes(textoBusqueda) ||
        montoTotal.includes(textoBusqueda) ||
        estado.includes(textoBusqueda) ||
        nombresCliente.includes(textoBusqueda) ||
        apellidosCliente.includes(textoBusqueda);
    });

    console.log('Facturas filtradas:', filtradas);
    setFacturasFiltradas(filtradas);
  };
    
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('ClienteFacturasScreen', { clientId: item.cliente.id_cliente })}
    >
      {/* Detalles de la Factura */}
      <Text style={styles.itemText}>Cliente ID: {item.cliente.id_cliente}</Text>
      <Text style={styles.itemText}>Factura ID: {item.factura.id_factura}</Text>
      <Text style={styles.itemText}>Monto Total: ${item.factura.monto_total}</Text>
      
      {/* Detalles del Cliente */}
      <Text style={styles.itemText}>Cliente: {item.cliente.nombres} {item.cliente.apellidos}</Text>
      <Text style={styles.itemText}>Teléfono: {item.cliente.telefono1}</Text>
      <Text style={styles.itemText}>Dirección: {item.cliente.direccion}</Text>
  
      {/* Detalles del Tipo de Servicio */}
      <Text style={styles.itemText}>Servicio: {item.tipoServicio.nombre_servicio}</Text>
      <Text style={styles.itemText}>Velocidad: {item.tipoServicio.velocidad_servicio} Mbps</Text>
    </TouchableOpacity>
  );
  

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <Text> Facturas pendientes</Text> */}
      <View style={styles.containerSuperior}>
        <Text style={styles.text}>{nombreUsuario || 'Usuario'}</Text>
        <ThemeSwitch onValueChange={toggleTheme} value={isDarkMode} />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Facturas Pendientes</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar factura..."
          value={filtro}
          onChangeText={filtrarFacturas}
        />
        <FlatList
          data={facturasFiltradas}
          keyExtractor={item => item.factura.id_factura.toString()}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
}

export default FacturasPendientesScreen;
