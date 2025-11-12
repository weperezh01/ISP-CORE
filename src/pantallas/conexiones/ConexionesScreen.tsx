import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import HorizontalMenu from '../../componentes/HorizontalMenu';
import { getStyles } from './ConexionesScreenStyles';
import ConnectionItemModern from './components/ConnectionItemModern';
import { formatCurrency } from './utils/formatCurrency';
import { applyFilters } from './utils/applyFilters';
import { fetchConnectionList, fetchEstadosConexion, fetchTiposConexion, fetchCiclosBase } from './services/api';
import ThemeSwitch from '../../componentes/themeSwitch';
import { useFocusEffect } from '@react-navigation/native';

const ConexionesScreen = ({ navigation }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const styles = getStyles(isDarkMode);

    const [connectionList, setConnectionList] = useState([]);
    const [filteredConnectionList, setFilteredConnectionList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [ispId, setIspId] = useState('');
    const [connectionCount, setConnectionCount] = useState(0);
    const [filteredConnectionCount, setFilteredConnectionCount] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedEstados, setSelectedEstados] = useState([]);
    const [estadosConexion, setEstadosConexion] = useState([]);
    const [diaMesFiltro, setDiaMesFiltro] = useState('');
    const [tiposConexion, setTiposConexion] = useState([]);
    const [selectedTiposConexion, setSelectedTiposConexion] = useState([]);
    const [isDetailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [ciclosBase, setCiclosBase] = useState([]);
    const [selectedCiclosBase, setSelectedCiclosBase] = useState([]);
    const [isSearchVisible, setSearchVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [realtimeData, setRealtimeData] = useState(new Map()); // Map connectionId -> speeds
    const [realtimeEnabled, setRealtimeEnabled] = useState(true); // Flag para habilitar/deshabilitar RT
    const [retryCount, setRetryCount] = useState(0); // Contador de reintentos
    const [lastRetryTime, setLastRetryTime] = useState(null); // Último tiempo de reintento
    const [lastVisibleConnectionIds, setLastVisibleConnectionIds] = useState([]); // Para detectar cambios
    const [visibleItemsOnScreen, setVisibleItemsOnScreen] = useState([]); // Items visibles en viewport
    const [expandedItems, setExpandedItems] = useState(new Set()); // Items expandidos
    const [viewabilityConfig] = useState({
        itemVisiblePercentThreshold: 50, // 50% del item debe estar visible
        minimumViewTime: 100 // Mínimo 100ms visible
    });


    /* ------------------------------------------------------------------
   *  ①  Re-filtrar EN CUANTO cambie algo relacionado al buscador o filtros
   * ------------------------------------------------------------------ */
    useEffect(() => {
        if (connectionList.length === 0) return;

        const filtered = applyFilters({
            connectionList,
            searchQuery,
            selectedEstados,
            diaMesFiltro,
            selectedTiposConexion,
            selectedCiclosBase,
        });

        setFilteredConnectionList(filtered);
        setFilteredConnectionCount(filtered.length);
    }, [
        connectionList,        // cuando llega la data inicial o se recarga
        searchQuery,           // mientras escribes en la barra
        selectedEstados,
        diaMesFiltro,
        selectedTiposConexion,
        selectedCiclosBase,
    ]);

    /* ------------------------------------------------------------------
     *  ②  El botón “Aplicar” del modal ya NO necesita recalcular:
     *      solo cierra el modal (el efecto de arriba se encargará).
     * ------------------------------------------------------------------ */
    // const applyFilter = () => {
    //     toggleModal();         // 👈🏻  quita el setFiltered… que había antes
    // };

    // 🎉 NUEVA FUNCIONALIDAD: Health Check del sistema RT
    const checkRealtimeHealth = async () => {
        try {
            console.log('🏥 Verificando salud del sistema RT...');
            const response = await fetch('https://wellnet-rd.com:444/api/realtime/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const health = await response.json();
                if (health.success && health.data) {
                    console.log(`🏥 Salud del sistema RT: ${health.data.routers_health_percentage}% routers, ${health.data.connections_health_percentage}% conexiones`);
                    
                    if (health.data.recommendations && health.data.recommendations.length > 0) {
                        console.warn('💡 Recomendaciones del sistema:', health.data.recommendations);
                    }
                    
                    if (health.data.problematic_routers && health.data.problematic_routers.length > 0) {
                        console.warn('🔧 Routers problemáticos detectados:', health.data.problematic_routers);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error obteniendo health check:', error);
        }
    };

    // Función para obtener datos en tiempo real solo de conexiones visibles en viewport
    const fetchRealtimeData = async () => {
        try {
            // Usar items visibles en pantalla si están disponibles, sino usar las primeras 40
            let targetConnectionIds;
            
            if (visibleItemsOnScreen.length > 0) {
                // Usar solo las conexiones que están realmente visibles en pantalla
                targetConnectionIds = visibleItemsOnScreen.map(item => item.id_conexion);
                console.log(`👀 Obteniendo RT para ${targetConnectionIds.length} conexiones visibles en viewport`);
            } else {
                // Fallback: usar las primeras 40 conexiones de la lista filtrada
                const MAX_CONNECTIONS_RT = 40;
                targetConnectionIds = filteredConnectionList.slice(0, MAX_CONNECTIONS_RT).map(conn => conn.id_conexion);
                console.log(`📋 Obteniendo RT para las primeras ${targetConnectionIds.length} conexiones (viewport no detectado)`);
            }
            
            if (targetConnectionIds.length === 0) {
                console.log('🔄 No hay conexiones para obtener datos RT');
                return;
            }
            
            console.log(`🔄 RT Request para conexiones: [${targetConnectionIds.slice(0, 5).join(', ')}${targetConnectionIds.length > 5 ? '...' : ''}]`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos timeout para endpoint lento

            const response = await fetch('https://wellnet-rd.com:444/api/active-connections?realtime=true', {
                method: 'POST', // Cambiar a POST para enviar IDs
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    connection_ids: targetConnectionIds
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const result = await response.json();
                console.log('📡 Respuesta del endpoint active-connections:', result);

                if (result.success && result.data && Array.isArray(result.data)) {
                    // 🎉 NUEVA FUNCIONALIDAD: Procesar debug info del backend
                    if (result.debug_info) {
                        console.log(`🎯 Backend Debug Info - Éxito: ${result.debug_info.success_rate}, Tiempo: ${result.debug_info.response_time}`);
                        
                        if (result.debug_info.router_stats) {
                            console.log('📊 Estadísticas por router del backend:', result.debug_info.router_stats);
                        }
                        
                        if (result.debug_info.errors && result.debug_info.errors.length > 0) {
                            console.warn(`⚠️ Backend reporta ${result.debug_info.errors.length} errores específicos:`, result.debug_info.errors);
                        }
                        
                        if (parseFloat(result.debug_info.success_rate) < 70) {
                            console.error(`🚨 Backend confirma problema crítico: ${result.debug_info.success_rate} de éxito`);
                        }
                    }
                    const newRealtimeData = new Map();

                    result.data.forEach(conn => {
                        if (conn.id_conexion) {
                            // Debug logging para conexiones con datos RT
                            if (conn.download_rate > 0 || conn.upload_rate > 0) {
                                console.log(`📊 ✅ Conexión ${conn.id_conexion}: ⬇${conn.download_rate} bps ⬆${conn.upload_rate} bps (IP: ${conn.direccion_ip})`);
                            } else {
                                // 🚨 Log específico para conexiones problemáticas
                                console.warn(`📊 ❌ Conexión ${conn.id_conexion}: ⬇0 bps ⬆0 bps (IP: ${conn.direccion_ip}) - Router: ${conn.router?.nombre || 'N/A'} (ID: ${conn.router?.id_router || 'N/A'}) - Método: ${conn.collection_method || 'N/A'}`);
                            }
                            if (conn.router) {
                                console.log(`🔗 Conexión ${conn.id_conexion}: Router ${conn.router.nombre} (ID: ${conn.router.id_router})`);
                            }
                            
                            newRealtimeData.set(conn.id_conexion, {
                                downloadSpeed: conn.download_rate || 0,
                                uploadSpeed: conn.upload_rate || 0,
                                status: conn.status || 'unknown',
                                lastUpdate: new Date(),
                                // Información del router y métodos de recolección
                                routerInfo: conn.router || null,
                                collectionMethod: conn.collection_method || 'unknown',
                                responseTime: conn.response_time || 0,
                                // IP usada para las consultas (ahora desde router_direcciones_ip)
                                ipAddress: conn.direccion_ip || null
                            });
                        }
                    });

                    setRealtimeData(newRealtimeData);
                    // Estadísticas detalladas para diagnóstico de muestreo
                    const connectionsWithActivity = Array.from(newRealtimeData.values()).filter(data => data.downloadSpeed > 0 || data.uploadSpeed > 0);
                    const connectionsWithoutActivity = Array.from(newRealtimeData.values()).filter(data => data.downloadSpeed === 0 && data.uploadSpeed === 0);
                    const connectionsOnline = Array.from(newRealtimeData.values()).filter(data => data.status === 'online');
                    const routersActive = new Set(Array.from(newRealtimeData.values()).map(data => data.routerInfo?.id_router).filter(Boolean));
                    
                    console.log(`✅ Datos RT actualizados para ${newRealtimeData.size} conexiones activas`);
                    console.log(`📊 ${connectionsWithActivity.length} conexiones con actividad, ${connectionsWithoutActivity.length} sin actividad, ${connectionsOnline.length} online, ${routersActive.size} routers activos`);
                    
                    // 🚨 REPORTE DE PROBLEMA DE MUESTREO
                    if (connectionsWithoutActivity.length > 0) {
                        console.warn(`⚠️ PROBLEMA MUESTREO: ${connectionsWithoutActivity.length} conexiones con 0 bps de ${newRealtimeData.size} total`);
                        
                        // Agrupar por router para identificar patrones
                        const problemsByRouter = {};
                        connectionsWithoutActivity.forEach(data => {
                            const routerId = data.routerInfo?.id_router || 'sin_router';
                            const routerName = data.routerInfo?.nombre || 'Desconocido';
                            if (!problemsByRouter[routerId]) {
                                problemsByRouter[routerId] = { name: routerName, count: 0, connections: [] };
                            }
                            problemsByRouter[routerId].count++;
                            problemsByRouter[routerId].connections.push({
                                id: Object.keys(Object.fromEntries(newRealtimeData)).find(key => newRealtimeData.get(parseInt(key)) === data),
                                ip: data.ipAddress,
                                method: data.collectionMethod
                            });
                        });
                        
                        console.warn('📋 Problemas por router:', problemsByRouter);
                        
                        // Calcular tasa de éxito real
                        const successRate = ((connectionsWithActivity.length / newRealtimeData.size) * 100).toFixed(1);
                        console.warn(`📈 Tasa de éxito real: ${successRate}% (${connectionsWithActivity.length}/${newRealtimeData.size})`);
                        
                        // 🚨 GENERAR REPORTE AUTOMÁTICO PARA BACKEND
                        if (parseFloat(successRate) < 70) {
                            console.error(`🚨 CRÍTICO: Tasa de éxito RT muy baja (${successRate}%). Datos para backend:`);
                            console.error(`📊 RESUMEN: Total=${newRealtimeData.size}, Exitosas=${connectionsWithActivity.length}, Fallidas=${connectionsWithoutActivity.length}`);
                            console.error(`🔧 ROUTERS PROBLEMÁTICOS:`, Object.entries(problemsByRouter).map(([id, info]) => `${info.name}(${id}): ${info.count} conexiones fallidas`));
                            
                            // Muestrear algunas conexiones problemáticas para debugging
                            const sampleProblems = connectionsWithoutActivity.slice(0, 5).map(data => ({
                                router_id: data.routerInfo?.id_router,
                                router_name: data.routerInfo?.nombre,
                                connection_ip: data.ipAddress,
                                collection_method: data.collectionMethod,
                                status: data.status
                            }));
                            console.error(`🔍 MUESTRA DE CONEXIONES PROBLEMÁTICAS:`, sampleProblems);
                        }
                    }
                    
                    if (result.realtime_enabled && result.realtime_success_rate) {
                        console.log(`🎯 Tasa de éxito RT: ${result.realtime_success_rate}, tiempo: ${result.realtime_response_time}ms`);
                    }

                    // Resetear contador de reintentos al obtener datos exitosamente
                    resetRetryCounter();
                } else {
                    console.log('⚠️ Estructura de respuesta inesperada:', result);
                    setRealtimeData(new Map()); // Reset para evitar datos stale
                }
            } else {
                console.error('❌ Error HTTP obteniendo conexiones activas:', response.status, response.statusText);
                if (response.status === 404) {
                    console.log('🚫 Endpoint active-connections no disponible, deshabilitando tiempo real');
                    setRealtimeEnabled(false);
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('⏱️ Timeout obteniendo datos RT - endpoint muy lento, programando reintento');
                handleRealtimeError();
            } else {
                console.error('❌ Error de conexión al obtener datos RT:', error.message);
                handleRealtimeError();
            }
        }
    };

    // Función para manejar errores y reintentos del tiempo real
    const handleRealtimeError = () => {
        const now = Date.now();
        const currentRetryCount = retryCount + 1;
        
        // Configuración de reintentos escalados
        const MAX_RETRIES = 5;
        const RETRY_DELAYS = [60000, 120000, 300000, 600000, 900000]; // 1m, 2m, 5m, 10m, 15m - delays más largos para endpoint lento
        
        if (currentRetryCount <= MAX_RETRIES) {
            const delay = RETRY_DELAYS[currentRetryCount - 1];
            console.log(`🔄 Programando reintento ${currentRetryCount}/${MAX_RETRIES} en ${delay/1000} segundos`);
            
            setRetryCount(currentRetryCount);
            setLastRetryTime(now);
            setRealtimeEnabled(false); // Deshabilitar temporalmente
            
            // Programar reintento
            setTimeout(() => {
                console.log(`🔄 Ejecutando reintento ${currentRetryCount}/${MAX_RETRIES}`);
                setRealtimeEnabled(true); // Reactivar tiempo real
            }, delay);
        } else {
            console.error('❌ Máximo número de reintentos alcanzado, deshabilitando tiempo real permanentemente');
            setRealtimeEnabled(false);
            setRetryCount(0); // Reset contador para futuras sesiones
        }
    };

    // Función para resetear el contador de reintentos cuando las conexiones se recuperan exitosamente
    const resetRetryCounter = () => {
        if (retryCount > 0) {
            console.log('✅ Tiempo real recuperado, reseteando contador de reintentos');
            setRetryCount(0);
            setLastRetryTime(null);
        }
    };

    useEffect(() => {
        const obtenerIspId = async () => {
            try {
                // Recuperar el valor utilizando la clave correcta
                const id = await AsyncStorage.getItem('@selectedIspId');

                if (id !== null) {
                    console.log('✅ ID de ISP recuperado de AsyncStorage:', id);
                    setIspId(id); // Actualiza el estado con el ID recuperado
                } else {
                    console.log('⚠️ No se encontró ningún ID de ISP en AsyncStorage.');
                    setIspId('No ID');
                }
            } catch (error) {
                console.error('❌ Error al recuperar el ID del ISP desde AsyncStorage:', error);
            }
        };

        obtenerIspId();
    }, []);



    useEffect(() => {
        const loadEstados = async () => {
            try {
                const data = await fetchEstadosConexion();
                setEstadosConexion(data);
            } catch (error) {
                console.error('Error al cargar los estados de conexión:', error);
                Alert.alert('Error', 'No se pudo cargar los estados de conexión.');
            }
        };
        loadEstados();
    }, []);

    useEffect(() => {
        const loadTipos = async () => {
            if (!ispId) return;
            try {
                const data = await fetchTiposConexion(ispId);
                setTiposConexion(data);
            } catch (error) {
                console.error('Error al cargar los tipos de conexión:', error);
            }
        };
        loadTipos();
    }, [ispId]);

    useEffect(() => {
        const loadConnections = async () => {
            if (!ispId) {
                Alert.alert('Error', 'ID del ISP no disponible.');
                return;
            }
            try {
                setIsLoading(true);
                const data = await fetchConnectionList(ispId);
                const sortedConnections = data.sort((a, b) => b.id_conexion - a.id_conexion);
                setConnectionList(sortedConnections);
                setFilteredConnectionList(sortedConnections);
                setConnectionCount(data.length);
                setFilteredConnectionCount(data.length);
            } catch (error) {
                console.error('Error al cargar la lista de conexiones:', error);
                Alert.alert('Error', 'No se pudo cargar la lista de conexiones.');
            } finally {
                setIsLoading(false);
            }
        };
        if (ispId) {
            loadConnections();
        }
    }, [ispId]);

    // Polling para datos en tiempo real con intervalo adaptivo - solo cuando la pantalla está enfocada
    useFocusEffect(
        useCallback(() => {
            if (!ispId || isLoading || filteredConnectionList.length === 0 || !realtimeEnabled) return;

            console.log('🎯 ConexionesScreen: Pantalla enfocada - Iniciando polling RT');

            // Intervalo adaptivo optimizado para evitar timeouts del endpoint lento
            const getPollingInterval = (totalConnections, viewportConnections) => {
                // Si tenemos viewport activo, usar intervalos moderados para evitar saturar el endpoint
                if (viewportConnections > 0) {
                    if (viewportConnections <= 5) return 8000;   // 8 segundos para muy pocas conexiones
                    if (viewportConnections <= 10) return 12000; // 12 segundos para pocas conexiones
                    if (viewportConnections <= 20) return 15000; // 15 segundos para conexiones moderadas
                    return 20000; // 20 segundos para más de 20 en viewport
                }
                // Fallback para listas sin viewport - intervalos más espaciados
                if (totalConnections <= 10) return 10000;  // 10 segundos para listas muy pequeñas
                if (totalConnections <= 25) return 15000;  // 15 segundos para listas pequeñas
                if (totalConnections <= 50) return 20000;  // 20 segundos para listas medianas
                if (totalConnections <= 100) return 25000; // 25 segundos para listas grandes
                return 30000; // 30 segundos para listas muy grandes
            };

            const pollingInterval = getPollingInterval(filteredConnectionList.length, visibleItemsOnScreen.length);
            console.log(`🚀 Iniciando polling RT optimizado: ${filteredConnectionList.length} total, ${visibleItemsOnScreen.length} viewport (intervalo: ${pollingInterval/1000}s)`);

            // Fetch inicial con delay moderado para evitar saturar el endpoint lento
            const initialTimeout = setTimeout(() => {
                fetchRealtimeData();
            }, 3000); // 3 segundos inicial para dar tiempo al endpoint

            // Polling con intervalo adaptivo
            const interval = setInterval(() => {
                fetchRealtimeData();
            }, pollingInterval);

            return () => {
                console.log('🛑 ConexionesScreen: Pantalla desenfocada - Deteniendo polling RT');
                if (initialTimeout) {
                    clearTimeout(initialTimeout);
                }
                if (interval) {
                    clearInterval(interval);
                }
            };
        }, [ispId, isLoading, filteredConnectionList.length, visibleItemsOnScreen.length, realtimeEnabled])
    );

    // Detectar cambios en las conexiones visibles en viewport con debounce para evitar sobrecarga
    useEffect(() => {
        if (visibleItemsOnScreen.length === 0 || !realtimeEnabled || isLoading) return;
        
        const currentVisibleIds = visibleItemsOnScreen.map(item => item.id_conexion).sort((a, b) => a - b);
        const lastIds = lastVisibleConnectionIds.sort((a, b) => a - b);
        
        // Verificar si las conexiones visibles en viewport han cambiado
        const viewportChanged = currentVisibleIds.length !== lastIds.length || 
                               !currentVisibleIds.every((id, index) => id === lastIds[index]);
        
        if (viewportChanged && currentVisibleIds.length > 0) {
            console.log(`👀 Viewport cambió: ${lastIds.length} → ${currentVisibleIds.length} conexiones visibles`);
            setLastVisibleConnectionIds(currentVisibleIds);
            
            // Limpiar datos RT de conexiones que ya no están visibles en viewport
            const newRealtimeData = new Map();
            currentVisibleIds.forEach(id => {
                if (realtimeData.has(id)) {
                    newRealtimeData.set(id, realtimeData.get(id));
                }
            });
            setRealtimeData(newRealtimeData);
            
            // Usar debounce de 2 segundos para evitar peticiones muy frecuentes por cambios de viewport
            const debounceTimeout = setTimeout(() => {
                console.log(`📊 Actualizando RT para viewport (debounced)`);
                fetchRealtimeData();
            }, 2000);
            
            return () => clearTimeout(debounceTimeout);
        }
    }, [visibleItemsOnScreen, realtimeEnabled, isLoading]);

    useEffect(() => {
        const loadCiclosBase = async () => {
            if (!ispId) return;
            try {
                const data = await fetchCiclosBase(ispId);
                setCiclosBase(data);
            } catch (error) {
                console.error('Error al cargar los ciclos base:', error);
                Alert.alert('Error', 'No se pudo cargar los ciclos base.');
            }
        };
        loadCiclosBase();
    }, [ispId]);

    // 🎉 NUEVO: Health Check periódico del sistema RT
    useEffect(() => {
        if (!ispId || !realtimeEnabled) return;

        // Health check inicial
        checkRealtimeHealth();

        // Health check cada 5 minutos para monitorear el sistema
        const healthCheckInterval = setInterval(() => {
            checkRealtimeHealth();
        }, 5 * 60 * 1000); // 5 minutos

        return () => {
            if (healthCheckInterval) {
                clearInterval(healthCheckInterval);
            }
        };
    }, [ispId, realtimeEnabled]);

    const toggleCicloBase = (idCicloBase) => {
        setSelectedCiclosBase((prevSelected) =>
            prevSelected.includes(idCicloBase)
                ? prevSelected.filter((id) => id !== idCicloBase) // Si ya está, lo quita
                : [...prevSelected, idCicloBase] // Si no está, lo agrega
        );
    };


    const selectCicloBase = (idCicloBase) => {
        setDiaMesFiltro(idCicloBase); // Aquí puedes usar id_ciclo_base o dia_mes
        toggleModal();
    };


    // Callback para detectar qué items están visibles en el viewport
    const onViewableItemsChanged = ({ viewableItems }) => {
        const visibleItems = viewableItems.map(item => item.item);
        setVisibleItemsOnScreen(visibleItems);
        
        // Log para debugging
        if (visibleItems.length > 0) {
            const visibleIds = visibleItems.map(item => item.id_conexion);
            console.log(`👀 Viewport actualizado: ${visibleItems.length} conexiones visibles [${visibleIds.slice(0, 3).join(', ')}${visibleIds.length > 3 ? '...' : ''}]`);
        }
    };

    // Función para alternar estado expandido/colapsado
    const toggleItemExpanded = (connectionId) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(connectionId)) {
                newSet.delete(connectionId);
            } else {
                newSet.add(connectionId);
            }
            return newSet;
        });
    };

    // Función para expandir/colapsar todos los items
    const toggleAllItems = () => {
        if (expandedItems.size === 0) {
            // Expandir todos
            const allIds = new Set(filteredConnectionList.map(item => item.id_conexion));
            setExpandedItems(allIds);
        } else {
            // Colapsar todos
            setExpandedItems(new Set());
        }
    };

    const handleConnectionPress = (connection) => {
        console.log('🔍 Conexión seleccionada:', connection);
        console.log('🔍 Cliente en conexión:', connection?.cliente);
        console.log('🔍 ID del cliente:', connection?.cliente?.id_cliente);
        setSelectedConnection(connection);
        setDetailModalVisible(true);
    };

    const formatConnectionCount = (count) => {
        if (count === 1) return '1 Conexión';
        return `${count} Conexiones`;
    };


    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedEstados([]);
        setSelectedTiposConexion([]);
        setSelectedCiclosBase([]);
        setDiaMesFiltro('');
        setFilteredConnectionList(connectionList);
        setFilteredConnectionCount(connectionCount);
        setSearchVisible(false);
    };

    const hasActiveFilters = () => {
        return searchQuery.length > 0 ||
            selectedEstados.length > 0 ||
            selectedTiposConexion.length > 0 ||
            selectedCiclosBase.length > 0 ||
            diaMesFiltro !== '';
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const toggleEstado = (estadoId) => {
        setSelectedEstados((prevEstados) =>
            prevEstados.includes(estadoId)
                ? prevEstados.filter((id) => id !== estadoId)
                : [...prevEstados, estadoId]
        );
    };

    const toggleTipoConexion = (tipoId) => {
        setSelectedTiposConexion((prevTipos) =>
            prevTipos.includes(tipoId)
                ? prevTipos.filter((id) => id !== tipoId)
                : [...prevTipos, tipoId]
        );
    };

    const applyFilter = () => {
        const filtered = applyFilters({
            connectionList,
            searchQuery,
            selectedEstados,
            diaMesFiltro,
            selectedTiposConexion,
            selectedCiclosBase,
        });

        setFilteredConnectionList(filtered);
        setFilteredConnectionCount(filtered.length);
        toggleModal();
    };

    // Cálculos de sumatorias
    const totalMonthlySum = filteredConnectionList.reduce((acc, c) => {
        const precio = c.servicio?.precio_servicio ? parseFloat(c.servicio.precio_servicio) : 0;
        return acc + precio;
    }, 0);

    const getSumForEstado = (estadoId) => {
        const conexionesEstado = filteredConnectionList.filter(c => c.id_estado_conexion === estadoId);
        return conexionesEstado.reduce((acc, c) => {
            const precio = c.servicio?.precio_servicio ? parseFloat(c.servicio.precio_servicio) : 0;
            return acc + precio;
        }, 0);
    };

    const getSumForTipoConexion = (tipoId) => {
        const conexionesTipo = filteredConnectionList.filter(c => c.id_tipo_conexion === tipoId);
        return conexionesTipo.reduce((acc, c) => {
            const precio = c.servicio?.precio_servicio ? parseFloat(c.servicio.precio_servicio) : 0;
            return acc + precio;
        }, 0);
    };

    const getSumForDiaMes = (diaMes) => {
        const conexionesDia = filteredConnectionList.filter(c => c.ciclo_base && c.ciclo_base.dia_mes === parseInt(diaMes));
        return conexionesDia.reduce((acc, c) => {
            const precio = c.servicio?.precio_servicio ? parseFloat(c.servicio.precio_servicio) : 0;
            return acc + precio;
        }, 0);
    };

    const botones = [
        {
            id: '6',
            title: 'Buscar',
            screen: 'ClientListScreen',
            icon: 'search',
            action: () => setSearchVisible((prev) => !prev) // Alternar visibilidad
        },
        { id: '8', title: 'Filtrar', screen: 'ClientListScreen', icon: 'filter-list', action: toggleModal },
        { id: '5', title: 'Agregar', screen: 'ClientListScreen', icon: 'add' },
        {
            id: '9',
            title: 'Estadísticas',
            screen: 'ConexionesEstadisticasScreen',
            icon: 'bar-chart',
        },
        {
            id: '7',
            title: 'Tipos de conexión',
            screen: 'TiposDeConexionScreen',
            icon: 'settings-ethernet',
            params: { ispId } // Aquí estás pasando ispId
        },

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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#2563EB'} />
                <Text style={styles.loadingText}>Cargando conexiones...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Ultra-Compact Professional Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    {/* Two-row compact layout to prevent overlapping */}
                    <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4
                    }}>
                        {/* First row - Title and main status */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 4
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                flex: 1
                            }}>
                                <Text style={[
                                    styles.headerTitle, 
                                    { 
                                        fontSize: 18,
                                        fontWeight: '700',
                                        marginRight: 12
                                    }
                                ]}>
                                    🔌 {filteredConnectionCount}
                                </Text>
                                
                                {hasActiveFilters() && (
                                    <View style={{
                                        backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 242, 242, 0.8)',
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                        borderRadius: 4
                                    }}>
                                        <Text style={{
                                            fontSize: 10,
                                            color: '#EF4444',
                                            fontWeight: '600'
                                        }}>
                                            🔍 Filtrado
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={{
                                backgroundColor: isDarkMode ? '#065F46' : '#ECFDF5',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 6
                            }}>
                                <Text style={{
                                    fontSize: 12,
                                    fontWeight: '700',
                                    color: isDarkMode ? '#10B981' : '#047857'
                                }}>
                                    {formatCurrency(totalMonthlySum)}
                                </Text>
                            </View>
                        </View>

                        {/* Second row - Controls and indicators */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                <View style={{
                                    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.4)' : 'rgba(229, 231, 235, 0.6)',
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    marginRight: 8
                                }}>
                                    <Text style={{
                                        fontSize: 10,
                                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                                        fontWeight: '600'
                                    }}>
                                        {expandedItems.size === 0 ? '📋 Compacto' : 
                                         expandedItems.size === filteredConnectionList.length ? '📄 Completo' : 
                                         `📊 ${expandedItems.size} expandidos`}
                                    </Text>
                                </View>

                                {realtimeEnabled && realtimeData.size > 0 && (
                                    <View style={{
                                        backgroundColor: 'rgba(5, 150, 105, 0.15)',
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                        borderRadius: 4
                                    }}>
                                        <Text style={{
                                            fontSize: 10,
                                            color: '#059669',
                                            fontWeight: '600'
                                        }}>
                                            📡 RT: {realtimeData.size}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                <TouchableOpacity
                                    onPress={toggleAllItems}
                                    style={{
                                        backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                                        paddingHorizontal: 8,
                                        paddingVertical: 3,
                                        borderRadius: 4,
                                        marginRight: 8
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 10,
                                        color: isDarkMode ? '#D1D5DB' : '#374151',
                                        fontWeight: '600'
                                    }}>
                                        {expandedItems.size === 0 ? '📤 Expandir' : '📥 Colapsar'}
                                    </Text>
                                </TouchableOpacity>

                                <View style={{ transform: [{ scale: 0.9 }] }}>
                                    <ThemeSwitch />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.contentContainer}>

                {/* Search Input */}
                {isSearchVisible && (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar por dirección, cliente, IP..."
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus={true}
                        />
                    </View>
                )}

                {/* Active Filters */}
                {hasActiveFilters() && (
                    <View style={styles.filtersContainer}>
                        {selectedEstados.map((estadoId) => {
                            const estadoObj = estadosConexion.find(e => e.id_estado_conexion === estadoId);
                            const countForEstado = filteredConnectionList.filter(c => c.id_estado_conexion === estadoId).length;
                            const sumForEstado = getSumForEstado(estadoId);
                            return (
                                <View key={`estado-${estadoId}`} style={styles.filterTagContainer}>
                                    <View style={styles.filterTag}>
                                        <Text style={styles.filterTagText}>
                                            📊 Estado: {estadoObj ? estadoObj.estado : estadoId} ({countForEstado})
                                        </Text>
                                    </View>
                                    <View style={styles.amountBadge}>
                                        <Text style={styles.amountBadgeText}>{formatCurrency(sumForEstado)}</Text>
                                    </View>
                                </View>
                            );
                        })}

                        {selectedTiposConexion.map((tipoId) => {
                            const tipoObj = tiposConexion.find(t => t.id_tipo_conexion === tipoId);
                            const countForTipo = filteredConnectionList.filter(c => c.id_tipo_conexion === tipoId).length;
                            const sumForTipo = getSumForTipoConexion(tipoId);
                            return (
                                <View key={`tipo-${tipoId}`} style={styles.filterTagContainer}>
                                    <View style={styles.filterTag}>
                                        <Text style={styles.filterTagText}>
                                            🏷️ Tipo: {tipoObj ? tipoObj.descripcion_tipo_conexion : tipoId} ({countForTipo})
                                        </Text>
                                    </View>
                                    <View style={styles.amountBadge}>
                                        <Text style={styles.amountBadgeText}>{formatCurrency(sumForTipo)}</Text>
                                    </View>
                                </View>
                            );
                        })}

                        {diaMesFiltro !== '' && (
                            <View style={styles.filterTagContainer}>
                                <View style={styles.filterTag}>
                                    <Text style={styles.filterTagText}>
                                        📅 Día: {diaMesFiltro} ({filteredConnectionList.length})
                                    </Text>
                                </View>
                                <View style={styles.amountBadge}>
                                    <Text style={styles.amountBadgeText}>{formatCurrency(getSumForDiaMes(diaMesFiltro))}</Text>
                                </View>
                            </View>
                        )}

                        {/* Clear filters button */}
                        <TouchableOpacity
                            style={[styles.filterTagContainer, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#EF4444', borderStyle: 'dashed' }]}
                            onPress={clearAllFilters}
                        >
                            <Text style={[styles.filterTagText, { color: '#EF4444', textAlign: 'center', flex: 1 }]}>❌ Limpiar filtros</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Warning for large connection lists */}
                {filteredConnectionList.length > 40 && visibleItemsOnScreen.length === 0 && (
                    <View style={{
                        backgroundColor: isDarkMode ? '#FEF3C7' : '#FFFBEB',
                        borderColor: '#F59E0B',
                        borderWidth: 1,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                color: '#92400E',
                                fontSize: 12,
                                fontWeight: '600',
                                marginBottom: 2
                            }}>
                                Lista grande detectada ({filteredConnectionList.length} conexiones)
                            </Text>
                            <Text style={{
                                color: '#92400E',
                                fontSize: 11
                            }}>
                                Mostrando datos RT solo para las primeras 40 conexiones para mejor rendimiento
                            </Text>
                        </View>
                    </View>
                )}

                {/* Info about viewport-based RT */}
                {visibleItemsOnScreen.length > 0 && (
                    <View style={{
                        backgroundColor: isDarkMode ? '#065F46' : '#ECFDF5',
                        borderColor: '#10B981',
                        borderWidth: 1,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <Text style={{ fontSize: 16, marginRight: 8 }}>👀</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                color: isDarkMode ? '#A7F3D0' : '#065F46',
                                fontSize: 12,
                                fontWeight: '600',
                                marginBottom: 2
                            }}>
                                Modo viewport activo
                            </Text>
                            <Text style={{
                                color: isDarkMode ? '#6EE7B7' : '#047857',
                                fontSize: 11
                            }}>
                                Mostrando RT solo para {visibleItemsOnScreen.length} conexiones visibles mientras navegas
                            </Text>
                        </View>
                    </View>
                )}

                {/* Connections List */}
                {filteredConnectionList.length > 0 ? (
                    <FlatList
                        data={filteredConnectionList}
                        keyExtractor={(item) => item.id_conexion.toString()}
                        renderItem={({ item }) => (
                            <ConnectionItemModern
                                item={item}
                                styles={styles}
                                navigation={navigation}
                                onPress={handleConnectionPress}
                                realtimeData={realtimeData.get(item.id_conexion)}
                                isExpanded={expandedItems.has(item.id_conexion)}
                                onToggleExpanded={() => toggleItemExpanded(item.id_conexion)}
                            />
                        )}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        // Props para detectar items visibles en viewport
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        removeClippedSubviews={true} // Optimización para listas grandes
                        maxToRenderPerBatch={30} // Renderizar más items por batch para vista compacta
                        windowSize={15} // Mantener más pantallas en memoria
                        initialNumToRender={25} // Renderizar más items inicialmente para vista compacta
                        // getItemLayout deshabilitado para permitir alturas dinámicas
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🔌</Text>
                        <Text style={styles.emptyTitle}>
                            {hasActiveFilters() ? 'No se encontraron conexiones' : 'No hay conexiones registradas'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {hasActiveFilters()
                                ? 'Intenta ajustar los filtros para encontrar conexiones'
                                : 'Comienza agregando una nueva conexión al sistema'
                            }
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Modal */}
            <Modal
                visible={isDetailModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.actionModalContainer}>
                        <Text style={styles.actionModalTitle}>
                            🔌 Conexión #{selectedConnection?.id_conexion}
                        </Text>
                        <Text style={[styles.actionModalTitle, { fontSize: 14, fontWeight: '500', marginBottom: 20, opacity: 0.8 }]}>
                            Selecciona una acción para continuar
                        </Text>

                        {(selectedConnection?.cliente?.id_cliente || selectedConnection?.id_cliente) ? (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.actionButtonPrimary]}
                                onPress={() => {
                                    setDetailModalVisible(false);
                                    // Intentar obtener el clientId desde diferentes posibles estructuras
                                    const clientId = selectedConnection?.cliente?.id_cliente || selectedConnection?.id_cliente;
                                    console.log('🔍 Navegando a ClientDetailsScreen con clientId:', clientId);
                                    console.log('🔍 Conexión completa:', selectedConnection);
                                    console.log('🔍 Cliente en conexión:', selectedConnection?.cliente);
                                    console.log('🔍 ID directo:', selectedConnection?.id_cliente);

                                    if (clientId) {
                                        try {
                                            navigation.navigate('ClientDetailsScreen', { clientId: clientId });
                                        } catch (error) {
                                            console.error('❌ Error en navegación:', error);
                                            Alert.alert(
                                                'Error de Navegación',
                                                'No se pudo abrir los detalles del cliente. Intenta de nuevo.',
                                                [{ text: 'OK' }]
                                            );
                                        }
                                    } else {
                                        Alert.alert(
                                            'Error',
                                            'No se encontró el ID del cliente para esta conexión.',
                                            [{ text: 'OK' }]
                                        );
                                    }
                                }}
                            >
                                <Text style={styles.actionButtonText}>👤 Ver Detalles del Cliente</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.actionButtonPrimary, { opacity: 0.5 }]}
                                disabled={true}
                            >
                                <Text style={styles.actionButtonText}>👤 Cliente No Disponible</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonSecondary]}
                            onPress={() => {
                                setDetailModalVisible(false);
                                navigation.navigate('ConexionDetalles', {
                                    connectionId: selectedConnection?.id_conexion,
                                    id_cliente: selectedConnection?.cliente?.id_cliente || selectedConnection?.id_cliente
                                });
                            }}
                        >
                            <Text style={styles.actionButtonText}>🔌 Ver Detalles de la Conexión</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonDanger]}
                            onPress={() => setDetailModalVisible(false)}
                        >
                            <Text style={styles.actionButtonText}>❌ Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



            {/* Filters Modal */}
            <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={toggleModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>🎯 Filtros de Conexiones</Text>
                        </View>

                        <ScrollView
                            style={styles.modalContent}
                            showsVerticalScrollIndicator={false}
                            persistentScrollbar={true}
                        >
                            {/* Estados Section */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>
                                    📊 Estados de Conexión ({estadosConexion.length})
                                </Text>
                                {estadosConexion.map((item) => {
                                    const isSelected = selectedEstados.includes(item.id_estado_conexion);
                                    const connectionCount = connectionList.filter(c => c.id_estado_conexion === item.id_estado_conexion).length;
                                    return (
                                        <TouchableOpacity
                                            key={item.id_estado_conexion}
                                            style={[styles.filterOption, isSelected && styles.filterOptionActive]}
                                            onPress={() => toggleEstado(item.id_estado_conexion)}
                                        >
                                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                                {isSelected && <Text style={styles.checkboxIcon}>✓</Text>}
                                            </View>
                                            <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextActive]}>
                                                {item.estado} ({connectionCount})
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Tipos de Conexión Section */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>
                                    🏷️ Tipos de Conexión ({tiposConexion.length})
                                </Text>
                                {tiposConexion.map((item) => {
                                    const isSelected = selectedTiposConexion.includes(item.id_tipo_conexion);
                                    const connectionCount = connectionList.filter(c => c.id_tipo_conexion === item.id_tipo_conexion).length;
                                    return (
                                        <TouchableOpacity
                                            key={item.id_tipo_conexion}
                                            style={[styles.filterOption, isSelected && styles.filterOptionActive]}
                                            onPress={() => toggleTipoConexion(item.id_tipo_conexion)}
                                        >
                                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                                {isSelected && <Text style={styles.checkboxIcon}>✓</Text>}
                                            </View>
                                            <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextActive]}>
                                                {item.descripcion_tipo_conexion} ({connectionCount})
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Ciclos Base Section */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>
                                    📅 Ciclos de Facturación ({ciclosBase.length})
                                </Text>
                                {ciclosBase.map((item) => {
                                    const isSelected = selectedCiclosBase.includes(item.id_ciclo_base);
                                    const connectionCount = connectionList.filter(c => c.ciclo_base && c.ciclo_base.id_ciclo_base === item.id_ciclo_base).length;
                                    return (
                                        <TouchableOpacity
                                            key={item.id_ciclo_base}
                                            style={[styles.filterOption, isSelected && styles.filterOptionActive]}
                                            onPress={() => toggleCicloBase(item.id_ciclo_base)}
                                        >
                                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                                {isSelected && <Text style={styles.checkboxIcon}>✓</Text>}
                                            </View>
                                            <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextActive]}>
                                                {item.detalle ? `${item.detalle} (Día ${item.dia_mes})` : `Día ${item.dia_mes}`} ({connectionCount})
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSecondary]}
                                onPress={toggleModal}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={applyFilter}
                            >
                                <Text style={styles.modalButtonText}>Aplicar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <HorizontalMenu botones={botones} navigation={navigation} isDarkMode={isDarkMode} />
        </View>
    );
};

export default ConexionesScreen;
