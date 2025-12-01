import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import getStyles from '../IspDetailsStyles';

type ThemeStyles = ReturnType<typeof getStyles>;

type PopularPlan = {
  nombre: string;
  suscripciones: number;
};

type ServicesSummaryCardProps = {
  totalPlanes: number;
  totalSuscripciones: number;
  precioPromedio: number;
  ingresoMensual: number;
  planMasPopular?: PopularPlan | null;
  theme: {
    styles: ThemeStyles;
    isDarkMode: boolean;
  };
};

const ServicesSummaryCard: React.FC<ServicesSummaryCardProps> = ({
  totalPlanes,
  totalSuscripciones,
  precioPromedio,
  ingresoMensual,
  planMasPopular,
  theme,
}) => {
  const { styles, isDarkMode } = theme;
  const gradientColors = isDarkMode ? ['#064E3B', '#022C22'] : ['#ECFDF5', '#D1FAE5'];

  const planes = Math.max(totalPlanes || 0, 0);
  const suscripciones = Math.max(totalSuscripciones || 0, 0);
  const precio = Math.max(precioPromedio || 0, 0);
  const ingreso = Math.max(ingresoMensual || 0, 0);
  const popularName = planMasPopular?.nombre;
  const popularSubs = Math.max(planMasPopular?.suscripciones || 0, 0);

  const popularPct = suscripciones > 0 ? (popularSubs / suscripciones) * 100 : 0;
  const arpu = suscripciones > 0 ? ingreso / suscripciones : 0;

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

  return (
    <View style={styles.servicesCard}>
      <LinearGradient colors={gradientColors} style={styles.servicesCardInner}>
        <View style={styles.servicesHeader}>
          <View style={styles.servicesHeaderLeft}>
            <View style={styles.servicesIconCircle}>
              <Icon name="miscellaneous-services" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.servicesTitle}>Servicios</Text>
              <Text style={styles.servicesSubtitle}>
                Planes: {planes} • Suscripciones: {suscripciones}
              </Text>
            </View>
          </View>
          <View style={styles.servicesBadge}>
            <Icon name="inventory" size={16} color={isDarkMode ? '#A7F3D0' : '#065F46'} />
            <Text style={styles.servicesBadgeText}>{planes} planes</Text>
          </View>
        </View>

        <View style={styles.servicesBarTrack}>
          <View
            style={[
              styles.servicesBarFill,
              { width: `${Math.min(100, popularPct)}%` },
            ]}
          />
          <View style={styles.servicesBarLabelRow}>
            <Text style={styles.servicesBarLabel}>Plan más popular</Text>
            <Text style={styles.servicesBarValue}>
              {suscripciones > 0 ? `${popularPct.toFixed(1)}%` : 'Sin datos'}
            </Text>
          </View>
        </View>

        <View style={styles.servicesMetricsRow}>
          <View style={styles.servicesMetricBlock}>
            <View style={styles.servicesMetricLabelRow}>
              <View style={[styles.servicesDot, styles.servicesDotInfo]} />
              <Text style={styles.servicesMetricLabel}>Precio prom.</Text>
            </View>
            <Text style={styles.servicesMetricValue}>{formatCurrency(precio)}</Text>
          </View>

          <View style={styles.servicesMetricBlock}>
            <View style={styles.servicesMetricLabelRow}>
              <View style={[styles.servicesDot, styles.servicesDotSuccess]} />
              <Text style={styles.servicesMetricLabel}>Ingreso mensual</Text>
            </View>
            <Text style={[styles.servicesMetricValue, styles.servicesValueSuccess]}> 
              {formatCurrency(ingreso)}
            </Text>
          </View>
        </View>

        {suscripciones > 0 && (
          <View style={styles.servicesArpuRow}>
            <Text style={styles.servicesArpuLabel}>Ingreso promedio por suscripción</Text>
            <Text style={styles.servicesArpuValue}>{formatCurrency(arpu)}</Text>
          </View>
        )}

        <View style={styles.servicesDivider} />

        <View style={styles.servicesPopularContainer}>
          <View style={styles.servicesPopularHeader}>
            <Icon name="star" size={14} color={isDarkMode ? '#FCD34D' : '#F59E0B'} />
            <Text style={styles.servicesPopularTitle}>Más popular</Text>
          </View>

          {popularName ? (
            <View style={styles.servicesPopularContent}>
              <View style={styles.servicesPopularLeft}>
                <Text style={styles.servicesPopularPlan}>{popularName}</Text>
              </View>
              <View style={styles.servicesPopularRight}>
                <Text style={styles.servicesPopularSubs}>{popularSubs.toLocaleString()} suscr.</Text>
                {suscripciones > 0 && (
                  <Text style={styles.servicesPopularPct}>{`${popularPct.toFixed(1)}% del total`}</Text>
                )}
              </View>
            </View>
          ) : (
            <Text style={styles.servicesPopularEmpty}>Sin datos de plan popular</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default ServicesSummaryCard;
