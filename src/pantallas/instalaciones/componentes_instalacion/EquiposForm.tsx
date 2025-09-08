import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Card } from 'react-native-paper';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from '../../../estilos/styles';

const EquiposForm = ({ form, handleChange, isViewOnly = false }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    
    // Debug: Ver qué datos están llegando al componente
    console.log('🔧 EquiposForm - Props recibidos:');
    console.log('- isViewOnly:', isViewOnly);
    console.log('- form.router_wifi:', form.router_wifi);
    console.log('- form.router_onu:', form.router_onu);
    console.log('- form.radios:', form.radios);

    return (
        <Card style={styles.card}>
            <Card.Title title="Equipos" />
            <Card.Content>
                <Text style={styles.label}>Router WiFi:</Text>
                <TextInput
                    style={[styles.input, isViewOnly && { backgroundColor: isDarkMode ? '#2D2D2D' : '#F5F5F5', color: isDarkMode ? '#888' : '#666' }]}
                    placeholder="Modelo de router WiFi"
                    value={form.router_wifi}
                    onChangeText={isViewOnly ? undefined : (value) => handleChange('router_wifi', value)}
                    placeholderTextColor={isDarkMode ? '#ccc' : '#333'}
                    editable={!isViewOnly}
                />
                <Text style={styles.label}>Router ONU:</Text>
                <TextInput
                    style={[styles.input, isViewOnly && { backgroundColor: isDarkMode ? '#2D2D2D' : '#F5F5F5', color: isDarkMode ? '#888' : '#666' }]}
                    placeholder="Modelo de router ONU"
                    value={form.router_onu}
                    onChangeText={isViewOnly ? undefined : (value) => handleChange('router_onu', value)}
                    placeholderTextColor={isDarkMode ? '#ccc' : '#333'}
                    editable={!isViewOnly}
                />
                <Text style={styles.label}>Serial ONU:</Text>
                <TextInput
                    style={[styles.input, isViewOnly && { backgroundColor: isDarkMode ? '#2D2D2D' : '#F5F5F5', color: isDarkMode ? '#888' : '#666' }]}
                    placeholder="Serial del ONU"
                    value={form.serial_onu}
                    onChangeText={isViewOnly ? undefined : (value) => handleChange('serial_onu', value)}
                    placeholderTextColor={isDarkMode ? '#ccc' : '#333'}
                    editable={!isViewOnly}
                />
                <Text style={styles.label}>Radios:</Text>
                <TextInput
                    style={[styles.input, isViewOnly && { backgroundColor: isDarkMode ? '#2D2D2D' : '#F5F5F5', color: isDarkMode ? '#888' : '#666' }]}
                    placeholder="Cantidad de radios"
                    value={form.radios}
                    onChangeText={isViewOnly ? undefined : (value) => handleChange('radios', value)}
                    keyboardType="numeric"
                    placeholderTextColor={isDarkMode ? '#ccc' : '#333'}
                    editable={!isViewOnly}
                />
            </Card.Content>
        </Card>
    );
};

export default EquiposForm;
