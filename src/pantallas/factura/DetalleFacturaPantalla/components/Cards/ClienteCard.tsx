import React from 'react';
import { View, Text } from 'react-native';

const ClienteCard = ({ facturaData, styles }) => {
    const cliente = facturaData?.cliente || {};
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Cliente:</Text>
            <Text>{cliente.nombres} {cliente.apellidos}</Text>
            <Text>{cliente.direccion}</Text>
        </View>
    );
};

export default ClienteCard;
