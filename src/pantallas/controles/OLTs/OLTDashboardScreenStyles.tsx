import { StyleSheet } from 'react-native';

const colors = {
  primary: {
    500: '#3B82F6',
    600: '#2563EB',
  },
  success: {
    50: '#F0FDF4',
    500: '#10B981',
    600: '#059669',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
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
  blue: {
    50: '#EFF6FF',
    500: '#3B82F6',
  },
};

export const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    // ==================== Header ====================
    headerContainer: {
      backgroundColor: colors.success[500],
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 16,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    backButton: {
      padding: 8,
      marginRight: 12,
    },

    headerTitleContainer: {
      flex: 1,
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },

    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 2,
    },

    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    refreshButton: {
      padding: 8,
    },

    // ==================== Content ====================
    contentContainer: {
      flex: 1,
    },

    scrollContent: {
      padding: 16,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },

    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: isDarkMode ? colors.gray[300] : colors.gray[600],
    },

    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },

    errorTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
      marginTop: 16,
    },

    errorMessage: {
      fontSize: 14,
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
      marginTop: 8,
      textAlign: 'center',
    },

    retryButton: {
      marginTop: 24,
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: colors.success[500],
      borderRadius: 8,
    },

    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },

    // ==================== Cards ====================
    card: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },

    cardWaiting: {
      backgroundColor: isDarkMode ? colors.blue[500] + '20' : colors.blue[50],
      borderWidth: 2,
      borderColor: colors.primary[500],
    },

    cardOnline: {
      backgroundColor: isDarkMode ? colors.success[500] + '20' : colors.success[50],
      borderWidth: 2,
      borderColor: colors.success[500],
    },

    cardOffline: {
      backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
      borderWidth: 2,
      borderColor: colors.gray[500],
    },

    cardLowSignal: {
      backgroundColor: isDarkMode ? colors.warning[500] + '20' : colors.warning[50],
      borderWidth: 2,
      borderColor: colors.warning[500],
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },

    cardHeaderText: {
      marginLeft: 16,
      flex: 1,
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? colors.gray[100] : colors.gray[700],
      marginBottom: 4,
    },

    cardCount: {
      fontSize: 36,
      fontWeight: 'bold',
    },

    cardBreakdown: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? colors.gray[600] : colors.gray[200],
      paddingTop: 12,
    },

    breakdownItem: {
      alignItems: 'center',
    },

    breakdownLabel: {
      fontSize: 12,
      color: isDarkMode ? colors.gray[400] : colors.gray[600],
      marginBottom: 4,
    },

    breakdownValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    cardFooter: {
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? colors.gray[600] : colors.gray[200],
      paddingTop: 12,
    },

    cardFooterText: {
      fontSize: 14,
      color: isDarkMode ? colors.gray[300] : colors.gray[600],
      textAlign: 'center',
    },

    // ==================== Actions Section ====================
    actionsSection: {
      marginTop: 8,
      marginBottom: 24,
    },

    actionsSectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
      marginBottom: 12,
    },

    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    actionButtonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: isDarkMode ? colors.gray[100] : colors.gray[900],
      marginLeft: 12,
    },
  });
