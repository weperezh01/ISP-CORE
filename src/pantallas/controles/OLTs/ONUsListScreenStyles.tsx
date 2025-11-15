import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Modern color palette - consistent with OLT theme (orange)
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
        backgroundColor: isDarkMode ? colors.gray[800] : colors.warning[600], // Orange theme for OLTs
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
        color: isDarkMode ? colors.gray[300] : colors.warning[100],
        opacity: 0.8,
        marginTop: 2,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    totalBadge: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    totalBadgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.warning[600],
    },

    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    refreshButtonText: {
        fontSize: 20,
        color: '#FFFFFF',
    },

    // Filter buttons
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },

    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.2 : 0.05,
        shadowRadius: 2,
        elevation: 2,
    },

    filterButtonActive: {
        backgroundColor: colors.warning[500],
        borderColor: colors.warning[600],
        shadowColor: colors.warning[500],
        shadowOpacity: 0.3,
    },

    filterIcon: {
        fontSize: 16,
        marginRight: 6,
    },

    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        flex: 1,
        textAlign: 'center',
    },

    filterTextActive: {
        color: '#FFFFFF',
    },

    filterCount: {
        backgroundColor: isDarkMode ? colors.gray[600] : colors.gray[200],
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 4,
        minWidth: 20,
        alignItems: 'center',
    },

    filterCountText: {
        fontSize: 10,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
    },

    // Search section
    searchContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.05,
        shadowRadius: 4,
        elevation: 3,
    },

    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 4,
    },

    searchIcon: {
        fontSize: 18,
        marginRight: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
    },

    searchInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },

    // Content area
    contentContainer: {
        flex: 1,
        paddingTop: 8,
    },

    // ONU list
    onuList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    onuCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderLeftWidth: 4,
        borderLeftColor: colors.warning[500], // Orange accent for ONUs
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 6,
        elevation: 4,
    },

    onuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },

    onuInfo: {
        flex: 1,
    },

    onuSerial: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    onuDescription: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        opacity: 0.8,
    },

    onuStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        marginLeft: 12,
    },

    onuDetails: {
        marginBottom: 12,
    },

    onuDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    onuDetailLabel: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
        flex: 1,
    },

    onuDetailValue: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },

    onuMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        paddingTop: 8,
    },

    onuMetricsLabel: {
        fontSize: 11,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
    },

    // Status indicators
    statusAuthorized: {
        backgroundColor: colors.success[50],
        borderColor: colors.success[200],
    },

    statusTextAuthorized: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.success[700],
    },

    statusPending: {
        backgroundColor: colors.warning[50],
        borderColor: colors.warning[200],
    },

    statusTextPending: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.warning[700],
    },

    statusOffline: {
        backgroundColor: colors.error[50],
        borderColor: colors.error[200],
    },

    statusTextOffline: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.error[700],
    },

    statusUnknown: {
        backgroundColor: colors.gray[50],
        borderColor: colors.gray[200],
    },

    statusTextUnknown: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.gray[700],
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },

    loadingText: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginTop: 12,
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

    // Footer indicators
    footerContainer: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        alignItems: 'center',
        paddingBottom: 16,
    },

    cacheIndicator: {
        fontSize: 11,
        color: isDarkMode ? colors.warning[400] : colors.warning[600],
        fontStyle: 'italic',
        textAlign: 'center',
    },

    realtimeIndicator: {
        fontSize: 11,
        color: isDarkMode ? colors.success[400] : colors.success[600],
        fontWeight: '600',
        textAlign: 'center',
    },
});