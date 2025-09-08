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

    totalBadge: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    totalBadgeText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary[600],
    },

    // Content area
    contentContainer: {
        flex: 1,
        paddingTop: 12,
    },

    // Search section
    searchContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.05,
        shadowRadius: 4,
        elevation: 3,
    },

    searchInput: {
        fontSize: 15,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: 'transparent',
    },

    // Filter tags section
    filtersContainer: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },

    filterTagContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.2 : 0.03,
        shadowRadius: 2,
        elevation: 2,
    },

    filterTag: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.primary[800] : colors.primary[50],
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
    },

    filterTagText: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.primary[200] : colors.primary[700],
    },

    amountBadge: {
        backgroundColor: colors.success[600],
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        minWidth: 80,
        alignItems: 'center',
    },

    amountBadgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Connection list
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    // Connection item styles
    connectionCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },

    connectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: isDarkMode ? colors.gray[750] : colors.gray[50],
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    connectionId: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        letterSpacing: -0.3,
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 60,
        alignItems: 'center',
    },

    statusActive: {
        backgroundColor: colors.success[100],
    },

    statusInactive: {
        backgroundColor: colors.error[100],
    },

    statusPending: {
        backgroundColor: colors.warning[100],
    },

    statusTextActive: {
        color: colors.success[700],
        fontSize: 12,
        fontWeight: '700',
    },

    statusTextInactive: {
        color: colors.error[700],
        fontSize: 12,
        fontWeight: '700',
    },

    statusTextPending: {
        color: colors.warning[700],
        fontSize: 12,
        fontWeight: '700',
    },

    connectionContent: {
        padding: 16,
    },

    // Connection details grid
    detailsGrid: {
        marginBottom: 16,
    },

    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[100],
    },

    detailIcon: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    detailContent: {
        flex: 1,
    },

    detailLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    // Price section
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    priceContainer: {
        flex: 1,
    },

    priceLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    priceValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.success[600],
    },

    billingInfo: {
        alignItems: 'flex-end',
    },

    billingDay: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },

    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
        opacity: 0.5,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        textAlign: 'center',
        marginBottom: 8,
    },

    emptySubtitle: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        textAlign: 'center',
        lineHeight: 24,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContainer: {
        width: width * 0.95,
        maxHeight: '85%',
        minHeight: '70%',
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
    },

    modalHeader: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.primary[600],
        paddingHorizontal: 20,
        paddingVertical: 16,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },

    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },

    modalSection: {
        marginBottom: 28,
    },

    modalSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    filterOptionActive: {
        backgroundColor: isDarkMode ? colors.primary[800] : colors.primary[50],
        borderWidth: 2,
        borderColor: isDarkMode ? colors.primary[500] : colors.primary[300],
    },

    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[500] : colors.gray[400],
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },

    checkboxSelected: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
    },

    checkboxIcon: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    filterOptionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        lineHeight: 22,
    },

    filterOptionTextActive: {
        color: isDarkMode ? colors.primary[200] : colors.primary[700],
        fontWeight: '600',
    },

    // Modal actions
    modalActions: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        backgroundColor: isDarkMode ? colors.gray[750] : colors.gray[50],
    },

    modalButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    modalButtonPrimary: {
        backgroundColor: colors.primary[600],
    },

    modalButtonSecondary: {
        backgroundColor: isDarkMode ? colors.gray[600] : colors.gray[400],
    },

    modalButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Action modal
    actionModalContainer: {
        width: width * 0.85,
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },

    actionModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 20,
        textAlign: 'center',
    },

    actionButton: {
        width: '100%',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },

    actionButtonPrimary: {
        backgroundColor: colors.primary[600],
    },

    actionButtonSecondary: {
        backgroundColor: colors.success[600],
    },

    actionButtonDanger: {
        backgroundColor: colors.error[600],
    },

    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    loadingText: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginTop: 16,
        fontWeight: '500',
    },
});