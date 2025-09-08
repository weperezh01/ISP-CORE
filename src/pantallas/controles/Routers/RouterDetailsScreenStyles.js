import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
  },
  
  // Header Styles
  headerContainer: {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB',
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerTitleContainer: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: isDarkMode ? '#F9FAFB' : '#111827',
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#10B981',
  },
  
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Content Styles
  contentContainer: {
    flex: 1,
  },
  
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  loadingText: {
    fontSize: 16,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: isDarkMode ? '#F9FAFB' : '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  emptyMessage: {
    fontSize: 16,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  
  retryButton: {
    backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Section Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDarkMode ? '#F9FAFB' : '#111827',
  },
  
  sectionCount: {
    fontSize: 14,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
    backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  // Card Styles
  cardContainer: {
    marginVertical: 8,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  
  cardInfo: {
    flex: 1,
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDarkMode ? '#F9FAFB' : '#111827',
    marginBottom: 4,
  },
  
  cardSubtitle: {
    fontSize: 14,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
  },
  
  cardBody: {
    marginTop: 12,
  },
  
  cardDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  cardDetailLabel: {
    fontSize: 14,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
  },
  
  cardDetailValue: {
    fontSize: 14,
    color: isDarkMode ? '#F3F4F6' : '#1F2937',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  
  // List Styles
  horizontalList: {
    paddingHorizontal: 8,
  },
  
  // Add Button Styles
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
    backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
    borderWidth: 2,
    borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    paddingHorizontal: 20,
  },
  
  addButtonText: {
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Badge Styles
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  ipTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  ipTypeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Spacer
  spacer: {
    height: 32,
  },

  // SystemResources styles
  systemResourcesCard: {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#E5E7EB',
  },

  systemResourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  systemResourcesIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  systemResourcesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDarkMode ? '#F9FAFB' : '#111827',
    flex: 1,
  },

  updatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  updatingText: {
    fontSize: 12,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    marginLeft: 6,
  },

  resourceSection: {
    marginBottom: 16,
  },

  resourceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? '#F9FAFB' : '#111827',
    marginBottom: 12,
  },

  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  resourceItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: isDarkMode ? '#111827' : '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

  resourceLabel: {
    fontSize: 12,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },

  resourceValue: {
    fontSize: 14,
    color: isDarkMode ? '#F9FAFB' : '#111827',
    fontWeight: '600',
  },

  resourceProgress: {
    marginTop: 8,
  },

  progressBar: {
    height: 6,
    backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  metricCard: {
    backgroundColor: isDarkMode ? '#111827' : '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  metricHeader: {
    marginBottom: 8,
  },

  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDarkMode ? '#F9FAFB' : '#111827',
  },

  metricSubtext: {
    fontSize: 11,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    lineHeight: 16,
  },

  // RouterInfoCard styles
  routerInfoCard: {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#E5E7EB',
  },

  routerInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  routerIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  routerMainInfo: {
    flex: 1,
  },

  routerName: {
    fontSize: 20,
    fontWeight: '700',
    color: isDarkMode ? '#F9FAFB' : '#111827',
    marginBottom: 4,
  },

  routerId: {
    fontSize: 14,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
  },

  routerStatusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  routerDetailsGrid: {
    gap: 8,
  },

  routerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#374151' : '#F3F4F6',
  },

  routerDetailLabel: {
    fontSize: 14,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
  },

  routerDetailValue: {
    fontSize: 14,
    color: isDarkMode ? '#F9FAFB' : '#111827',
    fontWeight: '600',
  },

  // Traffic styles for InterfaceItem
  trafficSection: {
    marginTop: 8,
  },

  trafficHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trafficTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: isDarkMode ? '#D1D5DB' : '#374151',
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },

  liveText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },

  trafficStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  trafficItem: {
    flex: 1,
  },

  trafficRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trafficLabel: {
    fontSize: 11,
    color: isDarkMode ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
  },

  trafficValue: {
    fontSize: 12,
    fontWeight: '600',
  },

  // VLAN styles
  vlanIdBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  vlanIdText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});