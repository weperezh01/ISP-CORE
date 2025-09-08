import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';

const FacturaCard = ({ facturaData, isDarkMode, styles, formatMoney }) => {
    const subtotal = facturaData?.articulos?.reduce((acc, item) => acc + (item.cantidad_articulo * item.precio_unitario), 0) || 0;
    const descuento = facturaData?.factura?.descuento || 0;
    const itbis = facturaData?.factura?.itbis || 0;
    const montoTotal = facturaData?.factura?.monto_total || 0;

    return (
        <Card style={[styles.cardStyle, { backgroundColor: isDarkMode ? '#1c1c1c' : '#fff' }]}> 
            <Card.Title
                title={`Factura #${facturaData?.factura?.id_factura}`}
                titleStyle={[styles.header, { color: isDarkMode ? '#fff' : '#000' }]}
            />
            <Card.Content>
                <View style={styles.facturaDetails}>
                    <Text style={[styles.text, { color: isDarkMode ? '#ddd' : '#333' }]}>Fecha de Emisión: {facturaData?.factura?.fecha_emision
                        ? new Date(facturaData.factura.fecha_emision).toLocaleDateString("es-DO", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })
                        : "N/A"}</Text>
                    <Text style={[styles.text, { color: isDarkMode ? '#ddd' : '#333' }]}>Ciclo: {facturaData?.ciclo?.inicio
                        ? new Date(facturaData.ciclo.inicio).toLocaleDateString("es-DO", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })
                        : "N/A"} - {facturaData?.ciclo?.final
                        ? new Date(facturaData.ciclo.final).toLocaleDateString("es-DO", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })
                        : "N/A"}</Text>
                    <Text style={[styles.text, { color: isDarkMode ? '#ddd' : '#333' }]}>Estado: {facturaData?.factura?.estado}</Text>
                    <Text style={[styles.text, { color: isDarkMode ? '#ddd' : '#333' }]}>NCF: {facturaData?.factura?.ncf || "N/A"}</Text>
                </View>
                
                <View style={[styles.tableContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#f7f7f7' }]}>
                    <View style={[styles.tableHeader, { borderBottomColor: isDarkMode ? '#444' : '#ccc' }]}>
                        <Text style={[styles.tableCellHeader, { flex: 1, color: isDarkMode ? '#fff' : '#000' }]}>Cant</Text>
                        <Text style={[styles.tableCellHeader, { flex: 3, color: isDarkMode ? '#fff' : '#000' }]}>Descripción</Text>
                        <Text style={[styles.tableCellHeader, { flex: 2, color: isDarkMode ? '#fff' : '#000' }]}>Importe</Text>
                    </View>
                    {facturaData?.articulos.map((item, index) => (
                        <View
                            key={index}
                            style={[
                                styles.tableRow,
                                { backgroundColor: index % 2 === 0 ? (isDarkMode ? '#333' : '#fff') : (isDarkMode ? '#444' : '#f9f9f9') },
                            ]}
                        >
                            <Text style={[styles.tableCell, { flex: 1, color: isDarkMode ? '#fff' : '#000' }]}>{item.cantidad_articulo}</Text>
                            <Text style={[styles.tableCell, { flex: 3, color: isDarkMode ? '#fff' : '#000' }]}>{item.descripcion}</Text>
                            <Text style={[styles.tableCell, { flex: 2, color: isDarkMode ? '#fff' : '#000' }]}>{formatMoney(item.cantidad_articulo * item.precio_unitario)}</Text>
                        </View>
                    ))}

                    <View style={{ borderBottomWidth: 1, borderColor: isDarkMode ? '#666' : '#ccc', marginVertical: 5 }} />
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                        <Text style={[styles.tableCell, { flex: 3, color: isDarkMode ? '#ddd' : '#333' }]}>Subtotal:</Text>
                        <Text style={[styles.tableCell, { flex: 2, color: isDarkMode ? '#ddd' : '#333' }]}>{formatMoney(subtotal)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                        <Text style={[styles.tableCell, { flex: 3, color: isDarkMode ? '#ddd' : '#333' }]}>Descuento:</Text>
                        <Text style={[styles.tableCell, { flex: 2, color: isDarkMode ? '#ddd' : '#333' }]}>{formatMoney(descuento)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                        <Text style={[styles.tableCell, { flex: 3, color: isDarkMode ? '#ddd' : '#333' }]}>ITBIS:</Text>
                        <Text style={[styles.tableCell, { flex: 2, color: isDarkMode ? '#ddd' : '#333' }]}>{formatMoney(itbis)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                        <Text style={[styles.tableCell, { flex: 3, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>Monto Total:</Text>
                        <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>{formatMoney(montoTotal)}</Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
};

export default FacturaCard;
