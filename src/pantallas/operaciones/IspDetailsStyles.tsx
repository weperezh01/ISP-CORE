import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Modern color palette - consistent with previous screens
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

const getStyles = (isDarkMode) => StyleSheet.create({
    // Main containers
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },

    containerSuperior: {
        paddingHorizontal: width < 400 ? 12 : 20,
        paddingVertical: width < 400 ? 6 : 12,
        paddingTop: width < 400 ? 20 : 28,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[700],
        borderBottomLeftRadius: width < 400 ? 16 : 24,
        borderBottomRightRadius: width < 400 ? 16 : 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDarkMode ? 0.4 : 0.2,
        shadowRadius: 10,
        elevation: 10,
    },

    headerContent: {
        alignItems: 'center',
    },

    ispTitle: {
        fontSize: width < 400 ? 20 : 28,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: width < 400 ? 3 : 6,
        letterSpacing: -0.8,
    },

    ispSubtitle: {
        fontSize: width < 400 ? 12 : 16,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[200] : colors.primary[100],
        textAlign: 'center',
        opacity: 0.95,
    },

    // Content area
    contentContainer: {
        flex: 1,
        paddingHorizontal: width < 400 ? 8 : 12,
        paddingTop: width < 400 ? 8 : 12,
    },

    sectionTitle: {
        fontSize: width < 400 ? 16 : 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: width < 400 ? 8 : 12,
        marginTop: width < 400 ? 4 : 6,
        letterSpacing: -0.3,
    },

    // Stats cards for metrics
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
        gap: 12,
    },

    statsCard: {
        flex: 1,
        minWidth: (width - 56) / 2, // For 2 columns with margins
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        shadowColor: isDarkMode ? '#000000' : colors.gray[300],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.4 : 0.15,
        shadowRadius: 12,
        elevation: 6,
    },

    statsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    statsIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    statsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    statsValue: {
        fontSize: 24,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        marginBottom: 4,
    },

    statsSubtext: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        fontWeight: '500',
    },

    // Alert cards for issues
    alertsContainer: {
        marginBottom: 24,
    },

    alertCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : colors.warning[50],
        borderColor: isDarkMode ? colors.warning[700] : colors.warning[200],
        borderWidth: 1,
        borderRadius: width < 400 ? 10 : 14,
        padding: width < 400 ? 10 : 14,
        marginBottom: width < 400 ? 8 : 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: isDarkMode ? '#000000' : colors.warning[300],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 4,
    },

    alertIconContainer: {
        width: width < 400 ? 30 : 36,
        height: width < 400 ? 30 : 36,
        borderRadius: width < 400 ? 8 : 10,
        backgroundColor: colors.warning[600],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width < 400 ? 8 : 12,
    },

    alertContent: {
        flex: 1,
    },

    alertTitle: {
        fontSize: width < 400 ? 13 : 15,
        fontWeight: '700',
        color: isDarkMode ? colors.warning[100] : colors.warning[800],
        marginBottom: width < 400 ? 2 : 4,
    },

    alertText: {
        fontSize: width < 400 ? 10 : 12,
        color: isDarkMode ? colors.warning[200] : colors.warning[700],
        fontWeight: '500',
    },

    // Blinking text for alerts
    blinkingText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },

    // Function cards grid
    functionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: width < 400 ? 'center' : 'space-between',
        gap: width < 400 ? 6 : 10,
    },

    functionCard: {
        width: width < 400 ? width - 20 : (width - 48) / 2, // Even more width on small screens
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: width < 400 ? 12 : 16,
        padding: width < 400 ? 12 : 16,
        marginBottom: width < 400 ? 8 : 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        shadowColor: isDarkMode ? '#000000' : colors.gray[300],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.4 : 0.15,
        shadowRadius: 12,
        elevation: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: width < 400 ? 110 : 140, // Much more compact
    },

    functionCardPressed: {
        transform: [{ scale: 0.97 }],
        shadowOpacity: isDarkMode ? 0.6 : 0.2,
        elevation: 10,
    },

    functionIconContainer: {
        width: width < 400 ? 36 : 48,
        height: width < 400 ? 36 : 48,
        borderRadius: width < 400 ? 10 : 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: width < 400 ? 6 : 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },

    functionTitle: {
        fontSize: width < 400 ? 12 : 14,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
        lineHeight: width < 400 ? 15 : 18,
        marginBottom: width < 400 ? 2 : 4,
    },

    functionSubtext: {
        fontSize: width < 400 ? 9 : 11,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        lineHeight: width < 400 ? 12 : 14,
        fontWeight: '500',
    },

    // Loading states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },

    loadingText: {
        fontSize: 16,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginTop: 16,
        textAlign: 'center',
        fontWeight: '500',
    },

    // Legacy card styles (maintaining compatibility)
    card: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 2,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 8,
        elevation: 3,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.3,
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        textAlign: 'center',
        marginVertical: 16,
        letterSpacing: -0.3,
    },

    // Background helpers
    flexContainer: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
        paddingHorizontal: 16,
        paddingBottom: 16,
    },

    darkBackground: {
        backgroundColor: colors.gray[900],
    },

    lightBackground: {
        backgroundColor: colors.gray[50],
    },

    // Button layouts (legacy compatibility)
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 10,
        gap: 12,
    },

    button: {
        width: (width - 56) / 2,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 140,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 8,
        elevation: 3,
    },

    buttonContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },

    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 18,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    iconContainer: {
        marginBottom: 8,
    },

    iconStyle: {
        marginBottom: 8,
    },

    extraText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500',
    },

    extraContent: {
        marginTop: 8,
    },

    // Grid layouts
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },

    cardContainer: {
        width: (width - 56) / 2,
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 8,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 140,
    },

    cardContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },

    cardIcon: {
        marginBottom: 12,
    },

    // Error and info states
    errorText: {
        fontSize: 16,
        color: colors.error[600],
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 22,
    },

    infoText: {
        fontSize: 14,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '400',
    },

    // Utility classes
    textCenter: {
        textAlign: 'center',
    },

    marginBottom16: {
        marginBottom: 16,
    },

    marginTop16: {
        marginTop: 16,
    },

    // FlatList specific
    flatListContentContainer: {
        paddingBottom: 100,
    },

    flatListContent: {
        paddingHorizontal: 16,
    },
});

export default getStyles;