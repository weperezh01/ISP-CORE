import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import getStyles from '../IspDetailsStyles';

type ThemeStyles = ReturnType<typeof getStyles>;

type InstallationsSummaryCardProps = {
  totalInstalaciones: number;
  instalacionesMes: number;
  instalacionesHoy: number;
  theme: {
    styles: ThemeStyles;
    isDarkMode: boolean;
  };
};

const InstallationsSummaryCard: React.FC<InstallationsSummaryCardProps> = ({
  totalInstalaciones,
  instalacionesMes,
  instalacionesHoy,
  theme,
}) => {
  const { styles, isDarkMode } = theme;
  const gradientColors = isDarkMode ? ['#0F172A', '#111827'] : ['#E0F2FE', '#BAE6FD'];

  const total = Math.max(totalInstalaciones || 0, 0);
  const mes = Math.max(instalacionesMes || 0, 0);
  const hoy = Math.max(instalacionesHoy || 0, 0);

  const mesPctSobreTotal = total > 0 ? (mes / total) * 100 : 0;
  const hoyPctSobreMes = mes > 0 ? (hoy / mes) * 100 : 0;

  return (
    <View style={styles.installationsCard}>
      <LinearGradient colors={gradientColors} style={styles.installationsCardInner}>
        <View style={styles.installationsHeader}>
          <View style={styles.installationsHeaderLeft}>
            <View style={styles.installationsIconCircle}>
              <Icon name="handyman" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.installationsTitle}>Instalaciones</Text>
              <Text style={styles.installationsSubtitle}>Total: {total}</Text>
            </View>
          </View>
          <View style={styles.installationsBadge}>
            <Icon name="engineering" size={16} color={isDarkMode ? '#BFDBFE' : '#1D4ED8'} />
            <Text style={styles.installationsBadgeText}>{total}</Text>
          </View>
        </View>

        <View style={styles.installationsStatsRow}>
          <View style={styles.installationsStatBlock}>
            <View style={styles.installationsStatLabelRow}>
              <View style={[styles.installationsDot, styles.installationsDotPrimary]} />
              <Text style={styles.installationsStatLabel}>Este mes</Text>
            </View>
            <Text style={styles.installationsStatValue}>{mes.toLocaleString()}</Text>
            <Text style={styles.installationsStatSub}>
              {total > 0 ? `${mesPctSobreTotal.toFixed(1)}% del total` : 'Sin datos'}
            </Text>
          </View>

          <View style={styles.installationsStatBlock}>
            <View style={styles.installationsStatLabelRow}>
              <View style={[styles.installationsDot, styles.installationsDotNeutral]} />
              <Text style={styles.installationsStatLabel}>Hoy</Text>
            </View>
            <Text style={styles.installationsStatValue}>{hoy.toLocaleString()}</Text>
            <Text style={styles.installationsStatSub}>
              {mes > 0 ? `${hoyPctSobreMes.toFixed(1)}% del mes` : '--'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default InstallationsSummaryCard;
