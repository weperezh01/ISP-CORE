import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Modern color palette - ONU theme (green for fiber optics)
const colors = {
    primary: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        900: '#064E3B'
    },
    secondary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8'
    },
    success: {
        50: '#ECFDF5',
        500: '#10B981',
        600: '#059669'
    },
    warning: {
        50: '#FFFBEB',
        500: '#F59E0B',
        600: '#D97706'
    },
    error: {
        50: '#FEF2F2',
        500: '#EF4444',
        600: '#DC2626'
    },
    purple: {
        500: '#8B5CF6',
        600: '#7C3AED'
    },
    gray: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A'
    }
};

export const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    // Header styles
    headerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 40,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[600], // Green theme for ONUs
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 4,
        elevation: 4,
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    headerTitleContainer: {
        flex: 1,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },

    headerSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[300] : colors.primary[100],
        opacity: 0.8,
        marginTop: 2,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Content area
    contentContainer: {
        flex: 1,
    },

    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },

    loadingText: {
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginTop: 16,
        textAlign: 'center',
    },

    // Error state
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
    },

    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },

    errorMessage: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        marginBottom: 24,
    },

    retryButton: {
        backgroundColor: colors.primary[500],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },

    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    // Status Card
    statusCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },

    statusInfo: {
        flex: 1,
    },

    statusLabel: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 4,
    },

    statusValue: {
        fontSize: 24,
        fontWeight: '700',
    },

    // Cards
    card: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },

    cardContent: {
        gap: 12,
    },

    // Info Rows
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },

    infoLabel: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        flex: 1,
    },

    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        flex: 1,
        textAlign: 'right',
    },

    // Signal Grid
    signalGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },

    signalBox: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    signalLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },

    signalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        marginBottom: 8,
    },

    signalIndicator: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },

    signalIndicatorText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Traffic Grid
    trafficGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },

    trafficBox: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    trafficLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },

    trafficValue: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },

    // Advanced metrics grid
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },

    metricBox: {
        flex: 1,
        minWidth: (width - 64) / 2,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    metricLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 8,
    },

    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        marginTop: 4,
    },

    // Status badges
    statusOnline: {
        backgroundColor: colors.success[50],
        borderColor: colors.success[500],
    },

    statusOffline: {
        backgroundColor: colors.error[50],
        borderColor: colors.error[500],
    },

    statusPending: {
        backgroundColor: colors.warning[50],
        borderColor: colors.warning[500],
    },

    statusUnknown: {
        backgroundColor: colors.gray[50],
        borderColor: colors.gray[300],
    },

    // Last update
    lastUpdateContainer: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        alignItems: 'center',
    },

    lastUpdateText: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontStyle: 'italic',
    },

    cacheIndicator: {
        fontSize: 11,
        color: isDarkMode ? colors.warning[400] : colors.warning[600],
        fontStyle: 'italic',
        marginTop: 4,
    },

    realtimeIndicator: {
        fontSize: 11,
        color: isDarkMode ? colors.success[400] : colors.success[600],
        fontWeight: '600',
        marginTop: 4,
    },

    // Payment status badge
    paymentStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },

    paymentStatusBadgePaid: {
        backgroundColor: colors.success[50],
        borderColor: colors.success[500],
    },

    paymentStatusBadgeLate: {
        backgroundColor: colors.warning[50],
        borderColor: colors.warning[500],
    },

    paymentStatusBadgeSuspended: {
        backgroundColor: colors.error[50],
        borderColor: colors.error[500],
    },

    paymentStatusBadgeUnknown: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        borderColor: isDarkMode ? colors.gray[500] : colors.gray[300],
    },

    paymentStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },
});
