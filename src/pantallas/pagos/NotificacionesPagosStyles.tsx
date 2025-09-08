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
        headerTitleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        title: {
            fontSize: 20,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            letterSpacing: 0.3,
        },
        badge: {
            backgroundColor: '#FF3B30',
            borderRadius: 12,
            minWidth: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
        },
        badgeText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '700',
        },
        disabledButton: {
            opacity: 0.5,
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

        // Filters
        filtersContainer: {
            flexDirection: 'row',
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 12,
            padding: 4,
            marginHorizontal: 16,
            marginVertical: 16,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        filterButton: {
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
        },
        filterButtonActive: {
            backgroundColor: '#007AFF',
        },
        filterButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
        },
        filterButtonTextActive: {
            color: '#FFFFFF',
        },

        // Content
        content: {
            flex: 1,
            paddingHorizontal: 16,
        },
        notificationsContainer: {
            paddingBottom: 20,
        },

        // Notification Cards
        notificationCard: {
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
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
        unreadNotification: {
            borderLeftWidth: 4,
            borderLeftColor: '#007AFF',
            backgroundColor: isDarkMode ? '#1C2A3A' : '#F0F8FF',
        },
        notificationContent: {
            flex: 1,
        },
        notificationHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        notificationIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        notificationInfo: {
            flex: 1,
        },
        notificationTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 4,
            letterSpacing: 0.2,
        },
        unreadTitle: {
            fontWeight: '700',
            color: '#007AFF',
        },
        notificationTime: {
            fontSize: 12,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            fontWeight: '500',
        },
        notificationMessage: {
            fontSize: 14,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            lineHeight: 20,
            letterSpacing: 0.1,
        },
        unreadIndicator: {
            marginLeft: 8,
        },
        unreadDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#007AFF',
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
        modalContent: {
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
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#2C2C2E' : '#E5E5EA',
        },
        modalIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        modalTitle: {
            flex: 1,
            fontSize: 18,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            letterSpacing: 0.3,
        },
        closeButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
            alignItems: 'center',
            justifyContent: 'center',
        },
        modalBody: {
            padding: 20,
            maxHeight: 400,
        },
        modalMessage: {
            fontSize: 16,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            lineHeight: 24,
            marginBottom: 20,
            letterSpacing: 0.2,
        },
        modalDetails: {
            marginBottom: 16,
        },
        modalDetailLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 4,
            letterSpacing: 0.2,
        },
        modalDetailValue: {
            fontSize: 14,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            lineHeight: 20,
            letterSpacing: 0.1,
        },
        modalButton: {
            backgroundColor: '#007AFF',
            marginHorizontal: 20,
            marginVertical: 20,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            shadowColor: '#007AFF',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
        },
        modalButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 0.3,
        },

        // Demo Message
        demoMessage: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#1C3A5F' : '#E3F2FD',
            padding: 12,
            borderRadius: 8,
            marginVertical: 12,
            borderWidth: 1,
            borderColor: '#007AFF',
        },
        demoMessageText: {
            flex: 1,
            fontSize: 14,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginLeft: 8,
            lineHeight: 18,
            letterSpacing: 0.1,
        },
    });