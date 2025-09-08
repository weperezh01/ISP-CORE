import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../utils/api';
import styles from './styles';

const NCFReportScreen = () => {
    const [reportes, setReportes] = useState([]);

    useEffect(() => {
        const fetchNCFReports = async () => {
            try {
                const data = await api.get('/ncf/reporte');
                setReportes(data);
            } catch (error) {
                console.error('Error fetching NCF reports:', error);
            }
        };

        fetchNCFReports();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.tipo}</Text>
            <Text style={styles.cell}>{item.fecha}</Text>
            <Text style={styles.cell}>{formatCurrency(item.total)}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Reporte de NCF</Text>
            <FlatList
                data={reportes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No hay datos disponibles</Text>}
            />
        </View>
    );
};

export default NCFReportScreen;
