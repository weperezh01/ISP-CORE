import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BleManager from 'react-native-ble-manager';
import ThermalPrinterModule from 'react-native-thermal-printer';

const BluetoothDevicesScreen = () => {
  const [listaDispositivos, setListaDispositivos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const theme = await AsyncStorage.getItem('@theme');
        const isDark = theme === 'dark';
        setIsDarkMode(isDark);
      } catch (error) {
        console.error('Error al cargar el tema', error);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    BleManager.start({ showAlert: false }).then(() => {
      console.log('Bluetooth Manager inicializado');
    });
    cargarDispositivoGuardado();
  }, []);

  const cargarDispositivoGuardado = async () => {
    try {
      const dispositivoGuardado = await AsyncStorage.getItem('@selected_printer');
      if (dispositivoGuardado !== null) {
        const dispositivo = JSON.parse(dispositivoGuardado);
        setDispositivoSeleccionado(dispositivo);
      }
    } catch (error) {
      console.error('Error al cargar el dispositivo guardado:', error);
    }
  };

  const listarDispositivosBluetooth = async () => {
    try {
      const dispositivos = await ThermalPrinterModule.getBluetoothDeviceList();
      if (dispositivos && dispositivos.length > 0) {
        setListaDispositivos(dispositivos);
        setModalVisible(true);
      } else {
        Alert.alert('No se encontraron dispositivos Bluetooth disponibles.');
      }
    } catch (error) {
      console.error('Error al listar dispositivos Bluetooth:', error);
      Alert.alert('Error al obtener dispositivos Bluetooth.');
    }
  };

  const seleccionarDispositivo = async (dispositivo) => {
    try {
      await AsyncStorage.setItem('@selected_printer', JSON.stringify(dispositivo));
      setDispositivoSeleccionado(dispositivo);
      setModalVisible(false);
    } catch (error) {
      console.error('Error al guardar el dispositivo seleccionado:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
        Dispositivos Bluetooth
      </Text>

      {dispositivoSeleccionado ? (
        <View style={styles.card }>
          <Text style={[styles.deviceName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {dispositivoSeleccionado.deviceName || 'Sin nombre'}
          </Text>
          <Text style={[styles.deviceMac, { color: isDarkMode ? '#AAAAAA' : '#555555' }]}>
            Dirección MAC: {dispositivoSeleccionado.macAddress}
          </Text>
        </View>
      ) : (
        <Text style={[styles.noDeviceText, { color: isDarkMode ? '#FFFFFF' : '#AAAAAA' }]}>
          No hay impresora seleccionada.
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={listarDispositivosBluetooth}>
        <Text style={styles.buttonText}>Listar Dispositivos</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Seleccionar Impresora
            </Text>
            <FlatList
              data={listaDispositivos}
              keyExtractor={(item) => item.macAddress}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.deviceItem} onPress={() => seleccionarDispositivo(item)}>
                  <Text style={[styles.deviceName, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {item.deviceName || 'Sin nombre'}
                  </Text>
                  <Text style={[styles.deviceMac, { color: isDarkMode ? '#AAAAAA' : '#555555' }]}>
                    {item.macAddress}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: isDarkMode ? '#444444' : '#DDDDDD' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deviceMac: {
    fontSize: 16,
  },
  noDeviceText: {
    fontSize: 16,
    textAlign: 'center',
  },
  
  button: {
    backgroundColor: '#4e9f3d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 18,
  },
});

export default BluetoothDevicesScreen;
