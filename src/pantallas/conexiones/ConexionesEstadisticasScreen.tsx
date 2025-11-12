import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './ConexionesEstadisticasStyles';
import { fetchEstadisticasConexiones } from './services/estadisticasApi';

const ConexionesEstadisticasScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const screenWidth = Dimensions.get('window').width;

    const [ispId, setIspId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [estadisticas, setEstadisticas] = useState(null);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes'); // año, mes, semana, dia
    const [errorFechaFutura, setErrorFechaFutura] = useState(false);

    // Estados para las fechas seleccionadas
    // Inicializar con la fecha actual del sistema para mostrar datos recientes
    const hoy = new Date();
    const [añoSeleccionado, setAñoSeleccionado] = useState(hoy.getFullYear());
    const [mesSeleccionado, setMesSeleccionado] = useState(hoy.getMonth()); // 0-11
    const [semanaSeleccionada, setSemanaSeleccionada] = useState(0); // Semana del mes (0-4)
    const [diaSeleccionado, setDiaSeleccionado] = useState(hoy);

    useEffect(() => {
        const obtenerIspId = async () => {
            try {
                const id = await AsyncStorage.getItem('@selectedIspId');
                if (id !== null) {
                    setIspId(id);
                }
            } catch (error) {
                console.error('❌ Error al recuperar el ID del ISP:', error);
            }
        };
        obtenerIspId();
    }, []);

    useEffect(() => {
        if (ispId) {
            cargarEstadisticas();
        }
    }, [ispId, periodoSeleccionado, añoSeleccionado, mesSeleccionado, semanaSeleccionada, diaSeleccionado]);

    // Funciones auxiliares para manejar fechas
    const obtenerNombreMes = (mes: number) => {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[mes];
    };

    const formatearFecha = (fecha: Date) => {
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        return `${dia}/${mes}/${año}`;
    };

    const obtenerPeriodoActual = () => {
        switch (periodoSeleccionado) {
            case 'dia':
                return formatearFecha(diaSeleccionado);
            case 'semana':
                const inicioSemana = new Date(añoSeleccionado, mesSeleccionado, 1 + (semanaSeleccionada * 7));
                const finSemana = new Date(añoSeleccionado, mesSeleccionado, 7 + (semanaSeleccionada * 7));
                return `${formatearFecha(inicioSemana)} - ${formatearFecha(finSemana)}`;
            case 'mes':
                return `${obtenerNombreMes(mesSeleccionado)} ${añoSeleccionado}`;
            case 'ano':
                return `${añoSeleccionado}`;
            default:
                return '';
        }
    };

    const navegarAnterior = () => {
        switch (periodoSeleccionado) {
            case 'dia':
                const nuevoDia = new Date(diaSeleccionado);
                nuevoDia.setDate(nuevoDia.getDate() - 1);
                setDiaSeleccionado(nuevoDia);
                break;
            case 'semana':
                if (semanaSeleccionada > 0) {
                    setSemanaSeleccionada(semanaSeleccionada - 1);
                } else {
                    // Ir al mes anterior, última semana
                    if (mesSeleccionado > 0) {
                        setMesSeleccionado(mesSeleccionado - 1);
                    } else {
                        setMesSeleccionado(11);
                        setAñoSeleccionado(añoSeleccionado - 1);
                    }
                    setSemanaSeleccionada(3);
                }
                break;
            case 'mes':
                if (mesSeleccionado > 0) {
                    setMesSeleccionado(mesSeleccionado - 1);
                } else {
                    setMesSeleccionado(11);
                    setAñoSeleccionado(añoSeleccionado - 1);
                }
                break;
            case 'ano':
                setAñoSeleccionado(añoSeleccionado - 1);
                break;
        }
    };

    const navegarSiguiente = () => {
        // Usar fecha actual del sistema como límite máximo
        const hoy = new Date();
        const añoActual = hoy.getFullYear();
        const mesActual = hoy.getMonth();

        switch (periodoSeleccionado) {
            case 'dia':
                const nuevoDia = new Date(diaSeleccionado);
                nuevoDia.setDate(nuevoDia.getDate() + 1);
                // No permitir días más allá de hoy
                if (nuevoDia <= hoy) {
                    setDiaSeleccionado(nuevoDia);
                }
                break;
            case 'semana':
                if (semanaSeleccionada < 3) {
                    setSemanaSeleccionada(semanaSeleccionada + 1);
                } else {
                    // Ir al siguiente mes, primera semana
                    if (mesSeleccionado < 11) {
                        if (mesSeleccionado + 1 <= mesActual || añoSeleccionado < añoActual) {
                            setMesSeleccionado(mesSeleccionado + 1);
                            setSemanaSeleccionada(0);
                        }
                    } else {
                        if (añoSeleccionado < añoActual) {
                            setMesSeleccionado(0);
                            setAñoSeleccionado(añoSeleccionado + 1);
                            setSemanaSeleccionada(0);
                        }
                    }
                }
                break;
            case 'mes':
                if (mesSeleccionado < 11) {
                    if (mesSeleccionado + 1 <= mesActual || añoSeleccionado < añoActual) {
                        setMesSeleccionado(mesSeleccionado + 1);
                    }
                } else {
                    if (añoSeleccionado < añoActual) {
                        setMesSeleccionado(0);
                        setAñoSeleccionado(añoSeleccionado + 1);
                    }
                }
                break;
            case 'ano':
                if (añoSeleccionado < añoActual) {
                    setAñoSeleccionado(añoSeleccionado + 1);
                }
                break;
        }
    };

    const puedeIrAlSiguiente = () => {
        // Usar fecha actual del sistema como límite máximo
        const hoy = new Date();
        const añoActual = hoy.getFullYear();
        const mesActual = hoy.getMonth();

        switch (periodoSeleccionado) {
            case 'dia':
                const mañana = new Date(diaSeleccionado);
                mañana.setDate(mañana.getDate() + 1);
                return mañana <= hoy;
            case 'semana':
                if (añoSeleccionado < añoActual) return true;
                if (añoSeleccionado === añoActual && mesSeleccionado < mesActual) return true;
                if (añoSeleccionado === añoActual && mesSeleccionado === mesActual && semanaSeleccionada < 3) return true;
                return false;
            case 'mes':
                if (añoSeleccionado < añoActual) return true;
                if (añoSeleccionado === añoActual && mesSeleccionado < mesActual) return true;
                return false;
            case 'ano':
                return añoSeleccionado < añoActual;
            default:
                return false;
        }
    };

    const obtenerFechaEspecifica = () => {
        switch (periodoSeleccionado) {
            case 'ano':
                return añoSeleccionado.toString();
            case 'mes':
                const mes = (mesSeleccionado + 1).toString().padStart(2, '0');
                return `${añoSeleccionado}-${mes}`;
            case 'semana':
                const inicioSemana = new Date(añoSeleccionado, mesSeleccionado, 1 + (semanaSeleccionada * 7));
                const año = inicioSemana.getFullYear();
                const mesStr = (inicioSemana.getMonth() + 1).toString().padStart(2, '0');
                const dia = inicioSemana.getDate().toString().padStart(2, '0');
                return `${año}-${mesStr}-${dia}`;
            case 'dia':
                const añoDia = diaSeleccionado.getFullYear();
                const mesDia = (diaSeleccionado.getMonth() + 1).toString().padStart(2, '0');
                const diaDia = diaSeleccionado.getDate().toString().padStart(2, '0');
                return `${añoDia}-${mesDia}-${diaDia}`;
            default:
                return null;
        }
    };

    const cargarEstadisticas = async () => {
        try {
            setIsLoading(true);
            setErrorFechaFutura(false);
            const fechaEspecifica = obtenerFechaEspecifica();
            console.log('📊 Cargando estadísticas:', { periodo: periodoSeleccionado, fecha: fechaEspecifica });
            const data = await fetchEstadisticasConexiones(ispId, periodoSeleccionado, fechaEspecifica);

            setEstadisticas(data);
            console.log('✅ Estadísticas cargadas:', {
                fecha: fechaEspecifica,
                total: data.totales?.total || 0,
                labels: data.labels?.length || 0
            });
        } catch (error: any) {
            console.error('❌ Error al cargar estadísticas:', error);
            setErrorFechaFutura(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePeriodoChange = (nuevoPeriodo: string) => {
        setPeriodoSeleccionado(nuevoPeriodo);
        setErrorFechaFutura(false);

        // Resetear a la fecha actual del sistema
        const hoy = new Date();
        setAñoSeleccionado(hoy.getFullYear());
        setMesSeleccionado(hoy.getMonth());
        setSemanaSeleccionada(0);
        setDiaSeleccionado(hoy);
    };

    const renderPeriodoButtons = () => {
        const periodos = [
            { id: 'dia', label: 'Día', icon: '📅' },
            { id: 'semana', label: 'Semana', icon: '📆' },
            { id: 'mes', label: 'Mes', icon: '🗓️' },
            { id: 'ano', label: 'Año', icon: '📊' }
        ];

        return (
            <View style={styles.periodoContainer}>
                {periodos.map(periodo => (
                    <TouchableOpacity
                        key={periodo.id}
                        style={[
                            styles.periodoButton,
                            periodoSeleccionado === periodo.id && styles.periodoButtonActive
                        ]}
                        onPress={() => handlePeriodoChange(periodo.id)}
                    >
                        <Text style={styles.periodoIcon}>{periodo.icon}</Text>
                        <Text style={[
                            styles.periodoText,
                            periodoSeleccionado === periodo.id && styles.periodoTextActive
                        ]}>
                            {periodo.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderEstadisticaCard = (titulo, valor, icono, color) => (
        <View style={[styles.estadisticaCard, { borderLeftColor: color }]}>
            <Text style={styles.estadisticaIcono}>{icono}</Text>
            <View style={styles.estadisticaInfo}>
                <Text style={styles.estadisticaTitulo}>{titulo}</Text>
                <Text style={[styles.estadisticaValor, { color }]}>{valor}</Text>
            </View>
        </View>
    );

    const renderGrafica = () => {
        if (!estadisticas || !estadisticas.labels || estadisticas.labels.length === 0) {
            return (
                <View style={styles.emptyChartContainer}>
                    <Text style={styles.emptyChartText}>📊 No hay datos disponibles para este período</Text>
                </View>
            );
        }

        // Construir datasets dinámicamente según qué datos están disponibles
        const datasets = [];
        const legend = [];

        // Total (siempre disponible)
        if (estadisticas.total && estadisticas.total.length > 0) {
            datasets.push({
                data: estadisticas.total,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Azul - Total
                strokeWidth: 2
            });
            legend.push('Total');
        }

        // Activas (Etapa 2 - opcional)
        if (estadisticas.activas && estadisticas.activas.length > 0) {
            datasets.push({
                data: estadisticas.activas,
                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Verde - Activas
                strokeWidth: 2
            });
            legend.push('Activas');
        }

        // Suspendidas (Etapa 3 - opcional)
        if (estadisticas.suspendidas && estadisticas.suspendidas.length > 0) {
            datasets.push({
                data: estadisticas.suspendidas,
                color: (opacity = 1) => `rgba(251, 146, 60, ${opacity})`, // Naranja - Suspendidas
                strokeWidth: 2
            });
            legend.push('Suspendidas');
        }

        // Bajas (Etapa 4 - opcional)
        if (estadisticas.bajas && estadisticas.bajas.length > 0) {
            datasets.push({
                data: estadisticas.bajas,
                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Rojo - Bajas
                strokeWidth: 2
            });
            legend.push('Bajas');
        }

        const chartData = {
            labels: estadisticas.labels,
            datasets: datasets,
            legend: legend
        };

        // Calcular rango óptimo del eje Y con padding
        const calculateYAxisRange = (data) => {
            const max = Math.max(...data);
            const min = Math.min(...data);
            const range = max - min;

            // Si el rango es muy pequeño, usar padding fijo
            const padding = range < 100 ? 50 : Math.ceil(range * 0.2);

            // Redondear a múltiplos de 100 para ticks limpios
            const yMin = Math.floor((min - padding) / 100) * 100;
            const yMax = Math.ceil((max + padding) / 100) * 100;

            return { yMin: Math.max(0, yMin), yMax, range: yMax - yMin };
        };

        const yAxisRange = calculateYAxisRange(datasets[0].data);

        const chartConfig = {
            backgroundGradientFrom: isDarkMode ? '#1F2937' : '#FFFFFF',
            backgroundGradientTo: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
            barPercentage: 0.5,
            useShadowColorFromDataset: false,
            decimalPlaces: 0,
            propsForDots: {
                r: '5',
                strokeWidth: '2',
            },
            propsForBackgroundLines: {
                strokeDasharray: '', // solid lines
                stroke: isDarkMode ? '#374151' : '#E5E7EB',
                strokeWidth: 1
            },
            propsForLabels: {
                fontSize: 10
            },
            formatYLabel: (value) => {
                // Formatear con separador de miles
                return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        };

        // Detectar si es pantalla pequeña (móvil)
        const isPantallaChica = screenWidth < 420;
        const chartHeight = 360;
        const chartWidth = Math.max(screenWidth - 16, estadisticas.labels.length * 70);

        // Calcular posiciones de las etiquetas
        const renderEtiquetas = () => {
            // Parámetros de react-native-chart-kit LineChart
            const paddingTop = 16;
            const paddingRight = 64;
            const paddingBottom = 40;
            const paddingLeft = 16;

            const drawWidth = chartWidth - paddingLeft - paddingRight;
            const drawHeight = chartHeight - paddingTop - paddingBottom;

            const dataMax = Math.max(...datasets[0].data);
            const dataMin = Math.min(...datasets[0].data);
            const dataRange = dataMax - dataMin || 1;

            return datasets[0].data.map((value, index) => {
                const etiquetaWidth = isPantallaChica ? 38 : 44;
                const deltaWidth = isPantallaChica ? 40 : 48;

                // Calcular posición X
                const xRatio = datasets[0].data.length > 1
                    ? index / (datasets[0].data.length - 1)
                    : 0.5;
                const cx = paddingLeft + (xRatio * drawWidth);

                // Calcular posición Y (invertida)
                const yRatio = (value - dataMin) / dataRange;
                const cy = paddingTop + drawHeight - (yRatio * drawHeight);

                // Calcular diferencia con punto anterior
                let diferencia = 0;
                let flechaColor = '#6B7280';
                let flecha = '';

                if (index > 0) {
                    diferencia = value - datasets[0].data[index - 1];
                    if (diferencia > 0) {
                        flechaColor = '#22C55E';
                        flecha = '↑';
                    } else if (diferencia < 0) {
                        flechaColor = '#EF4444';
                        flecha = '↓';
                    } else {
                        flechaColor = '#9CA3AF';
                        flecha = '=';
                    }
                }

                return (
                    <View key={`label-${index}`}>
                        {/* Etiqueta superior: Valor total */}
                        <View
                            style={{
                                position: 'absolute',
                                left: cx - etiquetaWidth / 2,
                                top: cy - (isPantallaChica ? 24 : 30),
                                width: etiquetaWidth,
                                height: 20,
                                backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: isPantallaChica ? 9 : 11,
                                    fontWeight: '700',
                                    color: isDarkMode ? '#F9FAFB' : '#111827',
                                }}
                            >
                                {value.toLocaleString()}
                            </Text>
                        </View>

                        {/* Etiqueta inferior: Delta */}
                        {index > 0 && (
                            <View
                                style={{
                                    position: 'absolute',
                                    left: cx - deltaWidth / 2,
                                    top: cy + (isPantallaChica ? 6 : 10),
                                    minWidth: deltaWidth,
                                    height: 18,
                                    backgroundColor: flechaColor === '#22C55E'
                                        ? 'rgba(236, 253, 245, 0.95)'
                                        : flechaColor === '#EF4444'
                                        ? 'rgba(254, 242, 242, 0.95)'
                                        : 'rgba(249, 250, 251, 0.95)',
                                    borderRadius: 6,
                                    borderWidth: 1,
                                    borderColor: flechaColor,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingHorizontal: 6,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 2,
                                    elevation: 1,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: isPantallaChica ? 9 : 10,
                                        fontWeight: '700',
                                        color: flechaColor,
                                    }}
                                >
                                    {flecha} {Math.abs(diferencia)}
                                </Text>
                            </View>
                        )}
                    </View>
                );
            }).filter(Boolean);
        };

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>📈 Evolución de Conexiones</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 24 }}
                >
                    <View>
                        <LineChart
                            data={chartData}
                            width={chartWidth}
                            height={chartHeight}
                            chartConfig={chartConfig}
                            style={styles.chart}
                            withInnerLines={true}
                            withOuterLines={true}
                            withVerticalLines={true}
                            withHorizontalLines={true}
                            withVerticalLabels={true}
                            withHorizontalLabels={true}
                            withDots={true}
                            withShadow={false}
                            fromZero={false}
                            segments={5}
                        />
                        {/* Etiquetas superpuestas */}
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                            {renderEtiquetas()}
                        </View>
                    </View>
                </ScrollView>

                {/* Leyenda dinámica */}
                <View style={styles.legendContainer}>
                    <View style={styles.legendRow}>
                        {estadisticas.total && estadisticas.total.length > 0 && (
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: 'rgba(59, 130, 246, 1)' }]} />
                                <Text style={styles.legendText}>Total</Text>
                            </View>
                        )}
                        {estadisticas.activas && estadisticas.activas.length > 0 && (
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: 'rgba(34, 197, 94, 1)' }]} />
                                <Text style={styles.legendText}>Activas</Text>
                            </View>
                        )}
                    </View>
                    {(estadisticas.suspendidas?.length > 0 || estadisticas.bajas?.length > 0) && (
                        <View style={styles.legendRow}>
                            {estadisticas.suspendidas && estadisticas.suspendidas.length > 0 && (
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: 'rgba(251, 146, 60, 1)' }]} />
                                    <Text style={styles.legendText}>Suspendidas</Text>
                                </View>
                            )}
                            {estadisticas.bajas && estadisticas.bajas.length > 0 && (
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: 'rgba(239, 68, 68, 1)' }]} />
                                    <Text style={styles.legendText}>Bajas</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#2563EB'} />
                <Text style={styles.loadingText}>Cargando estadísticas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>📊 Estadísticas de Conexiones</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Banner informativo principal */}
                <View style={{
                    backgroundColor: isDarkMode ? '#065F46' : '#D1FAE5',
                    borderRadius: 8,
                    padding: 12,
                    marginTop: 16,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderLeftWidth: 4,
                    borderLeftColor: '#10B981'
                }}>
                    <Text style={{ fontSize: 20, marginRight: 10 }}>✨</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            color: isDarkMode ? '#A7F3D0' : '#065F46',
                            fontSize: 12,
                            fontWeight: '600',
                            marginBottom: 2
                        }}>
                            Navegación Histórica Habilitada
                        </Text>
                        <Text style={{
                            color: isDarkMode ? '#6EE7B7' : '#047857',
                            fontSize: 11
                        }}>
                            Usa ◀ ▶ para navegar entre períodos históricos. Etapa 1: Total de conexiones.
                        </Text>
                    </View>
                </View>

                {/* Banner de advertencia si no hay datos disponibles */}
                {errorFechaFutura && (
                    <View style={{
                        backgroundColor: isDarkMode ? '#92400E' : '#FEF3C7',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderLeftWidth: 4,
                        borderLeftColor: '#F59E0B'
                    }}>
                        <Text style={{ fontSize: 20, marginRight: 10 }}>⚠️</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                color: isDarkMode ? '#FCD34D' : '#92400E',
                                fontSize: 12,
                                fontWeight: '600',
                                marginBottom: 2
                            }}>
                                Datos No Disponibles
                            </Text>
                            <Text style={{
                                color: isDarkMode ? '#FDE68A' : '#78350F',
                                fontSize: 11
                            }}>
                                El período seleccionado no tiene datos en el servidor. La gráfica se mostrará vacía.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Selector de período */}
                {renderPeriodoButtons()}

                {/* Navegador de fechas */}
                <View style={styles.navegadorFechas}>
                    <TouchableOpacity
                        style={styles.navegadorBoton}
                        onPress={navegarAnterior}
                    >
                        <Text style={styles.navegadorIcono}>◀</Text>
                    </TouchableOpacity>

                    <View style={styles.periodoActualContainer}>
                        <Text style={styles.periodoActualLabel}>Período Seleccionado:</Text>
                        <Text style={styles.periodoActualTexto}>{obtenerPeriodoActual()}</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.navegadorBoton,
                            !puedeIrAlSiguiente() && styles.navegadorBotonDeshabilitado
                        ]}
                        onPress={navegarSiguiente}
                        disabled={!puedeIrAlSiguiente()}
                    >
                        <Text style={[
                            styles.navegadorIcono,
                            !puedeIrAlSiguiente() && styles.navegadorIconoDeshabilitado
                        ]}>▶</Text>
                    </TouchableOpacity>
                </View>

                {/* Tarjetas de estadísticas */}
                {estadisticas && (
                    <View style={styles.estadisticasGrid}>
                        {/* Total - Siempre disponible (Etapa 1) */}
                        {renderEstadisticaCard(
                            'Total Conexiones',
                            estadisticas.totales?.total || 0,
                            '🔌',
                            '#3B82F6'
                        )}

                        {/* Activas - Etapa 2 */}
                        {estadisticas.totales?.activas > 0 ? (
                            renderEstadisticaCard(
                                'Conexiones Activas',
                                estadisticas.totales.activas,
                                '✅',
                                '#22C55E'
                            )
                        ) : (
                            <View style={[styles.estadisticaCard, { borderLeftColor: '#9CA3AF', opacity: 0.6 }]}>
                                <Text style={styles.estadisticaIcono}>⏳</Text>
                                <View style={styles.estadisticaInfo}>
                                    <Text style={styles.estadisticaTitulo}>Conexiones Activas</Text>
                                    <Text style={[styles.estadisticaValor, { color: '#9CA3AF', fontSize: 12 }]}>Próximamente</Text>
                                </View>
                            </View>
                        )}

                        {/* Suspendidas - Etapa 3 */}
                        {estadisticas.totales?.suspendidas > 0 ? (
                            renderEstadisticaCard(
                                'Suspendidas',
                                estadisticas.totales.suspendidas,
                                '⏸️',
                                '#FB923C'
                            )
                        ) : (
                            <View style={[styles.estadisticaCard, { borderLeftColor: '#9CA3AF', opacity: 0.6 }]}>
                                <Text style={styles.estadisticaIcono}>⏳</Text>
                                <View style={styles.estadisticaInfo}>
                                    <Text style={styles.estadisticaTitulo}>Suspendidas</Text>
                                    <Text style={[styles.estadisticaValor, { color: '#9CA3AF', fontSize: 12 }]}>Próximamente</Text>
                                </View>
                            </View>
                        )}

                        {/* Bajas - Etapa 4 */}
                        {estadisticas.totales?.bajas > 0 ? (
                            renderEstadisticaCard(
                                'Bajas',
                                estadisticas.totales.bajas,
                                '❌',
                                '#EF4444'
                            )
                        ) : (
                            <View style={[styles.estadisticaCard, { borderLeftColor: '#9CA3AF', opacity: 0.6 }]}>
                                <Text style={styles.estadisticaIcono}>⏳</Text>
                                <View style={styles.estadisticaInfo}>
                                    <Text style={styles.estadisticaTitulo}>Bajas</Text>
                                    <Text style={[styles.estadisticaValor, { color: '#9CA3AF', fontSize: 12 }]}>Próximamente</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Gráfica */}
                {renderGrafica()}
            </ScrollView>
        </View>
    );
};

export default ConexionesEstadisticasScreen;
