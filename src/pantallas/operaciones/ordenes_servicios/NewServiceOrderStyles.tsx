import { StyleSheet } from 'react-native';

const getStyles = (isDarkMode) =>
    StyleSheet.create({
        orderTypeButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            color: isDarkMode ? '#FFF' : '#000',
        },
        orderTypeText: {
            fontSize: 14,
            color: isDarkMode ? '#AAA' : '#555',
            textAlign: 'center',
        },
        
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: isDarkMode ? '#121212' : '#F5F5F5', // Fondo dinámico
        },
        title: {
            fontWeight: 'bold',
            fontSize: 24,
            textAlign: 'center',
            marginVertical: 16,
            color: isDarkMode ? '#FFF' : '#000', // Dinámico para texto principal
        },
        orderTypeButton: {
            marginBottom: 10,
            paddingVertical: 10,
            borderRadius: 5,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#EDEDED', // Fondo dinámico del botón
            borderColor: isDarkMode ? '#444' : '#CCC', // Borde dinámico
            borderWidth: 1,
        },
        // orderTypeButtonText: {
        //     textAlign: 'center',
        //     fontSize: 16,
        //     color: isDarkMode ? '#FFF' : '#000', // Texto dinámico del botón
        //     fontWeight: 'bold',
        // },
        descriptionText: {
            fontSize: 14,
            color: isDarkMode ? '#B3B3B3' : '#333333', // Contraste suficiente en ambos modos
            marginBottom: 10,
        },
        button: {
            marginTop: 20,
            backgroundColor: isDarkMode ? '#BB86FC' : '#6200EE', // Dinámico para botón
        },
        buttonLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#000' : '#FFF', // Contraste dinámico
        },
        input: {
            marginBottom: 15,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF', // Fondo dinámico
            color: isDarkMode ? '#FFF' : '#000', // Texto en modo claro y oscuro
        },
        inputLabel: {
            color: isDarkMode ? '#BBB' : '#555', // Color de la etiqueta del campo
        },
        inputPlaceholder: {
            color: isDarkMode ? '#888' : '#777', // Placeholder dinámico
        },
        // orderTypeText: {
        //     fontSize: 18,
        //     textAlign: 'center',
        //     color: isDarkMode ? '#FFF' : '#000', // Contraste dinámico
        //     marginBottom: 5, // Espaciado inferior
        // },
        idexText: {
            fontSize: 14,
            textAlign: 'center',
            color: isDarkMode ? '#FFF' : '#000', // Contraste dinámico
            marginBottom: 5, // Espaciado inferior
            fontWeight: 'bold',
        },
        // Modal Styles
        modalContainer: {
            flex: 1,
            padding: 20,
            backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF', // Fondo dinámico del modal
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
            color: isDarkMode ? '#FFF' : '#000', // Dinámico para el título del modal
        },
        modalItem: {
            padding: 15,
            marginBottom: 10,
            borderRadius: 5,
            backgroundColor: isDarkMode ? '#2C2C2C' : '#F9F9F9', // Fondo dinámico del ítem
            borderColor: isDarkMode ? '#444' : '#CCC', // Borde dinámico
            borderWidth: 1,
        },
        modalItemText: {
            fontSize: 16,
            color: isDarkMode ? '#FFF' : '#000', // Texto dinámico del ítem
        },
        modalCloseButton: {
            marginTop: 10,
            borderColor: isDarkMode ? '#BBB' : '#6200EE', // Dinámico para el botón de cerrar
        },
        // Cliente Details Styles
        clientDetails: {
            marginTop: 10,
            padding: 10,
            borderRadius: 5,
            backgroundColor: isDarkMode ? '#2C2C2C' : '#F9F9F9', // Fondo dinámico
            borderColor: isDarkMode ? '#444' : '#CCC',
            borderWidth: 1,
        },
        clientDetailsText: {
            fontSize: 14,
            color: isDarkMode ? '#BBB' : '#333',
            marginBottom: 5,
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
        card: {
            marginVertical: 16,
            backgroundColor: isDarkMode ? '#222' : '#fff',
            borderRadius: 8,
            elevation: 4, // Sombra
        },
        cardButtonsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap', // Permite que los botones se muevan a la siguiente línea si no caben
        },
        cardButton: {
            margin: 8,
            flex: 1, // Ocupa el mismo espacio para todos los botones
        },
    });

export default getStyles;
