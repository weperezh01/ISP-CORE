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
        backgroundColor: isDarkMode ? colors.gray[800] : colors.warning[600],
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

    // Content area
    contentContainer: {
        flex: 1,
        paddingTop: 16,
        paddingHorizontal: 16,
    },

    scrollContent: {
        paddingBottom: 20,
    },

    // IP Information Card
    ipInfoCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderLeftWidth: 4,
        borderLeftColor: colors.warning[500],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 6,
    },

    ipInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    ipIcon: {
        fontSize: 32,
        marginRight: 16,
    },

    ipMainInfo: {
        flex: 1,
    },

    ipAddress: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    ipType: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
    },

    // Status indicators
    statusIndicator: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 80,
    },

    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },

    statusAssigned: {
        backgroundColor: colors.primary[100],
        borderWidth: 1,
        borderColor: colors.primary[200],
    },

    statusTextAssigned: {
        color: colors.primary[700],
    },

    statusUnassigned: {
        backgroundColor: colors.success[100],
        borderWidth: 1,
        borderColor: colors.success[200],
    },

    statusTextUnassigned: {
        color: colors.success[700],
    },

    // Details grid
    detailsGrid: {
        marginTop: 8,
    },

    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[100],
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
        flex: 2,
        textAlign: 'right',
    },

    detailValueHighlight: {
        color: colors.warning[600],
        fontWeight: '700',
    },

    // Connection info card
    connectionCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderLeftWidth: 4,
        borderLeftColor: colors.primary[500],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.08,
        shadowRadius: 4,
        elevation: 3,
    },

    connectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    connectionIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 24,
        textAlign: 'center',
    },

    connectionInfo: {
        flex: 1,
    },

    connectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 2,
    },

    connectionSubtitle: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        opacity: 0.8,
    },

    // Client info
    clientInfoCard: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },

    clientName: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        marginBottom: 4,
    },

    clientAddress: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        lineHeight: 16,
    },

    // Action buttons section
    actionsContainer: {
        marginTop: 'auto',
        paddingTop: 20,
        gap: 12,
    },

    actionButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },

    assignButton: {
        backgroundColor: colors.primary[600],
    },

    assignButtonDisabled: {
        backgroundColor: colors.gray[400],
    },

    removeButton: {
        backgroundColor: colors.error[600],
    },

    removeButtonDisabled: {
        backgroundColor: colors.gray[400],
    },

    actionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 8,
    },

    actionButtonIcon: {
        fontSize: 18,
    },

    // Input section
    inputSection: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        marginBottom: 8,
    },

    textInput: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    textInputFocused: {
        borderColor: colors.primary[500],
        borderWidth: 2,
    },

    inputHint: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 4,
        opacity: 0.8,
    },

    // Loading states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    loadingContent: {
        alignItems: 'center',
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 32,
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
        marginTop: 16,
        textAlign: 'center',
    },

    loadingSubtext: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 8,
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

    // Divider
    divider: {
        height: 1,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        marginVertical: 16,
    },

    // Section headers
    sectionHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 12,
        marginTop: 16,
    },

    // Warning states
    warningCard: {
        backgroundColor: isDarkMode ? colors.warning[900] : colors.warning[50],
        borderWidth: 1,
        borderColor: colors.warning[200],
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },

    warningIcon: {
        fontSize: 24,
        marginRight: 12,
    },

    warningText: {
        flex: 1,
        fontSize: 14,
        color: isDarkMode ? colors.warning[200] : colors.warning[800],
        fontWeight: '500',
    },

    // Utility styles
    spacer: {
        height: 20,
    },

    flex1: {
        flex: 1,
    },

    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});