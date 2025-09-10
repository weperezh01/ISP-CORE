import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
const isTablet = width >= 768;
const isLargeTablet = width >= 1024;
const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveHeight = (percentage) => height * (percentage / 100);

// Dynamic spacing based on screen size
const spacing = {
  xs: isTablet ? 6 : 4,
  sm: isTablet ? 10 : 8,
  md: isTablet ? 16 : 12,
  lg: isTablet ? 24 : 16,
  xl: isTablet ? 32 : 20,
  xxl: isTablet ? 48 : 24,
};

// Dynamic font sizes
const typography = {
  xs: isTablet ? 14 : 12,
  sm: isTablet ? 16 : 14,
  md: isTablet ? 20 : 16,
  lg: isTablet ? 24 : 18,
  xl: isTablet ? 32 : 24,
  xxl: isTablet ? 40 : 28,
};

// Modern color palette
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

    scrollContent: {
        paddingTop: 16,
        paddingBottom: 20,
    },

    // Header styles
    headerContainer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        paddingTop: spacing.lg,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[600],
        borderBottomLeftRadius: spacing.lg,
        borderBottomRightRadius: spacing.lg,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.15,
        shadowRadius: 8,
        elevation: 8,
        justifyContent: 'center',
        ...(isTablet && {
            paddingHorizontal: responsiveWidth(5),
            maxWidth: isLargeTablet ? 1200 : '100%',
            alignSelf: 'center',
            width: '100%',
        }),
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
        fontSize: typography.lg,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: -0.3,
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

    // Client info section
    clientInfoContainer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        marginHorizontal: 16,
        marginTop: -40,
        marginBottom: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDarkMode ? 0.3 : 0.15,
        shadowRadius: 16,
        elevation: 12,
    },

    clientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },

    clientAvatar: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    clientAvatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    clientHeaderInfo: {
        flex: 1,
    },

    clientName: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
        letterSpacing: -0.3,
    },

    clientId: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginBottom: 8,
    },

    clientInfoText: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 4,
        fontWeight: '500',
    },

    // Contact actions
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        gap: 12,
    },

    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },

    iconCall: {
        backgroundColor: colors.success[500],
    },

    iconSMS: {
        backgroundColor: colors.warning[500],
    },

    iconWhatsApp: {
        backgroundColor: '#25D366',
    },

    icon: {
        fontSize: 24,
    },

    toggleButton: {
        backgroundColor: colors.primary[600],
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 16,
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    // Filter section
    filterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },

    filterButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
    },

    selectedButton: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
    },

    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        textAlign: 'center',
    },

    selectedButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    // Invoice cards - Responsive layout for tablets
    facturaCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: spacing.lg,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 6,
        ...(isTablet && {
            marginHorizontal: responsiveWidth(2),
            maxWidth: isLargeTablet ? 1200 : '96%',
            alignSelf: 'center',
            paddingHorizontal: spacing.xxl,
        }),
    },

    selectedFacturaCard: {
        borderColor: colors.success[500],
        borderWidth: 2,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.success[50],
    },

    facturaRow: {
        flexDirection: isTablet ? 'row' : 'column',
        gap: spacing.lg,
        ...(isTablet && {
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        }),
    },

    facturaDataColumn: {
        flex: 2,
    },

    facturaButtonColumn: {
        flex: isTablet ? 1 : 'none',
        gap: spacing.sm,
        ...(isTablet ? {
            minWidth: 200,
            maxWidth: 250,
        } : {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        }),
    },

    facturaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    facturaNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    facturaStatus: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        overflow: 'hidden',
    },

    statusPagado: {
        backgroundColor: colors.success[100],
        color: colors.success[700],
    },

    statusPendiente: {
        backgroundColor: colors.warning[100],
        color: colors.warning[700],
    },

    statusVencido: {
        backgroundColor: colors.error[100],
        color: colors.error[700],
    },

    facturaText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 8,
        fontWeight: '500',
        lineHeight: 20,
    },

    facturaAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 8,
    },

    pagoATiempo: {
        color: colors.success[600],
        fontWeight: '700',
        backgroundColor: isDarkMode ? colors.success[900] : colors.success[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: 'hidden',
    },

    pagoConTardanza: {
        color: colors.error[600],
        fontWeight: '700',
        backgroundColor: isDarkMode ? colors.error[900] : colors.error[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: 'hidden',
    },

    // Action buttons - Responsive sizing
    button: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        minHeight: isTablet ? 48 : 44,
        ...(isTablet ? {
            minWidth: 120,
        } : {
            flex: 1,
            marginHorizontal: 2,
            maxWidth: width * 0.28,
        }),
    },

    cobrarButton: {
        backgroundColor: colors.success[500],
    },

    selectedCobrarButton: {
        backgroundColor: colors.success[600],
    },

    notaButton: {
        backgroundColor: colors.warning[500],
    },

    partialPaymentButton: {
        backgroundColor: colors.primary[500],
    },

    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    selectedButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    // Partial payment input
    partialPaymentInput: {
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        fontWeight: '600',
        marginTop: 8,
    },

    disabledInput: {
        opacity: 0.5,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100],
    },

    // Notes section
    notasContainer: {
        marginTop: 16,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    notasTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 12,
    },

    notaText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 8,
        lineHeight: 20,
        fontWeight: '500',
    },

    // Footer/Payment section
    footer: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },

    footerHighlight: {
        backgroundColor: isDarkMode ? colors.primary[900] : colors.primary[50],
        borderTopColor: colors.primary[200],
    },

    footerText: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
        marginBottom: 8,
    },

    footerSubText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        fontWeight: '500',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContent: {
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

    textInput: {
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        textAlignVertical: 'top',
        minHeight: 120,
        marginBottom: 20,
        fontWeight: '500',
    },

    // Checklist
    checklistItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    checklistLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        flex: 1,
    },

    // Modal buttons
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

    cancelButton: {
        backgroundColor: colors.error[500],
    },

    acceptButton: {
        backgroundColor: colors.success[500],
    },

    modalButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // User info (if needed)
    userButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
    },

    userButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
    },

    // Content container
    contentContainer: {
        flex: 1,
        paddingBottom: 20,
    },

    // Payment methods modal styles
    paymentModalContent: {
        width: isTablet ? responsiveWidth(60) : width * 0.95,
        maxWidth: 500,
        maxHeight: isTablet ? '70%' : '80%',
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: spacing.xl,
        padding: spacing.xl,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
    },

    paymentModalTitle: {
        fontSize: typography.lg,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
        marginBottom: spacing.xl,
    },

    paymentMethodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderRadius: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },

    paymentMethodSelected: {
        borderColor: colors.primary[600],
        backgroundColor: isDarkMode ? colors.primary[900] : colors.primary[50],
    },

    paymentMethodIcon: {
        fontSize: typography.xl,
        marginRight: spacing.md,
        width: 40,
        textAlign: 'center',
    },

    paymentMethodInfo: {
        flex: 1,
    },

    paymentMethodName: {
        fontSize: typography.md,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    paymentMethodDescription: {
        fontSize: typography.sm,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
    },

    paymentMethodDemo: {
        backgroundColor: colors.warning[100],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 4,
    },

    paymentMethodDemoText: {
        fontSize: 10,
        color: colors.warning[700],
        fontWeight: '600',
    },

    paymentModalButtons: {
        flexDirection: isTablet ? 'row' : 'column',
        gap: spacing.md,
        marginTop: spacing.xl,
    },

    paymentModalButton: {
        flex: isTablet ? 1 : 'none',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },

    paymentCancelButton: {
        backgroundColor: colors.error[500],
    },

    paymentConfirmButton: {
        backgroundColor: colors.success[500],
    },

    paymentModalButtonText: {
        fontSize: typography.md,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Empty state (if needed)
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },

    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        textAlign: 'center',
        marginBottom: 8,
    },

    emptyMessage: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        textAlign: 'center',
        lineHeight: 24,
    },
});