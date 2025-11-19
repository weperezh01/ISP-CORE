import { StyleSheet } from 'react-native';

const colors = {
    primary: {
        500: '#3B82F6',
        600: '#2563EB',
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
};

export const getStyles = (isDarkMode: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    // Header
    headerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 40,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[600],
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
        color: isDarkMode ? colors.gray[300] : 'rgba(255, 255, 255, 0.8)',
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

    // Content
    scrollView: {
        flex: 1,
    },

    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Card
    card: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        overflow: 'hidden',
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: isDarkMode ? colors.gray[750] : colors.gray[50],
    },

    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        flex: 1,
    },

    // Section Content
    sectionContent: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    noRecordsText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: 12,
    },

    placeholderText: {
        fontSize: 15,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 8,
    },

    placeholderSubtext: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        fontStyle: 'italic',
    },

    // Data Rows
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    dataRowLast: {
        borderBottomWidth: 0,
    },

    dataLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        flex: 1,
        marginRight: 12,
    },

    dataValue: {
        fontSize: 14,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        flex: 1,
        textAlign: 'right',
    },

    // Editable Input
    editableInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        textAlign: 'right',
    },

    // Radio Buttons
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },

    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
    },

    radioCircleSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3B82F6',
    },

    radioLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
    },

    // Dropdown Small (inline)
    dropdownSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        minWidth: 100,
    },

    dropdownSmallText: {
        fontSize: 14,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    // Pending Provisions
    pendingProvisionsContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },

    pendingProvisionsInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },

    addProvisionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },

    addProvisionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Action Buttons
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primary[600],
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#EF4444',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    removeButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Tables
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderBottomWidth: 2,
        borderBottomColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        paddingVertical: 12,
        paddingHorizontal: 8,
    },

    tableHeaderCell: {
        fontSize: 13,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
        paddingHorizontal: 4,
    },

    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
    },

    tableCell: {
        fontSize: 12,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        textAlign: 'center',
        paddingHorizontal: 4,
    },

    // Graph Placeholder
    graphPlaceholder: {
        marginTop: 16,
        padding: 20,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        alignItems: 'center',
    },

    graphTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 8,
    },

    graphSubtext: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        marginTop: 4,
        fontStyle: 'italic',
    },

    // Section Subtitle
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        marginBottom: 12,
    },

    // Troubleshooting Buttons
    troubleshootingButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },

    troubleshootingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3B82F6',
        minWidth: 140,
        flex: 1,
        flexBasis: '45%',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },

    troubleshootingButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    // Device Logs
    logsContainer: {
        marginTop: 8,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[300],
        padding: 12,
        maxHeight: 400,
    },

    logEntry: {
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[800] : colors.gray[200],
    },

    logText: {
        fontSize: 11,
        fontFamily: 'monospace',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        lineHeight: 16,
    },

    // File & Firmware
    dropdownContainer: {
        marginTop: 12,
        marginBottom: 16,
    },

    dropdownLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        marginBottom: 8,
    },

    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: isDarkMode ? colors.gray[700] : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },

    dropdownText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontStyle: 'italic',
    },

    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10B981',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    downloadButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Loading Container
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },

    loadingText: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginTop: 16,
        textAlign: 'center',
    },

    loadingSubtext: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 8,
        textAlign: 'center',
        fontStyle: 'italic',
    },

    // ACS Warning
    acsWarningContainer: {
        padding: 24,
        backgroundColor: isDarkMode ? colors.gray[800] : '#FEF3C7',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#F59E0B',
        alignItems: 'center',
        marginVertical: 16,
    },

    acsWarningTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? '#FCD34D' : '#92400E',
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
    },

    acsWarningText: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : '#92400E',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 8,
    },

    acsWarningSubtext: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[400] : '#B45309',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 4,
    },
});
