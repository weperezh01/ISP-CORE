import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import getStyles from '../IspDetailsStyles';

type ThemeStyles = ReturnType<typeof getStyles>;

type BillingSummaryCardProps = {
  totalCycles: number;
  activeCycles: number;
  closedCycles: number;
  overdueCycles: number;
  collectedPercent: number;
  pendingAmount: number;
  theme: {
    styles: ThemeStyles;
    isDarkMode: boolean;
  };
};

const BillingSummaryCard: React.FC<BillingSummaryCardProps> = ({
  totalCycles,
  activeCycles,
  closedCycles,
  overdueCycles,
  collectedPercent,
  pendingAmount,
  theme,
}) => {
  const { styles, isDarkMode } = theme;
  const total = totalCycles || activeCycles + closedCycles + overdueCycles;
  const gradientColors = isDarkMode ? ['#5B21B6', '#1F2937'] : ['#FDE68A', '#F97316'];
  const collectedPct = Math.max(0, Math.min(100, Number(collectedPercent || 0)));
  const pendingPct = Math.max(0, Math.min(100, 100 - collectedPct));
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, collectedPct, pendingPct]);

  const chips = [
    { key: 'vigentes', label: 'Vigentes', value: activeCycles, style: styles.billingChipActive },
    { key: 'cerrados', label: 'Cerrados', value: closedCycles, style: styles.billingChipInfo },
    { key: 'vencidos', label: 'Vencidos', value: overdueCycles, style: styles.billingChipOverdue },
  ].filter((chip) => chip.value > 0);

  return (
    <View style={styles.billingSummaryContainer}>
      <LinearGradient colors={gradientColors} style={styles.billingSummaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.billingHeader}>
          <View style={styles.billingIconCircle}>
            <Icon name="receipt" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.billingTitle}>Facturaciones</Text>
            <Text style={styles.billingSubtitle}>Total ciclos: {total}</Text>
          </View>
        </View>

        <View style={styles.billingBarTrack}>
          {collectedPct <= 0 && pendingPct <= 0 && (
            <View style={[styles.billingBarSegmentPending, { flex: 1, opacity: 0.2 }]}> 
              <Text style={styles.billingBarText}>Sin datos</Text>
            </View>
          )}
          {collectedPct > 0 && (
            <Animated.View
              style={[
                styles.billingBarSegmentCollected,
                {
                  flex: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, collectedPct],
                  }),
                },
              ]}
            >
              <Text style={styles.billingBarText}>{`Recaudado ${collectedPct.toFixed(2)}%`}</Text>
            </Animated.View>
          )}
          {pendingPct > 0 && (
            <Animated.View
              style={[
                styles.billingBarSegmentPending,
                {
                  flex: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, pendingPct],
                  }),
                },
              ]}
            >
              <Text style={styles.billingBarTextPending}>{`Pendiente ${pendingPct.toFixed(2)}%`}</Text>
            </Animated.View>
          )}
        </View>

        {chips.length > 0 && (
          <View style={styles.billingChipsRow}>
            {chips.map((chip) => (
              <View key={chip.key} style={chip.style}>
                <Text style={styles.billingChipLabel}>{chip.label}</Text>
                <Text style={styles.billingChipValue}>{chip.value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.billingStatsDivider} />

        <View style={styles.billingBottomStats}>
          <View style={styles.billingBottomStat}>
            <Icon
              name="trending-up"
              size={18}
              color={collectedPct >= 80 ? '#34D399' : collectedPct <= 20 ? '#F87171' : '#FBBF24'}
            />
            <View>
              <Text style={styles.billingBottomLabel}>Recaudación</Text>
              <Text style={styles.billingBottomValue}>{collectedPct.toFixed(2)}%</Text>
            </View>
          </View>
          <View style={styles.billingBottomStat}>
            <Icon name="warning-amber" size={18} color={isDarkMode ? '#FBBF24' : '#B45309'} />
            <View>
              <Text style={styles.billingBottomLabel}>Pendiente</Text>
              <Text style={[styles.billingBottomValue, styles.billingBottomWarning]}>
                ${Number(pendingAmount || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default BillingSummaryCard;
