import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? '#FFF' : '#000',
    },
    detail: {
        fontSize: 18,
        color: isDarkMode ? '#FFF' : '#000',
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: isDarkMode ? '#444' : '#007bff',
        borderRadius: 5,
        alignItems: 'center',
        marginRight: 10,
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    changePasswordButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: isDarkMode ? '#555' : '#ff5733',
        borderRadius: 5,
        alignItems: 'center',
    },
    changePasswordButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    permissionCard: {
        marginTop: 20,
        padding: 20,
        borderRadius: 10,
        backgroundColor: isDarkMode ? '#333' : '#FFF',
    },
    permissionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: isDarkMode ? '#FFF' : '#000',
        marginBottom: 10,
    },
    permissionList: {
        paddingBottom: 20,
    },
    permissionItem: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#555' : '#CCC',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    indicatorsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    indicatorWithText: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indicatorLabel: {
        fontSize: 14,
        color: isDarkMode ? '#FFF' : '#000',
        marginRight: 5,
    },
    indicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 10,
    },
    indicatorActive: {
        backgroundColor: 'green',
    },
    indicatorInactive: {
        backgroundColor: 'gray',
    },
    permissionText: {
        fontSize: 18,
        color: isDarkMode ? '#FFF' : '#000',
        marginLeft: 10,
    },
    togglePermissionsButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: isDarkMode ? '#444' : '#007bff',
        borderRadius: 5,
        alignItems: 'center',
    },
    togglePermissionsButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewReceiptsButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: isDarkMode ? '#555' : '#28a745',
        borderRadius: 5,
        alignItems: 'center',
    },
    viewReceiptsButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewCallsButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: isDarkMode ? '#555' : '#1e90ff',
        borderRadius: 5,
        alignItems: 'center',
    },
    viewCallsButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewSmsButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: isDarkMode ? '#555' : '#ffcc00',
        borderRadius: 5,
        alignItems: 'center',
    },
    viewSmsButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewWhatsAppButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: isDarkMode ? '#555' : '#25D366',
        borderRadius: 5,
        alignItems: 'center',
    },
    viewWhatsAppButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewServiceCutsButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: isDarkMode ? '#555' : '#dc3545', // Color rojo para el botón de cortes de servicio
        borderRadius: 5,
        alignItems: 'center',
    },
    viewServiceCutsButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewReconnectionsButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: isDarkMode ? '#555' : '#17a2b8', // Color cian para el botón de reconexiones de servicio
        borderRadius: 5,
        alignItems: 'center',
    },
    viewReconnectionsButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // input: {
    //     height: 40,
    //     borderColor: '#ccc',
    //     borderWidth: 1,
    //     borderRadius: 5,
    //     marginBottom: 10,
    //     paddingHorizontal: 10,
    //     color: '#fff', // Texto blanco para contraste en fondo oscuro
    //     backgroundColor: '#333', // Fondo oscuro
    //     fontSize: 16,
    // },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    switchLabel: {
        fontSize: 16,
        color: isDarkMode ? 'white' : 'black',
    },
    modalSubtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: isDarkMode ? 'white' : 'black',
    },
    modalContent: {
        backgroundColor: isDarkMode ? '#333' : '#FFF',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        alignSelf: 'center',
      },
      scrollContainer: {
        flexGrow: 0,
        marginBottom: 20, // Espacio entre campos y botones
      },
    //   input: {
    //     height: 40,
    //     borderColor: isDarkMode ? '#555' : '#CCC',
    //     borderWidth: 1,
    //     borderRadius: 5,
    //     padding: 10,
    //     marginBottom: 10,
    //     backgroundColor: isDarkMode ? '#444' : '#FFF',
    //     color: isDarkMode ? '#FFF' : '#000',
    //   },
      modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
    //   modalButton: (color) => ({
    //     backgroundColor: color,
    //     borderRadius: 5,
    //     paddingVertical: 10,
    //     paddingHorizontal: 20,
    //     alignItems: 'center',
    //   }),
      modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
      },
      input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        marginBottom: 10, // Espaciado entre los campos
        borderRadius: 5, // Opcional: esquinas redondeadas
        backgroundColor: 'white', // Ajustar para modos claro/oscuro
        color: isDarkMode ? 'white' : 'black', // Ajustar color del texto según el tema
    },
    
      
    
});
