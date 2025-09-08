import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Card, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../utils/api';
import getStyles from './styles'; // Importar los estilos ya creados
import HorizontalMenu from '../../../../componentes/HorizontalMenu';
import MenuModal from '../../../../componentes/MenuModal';
import { useIspDetails } from '../../../../pantallas/operaciones/hooks/useIspDetails';
import { useTheme } from '../../../../../ThemeContext';

const DashboardScreenContabilidad = ({ route }) => {
    // 1. Tema e estilos
    const { isDarkMode, toggleTheme } = useTheme();
    //   const styles = getStyles(isDarkMode);
    
    // 2. Parámetros de la ruta
    const { isp_id, permisos, id_usuario, usuarioPermisos } = route.params;
    // const [isDarkMode, setIsDarkMode] = useState(false);
    const styles = getStyles(isDarkMode); // Generar estilos dinámicos
    const [selectedMonth, setSelectedMonth] = useState(new Date()); // Mes seleccionado (por defecto, mes actual)
    const [loading, setLoading] = useState(true);

    const [data, setData] = useState({
        ventasMensuales: 0,
        itbisAPagar: 0,
        facturasPendientesMes: 0,
        facturasPendientesOtrosMeses: 0,
        totalFacturas: 0,
        ingresosTotales: 0,
    });
    
    const navigation = useNavigation();
    // const [isDarkMode, setIsDarkMode] = useState(false);
    // const [menuVisible, setMenuVisible] = useState(false);

    // const [menuVisible, setMenuVisible] = useState(false);
    // const [ispId, setIspId] = useState(isp.id_isp);

    // const toggleTheme = () => {
    //     setIsDarkMode((prevMode) => !prevMode);
    // };

    // Formatear mes actual como texto
    const getMonthName = (date) => {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Obtener datos del mes seleccionado
    // import api from '../../utils/api'; // Asegúrate de que la ruta es correcta


    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get(
                `/contabilidad/dashboard?month=${selectedMonth.getMonth() + 1}&year=${selectedMonth.getFullYear()}&id_isp=${isp_id}&id_usuario=${id_usuario}`
            );
            if (response.data) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };
    


    useEffect(() => {
        fetchData();
    }, [selectedMonth]); // Ejecutar cuando cambie el mes seleccionado

    useEffect(() => {
        fetchData();
    }, []); // Ejecutar cuando se cargue la pantalla

    // Seleccionar mes anterior
    const handlePreviousMonth = () => {
        const newDate = new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1));
        setSelectedMonth(newDate);
    };

    // Seleccionar mes siguiente
    const handleNextMonth = () => {
        const newDate = new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1));
        setSelectedMonth(newDate);
    };

    // 3. useIspDetails para extraer datos y funciones
    const {
        nombreUsuario,
        usuarioId,
        nivelUsuario,
        permisosUsuario,
        // id_isp,
        conexionesResumen,
        tienePermiso,
    } = useIspDetails();

    console.log('id_isp:', isp_id);
    // console.log('usuarioPermisos:', usuarioPermisos);
    console.log('id_usuario:', id_usuario);
    console.log('nombreUsuario:', nombreUsuario);

    // 4. Estados locales
    const [menuVisible, setMenuVisible] = useState(false);
    const [orderCounts, setOrderCounts] = useState([]);
    // const [permisos, setPermisos] = useState([]);
    const [usuarioData, setUsuarioData] = useState([]);
    const [totalesIsp, setTotalesIsp] = useState({
        totalClientes: 0,
        clientesActivos: 0,
        clientesInactivos: 0,
        totalFacturasVencidas: 0,
        totalFacturasVencidasActivos: 0,
        totalFacturasVencidasInactivos: 0,
    });


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard');
                setData(response);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
            console.log ('data:', data);
        console.log('Datos del dashboard:', JSON.stringify(data, null, 2));
        };

        fetchData();
    }, []);

    const cards = [
        // {
        //     id: 'ventas',
        //     title: 'Ventas Mensuales',
        //     value: formatCurrency(data.ventasMensuales),
        //     subText: `${new Intl.NumberFormat().format(data.totalFacturas)} facturas...`, // Facturas de otros meses con formato de coma de millares
        //     screen: 'VentasScreen',
        // },
        {
            id: 'ventas',
            title: 'Ventas Mensuales',
            value: formatCurrency(data.ventasMensuales),
            subText: `${new Intl.NumberFormat().format(data.totalFacturas)} facturas...`,
            screen: 'VentasMensualesScreen', // Ruta de la nueva pantalla
            params: { isp_id, selectedMonth,id_usuario }, // Parámetros que deseas pasar
        },
        {
            id: 'facturas',
            title: 'Facturas Pendientes',
            value: `${new Intl.NumberFormat().format(data.facturasPendientes)}`, // Solo facturas del mes con formato de coma de millares
            subText: `${new Intl.NumberFormat().format(data.facturasPendientesOtrosMeses)} Pendientes de otros meses...`, // Facturas de otros meses con formato de coma de millares
            screen: 'VentasMensualesScreen', // Ruta de la nueva pantalla
            params: { isp_id, selectedMonth,id_usuario, facturaEstado: 'pendiente' }, // Parámetros que deseas pasar
            // screen: 'FacturasPendientesScreen',
        },        
        {
            id: 'ingresos',
            title: 'Ingresos Totales',
            value: formatCurrency(data.ingresosTotales),
            subText: `${formatCurrency(data.montoRecibidoPorMes)} de facturas de este mes...`, // Facturas de otros meses con formato de coma de millares
            screen: 'IngresosScreen',
        },
        {
            id: 'itbis',
            title: 'ITBIS a Pagar',
            value: formatCurrency(data.itbisAPagar),
            screen: 'ITBISReportScreen',
        },
    ];
    

    const renderCard = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate(item.screen, item.params || {})} // Navegar con parámetros
            style={styles.cardContainer}
        >
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardValue}>{item.value}</Text>
                    {item.subText && (
                        <Text style={[styles.cardSubText, { opacity: 0.6 }]}>{item.subText}</Text>
                    )}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
    
    

    // ---------------------------------------------------------------------------
    // Botones del menú inferior
    // ---------------------------------------------------------------------------
    const botones = [
        {
            id: '6',
            title: 'Menú',
            action: () => setMenuVisible(true),
            icon: 'bars',
        },
        {
            id: '3',
            title: 'Configuraciones',
            screen: 'ConfiguracionScreen2',
            icon: 'cog',
        },
        {
            id: '9',
            title: 'Libro Diario',
            screen: 'LibroDiarioScreen',
            icon: 'book',
        },
        {
            id: '8',
            title: 'Plan de Cuentas',
            screen: 'PlanDeCuentasScreen',
            icon: 'book',
        },
        {
            id: '1',
            title: 'NCF Reportes',
            screen: 'NCFReportScreen',
            icon: 'file-text',
        },
        {
            id: '2',
            title: 'Retenciones',
            screen: 'RetencionesReportScreen',
            icon: 'percent',
        },
        {
            id: '5',
            title: 'Balance General',
            screen: 'BalanceGeneralScreen2',
            icon: 'balance-scale',
        },
        {
            id: '7',
            title: 'Estados de Resultados',
            screen: 'EstadoResultadosScreen2',
            icon: 'bar-chart',
        },
        {
            id: '4',
            title: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
            icon: isDarkMode ? 'sun-o' : 'moon-o',
            action: toggleTheme,
        },
    ];

    return (
        <>
            {/* Contenido principal */}
            <View style={styles.container}>
                <Text style={styles.header}>Dashboard</Text>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthButton}>
                        <Icon
                            source="chevron-left" // Flecha a la izquierda
                            size={28}
                            color={isDarkMode ? '#fff' : '#000'} // Dinámico según modo
                        />
                    </TouchableOpacity>
                    <Text style={styles.header}>{getMonthName(selectedMonth)}</Text>
                    <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
                        <Icon
                            source="chevron-right" // Flecha a la derecha
                            size={28}
                            color={isDarkMode ? '#fff' : '#000'} // Dinámico según modo
                        />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={cards}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCard}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            {/* Menú inferior */}
            <HorizontalMenu
                botones={botones}
                navigation={navigation}
                isDarkMode={isDarkMode}
            />

            {/* Modal de menú lateral */}
            <MenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                menuItems={[
                    {
                        title: nombreUsuario,
                        action: () =>
                            navigation.navigate('UsuarioDetalleScreen', {
                                ispId: id_isp,
                                userId: usuarioId,
                            }),
                    },
                    { title: 'Inicio', action: () => navigation.navigate('HomeScreen') },
                    { title: 'Perfil', action: () => navigation.navigate('ProfileScreen') },
                    { title: 'Configuración', action: () => navigation.navigate('SettingsScreen') },
                    { title: 'Cerrar Sesión', action: () => console.log('Cerrando sesión') },
                ]}
                isDarkMode={isDarkMode}
                onItemPress={(item) => {
                    item.action();
                    setMenuVisible(false);
                }}
            />
        </>
    );
};

export default DashboardScreenContabilidad;
