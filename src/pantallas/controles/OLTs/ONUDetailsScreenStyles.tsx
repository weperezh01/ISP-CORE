import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Modern color palette - ONU theme (green for fiber optics)
const colors = {
    primary: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        900: '#064E3B'
    },
    secondary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8'
    },
    success: {
        50: '#ECFDF5',
        500: '#10B981',
        600: '#059669'
    },
    warning: {
        50: '#FFFBEB',
        500: '#F59E0B',
        600: '#D97706'
    },
    error: {
        50: '#FEF2F2',
        500: '#EF4444',
        600: '#DC2626'
    },
    purple: {
        500: '#8B5CF6',
        600: '#7C3AED'
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

export const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    // Header styles
    headerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 40,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[600], // Green theme for ONUs
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 4,
        elevation: 4,
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    headerTitleContainer: {
        flex: 1,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },

    headerSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[300] : colors.primary[100],
        opacity: 0.8,
        marginTop: 2,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Content area
    contentContainer: {
        flex: 1,
    },

    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },

    loadingText: {
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginTop: 16,
        textAlign: 'center',
    },

    // Error state
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 60,
    },

    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },

    errorMessage: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        marginBottom: 24,
    },

    retryButton: {
        backgroundColor: colors.primary[500],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },

    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    // Status Card
    statusCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },

    statusInfo: {
        flex: 1,
    },

    statusLabel: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 4,
    },

    statusValue: {
        fontSize: 24,
        fontWeight: '700',
    },

    // Cards
    card: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },

    cardContent: {
        gap: 12,
    },

    // Info Rows
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },

    infoLabel: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        flex: 1,
    },

    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        flex: 1,
        textAlign: 'right',
    },

    // Signal Grid
    signalGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },

    signalBox: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    signalLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },

    signalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        marginBottom: 8,
    },

    signalIndicator: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },

    signalIndicatorText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Traffic Grid
    trafficGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },

    trafficBox: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    trafficLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },

    trafficValue: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },

    // Advanced metrics grid
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },

    metricBox: {
        flex: 1,
        minWidth: (width - 64) / 2,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    metricLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 8,
    },

    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        marginTop: 4,
    },

    // Status badges
    statusOnline: {
        backgroundColor: colors.success[50],
        borderColor: colors.success[500],
    },

    statusOffline: {
        backgroundColor: colors.error[50],
        borderColor: colors.error[500],
    },

    statusPending: {
        backgroundColor: colors.warning[50],
        borderColor: colors.warning[500],
    },

    statusUnknown: {
        backgroundColor: colors.gray[50],
        borderColor: colors.gray[300],
    },

    // Last update
    lastUpdateContainer: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        alignItems: 'center',
    },

    lastUpdateText: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontStyle: 'italic',
    },

    cacheIndicator: {
        fontSize: 11,
        color: isDarkMode ? colors.warning[400] : colors.warning[600],
        fontStyle: 'italic',
        marginTop: 4,
    },

    realtimeIndicator: {
        fontSize: 11,
        color: isDarkMode ? colors.success[400] : colors.success[600],
        fontWeight: '600',
        marginTop: 4,
    },

    footerMeta: {
        marginTop: 6,
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
    },

    // Payment status badge
    paymentStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },

    paymentStatusBadgePaid: {
        backgroundColor: colors.success[50],
        borderColor: colors.success[500],
    },

    paymentStatusBadgeLate: {
        backgroundColor: colors.warning[50],
        borderColor: colors.warning[500],
    },

    paymentStatusBadgeSuspended: {
        backgroundColor: colors.error[50],
        borderColor: colors.error[500],
    },

    paymentStatusBadgeUnknown: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        borderColor: isDarkMode ? colors.gray[500] : colors.gray[300],
    },

    paymentStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },

    // Authorization Button
    authorizeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success[500],
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 16,
        gap: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    authorizeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Deauthorization Button
    deauthorizeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error[500],
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 12,
        gap: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    deauthorizeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    modalContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 24,
        width: '100%',
        maxWidth: 600,
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        flexShrink: 0, // Header no se reduce
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        marginLeft: 12,
        flex: 1,
    },

    modalCloseButton: {
        padding: 4,
    },

    // ScrollView del modal
    modalScrollView: {
        flex: 1, // Toma todo el espacio disponible entre header y footer
    },

    modalScrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },

    // Legacy - mantener para compatibilidad con otros modales
    modalContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },

    modalInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },

    modalInfoText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    modalInfoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 4,
    },

    modalInfoValue: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },

    modalFormGroup: {
        marginBottom: 20,
    },

    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 8,
    },

    modalInput: {
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },

    modalInputReadonly: {
        backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100],
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[300],
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
    },

    modalTextArea: {
        height: 80,
        textAlignVertical: 'top',
    },

    modalHint: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 6,
        fontStyle: 'italic',
    },

    modalWarning: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: isDarkMode ? colors.warning[900] + '40' : '#FEF3C7',
        borderLeftWidth: 4,
        borderLeftColor: isDarkMode ? colors.warning[400] : colors.warning[500],
        padding: 12,
        borderRadius: 8,
        gap: 10,
        marginTop: 10,
    },

    modalWarningText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
        color: isDarkMode ? colors.warning[200] : '#92400E',
        lineHeight: 18,
    },

    modalActions: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        flexShrink: 0, // Footer no se reduce, siempre visible
    },

    modalButtonSecondary: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        alignItems: 'center',
        justifyContent: 'center',
    },

    modalButtonSecondaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    modalButtonPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: colors.success[500],
        gap: 8,
    },

    modalButtonDisabled: {
        opacity: 0.6,
    },

    modalButtonPrimaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Available IDs Styles
    availableIdsContainer: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.success[50],
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.success[200],
    },

    availableIdsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },

    availableIdsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: isDarkMode ? colors.success[400] : colors.success[700],
    },

    availableIdsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    availableIdChip: {
        backgroundColor: isDarkMode ? colors.gray[600] : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[500] : colors.gray[300],
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        minWidth: 40,
        alignItems: 'center',
    },

    availableIdChipSelected: {
        backgroundColor: colors.success[500],
        borderColor: colors.success[600],
    },

    availableIdText: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
    },

    availableIdTextSelected: {
        color: '#FFFFFF',
    },

    suggestedIdText: {
        fontSize: 12,
        fontWeight: '600',
        color: isDarkMode ? colors.success[400] : colors.success[600],
        marginTop: 8,
        fontStyle: 'italic',
    },

    // ==================== TR-069 Form Components ====================

    // Sections
    modalSection: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    modalSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: isDarkMode ? colors.gray[600] : colors.gray[300],
    },

    modalSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    // Radio Buttons
    radioGroup: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },

    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        gap: 8,
    },

    radioButtonSelected: {
        borderColor: colors.success[500],
        backgroundColor: isDarkMode ? colors.success[500] + '20' : colors.success[50],
    },

    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[400] : colors.gray[500],
        alignItems: 'center',
        justifyContent: 'center',
    },

    radioCircleSelected: {
        borderColor: colors.success[500],
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.success[500],
    },

    radioLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
    },

    // Dropdown Options
    dropdownContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        overflow: 'hidden',
    },

    // Dropdown Header (collapsed state)
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        marginBottom: 4,
    },

    dropdownHeaderText: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        flex: 1,
    },

    dropdownHeaderTextPlaceholder: {
        color: isDarkMode ? colors.gray[500] : colors.gray[400],
        fontWeight: '400',
    },

    // Dropdown Options Container (expanded state)
    dropdownOptionsContainer: {
        maxHeight: 200,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        marginBottom: 12,
        overflow: 'hidden',
    },

    dropdownScrollView: {
        maxHeight: 200,
    },

    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    dropdownOptionSelected: {
        backgroundColor: isDarkMode ? colors.success[500] + '20' : colors.success[50],
    },

    dropdownOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
    },

    dropdownOptionTextSelected: {
        color: colors.success[600],
        fontWeight: '600',
    },

    // Speed Chips
    speedGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    speedChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        minWidth: 70,
        alignItems: 'center',
    },

    speedChipSelected: {
        borderColor: colors.success[500],
        backgroundColor: colors.success[500],
    },

    speedChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
    },

    speedChipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    speedChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    // GPS Button
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[500],
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 12,
        gap: 8,
    },

    gpsButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    // Switch Row
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },

    // Read-only Input
    modalInputReadonly: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
    },

    // ==================== TR-069 Action Buttons ====================
    tr069ActionButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    tr069ActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8B5CF6',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },

    tr069ActionButtonLive: {
        backgroundColor: '#EF4444',
    },

    tr069ActionButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },

    // ==================== SW Info Modal ====================
    swInfoSection: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#8B5CF6',
    },

    swInfoSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 12,
    },

    // ==================== Action Buttons ====================
    actionButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 20,
        marginBottom: 16,
        paddingHorizontal: 4,
    },

    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.warning[600],
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 120,
        flexGrow: 1,
        flexBasis: 0,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    actionButtonDelete: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.error[500],
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 120,
        flexGrow: 1,
        flexBasis: 0,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },

    actionButtonDisabled: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[300],
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 120,
        flexGrow: 1,
        flexBasis: 0,
        opacity: 0.6,
    },

    actionButtonTextDisabled: {
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        fontSize: 13,
        fontWeight: '600',
    },

    // ==================== Deauthorizing Modal ====================
    deauthorizingContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        minWidth: 300,
        maxWidth: '80%',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    deauthorizingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },

    deauthorizingMessage: {
        fontSize: 15,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 22,
    },

    deauthorizingSubtext: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        textAlign: 'center',
        fontStyle: 'italic',
    },

    // ==================== Diagnostic Section ====================
    diagnosticSection: {
        marginTop: 20,
        marginBottom: 16,
        paddingHorizontal: 4,
    },

    diagnosticTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 12,
        paddingLeft: 4,
    },

    diagnosticButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    diagnosticButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        minWidth: 110,
        flexGrow: 1,
        flexBasis: 0,
        borderWidth: 1,
        borderColor: '#3B82F6',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },

    diagnosticButtonText: {
        color: '#3B82F6',
        fontSize: 12,
        fontWeight: '600',
    },

    diagnosticButtonLive: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10B981',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        minWidth: 110,
        flexGrow: 1,
        flexBasis: 0,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    diagnosticButtonLiveText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
});
