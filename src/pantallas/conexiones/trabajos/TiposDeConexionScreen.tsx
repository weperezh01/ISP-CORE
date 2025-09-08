import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HorizontalMenu from '../../../componentes/HorizontalMenu';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './TiposDeConexionScreenStyles';
import ConnectionTypeItemModern from './components/ConnectionTypeItemModern';
import ThemeSwitch from '../../../componentes/themeSwitch';


const TiposDeConexionScreen = ({ navigation, route }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);

    // Estados
    const [tiposDeConexion, setTiposDeConexion] = useState([]);
    const { ispId } = route.params;
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [newTipoConexion, setNewTipoConexion] = useState('');
    const [selectedTipo, setSelectedTipo] = useState(null); // Tipo seleccionado para eliminar
    // const [idIsp, setIdIsp] = useState(null);
    const [loading, setLoading] = useState(true);

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    // Cargar el ID del ISP y datos iniciales
    useEffect(() => {
        const fetchIspIdAndData = async () => {
            try {
                // const id = await AsyncStorage.getItem('ispId');
                // if (id) {
                // setIdIsp(id);
                await fetchTiposDeConexion(ispId);
                // } else {
                // Alert.alert('Información', 'No se encontró un ID de ISP válido.');
                // }
            } catch (error) {
                console.error('Error al obtener el id_isp:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIspIdAndData();
    }, []);

    console.log('ID del ISP:', ispId);

    // Obtener tipos de conexión
    const fetchTiposDeConexion = async (ispId) => {
        try {
            const response = await fetch(`https://wellnet-rd.com/api/conexion-tipos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_isp: ispId }),
            });

            if (!response.ok) {
                throw new Error('Error al obtener los tipos de conexión.');
            }

            const data = await response.json();
            if (data.success && data.data.length > 0) {
                setTiposDeConexion(data.data);
            } else {
                Alert.alert('Información', 'No hay tipos de conexión disponibles.');
                setTiposDeConexion([]);
            }
        } catch (error) {
            console.error('Error al obtener los tipos de conexión:', error);
            Alert.alert('Error', 'Hubo un problema al obtener los tipos de conexión.');
        }
    };

    // Agregar un nuevo tipo de conexión
    const addTipoConexion = async () => {
        if (!newTipoConexion.trim()) {
            Alert.alert('Error', 'La descripción no puede estar vacía.');
            return;
        }

        try {
            console.log('Agregando tipo de conexión:', newTipoConexion);
            console.log('ID del ISP:', ispId);
            const response = await fetch(`https://wellnet-rd.com/api/conexion-tipos/agregar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_isp: ispId, descripcion_tipo_conexion: newTipoConexion }),
            });

            if (!response.ok) {
                throw new Error('Error al agregar el tipo de conexión.');
            }

            const data = await response.json();
            if (data.success) {
                setTiposDeConexion((prev) => [...prev, data.data]);
                setNewTipoConexion('');
                toggleModal();
            } else {
                Alert.alert('Error', data.message || 'No se pudo agregar el tipo de conexión.');
            }
        } catch (error) {
            console.error('Error al agregar el tipo de conexión:', error);
            Alert.alert('Error', 'Hubo un problema al agregar el tipo de conexión.');
        }
    };

    // Cambiar estado activo/inactivo
    const handleToggleSwitch = async (idTipoConexion, newEstado) => {
        try {
            const response = await fetch(`https://wellnet-rd.com/api/conexion-tipos/actualizar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_tipo_conexion: idTipoConexion, estado: newEstado ? 'activo' : 'inactivo' }),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el estado del tipo de conexión.');
            }

            setTiposDeConexion((prev) =>
                prev.map((item) =>
                    item.id_tipo_conexion === idTipoConexion
                        ? { ...item, estado: newEstado ? 'activo' : 'inactivo' }
                        : item
                )
            );
        } catch (error) {
            console.error('Error al actualizar el estado del tipo de conexión:', error);
            Alert.alert('Error', 'Hubo un problema al actualizar el estado del tipo de conexión.');
        }
    };

    // Eliminar un tipo de conexión
    const deleteTipoConexion = async () => {
        if (!selectedTipo) return;

        try {
            const response = await fetch(`https://wellnet-rd.com/api/conexion-tipos/borrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_tipo_conexion: selectedTipo.id_tipo_conexion }),
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el tipo de conexión.');
            }

            const data = await response.json();
            if (data.success) {
                setTiposDeConexion((prev) =>
                    prev.filter((item) => item.id_tipo_conexion !== selectedTipo.id_tipo_conexion)
                );
                setDeleteModalVisible(false);
                setSelectedTipo(null);
            } else {
                Alert.alert('Error', data.message || 'No se pudo eliminar el tipo de conexión.');
            }
        } catch (error) {
            console.error('Error al eliminar el tipo de conexión:', error);
            Alert.alert('Error', 'Hubo un problema al eliminar el tipo de conexión.');
        }
    };

    const renderItem = ({ item }) => (
        <ConnectionTypeItemModern
            item={item}
            styles={styles}
            onToggleSwitch={handleToggleSwitch}
            onLongPress={(selectedItem) => {
                setSelectedTipo(selectedItem);
                setDeleteModalVisible(true);
            }}
            isDarkMode={isDarkMode}
        />
    );


    const botones = [
        { id: '5', title: 'Agregar', icon: 'add', action: toggleModal },
        { id: '1', title: 'Clientes', screen: 'ClientListScreen', icon: 'people' },
        { id: '2', title: 'Facturas', screen: 'FacturacionesScreen', icon: 'receipt' },
        { id: '3', title: 'Reportes', screen: 'IngresosScreen', icon: 'bar-chart' },
        {
            id: '4',
            title: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
            icon: isDarkMode ? 'light-mode' : 'dark-mode',
            action: toggleTheme,
        },
    ];

    const formatConnectionTypeCount = (count) => {
        if (count === 1) return '1 Tipo';
        return `${count} Tipos`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#2563EB'} />
                <Text style={styles.loadingText}>Cargando tipos de conexión...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>🏷️ {formatConnectionTypeCount(tiposDeConexion.length)}</Text>
                        <Text style={styles.headerSubtitle}>
                            Gestión de tipos de conexión
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <View style={styles.totalBadge}>
                            <Text style={styles.totalBadgeText}>
                                {tiposDeConexion.filter(t => t.estado === 'activo').length} Activos
                            </Text>
                        </View>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            <View style={styles.contentContainer}>
                {/* Connection Types List */}
                {tiposDeConexion.length > 0 ? (
                    <FlatList
                        data={tiposDeConexion}
                        keyExtractor={(item) => item.id_tipo_conexion.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🏷️</Text>
                        <Text style={styles.emptyTitle}>
                            No hay tipos de conexión registrados
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            Comienza agregando un nuevo tipo de conexión al sistema
                        </Text>
                    </View>
                )}
            </View>

            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />

            {/* Modal para agregar tipo de conexión */}
            <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>➕ Agregar Tipo de Conexión</Text>
                        </View>
                        
                        <View style={styles.modalContent}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Descripción del Tipo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: Fibra Óptica, Cable Coaxial, etc."
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={newTipoConexion}
                                    onChangeText={setNewTipoConexion}
                                    autoFocus={true}
                                />
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.modalButtonSecondary]} 
                                onPress={() => {
                                    setModalVisible(false);
                                    setNewTipoConexion('');
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.modalButtonPrimary]} 
                                onPress={addTipoConexion}
                            >
                                <Text style={styles.modalButtonText}>Agregar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para confirmar eliminación */}
            <Modal visible={deleteModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>⚠️ Confirmar Eliminación</Text>
                        </View>
                        
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>
                                ¿Estás seguro de que deseas eliminar el tipo de conexión?
                            </Text>
                            <Text style={styles.modalText}>
                                <Text style={{ fontWeight: '700' }}>
                                    "{selectedTipo?.descripcion_tipo_conexion}"
                                </Text>
                            </Text>
                            <Text style={styles.modalText}>
                                Esta acción no se puede deshacer.
                            </Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.modalButtonSecondary]} 
                                onPress={() => {
                                    setDeleteModalVisible(false);
                                    setSelectedTipo(null);
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.modalButtonDanger]} 
                                onPress={deleteTipoConexion}
                            >
                                <Text style={styles.modalButtonText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TiposDeConexionScreen;
