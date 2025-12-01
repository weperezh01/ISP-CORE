import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import getStyles from '../IspDetailsStyles';

type ThemeStyles = ReturnType<typeof getStyles>;

type ClientsSummaryCardProps = {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  overdueActive: number;
  overdueInactive: number;
  theme: {
    styles: ThemeStyles;
    isDarkMode: boolean;
  };
};

const ClientsSummaryCard: React.FC<ClientsSummaryCardProps> = ({
  totalClients,
  activeClients,
  inactiveClients,
  overdueActive,
  overdueInactive,
  theme,
}) => {
  const { styles, isDarkMode } = theme;
  const total = totalClients || activeClients + inactiveClients;
  const activePercent = total > 0 ? Math.round((activeClients / total) * 100) : 0;
  const inactivePercent = total > 0 ? Math.round((inactiveClients / total) * 100) : 0;
  const gradientColors = isDarkMode ? ['#1E3A8A', '#111827'] : ['#DBEAFE', '#93C5FD'];
  const showActivos = activeClients > 0;
  const showInactivos = inactiveClients > 0;
  const showOverdueActive = overdueActive > 0;
  const showOverdueInactive = overdueInactive > 0;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, total]);

  const segments = total > 0 ? [
    {
      key: 'active',
      label: 'Activos',
      value: activeClients,
      percent: activePercent,
      style: styles.clientBarSegmentActive,
    },
    {
      key: 'inactive',
      label: 'Inactivos',
      value: inactiveClients,
      percent: inactivePercent,
      style: styles.clientBarSegmentInactive,
    },
  ] : [];

  return (
    <View style={styles.clientSummaryContainer}>
      <LinearGradient colors={gradientColors} style={styles.clientSummaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.clientHeaderCompact}>
          <View style={styles.clientIconCircle}>
            <Icon name="groups" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.clientTitle}>Clientes</Text>
            <Text style={styles.clientSubtitle}>Total: {total}</Text>
          </View>
        </View>

        <View style={styles.clientBarTrack}>
          {total > 0 ? (
            segments
              .filter((segment) => segment.value > 0)
              .map((segment) => {
                const ratio = segment.value / total;
                const animatedFlex = progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, ratio],
                });
                return (
                  <Animated.View
                    key={segment.key}
                    style={[styles.clientBarSegment, segment.style, { flex: animatedFlex }]}
                  >
                    <Text style={styles.clientBarSegmentText} numberOfLines={1}>
                      {`${segment.label} ${segment.percent}% (${segment.value})`}
                    </Text>
                  </Animated.View>
                );
              })
          ) : (
            <View style={[styles.clientBarSegment, styles.clientBarSegmentInactive, { flex: 1, opacity: 0.25 }]} />
          )}
        </View>

        <View style={styles.clientChipsRow}>
          <View style={styles.clientChipActive}>
            <Text style={styles.clientChipLabel}>Activos</Text>
            <Text style={styles.clientChipValue}>{activePercent}% ({activeClients})</Text>
          </View>
          <View style={styles.clientChipInactive}>
            <Text style={styles.clientChipLabel}>Inactivos</Text>
            <Text style={styles.clientChipValue}>{inactivePercent}% ({inactiveClients})</Text>
          </View>
        </View>

        <View style={styles.clientStatsListCompact}>
          {showActivos && (
            <View style={styles.clientStatsRowCompact}>
              <Text style={styles.clientStatsLabel}>Activos</Text>
              <Text style={styles.clientStatsValue}>{activeClients}</Text>
            </View>
          )}
          {showOverdueActive && (
            <View style={styles.clientStatsRowCompact}>
              <View style={styles.clientStatsRowLeft}>
                <Icon name="warning-amber" size={16} color={isDarkMode ? '#FBBF24' : '#B45309'} />
                <Text style={styles.clientStatsLabel}>Fact. vencidas</Text>
              </View>
              <Text style={[styles.clientStatsValue, styles.clientStatsWarning]}>{overdueActive}</Text>
            </View>
          )}
          {(showActivos || showOverdueActive) && (showInactivos || showOverdueInactive) && (
            <View style={styles.clientStatsDividerCompact} />
          )}
          {showInactivos && (
            <View style={styles.clientStatsRowCompact}>
              <Text style={styles.clientStatsLabel}>Inactivos</Text>
              <Text style={styles.clientStatsValue}>{inactiveClients}</Text>
            </View>
          )}
          {showOverdueInactive && (
            <View style={styles.clientStatsRowCompact}>
              <View style={styles.clientStatsRowLeft}>
                <Icon name="warning-amber" size={16} color={isDarkMode ? '#FBBF24' : '#B45309'} />
                <Text style={styles.clientStatsLabel}>Fact. vencidas</Text>
              </View>
              <Text style={[styles.clientStatsValue, styles.clientStatsWarning]}>{overdueInactive}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default ClientsSummaryCard;
