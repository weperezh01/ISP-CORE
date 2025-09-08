import React from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';

function SubTitulo(props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.tituloo}>{props.titulo}</Text>
      <View style={styles.linea} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection:'row',
    marginVertical:15,
    alignItems:'center'
  },
  tituloo: {
    fontSize:18,
    fontWeight:'bold',
    color:'gray'
  },
  linea: {
    borderBottomWidth:1,
    marginLeft:5,
    flex:1,
    marginTop:3,
    borderColor:'#eceff1'
  },
});

export default SubTitulo;
