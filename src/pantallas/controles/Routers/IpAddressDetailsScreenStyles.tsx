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
        backgroundColor: isDarkMode ? colors.gray[800] : colors.success[600],
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
        color: isDarkMode ? colors.gray[300] : colors.success[100],
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
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    // IP Details Card
    ipDetailsCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderLeftWidth: 4,
        borderLeftColor: colors.success[500],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 6,
    },

    ipDetailsHeader: {
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

    ipStatusIndicator: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: colors.success[100],
        borderWidth: 1,
        borderColor: colors.success[200],
    },

    ipStatusText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.success[700],
    },

    ipDetailsGrid: {
        marginTop: 8,
    },

    // Collapse functionality
    collapseButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    collapseIcon: {
        fontSize: 18,
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontWeight: '600',
    },

    collapsedCard: {
        padding: 16,
        minHeight: 'auto',
    },

    collapsedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    collapsedInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    collapsedAddress: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginLeft: 12,
    },

    ipDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[100],
    },

    ipDetailLabel: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
        flex: 1,
    },

    ipDetailValue: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },

    // Search section
    searchContainer: {
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

    // Section headers
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
        paddingHorizontal: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        letterSpacing: -0.2,
    },

    sectionCount: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },

    // IP List Cards
    ipListContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    ipCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 6,
        elevation: 4,
    },

    ipCardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.8,
    },

    ipCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    ipCardIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 24,
        textAlign: 'center',
    },

    ipCardInfo: {
        flex: 1,
    },

    ipCardAddress: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 2,
    },

    ipCardSubtitle: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        opacity: 0.8,
    },

    ipCardStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 80,
        alignItems: 'center',
    },

    ipCardStatusText: {
        fontSize: 10,
        fontWeight: '600',
    },

    ipCardContent: {
        gap: 8,
    },

    ipCardDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    ipCardDetailLabel: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontWeight: '500',
        flex: 1,
    },

    ipCardDetailValue: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },

    // Status styles for IP cards
    availableCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.success[500],
    },

    assignedCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.primary[500],
    },

    // Status indicators
    statusAvailable: {
        backgroundColor: colors.success[50],
        borderColor: colors.success[200],
    },

    statusTextAvailable: {
        color: colors.success[700],
    },

    statusAssigned: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[200],
    },

    statusTextAssigned: {
        color: colors.primary[700],
    },

    statusInactive: {
        backgroundColor: colors.error[50],
        borderColor: colors.error[200],
    },

    statusTextInactive: {
        color: colors.error[700],
    },

    // Client info
    clientInfo: {
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

    // Available text special styling
    availableText: {
        color: colors.success[600],
        fontWeight: '600',
        fontSize: 13,
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

    // Network visualization
    networkVisualization: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    networkTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        marginBottom: 12,
        textAlign: 'center',
    },

    networkStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    statItem: {
        alignItems: 'center',
        flex: 1,
    },

    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    statLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
    },

    // Development button styles
    devButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#F59E0B',
    },

    devButtonText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },

    // Mock data indicator styles
    mockDataIndicator: {
        backgroundColor: isDarkMode ? '#374151' : '#FEF3C7',
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? '#4B5563' : '#F59E0B',
    },

    mockDataText: {
        color: isDarkMode ? '#F59E0B' : '#92400E',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },

    // Utility styles
    spacer: {
        height: 20,
    },

    divider: {
        height: 1,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        marginVertical: 16,
        marginHorizontal: 16,
    },
});