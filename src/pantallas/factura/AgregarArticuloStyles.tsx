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
        backgroundColor: isDarkMode ? colors.gray[800] : colors.success[600],
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
        color: isDarkMode ? colors.gray[300] : colors.success[100],
        opacity: 0.9,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
        backgroundColor: isDarkMode ? colors.gray[700] : colors.primary[50],
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.primary[200],
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
        backgroundColor: isDarkMode ? colors.gray[600] : colors.primary[100],
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

    // Form sections
    formSection: {
        marginBottom: 24,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 16,
        letterSpacing: -0.3,
    },

    // Input styles
    inputContainer: {
        marginBottom: 16,
    },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    inputWrapperFocused: {
        borderColor: colors.primary[500],
        backgroundColor: isDarkMode ? colors.gray[600] : colors.primary[50],
        shadowColor: colors.primary[500],
        shadowOpacity: 0.2,
    },

    inputIcon: {
        marginRight: 12,
        opacity: 0.7,
    },

    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        paddingVertical: 12,
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 8,
    },

    // Picker styles
    pickerContainer: {
        marginBottom: 16,
    },

    pickerWrapper: {
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    picker: {
        height: 50,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: 'transparent',
    },

    pickerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 8,
    },

    // Summary section
    summaryContainer: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 20,
        marginTop: 24,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 16,
        textAlign: 'center',
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },

    summaryLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    summaryDivider: {
        height: 1,
        backgroundColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        marginVertical: 12,
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
        color: colors.success[600],
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

    addButton: {
        backgroundColor: colors.success[600],
    },

    cancelButton: {
        backgroundColor: colors.gray[600],
    },

    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Empty states
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },

    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 16,
    },

    emptyStateText: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        fontWeight: '500',
    },

    // Helper text
    helperText: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        marginTop: 4,
        fontStyle: 'italic',
    },

    // Validation styles
    inputError: {
        borderColor: colors.error[500],
        backgroundColor: isDarkMode ? colors.error[900] : colors.error[50],
    },

    errorText: {
        fontSize: 12,
        color: colors.error[500],
        marginTop: 4,
        fontWeight: '500',
    },
});