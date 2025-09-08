import { StyleSheet } from 'react-native';

export const getAddClientStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 12,
      backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDarkMode ? '#374151' : '#e5e7eb',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: isDarkMode ? '#f9fafb' : '#111827',
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      color: isDarkMode ? '#9ca3af' : '#4b5563',
    },
    card: {
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      marginHorizontal: 12,
      marginVertical: 10,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      shadowColor: '#000',
      shadowOpacity: isDarkMode ? 0.3 : 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDarkMode ? '#e5e7eb' : '#111827',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    inputHalf: {
      flex: 1,
    },
    saveButton: {
      marginTop: 12,
      marginHorizontal: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? '#2563eb' : '#3b82f6',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
  });

export default getAddClientStyles;

