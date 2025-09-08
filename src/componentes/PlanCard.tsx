import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SubscriptionPlan } from '../config/subscriptionPlans';
import { useTheme } from '../../ThemeContext';
import { createStyles } from './PlanCard.styles';

const PlanCard = ({ plan, openEditModal, deletePlan }) => {
    const { isDarkMode } = useTheme();
    const styles = createStyles(isDarkMode);

    return (
        <View style={[styles.planCard, plan.recommended && styles.recommendedCard]}>
            <Text>Test</Text>
        </View>
    );
}

export default PlanCard;