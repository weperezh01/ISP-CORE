import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../ThemeContext';

const DetalleWhatsAppScreen = ({ route, navigation }) => {
    const { dia, userId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [whatsapps, setWhatsapps] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para formatear la fecha en "D de Mes del AAAA"
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

    // Función para formatear la hora en formato 12 horas con segundos
    const formatTime = (timeString) => {
        const [hour, minute, second] = timeString.split(':');
        let hour12 = hour % 12 || 12;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minute}:${second} ${ampm}`;
    };

    useEffect(() => {
        const fetchWhatsAppPorDia = async () => {
            try {
                const formattedDate = new Date(dia).toISOString().split('T')[0];
        
                const response = await fetch('https://wellnet-rd.com/api/usuarios/whatsapp-usuario-por-dia-especifico', { 
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
                    const whatsappInvertidas = data.reverse();
                    setWhatsapps(whatsappInvertidas);
                } else {
                    throw new Error(data.message || 'Error al obtener los intentos de WhatsApp del día');
                }
            } catch (error) {
                console.error('Error al obtener los intentos de WhatsApp del día:', error);
                Alert.alert('Error', error.message || 'Error al obtener los intentos de WhatsApp del día.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchWhatsAppPorDia();
    }, [dia, userId]);

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.itemContainer} 
            onPress={() => navigation.navigate('ClientDetailsScreen', { clientId: item.id_cliente })}
        >
            <Text style={styles.itemDetail}>Cliente ID: {item.id_cliente}</Text>
            <Text style={styles.itemDetail}>Nombre: {item.cliente?.nombres} {item.cliente?.apellidos}</Text>
            <Text style={styles.itemDetail}>Teléfono: {item.cliente?.telefono1}</Text>
            <Text style={styles.itemDetail}>Hora: {formatTime(item.hora)}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Intentos de WhatsApp del día:</Text>
            <Text style={styles.title}>{formatDate(dia)}</Text> 
            {loading ? (
                <Text style={styles.loadingText}>Cargando intentos...</Text>
            ) : (
                <FlatList
                    data={whatsapps}
                    keyExtractor={(item) => item.usuario_whatsapp_intento_id.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>No hay intentos de WhatsApp registrados para este día.</Text>}
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

export default DetalleWhatsAppScreen;
