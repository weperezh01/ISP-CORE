import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Modal,
    TextInput,
    TouchableOpacity,
    Button
} from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import HorizontalMenu from '../../../componentes/HorizontalMenu';
import MenuModal from '../../../componentes/MenuModal';
import { Alert } from 'react-native';

const OrderTypesScreen = ({ route, navigation }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);
    const [menuVisible, setMenuVisible] = useState(false);
    const [orderTypes, setOrderTypes] = useState([]); // Tipos de órdenes
    const [loading, setLoading] = useState(true); // Indicador de carga
    const [modalVisible, setModalVisible] = useState(false); // Estado del modal
    const [newOrderType, setNewOrderType] = useState({ nombre: '', descripcion: '' }); // Estado del formulario
    const [selectedOrderType, setSelectedOrderType] = useState(null); // Ítem seleccionado para editar
    // const isp = route.params?.isp || {}; // Información del ISP
    const { isp, id_isp, permisos } = route.params;
    // const id_isp = route.params?.id_isp || {}; // Información del ISP
    const usuarioId = route.params?.usuarioId || {}; // ID del usuario

    const [usuario, setUsuario] = useState({});

    console.log('ISP:', id_isp);

    useEffect(() => {
        const fetchOrderTypes = async () => {
            try {
                if (!id_isp) {
                    console.error('No se encontró el id_isp.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`https://wellnet-rd.com:444/api/order-types?id_isp=${id_isp}`);
                const data = await response.json();
                setOrderTypes(data);
            } catch (error) {
                console.error('Error al cargar los tipos de órdenes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderTypes();
    }, [id_isp]);

    // Manejar la apertura del modal con datos cargados
    const handleEditOrderType = (item) => {
        if (item) {
            // Editar un tipo de orden existente
            setSelectedOrderType(item);
            setNewOrderType({
                nombre: item.orden_nombre,
                descripcion: item.orden_tipo_descripcion_general,
            });
        } else {
            // Agregar un nuevo tipo de orden
            setSelectedOrderType(null);
            setNewOrderType({
                nombre: '',
                descripcion: '',
            });
        }
        setModalVisible(true); // Abrir el modal
    };


    // Manejar el envío del formulario (Agregar o Editar)
    const handleSaveOrderType = async () => {
        Alert.alert(
            'Confirmación',
            selectedOrderType ? '¿Actualizar este tipo de orden?' : '¿Agregar este nuevo tipo de orden?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Guardar',
                    onPress: async () => {
                        try {
                            const isUpdating = Boolean(selectedOrderType);
                            const url = isUpdating
                                ? `https://wellnet-rd.com:444/api/order-types/${selectedOrderType.id_orden_tipo}`
                                : 'https://wellnet-rd.com:444/api/order-types';

                            const method = isUpdating ? 'PUT' : 'POST';

                            const response = await fetch(url, {
                                method,
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    id_isp: id_isp,
                                    nombre: newOrderType.nombre,
                                    descripcion: newOrderType.descripcion,
                                    id_usuario: usuarioId,
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                if (isUpdating) {
                                    // Actualizar un ítem existente
                                    setOrderTypes((prev) =>
                                        prev.map((orderType) =>
                                            orderType.id_orden_tipo === selectedOrderType.id_orden_tipo
                                                ? data
                                                : orderType
                                        )
                                    );
                                } else {
                                    // Agregar un nuevo ítem
                                    setOrderTypes((prev) => [...prev, data]);
                                }

                                setModalVisible(false);
                                setNewOrderType({ nombre: '', descripcion: '' });
                                setSelectedOrderType(null);
                            } else {
                                console.error('Error al guardar el tipo de orden:', data.error);
                                Alert.alert('Error', 'No se pudo guardar el tipo de orden. Inténtalo nuevamente.');
                            }
                        } catch (error) {
                            console.error('Error al guardar el tipo de orden:', error);
                            Alert.alert('Error', 'Ocurrió un error al guardar el tipo de orden.');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteOrderType = async () => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro de que deseas eliminar este tipo de orden?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wellnet-rd.com:444/api/order-types/delete/${selectedOrderType.id_orden_tipo}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            });

                            const data = await response.json();
                            if (response.ok) {
                                // Filtrar el ítem eliminado de la lista
                                setOrderTypes((prev) =>
                                    prev.filter((orderType) => orderType.id_orden_tipo !== selectedOrderType.id_orden_tipo)
                                );
                                setModalVisible(false); // Cerrar el modal
                                setSelectedOrderType(null);
                                Alert.alert('Éxito', 'El tipo de orden se eliminó correctamente.');
                            } else {
                                console.error('Error al eliminar el tipo de orden:', data.message);
                                Alert.alert('Error', data.message || 'No se pudo eliminar el tipo de orden.');
                            }
                        } catch (error) {
                            console.error('Error al eliminar el tipo de orden:', error);
                            Alert.alert('Error', 'Ocurrió un error al eliminar el tipo de orden.');
                        }
                    },
                },
            ]
        );
    };

    // 1) Saca la lista de permisos
    // Lo más seguro es que tengas permisos.permisos
    // (es decir, un array dentro de la propiedad "permisos")
    const permisosArray = permisos?.usuario || [];

    // 2) Verifica si al menos uno de los objetos en ese array
    // cumple con id_permiso=4, id_permiso_sub=44, estado_permiso='Y'
    const hasNewOrderPermission = permisosArray.some(
        (perm) =>
            perm.nivel_usuario !== 'OPERADOR'
    );

    const botones = [
        { id: '6', action: () => setMenuVisible(true), icon: 'bars' },
        // { id: '1', title: 'Nuevo Tipo De Orden', action: () => handleEditOrderType(null), icon: 'plus' },

        // Mostrar el botón de filtro solo si el usuario no es operador

        ...(hasNewOrderPermission
            ? [
                {
                    id: '1',
                    title: 'Nuevo Tipo De Orden',
                    icon: 'filter',
                    action: () => handleEditOrderType(null),
                    icon: 'plus'
                },
            ]
            : []),

        //  ...(usuario.nivel_usuario !== 'OPERADOR'
        //     ? [
        //         {
        //             id: '1',
        //             title: 'Nuevo Tipo De Orden',
        //             icon: 'filter',
        //             action: () => handleEditOrderType(null),
        //             icon: 'plus' 
        //         },
        //     ]
        //     : []),
        {
            id: '4',
            title: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
            icon: isDarkMode ? 'sun-o' : 'moon-o',
            action: toggleTheme,
        },
    ];


    const renderOrderType = ({ item }) => {
        const isOperator = permisosArray.some(
            (perm) => perm.nivel_usuario === 'OPERADOR'
        );
    
        return (
            <TouchableOpacity
                onPress={() => {
                    if (!isOperator) {
                        handleEditOrderType(item); // Solo permite la acción si no es "OPERADOR"
                    }
                }}
                disabled={isOperator} // Deshabilita el clic si es "OPERADOR"
            >
                <View
                    style={[
                        styles.itemContainer,
                        isOperator && { backgroundColor: isDarkMode ? '#333' : '#EEE' }, // Cambia el estilo si está deshabilitado
                    ]}
                >
                    <Text style={styles.itemText}>{item.orden_nombre}</Text>
                    <Text style={styles.itemDescription}>{item.orden_tipo_descripcion_general}</Text>
                </View>
            </TouchableOpacity>
        );
    };
    

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>Tipos de Órdenes</Text>
                {loading ? (
                    <ActivityIndicator size="large" color={isDarkMode ? '#FFF' : '#000'} />
                ) : (
                    <FlatList
                        data={orderTypes}
                        keyExtractor={(item) => item.id_orden_tipo.toString()}
                        renderItem={renderOrderType}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <Text style={[styles.noDataText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                                No hay tipos de órdenes disponibles.
                            </Text>
                        }
                    />
                )}
            </View>
            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, isDarkMode ? styles.modalDark : styles.modalLight]}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                            {selectedOrderType ? 'Editar Tipo de Orden' : 'Agregar Nuevo Tipo de Orden'}
                        </Text>
                        <TextInput
                            style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
                            placeholder="Nombre del tipo de orden"
                            placeholderTextColor={isDarkMode ? '#AAA' : '#666'}
                            value={newOrderType.nombre}
                            onChangeText={(text) => setNewOrderType((prev) => ({ ...prev, nombre: text }))}
                        />
                        <TextInput
                            style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
                            placeholder="Descripción"
                            placeholderTextColor={isDarkMode ? '#AAA' : '#666'}
                            value={newOrderType.descripcion}
                            onChangeText={(text) => setNewOrderType((prev) => ({ ...prev, descripcion: text }))}
                            multiline
                        />
                        <View style={styles.modalButtons}>
                            {selectedOrderType && (
                                <Button
                                    title="Eliminar"
                                    onPress={handleDeleteOrderType}
                                    color="red"
                                />
                            )}
                            <Button
                                title="Cancelar"
                                onPress={() => {
                                    setModalVisible(false);
                                    setNewOrderType({ nombre: '', descripcion: '' });
                                    setSelectedOrderType(null);
                                }}
                                color={isDarkMode ? '#888' : '#555'}
                            />
                            <Button
                                title="Guardar"
                                onPress={handleSaveOrderType}
                                color={isDarkMode ? '#4CAF50' : '#007BFF'}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};


const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: isDarkMode ? '#121212' : '#F5F5F5', // Fondo general
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: isDarkMode ? '#FFF' : '#000', // Texto principal
    },
    listContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    itemContainer: {
        padding: 15,
        marginVertical: 10,
        backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF', // Fondo de cada ítem
        borderRadius: 10,
        borderWidth: 1,
        borderColor: isDarkMode ? '#333' : '#DDD', // Borde visible
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    itemText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isDarkMode ? '#FFF' : '#000', // Texto del ítem
    },
    itemDescription: {
        fontSize: 14,
        marginTop: 5,
        color: isDarkMode ? '#AAA' : '#555', // Descripción
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: isDarkMode ? '#AAA' : '#666',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
    },
    modalContent: {
        width: '90%',
        padding: 20,
        borderRadius: 10,
        backgroundColor: isDarkMode ? '#333' : '#FFF', // Fondo del modal
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: isDarkMode ? '#FFF' : '#000',
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    inputLight: {
        borderColor: '#CCC',
        backgroundColor: '#FFF',
        color: '#000',
    },
    inputDark: {
        borderColor: '#555',
        backgroundColor: '#444',
        color: '#FFF',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});



export default OrderTypesScreen;
