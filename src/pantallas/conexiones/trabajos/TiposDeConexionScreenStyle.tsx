import { StyleSheet } from 'react-native';

const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#121212' : '#f9f9f9',
            paddingHorizontal: 15,
            paddingTop: 20,
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            textAlign: 'center',
            color: isDarkMode ? '#FFFFFF' : '#000000',
            marginBottom: 10,
        },
        itemContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4, // Android shadow
        },
        itemText: {
            fontSize: 16,
            color: isDarkMode ? '#FFFFFF' : '#333333',
        },
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            width: '90%',
            backgroundColor: isDarkMode ? '#2E2E2E' : '#FFFFFF',
            padding: 20,
            borderRadius: 10,
            elevation: 5,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            textAlign: 'center',
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        modalText: {
            fontSize: 16,
            color: isDarkMode ? '#CCCCCC' : '#555555',
            textAlign: 'center',
            marginBottom: 20,
        },
        input: {
            borderWidth: 1,
            borderColor: isDarkMode ? '#555555' : '#CCCCCC',
            borderRadius: 5,
            padding: 10,
            color: isDarkMode ? '#FFFFFF' : '#000000',
            backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
            marginBottom: 15,
        },
        modalActions: {
            flexDirection: 'row',
            justifyContent: 'space-around',
        },
        modalButton: {
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
            backgroundColor: '#007bff',
        },
        modalButtonCancel: {
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
            backgroundColor: '#FF4B4B',
        },
        modalButtonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
        },
        list: {
            marginTop: 10,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#121212' : '#F9F9F9',
        },
        loadingText: {
            fontSize: 16,
            color: isDarkMode ? '#FFFFFF' : '#000000',
        },
    });

export default getStyles;
