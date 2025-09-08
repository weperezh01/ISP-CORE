// UsuariosScreenStyles.js
import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode) =>
    StyleSheet.create({
        // General
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        list: {
            padding: 16,
        },
        loadingText: {
            fontSize: 18,
            textAlign: 'center',
            marginTop: 20,
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        errorText: {
            color: 'red',
            fontSize: 12,
            marginBottom: 10,
        },

        // Floating Action Button
        fab: {
            position: 'absolute',
            right: 20,
            bottom: 20,
            backgroundColor: isDarkMode ? '#444' : '#007bff',
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 8,
        },
        fabText: {
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: 'bold',
        },

        // Usuario Item
        usuarioItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#444' : '#CCC',
            paddingHorizontal: 10,
            backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
            borderRadius: 8,
            marginBottom: 10,
        },
        usuarioInfo: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        usuarioText: {
            fontSize: 16,
            marginLeft: 10,
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        statusIndicator: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        online: {
            backgroundColor: 'green',
        },
        offline: {
            backgroundColor: 'gray',
        },

        // Modal General
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        menuModal: {
            padding: 20,
            borderRadius: 10,
            width: '90%',
            maxHeight: '80%',
            position: 'relative',
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },

        // Modal Close Button
        closeButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            borderRadius: 15,
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            backgroundColor: isDarkMode ? '#FF6F61' : '#FF0000',
        },
        closeButtonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 16,
        },

        // Detalles del Usuario en el Modal
        userDetailsContainer: {
            marginBottom: 20,
        },
        userDetailText: {
            fontSize: 16,
            marginBottom: 5,
            color: isDarkMode ? '#CCCCCC' : '#333333',
        },

        // Picker en el Modal
        pickerContainer: {
            marginBottom: 20,
            width: '100%',
            alignItems: 'center',
        },
        pickerLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 5,
            color: isDarkMode ? '#CCCCCC' : '#333333',
        },
        picker: {
            width: '100%',
            borderRadius: 5,
            backgroundColor: isDarkMode ? '#444444' : '#F0F0F0',
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },

        // Input Fields
        input: {
            height: 40,
            borderColor: isDarkMode ? '#555555' : 'gray',
            borderWidth: 1,
            marginBottom: 20,
            paddingHorizontal: 10,
            borderRadius: 5,
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },

        // Password Input
        passwordContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 5,
            paddingHorizontal: 10,
            backgroundColor: isDarkMode ? '#555' : '#FFF',
            position: 'relative',
        },
        passwordInput: {
            flex: 1,
            paddingVertical: 10,
            paddingRight: 40,
        },
        eyeIconContainer: {
            position: 'absolute',
            right: 10,
            padding: 5,
        },
        eyeIcon: {
            fontSize: 18,
            color: isDarkMode ? '#CCC' : '#555',
        },
        passwordContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#CCC',
            borderRadius: 10,
            paddingHorizontal: 15,
            backgroundColor: isDarkMode ? '#222' : '#F9F9F9',
            height: 50,
            marginBottom: 20,
        },
        passwordInput: {
            flex: 1,
            fontSize: 16,
            color: isDarkMode ? '#FFF' : '#000',
        },
        eyeIconContainer: {
            marginLeft: 10,
        },
        eyeIcon: {
            fontSize: 20,
            color: isDarkMode ? '#FFF' : '#555',
        },
         // Estilo general para contenedores de inputs
         inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isDarkMode ? '#555555' : 'gray',
            borderRadius: 10,
            paddingHorizontal: 10,
            marginBottom: 15,
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
        },
        // Estilo del campo de texto
        input: {
            flex: 1,
            height: 50,
            color: isDarkMode ? '#FFFFFF' : '#000000',
            fontSize: 16,
        },
        // Estilo del icono de ojo o cualquier otro adicional
        iconContainer: {
            marginLeft: 10,
        },
        icon: {
            fontSize: 20,
            color: isDarkMode ? '#CCCCCC' : '#555555',
        },
        errorText: {
            color: 'red',
            fontSize: 14,
            marginBottom: 10,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
        },
        actionButton: {
            flex: 1,
            paddingVertical: 15,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 5,
        },
        registerButtonLight: {
            backgroundColor: '#007BFF',
        },
        registerButtonDark: {
            backgroundColor: '#4CAF50',
        },
        cancelButtonLight: {
            backgroundColor: '#FF0000',
        },
        cancelButtonDark: {
            backgroundColor: '#FF6F61',
        },
        buttonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 16,
        },
        menuTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
        },
        menuTitleLight: {
            color: '#000000',
        },
        menuTitleDark: {
            color: '#FFFFFF',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isDarkMode ? '#555555' : 'gray',
            borderRadius: 10,
            marginBottom: 15,
            backgroundColor: isDarkMode ? '#444444' : '#FFFFFF',
            paddingHorizontal: 10,
        },
        closeButtonLight: {
            backgroundColor: '#FF0000',
        },
        closeButtonDark: {
            backgroundColor: '#FF6F61',
        },
        closeButtonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 16,
        },
        pickerContainer: {
            marginBottom: 20,
            width: '100%',
        },
        pickerLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 5,
        },
        pickerLabelLight: {
            color: '#333',
        },
        pickerLabelDark: {
            color: '#CCC',
        },
        picker: {
            width: '100%',
            borderRadius: 5,
        },
        pickerLight: {
            backgroundColor: '#F0F0F0',
            color: '#000',
        },
        pickerDark: {
            backgroundColor: '#444',
            color: '#FFF',
        },
    });
