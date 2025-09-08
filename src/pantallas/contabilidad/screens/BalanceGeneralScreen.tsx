import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../../ThemeContext';

const BalanceGeneralScreen2 = () => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [balanceGeneral, setBalanceGeneral] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBalanceGeneral();
    }, []);

    const fetchBalanceGeneral = async () => {
        try {
            const response = await fetch('https://wellnet-rd.com/api/contabilidad/balance-general');
            const data = await response.json();
            setBalanceGeneral(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching balance general:', error);
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
            <Text style={styles.cardTitle}>Balance General</Text>
            {balanceGeneral ? (
                <View style={styles.balanceContainer}>
                    <Text style={styles.sectionTitle}>Activos</Text>
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemTitle}>Total Activos</Text>
                        <Text style={styles.itemValue}>{formatCurrency(balanceGeneral.total_activos)}</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Pasivos</Text>
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemTitle}>Total Pasivos</Text>
                        <Text style={styles.itemValue}>{formatCurrency(balanceGeneral.total_pasivos)}</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Patrimonio</Text>
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemTitle}>Total Patrimonio</Text>
                        <Text style={styles.itemValue}>{formatCurrency(balanceGeneral.total_patrimonio)}</Text>
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
    balanceContainer: {
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

export default BalanceGeneralScreen2;
