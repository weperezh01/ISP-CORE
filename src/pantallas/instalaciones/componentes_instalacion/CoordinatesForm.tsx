import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Card } from 'react-native-paper';

const CoordinatesForm = ({ form, handleChange }) => {
    return (
        <Card style={styles.card}>
            <Card.Title title="Coordenadas" />
            <Card.Content>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Latitud:</Text>
                    <TextInput
                        style={styles.input}
                        value={form.latitud}
                        onChangeText={(value) => handleChange('latitud', value)}
                        placeholder="Coordenadas de latitud"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                        keyboardType="decimal-pad"
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Longitud:</Text>
                    <TextInput
                        style={styles.input}
                        value={form.longitud}
                        onChangeText={(value) => handleChange('longitud', value)}
                        placeholder="Coordenadas de longitud"
                        placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                        keyboardType="decimal-pad"
                    />
                </View>
            </Card.Content>
        </Card>
    );
};

export default CoordinatesForm;
