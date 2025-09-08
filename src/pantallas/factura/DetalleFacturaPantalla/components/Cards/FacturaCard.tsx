import React from 'react';
import { View, Text } from 'react-native';
import { calcularSubtotal, formatMoney } from '../../utils';

const FacturaCard = ({ facturaData, styles }) => {
    const subtotal = calcularSubtotal(facturaData);
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Factura:</Text>
            <Text>Subtotal: {formatMoney(subtotal)}</Text>
        </View>
    );
};

export default FacturaCard;
