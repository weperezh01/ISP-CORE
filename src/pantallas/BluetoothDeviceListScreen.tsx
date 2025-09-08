import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useColorScheme} from 'react-native';

const BluetoothDeviceListScreen = () => {
  const [pairedDevices, setPairedDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const scheme = useColorScheme(); // 'light' o 'dark'

  useEffect(() => {
    BleManager.start({ showAlert: false });
    
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT)
        .then((result) => {
          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            BleManager.getBondedPeripherals([]).then((bondedPeripheralsArray) => {
              console.log('Dispositivos emparejados:', bondedPeripheralsArray); // Mostrar dispositivos emparejados en la consola
              setPairedDevices(bondedPeripheralsArray);
            });
          }
        });
    } else {
      BleManager.getBondedPeripherals([]).then((bondedPeripheralsArray) => {
        console.log('Dispositivos emparejados:', bondedPeripheralsArray); // Mostrar dispositivos emparejados en la consola
        setPairedDevices(bondedPeripheralsArray);
      });
    }
    
  }, []);

  const saveSelectedDevice = async (device) => {
    try {
      const jsonValue = JSON.stringify(device);
      await AsyncStorage.setItem('@selected_printer', jsonValue);
      console.log('Dispositivo guardado', device);
      setSelectedDeviceId(device.id); // Guardar el ID del dispositivo seleccionado
    } catch (e) {
      console.log('Error al guardar el dispositivo', e);
    }
  };

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.deviceContainer,
        scheme === 'dark' ? styles.darkMode : styles.lightMode,
        item.id === selectedDeviceId && styles.deviceSelected // Aplicar estilo adicional si el dispositivo está seleccionado
      ]}
      onPress={() => saveSelectedDevice(item)}
    >
      <Text style={[styles.deviceName, scheme === 'dark' ? styles.textDark : styles.textLight]}>
        {item.name || 'Unknown Device'}
      </Text>
      <Text style={[styles.deviceId, scheme === 'dark' ? styles.textDark : styles.textLight]}>
        {item.id}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, scheme === 'dark' ? styles.darkMode : styles.lightMode]}>
      <FlatList
        data={pairedDevices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 45,
  },
  deviceContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 14,
  },
  darkMode: {
    backgroundColor: '#333',
    borderBottomColor: '#FFF',
  },
  lightMode: {
    backgroundColor: '#FFF',
    borderBottomColor: '#333',
  },
  textDark: {
    color: '#FFF',
  },
  textLight: {
    color: '#000',
  },
  deviceSelected: {
    backgroundColor: '#4CAF50', // Cambia el color de fondo para indicar que está seleccionado
    borderColor: '#388E3C', // Opcionalmente, cambia el borde
    borderWidth: 2,
  },
});

export default BluetoothDeviceListScreen;
