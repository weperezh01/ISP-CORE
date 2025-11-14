import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Button, Alert } from 'react-native';
import { useTheme } from '../../../../../ThemeContext';
import { useNavigation } from '@react-navigation/native';
import HorizontalMenu from '../../../../componentes/HorizontalMenu';
import MenuModal from '../../../../componentes/MenuModal';
import { useIspDetails } from '../../../../pantallas/operaciones/hooks/useIspDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LibroDiarioScreen = ({ route }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);
    const navigation = useNavigation();
    const [transacciones, setTransacciones] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const { isp_id, permisos, id_usuario, usuarioPermisos } = route.params;

    useEffect(() => {
        // Obtener las transacciones del backend
        const fetchTransacciones = async () => {
            try {
                const response = await fetch('https://wellnet-rd.com/api/contabilidad/transacciones');
                const data = await response.json();
                setTransacciones(data);
            } catch (error) {
                console.error('Error fetching transacciones:', error);
            }
        };

        fetchTransacciones();
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('@loginData');
            navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
            Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente.');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert('Error', 'No se pudo cerrar sesión.');
        }
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
            id: '10',
            title: 'Insertar Transacción',
            screen: 'ConfiguracionScreen2',
            icon: 'plus',
            action: () => navigation.navigate('InsertarTransaccionScreen'),
        },
              
        {
            id: '3',
            title: 'Configuraciones',
            screen: 'ConfiguracionScreen2',
            icon: 'cog',
        },
        // {
        //     id: '9',
        //     title: 'Libro Diario',
        //     screen: 'LibroDiarioScreen',
        //     icon: 'book',
        // },
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

    const renderTransaccion = (transaccion) => (
        <TouchableOpacity
            key={transaccion.id}
            style={styles.transaccionCard}
            onPress={() => navigation.navigate('TransaccionDetailScreen', { transaccion })}
        >
            <Text style={styles.transaccionFecha}>{transaccion.fecha}</Text>
            <Text style={styles.transaccionDescripcion}>{transaccion.descripcion}</Text>
            <Text style={styles.transaccionCuentas}>Débito: {transaccion.cuenta_debito} / Crédito: {transaccion.cuenta_credito}</Text>
            <Text style={styles.transaccionMonto}>Monto: {transaccion.monto}</Text>
        </TouchableOpacity>
    );

    return (
        <>
            <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
                <Text style={styles.title}>Libro Diario</Text>
                <View style={styles.flexContainer}>
                    {transacciones.length > 0 ? (
                        transacciones.map((transaccion) => renderTransaccion(transaccion))
                    ) : (
                        <Text style={styles.noTransaccionesText}>No hay transacciones registradas.</Text>
                    )}
                </View>
                {/* <View style={styles.buttonContainer}>
                    <Button
                        title="Insertar Transacción"
                        onPress={() => navigation.navigate('InsertarTransaccionScreen')}
                    />
                </View> */}
            </ScrollView>

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
                    { title: 'Cerrar Sesión', action: handleLogout },
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

const getStyles = (isDarkMode) => StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    scrollViewContentContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: isDarkMode ? '#121212' : '#FFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    transaccionCard: {
        backgroundColor: isDarkMode ? '#1c1c1e' : '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    transaccionFecha: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDarkMode ? 'white' : 'black',
    },
    transaccionDescripcion: {
        fontSize: 16,
        color: isDarkMode ? '#e5e5e5' : '#333',
        marginVertical: 5,
    },
    transaccionCuentas: {
        fontSize: 14,
        color: isDarkMode ? '#e5e5e5' : '#333',
    },
    transaccionMonto: {
        fontSize: 14,
        color: isDarkMode ? '#e5e5e5' : '#333',
    },
    noTransaccionesText: {
        fontSize: 18,
        color: isDarkMode ? '#e5e5e5' : '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    buttonContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
});

export default LibroDiarioScreen;
