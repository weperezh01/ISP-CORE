import { StyleSheet } from 'react-native';

const getStyles = (isDarkMode, width) =>
    StyleSheet.create({
        container: {
            flex: 1,
            width: width > 800 ? '60%' : '90%', // Ajuste dinámico para pantallas más anchas
            alignSelf: 'center',
            backgroundColor: isDarkMode ? '#121212' : '#f9f9f9',
            padding: 16,
            borderRadius: 8,
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
            textAlign: 'center',
            marginBottom: 16,
        },
        formGroup: {
            marginBottom: 16,
        },
        card: {
            marginVertical: 16,
            borderRadius: 8,
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
            elevation: 4, // Sombra para mayor profundidad
        },
        cardTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
        },
        divider: {
            marginVertical: 8,
            backgroundColor: isDarkMode ? '#444' : '#ccc',
        },
        input: {
            marginBottom: 12,
            backgroundColor: isDarkMode ? '#2c2c2c' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
        },
        buttonContainer: {
            marginTop: 20,
            alignItems: 'center',
        },
        button: {
            borderRadius: 8,
            width: '100%',
            backgroundColor: isDarkMode ? '#333' : '#007bff',
            paddingVertical: 12,
            elevation: 2, // Agrega sombra para un efecto más moderno
        },
        buttonLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff',
        },
        label: {
            fontSize: 14,
            color: isDarkMode ? '#ccc' : '#333',
            marginBottom: 4,
            fontWeight: '500',
        },
        scrollViewContentContainer: {
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            flex: 1,
            padding: 16,
            backgroundColor: isDarkMode ? '#121212' : '#f9f9f9', // Fondo de la pantalla
        },
        card: {
            marginVertical: 16,
            borderRadius: 8,
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', // Fondo del card
        },
        cardTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000', // Texto del título
        },
        input: {
            marginBottom: 12,
            backgroundColor: isDarkMode ? '#2c2c2c' : '#fff', // Fondo del input
        },
        divider: {
            marginVertical: 8,
            backgroundColor: isDarkMode ? '#444' : '#ddd', // Divider
        },
        button: {
            borderRadius: 8,
            backgroundColor: isDarkMode ? '#3a3a3a' : '#007bff', // Fondo del botón
            paddingVertical: 10,
        },
        buttonLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#fff', // Texto del botón
        },
        
    });

export default getStyles;
