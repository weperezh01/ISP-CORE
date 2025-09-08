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

    // Status badges
    statusBadge: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },

    statusBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary[600],
    },

    // Content area
    contentContainer: {
        flex: 1,
    },

    scrollContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },

    // Form sections
    sectionCard: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        shadowColor: isDarkMode ? '#000000' : colors.gray[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },

    sectionHeader: {
        backgroundColor: isDarkMode ? colors.gray[750] : colors.gray[50],
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        letterSpacing: -0.3,
    },

    sectionIcon: {
        fontSize: 20,
    },

    sectionContent: {
        padding: 16,
    },

    // Form groups
    formGroup: {
        marginBottom: 16,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? colors.gray[300] : colors.gray[700],
        marginBottom: 8,
        letterSpacing: 0.2,
    },

    // Input styles
    input: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: isDarkMode ? colors.gray[100] : colors.gray[900],
        minHeight: 48,
    },

    inputFocused: {
        borderColor: colors.primary[500],
        borderWidth: 2,
    },

    inputDisabled: {
        backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100],
        opacity: 0.7,
    },

    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },

    // Dropdown styles
    dropdownContainer: {
        marginBottom: 16,
        zIndex: 1000,
    },

    dropdown: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 12,
        minHeight: 48,
    },

    dropdownList: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[50],
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[300],
        borderRadius: 12,
        marginTop: 4,
    },

    // Button styles
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 20,
    },

    primaryButton: {
        flex: 1,
        backgroundColor: colors.primary[600],
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    secondaryButton: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[600] : colors.gray[400],
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    successButton: {
        flex: 1,
        backgroundColor: colors.success[600],
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    dangerButton: {
        flex: 1,
        backgroundColor: colors.error[600],
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // GPS button styles
    gpsButton: {
        backgroundColor: colors.primary[600],
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        flexDirection: 'row',
        gap: 8,
    },

    gpsButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Coordinates display
    coordinatesContainer: {
        flexDirection: 'row',
        gap: 12,
    },

    coordinateGroup: {
        flex: 1,
    },

    coordinateValue: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        marginTop: 4,
    },

    // Loading states
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

    // Error states
    errorContainer: {
        backgroundColor: colors.error[50],
        borderWidth: 1,
        borderColor: colors.error[200],
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },

    errorText: {
        fontSize: 14,
        color: colors.error[700],
        fontWeight: '500',
    },

    // Info badges
    infoBadge: {
        backgroundColor: colors.primary[50],
        borderWidth: 1,
        borderColor: colors.primary[200],
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },

    infoBadgeText: {
        fontSize: 14,
        color: colors.primary[700],
        fontWeight: '500',
    },

    // Network section
    networkContainer: {
        gap: 12,
    },

    networkItem: {
        backgroundColor: isDarkMode ? colors.gray[700] : colors.gray[100],
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[600] : colors.gray[200],
    },

    networkItemSelected: {
        backgroundColor: isDarkMode ? colors.primary[800] : colors.primary[50],
        borderColor: colors.primary[500],
        borderWidth: 2,
    },

    networkItemText: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? colors.gray[200] : colors.gray[700],
    },

    networkItemTextSelected: {
        color: isDarkMode ? colors.primary[200] : colors.primary[700],
        fontWeight: '600',
    },

    // PPPoE section
    pppoeContainer: {
        backgroundColor: isDarkMode ? colors.warning[900] : colors.warning[50],
        borderWidth: 1,
        borderColor: isDarkMode ? colors.warning[800] : colors.warning[200],
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },

    pppoeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: isDarkMode ? colors.warning[200] : colors.warning[800],
        marginBottom: 12,
    },

    // Limits section
    limitsContainer: {
        flexDirection: 'row',
        gap: 12,
    },

    limitGroup: {
        flex: 1,
    },

    // Status indicators
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },

    statusActive: {
        backgroundColor: colors.success[500],
    },

    statusInactive: {
        backgroundColor: colors.error[500],
    },

    statusPending: {
        backgroundColor: colors.warning[500],
    },

    // Reload button styles
    reloadContainer: {
        marginVertical: 16,
        alignItems: 'center',
    },

    reloadButton: {
        backgroundColor: colors.warning[600],
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.warning[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.warning[500] : colors.warning[700],
    },

    reloadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.3,
    },

    warningMessage: {
        backgroundColor: colors.warning[50],
        borderWidth: 1,
        borderColor: colors.warning[200],
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },

    warningText: {
        fontSize: 14,
        color: colors.warning[800],
        fontWeight: '600',
        textAlign: 'center',
    },
});