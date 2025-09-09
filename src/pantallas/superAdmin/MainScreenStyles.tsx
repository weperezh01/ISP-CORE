// MainScreenStyles.tsx
import { StyleSheet } from 'react-native';

function getStyles(isDarkMode) {
  return StyleSheet.create({
    containerSuperior: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      backgroundColor: isDarkMode ? '#121212' : '#FFF',
    },
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      paddingHorizontal: 16,
      paddingTop: 16,
      backgroundColor: isDarkMode ? '#121212' : '#FFF',
    },
    header: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      marginTop: 12, // desplazar un poco más hacia abajo
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 14,
      marginTop: 2,
    },
    userButton: {
      padding: 10,
      backgroundColor: isDarkMode ? '#333' : '#EEE',
      borderRadius: 5,
    },
    userButtonText: {
      color: isDarkMode ? 'white' : 'black',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    cardShadow: {
      width: '48%',
      borderRadius: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
      marginBottom: 12,
    },
    card: {
      borderRadius: 14,
      paddingVertical: 18,
      paddingHorizontal: 14,
      minHeight: 84,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    cardIcon: {
      marginBottom: 8,
    },
    cardText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 18,
    },
    headerRightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginRight: 10,
    },
    headerRightText: {
      color: isDarkMode ? 'white' : 'black',
      fontSize: 16,
      marginRight: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: isDarkMode ? '#333' : '#FFF',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      shadowColor: isDarkMode ? '#FFF' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? 'white' : 'black',
      marginBottom: 20,
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#CCC',
      backgroundColor: isDarkMode ? '#222' : '#FFF',
      color: isDarkMode ? 'white' : 'black',
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1,
      padding: 10,
      margin: 5,
      backgroundColor: isDarkMode ? '#007bff' : '#007bff',
      borderRadius: 5,
      alignItems: 'center',
    },
    modalCancelButton: {
      flex: 1,
      padding: 10,
      margin: 5,
      backgroundColor: isDarkMode ? '#900' : 'red',
      borderRadius: 5,
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#CCC',
      backgroundColor: isDarkMode ? '#222' : '#FFF',
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 15,
      paddingLeft: 0,
    },
    eyeIcon: {
      marginLeft: 10,
    },
    inputPasswd: {
      width: '100%',
      borderWidth: 1,
      borderColor: isDarkMode ? '#555' : '#CCC',
      backgroundColor: isDarkMode ? '#222' : '#FFF',
      color: isDarkMode ? 'white' : 'black',
      borderRadius: 5,
      padding: 10,
      margin: 0,
      marginLeft: 0,
    },
    list: {
      width: '100%',
    },
    userItem: {
      width: '100%',
      padding: 15,
      marginVertical: 5,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
      shadowColor: isDarkMode ? '#000' : '#CCC',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3,
    },
    userName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFF' : '#000',
    },
    userEmail: {
      fontSize: 14,
      color: isDarkMode ? '#CCC' : '#555',
      marginTop: 5,
    },
    
  });
}

export default getStyles;



