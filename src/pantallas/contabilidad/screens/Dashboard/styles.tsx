import { StyleSheet } from 'react-native';

const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
            padding: 16,
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 16,
            textAlign: 'center',
            color: isDarkMode ? '#ffffff' : '#333333',
        },
        listContent: {
            paddingBottom: 16,
        },
        cardContainer: {
            marginBottom: 16,
        },
        card: {
            elevation: 3,
            borderRadius: 8,
            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
            padding: 16,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
            color: isDarkMode ? '#dddddd' : '#555555',
        },
        cardValue: {
            fontSize: 16,
            color: isDarkMode ? '#90ee90' : '#4CAF50',
        },
        headerContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        monthButton: {
            padding: 8,
        },
        monthButtonText: {
            fontSize: 18,
            fontWeight: 'bold',
        },
        headerContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        monthButton: {
            padding: 8,
        },
        header: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000', // Color dinámico según el modo
        },
        headerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            marginBottom: 16,
        },
        monthButton: {
            padding: 10,
            borderRadius: 50,
            backgroundColor: isDarkMode ? '#333' : '#e0e0e0', // Botón dinámico
        },
        header: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000', // Texto dinámico
        },
        cardSubText: {
            fontSize: 14,
            color: isDarkMode ? '#FFF' : '#000',
            marginTop: 4,
        },
        searchContainer: {
            marginVertical: 8,
            marginHorizontal: 10,
            backgroundColor: '#ddd',
            borderRadius: 8,
            paddingHorizontal: 10,
        },
        searchInput: {
            height: 40,
            fontSize: 16,
        },

        modalButton: {
            backgroundColor: '#2196f3',
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
            marginTop: 10,
        },
        modalButtonText: {
            color: '#fff',
            fontWeight: 'bold',
        },
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContainer: {
            width: '90%',
            backgroundColor: isDarkMode ? '#333' : '#fff',
            borderRadius: 10,
            padding: 20,
            alignItems: 'center',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
            color: isDarkMode ? '#fff' : '#000',
        },
        modalButton: {
            backgroundColor: '#2196f3',
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
            marginTop: 10,
            width: '80%',
        },
        modalButtonText: {
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
        },
        filterOption: {
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#555' : '#ccc',
        },
        filterOptionText: {
            fontSize: 16,
            color: isDarkMode ? '#fff' : '#000',
        },
        checkboxRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        checkbox: {
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: '#ccc',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
        },
        checkboxSelected: {
            backgroundColor: '#2196f3',
            borderColor: '#2196f3',
        },
        checkboxCheck: {
            color: '#fff',
            fontSize: 14,
            fontWeight: 'bold',
        },
    });

export default getStyles;
