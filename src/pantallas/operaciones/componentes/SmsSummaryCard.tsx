import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import getStyles from '../IspDetailsStyles';

type ThemeStyles = ReturnType<typeof getStyles>;

type SmsSummaryCardProps = {
  totalEnviados: number;
  tasaExito: number;
  costoTotal: number;
  entrantes: number;
  enviadosEsteMes: number;
  enviadosHoy: number;
  theme: {
    styles: ThemeStyles;
    isDarkMode: boolean;
  };
};

const SmsSummaryCard: React.FC<SmsSummaryCardProps> = ({
  totalEnviados,
  tasaExito,
  costoTotal,
  entrantes,
  enviadosEsteMes,
  enviadosHoy,
  theme,
}) => {
  const { styles, isDarkMode } = theme;
  const gradientColors = isDarkMode ? ['#134E4A', '#042F2E'] : ['#ECFDF5', '#D1FAE5'];
  const successPct = Math.max(0, Math.min(100, Number.isFinite(tasaExito) ? tasaExito : 0));

  const formatCurrency = (value: number) => {
    if (!Number.isFinite(value)) return '$0';
    try {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  const metrics = [
    {
      key: 'success',
      label: 'Tasa de éxito',
      value: `${successPct.toFixed(2)}%`,
      dotStyle: styles.smsDotSuccess,
      valueStyle: styles.smsValueSuccess,
    },
    {
      key: 'cost',
      label: 'Costo total',
      value: formatCurrency(costoTotal),
      dotStyle: styles.smsDotInfo,
      valueStyle: styles.smsValue,
    },
    {
      key: 'incoming',
      label: 'Entrantes',
      value: (entrantes || 0).toLocaleString(),
      dotStyle: styles.smsDotWarning,
      valueStyle: styles.smsValue,
    },
    {
      key: 'month',
      label: 'Este mes',
      value: (enviadosEsteMes || 0).toLocaleString(),
      dotStyle: styles.smsDotPrimary,
      valueStyle: styles.smsValue,
    },
    {
      key: 'today',
      label: 'Hoy',
      value: (enviadosHoy || 0).toLocaleString(),
      dotStyle: styles.smsDotNeutral,
      valueStyle: styles.smsValue,
    },
  ];

  return (
    <View style={styles.smsCard}>
      <LinearGradient colors={gradientColors} style={styles.smsCardInner}>
        <View style={styles.smsHeader}>
          <View style={styles.smsHeaderLeft}>
            <View style={styles.smsIconCircle}>
              <Icon name="sms" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.smsTitle}>Gestión de SMS</Text>
              <Text style={styles.smsSubtitle}>Total enviados: {totalEnviados || 0}</Text>
            </View>
          </View>
          <View style={styles.smsBadge}>
            <Icon name="send" size={16} color={isDarkMode ? '#CCFBF1' : '#0F766E'} />
            <Text style={styles.smsBadgeText}>{totalEnviados || 0}</Text>
          </View>
        </View>

        <View style={styles.smsBarTrack}>
          <View
            style={[
              styles.smsBarFill,
              { width: `${successPct}%` },
            ]}
          />
          <Text style={styles.smsBarLabel}>{successPct.toFixed(2)}%</Text>
        </View>

        <View style={styles.smsContent}>
          <View style={styles.smsKpiWrapper}>
            <Text style={styles.smsKpiLabel}>Tasa de éxito</Text>
            <Text style={styles.smsKpiValue}>
              {Number.isFinite(successPct) ? `${successPct.toFixed(2)}%` : '--'}
            </Text>
            <Text style={styles.smsKpiSub}>
              {totalEnviados > 0 ? `Total enviados: ${totalEnviados}` : 'Sin SMS enviados'}
            </Text>
          </View>

          <View style={styles.smsMetricsList}>
            {metrics.map((metric) => (
              <View key={metric.key} style={styles.smsMetricRow}>
                <View style={styles.smsMetricLabelBlock}>
                  <View style={[styles.smsDotBase, metric.dotStyle]} />
                  <Text style={styles.smsMetricLabel}>{metric.label}</Text>
                </View>
                <Text style={[styles.smsMetricValue, metric.valueStyle]}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default SmsSummaryCard;
