import React from 'react';
import { View, Text } from 'react-native';
import ThemeSwitch from '../../../componentes/themeSwitch';

const ModernHeader = ({ title, subtitle, statusInfo, styles }) => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    {subtitle && (
                        <Text style={styles.headerSubtitle}>{subtitle}</Text>
                    )}
                </View>
                <View style={styles.headerActions}>
                    {statusInfo && (
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>{statusInfo}</Text>
                        </View>
                    )}
                    <ThemeSwitch />
                </View>
            </View>
        </View>
    );
};

export default ModernHeader;