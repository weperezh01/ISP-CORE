import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../../../ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LimiteVelocidadForm = ({ form, handleChange }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [selectedUnitSubida, setSelectedUnitSubida] = useState(form.unidad_subida);
    const [selectedUnitBajada, setSelectedUnitBajada] = useState(form.unidad_bajada);

    const units = [
        { label: 'Kbps', value: 'Kbps', icon: 'speed' },
        { label: 'Mbps', value: 'Mbps', icon: 'network-check' },
        { label: 'Gbps', value: 'Gbps', icon: 'rocket-launch' },
        { label: 'Tbps', value: 'Tbps', icon: 'flash-on' },
    ];

    const handleUnitChange = (field, value) => {
        if (field === 'unidad_subida') {
            const newValue = selectedUnitSubida === value ? 'Mbps' : value;
            setSelectedUnitSubida(newValue);
            handleChange('unidad_subida', newValue);
        } else {
            const newValue = selectedUnitBajada === value ? 'Mbps' : value;
            setSelectedUnitBajada(newValue);
            handleChange('unidad_bajada', newValue);
        }
    };

    const renderLimiteVelocidadItem = (item) => (
        <View key={item.field} style={styles.inputGroup}>
            <View style={styles.speedHeader}>
                <Icon 
                    name={item.field === 'limite_subida' ? 'upload' : 'download'} 
                    size={20} 
                    color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                />
                <Text style={styles.label}>{item.label}</Text>
            </View>
            
            <View style={styles.speedInputContainer}>
                <View style={styles.inputWithIcon}>
                    <Icon 
                        name="speed" 
                        size={20} 
                        color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                    />
                    <TextInput
                        style={styles.modernSpeedInput}
                        value={form[item.field]}
                        onChangeText={(value) => handleChange(item.field, value)}
                        placeholder={item.placeholder}
                        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                        keyboardType="numeric"
                    />
                </View>
                
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.unitsScrollView}
                    contentContainerStyle={styles.unitsContainer}
                >
                    {units.map((unit) => {
                        const isSelected = (item.unitField === 'unidad_subida' && selectedUnitSubida === unit.value) ||
                                         (item.unitField === 'unidad_bajada' && selectedUnitBajada === unit.value);
                        
                        return (
                            <TouchableOpacity
                                key={unit.value}
                                style={[
                                    styles.unitItem,
                                    isSelected && styles.selectedUnitItem
                                ]}
                                onPress={() => handleUnitChange(item.unitField, unit.value)}
                                activeOpacity={0.7}
                            >
                                <Icon 
                                    name={unit.icon} 
                                    size={16} 
                                    color={isSelected 
                                        ? '#FFFFFF' 
                                        : (isDarkMode ? '#9CA3AF' : '#6B7280')
                                    } 
                                />
                                <Text style={[
                                    styles.unitText,
                                    isSelected && styles.selectedUnitText
                                ]}>
                                    {unit.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {[
                {
                    label: 'Límite de Subida',
                    field: 'limite_subida',
                    placeholder: 'Ej: 10',
                    unitField: 'unidad_subida',
                },
                {
                    label: 'Límite de Bajada',
                    field: 'limite_bajada',
                    placeholder: 'Ej: 100',
                    unitField: 'unidad_bajada',
                },
            ].map(renderLimiteVelocidadItem)}
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        gap: 20,
    },
    inputGroup: {
        gap: 12,
    },
    speedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: isDarkMode ? '#F9FAFB' : '#111827',
    },
    speedInputContainer: {
        gap: 12,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
        paddingHorizontal: 12,
        gap: 10,
    },
    modernSpeedInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: isDarkMode ? '#F9FAFB' : '#111827',
    },
    unitsScrollView: {
        flexGrow: 0,
    },
    unitsContainer: {
        gap: 8,
        paddingHorizontal: 4,
    },
    unitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
        gap: 6,
        minWidth: 70,
        justifyContent: 'center',
    },
    selectedUnitItem: {
        backgroundColor: isDarkMode ? '#10B981' : '#059669',
        borderColor: isDarkMode ? '#059669' : '#047857',
    },
    unitText: {
        fontSize: 12,
        fontWeight: '600',
        color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    selectedUnitText: {
        color: '#FFFFFF',
    },
});

export default LimiteVelocidadForm;
