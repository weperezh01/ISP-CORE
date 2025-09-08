import React from 'react';
import { View, StyleSheet } from 'react-native';

const ProgressBar = ({ progress, styles }) => (
    <View style={[styles.progressBarContainer, styles]}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
);

const defaultStyles = StyleSheet.create({
    progressBarContainer: {
        height: 10,
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#76c7c0',
    },
});

ProgressBar.defaultProps = {
    styles: defaultStyles,
};

export default ProgressBar;
