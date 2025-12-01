import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';
import getStyles from '../IspDetailsStyles';

type ThemeStyles = ReturnType<typeof getStyles>;

type RouterInfo = {
  name: string;
  count: number;
  pct: number;
};

type ConfigurationsSummaryCardProps = {
  totalConfiguraciones: number;
  eficiencia: number;
  configuracionesEsteMes: number;
  routersTop?: RouterInfo[];
  theme: {
    styles: ThemeStyles;
    isDarkMode: boolean;
  };
};

const ConfigurationsSummaryCard: React.FC<ConfigurationsSummaryCardProps> = ({
  totalConfiguraciones,
  eficiencia,
  configuracionesEsteMes,
  routersTop = [],
  theme,
}) => {
  const { styles, isDarkMode } = theme;
  const gradientColors = isDarkMode
    ? ['#4B2C1F', '#1D140E']
    : ['#FEF3C7', '#FDE68A'];

  const baseRouters = useMemo(() => {
    return routersTop
      .map((router) => {
        const value = Number(router.count || 0);
        return {
          key: router.name,
          label: router.name,
          value,
          pct: router.pct,
          color: getRouterColor(router.name),
        };
      })
      .filter((router) => router.value > 0);
  }, [routersTop]);

  const totalRouters = useMemo(
    () => baseRouters.reduce((acc, router) => acc + router.value, 0),
    [baseRouters]
  );

  const normalizedRouters = useMemo(
    () =>
      baseRouters.map((router) => ({
        ...router,
        pct:
          router.pct !== undefined && router.pct !== null
            ? router.pct
            : totalRouters > 0
            ? (router.value / totalRouters) * 100
            : 0,
      })),
    [baseRouters, totalRouters]
  );

  const showDistribution = normalizedRouters.length > 1 && totalRouters > 0;

  const donutSegments = useMemo(() => {
    if (!showDistribution) return [];
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    let cumulative = 0;
    return normalizedRouters.map((router) => {
      const ratio = router.value / totalRouters;
      const dashArray = `${circumference * ratio} ${circumference}`;
      const dashOffset = circumference * (1 - cumulative - ratio);
      cumulative += ratio;
      return {
        ...router,
        dashArray,
        dashOffset,
      };
    });
  }, [normalizedRouters, showDistribution, totalRouters]);

  return (
    <View style={styles.configurationCard}>
      <LinearGradient colors={gradientColors} style={styles.configurationCardInner}>
        <View style={styles.configurationHeader}>
          <View style={styles.configurationHeaderLeft}>
            <View style={styles.configurationIconCircle}>
              <Icon
                name="settings"
                size={18}
                color="#FFFFFF"
              />
            </View>
            <View>
              <Text style={styles.configurationTitle}>Configuraciones</Text>
              <Text style={styles.configurationSubtitle}>Total: {totalConfiguraciones}</Text>
            </View>
          </View>
          <View style={styles.configurationBadge}>
            <Icon name="check-circle" size={16} color={isDarkMode ? '#BBF7D0' : '#047857'} />
            <Text style={styles.configurationBadgeText}>{totalConfiguraciones}</Text>
          </View>
        </View>

        <View style={styles.configurationBarTrack}>
          <View
            style={[
              styles.configurationBarFill,
              { width: `${Math.max(0, Math.min(100, eficiencia))}%` },
            ]}
          />
        </View>

        <View style={styles.configurationMetricsBlock}>
          <View style={styles.configurationRow}>
            <View style={styles.configurationRowLeft}>
              <View style={[styles.statusDot, styles.statusDotActive]} />
              <Text style={styles.configurationLabel}>Eficiencia</Text>
            </View>
            <Text style={styles.configurationValueSuccess}>{eficiencia.toFixed(2)}%</Text>
          </View>

          <View style={styles.configurationRow}>
            <View style={styles.configurationRowLeft}>
              <View style={[styles.statusDot, styles.statusDotInfo]} />
              <Text style={styles.configurationLabel}>Este mes</Text>
            </View>
            <Text style={styles.configurationValue}>{configuracionesEsteMes}</Text>
          </View>
        </View>

        {showDistribution ? (
          <View style={styles.configurationDistribution}>
            <View style={styles.configurationDonutWrapper}>
              <Svg width={90} height={90} viewBox="0 0 90 90">
                <Circle
                  cx="45"
                  cy="45"
                  r="32"
                  stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'}
                  strokeWidth={10}
                  fill="transparent"
                />
                {donutSegments.map((segment, idx) => (
                  <Circle
                    key={`${segment.key}-${idx}`}
                    cx="45"
                    cy="45"
                    r="32"
                    stroke={segment.color}
                    strokeWidth={10}
                    strokeDasharray={segment.dashArray}
                    strokeDashoffset={segment.dashOffset}
                    strokeLinecap="butt"
                    fill="transparent"
                    transform="rotate(-90 45 45)"
                  />
                ))}
                <Circle cx="45" cy="45" r="20" fill={isDarkMode ? '#1F2937' : '#FFFFFF'} />
                <SvgText
                  x="45"
                  y="43"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={isDarkMode ? '#CBD5F5' : '#4B5563'}
                >
                  {Number.isFinite(eficiencia) && eficiencia > 0 ? 'Eficiencia' : 'Total'}
                </SvgText>
                <SvgText
                  x="45"
                  y="55"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill={isDarkMode ? '#F8FAFC' : '#111827'}
                >
                  {Number.isFinite(eficiencia) && eficiencia > 0
                    ? `${eficiencia.toFixed(2)}%`
                    : `${totalConfiguraciones}`}
                </SvgText>
              </Svg>
            </View>

            <View style={styles.configurationLegend}>
              {normalizedRouters.map((router, idx) => (
                <View key={`${router.key}-${idx}`} style={styles.configurationLegendRow}>
                  <View
                    style={[styles.configurationLegendDot, { backgroundColor: router.color }]}
                  />
                  <Text style={styles.configurationLegendLabel} numberOfLines={1} ellipsizeMode="tail">
                    {router.label}
                  </Text>
                  <Text style={styles.configurationLegendValue}>
                    {router.value} ({router.pct.toFixed(1)}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.configurationTopList}>
            {normalizedRouters.map((router, idx) => (
              <View key={`${router.key}-${idx}`} style={styles.configurationRowCompact}>
                <View
                  style={[styles.statusDot, { backgroundColor: router.color }]}
                />
                <Text
                  style={styles.configurationLabel}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {router.label}
                </Text>
                <Text style={styles.configurationValue}>
                  {router.value} ({router.pct.toFixed(1)}%)
                </Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const getRouterColor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('olt')) return '#F97316';
  if (lower.includes('principal')) return '#3B82F6';
  if (lower.includes('4011')) return '#6366F1';
  if (lower.includes('2116')) return '#22C55E';
  return '#0EA5E9';
};

export default ConfigurationsSummaryCard;
