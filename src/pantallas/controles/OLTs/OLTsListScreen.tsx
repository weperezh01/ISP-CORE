import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './OLTsListScreenStyles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';

const OLTsListScreen = ({ route }) => {
    const { id_usuario } = route.params;
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [isLoading, setIsLoading] = useState(false);
    const [olts, setOlts] = useState([]);
    const [filteredOlts, setFilteredOlts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOlts();
    }, []);

    const fetchOlts = async () => {
        console.log('🔍 [OLTs] Iniciando fetchOlts...');
        setIsLoading(true);
        try {
            const storedIspId = await AsyncStorage.getItem('@selectedIspId');
            console.log('🔍 [OLTs] ISP ID obtenido:', storedIspId);

            if (storedIspId) {
                console.log('🔍 [OLTs] Realizando petición a API...');
                const response = await fetch('https://wellnet-rd.com:444/api/olts/por-isp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ispId: storedIspId })
                });

                console.log('🔍 [OLTs] Response status:', response.status);
                console.log('🔍 [OLTs] Response ok:', response.ok);

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ [OLTs] Respuesta completa:', JSON.stringify(data, null, 2));
                    console.log('✅ [OLTs] Tipo de respuesta:', typeof data);
                    console.log('✅ [OLTs] Es array?:', Array.isArray(data));

                    // Manejar diferentes estructuras de respuesta
                    let oltsArray = [];
                    if (Array.isArray(data)) {
                        oltsArray = data;
                    } else if (data && data.olts && Array.isArray(data.olts)) {
                        oltsArray = data.olts;
                    } else if (data && data.data && data.data.olts && Array.isArray(data.data.olts)) {
                        // Estructura del backend: { success: true, data: { olts: [...] } }
                        oltsArray = data.data.olts;
                    } else if (data && data.data && Array.isArray(data.data)) {
                        oltsArray = data.data;
                    } else if (data && Array.isArray(data.result)) {
                        oltsArray = data.result;
                    }

                    console.log('✅ [OLTs] Array procesado:', oltsArray.length, 'OLTs');
                    console.log('✅ [OLTs] Primera OLT procesada:', oltsArray[0]);

                    setOlts(oltsArray);
                    setFilteredOlts(oltsArray);
                } else {
                    const errorText = await response.text();
                    console.error('❌ [OLTs] Error response:', errorText);
                    throw new Error(`Failed to fetch OLTs: ${response.status} - ${errorText}`);
                }
            } else {
                console.error('❌ [OLTs] ISP ID no encontrado en AsyncStorage');
                throw new Error('ISP ID not found');
            }
        } catch (error) {
            console.error('❌ [OLTs] Error fetching OLTs:', error);
        } finally {
            console.log('🔍 [OLTs] fetchOlts completado');
            setIsLoading(false);
        }
    };

    const registrarNavegacion = async () => {
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0];
        const hora = fechaActual.toTimeString().split(' ')[0];
        const pantalla = 'OLTsListScreen';

        const datos = JSON.stringify({
            id_usuario,
            searchQuery,
            olts: filteredOlts
        });

        const navigationLogData = {
            id_usuario: id_usuario,
            fecha,
            hora,
            pantalla,
            datos
        };

        try {
            const response = await fetch('https://wellnet-rd.com:444/api/log-navegacion-registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(navigationLogData),
            });

            if (!response.ok) {
                throw new Error('Error al registrar la navegación.');
            }

            console.log('Navegación registrada exitosamente');
        } catch (error) {
            console.error('Error al registrar la navegación:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOlts();
            registrarNavegacion();
            return () => {};
        }, [])
    );

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text === '') {
            setFilteredOlts(olts);
        } else {
            const formattedQuery = text.toLowerCase();
            const filteredData = olts.filter(olt => {
                return olt.nombre_olt?.toLowerCase().includes(formattedQuery) ||
                    olt.ip_olt?.toLowerCase().includes(formattedQuery) ||
                    olt.id_olt?.toString().includes(formattedQuery) ||
                    olt.ubicacion?.toLowerCase().includes(formattedQuery);
            });
            setFilteredOlts(filteredData);
        }
    };

    const handleEdit = (oltId) => {
        navigation.navigate('AddOLTScreen', { oltId });
    };

    const confirmDelete = (oltId) => {
        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que quieres eliminar esta OLT?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar", onPress: () => deleteOlt(oltId)
                }
            ]
        );
    };

    const deleteOlt = async (oltId) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/olts/eliminar', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_olt: oltId })
            });

            if (response.ok) {
                Alert.alert("Eliminación Exitosa", "La OLT ha sido eliminada correctamente.");
                setOlts(prevOlts => prevOlts.filter(item => item.id_olt !== oltId));
                fetchOlts();
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to delete OLT: ${errorText}`);
            }
        } catch (error) {
            console.error('Error deleting OLT:', error);
            Alert.alert("Error", `Error al eliminar la OLT: ${error.toString()}`);
        }
    };

    const getOltStatus = (olt) => {
        if (olt.ip_olt && olt.nombre_olt) {
            return {
                badge: styles.statusActive,
                text: styles.statusTextActive,
                label: '🟢 Activo'
            };
        } else {
            return {
                badge: styles.statusInactive,
                text: styles.statusTextInactive,
                label: '🔴 Inactivo'
            };
        }
    };

    const renderOltCard = ({ item }) => {
        const statusInfo = getOltStatus(item);

        return (
            <TouchableOpacity
                style={styles.oltCard}
                onPress={() => navigation.navigate('OLTDetailsScreen', { oltId: item.id_olt, id_usuario })}
                activeOpacity={0.8}
            >
                <View style={styles.oltHeader}>
                    <Text style={styles.oltIcon}>📡</Text>
                    <View style={styles.oltInfo}>
                        <Text style={styles.oltName}>{item.nombre_olt || 'OLT Sin Nombre'}</Text>
                        <Text style={styles.oltSubtitle}>ID: {item.id_olt}</Text>
                    </View>
                    <View style={[styles.oltStatusBadge, statusInfo.badge]}>
                        <Text style={statusInfo.text}>{statusInfo.label}</Text>
                    </View>
                </View>

                <View style={styles.oltDetails}>
                    <View style={styles.oltDetailRow}>
                        <Text style={styles.oltDetailLabel}>IP</Text>
                        <Text style={styles.oltDetailValue}>{item.ip_olt || 'No asignada'}</Text>
                    </View>
                    <View style={styles.oltDetailRow}>
                        <Text style={styles.oltDetailLabel}>Ubicación</Text>
                        <Text style={styles.oltDetailValue}>{item.ubicacion || 'No especificada'}</Text>
                    </View>
                    <View style={styles.oltDetailRow}>
                        <Text style={styles.oltDetailLabel}>Estado</Text>
                        <Text style={styles.oltDetailValue}>
                            {item.ip_olt ? 'Configurada' : 'Pendiente'}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => navigation.navigate('OLTDetailsScreen', { oltId: item.id_olt, id_usuario })}
                    >
                        <Text>👁️</Text>
                        <Text style={styles.viewButtonText}>Ver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEdit(item.id_olt)}
                    >
                        <Text>✏️</Text>
                        <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => confirmDelete(item.id_olt)}
                    >
                        <Text>🗑️</Text>
                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => {
        console.log('🔍 [OLTs] renderEmptyState - olts.length:', olts.length, 'isLoading:', isLoading);
        console.log('🔍 [OLTs] renderEmptyState - filteredOlts.length:', filteredOlts.length, 'searchQuery:', searchQuery);

        if (olts.length === 0 && !isLoading) {
            console.log('📋 [OLTs] Mostrando estado vacío - no hay OLTs');
            return (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateIcon}>📡</Text>
                    <Text style={styles.emptyStateTitle}>No hay OLTs configuradas</Text>
                    <Text style={styles.emptyStateMessage}>
                        Comienza agregando tu primera OLT para gestionar tu red de fibra óptica desde aquí.
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyStateButton}
                        onPress={() => navigation.navigate('AddOLTScreen')}
                    >
                        <Text>➕</Text>
                        <Text style={styles.emptyStateButtonText}>Agregar Primera OLT</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (filteredOlts.length === 0 && searchQuery && !isLoading) {
            console.log('🔍 [OLTs] Mostrando estado vacío - sin resultados de búsqueda');
            return (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateIcon}>🔍</Text>
                    <Text style={styles.emptyStateTitle}>No se encontraron resultados</Text>
                    <Text style={styles.emptyStateMessage}>
                        No hay OLTs que coincidan con "{searchQuery}". Intenta con otros términos de búsqueda.
                    </Text>
                </View>
            );
        }

        console.log('✅ [OLTs] No mostrando estado vacío');
        return null;
    };

    const renderLoadingState = () => {
        if (!isLoading) return null;

        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando OLTs...</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backButtonText}>← Volver</Text>
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Lista de OLTs</Text>
                            <Text style={styles.headerSubtitle}>
                                {filteredOlts.length} de {olts.length} OLTs
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <View style={styles.totalBadge}>
                            <Text style={styles.totalBadgeText}>{olts.length}</Text>
                        </View>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            {/* Action Bar */}
            <View style={styles.actionBar}>
                <View>
                    <Text style={styles.oltDetailLabel}>Gestión de OLTs</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddOLTScreen')}
                >
                    <Text>➕</Text>
                    <Text style={styles.addButtonText}>Añadir OLT</Text>
                </TouchableOpacity>
            </View>

            {/* Search Section */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        onChangeText={handleSearch}
                        value={searchQuery}
                        placeholder="Buscar por ID, nombre, IP o ubicación..."
                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                        autoCapitalize="none"
                        clearButtonMode="always"
                    />
                </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {renderLoadingState()}
                {renderEmptyState()}

                {!isLoading && filteredOlts.length > 0 && (
                    <>
                        {console.log('📋 [OLTs] Renderizando FlatList con', filteredOlts.length, 'OLTs')}
                        <FlatList
                            data={filteredOlts}
                            keyExtractor={(item) => item.id_olt.toString()}
                            renderItem={renderOltCard}
                            contentContainerStyle={styles.oltList}
                            showsVerticalScrollIndicator={false}
                        />
                    </>
                )}
            </View>
        </View>
    );
};

export default OLTsListScreen;