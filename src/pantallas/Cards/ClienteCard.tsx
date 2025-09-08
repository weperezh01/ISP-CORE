import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';

const ClienteCard = ({ facturaData, styles, formatPhoneNumber }) => (
    <Card style={styles.cardStyle}>
        <Card.Title title={`Información del Cliente`} titleStyle={styles.header} />
        <Card.Content>
            <Text style={styles.text}>ID Cliente: {facturaData?.cliente?.id_cliente}</Text>
            <Text style={styles.text}>Nombre Completo: {facturaData?.cliente?.nombres.trim()} {facturaData?.cliente?.apellidos.trim()}</Text>
            <Text style={styles.text}>Teléfonos: {formatPhoneNumber(facturaData?.cliente?.telefono1)}, {facturaData?.cliente?.telefono2 ? formatPhoneNumber(facturaData?.cliente?.telefono2) : 'N/A'}</Text>
            <Text style={styles.text}>Dirección: {facturaData?.cliente?.direccion}</Text>
            <Text style={styles.text}>Correo Electrónico: {facturaData?.cliente?.correo_elect || 'N/A'}</Text>
            <Text style={styles.text}>Cédula/RNC: {facturaData?.cliente?.cedula || facturaData?.cliente?.rnc || 'N/A'}</Text>
            <Text style={styles.text}>
                Cliente desde: {facturaData?.cliente?.fecha_creacion_cliente
                    ? new Date(facturaData.cliente.fecha_creacion_cliente).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : 'N/A'}
            </Text>
        </Card.Content>
    </Card>
);

export default ClienteCard;
