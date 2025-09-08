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

    // Content area
    contentContainer: {
        flex: 1,
        paddingTop: 16,
        paddingHorizontal: 16,
    },

    // Device grid
    deviceGrid: {
        paddingBottom: 20,
    },

    deviceCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 6,
        elevation: 4,
    },

    deviceCardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.8,
    },

    deviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    deviceIcon: {
        fontSize: 24,
        marginRight: 12,
        width: 32,
        textAlign: 'center',
    },

    deviceInfo: {
        flex: 1,
    },

    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 2,
    },

    deviceDescription: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        opacity: 0.8,
    },

    deviceStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: colors.success[100],
        borderWidth: 1,
        borderColor: colors.success[200],
    },

    deviceStatusText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.success[700],
    },

    deviceDetails: {
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        paddingTop: 12,
        marginTop: 4,
    },

    deviceDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    deviceDetailLabel: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
    },

    deviceDetailValue: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        fontWeight: '600',
    },

    // Status indicators
    statusActive: {
        backgroundColor: colors.success[50],
        borderColor: colors.success[200],
    },

    statusTextActive: {
        color: colors.success[700],
    },

    statusInactive: {
        backgroundColor: colors.error[50],
        borderColor: colors.error[200],
    },

    statusTextInactive: {
        color: colors.error[700],
    },

    statusPending: {
        backgroundColor: colors.warning[50],
        borderColor: colors.warning[200],
    },

    statusTextPending: {
        color: colors.warning[700],
    },

    // Loading states
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },

    loadingContent: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
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

    // Action buttons
    actionButton: {
        backgroundColor: colors.primary[600],
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
    },

    // Device type specific colors
    routerCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.primary[500],
    },

    switchCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.success[500],
    },

    oltCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.warning[500],
    },

    cameraCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.error[500],
    },

    serverCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.gray[600],
    },

    // Grid layout for larger screens
    deviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    deviceCardHalf: {
        flex: 1,
        marginRight: 6,
    },

    deviceCardHalfLast: {
        flex: 1,
        marginLeft: 6,
    },
});