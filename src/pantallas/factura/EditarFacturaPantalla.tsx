import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStyles } from './EditarFacturaStyles';
import ThemeSwitch from '../../componentes/themeSwitch';
import registrarEventoFactura from './Functions/RegistrarEventoFactura';

const EditarFacturaPantalla = ({ route, navigation }) => {
    const { facturaData, isDarkMode } = route.params;
    const styles = getStyles(isDarkMode);
    const [editableFactura, setEditableFactura] = useState(facturaData);
    const [impuestos, setImpuestos] = useState(null);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [focusedInput, setFocusedInput] = useState(null);
    const [idUsuario, setIdUsuario] = useState(null);
    // Hacer copia profunda de artículos originales para comparar cambios más tarde
    const [articulosOriginales, setArticulosOriginales] = useState(
        JSON.parse(JSON.stringify(facturaData.articulos))
    );

    // Listen for orientation changes
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', () => {
            setScreenWidth(Dimensions.get('window').width);
        });
        return () => subscription?.remove();
    }, []);

    console.log('Factura Data:', JSON.stringify(facturaData, null, 2));

    // Cargar ID de usuario
    useEffect(() => {
        const loadUserId = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
                if (userData && userData.id) {
                    setIdUsuario(userData.id);
                }
            } catch (error) {
                console.error('Error al cargar el ID de usuario:', error);
            }
        };
        loadUserId();
    }, []);

    // Consultar impuestos desde el backend al cargar
    useEffect(() => {
        const fetchImpuestos = async () => {
            try {
                const response = await axios.get(`https://wellnet-rd.com:444/api/impuestos/${facturaData.isp.id_isp}`);
                console.log('Impuestos recuperados:', response.data); // Imprimir en consola
                setImpuestos(response.data);
            } catch (error) {
                console.error('Error al obtener los impuestos:', error);
            }
        };
        fetchImpuestos();
    }, [facturaData.isp.id_isp]);

    // Función para recalcular impuestos
    const recalcularImpuestos = (articulo) => {
        if (!impuestos) return articulo;

        const subtotal = (Number(articulo.cantidad_articulo) || 0) * (Number(articulo.precio_unitario) || 0);
        const descuento = Number(articulo.descuentoArticulo) || 0;
        const base = subtotal - descuento;

        // Calcular impuestos
        const itbis = base * (Number(impuestos.itbis) / 100);
        const impuestoSelectivo = base * (Number(impuestos.impuesto_selectivo) / 100);
        const cdt = base * (Number(impuestos.cdt) / 100);

        return {
            ...articulo,
            itbis_monto: itbis.toFixed(2),
            impuesto_selectivo_monto: impuestoSelectivo.toFixed(2),
            cdt_monto: cdt.toFixed(2),
        };
    };

    // Actualizar los artículos cada vez que cambien
    const handleArticuloChange = (index, field, value) => {
        const newArticulos = [...editableFactura.articulos];
        newArticulos[index][field] = parseFloat(value) || 0;

        // Recalcular los valores relacionados con el descuento
        if (field === 'descuentoArticulo') {
            newArticulos[index] = recalcularImpuestos(newArticulos[index]);
        }

        setEditableFactura((prev) => ({ ...prev, articulos: newArticulos }));
    };

    // Función para eliminar un artículo
    const eliminarArticulo = (index) => {
        const articuloAEliminar = editableFactura.articulos[index];

        Alert.alert(
            "Eliminar Artículo",
            `¿Estás seguro de eliminar el artículo "${articuloAEliminar.descripcion}"?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Verificar que haya al menos 2 artículos (no se puede dejar la factura sin artículos)
                            if (editableFactura.articulos.length <= 1) {
                                Alert.alert("Error", "No puedes eliminar todos los artículos de la factura. Debe quedar al menos uno.");
                                return;
                            }

                            // Eliminar artículo del backend
                            const response = await axios.delete(
                                `https://wellnet-rd.com:444/api/eliminar-articulo/${articuloAEliminar.id_articulo}`
                            );

                            console.log('🗑️ [EliminarArticulo] Respuesta del servidor:', response.data);

                            if (response.status === 200) {
                                // Registrar evento de artículo eliminado
                                if (idUsuario) {
                                    const montoArticulo = (Number(articuloAEliminar.cantidad_articulo) || 0) *
                                                         (Number(articuloAEliminar.precio_unitario) || 0) -
                                                         (Number(articuloAEliminar.descuentoArticulo) || 0);

                                    console.log('✅ [EliminarArticulo] Registrando evento...');
                                    await registrarEventoFactura(
                                        editableFactura.factura.id_factura,
                                        idUsuario,
                                        'Artículo eliminado',
                                        `Artículo "${articuloAEliminar.descripcion}" eliminado. Cantidad: ${articuloAEliminar.cantidad_articulo}, Monto: ${formatMoney(montoArticulo)}`,
                                        JSON.stringify({
                                            id_articulo: articuloAEliminar.id_articulo,
                                            descripcion: articuloAEliminar.descripcion,
                                            cantidad: Number(articuloAEliminar.cantidad_articulo),
                                            precio_unitario: Number(articuloAEliminar.precio_unitario),
                                            descuento: Number(articuloAEliminar.descuentoArticulo) || 0,
                                            monto_eliminado: montoArticulo
                                        })
                                    );
                                }

                                // Actualizar el estado local eliminando el artículo
                                const nuevosArticulos = editableFactura.articulos.filter((_, i) => i !== index);
                                setEditableFactura((prev) => ({ ...prev, articulos: nuevosArticulos }));

                                Alert.alert("Éxito", "Artículo eliminado correctamente.");
                            }
                        } catch (error) {
                            console.error('❌ [EliminarArticulo] Error al eliminar artículo:', error);
                            Alert.alert("Error", "No se pudo eliminar el artículo. Por favor, intenta nuevamente.");
                        }
                    }
                }
            ]
        );
    };

    // Calcular subtotales y totales dinámicamente
    const subtotal = editableFactura.articulos.reduce(
        (acc, item) => acc + (Number(item.cantidad_articulo) || 0) * (Number(item.precio_unitario) || 0),
        0
    );
    const totalDescuento = editableFactura.articulos.reduce(
        (acc, item) => acc + (Number(item.descuentoArticulo) || 0),
        0
    );
    const totalItbis = editableFactura.articulos.reduce(
        (acc, item) => acc + Number(item.itbis_monto || 0),
        0
    );
    const totalImpuestoSelectivo = editableFactura.articulos.reduce(
        (acc, item) => acc + Number(item.impuesto_selectivo_monto || 0),
        0
    );
    const totalCdt = editableFactura.articulos.reduce(
        (acc, item) => acc + Number(item.cdt_monto || 0),
        0
    );
    const montoTotal = subtotal - totalDescuento + totalItbis + totalImpuestoSelectivo + totalCdt;

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
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

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'pagado':
                return styles.statusPaid;
            case 'pendiente':
                return styles.statusPending;
            default:
                return styles.statusOverdue;
        }
    };

    const formatQuantity = (value) => {
        const number = parseFloat(value);
        return number % 1 === 0 ? number.toFixed(0) : number.toString();
    };

    const handleCancelarEdicion = () => {
        navigation.goBack(); // Vuelve a la pantalla anterior
    };

    const handleAceptarEdicion = () => {
        Alert.alert(
            "Confirmación",
            "¿Estás seguro de que deseas guardar los cambios?",
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Edición cancelada"),
                    style: "cancel",
                },
                {
                    text: "Aceptar",
                    onPress: async () => {
                        try {
                            const datosArticulos = editableFactura.articulos.map((articulo) => ({
                                id_articulo: articulo.id_articulo,
                                cantidad_articulo: articulo.cantidad_articulo,
                                precio_unitario: articulo.precio_unitario,
                                descuentoArticulo: articulo.descuentoArticulo,
                                itbis_monto: articulo.itbis_monto,
                                impuesto_selectivo_monto: articulo.impuesto_selectivo_monto,
                                cdt_monto: articulo.cdt_monto,
                                total: (
                                    (Number(articulo.cantidad_articulo) || 0) *
                                    (Number(articulo.precio_unitario) || 0) -
                                    (Number(articulo.descuentoArticulo) || 0) +
                                    (Number(articulo.itbis_monto) || 0) +
                                    (Number(articulo.impuesto_selectivo_monto) || 0) +
                                    (Number(articulo.cdt_monto) || 0)
                                ).toFixed(2),
                            }));
                            
                            const datosFactura = {
                                id_factura: editableFactura.factura.id_factura,
                                subtotal: subtotal,
                                descuento: totalDescuento,
                                itbis: totalItbis,
                                impuesto_selectivo: totalImpuestoSelectivo,
                                cdt_monto: totalCdt,
                                monto_total: montoTotal,
                            };
                            
                            console.log(
                                "Datos enviados al backend:",
                                JSON.stringify(
                                    {
                                        articulos: datosArticulos,
                                        factura: datosFactura,
                                    },
                                    null, // Para no reemplazar propiedades
                                    2     // Indentación de 2 espacios para mayor legibilidad
                                )
                            );
                            
                            const response = await axios.put(
                                'https://wellnet-rd.com:444/api/actualizar-articulos-factura',
                                { articulos: datosArticulos, factura: datosFactura }
                            );

                            console.log('Respuesta del servidor:', response.data);

                            // Registrar evento de edición de artículos
                            console.log('🔍 [EditarFactura] idUsuario:', idUsuario);
                            console.log('🔍 [EditarFactura] Artículos originales:', articulosOriginales.length);
                            console.log('🔍 [EditarFactura] Artículos editados:', editableFactura.articulos.length);

                            if (idUsuario) {
                                // Detectar cambios en artículos
                                const cambios = [];
                                editableFactura.articulos.forEach((articuloEditado, index) => {
                                    const articuloOriginal = articulosOriginales[index];
                                    if (articuloOriginal) {
                                        console.log(`🔍 [EditarFactura] Comparando artículo ${index}:`, {
                                            original_cantidad: articuloOriginal.cantidad_articulo,
                                            editado_cantidad: articuloEditado.cantidad_articulo,
                                            original_precio: articuloOriginal.precio_unitario,
                                            editado_precio: articuloEditado.precio_unitario,
                                            original_descuento: articuloOriginal.descuentoArticulo,
                                            editado_descuento: articuloEditado.descuentoArticulo
                                        });

                                        const cambiosArticulo = [];

                                        if (Number(articuloEditado.cantidad_articulo) !== Number(articuloOriginal.cantidad_articulo)) {
                                            cambiosArticulo.push(`Cantidad: ${articuloOriginal.cantidad_articulo} → ${articuloEditado.cantidad_articulo}`);
                                        }
                                        if (Number(articuloEditado.precio_unitario) !== Number(articuloOriginal.precio_unitario)) {
                                            cambiosArticulo.push(`Precio: ${formatMoney(articuloOriginal.precio_unitario)} → ${formatMoney(articuloEditado.precio_unitario)}`);
                                        }
                                        if (Number(articuloEditado.descuentoArticulo) !== Number(articuloOriginal.descuentoArticulo)) {
                                            cambiosArticulo.push(`Descuento: ${formatMoney(articuloOriginal.descuentoArticulo)} → ${formatMoney(articuloEditado.descuentoArticulo)}`);
                                        }

                                        if (cambiosArticulo.length > 0) {
                                            cambios.push({
                                                descripcion: articuloEditado.descripcion,
                                                cambios: cambiosArticulo
                                            });
                                        }
                                    }
                                });

                                console.log('🔍 [EditarFactura] Cambios detectados:', cambios.length);
                                if (cambios.length > 0) {
                                    console.log('✅ [EditarFactura] Registrando evento de artículos editados...');
                                } else {
                                    console.log('⚠️ [EditarFactura] No se detectaron cambios en cantidad, precio o descuento');
                                }

                                if (cambios.length > 0) {
                                    const descripcionCambios = cambios.map(c =>
                                        `• ${c.descripcion}: ${c.cambios.join(', ')}`
                                    ).join('\n');

                                    await registrarEventoFactura(
                                        editableFactura.factura.id_factura,
                                        idUsuario,
                                        'Artículos editados',
                                        `Se editaron ${cambios.length} artículo(s) en la factura #${editableFactura.factura.id_factura}:\n${descripcionCambios}`,
                                        JSON.stringify({
                                            articulos_modificados: cambios.length,
                                            monto_total_anterior: facturaData.factura.monto_total,
                                            monto_total_nuevo: montoTotal,
                                            cambios_detallados: cambios
                                        })
                                    );
                                }
                            }

                            Alert.alert("Éxito", "Los cambios se han guardado correctamente.");
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error al actualizar los artículos y la factura:', error);
                            Alert.alert("Error", "Hubo un problema al guardar los cambios.");
                        }
                        
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>✏️ Editar Factura #{editableFactura?.factura?.id_factura}</Text>
                        <Text style={styles.headerSubtitle}>
                            {editableFactura?.cliente?.nombres} {editableFactura?.cliente?.apellidos}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <View style={styles.statusBadge}>
                            <Text style={[styles.statusText, getStatusColor(editableFactura?.factura?.estado)]}>
                                {editableFactura?.factura?.estado?.toUpperCase() || 'N/A'}
                            </Text>
                        </View>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            <View style={styles.contentContainer}>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* Invoice Information Card */}
                    <View style={styles.cardStyle}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>📄 Información de la Factura</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.invoiceInfoContainer}>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIcon}>
                                        <Text>📅</Text>
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Fecha de Emisión</Text>
                                        <Text style={styles.infoValue}>{formatDate(editableFactura?.factura?.fecha_emision)}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIcon}>
                                        <Text>🔄</Text>
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Estado</Text>
                                        <Text style={[styles.infoValue, getStatusColor(editableFactura?.factura?.estado)]}>
                                            {editableFactura?.factura?.estado || 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Articles Edit Card */}
                    <View style={styles.cardStyle}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>📋 Editar Artículos y Servicios</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={true}
                                persistentScrollbar={true}
                                contentContainerStyle={{ flexGrow: 1 }}
                            >
                                <View style={[styles.tableContainer, { minWidth: Math.max(680, screenWidth - 32) }]}>
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableCellHeader, { width: 80 }]}>Cant.</Text>
                                        <Text style={[styles.tableCellHeader, { width: 200, textAlign: 'left' }]}>Descripción</Text>
                                        <Text style={[styles.tableCellHeader, { width: 110 }]}>Descuento</Text>
                                        <Text style={[styles.tableCellHeader, { width: 110 }]}>Precio U.</Text>
                                        <Text style={[styles.tableCellHeader, { width: 120 }]}>Importe</Text>
                                        <Text style={[styles.tableCellHeader, { width: 60 }]}>Acción</Text>
                                    </View>
                                    
                                    {editableFactura.articulos.map((item, index) => (
                                        <View 
                                            key={index} 
                                            style={[
                                                styles.tableRow,
                                                index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                                            ]}
                                        >
                                            <TextInput
                                                style={[
                                                    styles.tableCellInput, 
                                                    { width: 80 },
                                                    focusedInput === `cantidad_${index}` && styles.tableCellInputFocused
                                                ]}
                                                value={formatQuantity(item.cantidad_articulo)}
                                                onChangeText={(text) => handleArticuloChange(index, 'cantidad_articulo', text)}
                                                onFocus={() => setFocusedInput(`cantidad_${index}`)}
                                                onBlur={() => setFocusedInput(null)}
                                                keyboardType="numeric"
                                                selectTextOnFocus={true}
                                            />
                                            <Text 
                                                style={[styles.tableCell, { width: 200, textAlign: 'left', paddingLeft: 8 }]}
                                                numberOfLines={2}
                                            >
                                                {item.descripcion}
                                            </Text>
                                            <TextInput
                                                style={[
                                                    styles.tableCellInput, 
                                                    { width: 110 },
                                                    focusedInput === `descuento_${index}` && styles.tableCellInputFocused
                                                ]}
                                                value={item.descuentoArticulo?.toString() || "0"}
                                                onChangeText={(text) => handleArticuloChange(index, 'descuentoArticulo', text)}
                                                onFocus={() => setFocusedInput(`descuento_${index}`)}
                                                onBlur={() => setFocusedInput(null)}
                                                keyboardType="numeric"
                                                selectTextOnFocus={true}
                                            />
                                            <TextInput
                                                style={[
                                                    styles.tableCellInput, 
                                                    { width: 110 },
                                                    focusedInput === `precio_${index}` && styles.tableCellInputFocused
                                                ]}
                                                value={item.precio_unitario.toString()}
                                                onChangeText={(text) => handleArticuloChange(index, 'precio_unitario', text)}
                                                onFocus={() => setFocusedInput(`precio_${index}`)}
                                                onBlur={() => setFocusedInput(null)}
                                                keyboardType="numeric"
                                                selectTextOnFocus={true}
                                            />
                                            <Text style={[styles.tableCellAmount, { width: 120 }]}>
                                                {formatMoney(
                                                    (item.cantidad_articulo || 0) * (item.precio_unitario || 0) -
                                                    (item.descuentoArticulo || 0)
                                                )}
                                            </Text>
                                            <TouchableOpacity
                                                style={[styles.deleteButton, { width: 60 }]}
                                                onPress={() => eliminarArticulo(index)}
                                            >
                                                <Icon name="delete" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                            
                            <Text style={styles.scrollHint}>
                                💡 Desliza horizontalmente para ver todos los campos
                            </Text>
                            {/* Totals Section */}
                            <View style={styles.totalsContainer}>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Subtotal:</Text>
                                    <Text style={styles.totalValue}>{formatMoney(subtotal)}</Text>
                                </View>
                                
                                {totalDescuento > 0 && (
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Descuento:</Text>
                                        <Text style={styles.totalValue}>-{formatMoney(totalDescuento)}</Text>
                                    </View>
                                )}
                                
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>ITBIS:</Text>
                                    <Text style={styles.totalValue}>{formatMoney(totalItbis)}</Text>
                                </View>
                                
                                {totalImpuestoSelectivo > 0 && (
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Impuesto Selectivo:</Text>
                                        <Text style={styles.totalValue}>{formatMoney(totalImpuestoSelectivo)}</Text>
                                    </View>
                                )}
                                
                                {totalCdt > 0 && (
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>CDT:</Text>
                                        <Text style={styles.totalValue}>{formatMoney(totalCdt)}</Text>
                                    </View>
                                )}
                                
                                <View style={styles.finalTotalRow}>
                                    <Text style={styles.finalTotalLabel}>💰 Total a Pagar:</Text>
                                    <Text style={styles.finalTotalValue}>{formatMoney(montoTotal)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancelarEdicion}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>❌ Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.button, styles.saveButton]}
                    onPress={handleAceptarEdicion}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>✅ Guardar Cambios</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default EditarFacturaPantalla;
