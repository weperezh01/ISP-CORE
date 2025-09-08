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
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    // Filter section
    filterContainer: {
        paddingVertical: 16,
        paddingHorizontal: 4,
        marginBottom: 8,
    },

    filterScrollView: {
        flexGrow: 0,
    },

    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },

    filterChipActive: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
    },

    filterChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    filterChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: colors.error[600],
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },

    filterBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Cycle cards
    cycleCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        marginHorizontal: 2,
        padding: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    cycleCardPressed: {
        transform: [{ scale: 0.98 }],
        shadowOpacity: isDarkMode ? 0.5 : 0.15,
        elevation: 8,
    },

    // Status-based card styles
    inTimeCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.success[600],
        backgroundColor: isDarkMode ? colors.gray[800] : colors.success[50],
    },

    nearDueCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.warning[600],
        backgroundColor: isDarkMode ? colors.gray[800] : colors.warning[50],
    },

    overDueCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.error[600],
        backgroundColor: isDarkMode ? colors.gray[800] : colors.error[50],
    },

    defaultCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.gray[400],
        backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[50],
    },

    // Card header
    cycleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    cycleIconContainer: {
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

    cycleHeaderContent: {
        flex: 1,
    },

    cycleName: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
        letterSpacing: -0.3,
    },

    cycleDates: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
    },

    cycleStatus: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 4,
    },

    statusInTime: {
        color: colors.success[600],
    },

    statusNearDue: {
        color: colors.warning[600],
    },

    statusOverDue: {
        color: colors.error[600],
    },

    statusDefault: {
        color: colors.gray[500],
    },

    // Progress sections
    progressSection: {
        marginBottom: 16,
    },

    progressLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Time progress bar
    timeProgressContainer: {
        marginBottom: 16,
    },

    timeProgressBar: {
        height: 8,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },

    timeProgressFill: {
        height: '100%',
        backgroundColor: colors.primary[600],
        borderRadius: 4,
        position: 'relative',
    },

    timeProgressBall: {
        position: 'absolute',
        right: -6,
        top: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary[600],
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    // Money progress bar
    moneyProgressContainer: {
        marginBottom: 16,
    },

    moneyProgressBar: {
        height: 8,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },

    moneyProgressFill: {
        height: '100%',
        backgroundColor: colors.success[600],
        borderRadius: 4,
    },

    // Stats section
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },

    statItem: {
        flex: 1,
        alignItems: 'center',
    },

    statLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },

    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    // Money formatting
    moneyContainer: {
        marginTop: 12,
        padding: 16,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    moneyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    moneyLabel: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        fontWeight: '500',
    },

    moneyValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.success[600],
    },

    moneyTotal: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
    },

    // Outstanding amount (faltante)
    outstandingAmount: {
        marginTop: 12,
        padding: 16,
        backgroundColor: isDarkMode ? colors.error[900] : colors.error[50],
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.error[700] : colors.error[200],
        alignItems: 'center',
    },

    outstandingLabel: {
        fontSize: 14,
        color: isDarkMode ? colors.error[300] : colors.error[700],
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    outstandingValue: {
        fontSize: 24,
        fontWeight: '700',
        color: isDarkMode ? colors.error[400] : colors.error[700],
    },

    // Invoice stats
    invoiceStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    invoiceStatItem: {
        alignItems: 'center',
        flex: 1,
    },

    invoiceStatNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    invoiceStatLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '600',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Legacy compatibility styles
    itemContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        marginHorizontal: 2,
        padding: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    itemName: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 8,
        letterSpacing: -0.3,
    },

    itemDetails: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 6,
        fontWeight: '500',
        lineHeight: 20,
    },

    boldText: {
        fontWeight: '700',
    },

    // Progress bars (legacy compatibility)
    progressBar: {
        height: 8,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderRadius: 4,
        overflow: 'hidden',
        marginVertical: 8,
    },

    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary[600],
        borderRadius: 4,
        position: 'relative',
    },

    progressBall: {
        position: 'absolute',
        right: -6,
        top: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary[600],
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    moneyProgressBar: {
        height: 8,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderRadius: 4,
        overflow: 'hidden',
        marginVertical: 8,
    },

    moneyProgressBarFill: {
        height: '100%',
        backgroundColor: colors.success[600],
        borderRadius: 4,
    },

    // Status background colors (legacy)
    inTimeBackground: {
        borderLeftWidth: 4,
        borderLeftColor: colors.success[600],
        backgroundColor: isDarkMode ? colors.gray[800] : colors.success[50],
    },

    nearDueBackground: {
        borderLeftWidth: 4,
        borderLeftColor: colors.warning[600],
        backgroundColor: isDarkMode ? colors.gray[800] : colors.warning[50],
    },

    overDueBackground: {
        borderLeftWidth: 4,
        borderLeftColor: colors.error[600],
        backgroundColor: isDarkMode ? colors.gray[800] : colors.error[50],
    },

    defaultBackground: {
        borderLeftWidth: 4,
        borderLeftColor: colors.gray[400],
        backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[50],
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },

    emptyMessage: {
        fontSize: 18,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 26,
        marginTop: 16,
    },

    // FlatList specific
    flatListContent: {
        paddingBottom: 100,
    },
});

export default getStyles;