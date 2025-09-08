// ClientesScreen.ts
import { StyleSheet } from 'react-native';

const styles = (isDarkMode) => StyleSheet.create({
    itemContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
    },
    itemDetails: {
        fontSize: 14,
        color: isDarkMode ? '#bbb' : '#666',
    },
    connectionContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
        borderRadius: 5,
    },
    connectionText: {
        fontSize: 14,
        color: isDarkMode ? '#fff' : '#333',
    },
    noConnectionText: {
        fontSize: 14,
        color: isDarkMode ? '#bbb' : '#999',
        marginTop: 10,
    },
    // Other styles...
});

export default styles;
