import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    TextInput,
    Dimensions,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStyles } from './InstalacionesListScreenStyles';
import { BarChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

const InstalacionesListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id_isp } = route.params || {};

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [instalaciones, setInstalaciones] = useState([]);
    const [filteredInstalaciones, setFilteredInstalaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [estadisticas, setEstadisticas] = useState(null);

    // Filtros
    const [searchText, setSearchText] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('todos'); // 'todos', 'pendientes', 'finalizadas'
    const [periodoFiltro, setPeriodoFiltro] = useState(null); // null, 'pendientes', 'este_mes', 'hoy'

    // Estados para la gráfica
    const [chartView, setChartView] = useState('dia'); // 'dia', 'semana', 'mes', 'ano'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [chartData, setChartData] = useState(null);

    const styles = getStyles(isDarkMode);

    // Cargar tema
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const theme = await AsyncStorage.getItem('@theme');
                setIsDarkMode(theme === 'dark');
            } catch (error) {
                console.error('Error al cargar el tema:', error);
            }
        };
        loadTheme();
    }, []);

    // Cargar datos al enfocar la pantalla
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [id_isp])
    );

    const fetchData = async () => {
        setLoading(true);
        await fetchInstalaciones();
        setLoading(false);
    };

    const fetchInstalaciones = async () => {
        try {
            console.log('🔍 [InstalacionesListScreen] Obteniendo instalaciones del ISP:', id_isp);

            const response = await fetch('https://wellnet-rd.com:444/api/instalaciones-isp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_isp }),
            });

            const data = await response.json();

            // DEBUG: Ver la estructura completa de la respuesta
            console.log('📦 [InstalacionesListScreen] Respuesta completa de la API:');
            console.log('   - Tipo:', typeof data);
            console.log('   - Es Array?:', Array.isArray(data));
            console.log('   - Keys disponibles:', data && typeof data === 'object' ? Object.keys(data) : 'N/A');
            console.log('   - Data completo:', JSON.stringify(data, null, 2));

            // Verificar si la API devolvió un error
            if (data && data.error) {
                console.error('❌ [InstalacionesListScreen] Error de la API:', data.error);
                console.error('   Mensaje:', data.message);
                Alert.alert(
                    'Error del Servidor',
                    `No se pudieron cargar las instalaciones.\n\nError: ${data.message || data.error}\n\nPor favor, contacta al administrador del sistema.`,
                    [{ text: 'Entendido' }]
                );
                setInstalaciones([]);
                setFilteredInstalaciones([]);
                return;
            }

            // Normalizar la respuesta: puede venir como array directo o dentro de un objeto
            let instalacionesArray = [];

            if (Array.isArray(data)) {
                // Si data es un array directamente
                instalacionesArray = data;
                console.log('✅ [InstalacionesListScreen] Data es array directo');
            } else if (data && typeof data === 'object') {
                // Si data es un objeto, intentar extraer el array
                // Posibles claves: instalaciones, data, results, items
                instalacionesArray = data.instalaciones || data.data || data.results || data.items || [];
                console.log('🔍 [InstalacionesListScreen] Extrayendo de objeto. Claves probadas:', {
                    instalaciones: !!data.instalaciones,
                    data: !!data.data,
                    results: !!data.results,
                    items: !!data.items
                });
            }

            console.log('📥 [InstalacionesListScreen] Total instalaciones procesadas:', instalacionesArray.length);

            // Mostrar muestra del primer registro si existe
            if (instalacionesArray.length > 0) {
                console.log('📋 [InstalacionesListScreen] Ejemplo primer registro:', JSON.stringify(instalacionesArray[0], null, 2));
            }

            setInstalaciones(instalacionesArray);
            setFilteredInstalaciones(instalacionesArray);
        } catch (error) {
            console.error('❌ [InstalacionesListScreen] Error al obtener instalaciones:', error);
            Alert.alert('Error', 'No se pudieron cargar las instalaciones');
            setInstalaciones([]);
            setFilteredInstalaciones([]);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // Calcular estadísticas localmente
    useEffect(() => {
        if (instalaciones.length > 0) {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const currentDay = now.getDate();

            console.log('📊 [InstalacionesListScreen] Calculando estadísticas:');
            console.log('   - Fecha actual:', now.toLocaleString());
            console.log('   - Día:', currentDay, 'Mes:', currentMonth + 1, 'Año:', currentYear);

            const instalacionesEsteMes = instalaciones.filter(item => {
                if (!item.fecha_guardado) return false;
                const itemDate = new Date(item.fecha_guardado);
                const match = itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
                return match;
            }).length;

            const instalacionesHoy = instalaciones.filter(item => {
                if (!item.fecha_guardado) return false;
                const itemDate = new Date(item.fecha_guardado);
                const match = itemDate.getDate() === currentDay &&
                             itemDate.getMonth() === currentMonth &&
                             itemDate.getFullYear() === currentYear;
                if (match) {
                    console.log('   ✅ Instalación de hoy:', item.id_instalacion, '- Fecha:', item.fecha_guardado);
                }
                return match;
            }).length;

            console.log('   📈 Total instalaciones este mes:', instalacionesEsteMes);
            console.log('   📈 Total instalaciones hoy:', instalacionesHoy);

            setEstadisticas({
                totalInstalaciones: instalaciones.length,
                estadisticasTiempo: {
                    instalacionesEsteMes,
                    instalacionesHoy,
                },
            });
        } else {
            setEstadisticas(null);
        }
    }, [instalaciones]);

    // Aplicar filtros
    useEffect(() => {
        let filtered = [...instalaciones];

        // Filtro por período (desde tarjetas de estadísticas)
        if (periodoFiltro === 'pendientes') {
            filtered = filtered.filter(item => item.id_estado_conexion === 2);
        } else if (periodoFiltro === 'este_mes') {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            filtered = filtered.filter(item => {
                if (!item.fecha_guardado) return false;
                const itemDate = new Date(item.fecha_guardado);
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
            });
        } else if (periodoFiltro === 'hoy') {
            const now = new Date();
            const currentDay = now.getDate();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            filtered = filtered.filter(item => {
                if (!item.fecha_guardado) return false;
                const itemDate = new Date(item.fecha_guardado);
                return itemDate.getDate() === currentDay &&
                       itemDate.getMonth() === currentMonth &&
                       itemDate.getFullYear() === currentYear;
            });
        }

        // Filtro por estado (desde tabs)
        if (estadoFiltro === 'pendientes') {
            filtered = filtered.filter(item => item.id_estado_conexion === 2);
        } else if (estadoFiltro === 'finalizadas') {
            filtered = filtered.filter(item => item.id_estado_conexion === 3);
        }

        // Filtro por búsqueda de texto
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(item => {
                const cliente = item.nombreCliente?.toLowerCase() || '';
                const tecnico = item.nombreTecnico?.toLowerCase() || '';
                const id = item.id_instalacion?.toString() || '';

                return cliente.includes(searchLower) ||
                       tecnico.includes(searchLower) ||
                       id.includes(searchLower);
            });
        }

        setFilteredInstalaciones(filtered);
    }, [searchText, estadoFiltro, periodoFiltro, instalaciones]);

    // Calcular datos para la gráfica
    useEffect(() => {
        if (instalaciones.length === 0) {
            setChartData(null);
            return;
        }

        const calculateChartData = () => {
            const data = { labels: [], datasets: [{ data: [] }] };

            if (chartView === 'dia') {
                // Últimos 7 días
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(currentDate);
                    date.setDate(date.getDate() - i);
                    days.push(date);
                }

                data.labels = days.map(d => `${d.getDate()}/${d.getMonth() + 1}`);
                data.datasets[0].data = days.map(day => {
                    return instalaciones.filter(item => {
                        if (!item.fecha_guardado) return false;
                        const itemDate = new Date(item.fecha_guardado);
                        return itemDate.getDate() === day.getDate() &&
                               itemDate.getMonth() === day.getMonth() &&
                               itemDate.getFullYear() === day.getFullYear();
                    }).length;
                });

            } else if (chartView === 'semana') {
                // Últimas 12 semanas
                const weeks = [];
                for (let i = 11; i >= 0; i--) {
                    const startDate = new Date(currentDate);
                    startDate.setDate(startDate.getDate() - (i * 7) - startDate.getDay());
                    const endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 6);
                    weeks.push({ start: startDate, end: endDate });
                }

                data.labels = weeks.map((w, idx) => `S${12 - idx}`);
                data.datasets[0].data = weeks.map(week => {
                    return instalaciones.filter(item => {
                        if (!item.fecha_guardado) return false;
                        const itemDate = new Date(item.fecha_guardado);
                        return itemDate >= week.start && itemDate <= week.end;
                    }).length;
                });

            } else if (chartView === 'mes') {
                // Últimos 12 meses
                const months = [];
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(currentDate);
                    date.setMonth(date.getMonth() - i);
                    months.push(date);
                }

                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                data.labels = months.map(m => monthNames[m.getMonth()]);
                data.datasets[0].data = months.map(month => {
                    return instalaciones.filter(item => {
                        if (!item.fecha_guardado) return false;
                        const itemDate = new Date(item.fecha_guardado);
                        return itemDate.getMonth() === month.getMonth() &&
                               itemDate.getFullYear() === month.getFullYear();
                    }).length;
                });

            } else if (chartView === 'ano') {
                // Últimos 5 años
                const years = [];
                for (let i = 4; i >= 0; i--) {
                    const date = new Date(currentDate);
                    date.setFullYear(date.getFullYear() - i);
                    years.push(date);
                }

                data.labels = years.map(y => y.getFullYear().toString());
                data.datasets[0].data = years.map(year => {
                    return instalaciones.filter(item => {
                        if (!item.fecha_guardado) return false;
                        const itemDate = new Date(item.fecha_guardado);
                        return itemDate.getFullYear() === year.getFullYear();
                    }).length;
                });
            }

            // Asegurar que haya al menos un valor > 0 para que la gráfica se vea bien
            if (data.datasets[0].data.every(val => val === 0)) {
                data.datasets[0].data[0] = 0.1;
            }

            return data;
        };

        setChartData(calculateChartData());
    }, [instalaciones, chartView, currentDate]);

    // Funciones de navegación temporal
    const navigateTime = (direction) => {
        const newDate = new Date(currentDate);

        if (chartView === 'dia') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else if (chartView === 'semana') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 84 : -84)); // 12 semanas
        } else if (chartView === 'mes') {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 12 : -12));
        } else if (chartView === 'ano') {
            newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 5 : -5));
        }

        setCurrentDate(newDate);
    };

    const resetToToday = () => {
        setCurrentDate(new Date());
    };

    // Función para obtener el texto del período actual
    const getPeriodText = () => {
        const date = currentDate;

        if (chartView === 'dia') {
            // Últimos 7 días: "Nov 8 - Nov 14, 2024"
            const endDate = new Date(date);
            const startDate = new Date(date);
            startDate.setDate(startDate.getDate() - 6);

            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const startMonth = monthNames[startDate.getMonth()];
            const endMonth = monthNames[endDate.getMonth()];

            if (startDate.getMonth() === endDate.getMonth()) {
                return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${endDate.getFullYear()}`;
            } else {
                return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`;
            }

        } else if (chartView === 'semana') {
            // Últimas 12 semanas: "Semanas: Sep - Nov 2024"
            const endDate = new Date(date);
            const startDate = new Date(date);
            startDate.setDate(startDate.getDate() - (12 * 7));

            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const startMonth = monthNames[startDate.getMonth()];
            const endMonth = monthNames[endDate.getMonth()];

            if (startDate.getFullYear() === endDate.getFullYear()) {
                return `${startMonth} - ${endMonth} ${endDate.getFullYear()}`;
            } else {
                return `${startMonth} ${startDate.getFullYear()} - ${endMonth} ${endDate.getFullYear()}`;
            }

        } else if (chartView === 'mes') {
            // Últimos 12 meses: "Dic 2023 - Nov 2024"
            const endDate = new Date(date);
            const startDate = new Date(date);
            startDate.setMonth(startDate.getMonth() - 11);

            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const startMonth = monthNames[startDate.getMonth()];
            const endMonth = monthNames[endDate.getMonth()];

            if (startDate.getFullYear() === endDate.getFullYear()) {
                return `${startMonth} - ${endMonth} ${endDate.getFullYear()}`;
            } else {
                return `${startMonth} ${startDate.getFullYear()} - ${endMonth} ${endDate.getFullYear()}`;
            }

        } else if (chartView === 'ano') {
            // Últimos 5 años: "2020 - 2024"
            const endYear = date.getFullYear();
            const startYear = endYear - 4;
            return `${startYear} - ${endYear}`;
        }

        return '';
    };

    const getEstadoBadge = (id_estado) => {
        if (id_estado === 2) {
            return {
                text: 'Pendiente',
                color: '#F59E0B',
                bgColor: isDarkMode ? '#F59E0B20' : '#FEF3C7',
            };
        } else if (id_estado === 3) {
            return {
                text: 'Finalizada',
                color: '#10B981',
                bgColor: isDarkMode ? '#10B98120' : '#D1FAE5',
            };
        }
        return {
            text: 'Desconocido',
            color: '#6B7280',
            bgColor: isDarkMode ? '#6B728020' : '#F3F4F6',
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            // Convertir a formato de 12 horas
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // La hora '0' debe ser '12'
            const hoursFormatted = String(hours).padStart(2, '0');

            return `${day}/${month}/${year} ${hoursFormatted}:${minutes} ${ampm}`;
        } catch {
            return 'N/A';
        }
    };

    const handleVerDetalles = (instalacion) => {
        navigation.navigate('InstalacionForm', {
            id_conexion: instalacion.id_conexion,
            id_instalacion: instalacion.id_instalacion,
            isEditMode: false,
            viewMode: 'details',
        });
    };

    const handleVerMateriales = (instalacion) => {
        navigation.navigate('InstalacionForm', {
            id_conexion: instalacion.id_conexion,
            id_instalacion: instalacion.id_instalacion,
            isEditMode: false,
            viewMode: 'materials',
        });
    };

    const handleEditar = (instalacion) => {
        if (instalacion.id_estado_conexion === 3) {
            Alert.alert(
                'Instalación Finalizada',
                'Esta instalación ya fue finalizada. ¿Deseas editarla de todos modos?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Editar',
                        onPress: () => {
                            navigation.navigate('InstalacionForm', {
                                id_conexion: instalacion.id_conexion,
                                id_instalacion: instalacion.id_instalacion,
                                isEditMode: true,
                            });
                        },
                    },
                ]
            );
        } else {
            navigation.navigate('InstalacionForm', {
                id_conexion: instalacion.id_conexion,
                id_instalacion: instalacion.id_instalacion,
                isEditMode: true,
            });
        }
    };

    const handleNuevaInstalacion = () => {
        navigation.navigate('InstalacionForm', {
            id_isp,
            isEditMode: false,
        });
    };

    // Funciones para filtrar por estadísticas
    const handleFiltrarPendientes = () => {
        if (periodoFiltro === 'pendientes') {
            // Si ya está activo, desactivar
            setPeriodoFiltro(null);
        } else {
            setPeriodoFiltro('pendientes');
            setEstadoFiltro('todos'); // Resetear filtro de tabs
        }
    };

    const handleFiltrarEsteMes = () => {
        if (periodoFiltro === 'este_mes') {
            setPeriodoFiltro(null);
        } else {
            setPeriodoFiltro('este_mes');
        }
    };

    const handleFiltrarHoy = () => {
        if (periodoFiltro === 'hoy') {
            setPeriodoFiltro(null);
        } else {
            setPeriodoFiltro('hoy');
        }
    };

    const renderHeader = useMemo(() => (
        <View style={styles.headerContainer}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#1F2937'} />
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>🔧 Instalaciones</Text>
                <Text style={styles.subtitle}>Gestión de labores del ISP</Text>
            </View>

            {/* Estadísticas Cards */}
            {estadisticas && (
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Icon name="tools" size={24} color="#3B82F6" />
                        <Text style={styles.statValue}>{estadisticas.totalInstalaciones || 0}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.statCard,
                            periodoFiltro === 'pendientes' && styles.statCardActive
                        ]}
                        onPress={handleFiltrarPendientes}
                        activeOpacity={0.7}
                    >
                        <Icon name="clock-outline" size={24} color="#F59E0B" />
                        <Text style={styles.statValue}>
                            {instalaciones.filter(i => i.id_estado_conexion === 2).length}
                        </Text>
                        <Text style={styles.statLabel}>Pendientes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.statCard,
                            periodoFiltro === 'este_mes' && styles.statCardActive
                        ]}
                        onPress={handleFiltrarEsteMes}
                        activeOpacity={0.7}
                    >
                        <Icon name="check-circle" size={24} color="#10B981" />
                        <Text style={styles.statValue}>
                            {estadisticas.estadisticasTiempo?.instalacionesEsteMes || 0}
                        </Text>
                        <Text style={styles.statLabel}>Este Mes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.statCard,
                            periodoFiltro === 'hoy' && styles.statCardActive
                        ]}
                        onPress={handleFiltrarHoy}
                        activeOpacity={0.7}
                    >
                        <Icon name="calendar-today" size={24} color="#8B5CF6" />
                        <Text style={styles.statValue}>
                            {estadisticas.estadisticasTiempo?.instalacionesHoy || 0}
                        </Text>
                        <Text style={styles.statLabel}>Hoy</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por cliente, técnico o ID..."
                    placeholderTextColor="#9CA3AF"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <Icon name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, estadoFiltro === 'todos' && styles.filterTabActive]}
                    onPress={() => setEstadoFiltro('todos')}
                >
                    <Text style={[styles.filterText, estadoFiltro === 'todos' && styles.filterTextActive]}>
                        Todas ({instalaciones.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterTab, estadoFiltro === 'pendientes' && styles.filterTabActive]}
                    onPress={() => setEstadoFiltro('pendientes')}
                >
                    <Text style={[styles.filterText, estadoFiltro === 'pendientes' && styles.filterTextActive]}>
                        Pendientes ({instalaciones.filter(i => i.id_estado_conexion === 2).length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterTab, estadoFiltro === 'finalizadas' && styles.filterTabActive]}
                    onPress={() => setEstadoFiltro('finalizadas')}
                >
                    <Text style={[styles.filterText, estadoFiltro === 'finalizadas' && styles.filterTextActive]}>
                        Finalizadas ({instalaciones.filter(i => i.id_estado_conexion === 3).length})
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    ), [isDarkMode, estadisticas, instalaciones, searchText, periodoFiltro, estadoFiltro, navigation]);

    // Componente de la gráfica
    const renderChart = useMemo(() => {
        if (!chartData) return null;

        const chartViewLabels = {
            dia: 'Por Día',
            semana: 'Por Semana',
            mes: 'Por Mes',
            ano: 'Por Año'
        };

        // Calcular ancho dinámico basado en número de datos
        const numBars = chartData.labels.length;
        const barWidth = 50; // Ancho por barra
        const minWidth = screenWidth - 64; // Ancho mínimo
        const calculatedWidth = Math.max(minWidth, numBars * barWidth + 80);

        return (
            <View style={styles.chartContainer}>
                {/* Chart Header */}
                <View style={styles.chartHeader}>
                    <Icon name="chart-bar" size={24} color="#3B82F6" />
                    <Text style={styles.chartTitle}>📊 Estadísticas de Instalaciones</Text>
                </View>

                {/* View Selector Tabs */}
                <View style={styles.chartViewTabs}>
                    {['dia', 'semana', 'mes', 'ano'].map((view) => (
                        <TouchableOpacity
                            key={view}
                            style={[
                                styles.chartViewTab,
                                chartView === view && styles.chartViewTabActive
                            ]}
                            onPress={() => {
                                setChartView(view);
                                setCurrentDate(new Date());
                            }}
                        >
                            <Text style={[
                                styles.chartViewTabText,
                                chartView === view && styles.chartViewTabTextActive
                            ]}>
                                {chartViewLabels[view]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Period Indicator */}
                <View style={styles.periodIndicator}>
                    <Icon name="calendar-range" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <Text style={styles.periodText}>{getPeriodText()}</Text>
                </View>

                {/* Navigation Controls */}
                <View style={styles.chartNavigation}>
                    <TouchableOpacity
                        style={styles.chartNavButton}
                        onPress={() => navigateTime('prev')}
                    >
                        <Icon name="chevron-left" size={24} color="#3B82F6" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.chartTodayButton}
                        onPress={resetToToday}
                    >
                        <Icon name="calendar-today" size={16} color="#3B82F6" />
                        <Text style={styles.chartTodayText}>Hoy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.chartNavButton}
                        onPress={() => navigateTime('next')}
                    >
                        <Icon name="chevron-right" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                </View>

                {/* Indicador de scroll si es necesario */}
                {calculatedWidth > minWidth && (
                    <View style={styles.scrollIndicator}>
                        <Icon name="gesture-swipe-horizontal" size={16} color="#9CA3AF" />
                        <Text style={styles.scrollIndicatorText}>Desliza para ver más</Text>
                    </View>
                )}

                {/* Bar Chart con ScrollView horizontal */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.chartScrollContent}
                    style={styles.chartScrollView}
                >
                    <BarChart
                        data={chartData}
                        width={calculatedWidth}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
                            backgroundGradientFrom: isDarkMode ? '#1F2937' : '#ffffff',
                            backgroundGradientTo: isDarkMode ? '#1F2937' : '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                            labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForBackgroundLines: {
                                strokeDasharray: '',
                                stroke: isDarkMode ? '#374151' : '#E5E7EB',
                                strokeWidth: 1,
                            },
                            propsForLabels: {
                                fontSize: 10,
                            },
                            barPercentage: 0.7,
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                        showValuesOnTopOfBars
                        fromZero
                    />
                </ScrollView>

                {/* Chart Summary */}
                <View style={styles.chartSummary}>
                    <View style={styles.chartSummaryItem}>
                        <Text style={styles.chartSummaryLabel}>Total</Text>
                        <Text style={styles.chartSummaryValue}>
                            {chartData.datasets[0].data.reduce((a, b) => a + b, 0)}
                        </Text>
                    </View>
                    <View style={styles.chartSummaryItem}>
                        <Text style={styles.chartSummaryLabel}>Promedio</Text>
                        <Text style={styles.chartSummaryValue}>
                            {(chartData.datasets[0].data.reduce((a, b) => a + b, 0) / chartData.datasets[0].data.length).toFixed(1)}
                        </Text>
                    </View>
                    <View style={styles.chartSummaryItem}>
                        <Text style={styles.chartSummaryLabel}>Máximo</Text>
                        <Text style={styles.chartSummaryValue}>
                            {Math.max(...chartData.datasets[0].data)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }, [chartData, chartView, isDarkMode, navigateTime, resetToToday, currentDate]);

    const renderInstalacionCard = ({ item }) => {
        const estadoBadge = getEstadoBadge(item.id_estado_conexion);

        return (
            <View style={styles.card}>
                {/* Header del Card */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <Icon name="tools" size={20} color="#3B82F6" />
                        <Text style={styles.cardId}>ID: {item.id_instalacion}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: estadoBadge.bgColor }]}>
                        <Text style={[styles.badgeText, { color: estadoBadge.color }]}>
                            {estadoBadge.text}
                        </Text>
                    </View>
                </View>

                {/* Información del Cliente */}
                <View style={styles.cardRow}>
                    <Icon name="account" size={18} color="#6B7280" />
                    <View style={styles.cardRowContent}>
                        <Text style={styles.cardLabel}>Cliente</Text>
                        <Text style={styles.cardValue}>{item.nombreCliente || 'N/A'}</Text>
                    </View>
                </View>

                {/* Información del Técnico */}
                <View style={styles.cardRow}>
                    <Icon name="account-hard-hat" size={18} color="#6B7280" />
                    <View style={styles.cardRowContent}>
                        <Text style={styles.cardLabel}>Técnico</Text>
                        <Text style={styles.cardValue}>{item.nombreTecnico || 'N/A'}</Text>
                    </View>
                </View>

                {/* Fecha y Hora */}
                <View style={styles.cardRow}>
                    <Icon name="calendar-clock" size={18} color="#6B7280" />
                    <View style={styles.cardRowContent}>
                        <Text style={styles.cardLabel}>Fecha y Hora</Text>
                        <Text style={styles.cardValue}>{formatDate(item.fecha_guardado)}</Text>
                    </View>
                </View>

                {/* Tipo de Conexión */}
                {item.tipo_conexion && (
                    <View style={styles.cardRow}>
                        <Icon name="network" size={18} color="#6B7280" />
                        <View style={styles.cardRowContent}>
                            <Text style={styles.cardLabel}>Tipo</Text>
                            <Text style={styles.cardValue}>{item.tipo_conexion}</Text>
                        </View>
                    </View>
                )}

                {/* Botones de Acción */}
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        onPress={() => handleVerDetalles(item)}
                    >
                        <Icon name="eye" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Ver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonSecondary]}
                        onPress={() => handleVerMateriales(item)}
                    >
                        <Icon name="package-variant" size={16} color="#3B82F6" />
                        <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Materiales</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonSecondary]}
                        onPress={() => handleEditar(item)}
                    >
                        <Icon name="pencil" size={16} color="#F59E0B" />
                        <Text style={[styles.actionButtonText, { color: '#F59E0B' }]}>Editar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="tools" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No hay instalaciones</Text>
            <Text style={styles.emptyStateText}>
                {searchText || estadoFiltro !== 'todos'
                    ? 'No se encontraron instalaciones con los filtros aplicados'
                    : 'Aún no se han registrado instalaciones para este ISP'}
            </Text>
            {(!searchText && estadoFiltro === 'todos') && (
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleNuevaInstalacion}>
                    <Icon name="plus" size={20} color="#fff" />
                    <Text style={styles.emptyStateButtonText}>Nueva Instalación</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Cargando instalaciones...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredInstalaciones}
                renderItem={renderInstalacionCard}
                keyExtractor={(item) => item.id_instalacion.toString()}
                ListHeaderComponent={() => (
                    <>
                        {renderHeader}
                        {renderChart}
                    </>
                )}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3B82F6']}
                        tintColor="#3B82F6"
                    />
                }
            />

            {/* Floating Action Button */}
            {filteredInstalaciones.length > 0 && (
                <TouchableOpacity style={styles.fab} onPress={handleNuevaInstalacion}>
                    <Icon name="plus" size={28} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default InstalacionesListScreen;
