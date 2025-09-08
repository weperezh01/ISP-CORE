import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';

const ConnectionItem = ({ item, styles, navigation }) => (
    <View style={styles.itemContainer}>
        <TouchableOpacity
            onPress={() => navigation.navigate('ConexionDetalles', { connectionId: item.id_conexion, id_cliente: item.cliente.id_cliente })}
        >
            <Text style={styles.itemName}>ID Conexión: {item.id_conexion}</Text>
            <Text style={styles.itemDetails}>Dirección: {item.direccion || 'No disponible'}</Text>
            <Text style={styles.itemDetails}>
                Cliente: {item.cliente ? `${item.cliente.nombres} ${item.cliente.apellidos}` : 'No asociado'}
            </Text>
            <Text style={styles.itemDetails}>IP: {item.direccion_ipv4 || 'No asignada'}</Text>
            <Text style={styles.itemDetails}>
                Estado: {item.estado_conexion ? item.estado_conexion.estado : 'No disponible'}
            </Text>
            <Text style={styles.itemDetails}>
                Descripción del Estado: {item.estado_conexion ? item.estado_conexion.descripcion : 'No disponible'}
            </Text>
            <Text style={styles.itemDetails}>
                Velocidad: {item.velocidad ? `${item.velocidad} Mbps` : 'No disponible'}
            </Text>
            <Text style={styles.itemDetails}>Instalación: {formatCurrency(item.precio)}</Text>
            <Text style={styles.itemDetails}>
                Servicio: {item.servicio ? item.servicio.nombre_servicio : 'No asignado'}
            </Text>
            <Text style={styles.itemDetails}>
                Precio Mensual: {item.servicio ? formatCurrency(item.servicio.precio_servicio) : 'No asignado'}
            </Text>
            <Text style={styles.itemDetails}>
                Día de Facturación: {item.ciclo_base ? item.ciclo_base.dia_mes : 'No asignado'}
            </Text>
            <Text style={styles.itemDetails}>
                Ciclo Base Detalle: {item.ciclo_base ? item.ciclo_base.detalle : 'No disponible'}
            </Text>
        </TouchableOpacity>
    </View>
);

export default ConnectionItem;
