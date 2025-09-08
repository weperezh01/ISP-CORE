import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../utils/api';
import styles from './styles';

const EstadoResultadosScreen2 = () => {
    const [estadoResultados, setEstadoResultados] = useState({
        ingresos: [],
        gastos: [],
        utilidad: 0,
    });

    useEffect(() => {
        const fetchEstadoResultados = async () => {
            try {
                const data = await api.get('/reportes/estado-resultados');
                setEstadoResultados(data);
            } catch (error) {
                console.error('Error fetching estado de resultados:', error);
            }
        };

        fetchEstadoResultados();
    }, []);

    const renderSection = (title, data) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.cell}>{item.nombre}</Text>
                        <Text style={styles.cell}>{formatCurrency(item.monto)}</Text>
                    </View>
                )}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Estado de Resultados</Text>
            {renderSection('Ingresos', estadoResultados.ingresos)}
            {renderSection('Gastos', estadoResultados.gastos)}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Utilidad Neta</Text>
                <Text style={styles.cell}>{formatCurrency(estadoResultados.utilidad)}</Text>
            </View>
        </View>
    );
};

export default EstadoResultadosScreen2;
