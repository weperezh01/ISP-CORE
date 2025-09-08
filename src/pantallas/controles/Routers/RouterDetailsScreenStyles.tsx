import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Modern color palette - consistent with other screens
const colors = {
    primary: {
        50: '#EFF6FF',
        100: '#DBEAFE', 
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        900: '#1E3A8A'
    },
    success: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        500: '#10B981',
        600: '#059669',
        700: '#047857'
    },
    warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        500: '#F59E0B',
        600: '#D97706',
        700: '#B45309'
    },
    error: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C'
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
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[600],
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginRight: 12,
    },

    backButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
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

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.success[100],
        borderWidth: 1,
        borderColor: colors.success[200],
    },

    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.success[700],
    },

    // Content area
    contentContainer: {
        flex: 1,
        paddingTop: 16,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    // Router info card
    routerInfoCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderLeftWidth: 4,
        borderLeftColor: colors.primary[500],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 6,
    },

    routerInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    routerIcon: {
        fontSize: 32,
        marginRight: 16,
    },

    routerMainInfo: {
        flex: 1,
    },

    routerName: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    routerId: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
    },

    routerStatusIndicator: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: colors.success[100],
        borderWidth: 1,
        borderColor: colors.success[200],
    },

    routerStatusText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.success[700],
    },

    routerDetailsGrid: {
        marginTop: 8,
    },

    routerDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[100],
    },

    routerDetailLabel: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
        flex: 1,
    },

    routerDetailValue: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },

    // Section headers
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 20,
        paddingHorizontal: 4,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        letterSpacing: -0.2,
    },

    sectionCount: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },

    // Card styles
    cardContainer: {
        marginBottom: 16,
    },

    horizontalList: {
        paddingLeft: 16,
    },

    card: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        marginBottom: 8,
        width: width * 0.75,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.08,
        shadowRadius: 4,
        elevation: 3,
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    cardIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 24,
        textAlign: 'center',
    },

    cardInfo: {
        flex: 1,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        flex: 1,
    },

    cardSubtitle: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 2,
    },

    cardContent: {
        gap: 8,
    },

    cardDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    cardDetailLabel: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
        flex: 1,
    },

    cardDetailValue: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },

    // Interface specific styles
    interfaceCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.primary[500],
    },

    // VLAN specific styles  
    vlanCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.warning[500],
    },

    // IP Address specific styles
    ipCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.success[500],
    },

    // Add button card
    addCard: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        marginBottom: 8,
        width: width * 0.6,
        borderWidth: 2,
        borderColor: colors.primary[300],
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 120,
    },

    addCardIcon: {
        fontSize: 32,
        color: colors.primary[500],
        marginBottom: 8,
    },

    addCardText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary[600],
        textAlign: 'center',
    },

    // Loading states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },

    loadingContent: {
        alignItems: 'center',
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    loadingText: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        marginTop: 16,
        textAlign: 'center',
    },

    loadingSubtext: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 8,
        textAlign: 'center',
    },

    // Empty state
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 40,
    },

    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 16,
        opacity: 0.6,
    },

    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        textAlign: 'center',
        marginBottom: 8,
    },

    emptyStateMessage: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        lineHeight: 20,
        opacity: 0.8,
    },

    // Status indicators
    statusActive: {
        backgroundColor: colors.success[100],
        borderColor: colors.success[200],
    },

    statusTextActive: {
        color: colors.success[700],
    },

    statusInactive: {
        backgroundColor: colors.error[100],
        borderColor: colors.error[200],
    },

    statusTextInactive: {
        color: colors.error[700],
    },

    statusPending: {
        backgroundColor: colors.warning[100],
        borderColor: colors.warning[200],
    },

    statusTextPending: {
        color: colors.warning[700],
    },

    // Utility styles
    spacer: {
        height: 20,
    },

    divider: {
        height: 1,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        marginVertical: 16,
    },

    // Network metrics (if available)
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    metricItem: {
        alignItems: 'center',
        flex: 1,
    },

    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    metricLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
    },
});