import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReportExpensesScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Report Expenses</Text>
            {/* Add your form or functionality here */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default ReportExpensesScreen;
