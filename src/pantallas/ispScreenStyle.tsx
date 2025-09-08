import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Modern color palette - consistent with ConexionDetalles
const colors = {
    // Primary Blues - Corporate & Professional
    primary: {
        50: '#EFF6FF',
        100: '#DBEAFE', 
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        900: '#1E3A8A'
    },
    // Success Greens
    success: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        500: '#10B981',
        600: '#059669',
        700: '#047857'
    },
    // Warning Orange
    warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        500: '#F59E0B',
        600: '#D97706',
        700: '#B45309'
    },
    // Error Red
    error: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C'
    },
    // Neutral Grays
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

export const getIspListStyles = (isDarkMode) => StyleSheet.create({
    // Main container styles
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },
    
    containerSuperior: {
        paddingHorizontal: width < 400 ? 16 : 20,
        paddingVertical: width < 400 ? 8 : 12,
        paddingTop: width < 400 ? 20 : 24,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[600],
        borderBottomLeftRadius: width < 400 ? 16 : 24,
        borderBottomRightRadius: width < 400 ? 16 : 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.15,
        shadowRadius: 8,
        elevation: 8,
    },

    title: {
        fontSize: width < 400 ? 20 : 24,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: width < 400 ? 4 : 6,
    },

    subtitle: {
        fontSize: width < 400 ? 13 : 15,
        fontWeight: '400',
        color: isDarkMode ? colors.gray[300] : colors.primary[100],
        textAlign: 'center',
        opacity: 0.9,
    },

    // Content area
    contentContainer: {
        flex: 1,
        paddingHorizontal: width < 400 ? 12 : 16,
        paddingTop: width < 400 ? 16 : 24,
    },

    // Loading states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },

    loadingText: {
        fontSize: width < 400 ? 14 : 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 16,
        textAlign: 'center',
        fontWeight: '500',
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },

    emptyTitle: {
        fontSize: width < 400 ? 18 : 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginTop: 16,
        marginBottom: 8,
    },

    emptySubtitle: {
        fontSize: width < 400 ? 14 : 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        lineHeight: width < 400 ? 20 : 24,
        paddingHorizontal: width < 400 ? 20 : 0,
    },

    // ISP Cards
    ispCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: width < 400 ? 12 : 16,
        marginBottom: width < 400 ? 12 : 16,
        marginHorizontal: 2,
        padding: width < 400 ? 16 : 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    ispCardPressed: {
        transform: [{ scale: 0.98 }],
        shadowOpacity: isDarkMode ? 0.5 : 0.15,
        elevation: 8,
    },

    ispCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width < 400 ? 12 : 16,
    },

    ispIconContainer: {
        width: width < 400 ? 40 : 48,
        height: width < 400 ? 40 : 48,
        borderRadius: width < 400 ? 10 : 12,
        backgroundColor: colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width < 400 ? 12 : 16,
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    ispIconText: {
        fontSize: width < 400 ? 16 : 18,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },

    ispNameContainer: {
        flex: 1,
    },

    ispName: {
        fontSize: width < 400 ? 18 : 20,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
        letterSpacing: -0.3,
    },

    ispStatus: {
        fontSize: width < 400 ? 12 : 14,
        fontWeight: '600',
        color: colors.success[600],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // ISP Details
    ispDetailsContainer: {
        marginTop: 8,
    },

    ispDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: width < 400 ? 4 : 6,
    },

    ispDetailIcon: {
        width: width < 400 ? 16 : 20,
        height: width < 400 ? 16 : 20,
        marginRight: width < 400 ? 8 : 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    ispDetailText: {
        fontSize: width < 400 ? 14 : 15,
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        flex: 1,
        fontWeight: '400',
        lineHeight: width < 400 ? 18 : 20,
    },

    ispDetailLabel: {
        fontSize: 13,
        color: isDarkMode ? colors.gray[500] : colors.gray[500],
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },

    // Action buttons on cards
    ispActionContainer: {
        flexDirection: width < 400 ? 'column' : 'row',
        marginTop: width < 400 ? 12 : 16,
        paddingTop: width < 400 ? 12 : 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        gap: width < 400 ? 8 : 12,
    },

    ispActionButton: {
        flex: width < 400 ? 0 : 1,
        paddingVertical: width < 400 ? 10 : 12,
        paddingHorizontal: 16,
        borderRadius: width < 400 ? 8 : 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[600],
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    ispActionButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary[600],
        shadowOpacity: 0,
        elevation: 0,
    },

    ispActionButtonText: {
        fontSize: width < 400 ? 13 : 14,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },

    ispActionButtonSecondaryText: {
        color: colors.primary[600],
    },

    // Grid layout for larger screens
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    gridItem: {
        width: width > 768 ? '48%' : '100%',
    },
});

export const getModalStyles = (isDarkMode) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 20,
    },

    modalContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: width < 400 ? 16 : 20,
        padding: width < 400 ? 20 : 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },

    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },

    modalIconContainer: {
        width: width < 400 ? 48 : 56,
        height: width < 400 ? 48 : 56,
        borderRadius: width < 400 ? 12 : 16,
        backgroundColor: colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: width < 400 ? 12 : 16,
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    modalTitle: {
        fontSize: width < 400 ? 20 : 22,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
        letterSpacing: -0.3,
    },

    modalSubtitle: {
        fontSize: width < 400 ? 14 : 15,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        marginTop: 4,
    },

    // Form styles
    inputContainer: {
        marginBottom: 16,
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 8,
        letterSpacing: 0.2,
    },

    input: {
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: width < 400 ? 10 : 12,
        paddingHorizontal: width < 400 ? 14 : 16,
        paddingVertical: width < 400 ? 12 : 14,
        fontSize: width < 400 ? 15 : 16,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        fontWeight: '500',
        lineHeight: width < 400 ? 18 : 20,
    },

    inputFocused: {
        borderColor: colors.primary[600],
        borderWidth: 2,
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    // Modal buttons
    modalButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },

    modalButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        minHeight: 52,
    },

    modalButtonPrimary: {
        backgroundColor: colors.primary[600],
    },

    modalButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: isDarkMode ? colors.gray[500] : colors.gray[400],
        shadowOpacity: 0,
        elevation: 0,
    },

    modalButtonDanger: {
        backgroundColor: colors.error[600],
        shadowColor: colors.error[600],
    },

    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },

    modalButtonSecondaryText: {
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
    },

    // Additional modal elements
    modalDivider: {
        height: 1,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        marginVertical: 20,
    },

    modalInfoContainer: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.primary[50],
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary[600],
    },

    modalInfoText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        lineHeight: 20,
        fontWeight: '500',
    },
});