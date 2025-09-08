import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../../../../ThemeContext';
import { useNavigation } from '@react-navigation/native';

const PlanDeCuentasScreen = () => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const fabStyles = getFabStyles(isDarkMode);
    const navigation = useNavigation();
    const [planDeCuentas, setPlanDeCuentas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlanDeCuentas();
    }, []);

    const fetchPlanDeCuentas = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com/api/contabilidad/cuentas');
            const data = await response.json();
            setPlanDeCuentas(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching plan de cuentas:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`https://wellnet-rd.com/api/contabilidad/cuentas/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Alert.alert('Éxito', 'Cuenta eliminada correctamente');
                fetchPlanDeCuentas();
            } else {
                Alert.alert('Error', 'No se pudo eliminar la cuenta');
            }
        } catch (error) {
            console.error('Error al eliminar la cuenta:', error);
            Alert.alert('Error', 'Hubo un problema al eliminar la cuenta');
        }
    };

    const confirmDelete = (id) => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro de que deseas eliminar esta cuenta?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    onPress: () => handleDelete(id),
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    const renderCuenta = (cuenta) => (
        <View key={cuenta.id} style={styles.cuentaCard}>
            <View style={styles.cuentaInfo}>
                <Text style={styles.cuentaCodigo}>{cuenta.codigo}</Text>
                <Text style={styles.cuentaDescripcion}>{cuenta.nombre}</Text>
            </View>
            <View style={styles.cuentaActions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('CuentaFormScreen', { cuenta })}
                >
                    <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(cuenta.id)}
                >
                    <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.flexContainer}>
            <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
                <Text style={styles.cardTitle}>Plan de Cuentas</Text>
                <View style={styles.cuentasContainer}>
                    {loading ? (
                        <Text style={styles.loadingText}>Cargando...</Text>
                    ) : (
                        planDeCuentas.map((cuenta) => renderCuenta(cuenta))
                    )}
                </View>
            </ScrollView>
            <TouchableOpacity style={fabStyles.fab} onPress={() => navigation.navigate('CuentaFormScreen')}>
                <Text style={fabStyles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
    },
    scrollViewContentContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        padding: 16,
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    cuentasContainer: {
        paddingBottom: 80, // Espacio para el botón flotante
    },
    cuentaCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#1c1c1e' : '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cuentaInfo: {
        flex: 1,
    },
    cuentaCodigo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: isDarkMode ? 'white' : 'black',
    },
    cuentaDescripcion: {
        fontSize: 16,
        color: isDarkMode ? '#e5e5e5' : '#333',
        marginTop: 5,
    },
    cuentaActions: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    editButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: isDarkMode ? '#e5e5e5' : '#333',
        textAlign: 'center',
        marginTop: 20,
    },
});

const getFabStyles = (isDarkMode) => StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: isDarkMode ? '#444' : '#03A9F4',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
    },
    fabText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default PlanDeCuentasScreen;
