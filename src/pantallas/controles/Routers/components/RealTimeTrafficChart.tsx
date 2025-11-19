import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

interface TrafficDataPoint {
    timestamp: Date;
    tx_rate: number;
    rx_rate: number;
}

interface RealTimeTrafficChartProps {
    isDarkMode: boolean;
    trafficData: { upload_bps: number; download_bps: number };
    isPollingEnabled: boolean;
    maxDataPoints?: number;
    visibleDataPoints?: number;
}

const RealTimeTrafficChart: React.FC<RealTimeTrafficChartProps> = ({
    isDarkMode,
    trafficData,
    isPollingEnabled,
    maxDataPoints = 60,
    visibleDataPoints = 15
}) => {
    const [dataPoints, setDataPoints] = useState<TrafficDataPoint[]>([]);
    const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m'>('1m');
    const [showTx, setShowTx] = useState(true);
    const [showRx, setShowRx] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    // Add new data point when traffic data changes
    useEffect(() => {
        if (isPollingEnabled && trafficData) {
            const now = new Date();
            const newPoint: TrafficDataPoint = {
                timestamp: now,
                tx_rate: trafficData.upload_bps || 0,    // TX (Subida)
                rx_rate: trafficData.download_bps || 0   // RX (Bajada)
            };

            // console.log('📊 RealTimeChart: Adding new data point:', {
            //     time: formatTimeString(now),
            //     tx_rate: trafficData.upload_bps,    // TX (Subida)
            //     rx_rate: trafficData.download_bps   // RX (Bajada)
            // });

            setDataPoints(prevPoints => {
                const updatedPoints = [...prevPoints, newPoint];
                // Keep only the last maxDataPoints
                return updatedPoints.slice(-maxDataPoints);
            });
        }
    }, [trafficData, isPollingEnabled, maxDataPoints]);

    // Auto-scroll to the end when new data arrives
    useEffect(() => {
        if (autoScroll && dataPoints.length > visibleDataPoints && scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [dataPoints, autoScroll, visibleDataPoints]);

    // Format bytes per second to readable units
    const formatBps = (bps: number): string => {
        if (bps === 0) return '0';
        const k = 1000;
        const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
        const i = Math.floor(Math.log(bps) / Math.log(k));
        return parseFloat((bps / Math.pow(k, i)).toFixed(1)) + sizes[i];
    };

    // Format time for labels - show hour:minute:second in 12-hour format
    const formatTime = (date: Date): { time: string; period: string } => {
        const timeString = date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const [time, period] = timeString.split(' ');
        return { time, period };
    };

    // Format time as single string for other uses
    const formatTimeString = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Format time with seconds for current values display
    const formatTimeWithSeconds = (date: Date): string => {
        return date.toLocaleTimeString('es-ES', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Prepare chart data for scrollable view
    const getChartData = () => {
        if (dataPoints.length === 0) {
            return {
                labels: [''],
                datasets: [],
                chartWidth: screenWidth - 40 - 60, // Subtract Y-axis width
                maxValue: 0,
                minValue: 0,
                customLabelData: []
            };
        }

        // Get last points based on time range
        const now = new Date();
        const timeRangeMs = timeRange === '1m' ? 60000 : timeRange === '5m' ? 300000 : 900000;
        const filteredPoints = dataPoints.filter(point => 
            now.getTime() - point.timestamp.getTime() <= timeRangeMs
        );

        if (filteredPoints.length === 0) {
            return {
                labels: [''],
                datasets: [],
                chartWidth: screenWidth - 40 - 60, // Subtract Y-axis width
                maxValue: 0,
                minValue: 0,
                customLabelData: []
            };
        }

        // Calculate chart width based on data points (make it scrollable if more than visible points)
        const pointWidth = 40; // Width per data point
        const yAxisWidth = 60; // Width reserved for fixed Y-axis
        const minChartWidth = screenWidth - 40 - yAxisWidth; // Subtract Y-axis width
        const calculatedWidth = Math.max(minChartWidth, filteredPoints.length * pointWidth);
        
        // Ensure chart width is always a valid number
        const chartWidth = Number.isFinite(calculatedWidth) ? calculatedWidth : minChartWidth;

        // Create empty labels for chart and separate timestamp data for custom labels
        const labels = filteredPoints.map(() => ''); // Empty labels for chart
        const customLabelData = filteredPoints.map((point, index) => {
            // Show alternating labels (every other point) to avoid crowding
            const shouldShowLabel = index % 2 === 0; // Show on even indices (0, 2, 4, etc.)
            
            return shouldShowLabel ? point.timestamp : null;
        });

        const datasets = [];
        let allValues: number[] = [];

        if (showTx) {
            const txData = filteredPoints.map(point => point.tx_rate / 1000); // Convert to Kbps for better scaling
            datasets.push({
                data: txData,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green for TX
                strokeWidth: 2,
            });
            allValues = [...allValues, ...txData];
        }

        if (showRx) {
            const rxData = filteredPoints.map(point => point.rx_rate / 1000); // Convert to Kbps for better scaling
            datasets.push({
                data: rxData,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for RX
                strokeWidth: 2,
            });
            allValues = [...allValues, ...rxData];
        }

        // Calculate max and min values for Y-axis
        const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
        const minValue = 0; // Always start from 0 for traffic data

        return { 
            labels, 
            datasets,
            chartWidth: chartWidth,
            maxValue,
            minValue,
            customLabelData
        };
    };

    // Generate Y-axis labels
    const generateYAxisLabels = (maxValue: number, minValue: number) => {
        const steps = 5;
        const stepValue = (maxValue - minValue) / (steps - 1);
        const labels = [];
        
        for (let i = 0; i < steps; i++) {
            const value = minValue + (stepValue * (steps - 1 - i)); // Reverse order (top to bottom)
            labels.push(formatBps(value * 1000)); // Convert back to bps for display
        }
        
        return labels;
    };

    const chartData = getChartData();
    const hasData = dataPoints.length > 0 && chartData.datasets.length > 0;

    // Debug logging
    // useEffect(() => {
    //     if (chartData.customLabelData.length > 0) {
    //         console.log('📅 RealTimeChart: Custom label data:', chartData.customLabelData.map((timestamp, index) => ({
    //             index,
    //             timestamp: timestamp ? formatTimeString(timestamp) : 'null',
    //             actualTime: timestamp ? timestamp.toLocaleString() : 'null'
    //         })));
    //     }
    // }, [chartData.customLabelData]);

    const chartConfig = {
        backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
        backgroundGradientFrom: isDarkMode ? '#1F1F1F' : '#FFFFFF',
        backgroundGradientTo: isDarkMode ? '#1F1F1F' : '#FFFFFF',
        decimalPlaces: 1,
        color: (opacity = 1) => 'transparent', // Hide any native labels
        labelColor: (opacity = 1) => 'transparent', // Hide any native labels
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: "3",
            strokeWidth: "1",
            stroke: isDarkMode ? "#FFFFFF" : "#000000"
        },
        propsForBackgroundLines: {
            strokeDasharray: "", // Remove dashed lines
            stroke: isDarkMode ? "#374151" : "#E5E7EB",
            strokeWidth: 1
        },
        formatXLabel: () => '', // Hide X labels
        formatYLabel: () => '', // Hide Y labels
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF' }]}>
            {/* Chart Header */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Icon name="timeline" size={20} color={isDarkMode ? '#E0E0E0' : '#333333'} />
                    <Text style={[styles.title, { color: isDarkMode ? '#E0E0E0' : '#333333' }]}>
                        Gráfica de Tráfico en Tiempo Real
                    </Text>
                </View>
                
                <View style={styles.controlsContainer}>
                    {/* Auto-scroll Toggle */}
                    <TouchableOpacity
                        style={[
                            styles.autoScrollButton,
                            {
                                backgroundColor: autoScroll 
                                    ? (isDarkMode ? '#10B981' : '#059669')
                                    : (isDarkMode ? '#374151' : '#E5E7EB'),
                            }
                        ]}
                        onPress={() => setAutoScroll(!autoScroll)}
                    >
                        <Icon 
                            name={autoScroll ? "sync" : "sync-disabled"} 
                            size={14} 
                            color={autoScroll ? '#FFFFFF' : (isDarkMode ? '#9CA3AF' : '#6B7280')} 
                        />
                    </TouchableOpacity>
                    
                    {/* Time Range Selector */}
                    <View style={styles.timeRangeContainer}>
                        {(['1m', '5m', '15m'] as const).map((range) => (
                            <TouchableOpacity
                                key={range}
                                style={[
                                    styles.timeRangeButton,
                                    {
                                        backgroundColor: timeRange === range 
                                            ? (isDarkMode ? '#3B82F6' : '#2563EB')
                                            : (isDarkMode ? '#374151' : '#E5E7EB'),
                                    }
                                ]}
                                onPress={() => setTimeRange(range)}
                            >
                                <Text style={[
                                    styles.timeRangeText,
                                    {
                                        color: timeRange === range 
                                            ? '#FFFFFF' 
                                            : (isDarkMode ? '#9CA3AF' : '#6B7280')
                                    }
                                ]}>
                                    {range}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <TouchableOpacity
                    style={styles.legendItem}
                    onPress={() => setShowTx(!showTx)}
                >
                    <View style={[
                        styles.legendDot,
                        { backgroundColor: showTx ? '#10B981' : (isDarkMode ? '#6B7280' : '#D1D5DB') }
                    ]} />
                    <Text style={[
                        styles.legendText,
                        { 
                            color: showTx ? (isDarkMode ? '#FFFFFF' : '#000000') : (isDarkMode ? '#6B7280' : '#9CA3AF'),
                            textDecorationLine: showTx ? 'none' : 'line-through'
                        }
                    ]}>
                        TX (Subida) - {formatBps(trafficData?.upload_bps || 0)}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.legendItem}
                    onPress={() => setShowRx(!showRx)}
                >
                    <View style={[
                        styles.legendDot,
                        { backgroundColor: showRx ? '#3B82F6' : (isDarkMode ? '#6B7280' : '#D1D5DB') }
                    ]} />
                    <Text style={[
                        styles.legendText,
                        { 
                            color: showRx ? (isDarkMode ? '#FFFFFF' : '#000000') : (isDarkMode ? '#6B7280' : '#9CA3AF'),
                            textDecorationLine: showRx ? 'none' : 'line-through'
                        }
                    ]}>
                        RX (Bajada) - {formatBps(trafficData?.download_bps || 0)}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                {hasData ? (
                    <View style={styles.chartWithAxisContainer}>
                        {/* Fixed Y-Axis */}
                        <View style={[
                            styles.yAxisContainer, 
                            { 
                                backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
                                borderRightColor: isDarkMode ? '#374151' : '#E5E7EB'
                            }
                        ]}>
                            {generateYAxisLabels(chartData.maxValue, chartData.minValue).map((label, index) => (
                                <View key={index} style={styles.yAxisLabelContainer}>
                                    <Text style={[styles.yAxisLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                        {label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        
                        {/* Scrollable Chart Container */}
                        <View style={styles.chartScrollContainer}>
                            <ScrollView
                                ref={scrollViewRef}
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                onScrollBeginDrag={() => setAutoScroll(false)}
                                onMomentumScrollEnd={(event) => {
                                    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
                                    const isAtEnd = contentOffset.x >= (contentSize.width - layoutMeasurement.width - 20);
                                    if (isAtEnd) {
                                        setAutoScroll(true);
                                    }
                                }}
                            >
                                <View style={styles.chartAndLabelsContainer}>
                                    <LineChart
                                        data={{
                                            labels: chartData.labels,
                                            datasets: chartData.datasets
                                        }}
                                        width={chartData.chartWidth}
                                        height={180} // Reduced height to make room for custom labels
                                        chartConfig={chartConfig}
                                        bezier
                                        style={styles.chart}
                                        withHorizontalLabels={false} // Hide Y labels completely
                                        withVerticalLabels={false} // Hide X labels completely
                                        withInnerLines={false} // Hide grid lines that might show labels
                                        withOuterLines={false} // Hide outer lines that might show labels
                                        withDots={true}
                                        withShadow={false}
                                        withHorizontalLines={true}
                                        withVerticalLines={false}
                                        fromZero={true}
                                        segments={4} // Match our Y-axis steps
                                        hidePointsAtIndex={[]} // Show all dots
                                    />
                                    
                                    {/* Custom Time Labels */}
                                    <View style={[
                                        styles.customLabelsContainer, 
                                        { 
                                            backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
                                            borderTopColor: isDarkMode ? '#374151' : '#E5E7EB',
                                            width: chartData.chartWidth
                                        }
                                    ]}>
                                        {chartData.labels.map((_, dataIndex) => {
                                            const timestamp = chartData.customLabelData[dataIndex];
                                            
                                            if (!timestamp) {
                                                return null; // Don't render empty labels
                                            }
                                            
                                            // Calculate position to align directly under data points
                                            const totalDataPoints = chartData.labels.length;
                                            const chartPadding = 16; // Chart's internal padding
                                            const availableWidth = chartData.chartWidth - (chartPadding * 2);
                                            const position = totalDataPoints > 1 
                                                ? chartPadding + (dataIndex / (totalDataPoints - 1)) * availableWidth
                                                : chartData.chartWidth / 2; // Center single point
                                            
                                            const timeData = formatTime(timestamp);
                                            // console.log(`🕒 Label ${dataIndex}:`, timeData.time, timeData.period, `position: ${Number.isFinite(position) ? position.toFixed(1) : 'NaN'}px`);

                                            return (
                                                <View key={dataIndex} style={[
                                                    styles.customTimeLabel, 
                                                    { 
                                                        position: 'absolute',
                                                        left: Math.max(0, Math.min(chartData.chartWidth - 80, Number.isFinite(position) ? position - 40 : 0)), // Center and constrain with NaN check
                                                        minWidth: 80,
                                                        transform: [{ rotate: '15deg' }] // Slight rotation to prevent overlap
                                                    }
                                                ]}>
                                                    <Text style={[styles.timeText, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                                                        {timeData.time}
                                                    </Text>
                                                    <Text style={[styles.periodText, { color: isDarkMode ? '#D1D5DB' : '#6B7280' }]}>
                                                        {timeData.period}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                ) : (
                    <View style={[styles.noDataContainer, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                        <Icon name="timeline" size={40} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
                        <Text style={[styles.noDataText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                            {isPollingEnabled ? 'Recopilando datos...' : 'Pausado - Activa el polling para ver datos'}
                        </Text>
                        <Text style={[styles.noDataSubtext, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                            Los datos aparecerán automáticamente cada 3 segundos
                        </Text>
                        {dataPoints.length > 0 && (
                            <TouchableOpacity
                                style={[styles.scrollToEndButton, { backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB' }]}
                                onPress={() => {
                                    setAutoScroll(true);
                                    scrollViewRef.current?.scrollToEnd({ animated: true });
                                }}
                            >
                                <Icon name="skip-next" size={16} color="#FFFFFF" />
                                <Text style={styles.scrollToEndText}>Ver últimos datos</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Chart Info */}
            <View style={styles.chartInfo}>
                <View style={styles.infoItem}>
                    <Icon name="access-time" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.infoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        HH:MM:SS AM/PM
                    </Text>
                </View>
                <View style={styles.infoItem}>
                    <Icon name="show-chart" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.infoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        Puntos: {dataPoints.length}/{maxDataPoints}
                    </Text>
                </View>
                <View style={styles.infoItem}>
                    <Icon name="swipe-left" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.infoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {autoScroll ? 'Auto-scroll: ON' : 'Scroll manual'}
                    </Text>
                </View>
                <View style={styles.infoItem}>
                    <Icon name="speed" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    <Text style={[styles.infoText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        Kbps
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    autoScrollButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    timeRangeContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    timeRangeButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    timeRangeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '500',
    },
    chartContainer: {
        marginBottom: 12,
    },
    chartWithAxisContainer: {
        flexDirection: 'row',
        height: 240, // Increased to accommodate taller labels
    },
    chartScrollContainer: {
        flex: 1,
        height: 240,
    },
    chartAndLabelsContainer: {
        height: 240,
    },
    yAxisContainer: {
        width: 60,
        height: 190, // Adjusted to match chart height
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingRight: 8,
        borderRightWidth: 1,
    },
    yAxisLabelContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    yAxisLabel: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'right',
    },
    scrollView: {
        flex: 1,
        height: 240,
    },
    scrollContent: {
        alignItems: 'flex-start',
    },
    chart: {
        borderRadius: 8,
    },
    customLabelsContainer: {
        height: 50,
        paddingTop: 8,
        paddingBottom: 4,
        borderTopWidth: 1,
        position: 'relative',
    },
    customTimeLabel: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        height: 38,
    },
    labelSpacer: {
        height: 40,
    },
    timeText: {
        fontSize: 9,
        fontWeight: '700',
        lineHeight: 11,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    periodText: {
        fontSize: 7,
        fontWeight: '600',
        lineHeight: 9,
        marginTop: 1,
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    scrollToEndButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 12,
        gap: 6,
    },
    scrollToEndText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    noDataContainer: {
        width: screenWidth - 40,
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 20,
    },
    noDataText: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 12,
        textAlign: 'center',
    },
    noDataSubtext: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    chartInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 11,
        fontWeight: '500',
    },
});

export default RealTimeTrafficChart;