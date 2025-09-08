import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../../ThemeContext';
import ThemeSwitch from '../../componentes/themeSwitch';
import { getStyles } from '../../estilos/styles';

const Recibos1ClienteScreen = ({ route, navigation }) => {
    const { clientId, id_ciclo, usuarioId, ispId } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [recibos, setRecibos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecibos();
        registrarNavegacion();
    }, []);

    const registrarNavegacion = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Retardo asíncrono de 2 segundos
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS
        const pantalla = 'Recibos1ClienteScreen';

        const datos = JSON.stringify({ clientId, id_ciclo });

        const navigationLogData = {
            id_usuario: usuarioId, // Puedes usar el ID del cliente o del usuario según lo necesites
            fecha,
            hora,
            pantalla,
            datos
        };

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(navigationLogData),
            });

            if (!response.ok) {
                throw new Error('Error al registrar la navegación.');
            }

            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    const fetchRecibos = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/recibos-1cliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_cliente: clientId, id_ciclo })
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch recibos');
            }
    
            const data = await response.json();
            const reversedData = data.reverse(); // Invertir el orden de los recibos
            setRecibos(reversedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching recibos:', error);
            setLoading(false);
        }
    };
    

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('ReciboScreen', { reciboData: { id_recibo: item.id_recibo, id_cliente: clientId }, isDarkMode, id_isp: ispId })}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Recibo #{item.id_recibo}</Text>
                <Text style={styles.cardDetail}>Monto: {formatCurrency(item.monto)}</Text>
                <Text style={styles.cardDetail}>Fecha: {formatDate(item.fecha)}</Text>
                {/* Mostrar nombre y ID del usuario */}
                {item.usuario && (
                    <>
                        <Text style={styles.cardDetail}>Usuario: {item.id_usuario} {item.usuario.nombre} {item.usuario.apellido}</Text>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );

    const RecibosHeader = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Recibos del Cliente</Text>
            <ThemeSwitch />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Cargando recibos...</Text>
            </View>
        );
    }

    return (
        <>
            <View style={styles.container}>
                <FlatList
                    data={recibos}
                    ListHeaderComponent={RecibosHeader}
                    keyExtractor={item => item.id_recibo.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
                <BottomButtons clientId={clientId} id_ciclo={id_ciclo} />
            </View>
        </>
    );
};

const BottomButtons = ({ clientId, id_ciclo }) => {
    const { isDarkMode } = useTheme();

    const buttonStyle = {
        backgroundColor: '#007bff',
        flex: 1,
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        margin: 8,
        minWidth: '40%',
    };

    const containerStyle = {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#444' : '#ddd',
        backgroundColor: isDarkMode ? '#333' : '#f4f4f4',
    };

    // Agrega los botones que necesites aquí

    return <View style={containerStyle}></View>;
};

export default Recibos1ClienteScreen;
