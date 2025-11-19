import { StyleSheet } from 'react-native';

const colors = {
    warning: {
        500: '#F59E0B',
        600: '#D97706',
    },
    success: {
        500: '#10B981',
    },
    error: {
        500: '#EF4444',
    },
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },
};

export const getStyles = (isDarkMode: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    // Header
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
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
        color: isDarkMode ? colors.gray[300] : 'rgba(255, 255, 255, 0.8)',
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

    // Loading / Error
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

    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
    },

    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },

    errorMessage: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        marginBottom: 24,
    },

    retryButton: {
        backgroundColor: colors.warning[500],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },

    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    // Content
    scrollView: {
        flex: 1,
    },

    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Card
    card: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        overflow: 'hidden',
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },

    // Table
    table: {
        minWidth: 1200, // Para scroll horizontal
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 2,
        borderBottomColor: isDarkMode ? colors.gray[600] : colors.gray[300],
    },

    tableHeaderCell: {
        fontSize: 12,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 8,
    },

    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        alignItems: 'center',
    },

    tableRowEven: {
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    },

    tableCell: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[300] : colors.gray[800],
        paddingHorizontal: 8,
    },

    tableCellBold: {
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },

    // Column widths
    slotColumn: {
        width: 60,
    },

    typeColumn: {
        width: 120,
    },

    portsColumn: {
        width: 70,
        textAlign: 'center',
    },

    swColumn: {
        width: 180,
    },

    statusColumn: {
        width: 100,
        alignItems: 'center',
    },

    roleColumn: {
        width: 100,
    },

    updatedColumn: {
        width: 180,
    },

    actionColumn: {
        width: 120,
        alignItems: 'center',
    },

    // Status Badge
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },

    roleText: {
        fontWeight: '600',
        color: isDarkMode ? colors.warning[500] : colors.warning[600],
    },

    // Reboot Button
    rebootButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.error[500],
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },

    rebootButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
