import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput, FlatList } from 'react-native';
import { useTheme } from '../../../../../ThemeContext';
import { useNavigation } from '@react-navigation/native';

const TransaccionesScreen = () => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchTransacciones();
    }, []);

    const fetchTransacciones = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com/api/contabilidad/transacciones');
            const data = await response.json();
            setTransacciones(data.sort((a, b) => b.id - a.id));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching transacciones:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`https://wellnet-rd.com/api/contabilidad/transacciones/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Alert.alert('Éxito', 'Transacción eliminada correctamente');
                fetchTransacciones();
            } else {
                Alert.alert('Error', 'No se pudo eliminar la transacción');
            }
        } catch (error) {
            console.error('Error al eliminar la transacción:', error);
            Alert.alert('Error', 'Hubo un problema al eliminar la transacción');
        }
    };

    const confirmDelete = (id) => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro de que deseas eliminar esta transacción?',
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

    const formatCurrency = (value) => {
        if (!value) return '';
        const number = parseFloat(value);
        return `RD$ ${number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    };

    const filteredTransacciones = transacciones.filter((transaccion) => {
        const searchLower = searchText.toLowerCase();
        return (
            transaccion.id.toString().includes(searchLower) ||
            transaccion.descripcion.toLowerCase().includes(searchLower) ||
            transaccion.cuenta_debito_codigo.toLowerCase().includes(searchLower) ||
            transaccion.cuenta_credito_codigo.toLowerCase().includes(searchLower) ||
            transaccion.monto.toString().includes(searchLower)
        );
    });

    const renderTransaccion = ({ item: transaccion }) => (
        <View key={transaccion.id} style={styles.transaccionCard}>
            <View style={styles.transaccionInfo}>
                <Text style={styles.transaccionId}>ID: {transaccion.id}</Text>
                <Text style={styles.transaccionDescripcion}>{transaccion.descripcion}</Text>
                <Text style={styles.transaccionMonto}>{formatCurrency(transaccion.monto)}</Text>
                <Text style={styles.cuentaText}>Cuenta Débito: {transaccion.cuenta_debito_codigo} - {transaccion.cuenta_debito_nombre}</Text>
                <Text style={styles.cuentaText}>Cuenta Crédito: {transaccion.cuenta_credito_codigo} - {transaccion.cuenta_credito_nombre}</Text>
            </View>
            <View style={styles.transaccionActions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('InsertarTransaccionScreen', { transaccion })}
                >
                    <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(transaccion.id)}
                >
                    <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.cardTitle}>Libro Diario</Text>
            </View>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por ID, descripción, cuenta o monto"
                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                value={searchText}
                onChangeText={setSearchText}
            />
            {loading ? (
                <Text style={styles.loadingText}>Cargando...</Text>
            ) : (
                <FlatList
                    data={filteredTransacciones}
                    renderItem={renderTransaccion}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                />
            )}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('InsertarTransaccionScreen')}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    list: {
        padding: 16,
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        padding: 8,
        borderRadius: 4,
        backgroundColor: isDarkMode ? '#333' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
    },
    transaccionCard: {
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
    transaccionInfo: {
        flex: 1,
    },
    transaccionId: {
        fontSize: 14,
        color: isDarkMode ? '#e5e5e5' : '#333',
        marginBottom: 5,
    },
    transaccionDescripcion: {
        fontSize: 20,
        fontWeight: 'bold',
        color: isDarkMode ? 'white' : 'black',
    },
    transaccionMonto: {
        fontSize: 16,
        color: isDarkMode ? '#e5e5e5' : '#333',
        marginTop: 5,
    },
    cuentaText: {
        fontSize: 14,
        color: isDarkMode ? '#e5e5e5' : '#333',
        marginTop: 5,
    },
    transaccionActions: {
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
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#28a745',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
    },
    fabText: {
        color: '#FFF',
        fontSize: 30,
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        color: isDarkMode ? '#FFF' : '#000',
    },
});

export default TransaccionesScreen;
