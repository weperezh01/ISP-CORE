import React from 'react';
import { Text } from 'react-native';
import { Card } from 'react-native-paper';

const ConexionCard = ({ conexionData, styles }) => (
    <Card style={styles.cardStyle}>
        <Card.Title title="Detalles de la Conexión" titleStyle={styles.header} />
        <Card.Content>
            <Text style={styles.text}>ID Conexión: {conexionData?.id_conexion}</Text>
            <Text style={styles.text}>Dirección de Instalación: {conexionData?.direccion}</Text>
            <Text style={styles.text}>Referencia: {conexionData?.referencia || 'N/A'}</Text>
            <Text style={styles.text}>Estado: {conexionData?.estado_conexion}</Text>
            <Text style={styles.text}>
                Fecha de Contratación: {conexionData?.fecha_contratacion
                    ? new Date(conexionData.fecha_contratacion).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : 'N/A'}
            </Text>
        </Card.Content>
    </Card>
);

export default ConexionCard;
