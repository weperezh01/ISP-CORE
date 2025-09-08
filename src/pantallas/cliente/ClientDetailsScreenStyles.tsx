import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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

export const getStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    scrollContent: {
      paddingTop: 16,
      paddingBottom: 20,
    },

    // Header styles
    headerContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      paddingTop: 16,
      backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[600],
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.15,
      shadowRadius: 8,
      elevation: 8,
      justifyContent: 'center',
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
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      letterSpacing: -0.3,
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

    // Client info section
    clientInfoContainer: {
      backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
      borderRadius: 20,
      marginHorizontal: 16,
      marginTop: -40,
      marginBottom: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
      shadowColor: isDarkMode ? '#000000' : colors.gray[900],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDarkMode ? 0.3 : 0.15,
      shadowRadius: 16,
      elevation: 12,
    },

    clientHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },

    clientAvatar: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: colors.primary[600],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: colors.primary[600],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },

    clientAvatarText: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    clientHeaderInfo: {
      flex: 1,
    },

    clientName: {
      fontSize: 24,
      fontWeight: '700',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
      marginBottom: 4,
      letterSpacing: -0.5,
    },

    clientId: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
      marginBottom: 8,
    },

    clientStatus: {
      fontSize: 14,
      fontWeight: '600',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      overflow: 'hidden',
      alignSelf: 'flex-start',
    },

    clientStatusActive: {
      backgroundColor: colors.success[100],
      color: colors.success[700],
    },

    clientStatusInactive: {
      backgroundColor: colors.error[100],
      color: colors.error[700],
    },

    // Details section
    detailsSection: {
      marginTop: 20,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
      marginBottom: 16,
    },

    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[100],
    },

    detailIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },

    detailContent: {
      flex: 1,
    },

    detailLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
      marginBottom: 2,
    },

    detailValue: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    detailValueLink: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary[600],
    },

    detailValueDate: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    // Action buttons
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 24,
    },

    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },

    editButton: {
      backgroundColor: colors.warning[500],
    },

    addServiceButton: {
      backgroundColor: colors.success[500],
    },

    actionButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      marginLeft: 8,
    },

    // Connection cards
    connectionsContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },

    connectionsSectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
      marginBottom: 16,
      paddingHorizontal: 4,
    },

    connectionCard: {
      backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
      borderRadius: 16,
      marginBottom: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
      shadowColor: isDarkMode ? '#000000' : colors.gray[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.08,
      shadowRadius: 12,
      elevation: 6,
    },

    connectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    connectionHeaderLeft: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginRight: 12,
    },

    expandButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
      justifyContent: 'center',
      alignItems: 'center',
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

    connectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    connectionStatus: {
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      overflow: 'hidden',
    },

    connectionStatusActive: {
      backgroundColor: colors.success[100],
      color: colors.success[700],
    },

    connectionStatusInactive: {
      backgroundColor: colors.error[100],
      color: colors.error[700],
    },

    connectionDetails: {
      marginBottom: 16,
    },

    connectionDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },

    connectionDetailLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
    },

    connectionDetailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    connectionDetailAddress: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    connectionDetailPrice: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.success[600],
    },

    connectionDetailDate: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    // Connection card buttons
    connectionButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },

    connectionButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    connectionEditButton: {
      backgroundColor: colors.warning[500],
    },

    connectionDeleteButton: {
      backgroundColor: colors.error[500],
    },

    connectionButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // Bottom buttons
    bottomButtonsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 20,
      paddingBottom: 40,
      backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },

    bottomButton: {
      flex: 1,
      backgroundColor: colors.primary[600],
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 8,
      shadowColor: colors.primary[600],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },

    bottomButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // Actions card (nueva tarjeta para facturas y recibos)
    actionsCard: {
      backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
      borderRadius: 16,
      margin: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
      shadowColor: isDarkMode ? '#000000' : colors.gray[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },

    actionsButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      gap: 12,
    },

    newActionButton: {
      flex: 1,
      backgroundColor: colors.primary[600],
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
      shadowColor: colors.primary[600],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },

    actionButtonContent: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },

    actionButtonIcon: {
      fontSize: 32,
      marginBottom: 8,
    },

    newActionButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 4,
    },

    actionButtonSubtext: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      fontWeight: '500',
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
      backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    loadingText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[300] : colors.gray[700],
      marginTop: 16,
    },

    // List container
    listContainer: {
      backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
      paddingBottom: 20,
    },
  });