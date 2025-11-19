import { StyleSheet } from 'react-native';

const colors = {
    primary: {
        500: '#3B82F6',
        600: '#2563EB',
    },
    gray: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        600: '#475569',
        800: '#1E293B',
        900: '#0F172A',
    },
    success: {
        500: '#10B981',
    },
    error: {
        500: '#EF4444',
    }
};

export const getStyles = (isDarkMode: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? colors.gray[900] : colors.gray[50],
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 40,
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[600],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
        marginLeft: -30,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
        gap: 8,
    },
    fieldGroup: {
        marginBottom: 12,
    },
    label: {
        color: isDarkMode ? colors.gray[300] : colors.gray[600],
        fontWeight: '600',
        marginBottom: 6,
    },
    input: {
        backgroundColor: isDarkMode ? colors.gray[800] : '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: isDarkMode ? colors.gray[700] : colors.gray[200],
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: isDarkMode ? '#FFFFFF' : colors.gray[900],
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.gray[200],
        backgroundColor: '#FFFFFF',
    },
    chipActive: {
        borderColor: colors.primary[600],
        backgroundColor: isDarkMode ? colors.gray[800] : colors.primary[100],
    },
    chipText: {
        color: colors.gray[600],
        fontWeight: '600',
    },
    chipTextActive: {
        color: colors.primary[600],
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    submitButton: {
        marginTop: 8,
        backgroundColor: colors.success[500],
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
