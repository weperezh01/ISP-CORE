import { StyleSheet } from 'react-native';

const DetalleCicloScreenStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    lightContainer: {
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flexGrow: 1,
        padding: 16,
    },
    card: {
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    darkCard: {
        backgroundColor: '#1e1e1e',
    },
    lightCard: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardContent: {
        marginBottom: 20,
    },
    cardDetail: {
        fontSize: 16,
        marginBottom: 5,
    },
    darkText: {
        color: '#e5e5e5',
    },
    lightText: {
        color: '#333333',
    },
    detailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    input2: {
        borderWidth: 1,
        borderRadius: 5,
        padding: 8,
        width: 100,
        textAlign: 'center',
    },
    darkInput: {
        borderColor: '#e5e5e5',
        color: '#e5e5e5',
    },
    lightInput: {
        borderColor: '#333333',
        color: '#333333',
    },
    button: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    darkButton: {
        backgroundColor: '#444444',
    },
    lightButton: {
        backgroundColor: '#007bff',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        margin: 10,
    },
    buttonBottom: {
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        marginVertical: 8,
    },
    darkButtonBottom: {
        backgroundColor: '#444444',
    },
    lightButtonBottom: {
        backgroundColor: '#007bff',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '80%',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    darkModalView: {
        backgroundColor: '#333333',
        borderColor: '#888888',
    },
    lightModalView: {
        backgroundColor: '#ffffff',
        borderColor: '#cccccc',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});

export default DetalleCicloScreenStyles;
