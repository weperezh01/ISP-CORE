import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: isDarkMode ? '#121212' : '#FFF',
        },
        cardStyle: {
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
            borderRadius: 8,
            marginVertical: 10,
            padding: 10,
        },
        header: {
            fontSize: 22,
            fontWeight: 'bold',
            color: isDarkMode ? '#FFF' : '#000',
        },
        text: {
            fontSize: 16,
            color: isDarkMode ? '#DDD' : '#333',
            marginBottom: 5,
        },
        notaContainer: {
            marginBottom: 10,
        },
        notaText: {
            fontSize: 16,
            color: isDarkMode ? '#DDD' : '#333',
        },
        notaDate: {
            fontSize: 14,
            color: isDarkMode ? '#AAA' : '#666',
        },
        articuloText: {
            fontSize: 16,
            color: isDarkMode ? '#DDD' : '#333',
        },
        articuloTotal: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#DDD' : '#333',
            textAlign: 'right',
        },
        articuloContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 5,
        },
        errorText: {
            fontSize: 18,
            color: '#ff0000',
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        button: {
            backgroundColor: '#4e9f3d',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            marginTop: 10,
        },
        editButton: {
            backgroundColor: '#007bff',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            marginTop: 10,
        },
        buttonText: {
            color: 'white',
            fontSize: 18,
            textAlign: 'center',
        },
        permisoErrorText: {
            color: 'red',
            marginTop: 10,
        },
        modalBackground: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContainer: {
            width: 300,
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
            borderRadius: 8,
            padding: 20,
            alignItems: 'center',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            color: isDarkMode ? '#FFF' : '#000',
        },
        input: {
            width: '100%',
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            marginBottom: 20,
            color: isDarkMode ? '#FFF' : '#000',
            backgroundColor: isDarkMode ? '#121212' : '#FFF',
        },
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
        },
        modalButton: {
            flex: 1,
            backgroundColor: '#4e9f3d',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
            alignItems: 'center',
            marginHorizontal: 5,
        },
        scrollViewContainer: {
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        notaAuthor: {
            fontSize: 14,
            fontWeight: 'bold',
            color: isDarkMode ? '#AAA' : '#666',
            marginBottom: 0,
        },
        revisionStatus: {
            fontSize: 14,
            fontWeight: 'bold',
            color: 'orange',
            marginTop: 3,
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        checkboxLabel: {
            marginLeft: 10,
            fontSize: 16,
            color: isDarkMode ? '#FFF' : '#000',
        },
        headerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        
        headerButton: {
            marginHorizontal: 10,
            backgroundColor: '#007bff',
            paddingVertical: 8,
            paddingHorizontal: 15,
            borderRadius: 5,
        },
        
        headerButtonText: {
            color: '#FFF',
            fontSize: 16,
        },
        tableHeader: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: isDarkMode ? '#fff' : '#000',
            paddingVertical: 5,
            marginHorizontal: 10, // Para evitar bordes estrechos
        },
        tableRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderColor: isDarkMode ? '#444' : '#ccc',
            paddingVertical: 5,
            marginHorizontal: 10, // Mantiene consistencia con el encabezado
        },
        tableCellHeader: {
            textAlign: 'center',
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
        },
        tableCell: {
            textAlign: 'center',
            color: isDarkMode ? '#fff' : '#000',
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        },
        modalContent: {
            width: '80%',
            backgroundColor: isDarkMode ? '#1c1c1c' : '#fff',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 20,
            color: isDarkMode ? '#fff' : '#000',
        },
        printerItem: {
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#444' : '#ccc',
            width: '100%',
        },
        printerText: {
            fontSize: 16,
            color: isDarkMode ? '#fff' : '#000',
        },
        noPrintersText: {
            fontSize: 16,
            color: isDarkMode ? '#aaa' : '#888',
            textAlign: 'center',
            marginVertical: 20,
        },
        closeButton: {
            marginTop: 20,
            backgroundColor: isDarkMode ? '#444' : '#2196F3',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
        },
        buttonText: {
            color: isDarkMode ? '#fff' : '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        
    });
