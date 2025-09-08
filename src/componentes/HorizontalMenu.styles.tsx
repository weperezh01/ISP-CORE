// HorizontalMenu.styles

import { StyleSheet } from 'react-native';

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    menuContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingVertical: 10,
      backgroundColor: isDarkMode ? '#3700B3' : '#007bff', // Cambia según el modo
    },
    footerButtonHorizontal: {
      flexDirection: 'row', // Hace que el contenido sea horizontal
      alignItems: 'center', // Centra el icono y el texto verticalmente
      paddingVertical: 10,
      paddingHorizontal: 15, // Añade un poco de espacio horizontal
      marginHorizontal: 5,
      backgroundColor: isDarkMode ? '#3700B3' : '#007bff', // Cambia según el modo
      borderRadius: 5,
    },
    footerButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      textAlign: 'center',
    },
    iconLeft: {
      marginRight: 8, // Espacio entre el icono y el texto
    },
  });

export default getStyles;
