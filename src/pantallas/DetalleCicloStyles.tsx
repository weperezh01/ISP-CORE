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
    safeArea: {
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

    // ScrollView and content
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    contentContainer: {
        paddingBottom: 100,
    },

    // Modern cards
    card: {
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

    // Card header with icon
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },

    cardIconContainer: {
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

    cardHeaderContent: {
        flex: 1,
    },

    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
        letterSpacing: -0.3,
    },

    cardSubtitle: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
    },

    // Card content sections
    cardContent: {
        marginBottom: 16,
    },

    cardSection: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Detail rows
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

    // Status indicators
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
    },

    statusItem: {
        alignItems: 'center',
        flex: 1,
    },

    statusNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    statusLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '600',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Money display
    moneyContainer: {
        backgroundColor: isDarkMode ? colors.success[900] : colors.success[50],
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.success[700] : colors.success[200],
    },

    moneyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    moneyLabel: {
        fontSize: 14,
        color: isDarkMode ? colors.success[300] : colors.success[700],
        fontWeight: '500',
    },

    moneyValue: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? colors.success[400] : colors.success[700],
    },

    moneyTotal: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.success[300] : colors.success[800],
    },

    // Control sections
    controlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
    },

    controlLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        flex: 1,
    },

    controlValue: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        marginLeft: 12,
    },

    // Input fields
    inputContainer: {
        marginBottom: 16,
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 8,
        letterSpacing: 0.2,
    },

    input: {
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        fontWeight: '500',
        textAlign: 'center',
        minWidth: 100,
    },

    inputFocused: {
        borderColor: colors.primary[600],
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    // Buttons
    button: {
        backgroundColor: colors.primary[600],
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        minHeight: 48,
    },

    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[500] : colors.gray[400],
        shadowOpacity: 0,
        elevation: 0,
    },

    buttonSuccess: {
        backgroundColor: colors.success[600],
        shadowColor: colors.success[600],
    },

    buttonWarning: {
        backgroundColor: colors.warning[600],
        shadowColor: colors.warning[600],
    },

    buttonDanger: {
        backgroundColor: colors.error[600],
        shadowColor: colors.error[600],
    },

    buttonDisabled: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[300],
        shadowOpacity: 0,
        elevation: 0,
    },

    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },

    buttonTextSecondary: {
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    buttonTextDisabled: {
        color: isDarkMode ? colors.gray[500] : colors.gray[500],
    },

    // Chart container
    chartContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 16,
        textAlign: 'center',
    },

    chartValuesOverlay: {
        position: 'absolute',
        top: 40,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },

    chartValueText: {
        fontWeight: '700',
        color: '#000000',
        fontSize: 12,
        textAlign: 'center',
    },

    // Loading states
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

    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 20,
    },

    modalView: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },

    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },

    modalIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.warning[600],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: colors.warning[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
        letterSpacing: -0.3,
        marginBottom: 8,
    },

    modalMessage: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },

    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },

    modalButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },

    modalButtonPrimary: {
        backgroundColor: colors.warning[600],
        shadowColor: colors.warning[600],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },

    modalButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[500] : colors.gray[400],
    },

    // Legacy compatibility styles
    darkContainer: {
        backgroundColor: colors.gray[900],
    },

    lightContainer: {
        backgroundColor: colors.gray[50],
    },

    darkCard: {
        backgroundColor: colors.gray[800],
        borderColor: colors.gray[700],
    },

    lightCard: {
        backgroundColor: '#FFFFFF',
        borderColor: colors.gray[200],
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 16,
        letterSpacing: -0.3,
    },

    cardDetail: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 8,
        fontWeight: '500',
        lineHeight: 22,
    },

    darkText: {
        color: colors.gray[100],
    },

    lightText: {
        color: colors.gray[900],
    },

    text: {
        fontSize: 16,
        fontWeight: '500',
    },

    detailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        marginVertical: 8,
    },

    input2: {
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        fontWeight: '500',
        textAlign: 'center',
        minWidth: 100,
    },

    darkInput: {
        borderColor: colors.gray[600],
        color: colors.gray[100],
        backgroundColor: colors.gray[700],
    },

    lightInput: {
        borderColor: colors.gray[300],
        color: colors.gray[900],
        backgroundColor: colors.gray[50],
    },

    darkButton: {
        backgroundColor: colors.gray[600],
    },

    lightButton: {
        backgroundColor: colors.primary[600],
    },

    darkModalContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },

    lightModalContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    darkModalView: {
        backgroundColor: colors.gray[800],
        borderColor: colors.gray[700],
    },

    lightModalView: {
        backgroundColor: '#FFFFFF',
        borderColor: colors.gray[200],
    },

    // Progress Modal Styles
    progressModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
    },

    progressModalView: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    progressHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },

    progressIconContainer: {
        backgroundColor: colors.error[600],
        borderRadius: 50,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.error[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    progressTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.3,
    },

    progressSubtitle: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        fontWeight: '500',
    },

    progressContent: {
        width: '100%',
    },

    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? colors.warning[900] : colors.warning[50],
        borderWidth: 1,
        borderColor: colors.warning[200],
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },

    warningText: {
        flex: 1,
        fontSize: 14,
        color: isDarkMode ? colors.warning[200] : colors.warning[800],
        fontWeight: '500',
        marginLeft: 12,
        lineHeight: 20,
    },

    progressSection: {
        marginBottom: 24,
    },

    progressLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        marginBottom: 12,
        textAlign: 'center',
    },

    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },

    progressPercentage: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.success[600],
    },

    progressCount: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
    },

    progressStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },

    progressSpinner: {
        marginRight: 12,
    },

    progressText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        fontWeight: '500',
        textAlign: 'center',
        flex: 1,
    },

    progressInfo: {
        backgroundColor: isDarkMode ? colors.primary[900] : colors.primary[50],
        borderWidth: 1,
        borderColor: colors.primary[200],
        borderRadius: 12,
        padding: 16,
    },

    progressInfoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.primary[200] : colors.primary[800],
        marginBottom: 8,
    },

    progressInfoText: {
        fontSize: 13,
        color: isDarkMode ? colors.primary[300] : colors.primary[700],
        lineHeight: 18,
        fontWeight: '400',
    },
});

export default getStyles;