import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';

const FacturaCard = ({ facturaData, styles }) => (
    <Card style={styles.card}>
        <Card.Title title="Detalles de la Factura" titleStyle={styles.header} />
        <Card.Content>
            <Text style={styles.text}>Número de Factura: {facturaData.numeroFactura}</Text>
            <Text style={styles.text}>Fecha de Emisión: {facturaData.fechaEmision}</Text>
            <Text style={styles.text}>Monto Total: {facturaData.montoTotal}</Text>
            <Text style={styles.text}>Estado: {facturaData.estado}</Text>
        </Card.Content>
    </Card>
);

export default FacturaCard;
