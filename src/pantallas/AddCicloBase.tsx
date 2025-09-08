import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../ThemeContext';
import { getStyles } from '../estilos/styles';

const AddCicloBase = () => {
  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);
  const navigation = useNavigation();
  const route = useRoute();
  const { idCicloBase, mode } = route.params || {};  // Parámetros pasados a través de la navegación

  const [diaMes, setDiaMes] = useState('');
  const [detalle, setDetalle] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [ispId, setIspId] = useState('');
  const [diasGracia, setDiasGracia] = useState('0'); // Inicializado como string por el TextInput

  // Títulos dinámicos según el modo
  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Editar Ciclo de Facturación' : 'Nuevo Ciclo de Facturación';
  const buttonText = isEditMode ? 'Actualizar Ciclo' : 'Crear Ciclo';

  useEffect(() => {
    const cargarDatos = async () => {
      const ispIdStorage = await AsyncStorage.getItem('ispId');
      const usuarioData = await AsyncStorage.getItem('@loginData');
      const usuarioInfo = usuarioData ? JSON.parse(usuarioData) : {};
      setIspId(ispIdStorage || 'No ID');
      setUsuarioId(usuarioInfo.id || '');

      if (isEditMode && idCicloBase) {
        try {
          const response = await axios.get(`https://wellnet-rd.com:444/api/ciclos-base/${idCicloBase}`);
          const cicloData = response.data;
          setDiaMes(cicloData.dia_mes.toString());
          setDetalle(cicloData.detalle);
          setDiasGracia(cicloData.dias_gracia_defecto.toString());
        } catch (error) {
          console.error('Error al cargar datos del ciclo:', error);
          Alert.alert("Error", "No se pudo cargar la información del ciclo.");
        }
      }
    };
    cargarDatos();
  }, [idCicloBase, mode]);

  const registrarNavegacion = async () => {
    if (!usuarioId) return;

    try {
      const fechaActual = new Date();
      const fecha = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const hora = fechaActual.toTimeString().split(' ')[0]; // Formato HH:mm:ss

      const logData = {
        id_usuario: usuarioId,
        fecha,
        hora,
        pantalla: 'AddCicloBase',
        datos: JSON.stringify({ 
          isDarkMode, 
          mode: isEditMode ? 'edit' : 'new', 
          diaMes, 
          detalle, 
          diasGracia 
        }),  // Enviar datos del formulario y el modo
      };

      const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Error al registrar la navegación');
      }
      console.log('Navegación registrada exitosamente');
    } catch (error) {
      console.error('Error al registrar la navegación:', error);
    }
  };

  useEffect(() => {
    if (usuarioId) {
      registrarNavegacion(); // Registrar la navegación al cargar la pantalla o al cambiar el modo oscuro/claro
    }
  }, [isDarkMode, usuarioId, diaMes, detalle, diasGracia, mode]);

  const handleDiaMesChange = (text) => {
    const num = parseInt(text);
    if (!isNaN(num) && num <= 27) {
      setDiaMes(text);
    } else if (text === '') {
      setDiaMes('');
    }
  };

  const guardarCiclo = async () => {
    const diaMesNum = parseInt(diaMes);
    const diasGraciaNum = parseInt(diasGracia);
    if (!diaMes || !detalle || isNaN(diaMesNum) || diaMesNum < 1 || diaMesNum > 27 || isNaN(diasGraciaNum)) {
      Alert.alert("Error", "Todos los campos son obligatorios y deben ser válidos. El día del mes debe estar entre 1 y 27.");
      return;
    }

    try {
      const method = isEditMode ? 'put' : 'post';
      const url = isEditMode ? `https://wellnet-rd.com:444/api/ciclos-base/actualizar/${idCicloBase}` : 'https://wellnet-rd.com:444/api/ciclos-base/agregar';

      const response = await axios[method](url, {
        dia_mes: diaMesNum,
        detalle: detalle,
        id_usuario: usuarioId,
        id_isp: parseInt(ispId, 10),
        dias_gracia: diasGraciaNum
      });

      if (response.data.success) {
        Alert.alert("Éxito", isEditMode ? "Ciclo actualizado correctamente." : "Ciclo creado correctamente.");
        navigation.goBack();
      } else {
        Alert.alert("Error", "No se pudo crear o actualizar el ciclo.");
      }
    } catch (error) {
      console.error('Error al crear o actualizar el ciclo:', error);
      Alert.alert("Error", "Error al conectar con el servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.label}>Día del Mes</Text>
      <TextInput
        style={styles.input}
        placeholder="Día del mes"
        value={diaMes}
        onChangeText={handleDiaMesChange}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Detalle del Ciclo</Text>
      <TextInput
        style={styles.input}
        placeholder="Detalle del ciclo"
        value={detalle}
        onChangeText={setDetalle}
        multiline
      />

      <Text style={styles.label}>Días de Gracia</Text>
      <TextInput
        style={styles.input}
        placeholder="Días de gracia"
        value={diasGracia}
        onChangeText={text => setDiasGracia(text.replace(/[^0-9]/g, ''))} // Solo permite números
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={guardarCiclo}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddCicloBase;
