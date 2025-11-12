import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Modern color palette - consistent with other improved screens
const colors = {
    // Primary Blues - Corporate & Professional
    primary: {
        50: '#EFF6FF',
        100: '#DBEAFE', 
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        900: '#1E3A8A'
    },
    // Success Greens
    success: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        500: '#10B981',
        600: '#059669',
        700: '#047857'
    },
    // Warning Orange
    warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        500: '#F59E0B',
        600: '#D97706',
        700: '#B45309'
    },
    // Error Red
    error: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C'
    },
    // Neutral Grays
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

const getStyles = (isDarkMode) => StyleSheet.create({
    // Main container
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    // Header section
    headerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        paddingTop: 50,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[600],
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.15,
        shadowRadius: 8,
        elevation: 8,
    },

    headerContent: {
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },

    headerSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[300] : colors.primary[100],
        textAlign: 'center',
        opacity: 0.9,
    },

    // Content area
    contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 100,
    },

    // Search section
    searchContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    searchInput: {
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        fontWeight: '500',
    },

    searchInputFocused: {
        borderColor: colors.primary[600],
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    // Invoice cards
    invoiceCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    invoiceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    invoiceIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    invoiceHeaderContent: {
        flex: 1,
    },

    invoiceHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
        gap: 8,
    },

    invoiceNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        letterSpacing: -0.3,
    },

    // Notes preview container
    notesPreviewContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        maxWidth: '100%',
    },

    invoiceStatus: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
        textAlign: 'center',
        alignSelf: 'flex-start',
    },

    statusPagado: {
        backgroundColor: colors.success[100],
        color: colors.success[700],
    },

    statusPendiente: {
        backgroundColor: colors.warning[100],
        color: colors.warning[700],
    },

    statusVencido: {
        backgroundColor: colors.error[100],
        color: colors.error[700],
    },

    // Invoice details
    invoiceDetails: {
        marginTop: 12,
    },

    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[100],
    },

    detailLabel: {
        flex: 1,
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
    },

    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'right',
    },

    detailMoney: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.success[600],
        textAlign: 'right',
    },

    detailPhone: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary[600],
        textAlign: 'right',
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },

    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        textAlign: 'center',
        marginBottom: 8,
    },

    emptyMessage: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        textAlign: 'center',
        lineHeight: 24,
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },

    loadingText: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 16,
        textAlign: 'center',
        fontWeight: '500',
    },

    // Error state
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },

    errorIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.error[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },

    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.error[600],
        textAlign: 'center',
        marginBottom: 8,
    },

    errorMessage: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        lineHeight: 24,
    },

    // Summary section
    summaryContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    summaryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.success[600],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: colors.success[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        letterSpacing: -0.3,
    },

    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
    },

    statItem: {
        alignItems: 'center',
        flex: 1,
    },

    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    statLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '600',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Filter chips
    filterContainer: {
        marginBottom: 20,
    },

    filterScrollView: {
        paddingHorizontal: 16,
    },

    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 12,
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    filterChipActive: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
        shadowColor: colors.primary[600],
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },

    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        textAlign: 'center',
    },

    filterChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    filterCounter: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: colors.error[600],
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
    },

    filterCounterText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
});

export default getStyles;