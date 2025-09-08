import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#0F0F0F' : '#F8F9FA',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingTop: 40,
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#2C2C2E' : '#E5E5EA',
        },
        title: {
            fontSize: 18,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            letterSpacing: 0.3,
        },
        
        // Loading State
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#0F0F0F' : '#F8F9FA',
        },
        loadingText: {
            fontSize: 16,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            marginTop: 12,
            fontWeight: '500',
        },

        // Stats Container
        statsContainer: {
            flexDirection: 'row',
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#2C2C2E' : '#E5E5EA',
        },
        statCard: {
            flex: 1,
            alignItems: 'center',
        },
        statNumber: {
            fontSize: 20,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 4,
        },
        statLabel: {
            fontSize: 12,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            fontWeight: '500',
        },
        filterButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            marginLeft: 16,
        },
        filterButtonText: {
            color: '#007AFF',
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 4,
        },

        // Content
        content: {
            flex: 1,
            paddingHorizontal: 16,
        },
        transactionsContainer: {
            paddingBottom: 20,
        },

        // Transaction Cards
        transactionCard: {
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginTop: 12,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: isDarkMode ? '#2C2C2E' : 'transparent',
        },
        transactionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        transactionIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        transactionInfo: {
            flex: 1,
        },
        transactionDescription: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 4,
            letterSpacing: 0.2,
        },
        transactionDate: {
            fontSize: 14,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            fontWeight: '500',
        },
        transactionAmount: {
            alignItems: 'flex-end',
        },
        transactionAmountText: {
            fontSize: 18,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 4,
            letterSpacing: 0.3,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            minWidth: 80,
            alignItems: 'center',
        },
        statusText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
        },
        transactionFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#2C2C2E' : '#E5E5EA',
        },
        transactionGateway: {
            fontSize: 14,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            fontWeight: '600',
        },
        transactionId: {
            fontSize: 12,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            fontFamily: 'monospace',
        },

        // Loading More
        loadingMoreContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 20,
        },
        loadingMoreText: {
            fontSize: 14,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            marginLeft: 8,
            fontWeight: '500',
        },
        endText: {
            fontSize: 14,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            textAlign: 'center',
            paddingVertical: 20,
            fontWeight: '500',
        },

        // Empty State
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 80,
        },
        emptyText: {
            fontSize: 20,
            fontWeight: '600',
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            textAlign: 'center',
            marginTop: 20,
            marginBottom: 8,
            letterSpacing: 0.3,
        },
        emptySubtext: {
            fontSize: 16,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            textAlign: 'center',
            lineHeight: 22,
            paddingHorizontal: 40,
        },

        // Modal Styles
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        
        // Filters Modal
        filtersModal: {
            width: '90%',
            maxHeight: '80%',
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 10,
            },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
        },
        filtersHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#2C2C2E' : '#E5E5EA',
        },
        filtersTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            letterSpacing: 0.3,
        },
        filtersContent: {
            padding: 20,
            maxHeight: 400,
        },
        filterGroup: {
            marginBottom: 24,
        },
        filterLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 12,
            letterSpacing: 0.2,
        },
        filterOptions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        filterOption: {
            backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'transparent',
        },
        filterOptionActive: {
            backgroundColor: '#007AFF',
            borderColor: '#007AFF',
        },
        filterOptionText: {
            fontSize: 14,
            fontWeight: '600',
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
        },
        filterOptionTextActive: {
            color: '#FFFFFF',
        },
        dateInputs: {
            gap: 8,
        },
        dateInput: {
            backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
            padding: 12,
            borderRadius: 8,
            fontSize: 14,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            borderWidth: 1,
            borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
        },
        filtersActions: {
            flexDirection: 'row',
            gap: 12,
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#2C2C2E' : '#E5E5EA',
        },
        clearButton: {
            flex: 1,
            backgroundColor: isDarkMode ? '#48484A' : '#E5E5EA',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
        },
        clearButtonText: {
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontSize: 16,
            fontWeight: '600',
        },
        applyButton: {
            flex: 1,
            backgroundColor: '#007AFF',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
        },
        applyButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },

        // Detail Modal
        detailModal: {
            width: '90%',
            maxHeight: '80%',
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 10,
            },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
        },
        detailHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#2C2C2E' : '#E5E5EA',
        },
        detailTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            letterSpacing: 0.3,
        },
        detailContent: {
            padding: 20,
            maxHeight: 400,
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#2C2C2E' : '#E5E5EA',
        },
        detailLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            flex: 1,
        },
        detailValue: {
            fontSize: 14,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontWeight: '500',
            textAlign: 'right',
            flex: 1,
            marginLeft: 12,
        },

        // Additional styles for simple version
        transactionUser: {
            fontSize: 12,
            color: isDarkMode ? '#007AFF' : '#007AFF',
            fontWeight: '500',
            marginTop: 2,
        },
        demoMessage: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#1C3A5F' : '#E3F2FD',
            padding: 16,
            borderRadius: 12,
            marginTop: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#007AFF',
        },
        demoMessageText: {
            flex: 1,
            fontSize: 14,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginLeft: 8,
            lineHeight: 20,
            letterSpacing: 0.1,
        },
    });