import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../../ThemeContext';

const FacturasParaMiScreen = () => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacturas = async () => {
            try {
                const response = await fetch('https://wellnet-rd.com:444/api/facturas-para-mi', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudo obtener las facturas.`);
                }

                const data = await response.json();
                setFacturas(data);
            } catch (error) {
                console.error('❌ Error al obtener las facturas:', error);
                Alert.alert('Error', 'No se pudo obtener la lista de facturas.');
            } finally {
                setLoading(false);
            }
        };

        fetchFacturas();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>Factura: {item.numero_factura}</Text>
            <Text style={styles.itemDetails}>Fecha: {item.fecha}</Text>
            <Text style={styles.itemDetails}>Total: ${item.total}</Text>
            <Text style={styles.itemDetails}>Estado: {item.estado}</Text>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color={isDarkMode ? '#FFF' : '#000'} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Facturas para mí</Text>
            <FlatList
                data={facturas}
                keyExtractor={(item) => item.id_factura.toString()}
                renderItem={renderItem}
            />
        </View>
    );
};

const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#121212' : '#FFF',
            padding: 16,
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            color: isDarkMode ? '#FFF' : '#000',
            marginBottom: 10,
        },
        itemContainer: {
            backgroundColor: isDarkMode ? '#1C1C1E' : '#F5F5F5',
            padding: 16,
            borderRadius: 8,
            marginBottom: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 2,
        },
        itemTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#FFF' : '#000',
        },
        itemDetails: {
            fontSize: 16,
            color: isDarkMode ? '#DDD' : '#555',
        },
    });

export default FacturasParaMiScreen;
