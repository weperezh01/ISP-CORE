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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerLeft: {
        flex: 1,
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: -0.5,
    },

    headerSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[300] : colors.primary[100],
        opacity: 0.9,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary[600],
    },

    // Content area
    contentContainer: {
        flex: 1,
        paddingBottom: 20,
    },

    scrollContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    // Modern Card Design
    cardStyle: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        marginHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDarkMode ? 0.3 : 0.12,
        shadowRadius: 16,
        elevation: 12,
        overflow: 'hidden',
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: isDarkMode ? colors.gray[750] : colors.gray[50],
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        letterSpacing: -0.3,
    },

    cardContent: {
        padding: 24,
    },

    // Invoice info section
    invoiceInfoContainer: {
        marginBottom: 24,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },

    infoIcon: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    infoContent: {
        flex: 1,
    },

    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 2,
    },

    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    // Table styles - Modern design
    tableSection: {
        marginBottom: 24,
    },

    tableSectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 16,
        letterSpacing: -0.3,
    },

    tableContainer: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    scrollHint: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
        fontWeight: '500',
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: isDarkMode ? colors.gray[600] : colors.gray[200],
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 2,
        borderBottomColor: isDarkMode ? colors.gray[500] : colors.gray[300],
    },

    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[600] : colors.gray[200],
        alignItems: 'center',
    },

    tableRowEven: {
        backgroundColor: isDarkMode ? colors.gray[750] : '#FFFFFF',
    },

    tableRowOdd: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
    },

    tableCellHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
    },

    tableCell: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        textAlign: 'center',
    },

    tableCellInput: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[600] : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[500] : colors.gray[300],
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        textAlign: 'center',
        minHeight: 36,
    },

    tableCellInputFocused: {
        borderColor: colors.primary[500],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.primary[50],
    },

    tableCellAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'right',
    },

    deleteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: isDarkMode ? colors.error[900] + '20' : colors.error[50],
    },

    // Totals section
    totalsContainer: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },

    totalLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    totalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    finalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        marginTop: 8,
    },

    finalTotalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    finalTotalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary[600],
    },

    // Action buttons
    actionContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    button: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },

    cancelButton: {
        backgroundColor: colors.error[600],
    },

    saveButton: {
        backgroundColor: colors.success[600],
    },

    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Loading and states
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

    // Status colors
    statusPaid: {
        color: colors.success[600],
    },

    statusPending: {
        color: colors.warning[600],
    },

    statusOverdue: {
        color: colors.error[600],
    },
});