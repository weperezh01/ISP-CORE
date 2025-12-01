import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Svg, Circle, G } from 'react-native-svg';
import getStyles from '../IspDetailsStyles';

type ThemeStyles = ReturnType<typeof getStyles>;

type ServiceOrdersSummaryCardProps = {
  totalOrdenes: number;
  tasaCompletado: number;
  promedioResolucionDias: number;
  backlog: number;
  ordenesEsteMes: number;
  theme: {
    styles: ThemeStyles;
    isDarkMode: boolean;
  };
};

const ServiceOrdersSummaryCard: React.FC<ServiceOrdersSummaryCardProps> = ({
  totalOrdenes,
  tasaCompletado,
  promedioResolucionDias,
  backlog,
  ordenesEsteMes,
  theme,
}) => {
  const { styles, isDarkMode } = theme;
  const gradientColors = isDarkMode ? ['#312E81', '#1E1B4B'] : ['#F3E8FF', '#DDD6FE'];

  const safeTotal = Math.max(totalOrdenes || 0, 0);
  const safeBacklog = Math.max(backlog || 0, 0);
  const completedByCount = Math.max(safeTotal - safeBacklog, 0);
  const donutTotal = completedByCount + safeBacklog;

  const completionFallback = donutTotal > 0 ? (completedByCount / donutTotal) * 100 : 0;
  const completionRate = Math.max(
    0,
    Math.min(100, Number.isFinite(tasaCompletado) && tasaCompletado > 0 ? tasaCompletado : completionFallback),
  );

  const size = 90;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const completedRatio = donutTotal > 0 ? completedByCount / donutTotal : 0;
  const backlogRatio = donutTotal > 0 ? safeBacklog / donutTotal : 0;

  const donutSegments = React.useMemo(() => {
    const segments = [] as Array<{ key: string; ratio: number; color: string; dashArray: number; dashOffset: number }>;
    let cumulative = 0;
    const data = [
      { key: 'completed', ratio: completedRatio, color: isDarkMode ? '#22C55E' : '#16A34A' },
      { key: 'backlog', ratio: backlogRatio, color: '#F97316' },
    ].filter((segment) => segment.ratio > 0);

    return data.map((segment) => {
      const dashArray = circumference * segment.ratio;
      const dashOffset = circumference * (1 - cumulative - segment.ratio);
      cumulative += segment.ratio;
      return {
        ...segment,
        dashArray,
        dashOffset,
      };
    });
  }, [completedRatio, backlogRatio, circumference, isDarkMode]);

  const completionDisplay = `${completionRate.toFixed(2)}%`;
  const resolutionDisplay = Number.isFinite(promedioResolucionDias) && promedioResolucionDias > 0
    ? `${promedioResolucionDias.toFixed(2)} días`
    : '--';

  const metrics = [
    {
      key: 'completion',
      label: 'Tasa completado',
      value: completionDisplay,
      dotStyle: styles.ordersDotSuccess,
      valueStyle: styles.ordersValueSuccess,
    },
    {
      key: 'resolution',
      label: 'Prom. resolución',
      value: resolutionDisplay,
      dotStyle: styles.ordersDotInfo,
      valueStyle: styles.ordersValue,
    },
    {
      key: 'backlog',
      label: 'Backlog',
      value: safeBacklog.toLocaleString(),
      dotStyle: styles.ordersDotWarning,
      valueStyle: styles.ordersValueWarning,
    },
    {
      key: 'month',
      label: 'Este mes',
      value: (ordenesEsteMes || 0).toLocaleString(),
      dotStyle: styles.ordersDotNeutral,
      valueStyle: styles.ordersValue,
    },
  ];

  return (
    <View style={styles.ordersCard}>
      <LinearGradient colors={gradientColors} style={styles.ordersCardInner}>
        <View style={styles.ordersHeader}>
          <View style={styles.ordersHeaderLeft}>
            <View style={styles.ordersIconCircle}>
              <Icon name="assignment" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.ordersTitle}>Órdenes de Servicio</Text>
              <Text style={styles.ordersSubtitle}>Total: {safeTotal}</Text>
            </View>
          </View>
          <View style={styles.ordersBadge}>
            <Icon name="list-alt" size={16} color={isDarkMode ? '#E0E7FF' : '#4C1D95'} />
            <Text style={styles.ordersBadgeText}>{safeTotal}</Text>
          </View>
        </View>

        <View style={styles.ordersBarTrack}>
          <View
            style={[
              styles.ordersBarFill,
              { width: `${completionRate}%` },
            ]}
          />
          <Text style={styles.ordersBarLabel}>{completionDisplay}</Text>
        </View>

        <View style={styles.ordersBottomRow}>
          <View style={styles.ordersDonutWrapper}>
            <Svg width={size} height={size}>
              <G rotation="-90" origin={`${center}, ${center}`}>
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)'}
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {donutSegments.map((segment) => (
                  <Circle
                    key={segment.key}
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${segment.dashArray} ${circumference}`}
                    strokeDashoffset={segment.dashOffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                ))}
              </G>
            </Svg>
            <View style={styles.ordersDonutCenter}>
              <Text style={styles.ordersDonutLabel}>Completado</Text>
              <Text style={styles.ordersDonutValue}>{completionDisplay}</Text>
              <Text style={styles.ordersDonutHint}>Backlog {safeBacklog}</Text>
            </View>
          </View>

          <View style={styles.ordersMetricsList}>
            {metrics.map((metric) => (
              <View key={metric.key} style={styles.ordersMetricRow}>
                <View style={styles.ordersMetricLabelBlock}>
                  <View style={[styles.ordersDotBase, metric.dotStyle]} />
                  <Text style={styles.ordersMetricLabel}>{metric.label}</Text>
                </View>
                <Text style={[styles.ordersMetricValue, metric.valueStyle]}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default ServiceOrdersSummaryCard;
