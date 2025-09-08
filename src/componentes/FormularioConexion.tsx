import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';

const FormularioConexion = () => {
  const [conexion, setConexion] = useState({
    // id_cliente: clientId, // Defaulting to passed clientId
    direccion: '',
    referencia: '',
    // velocidad: '',
    tipo_conexion: '',
    precio: '',
    // direccion_ipv4: '',
    // direccion_ipv6: '',
    // nombre_router: '',
    // estado: '',
    // usuario_creacion: userId, // Defaulting to passed userId
    // instalador: '',
    // situacion: '',
    // fecha_instalacion: '',
    // dia_ciclo_facturacion: ''
  });

  const handleChange = (name, value) => {
    setConexion(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = () => {
    console.log(conexion);
    // Aquí agregarías la lógica para enviar los datos al backend
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        {Object.keys(conexion).map((key) => (
          <TextInput
            key={key}
            style={styles.input}
            onChangeText={(value) => handleChange(key, value)}
            value={conexion[key]}
            placeholder={key.replace('_', ' ')}
          />
        ))}
      </View>
      <Button title="Guardar Conexión" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  }
});

export default FormularioConexion;
