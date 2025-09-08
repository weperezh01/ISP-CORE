import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

function DevicesBluetoothListScreen(props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{props.titulo}</Text>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: '#f5fcff',
  },
  titulo: {
    marginLeft:10,
    fontSize: 40,
    fontWeight: 'bold',
  },
});

export default DevicesBluetoothListScreen;
