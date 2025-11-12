import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Modern color palette - consistent with other screens
const colors = {
    primary: {
        50: '#EFF6FF',
        100: '#DBEAFE', 
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        900: '#1E3A8A'
    },
    success: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        500: '#10B981',
        600: '#059669',
        700: '#047857'
    },
    warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        500: '#F59E0B',
        600: '#D97706',
        700: '#B45309'
    },
    error: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C'
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
        paddingVertical: 24,
        paddingTop: 50,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[600],
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.15,
        shadowRadius: 8,
        elevation: 8,
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerLeft: {
        flex: 1,
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: -0.5,
    },

    headerSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[300] : colors.primary[100],
        opacity: 0.9,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    invoiceStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    invoiceStatusText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary[600],
    },

    // Content area
    contentContainer: {
        flex: 1,
        paddingBottom: 20,
    },

    scrollContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    // Printer info section
    printerInfoContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: -20,
        marginBottom: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 8,
        elevation: 6,
    },

    printerText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        fontWeight: '500',
    },

    printerName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.success[600],
    },

    noPrinterText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        fontWeight: '500',
        fontStyle: 'italic',
    },

    // Modern Card Design
    cardStyle: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        marginHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDarkMode ? 0.3 : 0.12,
        shadowRadius: 16,
        elevation: 12,
        overflow: 'hidden',
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: isDarkMode ? colors.gray[750] : colors.gray[50],
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        letterSpacing: -0.3,
    },

    cardIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
    },

    invoiceNumberBadge: {
        backgroundColor: colors.primary[600],
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 80,
        maxWidth: 120,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },

    invoiceNumberText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        flexShrink: 1,
        numberOfLines: 1,
    },

    clientBadge: {
        backgroundColor: colors.success[600],
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 50,
        maxWidth: 80,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.success[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },

    clientBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        flexShrink: 1,
        numberOfLines: 1,
    },

    connectionBadge: {
        backgroundColor: colors.warning[600],
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 60,
        maxWidth: 100,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.warning[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },

    connectionBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        flexShrink: 1,
        numberOfLines: 1,
    },

    notesBadge: {
        backgroundColor: colors.gray[600],
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 40,
        maxWidth: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.gray[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },

    notesBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        flexShrink: 1,
        numberOfLines: 1,
    },

    cardContent: {
        padding: 24,
    },

    // Text styles
    header: {
        fontSize: 22,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 16,
    },

    text: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 12,
        fontWeight: '500',
        lineHeight: 24,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 4,
    },

    value: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 12,
    },

    // Detail rows
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[100],
    },

    detailIcon: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    detailContent: {
        flex: 1,
    },

    clientInfoLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },

    clientAddressBlock: {
        padding: 12,
        borderRadius: 12,
    },

    clientAddressPressable: {
        borderWidth: 1,
        borderColor: isDarkMode ? colors.primary[700] : colors.primary[100],
        backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.06)',
    },

    clientAddressHint: {
        marginTop: 8,
        fontSize: 11,
        fontWeight: '600',
        color: isDarkMode ? colors.primary[100] : colors.primary[600],
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    detailSubList: {
        marginTop: 8,
        gap: 6,
    },

    detailSubItem: {
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    detailSubLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[500] : colors.gray[500],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    detailSubValue: {
        fontSize: 13,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[800],
        marginTop: 2,
    },

    phoneButton: {
        marginTop: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.primary[700] : colors.primary[200],
        backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
    },

    phoneButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? colors.primary[100] : colors.primary[700],
    },

    phoneButtonHint: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: '600',
        color: isDarkMode ? colors.primary[200] : colors.primary[600],
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    // Table styles - Modern design
    tableContainer: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    scrollHint: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
        fontWeight: '500',
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: isDarkMode ? colors.gray[600] : colors.gray[200],
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 2,
        borderBottomColor: isDarkMode ? colors.gray[500] : colors.gray[300],
    },

    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    tableCellHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
    },

    tableCell: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        textAlign: 'center',
    },

    tableCellAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'right',
    },

    // Totals section
    totalsContainer: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },

    totalLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    totalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    finalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        marginTop: 8,
    },

    finalTotalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    finalTotalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary[600],
    },

    // Notes section
    notaContainer: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    notaText: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 8,
        lineHeight: 24,
        fontWeight: '500',
    },

    notaDate: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        fontWeight: '500',
    },

    notaAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 4,
    },

    revisionStatus: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: colors.warning[100],
        color: colors.warning[700],
        alignSelf: 'flex-start',
        marginTop: 8,
        overflow: 'hidden',
    },

    // Action buttons
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        marginVertical: 8,
    },

    editButton: {
        backgroundColor: colors.primary[600],
    },

    printButton: {
        backgroundColor: colors.success[600],
    },

    shareButton: {
        backgroundColor: colors.warning[600],
    },

    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Modal styles
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },

    modalContainer: {
        width: width * 0.9,
        maxHeight: '80%',
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
    },

    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
        marginBottom: 20,
    },

    modalContent: {
        width: '90%',
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
    },

    // Input styles
    input: {
        width: '100%',
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        marginBottom: 16,
        fontWeight: '500',
    },

    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },

    // Checkbox styles
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    checkboxLabel: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        flex: 1,
    },

    // Button containers
    modalButtons: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 24,
    },

    modalButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },

    saveButton: {
        backgroundColor: colors.success[600],
    },

    cancelButton: {
        backgroundColor: colors.error[600],
    },

    closeButton: {
        backgroundColor: colors.gray[600],
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },

    // Printer selection
    printerItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[600] : colors.gray[200],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        marginBottom: 8,
    },

    printerText: {
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    noPrintersText: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        textAlign: 'center',
        marginVertical: 20,
        fontStyle: 'italic',
    },

    // Loading and error states
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },

    errorText: {
        fontSize: 18,
        color: colors.error[500],
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 24,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    loadingText: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginTop: 16,
        fontWeight: '500',
    },

    // Permissions
    permisoErrorText: {
        color: colors.error[500],
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 16,
    },

    // Floating action button
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 100,
        backgroundColor: colors.primary[600],
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 12,
    },

    addButtonText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
    },

    // Content wrapper
    content: {
        flex: 1,
    },

    // Status badges
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },

    statusPaid: {
        backgroundColor: colors.success[100],
        color: colors.success[700],
    },

    statusPending: {
        backgroundColor: colors.warning[100],
        color: colors.warning[700],
    },

    statusOverdue: {
        backgroundColor: colors.error[100],
        color: colors.error[700],
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContent: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxHeight: '80%',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },

    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 20,
        textAlign: 'center',
    },

    textInput: {
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },

    checklistItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        marginBottom: 10,
    },

    checklistLabel: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        fontWeight: '500',
    },

    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },

    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    cancelButton: {
        backgroundColor: colors.error[500],
    },

    acceptButton: {
        backgroundColor: colors.success[600],
    },

    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    addressModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },

    addressModalCard: {
        width: '100%',
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },

    addressModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 6,
    },

    addressModalSubtitle: {
        fontSize: 15,
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        marginBottom: 8,
    },

    addressModalCoords: {
        fontSize: 13,
        fontWeight: '600',
        color: isDarkMode ? colors.primary[100] : colors.primary[600],
        marginBottom: 16,
    },

    addressModalButtons: {
        gap: 12,
        marginBottom: 16,
    },

    addressModalButton: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },

    addressModalPrimary: {
        backgroundColor: colors.primary[600],
    },

    addressModalSecondary: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
    },

    addressModalButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    addressModalSecondaryText: {
        fontSize: 15,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[800],
    },

    addressModalCancel: {
        textAlign: 'center',
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontWeight: '600',
    },

    phoneModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },

    phoneModalCard: {
        width: '100%',
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },

    phoneModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 6,
    },

    phoneModalNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.primary[100] : colors.primary[700],
        marginBottom: 16,
    },

    phoneModalButtons: {
        gap: 12,
        marginBottom: 16,
    },

    phoneModalButton: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },

    phoneModalPrimary: {
        backgroundColor: colors.primary[600],
    },

    phoneModalSecondary: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
    },

    phoneModalButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    phoneModalSecondaryText: {
        fontSize: 15,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[800],
    },

    phoneModalCancel: {
        textAlign: 'center',
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontWeight: '600',
    },
});
