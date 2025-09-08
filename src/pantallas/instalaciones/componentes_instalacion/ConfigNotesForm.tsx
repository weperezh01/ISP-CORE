import React from 'react';
import { View, Text, TextInput } from 'react-native';

const ConfigNotesForm = ({ form, handleChange }) => {
    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>Notas de configuración:</Text>
            <TextInput
                style={styles.input}
                value={form.notas_config}
                onChangeText={(value) => handleChange('notas_config', value)}
                placeholder="Añade notas relevantes"
                placeholderTextColor={isDarkMode ? '#aaa' : '#555'}
                multiline
            />
        </View>
    );
};

export default ConfigNotesForm;
