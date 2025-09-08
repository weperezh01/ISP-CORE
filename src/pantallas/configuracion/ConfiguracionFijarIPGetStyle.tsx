import { StyleSheet } from 'react-native';

export const conseguirStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        containerSuperior: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: isDarkMode ? '#222' : '#f8f8f8', // Fondo dinámico
            alignItems: 'center',
        },
        buttonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000', // Texto dinámico
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            color: isDarkMode ? '#fff' : '#000', // Texto dinámico
        },
        infoText: {
            fontSize: 18,
            textAlign: 'center',
            color: isDarkMode ? '#aaa' : '#888', // Texto dinámico
            marginBottom: 20,
        },
        container: {
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: isDarkMode ? '#000' : '#fff', // Fondo dinámico
        },
        leaseItem: {
            padding: 10,
            marginVertical: 5,
            borderWidth: 1,
            borderColor: isDarkMode ? '#444' : '#ddd', // Color del borde dinámico
            borderRadius: 5,
            backgroundColor: isDarkMode ? '#333' : '#f9f9f9', // Fondo dinámico
        },
        leaseText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#333', // Texto dinámico
        },
        leaseSubText: {
            fontSize: 14,
            color: isDarkMode ? '#aaa' : '#666', // Texto dinámico
        },
        flatListContainer: {
            paddingVertical: 10,
            backgroundColor: isDarkMode ? '#000' : '#fff', // Fondo del FlatList dinámico
        },
        scrollViewContainer: {
            paddingBottom: 20,
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo translúcido oscuro para modal
        },
        modalContent: {
            backgroundColor: isDarkMode ? '#222' : 'white', // Fondo dinámico del modal
            padding: 20,
            borderRadius: 10,
            width: '80%',
            borderColor: isDarkMode ? '#444' : '#ccc',
            borderWidth: 1,
        },
        modalText: {
            fontSize: 18,
            textAlign: 'center',
            marginBottom: 15,
            color: isDarkMode ? '#fff' : '#000', // Texto dinámico
        },
        picker: {
            height: 50,
            width: '100%',
        },
        input: {
            borderWidth: 1,
            borderColor: isDarkMode ? '#555' : '#ccc', // Color dinámico
            borderRadius: 5,
            padding: 10,
            marginVertical: 5,
            backgroundColor: isDarkMode ? '#333' : '#fff', // Fondo dinámico
            color: isDarkMode ? '#fff' : '#000', // Texto dinámico
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
        },
        inputPicker: {
            borderWidth: 1,
            borderColor: isDarkMode ? '#555' : '#ccc',
            borderRadius: 5,
            padding: 10,
            flex: 1, // Ocupar el espacio restante
            backgroundColor: isDarkMode ? '#333' : '#fff', // Fondo dinámico
            color: isDarkMode ? '#fff' : '#000', // Texto dinámico
            height: 50, // Asegurar que el campo tenga altura fija
        },
        unitPicker: {
            width: 130, // Ajustar el ancho del Picker para que sea visible
            height: 50,
            marginLeft: 10, // Espacio entre el campo de texto y el Picker
            backgroundColor: isDarkMode ? '#333' : '#fff', // Fondo dinámico
            color: isDarkMode ? '#fff' : '#000', // Texto dinámico
        },
    });

