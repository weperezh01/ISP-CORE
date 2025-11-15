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

    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
        opacity: 0.6,
    },

    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        textAlign: 'center',
        marginBottom: 8,
    },

    errorMessage: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },

    retryButton: {
        backgroundColor: colors.warning[600],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        shadowColor: colors.warning[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // OLT info card
    oltCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderLeftWidth: 4,
        borderLeftColor: colors.warning[500], // Orange accent
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 6,
        elevation: 4,
    },

    oltHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },

    oltMainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    oltIcon: {
        fontSize: 32,
        marginRight: 16,
    },

    oltTitleContainer: {
        flex: 1,
    },

    oltName: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    oltModel: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },

    oltDetailsSection: {
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        paddingTop: 16,
    },

    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },

    detailLabel: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
        flex: 1,
    },

    detailValue: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },

    // Stats card
    statsCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 6,
        elevation: 4,
    },

    statsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 16,
    },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    statItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 16,
    },

    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        marginBottom: 4,
    },

    statValueActive: {
        color: colors.success[600],
    },

    statValueAvailable: {
        color: colors.primary[600],
    },

    statValuePercentage: {
        color: colors.warning[600],
    },

    statLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        fontWeight: '500',
    },

    progressContainer: {
        marginTop: 8,
    },

    progressBar: {
        height: 8,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },

    progressFill: {
        height: '100%',
        backgroundColor: colors.warning[500],
        borderRadius: 4,
    },

    progressText: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        fontWeight: '500',
    },

    // ONUs management card
    managementCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 6,
        elevation: 4,
    },

    managementTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 8,
    },

    managementSubtitle: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 20,
        lineHeight: 20,
    },

    onuButtonsContainer: {
        gap: 12,
    },

    onuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        position: 'relative',
    },

    onuButtonAll: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
    },

    onuButtonAuthorized: {
        backgroundColor: colors.success[50],
        borderColor: colors.success[200],
    },

    onuButtonPending: {
        backgroundColor: colors.warning[50],
        borderColor: colors.warning[200],
    },

    onuButtonOffline: {
        backgroundColor: colors.error[50],
        borderColor: colors.error[200],
    },

    onuButtonIcon: {
        fontSize: 20,
        marginRight: 12,
    },

    onuButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        flex: 1,
    },

    onuButtonCount: {
        fontSize: 14,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        backgroundColor: isDarkMode ? colors.gray[600] : colors.gray[200],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 24,
        textAlign: 'center',
    },

    // Status indicators
    statusActive: {
        backgroundColor: colors.success[50],
        borderColor: colors.success[200],
    },

    statusTextActive: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.success[700],
    },

    statusInactive: {
        backgroundColor: colors.error[50],
        borderColor: colors.error[200],
    },

    statusTextInactive: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.error[700],
    },

    statusMaintenance: {
        backgroundColor: colors.warning[50],
        borderColor: colors.warning[200],
    },

    statusTextMaintenance: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.warning[700],
    },

    statusPending: {
        backgroundColor: colors.gray[50],
        borderColor: colors.gray[200],
    },

    statusTextPending: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.gray[700],
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
});