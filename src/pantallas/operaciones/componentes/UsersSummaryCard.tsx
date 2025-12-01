import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import getStyles from '../IspDetailsStyles';

type ThemeStyles = ReturnType<typeof getStyles>;

type RoleSummary = {
  nombre: string;
  cantidad: number;
};

type UsersSummaryCardProps = {
  totalUsuarios: number;
  activos: number;
  inactivos: number;
  rolesTop: RoleSummary[];
  theme: {
    styles: ThemeStyles;
    isDarkMode: boolean;
  };
};

const UsersSummaryCard: React.FC<UsersSummaryCardProps> = ({
  totalUsuarios,
  activos,
  inactivos,
  rolesTop = [],
  theme,
}) => {
  const { styles, isDarkMode } = theme;
  const gradientColors = isDarkMode ? ['#1E293B', '#0F172A'] : ['#E0E7FF', '#C7D2FE'];

  const total = Math.max(totalUsuarios || 0, 0);
  const activeCount = Math.max(activos || 0, 0);
  const inactiveCount = Math.max(inactivos || 0, 0);

  const activePct = total > 0 ? (activeCount / total) * 100 : 0;
  const inactivePct = total > 0 ? (inactiveCount / total) * 100 : 0;

  const activeSummary = `${activeCount.toLocaleString()} (${activePct.toFixed(0)}%)`;
  const inactiveSummary = `${inactiveCount.toLocaleString()} (${inactivePct.toFixed(0)}%)`;

  const topRoles = rolesTop
    .filter((role) => role && typeof role.nombre === 'string')
    .sort((a, b) => (b.cantidad || 0) - (a.cantidad || 0))
    .slice(0, 3);

  const roleColors = ['#3B82F6', '#8B5CF6', '#F97316'];

  return (
    <View style={styles.usersCard}>
      <LinearGradient colors={gradientColors} style={styles.usersCardInner}>
        <View style={styles.usersHeader}>
          <View style={styles.usersHeaderLeft}>
            <View style={styles.usersIconCircle}>
              <Icon name="people" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.usersTitle}>Usuarios</Text>
              <Text style={styles.usersSubtitle}>Total: {total}</Text>
            </View>
          </View>
          <View style={styles.usersBadge}>
            <Icon name="verified-user" size={16} color={isDarkMode ? '#CBD5F5' : '#1D4ED8'} />
            <Text style={styles.usersBadgeText}>{total}</Text>
          </View>
        </View>

        <View style={styles.usersBarTrack}>
          <View
            style={[
              styles.usersBarFill,
              { width: `${Math.min(100, activePct)}%` },
            ]}
          />
          <Text style={styles.usersBarLabel}>{`${activePct.toFixed(1)}% activos`}</Text>
        </View>

        <View style={styles.usersBottomRow}>
          <View style={styles.usersKpiWrapper}>
            <Text style={styles.usersKpiLabel}>Activos</Text>
            <Text style={styles.usersKpiValue}>{`${activePct.toFixed(1)}%`}</Text>
            <Text style={styles.usersKpiSub}>
              {total > 0 ? `${activeCount.toLocaleString()} de ${total.toLocaleString()}` : 'Sin usuarios'}
            </Text>
          </View>

          <View style={styles.usersMetricsList}>
            <View style={styles.usersMetricRow}>
              <View style={styles.usersMetricLabelBlock}>
                <View style={[styles.usersDotBase, styles.usersDotActive]} />
                <Text style={styles.usersMetricLabel}>Activos</Text>
              </View>
              <Text style={[styles.usersMetricValue, styles.usersValueSuccess]}>{activeSummary}</Text>
            </View>

            <View style={styles.usersMetricRow}>
              <View style={styles.usersMetricLabelBlock}>
                <View style={[styles.usersDotBase, styles.usersDotInactive]} />
                <Text style={styles.usersMetricLabel}>Inactivos</Text>
              </View>
              <Text style={[styles.usersMetricValue, styles.usersValueWarning]}>{inactiveSummary}</Text>
            </View>

            {topRoles.length > 0 && (
              <>
                <View style={styles.usersDivider} />
                <View style={styles.usersMetricRow}>
                  <Icon name="groups" size={14} color={isDarkMode ? '#93C5FD' : '#2563EB'} />
                  <Text style={[styles.usersMetricLabel, { flex: 1 }]}>Top Roles</Text>
                </View>
                {topRoles.map((role, index) => {
                  const pct = total > 0 ? (role.cantidad / total) * 100 : 0;
                  return (
                    <View key={`${role.nombre}-${index}`} style={styles.usersMetricRow}>
                      <View style={styles.usersMetricLabelBlock}>
                        <View
                          style={[
                            styles.usersDotBase,
                            { backgroundColor: roleColors[index % roleColors.length] },
                          ]}
                        />
                        <Text style={styles.usersMetricLabel}>{role.nombre}</Text>
                      </View>
                      <Text style={styles.usersMetricValue}>
                        {`${role.cantidad} (${pct.toFixed(0)}%)`}
                      </Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default UsersSummaryCard;
