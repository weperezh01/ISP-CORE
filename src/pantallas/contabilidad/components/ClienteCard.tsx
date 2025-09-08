import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';

const ClienteCard = ({ clienteData, styles }) => (
    <Card style={styles.card}>
        <Card.Title title="Información del Cliente" titleStyle={styles.header} />
        <Card.Content>
            <Text style={styles.text}>Nombre: {clienteData.nombre}</Text>
            <Text style={styles.text}>Cédula/RNC: {clienteData.cedula || clienteData.rnc}</Text>
            <Text style={styles.text}>Teléfono: {clienteData.telefono}</Text>
            <Text style={styles.text}>Correo: {clienteData.correo}</Text>
            <Text style={styles.text}>Dirección: {clienteData.direccion}</Text>
        </Card.Content>
    </Card>
);

export default ClienteCard;
