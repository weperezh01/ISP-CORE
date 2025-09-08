import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

function Dispositivo(props) {
  return (
    <>
      <TouchableOpacity style={styles.envuelto} onPress={props.onPress}>
        <View style={styles.envueltoNombre}>
          <Text style={styles.nombre}>{props.name}</Text>
        </View>
      </TouchableOpacity>
    </>
  );
}


const styles = StyleSheet.create({
  envuelto: {},
  envueltoNombre: {},
  nombre: {},
  linea: {
    borderBottomWidth: 1,
    marginLeft: 5,
    flex: 1,
    marginTop: 3,
    borderColor: '#eceff1',
  },
});

export default Dispositivo;
