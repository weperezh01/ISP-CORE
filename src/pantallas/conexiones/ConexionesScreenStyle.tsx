import { StyleSheet } from 'react-native';

const getStyles = (isDarkMode) => {
    const baseTextColor = isDarkMode ? '#FFFFFF' : '#000000';
    const secondaryTextColor = isDarkMode ? '#BBBBBB' : '#666666';
    const backgroundColor = isDarkMode ? '#121212' : '#FFFFFF';
    const cardBackgroundColor = isDarkMode ? '#1e1e1e' : '#FFFFFF';
    const inputBackgroundColor = isDarkMode ? '#333333' : '#f1f1f1';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: backgroundColor,
            paddingHorizontal: 16,
            paddingVertical: 10,
        },
        header: {
            marginBottom: 15,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: baseTextColor,
        },
        input: {
            backgroundColor: inputBackgroundColor,
            borderRadius: 8,
            paddingHorizontal: 10,
            height: 40,
            fontSize: 16,
            color: baseTextColor,
            marginBottom: 10,
        },
        list: {
            marginTop: 10,
        },
        itemContainer: {
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#444444' : '#DDDDDD',
            borderRadius: 8,
            marginBottom: 10,
            backgroundColor: cardBackgroundColor,
            shadowColor: isDarkMode ? '#000' : '#ccc',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 2,
        },
        itemName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: baseTextColor,
            marginBottom: 5,
        },
        itemDetails: {
            fontSize: 14,
            color: secondaryTextColor,
            marginBottom: 2,
        },
        noDataText: {
            fontSize: 16,
            color: isDarkMode ? '#AAAAAA' : '#999999',
            textAlign: 'center',
            marginTop: 20,
        },

        // Filter Tags
        filterRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
        },
        filterTagContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 5,
        },
        filterTag: {
            backgroundColor: isDarkMode ? '#333' : '#eee',
            borderRadius: 15,
            paddingVertical: 5,
            paddingHorizontal: 10,
            marginRight: 5,
        },
        filterTagText: {
            color: baseTextColor,
            fontSize: 14,
        },
        redRectangle: {
            backgroundColor: '#FF6666',
            borderRadius: 15,
            paddingVertical: 5,
            paddingHorizontal: 10,
            marginLeft: 5,
        },

        // Modal Styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            width: '90%',
            maxHeight: '80%',
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            borderRadius: 10,
            padding: 20,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: baseTextColor,
            marginBottom: 15,
            textAlign: 'center',
        },
        modalText: {
            fontSize: 16,
            color: secondaryTextColor,
            marginBottom: 20,
        },
        modalInput: {
            backgroundColor: inputBackgroundColor,
            borderRadius: 8,
            borderColor: isDarkMode ? '#555555' : '#cccccc',
            borderWidth: 1,
            paddingHorizontal: 10,
            height: 40,
            fontSize: 16,
            color: baseTextColor,
            marginBottom: 20,
        },
        modalActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
        },
        modalButton: {
            backgroundColor: '#007BFF',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
        },
        modalButtonCancel: {
            backgroundColor: '#e74c3c',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
        },
        modalButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#FFFFFF',
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
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 10,
            color: isDarkMode ? '#fff' : '#000',
        },
        modalSubTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginVertical: 10,
            color: isDarkMode ? '#fff' : '#000',
        },
        modalText: {
            fontSize: 16,
            color: isDarkMode ? '#fff' : '#000',
            marginBottom: 5,
        },
        filterOption: {
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#555' : '#ccc',
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
};

export default getStyles;
