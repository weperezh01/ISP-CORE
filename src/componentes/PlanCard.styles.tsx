import { StyleSheet } from 'react-native';

export const createStyles = (isDarkMode: boolean) => StyleSheet.create({
    planCard: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? '#374151' : '#E5E7EB',
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    recommendedCard: {
        borderColor: '#F59E0B',
        borderWidth: 2,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    planTitleContainer: {
        flex: 1,
    },
    planName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        color: isDarkMode ? '#F9FAFB' : '#1F2937',
    },
    recommendedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#F59E0B',
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    planActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planDetails: {
        gap: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    planPrice: {
        fontSize: 28,
        fontWeight: '700',
        color: isDarkMode ? '#60A5FA' : '#3B82F6',
    },
    priceLabel: {
        fontSize: 16,
        marginLeft: 4,
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    planInfo: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '500',
        color: isDarkMode ? '#D1D5DB' : '#374151',
    },
    featuresContainer: {
        gap: 6,
    },
    featuresTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: isDarkMode ? '#D1D5DB' : '#374151',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        fontSize: 13,
        flex: 1,
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    moreFeatures: {
        fontSize: 13,
        fontStyle: 'italic',
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
});
