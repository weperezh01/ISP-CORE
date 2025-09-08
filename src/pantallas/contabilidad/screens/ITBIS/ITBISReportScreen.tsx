import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../utils/api';
import styles from './styles';

const ITBISReportScreen = () => {
    const navigation = useNavigation();
    const [reportes, setReportes] = React.useState([]);

    React.useEffect(() => {
        const fetchITBIS = async () => {
            try {
                const data = await api.get('/itbis/reporte');
                setReportes(data);
            } catch (error) {
                console.error('Error fetching ITBIS reports:', error);
            }
        };

        fetchITBIS();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.fecha}</Text>
            <Text style={styles.cell}>{formatCurrency(item.total)}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Reporte de ITBIS</Text>
            <FlatList
                data={reportes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay datos disponibles</Text>}
            />
            {/* Botón para acceder a ITBISFormScreen */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('ITBISFormScreen')}
            >
                <Text style={styles.addButtonText}>Agregar ITBIS</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ITBISReportScreen;
