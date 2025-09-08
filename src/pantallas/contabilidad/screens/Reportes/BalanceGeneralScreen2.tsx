import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../utils/api';
import styles from './styles';

const BalanceGeneralScreen2 = () => {
    const [balance, setBalance] = useState({
        activos: [],
        pasivos: [],
        patrimonio: [],
    });

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const data = await api.get('/reportes/balance-general');
                setBalance(data);
            } catch (error) {
                console.error('Error fetching balance general:', error);
            }
        };

        fetchBalance();
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
            <Text style={styles.header}>Balance General</Text>
            {renderSection('Activos', balance.activos)}
            {renderSection('Pasivos', balance.pasivos)}
            {renderSection('Patrimonio', balance.patrimonio)}
        </View>
    );
};

export default BalanceGeneralScreen2;
