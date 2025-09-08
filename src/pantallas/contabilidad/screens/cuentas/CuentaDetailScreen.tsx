import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../ThemeContext';

const CuentaDetailScreen = ({ route }) => {
    const { cuenta } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
            <View style={styles.flexContainer}>
                {/* <Text style={styles.cuentaCodigo}>{cuenta.codigo}</Text> */}
                <Text style={styles.cuentaDescripcion}>{cuenta.descripcion}</Text>
                <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Detalle de la Cuenta</Text>
                    <Text style={styles.detailText}>
                        Aquí puedes agregar más detalles específicos sobre la cuenta, como transacciones relacionadas, gráficos, y análisis.
                    </Text>
                    {/* Ejemplo de transacciones */}
                    <Text style={styles.detailText}>Transacción 1: $1,000</Text>
                    <Text style={styles.detailText}>Transacción 2: $500</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    scrollViewContentContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
    },
    cuentaCodigo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? 'white' : 'black',
        marginVertical: 10,
    },
    cuentaDescripcion: {
        fontSize: 18,
        color: isDarkMode ? '#e5e5e5' : '#333',
        marginBottom: 20,
    },
    detailSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: isDarkMode ? 'white' : 'black',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 16,
        color: isDarkMode ? '#e5e5e5' : '#333',
        marginBottom: 5,
    },
});

export default CuentaDetailScreen;
