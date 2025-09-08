import React from 'react';
import { View, Text, FlatList } from 'react-native';

const ReporteTable = ({ data, styles }) => (
    <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Columna 1</Text>
            <Text style={styles.tableHeaderCell}>Columna 2</Text>
            <Text style={styles.tableHeaderCell}>Columna 3</Text>
        </View>
        <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
                <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.columna1}</Text>
                    <Text style={styles.tableCell}>{item.columna2}</Text>
                    <Text style={styles.tableCell}>{item.columna3}</Text>
                </View>
            )}
        />
    </View>
);

export default ReporteTable;
