import React from 'react';
import {View, Text, Switch, StyleSheet} from 'react-native';

function aSwitch(props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>ON</Text>
      <Switch
        style={styles.switch}
        value={props.value}
        onValueChange={props.onValueChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingVertical: 15,
    flexDirection: 'row',
  },
  texto: {
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
  },
  switch: {
    width: 50,
  },
});

export default aSwitch;
