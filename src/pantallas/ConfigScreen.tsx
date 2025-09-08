import React, { useCallback } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';

// Asegúrate de definir tu componente funcional aquí
const ConfigScreen = ({ navigation }) => {
  // Definición de handleLogout dentro del componente funcional
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{name: 'LoginScreen'}],
            });
          },
        },
      ],
    );
  }, [navigation]);

  // Definición de navigateToSettings dentro del componente funcional
  const navigateToDevicesBluetooth = useCallback(() => {
    navigation.navigate('BluetoothDeviceListScreen');
  }, [navigation]);

  // Correcto uso de return para renderizar la UI del componente
  return (
    <View style={styles.container}>
      <View>
        {/* Botón de Configuraciones */}
        <Button
          title="Dispositivos Bluetooth"
          onPress={navigateToDevicesBluetooth}
        />
      </View>
    </View>
  );
};

// Estilos definidos fuera del componente funcional
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default ConfigScreen;
