import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';

const FacturaCard = ({ facturaData, isDarkMode, styles, formatMoney }) => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

    // Listen for orientation changes
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', () => {
            setScreenWidth(Dimensions.get('window').width);
        });
        return () => subscription?.remove();
    }, []);

    const subtotal = facturaData?.articulos?.reduce((acc, item) => acc + (item.cantidad_articulo * item.precio_unitario), 0) || 0;
    const descuento = facturaData?.factura?.descuento || 0;
    const cdt = facturaData?.factura?.cdt_monto || 0;
    const impuesto_selectivo_monto = facturaData?.factura?.impuesto_selectivo || 0;
    const itbis = facturaData?.factura?.itbis || 0;
    const montoTotal = facturaData?.factura?.monto_total || 0;

    const formatQuantity = (value) => {
        const number = parseFloat(value);
        return number % 1 === 0 ? number.toFixed(0) : number.toString();
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("es-DO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: 'America/Santo_Domingo',
        });
    };

    return (
        <View style={styles.cardStyle}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🧾 Detalles de la Factura</Text>
                <View style={styles.invoiceNumberBadge}>
                    <Text style={styles.invoiceNumberText}>#{facturaData?.factura?.id_factura}</Text>
                </View>
            </View>
            
            <View style={styles.cardContent}>
                {/* Invoice Details */}
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>📅</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Fecha de Emisión</Text>
                        <Text style={styles.value}>{formatDate(facturaData?.factura?.fecha_emision)}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>🔄</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Período del Ciclo</Text>
                        <Text style={styles.value}>
                            {formatDate(facturaData?.ciclo?.inicio)} - {formatDate(facturaData?.ciclo?.final)}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Text>📄</Text>
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>NCF</Text>
                        <Text style={styles.value}>{facturaData?.factura?.ncf || "N/A"}</Text>
                    </View>
                </View>

                {/* Articles Table */}
                <View style={{ marginTop: 24 }}>
                    <Text style={styles.header}>📋 Artículos y Servicios</Text>
                    
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={true}
                        style={{ marginTop: 8 }}
                        persistentScrollbar={true}
                        contentContainerStyle={{ flexGrow: 1 }}
                    >
                        <View style={[styles.tableContainer, { minWidth: Math.max(520, screenWidth - 32) }]}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableCellHeader, { width: 80 }]}>Cant.</Text>
                                <Text style={[styles.tableCellHeader, { width: 220, textAlign: 'left' }]}>Descripción</Text>
                                <Text style={[styles.tableCellHeader, { width: 110 }]}>Precio U.</Text>
                                <Text style={[styles.tableCellHeader, { width: 110 }]}>Importe</Text>
                            </View>
                            
                            {facturaData?.articulos?.map((item, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { width: 80 }]}>
                                        {formatQuantity(item.cantidad_articulo)}
                                    </Text>
                                    <View style={{ width: 220, paddingRight: 8 }}>
                                        <Text
                                            style={[styles.tableCell, { textAlign: 'left' }]}
                                            numberOfLines={2}
                                            adjustsFontSizeToFit={true}
                                            minimumFontScale={0.8}
                                        >
                                            {item.descripcion}
                                        </Text>
                                        {item.direccion_conexion && (
                                            <Text
                                                style={[styles.tableCell, {
                                                    textAlign: 'left',
                                                    fontSize: 10,
                                                    opacity: 0.7,
                                                    marginTop: 2
                                                }]}
                                                numberOfLines={2}
                                            >
                                                📍 {item.direccion_conexion}
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={[styles.tableCellAmount, { width: 110 }]}>
                                        {formatMoney(item.precio_unitario)}
                                    </Text>
                                    <Text style={[styles.tableCellAmount, { width: 110 }]}>
                                        {formatMoney(item.cantidad_articulo * item.precio_unitario)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                    
                    {/* Hint para el usuario */}
                    <Text style={styles.scrollHint}>
                        💡 Desliza horizontalmente para ver todos los datos
                    </Text>
                </View>

                {/* Totals Section */}
                <View style={styles.totalsContainer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal:</Text>
                        <Text style={styles.totalValue}>{formatMoney(subtotal)}</Text>
                    </View>
                    
                    {descuento > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Descuento:</Text>
                            <Text style={styles.totalValue}>-{formatMoney(descuento)}</Text>
                        </View>
                    )}
                    
                    {cdt > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>CDT:</Text>
                            <Text style={styles.totalValue}>{formatMoney(cdt)}</Text>
                        </View>
                    )}
                    
                    {impuesto_selectivo_monto > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Impuesto Selectivo:</Text>
                            <Text style={styles.totalValue}>{formatMoney(impuesto_selectivo_monto)}</Text>
                        </View>
                    )}
                    
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>ITBIS:</Text>
                        <Text style={styles.totalValue}>{formatMoney(itbis)}</Text>
                    </View>
                    
                    <View style={styles.finalTotalRow}>
                        <Text style={styles.finalTotalLabel}>💰 Total a Pagar:</Text>
                        <Text style={styles.finalTotalValue}>{formatMoney(montoTotal)}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default FacturaCard;