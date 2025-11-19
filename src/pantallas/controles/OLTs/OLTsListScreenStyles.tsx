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

    oltImage: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100],
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

    // Content area
    contentContainer: {
        flex: 1,
        paddingTop: 16,
    },

    // Action bar
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.05,
        shadowRadius: 4,
        elevation: 3,
    },

    addButton: {
        backgroundColor: colors.warning[600],
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.warning[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 6,
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

    searchPlaceholder: {
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
    },

    // OLT list
    oltList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    oltCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderLeftWidth: 4,
        borderLeftColor: colors.warning[500], // Orange accent for OLTs
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 6,
        elevation: 4,
    },

    oltCardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.8,
    },

    oltHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    oltIcon: {
        fontSize: 24,
        marginRight: 12,
        width: 32,
        textAlign: 'center',
    },

    oltInfo: {
        flex: 1,
    },

    oltName: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 2,
    },

    oltSubtitle: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        opacity: 0.8,
    },

    oltStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: colors.success[100],
        borderWidth: 1,
        borderColor: colors.success[200],
    },

    oltStatusText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.success[700],
    },

    oltDetails: {
        marginBottom: 16,
    },

    oltDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    oltDetailLabel: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
        flex: 1,
    },

    oltDetailValue: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },

    // Action buttons
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        paddingTop: 12,
        gap: 8,
    },

    actionButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    viewButton: {
        backgroundColor: colors.primary[50],
        borderWidth: 1,
        borderColor: colors.primary[200],
    },

    viewButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary[700],
        marginLeft: 4,
    },

    editButton: {
        backgroundColor: colors.warning[50],
        borderWidth: 1,
        borderColor: colors.warning[200],
    },

    editButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.warning[700],
        marginLeft: 4,
    },

    deleteButton: {
        backgroundColor: colors.error[50],
        borderWidth: 1,
        borderColor: colors.error[200],
    },

    deleteButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.error[700],
        marginLeft: 4,
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },

    loadingContent: {
        alignItems: 'center',
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
        marginBottom: 20,
    },

    emptyStateButton: {
        backgroundColor: colors.warning[600], // Orange theme for OLTs
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.warning[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    emptyStateButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
    },
});
