import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TextInput,
    StyleSheet,
    Modal,
    TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../../ThemeContext';
import HorizontalMenu from '../../../../componentes/HorizontalMenu';
import getStyles from './styles';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatCurrency';

const VentasMensualesScreen = ({ route }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const { isp_id, selectedMonth, facturaEstado } = route.params;

    useEffect(() => {
        if (facturaEstado === 'pendiente') {
            setSelectedStates(['pendiente']);
        }
    }, [facturaEstado]);

    // Estado principal de los datos
    const [ventasMensualesData, setVentasMensualesData] = useState([]);
    // Estado de datos filtrados
    const [filteredData, setFilteredData] = useState([]);

    // Control de carga
    const [loading, setLoading] = useState(true);

    // Barra de búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [searchVisible, setSearchVisible] = useState(false);

    // Modal de filtros
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    // Posibles estados (ajusta estos valores a tu base de datos)
    const possibleStates = ['pendiente', 'pagado', 'cancelada'];

    // Estados seleccionados por el usuario
    const [selectedStates, setSelectedStates] = useState([]);

    // Estado que guarda la lista de itinerarios (ciclos base)
    const [possibleCiclos, setPossibleCiclos] = useState([]);

    // Otro estado para los itinerarios seleccionados
    const [selectedCiclos, setSelectedCiclos] = useState([]);


    // Utilidad opcional para formatear montos
    // const formatCurrency = (value) => {
    //     // Puedes ajustar la moneda, el separador de miles, etc.
    //     return `\$${parseFloat(value).toLocaleString('es-DO', {
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2,
    //     })}`;
    // };

    /**
     * Llama a la API para traer los datos de facturas mensuales.
     */
    const fetchVentasMensuales = async () => {
        setLoading(true);
        try {
            const response = await api.get(
                `/contabilidad/ventas-mensuales?month=${selectedMonth.getMonth() + 1
                }&year=${selectedMonth.getFullYear()}&id_isp=${isp_id}`
            );

            if (response.data) {
                setVentasMensualesData(response.data);
                // Inicialmente, sin filtros, mostramos todo
                setFilteredData(response.data);
            } else {
                setVentasMensualesData([]);
                setFilteredData([]);
            }
        } catch (error) {
            console.error('Error fetching ventas mensuales:', error);
            setVentasMensualesData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVentasMensuales();
        fetchCiclosBase();  // ← Llamada extra
    }, []);


    const fetchCiclosBase = async () => {
        try {
            const response = await api.get(`/contabilidad/ciclos-base?id_isp=${isp_id}`);
            if (response.data) {
                setPossibleCiclos(response.data);
            } else {
                setPossibleCiclos([]);
            }
        } catch (error) {
            console.error('Error fetching ciclos base:', error);
            setPossibleCiclos([]);
        }
    };

    /**
     * Cada vez que cambien los datos originales, el término de búsqueda,
     * o los estados seleccionados, (re)aplicamos filtros.
     */
    useEffect(() => {
        applyFilters(false);
    }, [ventasMensualesData, searchTerm, selectedStates, searchVisible]);

    /**
     * Alterna la visibilidad de la barra de búsqueda.
     * Si la ocultamos, limpiamos el searchTerm.
     */
    const toggleSearchBar = () => {
        if (searchVisible) {
            setSearchTerm('');
        }
        setSearchVisible(!searchVisible);
    };

    /**
     * Alterna la visibilidad del modal de filtros.
     */
    const toggleFilterModal = () => {
        setFilterModalVisible(!filterModalVisible);
    };

    /**
     * Agrega o quita un estado en la lista de estados seleccionados.
     */
    const toggleStateFilter = (estado) => {
        if (selectedStates.includes(estado)) {
            setSelectedStates(
                selectedStates.filter((item) => item !== estado)
            );
        } else {
            setSelectedStates([...selectedStates, estado]);
        }
    };

    /**
     * Aplica el filtrado por estados y/o término de búsqueda.
     *
     * @param {boolean} shouldCloseModal - si es true, cierra el modal tras filtrar.
     */
    const applyFilters = (shouldCloseModal = false) => {
        let data = [...ventasMensualesData];

        // 1) Filtrar por estados (si se han seleccionado)
        if (selectedStates.length > 0) {
            data = data.filter((item) => {
                const estadoFactura = item.estado
                    ? item.estado.toLowerCase()
                    : '';
                return selectedStates.includes(estadoFactura);
            });
        }

        // 2) Filtrar por itinerario (id_ciclo_base)
        if (selectedCiclos.length > 0) {
            data = data.filter((item) => {
                // Asegúrate de que 'item.id_ciclo_base' tenga sentido
                // y compara con 'selectedCiclos'
                return selectedCiclos.includes(item.id_ciclo_base);
            });
        }


        // 3) Filtrar por búsqueda (si la barra está visible y hay texto)
        if (searchVisible && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            data = data.filter((item) => {
                const rnc = (item.rnc || '').toLowerCase();
                const ncf = (item.ncf || '').toLowerCase();
                const nombres = (item.nombres || '').toLowerCase();
                const apellidos = (item.apellidos || '').toLowerCase();
                const idFactura = String(item.id_factura || '').toLowerCase();
                const idCliente = String(item.id_cliente || '').toLowerCase();

                return (
                    rnc.includes(term) ||
                    ncf.includes(term) ||
                    nombres.includes(term) ||
                    apellidos.includes(term) ||
                    idFactura.includes(term) ||
                    idCliente.includes(term)
                );
            });
        }

        setFilteredData(data);

        // Cierra el modal, si corresponde
        if (shouldCloseModal) {
            toggleFilterModal();
        }
    };

    /**
     * Renderiza cada elemento en el FlatList de facturas.
     */
    const renderVenta = ({ item }) => (
        <TouchableOpacity
            onPress={() =>
                navigation.navigate('DetalleFacturaPantalla', {
                    id_factura: item.id_factura,
                    id_ciclo: item.id_ciclo_base,
                    id_usuario: item.id_cliente, // Suponiendo que este es el id_usuario
                })
            }
            style={styles.cardContainer}
        >
            <Text style={styles.cardTitle}>
                Factura No. {item.id_factura || 'Sin descripción'}
            </Text>
    
            {item.rnc ? (
                <Text style={[styles.cardSubText, { opacity: 0.6 }]}>
                    {'RNC: ' + item.rnc}
                </Text>
            ) : null}
    
            {item.ncf ? (
                <Text style={[styles.cardSubText, { opacity: 0.6 }]}>
                    {'NFC: ' + item.ncf}
                </Text>
            ) : null}
    
            <Text style={[styles.cardSubText, { opacity: 0.6 }]}>
                Itinerario: Día {item.dia_mes || ''}
            </Text>
    
            <Text style={[styles.cardSubText, { opacity: 0.6 }]}>
                {'CID: ' + item.id_cliente || ''} {item.nombres || ''}{' '}
                {item.apellidos || ''}
            </Text>
    
            {item.monto_recibido > 0 && item.monto_recibido < item.monto_total && (
                <Text style={[styles.cardSubText, { opacity: 0.6 }]}>
                    {'Recibido: ' + formatCurrency(item.monto_recibido)}
                </Text>
            )}
    
            <Text style={styles.cardValue}>
                Monto:{' '}
                {item.monto_total
                    ? formatCurrency(item.monto_total)
                    : 'Monto no disponible'}
            </Text>
    
            {item.estado && (
                <Text style={[styles.cardSubText, { opacity: 0.6 }]}>
                    Estado: {item.estado}
                </Text>
            )}
        </TouchableOpacity>
    );
    

    /**
     * Botones de menú: Menú principal, Buscar, Filtrar, Configuraciones
     */
    const botones = [
        {
            id: '1',
            title: 'Menú',
            action: () => navigation.navigate('DashboardScreenContabilidad'),
            icon: 'bars',
        },
        {
            id: '2',
            title: 'Buscar',
            action: toggleSearchBar, // Alterna barra de búsqueda
            icon: 'search',
        },
        {
            id: '3',
            title: 'Filtrar',
            action: toggleFilterModal, // Abre/cierra el modal
            icon: 'filter',
        },
        {
            id: '4',
            title: 'Configuraciones',
            screen: 'ConfiguracionScreen2',
            icon: 'cog',
        },
    ];

    // Spinner mientras se cargan los datos
    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    size="large"
                    color={isDarkMode ? '#fff' : '#000'}
                />
            </View>
        );
    }

    // ------------------------------------------------------------------------------
    //  A. Agrupar datos por estado
    // ------------------------------------------------------------------------------
    const groupByState = (dataArray) => {
        const groups = {};
        dataArray.forEach((item) => {
            const estado = item.estado ? item.estado.toLowerCase() : 'sinestado';
            if (!groups[estado]) {
                groups[estado] = { count: 0, sum: 0 };
            }
            groups[estado].count += 1;
            groups[estado].sum += parseFloat(item.monto_total || 0);
        });
        return groups;
    };

    // ------------------------------------------------------------------------------
    //  B. Construir las filas de la "tabla" según el estado
    // ------------------------------------------------------------------------------
    /**
     * @returns Array de objetos { estado, count, sum } para cada estado.
     *          Si no hay estados seleccionados, regresa 1 fila "TODOS".
     */
    const buildTableRows = () => {
        // Si NO hay estados seleccionados => 1 fila con "TODOS"
        if (selectedStates.length === 0) {
            const totalCount = filteredData.length;
            const totalSum = filteredData.reduce(
                (acc, item) => acc + parseFloat(item.monto_total || 0),
                0
            );
            return [
                {
                    estado: 'TODOS',
                    count: totalCount,
                    sum: totalSum,
                },
            ];
        }

        // Si hay estados seleccionados, agrupar filteredData por estado
        // y luego quedarnos solo con los que estén en selectedStates (y existan en la data).
        const grouped = groupByState(filteredData);

        // Recorremos selectedStates para mantener el orden y creamos filas
        const rows = [];
        selectedStates.forEach((st) => {
            const key = st.toLowerCase();
            if (grouped[key]) {
                rows.push({
                    estado: st,
                    count: grouped[key].count,
                    sum: grouped[key].sum,
                });
            }
        });
        return rows;
    };

    // ------------------------------------------------------------------------------
    //  C. Renderizar la "tabla"
    // ------------------------------------------------------------------------------
    const renderTable = () => {
        const rows = buildTableRows();

        // Calcular totales (filas sumadas)
        const totalCount = rows.reduce((acc, row) => acc + row.count, 0);
        const totalSum = rows.reduce((acc, row) => acc + row.sum, 0);

        return (
            <View
                style={[
                    localStyles.tableContainer,
                    { backgroundColor: isDarkMode ? '#333' : '#fff' },
                ]}
            >
                {/* Cabecera de la "tabla" */}
                <View
                    style={[
                        localStyles.tableHeader,
                        { backgroundColor: isDarkMode ? '#555' : '#ccc' },
                    ]}
                >
                    <Text
                        style={[
                            localStyles.tableHeaderText,
                            { color: isDarkMode ? '#fff' : '#000' },
                        ]}
                    >
                        Estado
                    </Text>
                    <Text
                        style={[
                            localStyles.tableHeaderText,
                            { color: isDarkMode ? '#fff' : '#000' },
                        ]}
                    >
                        Facturas
                    </Text>
                    <Text
                        style={[
                            localStyles.tableHeaderText,
                            { color: isDarkMode ? '#fff' : '#000' },
                        ]}
                    >
                        Monto
                    </Text>
                </View>

                {/* Filas de estados */}
                {rows.map((row, index) => (
                    <View
                        style={[
                            localStyles.tableRow,
                            {
                                backgroundColor: isDarkMode
                                    ? index % 2 === 0
                                        ? '#444'
                                        : '#555'
                                    : index % 2 === 0
                                        ? '#f9f9f9'
                                        : '#fff',
                            },
                        ]}
                        key={index}
                    >
                        <Text
                            style={[
                                localStyles.tableCell,
                                { color: isDarkMode ? '#fff' : '#000' },
                            ]}
                        >
                            {row.estado}
                        </Text>
                        <Text
                            style={[
                                localStyles.tableCell,
                                { color: isDarkMode ? '#fff' : '#000' },
                            ]}
                        >
                            {row.count}
                        </Text>
                        <Text
                            style={[
                                localStyles.tableCell,
                                { color: isDarkMode ? '#fff' : '#000' },
                            ]}
                        >
                            {formatCurrency(row.sum)}
                        </Text>
                    </View>
                ))}

                {/* Fila TOTAL (abajo de todo) */}
                {rows.length > 1 && (
                    <View
                        style={[
                            localStyles.tableFooter,
                            { backgroundColor: isDarkMode ? '#666' : '#eee' },
                        ]}
                    >
                        <Text
                            style={[
                                localStyles.tableCell,
                                { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' },
                            ]}
                        >
                            TOTAL
                        </Text>
                        <Text
                            style={[
                                localStyles.tableCell,
                                { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' },
                            ]}
                        >
                            {totalCount}
                        </Text>
                        <Text
                            style={[
                                localStyles.tableCell,
                                { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' },
                            ]}
                        >
                            {formatCurrency(totalSum)}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const toggleCicloFilter = (idCicloBase) => {
        if (selectedCiclos.includes(idCicloBase)) {
            // quitarlo
            setSelectedCiclos(selectedCiclos.filter((id) => id !== idCicloBase));
        } else {
            // agregarlo
            setSelectedCiclos([...selectedCiclos, idCicloBase]);
        }
    };


    // ------------------------------------------------------------------------------
    //  D. Render principal   DetalleFacturaPantalla
    // ------------------------------------------------------------------------------
    return (
        <>
            <View style={styles.container}>
                {/* Título de la pantalla */}
                <Text style={styles.header}>
                    Ventas Mes{' '}
                    {selectedMonth.toLocaleString('es-ES', {
                        month: 'long',
                        year: 'numeric',
                    })}
                </Text>

                {/* Aquí rendereamos la "tabla" de estados y totales */}
                {renderTable()}

                {/* Barra de búsqueda (mostrada/oculta según `searchVisible`) */}
                {searchVisible && (
                    <View style={localStyles.searchContainer}>
                        <TextInput
                            style={[
                                localStyles.searchInput,
                                { color: isDarkMode ? '#fff' : '#000' },
                            ]}
                            placeholder="Buscar..."
                            placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                            value={searchTerm}
                            onChangeText={(text) => setSearchTerm(text)}
                        />
                    </View>
                )}

                {/* Lista de facturas filtrada */}
                <FlatList
                    data={filteredData}
                    keyExtractor={(item, index) =>
                        item.id_factura
                            ? item.id_factura.toString()
                            : index.toString()
                    }
                    renderItem={renderVenta}
                    contentContainerStyle={styles.listContent}
                    // Separador entre ítems
                    ItemSeparatorComponent={() => (
                        <View
                            style={{
                                height: 1,
                                backgroundColor: isDarkMode ? '#555' : '#ccc',
                            }}
                        />
                    )}
                />
            </View>

            {/* Menú horizontal */}
            <HorizontalMenu
                botones={botones}
                navigation={navigation}
                isDarkMode={isDarkMode}
            />

            {/* Modal de Filtros */}
            <Modal
                visible={filterModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={toggleFilterModal} // Botón atrás en Android
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Filtros</Text>

                        <Text style={styles.modalSubtitle}>Estados:</Text>
                        <View style={{ marginBottom: 20 }}>
                            {possibleStates.map((estado) => {
                                const isSelected = selectedStates.includes(estado);
                                return (
                                    <TouchableOpacity
                                        key={estado}
                                        style={localStyles.filterOption}
                                        onPress={() => toggleStateFilter(estado)}
                                    >
                                        <View style={localStyles.checkboxRow}>
                                            <View
                                                style={[
                                                    localStyles.checkbox,
                                                    isSelected && localStyles.checkboxSelected,
                                                    { borderColor: isDarkMode ? '#fff' : '#888' },
                                                ]}
                                            >
                                                {isSelected && (
                                                    <Text style={localStyles.checkboxCheck}>✔</Text>
                                                )}
                                            </View>
                                            <Text
                                                style={[
                                                    localStyles.filterOptionText,
                                                    { color: isDarkMode ? '#fff' : '#333' },
                                                ]}
                                            >
                                                {estado}
                                            </Text>
                                        </View>


                                    </TouchableOpacity>
                                );
                            })}
                            {/* Filtro por itinerario (ciclo_base) */}
                            <Text style={styles.modalSubtitle}>Itinerarios:</Text>
                            <View style={{ marginBottom: 20 }}>
                                {possibleCiclos.map((ciclo) => {
                                    const isSelected = selectedCiclos.includes(ciclo.id_ciclo_base);
                                    return (
                                        <TouchableOpacity
                                            key={ciclo.id_ciclo_base}
                                            style={localStyles.filterOption}
                                            onPress={() => toggleCicloFilter(ciclo.id_ciclo_base)}
                                        >
                                            <View style={localStyles.checkboxRow}>
                                                <View
                                                    style={[
                                                        localStyles.checkbox,
                                                        isSelected && localStyles.checkboxSelected,
                                                        { borderColor: isDarkMode ? '#fff' : '#888' },
                                                    ]}
                                                >
                                                    {isSelected && (
                                                        <Text style={localStyles.checkboxCheck}>✔</Text>
                                                    )}
                                                </View>
                                                {/* Puedes mostrar "dia_mes" o "detalle", según quieras */}
                                                <Text
                                                    style={[
                                                        localStyles.filterOptionText,
                                                        { color: isDarkMode ? '#fff' : '#333' },
                                                    ]}
                                                >
                                                    {`Día ${ciclo.dia_mes}` || ciclo.detalle}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Botones de aplicar y cerrar */}
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity
                                onPress={() => applyFilters(true)}
                                style={styles.modalButton}
                            >
                                <Text style={styles.modalButtonText}>Aplicar Filtros</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={toggleFilterModal}
                                style={[
                                    styles.modalButton,
                                    { backgroundColor: '#e74c3c' },
                                ]}
                            >
                                <Text style={styles.modalButtonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default VentasMensualesScreen;

/** Estilos locales para tabla, checkbox, etc. */
const localStyles = StyleSheet.create({
    // Barra de búsqueda
    searchContainer: {
        marginTop: 8,
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
    },

    // Tabla
    tableContainer: {
        marginHorizontal: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 6,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#ccc',
        padding: 8,
    },
    tableHeaderText: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        padding: 8,
    },
    tableFooter: {
        flexDirection: 'row',
        backgroundColor: '#eee',
        padding: 8,
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
    },

    // Checkboxes
    filterOption: {
        paddingVertical: 8,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#888',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    checkboxCheck: {
        color: '#fff',
        fontSize: 14,
    },
    filterOptionText: {
        fontSize: 16,
        color: '#333',
    },
});
