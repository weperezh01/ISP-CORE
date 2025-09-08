import { StyleSheet } from 'react-native';

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#333333' : '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#333333',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: isDarkMode ? '#cccccc' : '#666666',
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultItem: {
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#3a3a3a' : '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
  },
  resultNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  resultLabel: {
    fontSize: 12,
    color: isDarkMode ? '#aaaaaa' : '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default getStyles;