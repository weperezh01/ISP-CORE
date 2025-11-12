import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Modern color palette - consistent with other improved screens
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

export const getFabStyles = (isDarkMode) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 100,
      backgroundColor: colors.primary[600],
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary[600],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 12,
    },
    fabText: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '700',
    },
  });

export const getStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },
    
    // Modern Header
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

    filterButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    // Content area
    contentContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 120,
    },

    // Search section
    searchContainer: {
      backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 12,
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
    // Client Cards
    clientCard: {
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

    clientHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },

    clientHeaderLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    expandButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
      shadowColor: isDarkMode ? '#000000' : colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 3,
      elevation: 3,
    },

    expandButtonActive: {
      backgroundColor: colors.primary[600],
      borderColor: colors.primary[500],
      shadowColor: colors.primary[600],
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },

    compactInfo: {
      backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },

    clientIconContainer: {
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

    clientHeaderContent: {
      flex: 1,
    },

    clientName: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
      marginBottom: 4,
      letterSpacing: -0.3,
    },

    clientId: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
    },

    clientDetails: {
      marginTop: 12,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[100],
    },

    detailRowFull: {
      flexDirection: 'column',
      alignItems: 'flex-start',
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

    detailSubList: {
      marginTop: 6,
      width: '100%',
    },

    detailSubItem: {
      paddingLeft: 12,
      borderLeftWidth: 2,
      borderLeftColor: isDarkMode ? colors.gray[700] : colors.gray[200],
      marginBottom: 6,
    },

    detailSubLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    detailSubValue: {
      fontSize: 13,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[100] : colors.gray[800],
      marginTop: 2,
      textAlign: 'left',
    },

    detailValueFull: {
      width: '100%',
      textAlign: 'left',
      marginTop: 4,
    },

    detailPhone: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary[600],
      textAlign: 'right',
    },

    detailEmail: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary[600],
      textAlign: 'right',
    },

    detailDate: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[300] : colors.gray[700],
      textAlign: 'right',
    },

    detailDateImportant: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary[600],
      textAlign: 'right',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      backgroundColor: isDarkMode ? colors.primary[900] : colors.primary[50],
    },

    detailBalance: {
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'right',
    },

    detailBalanceAlDia: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
      backgroundColor: '#10B981',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      textAlign: 'center',
      overflow: 'hidden',
      minWidth: 70,
    },

    detailBalancePendiente: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
      backgroundColor: '#EF4444',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      textAlign: 'center',
      overflow: 'hidden',
      minWidth: 70,
    },

    detailBalanceSinDatos: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
      backgroundColor: '#94A3B8',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      textAlign: 'center',
      overflow: 'hidden',
      minWidth: 70,
    },

    // Connection status styles
    connectionsSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    connectionsSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
      marginBottom: 12,
    },

    connectionCard: {
      backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
      minHeight: 180,
    },

    connectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },

    connectionId: {
      fontSize: 14,
      fontWeight: '700',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    connectionStatus: {
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      overflow: 'hidden',
    },

    connectionDetails: {
      gap: 4,
    },

    connectionText: {
      fontSize: 14,
      color: isDarkMode ? colors.gray[300] : colors.gray[700],
      fontWeight: '500',
      marginBottom: 4,
    },

    connectionIp: {
      fontSize: 13,
      color: colors.primary[600],
      fontWeight: '600',
      marginBottom: 3,
    },

    connectionPlan: {
      fontSize: 13,
      color: isDarkMode ? colors.gray[300] : colors.gray[700],
      fontWeight: '500',
      marginBottom: 3,
    },

    connectionSpeed: {
      fontSize: 13,
      color: colors.success[600],
      fontWeight: '600',
      marginBottom: 3,
    },

    connectionRouter: {
      fontSize: 13,
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
      fontWeight: '500',
      marginBottom: 3,
    },

    connectionDate: {
      fontSize: 12,
      color: isDarkMode ? colors.gray[400] : colors.gray[500],
      fontWeight: '400',
      fontStyle: 'italic',
    },

    connectionDateImportant: {
      fontSize: 13,
      color: colors.primary[600],
      fontWeight: '700',
      backgroundColor: isDarkMode ? colors.primary[900] : colors.primary[50],
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 3,
      overflow: 'hidden',
    },

    connectionPrice: {
      fontSize: 13,
      color: colors.success[700],
      fontWeight: '700',
      marginBottom: 3,
    },

    connectionVlan: {
      fontSize: 12,
      color: colors.warning[600],
      fontWeight: '600',
      marginBottom: 3,
    },

    connectionPort: {
      fontSize: 12,
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
      fontWeight: '500',
      marginBottom: 3,
    },

    connectionMac: {
      fontSize: 11,
      color: isDarkMode ? colors.gray[500] : colors.gray[500],
      fontWeight: '400',
      fontFamily: 'monospace',
      marginBottom: 3,
    },

    connectionTech: {
      fontSize: 12,
      color: colors.primary[500],
      fontWeight: '500',
      marginBottom: 3,
    },

    connectionActivity: {
      fontSize: 11,
      color: colors.warning[600],
      fontWeight: '500',
      fontStyle: 'italic',
      marginBottom: 3,
    },

    connectionNotes: {
      fontSize: 12,
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
      fontWeight: '400',
      fontStyle: 'italic',
      marginTop: 4,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? colors.gray[600] : colors.gray[300],
    },

    noConnectionText: {
      fontSize: 14,
      color: isDarkMode ? colors.gray[400] : colors.gray[500],
      fontStyle: 'italic',
      textAlign: 'center',
      paddingVertical: 16,
    },

    // Filter chips
    filterSummaryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
      paddingHorizontal: 0,
    },

    filterChip: {
      backgroundColor: colors.primary[100],
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.primary[200],
    },

    filterChipText: {
      color: colors.primary[700],
      fontSize: 12,
      fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    modalContainer: {
      width: width * 0.9,
      maxHeight: '80%',
      backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
    },

    modalHeader: {
      alignItems: 'center',
      marginBottom: 24,
    },

    modalIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: colors.primary[600],
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },

    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
      textAlign: 'center',
      marginBottom: 8,
    },

    modalText: {
      fontSize: 16,
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
      textAlign: 'center',
      lineHeight: 24,
    },

    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginVertical: 4,
      backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
      borderWidth: 1,
      borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    filterOptionSelected: {
      backgroundColor: colors.primary[100],
      borderColor: colors.primary[300],
    },

    filterOptionText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
      marginLeft: 12,
    },

    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: isDarkMode ? colors.gray[400] : colors.gray[400],
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },

    checkboxSelected: {
      backgroundColor: colors.primary[600],
      borderColor: colors.primary[600],
    },

    checkboxCheck: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    modalButton: {
      backgroundColor: colors.primary[600],
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      marginTop: 24,
      shadowColor: colors.primary[600],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },

    modalButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
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

    // Simplified connections display
    connectionsSimple: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    connectionsCount: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    connectionsStatus: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.success[600],
    },

    moreConnections: {
      fontSize: 12,
      fontStyle: 'italic',
      color: isDarkMode ? colors.gray[400] : colors.gray[500],
      textAlign: 'center',
      marginTop: 8,
    },

    // Client Summary
    clientSummary: {
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 2,
      borderTopColor: isDarkMode ? colors.gray[600] : colors.gray[300],
      backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[50],
      borderRadius: 8,
      padding: 12,
    },

    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },

    summaryLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    summaryValue: {
      fontSize: 13,
      fontWeight: '700',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    summaryActive: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.success[600],
    },

    summaryBalance: {
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
      minWidth: 80,
    },

    summaryBalanceAlDia: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
      backgroundColor: '#10B981',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      textAlign: 'center',
      overflow: 'hidden',
      minWidth: 80,
    },

    summaryBalancePendiente: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
      backgroundColor: '#EF4444',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      textAlign: 'center',
      overflow: 'hidden',
      minWidth: 80,
    },

    summaryAntiguedad: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.warning[600],
      backgroundColor: isDarkMode ? colors.warning[900] : colors.warning[50],
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },

    // Load more button
    loadMoreButton: {
      backgroundColor: colors.primary[600],
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      marginVertical: 20,
      marginHorizontal: 16,
      alignItems: 'center',
      shadowColor: colors.primary[600],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },

    loadMoreText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },

    endOfListText: {
      fontSize: 14,
      color: isDarkMode ? colors.gray[400] : colors.gray[500],
      textAlign: 'center',
      paddingVertical: 20,
      fontStyle: 'italic',
    },

    // Debug styles (development only)
    debugSection: {
      backgroundColor: isDarkMode ? colors.error[900] : colors.error[50],
      borderRadius: 6,
      padding: 8,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.error[300],
    },

    debugTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.error[600],
      marginBottom: 4,
    },

    debugText: {
      fontSize: 10,
      color: colors.error[500],
      fontFamily: 'monospace',
    },
  });
