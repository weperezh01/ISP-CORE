import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    lightContainer: {
        backgroundColor: '#FFFFFF',
    },
    itemContainer: {
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    darkItemContainer: {
        backgroundColor: '#333333',
    },
    lightItemContainer: {
        backgroundColor: '#f9f9f9',
    },
    itemName: {
        fontSize: 18,
    },
    darkText: {
        color: '#FFFFFF',
    },
    lightText: {
        color: '#000000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    editButton: {
        padding: 10,
        borderRadius: 5,
    },
    darkEditButton: {
        backgroundColor: '#03DAC5',
    },
    lightEditButton: {
        backgroundColor: '#6200EE',
    },
    deleteButton: {
        padding: 10,
        borderRadius: 5,
    },
    darkDeleteButton: {
        backgroundColor: '#B00020',
    },
    lightDeleteButton: {
        backgroundColor: '#E57373',
    },

    // Estilos adicionales para el Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo semitransparente para destacar el modal
    },
    modalContainer: {
        width: '90%',
        padding: 20,
        borderRadius: 10,
    },
    darkModalContainer: {
        backgroundColor: '#333333', // Mismo color que el contenedor oscuro de los ítems
    },
    lightModalContainer: {
        backgroundColor: '#FFFFFF', // Mismo color que el contenedor claro
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
        borderWidth: 1,
    },
    darkInput: {
        backgroundColor: '#444',
        color: '#FFF',
        borderColor: '#555',
    },
    lightInput: {
        backgroundColor: '#f0f0f0',
        color: '#000',
        borderColor: '#ccc',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        padding: 15,
        borderRadius: 8,
        marginHorizontal: 5,
        marginVertical: 10,
    },
    darkButton: {
        backgroundColor: '#6200EE', // Usamos el mismo color del botón del modo oscuro para mantener consistencia
    },
    lightButton: {
        backgroundColor: '#6200EE', // Usamos el mismo color del botón claro para mantener consistencia
    },
    buttonText: {
        color: '#FFFFFF',
        textAlign: 'center',
    },
});

export default styles;
