import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, useWindowDimensions } from 'react-native';
import { TextInput, Button, Card, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../../../ThemeContext';
import DatePickerComponent from '../../../../componentes/DatePickerComponent';
import HorizontalMenu from '../../../../componentes/HorizontalMenu';
import MenuModal from '../../../../componentes/MenuModal';
import { useIspDetails } from '../../../../pantallas/operaciones/hooks/useIspDetails';
import { Text } from 'react-native';


const InsertarTransaccionScreen = () => {
    const [fecha, setFecha] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cuentaDebito, setCuentaDebito] = useState('');
    const [cuentaCredito, setCuentaCredito] = useState('');
    const [monto, setMonto] = useState('');
    const [referenciaExterna, setReferenciaExterna] = useState('');
    const [estado, setEstado] = useState('pendiente');
    const [categoria, setCategoria] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [asociado, setAsociado] = useState(''); // Cliente o Proveedor
    const [proyecto, setProyecto] = useState('');
    const [cuentas, setCuentas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [transaccionId, setTransaccionId] = useState(null);

    const navigation = useNavigation();
    const route = useRoute();
    const { isDarkMode, toggleTheme } = useTheme();
    const { width } = useWindowDimensions();
    const styles = getStyles(isDarkMode, width);

    useEffect(() => {
        const fetchCuentas = async () => {
            try {
                const response = await fetch('https://wellnet-rd.com/api/contabilidad/cuentas');
                const data = await response.json();
                setCuentas(data);
            } catch (error) {
                console.error('Error fetching cuentas:', error);
            }
        };

        fetchCuentas();
    }, []);

    const handleSubmit = async () => {
        Alert.alert('Acción', isEditing ? 'Actualizar Transacción' : 'Crear Transacción');
    };

    useEffect(() => {
        const obtenerDatosUsuario = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@loginData');
                if (jsonValue) {
                    const userData = JSON.parse(jsonValue);
                } else {
                    Alert.alert('Error', 'No se pudo recuperar la información del usuario');
                }
            } catch (e) {
                console.error('Failed to read user data', e);
                Alert.alert('Error', 'No se pudo recuperar la información del usuario');
            }
        };

        obtenerDatosUsuario();

        if (route.params && route.params.transaccion) {
            const { transaccion } = route.params;
            const [year, month, day] = transaccion.fecha.split('T')[0].split('-');
            const formattedDate = `${day}-${month}-${year}`;
            setFecha(formattedDate);
            setDescripcion(transaccion.descripcion);
            setCuentaDebito(transaccion.cuenta_debito);
            setCodigoDebito(transaccion.codigo_debito);
            setCuentaCredito(transaccion.cuenta_credito);
            setCodigoCredito(transaccion.codigo_credito);
            setMonto(formatCurrency(transaccion.monto));
            setReferenciaExterna(transaccion.referencia_externa);
            setEstado(transaccion.estado);
            setIsEditing(true);
            setTransaccionId(transaccion.id);
        }
    }, [route.params]);
    
    const formatCurrency = (value) => {
        if (!value) return '';
        const number = parseFloat(value.toString().replace(/RD\$|,/g, ''));
        return `RD$ ${number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    };

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



    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#f9f9f9' }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
                    <View style={styles.container}>
                        <Card style={styles.card}>
                            <Card.Title
                                title={isEditing ? 'Modificar Transacción' : 'Insertar Transacción'}
                                titleStyle={styles.cardTitle}
                            />
                            <Divider style={styles.divider} />
                            <Card.Content>
                                <TextInput
                                    mode="outlined"
                                    label="Fecha"
                                    placeholder="DD-MM-AAAA"
                                    value={fecha}
                                    editable={false}
                                    style={styles.input}
                                    right={<TextInput.Icon icon="calendar" onPress={() => setModalVisible(true)} />}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Descripción"
                                    placeholder="Ingrese la descripción"
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                    style={[styles.input, styles.multilineInput]}
                                    multiline
                                />
                                {cuentaDebito && (
                                    <Text style={styles.label}>Cuenta Débito Seleccionada:</Text>
                                )}
                                <Picker
                                    selectedValue={cuentaDebito}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setCuentaDebito(itemValue)}
                                >
                                    <Picker.Item label="Seleccione una cuenta débito" value="" />
                                    {cuentas.map((cuenta) => (
                                        <Picker.Item
                                            key={cuenta.id}
                                            label={`${cuenta.codigo} - ${cuenta.nombre}`}
                                            value={cuenta.id}
                                        />
                                    ))}
                                </Picker>
                                {cuentaCredito && (
                                    <Text style={styles.label}>Cuenta Crédito Seleccionada:</Text>
                                )}
                                <Picker
                                    selectedValue={cuentaCredito}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setCuentaCredito(itemValue)}
                                >
                                    <Picker.Item label="Seleccione una cuenta crédito" value="" />
                                    {cuentas.map((cuenta) => (
                                        <Picker.Item
                                            key={cuenta.id}
                                            label={`${cuenta.codigo} - ${cuenta.nombre}`}
                                            value={cuenta.id}
                                        />
                                    ))}
                                </Picker>
                                <TextInput
                                    mode="outlined"
                                    label="Monto"
                                    placeholder="Ingrese el monto"
                                    value={monto}
                                    onChangeText={setMonto}
                                    keyboardType="numeric"
                                    style={styles.input}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Referencia Externa"
                                    placeholder="Ingrese referencia externa"
                                    value={referenciaExterna}
                                    onChangeText={setReferenciaExterna}
                                    style={styles.input}
                                />
                                <Picker
                                    selectedValue={estado}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setEstado(itemValue)}
                                >
                                    <Picker.Item label="Pendiente" value="pendiente" />
                                    <Picker.Item label="Completada" value="completada" />
                                </Picker>
                                <Picker
                                    selectedValue={categoria}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setCategoria(itemValue)}
                                >
                                    <Picker.Item label="Seleccione Categoría" value="" />
                                    <Picker.Item label="Venta" value="venta" />
                                    <Picker.Item label="Compra" value="compra" />
                                    <Picker.Item label="Gasto" value="gasto" />
                                </Picker>
                                <Picker
                                    selectedValue={metodoPago}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setMetodoPago(itemValue)}
                                >
                                    <Picker.Item label="Seleccione Método de Pago" value="" />
                                    <Picker.Item label="Efectivo" value="efectivo" />
                                    <Picker.Item label="Transferencia" value="transferencia" />
                                    <Picker.Item label="Tarjeta" value="tarjeta" />
                                </Picker>
                                <Picker
                                    selectedValue={asociado}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => setAsociado(itemValue)}
                                >
                                    <Picker.Item label="Seleccione Cliente o Proveedor" value="" />
                                    <Picker.Item label="Cliente" value="cliente" />
                                    <Picker.Item label="Proveedor" value="proveedor" />
                                </Picker>
                                <TextInput
                                    mode="outlined"
                                    label="Proyecto/Departamento"
                                    placeholder="Ingrese el nombre del proyecto o departamento"
                                    value={proyecto}
                                    onChangeText={setProyecto}
                                    style={styles.input}
                                />
                            </Card.Content>
                        </Card>
                        <View style={styles.buttonContainer}>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                style={styles.button}
                                labelStyle={styles.buttonLabel}
                            >
                                {isEditing ? 'Actualizar Transacción' : 'Crear Transacción'}
                            </Button>
                        </View>
                    </View>
                    <DatePickerComponent
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onDateSelected={(date) => setFecha(date)}
                />

                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );




};

const getStyles = (isDarkMode, width) =>
    StyleSheet.create({
        scrollViewContentContainer: {
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: {
            flex: 1,
            width: width > 800 ? '60%' : '90%', // Ajuste dinámico para pantallas grandes
            alignSelf: 'center',
            backgroundColor: isDarkMode ? '#121212' : '#f9f9f9',
            padding: 16,
            borderRadius: 8,
        },
        card: {
            marginVertical: 16,
            borderRadius: 8,
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
        },
        cardTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
        },
        divider: {
            marginVertical: 8,
            backgroundColor: isDarkMode ? '#444' : '#ccc',
        },
        input: {
            marginBottom: 12,
            backgroundColor: isDarkMode ? '#2c2c2c' : '#fff',
            color: isDarkMode ? '#fff' : '#000',
        },
        multilineInput: {
            height: 100,
        },
        picker: {
            marginBottom: 12,
            color: isDarkMode ? '#fff' : '#000',
        },
        buttonContainer: {
            marginTop: 20,
            alignItems: 'center',
        },
        button: {
            borderRadius: 8,
            width: '100%',
            backgroundColor: isDarkMode ? '#333' : '#007bff',
        },
        buttonLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#fff',
        },
        label: {
            fontSize: 14,
            color: isDarkMode ? '#ccc' : '#333',
            marginBottom: 4,
            marginLeft: 8,
            fontWeight: '500',
        },

    });

export default InsertarTransaccionScreen;



