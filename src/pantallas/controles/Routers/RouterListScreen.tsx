import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from './RouterListScreenStyles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeSwitch from '../../../componentes/themeSwitch';

const RoutersListScreen = ( { route } ) => {
    const { id_usuario } = route.params;
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const [isLoading, setIsLoading] = useState(false);
    const [routers, setRouters] = useState([]);  // Almacena todos los routers sin filtrar
    const [filteredRouters, setFilteredRouters] = useState([]);  // Almacena los routers filtrados
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        

        fetchRouters();
    }, []);

    const fetchRouters = async () => {
        setIsLoading(true);
        try {
            const storedIspId = await AsyncStorage.getItem('@selectedIspId');
            if (storedIspId) {
                const response = await fetch('https://wellnet-rd.com:444/api/routers/por-isp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ispId: storedIspId })
                });
                if (response.ok) {
                    const data = await response.json();
                    setRouters(data);
                    setFilteredRouters(data);
                } else {
                    throw new Error('Failed to fetch routers');
                }
            } else {
                throw new Error('ISP ID not found');
            }
        } catch (error) {
            console.error('Error fetching routers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const registrarNavegacion = async () => {
        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; 
        const hora = fechaActual.toTimeString().split(' ')[0]; 
        const pantalla = 'RoutersListScreen';

        const datos = JSON.stringify({
            id_usuario,
            searchQuery,
            routers: filteredRouters
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
            fetchRouters();
            registrarNavegacion();
            // Opcional: Retorna una función para realizar cualquier limpieza
            return () => {};
        }, [])
    );

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text === '') {
            setFilteredRouters(routers);  // Si no hay texto de búsqueda, muestra todos los routers
        } else {
            const formattedQuery = text.toLowerCase();
            const filteredData = routers.filter(router => {
                return router.nombre_router.toLowerCase().includes(formattedQuery) ||
                    router.ip_publica.toLowerCase().includes(formattedQuery) ||
                    router.id_router.toString().includes(formattedQuery);
            });
            setFilteredRouters(filteredData);  // Actualiza la lista filtrada
        }
    };

    const handleEdit = (routerId) => {
        // Aquí podrías navegar a la pantalla de edición pasando el ID del router como parámetro
        navigation.navigate('AddRouterScreen', { routerId });
    };

    

    const confirmDelete = (routerId) => {
        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que quieres eliminar este router?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                { 
                    text: "Eliminar", onPress: () => deleteRouter(routerId) 
                }
            ]
        );
    };
    
    const deleteRouter = async (routerId) => {
        try {
            const response = await fetch('https://wellnet-rd.com:444/api/routers/eliminar', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_router: routerId })
            });
    
            if (response.ok) {
                Alert.alert("Eliminación Exitosa", "El router ha sido eliminado correctamente.");
                // Actualiza el estado de routers filtrando el router eliminado
                setRouters(prevRouters => prevRouters.filter(item => item.id_router !== routerId));
                // Vuelve a cargar los routers
                fetchRouters();
                // useEffect();
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to delete router: ${errorText}`);
            }
        } catch (error) {
            console.error('Error deleting router:', error);
            Alert.alert("Error", `Error al eliminar el router: ${error.toString()}`);
        }
    };
    
    
    
    


    const getRouterStatus = (router) => {
        // Simulate router status based on available data
        // In a real app, this would come from the API
        if (router.ip_publica && router.nombre_router) {
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

    const renderRouterCard = ({ item }) => {
        const statusInfo = getRouterStatus(item);
        
        return (
            <TouchableOpacity
                style={styles.routerCard}
                onPress={() => navigation.navigate('RouterDetailsScreen', { routerId: item.id_router, id_usuario })}
                activeOpacity={0.8}
            >
                <View style={styles.routerHeader}>
                    <Text style={styles.routerIcon}>🌐</Text>
                    <View style={styles.routerInfo}>
                        <Text style={styles.routerName}>{item.nombre_router || 'Router Sin Nombre'}</Text>
                        <Text style={styles.routerSubtitle}>ID: {item.id_router}</Text>
                    </View>
                    <View style={[styles.routerStatusBadge, statusInfo.badge]}>
                        <Text style={statusInfo.text}>{statusInfo.label}</Text>
                    </View>
                </View>
                
                <View style={styles.routerDetails}>
                    <View style={styles.routerDetailRow}>
                        <Text style={styles.routerDetailLabel}>IP Pública</Text>
                        <Text style={styles.routerDetailValue}>{item.ip_publica || 'No asignada'}</Text>
                    </View>
                    <View style={styles.routerDetailRow}>
                        <Text style={styles.routerDetailLabel}>Estado</Text>
                        <Text style={styles.routerDetailValue}>
                            {item.ip_publica ? 'Configurado' : 'Pendiente'}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => navigation.navigate('RouterDetailsScreen', { routerId: item.id_router, id_usuario })}
                    >
                        <Text>👁️</Text>
                        <Text style={styles.viewButtonText}>Ver</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEdit(item.id_router)}
                    >
                        <Text>✏️</Text>
                        <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => confirmDelete(item.id_router)}
                    >
                        <Text>🗑️</Text>
                        <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => {
        if (routers.length === 0 && !isLoading) {
            return (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateIcon}>🌐</Text>
                    <Text style={styles.emptyStateTitle}>No hay routers configurados</Text>
                    <Text style={styles.emptyStateMessage}>
                        Comienza agregando tu primer router para gestionar tu red desde aquí.
                    </Text>
                    <TouchableOpacity 
                        style={styles.emptyStateButton}
                        onPress={() => navigation.navigate('AddRouterScreen')}
                    >
                        <Text>➕</Text>
                        <Text style={styles.emptyStateButtonText}>Agregar Primer Router</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        
        if (filteredRouters.length === 0 && searchQuery && !isLoading) {
            return (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateIcon}>🔍</Text>
                    <Text style={styles.emptyStateTitle}>No se encontraron resultados</Text>
                    <Text style={styles.emptyStateMessage}>
                        No hay routers que coincidan con "{searchQuery}". Intenta con otros términos de búsqueda.
                    </Text>
                </View>
            );
        }
        
        return null;
    };

    const renderLoadingState = () => {
        if (!isLoading) return null;
        
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando routers...</Text>
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
                            <Text style={styles.headerTitle}>Lista de Routers</Text>
                            <Text style={styles.headerSubtitle}>
                                {filteredRouters.length} de {routers.length} routers
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <View style={styles.totalBadge}>
                            <Text style={styles.totalBadgeText}>{routers.length}</Text>
                        </View>
                        <ThemeSwitch />
                    </View>
                </View>
            </View>

            {/* Action Bar */}
            <View style={styles.actionBar}>
                <View>
                    <Text style={styles.routerDetailLabel}>Gestión de Routers</Text>
                </View>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddRouterScreen')}
                >
                    <Text>➕</Text>
                    <Text style={styles.addButtonText}>Añadir Router</Text>
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
                        placeholder="Buscar por ID, nombre o IP pública..."
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
                
                {!isLoading && filteredRouters.length > 0 && (
                    <FlatList
                        data={filteredRouters}
                        keyExtractor={(item) => item.id_router.toString()}
                        renderItem={renderRouterCard}
                        contentContainerStyle={styles.routerList}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
};

export default RoutersListScreen;
