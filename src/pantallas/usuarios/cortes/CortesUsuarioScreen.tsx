import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { useNavigation } from '@react-navigation/native';

const CortesUsuarioScreen = ({ route }) => {
    const { userId, userName } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [cortes, setCortes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCortesUsuario = async () => {
            try {
                const response = await fetch('https://wellnet-rd.com/api/usuarios/cortes-usuario-por-dia', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_usuario: userId }),
                });

                const text = await response.text();
                console.log('Respuesta del servidor:', text);

                const data = JSON.parse(text);
                if (response.ok) {
                    setCortes(data);
                } else {
                    throw new Error(data.message || 'Error al obtener los cortes del usuario');
                }
            } catch (error) {
                console.error('Error al obtener los cortes del usuario:', error);
                Alert.alert('Error', error.message || 'Error al obtener los cortes del usuario.');
            } finally {
                setLoading(false);
            }
        };

        fetchCortesUsuario();
    }, [userId]);

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const day = date.getDate();
        const monthNames = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} de ${month} del ${year}`;
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('DetalleCortesScreen', { dia: item.dia, userId })}
        >
            <Text style={styles.itemDate}>{formatDate(item.dia)}</Text>
            <Text style={styles.itemDetail}>Cortes realizados: {item.totalCortes}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cortes de servicios del usuario</Text>
            {loading ? (
                <Text style={styles.loadingText}>Cargando cortes...</Text>
            ) : (
                <FlatList
                    data={cortes}
                    keyExtractor={(item) => item.dia.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>No hay cortes registrados.</Text>}
                />

            )}
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? '#FFF' : '#000',
        marginBottom: 16,
    },
    loadingText: {
        fontSize: 18,
        color: isDarkMode ? '#FFF' : '#000',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: isDarkMode ? '#FFF' : '#000',
        textAlign: 'center',
    },
    itemContainer: {
        padding: 16,
        backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
        marginBottom: 10,
        borderRadius: 8,
    },
    itemDate: {
        fontSize: 16,
        color: isDarkMode ? '#FFF' : '#000',
        marginBottom: 8,
    },
    itemDetail: {
        fontSize: 16,
        color: isDarkMode ? '#FFF' : '#000',
    },
});

export default CortesUsuarioScreen;
