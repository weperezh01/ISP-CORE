import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../ThemeContext';
import ThemeSwitch from '../componentes/themeSwitch';
import { getStyles } from '../estilos/styles';

const AddIspScreen = ({ navigation, route }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const styles = getStyles(isDarkMode);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rnc, setRnc] = useState('');
  const [paginaWeb, setPaginaWeb] = useState('');
  const [email, setEmail] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [ispId, setIspId] = useState(null);

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@loginData');
        const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (userData) {
          setNombreUsuario(userData.nombre);
          setUsuarioId(userData.id);
        }
      } catch (e) {
        console.error('Error al leer los datos del usuario', e);
      }
    };

    obtenerDatosUsuario();

    if (route.params?.isp) {
      const { isp } = route.params;
      setNombre(isp.nombre);
      setDireccion(isp.direccion);
      setTelefono(isp.telefono);
      setRnc(isp.rnc);
      setPaginaWeb(isp.pagina_web);
      setEmail(isp.email);
      setIspId(isp.id_isp);
    }
  }, []);

  const handleSaveOrUpdate = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El campo Nombre es obligatorio.');
      return;
    }

    if (ispId) {
      actualizarIsp();
    } else {
      guardarIsp();
    }
  };

  const actualizarIsp = async () => {
    const url = `https://wellnet-rd.com:444/api/actualizar-isp/`;
    const ispData = { ispId, usuarioId, nombre, direccion, telefono, rnc, paginaWeb, email };
    console.log(ispData);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ispData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'ISP actualizada con éxito.');
        // Agregar un retraso de 2 segundos antes de navegar
        setTimeout(() => {
          navigation.navigate('IspListScreen');
        }, 2000);
      } else {
        throw new Error('Algo salió mal al actualizar el ISP');
      }
    } catch (error) {
      console.error('Error al actualizar ISP:', error);
      Alert.alert('Error', 'No se pudo actualizar el ISP');
    }
  };

  const guardarIsp = async () => {
    const url = 'https://wellnet-rd.com:444/api/insertar-isp';
    const ispData = { usuarioId, nombre, direccion, telefono, rnc, paginaWeb, email };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ispData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'ISP guardada con éxito.');
        // Agregar un retraso de 2 segundos antes de navegar
        setTimeout(() => {
          navigation.navigate('IspListScreen');
        }, 2000);
      } else {
        throw new Error('Algo salió mal al guardar el ISP');
      }
    } catch (error) {
      console.error('Error al guardar el ISP:', error);
      Alert.alert('Error', 'No se pudo guardar el ISP');
    }
  };

  return (
    <>
      <View style={styles.containerSuperior}>
        <TouchableOpacity style={styles.buttonText} onPress={() => { }}>
          <Text style={styles.buttonText}>{nombreUsuario || 'Usuario'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{ispId ? 'Editar ISP' : 'Agregar nueva ISP'}</Text>
        <ThemeSwitch toggleTheme={toggleTheme} />
      </View>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor={isDarkMode ? 'lightgrey' : 'darkgrey'}
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Dirección"
            placeholderTextColor={isDarkMode ? 'lightgrey' : 'darkgrey'}
            value={direccion}
            onChangeText={setDireccion}
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor={isDarkMode ? 'lightgrey' : 'darkgrey'}
            value={telefono}
            onChangeText={setTelefono}
          />
          <TextInput
            style={styles.input}
            placeholder="RNC"
            placeholderTextColor={isDarkMode ? 'lightgrey' : 'darkgrey'}
            value={rnc}
            onChangeText={setRnc}
          />
          <TextInput
            style={styles.input}
            placeholder="Página Web"
            placeholderTextColor={isDarkMode ? 'lightgrey' : 'darkgrey'}
            value={paginaWeb}
            onChangeText={setPaginaWeb}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={isDarkMode ? 'lightgrey' : 'darkgrey'}
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveOrUpdate}>
            <Text style={styles.buttonText}>{ispId ? 'Actualizar ISP' : 'Guardar ISP'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};


export default AddIspScreen;
