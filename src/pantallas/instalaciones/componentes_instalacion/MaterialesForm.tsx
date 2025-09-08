import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Card } from 'react-native-paper';
import { useTheme } from '../../../../ThemeContext';
import { getStyles } from '../../../estilos/styles';

const MaterialesForm = ({ form, handleChange, isViewOnly = false }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);
    
    // Debug: Ver qué datos están llegando al componente
    console.log('🧱 MaterialesForm - Props recibidos:');
    console.log('- isViewOnly:', isViewOnly);
    console.log('- form.pies_utp_cat5:', form.pies_utp_cat5);
    console.log('- form.bridas:', form.bridas);
    console.log('- form.notas_instalacion:', form.notas_instalacion);

    const renderInput = (label, fieldName, placeholder, keyboardType = 'default', multiline = false) => (
        <>
            <Text style={styles.label}>{label}:</Text>
            <TextInput
                style={[styles.input, isViewOnly && { backgroundColor: isDarkMode ? '#2D2D2D' : '#F5F5F5', color: isDarkMode ? '#888' : '#666' }]}
                placeholder={placeholder}
                value={form[fieldName]}
                onChangeText={isViewOnly ? undefined : (value) => handleChange(fieldName, value)}
                keyboardType={keyboardType}
                placeholderTextColor={isDarkMode ? '#ccc' : '#333'}
                editable={!isViewOnly}
                multiline={multiline}
            />
        </>
    );

    return (
        <Card style={styles.card}>
            <Card.Title title="Materiales" />
            <Card.Content>
                {renderInput("Pies de cable UTP Cat5", "pies_utp_cat5", "Cantidad en pies", "numeric")}
                {renderInput("Pies de cable UTP Cat6", "pies_utp_cat6", "Cantidad en pies", "numeric")}
                {renderInput("Pies de drop fibra", "pies_drop_fibra", "Cantidad en pies", "numeric")}
                {renderInput("Conectores mecánicos de fibra", "conector_mecanico_fibra", "Cantidad de conectores", "numeric")}
                {renderInput("Conectores RJ45", "conector_rj45", "Cantidad de conectores", "numeric")}
                {renderInput("Pinzas de anclaje", "pinzas_anclaje", "Cantidad de pinzas", "numeric")}
                {renderInput("Bridas", "bridas", "Cantidad de bridas", "numeric")}
                {renderInput("Grapas", "grapas", "Cantidad de grapas", "numeric")}
                {renderInput("Velas de silicon", "velas_silicon", "Cantidad de velas", "numeric")}
                {renderInput("Pies de tubo", "pies_tubo", "Cantidad en pies de tubo", "numeric")}
                {renderInput("Rollos de cable dulce", "rollos_cable_dulce", "Cantidad de rollos", "numeric")}
                {renderInput("Clavos", "clavos", "Cantidad de clavos", "numeric")}
                {renderInput("Tornillos", "tornillos", "Cantidad de tornillos", "numeric")}
                {renderInput("Abrazaderas", "abrazaderas", "Cantidad de abrazaderas", "numeric")}
                {renderInput("Notas adicionales de la instalación", "notas_instalacion", "Detalles adicionales sobre la instalación", "default", true)}
            </Card.Content>
        </Card>
    );
};

export default MaterialesForm;
