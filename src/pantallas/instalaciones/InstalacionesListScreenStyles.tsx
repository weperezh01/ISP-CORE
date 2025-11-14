import { StyleSheet } from 'react-native';

const colors = {
    primary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
    },
    success: {
        50: '#ECFDF5',
        500: '#10B981',
    },
    warning: {
        50: '#FFFBEB',
        500: '#F59E0B',
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

export const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
    },

    // Header
    headerContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#fff',
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },

    titleContainer: {
        marginBottom: 20,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: isDarkMode ? '#fff' : colors.gray[900],
        marginBottom: 4,
    },

    subtitle: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
    },

    // Estadísticas
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 8,
    },

    statCard: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? '#fff' : colors.gray[900],
        marginTop: 8,
    },

    statLabel: {
        fontSize: 11,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 2,
        textAlign: 'center',
    },

    statCardActive: {
        borderWidth: 2,
        borderColor: colors.primary[500],
        backgroundColor: isDarkMode ? colors.primary[700] + '30' : colors.primary[50],
    },

    // Search Bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        fontSize: 15,
        color: isDarkMode ? '#fff' : colors.gray[900],
    },

    // Filter Tabs
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
    },

    filterTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    filterTabActive: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[600],
    },

    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    filterTextActive: {
        color: '#fff',
    },

    // List
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },

    // Card de Instalación
    card: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#fff',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    cardId: {
        fontSize: 15,
        fontWeight: '700',
        color: isDarkMode ? '#fff' : colors.gray[900],
    },

    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },

    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },

    cardRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 10,
    },

    cardRowContent: {
        flex: 1,
    },

    cardLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 2,
    },

    cardValue: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[200] : colors.gray[900],
    },

    cardActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        gap: 6,
    },

    actionButtonPrimary: {
        backgroundColor: colors.primary[500],
    },

    actionButtonSecondary: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
    },

    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },

    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginTop: 16,
        marginBottom: 8,
    },

    emptyStateText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        lineHeight: 20,
    },

    emptyStateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[500],
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 24,
        gap: 8,
    },

    emptyStateButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },

    // Floating Action Button
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    // Chart Container
    chartContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#fff',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },

    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? '#fff' : colors.gray[900],
    },

    chartViewTabs: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },

    chartViewTab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    chartViewTabActive: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[600],
    },

    chartViewTabText: {
        fontSize: 12,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    chartViewTabTextActive: {
        color: '#fff',
    },

    // Period Indicator
    periodIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: isDarkMode ? colors.gray[700] + '60' : colors.primary[50],
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.primary[200],
    },

    periodText: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
    },

    chartNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    chartNavButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    chartTodayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: isDarkMode ? colors.primary[700] + '30' : colors.primary[50],
        borderWidth: 1,
        borderColor: colors.primary[500],
    },

    chartTodayText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary[500],
    },

    chartSummary: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    chartSummaryItem: {
        alignItems: 'center',
    },

    chartSummaryLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 4,
    },

    chartSummaryValue: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? '#fff' : colors.gray[900],
    },

    // Chart ScrollView
    chartScrollView: {
        marginHorizontal: -16,
    },

    chartScrollContent: {
        paddingHorizontal: 16,
    },

    scrollIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        backgroundColor: isDarkMode ? colors.gray[700] + '80' : colors.gray[100] + '80',
        borderRadius: 8,
        marginBottom: 8,
    },

    scrollIndicatorText: {
        fontSize: 11,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontStyle: 'italic',
    },
});
