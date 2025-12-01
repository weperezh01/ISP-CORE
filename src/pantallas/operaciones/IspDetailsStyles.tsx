import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isPortrait = height >= width;
const isSmallPhonePortrait = isPortrait && width < 600;

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
        flexDirection: isSmallPhonePortrait ? 'column' : 'row',
        flexWrap: isSmallPhonePortrait ? 'nowrap' : 'wrap',
        justifyContent: isSmallPhonePortrait ? 'center' : 'space-between',
        alignItems: isSmallPhonePortrait ? 'center' : 'stretch',
        gap: width < 400 ? 6 : 10,
    },

    functionCard: {
        width: isSmallPhonePortrait ? width * 0.9 : (width - 48) / 2,
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
        minHeight: isSmallPhonePortrait ? 110 : 140, // Much more compact
        alignSelf: isSmallPhonePortrait ? 'center' : 'stretch',
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
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconPair: {
        marginHorizontal: 2,
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

    // Enhanced metrics layout for Clientes card
    metricsContainer: {
        width: '100%',
        marginTop: width < 400 ? 6 : 8,
    },
    metricSubtle: {
        textAlign: 'center',
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        fontSize: width < 400 ? 10 : 12,
        fontWeight: '600',
        marginBottom: width < 400 ? 6 : 8,
    },
    metricGroup: {
        gap: width < 400 ? 4 : 6,
        marginBottom: width < 400 ? 6 : 8,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metricLabel: {
        flex: 1,
        marginLeft: 8,
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        fontSize: width < 400 ? 11 : 13,
        fontWeight: '700',
    },
    metricValue: {
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        fontSize: width < 400 ? 12 : 14,
        fontWeight: '800',
    },
    metricValueWarning: {
        color: colors.warning[600],
    },
    metricValueSuccess: {
        color: colors.success[600],
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusDotActive: {
        backgroundColor: colors.success[600],
    },
    statusDotInactive: {
        backgroundColor: colors.gray[500],
    },
    divider: {
        height: 1,
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        marginVertical: width < 400 ? 6 : 8,
        borderRadius: 1,
    },

    // Mini bar chart
    miniBarTrack: {
        height: 8,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        marginBottom: width < 400 ? 8 : 10,
    },
    miniBarSegmentActive: {
        backgroundColor: colors.success[600],
        height: '100%',
    },
    miniBarSegmentInactive: {
        backgroundColor: colors.gray[500],
        height: '100%',
    },
    miniBarSegmentSuspended: {
        backgroundColor: colors.warning[600],
        height: '100%',
    },
    miniBarSegmentInfo: {
        backgroundColor: colors.primary[600],
        height: '100%',
    },
    miniBarSegmentError: {
        backgroundColor: colors.error[600],
        height: '100%',
    },
    statusDotSuspended: {
        backgroundColor: colors.warning[600],
    },
    statusDotInfo: {
        backgroundColor: colors.primary[600],
    },
    statusDotWarning: {
        backgroundColor: colors.warning[600],
    },
    connectionsVisualizer: {
        width: '100%',
        marginTop: width < 400 ? 6 : 10,
        alignSelf: 'stretch',
    },
    connectionGradient: {
        width: '100%',
        borderRadius: width < 400 ? 12 : 16,
        padding: width < 400 ? 12 : 16,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.gray[200],
        alignSelf: 'stretch',
        overflow: 'hidden',
    },
    connectionHeroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: width < 400 ? 8 : 12,
    },
    connectionHeroColumn: {
        flex: 1,
        paddingRight: width < 400 ? 12 : 16,
        minWidth: width < 400 ? '60%' : '65%',
    },
    connectionHeroLabel: {
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        fontSize: width < 400 ? 13 : 15,
        fontWeight: '700',
        textTransform: 'none',
        letterSpacing: -0.2,
        marginBottom: 2,
    },
    connectionHeroValue: {
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        fontSize: width < 400 ? 30 : 34,
        fontWeight: '800',
        marginBottom: 2,
        textAlign: 'left',
        lineHeight: width < 400 ? 34 : 38,
    },
    connectionHeroSubtext: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
        textAlign: 'left',
    },
    connectionHeroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? 'rgba(15,23,42,0.6)' : '#FFFFFFAA',
        paddingVertical: width < 400 ? 8 : 10,
        paddingHorizontal: width < 400 ? 16 : 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#FCD34D',
        alignSelf: 'flex-start',
        minWidth: width < 400 ? 110 : 130,
        maxWidth: '40%',
        justifyContent: 'center',
        flexShrink: 1,
    },
    connectionHeroBadgeIcon: {
        marginRight: 8,
    },
    connectionHeroBadgeText: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: width < 400 ? 11 : 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    connectionHeroBadgeValue: {
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        fontSize: width < 400 ? 18 : 20,
        fontWeight: '800',
        marginTop: -2,
    },
    connectionHeroDivider: {
        width: '100%',
        height: 1,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        marginVertical: width < 400 ? 10 : 12,
    },
    connectionProgressTrack: {
        height: 10,
        borderRadius: 999,
        overflow: 'hidden',
        flexDirection: 'row',
        backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[200],
    },
    connectionProgressSegment: {
        height: '100%',
    },
    connectionSegmentActive: {
        backgroundColor: colors.success[600],
    },
    connectionSegmentSuspended: {
        backgroundColor: colors.warning[600],
    },
    connectionSegmentInactive: {
        backgroundColor: colors.gray[500],
    },
    connectionProgressEmpty: {
        flex: 1,
        opacity: 0.35,
    },
    connectionProgressLabels: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        marginTop: width < 400 ? 10 : 12,
    },
    connectionProgressLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: width < 400 ? 6 : 8,
        paddingHorizontal: width < 400 ? 10 : 14,
        borderRadius: 999,
        backgroundColor: isDarkMode ? 'rgba(15,23,42,0.55)' : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : colors.gray[200],
        flexGrow: 1,
        flexBasis: width < 400 ? '100%' : '48%',
        marginRight: width < 400 ? 0 : 8,
        marginBottom: width < 400 ? 8 : 10,
    },
    connectionProgressLabelLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    connectionProgressLabelRight: {
        alignItems: 'flex-end',
    },
    connectionChipDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    connectionProgressLabelText: {
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        fontSize: width < 400 ? 11 : 12,
        fontWeight: '600',
    },
    connectionProgressLabelValue: {
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '800',
    },
    connectionProgressLabelCount: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: width < 400 ? 11 : 12,
        fontWeight: '600',
        marginTop: 2,
    },

    // Clients summary card
    clientSummaryContainer: {
        width: '100%',
        marginTop: width < 400 ? 6 : 10,
    },
    clientSummaryCard: {
        borderRadius: width < 400 ? 12 : 16,
        padding: width < 400 ? 10 : 14,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.gray[200],
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.4 : 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    clientHeaderCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width < 400 ? 8 : 10,
        gap: 10,
    },
    clientIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    clientTitle: {
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        fontSize: width < 400 ? 17 : 19,
        fontWeight: '800',
    },
    clientSubtitle: {
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
    },
    clientBarTrack: {
        flexDirection: 'row',
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[200],
        marginBottom: width < 400 ? 10 : 12,
    },
    clientBarSegment: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    clientBarSegmentActive: {
        backgroundColor: colors.success[600],
    },
    clientBarSegmentInactive: {
        backgroundColor: colors.gray[500],
    },
    clientBarSegmentText: {
        color: '#FFFFFF',
        fontSize: width < 400 ? 11 : 12,
        fontWeight: '700',
    },
    clientChipsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: width < 400 ? 10 : 12,
    },
    clientChipActive: {
        flex: 1,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    clientChipInactive: {
        flex: 1,
        backgroundColor: isDarkMode ? 'rgba(148, 163, 184, 0.25)' : 'rgba(59, 130, 246, 0.15)',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    clientChipLabel: {
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        fontSize: 11,
        fontWeight: '600',
    },
    clientChipValue: {
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        fontSize: 13,
        fontWeight: '700',
        marginTop: 2,
    },
    clientStatsListCompact: {
        gap: width < 400 ? 5 : 7,
    },
    clientStatsRowCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    clientStatsRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    clientStatsLabel: {
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
    },
    clientStatsValue: {
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        fontSize: width < 400 ? 14 : 16,
        fontWeight: '700',
    },
    clientStatsWarning: {
        color: colors.warning[600],
    },
    clientStatsDividerCompact: {
        height: 1,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.gray[200],
        marginVertical: width < 400 ? 4 : 6,
    },

    configurationCard: {
        width: '100%',
        marginTop: width < 400 ? 8 : 10,
    },
    configurationCardInner: {
        borderRadius: width < 400 ? 12 : 16,
        padding: width < 400 ? 12 : 16,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[300],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.35 : 0.15,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    configurationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: width < 400 ? 8 : 10,
    },
    configurationHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    configurationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: isDarkMode ? 'rgba(15,23,42,0.6)' : '#FFF7ED',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    configurationBadgeText: {
        color: isDarkMode ? '#FCD34D' : '#B45309',
        fontWeight: '700',
        fontSize: 12,
    },
    configurationIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.warning[600],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#B45309',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    configurationTitle: {
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        fontSize: width < 400 ? 17 : 19,
        fontWeight: '800',
    },
    configurationSubtitle: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
    },
    configurationBarTrack: {
        height: 10,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
        marginBottom: width < 400 ? 10 : 12,
    },
    configurationBarFill: {
        height: '100%',
        backgroundColor: colors.success[600],
    },
    configurationMetricsBlock: {
        gap: width < 400 ? 6 : 8,
        marginBottom: width < 400 ? 12 : 14,
    },
    configurationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    configurationRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 1,
    },
    configurationLabel: {
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
        flexShrink: 1,
    },
    configurationValue: {
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        fontSize: width < 400 ? 14 : 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    configurationValueSuccess: {
        color: colors.success[500],
        fontSize: width < 400 ? 14 : 16,
        fontWeight: '800',
    },
    configurationDistribution: {
        flexDirection: width < 400 ? 'column' : 'row',
        alignItems: width < 400 ? 'center' : 'flex-start',
        gap: width < 400 ? 12 : 18,
    },
    configurationDonutWrapper: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    configurationLegend: {
        flex: 1,
        gap: width < 400 ? 6 : 8,
    },
    configurationLegendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    configurationLegendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    configurationLegendLabel: {
        flex: 1,
        marginLeft: 8,
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        fontSize: width < 400 ? 11 : 13,
        fontWeight: '600',
    },
    configurationLegendValue: {
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '700',
    },
    configurationTopList: {
        gap: width < 400 ? 6 : 8,
    },
    configurationRowCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    billingSummaryCard: {
        borderRadius: width < 400 ? 12 : 16,
        padding: width < 400 ? 12 : 16,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.gray[200],
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.35 : 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    billingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width < 400 ? 10 : 12,
        gap: 12,
    },
    billingIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.warning[600],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#B45309',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    billingTitle: {
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        fontSize: width < 400 ? 16 : 18,
        fontWeight: '700',
    },
    billingSubtitle: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
    },
    billingBarTrack: {
        flexDirection: 'row',
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: isDarkMode ? 'rgba(31,41,55,0.7)' : 'rgba(255,255,255,0.35)',
        marginBottom: width < 400 ? 10 : 12,
    },
    billingBarSegmentCollected: {
        backgroundColor: '#14B8A6',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 6,
    },
    billingBarSegmentPending: {
        backgroundColor: '#FBBF24',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 6,
    },
    billingBarText: {
        color: '#FFFFFF',
        fontSize: width < 400 ? 11 : 12,
        fontWeight: '700',
    },
    billingBarTextPending: {
        color: isDarkMode ? '#1F2937' : '#92400E',
        fontSize: width < 400 ? 11 : 12,
        fontWeight: '700',
    },
    billingChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: width < 400 ? 10 : 12,
    },
    billingChipActive: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexGrow: 1,
        minWidth: '30%',
        backgroundColor: 'rgba(16,185,129,0.25)',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    billingChipInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexGrow: 1,
        minWidth: '30%',
        backgroundColor: 'rgba(59,130,246,0.25)',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    billingChipOverdue: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexGrow: 1,
        minWidth: '30%',
        backgroundColor: 'rgba(248,113,113,0.25)',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    billingChipLabel: {
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        fontSize: 11,
        fontWeight: '600',
    },
    billingChipValue: {
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        fontSize: 13,
        fontWeight: '700',
    },
    billingStatsDivider: {
        height: 1,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.gray[200],
        marginVertical: width < 400 ? 10 : 12,
    },
    billingBottomStats: {
        flexDirection: width < 400 ? 'column' : 'row',
        justifyContent: 'space-between',
        gap: width < 400 ? 10 : 12,
    },
    billingBottomStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    billingBottomLabel: {
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
    },
    billingBottomValue: {
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
        fontSize: width < 400 ? 14 : 16,
        fontWeight: '700',
    },
    billingBottomWarning: {
        color: colors.warning[600],
    },
    billingDotActive: {
        backgroundColor: colors.success[600],
    },
    billingDotInfo: {
        backgroundColor: colors.primary[600],
    },
    billingDotOverdue: {
        backgroundColor: colors.error[600],
    },

    // SMS summary card
    smsCard: {
        width: '100%',
        marginTop: width < 400 ? 8 : 12,
    },
    smsCardInner: {
        borderRadius: width < 400 ? 12 : 16,
        padding: width < 400 ? 12 : 16,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(15,118,110,0.2)' : 'rgba(16,185,129,0.25)',
        shadowColor: isDarkMode ? '#000000' : colors.gray[300],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.35 : 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    smsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: width < 400 ? 8 : 10,
    },
    smsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    smsIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.success[600],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#047857',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    smsTitle: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: width < 400 ? 17 : 19,
        fontWeight: '800',
    },
    smsSubtitle: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
    },
    smsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: isDarkMode ? 'rgba(5,150,105,0.35)' : 'rgba(16,185,129,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    smsBadgeText: {
        color: isDarkMode ? '#CCFBF1' : '#065F46',
        fontWeight: '700',
    },
    smsBarTrack: {
        position: 'relative',
        height: 10,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.12)',
        marginBottom: width < 400 ? 10 : 12,
    },
    smsBarFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: '#10B981',
    },
    smsBarLabel: {
        position: 'absolute',
        right: 8,
        top: -2,
        fontSize: 11,
        fontWeight: '700',
        color: isDarkMode ? '#D1FAE5' : '#065F46',
    },
    smsContent: {
        flexDirection: width < 400 ? 'column' : 'row',
        alignItems: width < 400 ? 'center' : 'flex-start',
        gap: width < 400 ? 12 : 18,
    },
    smsKpiWrapper: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: width < 400 ? 'center' : 'flex-start',
        minWidth: width < 400 ? '100%' : 120,
    },
    smsKpiLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: isDarkMode ? '#E5E7EB' : '#475569',
        textAlign: width < 400 ? 'center' : 'left',
    },
    smsKpiValue: {
        fontSize: 20,
        fontWeight: '700',
        color: isDarkMode ? '#6EE7B7' : '#047857',
        marginTop: 2,
        textAlign: width < 400 ? 'center' : 'left',
    },
    smsKpiSub: {
        marginTop: 2,
        fontSize: 11,
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
        textAlign: width < 400 ? 'center' : 'left',
    },
    smsMetricsList: {
        flex: 1,
        alignSelf: 'stretch',
    },
    smsMetricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    smsMetricLabelBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 1,
    },
    smsMetricLabel: {
        color: isDarkMode ? colors.gray[100] : colors.gray[700],
        fontSize: 12,
        fontWeight: '600',
        flexShrink: 1,
    },
    smsMetricValue: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'right',
        marginLeft: 8,
    },
    smsValueSuccess: {
        color: '#10B981',
    },
    smsValue: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
    },
    smsDotBase: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    smsDotSuccess: {
        backgroundColor: '#10B981',
    },
    smsDotInfo: {
        backgroundColor: colors.primary[500],
    },
    smsDotWarning: {
        backgroundColor: colors.warning[500],
    },
    smsDotPrimary: {
        backgroundColor: colors.primary[600],
    },
    smsDotNeutral: {
        backgroundColor: colors.gray[500],
    },

    // Installations summary card
    installationsCard: {
        width: '100%',
        marginTop: width < 400 ? 8 : 12,
    },
    installationsCardInner: {
        borderRadius: width < 400 ? 12 : 16,
        padding: width < 400 ? 12 : 16,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(14,165,233,0.2)' : 'rgba(14,165,233,0.35)',
        shadowColor: isDarkMode ? '#000000' : colors.gray[300],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.35 : 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    installationsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: width < 400 ? 8 : 10,
    },
    installationsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    installationsIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0284C7',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#075985',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    installationsTitle: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: width < 400 ? 17 : 19,
        fontWeight: '800',
    },
    installationsSubtitle: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
    },
    installationsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: isDarkMode ? 'rgba(14,165,233,0.35)' : 'rgba(14,165,233,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    installationsBadgeText: {
        color: isDarkMode ? '#E0F2FE' : '#0F172A',
        fontWeight: '700',
    },
    installationsStatsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 10,
    },
    installationsStatBlock: {
        flex: 1,
        backgroundColor: isDarkMode ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.65)',
        borderRadius: 12,
        padding: 10,
    },
    installationsStatLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    installationsDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    installationsStatLabel: {
        color: isDarkMode ? colors.gray[100] : colors.gray[600],
        fontSize: 12,
        fontWeight: '600',
    },
    installationsStatValue: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: width < 400 ? 16 : 18,
        fontWeight: '800',
        marginTop: 4,
    },
    installationsStatSub: {
        marginTop: 2,
        fontSize: 11,
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
    },

    // Services summary card
    servicesCard: {
        width: '100%',
        marginTop: width < 400 ? 8 : 12,
    },
    servicesCardInner: {
        borderRadius: width < 400 ? 12 : 16,
        padding: width < 400 ? 12 : 16,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.35)',
        shadowColor: isDarkMode ? '#000000' : colors.gray[300],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.35 : 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    servicesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: width < 400 ? 8 : 10,
    },
    servicesHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    servicesIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#047857',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#065F46',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    servicesTitle: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: width < 400 ? 17 : 19,
        fontWeight: '800',
    },
    servicesSubtitle: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
    },
    servicesBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: isDarkMode ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    servicesBadgeText: {
        color: isDarkMode ? '#BBF7D0' : '#065F46',
        fontWeight: '700',
    },
    servicesBarTrack: {
        marginBottom: width < 400 ? 12 : 14,
    },
    servicesBarLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    servicesBarLabel: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontWeight: '600',
    },
    servicesBarValue: {
        fontSize: 13,
        fontWeight: '700',
        color: isDarkMode ? '#A7F3D0' : '#15803D',
    },
    servicesBarFill: {
        height: 10,
        borderRadius: 999,
        backgroundColor: '#10B981',
    },
    servicesMetricsRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 10,
    },
    servicesMetricBlock: {
        flex: 1,
        backgroundColor: isDarkMode ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.65)',
        borderRadius: 12,
        padding: 10,
    },
    servicesMetricLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    servicesDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    servicesDotInfo: {
        backgroundColor: '#3B82F6',
    },
    servicesDotSuccess: {
        backgroundColor: '#10B981',
    },
    servicesMetricLabel: {
        color: isDarkMode ? colors.gray[100] : colors.gray[600],
        fontSize: 12,
        fontWeight: '600',
    },
    servicesMetricValue: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: width < 400 ? 16 : 18,
        fontWeight: '800',
        marginTop: 4,
    },
    servicesValueSuccess: {
        color: '#10B981',
    },
    servicesArpuRow: {
        marginTop: width < 400 ? 10 : 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    servicesArpuLabel: {
        color: isDarkMode ? colors.gray[200] : colors.gray[600],
        fontSize: 12,
        fontWeight: '600',
    },
    servicesArpuValue: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: 13,
        fontWeight: '700',
    },
    servicesDivider: {
        height: 1,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.gray[200],
        marginVertical: width < 400 ? 12 : 14,
    },
    servicesPopularContainer: {
        gap: 8,
    },
    servicesPopularHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    servicesPopularTitle: {
        color: isDarkMode ? colors.gray[50] : colors.gray[800],
        fontSize: 13,
        fontWeight: '700',
    },
    servicesPopularContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    servicesPopularPlan: {
        color: isDarkMode ? colors.gray[100] : colors.gray[800],
        fontSize: 13,
        fontWeight: '600',
    },
    servicesPopularSubs: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'right',
    },
    servicesPopularPct: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: 11,
        textAlign: 'right',
    },
    servicesPopularEmpty: {
        color: isDarkMode ? colors.gray[400] : colors.gray[500],
        fontSize: 12,
        fontWeight: '600',
    },

    // Services - Plans list section
    servicesPlansSection: {
        marginTop: 12,
    },
    servicesPlansHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    servicesPlansTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
    },
    servicesPlansSubtitle: {
        fontSize: 11,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
    },
    servicesPlanRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    servicesPlanLeft: {
        flex: 1.2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    servicesPlanBullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: isDarkMode ? '#34D399' : '#10B981',
        marginRight: 6,
    },
    servicesPlanName: {
        fontSize: 12,
        color: isDarkMode ? colors.gray[50] : colors.gray[800],
        flex: 1,
    },
    servicesPlanCenter: {
        flex: 0.75,
        alignItems: 'flex-end',
        marginRight: 8,
    },
    servicesPlanPrice: {
        fontSize: 11,
        fontWeight: '500',
        color: isDarkMode ? '#6EE7B7' : '#047857',
    },
    servicesPlanRight: {
        flex: 1.1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    servicesPlanSubs: {
        fontSize: 11,
        color: isDarkMode ? colors.gray[200] : colors.gray[800],
        fontWeight: '500',
    },
    servicesPlanPct: {
        fontSize: 10,
        color: isDarkMode ? colors.gray[400] : colors.gray[600],
        marginLeft: 4,
    },

    // Users summary card
    usersCard: {
        width: '100%',
        marginTop: width < 400 ? 8 : 12,
    },
    usersCardInner: {
        borderRadius: width < 400 ? 12 : 16,
        padding: width < 400 ? 12 : 16,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(79,70,229,0.25)' : 'rgba(99,102,241,0.35)',
        shadowColor: isDarkMode ? '#000000' : colors.gray[300],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.35 : 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    usersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: width < 400 ? 8 : 10,
    },
    usersHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    usersIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4338CA',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#312E81',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    usersTitle: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: width < 400 ? 17 : 19,
        fontWeight: '800',
    },
    usersSubtitle: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
    },
    usersBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: isDarkMode ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    usersBadgeText: {
        color: isDarkMode ? '#CBD5F5' : '#1E3A8A',
        fontWeight: '700',
    },
    usersBarTrack: {
        position: 'relative',
        height: 10,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.12)',
        marginBottom: width < 400 ? 12 : 14,
    },
    usersBarFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: '#22C55E',
    },
    usersBarLabel: {
        position: 'absolute',
        right: 8,
        top: -2,
        fontSize: 11,
        fontWeight: '700',
        color: isDarkMode ? '#BBF7D0' : '#14532D',
    },
    usersBottomRow: {
        flexDirection: width < 400 ? 'column' : 'row',
        alignItems: width < 400 ? 'center' : 'flex-start',
        gap: width < 400 ? 12 : 18,
    },
    usersKpiWrapper: {
        paddingVertical: 10,
        paddingHorizontal: 6,
        alignItems: width < 400 ? 'center' : 'flex-start',
        minWidth: width < 400 ? '100%' : 140,
    },
    usersKpiLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: isDarkMode ? '#E0E7FF' : '#4338CA',
    },
    usersKpiValue: {
        fontSize: 20,
        fontWeight: '800',
        color: isDarkMode ? '#A5B4FC' : '#1E1B4B',
        marginTop: 2,
    },
    usersKpiSub: {
        fontSize: 11,
        color: isDarkMode ? '#94A3B8' : '#6B7280',
        marginTop: 2,
        textAlign: width < 400 ? 'center' : 'left',
    },
    usersMetricsList: {
        flex: 1,
        alignSelf: 'stretch',
    },
    usersMetricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    usersMetricLabelBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 1,
    },
    usersMetricLabel: {
        color: isDarkMode ? colors.gray[100] : colors.gray[700],
        fontSize: 12,
        fontWeight: '600',
        flexShrink: 1,
    },
    usersMetricValue: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'right',
        marginLeft: 8,
    },
    usersValueSuccess: {
        color: '#22C55E',
    },
    usersValueWarning: {
        color: colors.warning[600],
    },
    usersDivider: {
        height: 1,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.gray[200],
        marginVertical: width < 400 ? 8 : 10,
    },
    usersDotBase: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    usersDotActive: {
        backgroundColor: '#22C55E',
    },
    usersDotInactive: {
        backgroundColor: colors.gray[500],
    },

    // Service orders summary card
    ordersCard: {
        width: '100%',
        marginTop: width < 400 ? 8 : 12,
    },
    ordersCardInner: {
        borderRadius: width < 400 ? 12 : 16,
        padding: width < 400 ? 12 : 16,
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(76,29,149,0.25)' : 'rgba(99,102,241,0.25)',
        shadowColor: isDarkMode ? '#000000' : colors.gray[300],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.35 : 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    ordersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: width < 400 ? 8 : 10,
    },
    ordersHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    ordersIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#7C3AED',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    ordersTitle: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: width < 400 ? 17 : 19,
        fontWeight: '800',
    },
    ordersSubtitle: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontSize: width < 400 ? 12 : 13,
        fontWeight: '600',
    },
    ordersBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: isDarkMode ? 'rgba(91,33,182,0.4)' : 'rgba(99,102,241,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    ordersBadgeText: {
        color: isDarkMode ? '#DDD6FE' : '#4C1D95',
        fontWeight: '700',
    },
    ordersBarTrack: {
        position: 'relative',
        height: 10,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.12)',
        marginBottom: width < 400 ? 12 : 14,
    },
    ordersBarFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: '#22C55E',
    },
    ordersBarLabel: {
        position: 'absolute',
        right: 8,
        top: -2,
        fontSize: 11,
        fontWeight: '700',
        color: isDarkMode ? '#BBF7D0' : '#166534',
    },
    ordersBottomRow: {
        flexDirection: width < 400 ? 'column' : 'row',
        alignItems: width < 400 ? 'center' : 'flex-start',
        gap: width < 400 ? 14 : 20,
    },
    ordersDonutWrapper: {
        width: 110,
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    ordersDonutCenter: {
        position: 'absolute',
        alignItems: 'center',
    },
    ordersDonutLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: isDarkMode ? '#E0E7FF' : '#4C1D95',
    },
    ordersDonutValue: {
        fontSize: 16,
        fontWeight: '800',
        color: isDarkMode ? '#F5F3FF' : '#312E81',
    },
    ordersDonutHint: {
        fontSize: 11,
        color: isDarkMode ? '#C7D2FE' : '#6B7280',
    },
    ordersMetricsList: {
        flex: 1,
        alignSelf: 'stretch',
    },
    ordersMetricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    ordersMetricLabelBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 1,
    },
    ordersMetricLabel: {
        color: isDarkMode ? colors.gray[100] : colors.gray[700],
        fontSize: 12,
        fontWeight: '600',
        flexShrink: 1,
    },
    ordersMetricValue: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'right',
        marginLeft: 8,
    },
    ordersMetricValueWarning: {
        color: colors.warning[600],
        fontSize: 13,
        fontWeight: '700',
    },
    ordersValueSuccess: {
        color: '#22C55E',
    },
    ordersValue: {
        color: isDarkMode ? colors.gray[50] : colors.gray[900],
    },
    ordersDotBase: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    ordersDotSuccess: {
        backgroundColor: '#22C55E',
    },
    ordersDotInfo: {
        backgroundColor: colors.primary[500],
    },
    ordersDotWarning: {
        backgroundColor: colors.warning[500],
    },
    ordersDotNeutral: {
        backgroundColor: colors.gray[500],
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
