import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../../ThemeContext';

const EstadoResultadosScreen = () => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [estadoResultados, setEstadoResultados] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEstadoResultados();
    }, []);

    const fetchEstadoResultados = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com/api/contabilidad/estado-resultados');
            const data = await response.json();
            setEstadoResultados(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching estado resultados:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
            <Text style={styles.cardTitle}>Estado de Resultados</Text>
            {estadoResultados ? (
                <View style={styles.resultadosContainer}>
                    <Text style={styles.sectionTitle}>Ingresos</Text>
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemTitle}>Total Ingresos</Text>
                        <Text style={styles.itemValue}>{formatCurrency(estadoResultados.total_ingresos)}</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Gastos</Text>
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemTitle}>Total Gastos</Text>
                        <Text style={styles.itemValue}>{formatCurrency(estadoResultados.total_gastos)}</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Resultado Neto</Text>
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemTitle}>Resultado Neto</Text>
                        <Text style={styles.itemValue}>{formatCurrency(estadoResultados.resultado_neto)}</Text>
                    </View>
                </View>
            ) : (
                <Text style={styles.noDataText}>No hay datos disponibles.</Text>
            )}
        </ScrollView>
    );
};

const formatCurrency = (value) => {
    if (!value) return '';
    const number = parseFloat(value);
    return `RD$ ${number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

const getStyles = (isDarkMode) => StyleSheet.create({
    scrollViewContentContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    resultadosContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginTop: 20,
        marginBottom: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomColor: isDarkMode ? '#444' : '#ccc',
        borderBottomWidth: 1,
    },
    itemTitle: {
        fontSize: 16,
        color: isDarkMode ? '#e5e5e5' : '#333',
    },
    itemValue: {
        fontSize: 16,
        color: isDarkMode ? '#e5e5e5' : '#333',
    },
    noDataText: {
        fontSize: 18,
        color: isDarkMode ? '#e5e5e5' : '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
    },
    loadingText: {
        fontSize: 18,
        color: isDarkMode ? '#FFF' : '#000',
    },
});

export default EstadoResultadosScreen;
