import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HorizontalMenu from '../../componentes/HorizontalMenu';
import MenuModal from '../../componentes/MenuModal';
import { useTheme } from '../../../ThemeContext';
import getStyles from '../FacturasScreenStyles';
import NotesPreview from './Cards/NotesPreview';
import type { FacturaListItem } from './types';

const FacturasScreen = () => {
    // Definición de estados locales para manejar datos, errores y otros parámetros
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchText, setSearchText] = useState('');
    const [menuBotones, setMenuBotones] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState('todas');
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const navigation = useNavigation();
    const route = useRoute();
    const { id_ciclo, estado } = route.params || {}; // Extraemos `id_ciclo` y `estado` desde los parámetros de la ruta

    // Handle logout
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('@loginData');
            navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    // useEffect para realizar la consulta a la API una vez que el componente se monte o `id_ciclo` cambie
    useEffect(() => {
        // Validación: Si no hay un `id_ciclo` válido, mostramos un error
        if (!id_ciclo) {
            setError('No se proporcionó un ID de ciclo válido.');
            setLoading(false);
            return;
        }

        // Función para obtener facturas desde la API
        const fetchFacturas = async () => {
            setLoading(true); // Indicamos que estamos cargando datos
            try {
                // Realizamos la solicitud POST a la API para obtener las facturas correspondientes
                const response = await fetch('https://wellnet-rd.com:444/api/consulta-facturas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_ciclo, estado }) // Enviamos `id_ciclo` y `estado` en el payload
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json(); // Parseamos la respuesta a JSON
                setFacturas(data); // Guardamos la lista de facturas
            } catch (error) {
                console.error('Error fetching facturas:', error);
                setError('Error al cargar las facturas');
            } finally {
                setLoading(false); // Finalizamos la carga de datos
            }
        };

        fetchFacturas(); // Llamamos a la función
    }, [id_ciclo]);

    // Formatear dinero - memoizado para evitar recreación constante
    const formatMoney = useCallback((amount) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2,
        }).format(amount);
    }, []);

    // Formatear fecha estilo República Dominicana - memoizado
    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            
            const day = date.getDate();
            const month = date.getMonth();
            const year = date.getFullYear();
            
            const meses = [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
            ];
            
            return `${day} de ${meses[month]} del ${year}`;
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha inválida';
        }
    }, []);

    // Obtener color del estado
    const getStatusStyle = useCallback((status) => {
        switch (status?.toLowerCase()) {
            case 'pagado':
            case 'cobrada':
                return styles.statusPagado;
            case 'pendiente':
                return styles.statusPendiente;
            default:
                return styles.statusVencido;
        }
    }, [styles]);

    // Calcular estadísticas - memoizado para evitar recálculos
    const stats = useMemo(() => {
        const total = facturas.length;
        const pagadas = facturas.filter(f => f.estado?.toLowerCase() === 'pagado' || f.estado?.toLowerCase() === 'cobrada').length;
        const pendientes = facturas.filter(f => f.estado?.toLowerCase() === 'pendiente' || !f.estado).length;
        const totalMonto = facturas.reduce((sum, f) => sum + (parseFloat(f.monto_total) || 0), 0);
        return { total, pagadas, pendientes, totalMonto };
    }, [facturas]);

    // Datos para los filtros - memoizado
    const filterData = useMemo(() => [
        { id: 'todas', label: 'Todas', count: stats.total },
        { id: 'pagadas', label: 'Pagadas', count: stats.pagadas },
        { id: 'pendientes', label: 'Pendientes', count: stats.pendientes },
    ], [stats]);

    // Memoizar los datos filtrados para evitar recálculos innecesarios
    const filteredFacturas = useMemo(() => {
        let filteredData = [...facturas];

        // Primero aplicar filtro por estado
        if (activeFilter !== 'todas') {
            filteredData = filteredData.filter(item => {
                const estado = item.estado?.toLowerCase();
                switch (activeFilter) {
                    case 'pagadas':
                        return estado === 'pagado' || estado === 'cobrada';
                    case 'pendientes':
                        return estado === 'pendiente' || !estado;
                    default:
                        return true;
                }
            });
        }

        // Luego aplicar filtro de búsqueda si hay texto
        if (searchText) {
            const lowercasedFilter = searchText.toLowerCase();
            filteredData = filteredData.filter(item => {
                const nombreCompleto = `${item.nombres || ''} ${item.apellidos || ''}`.toLowerCase();
                const idFactura = item.id_factura ? item.id_factura.toString().toLowerCase() : '';
                const montoTotal = item.monto_total ? item.monto_total.toString().toLowerCase() : '';
                const telefono = item.telefono1 ? item.telefono1.toLowerCase() : '';

                return nombreCompleto.includes(lowercasedFilter)
                    || idFactura.includes(lowercasedFilter)
                    || montoTotal.includes(lowercasedFilter)
                    || telefono.includes(lowercasedFilter);
            });
        }

        return filteredData;
    }, [searchText, facturas, activeFilter]);

    // Función para manejar exportación
    const handleExport = useCallback(() => {
        console.log('Exportando facturas...', { 
            id_ciclo, 
            filtro: activeFilter, 
            total_facturas: filteredFacturas.length 
        });
        alert(`Exportando ${filteredFacturas.length} facturas del ciclo ${id_ciclo}`);
    }, [id_ciclo, activeFilter, filteredFacturas.length]);

    // Función de renderizado para FlatList
    const renderInvoiceItem = useCallback(({ item }: { item: FacturaListItem }) => (
        <TouchableOpacity
            style={styles.invoiceCard}
            onPress={() => navigation.navigate('DetalleFacturaPantalla', {
                id_factura: item.id_factura,
                factura: item,
                isDarkMode: isDarkMode,
                id_cliente: item.id_cliente,
                focus: 'notas', // Para scroll automático a notas
            })}
            activeOpacity={0.7}
        >
            <View style={styles.invoiceHeader}>
                <View style={styles.invoiceIconContainer}>
                    <Icon name="receipt-long" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.invoiceHeaderContent}>
                    <View style={styles.invoiceHeaderRow}>
                        <Text style={styles.invoiceNumber}>Factura #{item.id_factura}</Text>
                    </View>
                    <Text style={[styles.invoiceStatus, getStatusStyle(item.estado)]}>
                        {item.estado || 'Pendiente'}
                    </Text>
                </View>
            </View>

            {/* Preview de Notas */}
            <View style={styles.notesPreviewContainer}>
                <NotesPreview
                    notes={item.notes_preview}
                    totalCount={item.notes_count}
                    isDarkMode={isDarkMode}
                    onPress={() => navigation.navigate('DetalleFacturaPantalla', {
                        id_factura: item.id_factura,
                        factura: item,
                        isDarkMode: isDarkMode,
                        id_cliente: item.id_cliente,
                        focus: 'notas',
                    })}
                />
            </View>

            <View style={styles.invoiceDetails}>
                {(item.nombres || item.apellidos) && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Cliente:</Text>
                        <Text style={styles.detailValue}>
                            {item.nombres ? item.nombres.trim() : ''} {item.apellidos ? item.apellidos.trim() : ''}
                        </Text>
                    </View>
                )}
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Monto:</Text>
                    <Text style={styles.detailMoney}>{formatMoney(item.monto_total)}</Text>
                </View>
                {item.fecha_emision && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Fecha de Emisión:</Text>
                        <Text style={styles.detailValue}>{formatDate(item.fecha_emision)}</Text>
                    </View>
                )}
                {item.telefono1 && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Teléfono:</Text>
                        <Text style={styles.detailPhone}>{item.telefono1}</Text>
                    </View>
                )}
                {item.direccion && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Dirección:</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>{item.direccion}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    ), [styles, navigation, isDarkMode, formatMoney, formatDate, getStatusStyle]);

    // keyExtractor para FlatList
    const keyExtractor = useCallback((item) => item.id_factura.toString(), []);

    // Botones base para gestión de facturas
    const botones = useMemo(() => [
        { id: '1', title: 'Menú', action: () => setMenuVisible(true), icon: 'menu' },
        { id: '2', title: '|' },
        { id: '3', title: 'Volver', action: () => navigation.goBack(), icon: 'arrow-back' },
        { id: '4', title: '|' },
        { id: '5', title: 'Nueva Factura', screen: 'NuevaFacturaScreen', params: { id_ciclo }, icon: 'add-circle' },
        { id: '6', title: '|' },
        { id: '7', title: 'Reportes', screen: 'IngresosScreen', params: { id_ciclo }, icon: 'analytics' },
        { id: '8', title: '|' },
        { id: '9', title: 'Exportar', action: handleExport, icon: 'download' },
    ], [id_ciclo, navigation, handleExport]);

    // Mostrar indicador de carga mientras se están cargando las facturas
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Facturas</Text>
                        <Text style={styles.headerSubtitle}>Cargando facturas...</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#2563EB'} />
                    <Text style={styles.loadingText}>Cargando facturas del ciclo...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Mostrar un mensaje de error si ocurre un problema al cargar los datos
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Facturas</Text>
                        <Text style={styles.headerSubtitle}>Error al cargar</Text>
                    </View>
                </View>
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <Icon name="error" size={40} color="#DC2626" />
                    </View>
                    <Text style={styles.errorTitle}>Error al cargar facturas</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }


    // Renderizado principal de la pantalla
    return (
        <SafeAreaView style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Facturas</Text>
                    <Text style={styles.headerSubtitle}>
                        {estado ? `Estado: ${estado}` : 'Todas las facturas'}
                    </Text>
                </View>
            </View>

            <FlatList
                data={filteredFacturas}
                renderItem={renderInvoiceItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                initialNumToRender={10}
                windowSize={10}
                getItemLayout={null}
                ListHeaderComponent={
                    <>
                        {/* Filter Section */}
                        <View style={styles.filterContainer}>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filterScrollView}
                            >
                                {filterData.map((filter) => (
                                    <TouchableOpacity
                                        key={filter.id}
                                        style={[
                                            styles.filterChip,
                                            activeFilter === filter.id && styles.filterChipActive
                                        ]}
                                        onPress={() => setActiveFilter(filter.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.filterChipText,
                                            activeFilter === filter.id && styles.filterChipTextActive
                                        ]}>
                                            {filter.label}
                                        </Text>
                                        {filter.count > 0 && (
                                            <View style={styles.filterCounter}>
                                                <Text style={styles.filterCounterText}>
                                                    {filter.count > 99 ? '99+' : filter.count}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Search Section */}
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar facturas por cliente, ID, teléfono..."
                                placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                value={searchText}
                                onChangeText={setSearchText}
                                clearButtonMode="while-editing"
                            />
                        </View>

                        {/* Statistics Summary */}
                        {facturas.length > 0 && (
                            <View style={styles.summaryContainer}>
                                <View style={styles.summaryHeader}>
                                    <View style={styles.summaryIconContainer}>
                                        <Icon name="analytics" size={24} color="#FFFFFF" />
                                    </View>
                                    <Text style={styles.summaryTitle}>Resumen del Ciclo</Text>
                                </View>
                                <View style={styles.summaryStats}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>{stats.total}</Text>
                                        <Text style={styles.statLabel}>Total</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>{stats.pagadas}</Text>
                                        <Text style={styles.statLabel}>Pagadas</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>{stats.pendientes}</Text>
                                        <Text style={styles.statLabel}>Pendientes</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={[styles.statNumber, { fontSize: 18 }]}>{formatMoney(stats.totalMonto)}</Text>
                                        <Text style={styles.statLabel}>Total RD$</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Icon name="receipt-long" size={40} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                        </View>
                        <Text style={styles.emptyTitle}>No hay facturas</Text>
                        <Text style={styles.emptyMessage}>
                            {searchText ? 'No se encontraron facturas que coincidan con tu búsqueda.' : 'No hay facturas registradas para este ciclo.'}
                        </Text>
                    </View>
                }
            />

            {/* Modal del Menú */}
            <MenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                menuItems={[
                    { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
                    { title: 'Perfil', action: () => navigation.navigate('ProfileScreen') },
                    { title: 'Configuración', action: () => navigation.navigate('SettingsScreen') },
                    { title: 'Cerrar Sesión', action: handleLogout },
                ]}
                isDarkMode={isDarkMode}
                onItemPress={(item) => {
                    item.action();
                    setMenuVisible(false);
                }}
            />
            
            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />
        </SafeAreaView>
    );
};

export default FacturasScreen;