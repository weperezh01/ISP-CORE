import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import getStyles from '../IspDetailsStyles';

type ThemeStyles = ReturnType<typeof getStyles>;

type ConnectionsSummaryCardProps = {
  totalConnections: number;
  active: number;
  suspended: number;
  inactive: number;
  theme: {
    styles: ThemeStyles;
    isDarkMode: boolean;
  };
};

const ConnectionsSummaryCard: React.FC<ConnectionsSummaryCardProps> = ({
  totalConnections,
  active,
  suspended,
  inactive,
  theme,
}) => {
  const { styles, isDarkMode } = theme;

  const statuses = [
    {
      key: 'active',
      label: 'Activas',
      value: active,
      color: '#10B981',
      icon: 'wifi' as const,
      segmentStyle: styles.connectionSegmentActive,
    },
    {
      key: 'suspended',
      label: 'Suspendidas',
      value: suspended,
      color: '#F59E0B',
      icon: 'pause-circle-filled' as const,
      segmentStyle: styles.connectionSegmentSuspended,
    },
    {
      key: 'inactive',
      label: 'Inactivas',
      value: inactive,
      color: '#9CA3AF',
      icon: 'portable-wifi-off' as const,
      segmentStyle: styles.connectionSegmentInactive,
    },
  ];

  const computedTotal = totalConnections || statuses.reduce((acc, status) => acc + status.value, 0);

  const statusesWithPercent = statuses.map((status) => ({
    ...status,
    percent: computedTotal > 0 ? Math.round((status.value / computedTotal) * 100) : 0,
  }));

  const availability = computedTotal > 0 ? Math.round((active / computedTotal) * 100) : 0;
  const gradientColors = isDarkMode ? ['#3A2A16', '#1C1407'] : ['#FFFBEB', '#FFE0B2'];

  return (
    <View style={styles.connectionsVisualizer}>
      <LinearGradient colors={gradientColors} style={styles.connectionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.connectionHeroRow}>
          <View style={styles.connectionHeroColumn}>
            <Text style={styles.connectionHeroLabel}>Activas</Text>
            <Text style={styles.connectionHeroValue}>{statusesWithPercent[0].value}</Text>
            <Text style={styles.connectionHeroSubtext}>{availability}% del total</Text>
          </View>
          <View style={styles.connectionHeroBadge}>
            <Icon
              name="hub"
              size={16}
              color={isDarkMode ? '#FDE68A' : '#B45309'}
              style={styles.connectionHeroBadgeIcon}
            />
            <View>
              <Text style={styles.connectionHeroBadgeText}>Total</Text>
              <Text style={styles.connectionHeroBadgeValue}>{computedTotal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.connectionHeroDivider} />

        <View style={styles.connectionProgressTrack}>
          {computedTotal > 0 ? (
            statusesWithPercent.map((status) =>
              status.value > 0 ? (
                <View
                  key={status.key}
                  style={[styles.connectionProgressSegment, status.segmentStyle, { flex: status.value }]}
                />
              ) : null,
            )
          ) : (
            <View style={[styles.connectionProgressSegment, styles.connectionProgressEmpty]} />
          )}
        </View>

        <View style={styles.connectionProgressLabels}>
          {statusesWithPercent.map((status) => (
            <View key={`${status.key}-label`} style={styles.connectionProgressLabel}>
              <View style={styles.connectionProgressLabelLeft}>
                <View style={[styles.connectionChipDot, { backgroundColor: status.color }]} />
                <Text style={styles.connectionProgressLabelText}>{status.label}</Text>
              </View>
              <View style={styles.connectionProgressLabelRight}>
                <Text style={styles.connectionProgressLabelValue}>{status.percent}%</Text>
                {(status.key === 'suspended' || status.key === 'inactive') && (
                  <Text style={styles.connectionProgressLabelCount}>{status.value}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

export default ConnectionsSummaryCard;
