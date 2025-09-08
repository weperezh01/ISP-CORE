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
            fontSize: 20,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            letterSpacing: 0.3,
        },
        content: {
            flex: 1,
            paddingHorizontal: 16,
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

        // Period Selector
        periodSelector: {
            flexDirection: 'row',
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 12,
            padding: 4,
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
        periodButton: {
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
        },
        periodButtonActive: {
            backgroundColor: '#007AFF',
        },
        periodButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
        },
        periodButtonTextActive: {
            color: '#FFFFFF',
        },

        // Metrics Cards
        metricsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        metricCard: {
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            width: '48%',
            marginBottom: 12,
            borderLeftWidth: 4,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        metricHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        metricTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            marginLeft: 8,
            letterSpacing: 0.2,
        },
        metricValue: {
            fontSize: 24,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 4,
            letterSpacing: 0.5,
        },
        metricSubtitle: {
            fontSize: 12,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            fontWeight: '500',
        },

        // Chart Cards
        chartCard: {
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        chartTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 16,
            letterSpacing: 0.3,
        },
        chart: {
            borderRadius: 16,
        },

        // No Data State
        noDataContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40,
        },
        noDataText: {
            fontSize: 16,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            marginTop: 12,
            textAlign: 'center',
            fontWeight: '500',
        },

        // Top Usuarios
        topUsuariosContainer: {
            gap: 12,
        },
        topUsuarioItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
            borderRadius: 12,
            padding: 12,
        },
        topUsuarioRank: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#007AFF',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        topUsuarioRankText: {
            fontSize: 14,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        topUsuarioInfo: {
            flex: 1,
        },
        topUsuarioName: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 2,
            letterSpacing: 0.2,
        },
        topUsuarioDetail: {
            fontSize: 14,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            fontWeight: '500',
        },
        topUsuarioAmount: {
            alignItems: 'flex-end',
        },
        topUsuarioAmountText: {
            fontSize: 16,
            fontWeight: '700',
            color: '#34C759',
            letterSpacing: 0.3,
        },

        // Action Buttons
        actionButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
            gap: 12,
        },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
        },
        reportButton: {
            backgroundColor: '#FF9500',
            shadowColor: '#FF9500',
        },
        historyButton: {
            backgroundColor: '#AF52DE',
            shadowColor: '#AF52DE',
        },
        actionButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 8,
            letterSpacing: 0.3,
        },

        // Demo Message Styles
        demoMessage: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#1C3A5F' : '#E3F2FD',
            padding: 16,
            borderRadius: 12,
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

        // Simple Chart Styles
        simpleChartContainer: {
            padding: 16,
        },
        simpleChartHeader: {
            marginBottom: 16,
        },
        simpleChartTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            letterSpacing: 0.2,
        },
        simpleChart: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: 120,
            paddingHorizontal: 8,
        },
        chartBar: {
            alignItems: 'center',
            flex: 1,
            marginHorizontal: 2,
        },
        chartBarFill: {
            width: '80%',
            minHeight: 4,
            borderRadius: 2,
            marginBottom: 4,
        },
        chartBarLabel: {
            fontSize: 12,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            marginBottom: 2,
            fontWeight: '500',
        },
        chartBarValue: {
            fontSize: 10,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            fontWeight: '500',
        },

        // Gateway Summary Styles
        gatewaySummaryContainer: {
            padding: 16,
        },
        gatewaySummaryTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 16,
            letterSpacing: 0.2,
        },
        gatewayItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            paddingVertical: 8,
        },
        gatewayColor: {
            width: 12,
            height: 12,
            borderRadius: 6,
            marginRight: 12,
        },
        gatewayName: {
            fontSize: 16,
            fontWeight: '500',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            flex: 1,
        },
        gatewayAmount: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#34C759' : '#34C759',
        },
    });