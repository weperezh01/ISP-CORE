import React from 'react';
import { View, Text } from 'react-native';

const SectionCard = ({ title, icon, children, styles, collapsible = false }) => {
    return (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{icon} {title}</Text>
            </View>
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );
};

export default SectionCard;