import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../../ThemeContext';

const ReporteDetailScreen = ({ route }) => {
    const { reporte } = route.params;
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
            <View style={styles.flexContainer}>
                <Text style={styles.reporteTitle}>{reporte.titulo}</Text>
                <Text style={styles.reporteFecha}>{reporte.fecha}</Text>
                <Text style={styles.reporteDescripcion}>{reporte.descripcion}</Text>
                {/* Aquí puedes agregar más detalles específicos del reporte */}
                <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Detalle del Reporte</Text>
                    <Text style={styles.detailText}>
                        Aquí puedes agregar más detalles específicos sobre el reporte, como gráficos, tablas, y desgloses.
                    </Text>
                    {/* Ejemplo de desglose */}
                    <Text style={styles.detailText}>Cuenta 1: $10,000</Text>
                    <Text style={styles.detailText}>Cuenta 2: $5,000</Text>
                    <Text style={styles.detailText}>Cuenta 3: $7,000</Text>
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
    reporteTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? 'white' : 'black',
        marginVertical: 10,
    },
    reporteFecha: {
        fontSize: 18,
        color: isDarkMode ? '#e5e5e5' : '#333',
        marginBottom: 20,
    },
    reporteDescripcion: {
        fontSize: 16,
        color: isDarkMode ? '#e5e5e5' : '#333',
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

export default ReporteDetailScreen;
