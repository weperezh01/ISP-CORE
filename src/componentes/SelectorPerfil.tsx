import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SelectorPerfil = ({ label, placeholder, data, selectedValue, onValueChange, isDarkMode }) => {
    const handlePress = (value) => {
        onValueChange(value);
    };

    const styles = StyleSheet.create({
        container: {
            marginBottom: 4,
        },
        label: {
            fontSize: 14,
            marginBottom: 8,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            fontWeight: '500',
        },
        perfilList: {
            backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            maxHeight: 300,
        },
        perfilScrollView: {
            maxHeight: 300,
        },
        perfilItem: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#4B5563' : '#E5E7EB',
        },
        perfilItemContent: {
            flex: 1,
            marginLeft: 12,
        },
        perfilItemTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            marginBottom: 2,
        },
        perfilItemSubtitle: {
            fontSize: 12,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
        },
        selectedPerfil: {
            backgroundColor: isDarkMode ? '#4B5563' : '#EFF6FF',
        },
        selectedPerfilText: {
            color: isDarkMode ? '#60A5FA' : '#2563EB',
            fontWeight: '600',
        },
        placeholder: {
            fontSize: 15,
            color: isDarkMode ? '#6B7280' : '#9CA3AF',
            textAlign: 'center',
            padding: 20,
            fontStyle: 'italic',
        },
        emptyContainer: {
            alignItems: 'center',
            padding: 20,
        },
        emptyIcon: {
            marginBottom: 8,
        },
        scrollHint: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderBottomWidth: 1,
            gap: 6,
        },
        scrollHintText: {
            fontSize: 12,
            fontWeight: '500',
        },
    });

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            
            <View style={styles.perfilList}>
                {data.length > 0 ? (
                    <>
                        {data.length > 4 && (
                            <View style={[styles.scrollHint, { 
                                backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6',
                                borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB'
                            }]}>
                                <Icon 
                                    name="unfold-more" 
                                    size={16} 
                                    color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                                />
                                <Text style={[styles.scrollHintText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                                    {data.length} perfiles disponibles • Desliza para ver más
                                </Text>
                            </View>
                        )}
                        <ScrollView 
                            style={styles.perfilScrollView}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                        >
                            {data.map((item, index) => {
                                const isSelected = selectedValue === item.value;
                                const isLastItem = index === data.length - 1;
                                
                                return (
                                    <TouchableOpacity
                                        key={item.key || `${item.value}-${index}`}
                                        style={[
                                            styles.perfilItem,
                                            isSelected && styles.selectedPerfil,
                                            isLastItem && { borderBottomWidth: 0 }
                                        ]}
                                        onPress={() => handlePress(item.value)}
                                        activeOpacity={0.7}
                                    >
                                        <Icon 
                                            name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                                            size={20} 
                                            color={isSelected 
                                                ? (isDarkMode ? '#60A5FA' : '#2563EB') 
                                                : (isDarkMode ? '#6B7280' : '#9CA3AF')
                                            }
                                        />
                                        
                                        <View style={styles.perfilItemContent}>
                                            <Text style={[
                                                styles.perfilItemTitle,
                                                isSelected && styles.selectedPerfilText
                                            ]}>
                                                {item.label}
                                            </Text>
                                            <Text style={styles.perfilItemSubtitle}>
                                                Perfil de velocidad PPPoE
                                            </Text>
                                        </View>
                                        
                                        {isSelected && (
                                            <Icon 
                                                name="check" 
                                                size={18} 
                                                color={isDarkMode ? '#60A5FA' : '#2563EB'}
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Icon 
                            name="settings" 
                            size={48} 
                            color={isDarkMode ? '#4B5563' : '#D1D5DB'} 
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.placeholder}>{placeholder}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default SelectorPerfil;
