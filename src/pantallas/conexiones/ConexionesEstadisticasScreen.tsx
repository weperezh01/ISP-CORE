import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import Svg, { G, Line as SvgLine, Path, Rect, Circle, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../ThemeContext';
import { getStyles } from './ConexionesEstadisticasStyles';
import { fetchEstadisticasConexiones } from './services/estadisticasApi';

const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};

const getNiceStep = (roughStep: number) => {
    if (!isFinite(roughStep) || roughStep <= 0) {
        return 10;
    }
    const exponent = Math.floor(Math.log10(roughStep));
    const base = Math.pow(10, exponent);
    const multiples = [1, 2, 5, 10];
    const candidate = multiples.find(multiple => roughStep <= multiple * base) || 10;
    return candidate * base;
};

const buildAxis = (values: number[], tickTarget = 5) => {
    if (!values.length) {
        return {
            min: 0,
            max: 100,
            ticks: [0, 25, 50, 75, 100]
        };
    }

    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const range = rawMax - rawMin;
    const padding = Math.max(20, Math.round(range * 0.1));
    let min = Math.max(0, rawMin - padding);
    let max = rawMax + padding;

    const roughStep = (max - min) / Math.max(tickTarget - 1, 1);
    const niceStep = getNiceStep(roughStep);
    min = Math.floor(min / niceStep) * niceStep;
    max = Math.ceil(max / niceStep) * niceStep;

    const ticks: number[] = [];
    for (let tick = min; tick <= max; tick += niceStep) {
        ticks.push(tick);
    }

    return { min, max, ticks };
};

type SerieKey = 'total' | 'activas' | 'suspendidas' | 'bajas';

const ConexionesEstadisticasScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    const screenWidth = Dimensions.get('window').width;

    const [ispId, setIspId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [estadisticas, setEstadisticas] = useState(null);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes'); // año, mes, semana, dia
    const [errorFechaFutura, setErrorFechaFutura] = useState(false);
    const [seriesVisibility, setSeriesVisibility] = useState({
        total: true,
        activas: true,
        suspendidas: true,
        bajas: true,
    });

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
        const toggleSerie = (key: SerieKey) => {
            setSeriesVisibility(prev => {
                const keysWithData = (['total', 'activas', 'suspendidas', 'bajas'] as SerieKey[]).filter(serieKey => {
                    if (!estadisticas) {
                        return false;
                    }
                    const dataSource = serieKey === 'total' ? estadisticas.total : estadisticas[serieKey];
                    return Array.isArray(dataSource) && dataSource.length > 0;
                });

                const activeCount = keysWithData.filter(serieKey => prev[serieKey]).length;
                if (prev[key] && activeCount <= 1) {
                    return prev;
                }

                return { ...prev, [key]: !prev[key] };
            });
        };

        if (!estadisticas || !estadisticas.labels || estadisticas.labels.length === 0) {
            return (
                <View style={styles.emptyChartContainer}>
                    <Text style={styles.emptyChartText}>📊 No hay datos disponibles para este período</Text>
                </View>
            );
        }

        const serieConfiguracion = [
            {
                key: 'total' as SerieKey,
                label: 'Total',
                color: '#3B82F6',
                strokeWidth: 3,
                data: estadisticas.total || []
            },
            {
                key: 'activas' as SerieKey,
                label: 'Activas',
                color: '#22C55E',
                strokeWidth: 2,
                data: estadisticas.activas || []
            },
            {
                key: 'suspendidas' as SerieKey,
                label: 'Suspendidas',
                color: '#F97316',
                strokeWidth: 2,
                data: estadisticas.suspendidas || []
            },
            {
                key: 'bajas' as SerieKey,
                label: 'Bajas',
                color: '#EF4444',
                strokeWidth: 2,
                data: estadisticas.bajas || []
            }
        ].filter(serie => Array.isArray(serie.data) && serie.data.length > 0);

        if (!serieConfiguracion.length) {
            return (
                <View style={styles.emptyChartContainer}>
                    <Text style={styles.emptyChartText}>📈 Aún no hay datos disponibles para graficar</Text>
                </View>
            );
        }

        const seriesActivas = serieConfiguracion.filter(serie => seriesVisibility[serie.key]);
        const seriesParaRender = seriesActivas.length ? seriesActivas : serieConfiguracion;
        const valoresEscala = seriesParaRender
            .flatMap(serie => serie.data)
            .filter(value => typeof value === 'number');

        const axis = buildAxis(valoresEscala, 6);
        const isPantallaChica = screenWidth < 420;
        const chartHeight = isPantallaChica ? 450 : 600;
        const baseWidth = screenWidth - 16;
        const chartWidth = Math.max(baseWidth, estadisticas.labels.length * 90);
        const margin = { top: 28, right: 36, bottom: 48, left: 56 };
        const drawWidth = chartWidth - margin.left - margin.right;
        const drawHeight = chartHeight - margin.top - margin.bottom;
        const dominio = axis.max - axis.min || 1;
        const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
        const axisTextColor = isDarkMode ? '#CBD5F5' : '#4B5563';
        const labelBackground = isDarkMode ? 'rgba(31, 41, 55, 0.95)' : '#FFFFFF';
        const labelBorder = isDarkMode ? '#4B5563' : '#D1D5DB';
        const labelTextColor = isDarkMode ? '#F9FAFB' : '#111827';

        const getX = (index: number) => {
            if (estadisticas.labels.length <= 1) {
                return margin.left + drawWidth / 2;
            }
            return margin.left + (drawWidth * index) / (estadisticas.labels.length - 1);
        };

        const getY = (value: number) => {
            return margin.top + drawHeight - ((value - axis.min) / dominio) * drawHeight;
        };

        const renderLinePath = (serie) => {
            let path = '';
            let segmentoAbierto = false;
            serie.data.forEach((value, index) => {
                if (value === null || value === undefined) {
                    segmentoAbierto = false;
                    return;
                }
                const x = getX(index);
                const y = getY(value);
                if (!segmentoAbierto) {
                    path += `M ${x} ${y}`;
                    segmentoAbierto = true;
                } else {
                    path += ` L ${x} ${y}`;
                }
            });

            if (!path) {
                return null;
            }

            return (
                <Path
                    key={`path-${serie.key}`}
                    d={path}
                    fill="none"
                    stroke={serie.color}
                    strokeWidth={serie.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            );
        };

        const renderDots = (serie) => {
            return serie.data.map((value, index) => {
                if (value === null || value === undefined) {
                    return null;
                }
                const x = getX(index);
                const y = getY(value);
                const radius = serie.key === 'total' ? (isPantallaChica ? 4 : 5) : 3;
                return (
                    <Circle
                        key={`dot-${serie.key}-${index}`}
                        cx={x}
                        cy={y}
                        r={radius}
                        fill={isDarkMode ? '#111827' : '#FFFFFF'}
                        stroke={serie.color}
                        strokeWidth={2}
                    />
                );
            });
        };

        const renderEtiquetas = () => {
            const labelSeries = serieConfiguracion.filter(serie => seriesVisibility[serie.key]);

            if (!labelSeries.length) {
                return null;
            }

            const shouldShowDelta = true;
            const etiquetas: React.ReactNode[] = [];
            const ultimaSuperior: Record<SerieKey, { x: number; y: number } | null> = {
                total: null,
                activas: null,
                suspendidas: null,
                bajas: null
            };
            const ultimaInferior: Record<SerieKey, { x: number; y: number } | null> = {
                total: null,
                activas: null,
                suspendidas: null,
                bajas: null
            };

            const getLabelTheme = (key: SerieKey) => {
                if (key === 'activas') {
                    return {
                        background: isDarkMode ? 'rgba(6, 95, 70, 0.9)' : '#ECFDF5',
                        border: '#34D399',
                        text: isDarkMode ? '#D1FAE5' : '#065F46'
                    };
                }

                if (key === 'suspendidas') {
                    return {
                        background: isDarkMode ? 'rgba(120, 53, 15, 0.85)' : '#FFF7ED',
                        border: '#FB923C',
                        text: isDarkMode ? '#FED7AA' : '#7C2D12'
                    };
                }

                if (key === 'bajas') {
                    return {
                        background: isDarkMode ? 'rgba(127, 29, 29, 0.85)' : '#FEF2F2',
                        border: '#EF4444',
                        text: isDarkMode ? '#FCA5A5' : '#7F1D1D'
                    };
                }

                return {
                    background: labelBackground,
                    border: labelBorder,
                    text: labelTextColor
                };
            };

            labelSeries.forEach(serie => {
                const theme = getLabelTheme(serie.key);
                serie.data.forEach((value, index) => {
                    if (value === null || value === undefined) {
                        return;
                    }
                    const x = getX(index);
                    const y = getY(value);
                    const valorTexto = Number(value).toLocaleString('es-ES');
                    const labelHeight = 20;
                    const labelWidth = Math.max(48, valorTexto.length * 7 + 14);
                    const labelX = clamp(x - labelWidth / 2, margin.left - 10, chartWidth - margin.right - labelWidth + 10);
                    const labelY = clamp(y - labelHeight - 8, margin.top + 2, chartHeight - margin.bottom - labelHeight - 8);
                    const prevLabel = ultimaSuperior[serie.key];

                    if (!prevLabel || Math.abs(labelX - prevLabel.x) >= 18 || Math.abs(labelY - prevLabel.y) >= 18) {
                        etiquetas.push(
                            <G key={`label-top-${serie.key}-${index}`}>
                                <Rect
                                    x={labelX}
                                    y={labelY}
                                    width={labelWidth}
                                    height={labelHeight}
                                    rx={6}
                                    ry={6}
                                    fill={theme.background}
                                    stroke={theme.border}
                                    strokeWidth={1}
                                />
                                <SvgText
                                    x={labelX + labelWidth / 2}
                                    y={labelY + labelHeight / 2 + 0.5}
                                    fontSize={isPantallaChica ? 10 : 11}
                                    fontWeight="700"
                                    fill={theme.text}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {valorTexto}
                                </SvgText>
                            </G>
                        );
                        ultimaSuperior[serie.key] = { x: labelX, y: labelY };
                    }

                    if (index === 0 || !shouldShowDelta) {
                        return;
                    }

                    const previo = serie.data[index - 1];
                    if (previo === null || previo === undefined) {
                        return;
                    }

                    const diferencia = value - previo;
                    const arrow = diferencia > 0 ? '↑' : diferencia < 0 ? '↓' : '→';
                    const deltaColor = diferencia > 0 ? '#16A34A' : diferencia < 0 ? '#DC2626' : '#6B7280';
                    const signo = diferencia > 0 ? '+' : diferencia < 0 ? '-' : '';
                    const deltaNumero = Math.abs(diferencia).toLocaleString('es-ES');
                    const deltaTexto = diferencia === 0 ? '→ 0' : `${arrow} ${signo}${deltaNumero}`;
                    const deltaFill = diferencia > 0
                        ? 'rgba(34, 197, 94, 0.12)'
                        : diferencia < 0
                        ? 'rgba(248, 113, 113, 0.12)'
                        : isDarkMode
                        ? 'rgba(148, 163, 184, 0.25)'
                        : 'rgba(243, 244, 246, 0.95)';
                    const deltaHeight = 18;
                    const deltaWidth = Math.max(46, deltaTexto.length * 7 + 12);
                    const deltaX = clamp(x - deltaWidth / 2, margin.left - 10, chartWidth - margin.right - deltaWidth + 10);
                    const deltaY = clamp(y + 8, margin.top + 4, chartHeight - margin.bottom - deltaHeight - 4);
                    const prevDelta = ultimaInferior[serie.key];

                    if (!prevDelta || Math.abs(deltaX - prevDelta.x) >= 18 || Math.abs(deltaY - prevDelta.y) >= 18) {
                        etiquetas.push(
                            <G key={`label-bottom-${serie.key}-${index}`}>
                                <Rect
                                    x={deltaX}
                                    y={deltaY}
                                    width={deltaWidth}
                                    height={deltaHeight}
                                    rx={6}
                                    ry={6}
                                    fill={deltaFill}
                                    stroke={deltaColor}
                                    strokeWidth={1}
                                />
                                <SvgText
                                    x={deltaX + deltaWidth / 2}
                                    y={deltaY + deltaHeight / 2 + 0.5}
                                    fontSize={10}
                                    fontWeight="700"
                                    fill={deltaColor}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {deltaTexto}
                                </SvgText>
                            </G>
                        );
                        ultimaInferior[serie.key] = { x: deltaX, y: deltaY };
                    }
                });
            });

            return etiquetas;
        };

        const renderLegend = () => (
            <View style={styles.legendContainer}>
                <View style={styles.legendRow}>
                    {serieConfiguracion.map(serie => (
                        <TouchableOpacity
                            key={serie.key}
                            style={[
                                styles.legendItem,
                                seriesVisibility[serie.key] ? styles.legendItemActive : styles.legendItemInactive
                            ]}
                            onPress={() => toggleSerie(serie.key)}
                            activeOpacity={0.8}
                        >
                            <View
                                style={[
                                    styles.legendColor,
                                    {
                                        backgroundColor: serie.color,
                                        opacity: seriesVisibility[serie.key] ? 1 : 0.25
                                    }
                                ]}
                            />
                            <Text
                                style={[
                                    styles.legendText,
                                    seriesVisibility[serie.key] ? styles.legendTextActive : styles.legendTextInactive
                                ]}
                            >
                                {serie.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>📈 Evolución de Conexiones</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 24 }}
                >
                    <Svg width={chartWidth} height={chartHeight}>
                        <Rect
                            x={0}
                            y={0}
                            width={chartWidth}
                            height={chartHeight}
                            rx={12}
                            ry={12}
                            fill={isDarkMode ? '#111827' : '#FFFFFF'}
                        />
                        {/* Líneas horizontales del eje Y */}
                        {axis.ticks.map((tick, index) => {
                            const y = getY(tick);
                            return (
                                <G key={`y-${tick}-${index}`}>
                                    <SvgLine
                                        x1={margin.left}
                                        y1={y}
                                        x2={chartWidth - margin.right}
                                        y2={y}
                                        stroke={gridColor}
                                        strokeWidth={1}
                                        strokeDasharray="4 4"
                                    />
                                    <SvgText
                                        x={margin.left - 8}
                                        y={y + 4}
                                        fontSize={11}
                                        fill={axisTextColor}
                                        textAnchor="end"
                                    >
                                        {tick.toLocaleString('es-ES')}
                                    </SvgText>
                                </G>
                            );
                        })}

                        {/* Eje X y etiquetas */}
                        {estadisticas.labels.map((label, index) => {
                            const x = getX(index);
                            return (
                                <G key={`x-${label}-${index}`}>
                                    <SvgLine
                                        x1={x}
                                        y1={margin.top}
                                        x2={x}
                                        y2={chartHeight - margin.bottom}
                                        stroke={gridColor}
                                        strokeWidth={0.5}
                                        strokeDasharray="2 6"
                                    />
                                    <SvgText
                                        x={x}
                                        y={chartHeight - margin.bottom + 18}
                                        fontSize={11}
                                        fill={axisTextColor}
                                        textAnchor="middle"
                                    >
                                        {label}
                                    </SvgText>
                                </G>
                            );
                        })}

                        {/* Líneas */}
                        {seriesParaRender.map(serie => renderLinePath(serie))}
                        {seriesParaRender.map(serie => renderDots(serie))}

                        {/* Etiquetas personalizadas */}
                        {renderEtiquetas()}
                    </Svg>
                </ScrollView>

                {renderLegend()}
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
