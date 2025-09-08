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
        
        // Payment Info Card
        paymentInfoCard: {
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            marginVertical: 16,
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
        cardTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 16,
            letterSpacing: 0.3,
        },
        paymentDetail: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        paymentLabel: {
            fontSize: 16,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            fontWeight: '500',
        },
        paymentAmount: {
            fontSize: 24,
            fontWeight: '700',
            color: isDarkMode ? '#34C759' : '#34C759',
            letterSpacing: 0.5,
        },
        paymentDescription: {
            fontSize: 16,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontWeight: '600',
            textAlign: 'right',
            flex: 1,
            marginLeft: 12,
        },

        // Métodos de Pago
        metodosCard: {
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
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: isDarkMode ? '#2C2C2E' : 'transparent',
        },
        metodosContainer: {
            gap: 12,
        },
        metodoCard: {
            backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
            borderRadius: 12,
            padding: 16,
            borderWidth: 2,
            borderColor: 'transparent',
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: isDarkMode ? 0.2 : 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        metodoCardSelected: {
            borderColor: '#007AFF',
            backgroundColor: isDarkMode ? '#1C3A5F' : '#E3F2FD',
        },
        metodoHeader: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        metodoIconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        metodoInfo: {
            flex: 1,
        },
        metodoNombre: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginBottom: 4,
            letterSpacing: 0.2,
        },
        metodoTipo: {
            fontSize: 14,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            marginBottom: 2,
            fontWeight: '500',
        },
        metodoNumero: {
            fontSize: 14,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            fontFamily: 'monospace',
        },
        metodoSelector: {
            marginLeft: 12,
        },
        radioButton: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isDarkMode ? '#AEAEB2' : '#6D6D70',
            alignItems: 'center',
            justifyContent: 'center',
        },
        radioButtonSelected: {
            borderColor: '#007AFF',
        },
        radioButtonInner: {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#007AFF',
        },

        // Loading States
        loadingContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40,
        },
        loadingText: {
            fontSize: 16,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            marginTop: 12,
            fontWeight: '500',
        },

        // No Methods State
        noMetodosContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40,
        },
        noMetodosText: {
            fontSize: 18,
            color: isDarkMode ? '#8E8E93' : '#8E8E93',
            textAlign: 'center',
            marginTop: 16,
            marginBottom: 20,
            fontWeight: '500',
            letterSpacing: 0.2,
        },
        addMetodoButton: {
            backgroundColor: '#007AFF',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 20,
            shadowColor: '#007AFF',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
        },
        addMetodoButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 8,
            letterSpacing: 0.3,
        },

        // Process Button
        processButton: {
            backgroundColor: '#34C759',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            marginHorizontal: 0,
            marginBottom: 20,
            borderRadius: 12,
            shadowColor: '#34C759',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        },
        processButtonDisabled: {
            backgroundColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
            shadowOpacity: 0,
            elevation: 0,
        },
        processButtonText: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: '700',
            marginLeft: 12,
            letterSpacing: 0.5,
        },

        // Modal Styles
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
        modalContent: {
            width: '85%',
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            padding: 24,
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
        modalTitle: {
            fontSize: 22,
            fontWeight: '700',
            marginBottom: 20,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            textAlign: 'center',
            letterSpacing: 0.3,
        },

        // Confirmation Modal
        confirmDetails: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#2C2C2E' : '#E5E5EA',
        },
        confirmLabel: {
            fontSize: 16,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            fontWeight: '500',
        },
        confirmValue: {
            fontSize: 16,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontWeight: '600',
            textAlign: 'right',
            flex: 1,
            marginLeft: 12,
        },

        // Modal Buttons
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 24,
            gap: 12,
        },
        modalButton: {
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignItems: 'center',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
        },
        cancelButton: {
            backgroundColor: isDarkMode ? '#48484A' : '#E5E5EA',
            shadowColor: isDarkMode ? '#000' : '#8E8E93',
        },
        cancelButtonText: {
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 0.3,
        },
        confirmButton: {
            backgroundColor: '#34C759',
            shadowColor: '#34C759',
        },
        confirmButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 0.3,
        },

        // Result Modal
        resultHeader: {
            alignItems: 'center',
            marginBottom: 20,
        },
        resultTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            marginTop: 16,
            textAlign: 'center',
            letterSpacing: 0.5,
        },
        resultMessage: {
            fontSize: 16,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 22,
            letterSpacing: 0.2,
        },
        successDetails: {
            backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
        },
        successLabel: {
            fontSize: 14,
            color: isDarkMode ? '#AEAEB2' : '#6D6D70',
            fontWeight: '500',
            marginBottom: 4,
        },
        successValue: {
            fontSize: 16,
            color: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            fontWeight: '600',
            marginBottom: 12,
            letterSpacing: 0.2,
        },
        resultButton: {
            backgroundColor: '#007AFF',
            shadowColor: '#007AFF',
        },
        resultButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            letterSpacing: 0.3,
        },

        // Demo Indicator
        demoIndicator: {
            backgroundColor: '#FF9500',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '600',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
            marginTop: 4,
            alignSelf: 'flex-start',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },

        // Demo Message
        demoMessage: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#1C3A5F' : '#E3F2FD',
            padding: 12,
            borderRadius: 8,
            marginTop: 12,
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