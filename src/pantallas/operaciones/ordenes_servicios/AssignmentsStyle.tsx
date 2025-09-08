import { StyleSheet } from 'react-native';

const getStyles = (isDarkMode) => {
    const baseTextColor = isDarkMode ? '#FFFFFF' : '#000000';
    const secondaryTextColor = isDarkMode ? '#BBBBBB' : '#666666';
    const backgroundColor = isDarkMode ? '#121212' : '#FFFFFF';
    const cardBackgroundColor = isDarkMode ? '#1e1e1e' : '#FFFFFF';
    const inputBackgroundColor = isDarkMode ? '#333333' : '#f1f1f1';

    return StyleSheet.create({
    // Contenedor general
    container: {
        flex: 1,
        padding: 16,
    },
    darkBackground: {
        backgroundColor: isDarkMode ? '#333' : '#121212', // Fondo oscuro
    },
    lightBackground: {
        backgroundColor: isDarkMode ? '#FFF' : '#F5F5F5', // Fondo claro
    },

    // Títulos y texto general
    title: {
        fontSize: 24, // Título más grande
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: isDarkMode ? '#FFF' : '#000',
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
        color: isDarkMode ? '#AAA' : '#666',
        marginTop: 20,
    },
    itemContainer: {
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
        backgroundColor: isDarkMode ? '#2C2C2C' : '#F9F9F9',
    },
    itemText: {
        fontSize: 16,
        color: isDarkMode ? '#FFF' : '#000',
    },

    // Modal de Filtros
    modalContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: isDarkMode ? '#FFF' : '#000',
    },
    searchInput: {
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: isDarkMode ? '#444' : '#CCC',
        backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
        color: isDarkMode ? '#FFF' : '#000',
    },
    modalItem: {
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: isDarkMode ? '#2C2C2C' : '#F9F9F9',
        borderColor: isDarkMode ? '#444' : '#CCC',
        borderWidth: 1,
    },
    modalItemText: {
        fontSize: 16,
        color: isDarkMode ? '#FFF' : '#000',
    },
    modalCloseButton: {
        marginTop: 10,
        borderColor: isDarkMode ? '#BBB' : '#6200EE',
    },

    // Filtros (Checkbox)
    selectedFilterItem: {
        borderWidth: 2,
        borderColor: '#007AFF', // Indicar que está seleccionado
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 4,
        marginRight: 10,
    },
    checkboxDark: {
        borderColor: '#CCC',
        backgroundColor: '#444',
    },
    checkboxLight: {
        borderColor: '#666',
        backgroundColor: '#EEE',
    },
    checkboxSelected: {
        backgroundColor: '#007AFF',
    },
    checkboxLabel: {
        fontSize: 16,
    },


    // Botones
    applyButton: {
        marginTop: 20,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    applyButtonDark: {
        backgroundColor: '#444',
    },
    applyButtonLight: {
        backgroundColor: '#007AFF',
    },
    applyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonDark: {
        backgroundColor: '#666',
    },
    closeButtonLight: {
        backgroundColor: '#CCC',
    },
    closeButtonText: {
        color: '#000',
        fontSize: 16,
    },

    // Barra de Progreso
    progressBarContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    progressBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 200,
        position: 'relative',
    },
    progressLine: {
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -5 }],
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: '#CCC',
        zIndex: -1,
        borderRadius: 5,
    },
    filledLine: {
        height: 10,
        backgroundColor: '#0F0',
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -5 }],
        left: 0,
        borderRadius: 5,
    },
    progressPoint: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#CCC',
        zIndex: 1,
    },
    cancelledPoint: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F00',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    cancelledText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    selectedFilter: {
        fontWeight: 'bold',
        color: '#007BFF',
    },

    // Opciones de filtro



    filterOption: {
        padding: 10,
        marginVertical: 5,
        width: '100%',
        backgroundColor: '#ccc',
        borderRadius: 5,
    },
    filterOptionText: {
        fontSize: 16,
    },
    selectedFilterItem: {
        borderWidth: 2,
        borderColor: '#007AFF', // Indicar que está seleccionado
    },

    selectedFilterItem: {
        borderWidth: 2,
        borderColor: '#007AFF', // Indicar que está seleccionado
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 4,
        marginRight: 10,
    },
    checkboxDark: {
        borderColor: '#CCC',
        backgroundColor: '#444',
    },
    checkboxLight: {
        borderColor: '#666',
        backgroundColor: '#EEE',
    },
    checkboxSelected: {
        backgroundColor: '#007AFF',
    },
    checkboxLabel: {
        fontSize: 16,
    },
    selectedFilterItem: {
        backgroundColor: isDarkMode ? '#333' : '#DDD',
        borderWidth: 1,
        borderColor: '#007AFF',
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

