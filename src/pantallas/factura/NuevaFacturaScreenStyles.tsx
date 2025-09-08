import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: isDarkMode ? '#121212' : '#FFF',
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            color: isDarkMode ? '#FFF' : '#000',
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFF' : '#000',
            marginBottom: 8,
        },
        value: {
            fontSize: 16,
            color: isDarkMode ? '#CCC' : '#333',
            marginBottom: 16,
        },
        pickerContainer: {
            borderWidth: 1,
            borderColor: isDarkMode ? '#555' : '#CCC',
            borderRadius: 8,
            marginBottom: 16,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
            overflow: 'hidden',
        },
        picker: {
            color: isDarkMode ? '#FFF' : '#000',
            height: 50,
        },
        input: {
            width: '100%',
            minHeight: 80, // Altura mínima para el campo multilínea
            borderWidth: 1,
            borderColor: isDarkMode ? '#555' : 'gray',
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 16,
            color: isDarkMode ? '#FFF' : '#000',
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
            textAlignVertical: 'top', // Alinea el texto al inicio verticalmente
        },        
        button: {
            backgroundColor: isDarkMode ? '#4E9F3D' : '#007BFF',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
        },
        buttonText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
