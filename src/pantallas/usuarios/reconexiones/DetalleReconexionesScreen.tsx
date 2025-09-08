import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../ThemeContext';

const DetalleReconexionesScreen = ({ route, navigation }) => {
    const { dia, userId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [reconexiones, setReconexiones] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const secondsStr = seconds < 10 ? '0' + seconds : seconds;
        return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
    };

    useEffect(() => {
        const fetchReconexionesPorDia = async () => {
            try {
                const formattedDate = new Date(dia).toISOString().split('T')[0];
        
                const response = await fetch('https://wellnet-rd.com/api/usuarios/reconexiones-usuario-por-dia-especifico', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_usuario: userId, dia: formattedDate }), 
                });
        
                const text = await response.text();
                console.log('Respuesta del servidor:', text);
        
                const data = JSON.parse(text);
                if (response.ok) {
                    setReconexiones(data.reverse());  // Invertir el orden de la lista
                } else {
                    throw new Error(data.message || 'Error al obtener las reconexiones del día');
                }
            } catch (error) {
                console.error('Error al obtener las reconexiones del día:', error);
                Alert.alert('Error', error.message || 'Error al obtener las reconexiones del día.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchReconexionesPorDia();
    }, [dia, userId]);

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.itemContainer} 
            onPress={() => navigation.navigate('ConexionDetalles', { connectionId: item.id_conexion })}
        >
            <Text style={styles.itemDetail}>Cliente: {item.conexion?.cliente?.nombres} {item.conexion?.cliente?.apellidos}</Text>
            <Text style={styles.itemDetail}>Dirección: {item.conexion?.direccion}</Text>
            <Text style={styles.itemDetail}>Dirección IP: {item.conexion?.direccion_ipv4}</Text>
            <Text style={styles.itemDetail}>Mensaje: {item.mensaje}</Text>
            <Text style={styles.itemDetail}>Fecha: {formatDate(item.fecha)}</Text>
            <Text style={styles.itemDetail}>Hora: {formatTime(item.fecha)}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reconexiones del día:</Text>
            <Text style={styles.title}>{formatDate(dia)}</Text> 
            {loading ? (
                <Text style={styles.loadingText}>Cargando reconexiones...</Text>
            ) : (
                <FlatList
                    data={reconexiones}
                    keyExtractor={(item) => item.id_log.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>No hay reconexiones registradas para este día.</Text>}
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
    itemDetail: {
        fontSize: 16,
        color: isDarkMode ? '#FFF' : '#000',
    },
});

export default DetalleReconexionesScreen;
