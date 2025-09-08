// additionalStyles.js
import { StyleSheet } from 'react-native';

export const getAdditionalStyles = (isDarkMode) => StyleSheet.create({
    idConfiguracionContainer: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: isDarkMode ? '#444' : '#fff',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
    },
    idConfiguracionText: {
        color: isDarkMode ? 'white' : 'black',
        fontSize: 16,
        textAlign: 'center'
    },
    flatListItem: {
        marginVertical: 10,  // Espacio vertical entre los elementos
        padding: 10,  // Espaciado interno del elemento
        borderRadius: 5,  // Bordes redondeados
        shadowColor: '#000',  // Sombra
        shadowOffset: { width: 0, height: 2 },  // Desplazamiento de la sombra
        shadowOpacity: 0.8,  // Opacidad de la sombra
        shadowRadius: 2,  // Radio de la sombra
        elevation: 1,  // Elevación (sólo Android)
    },
    flatListText: {
        color: isDarkMode ? 'white' : 'black',  // Color del texto
        fontSize: 16  // Tamaño de la fuente
    },
    selectedRedesItem: {
        backgroundColor: isDarkMode ? '#ff6600' : '#CC9966',  // Fondo anaranjado para Redes IP seleccionadas
    },
    redesItem: {
        backgroundColor: isDarkMode ? '#ff9900' : '#ffdd99',  // Fondo anaranjado para Redes IP
    },
    selectedDireccionesItem: {
        backgroundColor: isDarkMode ? '#006600' : '#669966',  // Fondo verde para Direcciones IP seleccionadas
    },
    direccionesItem: {
        backgroundColor: isDarkMode ? '#009900' : '#99ff99',  // Fondo verde para Direcciones IP
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: isDarkMode ? '#555' : '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    inputGroup: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 10,
        backgroundColor: isDarkMode ? '#444' : '#fff',
        color: isDarkMode ? 'white' : 'black'
    },
    horizontalFlatList: {
        marginBottom: 15,
    },
    titleContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
});
